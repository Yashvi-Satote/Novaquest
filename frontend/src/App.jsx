import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ExplorerPage from './pages/ExplorerPage';
import HardwareDetailPage from './pages/HardwareDetailPage';
import SpacecraftDetailPage from './pages/SpacecraftDetailPage';
import SolarSystemPage from './pages/SolarSystemPage';
import PlaceholderPage from './pages/PlaceholderPage';
import { ArrowLeft, AlertCircle } from 'lucide-react';

function NotFoundPage({ theme, onToggleTheme }) {
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-[#070b14] space-bg flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200`}>
      <Header theme={theme} onToggleTheme={onToggleTheme} />

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
              to="/novabase"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-cyan-600/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Novabase
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
      <Route path="/" element={<PlaceholderPage title="NovaQuest" theme={theme} onToggleTheme={handleToggleTheme} />} />
      <Route path="/novamap" element={<SolarSystemPage theme={theme} onToggleTheme={handleToggleTheme} />} />
      <Route path="/solar-system" element={<Navigate to="/novamap" replace />} />
      <Route path="/novabase" element={<ExplorerPage theme={theme} onToggleTheme={handleToggleTheme} />} />
      <Route path="/settings" element={<PlaceholderPage title="Settings" theme={theme} onToggleTheme={handleToggleTheme} />} />
      <Route path="/spacecraft/:slug" element={<SpacecraftDetailPage theme={theme} onToggleTheme={handleToggleTheme} />} />
      <Route path="/hardware/:slug" element={<HardwareDetailPage theme={theme} onToggleTheme={handleToggleTheme} />} />
      <Route path="*" element={<NotFoundPage theme={theme} onToggleTheme={handleToggleTheme} />} />
    </Routes>
  );
}
