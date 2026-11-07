import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import AppNavbar from '../Shared/components/layout/AppNavbar';
import ExplorerPage from '../NovaBase/pages/ExplorerPage';
import HardwareDetailPage from '../NovaBase/pages/HardwareDetailPage';
import SpacecraftDetailPage from '../NovaMap/pages/SpacecraftDetailPage';
import SolarSystemPage from '../NovaMap/pages/SolarSystemPage';
import TimeTravelersHomePage from '../NovaQuest/pages/TimeTravelersHomePage';
import MissionSelectPage from '../NovaQuest/pages/MissionSelectPage';
import Level1Surveyor5Page from '../NovaQuest/pages/Level1Surveyor5Page';
import SignInPage from '../NovaUser/pages/SignInPage';
import RegisterPage from '../NovaUser/pages/RegisterPage';
import LegalPage from '../NovaUser/pages/LegalPage';
import SettingsPage from '../NovaUser/settings/SettingsPage';
import { GuestOnly } from '../NovaUser/components/RouteGuards';
import { ArrowLeft, AlertCircle } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#070b14] space-bg flex flex-col font-sans text-slate-100">
      <AppNavbar />

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
  // NovaQuest is dark-only. The `dark` class is set on <html> in index.html
  // so there is no theme state, toggle, or localStorage preference to manage.
  //
  // Every application route is public. Signing in is optional and only adds
  // account-backed settings and progress.

  return (
    <Routes>
      {/* The app opens directly on the NovaQuest hub for guests and members. */}
      <Route path="/" element={<Navigate to="/app" replace />} />

      {/* Optional NovaUser destinations. Nothing redirects here automatically. */}
      <Route path="/register" element={<Navigate to="/novauser/register" replace />} />
      <Route path="/signup" element={<Navigate to="/novauser/register" replace />} />
      <Route path="/novauser" element={<Navigate to="/novauser/signin" replace />} />
      <Route path="/novauser/auth" element={<Navigate to="/novauser/signin" replace />} />
      <Route
        path="/novauser/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />
      <Route path="/novauser/signup" element={<Navigate to="/novauser/register" replace />} />
      <Route
        path="/novauser/signin"
        element={
          <GuestOnly>
            <SignInPage />
          </GuestOnly>
        }
      />
      <Route path="/novauser/login" element={<Navigate to="/novauser/signin" replace />} />
      <Route path="/login" element={<Navigate to="/novauser/signin" replace />} />

      {/* Public legal documents linked from the auth screens. */}
      <Route path="/novauser/terms" element={<LegalPage kind="terms" />} />
      <Route path="/novauser/privacy" element={<LegalPage kind="privacy" />} />

      {/* Public application routes: guests have full access. */}
      <Route path="/app" element={<TimeTravelersHomePage />} />
      <Route path="/missions" element={<MissionSelectPage />} />
      <Route path="/play" element={<Level1Surveyor5Page />} />
      <Route path="/play/surveyor-5" element={<Level1Surveyor5Page />} />
      <Route path="/prologue" element={<Navigate to="/play" replace />} />
      <Route path="/mission-echo" element={<Navigate to="/play" replace />} />
      <Route path="/stage-5" element={<Navigate to="/play" replace />} />
      <Route path="/novauser/account" element={<Navigate to="/settings#account" replace />} />
      <Route path="/novamap" element={<SolarSystemPage />} />
      <Route path="/solar-system" element={<Navigate to="/novamap" replace />} />
      <Route path="/novabase" element={<ExplorerPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/spacecraft/:slug" element={<SpacecraftDetailPage />} />
      <Route path="/hardware/:slug" element={<HardwareDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
