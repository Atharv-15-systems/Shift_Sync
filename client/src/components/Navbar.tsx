import React, { useState } from 'react';
import { useAppStore, IndustryType } from '../store/useAppStore.ts';
import { EmergencyBroadcastModal } from './EmergencyBroadcastModal.tsx';
import { 
  Layers, 
  RotateCcw, 
  Sun, 
  Moon, 
  Wifi, 
  WifiOff,
  Siren,
  Building2
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
    isLoading,
    activeIndustry,
    switchIndustry,
    channels,
    activeChannelId
  } = useAppStore();

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    loginAsUser(e.target.value);
  };

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchIndustry(e.target.value as IndustryType);
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
        title={nexconnStatus.detail || 'Nexconn credentials in standby'}
      >
        <WifiOff className="w-3.5 h-3.5" />
        <span>Nexconn: Standby</span>
      </div>
    );
  };

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 glass-panel px-6 py-3.5 mb-3 shadow-glass-sm transition-all duration-300">
        {/* Brand & Shift Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">ShiftSync</h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Competition Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>{activeChannel?.workspace_name || 'Enterprise'}</span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active Shift Operations</span>
            </p>
          </div>
        </div>

        {/* Center: Multi-Industry Switcher & Emergency Alert */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Industry Preset Switcher */}
          <div className="flex items-center gap-1.5 glass-pill px-3 py-1.5 border border-indigo-500/20">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={activeIndustry}
              onChange={handleIndustryChange}
              disabled={isLoading}
              className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer pr-1"
            >
              <option value="healthcare" className="text-slate-900 bg-white dark:bg-slate-800 dark:text-slate-100">
                🏥 Healthcare (ICU Acute Care)
              </option>
              <option value="hospitality" className="text-slate-900 bg-white dark:bg-slate-800 dark:text-slate-100">
                🏨 Hospitality (Grand Hyatt Hotel)
              </option>
              <option value="cloudops" className="text-slate-900 bg-white dark:bg-slate-800 dark:text-slate-100">
                💻 CloudOps (24/7 SRE Infra)
              </option>
            </select>
          </div>

          {/* Emergency Alert Button */}
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow-sm shadow-red-500/20 transition-all hover:scale-105 active:scale-95 animate-pulse"
            title="Dispatch high-priority incident broadcast to shift team"
          >
            <Siren className="w-3.5 h-3.5" />
            <span>Emergency Alert</span>
          </button>

          {renderNexconnStatus()}

          {/* 1-Click Load Hospital Demo */}
          <button
            onClick={resetDemoData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
            title="Reset and load fresh demonstration baseline"
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

      {/* Emergency Broadcast Dispatch Modal */}
      <EmergencyBroadcastModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </>
  );
};
