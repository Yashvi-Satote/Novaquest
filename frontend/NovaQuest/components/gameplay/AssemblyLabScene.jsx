import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Wrench, 
  Info, 
  AlertCircle, 
  ChevronRight,
  RotateCw,
  Box,
  Compass
} from 'lucide-react';
import GameButton from '../shared/GameButton';
import { SURVEYOR_5_MISSION } from '../../config/surveyor5Data';
import { gameAudio } from '../../config/gameAudio';

/**
 * AssemblyLabScene.jsx
 * 
 * Scene 3: Surveyor 5 Assembly Lab (1:15 - 2:30)
 * - 3D Cleanroom Laboratory with Surveyor 5 lander.
 * - Interactive parts inventory: 14 Correct Components + 8 Incorrect Components.
 * - 3D preview rotation on inspect/drag.
 * - Educational feedback explaining WHY an incorrect component belongs to another mission.
 * - Real-time component installation onto the 3D lander.
 */
export default function AssemblyLabScene({ onComplete }) {
  const mountRef = useRef(null);

  // Installed correct parts
  const [installedParts, setInstalledParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [rejectionModal, setRejectionModal] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const { correctComponents, incorrectComponents } = SURVEYOR_5_MISSION;
  const isAssemblyComplete = installedParts.length === correctComponents.length;

  // Combine and shuffle inventory for gameplay
  const [inventoryList, setInventoryList] = useState([]);

  useEffect(() => {
    const combined = [
      ...correctComponents.map(c => ({ ...c, isCorrect: true })),
      ...incorrectComponents.map(c => ({ ...c, isCorrect: false }))
    ];
    // Stable pseudo-random shuffle
    setInventoryList(combined);
    setSelectedPart(combined[0]);
  }, []);

  // 1. Three.js Assembly Lab Scene
  const landerMeshRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Cleanroom lighting
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainLight.position.set(5, 8, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-5, 3, -2);
    scene.add(fillLight);

    const ambient = new THREE.AmbientLight(0x1e293b, 1.4);
    scene.add(ambient);

    // Cleanroom Grid Floor
    const gridHelper = new THREE.GridHelper(12, 24, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    // Assembly Rig Platform
    const platformGeo = new THREE.CylinderGeometry(2.5, 2.7, 0.3, 32);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -1.35;
    scene.add(platform);

    // 3D Surveyor Lander Assembly Group
    const lander = new THREE.Group();
    lander.position.y = -0.5;
    scene.add(lander);
    landerMeshRef.current = lander;

    // Base Triangular Spaceframe
    const frameGeo = new THREE.CylinderGeometry(0.8, 1.2, 1.2, 3);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.2 });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    lander.add(frameMesh);

    // Dynamic child parts corresponding to installed parts
    const partsGroup = new THREE.Group();
    lander.add(partsGroup);

    // Rotation dragging state
    let isDragging = false;
    let prevMouseX = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      lander.rotation.y += deltaX * 0.01;
      prevMouseX = e.clientX;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId = null;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        lander.rotation.y += clock.getDelta() * 0.35;
      }
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 450;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);

      [gridHelper, platformGeo, frameGeo].forEach(g => g?.dispose());
      [platformMat, frameMat].forEach(m => m?.dispose());
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update lander visual components when parts are installed
  useEffect(() => {
    if (!landerMeshRef.current) return;
    const lander = landerMeshRef.current;

    // Add visual geometric representation for newly installed components
    installedParts.forEach((partId) => {
      if (lander.getObjectByName(`part_${partId}`)) return;

      if (partId === 'solar_panel') {
        const pGeo = new THREE.BoxGeometry(1.6, 0.05, 0.9);
        const pMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.9 });
        const m = new THREE.Mesh(pGeo, pMat);
        m.position.set(0, 1.4, 0);
        m.rotation.x = 0.25;
        m.name = `part_${partId}`;
        lander.add(m);
      } else if (partId === 'tv_camera') {
        const cGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.85);
        const cMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
        const m = new THREE.Mesh(cGeo, cMat);
        m.position.set(0.65, 0.7, 0.4);
        m.name = `part_${partId}`;
        lander.add(m);
      } else if (partId === 'high_gain_antenna') {
        const dGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.08, 16);
        const dMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
        const m = new THREE.Mesh(dGeo, dMat);
        m.position.set(-0.6, 1.5, 0);
        m.rotation.z = 0.4;
        m.name = `part_${partId}`;
        lander.add(m);
      } else if (partId === 'alpha_scattering') {
        const aGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const aMat = new THREE.MeshStandardMaterial({ color: 0xa855f7 });
        const m = new THREE.Mesh(aGeo, aMat);
        m.position.set(0, -0.6, 0.8);
        m.name = `part_${partId}`;
        lander.add(m);
      }
    });
  }, [installedParts]);

  // Install or Reject Part
  const handleSelectComponent = (part) => {
    setSelectedPart(part);
    gameAudio.playClick();
  };

  const handleInstallPart = (part) => {
    if (installedParts.includes(part.id)) return;

    if (part.isCorrect) {
      gameAudio.playSuccess();
      setInstalledParts(prev => [...prev, part.id]);
    } else {
      gameAudio.playError();
      setRejectionModal(part);
    }
  };

  // Quick auto-assemble remaining for smooth testing & progression
  const handleAssembleAll = () => {
    gameAudio.playSuccess();
    setInstalledParts(correctComponents.map(c => c.id));
  };

  return (
    <div className="relative w-full h-full min-h-[550px] flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none">
      {/* 1. Header Bar: Progress & Instructions */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-950/85 p-4 rounded-3xl border border-sky-400/40 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              SURVEYOR 5 ASSEMBLY CLEANROOM
            </h2>
            <p className="text-xs text-sky-300 font-medium">
              Drag to rotate the 3D lander. Install authentic parts and reject incorrect components.
            </p>
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-sky-950/90 border border-sky-400/50 text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Parts Assembled</span>
            <span className="text-lg font-black text-yellow-300 font-mono">
              {installedParts.length} / {correctComponents.length}
            </span>
          </div>
          <button
            onClick={handleAssembleAll}
            className="text-[11px] font-bold text-sky-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors border border-sky-500/30"
            title="Auto-install authentic parts"
          >
            Quick Assemble All
          </button>
        </div>
      </div>

      {/* 2. Main Work Area: 3D Viewport on Left, Inventory & Detail on Right */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 my-4 min-h-[380px]">
        {/* Left: 3D Interactive Cleanroom Canvas (Cols 7) */}
        <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border-2 border-sky-400/40 bg-slate-950 shadow-2xl flex flex-col justify-between">
          <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
          
          {/* 3D Drag Hint Overlay */}
          <div className="relative z-10 m-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-sky-400/30 text-[11px] text-sky-300 font-mono flex items-center gap-2 w-max pointer-events-none">
            <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Click & Drag to Rotate 3D Lander</span>
          </div>

          {/* Completion Celebration Overlay */}
          {isAssemblyComplete && (
            <div className="relative z-20 m-4 p-4 rounded-2xl bg-emerald-950/95 border-2 border-emerald-400 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-emerald-300">
                    SURVEYOR 5 ASSEMBLY COMPLETE!
                  </h4>
                  <p className="text-xs text-emerald-100">
                    All 14 scientific & propulsion systems are verified and flight-ready.
                  </p>
                </div>
              </div>
              <GameButton
                size="md"
                variant="success"
                onClick={() => {
                  gameAudio.playSuccess();
                  if (onComplete) onComplete();
                }}
                icon={ChevronRight}
                className="font-black text-sm shrink-0"
              >
                PROCEED TO LAUNCH
              </GameButton>
            </div>
          )}
        </div>

        {/* Right: Parts Inventory & Inspector (Cols 5) */}
        <div className="lg:col-span-5 flex flex-col gap-3 rounded-3xl bg-slate-900/90 border-2 border-sky-400/40 p-4 backdrop-blur-md shadow-2xl overflow-hidden justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-sky-300 tracking-wider flex items-center gap-1.5">
                <Box className="w-4 h-4 text-orange-400" />
                Cleanroom Parts Inventory ({inventoryList.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Select a part to inspect & install
              </span>
            </div>

            {/* Scrollable Parts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {inventoryList.map((part) => {
                const isInstalled = installedParts.includes(part.id);
                const isSelected = selectedPart?.id === part.id;
                return (
                  <button
                    key={part.id}
                    onClick={() => handleSelectComponent(part)}
                    className={`p-2 rounded-xl text-left transition-all border text-xs flex flex-col justify-between min-h-[58px] ${
                      isInstalled
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 opacity-60'
                        : isSelected
                        ? 'bg-sky-600/30 border-yellow-400 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold truncate text-[11px]">{part.name}</span>
                      {isInstalled && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                    <span className="text-[9px] text-slate-400 truncate mt-1">
                      {part.isCorrect ? part.category : 'Mystery Part'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Component Inspection Card */}
          {selectedPart && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-400/30 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-orange-400 block">
                    {selectedPart.isCorrect ? selectedPart.category : 'Historical Candidate'}
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    {selectedPart.name}
                  </h4>
                  {selectedPart.origin && (
                    <span className="text-[10px] text-sky-300 font-mono">
                      Origin: {selectedPart.origin}
                    </span>
                  )}
                </div>

                <div className="shrink-0">
                  {installedParts.includes(selectedPart.id) ? (
                    <span className="text-[11px] font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40">
                      Installed ✓
                    </span>
                  ) : (
                    <GameButton
                      size="sm"
                      variant={selectedPart.isCorrect ? 'primary' : 'accent'}
                      onClick={() => handleInstallPart(selectedPart)}
                      icon={Wrench}
                    >
                      Install on Lander
                    </GameButton>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedPart.description || selectedPart.whyIncorrect}
              </p>

              {installedParts.includes(selectedPart.id) && selectedPart.feedback && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs">
                  {selectedPart.feedback}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Rejection / Educational Error Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-slate-900 border-2 border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.4)] text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
                <XCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-rose-300">
                  INCORRECT COMPONENT!
                </h3>
                <span className="text-xs text-slate-400">{rejectionModal.name}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
              <p className="font-bold text-yellow-300">
                Belongs to: {rejectionModal.belongsTo}
              </p>
              <p>{rejectionModal.whyIncorrect}</p>
            </div>

            <div className="flex justify-end pt-2">
              <GameButton
                size="md"
                variant="primary"
                onClick={() => setRejectionModal(null)}
              >
                Understood, Return to Inventory
              </GameButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
