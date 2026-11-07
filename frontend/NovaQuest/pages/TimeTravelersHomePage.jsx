import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  RotateCcw, 
  Compass, 
  Sliders, 
  Sparkles, 
  Rocket, 
  Award, 
  Star,
  Clock,
  ChevronRight
} from 'lucide-react';
import AppNavbar from '../../Shared/components/layout/AppNavbar';
import EarthMoonHero3D from '../components/home/EarthMoonHero3D';
import SettingsModal from '../components/home/SettingsModal';
import GameButton from '../components/shared/GameButton';
import { gameAudio } from '../config/gameAudio';
import { hasSaveGame, getSaveGame } from '../game/saveManager';

/**
 * TimeTravelersHomePage.jsx
 * 
 * Commercial-quality Landing Screen for "TIME TRAVELERS OF SPACE"
 * Brand: NOVAQUEST GAMES
 * 
 * Combines:
 * - 70% Colorful Cartoon 3D Adventure (friendly, bright gradients, soft bounce)
 * - 20% NASA-inspired Educational Explorer (authentic historical cues)
 * - 10% Cinematic Space Adventure (3D Earth & Moon hero, floating stardust)
 */
export default function TimeTravelersHomePage() {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [saveExists, setSaveExists] = useState(false);
  const [saveInfo, setSaveInfo] = useState(null);

  useEffect(() => {
    const exists = hasSaveGame();
    setSaveExists(exists);
    if (exists) {
      setSaveInfo(getSaveGame());
    }
  }, []);

  const handlePlayGame = () => {
    gameAudio.playClick();
    navigate('/play');
  };

  const handleContinue = () => {
    gameAudio.playClick();
    navigate('/play');
  };

  const handleMissions = () => {
    gameAudio.playClick();
    navigate('/missions');
  };

  const handleOpenSettings = () => {
    gameAudio.playClick();
    setIsSettingsOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070b19] font-sans text-slate-100 select-none flex flex-col justify-between">
      {/* Global Application Navbar */}
      <AppNavbar />

      {/* 1. INTERACTIVE 3D EARTH & MOON HERO BACKGROUND */}
      <EarthMoonHero3D className="z-0" />

      {/* Soft gradient vignettes for cinematic framing */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b19] via-transparent to-[#070b19]/60 pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#070b19]/90 to-transparent pointer-events-none z-0" />

      {/* 2. MAIN HERO CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-6xl mx-auto w-full text-center">
        {/* Brand Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/40 backdrop-blur-md text-sky-300 text-xs sm:text-sm font-bold uppercase tracking-widest shadow-lg shadow-sky-500/20 mb-4 animate-bounce">
          <Rocket className="w-4 h-4 text-orange-400 -rotate-45" />
          <span>NOVAQUEST GAMES</span>
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <span className="text-yellow-300">EPISODE 1</span>
        </div>

        {/* Game Title: TIME TRAVELERS OF SPACE */}
        <div className="space-y-2 mb-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight drop-shadow-[0_8px_30px_rgba(2,132,199,0.6)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-sky-200">
              TIME TRAVELERS
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-300">
              OF SPACE
            </span>
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg text-sky-100/90 font-medium drop-shadow-md">
            Blast off to 1967, solve mission emergencies with NASA scientists, and uncover the secret history of lunar exploration!
          </p>
        </div>

        {/* Current Active Mission Preview Pill */}
        <div 
          onClick={handleMissions}
          className="cursor-pointer group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/80 border border-sky-400/40 hover:border-orange-400/60 backdrop-blur-xl shadow-xl transition-all hover:scale-105 mb-8"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-md">
            1
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-bold text-orange-400 uppercase tracking-wider">
              Level 1 Active Mission
            </span>
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
              Surveyor 5 — The Moon Mission (1967)
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Main Action Buttons Grid (Phase 2 Requirement) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-xl">
          {/* 1. PLAY GAME */}
          <GameButton
            id="play-game-btn"
            size="lg"
            variant="accent"
            onClick={handlePlayGame}
            icon={Play}
            className="w-full sm:w-auto flex-1 text-lg font-black shadow-orange-500/30"
          >
            PLAY GAME
          </GameButton>

          {/* 2. CONTINUE (Enabled if save exists) */}
          <GameButton
            id="continue-game-btn"
            size="lg"
            variant={saveExists ? 'primary' : 'glass'}
            disabled={!saveExists}
            onClick={handleContinue}
            icon={RotateCcw}
            className="w-full sm:w-auto flex-1 font-bold"
          >
            {saveExists ? 'CONTINUE' : 'CONTINUE'}
          </GameButton>

          {/* 3. MISSIONS */}
          <GameButton
            id="missions-btn"
            size="lg"
            variant="purple"
            onClick={handleMissions}
            icon={Compass}
            className="w-full sm:w-auto flex-1 font-bold"
          >
            MISSIONS
          </GameButton>

          {/* 4. SETTINGS */}
          <GameButton
            id="settings-btn"
            size="lg"
            variant="glass"
            onClick={handleOpenSettings}
            icon={Sliders}
            className="w-full sm:w-auto px-5"
            aria-label="Settings"
          >
            SETTINGS
          </GameButton>
        </div>

        {/* Quick Highlights / Learning Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            5-Minute Mission
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/60">
            <Award className="w-3.5 h-3.5 text-yellow-400" />
            Earn Lunar Pioneer Badge
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/60">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            Authentic NASA 1967 History
          </span>
        </div>
      </main>

      {/* Floating Astronaut Companion Mascot on Home Screen */}
      <div 
        onClick={() => {
          gameAudio.playSuccess();
        }}
        className="fixed bottom-6 right-6 z-20 cursor-pointer group hidden md:block"
        title="Hi, Explorer! Ready to travel back to 1967?"
      >
        <div className="relative">
          <div className="w-20 h-24 hover:scale-110 transition-transform duration-300 drop-shadow-[0_10px_25px_rgba(6,182,212,0.5)]">
            <img 
              src="/images/nova_alien_companion.png" 
              alt="NOVA Space Guide" 
              className="w-full h-full object-contain animate-bounce"
              style={{ animationDuration: '3.5s' }}
            />
          </div>
          {/* Speech Bubble */}
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 rounded-2xl bg-slate-900/95 border border-cyan-400/50 shadow-xl text-left text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="font-bold text-cyan-300">NOVA: </span>
            Welcome to Time Travelers of Space! Click Play to start Level 1.
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
