/**
 * NovaUser game-progress API client.
 *
 * Only signed-in users call these endpoints; guests never touch them.
 */

const API_BASE = '/api/novauser/progress';
const REQUEST_TIMEOUT_MS = 10000;

export class ProgressApiError extends Error {
  constructor(message, { code = 'request_failed', status = 0 } = {}) {
    super(message);
    this.name = 'ProgressApiError';
    this.code = code;
    this.status = status;
  }
}

async function request(path = '/game', { method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      signal: controller.signal,
      headers: body
        ? { 'Content-Type': 'application/json', Accept: 'application/json' }
        : { Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ProgressApiError('Unable to reach the progress service.', {
      code: 'network_error',
    });
  } finally {
    clearTimeout(timer);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = payload?.error || {};
    throw new ProgressApiError(error.message || 'Could not sync game progress.', {
      code: error.code || 'request_failed',
      status: response.status,
    });
  }

  return payload;
}

export async function fetchGameProgressRecord() {
  const payload = await request('/game');
  return {
    progress: payload?.progress ?? null,
    updatedAt: payload?.updated_at ?? null,
    exists: Boolean(payload?.exists || payload?.progress),
  };
}

export async function saveGameProgress(progress) {
  return request('/game', { method: 'PUT', body: { progress } });
}

export async function deleteGameProgress() {
  return request('/game', { method: 'DELETE' });
}
