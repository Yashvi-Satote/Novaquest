import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AUTH_STATUS,
  getAuthSession,
  isAuthenticated,
  isGuest,
  setAuthSession,
} from '../authSession.js';

function resetSession() {
  setAuthSession(AUTH_STATUS.LOADING, null);
}

test('auth state starts as loading and is neither guest nor authenticated', () => {
  resetSession();
  assert.deepEqual(getAuthSession(), { status: AUTH_STATUS.LOADING, user: null });
  assert.equal(isGuest(), false);
  assert.equal(isAuthenticated(), false);
});

test('guest state clears any user and never grants account access', () => {
  setAuthSession(AUTH_STATUS.AUTHENTICATED, { id: 'user-1' });
  setAuthSession(AUTH_STATUS.GUEST, { id: 'user-1' });
  assert.deepEqual(getAuthSession(), { status: AUTH_STATUS.GUEST, user: null });
  assert.equal(isGuest(), true);
  assert.equal(isAuthenticated(), false);
});

test('authenticated state requires a user with an id', () => {
  setAuthSession(AUTH_STATUS.AUTHENTICATED, { id: 'user-1', email: 'nova@example.test' });
  assert.equal(isAuthenticated(), true);
  assert.equal(isGuest(), false);
  assert.equal(getAuthSession().user.email, 'nova@example.test');
});

test('authenticated state without a usable user id falls back to no account access', () => {
  setAuthSession(AUTH_STATUS.AUTHENTICATED, null);
  assert.equal(isAuthenticated(), false);

  setAuthSession(AUTH_STATUS.AUTHENTICATED, { id: '' });
  assert.equal(isAuthenticated(), false);

  setAuthSession(AUTH_STATUS.AUTHENTICATED, { id: 'user-1' });
  assert.equal(isAuthenticated(), true);
});

test('switching back to loading clears the previous identity', () => {
  setAuthSession(AUTH_STATUS.AUTHENTICATED, { id: 'user-1' });
  setAuthSession(AUTH_STATUS.LOADING, null);
  assert.deepEqual(getAuthSession(), { status: AUTH_STATUS.LOADING, user: null });
  assert.equal(isAuthenticated(), false);
});
