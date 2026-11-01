import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { 
  ArrowLeft, 
  Compass, 
  Radio, 
  Fuel, 
  Shield, 
  Target, 
  Scan, 
  RotateCcw, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Pause,
  Play
} from 'lucide-react';
import { getSaveGame, saveGame, getSettings } from '../game/saveManager';
import { audio } from '../game/audioManager';
import SettingsModal from '../components/game/SettingsModal';

export default function GameArenaPage({ theme }) {
  const navigate = useNavigate();
  const mountRef = useRef(null);

  // Game state
  const [save, setSave] = useState(() => getSaveGame());
  const [isPaused, setIsPaused] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scanProgress, setScanProgress] = useState(save?.player?.scanProgress || 0);
  const [distanceToSurveyor, setDistanceToSurveyor] = useState(1420); // meters
  const [fuel, setFuel] = useState(save?.player?.fuelCapacity || 100);
  const [hull, setHull] = useState(save?.player?.hullIntegrity || 100);
  const [isScanning, setIsScanning] = useState(false);
  const [completedObjectives, setCompletedObjectives] = useState([]);
  const [hudMessage, setHudMessage] = useState('Approaching Oceanus Procellarum. Surveyor 1 beacon locked.');

  // Three.js Scene refs
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameRef = useRef(null);
  const landerMeshRef = useRef(null);
  const earthMeshRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x02040a);
    scene.fog = new THREE.FogExp2(0x02040a, 0.0015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 5000);
    cameraRef.current = camera;
    camera.position.set(0, 18, 55);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera going below lunar ground
    controls.minDistance = 8;
    controls.maxDistance = 250;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0x223344, 0.6);
    scene.add(ambientLight);

    // Sun directional light with harsh lunar shadows
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(80, 45, 60);
    scene.add(sunLight);

    // Earth blue earthshine glow
    const earthLight = new THREE.PointLight(0x38bdf8, 1.5, 400);
    earthLight.position.set(-60, 90, -120);
    scene.add(earthLight);

    // 6. Lunar Ground Surface with Craters
    const groundGeo = new THREE.PlaneGeometry(800, 800, 64, 64);
    // Procedural displacement for craters
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const dist = Math.sqrt(vx * vx + vy * vy);
      const crater = Math.sin(vx * 0.04) * Math.cos(vy * 0.04) * 3.5 - Math.sin(dist * 0.02) * 2.0;
      pos.setZ(i, crater);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x5a5c64,
      roughness: 0.95,
      metalness: 0.1,
      flatShading: true
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    scene.add(ground);

    // 7. Distant Earth in the Black Sky
    const earthGeo = new THREE.SphereGeometry(14, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x2277bb,
      emissive: 0x0a2244,
      roughness: 0.5,
      metalness: 0.2
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.position.set(-140, 110, -220);
    scene.add(earth);
    earthMeshRef.current = earth;

    // Earth Atmosphere Glow Ring
    const glowGeo = new THREE.SphereGeometry(15, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide
    });
    const earthGlow = new THREE.Mesh(glowGeo, glowMat);
    earth.add(earthGlow);

    // 8. Surveyor 1 Lander Stylized 3D Model
    const landerGroup = new THREE.Group();
    landerMeshRef.current = landerGroup;

    // Lander Body (Triangular truss base)
    const bodyGeo = new THREE.CylinderGeometry(2, 3, 2.5, 3);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.3 });
    const landerBody = new THREE.Mesh(bodyGeo, bodyMat);
    landerBody.position.y = 2.5;
    landerGroup.add(landerBody);

    // Lander Mast with Solar Panel & TV Camera
    const mastGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.5, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.9, roughness: 0.2 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.y = 5.5;
    landerGroup.add(mast);

    // Solar Panel on top
    const panelGeo = new THREE.BoxGeometry(2.2, 0.1, 1.4);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x113366, metalness: 0.6, roughness: 0.2 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 7.5, 0);
    panel.rotation.x = 0.4;
    landerGroup.add(panel);

    // Tripod Landing Legs (3 footpads)
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.7, roughness: 0.3 });
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(Math.cos(angle) * 2.8, 1, Math.sin(angle) * 2.8);
      leg.rotation.z = Math.cos(angle) * 0.7;
      leg.rotation.x = Math.sin(angle) * 0.7;
      landerGroup.add(leg);

      // Footpad
      const padGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.15, 12);
      const pad = new THREE.Mesh(padGeo, legMat);
      pad.position.set(Math.cos(angle) * 4.2, -0.8, Math.sin(angle) * 4.2);
      landerGroup.add(pad);
    }

    // Beacon light on Surveyor 1
    const beaconLight = new THREE.PointLight(0x00ffcc, 2, 25);
    beaconLight.position.set(0, 8, 0);
    landerGroup.add(beaconLight);

    landerGroup.position.set(0, 0, 0);
    scene.add(landerGroup);

    // 9. Starfield Background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 2000;
      starPositions[i + 1] = Math.random() * 1000 + 50; // Above horizon
      starPositions[i + 2] = (Math.random() - 0.5) * 2000;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.8, transparent: true, opacity: 0.85 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 10. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Slow earth rotation
      if (earthMeshRef.current) {
        earthMeshRef.current.rotation.y += 0.05 * delta;
      }

      // Pulsing beacon light on Surveyor 1
      beaconLight.intensity = Math.sin(time * 3) * 1.5 + 2.0;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Scanning Mechanic
  const handleScanSurveyor = () => {
    audio.playClick();
    if (isScanning || scanProgress >= 100) return;

    setIsScanning(true);
    setHudMessage('Aligning scanner array with Surveyor 1 television mast...');

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          setIsScanning(false);
          setCompletedObjectives(o => [...o, 'Scan Surveyor 1 Antenna', 'Recover 1966 Lunar Telemetry']);
          setHudMessage('Surveyor 1 telemetry decrypted! 11,237 archival lunar photos linked.');

          // Update save game
          const currentSave = getSaveGame();
          if (currentSave) {
            saveGame({
              ...currentSave,
              player: {
                ...currentSave.player,
                scanProgress: 100,
                dataPacksCollected: 1
              }
            });
          }
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  // Thruster move closer
  const handleFireThrusters = () => {
    audio.playHover();
    if (fuel <= 0) {
      setHudMessage('Warning: Fuel reserves depleted.');
      return;
    }
    setFuel(f => Math.max(0, f - 4));
    setDistanceToSurveyor(d => Math.max(25, d - 120));
    setHudMessage('Thruster burn complete. Vector closing on Surveyor 1 landing crater.');
  };

  const handleReturnToMenu = () => {
    audio.playClick();
    navigate('/');
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-sans text-slate-100 select-none">
      
      {/* 3D WebGL Viewport Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* TOP FLIGHT HUD */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        
        {/* Left: Mission Info */}
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handleReturnToMenu}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 hover:bg-slate-900 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all shadow-md"
            title="Return to Main Menu"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Main Menu</span>
          </button>

          <div className="hidden sm:block font-mono">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>{save?.title || 'Surveyor 1 Recon'}</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] border border-cyan-500/30">
                ACTIVE CHECKPOINT
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {save?.coordinates || '2.474° S, 43.339° W'} • Oceanus Procellarum
            </div>
          </div>
        </div>

        {/* Center: HUD Message Ticker */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-lg">
          <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
          <span>{hudMessage}</span>
        </div>

        {/* Right: Quick Settings & Pause */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => { audio.playClick(); setIsSettingsOpen(true); }}
            className="p-2 rounded-xl bg-black/60 hover:bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Game Settings"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* BOTTOM ACTION & TELEMETRY CONTROLS HUD */}
      <div className="absolute bottom-0 inset-x-0 z-10 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
          
          {/* Status Gauges */}
          <div className="flex items-center gap-4 bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/10 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400">FUEL</div>
                <div className="font-bold text-white">{fuel}%</div>
              </div>
            </div>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-400">TARGET DIST</div>
                <div className="font-bold text-white">{distanceToSurveyor} m</div>
              </div>
            </div>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400">BEARING</div>
                <div className="font-bold text-white">042° NNE</div>
              </div>
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleFireThrusters}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Fire Thrusters (-4% Fuel)
            </button>

            <button
              type="button"
              disabled={isScanning || scanProgress >= 100}
              onClick={handleScanSurveyor}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-lg ${
                scanProgress >= 100
                  ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 cursor-default'
                  : isScanning
                  ? 'bg-cyan-600/50 text-cyan-200 border border-cyan-400 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-600/30 hover:scale-105 active:scale-95'
              }`}
            >
              <Scan className="h-4 w-4" />
              <span>{scanProgress >= 100 ? 'Surveyor Scanned' : isScanning ? `Scanning (${scanProgress}%)` : 'Scan Surveyor 1'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveChanged={() => setSave(getSaveGame())}
      />

    </div>
  );
}
