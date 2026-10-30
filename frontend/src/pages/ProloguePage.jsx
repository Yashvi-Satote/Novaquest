import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  ChevronRight, 
  Sparkles, 
  Eye, 
  ArrowLeft,
  Shield
} from 'lucide-react';
import PlayableBedroom3D from '../components/game/PlayableBedroom3D';
import { createNewGame, saveGame, getSaveGame } from '../game/saveManager';
import { audio } from '../game/audioManager';

export default function ProloguePage() {
  const navigate = useNavigate();

  // Phase state:
  // 1. 'gender_select'
  // 2. 'bedroom_3d' (playable 3D character in room)
  // 3. 'telescope_focus' (interactive eyepiece)
  // 4. 'match_cut_2126' (transition to spacecraft)
  const [phase, setPhase] = useState('gender_select');
  const [selectedGender, setSelectedGender] = useState('male');

  // Telescope focus slider (0 to 100)
  const [focusValue, setFocusValue] = useState(25);
  const isMoonFocused = focusValue >= 85;

  // ESC key listener to step back into the 3D room
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && phase === 'telescope_focus') {
        setPhase('bedroom_3d');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  // Dynamic Pronouns
  const isFemale = selectedGender === 'female';
  const pronouns = {
    subj: isFemale ? 'she' : 'he',
    subjCap: isFemale ? 'She' : 'He',
    obj: isFemale ? 'her' : 'him',
    poss: isFemale ? 'her' : 'his',
    possCap: isFemale ? 'Her' : 'His',
    title: isFemale ? "Ma'am" : 'Sir',
    descriptor: isFemale ? 'The Girl Who Looked Up' : 'The Boy Who Looked Up'
  };

  // STEP 1: Handle Gender Selection
  const handleSelectGender = (gender) => {
    audio.playClick();
    setSelectedGender(gender);
    createNewGame({ gender });

    // Transition smoothly to Step 2 3D Bedroom
    setTimeout(() => {
      setPhase('bedroom_3d');
      audio.startAmbience();
    }, 400);
  };

  // Step 2: Reached Telescope in 3D
  const handleInteractTelescope = () => {
    audio.playClick();
    setPhase('telescope_focus');
  };

  // Step 2: Match-Cut Transition
  const handleMatchCut = () => {
    audio.playStartGame();
    setPhase('match_cut_2126');

    // Archive Chapter 1 checkpoint
    const currentSave = getSaveGame();
    if (currentSave) {
      saveGame({
        ...currentSave,
        currentChapter: 'chapter_1',
        title: 'Chapter 1: A Different Kind of Mission',
        location: 'NASA Orbital Facility, Briefing Room',
        objective: 'Attend assignment briefing with Commander Elena Voss and Maya Chen.'
      });
    }
  };

  const handleLaunchChapter1 = () => {
    audio.playClick();
    navigate('/play');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-sans text-slate-100 select-none">
      
      {/* ========================================================================= */}
      {/* STEP 1: BLACK SCREEN GENDER SELECTION (MALE / FEMALE)                    */}
      {/* ========================================================================= */}
      {phase === 'gender_select' && (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-black relative animate-fade-in">
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08),transparent_65%)] pointer-events-none" />

          {/* Dossier Header */}
          <div className="text-center space-y-2 mb-10 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-widest uppercase">
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              <span>NASA RECONNAISSANCE CORPS · RECOVERY DIVISION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-wide text-white uppercase pt-2">
              Select Officer Identity
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
              Choose the identity profile for <strong className="text-white font-medium">Captain Arin Rao</strong> to initialize personal mission archives.
            </p>
          </div>

          {/* Gender Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl z-10">
            
            {/* MALE OPTION */}
            <button
              type="button"
              onMouseEnter={() => audio.playHover()}
              onClick={() => handleSelectGender('male')}
              className="group relative flex flex-col items-center text-center p-8 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-cyan-400/80 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-cyan-950/70"
            >
              <div className="w-24 h-24 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-400 transition-all mb-5 shadow-inner">
                <User className="w-12 h-12 stroke-[1.5]" />
              </div>

              <div className="space-y-1.5 font-mono">
                <span className="text-[10px] text-cyan-400 tracking-widest uppercase bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  Profile // Male
                </span>
                <h3 className="text-lg font-bold text-white pt-1">Captain Arin Rao</h3>
                <div className="text-xs text-cyan-300 font-medium">He / Him</div>
              </div>

              <p className="text-xs text-slate-400 font-sans mt-3 leading-relaxed">
                Curious, observant, and technically capable. Fascinated by space since childhood.
              </p>

              <div className="mt-6 w-full py-2.5 rounded-xl bg-cyan-500/20 group-hover:bg-cyan-500 text-cyan-300 group-hover:text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5">
                <span>Confirm Male Identity</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* FEMALE OPTION */}
            <button
              type="button"
              onMouseEnter={() => audio.playHover()}
              onClick={() => handleSelectGender('female')}
              className="group relative flex flex-col items-center text-center p-8 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-indigo-400/80 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-indigo-950/70"
            >
              <div className="w-24 h-24 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:border-indigo-400 transition-all mb-5 shadow-inner">
                <User className="w-12 h-12 stroke-[1.5]" />
              </div>

              <div className="space-y-1.5 font-mono">
                <span className="text-[10px] text-indigo-400 tracking-widest uppercase bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  Profile // Female
                </span>
                <h3 className="text-lg font-bold text-white pt-1">Captain Arin Rao</h3>
                <div className="text-xs text-indigo-300 font-medium">She / Her</div>
              </div>

              <p className="text-xs text-slate-400 font-sans mt-3 leading-relaxed">
                Curious, observant, and technically capable. Fascinated by space since childhood.
              </p>

              <div className="mt-6 w-full py-2.5 rounded-xl bg-indigo-500/20 group-hover:bg-indigo-500 text-indigo-300 group-hover:text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5">
                <span>Confirm Female Identity</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>

          <div className="mt-10 text-xs font-mono text-slate-500 flex items-center gap-2 z-10">
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            <span>ARCHIVE DOSSIER LINKED · INITIALIZING 3D WORLD</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: PLAYABLE 3D BEDROOM — ARIN WALKS AROUND TOWARD TELESCOPE          */}
      {/* ========================================================================= */}
      {phase === 'bedroom_3d' && (
        <div className="relative h-screen w-screen overflow-hidden animate-fade-in bg-black">
          
          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
            <div className="pointer-events-auto flex items-center gap-3 font-mono">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors shadow-md"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Main Menu</span>
              </button>

              <div className="hidden sm:block">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Opening — {pronouns.descriptor}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Late Night · Childhood Room & Study
                </div>
              </div>
            </div>

            <div className="pointer-events-auto text-xs font-mono text-slate-400 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 hidden md:block">
              Walk with <strong className="text-cyan-300">WASD</strong> or <strong className="text-cyan-300">Arrow Keys</strong>
            </div>
          </div>

          {/* 3D Playable Canvas */}
          <PlayableBedroom3D
            mcGender={selectedGender}
            onInteractTelescope={handleInteractTelescope}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2 - PART B: INTERACTIVE TELESCOPE EYEPIECE FOCUS                     */}
      {/* ========================================================================= */}
      {phase === 'telescope_focus' && (
        <div className="relative min-h-screen w-full flex flex-col justify-between items-center p-6 bg-black animate-fade-in">
          
          <header className="w-full max-w-2xl flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <Eye className="w-4 h-4" />
              <span>Through the Brass Telescope Eyepiece</span>
            </div>
            <button
              type="button"
              onClick={() => setPhase('bedroom_3d')}
              className="text-xs font-mono text-slate-400 hover:text-white"
            >
              Step Away [Esc]
            </button>
          </header>

          <main className="w-full max-w-md flex flex-col items-center text-center space-y-6 my-auto">
            
            {/* Round Telescope Eyepiece */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full border-4 border-slate-700 shadow-[0_0_80px_rgba(56,189,248,0.35)] overflow-hidden bg-black flex items-center justify-center ring-8 ring-black/80">
              {/* Scope reticle & measurement markings */}
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/35" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/35" />
                <div className="absolute inset-8 rounded-full border border-cyan-400/25" />
                <div className="absolute inset-16 rounded-full border border-dashed border-cyan-400/20" />
                
                {/* Edge Vignette for realistic ocular lens feel */}
                <div 
                  className="absolute inset-0 rounded-full" 
                  style={{
                    background: 'radial-gradient(circle, transparent 60%, rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.95) 100%)'
                  }} 
                />
              </div>

              {/* Moon View with Dynamic Optical Blur - ONLY the Moon from close up */}
              <img
                src="/images/moon_close_up_telescope.jpg"
                alt="Close-up Moon through telescope"
                className="w-full h-full object-cover transition-all duration-300 scale-105"
                style={{
                  filter: `blur(${Math.max(0, (100 - focusValue) * 0.18)}px) brightness(${0.7 + (focusValue / 200)}) contrast(${0.95 + (focusValue / 300)})`
                }}
              />

              {isMoonFocused && (
                <div className="absolute bottom-6 z-20 px-3.5 py-1 rounded-full bg-emerald-500/90 border border-emerald-400 text-[10px] font-mono text-white font-bold tracking-widest uppercase shadow-lg shadow-emerald-500/30 animate-pulse backdrop-blur-sm">
                  Moon In Sharp Focus
                </div>
              )}
            </div>

            {/* Focus Slider */}
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Rotate Telescope Focus Ring</span>
                <span className="text-cyan-400 font-bold">{focusValue}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={focusValue}
                onChange={(e) => {
                  setFocusValue(Number(e.target.value));
                  if (Number(e.target.value) >= 85) audio.playHover();
                }}
                className="w-full h-2.5 bg-slate-800 rounded-lg accent-cyan-400 cursor-pointer"
              />
            </div>

            {isMoonFocused ? (
              <button
                type="button"
                onClick={handleMatchCut}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-xl shadow-cyan-600/30 hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>The Moon Fills the View · Transition to 2126</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <p className="text-[11px] font-mono text-slate-400">
                Turn the focus ring past 85% to bring the lunar craters into sharp clarity
              </p>
            )}
          </main>

          <footer className="text-xs font-mono text-slate-500 py-3">
            “THE MOON FILLS THE VIEW” · PROLOGUE MATCH-CUT READY
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2 - PART C: MATCH-CUT TRANSITION TO 2126 SPACECRAFT VIEWPORT         */}
      {/* ========================================================================= */}
      {phase === 'match_cut_2126' && (
        <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden animate-fade-in bg-black">
          
          {/* Background: 2126 Spacecraft Viewport */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/spacecraft_viewport_2126.jpg')"
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/75 pointer-events-none" />

          {/* Top Classification */}
          <header className="relative z-20 p-6 flex justify-between items-center font-mono text-xs text-cyan-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>CISLUNAR ORBITAL TRAJECTORY · YEAR 2126</span>
            </div>
            <div>SECTOR: LUNAR RECOVERY ZONE</div>
          </header>

          {/* Epic Match-Cut Title Card */}
          <main className="relative z-20 flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="p-6 rounded-2xl bg-black/85 border border-cyan-500/40 backdrop-blur-md max-w-xl mx-auto shadow-2xl space-y-3">
              <div className="text-xs font-mono uppercase tracking-widest text-cyan-300">
                NASA DEEP RECOVERY EXPEDITIONS
              </div>

              <h1 className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-white uppercase">
                NOVA<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">QUEST</span>
              </h1>

              <div className="h-px w-24 bg-cyan-500/50 mx-auto" />

              <h2 className="text-base sm:text-lg font-bold font-mono tracking-widest text-slate-200 uppercase">
                THE FIRST FOOTPRINT
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed pt-2">
                In 2126, <strong className="text-white">Captain Arin Rao ({pronouns.title})</strong> leads a specialized NASA recovery team. Years after gazing at the Moon through a childhood bedroom telescope, {pronouns.poss} first command begins not on a distant world, but returning to humanity's 1966 pioneer: <strong className="text-cyan-300">Surveyor 1</strong>.
              </p>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleLaunchChapter1}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-xl shadow-cyan-600/30 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <span>Begin Chapter One: A Different Kind of Mission</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </main>

          <footer className="relative z-20 p-4 border-t border-white/10 bg-black/80 text-center text-xs font-mono text-slate-400">
            OPENING COMPLETED · CHECKPOINT SAVED
          </footer>
        </div>
      )}

    </div>
  );
}
