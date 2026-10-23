import React from 'react';
import { 
  Rocket, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Sparkles
} from 'lucide-react';

export default function Header({ 
  theme = 'dark',
  onToggleTheme,
  mobileMenuOpen, 
  setMobileMenuOpen
}) {
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 dark:bg-[#070b14]/90 backdrop-blur-md border-b border-slate-200/90 dark:border-white/10 px-4 sm:px-6 lg:px-8 py-3 transition-colors duration-200">
      <div className="w-full flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            aria-label="Toggle Navigation Drawer"
            id="mobile-drawer-toggle"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Rocket className="w-5 h-5 text-white transform -rotate-45" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Space in Time
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                Human-Made Hardware Across the Cosmos
              </p>
            </div>
          </div>
        </div>

        {/* Center / Quick Info Badge */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
            Verified Mission Archives
          </span>
        </div>

        {/* Right: Theme Toggle (Sun/Moon) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-all duration-200 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            id="theme-toggle-btn"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-pulse-subtle" />
                <span className="text-xs font-medium hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-medium hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
