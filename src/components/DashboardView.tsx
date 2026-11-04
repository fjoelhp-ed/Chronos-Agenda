import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Flame,
  Plus,
  Clock,
  Sparkles,
  Repeat,
  Bell,
  Calendar as CalendarIcon,
  Filter,
  Trash2,
  Check,
  TrendingUp,
  Tag,
  ArrowRight,
  Sliders,
  ArrowUpDown,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAgenda } from '../context/AgendaContext';
import { Activity, SortCriterion } from '../types/agenda';
import { formatDateKey, getActivitiesForDate, getRecurrenceDescription } from '../utils/recurrence';
import {
  sortActivities,
  getPriorityBadgeClasses,
  getPriorityBorderHighlight,
  PRIORITY_LABELS,
} from '../utils/priority';

export const DashboardView: React.FC<{
  onOpenNewActivity: (date?: string) => void;
  onNavigateToCalendar: () => void;
  onNavigateToSettings?: () => void;
}> = ({ onOpenNewActivity, onNavigateToCalendar, onNavigateToSettings }) => {
  const {
    activities,
    categories,
    preferences,
    selectedDate,
    setSelectedDate,
    addActivity,
    deleteActivity,
    toggleActivityCompletion,
    filterCategory,
    setFilterCategory,
    filterPriority,
    setFilterPriority,
    searchQuery,
    setSearchQuery,
    toggleDashboardMode,
    updateSort,
    setIsDashboardCustomizerOpen,
  } = useAgenda();

  const [quickTitle, setQuickTitle] = useState('');
  const [quickTime, setQuickTime] = useState('09:00');
  const [quickCategory, setQuickCategory] = useState(categories[0]?.id || 'work');
  const [quickPriority, setQuickPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const todayActivities = useMemo(() => getActivitiesForDate(activities, todayKey), [activities, todayKey]);

  // Statistics
  const completedCount = todayActivities.filter((a) => a.completed).length;
  const totalCount = todayActivities.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Streak calculation
  const currentStreak = 5;

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    setIsSubmitting(true);
    await addActivity({
      title: quickTitle.trim(),
      type: 'task',
      date: todayKey,
      startTime: quickTime || undefined,
      completed: false,
      priority: quickPriority,
      categoryId: quickCategory,
      reminderMinutesBefore: 15,
      recurrence: { frequency: 'none' },
    });
    setQuickTitle('');
    setIsSubmitting(false);
  };

  const handleToggle = async (act: Activity) => {
    await toggleActivityCompletion(act.id);
    if (!act.completed && completedCount + 1 === totalCount) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  };

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Filtered and Sorted list
  const filteredAndSortedTodayActivities = useMemo(() => {
    const filtered = todayActivities.filter((act) => {
      if (filterCategory && act.categoryId !== filterCategory) return false;
      if (filterPriority && act.priority !== filterPriority) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return act.title.toLowerCase().includes(q) || act.description?.toLowerCase().includes(q);
      }
      return true;
    });

    return sortActivities(filtered, preferences.sortBy, preferences.sortAscending);
  }, [
    todayActivities,
    filterCategory,
    filterPriority,
    searchQuery,
    preferences.sortBy,
    preferences.sortAscending,
  ]);

  const isEssential = preferences.dashboardMode === 'essential';
  const showProgress = !isEssential && preferences.visibleCards.progress;
  const showStreak = !isEssential && preferences.visibleCards.streak;
  const showPriorityMatrix = !isEssential && preferences.visibleCards.priorityMatrix;
  const showQuickAdd = preferences.visibleCards.quickAdd;
  const showCategoryChips = !isEssential && preferences.visibleCards.categoryChips;

  return (
    <div className="space-y-5">
      {/* Essential Mode Alert Banner */}
      {isEssential && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Modo Esencial Activo:</strong> Vista simplificada sin gráficos ni imágenes para máxima concentración.
            </span>
          </div>
          <button
            onClick={() => {
              if (onNavigateToSettings) {
                onNavigateToSettings();
              } else {
                setIsDashboardCustomizerOpen(true);
              }
            }}
            className="text-xs font-bold underline hover:opacity-80 shrink-0 ml-2"
          >
            Personalizar
          </button>
        </div>
      )}

      {/* Metric Highlights (Hidden in Essential Mode) */}
      {(showProgress || showStreak || showPriorityMatrix) && (
        <div
          className={`grid gap-3.5 ${
            preferences.deviceShell !== 'responsive'
              ? 'grid-cols-1'
              : 'grid-cols-1 sm:grid-cols-3'
          }`}
        >
          {/* Progress Ring Card */}
          {showProgress && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  Progreso Diario
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {completionPercentage}%
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {completedCount} de {totalCount} actividades listas
                </p>
              </div>

              <div className="relative h-16 w-16 sm:h-18 sm:w-18 shrink-0 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-700 ease-out"
                    strokeDasharray={`${completionPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">
                  {completedCount}/{totalCount}
                </span>
              </div>
            </div>
          )}

          {/* Streak & Consistency Card */}
          {showStreak && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  Racha de Productividad
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Flame className="w-6 h-6 text-amber-500 animate-bounce" />
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {currentStreak} Días
                  </h3>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                  ¡Constancia impecable!
                </p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-lg">
                🔥
              </div>
            </div>
          )}

          {/* Priority Matrix Overview */}
          {showPriorityMatrix && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  Filtro por Prioridad
                </span>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button
                  onClick={() => setFilterPriority(filterPriority === 'high' ? null : 'high')}
                  className={`p-1.5 sm:p-2 rounded-xl text-center border transition ${
                    filterPriority === 'high'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold ring-1 ring-rose-500'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {todayActivities.filter((a) => a.priority === 'high').length}
                  </div>
                  <div className="text-[10px] text-slate-500">Alta</div>
                </button>
                <button
                  onClick={() => setFilterPriority(filterPriority === 'medium' ? null : 'medium')}
                  className={`p-1.5 sm:p-2 rounded-xl text-center border transition ${
                    filterPriority === 'medium'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-amber-500'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {todayActivities.filter((a) => a.priority === 'medium').length}
                  </div>
                  <div className="text-[10px] text-slate-500">Media</div>
                </button>
                <button
                  onClick={() => setFilterPriority(filterPriority === 'low' ? null : 'low')}
                  className={`p-1.5 sm:p-2 rounded-xl text-center border transition ${
                    filterPriority === 'low'
                      ? 'border-slate-400 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold ring-1 ring-slate-400'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {todayActivities.filter((a) => a.priority === 'low').length}
                  </div>
                  <div className="text-[10px] text-slate-500">Baja</div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Capture Input Bar */}
      {showQuickAdd && (
        <form
          onSubmit={handleQuickAdd}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Añadir tarea rápida para hoy (ej. Enviar informe mensual)..."
              className="w-full rounded-xl border-none bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
            <input
              type="time"
              value={quickTime}
              onChange={(e) => setQuickTime(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none shrink-0"
            />

            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value as any)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-2 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none shrink-0"
            >
              <option value="high">🔴 Alta</option>
              <option value="medium">🟡 Media</option>
              <option value="low">⚪ Baja</option>
            </select>

            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              className="flex-1 sm:flex-initial rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-2 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none truncate max-w-[120px]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={!quickTitle.trim() || isSubmitting}
              className="flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 disabled:opacity-40 transition active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir</span>
            </button>
          </div>
        </form>
      )}

      {/* Category Filter Chips Bar (Hidden in Essential Mode) */}
      {showCategoryChips && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterCategory(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
              filterCategory === null
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent font-semibold shadow-xs'
                : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            Todas ({todayActivities.length})
          </button>
          {categories.map((c) => {
            const count = todayActivities.filter((a) => a.categoryId === c.id).length;
            const isSelected = filterCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setFilterCategory(isSelected ? null : c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                  isSelected
                    ? 'border-transparent text-white font-semibold shadow-xs'
                    : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
                style={{
                  backgroundColor: isSelected ? c.color : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? '#ffffff' : c.color }}
                />
                <span>{c.name}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Today's Schedule List */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Agenda de Hoy</span>
              <span className="text-xs font-normal text-slate-400">
                ({new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })})
              </span>
            </h3>
          </div>

          {/* Controls: Sorting, Filter Active Badge, Customizer Button */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort Dropdown Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={preferences.sortBy}
                onChange={(e) => updateSort(e.target.value as SortCriterion)}
                className="bg-transparent text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="priority">Prioridad (Alta ➔ Baja)</option>
                <option value="time">Hora de Inicio</option>
                <option value="title">Nombre Alfabético</option>
                <option value="completed">Pendientes Primero</option>
              </select>
            </div>

            {/* Filter Reset Button if filter active */}
            {(filterPriority || filterCategory) && (
              <button
                onClick={() => {
                  setFilterPriority(null);
                  setFilterCategory(null);
                }}
                className="px-2 py-1 rounded-xl text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
              >
                Limpiar Filtros
              </button>
            )}

            {/* Dashboard Customizer / Settings Trigger Button */}
            <button
              onClick={() => {
                if (onNavigateToSettings) {
                  onNavigateToSettings();
                } else {
                  setIsDashboardCustomizerOpen(true);
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Personalizar actividades y elementos del dashboard"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Ajustes</span>
            </button>

            <button
              onClick={onNavigateToCalendar}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 ml-1"
            >
              <span className="hidden sm:inline">Calendario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {filteredAndSortedTodayActivities.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
            No hay actividades que coincidan con los filtros para hoy.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredAndSortedTodayActivities.map((act) => {
              const cat = categoryMap.get(act.categoryId);
              const priorityBorder = getPriorityBorderHighlight(act.priority);
              const priorityBadge = getPriorityBadgeClasses(act.priority);

              return (
                <div
                  key={act.id}
                  className={`group flex items-center justify-between p-3.5 rounded-xl border transition ${priorityBorder} ${
                    act.completed
                      ? 'border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <button
                      onClick={() => handleToggle(act)}
                      className="text-slate-400 hover:text-emerald-500 transition shrink-0"
                    >
                      {act.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold truncate ${
                            act.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {act.title}
                        </p>
                        {act.type === 'event' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-medium">
                            Evento
                          </span>
                        )}
                      </div>

                      {act.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {act.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        {act.startTime && (
                          <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {act.startTime} {act.endTime ? `- ${act.endTime}` : ''}
                          </span>
                        )}

                        {cat && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                            style={{
                              backgroundColor: `${cat.color}20`,
                              color: cat.color,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </span>
                        )}

                        {act.recurrence && act.recurrence.frequency !== 'none' && (
                          <span className="flex items-center gap-1 text-[11px] text-indigo-500 dark:text-indigo-400 font-medium">
                            <Repeat className="w-3 h-3" />
                            {getRecurrenceDescription(act.recurrence)}
                          </span>
                        )}

                        {act.reminderMinutesBefore !== undefined && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                            <Bell className="w-3 h-3" />
                            {act.reminderMinutesBefore === 0
                              ? 'Al momento'
                              : `-${act.reminderMinutesBefore}m`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${priorityBadge}`}
                    >
                      {PRIORITY_LABELS[act.priority]}
                    </span>

                    <button
                      onClick={() => deleteActivity(act.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Eliminar actividad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
