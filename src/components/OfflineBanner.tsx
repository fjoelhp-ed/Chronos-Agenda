import React, { useState } from 'react';
import { WifiOff, Download, Sparkles, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../utils/usePWAInstall';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 text-white px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-md animate-bounce">
      <WifiOff className="w-4 h-4" />
      <span>Modo Offline: Operando con almacenamiento local cifrado</span>
    </div>
  );
};

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  if (isInstallable) {
    return (
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Instala Chronos Agenda en tu pantalla de inicio para una experiencia nativa fluida.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={install}
            className="px-3 py-1 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition"
          >
            Instalar App
          </button>
          <button onClick={() => setDismissed(true)} className="p-1 opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-2 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Instala en iPhone / iPad tocando Compartir y &quot;Añadir a pantalla de inicio&quot;.</span>
          </div>
          <button
            onClick={() => setShowIOSModal(true)}
            className="px-2.5 py-1 bg-blue-600 text-white font-semibold rounded-lg text-[11px]"
          >
            Ver Guía
          </button>
        </div>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="max-w-sm w-full rounded-2xl bg-white dark:bg-slate-900 p-6 text-slate-800 dark:text-slate-100">
              <h3 className="text-base font-bold mb-2">Instalar en iOS</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                1. Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.<br />
                2. Desplázate hacia abajo y selecciona <strong>Añadir a pantalla de inicio</strong>.
              </p>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
