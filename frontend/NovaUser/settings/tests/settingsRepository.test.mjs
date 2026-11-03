import assert from 'node:assert/strict';
import test from 'node:test';
import { AUTH_STATUS, setAuthSession } from '../../services/authSession.js';
import {
  createDefaultSettings,
  readStoredSettings,
  readStoredSettingsUpdatedAt,
  SETTINGS_UPDATED_AT_KEY,
} from '../store/settingsStore.js';
import {
  loadSettingsSnapshot,
  mergeSettingsSnapshots,
  persistSettingsSnapshot,
} from '../services/settingsRepository.js';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    dump: () => Object.fromEntries(values),
  };
}

function settingsWith(volume) {
  const settings = createDefaultSettings();
  settings.audio.masterVolume = volume;
  return settings;
}

function withBrowser(storage, fetcher) {
  globalThis.window = { localStorage: storage };
  if (fetcher) globalThis.fetch = fetcher;
}

function resetBrowser() {
  delete globalThis.window;
  delete globalThis.fetch;
}

test('mergeSettingsSnapshots uploads a local snapshot when the account is empty', () => {
  const local = { exists: true, settings: settingsWith(20), updatedAt: 100 };
  const remote = { exists: false, settings: createDefaultSettings(), updatedAt: null };
  const decision = mergeSettingsSnapshots(local, remote);
  assert.equal(decision.action, 'upload');
  assert.equal(decision.settings.audio.masterVolume, 20);
  assert.match(decision.notice, /uploaded/i);
});

test('mergeSettingsSnapshots does nothing when neither side has settings', () => {
  const decision = mergeSettingsSnapshots(
    { exists: false, settings: createDefaultSettings() },
    { exists: false, settings: createDefaultSettings() },
  );
  assert.equal(decision.action, 'none');
  assert.equal(decision.notice, '');
});

test('mergeSettingsSnapshots downloads account settings for a new device', () => {
  const remote = { exists: true, settings: settingsWith(40), updatedAt: 200 };
  const decision = mergeSettingsSnapshots({ exists: false }, remote);
  assert.equal(decision.action, 'download');
  assert.equal(decision.settings.audio.masterVolume, 40);
  assert.match(decision.notice, /loaded/i);
});

test('mergeSettingsSnapshots uploads when this device is newer', () => {
  const decision = mergeSettingsSnapshots(
    { exists: true, settings: settingsWith(30), updatedAt: 300 },
    { exists: true, settings: settingsWith(10), updatedAt: 200 },
  );
  assert.equal(decision.action, 'upload');
  assert.equal(decision.settings.audio.masterVolume, 30);
});

test('mergeSettingsSnapshots downloads when the account is newer or tied', () => {
  const newer = mergeSettingsSnapshots(
    { exists: true, settings: settingsWith(30), updatedAt: 100 },
    { exists: true, settings: settingsWith(50), updatedAt: 200 },
  );
  assert.equal(newer.action, 'download');
  assert.equal(newer.settings.audio.masterVolume, 50);

  const tied = mergeSettingsSnapshots(
    { exists: true, settings: settingsWith(30), updatedAt: 200 },
    { exists: true, settings: settingsWith(50), updatedAt: 200 },
  );
  assert.equal(tied.action, 'download');
  assert.equal(tied.settings.audio.masterVolume, 50);
});

test('mergeSettingsSnapshots accepts ISO timestamps and normalises the winner', () => {
  const decision = mergeSettingsSnapshots(
    { exists: true, settings: { audio: { masterVolume: 300 } }, updatedAt: '2026-01-02T00:00:00Z' },
    { exists: true, settings: settingsWith(10), updatedAt: '2026-01-01T00:00:00Z' },
  );
  assert.equal(decision.action, 'upload');
  assert.equal(decision.settings.audio.masterVolume, 100);
});

test('guest loads and saves stay in localStorage without network calls', async () => {
  const storage = memoryStorage();
  let calls = 0;
  withBrowser(storage, async () => {
    calls += 1;
    throw new Error('guests must not call the account API');
  });
  setAuthSession(AUTH_STATUS.GUEST, null);

  try {
    const loaded = await loadSettingsSnapshot();
    assert.equal(loaded.status, 'guest');
    assert.equal(loaded.settings.audio.masterVolume, 80);

    const saved = await persistSettingsSnapshot(settingsWith(35));
    assert.equal(saved.savedToAccount, false);
    assert.equal(saved.settings.audio.masterVolume, 35);
    assert.equal(readStoredSettings(storage).audio.masterVolume, 35);
    assert.equal(calls, 0);
  } finally {
    resetBrowser();
  }
});

test('authenticated load uploads a newer local snapshot and records the server time', async () => {
  const storage = memoryStorage();
  const local = settingsWith(25);
  storage.setItem('novaquest_game_settings', JSON.stringify(local));
  storage.setItem(SETTINGS_UPDATED_AT_KEY, '1000');

  const requests = [];
  withBrowser(storage, async (url, options = {}) => {
    requests.push({ url, method: options.method || 'GET' });
    if (!options.method || options.method === 'GET') {
      return new Response(JSON.stringify({ exists: false }), { status: 200 });
    }
    return new Response(
      JSON.stringify({ settings: local, updated_at: '2026-02-01T12:00:00Z' }),
      { status: 200 },
    );
  });
  setAuthSession(AUTH_STATUS.AUTHENTICATED, { id: 'user-1' });

  try {
    const snapshot = await loadSettingsSnapshot();
    assert.equal(snapshot.status, 'ready');
    assert.equal(snapshot.settings.audio.masterVolume, 25);
    assert.match(snapshot.notice, /uploaded/i);
    assert.deepEqual(requests.map((request) => request.method), ['GET', 'PUT']);
    assert.equal(
      readStoredSettingsUpdatedAt(storage),
      Date.parse('2026-02-01T12:00:00Z'),
    );
  } finally {
    resetBrowser();
  }
});

test('authenticated load downloads a newer account snapshot into the cache', async () => {
  const storage = memoryStorage();
  const local = settingsWith(25);
  storage.setItem('novaquest_game_settings', JSON.stringify(local));
  storage.setItem(SETTINGS_UPDATED_AT_KEY, '1000');

  const remote = settingsWith(65);
  withBrowser(storage, async () =>
    new Response(
      JSON.stringify({ exists: true, settings: remote, updated_at: '2026-03-01T12:00:00Z' }),
      { status: 200 },
    ),
  );
  setAuthSession(AUTH_STATUS.AUTHENTICATED, { id: 'user-1' });

  try {
    const snapshot = await loadSettingsSnapshot();
    assert.equal(snapshot.settings.audio.masterVolume, 65);
    assert.match(snapshot.notice, /replaced/i);
    assert.equal(readStoredSettings(storage).audio.masterVolume, 65);
    assert.equal(
      readStoredSettingsUpdatedAt(storage),
      Date.parse('2026-03-01T12:00:00Z'),
    );
  } finally {
    resetBrowser();
  }
});
