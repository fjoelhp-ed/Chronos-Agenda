import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  WifiOff,
  Clock,
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import {
  signInWithGoogleCalendar,
  getGoogleAccessToken,
  logoutGoogle,
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
  auth,
} from '../services/googleCalendar';
import { soundHaptics } from '../utils/soundHaptics';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const { activities, addActivity, updatePreferences, preferences } = useAgenda();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setError(null);
    setIsSyncing(true);
    try {
      const res = await signInWithGoogleCalendar();
      if (res) {
        setCurrentUser(res.user);
        setSyncStatus(`Conectado como ${res.user.email}`);
        soundHaptics.playSuccessChime();
      }
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncNow = async () => {
    setError(null);
    setIsSyncing(true);
    setSyncStatus('Consultando Google Calendar...');

    try {
      const events = await fetchGoogleCalendarEvents();
      let importedCount = 0;

      for (const item of events) {
        // Check if already in activities
        const exists = activities.some(
          (a) => a.googleEventId === item.id || (a.title === item.summary && a.date === (item.start.date || item.start.dateTime?.slice(0, 10)))
        );

        if (!exists && item.summary) {
          const eventDate = item.start.date || item.start.dateTime?.slice(0, 10) || new Date().toISOString().slice(0, 10);
          const startT = item.start.dateTime ? item.start.dateTime.slice(11, 16) : undefined;
          const endT = item.end.dateTime ? item.end.dateTime.slice(11, 16) : undefined;

          await addActivity({
            title: item.summary,
            description: item.description,
            type: 'event',
            date: eventDate,
            startTime: startT,
            endTime: endT,
            completed: false,
            priority: 'medium',
            categoryId: 'work',
            googleEventId: item.id,
            isSyncedWithGoogle: true,
            reminderMinutesBefore: 15,
          });
          importedCount++;
        }
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updatePreferences({ lastGoogleSync: nowTime });
      setSyncStatus(`¡Sincronización completada! ${importedCount} nuevos eventos importados.`);
      soundHaptics.playSuccessChime();
    } catch (err: any) {
      setError(err?.message || 'Error durante la sincronización con Google Calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setSyncStatus('Sesión cerrada');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sincronización con Google Calendar
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {syncStatus && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}

          {/* Account Status Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Estado de la Cuenta
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentUser
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {currentUser ? 'VINCULADO' : 'NO CONECTADO'}
              </span>
            </div>

            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || ''}
                      className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center">
                      {currentUser.email?.[0]?.toUpperCase() || 'G'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {currentUser.displayName || 'Usuario de Google'}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
                  </div>
                </div>

                {preferences.lastGoogleSync && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> Última sincronización: {preferences.lastGoogleSync}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSyncNow}
                    disabled={isSyncing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Desconectar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Conecta tu cuenta de Google para sincronizar tus eventos automáticamente entre Chronos y Google Calendar.
                </p>

                {/* Google Official Styled Button */}
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSyncing}
                  className="mx-auto flex items-center gap-3 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-xs disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>Iniciar sesión con Google</span>
                </button>
              </div>
            )}
          </div>

          {/* Privacy & Offline Resiliency Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/40 text-xs text-slate-500 dark:text-slate-400">
            <WifiOff className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <span>
              <strong>Rendimiento Offline:</strong> La aplicación siempre funciona sin conexión. Si pierdes internet, todos tus cambios se guardan localmente y se sincronizan cuando vuelvas a conectarte.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
