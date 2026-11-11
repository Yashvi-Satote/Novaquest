import { Link, useLocation } from 'react-router-dom';
import { Layers, Menu, Orbit, Rocket, Settings, X } from 'lucide-react';
import { useAuth } from '../../../NovaUser/context/authContext';
import { AUTH_STATUS } from '../../../NovaUser/services/authSession';

/**
 * Shared application navbar.
 *
 * NovaQuest is dark-only, so the navbar no longer renders a theme toggle.
 * Signing in is optional: guests see a Sign in button and signed-in users see
 * an initials avatar linking to Settings > Account, where sign-out lives.
 */
export default function AppNavbar({ mobileMenuOpen, setMobileMenuOpen }) {
  const location = useLocation();
  const { pathname, search, hash } = location;
  const { user, status } = useAuth();
  const returnTarget = `${pathname}${search}${hash}`;
  const initials = (user?.full_name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const isNovaMap =
    pathname.startsWith('/novamap') ||
    pathname.startsWith('/solar-system') ||
    pathname.startsWith('/spacecraft/');
  const isNovabase = pathname.startsWith('/novabase') || pathname.startsWith('/hardware/');
  const isMemoir = pathname.startsWith('/memoir');
  const isNovaQuest =
    pathname === '/app' ||
    pathname === '/missions' ||
    pathname === '/prologue' ||
    pathname.startsWith('/play') ||
    pathname === '/mission-echo';
  const isSettings = pathname.startsWith('/settings');

  const navClass = (isActive, prominent = false) =>
    `flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors sm:px-3 ${
      prominent ? 'text-base font-bold tracking-tight sm:text-lg' : 'text-xs font-medium sm:text-sm'
    } ${
      isActive
        ? 'bg-cyan-500/10 text-cyan-300'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[#070b14]/90 px-4 py-3 backdrop-blur-md sm:flex sm:h-14 sm:items-center sm:px-6 sm:py-0 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-2">
        {typeof setMobileMenuOpen === 'function' && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="order-0 rounded-lg bg-slate-800/80 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 lg:hidden"
            aria-label="Toggle Navigation Drawer"
            id="mobile-drawer-toggle"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}

        <nav
          aria-label="Primary navigation"
          className="order-2 flex basis-full items-center gap-1 overflow-x-auto sm:order-1 sm:basis-auto sm:flex-1 sm:gap-2"
        >
          <Link to="/app" className={navClass(isNovaQuest, true)} aria-current={isNovaQuest ? 'page' : undefined}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-sm shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Rocket className="h-4 w-4 -rotate-45 text-white" />
            </span>
            <span>NovaQuest</span>
          </Link>
          <Link to="/novamap" className={navClass(isNovaMap)} aria-current={isNovaMap ? 'page' : undefined}>
            <Orbit className="h-3.5 w-3.5 shrink-0" />
            <span>NovaMap</span>
          </Link>
          <Link to="/novabase" className={navClass(isNovabase)} aria-current={isNovabase ? 'page' : undefined}>
            <Layers className="h-3.5 w-3.5 shrink-0" />
            <span>Novabase</span>
          </Link>
          <Link to="/memoir" className={navClass(isMemoir)} aria-current={isMemoir ? 'page' : undefined}>
            <span>Memoir</span>
          </Link>
        </nav>

        <div className="order-1 ml-auto flex shrink-0 items-center gap-2 sm:order-2">
          <Link
            to="/settings#game"
            className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
              isSettings
                ? 'bg-cyan-500/10 text-cyan-300'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
            aria-current={isSettings ? 'page' : undefined}
          >
            <Settings className="h-3.5 w-3.5 shrink-0" />
            <span>Settings</span>
          </Link>

          {status === AUTH_STATUS.LOADING ? (
            <span
              className="h-8 w-8 animate-pulse rounded-full border border-white/10 bg-white/5"
              aria-hidden="true"
            />
          ) : user ? (
            <Link
              to="/settings#account"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-xs font-bold text-white shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400/30 transition hover:from-cyan-400 hover:to-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label={`Account settings for ${user.full_name || user.email}`}
              title={user.full_name || user.email}
            >
              {initials || 'NU'}
            </Link>
          ) : (
            <Link
              to="/novauser/signin"
              state={{ from: returnTarget }}
              className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-2.5 py-1.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/20"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
