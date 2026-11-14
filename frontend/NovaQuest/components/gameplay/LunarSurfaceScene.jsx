import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Compass, Rocket } from 'lucide-react';
import GameButton from '../shared/GameButton';
import { gameAudio } from '../../config/gameAudio';

/**
 * LunarSurfaceScene.jsx
 * 
 * Scene 1: Discovery on the Moon (0:00 - 0:45)
 * - Cinematic Rocket Launch & Soft Touchdown.
 * - Interactive 3D Lunar Environment (craters, rocks, lunar dust, blue Earth in sky).
 * - Third-person controllable astronaut (Leo Stoolman) with WASD / Arrow keys and touch pads.
 * - Glowing interactive Surveyor 5 resting on the Moon.
 * - Trigger time-travel animation to 17 April 1967!
 */
export default function LunarSurfaceScene({ onComplete }) {
  const mountRef = useRef(null);
  const [phase, setPhase] = useState('cinematic'); // 'cinematic' | 'touchdown' | 'exploring' | 'time_travel'
  const [distanceToLander, setDistanceToLander] = useState(15);
  const [isNearLander, setIsNearLander] = useState(false);

  // Astronaut Position & Physics in scene
  const playerPosRef = useRef({ x: 0, y: 0.8, z: 3, vy: 0, isGrounded: true });
  const keysRef = useRef({ w: false, a: false, s: false, d: false, space: false });
  const landerPos = { x: 0, y: 0, z: -2 };

  // 1. Cinematic sequence transition
  useEffect(() => {
    if (phase === 'cinematic') {
      gameAudio.playThruster(2.5);
      const timer = setTimeout(() => {
        setPhase('touchdown');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleExitSpacecraft = () => {
    gameAudio.playClick();
    setPhase('exploring');
  };

  const handleInteractSurveyor = () => {
    gameAudio.playTimeTravel();
    setPhase('time_travel');
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);
  };

  // Keyboard listeners for movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright', 'shift', ' '].includes(k)) {
        e.preventDefault();
      }
      if (k === 'w' || k === 'arrowup') keysRef.current.w = true;
      if (k === 'a' || k === 'arrowleft') keysRef.current.a = true;
      if (k === 's' || k === 'arrowdown') keysRef.current.s = true;
      if (k === 'd' || k === 'arrowright') keysRef.current.d = true;
      if (k === 'shift') keysRef.current.shift = true;
      if (k === ' ' && playerPosRef.current.isGrounded) {
        keysRef.current.space = true;
        playerPosRef.current.vy = 0.16; // Lunar low-gravity jump
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
      if (k === 'shift') keysRef.current.shift = false;
      if (k === ' ') keysRef.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isNearLander]);

  // 2. Three.js Lunar Environment & Astronaut Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050814, 0.015);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    camera.position.set(0, 4, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Textures
    const texLoader = new THREE.TextureLoader();
    const moonTex = texLoader.load('/textures/planets/moon.jpg');
    moonTex.wrapS = THREE.RepeatWrapping;
    moonTex.wrapT = THREE.RepeatWrapping;
    moonTex.repeat.set(12, 12);

    const earthTex = texLoader.load('/textures/planets/earth_day.jpg');

    // Lighting (Harsh high-contrast lunar sunlight)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(25, 30, 20);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.8);
    scene.add(ambientLight);

    // Earth in Lunar Sky
    const earthGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({ map: earthTex, roughness: 0.8 });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.set(-35, 28, -60);
    scene.add(earthMesh);

    // Lunar Ground Terrain
    const groundGeo = new THREE.PlaneGeometry(120, 120, 64, 64);
    // Subtle crater deformation
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const d = Math.sqrt(vx * vx + vy * vy);
      const crater = Math.sin(vx * 0.2) * Math.cos(vy * 0.2) * 0.45;
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

    // Lunar Rocks & Boulders scattered around
    const rockGeo = new THREE.DodecahedronGeometry(0.5, 1);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    for (let i = 0; i < 30; i++) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const rx = (Math.random() - 0.5) * 60;
      const rz = (Math.random() - 0.5) * 60;
      const s = 0.4 + Math.random() * 0.8;
      rock.scale.set(s, s * 0.7, s);
      rock.position.set(rx, s * 0.35, rz);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      scene.add(rock);
    }

    // 3D Surveyor 5 Lander (Historical 3-legged model with beacon)
    const landerGroup = new THREE.Group();
    landerGroup.position.set(landerPos.x, landerPos.y, landerPos.z);

    // Lander Core Frame
    const frameGeo = new THREE.CylinderGeometry(0.8, 1.2, 1.2, 3);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.3 });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.y = 1.2;
    landerGroup.add(frameMesh);

    // 3 Landing Legs with Footpads
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(Math.cos(angle) * 1.4, 0.7, Math.sin(angle) * 1.4);
      leg.rotation.z = Math.cos(angle) * 0.5;
      leg.rotation.x = -Math.sin(angle) * 0.5;
      landerGroup.add(leg);

      // Footpad
      const padGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
      const padMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(Math.cos(angle) * 2.1, 0.05, Math.sin(angle) * 2.1);
      landerGroup.add(pad);
    }

    // Solar Panel on top
    const panelGeo = new THREE.BoxGeometry(1.4, 0.05, 0.8);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.8, roughness: 0.2 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 2.3, 0);
    panel.rotation.x = 0.3;
    landerGroup.add(panel);

    // TV Camera Mast
    const camGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8);
    const camMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
    const cam = new THREE.Mesh(camGeo, camMat);
    cam.position.set(0.6, 1.8, 0.4);
    landerGroup.add(cam);

    // High Gain Antenna Dish
    const dishGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.08, 16);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(-0.5, 2.6, 0);
    dish.rotation.z = 0.4;
    landerGroup.add(dish);

    // Beacon Light
    const beacon = new THREE.PointLight(0x38bdf8, 2, 8);
    beacon.position.set(0, 3, 0);
    landerGroup.add(beacon);

    scene.add(landerGroup);

    // 3D Controllable Astronaut (Leo Stoolman)
    const astronautGroup = new THREE.Group();
    astronautGroup.position.set(playerPosRef.current.x, playerPosRef.current.y, playerPosRef.current.z);

    // Spacesuit body
    const suitGeo = new THREE.CapsuleGeometry(0.4, 0.8, 8, 16);
    const suitMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const suitMesh = new THREE.Mesh(suitGeo, suitMat);
    suitMesh.position.y = 0.6;
    astronautGroup.add(suitMesh);

    // Helmet & Gold Visor
    const helmetGeo = new THREE.SphereGeometry(0.38, 24, 24);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
    helmetMesh.position.y = 1.35;
    astronautGroup.add(helmetMesh);

    const visorGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 1.35, 0.18);
    visorMesh.scale.set(1, 0.8, 0.5);
    astronautGroup.add(visorMesh);

    // Jetpack / PLSS Backpack
    const packGeo = new THREE.BoxGeometry(0.5, 0.7, 0.3);
    const packMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const packMesh = new THREE.Mesh(packGeo, packMat);
    packMesh.position.set(0, 0.8, -0.3);
    astronautGroup.add(packMesh);

    scene.add(astronautGroup);

    // Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 200;
      starPos[i + 1] = Math.random() * 80 + 5;
      starPos[i + 2] = (Math.random() - 0.5) * 200;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.4, color: 0xffffff });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Animation Loop & Camera Orbit State
    let animId = null;
    let clock = new THREE.Clock();
    let camYaw = 0;
    let camPitch = 0.28;
    let camDistance = 8.0;
    const TRACKPAD_LOOK_SENSITIVITY = 0.0032;

    // 1-Finger Touch / Pointer Look Handlers
    let pointerDown = null;
    let prevPointerX = 0;
    let prevPointerY = 0;
    const handlePointerDown = (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      pointerDown = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    };
    const handlePointerMove = (e) => {
      if (!pointerDown) return;
      const deltaX = e.clientX - prevPointerX;
      const deltaY = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      camYaw -= deltaX * 0.0035;
      camPitch = Math.max(-0.15, Math.min(1.2, camPitch + deltaY * 0.0035));
    };
    const handlePointerUp = () => { pointerDown = null; };

    // 2-Finger Laptop Touchpad Swipe & Pinch Zoom
    const handleWheel = (e) => {
      const deltaMultiplier = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1;
      const deltaX = e.deltaX * deltaMultiplier;
      const deltaY = e.deltaY * deltaMultiplier;
      if (deltaX === 0 && deltaY === 0) return;
      if (e.cancelable) e.preventDefault();

      if (e.ctrlKey) {
        camDistance = Math.max(3.5, Math.min(16.0, camDistance + deltaY * 0.005));
        return;
      }

      camYaw -= deltaX * TRACKPAD_LOOK_SENSITIVITY;
      camPitch = Math.max(-0.15, Math.min(1.2, camPitch + deltaY * TRACKPAD_LOOK_SENSITIVITY));
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Beacon pulsing
      beacon.intensity = 1.5 + Math.sin(clock.getElapsedTime() * 4) * 0.8;

      // Earth rotation in sky
      earthMesh.rotation.y += delta * 0.05;

      // Handle Player Movement (relative to camera yaw)
      const p = playerPosRef.current;
      const k = keysRef.current;

      const forward = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
      const right = new THREE.Vector3(Math.cos(camYaw), 0, -Math.sin(camYaw));
      const moveDir = new THREE.Vector3();
      if (k.w) moveDir.add(forward);
      if (k.s) moveDir.sub(forward);
      if (k.d) moveDir.add(right);
      if (k.a) moveDir.sub(right);

      if (moveDir.lengthSq() > 0.001) {
        moveDir.normalize();
        const speed = (k.shift ? 7.5 : 4.5) * delta;
        p.x += moveDir.x * speed;
        p.z += moveDir.z * speed;
        astronautGroup.rotation.y = Math.atan2(moveDir.x, moveDir.z);
      }

      // Lunar gravity & vertical physics
      p.vy -= 0.35 * delta; // 1/6th gravity
      p.y += p.vy;
      if (p.y <= 0) {
        p.y = 0;
        p.vy = 0;
        p.isGrounded = true;
      }

      // Update 3D Astronaut mesh position
      astronautGroup.position.set(p.x, p.y, p.z);

      // Camera Follow Astronaut with spherical orbit (yaw, pitch, distance)
      const hDist = camDistance * Math.cos(camPitch);
      const vDist = camDistance * Math.sin(camPitch);
      const targetCamX = p.x + Math.sin(camYaw) * hDist;
      const targetCamY = Math.max(0.5, p.y + 1.2 + vDist);
      const targetCamZ = p.z + Math.cos(camYaw) * hDist;

      camera.position.x += (targetCamX - camera.position.x) * 0.12;
      camera.position.y += (targetCamY - camera.position.y) * 0.12;
      camera.position.z += (targetCamZ - camera.position.z) * 0.12;
      camera.lookAt(p.x, p.y + 1.2, p.z);

      // Distance to Surveyor 5
      const dist = Math.hypot(p.x - landerPos.x, p.z - landerPos.z);
      setDistanceToLander(dist);
      setIsNearLander(dist < 7.5);

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
      [groundGeo, rockGeo, frameGeo, panelGeo, camGeo, dishGeo, suitGeo, helmetGeo, visorGeo, packGeo, earthGeo, starGeo].forEach(g => g?.dispose());
      [groundMat, rockMat, frameMat, panelMat, camMat, dishMat, suitMat, helmetMat, visorMat, packMat, earthMat, starMat].forEach(m => m?.dispose());
      [moonTex, earthTex].forEach(t => t?.dispose());
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[550px] select-none overflow-hidden">
      {/* 3D Lunar Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* PHASE 1: LAUNCH & DESCENT CINEMATIC OVERLAY */}
      {phase === 'cinematic' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 text-white p-6 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.6)] mb-6 animate-pulse">
            <Rocket className="w-10 h-10 text-white -rotate-45" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-white to-yellow-300 mb-2">
            LUNAR DESCENT IN PROGRESS...
          </h2>
          <p className="text-sky-300 text-sm sm:text-base font-bold max-w-md">
            Approaching Mare Tranquillitatis. Retrorocket ignition initiated!
          </p>
          <div className="w-64 h-2 rounded-full bg-slate-800 overflow-hidden mt-6">
            <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 animate-pulse w-full" />
          </div>
        </div>
      )}

      {/* PHASE 2: TOUCHDOWN COMPLETE BANNER */}
      {phase === 'touchdown' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xs text-white p-6 text-center animate-fade-in">
          <div className="p-8 rounded-3xl bg-slate-900/95 border-2 border-sky-400 shadow-[0_10px_50px_rgba(2,132,199,0.5)] max-w-lg space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-2xl">
              🌕
            </div>
            <h3 className="text-2xl font-black text-white">
              Touchdown complete!
            </h3>
            <p className="text-sm text-sky-200">
              Welcome to the Sea of Tranquility. Leo, exit the spacecraft to begin your search for the historic Surveyor 5 lander!
            </p>
            <GameButton
              size="lg"
              variant="accent"
              onClick={handleExitSpacecraft}
              icon={Sparkles}
              className="w-full text-base font-black"
            >
              TAP TO EXIT SPACECRAFT
            </GameButton>
          </div>
        </div>
      )}

      {/* PHASE 3: INTERACTIVE EXPLORATION HUD PROMPTS */}
      {phase === 'exploring' && (
        <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none">
          {/* Objective Banner */}
          <div className="px-5 py-3 rounded-2xl bg-slate-900/85 border border-sky-400/50 backdrop-blur-md text-white text-xs sm:text-sm font-bold shadow-xl pointer-events-auto">
            <div className="flex items-center gap-2 text-orange-400 text-xs uppercase mb-0.5">
              <Compass className="w-4 h-4" />
              <span>Objective: Locate Surveyor 5</span>
            </div>
            <span className="text-sky-200">
              Distance: <strong className="text-yellow-300 font-mono">{distanceToLander.toFixed(1)} meters</strong>
            </span>
          </div>

          {/* Near Lander Interaction Button */}
          <div className="pointer-events-auto animate-bounce">
            <GameButton
              id="inspect-surveyor-btn"
              size="lg"
              variant={isNearLander ? 'highlight' : 'accent'}
              onClick={handleInteractSurveyor}
              icon={Sparkles}
              className="text-slate-950 font-black shadow-[0_0_30px_rgba(250,204,21,0.6)]"
            >
              {isNearLander ? 'TAP TO INSPECT SURVEYOR 5' : 'APPROACH & INSPECT SURVEYOR 5'}
            </GameButton>
          </div>
        </div>
      )}

      {/* PHASE 4: TIME-TRAVEL JUMP ANIMATION */}
      {phase === 'time_travel' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-t from-purple-950 via-sky-950 to-slate-950 text-white p-6 text-center animate-pulse">
          <div className="w-24 h-24 rounded-full border-4 border-cyan-400 border-t-yellow-400 animate-spin flex items-center justify-center text-4xl shadow-[0_0_80px_rgba(34,211,238,0.8)] mb-6">
            ⏳
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-yellow-200 to-purple-300 tracking-wider">
            TIME TRAVEL INITIATED...
          </h2>
          <p className="text-lg text-sky-200 font-bold mt-2">
            WARPING TO 17 APRIL 1967 • NASA HEADQUARTERS
          </p>
        </div>
      )}
    </div>
  );
}
