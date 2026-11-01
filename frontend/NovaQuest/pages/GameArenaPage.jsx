import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sliders, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Shield, 
  Radio, 
  Layers 
} from 'lucide-react';
import { getSaveGame, getSettings, saveSettings } from '../game/saveManager';
import { audio } from '../game/audioManager';
import SettingsModal from '../components/game/SettingsModal';
import LunarMapChapter1 from '../components/game/LunarMapChapter1';

export default function GameArenaPage({ theme }) {
  const navigate = useNavigate();

  // Active Save State
  const [save] = useState(() => getSaveGame());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => getSettings().audio.muted);

  useEffect(() => {
    audio.startAmbience();
    return () => {
      // Don't kill ambience if navigating within game
    };
  }, []);

  const handleToggleMute = () => {
    audio.playClick();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const s = getSettings();
    s.audio.muted = newMuted;
    saveSettings(s);
    if (newMuted) audio.stopAmbience();
    else audio.startAmbience();
  };

  const mcGender = save?.player?.mcGender || 'male';

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-mono select-none flex flex-col">
      
      {/* TOP COMPACT NAVIGATION BAR */}
      <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-3.5 pointer-events-none bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        
        {/* Left: Return & Mission Title */}
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              navigate('/');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black border border-white/10 text-xs text-slate-300 hover:text-white transition-all shadow-lg hover:scale-105 active:scale-95"
            title="Return to Main Menu"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Main Menu</span>
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs text-cyan-300 font-bold uppercase tracking-widest">
              NOVAQUEST · CHAPTER 1: THE FIRST FOOTPRINT
            </span>
          </div>
        </div>

        {/* Right: Quick Audio & Settings */}
        <div className="pointer-events-auto flex items-center gap-2">
          
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-black/80 hover:bg-black border border-white/10 text-slate-300 hover:text-white transition-all shadow-lg"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playClick();
              setIsSettingsOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black border border-white/10 text-xs text-slate-300 hover:text-white transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>

      </header>

      {/* MAIN 3D CHAPTER 1 LUNAR SURFACE MAP */}
      <main className="relative flex-1 w-full h-full">
        <LunarMapChapter1
          mcGender={mcGender}
          onReturnMenu={() => navigate('/')}
        />
      </main>

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
}
