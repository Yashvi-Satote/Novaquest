import { Loader2 } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { AUTH_STATUS } from '../services/authSession';
import { normalizeRedirectTarget } from '../utils/redirect';
import { NovaUserMark } from './AuthShell';

export function AuthRouteLoader({ label = 'Checking your session…' }) {
  return (
    <div className="novauser-auth-bg flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center font-sans text-slate-100">
      <NovaUserMark />
      <div className="flex items-center gap-2 text-sm font-semibold text-violet-300" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {label}
      </div>
      <p className="max-w-xs text-xs text-violet-300/60">
        Already signed in? We are returning you to the app.
      </p>
    </div>
  );
}

/**
 * Auth pages stay optional destinations. Signed-in users who visit them are
 * returned to the app, but the application routes themselves are never
 * guarded. Guests are always allowed to browse the auth page.
 */
export function GuestOnly({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === AUTH_STATUS.LOADING) {
    return <AuthRouteLoader />;
  }

  if (status === AUTH_STATUS.AUTHENTICATED) {
    return <Navigate to={normalizeRedirectTarget(location.state?.from)} replace />;
  }

  return children;
}
