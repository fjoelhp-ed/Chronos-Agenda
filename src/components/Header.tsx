import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ShieldCheck,
  Lock,
  Bell,
  RefreshCw,
  Download,
  Moon,
  Sun,
  Smartphone,
  Plus,
  X,
  CheckCircle2,
  Trash2,
  Sparkles,
  BookOpen,
  SlidersHorizontal,
  Zap,
  Settings,
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';

interface HeaderProps {
  onOpenNewActivity: () => void;
  onOpenSecurity: () => void;
  onOpenSync: () => void;
  onOpenExportImport: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewActivity,
  onOpenSecurity,
  onOpenSync,
  onOpenExportImport,
  onOpenSettings,
}) => {
  const {
    preferences,
    updatePreferences,
    toggleDashboardMode,
    setIsTutorialOpen,
    setIsDashboardCustomizerOpen,
    hasPassphrase,
    lockVault,
    notifications,
    dismissNotification,
    clearNotifications,
  } = useAgenda();

  const [showNotifications, setShowNotifications] = useState(false);

  const toggleTheme = () => {
    if (preferences.theme === 'light') {
      updatePreferences({ theme: 'dark' });
    } else if (preferences.theme === 'dark') {
      updatePreferences({ theme: 'glass' });
    } else if (preferences.theme === 'glass') {
      updatePreferences({ theme: 'amoled' });
    } else {
      updatePreferences({ theme: 'light' });
    }
  };

  const cycleDeviceShell = () => {
    if (preferences.deviceShell === 'responsive') {
      updatePreferences({ deviceShell: 'android' });
    } else if (preferences.deviceShell === 'android') {
      updatePreferences({ deviceShell: 'ios' });
    } else {
      updatePreferences({ deviceShell: 'responsive' });
    }
  };

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Chronos
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">
              Agenda privada & sincronizada
            </p>
          </div>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 justify-end">
          {/* Device Shell Switcher */}
          <button
            type="button"
            onClick={cycleDeviceShell}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Alternar vista: Android / iOS / Pantalla Completa"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline capitalize">{preferences.deviceShell}</span>
          </button>

          {/* E2EE Lock / Security Button */}
          <button
            type="button"
            onClick={() => {
              if (hasPassphrase) {
                lockVault();
              } else {
                onOpenSecurity();
              }
            }}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
              hasPassphrase
                ? 'border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
            }`}
            title={hasPassphrase ? 'Bóveda protegida (Clic para bloquear)' : 'Configurar Cifrado E2EE'}
          >
            {hasPassphrase ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Lock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline font-mono text-[11px]">
              {hasPassphrase ? 'AES-256' : 'Cifrar'}
            </span>
          </button>

          {/* Google Sync Button */}
          <button
            type="button"
            onClick={onOpenSync}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Sincronización con Google Calendar"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden lg:inline">Google Sync</span>
          </button>

          {/* Export / Import Button */}
          <button
            type="button"
            onClick={onOpenExportImport}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Exportar/Importar JSON & CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden xl:inline ml-1">Exportar</span>
          </button>

          {/* Guided Tour / Tutorial */}
          <button
            type="button"
            onClick={() => setIsTutorialOpen(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
            title="Iniciar Tutorial Guiado"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline">Tutorial</span>
          </button>

          {/* Dashboard Customizer / Settings */}
          <button
            type="button"
            onClick={() => {
              if (onOpenSettings) {
                onOpenSettings();
              } else {
                setIsDashboardCustomizerOpen(true);
              }
            }}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-medium transition ${
              preferences.dashboardMode === 'essential'
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
            title="Personalizar elementos del Dashboard / Ajustes"
          >
            <Settings className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden lg:inline">{preferences.dashboardMode === 'essential' ? 'Esencial' : 'Ajustes'}</span>
          </button>

          {/* Notifications Bell Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Notificaciones push de recordatorios"
            >
              <Bell className="w-4 h-4 text-amber-500" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Notificaciones de Agenda
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-slate-400 hover:text-rose-500 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Limpiar
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No tienes alertas de recordatorios pendientes.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="flex items-start justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{notif.body}</p>
                          <span className="text-[9px] font-mono text-slate-400 mt-1 block">
                            {notif.timestamp}
                          </span>
                        </div>
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={`Tema actual: ${preferences.theme}`}
          >
            {preferences.theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-600" />
            ) : preferences.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : preferences.theme === 'glass' ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Glass</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-400">AMOLED</span>
            )}
          </button>

          {/* Primary Action: Add Activity */}
          <button
            type="button"
            onClick={onOpenNewActivity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Actividad</span>
          </button>
        </div>
      </div>
    </header>
  );
};
