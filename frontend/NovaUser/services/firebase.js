/**
 * Firebase client SDK - the single application-wide initialisation point.
 *
 * The web config uses Vite's public VITE_FIREBASE_* variables.  Firebase web
 * API keys are public identifiers, not secrets; the backend still verifies
 * every ID token before creating a NovaUser session.
 */

import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
);

let app = null;
let auth = null;
let persistenceReady = Promise.resolve();

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Keep users signed in across refreshes (Firebase's default, made explicit).
  persistenceReady = setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn('Firebase persistence could not be set:', error?.code || error);
  });
}

export { app, auth };

export function ensureAuthPersistence() {
  return persistenceReady;
}

export function onAuthStateChanged(callback) {
  if (!auth) return () => {};
  return firebaseOnAuthStateChanged(auth, callback);
}

function requireAuth() {
  if (!auth) {
    const error = new Error(
      'Firebase is not configured. Add the VITE_FIREBASE_* values to frontend/.env and rebuild.',
    );
    error.code = 'app/firebase-not-configured';
    throw error;
  }
  return auth;
}

export async function registerWithEmail({ fullName, email, password }) {
  const firebaseAuth = requireAuth();
  await ensureAuthPersistence();

  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  if (fullName) {
    await updateProfile(credential.user, { displayName: fullName });
  }

  let verificationSent = false;
  try {
    await sendEmailVerification(credential.user);
    verificationSent = true;
  } catch (error) {
    console.warn('Could not send Firebase verification email:', error?.code || error);
  }

  // Refresh so the backend receives the profile name and verification state.
  await credential.user.getIdToken(true);
  return { user: credential.user, verificationSent };
}

export async function signInWithEmail({ email, password }) {
  const firebaseAuth = requireAuth();
  await ensureAuthPersistence();

  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  // Verification emails are sent at registration and can be re-sent from the
  // account page.  Don't send one on every sign-in.
  return { user: credential.user, verificationSent: false };
}

export async function signInWithGoogle() {
  const firebaseAuth = requireAuth();
  await ensureAuthPersistence();

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(firebaseAuth, provider);
  return { user: credential.user, verificationSent: false };
}

// TEMPORARY demo access: a shared example account for the sign-in page button.
// Remove this helper (and the button that calls it) before production.
const EXAMPLE_USER = {
  fullName: 'Example User',
  email: 'example.user@cosmictimekeepers.app',
  password: 'ExampleUser9!',
};

export async function signInAsExampleUser() {
  const firebaseAuth = requireAuth();
  await ensureAuthPersistence();

  let credential;
  try {
    credential = await signInWithEmailAndPassword(
      firebaseAuth,
      EXAMPLE_USER.email,
      EXAMPLE_USER.password,
    );
  } catch (error) {
    const missingAccount =
      error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-credential';
    if (!missingAccount) throw error;

    credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      EXAMPLE_USER.email,
      EXAMPLE_USER.password,
    );
    await updateProfile(credential.user, { displayName: EXAMPLE_USER.fullName });
    await credential.user.getIdToken(true);
  }

  return { user: credential.user, verificationSent: false };
}

export async function sendPasswordReset(email) {
  const firebaseAuth = requireAuth();
  await ensureAuthPersistence();
  await sendPasswordResetEmail(firebaseAuth, email);
}

export async function sendVerificationEmailFor(user) {
  const firebaseAuth = requireAuth();
  const currentUser = user || firebaseAuth.currentUser;
  if (!currentUser) {
    const error = new Error('Sign in again to request a verification email.');
    error.code = 'auth/no-current-user';
    throw error;
  }
  await sendEmailVerification(currentUser);
}

export async function refreshCurrentUser(user) {
  const currentUser = user || auth?.currentUser;
  if (!currentUser) return null;
  await currentUser.reload();
  return currentUser;
}

export function signOutFirebase() {
  if (!auth) return Promise.resolve();
  return firebaseSignOut(auth);
}

export async function getIdToken(user, forceRefresh = false) {
  if (!user) throw new Error('No Firebase user is signed in.');
  return user.getIdToken(forceRefresh);
}

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'An account with this email address already exists. Try signing in instead.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/missing-email': 'Enter your email address first.',
  'auth/weak-password': 'Choose a stronger password with at least 8 characters.',
  'auth/user-not-found': 'Email address or password is incorrect.',
  'auth/wrong-password': 'Email address or password is incorrect.',
  'auth/invalid-credential': 'Email address or password is incorrect.',
  'auth/invalid-login-credentials': 'Email address or password is incorrect.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.',
  'auth/cancelled-popup-request': 'Google sign-in was cancelled.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase yet.',
  'auth/network-request-failed': 'Unable to reach Firebase. Check your connection and try again.',
  'auth/requires-recent-login': 'Please sign in again before making this change.',
  'auth/quota-exceeded': 'Firebase email quota was exceeded. Please try again later.',
  'auth/no-current-user': 'Sign in again to continue.',
  'app/firebase-not-configured':
    'Firebase is not configured. Add the VITE_FIREBASE_* values to frontend/.env and rebuild.',
};

export function friendlyFirebaseError(error) {
  return (
    ERROR_MESSAGES[error?.code] ||
    'Firebase authentication failed. Please try again.'
  );
}
