import React, { useState } from 'react';
import {
  Smartphone,
  Copy,
  Check,
  Sparkles,
  Layers,
  Palette,
  Calendar,
  Sliders,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  ExternalLink,
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { WidgetConfig } from '../types/agenda';
import { getActivitiesForDate, formatDateKey } from '../utils/recurrence';

export const WidgetStudio: React.FC<{ onOpenNewActivity: () => void }> = ({ onOpenNewActivity }) => {
  const {
    widgets,
    addWidget,
    updateWidget,
    activities,
    categories,
    selectedDate,
    toggleActivityCompletion,
  } = useAgenda();

  const [activeWidgetIndex, setActiveWidgetIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const currentWidget = widgets[activeWidgetIndex] || widgets[0];

  const todayKey = formatDateKey(new Date());
  const todayActivities = getActivitiesForDate(activities, todayKey).filter((act) => {
    if (!currentWidget.showCompleted && act.completed) return false;
    if (currentWidget.filterCategoryId && act.categoryId !== currentWidget.filterCategoryId) return false;
    return true;
  });

  const nextUpcoming = todayActivities.find((a) => !a.completed) || todayActivities[0];

  const handleUpdate = (updates: Partial<WidgetConfig>) => {
    if (!currentWidget) return;
    updateWidget(currentWidget.id, updates);
  };

  const getRadiusClass = (radius: WidgetConfig['roundedCorners']) => {
    switch (radius) {
      case 'sm':
        return 'rounded-xl';
      case 'md':
        return 'rounded-2xl';
      case 'lg':
        return 'rounded-3xl';
      case 'full':
        return 'rounded-[36px]';
      default:
        return 'rounded-2xl';
    }
  };

  const getThemeStyles = (theme: WidgetConfig['theme']) => {
    switch (theme) {
      case 'glass':
        return 'bg-slate-900/40 backdrop-blur-xl border border-white/25 text-white shadow-2xl';
      case 'material_you':
        return 'bg-gradient-to-br from-teal-950/90 via-slate-900/90 to-emerald-950/90 border-teal-500/40 text-teal-100 shadow-teal-950/50';
      case 'amoled':
        return 'bg-black border-neutral-800 text-white shadow-2xl';
      case 'pastel':
        return 'bg-slate-100/95 dark:bg-slate-800/95 border-emerald-300 dark:border-emerald-700 text-slate-800 dark:text-slate-100';
      case 'light':
        return 'bg-white/95 border-slate-200 text-slate-900 shadow-xl';
      case 'dark':
      default:
        return 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-2xl';
    }
  };

  // Generate native code snippet based on selected OS
  const generateNativeSnippet = () => {
    if (currentWidget.os === 'android') {
      const bgModifier =
        currentWidget.theme === 'glass'
          ? '.background(Color.White.copy(alpha = 0.18f)) // Glassmorphism translúcido'
          : `.background(ColorProvider(R.color.${currentWidget.theme}))`;

      return `// Android Jetpack Compose Glance Widget
// Archivo: ChronosAgendaWidget.kt
package com.chronos.agenda.widget

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.layout.*
import androidx.glance.text.Text
import androidx.glance.color.ColorProvider
import androidx.compose.ui.graphics.Color

class ChronosAgendaWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            GlanceTheme {
                Column(
                    modifier = GlanceModifier
                        .fillMaxSize()
                        ${bgModifier}
                        .cornerRadius(${currentWidget.roundedCorners === 'full' ? '28.dp' : '16.dp'})
                        .padding(16.dp)
                ) {
                    Text(text = "Chronos Agenda - Hoy", style = TextStyle(fontWeight = FontWeight.Bold))
                    // Próxima actividad: ${nextUpcoming ? nextUpcoming.title : 'Día Libre'}
                }
            }
        }
    }
}`;
    } else {
      const containerBg =
        currentWidget.theme === 'glass'
          ? '.containerBackground(.ultraThinMaterial, for: .widget) // Glassmorphism iOS'
          : '.containerBackground(.fill.tertiary, for: .widget)';

      return `// iOS WidgetKit Swift
// Archivo: ChronosAgendaWidget.swift
import WidgetKit
import SwiftUI

struct ChronosAgendaWidget: Widget {
    let kind: String = "ChronosAgendaWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AgendaProvider()) { entry in
            ChronosWidgetEntryView(entry: entry)
                ${containerBg}
        }
        .configurationDisplayName("Chronos Agenda")
        .description("Muestra tus tareas y calendario en la pantalla de inicio.")
        .supportedFamilies([.${currentWidget.type === 'glance_2x2' ? 'systemSmall' : currentWidget.type === 'calendar_4x4' ? 'systemLarge' : 'systemMedium'}])
    }
}`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateNativeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Generador de Widgets Android & iOS
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Widget Studio Interactivo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Personaliza widgets vivos para la pantalla de inicio con sincronización en tiempo real.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Simulador
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'code'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Código Nativo
          </button>
        </div>
      </div>

      {/* Widget Preset Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {widgets.map((w, idx) => (
          <button
            key={w.id}
            onClick={() => setActiveWidgetIndex(idx)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              activeWidgetIndex === idx
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <span>{w.os === 'android' ? '🤖' : '🍏'}</span>
            <span>{w.name}</span>
            <span className="opacity-75 uppercase text-[10px] bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">
              {w.type.replace('_', ' ')}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Customizer Controls */}
        <div className="lg:col-span-5 space-y-5 bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-white">
            <Sliders className="w-4 h-4 text-emerald-500" />
            Configuración del Widget
          </div>

          {/* OS Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Sistema Operativo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleUpdate({ os: 'android' })}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition ${
                  currentWidget.os === 'android'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>🤖</span> Android 14/15
              </button>
              <button
                type="button"
                onClick={() => handleUpdate({ os: 'ios' })}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition ${
                  currentWidget.os === 'ios'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>🍏</span> iOS 17/18
              </button>
            </div>
          </div>

          {/* Size / Type Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Formato & Tamaño
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'glance_2x2', label: '2x2 Vistazo' },
                { type: 'agenda_4x2', label: '4x2 Agenda' },
                { type: 'calendar_4x4', label: '4x4 Mensual' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleUpdate({ type: item.type as any })}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-medium border transition ${
                    currentWidget.type === item.type
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Tema Visual
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'glass', label: '✨ Glass Translúcido' },
                { id: 'material_you', label: 'Material You' },
                { id: 'amoled', label: 'AMOLED Negro' },
                { id: 'dark', label: 'Oscuro Slate' },
                { id: 'light', label: 'Claro Minimal' },
                { id: 'pastel', label: 'Pastel Mint' },
              ].map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => handleUpdate({ theme: th.id as any })}
                  className={`py-2 px-3 text-xs rounded-xl border text-left transition ${
                    currentWidget.theme === th.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          {/* Corner Radius */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Bordes Redondeados
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'sm', label: '12px' },
                { id: 'md', label: '18px' },
                { id: 'lg', label: '26px' },
                { id: 'full', label: '34px' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleUpdate({ roundedCorners: r.id as any })}
                  className={`py-1.5 text-center text-xs rounded-xl border transition ${
                    currentWidget.roundedCorners === r.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
              <span>Opacidad de Fondo</span>
              <span className="font-mono">{currentWidget.opacity}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={currentWidget.opacity}
              onChange={(e) => handleUpdate({ opacity: Number(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Toggle show completed */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Mostrar tareas completadas
            </span>
            <input
              type="checkbox"
              checked={currentWidget.showCompleted}
              onChange={(e) => handleUpdate({ showCompleted: e.target.checked })}
              className="h-4 w-4 rounded accent-emerald-500"
            />
          </div>
        </div>

        {/* Right: Live Interactive Simulator / Code Viewer */}
        <div className="lg:col-span-7 space-y-4">
          {activeTab === 'preview' ? (
            <div className="bg-slate-200 dark:bg-slate-950 p-6 sm:p-10 rounded-3xl border border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
              {/* Device simulated background wallpaper */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-indigo-950/40 to-slate-950 pointer-events-none opacity-60" />

              <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-4">
                  <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
                    Vista previa interactiva en vivo (haz clic para marcar tareas)
                  </span>
                </div>

                {/* Simulated Widget Box */}
                <div
                  className={`w-full border p-5 transition-all duration-300 backdrop-blur-md ${getRadiusClass(
                    currentWidget.roundedCorners
                  )} ${getThemeStyles(currentWidget.theme)}`}
                  style={{
                    opacity: currentWidget.opacity / 100,
                  }}
                >
                  {/* Widget OS Top Header Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold tracking-tight uppercase">
                        {currentWidget.os === 'android' ? 'Material Agenda' : 'Smart Stack'}
                      </span>
                    </div>
                    <span className="text-[11px] opacity-75 font-mono">
                      {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* 2x2 Glance Format */}
                  {currentWidget.type === 'glance_2x2' && (
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold tracking-tight">
                          {new Date().getDate()}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                          {new Date().toLocaleDateString('es-ES', { month: 'long' })}
                        </span>
                      </div>

                      {nextUpcoming ? (
                        <div
                          onClick={() => toggleActivityCompletion(nextUpcoming.id)}
                          className="cursor-pointer group rounded-xl bg-current/5 p-3 hover:bg-current/10 transition"
                        >
                          <div className="flex items-center gap-2">
                            {nextUpcoming.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 opacity-50 shrink-0 group-hover:text-emerald-400" />
                            )}
                            <div className="truncate">
                              <p className={`text-xs font-medium truncate ${nextUpcoming.completed ? 'line-through opacity-50' : ''}`}>
                                {nextUpcoming.title}
                              </p>
                              {nextUpcoming.startTime && (
                                <p className="text-[10px] opacity-60 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {nextUpcoming.startTime}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs opacity-60 py-2">Sin pendientes hoy 🎉</p>
                      )}

                      <div className="flex justify-between items-center pt-2 text-[11px] opacity-60">
                        <span>{todayActivities.filter((a) => a.completed).length}/{todayActivities.length} listas</span>
                        <button
                          onClick={onOpenNewActivity}
                          className="hover:opacity-100 flex items-center gap-1 font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" /> Añadir
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 4x2 Agenda Format */}
                  {currentWidget.type === 'agenda_4x2' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold pb-1">
                        <span>Actividades de Hoy</span>
                        <button
                          onClick={onOpenNewActivity}
                          className="flex items-center gap-1 text-[11px] opacity-80 hover:opacity-100"
                        >
                          <Plus className="w-3 h-3" /> Rápido
                        </button>
                      </div>

                      {todayActivities.length === 0 ? (
                        <div className="py-6 text-center text-xs opacity-60">
                          No hay actividades programadas para hoy.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {todayActivities.slice(0, 4).map((act) => (
                            <div
                              key={act.id}
                              onClick={() => toggleActivityCompletion(act.id)}
                              className="group flex items-center justify-between p-2 rounded-xl bg-current/5 hover:bg-current/10 cursor-pointer transition text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                {act.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 opacity-40 shrink-0 group-hover:text-emerald-400" />
                                )}
                                <span className={`truncate font-medium ${act.completed ? 'line-through opacity-50' : ''}`}>
                                  {act.title}
                                </span>
                              </div>
                              {act.startTime && (
                                <span className="text-[10px] font-mono opacity-70 shrink-0 ml-2">
                                  {act.startTime}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4x4 Monthly / Full Calendar Format */}
                  {currentWidget.type === 'calendar_4x4' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>Planificador & Calendario</span>
                        <span className="text-[11px] opacity-75">
                          {todayActivities.length} actividades hoy
                        </span>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] opacity-70 font-semibold mb-1">
                        <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono">
                        {Array.from({ length: 14 }).map((_, i) => {
                          const dayNum = i + 1;
                          const isToday = dayNum === new Date().getDate();
                          return (
                            <div
                              key={i}
                              className={`py-1 rounded-lg ${
                                isToday ? 'bg-emerald-500 text-white font-bold' : 'hover:bg-current/10'
                              }`}
                            >
                              {dayNum}
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-current/10 pt-2 space-y-1">
                        {todayActivities.slice(0, 2).map((act) => (
                          <div
                            key={act.id}
                            onClick={() => toggleActivityCompletion(act.id)}
                            className="flex items-center gap-2 p-1.5 rounded-lg bg-current/5 text-[11px] cursor-pointer"
                          >
                            {act.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 opacity-40" />
                            )}
                            <span className={`truncate ${act.completed ? 'line-through opacity-50' : ''}`}>
                              {act.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-900 text-slate-300 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-mono">
                  {currentWidget.os === 'android' ? 'Jetpack Compose Glance (Kotlin)' : 'SwiftUI WidgetKit (Swift)'}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? '¡Copiado!' : 'Copiar Código'}
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 max-h-[380px]">
                {generateNativeSnippet()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
