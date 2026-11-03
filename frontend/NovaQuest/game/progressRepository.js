/**
 * Source-agnostic game-progress repository.
 *
 * Guests use localStorage. Signed-in users keep the local cache as an offline
 * first copy and sync the Continue checkpoint to their NovaUser account. On
 * sign-in the most recently updated checkpoint wins and a notice is recorded
 * for the Settings screen.
 */

import { readRaw, removeRaw, writeRaw } from '../../Shared/services/localStore.js';
import { isAuthenticated } from '../../NovaUser/services/authSession.js';
import { deleteGameProgress, fetchGameProgressRecord, saveGameProgress } from './progressApi.js';
import {
  clearProgress,
  readProgressSnapshot,
  writeProgress,
} from './progressStore.js';

export const PROGRESS_CHANGED_EVENT = 'novaquest:progress-changed';
export const PROGRESS_NOTICE_KEY = 'novaquest_progress_sync_notice';

let syncPromise = null;

function asTimestamp(value) {
  if (value == null) return null;
  const numeric = typeof value === 'number' ? value : Date.parse(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function emitProgressChanged() {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  try {
    window.dispatchEvent(new window.CustomEvent(PROGRESS_CHANGED_EVENT));
  } catch {
    // CustomEvent is unavailable in some non-browser test environments.
  }
}

function writeNotice(notice) {
  if (!notice) {
    removeRaw(PROGRESS_NOTICE_KEY);
    return;
  }
  writeRaw(PROGRESS_NOTICE_KEY, notice);
}

export function getProgressSyncNotice() {
  return readRaw(PROGRESS_NOTICE_KEY);
}

export function clearProgressSyncNotice() {
  removeRaw(PROGRESS_NOTICE_KEY);
}

export function subscribeProgress(listener) {
  if (typeof window === 'undefined' || typeof listener !== 'function') return () => {};
  const handler = () => listener();
  window.addEventListener(PROGRESS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(PROGRESS_CHANGED_EVENT, handler);
}

export function mergeProgressSnapshots(local, remote) {
  const localExists = Boolean(local?.exists && local.progress);
  const remoteExists = Boolean(remote?.exists && remote.progress);

  if (!remoteExists) {
    if (localExists) {
      return {
        action: 'upload',
        progress: local.progress,
        notice: 'Your saved game on this device was uploaded to your account.',
      };
    }
    return { action: 'none', progress: null, notice: '' };
  }

  if (!localExists) {
    return {
      action: 'download',
      progress: remote.progress,
      notice: 'Your account save was loaded on this device.',
    };
  }

  const localUpdatedAt =
    asTimestamp(local.updatedAt) ?? asTimestamp(local.progress?.timestamp);
  const remoteUpdatedAt = asTimestamp(remote.updatedAt);

  if (localUpdatedAt != null && (remoteUpdatedAt == null || localUpdatedAt > remoteUpdatedAt)) {
    return {
      action: 'upload',
      progress: local.progress,
      notice: 'This device had newer game progress, so it was uploaded to your account.',
    };
  }

  return {
    action: 'download',
    progress: remote.progress,
    notice: 'Your account save was newer, so it replaced the save on this device.',
  };
}

export function getProgress() {
  return readProgressSnapshot().progress;
}

export function hasProgress() {
  return readProgressSnapshot().exists;
}

/** Persist locally, then mirror to the account when signed in. */
export function saveProgress(progress) {
  const written = writeProgress(progress);
  emitProgressChanged();

  if (written && isAuthenticated()) {
    saveGameProgress(progress).catch(() => {
      // Local progress is already safe; retry on the next save.
    });
  }

  return written;
}

/** Remove the local checkpoint and, when signed in, the account copy. */
export function deleteProgress() {
  clearProgress();
  emitProgressChanged();

  if (isAuthenticated()) {
    deleteGameProgress().catch(() => {
      // The local checkpoint is already gone; a later sign-in can retry.
    });
  }

  return true;
}

/**
 * Merge the guest/local checkpoint with the account checkpoint after sign-in.
 * Network failures are silent and never block the app.
 */
export function syncProgressWithAccount() {
  if (!isAuthenticated()) return Promise.resolve({ status: 'guest', notice: '' });
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    const local = readProgressSnapshot();
    let record;
    try {
      record = await fetchGameProgressRecord();
    } catch {
      return { status: 'error', notice: '' };
    }

    const remote = {
      exists: record.exists,
      progress: record.progress,
      updatedAt: record.updatedAt,
    };
    const decision = mergeProgressSnapshots(local, remote);

    try {
      if (decision.action === 'upload') {
        const saved = await saveGameProgress(decision.progress);
        const updatedAt = asTimestamp(saved?.updated_at);
        writeProgress(decision.progress, undefined, {
          updatedAt: updatedAt ?? Date.now(),
          touchTimestamp: false,
        });
      } else if (decision.action === 'download') {
        writeProgress(decision.progress, undefined, {
          updatedAt: asTimestamp(remote.updatedAt) ?? Date.now(),
          touchTimestamp: false,
        });
      }
    } catch {
      return { status: 'error', notice: '' };
    }

    if (decision.action !== 'none') {
      writeNotice(decision.notice);
      emitProgressChanged();
    }

    return { status: 'ready', action: decision.action, notice: decision.notice };
  })().finally(() => {
    syncPromise = null;
  });

  return syncPromise;
}
