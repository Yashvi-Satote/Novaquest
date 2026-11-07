import React, { useEffect } from 'react';
import { 
  Award, 
  Star, 
  RotateCcw, 
  Compass, 
  CheckCircle2, 
  Sparkles, 
  Camera, 
  ThermometerSnowflake, 
  Radio, 
  Lock 
} from 'lucide-react';
import GameButton from '../shared/GameButton';
import { SURVEYOR_5_MISSION } from '../../config/surveyor5Data';
import { gameAudio } from '../../config/gameAudio';

/**
 * MissionCompletionModal.jsx
 * 
 * Scene 6: Final Mission Conclusion (4:30 - 5:00)
 * - Celebratory 3-Star Award Screen.
 * - Lunar Pioneer Badge.
 * - Key educational facts learned (19,118 images, -250°F lunar night, Apollo crossover).
 * - Replay Mission & Next Level (Locked) actions.
 */
export default function MissionCompletionModal({
  isOpen = true,
  onReplay,
  onReturnToHub,
  elapsedSeconds = 295
}) {
  const { conclusion, badgeName } = SURVEYOR_5_MISSION;

  useEffect(() => {
    if (isOpen) {
      gameAudio.playVictory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900/95 border-2 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.4)] text-white p-6 sm:p-8 space-y-6 text-center"
        role="dialog"
        aria-modal="true"
      >
        {/* Confetti / Sparkle Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 text-xs font-black uppercase tracking-widest animate-bounce">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>MISSION ACCOMPLISHED</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-orange-400">
            SURVEYOR 5 COMPLETED!
          </h1>
          <p className="text-xs sm:text-sm text-sky-200">
            You successfully navigated 1967 space history with Dr. Leonard Jaffe!
          </p>
        </div>

        {/* 3-Star Rating Animation */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[1, 2, 3].map((starIndex) => (
            <div 
              key={starIndex}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-[0_6px_20px_rgba(250,204,21,0.5)] transform hover:scale-110 transition-transform"
              style={{ animationDelay: `${starIndex * 200}ms` }}
            >
              <Star className="w-8 h-8 sm:w-10 sm:h-10 fill-slate-950 stroke-none" />
            </div>
          ))}
        </div>

        {/* Badge Award Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900/90 to-purple-950/80 border border-sky-400/40 flex items-center justify-center gap-4 text-left max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg">
            <Award className="w-8 h-8 text-yellow-300" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block">
              Official Award Unlocked
            </span>
            <h3 className="text-lg font-black text-white">{badgeName}</h3>
            <p className="text-xs text-slate-300">Awarded for authentic 1967 lunar exploration</p>
          </div>
        </div>

        {/* What You Learned (Historical Facts) */}
        <div className="text-left space-y-2">
          <span className="text-xs font-black uppercase text-sky-400 tracking-wider block">
            Key Historical Facts Discovered:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-orange-400" />
                19,118 Photos
              </span>
              <p className="text-[11px] text-slate-400">
                Transmitted 19,118 high-resolution 600-line TV panoramas to Earth.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-400" />
                -250°F Lunar Night
              </span>
              <p className="text-[11px] text-slate-400">
                Survived intense 14-day freezing lunar night cold twice!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Final Signal
              </span>
              <p className="text-[11px] text-slate-400">
                Transmitted final engineering telemetry on December 17, 1967.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-sky-500/20">
          {/* Replay */}
          <GameButton
            size="md"
            variant="glass"
            onClick={onReplay}
            icon={RotateCcw}
            className="w-full sm:w-auto"
          >
            Replay Mission
          </GameButton>

          {/* Next Level (Locked) */}
          <button
            disabled
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
            title="Apollo 11 mission under development for next episode"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Next Level: Apollo 11 (Locked)</span>
          </button>

          {/* Return to Hub */}
          <GameButton
            size="md"
            variant="primary"
            onClick={onReturnToHub}
            icon={Compass}
            className="w-full sm:w-auto"
          >
            Return to Hub
          </GameButton>
        </div>
      </div>
    </div>
  );
}
