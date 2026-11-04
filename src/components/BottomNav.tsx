import React from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Smartphone,
  ShieldCheck,
  Settings,
  Plus,
} from 'lucide-react';
import { soundHaptics } from '../utils/soundHaptics';

export type ActiveTab = 'dashboard' | 'calendar' | 'widgets' | 'security' | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenNewActivity: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenNewActivity,
}) => {
  const handleNav = (tab: ActiveTab) => {
    soundHaptics.triggerHaptic(10);
    onTabChange(tab);
  };

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar' as ActiveTab, label: 'Calendario', icon: CalendarIcon },
    { id: 'widgets' as ActiveTab, label: 'Widgets', icon: Smartphone },
    { id: 'settings' as ActiveTab, label: 'Ajustes', icon: Settings },
    { id: 'security' as ActiveTab, label: 'Privacidad', icon: ShieldCheck },
  ];

  return (
    <nav className="sticky bottom-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 sm:py-2.5 transition-colors">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition duration-200 ${
                isActive
                  ? 'text-emerald-500 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
