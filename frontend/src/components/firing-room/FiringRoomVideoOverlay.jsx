import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import { LAUNCH_VIDEO } from '../../config/launchVideo.js';

/**
 * FiringRoomVideoOverlay
 *
 * Full-screen HTML <video> overlay that covers the entire viewport during
 * the launch sequence (Part 2: 1:11 → HELIUM_T, Part 3: HELIUM_T → end).
 *
 * Lives on top of the 3D scene so it's always visible. The video is paused
 * at HELIUM_T when the emergency is active and resumed when Task 3 is solved.
 *
 * Exposed via ref:
 *   play(partName)   – seeks to segment start and plays
 *   pause()          – pauses on current frame
 *   resume()         – resumes from current frame to end
 */
const FiringRoomVideoOverlay = forwardRef(function FiringRoomVideoOverlay(
  { isEmergency, onEmergencyAtHeliumT, onVideoEnd },
  ref,
) {
  const videoRef = useRef(null);
  const watcherRef = useRef(null);
  const targetEndRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const emergencyRef = useRef(isEmergency);

  useEffect(() => {
    emergencyRef.current = isEmergency;
  }, [isEmergency]);

  // Cancel the precision frame watcher
  const stopWatcher = useCallback(() => {
    if (watcherRef.current) {
      cancelAnimationFrame(watcherRef.current);
      watcherRef.current = null;
    }
  }, []);

  // Frame-accurate pause check
  const watchFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const dur = video.duration || 105.72;
    const earlyStop = Math.max(0, dur - 3);
    const target = targetEndRef.current ?? earlyStop;
    if (target !== null && video.currentTime >= target - 0.05) {
      video.pause();
      try { video.currentTime = target; } catch (_) {}
      stopWatcher();
      if (targetEndRef.current === null || target >= earlyStop - 0.1) {
        setVisible(false);
        onVideoEnd?.();
      } else {
        onEmergencyAtHeliumT?.();
      }
      return;
    }
    watcherRef.current = requestAnimationFrame(watchFrame);
  }, [stopWatcher, onEmergencyAtHeliumT, onVideoEnd]);

  const play = useCallback(async (partName) => {
    const video = videoRef.current;
    if (!video) return;

    // Enforce audio mute when entering firing room / launch overlay
    video.muted = true;
    video.volume = 0;

    const segment = LAUNCH_VIDEO[partName];
    if (!segment) return;

    setVisible(true);
    setLoading(true);
    stopWatcher();

    // Seek to segment start
    video.currentTime = segment.start;
    targetEndRef.current = typeof segment.end === 'number' ? segment.end : null;

    try {
      await video.play();
      setLoading(false);
      watcherRef.current = requestAnimationFrame(watchFrame);
    } catch (err) {
      console.warn('[FiringRoomVideoOverlay] play failed:', err);
      setLoading(false);
    }
  }, [stopWatcher, watchFrame]);

  const pause = useCallback(() => {
    stopWatcher();
    videoRef.current?.pause();
  }, [stopWatcher]);

  const resume = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    // Enforce audio mute when resuming in firing room
    video.muted = true;
    video.volume = 0;

    // Part 3: stops 3 seconds before end of video
    const dur = video.duration || 105.72;
    targetEndRef.current = Math.max(0, dur - 3);
    try {
      await video.play();
      watcherRef.current = requestAnimationFrame(watchFrame);
    } catch (err) {
      console.warn('[FiringRoomVideoOverlay] resume failed:', err);
    }
  }, [watchFrame]);

  const hide = useCallback(() => {
    stopWatcher();
    videoRef.current?.pause();
    setVisible(false);
  }, [stopWatcher]);

  useImperativeHandle(ref, () => ({ play, pause, resume, hide }), [play, pause, resume, hide]);

  // Handle natural video end (Part 3)
  const handleEnded = useCallback(() => {
    stopWatcher();
    setVisible(false);
    onVideoEnd?.();
  }, [stopWatcher, onVideoEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatcher();
      const v = videoRef.current;
      if (v) {
        v.pause();
        v.removeAttribute('src');
        v.load();
      }
    };
  }, [stopWatcher]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[310] bg-black flex items-center justify-center overflow-hidden"
      aria-label="Launch telemetry feed"
    >
      {/* Scan-line overlay for CRT effect */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.08]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, #00f0ff 2px, #00f0ff 3px)',
        }}
      />

      {/* Top HUD bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 bg-gradient-to-b from-black/80 to-transparent px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00f0ff] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00f0ff]" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8ef4ff]">
            LIVE · CAPE KENNEDY PAD 36B · ATLAS-CENTAUR AC-13
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isEmergency && (
            <span className="animate-pulse rounded border border-[#ff3b4e] bg-[#ff3b4e]/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.24em] text-[#ff8080]">
              ⚠ HELIUM ANOMALY — MISSION HOLD
            </span>
          )}
          <span className="rounded border border-[#00f0ff]/30 bg-black/50 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-[#00f0ff]">
            REC ●
          </span>
        </div>
      </div>

      {/* The video — fills the entire screen */}
      <video
        ref={videoRef}
        playsInline
        muted={true}
        preload="auto"
        crossOrigin="anonymous"
        onEnded={handleEnded}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        className="absolute inset-0 h-full w-full object-contain"
      >
        <source src={LAUNCH_VIDEO.src} type={LAUNCH_VIDEO.type} />
      </video>

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border border-[#00f0ff]/30 border-t-[#00f0ff]" />
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#8ef4ff]">
            Establishing link to Cape Kennedy...
          </p>
        </div>
      )}

      {/* Emergency red vignette overlay */}
      {isEmergency && (
        <div
          className="pointer-events-none absolute inset-0 z-20 animate-pulse"
          style={{ boxShadow: 'inset 0 0 80px 20px rgba(255,20,40,0.55)' }}
        />
      )}

      {/* Bottom telemetry bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent px-6 py-3">
        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[#5ee7ff]/70">
          SURVEYOR 5 · FLIGHT TELEMETRY · SEPTEMBER 1967
        </span>
        <span className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[#5ee7ff]/70">
          NOVAQUEST HISTORICAL SIMULATION
        </span>
      </div>
    </div>
  );
});

export default FiringRoomVideoOverlay;
