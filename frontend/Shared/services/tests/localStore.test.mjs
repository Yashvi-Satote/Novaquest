import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getLocalStorage,
  readJson,
  readRaw,
  removeRaw,
  writeJson,
  writeRaw,
} from '../localStore.js';

export function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

const brokenStorage = {
  getItem() {
    throw new Error('storage unavailable');
  },
  setItem() {
    throw new Error('quota exceeded');
  },
  removeItem() {
    throw new Error('storage unavailable');
  },
};

test('readRaw and writeRaw round-trip values', () => {
  const storage = memoryStorage();
  assert.equal(writeRaw('key', 'value', storage), true);
  assert.equal(readRaw('key', storage), 'value');
  assert.equal(writeRaw('second', 'other', storage), true);
  assert.equal(readRaw('second', storage), 'other');
});

test('readRaw returns null for a missing key', () => {
  assert.equal(readRaw('missing', memoryStorage()), null);
});

test('removeRaw deletes an existing key', () => {
  const storage = memoryStorage({ key: 'value' });
  assert.equal(removeRaw('key', storage), true);
  assert.equal(readRaw('key', storage), null);
});

test('JSON helpers round-trip objects and survive malformed values', () => {
  const storage = memoryStorage({ broken: '{not json' });
  assert.equal(writeJson('settings', { audio: { muted: true } }, storage), true);
  assert.deepEqual(readJson('settings', null, storage), { audio: { muted: true } });
  assert.equal(readJson('broken', 'fallback', storage), 'fallback');
  assert.equal(readJson('missing', 'fallback', storage), 'fallback');
});

test('storage failures never throw', () => {
  assert.equal(readRaw('key', brokenStorage), null);
  assert.equal(writeRaw('key', 'value', brokenStorage), false);
  assert.equal(removeRaw('key', brokenStorage), false);
  assert.equal(readJson('key', 'fallback', brokenStorage), 'fallback');
  assert.equal(writeJson('key', { a: 1 }, brokenStorage), false);
});

test('missing storage is handled without throwing', () => {
  assert.equal(readRaw('key', null), null);
  assert.equal(writeRaw('key', 'value', null), false);
  assert.equal(removeRaw('key', null), false);
});

test('getLocalStorage returns null outside a browser', () => {
  assert.equal(typeof window, 'undefined');
  assert.equal(getLocalStorage(), null);
});
