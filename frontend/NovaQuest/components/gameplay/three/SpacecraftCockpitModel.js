import * as THREE from 'three';

/**
 * SpacecraftCockpitModel.js
 * 
 * 3D Human Spacecraft Interior & Cockpit Controls (Phase 3)
 * Features:
 * - Astronaut flight consoles & wrap-around cockpit windshield
 * - Animated throttle levers & flight control sticks
 * - Glowing digital telemetry readouts (Velocity, Altitude, Fuel, Engine Thrust)
 * - Dynamic thruster burn lighting and window stars/moon transition
 */
export function createSpacecraftCockpit() {
  const root = new THREE.Group();
  root.name = 'SpacecraftCockpit';

  // --- Materials ---
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // dark slate aerospace hull
    roughness: 0.8,
    metalness: 0.3
  });

  const consoleMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
    metalness: 0.5
  });

  const screenCyanMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
  const screenAmberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const screenGreenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

  const throttleMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // aerospace orange throttle grip
    metalness: 0.6,
    roughness: 0.3
  });

  // 1. Dashboard Console Base
  const dashGeo = new THREE.BoxGeometry(4.2, 0.9, 1.8);
  const dashMesh = new THREE.Mesh(dashGeo, consoleMat);
  dashMesh.position.set(0, 0.85, -1.8);
  dashMesh.rotation.x = 0.25;
  root.add(dashMesh);

  // Center Multi-Function Flight Display (MFD)
  const mfdCenter = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 0.75),
    screenCyanMat
  );
  mfdCenter.position.set(0, 1.05, -1.35);
  mfdCenter.rotation.x = -0.3;
  root.add(mfdCenter);

  // Left Radar Altitude Display
  const mfdLeft = new THREE.Mesh(
    new THREE.PlaneGeometry(0.85, 0.6),
    screenGreenMat
  );
  mfdLeft.position.set(-1.3, 1.05, -1.35);
  mfdLeft.rotation.x = -0.3;
  mfdLeft.rotation.y = 0.2;
  root.add(mfdLeft);

  // Right Velocity & Engine Telemetry Display
  const mfdRight = new THREE.Mesh(
    new THREE.PlaneGeometry(0.85, 0.6),
    screenAmberMat
  );
  mfdRight.position.set(1.3, 1.05, -1.35);
  mfdRight.rotation.x = -0.3;
  mfdRight.rotation.y = -0.2;
  root.add(mfdRight);

  // 2. Dual Flight Control Sticks (Left & Right Hand)
  const sticks = [];
  for (let s of [-0.65, 0.65]) {
    const stickGroup = new THREE.Group();
    stickGroup.position.set(s, 0.6, -0.9);
    root.add(stickGroup);

    const stickShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12),
      hullMat
    );
    stickShaft.position.y = 0.22;
    stickGroup.add(stickShaft);

    const stickGrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.16, 0.1),
      consoleMat
    );
    stickGrip.position.y = 0.42;
    stickGroup.add(stickGrip);

    sticks.push(stickGroup);
  }

  // 3. Central Throttle Lever (Animates forward during engine burn)
  const throttleGroup = new THREE.Group();
  throttleGroup.position.set(0, 0.72, -0.95);
  root.add(throttleGroup);

  const throttleLever = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.22, 0.08),
    throttleMat
  );
  throttleLever.position.y = 0.1;
  throttleGroup.add(throttleLever);

  // 4. Cockpit Windshield Structural Canopy Pillars
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
  for (let px of [-1.9, 1.9]) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 3.2, 0.18),
      pillarMat
    );
    pillar.position.set(px, 2.0, -1.6);
    pillar.rotation.z = px > 0 ? -0.25 : 0.25;
    pillar.rotation.x = 0.35;
    root.add(pillar);
  }

  // Top Canopy Arch
  const arch = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.18, 0.18),
    pillarMat
  );
  arch.position.set(0, 3.1, -1.0);
  root.add(arch);

  // 5. Cockpit Ambient & Glow Lighting
  const cabinLight = new THREE.PointLight(0x38bdf8, 1.8, 8);
  cabinLight.position.set(0, 1.8, -0.5);
  root.add(cabinLight);

  const burnLight = new THREE.PointLight(0xf59e0b, 0, 15);
  burnLight.position.set(0, 0.5, -2.5);
  root.add(burnLight);

  const update = (delta, timeSeconds, isBurning = false) => {
    // Animate throttle lever forward/back
    const targetThrottleRot = isBurning ? -0.55 : 0.1;
    throttleGroup.rotation.x += (targetThrottleRot - throttleGroup.rotation.x) * 4.0 * delta;

    // Gentle pilot stick micro-corrections
    sticks[0].rotation.z = Math.sin(timeSeconds * 1.5) * 0.08;
    sticks[1].rotation.x = Math.cos(timeSeconds * 1.8) * 0.06;

    // Engine burn light glow
    if (isBurning) {
      burnLight.intensity = 3.5 + Math.random() * 2.0;
    } else {
      burnLight.intensity = Math.max(0, burnLight.intensity - delta * 4.0);
    }
  };

  return { root, update, throttleGroup, burnLight };
}

