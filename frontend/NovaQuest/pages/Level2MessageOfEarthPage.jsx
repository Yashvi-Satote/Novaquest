import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  ArrowRight, 
  RotateCcw, 
  Radio, 
  Rocket, 
  X, 
  Crosshair, 
  Info, 
  Compass, 
  Sparkles, 
  Zap, 
  Shield, 
  User, 
  Cable, 
  Eye, 
  Activity 
} from 'lucide-react';
import { gameAudio } from '../config/gameAudio';

const PRIMARY_VOYAGER_MODEL = '/assets/spacecraft/voyager/Voyager.glb';
const FALLBACK_VOYAGER_MODEL = '/models/spacecraft/voyager.glb';

// Position of the white dummy spaceship in deep space
const DUMMY_SHIP_POS = new THREE.Vector3(10.0, 3.2, -8.5);

// Initial position of the astronaut on spacewalk connected to the spaceship
const INITIAL_ASTRONAUT_POS = new THREE.Vector3(12.2, 3.8, -6.8);

// Maximum umbilical spool line capacity in meters
const MAX_TETHER_CAPACITY = 80.0;

/**
 * Dispose all geometries, materials, and textures attached to a Three.js Object3D tree.
 */
function disposeObject3D(root) {
  if (!root) return;
  root.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (!mat) return;
        Object.values(mat).forEach((value) => {
          if (value && typeof value === 'object' && typeof value.dispose === 'function') {
            value.dispose();
          }
        });
        mat.dispose();
      });
    }
  });
}

/**
 * Create a crisp, sparse deep-space starfield surrounding the origin so space
 * remains pure empty black void with subtle depth cues.
 */
function createEmptySpaceStarfield() {
  const starCount = 1600;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const radius = 180 + Math.random() * 180;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const tint = 0.72 + Math.random() * 0.28;
    colors[i * 3] = tint;
    colors[i * 3 + 1] = tint;
    colors[i * 3 + 2] = Math.min(1, tint + 0.08);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.65,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

/**
 * Create a medium-poly white aerospace spaceship model placed further away in deep space.
 */
function createDummySpaceship() {
  const shipGroup = new THREE.Group();
  shipGroup.name = 'dummySpaceship';

  const whiteHullMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.2,
    roughness: 0.28,
  });

  const lightPanelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.28,
    roughness: 0.32,
  });

  const darkCarbonMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.6,
    roughness: 0.45,
  });

  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.88,
    roughness: 0.25,
  });

  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    metalness: 0.8,
    roughness: 0.08,
    transmission: 0.6,
    transparent: true,
    opacity: 0.9,
    reflectivity: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const solarPanelMat = new THREE.MeshStandardMaterial({
    color: 0x0c1e3d,
    emissive: 0x0284c7,
    emissiveIntensity: 0.2,
    metalness: 0.75,
    roughness: 0.15,
  });

  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.92,
    roughness: 0.2,
  });

  const thrusterGlowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.92,
  });

  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    metalness: 0.4,
    roughness: 0.2,
  });

  // Fuselage
  const mainFuselageGeo = new THREE.CylinderGeometry(0.72, 0.95, 3.4, 32);
  mainFuselageGeo.rotateX(Math.PI / 2);
  const mainFuselage = new THREE.Mesh(mainFuselageGeo, whiteHullMat);
  mainFuselage.scale.set(1.15, 0.7, 1.0);
  shipGroup.add(mainFuselage);

  const noseGeo = new THREE.ConeGeometry(0.72, 1.6, 32);
  noseGeo.rotateX(Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, whiteHullMat);
  nose.scale.set(1.15, 0.7, 1.0);
  nose.position.set(0, 0, 2.5);
  shipGroup.add(nose);

  const noseCapGeo = new THREE.SphereGeometry(0.24, 24, 16);
  noseCapGeo.scale(1.1, 0.75, 1.3);
  const noseCap = new THREE.Mesh(noseCapGeo, darkCarbonMat);
  noseCap.position.set(0, 0, 3.25);
  shipGroup.add(noseCap);

  const spineGeo = new THREE.BoxGeometry(0.35, 0.22, 2.8);
  const spine = new THREE.Mesh(spineGeo, lightPanelMat);
  spine.position.set(0, 0.38, 0.1);
  shipGroup.add(spine);

  const heatShieldGeo = new THREE.BoxGeometry(1.6, 0.08, 3.6);
  const heatShield = new THREE.Mesh(heatShieldGeo, darkCarbonMat);
  heatShield.position.set(0, -0.32, 0.2);
  shipGroup.add(heatShield);

  // Cockpit Canopy
  const canopyGeo = new THREE.SphereGeometry(0.42, 24, 16);
  canopyGeo.scale(1.0, 0.65, 1.8);
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.32, 1.1);
  shipGroup.add(canopy);

  const canopyRibGeo = new THREE.TorusGeometry(0.36, 0.03, 12, 24, Math.PI);
  canopyRibGeo.rotateX(Math.PI / 2);
  canopyRibGeo.rotateY(Math.PI);
  const canopyRib = new THREE.Mesh(canopyRibGeo, whiteHullMat);
  canopyRib.position.set(0, 0.36, 1.1);
  canopyRib.scale.set(1.02, 1.0, 0.7);
  shipGroup.add(canopyRib);

  // Swept Delta Wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(2.4, -0.8);
  wingShape.lineTo(2.2, -1.9);
  wingShape.lineTo(0, -1.6);
  wingShape.closePath();

  const wingExtrudeSettings = {
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.03,
  };

  const leftWingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
  leftWingGeo.rotateX(Math.PI / 2);
  const leftWing = new THREE.Mesh(leftWingGeo, whiteHullMat);
  leftWing.position.set(0.65, 0.02, 0.5);
  shipGroup.add(leftWing);

  const rightWingGeo = leftWingGeo.clone();
  rightWingGeo.scale(-1, 1, 1);
  const rightWing = new THREE.Mesh(rightWingGeo, whiteHullMat);
  rightWing.position.set(-0.65, 0.02, 0.5);
  shipGroup.add(rightWing);

  // Solar array insets
  const solarInsetGeo = new THREE.BoxGeometry(1.4, 0.02, 0.7);
  const leftSolar = new THREE.Mesh(solarInsetGeo, solarPanelMat);
  leftSolar.position.set(1.5, 0.08, -0.2);
  leftSolar.rotation.y = -0.32;
  const rightSolar = new THREE.Mesh(solarInsetGeo, solarPanelMat);
  rightSolar.position.set(-1.5, 0.08, -0.2);
  rightSolar.rotation.y = 0.32;
  shipGroup.add(leftSolar, rightSolar);

  // Winglet Stabilizers
  const wingletGeo = new THREE.BoxGeometry(0.08, 0.9, 0.7);
  const leftWinglet = new THREE.Mesh(wingletGeo, whiteHullMat);
  leftWinglet.position.set(2.85, 0.42, -0.7);
  leftWinglet.rotation.z = -0.18;
  const rightWinglet = new THREE.Mesh(wingletGeo, whiteHullMat);
  rightWinglet.position.set(-2.85, 0.42, -0.7);
  rightWinglet.rotation.z = 0.18;
  shipGroup.add(leftWinglet, rightWinglet);

  const wingletTrimGeo = new THREE.BoxGeometry(0.1, 0.12, 0.72);
  const leftWingletTrim = new THREE.Mesh(wingletTrimGeo, cyanGlowMat);
  leftWingletTrim.position.set(2.93, 0.88, -0.7);
  const rightWingletTrim = new THREE.Mesh(wingletTrimGeo, cyanGlowMat);
  rightWingletTrim.position.set(-2.93, 0.88, -0.7);
  shipGroup.add(leftWingletTrim, rightWingletTrim);

  // Navigation Strobe Beacons
  const beaconGeo = new THREE.SphereGeometry(0.06, 16, 16);
  const portBeacon = new THREE.Mesh(beaconGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  portBeacon.position.set(-2.95, 0.92, -0.7);
  const stbdBeacon = new THREE.Mesh(beaconGeo, new THREE.MeshBasicMaterial({ color: 0x22c55e }));
  stbdBeacon.position.set(2.95, 0.92, -0.7);
  const dorsalBeacon = new THREE.Mesh(beaconGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
  dorsalBeacon.position.set(0, 0.52, -1.2);
  shipGroup.add(portBeacon, stbdBeacon, dorsalBeacon);

  // Communications Dish
  const dishGeo = new THREE.SphereGeometry(0.48, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
  dishGeo.rotateX(-Math.PI / 3);
  const dish = new THREE.Mesh(dishGeo, goldFoilMat);
  dish.position.set(0, 0.68, -0.4);
  dish.scale.set(1.0, 1.0, 0.55);
  shipGroup.add(dish);

  const dishMountGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.35, 16);
  const dishMount = new THREE.Mesh(dishMountGeo, titaniumMat);
  dishMount.position.set(0, 0.48, -0.4);
  shipGroup.add(dishMount);

  // Rear Ion Propulsion
  const engineHousingGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.8, 32);
  engineHousingGeo.rotateX(Math.PI / 2);
  const engineHousing = new THREE.Mesh(engineHousingGeo, whiteHullMat);
  engineHousing.position.set(0, 0, -1.8);
  engineHousing.scale.set(1.2, 0.65, 1.0);
  shipGroup.add(engineHousing);

  const bellGeo = new THREE.CylinderGeometry(0.25, 0.36, 0.85, 32);
  bellGeo.rotateX(Math.PI / 2);
  const leftBell = new THREE.Mesh(bellGeo, titaniumMat);
  leftBell.position.set(-0.46, -0.04, -2.15);
  const rightBell = new THREE.Mesh(bellGeo, titaniumMat);
  rightBell.position.set(0.46, -0.04, -2.15);
  shipGroup.add(leftBell, rightBell);

  const plumeGeo = new THREE.ConeGeometry(0.26, 1.4, 24);
  plumeGeo.rotateX(-Math.PI / 2);
  const leftPlume = new THREE.Mesh(plumeGeo, thrusterGlowMat);
  leftPlume.position.set(-0.46, -0.04, -3.0);
  const rightPlume = new THREE.Mesh(plumeGeo, thrusterGlowMat);
  rightPlume.position.set(0.46, -0.04, -3.0);
  shipGroup.add(leftPlume, rightPlume);

  const thrusterLight = new THREE.PointLight(0x38bdf8, 2.6, 12);
  thrusterLight.position.set(0, -0.04, -3.2);
  shipGroup.add(thrusterLight);

  // Airlock Tether Anchor Node (Where the umbilical wire connects to ship)
  const anchorNodeGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.15, 16);
  const anchorMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
  const shipAnchor = new THREE.Mesh(anchorNodeGeo, anchorMat);
  shipAnchor.position.set(0.7, 0.25, 0.3);
  shipGroup.add(shipAnchor);

  shipGroup.position.copy(DUMMY_SHIP_POS);
  shipGroup.rotation.set(-0.25, 2.3, 0.15);
  shipGroup.scale.setScalar(1.15);

  return { shipGroup, thrusterLight, shipAnchor };
}

/**
 * Create a medium-poly 3D astronaut character performing an extra-vehicular activity (EVA).
 * In First-Person View (FPV), the head/helmet group is permanently culled so the camera
 * is placed directly at the astronaut's eyes without clipping into geometry.
 */
function createMediumPolyAstronaut() {
  const astronautGroup = new THREE.Group();
  astronautGroup.name = 'astronaut';

  const suitMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.45,
    metalness: 0.12,
  });

  const darkJointMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.6,
    metalness: 0.2,
  });

  const goldVisorMat = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b,
    metalness: 0.96,
    roughness: 0.08,
    reflectivity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const redStripeMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.4,
  });

  const backpackMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.25,
    roughness: 0.35,
  });

  const metallicMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.25,
  });

  const thrusterPuffMat = new THREE.MeshBasicMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.75,
  });

  // 1. Torso
  const torsoGeo = new THREE.CylinderGeometry(0.38, 0.33, 0.75, 24);
  const torso = new THREE.Mesh(torsoGeo, suitMat);
  torso.position.set(0, 0.85, 0);
  astronautGroup.add(torso);

  // Chest Display & Control Module (DCM)
  const dcmGeo = new THREE.BoxGeometry(0.26, 0.22, 0.12);
  const dcm = new THREE.Mesh(dcmGeo, backpackMat);
  dcm.position.set(0, 0.9, 0.22);
  astronautGroup.add(dcm);

  // Red commander arm/torso stripe
  const stripeGeo = new THREE.TorusGeometry(0.36, 0.02, 12, 24);
  stripeGeo.rotateX(Math.PI / 2);
  const stripe = new THREE.Mesh(stripeGeo, redStripeMat);
  stripe.position.set(0, 1.05, 0);
  astronautGroup.add(stripe);

  // 2. Helmet & Visor Group (Hidden in pure First-Person View so camera sees space cleanly)
  const headGroup = new THREE.Group();
  headGroup.name = 'astronautHeadGroup';
  headGroup.visible = false; // Always culled for true FPV

  const helmetGeo = new THREE.SphereGeometry(0.32, 24, 20);
  const helmet = new THREE.Mesh(helmetGeo, suitMat);
  helmet.position.set(0, 1.45, 0);
  headGroup.add(helmet);

  const visorGeo = new THREE.SphereGeometry(0.28, 24, 16, 0, Math.PI, 0, Math.PI * 0.75);
  visorGeo.rotateY(Math.PI / 2);
  const visor = new THREE.Mesh(visorGeo, goldVisorMat);
  visor.position.set(0, 1.46, 0.08);
  visor.scale.set(1.0, 0.9, 1.05);
  headGroup.add(visor);

  const neckRingGeo = new THREE.TorusGeometry(0.28, 0.035, 12, 24);
  neckRingGeo.rotateX(Math.PI / 2);
  const neckRing = new THREE.Mesh(neckRingGeo, metallicMat);
  neckRing.position.set(0, 1.25, 0);
  headGroup.add(neckRing);

  const headlampGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 12);
  headlampGeo.rotateX(Math.PI / 2);
  const leftHeadlamp = new THREE.Mesh(headlampGeo, metallicMat);
  leftHeadlamp.position.set(-0.28, 1.5, 0.12);
  const rightHeadlamp = new THREE.Mesh(headlampGeo, metallicMat);
  rightHeadlamp.position.set(0.28, 1.5, 0.12);
  headGroup.add(leftHeadlamp, rightHeadlamp);

  astronautGroup.add(headGroup);

  const helmetLight = new THREE.PointLight(0xffffff, 1.2, 5);
  helmetLight.position.set(0, 1.5, 0.35);
  astronautGroup.add(helmetLight);

  // 3. Primary Life Support System (PLSS) Backpack
  const plssGeo = new THREE.BoxGeometry(0.48, 0.72, 0.28);
  const plss = new THREE.Mesh(plssGeo, backpackMat);
  plss.position.set(0, 0.9, -0.25);
  astronautGroup.add(plss);

  const tankGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.52, 16);
  const leftTank = new THREE.Mesh(tankGeo, metallicMat);
  leftTank.position.set(-0.14, 0.92, -0.38);
  const rightTank = new THREE.Mesh(tankGeo, metallicMat);
  rightTank.position.set(0.14, 0.92, -0.38);
  astronautGroup.add(leftTank, rightTank);

  const antennaGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8);
  const antenna = new THREE.Mesh(antennaGeo, metallicMat);
  antenna.position.set(0.18, 1.45, -0.3);
  astronautGroup.add(antenna);

  // Astronaut Tether Anchor Ring
  const astroAnchorGeo = new THREE.TorusGeometry(0.06, 0.02, 12, 16);
  const astroAnchor = new THREE.Mesh(astroAnchorGeo, metallicMat);
  astroAnchor.position.set(0, 0.55, -0.24);
  astronautGroup.add(astroAnchor);

  // 4. Arms
  const armGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.42, 16);
  const gloveGeo = new THREE.SphereGeometry(0.09, 16, 12);

  const leftUpperArm = new THREE.Mesh(armGeo, suitMat);
  leftUpperArm.position.set(-0.46, 0.95, 0.1);
  leftUpperArm.rotation.set(0.3, 0, 0.4);
  const leftGlove = new THREE.Mesh(gloveGeo, darkJointMat);
  leftGlove.position.set(-0.6, 0.75, 0.25);
  astronautGroup.add(leftUpperArm, leftGlove);

  const rightUpperArm = new THREE.Mesh(armGeo, suitMat);
  rightUpperArm.position.set(0.46, 0.95, 0.1);
  rightUpperArm.rotation.set(0.3, 0, -0.4);
  const rightGlove = new THREE.Mesh(gloveGeo, darkJointMat);
  rightGlove.position.set(0.6, 0.75, 0.25);
  astronautGroup.add(rightUpperArm, rightGlove);

  // 5. Legs & Boots
  const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.55, 16);
  const bootGeo = new THREE.BoxGeometry(0.18, 0.16, 0.32);

  const leftLeg = new THREE.Mesh(legGeo, suitMat);
  leftLeg.position.set(-0.2, 0.35, 0.05);
  leftLeg.rotation.set(0.2, 0, 0.1);
  const leftBoot = new THREE.Mesh(bootGeo, darkJointMat);
  leftBoot.position.set(-0.22, 0.02, 0.16);
  astronautGroup.add(leftLeg, leftBoot);

  const rightLeg = new THREE.Mesh(legGeo, suitMat);
  rightLeg.position.set(0.2, 0.35, 0.05);
  rightLeg.rotation.set(0.2, 0, -0.1);
  const rightBoot = new THREE.Mesh(bootGeo, darkJointMat);
  rightBoot.position.set(0.22, 0.02, 0.16);
  astronautGroup.add(rightLeg, rightBoot);

  // 6. SAFER Cold-Gas Thruster Puffs
  const puffGeo = new THREE.ConeGeometry(0.12, 0.45, 12);
  puffGeo.rotateX(Math.PI / 2);
  const thrusterPuffs = new THREE.Group();
  thrusterPuffs.name = 'thrusterPuffs';
  const puffLeft = new THREE.Mesh(puffGeo, thrusterPuffMat);
  puffLeft.position.set(-0.26, 0.65, -0.4);
  const puffRight = new THREE.Mesh(puffGeo, thrusterPuffMat);
  puffRight.position.set(0.26, 0.65, -0.4);
  thrusterPuffs.add(puffLeft, puffRight);
  thrusterPuffs.visible = false;
  astronautGroup.add(thrusterPuffs);

  astronautGroup.scale.setScalar(0.72);
  astronautGroup.position.copy(INITIAL_ASTRONAUT_POS);
  astronautGroup.rotation.set(0.15, -0.85, 0.1);

  return { astronautGroup, astroAnchor, thrusterPuffs, headGroup, helmetLight };
}

/**
 * Level2MessageOfEarthPage.jsx
 *
 * Level 2: Message of Earth
 * - Pure First-Person View (FPV): The entire level runs exclusively from the astronaut's helmet visor.
 * - Automatic Umbilical Wire Extension: The tether wire automatically pays out line as the player moves further into space.
 * - Authentic NASA Voyager 1 3D spacecraft model centered at the origin (0, 0, 0).
 * - Medium-poly white dummy spaceship serving as the home tether anchor.
 * - Interactive space environment zero-g physics movement using keyboard WASD/arrows and on-screen controls.
 */
export default function Level2MessageOfEarthPage() {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const cameraRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [isAstroModalOpen, setIsAstroModalOpen] = useState(false);

  // Live umbilical tether telemetry (auto-extends dynamically)
  const [tetherDist, setTetherDist] = useState('6.5');
  const [autoTetherLimit, setAutoTetherLimit] = useState(12.0);
  const autoTetherLengthRef = useRef(12.0);

  // Visor orientation & gyro telemetry
  const [fpvTelemetry, setFpvTelemetry] = useState({ heading: 284, pitch: 2 });

  // FPV Camera orientation look state (initially aimed at Voyager 1)
  const fpvLookRef = useRef({
    yaw: -1.05,
    pitch: 0.04,
  });

  const fpvDragRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
  });

  // Space movement physics state
  const physicsRef = useRef({
    pos: INITIAL_ASTRONAUT_POS.clone(),
    vel: new THREE.Vector3(0, 0, 0),
    keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false },
    activePuff: false,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    let disposed = false;
    let frameId = null;
    let voyagerRoot = null;
    let dummyShipRoot = null;
    let astronautRoot = null;
    let astroHeadGroup = null;
    let thrusterPointLight = null;
    let thrusterPuffsMesh = null;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020308);

    // True First-Person Perspective Camera (55° FOV)
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(INITIAL_ASTRONAUT_POS.x, INITIAL_ASTRONAUT_POS.y + 1.04, INITIAL_ASTRONAUT_POS.z + 0.09);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Deep space backdrop
    const starfield = createEmptySpaceStarfield();
    scene.add(starfield);

    // Add white exploratory spaceship anchor vessel
    const { shipGroup, thrusterLight, shipAnchor } = createDummySpaceship();
    scene.add(shipGroup);
    dummyShipRoot = shipGroup;
    thrusterPointLight = thrusterLight;

    // Add medium-poly astronaut character
    const { astronautGroup, astroAnchor, thrusterPuffs, headGroup } = createMediumPolyAstronaut();
    scene.add(astronautGroup);
    astronautRoot = astronautGroup;
    thrusterPuffsMesh = thrusterPuffs;
    astroHeadGroup = headGroup;
    if (astroHeadGroup) astroHeadGroup.visible = false; // Ensure head meshes are hidden in FPV

    // Zero-G Umbilical Tether Wire
    const tetherGeo = new THREE.BufferGeometry();
    const tetherMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b, // Golden braided safety umbilical wire
      linewidth: 2,
      transparent: true,
      opacity: 0.95,
    });
    const tetherLine = new THREE.Line(tetherGeo, tetherMat);
    scene.add(tetherLine);

    // Interstellar sunlight & fill lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.7);
    scene.add(ambientLight);

    const sunKeyLight = new THREE.DirectionalLight(0xfff7ed, 2.7);
    sunKeyLight.position.set(10, 8, 12);
    scene.add(sunKeyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.2);
    rimLight.position.set(-10, -4, -9);
    scene.add(rimLight);

    const underFillLight = new THREE.DirectionalLight(0x94a3b8, 0.6);
    underFillLight.position.set(0, -10, 4);
    scene.add(underFillLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.4;
    controls.maxDistance = 18;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.65;
    controls.update();
    controlsRef.current = controls;

    const stopAutoRotate = () => {
      controls.autoRotate = false;
    };
    controls.addEventListener('start', stopAutoRotate);

    // NASA Headquarters-style laptop touchpad controls (2-finger swipe & pinch-zoom)
    const TRACKPAD_LOOK_SENSITIVITY = 0.0032;
    const trackpadOffset = new THREE.Vector3();
    const trackpadSpherical = new THREE.Spherical();

    const handleWheel = (event) => {
      const deltaMultiplier =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1;
      const deltaX = event.deltaX * deltaMultiplier;
      const deltaY = event.deltaY * deltaMultiplier;
      if (deltaX === 0 && deltaY === 0) return;

      event.preventDefault();
      controls.autoRotate = false;

      if (event.ctrlKey) {
        const factor = 1 + deltaY * 0.003;
        camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);
        controls.update();
        return;
      }

      trackpadOffset.copy(camera.position).sub(controls.target);
      trackpadSpherical.setFromVector3(trackpadOffset);
      trackpadSpherical.theta += deltaX * TRACKPAD_LOOK_SENSITIVITY;
      trackpadSpherical.phi = THREE.MathUtils.clamp(
        trackpadSpherical.phi + deltaY * TRACKPAD_LOOK_SENSITIVITY,
        0.02,
        Math.PI - 0.02,
      );
      trackpadOffset.setFromSpherical(trackpadSpherical);
      camera.position.copy(controls.target).add(trackpadOffset);
      camera.lookAt(controls.target);
      controls.update();
    };
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    // NASA Headquarters-style WASD + Arrow Keys orbit controls
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        event.preventDefault();
        controls.autoRotate = false;
        const step = 0.06;
        trackpadOffset.copy(camera.position).sub(controls.target);
        trackpadSpherical.setFromVector3(trackpadOffset);
        if (key === 'a' || key === 'arrowleft') trackpadSpherical.theta -= step;
        if (key === 'd' || key === 'arrowright') trackpadSpherical.theta += step;
        if (key === 'w' || key === 'arrowup') trackpadSpherical.phi = Math.max(0.04, trackpadSpherical.phi - step);
        if (key === 's' || key === 'arrowdown') trackpadSpherical.phi = Math.min(Math.PI - 0.04, trackpadSpherical.phi + step);
        trackpadOffset.setFromSpherical(trackpadSpherical);
        camera.position.copy(controls.target).add(trackpadOffset);
        camera.lookAt(controls.target);
        controls.update();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const mountVoyagerModel = (gltf) => {
      if (disposed) {
        disposeObject3D(gltf.scene);
        return;
      }

      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const normalizedScale = 4.8 / maxDim;

      model.scale.setScalar(normalizedScale);
      model.position.set(
        -center.x * normalizedScale,
        -center.y * normalizedScale,
        -center.z * normalizedScale
      );

      const pivot = new THREE.Group();
      pivot.add(model);
      pivot.rotation.set(0.18, -0.55, 0.08);
      scene.add(pivot);
      voyagerRoot = pivot;

      setLoadError(null);
      setIsLoading(false);
    };

    gltfLoader.load(
      PRIMARY_VOYAGER_MODEL,
      mountVoyagerModel,
      undefined,
      () => {
        if (disposed) return;
        gltfLoader.load(
          FALLBACK_VOYAGER_MODEL,
          mountVoyagerModel,
          undefined,
          (fallbackError) => {
            if (disposed) return;
            console.error('Failed to load Voyager 1 3D model:', fallbackError);
            setLoadError('Unable to load the Voyager 1 3D model.');
            setIsLoading(false);
          }
        );
      }
    );

    // Mouse Look / Pointer Drag Controls for First-Person Helmet View
    const handleCanvasPointerDown = (event) => {
      if (disposed) return;
      fpvDragRef.current.isDown = true;
      fpvDragRef.current.startX = event.clientX;
      fpvDragRef.current.startY = event.clientY;
    };

    const handleCanvasPointerUp = () => {
      fpvDragRef.current.isDown = false;
      if (container) container.style.cursor = 'crosshair';
    };

    const handlePointerMove = (event) => {
      if (disposed || !container || !camera) return;

      if (fpvDragRef.current.isDown) {
        const deltaX = event.clientX - fpvDragRef.current.startX;
        const deltaY = event.clientY - fpvDragRef.current.startY;
        fpvDragRef.current.startX = event.clientX;
        fpvDragRef.current.startY = event.clientY;

        fpvLookRef.current.yaw -= deltaX * 0.0035;
        fpvLookRef.current.pitch = Math.max(
          -1.35,
          Math.min(1.35, fpvLookRef.current.pitch - deltaY * 0.0035)
        );
        container.style.cursor = 'grabbing';
      } else {
        container.style.cursor = 'crosshair';
      }
    };

    renderer.domElement.addEventListener('pointerdown', handleCanvasPointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handleCanvasPointerUp);

    // Keyboard Arrow Keys & WASD listener for spacewalk movement
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowUp' || e.key === 'KeyW' || e.key === 'w' || e.key === 'W') {
        physicsRef.current.keys.ArrowUp = true;
      }
      if (e.key === 'ArrowDown' || e.key === 'KeyS' || e.key === 's' || e.key === 'S') {
        physicsRef.current.keys.ArrowDown = true;
      }
      if (e.key === 'ArrowLeft' || e.key === 'KeyA' || e.key === 'a' || e.key === 'A') {
        physicsRef.current.keys.ArrowLeft = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'KeyD' || e.key === 'd' || e.key === 'D') {
        physicsRef.current.keys.ArrowRight = true;
      }
      if (e.key === 'r' || e.key === 'R') {
        handleFaceVoyager();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'KeyW' || e.key === 'w' || e.key === 'W') {
        physicsRef.current.keys.ArrowUp = false;
      }
      if (e.key === 'ArrowDown' || e.key === 'KeyS' || e.key === 's' || e.key === 'S') {
        physicsRef.current.keys.ArrowDown = false;
      }
      if (e.key === 'ArrowLeft' || e.key === 'KeyA' || e.key === 'a' || e.key === 'A') {
        physicsRef.current.keys.ArrowLeft = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'KeyD' || e.key === 'd' || e.key === 'D') {
        physicsRef.current.keys.ArrowRight = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const clock = new THREE.Clock();
    let lastTetherUpdate = 0;
    let lastHudUpdate = 0;

    const animate = () => {
      if (disposed) return;
      const elapsed = clock.getElapsedTime();

      // 1. Spaceship gentle idle drift
      if (dummyShipRoot) {
        dummyShipRoot.position.y = DUMMY_SHIP_POS.y + Math.sin(elapsed * 0.75) * 0.15;
        dummyShipRoot.rotation.z = 0.15 + Math.sin(elapsed * 0.5) * 0.04;

        if (thrusterPointLight) {
          thrusterPointLight.intensity = 2.2 + Math.sin(elapsed * 4.2) * 0.5;
        }
      }

      // 2. Astronaut Space Environment Physics & Movement (Relative to FPV Look Direction)
      const phys = physicsRef.current;
      const thrustPower = 0.038;
      let isThrusting = false;

      const yaw = fpvLookRef.current.yaw;
      const pitch = fpvLookRef.current.pitch;
      const fwdX = Math.sin(yaw);
      const fwdZ = -Math.cos(yaw);
      const rightX = Math.cos(yaw);
      const rightZ = Math.sin(yaw);

      if (phys.keys.ArrowUp) {
        phys.vel.x += fwdX * thrustPower;
        phys.vel.z += fwdZ * thrustPower;
        phys.vel.y += pitch * thrustPower * 0.45;
        isThrusting = true;
      }
      if (phys.keys.ArrowDown) {
        phys.vel.x -= fwdX * thrustPower;
        phys.vel.z -= fwdZ * thrustPower;
        phys.vel.y -= pitch * thrustPower * 0.45;
        isThrusting = true;
      }
      if (phys.keys.ArrowLeft) {
        phys.vel.x -= rightX * thrustPower;
        phys.vel.z -= rightZ * thrustPower;
        isThrusting = true;
      }
      if (phys.keys.ArrowRight) {
        phys.vel.x += rightX * thrustPower;
        phys.vel.z += rightZ * thrustPower;
        isThrusting = true;
      }

      // Zero-G Vacuum Momentum
      phys.pos.add(phys.vel);
      phys.vel.multiplyScalar(0.965);

      // 3. Automatic Umbilical Tether Wire Extension
      // As the player goes further away from the spaceship, the tether wire automatically extends!
      const currentShipPos = dummyShipRoot ? dummyShipRoot.position : DUMMY_SHIP_POS;
      const distFromShip = phys.pos.distanceTo(currentShipPos);
      const distMeters = distFromShip * 1.8;

      // Automatically dynamically adjust deployed line length to match player distance + buffer
      const dynamicPayout = Math.min(MAX_TETHER_CAPACITY, Math.max(8.0, distMeters + 2.5));
      autoTetherLengthRef.current = dynamicPayout;

      // Safety limit elastic tension (only active if reaching maximum spool capacity of 80m)
      if (distMeters >= MAX_TETHER_CAPACITY) {
        const returnVector = new THREE.Vector3().subVectors(currentShipPos, phys.pos).normalize();
        const overstretch = distFromShip - (MAX_TETHER_CAPACITY / 1.8);
        const reelForce = Math.min(0.14, 0.04 + overstretch * 0.035);
        phys.pos.addScaledVector(returnVector, overstretch * 0.45);
        phys.vel.addScaledVector(returnVector, reelForce);
      }

      // 4. Update Astronaut Body and Pin FPV Camera to Helmet Visor
      if (astronautRoot) {
        astronautRoot.position.copy(phys.pos);

        // Keep helmet meshes hidden in FPV so camera view is pristine
        if (astroHeadGroup) astroHeadGroup.visible = false;

        // Suit faces the view direction so player sees chest DCM and gloves when looking down
        astronautRoot.rotation.set(0, yaw + Math.PI, 0);

        // Position camera directly at visor eye position in world coordinates
        const eyeLocalOffset = new THREE.Vector3(0, 1.44, 0.12);
        const eyeWorldPos = astronautRoot.localToWorld(eyeLocalOffset);
        camera.position.copy(eyeWorldPos);

        const lookTarget = new THREE.Vector3(
          eyeWorldPos.x + Math.sin(yaw) * Math.cos(pitch),
          eyeWorldPos.y + Math.sin(pitch),
          eyeWorldPos.z - Math.cos(yaw) * Math.cos(pitch)
        );
        camera.lookAt(lookTarget);

        // Throttle telemetry updates to 12 FPS for smooth non-blocking HUD
        if (elapsed - lastHudUpdate > 0.08) {
          setFpvTelemetry({
            heading: Math.round(((-yaw * 180) / Math.PI) % 360 + 360) % 360,
            pitch: Math.round((pitch * 180) / Math.PI),
          });
          setAutoTetherLimit(Number(dynamicPayout.toFixed(1)));
          lastHudUpdate = elapsed;
        }

        // Thruster puffs VFX
        if (thrusterPuffsMesh) {
          thrusterPuffsMesh.visible = isThrusting;
          if (isThrusting) {
            thrusterPuffsMesh.scale.setScalar(1.0 + Math.sin(elapsed * 24) * 0.3);
          }
        }
      }

      // 5. Render Dynamic Zero-G Umbilical Tether Wire
      if (shipAnchor && astroAnchor) {
        const pShip = new THREE.Vector3();
        const pAstro = new THREE.Vector3();
        shipAnchor.getWorldPosition(pShip);
        astroAnchor.getWorldPosition(pAstro);

        const currentDist = pShip.distanceTo(pAstro);
        if (elapsed - lastTetherUpdate > 0.25) {
          setTetherDist((currentDist * 1.8).toFixed(1));
          lastTetherUpdate = elapsed;
        }

        // Zero-G catenary undulating spline with gentle harmonic wave
        const mid1 = new THREE.Vector3().lerpVectors(pShip, pAstro, 0.33);
        const mid2 = new THREE.Vector3().lerpVectors(pShip, pAstro, 0.66);
        const sag = Math.sin(elapsed * 1.5) * 0.12 - (0.35 + currentDist * 0.02);
        mid1.y += sag;
        mid2.y += sag * 0.85;
        mid1.x += Math.sin(elapsed * 1.1) * 0.06;
        mid2.z += Math.cos(elapsed * 1.3) * 0.06;

        const tetherCurve = new THREE.CatmullRomCurve3([pShip, mid1, mid2, pAstro]);
        const tetherPoints = tetherCurve.getPoints(40);
        tetherGeo.setFromPoints(tetherPoints);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (disposed || !container) return;
      const nextWidth = container.clientWidth || window.innerWidth;
      const nextHeight = container.clientHeight || window.innerHeight;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      controls.removeEventListener('start', stopAutoRotate);
      if (frameId !== null) cancelAnimationFrame(frameId);
      dracoLoader.dispose();
      disposeObject3D(starfield);
      disposeObject3D(voyagerRoot);
      disposeObject3D(dummyShipRoot);
      disposeObject3D(astronautRoot);
      tetherGeo.dispose();
      tetherMat.dispose();
      renderer.dispose();
      cameraRef.current = null;
    };
  }, []);

  // Re-orient helmet view directly toward Voyager 1 at (0, 0, 0)
  const handleFaceVoyager = () => {
    gameAudio.playClick();
    fpvLookRef.current.yaw = -1.05;
    fpvLookRef.current.pitch = 0.04;
  };

  // Directional Thruster Handlers
  const handleArrowPress = (direction) => {
    gameAudio.playClick();
    physicsRef.current.keys[direction] = true;
  };

  const handleArrowRelease = (direction) => {
    physicsRef.current.keys[direction] = false;
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#020308] text-white select-none">
      {/* Fullscreen 3D First-Person Viewport */}
      <div
        ref={mountRef}
        className="absolute inset-0 h-full w-full cursor-crosshair active:cursor-grabbing"
        aria-label="First-Person 3D view from Astronaut Helmet Visor in deep space"
      />

      {/* Permanent First-Person Helmet Visor HUD Overlay */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between overflow-hidden">
        {/* Authentic Curved Astronaut Visor Frame Vignette */}
        <div className="absolute inset-2 sm:inset-4 rounded-[36px] sm:rounded-[56px] border-2 border-amber-400/25 shadow-[inset_0_0_100px_rgba(245,158,11,0.08),0_0_50px_rgba(0,0,0,0.85)] pointer-events-none" />

        {/* Visor Optical Glare Accents */}
        <div className="absolute top-4 left-12 h-1 w-32 bg-gradient-to-r from-amber-400/35 to-transparent rounded-full" />
        <div className="absolute top-4 right-12 h-1 w-32 bg-gradient-to-l from-amber-400/35 to-transparent rounded-full" />
        <div className="absolute bottom-4 left-14 h-1 w-24 bg-gradient-to-r from-sky-400/25 to-transparent rounded-full" />
        <div className="absolute bottom-4 right-14 h-1 w-24 bg-gradient-to-l from-sky-400/25 to-transparent rounded-full" />

        {/* Top Center Artificial Horizon / Compass Tape */}
        <div className="pointer-events-none absolute top-4 inset-x-0 flex justify-center">
          <div className="flex flex-col items-center rounded-2xl border border-amber-400/30 bg-black/65 px-4 py-1.5 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-amber-300">
              <Compass className="h-3 w-3 text-amber-400 animate-spin" style={{ animationDuration: '24s' }} />
              <span>HDG {fpvTelemetry.heading.toString().padStart(3, '0')}°</span>
              <span className="text-white/20">|</span>
              <span>PITCH {fpvTelemetry.pitch >= 0 ? `+${fpvTelemetry.pitch}` : fpvTelemetry.pitch}°</span>
            </div>
            <span className="text-[8px] uppercase tracking-[0.24em] text-slate-400">
              Astronaut Visor Gyro • FPV Mode
            </span>
          </div>
        </div>

        {/* Center Targeting Reticle */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center pointer-events-none">
            <div className="h-16 w-16 rounded-full border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]" />
            <div className="absolute h-6 w-0.5 bg-amber-400/70" />
            <div className="absolute w-6 h-0.5 bg-amber-400/70" />
            <div className="absolute -top-6 text-[8px] font-mono tracking-widest text-amber-400/80">
              FPV VISOR
            </div>
            <div className="absolute -bottom-6 text-[8px] font-mono tracking-widest text-amber-300/80">
              DRAG TO LOOK
            </div>
          </div>
        </div>

        {/* Bottom Center Auto-Tether Telemetry & Exploration Hint */}
        <div className="pointer-events-auto mx-auto mb-20 flex flex-col items-center gap-1.5 px-4">
          <div className="flex items-center gap-2 rounded-2xl border border-amber-400/35 bg-black/80 px-4 py-2 backdrop-blur-md shadow-2xl">
            <Cable className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-bold text-white font-mono">
              Umbilical Tether: ~{tetherDist} m
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-400/30 animate-pulse">
              Auto-Spool Active
            </span>
            <span className="text-white/20">|</span>
            <span className="text-[10px] text-slate-300">
              Auto-extending up to {MAX_TETHER_CAPACITY}m
            </span>
          </div>

          <div className="text-[9px] font-medium uppercase tracking-widest text-slate-400">
            Drag mouse on screen to look around • [W/S/A/D] or [Arrows] to fly • Tether extends automatically
          </div>
        </div>
      </div>

      {/* Top HUD Header */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-5 sm:p-7">
        <div className="pointer-events-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              gameAudio.playClick();
              navigate('/missions');
            }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 backdrop-blur-md transition-colors hover:border-sky-400/60 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-sky-400" />
            <span>Missions</span>
          </button>

          <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-sky-400">
              <Radio className="h-3.5 w-3.5" />
              <span>Level 2</span>
            </div>
            <h1 className="mt-1 text-xl font-black tracking-[0.12em] text-white sm:text-2xl">
              MESSAGE OF EARTH
            </h1>
            <p className="mt-0.5 text-xs tracking-wider text-slate-300">
              Voyager 1 • Deep Interstellar Space (1977)
            </p>
          </div>
        </div>

        {/* Top Right Distant Entities Telemetry Triggers */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {/* Spacewalker Visor Status Badge */}
          <button
            type="button"
            onClick={() => {
              gameAudio.playClick();
              setIsAstroModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-black/60 px-3.5 py-2 text-xs font-semibold text-slate-200 backdrop-blur-md transition-all hover:border-amber-400 hover:bg-amber-950/40 hover:text-white cursor-pointer shadow-lg shadow-amber-950/40"
          >
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <Eye className="h-4 w-4 text-amber-400" />
            <div className="text-left">
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300">
                First-Person EVA
              </span>
              <span className="block text-xs font-bold text-white">
                Astronaut Visor
              </span>
            </div>
            <Cable className="h-3.5 w-3.5 text-amber-400 ml-1" />
          </button>

          {/* White Spaceship Telemetry Badge */}
          <button
            type="button"
            onClick={() => {
              gameAudio.playClick();
              setIsShipModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-black/60 px-3.5 py-2 text-xs font-semibold text-slate-200 backdrop-blur-md transition-all hover:border-sky-400 hover:bg-sky-950/40 hover:text-white cursor-pointer shadow-lg shadow-sky-950/40"
          >
            <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            <Rocket className="h-4 w-4 text-sky-400" />
            <div className="text-left">
              <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-sky-300">
                Home Tether Anchor
              </span>
              <span className="block text-xs font-bold text-white">
                White Spaceship
              </span>
            </div>
            <Info className="h-3.5 w-3.5 text-slate-400 ml-1" />
          </button>

          {/* Auto-Tether Status Pill */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/55 px-3.5 py-1.5 text-[11px] text-slate-300 backdrop-blur-md">
            <Cable className="h-3.5 w-3.5 text-amber-400" />
            <span>Wire Tether: <strong className="text-white">~{tetherDist} m</strong></span>
            <span className="text-white/20">|</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
              [Auto-Extending]
            </span>
          </div>
        </div>
      </header>

      {/* Floating Interactive On-Screen Arrow Click Controller */}
      <div className="pointer-events-none absolute right-5 bottom-24 z-30 flex flex-col items-center">
        <div className="pointer-events-auto flex flex-col items-center gap-1.5 rounded-3xl border border-sky-400/35 bg-black/75 p-3.5 backdrop-blur-md shadow-2xl shadow-sky-950/60">
          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.22em] text-sky-400">
            <Zap className="h-3 w-3 text-sky-400 animate-bounce" />
            <span>Astronaut EVA Thrusters</span>
          </div>

          {/* Up Arrow (Thrust Forward) */}
          <button
            type="button"
            onPointerDown={() => handleArrowPress('ArrowUp')}
            onPointerUp={() => handleArrowRelease('ArrowUp')}
            onPointerLeave={() => handleArrowRelease('ArrowUp')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-md transition-all hover:border-sky-400 hover:bg-sky-500 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Thrust Forward"
            title="Thrust Forward [Up Arrow / W]"
          >
            <ArrowUp className="h-5 w-5" />
          </button>

          {/* Left, Down, Right Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onPointerDown={() => handleArrowPress('ArrowLeft')}
              onPointerUp={() => handleArrowRelease('ArrowLeft')}
              onPointerLeave={() => handleArrowRelease('ArrowLeft')}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-md transition-all hover:border-sky-400 hover:bg-sky-500 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Thrust Left"
              title="Thrust Left [Left Arrow / A]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onPointerDown={() => handleArrowPress('ArrowDown')}
              onPointerUp={() => handleArrowRelease('ArrowDown')}
              onPointerLeave={() => handleArrowRelease('ArrowDown')}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-md transition-all hover:border-sky-400 hover:bg-sky-500 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Thrust Backward"
              title="Thrust Backward [Down Arrow / S]"
            >
              <ArrowDown className="h-5 w-5" />
            </button>

            <button
              type="button"
              onPointerDown={() => handleArrowPress('ArrowRight')}
              onPointerUp={() => handleArrowRelease('ArrowRight')}
              onPointerLeave={() => handleArrowRelease('ArrowRight')}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-md transition-all hover:border-sky-400 hover:bg-sky-500 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Thrust Right"
              title="Thrust Right [Right Arrow / D]"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Automatic Umbilical Tether Spool Status */}
          <div className="w-full mt-2 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[9px] font-bold tracking-wider">
              <span className="flex items-center gap-1 text-amber-400 uppercase">
                <Cable className="h-3 w-3" />
                <span>Umbilical Reel</span>
              </span>
              <span className="text-slate-300 font-mono">
                ~{tetherDist}m / {autoTetherLimit.toFixed(1)}m
              </span>
            </div>

            {/* Dynamic Auto-Spool Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${Math.min(100, (parseFloat(tetherDist) / MAX_TETHER_CAPACITY) * 100)}%` }}
              />
            </div>

            <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-center">
              <span className="block text-[8px] font-bold uppercase tracking-widest text-emerald-300">
                Auto-Extending On Movement
              </span>
            </div>
          </div>

          <div className="text-center pt-1">
            <span className="block text-[8px] font-bold text-slate-300 uppercase tracking-widest">
              [W/A/S/D] or [↑][↓][←][→] · [R] Face Voyager
            </span>
          </div>
        </div>
      </div>

      {/* Center Loading / Error State */}
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-sky-400/30 bg-black/75 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200 backdrop-blur-md">
            <span className="h-2.5 w-2.5 animate-ping rounded-full bg-sky-400" />
            <span>Loading Voyager 1 3D Model...</span>
          </div>
        </div>
      )}

      {loadError && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
          <div className="rounded-2xl border border-rose-500/40 bg-black/85 px-6 py-4 text-center text-sm text-rose-200 backdrop-blur-md">
            {loadError}
          </div>
        </div>
      )}

      {/* Bottom Center Re-Orient & Helper Bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex flex-col items-center gap-2 px-4">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/15 bg-black/70 px-4 py-2 backdrop-blur-md shadow-xl">
          <button
            type="button"
            onClick={handleFaceVoyager}
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 border border-sky-400/40 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-200 hover:bg-sky-500 hover:text-white transition-all cursor-pointer shadow-md"
            title="Orient helmet visor view directly toward Voyager 1 [R]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Face Voyager 1 [R]</span>
          </button>

          <span className="text-white/20">|</span>

          <span className="hidden sm:inline text-xs tracking-wide text-slate-300 font-medium">
            Drag mouse on screen to look around • Tether extends automatically as you fly
          </span>
        </div>
      </div>

      {/* Interactive Astronaut Spacewalk Telemetry Modal */}
      {isAstroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-amber-400/40 bg-gradient-to-b from-slate-900/95 via-[#181104]/95 to-slate-950/95 p-6 sm:p-8 text-white shadow-2xl shadow-amber-950/60">
            <button
              type="button"
              onClick={() => {
                gameAudio.playClick();
                setIsAstroModalOpen(false);
              }}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400">
                <User className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-amber-400">
                  EVA Telemetry • Spacewalker
                </span>
                <h2 className="text-xl font-black tracking-wide text-white sm:text-2xl">
                  First-Person Astronaut View
                </h2>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-300 sm:text-sm">
              You are performing an extra-vehicular spacewalk in deep interstellar space. The golden umbilical tether wire extends automatically as you venture toward Voyager 1, allowing unrestricted zero-g flight.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Umbilical Wire Tether
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Cable className="h-3.5 w-3.5" />
                  Auto-Spooling (~{tetherDist} m)
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Perspective
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Eye className="h-3.5 w-3.5" />
                  100% First-Person View
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Zero-G Thrusters
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-sky-300">
                  <Zap className="h-3.5 w-3.5" />
                  [W/A/S/D] or [Arrows]
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Max Reel Capacity
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  {MAX_TETHER_CAPACITY}.0 Meters
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  gameAudio.playClick();
                  setIsAstroModalOpen(false);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 cursor-pointer"
              >
                <span>Return to Visor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive White Medium-Poly Spaceship 3D Modal */}
      {isShipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-sky-400/40 bg-gradient-to-b from-slate-900/95 via-[#080d1e]/95 to-slate-950/95 p-6 sm:p-8 text-white shadow-2xl shadow-sky-950/60">
            <button
              type="button"
              onClick={() => {
                gameAudio.playClick();
                setIsShipModalOpen(false);
              }}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-400">
                <Rocket className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-sky-400">
                  Home Vessel • Tether Anchor
                </span>
                <h2 className="text-xl font-black tracking-wide text-white sm:text-2xl">
                  Deep Space Scout
                </h2>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-300 sm:text-sm">
              Your home exploratory spacecraft. The airlock umbilical winch is anchored here, automatically paying out safety line as you maneuver through deep interstellar space toward Voyager 1.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Hull Finish & Color
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-white">
                  <Shield className="h-3.5 w-3.5 text-sky-400" />
                  Aerospace White (TPS Ceramic)
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Spacewalk Tether Reel
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Cable className="h-3.5 w-3.5" />
                  Auto-Extend Active
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Relative Position
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-sky-300">
                  <Compass className="h-3.5 w-3.5" />
                  Behind & Anchor
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Propulsion System
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Zap className="h-3.5 w-3.5" />
                  Dual Hall Ion Drive
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  gameAudio.playClick();
                  setIsShipModalOpen(false);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-sky-500/25 transition-all hover:bg-sky-400 cursor-pointer"
              >
                <span>Return to Visor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
