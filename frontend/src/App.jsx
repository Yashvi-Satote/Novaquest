import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Header from '../Shared/components/Header';
import PlaceholderPage from '../Shared/pages/PlaceholderPage';
import ExplorerPage from '../NovaBase/pages/ExplorerPage';
import HardwareDetailPage from '../NovaBase/pages/HardwareDetailPage';
import SpacecraftDetailPage from '../NovaMap/pages/SpacecraftDetailPage';
import SolarSystemPage from '../NovaMap/pages/SolarSystemPage';
import MainMenuPage from '../NovaQuest/pages/MainMenuPage';
import GameArenaPage from '../NovaQuest/pages/GameArenaPage';
import ProloguePage from '../NovaQuest/pages/ProloguePage';
import MissionEchoPage from '../NovaQuest/pages/MissionEchoPage';
import SignInPage from '../NovaUser/pages/SignInPage';
import RegisterPage from '../NovaUser/pages/RegisterPage';
import AccountPage from '../NovaUser/pages/AccountPage';
import LegalPage from '../NovaUser/pages/LegalPage';
import { GuestOnly, RequireAuth } from '../NovaUser/components/RouteGuards';
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
              to="/app"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-cyan-600/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to NovaQuest
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

  const protect = (element) => <RequireAuth>{element}</RequireAuth>;

  return (
    <Routes>
      {/* Authentication is the default entry point. */}
      <Route path="/" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="/signup" element={<Navigate to="/" replace />} />
      <Route path="/novauser" element={<Navigate to="/novauser/signin" replace />} />
      <Route path="/novauser/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      <Route path="/novauser/signup" element={<Navigate to="/novauser/register" replace />} />
      <Route path="/novauser/signin" element={<GuestOnly><SignInPage /></GuestOnly>} />
      <Route path="/novauser/login" element={<Navigate to="/novauser/signin" replace />} />
      <Route path="/login" element={<Navigate to="/novauser/signin" replace />} />

      {/* Public legal documents linked from the auth screens. */}
      <Route path="/novauser/terms" element={<LegalPage kind="terms" />} />
      <Route path="/novauser/privacy" element={<LegalPage kind="privacy" />} />

      {/* Every application route requires a valid NovaUser session. */}
      <Route path="/app" element={protect(<MainMenuPage theme={theme} onToggleTheme={handleToggleTheme} />)} />
      <Route path="/prologue" element={protect(<ProloguePage />)} />
      <Route path="/play" element={protect(<GameArenaPage theme={theme} onToggleTheme={handleToggleTheme} />)} />
      <Route path="/mission-echo" element={protect(<MissionEchoPage />)} />
      <Route path="/stage-5" element={<Navigate to="/mission-echo" replace />} />
      <Route path="/novauser/account" element={protect(<AccountPage />)} />
      <Route path="/novamap" element={protect(<SolarSystemPage theme={theme} onToggleTheme={handleToggleTheme} />)} />
      <Route path="/solar-system" element={<Navigate to="/novamap" replace />} />
      <Route path="/novabase" element={protect(<ExplorerPage theme={theme} onToggleTheme={handleToggleTheme} />)} />
      <Route path="/settings" element={protect(<PlaceholderPage title="Settings" theme={theme} onToggleTheme={handleToggleTheme} />)} />
      <Route path="/spacecraft/:slug" element={protect(<SpacecraftDetailPage theme={theme} onToggleTheme={handleToggleTheme} />)} />
      <Route path="/hardware/:slug" element={protect(<HardwareDetailPage theme={theme} onToggleTheme={handleToggleTheme} />)} />
      <Route path="*" element={protect(<NotFoundPage theme={theme} onToggleTheme={handleToggleTheme} />)} />
    </Routes>
  );
}
