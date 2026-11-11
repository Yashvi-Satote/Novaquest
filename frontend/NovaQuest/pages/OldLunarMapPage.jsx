import React, { useState, useEffect, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sliders, 
  Radio,
  Volume2, 
  VolumeX,
  RotateCcw
} from 'lucide-react';
import { getSaveGame } from '../game/saveManager';
import { getSettings, saveSettings } from '../../NovaUser/settings/store/settingsStore';
import { audio } from '../game/moonMapAudioManager';
import LunarMapChapter1 from '../components/game/LunarMapChapter1';

/**
 * Resilient Error Boundary for 3D WebGL / EVA Scene
 * Prevents full-screen crashes and renders high-tech fallback diagnostics.
 */
class GameErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('GameArena 3D Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-black text-slate-100 p-8 text-center font-mono select-none">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs mb-3">
            <span>EVA TELEMETRY · REBOOT PROTOCOL</span>
          </div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-2">
            Lunar Surface Link Interrupted
          </h2>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || 'WebGL display context reset. Re-initialize suit systems to resume exploration.'}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Re-Initialize EVA Suit</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              Return to Base Menu
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function OldLunarMapPage({ onComplete, onReturnMenu } = {}) {
  const navigate = useNavigate();

  // Active Save State
  const [save] = useState(() => getSaveGame());
  const [isMuted, setIsMuted] = useState(() => getSettings().audio.muted);

  useEffect(() => {
    audio.startAmbience();
    return () => audio.stopAllLoops();
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
              if (onReturnMenu) onReturnMenu();
              else navigate('/');
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
              navigate('/settings');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black border border-white/10 text-xs text-slate-300 hover:text-white transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>

      </header>

      {/* MAIN 3D CHAPTER 1 LUNAR SURFACE MAP */}
      <main className="relative flex-1 w-full min-h-0 h-full overflow-hidden">
        <GameErrorBoundary>
          <LunarMapChapter1
            mcGender={mcGender}
            onComplete={onComplete}
            onReturnMenu={onReturnMenu || (() => navigate('/missions'))}
          />
        </GameErrorBoundary>
      </main>

    </div>
  );
}
