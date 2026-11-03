/**
 * Plain module snapshot of the current auth state.
 *
 * React components use the AuthContext. Non-React services (settings and
 * progress repositories) also need to know whether account storage is
 * available, so AuthProvider mirrors its state here.
 */

export const AUTH_STATUS = Object.freeze({
  LOADING: 'loading',
  GUEST: 'guest',
  AUTHENTICATED: 'authenticated',
});

let snapshot = { status: AUTH_STATUS.LOADING, user: null };

export function setAuthSession(status, user = null) {
  snapshot = {
    status,
    user: status === AUTH_STATUS.AUTHENTICATED ? user : null,
  };
  return snapshot;
}

export function getAuthSession() {
  return snapshot;
}

export function isAuthenticated() {
  return snapshot.status === AUTH_STATUS.AUTHENTICATED && Boolean(snapshot.user?.id);
}

export function isGuest() {
  return snapshot.status === AUTH_STATUS.GUEST;
}
