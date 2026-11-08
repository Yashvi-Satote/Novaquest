import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FastForward, Sparkles, Clock } from 'lucide-react';
import { createAstronautCharacter } from './three/AstronautCharacterModel';
import { createTimeTravelTunnel } from './three/TimeTravelWarpTunnel';
import { gameAudio } from '../../config/gameAudio';

/**
 * TimeTravelCinematic.jsx
 * 
 * Scene 3: Time Travel Warp Tunnel (0:45 - 1:00)
 * - Swirling chronological vortex & glowing energy rings.
 * - Floating astronaut hero warping through space-time in microgravity.
 * - Historical milestone gates flying past:
 *   1969: Apollo 11
 *   1968: Apollo 8
 *   1967: Surveyor 5 Mission Control
 * - Seamless warp explosion into 1967 NASA Headquarters.
 */
export default function TimeTravelCinematic({ onComplete, onSkip }) {
  const mountRef = useRef(null);
  const [currentMilestone, setCurrentMilestone] = useState('1969 — Apollo 11');
  const [warpFlash, setWarpFlash] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050212);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 500);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // --- Time Tunnel & Particle Vortex ---
    const { root: tunnelRoot, update: updateTunnel } = createTimeTravelTunnel();
    scene.add(tunnelRoot);

    // Lighting (Cyan/Purple/Gold dynamic chrono lights)
    const chronoLight1 = new THREE.PointLight(0x38bdf8, 4.0, 30);
    chronoLight1.position.set(0, 0, 5);
    scene.add(chronoLight1);

    const chronoLight2 = new THREE.PointLight(0xf59e0b, 3.5, 30);
    chronoLight2.position.set(0, 0, -10);
    scene.add(chronoLight2);

    // --- Floating Astronaut Hero (Leo - Matching Reference Character) ---
    const astronaut = createAstronautCharacter({ scale: 0.95 });
    astronaut.position.set(0, -0.4, 3.5);
    scene.add(astronaut);
    astronaut.userData.anim.state = 'float';

    // Play warp sound effect
    gameAudio.playTimeTravel();

    let startTime = performance.now();
    let prevTime = startTime;

    // Timeline of milestone years
    const interval = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed < 3.5) {
        setCurrentMilestone('1969 — Apollo 11 Moon Landing');
      } else if (elapsed < 7.0) {
        setCurrentMilestone('1968 — Apollo 8 Lunar Orbit');
      } else if (elapsed < 11.0) {
        setCurrentMilestone('1967 — NASA Surveyor 5 Mission Control');
      } else if (elapsed >= 11.5 && !warpFlash) {
        setWarpFlash(true);
      }

      if (elapsed >= 13.0) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 100);

    let animFrameId;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - prevTime) / 1000, 0.1);
      const elapsed = (now - startTime) / 1000;
      prevTime = now;

      // Accelerating tunnel speed
      const speedMultiplier = 1.0 + elapsed * 0.25;
      updateTunnel(delta, elapsed, speedMultiplier);

      // Astronaut microgravity floating & gentle roll
      astronaut.rotation.y = Math.sin(elapsed * 1.5) * 0.4;
      astronaut.rotation.z = Math.sin(elapsed * 1.0) * 0.25;
      astronaut.userData.anim.update(delta, elapsed);

      // Camera dynamic roll through the vortex
      camera.rotation.z = Math.sin(elapsed * 0.8) * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950 font-sans">
      {/* 3D Viewport */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Banner & Skip Cinematic */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-400/50 shadow-lg pointer-events-auto">
          <Clock className="w-5 h-5 text-amber-400 animate-spin" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Act 1 • Scene 3</span>
            <h2 className="text-sm sm:text-base font-extrabold text-white">Chrono-Vortex • Warping into 1967</h2>
          </div>
        </div>

        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-slate-300 hover:text-white rounded-2xl border border-slate-700 hover:border-sky-400 transition-all pointer-events-auto text-xs sm:text-sm font-semibold shadow-md active:scale-95"
          >
            <span>Skip Cinematic</span>
            <FastForward className="w-4 h-4 text-sky-400" />
          </button>
        )}
      </div>

      {/* Center Chrono Milestone Marker */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
        <div className="px-6 py-2.5 rounded-full bg-slate-950/80 border-2 border-amber-400/70 backdrop-blur-xl shadow-[0_0_35px_rgba(245,158,11,0.5)]">
          <span className="text-base sm:text-lg font-black tracking-wider text-amber-300 animate-pulse">
            {currentMilestone}
          </span>
        </div>
      </div>

      {/* White Flash Warp into 1967 */}
      {warpFlash && (
        <div className="absolute inset-0 bg-white z-50 animate-fade-in pointer-events-none" />
      )}
    </div>
  );
}

