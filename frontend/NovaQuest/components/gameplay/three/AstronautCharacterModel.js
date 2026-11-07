import * as THREE from 'three';

/**
 * AstronautCharacterModel.js
 * 
 * Master 3D Character Model for NOVA / Leo
 * Faithfully engineered to match the user's approved reference character:
 * - Cute Cyan / Turquoise Alien Astronaut (Large smooth skull, cute chin, soft cheeks)
 * - Huge glossy obsidian almond eyes with curved white specular reflections and animated blinking
 * - Crystal-clear spherical bubble helmet with luminous cyan edge aura
 * - Cosmic nebula & starry galaxy interior reflection inside the rear helmet dome
 * - Titanium metallic collar ring with purple-magenta spherical rivet beads
 * - Dark charcoal/slate spacesuit with fine cosmic stardust texture and curved seamlines
 * - Center chest telemetry capsule plate
 * - Cyan alien hands with 4 defined fingers (thumb + 3 fingers)
 * - Segmented knee pads and rounded space boots
 * - Life-support backpack with dual thrusters and antenna
 * - Procedural animation rig: idle, walk, run, jump, pickup, repair, celebrate/victory, float
 */

/**
 * Helper to generate procedural canvas textures for stardust spacesuit & cosmic helmet
 */
function createCosmicTextures() {
  // 1. Cosmic Helmet Galaxy (Rear interior dome)
  const galaxyCanvas = document.createElement('canvas');
  galaxyCanvas.width = 512;
  galaxyCanvas.height = 512;
  const gCtx = galaxyCanvas.getContext('2d');

  // Deep space gradient
  const grad = gCtx.createRadialGradient(256, 256, 50, 256, 256, 256);
  grad.addColorStop(0, '#1e1145'); // deep cosmic purple
  grad.addColorStop(0.5, '#0c0a2a'); // deep indigo
  grad.addColorStop(1, '#030214'); // obsidian space
  gCtx.fillStyle = grad;
  gCtx.fillRect(0, 0, 512, 512);

  // Soft nebula clouds
  gCtx.fillStyle = 'rgba(56, 189, 248, 0.15)'; // cyan nebula wisps
  for (let i = 0; i < 8; i++) {
    gCtx.beginPath();
    gCtx.arc(100 + Math.random() * 300, 100 + Math.random() * 300, 60 + Math.random() * 80, 0, Math.PI * 2);
    gCtx.fill();
  }

  gCtx.fillStyle = 'rgba(168, 85, 247, 0.12)'; // purple nebula wisps
  for (let i = 0; i < 8; i++) {
    gCtx.beginPath();
    gCtx.arc(100 + Math.random() * 300, 100 + Math.random() * 300, 50 + Math.random() * 70, 0, Math.PI * 2);
    gCtx.fill();
  }

  // Sparkling stardust
  gCtx.fillStyle = '#ffffff';
  for (let i = 0; i < 90; i++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const sr = Math.random() < 0.2 ? 1.8 : 0.8;
    gCtx.beginPath();
    gCtx.arc(sx, sy, sr, 0, Math.PI * 2);
    gCtx.fill();
  }

  const galaxyTexture = new THREE.CanvasTexture(galaxyCanvas);
  galaxyTexture.wrapS = THREE.ClampToEdgeWrapping;
  galaxyTexture.wrapT = THREE.ClampToEdgeWrapping;

  // 2. Spacesuit Texture with fine fabric grain and subtle cosmic speckles
  const suitCanvas = document.createElement('canvas');
  suitCanvas.width = 256;
  suitCanvas.height = 256;
  const sCtx = suitCanvas.getContext('2d');
  sCtx.fillStyle = '#181b22'; // deep charcoal slate
  sCtx.fillRect(0, 0, 256, 256);

  // Fine starlight specks
  sCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 120; i++) {
    sCtx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  }

  const suitTexture = new THREE.CanvasTexture(suitCanvas);
  suitTexture.wrapS = THREE.RepeatWrapping;
  suitTexture.wrapT = THREE.RepeatWrapping;
  suitTexture.repeat.set(2, 2);

  return { galaxyTexture, suitTexture };
}

let cachedTextures = null;

export function createAstronautCharacter({ scale = 1.0 } = {}) {
  const root = new THREE.Group();
  root.name = 'AstronautHero_Leo';

  if (!cachedTextures && typeof document !== 'undefined') {
    cachedTextures = createCosmicTextures();
  }

  // =========================================================================
  // MATERIALS SPECIFICATION
  // =========================================================================

  // Alien Skin: Smooth, vibrant yet soft turquoise / cyan
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x32cad4, // turquoise cyan
    roughness: 0.32,
    metalness: 0.08
  });

  // Spacesuit: Dark charcoal/slate with fine cosmic specks
  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x181b22, // dark slate
    roughness: 0.65,
    metalness: 0.25,
    map: cachedTextures ? cachedTextures.suitTexture : null
  });

  // Spacesuit Trim & Joints: Slightly lighter metallic slate
  const suitTrimMat = new THREE.MeshStandardMaterial({
    color: 0x2d3748,
    roughness: 0.45,
    metalness: 0.55
  });

  // Titanium Collar: Metallic chrome-titanium
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.88,
    roughness: 0.2
  });

  // Purple/Magenta Gemstone Rivet Beads (matching user reference image)
  const purpleRivetMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc, // vibrant violet/purple
    metalness: 0.85,
    roughness: 0.15,
    emissive: 0x7c3aed,
    emissiveIntensity: 0.25
  });

  // Eyes: Ultra-glossy obsidian black
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x020408, // deep obsidian black
    roughness: 0.02,
    metalness: 0.95
  });

  // Specular Highlights: Pure crisp white
  const highlightMat = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });

  // Glass Bubble Helmet: Crystal-clear physical glass
  const helmetGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transmission: 0.95,
    opacity: 0.35,
    transparent: true,
    roughness: 0.04,
    ior: 1.48,
    reflectivity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08
  });

  // Luminous Cyan Helmet Rim Halo
  const helmetRimMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending
  });

  // Rear Helmet Cosmic Starfield / Nebula Shell
  const cosmicNebulaMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: cachedTextures ? cachedTextures.galaxyTexture : null,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.85
  });

  // =========================================================================
  // 1. PELVIS & ROOT GROUP
  // =========================================================================
  const hipGroup = new THREE.Group();
  hipGroup.position.y = 0.55 * scale;
  root.add(hipGroup);

  // Lower Torso / Pelvis
  const pelvisGeo = new THREE.CylinderGeometry(0.28 * scale, 0.24 * scale, 0.2 * scale, 24);
  const pelvis = new THREE.Mesh(pelvisGeo, suitMat);
  pelvis.position.y = 0.1 * scale;
  hipGroup.add(pelvis);

  // Upper Torso / Spacesuit Jacket
  const chestGeo = new THREE.CylinderGeometry(0.33 * scale, 0.28 * scale, 0.38 * scale, 24);
  const chest = new THREE.Mesh(chestGeo, suitMat);
  chest.position.y = 0.36 * scale;
  hipGroup.add(chest);

  // Center Chest Telemetry Capsule Badge (matching reference image)
  const chestPlateGroup = new THREE.Group();
  chestPlateGroup.position.set(0, 0.38 * scale, 0.24 * scale);
  hipGroup.add(chestPlateGroup);

  const badgeBaseGeo = new THREE.CapsuleGeometry(0.045 * scale, 0.14 * scale, 8, 16);
  const badgeBase = new THREE.Mesh(badgeBaseGeo, suitTrimMat);
  chestPlateGroup.add(badgeBase);

  const badgeInnerGeo = new THREE.CapsuleGeometry(0.025 * scale, 0.09 * scale, 8, 16);
  const badgeInner = new THREE.Mesh(badgeInnerGeo, titaniumMat);
  badgeInner.position.z = 0.015 * scale;
  chestPlateGroup.add(badgeInner);

  // Curved Spacesuit Seamlines / Piping (embossed curves across torso)
  const seamCurveL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.25 * scale, 0.48 * scale, 0.12 * scale),
    new THREE.Vector3(-0.16 * scale, 0.34 * scale, 0.25 * scale),
    new THREE.Vector3(-0.14 * scale, 0.16 * scale, 0.22 * scale),
    new THREE.Vector3(-0.18 * scale, 0.05 * scale, 0.16 * scale)
  ]);
  const seamGeoL = new THREE.TubeGeometry(seamCurveL, 16, 0.012 * scale, 6, false);
  const seamL = new THREE.Mesh(seamGeoL, suitTrimMat);
  hipGroup.add(seamL);

  const seamCurveR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.25 * scale, 0.48 * scale, 0.12 * scale),
    new THREE.Vector3(0.16 * scale, 0.34 * scale, 0.25 * scale),
    new THREE.Vector3(0.14 * scale, 0.16 * scale, 0.22 * scale),
    new THREE.Vector3(0.18 * scale, 0.05 * scale, 0.16 * scale)
  ]);
  const seamGeoR = new THREE.TubeGeometry(seamCurveR, 16, 0.012 * scale, 6, false);
  const seamR = new THREE.Mesh(seamGeoR, suitTrimMat);
  hipGroup.add(seamR);

  // Life-Support Backpack (PLSS)
  const backpackGeo = new THREE.BoxGeometry(0.38 * scale, 0.46 * scale, 0.2 * scale);
  const backpack = new THREE.Mesh(backpackGeo, suitTrimMat);
  backpack.position.set(0, 0.34 * scale, -0.22 * scale);
  hipGroup.add(backpack);

  // Backpack telemetry antenna
  const antennaGeo = new THREE.CylinderGeometry(0.012 * scale, 0.012 * scale, 0.35 * scale, 8);
  const antenna = new THREE.Mesh(antennaGeo, titaniumMat);
  antenna.position.set(0.14 * scale, 0.62 * scale, -0.22 * scale);
  hipGroup.add(antenna);

  // Dual Thruster Mini-Nozzles on Backpack
  const nozzleGeo = new THREE.CylinderGeometry(0.04 * scale, 0.06 * scale, 0.08 * scale, 12);
  for (let bx of [-0.12, 0.12]) {
    const noz = new THREE.Mesh(nozzleGeo, suitTrimMat);
    noz.position.set(bx * scale, 0.15 * scale, -0.31 * scale);
    noz.rotation.x = 0.2;
    hipGroup.add(noz);
  }

  // =========================================================================
  // 2. TITANIUM COLLAR & PURPLE RIVET BEADS
  // =========================================================================
  const collarGroup = new THREE.Group();
  collarGroup.position.y = 0.58 * scale;
  hipGroup.add(collarGroup);

  const collarGeo = new THREE.TorusGeometry(0.32 * scale, 0.055 * scale, 16, 32);
  const collar = new THREE.Mesh(collarGeo, titaniumMat);
  collar.rotation.x = Math.PI / 2;
  collarGroup.add(collar);

  // 10 Spherical Purple/Metallic Rivet Beads embedded around collar
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI * 2) / 10;
    const rivetGeo = new THREE.SphereGeometry(0.024 * scale, 8, 8);
    const rivet = new THREE.Mesh(rivetGeo, purpleRivetMat);
    rivet.position.set(
      Math.cos(angle) * 0.32 * scale,
      0.03 * scale,
      Math.sin(angle) * 0.32 * scale
    );
    collarGroup.add(rivet);
  }

  // =========================================================================
  // 3. HEAD & HELMET (Neck Pivot)
  // =========================================================================
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.68 * scale;
  hipGroup.add(headGroup);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.16 * scale, 0.18 * scale, 0.12 * scale, 16);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = 0.06 * scale;
  headGroup.add(neck);

  // Spherical Glass Bubble Helmet (Large & Crystal Clear)
  const helmetCenterY = 0.28 * scale;
  const helmetRadius = 0.52 * scale;

  const helmetGeo = new THREE.SphereGeometry(helmetRadius, 36, 36);
  const helmet = new THREE.Mesh(helmetGeo, helmetGlassMat);
  helmet.position.y = helmetCenterY;
  headGroup.add(helmet);

  // Helmet Base Collar Ring (Horizontal mounting rim)
  const haloGeo = new THREE.TorusGeometry(helmetRadius * 0.92, 0.015 * scale, 12, 36);
  const haloMesh = new THREE.Mesh(haloGeo, helmetRimMat);
  haloMesh.rotation.x = Math.PI / 2;
  haloMesh.position.y = 0.04 * scale;
  headGroup.add(haloMesh);

  // Rear Cosmic Nebula / Starfield Shell (Inside the rear half of bubble helmet!)
  const cosmicRearGeo = new THREE.SphereGeometry(
    helmetRadius * 0.96,
    32,
    32,
    Math.PI * 0.5,
    Math.PI,
    0,
    Math.PI
  );
  const cosmicRear = new THREE.Mesh(cosmicRearGeo, cosmicNebulaMat);
  cosmicRear.position.set(0, helmetCenterY, 0);
  headGroup.add(cosmicRear);

  // Cute Cyan Alien Head (Shaped skull with tapered chin & cute temples)
  const skullGeo = new THREE.SphereGeometry(0.36 * scale, 32, 32);
  skullGeo.scale(1.08, 1.16, 1.02);
  const skull = new THREE.Mesh(skullGeo, skinMat);
  skull.position.set(0, helmetCenterY + 0.02 * scale, 0);
  headGroup.add(skull);

  // Cute Tapered Chin / Cheeks
  const chinGeo = new THREE.SphereGeometry(0.24 * scale, 24, 24);
  chinGeo.scale(0.9, 0.85, 1.1);
  const chin = new THREE.Mesh(chinGeo, skinMat);
  chin.position.set(0, helmetCenterY - 0.14 * scale, 0.1 * scale);
  headGroup.add(chin);

  // Cute Tiny Button Nose
  const noseGeo = new THREE.SphereGeometry(0.022 * scale, 12, 12);
  noseGeo.scale(1.1, 0.8, 1.4);
  const nose = new THREE.Mesh(noseGeo, skinMat);
  nose.position.set(0, helmetCenterY - 0.04 * scale, 0.36 * scale);
  headGroup.add(nose);

  // Gentle Cute Mouth Line
  const mouthGeo = new THREE.TorusGeometry(0.038 * scale, 0.008 * scale, 8, 16, Math.PI * 0.8);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x0369a1 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, helmetCenterY - 0.12 * scale, 0.33 * scale);
  mouth.rotation.x = 0.25;
  mouth.rotation.z = Math.PI;
  headGroup.add(mouth);

  // =========================================================================
  // 4. BIG ALMOND OBSIDIAN EYES & SPECULAR REFLECTIONS
  // =========================================================================
  const eyeWidth = 0.14 * scale;
  const eyeHeight = 0.12 * scale;
  const eyeDepth = 0.08 * scale;

  const eyeGeo = new THREE.SphereGeometry(eyeWidth, 24, 24);
  eyeGeo.scale(1.22, 0.92, 0.58);

  // Left Eye
  const eyeLGroup = new THREE.Group();
  eyeLGroup.position.set(-0.16 * scale, helmetCenterY + 0.03 * scale, 0.26 * scale);
  eyeLGroup.rotation.set(0.12, -0.22, 0.24); // tilted outward
  headGroup.add(eyeLGroup);

  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeLGroup.add(eyeL);

  // Right Eye
  const eyeRGroup = new THREE.Group();
  eyeRGroup.position.set(0.16 * scale, helmetCenterY + 0.03 * scale, 0.26 * scale);
  eyeRGroup.rotation.set(0.12, 0.22, -0.24); // tilted outward
  headGroup.add(eyeRGroup);

  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeRGroup.add(eyeR);

  // Curved Specular Gleam & Sparkle Dots (Pixar / Dreamworks shine)
  const gleamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.04 * scale, 0.06 * scale, 0.07 * scale),
    new THREE.Vector3(0.01 * scale, 0.07 * scale, 0.07 * scale),
    new THREE.Vector3(0.05 * scale, 0.04 * scale, 0.07 * scale)
  ]);
  const gleamGeo = new THREE.TubeGeometry(gleamCurve, 12, 0.016 * scale, 6, false);

  const gleamL = new THREE.Mesh(gleamGeo, highlightMat);
  eyeLGroup.add(gleamL);

  const gleamR = new THREE.Mesh(gleamGeo, highlightMat);
  eyeRGroup.add(gleamR);

  // Tiny twinkle dots
  const twinkleGeo = new THREE.SphereGeometry(0.018 * scale, 8, 8);
  const twinkleL = new THREE.Mesh(twinkleGeo, highlightMat);
  twinkleL.position.set(-0.03 * scale, -0.03 * scale, 0.075 * scale);
  eyeLGroup.add(twinkleL);

  const twinkleR = new THREE.Mesh(twinkleGeo, highlightMat);
  twinkleR.position.set(-0.03 * scale, -0.03 * scale, 0.075 * scale);
  eyeRGroup.add(twinkleR);

  // =========================================================================
  // 5. ARMS & 4-FINGERED CYAN HANDS
  // =========================================================================
  function createAlienArm(isLeft) {
    const armPivot = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    armPivot.position.set(sign * 0.36 * scale, 0.52 * scale, 0);

    // Shoulder Pad Cap
    const shoulderGeo = new THREE.SphereGeometry(0.11 * scale, 16, 16);
    shoulderGeo.scale(1.0, 1.2, 1.0);
    const shoulder = new THREE.Mesh(shoulderGeo, suitTrimMat);
    shoulder.position.y = -0.02 * scale;
    armPivot.add(shoulder);

    // Bicep / Upper Arm
    const bicepGeo = new THREE.CapsuleGeometry(0.085 * scale, 0.16 * scale, 8, 16);
    const bicep = new THREE.Mesh(bicepGeo, suitMat);
    bicep.position.y = -0.14 * scale;
    armPivot.add(bicep);

    // Forearm with Ribbed Bellows Cuff
    const forearmGroup = new THREE.Group();
    forearmGroup.position.y = -0.25 * scale;
    armPivot.add(forearmGroup);

    const cuffGeo = new THREE.CylinderGeometry(0.09 * scale, 0.085 * scale, 0.12 * scale, 16);
    const cuff = new THREE.Mesh(cuffGeo, suitTrimMat);
    cuff.position.y = -0.05 * scale;
    forearmGroup.add(cuff);

    // Cyan Palm
    const palmGeo = new THREE.SphereGeometry(0.075 * scale, 12, 12);
    palmGeo.scale(1.1, 0.8, 1.0);
    const palm = new THREE.Mesh(palmGeo, skinMat);
    palm.position.y = -0.14 * scale;
    forearmGroup.add(palm);

    // 4 Defined Fingers: Thumb + 3 Fingers
    const fingers = [];
    const fingerOffsets = [
      { x: sign * 0.045 * scale, y: -0.15 * scale, z: 0.03 * scale, length: 0.06 * scale, angleZ: sign * 0.5 }, // Thumb
      { x: sign * 0.025 * scale, y: -0.21 * scale, z: 0.01 * scale, length: 0.08 * scale, angleZ: sign * 0.1 }, // Index
      { x: 0, y: -0.22 * scale, z: 0, length: 0.085 * scale, angleZ: 0 }, // Middle
      { x: -sign * 0.025 * scale, y: -0.20 * scale, z: -0.01 * scale, length: 0.07 * scale, angleZ: -sign * 0.15 } // Pinky
    ];

    fingerOffsets.forEach(cfg => {
      const fGeo = new THREE.CapsuleGeometry(0.016 * scale, cfg.length, 6, 8);
      const finger = new THREE.Mesh(fGeo, skinMat);
      finger.position.set(cfg.x, cfg.y, cfg.z);
      finger.rotation.z = cfg.angleZ;
      forearmGroup.add(finger);
      fingers.push(finger);
    });

    return { armPivot, forearmGroup, fingers };
  }

  const armL = createAlienArm(true);
  hipGroup.add(armL.armPivot);

  const armR = createAlienArm(false);
  hipGroup.add(armR.armPivot);

  // =========================================================================
  // 6. LEGS, KNEE PADS & ROUNDED BOOTS
  // =========================================================================
  function createAlienLeg(isLeft) {
    const legPivot = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    legPivot.position.set(sign * 0.16 * scale, 0.08 * scale, 0);

    // Thigh
    const thighGeo = new THREE.CapsuleGeometry(0.105 * scale, 0.22 * scale, 8, 16);
    const thigh = new THREE.Mesh(thighGeo, suitMat);
    thigh.position.y = -0.14 * scale;
    legPivot.add(thigh);

    // Knee Pad Guard (matching reference image)
    const kneeGeo = new THREE.BoxGeometry(0.13 * scale, 0.11 * scale, 0.07 * scale);
    const knee = new THREE.Mesh(kneeGeo, suitTrimMat);
    knee.position.set(0, -0.22 * scale, 0.09 * scale);
    legPivot.add(knee);

    // Shin / Lower Leg
    const shinGeo = new THREE.CapsuleGeometry(0.095 * scale, 0.2 * scale, 8, 16);
    const shin = new THREE.Mesh(shinGeo, suitMat);
    shin.position.y = -0.32 * scale;
    legPivot.add(shin);

    // Rounded Space Boot
    const bootGroup = new THREE.Group();
    bootGroup.position.set(0, -0.48 * scale, 0.04 * scale);
    legPivot.add(bootGroup);

    // Boot Body
    const bootGeo = new THREE.BoxGeometry(0.18 * scale, 0.12 * scale, 0.26 * scale);
    const boot = new THREE.Mesh(bootGeo, suitMat);
    bootGroup.add(boot);

    // Curved Boot Toe Cap
    const toeGeo = new THREE.SphereGeometry(0.09 * scale, 12, 12);
    toeGeo.scale(1.0, 0.6, 1.1);
    const toe = new THREE.Mesh(toeGeo, suitTrimMat);
    toe.position.set(0, -0.01 * scale, 0.1 * scale);
    bootGroup.add(toe);

    // Ribbed Sole
    const soleGeo = new THREE.BoxGeometry(0.19 * scale, 0.03 * scale, 0.28 * scale);
    const sole = new THREE.Mesh(soleGeo, suitTrimMat);
    sole.position.y = -0.065 * scale;
    bootGroup.add(sole);

    return { legPivot, bootGroup };
  }

  const legL = createAlienLeg(true);
  hipGroup.add(legL.legPivot);

  const legR = createAlienLeg(false);
  hipGroup.add(legR.legPivot);

  // =========================================================================
  // 7. EQUIPPABLE COMPONENT / TOOL MOUNT
  // =========================================================================
  const carriedItemSlot = new THREE.Group();
  carriedItemSlot.position.set(0.35 * scale, 0.22 * scale, 0.18 * scale);
  carriedItemSlot.visible = false;
  hipGroup.add(carriedItemSlot);

  // Golden Coupler Tool
  const couplerTool = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07 * scale, 0.07 * scale, 0.16 * scale, 16),
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xd97706,
      emissiveIntensity: 0.4
    })
  );
  couplerTool.rotation.z = Math.PI / 2;
  carriedItemSlot.add(couplerTool);

  // =========================================================================
  // 8. PROCEDURAL ANIMATION CONTROLLER
  // =========================================================================
  const anim = {
    state: 'idle', // 'idle' | 'walk' | 'run' | 'jump' | 'pickup' | 'repair' | 'float' | 'wave' | 'victory'
    speed: 1.0,
    blinkTimer: 0,
    hasCoupler: false,
    carriedComponentName: null,

    update: (timeDelta, timeSeconds) => {
      carriedItemSlot.visible = anim.hasCoupler;

      // Natural eye blinking simulation
      anim.blinkTimer += timeDelta;
      if (anim.blinkTimer > 3.4) {
        eyeL.scale.y = 0.08;
        eyeR.scale.y = 0.08;
        if (anim.blinkTimer > 3.55) {
          eyeL.scale.y = 1.0;
          eyeR.scale.y = 1.0;
          anim.blinkTimer = 0;
        }
      }

      // State Machine Transitions
      if (anim.state === 'run') {
        const freq = 11.5 * anim.speed;
        const angleL = Math.sin(timeSeconds * freq) * 0.85;
        const angleR = -angleL;

        legL.legPivot.rotation.x = angleL;
        legR.legPivot.rotation.x = angleR;

        armL.armPivot.rotation.x = angleR * 1.1;
        armR.armPivot.rotation.x = angleL * 1.1;
        armL.armPivot.rotation.z = -0.22;
        armR.armPivot.rotation.z = 0.22;

        hipGroup.rotation.x = 0.24; // Athletic forward lean
        hipGroup.rotation.z = Math.sin(timeSeconds * freq * 0.5) * 0.06;
        hipGroup.position.y = (0.55 + Math.abs(Math.sin(timeSeconds * freq)) * 0.08) * scale;
        headGroup.rotation.y = Math.sin(timeSeconds * freq * 0.5) * 0.08;
      } else if (anim.state === 'walk') {
        const freq = 6.2 * anim.speed;
        const angleL = Math.sin(timeSeconds * freq) * 0.52;
        const angleR = -angleL;

        legL.legPivot.rotation.x = angleL;
        legR.legPivot.rotation.x = angleR;

        armL.armPivot.rotation.x = angleR * 0.7;
        armR.armPivot.rotation.x = angleL * 0.7;
        armL.armPivot.rotation.z = -0.12;
        armR.armPivot.rotation.z = 0.12;

        hipGroup.rotation.x = 0.08;
        hipGroup.rotation.z = 0;
        hipGroup.position.y = (0.55 + Math.abs(Math.sin(timeSeconds * freq)) * 0.04) * scale;
        headGroup.rotation.y = Math.sin(timeSeconds * freq * 0.5) * 0.06;
        headGroup.rotation.z = Math.sin(timeSeconds * freq) * 0.03;
      } else if (anim.state === 'jump') {
        hipGroup.rotation.x = -0.06;
        hipGroup.rotation.z = 0;
        legL.legPivot.rotation.x = -0.38;
        legR.legPivot.rotation.x = 0.22;
        armL.armPivot.rotation.x = -0.45;
        armR.armPivot.rotation.x = -0.45;
        armL.armPivot.rotation.z = -0.65;
        armR.armPivot.rotation.z = 0.65;
        headGroup.rotation.y = 0;
      } else if (anim.state === 'pickup') {
        // Reaching down to pick up a component
        hipGroup.rotation.x = 0.45;
        hipGroup.position.y = 0.42 * scale;
        legL.legPivot.rotation.x = -0.3;
        legR.legPivot.rotation.x = 0.2;
        armR.armPivot.rotation.x = -1.1;
        armR.armPivot.rotation.z = 0.2;
        armL.armPivot.rotation.x = 0.2;
        headGroup.rotation.x = 0.4;
      } else if (anim.state === 'repair') {
        hipGroup.rotation.x = 0.16;
        hipGroup.position.y = 0.52 * scale;
        legL.legPivot.rotation.x = 0.2;
        legR.legPivot.rotation.x = -0.2;

        armR.armPivot.rotation.x = -1.25 + Math.sin(timeSeconds * 12) * 0.16;
        armR.armPivot.rotation.z = 0.35 + Math.cos(timeSeconds * 10) * 0.12;
        armL.armPivot.rotation.x = -0.85;
        armL.armPivot.rotation.z = -0.32;
        headGroup.rotation.x = 0.28;
      } else if (anim.state === 'celebrate' || anim.state === 'victory') {
        hipGroup.position.y = (0.55 + Math.abs(Math.sin(timeSeconds * 5)) * 0.12) * scale;
        hipGroup.rotation.x = 0;
        armL.armPivot.rotation.x = 0;
        armR.armPivot.rotation.x = 0;
        armL.armPivot.rotation.z = -2.45 + Math.sin(timeSeconds * 6) * 0.35;
        armR.armPivot.rotation.z = 2.45 - Math.sin(timeSeconds * 6) * 0.35;
        headGroup.rotation.x = -0.25;
        headGroup.rotation.y = Math.sin(timeSeconds * 3) * 0.2;
      } else if (anim.state === 'float') {
        const floatY = Math.sin(timeSeconds * 1.8) * 0.12 * scale;
        hipGroup.position.y = 0.7 * scale + floatY;
        hipGroup.rotation.z = Math.sin(timeSeconds * 1.2) * 0.08;
        hipGroup.rotation.x = Math.cos(timeSeconds * 1.4) * 0.06;
        armL.armPivot.rotation.z = -0.38 + Math.sin(timeSeconds * 1.5) * 0.1;
        armR.armPivot.rotation.z = 0.38 - Math.sin(timeSeconds * 1.5) * 0.1;
        legL.legPivot.rotation.x = 0.2 + Math.sin(timeSeconds * 1.2) * 0.1;
        legR.legPivot.rotation.x = 0.1 - Math.cos(timeSeconds * 1.2) * 0.1;
      } else {
        // Idle breathing and head sway
        const breath = Math.sin(timeSeconds * 2.2) * 0.02 * scale;
        hipGroup.position.y = 0.55 * scale + breath;
        hipGroup.rotation.x = 0;
        hipGroup.rotation.z = 0;
        legL.legPivot.rotation.x = 0;
        legR.legPivot.rotation.x = 0;
        armL.armPivot.rotation.x = Math.sin(timeSeconds * 2.2) * 0.05;
        armR.armPivot.rotation.x = -Math.sin(timeSeconds * 2.2) * 0.05;
        armL.armPivot.rotation.z = -0.15;
        armR.armPivot.rotation.z = 0.15;
        headGroup.rotation.x = 0;
        headGroup.rotation.y = Math.sin(timeSeconds * 0.8) * 0.12;
      }
    }
  };

  root.userData.anim = anim;
  root.userData.parts = {
    headGroup,
    helmet,
    eyeL,
    eyeR,
    armL,
    armR,
    legL,
    legR,
    hipGroup
  };

  return root;
}
