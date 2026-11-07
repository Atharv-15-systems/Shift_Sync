import React, { useState } from 'react';
import { useAppStore, Handover } from '../store/useAppStore.ts';
import { VoiceDebriefPlayer } from './VoiceDebriefPlayer.tsx';
import { ComplianceGauge } from './ComplianceGauge.tsx';
import { playSuccessChime, playHapticClick } from '../lib/audioEffects.ts';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Lock, 
  Send, 
  AlertCircle,
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';

export const HandoverView: React.FC = () => {
  const { 
    handovers, 
    activeHandoverId, 
    currentUser, 
    acknowledgeHandover, 
    overrideHandover, 
    closeShift, 
    resolveItem,
    messages,
    sendChatMessage
  } = useAppStore();

  const [commentText, setCommentText] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Active handover or first available
  const handover: Handover | undefined = handovers.find(h => h.id === activeHandoverId) || handovers[0];

  if (!handover) {
    return (
      <div className="flex-1 glass-panel p-10 flex flex-col items-center justify-center text-center">
        <FileText className="w-12 h-12 text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Handover Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          No handovers are registered for this channel yet. Click "Create Shift Handover" in the sidebar to start one.
        </p>
      </div>
    );
  }

  const completedItems = handover.items.filter(i => i.kind === 'completed');
  const pendingItems = handover.items.filter(i => i.kind === 'pending');
  const warningItems = handover.items.filter(i => i.kind === 'warning');

  // Has at least one valid acknowledgement (or manager override)
  const isAcknowledged = handover.acknowledgements.some(a => a.status === 'acknowledged' || a.status === 'override');
  const isClosed = handover.status === 'closed';

  // Check if current user has already acknowledged
  const userHasAcknowledged = handover.acknowledgements.some(
    a => a.user_id === currentUser?.id && a.status === 'acknowledged'
  );

  const handleAcknowledge = async () => {
    setActionError(null);
    setActionSuccess(null);
    const res = await acknowledgeHandover(handover.id, 'Shift reviewed and acknowledged by incoming staff.');
    if (!res.success) {
      setActionError(res.error || 'Failed to acknowledge');
    } else {
      playSuccessChime();
      setActionSuccess('Handover successfully acknowledged.');
    }
  };

  const handleCloseShift = async () => {
    setActionError(null);
    setActionSuccess(null);
    const res = await closeShift(handover.id);
    if (!res.success) {
      setActionError(res.error || 'Shift closure blocked');
    } else {
      setActionSuccess('Shift formally closed and archived.');
    }
  };

  const handleManagerOverride = async () => {
    if (!overrideReason.trim()) return;
    setActionError(null);
    const res = await overrideHandover(handover.id, overrideReason.trim());
    if (!res.success) {
      setActionError(res.error || 'Override failed');
    } else {
      setShowOverrideModal(false);
      setOverrideReason('');
      setActionSuccess('Administrative override executed.');
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await sendChatMessage(commentText);
    setCommentText('');
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">High</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">Low</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Medium</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
      {/* Handover Hero Card */}
      <div className="glass-panel p-6 shadow-glass-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-md"
              style={{ backgroundColor: handover.author_avatar || '#2563eb' }}
            >
              {handover.author_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {handover.shift_type} Shift Handover
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${
                  isClosed
                    ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                    : isAcknowledged
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                  {handover.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Prepared by <span className="font-semibold text-slate-800 dark:text-slate-200">{handover.author_name}</span> ({handover.author_role.toUpperCase()})
                {handover.submitted_at && <span> • {new Date(handover.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
              </p>
            </div>
          </div>

          {/* Acknowledgement Status Callout */}
          <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 px-3.5 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <div className={`w-2 h-2 rounded-full ${isAcknowledged ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-amber-500 ring-4 ring-amber-500/20 animate-pulse'}`} />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isClosed ? 'Shift Formally Closed' : isAcknowledged ? 'Acknowledged by Incoming Team' : 'Pending Incoming Acknowledgement'}
            </span>
          </div>
        </div>

        {/* Feedback alerts */}
        {actionError && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Voice Debrief Audio Player */}
        <div className="mt-4">
          <VoiceDebriefPlayer 
            authorName={handover.author_name} 
            summaryText={handover.summary || 'Shift handover briefing for incoming staff.'} 
          />
        </div>

        {/* Risk Intelligence Banner (Offline Rule-Based) */}
        {handover.risks && handover.risks.length > 0 && (
          <div className="mt-5 p-4 rounded-xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20">
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Safety Threats & Priority Flags Detected (Offline Intelligence)</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {handover.risks.map((risk, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                  <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-red-500/20 shrink-0 mt-0.5">
                    {risk.severity}
                  </span>
                  <span>{risk.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structured 3-Line Summary */}
        {handover.summary && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-medium">
            {handover.summary}
          </div>
        )}

        {/* Notes */}
        {handover.notes && (
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic">
            <span className="font-semibold not-italic text-slate-700 dark:text-slate-300">Notes: </span>
            {handover.notes}
          </div>
        )}
      </div>

      {/* JCAHO / OSHA Shift Safety Compliance Gauge */}
      <ComplianceGauge />

      {/* Main Grid: Pending (with Carry-overs) & Completed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending & Carried-Over Tasks */}
        <div className="glass-panel p-5 flex flex-col gap-3 shadow-glass-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Pending Responsibilities ({pendingItems.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Click checkmark to resolve</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {pendingItems.map((item) => (
              <div 
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  item.resolved === 1
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60'
                    : item.carried_count >= 3
                    ? 'bg-amber-500/5 border-amber-500/30 shadow-xs'
                    : 'bg-white/60 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1">
                    <button
                      onClick={() => {
                        playHapticClick();
                        resolveItem(item.id);
                      }}
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-all ${
                        item.resolved === 1
                          ? 'bg-emerald-500 text-white'
                          : 'border border-slate-400 hover:border-emerald-500 text-transparent'
                      }`}
                      aria-label="Toggle resolved"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs font-medium leading-snug ${
                        item.resolved === 1 ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {item.text}
                      </span>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                        {item.due_at && (
                          <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
                            <Clock className="w-3 h-3" /> Due: {item.due_at}
                          </span>
                        )}
                        {item.owner_name && (
                          <span>Assignee: <span className="font-semibold">{item.owner_name}</span></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {getPriorityBadge(item.priority)}
                    {item.carried_count >= 3 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-extrabold bg-amber-500 text-slate-950 shadow-xs animate-pulse" title="Task open across 3 or more shifts without resolution">
                        STALE (x{item.carried_count})
                      </span>
                    )}
                    {item.carried_count > 0 && item.carried_count < 3 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Carried x{item.carried_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Tasks & Warnings */}
        <div className="flex flex-col gap-5">
          {/* Completed Tasks */}
          <div className="glass-panel p-5 flex flex-col gap-3 shadow-glass-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Completed Shift Actions ({completedItems.length})
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {completedItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings List */}
          {warningItems.length > 0 && (
            <div className="glass-panel p-5 flex flex-col gap-3 shadow-glass-sm border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Safety Cautions & Clinical Warnings ({warningItems.length})
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {warningItems.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-700 dark:text-red-300 font-medium leading-relaxed">
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Acknowledgement Trail & Action Controls */}
      <div className="glass-panel p-6 shadow-glass-sm flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Audit & Acknowledgement Log
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live timestamps recorded for legal and hospital accreditation standards.
            </p>
          </div>

          {/* Action Buttons based on User Role */}
          <div className="flex items-center gap-2.5">
            {/* Incoming nurse acknowledge */}
            {currentUser?.role === 'incoming' && !isClosed && (
              <button
                onClick={handleAcknowledge}
                disabled={userHasAcknowledged}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  userHasAcknowledged
                    ? 'bg-emerald-500/20 text-emerald-600 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{userHasAcknowledged ? 'Handover Acknowledged' : 'Acknowledge Handover'}</span>
              </button>
            )}

            {/* Outgoing nurse close shift */}
            {currentUser?.role === 'outgoing' && !isClosed && (
              <button
                onClick={handleCloseShift}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Close Shift</span>
              </button>
            )}

            {/* Charge nurse manager override */}
            {currentUser?.role === 'manager' && !isClosed && (
              <button
                onClick={() => setShowOverrideModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Manager Override</span>
              </button>
            )}
          </div>
        </div>

        {/* Log Entries */}
        <div className="flex flex-col gap-2">
          {handover.acknowledgements.length === 0 ? (
            <div className="text-xs text-slate-400 italic py-2">
              No staff members have acknowledged this handover yet.
            </div>
          ) : (
            handover.acknowledgements.map((ack, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: ack.user_avatar || '#059669' }}
                  >
                    {ack.user_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{ack.user_name}</span>
                      <span className={`px-2 py-0.2 rounded text-[9px] uppercase font-bold ${
                        ack.status === 'override'
                          ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                          : ack.status === 'acknowledged'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {ack.status}
                      </span>
                    </div>
                    {ack.note && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{ack.note}</p>}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400">
                  {new Date(ack.at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Handover Real-Time Discussion Thread (Nexconn Chat SDK integration) */}
      <div className="glass-panel p-5 shadow-glass-sm flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
          Handover Discussion Thread (Nexconn Real-Time Channel)
        </h3>

        <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2.5 text-xs">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                style={{ backgroundColor: msg.senderAvatar || '#3b82f6' }}
              >
                {msg.senderName.charAt(0)}
              </div>
              <div className="flex flex-col p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{msg.senderName}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comment input */}
        <form onSubmit={handleSendComment} className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Post a comment or inquiry to the shift thread..."
            className="glass-input flex-1 px-3.5 py-2 text-xs"
          />
          <button
            type="submit"
            className="glass-button p-2.5 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
            aria-label="Send comment"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Modal for Manager Override */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel-elevated max-w-md w-full p-6 shadow-glass-lg flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold">Administrative Manager Override</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              As Charge Nurse / Manager, you can authorize shift transition without waiting for incoming staff acknowledgment. A formal audit entry will be recorded with your justification.
            </p>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="State regulatory or clinical reason for override (e.g., emergency code response, verbal handover received)..."
              rows={3}
              className="glass-input w-full p-3 text-xs"
            />
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleManagerOverride}
                disabled={!overrideReason.trim()}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 transition-all"
              >
                Apply Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
