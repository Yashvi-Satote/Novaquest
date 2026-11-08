import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  X,
  Sparkles
} from 'lucide-react';
import NovaAstronautAvatar from './NovaAstronautAvatar';

/**
 * FlyingAstronautOverlay.jsx
 * 
 * THE SOLE ASTRONAUT COMPANION INSTANCE (Option A: Friendly Explorer).
 * 
 * STRICT REQUIREMENTS:
 * 1. ONLY ONE astronaut instance on screen across the entire application.
 * 2. Continuously floats and flies around the visible Solar System on smooth curved paths.
 * 3. Apparent 3D depth and banking rotation while turning.
 * 4. Background overlay is pointer-events-none; only the astronaut itself is interactive.
 * 5. Clicking the astronaut reveals the contextual 4-option menu beside it:
 *    - 1. Chat (Opens two-way voice and text interface)
 *    - 2. Mute / Unmute (Controls NOVA voice narration)
 *    - 3. Restart (Resets position and animation)
 *    - 4. Close / Hide (Temporarily hides the astronaut)
 * 6. Clicking outside closes the menu and resumes flight.
 */
export default function FlyingAstronautOverlay({
  isVisible = true,
  onClose,
  onOpenChat,
  isMuted = false,
  onToggleMute,
  expression = 'happy',
  isSpeaking = false,
  isGesturing = false,
  isListening = false
}) {
  const [syncedState, setSyncedState] = useState({
    expression,
    isSpeaking,
    isGesturing,
    isListening
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const initialFlight = () => ({
    x: typeof window !== 'undefined' ? window.innerWidth * 0.72 : 800,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.28 : 280,
    rotation: -6,
    scale: 0.95
  });

  const [flightState, setFlightState] = useState(initialFlight);

  const animFrameRef = useRef(null);
  const menuContainerRef = useRef(null);
  const flightDataRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth * 0.72 : 800,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.28 : 280,
    vx: -0.65,
    vy: 0.35,
    targetAngle: -150,
    currentAngle: -150,
    speed: 0.85,
    time: 0,
    lastDirectionChange: 0
  });

  // Sync state with props and global companion state events
  useEffect(() => {
    setSyncedState({ expression, isSpeaking, isGesturing, isListening });
  }, [expression, isSpeaking, isGesturing, isListening]);

  useEffect(() => {
    const handleCompanionEvent = (e) => {
      if (e.detail) {
        setSyncedState(prev => ({
          ...prev,
          ...e.detail
        }));
      }
    };
    window.addEventListener('nova-companion-state', handleCompanionEvent);
    return () => window.removeEventListener('nova-companion-state', handleCompanionEvent);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Restart animation and position reset handler
  const handleRestart = (e) => {
    if (e) e.stopPropagation();
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    const freshX = w * 0.75;
    const freshY = h * 0.26;

    flightDataRef.current = {
      x: freshX,
      y: freshY,
      vx: -0.65,
      vy: 0.35,
      targetAngle: -145,
      currentAngle: -145,
      speed: 0.85,
      time: 0,
      lastDirectionChange: 0
    };

    setFlightState({
      x: freshX,
      y: freshY,
      rotation: -6,
      scale: 1.0
    });

    setIsMenuOpen(false);
  };

  // Continuous flight animation loop
  useEffect(() => {
    if (!isVisible) return;

    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setFlightState({
        x: window.innerWidth * 0.80,
        y: window.innerHeight * 0.24,
        rotation: 0,
        scale: 1
      });
      return;
    }

    let isRunning = true;
    let lastTimestamp = performance.now();

    const updateFlight = (now) => {
      if (!isRunning) return;

      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      const fd = flightDataRef.current;
      fd.time += dt;

      // When contextual menu is open, gently hover in place
      if (isMenuOpen) {
        const hoverBob = Math.sin(fd.time * 2.2) * 3;
        setFlightState(prev => ({
          ...prev,
          y: fd.y + hoverBob,
          rotation: Math.sin(fd.time * 1.5) * 2
        }));
        animFrameRef.current = requestAnimationFrame(updateFlight);
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Safe visible screen boundaries (avoiding edge clipping and top navbar)
      const minX = w * 0.10;
      const maxX = w * 0.88;
      const minY = h * 0.15;
      const maxY = h * 0.80;

      // Periodically choose smooth new flight paths
      if (fd.time - fd.lastDirectionChange > 5.5) {
        fd.lastDirectionChange = fd.time;
        const targetX = minX + Math.random() * (maxX - minX);
        const targetY = minY + Math.random() * (maxY - minY);
        const dx = targetX - fd.x;
        const dy = targetY - fd.y;
        fd.targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      }

      // Soft boundary repulsion if drifting near screen edges
      const margin = 120;
      let steerX = 0;
      let steerY = 0;

      if (fd.x < minX + margin) steerX += (minX + margin - fd.x) * 0.02;
      if (fd.x > maxX - margin) steerX -= (fd.x - (maxX - margin)) * 0.02;
      if (fd.y < minY + margin) steerY += (minY + margin - fd.y) * 0.02;
      if (fd.y > maxY - margin) steerY -= (fd.y - (maxY - margin)) * 0.02;

      if (steerX !== 0 || steerY !== 0) {
        fd.targetAngle = (Math.atan2(fd.vy + steerY, fd.vx + steerX) * 180) / Math.PI;
      }

      // Smooth angular turning
      let angleDiff = fd.targetAngle - fd.currentAngle;
      while (angleDiff < -180) angleDiff += 360;
      while (angleDiff > 180) angleDiff -= 360;
      fd.currentAngle += angleDiff * Math.min(dt * 0.75, 0.2);

      const rad = (fd.currentAngle * Math.PI) / 180;
      fd.vx = Math.cos(rad) * fd.speed * 42;
      fd.vy = Math.sin(rad) * fd.speed * 42;

      fd.x += fd.vx * dt;
      fd.y += fd.vy * dt;

      // Keep within visible bounds
      fd.x = Math.max(minX, Math.min(maxX, fd.x));
      fd.y = Math.max(minY, Math.min(maxY, fd.y));

      // Calculate banking tilt and apparent 3D depth scale
      const bankTilt = Math.max(-20, Math.min(20, (angleDiff * 0.32) + (Math.sin(fd.time * 0.9) * 5)));
      const depthScale = 0.88 + 0.16 * Math.sin(fd.time * 0.26);

      setFlightState({
        x: fd.x,
        y: fd.y,
        rotation: bankTilt,
        scale: depthScale
      });

      animFrameRef.current = requestAnimationFrame(updateFlight);
    };

    animFrameRef.current = requestAnimationFrame(updateFlight);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isVisible, isMenuOpen]);

  if (!isVisible) return null;

  return (
    <div 
      id="flying-astronaut-viewport-overlay"
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none"
      aria-hidden="false"
    >
      <style>{`
        @keyframes flightTrailPuff {
          0% {
            opacity: 0.75;
            transform: scale(0.6) translateY(0);
          }
          100% {
            opacity: 0;
            transform: scale(1.6) translateY(24px);
          }
        }
        .nova-flight-trail-dot {
          animation: flightTrailPuff 1.2s ease-out infinite;
        }
        @keyframes menuPopIn {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(6px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .astronaut-menu-pop {
          animation: menuPopIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Floating 3D Cartoon Astronaut Container */}
      <div 
        id="flying-astronaut-character"
        ref={menuContainerRef}
        className="absolute transition-transform will-change-transform pointer-events-auto"
        style={{
          transform: `translate3d(${flightState.x}px, ${flightState.y}px, 0) rotate(${flightState.rotation}deg) scale(${flightState.scale})`,
          transition: 'transform 0.05s linear'
        }}
      >
        {/* Soft cosmic glow backing */}
        <div 
          className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl pointer-events-none scale-125"
          aria-hidden="true"
        />

        {/* Mascot Character Avatar (Option A: Friendly Explorer) */}
        <div 
          id="flying-astronaut-avatar-btn"
          onClick={() => setIsMenuOpen(prev => !prev)}
          className="cursor-pointer group focus:outline-none transition-transform hover:scale-105 active:scale-95"
          title="Click to interact with NOVA"
          role="button"
          tabIndex={0}
          aria-haspopup="true"
          aria-expanded={isMenuOpen}
        >
          <NovaAstronautAvatar
            size={115}
            expression={syncedState.expression}
            isSpeaking={syncedState.isSpeaking}
            isGesturing={syncedState.isGesturing}
            isListening={syncedState.isListening}
          />
        </div>

        {/* =========================================================================
            CHARACTER CONTEXTUAL CLICK MENU (Requirement 3)
            Options: 1. Chat, 2. Mute/Unmute, 3. Restart, 4. Close/Hide
            ========================================================================= */}
        {isMenuOpen && (
          <div 
            id="astronaut-context-menu"
            className="astronaut-menu-pop absolute top-4 left-[105%] ml-2 z-50 w-44 bg-[#09071c]/95 backdrop-blur-2xl border border-cyan-400/40 rounded-2xl shadow-2xl shadow-cyan-950/90 text-white font-sans p-1.5 flex flex-col gap-1 select-none pointer-events-auto"
            role="menu"
            aria-label="NOVA Character Options"
          >
            {/* Menu Header with pulsing indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-cyan-500/20 text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>NOVA Guide</span>
            </div>

            {/* Option 1: Chat */}
            <button
              type="button"
              id="astronaut-menu-chat-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                if (onOpenChat) onOpenChat();
              }}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs text-left font-medium text-slate-200 hover:text-white hover:bg-gradient-to-r hover:from-cyan-900/60 hover:to-blue-900/40 transition-all cursor-pointer group"
              role="menuitem"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="font-semibold text-white">Chat</span>
                <span className="text-[10px] text-slate-400">Voice & written guide</span>
              </div>
            </button>

            {/* Option 2: Mute / Unmute */}
            <button
              type="button"
              id="astronaut-menu-mute-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleMute) onToggleMute();
              }}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs text-left font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-all cursor-pointer group"
              role="menuitem"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Unmute</span>
                    <span className="text-[10px] text-slate-400">Enable voice speech</span>
                  </div>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Mute</span>
                    <span className="text-[10px] text-slate-400">Silence voice speech</span>
                  </div>
                </>
              )}
            </button>

            {/* Option 3: Restart */}
            <button
              type="button"
              id="astronaut-menu-restart-btn"
              onClick={handleRestart}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs text-left font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-all cursor-pointer group"
              role="menuitem"
            >
              <RotateCcw className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="font-semibold text-white">Restart</span>
                <span className="text-[10px] text-slate-400">Reset flight position</span>
              </div>
            </button>

            {/* Option 4: Close / Hide */}
            <button
              type="button"
              id="astronaut-menu-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                if (onClose) onClose();
              }}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-xs text-left font-medium text-rose-300 hover:text-white hover:bg-rose-950/50 transition-all cursor-pointer group border-t border-slate-800/80 mt-0.5"
              role="menuitem"
            >
              <X className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="font-semibold text-rose-200">Close / Hide</span>
                <span className="text-[10px] text-rose-300/70">Temporarily hide</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
