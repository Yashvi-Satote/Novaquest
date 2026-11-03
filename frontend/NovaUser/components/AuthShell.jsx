import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import '../styles/index.css';

export function NovaUserMark({ className = 'h-11 w-11' }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <circle cx="12" cy="12" r="3.1" fill="currentColor" />
        <ellipse
          cx="12"
          cy="12"
          rx="9"
          ry="4.4"
          stroke="currentColor"
          strokeWidth="1.5"
          transform="rotate(-28 12 12)"
          opacity="0.95"
        />
        <circle cx="19" cy="6.4" r="1.35" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function AuthShell({ children, footer }) {
  const { clearAuthError } = useAuth();
  const leaveAuth = () => clearAuthError();

  return (
    <div className="novauser-auth-bg flex min-h-screen flex-col font-sans text-slate-100">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          to="/app"
          onClick={leaveAuth}
          className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-slate-900/70 px-3.5 py-2 text-xs font-semibold text-violet-200 shadow-sm backdrop-blur transition hover:border-violet-400/60 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to NovaQuest
        </Link>
        <span className="hidden items-center gap-2 rounded-full border border-violet-500/30 bg-slate-900/60 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300 backdrop-blur sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Cosmic Timekeepers
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-10 pt-2 sm:px-6 sm:pb-16">
        <div className="w-full max-w-[456px]">
          <div className="novauser-auth-card rounded-[30px] p-6 sm:p-8">{children}</div>
          <div className="mt-4 text-center">
            <Link
              to="/app"
              onClick={leaveAuth}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-violet-300/80 underline-offset-2 transition hover:text-violet-200 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            >
              Continue as guest
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          {footer ? <div className="mt-3 text-center text-xs text-violet-300/60">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
