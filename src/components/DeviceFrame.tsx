import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const { preferences } = useAgenda();
  const { deviceShell } = preferences;

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (deviceShell === 'responsive') {
    return <div className="min-h-screen w-full flex flex-col">{children}</div>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 sm:p-6 bg-slate-950/90">
      <div
        className={`relative w-full max-w-[430px] h-[92vh] max-h-[890px] rounded-[52px] border-[10px] shadow-[0_25px_70px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transition-all duration-300 ${
          deviceShell === 'android'
            ? 'border-neutral-800 bg-slate-900 ring-2 ring-neutral-700/50'
            : 'border-neutral-900 bg-slate-900 ring-2 ring-neutral-800'
        }`}
      >
        {/* Device Status Bar */}
        <div className="relative z-30 shrink-0 h-10 px-6 flex items-center justify-between text-xs font-semibold text-slate-400 select-none bg-inherit">
          <span className="font-mono text-[11px]">{currentTime}</span>

          {/* Android Punch Hole or iOS Dynamic Island */}
          {deviceShell === 'android' ? (
            <div className="h-3.5 w-3.5 rounded-full bg-black border border-neutral-800 shadow-inner" />
          ) : (
            <div className="h-6 w-24 rounded-full bg-black flex items-center justify-between px-2 text-[10px] text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[9px] text-neutral-400">Chronos</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-400">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Device Screen Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
          {children}
        </div>

        {/* Device Bottom Indicator Bar */}
        <div className="h-5 w-full bg-inherit shrink-0 flex items-center justify-center select-none pb-1">
          <div
            className={`rounded-full bg-slate-400/40 ${
              deviceShell === 'android' ? 'w-20 h-1' : 'w-32 h-1'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
