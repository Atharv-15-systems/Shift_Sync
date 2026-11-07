import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore.ts';
import { VoiceDebriefPlayer } from './VoiceDebriefPlayer.tsx';
import { playSuccessChime, playHapticClick } from '../lib/audioEffects.ts';
import { 
  Send, 
  Hash, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Check, 
  ChevronRight
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const { 
    channels, 
    activeChannelId, 
    messages, 
    sendChatMessage, 
    currentUser, 
    nexconnStatus,
    handovers,
    activeHandoverId,
    acknowledgeHandover,
    resolveItem,
    setActiveTab
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isAcking, setIsAcking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  // Active handover attached to this channel
  const handover = handovers.find(h => h.channel_id === activeChannelId || h.id === activeHandoverId) || handovers[0];
  const isAcknowledged = handover?.acknowledgements?.some(a => a.status === 'acknowledged' || a.status === 'override');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    await sendChatMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleChatAcknowledge = async () => {
    if (!handover) return;
    setIsAcking(true);
    const res = await acknowledgeHandover(handover.id, 'Acknowledged directly via Nexconn Chat stream.');
    setIsAcking(false);
    if (res.success) {
      playSuccessChime();
    }
  };

  const handleToggleItem = async (itemId: string, currentResolved: boolean) => {
    playHapticClick();
    await resolveItem(itemId, !currentResolved);
  };

  return (
    <div className="flex-1 flex flex-col glass-panel shadow-glass-sm overflow-hidden h-full">
      {/* Chat Channel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {activeChannel?.name || 'Channel'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>{activeChannel?.workspace_name || 'St. Jude Acute Care'}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Users className="w-3 h-3" /> {activeChannel?.members?.length || 3} members
              </span>
            </p>
          </div>
        </div>

        {/* Nexconn status badge */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold px-2.5 py-1 rounded-full bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
          <span className={`w-2 h-2 rounded-full ${nexconnStatus.status === 'connected' ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-amber-400'}`} />
          <span className="capitalize">Nexconn {nexconnStatus.status}</span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {/* Pinned Interactive Nexconn Handover Card for Shift Channels */}
        {activeChannel?.type === 'shift' && handover && (
          <div className="p-4 rounded-2xl glass border border-blue-500/30 shadow-glass-sm bg-gradient-to-br from-blue-500/5 to-purple-500/5 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50 mb-3">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: handover.author_avatar || '#2563eb' }}
                >
                  {handover.author_name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {handover.shift_type} Shift Handover Card
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      In-Chat Widget
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Prepared by {handover.author_name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('handover')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Full View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Voice Debrief inline */}
            <div className="mb-3">
              <VoiceDebriefPlayer 
                authorName={handover.author_name} 
                summaryText={handover.summary || 'Shift debrief'} 
              />
            </div>

            {/* Pending Tasks Checkable in Chat */}
            {handover.items && (
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> Pending Shift Tasks ({handover.items.filter(i => i.kind === 'pending').length})
                </span>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {handover.items.filter(i => i.kind === 'pending').map(item => (
                    <div 
                      key={item.id}
                      onClick={() => handleToggleItem(item.id, Boolean(item.resolved))}
                      className={`p-2 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        item.resolved 
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 line-through opacity-75' 
                          : 'bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${item.resolved ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-400'}`}>
                          {item.resolved && <Check className="w-3 h-3" />}
                        </div>
                        <span className="truncate">{item.text}</span>
                      </div>
                      {item.carried_count >= 3 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-red-500/10 text-red-600 shrink-0">
                          Stale x{item.carried_count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* In-Chat Acknowledgement Action */}
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${isAcknowledged ? 'text-emerald-500' : 'text-amber-500'}`} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isAcknowledged ? 'Handover Acknowledged' : 'Pending Incoming Sign-off'}
                </span>
              </div>

              {!isAcknowledged && (
                <button
                  onClick={handleChatAcknowledge}
                  disabled={isAcking}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isAcking ? 'Signing...' : 'Acknowledge in Chat'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {channelMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-xs text-slate-500">No chat messages in #{activeChannel?.name} yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">Send a message to your team via the Nexconn Chat engine.</p>
          </div>
        ) : (
          channelMessages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5 shadow-xs"
                  style={{ backgroundColor: msg.senderAvatar || '#3b82f6' }}
                >
                  {msg.senderName.charAt(0)}
                </div>

                <div className="flex flex-col gap-1">
                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{msg.senderName}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div 
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-xs' 
                        : 'glass-panel rounded-tl-xs text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Message #${activeChannel?.name || 'channel'} via Nexconn...`}
          className="glass-input flex-1 px-4 py-2.5 text-xs"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all disabled:opacity-40 hover:-translate-y-0.5 active:translate-y-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
