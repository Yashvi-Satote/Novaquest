import React, { useState } from 'react';
import { Volume2, VolumeX, Sliders, X, Monitor, Keyboard, Sparkles, Check } from 'lucide-react';
import GameButton from '../shared/GameButton';
import { gameAudio } from '../../config/gameAudio';

/**
 * SettingsModal.jsx
 * 
 * Accessible, kid-friendly settings modal for NovaQuest Games.
 * - Volume slider and mute toggle.
 * - Graphics quality preference.
 * - Quick keyboard & touch controls reference card.
 */
export default function SettingsModal({ isOpen, onClose }) {
  const [isMuted, setIsMuted] = useState(gameAudio.isMuted);
  const [volume, setVolume] = useState(Math.round(gameAudio.volume * 100));
  const [graphicsQuality, setGraphicsQuality] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('novaquest_graphics_quality') || 'high';
    }
    return 'high';
  });

  // Escape key listener to close modal
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        gameAudio.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleToggleMute = () => {
    const nextMute = gameAudio.toggleMute();
    setIsMuted(nextMute);
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    gameAudio.setVolume(val / 100);
    if (isMuted && val > 0) {
      setIsMuted(false);
      gameAudio.setMuted(false);
    }
  };

  const handleSetQuality = (q) => {
    setGraphicsQuality(q);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('novaquest_graphics_quality', q);
      } catch (e) {}
    }
    gameAudio.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-slate-900/95 border-2 border-sky-400/50 shadow-[0_20px_60px_rgba(2,132,199,0.4)] text-white p-6 sm:p-8 space-y-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/30">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-xl font-black text-white tracking-wide">
                GAME SETTINGS
              </h2>
              <p className="text-xs text-sky-300">Audio, Graphics & Controls</p>
            </div>
          </div>
          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Audio Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
              {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
              Sound Effects & Music
            </span>
            <button
              onClick={handleToggleMute}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                isMuted 
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' 
                  : 'bg-sky-950/60 border-sky-500/50 text-sky-300'
              }`}
            >
              {isMuted ? 'Muted (Tap to Unmute)' : 'Sound Enabled'}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-3 rounded-lg bg-slate-800 accent-sky-400 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-sky-300 w-10 text-right">
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>
        </div>

        {/* 2. Graphics Quality */}
        <div className="space-y-2">
          <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-purple-400" />
            Graphics Quality
          </span>
          <div className="grid grid-cols-3 gap-2">
            {['high', 'medium', 'low'].map((q) => (
              <button
                key={q}
                onClick={() => handleSetQuality(q)}
                className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                  graphicsQuality === q
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 border-sky-400 text-white shadow-md'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Keyboard & Touch Controls Guide */}
        <div className="space-y-2 pt-2 border-t border-sky-500/20">
          <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-orange-400" />
            How to Play
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-sky-300 font-bold">W A S D</kbd>
              <span>Move Astronaut</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-sky-300 font-bold">MOUSE</kbd>
              <span>Look & Inspect</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-sky-300 font-bold">E</kbd>
              <span>Interact / Grab</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-sky-300 font-bold">SPACE</kbd>
              <span>Jump / Dialogue</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <GameButton
            size="md"
            variant="primary"
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
          >
            Done
          </GameButton>
        </div>
      </div>
    </div>
  );
}
