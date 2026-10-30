import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ExplorerPage from './pages/ExplorerPage';
import HardwareDetailPage from './pages/HardwareDetailPage';
import SpacecraftDetailPage from './pages/SpacecraftDetailPage';
import SolarSystemPage from './pages/SolarSystemPage';
import { Rocket, ArrowLeft, AlertCircle } from 'lucide-react';

function NotFoundPage({ theme, onToggleTheme }) {
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-[#070b14] space-bg flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200`}>
      <header className="w-full bg-white/80 dark:bg-[#070b14]/90 backdrop-blur-md border-b border-slate-200/90 dark:border-white/10 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Rocket className="w-5 h-5 text-white transform -rotate-45" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 dark:text-white">Novaquest</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Catalogue Explorer</p>
          </div>
        </Link>
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center space-y-5 max-w-md w-full border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/50 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              The requested cosmic route does not exist. It may have drifted into deep space.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-cyan-600/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Explorer
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  // Theme State (Dark / Light with localStorage persistence)
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('novaquest_theme')
        || localStorage.getItem('space_in_time_theme');
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply theme to <html> element and persist
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('novaquest_theme', theme);
    } catch (e) {
      console.warn('Failed to persist theme to localStorage:', e);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={<ExplorerPage theme={theme} onToggleTheme={handleToggleTheme} />} 
      />
      <Route 
        path="/solar-system" 
        element={<SolarSystemPage theme={theme} onToggleTheme={handleToggleTheme} />} 
      />
      <Route 
        path="/spacecraft/:slug" 
        element={<SpacecraftDetailPage theme={theme} onToggleTheme={handleToggleTheme} />} 
      />
      <Route 
        path="/hardware/:slug" 
        element={<HardwareDetailPage theme={theme} onToggleTheme={handleToggleTheme} />} 
      />
      <Route 
        path="*" 
        element={<NotFoundPage theme={theme} onToggleTheme={handleToggleTheme} />} 
      />
    </Routes>
  );
}
