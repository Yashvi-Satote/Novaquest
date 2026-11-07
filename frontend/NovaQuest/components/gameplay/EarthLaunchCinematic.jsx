import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rocket, Volume2, VolumeX, Sparkles, FastForward } from 'lucide-react';
import { createAstronautCharacter } from './three/AstronautCharacterModel';
import { createLaunchpadComplex, createRocketVehicle, createLaunchSmokeSystem } from './three/RocketLaunchpadModel';
import { gameAudio } from '../../config/gameAudio';

/**
 * EarthLaunchCinematic.jsx
 * 
 * Scene 1: Earth and Rocket Launch (0:00 - 0:20)
 * - 3D Rotating Earth with clouds & space background.
 * - Launchpad complex with red gantry tower & multi-stage rocket.
 * - Astronaut Leo (cute cyan-blue hero in bubble helmet) walking on bridge to enter spacecraft.
 * - Hatch closing with hydraulic sound.
 * - Audio countdown (3... 2... 1... Ignition... Liftoff!).
 * - Volumetric fire & launch smoke particle simulation.
 * - Camera tracking rocket into upper atmosphere & outer space with Moon in view.
 */
export default function EarthLaunchCinematic({ onComplete, onSkip }) {
  const mountRef = useRef(null);
  const [subPhase, setSubPhase] = useState('boarding'); // 'boarding' | 'countdown' | 'launch' | 'space'
  const [countdownNum, setCountdownNum] = useState(3);
  const [statusMessage, setStatusMessage] = useState('Astronaut Leo boarding the launch vehicle...');

  const subPhaseRef = useRef('boarding');
  subPhaseRef.current = subPhase;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.008);

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    camera.position.set(-2, 18, 12);
    camera.lookAt(-1, 16.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // --- Starry Deep Space & Distant Earth ---
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 600;
      starPos[i + 1] = Math.random() * 300 + 50;
      starPos[i + 2] = (Math.random() - 0.5) * 600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.8 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Distant 3D Moon
    const texLoader = new THREE.TextureLoader();
    const moonTex = texLoader.load('/textures/planets/moon.jpg');
    const moonGeo = new THREE.SphereGeometry(6, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.9 });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(65, 120, -140);
    scene.add(moonMesh);

    // Distant Earth for Space Orbit phase
    const earthTex = texLoader.load('/textures/planets/earth_day.jpg');
    const earthGeo = new THREE.SphereGeometry(32, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({ map: earthTex, roughness: 0.7, metalness: 0.1 });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.set(-30, -50, -80);
    earthMesh.visible = false;
    scene.add(earthMesh);

    // Atmospheric Ground & Sky Dome
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    sunLight.position.set(20, 40, 25);
    scene.add(sunLight);

    // --- Models ---
    const { root: launchpadRoot, bridgeGroup } = createLaunchpadComplex();
    scene.add(launchpadRoot);

    const { root: rocketRoot, hatchPivot, flameGroup, exhaustLight } = createRocketVehicle();
    rocketRoot.position.set(0, 0, 0);
    scene.add(rocketRoot);

    const { particles: smokeParticles, update: updateSmoke } = createLaunchSmokeSystem(400);
    scene.add(smokeParticles);

    // Astronaut Hero (Leo - Matching Reference Character)
    const astronaut = createAstronautCharacter({ scale: 0.85 });
    astronaut.position.set(-3.2, 15.6, 0);
    astronaut.rotation.y = Math.PI / 2; // Facing towards rocket hatch
    scene.add(astronaut);
    astronaut.userData.anim.state = 'walk';

    // --- Animation Timeline Logic ---
    let startTime = performance.now();
    let prevTime = startTime;
    let rocketY = 0;
    let rocketVelocity = 0;
    let hatchAngle = Math.PI / 2;
    hatchPivot.rotation.y = hatchAngle; // open initially

    let countdownTriggered = false;
    let launchTriggered = false;
    let spaceTriggered = false;

    // Sequence Timers
    // 0s-5s: Astronaut walks towards hatch, steps inside
    // 5s: Hatch closes, countdown begins
    // 8s: Ignition & smoke billowing
    // 9s: Liftoff! Rocket ascends into the sky
    // 16s: Space orbit, Moon visible, transition

    const intervalId = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;

      if (elapsed > 4.5 && !countdownTriggered) {
        countdownTriggered = true;
        setSubPhase('countdown');
        setStatusMessage('Hatch sealed. Beginning launch countdown...');
        astronaut.visible = false;
        gameAudio.playHatchClose();
      }

      if (countdownTriggered && !launchTriggered) {
        const cdRemaining = Math.max(0, Math.ceil(8 - elapsed));
        setCountdownNum(cdRemaining);
        if (cdRemaining > 0 && cdRemaining <= 3) {
          gameAudio.playCountdownBeep(cdRemaining === 1);
        }
      }

      if (elapsed >= 8.2 && !launchTriggered) {
        launchTriggered = true;
        setSubPhase('launch');
        setStatusMessage('Main engines ignite! Liftoff!');
        gameAudio.playThruster(6.5);
      }

      if (elapsed >= 15.0 && !spaceTriggered) {
        spaceTriggered = true;
        setSubPhase('space');
        setStatusMessage('Spacecraft clears Earth atmosphere. Moon orbital approach!');
      }

      if (elapsed >= 19.5) {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, 100);

    // --- Render Loop ---
    let animFrameId;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - prevTime) / 1000, 0.1);
      const elapsed = (now - startTime) / 1000;
      prevTime = now;

      // Rotate Earth & Moon subtly
      moonMesh.rotation.y += 0.05 * delta;
      if (earthMesh.visible) {
        earthMesh.rotation.y += 0.04 * delta;
      }

      // Phase 1: Boarding Walk (0 - 4.5s)
      if (elapsed < 4.5) {
        if (astronaut.position.x < -0.9) {
          astronaut.position.x += 0.55 * delta;
          astronaut.userData.anim.update(delta, elapsed);
        } else {
          astronaut.userData.anim.state = 'wave';
          astronaut.userData.anim.update(delta, elapsed);
        }
      }

      // Phase 2: Hatch Closing (4.5s - 5.5s)
      if (elapsed >= 4.5 && hatchAngle > 0.02) {
        hatchAngle = Math.max(0, hatchAngle - 1.6 * delta);
        hatchPivot.rotation.y = hatchAngle;
      }

      // Phase 3: Ignition & Launch (8.0s onwards)
      if (elapsed >= 8.0) {
        flameGroup.visible = true;
        exhaustLight.intensity = 4.0 + Math.random() * 2.5;

        // Flicker flame scales
        flameGroup.scale.set(
          0.9 + Math.random() * 0.25,
          1.0 + Math.random() * 0.35,
          0.9 + Math.random() * 0.25
        );

        updateSmoke(delta, elapsed < 13.0);

        if (elapsed >= 8.8) {
          // Accelerate rocket upward
          rocketVelocity += 9.8 * delta * (1 + (elapsed - 8.8) * 0.35);
          rocketY += rocketVelocity * delta;
          rocketRoot.position.y = rocketY;

          // Camera tracks rocket upwards
          if (elapsed < 14.5) {
            camera.position.y = 18 + rocketY * 0.85;
            camera.position.z = 12 + rocketY * 0.25;
            camera.lookAt(0, 16.5 + rocketY, 0);
          } else {
            // Cut to Space tracking camera
            ground.visible = false;
            launchpadRoot.visible = false;
            earthMesh.visible = true;

            camera.position.set(15, rocketY + 8, 25);
            camera.lookAt(0, rocketY + 16, 0);
          }
        }
      }

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
      clearInterval(intervalId);
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
      {/* 3D Three.js Viewport */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Banner: Cinematic Scene Header & Skip Control */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-sky-400/40 shadow-lg pointer-events-auto">
          <Rocket className="w-5 h-5 text-sky-400 animate-pulse" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">Act 1 • Scene 1</span>
            <h2 className="text-sm sm:text-base font-extrabold text-white">Cape Canaveral Launch Complex</h2>
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

      {/* Countdown HUD Center Overlay */}
      {subPhase === 'countdown' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 animate-fade-in">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-950/80 border-4 border-amber-400/80 backdrop-blur-xl flex flex-col items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.5)]">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">T-MINUS</span>
            <span className="text-5xl sm:text-6xl font-black text-white">{countdownNum}</span>
          </div>
        </div>
      )}

      {/* Cinematic Lower Third Subtitle Bar */}
      <div className="absolute bottom-6 left-4 right-4 max-w-2xl mx-auto z-20 pointer-events-none">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-sky-400/40 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-sky-900/50 border border-sky-400/60 p-1 flex items-center justify-center shrink-0">
            <img src="/images/nova_alien_companion.png" alt="Astronaut Hero" className="w-10 h-10 object-contain drop-shadow" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Mission Telemetry</span>
            <p className="text-xs sm:text-sm font-medium text-slate-100">{statusMessage}</p>
          </div>
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
        </div>
      </div>
    </div>
  );
}

