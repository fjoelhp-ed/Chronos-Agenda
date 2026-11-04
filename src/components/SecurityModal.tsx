import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Fingerprint,
  KeyRound,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  Vibrate,
  Smartphone,
} from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import {
  checkBiometricSupport,
  enrollBiometrics,
  verifyBiometrics,
  clearBiometrics,
} from '../utils/biometrics';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  const {
    preferences,
    updatePreferences,
    hasPassphrase,
    setupEncryption,
    disableEncryption,
    lockVault,
  } = useAgenda();

  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [bioSupported, setBioSupported] = useState(false);
  const [bioEnrolled, setBioEnrolled] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkBiometricSupport().then((res) => {
      setBioSupported(res.isAvailable);
      setBioEnrolled(res.isEnrolled);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSetupE2EE = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase || passphrase.length < 6) {
      setStatusMessage({ text: 'La clave maestra debe tener al menos 6 caracteres', type: 'error' });
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setStatusMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      await setupEncryption(passphrase);
      setStatusMessage({ text: '¡Cifrado AES-256-GCM activado con éxito!', type: 'success' });
      setPassphrase('');
      setConfirmPassphrase('');
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Error al configurar el cifrado', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisableE2EE = async () => {
    if (window.confirm('¿Seguro que deseas desactivar el cifrado local de la agenda?')) {
      await disableEncryption();
      setStatusMessage({ text: 'Cifrado desactivado. Datos guardados en almacenamiento local estándar.', type: 'success' });
    }
  };

  const handleEnrollBiometrics = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const success = await enrollBiometrics();
      if (success) {
        setBioEnrolled(true);
        updatePreferences({ biometricsEnabled: true });
        setStatusMessage({ text: 'Biometría (Huella / Face ID) vinculada correctamente', type: 'success' });
      } else {
        setStatusMessage({ text: 'No se pudo completar la autenticación biométrica', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Error durante el registro biométrico', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestBiometrics = async () => {
    setStatusMessage(null);
    try {
      const verified = await verifyBiometrics();
      if (verified) {
        setStatusMessage({ text: '¡Huella o rostro autenticado exitosamente!', type: 'success' });
      }
    } catch {
      setStatusMessage({ text: 'Verificación biométrica rechazada o cancelada', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Seguridad, Cifrado y Privacidad Total
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {statusMessage && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-xs border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Section: AES-256 E2EE */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  Cifrado de Extremo a Extremo (E2EE)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Protege tus datos con algoritmo AES-256-GCM y PBKDF2 (100.000 iteraciones).
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hasPassphrase
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {hasPassphrase ? 'ACTIVO' : 'SIN CIFRAR'}
              </span>
            </div>

            {hasPassphrase ? (
              <div className="space-y-3 pt-2">
                <div className="text-xs text-slate-600 dark:text-slate-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                  Tus actividades y notas están cifradas en tu dispositivo. Nadie puede leerlas sin tu clave maestra.
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      lockVault();
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Bloquear Bóveda Ahora
                  </button>
                  <button
                    type="button"
                    onClick={handleDisableE2EE}
                    className="py-2 px-3 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    Desactivar Cifrado
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSetupE2EE} className="space-y-3 pt-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Elige una clave maestra o PIN para cifrar todo el almacenamiento local de tu agenda:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="password"
                    placeholder="Clave maestra (mín. 6 car.)"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar clave"
                    value={confirmPassphrase}
                    onChange={(e) => setConfirmPassphrase(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition"
                >
                  {isProcessing ? 'Generando claves...' : 'Activar Bóveda Cifrada'}
                </button>
              </form>
            )}
          </div>

          {/* Section: Optional Biometric Auth */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-500" />
                  Autenticación Biométrica (Opcional)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Usa tu sensor de huella dactilar de Android o Face ID / Touch ID de iOS.
                </p>
              </div>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleEnrollBiometrics}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 text-xs font-semibold hover:bg-slate-800 transition"
              >
                <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                {bioEnrolled ? 'Re-vincular Biometría' : 'Activar Huella / Biometría'}
              </button>
              {bioEnrolled && (
                <button
                  type="button"
                  onClick={handleTestBiometrics}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Probar Sensor
                </button>
              )}
            </div>
          </div>

          {/* Section: Device Feedback & Haptics */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-emerald-500" />
              Respuesta Háptica & Sonidos Nativos
            </h4>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Vibración háptica al completar actividades (Android)
                </span>
                <input
                  type="checkbox"
                  checked={preferences.vibrationEnabled}
                  onChange={(e) => updatePreferences({ vibrationEnabled: e.target.checked })}
                  className="h-4 w-4 rounded accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Efectos de sonido sintetizados nativos
                </span>
                <input
                  type="checkbox"
                  checked={preferences.soundEnabled}
                  onChange={(e) => updatePreferences({ soundEnabled: e.target.checked })}
                  className="h-4 w-4 rounded accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700 dark:text-slate-300">
                  Notificaciones push activas
                </span>
                <input
                  type="checkbox"
                  checked={preferences.notificationsEnabled}
                  onChange={(e) => updatePreferences({ notificationsEnabled: e.target.checked })}
                  className="h-4 w-4 rounded accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
