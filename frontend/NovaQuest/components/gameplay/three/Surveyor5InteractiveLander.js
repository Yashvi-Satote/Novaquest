import * as THREE from 'three';

/**
 * Surveyor5InteractiveLander.js
 * 
 * High-Fidelity 3D Model of the 1967 Surveyor 5 Lunar Lander
 * with 4 Dynamic Installation Slots for the Lost Components:
 * 1. Television Camera Turret (360° panoramic camera)
 * 2. Alpha-Scattering Surface Analyzer (Soil chemistry sensor with tether)
 * 3. Planar High-Gain Antenna (Radio transmission dish)
 * 4. Solar Panel Array (Photovoltaic array that tracks the Sun)
 * 
 * Dynamic Behavior:
 * - Damaged state: Missing components, red emergency beacon, spark particles
 * - As components are retrieved by Leo, each snaps into its mechanical slot
 * - Fully assembled state: Sparks stop, cyan power beacon illuminates, solar array tracks Sun, TV camera sweeps 360°!
 */
export function createSurveyor5InteractiveLander() {
  const root = new THREE.Group();
  root.name = 'Surveyor5Lander';

  // --- Materials ---
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // brushed aerospace aluminum
    metalness: 0.82,
    roughness: 0.22
  });

  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Kapton thermal insulation gold foil
    metalness: 0.95,
    roughness: 0.15
  });

  const solarCellMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a, // deep blue solar cells
    metalness: 0.88,
    roughness: 0.12
  });

  const legMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.72,
    roughness: 0.28
  });

  const padMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.75
  });

  const warningMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const onlineCyanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const cameraLensMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

  // =========================================================================
  // 1. TRIANGULAR CENTER SPACEFRAME CORE
  // =========================================================================
  const frameGeo = new THREE.CylinderGeometry(0.85, 1.25, 1.35, 3);
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.position.y = 1.3;
  root.add(frameMesh);

  // Equipment Compartments A & B (Thermal control boxes wrapped in gold foil)
  const compAGeo = new THREE.BoxGeometry(0.7, 0.6, 0.5);
  const compA = new THREE.Mesh(compAGeo, goldFoilMat);
  compA.position.set(0.65, 1.2, 0.3);
  root.add(compA);

  const compBGeo = new THREE.BoxGeometry(0.6, 0.55, 0.5);
  const compB = new THREE.Mesh(compBGeo, frameMat);
  compB.position.set(-0.65, 1.2, 0.3);
  root.add(compB);

  // Spherical Helium Pressurization Tank (Center)
  const tankGeo = new THREE.SphereGeometry(0.42, 20, 20);
  const tankMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.1 });
  const heliumTank = new THREE.Mesh(tankGeo, tankMat);
  heliumTank.position.set(0, 1.3, -0.2);
  root.add(heliumTank);

  // Main Retro-Rocket Nozzle (Bottom center)
  const retroGeo = new THREE.ConeGeometry(0.38, 0.9, 16, 1, true);
  const retroMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
  const retroNozzle = new THREE.Mesh(retroGeo, retroMat);
  retroNozzle.rotation.x = Math.PI;
  retroNozzle.position.set(0, 0.55, 0);
  root.add(retroNozzle);

  // =========================================================================
  // 2. THREE SHOCK ABSORBER LANDING GEAR LEGS
  // =========================================================================
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const legPivot = new THREE.Group();
    legPivot.rotation.y = angle;
    root.add(legPivot);

    // Diagonal upper shock strut
    const strutGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.4);
    const strut = new THREE.Mesh(strutGeo, legMat);
    strut.position.set(1.4, 0.75, 0);
    strut.rotation.z = -0.55;
    legPivot.add(strut);

    // Shock cylinder
    const shockGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.9, 12);
    const shock = new THREE.Mesh(shockGeo, frameMat);
    shock.position.set(1.4, 0.75, 0);
    shock.rotation.z = -0.55;
    legPivot.add(shock);

    // Honeycomb Footpad
    const padGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16);
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(2.35, 0.06, 0);
    legPivot.add(pad);
  }

  // =========================================================================
  // 3. CENTRAL MAST
  // =========================================================================
  const mastPivot = new THREE.Group();
  mastPivot.position.set(0, 1.95, 0);
  root.add(mastPivot);

  const mastPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1.4, 16),
    frameMat
  );
  mastPole.position.y = 0.7;
  mastPivot.add(mastPole);

  // Mast Mount Bracket for Solar Array
  const solarBracketGeo = new THREE.BoxGeometry(0.3, 0.18, 0.25);
  const solarBracket = new THREE.Mesh(solarBracketGeo, frameMat);
  solarBracket.position.y = 1.38;
  mastPivot.add(solarBracket);

  // =========================================================================
  // 4. SLOT 1: SOLAR PANEL ARRAY (Mounted on Mast)
  // =========================================================================
  const solarGroup = new THREE.Group();
  solarGroup.position.set(0, 1.4, 0);
  solarGroup.visible = false; // Initially missing until installed!
  mastPivot.add(solarGroup);

  const solarPanelGeo = new THREE.BoxGeometry(1.6, 0.05, 0.95);
  const solarPanel = new THREE.Mesh(solarPanelGeo, solarCellMat);
  solarPanel.position.z = 0.45;
  solarGroup.add(solarPanel);

  // Gold foil frame around solar panel
  const solarBorder = new THREE.Mesh(
    new THREE.BoxGeometry(1.68, 0.04, 1.02),
    goldFoilMat
  );
  solarBorder.position.z = 0.45;
  solarGroup.add(solarBorder);

  // =========================================================================
  // 5. SLOT 2: PLANAR HIGH-GAIN ANTENNA (Mounted on Mast Side)
  // =========================================================================
  const antennaGroup = new THREE.Group();
  antennaGroup.position.set(-0.7, 1.3, -0.4);
  antennaGroup.rotation.z = 0.5;
  antennaGroup.visible = false; // Initially missing until installed!
  mastPivot.add(antennaGroup);

  const antennaGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.06, 24);
  const antenna = new THREE.Mesh(antennaGeo, frameMat);
  antennaGroup.add(antenna);

  const feedHorn = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.35, 16),
    goldFoilMat
  );
  feedHorn.position.y = 0.22;
  antennaGroup.add(feedHorn);

  // =========================================================================
  // 6. SLOT 3: TV CAMERA TURRET (Mounted on Spaceframe Corner)
  // =========================================================================
  const tvCameraGroup = new THREE.Group();
  tvCameraGroup.position.set(0.65, 1.95, 0.35);
  tvCameraGroup.visible = false; // Initially missing until installed!
  root.add(tvCameraGroup);

  const tvBodyGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.65, 16);
  const tvBody = new THREE.Mesh(tvBodyGeo, frameMat);
  tvCameraGroup.add(tvBody);

  const tvLensGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16);
  const tvLens = new THREE.Mesh(tvLensGeo, cameraLensMat);
  tvLens.rotation.x = Math.PI / 2;
  tvLens.position.set(0, 0.15, 0.15);
  tvCameraGroup.add(tvLens);

  // Top Rotating Mirror Hood
  const mirrorHoodGeo = new THREE.BoxGeometry(0.22, 0.22, 0.14);
  const mirrorHood = new THREE.Mesh(mirrorHoodGeo, frameMat);
  mirrorHood.position.set(0, 0.35, 0);
  tvCameraGroup.add(mirrorHood);

  // =========================================================================
  // 7. SLOT 4: ALPHA-SCATTERING ANALYZER (Deployed on Lunar Soil)
  // =========================================================================
  const alphaSensorGroup = new THREE.Group();
  alphaSensorGroup.visible = false; // Initially missing until installed!
  root.add(alphaSensorGroup);

  const alphaSensor = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.25, 0.38),
    goldFoilMat
  );
  alphaSensor.position.set(0, 0.12, 1.6);
  alphaSensorGroup.add(alphaSensor);

  // Tether cord from spaceframe to sensor
  const cordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.0, 0.7),
    new THREE.Vector3(0, 0.4, 1.2),
    new THREE.Vector3(0, 0.12, 1.6)
  ]);
  const cordGeo = new THREE.TubeGeometry(cordCurve, 16, 0.02, 6, false);
  const cordMesh = new THREE.Mesh(cordGeo, new THREE.MeshBasicMaterial({ color: 0x475569 }));
  alphaSensorGroup.add(cordMesh);

  // =========================================================================
  // 8. MALFUNCTION SPARKS & WARNING SYSTEM
  // =========================================================================
  const junctionGroup = new THREE.Group();
  junctionGroup.position.set(-0.65, 0.95, -0.45);
  root.add(junctionGroup);

  const junctionBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.24, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
  );
  junctionGroup.add(junctionBox);

  // Status LED on junction
  const statusLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    warningMat
  );
  statusLed.position.set(0, 0.08, 0.1);
  junctionGroup.add(statusLed);

  // Sparks
  const sparkCount = 40;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(sparkCount * 3);
  const sparkVels = [];
  for (let i = 0; i < sparkCount; i++) {
    sparkPos[i * 3] = -0.65 + (Math.random() - 0.5) * 0.1;
    sparkPos[i * 3 + 1] = 0.95 + (Math.random() - 0.5) * 0.1;
    sparkPos[i * 3 + 2] = -0.45 + (Math.random() - 0.5) * 0.1;
    sparkVels.push({
      vx: (Math.random() - 0.5) * 2.5,
      vy: Math.random() * 2.0,
      vz: (Math.random() - 0.5) * 2.5,
      life: Math.random()
    });
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({
    color: 0xf59e0b,
    size: 0.15,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  const sparkParticles = new THREE.Points(sparkGeo, sparkMat);
  root.add(sparkParticles);

  // Main Mast Beacon Light (Red when malfunctioning, Cyan when online)
  const beaconLight = new THREE.PointLight(0xef4444, 2.5, 12);
  beaconLight.position.set(0, 2.7, 0);
  root.add(beaconLight);

  const beaconOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 16),
    warningMat
  );
  beaconOrb.position.set(0, 2.7, 0);
  root.add(beaconOrb);

  // =========================================================================
  // 9. REPAIR STATE MANAGEMENT & API
  // =========================================================================
  const installedSlots = {
    solar_panel: false,
    antenna: false,
    tv_camera: false,
    alpha_sensor: false
  };

  const state = {
    isRepaired: false,
    isSolarAligned: false,
    targetSolarAngle: 0.85,
    currentSolarAngle: 0.85
  };

  const installSlot = (slotId) => {
    if (slotId === 'solar_panel') {
      solarGroup.visible = true;
      installedSlots.solar_panel = true;
      state.targetSolarAngle = 0.25; // align toward sunlight
    } else if (slotId === 'antenna') {
      antennaGroup.visible = true;
      installedSlots.antenna = true;
    } else if (slotId === 'tv_camera') {
      tvCameraGroup.visible = true;
      installedSlots.tv_camera = true;
    } else if (slotId === 'alpha_sensor') {
      alphaSensorGroup.visible = true;
      installedSlots.alpha_sensor = true;
    }

    // Check if all installed
    if (areAllSlotsInstalled()) {
      setRepaired(true);
    }
  };

  const isSlotInstalled = (slotId) => {
    return !!installedSlots[slotId];
  };

  const areAllSlotsInstalled = () => {
    return (
      installedSlots.solar_panel &&
      installedSlots.antenna &&
      installedSlots.tv_camera &&
      installedSlots.alpha_sensor
    );
  };

  const getInstalledSlotsCount = () => {
    return Object.values(installedSlots).filter(Boolean).length;
  };

  const setRepaired = (val = true) => {
    state.isRepaired = val;
    sparkParticles.visible = !val;
    if (val) {
      statusLed.material = onlineCyanMat;
      beaconOrb.material = onlineCyanMat;
      beaconLight.color.setHex(0x38bdf8);
      beaconLight.intensity = 3.5;
    } else {
      statusLed.material = warningMat;
      beaconOrb.material = warningMat;
      beaconLight.color.setHex(0xef4444);
      beaconLight.intensity = 2.0;
    }
  };

  const setSolarAligned = (val = true) => {
    state.isSolarAligned = val;
    state.targetSolarAngle = val ? 0.05 : 0.85;
  };

  const update = (delta, elapsed) => {
    if (!state.isRepaired) {
      // Emergency strobe blink
      const flash = (Math.sin(elapsed * 7) > 0) ? 2.5 : 0.4;
      beaconLight.intensity = flash;

      // Update malfunction spark physics
      const pPos = sparkGeo.attributes.position.array;
      for (let i = 0; i < sparkCount; i++) {
        const vel = sparkVels[i];
        pPos[i * 3] += vel.vx * delta;
        pPos[i * 3 + 1] += vel.vy * delta;
        pPos[i * 3 + 2] += vel.vz * delta;
        vel.vy -= 9.8 * delta; // lunar gravity fall
        vel.life -= delta * 1.8;

        if (vel.life <= 0) {
          pPos[i * 3] = -0.65 + (Math.random() - 0.5) * 0.08;
          pPos[i * 3 + 1] = 0.95 + (Math.random() - 0.5) * 0.08;
          pPos[i * 3 + 2] = -0.45 + (Math.random() - 0.5) * 0.08;
          vel.vx = (Math.random() - 0.5) * 2.5;
          vel.vy = Math.random() * 2.2;
          vel.vz = (Math.random() - 0.5) * 2.5;
          vel.life = 0.6 + Math.random() * 0.6;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;
    } else {
      // Repaired state animations
      beaconLight.intensity = 2.5 + Math.sin(elapsed * 2.5) * 0.5;

      // TV camera 360-degree continuous scanning sweep
      if (installedSlots.tv_camera) {
        tvCameraGroup.rotation.y = elapsed * 0.6;
      }

      // Antenna subtle tracking tilt
      if (installedSlots.antenna) {
        antennaGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.08;
      }

      // Solar panel alignment tracking
      state.currentSolarAngle += (state.targetSolarAngle - state.currentSolarAngle) * (delta * 2.0);
      solarGroup.rotation.x = state.currentSolarAngle;
      solarGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.15;
    }
  };

  return {
    root,
    update,
    installSlot,
    isSlotInstalled,
    areAllSlotsInstalled,
    getInstalledSlotsCount,
    setRepaired,
    setSolarAligned,
    installedSlots,
    state,
    parts: {
      solarGroup,
      antennaGroup,
      tvCameraGroup,
      alphaSensorGroup,
      sparkParticles,
      beaconLight
    }
  };
}
