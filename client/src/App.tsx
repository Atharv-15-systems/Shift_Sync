import { useEffect, useState } from 'react';
import { useAppStore, applyThemeSettings } from './store/useAppStore.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { HandoverView } from './components/HandoverView.tsx';
import { ChatView } from './components/ChatView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { HandoverFormModal } from './components/HandoverFormModal.tsx';
import { JudgeTourBanner } from './components/JudgeTourBanner.tsx';
import { Siren } from 'lucide-react';

export default function App() {
  const { 
    fetchInitialData, 
    activeTab, 
    preferences, 
    activeEmergency, 
    dismissEmergency 
  } = useAppStore();
  const [isNewHandoverOpen, setIsNewHandoverOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    applyThemeSettings(preferences);
  }, [preferences]);

  return (
    <div className="flex flex-col h-screen overflow-hidden p-4 md:p-6 select-none">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* 60-Second Judge Guided Hackathon Tour Banner */}
      <JudgeTourBanner />

      {/* Active Emergency Broadcast Alert Banner */}
      {activeEmergency && (
        <div className="mb-4 p-4 rounded-2xl bg-red-600/20 border-2 border-red-500/80 shadow-2xl backdrop-blur-xl animate-pulse flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center animate-bounce shrink-0">
              <Siren className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                  🚨 ACTIVE EMERGENCY BROADCAST ({activeEmergency.severity.replace('_', ' ').toUpperCase()})
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Dispatched by {activeEmergency.senderName}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {activeEmergency.title}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {activeEmergency.details}
              </p>
            </div>
          </div>
          <button
            onClick={dismissEmergency}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/20 dark:bg-black/30 hover:bg-white/40 text-slate-900 dark:text-white border border-white/20 transition-all shrink-0"
          >
            Acknowledge & Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace (3-Pane Layout) */}
      <div className="flex-1 flex flex-col md:flex-row gap-5 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar onOpenNewHandover={() => setIsNewHandoverOpen(true)} />

        {/* Center Main Stage */}
        <main className="flex-1 flex overflow-hidden">
          {activeTab === 'handover' && <HandoverView />}
          {activeTab === 'chat' && <ChatView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Handover Creation Modal */}
      <HandoverFormModal 
        isOpen={isNewHandoverOpen} 
        onClose={() => setIsNewHandoverOpen(false)} 
      />
    </div>
  );
}
