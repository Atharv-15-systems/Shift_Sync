import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore.ts';
import { Send, Hash, Users, MessageSquare } from 'lucide-react';

export const ChatView: React.FC = () => {
  const { 
    channels, 
    activeChannelId, 
    messages, 
    sendChatMessage, 
    currentUser, 
    nexconnStatus 
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    await sendChatMessage(inputMessage.trim());
    setInputMessage('');
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
          <span className={`w-2 h-2 rounded-full ${nexconnStatus.status === 'connected' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          <span className="capitalize">{nexconnStatus.status}</span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {channelMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-xs text-slate-500">No messages in #{activeChannel?.name} yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">Start the conversation with your shift team.</p>
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
