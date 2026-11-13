import React from 'react';
import { Rocket, Sparkles, ChevronRight } from 'lucide-react';

/**
 * Surveyor5UnlockedModal
 *
 * Sci-fi unlocked celebration overlay presented when Surveyor 5 progress hits 100%.
 * Matches the reference card UI:
 * - Geometric gold/cyan framing lines with central diamond crests
 * - Glowing layered central badge with cyan light rays and particle bursts
 * - Glowing uppercase typography
 * - Sci-fi briefing text
 * - High-contrast sci-fi action button "UNLOCK LAUNCH"
 */
export default function Surveyor5UnlockedModal({ isOpen, onUnlockLaunch }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[280] flex items-center justify-center overflow-hidden bg-[#01050e]/90 p-4 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="surveyor5-unlocked-title"
    >
      {/* Background glow and subtle mesh */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(20, 85, 170, 0.35) 0%, rgba(3, 12, 28, 0.6) 45%, rgba(1, 4, 12, 0.95) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'radial-gradient(#5ee7ff 1px, transparent 1px), radial-gradient(#2f7bff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-2xl py-8 px-6 sm:px-12 flex flex-col items-center text-center select-none">
        
        {/* Top Decorative Horizon Line with Diamond Pip */}
        <div className="relative w-full flex items-center justify-center my-3">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#b59556]/60 to-[#e2cb92]" />
          <div className="relative mx-3 flex items-center justify-center">
            {/* Outer diamond */}
            <span className="w-3.5 h-3.5 rotate-45 border border-[#e8d5a3] bg-[#050c18] flex items-center justify-center shadow-[0_0_8px_rgba(232,213,163,0.5)]">
              <span className="w-1.5 h-1.5 rotate-45 bg-[#e8d5a3]" />
            </span>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#b59556]/60 to-[#e2cb92]" />
        </div>

        {/* Title */}
        <div className="my-2">
          <h2
            id="surveyor5-unlocked-title"
            className="text-lg sm:text-2xl font-light uppercase tracking-[0.38em] text-[#e8f7ff]"
            style={{
              textShadow: '0 0 20px rgba(135, 230, 255, 0.6), 0 0 35px rgba(47, 123, 255, 0.4)',
            }}
          >
            SPACECRAFT UNLOCKED
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#5ee7ff]/60" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#5ee7ff]/80" />
            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#5ee7ff]/60" />
          </div>
        </div>

        {/* Central Glowing Emblem & Horizon Flare */}
        <div className="relative my-7 flex items-center justify-center w-full min-h-[170px]">
          {/* Horizontal Flare beam */}
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#5ee7ff] to-transparent opacity-90 shadow-[0_0_20px_#5ee7ff]" />
          <div className="absolute inset-x-12 h-[12px] bg-gradient-to-r from-transparent via-[#38a9ff]/40 to-transparent blur-sm" />

          {/* Radial Particle/Cyan Field */}
          <div
            className="absolute w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(62, 198, 255, 0.38) 0%, rgba(30, 95, 230, 0.18) 45%, transparent 70%)',
              filter: 'blur(10px)',
            }}
          />

          {/* Diamond Layer 1 (Outer glow border) */}
          <div className="relative z-10 flex items-center justify-center w-28 h-28 rotate-45 rounded-lg border-2 border-[#5ee7ff]/90 bg-gradient-to-br from-[#0c2a52] via-[#051329] to-[#020b18] shadow-[0_0_35px_rgba(94,231,255,0.7),inset_0_0_20px_rgba(94,231,255,0.4)]">
            {/* Diamond Layer 2 (Inner ring) */}
            <div className="flex items-center justify-center w-20 h-20 border border-[#7fe3ff]/70 bg-gradient-to-br from-[#09356b] to-[#020d1c] shadow-[0_0_15px_rgba(127,227,255,0.4)]">
              {/* Un-rotated Center Content */}
              <div className="-rotate-45 flex flex-col items-center justify-center text-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#d8fdff] tracking-tight drop-shadow-[0_0_12px_#5ee7ff]">
                  5
                </span>
                <span className="text-[7px] font-bold uppercase tracking-[0.25em] text-[#7fe3ff] mt-0.5">
                  SVY
                </span>
              </div>
            </div>

            {/* Corner Decorative Dots */}
            <span className="absolute -top-1.5 -left-1.5 w-2 h-2 rotate-45 bg-[#8ef4ff] shadow-[0_0_6px_#8ef4ff]" />
            <span className="absolute -bottom-1.5 -right-1.5 w-2 h-2 rotate-45 bg-[#8ef4ff] shadow-[0_0_6px_#8ef4ff]" />
          </div>
        </div>

        {/* Message description */}
        <div className="max-w-lg mx-auto my-3 px-3">
          <p className="text-xs sm:text-sm font-light leading-relaxed text-[#c6e4f5] tracking-wide">
            Congratulations! You have created the <span className="font-semibold text-[#8ef4ff]">Surveyor 5</span> and your team has sent it to launch. Go to the firing room at the end of the corridor to supervise the launch!
          </p>
        </div>

        {/* Bottom Decorative Horizon Line with Diamond Pip */}
        <div className="relative w-full flex items-center justify-center my-4">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#b59556]/60 to-[#e2cb92]" />
          <div className="relative mx-3 flex items-center justify-center">
            <span className="w-3.5 h-3.5 rotate-45 border border-[#e8d5a3] bg-[#050c18] flex items-center justify-center shadow-[0_0_8px_rgba(232,213,163,0.5)]">
              <span className="w-1.5 h-1.5 rotate-45 bg-[#e8d5a3]" />
            </span>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#b59556]/60 to-[#e2cb92]" />
        </div>

        {/* Primary CTA Button: UNLOCK LAUNCH */}
        <div className="mt-4 w-full flex justify-center">
          <button
            type="button"
            autoFocus
            onClick={onUnlockLaunch}
            className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-sm border border-[#d6a95c] bg-gradient-to-b from-[#1b1916] via-[#100f0e] to-[#080706] text-[#e8c684] shadow-[0_0_24px_rgba(214,169,92,0.3)] transition-all duration-300 hover:border-[#f5d085] hover:text-[#fff0ca] hover:shadow-[0_0_36px_rgba(245,208,133,0.55)] hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d085]"
          >
            {/* Subtle inner border glow */}
            <span className="absolute inset-[1px] border border-[#d6a95c]/25 pointer-events-none" />

            <Rocket className="w-4 h-4 text-[#e8c684] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.28em]">
              Unlock Launch
            </span>
            <ChevronRight className="w-4 h-4 text-[#d6a95c] transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
