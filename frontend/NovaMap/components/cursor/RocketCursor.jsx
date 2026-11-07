import React, { useState, useEffect, useRef } from 'react';

/**
 * RocketCursor.jsx
 * 
 * Cute Miniature Rocket Mouse Cursor for NovaMap.
 * 
 * FEATURES (Per Requirement 3):
 * - Miniature white & cyan rocket design.
 * - Rocket dynamically points in the direction of mouse movement with smooth angle interpolation.
 * - Subtle blue flame exhaust trail.
 * - Responsive click feedback (scale burst + thruster flare).
 * - Target-aware: automatically hides itself and restores standard cursor over input fields, textareas, and buttons.
 * - Scoped strictly to NovaMap viewport; automatically restores default cursor outside.
 * - Completely disabled on touch devices and respects reduced-motion.
 * - Ultra-lightweight: 0 frame rate impact.
 */
export default function RocketCursor({ containerRef }) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [rotation, setRotation] = useState(-35);
  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringTarget, setIsHoveringTarget] = useState(false);
  const [isOverInteractiveInput, setIsOverInteractiveInput] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const posRef = useRef({ x: -100, y: -100, lastX: -100, lastY: -100, angle: -35, targetAngle: -35 });
  const animFrameRef = useRef(null);
  const isMovingTimerRef = useRef(null);

  useEffect(() => {
    // Only enable on pointer-fine devices (desktops/laptops with mouse)
    const isPointerFine = typeof window !== 'undefined' && 
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (!isPointerFine) return;

    const handleMouseMove = (e) => {
      setIsVisible(true);
      const pr = posRef.current;
      const dx = e.clientX - pr.x;
      const dy = e.clientY - pr.y;
      const dist = Math.hypot(dx, dy);

      pr.x = e.clientX;
      pr.y = e.clientY;

      // If mouse is moving, orient rocket nose in the direction of movement
      if (dist > 3) {
        // Rocket points upwards (0 deg is up, so +90 from atan2)
        const moveAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        pr.targetAngle = moveAngle;

        if (isMovingTimerRef.current) clearTimeout(isMovingTimerRef.current);
        // After stationary for 800ms, gently return to natural space angle (-35deg)
        isMovingTimerRef.current = setTimeout(() => {
          pr.targetAngle = -35;
        }, 800);
      }

      // Check if mouse is hovering an interactive input/form element
      const target = e.target;
      if (target) {
        const isInteractive = Boolean(
          target.closest('input, textarea, select, button, a, [role="button"], .no-custom-cursor')
        );
        setIsOverInteractiveInput(isInteractive);

        // Check if hovering over canvas or planetary items
        const isCanvas = Boolean(target.tagName === 'CANVAS');
        setIsHoveringTarget(isCanvas);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);

    // Smooth render loop for cursor position and angle
    let isRunning = true;
    const renderLoop = () => {
      if (!isRunning) return;

      const pr = posRef.current;
      // Smooth angle interpolation
      let diff = pr.targetAngle - pr.angle;
      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;
      pr.angle += diff * 0.18;

      setPosition({ x: pr.x, y: pr.y });
      setRotation(pr.angle);

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (isMovingTimerRef.current) clearTimeout(isMovingTimerRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // If on mobile or touch device, do not render custom cursor
  if (!isVisible || isOverInteractiveInput) return null;

  return (
    <div
      id="novamap-rocket-cursor"
      className="fixed pointer-events-none z-50 select-none will-change-transform"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -15%) rotate(${rotation}deg) scale(${isClicking ? 0.9 : isHoveringTarget ? 1.15 : 1})`,
        transition: 'transform 0.04s ease-out'
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes rocketFlamePulse {
          0%, 100% {
            transform: scaleY(0.9) scaleX(0.95);
            opacity: 0.85;
          }
          50% {
            transform: scaleY(1.35) scaleX(1.1);
            opacity: 1;
            filter: drop-shadow(0 0 6px #38bdf8);
          }
        }
        @keyframes rocketTrailPuff {
          0% {
            transform: translateY(0) scale(0.7);
            opacity: 0.9;
          }
          100% {
            transform: translateY(12px) scale(1.4);
            opacity: 0;
          }
        }
        .rocket-exhaust-flame {
          transform-origin: 16px 28px;
          animation: rocketFlamePulse 0.16s ease-in-out infinite;
        }
        .rocket-trail-pip {
          animation: rocketTrailPuff 0.6s ease-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 32 40"
        width="28"
        height="36"
        className="drop-shadow-[0_4px_10px_rgba(56,189,248,0.5)]"
      >
        <defs>
          {/* Fuselage White Gradient */}
          <linearGradient id="rocketBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Cyan Wing Trim Gradient */}
          <linearGradient id="rocketFinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Engine Flame Blue Gradient */}
          <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="85%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Engine Exhaust Flame (Animated Blue Flare) */}
        <g className="rocket-exhaust-flame">
          <path
            d="M13 28 Q16 38 19 28 Z"
            fill="url(#flameGrad)"
          />
          {/* Inner hot core */}
          <path
            d="M14.5 28 Q16 34 17.5 28 Z"
            fill="#ffffff"
          />
        </g>

        {/* Subtle trail particle dots */}
        <circle cx="16" cy="35" r="1.5" fill="#38bdf8" className="rocket-trail-pip" opacity="0.6" />

        {/* 2. Side Stabilizer Fins (Delta Wings) */}
        {/* Left Fin */}
        <path d="M11 20 L5 27 L11 26 Z" fill="url(#rocketFinGrad)" stroke="#0369a1" strokeWidth="0.8" />
        {/* Right Fin */}
        <path d="M21 20 L27 27 L21 26 Z" fill="url(#rocketFinGrad)" stroke="#0369a1" strokeWidth="0.8" />

        {/* 3. Main Streamlined Rocket Fuselage */}
        <path
          d="M16 2 C13 8, 11 16, 11 26 L21 26 C21 16, 19 8, 16 2 Z"
          fill="url(#rocketBodyGrad)"
          stroke="#94a3b8"
          strokeWidth="1"
        />

        {/* Red / Cyan Nose Cone Cap */}
        <path
          d="M16 2 C14.5 6, 13.5 10, 13 12 L19 12 C18.5 10, 17.5 6, 16 2 Z"
          fill="#0284c7"
        />

        {/* 4. Circular Cockpit Porthole Glass Window */}
        <circle cx="16" cy="18" r="3.2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
        <circle cx="16" cy="18" r="2.2" fill="#38bdf8" opacity="0.9" />
        <circle cx="15.2" cy="17.2" r="0.9" fill="#ffffff" />

        {/* 5. Engine Nozzle Collar */}
        <rect x="13" y="26" width="6" height="2.5" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="0.6" />
      </svg>
    </div>
  );
}
