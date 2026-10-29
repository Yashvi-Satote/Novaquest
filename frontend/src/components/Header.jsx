import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Rocket,
  Menu,
  X,
  Sun,
  Moon,
  Orbit,
  Layers
} from 'lucide-react';

export default function Header({
  theme = 'dark',
  onToggleTheme,
  mobileMenuOpen,
  setMobileMenuOpen
}) {
  const isDark = theme === 'dark';
  const { pathname } = useLocation();
  const isNovaMap = pathname.startsWith('/novamap') || pathname.startsWith('/solar-system');
  const isNovabase = pathname.startsWith('/novabase') || pathname.startsWith('/hardware/');

  const navClass = (isActive, prominent = false) => (
    `flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors sm:px-3 ${
      prominent ? 'text-base font-bold tracking-tight sm:text-lg' : 'text-xs font-medium sm:text-sm'
    } ${
      isActive
        ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
        : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
    }`
  );

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/90 bg-white/85 px-4 py-3 backdrop-blur-md transition-colors duration-200 dark:border-white/10 dark:bg-[#070b14]/90 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-2">
        {typeof setMobileMenuOpen === 'function' && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="order-0 rounded-lg bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white lg:hidden"
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
          <Link to="/" className={navClass(pathname === '/', true)} aria-current={pathname === '/' ? 'page' : undefined}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-sm shadow-cyan-500/20 ring-1 ring-cyan-400/30 sm:h-8 sm:w-8">
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
        </nav>

        <div className="order-1 ml-auto flex shrink-0 items-center gap-2 sm:order-2">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="rounded-lg border border-slate-200 bg-slate-100/80 p-2 text-slate-700 shadow-sm transition-colors hover:bg-slate-200/80 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              id="theme-toggle-btn"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-600" />}
            </button>
          )}
          <span className="h-6 w-px bg-slate-200 dark:bg-white/10" aria-hidden="true" />
          <Link
            to="/settings"
            className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
              pathname.startsWith('/settings')
                ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
            }`}
            aria-current={pathname.startsWith('/settings') ? 'page' : undefined}
          >
            Settings
          </Link>
        </div>
      </div>
    </header>
  );
}
