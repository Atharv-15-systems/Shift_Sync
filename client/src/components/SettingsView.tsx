import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore.ts';
import { 
  Sliders, 
  Sun, 
  Moon, 
  Palette, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Layers
} from 'lucide-react';

const PRESETS = [
  { id: 'aurora', name: 'Aurora', desc: 'Vibrant optical glass with blue & indigo diffuse reflections', color: '#3b82f6' },
  { id: 'midnight', name: 'Midnight', desc: 'Deep obsidian backdrop with electric neon accents', color: '#6366f1' },
  { id: 'sunset', name: 'Sunset', desc: 'Warm amber & coral radiance with soft refraction', color: '#ea580c' },
  { id: 'minimal-mono', name: 'Minimal Mono', desc: 'High-clarity monochromatic architectural surfaces', color: '#0f172a' },
  { id: 'high-contrast', name: 'High Contrast', desc: 'WCAG AAA black & white edges for medical precision', color: '#0044cc' }
];

export const SettingsView: React.FC = () => {
  const { preferences, updatePreferences } = useAppStore();
  const [importJson, setImportJson] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handlePresetSelect = (presetId: string) => {
    updatePreferences({ active_theme: presetId });
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(preferences, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `shiftsync-theme-${preferences.active_theme}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJson);
      updatePreferences(parsed);
      setImportJson('');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      alert('Invalid JSON format');
    }
  };

  const handleResetDefaults = () => {
    updatePreferences({
      active_theme: 'aurora',
      is_dark: 0,
      glass_blur: 16,
      glass_opacity: 0.75,
      glass_border_brightness: 0.8,
      glass_corner_radius: 16,
      custom_accent: '#2563eb',
      layout_density: 'comfortable',
      font_family: 'system'
    });
  };

  return (
    <div className="flex-1 glass-panel shadow-glass-sm p-6 overflow-y-auto flex flex-col gap-8">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Apple Liquid Glass Customization</h2>
            <p className="text-xs text-slate-500">Live optical material controls with instant synchronization</p>
          </div>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* 5 Theme Presets */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-500" />
          <span>Curated Glass Presets (5 Mandatory Profiles)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {PRESETS.map((preset) => {
            const isSelected = preferences.active_theme === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`flex flex-col p-3.5 rounded-xl text-left transition-all border relative overflow-hidden ${
                  isSelected
                    ? 'glass-panel-elevated ring-2 ring-blue-500 border-blue-500/50 shadow-md'
                    : 'glass-panel hover:border-slate-400/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.color }} />
                  {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{preset.name}</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Mode & Accent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dark / Light Mode */}
        <div className="glass-panel p-5 flex flex-col gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Appearance Mode
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updatePreferences({ is_dark: 0 })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                preferences.is_dark === 0
                  ? 'bg-white text-slate-900 shadow-sm border-slate-300 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-white/30'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Mode</span>
            </button>
            <button
              onClick={() => updatePreferences({ is_dark: 1 })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                preferences.is_dark === 1
                  ? 'bg-slate-900 text-white shadow-sm border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-800/30'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Custom Accent Color Picker */}
        <div className="glass-panel p-5 flex flex-col gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Accent Highlight Tint
          </label>
          <div className="flex items-center gap-3">
            {['#2563eb', '#059669', '#7c3aed', '#ea580c', '#06b6d4', '#e11d48'].map((color) => (
              <button
                key={color}
                onClick={() => updatePreferences({ custom_accent: color })}
                className={`w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                  preferences.custom_accent === color ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
              >
                {preferences.custom_accent === color && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            ))}
            <input
              type="color"
              value={preferences.custom_accent || '#2563eb'}
              onChange={(e) => updatePreferences({ custom_accent: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              title="Custom Hex Picker"
            />
          </div>
        </div>
      </div>

      {/* Optical Material Sliders */}
      <div className="glass-panel p-6 flex flex-col gap-5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Optical Glass Surface Parameters</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blur Intensity */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Backdrop Blur Intensity</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{preferences.glass_blur}px</span>
            </div>
            <input
              type="range"
              min="4"
              max="40"
              value={preferences.glass_blur}
              onChange={(e) => updatePreferences({ glass_blur: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Corner Radius */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Corner Radius</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{preferences.glass_corner_radius}px</span>
            </div>
            <input
              type="range"
              min="4"
              max="32"
              value={preferences.glass_corner_radius}
              onChange={(e) => updatePreferences({ glass_corner_radius: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Border Highlight / Specular Reflection */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Specular Border Brightness</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{Math.round(preferences.glass_border_brightness * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={preferences.glass_border_brightness}
              onChange={(e) => updatePreferences({ glass_border_brightness: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Surface Translucency */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Surface Opacity</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{Math.round(preferences.glass_opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="0.95"
              step="0.05"
              value={preferences.glass_opacity}
              onChange={(e) => updatePreferences({ glass_opacity: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Import / Export JSON */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Theme Configuration Sync (JSON)
          </label>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Theme JSON</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder='Paste theme JSON configuration to import (e.g. {"active_theme": "midnight", "glass_blur": 24})...'
            className="glass-input flex-1 px-3.5 py-2 text-xs"
          />
          <button
            onClick={handleImport}
            disabled={!importJson.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 disabled:opacity-40 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
        </div>
        {copySuccess && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Theme imported and active.
          </p>
        )}
      </div>
    </div>
  );
};
