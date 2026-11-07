import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore.ts';
import { playEmergencyAlarm } from '../lib/audioEffects.ts';
import { Siren, X, AlertTriangle, Radio } from 'lucide-react';

interface EmergencyBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyBroadcastModal: React.FC<EmergencyBroadcastModalProps> = ({
  isOpen,
  onClose
}) => {
  const { dispatchEmergencyBroadcast, activeIndustry } = useAppStore();

  const presetsByIndustry: Record<string, Array<{ title: string; severity: 'critical' | 'code_blue' | 'evacuation' | 'security'; details: string }>> = {
    healthcare: [
      {
        title: 'CODE BLUE: Bed 4 Cardiac Arrest Team',
        severity: 'code_blue',
        details: 'Adult resuscitation team immediately to ICU Bed 4. Crash cart 2 deployed. Charge nurse on scene.'
      },
      {
        title: 'CRITICAL HAZARD: Oxygen Main Line Pressure Drop',
        severity: 'critical',
        details: 'Secondary manifold pressure fell below 45 PSI in Sector B. Switch critical ventilators to portable cylinders.'
      },
      {
        title: 'EVACUATION: South Wing Smoke Detection',
        severity: 'evacuation',
        details: 'Smoke sensors triggered in Linen Storage 2B. Prepare non-ambulatory patient transfer staging.'
      }
    ],
    hospitality: [
      {
        title: 'WATER HAZARD: Major Pipe Burst 4th Floor',
        severity: 'critical',
        details: 'Main ceiling rupture outside Room 412. Engineering tagging floor shutoff valve. Housekeeping team dispatched.'
      },
      {
        title: 'SECURITY ALERT: VIP Convoy Arrival',
        severity: 'security',
        details: 'French Diplomatic security detail entering perimeter at South Portico. Clear lobby service access.'
      }
    ],
    cloudops: [
      {
        title: 'P1 CRITICAL: Ingress Gateway Outage',
        severity: 'critical',
        details: '504 Bad Gateway rate exceeded 35% on global checkout endpoints. Failover DNS routing to us-west-2 initiated.'
      },
      {
        title: 'DATA RISK: Primary DB Replication Split-Brain',
        severity: 'critical',
        details: 'Secondary cluster lag reached 420 seconds. Read traffic temporarily cordoned. SRE incident bridge live.'
      }
    ]
  };

  const currentPresets = presetsByIndustry[activeIndustry] || presetsByIndustry.healthcare;

  const [selectedPreset, setSelectedPreset] = useState(currentPresets[0]);
  const [customTitle, setCustomTitle] = useState(currentPresets[0].title);
  const [customDetails, setCustomDetails] = useState(currentPresets[0].details);
  const [isDispatching, setIsDispatching] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof currentPresets[0]) => {
    setSelectedPreset(preset);
    setCustomTitle(preset.title);
    setCustomDetails(preset.details);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setIsDispatching(true);
    playEmergencyAlarm();
    await dispatchEmergencyBroadcast(customTitle.trim(), selectedPreset.severity, customDetails.trim());
    setIsDispatching(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel p-6 shadow-2xl border border-red-500/30 rounded-3xl overflow-hidden bg-gradient-to-b from-red-500/10 via-transparent to-transparent">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-red-500/20 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30 animate-pulse">
              <Siren className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Emergency Broadcast Dispatcher
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fires real-time alarm & alert strobe across all team devices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2 mb-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-500" />
            <span>Select Protocol Preset</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {currentPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                  selectedPreset.title === preset.title
                    ? 'border-red-500 bg-red-500/15 text-red-600 dark:text-red-400 font-semibold shadow-sm'
                    : 'border-slate-200/60 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="truncate">{preset.title}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 shrink-0">
                  {preset.severity.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Broadcast Headline
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              required
              className="glass-input w-full px-3.5 py-2 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Immediate Response Instructions
            </label>
            <textarea
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              rows={3}
              required
              className="glass-input w-full px-3.5 py-2 text-xs"
            />
          </div>

          {/* Warning notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>
              This will broadcast an audible synthesized alert and override UI views across all active shift members via the Nexconn channel feed.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDispatching}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Siren className="w-4 h-4 animate-spin" />
              <span>{isDispatching ? 'Transmitting...' : 'Transmit Emergency Alert'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
