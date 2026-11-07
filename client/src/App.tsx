import { useState, useEffect } from 'react';
import { Layers, Activity, Users, ShieldAlert, Sun, Moon } from 'lucide-react';

export default function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="flex flex-col min-h-screen p-6">
      <header className="flex items-center justify-between glass-panel px-6 py-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ShiftSync</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Structured Handover & Real-Time Collaboration</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="glass-button p-2.5 rounded-xl text-slate-700 dark:text-slate-200"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2 font-semibold">
              <Activity className="w-5 h-5" />
              <span>Shift Handover</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Structured reports for incoming staff with completed tasks, pending priorities, and risk warnings.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-500">
            Phase 1 Foundation Ready
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2 font-semibold">
              <Users className="w-5 h-5" />
              <span>Real-Time Channels</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Nexconn Chat SDK integration for department channels, shift threads, and 1-on-1 direct messages.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-500">
            Nexconn Client Adapter Ready
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2 font-semibold">
              <ShieldAlert className="w-5 h-5" />
              <span>Risk Intelligence</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Rule-based safety threat detection working completely offline, with carry-over task tracking.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-500">
            Zero External API Blocker
          </div>
        </div>
      </main>
    </div>
  );
}
