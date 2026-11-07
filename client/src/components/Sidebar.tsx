import React from 'react';
import { useAppStore } from '../store/useAppStore.ts';
import { 
  FileText, 
  MessageSquare, 
  History, 
  Sliders, 
  PlusCircle, 
  Hash
} from 'lucide-react';

interface SidebarProps {
  onOpenNewHandover: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenNewHandover }) => {
  const { 
    channels, 
    activeChannelId, 
    setActiveChannelId, 
    activeTab, 
    setActiveTab, 
    users, 
    currentUser 
  } = useAppStore();

  return (
    <aside className="w-full md:w-64 flex flex-col gap-5 glass-panel p-4 shadow-glass-sm shrink-0">
      {/* Primary Action: Draft / Submit Handover */}
      <button
        onClick={onOpenNewHandover}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Create Shift Handover</span>
      </button>

      {/* Navigation Tabs */}
      <nav className="flex flex-col gap-1">
        <button
          onClick={() => setActiveTab('handover')}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'handover'
              ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Active Handover</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'chat'
              ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Real-Time Channels</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Shift History & Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'settings'
              ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Liquid Glass Appearance</span>
        </button>
      </nav>

      {/* Channels List */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
          Shift Channels
        </div>
        <div className="flex flex-col gap-1">
          {channels.map((chan) => (
            <button
              key={chan.id}
              onClick={() => {
                setActiveChannelId(chan.id);
                if (activeTab !== 'chat' && activeTab !== 'handover') {
                  setActiveTab('handover');
                }
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                activeChannelId === chan.id
                  ? 'bg-white/80 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{chan.name}</span>
              </div>
              {chan.type === 'shift' && (
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                  Shift
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* On-Duty Care Team */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 mt-auto">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 flex items-center justify-between">
          <span>Active Staff</span>
          <span className="text-[10px] text-emerald-500 font-semibold">3 Online</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {users.map((u) => {
            const isSelf = u.id === currentUser?.id;
            return (
              <div
                key={u.id}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs"
              >
                <div className="relative">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: u.avatar_color }}
                  >
                    {u.name.charAt(0)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-medium truncate text-slate-800 dark:text-slate-200">
                    {u.name} {isSelf && <span className="text-blue-500 text-[10px]">(You)</span>}
                  </span>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">
                    {u.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
