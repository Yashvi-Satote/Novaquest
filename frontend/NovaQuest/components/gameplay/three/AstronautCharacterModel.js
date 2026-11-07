import * as THREE from 'three';

/**
 * AstronautCharacterModel.js
 * 
 * Master 3D Character Model for NOVA / Leo
 * Faithfully engineered to match the user's approved reference character:
 * - Cute Cyan / Turquoise Alien Astronaut (Chibi explorer proportions)
 * - Sculpted inverted-teardrop alien cranium with smooth skull curvature and high forehead
 * - Huge glossy obsidian almond eyes with curved white specular reflections and animated blinking
 * - Giant crystal-clear spherical bubble helmet with luminous cyan edge aura
 * - Cosmic nebula & starry galaxy interior reflection inside the upper helmet dome
 * - Titanium metallic collar ring with purple-magenta gemstone cabochons and chrome studs
 * - Dark charcoal/slate spacesuit with fine cosmic stardust texture and curved seamlines
 * - Center chest telemetry capsule plate with recessed slot
 * - White telemetry indicator dot on the right thigh
 * - Cyan alien hands with 4 defined fingers (thumb + 3 fingers)
 * - Segmented knee pads and rounded chunky space boots
 * - Life-support backpack with dual thrusters and antenna
 * - Dedicated character lighting rig (key light, cyan fill, helmet point light) ensuring
 *   the hero never turns into a pitch-black silhouette in space or shadow
 * - Procedural animation rig: idle, walk, run, jump, pickup, repair, celebrate/victory, float
 */

/**
 * Helper to generate procedural canvas textures
 */
function createProceduralTextures() {
  if (typeof document === 'undefined') return null;

  // 1. Cosmic Nebula Texture (Upper helmet dome reflection)
  const galaxyCanvas = document.createElement('canvas');
  galaxyCanvas.width = 512;
  galaxyCanvas.height = 512;
  const gCtx = galaxyCanvas.getContext('2d');

  // Deep space cosmic gradient
  const grad = gCtx.createRadialGradient(256, 180, 30, 256, 256, 260);
  grad.addColorStop(0, '#3b186b'); // vibrant cosmic purple
  grad.addColorStop(0.35, '#1e114a'); // deep indigo
  grad.addColorStop(0.7, '#0c0828'); // dark indigo
  grad.addColorStop(1, '#020110'); // obsidian space
  gCtx.fillStyle = grad;
  gCtx.fillRect(0, 0, 512, 512);

  // Soft glowing cyan nebula clouds
  gCtx.fillStyle = 'rgba(56, 189, 248, 0.32)';
  for (let i = 0; i < 10; i++) {
    gCtx.beginPath();
    gCtx.arc(100 + Math.random() * 312, 80 + Math.random() * 320, 50 + Math.random() * 90, 0, Math.PI * 2);
    gCtx.fill();
  }

  // Soft purple/magenta nebula wisps
  gCtx.fillStyle = 'rgba(192, 132, 252, 0.28)';
  for (let i = 0; i < 10; i++) {
    gCtx.beginPath();
    gCtx.arc(100 + Math.random() * 312, 80 + Math.random() * 320, 45 + Math.random() * 80, 0, Math.PI * 2);
    gCtx.fill();
  }

  // Sparkling stardust
  gCtx.fillStyle = '#ffffff';
  for (let i = 0; i < 140; i++) {
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
  suitCanvas.width = 512;
  suitCanvas.height = 512;
  const sCtx = suitCanvas.getContext('2d');
  sCtx.fillStyle = '#222834'; // rich charcoal slate
  sCtx.fillRect(0, 0, 512, 512);

  // Subtle fabric noise
  const imgData = sCtx.getImageData(0, 0, 512, 512);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    d[i] = Math.max(0, Math.min(255, d[i] + noise));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + noise + 2));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + noise + 5));
  }
  sCtx.putImageData(imgData, 0, 0);

  // Fine starlight specks
  sCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let i = 0; i < 90; i++) {
    sCtx.fillRect(Math.random() * 512, Math.random() * 512, 1.2, 1.2);
  }

  const suitTexture = new THREE.CanvasTexture(suitCanvas);
  suitTexture.wrapS = THREE.RepeatWrapping;
  suitTexture.wrapT = THREE.RepeatWrapping;
  suitTexture.repeat.set(2, 2);

  // 3. Alien Skin Texture with soft gradient
  const skinCanvas = document.createElement('canvas');
  skinCanvas.width = 512;
  skinCanvas.height = 512;
  const skCtx = skinCanvas.getContext('2d');

  const skinGrad = skCtx.createLinearGradient(0, 0, 0, 512);
  skinGrad.addColorStop(0, '#38bdf8'); // sky/cyan crown
  skinGrad.addColorStop(0.28, '#22d3ee'); // bright cyan forehead
  skinGrad.addColorStop(0.7, '#06b6d4'); // aqua cheeks
  skinGrad.addColorStop(1, '#0891b2'); // shaded teal chin/neck
  skCtx.fillStyle = skinGrad;
  skCtx.fillRect(0, 0, 512, 512);

  // Subtle stardust on forehead
  skCtx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  for (let i = 0; i < 50; i++) {
    const fx = 150 + Math.random() * 212;
    const fy = 50 + Math.random() * 120;
    const fr = Math.random() < 0.2 ? 1.5 : 0.7;
    skCtx.beginPath();
    skCtx.arc(fx, fy, fr, 0, Math.PI * 2);
    skCtx.fill();
  }

  const skinTexture = new THREE.CanvasTexture(skinCanvas);
  skinTexture.wrapS = THREE.ClampToEdgeWrapping;
  skinTexture.wrapT = THREE.ClampToEdgeWrapping;

  return { galaxyTexture, suitTexture, skinTexture };
}

let cachedTextures = null;

/**
 * Creates the organic, continuous Alien Cranium geometry.
 */
function createAlienCraniumGeometry(scale = 1.0) {
  const baseRadius = 0.35 * scale;
  const geo = new THREE.SphereGeometry(baseRadius, 48, 48);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const normY = y / baseRadius; // -1 (bottom) to +1 (top)

    if (normY >= 0) {
      // Cranium upper dome & temples:
      const topFactor = Math.sin(normY * Math.PI * 0.5);
      x *= (1.0 + topFactor * 0.18); // Broad temples

      if (z < 0) {
        z *= (1.0 + topFactor * 0.22); // Elongated posterior skull
      } else {
        z *= (1.0 + topFactor * 0.05);
      }
      y *= 1.06;
    } else {
      // Lower face, cheeks & chin:
      const lowerFactor = -normY;
      const cheekTaper = 1.0 - lowerFactor * 0.46; // Smooth inward taper
      x *= Math.max(0.46, cheekTaper);

      if (z > 0) {
        z *= Math.max(0.68, 1.0 - lowerFactor * 0.38);
        z += Math.sin(lowerFactor * Math.PI) * 0.035 * scale; // Gentle chin prominence
      } else {
        z *= Math.max(0.52, 1.0 - lowerFactor * 0.44);
      }
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Master Factory for the Alien Hero Astronaut Character
 */
export function createAstronautCharacter({ scale = 1.0 } = {}) {
  const root = new THREE.Group();
  root.name = 'AstronautHero_Leo';

  if (!cachedTextures && typeof document !== 'undefined') {
    cachedTextures = createProceduralTextures();
  }

  // =========================================================================
  // MATERIALS SPECIFICATION
  // =========================================================================

  // Alien Skin: Smooth, vibrant turquoise/cyan with soft sheen
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    map: cachedTextures ? cachedTextures.skinTexture : null,
    roughness: 0.25,
    metalness: 0.04
  });

  // Spacesuit: Dark charcoal/slate with fine cosmic specks
  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x222834, // rich charcoal slate
    roughness: 0.48,
    metalness: 0.35,
    map: cachedTextures ? cachedTextures.suitTexture : null
  });

  // Spacesuit Trim & Piping: Metallic silver-slate
  const suitTrimMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // slate-600
    roughness: 0.32,
    metalness: 0.72
  });

  // Titanium Collar: Bright gleaming silver titanium
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // gleaming silver chrome
    metalness: 0.65,
    roughness: 0.18,
    emissive: 0x475569,
    emissiveIntensity: 0.35
  });

  // Purple/Magenta Gemstone Cabochons (matching user reference image)
  const purpleRivetMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc, // vibrant violet/purple
    metalness: 0.8,
    roughness: 0.1,
    emissive: 0xa855f7,
    emissiveIntensity: 1.2
  });

  // Eyes: Ultra-glossy obsidian black
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x020408,
    roughness: 0.01,
    metalness: 0.96
  });

  // Curved Crescent Specular Reflection Highlight
  const eyeSpecularMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95
  });

  // Secondary soft gleam
  const eyeSoftGleamMat = new THREE.MeshBasicMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.55
  });

  // Glass Bubble Helmet: Crystal-clear physical glass
  const helmetGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xdbeafe, // soft ice-blue tint
    transmission: 0.88,
    opacity: 0.32,
    transparent: true,
    roughness: 0.04,
    metalness: 0.12,
    ior: 1.48,
    reflectivity: 0.92,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05
  });

  // Luminous Cyan Helmet Rim Halo (vibrant cosmic edge aura)
  const helmetAuraMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });

  // Upper/Rear Helmet Cosmic Starfield / Nebula Shell
  const cosmicNebulaMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: cachedTextures ? cachedTextures.galaxyTexture : null,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75
  });

  // White Telemetry Dot Material
  const telemetryDotMat = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });

  // =========================================================================
  // DEDICATED HERO CHARACTER LIGHTING RIG
  // Ensures the cute hero is always beautifully lit with soft key and fill light,
  // matching AAA character presentation and preventing dark silhouettes.
  // =========================================================================
  const characterLightRig = new THREE.Group();
  root.add(characterLightRig);

  // Front-Right Warm Key Light
  const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
  keyLight.position.set(1.8 * scale, 2.8 * scale, 3.2 * scale);
  characterLightRig.add(keyLight);

  // Front-Left Cool Cyan Fill Light
  const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
  fillLight.position.set(-2.2 * scale, 1.8 * scale, 2.8 * scale);
  characterLightRig.add(fillLight);

  // Rear Indigo Rim Light
  const rimLight = new THREE.DirectionalLight(0x818cf8, 1.1);
  rimLight.position.set(0, 3.0 * scale, -2.8 * scale);
  characterLightRig.add(rimLight);

  // =========================================================================
  // 1. PELVIS & ROOT GROUP (Chibi Torso Structure)
  // =========================================================================
  const hipGroup = new THREE.Group();
  hipGroup.position.y = 0.55 * scale;
  root.add(hipGroup);

  const torsoGroup = new THREE.Group();
  hipGroup.add(torsoGroup);

  // Lower Abdomen / Pelvis
  const pelvisGeo = new THREE.CylinderGeometry(0.28 * scale, 0.25 * scale, 0.22 * scale, 24);
  const pelvis = new THREE.Mesh(pelvisGeo, suitMat);
  pelvis.position.y = 0.11 * scale;
  torsoGroup.add(pelvis);

  // Upper Chest / Spacesuit Jacket
  const chestGeo = new THREE.CylinderGeometry(0.32 * scale, 0.28 * scale, 0.34 * scale, 24);
  const chest = new THREE.Mesh(chestGeo, suitMat);
  chest.position.y = 0.35 * scale;
  torsoGroup.add(chest);

  // Soft Rounded Chest Arch
  const chestBulgeGeo = new THREE.SphereGeometry(0.29 * scale, 24, 16);
  chestBulgeGeo.scale(1.05, 0.85, 0.75);
  const chestBulge = new THREE.Mesh(chestBulgeGeo, suitMat);
  chestBulge.position.set(0, 0.34 * scale, 0.08 * scale);
  torsoGroup.add(chestBulge);

  // Center Chest Telemetry Capsule Badge (matching reference image)
  const chestPlateGroup = new THREE.Group();
  chestPlateGroup.position.set(0, 0.35 * scale, 0.315 * scale);
  torsoGroup.add(chestPlateGroup);

  // Outer Silver Capsule
  const badgeBaseGeo = new THREE.CapsuleGeometry(0.042 * scale, 0.13 * scale, 8, 16);
  const badgeBase = new THREE.Mesh(badgeBaseGeo, titaniumMat);
  chestPlateGroup.add(badgeBase);

  // Inner Dark Recessed Groove
  const badgeInnerGeo = new THREE.CapsuleGeometry(0.018 * scale, 0.085 * scale, 8, 16);
  const badgeInner = new THREE.Mesh(
    badgeInnerGeo,
    new THREE.MeshBasicMaterial({ color: 0x0f172a })
  );
  badgeInner.position.z = 0.02 * scale;
  chestPlateGroup.add(badgeInner);

  // Top Indicator Dot on Badge
  const badgeDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.009 * scale, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  badgeDot.position.set(0, 0.05 * scale, 0.024 * scale);
  chestPlateGroup.add(badgeDot);

  // Curved Spacesuit Seamlines / Piping (Stylized V-cut across chest down to hips)
  const seamCurveL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.25 * scale, 0.46 * scale, 0.16 * scale),
    new THREE.Vector3(-0.16 * scale, 0.32 * scale, 0.28 * scale),
    new THREE.Vector3(-0.14 * scale, 0.16 * scale, 0.25 * scale),
    new THREE.Vector3(-0.18 * scale, 0.04 * scale, 0.18 * scale)
  ]);
  const seamGeoL = new THREE.TubeGeometry(seamCurveL, 20, 0.012 * scale, 8, false);
  const seamL = new THREE.Mesh(seamGeoL, suitTrimMat);
  torsoGroup.add(seamL);

  const seamCurveR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.25 * scale, 0.46 * scale, 0.16 * scale),
    new THREE.Vector3(0.15 * scale, 0.32 * scale, 0.28 * scale),
    new THREE.Vector3(0.14 * scale, 0.16 * scale, 0.25 * scale),
    new THREE.Vector3(0.18 * scale, 0.04 * scale, 0.18 * scale)
  ]);
  const seamGeoR = new THREE.TubeGeometry(seamCurveR, 20, 0.012 * scale, 8, false);
  const seamR = new THREE.Mesh(seamGeoR, suitTrimMat);
  torsoGroup.add(seamR);

  // White Telemetry Dot on Right Thigh / Hip (matching reference image)
  const thighDotGeo = new THREE.CylinderGeometry(0.019 * scale, 0.019 * scale, 0.01 * scale, 12);
  const thighDot = new THREE.Mesh(thighDotGeo, telemetryDotMat);
  thighDot.rotation.x = Math.PI / 2;
  thighDot.position.set(-0.16 * scale, 0.02 * scale, 0.24 * scale);
  torsoGroup.add(thighDot);

  // Life-Support Backpack (PLSS)
  const backpackGeo = new THREE.BoxGeometry(0.36 * scale, 0.44 * scale, 0.18 * scale);
  const backpack = new THREE.Mesh(backpackGeo, suitTrimMat);
  backpack.position.set(0, 0.33 * scale, -0.21 * scale);
  torsoGroup.add(backpack);

  // Backpack telemetry antenna
  const antennaGeo = new THREE.CylinderGeometry(0.01 * scale, 0.01 * scale, 0.32 * scale, 8);
  const antenna = new THREE.Mesh(antennaGeo, titaniumMat);
  antenna.position.set(0.13 * scale, 0.58 * scale, -0.21 * scale);
  torsoGroup.add(antenna);

  // Dual Thruster Mini-Nozzles on Backpack
  const nozzleGeo = new THREE.CylinderGeometry(0.035 * scale, 0.055 * scale, 0.08 * scale, 12);
  for (let bx of [-0.11, 0.11]) {
    const noz = new THREE.Mesh(nozzleGeo, titaniumMat);
    noz.position.set(bx * scale, 0.15 * scale, -0.29 * scale);
    noz.rotation.x = 0.25;
    torsoGroup.add(noz);
  }

  // =========================================================================
  // 2. TITANIUM COLLAR & PURPLE GEMSTONE CABOCHONS
  // =========================================================================
  const collarGroup = new THREE.Group();
  collarGroup.position.y = 0.53 * scale;
  hipGroup.add(collarGroup);

  const collarGeo = new THREE.TorusGeometry(0.33 * scale, 0.052 * scale, 16, 32);
  const collar = new THREE.Mesh(collarGeo, titaniumMat);
  collar.rotation.x = Math.PI / 2;
  collarGroup.add(collar);

  // 12 Rivet Beads embedded around collar (with 4 glowing purple gems)
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    const isPurpleGem = (i === 1 || i === 5 || i === 7 || i === 11);
    const beadMat = isPurpleGem ? purpleRivetMat : titaniumMat;
    const beadSize = isPurpleGem ? 0.024 * scale : 0.018 * scale;

    const beadGeo = new THREE.SphereGeometry(beadSize, 10, 10);
    const bead = new THREE.Mesh(beadGeo, beadMat);
    bead.position.set(
      Math.cos(angle) * 0.33 * scale,
      0.025 * scale,
      Math.sin(angle) * 0.33 * scale
    );
    collarGroup.add(bead);
  }

  // =========================================================================
  // 3. HEAD & HELMET (Neck Pivot)
  // =========================================================================
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.63 * scale;
  hipGroup.add(headGroup);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.15 * scale, 0.17 * scale, 0.14 * scale, 16);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = 0.04 * scale;
  headGroup.add(neck);

  // Giant Crystal Bubble Helmet (Spacious Glass Sphere matching reference)
  const helmetCenterY = 0.30 * scale;
  const helmetRadius = 0.60 * scale;

  const helmetGeo = new THREE.SphereGeometry(helmetRadius, 48, 48);
  const helmet = new THREE.Mesh(helmetGeo, helmetGlassMat);
  helmet.position.y = helmetCenterY;
  headGroup.add(helmet);

  // Luminous Cyan Spherical Edge Aura
  const auraGeo = new THREE.SphereGeometry(helmetRadius * 0.99, 36, 36);
  const helmetAura = new THREE.Mesh(auraGeo, helmetAuraMat);
  helmetAura.position.y = helmetCenterY;
  headGroup.add(helmetAura);

  // Upper Cosmic Nebula / Starfield Dome (Visible above head inside bubble!)
  const cosmicDomeGeo = new THREE.SphereGeometry(
    helmetRadius * 0.98,
    36,
    36,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.48 // Covers the top dome of the helmet
  );
  const cosmicDome = new THREE.Mesh(cosmicDomeGeo, cosmicNebulaMat);
  cosmicDome.position.set(0, helmetCenterY, 0);
  headGroup.add(cosmicDome);

  // Internal Soft Cyan Point Light (illuminates head from within the bubble)
  const interiorLight = new THREE.PointLight(0x38bdf8, 1.4, 2.5 * scale);
  interiorLight.position.set(0, helmetCenterY + 0.12 * scale, 0.38 * scale);
  headGroup.add(interiorLight);

  // Sculpted Alien Cranium (Continuous organic alien head: wide forehead, tapered chin)
  const skullGeo = createAlienCraniumGeometry(scale);
  const skull = new THREE.Mesh(skullGeo, skinMat);
  skull.position.set(0, helmetCenterY + 0.02 * scale, 0);
  headGroup.add(skull);

  // Cute Tiny Button Nose
  const noseGeo = new THREE.SphereGeometry(0.020 * scale, 12, 12);
  noseGeo.scale(1.0, 0.7, 1.2);
  const nose = new THREE.Mesh(noseGeo, skinMat);
  nose.position.set(0, helmetCenterY - 0.045 * scale, 0.32 * scale);
  headGroup.add(nose);

  // Nostril dimples
  const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x0891b2 });
  for (let nx of [-0.011, 0.011]) {
    const nostrilGeo = new THREE.SphereGeometry(0.005 * scale, 6, 6);
    const nostril = new THREE.Mesh(nostrilGeo, nostrilMat);
    nostril.position.set(nx * scale, helmetCenterY - 0.052 * scale, 0.325 * scale);
    headGroup.add(nostril);
  }

  // Gentle Cute Mouth Line (Subtle closed smile)
  const mouthCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.038 * scale, helmetCenterY - 0.115 * scale, 0.285 * scale),
    new THREE.Vector3(0, helmetCenterY - 0.122 * scale, 0.30 * scale),
    new THREE.Vector3(0.038 * scale, helmetCenterY - 0.115 * scale, 0.285 * scale)
  ]);
  const mouthGeo = new THREE.TubeGeometry(mouthCurve, 12, 0.0055 * scale, 6, false);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x083344 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  headGroup.add(mouth);

  // =========================================================================
  // 4. HUGE GLOSSY ALMOND OBSIDIAN EYES & SPECULAR CRESCENT HIGHLIGHTS
  // Matching the prominent, expressive alien eyes from the reference image.
  // =========================================================================
  // Large almond eye dimensions
  const eyeWidth = 0.19 * scale;
  const eyeHeight = 0.15 * scale;
  const eyeDepth = 0.08 * scale;

  const eyeGeo = new THREE.SphereGeometry(eyeWidth, 28, 28);
  eyeGeo.scale(1.0, eyeHeight / eyeWidth, eyeDepth / eyeWidth);

  // Curved Crescent Specular Reflection Arc (Proud of surface)
  const crescentCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.09 * scale, 0.045 * scale, 0.096 * scale),
    new THREE.Vector3(-0.02 * scale, 0.082 * scale, 0.102 * scale),
    new THREE.Vector3(0.065 * scale, 0.055 * scale, 0.096 * scale)
  ]);
  const crescentGeo = new THREE.TubeGeometry(crescentCurve, 16, 0.022 * scale, 8, false);

  // Secondary soft ambient reflection
  const softGleamGeo = new THREE.SphereGeometry(0.028 * scale, 10, 10);
  softGleamGeo.scale(1.2, 0.7, 0.5);

  // Left Eye (Viewer Left)
  const eyeLGroup = new THREE.Group();
  eyeLGroup.position.set(-0.165 * scale, helmetCenterY + 0.038 * scale, 0.285 * scale);
  eyeLGroup.rotation.set(0.12, -0.28, 0.40); // slanted outwards and curved around skull
  headGroup.add(eyeLGroup);

  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeLGroup.add(eyeL);

  const crescentL = new THREE.Mesh(crescentGeo, eyeSpecularMat);
  crescentL.renderOrder = 2;
  eyeLGroup.add(crescentL);

  const softGleamL = new THREE.Mesh(softGleamGeo, eyeSoftGleamMat);
  softGleamL.position.set(0.05 * scale, -0.04 * scale, 0.092 * scale);
  softGleamL.renderOrder = 2;
  eyeLGroup.add(softGleamL);

  // Right Eye (Viewer Right)
  const eyeRGroup = new THREE.Group();
  eyeRGroup.position.set(0.165 * scale, helmetCenterY + 0.038 * scale, 0.285 * scale);
  eyeRGroup.rotation.set(0.12, 0.28, -0.40); // slanted outwards and curved around skull
  headGroup.add(eyeRGroup);

  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeRGroup.add(eyeR);

  // Mirrored crescent for right eye
  const crescentCurveR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.065 * scale, 0.055 * scale, 0.096 * scale),
    new THREE.Vector3(0.02 * scale, 0.082 * scale, 0.102 * scale),
    new THREE.Vector3(0.09 * scale, 0.045 * scale, 0.096 * scale)
  ]);
  const crescentGeoR = new THREE.TubeGeometry(crescentCurveR, 16, 0.022 * scale, 8, false);
  const crescentR = new THREE.Mesh(crescentGeoR, eyeSpecularMat);
  crescentR.renderOrder = 2;
  eyeRGroup.add(crescentR);

  const softGleamR = new THREE.Mesh(softGleamGeo, eyeSoftGleamMat);
  softGleamR.position.set(-0.05 * scale, -0.04 * scale, 0.092 * scale);
  softGleamR.renderOrder = 2;
  eyeRGroup.add(softGleamR);

  // =========================================================================
  // 5. ARMS & 4-FINGERED CYAN HANDS
  // =========================================================================
  function createAlienArm(isLeft) {
    const armPivot = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    armPivot.position.set(sign * 0.34 * scale, 0.48 * scale, 0);

    // Shoulder Pad Cap
    const shoulderGeo = new THREE.SphereGeometry(0.105 * scale, 16, 16);
    shoulderGeo.scale(1.0, 1.15, 1.0);
    const shoulder = new THREE.Mesh(shoulderGeo, suitTrimMat);
    shoulder.position.y = -0.02 * scale;
    armPivot.add(shoulder);

    // Bicep / Upper Arm
    const bicepGeo = new THREE.CapsuleGeometry(0.08 * scale, 0.15 * scale, 8, 16);
    const bicep = new THREE.Mesh(bicepGeo, suitMat);
    bicep.position.y = -0.13 * scale;
    armPivot.add(bicep);

    // Forearm with Ribbed Bellows Cuff
    const forearmGroup = new THREE.Group();
    forearmGroup.position.y = -0.24 * scale;
    armPivot.add(forearmGroup);

    const cuffGeo = new THREE.CylinderGeometry(0.085 * scale, 0.08 * scale, 0.11 * scale, 16);
    const cuff = new THREE.Mesh(cuffGeo, suitTrimMat);
    cuff.position.y = -0.05 * scale;
    forearmGroup.add(cuff);

    // Cyan Alien Palm
    const palmGeo = new THREE.SphereGeometry(0.07 * scale, 12, 12);
    palmGeo.scale(1.1, 0.75, 0.95);
    const palm = new THREE.Mesh(palmGeo, skinMat);
    palm.position.y = -0.13 * scale;
    forearmGroup.add(palm);

    // 4 Defined Fingers: Thumb + 3 Fingers
    const fingers = [];
    const fingerOffsets = [
      { x: sign * 0.042 * scale, y: -0.14 * scale, z: 0.028 * scale, length: 0.055 * scale, angleZ: sign * 0.45 }, // Thumb
      { x: sign * 0.022 * scale, y: -0.19 * scale, z: 0.01 * scale, length: 0.075 * scale, angleZ: sign * 0.08 },  // Index
      { x: 0, y: -0.20 * scale, z: 0, length: 0.08 * scale, angleZ: 0 },                                           // Middle
      { x: -sign * 0.022 * scale, y: -0.18 * scale, z: -0.01 * scale, length: 0.065 * scale, angleZ: -sign * 0.12 } // Pinky
    ];

    fingerOffsets.forEach(cfg => {
      const fGeo = new THREE.CapsuleGeometry(0.015 * scale, cfg.length, 6, 8);
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

  // Natural resting arm flare (~12 degrees)
  armL.armPivot.rotation.z = -0.20;
  armR.armPivot.rotation.z = 0.20;

  // =========================================================================
  // 6. LEGS, KNEE PADS & ROUNDED BOOTS (Chunky Chibi Explorer Stance)
  // =========================================================================
  function createAlienLeg(isLeft) {
    const legPivot = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    // Naturally spaced stance (hip-width apart)
    legPivot.position.set(sign * 0.15 * scale, 0.06 * scale, 0);

    // Thigh with slight outward flare
    const thighGeo = new THREE.CapsuleGeometry(0.10 * scale, 0.20 * scale, 8, 16);
    const thigh = new THREE.Mesh(thighGeo, suitMat);
    thigh.position.y = -0.13 * scale;
    legPivot.add(thigh);

    // Knee Pad Guard (matching reference image)
    const kneeGeo = new THREE.BoxGeometry(0.12 * scale, 0.10 * scale, 0.07 * scale);
    const knee = new THREE.Mesh(kneeGeo, suitTrimMat);
    knee.position.set(0, -0.21 * scale, 0.09 * scale);
    legPivot.add(knee);

    // Knee Pad Rivet
    const kneeRivetGeo = new THREE.SphereGeometry(0.012 * scale, 6, 6);
    const kneeRivet = new THREE.Mesh(kneeRivetGeo, titaniumMat);
    kneeRivet.position.set(0, -0.21 * scale, 0.13 * scale);
    legPivot.add(kneeRivet);

    // Shin / Lower Leg
    const shinGeo = new THREE.CapsuleGeometry(0.09 * scale, 0.19 * scale, 8, 16);
    const shin = new THREE.Mesh(shinGeo, suitMat);
    shin.position.y = -0.31 * scale;
    legPivot.add(shin);

    // Rounded Space Boot
    const bootGroup = new THREE.Group();
    bootGroup.position.set(0, -0.46 * scale, 0.03 * scale);
    legPivot.add(bootGroup);

    // Boot Body
    const bootGeo = new THREE.BoxGeometry(0.17 * scale, 0.11 * scale, 0.25 * scale);
    const boot = new THREE.Mesh(bootGeo, suitMat);
    bootGroup.add(boot);

    // Curved Boot Toe Cap (smooth rounded space boot)
    const toeGeo = new THREE.SphereGeometry(0.085 * scale, 14, 14);
    toeGeo.scale(1.0, 0.58, 1.15);
    const toe = new THREE.Mesh(toeGeo, suitTrimMat);
    toe.position.set(0, -0.01 * scale, 0.095 * scale);
    bootGroup.add(toe);

    // Ribbed Lunar Sole
    const soleGeo = new THREE.BoxGeometry(0.18 * scale, 0.028 * scale, 0.27 * scale);
    const sole = new THREE.Mesh(soleGeo, suitTrimMat);
    sole.position.y = -0.06 * scale;
    bootGroup.add(sole);

    // Angle boot slightly outward for confident explorer stance
    bootGroup.rotation.y = sign * 0.12;

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

      // Natural eye blinking simulation (gentle scale blink)
      anim.blinkTimer += timeDelta;
      if (anim.blinkTimer > 3.6) {
        eyeLGroup.scale.y = 0.08;
        eyeRGroup.scale.y = 0.08;
        if (anim.blinkTimer > 3.75) {
          eyeLGroup.scale.y = 1.0;
          eyeRGroup.scale.y = 1.0;
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
        armL.armPivot.rotation.z = -0.16;
        armR.armPivot.rotation.z = 0.16;

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
        // Idle breathing and gentle floating bob
        const breath = Math.sin(timeSeconds * 2.2) * 0.018 * scale;
        hipGroup.position.y = 0.55 * scale + breath;
        hipGroup.rotation.x = 0;
        hipGroup.rotation.z = 0;
        legL.legPivot.rotation.x = 0;
        legR.legPivot.rotation.x = 0;
        armL.armPivot.rotation.x = Math.sin(timeSeconds * 2.2) * 0.04;
        armR.armPivot.rotation.x = -Math.sin(timeSeconds * 2.2) * 0.04;
        armL.armPivot.rotation.z = -0.20;
        armR.armPivot.rotation.z = 0.20;
        headGroup.rotation.x = 0;
        headGroup.rotation.y = Math.sin(timeSeconds * 0.8) * 0.10;
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
