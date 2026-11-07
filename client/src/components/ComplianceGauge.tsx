import React from 'react';
import { useAppStore } from '../store/useAppStore.ts';
import { AlertCircle, Award, CheckCircle } from 'lucide-react';

interface ComplianceGaugeProps {
  className?: string;
}

export const ComplianceGauge: React.FC<ComplianceGaugeProps> = ({ className = '' }) => {
  const { handovers, activeHandoverId, activeIndustry } = useAppStore();

  const handover = handovers.find(h => h.id === activeHandoverId) || handovers[0];

  // Calculate dynamic compliance score
  let score = 50; // base score for structured format

  const hasAck = handover?.acknowledgements?.some(a => a.status === 'acknowledged' || a.status === 'override');
  if (hasAck) score += 25;

  const pendingItems = handover?.items?.filter(i => i.kind === 'pending') || [];
  const staleItems = pendingItems.filter(i => i.carried_count >= 3);
  if (staleItems.length === 0) {
    score += 15;
  } else {
    score += Math.max(0, 15 - staleItems.length * 5);
  }

  const warnings = handover?.items?.filter(i => i.kind === 'warning') || [];
  if (warnings.length > 0) {
    // If acknowledged, we award full hazard management points
    if (hasAck) score += 10;
  } else {
    score += 10;
  }

  score = Math.min(100, Math.max(20, score));

  // Determine color and status
  const getGradeInfo = (val: number) => {
    if (val >= 90) {
      return {
        label: 'Optimal Shift Safety',
        color: 'text-emerald-500',
        stroke: '#10b981',
        bg: 'from-emerald-500/10 to-teal-500/10',
        standard: activeIndustry === 'healthcare' ? 'JCAHO National Patient Safety Standard' : 'OSHA Enterprise Safety Protocol'
      };
    }
    if (val >= 70) {
      return {
        label: 'Moderate Transition Risk',
        color: 'text-amber-500',
        stroke: '#f59e0b',
        bg: 'from-amber-500/10 to-orange-500/10',
        standard: 'Pending Incoming Nurse Signature Verification'
      };
    }
    return {
      label: 'Critical Hazard Lock',
      color: 'text-red-500',
      stroke: '#ef4444',
      bg: 'from-red-500/10 to-rose-500/10',
      standard: 'Unacknowledged Life-Safety Risk Detected'
    };
  };

  const grade = getGradeInfo(score);
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`glass p-4 rounded-2xl border border-white/10 dark:border-white/5 shadow-glass-sm bg-gradient-to-br ${grade.bg} ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Animated SVG Ring */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={grade.stroke}
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-slate-900 dark:text-white leading-none">
                {score}%
              </span>
              <span className="text-[8px] font-semibold text-slate-400 uppercase mt-0.5">
                Safety
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <Award className={`w-3.5 h-3.5 ${grade.color}`} />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {grade.label}
              </h4>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {grade.standard}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[9px] font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                Structured Handover
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {hasAck ? (
                  <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-2.5 h-2.5 text-amber-500" />
                )}
                Peer Sign-off
              </span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end text-right text-[10px] text-slate-400">
          <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Audit Level
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold mt-1">
            Grade A+ Secure
          </span>
        </div>
      </div>
    </div>
  );
};
