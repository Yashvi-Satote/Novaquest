import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Rocket, 
  Play, 
  Sliders, 
  Orbit, 
  Layers, 
  Volume2, 
  VolumeX, 
  Radio, 
  Compass, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Clock,
  Info
} from 'lucide-react';
import MenuDustCanvas from '../components/game/MenuDustCanvas';
import SettingsModal from '../components/game/SettingsModal';
import NewGameModal from '../components/game/NewGameModal';
import { hasSaveGame, getSaveGame, createNewGame, getSettings, saveSettings } from '../game/saveManager';
import { audio } from '../game/audioManager';

export default function MainMenuPage({ theme, onToggleTheme, initialOpenSettings = false }) {
  const navigate = useNavigate();

  // State
  const [saveExists, setSaveExists] = useState(hasSaveGame());
  const [saveData, setSaveData] = useState(getSaveGame());
  const [isSettingsOpen, setIsSettingsOpen] = useState(initialOpenSettings);
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => getSettings().audio.muted);
  const [isHoveredBtn, setIsHoveredBtn] = useState(null);
  const [showSurveyorLore, setShowSurveyorLore] = useState(false);

  // Refresh save status
  const refreshSaveStatus = () => {
    const exists = hasSaveGame();
    setSaveExists(exists);
    setSaveData(getSaveGame());
  };

  useEffect(() => {
    refreshSaveStatus();
  }, []);

  // Handle ambient drone audio on initial user interaction
  const handleToggleAudio = () => {
    audio.playClick();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const s = getSettings();
    s.audio.muted = newMuted;
    saveSettings(s);
    if (newMuted) {
      audio.stopAmbience();
    } else {
      audio.startAmbience();
    }
  };

  // Continue Game handler
  const handleContinue = () => {
    if (!saveExists) return;
    audio.playStartGame();
    setTimeout(() => {
      const save = getSaveGame();
      if (save?.currentChapter === 'prologue') {
        navigate('/prologue');
      } else {
        navigate('/play');
      }
    }, 400);
  };

  // New Game handler -> starts Step 1 Gender Selection on black screen
  const handleStartNewGame = () => {
    audio.playClick();
    navigate('/prologue');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-sans text-slate-100 select-none flex flex-col justify-between">
      
      {/* 1. PHOTOREALISTIC BACKGROUND: SURVEYOR 1 ON MOON LOOKING AT EARTH */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100 hover:scale-[1.01]"
        style={{
          backgroundImage: "url('/images/surveyor1_moon_earth.jpg')",
          backgroundPosition: 'center 40%'
        }}
        aria-label="Surveyor 1 lunar lander resting on the moon surface looking at planet Earth"
      />

      {/* 2. ATMOSPHERIC SHADOW, VIGNETTE & COLOR GRADING OVERLAYS */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_25%,rgba(56,189,248,0.12),transparent_45%)] pointer-events-none" />

      {/* 3. DYNAMIC DUST MOTES & TWINKLE PARTICLES */}
      <MenuDustCanvas density="High" />

      {/* 4. TOP HUD BAR */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-md shadow-cyan-500/30 ring-1 ring-cyan-400/40">
            <Rocket className="h-4 w-4 -rotate-45 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider uppercase text-white font-mono flex items-center gap-2">
              <span>NovaQuest</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Expedition Hub
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              LOC: Oceanus Procellarum • Target: Sol-3 (Earth)
            </div>
          </div>
        </div>

        {/* Top Right Quick Navigation Links */}
        <div className="flex items-center gap-3">
          <Link
            to="/novamap"
            onMouseEnter={() => audio.playHover()}
            onClick={() => audio.playClick()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 transition-all"
            title="Open 3D Solar System Map"
          >
            <Orbit className="h-3.5 w-3.5 text-cyan-400" />
            <span>NovaMap 3D</span>
          </Link>

          <Link
            to="/novabase"
            onMouseEnter={() => audio.playHover()}
            onClick={() => audio.playClick()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 transition-all"
            title="Search Hardware Catalogue"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Novabase</span>
          </Link>

          <button
            type="button"
            onClick={handleToggleAudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 transition-all"
            title={isMuted ? 'Unmute Audio Ambience' : 'Mute Audio Ambience'}
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-cyan-400" />
            )}
            <span className="hidden md:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>
        </div>
      </header>

      {/* 5. MAIN HERO & MENU INTERACTION SUITE */}
      <main className="relative z-20 flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 max-w-2xl py-12">
        
        {/* Title & Tagline */}
        <div className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-widest uppercase">
            <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            <span>Deep Space Telemetry Link Active</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-mono uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            NOVA<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">QUEST</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-light max-w-lg leading-relaxed drop-shadow-md">
            Rediscover humanity's forgotten cosmic relics. Pilot across lunar horizons, decrypt historic probe transmissions, and embark on mankind's greatest expeditions.
          </p>
        </div>

        {/* PRIMARY ACTION BUTTONS: NEW GAME, CONTINUE, SETTINGS */}
        <div className="space-y-3.5 w-full sm:w-[360px]">
          
          {/* BUTTON 1: NEW GAME */}
          <button
            type="button"
            onMouseEnter={() => { audio.playHover(); setIsHoveredBtn('new'); }}
            onMouseLeave={() => setIsHoveredBtn(null)}
            onClick={handleStartNewGame}
            className="group relative w-full flex items-center justify-between p-4 rounded-xl font-mono text-sm font-bold tracking-wider uppercase transition-all duration-300 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-xl shadow-cyan-600/30 hover:shadow-cyan-400/50 hover:scale-[1.02] active:scale-[0.98] border border-cyan-400/50 overflow-hidden"
            id="btn-new-game"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/30 border border-white/20">
                <Rocket className="h-4 w-4 -rotate-45 text-cyan-300" />
              </span>
              <span>New Game</span>
            </div>
            <ChevronRight className="h-5 w-5 text-cyan-200 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* BUTTON 2: CONTINUE */}
          <div className="relative">
            <button
              type="button"
              disabled={!saveExists}
              onMouseEnter={() => { if (saveExists) audio.playHover(); setIsHoveredBtn('continue'); }}
              onMouseLeave={() => setIsHoveredBtn(null)}
              onClick={handleContinue}
              className={`group w-full flex items-center justify-between p-4 rounded-xl font-mono text-sm font-bold tracking-wider uppercase transition-all duration-300 border ${
                saveExists
                  ? 'bg-slate-900/80 hover:bg-slate-800/90 text-white border-cyan-500/40 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-950/60 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-black/40 text-slate-500 border-white/5 cursor-not-allowed opacity-60'
              }`}
              id="btn-continue-game"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                  saveExists ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-white/5 border-white/5 text-slate-600'
                }`}>
                  <Play className="h-4 w-4 fill-current" />
                </span>
                <div className="text-left">
                  <div className="leading-tight">Continue</div>
                  {saveExists && (
                    <div className="text-[10px] font-normal tracking-normal text-cyan-300/80 lowercase mt-0.5">
                      {saveData?.title || 'Saved Checkpoint'}
                    </div>
                  )}
                </div>
              </div>

              {saveExists ? (
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              ) : (
                <span className="text-[10px] font-normal tracking-tight text-slate-600">No Save</span>
              )}
            </button>
          </div>

          {/* BUTTON 3: SETTINGS */}
          <button
            type="button"
            onMouseEnter={() => { audio.playHover(); setIsHoveredBtn('settings'); }}
            onMouseLeave={() => setIsHoveredBtn(null)}
            onClick={() => { audio.playClick(); setIsSettingsOpen(true); }}
            className="group w-full flex items-center justify-between p-4 rounded-xl font-mono text-sm font-bold tracking-wider uppercase transition-all duration-300 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/10 hover:border-white/20 hover:scale-[1.01] active:scale-[0.98]"
            id="btn-settings"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-300 group-hover:text-cyan-400 transition-colors">
                <Sliders className="h-4 w-4" />
              </span>
              <span>Settings</span>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-slate-300 transition-all" />
          </button>
        </div>

        {/* Surveyor 1 Scene Telemetry Badge */}
        <div className="mt-8 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSurveyorLore(!showSurveyorLore)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 border border-white/10 text-xs text-slate-400 hover:text-cyan-300 transition-colors font-mono"
          >
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            <span>Scene: Surveyor 1 on the Moon (1966)</span>
          </button>
        </div>

        {showSurveyorLore && (
          <div className="mt-2 p-3.5 rounded-xl bg-black/85 border border-cyan-500/30 text-xs font-mono text-slate-300 space-y-1.5 animate-fade-in backdrop-blur-md">
            <div className="text-cyan-400 font-bold uppercase tracking-wider">Historical Telemetry: Surveyor 1</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Launched May 30, 1966. On June 2, 1966, Surveyor 1 accomplished America's first soft lunar landing in Oceanus Procellarum, transmitting 11,237 television photos of the cratered regolith and looking back at the brilliant blue Earth in space.
            </p>
          </div>
        )}
      </main>

      {/* 6. BOTTOM FOOTER TELEMETRY STRIP */}
      <footer className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-t border-white/10 bg-black/60 backdrop-blur-md text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SURVEYOR 1 TELEMETRY ONLINE</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">COORDINATES: 2.474° S, 43.339° W</span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline">TARGET DISTANCE: 384,400 KM</span>
        </div>

        <div className="flex items-center gap-4">
          <span>NOVAQUEST 3D • NASA SPACE APPS CHALLENGE</span>
        </div>
      </footer>

      {/* 7. SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveChanged={refreshSaveStatus}
      />

      {/* 8. NEW GAME MODAL */}
      <NewGameModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onConfirmStart={handleStartNewGame}
      />

    </div>
  );
}
