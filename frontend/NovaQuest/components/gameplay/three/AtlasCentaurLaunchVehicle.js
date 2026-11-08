import * as THREE from 'three';

/**
 * AtlasCentaurLaunchVehicle.js
 * 
 * High-Detail 3D Model of the 1967 Atlas-Centaur SLV-3C Launch Vehicle
 * Features:
 * - Stage 1: Atlas Booster with polished stainless steel balloon tank, external propellant conduits,
 *   aerodynamic booster skirt, and 3 Rocketdyne engine bells
 * - Stage 2: Centaur-D Upper Stage with pure white cryogenic liquid hydrogen insulation & twin RL10 engines
 * - Payload Fairing: Split clamshell aerodynamic nose cone that visibly jettisons sideways
 * - Surveyor 5 Spacecraft: Separates from Centaur adapter and visibly unfolds its 3 landing legs & solar mast in space!
 * - Particle Systems: Fiery supersonic flame plume, ground blast illumination, staging gas puffs, Centaur plasma burn
 */
export function createAtlasCentaurVehicle() {
  const root = new THREE.Group();
  root.name = 'AtlasCentaurVehicle';

  // =========================================================================
  // MATERIALS SPECIFICATION (Physically Based Aerospace Materials)
  // =========================================================================
  // Atlas Balloon Tank: Gleaming stainless steel / aerospace aluminum (clearly visible in sunlight!)
  const stainlessSteelMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // bright aerospace silver-white
    metalness: 0.65,
    roughness: 0.25
  });

  // Centaur Cryogenic Insulation: Pure brilliant white
  const centaurWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.32,
    metalness: 0.15
  });

  const blackStripeMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.5
  });

  const redDecalMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.35
  });

  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.88,
    roughness: 0.22
  });

  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.15
  });

  // =========================================================================
  // 1. STAGE 1: ATLAS BOOSTER (Detachable Stage)
  // =========================================================================
  const atlasStage = new THREE.Group();
  atlasStage.name = 'AtlasStage1';
  root.add(atlasStage);

  // Main Atlas Propellant Tank (Pressurized stainless steel balloon cylinder)
  const atlasTankGeo = new THREE.CylinderGeometry(1.5, 1.5, 14, 32);
  const atlasTank = new THREE.Mesh(atlasTankGeo, stainlessSteelMat);
  atlasTank.position.y = 8.5;
  atlasTank.castShadow = true;
  atlasStage.add(atlasTank);

  // External Liquid Oxygen (LOX) Feed Conduits (Iconic Atlas rocket side pipes)
  const pipeGeo = new THREE.CylinderGeometry(0.09, 0.09, 13.5, 12);
  for (let px of [-1.52, 1.52]) {
    const pipe = new THREE.Mesh(pipeGeo, stainlessSteelMat);
    pipe.position.set(px, 8.5, 0);
    atlasStage.add(pipe);
  }

  // USA & NASA markings (Black & Red geometric roll pattern bands)
  const stripeGeo = new THREE.CylinderGeometry(1.52, 1.52, 0.6, 32);
  const stripe1 = new THREE.Mesh(stripeGeo, blackStripeMat);
  stripe1.position.y = 13.5;
  atlasStage.add(stripe1);

  const stripe2 = new THREE.Mesh(stripeGeo, redDecalMat);
  stripe2.position.y = 4.5;
  atlasStage.add(stripe2);

  // Atlas Booster Skirt & Engine Fairing
  const skirtGeo = new THREE.CylinderGeometry(1.55, 1.72, 3.2, 32);
  const skirt = new THREE.Mesh(skirtGeo, stainlessSteelMat);
  skirt.position.y = 2.6;
  skirt.castShadow = true;
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

  // Atlas Exhaust Flame Group
  const atlasFlameGroup = new THREE.Group();
  atlasFlameGroup.position.set(0, 0.2, 0);
  atlasStage.add(atlasFlameGroup);

  // Inner Core Flame (Brilliant White-Yellow Mach Diamond Cone)
  const innerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 7.0, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
  );
  innerFlame.rotation.x = Math.PI;
  innerFlame.position.y = -3.5;
  atlasFlameGroup.add(innerFlame);

  // Outer Supersonic Plasma Plume (Vibrant Orange Fire)
  const outerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(2.1, 11.5, 16),
    new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.8 })
  );
  outerFlame.rotation.x = Math.PI;
  outerFlame.position.y = -5.75;
  atlasFlameGroup.add(outerFlame);

  // Ground Blast Light
  const atlasLight = new THREE.PointLight(0xf97316, 0, 45);
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
  centaurTank.castShadow = true;
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
    new THREE.ConeGeometry(0.9, 5.5, 16),
    new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.9 })
  );
  centaurFlame.rotation.x = Math.PI;
  centaurFlame.position.y = -2.75;
  centaurFlameGroup.add(centaurFlame);

  const centaurLight = new THREE.PointLight(0x6366f1, 0, 25);
  centaurLight.position.y = -1.5;
  centaurFlameGroup.add(centaurLight);
  centaurFlameGroup.visible = false;

  // Payload Adapter Cone
  const adapterGeo = new THREE.CylinderGeometry(1.2, 1.48, 1.2, 32);
  const adapter = new THREE.Mesh(adapterGeo, centaurWhiteMat);
  adapter.position.y = 7.1;
  centaurStage.add(adapter);

  // =============================================================
  // 3. CLAMSHELL PAYLOAD FAIRING (Splits into 2 halves!)
  // =============================================================
  const fairingGroup = new THREE.Group();
  fairingGroup.position.y = 7.7;
  centaurStage.add(fairingGroup);

  // Left Fairing Half
  const fairingL = new THREE.Group();
  fairingGroup.add(fairingL);

  const fCylL = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 5.0, 24, 1, false, 0, Math.PI),
    centaurWhiteMat
  );
  fCylL.position.y = 2.5;
  fairingL.add(fCylL);

  const fConeL = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 3.5, 24, 1, false, 0, Math.PI),
    centaurWhiteMat
  );
  fConeL.position.y = 6.75;
  fairingL.add(fConeL);

  // Red roll alignment stripes on Fairing
  const fStripeL = new THREE.Mesh(
    new THREE.CylinderGeometry(1.51, 1.51, 0.4, 24, 1, false, 0, Math.PI),
    redDecalMat
  );
  fStripeL.position.y = 4.2;
  fairingL.add(fStripeL);

  // Right Fairing Half
  const fairingR = new THREE.Group();
  fairingGroup.add(fairingR);

  const fCylR = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 5.0, 24, 1, false, Math.PI, Math.PI),
    centaurWhiteMat
  );
  fCylR.position.y = 2.5;
  fairingR.add(fCylR);

  const fConeR = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 3.5, 24, 1, false, Math.PI, Math.PI),
    centaurWhiteMat
  );
  fConeR.position.y = 6.75;
  fairingR.add(fConeR);

  const fStripeR = new THREE.Mesh(
    new THREE.CylinderGeometry(1.51, 1.51, 0.4, 24, 1, false, Math.PI, Math.PI),
    redDecalMat
  );
  fStripeR.position.y = 4.2;
  fairingR.add(fStripeR);

  // =============================================================
  // 4. SURVEYOR 5 PAYLOAD (Inside Fairing, pushes away upon sep!)
  // =============================================================
  const surveyorPayload = new THREE.Group();
  surveyorPayload.name = 'Surveyor5Payload';
  surveyorPayload.position.y = 8.2;
  centaurStage.add(surveyorPayload);

  // Triangular Tubular Spaceframe
  const sCoreGeo = new THREE.CylinderGeometry(0.65, 0.95, 1.1, 3);
  const sCore = new THREE.Mesh(sCoreGeo, stainlessSteelMat);
  sCore.position.y = 0.55;
  surveyorPayload.add(sCore);

  // Gold foil equipment box
  const foilBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.4), goldFoilMat);
  foilBox.position.set(0.4, 0.55, 0.2);
  surveyorPayload.add(foilBox);

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

  // Steerable Solar Mast & Planar Panel
  const mastPivot = new THREE.Group();
  mastPivot.position.set(0, 1.1, 0);
  surveyorPayload.add(mastPivot);

  const mastRod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9), engineMat);
  mastRod.position.y = 0.45;
  mastPivot.add(mastRod);

  const solarPanelMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.04, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.85, roughness: 0.15 })
  );
  solarPanelMesh.position.set(0, 0.85, 0.35);
  mastPivot.add(solarPanelMesh);

  // Planar High-Gain Antenna on Mast
  const antMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.05, 16),
    stainlessSteelMat
  );
  antMesh.position.set(-0.55, 0.8, -0.25);
  antMesh.rotation.z = 0.4;
  mastPivot.add(antMesh);

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
        atlasLight.intensity = 4.5 + Math.random() * 2.5;
        atlasFlameGroup.scale.set(
          0.92 + Math.random() * 0.2,
          1.0 + Math.random() * 0.3,
          0.92 + Math.random() * 0.2
        );
      } else if (staging.state === 'atlas_sep') {
        // Cut Atlas booster flame
        atlasFlameGroup.visible = false;
        atlasLight.intensity = 0;

        // Atlas Booster detaches visibly backwards and tilts away towards Earth
        staging.atlasSepDist += 18 * delta;
        atlasStage.position.y -= staging.atlasSepDist * delta;
        atlasStage.rotation.z += 0.35 * delta;
        atlasStage.rotation.x += 0.2 * delta;

        // Centaur RL10 liquid hydrogen engines ignite!
        centaurFlameGroup.visible = true;
        centaurLight.intensity = 3.5 + Math.random() * 1.5;
        centaurFlameGroup.scale.set(
          0.95 + Math.random() * 0.15,
          1.0 + Math.random() * 0.25,
          0.95 + Math.random() * 0.15
        );
      } else if (staging.state === 'centaur_burn') {
        centaurFlameGroup.visible = true;
        centaurLight.intensity = 3.8;
      } else if (staging.state === 'fairing_sep') {
        // Clamshell fairing halves split laterally and tumble away into space
        staging.fairingSepDist += 10 * delta;
        fairingL.position.x -= 4.2 * delta;
        fairingL.position.z -= 1.5 * delta;
        fairingL.rotation.z += 0.85 * delta;

        fairingR.position.x += 4.2 * delta;
        fairingR.position.z += 1.5 * delta;
        fairingR.rotation.z -= 0.85 * delta;
      } else if (staging.state === 'surveyor_sep') {
        // Cut Centaur engine
        centaurFlameGroup.visible = false;
        centaurLight.intensity = 0;

        // Surveyor 5 pushes forward away from Centaur adapter
        staging.surveyorSepDist += 5.5 * delta;
        surveyorPayload.position.y += staging.surveyorSepDist * delta;

        // Unfold 3 landing shock legs and solar array!
        if (staging.legDeployProgress < 1.0) {
          staging.legDeployProgress = Math.min(1.0, staging.legDeployProgress + 0.9 * delta);
          legPivots.forEach(p => {
            p.rod.rotation.z = -0.15 - staging.legDeployProgress * 0.45;
            p.rod.position.set(0.6 + staging.legDeployProgress * 0.45, 0.4 - staging.legDeployProgress * 0.2, 0);
          });
          solarPanelMesh.rotation.x = staging.legDeployProgress * 0.45;
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
