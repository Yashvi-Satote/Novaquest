import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  Monitor, 
  Gamepad2, 
  Database, 
  RotateCcw, 
  Check, 
  AlertTriangle,
  Sliders
} from 'lucide-react';
import { getSettings, saveSettings, DEFAULT_SETTINGS, hasSaveGame, deleteSaveGame, getSaveGame } from '../../game/saveManager';
import { audio } from '../../game/audioManager';

export default function SettingsModal({ isOpen, onClose, onSaveChanged }) {
  const [activeTab, setActiveTab] = useState('audio');
  const [settings, setLocalSettings] = useState(getSettings());
  const [saveStatus, setSaveStatus] = useState(hasSaveGame());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(getSettings());
      setSaveStatus(hasSaveGame());
      setShowDeleteConfirm(false);
      setSavedNotification(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSliderChange = (section, key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: Number(value)
      }
    }));
  };

  const handleToggleChange = (section, key) => {
    audio.playClick();
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  const handlePillSelect = (section, key, val) => {
    audio.playClick();
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: val
      }
    }));
  };

  const handleSaveAndApply = () => {
    audio.playClick();
    saveSettings(settings);
    audio.updateAmbienceVolume();
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      if (onClose) onClose();
    }, 400);
    if (onSaveChanged) onSaveChanged();
  };

  const handleResetDefaults = () => {
    audio.playClick();
    setLocalSettings(DEFAULT_SETTINGS);
  };

  const handleDeleteSaveFile = () => {
    audio.playClick();
    deleteSaveGame();
    setSaveStatus(false);
    setShowDeleteConfirm(false);
    if (onSaveChanged) onSaveChanged();
  };

  const currentSave = getSaveGame();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/30 bg-[#090e1c]/95 text-slate-100 shadow-2xl shadow-cyan-950/50 flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wider uppercase text-white font-mono">Mission Telemetry & Settings</h2>
              <p className="text-xs text-slate-400">Configure flight acoustics, rendering quality, and piloting controls</p>
            </div>
          </div>
          <button
            onClick={() => { audio.playClick(); onClose(); }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/40 px-6 gap-2 overflow-x-auto">
          {[
            { id: 'audio', label: 'Audio', icon: Volume2 },
            { id: 'graphics', label: 'Graphics', icon: Monitor },
            { id: 'controls', label: 'Controls', icon: Gamepad2 },
            { id: 'data', label: 'Data & Save', icon: Database },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { audio.playHover(); setActiveTab(tab.id); }}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-all ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* AUDIO TAB */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              {/* Master Volume */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 uppercase">Master Volume</span>
                  <span className="text-cyan-400 font-bold">{settings.audio.masterVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.audio.masterVolume}
                  onChange={(e) => handleSliderChange('audio', 'masterVolume', e.target.value)}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Music / Ambience Volume */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 uppercase">Cosmic Ambience / Music</span>
                  <span className="text-cyan-400 font-bold">{settings.audio.musicVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.audio.musicVolume}
                  onChange={(e) => handleSliderChange('audio', 'musicVolume', e.target.value)}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* SFX Volume */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 uppercase">Thruster & UI SFX</span>
                  <span className="text-cyan-400 font-bold">{settings.audio.sfxVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.audio.sfxVolume}
                  onChange={(e) => handleSliderChange('audio', 'sfxVolume', e.target.value)}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors">
                  <div>
                    <div className="font-medium text-slate-200">Space Drone Ambience</div>
                    <div className="text-xs text-slate-400">Procedural low-frequency celestial hum</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.audio.ambienceEnabled}
                    onChange={() => handleToggleChange('audio', 'ambienceEnabled')}
                    className="accent-cyan-400 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors">
                  <div>
                    <div className="font-medium text-slate-200">UI Telemetry Sounds</div>
                    <div className="text-xs text-slate-400">Tactile sci-fi feedback chimes on hover and clicks</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.audio.uiSoundsEnabled}
                    onChange={() => handleToggleChange('audio', 'uiSoundsEnabled')}
                    className="accent-cyan-400 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* GRAPHICS TAB */}
          {activeTab === 'graphics' && (
            <div className="space-y-5">
              {/* Quality Presets */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-slate-300">Rendering Fidelity Preset</div>
                <div className="grid grid-cols-4 gap-2">
                  {['Low', 'Medium', 'High', 'Ultra'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePillSelect('graphics', 'qualityPreset', preset)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all border ${
                        settings.graphics.qualityPreset === preset
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-900/40'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Particle Density */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-slate-300">Atmospheric Lunar Dust Particles</div>
                <div className="grid grid-cols-3 gap-2">
                  {['Off', 'Low', 'High'].map(density => (
                    <button
                      key={density}
                      type="button"
                      onClick={() => handlePillSelect('graphics', 'particleDensity', density)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all border ${
                        settings.graphics.particleDensity === density
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {density}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors">
                  <div>
                    <div className="font-medium text-slate-200">Earth Atmospheric Glow</div>
                    <div className="text-xs text-slate-400">Render luminous atmospheric edge bloom around Earth</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.graphics.cosmicGlow}
                    onChange={() => handleToggleChange('graphics', 'cosmicGlow')}
                    className="accent-cyan-400 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors">
                  <div>
                    <div className="font-medium text-slate-200">Solar Glare & Lens Shimmer</div>
                    <div className="text-xs text-slate-400">Cinematic lens flare from the lunar horizon</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.graphics.lensShimmer}
                    onChange={() => handleToggleChange('graphics', 'lensShimmer')}
                    className="accent-cyan-400 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* CONTROLS TAB */}
          {activeTab === 'controls' && (
            <div className="space-y-5">
              {/* Flight Model */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-slate-300">Spacecraft Thruster Model</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Assisted', title: 'Assisted Flight', desc: 'Computer damping, easier maneuvering' },
                    { id: 'Realistic', title: 'Newtonian Inertia', desc: 'Zero friction, realistic orbital physics' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handlePillSelect('controls', 'flightModel', m.id)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        settings.controls.flightModel === m.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs font-mono">{m.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sensitivity */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 uppercase">Look & Steer Sensitivity</span>
                  <span className="text-cyan-400 font-bold">{settings.controls.sensitivity} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.controls.sensitivity}
                  onChange={(e) => handleSliderChange('controls', 'sensitivity', e.target.value)}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors">
                  <div>
                    <div className="font-medium text-slate-200">Invert Flight Pitch (Y-Axis)</div>
                    <div className="text-xs text-slate-400">Push forward to dive, pull back to climb</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.controls.invertY}
                    onChange={() => handleToggleChange('controls', 'invertY')}
                    className="accent-cyan-400 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors">
                  <div>
                    <div className="font-medium text-slate-200">Mission Subtitles & Telemetry Overlay</div>
                    <div className="text-xs text-slate-400">Display HUD text transmissions and coordinate readouts</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.controls.subtitles}
                    onChange={() => handleToggleChange('controls', 'subtitles')}
                    className="accent-cyan-400 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* DATA & SAVE TAB */}
          {activeTab === 'data' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase text-slate-400">Save Slot Status</div>
                  {saveStatus ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <Check className="h-3 w-3" /> Active Checkpoint
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-white/10">
                      No Save Data
                    </span>
                  )}
                </div>

                {saveStatus && currentSave && (
                  <div className="text-xs space-y-1 font-mono text-slate-300 bg-black/40 p-3 rounded-lg border border-white/5">
                    <div><span className="text-slate-500">Mission:</span> {currentSave.title}</div>
                    <div><span className="text-slate-500">Site:</span> {currentSave.location}</div>
                    <div><span className="text-slate-500">Coordinates:</span> {currentSave.coordinates}</div>
                    <div><span className="text-slate-500">Last Telemetry:</span> {new Date(currentSave.timestamp).toLocaleString()}</div>
                  </div>
                )}
              </div>

              {saveStatus && (
                <div className="pt-2">
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Clear Saved Mission Telemetry
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-600/70 space-y-3">
                      <div className="text-xs text-rose-200">
                        Are you sure you want to delete your saved mission progress? This action cannot be undone.
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleDeleteSaveFile}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-black/50">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { audio.playClick(); onClose(); }}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="flex items-center gap-1.5 py-2 px-5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/30 transition-all"
            >
              <Check className="h-4 w-4" />
              <span>{savedNotification ? 'Applied!' : 'Save & Close'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
