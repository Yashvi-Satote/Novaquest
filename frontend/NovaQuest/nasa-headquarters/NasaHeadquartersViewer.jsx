import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createNasaHeadquarters } from './NasaHeadquartersModel';

/**
 * NasaHeadquartersViewer
 *
 * Reusable three.js viewport for the NASA Headquarters base. The camera lives
 * inside the circular room and orbits the command dais, so only the interior
 * ever needs to be modelled. A sci-fi blast door on the wall leads "outside";
 * it can be clicked, opened with the D key, or controlled via the imperative
 * handle (toggleDoor / openDoor / closeDoor).
 */
const NasaHeadquartersViewer = forwardRef(function NasaHeadquartersViewer({ className = '' }, ref) {
  const mountRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const doorHolderRef = useRef(null);

  useImperativeHandle(ref, () => ({
    toggleDoor: () => doorHolderRef.current && doorHolderRef.current.toggle(),
    openDoor: () => doorHolderRef.current && doorHolderRef.current.setOpen(true),
    closeDoor: () => doorHolderRef.current && doorHolderRef.current.setOpen(false),
  }));

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

    // --- Blast door control -------------------------------------------------
    const setDoorState = (open) => {
      headquarters.door.setOpen(open);
      setDoorOpen(open);
    };
    const doorControl = {
      toggle: () => setDoorState(!headquarters.door.isOpen()),
      setOpen: (open) => setDoorState(open),
    };
    doorHolderRef.current = doorControl;

    const handleKeyDown = (event) => {
      if (event.key === 'd' || event.key === 'D') {
        doorControl.toggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

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

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = null;
    const updatePointerPosition = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    };
    const isOverDoor = (event) => {
      updatePointerPosition(event);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObject(headquarters.doorHitTarget).length > 0;
    };
    const handlePointerDown = (event) => {
      if (event.button !== 0) return;
      pointerDown = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    };
    const handlePointerUp = (event) => {
      if (!pointerDown || event.pointerId !== pointerDown.pointerId) return;
      const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
      pointerDown = null;
      if (event.button === 0 && distance < 6 && isOverDoor(event)) {
        doorControl.toggle();
      }
    };
    const handlePointerCancel = () => {
      pointerDown = null;
    };
    const handlePointerMove = (event) => {
      renderer.domElement.style.cursor = isOverDoor(event) ? 'pointer' : '';
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointercancel', handlePointerCancel);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

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
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointercancel', handlePointerCancel);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);

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

      {!webglFailed && (
        <button
          type="button"
          onClick={() => doorHolderRef.current && doorHolderRef.current.toggle()}
          aria-pressed={doorOpen}
          className="absolute right-4 top-24 z-30 rounded-lg border border-[#7fe3ff]/35 bg-[#071426]/85 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9cd8f2] shadow-[0_0_20px_rgba(61,107,255,0.18)] backdrop-blur-md transition-colors hover:border-[#7fe3ff]/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
        >
          {doorOpen ? 'Close airlock · Click / D' : 'Open airlock · Click / D'}
        </button>
      )}
    </div>
  );
});

export default NasaHeadquartersViewer;
