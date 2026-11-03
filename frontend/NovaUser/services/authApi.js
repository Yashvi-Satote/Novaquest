/**
 * Minimal NovaUser API client.
 *
 * Authentication is cookie based: the backend sets an HTTP-only cookie and the
 * browser sends it automatically because every request uses
 * ``credentials: 'include'``.  The JWT is never written to localStorage.
 */

const API_BASE = '/api/novauser';

export class AuthApiError extends Error {
  constructor(message, { code = 'request_failed', status = 0, fields = {} } = {}) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AuthApiError('Unable to reach the account service. Check your connection and try again.', {
      code: 'network_error',
    });
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const error = payload?.error;
    throw new AuthApiError(
      error?.message || 'Something went wrong. Please try again.',
      {
        code: error?.code || 'request_failed',
        status: response.status,
        fields: error?.fields || {},
      },
    );
  }

  return payload;
}

/**
 * Exchange a Firebase ID token for a NovaUser HTTP-only JWT session.
 *
 * The token is verified server-side with Firebase's public certificates; the
 * backend never trusts a UID or email supplied by the browser.
 */
export function exchangeFirebaseToken(idToken) {
  return request('/auth/firebase', {
    method: 'POST',
    body: { id_token: idToken },
  });
}

export function fetchCurrentUser() {
  return request('/auth/me');
}

export function signOut() {
  return request('/auth/logout', { method: 'POST' });
}

export function fetchAuthHealth() {
  return request('/health');
}
