import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Database,
  Gamepad2,
  Loader2,
  Monitor,
  RotateCcw,
  Save,
  Sliders,
  Undo2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { audio } from '../../../NovaQuest/game/audioManager';
import {
  deleteSaveGame,
  getSaveGame,
  hasSaveGame,
} from '../../../NovaQuest/game/saveManager';
import {
  getProgressSyncNotice,
  subscribeProgress,
} from '../../../NovaQuest/game/progressRepository';
import { useSettings } from '../context/settingsContext';

const TABS = [
  { id: 'audio', label: 'Audio', icon: Volume2 },
  { id: 'graphics', label: 'Graphics', icon: Monitor },
  { id: 'controls', label: 'Controls', icon: Gamepad2 },
  { id: 'data', label: 'Data & Save', icon: Database },
];

function Feedback({ tone, children }) {
  const styles = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    error: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  };
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border px-3.5 py-2.5 text-xs font-medium ${styles[tone] || styles.info}`}
    >
      {children}
    </div>
  );
}

export default function GameSettingsSection() {
  const {
    settings,
    savedSettings,
    updateSetting,
    save,
    resetDefaults,
    discardChanges,
    saveStatus,
    syncStatus,
    message,
  } = useSettings();

  const [activeTab, setActiveTab] = useState('audio');
  const [saveState, setSaveState] = useState(() => ({
    exists: hasSaveGame(),
    data: getSaveGame(),
    notice: getProgressSyncNotice(),
  }));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const refreshSaveState = () => {
    setSaveState({
      exists: hasSaveGame(),
      data: getSaveGame(),
      notice: getProgressSyncNotice(),
    });
  };

  useEffect(() => subscribeProgress(refreshSaveState), []);

  const saveExists = saveState.exists;
  const currentSave = saveExists ? saveState.data : null;
  const progressNotice = saveState.notice;
  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);
  const saving = saveStatus === 'saving';

  const apply = (section, key, value) => {
    const next = updateSetting(section, key, value);
    audio.applySettings(next);
    return next;
  };

  const handleSliderChange = (section, key, value) => {
    apply(section, key, Number(value));
  };

  const handleToggleChange = (section, key) => {
    audio.playClick();
    apply(section, key, !settings[section][key]);
  };

  const handlePillSelect = (section, key, value) => {
    audio.playClick();
    apply(section, key, value);
  };

  const handleAudioPower = () => {
    audio.playClick();
    apply('audio', 'muted', !settings.audio.muted);
  };

  const handleResetDefaults = () => {
    audio.playClick();
    const next = resetDefaults();
    audio.applySettings(next);
  };

  const handleDiscard = () => {
    audio.playClick();
    discardChanges();
    audio.applySettings();
  };

  const handleSave = async () => {
    audio.playClick();
    const ok = await save();
    if (ok) audio.applySettings();
  };

  const handleDeleteSaveFile = () => {
    audio.playClick();
    deleteSaveGame();
    setShowDeleteConfirm(false);
    refreshSaveState();
  };

  const feedbackTone =
    saveStatus === 'error' || syncStatus === 'error'
      ? 'error'
      : saveStatus === 'saved'
        ? 'success'
        : syncStatus === 'loading'
          ? 'info'
          : 'info';

  return (
    <section aria-labelledby="game-settings-heading" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="game-settings-heading"
            className="font-mono text-lg font-bold uppercase tracking-wider text-white"
          >
            Game Settings
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Configure flight acoustics, rendering quality, piloting controls and saved telemetry.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-cyan-300">
          <Sliders className="h-3 w-3" />
          Mission Telemetry
        </span>
      </div>

      {syncStatus === 'loading' ? (
        <Feedback tone="info">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Syncing settings with your account…
          </span>
        </Feedback>
      ) : null}
      {message ? <Feedback tone={feedbackTone}>{message}</Feedback> : null}

      <div className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#090e1c]/90 shadow-xl shadow-cyan-950/20">
        <div
          className="flex gap-1 overflow-x-auto border-b border-white/10 bg-black/40 px-3"
          role="tablist"
          aria-label="Game settings categories"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`game-settings-panel-${tab.id}`}
                id={`game-settings-tab-${tab.id}`}
                onClick={() => {
                  audio.playHover();
                  setActiveTab(tab.id);
                }}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold tracking-wide transition-all sm:text-sm ${
                  selected
                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-6 p-4 text-sm sm:p-6">
          {activeTab === 'audio' && (
            <div
              id="game-settings-panel-audio"
              role="tabpanel"
              aria-labelledby="game-settings-tab-audio"
              className="space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <div>
                  <div className="font-medium text-slate-200">Audio</div>
                  <div className="text-xs text-slate-400">
                    Master switch for all ambience, music and interface sounds
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!settings.audio.muted}
                  onClick={handleAudioPower}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    settings.audio.muted
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                      : 'border-cyan-400/50 bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30'
                  }`}
                >
                  {settings.audio.muted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                  <span>Audio: {settings.audio.muted ? 'Off' : 'On'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 uppercase">Master Volume</span>
                  <span className="font-bold text-cyan-400">{settings.audio.masterVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.audio.masterVolume}
                  onChange={(event) => handleSliderChange('audio', 'masterVolume', event.target.value)}
                  className="h-2 w-full cursor-pointer rounded-lg bg-slate-800 accent-cyan-400"
                  aria-label="Master volume"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 uppercase">Cosmic Ambience / Music</span>
                  <span className="font-bold text-cyan-400">{settings.audio.musicVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.audio.musicVolume}
                  onChange={(event) => handleSliderChange('audio', 'musicVolume', event.target.value)}
                  className="h-2 w-full cursor-pointer rounded-lg bg-slate-800 accent-cyan-400"
                  aria-label="Cosmic ambience and music volume"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 uppercase">Thruster & UI SFX</span>
                  <span className="font-bold text-cyan-400">{settings.audio.sfxVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.audio.sfxVolume}
                  onChange={(event) => handleSliderChange('audio', 'sfxVolume', event.target.value)}
                  className="h-2 w-full cursor-pointer rounded-lg bg-slate-800 accent-cyan-400"
                  aria-label="Thruster and UI sound effect volume"
                />
              </div>

              <div className="space-y-3 border-t border-white/10 pt-2">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]">
                  <div>
                    <div className="font-medium text-slate-200">Space Drone Ambience</div>
                    <div className="text-xs text-slate-400">Procedural low-frequency celestial hum</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.audio.ambienceEnabled}
                    onChange={() => handleToggleChange('audio', 'ambienceEnabled')}
                    className="h-4 w-4 cursor-pointer accent-cyan-400"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]">
                  <div>
                    <div className="font-medium text-slate-200">UI Telemetry Sounds</div>
                    <div className="text-xs text-slate-400">
                      Tactile sci-fi feedback chimes on hover and clicks
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.audio.uiSoundsEnabled}
                    onChange={() => handleToggleChange('audio', 'uiSoundsEnabled')}
                    className="h-4 w-4 cursor-pointer accent-cyan-400"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'graphics' && (
            <div
              id="game-settings-panel-graphics"
              role="tabpanel"
              aria-labelledby="game-settings-tab-graphics"
              className="space-y-5"
            >
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-slate-300">
                  Rendering Fidelity Preset
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {['Low', 'Medium', 'High', 'Ultra'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePillSelect('graphics', 'qualityPreset', preset)}
                      className={`rounded-xl border px-3 py-2 font-mono text-xs font-bold transition-all ${
                        settings.graphics.qualityPreset === preset
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-900/40'
                          : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-slate-300">
                  Atmospheric Lunar Dust Particles
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Off', 'Low', 'High'].map((density) => (
                    <button
                      key={density}
                      type="button"
                      onClick={() => handlePillSelect('graphics', 'particleDensity', density)}
                      className={`rounded-xl border px-3 py-2 font-mono text-xs font-bold transition-all ${
                        settings.graphics.particleDensity === density
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                          : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
                      }`}
                    >
                      {density}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-white/10 pt-2">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]">
                  <div>
                    <div className="font-medium text-slate-200">Earth Atmospheric Glow</div>
                    <div className="text-xs text-slate-400">
                      Render luminous atmospheric edge bloom around Earth
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.graphics.cosmicGlow}
                    onChange={() => handleToggleChange('graphics', 'cosmicGlow')}
                    className="h-4 w-4 cursor-pointer accent-cyan-400"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]">
                  <div>
                    <div className="font-medium text-slate-200">Solar Glare & Lens Shimmer</div>
                    <div className="text-xs text-slate-400">
                      Cinematic lens flare from the lunar horizon
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.graphics.lensShimmer}
                    onChange={() => handleToggleChange('graphics', 'lensShimmer')}
                    className="h-4 w-4 cursor-pointer accent-cyan-400"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div
              id="game-settings-panel-controls"
              role="tabpanel"
              aria-labelledby="game-settings-tab-controls"
              className="space-y-5"
            >
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-slate-300">
                  Spacecraft Thruster Model
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { id: 'Assisted', title: 'Assisted Flight', desc: 'Computer damping, easier maneuvering' },
                    { id: 'Realistic', title: 'Newtonian Inertia', desc: 'Zero friction, realistic orbital physics' },
                  ].map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => handlePillSelect('controls', 'flightModel', model.id)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        settings.controls.flightModel === model.id
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                          : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold">{model.title}</div>
                      <div className="mt-0.5 text-[11px] text-slate-400">{model.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 uppercase">Look & Steer Sensitivity</span>
                  <span className="font-bold text-cyan-400">
                    {settings.controls.sensitivity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.controls.sensitivity}
                  onChange={(event) => handleSliderChange('controls', 'sensitivity', event.target.value)}
                  className="h-2 w-full cursor-pointer rounded-lg bg-slate-800 accent-cyan-400"
                  aria-label="Look and steer sensitivity"
                />
              </div>

              <div className="space-y-3 border-t border-white/10 pt-2">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]">
                  <div>
                    <div className="font-medium text-slate-200">Invert Flight Pitch (Y-Axis)</div>
                    <div className="text-xs text-slate-400">
                      Push forward to dive, pull back to climb
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.controls.invertY}
                    onChange={() => handleToggleChange('controls', 'invertY')}
                    className="h-4 w-4 cursor-pointer accent-cyan-400"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]">
                  <div>
                    <div className="font-medium text-slate-200">
                      Mission Subtitles & Telemetry Overlay
                    </div>
                    <div className="text-xs text-slate-400">
                      Display HUD text transmissions and coordinate readouts
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.controls.subtitles}
                    onChange={() => handleToggleChange('controls', 'subtitles')}
                    className="h-4 w-4 cursor-pointer accent-cyan-400"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div
              id="game-settings-panel-data"
              role="tabpanel"
              aria-labelledby="game-settings-tab-data"
              className="space-y-5"
            >
              {progressNotice ? <Feedback tone="info">{progressNotice}</Feedback> : null}
              <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-mono text-xs uppercase text-slate-400">Save Slot Status</div>
                  {saveExists ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                      <Check className="h-3 w-3" /> Active Checkpoint
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                      No Save Data
                    </span>
                  )}
                </div>

                {saveExists && currentSave ? (
                  <div className="space-y-1 rounded-lg border border-white/5 bg-black/40 p-3 font-mono text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500">Mission:</span> {currentSave.title}
                    </div>
                    <div>
                      <span className="text-slate-500">Site:</span> {currentSave.location}
                    </div>
                    <div>
                      <span className="text-slate-500">Coordinates:</span> {currentSave.coordinates}
                    </div>
                    <div>
                      <span className="text-slate-500">Last Telemetry:</span>{' '}
                      {new Date(currentSave.timestamp).toLocaleString()}
                    </div>
                  </div>
                ) : null}
              </div>

              {saveExists ? (
                <div className="pt-1">
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-800/50 bg-rose-950/40 px-4 py-2.5 text-xs font-semibold text-rose-300 transition-all hover:bg-rose-900/60"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Clear Saved Mission Telemetry
                    </button>
                  ) : (
                    <div className="space-y-3 rounded-xl border border-rose-600/70 bg-rose-950/60 p-4">
                      <div className="text-xs text-rose-200">
                        Are you sure you want to delete your saved mission progress? This action
                        cannot be undone.
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleDeleteSaveFile}
                          className="flex-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/50 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!isDirty || saving}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span>Discard</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-cyan-600/30 transition-all hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Saving…' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
