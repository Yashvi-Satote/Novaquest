import { Link, useLocation } from 'react-router-dom';
import { Menu, Rocket, Settings, X } from 'lucide-react';
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
  const isNovaQuest =
    pathname === '/app' ||
    pathname === '/missions' ||
    pathname === '/prologue' ||
    pathname.startsWith('/play') ||
    pathname === '/mission-echo';
  const isSettings = pathname.startsWith('/settings');

  const focusRing =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6BFF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b14]';

  const navClass = (isActive) =>
    `nav-link flex shrink-0 items-center gap-1.5 rounded-sm px-1 py-1.5 transition-colors ${focusRing} ${
      isActive ? 'text-[#3D6BFF]' : 'text-[#AEB4C2] hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.06] bg-transparent px-[7%] py-3 sm:flex sm:h-14 sm:items-center sm:py-0">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2">
        {typeof setMobileMenuOpen === 'function' && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`order-0 -ml-1 rounded-sm p-1.5 text-[#AEB4C2] transition-colors hover:text-white lg:hidden ${focusRing}`}
            aria-label="Toggle Navigation Drawer"
            id="mobile-drawer-toggle"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}

        <Link
          to="/app"
          className={`order-1 flex shrink-0 items-center gap-2.5 rounded-sm transition-opacity hover:opacity-80 ${focusRing}`}
          aria-current={isNovaQuest ? 'page' : undefined}
        >
          <Rocket className="h-4 w-4 -rotate-45 text-white" aria-hidden="true" />
          <span className="nav-wordmark text-white">NovaQuest</span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="order-3 flex w-full min-w-0 basis-full flex-wrap items-center justify-start gap-x-4 gap-y-2 sm:order-2 sm:ml-auto sm:w-auto sm:flex-1 sm:basis-auto sm:flex-nowrap sm:justify-end sm:gap-x-6 sm:overflow-x-auto lg:overflow-visible"
        >
          <Link to="/novamap" className={navClass(isNovaMap)} aria-current={isNovaMap ? 'page' : undefined}>
            <span>NovaMap</span>
          </Link>
          <Link to="/novabase" className={navClass(isNovabase)} aria-current={isNovabase ? 'page' : undefined}>
            <span>Novabase</span>
          </Link>
          <Link
            to="/settings#game"
            className={navClass(isSettings)}
            aria-current={isSettings ? 'page' : undefined}
          >
            <Settings className="h-[13px] w-[13px] shrink-0" aria-hidden="true" />
            <span>Settings</span>
          </Link>

          {status === AUTH_STATUS.LOADING ? (
            <span
              className="h-7 w-7 shrink-0 animate-pulse rounded-full border border-white/10 bg-white/5"
              aria-hidden="true"
            />
          ) : user ? (
            <Link
              to="/settings#account"
              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3D6BFF] text-[11px] font-semibold text-white transition-colors hover:bg-[#4F79FF] ${focusRing}`}
              aria-label={`Account settings for ${user.full_name || user.email}`}
              title={user.full_name || user.email}
            >
              {initials || 'NU'}
            </Link>
          ) : (
            <Link
              to="/novauser/signin"
              state={{ from: returnTarget }}
              className={`nav-link inline-flex shrink-0 items-center rounded-none border border-[#3D6BFF] px-2.5 py-1.5 text-[#AEB4C2] transition-colors hover:bg-[#3D6BFF]/10 hover:text-white ${focusRing}`}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
