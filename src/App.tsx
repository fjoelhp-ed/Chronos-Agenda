import React, { useState } from 'react';
import { AgendaProvider, useAgenda } from './context/AgendaContext';
import { Header } from './components/Header';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { WidgetStudio } from './components/WidgetStudio';
import { ActivityModal } from './components/ActivityModal';
import { SecurityModal } from './components/SecurityModal';
import { SyncModal } from './components/SyncModal';
import { ExportImportModal } from './components/ExportImportModal';
import { GuidedTour } from './components/GuidedTour';
import { DashboardCustomizerModal } from './components/DashboardCustomizerModal';
import { SettingsView } from './components/SettingsView';
import { LockScreen } from './components/LockScreen';
import { DeviceFrame } from './components/DeviceFrame';
import { OfflineBanner, PWAInstallPrompt } from './components/OfflineBanner';
import { Activity } from './types/agenda';

const AgendaMain: React.FC = () => {
  const { isVaultLocked, selectedDate } = useAgenda();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [modalPresetDate, setModalPresetDate] = useState<string | undefined>(undefined);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false);

  const handleOpenNewActivity = (presetDate?: string) => {
    setEditingActivity(null);
    setModalPresetDate(presetDate || selectedDate);
    setIsActivityModalOpen(true);
  };

  return (
    <>
      <DeviceFrame>
      {/* If Vault is locked by E2EE/Biometrics, display security shield */}
      {isVaultLocked && <LockScreen />}

      <OfflineBanner />
      <PWAInstallPrompt />

      <Header
        onOpenNewActivity={() => handleOpenNewActivity()}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenExportImport={() => setIsExportImportModalOpen(true)}
        onOpenSettings={() => setActiveTab('settings')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenNewActivity={handleOpenNewActivity}
            onNavigateToCalendar={() => setActiveTab('calendar')}
            onNavigateToSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView onOpenNewActivity={handleOpenNewActivity} />
        )}

        {activeTab === 'widgets' && (
          <WidgetStudio onOpenNewActivity={() => handleOpenNewActivity()} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onOpenSecurity={() => setIsSecurityModalOpen(true)}
            onOpenSync={() => setIsSyncModalOpen(true)}
            onOpenExportImport={() => setIsExportImportModalOpen(true)}
          />
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Centro de Seguridad & Configuración
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Gestiona el cifrado de extremo a extremo, credenciales biométricas, y exportación de datos.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setIsSecurityModalOpen(true)}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-left hover:border-emerald-500 transition group"
                >
                  <span className="text-2xl mb-2 block">🛡️</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500">
                    Cifrado & Biometría
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Configura clave maestra AES-256 y autenticación por huella.
                  </p>
                </button>

                <button
                  onClick={() => setIsSyncModalOpen(true)}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-left hover:border-blue-500 transition group"
                >
                  <span className="text-2xl mb-2 block">📅</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500">
                    Google Calendar
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Sincronización bidireccional y cuenta vinculada.
                  </p>
                </button>

                <button
                  onClick={() => setIsExportImportModalOpen(true)}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-left hover:border-emerald-500 transition group"
                >
                  <span className="text-2xl mb-2 block">💾</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500">
                    Exportar / Importar
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Copias de seguridad en formato JSON y CSV para Excel.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewActivity={() => handleOpenNewActivity()}
      />
    </DeviceFrame>

    {/* Modals placed outside device frame for full-screen overlay */}
    <ActivityModal
      isOpen={isActivityModalOpen}
      onClose={() => setIsActivityModalOpen(false)}
      presetDate={modalPresetDate}
      initialActivity={editingActivity}
    />

    <SecurityModal
      isOpen={isSecurityModalOpen}
      onClose={() => setIsSecurityModalOpen(false)}
    />

    <SyncModal
      isOpen={isSyncModalOpen}
      onClose={() => setIsSyncModalOpen(false)}
    />

    <ExportImportModal
      isOpen={isExportImportModalOpen}
      onClose={() => setIsExportImportModalOpen(false)}
    />

    <GuidedTour />

    <DashboardCustomizerModal onOpenSettingsTab={() => setActiveTab('settings')} />
    </>
  );
};

export default function App() {
  return (
    <AgendaProvider>
      <AgendaMain />
    </AgendaProvider>
  );
}
