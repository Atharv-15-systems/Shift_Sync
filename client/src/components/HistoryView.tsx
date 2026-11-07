import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore.ts';
import { 
  Search, 
  Printer, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { handovers, setActiveHandoverId, setActiveTab } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');

  const filteredHandovers = handovers.filter((h) => {
    const matchesSearch = 
      h.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.items.some(i => i.text.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || h.status === selectedStatus;
    const matchesShift = selectedShift === 'all' || h.shift_type === selectedShift;

    return matchesSearch && matchesStatus && matchesShift;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSelectHandover = (id: string) => {
    setActiveHandoverId(id);
    setActiveTab('handover');
  };

  return (
    <div className="flex-1 glass-panel shadow-glass-sm p-6 overflow-y-auto flex flex-col gap-6">
      {/* Header and Print Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Shift Handover Timeline & History</h2>
          <p className="text-xs text-slate-500 mt-0.5">Auditable historical records of shift transitions and task carry-overs</p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/70 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-xs transition-all hover:-translate-y-0.5"
          title="Print or export current timeline as PDF"
        >
          <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          <span>Print / PDF Export</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords, clinical items, medications, staff names..."
            className="glass-input w-full pl-9 pr-4 py-2 text-xs"
          />
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="glass-input px-3 py-2 text-xs font-semibold cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="closed">Closed</option>
          <option value="draft">Draft</option>
        </select>

        {/* Shift Filter */}
        <select
          value={selectedShift}
          onChange={(e) => setSelectedShift(e.target.value)}
          className="glass-input px-3 py-2 text-xs font-semibold cursor-pointer"
        >
          <option value="all">All Shifts</option>
          <option value="Morning">Morning Shift</option>
          <option value="Evening">Evening Shift</option>
          <option value="Night">Night Shift</option>
        </select>
      </div>

      {/* Timeline List */}
      <div className="flex flex-col gap-4">
        {filteredHandovers.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No shift handovers match the search and filter criteria.
          </div>
        ) : (
          filteredHandovers.map((h) => {
            const warningCount = h.items.filter(i => i.kind === 'warning').length;
            const pendingCount = h.items.filter(i => i.kind === 'pending').length;
            const completedCount = h.items.filter(i => i.kind === 'completed').length;
            const isAck = h.acknowledgements.some(a => a.status === 'acknowledged' || a.status === 'override');

            return (
              <div
                key={h.id}
                className="glass-panel p-5 flex flex-col gap-3 transition-all hover:border-blue-500/40 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: h.author_avatar || '#2563eb' }}
                    >
                      {h.author_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {h.shift_type} Shift Handover
                        </span>
                        <span className={`px-2 py-0.2 rounded text-[9px] uppercase font-bold ${
                          isAck 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {h.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {h.author_name} • {new Date(h.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectHandover(h.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-all"
                  >
                    <span>View Handover</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Summary snippet */}
                {h.summary && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {h.summary}
                  </p>
                )}

                {/* Metrics chips */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> {completedCount} Completed
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                    <Clock className="w-3 h-3" /> {pendingCount} Pending
                  </span>
                  {warningCount > 0 && (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                      <AlertTriangle className="w-3 h-3" /> {warningCount} Warnings
                    </span>
                  )}
                  <span>
                    Acknowledgements: {h.acknowledgements.length} recorded
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
