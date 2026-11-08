import * as THREE from 'three';

/**
 * ThirdPersonPlayerController.js
 * 
 * Genuine GTA-style 3rd-person camera and character physics controller:
 * - Camera orbits player with mouse pitch and yaw
 * - Character movement (WASD) is oriented relative to camera look direction
 * - Shift to Sprint (2x speed with running gait)
 * - Space for low-gravity lunar leap (1/6th Earth gravity float)
 * - Smooth camera follow with ground-height clamping
 * - Smooth character rotation towards movement direction
 */
export function createThirdPersonController({
  characterMesh,
  camera,
  domElement,
  groundY = 0,
  getGroundHeight = null,
  onFootstep = null
}) {
  // Player state
  const initialY = getGroundHeight ? getGroundHeight(0, 23) : groundY;
  const pos = new THREE.Vector3(0, initialY, 23);
  const velocity = new THREE.Vector3();
  let playerYaw = 0;
  let isGrounded = true;
  let verticalVelocity = 0;
  const gravity = -3.8; // Lunar low gravity (m/s^2)
  const jumpImpulse = 4.2;

  // Camera spherical coordinates
  let camYaw = 0;
  let camPitch = 0.22; // slightly looking down from above
  let camDistance = 4.2;
  const minPitch = -0.15; // slightly looking up
  const maxPitch = 1.15;  // bird's-eye limit

  // Input states
  const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
    space: false,
    e: false
  };

  let isPointerLocked = false;
  let isMouseDown = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let footstepTimer = 0;

  // --- Mouse Event Handlers ---
  const handleMouseDown = (e) => {
    isMouseDown = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  };

  const handleMouseUp = () => {
    isMouseDown = false;
  };

  const handleMouseMove = (e) => {
    let deltaX = 0;
    let deltaY = 0;

    if (document.pointerLockElement === domElement) {
      deltaX = e.movementX || 0;
      deltaY = e.movementY || 0;
    } else if (isMouseDown) {
      deltaX = e.clientX - prevMouseX;
      deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }

    if (deltaX !== 0 || deltaY !== 0) {
      const sensitivity = 0.0035;
      camYaw -= deltaX * sensitivity;
      camPitch = Math.max(minPitch, Math.min(maxPitch, camPitch + deltaY * sensitivity));
    }
  };

  const handleWheel = (e) => {
    camDistance = Math.max(2.8, Math.min(9.0, camDistance + e.deltaY * 0.003));
  };

  // --- Keyboard Event Handlers ---
  const handleKeyDown = (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') keys.w = true;
    if (k === 'a' || k === 'arrowleft') keys.a = true;
    if (k === 's' || k === 'arrowdown') keys.s = true;
    if (k === 'd' || k === 'arrowright') keys.d = true;
    if (e.key === 'Shift') keys.shift = true;
    if (e.key === ' ' && isGrounded) {
      keys.space = true;
      verticalVelocity = jumpImpulse;
      isGrounded = false;
      if (characterMesh.userData.anim) {
        characterMesh.userData.anim.state = 'jump';
      }
    }
    if (k === 'e') keys.e = true;
  };

  const handleKeyUp = (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') keys.w = false;
    if (k === 'a' || k === 'arrowleft') keys.a = false;
    if (k === 's' || k === 'arrowdown') keys.s = false;
    if (k === 'd' || k === 'arrowright') keys.d = false;
    if (e.key === 'Shift') keys.shift = false;
    if (e.key === ' ') keys.space = false;
    if (k === 'e') keys.e = false;
  };

  // Attach event listeners
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  domElement.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('mousemove', handleMouseMove);
  domElement.addEventListener('wheel', handleWheel, { passive: true });

  // Optional Pointer Lock on click
  domElement.addEventListener('click', () => {
    if (!document.pointerLockElement) {
      domElement.requestPointerLock?.();
    }
  });

  // Touch Support for mobile / tablet
  let touchStartX = 0;
  let touchStartY = 0;
  const handleTouchStart = (e) => {
    if (e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  };
  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      camYaw -= dx * 0.005;
      camPitch = Math.max(minPitch, Math.min(maxPitch, camPitch + dy * 0.005));
    }
  };
  domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
  domElement.addEventListener('touchmove', handleTouchMove, { passive: true });

  // Update routine executed each frame
  const update = (delta, timeSeconds) => {
    const clampedDelta = Math.min(delta, 0.1);

    // 1. Calculate camera forward and right unit vectors on XZ plane
    const forward = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw)).normalize();
    const right = new THREE.Vector3(Math.cos(camYaw), 0, -Math.sin(camYaw)).normalize();

    // 2. Read movement inputs
    const moveDir = new THREE.Vector3();
    if (keys.w) moveDir.add(forward);
    if (keys.s) moveDir.sub(forward);
    if (keys.d) moveDir.add(right);
    if (keys.a) moveDir.sub(right);

    const isMoving = moveDir.lengthSq() > 0.001;
    const isRunning = keys.shift && isMoving;
    const baseSpeed = isRunning ? 7.2 : 3.8;

    if (isMoving) {
      moveDir.normalize();

      // Smoothly rotate character to face travel direction
      const targetYaw = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetYaw - playerYaw;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      playerYaw += diff * 12.0 * clampedDelta;
      characterMesh.rotation.y = playerYaw;

      // Update horizontal position
      pos.x += moveDir.x * baseSpeed * clampedDelta;
      pos.z += moveDir.z * baseSpeed * clampedDelta;

      // Footstep audio cues
      if (isGrounded) {
        footstepTimer += clampedDelta * (isRunning ? 11 : 6);
        if (footstepTimer >= Math.PI) {
          footstepTimer = 0;
          if (onFootstep) onFootstep();
        }
      }
    }

    // 3. Gravity, Ground Snapping & Jumping Physics
    const curGroundY = getGroundHeight ? getGroundHeight(pos.x, pos.z) : groundY;

    if (!isGrounded) {
      verticalVelocity += gravity * clampedDelta;
      pos.y += verticalVelocity * clampedDelta;

      if (pos.y <= curGroundY) {
        pos.y = curGroundY;
        verticalVelocity = 0;
        isGrounded = true;
      }
    } else {
      // Snap to terrain surface elevation
      pos.y = curGroundY;
    }

    // 4. Update Character Mesh
    characterMesh.position.copy(pos);

    if (characterMesh.userData.anim) {
      const anim = characterMesh.userData.anim;
      if (!isGrounded) {
        anim.state = 'jump';
      } else if (isMoving) {
        anim.state = isRunning ? 'run' : 'walk';
      } else if (anim.state !== 'repair' && anim.state !== 'celebrate' && anim.state !== 'pickup') {
        anim.state = 'idle';
      }
      anim.update(clampedDelta, timeSeconds);
    }

    // 5. Calculate Third-Person Chase Camera Position
    const camTarget = new THREE.Vector3(pos.x, pos.y + 0.95, pos.z);

    const horizontalDist = camDistance * Math.cos(camPitch);
    const verticalDist = camDistance * Math.sin(camPitch);

    const desiredCamPos = new THREE.Vector3(
      camTarget.x + Math.sin(camYaw) * horizontalDist,
      Math.max(groundY + 0.8, camTarget.y + verticalDist),
      camTarget.z + Math.cos(camYaw) * horizontalDist
    );

    // Smooth camera damping
    camera.position.lerp(desiredCamPos, 0.16);
    camera.lookAt(camTarget);
  };

  const setPosition = (x, y, z) => {
    pos.set(x, y, z);
    characterMesh.position.copy(pos);
  };

  const dispose = () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    domElement.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('mousemove', handleMouseMove);
    domElement.removeEventListener('wheel', handleWheel);
    domElement.removeEventListener('touchstart', handleTouchStart);
    domElement.removeEventListener('touchmove', handleTouchMove);
  };

  return {
    pos,
    keys,
    update,
    setPosition,
    dispose
  };
}

