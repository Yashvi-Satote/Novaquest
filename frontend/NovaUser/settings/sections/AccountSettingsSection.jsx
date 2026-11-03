import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
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
import { useAuth } from '../../context/authContext';
import { AUTH_STATUS } from '../../services/authSession';
import { friendlyFirebaseError } from '../../services/firebase';

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

function Feedback({ tone = 'info', children }) {
  const styles = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    error: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  };
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border px-3.5 py-2.5 text-xs font-medium ${styles[tone] || styles.info}`}
    >
      {children}
    </div>
  );
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-cyan-400/80" aria-hidden="true" />
      <dt className="w-28 shrink-0 text-xs font-semibold text-slate-400">{label}</dt>
      <dd className="min-w-0 flex-1 truncate text-sm text-slate-100">{children}</dd>
    </div>
  );
}

export default function AccountSettingsSection() {
  const { user, status, logout, resendVerificationEmail, refreshSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (status === AUTH_STATUS.LOADING) {
    return (
      <section
        aria-labelledby="account-settings-heading"
        className="flex flex-col items-center gap-3 rounded-2xl border border-cyan-500/20 bg-[#090e1c]/90 py-16 text-cyan-300"
        role="status"
      >
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        <p className="text-sm font-medium">Checking your account…</p>
      </section>
    );
  }

  if (status !== AUTH_STATUS.AUTHENTICATED || !user) {
    const returnTarget = `${location.pathname}${location.search}${location.hash}`;
    return (
      <section
        aria-labelledby="account-settings-heading"
        className="overflow-hidden rounded-2xl border border-violet-500/25 bg-[#090e1c]/90 shadow-xl shadow-cyan-950/20"
      >
        <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-cyan-500/5 to-transparent p-6">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/15 text-violet-200"
              aria-hidden="true"
            >
              <UserRound className="h-7 w-7" />
            </div>
            <div>
              <span className="inline-flex items-center rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-violet-300">
                Guest mode
              </span>
              <h2
                id="account-settings-heading"
                className="mt-2 font-mono text-lg font-bold uppercase tracking-wider text-white"
              >
                You&apos;re playing as a guest
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
            Everything in NovaQuest, NovaMap and Novabase works without an account. Your game
            settings and Continue progress are saved on this device only.
          </p>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400">
            Sign in to save your progress and settings across devices and to see your account
            details here.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/novauser/signin"
              state={{ from: returnTarget }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              Sign in
            </Link>
            <Link
              to="/novauser/register"
              state={{ from: returnTarget }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              Create account
            </Link>
          </div>
        </div>
        <div className="p-6">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to NovaQuest
          </Link>
        </div>
      </section>
    );
  }

  const justRegistered = Boolean(location.state?.justRegistered);
  const justSignedIn = Boolean(location.state?.justSignedIn);
  const verificationSent = Boolean(location.state?.verificationSent);
  const initials = (user.full_name || '')
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
      navigate('/app', { replace: true });
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
    <section aria-labelledby="account-settings-heading" className="space-y-5">
      <div>
        <h2
          id="account-settings-heading"
          className="font-mono text-lg font-bold uppercase tracking-wider text-white"
        >
          Account
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Your NovaUser identity, session and email verification.
        </p>
      </div>

      {justRegistered || justSignedIn ? (
        <Feedback tone="success">
          {justRegistered
            ? 'Your NovaUser account is ready and you are signed in.'
            : 'Signed in successfully. Your session is active.'}
        </Feedback>
      ) : null}
      {verificationSent ? (
        <Feedback tone="info">
          We sent a verification link to your email. You can keep exploring while you verify.
        </Feedback>
      ) : null}
      {notice ? <Feedback tone="success">{notice}</Feedback> : null}
      {error ? <Feedback tone="error">{error}</Feedback> : null}

      <div className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#090e1c]/90 shadow-xl shadow-cyan-950/20">
        <div className="flex items-center gap-4 border-b border-white/10 bg-black/40 p-4 sm:p-5">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-lg font-bold text-white shadow-md shadow-cyan-500/25"
            aria-hidden="true"
          >
            {initials || 'NU'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-white">{user.full_name}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          {user.email_verified ? (
            <BadgeCheck className="h-6 w-6 shrink-0 text-emerald-400" aria-label="Email verified" />
          ) : (
            <MailWarning className="h-6 w-6 shrink-0 text-amber-400" aria-label="Email not verified" />
          )}
        </div>

        <dl className="divide-y divide-white/5">
          <DetailRow icon={UserRound} label="Full name">
            {user.full_name}
          </DetailRow>
          <DetailRow icon={Mail} label="Email">
            {user.email}
          </DetailRow>
          <DetailRow icon={ShieldCheck} label="Sign-in method">
            {PROVIDER_LABELS[user.auth_provider] || user.auth_provider || 'Firebase'}
          </DetailRow>
          <DetailRow icon={MailWarning} label="Email status">
            {user.email_verified ? (
              <span className="font-medium text-emerald-400">Verified</span>
            ) : (
              <span className="font-medium text-amber-400">Not verified</span>
            )}
          </DetailRow>
          <DetailRow icon={CalendarDays} label="Member since">
            {formatDate(user.created_at)}
          </DetailRow>
          <DetailRow icon={ShieldCheck} label="Session">
            <span className="font-medium text-emerald-400">Secured with an HTTP-only cookie</span>
          </DetailRow>
        </dl>
      </div>

      {!user.email_verified ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-xs font-semibold text-amber-300">Verify your email address</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-200/80">
            Firebase sent a verification link when you registered. Open it, then refresh your
            session here.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={Boolean(verificationBusy)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-black/20 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-black/20 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          Continue to NovaQuest
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          aria-label="Sign out of NovaUser"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut className="h-4 w-4" aria-hidden="true" />
          )}
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </section>
  );
}
