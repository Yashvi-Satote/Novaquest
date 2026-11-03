import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Lock, Mail, Sparkles, UserRound } from 'lucide-react';
import AuthShell, { NovaUserMark } from '../components/AuthShell';
import AuthToggle from '../components/AuthToggle';
import GoogleButton from '../components/GoogleButton';
import { FormAlert, PasswordField, TextField } from '../components/AuthFields';
import { useAuth } from '../context/authContext';
import { AuthApiError } from '../services/authApi';
import { friendlyFirebaseError, sendPasswordReset } from '../services/firebase';
import { getRedirectTarget } from '../utils/redirect';
import { mapServerFieldErrors, validateEmail, validateLogin } from '../utils/validation';

const initialValues = { email: '', password: '' };

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, loginAsExampleUser, authError } = useAuth();
  const target = getRedirectTarget(location);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const update = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
    setFormError('');
  };

  const focusFirstError = (fieldErrors) => {
    const order = ['email', 'password'];
    const first = order.find((field) => fieldErrors[field]);
    if (first) document.getElementById(`signin-${first}`)?.focus();
  };

  const handleAuthError = (error) => {
    if (error instanceof AuthApiError) {
      const fieldErrors = mapServerFieldErrors(error.fields);
      if (Object.keys(fieldErrors).length) {
        setErrors((current) => ({ ...current, ...fieldErrors }));
        focusFirstError(fieldErrors);
      }
      setFormError(error.message);
    } else {
      setFormError(friendlyFirebaseError(error));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setNotice('');
    const { values: cleanValues, errors: validationErrors } = validateLogin(values);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      focusFirstError(validationErrors);
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const result = await login(cleanValues);
      navigate(target, {
        replace: true,
        state: {
          justSignedIn: true,
          verificationSent: Boolean(result.verificationSent),
        },
      });
    } catch (error) {
      handleAuthError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (submitting) return;
    setSubmitting(true);
    setFormError('');
    setNotice('');
    try {
      await loginWithGoogle();
      navigate(target, { replace: true, state: { justSignedIn: true } });
    } catch (error) {
      handleAuthError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExampleSignIn = async () => {
    if (submitting) return;
    setSubmitting(true);
    setFormError('');
    setNotice('');
    try {
      await loginAsExampleUser();
      navigate(target, { replace: true, state: { justSignedIn: true } });
    } catch (error) {
      handleAuthError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (sendingReset || submitting) return;
    setFormError('');
    setNotice('');
    const { value: email, error } = validateEmail(values.email);
    if (error) {
      setErrors((current) => ({ ...current, email: error }));
      document.getElementById('signin-email')?.focus();
      return;
    }

    setSendingReset(true);
    try {
      await sendPasswordReset(email);
      setNotice('Password reset email sent. Check your inbox and follow the link.');
    } catch (resetError) {
      setFormError(friendlyFirebaseError(resetError));
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <AuthShell
      footer={
        <>
          By continuing you agree to our{' '}
          <Link to="/novauser/terms" className="font-semibold text-violet-400 underline-offset-2 hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/novauser/privacy" className="font-semibold text-violet-400 underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
        </>
      }
    >
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <NovaUserMark />
          <div className="text-left">
            <p className="text-lg font-bold tracking-tight text-white">NovaUser</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-violet-400">
              Authentication
            </p>
          </div>
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-[1.7rem]">
          Welcome back
        </h1>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-400">
          Sign in to save your progress and settings across devices. You can also continue as a
          guest.
        </p>
      </div>

      <AuthToggle active="signin" />

      <div className="mt-5 space-y-4">
        <GoogleButton
          label={submitting ? 'Connecting…' : 'Continue with Google'}
          disabled={submitting}
          onClick={handleGoogleSignIn}
        />

        <button
          type="button"
          onClick={handleExampleSignIn}
          disabled={submitting}
          aria-label="Sign in as example user"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-violet-500/40 bg-violet-500/5 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:border-violet-400/70 hover:bg-violet-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          {submitting ? 'Signing in…' : 'Example User'}
        </button>
        <p className="text-center text-[11px] text-slate-500">
          Temporary demo access — no account needed.
        </p>

        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Or continue with email
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError || authError ? <FormAlert>{formError || authError}</FormAlert> : null}
          {notice ? <FormAlert tone="info">{notice}</FormAlert> : null}

          <TextField
            id="signin-email"
            label="Email address"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            value={values.email}
            onChange={update('email')}
            error={errors.email}
            disabled={submitting}
            required
          />

          <div>
            <PasswordField
              id="signin-password"
              label="Password"
              icon={Lock}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={values.password}
              onChange={update('password')}
              error={errors.password}
              disabled={submitting}
              required
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={sendingReset || submitting}
                className="rounded text-xs font-semibold text-violet-400 underline-offset-2 transition hover:text-violet-300 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingReset ? 'Sending reset email…' : 'Forgot password?'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting ? 'true' : undefined}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 hover:shadow-violet-600/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        </form>

        <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-slate-400">
          New to NovaUser?{' '}
          <Link
            to="/novauser/register"
            state={location.state}
            className="inline-flex items-center gap-1 font-semibold text-violet-400 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
