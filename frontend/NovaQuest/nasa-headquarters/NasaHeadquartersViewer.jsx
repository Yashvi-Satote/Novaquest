import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createNasaHeadquarters } from './NasaHeadquartersModel';

const HEADQUARTERS_ROOM_RADIUS = 12.5;
const PLAYER_COLLISION_RADIUS = 0.34;
const PLAYER_COLLISION_HEIGHT = 1.82;

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
  const [storageDoorOpen, setStorageDoorOpen] = useState(false);
  const [firingRoomDoorOpen, setFiringRoomDoorOpen] = useState(false);
  const [firstPersonMode, setFirstPersonMode] = useState(false);
  const [characterControlMode, setCharacterControlMode] = useState(false);
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
      setDoorOpen(open);
    };
    const doorControl = {
      toggle: () => setDoorState(!headquarters.door.isOpen()),
      setOpen: (open) => setDoorState(open),
    };
    const setStorageDoorState = (open) => {
      headquarters.corridor.storageRoom.entryDoor.setOpen(open);
      setStorageDoorOpen(open);
    };
    const storageDoorControl = {
      toggle: () =>
        setStorageDoorState(!headquarters.corridor.storageRoom.entryDoor.isOpen()),
    };
    const setFiringRoomDoorState = (open) => {
      headquarters.corridor.firingRoom.door.setOpen(open);
      setFiringRoomDoorOpen(open);
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
    controls.zoomSpeed = 0.65;

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
      setCharacterControlMode(true);
    };

    const exitCharacterControl = () => {
      if (!characterControlActive) return;
      characterControlActive = false;
      movementKeys.clear();
      camera.position.copy(orbitPosition);
      controls.target.copy(orbitTarget);
      controls.update();
      setCharacterControlMode(false);
    };

    const toggleCharacterControl = () => {
      if (characterControlActive) exitCharacterControl();
      else enterCharacterControl();
    };

    const handlePointerLock = (event) => setPointerLocked(event.type === 'lock');
    pointerControls.addEventListener('lock', handlePointerLock);
    pointerControls.addEventListener('unlock', handlePointerLock);

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (firstPersonActive || characterControlActive) {
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright', 'shift'].includes(key)) {
          event.preventDefault();
          movementKeys.add(key);
        } else if (key === 'e') {
          event.preventDefault();
          doorControl.toggle();
        } else if (key === 'f') {
          event.preventDefault();
          storageDoorControl.toggle();
        } else if (key === 'g') {
          event.preventDefault();
          firingRoomDoorControl.toggle();
        }
      } else if (key === 'f') {
        storageDoorControl.toggle();
      } else if (key === 'd' || key === 'e') {
        doorControl.toggle();
      } else if (key === 'g') {
        firingRoomDoorControl.toggle();
      }
    };
    const handleKeyUp = (event) => movementKeys.delete(event.key.toLowerCase());
    const handleEscapeCapture = (event) => {
      if (event.key === 'Escape' && (firstPersonActive || characterControlActive)) {
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
        if (firstPersonActive) exitFirstPerson();
        else enterFirstPerson();
      },
      toggleCharacterControl,
      resumeFirstPerson: enterFirstPerson,
      toggleStorageDoor: storageDoorControl.toggle,
      toggleFiringRoomDoor: firingRoomDoorControl.toggle,
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
    const getInteractionAtPointer = (event) => {
      updatePointerPosition(event);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(
        interactionTargets.map(({ target }) => target),
        false,
      )[0];
      return hit
        ? interactionTargets.find(({ target }) => target === hit.object) || null
        : null;
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
      if (event.button === 0 && distance < 6) {
        const interaction = getInteractionAtPointer(event);
        if (interaction) interaction.toggle();
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
          -Math.PI / 2 + 0.02,
          Math.PI / 2 - 0.02,
        );
        lookPointer.x = event.clientX;
        lookPointer.y = event.clientY;
      }
      renderer.domElement.style.cursor = getInteractionAtPointer(event) ? 'pointer' : '';
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);
    renderer.domElement.addEventListener('pointercancel', handlePointerCancel);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

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
      const speed = movementKeys.has('shift') ? 5 : 2.8;
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
          const speed = movementKeys.has('shift') ? 5 : 2.8;
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
      window.removeEventListener('keydown', handleEscapeCapture, true);
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
                ? `Close airlock · Click / ${firstPersonMode || characterControlMode ? 'E' : 'D'}`
                : `Open airlock · Click / ${firstPersonMode || characterControlMode ? 'E' : 'D'}`}
            </button>
            <button
              type="button"
              onClick={() => doorHolderRef.current && doorHolderRef.current.toggleStorageDoor()}
              aria-pressed={storageDoorOpen}
              className="rounded-lg border border-[#7fe3ff]/35 bg-[#071426]/85 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9cd8f2] shadow-[0_0_20px_rgba(61,107,255,0.18)] backdrop-blur-md transition-colors hover:border-[#7fe3ff]/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
            >
              {storageDoorOpen ? 'Close parts room · Click / F' : 'Open parts room · Click / F'}
            </button>
            <button
              type="button"
              onClick={() => doorHolderRef.current && doorHolderRef.current.toggleFiringRoomDoor()}
              aria-pressed={firingRoomDoorOpen}
              className="rounded-lg border border-[#7fe3ff]/35 bg-[#071426]/85 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9cd8f2] shadow-[0_0_20px_rgba(61,107,255,0.18)] backdrop-blur-md transition-colors hover:border-[#7fe3ff]/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
            >
              {firingRoomDoorOpen ? 'Close firing room · Click / G' : 'Open firing room · Click / G'}
            </button>
            <button
              type="button"
              onClick={() => doorHolderRef.current && doorHolderRef.current.toggleCharacterControl()}
              aria-pressed={characterControlMode}
              className="rounded-lg border border-[#7fe3ff]/35 bg-[#071426]/85 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9cd8f2] shadow-[0_0_20px_rgba(61,107,255,0.14)] backdrop-blur-md transition-colors hover:border-[#7fe3ff]/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
            >
              {characterControlMode ? 'Exit character controls' : 'Control astronaut'}
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
          {(firstPersonMode || characterControlMode) && (
            <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#7fe3ff]/25 bg-[#071426]/80 px-4 py-2 text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-[#b8d8e8] backdrop-blur-md sm:text-[9px]">
              WASD move · {characterControlMode ? 'Drag to orbit' : '360° mouse look'} · Shift sprint · E airlock · F parts room · G firing room · Esc exit
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default NasaHeadquartersViewer;
