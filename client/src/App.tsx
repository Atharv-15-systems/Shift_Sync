import { useEffect, useState } from 'react';
import { useAppStore, applyThemeSettings } from './store/useAppStore.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { HandoverView } from './components/HandoverView.tsx';
import { ChatView } from './components/ChatView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { HandoverFormModal } from './components/HandoverFormModal.tsx';

export default function App() {
  const { fetchInitialData, activeTab, preferences } = useAppStore();
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
