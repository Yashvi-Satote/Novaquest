import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import {
  AlertTriangle,
  Box,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  EyeOff,
  Footprints,
  ListChecks,
  Lock,
  MousePointerClick,
  Package,
  PackageCheck,
  Rocket,
  RotateCcw,
  ShoppingCart,
  Target,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createNasaHeadquarters } from './NasaHeadquartersModel';
import FiringRoomScreen from './FiringRoomScreen';
import MissionProgressBar from './MissionProgressBar';
import { gameAudio } from '../config/gameAudio';
import {
  SURVEYOR5_CART_LIMIT,
  SURVEYOR5_MANIFEST,
  SURVEYOR5_MANIFEST_IDS,
  SURVEYOR5_MANIFEST_TOTAL,
} from './surveyor5Mission';
import { STORAGE_ROOM_COMPONENTS } from './storageRoomComponents';

const HEADQUARTERS_ROOM_RADIUS = 12.5;
const PLAYER_COLLISION_RADIUS = 0.34;
const PLAYER_COLLISION_HEIGHT = 1.82;
const PLAYER_WALK_SPEED = 4.6;
const PLAYER_SPRINT_SPEED = 8.4;
const TRACKPAD_LOOK_SENSITIVITY = 0.0032;

/**
 * NasaHeadquartersViewer
 *
 * Reusable three.js viewport for the NASA Headquarters base, adjoining corridor,
 * and first-person exploration. The wall airlock can be clicked, opened with
 * the E key (nearest door), or controlled via the imperative handle.
 *
 * It also runs the Surveyor 5 build mission: parts are collected from the
 * storage room, the central hologram materialises the lander once the manifest
 * is complete, and the firing-room console launches it.
 */
const NasaHeadquartersViewer = forwardRef(function NasaHeadquartersViewer(
  {
    className = '',
    manifestIds = SURVEYOR5_MANIFEST_IDS,
    collectedIds = [],
    cartIds = [],
    cartLimit = SURVEYOR5_CART_LIMIT,
    hologramConverted = false,
    hologramDisappeared = false,
    launchUnlocked = false,
    launchReady = false,
    task3Solved = false,
    missionSolved = false,
    launched = false,
    overlayOpen = false,
    onCollectPart,
    onDepositCart,
    onConvertHologram,
    onLaunchMission,
    onOpenTask,
    onOpenTask2,
    onOpenTask3,
    onMissionComplete,
    onTeleportToFiringRoom,
    onAutoCompleteTask,
    onEmergencyTriggered,
  },
  ref,
) {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [partListOpen, setPartListOpen] = useState(false);
  const [assemblyResult, setAssemblyResult] = useState(null);
  const [missionToast, setMissionToast] = useState(null);
  const [isFirstPerson, setIsFirstPerson] = useState(false);
  const [hasEnteredFirstPerson, setHasEnteredFirstPerson] = useState(false);
  const [isInFiringRoom, setIsInFiringRoom] = useState(false);
  const [firingRoomLaunchState, setFiringRoomLaunchState] = useState('standby');
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const inFiringRoomRef = useRef(false);
  const firingRoomScreenRef = useRef(null);
  const [countdownNumber, setCountdownNumber] = useState(null);
  const cameraShakeRef = useRef(0);
  const launchReadyRef = useRef(launchReady);
  const doorHolderRef = useRef(null);
  const selectedComponentRef = useRef(null);
  const headquartersRef = useRef(null);
  const assembleRef = useRef(null);
  const progressAnchorRef = useRef(null);
  const localOverlayOpenRef = useRef(false);
  const collectedIdsRef = useRef(new Set(collectedIds));
  const cartIdsRef = useRef([...cartIds]);
  const cartLimitRef = useRef(cartLimit);
  const manifestIdsRef = useRef(new Set(manifestIds));
  const hologramConvertedRef = useRef(hologramConverted);
  const hologramDisappearedRef = useRef(hologramDisappeared);
  const launchUnlockedRef = useRef(launchUnlocked);
  const missionSolvedRef = useRef(missionSolved);
  const launchedRef = useRef(launched);
  const overlayOpenRef = useRef(overlayOpen);
  const callbacksRef = useRef({});
  const toastTimerRef = useRef(null);

  useEffect(() => {
    selectedComponentRef.current = selectedComponent;
  }, [selectedComponent]);

  // Once the player has stepped into first-person mode, the centre prompt is
  // no longer needed for the rest of this headquarters visit.
  useEffect(() => {
    if (isFirstPerson) setHasEnteredFirstPerson(true);
  }, [isFirstPerson]);

  useEffect(() => {
    localOverlayOpenRef.current = partListOpen || Boolean(assemblyResult);
  }, [partListOpen, assemblyResult]);

  useEffect(() => {
    collectedIdsRef.current = new Set(collectedIds);
  }, [collectedIds]);

  useEffect(() => {
    cartIdsRef.current = [...cartIds];
  }, [cartIds]);

  useEffect(() => {
    cartLimitRef.current = cartLimit;
  }, [cartLimit]);

  useEffect(() => {
    manifestIdsRef.current = new Set(manifestIds);
  }, [manifestIds]);

  useEffect(() => {
    hologramConvertedRef.current = hologramConverted;
  }, [hologramConverted]);

  useEffect(() => {
    hologramDisappearedRef.current = hologramDisappeared;
  }, [hologramDisappeared]);

  useEffect(() => {
    launchUnlockedRef.current = launchUnlocked;
  }, [launchUnlocked]);

  useEffect(() => {
    launchReadyRef.current = launchReady;
  }, [launchReady]);

  useEffect(() => {
    missionSolvedRef.current = missionSolved;
  }, [missionSolved]);

  useEffect(() => {
    launchedRef.current = launched;
  }, [launched]);

  useEffect(() => {
    callbacksRef.current = {
      onCollectPart,
      onDepositCart,
      onConvertHologram,
      onLaunchMission,
      onOpenTask,
      onOpenTask2,
      onOpenTask3,
      onMissionComplete,
      onTeleportToFiringRoom,
      onAutoCompleteTask,
      onEmergencyTriggered,
    };
  }, [
    onCollectPart,
    onDepositCart,
    onConvertHologram,
    onLaunchMission,
    onOpenTask,
    onOpenTask2,
    onOpenTask3,
    onMissionComplete,
    onTeleportToFiringRoom,
    onAutoCompleteTask,
    onEmergencyTriggered,
  ]);

  useEffect(() => {
    overlayOpenRef.current = overlayOpen;
    if (overlayOpen) doorHolderRef.current?.pauseForOverlay?.();
  }, [overlayOpen]);

  const showMissionToast = useCallback((message, tone = 'info') => {
    setMissionToast({ message, tone, at: Date.now() });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setMissionToast(null), 4200);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );

  const handleAutoComplete = useCallback(() => {
    if (callbacksRef.current.onAutoCompleteTask) {
      callbacksRef.current.onAutoCompleteTask();
    }
  }, []);

  const cachedVideoTextureRef = useRef(null);

  const handleStartLaunchSequence = useCallback(() => {
    if (!launchReadyRef.current) {
      showMissionToast('Complete Task 1 first', 'warn');
      return;
    }
    if (firingRoomLaunchState !== 'standby') return;

    // Prime the video element immediately in the user interaction gesture to unlock browser media playback!
    const video = firingRoomScreenRef.current?.getVideoElement?.();
    if (video) {
      video.muted = true;
      video.volume = 0;
      try {
        video.currentTime = 71; // Part 2 liftoff start
        const p = video.play();
        if (p !== undefined) {
          p.then(() => {
            video.pause();
          }).catch(() => {});
        }
      } catch (e) {}
    }

    setFiringRoomLaunchState('countdown');
    setCountdownNumber(3);
    gameAudio.ensureUnlocked?.();
    gameAudio.playCountdownBeep?.(false);

    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNumber(count);
        gameAudio.playCountdownBeep?.(count === 1);
      } else {
        clearInterval(timer);
        setCountdownNumber('LIFTOFF');
        // Subtle camera shake + ambient audio swell at liftoff
        cameraShakeRef.current = 1.0;
        gameAudio.playThruster?.(3.8);
        showMissionToast('LIFTOFF! Pad 36B Atlas-Centaur AC-13 liftoff underway.', 'info');

        setTimeout(() => {
          setCountdownNumber(null);
          setFiringRoomLaunchState('launching');
          // Play Part 2 on the big 3D screen (1:11 -> HELIUM_T) with audio strictly muted
          const vid = firingRoomScreenRef.current?.getVideoElement?.();
          if (vid) {
            vid.muted = true;
            vid.volume = 0;
          }
          firingRoomScreenRef.current?.mute?.();
          firingRoomScreenRef.current?.playSegment?.('part2');
        }, 800);
      }
    }, 1000);
  }, [firingRoomLaunchState, showMissionToast]);

  const handleEmergencyAtHeliumT = useCallback(() => {
    setIsEmergencyActive(true);
    setFiringRoomLaunchState('emergency');
    headquartersRef.current?.corridor.firingRoom.setEmergency?.(true);
    showMissionToast(
      'WARNING: HELIUM LEAK DETECTED! Mission on hold.',
      'warning',
    );
    if (callbacksRef.current.onEmergencyTriggered) {
      callbacksRef.current.onEmergencyTriggered();
    }
  }, [showMissionToast]);

  const resolveEmergency = useCallback(() => {
    setIsEmergencyActive(false);
    headquartersRef.current?.corridor.firingRoom.setEmergency?.(false);
    setFiringRoomLaunchState('resolved');
    // Ensure video is muted and resumes Part 3 on the 3D screen, stopping 3s before end
    const vid = firingRoomScreenRef.current?.getVideoElement?.();
    if (vid) {
      vid.muted = true;
      vid.volume = 0;
    }
    firingRoomScreenRef.current?.mute?.();
    const dur = vid?.duration || 105.72;
    firingRoomScreenRef.current?.resume?.(Math.max(0, dur - 3));
    showMissionToast(
      'Emergency resolved! Resuming Surveyor 5 flight telemetry.',
      'success',
    );
  }, [showMissionToast]);

  const handleVideoSegmentEnd = useCallback((segment) => {
    if (segment === 'part3' || segment === 'ended') {
      if (callbacksRef.current.onMissionComplete) {
        callbacksRef.current.onMissionComplete();
      }
      showMissionToast('Surveyor 5 has landed on the Moon!', 'success');
    }
  }, [showMissionToast]);

  const handleVideoTextureReady = useCallback((texture) => {
    cachedVideoTextureRef.current = texture;
    headquartersRef.current?.corridor.firingRoom.setVideoTexture?.(texture);
  }, []);

  useImperativeHandle(ref, () => ({
    toggleDoor: () => doorHolderRef.current && doorHolderRef.current.toggle(),
    openDoor: () => doorHolderRef.current && doorHolderRef.current.setOpen(true),
    closeDoor: () => doorHolderRef.current && doorHolderRef.current.setOpen(false),
    toggleFirstPerson: () => doorHolderRef.current && doorHolderRef.current.toggleFirstPerson(),
    teleportToFiringRoom: () => {
      const vid = firingRoomScreenRef.current?.getVideoElement?.();
      if (vid) {
        vid.muted = true;
        vid.volume = 0;
      }
      firingRoomScreenRef.current?.mute?.();
      doorHolderRef.current && doorHolderRef.current.teleportToFiringRoom();
    },
    setEmergency: (active) => {
      setIsEmergencyActive(Boolean(active));
      headquartersRef.current?.corridor.firingRoom.setEmergency?.(active);
    },
    resolveEmergency,
    startLaunch: () => handleStartLaunchSequence(),
    showMissionToast: (msg, tone) => showMissionToast(msg, tone),
    autoCompleteSurveyor5: handleAutoComplete,
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
    cameraRef.current = camera;
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
    headquartersRef.current = headquarters;
    scene.add(headquarters.root);

    const activeVideoTex = cachedVideoTextureRef.current || firingRoomScreenRef.current?.getVideoTexture?.();
    if (activeVideoTex) {
      headquarters.corridor.firingRoom.setVideoTexture?.(activeVideoTex);
    }

    headquarters.corridor.firingRoom.setOnEmergencyTriggered?.(() => {
      gameAudio.playAlarm?.();
      showMissionToast(
        'CRITICAL IN-FLIGHT ANOMALY: Helium leak detected (280 PSI)! Improvise descent procedure.',
        'warning',
      );
      setIsEmergencyActive(true);
      setFiringRoomLaunchState('emergency');
      if (callbacksRef.current.onEmergencyTriggered) {
        callbacksRef.current.onEmergencyTriggered();
      }
    });
    const characterMeshes = new Set();
    headquarters.character.traverse((object) => characterMeshes.add(object));
    const collisionMeshes = [];
    headquarters.root.traverse((object) => {
      if (!object.isMesh || characterMeshes.has(object)) return;
      for (let ancestor = object; ancestor && ancestor !== headquarters.root; ancestor = ancestor.parent) {
        if (ancestor.userData.noCollision) return;
      }
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      if (materials.every((material) => material.colorWrite === false)) return;
      if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
      collisionMeshes.push(object);
    });

    // --- Blast door control -------------------------------------------------
    const setDoorState = (open) => {
      headquarters.door.setOpen(open);
    };
    const doorControl = {
      toggle: () => setDoorState(!headquarters.door.isOpen()),
      setOpen: (open) => setDoorState(open),
    };
    const setStorageDoorState = (open) => {
      headquarters.corridor.storageRoom.entryDoor.setOpen(open);
    };
    const storageDoorControl = {
      toggle: () =>
        setStorageDoorState(!headquarters.corridor.storageRoom.entryDoor.isOpen()),
    };
    const setFiringRoomDoorState = (open) => {
      headquarters.corridor.firingRoom.door.setOpen(open);
    };
    const firingRoomDoorControl = {
      toggle: () =>
        setFiringRoomDoorState(!headquarters.corridor.firingRoom.door.isOpen()),
    };

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.minDistance = 5.2;
    controls.maxDistance = 11.1;
    controls.minPolarAngle = 0.02;
    controls.maxPolarAngle = Math.PI - 0.02;
    controls.target.set(0, 2.9, 0);
    controls.rotateSpeed = 0.55;
    // Two-finger trackpad swipes drive the view instead of zooming.
    controls.enableZoom = false;

    const pointerControls = new PointerLockControls(camera, renderer.domElement);
    pointerControls.pointerSpeed = 0.75;
    pointerControls.minPolarAngle = 0.02;
    pointerControls.maxPolarAngle = Math.PI - 0.02;
    const orbitPosition = camera.position.clone();
    const orbitTarget = controls.target.clone();
    const characterCameraOffset = camera.position.clone().sub(controls.target);
    const movementKeys = new Set();
    const airlockAngle = headquarters.corridor.root.rotation.y;
    let firstPersonActive = false;
    let characterControlActive = false;
    let lookPointer = null;

    const enterFirstPerson = (lockPointer = false) => {
      if (firstPersonActive) {
        if (lockPointer && !pointerControls.isLocked) pointerControls.lock();
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
      // Keep the pointer unlocked so one-finger trackpad input always drives
      // the cursor. Mouse-look locking stays available from the HUD button.
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
    };

    const enterCharacterControl = () => {
      if (firstPersonActive) exitFirstPerson();
      characterControlActive = true;
      controls.enabled = true;
      controls.autoRotate = false;
      headquarters.character.visible = true;
      const characterPosition = headquarters.character.getWorldPosition(new THREE.Vector3());
      controls.target.set(characterPosition.x, 1.35, characterPosition.z);
      camera.position.copy(controls.target).add(characterCameraOffset);
      controls.update();
      movementKeys.clear();
    };

    const exitCharacterControl = () => {
      if (!characterControlActive) return;
      characterControlActive = false;
      movementKeys.clear();
      camera.position.copy(orbitPosition);
      controls.target.copy(orbitTarget);
      controls.update();
    };

    const toggleCharacterControl = () => {
      if (characterControlActive) exitCharacterControl();
      else enterCharacterControl();
    };

    // One key controls every door. The nearest door to the player (or the
    // orbit target when not exploring) is toggled.
    const nearestDoorCandidates = [
      { name: 'airlock', control: doorControl, target: headquarters.doorHitTarget },
      {
        name: 'parts room',
        control: storageDoorControl,
        target: headquarters.corridor.storageRoom.entryDoor.hitTarget,
      },
      {
        name: 'firing room',
        control: firingRoomDoorControl,
        target: headquarters.corridor.firingRoom.door.hitTarget,
      },
    ];
    const toggleNearestDoor = () => {
      const userPosition = new THREE.Vector3();
      if (characterControlActive) {
        headquarters.character.getWorldPosition(userPosition);
      } else {
        userPosition.copy(camera.position);
      }

      scene.updateMatrixWorld(true);
      const targetPosition = new THREE.Vector3();
      let nearest = null;
      let nearestDistance = Infinity;
      nearestDoorCandidates.forEach((candidate) => {
        candidate.target.getWorldPosition(targetPosition);
        const distance = Math.hypot(
          targetPosition.x - userPosition.x,
          targetPosition.z - userPosition.z,
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = candidate;
        }
      });

      if (nearest) nearest.control.toggle();
    };

    const handleKeyDown = (event) => {
      // Block key 3 strictly to prevent any auto-complete or mission bypass
      if (event.key === '3' || event.code === 'Digit3' || event.code === 'Numpad3') {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (overlayOpenRef.current || localOverlayOpenRef.current) return;
      if (selectedComponentRef.current) return;
      const key = event.key.toLowerCase();
      if (!event.repeat && key === 'c') {
        event.preventDefault();
        toggleCharacterControl();
        return;
      }
      if (!event.repeat && (key === 'v' || key === 'f')) {
        event.preventDefault();
        if (firstPersonActive) {
          exitFirstPerson();
          setIsFirstPerson(false);
        } else {
          if (characterControlActive) exitCharacterControl();
          enterFirstPerson();
          setIsFirstPerson(true);
        }
        return;
      }
      if (firstPersonActive || characterControlActive) {
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright', 'shift'].includes(key)) {
          event.preventDefault();
          movementKeys.add(key);
        } else if (key === 'e') {
          event.preventDefault();
          if (!event.repeat) toggleNearestDoor();
        }
      } else if (key === 'e') {
        if (!event.repeat) toggleNearestDoor();
      }
    };
    const handleKeyUp = (event) => movementKeys.delete(event.key.toLowerCase());
    const handleEscapeCapture = (event) => {
      if (event.key !== 'Escape') return;
      if (overlayOpenRef.current) return;
      if (localOverlayOpenRef.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setPartListOpen(false);
        setAssemblyResult(null);
        return;
      }
      if (selectedComponentRef.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setSelectedComponent(null);
        return;
      }
      if (firstPersonActive || characterControlActive) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (firstPersonActive) {
          if (pointerControls.isLocked) pointerControls.unlock();
          else exitFirstPerson();
        } else {
          exitCharacterControl();
        }
      }
    };
    window.addEventListener('keydown', handleEscapeCapture, true);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    doorHolderRef.current = {
      ...doorControl,
      toggleFirstPerson: () => {
        if (characterControlActive) exitCharacterControl();
        if (firstPersonActive) {
          exitFirstPerson();
          setIsFirstPerson(false);
        } else {
          enterFirstPerson();
          setIsFirstPerson(true);
        }
      },
      toggleCharacterControl,
      toggleNearestDoor,
      resumeFirstPerson: () => enterFirstPerson(true),
      toggleStorageDoor: storageDoorControl.toggle,
      toggleFiringRoomDoor: firingRoomDoorControl.toggle,
      setEmergency: (active) => {
        headquarters.corridor.firingRoom.setEmergency?.(active);
        setIsEmergencyActive(Boolean(active));
        if (!active && firingRoomLaunchState === 'emergency') {
          setFiringRoomLaunchState('resolved');
        }
      },
      startLaunch: () => {
        headquarters.corridor.firingRoom.startLaunch?.();
        setFiringRoomLaunchState('launching');
      },
      teleportToFiringRoom: () => {
        headquarters.door.setOpen(true);
        headquarters.corridor.firingRoom.door.setOpen(true);
        const corridor = headquarters.corridor.root;
        const firingPos = corridor.localToWorld(new THREE.Vector3(2.4, 2.2, 58.8));
        const firingLook = corridor.localToWorld(new THREE.Vector3(-0.15, 3.85, 75.5));

        const dx = -0.15 - 2.4;
        const dz = 75.5 - 58.8;
        const dy = 3.85 - 2.2;
        const yawOffset = Math.atan2(dx, dz);
        const pitch = Math.atan2(dy, Math.hypot(dx, dz));

        const charPos = corridor.localToWorld(new THREE.Vector3(2.4, 0, 58.8));
        headquarters.character.position.copy(headquarters.root.worldToLocal(charPos));
        headquarters.character.rotation.y = airlockAngle;

        if (characterControlActive) {
          controls.target.copy(firingLook);
          camera.position.copy(firingPos);
          controls.update();
        } else {
          enterFirstPerson(false);
          setIsFirstPerson(true);
          camera.position.copy(firingPos);
          camera.rotation.order = 'YXZ';
          camera.rotation.set(pitch, airlockAngle + yawOffset + Math.PI, 0);
        }

        inFiringRoomRef.current = true;
        setIsInFiringRoom(true);
      },
      pauseForOverlay: () => {
        movementKeys.clear();
        if (pointerControls.isLocked) pointerControls.unlock();
      },
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const interactionTargets = headquarters.interactionTargets.map((interaction) => {
      if (interaction.target === headquarters.corridor.storageRoom.entryDoor.hitTarget) {
        return { ...interaction, toggle: storageDoorControl.toggle };
      }
      if (interaction.target === headquarters.corridor.firingRoom.door.hitTarget) {
        return { ...interaction, toggle: firingRoomDoorControl.toggle };
      }
      return interaction;
    });
    let pointerDown = null;
    const updatePointerPosition = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    };
    const getAvailableInteractionTargets = () =>
      interactionTargets.filter(
        ({ component }) =>
          !component ||
          (!collectedIdsRef.current.has(component.id) &&
            !cartIdsRef.current.includes(component.id)),
      );
    const getInteractionAtPointer = (event) => {
      updatePointerPosition(event);
      raycaster.setFromCamera(pointer, camera);
      const targets = getAvailableInteractionTargets();
      const hit = raycaster.intersectObjects(
        targets.map(({ target }) => target),
        false,
      )[0];
      return hit
        ? targets.find(({ target }) => target === hit.object) || null
        : null;
    };
    const handlePointerDown = (event) => {
      if (overlayOpenRef.current || localOverlayOpenRef.current || event.button !== 0) return;
      pointerDown = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
      if (firstPersonActive && !pointerControls.isLocked) {
        lookPointer = { x: event.clientX, y: event.clientY };
      }
    };
    const handlePointerUp = (event) => {
      if (overlayOpenRef.current || localOverlayOpenRef.current) return;
      if (!pointerDown || event.pointerId !== pointerDown.pointerId) return;
      const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
      pointerDown = null;
      lookPointer = null;
      if (event.button !== 0 || distance >= 6) return;

      const interaction = getInteractionAtPointer(event);
      if (!interaction) return;

      if (interaction.component) {
        if (firstPersonActive && pointerControls.isLocked) pointerControls.unlock();
        setSelectedComponent(interaction.component);
        return;
      }

      if (interaction.toggle) {
        interaction.toggle();
        return;
      }

      if (interaction.action === 'hologram') {
        if (firstPersonActive && pointerControls.isLocked) pointerControls.unlock();
        const manifest = Array.from(manifestIdsRef.current);
        const installedCount = manifest.filter((id) => collectedIdsRef.current.has(id)).length;
        const cart = cartIdsRef.current;
        const missing = Math.max(0, manifest.length - installedCount - cart.length);

        if (hologramDisappearedRef.current) {
          showMissionToast('Surveyor 5 has been sent to the launch room. Go to the firing room!', 'info');
          if (callbacksRef.current.onOpenTask2) callbacksRef.current.onOpenTask2();
          return;
        }

        if (hologramConvertedRef.current) {
          showMissionToast('Surveyor 5 is already materialised. Head to the firing room.', 'info');
        } else if (cart.length > 0) {
          assembleRef.current?.();
        } else if (missing > 0) {
          showMissionToast(
            `Hologram unstable — ${missing} manifest part${missing === 1 ? '' : 's'} not installed yet.`,
            'warn',
          );
        } else {
          callbacksRef.current.onConvertHologram?.();
          showMissionToast('Manifest complete. Surveyor 5 is materialising!', 'success');
        }
        return;
      }

      if (interaction.action === 'launch') {
        if (firstPersonActive && pointerControls.isLocked) pointerControls.unlock();
        if (!launchReadyRef.current) {
          showMissionToast('Complete Task 1 first to unlock the launch console.', 'warn');
          return;
        }
        if (isEmergencyActive) {
          callbacksRef.current.onOpenTask3?.();
          return;
        }
        if (firingRoomLaunchState === 'standby') {
          handleStartLaunchSequence();
          return;
        }
        if (firingRoomLaunchState === 'launching' || firingRoomLaunchState === 'countdown') {
          showMissionToast('Launch sequence in progress — watch the big screen!', 'info');
          return;
        }
        if (!hologramConvertedRef.current) {
          showMissionToast(
            'Launch console locked — materialise Surveyor 5 in mission control first.',
            'warn',
          );
        } else if (!missionSolvedRef.current) {
          showMissionToast(
            'Mark the mission solved from the task page to begin the launch phase.',
            'warn',
          );
          callbacksRef.current.onOpenTask?.();
        } else if (launchedRef.current) {
          showMissionToast('Surveyor 5 has already left the pad.', 'info');
        } else {
          callbacksRef.current.onLaunchMission?.();
          showMissionToast('Launch sequence engaged. Surveyor 5 is on its way!', 'success');
        }
      }
    };
    const handlePointerCancel = () => {
      pointerDown = null;
      lookPointer = null;
    };
    const handlePointerMove = (event) => {
      if (overlayOpenRef.current || localOverlayOpenRef.current) return;
      if (firstPersonActive && !pointerControls.isLocked && lookPointer) {
        camera.rotation.y -= (event.clientX - lookPointer.x) * 0.003;
        camera.rotation.x = THREE.MathUtils.clamp(
          camera.rotation.x - (event.clientY - lookPointer.y) * 0.003,
          -Math.PI / 2 + 0.02,
          Math.PI / 2 - 0.02,
        );
        lookPointer.x = event.clientX;
        lookPointer.y = event.clientY;
      }
      renderer.domElement.style.cursor = getInteractionAtPointer(event) ? 'pointer' : '';
    };

    // A two-finger trackpad swipe arrives as a wheel event. Use it to look
    // around in first person and to orbit around the target in every other
    // view. One-finger trackpad input is left untouched so the cursor works.
    const trackpadOffset = new THREE.Vector3();
    const trackpadSpherical = new THREE.Spherical();
    const handleWheel = (event) => {
      if (overlayOpenRef.current || localOverlayOpenRef.current || selectedComponentRef.current) return;
      const deltaMultiplier =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1;
      const deltaX = event.deltaX * deltaMultiplier;
      const deltaY = event.deltaY * deltaMultiplier;
      if (deltaX === 0 && deltaY === 0) return;

      event.preventDefault();
      controls.autoRotate = false;

      if (firstPersonActive) {
        camera.rotation.order = 'YXZ';
        camera.rotation.y += deltaX * TRACKPAD_LOOK_SENSITIVITY;
        camera.rotation.x = THREE.MathUtils.clamp(
          camera.rotation.x + deltaY * TRACKPAD_LOOK_SENSITIVITY,
          -Math.PI / 2 + 0.02,
          Math.PI / 2 - 0.02,
        );
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

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointercancel', handlePointerCancel);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    const moveForward = new THREE.Vector3();
    const moveRight = new THREE.Vector3();
    const movementRaycaster = new THREE.Raycaster();
    const movementRayOrigin = new THREE.Vector3();
    const movementRayDirection = new THREE.Vector3();
    const movementCollisionOffsets = [-PLAYER_COLLISION_RADIUS * 0.72, 0, PLAYER_COLLISION_RADIUS * 0.72];
    const movementCollisionHeights = [0.35, 0.95, 1.25, 1.55];
    const moveCharacter = (delta) => {
      const forwardInput =
        Number(movementKeys.has('w') || movementKeys.has('arrowup')) -
        Number(movementKeys.has('s') || movementKeys.has('arrowdown'));
      const rightInput =
        Number(movementKeys.has('d') || movementKeys.has('arrowright')) -
        Number(movementKeys.has('a') || movementKeys.has('arrowleft'));
      const inputLength = Math.hypot(forwardInput, rightInput);
      if (inputLength === 0) return;

      const character = headquarters.character;
      const previousPosition = character.getWorldPosition(new THREE.Vector3());
      camera.getWorldDirection(moveForward);
      moveForward.y = 0;
      moveForward.normalize();
      moveRight.set(-moveForward.z, 0, moveForward.x);
      const speed = movementKeys.has('shift') ? PLAYER_SPRINT_SPEED : PLAYER_WALK_SPEED;
      const nextPosition = previousPosition.clone()
        .addScaledVector(moveForward, (forwardInput / inputLength) * speed * delta)
        .addScaledVector(moveRight, (rightInput / inputLength) * speed * delta);

      const corridor = headquarters.corridor.root;
      const currentLocal = corridor.worldToLocal(previousPosition.clone());
      const nextLocal = corridor.worldToLocal(nextPosition.clone());
      const isOutside = currentLocal.z > 0.3;
      const canEnterCorridor =
        headquarters.door.isOpen() &&
        Math.abs(nextLocal.x) < 1.5 &&
        nextLocal.z > -1.05;
      const firingRoom = headquarters.corridor.firingRoom;
      const isInFiringRoom = currentLocal.z > firingRoom.entryZ + 0.3;
      const alignsWithFiringRoomDoor =
        Math.abs(nextLocal.x) < firingRoom.openingHalfWidth - 0.35;
      const canEnterFiringRoom =
        firingRoom.door.isOpen() &&
        alignsWithFiringRoomDoor &&
        nextLocal.z > firingRoom.entryZ - 1.05;
      const storage = headquarters.corridor.storageRoom;
      const storageMinX = storage.corridorX - storage.depth + 0.65;
      const storageMinZ = storage.entryZ - storage.halfWidth + 0.65;
      const storageMaxZ = storage.entryZ + storage.halfWidth - 0.65;
      const alignsWithStorageDoor =
        Math.abs(nextLocal.z - storage.entryZ) < storage.openingHalfWidth - 0.35;
      const isInStorageRoom =
        currentLocal.x < storage.corridorX - 0.3 &&
        currentLocal.x > storageMinX &&
        currentLocal.z > storageMinZ &&
        currentLocal.z < storageMaxZ;
      const canEnterStorage =
        storage.entryDoor.isOpen() &&
        alignsWithStorageDoor &&
        nextLocal.x < storage.corridorX + 1.25 &&
        nextLocal.x > storageMinX;

      if (isInFiringRoom || canEnterFiringRoom) {
        nextLocal.x = THREE.MathUtils.clamp(
          nextLocal.x,
          -firingRoom.halfWidth + 0.65,
          firingRoom.halfWidth - 0.65,
        );
        nextLocal.z = THREE.MathUtils.clamp(
          nextLocal.z,
          firingRoom.door.isOpen() ? firingRoom.entryZ - 1.05 : firingRoom.entryZ + 0.35,
          firingRoom.entryZ + firingRoom.depth - 0.8,
        );
      } else if (isInStorageRoom || canEnterStorage) {
        const canCrossStorageThreshold = storage.entryDoor.isOpen() && alignsWithStorageDoor;
        nextLocal.x = THREE.MathUtils.clamp(
          nextLocal.x,
          storageMinX,
          canCrossStorageThreshold ? 3.32 : storage.corridorX - 0.4,
        );
        nextLocal.z = THREE.MathUtils.clamp(nextLocal.z, storageMinZ, storageMaxZ);
        if (nextLocal.x > storage.corridorX - 0.4 && nextLocal.x < storage.corridorX + 0.4) {
          nextLocal.z = THREE.MathUtils.clamp(
            nextLocal.z,
            storage.entryZ - storage.openingHalfWidth + 0.25,
            storage.entryZ + storage.openingHalfWidth - 0.25,
          );
        }
      } else if (isOutside) {
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
      } else if (canEnterCorridor && nextLocal.z > 0.3) {
        nextLocal.x = THREE.MathUtils.clamp(nextLocal.x, -3.32, 3.32);
        nextLocal.z = Math.min(nextLocal.z, headquarters.corridor.length - 1);
      } else if (canEnterCorridor) {
        nextLocal.x = THREE.MathUtils.clamp(nextLocal.x, -1.5, 1.5);
      } else {
        const radius = Math.hypot(nextPosition.x, nextPosition.z);
        const maxRadius = HEADQUARTERS_ROOM_RADIUS - 0.9;
        if (radius > maxRadius) {
          nextPosition.x *= maxRadius / radius;
          nextPosition.z *= maxRadius / radius;
          nextLocal.copy(corridor.worldToLocal(nextPosition.clone()));
        }
      }

      nextPosition.copy(corridor.localToWorld(nextLocal));
      scene.updateMatrixWorld(true);
      const collisionBoxes = [];
      const collisionBox = new THREE.Box3();
      for (const mesh of collisionMeshes) {
        if (!mesh.visible) continue;
        collisionBox.setFromObject(mesh);
        if (
          collisionBox.max.y <= 0.05 ||
          collisionBox.min.y >= PLAYER_COLLISION_HEIGHT ||
          collisionBox.max.x < Math.min(previousPosition.x, nextPosition.x) - PLAYER_COLLISION_RADIUS ||
          collisionBox.min.x > Math.max(previousPosition.x, nextPosition.x) + PLAYER_COLLISION_RADIUS ||
          collisionBox.max.z < Math.min(previousPosition.z, nextPosition.z) - PLAYER_COLLISION_RADIUS ||
          collisionBox.min.z > Math.max(previousPosition.z, nextPosition.z) + PLAYER_COLLISION_RADIUS
        ) {
          continue;
        }
        collisionBoxes.push({ mesh, box: collisionBox.clone() });
      }

      const collidesBetween = (fromX, fromZ, toX, toZ) => {
        const deltaX = toX - fromX;
        const deltaZ = toZ - fromZ;
        const distance = Math.hypot(deltaX, deltaZ);
        if (distance < 1e-5) return false;
        movementRayDirection.set(deltaX / distance, 0, deltaZ / distance);
        movementRaycaster.far = distance + PLAYER_COLLISION_RADIUS;
        const candidates = collisionBoxes
          .filter(({ box }) =>
            box.max.x >= Math.min(fromX, toX) - PLAYER_COLLISION_RADIUS &&
            box.min.x <= Math.max(fromX, toX) + PLAYER_COLLISION_RADIUS &&
            box.max.z >= Math.min(fromZ, toZ) - PLAYER_COLLISION_RADIUS &&
            box.min.z <= Math.max(fromZ, toZ) + PLAYER_COLLISION_RADIUS,
          )
          .map(({ mesh }) => mesh);
        for (const height of movementCollisionHeights) {
          for (const offset of movementCollisionOffsets) {
            movementRayOrigin.set(
              fromX + (Math.abs(deltaX) > 0 ? 0 : offset),
              height,
              fromZ + (Math.abs(deltaZ) > 0 ? 0 : offset),
            );
            movementRaycaster.set(movementRayOrigin, movementRayDirection);
            const hit = movementRaycaster.intersectObjects(candidates, false)[0];
            if (hit && hit.distance > 0.03 && hit.distance < distance + PLAYER_COLLISION_RADIUS) {
              return true;
            }
          }
        }
        return false;
      };

      const resolvedPosition = previousPosition.clone();
      const moveXFirst =
        Math.abs(nextPosition.x - previousPosition.x) >=
        Math.abs(nextPosition.z - previousPosition.z);
      const tryMoveX = () => {
        if (!collidesBetween(resolvedPosition.x, resolvedPosition.z, nextPosition.x, resolvedPosition.z)) {
          resolvedPosition.x = nextPosition.x;
        }
      };
      const tryMoveZ = () => {
        if (!collidesBetween(resolvedPosition.x, resolvedPosition.z, resolvedPosition.x, nextPosition.z)) {
          resolvedPosition.z = nextPosition.z;
        }
      };
      if (moveXFirst) {
        tryMoveX();
        tryMoveZ();
      } else {
        tryMoveZ();
        tryMoveX();
      }

      const appliedMovement = resolvedPosition.clone().sub(previousPosition);
      character.position.copy(headquarters.root.worldToLocal(resolvedPosition));
      if (appliedMovement.lengthSq() > 0) {
        character.rotation.y = Math.atan2(appliedMovement.x, appliedMovement.z);
        camera.position.add(appliedMovement);
        controls.target.add(appliedMovement);
      }
    };
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
    const progressAnchorWorld = new THREE.Vector3(0, 5.08, 0);
    const progressAnchorProjection = new THREE.Vector3();
    const progressAnchorCameraLocal = new THREE.Vector3();
    const progressAnchorCharacterLocal = new THREE.Vector3();

    // Keep the mission progress bar pinned above the Surveyor 5 hologram in
    // world space. It does not follow the camera, and it hides when the
    // hologram is behind the camera, off-screen, or far away in another room.
    const updateProgressAnchor = () => {
      const node = progressAnchorRef.current;
      if (!node) return;

      if (hologramDisappearedRef.current) {
        node.style.opacity = '0';
        node.style.visibility = 'hidden';
        return;
      }

      progressAnchorProjection.copy(progressAnchorWorld).project(camera);
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      const x = (progressAnchorProjection.x * 0.5 + 0.5) * width;
      const y = (-progressAnchorProjection.y * 0.5 + 0.5) * height;
      const inFront = progressAnchorProjection.z > -1 && progressAnchorProjection.z < 1;
      const distance = camera.position.distanceTo(progressAnchorWorld);

      let inMainRoom = true;
      if (firstPersonActive) {
        progressAnchorCameraLocal.copy(camera.position);
        inMainRoom = headquarters.corridor.root.worldToLocal(progressAnchorCameraLocal).z <= 0.3;
      } else if (characterControlActive) {
        progressAnchorCharacterLocal.copy(
          headquarters.character.getWorldPosition(new THREE.Vector3()),
        );
        inMainRoom = headquarters.corridor.root.worldToLocal(progressAnchorCharacterLocal).z <= 0.3;
      }

      const visible =
        inFront &&
        inMainRoom &&
        distance < 14 &&
        x > -80 &&
        x < width + 80 &&
        y > -20 &&
        y < height + 80;

      node.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
      node.style.opacity = visible ? '1' : '0';
      node.style.visibility = visible ? 'visible' : 'hidden';
    };

    const renderFrame = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      if (characterControlActive) moveCharacter(delta);
      if (firstPersonActive) {
        const forwardInput =
          Number(movementKeys.has('w') || movementKeys.has('arrowup')) -
          Number(movementKeys.has('s') || movementKeys.has('arrowdown'));
        const rightInput =
          Number(movementKeys.has('d') || movementKeys.has('arrowright')) -
          Number(movementKeys.has('a') || movementKeys.has('arrowleft'));
        const inputLength = Math.hypot(forwardInput, rightInput);

        if (inputLength > 0) {
          const speed = movementKeys.has('shift') ? PLAYER_SPRINT_SPEED : PLAYER_WALK_SPEED;
          const previousPosition = camera.position.clone();
          camera.getWorldDirection(moveForward);
          moveForward.y = 0;
          moveForward.normalize();
          moveRight.set(-moveForward.z, 0, moveForward.x);
          camera.position.addScaledVector(moveForward, (forwardInput / inputLength) * speed * delta);
          camera.position.addScaledVector(moveRight, (rightInput / inputLength) * speed * delta);

          const currentLocal = headquarters.corridor.root.worldToLocal(
            new THREE.Vector3(previousPosition.x, 0, previousPosition.z),
          );
          const nextLocal = headquarters.corridor.root.worldToLocal(
            new THREE.Vector3(camera.position.x, 0, camera.position.z),
          );
          const isOutside = currentLocal.z > 0.3;
          const canEnterCorridor =
            headquarters.door.isOpen() &&
            Math.abs(nextLocal.x) < 1.5 &&
            nextLocal.z > -1.05;
          const firingRoom = headquarters.corridor.firingRoom;
          const isInFiringRoom = currentLocal.z > firingRoom.entryZ + 0.3;
          const alignsWithFiringRoomDoor =
            Math.abs(nextLocal.x) < firingRoom.openingHalfWidth - 0.35;
          const canEnterFiringRoom =
            firingRoom.door.isOpen() &&
            alignsWithFiringRoomDoor &&
            nextLocal.z > firingRoom.entryZ - 1.05;
          const storage = headquarters.corridor.storageRoom;
          const storageMinX = storage.corridorX - storage.depth + 0.65;
          const storageMinZ = storage.entryZ - storage.halfWidth + 0.65;
          const storageMaxZ = storage.entryZ + storage.halfWidth - 0.65;
          const alignsWithStorageDoor =
            Math.abs(nextLocal.z - storage.entryZ) < storage.openingHalfWidth - 0.35;
          const isInStorageRoom =
            currentLocal.x < storage.corridorX - 0.3 &&
            currentLocal.x > storageMinX &&
            currentLocal.z > storageMinZ &&
            currentLocal.z < storageMaxZ;
          const canEnterStorage =
            storage.entryDoor.isOpen() &&
            alignsWithStorageDoor &&
            nextLocal.x < storage.corridorX + 1.25 &&
            nextLocal.x > storageMinX;
          const enteredStorageRoom =
            !isInStorageRoom &&
            canEnterStorage &&
            currentLocal.x >= storage.corridorX - 0.8 &&
            nextLocal.x < storage.corridorX - 0.8;
          const exitedStorageRoom =
            isInStorageRoom && nextLocal.x > storage.corridorX + 0.5;

          if (isInFiringRoom || canEnterFiringRoom) {
            nextLocal.x = THREE.MathUtils.clamp(
              nextLocal.x,
              -firingRoom.halfWidth + 0.65,
              firingRoom.halfWidth - 0.65,
            );
            nextLocal.z = THREE.MathUtils.clamp(
              nextLocal.z,
              firingRoom.door.isOpen() ? firingRoom.entryZ - 1.05 : firingRoom.entryZ + 0.35,
              firingRoom.entryZ + firingRoom.depth - 0.8,
            );
            const constrainedPosition = headquarters.corridor.root.localToWorld(nextLocal);
            camera.position.x = constrainedPosition.x;
            camera.position.z = constrainedPosition.z;
          } else if (isInStorageRoom || canEnterStorage) {
            const canCrossStorageThreshold =
              storage.entryDoor.isOpen() && alignsWithStorageDoor;
            nextLocal.x = THREE.MathUtils.clamp(
              nextLocal.x,
              storageMinX,
              canCrossStorageThreshold ? 3.32 : storage.corridorX - 0.4,
            );
            nextLocal.z = THREE.MathUtils.clamp(nextLocal.z, storageMinZ, storageMaxZ);
            if (
              nextLocal.x > storage.corridorX - 0.4 &&
              nextLocal.x < storage.corridorX + 0.4
            ) {
              nextLocal.z = THREE.MathUtils.clamp(
                nextLocal.z,
                storage.entryZ - storage.openingHalfWidth + 0.25,
                storage.entryZ + storage.openingHalfWidth - 0.25,
              );
            }
            const constrainedPosition = headquarters.corridor.root.localToWorld(nextLocal);
            camera.position.x = constrainedPosition.x;
            camera.position.z = constrainedPosition.z;
            if (enteredStorageRoom || exitedStorageRoom) {
              const lookTarget = nextLocal.clone();
              lookTarget.x += enteredStorageRoom ? -2 : 0;
              lookTarget.y = camera.position.y;
              lookTarget.z += enteredStorageRoom ? 0 : 2;
              camera.lookAt(headquarters.corridor.root.localToWorld(lookTarget));
            }
          } else if (isOutside) {
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

          scene.updateMatrixWorld(true);
          const collisionBoxes = [];
          const collisionBox = new THREE.Box3();
          const playerFoot = 0.05;
          const playerHead = PLAYER_COLLISION_HEIGHT;
          const minX = Math.min(previousPosition.x, camera.position.x) - PLAYER_COLLISION_RADIUS;
          const maxX = Math.max(previousPosition.x, camera.position.x) + PLAYER_COLLISION_RADIUS;
          const minZ = Math.min(previousPosition.z, camera.position.z) - PLAYER_COLLISION_RADIUS;
          const maxZ = Math.max(previousPosition.z, camera.position.z) + PLAYER_COLLISION_RADIUS;
          for (const mesh of collisionMeshes) {
            if (!mesh.visible) continue;
            collisionBox.setFromObject(mesh);
            if (
              collisionBox.max.y <= playerFoot ||
              collisionBox.min.y >= playerHead ||
              collisionBox.max.x < minX ||
              collisionBox.min.x > maxX ||
              collisionBox.max.z < minZ ||
              collisionBox.min.z > maxZ
            ) {
              continue;
            }
            collisionBoxes.push({ mesh, box: collisionBox.clone() });
          }

          const collidesBetween = (fromX, fromZ, toX, toZ) => {
            const deltaX = toX - fromX;
            const deltaZ = toZ - fromZ;
            const distance = Math.hypot(deltaX, deltaZ);
            if (distance < 1e-5) return false;
            movementRayDirection.set(deltaX / distance, 0, deltaZ / distance);
            movementRaycaster.far = distance + PLAYER_COLLISION_RADIUS;

            const candidates = collisionBoxes
              .filter(({ box }) =>
                box.max.x >= Math.min(fromX, toX) - PLAYER_COLLISION_RADIUS &&
                box.min.x <= Math.max(fromX, toX) + PLAYER_COLLISION_RADIUS &&
                box.max.z >= Math.min(fromZ, toZ) - PLAYER_COLLISION_RADIUS &&
                box.min.z <= Math.max(fromZ, toZ) + PLAYER_COLLISION_RADIUS,
              )
              .map(({ mesh }) => mesh);
            if (candidates.length === 0) return false;

            for (const height of movementCollisionHeights) {
              for (const offset of movementCollisionOffsets) {
                movementRayOrigin.set(
                  fromX + (Math.abs(deltaX) > 0 ? 0 : offset),
                  height,
                  fromZ + (Math.abs(deltaZ) > 0 ? 0 : offset),
                );
                movementRaycaster.set(movementRayOrigin, movementRayDirection);
                const hit = movementRaycaster.intersectObjects(candidates, false)[0];
                if (hit && hit.distance > 0.03 && hit.distance < distance + PLAYER_COLLISION_RADIUS) {
                  return true;
                }
              }
            }
            return false;
          };

          const targetX = camera.position.x;
          const targetZ = camera.position.z;
          camera.position.x = previousPosition.x;
          camera.position.z = previousPosition.z;
          const moveXFirst = Math.abs(targetX - previousPosition.x) >= Math.abs(targetZ - previousPosition.z);
          const tryMoveX = () => {
            if (!collidesBetween(camera.position.x, camera.position.z, targetX, camera.position.z)) {
              camera.position.x = targetX;
            }
          };
          const tryMoveZ = () => {
            if (!collidesBetween(camera.position.x, camera.position.z, camera.position.x, targetZ)) {
              camera.position.z = targetZ;
            }
          };
          if (moveXFirst) {
            tryMoveX();
            tryMoveZ();
          } else {
            tryMoveZ();
            tryMoveX();
          }
        }
        const corridorPosition = headquarters.corridor.root.worldToLocal(
          new THREE.Vector3(camera.position.x, 0, camera.position.z),
        );
        camera.position.y = corridorPosition.z >= 53 ? 2.2 : 1.65;
        scene.fog.density = corridorPosition.z > 0.3 ? 0.0035 : 0.012;
      }

      const playerWorld = characterControlActive
        ? headquarters.character.getWorldPosition(new THREE.Vector3())
        : camera.position;
      const currentCorridorPos = headquarters.corridor.root.worldToLocal(playerWorld.clone());
      const inFiring = currentCorridorPos.z >= 52.5;
      if (inFiringRoomRef.current !== inFiring) {
        inFiringRoomRef.current = inFiring;
        setIsInFiringRoom(inFiring);
        if (inFiring) {
          const vid = firingRoomScreenRef.current?.getVideoElement?.();
          if (vid) {
            vid.muted = true;
            vid.volume = 0;
          }
          firingRoomScreenRef.current?.mute?.();
        }
      }

      headquarters.update(delta, elapsed, renderer);
      if (!firstPersonActive) controls.update();

      if (cameraShakeRef.current > 0.005) {
        const shake = cameraShakeRef.current;
        camera.position.x += (Math.random() - 0.5) * 0.08 * shake;
        camera.position.y += (Math.random() - 0.5) * 0.06 * shake;
        cameraShakeRef.current *= Math.max(0, 1 - delta * 1.6);
      }

      renderer.render(scene, camera);
      updateProgressAnchor();

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
      pointerControls.unlock();
      pointerControls.dispose();
      window.removeEventListener('keydown', handleEscapeCapture, true);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointercancel', handlePointerCancel);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('wheel', handleWheel);

      scene.remove(headquarters.root);
      headquarters.dispose();
      headquartersRef.current = null;
      doorHolderRef.current = null;

      scene.environment = null;
      environmentTexture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [showMissionToast]);

  // Keep the 3D parts shelves in sync with installed parts and the cart.
  useEffect(() => {
    const headquarters = headquartersRef.current;
    if (!headquarters) return;
    const taken = new Set([...collectedIds, ...cartIds]);
    headquarters.corridor.storageRoom.componentSprites.forEach((sprite) => {
      const id = sprite.userData.component?.id;
      if (id) sprite.visible = !taken.has(id);
    });
  }, [collectedIds, cartIds, ready]);

  // Drive the hologram's "becomes real" transition from mission state.
  useEffect(() => {
    headquartersRef.current?.setHologramMaterialized(hologramConverted);
  }, [hologramConverted, ready]);

  // Drive the hologram's disappearance after unlocking launch.
  useEffect(() => {
    headquartersRef.current?.setHologramDisappeared(hologramDisappeared);
  }, [hologramDisappeared, ready]);

  const installedCount = SURVEYOR5_MANIFEST_IDS.filter((id) => collectedIds.includes(id)).length;
  const allPartsInstalled = installedCount >= SURVEYOR5_MANIFEST_TOTAL;
  const cartCount = cartIds.length;
  const cartIsFull = cartCount >= cartLimit;
  const cartManifestCount = cartIds.filter((id) => manifestIds.includes(id)).length;
  const remainingParts = Math.max(
    0,
    SURVEYOR5_MANIFEST_TOTAL - installedCount - cartManifestCount,
  );
  const collectedIdSet = new Set(collectedIds);
  const cartIdSet = new Set(cartIds);
  const componentById = new Map(
    STORAGE_ROOM_COMPONENTS.map((part) => [part.id, part]),
  );
  const missionProgress =
    (installedCount / Math.max(1, SURVEYOR5_MANIFEST_TOTAL)) * 100;
  const missionStageLabel = launched
    ? 'Mission complete'
    : missionSolved
      ? 'Launch phase active'
      : hologramConverted
        ? 'Next: solve mission'
      : allPartsInstalled
        ? 'Next: materialise hologram'
        : cartIsFull
          ? 'Cart full: unload at hologram'
          : cartCount > 0
            ? 'Next: collect or unload'
            : 'Next: parts storage room';

  /**
   * Verify the cart against the Surveyor 5 manifest. Manifest parts are
   * installed (and crossed off the list); all other parts are returned to the
   * storage room shelves and reported in the assembly result dialog.
   */
  const handleAssemble = useCallback(() => {
    if (cartIds.length === 0) return;
    const outcome = onDepositCart?.();
    if (!outcome) return;

    const componentById = new Map(
      STORAGE_ROOM_COMPONENTS.map((part) => [part.id, part]),
    );
    const resolveParts = (ids = []) =>
      ids.map((id) => componentById.get(id)).filter(Boolean);
    const installedParts = resolveParts(outcome.installedIds);
    const rejectedParts = resolveParts(outcome.rejectedIds);

    setPartListOpen(false);
    setSelectedComponent(null);
    setAssemblyResult({
      deposited: outcome.deposited ?? cartIds.length,
      installed: outcome.installed ?? installedParts.length,
      rejected: outcome.rejected ?? rejectedParts.length,
      installedParts,
      rejectedParts,
      remaining: Math.max(
        0,
        SURVEYOR5_MANIFEST_TOTAL - installedCount - installedParts.length,
      ),
      manifestComplete: Boolean(outcome.manifestComplete),
    });
  }, [cartIds, installedCount, onDepositCart]);

  useEffect(() => {
    assembleRef.current = handleAssemble;
  }, [handleAssemble]);

  const toastToneClass =
    missionToast?.tone === 'warn'
      ? 'border-[#ffc36b]/55 bg-[#2a1c06]/92 text-[#ffd79a]'
      : missionToast?.tone === 'success'
        ? 'border-[#5ee7ff]/55 bg-[#062c3f]/92 text-[#b9f4ff]'
        : 'border-[#7fe3ff]/35 bg-[#071426]/92 text-[#9cd8f2]';

  return (
    <div
      ref={mountRef}
      aria-busy={!ready && !webglFailed}
      className={`relative h-full w-full overflow-hidden bg-[#030811] ${className}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#030811] transition-opacity duration-700 ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden={ready}
      >
        <div
          className="flex flex-col items-center gap-4 text-center"
          role="status"
          aria-live="polite"
          aria-label="Loading NASA Headquarters"
        >
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-1 rounded-full bg-[#14d7df]/10 blur-md" />
            <svg
              aria-hidden="true"
              viewBox="0 0 40 40"
              className="relative h-12 w-12 animate-spin drop-shadow-[0_0_8px_rgba(20,215,223,0.65)] motion-reduce:animate-none"
            >
              <circle cx="20" cy="4" r="2.2" fill="#14d7df" />
              <circle cx="28" cy="6.1" r="2.1" fill="#14d7df" opacity=".92" />
              <circle cx="33.9" cy="12" r="2" fill="#14d7df" opacity=".84" />
              <circle cx="36" cy="20" r="1.9" fill="#14d7df" opacity=".76" />
              <circle cx="33.9" cy="28" r="1.8" fill="#14d7df" opacity=".68" />
              <circle cx="28" cy="33.9" r="1.7" fill="#14d7df" opacity=".6" />
              <circle cx="20" cy="36" r="1.6" fill="#14d7df" opacity=".52" />
              <circle cx="12" cy="33.9" r="1.5" fill="#14d7df" opacity=".44" />
              <circle cx="6.1" cy="28" r="1.4" fill="#14d7df" opacity=".36" />
              <circle cx="4" cy="20" r="1.3" fill="#14d7df" opacity=".28" />
              <circle cx="6.1" cy="12" r="1.2" fill="#14d7df" opacity=".2" />
              <circle cx="12" cy="6.1" r="1.1" fill="#14d7df" opacity=".12" />
            </svg>
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-[#14d7df]">
            Preparing mission control
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
          {/* Mission progress telemetry pinned above the Surveyor 5 hologram (hides when disappeared). */}
          {!hologramDisappeared && (
            <div
              ref={progressAnchorRef}
              className="pointer-events-none absolute left-0 top-0 z-30 hidden origin-bottom transition-opacity duration-200 will-change-transform sm:block"
              style={{ width: 'min(320px, 42vw)', opacity: 0 }}
            >
              <div className="rounded-xl border border-[#5ee7ff]/15 bg-[#020b14]/55 px-3 pb-1 pt-2 shadow-[0_0_30px_rgba(3,10,20,0.5)] backdrop-blur-[2px]">
                <MissionProgressBar
                  progress={missionProgress}
                  installed={installedCount}
                  total={SURVEYOR5_MANIFEST_TOTAL}
                />
              </div>
              {cartIsFull && !hologramConverted && (
                <div className="pointer-events-auto mx-auto mt-2 w-full animate-fade-in rounded-xl border border-[#7fe3ff]/55 bg-[#04182b]/94 px-2.5 py-2 shadow-[0_0_28px_rgba(47,123,255,0.35)] backdrop-blur-md">
                  <p className="flex items-center gap-1.5 text-[7px] font-bold uppercase tracking-[0.2em] text-[#ffd79a]">
                    <ShoppingCart className="h-2.5 w-2.5" aria-hidden="true" />
                    Cart full · {cartCount} / {cartLimit} parts
                  </p>
                  <p className="mt-0.5 text-[7px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-[#8fb8ce]">
                    Verify the load against the Surveyor 5 manifest
                  </p>
                  <button
                    type="button"
                    onClick={handleAssemble}
                    className="group mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#7fe3ff]/70 bg-gradient-to-r from-[#0b3f83] via-[#0d4c9a] to-[#0b356d] px-3 py-2 text-[8px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_22px_rgba(47,123,255,0.4)] transition-all hover:border-[#a8f0ff] hover:shadow-[0_0_32px_rgba(94,231,255,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                  >
                    <Wrench className="h-3.5 w-3.5 text-[#9df0ff] transition-transform group-hover:rotate-12" aria-hidden="true" />
                    Assemble parts
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sci-Fi Floating Action Button: Launch & Firing Room Control */}
          {launchUnlocked && (
            <div className="pointer-events-auto absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
              {!isInFiringRoom ? (
                <button
                  type="button"
                  onClick={() => {
                    doorHolderRef.current?.teleportToFiringRoom();
                  }}
                  className="group relative flex items-center gap-2.5 sm:gap-3 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full border border-[#00f0ff] bg-gradient-to-r from-[#031326]/95 via-[#062444]/95 to-[#031326]/95 text-[#e6faff] shadow-[0_0_30px_rgba(0,240,255,0.45)] backdrop-blur-md transition-all hover:scale-105 hover:border-[#8ef4ff] hover:shadow-[0_0_42px_rgba(0,240,255,0.7)] active:scale-95"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00f0ff] opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00f0ff]" />
                  </span>
                  <Rocket className="h-4 w-4 text-[#00f0ff] transition-transform group-hover:-rotate-12" />
                  <span className="text-[11px] sm:text-[13px] font-extrabold uppercase tracking-[0.22em] text-[#dffaff] group-hover:text-white">
                    Go to launch room
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-[#00f0ff]/20 text-[#8ef4ff] border border-[#00f0ff]/40">
                    TASK 2
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#00f0ff] transition-transform group-hover:translate-x-1" />
                </button>
              ) : isEmergencyActive ? (
                <button
                  type="button"
                  onClick={() => {
                    gameAudio.playClick();
                    doorHolderRef.current?.setEmergency(false);
                    setIsEmergencyActive(false);
                    setFiringRoomLaunchState('resolved');
                    gameAudio.playVictory?.();
                    showMissionToast(
                      'Anomaly resolved! Surveyor 5 lunar descent retro-burn executed successfully!',
                      'success',
                    );
                    callbacksRef.current.onLaunchMission?.();
                  }}
                  className="group relative flex items-center gap-2.5 sm:gap-3 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full border-2 border-[#ff3b4e] bg-gradient-to-r from-[#3f0910]/95 via-[#7a121e]/95 to-[#3f0910]/95 text-white shadow-[0_0_40px_rgba(255,59,78,0.85)] backdrop-blur-md transition-all hover:scale-105 hover:shadow-[0_0_55px_rgba(255,59,78,1)] active:scale-95 animate-pulse"
                >
                  <AlertTriangle className="h-4 w-4 text-[#ff808d] animate-bounce" />
                  <div className="text-left">
                    <span className="block text-[11px] sm:text-[13px] font-extrabold uppercase tracking-[0.22em] text-white">
                      Improvise New Descent Procedure (JPL)
                    </span>
                    <span className="block text-[7.5px] font-bold uppercase tracking-[0.16em] text-[#ffb3ba]">
                      Helium Tank Leak · Recalibrate Burn Parameters
                    </span>
                  </div>
                  <Wrench className="h-4 w-4 text-[#ffd1d6] transition-transform group-hover:rotate-45" />
                </button>
              ) : firingRoomLaunchState === 'standby' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!launchReadyRef.current) {
                      showMissionToast('Complete Task 1 first to unlock launch', 'warn');
                      return;
                    }
                    gameAudio.playClick();
                    handleStartLaunchSequence();
                  }}
                  className="group relative flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full border-2 border-[#00f0ff] bg-gradient-to-r from-[#03203f]/95 via-[#084880]/95 to-[#03203f]/95 text-[#e6faff] shadow-[0_0_36px_rgba(0,240,255,0.7)] backdrop-blur-md transition-all hover:scale-105 hover:border-[#8ef4ff] hover:shadow-[0_0_50px_rgba(0,240,255,0.95)] active:scale-95 ring-2 ring-[#00f0ff]/40"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00f0ff] opacity-90" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00f0ff]" />
                  </span>
                  <Rocket className="h-5 w-5 text-[#00f0ff] transition-transform group-hover:scale-110 group-hover:-rotate-12" />
                  <div className="text-left">
                    <span className="block text-[12px] sm:text-[14px] font-black uppercase tracking-[0.24em] text-white drop-shadow-[0_0_12px_rgba(0,240,255,0.8)]">
                      Start Launch Sequence
                    </span>
                    <span className="block text-[7.5px] font-bold uppercase tracking-[0.16em] text-[#8ef4ff]">
                      Pad 36B · Atlas-Centaur AC-13 · Surveyor 5
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#00f0ff] transition-transform group-hover:translate-x-1" />
                </button>
              ) : firingRoomLaunchState === 'resolved' ? (
                <div className="flex items-center gap-2.5 px-5 py-2 rounded-full border border-[#22c55e]/60 bg-[#042113]/90 text-[#86efac] shadow-[0_0_24px_rgba(34,197,94,0.4)] backdrop-blur-md">
                  <CheckCircle2 className="h-4 w-4 text-[#4ade80]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                    Surveyor 5 Touchdown Confirmed · Mare Tranquillitatis
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 px-5 py-2 rounded-full border border-[#00f0ff]/50 bg-[#03192f]/90 text-[#8ef4ff] shadow-[0_0_24px_rgba(0,240,255,0.35)] backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00f0ff] opacity-80" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00f0ff]" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#dffaff]">
                    Launch Sequence In Progress · Big Screen Live Feed
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Live mission tracker for the Surveyor 5 build. */}
          <div className="absolute left-4 top-24 z-30 hidden w-[186px] rounded-xl border border-[#7fe3ff]/30 bg-[#071426]/85 p-3 shadow-[0_0_24px_rgba(61,107,255,0.16)] backdrop-blur-md sm:block">
            <p className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#7fe3ff]">
              <Target className="h-3 w-3" aria-hidden="true" />
              Surveyor 5 task
            </p>
            <div className="mt-2 flex items-end justify-between gap-2">
              <span className="text-xl font-semibold leading-none text-white">
                {installedCount}
                <span className="text-[11px] text-[#6f9bb3]"> / {SURVEYOR5_MANIFEST_TOTAL}</span>
              </span>
              <span
                className={`text-[8px] font-semibold uppercase tracking-[0.18em] ${
                  allPartsInstalled ? 'text-[#7fe3ff]' : 'text-[#6f9bb3]'
                }`}
              >
                {allPartsInstalled ? 'Manifest ready' : 'Installed'}
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2f7bff] to-[#7fe3ff] transition-all duration-500"
                style={{ width: `${missionProgress}%` }}
              />
            </div>
            <div className="mt-2.5 rounded-md border border-[#7fe3ff]/20 bg-[#041325]/70 px-2.5 py-2">
              <div className="flex items-center justify-between text-[8px] font-semibold uppercase tracking-[0.16em]">
                <span className="inline-flex items-center gap-1.5 text-[#8be9ff]">
                  <ShoppingCart className="h-2.5 w-2.5" aria-hidden="true" />
                  Cart
                </span>
                <span className={cartIsFull ? 'text-[#ffc36b]' : 'text-[#8fb8ce]'}>
                  {cartCount} / {cartLimit}
                </span>
              </div>
              <div className="mt-1.5 grid grid-cols-5 gap-1">
                {Array.from({ length: cartLimit }).map((_, index) => (
                  <span
                    key={index}
                    className={`flex h-4 items-center justify-center rounded border ${
                      index < cartCount
                        ? 'border-[#7fe3ff]/60 bg-[#7fe3ff]/20 text-[#b9f4ff]'
                        : 'border-white/10 bg-white/[0.03] text-[#3d6f95]'
                    }`}
                  >
                    {index < cartCount ? (
                      <Package className="h-2.5 w-2.5" aria-hidden="true" />
                    ) : (
                      <span className="text-[7px] font-semibold">{index + 1}</span>
                    )}
                  </span>
                ))}
              </div>
              {cartIsFull && (
                <p className="mt-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-[#ffd79a]">
                  Cart full · unload at the hologram
                </p>
              )}
            </div>
            <p className="mt-2 text-[8px] font-semibold uppercase leading-relaxed tracking-[0.18em] text-[#9cd8f2]">
              {missionStageLabel}
            </p>
            {hologramConverted && !launched && !hologramDisappeared && (
              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#5ee7ff]">
                Hologram materialised
              </p>
            )}

            {launchUnlocked ? (
              <div className="mt-3 space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (!isInFiringRoom) {
                      doorHolderRef.current?.teleportToFiringRoom();
                    } else if (isEmergencyActive) {
                      gameAudio.playClick();
                      callbacksRef.current.onOpenTask3?.();
                    } else if (!launchReady) {
                      showMissionToast('Complete Task 1 first', 'warn');
                    } else if (firingRoomLaunchState === 'standby') {
                      gameAudio.playClick();
                      handleStartLaunchSequence();
                    } else {
                      onOpenTask2?.();
                    }
                  }}
                  title={isInFiringRoom && !launchReady ? 'Complete Task 1 first' : undefined}
                  className={`group relative flex w-full items-center justify-between overflow-hidden rounded-lg border p-2 text-left transition-all active:scale-95 ${
                    isEmergencyActive
                      ? 'border-[#ff3b4e] bg-gradient-to-r from-[#4d0b13] via-[#75111d] to-[#4d0b13] shadow-[0_0_24px_rgba(255,59,78,0.7)] animate-pulse'
                      : isInFiringRoom && !launchReady
                      ? 'border-slate-700 bg-slate-900/60 opacity-60 cursor-not-allowed'
                      : isInFiringRoom && firingRoomLaunchState === 'standby'
                      ? 'border-[#e8c684] bg-gradient-to-r from-[#1c1810] via-[#2d2414] to-[#1c1810] shadow-[0_0_24px_rgba(232,198,132,0.45)] hover:border-[#f5d085]'
                      : 'border-[#00f0ff] bg-gradient-to-r from-[#07243e] via-[#0c4371] to-[#07243e] shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:border-[#8ef4ff]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isEmergencyActive ? (
                      <AlertTriangle className="h-4 w-4 text-[#ff808d] animate-bounce" />
                    ) : isInFiringRoom && !launchReady ? (
                      <Lock className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Rocket className="h-4 w-4 text-[#e8c684] animate-pulse" />
                    )}
                    <div>
                      <span className="block text-[8.5px] font-black uppercase tracking-[0.18em] text-[#dcf9ff]">
                        {isEmergencyActive
                          ? 'WARNING: HELIUM LEAK'
                          : isInFiringRoom
                          ? 'START LAUNCH SEQUENCE'
                          : 'Go to launch room'}
                      </span>
                      <span className="block text-[6.5px] font-bold uppercase tracking-[0.14em] text-[#5ee7ff]">
                        {isEmergencyActive
                          ? 'Solve Task 3 · Rescue Plan'
                          : isInFiringRoom && !launchReady
                          ? 'PAD 36B · Locked (Complete Task 1 first)'
                          : isInFiringRoom && firingRoomLaunchState === 'standby'
                          ? 'PAD 36B - ATLAS-CENTAUR AC-13 - SURVEYOR 5'
                          : isInFiringRoom && firingRoomLaunchState === 'countdown'
                          ? 'Pad 36B · Countdown T-3'
                          : isInFiringRoom && firingRoomLaunchState === 'launching'
                          ? 'Pad 36B · In Flight (3D Feed)'
                          : isInFiringRoom && firingRoomLaunchState === 'resolved'
                          ? 'Surveyor 5 Landed'
                          : 'Task 2 · Flight Ops'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[#00f0ff] transition-transform group-hover:translate-x-0.5" />
                </button>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setPartListOpen(true)}
                    className="rounded border border-[#7fe3ff]/30 bg-[#0b2444]/60 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-[#9cd8f2] hover:text-white"
                  >
                    Manifest
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEmergencyActive) {
                        callbacksRef.current.onOpenTask3?.();
                      } else if (launchUnlocked) {
                        callbacksRef.current.onOpenTask2?.();
                      } else {
                        callbacksRef.current.onOpenTask?.();
                      }
                    }}
                    className="rounded border border-[#7fe3ff]/30 bg-[#0b2444]/60 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-[#9cd8f2] hover:text-white"
                  >
                    {isEmergencyActive ? 'Task 3' : launchUnlocked ? 'Task 2' : 'Task 1'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setPartListOpen(true);
                  }}
                  className="rounded-md border border-[#7fe3ff]/40 bg-[#0b2444]/80 px-1.5 py-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-[#b9ecff] transition-colors hover:border-[#7fe3ff]/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                >
                  See list
                </button>
                <button
                  type="button"
                  onClick={() => onOpenTask?.()}
                  className="rounded-md border border-[#7fe3ff]/40 bg-[#0b2444]/80 px-1.5 py-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-[#b9ecff] transition-colors hover:border-[#7fe3ff]/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                >
                  Open task page
                </button>
              </div>
            )}
          </div>
          <div className="absolute left-4 top-24 z-30 flex flex-wrap gap-2 sm:hidden">
            {launchUnlocked ? (
              <button
                type="button"
                onClick={() => onOpenTask2?.()}
                className="flex items-center gap-1.5 rounded-lg border border-[#00f0ff] bg-gradient-to-r from-[#08294a] to-[#0e487f] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#e6faff] shadow-[0_0_18px_rgba(0,240,255,0.4)]"
              >
                <Rocket className="h-3.5 w-3.5 text-[#00f0ff]" />
                Go to launch room
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setPartListOpen(true)}
                  className="rounded-lg border border-[#7fe3ff]/40 bg-[#071426]/85 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9cd8f2] backdrop-blur-md transition-colors hover:border-[#7fe3ff]/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                >
                  See list
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isEmergencyActive) {
                      callbacksRef.current.onOpenTask3?.();
                    } else if (launchUnlocked) {
                      callbacksRef.current.onOpenTask2?.();
                    } else {
                      callbacksRef.current.onOpenTask?.();
                    }
                  }}
                  className="rounded-lg border border-[#7fe3ff]/40 bg-[#071426]/85 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9cd8f2] backdrop-blur-md transition-colors hover:border-[#7fe3ff]/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                >
                  {isEmergencyActive ? 'Task 3' : launchUnlocked ? 'Task 2' : 'Task'}
                </button>
              </>
            )}
          </div>

          {missionToast && (
            <div
              className={`pointer-events-none absolute bottom-24 left-1/2 z-40 max-w-[92%] -translate-x-1/2 animate-fade-in rounded-lg border px-4 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.18em] shadow-[0_0_28px_rgba(61,107,255,0.22)] backdrop-blur-md ${toastToneClass}`}
              role="status"
            >
              {missionToast.message}
            </div>
          )}

          {/* ── In-Person Mode Entry Prompt ── */}
          {ready &&
            !hasEnteredFirstPerson &&
            !isFirstPerson &&
            !overlayOpen &&
            !partListOpen &&
            !assemblyResult && (
              <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-4">
                <button
                  type="button"
                  onClick={() => {
                    gameAudio.playClick();
                    doorHolderRef.current?.toggleFirstPerson();
                  }}
                  className="group pointer-events-auto relative flex animate-fade-in flex-col items-center gap-1 rounded-2xl border-2 border-[#00f0ff] bg-gradient-to-r from-[#031326]/95 via-[#062444]/95 to-[#031326]/95 px-6 py-3.5 text-center shadow-[0_0_38px_rgba(0,240,255,0.6)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#8ef4ff] hover:shadow-[0_0_55px_rgba(0,240,255,0.85)] active:scale-95 sm:px-10 sm:py-5"
                >
                  <span className="relative flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00f0ff] opacity-80" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00f0ff]" />
                    </span>
                    <Footprints className="h-5 w-5 text-[#00f0ff] transition-transform group-hover:-rotate-12 sm:h-6 sm:w-6" />
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#e6faff] drop-shadow-[0_0_12px_rgba(0,240,255,0.7)] group-hover:text-white sm:text-[15px] sm:tracking-[0.24em]">
                      Enter In-Person Mode
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#00f0ff] transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="relative text-[7.5px] font-bold uppercase tracking-[0.18em] text-[#8ef4ff] sm:text-[9px] sm:tracking-[0.22em]">
                    Step inside NASA Headquarters on foot · Press V
                  </span>
                </button>
              </div>
            )}

          {/* ── First-Person Mode HUD Button ── */}
          <button
            type="button"
            title={isFirstPerson ? 'Exit first-person mode (V / F)' : 'Enter first-person mode (V / F)'}
            onClick={() => doorHolderRef.current?.toggleFirstPerson()}
            className={`absolute bottom-6 right-4 z-30 flex items-center gap-1.5 rounded-full border px-3 py-2 text-[8px] font-bold uppercase tracking-[0.2em] backdrop-blur-md shadow-lg transition-all duration-300 active:scale-95 ${
              isFirstPerson
                ? 'border-[#5ee7ff] bg-[#071e36]/95 text-[#5ee7ff] shadow-[0_0_20px_rgba(94,231,255,0.45)] hover:border-[#9ef5ff] hover:shadow-[0_0_30px_rgba(94,231,255,0.65)]'
                : 'border-[#7fe3ff]/40 bg-[#071426]/90 text-[#9cd8f2] shadow-[0_0_12px_rgba(61,107,255,0.18)] hover:border-[#7fe3ff]/80 hover:text-white hover:shadow-[0_0_22px_rgba(94,231,255,0.35)]'
            }`}
          >
            {isFirstPerson ? (
              <EyeOff className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Eye className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{isFirstPerson ? 'Exit FP' : 'First Person'}</span>
            <kbd className="ml-0.5 rounded bg-white/10 px-1.5 py-0.5 text-[7px] font-mono text-[#7fe3ff]">V</kbd>
          </button>

          {partListOpen && (
            <div
              className="absolute inset-0 z-[55] flex items-center justify-center bg-[#02060d]/80 p-3 backdrop-blur-sm sm:p-6"
              role="presentation"
              onClick={(event) => {
                if (event.target === event.currentTarget) setPartListOpen(false);
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="surveyor5-parts-title"
                className="relative flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#7fe3ff]/40 bg-[#04101f]/[0.98] shadow-[0_24px_90px_rgba(0,0,0,0.7)]"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[#3b82f6]/30 bg-[#061b33]/85 px-4 py-3 sm:px-5">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.28em] text-[#7fe3ff]">
                      <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                      Surveyor 5 · Flight manifest
                    </p>
                    <h3
                      id="surveyor5-parts-title"
                      className="mt-1 text-lg font-semibold uppercase tracking-[0.14em] text-[#e6fbff] sm:text-xl"
                    >
                      Mission parts list
                    </h3>
                    <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#4f8cab]">
                      {installedCount} / {SURVEYOR5_MANIFEST_TOTAL} crossed off · Cart {cartCount} / {cartLimit}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPartListOpen(false)}
                    aria-label="Close parts list"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-[#bcd0e2] transition-colors hover:border-[#7fe3ff]/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3 sm:px-4">
                  {SURVEYOR5_MANIFEST.map((part, index) => {
                    const isInstalled = collectedIdSet.has(part.id);
                    const isInCart = cartIdSet.has(part.id);
                    return (
                      <div
                        key={part.id}
                        className={`flex items-start gap-2.5 rounded-lg border px-2.5 py-2 ${
                          isInstalled
                            ? 'border-[#5ee7ff]/35 bg-[#5ee7ff]/[0.06]'
                            : isInCart
                              ? 'border-[#ffc36b]/35 bg-[#2a1c06]/25'
                              : 'border-[#285a82]/35 bg-[#041527]/65'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            isInstalled
                              ? 'border-[#7fe3ff]/70 bg-[#7fe3ff]/15 text-[#9df0ff]'
                              : isInCart
                                ? 'border-[#ffc36b]/60 bg-[#ffc36b]/10 text-[#ffd79a]'
                                : 'border-[#3d6f95]/50 text-[#3d6f95]'
                          }`}
                        >
                          {isInstalled ? (
                            <Check className="h-3 w-3" aria-hidden="true" />
                          ) : isInCart ? (
                            <Package className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <span className="text-[8px] font-semibold">{index + 1}</span>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-[10px] font-semibold uppercase leading-relaxed tracking-[0.08em] sm:text-[11px] ${
                                isInstalled
                                  ? 'text-[#6fb9cf] line-through decoration-[#7fe3ff]/80 decoration-2'
                                  : isInCart
                                    ? 'text-[#ffd79a]'
                                    : 'text-[#d7edf7]'
                              }`}
                            >
                              {part.name}
                            </p>
                            <span
                              className={`shrink-0 text-[7px] font-bold uppercase tracking-[0.14em] ${
                                isInstalled
                                  ? 'text-[#7fe3ff]'
                                  : isInCart
                                    ? 'text-[#ffd79a]'
                                    : 'text-[#397597]'
                              }`}
                            >
                              {isInstalled ? 'Crossed off' : isInCart ? 'In cart' : 'Missing'}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.18em] text-[#4f8cab]">
                            {part.category}
                          </p>
                          <p
                            className={`mt-1 text-[10px] leading-relaxed ${
                              isInstalled ? 'text-[#5f8ea4]' : 'text-[#9db8c8]'
                            }`}
                          >
                            {part.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {cartIds.length > 0 && (
                    <div className="mt-3 rounded-lg border border-[#ffc36b]/30 bg-[#2a1c06]/25 px-3 py-2.5">
                      <p className="flex items-center justify-between gap-2 text-[8px] font-bold uppercase tracking-[0.22em] text-[#ffd79a]">
                        <span className="inline-flex items-center gap-1.5">
                          <ClipboardList className="h-3 w-3" aria-hidden="true" />
                          Cart verification
                        </span>
                        <span>
                          {cartCount} / {cartLimit}
                        </span>
                      </p>
                      <div className="mt-2 space-y-1">
                        {cartIds.map((id) => {
                          const part = componentById.get(id);
                          const belongs = manifestIds.includes(id);
                          return (
                            <div
                              key={id}
                              className="flex items-center justify-between gap-2 rounded border border-white/10 bg-black/20 px-2 py-1.5"
                            >
                              <span className="min-w-0 truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-[#d7edf7]">
                                {part?.name ?? id}
                              </span>
                              <span
                                className={`inline-flex shrink-0 items-center gap-1 text-[7px] font-bold uppercase tracking-[0.14em] ${
                                  belongs ? 'text-[#7fe3ff]' : 'text-[#ffb15e]'
                                }`}
                              >
                                {belongs ? (
                                  <Check className="h-2.5 w-2.5" aria-hidden="true" />
                                ) : (
                                  <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
                                )}
                                {belongs ? 'Surveyor 5 part' : 'Not on manifest'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {cartIsFull && !hologramConverted && (
                        <button
                          type="button"
                          onClick={handleAssemble}
                          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-md border border-[#7fe3ff]/60 bg-gradient-to-r from-[#0b3f83] via-[#0d4c9a] to-[#0b356d] px-3 py-2 text-[8px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:border-[#a8f0ff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                        >
                          <Wrench className="h-3.5 w-3.5 text-[#9df0ff]" aria-hidden="true" />
                          Assemble parts
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#3b82f6]/30 bg-[#06172b]/90 px-3 py-2.5 sm:px-4">
                  <button
                    type="button"
                    onClick={() => setPartListOpen(false)}
                    className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#bcd0e2] transition-colors hover:border-[#7fe3ff]/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                  >
                    Close list
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPartListOpen(false);
                      onOpenTask?.();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#7fe3ff]/50 bg-[#0b2444]/80 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#b9ecff] transition-colors hover:border-[#7fe3ff]/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                  >
                    <ClipboardList className="h-3 w-3" aria-hidden="true" />
                    Open task page
                  </button>
                </div>
              </div>
            </div>
          )}

          {assemblyResult && (
            <div
              className="absolute inset-0 z-[56] flex items-center justify-center bg-[#02060d]/82 p-3 backdrop-blur-sm sm:p-6"
              role="presentation"
              onClick={(event) => {
                if (event.target === event.currentTarget) setAssemblyResult(null);
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="assembly-result-title"
                className="relative flex max-h-[86vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#7fe3ff]/40 bg-[#04101f]/[0.98] shadow-[0_24px_90px_rgba(0,0,0,0.72)]"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[#3b82f6]/30 bg-[#061b33]/85 px-4 py-3 sm:px-5">
                  <div>
                    <p className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.28em] text-[#7fe3ff]">
                      <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                      Hologram assembly check
                    </p>
                    <h3
                      id="assembly-result-title"
                      className="mt-1 text-lg font-semibold uppercase tracking-[0.12em] text-[#e6fbff]"
                    >
                      {assemblyResult.manifestComplete ? 'Manifest complete' : 'Verification report'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssemblyResult(null)}
                    aria-label="Close assembly report"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-[#bcd0e2] transition-colors hover:border-[#7fe3ff]/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Verified', value: assemblyResult.installed, tone: 'text-[#7fe3ff]' },
                      { label: 'Returned', value: assemblyResult.rejected, tone: 'text-[#ffb15e]' },
                      { label: 'Still missing', value: assemblyResult.remaining, tone: 'text-[#9db8c8]' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-lg border border-white/10 bg-[#03101f]/80 px-2 py-2"
                      >
                        <p className={`text-lg font-semibold leading-none ${stat.tone}`}>
                          {stat.value}
                        </p>
                        <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.16em] text-[#4f8cab]">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {(assemblyResult.installedParts ?? []).length > 0 && (
                    <div className="rounded-lg border border-[#5ee7ff]/30 bg-[#5ee7ff]/[0.05] px-3 py-2.5">
                      <p className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-[#9df0ff]">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Installed · crossed off the manifest
                      </p>
                      <div className="mt-2 space-y-1">
                        {(assemblyResult.installedParts ?? []).map((part) => (
                          <div key={part.id} className="flex items-center gap-2">
                            <Check className="h-3 w-3 shrink-0 text-[#7fe3ff]" aria-hidden="true" />
                            <span className="min-w-0 flex-1 truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7fb9cd] line-through decoration-[#7fe3ff]/80 decoration-2">
                              {part.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(assemblyResult.rejectedParts ?? []).length > 0 && (
                    <div className="rounded-lg border border-[#ffc36b]/35 bg-[#2a1c06]/30 px-3 py-2.5">
                      <p className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-[#ffd79a]">
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        Returned to the storage room
                      </p>
                      <div className="mt-2 space-y-1">
                        {(assemblyResult.rejectedParts ?? []).map((part) => (
                          <div key={part.id} className="flex items-start gap-2">
                            <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-[#ffb15e]" aria-hidden="true" />
                            <span className="min-w-0 flex-1 text-[10px] leading-relaxed text-[#e8c89a]">
                              {part.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#bf9a68]">
                        These parts do not belong on Surveyor 5 and are back on the shelves.
                      </p>
                    </div>
                  )}

                  {assemblyResult.installed === 0 && assemblyResult.rejected === 0 && (
                    <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9db8c8]">
                      No parts were verified from this cart load.
                    </p>
                  )}

                  <p className="text-center text-[8px] font-semibold uppercase leading-relaxed tracking-[0.18em] text-[#5fb9e0]">
                    {assemblyResult.manifestComplete
                      ? 'All 15 parts verified — Surveyor 5 is materialising.'
                      : `${assemblyResult.remaining} manifest part${assemblyResult.remaining === 1 ? '' : 's'} still missing.`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#3b82f6]/30 bg-[#06172b]/90 px-3 py-2.5 sm:px-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAssemblyResult(null);
                      setPartListOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#7fe3ff]/45 bg-[#0b2444]/80 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#b9ecff] transition-colors hover:border-[#7fe3ff]/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                  >
                    <ListChecks className="h-3 w-3" aria-hidden="true" />
                    See updated list
                  </button>
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setAssemblyResult(null)}
                    className="rounded-md border border-[#7fe3ff]/60 bg-gradient-to-r from-[#0b3f83] via-[#0d4c9a] to-[#0b356d] px-4 py-2 text-[8px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:border-[#a8f0ff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedComponent && (
            <div
              className="absolute inset-0 z-40 flex items-center justify-center bg-[#02060d]/55 p-4 backdrop-blur-[2px] sm:p-8"
              role="presentation"
              onClick={(event) => {
                if (event.target === event.currentTarget) setSelectedComponent(null);
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="storage-component-title"
                className="relative w-full max-w-lg overflow-hidden rounded-2xl border bg-[#050c16]/95 shadow-[0_24px_90px_rgba(0,0,0,0.65)]"
                style={{
                  borderColor: `${selectedComponent.accent}66`,
                  boxShadow: `0 24px 90px rgba(0,0,0,0.7), 0 0 45px ${selectedComponent.accentSoft}`,
                }}
              >
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${selectedComponent.accent}, transparent 75%)`,
                  }}
                />

                <div className="flex items-start gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
                  <span
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                    style={{
                      borderColor: `${selectedComponent.accent}66`,
                      backgroundColor: selectedComponent.accentSoft,
                      color: selectedComponent.accent,
                    }}
                  >
                    <Box className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[8px] font-semibold uppercase tracking-[0.3em]"
                      style={{ color: selectedComponent.accent }}
                    >
                      Storage Room · Part Inventory
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedComponent(null)}
                    aria-label="Close component details"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-[#bcd0e2] transition-colors hover:border-[#7fe3ff]/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="px-5 py-5 sm:px-6 sm:py-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#9db5c8]">
                      {selectedComponent.category}
                    </span>
                  </div>

                  <h3
                    id="storage-component-title"
                    className="text-xl font-semibold leading-snug text-white sm:text-2xl"
                  >
                    {selectedComponent.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#b8c9d8]">
                    {selectedComponent.description}
                  </p>
                </div>

                <div className="border-t border-white/10 bg-white/[0.025] px-5 py-4 sm:px-6">
                  {collectedIdSet.has(selectedComponent.id) ? (
                    <div className="flex items-center gap-2 rounded-lg border border-[#5ee7ff]/30 bg-[#5ee7ff]/[0.06] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9df0ff]">
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Installed on Surveyor 5
                    </div>
                  ) : cartIdSet.has(selectedComponent.id) ? (
                    <div className="flex items-center gap-2 rounded-lg border border-[#7fe3ff]/35 bg-[#0b2444]/70 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b9ecff]">
                      <Package className="h-4 w-4 shrink-0" aria-hidden="true" />
                      In cart · {cartCount} / {cartLimit} · unload at the hologram
                    </div>
                  ) : cartIsFull ? (
                    <div className="flex items-start gap-2 rounded-lg border border-[#ffc36b]/35 bg-[#2a1c06]/45 px-3 py-2 text-[9px] leading-relaxed text-[#ffd79a]">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#ffc36b]" aria-hidden="true" />
                      <span>
                        <span className="block font-semibold uppercase tracking-[0.18em]">
                          Cart full · {cartLimit} / {cartLimit}
                        </span>
                        Unload your cart at the central hologram before collecting more parts.
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onCollectPart?.(selectedComponent);
                        showMissionToast(
                          `${selectedComponent.name} added to cart — ${cartCount + 1} / ${cartLimit} slots used.`,
                          'success',
                        );
                        setSelectedComponent(null);
                      }}
                      className="group flex w-full items-center justify-between gap-3 rounded-lg border border-[#7fe3ff]/60 bg-gradient-to-r from-[#0b3f83] via-[#0d4c9a] to-[#0b356d] px-4 py-2.5 text-left shadow-[0_0_24px_rgba(47,123,255,0.28)] transition-all hover:border-[#a8f0ff] hover:shadow-[0_0_32px_rgba(94,231,255,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                    >
                      <span className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-white">
                          Collect part · Add to cart
                        </span>
                        <span className="mt-0.5 block text-[8px] font-semibold uppercase tracking-[0.18em] text-[#9fe0f5]">
                          Cart {cartCount} / {cartLimit} · {remainingParts} manifest part
                          {remainingParts === 1 ? '' : 's'} left
                        </span>
                      </span>
                      <PackageCheck
                        className="h-5 w-5 shrink-0 text-[#9df0ff] transition-transform group-hover:scale-110"
                        aria-hidden="true"
                      />
                    </button>
                  )}

                  <p className="mt-2 flex items-center justify-between gap-2 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#7f9bb0]">
                    <span className="inline-flex items-center gap-1.5">
                      <MousePointerClick className="h-3.5 w-3.5 text-[#7fe3ff]" aria-hidden="true" />
                      Click a sprite to inspect it
                    </span>
                    <span>50 catalogued components</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 3D Video Texture Screen in Firing Room */}
      <FiringRoomScreen
        ref={firingRoomScreenRef}
        onVideoTextureReady={handleVideoTextureReady}
        onEmergencyAtHeliumT={handleEmergencyAtHeliumT}
        onSegmentEnd={handleVideoSegmentEnd}
      />

      {/* Short on-screen countdown (3-2-1) before Part 2 starts */}
      {countdownNumber !== null && (
        <div className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[2px] animate-fade-in select-none">
          <div className="relative flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.32em] text-[#00f0ff] mb-2 drop-shadow-[0_0_10px_#00f0ff]">
              LAUNCH SEQUENCE INITIATED
            </span>
            <div className="text-6xl sm:text-8xl font-black font-mono text-white tracking-widest drop-shadow-[0_0_30px_#00f0ff] animate-pulse">
              {countdownNumber}
            </div>
            <span className="mt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#8ef4ff]">
              Atlas-Centaur AC-13 · Pad 36B
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export default NasaHeadquartersViewer;
