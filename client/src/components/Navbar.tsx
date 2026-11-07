import React from 'react';
import { useAppStore } from '../store/useAppStore.ts';
import { 
  Layers, 
  RotateCcw, 
  Sun, 
  Moon, 
  Wifi, 
  WifiOff
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    users, 
    loginAsUser, 
    preferences, 
    updatePreferences, 
    resetDemoData, 
    nexconnStatus,
    isLoading
  } = useAppStore();

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    loginAsUser(e.target.value);
  };

  const toggleDarkMode = () => {
    updatePreferences({ is_dark: preferences.is_dark ? 0 : 1 });
  };

  // Status pill indicator rendering
  const renderNexconnStatus = () => {
    if (nexconnStatus.status === 'connected') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Wifi className="w-3.5 h-3.5" />
          <span>Nexconn Live</span>
        </div>
      );
    }
    if (nexconnStatus.status === 'connecting') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse">
          <RotateCcw className="w-3.5 h-3.5 animate-spin" />
          <span>Connecting...</span>
        </div>
      );
    }
    return (
      <div 
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
        title={nexconnStatus.detail || 'Nexconn credentials unconfigured in .env'}
      >
        <WifiOff className="w-3.5 h-3.5" />
        <span>Nexconn: Standby</span>
      </div>
    );
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 glass-panel px-6 py-3.5 mb-5 shadow-glass-sm transition-all duration-300">
      {/* Brand & Shift Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight">ShiftSync</h1>
            <span className="px-2 py-0.5 text-[10px] uppercase font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Pro Care
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>St. Jude ICU</span>
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Day Shift (07:00 – 15:30)</span>
          </p>
        </div>
      </div>

      {/* Center status indicators */}
      <div className="flex items-center gap-3">
        {renderNexconnStatus()}

        {/* 1-Click Load Hospital Demo */}
        <button
          onClick={resetDemoData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          title="Reset and load standard 60-second judge demo scenario"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* Right Controls: User Switcher & Dark Mode */}
      <div className="flex items-center gap-3">
        {/* User Switcher */}
        <div className="flex items-center gap-2 glass-pill px-3 py-1.5">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
            style={{ backgroundColor: currentUser?.avatar_color || '#3b82f6' }}
          >
            {currentUser?.name.charAt(0) || 'U'}
          </div>

          <select
            value={currentUser?.id || ''}
            onChange={handleUserChange}
            className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id} className="text-slate-900 bg-white dark:bg-slate-800 dark:text-slate-100">
                {u.name} ({u.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="glass-button p-2 rounded-xl text-slate-700 dark:text-slate-200"
          aria-label="Toggle theme mode"
          title="Toggle light / dark mode"
        >
          {preferences.is_dark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>
      </div>
    </header>
  );
};
