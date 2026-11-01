import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Compass, 
  Eye, 
  Radio, 
  Shield, 
  Crosshair, 
  Layers, 
  Activity, 
  Sparkles, 
  Info, 
  ChevronRight,
  Maximize2,
  MousePointer,
  Volume2,
  Scan
} from 'lucide-react';
import { audio } from '../../game/audioManager';
import InvestigationModal from './InvestigationModal';

/**
 * LunarMapChapter1 — Historic Surveyor 1 Landing Site & Subterranean Anomaly
 * 
 * Features:
 * - 500m x 500m total terrain with natural boundary crater rims and steep basalt ridges
 * - 300m x 300m core playable area around historic Surveyor 1 (Oceanus Procellarum)
 * - Low-angle harsh solar lighting casting dramatic long vacuum shadows
 * - Pure black sky (#000000) with Earth hanging in the western sky, zero atmospheric haze
 * - Fully detailed 3D Surveyor 1 lander (frame, legs, footpads, Vidicon camera, solar array)
 * - Artemis 2126 forward recovery pod & telemetry hub
 * - Hidden subterranean fissure & alien precursor monolith chamber
 * - Astronaut first-person EVA movement with 1/6th lunar gravity jumping
 * - LIDAR pulse scanner ([F]) & interactive investigation dossier ([E])
 */
export default function LunarMapChapter1({ mcGender = 'male', onReturnMenu }) {
  const mountRef = useRef(null);

  // HUD & Game State
  const [isLocked, setIsLocked] = useState(false);
  const [activeObjective, setActiveObjective] = useState('Survey the historic Surveyor 1 touchdown site');
  const [distanceToSurveyor, setDistanceToSurveyor] = useState(0);
  const [distanceToAnomaly, setDistanceToAnomaly] = useState(0);
  const [compassHeading, setCompassHeading] = useState(0); // 0 to 360 deg
  const [isUnderground, setIsUnderground] = useState(false);
  const [scanPulseActive, setScanPulseActive] = useState(false);
  const [investigateTarget, setInvestigateTarget] = useState(null);
  const [nearInteractable, setNearInteractable] = useState(null);
  const [hudNotice, setHudNotice] = useState('Click to look around • WASD to walk • Space for Low-G Jump • [F] Scanner');

  // Suit Telemetry State
  const [oxygenLevel, setOxygenLevel] = useState(98.6);
  const [suitPower, setSuitPower] = useState(94.2);
  const [heartRate, setHeartRate] = useState(72);
  const [externalTemp, setExternalTemp] = useState(-118);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. SCENE SETUP — Pure Pitch Black Vacuum
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // 100% Black deep space, no atmospheric haze

    // 2. CAMERA — First-Person Astronaut Eye Level (1.75m)
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 2000);
    const EYE_HEIGHT = 1.75;
    camera.position.set(45, EYE_HEIGHT, 50); // Start near Artemis recovery craft looking towards Surveyor 1

    // 3. RENDERER WITH HIGH-CONTRAST PBR SHADOWS
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. LOW-ANGLE HARSH LUNAR SUNLIGHT & EARTHSHINE
    // Directional sunlight at ~18 degrees elevation casting long inky-black shadows
    const sunLight = new THREE.DirectionalLight(0xfffef5, 4.2);
    sunLight.position.set(240, 75, -180);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 650;
    const shadowSize = 220;
    sunLight.shadow.camera.left = -shadowSize;
    sunLight.shadow.camera.right = shadowSize;
    sunLight.shadow.camera.top = shadowSize;
    sunLight.shadow.camera.bottom = -shadowSize;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Subtle Earthshine ambient fill (cool bluish-grey, 0.28 intensity so shadowed areas have realistic vacuum contrast)
    const earthshineLight = new THREE.DirectionalLight(0x38bdf8, 0.35);
    earthshineLight.position.set(-180, 110, -220);
    scene.add(earthshineLight);

    const faintAmbient = new THREE.AmbientLight(0x181c24, 0.22);
    scene.add(faintAmbient);

    // 5. CELESTIAL ENVIRONMENT: STARS & DISTANT EARTH IN BLACK SKY
    // 3,500 non-twinkling stars across the deep black sky
    const starCount = 3500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 900 + Math.random() * 50;

      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = Math.abs(r * Math.cos(phi)) + 10; // Keep in upper hemisphere
      starPositions[i + 2] = r * Math.sin(phi) * Math.sin(theta);

      const isBright = Math.random() > 0.85;
      starColors[i] = isBright ? 1.0 : 0.75 + Math.random() * 0.25;
      starColors[i + 1] = isBright ? 1.0 : 0.75 + Math.random() * 0.25;
      starColors[i + 2] = 1.0;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.9, vertexColors: true });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // Distant Earth hanging in the western sky (Oceanus Procellarum viewpoint)
    const earthGroup = new THREE.Group();
    earthGroup.position.set(-240, 140, -320);

    const earthSphereGeo = new THREE.SphereGeometry(18, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x0c2552,
      roughness: 0.45,
      metalness: 0.2
    });
    const earthSphere = new THREE.Mesh(earthSphereGeo, earthMat);
    earthGroup.add(earthSphere);

    // Swirling white clouds layer
    const cloudsGeo = new THREE.SphereGeometry(18.25, 48, 48);
    const cloudsMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.8
    });
    const earthClouds = new THREE.Mesh(cloudsGeo, cloudsMat);
    earthGroup.add(earthClouds);

    // Delicate blue atmospheric haze glow ring around Earth
    const earthAtmosphereGeo = new THREE.SphereGeometry(19.2, 32, 32);
    const earthAtmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide
    });
    const earthAtmosphere = new THREE.Mesh(earthAtmosphereGeo, earthAtmosphereMat);
    earthGroup.add(earthAtmosphere);
    scene.add(earthGroup);

    // 6. PROCEDURAL 500m x 500m LUNAR TERRAIN & CRATER WALL NATURAL BOUNDARIES
    // Plane: 500 x 500 metres, 140x140 resolution
    const TERRAIN_SIZE = 500;
    const terrainGeo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, 140, 140);
    terrainGeo.rotateX(-Math.PI / 2);

    // Procedural terrain height generation with crater formulas & outer boundary mountain walls
    const posAttr = terrainGeo.attributes.position;
    const craterCenters = [
      { x: 0, z: 0, radius: 45, depth: 3.2, rimHeight: 1.4 }, // Surveyor 1 basin depression
      { x: 75, z: -65, radius: 28, depth: 4.8, rimHeight: 2.2 }, // South-East impact crater
      { x: -80, z: 60, radius: 35, depth: 5.5, rimHeight: 2.5 }, // North-West crater
      { x: -95, z: -110, radius: 22, depth: 6.2, rimHeight: 3.0 }, // Anomaly fissure basin
      { x: 120, z: 90, radius: 40, depth: 5.0, rimHeight: 2.4 } // East crater
    ];

    const getTerrainHeight = (x, z) => {
      const distFromCenter = Math.hypot(x, z);

      // Base gentle rolling maria swells
      let h = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 2.2
            + Math.sin(x * 0.045 + 1.2) * Math.sin(z * 0.045) * 1.1;

      // Crater impacts
      for (const c of craterCenters) {
        const d = Math.hypot(x - c.x, z - c.z);
        if (d < c.radius) {
          // Inner bowl
          const norm = d / c.radius;
          h -= Math.cos(norm * (Math.PI / 2)) * c.depth;
        } else if (d < c.radius * 1.5) {
          // Raised ejecta rim
          const rimDist = d - c.radius;
          const rimNorm = rimDist / (c.radius * 0.5);
          h += Math.sin(rimNorm * Math.PI) * c.rimHeight;
        }
      }

      // NATURAL BOUNDARIES: Beyond r > 160m, terrain rises steeply into impassable crater walls (25-45m high)
      if (distFromCenter > 150) {
        const boundaryDist = distFromCenter - 150;
        const wallFactor = Math.min(1.0, boundaryDist / 90);
        const wallRidgeNoise = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 6.0;
        h += Math.pow(wallFactor, 1.8) * 38.0 + wallRidgeNoise;
      }

      return h;
    };

    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      posAttr.setY(i, getTerrainHeight(vx, vz));
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x42454e,
      roughness: 0.96,
      metalness: 0.04,
      flatShading: false
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    scene.add(terrainMesh);

    // 7. BASALT ROCK BOULDERS & IMPACT EJECTA
    const rockGeoA = new THREE.DodecahedronGeometry(1.6, 1);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x33363f, roughness: 0.98, metalness: 0.05 });
    const rockClusterGroup = new THREE.Group();

    // Scatter 65 natural boulders across the landscape
    for (let i = 0; i < 65; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 15 + Math.random() * 180;
      const rx = Math.cos(angle) * dist;
      const rz = Math.sin(angle) * dist;
      const ry = getTerrainHeight(rx, rz);

      const scale = 0.5 + Math.random() * 2.2;
      const rock = new THREE.Mesh(rockGeoA, rockMat);
      rock.position.set(rx, ry + scale * 0.4, rz);
      rock.scale.set(scale * (0.8 + Math.random() * 0.4), scale * 0.7, scale * (0.8 + Math.random() * 0.4));
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rock.castShadow = true;
      rock.receiveShadow = true;
      rockClusterGroup.add(rock);
    }
    scene.add(rockClusterGroup);

    // 8. ACCURATE 3D HISTORIC SURVEYOR 1 LANDER (CENTERPIECE AT X:0, Z:0)
    const surveyorGroup = new THREE.Group();
    const surveyorTerrainY = getTerrainHeight(0, 0);
    surveyorGroup.position.set(0, surveyorTerrainY, 0);

    // Materials
    const matAluminum = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.25 });
    const matGoldFoil = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xb45309, emissiveIntensity: 0.2, metalness: 0.9, roughness: 0.3 });
    const matSolarPanel = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.2 });
    const matGlassOptic = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.4, roughness: 0.1 });

    // A. Triangular Tubular Space Frame Body
    const frameBody = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.4, 2.0, 3), matAluminum);
    frameBody.position.y = 2.1;
    frameBody.castShadow = true;
    surveyorGroup.add(frameBody);

    // B. Gold MLI Thermal Insulation Equipment Compartments
    const compA = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 0.9), matGoldFoil);
    compA.position.set(0.7, 1.8, 0.3);
    compA.castShadow = true;
    surveyorGroup.add(compA);

    const compB = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.8), matGoldFoil);
    compB.position.set(-0.7, 1.8, 0.3);
    compB.castShadow = true;
    surveyorGroup.add(compB);

    // C. 3 Articulated Tripod Landing Legs with Crushable Honeycomb Footpads
    for (let i = 0; i < 3; i++) {
      const legAngle = (i * Math.PI * 2) / 3;
      const legGroup = new THREE.Group();
      legGroup.rotation.y = legAngle;

      // Strut
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.8, 12), matAluminum);
      strut.position.set(0, 1.1, 2.2);
      strut.rotation.x = 0.65;
      strut.castShadow = true;
      legGroup.add(strut);

      // Hydraulic shock absorber
      const shock = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.8, 12), matAluminum);
      shock.position.set(0, 1.5, 1.6);
      shock.rotation.x = 0.4;
      legGroup.add(shock);

      // Circular crushable aluminum honeycomb footpad embedded in soil
      const footpad = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.18, 24), matAluminum);
      footpad.position.set(0, 0.1, 3.6);
      footpad.castShadow = true;
      legGroup.add(footpad);

      surveyorGroup.add(legGroup);
    }

    // Footpad 2 Soil Trench / Compression depression in lunar soil
    const trenchGeo = new THREE.CylinderGeometry(1.2, 1.6, 0.12, 16);
    const trenchMat = new THREE.MeshStandardMaterial({ color: 0x22242a, roughness: 0.99 });
    const footpadTrench = new THREE.Mesh(trenchGeo, trenchMat);
    footpadTrench.position.set(Math.cos((2 * Math.PI) / 3) * 3.6, 0.02, Math.sin((2 * Math.PI) / 3) * 3.6);
    surveyorGroup.add(footpadTrench);

    // D. Central Mast Assembly
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.4, 12), matAluminum);
    mast.position.y = 4.2;
    mast.castShadow = true;
    surveyorGroup.add(mast);

    // E. Planar Solar Array Panel angled towards the low morning sun
    const solarPanel = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 1.2), matSolarPanel);
    solarPanel.position.set(0, 5.8, 0.2);
    solarPanel.rotation.x = -0.32;
    solarPanel.rotation.y = 0.45;
    solarPanel.castShadow = true;
    surveyorGroup.add(solarPanel);

    // F. Steerable Vidicon TV Camera Turret with Motorized Mirror Housing
    const cameraTurret = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.9, 16), matAluminum);
    cameraTurret.position.set(0.65, 3.2, -0.65);
    cameraTurret.castShadow = true;
    surveyorGroup.add(cameraTurret);

    const cameraMirror = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.45, 0.1), matGlassOptic);
    cameraMirror.position.set(0.65, 3.75, -0.65);
    cameraMirror.rotation.x = -0.55;
    surveyorGroup.add(cameraMirror);

    // G. Two Omnidirectional Antennas extending outward
    for (let dir of [-1, 1]) {
      const antennaArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), matAluminum);
      antennaArm.position.set(dir * 1.8, 2.4, 0);
      antennaArm.rotation.z = dir * 1.1;
      antennaArm.castShadow = true;
      surveyorGroup.add(antennaArm);

      const antennaCone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 12), matGoldFoil);
      antennaCone.position.set(dir * 2.8, 2.9, 0);
      surveyorGroup.add(antennaCone);
    }

    // Historical NASA Heritage Site Floor Marker Ring
    const heritageRingGeo = new THREE.RingGeometry(5.5, 5.8, 48);
    const heritageRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const heritageRing = new THREE.Mesh(heritageRingGeo, heritageRingMat);
    heritageRing.rotation.x = -Math.PI / 2;
    heritageRing.position.y = 0.05;
    surveyorGroup.add(heritageRing);

    scene.add(surveyorGroup);

    // 9. ARTEMIS / AEGIS 2126 FORWARD RECOVERY POD & TELEMETRY HUB (X: 55, Z: 40)
    const podGroup = new THREE.Group();
    const podTerrainY = getTerrainHeight(55, 40);
    podGroup.position.set(55, podTerrainY, 40);

    // Modern faceted titanium exploration capsule
    const podBody = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 3.6, 3.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.25 })
    );
    podBody.position.y = 1.6;
    podBody.castShadow = true;
    podGroup.add(podBody);

    // Telemetry antenna dish
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.9, roughness: 0.2 })
    );
    dish.position.set(0, 3.8, 0);
    dish.rotation.x = -0.6;
    dish.castShadow = true;
    podGroup.add(dish);

    // Pulsing Cyan Beacon Light
    const podBeacon = new THREE.PointLight(0x06b6d4, 3.0, 30);
    podBeacon.position.set(0, 4.8, 0);
    podGroup.add(podBeacon);

    // Recovery Equipment Cases & Sample Storage
    for (let c = 0; c < 3; c++) {
      const boxCase = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.7, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
      );
      boxCase.position.set(4.2 + c * 0.9, 0.35, -1.5 + c * 0.6);
      boxCase.rotation.y = c * 0.3;
      boxCase.castShadow = true;
      podGroup.add(boxCase);
    }

    scene.add(podGroup);

    // 10. SUBTERRANEAN ANOMALOUS FISSURE & PRECURSOR CAVERN (X: -95, Z: -110)
    // Fissure Opening on the surface
    const fissureGroup = new THREE.Group();
    const fissureTerrainY = getTerrainHeight(-95, -110);
    fissureGroup.position.set(-95, fissureTerrainY, -110);

    // Jagged chasm rim
    const fissureChasmGeo = new THREE.BoxGeometry(14, 8, 26);
    const fissureChasmMat = new THREE.MeshStandardMaterial({ color: 0x0f1118, roughness: 0.95 });
    const fissureChasm = new THREE.Mesh(fissureChasmGeo, fissureChasmMat);
    fissureChasm.position.y = -3.8;
    fissureGroup.add(fissureChasm);

    // Anomalous electromagnetic shimmer effect (pulsing rings)
    const anomalyRings = [];
    for (let r = 0; r < 3; r++) {
      const anomRingGeo = new THREE.RingGeometry(3 + r * 2.5, 3.4 + r * 2.5, 32);
      const anomRingMat = new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const aRing = new THREE.Mesh(anomRingGeo, anomRingMat);
      aRing.rotation.x = -Math.PI / 2;
      aRing.position.y = -1.0 + r * 0.4;
      fissureGroup.add(aRing);
      anomalyRings.push(aRing);
    }

    // Fissure beacon tripod
    const fissureBeacon = new THREE.PointLight(0xa855f7, 4.0, 40);
    fissureBeacon.position.set(0, 1.5, 0);
    fissureGroup.add(fissureBeacon);

    scene.add(fissureGroup);

    // 11. HIDDEN UNDERGROUND ALIEN PRECURSOR CAVERN (Located beneath at Y: -45)
    const cavernGroup = new THREE.Group();
    const CAVERN_Y = -45;
    cavernGroup.position.set(-95, CAVERN_Y, -110);

    // Cavern floor & ceiling (Obsidian Basalt)
    const cavernFloorGeo = new THREE.CylinderGeometry(28, 32, 2, 24);
    const cavernMat = new THREE.MeshStandardMaterial({ color: 0x090a10, roughness: 0.3, metalness: 0.8 });
    const cavernFloor = new THREE.Mesh(cavernFloorGeo, cavernMat);
    cavernFloor.position.y = -1;
    cavernGroup.add(cavernFloor);

    const cavernCeil = new THREE.Mesh(cavernFloorGeo, cavernMat);
    cavernCeil.position.y = 18;
    cavernGroup.add(cavernCeil);

    // Hexagonal Basalt Columns around perimeter
    for (let i = 0; i < 16; i++) {
      const colAngle = (i * Math.PI * 2) / 16;
      const colDist = 24 + (i % 2) * 3;
      const colHeight = 16 + Math.sin(i) * 3;
      const column = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.6, colHeight, 6),
        new THREE.MeshStandardMaterial({ color: 0x11131f, roughness: 0.4, metalness: 0.7 })
      );
      column.position.set(Math.cos(colAngle) * colDist, colHeight / 2, Math.sin(colAngle) * colDist);
      cavernGroup.add(column);
    }

    // Central Floating Alien Precursor Monolith
    const monolithGeo = new THREE.BoxGeometry(2.4, 8.5, 1.6);
    const monolithMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      emissive: 0x6366f1,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.95
    });
    const monolith = new THREE.Mesh(monolithGeo, monolithMat);
    monolith.position.set(0, 5.5, 0);
    cavernGroup.add(monolith);

    // Monolith glowing geometric energy rings
    const monolithLight = new THREE.PointLight(0xa855f7, 5.0, 35);
    monolithLight.position.set(0, 5.5, 0);
    cavernGroup.add(monolithLight);

    // Glowing energy conduits in the floor radiating from the monolith
    for (let c = 0; c < 8; c++) {
      const conduitAngle = (c * Math.PI * 2) / 8;
      const conduitGeo = new THREE.PlaneGeometry(0.35, 22);
      const conduitMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      });
      const conduit = new THREE.Mesh(conduitGeo, conduitMat);
      conduit.rotation.x = -Math.PI / 2;
      conduit.rotation.z = conduitAngle;
      conduit.position.set(Math.cos(conduitAngle) * 11, 0.05, Math.sin(conduitAngle) * 11);
      cavernGroup.add(conduit);
    }

    scene.add(cavernGroup);

    // 12. INTERACTION POINTS DATABASE
    const interactables = [
      {
        id: 'surveyor_camera',
        title: 'Vidicon Television Camera Turret',
        position: new THREE.Vector3(0.65, surveyorTerrainY + 3.2, -0.65),
        radius: 4.2,
        sector: 'Surveyor 1 Touchdown Site',
        artifactAge: '160 Earth Years (1966 - 2126)',
        integrity: '92.4% Preserved Vacuum Patina',
        telemetryStatus: 'Recovered · 11,237 Historic Frames',
        image: '/images/surveyor1_moon_earth.jpg',
        description: 'Between June 2 and July 14, 1966, this motorized mirror television camera scanned the cratered plains of Oceanus Procellarum, proving that lunar dust would not swallow future Apollo astronauts.',
        readings: {
          'Lens Coating': 'Quartz / Fluoride (Solar Pitted)',
          'Filter Wheel': 'Red / Green / Blue / Clear (Locked)',
          'Frame Rate': '200 / 600 Scan Lines Vidicon',
          'Radiation Degradation': '14.2% Beta Pitting'
        },
        officerNote: 'Running my gloved fingers along the mirror shroud... 160 years ago, this camera was humanity’s only set of eyes on this world. We are walking where only radio waves once reached.'
      },
      {
        id: 'surveyor_footpad',
        title: 'Crushable Honeycomb Footpad #2',
        position: new THREE.Vector3(Math.cos((2 * Math.PI) / 3) * 3.6, surveyorTerrainY + 0.5, Math.sin((2 * Math.PI) / 3) * 3.6),
        radius: 4.0,
        sector: 'Surveyor 1 Soil Mechanics Zone',
        artifactAge: '160 Earth Years',
        integrity: '100% Intact Structure',
        telemetryStatus: 'Soil Compaction Validated',
        image: '/images/moon_close_up_telescope.jpg',
        description: 'Footpad 2 penetrated 5.2 cm into the lunar regolith at 3.05 m/s touchdown velocity. The displaced rim of powdery soil proved lunar maria could support human Apollo lunar modules.',
        readings: {
          'Regolith Bulk Density': '1.52 g/cm³',
          'Bearing Strength': '0.55 bar @ 5cm depth',
          'Grain Morphology': 'Agglutinate / Pyroxene shards',
          'Thermal Inertia': '0.0025 cal/(cm² s K)'
        },
        officerNote: 'The soil trench is as crisp today as when it touched down on June 2, 1966. No wind, no rain, no erosion—just timeless lunar silence.'
      },
      {
        id: 'surveyor_solar',
        title: 'Planar Solar Array Panel',
        position: new THREE.Vector3(0, surveyorTerrainY + 5.2, 0.2),
        radius: 4.5,
        sector: 'Surveyor 1 Power Mast',
        artifactAge: '160 Earth Years',
        integrity: '84.8% (Cosmic Darkened)',
        telemetryStatus: 'Photovoltaic Array',
        description: '792 silicon solar cells producing 89 Watts under full sunlight. Micrometeorite patina and cosmic ray tracking have darkened the protective covers.',
        readings: {
          'Cell Technology': 'N-on-P Silicon Single Crystal',
          'Micrometeorite Pits': '38.4 pits/m² (>10µm)',
          'Solar Output (Peak)': '89.2 W (June 1966)',
          'Modern Voltage': '0.00 V (Circuits Dormant)'
        },
        officerNote: 'The solar panel is still turned toward the low sun, faithful to the last telemetry command sent from Goldstone Deep Space Station.'
      },
      {
        id: 'aegis_pod',
        title: 'Artemis/Aegis Telemetry Hub',
        position: new THREE.Vector3(55, podTerrainY + 1.6, 40),
        radius: 5.5,
        sector: 'Forward Recovery Base (2126)',
        artifactAge: 'Current Expedition',
        integrity: '100% Operational',
        telemetryStatus: 'Cislunar Carrier Link Active',
        description: 'Deployed by Arin’s specialized NASA recovery team. Relays real-time high-bandwidth quantum telemetry to the orbital spacecraft overhead.',
        readings: {
          'Orbital Downlink': '48.2 Gbps Carrier Locked',
          'EVA Power Resupply': '100% Charged',
          'Vacuum Canisters': '8 Sealed Sample Units Ready',
          'Radiation Shielding': 'Polyethylene / Boron Composite'
        },
        officerNote: 'Our link back to the orbital carrier. From here, every grain of regolith and telemetry packet we log is transmitted to the archives back home.'
      },
      {
        id: 'anomaly_fissure_site',
        title: 'Subsurface Fissure & Seismic Rupture',
        position: new THREE.Vector3(-95, fissureTerrainY, -110),
        radius: 7.0,
        sector: 'Crater Ridge Fissure',
        artifactAge: 'Unknown Epoch',
        integrity: 'Active Anomaly Source',
        telemetryStatus: 'Harmonic 432 Hz Detected',
        description: 'A deep volcanic fracture exposing a subterranean lava tube. Suit magnetometers register a rhythmic, non-random electromagnetic pulse resonating from deep inside.',
        readings: {
          'Magnetic Flux': '142.6 nT (Anomalous Dipole)',
          'Resonant Frequency': '432.06 Hz Constant Wave',
          'Fissure Depth': '42 metres into basalt crust',
          'Thermal Signature': '+4.2°C Above Background'
        },
        officerNote: 'The suit sensors are going wild. This isn’t natural lunar geology. There’s something constructed beneath this ridge.'
      },
      {
        id: 'precursor_monolith_site',
        title: 'Extraterrestrial Precursor Monolith',
        position: new THREE.Vector3(-95, CAVERN_Y + 5.5, -110),
        radius: 6.5,
        sector: 'Subterranean Vault (Vault Zero)',
        artifactAge: 'Pre-Human / Unknown',
        integrity: 'Active Electromagnetic Levitation',
        telemetryStatus: 'Interstellar Vector Array',
        description: 'An ancient obsidian monolith hovering silently above energy conduits. Complex vector glyphs depict the solar system and an outward trajectory toward the Kuiper Belt.',
        readings: {
          'Material Composition': 'Uncatalogued Metallic Lattice',
          'Levitation Field': 'Repulsive Casimir-Force Gradient',
          'Acoustic Vibration': 'Sub-audible 432 Hz Harmonic',
          'Data Encoding': 'Quaternary Stellar Vector Coordinates'
        },
        officerNote: 'My god... we came here to recover humanity’s earliest 1966 robotic footprint, and we’ve discovered that someone else was watching our planet long before we ever looked up.'
      }
    ];

    // 13. FIRST-PERSON ASTRONAUT EVA PHYSICS & CONTROLS
    let pitch = 0;
    let yaw = Math.PI * 0.8; // Looking toward Surveyor 1 initially
    const keys = { w: false, s: false, a: false, d: false, shift: false, space: false };

    // Player Physical State (1/6th Lunar Gravity)
    let playerPos = new THREE.Vector3(45, EYE_HEIGHT, 50);
    let playerVelocityY = 0;
    let isGrounded = true;
    const LUNAR_GRAVITY = 6.2; // Adjusted for responsive gameplay feel (real 1.62m/s^2)
    const JUMP_STRENGTH = 4.8;
    let walkTimer = 0;
    let lastStepTime = 0;

    const onKeyDown = (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.w = true;
      if (code === 'KeyS' || code === 'ArrowDown') keys.s = true;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.a = true;
      if (code === 'KeyD' || code === 'ArrowRight') keys.d = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') keys.shift = true;
      if (code === 'Space') {
        keys.space = true;
        if (isGrounded) {
          playerVelocityY = JUMP_STRENGTH;
          isGrounded = false;
          audio.playJumpLunar();
        }
      }

      // Scanner Trigger [F]
      if (code === 'KeyF') {
        triggerScannerPulse();
      }

      // Interaction Trigger [E]
      if (code === 'KeyE') {
        triggerInvestigation();
      }
    };

    const onKeyUp = (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.w = false;
      if (code === 'KeyS' || code === 'ArrowDown') keys.s = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.a = false;
      if (code === 'KeyD' || code === 'ArrowRight') keys.d = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') keys.shift = false;
      if (code === 'Space') keys.space = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Mouse Look (Pointer Lock)
    const onMouseMove = (e) => {
      if (document.pointerLockElement !== renderer.domElement) return;
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      yaw -= movementX * 0.0022;
      pitch -= movementY * 0.0022;
      pitch = Math.max(-1.3, Math.min(1.3, pitch));
    };

    document.addEventListener('mousemove', onMouseMove);

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === renderer.domElement;
      setIsLocked(locked);
      if (locked) {
        setHudNotice('Look around with mouse • WASD to walk • Space to Jump • [F] Scan • [E] Interact');
      } else {
        setHudNotice('Click screen to activate Astronaut First-Person EVA controls');
      }
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);

    const handleCanvasClick = () => {
      if (document.pointerLockElement !== renderer.domElement) {
        renderer.domElement.requestPointerLock();
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Scanner Pulse Function
    const triggerScannerPulse = () => {
      audio.playScannerPing();
      setScanPulseActive(true);
      setTimeout(() => setScanPulseActive(false), 2400);
    };

    // Investigation Trigger
    const triggerInvestigation = () => {
      for (const item of interactables) {
        let targetCheckPos = item.position.clone();
        if (isUnderground && item.id !== 'precursor_monolith_site') continue;
        if (!isUnderground && item.id === 'precursor_monolith_site') continue;

        const dist = playerPos.distanceTo(targetCheckPos);
        if (dist < item.radius) {
          audio.playInteract();
          setInvestigateTarget(item);
          break;
        }
      }
    };

    // 14. ANIMATION & GAME SIMULATION LOOP
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.08);
      const time = clock.getElapsedTime();

      // Earth slow planetary rotation
      earthSphere.rotation.y += delta * 0.02;
      earthClouds.rotation.y += delta * 0.028;

      // Pulse anomaly rings
      anomalyRings.forEach((ring, idx) => {
        ring.scale.setScalar(1.0 + Math.sin(time * 3.0 + idx * 1.5) * 0.08);
        ring.rotation.z += delta * (0.2 + idx * 0.1);
      });

      // Monolith levitation bobbing & harmonic emission
      monolith.position.y = 5.5 + Math.sin(time * 1.8) * 0.35;
      monolith.rotation.y += delta * 0.15;
      monolithLight.intensity = 4.0 + Math.sin(time * 3.5) * 1.2;

      // Calculate forward and right vectors from camera yaw
      const forwardX = -Math.sin(yaw);
      const forwardZ = -Math.cos(yaw);
      const rightX = Math.cos(yaw);
      const rightZ = -Math.sin(yaw);

      let moveX = 0;
      let moveZ = 0;

      if (keys.w) { moveX += forwardX; moveZ += forwardZ; }
      if (keys.s) { moveX -= forwardX; moveZ -= forwardZ; }
      if (keys.a) { moveX -= rightX; moveZ -= rightZ; }
      if (keys.d) { moveX += rightX; moveZ += rightZ; }

      const isMoving = moveX !== 0 || moveZ !== 0;

      if (isMoving) {
        const len = Math.hypot(moveX, moveZ);
        moveX /= len;
        moveZ /= len;

        const speed = keys.shift ? 7.2 : 4.4; // Astronaut EVA jog vs walking pace
        playerPos.x += moveX * speed * delta;
        playerPos.z += moveZ * speed * delta;

        // Footstep audio when grounded
        if (isGrounded && time - lastStepTime > (keys.shift ? 0.32 : 0.48)) {
          audio.playFootstepLunar();
          lastStepTime = time;
        }
      }

      // Check for Transition into/out of Subterranean Precursor Cavern
      const distToFissure = Math.hypot(playerPos.x - (-95), playerPos.z - (-110));
      if (!isUnderground && distToFissure < 6.5) {
        // Step into fissure -> descend underground
        setIsUnderground(true);
        playerPos.set(-95, CAVERN_Y + 1.8, -125);
        playerVelocityY = 0;
        audio.playAnomalyHarmonic();
      } else if (isUnderground && distToFissure < 8.0 && playerPos.z > -105) {
        // Return to surface ramp
        setIsUnderground(false);
        playerPos.set(-95, fissureTerrainY + 2.0, -98);
        playerVelocityY = 0;
      }

      // Ground Height Calculation
      let targetGroundY;
      if (isUnderground) {
        targetGroundY = CAVERN_Y; // Cavern floor level
      } else {
        // Natural boundary clamp (r <= 210m so player cannot walk over outer crater rims)
        const distFromCenter = Math.hypot(playerPos.x, playerPos.z);
        if (distFromCenter > 208) {
          playerPos.x = (playerPos.x / distFromCenter) * 208;
          playerPos.z = (playerPos.z / distFromCenter) * 208;
        }
        targetGroundY = getTerrainHeight(playerPos.x, playerPos.z);
      }

      // Gravity & Jump Physics
      if (!isGrounded) {
        playerVelocityY -= LUNAR_GRAVITY * delta;
        playerPos.y += playerVelocityY * delta;

        if (playerPos.y <= targetGroundY + EYE_HEIGHT) {
          playerPos.y = targetGroundY + EYE_HEIGHT;
          playerVelocityY = 0;
          isGrounded = true;
          audio.playFootstepLunar();
        }
      } else {
        // Smooth terrain adherence
        const desiredY = targetGroundY + EYE_HEIGHT;
        playerPos.y += (desiredY - playerPos.y) * 0.35;
      }

      // First-person head bob
      if (isMoving && isGrounded) {
        walkTimer += delta * (keys.shift ? 12 : 8);
        camera.position.y = playerPos.y + Math.sin(walkTimer) * 0.045;
      } else {
        camera.position.y = playerPos.y + Math.sin(time * 1.5) * 0.012; // Breathing motion
      }

      camera.position.x = playerPos.x;
      camera.position.z = playerPos.z;

      // Update Camera Orientation
      const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
      camera.quaternion.setFromEuler(euler);

      // HUD Distance & Proximity Calculations
      const distSurveyor = Math.hypot(playerPos.x - 0, playerPos.z - 0);
      setDistanceToSurveyor(Math.round(distSurveyor));

      const distAnomaly = Math.hypot(playerPos.x - (-95), playerPos.z - (-110));
      setDistanceToAnomaly(Math.round(distAnomaly));

      // Compass Heading (Degrees 0 to 360)
      let headingDeg = THREE.MathUtils.radToDeg(-yaw) % 360;
      if (headingDeg < 0) headingDeg += 360;
      setCompassHeading(Math.round(headingDeg));

      // Check Nearby Interactable
      let foundInteract = null;
      for (const item of interactables) {
        let checkPos = item.position.clone();
        if (isUnderground && item.id !== 'precursor_monolith_site') continue;
        if (!isUnderground && item.id === 'precursor_monolith_site') continue;

        const d = playerPos.distanceTo(checkPos);
        if (d < item.radius) {
          foundInteract = item;
          break;
        }
      }
      setNearInteractable(foundInteract);

      // Dynamic Suit Telemetry simulation
      setOxygenLevel(prev => Math.max(92.0, +(prev - delta * 0.003).toFixed(2)));
      setSuitPower(prev => Math.max(88.0, +(prev - delta * 0.004).toFixed(2)));
      setHeartRate(isMoving ? (keys.shift ? 112 : 88) : 72);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('click', handleCanvasClick);
      }
      if (animId) cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden select-none cursor-crosshair font-mono bg-black text-slate-100">
      
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 h-full w-full" />

      {/* ASTRONAUT HELMET VISOR HUD OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-10">
        
        {/* Subtle Visor Curvature Vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, transparent 65%, rgba(0,0,0,0.5) 85%, rgba(6,182,212,0.06) 100%)'
          }}
        />

        {/* Reticle Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className={`transition-all duration-200 rounded-full border ${
              nearInteractable 
                ? 'w-10 h-10 border-cyan-400 bg-cyan-400/20 scale-125 animate-pulse'
                : 'w-2 h-2 border-cyan-400/80 bg-cyan-400/40'
            }`} />
            {nearInteractable && (
              <div className="absolute -top-6 text-[10px] text-cyan-300 font-bold tracking-widest uppercase bg-black/80 px-2 py-0.5 rounded border border-cyan-400/40">
                [E] INVESTIGATE
              </div>
            )}
          </div>
        </div>

        {/* TOP COMPASS TAPE & MISSION OBJECTIVE HUD */}
        <div className="absolute top-4 inset-x-6 flex items-start justify-between">
          
          {/* Compass & Objective */}
          <div className="space-y-2 pointer-events-auto max-w-md">
            
            {/* Top Compass Heading Tape */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-500/30 text-xs text-cyan-300 shadow-xl">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-widest">{compassHeading}°</span>
                <span className="text-slate-400 text-[10px]">
                  {compassHeading >= 338 || compassHeading < 23 ? 'NORTH' :
                   compassHeading >= 23 && compassHeading < 68 ? 'NORTH-EAST' :
                   compassHeading >= 68 && compassHeading < 113 ? 'EAST' :
                   compassHeading >= 113 && compassHeading < 158 ? 'SOUTH-EAST' :
                   compassHeading >= 158 && compassHeading < 203 ? 'SOUTH' :
                   compassHeading >= 203 && compassHeading < 248 ? 'SOUTH-WEST' :
                   compassHeading >= 248 && compassHeading < 293 ? 'WEST' : 'NORTH-WEST'}
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="text-[11px] text-slate-300">
                {isUnderground ? 'SUBTERRANEAN CAVERN' : 'OCEANUS PROCELLARUM'}
              </div>
            </div>

            {/* Active Objective Pill */}
            <div className="p-3 rounded-xl bg-black/85 backdrop-blur-md border border-cyan-500/40 shadow-xl text-xs space-y-1">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Primary Objective · Chapter 1</span>
              </div>
              <div className="text-white font-sans text-xs">
                {activeObjective}
              </div>
              
              {/* Waypoint Distances */}
              <div className="flex items-center gap-4 pt-1.5 text-[10px] text-slate-400">
                <div>SURVEYOR 1: <strong className="text-cyan-300">{distanceToSurveyor}m</strong></div>
                <div>ANOMALY: <strong className="text-purple-300">{distanceToAnomaly}m</strong></div>
              </div>
            </div>
          </div>

          {/* Top Right Suit Life Support Telemetry */}
          <div className="pointer-events-auto p-3.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 shadow-xl space-y-2 text-[11px] min-w-[200px]">
            <div className="flex items-center justify-between text-cyan-400 uppercase tracking-widest text-[10px] border-b border-white/10 pb-1">
              <span>NASA Mark VIII EVA</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Oxygen (O2):</span>
              <span className="text-cyan-300 font-bold">{oxygenLevel}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Suit Power:</span>
              <span className="text-emerald-400 font-bold">{suitPower}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Ext Temp:</span>
              <span className="text-sky-300 font-bold">{externalTemp}°C</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Heart Rate:</span>
              <span className="text-white font-bold">{heartRate} BPM</span>
            </div>
          </div>

        </div>

        {/* BOTTOM HUD INTERACTION CONTROLS */}
        <div className="absolute bottom-6 inset-x-6 flex items-end justify-between">
          
          {/* Controls Legend */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={triggerScannerPulse}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-md transition-all text-xs font-bold uppercase tracking-wider ${
                scanPulseActive 
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.8)]'
                  : 'bg-black/80 hover:bg-black text-cyan-300 border-cyan-500/40 hover:scale-105 active:scale-95'
              }`}
            >
              <Scan className="w-4 h-4" />
              <span>[F] LIDAR Scanner</span>
            </button>

            {nearInteractable && (
              <button
                type="button"
                onClick={triggerInvestigation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider border border-cyan-400 shadow-xl shadow-cyan-500/40 hover:scale-105 active:scale-95 animate-bounce"
              >
                <Crosshair className="w-4 h-4 text-cyan-200" />
                <span>[E] {nearInteractable.title}</span>
              </button>
            )}
          </div>

          {/* First-person lock notice */}
          {!isLocked && (
            <div className="pointer-events-auto px-4 py-2 rounded-xl bg-black/85 border border-cyan-500/40 text-xs text-slate-300 shadow-xl flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Click screen to lock mouse for First-Person Look</span>
            </div>
          )}

          {/* Low-G Jump Notice */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/75 border border-white/10 text-[10px] text-slate-400">
            <span>Lunar Low-Gravity Active (1.62 m/s²) · Hold [Shift] to Jog</span>
          </div>

        </div>

      </div>

      {/* SCANNER ACTIVE RADAR RING EFFECT OVERLAY */}
      {scanPulseActive && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div className="w-[85vw] h-[85vw] max-w-[800px] max-h-[800px] rounded-full border-2 border-cyan-400/60 shadow-[0_0_80px_rgba(6,182,212,0.4)] animate-ping" />
        </div>
      )}

      {/* INVESTIGATION DOSSIER MODAL */}
      {investigateTarget && (
        <InvestigationModal
          target={investigateTarget}
          onClose={() => setInvestigateTarget(null)}
          onLogData={(target) => {
            setActiveObjective(`Cataloged: ${target.title}. Continue exploring the sector.`);
          }}
        />
      )}

    </div>
  );
}
