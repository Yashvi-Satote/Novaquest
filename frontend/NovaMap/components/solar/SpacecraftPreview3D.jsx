import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RotateCw, RotateCcw, Sparkles, ZoomIn, ZoomOut, Compass, Eye } from 'lucide-react';
import { loadSpacecraft3DModel, getSpacecraftModelSpec } from './spacecraftModelRegistry';

/**
 * SpacecraftPreview3D
 * Interactive 3D spacecraft inspection viewport for MissionDetailDrawer and detail modals.
 * Inspired by NASA Eyes on the Solar System interactive 3D hardware inspector.
 * 
 * Supports:
 * - Direct loading of authentic NASA GLB models or procedural fallback models.
 * - Interactive 3D mouse orbit / drag rotation and mouse wheel zoom.
 * - Auto-rotation toggle, reset orientation, and zoom controls.
 * - Provenance indicator badge (NASA Verified vs Procedural Fallback).
 * - Comprehensive Three.js disposal on unmount to prevent WebGL memory leaks.
 */
export default function SpacecraftPreview3D({ slug, name, customModelPath }) {
  const containerRef = useRef(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthentic, setIsAuthentic] = useState(false);
  const [provenance, setProvenance] = useState('');
  const [loadError, setLoadError] = useState(null);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const modelGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const initialCamPosRef = useRef(new THREE.Vector3(2.4, 1.4, 2.8));

  // Determine static spec info
  const spec = getSpacecraftModelSpec(slug);

  useEffect(() => {
    if (!containerRef.current || !slug) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    const container = containerRef.current;
    const width = container.clientWidth || 340;
    const height = container.clientHeight || 230;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.copy(initialCamPosRef.current);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. WebGLRenderer with high-quality tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls for smooth drag and zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.2;
    controls.maxDistance = 8.0;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.6;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting (Multi-point key, fill, and rim lights to highlight metallic foils and solar panels)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 4, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    fillLight.position.set(-4, -2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 0.8);
    rimLight.position.set(0, -4, 4);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    scene.add(ambientLight);

    // Subtle background grid circle
    const gridHelper = new THREE.PolarGridHelper(2.5, 16, 8, 32, 0x38bdf8, 0x1e1b4b);
    gridHelper.position.y = -1.1;
    scene.add(gridHelper);

    // 6. Load spacecraft 3D model
    let currentModelGroup = null;

    loadSpacecraft3DModel(slug, customModelPath)
      .then((loadedGroup) => {
        if (!isMounted) {
          // Dispose if component unmounted before load completed
          disposeObject(loadedGroup);
          return;
        }

        currentModelGroup = loadedGroup;
        modelGroupRef.current = loadedGroup;
        scene.add(loadedGroup);

        setIsAuthentic(Boolean(loadedGroup.userData?.isAuthenticModel));
        setProvenance(loadedGroup.userData?.provenance || spec?.provenance || 'NASA Data Archive');
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(`Failed to load spacecraft model preview for ${slug}:`, err);
        if (isMounted) {
          setLoadError('3D model telemetry loading failed');
          setIsLoading(false);
        }
      });

    // 7. Render Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth || 360;
      const h = containerRef.current.clientHeight || 220;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 9. Cleanup function
    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);

      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      if (currentModelGroup) {
        scene.remove(currentModelGroup);
        disposeObject(currentModelGroup);
      }

      scene.remove(gridHelper);
      disposeObject(gridHelper);

      scene.clear();

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && rendererRef.current.domElement.parentNode) {
          rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [slug, customModelPath]);

  // Synchronize auto-rotate with state
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isRotating;
    }
  }, [isRotating]);

  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.copy(initialCamPosRef.current);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const handleZoom = (delta) => {
    if (controlsRef.current && cameraRef.current) {
      const dir = new THREE.Vector3();
      cameraRef.current.getWorldDirection(dir);
      cameraRef.current.position.addScaledVector(dir, delta);
      controlsRef.current.update();
    }
  };

  return (
    <div id="drawer-spacecraft-preview" className="relative w-full h-[230px] min-h-[230px] shrink-0 rounded-xl overflow-hidden border border-cyan-500/25 bg-[#060414]/90 shadow-inner group">
      {/* 3D Canvas Mount Point */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing" 
        title="Click and drag to rotate spacecraft in 3D • Scroll to zoom"
      />

      {/* Loading State Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070518]/90 z-10 space-y-2 pointer-events-none">
          <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-[11px] font-mono text-cyan-300">Loading 3D spacecraft geometry...</p>
        </div>
      )}

      {/* Load Error State */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/80 p-3 text-center z-10">
          <p className="text-xs font-semibold text-rose-300">{loadError}</p>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">Falling back to archive summary</span>
        </div>
      )}

      {/* Provenance Badge (NASA Verified vs Procedural Fallback) */}
      {!isLoading && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          <span 
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-mono font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm ${
              isAuthentic 
                ? 'bg-emerald-950/85 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-950/85 border-amber-500/40 text-amber-300'
            }`}
            title={provenance}
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>{isAuthentic ? 'NASA Verified 3D' : 'Procedural 3D'}</span>
          </span>
        </div>
      )}

      {/* Interaction Controls Dock */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setIsRotating(prev => !prev)}
          className={`p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
            isRotating
              ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300 shadow-sm'
              : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title={isRotating ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
          aria-label="Toggle auto-rotation"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        </button>

        <button
          type="button"
          onClick={handleResetCamera}
          className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-cyan-500/40 text-slate-400 hover:text-white backdrop-blur-md transition-all cursor-pointer"
          title="Reset Camera Orientation"
          aria-label="Reset Camera"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleZoom(0.5)}
          className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-cyan-500/40 text-slate-400 hover:text-white backdrop-blur-md transition-all cursor-pointer"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleZoom(-0.5)}
          className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-cyan-500/40 text-slate-400 hover:text-white backdrop-blur-md transition-all cursor-pointer"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Information & Drag Hint */}
      <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none text-[9px] font-mono text-slate-400">
        <span className="truncate max-w-[200px] text-white font-medium drop-shadow-md">
          {name || slug}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-cyan-300 shrink-0">
          Interactive 3D Inspector
        </span>
      </div>
    </div>
  );
}

/**
 * Recursive disposal helper for Three.js objects
 */
function disposeObject(obj) {
  if (!obj) return;
  obj.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(disposeMaterial);
      } else {
        disposeMaterial(child.material);
      }
    }
  });
}

function disposeMaterial(mat) {
  if (!mat) return;
  Object.keys(mat).forEach((prop) => {
    if (mat[prop] && typeof mat[prop].dispose === 'function') {
      mat[prop].dispose();
    }
  });
  mat.dispose();
}

