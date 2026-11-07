import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Sparkles } from 'lucide-react';
import { speakVoiceDebrief, stopSpeech } from '../lib/audioEffects';

interface VoiceDebriefPlayerProps {
  authorName: string;
  summaryText: string;
  className?: string;
}

export const VoiceDebriefPlayer: React.FC<VoiceDebriefPlayerProps> = ({
  authorName,
  summaryText,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const togglePlayback = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      const speechContent = `Shift debrief from ${authorName}. ${summaryText}`;
      speakVoiceDebrief(
        speechContent,
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    }
  };

  return (
    <div className={`glass p-3.5 rounded-2xl border border-white/10 dark:border-white/5 flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlayback}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 animate-pulse'
              : 'bg-white/10 dark:bg-black/30 hover:bg-white/20 text-blue-500 dark:text-blue-400'
          }`}
          title={isPlaying ? 'Pause audio debrief' : 'Play audio debrief'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Voice Shift Debrief
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-300 font-medium">
              Speech AI
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
            Recorded by {authorName}
          </p>
        </div>
      </div>

      {/* Interactive Sound Waveform Animation */}
      <div className="flex items-center gap-1 px-2 py-1 bg-black/5 dark:bg-white/5 rounded-lg h-8">
        {[40, 75, 50, 90, 60, 85, 45, 95, 70, 55, 80, 40].map((height, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-200 ${
              isPlaying
                ? 'bg-blue-500 animate-pulse'
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
            style={{
              height: isPlaying ? `${Math.max(20, (height * (Math.sin(i + Date.now() / 200) + 1.2)) / 2)}%` : `${height * 0.4}%`,
              animationDelay: `${i * 80}ms`
            }}
          />
        ))}
      </div>

      <button
        onClick={togglePlayback}
        className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        {isPlaying ? <Volume2 className="w-4 h-4 text-blue-500 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
      </button>
    </div>
  );
};
