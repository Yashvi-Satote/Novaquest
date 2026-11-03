/**
 * Local persistence for the NovaQuest Continue checkpoint.
 *
 * Guests use this directly; signed-in users keep it as an offline cache that
 * progressRepository hydrates from and syncs to the account.
 */

import { getLocalStorage, readRaw, removeRaw, writeRaw } from '../../Shared/services/localStore.js';

export const PROGRESS_STORAGE_KEY = 'novaquest_save_game';
export const PROGRESS_UPDATED_AT_KEY = 'novaquest_save_game_updated_at';

function readTimestamp(storage) {
  const raw = readRaw(PROGRESS_UPDATED_AT_KEY, storage);
  if (!raw) return null;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
}

export function readProgress(storage = getLocalStorage()) {
  const raw = readRaw(PROGRESS_STORAGE_KEY, storage);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasProgress(storage = getLocalStorage()) {
  const raw = readRaw(PROGRESS_STORAGE_KEY, storage);
  return raw !== null && raw.length > 10;
}

export function readProgressSnapshot(storage = getLocalStorage()) {
  const progress = readProgress(storage);
  return {
    exists: Boolean(progress),
    progress,
    updatedAt: readTimestamp(storage) ?? (Number.isFinite(progress?.timestamp) ? progress.timestamp : null),
  };
}

export function writeProgress(
  saveData,
  storage = getLocalStorage(),
  { updatedAt = Date.now(), touchTimestamp = true } = {},
) {
  try {
    const data = touchTimestamp
      ? { ...saveData, timestamp: Date.now() }
      : { ...saveData };
    const ok = writeRaw(PROGRESS_STORAGE_KEY, JSON.stringify(data), storage);
    if (ok && Number.isFinite(updatedAt)) {
      writeRaw(PROGRESS_UPDATED_AT_KEY, String(updatedAt), storage);
    }
    return ok;
  } catch {
    return false;
  }
}

export function clearProgress(storage = getLocalStorage()) {
  removeRaw(PROGRESS_STORAGE_KEY, storage);
  removeRaw(PROGRESS_UPDATED_AT_KEY, storage);
  return true;
}
