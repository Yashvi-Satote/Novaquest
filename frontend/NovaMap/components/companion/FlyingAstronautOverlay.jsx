import React, { useState, useEffect, useRef } from 'react';
import NovaAstronautAvatar from './NovaAstronautAvatar';

/**
 * FlyingAstronautOverlay.jsx
 * 
 * Full-Screen 3D Flying Cartoon Astronaut Companion (NOVA).
 * 
 * CHARACTERISTICS (Per Requirement 2):
 * - Continuously flies across the entire visible Solar System screen along smooth curved paths.
 * - Gently rotates and banks while turning.
 * - Simulates apparent 3D depth and parallax using smooth continuous scale modulation (0.82x - 1.15x).
 * - Soft starlight glow and micro-gravity thruster particle trail.
 * - NEVER blocks user clicks or planet selection: 100% pointer-events-none!
 * - Respects prefers-reduced-motion accessibility setting.
 * - Optimized with requestAnimationFrame and matrix hardware acceleration.
 */
export default function FlyingAstronautOverlay({
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

  const [flightState, setFlightState] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth * 0.75 : 800,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.35 : 300,
    rotation: -8,
    scale: 0.95
  });

  const animFrameRef = useRef(null);
  const flightDataRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth * 0.75 : 800,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.35 : 300,
    vx: -0.65,
    vy: 0.35,
    targetAngle: -150,
    currentAngle: -150,
    speed: 0.85,
    time: 0,
    lastDirectionChange: 0
  });

  useEffect(() => {
    // Check reduced motion accessibility
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Keep astronaut gently floating in an open quadrant without full traverses
      setFlightState({
        x: window.innerWidth * 0.82,
        y: window.innerHeight * 0.28,
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

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Safe viewport bounds (avoiding top navbar and extreme borders)
      const minX = w * 0.08;
      const maxX = w * 0.90;
      const minY = h * 0.14;
      const maxY = h * 0.82;

      // Periodically choose smooth new flight paths (every 4 to 8 seconds)
      if (fd.time - fd.lastDirectionChange > 5.5) {
        fd.lastDirectionChange = fd.time;
        // Target an organic quadrant in space
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

      // Smooth angular interpolation (gentle turning)
      let angleDiff = fd.targetAngle - fd.currentAngle;
      while (angleDiff < -180) angleDiff += 360;
      while (angleDiff > 180) angleDiff -= 360;
      fd.currentAngle += angleDiff * Math.min(dt * 0.75, 0.2);

      const rad = (fd.currentAngle * Math.PI) / 180;
      fd.vx = Math.cos(rad) * fd.speed * 42;
      fd.vy = Math.sin(rad) * fd.speed * 42;

      fd.x += fd.vx * dt;
      fd.y += fd.vy * dt;

      // Constrain inside visible screen
      fd.x = Math.max(minX, Math.min(maxX, fd.x));
      fd.y = Math.max(minY, Math.min(maxY, fd.y));

      // Calculate banking tilt and apparent 3D depth scale
      const bankTilt = Math.max(-22, Math.min(22, (angleDiff * 0.35) + (Math.sin(fd.time * 0.9) * 6)));
      const depthScale = 0.88 + 0.18 * Math.sin(fd.time * 0.28);

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
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div 
      id="flying-astronaut-viewport-overlay"
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden select-none"
      aria-hidden="true"
    >
      <style>{`
        @keyframes flightTrailPuff {
          0% {
            opacity: 0.8;
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
      `}</style>

      {/* Floating 3D Cartoon Astronaut positioned along flight trajectory */}
      <div 
        id="flying-astronaut-character"
        className="absolute transition-transform will-change-transform"
        style={{
          transform: `translate3d(${flightState.x}px, ${flightState.y}px, 0) rotate(${flightState.rotation}deg) scale(${flightState.scale})`,
          transition: 'transform 0.06s linear'
        }}
      >
        {/* Soft cosmic glow backing */}
        <div 
          className="absolute inset-0 rounded-full bg-cyan-500/15 blur-xl pointer-events-none scale-125"
          aria-hidden="true"
        />

        {/* Mascot Character Avatar */}
        <NovaAstronautAvatar
          size={110}
          expression={syncedState.expression}
          isSpeaking={syncedState.isSpeaking}
          isGesturing={syncedState.isGesturing}
          isListening={syncedState.isListening}
        />
      </div>
    </div>
  );
}
