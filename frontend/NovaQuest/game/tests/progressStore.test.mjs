import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PROGRESS_STORAGE_KEY,
  PROGRESS_UPDATED_AT_KEY,
  clearProgress,
  hasProgress,
  readProgress,
  readProgressSnapshot,
  writeProgress,
} from '../progressStore.js';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

test('writeProgress stores the checkpoint, a timestamp and an updated-at marker', () => {
  const storage = memoryStorage();
  const ok = writeProgress({ chapter: 2, score: 1200 }, storage, { updatedAt: 5000 });
  assert.equal(ok, true);
  assert.deepEqual(readProgress(storage), {
    chapter: 2,
    score: 1200,
    timestamp: readProgress(storage).timestamp,
  });
  assert.ok(Number.isFinite(readProgress(storage).timestamp));
  assert.equal(storage.getItem(PROGRESS_UPDATED_AT_KEY), '5000');
});

test('writeProgress can preserve an existing checkpoint timestamp', () => {
  const storage = memoryStorage();
  writeProgress({ chapter: 2, timestamp: 1234 }, storage, {
    updatedAt: 9000,
    touchTimestamp: false,
  });
  assert.equal(readProgress(storage).timestamp, 1234);
  assert.equal(storage.getItem(PROGRESS_UPDATED_AT_KEY), '9000');
});

test('readProgressSnapshot reports existence, data and the newest timestamp', () => {
  const empty = readProgressSnapshot(memoryStorage());
  assert.deepEqual(empty, { exists: false, progress: null, updatedAt: null });

  const storage = memoryStorage({
    [PROGRESS_STORAGE_KEY]: JSON.stringify({ chapter: 3, timestamp: 700 }),
    [PROGRESS_UPDATED_AT_KEY]: '2000',
  });
  const snapshot = readProgressSnapshot(storage);
  assert.equal(snapshot.exists, true);
  assert.equal(snapshot.progress.chapter, 3);
  assert.equal(snapshot.updatedAt, 2000);
});

test('readProgressSnapshot falls back to the checkpoint timestamp', () => {
  const storage = memoryStorage({
    [PROGRESS_STORAGE_KEY]: JSON.stringify({ chapter: 3, timestamp: 700 }),
  });
  assert.equal(readProgressSnapshot(storage).updatedAt, 700);
});

test('readProgress survives malformed JSON and hasProgress ignores empty values', () => {
  const storage = memoryStorage({ [PROGRESS_STORAGE_KEY]: '{not json' });
  assert.equal(readProgress(storage), null);
  assert.equal(hasProgress(storage), false);
});

test('clearProgress removes both checkpoint and timestamp', () => {
  const storage = memoryStorage({
    [PROGRESS_STORAGE_KEY]: JSON.stringify({ chapter: 1 }),
    [PROGRESS_UPDATED_AT_KEY]: '1',
  });
  assert.equal(clearProgress(storage), true);
  assert.equal(readProgress(storage), null);
  assert.equal(storage.getItem(PROGRESS_UPDATED_AT_KEY), null);
});
