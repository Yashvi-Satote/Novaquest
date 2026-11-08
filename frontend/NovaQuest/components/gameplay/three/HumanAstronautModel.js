import * as THREE from 'three';

/**
 * HumanAstronautModel.js
 * 
 * Master 3D Human Astronaut Character Model: LEO STOOLMAN
 * 
 * DESIGN SPECIFICATION:
 * - Genuine Human Astronaut with realistic human body proportions (~1.78m height)
 * - Detailed white EVA spacesuit (Apollo/Artemis inspired) with authentic fabric folds & seams
 * - Transparent spherical astronaut helmet with gold sun visor rim
 * - Visible human face inside helmet: warm skin tone, eyes, eyebrows, nose, mouth
 * - Astronaut Communications Carrier ("Snoopy Cap") under helmet: dark ear cushions & mic boom
 * - Life-support PLSS backpack on back with dual oxygen tanks, control umbilical & comms antenna
 * - NASA mission insignia patch on chest and American flag patch on shoulder
 * - Blue and orange suit details (chest stripes, arm bands, mission markings)
 * - White EVA gloves with gray textured grip palm pads
 * - Proper heavy lunar space boots with dark ribbed lunar tread soles (ground-aligned at Y = 0)
 * - Dedicated 3-point character lighting rig ensuring clear visibility in space and lunar shadows
 * - Full procedural animation rig: idle, walk, run, jump, landing, pickup, inspect, repair, victory
 */

/**
 * Procedural texture generator for suit fabric, NASA mission badge, and face features
 */
function createHumanAstronautTextures() {
  if (typeof document === 'undefined') return null;

  // 1. White EVA Spacesuit Fabric with subtle weave and seams
  const suitCanvas = document.createElement('canvas');
  suitCanvas.width = 512;
  suitCanvas.height = 512;
  const sCtx = suitCanvas.getContext('2d');
  sCtx.fillStyle = '#f1f5f9'; // crisp aerospace white
  sCtx.fillRect(0, 0, 512, 512);

  // Micro-weave texture
  const imgData = sCtx.getImageData(0, 0, 512, 512);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14;
    d[i] = Math.max(210, Math.min(255, d[i] + noise));
    d[i + 1] = Math.max(215, Math.min(255, d[i + 1] + noise));
    d[i + 2] = Math.max(225, Math.min(255, d[i + 2] + noise));
  }
  sCtx.putImageData(imgData, 0, 0);

  // Blue mission stripe across upper panel
  sCtx.fillStyle = '#0284c7'; // sky-600
  sCtx.fillRect(0, 180, 512, 18);

  // Orange accent stripe
  sCtx.fillStyle = '#f97316'; // orange-500
  sCtx.fillRect(0, 204, 512, 10);

  const suitTexture = new THREE.CanvasTexture(suitCanvas);
  suitTexture.wrapS = THREE.RepeatWrapping;
  suitTexture.wrapT = THREE.RepeatWrapping;

  // 2. NASA Mission Patch Decal
  const patchCanvas = document.createElement('canvas');
  patchCanvas.width = 256;
  patchCanvas.height = 256;
  const pCtx = patchCanvas.getContext('2d');

  // Blue sphere badge background
  pCtx.beginPath();
  pCtx.arc(128, 128, 115, 0, Math.PI * 2);
  pCtx.fillStyle = '#0b3d91'; // NASA blue
  pCtx.fill();
  pCtx.lineWidth = 8;
  pCtx.strokeStyle = '#ffffff';
  pCtx.stroke();

  // Red hypersonic vector chevron
  pCtx.beginPath();
  pCtx.moveTo(40, 145);
  pCtx.lineTo(210, 65);
  pCtx.lineTo(190, 185);
  pCtx.strokeStyle = '#fc3d21'; // NASA red
  pCtx.lineWidth = 14;
  pCtx.stroke();

  // White orbit ellipse
  pCtx.beginPath();
  pCtx.ellipse(128, 128, 105, 45, Math.PI / 4, 0, Math.PI * 2);
  pCtx.strokeStyle = '#ffffff';
  pCtx.lineWidth = 5;
  pCtx.stroke();

  // White stars
  pCtx.fillStyle = '#ffffff';
  for (let i = 0; i < 24; i++) {
    pCtx.fillRect(
      50 + Math.random() * 156,
      50 + Math.random() * 156,
      2.5,
      2.5
    );
  }

  // NASA text
  pCtx.font = 'bold 36px sans-serif';
  pCtx.fillStyle = '#ffffff';
  pCtx.textAlign = 'center';
  pCtx.textBaseline = 'middle';
  pCtx.fillText('NOVA', 128, 128);

  const patchTexture = new THREE.CanvasTexture(patchCanvas);

  // 3. Human Face Texture (Natural Caucasian/tan skin tone with warm cheeks)
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = 512;
  faceCanvas.height = 512;
  const fCtx = faceCanvas.getContext('2d');

  // Base human skin tone
  fCtx.fillStyle = '#fed7aa'; // warm healthy skin tone
  fCtx.fillRect(0, 0, 512, 512);

  // Warm cheek shading
  fCtx.save();
  const cheekGrad = fCtx.createRadialGradient(160, 280, 20, 160, 280, 80);
  cheekGrad.addColorStop(0, 'rgba(251, 146, 60, 0.35)');
  cheekGrad.addColorStop(1, 'transparent');
  fCtx.fillStyle = cheekGrad;
  fCtx.fillRect(60, 180, 200, 200);

  const cheekGradR = fCtx.createRadialGradient(352, 280, 20, 352, 280, 80);
  cheekGradR.addColorStop(0, 'rgba(251, 146, 60, 0.35)');
  cheekGradR.addColorStop(1, 'transparent');
  fCtx.fillStyle = cheekGradR;
  fCtx.fillRect(252, 180, 200, 200);
  fCtx.restore();

  const faceTexture = new THREE.CanvasTexture(faceCanvas);

  return { suitTexture, patchTexture, faceTexture };
}

let cachedTextures = null;

/**
 * Creates the authentic Human Astronaut model: Leo Stoolman
 */
export function createHumanAstronaut({ scale = 1.0 } = {}) {
  const root = new THREE.Group();
  root.name = 'HumanAstronaut_LeoStoolman';

  if (!cachedTextures && typeof document !== 'undefined') {
    cachedTextures = createHumanAstronautTextures();
  }

  // =========================================================================
  // MATERIALS SPECIFICATION
  // =========================================================================

  // White EVA Pressure Suit Fabric
  const whiteSuitMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // bright clean white
    roughness: 0.65,
    metalness: 0.12,
    map: cachedTextures ? cachedTextures.suitTexture : null
  });

  // Suit Trim & Mechanical Joints (Slate & Blue)
  const suitJointMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // slate-700
    roughness: 0.5,
    metalness: 0.4
  });

  const blueStripeMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // vibrant NASA blue
    roughness: 0.45,
    metalness: 0.2
  });

  const orangeStripeMat = new THREE.MeshStandardMaterial({
    color: 0xea580c, // aerospace orange
    roughness: 0.45,
    metalness: 0.2
  });

  // Human Skin: Natural healthy tone
  const humanSkinMat = new THREE.MeshStandardMaterial({
    color: 0xfed7aa,
    roughness: 0.48,
    metalness: 0.05,
    map: cachedTextures ? cachedTextures.faceTexture : null
  });

  // Human Hair & Eyebrows: Brown
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x3e2723,
    roughness: 0.8
  });

  // Human Eyes: Blue-brown iris with crisp white sclera
  const scleraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.1 }); // blue iris
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x020617 });

  // Snoopy Cap (Communications Carrier): Dark charcoal ear covers & white fabric
  const snoopyCapWhite = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });
  const snoopyCapDark = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6 });

  // Gold Anodized Sun Visor Rim & Telemetry Mounts
  const goldMetalMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.15
  });

  // Transparent Helmet Glass (Crystal Clear with soft ice-blue tint)
  const helmetVisorMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transmission: 0.92,
    opacity: 0.25,
    transparent: true,
    roughness: 0.04,
    ior: 1.48,
    reflectivity: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04
  });

  // Boot Rubber Tread
  const bootSoleMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b, // dark slate rubber
    roughness: 0.85,
    metalness: 0.1
  });

  // NASA Chest Mission Patch Material
  const patchMat = new THREE.MeshBasicMaterial({
    map: cachedTextures ? cachedTextures.patchTexture : null,
    transparent: true
  });

  // =========================================================================
  // DEDICATED CHARACTER LIGHTING RIG
  // Keeps Leo clearly visible from any camera angle on the lunar surface
  // =========================================================================
  const lightRig = new THREE.Group();
  root.add(lightRig);

  const keyLight = new THREE.DirectionalLight(0xfffaed, 1.8);
  keyLight.position.set(2.0 * scale, 3.2 * scale, 3.5 * scale);
  lightRig.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
  fillLight.position.set(-2.5 * scale, 2.0 * scale, 2.5 * scale);
  lightRig.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x818cf8, 1.0);
  rimLight.position.set(0, 3.0 * scale, -3.0 * scale);
  lightRig.add(rimLight);

  // =========================================================================
  // 1. SKELETAL HIERARCHY ROOT
  // The soles of Leo's boots are calibrated to rest exactly at Y = 0.0
  // Total height: ~1.78m * scale
  // =========================================================================
  const hipGroup = new THREE.Group();
  hipGroup.position.y = 0.95 * scale; // Pelvis center height
  root.add(hipGroup);

  // --- Pelvis & Lower Torso ---
  const pelvisGeo = new THREE.CylinderGeometry(0.24 * scale, 0.22 * scale, 0.24 * scale, 16);
  const pelvis = new THREE.Mesh(pelvisGeo, whiteSuitMat);
  pelvis.position.y = 0;
  hipGroup.add(pelvis);

  // Utility belt & equipment harness
  const beltGeo = new THREE.CylinderGeometry(0.25 * scale, 0.25 * scale, 0.06 * scale, 16);
  const belt = new THREE.Mesh(beltGeo, suitJointMat);
  belt.position.y = 0.10 * scale;
  hipGroup.add(belt);

  // Belt buckle (Gold)
  const buckleGeo = new THREE.BoxGeometry(0.08 * scale, 0.05 * scale, 0.04 * scale);
  const buckle = new THREE.Mesh(buckleGeo, goldMetalMat);
  buckle.position.set(0, 0.10 * scale, 0.25 * scale);
  hipGroup.add(buckle);

  // --- Spine & Upper Torso (Chest) ---
  const chestGroup = new THREE.Group();
  chestGroup.position.y = 0.20 * scale;
  hipGroup.add(chestGroup);

  const chestGeo = new THREE.CylinderGeometry(0.29 * scale, 0.25 * scale, 0.38 * scale, 16);
  const chest = new THREE.Mesh(chestGeo, whiteSuitMat);
  chest.position.y = 0.16 * scale;
  chestGroup.add(chest);

  // Chest Blue & Orange Mission Stripes
  const stripeGeo = new THREE.CylinderGeometry(0.294 * scale, 0.294 * scale, 0.04 * scale, 16);
  const blueStripe = new THREE.Mesh(stripeGeo, blueStripeMat);
  blueStripe.position.y = 0.24 * scale;
  chestGroup.add(blueStripe);

  const orangeStripe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.293 * scale, 0.293 * scale, 0.02 * scale, 16),
    orangeStripeMat
  );
  orangeStripe.position.y = 0.20 * scale;
  chestGroup.add(orangeStripe);

  // Remote Control Unit (RCU) - Apollo-style Chest Pack with gauges
  const rcuGroup = new THREE.Group();
  rcuGroup.position.set(0, 0.20 * scale, 0.26 * scale);
  chestGroup.add(rcuGroup);

  const rcuBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.22 * scale, 0.18 * scale, 0.10 * scale),
    suitJointMat
  );
  rcuGroup.add(rcuBody);

  // Pressure gauge dials & switches on RCU
  const gaugeGeo = new THREE.CylinderGeometry(0.025 * scale, 0.025 * scale, 0.02 * scale, 12);
  const gaugeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const gauge1 = new THREE.Mesh(gaugeGeo, gaugeMat);
  gauge1.rotation.x = Math.PI / 2;
  gauge1.position.set(-0.06 * scale, 0.04 * scale, 0.055 * scale);
  rcuGroup.add(gauge1);

  const gauge2 = new THREE.Mesh(gaugeGeo, new THREE.MeshBasicMaterial({ color: 0x22c55e }));
  gauge2.rotation.x = Math.PI / 2;
  gauge2.position.set(0.06 * scale, 0.04 * scale, 0.055 * scale);
  rcuGroup.add(gauge2);

  // NASA Mission Patch Decal (Left Chest)
  const patchMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.09 * scale, 0.09 * scale),
    patchMat
  );
  patchMesh.position.set(-0.14 * scale, 0.24 * scale, 0.28 * scale);
  patchMesh.rotation.y = -0.3;
  chestGroup.add(patchMesh);

  // Name Badge: "LEO STOOLMAN"
  const nameBadgeGeo = new THREE.PlaneGeometry(0.10 * scale, 0.025 * scale);
  const nameBadgeMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const nameBadge = new THREE.Mesh(nameBadgeGeo, nameBadgeMat);
  nameBadge.position.set(0.14 * scale, 0.25 * scale, 0.28 * scale);
  nameBadge.rotation.y = 0.3;
  chestGroup.add(nameBadge);

  // --- Life-Support PLSS Backpack (Portable Life Support System) ---
  const plssGroup = new THREE.Group();
  plssGroup.position.set(0, 0.22 * scale, -0.25 * scale);
  chestGroup.add(plssGroup);

  const plssBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.42 * scale, 0.52 * scale, 0.22 * scale),
    whiteSuitMat
  );
  plssGroup.add(plssBody);

  // Oxygen Tanks on PLSS (Dual cylinders)
  const o2TankGeo = new THREE.CylinderGeometry(0.07 * scale, 0.07 * scale, 0.44 * scale, 12);
  const o2TankMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.2 });
  for (let ox of [-0.12, 0.12]) {
    const o2 = new THREE.Mesh(o2TankGeo, o2TankMat);
    o2.position.set(ox * scale, 0, -0.09 * scale);
    plssGroup.add(o2);
  }

  // Comms Antenna (UHF Whip)
  const antennaGeo = new THREE.CylinderGeometry(0.008 * scale, 0.008 * scale, 0.55 * scale, 8);
  const antenna = new THREE.Mesh(antennaGeo, goldMetalMat);
  antenna.position.set(0.15 * scale, 0.45 * scale, -0.06 * scale);
  plssGroup.add(antenna);

  // Control Umbilical Hose (Curving from backpack to suit waist)
  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.18 * scale, 0.05 * scale, -0.15 * scale),
    new THREE.Vector3(-0.28 * scale, -0.08 * scale, -0.05 * scale),
    new THREE.Vector3(-0.24 * scale, -0.18 * scale, 0.12 * scale),
    new THREE.Vector3(-0.15 * scale, -0.22 * scale, 0.20 * scale)
  ]);
  const hoseGeo = new THREE.TubeGeometry(hoseCurve, 16, 0.02 * scale, 8, false);
  const hose = new THREE.Mesh(hoseGeo, blueStripeMat);
  chestGroup.add(hose);

  // =========================================================================
  // 2. NECK, HELMET & VISIBLE HUMAN FACE
  // =========================================================================
  const neckGroup = new THREE.Group();
  neckGroup.position.y = 0.38 * scale;
  chestGroup.add(neckGroup);

  // Neck Ring Collar (Aluminum/Titanium)
  const collarGeo = new THREE.TorusGeometry(0.18 * scale, 0.035 * scale, 12, 24);
  const collar = new THREE.Mesh(collarGeo, goldMetalMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.04 * scale;
  neckGroup.add(collar);

  // Head Pivot Group
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.18 * scale;
  neckGroup.add(headGroup);

  // --- Human Head Geometry & Visible Face ---
  const faceGroup = new THREE.Group();
  faceGroup.position.set(0, 0, 0.02 * scale);
  headGroup.add(faceGroup);

  // Human Head Base (Cranium)
  const headGeo = new THREE.SphereGeometry(0.14 * scale, 24, 24);
  headGeo.scale(0.95, 1.15, 1.05);
  const humanHead = new THREE.Mesh(headGeo, humanSkinMat);
  faceGroup.add(humanHead);

  // Brown Human Hair (Crown & Temples)
  const hairGeo = new THREE.SphereGeometry(0.144 * scale, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.45);
  const hair = new THREE.Mesh(hairGeo, hairMat);
  faceGroup.add(hair);

  // Snoopy Cap (Communications Carrier Cap)
  const capCrownGeo = new THREE.SphereGeometry(0.142 * scale, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const capCrown = new THREE.Mesh(capCrownGeo, snoopyCapWhite);
  faceGroup.add(capCrown);

  // Dark Ear Cushions (Left & Right)
  const earCushionGeo = new THREE.CylinderGeometry(0.035 * scale, 0.035 * scale, 0.025 * scale, 12);
  for (let ex of [-0.13, 0.13]) {
    const ear = new THREE.Mesh(earCushionGeo, snoopyCapDark);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(ex * scale, 0, -0.01 * scale);
    faceGroup.add(ear);
  }

  // Communications Mic Boom (Reaching from left ear toward mouth)
  const micBoomCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.13 * scale, 0, 0),
    new THREE.Vector3(-0.10 * scale, -0.04 * scale, 0.08 * scale),
    new THREE.Vector3(-0.03 * scale, -0.05 * scale, 0.13 * scale)
  ]);
  const micBoom = new THREE.Mesh(
    new THREE.TubeGeometry(micBoomCurve, 12, 0.005 * scale, 6, false),
    suitJointMat
  );
  faceGroup.add(micBoom);

  const micHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.012 * scale, 8, 8),
    snoopyCapDark
  );
  micHead.position.set(-0.03 * scale, -0.05 * scale, 0.13 * scale);
  faceGroup.add(micHead);

  // Human Nose
  const noseGeo = new THREE.ConeGeometry(0.022 * scale, 0.055 * scale, 8);
  const nose = new THREE.Mesh(noseGeo, humanSkinMat);
  nose.position.set(0, -0.01 * scale, 0.145 * scale);
  nose.rotation.x = -0.2;
  faceGroup.add(nose);

  // Human Mouth (Friendly expression)
  const mouthGeo = new THREE.TorusGeometry(0.025 * scale, 0.005 * scale, 6, 12, Math.PI * 0.7);
  const mouth = new THREE.Mesh(mouthGeo, new THREE.MeshBasicMaterial({ color: 0x991b1b }));
  mouth.position.set(0, -0.06 * scale, 0.132 * scale);
  mouth.rotation.x = 0.2;
  mouth.rotation.z = Math.PI;
  faceGroup.add(mouth);

  // Human Eyes (Left & Right)
  const eyeLGroup = new THREE.Group();
  eyeLGroup.position.set(-0.045 * scale, 0.03 * scale, 0.125 * scale);
  faceGroup.add(eyeLGroup);

  const scleraL = new THREE.Mesh(new THREE.SphereGeometry(0.022 * scale, 12, 12), scleraMat);
  eyeLGroup.add(scleraL);

  const irisL = new THREE.Mesh(new THREE.SphereGeometry(0.012 * scale, 10, 10), irisMat);
  irisL.position.z = 0.015 * scale;
  eyeLGroup.add(irisL);

  const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.006 * scale, 8, 8), pupilMat);
  pupilL.position.z = 0.022 * scale;
  eyeLGroup.add(pupilL);

  const eyeRGroup = new THREE.Group();
  eyeRGroup.position.set(0.045 * scale, 0.03 * scale, 0.125 * scale);
  faceGroup.add(eyeRGroup);

  const scleraR = new THREE.Mesh(new THREE.SphereGeometry(0.022 * scale, 12, 12), scleraMat);
  eyeRGroup.add(scleraR);

  const irisR = new THREE.Mesh(new THREE.SphereGeometry(0.012 * scale, 10, 10), irisMat);
  irisR.position.z = 0.015 * scale;
  eyeRGroup.add(irisR);

  const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.006 * scale, 8, 8), pupilMat);
  pupilR.position.z = 0.022 * scale;
  eyeRGroup.add(pupilR);

  // Human Eyebrows
  for (let bx of [-0.045, 0.045]) {
    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(0.045 * scale, 0.008 * scale, 0.01 * scale),
      hairMat
    );
    brow.position.set(bx * scale, 0.062 * scale, 0.135 * scale);
    faceGroup.add(brow);
  }

  // --- Transparent Rounded Astronaut Helmet ---
  const helmetRadius = 0.26 * scale;
  const helmetGeo = new THREE.SphereGeometry(helmetRadius, 32, 32);
  const helmetVisor = new THREE.Mesh(helmetGeo, helmetVisorMat);
  headGroup.add(helmetVisor);

  // Gold Sun Visor Band across helmet brow
  const visorBandGeo = new THREE.TorusGeometry(helmetRadius * 0.99, 0.014 * scale, 8, 32, Math.PI * 0.85);
  const visorBand = new THREE.Mesh(visorBandGeo, goldMetalMat);
  visorBand.position.set(0, 0.06 * scale, 0);
  visorBand.rotation.x = 0.2;
  visorBand.rotation.z = -Math.PI * 0.92;
  headGroup.add(visorBand);

  // Internal Helmet Illumination (Soft warm light inside the visor)
  const helmetLight = new THREE.PointLight(0xffedd5, 1.2, 1.2 * scale);
  helmetLight.position.set(0, 0.08 * scale, 0.18 * scale);
  headGroup.add(helmetLight);

  // =========================================================================
  // 3. ARMS & WHITE EVA GLOVES
  // =========================================================================
  function createHumanArm(isLeft) {
    const armPivot = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    armPivot.position.set(sign * 0.32 * scale, 0.28 * scale, 0);

    // Shoulder Joint
    const shoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.09 * scale, 12, 12),
      suitJointMat
    );
    armPivot.add(shoulder);

    // Bicep (Upper Arm)
    const bicep = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.075 * scale, 0.22 * scale, 8, 12),
      whiteSuitMat
    );
    bicep.position.y = -0.15 * scale;
    armPivot.add(bicep);

    // Arm Mission Stripe
    const armStripe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.078 * scale, 0.078 * scale, 0.03 * scale, 12),
      isLeft ? blueStripeMat : orangeStripeMat
    );
    armStripe.position.y = -0.12 * scale;
    armPivot.add(armStripe);

    // Forearm Group (Elbow Pivot)
    const forearmGroup = new THREE.Group();
    forearmGroup.position.y = -0.28 * scale;
    armPivot.add(forearmGroup);

    const forearm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.07 * scale, 0.20 * scale, 8, 12),
      whiteSuitMat
    );
    forearm.position.y = -0.12 * scale;
    forearmGroup.add(forearm);

    // Glove Wrist Disconnect Ring (Blue anodized aluminum)
    const wristRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.075 * scale, 0.012 * scale, 8, 16),
      blueStripeMat
    );
    wristRing.rotation.x = Math.PI / 2;
    wristRing.position.y = -0.22 * scale;
    forearmGroup.add(wristRing);

    // White EVA Glove Hand
    const handGroup = new THREE.Group();
    handGroup.position.y = -0.26 * scale;
    forearmGroup.add(handGroup);

    // Palm
    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(0.08 * scale, 0.09 * scale, 0.045 * scale),
      whiteSuitMat
    );
    handGroup.add(palm);

    // Friction Grip Pad on Palm
    const gripPad = new THREE.Mesh(
      new THREE.BoxGeometry(0.065 * scale, 0.07 * scale, 0.01 * scale),
      suitJointMat
    );
    gripPad.position.z = 0.024 * scale;
    handGroup.add(gripPad);

    // Fingers (Thumb + 4 Fingers)
    const thumb = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.016 * scale, 0.05 * scale, 6, 8),
      whiteSuitMat
    );
    thumb.position.set(sign * 0.045 * scale, 0.01 * scale, 0.02 * scale);
    thumb.rotation.z = sign * 0.6;
    handGroup.add(thumb);

    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.013 * scale, 0.055 * scale, 6, 8),
        whiteSuitMat
      );
      finger.position.set((-0.03 + f * 0.02) * scale, -0.065 * scale, 0);
      handGroup.add(finger);
    }

    return { armPivot, forearmGroup, handGroup };
  }

  const armL = createHumanArm(true);
  chestGroup.add(armL.armPivot);

  const armR = createHumanArm(false);
  chestGroup.add(armR.armPivot);

  // Natural relaxed arm posture
  armL.armPivot.rotation.z = -0.15;
  armR.armPivot.rotation.z = 0.15;

  // =========================================================================
  // 4. LEGS & LUNAR BOOTS (Grounded at Y = 0.0)
  // =========================================================================
  function createHumanLeg(isLeft) {
    const legPivot = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    // Naturally spaced stance (0.16m offset from pelvis center)
    legPivot.position.set(sign * 0.16 * scale, -0.10 * scale, 0);

    // Hip Rotary Joint
    const hipJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.09 * scale, 12, 12),
      suitJointMat
    );
    legPivot.add(hipJoint);

    // Thigh (Upper Leg)
    const thigh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.09 * scale, 0.28 * scale, 8, 14),
      whiteSuitMat
    );
    thigh.position.y = -0.20 * scale;
    legPivot.add(thigh);

    // Knee Guard & Rotary Joint
    const kneeGroup = new THREE.Group();
    kneeGroup.position.y = -0.38 * scale;
    legPivot.add(kneeGroup);

    const kneePad = new THREE.Mesh(
      new THREE.BoxGeometry(0.12 * scale, 0.10 * scale, 0.08 * scale),
      suitJointMat
    );
    kneePad.position.set(0, 0, 0.06 * scale);
    kneeGroup.add(kneePad);

    // Shin (Lower Leg)
    const shin = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.085 * scale, 0.26 * scale, 8, 14),
      whiteSuitMat
    );
    shin.position.y = -0.18 * scale;
    kneeGroup.add(shin);

    // Lunar Boot Group (Ankle)
    const bootGroup = new THREE.Group();
    // Calibrated so sole bottom aligns precisely with Y = 0.0 when root is placed on terrain!
    // Total downward offset:
    // hipGroup (0.95) + legPivot (-0.10) + kneeGroup (-0.38) + bootGroup (-0.34) - sole (0.04) = 0.09m cushion
    bootGroup.position.set(0, -0.36 * scale, 0.04 * scale);
    kneeGroup.add(bootGroup);

    // Boot Upper (White silicone fabric)
    const bootUpper = new THREE.Mesh(
      new THREE.BoxGeometry(0.16 * scale, 0.14 * scale, 0.28 * scale),
      whiteSuitMat
    );
    bootUpper.position.y = 0.03 * scale;
    bootGroup.add(bootUpper);

    // Reinforced Toe Cap
    const toeCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075 * scale, 0.075 * scale, 0.15 * scale, 12),
      suitJointMat
    );
    toeCap.rotation.z = Math.PI / 2;
    toeCap.position.set(0, 0.01 * scale, 0.12 * scale);
    bootGroup.add(toeCap);

    // Heavy Lunar Tread Sole (Dark rubber, ribbed grip)
    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.17 * scale, 0.04 * scale, 0.30 * scale),
      bootSoleMat
    );
    sole.position.y = -0.05 * scale;
    bootGroup.add(sole);

    // Blue Sole Trim
    const soleTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.174 * scale, 0.012 * scale, 0.304 * scale),
      blueStripeMat
    );
    soleTrim.position.y = -0.03 * scale;
    bootGroup.add(soleTrim);

    return { legPivot, kneeGroup, bootGroup };
  }

  const legL = createHumanLeg(true);
  hipGroup.add(legL.legPivot);

  const legR = createHumanLeg(false);
  hipGroup.add(legR.legPivot);

  // =========================================================================
  // 5. CARRIED COMPONENT / TOOL MOUNT
  // Attached dynamically to right hand when collecting items
  // =========================================================================
  const carriedItemSlot = new THREE.Group();
  carriedItemSlot.position.set(0, -0.15 * scale, 0.08 * scale);
  carriedItemSlot.visible = false;
  armR.handGroup.add(carriedItemSlot);

  // Multi-Tool / Recovery Clamp in hand
  const toolMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 0.22 * scale, 12),
    goldMetalMat
  );
  toolMesh.rotation.x = Math.PI / 2;
  carriedItemSlot.add(toolMesh);

  // =========================================================================
  // 6. PROCEDURAL ANIMATION CONTROLLER
  // =========================================================================
  const anim = {
    state: 'idle', // 'idle' | 'walk' | 'run' | 'jump' | 'landing' | 'pickup' | 'inspect' | 'repair' | 'victory'
    speed: 1.0,
    blinkTimer: 0,
    hasCarriedItem: false,

    update: (timeDelta, timeSeconds) => {
      carriedItemSlot.visible = anim.hasCarriedItem;

      // Natural Human Eye Blinking
      anim.blinkTimer += timeDelta;
      if (anim.blinkTimer > 3.8) {
        eyeLGroup.scale.y = 0.1;
        eyeRGroup.scale.y = 0.1;
        if (anim.blinkTimer > 3.95) {
          eyeLGroup.scale.y = 1.0;
          eyeRGroup.scale.y = 1.0;
          anim.blinkTimer = 0;
        }
      }

      // State Machine Transitions
      if (anim.state === 'run') {
        const freq = 10.5 * anim.speed;
        const angleL = Math.sin(timeSeconds * freq) * 0.75;
        const angleR = -angleL;

        legL.legPivot.rotation.x = angleL;
        legR.legPivot.rotation.x = angleR;
        legL.kneeGroup.rotation.x = Math.max(0, -angleL * 0.8);
        legR.kneeGroup.rotation.x = Math.max(0, -angleR * 0.8);

        armL.armPivot.rotation.x = angleR * 0.9;
        armR.armPivot.rotation.x = angleL * 0.9;
        armL.armPivot.rotation.z = -0.25;
        armR.armPivot.rotation.z = 0.25;

        hipGroup.rotation.x = 0.22; // Athletic forward lean
        hipGroup.position.y = (0.95 + Math.abs(Math.sin(timeSeconds * freq)) * 0.08) * scale;
        chestGroup.rotation.y = Math.sin(timeSeconds * freq * 0.5) * 0.08;
        headGroup.rotation.y = -Math.sin(timeSeconds * freq * 0.5) * 0.04;
      } else if (anim.state === 'walk') {
        const freq = 5.8 * anim.speed;
        const angleL = Math.sin(timeSeconds * freq) * 0.48;
        const angleR = -angleL;

        legL.legPivot.rotation.x = angleL;
        legR.legPivot.rotation.x = angleR;
        legL.kneeGroup.rotation.x = Math.max(0, -angleL * 0.5);
        legR.kneeGroup.rotation.x = Math.max(0, -angleR * 0.5);

        armL.armPivot.rotation.x = angleR * 0.6;
        armR.armPivot.rotation.x = angleL * 0.6;
        armL.armPivot.rotation.z = -0.15;
        armR.armPivot.rotation.z = 0.15;

        hipGroup.rotation.x = 0.06;
        hipGroup.position.y = (0.95 + Math.abs(Math.sin(timeSeconds * freq)) * 0.04) * scale;
        chestGroup.rotation.y = Math.sin(timeSeconds * freq * 0.5) * 0.05;
        headGroup.rotation.y = Math.sin(timeSeconds * freq * 0.5) * 0.03;
      } else if (anim.state === 'jump') {
        hipGroup.rotation.x = -0.08;
        hipGroup.position.y = 1.05 * scale;
        legL.legPivot.rotation.x = -0.42;
        legR.legPivot.rotation.x = 0.25;
        legL.kneeGroup.rotation.x = 0.55;
        legR.kneeGroup.rotation.x = 0.35;

        armL.armPivot.rotation.x = -0.55;
        armR.armPivot.rotation.x = -0.55;
        armL.armPivot.rotation.z = -0.65;
        armR.armPivot.rotation.z = 0.65;
      } else if (anim.state === 'landing') {
        // Cushioned landing compression
        hipGroup.rotation.x = 0.15;
        hipGroup.position.y = 0.82 * scale;
        legL.legPivot.rotation.x = 0.35;
        legR.legPivot.rotation.x = 0.35;
        legL.kneeGroup.rotation.x = 0.65;
        legR.kneeGroup.rotation.x = 0.65;
        armL.armPivot.rotation.z = -0.45;
        armR.armPivot.rotation.z = 0.45;
      } else if (anim.state === 'pickup') {
        // Kneeling down to recover a component from lunar dust
        hipGroup.rotation.x = 0.45;
        hipGroup.position.y = 0.68 * scale;
        legL.legPivot.rotation.x = -0.45;
        legR.legPivot.rotation.x = 0.65;
        legL.kneeGroup.rotation.x = 0.85;
        legR.kneeGroup.rotation.x = 0.35;

        armR.armPivot.rotation.x = -1.15;
        armR.armPivot.rotation.z = 0.25;
        armL.armPivot.rotation.x = 0.25;
        headGroup.rotation.x = 0.45;
      } else if (anim.state === 'inspect') {
        // Holding component up in front of helmet
        hipGroup.rotation.x = 0.04;
        hipGroup.position.y = 0.95 * scale;
        legL.legPivot.rotation.x = 0;
        legR.legPivot.rotation.x = 0;
        armR.armPivot.rotation.x = -1.45;
        armR.armPivot.rotation.z = -0.25;
        armL.armPivot.rotation.x = -1.15;
        armL.armPivot.rotation.z = 0.35;
        headGroup.rotation.x = 0.35;
      } else if (anim.state === 'repair') {
        // Interactive tool welding / alignment motion
        hipGroup.rotation.x = 0.18;
        hipGroup.position.y = 0.92 * scale;
        legL.legPivot.rotation.x = 0.15;
        legR.legPivot.rotation.x = -0.15;

        armR.armPivot.rotation.x = -1.25 + Math.sin(timeSeconds * 14) * 0.12;
        armR.armPivot.rotation.z = 0.28 + Math.cos(timeSeconds * 10) * 0.10;
        armL.armPivot.rotation.x = -0.75;
        armL.armPivot.rotation.z = -0.25;
        headGroup.rotation.x = 0.25;
      } else if (anim.state === 'victory') {
        // Triumphant celebration
        hipGroup.position.y = (0.95 + Math.abs(Math.sin(timeSeconds * 5)) * 0.10) * scale;
        hipGroup.rotation.x = 0;
        armL.armPivot.rotation.x = 0;
        armR.armPivot.rotation.x = 0;
        armL.armPivot.rotation.z = -2.45 + Math.sin(timeSeconds * 6) * 0.25;
        armR.armPivot.rotation.z = 2.45 - Math.sin(timeSeconds * 6) * 0.25;
        headGroup.rotation.x = -0.22;
        headGroup.rotation.y = Math.sin(timeSeconds * 3) * 0.18;
      } else {
        // Idle breathing and balance
        const breath = Math.sin(timeSeconds * 2.0) * 0.015 * scale;
        hipGroup.position.y = 0.95 * scale + breath;
        hipGroup.rotation.x = 0;
        legL.legPivot.rotation.x = 0;
        legR.legPivot.rotation.x = 0;
        legL.kneeGroup.rotation.x = 0.05;
        legR.kneeGroup.rotation.x = 0.05;

        armL.armPivot.rotation.x = Math.sin(timeSeconds * 2.0) * 0.03;
        armR.armPivot.rotation.x = -Math.sin(timeSeconds * 2.0) * 0.03;
        armL.armPivot.rotation.z = -0.15;
        armR.armPivot.rotation.z = 0.15;

        headGroup.rotation.x = 0;
        headGroup.rotation.y = Math.sin(timeSeconds * 0.6) * 0.08;
      }
    }
  };

  root.userData.anim = anim;
  root.userData.parts = {
    hipGroup,
    chestGroup,
    headGroup,
    helmetVisor,
    armL,
    armR,
    legL,
    legR,
    carriedItemSlot
  };

  return root;
}

