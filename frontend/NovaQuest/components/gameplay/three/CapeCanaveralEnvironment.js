import * as THREE from 'three';

/**
 * CapeCanaveralEnvironment.js
 * 
 * High-Fidelity 3D Launch Environment for Cape Canaveral Launch Complex 36 (1967)
 * Features:
 * - Sunrise Florida Sky Dome with warm golden horizon and azure blue zenith gradient
 * - Smooth transition from blue atmosphere to deep space starfield as altitude increases
 * - Expansive coastal barrier island terrain: launch pad, crawlerway, Florida scrub & Atlantic Ocean
 * - Open steel lattice launch umbilical tower (red NASA gantry) with articulated swing arms
 * - Cryogenic propellant storage facilities (spherical LH2 tank, LOX tanks, blockhouse)
 * - Volumetric cumulus cloud deck at 120m-220m elevation that rocket punches through
 * - Golden morning directional sunlight, sky blue hemisphere bounce, and launchpad floodlights
 */
export function createCapeCanaveralEnvironment() {
  const root = new THREE.Group();
  root.name = 'CapeCanaveralEnvironment';

  // =========================================================================
  // 1. SUNRISE SKY DOME WITH NATURAL ATMOSPHERE GRADIENT
  // =========================================================================
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 1024;
  skyCanvas.height = 1024;
  const sCtx = skyCanvas.getContext('2d');

  // Vertical Florida morning atmosphere gradient
  const skyGrad = sCtx.createLinearGradient(0, 0, 0, 1024);
  skyGrad.addColorStop(0.0, '#0369a1'); // Zenith: deep cerulean azure blue
  skyGrad.addColorStop(0.35, '#38bdf8'); // Mid-sky: radiant sky blue
  skyGrad.addColorStop(0.65, '#93c5fd'); // Lower atmosphere: soft pastel blue
  skyGrad.addColorStop(0.85, '#fed7aa'); // Near horizon: warm peach sunrise
  skyGrad.addColorStop(0.96, '#fde047'); // Horizon glow: golden sunlight band
  skyGrad.addColorStop(1.0, '#d97706'); // Horizon edge: warm amber
  sCtx.fillStyle = skyGrad;
  sCtx.fillRect(0, 0, 1024, 1024);

  const skyTex = new THREE.CanvasTexture(skyCanvas);
  skyTex.wrapS = THREE.ClampToEdgeWrapping;
  skyTex.wrapT = THREE.ClampToEdgeWrapping;

  const skyGeo = new THREE.SphereGeometry(750, 32, 24);
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTex,
    side: THREE.BackSide,
    transparent: true,
    opacity: 1.0,
    depthWrite: false
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  root.add(skyDome);

  // Deep Space Starfield Sphere (visible through fading atmosphere as rocket climbs)
  const starGeo = new THREE.BufferGeometry();
  const starCount = 2200;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    const v = new THREE.Vector3(
      (Math.random() - 0.5) * 1200,
      Math.random() * 800 + 50,
      (Math.random() - 0.5) * 1200
    ).normalize().multiplyScalar(740);
    starPos[i] = v.x;
    starPos[i + 1] = v.y;
    starPos[i + 2] = v.z;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.4,
    transparent: true,
    opacity: 0.1 // Increases to 1.0 as rocket reaches space
  });
  const starfield = new THREE.Points(starGeo, starMat);
  root.add(starfield);

  // =========================================================================
  // 2. CAPE CANAVERAL COASTAL TERRAIN & ATLANTIC OCEAN
  // =========================================================================
  const terrainGroup = new THREE.Group();
  root.add(terrainGroup);

  // Main Florida Landmass (450m x 450m)
  const landGeo = new THREE.PlaneGeometry(450, 450, 32, 32);
  const landMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // coastal ground / scrub
    roughness: 0.85,
    metalness: 0.1
  });
  const landMesh = new THREE.Mesh(landGeo, landMat);
  landMesh.rotation.x = -Math.PI / 2;
  landMesh.position.set(-60, 0, 0);
  landMesh.receiveShadow = true;
  terrainGroup.add(landMesh);

  // Atlantic Ocean Water (East of Cape Canaveral)
  const oceanGeo = new THREE.PlaneGeometry(500, 600);
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // vibrant Atlantic blue
    roughness: 0.12,
    metalness: 0.75
  });
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.rotation.x = -Math.PI / 2;
  oceanMesh.position.set(280, -0.4, 0);
  terrainGroup.add(oceanMesh);

  // Sandy Beach Shoreline
  const beachGeo = new THREE.PlaneGeometry(35, 450);
  const beachMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7, // pale sandy beach
    roughness: 0.9,
    metalness: 0.05
  });
  const beachMesh = new THREE.Mesh(beachGeo, beachMat);
  beachMesh.rotation.x = -Math.PI / 2;
  beachMesh.position.set(150, -0.1, 0);
  terrainGroup.add(beachMesh);

  // Asphalt Access Road & Crawlerway
  const roadGeo = new THREE.PlaneGeometry(16, 260);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.7
  });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.set(0, 0.02, 130);
  terrainGroup.add(roadMesh);

  // =========================================================================
  // 3. LAUNCHPAD MOUNT & FLAME DEFLECTOR TRENCH
  // =========================================================================
  const padMountGroup = new THREE.Group();
  terrainGroup.add(padMountGroup);

  // Octagonal Raised Concrete Launchpad Mount
  const padGeo = new THREE.CylinderGeometry(22, 25, 3.2, 8);
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // bright architectural concrete
    roughness: 0.75,
    metalness: 0.15
  });
  const padMesh = new THREE.Mesh(padGeo, concreteMat);
  padMesh.position.y = 1.6;
  padMesh.receiveShadow = true;
  padMountGroup.add(padMesh);

  // Yellow Safety Perimeter Circle
  const safetyRingGeo = new THREE.RingGeometry(18.5, 19.5, 32);
  const safetyMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
  const safetyRing = new THREE.Mesh(safetyRingGeo, safetyMat);
  safetyRing.rotation.x = -Math.PI / 2;
  safetyRing.position.y = 3.22;
  padMountGroup.add(safetyRing);

  // Steel Flame Deflector Blast Trench (North-South exhaust duct)
  const trenchGeo = new THREE.BoxGeometry(8, 3.5, 26);
  const trenchMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.7,
    roughness: 0.4
  });
  const trench = new THREE.Mesh(trenchGeo, trenchMat);
  trench.position.set(0, 1.2, 0);
  padMountGroup.add(trench);

  // Inverted Wedge Blast Deflector inside trench
  const deflectorGeo = new THREE.ConeGeometry(3.5, 3.0, 4);
  const deflectorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
  const deflector = new THREE.Mesh(deflectorGeo, deflectorMat);
  deflector.rotation.y = Math.PI / 4;
  deflector.position.set(0, 1.5, 0);
  padMountGroup.add(deflector);

  // =========================================================================
  // 4. OPEN-FRAMEWORK LAUNCH UMBILICAL TOWER (RED STEEL GANTRY)
  // Positioned at X = -7.5, Z = -3 so it never blocks the rocket from front/right!
  // =========================================================================
  const towerGroup = new THREE.Group();
  towerGroup.position.set(-8.5, 3.2, -2.5);
  root.add(towerGroup);

  const towerRedMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // NASA Vermillion Red
    roughness: 0.45,
    metalness: 0.4
  });

  const towerSteelMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.8,
    roughness: 0.25
  });

  // 4 Vertical Steel Lattice Columns (L-beams)
  const colGeo = new THREE.CylinderGeometry(0.25, 0.25, 36, 8);
  for (let [tx, tz] of [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]]) {
    const col = new THREE.Mesh(colGeo, towerRedMat);
    col.position.set(tx, 18, tz);
    col.castShadow = true;
    towerGroup.add(col);
  }

  // Horizontal Cross Beams & Diagonal Bracing (Open framework)
  const beamGeo = new THREE.BoxGeometry(4.4, 0.18, 0.18);
  for (let y = 3; y <= 34; y += 3) {
    const b1 = new THREE.Mesh(beamGeo, towerRedMat);
    b1.position.set(0, y, 2.2);
    towerGroup.add(b1);

    const b2 = new THREE.Mesh(beamGeo, towerRedMat);
    b2.position.set(0, y, -2.2);
    towerGroup.add(b2);

    // Diagonal truss
    const diagGeo = new THREE.CylinderGeometry(0.08, 0.08, 5.2, 6);
    const d1 = new THREE.Mesh(diagGeo, towerRedMat);
    d1.position.set(0, y - 1.5, 2.2);
    d1.rotation.z = Math.atan2(3, 4.4);
    towerGroup.add(d1);
  }

  // Tower Hammerhead Crane at Top
  const craneArmGeo = new THREE.BoxGeometry(9.0, 0.6, 0.6);
  const craneArm = new THREE.Mesh(craneArmGeo, towerRedMat);
  craneArm.position.set(2.0, 36.5, 0);
  towerGroup.add(craneArm);

  // Lightning Dissipation Spire at Apex
  const spireGeo = new THREE.CylinderGeometry(0.06, 0.14, 6.0, 8);
  const spire = new THREE.Mesh(spireGeo, towerSteelMat);
  spire.position.set(0, 39.5, 0);
  towerGroup.add(spire);

  // 3 Articulated Service Swing Arms (Swing away during countdown!)
  const swingArms = [];
  const armConfigs = [
    { y: 8.5, length: 7.0, label: 'Booster Service Arm' },
    { y: 17.5, length: 7.2, label: 'Centaur Cryo Arm' },
    { y: 24.5, length: 6.8, label: 'Fairing Environmental Arm' }
  ];

  armConfigs.forEach(cfg => {
    const pivot = new THREE.Group();
    pivot.position.set(2.2, cfg.y, 0);
    towerGroup.add(pivot);

    // Swing arm truss
    const armBodyGeo = new THREE.BoxGeometry(cfg.length, 0.35, 0.5);
    const armBody = new THREE.Mesh(armBodyGeo, towerSteelMat);
    armBody.position.x = cfg.length / 2;
    pivot.add(armBody);

    // Umbilical cable connectors
    const umbGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8);
    const umb = new THREE.Mesh(umbGeo, towerRedMat);
    umb.rotation.z = Math.PI / 2;
    umb.position.set(cfg.length, 0, 0);
    pivot.add(umb);

    swingArms.push(pivot);
  });

  // =========================================================================
  // 5. CRYOGENIC STORAGE PROPELLANT TANKS & AUXILIARY BUILDINGS
  // =========================================================================
  // Giant Spherical Liquid Hydrogen (LH2) Vacuum Tank
  const lh2SphereGeo = new THREE.SphereGeometry(7.0, 24, 24);
  const lh2Mat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.3,
    metalness: 0.4
  });
  const lh2Sphere = new THREE.Mesh(lh2SphereGeo, lh2Mat);
  lh2Sphere.position.set(-45, 9.5, -35);
  terrainGroup.add(lh2Sphere);

  // Support legs for LH2 sphere
  for (let a = 0; a < 6; a++) {
    const ang = (a * Math.PI * 2) / 6;
    const sLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.4, 5.0, 8),
      towerSteelMat
    );
    sLeg.position.set(-45 + Math.cos(ang) * 5.5, 2.5, -35 + Math.sin(ang) * 5.5);
    terrainGroup.add(sLeg);
  }

  // Horizontal Liquid Oxygen (LOX) Cylinders
  const loxGeo = new THREE.CylinderGeometry(2.5, 2.5, 14, 16);
  for (let lz of [-15, -22]) {
    const loxTank = new THREE.Mesh(loxGeo, lh2Mat);
    loxTank.rotation.z = Math.PI / 2;
    loxTank.position.set(-40, 3.2, lz);
    terrainGroup.add(loxTank);
  }

  // 4 Launchpad Perimeter Floodlight Towers
  const floodlights = [];
  const floodCoords = [
    { x: 26, z: 26 },
    { x: -26, z: 26 },
    { x: 26, z: -26 },
    { x: -26, z: -26 }
  ];
  floodCoords.forEach(c => {
    const pPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.28, 18, 8),
      towerSteelMat
    );
    pPole.position.set(c.x, 9, c.z);
    terrainGroup.add(pPole);

    const fHead = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.2, 0.8),
      new THREE.MeshBasicMaterial({ color: 0xfffaed })
    );
    fHead.position.set(c.x, 18, c.z);
    terrainGroup.add(fHead);

    const spot = new THREE.SpotLight(0xfffaed, 2.2, 45, Math.PI / 4, 0.4);
    spot.position.set(c.x, 18, c.z);
    spot.target.position.set(0, 10, 0);
    terrainGroup.add(spot);
    terrainGroup.add(spot.target);
    floodlights.push(spot);
  });

  // =========================================================================
  // 6. ATMOSPHERIC CUMULUS CLOUD DECK (Elevations: 120m to 240m)
  // =========================================================================
  const cloudGroup = new THREE.Group();
  root.add(cloudGroup);

  const cloudPuffGeo = new THREE.SphereGeometry(14, 16, 16);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95,
    metalness: 0.0,
    transparent: true,
    opacity: 0.78
  });

  // Clustered cumulus cloud banks
  for (let c = 0; c < 14; c++) {
    const cluster = new THREE.Group();
    const cx = (Math.random() - 0.5) * 350;
    const cy = 130 + Math.random() * 80;
    const cz = (Math.random() - 0.5) * 350;
    cluster.position.set(cx, cy, cz);

    for (let p = 0; p < 5; p++) {
      const puff = new THREE.Mesh(cloudPuffGeo, cloudMat);
      puff.position.set(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 22
      );
      const s = 0.8 + Math.random() * 0.9;
      puff.scale.set(s * 1.4, s * 0.7, s * 1.2);
      cluster.add(puff);
    }
    cloudGroup.add(cluster);
  }

  // =========================================================================
  // 7. LIGHTING RIG (RADIANT GOLDEN FLORIDA SUNRISE)
  // =========================================================================
  // 1. Hemisphere Light: Bright Sky Blue ceiling with Warm Golden Sand bounce
  const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x854d0e, 2.4);
  root.add(hemiLight);

  // 2. Primary Directional Sunlight (Morning Sun rising over Atlantic Ocean)
  const sunLight = new THREE.DirectionalLight(0xfffaed, 3.8);
  sunLight.position.set(70, 50, 45); // Warm low-angle morning sun
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 180;
  sunLight.shadow.camera.left = -40;
  sunLight.shadow.camera.right = 40;
  sunLight.shadow.camera.top = 50;
  sunLight.shadow.camera.bottom = -10;
  sunLight.shadow.bias = -0.0005;
  root.add(sunLight);

  // 3. Ocean Reflection Fill Light (Cool azure bounce from East)
  const oceanFillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
  oceanFillLight.position.set(90, 20, -30);
  root.add(oceanFillLight);

  // =========================================================================
  // 8. DYNAMIC UPDATE & ATMOSPHERE FADE CONTROLLER
  // =========================================================================
  let swingArmAngle = 0;
  let isRetracted = false;

  const setSwingArmsRetracted = (val = true) => {
    isRetracted = val;
  };

  /**
   * Smoothly transitions from blue Earth atmosphere to deep space as rocket climbs
   * @param {number} altitudeNorm 0.0 (launchpad) to 1.0 (deep space)
   */
  const setSpaceTransition = (altitudeNorm) => {
    const norm = Math.max(0, Math.min(1, altitudeNorm));
    // Sky dome fades away, revealing starfield
    skyMat.opacity = Math.max(0, 1.0 - norm * 1.2);
    starMat.opacity = Math.min(1.0, norm * 1.35);

    // Fade cloud visibility at extreme altitude
    cloudMat.opacity = Math.max(0, 0.78 * (1.0 - norm * 1.5));

    // Ground terrain dims slightly as seen from space
    if (norm > 0.4) {
      landMat.color.setHex(0x1e293b);
    }
  };

  const update = (delta, elapsed, rocketAltitude = 0) => {
    // Retract swing arms smoothly
    if (isRetracted && swingArmAngle < Math.PI * 0.45) {
      swingArmAngle += delta * 1.2;
      swingArms.forEach((arm, idx) => {
        arm.rotation.y = -swingArmAngle * (1.0 + idx * 0.15);
      });
    }

    // Gentle cloud drift
    cloudGroup.position.x += delta * 1.2;
    if (cloudGroup.position.x > 150) cloudGroup.position.x = -150;

    // Ocean water sun shimmer
    oceanMat.roughness = 0.12 + Math.sin(elapsed * 2.0) * 0.02;

    // Atmosphere transition based on altitude
    if (rocketAltitude > 50) {
      const spaceProgress = Math.min(1.0, (rocketAltitude - 50) / 250);
      setSpaceTransition(spaceProgress);
    } else {
      setSpaceTransition(0);
    }
  };

  return {
    root,
    update,
    setSwingArmsRetracted,
    setSpaceTransition,
    sunLight,
    hemiLight,
    skyDome,
    cloudGroup,
    terrainGroup
  };
}
