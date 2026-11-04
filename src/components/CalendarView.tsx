import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Circle,
  Repeat,
  Plus,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { Activity } from '../types/agenda';
import {
  formatDateKey,
  parseDateKey,
  getActivitiesForDate,
  getRecurrenceDescription,
} from '../utils/recurrence';
import {
  sortActivities,
  getPriorityBadgeClasses,
  getPriorityBorderHighlight,
  PRIORITY_LABELS,
} from '../utils/priority';

type CalendarMode = 'month' | 'week' | 'day' | 'agenda';

export const CalendarView: React.FC<{ onOpenNewActivity: (presetDate?: string) => void }> = ({
  onOpenNewActivity,
}) => {
  const {
    activities,
    categories,
    preferences,
    selectedDate,
    setSelectedDate,
    toggleActivityCompletion,
    filterCategory,
    filterPriority,
    setFilterPriority,
    searchQuery,
  } = useAgenda();

  const [mode, setMode] = useState<CalendarMode>('month');

  const selectedDateObj = useMemo(() => parseDateKey(selectedDate), [selectedDate]);
  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (filterCategory && act.categoryId !== filterCategory) return false;
      if (filterPriority && act.priority !== filterPriority) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = act.title.toLowerCase().includes(q);
        const matchDesc = act.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [activities, filterCategory, filterPriority, searchQuery]);

  // Navigate dates
  const handlePrev = () => {
    const cur = parseDateKey(selectedDate);
    if (mode === 'month') {
      cur.setMonth(cur.getMonth() - 1);
    } else if (mode === 'week') {
      cur.setDate(cur.getDate() - 7);
    } else {
      cur.setDate(cur.getDate() - 1);
    }
    setSelectedDate(formatDateKey(cur));
  };

  const handleNext = () => {
    const cur = parseDateKey(selectedDate);
    if (mode === 'month') {
      cur.setMonth(cur.getMonth() + 1);
    } else if (mode === 'week') {
      cur.setDate(cur.getDate() + 7);
    } else {
      cur.setDate(cur.getDate() + 1);
    }
    setSelectedDate(formatDateKey(cur));
  };

  const handleToday = () => {
    setSelectedDate(todayKey);
  };

  // Month days builder
  const monthData = useMemo(() => {
    const year = selectedDateObj.getFullYear();
    const month = selectedDateObj.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Day of week for 1st day (0 = Sunday, 1 = Monday)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1; // start on Monday
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: { dateKey: string; isCurrentMonth: boolean; dayNumber: number }[] = [];

    // Preceding month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dateKey: formatDateKey(prevDate),
        isCurrentMonth: false,
        dayNumber: d,
      });
    }

    // Current month days
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const curDate = new Date(year, month, d);
      days.push({
        dateKey: formatDateKey(curDate),
        isCurrentMonth: true,
        dayNumber: d,
      });
    }

    // Following month padding (to 35 or 42 cells)
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      days.push({
        dateKey: formatDateKey(nextDate),
        isCurrentMonth: false,
        dayNumber: d,
      });
    }

    return days;
  }, [selectedDateObj]);

  // Week days builder
  const weekDays = useMemo(() => {
    const cur = parseDateKey(selectedDate);
    const dayOfWeek = cur.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(cur);
    monday.setDate(cur.getDate() + mondayOffset);

    const days: { dateKey: string; dayName: string; dayNumber: number }[] = [];
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        dateKey: formatDateKey(d),
        dayName: dayNames[i],
        dayNumber: d.getDate(),
      });
    }
    return days;
  }, [selectedDate]);

  // Selected date activities
  const selectedDateActivities = useMemo(() => {
    const raw = getActivitiesForDate(filteredActivities, selectedDate);
    return sortActivities(raw, preferences.sortBy, preferences.sortAscending);
  }, [filteredActivities, selectedDate, preferences.sortBy, preferences.sortAscending]);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  return (
    <div className="space-y-5">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrev}
              aria-label="Anterior"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition"
            >
              Hoy
            </button>
            <button
              onClick={handleNext}
              aria-label="Siguiente"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
            {selectedDateObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {(['month', 'week', 'day', 'agenda'] as CalendarMode[]).map((m) => {
              const labels = { month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda' };
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    mode === m
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {labels[m]}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onOpenNewActivity(selectedDate)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nueva</span>
          </button>
        </div>
      </div>

      {/* Priority Quick Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 font-semibold text-[11px] mr-1">Filtrar por Prioridad:</span>
        <button
          onClick={() => setFilterPriority(null)}
          className={`px-2.5 py-1 rounded-xl font-medium transition ${
            filterPriority === null
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilterPriority(filterPriority === 'high' ? null : 'high')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium transition border ${
            filterPriority === 'high'
              ? 'bg-rose-500 text-white border-rose-400 font-bold'
              : 'border-slate-200 dark:border-slate-800 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
          Alta
        </button>
        <button
          onClick={() => setFilterPriority(filterPriority === 'medium' ? null : 'medium')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium transition border ${
            filterPriority === 'medium'
              ? 'bg-amber-500 text-white border-amber-400 font-bold'
              : 'border-slate-200 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
          Media
        </button>
        <button
          onClick={() => setFilterPriority(filterPriority === 'low' ? null : 'low')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium transition border ${
            filterPriority === 'low'
              ? 'bg-slate-600 text-white border-slate-500 font-bold'
              : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
          Baja
        </button>
      </div>

      {/* Month View */}
      {mode === 'month' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
            {/* Days of week */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 py-2.5">
              <span>Lunes</span>
              <span>Martes</span>
              <span>Miércoles</span>
              <span>Jueves</span>
              <span>Viernes</span>
              <span>Sábado</span>
              <span>Domingo</span>
            </div>

            {/* Grid cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
              {monthData.map((day) => {
                const dayActs = getActivitiesForDate(filteredActivities, day.dateKey);
                const isSelected = day.dateKey === selectedDate;
                const isToday = day.dateKey === todayKey;

                return (
                  <div
                    key={day.dateKey}
                    onClick={() => setSelectedDate(day.dateKey)}
                    className={`min-h-[75px] sm:min-h-[105px] p-1.5 sm:p-2 cursor-pointer transition flex flex-col justify-between ${
                      !day.isCurrentMonth
                        ? 'opacity-35 bg-slate-50/50 dark:bg-slate-950/30'
                        : isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 ring-1 ring-inset ring-emerald-500/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full font-medium ${
                          isToday
                            ? 'bg-emerald-500 text-white font-bold'
                            : isSelected
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                      {dayActs.length > 0 && (
                        <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500">
                          {dayActs.length}
                        </span>
                      )}
                    </div>

                    {/* Event indicators */}
                    <div className="mt-1 space-y-1">
                      {dayActs.slice(0, 2).map((act) => {
                        const cat = categoryMap.get(act.categoryId);
                        return (
                          <div
                            key={act.id}
                            className={`truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight flex items-center gap-1 ${
                              act.completed
                                ? 'opacity-40 line-through bg-slate-100 dark:bg-slate-800 text-slate-500'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: cat?.color || '#3b82f6' }}
                            />
                            <span className="truncate">{act.title}</span>
                          </div>
                        );
                      })}
                      {dayActs.length > 2 && (
                        <span className="text-[9px] font-medium text-slate-400 pl-1 block">
                          +{dayActs.length - 2} más
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Detail Drawer */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                  {selectedDateObj.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDateActivities.length}{' '}
                  {selectedDateActivities.length === 1 ? 'actividad programada' : 'actividades programadas'}
                </p>
              </div>
              <button
                onClick={() => onOpenNewActivity(selectedDate)}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Añadir a este día
              </button>
            </div>

            {selectedDateActivities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                No hay actividades registradas para esta fecha.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDateActivities.map((act) => {
                  const cat = categoryMap.get(act.categoryId);
                  return (
                    <div
                      key={act.id}
                      className={`flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 transition ${getPriorityBorderHighlight(
                        act.priority
                      )}`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <button
                          onClick={() => toggleActivityCompletion(act.id)}
                          className="shrink-0 text-slate-400 hover:text-emerald-500 transition"
                        >
                          {act.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <div className="truncate">
                          <p
                            className={`text-sm font-medium text-slate-800 dark:text-slate-100 truncate ${
                              act.completed ? 'line-through opacity-50' : ''
                            }`}
                          >
                            {act.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            {act.startTime && (
                              <span className="flex items-center gap-1 font-mono text-[11px]">
                                <Clock className="w-3 h-3" />
                                {act.startTime} {act.endTime ? `- ${act.endTime}` : ''}
                              </span>
                            )}
                            {cat && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium"
                                style={{
                                  backgroundColor: `${cat.color}20`,
                                  color: cat.color,
                                }}
                              >
                                {cat.name}
                              </span>
                            )}
                            {act.recurrence && act.recurrence.frequency !== 'none' && (
                              <span className="flex items-center gap-1 text-[11px] text-indigo-500 dark:text-indigo-400">
                                <Repeat className="w-3 h-3" />
                                {getRecurrenceDescription(act.recurrence)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 pl-3">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeClasses(
                            act.priority
                          )}`}
                        >
                          {PRIORITY_LABELS[act.priority]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Week View */}
      {mode === 'week' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-center py-3">
            {weekDays.map((d) => {
              const isToday = d.dateKey === todayKey;
              const isSelected = d.dateKey === selectedDate;
              return (
                <div
                  key={d.dateKey}
                  onClick={() => setSelectedDate(d.dateKey)}
                  className={`cursor-pointer transition py-1 rounded-xl mx-1 ${
                    isSelected ? 'bg-emerald-50 dark:bg-emerald-950/30 font-bold' : ''
                  }`}
                >
                  <p className="text-[11px] font-medium text-slate-400">{d.dayName}</p>
                  <p
                    className={`text-base font-bold mt-0.5 ${
                      isToday ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {d.dayNumber}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800 min-h-[350px] p-2">
            {weekDays.map((d) => {
              const dayActs = getActivitiesForDate(filteredActivities, d.dateKey);
              return (
                <div key={d.dateKey} className="space-y-2 p-1">
                  {dayActs.map((act) => {
                    const cat = categoryMap.get(act.categoryId);
                    return (
                      <div
                        key={act.id}
                        onClick={() => toggleActivityCompletion(act.id)}
                        className="p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-xs cursor-pointer hover:border-slate-300 transition"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat?.color || '#10b981' }}
                          />
                          <span className="text-[10px] font-mono opacity-75">{act.startTime || 'Todo el día'}</span>
                        </div>
                        <p
                          className={`font-medium line-clamp-2 text-slate-800 dark:text-slate-100 ${
                            act.completed ? 'line-through opacity-50' : ''
                          }`}
                        >
                          {act.title}
                        </p>
                      </div>
                    );
                  })}
                  {dayActs.length === 0 && (
                    <div className="h-full flex items-center justify-center opacity-30 text-[10px]">
                      Vacío
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {mode === 'day' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                {selectedDateObj.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>
              <p className="text-xs text-slate-500">Horario detallado hora por hora</p>
            </div>
            <button
              onClick={() => onOpenNewActivity(selectedDate)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition"
            >
              + Agregar Evento
            </button>
          </div>

          <div className="space-y-3">
            {Array.from({ length: 15 }).map((_, idx) => {
              const hour = idx + 8; // 08:00 to 22:00
              const hourStr = `${String(hour).padStart(2, '0')}:00`;
              const hourActs = selectedDateActivities.filter((a) => {
                if (!a.startTime) return idx === 0;
                const actHour = parseInt(a.startTime.split(':')[0], 10);
                return actHour === hour;
              });

              return (
                <div key={hour} className="flex gap-4 items-start group">
                  <div className="w-14 text-xs font-mono font-medium text-slate-400 pt-1 shrink-0">
                    {hourStr}
                  </div>
                  <div className="flex-1 min-h-[46px] border-l-2 border-slate-200 dark:border-slate-800 pl-4 py-1 space-y-1.5">
                    {hourActs.map((act) => (
                      <div
                        key={act.id}
                        onClick={() => toggleActivityCompletion(act.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/80 transition ${getPriorityBorderHighlight(
                          act.priority
                        )}`}
                      >
                        <div className="flex items-center gap-2">
                          {act.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400" />
                          )}
                          <span
                            className={`text-xs font-medium ${
                              act.completed ? 'line-through opacity-50' : ''
                            }`}
                          >
                            {act.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${getPriorityBadgeClasses(
                              act.priority
                            )}`}
                          >
                            {PRIORITY_LABELS[act.priority]}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {act.startTime} {act.endTime ? `- ${act.endTime}` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agenda List View */}
      {mode === 'agenda' && (
        <div className="space-y-4">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dateKey = formatDateKey(d);
            const dayActs = getActivitiesForDate(filteredActivities, dateKey);

            return (
              <div
                key={dateKey}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        dateKey === todayKey
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    {dateKey === todayKey && (
                      <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide">
                        Hoy
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onOpenNewActivity(dateKey)}
                    className="text-xs text-slate-400 hover:text-emerald-500"
                  >
                    + Añadir
                  </button>
                </div>

                {dayActs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-1">Sin actividades</p>
                ) : (
                  <div className="space-y-2">
                    {dayActs.map((act) => (
                      <div
                        key={act.id}
                        onClick={() => toggleActivityCompletion(act.id)}
                        className={`flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition text-xs ${getPriorityBorderHighlight(
                          act.priority
                        )}`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {act.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className={`font-medium truncate ${act.completed ? 'line-through opacity-50' : ''}`}>
                            {act.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${getPriorityBadgeClasses(
                              act.priority
                            )}`}
                          >
                            {PRIORITY_LABELS[act.priority]}
                          </span>
                          {act.startTime && (
                            <span className="text-[11px] font-mono text-slate-400">
                              {act.startTime}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
