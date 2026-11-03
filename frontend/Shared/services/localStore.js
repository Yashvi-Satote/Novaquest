/**
 * Small, safe localStorage wrapper used by guest persistence and the
 * settings/progress repositories.
 *
 * Every access is guarded so private browsing, disabled storage or a full
 * quota can never crash the application.
 */

export function getLocalStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage || null;
  } catch {
    return null;
  }
}

export function readRaw(key, storage = getLocalStorage()) {
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function writeRaw(key, value, storage = getLocalStorage()) {
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeRaw(key, storage = getLocalStorage()) {
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function readJson(key, fallback = null, storage = getLocalStorage()) {
  const raw = readRaw(key, storage);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value, storage = getLocalStorage()) {
  try {
    return writeRaw(key, JSON.stringify(value), storage);
  } catch {
    return false;
  }
}
