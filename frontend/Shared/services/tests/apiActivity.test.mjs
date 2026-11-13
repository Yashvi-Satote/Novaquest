import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getActiveApiRequestCount,
  trackedFetch,
} from '../apiActivity.js';

test('trackedFetch counts active API requests and clears the count on success', async () => {
  const originalFetch = globalThis.fetch;
  let resolveResponse;
  globalThis.fetch = () => new Promise((resolve) => {
    resolveResponse = resolve;
  });

  try {
    const request = trackedFetch('/api/test');
    assert.equal(getActiveApiRequestCount(), 1);
    resolveResponse({ ok: true });
    await request;
    assert.equal(getActiveApiRequestCount(), 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('trackedFetch clears the active count when fetch rejects', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => Promise.reject(new Error('offline'));

  try {
    await assert.rejects(trackedFetch('/api/test'), /offline/);
    assert.equal(getActiveApiRequestCount(), 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
