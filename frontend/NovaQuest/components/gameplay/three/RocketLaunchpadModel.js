import * as THREE from 'three';

/**
 * RocketLaunchpadModel.js
 * 
 * 3D Launchpad Complex & Multi-Stage Rocket
 * Features:
 * - Red steel gantry launch tower with swing-arm walkway
 * - Multi-stage rocket (Atlas-Centaur / Saturn style) with launch escape tower
 * - Hatch door that can open and close
 * - Engine exhaust nozzle assembly
 * - Particle system generator for engine ignition, flame plume, and launchpad smoke
 */
export function createLaunchpadComplex() {
  const root = new THREE.Group();
  root.name = 'LaunchpadComplex';

  // Base Launch Table / Concrete Platform
  const baseGeo = new THREE.BoxGeometry(18, 2.5, 18);
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // slate-700
    roughness: 0.9,
    metalness: 0.1
  });
  const baseMesh = new THREE.Mesh(baseGeo, concreteMat);
  baseMesh.position.y = 1.25;
  root.add(baseMesh);

  // Flame Trench / Blast Deflector
  const trenchGeo = new THREE.BoxGeometry(6, 3, 14);
  const trenchMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });
  const trench = new THREE.Mesh(trenchGeo, trenchMat);
  trench.position.set(0, 0.5, 0);
  root.add(trench);

  // Red Steel Umbilical Gantry Tower
  const towerGroup = new THREE.Group();
  towerGroup.position.set(-5.5, 2.5, 0);
  root.add(towerGroup);

  const towerMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // red-600 NASA tower red
    roughness: 0.6,
    metalness: 0.3
  });

  // 4 Main Tower Vertical Columns
  const colGeo = new THREE.BoxGeometry(0.35, 24, 0.35);
  for (let x of [-1.8, 1.8]) {
    for (let z of [-1.8, 1.8]) {
      const col = new THREE.Mesh(colGeo, towerMat);
      col.position.set(x, 12, z);
      towerGroup.add(col);
    }
  }

  // Cross Bracing Horizontals
  const braceGeo = new THREE.BoxGeometry(3.6, 0.15, 0.15);
  for (let y = 2; y <= 22; y += 2) {
    const b1 = new THREE.Mesh(braceGeo, towerMat);
    b1.position.set(0, y, 1.8);
    towerGroup.add(b1);

    const b2 = new THREE.Mesh(braceGeo, towerMat);
    b2.position.set(0, y, -1.8);
    towerGroup.add(b2);
  }

  // Swing Arm / Walkway Bridge to Rocket Capsule
  const bridgeGroup = new THREE.Group();
  bridgeGroup.position.set(1.8, 15.5, 0);
  towerGroup.add(bridgeGroup);

  const bridgeFloorGeo = new THREE.BoxGeometry(4.5, 0.2, 1.4);
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.5, roughness: 0.4 });
  const bridgeFloor = new THREE.Mesh(bridgeFloorGeo, bridgeMat);
  bridgeFloor.position.x = 2.2;
  bridgeGroup.add(bridgeFloor);

  // Handrails
  const railGeo = new THREE.BoxGeometry(4.5, 0.8, 0.05);
  const railMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 }); // caution yellow
  const railL = new THREE.Mesh(railGeo, railMat);
  railL.position.set(2.2, 0.5, 0.7);
  const railR = new THREE.Mesh(railGeo, railMat);
  railR.position.set(2.2, 0.5, -0.7);
  bridgeGroup.add(railL);
  bridgeGroup.add(railR);

  // Tower Crane & Lightning Rod at top
  const craneArmGeo = new THREE.BoxGeometry(6, 0.4, 0.4);
  const craneArm = new THREE.Mesh(craneArmGeo, towerMat);
  craneArm.position.set(1.5, 24.5, 0);
  towerGroup.add(craneArm);

  const rodGeo = new THREE.CylinderGeometry(0.04, 0.08, 4, 8);
  const rodMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 });
  const rod = new THREE.Mesh(rodGeo, rodMat);
  rod.position.set(0, 26, 0);
  towerGroup.add(rod);

  // Launchpad Floodlights
  const lightL = new THREE.SpotLight(0xfffaed, 3.5, 40, Math.PI / 4, 0.5);
  lightL.position.set(8, 18, 8);
  lightL.target.position.set(0, 10, 0);
  root.add(lightL);
  root.add(lightL.target);

  return { root, bridgeGroup };
}

/**
 * 3D Rocket Spacecraft
 */
export function createRocketVehicle() {
  const root = new THREE.Group();
  root.name = 'RocketVehicle';

  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.3,
    metalness: 0.2
  });

  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.5
  });

  const redMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.4
  });

  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.2
  });

  // Stage 1 (Main Booster Cylinder)
  const stage1Geo = new THREE.CylinderGeometry(1.4, 1.4, 10, 32);
  const stage1 = new THREE.Mesh(stage1Geo, whiteMat);
  stage1.position.y = 7.5;
  root.add(stage1);

  // USA & NASA stripe decals (decorative bands)
  const stripeGeo = new THREE.CylinderGeometry(1.42, 1.42, 0.5, 32);
  const stripe1 = new THREE.Mesh(stripeGeo, blackMat);
  stripe1.position.y = 11.5;
  root.add(stripe1);

  const stripe2 = new THREE.Mesh(stripeGeo, redMat);
  stripe2.position.y = 3.5;
  root.add(stripe2);

  // Aerodynamic Base Fins (4 Fins)
  const finGeo = new THREE.BoxGeometry(0.12, 2.5, 1.5);
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const fin = new THREE.Mesh(finGeo, blackMat);
    fin.position.set(Math.cos(angle) * 1.8, 3.8, Math.sin(angle) * 1.8);
    fin.rotation.y = angle;
    root.add(fin);
  }

  // Rocket Engine Bell Nozzles (Cluster of 5)
  const bellGeo = new THREE.ConeGeometry(0.45, 1.2, 16, 1, true);
  for (let [bx, bz] of [[0, 0], [0.65, 0.65], [-0.65, 0.65], [0.65, -0.65], [-0.65, -0.65]]) {
    const bell = new THREE.Mesh(bellGeo, engineMat);
    bell.position.set(bx, 2.0, bz);
    root.add(bell);
  }

  // Interstage Ring
  const interstageGeo = new THREE.CylinderGeometry(1.25, 1.4, 1.8, 32);
  const interstage = new THREE.Mesh(interstageGeo, blackMat);
  interstage.position.y = 13.4;
  root.add(interstage);

  // Stage 2 (Centaur Upper Stage)
  const stage2Geo = new THREE.CylinderGeometry(1.2, 1.2, 4.5, 32);
  const stage2 = new THREE.Mesh(stage2Geo, whiteMat);
  stage2.position.y = 16.2;
  root.add(stage2);

  // Capsule / Crew & Instrument Module (Conical)
  const capsuleGeo = new THREE.ConeGeometry(1.2, 2.2, 32);
  const capsule = new THREE.Mesh(capsuleGeo, whiteMat);
  capsule.position.y = 19.4;
  root.add(capsule);

  // Hatch Door (that can open/close)
  const hatchPivot = new THREE.Group();
  hatchPivot.position.set(-0.85, 16.5, 0);
  root.add(hatchPivot);

  const hatchGeo = new THREE.BoxGeometry(0.08, 1.2, 0.7);
  const hatchMesh = new THREE.Mesh(hatchGeo, whiteMat);
  hatchMesh.position.set(0, 0, 0.35);
  hatchPivot.add(hatchMesh);

  // Launch Escape Tower on top
  const towerSpireGeo = new THREE.CylinderGeometry(0.06, 0.15, 3.5, 8);
  const spireMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
  const spire = new THREE.Mesh(towerSpireGeo, spireMat);
  spire.position.y = 22.2;
  root.add(spire);

  // Engine Flame & Exhaust Group
  const flameGroup = new THREE.Group();
  flameGroup.position.set(0, 1.5, 0);
  root.add(flameGroup);

  // Inner Core Flame (Brilliant Yellow-White)
  const innerFlameGeo = new THREE.ConeGeometry(0.9, 4.5, 16);
  const innerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95
  });
  const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
  innerFlame.rotation.x = Math.PI;
  innerFlame.position.y = -2.25;
  flameGroup.add(innerFlame);

  // Outer Plasma Plume (Vibrant Orange-Blue gradient effect)
  const outerFlameGeo = new THREE.ConeGeometry(1.6, 7.0, 16);
  const outerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
    transparent: true,
    opacity: 0.75
  });
  const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);
  outerFlame.rotation.x = Math.PI;
  outerFlame.position.y = -3.5;
  flameGroup.add(outerFlame);

  // Rocket Point Light for ground illumination
  const exhaustLight = new THREE.PointLight(0xf97316, 0, 25);
  exhaustLight.position.y = -2;
  flameGroup.add(exhaustLight);

  flameGroup.visible = false;

  return { root, hatchPivot, flameGroup, exhaustLight };
}

/**
 * Launchpad Smoke & Steam Particle System
 */
export function createLaunchSmokeSystem(count = 350) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const opacities = new Float32Array(count);
  const velocities = [];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 1] = 1.0 + Math.random() * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

    scales[i] = 0.5 + Math.random() * 2.5;
    opacities[i] = 0.0;

    velocities.push({
      vx: (Math.random() - 0.5) * 6,
      vy: 0.5 + Math.random() * 3,
      vz: (Math.random() - 0.5) * 6,
      life: Math.random()
    });
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xe2e8f0,
    size: 2.8,
    transparent: true,
    opacity: 0.5,
    blending: THREE.NormalBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(geo, mat);
  particles.visible = false;

  const update = (delta, active = false) => {
    if (!active && !particles.visible) return;
    particles.visible = true;

    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const v = velocities[i];
      if (active) {
        pos[i * 3] += v.vx * delta;
        pos[i * 3 + 1] += v.vy * delta;
        pos[i * 3 + 2] += v.vz * delta;

        v.life += delta * 0.8;
        if (v.life > 1.0) {
          v.life = 0;
          pos[i * 3] = (Math.random() - 0.5) * 3;
          pos[i * 3 + 1] = 1.0 + Math.random() * 1.5;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
        }
      } else {
        // Disperse when cut off
        pos[i * 3 + 1] += v.vy * delta * 0.5;
        mat.opacity = Math.max(0, mat.opacity - delta * 0.2);
        if (mat.opacity <= 0.02) particles.visible = false;
      }
    }
    geo.attributes.position.needsUpdate = true;
  };

  return { particles, update, mat };
}

