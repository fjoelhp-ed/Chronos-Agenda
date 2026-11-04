import React from 'react';
import {
  Settings,
  Sliders,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  LayoutTemplate,
  Flame,
  CheckCircle2,
  TrendingUp,
  Tag,
  Zap,
  RotateCcw,
  Palette,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Download,
  Volume2,
  VolumeX,
  Vibrate,
  ArrowRight,
  Sun,
  Moon,
  CheckSquare,
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { SortCriterion, DashboardCardsVisibility } from '../types/agenda';
import { soundHaptics } from '../utils/soundHaptics';

interface SettingsViewProps {
  onNavigateToDashboard?: () => void;
  onOpenSecurity?: () => void;
  onOpenSync?: () => void;
  onOpenExportImport?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNavigateToDashboard,
  onOpenSecurity,
  onOpenSync,
  onOpenExportImport,
}) => {
  const {
    preferences,
    updatePreferences,
    toggleDashboardMode,
    updateVisibleCard,
    updateSort,
    setIsTutorialOpen,
    categories,
    activities,
  } = useAgenda();

  const isEssential = preferences.dashboardMode === 'essential';

  const dashboardCardsConfig = [
    {
      key: 'progress' as keyof DashboardCardsVisibility,
      title: 'Anillo de Progreso Diario',
      description: 'Gráfico circular radial animado con el porcentaje y conteo de actividades completadas.',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      key: 'streak' as keyof DashboardCardsVisibility,
      title: 'Racha de Productividad',
      description: 'Contador de días seguidos con animación de fuego para motivar la constancia diaria.',
      icon: Flame,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      key: 'priorityMatrix' as keyof DashboardCardsVisibility,
      title: 'Matriz y Filtro de Prioridades',
      description: 'Tarjetas interactivas con el conteo de tareas Altas (🔴), Medias (🟡) y Bajas (⚪).',
      icon: TrendingUp,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
    },
    {
      key: 'quickAdd' as keyof DashboardCardsVisibility,
      title: 'Barra de Captura Rápida',
      description: 'Formulario en la parte superior para registrar tareas al vuelo con hora y prioridad.',
      icon: Sparkles,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      key: 'categoryChips' as keyof DashboardCardsVisibility,
      title: 'Filtros de Categorías & Etiquetas',
      description: 'Carrusel horizontal con chips de colores para filtrar por Trabajo, Salud, Personal, etc.',
      icon: Tag,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
    },
  ];

  const sortOptions: { id: SortCriterion; label: string; desc: string; icon: string }[] = [
    {
      id: 'priority',
      label: 'Por Prioridad',
      desc: 'Alta (🔴) ➔ Media (🟡) ➔ Baja (⚪)',
      icon: '🎯',
    },
    {
      id: 'time',
      label: 'Por Hora de Inicio',
      desc: 'Cronológico según el horario fijado',
      icon: '⏰',
    },
    {
      id: 'title',
      label: 'Por Nombre',
      desc: 'Orden alfabético A ➔ Z',
      icon: '🔤',
    },
    {
      id: 'completed',
      label: 'Estado de Tarea',
      desc: 'Pendientes primero, completadas al final',
      icon: '✅',
    },
  ];

  const handleToggleCard = (key: keyof DashboardCardsVisibility) => {
    soundHaptics.triggerHaptic(10);
    updateVisibleCard(key, !preferences.visibleCards[key]);
  };

  const handleResetDashboard = () => {
    soundHaptics.triggerHaptic(20);
    updatePreferences({
      dashboardMode: 'full',
      visibleCards: {
        progress: true,
        streak: true,
        priorityMatrix: true,
        quickAdd: true,
        categoryChips: true,
      },
      sortBy: 'priority',
      sortAscending: false,
    });
  };

  const handleSetEssentialOnly = () => {
    soundHaptics.triggerHaptic(20);
    updatePreferences({
      dashboardMode: 'essential',
      visibleCards: {
        progress: false,
        streak: false,
        priorityMatrix: false,
        quickAdd: true,
        categoryChips: false,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Ajustes & Personalización
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                Dashboard
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configura qué módulos y elementos aparecen en tu pantalla principal, el modo de concentración y estilo.
            </p>
          </div>
        </div>

        {onNavigateToDashboard && (
          <button
            onClick={onNavigateToDashboard}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 transition shrink-0"
          >
            <span>Ver Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* SECTION 1: MODO ESENCIAL VS COMPLETO */}
      <section className="bg-white dark:bg-slate-900/60 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Modo de Visualización del Dashboard
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {isEssential ? 'Modo Esencial' : 'Modo Completo'}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Diseñado para quienes solo quieren las funciones esenciales sin abrumarse con múltiples pantallas, gráficos o métricas.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Card Modo Completo */}
          <div
            onClick={() => {
              if (isEssential) toggleDashboardMode();
            }}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
              !isEssential
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📊</span>
                {!isEssential && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Activo
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Modo Completo
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Incluye gráfico circular de progreso diario, contador de racha con fuego, matriz de prioridades y filtros de categorías.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Personalizable módulo por módulo</span>
            </div>
          </div>

          {/* Card Modo Esencial */}
          <div
            onClick={() => {
              if (!isEssential) toggleDashboardMode();
            }}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
              isEssential
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">⚡</span>
                {isEssential && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Activo
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Modo Esencial (Sin Distracciones)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Limpio, directo y minimalista. Oculta las tarjetas de métricas para concentrarte exclusivamente en la lista de tareas de hoy.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <span>Cero sobrecarga cognitiva</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ELEMENTOS VISIBLES EN EL DASHBOARD */}
      <section className="bg-white dark:bg-slate-900/60 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Elementos y Tarjetas del Dashboard
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Activa o desactiva individualmente los componentes que deseas ver en pantalla.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDashboard}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Restablecer todos los elementos por defecto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restablecer</span>
            </button>
            <button
              onClick={handleSetEssentialOnly}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Solo Esencial</span>
            </button>
          </div>
        </div>

        {isEssential && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <Zap className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              El <strong>Modo Esencial</strong> está activo. Las tarjetas de métricas están temporalmente pausadas para no distraerte. Al cambiar a Modo Completo se aplicarán tus interruptores inferiores.
            </span>
          </div>
        )}

        <div className="space-y-3">
          {dashboardCardsConfig.map((card) => {
            const isVisible = preferences.visibleCards[card.key];
            const Icon = card.icon;

            return (
              <div
                key={card.key}
                onClick={() => handleToggleCard(card.key)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isVisible
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 hover:border-emerald-300 dark:hover:border-emerald-700/60'
                    : 'border-dashed border-slate-200 dark:border-slate-800/60 bg-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`h-10 w-10 rounded-xl ${card.bgColor} ${card.color} flex items-center justify-center shrink-0 mt-0.5 sm:mt-0`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {card.title}
                      </h4>
                      {isVisible ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Eye className="w-3 h-3" /> Visible
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                          <EyeOff className="w-3 h-3" /> Oculto
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Switch toggle control */}
                <div className="shrink-0 flex items-center">
                  <div
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                      isVisible ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        isVisible ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: VISTA PREVIA INTERACTIVA */}
      <section className="bg-white dark:bg-slate-900/60 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Vista Previa de tu Pantalla de Inicio
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {isEssential ? 'Esencial' : `${Object.values(preferences.visibleCards).filter(Boolean).length}/5 Módulos`}
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Así es como se organizará tu Dashboard al ingresar:
        </p>

        {/* Mock visual container */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 space-y-2.5">
          {/* Mock Top Cards Row */}
          {!isEssential && (
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`p-2.5 rounded-xl border text-center transition ${
                  preferences.visibleCards.progress
                    ? 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900'
                    : 'border-dashed border-slate-300 dark:border-slate-800 bg-slate-200/40 dark:bg-slate-900/20 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  Progreso
                </div>
                <div className="text-xs font-black text-emerald-500">
                  {preferences.visibleCards.progress ? '85%' : '—'}
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border text-center transition ${
                  preferences.visibleCards.streak
                    ? 'border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900'
                    : 'border-dashed border-slate-300 dark:border-slate-800 bg-slate-200/40 dark:bg-slate-900/20 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  Racha
                </div>
                <div className="text-xs font-black text-amber-500">
                  {preferences.visibleCards.streak ? '🔥 5 Días' : '—'}
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border text-center transition ${
                  preferences.visibleCards.priorityMatrix
                    ? 'border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900'
                    : 'border-dashed border-slate-300 dark:border-slate-800 bg-slate-200/40 dark:bg-slate-900/20 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  Prioridades
                </div>
                <div className="text-xs font-black text-rose-500">
                  {preferences.visibleCards.priorityMatrix ? '🔴 🟡 ⚪' : '—'}
                </div>
              </div>
            </div>
          )}

          {/* Mock Quick Add */}
          {preferences.visibleCards.quickAdd && (
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">➕ Añadir tarea rápida para hoy...</span>
              <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-lg shrink-0">
                Añadir
              </span>
            </div>
          )}

          {/* Mock Category Chips */}
          {!isEssential && preferences.visibleCards.categoryChips && (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shrink-0">
                Todas ({activities.length})
              </span>
              {categories.slice(0, 3).map((c) => (
                <span
                  key={c.id}
                  className="px-2 py-1 rounded-lg text-[10px] font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shrink-0 truncate max-w-[90px]"
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}

          {/* Mock Activity List */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200">
              <span>Agenda de Hoy ({activities.length} actividades)</span>
              <span className="text-[10px] text-emerald-500 font-semibold">
                Orden: {preferences.sortBy}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {activities[0]?.title || 'Actividad prioritaria de la agenda'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">09:30</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CRITERIO DE ORDENACIÓN */}
      <section className="bg-white dark:bg-slate-900/60 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Criterio de Ordenación Predeterminado
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Define cómo se ordenan automáticamente tus actividades al abrir el Dashboard:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sortOptions.map((opt) => {
            const isSelected = preferences.sortBy === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateSort(opt.id, preferences.sortAscending)}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-slate-900 dark:text-white font-semibold ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span className="text-xl shrink-0">{opt.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: ESTILO, TEMAS & DISPOSITIVO */}
      <section className="bg-white dark:bg-slate-900/60 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-teal-500" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Temas y Apariencia
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personaliza el aspecto de la aplicación y de tus widgets interactivos:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Claro */}
          <button
            onClick={() => updatePreferences({ theme: 'light' })}
            className={`p-3 rounded-2xl border text-left transition ${
              preferences.theme === 'light'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Sun className="w-4 h-4 text-amber-500" />
              {preferences.theme === 'light' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Claro</div>
            <div className="text-[10px] text-slate-500">Limpio & brillante</div>
          </button>

          {/* Oscuro */}
          <button
            onClick={() => updatePreferences({ theme: 'dark' })}
            className={`p-3 rounded-2xl border text-left transition ${
              preferences.theme === 'dark'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Moon className="w-4 h-4 text-indigo-400" />
              {preferences.theme === 'dark' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Oscuro</div>
            <div className="text-[10px] text-slate-500">Descanso visual</div>
          </button>

          {/* Glass */}
          <button
            onClick={() => updatePreferences({ theme: 'glass' })}
            className={`p-3 rounded-2xl border text-left transition ${
              preferences.theme === 'glass'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Sparkles className="w-4 h-4 text-teal-400" />
              {preferences.theme === 'glass' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Glass Translúcido</div>
            <div className="text-[10px] text-slate-500">Efecto vidrio & blur</div>
          </button>

          {/* AMOLED */}
          <button
            onClick={() => updatePreferences({ theme: 'amoled' })}
            className={`p-3 rounded-2xl border text-left transition ${
              preferences.theme === 'amoled'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="w-4 h-4 rounded-full bg-black border border-slate-700" />
              {preferences.theme === 'amoled' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">AMOLED Puro</div>
            <div className="text-[10px] text-slate-500">Ahorro de batería</div>
          </button>
        </div>

        {/* Device Shell */}
        <div className="pt-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            Marco de Dispositivo Simulado
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'responsive', label: 'Pantalla Completa' },
              { id: 'android', label: 'Marco Android' },
              { id: 'ios', label: 'Marco iPhone' },
            ].map((shell) => (
              <button
                key={shell.id}
                onClick={() => updatePreferences({ deviceShell: shell.id as any })}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition ${
                  preferences.deviceShell === shell.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {shell.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sound & Haptics */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                updatePreferences({ soundEnabled: !preferences.soundEnabled });
                if (!preferences.soundEnabled) soundHaptics.playSuccessChime();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                preferences.soundEnabled
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              {preferences.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
              <span>Sonidos ({preferences.soundEnabled ? 'Activados' : 'Silencio'})</span>
            </button>

            <button
              onClick={() => {
                updatePreferences({ vibrationEnabled: !preferences.vibrationEnabled });
                soundHaptics.triggerHaptic(20);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                preferences.vibrationEnabled
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <Vibrate className="w-4 h-4 text-emerald-500" />
              <span>Vibración Háptica ({preferences.vibrationEnabled ? 'Sí' : 'No'})</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 6: TUTORIAL & ACCESOS RÁPIDOS */}
      <section className="bg-white dark:bg-slate-900/60 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          <span>Tutorial Guiado & Otras Herramientas</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-left hover:border-indigo-400 transition group"
          >
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Iniciar Tutorial Guiado
              </span>
            </div>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
              Aprende paso a paso cómo gestionar prioridades, widgets y personalización.
            </p>
          </button>

          {onOpenSecurity && (
            <button
              onClick={onOpenSecurity}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 text-left hover:border-emerald-500 transition group"
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Cifrado AES-256 & Biometría
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Protege tu agenda localmente con contraseña maestra y desbloqueo biométrico.
              </p>
            </button>
          )}

          {onOpenSync && (
            <button
              onClick={onOpenSync}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 text-left hover:border-blue-500 transition group"
            >
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Google Calendar Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Sincroniza tus eventos bidireccionalmente con tu cuenta de Google.
              </p>
            </button>
          )}

          {onOpenExportImport && (
            <button
              onClick={onOpenExportImport}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 text-left hover:border-teal-500 transition group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Exportar / Importar
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Crea copias de seguridad portátiles en JSON o exporta a CSV para hojas de cálculo.
              </p>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
