import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Radio, Loader2, Sparkles, ShieldAlert } from 'lucide-react';
import { LAUNCH_VIDEO } from '../../config/launchVideo.js';
import { useLaunchVideo } from '../../hooks/useLaunchVideo.js';

/**
 * LaunchCinematic
 * 
 * Part 1 Full-screen letterboxed cinematic overlay for Surveyor 5.
 * Plays 0:00 -> 1:11 (stops right before liftoff).
 * Skip-less, handles loading state ("Establishing link to Cape Kennedy..."),
 * automatically pauses at 1:11 and fades out smoothly.
 */
export default function LaunchCinematic({ isOpen, onComplete }) {
  const videoRef = useRef(null);
  const [isFading, setIsFading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handleSegmentEnd = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      onComplete?.();
    }, 700);
  }, [onComplete]);

  const {
    isLoading,
    isPlaying,
    currentTime,
    playSegment,
    error,
  } = useLaunchVideo({
    videoRef,
    src: LAUNCH_VIDEO.src,
    onSegmentEnd: handleSegmentEnd,
  });

  useEffect(() => {
    if (isOpen && !hasStarted) {
      setHasStarted(true);
      setIsFading(false);
      // Playback begins immediately from user's click handler
      playSegment('part1').catch((err) => {
        console.warn('Part 1 play error:', err);
      });
    }
  }, [isOpen, hasStarted, playSegment]);

  if (!isOpen) return null;

  const currentSec = Math.floor(currentTime);
  const remainingSec = Math.max(0, LAUNCH_VIDEO.part1.end - currentSec);
  const min = Math.floor(currentSec / 60);
  const sec = currentSec % 60;
  const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  const targetStr = '01:11';

  return (
    <div
      className={`fixed inset-0 z-[350] flex flex-col justify-between bg-black overflow-hidden select-none transition-opacity duration-700 ease-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-label="Surveyor 5 Pre-Launch Cinematic"
    >
      {/* Top Letterbox Bar */}
      <div className="relative z-20 w-full h-16 sm:h-20 bg-gradient-to-b from-[#020712] via-[#040d1e] to-transparent px-6 sm:px-12 flex items-center justify-between border-b border-[#00f0ff]/20">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00f0ff] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00f0ff]" />
          </div>
          <div>
            <h1 className="text-[10px] sm:text-xs font-black tracking-[0.28em] text-[#dcf9ff] uppercase">
              ARCHIVAL TRANSMISSION · CAPE KENNEDY PAD 36B
            </h1>
            <p className="text-[8px] sm:text-[9px] font-semibold tracking-[0.2em] text-[#5ee7ff]/75 uppercase">
              ATLAS-CENTAUR AC-13 · SURVEYOR 5 SPACECRAFT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div className="hidden sm:block">
            <span className="block text-[8px] font-bold tracking-[0.25em] text-[#69a7c7] uppercase">
              PART 1 · PRE-LAUNCH VERIFICATION
            </span>
            <span className="block font-mono text-xs font-bold text-[#8ef4ff]">
              T − 00:{String(remainingSec).padStart(2, '0')}
            </span>
          </div>
          <div className="px-2.5 py-1 rounded border border-[#00f0ff]/30 bg-[#061e33]/60 font-mono text-xs font-bold tracking-widest text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            REC ●
          </div>
        </div>
      </div>

      {/* Main Video Viewport (Centered 16:9 or fit) */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
        {/* Subtle Scan Lines */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, #00f0ff 2px, #00f0ff 3px)',
          }}
        />

        {/* Video Element */}
        <video
          ref={videoRef}
          src={LAUNCH_VIDEO.src}
          playsInline
          muted={false}
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src={LAUNCH_VIDEO.src} type={LAUNCH_VIDEO.type} />
        </video>

        {/* Loading State: Establishing link to Cape Kennedy... */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#010611]/85 backdrop-blur-sm gap-4">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-[#00f0ff] animate-spin" />
              <Radio className="w-4 h-4 text-[#8ef4ff] absolute animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.26em] text-[#cbf4ff] drop-shadow-[0_0_10px_#00f0ff]">
              Establishing link to Cape Kennedy...
            </p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5ee7ff]/70">
              Archival NASA / JPL 1967 Telemetry Stream
            </p>
          </div>
        )}

        {/* Error Fallback */}
        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#010611]/90 p-6 text-center gap-3">
            <ShieldAlert className="w-10 h-10 text-amber-400" />
            <p className="text-sm font-bold text-amber-200 uppercase tracking-widest">
              Telemetry feed standby
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              {error.message || 'Archival feed playback encountered an issue.'}
            </p>
            <button
              type="button"
              onClick={handleSegmentEnd}
              className="mt-2 px-5 py-2 rounded border border-[#00f0ff]/50 bg-[#07243e] text-xs font-bold text-[#8ef4ff] uppercase tracking-wider hover:bg-[#0c3861]"
            >
              Continue to Firing Room
            </button>
          </div>
        )}

        {/* Bottom Corner HUD Telemetry Overlays */}
        <div className="pointer-events-none absolute bottom-4 left-6 z-20 font-mono text-[9px] text-[#5ee7ff]/80 tracking-wider">
          <span>PAD 36B CAMERA · 24 FPS</span>
          <span className="mx-2">|</span>
          <span>SRGB HD ARCHIVE</span>
        </div>

        <div className="pointer-events-none absolute bottom-4 right-6 z-20 font-mono text-[10px] text-[#8ef4ff] font-bold tracking-widest bg-black/50 px-2 py-0.5 rounded border border-white/10">
          {timeStr} / {targetStr}
        </div>
      </div>

      {/* Bottom Letterbox Bar */}
      <div className="relative z-20 w-full h-16 sm:h-20 bg-gradient-to-t from-[#020712] via-[#040d1e] to-transparent px-6 sm:px-12 flex items-center justify-between border-t border-[#00f0ff]/20">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rotate-45 bg-[#00f0ff]" />
          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.24em] text-[#8ef4ff]">
            CAPE KENNEDY AIR FORCE STATION · ATLAS-CENTAUR PAD 36B
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.2em] text-[#69a7c7]">
            NOVAQUEST HISTORICAL SIMULATION · 8 SEPTEMBER 1967
          </span>
        </div>
      </div>
    </div>
  );
}
