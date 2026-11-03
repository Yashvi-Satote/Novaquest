import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { exchangeFirebaseToken, fetchCurrentUser, signOut as signOutRequest } from '../services/authApi';
import { AUTH_STATUS, setAuthSession } from '../services/authSession';
import {
  getIdToken,
  isFirebaseConfigured,
  onAuthStateChanged,
  registerWithEmail,
  refreshCurrentUser,
  sendVerificationEmailFor,
  signInAsExampleUser,
  signInWithEmail,
  signInWithGoogle,
  signOutFirebase,
} from '../services/firebase';
import { AuthContext } from './authContext';

/**
 * Firebase is the source of truth for identity. After Firebase authenticates
 * the user, its ID token is exchanged for an HTTP-only NovaUser JWT cookie.
 *
 * Authentication is optional: the app renders immediately and treats a null
 * user as a fully capable guest. A failed background check never logs the user
 * out, shows an app-wide error, or retries in a loop.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [status, setStatus] = useState(AUTH_STATUS.LOADING);
  const [authError, setAuthError] = useState('');
  const mounted = useRef(true);
  const explicitAuth = useRef(false);
  const exchanges = useRef(new Map());

  const applyGuest = useCallback((message = '') => {
    setUser(null);
    setAuthSession(AUTH_STATUS.GUEST, null);
    setStatus(AUTH_STATUS.GUEST);
    setAuthError(message);
  }, []);

  const establishSession = useCallback((fbUser, { forceRefresh = false } = {}) => {
    if (!fbUser) return Promise.reject(new Error('No Firebase user is signed in.'));

    const key = fbUser.uid;
    const pending = exchanges.current.get(key);
    if (pending) return pending;

    const promise = (async () => {
      await fbUser.reload().catch(() => {});
      const token = await getIdToken(fbUser, forceRefresh);
      const data = await exchangeFirebaseToken(token);
      if (mounted.current) {
        setAuthSession(AUTH_STATUS.AUTHENTICATED, data.user);
        setUser(data.user);
        setFirebaseUser(fbUser);
        setStatus(AUTH_STATUS.AUTHENTICATED);
        setAuthError('');
      }
      return data;
    })().finally(() => {
      exchanges.current.delete(key);
    });

    exchanges.current.set(key, promise);
    return promise;
  }, []);

  const failSession = useCallback(
    (error, { silent = false } = {}) => {
      if (!mounted.current) return;
      applyGuest(silent ? '' : error?.message || 'Authentication failed. Please try again.');
      // Never call /auth/logout here: guests must not trigger logout requests,
      // and a temporary backend outage must not destroy a valid Firebase login.
    },
    [applyGuest],
  );

  useEffect(() => {
    mounted.current = true;

    if (!isFirebaseConfigured) {
      setFirebaseUser(null);
      applyGuest('');
      return () => {
        mounted.current = false;
      };
    }

    const unsubscribe = onAuthStateChanged(async (fbUser) => {
      if (!mounted.current) return;
      setFirebaseUser(fbUser);

      if (!fbUser) {
        if (!explicitAuth.current) applyGuest('');
        return;
      }

      // Explicit sign-in/register methods perform their own exchange so they
      // can surface validation errors on the auth page.
      if (explicitAuth.current) return;

      setStatus(AUTH_STATUS.LOADING);
      try {
        await establishSession(fbUser, { forceRefresh: true });
      } catch (error) {
        if (mounted.current) failSession(error, { silent: true });
      }
    });

    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [applyGuest, establishSession, failSession]);

  const login = useCallback(
    async (credentials) => {
      explicitAuth.current = true;
      setAuthError('');
      try {
        const result = await signInWithEmail(credentials);
        const data = await establishSession(result.user, { forceRefresh: true });
        return { ...data, verificationSent: result.verificationSent };
      } catch (error) {
        failSession(error);
        throw error;
      } finally {
        explicitAuth.current = false;
      }
    },
    [establishSession, failSession],
  );

  const register = useCallback(
    async (details) => {
      explicitAuth.current = true;
      setAuthError('');
      try {
        const result = await registerWithEmail(details);
        const data = await establishSession(result.user, { forceRefresh: true });
        return { ...data, verificationSent: result.verificationSent };
      } catch (error) {
        failSession(error);
        throw error;
      } finally {
        explicitAuth.current = false;
      }
    },
    [establishSession, failSession],
  );

  const loginWithGoogle = useCallback(async () => {
    explicitAuth.current = true;
    setAuthError('');
    try {
      const result = await signInWithGoogle();
      const data = await establishSession(result.user, { forceRefresh: true });
      return data;
    } catch (error) {
      failSession(error);
      throw error;
    } finally {
      explicitAuth.current = false;
    }
  }, [establishSession, failSession]);

  const loginAsExampleUser = useCallback(async () => {
    explicitAuth.current = true;
    setAuthError('');
    try {
      const result = await signInAsExampleUser();
      const data = await establishSession(result.user, { forceRefresh: true });
      return data;
    } catch (error) {
      failSession(error);
      throw error;
    } finally {
      explicitAuth.current = false;
    }
  }, [establishSession, failSession]);

  const logout = useCallback(async () => {
    // This is the explicit, user-initiated sign out in Settings > Account.
    // Drop local identity immediately so the UI is usable as a guest even if
    // the backend is unreachable; clear the server cookie in the background.
    setFirebaseUser(null);
    applyGuest('');
    await signOutFirebase().catch(() => {});
    void signOutRequest().catch(() => {});
  }, [applyGuest]);

  const resendVerificationEmail = useCallback(async () => {
    await sendVerificationEmailFor(firebaseUser);
  }, [firebaseUser]);

  const refreshSession = useCallback(async () => {
    if (!firebaseUser) throw new Error('Sign in again to refresh your session.');
    await refreshCurrentUser(firebaseUser);
    return establishSession(firebaseUser, { forceRefresh: true });
  }, [establishSession, firebaseUser]);

  const refreshUserFromBackend = useCallback(async () => {
    const data = await fetchCurrentUser();
    if (mounted.current) setUser(data.user);
    return data;
  }, []);

  const clearAuthError = useCallback(() => setAuthError(''), []);

  const value = useMemo(
    () => ({
      user,
      firebaseUser,
      status,
      authError,
      login,
      register,
      loginWithGoogle,
      loginAsExampleUser,
      logout,
      resendVerificationEmail,
      refreshSession,
      refreshUserFromBackend,
      clearAuthError,
      isAuthenticated: status === AUTH_STATUS.AUTHENTICATED,
      isGuest: status === AUTH_STATUS.GUEST,
      isFirebaseConfigured,
    }),
    [
      user,
      firebaseUser,
      status,
      authError,
      login,
      register,
      loginWithGoogle,
      loginAsExampleUser,
      logout,
      resendVerificationEmail,
      refreshSession,
      refreshUserFromBackend,
      clearAuthError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
