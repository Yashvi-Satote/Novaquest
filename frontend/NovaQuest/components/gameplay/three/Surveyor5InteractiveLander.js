import * as THREE from 'three';

/**
 * Surveyor5InteractiveLander.js
 * 
 * High-Fidelity 3D Model of the 1967 Surveyor 5 Lunar Lander
 * Features:
 * - Triangular tubular spaceframe with aluminum equipment compartments
 * - 3 articulated landing gear legs with shock struts and footpads
 * - Steerable planar solar panel mast
 * - High-gain planar antenna dish & TV camera optical turret
 * - Alpha-Scattering instrument sensor head with tether
 * - Dynamic malfunction state: spark particles, flashing warning lights, tilted unaligned panel
 * - Dynamic repair state: solar panel tracks sun, TV camera scans, cyan power beacon illuminates
 */
export function createSurveyor5InteractiveLander() {
  const root = new THREE.Group();
  root.name = 'Surveyor5Lander';

  // --- Materials ---
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // brushed aerospace aluminum
    metalness: 0.8,
    roughness: 0.25
  });

  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Kapton thermal insulation gold foil
    metalness: 0.95,
    roughness: 0.15
  });

  const solarCellMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a, // deep blue solar cells
    metalness: 0.85,
    roughness: 0.15
  });

  const legMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.7,
    roughness: 0.3
  });

  const padMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.7
  });

  const warningMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const onlineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  // 1. Triangular Center Spaceframe Core
  const frameGeo = new THREE.CylinderGeometry(0.85, 1.25, 1.35, 3);
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.position.y = 1.3;
  root.add(frameMesh);

  // Equipment Compartments A & B (Thermal control boxes wrapped in foil)
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

  // Solid Propellant Main Retro-Rocket Nozzle (Bottom center)
  const retroGeo = new THREE.ConeGeometry(0.38, 0.9, 16, 1, true);
  const retroMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
  const retroNozzle = new THREE.Mesh(retroGeo, retroMat);
  retroNozzle.rotation.x = Math.PI;
  retroNozzle.position.set(0, 0.55, 0);
  root.add(retroNozzle);

  // 2. Three Shock Absorber Landing Gear Legs
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

    // Honeycomb Footpad
    const padGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16);
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(2.35, 0.06, 0);
    legPivot.add(pad);
  }

  // 3. Central Mast with Planar Solar Panel & High Gain Antenna
  const mastPivot = new THREE.Group();
  mastPivot.position.set(0, 1.95, 0);
  root.add(mastPivot);

  const mastPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1.4),
    frameMat
  );
  mastPole.position.y = 0.7;
  mastPivot.add(mastPole);

  // Solar Panel Group (rotates and tilts)
  const solarGroup = new THREE.Group();
  solarGroup.position.set(0, 1.4, 0);
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

  // Planar High Gain Antenna
  const antennaGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.06, 24);
  const antenna = new THREE.Mesh(antennaGeo, frameMat);
  antenna.position.set(-0.7, 1.3, -0.4);
  antenna.rotation.z = 0.5;
  mastPivot.add(antenna);

  // 4. TV Camera Turret (Rotates when online)
  const tvCameraGroup = new THREE.Group();
  tvCameraGroup.position.set(0.65, 1.95, 0.35);
  root.add(tvCameraGroup);

  const tvBodyGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.65, 16);
  const tvBody = new THREE.Mesh(tvBodyGeo, frameMat);
  tvCameraGroup.add(tvBody);

  const tvLensGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16);
  const tvLens = new THREE.Mesh(tvLensGeo, new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
  tvLens.rotation.x = Math.PI / 2;
  tvLens.position.set(0, 0.15, 0.15);
  tvCameraGroup.add(tvLens);

  // 5. Alpha-Scattering Instrument Sensor Head (Deployed on lunar regolith)
  const alphaSensor = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.25, 0.35),
    goldFoilMat
  );
  alphaSensor.position.set(0, 0.12, 1.6);
  root.add(alphaSensor);

  // Tether cord from frame to sensor
  const cordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.0, 0.7),
    new THREE.Vector3(0, 0.4, 1.2),
    new THREE.Vector3(0, 0.12, 1.6)
  ]);
  const cordGeo = new THREE.TubeGeometry(cordCurve, 16, 0.02, 6, false);
  const cordMesh = new THREE.Mesh(cordGeo, new THREE.MeshBasicMaterial({ color: 0x475569 }));
  root.add(cordMesh);

  // 6. Damaged Power Junction Box (Location for repair!)
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

  // 7. Interactive Malfunction Spark Particles
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

  // 8. Main Beacon Light
  const beaconLight = new THREE.PointLight(0xef4444, 2.0, 10);
  beaconLight.position.set(0, 2.7, 0);
  root.add(beaconLight);

  const beaconOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 16),
    warningMat
  );
  beaconOrb.position.set(0, 2.7, 0);
  root.add(beaconOrb);

  // State Management
  const state = {
    isRepaired: false,
    isSolarAligned: false,
    targetSolarAngle: 0.85, // tilted down when damaged
    currentSolarAngle: 0.85
  };

  const update = (delta, timeSeconds) => {
    // 1. Malfunction vs Repaired Sparks & Lights
    if (!state.isRepaired) {
      // Sparks active
      sparkParticles.visible = true;
      const pos = sparkGeo.attributes.position.array;
      for (let i = 0; i < sparkCount; i++) {
        const v = sparkVels[i];
        v.life += delta * 2.0;
        if (v.life > 1.0) {
          v.life = 0;
          pos[i * 3] = -0.65;
          pos[i * 3 + 1] = 0.95;
          pos[i * 3 + 2] = -0.45;
        } else {
          pos[i * 3] += v.vx * delta;
          pos[i * 3 + 1] += (v.vy - 1.5 * v.life) * delta;
          pos[i * 3 + 2] += v.vz * delta;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;

      // Red flashing beacon
      const flash = Math.sin(timeSeconds * 6) > 0;
      beaconLight.color.setHex(0xef4444);
      beaconLight.intensity = flash ? 3.5 : 0.5;
      beaconOrb.material = warningMat;
      statusLed.material = warningMat;
    } else {
      // Repaired! Sparks off, green/cyan steady lights
      sparkParticles.visible = false;
      statusLed.material = onlineMat;

      if (!state.isSolarAligned) {
        // Halfway state
        beaconLight.color.setHex(0xf59e0b);
        beaconLight.intensity = 2.0;
      } else {
        // Fully operational: brilliant cyan beacon & rotating TV camera
        beaconLight.color.setHex(0x38bdf8);
        beaconLight.intensity = 4.0 + Math.sin(timeSeconds * 3) * 1.0;
        beaconOrb.material = onlineMat;

        // TV camera pans to photograph the moon
        tvCameraGroup.rotation.y += 0.8 * delta;

        // Smoothly realign solar panel to face sunlight
        state.targetSolarAngle = 0.15; // oriented towards sun
      }
    }

    // Smoothly interpolate solar panel angle
    state.currentSolarAngle += (state.targetSolarAngle - state.currentSolarAngle) * 2.0 * delta;
    solarGroup.rotation.x = state.currentSolarAngle;
  };

  const setRepaired = (val) => {
    state.isRepaired = Boolean(val);
  };

  const setSolarAligned = (val) => {
    state.isSolarAligned = Boolean(val);
  };

  return {
    root,
    update,
    setRepaired,
    setSolarAligned,
    state,
    junctionGroup,
    solarGroup
  };
}
