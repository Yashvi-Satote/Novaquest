/**
 * Source-agnostic game-settings repository.
 *
 * Guests read/write localStorage. Signed-in users write the local cache first
 * (so the game keeps working offline), then sync to the account. When a user
 * signs in, the most recently updated snapshot wins and the caller receives a
 * human-readable notice describing what happened.
 */

import { isAuthenticated } from '../../services/authSession.js';
import { fetchGameSettingsRecord, saveGameSettingsRecord } from './settingsApi.js';
import {
  createDefaultSettings,
  normaliseSettings,
  readStoredSettingsSnapshot,
  writeStoredSettings,
} from '../store/settingsStore.js';

function asTimestamp(value) {
  if (value == null) return null;
  const numeric = typeof value === 'number' ? value : Date.parse(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function mergeSettingsSnapshots(local, remote) {
  const localExists = Boolean(local?.exists);
  const remoteExists = Boolean(remote?.exists);

  if (!remoteExists) {
    if (localExists) {
      return {
        action: 'upload',
        settings: normaliseSettings(local.settings),
        notice: 'Your settings from this device were uploaded to your account.',
      };
    }
    return {
      action: 'none',
      settings: normaliseSettings(remote?.settings),
      notice: '',
    };
  }

  if (!localExists) {
    return {
      action: 'download',
      settings: normaliseSettings(remote.settings),
      notice: 'Your account settings were loaded on this device.',
    };
  }

  const localUpdatedAt = asTimestamp(local.updatedAt);
  const remoteUpdatedAt = asTimestamp(remote.updatedAt);

  if (localUpdatedAt != null && (remoteUpdatedAt == null || localUpdatedAt > remoteUpdatedAt)) {
    return {
      action: 'upload',
      settings: normaliseSettings(local.settings),
      notice: 'This device had newer settings, so they were uploaded to your account.',
    };
  }

  return {
    action: 'download',
    settings: normaliseSettings(remote.settings),
    notice: 'Your account settings were newer, so they replaced the settings on this device.',
  };
}

export async function loadSettingsSnapshot() {
  const local = readStoredSettingsSnapshot();

  if (!isAuthenticated()) {
    return {
      settings: normaliseSettings(local.settings),
      savedSettings: normaliseSettings(local.settings),
      status: 'guest',
      notice: '',
    };
  }

  const record = await fetchGameSettingsRecord();
  const remote = {
    exists: record.exists,
    settings: record.settings ?? createDefaultSettings(),
    updatedAt: record.updatedAt,
  };
  const decision = mergeSettingsSnapshots(local, remote);
  let settings = decision.settings;

  if (decision.action === 'upload') {
    const saved = await saveGameSettingsRecord(settings);
    settings = normaliseSettings(saved.settings ?? settings);
    writeStoredSettings(settings, undefined, { updatedAt: asTimestamp(saved.updatedAt) ?? Date.now() });
  } else if (decision.action === 'download') {
    writeStoredSettings(settings, undefined, { updatedAt: asTimestamp(remote.updatedAt) ?? Date.now() });
  }

  return {
    settings,
    savedSettings: settings,
    status: 'ready',
    notice: decision.notice,
  };
}

/**
 * Persist a settings snapshot. The local cache is always written; the account
 * copy is additionally written when a session is active.
 */
export async function persistSettingsSnapshot(snapshot) {
  const normalised = normaliseSettings(snapshot);
  writeStoredSettings(normalised);

  if (!isAuthenticated()) {
    return {
      settings: normalised,
      savedToAccount: false,
      notice: 'Game settings saved on this device.',
    };
  }

  const saved = await saveGameSettingsRecord(normalised);
  const settings = normaliseSettings(saved.settings ?? normalised);
  writeStoredSettings(settings, undefined, { updatedAt: asTimestamp(saved.updatedAt) ?? Date.now() });

  return {
    settings,
    savedToAccount: true,
    notice: 'Game settings saved to your account.',
  };
}

/** Persist only to the local cache (used by live slider changes). */
export function persistLocalSettingsSnapshot(snapshot) {
  writeStoredSettings(snapshot);
}
