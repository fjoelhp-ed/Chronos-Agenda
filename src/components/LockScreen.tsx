import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { verifyBiometrics } from '../utils/biometrics';

export const LockScreen: React.FC = () => {
  const { unlockVault, preferences } = useAgenda();
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passphrase.trim()) {
      setError('Introduce tu clave maestra o PIN para descifrar');
      return;
    }
    setError(null);
    setIsVerifying(true);
    const success = await unlockVault(passphrase);
    setIsVerifying(false);
    if (!success) {
      setError('Clave incorrecta. Los datos no se pudieron descifrar.');
    }
  };

  const handleBiometricClick = async () => {
    setError(null);
    setIsVerifying(true);
    try {
      const bioSuccess = await verifyBiometrics();
      if (bioSuccess) {
        // Biometrics verified, try stored session key or prompt master key
        const savedKey = sessionStorage.getItem('chronos_session_vault_key');
        if (savedKey) {
          const success = await unlockVault(savedKey);
          if (success) return;
        }
        setError('Biometría verificada. Por favor introduce tu clave maestra por primera vez en esta sesión.');
      }
    } catch {
      setError('Verificación biométrica no disponible o cancelada. Usa tu clave maestra.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 text-emerald-400">
          <ShieldCheck className="h-10 w-10 animate-pulse" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white">Bóveda Cifrada</h2>
        <p className="mt-1 text-xs text-emerald-400 font-mono flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5" /> Cifrado AES-256-GCM Activo
        </p>
        <p className="mt-3 text-sm text-slate-400">
          Tus actividades, notas y calendario están protegidos con cifrado de extremo a extremo.
        </p>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-left text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="mt-6 space-y-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                setError(null);
              }}
              placeholder="Introduce clave maestra o PIN"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] disabled:opacity-50"
          >
            {isVerifying ? 'Descifrando datos...' : 'Descifrar y Entrar'}
          </button>
        </form>

        {preferences.biometricsEnabled && (
          <div className="mt-6 border-t border-slate-800/80 pt-6">
            <button
              type="button"
              onClick={handleBiometricClick}
              disabled={isVerifying}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <Fingerprint className="h-4 w-4 text-emerald-400" />
              Desbloquear con Huella o Face ID
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
