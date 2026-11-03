import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  CalendarDays,
  Loader2,
  LogOut,
  Mail,
  MailWarning,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import AuthShell, { NovaUserMark } from '../components/AuthShell';
import { FormAlert } from '../components/AuthFields';
import { useAuth } from '../context/authContext';
import { friendlyFirebaseError } from '../services/firebase';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

const PROVIDER_LABELS = {
  password: 'Email & password',
  'google.com': 'Google',
  firebase: 'Firebase',
};

export default function AccountPage() {
  const { user, status, logout, resendVerificationEmail, refreshSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (status === 'loading') {
    return (
      <AuthShell>
        <div className="flex flex-col items-center gap-3 py-16 text-violet-600" role="status">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          <p className="text-sm font-medium">Loading your account…</p>
        </div>
      </AuthShell>
    );
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/" replace />;
  }

  const justRegistered = Boolean(location.state?.justRegistered);
  const justSignedIn = Boolean(location.state?.justSignedIn);
  const verificationSent = Boolean(location.state?.verificationSent);
  const initials = user.full_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setError('');
    try {
      await logout();
      navigate('/', { replace: true });
    } catch {
      setError('Could not sign out. Please try again.');
      setSigningOut(false);
    }
  };

  const handleResendVerification = async () => {
    if (verificationBusy) return;
    setVerificationBusy('resend');
    setError('');
    setNotice('');
    try {
      await resendVerificationEmail();
      setNotice('Verification email sent. Check your inbox for the Firebase link.');
    } catch (resendError) {
      setError(friendlyFirebaseError(resendError));
    } finally {
      setVerificationBusy('');
    }
  };

  const handleRefreshVerification = async () => {
    if (verificationBusy) return;
    setVerificationBusy('refresh');
    setError('');
    setNotice('');
    try {
      const data = await refreshSession();
      setNotice(
        data?.user?.email_verified
          ? 'Your email address is verified.'
          : 'Your email is still unverified. Open the link in your inbox, then try again.',
      );
    } catch (refreshError) {
      setError(friendlyFirebaseError(refreshError));
    } finally {
      setVerificationBusy('');
    }
  };

  return (
    <AuthShell>
      <div className="mb-6 flex flex-col items-center text-center">
        <NovaUserMark />
        <p className="mt-3 text-lg font-bold tracking-tight text-slate-900">NovaUser</p>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-violet-500">Account</p>
        <h1 className="sr-only">Your NovaUser account</h1>
      </div>

      <div className="space-y-5">
        {justRegistered || justSignedIn ? (
          <FormAlert tone="success">
            {justRegistered
              ? 'Your NovaUser account is ready and you are signed in.'
              : 'Signed in successfully. Your session is active.'}
          </FormAlert>
        ) : null}
        {verificationSent ? (
          <FormAlert tone="info">
            We sent a verification link to your email. You can keep exploring while you verify.
          </FormAlert>
        ) : null}
        {notice ? <FormAlert tone="success">{notice}</FormAlert> : null}
        {error ? <FormAlert>{error}</FormAlert> : null}

        <div className="flex items-center gap-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-bold text-white shadow-md shadow-violet-500/25"
            aria-hidden="true"
          >
            {initials || 'NU'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-slate-900">{user.full_name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          {user.email_verified ? (
            <BadgeCheck className="h-6 w-6 shrink-0 text-emerald-500" aria-label="Email verified" />
          ) : (
            <MailWarning className="h-6 w-6 shrink-0 text-amber-500" aria-label="Email not verified" />
          )}
        </div>

        <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 px-4 py-3">
            <UserRound className="h-4 w-4 shrink-0 text-violet-400" aria-hidden="true" />
            <dt className="w-28 shrink-0 text-xs font-semibold text-slate-500">Full name</dt>
            <dd className="min-w-0 flex-1 truncate text-sm text-slate-800">{user.full_name}</dd>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <Mail className="h-4 w-4 shrink-0 text-violet-400" aria-hidden="true" />
            <dt className="w-28 shrink-0 text-xs font-semibold text-slate-500">Email</dt>
            <dd className="min-w-0 flex-1 truncate text-sm text-slate-800">{user.email}</dd>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-violet-400" aria-hidden="true" />
            <dt className="w-28 shrink-0 text-xs font-semibold text-slate-500">Sign-in method</dt>
            <dd className="min-w-0 flex-1 truncate text-sm text-slate-800">
              {PROVIDER_LABELS[user.auth_provider] || user.auth_provider || 'Firebase'}
            </dd>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <MailWarning className="h-4 w-4 shrink-0 text-violet-400" aria-hidden="true" />
            <dt className="w-28 shrink-0 text-xs font-semibold text-slate-500">Email status</dt>
            <dd className="min-w-0 flex-1 truncate text-sm">
              {user.email_verified ? (
                <span className="font-medium text-emerald-600">Verified</span>
              ) : (
                <span className="font-medium text-amber-600">Not verified</span>
              )}
            </dd>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <CalendarDays className="h-4 w-4 shrink-0 text-violet-400" aria-hidden="true" />
            <dt className="w-28 shrink-0 text-xs font-semibold text-slate-500">Member since</dt>
            <dd className="min-w-0 flex-1 truncate text-sm text-slate-800">
              {formatDate(user.created_at)}
            </dd>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-violet-400" aria-hidden="true" />
            <dt className="w-28 shrink-0 text-xs font-semibold text-slate-500">Session</dt>
            <dd className="min-w-0 flex-1 truncate text-sm font-medium text-emerald-600">
              Secured with an HTTP-only cookie
            </dd>
          </div>
        </dl>

        {!user.email_verified ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
            <p className="text-xs font-semibold text-amber-800">Verify your email address</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-700">
              Firebase sent a verification link when you registered. Open it, then refresh your
              session here.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={Boolean(verificationBusy)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verificationBusy === 'resend' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                Resend email
              </button>
              <button
                type="button"
                onClick={handleRefreshVerification}
                disabled={Boolean(verificationBusy)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verificationBusy === 'refresh' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                I have verified
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to="/app"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            Continue to NovaQuest
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden="true" />
            )}
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
