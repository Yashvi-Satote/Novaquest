import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
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
  Scan,
  Trophy,
  CheckCircle2,
  MapPin,
  Clock,
  ListOrdered,
  X,
  Wifi
} from 'lucide-react';
import { audio } from '../../game/audioManager';
import InvestigationModal from './InvestigationModal';
import MissionEchoModal from './MissionEchoModal';
import { 
  createLunarRegolithTexture,
  createLunarBumpTexture,
  createLunarRoughnessTexture,
  createBasaltRockTexture,
  createGoldFoilTexture,
  createSolarPanelTexture,
  createAlienGlyphTexture,
  createRoverTrackTexture,
  createVisorDirtTexture,
  createGlowParticleTexture,
  createHazardStripeTexture,
  createCarbonFiberTexture,
  createScannerHUDTexture,
  createSpacesuitFabricTexture
} from '../../game/lunarTextures';

/**
 * 7-Stage Suggested Player Journey Framework
 * Guides the player through the map without making the level feel like a corridor.
 */
export const JOURNEY_STAGES = [
  {
    stepIndex: 0,
    id: 'spawn_landing',
    name: 'Spawn — Landing zone',
    durationEst: 'Approx. 2 minutes',
    zoneName: 'ZONE 1 · TEAM LANDING',
    targetCoords: { x: 104, z: 66 },
    waypointLabel: 'Landing Site Terminal',
    objective: 'Player exits the transport vehicle. The mission director explains the recovery objective.',
    narrative: 'Arin and the recovery team disembark from the Aegis-01 lunar rover. Radio comms verify life support systems and the primary mission objective: recovering Surveyor 1.',
    instructions: 'Debrief with Specialist Maya Chen and Officer Leo Vance at the mobile mission terminal. Familiarize with EVA movement, camera control, scanning, and objectives.',
    commsCallout: {
      callsign: 'GOLDSTONE-COMMS',
      speaker: 'Flight Director (Aegis Base)',
      text: 'Commander Arin, recovery team Aegis-01 is boots on the regolith. Surveyor 1 is 100 meters due West across the mare basin. Debrief with Chen and Vance at the mobile terminal, then proceed across the plains.'
    }
  },
  {
    stepIndex: 1,
    id: 'explore_surveyor',
    name: 'Explore — Surveyor 1',
    durationEst: 'Approx. 3–4 minutes',
    zoneName: 'ZONE 2 · SURVEYOR 1 RECOVERY',
    targetCoords: { x: 0, z: 0 },
    waypointLabel: 'Surveyor 1 Lander',
    objective: 'Player approaches the lander, scans its components and detects the anomalous transmission.',
    narrative: 'Arin navigates across the cratered lunar basin to Surveyor 1. Scanners audit the historic camera turret, solar array, and crushed footpads, detecting an anomalous 432 Hz carrier humming from beneath the lander.',
    instructions: 'Follow the rover tracks and footprint trails West to the Surveyor 1 site. Scan the historic Vidicon camera, solar mast, and footpads using [F] Scanner Pulse. Investigate the anomalous 432 Hz frequency detected beneath the spaceframe.',
    commsCallout: {
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: 'Arin, there she is. 160 Earth years untouched in the vacuum. Scan the camera turret, solar mast, and footpads. Wait... my suit magnetometer is registering an anomalous 432 Hz carrier humming directly beneath the spaceframe.'
    }
  },
  {
    stepIndex: 2,
    id: 'investigate_crater',
    name: 'Investigate — Crater',
    durationEst: 'Approx. 3 minutes',
    zoneName: 'ZONE 3 · CRATER INVESTIGATION',
    targetCoords: { x: -75, z: -50 },
    waypointLabel: 'Crater Investigation Basin',
    objective: 'Player follows the signal and examines three potential signal sources.',
    narrative: 'Following the 432 Hz carrier and a subtle subterranean conduit, Arin investigates the 24-meter impact crater. Scanning three distinct sites isolates the transmission epicenter.',
    instructions: 'Follow the 432 Hz signal and the dark cable conduit to the 24m crater. Examine Survey Site Alpha (rim outcrop), Survey Site Beta (inner scree slope), and Survey Site Gamma (buried precursor object) to isolate the harmonic epicenter.',
    commsCallout: {
      callsign: 'VANCE-OPS',
      speaker: 'Officer Leo Vance',
      text: 'The 432 Hz signal is intensifying toward that 24-meter impact crater at azimuth 295°. Check the rim outcrop, the scree slope, and the buried metallic signature at the crater floor.'
    }
  },
  {
    stepIndex: 3,
    id: 'discover_alien',
    name: 'Discover — Alien structure',
    durationEst: 'Approx. 2 minutes',
    zoneName: 'ZONE 4 · ALIEN STRUCTURE DISCOVERY',
    targetCoords: { x: -120, z: -75 },
    waypointLabel: 'Precursor Monolith',
    objective: 'Player finds the structure and activates its interface.',
    narrative: 'Beyond the crater rim along the basalt ridge, Arin discovers a partially buried geometric obsidian structure humming with synthetic vibration and glowing conduit lines.',
    instructions: 'Follow the exposed conduit northwest toward the basalt ridge to find the partially buried obsidian structure. Feel the bedrock synthetic vibration through your suit boots. Approach the Central Scanning Panel to interface with the array.',
    commsCallout: {
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: 'Good lord... Arin, do you see that? An obsidian geometric monolith buried in the lunar regolith. It’s drawing power directly from Surveyor’s landing site. Access the central scanning panel!'
    }
  },
  {
    stepIndex: 4,
    id: 'solve_echo',
    name: 'Solve — Mission Echo',
    durationEst: 'Approx. 7–10 minutes',
    zoneName: 'ZONE 5 · MISSION ECHO INTERFACE',
    targetCoords: { x: -116, z: -72 },
    waypointLabel: 'Mission Echo Array',
    objective: 'Player completes the three historical reconstruction puzzles.',
    narrative: 'Interfacing with the alien array projects a volumetric simulation of Surveyor 1\'s 1966 mission. Arin reconstructs the flight telemetry, optical panorama, and frequency archives.',
    instructions: 'Interact with the Mission Echo terminal [E]. Calibrate the 1966 Controlled Descent retro-burn, stitch the Vidicon 360° panoramic surface observation, and apply the 432.06 Hz harmonic notch filter to restore the corrupted telemetry archive.',
    commsCallout: {
      callsign: 'GOLDSTONE-COMMS',
      speaker: 'Flight Director (Aegis Base)',
      text: 'The alien interface is parsing Surveyor’s historical flight records. Complete the descent telemetry, align the Vidicon optics, and apply the 432 Hz notch filter to restore the archive.'
    }
  },
  {
    stepIndex: 5,
    id: 'recover_surveyor',
    name: 'Recover — Surveyor 1',
    durationEst: 'Approx. 3 minutes',
    zoneName: 'ZONE 6 · RECOVERY & EXTRACTION',
    targetCoords: { x: 0, z: 0 },
    waypointLabel: 'Surveyor 1 Recovery Rig',
    objective: 'Player disconnects the fictional alien feed, secures the archive and prepares the spacecraft for recovery.',
    narrative: 'With the alien interface solved, the dark conduit powers down. Arin returns to Surveyor 1 to disconnect the alien feed, lock the 11,237 restored frames into the Quantum Archive, and prep the recovery rig.',
    instructions: 'Return to Surveyor 1 where the recovery team has deployed the heavy robotic rig. Inspect the Recovery Rig to sever the alien feed, lock the 11,237 historic frames into the Quantum Archive Vault, and brace the lander on the extraction sled.',
    commsCallout: {
      callsign: 'VANCE-OPS',
      speaker: 'Officer Leo Vance',
      text: 'The alien conduit has powered down! Recovery rig is deployed at the landing site. Disconnect the alien link, lock the 11,237 restored frames into the Quantum Archive, and prep the sled.'
    }
  },
  {
    stepIndex: 6,
    id: 'end_next_signal',
    name: 'End — Next signal',
    durationEst: 'Approx. 1–2 minutes',
    zoneName: 'ZONE 6 · RECOVERY & EXTRACTION',
    targetCoords: { x: 3.8, z: -2.6 },
    waypointLabel: 'Secure Extraction Pallet',
    objective: 'The team discovers a new set of coordinates. Arin decides to continue Project Legacy.',
    narrative: 'Inspection of the decoded carrier wave reveals coordinates leading deep beneath the lunar surface to "Vault Zero". Arin commits the team to the next expedition of Project Legacy.',
    instructions: 'Inspect the Mobile Extraction Pallet [E]. Review the decrypted transmission vector, confirm the coordinates to Vault Zero, and commit Arin to the next chapter of Project Legacy.',
    commsCallout: {
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: 'Commander Arin... the carrier wave wasn’t random noise. It contained encrypted coordinates to an uncharted facility deep beneath the lunar crust: Vault Zero. We have to continue Project Legacy.'
    }
  }
];

export default function LunarMapChapter1({ mcGender = 'male', onReturnMenu }) {
  const mountRef = useRef(null);
  const nearInteractableRef = useRef(null);
  const isMissionEchoCompletedRef = useRef(false);
  const triggerSparksRef = useRef(null);
  const triggerScannerBeamRef = useRef(null);

  // HUD & Game State
  const [isLocked, setIsLocked] = useState(false);
  const [activeObjective, setActiveObjective] = useState(JOURNEY_STAGES[0].objective);
  const [activeZone, setActiveZone] = useState('ZONE 1 · TEAM LANDING');
  const [distanceToLanding, setDistanceToLanding] = useState(0);
  const [distanceToSurveyor, setDistanceToSurveyor] = useState(0);
  const [distanceToCrater, setDistanceToCrater] = useState(0);
  const [distanceToAlienStructure, setDistanceToAlienStructure] = useState(0);
  const [distanceToAnomaly, setDistanceToAnomaly] = useState(0);
  const [anomalousSignal, setAnomalousSignal] = useState(0); // 0 to 100% signal strength
  const [compassHeading, setCompassHeading] = useState(0); // 0 to 360 deg
  const [isUnderground, setIsUnderground] = useState(false);
  const [scanPulseActive, setScanPulseActive] = useState(false);
  const [investigateTarget, setInvestigateTarget] = useState(null);
  const [nearInteractable, setNearInteractable] = useState(null);
  const [hudNotice, setHudNotice] = useState('Click screen to look • WASD to walk • Space to Jump • [F] Scan • [E] Interact');

  // 7-Stage Suggested Player Journey State
  const [journeyStageIndex, setJourneyStageIndex] = useState(0);
  const [completedStageIndices, setCompletedStageIndices] = useState([]);
  const [activeComms, setActiveComms] = useState(null);
  const [showJourneyRoadmap, setShowJourneyRoadmap] = useState(false);
  const [navTargetBearing, setNavTargetBearing] = useState(264);
  const [navTargetDistance, setNavTargetDistance] = useState(105);

  const advanceJourneyStage = (nextIndex) => {
    setJourneyStageIndex((current) => {
      if (nextIndex <= current || nextIndex >= JOURNEY_STAGES.length) return current;
      const stage = JOURNEY_STAGES[nextIndex];
      if (stage) {
        setActiveObjective(stage.objective);
        if (stage.commsCallout) {
          setActiveComms(stage.commsCallout);
          audio.playRadioCommsChatter(stage.commsCallout.speaker.includes('Chen') ? 'chen' : stage.commsCallout.speaker.includes('Vance') ? 'vance' : 'director');
        }
      }
      setCompletedStageIndices(prev => Array.from(new Set([...prev, current])));
      return nextIndex;
    });
  };

  // Initial Spawn Transmission from Flight Director
  useEffect(() => {
    const timer = setTimeout(() => {
      const initialStage = JOURNEY_STAGES[0];
      if (initialStage && initialStage.commsCallout) {
        setActiveComms(initialStage.commsCallout);
        audio.playRadioCommsChatter('director');
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss comms toast after 14 seconds
  useEffect(() => {
    if (!activeComms) return;
    const timer = setTimeout(() => {
      setActiveComms(null);
    }, 14000);
    return () => clearTimeout(timer);
  }, [activeComms]);

  // Mission Echo & Extraction State
  const [isMissionEchoOpen, setIsMissionEchoOpen] = useState(false);
  const [isMissionEchoCompleted, setIsMissionEchoCompleted] = useState(false);
  const [showChapter1Completion, setShowChapter1Completion] = useState(false);

  // Suit Telemetry State
  const [oxygenLevel, setOxygenLevel] = useState(98.6);
  const [suitPower, setSuitPower] = useState(94.2);
  const [heartRate, setHeartRate] = useState(72);
  const [externalTemp, setExternalTemp] = useState(-118);
  const [sunGlareIntensity, setSunGlareIntensity] = useState(0); // 0 to 1 based on sun angle

  // Component-scoped triggers accessible both from keydown and HUD buttons
  const triggerScannerPulse = () => {
    if (activeZone && activeZone.includes('CRATER')) {
      audio.playCraterScannerPulse();
    } else {
      audio.playScannerPing();
    }
    setScanPulseActive(true);
    triggerScannerBeamRef.current?.();
    setTimeout(() => setScanPulseActive(false), 2400);
  };

  const triggerInvestigation = () => {
    if (nearInteractableRef.current) {
      const id = nearInteractableRef.current.id;
      if (id === 'poi_scanning_panel' || id === 'poi_mission_echo_console' || id === 'poi_descent_simulation') {
        audio.playMissionEchoActivation();
        setTimeout(() => audio.playMissionEchoArchivalAudio(), 320);
        if (triggerSparksRef.current && nearInteractableRef.current.position) {
          triggerSparksRef.current(nearInteractableRef.current.position);
        }
        setIsMissionEchoOpen(true);
      } else if (id && id.startsWith('surveyor_')) {
        audio.playSurveyorScannerBeep();
        setTimeout(() => audio.playSurveyorInterface(), 260);
        setInvestigateTarget(nearInteractableRef.current);
      } else if (id === 'poi_mission_terminal' || id === 'poi_lunar_transport') {
        audio.playEquipmentFeedback();
        setTimeout(() => audio.playRadioCommsChatter('chen'), 420);
        setInvestigateTarget(nearInteractableRef.current);
      } else if (id === 'poi_maya_chen') {
        audio.playRadioCommsChatter('chen');
        setInvestigateTarget(nearInteractableRef.current);
      } else if (id === 'poi_leo_vance') {
        audio.playRadioCommsChatter('vance');
        setInvestigateTarget(nearInteractableRef.current);
      } else if (id && id.startsWith('poi_crater_')) {
        audio.playCraterInterference(0.9);
        setTimeout(() => audio.playCraterScannerPulse(), 220);
        setInvestigateTarget(nearInteractableRef.current);
      } else if (id === 'poi_alien_structure' || id === 'poi_data_conduit') {
        audio.playAnomalyHarmonic();
        setInvestigateTarget(nearInteractableRef.current);
      } else if (id === 'poi_extraction_pallet' && isMissionEchoCompletedRef.current) {
        audio.playEquipmentFeedback();
        setShowChapter1Completion(true);
        setInvestigateTarget(nearInteractableRef.current);
      } else {
        audio.playInteract();
        setInvestigateTarget(nearInteractableRef.current);
      }
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth || 800;
    let height = container.clientHeight || window.innerHeight || 600;
    if (width <= 0) width = 800;
    if (height <= 0) height = 600;

    // 1. SCENE SETUP — Pure Pitch Black Vacuum
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // 100% Black deep space, no atmospheric haze

    // GLTF & DRACO Loaders for official NASA 3D Resources
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // 2. PROCEDURAL HIGH-RESOLUTION PBR TEXTURES (GENERATED IN-MEMORY WITHOUT EXTERNAL NETWORK ASSETS)
    const regolithMap = createLunarRegolithTexture(1024, 1024);
    const regolithBumpMap = createLunarBumpTexture(512, 512);
    const regolithRoughnessMap = createLunarRoughnessTexture(512, 512);
    const basaltRockMap = createBasaltRockTexture(512, 512);
    const goldFoilMap = createGoldFoilTexture(512, 512);
    const solarPanelMap = createSolarPanelTexture(512, 512);
    const alienGlyphMap = createAlienGlyphTexture(512, 512);
    const roverTrackMap = createRoverTrackTexture(256, 512);
    const dustParticleTex = createGlowParticleTexture(64);
    const hazardStripeMap = createHazardStripeTexture(256, 256);
    const carbonFiberMap = createCarbonFiberTexture(256, 256);
    const scannerScreenMap = createScannerHUDTexture(512, 512);
    const spacesuitFabricMap = createSpacesuitFabricTexture(512, 512);

    // 3. CAMERA — First-Person Astronaut Eye Level (1.75m)
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 2000);
    const EYE_HEIGHT = 1.75;
    camera.position.set(104, EYE_HEIGHT, 66); // Start at Zone 1 Team Landing Zone looking West toward Surveyor 1

    // HIGH-DETAIL FIRST-PERSON 3D SCI-FI SCANNER VIEWMODEL
    const fpScannerGroup = new THREE.Group();
    fpScannerGroup.position.set(0.24, -0.22, -0.46);
    fpScannerGroup.rotation.set(-0.12, -0.16, 0.05);

    // Scanner main body chassis with Carbon-Fiber composite casing
    const scannerChassisMat = new THREE.MeshStandardMaterial({
      map: carbonFiberMap,
      color: 0x1e293b,
      metalness: 0.88,
      roughness: 0.28
    });
    const scannerChassis = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.24), scannerChassisMat);
    fpScannerGroup.add(scannerChassis);

    // Ergonomic rubberized thumb-rest grip handle
    const scannerGrip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.026, 0.15, 12),
      new THREE.MeshStandardMaterial({ color: 0x0a0d14, roughness: 0.95 })
    );
    scannerGrip.position.set(0, -0.12, -0.03);
    scannerGrip.rotation.x = 0.22;
    fpScannerGroup.add(scannerGrip);

    // Lateral Heat-Sink Cooling Vents with Copper Radiator Fins
    for (const sx of [-0.062, 0.062]) {
      const ventPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.008, 0.08, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.92, roughness: 0.2 })
      );
      ventPlate.position.set(sx, 0.02, 0.02);
      fpScannerGroup.add(ventPlate);
    }

    // Beveled Top Display Screen Housing with Status LEDs
    const scannerScreenHousing = new THREE.Mesh(
      new THREE.BoxGeometry(0.105, 0.018, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.2 })
    );
    scannerScreenHousing.position.set(0, 0.082, 0.01);
    scannerScreenHousing.rotation.x = 0.32;
    fpScannerGroup.add(scannerScreenHousing);

    // High-Resolution Tactical HUD Display Screen
    const scannerScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.095, 0.105),
      new THREE.MeshBasicMaterial({ map: scannerScreenMap })
    );
    scannerScreen.position.set(0, 0.093, 0.01);
    scannerScreen.rotation.x = -Math.PI / 2 + 0.32;
    fpScannerGroup.add(scannerScreen);

    // Multi-Stage Forward LIDAR Emitter Collar & Lens Barrel
    const emitterBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.046, 0.08, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.94, roughness: 0.15 })
    );
    emitterBarrel.rotation.x = Math.PI / 2;
    emitterBarrel.position.set(0, 0.02, 0.15);
    fpScannerGroup.add(emitterBarrel);

    // Stepped Brass Waveguide Induction Coil
    const coil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.03, 16),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.25 })
    );
    coil.rotation.x = Math.PI / 2;
    coil.position.set(0, 0.02, 0.13);
    fpScannerGroup.add(coil);

    // Glowing Emitter Focal Lens Ring
    const emitterLensMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const emitterLens = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.014, 16), emitterLensMat);
    emitterLens.rotation.x = Math.PI / 2;
    emitterLens.position.set(0, 0.02, 0.192);
    fpScannerGroup.add(emitterLens);

    // Twin Articulated Directional Waveguide Antenna Prongs
    for (const px of [-0.046, 0.046]) {
      const prong = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.12, 8),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.12 })
      );
      prong.rotation.x = Math.PI / 2;
      prong.position.set(px, 0.035, 0.16);
      fpScannerGroup.add(prong);

      const prongTip = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      prongTip.position.set(px, 0.035, 0.22);
      fpScannerGroup.add(prongTip);
    }

    // Scanner Forward Projection PointLight
    const scannerSpot = new THREE.PointLight(0x06b6d4, 1.4, 10);
    scannerSpot.position.set(0, 0.03, 0.24);
    fpScannerGroup.add(scannerSpot);

    camera.add(fpScannerGroup);
    scene.add(camera);

    // 3. RENDERER WITH HIGH-CONTRAST PBR SHADOWS
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      renderer = new THREE.WebGLRenderer();
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // Sharp shadow edges (authentic vacuum shadows, no atmospheric blur)
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35; // High dynamic range
    container.appendChild(renderer.domElement);

    // 4. LOW-ANGLE HARSH LUNAR SUNLIGHT & EARTHSHINE (VACUUM EXPOSURE)
    // One strong directional light representing the Sun at low elevation (~14.4 deg) casting long, sharp, inky shadows
    const sunLight = new THREE.DirectionalLight(0xfffef2, 5.5);
    sunLight.position.set(290, 72, -180);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 700;
    const shadowSize = 240;
    sunLight.shadow.camera.left = -shadowSize;
    sunLight.shadow.camera.right = shadowSize;
    sunLight.shadow.camera.top = shadowSize;
    sunLight.shadow.camera.bottom = -shadowSize;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.radius = 1; // Sharp shadow edges
    scene.add(sunLight);

    // Stark high-contrast vacuum lighting: Zero atmosphere to scatter sunlight.
    // Earthshine is the only subtle indirect fill light on shadow-facing terrain (cool blue-grey)
    const earthshineLight = new THREE.DirectionalLight(0x38bdf8, 0.14);
    earthshineLight.position.set(-260, 125, -340);
    scene.add(earthshineLight);

    // Near-zero ambient light (0.04) ensuring deep, inky vacuum shadows with extreme contrast
    const faintAmbient = new THREE.AmbientLight(0x04060a, 0.04);
    scene.add(faintAmbient);

    // 5. CELESTIAL ENVIRONMENT: BLACK SKY, SPARSE STARS & DISTANT SUBTLE EARTH
    // Under harsh unfiltered lunar sunlight, only a few pinpoint non-twinkling stars are visible
    const starCount = 650;
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
      starPositions[i + 1] = Math.abs(r * Math.cos(phi)) + 12; // Keep in upper hemisphere
      starPositions[i + 2] = r * Math.sin(phi) * Math.sin(theta);

      const isBright = Math.random() > 0.88;
      starColors[i] = isBright ? 0.95 : 0.65 + Math.random() * 0.2;
      starColors[i + 1] = isBright ? 0.95 : 0.65 + Math.random() * 0.2;
      starColors[i + 2] = 1.0;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.85, vertexColors: true });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // Distant Earth hanging subtly in the western sky (small blue-white marble, not dominating)
    const earthGroup = new THREE.Group();
    earthGroup.position.set(-260, 125, -340);

    const earthSphereGeo = new THREE.SphereGeometry(6.5, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x081f44,
      roughness: 0.55,
      metalness: 0.05
    });
    const earthSphere = new THREE.Mesh(earthSphereGeo, earthMat);
    earthGroup.add(earthSphere);

    // Swirling white clouds layer
    const cloudsGeo = new THREE.SphereGeometry(6.62, 48, 48);
    const cloudsMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.42,
      roughness: 0.85
    });
    const earthClouds = new THREE.Mesh(cloudsGeo, cloudsMat);
    earthGroup.add(earthClouds);

    // Delicate subtle blue atmospheric haze glow ring around Earth
    const earthAtmosphereGeo = new THREE.SphereGeometry(6.95, 32, 32);
    const earthAtmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    });
    const earthAtmosphere = new THREE.Mesh(earthAtmosphereGeo, earthAtmosphereMat);
    earthGroup.add(earthAtmosphere);
    scene.add(earthGroup);

    // Astronaut EVA Footprint Decal System (Initialized early for all zones & movement)
    const bootprintGroup = new THREE.Group();
    scene.add(bootprintGroup);
    const bootprintGeo = new THREE.PlaneGeometry(0.32, 0.68);
    bootprintGeo.rotateX(-Math.PI / 2);
    const bootprintMat = new THREE.MeshStandardMaterial({
      map: roverTrackMap,
      color: 0x1f2127,
      roughness: 0.99,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1.0
    });
    const maxBootprints = 35;
    const bootprints = [];
    let footStepToggle = false;

    // 7. MEDIUM-POLY 500m x 500m LUNAR TERRAIN & NATURAL BOUNDARY CRATER WALLS
    // 200x200 resolution = 40,000 vertices, 80,000 faces (crisp medium-poly terrain)
    const TERRAIN_SIZE = 500;
    const terrainGeo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, 200, 200);
    terrainGeo.rotateX(-Math.PI / 2);

    // THREE DISTINCT CRATER SIZES & IRREGULAR NON-CIRCULAR RIMS
    // 1. Medium Craters: 15–25 metres wide (used for investigation & major landmarks)
    const mediumCraters = [
      { x: 0, z: 0, radius: 11.0, depth: 2.4, rimHeight: 0.95, seed: 1.25 }, // Zone 2: Surveyor 1 Landing Basin (22m wide)
      { x: -75, z: -50, radius: 12.0, depth: 5.2, rimHeight: 1.85, seed: 3.72 }, // Zone 3: Crater Investigation Area (24m wide)
      { x: 55, z: -45, radius: 9.5, depth: 3.2, rimHeight: 1.15, seed: 2.14 }, // South-East Mare Impact (19m wide)
      { x: -45, z: 55, radius: 10.2, depth: 3.6, rimHeight: 1.35, seed: 4.51 }, // West Ridge Depression (20.4m wide)
      { x: 80, z: 75, radius: 8.8, depth: 2.8, rimHeight: 1.05, seed: 5.83 }, // North-East Impact (17.6m wide)
      { x: -95, z: -105, radius: 11.2, depth: 4.4, rimHeight: 1.55, seed: 0.92 } // Anomaly Fissure Basin (22.4m wide)
    ];

    // 2. Small Craters: 2–5 metres wide (mostly decorative pockmarks scattered across the terrain)
    const smallCraters = [
      { x: 22, z: 18, radius: 1.6, depth: 0.45, rimHeight: 0.16, seed: 0.3 },
      { x: -28, z: -22, radius: 2.2, depth: 0.72, rimHeight: 0.24, seed: 1.1 },
      { x: 38, z: 42, radius: 1.9, depth: 0.58, rimHeight: 0.20, seed: 2.4 },
      { x: -52, z: 14, radius: 2.4, depth: 0.82, rimHeight: 0.28, seed: 3.6 },
      { x: 68, z: 18, radius: 1.8, depth: 0.52, rimHeight: 0.18, seed: 4.9 },
      { x: 12, z: -34, radius: 2.1, depth: 0.68, rimHeight: 0.22, seed: 5.2 },
      { x: -16, z: -46, radius: 1.5, depth: 0.42, rimHeight: 0.14, seed: 6.1 },
      { x: 44, z: -72, radius: 2.3, depth: 0.78, rimHeight: 0.26, seed: 1.7 },
      { x: -62, z: -76, radius: 2.0, depth: 0.64, rimHeight: 0.21, seed: 2.8 },
      { x: -98, z: -48, radius: 1.7, depth: 0.48, rimHeight: 0.17, seed: 3.9 },
      { x: 92, z: -18, radius: 2.2, depth: 0.70, rimHeight: 0.23, seed: 4.2 },
      { x: -36, z: 82, radius: 2.5, depth: 0.85, rimHeight: 0.29, seed: 5.5 },
      { x: 16, z: 62, radius: 1.4, depth: 0.38, rimHeight: 0.13, seed: 6.4 },
      { x: -84, z: -24, radius: 2.1, depth: 0.66, rimHeight: 0.22, seed: 0.8 },
      { x: 58, z: 52, radius: 1.8, depth: 0.54, rimHeight: 0.18, seed: 1.9 },
      { x: -8, z: 28, radius: 1.3, depth: 0.35, rimHeight: 0.12, seed: 2.7 },
      { x: -104, z: -78, radius: 2.3, depth: 0.75, rimHeight: 0.25, seed: 3.4 },
      { x: 32, z: -48, radius: 1.6, depth: 0.46, rimHeight: 0.15, seed: 4.7 },
      { x: -68, z: 36, radius: 2.2, depth: 0.69, rimHeight: 0.23, seed: 5.1 },
      { x: 84, z: 38, radius: 1.9, depth: 0.56, rimHeight: 0.19, seed: 6.3 },
      { x: -38, z: -12, radius: 1.5, depth: 0.40, rimHeight: 0.14, seed: 0.6 },
      { x: 6, z: -68, radius: 2.4, depth: 0.80, rimHeight: 0.27, seed: 1.5 },
      { x: -112, z: -38, radius: 1.8, depth: 0.50, rimHeight: 0.17, seed: 2.6 },
      { x: 26, z: 86, radius: 2.0, depth: 0.62, rimHeight: 0.21, seed: 3.8 }
    ];

    // 3. Distant Craters & Massifs: Large silhouettes along the map boundary (r > 150m)
    const distantMassifs = [
      { x: 0, z: -210, radius: 68, rimHeight: 28, seed: 1.7 },
      { x: -190, z: -140, radius: 76, rimHeight: 33, seed: 2.9 },
      { x: -160, z: 180, radius: 72, rimHeight: 27, seed: 4.1 },
      { x: 170, z: 170, radius: 82, rimHeight: 31, seed: 5.3 },
      { x: 210, z: -60, radius: 66, rimHeight: 29, seed: 3.4 }
    ];

    // Helper to evaluate irregular (non-circular) crater rim perturbation
    const applyCrater = (x, z, c, currentHeight) => {
      const dx = x - c.x;
      const dz = z - c.z;
      const d = Math.hypot(dx, dz);
      // Angular harmonic perturbation ensures non-circular, scalloped crater rims
      const angle = Math.atan2(dz, dx);
      const rimPerturb = 1.0
        + 0.14 * Math.sin(3 * angle + c.seed)
        + 0.08 * Math.cos(5 * angle + 1.6 * c.seed)
        + 0.04 * Math.sin(7 * angle);
      const effRadius = c.radius * rimPerturb;

      if (d < effRadius) {
        const norm = d / effRadius;
        return currentHeight - Math.cos(norm * (Math.PI / 2)) * c.depth;
      } else if (d < effRadius * 1.52) {
        const rimDist = d - effRadius;
        const rimNorm = rimDist / (effRadius * 0.52);
        // Asymmetric raised ejecta crest
        const rimAsymmetry = 1.0 + 0.24 * Math.sin(4 * angle + c.seed);
        return currentHeight + Math.sin(rimNorm * Math.PI) * c.rimHeight * rimAsymmetry;
      }
      return currentHeight;
    };

    const getTerrainHeight = (x, z) => {
      const distFromCenter = Math.hypot(x, z);

      // Multi-scale undulating lunar regolith (avoids smooth flat ground everywhere)
      let h = Math.sin(x * 0.016) * Math.cos(z * 0.015) * 2.8
            + Math.sin(x * 0.038 + 1.1) * Math.cos(z * 0.036 + 0.5) * 1.45
            + Math.sin(x * 0.082 + 0.4) * Math.sin(z * 0.078 + 0.9) * 0.68
            + Math.cos(x * 0.16) * Math.sin(z * 0.15 + 1.2) * 0.28;

      // 1. Medium crater impacts (Surveyor 1 basin, Zone 3 crater, etc.)
      for (const mc of mediumCraters) {
        h = applyCrater(x, z, mc, h);
      }

      // 2. Small decorative impact craters (2–5m pockmarks)
      for (const sc of smallCraters) {
        h = applyCrater(x, z, sc, h);
      }

      // 3. Distant boundary crater silhouettes (r > 150m)
      for (const dm of distantMassifs) {
        const dx = x - dm.x;
        const dz = z - dm.z;
        const d = Math.hypot(dx, dz);
        const angle = Math.atan2(dz, dx);
        const effR = dm.radius * (1.0 + 0.12 * Math.sin(3 * angle + dm.seed));
        if (d < effR * 1.45 && d > effR * 0.6) {
          const rimDist = Math.abs(d - effR);
          const factor = Math.max(0, 1.0 - rimDist / (effR * 0.45));
          h += Math.sin(factor * (Math.PI / 2)) * dm.rimHeight * (1.0 + 0.2 * Math.cos(4 * angle));
        }
      }

      // NATURAL BOUNDARIES: Beyond r > 150m, terrain rises into impassable mountain massifs (25-45m high)
      if (distFromCenter > 150) {
        const boundaryDist = distFromCenter - 150;
        const wallFactor = Math.min(1.0, boundaryDist / 90);
        // Jagged rocky silhouette ridges against pitch black sky
        const jaggedRidge = Math.sin(x * 0.055) * Math.cos(z * 0.052) * 7.5
                          + Math.sin(x * 0.12 + 1.5) * Math.sin(z * 0.11 + 0.7) * 3.5;
        h += Math.pow(wallFactor, 1.85) * 42.0 + jaggedRidge;
      }

      return h;
    };

    // Evaluate medium-poly vertices and compute geological elevation coloring
    const posAttr = terrainGeo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const vy = getTerrainHeight(vx, vz);
      posAttr.setY(i, vy);

      // Vertex color gradient: darker mare basalt in basins, lighter ejecta dust on rims
      const normHeight = Math.max(0, Math.min(1, (vy + 8) / 38));
      const col = new THREE.Color().setHSL(0.62, 0.03, 0.23 + normHeight * 0.19);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    // Medium-Poly Textured Terrain Material (Authentic Dusty Grey Lunar Regolith)
    const terrainMat = new THREE.MeshStandardMaterial({
      map: regolithMap,
      bumpMap: regolithBumpMap,
      bumpScale: 0.28,
      roughnessMap: regolithRoughnessMap,
      roughness: 0.98,
      metalness: 0.01,
      vertexColors: true
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    scene.add(terrainMesh);

    // 8. ROVER TIRE TRACKS & ASTRONAUT TRAIL DECALS (Medium-Poly Mesh Ribbons)
    const createTrackRibbon = (points, width = 1.6) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const sampled = curve.getPoints(80);
      const ribbonGeo = new THREE.BufferGeometry();
      const numVerts = (sampled.length - 1) * 6;
      const positions = new Float32Array(numVerts * 3);
      const uvs = new Float32Array(numVerts * 2);

      let pIdx = 0;
      let uvIdx = 0;

      for (let i = 0; i < sampled.length - 1; i++) {
        const p1 = sampled[i];
        const p2 = sampled[i + 1];

        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        const normal = new THREE.Vector3(0, 1, 0);
        const side = new THREE.Vector3().crossVectors(dir, normal).normalize().multiplyScalar(width * 0.5);

        const y1 = getTerrainHeight(p1.x, p1.z) + 0.035;
        const y2 = getTerrainHeight(p2.x, p2.z) + 0.035;

        const v0 = new THREE.Vector3(p1.x - side.x, y1, p1.z - side.z);
        const v1 = new THREE.Vector3(p1.x + side.x, y1, p1.z + side.z);
        const v2 = new THREE.Vector3(p2.x - side.x, y2, p2.z - side.z);
        const v3 = new THREE.Vector3(p2.x + side.x, y2, p2.z + side.z);

        // Quad 1: v0, v1, v2
        positions[pIdx++] = v0.x; positions[pIdx++] = v0.y; positions[pIdx++] = v0.z;
        positions[pIdx++] = v1.x; positions[pIdx++] = v1.y; positions[pIdx++] = v1.z;
        positions[pIdx++] = v2.x; positions[pIdx++] = v2.y; positions[pIdx++] = v2.z;

        // Quad 2: v1, v3, v2
        positions[pIdx++] = v1.x; positions[pIdx++] = v1.y; positions[pIdx++] = v1.z;
        positions[pIdx++] = v3.x; positions[pIdx++] = v3.y; positions[pIdx++] = v3.z;
        positions[pIdx++] = v2.x; positions[pIdx++] = v2.y; positions[pIdx++] = v2.z;

        const uLen = (i / sampled.length) * 16;
        uvs[uvIdx++] = 0; uvs[uvIdx++] = uLen;
        uvs[uvIdx++] = 1; uvs[uvIdx++] = uLen;
        uvs[uvIdx++] = 0; uvs[uvIdx++] = uLen + 0.2;
        uvs[uvIdx++] = 1; uvs[uvIdx++] = uLen;
        uvs[uvIdx++] = 1; uvs[uvIdx++] = uLen + 0.2;
        uvs[uvIdx++] = 0; uvs[uvIdx++] = uLen + 0.2;
      }

      ribbonGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      ribbonGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      ribbonGeo.computeVertexNormals();

      const trackMat = new THREE.MeshStandardMaterial({
        map: roverTrackMap,
        transparent: true,
        opacity: 0.82,
        roughness: 0.98,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1.0,
        polygonOffsetUnits: -1.0
      });
      return new THREE.Mesh(ribbonGeo, trackMat);
    };

    // Track 1: Zone 1 Team Landing Zone (105, 65) -> Zone 2 Surveyor 1 (0, 0)
    const trackPointsA = [
      new THREE.Vector3(100, 0, 64),
      new THREE.Vector3(76, 0, 48),
      new THREE.Vector3(50, 0, 30),
      new THREE.Vector3(25, 0, 14),
      new THREE.Vector3(3, 0, 2)
    ];
    scene.add(createTrackRibbon(trackPointsA, 1.8));

    // Track 2: Zone 2 Surveyor 1 (0, 0) -> Zone 3 Crater Investigation Area (-75, -50)
    const trackPointsB = [
      new THREE.Vector3(-3, 0, -2),
      new THREE.Vector3(-24, 0, -16),
      new THREE.Vector3(-46, 0, -32),
      new THREE.Vector3(-66, 0, -44),
      new THREE.Vector3(-74, 0, -50)
    ];
    scene.add(createTrackRibbon(trackPointsB, 1.6));

    // Track 3: Zone 3 Crater (-75, -50) -> Zone 4 Alien Structure (-120, -75)
    const trackPointsC = [
      new THREE.Vector3(-76, 0, -51),
      new THREE.Vector3(-88, 0, -58),
      new THREE.Vector3(-102, 0, -66),
      new THREE.Vector3(-114, 0, -72),
      new THREE.Vector3(-118, 0, -74)
    ];
    scene.add(createTrackRibbon(trackPointsC, 1.5));

    // 9. MEDIUM-POLY BASALT ROCKS: LARGE BOULDERS NEAR CRATER RIMS & SMALL ANGULAR EJECTA STONES
    // Procedural sculpted rock generator (perturbs icosahedron vertices with angular cleavage)
    const createMediumPolyRockGeo = (radius, detail = 2, roughnessScale = 0.28) => {
      const geo = new THREE.IcosahedronGeometry(radius, detail);
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const vx = p.getX(i);
        const vy = p.getY(i);
        const vz = p.getZ(i);
        const len = Math.hypot(vx, vy, vz);

        // Angular facets & fracture noise
        const n = Math.sin(vx * 2.8) * Math.cos(vy * 2.8) * Math.sin(vz * 2.8);
        const flattenBottom = Math.max(0, -vy) * 0.22;
        const scale = 1.0 + (n * roughnessScale) - flattenBottom;

        p.setXYZ(i, (vx / len) * radius * scale, (vy / len) * radius * scale, (vz / len) * radius * scale);
      }
      geo.computeVertexNormals();
      return geo;
    };

    const rockMat = new THREE.MeshStandardMaterial({
      map: basaltRockMap,
      bumpMap: basaltRockMap,
      bumpScale: 0.22,
      roughness: 0.96,
      metalness: 0.02,
      color: 0x6e717b
    });

    const boulderGroup = new THREE.Group();
    const rockGeoLarge = createMediumPolyRockGeo(1.8, 2, 0.30);
    const rockGeoMedium = createMediumPolyRockGeo(1.0, 1, 0.24);
    const rockGeoSmallStone = createMediumPolyRockGeo(0.28, 1, 0.20); // Small angular ejecta stone
    const rockGeoC = rockGeoSmallStone; // Backward compatibility alias

    // 1. Larger boulders placed along the irregular rims of Medium Craters
    for (const mc of mediumCraters) {
      const numRimRocks = 8 + Math.floor(Math.random() * 5);
      for (let j = 0; j < numRimRocks; j++) {
        const angle = (j / numRimRocks) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const rimPerturb = 1.0 + 0.14 * Math.sin(3 * angle + mc.seed);
        const dist = mc.radius * rimPerturb * (0.95 + Math.random() * 0.32);
        const rx = mc.x + Math.cos(angle) * dist;
        const rz = mc.z + Math.sin(angle) * dist;
        const ry = getTerrainHeight(rx, rz);

        const geoChoice = j % 2 === 0 ? rockGeoLarge : rockGeoMedium;
        const rock = new THREE.Mesh(geoChoice, rockMat);
        const scale = 0.8 + Math.random() * 1.4;
        rock.scale.set(scale * (0.9 + Math.random() * 0.2), scale * (0.75 + Math.random() * 0.35), scale * (0.9 + Math.random() * 0.2));
        rock.position.set(rx, ry + scale * 0.28, rz);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        rock.castShadow = true;
        rock.receiveShadow = true;
        boulderGroup.add(rock);
      }
    }

    // 2. Small angular ejecta stones (0.15m–0.45m) scattered across the terrain
    for (let s = 0; s < 130; s++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * 155;
      const sx = Math.cos(angle) * dist;
      const sz = Math.sin(angle) * dist;
      const sy = getTerrainHeight(sx, sz);

      const stone = new THREE.Mesh(rockGeoSmallStone, rockMat);
      const sScale = 0.55 + Math.random() * 0.95;
      stone.scale.set(sScale, sScale * (0.7 + Math.random() * 0.4), sScale);
      stone.position.set(sx, sy + sScale * 0.12, sz);
      stone.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      stone.castShadow = true;
      stone.receiveShadow = true;
      boulderGroup.add(stone);
    }

    // 3. Concentrated scree cluster around the fissure entrance
    for (let f = 0; f < 18; f++) {
      const fx = -95 + (Math.random() - 0.5) * 22;
      const fz = -110 + (Math.random() - 0.5) * 24;
      const fy = getTerrainHeight(fx, fz);
      const scree = new THREE.Mesh(rockGeoMedium, rockMat);
      const scScale = 0.4 + Math.random() * 0.8;
      scree.scale.set(scScale, scScale * 0.7, scScale);
      scree.position.set(fx, fy + scScale * 0.2, fz);
      scree.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      scree.castShadow = true;
      boulderGroup.add(scree);
    }
    scene.add(boulderGroup);

    // 10. ACCURATE MEDIUM-POLY HISTORIC SURVEYOR 1 LANDER (CENTERPIECE AT X:0, Z:0)
    const surveyorGroup = new THREE.Group();
    const surveyorTerrainY = getTerrainHeight(0, 0);
    surveyorGroup.position.set(0, surveyorTerrainY, 0);

    // Medium-poly PBR materials
    const matAluminum = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.88, roughness: 0.24 });
    const matGoldFoil = new THREE.MeshStandardMaterial({
      map: goldFoilMap,
      bumpMap: goldFoilMap,
      bumpScale: 0.12,
      metalness: 0.92,
      roughness: 0.32,
      color: 0xf59e0b
    });
    const matSolarPanel = new THREE.MeshStandardMaterial({
      map: solarPanelMap,
      roughness: 0.16,
      metalness: 0.8
    });
    // Cold scientific materials (Surveyor 1 has zero artificial lights and no emissive glow)
    const matGlassOptic = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.94, roughness: 0.08 });
    const matRocketNozzle = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.35 });

    // A. Authentic Open Triangular Tubular Lattice Space Frame (NASA Surveyor Specification)
    const frameTrussGroup = new THREE.Group();
    const cornerRadius = 1.35;
    const cornerAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
    const topY = 2.7;
    const botY = 1.2;

    // 1. Three vertical main corner posts with bolted gusset plates
    for (let i = 0; i < 3; i++) {
      const ang = cornerAngles[i];
      const cx = Math.cos(ang) * cornerRadius;
      const cz = Math.sin(ang) * cornerRadius;

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, topY - botY, 12), matAluminum);
      post.position.set(cx, (topY + botY) * 0.5, cz);
      post.castShadow = true;
      frameTrussGroup.add(post);

      // Upper and lower joint gusset bracket rings
      for (const gy of [botY + 0.05, topY - 0.05]) {
        const gusset = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.08, 12), matAluminum);
        gusset.position.set(cx, gy, cz);
        frameTrussGroup.add(gusset);
      }
    }

    // 2. Horizontal and diagonal Warren truss members for each of the 3 triangular faces
    for (let i = 0; i < 3; i++) {
      const a1 = cornerAngles[i];
      const a2 = cornerAngles[(i + 1) % 3];
      const p1Top = new THREE.Vector3(Math.cos(a1) * cornerRadius, topY, Math.sin(a1) * cornerRadius);
      const p1Bot = new THREE.Vector3(Math.cos(a1) * cornerRadius, botY, Math.sin(a1) * cornerRadius);
      const p2Top = new THREE.Vector3(Math.cos(a2) * cornerRadius, topY, Math.sin(a2) * cornerRadius);
      const p2Bot = new THREE.Vector3(Math.cos(a2) * cornerRadius, botY, Math.sin(a2) * cornerRadius);

      const addStrut = (start, end) => {
        const dir = new THREE.Vector3().subVectors(end, start);
        const len = dir.length();
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, len, 8), matAluminum);
        strut.position.copy(start).addScaledVector(dir, 0.5);
        strut.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        strut.castShadow = true;
        frameTrussGroup.add(strut);
      };

      // Top and bottom horizontal boundary tubes
      addStrut(p1Top, p2Top);
      addStrut(p1Bot, p2Bot);

      // Dual diagonal cross-struts (Warren truss)
      addStrut(p1Bot, p2Top);
      addStrut(p1Top, p2Bot);
    }

    // 3. Central pyramidal apex struts converging to mast collar
    const apexCenter = new THREE.Vector3(0, 3.2, 0);
    for (let i = 0; i < 3; i++) {
      const ang = cornerAngles[i];
      const pTop = new THREE.Vector3(Math.cos(ang) * cornerRadius, topY, Math.sin(ang) * cornerRadius);
      const dir = new THREE.Vector3().subVectors(apexCenter, pTop);
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, dir.length(), 8), matAluminum);
      strut.position.copy(pTop).addScaledVector(dir, 0.5);
      strut.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      frameTrussGroup.add(strut);
    }
    surveyorGroup.add(frameTrussGroup);

    // B. High-Detail Vernier Propulsion Rocket Engines with Gimbal Actuators & Feed Tubing
    for (let v = 0; v < 3; v++) {
      const vAng = cornerAngles[v] + 0.55;
      const vx = Math.cos(vAng) * 1.35;
      const vz = Math.sin(vAng) * 1.35;
      const engineGroup = new THREE.Group();
      engineGroup.position.set(vx, botY, vz);

      // Upper gimbal pivot ring
      const gimbalRing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12), matAluminum);
      engineGroup.add(gimbalRing);

      // Spherical combustion chamber dome
      const chamber = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), matRocketNozzle);
      chamber.position.y = -0.08;
      engineGroup.add(chamber);

      // Flared ceramic expansion bell nozzle
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.28, 0.46, 20), matRocketNozzle);
      nozzle.position.y = -0.32;
      nozzle.castShadow = true;
      engineGroup.add(nozzle);

      // Nozzle interior dark heat-resistant ceramic throat
      const nozzleInner = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.24, 0.44, 16),
        new THREE.MeshStandardMaterial({ color: 0x0a0c12, roughness: 0.85 })
      );
      nozzleInner.position.y = -0.32;
      engineGroup.add(nozzleInner);

      // Gimbal pushrod actuator
      const actuator = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.32, 8), matAluminum);
      actuator.position.set(0.12, -0.15, 0.06);
      actuator.rotation.z = -0.35;
      engineGroup.add(actuator);

      surveyorGroup.add(engineGroup);
    }

    // C. 3 Titanium Helium Pressurization Spheres with Equator Weld Seams & Tubing
    for (let t = 0; t < 3; t++) {
      const tAng = cornerAngles[t] - 0.52;
      const tx = Math.cos(tAng) * 1.25;
      const tz = Math.sin(tAng) * 1.25;
      const tankGroup = new THREE.Group();
      tankGroup.position.set(tx, 2.05, tz);

      const tank = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 20), matAluminum);
      tank.castShadow = true;
      tankGroup.add(tank);

      // Equator weld seam ring
      const seam = new THREE.Mesh(new THREE.TorusGeometry(0.282, 0.012, 8, 24), matAluminum);
      seam.rotation.x = Math.PI / 2;
      tankGroup.add(seam);

      // Tank mounting saddle bracket
      const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.12), matRocketNozzle);
      saddle.position.set(0, -0.18, 0);
      tankGroup.add(saddle);

      surveyorGroup.add(tankGroup);
    }

    // D. High-Detail Gold MLI Kapton Insulation Compartments with Seams & Radiator Louvers
    const compA = new THREE.Group();
    compA.position.set(0.65, 1.85, 0.25);
    const compABox = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.85, 0.85), matGoldFoil);
    compABox.castShadow = true;
    compA.add(compABox);

    // Heat radiator louvers on compartment side
    const radLouverA = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.15 })
    );
    radLouverA.position.set(0, 0, 0.43);
    compA.add(radLouverA);
    surveyorGroup.add(compA);

    const compB = new THREE.Group();
    compB.position.set(-0.65, 1.85, 0.25);
    const compBBox = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.75, 0.75), matGoldFoil);
    compBBox.castShadow = true;
    compB.add(compBBox);

    const radLouverB = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.45),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.15 })
    );
    radLouverB.position.set(0, 0, 0.38);
    compB.add(radLouverB);
    surveyorGroup.add(compB);

    // E. 3 High-Detail Articulated Tripod Landing Legs with Telescoping Oleo Pistons & Honeycomb Footpads
    const chromePistonMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.98, roughness: 0.06 });
    const blueCollarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.88, roughness: 0.3 });

    for (let i = 0; i < 3; i++) {
      const legAngle = cornerAngles[i];
      const legGroup = new THREE.Group();
      legGroup.rotation.y = legAngle;

      // Upper A-frame hinge mount bracket
      const hingeBracket = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.16), matAluminum);
      hingeBracket.position.set(0, 1.4, 1.4);
      legGroup.add(hingeBracket);

      // Primary upper tubular strut
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 3.6, 16), matAluminum);
      strut.position.set(0, 1.05, 2.3);
      strut.rotation.x = 0.65;
      strut.castShadow = true;
      legGroup.add(strut);

      // Hydraulic shock absorber outer cylinder (Blue anodized)
      const shockCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 16), blueCollarMat);
      shockCylinder.position.set(0, 1.55, 1.7);
      shockCylinder.rotation.x = 0.42;
      legGroup.add(shockCylinder);

      // Telescoping polished chrome inner piston rod
      const shockPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 16), chromePistonMat);
      shockPiston.position.set(0, 1.08, 2.15);
      shockPiston.rotation.x = 0.42;
      legGroup.add(shockPiston);

      // Scissor stabilizing lock linkage
      const lockLinkA = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.65, 0.04), matAluminum);
      lockLinkA.position.set(0.08, 1.35, 1.85);
      lockLinkA.rotation.x = -0.4;
      legGroup.add(lockLinkA);

      // Crushable aluminum honeycomb footpad (24-sided) with radial stiffeners
      const footpadGroup = new THREE.Group();
      footpadGroup.position.set(0, 0.12, 3.65);

      const footpad = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.74, 0.22, 24), matAluminum);
      footpad.castShadow = true;
      footpadGroup.add(footpad);

      // Radial stiffener ribs across top of footpad
      for (let r = 0; r < 6; r++) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.65), matAluminum);
        rib.rotation.y = (r * Math.PI) / 6;
        rib.position.y = 0.12;
        footpadGroup.add(rib);
      }

      legGroup.add(footpadGroup);
      surveyorGroup.add(legGroup);
    }

    // Footpad 2 Soil Trench / Compression depression in lunar regolith
    const trenchGeo = new THREE.CylinderGeometry(1.2, 1.7, 0.14, 24);
    const trenchMat = new THREE.MeshStandardMaterial({
      map: regolithMap,
      color: 0x22242a,
      roughness: 0.99
    });
    const footpadTrench = new THREE.Mesh(trenchGeo, trenchMat);
    footpadTrench.position.set(Math.cos((2 * Math.PI) / 3) * 3.6, 0.03, Math.sin((2 * Math.PI) / 3) * 3.6);
    surveyorGroup.add(footpadTrench);

    // F. Central Mast Assembly with Wire Conduit Wrap
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 16), matAluminum);
    mast.position.y = 4.2;
    mast.castShadow = true;
    surveyorGroup.add(mast);

    // Spiraling electrical wire harness around mast
    const wirePoints = [];
    for (let w = 0; w < 40; w++) {
      const wAng = w * 0.45;
      const wy = 2.6 + (w / 40) * 3.0;
      wirePoints.push(new THREE.Vector3(Math.cos(wAng) * 0.09, wy, Math.sin(wAng) * 0.09));
    }
    const wireGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wirePoints), 36, 0.012, 6, false);
    const wireMesh = new THREE.Mesh(wireGeo, matRocketNozzle);
    surveyorGroup.add(wireMesh);

    // G. High-Detail Planar Solar Array Panel with Structural Backing & Sun Sensor
    const solarGroup = new THREE.Group();
    solarGroup.position.set(0, 5.8, 0.2);
    solarGroup.rotation.x = -0.32;
    solarGroup.rotation.y = 0.45;

    // Outer structural aluminum frame border
    const solarFrame = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.06, 1.38), matAluminum);
    solarGroup.add(solarFrame);

    // Active Photovoltaic Silicon Wafer Face
    const solarPanel = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.07, 1.3), matSolarPanel);
    solarPanel.castShadow = true;
    solarGroup.add(solarPanel);

    // Back reinforcing ribbing grid
    for (let r = -0.8; r <= 0.8; r += 0.4) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 1.25), matAluminum);
      rib.position.set(r, -0.04, 0);
      solarGroup.add(rib);
    }

    // Solar sun-sensor stalk on panel apex
    const sunSensorStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8), matAluminum);
    sunSensorStalk.position.set(0, 0.08, 0.72);
    sunSensorStalk.rotation.x = Math.PI / 2;
    solarGroup.add(sunSensorStalk);

    const sunSensorHead = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), matGlassOptic);
    sunSensorHead.position.set(0, 0.08, 0.9);
    solarGroup.add(sunSensorHead);

    surveyorGroup.add(solarGroup);

    // H. Steerable High-Detail Vidicon TV Camera Turret with Filter Wheel & Optical Hood
    const tvCameraGroup = new THREE.Group();
    tvCameraGroup.position.set(0.65, 3.2, -0.65);

    // Stepped cylindrical housing
    const cameraBody = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.85, 20), matAluminum);
    cameraBody.castShadow = true;
    tvCameraGroup.add(cameraBody);

    // Optical filter wheel housing collar
    const filterWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.12, 20), matRocketNozzle);
    filterWheel.position.y = 0.42;
    tvCameraGroup.add(filterWheel);

    // Motorized mirror hood with bevel gear bracket
    const mirrorHood = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.45, 0.32), matAluminum);
    mirrorHood.position.set(0, 0.68, 0);
    mirrorHood.rotation.x = -0.45;
    tvCameraGroup.add(mirrorHood);

    // Multi-element optical glass aperture lens
    const cameraMirror = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 20), matGlassOptic);
    cameraMirror.position.set(0, 0.68, 0.16);
    cameraMirror.rotation.x = Math.PI / 2 - 0.45;
    tvCameraGroup.add(cameraMirror);

    // Camera mounting bracket to space frame
    const cameraBracket = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.35), matAluminum);
    cameraBracket.position.set(-0.15, -0.42, 0.15);
    tvCameraGroup.add(cameraBracket);

    surveyorGroup.add(tvCameraGroup);

    // I. High-Gain Planar Directional Antenna (Beside Mast)
    const hgAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 24), matAluminum);
    hgAntenna.position.set(-0.55, 4.8, 0);
    hgAntenna.rotation.z = 0.45;
    hgAntenna.castShadow = true;
    surveyorGroup.add(hgAntenna);

    // J. Two Omnidirectional Antennas extending outward with deployment springs
    for (let dir of [-1, 1]) {
      const antennaArm = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 2.2, 12), matAluminum);
      antennaArm.position.set(dir * 1.8, 2.4, 0);
      antennaArm.rotation.z = dir * 1.1;
      antennaArm.castShadow = true;
      surveyorGroup.add(antennaArm);

      // Gold Kapton Cone Cap
      const antennaCone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.42, 16), matGoldFoil);
      antennaCone.position.set(dir * 2.8, 2.9, 0);
      surveyorGroup.add(antennaCone);
    }

    // Historical NASA Heritage Site Floor Marker Ring
    const heritageRingGeo = new THREE.RingGeometry(5.5, 5.8, 64);
    const heritageRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
    const heritageRing = new THREE.Mesh(heritageRingGeo, heritageRingMat);
    heritageRing.rotation.x = -Math.PI / 2;
    heritageRing.position.y = 0.06;
    surveyorGroup.add(heritageRing);

    // Recovery team survey markers placed around Surveyor 1
    const s1MarkerA = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8), matAluminum);
    s1MarkerA.position.set(2.8, 0.6, 2.0);
    surveyorGroup.add(s1MarkerA);
    const s1BeaconA = new THREE.PointLight(0x06b6d4, 2.0, 8);
    s1BeaconA.position.set(2.8, 1.25, 2.0);
    surveyorGroup.add(s1BeaconA);

    const s1MarkerB = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8), matAluminum);
    s1MarkerB.position.set(-2.6, 0.6, -1.8);
    surveyorGroup.add(s1MarkerB);
    const s1BeaconB = new THREE.PointLight(0xf59e0b, 2.0, 8);
    s1BeaconB.position.set(-2.6, 1.25, -1.8);
    surveyorGroup.add(s1BeaconB);

    // J. Surface Sampler Pantograph Robotic Arm (Scissor Arm with Soil Mechanics Scoop)
    const samplerArmGroup = new THREE.Group();
    samplerArmGroup.position.set(Math.cos(2.1) * 1.8, 1.3, Math.sin(2.1) * 1.8);
    samplerArmGroup.rotation.y = 2.1;

    // Base pivot turret
    const armPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.35, 12), matAluminum);
    samplerArmGroup.add(armPivot);

    // Articulated upper scissor pantograph arm
    const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.4), matAluminum);
    upperArm.position.set(0, -0.2, 0.65);
    upperArm.rotation.x = 0.55;
    upperArm.castShadow = true;
    samplerArmGroup.add(upperArm);

    // Elbow actuator joint
    const armElbow = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 10), matAluminum);
    armElbow.rotation.z = Math.PI / 2;
    armElbow.position.set(0, -0.55, 1.25);
    samplerArmGroup.add(armElbow);

    // Lower forearm extending to soil
    const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1.3), matAluminum);
    lowerArm.position.set(0, -0.9, 1.75);
    lowerArm.rotation.x = -0.45;
    lowerArm.castShadow = true;
    samplerArmGroup.add(lowerArm);

    // Soil scoop bucket embedded into lunar regolith
    const scoopBucket = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.14, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.35 })
    );
    scoopBucket.position.set(0, -1.22, 2.3);
    scoopBucket.rotation.x = 0.15;
    scoopBucket.castShadow = true;
    samplerArmGroup.add(scoopBucket);

    surveyorGroup.add(samplerArmGroup);

    // K. Small Scientific Instruments on Surveyor 1:
    // 1. Alpha-Scattering Surface Instrument (Chemical composition sensor head)
    const alphaSensor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.26, 0.28, 16),
      matGoldFoil
    );
    alphaSensor.position.set(-1.2, 0.2, 1.6);
    alphaSensor.castShadow = true;
    surveyorGroup.add(alphaSensor);

    const alphaWire = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.6, 6), matRocketNozzle);
    alphaWire.position.set(-1.0, 0.9, 1.2);
    alphaWire.rotation.x = 0.6;
    alphaWire.rotation.z = -0.4;
    surveyorGroup.add(alphaWire);

    // 2. Micrometeorite Detector Sensor Plate (Mounted to central mast)
    const microMeteoritePlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.38, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
    );
    microMeteoritePlate.position.set(-0.35, 4.4, 0);
    microMeteoritePlate.rotation.y = 0.7;
    surveyorGroup.add(microMeteoritePlate);

    // 3. Footpad Magnetic Iron Sensor Plate on Leg 2
    const footpadMagnet = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.06, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 })
    );
    footpadMagnet.position.set(Math.cos((2 * Math.PI) / 3) * 3.6, 0.24, Math.sin((2 * Math.PI) / 3) * 3.6 + 0.3);
    surveyorGroup.add(footpadMagnet);

    scene.add(surveyorGroup);

    // =========================================================================
    // 11. ZONE 1 — TEAM LANDING ZONE (X: 105, Z: 65)
    // =========================================================================
    const landingZoneGroup = new THREE.Group();
    const landingTerrainY = getTerrainHeight(105, 65);
    landingZoneGroup.position.set(105, landingTerrainY, 65);

    // A. Disturbed Regolith Dust Ring / Landing Scorch Pad
    const landingRingGeo = new THREE.RingGeometry(4.5, 14.0, 32);
    const landingRingMat = new THREE.MeshStandardMaterial({
      map: regolithMap,
      color: 0x181a20,
      roughness: 0.99,
      side: THREE.DoubleSide,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1.0
    });
    const landingPadRing = new THREE.Mesh(landingRingGeo, landingRingMat);
    landingPadRing.rotation.x = -Math.PI / 2;
    landingPadRing.position.y = 0.04;
    landingZoneGroup.add(landingPadRing);

    // B. Parked Lunar Transport Vehicle (Aegis-01) at (X: 110.5, Z: 65 -> offset in group (5.5, 0, 0))
    const transportVehicleGroup = new THREE.Group();
    transportVehicleGroup.position.set(5.5, 0, 0);
    transportVehicleGroup.rotation.y = Math.PI * 0.95; // Pointing West towards Surveyor 1

    const fallbackVehMeshGroup = new THREE.Group();
    transportVehicleGroup.add(fallbackVehMeshGroup);

    // Vehicle Chassis Materials (High-Detail PBR)
    const vehBodyMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.90,
      roughness: 0.25
    });
    const vehArmorMat = new THREE.MeshStandardMaterial({
      map: carbonFiberMap,
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.32
    });
    const vehAccentMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.88, roughness: 0.22 });
    const vehHazardMat = new THREE.MeshStandardMaterial({ map: hazardStripeMap, roughness: 0.35, metalness: 0.5 });
    const vehGlassMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.98,
      roughness: 0.04,
      transparent: true,
      opacity: 0.88
    });

    // 1. Lower Reinforced Titanium Skid Chassis & Hull Keel
    const vehChassis = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.75, 3.2), vehBodyMat);
    vehChassis.position.y = 1.15;
    vehChassis.castShadow = true;
    vehChassis.receiveShadow = true;
    fallbackVehMeshGroup.add(vehChassis);

    // Lateral armor side-skirts with hazard warning stripes
    for (const sz of [-1.62, 1.62]) {
      const skirt = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.45, 0.08), vehHazardMat);
      skirt.position.set(0, 0.95, sz);
      fallbackVehMeshGroup.add(skirt);
    }

    // 2. Upper Pressurized Command Crew Module with Beveled Chamfers
    const vehCabin = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.65, 2.95), vehAccentMat);
    vehCabin.position.set(-0.7, 2.35, 0);
    vehCabin.castShadow = true;
    fallbackVehMeshGroup.add(vehCabin);

    // Carbon-fiber composite armor roof cap
    const roofArmor = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.08, 2.85), vehArmorMat);
    roofArmor.position.set(-0.7, 3.22, 0);
    fallbackVehMeshGroup.add(roofArmor);

    // 3. Faceted Aerodynamic Sloping Nose & Multi-Pane Gold Solar Viewport
    const noseFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 2.8), vehBodyMat);
    noseFrame.position.set(2.1, 2.15, 0);
    noseFrame.rotation.z = -0.35;
    noseFrame.castShadow = true;
    fallbackVehMeshGroup.add(noseFrame);

    // Front panoramic faceted gold-iridium solar radiation glass windshield
    const vehWindshield = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 2.5), vehGlassMat);
    vehWindshield.position.set(2.25, 2.22, 0);
    vehWindshield.rotation.z = -0.35;
    fallbackVehMeshGroup.add(vehWindshield);

    // Center structural window mullion pillar
    const windowMullion = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.15, 0.12), vehBodyMat);
    windowMullion.position.set(2.32, 2.22, 0);
    windowMullion.rotation.z = -0.35;
    fallbackVehMeshGroup.add(windowMullion);

    // 4. Heavy Tubular Steel Front Bull-Bar / Push Bumper with Dual Tow Shackles & Winch
    const bumperTube = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.3, 12), matRocketNozzle);
    bumperTube.rotation.x = Math.PI / 2;
    bumperTube.position.set(3.45, 1.25, 0);
    bumperTube.castShadow = true;
    fallbackVehMeshGroup.add(bumperTube);

    // Winch spool in bumper center
    const winchDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.45, 12), matRocketNozzle);
    winchDrum.rotation.x = Math.PI / 2;
    winchDrum.position.set(3.5, 1.25, 0);
    fallbackVehMeshGroup.add(winchDrum);

    // Red recovery D-shackles
    for (const bz of [-1.1, 1.1]) {
      const shackle = new THREE.Mesh(
        new THREE.TorusGeometry(0.09, 0.025, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.2 })
      );
      shackle.position.set(3.55, 1.25, bz);
      fallbackVehMeshGroup.add(shackle);
    }

    // 5. Rear Pressurized Airlock Module with Heavy Pressure Hatch
    const airlockHatchFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.22, 24), vehBodyMat);
    airlockHatchFrame.rotation.z = Math.PI / 2;
    airlockHatchFrame.position.set(-3.4, 1.75, 0);
    airlockHatchFrame.castShadow = true;
    fallbackVehMeshGroup.add(airlockHatchFrame);

    // Circular pressure door with 3-spoke locking wheel
    const airlockDoor = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.1, 24), matAluminum);
    airlockDoor.rotation.z = Math.PI / 2;
    airlockDoor.position.set(-3.52, 1.75, 0);
    fallbackVehMeshGroup.add(airlockDoor);

    const lockWheel = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 16), matRocketNozzle);
    lockWheel.rotation.y = Math.PI / 2;
    lockWheel.position.set(-3.58, 1.75, 0);
    fallbackVehMeshGroup.add(lockWheel);

    // 6. External Life-Support High-Pressure Cryogenic Tanks (O2 / N2) on Flanks
    for (const sideZ of [-1.55, 1.55]) {
      const tankGroup = new THREE.Group();
      tankGroup.position.set(-1.8, 2.5, sideZ);

      const o2Tank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 1.8, 16),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 })
      );
      o2Tank.rotation.x = Math.PI / 2;
      o2Tank.castShadow = true;
      tankGroup.add(o2Tank);

      // Stainless steel retaining mounting straps
      for (const tx of [-0.6, 0.6]) {
        const strap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 16), matRocketNozzle);
        strap.rotation.x = Math.PI / 2;
        strap.position.set(tx, 0, 0);
        tankGroup.add(strap);
      }
      fallbackVehMeshGroup.add(tankGroup);
    }

    // 7. Roof Tubular Equipment Basket & Steerable High-Gain Dish
    const roofRack = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.16, 2.4), matAluminum);
    roofRack.position.set(-0.6, 3.32, 0);
    fallbackVehMeshGroup.add(roofRack);

    // Steerable High-Gain Parabolic Telemetry Dish
    const dishPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.55, 12), matAluminum);
    dishPedestal.position.set(-1.5, 3.65, 0);
    fallbackVehMeshGroup.add(dishPedestal);

    const roofDish = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.94, roughness: 0.18 })
    );
    roofDish.position.set(-1.5, 4.15, 0);
    roofDish.rotation.x = 0.45;
    roofDish.rotation.z = -0.35;
    roofDish.castShadow = true;
    fallbackVehMeshGroup.add(roofDish);

    // Spinning LIDAR Dome Sensor Unit (Passive optical sensor, no colored glow)
    const lidarDome = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.25, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
    );
    lidarDome.position.set(0.8, 3.48, 0);
    fallbackVehMeshGroup.add(lidarDome);

    // 8. Advanced Planetary Non-Pneumatic Titanium Tweel Wheels with Spiral Springs
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.28 });
    const springBladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.98, roughness: 0.15 });

    const wheelOffsets = [
      [ 2.2, 0.72,  1.92],
      [ 0.0, 0.72,  1.92],
      [-2.2, 0.72,  1.92],
      [ 2.2, 0.72, -1.92],
      [ 0.0, 0.72, -1.92],
      [-2.2, 0.72, -1.92]
    ];

    for (const [wx, wy, wz] of wheelOffsets) {
      const tweelGroup = new THREE.Group();
      tweelGroup.position.set(wx, wy, wz);

      // Central titanium planetary hub with axle cap
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.46, 16), matAluminum);
      hub.rotation.x = Math.PI / 2;
      hub.castShadow = true;
      tweelGroup.add(hub);

      // Lug bolts circle
      for (let b = 0; b < 6; b++) {
        const bAng = (b * Math.PI * 2) / 6;
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.48, 6), matRocketNozzle);
        bolt.rotation.x = Math.PI / 2;
        bolt.position.set(Math.cos(bAng) * 0.14, Math.sin(bAng) * 0.14, 0);
        tweelGroup.add(bolt);
      }

      // Outer tread ring with chevron lunar traction paddles
      const outerTread = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.46, 24), wheelMat);
      outerTread.rotation.x = Math.PI / 2;
      outerTread.castShadow = true;
      tweelGroup.add(outerTread);

      // Curved internal titanium spring blades (Tweel structure)
      for (let s = 0; s < 12; s++) {
        const sAng = (s * Math.PI * 2) / 12;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.42, 0.42), springBladeMat);
        blade.position.set(Math.cos(sAng) * 0.44, Math.sin(sAng) * 0.44, 0);
        blade.rotation.z = sAng + 0.55;
        tweelGroup.add(blade);
      }

      // Independent double-wishbone suspension linkage with coilover spring
      const suspArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.65, 0.25), matAluminum);
      suspArm.position.set(0, 0.48, wz > 0 ? -0.22 : 0.22);
      suspArm.rotation.z = wx > 0 ? 0.28 : -0.28;
      tweelGroup.add(suspArm);

      fallbackVehMeshGroup.add(tweelGroup);
    }

    // 9. Transport Vehicle Artificial Lighting — Strictly Small White Navigation Lights
    const lightbarHousing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 0.25), matRocketNozzle);
    lightbarHousing.position.set(3.38, 2.95, 0);
    transportVehicleGroup.add(lightbarHousing);

    for (let lx = -1.0; lx <= 1.0; lx += 0.28) {
      const ledLens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      ledLens.rotation.z = Math.PI / 2;
      ledLens.position.set(3.48, 2.95, lx);
      transportVehicleGroup.add(ledLens);
    }

    // Dual Forward Small White Navigation Headlights
    for (const sideZ of [-0.9, 0.9]) {
      const navHeadlight = new THREE.SpotLight(0xffffff, 2.0, 24, Math.PI / 5, 0.35, 1.4);
      navHeadlight.position.set(3.5, 2.95, sideZ);
      navHeadlight.target.position.set(24.0, -0.5, sideZ * 1.2);
      navHeadlight.castShadow = true;
      transportVehicleGroup.add(navHeadlight);
      transportVehicleGroup.add(navHeadlight.target);
    }

    // Small White LED Navigation Marker Beacons at Cabin Corners
    const navLedMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const navLedOffsets = [
      [ 3.42, 2.95,  1.12],
      [ 3.42, 2.95, -1.12],
      [-2.85, 3.10,  1.12],
      [-2.85, 3.10, -1.12]
    ];
    for (const [nx, ny, nz] of navLedOffsets) {
      const ledMarker = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 8), navLedMat);
      ledMarker.position.set(nx, ny, nz);
      transportVehicleGroup.add(ledMarker);

      const navMarkerGlow = new THREE.PointLight(0xffffff, 0.65, 4.5);
      navMarkerGlow.position.set(nx, ny, nz);
      transportVehicleGroup.add(navMarkerGlow);
    }

    landingZoneGroup.add(transportVehicleGroup);

    // Official NASA 3D Resource: Space Exploration Vehicle (SEV)
    gltfLoader.load(
      '/models/nasa/Space_Exploration_Vehicle.glb',
      (gltf) => {
        const nasaVeh = gltf.scene;
        const initialBox = new THREE.Box3().setFromObject(nasaVeh);
        const size = new THREE.Vector3();
        initialBox.getSize(size);

        // Scale to authentic planetary exploration vehicle dimensions (~6.2m length)
        const maxHoriz = Math.max(size.x, size.z);
        const scaleFactor = 6.2 / (maxHoriz > 0.1 ? maxHoriz : 6.0);
        nasaVeh.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Turn front (-Z) to forward direction (+X)
        nasaVeh.rotation.y = -Math.PI / 2;

        // Position wheels flush on ground level Y = 0 and center
        const scaledBox = new THREE.Box3().setFromObject(nasaVeh);
        nasaVeh.position.y = -scaledBox.min.y;
        nasaVeh.position.x = -(scaledBox.min.x + scaledBox.max.x) / 2;
        nasaVeh.position.z = -(scaledBox.min.z + scaledBox.max.z) / 2;

        nasaVeh.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Seamless swap: hide procedural fallback chassis once official NASA model is loaded
        fallbackVehMeshGroup.visible = false;
        transportVehicleGroup.add(nasaVeh);
      },
      undefined,
      (err) => {
        console.warn('NASA SEV model failed to load, retaining procedural vehicle:', err);
      }
    );

    // =========================================================================
    // C. HIGH-DETAIL NASA xEMU ASTRONAUT CREWMATES (MAYA CHEN & LEO VANCE)
    // =========================================================================
    const astronautCrewList = [];
    const createAstronautMesh = (name, role, accentColor, isHoldingDatapad) => {
      const astroGroup = new THREE.Group();
      const fallbackGroup = new THREE.Group();
      astroGroup.add(fallbackGroup);
      astroGroup._fallbackGroup = fallbackGroup;

      // PBR Materials for xEMU Spacesuit
      const suitFabricMat = new THREE.MeshStandardMaterial({
        map: spacesuitFabricMap,
        color: 0xf8fafc,
        roughness: 0.65,
        metalness: 0.1
      });
      const suitHardMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.25 });
      const jointDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.2 });
      const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.4, metalness: 0.3 });
      const goldVisorMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.99,
        roughness: 0.02
      });

      // 1. Hard Upper Torso (HUT) Shell
      const hut = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.74, 0.38), suitHardMat);
      hut.position.y = 1.24;
      hut.castShadow = true;
      fallbackGroup.add(hut);

      // Shoulder Mission Stripe Bands
      for (const sx of [-0.28, 0.28]) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.38), accentMat);
        stripe.position.set(sx, 1.52, 0);
        fallbackGroup.add(stripe);
      }

      // 2. Chest Display and Control Module (DCM) with Carbon-Fiber Faceplate & Switches
      const dcmGroup = new THREE.Group();
      dcmGroup.position.set(0, 1.32, 0.21);

      const dcmBox = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.11), new THREE.MeshStandardMaterial({ map: carbonFiberMap, roughness: 0.3 }));
      dcmGroup.add(dcmBox);

      // Digital Status OLED display window
      const dcmScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.18, 0.09),
        new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
      );
      dcmScreen.position.set(0, 0.06, 0.06);
      dcmGroup.add(dcmScreen);

      // Rotary purge & pressure toggle knobs
      for (let k = -0.09; k <= 0.09; k += 0.06) {
        const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 8), matRocketNozzle);
        knob.rotation.x = Math.PI / 2;
        knob.position.set(k, -0.08, 0.06);
        dcmGroup.add(knob);
      }
      fallbackGroup.add(dcmGroup);

      // Dual braided umbilical oxygen & telemetry hoses
      for (const ox of [-0.09, 0.09]) {
        const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.34, 10), jointDarkMat);
        hose.position.set(ox, 1.12, 0.22);
        fallbackGroup.add(hose);
      }

      // 3. Portable Life Support System (PLSS Backpack) with Sublimator Radiator
      const plssGroup = new THREE.Group();
      plssGroup.position.set(0, 1.28, -0.26);

      const plssBox = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.82, 0.28), suitHardMat);
      plssBox.castShadow = true;
      plssGroup.add(plssBox);

      // Thermal sublimator radiator grill
      const radiator = new THREE.Mesh(
        new THREE.PlaneGeometry(0.42, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 })
      );
      radiator.position.set(0, 0.12, -0.145);
      radiator.rotation.y = Math.PI;
      plssGroup.add(radiator);

      // PLSS Telemetry whip antenna
      const plssAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.65, 8), matAluminum);
      plssAntenna.position.set(0.2, 0.65, -0.08);
      plssGroup.add(plssAntenna);

      // Biometric Health Indicator LED
      const plssLight = new THREE.PointLight(accentColor, 1.8, 6);
      plssLight.position.set(0, 0.35, -0.16);
      plssGroup.add(plssLight);
      fallbackGroup.add(plssGroup);

      // 4. Helmet & Gold Mirror Visor with EVA Spotlights
      const helmetGroup = new THREE.Group();
      helmetGroup.position.set(0, 1.76, 0.02);

      // Outer protective fiberglass helmet shell
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 24), suitHardMat);
      helmet.castShadow = true;
      helmetGroup.add(helmet);

      // Metallic Gold Reflective Sun Visor Bubble (Mirror PBR)
      const visor = new THREE.Mesh(new THREE.SphereGeometry(0.20, 24, 24, 0, Math.PI, 0, Math.PI), goldVisorMat);
      visor.rotation.x = -Math.PI / 2;
      visor.position.set(0, 0, 0.07);
      helmetGroup.add(visor);

      // Dual Helmet EVA Spotlights (Left and Right)
      for (const hx of [-0.22, 0.22]) {
        const spotHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.08, 12), matRocketNozzle);
        spotHousing.rotation.x = Math.PI / 2;
        spotHousing.position.set(hx, 0.05, 0.12);
        helmetGroup.add(spotHousing);

        const spotLens = new THREE.Mesh(new THREE.CircleGeometry(0.032, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        spotLens.position.set(hx, 0.05, 0.162);
        helmetGroup.add(spotLens);
      }
      fallbackGroup.add(helmetGroup);

      // 5. Segmented Mobility Legs & Deep-Lug Lunar Overshoes
      for (const lx of [-0.18, 0.18]) {
        const legGroup = new THREE.Group();
        legGroup.position.set(lx, 0, 0);

        // Upper thigh with fabric weave
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.42, 12), suitFabricMat);
        thigh.position.y = 0.76;
        thigh.castShadow = true;
        legGroup.add(thigh);

        // Accordion knee mobility bearing
        const knee = new THREE.Mesh(new THREE.SphereGeometry(0.105, 12, 12), jointDarkMat);
        knee.position.y = 0.52;
        legGroup.add(knee);

        // Shin & boot gaiter
        const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.11, 0.42, 12), suitFabricMat);
        shin.position.y = 0.28;
        shin.castShadow = true;
        legGroup.add(shin);

        // Heavy Apollo/Artemis Lunar Overshoe with deep traction lugs
        const boot = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 0.18, 0.42),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95, metalness: 0.1 })
        );
        boot.position.set(0, 0.09, 0.06);
        boot.castShadow = true;
        legGroup.add(boot);

        fallbackGroup.add(legGroup);
      }

      // 6. Articulated Arms & EVA Utility Gloves
      if (isHoldingDatapad) {
        // Maya Chen: Holding Field Scientific Datapad
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.46, 12), suitFabricMat);
        lArm.position.set(-0.36, 1.26, 0.12);
        lArm.rotation.x = -0.72;
        lArm.rotation.z = -0.28;
        fallbackGroup.add(lArm);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.46, 12), suitFabricMat);
        rArm.position.set(0.36, 1.26, 0.12);
        rArm.rotation.x = -0.62;
        rArm.rotation.z = 0.28;
        fallbackGroup.add(rArm);

        // Scientific Holographic Datapad
        const datapad = new THREE.Mesh(
          new THREE.BoxGeometry(0.34, 0.03, 0.24),
          new THREE.MeshStandardMaterial({ map: carbonFiberMap, metalness: 0.9, roughness: 0.2 })
        );
        datapad.position.set(0, 1.05, 0.38);
        datapad.rotation.x = -0.42;
        fallbackGroup.add(datapad);

        const screen = new THREE.Mesh(
          new THREE.PlaneGeometry(0.30, 0.20),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        screen.position.set(0, 1.07, 0.38);
        screen.rotation.x = -Math.PI / 2 - 0.42;
        fallbackGroup.add(screen);

        const padLight = new THREE.PointLight(0x38bdf8, 2.0, 5);
        padLight.position.set(0, 1.16, 0.42);
        fallbackGroup.add(padLight);
      } else {
        // Leo Vance: Survey Stance
        for (const ax of [-0.38, 0.38]) {
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.62, 12), suitFabricMat);
          arm.position.set(ax, 1.18, 0);
          arm.rotation.z = ax > 0 ? -0.16 : 0.16;
          arm.castShadow = true;
          fallbackGroup.add(arm);

          // Silicone palm grip utility glove
          const glove = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 10), jointDarkMat);
          glove.position.set(ax * 1.12, 0.84, 0);
          fallbackGroup.add(glove);
        }
      }

      astroGroup.userData = { name, role, initialY: 0, breathSpeed: 1.5 + Math.random() * 0.5 };
      astronautCrewList.push(astroGroup);
      return astroGroup;
    };

    // Astronaut 1: Specialist Maya Chen (Holding Field Datapad) at (-2.2, 0, 3.2)
    const mayaMesh = createAstronautMesh('Specialist Maya Chen', 'Lead Exobiologist', 0x06b6d4, true);
    mayaMesh.position.set(-2.2, 0, 3.2);
    mayaMesh.rotation.y = -0.8;
    landingZoneGroup.add(mayaMesh);

    // Official NASA 3D Resource: Maya Chen EMU Astronaut Model
    gltfLoader.load(
      '/models/nasa/Astronaut.glb',
      (gltf) => {
        const mayaModel = gltf.scene;
        const initialBox = new THREE.Box3().setFromObject(mayaModel);
        const size = new THREE.Vector3();
        initialBox.getSize(size);

        // Scale to authentic astronaut height (~1.80m)
        const targetHeight = 1.80;
        const scaleFactor = targetHeight / (size.y > 0.1 ? size.y : 1.8);
        mayaModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Ground feet at Y = 0 and center horizontal axes
        const scaledBox = new THREE.Box3().setFromObject(mayaModel);
        mayaModel.position.y = -scaledBox.min.y;
        mayaModel.position.x = -(scaledBox.min.x + scaledBox.max.x) / 2;
        mayaModel.position.z = -(scaledBox.min.z + scaledBox.max.z) / 2;

        mayaModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Subtle Cyan Mission Beacon Light on chest
        const beacon = new THREE.PointLight(0x06b6d4, 0.45, 2.5);
        beacon.position.set(0, 1.35, 0.25);
        mayaModel.add(beacon);

        // Seamless swap: hide procedural fallback astronaut and add official NASA model
        if (mayaMesh._fallbackGroup) {
          mayaMesh._fallbackGroup.visible = false;
        }
        mayaMesh.add(mayaModel);
      },
      undefined,
      (err) => {
        console.warn('NASA Maya Astronaut failed to load, retaining procedural astronaut:', err);
      }
    );

    // Astronaut 2: Officer Leo Vance (Ops Engineer) at (-4.5, 0, -2.5)
    const leoMesh = createAstronautMesh('Officer Leo Vance', 'Surface Operations', 0xf59e0b, false);
    leoMesh.position.set(-4.5, 0, -2.5);
    leoMesh.rotation.y = 1.1;
    landingZoneGroup.add(leoMesh);

    // Official NASA 3D Resource: Leo Vance Z2 Spacesuit Model
    gltfLoader.load(
      '/models/nasa/Z2_Spacesuit.glb',
      (gltf) => {
        const leoModel = gltf.scene;
        const initialBox = new THREE.Box3().setFromObject(leoModel);
        const size = new THREE.Vector3();
        initialBox.getSize(size);

        // Check if upright or needs orientation correction
        if (size.z > size.y * 1.5) {
          leoModel.rotation.x = Math.PI / 2;
        }

        const orientedBox = new THREE.Box3().setFromObject(leoModel);
        const orientedSize = new THREE.Vector3();
        orientedBox.getSize(orientedSize);

        // Scale to authentic planetary exploration suit height (~1.85m)
        const targetHeight = 1.85;
        const scaleFactor = targetHeight / (orientedSize.y > 0.1 ? orientedSize.y : 1.85);
        leoModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Ground feet at Y = 0 and center horizontal axes
        const finalBox = new THREE.Box3().setFromObject(leoModel);
        leoModel.position.y = -finalBox.min.y;
        leoModel.position.x = -(finalBox.min.x + finalBox.max.x) / 2;
        leoModel.position.z = -(finalBox.min.z + finalBox.max.z) / 2;

        leoModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Subtle Amber Mission Beacon Light on chest
        const beacon = new THREE.PointLight(0xf59e0b, 0.45, 2.5);
        beacon.position.set(0, 1.35, 0.25);
        leoModel.add(beacon);

        // Seamless swap: hide procedural fallback astronaut and add official NASA model
        if (leoMesh._fallbackGroup) {
          leoMesh._fallbackGroup.visible = false;
        }
        leoMesh.add(leoModel);
      },
      undefined,
      (err) => {
        console.warn('NASA Leo Vance Z2 Spacesuit failed to load, retaining procedural astronaut:', err);
      }
    );

    // D. Portable High-Gain Satellite Communication Dish on Tripod
    const commsGroup = new THREE.Group();
    commsGroup.position.set(-1.0, 0, -6.5);

    for (let t = 0; t < 3; t++) {
      const tAng = (t * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8), matAluminum);
      leg.position.set(Math.cos(tAng) * 0.55, 0.75, Math.sin(tAng) * 0.55);
      leg.rotation.x = Math.sin(tAng) * 0.45;
      leg.rotation.z = -Math.cos(tAng) * 0.45;
      leg.castShadow = true;
      commsGroup.add(leg);
    }

    const commMast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 10), matAluminum);
    commMast.position.y = 1.5;
    commMast.castShadow = true;
    commsGroup.add(commMast);

    const commDish = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.25 })
    );
    commDish.position.set(0, 2.5, 0);
    commDish.rotation.x = -0.7; // Aimed up toward orbit
    commDish.rotation.y = 0.5;
    commDish.castShadow = true;
    commsGroup.add(commDish);

    const commBeacon = new THREE.PointLight(0x06b6d4, 2.2, 12);
    commBeacon.position.set(0, 2.7, 0);
    commsGroup.add(commBeacon);

    landingZoneGroup.add(commsGroup);

    // E. Stacked Mission Equipment Containers (Ruggedized Nanuk-style Crates)
    const crateMatA = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 });
    const crateMatB = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.35 });
    const crateOffsets = [
      { x: -3.2, y: 0.4, z: -4.8, rot: 0.1, mat: crateMatA },
      { x: -1.9, y: 0.4, z: -4.9, rot: -0.15, mat: crateMatB },
      { x: -2.5, y: 1.15, z: -4.85, rot: 0.05, mat: crateMatA },
      { x: -3.8, y: 0.35, z: -3.8, rot: 0.4, mat: crateMatB }
    ];
    for (const co of crateOffsets) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.75, 0.75), co.mat);
      crate.position.set(co.x, co.y, co.z);
      crate.rotation.y = co.rot;
      crate.castShadow = true;
      crate.receiveShadow = true;
      landingZoneGroup.add(crate);
    }

    // F. Two Small Ground-Deployable Solar Panel Wings
    for (let sp = 0; sp < 2; sp++) {
      const panelGroup = new THREE.Group();
      panelGroup.position.set(2.0 + sp * 2.8, 0, -7.0 + sp * 0.6);
      panelGroup.rotation.y = 0.5; // Angled toward sun (240, 75, -180)

      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.0, 8), matAluminum);
      stand.position.y = 0.5;
      stand.castShadow = true;
      panelGroup.add(stand);

      const panelWing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.9), matSolarPanel);
      panelWing.position.set(0, 0.95, 0);
      panelWing.rotation.x = -0.32;
      panelWing.castShadow = true;
      panelGroup.add(panelWing);

      landingZoneGroup.add(panelGroup);
    }

    // G. Portable Mission Terminal Console ([E] Mission Terminal)
    const terminalGroup = new THREE.Group();
    terminalGroup.position.set(-1.8, 0, 0.5);

    const termStand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.1, 10), matAluminum);
    termStand.position.y = 0.55;
    termStand.castShadow = true;
    terminalGroup.add(termStand);

    const termHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.55, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.3 })
    );
    termHead.position.set(0, 1.1, 0);
    termHead.rotation.x = -0.38;
    termHead.castShadow = true;
    terminalGroup.add(termHead);

    const termScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.76, 0.46),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    termScreen.position.set(0, 1.12, 0.07);
    termScreen.rotation.x = -0.38;
    terminalGroup.add(termScreen);

    const termLight = new THREE.PointLight(0x06b6d4, 2.5, 8);
    termLight.position.set(0, 1.3, 0.3);
    terminalGroup.add(termLight);

    landingZoneGroup.add(terminalGroup);

    // H. Ruggedized Data-Storage Containers (Sealed Lunar Memory Vaults)
    for (let c = 0; c < 2; c++) {
      const dataCanister = new THREE.Group();
      dataCanister.position.set(-2.6 + c * 0.65, 0, 1.2 + c * 0.3);

      const canisterBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.55, 16),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.25 })
      );
      canisterBody.position.y = 0.28;
      canisterBody.castShadow = true;
      dataCanister.add(canisterBody);

      // Status indicator LED ring
      const ledRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.185, 0.185, 0.04, 16),
        new THREE.MeshBasicMaterial({ color: c === 0 ? 0x06b6d4 : 0x10b981 })
      );
      ledRing.position.y = 0.38;
      dataCanister.add(ledRing);

      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.08, 0.015, 8, 16, Math.PI),
        matAluminum
      );
      handle.position.set(0, 0.56, 0);
      handle.rotation.x = Math.PI;
      dataCanister.add(handle);

      landingZoneGroup.add(dataCanister);
    }

    // I. Flexible Heavy-Duty Cable Connections in Zone 1
    const createCable = (p1, p2, sag = 0.15) => {
      const mid = new THREE.Vector3(
        (p1.x + p2.x) * 0.5,
        Math.min(p1.y, p2.y) - sag,
        (p1.z + p2.z) * 0.5
      );
      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.025, 6, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85, metalness: 0.1 });
      return new THREE.Mesh(tubeGeo, tubeMat);
    };

    // Solar Panel 1 -> Mission Terminal
    landingZoneGroup.add(createCable(
      new THREE.Vector3(2.0, 0.2, -7.0),
      new THREE.Vector3(-1.8, 0.2, 0.5),
      0.18
    ));
    // Solar Panel 2 -> Mission Terminal
    landingZoneGroup.add(createCable(
      new THREE.Vector3(4.8, 0.2, -6.4),
      new THREE.Vector3(-1.8, 0.2, 0.5),
      0.20
    ));
    // Mission Terminal -> High Gain Comms Dish
    landingZoneGroup.add(createCable(
      new THREE.Vector3(-1.8, 0.2, 0.5),
      new THREE.Vector3(-1.0, 0.2, -6.5),
      0.16
    ));

    // J. Portable Laser Raman Spectrometer on Mini-Tripod beside Maya Chen
    const specGroup = new THREE.Group();
    specGroup.position.set(-1.4, 0, 3.8);

    for (let t = 0; t < 3; t++) {
      const tAng = (t * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.85, 8), matAluminum);
      leg.position.set(Math.cos(tAng) * 0.22, 0.38, Math.sin(tAng) * 0.22);
      leg.rotation.x = Math.sin(tAng) * 0.35;
      leg.rotation.z = -Math.cos(tAng) * 0.35;
      specGroup.add(leg);
    }

    const specHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.22, 0.38),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 })
    );
    specHead.position.y = 0.78;
    specGroup.add(specHead);

    const specLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 0.1, 16),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    specLens.rotation.x = 0.5;
    specLens.position.set(0, 0.72, 0.22);
    specGroup.add(specLens);

    const specLight = new THREE.PointLight(0xa855f7, 1.8, 5);
    specLight.position.set(0, 0.72, 0.26);
    specGroup.add(specLight);

    landingZoneGroup.add(specGroup);

    // K. Small Basalt Rocks Scattered Around Landing Zone
    for (let r = 0; r < 18; r++) {
      const rAng = Math.random() * Math.PI * 2;
      const rDist = 3.5 + Math.random() * 14;
      const rock = new THREE.Mesh(rockGeoC, rockMat);
      const rScale = 0.25 + Math.random() * 0.45;
      rock.scale.set(rScale, rScale * 0.65, rScale);
      rock.position.set(Math.cos(rAng) * rDist, rScale * 0.2, Math.sin(rAng) * rDist);
      rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      rock.castShadow = true;
      landingZoneGroup.add(rock);
    }

    // I. Static Astronaut EVA Footprints Leading West Toward Surveyor 1
    const landingFootprints = [
      { x: -1.0, z: 1.2, rot: -2.1 },
      { x: -2.8, z: 2.2, rot: -2.1 },
      { x: -5.0, z: 3.4, rot: -2.2 },
      { x: -8.0, z: 4.8, rot: -2.1 },
      { x: -12.0, z: 6.2, rot: -2.0 },
      { x: -16.5, z: 7.5, rot: -2.0 },
      { x: -22.0, z: 9.0, rot: -2.1 }
    ];
    for (let i = 0; i < landingFootprints.length; i++) {
      const fp = landingFootprints[i];
      const isRight = i % 2 === 0;
      const offsetSide = isRight ? 0.2 : -0.2;
      const printMesh = new THREE.Mesh(bootprintGeo, bootprintMat);
      printMesh.position.set(fp.x + Math.sin(fp.rot) * offsetSide, 0.04, fp.z - Math.cos(fp.rot) * offsetSide);
      printMesh.rotation.y = fp.rot;
      landingZoneGroup.add(printMesh);
    }

    scene.add(landingZoneGroup);

    // =========================================================================
    // 12. ZONE 3 — CRATER INVESTIGATION AREA (X: -75, Z: -50)
    // =========================================================================
    const craterInvestigationGroup = new THREE.Group();
    const craterCenterY = getTerrainHeight(-75, -50);
    craterInvestigationGroup.position.set(-75, craterCenterY, -50);

    // A. Massive Basalt Boulders Ringing the Irregular Medium Crater Rim (Radius ~11.5 - 13.5m)
    const rimBoulderGeo = createMediumPolyRockGeo(1.8, 2, 0.32);
    const rimAngles = [0.15, 0.72, 1.35, 2.05, 2.78, 3.52, 4.25, 4.95, 5.75];
    for (let i = 0; i < rimAngles.length; i++) {
      const angle = rimAngles[i];
      const radius = 11.8 + (i % 3) * 1.2;
      const bx = Math.cos(angle) * radius;
      const bz = Math.sin(angle) * radius;
      const worldX = -75 + bx;
      const worldZ = -50 + bz;
      const by = getTerrainHeight(worldX, worldZ) - craterCenterY;

      const boulder = new THREE.Mesh(rimBoulderGeo, rockMat);
      const bScale = 0.95 + (i % 4) * 0.35;
      boulder.scale.set(bScale * 1.1, bScale * 0.85, bScale * 1.05);
      boulder.position.set(bx, by + bScale * 0.35, bz);
      boulder.rotation.set((i * 1.3) % Math.PI, (i * 0.7) % Math.PI, (i * 0.9) % Math.PI);
      boulder.castShadow = true;
      boulder.receiveShadow = true;
      craterInvestigationGroup.add(boulder);
    }

    // B. Inner Talus Scree & Angular Rocks Tumbling Down Crater Walls
    for (let s = 0; s < 22; s++) {
      const sAng = (s * Math.PI * 2) / 22 + (s % 3) * 0.2;
      const sRad = 4.8 + (s % 5) * 1.4;
      const sx = Math.cos(sAng) * sRad;
      const sz = Math.sin(sAng) * sRad;
      const worldX = -75 + sx;
      const worldZ = -50 + sz;
      const sy = getTerrainHeight(worldX, worldZ) - craterCenterY;

      const rock = new THREE.Mesh(rockGeoSmallStone, rockMat);
      const rScale = 0.5 + Math.random() * 0.7;
      rock.scale.set(rScale, rScale * 0.6, rScale);
      rock.position.set(sx, sy + rScale * 0.18, sz);
      rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      rock.castShadow = true;
      craterInvestigationGroup.add(rock);
    }

    // C. Partially Buried Metallic Precursor Object (Embedded in lower wall/floor at X: -78, Z: -54)
    const buriedObjGroup = new THREE.Group();
    const buriedWorldY = getTerrainHeight(-78, -54);
    buriedObjGroup.position.set(-3.0, buriedWorldY - craterCenterY, -4.0);
    buriedObjGroup.rotation.set(0.42, -0.65, 0.28); // Protruding at an angle from the regolith

    // Alien Non-Human Precursor Geometric Prismatic Monolith Core
    const buriedMonolithGeo = new THREE.CylinderGeometry(0.9, 1.4, 4.8, 8);
    const buriedMonolithMat = new THREE.MeshStandardMaterial({
      map: alienGlyphMap,
      color: 0x0e1122,
      emissive: 0x818cf8,
      emissiveIntensity: 0.65,
      metalness: 0.98,
      roughness: 0.12
    });
    const buriedMonolith = new THREE.Mesh(buriedMonolithGeo, buriedMonolithMat);
    buriedMonolith.position.y = 1.4;
    buriedMonolith.castShadow = true;
    buriedObjGroup.add(buriedMonolith);

    // Anomalous 432 Hz Resonant Purple Light
    const buriedObjectLight = new THREE.PointLight(0xa855f7, 4.5, 22);
    buriedObjectLight.position.set(0, 2.5, 0);
    buriedObjGroup.add(buriedObjectLight);

    // Glowing Geometric Ring Emitting from Soil Breach
    const groundBreachRing = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 2.6, 32),
      new THREE.MeshBasicMaterial({ color: 0x818cf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    groundBreachRing.rotation.x = -Math.PI / 2;
    groundBreachRing.position.y = 0.08;
    buriedObjGroup.add(groundBreachRing);

    craterInvestigationGroup.add(buriedObjGroup);

    // D. 3 Survey Pylon Markers for the 3-Location Handheld Scanner Puzzle
    const createSurveyPylon = (id, beaconColor, px, pz) => {
      const pylonGroup = new THREE.Group();
      const worldY = getTerrainHeight(px, pz);
      pylonGroup.position.set(px - (-75), worldY - craterCenterY, pz - (-50));

      for (let t = 0; t < 3; t++) {
        const tAng = (t * Math.PI * 2) / 3;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), matAluminum);
        leg.position.set(Math.cos(tAng) * 0.35, 0.5, Math.sin(tAng) * 0.35);
        leg.rotation.x = Math.sin(tAng) * 0.35;
        leg.rotation.z = -Math.cos(tAng) * 0.35;
        pylonGroup.add(leg);
      }

      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8), matAluminum);
      mast.position.y = 1.0;
      pylonGroup.add(mast);

      const beaconGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const beaconMat = new THREE.MeshBasicMaterial({ color: beaconColor });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.y = 1.8;
      pylonGroup.add(beaconMesh);

      const beaconLight = new THREE.PointLight(beaconColor, 2.5, 12);
      beaconLight.position.y = 1.8;
      pylonGroup.add(beaconLight);

      return pylonGroup;
    };

    // Site Alpha (North Rim Outcrop) at (-68, -40) - Amber Beacon (22% resonance)
    const pylonAlpha = createSurveyPylon('poi_crater_site_alpha', 0xf59e0b, -68, -40);
    craterInvestigationGroup.add(pylonAlpha);

    // Site Beta (Inner Scree Slope) at (-74, -48) - Cyan Beacon (54% resonance)
    const pylonBeta = createSurveyPylon('poi_crater_site_beta', 0x06b6d4, -74, -48);
    craterInvestigationGroup.add(pylonBeta);

    // Site Gamma (Buried Metallic Object) at (-78, -54) - Purple Beacon (99.4% resonance)
    const pylonGamma = createSurveyPylon('poi_crater_site_gamma', 0xa855f7, -78, -54);
    craterInvestigationGroup.add(pylonGamma);

    scene.add(craterInvestigationGroup);

    // =========================================================================
    // 13. ZONE 4 — ALIEN STRUCTURE DISCOVERY (X: -120, Z: -75)
    // =========================================================================
    const alienStructureGroup = new THREE.Group();
    const alienTerrainY = getTerrainHeight(-120, -75);
    alienStructureGroup.position.set(-120, alienTerrainY, -75);

    // A. Monumental Obsidian Polyhedral Monolith (High-Detail Geometric Carapace)
    const alienHullMat = new THREE.MeshStandardMaterial({
      map: alienGlyphMap,
      color: 0x05070e,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      metalness: 0.98,
      roughness: 0.08
    });
    const alienRuneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8
    });

    // Heavy Octagonal Sub-Bedrock Foundation Plinth
    const monolithFoundation = new THREE.Mesh(
      new THREE.CylinderGeometry(4.4, 5.0, 0.8, 8),
      alienHullMat
    );
    monolithFoundation.position.y = 0.4;
    monolithFoundation.rotation.y = 0.38;
    monolithFoundation.receiveShadow = true;
    alienStructureGroup.add(monolithFoundation);

    // Stepped Inner Base Collar with Beveled Edge
    const monolithCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 4.2, 0.6, 8),
      alienHullMat
    );
    monolithCollar.position.y = 1.0;
    monolithCollar.rotation.y = 0.38;
    monolithCollar.castShadow = true;
    monolithCollar.receiveShadow = true;
    alienStructureGroup.add(monolithCollar);

    // Primary Faceted Tapered Polyhedral Core (Obsidian monolith body)
    const monolithCore = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 3.5, 6.2, 8),
      alienHullMat
    );
    monolithCore.position.y = 4.1;
    monolithCore.rotation.y = 0.38;
    monolithCore.castShadow = true;
    monolithCore.receiveShadow = true;
    alienStructureGroup.add(monolithCore);

    // Beveled Apex Pyramidal Cap
    const monolithApex = new THREE.Mesh(
      new THREE.ConeGeometry(2.22, 1.6, 8),
      alienHullMat
    );
    monolithApex.position.y = 7.95;
    monolithApex.rotation.y = 0.38;
    monolithApex.castShadow = true;
    alienStructureGroup.add(monolithApex);

    // 8 Recessed Glowing Cyan Circuit Channels along Monolith Vertical Ribs
    for (let r = 0; r < 8; r++) {
      const rAng = (r * Math.PI * 2) / 8 + 0.38;
      const runeStrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 5.4, 0.08),
        alienRuneMat
      );
      const stripRadius = 2.8;
      runeStrip.position.set(Math.cos(rAng) * stripRadius, 4.0, Math.sin(rAng) * stripRadius);
      runeStrip.rotation.y = -rAng + Math.PI / 2;
      alienStructureGroup.add(runeStrip);

      // Node emitters along the ribs
      for (const ny of [2.2, 4.0, 5.8]) {
        const nodeDot = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 8, 8),
          alienRuneMat
        );
        nodeDot.position.set(Math.cos(rAng) * (stripRadius + 0.04), ny, Math.sin(rAng) * (stripRadius + 0.04));
        alienStructureGroup.add(nodeDot);
      }
    }

    // B. 4 Massive Angular Anchoring Pylons Fusing into Lunar Bedrock
    for (let p = 0; p < 4; p++) {
      const pAng = (p * Math.PI * 2) / 4 + 0.38 + Math.PI / 8;
      const pylonGroup = new THREE.Group();
      pylonGroup.position.set(Math.cos(pAng) * 3.6, 0.6, Math.sin(pAng) * 3.6);
      pylonGroup.rotation.y = -pAng;

      // Heavy angled pylon spine
      const pylonSpine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.95, 4.6, 6),
        alienHullMat
      );
      pylonSpine.rotation.z = 0.48; // Leaning inward toward monolith
      pylonSpine.position.set(-0.8, 1.8, 0);
      pylonSpine.castShadow = true;
      pylonSpine.receiveShadow = true;
      pylonGroup.add(pylonSpine);

      // Glowing Runic Inlay Channel on outer face of pylon
      const pylonRune = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 3.8, 0.08),
        alienRuneMat
      );
      pylonRune.rotation.z = 0.48;
      pylonRune.position.set(-0.8 + 0.35 * Math.sin(0.48), 1.8, 0.32);
      pylonGroup.add(pylonRune);

      // Bedrock anchoring foot flange
      const pylonFoot = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.4, 1.4),
        alienHullMat
      );
      pylonFoot.position.set(-0.2, 0.2, 0);
      pylonFoot.castShadow = true;
      pylonFoot.receiveShadow = true;
      pylonGroup.add(pylonFoot);

      alienStructureGroup.add(pylonGroup);
    }

    // C. Central Scanning Aperture & Energy Interface (Front Facet at Z+)
    const scanPortalGroup = new THREE.Group();
    scanPortalGroup.position.set(0, 2.5, 3.0);
    scanPortalGroup.rotation.x = -0.18; // Angled ergonomic tilt

    // Heavy Beveled Outer Portal Casing
    const portalCasing = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 2.3, 0.32),
      alienHullMat
    );
    portalCasing.castShadow = true;
    scanPortalGroup.add(portalCasing);

    // Multi-Tier Concentric Iris Aperture Rings
    const irisOuterRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.08, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.15 })
    );
    irisOuterRim.position.z = 0.16;
    scanPortalGroup.add(irisOuterRim);

    // 8 Angular Interlocking Mechanical Iris Vanes
    for (let v = 0; v < 8; v++) {
      const vAng = (v * Math.PI * 2) / 8;
      const vane = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.42, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.96, roughness: 0.2 })
      );
      vane.position.set(Math.cos(vAng) * 0.48, Math.sin(vAng) * 0.48, 0.17);
      vane.rotation.z = vAng + 0.55;
      scanPortalGroup.add(vane);
    }

    // Central Singularity Event-Horizon Core (Vibrant Deep Cyan Aperture)
    const irisCore = new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 32),
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9, side: THREE.DoubleSide })
    );
    irisCore.position.z = 0.18;
    scanPortalGroup.add(irisCore);

    // Interactive Frosted Holographic Scanning Panel
    const scanPanelGeo = new THREE.PlaneGeometry(1.3, 1.6);
    const scanPanelMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
      roughness: 0.06,
      metalness: 0.95,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide
    });
    const scanPanel = new THREE.Mesh(scanPanelGeo, scanPanelMat);
    scanPanel.position.z = 0.22;
    scanPortalGroup.add(scanPanel);

    alienStructureGroup.add(scanPortalGroup);

    // D. Vertical Atmospheric Vacuum Energy Beam Shooting Skyward
    const energyBeamGeo = new THREE.CylinderGeometry(0.06, 0.38, 32, 16);
    const energyBeamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending
    });
    const energyBeam = new THREE.Mesh(energyBeamGeo, energyBeamMat);
    energyBeam.position.set(0, 18, 0);
    alienStructureGroup.add(energyBeam);

    // Secondary Inner High-Frequency Laser Core
    const laserCoreGeo = new THREE.CylinderGeometry(0.02, 0.08, 32, 8);
    const laserCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const laserCore = new THREE.Mesh(laserCoreGeo, laserCoreMat);
    laserCore.position.set(0, 18, 0);
    alienStructureGroup.add(laserCore);

    // E. Counter-Rotating Levitating Geometric Crystalline Shards (Apex Orbit)
    const floatingShardGroup = new THREE.Group();
    floatingShardGroup.position.set(0, 7.8, 0);
    const shardGeoA = new THREE.OctahedronGeometry(0.48, 0);
    const shardGeoB = new THREE.CylinderGeometry(0.18, 0.28, 0.72, 6);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.95,
      metalness: 0.96,
      roughness: 0.08
    });

    const floatingShards = [];
    for (let s = 0; s < 6; s++) {
      const sAng = (s * Math.PI * 2) / 6;
      const isInner = s % 2 === 0;
      const sRadius = isInner ? 2.1 : 3.2;
      const sHeight = (s % 3) * 0.45;
      const sGeo = isInner ? shardGeoA : shardGeoB;

      const shardMesh = new THREE.Mesh(sGeo, shardMat);
      shardMesh.position.set(Math.cos(sAng) * sRadius, sHeight, Math.sin(sAng) * sRadius);
      shardMesh.rotation.set(s * 0.4, s * 0.7, s * 0.2);
      shardMesh.castShadow = true;
      floatingShardGroup.add(shardMesh);

      floatingShards.push({
        mesh: shardMesh,
        angle: sAng,
        dist: sRadius,
        height: sHeight,
        rotSpeed: isInner ? 1.2 : -0.9
      });
    }
    alienStructureGroup.add(floatingShardGroup);

    // F. Faint Pulsing Alien Illumination Source
    const alienGlowLight = new THREE.PointLight(0x00d2ff, 1.8, 20);
    alienGlowLight.position.set(0, 3.8, 2.8);
    alienStructureGroup.add(alienGlowLight);

    // G. Levitating Luminescent Particle Nebula
    const alienParticleCount = 220;
    const alienParticleGeo = new THREE.BufferGeometry();
    const alienPartPositions = new Float32Array(alienParticleCount * 3);
    for (let i = 0; i < alienParticleCount; i++) {
      const aAng = Math.random() * Math.PI * 2;
      const aRad = 1.2 + Math.random() * 8.5;
      alienPartPositions[i * 3] = Math.cos(aAng) * aRad;
      alienPartPositions[i * 3 + 1] = 0.4 + Math.random() * 9.5;
      alienPartPositions[i * 3 + 2] = Math.sin(aAng) * aRad;
    }
    alienParticleGeo.setAttribute('position', new THREE.BufferAttribute(alienPartPositions, 3));
    const alienParticleMat = new THREE.PointsMaterial({
      map: dustParticleTex,
      size: 0.44,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const alienMotes = new THREE.Points(alienParticleGeo, alienParticleMat);
    alienStructureGroup.add(alienMotes);

    scene.add(alienStructureGroup);

    // H. Dark Subterranean Data Conduit Cable with In-line Quantum Repeaters
    const conduitPoints = [
      new THREE.Vector3(-120, getTerrainHeight(-120, -75) + 0.14, -75),
      new THREE.Vector3(-96, getTerrainHeight(-96, -62) + 0.14, -62),
      new THREE.Vector3(-75, getTerrainHeight(-75, -50) + 0.14, -50),
      new THREE.Vector3(-42, getTerrainHeight(-42, -28) + 0.14, -28),
      new THREE.Vector3(-18, getTerrainHeight(-18, -12) + 0.14, -12),
      new THREE.Vector3(0, surveyorTerrainY + 0.14, 0)
    ];
    const conduitCurve = new THREE.CatmullRomCurve3(conduitPoints);
    const conduitTubeGeo = new THREE.TubeGeometry(conduitCurve, 84, 0.20, 10, false);
    const conduitMat = new THREE.MeshStandardMaterial({
      color: 0x070912,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.7,
      metalness: 0.96,
      roughness: 0.18
    });
    const conduitMesh = new THREE.Mesh(conduitTubeGeo, conduitMat);
    conduitMesh.castShadow = true;
    scene.add(conduitMesh);

    // 5 In-Line Quantum Signal Repeaters with Glowing Couping Collars along the conduit
    for (let c = 1; c <= 5; c++) {
      const u = c / 6;
      const cPoint = conduitCurve.getPointAt(u);
      const repeaterGroup = new THREE.Group();
      repeaterGroup.position.copy(cPoint);

      const repeaterChassis = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.55, 12),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.94, roughness: 0.2 })
      );
      repeaterChassis.rotation.z = Math.PI / 2;
      repeaterChassis.castShadow = true;
      repeaterGroup.add(repeaterChassis);

      const repeaterRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.34, 0.04, 12, 24),
        alienRuneMat
      );
      repeaterGroup.add(repeaterRing);

      scene.add(repeaterGroup);
    }

    // =========================================================================
    // 14. ZONE 5 — MISSION ECHO INTERFACE (X: -116, Z: -72)
    // =========================================================================
    const missionEchoGroup = new THREE.Group();
    const echoTerrainY = getTerrainHeight(-116, -72);
    missionEchoGroup.position.set(-116, echoTerrainY, -72);

    // A. Stepped Octagonal Holographic Dais Pedestal
    const holoPedestalGeo = new THREE.CylinderGeometry(3.2, 3.6, 0.32, 8);
    const holoPedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0b0e17,
      metalness: 0.94,
      roughness: 0.22
    });
    const holoPedestal = new THREE.Mesh(holoPedestalGeo, holoPedestalMat);
    holoPedestal.position.y = 0.16;
    holoPedestal.receiveShadow = true;
    holoPedestal.castShadow = true;
    missionEchoGroup.add(holoPedestal);

    // Chamfered Outer Bronze/Titanium Rim Collar
    const pedestalRim = new THREE.Mesh(
      new THREE.CylinderGeometry(3.35, 3.45, 0.10, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.15 })
    );
    pedestalRim.position.y = 0.32;
    missionEchoGroup.add(pedestalRim);

    // 3 Concentric Glowing Holographic Floor Emitter Rings
    const ringRadii = [1.2, 1.85, 2.55];
    for (let r = 0; r < 3; r++) {
      const ringGeo = new THREE.RingGeometry(ringRadii[r], ringRadii[r] + 0.12, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: r === 1 ? 0x06b6d4 : 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.82
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.34 + r * 0.02;
      missionEchoGroup.add(ring);
    }

    // Central Sunken Projector Core Emitter
    const projLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.38, 0.15, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    projLens.position.y = 0.35;
    missionEchoGroup.add(projLens);

    // B. Reconstructed High-Fidelity Holographic Surveyor 1 Model (Volumetric Floating at Y: 2.2m)
    const holoSurveyorGroup = new THREE.Group();
    holoSurveyorGroup.position.set(0, 2.2, 0);

    const holoWireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const holoNodeMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4
    });

    // Triangular Open Space Frame (Central Core)
    const holoSpaceFrame = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 1.15, 1.25, 3),
      holoWireMat
    );
    holoSurveyorGroup.add(holoSpaceFrame);

    // 3 Articulated Tripod Landing Legs with Honeycomb Footpads
    for (let l = 0; l < 3; l++) {
      const lAng = (l * Math.PI * 2) / 3;
      const legGroup = new THREE.Group();
      legGroup.rotation.y = lAng;

      // Upper strut
      const hStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.6, 6), holoWireMat);
      hStrut.position.set(0.8, -0.3, 0);
      hStrut.rotation.z = -0.65;
      legGroup.add(hStrut);

      // Footpad
      const hPad = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 8), holoWireMat);
      hPad.position.set(1.4, -0.85, 0);
      legGroup.add(hPad);

      // Joint telemetry node
      const hNode = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), holoNodeMat);
      hNode.position.set(1.4, -0.85, 0);
      legGroup.add(hNode);

      holoSurveyorGroup.add(legGroup);
    }

    // 3 Vernier Descent Engine Nozzles (Wireframe)
    for (let v = 0; v < 3; v++) {
      const vAng = (v * Math.PI * 2) / 3 + Math.PI / 3;
      const hNozzle = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 8, 1, true), holoWireMat);
      hNozzle.position.set(Math.cos(vAng) * 0.65, -0.65, Math.sin(vAng) * 0.65);
      holoSurveyorGroup.add(hNozzle);
    }

    // Vidicon TV Camera Mast & Turret Hood
    const hCamMast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), holoWireMat);
    hCamMast.position.set(-0.35, 0.45, 0.35);
    holoSurveyorGroup.add(hCamMast);

    const hCamHood = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.32), holoWireMat);
    hCamHood.position.set(-0.35, 0.95, 0.35);
    holoSurveyorGroup.add(hCamHood);

    // Central Telemetry Mast & Planar Solar Array
    const hSolarMast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.6, 6), holoWireMat);
    hSolarMast.position.y = 1.35;
    holoSurveyorGroup.add(hSolarMast);

    const hSolarPanel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.03, 0.65), holoWireMat);
    hSolarPanel.position.set(0, 2.1, 0.1);
    hSolarPanel.rotation.x = 0.32;
    holoSurveyorGroup.add(hSolarPanel);

    // High-Gain Planar Antenna
    const hHighGain = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.03, 12), holoWireMat);
    hHighGain.position.set(0.65, 2.0, -0.15);
    hHighGain.rotation.x = -0.45;
    holoSurveyorGroup.add(hHighGain);

    missionEchoGroup.add(holoSurveyorGroup);

    // C. 3 Interactive Floating Curved Holographic Data Screens
    const dataFragments = [];
    const screenAngles = [-0.65, 0, 0.65];
    for (let d = 0; d < 3; d++) {
      const sAng = screenAngles[d];
      const screenGroup = new THREE.Group();
      const sDist = 2.4;
      screenGroup.position.set(Math.sin(sAng) * sDist, 2.0 + (d % 2) * 0.25, Math.cos(sAng) * sDist);
      screenGroup.rotation.y = sAng + Math.PI;

      // Holographic Screen Outer Wireframe Frame
      const frameGeo = new THREE.PlaneGeometry(1.05, 0.68);
      const frameMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        wireframe: true,
        transparent: true,
        opacity: 0.65
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      screenGroup.add(frameMesh);

      // Semi-Transparent Glowing Cyan Display Pane
      const paneGeo = new THREE.PlaneGeometry(0.98, 0.62);
      const paneMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.42
      });
      const paneMesh = new THREE.Mesh(paneGeo, paneMat);
      paneMesh.position.z = 0.01;
      screenGroup.add(paneMesh);

      // Interactive Corner Bracket Accents
      for (const cx of [-0.49, 0.49]) {
        for (const cy of [-0.31, 0.31]) {
          const corner = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.08, 0.02),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
          );
          corner.position.set(cx, cy, 0.02);
          screenGroup.add(corner);
        }
      }

      missionEchoGroup.add(screenGroup);
      dataFragments.push(screenGroup);
    }

    // High-Luminance Volumetric Projection Point Light
    const echoLight = new THREE.PointLight(0x38bdf8, 3.8, 22);
    echoLight.position.set(0, 2.6, 0);
    missionEchoGroup.add(echoLight);

    scene.add(missionEchoGroup);

    // =========================================================================
    // 15. ZONE 6 — RECOVERY AND EXTRACTION AREA (SURVEYOR 1 SITE AT X: 0, Z: 0)
    // =========================================================================
    const recoveryRigGroup = new THREE.Group();
    recoveryRigGroup.position.set(0, surveyorTerrainY, 0);

    // A. 3 Heavy Industrial Telescoping Gantry Towers with Hazard Striping
    const gantryPillars = [];
    for (let g = 0; g < 3; g++) {
      const gAng = (g * Math.PI * 2) / 3 + 0.35;
      const gGroup = new THREE.Group();
      gGroup.position.set(Math.cos(gAng) * 3.8, 0, Math.sin(gAng) * 3.8);
      gGroup.rotation.y = -gAng - Math.PI / 2;

      // Heavy Triangular Baseplate with Bedrock Anchor Hex Bolts
      const baseplate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.65, 0.16, 6),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.94, roughness: 0.22 })
      );
      baseplate.position.y = 0.08;
      baseplate.castShadow = true;
      baseplate.receiveShadow = true;
      gGroup.add(baseplate);

      // 6 Anchor Bolts
      for (let b = 0; b < 6; b++) {
        const bAng = (b * Math.PI * 2) / 6;
        const bolt = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6),
          new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.98, roughness: 0.1 })
        );
        bolt.position.set(Math.cos(bAng) * 0.45, 0.18, Math.sin(bAng) * 0.45);
        gGroup.add(bolt);
      }

      // Outer Structural Steel Column Mast with OSHA Hazard Stripes
      const outerColumn = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 3.2, 0.32),
        new THREE.MeshStandardMaterial({
          map: hazardStripeMap,
          metalness: 0.88,
          roughness: 0.28
        })
      );
      outerColumn.position.y = 1.68;
      outerColumn.castShadow = true;
      gGroup.add(outerColumn);

      // Inner Telescoping Hydraulic Lift Ram (Polished Chrome)
      const innerRam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.10, 0.10, 1.8, 16),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.99, roughness: 0.04 })
      );
      innerRam.position.y = 2.8;
      gGroup.add(innerRam);

      // Top Gantry Cross-Head Collar
      const crossHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.24, 0.38),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.92, roughness: 0.25 })
      );
      crossHead.position.y = 3.6;
      crossHead.castShadow = true;
      gGroup.add(crossHead);

      // Rotating Amber Emergency Strobe Beacon Dome
      const beaconBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.14, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.2 })
      );
      beaconBase.position.y = 3.76;
      gGroup.add(beaconBase);

      const beaconDome = new THREE.Mesh(
        new THREE.CylinderGeometry(0.10, 0.12, 0.18, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.85, roughness: 0.1 })
      );
      beaconDome.position.y = 3.88;
      gGroup.add(beaconDome);

      // Small Amber Warning Light
      const strobeLight = new THREE.PointLight(0xf59e0b, 1.2, 7);
      strobeLight.position.y = 3.95;
      gGroup.add(strobeLight);

      // Articulated Stabilizer Clamp Arm Extending toward Surveyor 1 Frame
      const armGroup = new THREE.Group();
      armGroup.position.set(0, 3.4, 0);

      // Upper Hydraulic Box Boom
      const boom = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.16, 2.2),
        new THREE.MeshStandardMaterial({ map: hazardStripeMap, metalness: 0.88, roughness: 0.3 })
      );
      boom.position.set(0, -0.6, 1.1);
      boom.rotation.x = -0.45;
      boom.castShadow = true;
      armGroup.add(boom);

      // Polished Chrome Actuator Cylinder Rod
      const actRod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.4, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.99, roughness: 0.04 })
      );
      actRod.position.set(0, -0.7, 1.1);
      actRod.rotation.x = -0.45;
      armGroup.add(actRod);

      // Dual Articulated Hydraulic Hose Lines
      const hoseCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.10, 0, 0),
        new THREE.Vector3(-0.16, -0.5, 0.8),
        new THREE.Vector3(-0.08, -1.1, 2.1)
      ]);
      const hoseMesh = new THREE.Mesh(
        new THREE.TubeGeometry(hoseCurve, 16, 0.022, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x0a0d14, roughness: 0.92 })
      );
      armGroup.add(hoseMesh);

      // Soft-Touch Molded Silicone Stabilization Clamp Pad
      const clampPad = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.28, 0.18),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85, metalness: 0.2 })
      );
      clampPad.position.set(0, -1.15, 2.2);
      clampPad.castShadow = true;
      armGroup.add(clampPad);

      gGroup.add(armGroup);
      recoveryRigGroup.add(gGroup);
      gantryPillars.push(gGroup);
    }

    // B. Quantum Data-Storage Vault (Q-SSD) clamped securely to Surveyor 1 Telemetry Mast
    const qVaultGroup = new THREE.Group();
    qVaultGroup.position.set(0.6, 2.8, 0.5);

    // Milled Aluminum Radiation-Hardened Enclosure
    const qVaultChassis = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.48, 0.46),
      new THREE.MeshStandardMaterial({
        map: carbonFiberMap,
        color: 0x1e293b,
        metalness: 0.92,
        roughness: 0.25
      })
    );
    qVaultChassis.castShadow = true;
    qVaultGroup.add(qVaultChassis);

    // Lateral Heat-Sink Radiator Cooling Fins
    for (const hx of [-0.37, 0.37]) {
      for (let f = 0; f < 5; f++) {
        const fin = new THREE.Mesh(
          new THREE.BoxGeometry(0.015, 0.38, 0.05),
          new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.96, roughness: 0.15 })
        );
        fin.position.set(hx, 0, -0.15 + f * 0.075);
        qVaultGroup.add(fin);
      }
    }

    // Top Digital Status LED Array Bezel
    const qStatusLed = new THREE.PointLight(0x10b981, 2.2, 8);
    qStatusLed.position.set(0, 0.32, 0);
    qVaultGroup.add(qStatusLed);

    const qStatusIndicator = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    qStatusIndicator.position.set(0, 0.26, 0.18);
    qVaultGroup.add(qStatusIndicator);

    // Mast Mounting Clamps
    const qClamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.52, 12),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.15 })
    );
    qClamp.position.set(-0.38, 0, 0);
    qVaultGroup.add(qClamp);

    recoveryRigGroup.add(qVaultGroup);

    // C. Heavy-Duty Mobile Extraction Pallet & Transport Sled (at X: 3.8, Z: -2.6)
    const extractionPalletGroup = new THREE.Group();
    extractionPalletGroup.position.set(3.8, 0, -2.6);
    extractionPalletGroup.rotation.y = -0.5;

    // Heavy Titanium Dual Runner Skids with Regolith Gliding Bevels
    for (const sx of [-0.95, 0.95]) {
      const runner = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.18, 3.6),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.94, roughness: 0.15 })
      );
      runner.position.set(sx, 0.09, 0);
      runner.castShadow = true;
      runner.receiveShadow = true;
      extractionPalletGroup.add(runner);

      // Curved front nose ski tip
      const runnerTip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.24, 8),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.94, roughness: 0.15 })
      );
      runnerTip.rotation.z = Math.PI / 2;
      runnerTip.position.set(sx, 0.16, 1.8);
      extractionPalletGroup.add(runnerTip);
    }

    // Heavy Structural Deck Platform
    const palletDeck = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.16, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 })
    );
    palletDeck.position.y = 0.26;
    palletDeck.castShadow = true;
    palletDeck.receiveShadow = true;
    extractionPalletGroup.add(palletDeck);

    // Welded Tubular Steel Perimeter Roll Cage with Hazard Stripes
    const cageMat = new THREE.MeshStandardMaterial({
      map: hazardStripeMap,
      metalness: 0.88,
      roughness: 0.3
    });
    for (const cx of [-1.1, 1.1]) {
      const cageRail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.4, 8), cageMat);
      cageRail.rotation.x = Math.PI / 2;
      cageRail.position.set(cx, 0.65, 0);
      extractionPalletGroup.add(cageRail);

      for (const cz of [-1.5, 0, 1.5]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8), cageMat);
        post.position.set(cx, 0.45, cz);
        extractionPalletGroup.add(post);
      }
    }

    // Articulated Front Towing Hitch Tongue with Red Steel Recovery Shackle
    const hitchTongue = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.10, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.92, roughness: 0.25 })
    );
    hitchTongue.position.set(0, 0.22, 2.1);
    extractionPalletGroup.add(hitchTongue);

    const recoveryShackle = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.035, 12, 16),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.92, roughness: 0.2 })
    );
    recoveryShackle.position.set(0, 0.22, 2.55);
    extractionPalletGroup.add(recoveryShackle);

    // Cryogenic Precursor Sample Dewar Pressure Vessel
    const dewarGroup = new THREE.Group();
    dewarGroup.position.set(0.55, 0.34, 0.1);

    // Double-walled vacuum-insulated stainless steel pressure vessel
    const dewarTank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 1.35, 24),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.96, roughness: 0.08 })
    );
    dewarTank.position.y = 0.68;
    dewarTank.castShadow = true;
    dewarGroup.add(dewarTank);

    // Heavy Anodized Clamping Bands
    for (const by of [0.35, 1.05]) {
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.435, 0.435, 0.08, 24),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.92, roughness: 0.15 })
      );
      band.position.y = by;
      dewarGroup.add(band);
    }

    // Top Dome Manifold with Dual Analog Pressure Gauges
    const dewarDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.94, roughness: 0.12 })
    );
    dewarDome.position.y = 1.35;
    dewarGroup.add(dewarDome);

    // Dual Pressure Gauges with Dial Needles
    for (const gx of [-0.14, 0.14]) {
      const gaugeHousing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.065, 0.04, 16),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.92, roughness: 0.2 })
      );
      gaugeHousing.rotation.x = Math.PI / 2;
      gaugeHousing.position.set(gx, 1.48, 0.28);
      dewarGroup.add(gaugeHousing);

      const gaugeFace = new THREE.Mesh(
        new THREE.CircleGeometry(0.055, 16),
        new THREE.MeshBasicMaterial({ color: 0xf1f5f9 })
      );
      gaugeFace.position.set(gx, 1.48, 0.305);
      dewarGroup.add(gaugeFace);
    }

    // Venting Frost Exhaust Nozzle & LED Status Ring
    const ventNozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.18, 12),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.98, roughness: 0.1 })
    );
    ventNozzle.position.set(0, 1.82, 0);
    dewarGroup.add(ventNozzle);

    const dewarStatusLed = new THREE.PointLight(0x06b6d4, 1.8, 5);
    dewarStatusLed.position.set(0, 1.6, 0);
    dewarGroup.add(dewarStatusLed);

    extractionPalletGroup.add(dewarGroup);

    // Lunar Regolith Core Sampling Drill Rig
    const drillUnitGroup = new THREE.Group();
    drillUnitGroup.position.set(-0.45, 0.34, 0.7);

    // Dual Extruded Aluminum Guide Mast Rails
    for (const mx of [-0.09, 0.09]) {
      const mastRail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 1.7, 10),
        matAluminum
      );
      mastRail.position.set(mx, 0.85, 0);
      drillUnitGroup.add(mastRail);
    }

    // Heavy Linear Carriage & Electric Drive Motor Head
    const motorHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.38, 0.28),
      new THREE.MeshStandardMaterial({
        map: carbonFiberMap,
        color: 0x1e293b,
        metalness: 0.94,
        roughness: 0.2
      })
    );
    motorHead.position.set(0, 1.15, 0);
    motorHead.castShadow = true;
    drillUnitGroup.add(motorHead);

    // Diamond-Fluted Spiral Auger Drill Bit Extending Through Deck into Soil
    const drillBit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.045, 1.25, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.98, roughness: 0.12 })
    );
    drillBit.position.set(0, 0.38, 0);
    drillBit.castShadow = true;
    drillUnitGroup.add(drillBit);

    // Digital Depth Readout OLED Display
    const drillDisplay = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 0.10),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    drillDisplay.position.set(0, 1.25, 0.145);
    drillUnitGroup.add(drillDisplay);

    extractionPalletGroup.add(drillUnitGroup);

    // Stacked Nanuk/Pelican Military-Spec Cargo Cases with Structural Ribs
    const palletCaseMatA = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.45, metalness: 0.2 });
    const palletCaseMatB = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.3 });

    // Lower Case A (Amber Heavy Cargo)
    const crateA = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.42, 0.65), palletCaseMatA);
    crateA.position.set(-0.35, 0.55, -0.75);
    crateA.rotation.y = 0.12;
    crateA.castShadow = true;
    extractionPalletGroup.add(crateA);

    // Upper Case B (Midnight Black Tactical Case with Steel Latches)
    const crateB = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.35, 0.52), palletCaseMatB);
    crateB.position.set(-0.30, 0.93, -0.72);
    crateB.rotation.y = -0.08;
    crateB.castShadow = true;
    extractionPalletGroup.add(crateB);

    // Latches and Corner Rubber Bumpers on Crate B
    for (const lx of [-0.22, 0.22]) {
      const latch = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.08, 0.02),
        new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.1 })
      );
      latch.position.set(-0.30 + lx, 0.93, -0.45);
      extractionPalletGroup.add(latch);
    }

    // Heavy Umbilical Cable Linking Surveyor 1 Recovery Rig to Pallet
    const rigCableA = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(Math.cos(0.35) * 3.8, 0.2, Math.sin(0.35) * 3.8),
          new THREE.Vector3(2.5, 0.06, -1.0),
          new THREE.Vector3(3.8, 0.24, -2.6)
        ]),
        24, 0.045, 8, false
      ),
      new THREE.MeshStandardMaterial({ color: 0x0b0f19, roughness: 0.94 })
    );
    rigCableA.castShadow = true;
    recoveryRigGroup.add(rigCableA);

    recoveryRigGroup.add(extractionPalletGroup);
    scene.add(recoveryRigGroup);

    // 12. SUBTERRANEAN ANOMALOUS FISSURE & PRECURSOR CAVERN (X: -95, Z: -110)
    // Fissure Opening on the surface
    const fissureGroup = new THREE.Group();
    const fissureTerrainY = getTerrainHeight(-95, -110);
    fissureGroup.position.set(-95, fissureTerrainY, -110);

    // Jagged chasm rim with tiered basalt shelves
    const fissureChasmGeo = new THREE.BoxGeometry(15, 8.5, 28);
    const fissureChasmMat = new THREE.MeshStandardMaterial({
      map: basaltRockMap,
      color: 0x0f1118,
      roughness: 0.96
    });
    const fissureChasm = new THREE.Mesh(fissureChasmGeo, fissureChasmMat);
    fissureChasm.position.y = -4.0;
    fissureGroup.add(fissureChasm);

    // Anomalous electromagnetic shimmer effect (pulsing rings)
    const anomalyRings = [];
    for (let r = 0; r < 3; r++) {
      const anomRingGeo = new THREE.RingGeometry(3 + r * 2.5, 3.4 + r * 2.5, 48);
      const anomRingMat = new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const aRing = new THREE.Mesh(anomRingGeo, anomRingMat);
      aRing.rotation.x = -Math.PI / 2;
      aRing.position.y = -1.0 + r * 0.4;
      fissureGroup.add(aRing);
      anomalyRings.push(aRing);
    }

    // Fissure beacon tripod
    const fissureBeacon = new THREE.PointLight(0xa855f7, 4.5, 45);
    fissureBeacon.position.set(0, 1.5, 0);
    fissureGroup.add(fissureBeacon);

    scene.add(fissureGroup);

    // 13. HIDDEN UNDERGROUND ALIEN PRECURSOR CAVERN (Located beneath at Y: -45)
    const cavernGroup = new THREE.Group();
    const CAVERN_Y = -45;
    cavernGroup.position.set(-95, CAVERN_Y, -110);

    // Cavern floor & ceiling (Obsidian Basalt with alien glyph circuits)
    const cavernFloorGeo = new THREE.CylinderGeometry(28, 32, 2, 32);
    const cavernFloorMat = new THREE.MeshStandardMaterial({
      map: alienGlyphMap,
      color: 0x111322,
      roughness: 0.25,
      metalness: 0.85
    });
    const cavernFloor = new THREE.Mesh(cavernFloorGeo, cavernFloorMat);
    cavernFloor.position.y = -1;
    cavernFloor.receiveShadow = true;
    cavernGroup.add(cavernFloor);

    const cavernCeil = new THREE.Mesh(cavernFloorGeo, cavernFloorMat);
    cavernCeil.position.y = 18;
    cavernGroup.add(cavernCeil);

    // Hexagonal Basalt Columns around perimeter (Medium-Poly with stratified facets)
    for (let i = 0; i < 18; i++) {
      const colAngle = (i * Math.PI * 2) / 18;
      const colDist = 24 + (i % 2) * 3;
      const colHeight = 16 + Math.sin(i * 1.5) * 3.5;
      const column = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.7, colHeight, 6),
        new THREE.MeshStandardMaterial({
          map: basaltRockMap,
          color: 0x0f111f,
          roughness: 0.38,
          metalness: 0.75
        })
      );
      column.position.set(Math.cos(colAngle) * colDist, colHeight / 2, Math.sin(colAngle) * colDist);
      column.castShadow = true;
      cavernGroup.add(column);
    }

    // Central Floating Alien Precursor Monolith (Medium-Poly chamfered obsidian block)
    const monolithGeo = new THREE.BoxGeometry(2.4, 8.5, 1.6, 2, 4, 2);
    const monolithMat = new THREE.MeshStandardMaterial({
      map: alienGlyphMap,
      color: 0x0a0c1a,
      emissive: 0x6366f1,
      emissiveIntensity: 0.55,
      roughness: 0.12,
      metalness: 0.95
    });
    const monolith = new THREE.Mesh(monolithGeo, monolithMat);
    monolith.position.set(0, 5.5, 0);
    monolith.castShadow = true;
    cavernGroup.add(monolith);

    // Orbiting crystalline glyph satellite fragments
    const satelliteGroup = new THREE.Group();
    for (let s = 0; s < 4; s++) {
      const sAng = (s * Math.PI * 2) / 4;
      const shardGeo = new THREE.OctahedronGeometry(0.38, 0);
      const shardMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.8,
        roughness: 0.1
      });
      const shard = new THREE.Mesh(shardGeo, shardMat);
      shard.position.set(Math.cos(sAng) * 2.8, 5.5 + Math.sin(s * 2) * 0.8, Math.sin(sAng) * 2.8);
      satelliteGroup.add(shard);
    }
    cavernGroup.add(satelliteGroup);

    // Monolith glowing geometric energy light
    const monolithLight = new THREE.PointLight(0xa855f7, 5.5, 40);
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

    // 14. DYNAMIC BALLISTIC REGOLITH MOVEMENT DUST (NO ATMOSPHERIC FLOATING)
    // Particles strictly triggered by astronaut locomotion, vehicle tires, or impacts
    // Following vacuum ballistics in lunar gravity (g = 1.62 m/s^2) and settling immediately
    const MAX_DUST = 72;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(MAX_DUST * 3);
    const dustVelocities = new Float32Array(MAX_DUST * 3);
    const dustLifetimes = new Float32Array(MAX_DUST);
    const dustMaxLife = new Float32Array(MAX_DUST);
    let nextDustIndex = 0;

    for (let i = 0; i < MAX_DUST; i++) {
      dustPositions[i * 3] = 0;
      dustPositions[i * 3 + 1] = -999;
      dustPositions[i * 3 + 2] = 0;
      dustLifetimes[i] = 999;
      dustMaxLife[i] = 0.65;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    const dustMat = new THREE.PointsMaterial({
      map: dustParticleTex,
      size: 0.24,
      color: 0x9ca3af, // Lunar regolith dust grey
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    const spawnMovementDust = (cx, cz, count = 8, intensity = 1.0) => {
      const cy = getTerrainHeight(cx, cz) + 0.03;
      for (let k = 0; k < count; k++) {
        const idx = (nextDustIndex + k) % MAX_DUST;
        const spreadAng = Math.random() * Math.PI * 2;
        const spreadDist = Math.random() * 0.16;

        dustPositions[idx * 3] = cx + Math.cos(spreadAng) * spreadDist;
        dustPositions[idx * 3 + 1] = cy;
        dustPositions[idx * 3 + 2] = cz + Math.sin(spreadAng) * spreadDist;

        // Ballistic velocity: upward kick + small lateral scatter
        dustVelocities[idx * 3] = (Math.random() - 0.5) * 0.45 * intensity;
        dustVelocities[idx * 3 + 1] = (0.55 + Math.random() * 0.65) * intensity;
        dustVelocities[idx * 3 + 2] = (Math.random() - 0.5) * 0.45 * intensity;

        dustLifetimes[idx] = 0;
        dustMaxLife[idx] = 0.45 + Math.random() * 0.3;
      }
      nextDustIndex = (nextDustIndex + count) % MAX_DUST;
    };

    // 15. 3D SURFACE SCANNER BEAM (LASER FAN TRAVELING OVER TERRAIN)
    // Dynamic fan ribbon that sweeps across lunar terrain in front of the astronaut
    const scanBeamSegments = 24;
    const scanBeamGeo = new THREE.BufferGeometry();
    const scanBeamPositions = new Float32Array((scanBeamSegments + 1) * 2 * 3);
    const scanBeamIndices = [];
    for (let i = 0; i < scanBeamSegments; i++) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = (i + 1) * 2;
      const d = (i + 1) * 2 + 1;
      scanBeamIndices.push(a, b, c);
      scanBeamIndices.push(c, b, d);
    }
    scanBeamGeo.setAttribute('position', new THREE.BufferAttribute(scanBeamPositions, 3));
    scanBeamGeo.setIndex(scanBeamIndices);

    const scanBeamMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const scanBeamMesh = new THREE.Mesh(scanBeamGeo, scanBeamMat);
    scanBeamMesh.visible = false;
    scene.add(scanBeamMesh);

    let scanBeamProgress = 0;
    triggerScannerBeamRef.current = () => {
      scanBeamProgress = 0.01;
      scanBeamMesh.visible = true;
    };

    // 16. ELECTRICAL SPARK DISCHARGE SYSTEM (TRANSIENT INTERACTION SPARKS)
    const MAX_SPARKS = 36;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(MAX_SPARKS * 3);
    const sparkVelocities = new Float32Array(MAX_SPARKS * 3);
    const sparkLifetimes = new Float32Array(MAX_SPARKS);
    for (let s = 0; s < MAX_SPARKS; s++) {
      sparkPositions[s * 3 + 1] = -999;
      sparkLifetimes[s] = 999;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));

    const sparkMat = new THREE.PointsMaterial({
      map: dustParticleTex,
      size: 0.22,
      color: 0x38bdf8,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
    const sparkParticles = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkParticles);

    triggerSparksRef.current = (pos) => {
      audio.playGlitchBurst();
      const px = pos.x || 0;
      const py = pos.y || 1.8;
      const pz = pos.z || 0;

      for (let s = 0; s < MAX_SPARKS; s++) {
        sparkPositions[s * 3] = px + (Math.random() - 0.5) * 0.25;
        sparkPositions[s * 3 + 1] = py + (Math.random() - 0.5) * 0.25;
        sparkPositions[s * 3 + 2] = pz + (Math.random() - 0.5) * 0.25;

        const ang = Math.random() * Math.PI * 2;
        const elev = (Math.random() - 0.5) * Math.PI;
        const spd = 2.4 + Math.random() * 3.8;

        sparkVelocities[s * 3] = Math.cos(elev) * Math.cos(ang) * spd;
        sparkVelocities[s * 3 + 1] = Math.sin(elev) * spd;
        sparkVelocities[s * 3 + 2] = Math.cos(elev) * Math.sin(ang) * spd;

        sparkLifetimes[s] = 0;
      }
    };

    // 15. SUBTERRANEAN PRECURSOR RESONANT ENERGY SPORES
    const sporeCount = 300;
    const sporeGeo = new THREE.BufferGeometry();
    const sporePositions = new Float32Array(sporeCount * 3);
    const sporeColors = new Float32Array(sporeCount * 3);

    for (let i = 0; i < sporeCount; i++) {
      const sAng = Math.random() * Math.PI * 2;
      const sRad = 1.0 + Math.random() * 22;
      sporePositions[i * 3] = Math.cos(sAng) * sRad;
      sporePositions[i * 3 + 1] = Math.random() * 16;
      sporePositions[i * 3 + 2] = Math.sin(sAng) * sRad;

      const isIndigo = Math.random() > 0.45;
      sporeColors[i * 3] = isIndigo ? 0.39 : 0.02;
      sporeColors[i * 3 + 1] = isIndigo ? 0.40 : 0.75;
      sporeColors[i * 3 + 2] = isIndigo ? 0.95 : 0.98;
    }
    sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePositions, 3));
    sporeGeo.setAttribute('color', new THREE.BufferAttribute(sporeColors, 3));

    const sporeMat = new THREE.PointsMaterial({
      map: dustParticleTex,
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const precursorSpores = new THREE.Points(sporeGeo, sporeMat);
    cavernGroup.add(precursorSpores);

    // 12. INTERACTION POINTS DATABASE (ZONES 1, 2, 3)
    const interactables = [
      // ================= ZONE 1: TEAM LANDING ZONE =================
      {
        id: 'poi_mission_terminal',
        title: 'Tactical Mission Terminal',
        position: new THREE.Vector3(103.2, landingTerrainY + 1.1, 65.5),
        radius: 4.2,
        sector: 'Zone 1 · Team Landing Zone',
        artifactAge: 'Current Expedition (2126)',
        integrity: '100% Operational',
        telemetryStatus: 'Carrier Aegis Link Active',
        description: 'NASA Reconnaissance Division tactical field terminal. Displays mission parameters, EVA suit vitals, route waypoints to Surveyor 1, and Carrier Aegis high-bandwidth uplink.',
        readings: {
          'Carrier Aegis Uplink': '48.2 Gbps Carrier Locked',
          'EVA Mark VIII Status': '100% Nominal (O2 / Power)',
          'Heading to Surveyor 1': '264° West (120m away)',
          'Primary Task': 'Investigate historic lander & trace seismic tremor'
        },
        officerNote: 'Leo and Maya have the landing vehicle secured. Time to inspect Surveyor 1 and see what caused the seismic disruption that brought us here.'
      },
      {
        id: 'poi_maya_chen',
        title: 'Specialist Maya Chen (Lead Scientist)',
        position: new THREE.Vector3(102.8, landingTerrainY + 1.2, 68.2),
        radius: 3.8,
        sector: 'Zone 1 · Recovery Team',
        artifactAge: 'Crewmate',
        integrity: 'Suit Pressure 32.5 kPa',
        telemetryStatus: 'Biometrics Active',
        description: 'Lead sensor specialist monitoring magnetospheric background and seismic telemetry across Oceanus Procellarum.',
        readings: {
          'Heart Rate': '76 BPM (Calm / Focused)',
          'Suit Oxygen': '99.1% Reserves',
          'EM Resonance': '432 Hz Harmonic Detected',
          'Field Datapad': 'LIDAR Spectrometry Streaming'
        },
        officerNote: '“Captain, keep an eye on your handheld scanner. We caught a distinct harmonic vibration on the descent that didn’t match any natural moonquake. It’s originating West-Northwest of Surveyor 1.”'
      },
      {
        id: 'poi_leo_vance',
        title: 'Officer Leo Vance (Operations Engineer)',
        position: new THREE.Vector3(100.5, landingTerrainY + 1.2, 62.5),
        radius: 3.8,
        sector: 'Zone 1 · Recovery Team',
        artifactAge: 'Crewmate',
        integrity: 'Suit Pressure 32.8 kPa',
        telemetryStatus: 'Biometrics Active',
        description: 'Surface operations engineer verifying Aegis-01 subsystems and deploying redundant power couplings.',
        readings: {
          'Vehicle Power': '96.4% Solid-State Reserve',
          'Life Support Buffer': '72 Hours Redundant',
          'Tire Pressure': '1.2 bar Nitrogen Infill',
          'Landing Headlights': 'Dual High-Beam Array Active'
        },
        officerNote: '“Aegis-01 is grounded and steady, Captain. Headlights will give you visual reference across the dark mare. Holler if you need suit replenishment.”'
      },
      {
        id: 'poi_lunar_transport',
        title: 'Lunar Transport Vehicle (Aegis-01)',
        position: new THREE.Vector3(110.5, landingTerrainY + 1.8, 65.0),
        radius: 6.5,
        sector: 'Zone 1 · Team Landing Zone',
        artifactAge: 'Current Expedition (2126)',
        integrity: '100% Hull Integrity',
        telemetryStatus: 'Standby / Headlights Active',
        description: 'Heavy six-wheeled pressurized expedition vehicle with dual high-intensity LED headlights, airlock ingress, and communications mast.',
        readings: {
          'Vehicle Mass': '4,850 kg Wet Weight',
          'Drive System': 'Dual Electric Rocker-Bogie',
          'Operational Range': '180 km Traversal Radius',
          'Shielding': 'Reinforced Titanium / Boron Composite'
        },
        officerNote: 'Our mobile base on this vacuum wasteland. Those headlights cut through the pitch black like twin suns.'
      },

      // ================= ZONE 2: SURVEYOR 1 RECOVERY SITE =================
      {
        id: 'surveyor_camera',
        title: 'Vidicon Television Camera Turret',
        position: new THREE.Vector3(0.65, surveyorTerrainY + 3.2, -0.65),
        radius: 4.2,
        sector: 'Zone 2 · Surveyor 1 Recovery Site',
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
        sector: 'Zone 2 · Surveyor 1 Soil Mechanics',
        artifactAge: '160 Earth Years (1966)',
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
        sector: 'Zone 2 · Surveyor 1 Power Mast',
        artifactAge: '160 Earth Years (1966)',
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
        id: 'surveyor_core',
        title: 'Surveyor 1 Lander Spaceframe & Subsurface Anomaly',
        position: new THREE.Vector3(0, surveyorTerrainY + 1.8, 0),
        radius: 4.8,
        sector: 'Zone 2 · Surveyor 1 Recovery Site',
        artifactAge: '160 Earth Years (1966)',
        integrity: 'Preserved Landmark',
        telemetryStatus: '432 Hz Subsurface Vibration Detected',
        description: 'The central triangular tubular frame, retromotor, and vernier thrusters. Suit magnetometers detect an unexpected low-frequency 432 Hz electromagnetic pulse radiating from beneath the site, trending North-West toward the nearby impact crater.',
        readings: {
          'Spacecraft Mass': '294 kg Dry Weight',
          'Propulsion': 'Solid Retromotor + 3 Hydrazine Verniers',
          'Harmonic Resonance': '432.06 Hz Continuous Carrier',
          'Subsurface Vector': '295° Azimuth (Heading to Crater)'
        },
        officerNote: 'Wait... this seismic vibration isn’t from Surveyor. It’s passing directly beneath the landing site and heading toward that impact crater to the North-West!'
      },

      // ================= ZONE 3: CRATER INVESTIGATION AREA =================
      {
        id: 'poi_crater_site_alpha',
        title: 'Survey Site Alpha (North Rim Outcrop)',
        position: new THREE.Vector3(-68, getTerrainHeight(-68, -40) + 1.2, -40),
        radius: 5.0,
        sector: 'Zone 3 · Crater Investigation Area',
        artifactAge: 'Pre-Imbrian Lunar Basalt',
        integrity: 'Intact Bedrock',
        telemetryStatus: 'LIDAR Baseline Recorded',
        description: 'High-standing basalt outcrop on the crater rim overlooking the shadowed interior. Handheld scanner calibrates baseline mineral composition.',
        readings: {
          'Basalt Titanium Oxide': '8.4% (Standard Mare Basalt)',
          'Magnetic Resonance': '22% (Geological Baseline)',
          'Thermal Variance': '0.0°C Ambient Background',
          'Signal Vector': 'Diverging · Deeper inside crater'
        },
        officerNote: 'Site Alpha shows only normal titanium basalt reflection. The anomalous signal isn’t on the rim—it’s coming from deeper inside the crater bowl.'
      },
      {
        id: 'poi_crater_site_beta',
        title: 'Survey Site Beta (Inner Scree Slope)',
        position: new THREE.Vector3(-74, getTerrainHeight(-74, -48) + 1.2, -48),
        radius: 5.0,
        sector: 'Zone 3 · Crater Investigation Area',
        artifactAge: 'Impact-Melted Breccia',
        integrity: 'Fractured Strata',
        telemetryStatus: 'Harmonic Echo Detected',
        description: 'Talus field of impact-melted breccia in deep crater shadow. Seismic reflection indicates harmonic interference echoing off the lower crater wall.',
        readings: {
          'Breccia Composition': 'Shock-Glass / Pyroxene Agglutinates',
          'Magnetic Resonance': '54% (Reflected Harmonic Echo)',
          'Subsurface Density': '+18% Overburden Inconsistency',
          'Signal Frequency': '432.06 Hz Standing Wave'
        },
        officerNote: 'Signal strength jumped to 54%! The harmonic is echoing off the scree, but the primary epicenter is right ahead at the base of the wall—near that strange metallic protrusion!'
      },
      {
        id: 'poi_crater_site_gamma',
        title: 'Survey Site Gamma (Buried Precursor Object)',
        position: new THREE.Vector3(-78, getTerrainHeight(-78, -54) + 1.2, -54),
        radius: 5.5,
        sector: 'Zone 3 · Crater Investigation Area',
        artifactAge: 'Non-Human / Unknown Epoch',
        integrity: '100% Non-Degraded Alloy',
        telemetryStatus: '99.4% Peak Signal Resonance',
        description: 'A faceted geometric metallic prism partially exposed in the crater wall. Handheld scanner hits 99.4% peak harmonic resonance at 432.06 Hz. The alloy does not match any terrestrial aerospace database.',
        readings: {
          'Material Composition': 'Uncatalogued Exotic Superalloy',
          'Magnetic Resonance': '99.4% Peak Resonance (Epicenter)',
          'Resonant Frequency': '432.06 Hz Constant Sine Wave',
          'Structural Alignment': 'Vector Points to Subterranean Cavern'
        },
        officerNote: 'Astonishing... look at these crystalline edge facets! This isn’t aerospace debris from Apollo or Surveyor. It’s an extraterrestrial precursor artifact, and it’s transmitting a beacon deep underground!'
      },

      // ================= ZONE 4: ALIEN STRUCTURE DISCOVERY =================
      {
        id: 'poi_alien_structure',
        title: 'Precursor Geometric Monolith',
        position: new THREE.Vector3(-120, alienTerrainY + 2.5, -75),
        radius: 7.0,
        sector: 'Zone 4 · Alien Structure Discovery',
        artifactAge: 'Unknown Extraterrestrial Epoch',
        integrity: '100% Intact / Active Field',
        telemetryStatus: 'Carrier Frequency Locked',
        description: 'An ancient, partially buried geometric obsidian monolith. Ultra-smooth surfaces devoid of rivets or mechanical seams. Thin luminescent cyan circuitry tracks pulse across its facets as geometric shards levitate above its apex.',
        readings: {
          'Material Lattice': 'Anomalous Carbon-Titanium Superlattice',
          'Surface Seams': 'Zero (Monolithic Construction)',
          'Levitation Field': 'Repulsive Casimir-Force Gradient',
          'Conduit Link': 'Broadcasting toward Surveyor 1'
        },
        officerNote: 'Unbelievable... it contrasts so starkly with Surveyor 1. One is 1966 aluminum and cables; this is pure alien geometry. And look at that dark conduit running all the way back to the lander!'
      },
      {
        id: 'poi_data_conduit',
        title: 'Subterranean Data Conduit',
        position: new THREE.Vector3(-60, getTerrainHeight(-60, -35) + 0.5, -35),
        radius: 5.0,
        sector: 'Zone 4 · Subterranean Network',
        artifactAge: 'Synchronized with Lander Touchdown',
        integrity: 'Active Carrier Wave',
        telemetryStatus: 'Data Extraction Stream',
        description: 'A glassy dark conduit extending along the lunar regolith from the alien structure directly into Surveyor 1. Rhythmic cyan light pulses travel along its length, extracting and analyzing the lander\'s historical telemetry.',
        readings: {
          'Transmission Frequency': '432.06 Hz Continuous',
          'Packet Flux': '1.42 Tbps Harmonic Stream',
          'Target Terminus': 'Surveyor 1 Mast & Vidicon Memory',
          'Conduit State': 'Active Handshake'
        },
        officerNote: 'The conduit has been tapping Surveyor 1 for decades, monitoring humanity\'s earliest robotic footprint. It’s like an extraterrestrial listening post.'
      },
      {
        id: 'poi_scanning_panel',
        title: 'Central Scanning Panel & Interface',
        position: new THREE.Vector3(-119.2, alienTerrainY + 2.0, -73.2),
        radius: 4.5,
        sector: 'Zone 4 · Alien Interface',
        artifactAge: 'Interactive Precursor Console',
        integrity: '100% Responsive',
        telemetryStatus: 'Handshake Ready · [E] to Initiate',
        description: 'A recessed geometric scanning panel emitting a faint blue glow and low-frequency vibration. Placing an EVA sensory probe on this panel initiates the Mission Echo historical simulation.',
        readings: {
          'Interface Protocol': 'Optoelectronic Resonance Handshake',
          'Handshake Carrier': '432.06 Hz Sine Carrier',
          'Mode': 'Mission Echo Simulation Ready',
          'Access Clearance': 'Human Biometric Recognized'
        },
        officerNote: 'The panel is responding to my suit sensors! It’s ready to interface. Press [E] to activate Mission Echo.'
      },

      // ================= ZONE 5: MISSION ECHO INTERFACE =================
      {
        id: 'poi_mission_echo_console',
        title: 'Mission Echo Holographic Array',
        position: new THREE.Vector3(-116, echoTerrainY + 1.5, -72),
        radius: 5.0,
        sector: 'Zone 5 · Mission Echo Interface',
        artifactAge: '1966 Historical Simulation',
        integrity: 'Volumetric Projection Active',
        telemetryStatus: '3 Simulation Phases Available',
        description: 'A high-fidelity blue volumetric projection matrix reconstructing Surveyor 1\'s controlled descent, panoramic observations, and corrupted image archives based on recovered records.',
        readings: {
          'Phase 1': 'Terminal Descent Calibration (3.05 m/s)',
          'Phase 2': 'Vidicon 360° Panorama Stitching',
          'Phase 3': 'Historic Archive Decryption (11,237 Frames)',
          'System Status': 'Interactive Simulation Online'
        },
        officerNote: 'A holographic wireframe of Surveyor 1 floating right here on the Moon... It’s reconstructing the descent telemetry frame by frame!'
      },
      {
        id: 'poi_descent_simulation',
        title: 'Controlled Descent Trajectory Visualizer',
        position: new THREE.Vector3(-115, echoTerrainY + 2.0, -71),
        radius: 4.2,
        sector: 'Zone 5 · Mission Echo Interface',
        artifactAge: 'June 2, 1966 Reconstruction',
        integrity: 'Simulation Active',
        telemetryStatus: 'Descent Vector Synchronized',
        description: 'Volumetric flight path tracing Surveyor 1 from 75 km orbital injection down to 3.05 m/s soft touchdown in Oceanus Procellarum.',
        readings: {
          'Main Retro Ignition': '75.3 km Altitude',
          'Vernier Cutoff': '3.4 m Above Surface',
          'Landing Velocity': '3.05 m/s Soft Touchdown',
          'Simulation Sync': 'Interactive via Mission Echo'
        },
        officerNote: 'The physics of the 1966 landing laid bare in glowing blue light. We can step right into humanity’s first extraterrestrial landing sequence.'
      },

      // ================= ZONE 6: RECOVERY AND EXTRACTION AREA =================
      {
        id: 'poi_recovery_rig',
        title: 'Artemis/Aegis Robotic Recovery Rig',
        position: new THREE.Vector3(1.8, surveyorTerrainY + 1.8, 0.5),
        radius: 5.2,
        sector: 'Zone 6 · Surveyor 1 Recovery Site',
        artifactAge: 'Current Expedition (2126)',
        integrity: '100% Operational',
        telemetryStatus: 'Surveyor 1 Braced & Stabilized',
        description: 'Hydraulic carbon-fiber gantry arms deployed by Leo Vance to brace Surveyor 1. The dark alien conduit has powered down, leaving the historic lander secured for NASA preservation.',
        readings: {
          'Stabilizer Load': '294 kg Neutral Support',
          'Alien Conduit State': 'Dormant (0.0 V Residual)',
          'Structural Integrity': '100% Protected',
          'Heritage Tag': 'NASA Permanent Historic Monument'
        },
        officerNote: 'The recovery rig is locked in place. Surveyor 1 survived 160 years of cosmic vacuum, and now its place in history is permanently protected.'
      },
      {
        id: 'poi_quantum_storage_unit',
        title: 'Quantum Archive Vault (Q-SSD)',
        position: new THREE.Vector3(-1.2, surveyorTerrainY + 1.6, -1.0),
        radius: 4.2,
        sector: 'Zone 6 · Surveyor 1 Recovery Site',
        artifactAge: 'Current Expedition (2126)',
        integrity: '100% Data Transfer Complete',
        telemetryStatus: '11,237 Frames Archived',
        description: 'Radiation-hardened solid-state quantum vault clamped to the lander\'s mast. Successfully captured and archived all 11,237 historic frames and decoded signal packets.',
        readings: {
          'Archive Download': '11,237 Frames (100% Verified)',
          'Harmonic Signal': 'Decrypted & Extracted',
          'Orbital Downlink': 'Beamed to Carrier Aegis',
          'Status': 'Vault Sealed'
        },
        officerNote: 'Every scan line, every pixel humanity transmitted in 1966 is now safe in this vault—along with the decoded precursor signal.'
      },
      {
        id: 'poi_extraction_pallet',
        title: 'Secure Extraction Sled & Mystery Coordinates',
        position: new THREE.Vector3(3.8, surveyorTerrainY + 0.8, -2.6),
        radius: 5.5,
        sector: 'Zone 6 · Recovery & Extraction',
        artifactAge: 'Current Expedition (2126)',
        integrity: 'Ready for Extraction',
        telemetryStatus: 'Decrypted Coordinates Ready',
        description: 'Mobile motorized transport pallet containing the extracted precursor signal core. The deciphered stellar vectors reveal the location of a subterranean alien cavern designated "Vault Zero".',
        readings: {
          'Payload': 'Decrypted Precursor Signal Core',
          'Stellar Vectors': '432.06 Hz Subterranean Azimuth',
          'Next Objective': 'Target Coordinates: Vault Zero (Chapter 2)',
          'Mission Status': 'CHAPTER 1 OBJECTIVES COMPLETE'
        },
        officerNote: '“Mission accomplished, team! Surveyor 1 is secured, the archive is saved, and we’ve unlocked the exact coordinates to where this signal came from. Arin to Carrier Aegis: prepare for the next phase!”'
      },

      // Fissure & Cavern (Exploration towards Zones 4-6)
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
    let yaw = 1.01; // Looking West toward Surveyor 1 initially from Landing Zone
    const keys = { w: false, s: false, a: false, d: false, shift: false, space: false };

    // Player Physical State (1/6th Lunar Gravity)
    const initialGroundY = getTerrainHeight(104, 66);
    let playerPos = new THREE.Vector3(104, initialGroundY + EYE_HEIGHT, 66);
    camera.position.set(104, initialGroundY + EYE_HEIGHT, 66);
    let playerVelocityY = 0;
    let isGrounded = true;
    const LUNAR_GRAVITY = 6.2; // Adjusted for responsive gameplay feel (real 1.62m/s^2)
    const JUMP_STRENGTH = 4.8;
    let walkTimer = 0;
    let lastStepTime = 0;

    const onKeyDown = (e) => {
      audio.ensureContext();
      audio.startSuitBreathing();
      audio.startAmbience();
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
      audio.ensureContext();
      audio.startSuitBreathing();
      audio.startAmbience();
      if (document.pointerLockElement !== renderer.domElement) {
        try {
          renderer.domElement.requestPointerLock();
        } catch {}
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // 14. ANIMATION & GAME SIMULATION LOOP
    let animId;
    let underground = false;
    let lastNearId = null;
    let hudTimer = 0;
    const clock = new THREE.Clock();

    // Vacuum Acoustic Director Trackers
    let lastInterferenceTime = 0;
    let lastRadioChatterTime = 0;
    let isAlienVibrating = false;
    let isMachineryRunning = false;

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
      monolithLight.intensity = 4.5 + Math.sin(time * 3.5) * 1.2;
      satelliteGroup.rotation.y += delta * 0.45;

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

          // Drop an astronaut EVA bootprint in the lunar regolith
          if (!underground) {
            const sideOffset = (footStepToggle ? 0.22 : -0.22);
            footStepToggle = !footStepToggle;
            const printX = playerPos.x + Math.cos(yaw) * sideOffset;
            const printZ = playerPos.z - Math.sin(yaw) * sideOffset;
            const printY = getTerrainHeight(printX, printZ) + 0.025;

            const printMesh = new THREE.Mesh(bootprintGeo, bootprintMat);
            printMesh.position.set(printX, printY, printZ);
            printMesh.rotation.y = yaw;
            bootprintGroup.add(printMesh);
            bootprints.push(printMesh);

            // Disturbed lunar regolith dust puff (vacuum ballistic physics, no air drag)
            spawnMovementDust(printX, printZ, 8, keys.shift ? 1.3 : 0.9);

            if (bootprints.length > maxBootprints) {
              const old = bootprints.shift();
              bootprintGroup.remove(old);
            }
          }
        }
      }

      // Check for Transition into/out of Subterranean Precursor Cavern
      const distToFissure = Math.hypot(playerPos.x - (-95), playerPos.z - (-110));
      if (!underground && distToFissure < 6.5) {
        // Step into fissure -> descend underground
        underground = true;
        setIsUnderground(true);
        playerPos.set(-95, CAVERN_Y + 1.8, -125);
        playerVelocityY = 0;
        audio.playAnomalyHarmonic();
      } else if (underground && distToFissure < 8.0 && playerPos.z > -105) {
        // Return to surface ramp
        underground = false;
        setIsUnderground(false);
        playerPos.set(-95, fissureTerrainY + 2.0, -98);
        playerVelocityY = 0;
      }

      // Ground Height Calculation
      let targetGroundY;
      if (underground) {
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
          if (!underground) {
            spawnMovementDust(playerPos.x, playerPos.z, 14, 1.4);
          }
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

      // Animate First-Person Handheld Sci-Fi Scanner Viewmodel
      if (fpScannerGroup) {
        const bobY = isMoving && isGrounded ? Math.sin(walkTimer * 2) * 0.012 : Math.sin(time * 1.5) * 0.004;
        const bobX = isMoving && isGrounded ? Math.cos(walkTimer) * 0.008 : 0;
        fpScannerGroup.position.set(0.24 + bobX, -0.22 + bobY, -0.46);

        if (scanPulseActive) {
          scannerSpot.intensity = 4.5 + Math.sin(time * 24) * 2.0;
          emitterLensMat.color.setHex(0x22d3ee);
        } else {
          scannerSpot.intensity = 0.9 + Math.sin(time * 2.2) * 0.25;
          emitterLensMat.color.setHex(0x0284c7);
        }
      }

      // Dynamic ballistic regolith dust physics (Lunar gravity g = 1.62 m/s^2, zero drag)
      let hasActiveDust = false;
      const dPos = dustGeo.attributes.position;
      for (let i = 0; i < MAX_DUST; i++) {
        if (dustLifetimes[i] < dustMaxLife[i]) {
          hasActiveDust = true;
          dustLifetimes[i] += delta;

          // Lunar vacuum ballistics
          dustVelocities[i * 3 + 1] -= 1.62 * delta;
          const nx = dustPositions[i * 3] + dustVelocities[i * 3] * delta;
          const ny = dustPositions[i * 3 + 1] + dustVelocities[i * 3 + 1] * delta;
          const nz = dustPositions[i * 3 + 2] + dustVelocities[i * 3 + 2] * delta;

          const groundY = getTerrainHeight(nx, nz);
          if (ny <= groundY && dustVelocities[i * 3 + 1] < 0) {
            dustPositions[i * 3 + 1] = -999;
            dustLifetimes[i] = 999;
          } else {
            dustPositions[i * 3] = nx;
            dustPositions[i * 3 + 1] = ny;
            dustPositions[i * 3 + 2] = nz;
          }
        }
      }
      if (hasActiveDust) {
        dPos.needsUpdate = true;
      }

      // Animate 3D Scanner Surface Beam Travelling Across Terrain
      if (scanPulseActive && scanBeamMesh) {
        scanBeamProgress = Math.min(1.0, scanBeamProgress + delta * 0.42);
        scanBeamMesh.visible = true;
        scanBeamMat.opacity = Math.sin(scanBeamProgress * Math.PI) * 0.82;

        const currentRadius = Math.max(1.5, scanBeamProgress * 38);
        const innerRadius = Math.max(0.5, currentRadius - 1.8);
        const fovAngle = Math.PI / 3; // 60 degree scan fan
        const baseAngle = -yaw - Math.PI / 2;

        const posAttr = scanBeamGeo.attributes.position;
        let ptr = 0;
        for (let i = 0; i <= scanBeamSegments; i++) {
          const t = (i / scanBeamSegments) - 0.5;
          const ang = baseAngle + t * fovAngle;

          const ox = playerPos.x + Math.cos(ang) * currentRadius;
          const oz = playerPos.z + Math.sin(ang) * currentRadius;
          const oy = getTerrainHeight(ox, oz) + 0.05;
          posAttr.setXYZ(ptr++, ox, oy, oz);

          const ix = playerPos.x + Math.cos(ang) * innerRadius;
          const iz = playerPos.z + Math.sin(ang) * innerRadius;
          const iy = getTerrainHeight(ix, iz) + 0.05;
          posAttr.setXYZ(ptr++, ix, iy, iz);
        }
        posAttr.needsUpdate = true;
      } else if (scanBeamMesh && scanBeamMesh.visible) {
        scanBeamProgress = 0;
        scanBeamMesh.visible = false;
        scanBeamMat.opacity = 0;
      }

      // Animate Electrical Sparks
      let hasActiveSparks = false;
      const spkPos = sparkGeo.attributes.position;
      for (let s = 0; s < MAX_SPARKS; s++) {
        if (sparkLifetimes[s] < 0.85) {
          hasActiveSparks = true;
          sparkLifetimes[s] += delta;
          sparkPositions[s * 3] += (sparkVelocities[s * 3] + (Math.random() - 0.5) * 1.8) * delta;
          sparkPositions[s * 3 + 1] += (sparkVelocities[s * 3 + 1] - 1.62 * delta) * delta;
          sparkPositions[s * 3 + 2] += (sparkVelocities[s * 3 + 2] + (Math.random() - 0.5) * 1.8) * delta;
        } else {
          sparkPositions[s * 3 + 1] = -999;
        }
      }
      if (hasActiveSparks) {
        spkPos.needsUpdate = true;
      }

      // Precursor cavern energy spores floating upward
      if (underground && precursorSpores) {
        precursorSpores.rotation.y += delta * 0.14;
        const sPos = sporeGeo.attributes.position;
        for (let i = 0; i < sporeCount; i++) {
          let sy = sPos.getY(i) + delta * 0.85;
          if (sy > 17.5) sy = 0.2;
          sPos.setY(i, sy);
        }
        sPos.needsUpdate = true;
      }

      // Animate astronaut crewmates subtle idle breathing
      for (const astro of astronautCrewList) {
        if (astro && astro.userData) {
          const breath = Math.sin(time * astro.userData.breathSpeed) * 0.012;
          astro.position.y = (astro.userData.initialY || 0) + breath;
        }
      }

      // Animate Zone 4 floating shards orbiting monolith apex
      if (floatingShardGroup) {
        floatingShardGroup.rotation.y += delta * 0.45;
        for (let s = 0; s < floatingShards.length; s++) {
          const sh = floatingShards[s];
          sh.mesh.position.y = sh.height + Math.sin(time * 2.2 + s) * 0.15;
        }
      }

      // Animate Zone 5 wireframe holographic Surveyor 1 & data fragments
      if (holoSurveyorGroup) {
        holoSurveyorGroup.rotation.y += delta * 0.35;
        for (let d = 0; d < dataFragments.length; d++) {
          dataFragments[d].position.y = 2.0 + (d % 2) * 0.4 + Math.sin(time * 2.0 + d) * 0.08;
        }
      }

      // Dynamic Zone 4 & 6 state responsiveness (lighting & conduit)
      if (isMissionEchoCompletedRef.current) {
        if (alienGlowLight) alienGlowLight.intensity = 0.35;
        if (energyBeam) energyBeam.visible = false;
        if (conduitMat) {
          conduitMat.emissiveIntensity = 0.04;
          conduitMat.color.setHex(0x0a0c10);
        }
        if (qStatusLed) qStatusLed.intensity = 2.4;
      } else {
        // Faint blue/cyan pulses for the alien structure
        if (alienGlowLight) alienGlowLight.intensity = 1.2 + Math.sin(time * 1.5) * 0.5;
        if (conduitMat) conduitMat.emissiveIntensity = 0.45 + Math.sin(time * 3.0) * 0.2;
      }

      // Throttled HUD Telemetry Updates (5 Hz updates instead of 60 FPS state flooding)
      hudTimer += delta;
      if (hudTimer >= 0.2) {
        hudTimer = 0;

        const distLanding = Math.round(Math.hypot(playerPos.x - 105, playerPos.z - 65));
        const distSurveyor = Math.round(Math.hypot(playerPos.x, playerPos.z));
        const distCrater = Math.round(Math.hypot(playerPos.x - (-75), playerPos.z - (-50)));
        const distAlien = Math.round(Math.hypot(playerPos.x - (-120), playerPos.z - (-75)));
        const distEcho = Math.round(Math.hypot(playerPos.x - (-116), playerPos.z - (-72)));
        const distAnomaly = Math.round(Math.hypot(playerPos.x - (-95), playerPos.z - (-110)));
        const distBuried = Math.hypot(playerPos.x - (-78), playerPos.z - (-54));
        let headingDeg = Math.round((THREE.MathUtils.radToDeg(-yaw) % 360 + 360) % 360);

        setDistanceToLanding(distLanding);
        setDistanceToSurveyor(distSurveyor);
        setDistanceToCrater(distCrater);
        setDistanceToAlienStructure(distAlien);
        setDistanceToAnomaly(distAnomaly);
        setCompassHeading(headingDeg);

        // 7-Stage Suggested Player Journey Nav-Target calculation
        const currentStageObj = JOURNEY_STAGES[journeyStageIndex] || JOURNEY_STAGES[0];
        if (currentStageObj?.targetCoords) {
          const dx = currentStageObj.targetCoords.x - playerPos.x;
          const dz = currentStageObj.targetCoords.z - playerPos.z;
          const distToNav = Math.round(Math.hypot(dx, dz));
          setNavTargetDistance(distToNav);

          let rad = Math.atan2(dx, -dz);
          let deg = Math.round((THREE.MathUtils.radToDeg(rad) % 360 + 360) % 360);
          setNavTargetBearing(deg);
        }

        // Automatic Natural Non-Corridor Stage Transitions
        if (journeyStageIndex === 0 && (distLanding > 24 || distSurveyor < 65)) {
          advanceJourneyStage(1);
        } else if (journeyStageIndex === 1 && (distCrater < 45 && distLanding > 60)) {
          advanceJourneyStage(2);
        } else if (journeyStageIndex === 2 && (distAlien < 38 || (playerPos.x < -60 && playerPos.z < -80))) {
          advanceJourneyStage(3);
        } else if (journeyStageIndex === 3 && (distEcho < 20 || isMissionEchoOpen)) {
          advanceJourneyStage(4);
        }

        // Dynamic 432 Hz Signal Resonance Calculation based on proximity & Mission Echo state
        let sig = 0;
        if (isMissionEchoCompletedRef.current) {
          sig = Math.max(0, Math.round(4 + Math.sin(time * 0.6) * 2));
        } else if (distAlien < 12.0) {
          sig = 100;
        } else if (distAlien < 36.0) {
          sig = Math.round(85 + (36.0 - distAlien) * 0.62);
        } else if (distBuried < 6.0) {
          sig = 99;
        } else if (distBuried < 26.0) {
          sig = Math.round(99 - (distBuried - 6.0) * 3.2);
        } else if (distCrater < 38.0) {
          sig = Math.round(48 - (distCrater - 14.0) * 1.1);
        } else if (distSurveyor < 30.0) {
          sig = 18;
        } else if (playerPos.x < 0 && playerPos.z < 0) {
          sig = Math.round(15 + (1.0 - Math.min(1.0, distCrater / 85.0)) * 22);
        } else {
          sig = Math.max(0, Math.round(2 + Math.sin(time * 0.7) * 2));
        }
        sig = Math.max(0, Math.min(100, sig));
        setAnomalousSignal(sig);

        // Active Zone Determination across all 6 zones
        let currentZone = 'ZONE 1 · TEAM LANDING';
        if (distLanding < 38) {
          currentZone = 'ZONE 1 · TEAM LANDING';
        } else if (distSurveyor < 35) {
          currentZone = isMissionEchoCompletedRef.current ? 'ZONE 6 · RECOVERY & EXTRACTION' : 'ZONE 2 · SURVEYOR 1 RECOVERY';
        } else if (distCrater < 42) {
          currentZone = 'ZONE 3 · CRATER INVESTIGATION';
        } else if (distAlien < 28) {
          currentZone = 'ZONE 4 · ALIEN STRUCTURE DISCOVERY';
        } else if (distEcho < 22) {
          currentZone = 'ZONE 5 · MISSION ECHO INTERFACE';
        } else if (playerPos.x < -60 && playerPos.z < -80) {
          currentZone = 'BASALT RIDGE FISSURE';
        } else {
          currentZone = 'OCEANUS PROCELLARUM TRAIL';
        }
        setActiveZone(currentZone);

        // Dynamic Solar Visor Glare Intensity calculation
        // Sun vector (240, 75, -180) normalized ≈ (0.78, 0.24, -0.58)
        const forwardY = Math.sin(pitch);
        const dotSun = forwardX * 0.78 + forwardY * 0.24 + forwardZ * (-0.58);
        const glare = Math.max(0, Math.min(1, Math.pow(Math.max(0, dotSun), 3.0)));
        setSunGlareIntensity(+glare.toFixed(2));

        // Check Nearby Interactable
        let foundInteract = null;
        for (const item of interactables) {
          if (underground && item.id !== 'precursor_monolith_site') continue;
          if (!underground && item.id === 'precursor_monolith_site') continue;

          const d = Math.hypot(playerPos.x - item.position.x, playerPos.z - item.position.z);
          if (d < item.radius) {
            foundInteract = item;
            break;
          }
        }

        nearInteractableRef.current = foundInteract;
        const newNearId = foundInteract ? foundInteract.id : null;
        if (newNearId !== lastNearId) {
          lastNearId = newNearId;
          setNearInteractable(foundInteract);
        }

        // Gradual Suit Telemetry simulation
        setOxygenLevel(prev => Math.max(92.0, +(prev - 0.001).toFixed(2)));
        setSuitPower(prev => Math.max(88.0, +(prev - 0.002).toFixed(2)));
        setHeartRate(isMoving ? (keys.shift ? 112 : 86) : 72);

        // Dynamic Spatial Acoustic Zone Director (Vacuum Conduction & Telemetry)
        // Zone 4: Alien Structure Sub-bass Vibration conducted through bedrock
        if (distAlien < 44) {
          if (!isAlienVibrating) {
            audio.startAlienStructureVibration();
            isAlienVibrating = true;
          }
          const vibrationIntensity = Math.max(0, (44 - distAlien) / 44);
          audio.updateAlienStructureVibration(vibrationIntensity);
        } else if (isAlienVibrating) {
          audio.updateAlienStructureVibration(0);
          if (distAlien > 52) {
            audio.stopAlienStructureVibration();
            isAlienVibrating = false;
          }
        }

        // Zone 6: Robotic Machinery Hydraulic Hum conducted through suit
        const distRecoveryRig = distSurveyor; // Recovery equipment is at Surveyor site
        if (distRecoveryRig < 32 && isMissionEchoCompletedRef.current) {
          if (!isMachineryRunning) {
            audio.startRoboticMachineryLoop();
            isMachineryRunning = true;
          }
          const machineIntensity = Math.max(0, (32 - distRecoveryRig) / 32);
          audio.updateRoboticMachineryLoop(machineIntensity);
        } else if (isMachineryRunning) {
          audio.updateRoboticMachineryLoop(0);
          if (distRecoveryRig > 40) {
            audio.stopRoboticMachineryLoop();
            isMachineryRunning = false;
          }
        }

        // Zone 3: Crater Signal Interference & Static Crackles through helmet comms
        if (distCrater < 36 && time - lastInterferenceTime > 5.5) {
          audio.playCraterInterference(1 - distCrater / 36);
          lastInterferenceTime = time + (Math.random() * 2.5);
        }

        // Zone 1 & Zone 6: Periodic Radio Comms check-ins (long quiet pauses in between)
        if (distLanding < 32 && time - lastRadioChatterTime > 55.0) {
          audio.playRadioCommsChatter(Math.random() > 0.5 ? 'chen' : 'vance');
          lastRadioChatterTime = time + (Math.random() * 15.0);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth || 800;
      const h = container.clientHeight || window.innerHeight || 600;
      camera.aspect = w / (h > 0 ? h : 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    const resizeTimer = setTimeout(handleResize, 100);

    return () => {
      audio.stopAllLoops();
      clearTimeout(resizeTimer);
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
      regolithMap.dispose();
      regolithBumpMap.dispose();
      regolithRoughnessMap.dispose();
      basaltRockMap.dispose();
      goldFoilMap.dispose();
      solarPanelMap.dispose();
      alienGlyphMap.dispose();
      roverTrackMap.dispose();
      dustParticleTex.dispose();
      hazardStripeMap.dispose();
      carbonFiberMap.dispose();
      scannerScreenMap.dispose();
      spacesuitFabricMap.dispose();
      scanBeamGeo.dispose();
      scanBeamMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      sporeGeo.dispose();
      bootprintGeo.dispose();
      dracoLoader.dispose();
      triggerSparksRef.current = null;
      triggerScannerBeamRef.current = null;
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

        {/* DYNAMIC SOLAR VISOR GLARE & ANAMORPHIC FLARE (WHEN LOOKING TOWARD LOW-ANGLE HARSH SUN) */}
        {sunGlareIntensity > 0.05 && (
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{ opacity: sunGlareIntensity }}
          >
            {/* Golden extravehicular visor wash */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-amber-400/25 to-yellow-200/35 mix-blend-screen" />
            
            {/* Horizontal Anamorphic Lens Flare Streak */}
            <div className="absolute top-1/2 inset-x-0 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent shadow-[0_0_25px_rgba(251,191,36,0.9)]" />
            <div className="absolute top-1/2 inset-x-12 -translate-y-1/2 h-[8px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent blur-sm" />

            {/* Polycarbonate Lens Scratches & Solar Halo */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 65% 35%, rgba(254,243,199,0.35) 0%, rgba(251,191,36,0.18) 40%, transparent 75%)'
              }}
            />
          </div>
        )}

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
            
            {/* Top Compass Heading Tape with Nav Target Bearing */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-500/30 text-xs text-cyan-300 shadow-xl flex-wrap sm:flex-nowrap">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow flex-shrink-0" />
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
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/40 text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                {activeZone}
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <div className="flex items-center gap-1 text-[10px] text-amber-300 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span>NAV: {JOURNEY_STAGES[journeyStageIndex]?.waypointLabel} [{navTargetDistance}m · {navTargetBearing}°]</span>
              </div>
            </div>

            {/* 7-STAGE SUGGESTED PLAYER JOURNEY CARD */}
            <div className="p-3.5 rounded-xl bg-black/85 backdrop-blur-md border border-cyan-500/40 shadow-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>JOURNEY · STEP {journeyStageIndex + 1} OF 7</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[9px] text-cyan-300 font-mono flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{JOURNEY_STAGES[journeyStageIndex]?.durationEst}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => { audio.playClick(); setShowJourneyRoadmap(prev => !prev); }}
                    className="p-1 px-2 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] flex items-center gap-1 uppercase transition-colors"
                    title="Toggle 7-Stage Journey Roadmap"
                  >
                    <ListOrdered className="w-3 h-3" />
                    <span>Roadmap</span>
                  </button>
                </div>
              </div>

              <div className="text-sm font-bold text-white tracking-wide">
                {JOURNEY_STAGES[journeyStageIndex]?.name}
              </div>

              <div className="text-slate-300 font-sans text-xs leading-relaxed">
                {JOURNEY_STAGES[journeyStageIndex]?.objective}
              </div>

              {/* Waypoint Distances for Zones 1, 2, 3, 4 */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-slate-400 border-t border-white/10">
                <div>LANDING: <strong className="text-amber-300">{distanceToLanding}m</strong></div>
                <div>SURVEYOR 1: <strong className="text-cyan-300">{distanceToSurveyor}m</strong></div>
                <div>CRATER: <strong className="text-purple-300">{distanceToCrater}m</strong></div>
                <div>ALIEN STRUCTURE: <strong className="text-emerald-300">{distanceToAlienStructure}m</strong></div>
              </div>
            </div>

            {/* Handheld Scanner Anomaly Resonance Gauge */}
            <div className="p-2.5 rounded-xl bg-purple-950/80 backdrop-blur-md border border-purple-500/40 text-xs shadow-xl space-y-1">
              <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold tracking-wider uppercase">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span>Scanner Resonance · 432.06 Hz</span>
                </span>
                <span className="text-white font-mono">{anomalousSignal}%</span>
              </div>
              <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-purple-400/30">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${anomalousSignal}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-400 flex justify-between">
                <span>{isMissionEchoCompleted ? 'Structure Dormant' : 'Baseline (Rim)'}</span>
                <span>{isMissionEchoCompleted ? 'Residual (4%)' : 'Epicenter (Monolith)'}</span>
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

      {/* SUBTLE SCANLINE & CHROMATIC ABERRATION SCREEN DISTORTION NEAR ANOMALOUS SIGNAL */}
      {anomalousSignal > 0 && (
        <div 
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 overflow-hidden"
          style={{ opacity: Math.min(0.65, (anomalousSignal / 100) * 0.75) }}
        >
          {/* Subtle horizontal scanline raster */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px]" />
          
          {/* Static grain & edge aberration glow */}
          <div 
            className="absolute inset-0"
            style={{
              boxShadow: `inset 0 0 ${Math.round(anomalousSignal * 1.4)}px rgba(168, 85, 247, ${anomalousSignal * 0.0035})`
            }}
          />

          {/* Glitch jitter line when signal is high */}
          {anomalousSignal > 40 && (
            <div 
              className="absolute w-full h-[2px] bg-cyan-400/50 blur-[1px] animate-pulse"
              style={{
                top: `${(Math.sin(Date.now() * 0.004) * 0.5 + 0.5) * 100}%`
              }}
            />
          )}

          {/* Subtle electromagnetic static indicator */}
          <div className="absolute top-1/2 left-6 -translate-y-1/2 text-[9px] font-mono tracking-widest text-purple-300/60 uppercase">
            [EM RESONANCE · 432.06 MHz · SENSOR JITTER]
          </div>
        </div>
      )}

      {/* INCOMING TACTICAL COMMS TRANSMISSION TOAST BANNER */}
      {activeComms && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[92vw] pointer-events-auto animate-fade-in">
          <div className="p-3.5 rounded-2xl bg-slate-950/95 border-2 border-cyan-400/80 shadow-[0_0_40px_rgba(6,182,212,0.5)] backdrop-blur-xl flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex-shrink-0 mt-0.5">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-[10px] tracking-widest uppercase">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 font-bold font-mono">
                    {activeComms.callsign}
                  </span>
                  <span className="text-cyan-400 font-bold">{activeComms.speaker}</span>
                </div>
                {/* Audio visualizer bars */}
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" />
                  <span className="w-0.5 h-3 bg-cyan-300 animate-pulse delay-75" />
                  <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse delay-150" />
                  <span className="w-0.5 h-2.5 bg-cyan-200 animate-pulse delay-100" />
                </div>
              </div>
              <p className="text-slate-100 text-xs font-sans leading-relaxed">
                "{activeComms.text}"
              </p>
            </div>

            <button
              type="button"
              onClick={() => { audio.playClick(); setActiveComms(null); }}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Dismiss comms"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 7-STAGE SUGGESTED PLAYER JOURNEY ROADMAP MODAL */}
      {showJourneyRoadmap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in font-mono select-none">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border border-cyan-500/50 shadow-[0_0_60px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/30 bg-cyan-950/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                  <ListOrdered className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-[10px] text-cyan-400 tracking-widest uppercase">
                    MISSION DIRECTIVE · CHAPTER 1
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
                    Suggested Player Journey Sequence
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { audio.playClick(); setShowJourneyRoadmap(false); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Journey List */}
            <div className="p-6 space-y-3 overflow-y-auto custom-scrollbar">
              <div className="text-[11px] text-slate-400 font-sans pb-1">
                The following 7-phase sequence guides exploration across Oceanus Procellarum naturally, preserving full 360° terrain freedom without artificial corridors.
              </div>

              {JOURNEY_STAGES.map((stg, idx) => {
                const isCurrent = idx === journeyStageIndex;
                const isDone = completedStageIndices.includes(idx) || idx < journeyStageIndex;
                return (
                  <div
                    key={stg.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : isDone
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                        : 'bg-black/40 border-white/10 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-600 flex-shrink-0" />
                        )}
                        <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-cyan-300' : isDone ? 'text-emerald-300' : 'text-slate-400'}`}>
                          {idx + 1}. {stg.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-black/50 border border-white/10 text-[10px] text-slate-400 font-mono">
                          {stg.durationEst}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[9px] uppercase tracking-wider">
                            ACTIVE TARGET
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 font-sans pl-6">
                      {stg.objective}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-cyan-500/30 bg-black/60 flex justify-end">
              <button
                type="button"
                onClick={() => { audio.playClick(); setShowJourneyRoadmap(false); }}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider"
              >
                Return to Surface View
              </button>
            </div>
          </div>
        </div>
      )}

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
            if (target.id === 'poi_mission_terminal' || target.id === 'poi_maya_chen' || target.id === 'poi_leo_vance' || target.id === 'poi_lunar_transport') {
              advanceJourneyStage(1);
            } else if (target.id && target.id.startsWith('surveyor_')) {
              advanceJourneyStage(2);
            } else if (target.id === 'poi_crater_site_alpha' || target.id === 'poi_crater_site_beta' || target.id === 'poi_crater_site_gamma') {
              advanceJourneyStage(3);
            } else if (target.id === 'poi_alien_structure' || target.id === 'poi_data_conduit') {
              advanceJourneyStage(4);
            } else if (target.id === 'poi_recovery_rig' || target.id === 'poi_quantum_storage_unit') {
              advanceJourneyStage(6);
            } else if (target.id === 'poi_extraction_pallet') {
              setShowChapter1Completion(true);
            } else {
              setActiveObjective(`Cataloged: ${target.title}. Continue exploring the sector.`);
            }
          }}
        />
      )}

      {/* ZONE 5 — MISSION ECHO INTERFACE MODAL */}
      <MissionEchoModal
        isOpen={isMissionEchoOpen}
        onClose={() => setIsMissionEchoOpen(false)}
        onCompleteEcho={() => {
          setIsMissionEchoCompleted(true);
          isMissionEchoCompletedRef.current = true;
          advanceJourneyStage(5);
        }}
      />

      {/* CHAPTER 1 MISSION ACCOMPLISHED BANNER (END — NEXT SIGNAL) */}
      {showChapter1Completion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in font-mono select-none">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-950 border-2 border-emerald-500/60 shadow-[0_0_80px_rgba(16,185,129,0.35)] p-6 text-center space-y-5">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
              <Trophy className="w-8 h-8 text-emerald-400 animate-bounce" />
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-emerald-400 font-bold tracking-widest uppercase">
                MISSION ACCOMPLISHED · CHAPTER 1 COMPLETE
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
                End — Next Signal: Vault Zero
              </h2>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
              Surveyor 1 has been braced with robotic stabilizers and all 11,237 historic Vidicon frames are secured in the quantum vault. 
              The alien conduit has powered down, leaving its decrypted transmission vector pointing to an ancient subterranean complex deep beneath the lunar crust: <strong>Vault Zero</strong>.
            </p>

            <div className="p-3.5 rounded-xl bg-black/60 border border-emerald-500/30 text-left text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Phase 1 — Spawn & Debrief:</span>
                <span className="text-emerald-300 font-bold">Team Landing Complete</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Phase 2 — Explore Surveyor 1:</span>
                <span className="text-emerald-300 font-bold">4/4 Components Scanned</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Phase 3 — Investigate Crater:</span>
                <span className="text-purple-300 font-bold">432.06 Hz Epicenter Isolated</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Phase 4 — Discover Alien Structure:</span>
                <span className="text-cyan-300 font-bold">Precursor Monolith Interfaced</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Phase 5 — Solve Mission Echo:</span>
                <span className="text-cyan-300 font-bold">3/3 Historical Puzzles Restored</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Phase 6 — Recover Surveyor 1:</span>
                <span className="text-emerald-300 font-bold">Alien Feed Severed · 11,237 Frames</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Phase 7 — End Next Signal:</span>
                <span className="text-amber-300 font-bold">Arin Commits to Project Legacy</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-left text-xs font-sans text-cyan-200">
              <strong className="text-cyan-300 font-mono">Captain Arin Rao:</strong> "We came to recover our past... but whoever built this left an invitation to what comes next. Project Legacy continues."
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => { audio.playClick(); setShowChapter1Completion(false); }}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Continue Free Exploration
              </button>
              {onReturnMenu && (
                <button
                  type="button"
                  onClick={() => { audio.playClick(); onReturnMenu(); }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  Return to Base Menu
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

