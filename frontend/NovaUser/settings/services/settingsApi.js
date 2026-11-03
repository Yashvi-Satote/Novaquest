/**
 * NovaUser game-settings API client.
 *
 * Requests use the same HTTP-only cookie session as the rest of NovaUser, so
 * no token is ever handled by JavaScript.
 */

const API_BASE = '/api/novauser/settings';
const REQUEST_TIMEOUT_MS = 10000;

export class SettingsApiError extends Error {
  constructor(message, { code = 'request_failed', status = 0, fields = {} } = {}) {
    super(message);
    this.name = 'SettingsApiError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, { method = 'GET', body } = {}) {
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
    throw new SettingsApiError(
      'Unable to reach the settings service. Your changes are saved on this device.',
      { code: 'network_error' },
    );
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
    throw new SettingsApiError(
      error.message || 'Could not save your settings. Please try again.',
      {
        code: error.code || 'request_failed',
        status: response.status,
        fields: error.fields || {},
      },
    );
  }

  return payload;
}

function toRecord(payload) {
  return {
    settings: payload?.settings ?? null,
    updatedAt: payload?.updated_at ?? null,
    exists: Boolean(payload?.exists ?? payload?.updated_at),
  };
}

export async function fetchGameSettingsRecord() {
  return toRecord(await request('/game'));
}

export async function saveGameSettingsRecord(settings) {
  return toRecord(await request('/game', { method: 'PUT', body: { settings } }));
}

export async function fetchGameSettings() {
  return (await fetchGameSettingsRecord()).settings;
}

export async function saveGameSettings(settings) {
  return (await saveGameSettingsRecord(settings)).settings ?? settings;
}
