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
 * - Segmented knee pads and rounded chunky space boots (ground-aligned at Y = 0)
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

  const grad = gCtx.createRadialGradient(256, 180, 30, 256, 256, 260);
  grad.addColorStop(0, '#4c1d95'); // vibrant cosmic purple
  grad.addColorStop(0.35, '#1e1b4b'); // deep indigo
  grad.addColorStop(0.7, '#0f172a'); // dark slate space
  grad.addColorStop(1, '#020617'); // obsidian space
  gCtx.fillStyle = grad;
  gCtx.fillRect(0, 0, 512, 512);

  // Soft glowing cyan nebula clouds
  gCtx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  for (let i = 0; i < 12; i++) {
    gCtx.beginPath();
    gCtx.arc(100 + Math.random() * 312, 80 + Math.random() * 320, 50 + Math.random() * 90, 0, Math.PI * 2);
    gCtx.fill();
  }

  // Brilliant star sparkles
  gCtx.fillStyle = '#ffffff';
  for (let i = 0; i < 180; i++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const sr = Math.random() < 0.15 ? 1.8 : 0.8;
    gCtx.beginPath();
    gCtx.arc(sx, sy, sr, 0, Math.PI * 2);
    gCtx.fill();
  }

  const galaxyTexture = new THREE.CanvasTexture(galaxyCanvas);
  galaxyTexture.wrapS = THREE.ClampToEdgeWrapping;
  galaxyTexture.wrapT = THREE.ClampToEdgeWrapping;

  // 2. Charcoal Slate Spacesuit Texture with fine fabric weave
  const suitCanvas = document.createElement('canvas');
  suitCanvas.width = 512;
  suitCanvas.height = 512;
  const sCtx = suitCanvas.getContext('2d');
  sCtx.fillStyle = '#1e2430'; // rich charcoal slate
  sCtx.fillRect(0, 0, 512, 512);

  const imgData = sCtx.getImageData(0, 0, 512, 512);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    d[i] = Math.max(0, Math.min(255, d[i] + noise));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + noise + 2));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + noise + 4));
  }
  sCtx.putImageData(imgData, 0, 0);

  // Fine starlight specks
  sCtx.fillStyle = 'rgba(255, 255, 255, 0.40)';
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
  skinGrad.addColorStop(0.68, '#06b6d4'); // aqua cheeks
  skinGrad.addColorStop(1, '#0891b2'); // shaded teal chin/neck
  skCtx.fillStyle = skinGrad;
  skCtx.fillRect(0, 0, 512, 512);

  // Subtle stardust on forehead
  skCtx.fillStyle = 'rgba(255, 255, 255, 0.70)';
  for (let i = 0; i < 55; i++) {
    const fx = 150 + Math.random() * 212;
    const fy = 50 + Math.random() * 120;
    const fr = Math.random() < 0.2 ? 1.6 : 0.8;
    skCtx.beginPath();
    skCtx.arc(fx, fy, fr, 0, Math.PI * 2);
    skCtx.fill();
  }

  const skinTexture = new THREE.CanvasTexture(skinCanvas);
  skinTexture.wrapS = THREE.ClampToEdgeWrapping;
  skinTexture.wrapT = THREE.ClampToEdgeWrapping;

  // 4. Glossy Alien Almond Eye Texture with Baked Specular Crescent
  const eyeCanvas = document.createElement('canvas');
  eyeCanvas.width = 512;
  eyeCanvas.height = 512;
  const eCtx = eyeCanvas.getContext('2d');

  // Deep obsidian gloss base with subtle midnight blue edge
  const eyeGrad = eCtx.createRadialGradient(240, 240, 50, 256, 256, 250);
  eyeGrad.addColorStop(0, '#020408');
  eyeGrad.addColorStop(0.75, '#050a14');
  eyeGrad.addColorStop(1, '#082f49');
  eCtx.fillStyle = eyeGrad;
  eCtx.fillRect(0, 0, 512, 512);

  // Brilliant curved white specular crescent across upper arch (matching reference)
  eCtx.save();
  eCtx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  eCtx.lineWidth = 42;
  eCtx.lineCap = 'round';
  eCtx.beginPath();
  eCtx.arc(256, 270, 165, Math.PI * 1.15, Math.PI * 1.82);
  eCtx.stroke();

  // Cyan soft glow along the crescent
  eCtx.strokeStyle = 'rgba(56, 189, 248, 0.50)';
  eCtx.lineWidth = 64;
  eCtx.beginPath();
  eCtx.arc(256, 270, 165, Math.PI * 1.15, Math.PI * 1.82);
  eCtx.stroke();

  // Secondary soft specular gleam in lower-right
  const gleamGrad = eCtx.createRadialGradient(340, 350, 5, 340, 350, 65);
  gleamGrad.addColorStop(0, 'rgba(186, 230, 253, 0.70)');
  gleamGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
  gleamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  eCtx.fillStyle = gleamGrad;
  eCtx.beginPath();
  eCtx.arc(340, 350, 65, 0, Math.PI * 2);
  eCtx.fill();
  eCtx.restore();

  const eyeTexture = new THREE.CanvasTexture(eyeCanvas);
  eyeTexture.wrapS = THREE.ClampToEdgeWrapping;
  eyeTexture.wrapT = THREE.ClampToEdgeWrapping;

  return { galaxyTexture, suitTexture, skinTexture, eyeTexture };
}

let cachedTextures = null;

/**
 * Creates the organic, continuous Alien Cranium geometry.
 * Broad high domed cranium, smooth curved temples, gentle inward cheek taper to a cute chin.
 */
function createAlienCraniumGeometry(scale = 1.0) {
  const baseRadius = 0.32 * scale;
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
      x *= (1.0 + topFactor * 0.22); // Broad temples
      if (z < 0) {
        z *= (1.0 + topFactor * 0.25); // Elongated posterior skull
      } else {
        z *= (1.0 + topFactor * 0.08);
      }
      y *= 1.08;
    } else {
      // Lower face, cheeks & chin:
      const lowerFactor = -normY;
      const cheekTaper = 1.0 - lowerFactor * 0.44; // Smooth inward taper
      x *= Math.max(0.48, cheekTaper);

      if (z > 0) {
        z *= Math.max(0.70, 1.0 - lowerFactor * 0.35);
        z += Math.sin(lowerFactor * Math.PI) * 0.035 * scale; // Gentle chin prominence
      } else {
        z *= Math.max(0.55, 1.0 - lowerFactor * 0.40);
      }
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates sculpted almond eye geometry
 */
function createAlmondEyeGeometry(width, height, depth) {
  const geo = new THREE.SphereGeometry(width, 32, 32);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Scale Y and Z
    y *= (height / width);
    z *= (depth / width);

    // Almond taper towards horizontal extremities
    const normX = Math.abs(x) / width;
    if (normX > 0.4) {
      const taper = 1.0 - (normX - 0.4) * 0.35;
      y *= taper;
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
    roughness: 0.28,
    metalness: 0.04
  });

  // Spacesuit: Dark charcoal/slate with fine cosmic specks
  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x1e2430, // rich charcoal slate
    roughness: 0.45,
    metalness: 0.35,
    map: cachedTextures ? cachedTextures.suitTexture : null
  });

  // Spacesuit Trim & Piping: Metallic silver-slate
  const suitTrimMat = new THREE.MeshStandardMaterial({
    color: 0x475569, // slate-600
    roughness: 0.30,
    metalness: 0.72
  });

  // Titanium Collar: Bright gleaming silver titanium
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // gleaming silver chrome
    metalness: 0.78,
    roughness: 0.16,
    emissive: 0x334155,
    emissiveIntensity: 0.3
  });

  // Purple/Magenta Gemstone Cabochons (matching user reference image)
  const purpleRivetMat = new THREE.MeshStandardMaterial({
    color: 0xd8b4fe, // bright violet/purple
    metalness: 0.85,
    roughness: 0.08,
    emissive: 0xc084fc,
    emissiveIntensity: 2.4
  });

  // Eyes: Ultra-glossy obsidian black with baked specular map
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: cachedTextures ? cachedTextures.eyeTexture : null,
    roughness: 0.04,
    metalness: 0.88
  });

  // Curved Crescent Specular Reflection Highlight
  const eyeSpecularMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95
  });

  // Glass Bubble Helmet: Crystal-clear physical glass
  const helmetGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe, // crystal ice tint
    transmission: 0.92,
    opacity: 0.28,
    transparent: true,
    roughness: 0.03,
    metalness: 0.08,
    ior: 1.48,
    reflectivity: 0.92,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03
  });

  // Luminous Cyan Helmet Rim Halo (vibrant cosmic edge aura matching reference)
  const helmetAuraMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.72,
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
  // Ensures the hero is always beautifully lit and recognizable,
  // matching AAA character presentation and preventing dark silhouettes.
  // =========================================================================
  const characterLightRig = new THREE.Group();
  root.add(characterLightRig);

  // Front-Right Warm Key Light
  const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.0);
  keyLight.position.set(1.8 * scale, 2.8 * scale, 3.2 * scale);
  characterLightRig.add(keyLight);

  // Front-Left Cool Cyan Fill Light
  const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
  fillLight.position.set(-2.2 * scale, 1.8 * scale, 2.8 * scale);
  characterLightRig.add(fillLight);

  // Rear Indigo Rim Light
  const rimLight = new THREE.DirectionalLight(0x818cf8, 1.2);
  rimLight.position.set(0, 3.0 * scale, -2.8 * scale);
  characterLightRig.add(rimLight);

  // =========================================================================
  // 1. PELVIS & ROOT GROUP (Chibi Torso Structure)
  // Calibrated so bottom of boot soles rests exactly at Y = 0.0
  // =========================================================================
  const hipGroup = new THREE.Group();
  hipGroup.position.y = 0.52 * scale;
  root.add(hipGroup);

  const torsoGroup = new THREE.Group();
  hipGroup.add(torsoGroup);

  // Lower Abdomen / Pelvis
  const pelvisGeo = new THREE.CylinderGeometry(0.26 * scale, 0.23 * scale, 0.20 * scale, 24);
  const pelvis = new THREE.Mesh(pelvisGeo, suitMat);
  pelvis.position.y = 0.10 * scale;
  torsoGroup.add(pelvis);

  // Upper Chest / Spacesuit Jacket
  const chestGeo = new THREE.CylinderGeometry(0.30 * scale, 0.26 * scale, 0.32 * scale, 24);
  const chest = new THREE.Mesh(chestGeo, suitMat);
  chest.position.y = 0.32 * scale;
  torsoGroup.add(chest);

  // Soft Rounded Chest Arch
  const chestBulgeGeo = new THREE.SphereGeometry(0.28 * scale, 24, 16);
  chestBulgeGeo.scale(1.05, 0.85, 0.75);
  const chestBulge = new THREE.Mesh(chestBulgeGeo, suitMat);
  chestBulge.position.set(0, 0.32 * scale, 0.08 * scale);
  torsoGroup.add(chestBulge);

  // Center Chest Telemetry Capsule Badge (matching reference image)
  const chestPlateGroup = new THREE.Group();
  chestPlateGroup.position.set(0, 0.33 * scale, 0.30 * scale);
  torsoGroup.add(chestPlateGroup);

  // Outer Silver Capsule
  const badgeBaseGeo = new THREE.CapsuleGeometry(0.040 * scale, 0.13 * scale, 8, 16);
  const badgeBase = new THREE.Mesh(badgeBaseGeo, titaniumMat);
  chestPlateGroup.add(badgeBase);

  // Inner Dark Recessed Groove
  const badgeInnerGeo = new THREE.CapsuleGeometry(0.016 * scale, 0.085 * scale, 8, 16);
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

  // Ergonomic Spacesuit Seamline Piping (Matching reference)
  const seamCurveL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.19 * scale, 0.44 * scale, 0.16 * scale),
    new THREE.Vector3(-0.11 * scale, 0.28 * scale, 0.27 * scale),
    new THREE.Vector3(-0.06 * scale, 0.12 * scale, 0.26 * scale)
  ]);
  const seamGeoL = new THREE.TubeGeometry(seamCurveL, 16, 0.009 * scale, 6, false);
  const seamL = new THREE.Mesh(seamGeoL, suitTrimMat);
  torsoGroup.add(seamL);

  const seamCurveR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.19 * scale, 0.44 * scale, 0.16 * scale),
    new THREE.Vector3(0.11 * scale, 0.28 * scale, 0.27 * scale),
    new THREE.Vector3(0.06 * scale, 0.12 * scale, 0.26 * scale)
  ]);
  const seamGeoR = new THREE.TubeGeometry(seamCurveR, 16, 0.009 * scale, 6, false);
  const seamR = new THREE.Mesh(seamGeoR, suitTrimMat);
  torsoGroup.add(seamR);

  // White Telemetry Dot on Right Thigh / Hip (matching reference image)
  const thighDotGeo = new THREE.CylinderGeometry(0.019 * scale, 0.019 * scale, 0.01 * scale, 12);
  const thighDot = new THREE.Mesh(thighDotGeo, telemetryDotMat);
  thighDot.rotation.x = Math.PI / 2;
  thighDot.position.set(-0.15 * scale, 0.02 * scale, 0.23 * scale);
  torsoGroup.add(thighDot);

  // Life-Support Backpack (PLSS)
  const backpackGeo = new THREE.BoxGeometry(0.34 * scale, 0.40 * scale, 0.16 * scale);
  const backpack = new THREE.Mesh(backpackGeo, suitTrimMat);
  backpack.position.set(0, 0.32 * scale, -0.20 * scale);
  torsoGroup.add(backpack);

  // Backpack telemetry antenna
  const antennaGeo = new THREE.CylinderGeometry(0.009 * scale, 0.009 * scale, 0.30 * scale, 8);
  const antenna = new THREE.Mesh(antennaGeo, titaniumMat);
  antenna.position.set(0.12 * scale, 0.55 * scale, -0.20 * scale);
  torsoGroup.add(antenna);

  // Dual Thruster Mini-Nozzles on Backpack
  const nozzleGeo = new THREE.CylinderGeometry(0.032 * scale, 0.052 * scale, 0.07 * scale, 12);
  for (let bx of [-0.10, 0.10]) {
    const noz = new THREE.Mesh(nozzleGeo, titaniumMat);
    noz.position.set(bx * scale, 0.15 * scale, -0.27 * scale);
    noz.rotation.x = 0.25;
    torsoGroup.add(noz);
  }

  // =========================================================================
  // 2. TITANIUM COLLAR & PURPLE GEMSTONE CABOCHONS
  // Sits squarely on the shoulders
  // =========================================================================
  const collarGroup = new THREE.Group();
  collarGroup.position.y = 0.50 * scale;
  hipGroup.add(collarGroup);

  const collarGeo = new THREE.TorusGeometry(0.31 * scale, 0.075 * scale, 20, 36);
  const collar = new THREE.Mesh(collarGeo, titaniumMat);
  collar.rotation.x = Math.PI / 2;
  collarGroup.add(collar);

  // 12 Rivet Beads embedded around collar (with 4 glowing purple gems)
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    const isPurpleGem = (i === 1 || i === 5 || i === 7 || i === 11);
    const beadMat = isPurpleGem ? purpleRivetMat : titaniumMat;
    const beadSize = isPurpleGem ? 0.034 * scale : 0.020 * scale;

    const beadGeo = new THREE.SphereGeometry(beadSize, 10, 10);
    const bead = new THREE.Mesh(beadGeo, beadMat);
    bead.position.set(
      Math.cos(angle) * 0.31 * scale,
      0.025 * scale,
      Math.sin(angle) * 0.31 * scale
    );
    collarGroup.add(bead);
  }

  // =========================================================================
  // 3. HEAD & HELMET (Neck Pivot)
  // =========================================================================
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.58 * scale;
  hipGroup.add(headGroup);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.14 * scale, 0.16 * scale, 0.12 * scale, 16);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = 0.04 * scale;
  headGroup.add(neck);

  // Giant Crystal Bubble Helmet (Spacious Glass Sphere matching reference)
  // Radius 0.55m centered so base rests right on top of collar
  const helmetCenterY = 0.34 * scale;
  const helmetRadius = 0.54 * scale;

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
    Math.PI * 0.46 // Covers the top dome of the helmet
  );
  const cosmicDome = new THREE.Mesh(cosmicDomeGeo, cosmicNebulaMat);
  cosmicDome.position.set(0, helmetCenterY, 0);
  headGroup.add(cosmicDome);

  // Internal Soft Cyan Point Light (illuminates head from within the bubble)
  const interiorLight = new THREE.PointLight(0x38bdf8, 1.3, 2.5 * scale);
  interiorLight.position.set(0, helmetCenterY + 0.12 * scale, 0.38 * scale);
  headGroup.add(interiorLight);

  // Sculpted Alien Cranium (Continuous organic alien head: wide forehead, tapered chin)
  const skullGeo = createAlienCraniumGeometry(scale);
  const skull = new THREE.Mesh(skullGeo, skinMat);
  skull.position.set(0, helmetCenterY + 0.03 * scale, 0);
  headGroup.add(skull);

  // Cute Tiny Button Nose
  const noseGeo = new THREE.SphereGeometry(0.018 * scale, 12, 12);
  noseGeo.scale(1.0, 0.7, 1.2);
  const nose = new THREE.Mesh(noseGeo, skinMat);
  nose.position.set(0, helmetCenterY - 0.045 * scale, 0.28 * scale);
  headGroup.add(nose);

  // Nostril dimples
  const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x0891b2 });
  for (let nx of [-0.012, 0.012]) {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.0035 * scale, 6, 6), nostrilMat);
    nostril.position.set(nx * scale, helmetCenterY - 0.052 * scale, 0.286 * scale);
    headGroup.add(nostril);
  }

  // Gentle Cute Mouth Line (Subtle closed smile)
  const mouthCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.035 * scale, helmetCenterY - 0.110 * scale, 0.250 * scale),
    new THREE.Vector3(0, helmetCenterY - 0.116 * scale, 0.262 * scale),
    new THREE.Vector3(0.035 * scale, helmetCenterY - 0.110 * scale, 0.250 * scale)
  ]);
  const mouthGeo = new THREE.TubeGeometry(mouthCurve, 12, 0.0045 * scale, 6, false);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x083344 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  headGroup.add(mouth);

  // =========================================================================
  // 4. HUGE GLOSSY ALMOND OBSIDIAN EYES & SPECULAR CRESCENT HIGHLIGHTS
  // Matching the prominent, expressive alien eyes from the reference image.
  // =========================================================================
  const eyeWidth = 0.22 * scale;
  const eyeHeight = 0.17 * scale;
  const eyeDepth = 0.10 * scale;

  const eyeGeo = createAlmondEyeGeometry(eyeWidth, eyeHeight, eyeDepth);

  // Left Eye (Viewer Left)
  const eyeLGroup = new THREE.Group();
  eyeLGroup.position.set(-0.145 * scale, helmetCenterY + 0.040 * scale, 0.220 * scale);
  eyeLGroup.rotation.set(0.12, -0.22, 0.46); // slanted outwards and curved around skull
  headGroup.add(eyeLGroup);

  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeLGroup.add(eyeL);

  // Curved 3D Specular Highlight Arc proud of eye surface
  const crescentCurveL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.08 * scale, 0.040 * scale, eyeDepth * 0.95),
    new THREE.Vector3(-0.02 * scale, 0.075 * scale, eyeDepth * 1.02),
    new THREE.Vector3(0.06 * scale, 0.050 * scale, eyeDepth * 0.95)
  ]);
  const crescentGeoL = new THREE.TubeGeometry(crescentCurveL, 16, 0.016 * scale, 8, false);
  const crescentL = new THREE.Mesh(crescentGeoL, eyeSpecularMat);
  crescentL.renderOrder = 2;
  eyeLGroup.add(crescentL);

  // Right Eye (Viewer Right)
  const eyeRGroup = new THREE.Group();
  eyeRGroup.position.set(0.145 * scale, helmetCenterY + 0.040 * scale, 0.220 * scale);
  eyeRGroup.rotation.set(0.12, 0.22, -0.46); // slanted outwards and curved around skull
  headGroup.add(eyeRGroup);

  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeRGroup.add(eyeR);

  const crescentCurveR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.06 * scale, 0.050 * scale, eyeDepth * 0.95),
    new THREE.Vector3(0.02 * scale, 0.075 * scale, eyeDepth * 1.02),
    new THREE.Vector3(0.08 * scale, 0.040 * scale, eyeDepth * 0.95)
  ]);
  const crescentGeoR = new THREE.TubeGeometry(crescentCurveR, 16, 0.016 * scale, 8, false);
  const crescentR = new THREE.Mesh(crescentGeoR, eyeSpecularMat);
  crescentR.renderOrder = 2;
  eyeRGroup.add(crescentR);

  // =========================================================================
  // 5. ARMS & 4-FINGERED CYAN HANDS
  // =========================================================================
  function createAlienArm(isLeft) {
    const armPivot = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    armPivot.position.set(sign * 0.32 * scale, 0.44 * scale, 0);

    // Shoulder Pad Guard (Rounded ball joint)
    const shoulderGeo = new THREE.SphereGeometry(0.10 * scale, 16, 16);
    const shoulder = new THREE.Mesh(shoulderGeo, suitMat);
    armPivot.add(shoulder);

    // Shoulder Trim Ring
    const shoulderRingGeo = new THREE.TorusGeometry(0.09 * scale, 0.018 * scale, 12, 20);
    const shoulderRing = new THREE.Mesh(shoulderRingGeo, suitTrimMat);
    shoulderRing.rotation.x = Math.PI / 2;
    shoulderRing.position.y = -0.05 * scale;
    armPivot.add(shoulderRing);

    // Upper Arm
    const upperArmGeo = new THREE.CapsuleGeometry(0.075 * scale, 0.16 * scale, 8, 16);
    const upperArm = new THREE.Mesh(upperArmGeo, suitMat);
    upperArm.position.y = -0.13 * scale;
    armPivot.add(upperArm);

    // Elbow Ribbed Ring
    const elbowGeo = new THREE.TorusGeometry(0.078 * scale, 0.016 * scale, 12, 20);
    const elbow = new THREE.Mesh(elbowGeo, suitTrimMat);
    elbow.rotation.x = Math.PI / 2;
    elbow.position.y = -0.23 * scale;
    armPivot.add(elbow);

    // Forearm
    const forearmGeo = new THREE.CapsuleGeometry(0.072 * scale, 0.15 * scale, 8, 16);
    const forearm = new THREE.Mesh(forearmGeo, suitMat);
    forearm.position.y = -0.32 * scale;
    armPivot.add(forearm);

    // Wrist Ring / Glove Cuff
    const cuffGeo = new THREE.TorusGeometry(0.074 * scale, 0.018 * scale, 12, 20);
    const cuff = new THREE.Mesh(cuffGeo, suitTrimMat);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = -0.42 * scale;
    armPivot.add(cuff);

    // Cyan Alien Palm (Soft rounded hand)
    const palmGeo = new THREE.SphereGeometry(0.065 * scale, 14, 14);
    palmGeo.scale(1.0, 1.25, 0.65);
    const palm = new THREE.Mesh(palmGeo, skinMat);
    palm.position.y = -0.48 * scale;
    armPivot.add(palm);

    // 4 Cyan Alien Fingers (Thumb + 3 fingers, matching reference image)
    const fingerGeo = new THREE.CapsuleGeometry(0.016 * scale, 0.048 * scale, 6, 10);

    // Thumb (Opposable, angled inwards)
    const thumb = new THREE.Mesh(fingerGeo, skinMat);
    thumb.position.set(-sign * 0.042 * scale, -0.48 * scale, 0.025 * scale);
    thumb.rotation.z = sign * 0.65;
    thumb.rotation.x = 0.35;
    armPivot.add(thumb);

    // Index, Middle, Ring fingers
    const fingerAngles = [-0.15, 0.0, 0.15];
    const fingerOffsets = [-0.030, 0.0, 0.030];
    for (let f = 0; f < 3; f++) {
      const finger = new THREE.Mesh(fingerGeo, skinMat);
      finger.position.set(
        fingerOffsets[f] * scale,
        -0.54 * scale,
        0
      );
      finger.rotation.z = fingerAngles[f];
      armPivot.add(finger);
    }

    return { armPivot, palm };
  }

  const armL = createAlienArm(true);
  const armR = createAlienArm(false);
  hipGroup.add(armL.armPivot);
  hipGroup.add(armR.armPivot);

  // Default arm idle posture: arms resting gently at sides, hands angled inward
  armL.armPivot.rotation.z = -0.20;
  armR.armPivot.rotation.z = 0.20;

  // =========================================================================
  // 6. LEGS, KNEE PADS & ROUNDED BOOTS (Chunky Chibi Explorer Stance)
  // Calibrated so bottom of sole is exactly at Y = 0.0
  // =========================================================================
  function createAlienLeg(isLeft) {
    const legPivot = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    // Naturally spaced stance (hip-width apart)
    legPivot.position.set(sign * 0.14 * scale, 0.04 * scale, 0);

    // Thigh with slight outward flare
    const thighGeo = new THREE.CapsuleGeometry(0.095 * scale, 0.18 * scale, 8, 16);
    const thigh = new THREE.Mesh(thighGeo, suitMat);
    thigh.position.y = -0.12 * scale;
    legPivot.add(thigh);

    // Knee Pad Guard (matching reference image)
    const kneeGeo = new THREE.BoxGeometry(0.12 * scale, 0.09 * scale, 0.07 * scale);
    const knee = new THREE.Mesh(kneeGeo, suitTrimMat);
    knee.position.set(0, -0.20 * scale, 0.08 * scale);
    legPivot.add(knee);

    // Knee Pad Rivet
    const kneeRivetGeo = new THREE.SphereGeometry(0.012 * scale, 6, 6);
    const kneeRivet = new THREE.Mesh(kneeRivetGeo, titaniumMat);
    kneeRivet.position.set(0, -0.20 * scale, 0.12 * scale);
    legPivot.add(kneeRivet);

    // Shin / Lower Leg
    const shinGeo = new THREE.CapsuleGeometry(0.085 * scale, 0.18 * scale, 8, 16);
    const shin = new THREE.Mesh(shinGeo, suitMat);
    shin.position.y = -0.30 * scale;
    legPivot.add(shin);

    // Rounded Space Boot (Sole rests at bottom)
    const bootGroup = new THREE.Group();
    bootGroup.position.set(0, -0.44 * scale, 0.03 * scale);
    legPivot.add(bootGroup);

    // Boot Body
    const bootGeo = new THREE.BoxGeometry(0.16 * scale, 0.10 * scale, 0.24 * scale);
    const boot = new THREE.Mesh(bootGeo, suitMat);
    bootGroup.add(boot);

    // Curved Boot Toe Cap (smooth rounded space boot)
    const toeGeo = new THREE.SphereGeometry(0.080 * scale, 14, 14);
    toeGeo.scale(1.0, 0.58, 1.15);
    const toe = new THREE.Mesh(toeGeo, suitTrimMat);
    toe.position.set(0, -0.01 * scale, 0.090 * scale);
    bootGroup.add(toe);

    // Ribbed Lunar Sole
    const soleGeo = new THREE.BoxGeometry(0.17 * scale, 0.026 * scale, 0.26 * scale);
    const sole = new THREE.Mesh(soleGeo, suitTrimMat);
    sole.position.y = -0.06 * scale;
    bootGroup.add(sole);

    // Angle boot slightly outward for confident explorer stance
    bootGroup.rotation.y = sign * 0.12;

    return { legPivot, bootGroup };
  }

  const legL = createAlienLeg(true);
  const legR = createAlienLeg(false);
  hipGroup.add(legL.legPivot);
  hipGroup.add(legR.legPivot);

  // =========================================================================
  // 7. CARRIED SCIENTIFIC COMPONENT SLOT (Right Hand / Torso Holster)
  // When Leo collects a component, it visibly snaps to his carrying harness!
  // =========================================================================
  const carriedItemSlot = new THREE.Group();
  carriedItemSlot.name = 'CarriedItemSlot';
  carriedItemSlot.position.set(0.18 * scale, 0.35 * scale, 0.24 * scale);
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
        hipGroup.position.y = (0.52 + Math.abs(Math.sin(timeSeconds * freq)) * 0.08) * scale;
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
        hipGroup.position.y = (0.52 + Math.abs(Math.sin(timeSeconds * freq)) * 0.04) * scale;
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
        hipGroup.rotation.x = 0.45;
        hipGroup.position.y = 0.40 * scale;
        legL.legPivot.rotation.x = -0.3;
        legR.legPivot.rotation.x = 0.2;
        armR.armPivot.rotation.x = -1.1;
        armR.armPivot.rotation.z = 0.2;
        armL.armPivot.rotation.x = 0.2;
        headGroup.rotation.x = 0.4;
      } else if (anim.state === 'repair') {
        hipGroup.rotation.x = 0.16;
        hipGroup.position.y = 0.48 * scale;
        legL.legPivot.rotation.x = 0.2;
        legR.legPivot.rotation.x = -0.2;

        armR.armPivot.rotation.x = -1.25 + Math.sin(timeSeconds * 12) * 0.16;
        armR.armPivot.rotation.z = 0.35 + Math.cos(timeSeconds * 10) * 0.12;
        armL.armPivot.rotation.x = -0.85;
        armL.armPivot.rotation.z = -0.32;
        headGroup.rotation.x = 0.28;
      } else if (anim.state === 'celebrate' || anim.state === 'victory') {
        hipGroup.position.y = (0.52 + Math.abs(Math.sin(timeSeconds * 5)) * 0.12) * scale;
        hipGroup.rotation.x = 0;
        armL.armPivot.rotation.x = 0;
        armR.armPivot.rotation.x = 0;
        armL.armPivot.rotation.z = -2.45 + Math.sin(timeSeconds * 6) * 0.35;
        armR.armPivot.rotation.z = 2.45 - Math.sin(timeSeconds * 6) * 0.35;
        headGroup.rotation.x = -0.25;
        headGroup.rotation.y = Math.sin(timeSeconds * 3) * 0.2;
      } else if (anim.state === 'float') {
        const floatY = Math.sin(timeSeconds * 1.8) * 0.12 * scale;
        hipGroup.position.y = 0.65 * scale + floatY;
        hipGroup.rotation.z = Math.sin(timeSeconds * 1.2) * 0.08;
        hipGroup.rotation.x = Math.cos(timeSeconds * 1.4) * 0.06;
        armL.armPivot.rotation.z = -0.38 + Math.sin(timeSeconds * 1.5) * 0.1;
        armR.armPivot.rotation.z = 0.38 - Math.sin(timeSeconds * 1.5) * 0.1;
        legL.legPivot.rotation.x = 0.2 + Math.sin(timeSeconds * 1.2) * 0.1;
        legR.legPivot.rotation.x = 0.1 - Math.cos(timeSeconds * 1.2) * 0.1;
      } else {
        // Idle breathing and gentle floating bob
        const breath = Math.sin(timeSeconds * 2.2) * 0.018 * scale;
        hipGroup.position.y = 0.52 * scale + breath;
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
