import React from 'react';
import {
  X,
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
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { SortCriterion } from '../types/agenda';

interface DashboardCustomizerModalProps {
  onOpenSettingsTab?: () => void;
}

export const DashboardCustomizerModal: React.FC<DashboardCustomizerModalProps> = ({
  onOpenSettingsTab,
}) => {
  const {
    preferences,
    updatePreferences,
    isDashboardCustomizerOpen,
    setIsDashboardCustomizerOpen,
    setIsTutorialOpen,
    toggleDashboardMode,
    updateVisibleCard,
    updateSort,
  } = useAgenda();

  if (!isDashboardCustomizerOpen) return null;

  const isEssential = preferences.dashboardMode === 'essential';

  const cardItems = [
    { key: 'progress' as const, label: 'Anillo de Progreso Diario', icon: CheckCircle2 },
    { key: 'streak' as const, label: 'Racha de Productividad (🔥 Días)', icon: Flame },
    { key: 'priorityMatrix' as const, label: 'Matriz de Prioridades (Alta, Media, Baja)', icon: TrendingUp },
    { key: 'quickAdd' as const, label: 'Barra de Captura Rápida', icon: Sparkles },
    { key: 'categoryChips' as const, label: 'Filtros de Etiquetas y Categorías', icon: Tag },
  ];

  const sortOptions: { id: SortCriterion; label: string }[] = [
    { id: 'priority', label: 'Prioridad (Alta primero)' },
    { id: 'time', label: 'Hora de inicio' },
    { id: 'title', label: 'Nombre alfabético' },
    { id: 'completed', label: 'Pendientes primero' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Personalizar Dashboard & Experiencia
            </h3>
          </div>
          <button
            onClick={() => setIsDashboardCustomizerOpen(false)}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Essential Mode Hero Card */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isEssential
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Modo Esencial (Sin Distracciones)
                  </h4>
                  {isEssential && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                      ACTIVO
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Para quienes solo desean las funciones esenciales sin abrumarse con gráficos, métricas o paneles adicionales. Muestra únicamente la lista limpia de actividades y captura rápida.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleDashboardMode}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  isEssential
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                }`}
              >
                {isEssential ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>

          {/* Granular Cards Visibility */}
          {!isEssential && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tarjetas Visibles en el Dashboard
              </h4>
              <div className="space-y-2">
                {cardItems.map((item) => {
                  const isVisible = preferences.visibleCards[item.key];
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      onClick={() => updateVisibleCard(item.key, !isVisible)}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.label}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => {}}
                        className="h-4 w-4 rounded accent-emerald-500 pointer-events-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sorting Options */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />
              Criterio de Ordenación de Actividades
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((opt) => {
                const isSelected = preferences.sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateSort(opt.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions & Settings tab */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {onOpenSettingsTab && (
              <button
                type="button"
                onClick={() => {
                  setIsDashboardCustomizerOpen(false);
                  onOpenSettingsTab();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition"
              >
                <span>Abrir Pestaña de Ajustes Completa</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsDashboardCustomizerOpen(false);
                setIsTutorialOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Ver Tutorial Guiado de Funciones Esenciales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
