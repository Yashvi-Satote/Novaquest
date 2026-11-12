import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, Sparkles, FastForward, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { createAstronautCharacter } from './three/AstronautCharacterModel';
import { gameAudio } from '../../config/gameAudio';

/**
 * MoonLandingCinematic.jsx
 * 
 * Scene 2: Moon Landing & Lunar Surface Exploration (0:20 - 0:45)
 * - Spacecraft lunar descent with glowing thruster plume.
 * - Soft touchdown with billowing lunar regolith dust explosion.
 * - Astronaut Leo exits spacecraft onto the lunar surface.
 * - Interactive third-person exploration (WASD / Arrows / Touchpad controls).
 * - Surveyor 5 lander visible in distance with glowing energy beacon.
 * - Proximity detection activates time travel seamlessly (no popups/quizzes).
 */
export default function MoonLandingCinematic({ onComplete, onSkip }) {
  const mountRef = useRef(null);
  const [phase, setPhase] = useState('landing'); // 'landing' | 'exit_craft' | 'exploring' | 'time_warp'
  const [distanceToLander, setDistanceToLander] = useState(15.0);
  const [isNearLander, setIsNearLander] = useState(false);

  // Astronaut physical movement
  const playerPosRef = useRef({ x: 0, y: 0.8, z: 8, vy: 0, isGrounded: true, rotY: 0 });
  const keysRef = useRef({ w: false, a: false, s: false, d: false, space: false });
  const landerPos = { x: 0, y: 0, z: -4 };

  const handleInteractLander = () => {
    setPhase('time_warp');
    gameAudio.playTimeTravel();
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1500);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keysRef.current.w = true;
      if (k === 'a' || k === 'arrowleft') keysRef.current.a = true;
      if (k === 's' || k === 'arrowdown') keysRef.current.s = true;
      if (k === 'd' || k === 'arrowright') keysRef.current.d = true;
      if (k === ' ' && playerPosRef.current.isGrounded) {
        keysRef.current.space = true;
        playerPosRef.current.vy = 0.14; // Lunar microgravity jump
        playerPosRef.current.isGrounded = false;
        gameAudio.playClick();
      }
    };

    const handleKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keysRef.current.w = false;
      if (k === 'a' || k === 'arrowleft') keysRef.current.a = false;
      if (k === 's' || k === 'arrowdown') keysRef.current.s = false;
      if (k === 'd' || k === 'arrowright') keysRef.current.d = false;
      if (k === ' ') keysRef.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isNearLander]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x050814, 0.012);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 800);
    camera.position.set(0, 4, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // --- Textures & Celestial Background ---
    const texLoader = new THREE.TextureLoader();
    const moonTex = texLoader.load('/textures/planets/moon.jpg');
    moonTex.wrapS = THREE.RepeatWrapping;
    moonTex.wrapT = THREE.RepeatWrapping;
    moonTex.repeat.set(16, 16);

    const earthTex = texLoader.load('/textures/planets/earth_day.jpg');

    // Blue Earth suspended in dark lunar sky
    const earthGeo = new THREE.SphereGeometry(7, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({ map: earthTex, roughness: 0.6, metalness: 0.1 });
    const earthSphere = new THREE.Mesh(earthGeo, earthMat);
    earthSphere.position.set(45, 60, -120);
    scene.add(earthSphere);

    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 800;
      starPos[i + 1] = Math.random() * 400 + 10;
      starPos[i + 2] = (Math.random() - 0.5) * 800;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.0, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Points(starGeo, starMat));

    // High-contrast Harsh Lunar Sunlight
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(30, 40, 25);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.35); // subtle blue earthshine
    scene.add(ambientLight);

    // Cratered Lunar Ground
    const groundGeo = new THREE.PlaneGeometry(160, 160, 48, 48);
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const crater = Math.sin(vx * 0.18) * Math.cos(vy * 0.18) * 0.6;
      posAttr.setZ(i, crater);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.95,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Scattered Lunar Boulders
    const rockGeo = new THREE.DodecahedronGeometry(0.6, 1);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    for (let i = 0; i < 35; i++) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const rx = (Math.random() - 0.5) * 70;
      const rz = (Math.random() - 0.5) * 70;
      const s = 0.35 + Math.random() * 0.85;
      rock.scale.set(s, s * 0.7, s);
      rock.position.set(rx, s * 0.3, rz);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      scene.add(rock);
    }

    // --- Lander Spacecraft (Arrival Capsule / Apollo style) ---
    const landerGroup = new THREE.Group();
    landerGroup.position.set(0, 14, 8); // Starts high in sky for landing sequence
    scene.add(landerGroup);

    // Capsule Body
    const capGeo = new THREE.CylinderGeometry(1.2, 1.8, 2.2, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.6, roughness: 0.3 });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.y = 1.6;
    landerGroup.add(capMesh);

    // 4 Landing Struts with Footpads
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
      leg.position.set(Math.cos(angle) * 1.5, 0.8, Math.sin(angle) * 1.5);
      leg.rotation.z = Math.cos(angle) * 0.45;
      leg.rotation.x = -Math.sin(angle) * 0.45;
      landerGroup.add(leg);

      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 12), new THREE.MeshStandardMaterial({ color: 0x475569 }));
      pad.position.set(Math.cos(angle) * 2.2, 0.05, Math.sin(angle) * 2.2);
      landerGroup.add(pad);
    }

    // Descent Rocket Engine Thruster Plume
    const thrusterGeo = new THREE.ConeGeometry(0.8, 3.2, 16);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
    const thrusterMesh = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterMesh.rotation.x = Math.PI;
    thrusterMesh.position.y = -1.6;
    landerGroup.add(thrusterMesh);

    const thrusterLight = new THREE.PointLight(0x38bdf8, 3.0, 15);
    thrusterLight.position.y = -1.0;
    landerGroup.add(thrusterLight);

    // Lunar Touchdown Dust Particles
    const dustCount = 300;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustVel = [];
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 2;
      dustPos[i * 3 + 1] = 0.1;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
      dustVel.push({
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * 3.5,
        vz: (Math.random() - 0.5) * 12
      });
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xcfd8dc, size: 1.2, transparent: true, opacity: 0 });
    const dustSystem = new THREE.Points(dustGeo, dustMat);
    dustSystem.position.set(0, 0, 8);
    scene.add(dustSystem);

    // --- Historic Surveyor 5 Lander (Waiting in distance) ---
    const surveyorGroup = new THREE.Group();
    surveyorGroup.position.set(landerPos.x, landerPos.y, landerPos.z);
    scene.add(surveyorGroup);

    // Surveyor Frame
    const sFrame = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.2, 1.2, 3),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.25 })
    );
    sFrame.position.y = 1.2;
    surveyorGroup.add(sFrame);

    // 3 Surveyor Tripod Landing Legs
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
      leg.position.set(Math.cos(angle) * 1.4, 0.7, Math.sin(angle) * 1.4);
      leg.rotation.z = Math.cos(angle) * 0.5;
      leg.rotation.x = -Math.sin(angle) * 0.5;
      surveyorGroup.add(leg);

      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0x475569 }));
      pad.position.set(Math.cos(angle) * 2.1, 0.05, Math.sin(angle) * 2.1);
      surveyorGroup.add(pad);
    }

    // Golden Solar Panel on top
    const sPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.05, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.15 })
    );
    sPanel.position.set(0, 2.3, 0);
    sPanel.rotation.x = 0.35;
    surveyorGroup.add(sPanel);

    // Pulsing Chrono-Beacon on Surveyor 5
    const beaconLight = new THREE.PointLight(0x38bdf8, 3.5, 12);
    beaconLight.position.set(0, 2.8, 0);
    surveyorGroup.add(beaconLight);

    const beaconOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    beaconOrb.position.set(0, 2.8, 0);
    surveyorGroup.add(beaconOrb);

    // Chrono Aura Rings surrounding Surveyor 5
    const auraRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.4, 0.05, 12, 32),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 })
    );
    auraRing1.rotation.x = Math.PI / 2;
    surveyorGroup.add(auraRing1);

    const auraRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.0, 0.04, 12, 32),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 })
    );
    auraRing2.rotation.x = Math.PI / 2;
    surveyorGroup.add(auraRing2);

    // --- Astronaut Hero (Leo - Matching Reference Character) ---
    const astronaut = createAstronautCharacter({ scale: 0.85 });
    astronaut.position.set(playerPosRef.current.x, playerPosRef.current.y, playerPosRef.current.z);
    astronaut.visible = false; // Becomes visible when exiting craft
    scene.add(astronaut);

    // --- Animation Timeline ---
    let startTime = performance.now();
    let prevTime = startTime;
    let craftY = 14;
    let landingComplete = false;
    let dustActive = false;

    gameAudio.playThruster(4.0);

    let animFrameId;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - prevTime) / 1000, 0.1);
      const elapsed = (now - startTime) / 1000;
      prevTime = now;

      // Pulse beacon & aura rings
      beaconLight.intensity = 2.5 + Math.sin(elapsed * 4) * 1.5;
      auraRing1.rotation.z += 0.8 * delta;
      auraRing2.rotation.z -= 0.6 * delta;

      // 1. Landing descent sequence (0s - 4.5s)
      if (craftY > 0.05) {
        craftY = Math.max(0, craftY - (3.2 * (craftY / 14 + 0.25)) * delta);
        landerGroup.position.y = craftY;

        // Plume flutters
        thrusterMesh.scale.set(0.9 + Math.random() * 0.2, 1.0 + Math.random() * 0.3, 0.9 + Math.random() * 0.2);

        // Near ground touchdown
        if (craftY < 2.0 && !dustActive) {
          dustActive = true;
          dustMat.opacity = 0.8;
        }

        // Camera dramatic touchdown angle
        camera.position.set(0, 3 + craftY * 0.3, 16 + craftY * 0.2);
        camera.lookAt(0, 1 + craftY * 0.5, 8);
      } else if (!landingComplete) {
        landingComplete = true;
        thrusterMesh.visible = false;
        thrusterLight.intensity = 0;
        setPhase('exit_craft');

        // Astronaut exits spacecraft after 1.2s
        setTimeout(() => {
          astronaut.visible = true;
          setPhase('exploring');
          gameAudio.playClick();
        }, 1200);
      }

      // Billow and settle dust
      if (dustActive && dustMat.opacity > 0.02) {
        dustMat.opacity = Math.max(0, dustMat.opacity - delta * 0.35);
        const pArr = dustGeo.attributes.position.array;
        for (let i = 0; i < dustCount; i++) {
          pArr[i * 3] += dustVel[i].vx * delta;
          pArr[i * 3 + 1] += dustVel[i].vy * delta;
          pArr[i * 3 + 2] += dustVel[i].vz * delta;
        }
        dustGeo.attributes.position.needsUpdate = true;
      }

      // 2. Interactive Exploration Mode
      if (phase === 'exploring' && astronaut.visible) {
        const p = playerPosRef.current;
        const keys = keysRef.current;

        let moveX = 0;
        let moveZ = 0;
        const speed = 4.2;

        if (keys.w) moveZ -= 1;
        if (keys.s) moveZ += 1;
        if (keys.a) moveX -= 1;
        if (keys.d) moveX += 1;

        const isMoving = moveX !== 0 || moveZ !== 0;

        if (isMoving) {
          const mag = Math.sqrt(moveX * moveX + moveZ * moveZ);
          p.x += (moveX / mag) * speed * delta;
          p.z += (moveZ / mag) * speed * delta;
          p.rotY = Math.atan2(moveX, moveZ);
          astronaut.rotation.y = p.rotY;
          astronaut.userData.anim.state = 'walk';
        } else {
          astronaut.userData.anim.state = 'idle';
        }

        // Low gravity jump & physics
        if (!p.isGrounded) {
          p.vy -= 0.35 * delta; // 1/6th Earth gravity
          p.y += p.vy;
          if (p.y <= 0.8) {
            p.y = 0.8;
            p.vy = 0;
            p.isGrounded = true;
          }
        }

        astronaut.position.set(p.x, p.y, p.z);
        astronaut.userData.anim.update(delta, elapsed);

        // Smooth third-person chase camera follow
        const targetCamX = p.x;
        const targetCamY = p.y + 3.0;
        const targetCamZ = p.z + 6.5;

        camera.position.x += (targetCamX - camera.position.x) * 0.1;
        camera.position.y += (targetCamY - camera.position.y) * 0.1;
        camera.position.z += (targetCamZ - camera.position.z) * 0.1;
        camera.lookAt(p.x, p.y + 1.2, p.z - 2.5);

        // Proximity detection to Surveyor 5
        const dx = p.x - landerPos.x;
        const dz = p.z - landerPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        setDistanceToLander(dist.toFixed(1));

        if (dist <= 3.2) {
          setIsNearLander(true);
          // Automatic proximity trigger or interaction available
          if (dist <= 2.2) {
            handleInteractLander();
          }
        } else {
          setIsNearLander(false);
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
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [phase]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950 font-sans">
      {/* 3D Viewport */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Banner & Skip Cinematic */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-sky-400/40 shadow-lg pointer-events-auto">
          <Compass className="w-5 h-5 text-sky-400 animate-pulse" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">Act 1 • Scene 2</span>
            <h2 className="text-sm sm:text-base font-extrabold text-white">Mare Tranquillitatis — Lunar Surface</h2>
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

      {/* Proximity / Interaction Prompt when Near Surveyor 5 */}
      {isNearLander && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <button
            onClick={handleInteractLander}
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-600 text-white font-extrabold text-sm sm:text-base shadow-[0_0_30px_rgba(56,189,248,0.7)] border-2 border-white/50 active:scale-95 transition-all"
          >
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Examine Surveyor 5 & Trigger Time Travel!</span>
          </button>
        </div>
      )}

      {/* On-Screen Touch / Arrow Controls for Mobile or Quick Navigation */}
      {phase === 'exploring' && (
        <div className="absolute bottom-6 right-6 flex flex-col items-center gap-2 z-20 pointer-events-auto bg-slate-900/70 p-3 rounded-2xl backdrop-blur-md border border-slate-700">
          <button
            onMouseDown={() => (keysRef.current.w = true)}
            onMouseUp={() => (keysRef.current.w = false)}
            onTouchStart={() => (keysRef.current.w = true)}
            onTouchEnd={() => (keysRef.current.w = false)}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-sky-600 text-white flex items-center justify-center font-bold active:scale-90 transition-all"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button
              onMouseDown={() => (keysRef.current.a = true)}
              onMouseUp={() => (keysRef.current.a = false)}
              onTouchStart={() => (keysRef.current.a = true)}
              onTouchEnd={() => (keysRef.current.a = false)}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-sky-600 text-white flex items-center justify-center font-bold active:scale-90 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onMouseDown={() => (keysRef.current.s = true)}
              onMouseUp={() => (keysRef.current.s = false)}
              onTouchStart={() => (keysRef.current.s = true)}
              onTouchEnd={() => (keysRef.current.s = false)}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-sky-600 text-white flex items-center justify-center font-bold active:scale-90 transition-all"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              onMouseDown={() => (keysRef.current.d = true)}
              onMouseUp={() => (keysRef.current.d = false)}
              onTouchStart={() => (keysRef.current.d = true)}
              onTouchEnd={() => (keysRef.current.d = false)}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-sky-600 text-white flex items-center justify-center font-bold active:scale-90 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <span className="text-[9px] uppercase font-bold text-slate-400">WASD / Arrow Keys</span>
        </div>
      )}

      {/* Cinematic Lower Third Subtitle Bar */}
      <div className="absolute bottom-6 left-4 right-4 sm:right-auto sm:max-w-md z-20 pointer-events-none">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-sky-400/40 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-sky-900/50 border border-sky-400/60 p-1 flex items-center justify-center shrink-0">
            <img src="/images/nova_alien_companion.png" alt="Astronaut Hero" className="w-10 h-10 object-contain drop-shadow" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Objective</span>
            <p className="text-xs font-medium text-slate-100">
              Walk towards the mysterious Surveyor 5 lander ({distanceToLander}m).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

