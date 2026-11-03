import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { exchangeFirebaseToken, fetchCurrentUser, signOut as signOutRequest } from '../services/authApi';
import {
  getIdToken,
  isFirebaseConfigured,
  onAuthStateChanged,
  registerWithEmail,
  refreshCurrentUser,
  sendVerificationEmailFor,
  signInWithEmail,
  signInWithGoogle,
  signOutFirebase,
} from '../services/firebase';
import { AuthContext } from './authContext';

/**
 * Firebase is the source of truth for identity.  After Firebase authenticates
 * the user, its ID token is exchanged for an HTTP-only NovaUser JWT cookie.
 * The JWT is never stored by the browser.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authenticated | anonymous
  const [authError, setAuthError] = useState('');
  const mounted = useRef(true);
  const explicitAuth = useRef(false);
  const hasSeenFirebaseUser = useRef(false);
  const exchanges = useRef(new Map());

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
        setUser(data.user);
        setFirebaseUser(fbUser);
        setStatus('authenticated');
        setAuthError('');
      }
      return data;
    })().finally(() => {
      exchanges.current.delete(key);
    });

    exchanges.current.set(key, promise);
    return promise;
  }, []);

  const failSession = useCallback(async (error) => {
    if (mounted.current) {
      setUser(null);
      setStatus('anonymous');
      setAuthError(error?.message || 'Authentication failed. Please try again.');
    }
    // Never leave a half-authenticated Firebase user behind when the backend
    // session could not be established.
    await Promise.allSettled([signOutFirebase(), signOutRequest()]);
  }, []);

  useEffect(() => {
    mounted.current = true;

    if (!isFirebaseConfigured) {
      setStatus('anonymous');
      setAuthError(
        'Firebase is not configured. Add the VITE_FIREBASE_* values to frontend/.env and rebuild.',
      );
      return () => {
        mounted.current = false;
      };
    }

    const unsubscribe = onAuthStateChanged(async (fbUser) => {
      if (!mounted.current) return;
      setFirebaseUser(fbUser);

      if (!fbUser) {
        // On the very first anonymous callback, clear any stale backend cookie.
        // Later sign-outs are handled by logout()/failSession() so an in-flight
        // sign-in cannot have its fresh cookie removed by an old callback.
        if (!explicitAuth.current && !hasSeenFirebaseUser.current) {
          try {
            await signOutRequest();
          } catch {
            // Network failures should not prevent the local signed-out state.
          }
        }
        if (!mounted.current) return;
        setUser(null);
        setStatus('anonymous');
        return;
      }

      hasSeenFirebaseUser.current = true;

      // Explicit sign-in/register methods perform their own exchange so they
      // can update the Firebase profile first and avoid duplicate exchanges.
      if (explicitAuth.current) return;

      setStatus('loading');
      try {
        await establishSession(fbUser, { forceRefresh: true });
      } catch (error) {
        await failSession(error);
      }
    });

    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [establishSession, failSession]);

  const login = useCallback(
    async (credentials) => {
      explicitAuth.current = true;
      setAuthError('');
      try {
        const result = await signInWithEmail(credentials);
        const data = await establishSession(result.user, { forceRefresh: true });
        return { ...data, verificationSent: result.verificationSent };
      } catch (error) {
        await failSession(error);
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
        await failSession(error);
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
      await failSession(error);
      throw error;
    } finally {
      explicitAuth.current = false;
    }
  }, [establishSession, failSession]);

  const logout = useCallback(async () => {
    try {
      await Promise.allSettled([signOutRequest(), signOutFirebase()]);
    } finally {
      if (mounted.current) {
        setUser(null);
        setFirebaseUser(null);
        setStatus('anonymous');
        setAuthError('');
      }
    }
  }, []);

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

  const value = useMemo(
    () => ({
      user,
      firebaseUser,
      status,
      authError,
      login,
      register,
      loginWithGoogle,
      logout,
      resendVerificationEmail,
      refreshSession,
      refreshUserFromBackend,
      isAuthenticated: status === 'authenticated',
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
      logout,
      resendVerificationEmail,
      refreshSession,
      refreshUserFromBackend,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
