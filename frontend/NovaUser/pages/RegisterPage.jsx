import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Lock, Mail, User } from 'lucide-react';
import AuthShell, { NovaUserMark } from '../components/AuthShell';
import AuthToggle from '../components/AuthToggle';
import GoogleButton from '../components/GoogleButton';
import { normalizeRedirectTarget } from '../components/RouteGuards';
import { FormAlert, PasswordField, PasswordRequirements, TextField } from '../components/AuthFields';
import { useAuth } from '../context/authContext';
import { AuthApiError } from '../services/authApi';
import { friendlyFirebaseError } from '../services/firebase';
import { mapServerFieldErrors, validateRegistration } from '../utils/validation';

const initialValues = { fullName: '', email: '', password: '' };

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loginWithGoogle, authError } = useAuth();
  const target = normalizeRedirectTarget(location.state?.from);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
    setFormError('');
  };

  const focusFirstError = (fieldErrors) => {
    const order = ['fullName', 'email', 'password'];
    const first = order.find((field) => fieldErrors[field]);
    if (first) document.getElementById(`register-${first}`)?.focus();
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
    const { values: cleanValues, errors: validationErrors } = validateRegistration(values);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      focusFirstError(validationErrors);
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const result = await register(cleanValues);
      navigate(target, {
        replace: true,
        state: {
          justRegistered: true,
          verificationSent: Boolean(result.verificationSent),
        },
      });
    } catch (error) {
      handleAuthError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (submitting) return;
    setSubmitting(true);
    setFormError('');
    setNotice('');
    try {
      await loginWithGoogle();
      navigate(target, { replace: true, state: { justRegistered: true } });
    } catch (error) {
      handleAuthError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      footer={
        <>
          By creating an account you agree to our{' '}
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
          Create account
        </h1>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-400">
          Join Cosmic Timekeepers and unlock NovaQuest, NovaMap and NovaBase in one account.
        </p>
      </div>

      <AuthToggle active="register" />

      <div className="mt-5 space-y-4">
        <GoogleButton
          label={submitting ? 'Signing up…' : 'Sign up with Google'}
          disabled={submitting}
          onClick={handleGoogleSignUp}
        />

        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Or sign up with email
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError || authError ? <FormAlert>{formError || authError}</FormAlert> : null}
          {notice ? <FormAlert tone="info">{notice}</FormAlert> : null}

          <TextField
            id="register-fullName"
            label="Full name"
            type="text"
            icon={User}
            placeholder="Your full name"
            autoComplete="name"
            value={values.fullName}
            onChange={update('fullName')}
            error={errors.fullName}
            disabled={submitting}
            required
          />

          <TextField
            id="register-email"
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
              id="register-password"
              label="Password"
              icon={Lock}
              placeholder="Create a strong password"
              autoComplete="new-password"
              value={values.password}
              onChange={update('password')}
              error={errors.password}
              disabled={submitting}
              required
            />
            <PasswordRequirements password={values.password} />
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
                Creating account…
              </>
            ) : (
              <>
                Create Free Account
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        </form>

        <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-slate-400">
          Already have an account?{' '}
          <Link
            to="/novauser/signin"
            state={location.state}
            className="font-semibold text-violet-400 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
