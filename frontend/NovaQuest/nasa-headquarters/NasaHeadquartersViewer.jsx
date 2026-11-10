import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createNasaHeadquarters } from './NasaHeadquartersModel';

const HEADQUARTERS_ROOM_RADIUS = 12.5;

/**
 * NasaHeadquartersViewer
 *
 * Reusable three.js viewport for the NASA Headquarters base, adjoining corridor,
 * and first-person exploration. The wall airlock can be clicked, opened with
 * the D key, or controlled via the imperative handle.
 */
const NasaHeadquartersViewer = forwardRef(function NasaHeadquartersViewer({ className = '' }, ref) {
  const mountRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [firstPersonMode, setFirstPersonMode] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const doorHolderRef = useRef(null);

  useImperativeHandle(ref, () => ({
    toggleDoor: () => doorHolderRef.current && doorHolderRef.current.toggle(),
    openDoor: () => doorHolderRef.current && doorHolderRef.current.setOpen(true),
    closeDoor: () => doorHolderRef.current && doorHolderRef.current.setOpen(false),
    toggleFirstPerson: () => doorHolderRef.current && doorHolderRef.current.toggleFirstPerson(),
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
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.zIndex = '0';
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

    const pointerControls = new PointerLockControls(camera, renderer.domElement);
    pointerControls.pointerSpeed = 0.75;
    pointerControls.minPolarAngle = 0.22;
    pointerControls.maxPolarAngle = Math.PI - 0.22;
    const orbitPosition = camera.position.clone();
    const orbitTarget = controls.target.clone();
    const movementKeys = new Set();
    const airlockAngle = Math.PI + Math.PI / 8;
    let firstPersonActive = false;
    let lookPointer = null;

    const enterFirstPerson = () => {
      if (firstPersonActive) {
        if (!pointerControls.isLocked) pointerControls.lock();
        return;
      }

      firstPersonActive = true;
      controls.enabled = false;
      controls.autoRotate = false;
      headquarters.character.visible = false;
      camera.position.copy(
        headquarters.corridor.root.localToWorld(new THREE.Vector3(0, 1.65, -7)),
      );
      camera.rotation.order = 'YXZ';
      camera.rotation.set(0, airlockAngle - Math.PI, 0);
      movementKeys.clear();
      setFirstPersonMode(true);
      pointerControls.lock();
    };

    const exitFirstPerson = () => {
      if (!firstPersonActive) return;
      firstPersonActive = false;
      pointerControls.unlock();
      movementKeys.clear();
      controls.enabled = true;
      camera.position.copy(orbitPosition);
      controls.target.copy(orbitTarget);
      controls.update();
      headquarters.character.visible = true;
      setFirstPersonMode(false);
      setPointerLocked(false);
    };

    const handlePointerLock = (event) => setPointerLocked(event.type === 'lock');
    pointerControls.addEventListener('lock', handlePointerLock);
    pointerControls.addEventListener('unlock', handlePointerLock);

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (firstPersonActive) {
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright', 'shift'].includes(key)) {
          event.preventDefault();
          movementKeys.add(key);
        } else if (key === 'e') {
          event.preventDefault();
          doorControl.toggle();
        }
      } else if ((key === 'd' || key === 'e') && !firstPersonActive) {
        doorControl.toggle();
      }
    };
    const handleKeyUp = (event) => movementKeys.delete(event.key.toLowerCase());
    const handleEscapeCapture = (event) => {
      if (event.key === 'Escape' && firstPersonActive) {
        event.stopImmediatePropagation();
        if (pointerControls.isLocked) pointerControls.unlock();
        else exitFirstPerson();
      }
    };
    document.addEventListener('keydown', handleEscapeCapture, true);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    doorHolderRef.current = {
      ...doorControl,
      toggleFirstPerson: () => {
        if (firstPersonActive) exitFirstPerson();
        else enterFirstPerson();
      },
      resumeFirstPerson: enterFirstPerson,
    };

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
      if (firstPersonActive && !pointerControls.isLocked) {
        lookPointer = { x: event.clientX, y: event.clientY };
      }
    };
    const handlePointerUp = (event) => {
      if (!pointerDown || event.pointerId !== pointerDown.pointerId) return;
      const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
      pointerDown = null;
      lookPointer = null;
      if (event.button === 0 && distance < 6 && isOverDoor(event)) {
        doorControl.toggle();
      }
    };
    const handlePointerCancel = () => {
      pointerDown = null;
      lookPointer = null;
    };
    const handlePointerMove = (event) => {
      if (firstPersonActive && !pointerControls.isLocked && lookPointer) {
        camera.rotation.y -= (event.clientX - lookPointer.x) * 0.003;
        camera.rotation.x = THREE.MathUtils.clamp(
          camera.rotation.x - (event.clientY - lookPointer.y) * 0.003,
          -Math.PI / 2 + 0.15,
          Math.PI / 2 - 0.15,
        );
        lookPointer.x = event.clientX;
        lookPointer.y = event.clientY;
      }
      renderer.domElement.style.cursor = isOverDoor(event) ? 'pointer' : '';
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointercancel', handlePointerCancel);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    const moveForward = new THREE.Vector3();
    const moveRight = new THREE.Vector3();
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

      if (firstPersonActive) {
        const forwardInput =
          Number(movementKeys.has('w') || movementKeys.has('arrowup')) -
          Number(movementKeys.has('s') || movementKeys.has('arrowdown'));
        const rightInput =
          Number(movementKeys.has('d') || movementKeys.has('arrowright')) -
          Number(movementKeys.has('a') || movementKeys.has('arrowleft'));
        const inputLength = Math.hypot(forwardInput, rightInput);

        if (inputLength > 0) {
          const speed = movementKeys.has('shift') ? 5 : 2.8;
          camera.getWorldDirection(moveForward);
          moveForward.y = 0;
          moveForward.normalize();
          moveRight.set(-moveForward.z, 0, moveForward.x);
          camera.position.addScaledVector(moveForward, (forwardInput / inputLength) * speed * delta);
          camera.position.addScaledVector(moveRight, (rightInput / inputLength) * speed * delta);

          const currentLocal = headquarters.corridor.root.worldToLocal(
            new THREE.Vector3(camera.position.x, 0, camera.position.z),
          );
          const nextLocal = headquarters.corridor.root.worldToLocal(
            new THREE.Vector3(camera.position.x, 0, camera.position.z),
          );
          const isOutside = currentLocal.z > 0.3;
          const canEnterCorridor =
            headquarters.door.isOpen() &&
            Math.abs(nextLocal.x) < 1.5 &&
            nextLocal.z > -1.05;

          if (isOutside) {
            const canReturnThroughAirlock =
              headquarters.door.isOpen() &&
              Math.abs(nextLocal.x) < 1.5 &&
              nextLocal.z < 0.3;
            nextLocal.x = THREE.MathUtils.clamp(
              nextLocal.x,
              canReturnThroughAirlock ? -1.5 : -3.32,
              canReturnThroughAirlock ? 1.5 : 3.32,
            );
            nextLocal.z = THREE.MathUtils.clamp(
              nextLocal.z,
              canReturnThroughAirlock ? -1.05 : 0.3,
              headquarters.corridor.length - 1,
            );
            const constrainedPosition = headquarters.corridor.root.localToWorld(nextLocal);
            camera.position.x = constrainedPosition.x;
            camera.position.z = constrainedPosition.z;
            if (canReturnThroughAirlock && nextLocal.z < -0.85) {
              const radius = Math.hypot(camera.position.x, camera.position.z);
              const maxRadius = HEADQUARTERS_ROOM_RADIUS - 0.9;
              if (radius > maxRadius) {
                const scale = maxRadius / radius;
                camera.position.x *= scale;
                camera.position.z *= scale;
              }
            }
          } else if (canEnterCorridor && nextLocal.z > 0.3) {
            nextLocal.x = THREE.MathUtils.clamp(nextLocal.x, -3.32, 3.32);
            nextLocal.z = Math.min(nextLocal.z, headquarters.corridor.length - 1);
            const constrainedPosition = headquarters.corridor.root.localToWorld(nextLocal);
            camera.position.x = constrainedPosition.x;
            camera.position.z = constrainedPosition.z;
          } else if (canEnterCorridor) {
            nextLocal.x = THREE.MathUtils.clamp(nextLocal.x, -1.5, 1.5);
            const constrainedPosition = headquarters.corridor.root.localToWorld(nextLocal);
            camera.position.x = constrainedPosition.x;
            camera.position.z = constrainedPosition.z;
          } else {
            const radius = Math.hypot(camera.position.x, camera.position.z);
            const maxRadius = HEADQUARTERS_ROOM_RADIUS - 0.9;
            if (radius > maxRadius) {
              const scale = maxRadius / radius;
              camera.position.x *= scale;
              camera.position.z *= scale;
            }
          }
        }
        camera.position.y = 1.65;
        const corridorPosition = headquarters.corridor.root.worldToLocal(
          new THREE.Vector3(camera.position.x, 0, camera.position.z),
        );
        scene.fog.density = corridorPosition.z > 0.3 ? 0.0035 : 0.012;
      }

      headquarters.update(delta, elapsed);
      if (!firstPersonActive) controls.update();
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
      pointerControls.removeEventListener('lock', handlePointerLock);
      pointerControls.removeEventListener('unlock', handlePointerLock);
      pointerControls.unlock();
      pointerControls.dispose();
      document.removeEventListener('keydown', handleEscapeCapture, true);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointercancel', handlePointerCancel);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);

      scene.remove(headquarters.root);
      headquarters.dispose();
      doorHolderRef.current = null;

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
        <>
          <div className="absolute right-4 top-24 z-30 flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => doorHolderRef.current && doorHolderRef.current.toggle()}
              aria-pressed={doorOpen}
              className="rounded-lg border border-[#7fe3ff]/35 bg-[#071426]/85 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9cd8f2] shadow-[0_0_20px_rgba(61,107,255,0.18)] backdrop-blur-md transition-colors hover:border-[#7fe3ff]/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
            >
              {doorOpen
                ? `Close airlock · Click / ${firstPersonMode ? 'E' : 'D'}`
                : `Open airlock · Click / ${firstPersonMode ? 'E' : 'D'}`}
            </button>
            <button
              type="button"
              onClick={() => doorHolderRef.current && doorHolderRef.current.toggleFirstPerson()}
              aria-pressed={firstPersonMode}
              className="rounded-lg border border-white/20 bg-[#071426]/85 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/85 shadow-[0_0_20px_rgba(61,107,255,0.14)] backdrop-blur-md transition-colors hover:border-[#7fe3ff]/65 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
            >
              {firstPersonMode ? 'Exit first person' : 'Enter first person'}
            </button>
            {firstPersonMode && !pointerLocked && (
              <button
                type="button"
                onClick={() => doorHolderRef.current && doorHolderRef.current.resumeFirstPerson()}
                className="rounded-lg border border-[#7fe3ff]/35 bg-[#071426]/85 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9cd8f2] backdrop-blur-md transition-colors hover:border-[#7fe3ff]/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
              >
                Resume controls
              </button>
            )}
          </div>
          {firstPersonMode && (
            <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#7fe3ff]/25 bg-[#071426]/80 px-4 py-2 text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-[#b8d8e8] backdrop-blur-md sm:text-[9px]">
              WASD move · Mouse look · Shift sprint · E airlock · Esc exit / release mouse
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default NasaHeadquartersViewer;
