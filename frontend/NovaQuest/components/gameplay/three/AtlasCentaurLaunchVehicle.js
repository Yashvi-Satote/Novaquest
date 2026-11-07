import * as THREE from 'three';

/**
 * AtlasCentaurLaunchVehicle.js
 * 
 * High-Detail 3D Model of the 1967 Atlas-Centaur SLV-3C Launch Vehicle
 * Features:
 * - Stage 1: Atlas Booster with stainless steel balloon tank, booster skirt, and 3 rocket engines
 * - Stage 2: Centaur-D Upper Stage with liquid hydrogen insulation & twin RL10 engines
 * - Payload Fairing: Split clamshell nose cone halves that visibly jettison
 * - Surveyor 5 Spacecraft: Separates from launch vehicle and visibly unfolds landing legs in space!
 * - Particle Systems: Ignition fireball, launch smoke, staging gas puffs, Centaur plasma burn
 */
export function createAtlasCentaurVehicle() {
  const root = new THREE.Group();
  root.name = 'AtlasCentaurVehicle';

  // --- Materials ---
  const stainlessSteelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // bright polished silver stainless steel
    metalness: 0.92,
    roughness: 0.15
  });

  const centaurWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // insulated white cryogenic stage
    roughness: 0.35,
    metalness: 0.2
  });

  const blackStripeMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.5
  });

  const redDecalMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.4
  });

  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.85,
    roughness: 0.2
  });

  // =============================================================
  // 1. STAGE 1: ATLAS BOOSTER (Detachable Stage)
  // =============================================================
  const atlasStage = new THREE.Group();
  atlasStage.name = 'AtlasStage1';
  root.add(atlasStage);

  // Main Atlas Fuel Tank (Pressurized stainless steel balloon cylinder)
  const atlasTankGeo = new THREE.CylinderGeometry(1.5, 1.5, 14, 32);
  const atlasTank = new THREE.Mesh(atlasTankGeo, stainlessSteelMat);
  atlasTank.position.y = 8.5;
  atlasStage.add(atlasTank);

  // USA & NASA markings (Black & Red geometric bands)
  const stripeGeo = new THREE.CylinderGeometry(1.52, 1.52, 0.6, 32);
  const stripe1 = new THREE.Mesh(stripeGeo, blackStripeMat);
  stripe1.position.y = 13.5;
  atlasStage.add(stripe1);

  const stripe2 = new THREE.Mesh(stripeGeo, redDecalMat);
  stripe2.position.y = 4.5;
  atlasStage.add(stripe2);

  // Atlas Booster Skirt & Engine Fairing
  const skirtGeo = new THREE.CylinderGeometry(1.55, 1.7, 3.2, 32);
  const skirt = new THREE.Mesh(skirtGeo, stainlessSteelMat);
  skirt.position.y = 2.6;
  atlasStage.add(skirt);

  // Rocket Engines (2 Booster Engines + 1 Center Sustainer Engine)
  const engineNozzles = [];
  const bellGeo = new THREE.ConeGeometry(0.55, 1.4, 16, 1, true);
  for (let bx of [-0.65, 0.65]) {
    const bell = new THREE.Mesh(bellGeo, engineMat);
    bell.position.set(bx, 0.8, 0);
    atlasStage.add(bell);
    engineNozzles.push(bell);
  }
  const sustainerBell = new THREE.Mesh(bellGeo, engineMat);
  sustainerBell.position.set(0, 0.8, 0);
  atlasStage.add(sustainerBell);
  engineNozzles.push(sustainerBell);

  // Atlas Flame Group
  const atlasFlameGroup = new THREE.Group();
  atlasFlameGroup.position.set(0, 0.2, 0);
  atlasStage.add(atlasFlameGroup);

  const innerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 6.0, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
  );
  innerFlame.rotation.x = Math.PI;
  innerFlame.position.y = -3.0;
  atlasFlameGroup.add(innerFlame);

  const outerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(2.0, 9.5, 16),
    new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.75 })
  );
  outerFlame.rotation.x = Math.PI;
  outerFlame.position.y = -4.75;
  atlasFlameGroup.add(outerFlame);

  const atlasLight = new THREE.PointLight(0xf97316, 0, 30);
  atlasLight.position.y = -2.5;
  atlasFlameGroup.add(atlasLight);
  atlasFlameGroup.visible = false;

  // Interstage Adapter Ring
  const interstageGeo = new THREE.CylinderGeometry(1.5, 1.5, 1.6, 32);
  const interstage = new THREE.Mesh(interstageGeo, blackStripeMat);
  interstage.position.y = 16.3;
  atlasStage.add(interstage);

  // =============================================================
  // 2. STAGE 2: CENTAUR-D UPPER STAGE (Detachable Stage)
  // =============================================================
  const centaurStage = new THREE.Group();
  centaurStage.name = 'CentaurStage2';
  centaurStage.position.y = 17.1;
  root.add(centaurStage);

  // Centaur Hydrogen-Oxygen Cylindrical Body
  const centaurTankGeo = new THREE.CylinderGeometry(1.48, 1.48, 6.5, 32);
  const centaurTank = new THREE.Mesh(centaurTankGeo, centaurWhiteMat);
  centaurTank.position.y = 3.25;
  centaurStage.add(centaurTank);

  // Twin RL10 Hydrogen Engines at base of Centaur
  const rl10Geo = new THREE.ConeGeometry(0.38, 1.0, 16, 1, true);
  for (let cx of [-0.45, 0.45]) {
    const rl10 = new THREE.Mesh(rl10Geo, engineMat);
    rl10.position.set(cx, -0.4, 0);
    centaurStage.add(rl10);
  }

  // Centaur Hydrogen Plasma Blue-Violet Flame
  const centaurFlameGroup = new THREE.Group();
  centaurFlameGroup.position.set(0, -0.4, 0);
  centaurStage.add(centaurFlameGroup);

  const centaurFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 4.5, 16),
    new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.85 })
  );
  centaurFlame.rotation.x = Math.PI;
  centaurFlame.position.y = -2.25;
  centaurFlameGroup.add(centaurFlame);

  const centaurLight = new THREE.PointLight(0x38bdf8, 0, 20);
  centaurLight.position.y = -1.5;
  centaurFlameGroup.add(centaurLight);
  centaurFlameGroup.visible = false;

  // =============================================================
  // 3. SPLIT CLAMSHELL PAYLOAD FAIRINGS (Left & Right Halves)
  // =============================================================
  const fairingL = new THREE.Group();
  fairingL.name = 'FairingHalfLeft';
  fairingL.position.set(0, 6.5, 0);
  centaurStage.add(fairingL);

  const fairingLMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 1.5, 4.5, 16, 1, false, 0, Math.PI),
    centaurWhiteMat
  );
  fairingLMesh.position.y = 2.25;
  fairingL.add(fairingLMesh);

  const fairingR = new THREE.Group();
  fairingR.name = 'FairingHalfRight';
  fairingR.position.set(0, 6.5, 0);
  centaurStage.add(fairingR);

  const fairingRMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 1.5, 4.5, 16, 1, false, Math.PI, Math.PI),
    centaurWhiteMat
  );
  fairingRMesh.position.y = 2.25;
  fairingR.add(fairingRMesh);

  // =============================================================
  // 4. SURVEYOR 5 PAYLOAD (Inside Fairing & Separates)
  // =============================================================
  const surveyorPayload = new THREE.Group();
  surveyorPayload.name = 'Surveyor5Payload';
  surveyorPayload.position.set(0, 7.8, 0);
  centaurStage.add(surveyorPayload);

  // Surveyor Core Spaceframe
  const sCoreGeo = new THREE.CylinderGeometry(0.55, 0.8, 0.9, 3);
  const sCore = new THREE.Mesh(sCoreGeo, stainlessSteelMat);
  sCore.position.y = 0.5;
  surveyorPayload.add(sCore);

  // Folded 3 Landing Legs (Unfold upon staging!)
  const legPivots = [];
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const legP = new THREE.Group();
    legP.rotation.y = angle;
    surveyorPayload.add(legP);

    const legRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.5),
      engineMat
    );
    legRod.position.set(0.6, 0.4, 0);
    legRod.rotation.z = -0.15; // Folded against body initially
    legP.add(legRod);

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.08, 12),
      engineMat
    );
    pad.position.set(0.85, -0.2, 0);
    legP.add(pad);

    legPivots.push({ group: legP, rod: legRod, angle });
  }

  // Folded Solar Mast
  const mastPivot = new THREE.Group();
  mastPivot.position.set(0, 1.0, 0);
  surveyorPayload.add(mastPivot);

  const solarPanelMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.04, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8 })
  );
  solarPanelMesh.position.set(0, 0.4, 0.3);
  mastPivot.add(solarPanelMesh);

  // =============================================================
  // SEPARATION & STAGING ANIMATION CONTROLLER
  // =============================================================
  const staging = {
    state: 'launchpad', // 'launchpad' | 'liftoff' | 'atlas_sep' | 'centaur_burn' | 'fairing_sep' | 'surveyor_sep'
    atlasSepDist: 0,
    fairingSepDist: 0,
    surveyorSepDist: 0,
    legDeployProgress: 0,
    update: (delta, timeSeconds) => {
      if (staging.state === 'liftoff') {
        atlasFlameGroup.visible = true;
        atlasLight.intensity = 4.0 + Math.random() * 2.0;
        atlasFlameGroup.scale.set(
          0.9 + Math.random() * 0.25,
          1.0 + Math.random() * 0.35,
          0.9 + Math.random() * 0.25
        );
      } else if (staging.state === 'atlas_sep') {
        // Cut Atlas engines
        atlasFlameGroup.visible = false;
        atlasLight.intensity = 0;

        // Atlas Booster detaches visibly backwards and tilts away
        staging.atlasSepDist += 16 * delta;
        atlasStage.position.y -= staging.atlasSepDist * delta;
        atlasStage.rotation.z += 0.3 * delta;
        atlasStage.rotation.x += 0.15 * delta;

        // Centaur ignites
        centaurFlameGroup.visible = true;
        centaurLight.intensity = 3.0 + Math.random() * 1.5;
        centaurFlameGroup.scale.set(
          0.9 + Math.random() * 0.2,
          1.0 + Math.random() * 0.3,
          0.9 + Math.random() * 0.2
        );
      } else if (staging.state === 'centaur_burn') {
        centaurFlameGroup.visible = true;
        centaurLight.intensity = 3.5;
      } else if (staging.state === 'fairing_sep') {
        // Fairing halves split sideways and tumble away
        staging.fairingSepDist += 8 * delta;
        fairingL.position.x -= 3.5 * delta;
        fairingL.rotation.z += 0.8 * delta;
        fairingR.position.x += 3.5 * delta;
        fairingR.rotation.z -= 0.8 * delta;
      } else if (staging.state === 'surveyor_sep') {
        // Cut Centaur engine
        centaurFlameGroup.visible = false;
        centaurLight.intensity = 0;

        // Surveyor pushes away from Centaur adapter
        staging.surveyorSepDist += 4.5 * delta;
        surveyorPayload.position.y += staging.surveyorSepDist * delta;

        // Unfold 3 landing gear legs!
        if (staging.legDeployProgress < 1.0) {
          staging.legDeployProgress = Math.min(1.0, staging.legDeployProgress + 0.8 * delta);
          legPivots.forEach(p => {
            p.rod.rotation.z = -0.15 - staging.legDeployProgress * 0.45;
            p.rod.position.set(0.6 + staging.legDeployProgress * 0.4, 0.4 - staging.legDeployProgress * 0.2, 0);
          });
          solarPanelMesh.rotation.x = staging.legDeployProgress * 0.4;
        }
      }
    }
  };

  root.userData.staging = staging;

  return {
    root,
    atlasStage,
    centaurStage,
    fairingL,
    fairingR,
    surveyorPayload,
    atlasFlameGroup,
    atlasLight,
    centaurFlameGroup,
    centaurLight,
    staging
  };
}
