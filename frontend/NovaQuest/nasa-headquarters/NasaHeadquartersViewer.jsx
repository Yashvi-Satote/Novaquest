import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createNasaHeadquarters } from './NasaHeadquartersModel';

/**
 * NasaHeadquartersViewer
 *
 * Reusable three.js viewport for the NASA Headquarters base. The camera lives
 * inside the circular room and orbits the command dais, so only the interior
 * ever needs to be modelled.
 */
export default function NasaHeadquartersViewer({ className = '' }) {
  const mountRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    let disposed = false;
    let frameId = null;
    let hasRendered = false;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030811, 0.012);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 80);
    const startAngle = Math.PI / 8;
    camera.position.set(Math.sin(startAngle) * 9.3, 4.9, Math.cos(startAngle) * 9.3);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // Soft studio reflections make the brushed floor and consoles read cleanly.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentScene = new RoomEnvironment();
    const environmentTexture = pmrem.fromScene(environmentScene, 0.04).texture;
    scene.environment = environmentTexture;
    scene.environmentIntensity = 0.3;
    if (typeof environmentScene.dispose === 'function') environmentScene.dispose();
    pmrem.dispose();

    const headquarters = createNasaHeadquarters();
    scene.add(headquarters.root);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.minDistance = 5.2;
    controls.maxDistance = 11.1;
    controls.minPolarAngle = 1.12;
    controls.maxPolarAngle = 1.62;
    controls.target.set(0, 2.9, 0);
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.65;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotate = !prefersReducedMotion;
    controls.autoRotateSpeed = 0.32;
    controls.update();

    // The first deliberate drag hands control to the visitor.
    const stopAutoRotate = () => {
      controls.autoRotate = false;
    };
    controls.addEventListener('start', stopAutoRotate);

    const clock = new THREE.Clock();

    const renderFrame = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      headquarters.update(delta, elapsed);
      controls.update();
      renderer.render(scene, camera);

      if (!hasRendered && !disposed) {
        hasRendered = true;
        setReady(true);
      }
    };

    const tick = () => {
      if (disposed) return;
      frameId = requestAnimationFrame(tick);
      renderFrame();
    };

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const handleVisibility = () => {
      if (document.hidden) {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = null;
      } else if (!disposed && frameId === null) {
        clock.getDelta();
        frameId = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    tick();

    return () => {
      disposed = true;
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      controls.removeEventListener('start', stopAutoRotate);
      controls.dispose();

      scene.remove(headquarters.root);
      headquarters.dispose();

      scene.environment = null;
      environmentTexture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={mountRef} className={`relative h-full w-full overflow-hidden bg-[#030811] ${className}`}>
      <div
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#030811] transition-opacity duration-700 ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden={ready}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full border border-[#4F79FF]/30" />
            <span className="h-9 w-9 animate-spin rounded-full border border-[#3D6BFF]/30 border-t-[#7fe3ff]" />
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-[#7fc9e8]">
            Establishing secure link
          </span>
        </div>
      </div>

      {webglFailed && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#030811] p-8 text-center">
          <p className="max-w-sm text-sm leading-relaxed text-slate-300">
            The 3D NASA Headquarters view needs WebGL, which is unavailable in this browser.
            Enable hardware acceleration and reload to step inside mission control.
          </p>
        </div>
      )}
    </div>
  );
}
