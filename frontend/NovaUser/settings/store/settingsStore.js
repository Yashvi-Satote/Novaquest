/**
 * Central NovaQuest game-settings store.
 *
 * The backend is the source of truth for signed-in users.  localStorage is
 * kept as an offline/pre-hydration fallback so the audio engine and the game
 * can read settings synchronously during the first render.
 */

export const SETTINGS_STORAGE_KEY = 'novaquest_game_settings';

export const DEFAULT_GAME_SETTINGS = {
  audio: {
    masterVolume: 80,
    musicVolume: 70,
    sfxVolume: 85,
    ambienceEnabled: true,
    uiSoundsEnabled: true,
    muted: false,
  },
  graphics: {
    qualityPreset: 'High',
    particleDensity: 'High',
    cosmicGlow: true,
    lensShimmer: true,
    targetFps: '60',
  },
  controls: {
    invertY: false,
    sensitivity: 5,
    flightModel: 'Assisted',
    subtitles: true,
  },
};

export const QUALITY_PRESETS = ['Low', 'Medium', 'High', 'Ultra'];
export const PARTICLE_DENSITIES = ['Off', 'Low', 'High'];
export const FLIGHT_MODELS = ['Assisted', 'Realistic'];
export const TARGET_FPS_OPTIONS = ['30', '60', '120', '144'];

export function createDefaultSettings() {
  return {
    audio: { ...DEFAULT_GAME_SETTINGS.audio },
    graphics: { ...DEFAULT_GAME_SETTINGS.graphics },
    controls: { ...DEFAULT_GAME_SETTINGS.controls },
  };
}

function clampNumber(value, min, max, fallback) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function asBoolean(value, fallback) {
  return typeof value === 'boolean' ? value : fallback;
}

function asEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function section(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

/**
 * Merge persisted/partial settings with defaults and coerce invalid values.
 * This mirrors the backend validation but is intentionally forgiving so a
 * stale localStorage payload can never crash the UI.
 */
export function normaliseSettings(raw) {
  const defaults = createDefaultSettings();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return defaults;

  const audio = section(raw.audio);
  const graphics = section(raw.graphics);
  const controls = section(raw.controls);

  return {
    audio: {
      masterVolume: clampNumber(audio.masterVolume, 0, 100, defaults.audio.masterVolume),
      musicVolume: clampNumber(audio.musicVolume, 0, 100, defaults.audio.musicVolume),
      sfxVolume: clampNumber(audio.sfxVolume, 0, 100, defaults.audio.sfxVolume),
      ambienceEnabled: asBoolean(audio.ambienceEnabled, defaults.audio.ambienceEnabled),
      uiSoundsEnabled: asBoolean(audio.uiSoundsEnabled, defaults.audio.uiSoundsEnabled),
      muted: asBoolean(audio.muted, defaults.audio.muted),
    },
    graphics: {
      qualityPreset: asEnum(graphics.qualityPreset, QUALITY_PRESETS, defaults.graphics.qualityPreset),
      particleDensity: asEnum(
        graphics.particleDensity,
        PARTICLE_DENSITIES,
        defaults.graphics.particleDensity,
      ),
      cosmicGlow: asBoolean(graphics.cosmicGlow, defaults.graphics.cosmicGlow),
      lensShimmer: asBoolean(graphics.lensShimmer, defaults.graphics.lensShimmer),
      targetFps: asEnum(
        graphics.targetFps == null ? null : String(graphics.targetFps),
        TARGET_FPS_OPTIONS,
        defaults.graphics.targetFps,
      ),
    },
    controls: {
      invertY: asBoolean(controls.invertY, defaults.controls.invertY),
      sensitivity: clampNumber(controls.sensitivity, 1, 10, defaults.controls.sensitivity),
      flightModel: asEnum(controls.flightModel, FLIGHT_MODELS, defaults.controls.flightModel),
      subtitles: asBoolean(controls.subtitles, defaults.controls.subtitles),
    },
  };
}

function browserStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage || null;
  } catch {
    return null;
  }
}

export function readStoredSettings(storage = browserStorage()) {
  if (!storage) return createDefaultSettings();
  try {
    const raw = storage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return createDefaultSettings();
    return normaliseSettings(JSON.parse(raw));
  } catch {
    return createDefaultSettings();
  }
}

export function writeStoredSettings(settings, storage = browserStorage()) {
  if (!storage) return false;
  try {
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normaliseSettings(settings)));
    return true;
  } catch {
    return false;
  }
}

/** Synchronous read used by the audio engine and first render. */
export function getSettings() {
  return readStoredSettings();
}

/** Persist to the local fallback cache. */
export function saveSettings(settings) {
  return writeStoredSettings(settings);
}
