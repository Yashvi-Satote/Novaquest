import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Clock, 
  Target, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Pause, 
  X, 
  ChevronRight, 
  Sparkles,
  Shield,
  Radio,
  ArrowLeft
} from 'lucide-react';
import { gameAudio } from '../../config/gameAudio';

/**
 * GameplayHUD.jsx
 * 
 * Overlay HUD for Level 1: Surveyor 5 (Time Travelers of Space)
 * - Current Objective Tracker with progress bar (1/6 to 6/6 scenes).
 * - Mission clock.
 * - Astronaut health & suit telemetry (Leo Stoolman).
 * - Quick controls reference and audio toggle.
 */
export default function GameplayHUD({
  currentSceneIndex = 0,
  totalScenes = 6,
  sceneTitle = '',
  sceneObjective = '',
  elapsedSeconds = 0,
  onPause,
  onExit,
  onToggleHelp,
  showHelp = false,
  interactionPrompt = null, // e.g. "Click to Inspect Surveyor 5"
  className = ''
}) {
  const [isMuted, setIsMuted] = useState(gameAudio.isMuted);

  const handleToggleMute = () => {
    const nextMuted = gameAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  // Format mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(((currentSceneIndex + 1) / totalScenes) * 100);

  return (
    <div className={`fixed inset-0 pointer-events-none z-30 select-none font-sans ${className}`}>
      {/* 1. TOP STATUS BAR */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Astronaut Profile & Mission Title */}
        <div className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-slate-950/85 border border-sky-400/40 backdrop-blur-xl shadow-lg">
          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Exit Mission"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-base shadow">
              🧑‍🚀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">Leo Stoolman</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 border border-sky-500/40 text-sky-300 font-bold">
                  HERO
                </span>
              </div>
              <span className="text-[11px] text-sky-300/80 font-medium hidden sm:block">
                Level 1: Surveyor 5 (1967)
              </span>
            </div>
          </div>
        </div>

        {/* Center: Current Objective Tracker Pill */}
        <div className="hidden md:flex flex-col items-center bg-slate-950/85 px-5 py-2 rounded-2xl border border-sky-400/40 backdrop-blur-xl shadow-lg max-w-md text-center">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase text-orange-400 tracking-wider">
            <Target className="w-3.5 h-3.5" />
            <span>Scene {currentSceneIndex + 1} of {totalScenes}: {sceneTitle}</span>
          </div>
          <p className="text-xs text-slate-200 font-medium truncate max-w-sm mt-0.5">
            {sceneObjective}
          </p>
          {/* Mini progress bar */}
          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden mt-1.5">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 to-orange-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Mission Timer & Controls */}
        <div className="flex items-center gap-2">
          {/* Mission Timer */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-950/85 border border-sky-400/40 backdrop-blur-xl text-xs font-mono font-bold text-amber-300 shadow-lg">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            className="p-2.5 rounded-2xl bg-slate-950/85 border border-sky-400/40 text-slate-300 hover:text-white backdrop-blur-xl transition-all shadow-lg hover:scale-105"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>

          {/* Controls / Help Button */}
          <button
            onClick={onToggleHelp}
            className={`p-2.5 rounded-2xl border backdrop-blur-xl transition-all shadow-lg hover:scale-105 ${
              showHelp 
                ? 'bg-sky-600 border-sky-300 text-white' 
                : 'bg-slate-950/85 border-sky-400/40 text-slate-300 hover:text-white'
            }`}
            title="Controls & Help"
          >
            <HelpCircle className="w-4 h-4 text-yellow-400" />
          </button>
        </div>
      </div>

      {/* 2. INTERACTION PROMPT (Center bottom banner) */}
      {interactionPrompt && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto animate-bounce">
          <div className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-950/95 via-slate-900/95 to-orange-950/95 border-2 border-yellow-400 text-white font-bold text-sm sm:text-base shadow-[0_0_30px_rgba(250,204,21,0.5)] backdrop-blur-xl">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{interactionPrompt}</span>
          </div>
        </div>
      )}

      {/* 3. HELP OVERLAY (Controls guide for kids) */}
      {showHelp && (
        <div className="absolute top-20 right-4 w-72 p-4 rounded-3xl bg-slate-950/95 border-2 border-sky-400/50 shadow-2xl backdrop-blur-xl text-white pointer-events-auto space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
            <span className="text-xs font-black uppercase text-sky-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-orange-400" />
              Astronaut Controls
            </span>
            <button onClick={onToggleHelp} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between items-center">
              <span className="font-mono text-sky-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-bold">W A S D</span>
              <span>Move Leo</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-sky-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-bold">MOUSE</span>
              <span>Look Around</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-sky-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-bold">E / TAP</span>
              <span>Interact / Inspect</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-sky-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-bold">SPACE</span>
              <span>Jump / Next</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

