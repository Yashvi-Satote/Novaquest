import { Loader2 } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { NovaUserMark } from './AuthShell';

export function FullPageAuthLoader({ label = 'Validating your session…' }) {
  return (
    <div className="novauser-auth-bg flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center font-sans text-slate-100">
      <NovaUserMark />
      <div className="flex items-center gap-2 text-sm font-semibold text-violet-300" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {label}
      </div>
      <p className="max-w-xs text-xs text-violet-300/60">
        Cosmic Timekeepers secures every route with your NovaUser session.
      </p>
    </div>
  );
}

export function normalizeRedirectTarget(from, fallback = '/app') {
  if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')) {
    return from;
  }
  if (from && typeof from.pathname === 'string' && from.pathname.startsWith('/')) {
    return `${from.pathname}${from.search || ''}${from.hash || ''}`;
  }
  return fallback;
}

/** Wrap authenticated application routes. */
export function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageAuthLoader />;
  }

  if (status !== 'authenticated') {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return children;
}

/** Wrap auth pages: authenticated users skip straight into the application. */
export function GuestOnly({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageAuthLoader label="Checking your session…" />;
  }

  if (status === 'authenticated') {
    return <Navigate to={normalizeRedirectTarget(location.state?.from)} replace />;
  }

  return children;
}
