import assert from 'node:assert/strict';
import test from 'node:test';
import { AUTH_STATUS, setAuthSession } from '../../../NovaUser/services/authSession.js';
import { PROGRESS_STORAGE_KEY, readProgress } from '../progressStore.js';
import {
  clearProgressSyncNotice,
  getProgressSyncNotice,
  mergeProgressSnapshots,
  saveProgress,
  syncProgressWithAccount,
} from '../progressRepository.js';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function withBrowser(storage, fetcher) {
  globalThis.window = { localStorage: storage };
  if (fetcher) globalThis.fetch = fetcher;
}

function resetBrowser() {
  delete globalThis.window;
  delete globalThis.fetch;
}

test('mergeProgressSnapshots uploads a device save when the account is empty', () => {
  const progress = { chapter: 2, timestamp: 100 };
  const decision = mergeProgressSnapshots(
    { exists: true, progress, updatedAt: 100 },
    { exists: false, progress: null, updatedAt: null },
  );
  assert.equal(decision.action, 'upload');
  assert.deepEqual(decision.progress, progress);
  assert.match(decision.notice, /uploaded/i);
});

test('mergeProgressSnapshots reports nothing to merge for two empty saves', () => {
  const decision = mergeProgressSnapshots(
    { exists: false, progress: null },
    { exists: false, progress: null },
  );
  assert.deepEqual(decision, { action: 'none', progress: null, notice: '' });
});

test('mergeProgressSnapshots loads an account save onto a new device', () => {
  const progress = { chapter: 4 };
  const decision = mergeProgressSnapshots(
    { exists: false, progress: null },
    { exists: true, progress, updatedAt: 400 },
  );
  assert.equal(decision.action, 'download');
  assert.deepEqual(decision.progress, progress);
});

test('mergeProgressSnapshots uploads the newer device save', () => {
  const decision = mergeProgressSnapshots(
    { exists: true, progress: { chapter: 5, timestamp: 500 }, updatedAt: 500 },
    { exists: true, progress: { chapter: 3 }, updatedAt: 300 },
  );
  assert.equal(decision.action, 'upload');
  assert.equal(decision.progress.chapter, 5);
});

test('mergeProgressSnapshots downloads the newer account save', () => {
  const decision = mergeProgressSnapshots(
    { exists: true, progress: { chapter: 5, timestamp: 100 }, updatedAt: 100 },
    { exists: true, progress: { chapter: 6 }, updatedAt: 600 },
  );
  assert.equal(decision.action, 'download');
  assert.equal(decision.progress.chapter, 6);
});

test('mergeProgressSnapshots falls back to the embedded save timestamp', () => {
  const decision = mergeProgressSnapshots(
    { exists: true, progress: { chapter: 7, timestamp: 700 }, updatedAt: null },
    { exists: true, progress: { chapter: 6 }, updatedAt: 600 },
  );
  assert.equal(decision.action, 'upload');
  assert.equal(decision.progress.chapter, 7);
});

test('mergeProgressSnapshots accepts ISO timestamps', () => {
  const decision = mergeProgressSnapshots(
    { exists: true, progress: { chapter: 2 }, updatedAt: '2026-04-02T00:00:00Z' },
    { exists: true, progress: { chapter: 1 }, updatedAt: '2026-04-01T00:00:00Z' },
  );
  assert.equal(decision.action, 'upload');
});

test('guest saves stay in localStorage and never call the account API', () => {
  const storage = memoryStorage();
  let calls = 0;
  withBrowser(storage, async () => {
    calls += 1;
    throw new Error('guests must not call the progress API');
  });
  setAuthSession(AUTH_STATUS.GUEST, null);

  try {
    assert.equal(saveProgress({ chapter: 1, score: 10 }), true);
    assert.equal(readProgress(storage).chapter, 1);
    assert.equal(calls, 0);
  } finally {
    resetBrowser();
  }
});

test('authenticated sync uploads a newer local save and records a notice', async () => {
  const storage = memoryStorage();
  saveProgressForTest(storage, { chapter: 3, timestamp: 5000 });
  storage.setItem('novaquest_save_game_updated_at', '5000');

  const methods = [];
  withBrowser(storage, async (url, options = {}) => {
    const method = options.method || 'GET';
    methods.push(method);
    if (method === 'GET') {
      return new Response(JSON.stringify({ exists: false, progress: null }), { status: 200 });
    }
    return new Response(
      JSON.stringify({
        exists: true,
        progress: { chapter: 3, timestamp: 5000 },
        updated_at: '2026-05-01T00:00:00Z',
      }),
      { status: 200 },
    );
  });
  setAuthSession(AUTH_STATUS.AUTHENTICATED, { id: 'user-1' });
  clearProgressSyncNotice();

  try {
    const result = await syncProgressWithAccount();
    assert.equal(result.status, 'ready');
    assert.equal(result.action, 'upload');
    assert.deepEqual(methods, ['GET', 'PUT']);
    assert.match(getProgressSyncNotice(), /uploaded/i);
    assert.equal(readProgress(storage).chapter, 3);
  } finally {
    resetBrowser();
  }
});

test('authenticated sync downloads a newer account save into the cache', async () => {
  const storage = memoryStorage();
  saveProgressForTest(storage, { chapter: 1, timestamp: 1000 });
  storage.setItem('novaquest_save_game_updated_at', '1000');

  withBrowser(storage, async () =>
    new Response(
      JSON.stringify({
        exists: true,
        progress: { chapter: 9 },
        updated_at: '2026-06-01T00:00:00Z',
      }),
      { status: 200 },
    ),
  );
  setAuthSession(AUTH_STATUS.AUTHENTICATED, { id: 'user-1' });
  clearProgressSyncNotice();

  try {
    const result = await syncProgressWithAccount();
    assert.equal(result.action, 'download');
    assert.equal(readProgress(storage).chapter, 9);
    assert.match(getProgressSyncNotice(), /newer/i);
  } finally {
    resetBrowser();
  }
});

test('sync failures are silent and leave local progress intact', async () => {
  const storage = memoryStorage();
  saveProgressForTest(storage, { chapter: 2, timestamp: 2000 });
  storage.setItem('novaquest_save_game_updated_at', '2000');

  withBrowser(storage, async () => {
    throw new Error('502 Bad Gateway');
  });
  setAuthSession(AUTH_STATUS.AUTHENTICATED, { id: 'user-1' });
  clearProgressSyncNotice();

  try {
    const result = await syncProgressWithAccount();
    assert.deepEqual(result, { status: 'error', notice: '' });
    assert.equal(getProgressSyncNotice(), null);
    assert.equal(readProgress(storage).chapter, 2);
  } finally {
    resetBrowser();
  }
});

test('concurrent syncs share one request', async () => {
  const storage = memoryStorage();
  let gets = 0;
  withBrowser(storage, async () => {
    gets += 1;
    return new Response(JSON.stringify({ exists: false, progress: null }), { status: 200 });
  });
  setAuthSession(AUTH_STATUS.AUTHENTICATED, { id: 'user-1' });

  try {
    const [first, second] = await Promise.all([
      syncProgressWithAccount(),
      syncProgressWithAccount(),
    ]);
    assert.equal(gets, 1);
    assert.equal(first.action, 'none');
    assert.equal(second.action, 'none');
  } finally {
    resetBrowser();
  }
});

test('signed-out sync never calls the network', async () => {
  let calls = 0;
  withBrowser(memoryStorage(), async () => {
    calls += 1;
    return new Response('{}', { status: 200 });
  });
  setAuthSession(AUTH_STATUS.GUEST, null);

  try {
    const result = await syncProgressWithAccount();
    assert.deepEqual(result, { status: 'guest', notice: '' });
    assert.equal(calls, 0);
  } finally {
    resetBrowser();
  }
});

function saveProgressForTest(storage, progress) {
  storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}
