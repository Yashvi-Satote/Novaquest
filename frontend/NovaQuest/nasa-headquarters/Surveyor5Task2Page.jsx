import React from 'react';
import { ChevronRight, Rocket, ScanLine, X } from 'lucide-react';
import { gameAudio } from '../config/gameAudio';

const FRAME_CLIP =
  'polygon(0 52px, 52px 0, calc(50% - 168px) 0, calc(50% - 146px) 18px, calc(50% + 146px) 18px, calc(50% + 168px) 0, calc(100% - 52px) 0, 100% 52px, 100% calc(100% - 52px), calc(100% - 52px) 100%, calc(50% + 168px) 100%, calc(50% + 146px) calc(100% - 18px), calc(50% - 146px) calc(100% - 18px), calc(50% - 168px) 100%, 52px 100%, 0 calc(100% - 52px))';

/**
 * Surveyor5Task2Page
 *
 * TASK 2: WITNESS THE LAUNCH OF SURVEYOR 5 & SOLVE IN-FLIGHT ANOMALIES
 *
 * Clean briefing:
 * Launch operations are conducted directly from the 3D Firing Room.
 */
export default function Surveyor5Task2Page({
  isOpen,
  onClose,
  onTeleportToFiringRoom,
}) {
  const handleClose = () => {
    gameAudio.playClick();
    onClose?.();
  };

  const handleTeleportRoom = () => {
    gameAudio.playClick();
    onClose?.();
    onTeleportToFiringRoom?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[290] flex items-center justify-center overflow-hidden bg-[#01050f]/94 p-2 backdrop-blur-md sm:p-5 lg:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="surveyor5-task2-title"
    >
      {/* Deep-space backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(20, 85, 175, 0.35) 0%, rgba(3, 12, 30, 0.45) 45%, rgba(1, 4, 12, 0.96) 100%)',
        }}
      />

      <div className="relative flex h-full max-h-[580px] w-full max-w-[940px] animate-fade-in">
        {/* Outer neon frame with reference notch silhouette */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: FRAME_CLIP,
            background:
              'linear-gradient(135deg, #8ceaff 0%, #2f7bff 18%, #0b2e63 45%, #123f8a 72%, #5fc9ff 100%)',
            filter: 'drop-shadow(0 0 24px rgba(47, 123, 255, 0.45))',
          }}
        />
        <div
          className="absolute inset-[2px]"
          style={{
            clipPath: FRAME_CLIP,
            background:
              'radial-gradient(circle at 50% 0%, rgba(18, 57, 113, 0.92) 0%, rgba(3, 14, 31, 0.98) 52%, rgba(2, 8, 20, 1) 100%)',
          }}
        />

        {/* Blueprint grid + scan sweep */}
        <div
          className="pointer-events-none absolute inset-[2px] opacity-80"
          style={{
            clipPath: FRAME_CLIP,
            backgroundImage:
              'linear-gradient(rgba(94, 178, 255, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(94, 178, 255, 0.12) 1px, transparent 1px)',
            backgroundSize: '46px 46px',
          }}
        />
        <div className="pointer-events-none absolute inset-[2px] overflow-hidden" style={{ clipPath: FRAME_CLIP }}>
          <div className="animate-scan-sweep absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-transparent via-[#5ed7ff]/12 to-transparent" />
        </div>

        {/* Content container */}
        <div className="relative z-10 flex h-full min-h-0 w-full flex-col justify-between px-6 py-5 sm:px-10 sm:py-7 lg:px-14 lg:py-8">
          
          {/* Top Status Header */}
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#3b82f6]/25 pb-3">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] font-bold uppercase tracking-[0.3em] text-[#5fb9e0] sm:text-[9px]">
                <span className="inline-flex items-center gap-1.5 text-[#7fe3ff]">
                  <ScanLine className="h-3 w-3" aria-hidden="true" />
                  NovaQuest · Temporal Mission Archive
                </span>
                <span className="hidden h-px w-8 bg-[#3b82f6]/60 sm:block" aria-hidden="true" />
                <span>Level 01 · The Moon</span>
                <span className="hidden h-px w-6 bg-[#3b82f6]/40 sm:block" aria-hidden="true" />
                <span className="text-[#9ad8ef]">8 September 1967 · Cape Kennedy</span>
              </p>
              <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#4386b0]">
                Clearance: Flight Director · Launch Complex 36B
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-[#5ee7ff]/35 bg-[#06233f]/80 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.22em] text-[#8be9ff] sm:inline-flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#64e6ff] opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#64e6ff]" />
                </span>
                Live Flight Feed
              </span>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close task 2 page"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#5ee7ff]/35 bg-[#071b31]/80 text-[#9ddcf2] transition-colors hover:border-[#7fe3ff]/80 hover:bg-[#0b2b4d] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="my-auto space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.34em] text-[#62c8ef]">
                  Flight Operations Briefing
                </p>
                <h1
                  id="surveyor5-task2-title"
                  className="mt-0.5 flex items-center gap-3 font-semibold tracking-[0.22em] text-[#dffaff]"
                  style={{
                    fontSize: 'clamp(2.6rem, 6vw, 4.5rem)',
                    lineHeight: 0.9,
                    textShadow: '0 0 26px rgba(86, 209, 255, 0.4)',
                  }}
                >
                  TASK 2
                  <span className="mt-2 hidden h-px flex-1 bg-gradient-to-r from-[#7fe3ff]/70 to-transparent sm:block" />
                </h1>
              </div>
              <div className="hidden shrink-0 flex-col items-end gap-1 pb-1 sm:flex">
                <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#4f9ec2]">Flight Target</span>
                <span className="rounded border border-[#3b82f6]/35 bg-[#061a30]/80 px-2.5 py-1 text-[10px] font-bold tracking-[0.24em] text-[#93e6ff]">
                  SVY-05 / ATLAS-CENTAUR
                </span>
              </div>
            </div>

            {/* User requirement description box */}
            <div className="rounded-lg border border-[#3b82f6]/35 bg-[#031325]/85 px-5 py-4 shadow-[inset_0_0_30px_rgba(30,110,200,0.15)]">
              <p className="text-[14px] font-medium leading-relaxed text-[#d3edf9] sm:text-[15px]">
                witness the launch of surveyor 5 and solve any problems that come during the launch
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-[#3b82f6]/20 pt-2.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#6ecdf2]">
                <span className="flex items-center gap-1.5 text-[#5ee7ff]">
                  <Rocket className="h-3.5 w-3.5" />
                  Atlas-Centaur AC-13
                </span>
                <span>·</span>
                <span>Cape Kennedy Pad 36B</span>
                <span>·</span>
                <span className="text-[#ffd79a]">Target: Mare Tranquillitatis</span>
              </div>
            </div>

            {/* Launch Instructions */}
            <div className="rounded-lg border border-[#5ee7ff]/30 bg-[#031b36]/70 p-4">
              <p className="text-[12px] leading-relaxed text-[#bfe8ff]">
                All flight operations are conducted directly from the <strong className="text-[#5ee7ff]">3D Firing Room</strong>. Enter the firing room to supervise from the flight director console and initiate the launch sequence.
              </p>
            </div>
          </main>

          {/* Bottom Quick-Action Buttons */}
          <div className="grid gap-3 pt-3 sm:grid-cols-2">
            {onTeleportToFiringRoom && (
              <button
                type="button"
                onClick={handleTeleportRoom}
                className="group flex items-center justify-between rounded-lg border border-[#7fe3ff]/50 bg-gradient-to-r from-[#0a2f58] via-[#0d427d] to-[#0a2f58] px-5 py-3.5 text-left shadow-[0_0_24px_rgba(61,107,255,0.3)] transition-all hover:border-[#a8f0ff] hover:shadow-[0_0_32px_rgba(94,231,255,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
              >
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                    Enter Launch Room (3D)
                  </span>
                  <span className="mt-0.5 block text-[8.5px] font-semibold uppercase tracking-[0.18em] text-[#9fe0f5]">
                    Teleport to Firing Room & start launch sequence
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-[#9df0ff] transition-transform group-hover:translate-x-1" />
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-[#9cd8f2] transition-colors hover:border-white/20 hover:text-white"
            >
              Return to NASA Headquarters
            </button>
          </div>

          {/* Footer Bar */}
          <footer className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-x-5 gap-y-1 border-t border-[#3b82f6]/20 pt-2 text-[8px] font-bold uppercase tracking-[0.22em] text-[#3d7595]">
            <span className="inline-flex items-center gap-2">
              <ScanLine className="h-3 w-3 text-[#5ee7ff]" />
              Surveyor 5 Flight Operations · Cape Kennedy to Mare Tranquillitatis
            </span>
            <span className="hidden items-center gap-2 sm:inline-flex text-[#5ee7ff]">
              NASA Headquarters Firing Room & Mission Control Live Uplink
            </span>
          </footer>

        </div>
      </div>
    </div>
  );
}
