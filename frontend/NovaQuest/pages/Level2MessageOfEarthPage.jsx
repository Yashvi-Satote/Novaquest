import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ArrowLeft, Pause, Play, RotateCcw, Radio } from 'lucide-react';
import { gameAudio } from '../config/gameAudio';

const PRIMARY_VOYAGER_MODEL = '/assets/spacecraft/voyager/Voyager.glb';
const FALLBACK_VOYAGER_MODEL = '/models/spacecraft/voyager.glb';

/**
 * Dispose all geometries, materials, and textures attached to a Three.js Object3D tree.
 */
function disposeObject3D(root) {
  if (!root) return;
  root.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (!mat) return;
        Object.values(mat).forEach((value) => {
          if (value && typeof value === 'object' && typeof value.dispose === 'function') {
            value.dispose();
          }
        });
        mat.dispose();
      });
    }
  });
}

/**
 * Create a crisp, sparse deep-space starfield surrounding the origin so space
 * remains pure empty black void with subtle depth cues during camera orbit.
 */
function createEmptySpaceStarfield() {
  const starCount = 1600;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    // Distribute evenly on a distant spherical shell (radius 180..360)
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const radius = 180 + Math.random() * 180;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    // Subtle cool-white / pale-blue stellar tint variation
    const tint = 0.72 + Math.random() * 0.28;
    colors[i * 3] = tint;
    colors[i * 3 + 1] = tint;
    colors[i * 3 + 2] = Math.min(1, tint + 0.08);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.65,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

/**
 * Level2MessageOfEarthPage.jsx
 *
 * Level 2: Message of Earth
 * - Full-viewport empty deep-space background.
 * - Authentic NASA Voyager 1 3D spacecraft model centered at the origin (0, 0, 0).
 */
export default function Level2MessageOfEarthPage() {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
    }
  }, [isAutoRotate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    let disposed = false;
    let frameId = null;
    let voyagerRoot = null;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020308);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5.2, 3.0, 6.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Empty interstellar space backdrop
    const starfield = createEmptySpaceStarfield();
    scene.add(starfield);

    // Interstellar sunlight + soft bounce lighting so Voyager 1 silhouette and gold foil shine cleanly
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.65);
    scene.add(ambientLight);

    const sunKeyLight = new THREE.DirectionalLight(0xfff7ed, 2.6);
    sunKeyLight.position.set(10, 8, 12);
    scene.add(sunKeyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.1);
    rimLight.position.set(-10, -4, -9);
    scene.add(rimLight);

    const underFillLight = new THREE.DirectionalLight(0x94a3b8, 0.55);
    underFillLight.position.set(0, -10, 4);
    scene.add(underFillLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.4;
    controls.maxDistance = 18;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.65;
    controls.update();
    controlsRef.current = controls;

    const stopAutoRotate = () => {
      controls.autoRotate = false;
    };
    controls.addEventListener('start', stopAutoRotate);

    // NASA Headquarters-style laptop touchpad controls (2-finger swipe & pinch-zoom)
    const TRACKPAD_LOOK_SENSITIVITY = 0.0032;
    const trackpadOffset = new THREE.Vector3();
    const trackpadSpherical = new THREE.Spherical();

    const handleWheel = (event) => {
      const deltaMultiplier =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1;
      const deltaX = event.deltaX * deltaMultiplier;
      const deltaY = event.deltaY * deltaMultiplier;
      if (deltaX === 0 && deltaY === 0) return;

      event.preventDefault();
      controls.autoRotate = false;

      if (event.ctrlKey) {
        const factor = 1 + deltaY * 0.003;
        camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);
        controls.update();
        return;
      }

      trackpadOffset.copy(camera.position).sub(controls.target);
      trackpadSpherical.setFromVector3(trackpadOffset);
      trackpadSpherical.theta += deltaX * TRACKPAD_LOOK_SENSITIVITY;
      trackpadSpherical.phi = THREE.MathUtils.clamp(
        trackpadSpherical.phi + deltaY * TRACKPAD_LOOK_SENSITIVITY,
        0.02,
        Math.PI - 0.02,
      );
      trackpadOffset.setFromSpherical(trackpadSpherical);
      camera.position.copy(controls.target).add(trackpadOffset);
      camera.lookAt(controls.target);
      controls.update();
    };
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    // NASA Headquarters-style WASD + Arrow Keys orbit controls
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        event.preventDefault();
        controls.autoRotate = false;
        const step = 0.06;
        trackpadOffset.copy(camera.position).sub(controls.target);
        trackpadSpherical.setFromVector3(trackpadOffset);
        if (key === 'a' || key === 'arrowleft') trackpadSpherical.theta -= step;
        if (key === 'd' || key === 'arrowright') trackpadSpherical.theta += step;
        if (key === 'w' || key === 'arrowup') trackpadSpherical.phi = Math.max(0.04, trackpadSpherical.phi - step);
        if (key === 's' || key === 'arrowdown') trackpadSpherical.phi = Math.min(Math.PI - 0.04, trackpadSpherical.phi + step);
        trackpadOffset.setFromSpherical(trackpadSpherical);
        camera.position.copy(controls.target).add(trackpadOffset);
        camera.lookAt(controls.target);
        controls.update();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const mountVoyagerModel = (gltf) => {
      if (disposed) {
        disposeObject3D(gltf.scene);
        return;
      }

      const model = gltf.scene;
      // Compute bounding box and normalize + center exactly at (0, 0, 0)
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const normalizedScale = 4.8 / maxDim;

      model.scale.setScalar(normalizedScale);
      model.position.set(
        -center.x * normalizedScale,
        -center.y * normalizedScale,
        -center.z * normalizedScale
      );

      // Slight hero tilt so the dish antenna and magnetometer boom read clearly on first frame
      const pivot = new THREE.Group();
      pivot.add(model);
      pivot.rotation.set(0.18, -0.55, 0.08);
      scene.add(pivot);
      voyagerRoot = pivot;

      setLoadError(null);
      setIsLoading(false);
    };

    gltfLoader.load(
      PRIMARY_VOYAGER_MODEL,
      mountVoyagerModel,
      undefined,
      () => {
        if (disposed) return;
        // Fallback to lightweight voyager.glb if high-detail model fails
        gltfLoader.load(
          FALLBACK_VOYAGER_MODEL,
          mountVoyagerModel,
          undefined,
          (fallbackError) => {
            if (disposed) return;
            console.error('Failed to load Voyager 1 3D model:', fallbackError);
            setLoadError('Unable to load the Voyager 1 3D model.');
            setIsLoading(false);
          }
        );
      }
    );

    const animate = () => {
      if (disposed) return;
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (disposed || !container) return;
      const nextWidth = container.clientWidth || window.innerWidth;
      const nextHeight = container.clientHeight || window.innerHeight;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      controls.removeEventListener('start', stopAutoRotate);
      if (frameId !== null) cancelAnimationFrame(frameId);
      controls.dispose();
      dracoLoader.dispose();
      disposeObject3D(starfield);
      disposeObject3D(voyagerRoot);
      renderer.dispose();
      controlsRef.current = null;
      cameraRef.current = null;
    };
  }, []);

  const handleResetView = () => {
    gameAudio.playClick();
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(5.2, 3.0, 6.8);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#020308] text-white select-none">
      {/* Fullscreen 3D Empty Space + Centered Voyager 1 Viewport */}
      <div
        ref={mountRef}
        className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
        aria-label="3D view of Voyager 1 in empty deep space"
      />

      {/* Top HUD Header */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-5 sm:p-7">
        <div className="pointer-events-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              gameAudio.playClick();
              navigate('/missions');
            }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 backdrop-blur-md transition-colors hover:border-sky-400/60 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-sky-400" />
            <span>Missions</span>
          </button>

          <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-sky-400">
              <Radio className="h-3.5 w-3.5" />
              <span>Level 2</span>
            </div>
            <h1 className="mt-1 text-xl font-black tracking-[0.12em] text-white sm:text-2xl">
              MESSAGE OF EARTH
            </h1>
            <p className="mt-0.5 text-xs tracking-wider text-slate-300">
              Voyager 1 • Deep Interstellar Space (1977)
            </p>
          </div>
        </div>
      </header>

      {/* Center Loading / Error State */}
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-sky-400/30 bg-black/75 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200 backdrop-blur-md">
            <span className="h-2.5 w-2.5 animate-ping rounded-full bg-sky-400" />
            <span>Loading Voyager 1 3D Model...</span>
          </div>
        </div>
      )}

      {loadError && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
          <div className="rounded-2xl border border-rose-500/40 bg-black/85 px-6 py-4 text-center text-sm text-rose-200 backdrop-blur-md">
            {loadError}
          </div>
        </div>
      )}

      {/* Minimal Bottom Camera Controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-4 py-2 text-[11px] text-slate-300 backdrop-blur-md">
          <span className="hidden sm:inline tracking-wide text-slate-400">
            Drag to orbit · Scroll to zoom
          </span>
          <span className="hidden sm:inline text-white/20">|</span>
          <button
            type="button"
            onClick={() => {
              gameAudio.playClick();
              setIsAutoRotate((prev) => !prev);
            }}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-sky-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            {isAutoRotate ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isAutoRotate ? 'Pause Orbit' : 'Auto Orbit'}</span>
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Center</span>
          </button>
        </div>
      </div>
    </div>
  );
}

