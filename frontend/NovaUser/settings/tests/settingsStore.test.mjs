import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_GAME_SETTINGS,
  createDefaultSettings,
  normaliseSettings,
  readStoredSettings,
  writeStoredSettings,
} from '../store/settingsStore.js';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

test('createDefaultSettings returns an independent copy', () => {
  const first = createDefaultSettings();
  const second = createDefaultSettings();
  first.audio.masterVolume = 1;
  assert.equal(second.audio.masterVolume, DEFAULT_GAME_SETTINGS.audio.masterVolume);
});

test('normaliseSettings merges partial settings with defaults', () => {
  const settings = normaliseSettings({ audio: { muted: true } });
  assert.equal(settings.audio.muted, true);
  assert.equal(settings.audio.masterVolume, DEFAULT_GAME_SETTINGS.audio.masterVolume);
  assert.equal(settings.controls.flightModel, DEFAULT_GAME_SETTINGS.controls.flightModel);
});

test('normaliseSettings clamps numbers and rejects invalid enums', () => {
  const settings = normaliseSettings({
    audio: { masterVolume: 500, musicVolume: -20 },
    graphics: { qualityPreset: 'Cinematic', targetFps: 240 },
    controls: { sensitivity: 99 },
  });
  assert.equal(settings.audio.masterVolume, 100);
  assert.equal(settings.audio.musicVolume, 0);
  assert.equal(settings.graphics.qualityPreset, DEFAULT_GAME_SETTINGS.graphics.qualityPreset);
  assert.equal(settings.graphics.targetFps, DEFAULT_GAME_SETTINGS.graphics.targetFps);
  assert.equal(settings.controls.sensitivity, 10);
});

test('normaliseSettings falls back to defaults for invalid payloads', () => {
  assert.deepEqual(normaliseSettings(null), createDefaultSettings());
  assert.deepEqual(normaliseSettings('nope'), createDefaultSettings());
  assert.deepEqual(normaliseSettings([]), createDefaultSettings());
});

test('readStoredSettings reads and normalises localStorage values', () => {
  const storage = memoryStorage({
    novaquest_game_settings: JSON.stringify({ audio: { masterVolume: 25, muted: true } }),
  });
  const settings = readStoredSettings(storage);
  assert.equal(settings.audio.masterVolume, 25);
  assert.equal(settings.audio.muted, true);
  assert.equal(settings.graphics.qualityPreset, 'High');
});

test('readStoredSettings survives malformed JSON', () => {
  const storage = memoryStorage({ novaquest_game_settings: '{not json' });
  assert.deepEqual(readStoredSettings(storage), createDefaultSettings());
});

test('writeStoredSettings persists a normalised snapshot', () => {
  const storage = memoryStorage();
  const ok = writeStoredSettings({ audio: { masterVolume: 250 } }, storage);
  assert.equal(ok, true);
  const stored = JSON.parse(storage.getItem('novaquest_game_settings'));
  assert.equal(stored.audio.masterVolume, 100);
  assert.equal(stored.graphics.qualityPreset, 'High');
});
