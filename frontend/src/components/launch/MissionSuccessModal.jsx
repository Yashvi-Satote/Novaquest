import React from 'react';
import { Award, CheckCircle, ChevronRight, Moon, Rocket, Sparkles, Trophy } from 'lucide-react';
import { gameAudio } from '../../../NovaQuest/config/gameAudio.js';

/**
 * MissionSuccessModal
 * 
 * Success celebration screen displayed after Part 3 finishes playing to the end.
 * "Surveyor 5 is on its way to the Moon!"
 * Marks the mission complete.
 */
export default function MissionSuccessModal({
  isOpen,
  score = 100,
  onClose,
  onReturnHub,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[360] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-success-title"
    >
      {/* Background Starlight & Radiant Flare */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(0, 240, 255, 0.25) 0%, rgba(10, 30, 70, 0.4) 40%, rgba(1, 4, 12, 0.95) 100%)',
        }}
      />

      <div className="relative w-full max-w-xl p-6 sm:p-9 rounded-2xl border-2 border-[#d6a95c] bg-gradient-to-b from-[#091b36] via-[#040e20] to-[#020712] shadow-[0_0_80px_rgba(214,169,92,0.35)] flex flex-col items-center text-center gap-5">
        
        {/* Top Trophy Crest */}
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-2 border-[#f5d085] bg-gradient-to-tr from-[#2d220f] via-[#4a3a19] to-[#1c1409] flex items-center justify-center shadow-[0_0_40px_rgba(245,208,133,0.7)]">
            <Trophy className="w-10 h-10 text-[#fbe19e] animate-bounce" />
          </div>
          <Sparkles className="w-6 h-6 text-[#5ee7ff] absolute -top-1 -right-1 animate-spin" />
        </div>

        {/* Title */}
        <div>
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.32em] text-[#5ee7ff]">
            Historical Mission Accomplished
          </span>
          <h2
            id="mission-success-title"
            className="text-2xl sm:text-3xl font-black uppercase tracking-[0.22em] text-[#e8f7ff] mt-1 drop-shadow-[0_0_15px_#00f0ff]"
          >
            Surveyor 5 is on its way to the Moon!
          </h2>
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#b8e5ff] mt-2">
            Atlas-Centaur AC-13 trans-lunar injection confirmed nominal.
          </p>
        </div>

        {/* Historical Insight Card */}
        <div className="w-full p-4 rounded-xl border border-[#00f0ff]/30 bg-[#061d36]/70 text-left space-y-2">
          <div className="flex items-center gap-2 text-[#7fe3ff] text-xs font-bold uppercase tracking-wider">
            <Moon className="w-4 h-4 text-[#8ef4ff]" />
            Mare Tranquillitatis Landing · September 11, 1967
          </div>
          <p className="text-xs leading-relaxed text-[#cde7f7]">
            Thanks to the quick thinking of NASA engineers, Surveyor 5 overcame the helium leak and touched down safely on the Moon. It transmitted over 19,000 photos and conducted the first chemical analysis of lunar soil!
          </p>
          <div className="pt-1 flex items-center justify-between border-t border-white/10 text-[10px] font-mono text-[#8ef4ff]">
            <span>MISSION SCORE:</span>
            <span className="text-amber-300 font-bold">{score} / 100 PTS</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
          <button
            type="button"
            autoFocus
            onClick={() => {
              gameAudio.playClick?.();
              onClose?.();
            }}
            className="group relative flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#d6a95c] bg-gradient-to-b from-[#221f1a] via-[#161411] to-[#0c0a08] text-[#e8c684] shadow-[0_0_24px_rgba(214,169,92,0.4)] transition-all hover:border-[#f5d085] hover:text-[#fff0ca] hover:shadow-[0_0_36px_rgba(245,208,133,0.6)] active:scale-95"
          >
            <Rocket className="w-4 h-4 text-[#e8c684] group-hover:scale-110" />
            <span className="text-xs font-bold uppercase tracking-[0.24em]">
              Return to Firing Room
            </span>
          </button>

          {onReturnHub && (
            <button
              type="button"
              onClick={() => {
                gameAudio.playClick?.();
                onReturnHub?.();
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/15 bg-white/[0.05] text-slate-200 text-xs font-bold uppercase tracking-[0.2em] hover:border-white/30 hover:text-white transition-all active:scale-95"
            >
              Back to Missions
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
