import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore.ts';
import { 
  X, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface HandoverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HandoverFormModal: React.FC<HandoverFormModalProps> = ({ isOpen, onClose }) => {
  const { 
    activeChannelId, 
    carryoverCandidates, 
    submitHandover, 
    currentUser 
  } = useAppStore();

  const [shiftType, setShiftType] = useState<'Morning' | 'Evening' | 'Night'>('Evening');
  const [completedList, setCompletedList] = useState<string[]>([
    'Checked medication cart stock and refrigerated insulin units'
  ]);
  const [newCompletedText, setNewCompletedText] = useState('');

  // Pending tasks: initialize with carried-over candidates
  const [pendingList, setPendingList] = useState<Array<{
    text: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    ownerId?: string;
    dueAt?: string;
    originItemId?: string;
    carriedCount?: number;
  }>>([]);

  const [newPendingText, setNewPendingText] = useState('');
  const [newPendingPriority, setNewPendingPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [newPendingDue, setNewPendingDue] = useState('16:00');

  const [warningsList, setWarningsList] = useState<string[]>([
    'ALERT: Patient in Bed 304 requires fall risk precautions - bed alarms engaged'
  ]);
  const [newWarningText, setNewWarningText] = useState('');

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pre-fill carried over items from candidates on open
  useEffect(() => {
    if (carryoverCandidates.length > 0) {
      const carried = carryoverCandidates.map(c => ({
        text: c.text,
        priority: c.priority,
        dueAt: c.due_at || undefined,
        originItemId: c.id,
        carriedCount: c.carried_count
      }));
      setPendingList(carried);
    }
  }, [carryoverCandidates]);

  if (!isOpen) return null;

  const handleAddCompleted = () => {
    if (!newCompletedText.trim()) return;
    setCompletedList([...completedList, newCompletedText.trim()]);
    setNewCompletedText('');
  };

  const handleAddPending = () => {
    if (!newPendingText.trim()) return;
    setPendingList([
      ...pendingList, 
      {
        text: newPendingText.trim(),
        priority: newPendingPriority,
        dueAt: newPendingDue || undefined,
        carriedCount: 0
      }
    ]);
    setNewPendingText('');
  };

  const handleAddWarning = () => {
    if (!newWarningText.trim()) return;
    setWarningsList([...warningsList, newWarningText.trim()]);
    setNewWarningText('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    // Assemble all items
    const allItems: Array<{ kind: string; text: string; priority?: string; dueAt?: string; originItemId?: string; carriedCount?: number }> = [];

    completedList.forEach(t => allItems.push({ kind: 'completed', text: t }));
    pendingList.forEach(p => allItems.push({
      kind: 'pending',
      text: p.text,
      priority: p.priority,
      dueAt: p.dueAt,
      originItemId: p.originItemId,
      carriedCount: p.carriedCount
    }));
    warningsList.forEach(w => allItems.push({ kind: 'warning', text: w, priority: 'critical' }));

    const res = await submitHandover({
      channelId: activeChannelId,
      shiftType,
      items: allItems,
      notes
    });

    setIsSubmitting(false);
    if (!res.success) {
      setSubmitError(res.error || 'Failed to submit handover');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel-elevated w-full max-w-3xl max-h-[90vh] flex flex-col shadow-glass-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Create Structured Shift Handover</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Outgoing staff: <span className="font-semibold">{currentUser?.name}</span> • St. Jude ICU Unit
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {submitError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold">
              {submitError}
            </div>
          )}

          {/* Shift Type Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Shift Horizon
            </label>
            <div className="flex items-center gap-3">
              {(['Morning', 'Evening', 'Night'] as const).map(type => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setShiftType(type)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    shiftType === type
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/60'
                  }`}
                >
                  {type} Shift
                </button>
              ))}
            </div>
          </div>

          {/* Carried-Over / Pending Tasks Section */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Pending Tasks (Pre-Filled with Carried Over)</span>
              </label>
              <span className="text-[10px] text-slate-400">{pendingList.length} items</span>
            </div>

            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {pendingList.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 text-xs">
                  <div className="flex items-center gap-2 flex-1 truncate pr-2">
                    {item.carriedCount && item.carriedCount >= 3 ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-amber-500 text-slate-950">
                        STALE (x{item.carriedCount})
                      </span>
                    ) : item.originItemId ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        Carried Over
                      </span>
                    ) : null}
                    <span className="truncate font-medium">{item.text}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500">{item.priority}</span>
                    <button
                      type="button"
                      onClick={() => setPendingList(pendingList.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Pending Form */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <input
                type="text"
                value={newPendingText}
                onChange={e => setNewPendingText(e.target.value)}
                placeholder="Add a pending responsibility..."
                className="glass-input flex-1 px-3 py-1.5 text-xs min-w-[200px]"
              />
              <select
                value={newPendingPriority}
                onChange={e => setNewPendingPriority(e.target.value as any)}
                className="glass-input px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <input
                type="text"
                value={newPendingDue}
                onChange={e => setNewPendingDue(e.target.value)}
                placeholder="Due time (e.g. 17:00)"
                className="glass-input w-24 px-2.5 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={handleAddPending}
                className="glass-button px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Completed Tasks Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Completed Tasks</span>
              </label>
              <span className="text-[10px] text-slate-400">{completedList.length} items</span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
              {completedList.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs">
                  <span className="truncate pr-2">{c}</span>
                  <button
                    type="button"
                    onClick={() => setCompletedList(completedList.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newCompletedText}
                onChange={e => setNewCompletedText(e.target.value)}
                placeholder="Add action completed during your shift..."
                className="glass-input flex-1 px-3 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCompleted}
                className="glass-button px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Safety Warnings Section */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Safety Cautions & Clinical Warnings</span>
            </label>

            <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
              {warningsList.map((w, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300">
                  <span className="truncate pr-2 font-medium">{w}</span>
                  <button
                    type="button"
                    onClick={() => setWarningsList(warningsList.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-700 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newWarningText}
                onChange={e => setNewWarningText(e.target.value)}
                placeholder="e.g. ALERT: Patient has penicillin allergy or valve pressure leak..."
                className="glass-input flex-1 px-3 py-1.5 text-xs border-red-300 dark:border-red-800"
              />
              <button
                type="button"
                onClick={handleAddWarning}
                className="glass-button px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Warning</span>
              </button>
            </div>
          </div>

          {/* Operational Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Additional Shift Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Supply deliveries, incoming family visits, special physician rounding notes..."
              rows={2}
              className="glass-input p-3 text-xs w-full"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/20 dark:bg-slate-900/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Submitting...' : 'Submit Handover Card'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
