import React, { useState } from 'react';
import EarthLaunchCinematic from './EarthLaunchCinematic';
import MoonLandingCinematic from './MoonLandingCinematic';
import TimeTravelCinematic from './TimeTravelCinematic';
import NasaHqCinematic from './NasaHqCinematic';
import { Sparkles, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import GameButton from '../shared/GameButton';
import { gameAudio } from '../../config/gameAudio';

/**
 * CinematicIntroContainer.jsx
 * 
 * Master Orchestrator for the Level 1: Surveyor 5 3D Cinematic Introduction:
 * - Scene 1: Earth and Rocket Launch (0:00 - 0:20)
 * - Scene 2: Moon Landing & Lunar Surface Exploration (0:20 - 0:45)
 * - Scene 3: Time Travel Warp Tunnel into 1967 (0:45 - 1:00)
 * - Scene 4: NASA Headquarters 1967 with Dr. Leonard Jaffe (1:00 - 1:30)
 * - Optional Global "Skip Cinematic" control
 * - Review & Completion state for developer & user evaluation
 */
export default function CinematicIntroContainer({ onComplete }) {
  const [introSceneIndex, setIntroSceneIndex] = useState(0); // 0: Launch, 1: Moon, 2: Warp, 3: NASA HQ, 4: Review Complete
  const [isIntroComplete, setIsIntroComplete] = useState(false);

  const handleNextScene = () => {
    gameAudio.playClick();
    if (introSceneIndex < 3) {
      setIntroSceneIndex(prev => prev + 1);
    } else {
      setIsIntroComplete(true);
      setIntroSceneIndex(4);
      gameAudio.playVictory();
    }
  };

  const handleSkipToNasaHq = () => {
    gameAudio.playClick();
    setIntroSceneIndex(3); // Jump straight to NASA HQ Dr. Jaffe dialogue
  };

  const handleReplayAll = () => {
    gameAudio.playClick();
    setIsIntroComplete(false);
    setIntroSceneIndex(0);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Scene 1: Earth & Rocket Launch */}
      {introSceneIndex === 0 && (
        <EarthLaunchCinematic
          onComplete={handleNextScene}
          onSkip={handleSkipToNasaHq}
        />
      )}

      {/* Scene 2: Moon Landing & Exploration */}
      {introSceneIndex === 1 && (
        <MoonLandingCinematic
          onComplete={handleNextScene}
          onSkip={handleSkipToNasaHq}
        />
      )}

      {/* Scene 3: Time Travel Warp Tunnel */}
      {introSceneIndex === 2 && (
        <TimeTravelCinematic
          onComplete={handleNextScene}
          onSkip={handleSkipToNasaHq}
        />
      )}

      {/* Scene 4: NASA Headquarters 1967 */}
      {introSceneIndex === 3 && (
        <NasaHqCinematic
          onComplete={handleNextScene}
          onSkip={() => {
            setIsIntroComplete(true);
            setIntroSceneIndex(4);
            if (onComplete) onComplete();
          }}
        />
      )}

      {/* Review & Completion Screen (Final Review State) */}
      {introSceneIndex === 4 && (
        <div className="relative w-full h-full flex items-center justify-center p-6 bg-radial-gradient from-slate-900 to-slate-950">
          <div className="relative max-w-xl w-full p-8 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border-2 border-sky-400/50 shadow-[0_20px_60px_rgba(2,132,199,0.4)] text-center animate-fade-in">
            {/* Hero Character Badge */}
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 p-1.5 shadow-xl ring-4 ring-sky-300/60">
                <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src="/images/nova_alien_companion.png" alt="Astronaut Hero" className="w-20 h-20 object-contain drop-shadow" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950 border border-sky-400/40 text-xs font-bold text-sky-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Cinematic Introduction Complete</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Ready for Surveyor 5 Mission!
            </h1>

            <p className="text-sm sm:text-base text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
              Dr. Leonard Jaffe has briefed you at NASA Headquarters 1967. The animated introduction (Scenes 1–4) has played successfully with full 3D storytelling and voice dialogue.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GameButton
                variant="secondary"
                size="md"
                onClick={handleReplayAll}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Introduction</span>
              </GameButton>

              {onComplete && (
                <GameButton
                  variant="primary"
                  size="md"
                  onClick={onComplete}
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <span>Proceed to Next Phase</span>
                  <ArrowRight className="w-4 h-4" />
                </GameButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

