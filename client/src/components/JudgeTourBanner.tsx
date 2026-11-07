import React from 'react';
import { useAppStore } from '../store/useAppStore.ts';
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle2, ShieldAlert, Siren, MessageSquare } from 'lucide-react';

export const JudgeTourBanner: React.FC = () => {
  const { 
    isTourActive, 
    tourStep, 
    startJudgeTour, 
    nextTourStep, 
    prevTourStep, 
    endTour 
  } = useAppStore();

  const tourSteps = [
    {
      title: 'Step 1: Outgoing Shift Lead & Offline Hazard Intelligence',
      badge: 'Elena Rostova (Outgoing)',
      desc: 'Review the ICU handover. The offline rule-based scanner automatically flagged the severe latex allergy and oxygen regulator leak.',
      icon: ShieldAlert,
      color: 'text-blue-500'
    },
    {
      title: 'Step 2: Emergency Broadcast & Native Web Audio Klaxon',
      badge: 'Code Blue Simulation',
      desc: 'ShiftSync can instantly broadcast critical incidents to all staff with an audible alert chime and glowing red glass banner.',
      icon: Siren,
      color: 'text-red-500'
    },
    {
      title: 'Step 3: Nexconn Real-Time Chat & Interactive Shift Card',
      badge: 'Marcus Vance (Incoming)',
      desc: 'Notice how the handover isn\'t just text—it renders an interactive widget right in the Nexconn chat stream with checkable tasks.',
      icon: MessageSquare,
      color: 'text-purple-500'
    },
    {
      title: 'Step 4: Multi-Signature Sign-off Gate & Compliance Lock',
      badge: 'Shift Closure Unlocked',
      desc: 'Once the incoming nurse signs off, the shift closure locks release and the JCAHO/OSHA Safety Score updates to 95%+.',
      icon: CheckCircle2,
      color: 'text-emerald-500'
    }
  ];

  if (!isTourActive) {
    return (
      <div className="mb-4 flex items-center justify-between p-3 rounded-2xl glass border border-indigo-500/30 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 shadow-glass-sm animate-fadeIn">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Nexconn Build Challenge 2026 Evaluation
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                Judge Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Want to see all winning features in 60 seconds? Start the guided interactive walkthrough.
            </p>
          </div>
        </div>

        <button
          onClick={startJudgeTour}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Start 60s Tour</span>
        </button>
      </div>
    );
  }

  const current = tourSteps[tourStep] || tourSteps[0];
  const StepIcon = current.icon;

  return (
    <div className="mb-4 p-4 rounded-2xl glass border-2 border-indigo-500/60 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-blue-950/40 shadow-2xl backdrop-blur-xl animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Step Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40 shrink-0">
            <StepIcon className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                {current.badge}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white font-semibold">
                Tour {tourStep + 1} of 4
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">
              {current.title}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              {current.desc}
            </p>
          </div>
        </div>

        {/* Tour Navigation Controls */}
        <div className="flex items-center gap-2">
          {tourStep > 0 && (
            <button
              onClick={prevTourStep}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={nextTourStep}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
          >
            <span>{tourStep === 3 ? 'Finish Tour' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={endTour}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
            title="Exit Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
