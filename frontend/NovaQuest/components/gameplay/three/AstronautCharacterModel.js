import * as THREE from 'three';

/**
 * AstronautCharacterModel.js
 * 
 * Reusable 3D Character Model matching the user's reference character:
 * - Cute Cyan/Teal Alien Astronaut
 * - Large glossy black almond-shaped reflective eyes with white sparkle highlights
 * - Large crystal-clear spherical bubble helmet with subtle cosmic interior sheen
 * - Metallic titanium collar ring with orbital rivets
 * - Dark charcoal/slate spacesuit with chest telemetry panel and life-support backpack
 * - Cyan alien hands and rounded dark boots
 * - Procedural animation rig: walking, idle floating, waving, jumping, looking around
 */
export function createAstronautCharacter({ scale = 1.0 } = {}) {
  const root = new THREE.Group();
  root.name = 'AstronautHero_Leo';

  // --- Materials ---
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // vibrant cyan/teal
    roughness: 0.45,
    metalness: 0.05
  });

  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b, // slate-800 dark charcoal
    roughness: 0.7,
    metalness: 0.2
  });

  const suitTrimMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // slate-600 metallic accent
    roughness: 0.4,
    metalness: 0.6
  });

  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x020617, // glossy obsidian black
    roughness: 0.08,
    metalness: 0.9
  });

  const highlightMat = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });

  const helmetMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transmission: 0.9,
    opacity: 0.4,
    transparent: true,
    roughness: 0.08,
    ior: 1.45,
    reflectivity: 0.8,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  const glowRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  });

  // --- Pelvis / Hip Center ---
  const hipGroup = new THREE.Group();
  hipGroup.position.y = 0.55 * scale;
  root.add(hipGroup);

  // Torso / Spacesuit
  const torsoGeo = new THREE.CylinderGeometry(0.32 * scale, 0.28 * scale, 0.55 * scale, 16);
  const torsoMesh = new THREE.Mesh(torsoGeo, suitMat);
  torsoMesh.position.y = 0.28 * scale;
  hipGroup.add(torsoMesh);

  // Chest panel
  const chestPanelGeo = new THREE.BoxGeometry(0.24 * scale, 0.2 * scale, 0.08 * scale);
  const chestPanelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.3 });
  const chestPanel = new THREE.Mesh(chestPanelGeo, chestPanelMat);
  chestPanel.position.set(0, 0.32 * scale, 0.18 * scale);
  hipGroup.add(chestPanel);

  // Chest indicator lights
  const ledGeo = new THREE.SphereGeometry(0.025 * scale, 8, 8);
  const ledCyanMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
  const ledAmberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const led1 = new THREE.Mesh(ledGeo, ledCyanMat);
  led1.position.set(-0.06 * scale, 0.35 * scale, 0.23 * scale);
  const led2 = new THREE.Mesh(ledGeo, ledAmberMat);
  led2.position.set(0.06 * scale, 0.35 * scale, 0.23 * scale);
  hipGroup.add(led1);
  hipGroup.add(led2);

  // Backpack (PLSS)
  const backpackGeo = new THREE.BoxGeometry(0.38 * scale, 0.46 * scale, 0.22 * scale);
  const backpack = new THREE.Mesh(backpackGeo, suitTrimMat);
  backpack.position.set(0, 0.3 * scale, -0.22 * scale);
  hipGroup.add(backpack);

  // Thruster mini-nozzles on backpack
  const nozzleGeo = new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, 0.08 * scale, 8);
  const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
  const nozL = new THREE.Mesh(nozzleGeo, nozzleMat);
  nozL.position.set(-0.12 * scale, 0.1 * scale, -0.32 * scale);
  const nozR = new THREE.Mesh(nozzleGeo, nozzleMat);
  nozR.position.set(0.12 * scale, 0.1 * scale, -0.32 * scale);
  hipGroup.add(nozL);
  hipGroup.add(nozR);

  // Titanium Collar Ring
  const collarGeo = new THREE.TorusGeometry(0.32 * scale, 0.06 * scale, 12, 24);
  const collar = new THREE.Mesh(collarGeo, suitTrimMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.58 * scale;
  hipGroup.add(collar);

  // Rivets on collar
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const rivetGeo = new THREE.SphereGeometry(0.02 * scale, 6, 6);
    const rivet = new THREE.Mesh(rivetGeo, suitTrimMat);
    rivet.position.set(Math.cos(angle) * 0.32 * scale, 0.62 * scale, Math.sin(angle) * 0.32 * scale);
    hipGroup.add(rivet);
  }

  // --- Head & Helmet Group (Pivoting neck) ---
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.68 * scale;
  hipGroup.add(headGroup);

  // Spherical Glass Bubble Helmet (Big & Crystal Clear)
  const helmetGeo = new THREE.SphereGeometry(0.48 * scale, 32, 32);
  const helmet = new THREE.Mesh(helmetGeo, helmetMat);
  helmet.position.y = 0.24 * scale;
  headGroup.add(helmet);

  // Subtle interior cosmic glow sphere inside helmet
  const glowGeo = new THREE.SphereGeometry(0.46 * scale, 16, 16);
  const glowMesh = new THREE.Mesh(glowGeo, glowRingMat);
  glowMesh.position.y = 0.24 * scale;
  headGroup.add(glowMesh);

  // Cute Cyan Alien Head (Round cranium with tapered jaw)
  const headGeo = new THREE.SphereGeometry(0.34 * scale, 24, 24);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.scale.set(1.05, 1.15, 1.0);
  headMesh.position.y = 0.24 * scale;
  headGroup.add(headMesh);

  // Cute Chin / Cheek Taper
  const chinGeo = new THREE.SphereGeometry(0.22 * scale, 16, 16);
  const chinMesh = new THREE.Mesh(chinGeo, skinMat);
  chinMesh.position.set(0, 0.12 * scale, 0.08 * scale);
  headGroup.add(chinMesh);

  // Big Almond Alien Eyes (Left & Right)
  const eyeGeo = new THREE.SphereGeometry(0.13 * scale, 20, 20);
  eyeGeo.scale(1.2, 0.9, 0.6);

  // Left Eye
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.14 * scale, 0.26 * scale, 0.23 * scale);
  eyeL.rotation.set(0.1, -0.2, 0.2);
  headGroup.add(eyeL);

  // Right Eye
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.14 * scale, 0.26 * scale, 0.23 * scale);
  eyeR.rotation.set(0.1, 0.2, -0.2);
  headGroup.add(eyeR);

  // Eye Specular Highlight Sparkles (For anime/Pixar shine)
  const sparkGeo = new THREE.SphereGeometry(0.035 * scale, 8, 8);
  const sparkGeoSmall = new THREE.SphereGeometry(0.018 * scale, 8, 8);

  const sparkL1 = new THREE.Mesh(sparkGeo, highlightMat);
  sparkL1.position.set(-0.12 * scale, 0.29 * scale, 0.29 * scale);
  const sparkL2 = new THREE.Mesh(sparkGeoSmall, highlightMat);
  sparkL2.position.set(-0.16 * scale, 0.23 * scale, 0.28 * scale);
  headGroup.add(sparkL1);
  headGroup.add(sparkL2);

  const sparkR1 = new THREE.Mesh(sparkGeo, highlightMat);
  sparkR1.position.set(0.12 * scale, 0.29 * scale, 0.29 * scale);
  const sparkR2 = new THREE.Mesh(sparkGeoSmall, highlightMat);
  sparkR2.position.set(0.16 * scale, 0.23 * scale, 0.28 * scale);
  headGroup.add(sparkR1);
  headGroup.add(sparkR2);

  // Subtle cute mouth
  const mouthGeo = new THREE.TorusGeometry(0.04 * scale, 0.01 * scale, 8, 12, Math.PI);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, 0.14 * scale, 0.28 * scale);
  mouth.rotation.x = 0.2;
  mouth.rotation.z = Math.PI;
  headGroup.add(mouth);

  // --- Arms (Left & Right Pivots) ---
  // Left Arm
  const armLPivot = new THREE.Group();
  armLPivot.position.set(-0.35 * scale, 0.48 * scale, 0);
  hipGroup.add(armLPivot);

  const armLGeo = new THREE.CapsuleGeometry(0.09 * scale, 0.24 * scale, 6, 12);
  const armLMesh = new THREE.Mesh(armLGeo, suitMat);
  armLMesh.position.y = -0.16 * scale;
  armLPivot.add(armLMesh);

  // Cyan Hand
  const handLGeo = new THREE.SphereGeometry(0.09 * scale, 12, 12);
  const handL = new THREE.Mesh(handLGeo, skinMat);
  handL.position.y = -0.34 * scale;
  armLPivot.add(handL);

  // Right Arm
  const armRPivot = new THREE.Group();
  armRPivot.position.set(0.35 * scale, 0.48 * scale, 0);
  hipGroup.add(armRPivot);

  const armRGeo = new THREE.CapsuleGeometry(0.09 * scale, 0.24 * scale, 6, 12);
  const armRMesh = new THREE.Mesh(armRGeo, suitMat);
  armRMesh.position.y = -0.16 * scale;
  armRPivot.add(armRMesh);

  // Cyan Hand
  const handRGeo = new THREE.SphereGeometry(0.09 * scale, 12, 12);
  const handR = new THREE.Mesh(handRGeo, skinMat);
  handR.position.y = -0.34 * scale;
  armRPivot.add(handR);

  // --- Legs & Boots (Left & Right Pivots) ---
  // Left Leg
  const legLPivot = new THREE.Group();
  legLPivot.position.set(-0.16 * scale, 0.05 * scale, 0);
  hipGroup.add(legLPivot);

  const legLGeo = new THREE.CapsuleGeometry(0.11 * scale, 0.26 * scale, 6, 12);
  const legLMesh = new THREE.Mesh(legLGeo, suitMat);
  legLMesh.position.y = -0.18 * scale;
  legLPivot.add(legLMesh);

  // Boot Left
  const bootLGeo = new THREE.BoxGeometry(0.18 * scale, 0.14 * scale, 0.28 * scale);
  const bootL = new THREE.Mesh(bootLGeo, suitMat);
  bootL.position.set(0, -0.38 * scale, 0.05 * scale);
  legLPivot.add(bootL);

  // Right Leg
  const legRPivot = new THREE.Group();
  legRPivot.position.set(0.16 * scale, 0.05 * scale, 0);
  hipGroup.add(legRPivot);

  const legRGeo = new THREE.CapsuleGeometry(0.11 * scale, 0.26 * scale, 6, 12);
  const legRMesh = new THREE.Mesh(legRGeo, suitMat);
  legRMesh.position.y = -0.18 * scale;
  legRPivot.add(legRMesh);

  // Boot Right
  const bootRGeo = new THREE.BoxGeometry(0.18 * scale, 0.14 * scale, 0.28 * scale);
  const bootR = new THREE.Mesh(bootRGeo, suitMat);
  bootR.position.set(0, -0.38 * scale, 0.05 * scale);
  legRPivot.add(bootR);

  // Equippable Solar Coupler Item (mounted on hip belt)
  const couplerToolGeo = new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 0.18 * scale, 12);
  const couplerToolMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // glowing gold
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0xd97706,
    emissiveIntensity: 0.35
  });
  const couplerTool = new THREE.Mesh(couplerToolGeo, couplerToolMat);
  couplerTool.rotation.z = Math.PI / 2;
  couplerTool.position.set(-0.32 * scale, 0.2 * scale, 0.1 * scale);
  couplerTool.visible = false;
  hipGroup.add(couplerTool);

  // Internal Animation Controller
  const anim = {
    state: 'idle', // 'idle' | 'walk' | 'run' | 'jump' | 'repair' | 'float' | 'wave' | 'celebrate'
    speed: 1.0,
    blinkTimer: 0,
    hasCoupler: false,
    update: (timeDelta, timeSeconds) => {
      // Toggle coupler visibility
      couplerTool.visible = anim.hasCoupler;

      // Blinking simulation (scale eyes in Y)
      anim.blinkTimer += timeDelta;
      if (anim.blinkTimer > 3.5) {
        eyeL.scale.y = 0.1;
        eyeR.scale.y = 0.1;
        if (anim.blinkTimer > 3.65) {
          eyeL.scale.y = 0.9;
          eyeR.scale.y = 0.9;
          anim.blinkTimer = 0;
        }
      }

      if (anim.state === 'run') {
        // High-speed sprint animation
        const freq = 11.0 * anim.speed;
        const angleL = Math.sin(timeSeconds * freq) * 0.85;
        const angleR = -angleL;

        legLPivot.rotation.x = angleL;
        legRPivot.rotation.x = angleR;

        // Pumping arms
        armLPivot.rotation.x = angleR * 1.1;
        armRPivot.rotation.x = angleL * 1.1;
        armLPivot.rotation.z = -0.25;
        armRPivot.rotation.z = 0.25;

        // Forward athletic torso lean
        hipGroup.rotation.x = 0.25;
        hipGroup.rotation.z = Math.sin(timeSeconds * freq * 0.5) * 0.08;
        hipGroup.position.y = (0.55 + Math.abs(Math.sin(timeSeconds * freq)) * 0.08) * scale;
        headGroup.rotation.y = Math.sin(timeSeconds * freq * 0.5) * 0.1;
      } else if (anim.state === 'walk') {
        // Walking gait cycle
        const freq = 6.0 * anim.speed;
        const angleL = Math.sin(timeSeconds * freq) * 0.55;
        const angleR = -angleL;

        legLPivot.rotation.x = angleL;
        legRPivot.rotation.x = angleR;

        // Counter-swing arms
        armLPivot.rotation.x = angleR * 0.7;
        armRPivot.rotation.x = angleL * 0.7;
        armLPivot.rotation.z = -0.1;
        armRPivot.rotation.z = 0.1;

        hipGroup.rotation.x = 0.08;
        hipGroup.rotation.z = 0;
        hipGroup.position.y = (0.55 + Math.abs(Math.sin(timeSeconds * freq)) * 0.05) * scale;
        headGroup.rotation.y = Math.sin(timeSeconds * freq * 0.5) * 0.08;
        headGroup.rotation.z = Math.sin(timeSeconds * freq) * 0.04;
      } else if (anim.state === 'jump') {
        // In-air lunar jump float
        hipGroup.rotation.x = -0.05;
        hipGroup.rotation.z = 0;
        legLPivot.rotation.x = -0.4;
        legRPivot.rotation.x = 0.25;
        armLPivot.rotation.x = -0.5;
        armRPivot.rotation.x = -0.5;
        armLPivot.rotation.z = -0.7;
        armRPivot.rotation.z = 0.7;
        headGroup.rotation.y = 0;
      } else if (anim.state === 'repair') {
        // Active repairing pose
        hipGroup.rotation.x = 0.15;
        hipGroup.position.y = 0.52 * scale;
        legLPivot.rotation.x = 0.2;
        legRPivot.rotation.x = -0.2;

        // Right arm working on the lander
        armRPivot.rotation.x = -1.2 + Math.sin(timeSeconds * 12) * 0.15;
        armRPivot.rotation.z = 0.35 + Math.cos(timeSeconds * 10) * 0.1;
        armLPivot.rotation.x = -0.8;
        armLPivot.rotation.z = -0.3;
        headGroup.rotation.x = 0.3; // Looking down at repair site
      } else if (anim.state === 'celebrate' || anim.state === 'victory') {
        // Joyous victory celebration
        hipGroup.position.y = (0.55 + Math.abs(Math.sin(timeSeconds * 5)) * 0.12) * scale;
        hipGroup.rotation.x = 0;
        armLPivot.rotation.x = 0;
        armRPivot.rotation.x = 0;
        armLPivot.rotation.z = -2.4 + Math.sin(timeSeconds * 6) * 0.3;
        armRPivot.rotation.z = 2.4 - Math.sin(timeSeconds * 6) * 0.3;
        headGroup.rotation.x = -0.2; // Looking up at Earth
        headGroup.rotation.y = Math.sin(timeSeconds * 3) * 0.2;
      } else if (anim.state === 'wave') {
        // Waving hello
        hipGroup.rotation.x = 0;
        armRPivot.rotation.x = 0;
        armRPivot.rotation.z = 2.2 + Math.sin(timeSeconds * 8) * 0.4;
        armLPivot.rotation.x = 0.1;
        armLPivot.rotation.z = -0.15;
        headGroup.rotation.y = 0.15;
        headGroup.rotation.z = -0.08;
        hipGroup.position.y = (0.55 + Math.sin(timeSeconds * 2) * 0.02) * scale;
      } else if (anim.state === 'float') {
        // Microgravity floating bob
        const floatY = Math.sin(timeSeconds * 1.8) * 0.12 * scale;
        const roll = Math.sin(timeSeconds * 1.2) * 0.08;
        const pitch = Math.cos(timeSeconds * 1.4) * 0.06;

        hipGroup.position.y = (0.7 + floatY);
        hipGroup.rotation.z = roll;
        hipGroup.rotation.x = pitch;

        armLPivot.rotation.z = -0.4 + Math.sin(timeSeconds * 1.5) * 0.1;
        armRPivot.rotation.z = 0.4 - Math.sin(timeSeconds * 1.5) * 0.1;
        legLPivot.rotation.x = 0.2 + Math.sin(timeSeconds * 1.2) * 0.1;
        legRPivot.rotation.x = 0.1 - Math.cos(timeSeconds * 1.2) * 0.1;
      } else {
        // Idle breathing & gentle floating
        const breath = Math.sin(timeSeconds * 2.2) * 0.02 * scale;
        hipGroup.position.y = 0.55 * scale + breath;
        hipGroup.rotation.x = 0;
        hipGroup.rotation.z = 0;
        legLPivot.rotation.x = 0;
        legRPivot.rotation.x = 0;
        armLPivot.rotation.x = Math.sin(timeSeconds * 2.2) * 0.05;
        armRPivot.rotation.x = -Math.sin(timeSeconds * 2.2) * 0.05;
        armLPivot.rotation.z = -0.15;
        armRPivot.rotation.z = 0.15;
        headGroup.rotation.x = 0;
        headGroup.rotation.y = Math.sin(timeSeconds * 0.8) * 0.1;
      }
    }
  };

  root.userData.anim = anim;
  root.userData.parts = {
    headGroup,
    helmet,
    eyeL,
    eyeR,
    armLPivot,
    armRPivot,
    legLPivot,
    legRPivot,
    hipGroup
  };

  return root;
}

