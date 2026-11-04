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
  Wifi,
  Pause,
  Gamepad2,
  Database,
  AlertTriangle
} from 'lucide-react';
import { audio } from '../../game/audioManager';
import InvestigationModal from './InvestigationModal';
import MissionEchoModal from './MissionEchoModal';
import EvidenceDatabaseModal, { INITIAL_EVIDENCE_DATABASE } from './EvidenceDatabaseModal';
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
    name: 'Stage 1 — Arrival on the Moon',
    durationEst: 'Approx. 2 minutes',
    zoneName: 'ZONE 1 · LANDING ZONE',
    targetCoords: { x: 103.2, z: 65.5 },
    waypointLabel: 'Mission Terminal & Route Marker',
    objective: 'Exit transport vehicle, activate mission terminal, review historical briefing, and approach the route marker.',
    hint: 'Exit the transport vehicle and activate the illuminated mission terminal [E].',
    narrative: 'The transport vehicle has landed. Arin opens the hatch and steps onto the lunar surface to debrief with the recovery team and inspect the historic mission parameters before advancing toward Surveyor 1.',
    instructions: 'Use [WASD] to move, [Mouse] to look around, [E] to interact with the mission terminal, and [Q] to activate the scanner.',
    commsCallout: {
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: 'Welcome to the Moon, Captain. Try not to wander too far. We have a spacecraft to recover.'
    }
  },
  {
    stepIndex: 1,
    id: 'explore_surveyor',
    name: 'Stage 2 — Inspect Surveyor 1',
    durationEst: 'Approx. 4 minutes',
    zoneName: 'ZONE 2 · SURVEYOR 1 RECOVERY SITE',
    targetCoords: { x: 0, z: 0 },
    waypointLabel: 'Surveyor 1 Lander',
    objective: 'Investigate the condition of Surveyor 1.',
    hint: 'Approach Surveyor 1 and aim scanner [Q] at the Vidicon camera, solar mast, or landing footpad.',
    narrative: 'Arin approaches the historic Surveyor 1 lander resting in Oceanus Procellarum since June 2, 1966. Using the handheld scanner, Arin conducts interactive telemetry audits on three critical components: the Vidicon television camera assembly, the solar panel and antenna mast, and the crushable honeycomb landing footpad.',
    instructions: 'Approach Surveyor 1. Locate and scan the 3 required targets: (1) Television camera, (2) Solar panel and antenna, and (3) Landing leg and footpad. Complete calibration on all three to assess the lander.',
    commsCallout: {
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: 'Arin, there she is. 160 Earth years untouched in the vacuum. Approach the lander and use your scanner to inspect the television camera, solar array and antenna mast, and landing footpad.'
    }
  },
  {
    stepIndex: 2,
    id: 'investigate_crater',
    name: 'Stage 3 — Track the signal',
    durationEst: 'Approx. 3 minutes',
    zoneName: 'ZONE 3 · ROCK FIELD & INVESTIGATION CRATER',
    targetCoords: { x: -75, z: -50 },
    waypointLabel: 'Investigation Crater & Rock Field',
    objective: 'Track the signal across the rock field and inspect three locations around the crater: Point A (Rock formation), Point B (Crater edge), and Point C (Crater floor).',
    hint: 'Activate scanner [Q] to monitor signal strength. Follow the rising % toward the crater bowl.',
    narrative: 'Arin tracks the mysterious 432 Hz carrier across the rock field toward the 24-meter impact crater. Using the signal scanner, Arin measures signal strength across three key investigation points—the outer rock formation, the crater edge, and the crater floor.',
    instructions: 'Activate the signal scanner with [Q]. Follow the direction and signal strength indicator to inspect Point A (Rock formation), Point B (Crater edge), and Point C (Crater floor).',
    commsCallout: {
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: 'Arin, activate your signal scanner with [Q]. The carrier is strongest near that 24-meter crater across the rock field. Sweep the perimeter and find where that transmission is peaking.'
    }
  },
  {
    stepIndex: 3,
    id: 'discover_alien',
    name: 'Stage 4 — Discover the alien structure',
    durationEst: 'Approx. 3 minutes',
    zoneName: 'ZONE 4 · CRATER FLOOR & UNKNOWN STRUCTURE',
    targetCoords: { x: -78, z: -54 },
    waypointLabel: 'Exposed Alien Structure & Interface',
    objective: 'Scan the exposed structure, inspect the conduit, locate the interface, and activate it.',
    hint: 'Scan the exposed structure on the crater floor, then point scanner at the central interface [E].',
    narrative: 'As Arin approaches the buried fragment on the crater floor, a section of the ground shifts, exposing the upper part of an unfamiliar structure emitting faint cyan light. A narrow conduit extends from it toward Surveyor 1.',
    instructions: 'Scan the exposed structure [Q], inspect the conduit leading toward Surveyor 1, locate the central interface on the console, and point your scanner while holding [E] to activate it.',
    commsCallout: {
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: 'Captain, the ground is shifting! Look at the crater floor—an unfamiliar structure is emerging, emitting cyan light with a conduit tethered directly to Surveyor 1!'
    }
  },
  {
    stepIndex: 4,
    id: 'solve_echo',
    name: 'Stage 5 — Mission Echo: Reconstructing Surveyor 1',
    durationEst: 'Approx. 7 minutes',
    zoneName: 'ZONE 5 · MISSION ECHO INTERFACE',
    targetCoords: { x: -77.2, z: -53.2 },
    waypointLabel: 'Mission Echo Central Console',
    objective: 'Complete the three historical reconstruction puzzles to recover Surveyor 1\'s mission records.',
    hint: 'Open the Mission Echo console [E] to reconstruct descent sequence, soil data, and image tiles.',
    narrative: 'Mission Echo is a fictional reconstruction system that uses recovered telemetry, images and archived records to recreate parts of Surveyor 1\'s historic mission. Arin enters three challenges: the descent sequence, reading the lunar surface, and restoring the image archive.',
    instructions: 'Open the Mission Echo console [E]. (A) Sequence the 4-stage controlled descent, (B) Match surface observations with interpretations, and (C) Reconstruct the 3x3 damaged image archive to uncover the mystery clue.',
    commsCallout: {
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: 'Mission Echo interface is online. Reconstruct the controlled descent sequence, verify the surface soil observations, and restore the 11,240 image archive.'
    }
  },
  {
    stepIndex: 5,
    id: 'recover_surveyor',
    name: 'Stage 6 — Recover Surveyor 1',
    durationEst: 'Approx. 2 minutes',
    zoneName: 'ZONE 6 · RECOVERY SITE',
    targetCoords: { x: 0, z: 0 },
    waypointLabel: 'Surveyor 1 Recovery Site',
    objective: 'Disconnect the unknown transmission without destroying the historic archive.',
    hint: 'Return to Surveyor 1: Scan coupling [Q], isolate transmission on Recovery Rig [E], and secure Quantum Vault [E].',
    narrative: 'Arin returns to Surveyor 1 where the structure remains connected through the alien conduit. Arin must stabilise the interface, isolate the anomalous feed while preserving the 11,240 frames, and activate the portable data-storage unit.',
    instructions: '1. Use scanner [Q] to identify conduit connection point at Footpad 2. 2. Interact with Recovery Rig [E] to isolate anomalous transmission. 3. Activate portable data-storage unit [E] to secure archive.',
    commsCallout: {
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: 'Surveyor 1 is still tethered to the conduit! Scan the connection point to stabilise the interface, then isolate the transmission without corrupting the historical archive.'
    }
  },
  {
    stepIndex: 6,
    id: 'end_next_signal',
    name: 'Stage 7 — The next signal',
    durationEst: 'Approx. 1 minute',
    zoneName: 'ZONE 1 · LANDING SITE & MISSION ENDING',
    targetCoords: { x: 103.2, z: 65.5 },
    waypointLabel: 'Mission Terminal Projection',
    objective: 'The team prepares to leave the landing site. Arin debriefs with Commander Elena.',
    hint: 'Return to the landing zone terminal to view the projected horizon coordinates and complete the mission debrief.',
    narrative: 'The recovered signal fragment is projected above the mission terminal, displaying an unknown location. Commander Elena contacts Arin to debrief the recovery report and authorize the next expedition.',
    instructions: 'Return to the Mission Terminal at the landing site [E]. View the projected unknown coordinates and respond to Commander Elena.',
    commsCallout: {
      callsign: 'ELENA-CMD',
      speaker: 'Commander Elena',
      text: "Captain, we've received your recovery report. The archive is safe. Excellent work."
    }
  }
];

/**
 * Single unified interaction prompt helper (System C)
 * Predictable format: [E] <Action> <TargetName>
 * Includes Situation 7: Dormant inactive interface when approached too early
 */
export function getInteractionPrompt(target, currentStage = 0) {
  if (!target) return '';
  const id = target.id;

  // Situation 7: Player approaches alien structure too early -> Show inactive interface
  if (currentStage < 3 && (
    id === 'poi_exposed_structure' || 
    id === 'poi_alien_structure' || 
    id === 'poi_central_interface' || 
    id === 'poi_scanning_panel' || 
    id === 'poi_crater_conduit' || 
    id === 'poi_data_conduit'
  )) {
    return '[E] Inactive Precursor Interface (Dormant)';
  }

  if (id === 'poi_mission_terminal') return '[E] Read Mission Terminal';
  if (id === 'surveyor_camera') return '[E] Inspect Surveyor 1 Camera';
  if (id === 'surveyor_solar') return '[E] Inspect Solar Panel and Antenna';
  if (id === 'surveyor_footpad') return '[E] Inspect Landing Leg and Footpad';
  if (id === 'surveyor_core') return '[E] Inspect Surveyor 1 Spaceframe';
  if (id === 'poi_crater_site_alpha') return '[E] Examine Rock Formation';
  if (id === 'poi_crater_site_beta') return '[E] Examine Crater Edge Scree';
  if (id === 'poi_crater_site_gamma') return '[E] Examine Buried Fragment';
  if (id === 'poi_exposed_structure') return '[E] Scan Exposed Alien Structure';
  if (id === 'poi_alien_structure') return '[E] Inspect Precursor Monolith';
  if (id === 'poi_crater_conduit' || id === 'poi_data_conduit') return '[E] Inspect Data Conduit';
  if (id === 'poi_central_interface') return '[E] Activate Central Interface';
  if (id === 'poi_scanning_panel') return '[E] Interface with Scanning Panel';
  if (id === 'poi_mission_echo_console') return '[E] Access Mission Echo Hologram';
  if (id === 'poi_descent_simulation') return '[E] Inspect Descent Simulation';
  if (id === 'poi_conduit_coupling') return '[E] Stabilise Interface';
  if (id === 'poi_recovery_rig') return '[E] Isolate Transmission';
  if (id === 'poi_quantum_storage_unit') return '[E] Secure Quantum Archive';
  if (id === 'poi_maya_chen') return '[E] Talk to Specialist Maya Chen';
  if (id === 'poi_leo_vance') return '[E] Talk to Officer Leo Vance';
  if (id === 'poi_lunar_transport') return '[E] Inspect Lunar Transport Vehicle';
  if (id === 'poi_route_marker_alpha') return '[E] Read Route Marker Alpha';
  if (target.actionPrompt) return target.actionPrompt;
  return `[E] Inspect ${target.shortName || target.title}`;
}

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
  const [hudNotice, setHudNotice] = useState('Click screen to look • [WASD] Move • [Space] Jump • [E] Interact • [Q] Scanner • [Esc] Pause');

  // Stage 1 — Arrival on the Moon Tutorial Objectives
  const [stage1Objectives, setStage1Objectives] = useState({
    exit_vehicle: false,
    walk_terminal: false,
    activate_terminal: false,
    read_briefing: false,
    approach_route_marker: false
  });
  const stage1ObjectivesRef = useRef({
    exit_vehicle: false,
    walk_terminal: false,
    activate_terminal: false,
    read_briefing: false,
    approach_route_marker: false
  });

  // Stage 2 — Inspect Surveyor 1 Objectives & Interactive Scanning
  const [stage2Scans, setStage2Scans] = useState({
    camera: false,
    solar: false,
    footpad: false
  });
  const stage2ScansRef = useRef({
    camera: false,
    solar: false,
    footpad: false
  });

  // Interactive Scanner Calibration state (System B)
  const [isScanningActive, setIsScanningActive] = useState(false);
  const isScanningActiveRef = useRef(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanFrequency, setScanFrequency] = useState(136.2);
  const [scanningTarget, setScanningTarget] = useState(null);
  const scanningTargetRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const [isScannerVisorActive, setIsScannerVisorActive] = useState(false);
  const isScannerVisorActiveRef = useRef(false);

  // Evidence Database State (System E)
  const [evidenceEntries, setEvidenceEntries] = useState(INITIAL_EVIDENCE_DATABASE);
  const evidenceEntriesRef = useRef(INITIAL_EVIDENCE_DATABASE);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const isDatabaseOpenRef = useRef(false);
  const [databaseNotice, setDatabaseNotice] = useState(null);
  const databaseNoticeTimerRef = useRef(null);

  const unlockEvidenceEntry = (recordId) => {
    setEvidenceEntries(prev => {
      const existing = prev.find(e => e.id === recordId);
      if (existing && !existing.isUnlocked) {
        const updated = prev.map(e => e.id === recordId ? { ...e, isUnlocked: true, dateUnlocked: new Date().toLocaleTimeString() } : e);
        evidenceEntriesRef.current = updated;
        
        // Show floating HUD notification for new evidence
        if (databaseNoticeTimerRef.current) clearTimeout(databaseNoticeTimerRef.current);
        setDatabaseNotice({
          id: existing.id,
          title: existing.title,
          category: existing.categoryLabel,
          classification: existing.classification
        });
        databaseNoticeTimerRef.current = setTimeout(() => {
          setDatabaseNotice(null);
        }, 5500);

        audio.playSurveyorScannerBeep();
        return updated;
      }
      return prev;
    });
  };

  // Situation 1: Soft boundary warning state
  const [boundaryWarning, setBoundaryWarning] = useState(null);
  const boundaryWarningRef = useRef(null);
  const lastBoundaryCommsTimeRef = useRef(0);
  const lastBoundaryAudioTimeRef = useRef(0);

  // Situation 3: Signal Assistance State (Direction becomes more informative)
  const [isSignalAssisted, setIsSignalAssisted] = useState(false);
  const isSignalAssistedRef = useRef(false);
  const stage3StartTimeRef = useRef(0);
  const lastAssistedHintTimeRef = useRef(0);

  // The Discovery Event & Scanner Signal-Tracking Mode
  const [discoveryEvent, setDiscoveryEvent] = useState(null);
  const discoveryTriggeredRef = useRef(false);
  const [hasSignalTracker, setHasSignalTracker] = useState(false);
  const hasSignalTrackerRef = useRef(false);
  const [isGlitching, setIsGlitching] = useState(false);

  // Stage 3 — Track the Signal Investigation State
  const [stage3Inspections, setStage3Inspections] = useState({
    pointA: false,
    pointB: false,
    pointC: false
  });
  const stage3InspectionsRef = useRef({
    pointA: false,
    pointB: false,
    pointC: false
  });

  // Signal Scanner readings & direction state
  const [scannerReading, setScannerReading] = useState({
    active: true,
    strength: 28,
    tier: 'Weak signal',
    direction: 'North-west',
    relativeDir: 'Ahead',
    bearingDeg: 295,
    distanceM: 75
  });
  const scannerReadingRef = useRef({
    active: true,
    strength: 28,
    tier: 'Weak signal',
    direction: 'North-west',
    relativeDir: 'Ahead',
    bearingDeg: 295,
    distanceM: 75
  });

  const [isPointCDiscovered, setIsPointCDiscovered] = useState(false);
  const isPointCDiscoveredRef = useRef(false);

  // Stage 4 — Discover the Alien Structure State
  const [stage4Objectives, setStage4Objectives] = useState({
    scannedStructure: false,
    inspectedConduit: false,
    locatedInterface: false,
    activatedInterface: false
  });
  const stage4ObjectivesRef = useRef({
    scannedStructure: false,
    inspectedConduit: false,
    locatedInterface: false,
    activatedInterface: false
  });

  const [groundShiftProgress, setGroundShiftProgress] = useState(0);
  const groundShiftProgressRef = useRef(0);
  const isGroundShiftTriggeredRef = useRef(false);

  const [isHologramActive, setIsHologramActive] = useState(false);
  const isHologramActiveRef = useRef(false);

  const [interfaceActivationProgress, setInterfaceActivationProgress] = useState(0);
  const interfaceActivationProgressRef = useRef(0);
  const isActivatingInterfaceRef = useRef(false);
  const interfaceActivationIntervalRef = useRef(null);

  // Stage 6 — Recover Surveyor 1 State
  const [stage6Steps, setStage6Steps] = useState({
    stabilized: false, // Step 1: Scanner identifies conduit connection point
    isolated: false,   // Step 2: Interface choice: Isolate transmission & preserve archive
    secured: false     // Step 3: Activate portable data-storage unit
  });
  const stage6StepsRef = useRef({
    stabilized: false,
    isolated: false,
    secured: false
  });
  const [showIsolateModal, setShowIsolateModal] = useState(false);
  const [showRecoveryReport, setShowRecoveryReport] = useState(false);

  // Stage 7 — The Next Signal State & Ending Cinematic
  const [isEndingCinematic, setIsEndingCinematic] = useState(false);
  const isEndingCinematicRef = useRef(false);
  const endingCinematicTimerRef = useRef(0);
  const [endingDialoguePhase, setEndingDialoguePhase] = useState(0);
  const [showMissionCompleteModal, setShowMissionCompleteModal] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  // Opening Cinematic & Pause State
  const [isOpeningCinematic, setIsOpeningCinematic] = useState(true);
  const isOpeningCinematicRef = useRef(true);
  const [cinematicSub, setCinematicSub] = useState('AEGIS-01 HAS LANDED. DEPRESSURIZING HATCH...');
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  const completeStage1Objective = (id) => {
    if (stage1ObjectivesRef.current[id]) return;
    stage1ObjectivesRef.current = { ...stage1ObjectivesRef.current, [id]: true };
    setStage1Objectives({ ...stage1ObjectivesRef.current });
    audio.playInteract();
  };

  const triggerDiscoverySequence = () => {
    if (discoveryTriggeredRef.current) return;
    discoveryTriggeredRef.current = true;

    // 1. Visual glitch & anomalous harmonic pulse
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 1800);
    audio.playGlitchBurst();
    audio.playAnomalyHarmonic();

    // 2. Display UNKNOWN TRANSMISSION modal / alert card
    setDiscoveryEvent({
      showModal: true,
      phase: 'alert'
    });

    // 3. Scripted radio comms sequence
    // Specialist Maya Chen
    setActiveComms({
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: "Captain, that's strange. The signal isn't coming from the lander's communication system. It's coming from somewhere below the surface."
    });
    audio.playRadioCommsChatter('chen');

    // Captain Arin Rao replies after 5.4 seconds
    setTimeout(() => {
      setActiveComms({
        callsign: 'RAO-COMMAND',
        speaker: 'Captain Arin Rao',
        text: "Then Surveyor isn't the source. It's connected to something else."
      });
      audio.playEquipmentFeedback();
    }, 5400);
  };

  const dismissDiscoveryEvent = () => {
    setDiscoveryEvent(null);
    setHasSignalTracker(true);
    hasSignalTrackerRef.current = true;
    setActiveObjective('New objective: Locate the transmission source.');
    setHudNotice('SCANNER SIGNAL-TRACKING MODE UNLOCKED: Follow 432 Hz carrier NW to Crater Basin (Zone 3)');
    audio.playInteract();
    setTimeout(() => audio.playAnomalyHarmonic(), 360);
  };

  const triggerPointCDiscovery = () => {
    if (isPointCDiscoveredRef.current) return;
    isPointCDiscoveredRef.current = true;
    setIsPointCDiscovered(true);

    // Audio effects for buried precursor artifact
    audio.playAnomalyHarmonic();
    audio.playCraterInterference(1.0);

    // Scripted Comms Exchange
    // Maya: "I'm getting a much stronger reading. Captain, there is something underneath that crater."
    setActiveComms({
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: "I'm getting a much stronger reading. Captain, there is something underneath that crater."
    });
    audio.playRadioCommsChatter('chen');

    // 4.8s later: Arin: "Mark the location. I'm going in."
    setTimeout(() => {
      setActiveComms({
        callsign: 'RAO-COMMAND',
        speaker: 'Captain Arin Rao',
        text: "Mark the location. I'm going in."
      });
      audio.playEquipmentFeedback();
    }, 4800);

    // Update active objective after dialogue & trigger ground shift into Stage 4
    setTimeout(() => {
      setActiveObjective('Precursor fragment uncovered. The crater floor is shifting...');
      advanceJourneyStage(3);
      triggerGroundShift();
    }, 9500);
  };

  const inspectStage3Point = (pointId) => {
    if (stage3InspectionsRef.current[pointId]) return;
    const updated = { ...stage3InspectionsRef.current, [pointId]: true };
    stage3InspectionsRef.current = updated;
    setStage3Inspections(updated);
    audio.playInteract();

    if (pointId === 'pointC') {
      triggerPointCDiscovery();
    }
  };

  // Stage 4 — Helper Functions
  const completeStage4Objective = (key) => {
    if (stage4ObjectivesRef.current[key]) return;
    const updated = { ...stage4ObjectivesRef.current, [key]: true };
    stage4ObjectivesRef.current = updated;
    setStage4Objectives(updated);
    audio.playInteract();
  };

  const triggerGroundShift = () => {
    if (isGroundShiftTriggeredRef.current) return;
    isGroundShiftTriggeredRef.current = true;

    audio.playCraterInterference(1.0);
    audio.playAnomalyHarmonic();
    setHudNotice('SEISMIC TREMOR: Ground shifting at crater floor! Structure emerging...');

    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 2400);

    setActiveComms({
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: 'Captain, the ground is shifting! Look at the crater floor—an unfamiliar structure is emerging, emitting cyan light with a conduit tethered directly to Surveyor 1!'
    });
    audio.playRadioCommsChatter('chen');

    let startTime = performance.now();
    const animGround = (now) => {
      const elapsed = (now - startTime) / 3200;
      const t = Math.min(1, Math.max(0, elapsed));
      const ease = 1 - Math.pow(1 - t, 3);
      groundShiftProgressRef.current = ease;
      setGroundShiftProgress(ease);

      if (t < 1) {
        requestAnimationFrame(animGround);
      } else {
        setHudNotice('OBJECTIVE: Scan the exposed structure [Q] & inspect the conduit to Surveyor 1');
      }
    };
    requestAnimationFrame(animGround);
  };

  const startInterfaceActivation = () => {
    if (stage4ObjectivesRef.current.activatedInterface || isActivatingInterfaceRef.current) return;
    isActivatingInterfaceRef.current = true;
    completeStage4Objective('locatedInterface');

    let prog = 0;
    if (interfaceActivationIntervalRef.current) clearInterval(interfaceActivationIntervalRef.current);

    audio.playSurveyorScannerBeep();
    triggerScannerBeamRef.current?.();

    interfaceActivationIntervalRef.current = setInterval(() => {
      prog += 3.5;
      interfaceActivationProgressRef.current = Math.min(100, prog);
      setInterfaceActivationProgress(Math.min(100, prog));

      if (Math.round(prog) % 15 === 0) {
        audio.playCraterScannerPulse();
      }

      if (prog >= 100) {
        clearInterval(interfaceActivationIntervalRef.current);
        interfaceActivationIntervalRef.current = null;
        isActivatingInterfaceRef.current = false;
        triggerInterfaceReaction();
      }
    }, 45);
  };

  const cancelInterfaceActivation = () => {
    if (stage4ObjectivesRef.current.activatedInterface) return;
    if (interfaceActivationIntervalRef.current) {
      clearInterval(interfaceActivationIntervalRef.current);
      interfaceActivationIntervalRef.current = null;
    }
    isActivatingInterfaceRef.current = false;
    interfaceActivationProgressRef.current = 0;
    setInterfaceActivationProgress(0);
  };

  const triggerInterfaceReaction = () => {
    completeStage4Objective('activatedInterface');
    setIsHologramActive(true);
    isHologramActiveRef.current = true;

    audio.playMissionEchoActivation();
    audio.playAnomalyHarmonic();
    if (triggerSparksRef.current) {
      triggerSparksRef.current(new THREE.Vector3(-77.2, getTerrainHeight(-78, -54) + 1.6, -53.2));
    }
    setHudNotice('INTERFACE SYNCHRONIZED: Holographic Surveyor 1 projection active');

    // Scripted Dialogue Sequence
    // 1. Maya: "That structure is reading the spacecraft's data."
    setActiveComms({
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: "That structure is reading the spacecraft's data."
    });
    audio.playRadioCommsChatter('chen');

    // 2. Arin: "Can you identify the system?" (at 4.2s)
    setTimeout(() => {
      setActiveComms({
        callsign: 'RAO-COMMAND',
        speaker: 'Captain Arin Rao',
        text: "Can you identify the system?"
      });
      audio.playEquipmentFeedback();
    }, 4200);

    // 3. Maya: "No. But it appears to have been collecting something from the lander." (at 8.0s)
    setTimeout(() => {
      setActiveComms({
        callsign: 'CHEN-SCIENCE',
        speaker: 'Specialist Maya Chen',
        text: "No. But it appears to have been collecting something from the lander."
      });
      audio.playRadioCommsChatter('chen');
    }, 8000);

    // 4. Arin: "Then let's see what it collected." (at 12.2s)
    setTimeout(() => {
      setActiveComms({
        callsign: 'RAO-COMMAND',
        speaker: 'Captain Arin Rao',
        text: "Then let's see what it collected."
      });
      audio.playEquipmentFeedback();
    }, 12200);

    // 5. Interface activates Mission Echo (at 15.5s)
    setTimeout(() => {
      audio.playMissionEchoArchivalAudio();
      setHudNotice('MISSION ECHO ACTIVATED: Historical flight reconstruction initialized');
      setIsMissionEchoOpen(true);
      advanceJourneyStage(4);
    }, 15500);
  };

  // Stage 6 — Helper Functions
  const completeStage6Step = (stepKey) => {
    if (stage6StepsRef.current[stepKey]) return;
    const updated = { ...stage6StepsRef.current, [stepKey]: true };
    stage6StepsRef.current = updated;
    setStage6Steps(updated);
    audio.playInteract();

    if (stepKey === 'stabilized') {
      audio.playSurveyorScannerBeep();
      setHudNotice('STEP 1 COMPLETE: Interface stabilised. Conduit connection point locked at Footpad 2.');
      setActiveObjective('Step 2: Interact with Recovery Rig [E] to isolate anomalous transmission while preserving archive.');
    } else if (stepKey === 'isolated') {
      audio.playAnomalyHarmonic();
      setHudNotice('STEP 2 COMPLETE: Transmission isolated. Conduit feed severed from Vidicon bus.');
      setActiveObjective('Step 3: Activate the portable data-storage unit [E] to secure the archive.');
    } else if (stepKey === 'secured') {
      triggerRecoveryReportSequence();
    }
  };

  const triggerRecoveryReportSequence = () => {
    setShowRecoveryReport(true);
    audio.playMissionEchoActivation();
    setHudNotice('RECOVERY COMPLETED: Historic archive secured. Fragment coordinates recovered.');

    // Scripted Dialogue Sequence
    // 1. Maya: "The connection is isolated. We have the archive."
    setActiveComms({
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: "The connection is isolated. We have the archive."
    });
    audio.playRadioCommsChatter('chen');

    // 2. Arin: "And the signal?" (at 3.8s)
    setTimeout(() => {
      setActiveComms({
        callsign: 'RAO-COMMAND',
        speaker: 'Captain Arin Rao',
        text: "And the signal?"
      });
      audio.playEquipmentFeedback();
    }, 3800);

    // 3. Maya: "I recovered a fragment. It contains coordinates, but they don't match any location in our current mission database." (at 7.2s)
    setTimeout(() => {
      setActiveComms({
        callsign: 'CHEN-SCIENCE',
        speaker: 'Specialist Maya Chen',
        text: "I recovered a fragment. It contains coordinates, but they don't match any location in our current mission database."
      });
      audio.playRadioCommsChatter('chen');
    }, 7200);

    // 4. Arin: "Send them to the command ship." (at 12.0s)
    setTimeout(() => {
      setActiveComms({
        callsign: 'RAO-COMMAND',
        speaker: 'Captain Arin Rao',
        text: "Send them to the command ship."
      });
      audio.playEquipmentFeedback();
    }, 12000);

    // 5. Advance to Stage 7 (at 16.0s)
    setTimeout(() => {
      advanceJourneyStage(6);
      setActiveObjective('Return to the Mission Terminal at the landing site to debrief with Commander Elena.');
    }, 16000);
  };

  // Stage 7 — Helper Functions
  const startEndingCinematic = () => {
    if (isEndingCinematicRef.current) return;
    isEndingCinematicRef.current = true;
    setIsEndingCinematic(true);
    endingCinematicTimerRef.current = 0;
    setEndingDialoguePhase(1);

    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch {}
    }

    audio.playMissionEchoActivation();
    setHudNotice('STAGE 7: MISSION DEBRIEF · COMMAND CARRIER AEGIS COMM LINK ESTABLISHED');

    // Dialogue Line 1 (0s)
    // Commander Elena: "Captain, we've received your recovery report. The archive is safe. Excellent work."
    setActiveComms({
      callsign: 'ELENA-CMD',
      speaker: 'Commander Elena',
      text: "Captain, we've received your recovery report. The archive is safe. Excellent work."
    });
    audio.playRadioCommsChatter('elena');

    // Dialogue Line 2 (5.0s)
    // Arin: "Commander, this wasn't just a recovery operation. Something was using Surveyor's data."
    setTimeout(() => {
      setEndingDialoguePhase(2);
      setActiveComms({
        callsign: 'RAO-COMMAND',
        speaker: 'Captain Arin Rao',
        text: "Commander, this wasn't just a recovery operation. Something was using Surveyor's data."
      });
      audio.playEquipmentFeedback();
    }, 5000);

    // Dialogue Line 3 (10.0s)
    // Commander Elena: "Do you want to investigate the coordinates?"
    setTimeout(() => {
      setEndingDialoguePhase(3);
      setActiveComms({
        callsign: 'ELENA-CMD',
        speaker: 'Commander Elena',
        text: "Do you want to investigate the coordinates?"
      });
      audio.playRadioCommsChatter('elena');
    }, 10000);

    // Dialogue Line 4 (15.0s)
    // Arin looks back at Surveyor 1.
    // Arin: "Yes. I think I finally understand what this mission is about."
    setTimeout(() => {
      setEndingDialoguePhase(4);
      setActiveComms({
        callsign: 'RAO-COMMAND',
        speaker: 'Captain Arin Rao',
        text: "Yes. I think I finally understand what this mission is about."
      });
      audio.playEquipmentFeedback();
    }, 15000);

    // Dialogue Line 5 (20.5s)
    // Commander Elena: "Then welcome to Project Legacy, Captain."
    setTimeout(() => {
      setEndingDialoguePhase(5);
      setActiveComms({
        callsign: 'ELENA-CMD',
        speaker: 'Commander Elena',
        text: "Then welcome to Project Legacy, Captain."
      });
      audio.playMissionEchoActivation();
    }, 20500);

    // Camera moves toward Moon's horizon (26.0s)
    setTimeout(() => {
      setEndingDialoguePhase(6);
      setHudNotice('NEXT SIGNAL LOCATION LOCKED · AZIMUTH 294° · VAULT ZERO BEACON');
      audio.playAnomalyHarmonic();
    }, 26000);

    // Final MISSION COMPLETE screen (32.0s)
    setTimeout(() => {
      setShowMissionCompleteModal(true);
      setIsEndingCinematic(false);
      isEndingCinematicRef.current = false;
      audio.playMissionEchoArchivalAudio();
    }, 32000);
  };

  const skipEndingCinematic = () => {
    isEndingCinematicRef.current = false;
    setIsEndingCinematic(false);
    setShowMissionCompleteModal(true);
    audio.playClick();
  };

  const startInteractiveScan = (target, key) => {
    if (!target) return;

    // Situation 7: Player approaches alien structure too early -> Show inactive interface
    if (journeyStageIndex < 3 && (
      target.id === 'poi_exposed_structure' ||
      target.id === 'poi_alien_structure' ||
      target.id === 'poi_central_interface' ||
      target.id === 'poi_scanning_panel' ||
      target.id === 'poi_crater_conduit' ||
      target.id === 'poi_data_conduit'
    )) {
      audio.playScanNoSignal();
      setHudNotice('SCANNER: INACTIVE PRECURSOR STRUCTURE · 0.00% Local Resonance. Inspect Surveyor 1 and track signal first.');
      setActiveComms({
        callsign: 'CHEN-SCIENCE',
        speaker: 'Specialist Maya Chen',
        text: 'Captain, that structure appears completely inert right now. We need to inspect Surveyor 1 and trace the signal first to understand what powers it.'
      });
      audio.playRadioCommsChatter('chen');
      return;
    }

    if (isScanningActiveRef.current) return;
    setIsScanningActive(true);
    isScanningActiveRef.current = true;
    setScanningTarget(target);
    scanningTargetRef.current = target;
    setScanProgress(0);
    setScanFrequency(136.2);

    audio.playSurveyorScannerBeep();
    triggerScannerBeamRef.current?.();

    let currentProg = 0;
    let freq = 136.2;
    let tickCount = 0;

    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = setInterval(() => {
      currentProg += 3.2;
      freq += (2295.0 - 136.2) / 32;
      tickCount++;

      if (tickCount % 6 === 0) {
        audio.playSurveyorScannerBeep();
      }

      setScanProgress(Math.min(100, currentProg));
      setScanFrequency(freq);

      if (currentProg >= 100) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
        setIsScanningActive(false);
        isScanningActiveRef.current = false;

        audio.playSurveyorInterface();
        
        // Stage 2 Component Scans
        if (key && ['camera', 'solar', 'footpad'].includes(key)) {
          const updated = { ...stage2ScansRef.current, [key]: true };
          stage2ScansRef.current = updated;
          setStage2Scans(updated);

          // Check if all 3 targets are scanned
          if (Object.values(updated).every(Boolean) && !discoveryTriggeredRef.current) {
            triggerDiscoverySequence();
          }
        }

        // Stage 4 Scanned Structure
        if (target.id === 'poi_exposed_structure' || target.id === 'poi_alien_structure') {
          completeStage4Objective('scannedStructure');
        }

        // Stage 6 Stabilise Interface
        if (target.id === 'poi_conduit_coupling' && journeyStageIndex === 5) {
          completeStage6Step('stabilized');
        }

        // Map target ID to Evidence Database Record ID (System E)
        const targetEvidenceMap = {
          'surveyor_camera': 'hist_vidicon_camera',
          'surveyor_solar': 'hist_solar_array',
          'surveyor_footpad': 'hist_soil_mechanics',
          'surveyor_core': 'hist_surveyor_touchdown',
          'poi_mission_terminal': 'hist_atlas_centaur',
          'poi_crater_site_alpha': 'evid_basalt_outcrop',
          'poi_crater_site_beta': 'evid_crater_scree',
          'poi_crater_site_gamma': 'sig_precursor_structure',
          'poi_exposed_structure': 'sig_precursor_structure',
          'poi_alien_structure': 'sig_precursor_structure',
          'poi_crater_conduit': 'evid_data_conduit_line',
          'poi_data_conduit': 'evid_data_conduit_line',
          'poi_central_interface': 'sig_volumetric_interface',
          'poi_scanning_panel': 'sig_volumetric_interface',
          'poi_conduit_coupling': 'evid_recovery_gantry',
          'poi_recovery_rig': 'evid_recovery_gantry',
          'poi_quantum_storage_unit': 'evid_quantum_vault'
        };

        const evidenceId = targetEvidenceMap[target.id];
        if (evidenceId) {
          unlockEvidenceEntry(evidenceId);
        }

        if (target.id === 'surveyor_core' || target.id === 'poi_crater_site_alpha' || target.id === 'poi_crater_site_beta') {
          unlockEvidenceEntry('sig_harmonic_432');
        }
        if (target.id === 'poi_crater_conduit' || target.id === 'poi_data_conduit') {
          unlockEvidenceEntry('sig_extraction_telemetry');
        }
        if (target.id === 'poi_quantum_storage_unit') {
          unlockEvidenceEntry('sig_vault_zero_coords');
        }

        // Open Smithsonian / Archival Dossier
        setInvestigateTarget(target);
      }
    }, 45);
  };

  const cancelInteractiveScan = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanningActive(false);
    isScanningActiveRef.current = false;
    setScanProgress(0);
    scanningTargetRef.current = null;
    setScanningTarget(null);
  };

  const skipCinematic = () => {
    if (!isOpeningCinematicRef.current) return;
    isOpeningCinematicRef.current = false;
    setIsOpeningCinematic(false);
    completeStage1Objective('exit_vehicle');
    setActiveComms({
      callsign: 'CHEN-SCIENCE',
      speaker: 'Specialist Maya Chen',
      text: 'Welcome to the Moon, Captain. Try not to wander too far. We have a spacecraft to recover.'
    });
    audio.playRadioCommsChatter('chen');
  };

  const togglePause = () => {
    setIsPaused(prev => {
      const next = !prev;
      isPausedRef.current = next;
      if (next && document.pointerLockElement) {
        document.exitPointerLock();
      }
      return next;
    });
  };

  // 7-Stage Suggested Player Journey State
  const [journeyStageIndex, setJourneyStageIndex] = useState(0);
  const journeyStageIndexRef = useRef(0);
  useEffect(() => {
    journeyStageIndexRef.current = journeyStageIndex;
  }, [journeyStageIndex]);

  const [completedStageIndices, setCompletedStageIndices] = useState([]);
  const [activeComms, setActiveComms] = useState(null);
  const [showJourneyRoadmap, setShowJourneyRoadmap] = useState(false);
  const [navTargetBearing, setNavTargetBearing] = useState(264);
  const [navTargetDistance, setNavTargetDistance] = useState(105);

  const advanceJourneyStage = (nextIndex) => {
    journeyStageIndexRef.current = nextIndex;
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

    // Situation 2: Player scans the wrong object / empty terrain -> Scanner says no relevant signal
    if (!nearInteractableRef.current) {
      setTimeout(() => {
        audio.playScanNoSignal();
        setHudNotice('SCANNER: NO RELEVANT SIGNAL · Target is inert lunar regolith / basalt matrix. No anomalous carrier detected.');
      }, 250);
    }

    // Show scanner telemetry feedback in HUD
    if (journeyStageIndex === 2 || hasSignalTracker) {
      setHudNotice(`SIGNAL TRACKER: ${scannerReadingRef.current.strength}% [${scannerReadingRef.current.tier}] · Direction: ${scannerReadingRef.current.direction}`);
    }

    // Stage 6 Step 1: Scanner identifies and stabilises conduit connection point at Footpad 2
    if (journeyStageIndex === 5 && !stage6StepsRef.current.stabilized) {
      if ((nearInteractableRef.current && (
        nearInteractableRef.current.id === 'poi_conduit_coupling' ||
        nearInteractableRef.current.id === 'poi_recovery_rig' ||
        nearInteractableRef.current.id.startsWith('surveyor_')
      )) || distanceToSurveyor < 18) {
        completeStage6Step('stabilized');
      }
    }
  };

  const triggerInvestigation = () => {
    if (nearInteractableRef.current) {
      const id = nearInteractableRef.current.id;

      // Situation 7: Player approaches alien structure too early -> Show inactive interface
      if (journeyStageIndex < 3 && (
        id === 'poi_exposed_structure' ||
        id === 'poi_alien_structure' ||
        id === 'poi_central_interface' ||
        id === 'poi_scanning_panel' ||
        id === 'poi_crater_conduit' ||
        id === 'poi_data_conduit'
      )) {
        audio.playScanNoSignal();
        setHudNotice('INTERFACE INACTIVE: Precursor console is dormant. Local energy grid unpowered. Inspect Surveyor 1 and trace seismic signal to activate.');
        setActiveComms({
          callsign: 'CHEN-SCIENCE',
          speaker: 'Specialist Maya Chen',
          text: 'Captain, that structure appears completely inert right now. We need to inspect Surveyor 1 and trace the signal first to understand what powers it.'
        });
        audio.playRadioCommsChatter('chen');
        return;
      }

      if (id === 'poi_scanning_panel' || id === 'poi_mission_echo_console' || id === 'poi_descent_simulation') {
        audio.playMissionEchoActivation();
        setTimeout(() => audio.playMissionEchoArchivalAudio(), 320);
        if (triggerSparksRef.current && nearInteractableRef.current.position) {
          triggerSparksRef.current(nearInteractableRef.current.position);
        }
        setIsMissionEchoOpen(true);
      } else if (id && id.startsWith('surveyor_')) {
        const target = nearInteractableRef.current;
        const key = target.id === 'surveyor_camera' ? 'camera' : target.id === 'surveyor_solar' ? 'solar' : target.id === 'surveyor_footpad' ? 'footpad' : null;
        if (key && !stage2ScansRef.current[key]) {
          startInteractiveScan(target, key);
        } else {
          audio.playSurveyorScannerBeep();
          setTimeout(() => audio.playSurveyorInterface(), 260);
          setInvestigateTarget(target);
        }
      } else if (id === 'poi_mission_terminal' || id === 'poi_lunar_transport' || id === 'poi_route_marker_alpha') {
        if (id === 'poi_mission_terminal' || id === 'poi_lunar_transport') {
          if (journeyStageIndex === 6) {
            startEndingCinematic();
            return;
          }
          if (id === 'poi_mission_terminal') completeStage1Objective('activate_terminal');
        } else if (id === 'poi_route_marker_alpha') {
          completeStage1Objective('approach_route_marker');
          advanceJourneyStage(1);
        }
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
        if (id === 'poi_crater_site_alpha') inspectStage3Point('pointA');
        else if (id === 'poi_crater_site_beta') inspectStage3Point('pointB');
        else if (id === 'poi_crater_site_gamma') inspectStage3Point('pointC');
        setInvestigateTarget(nearInteractableRef.current);
      } else if (id === 'poi_central_interface' || id === 'poi_scanning_panel') {
        if (journeyStageIndexRef.current < 3) {
          setHudNotice('INTERFACE INACTIVE: Precursor console is dormant. Local energy grid unpowered. Inspect Surveyor 1 and trace seismic signal to activate.');
          audio.playScanNoSignal();
          setActiveComms({
            callsign: 'CHEN-SCIENCE',
            speaker: 'Specialist Maya Chen',
            text: 'Captain, that structure appears completely inert right now. We need to inspect Surveyor 1 and trace the signal first to understand what powers it.'
          });
          audio.playRadioCommsChatter('chen');
          return;
        }
        if (!stage4ObjectivesRef.current.activatedInterface) {
          startInterfaceActivation();
        } else {
          setIsMissionEchoOpen(true);
        }
      } else if (id === 'poi_exposed_structure') {
        if (journeyStageIndexRef.current < 3) {
          setHudNotice('PRECURSOR STRUCTURE DORMANT: No active energy or data carrier detected.');
          audio.playScanNoSignal();
          return;
        }
        completeStage4Objective('scannedStructure');
        audio.playSurveyorScannerBeep();
        setInvestigateTarget(nearInteractableRef.current);
      } else if (id === 'poi_crater_conduit') {
        if (journeyStageIndexRef.current < 3) {
          setHudNotice('DATA CONDUIT INERT: Awaiting precursor core activation.');
          audio.playScanNoSignal();
          return;
        }
        completeStage4Objective('inspectedConduit');
        audio.playAnomalyHarmonic();
        setInvestigateTarget(nearInteractableRef.current);
      } else if (id === 'poi_conduit_coupling') {
        if (journeyStageIndex === 5 && !stage6StepsRef.current.stabilized) {
          completeStage6Step('stabilized');
        } else {
          setInvestigateTarget(nearInteractableRef.current);
        }
      } else if (id === 'poi_recovery_rig') {
        if (journeyStageIndex === 5 && stage6StepsRef.current.stabilized && !stage6StepsRef.current.isolated) {
          setShowIsolateModal(true);
        } else {
          setInvestigateTarget(nearInteractableRef.current);
        }
      } else if (id === 'poi_quantum_storage_unit') {
        if (journeyStageIndex === 5 && stage6StepsRef.current.isolated && !stage6StepsRef.current.secured) {
          completeStage6Step('secured');
        } else {
          setInvestigateTarget(nearInteractableRef.current);
        }
      } else if (id === 'poi_alien_structure' || id === 'poi_data_conduit') {
        audio.playAnomalyHarmonic();
        setInvestigateTarget(nearInteractableRef.current);
      } else if (id === 'poi_extraction_pallet' && isMissionEchoCompletedRef.current) {
        audio.playEquipmentFeedback();
        if (journeyStageIndex === 6) {
          startEndingCinematic();
        } else {
          setShowMissionCompleteModal(true);
        }
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

    // 3. CAMERA — First-Person Astronaut Eye Level (1.7m)
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 2000);
    const EYE_HEIGHT = 1.7;
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

    // L. Stage 2 Inspection Holographic Target Brackets & Optical Highlights
    // Target 1: Vidicon Television Camera Gimbal Bracket
    const targetMarkerCamera = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.018, 12, 32),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.75 })
    );
    targetMarkerCamera.position.set(0.65, 3.2, -0.65);
    surveyorGroup.add(targetMarkerCamera);

    // Target 2: Solar Panel & Antenna Array Mast Bracket
    const targetMarkerSolar = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.02, 12, 32),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.75 })
    );
    targetMarkerSolar.position.set(0, 5.2, 0.2);
    surveyorGroup.add(targetMarkerSolar);

    // Target 3: Honeycomb Landing Footpad #2 & Regolith Trench Ring
    const targetMarkerFootpad = new THREE.Mesh(
      new THREE.RingGeometry(0.88, 0.98, 32),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    targetMarkerFootpad.rotation.x = -Math.PI / 2;
    targetMarkerFootpad.position.set(Math.cos((2 * Math.PI) / 3) * 3.6, 0.08, Math.sin((2 * Math.PI) / 3) * 3.6);
    surveyorGroup.add(targetMarkerFootpad);

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

    // Stage 7: Recovered Signal Fragment & Unknown Map Location Hologram above Terminal
    const terminalHoloProjection = new THREE.Group();
    terminalHoloProjection.position.set(0, 1.95, 0.15);
    terminalHoloProjection.visible = false;

    // 1. Wireframe Holographic Lunar Globe / Map
    const holoGlobeGeo = new THREE.SphereGeometry(0.36, 16, 12);
    const holoGlobeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const holoGlobeMesh = new THREE.Mesh(holoGlobeGeo, holoGlobeMat);
    terminalHoloProjection.add(holoGlobeMesh);

    // 2. Concentric Tactical Coordinate Rings
    const holoRingGeo = new THREE.RingGeometry(0.48, 0.52, 32);
    const holoRingMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const holoRing1 = new THREE.Mesh(holoRingGeo, holoRingMat);
    holoRing1.rotation.x = Math.PI / 2;
    terminalHoloProjection.add(holoRing1);

    const holoRing2 = new THREE.Mesh(
      new THREE.RingGeometry(0.62, 0.65, 32),
      new THREE.MeshBasicMaterial({ color: 0x818cf8, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
    );
    holoRing2.rotation.x = Math.PI / 2;
    terminalHoloProjection.add(holoRing2);

    // 3. Beacon pin indicating the unknown location coordinates
    const beaconPinMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const beaconPin = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.22, 8), beaconPinMat);
    beaconPin.position.set(0.22, 0.24, 0.15);
    beaconPin.rotation.z = -Math.PI / 4;
    terminalHoloProjection.add(beaconPin);

    // 4. Recovered Signal Fragment Glyph hovering above globe
    const stage7GlyphGeo = new THREE.OctahedronGeometry(0.09, 0);
    const stage7GlyphMat = new THREE.MeshBasicMaterial({ color: 0xec4899, wireframe: true });
    const stage7GlyphMesh = new THREE.Mesh(stage7GlyphGeo, stage7GlyphMat);
    stage7GlyphMesh.position.set(0, 0.55, 0);
    terminalHoloProjection.add(stage7GlyphMesh);

    // 5. Holographic PointLight
    const stage7HoloLight = new THREE.PointLight(0x38bdf8, 3.0, 12);
    stage7HoloLight.position.set(0, 0.3, 0);
    terminalHoloProjection.add(stage7HoloLight);

    terminalGroup.add(terminalHoloProjection);

    // Stage 7: Distant Horizon Signal Beacon (Vault Zero / Next Signal Location)
    const horizonBeaconGroup = new THREE.Group();
    horizonBeaconGroup.position.set(-360, 48, -260);
    horizonBeaconGroup.visible = false;

    const horizonBeaconCore = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    horizonBeaconGroup.add(horizonBeaconCore);

    const beaconBeamGeo = new THREE.CylinderGeometry(0.8, 4.0, 180, 16, 1, true);
    const beaconBeamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const beaconBeam = new THREE.Mesh(beaconBeamGeo, beaconBeamMat);
    beaconBeam.position.y = 90;
    horizonBeaconGroup.add(beaconBeam);

    const horizonBeaconLight = new THREE.PointLight(0x06b6d4, 15, 300);
    horizonBeaconLight.position.y = 10;
    horizonBeaconGroup.add(horizonBeaconLight);

    scene.add(horizonBeaconGroup);

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
    // J. ROUTE MARKER ALPHA — TRAIL TO SURVEYOR 1 (X: 82.0, Z: 52.0)
    // =========================================================================
    const routeMarkerGroup = new THREE.Group();
    const routeMarkerY = getTerrainHeight(82.0, 52.0);
    routeMarkerGroup.position.set(82.0, routeMarkerY, 52.0);

    // 1. Hexagonal Mooring Base with Ground Foundation
    const markerBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 1.15, 0.35, 6),
      matRocketNozzle
    );
    markerBase.position.y = 0.175;
    markerBase.castShadow = true;
    routeMarkerGroup.add(markerBase);

    // Hazard warning ring
    const markerHazardRing = new THREE.Mesh(
      new THREE.RingGeometry(0.86, 1.12, 6),
      new THREE.MeshStandardMaterial({ map: hazardStripeMap, roughness: 0.4 })
    );
    markerHazardRing.rotation.x = -Math.PI / 2;
    markerHazardRing.position.y = 0.355;
    routeMarkerGroup.add(markerHazardRing);

    // 2. Vertical Navigational Pylon Mast (3.2m high)
    const markerMast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 3.2, 12),
      matAluminum
    );
    markerMast.position.y = 1.6;
    markerMast.castShadow = true;
    routeMarkerGroup.add(markerMast);

    // 3. Directional Pointer Fin Pointed West toward Surveyor 1
    const markerPointer = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.28, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8, roughness: 0.2 })
    );
    markerPointer.position.set(-0.45, 2.7, 0);
    markerPointer.rotation.y = 0.15;
    routeMarkerGroup.add(markerPointer);

    // 4. Pulsing Navigational Strobe Beacon
    const markerStrobe = new THREE.PointLight(0xf59e0b, 3.0, 18);
    markerStrobe.position.set(0, 3.3, 0);
    routeMarkerGroup.add(markerStrobe);

    const markerGlobe = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    markerGlobe.position.set(0, 3.3, 0);
    routeMarkerGroup.add(markerGlobe);

    // 5. Holographic Ground Waypoint Ring with Arrow Chevrons
    const groundHoloRing = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 1.7, 32),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
    );
    groundHoloRing.rotation.x = -Math.PI / 2;
    groundHoloRing.position.y = 0.05;
    routeMarkerGroup.add(groundHoloRing);

    // Floating Holographic Waypoint Ring in the Air
    const airHoloRing = new THREE.Mesh(
      new THREE.RingGeometry(1.1, 1.25, 32),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    airHoloRing.position.set(0, 2.2, 0);
    airHoloRing.rotation.x = 0.2;
    routeMarkerGroup.add(airHoloRing);

    scene.add(routeMarkerGroup);

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

    // C. Partially Buried Metallic Precursor Object & Stage 4 Exposed Alien Structure
    const buriedObjGroup = new THREE.Group();
    const buriedWorldY = getTerrainHeight(-78, -54);
    buriedObjGroup.position.set(-3.0, buriedWorldY - craterCenterY, -4.0);

    // 1. Shiftable Lunar Crust Slabs (covering the structure, parting when ground shifts)
    const shiftSlabsGroup = new THREE.Group();
    const slabMeshes = [];
    for (let s = 0; s < 4; s++) {
      const slabGeo = new THREE.BoxGeometry(1.8, 0.24, 1.8);
      const slabMesh = new THREE.Mesh(slabGeo, regolithRockMat);
      const angle = (s * Math.PI) / 2 + 0.35;
      const rad = 1.35;
      slabMesh.position.set(Math.cos(angle) * rad, 0.08, Math.sin(angle) * rad);
      slabMesh.rotation.set((Math.random() - 0.5) * 0.15, angle, (Math.random() - 0.5) * 0.15);
      slabMesh.castShadow = true;
      slabMesh.receiveShadow = true;
      shiftSlabsGroup.add(slabMesh);
      slabMeshes.push({ mesh: slabMesh, basePos: slabMesh.position.clone(), angle });
    }
    buriedObjGroup.add(shiftSlabsGroup);

    // 2. Emerging Unfamiliar Alien Structure (Rises vertically as ground shifts)
    const exposedStructureGroup = new THREE.Group();
    exposedStructureGroup.position.y = -2.2; // Starts recessed under lunar regolith

    // Polyhedral Octagonal Carapace Plinth
    const alienPlinthMat = new THREE.MeshStandardMaterial({
      map: alienGlyphMap,
      color: 0x05070e,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.55,
      metalness: 0.98,
      roughness: 0.10
    });
    const structurePlinth = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.7, 1.6, 8),
      alienPlinthMat
    );
    structurePlinth.position.y = 0.8;
    structurePlinth.castShadow = true;
    structurePlinth.receiveShadow = true;
    exposedStructureGroup.add(structurePlinth);

    // Stepped Upper Prism Tower
    const structureCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 2.0, 2.4, 8),
      alienPlinthMat
    );
    structureCrown.position.y = 2.4;
    structureCrown.castShadow = true;
    exposedStructureGroup.add(structureCrown);

    // Glowing Cyan Circuit Ribs
    const cyanCircuitMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let r = 0; r < 8; r++) {
      const a = (r * Math.PI * 2) / 8;
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.2, 0.04), cyanCircuitMat);
      rib.position.set(Math.cos(a) * 1.65, 2.4, Math.sin(a) * 1.65);
      exposedStructureGroup.add(rib);
    }

    // Faint Cyan Structure Light (Emits faint cyan illumination as required)
    const cyanStructureLight = new THREE.PointLight(0x06b6d4, 0.8, 24);
    cyanStructureLight.position.set(0, 3.2, 0);
    exposedStructureGroup.add(cyanStructureLight);

    // Retain legacy handles for backwards animation compatibility
    const buriedMonolithMat = alienPlinthMat;
    const buriedObjectLight = cyanStructureLight;
    const groundBreachRing = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 2.6, 32),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    groundBreachRing.rotation.x = -Math.PI / 2;
    groundBreachRing.position.y = 0.08;
    buriedObjGroup.add(groundBreachRing);

    // Levitating Apex Crystal Shards
    const shardGroup = new THREE.Group();
    shardGroup.position.y = 4.0;
    for (let sh = 0; sh < 4; sh++) {
      const sa = (sh * Math.PI * 2) / 4;
      const shard = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.24, 0),
        new THREE.MeshStandardMaterial({ color: 0x04060c, emissive: 0x38bdf8, emissiveIntensity: 0.9, metalness: 0.99, roughness: 0.05 })
      );
      shard.position.set(Math.cos(sa) * 0.85, 0, Math.sin(sa) * 0.85);
      shardGroup.add(shard);
    }
    exposedStructureGroup.add(shardGroup);

    // 3. Central Alien Interface Console
    const interfaceConsoleGroup = new THREE.Group();
    interfaceConsoleGroup.position.set(1.4, 1.2, 0.8);
    interfaceConsoleGroup.rotation.y = -Math.PI / 4;

    // Angled Console Pedestal
    const consolePillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.45, 1.1, 6),
      new THREE.MeshStandardMaterial({ color: 0x0a0e1a, metalness: 0.95, roughness: 0.15 })
    );
    consolePillar.position.y = 0.55;
    interfaceConsoleGroup.add(consolePillar);

    // Slanted Touch Interface Panel
    const panelGeo = new THREE.BoxGeometry(0.72, 0.06, 0.72);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x050c18,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.85,
      metalness: 0.95,
      roughness: 0.12
    });
    const consolePanel = new THREE.Mesh(panelGeo, panelMat);
    consolePanel.position.set(0, 1.15, 0);
    consolePanel.rotation.x = -0.42;
    interfaceConsoleGroup.add(consolePanel);

    // Glowing Interface Reticle Ring
    const reticleRing = new THREE.Mesh(
      new THREE.RingGeometry(0.16, 0.28, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
    );
    reticleRing.position.set(0, 1.19, 0.01);
    reticleRing.rotation.x = -0.42 - Math.PI / 2;
    interfaceConsoleGroup.add(reticleRing);

    // Console Point Light
    const consoleLight = new THREE.PointLight(0x06b6d4, 1.8, 6);
    consoleLight.position.set(0, 1.4, 0);
    interfaceConsoleGroup.add(consoleLight);

    exposedStructureGroup.add(interfaceConsoleGroup);

    // 4. Volumetric Holographic Projection of Surveyor 1 (Appears above the interface)
    const surveyorHoloGroup = new THREE.Group();
    surveyorHoloGroup.position.set(1.4, 2.6, 0.8);
    surveyorHoloGroup.visible = false; // Hidden until interface is activated!

    const interfaceHoloWireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const interfaceHoloGlowMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });

    // Upward Conical Holographic Projection Beam
    const projBeam = new THREE.Mesh(
      new THREE.ConeGeometry(0.9, 1.8, 16, 1, true),
      interfaceHoloGlowMat
    );
    projBeam.position.y = -0.2;
    surveyorHoloGroup.add(projBeam);

    // Holographic Surveyor 1 Spaceframe
    const holoChassis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.7, 0.6, 3, 1, true),
      interfaceHoloWireMat
    );
    holoChassis.position.y = 0.5;
    surveyorHoloGroup.add(holoChassis);

    // Holographic Solar Mast & Planar Antenna
    const holoMast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 6), interfaceHoloWireMat);
    holoMast.position.set(0, 1.1, 0);
    surveyorHoloGroup.add(holoMast);

    const holoPanel = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.03), interfaceHoloWireMat);
    holoPanel.position.set(0, 1.4, 0.1);
    surveyorHoloGroup.add(holoPanel);

    const holoDish = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 12), interfaceHoloWireMat);
    holoDish.position.set(0.28, 1.15, 0);
    holoDish.rotation.z = Math.PI / 4;
    surveyorHoloGroup.add(holoDish);

    // 3 Holographic Landing Legs
    for (let hl = 0; hl < 3; hl++) {
      const hla = (hl * Math.PI * 2) / 3;
      const hleg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 6), interfaceHoloWireMat);
      hleg.position.set(Math.cos(hla) * 0.45, 0.25, Math.sin(hla) * 0.45);
      hleg.rotation.x = Math.sin(hla) * 0.55;
      hleg.rotation.z = -Math.cos(hla) * 0.55;
      surveyorHoloGroup.add(hleg);

      const hfoot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8), interfaceHoloWireMat);
      hfoot.position.set(Math.cos(hla) * 0.75, 0.02, Math.sin(hla) * 0.75);
      surveyorHoloGroup.add(hfoot);
    }

    // Holographic Vidicon Camera
    const holoCam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8), interfaceHoloWireMat);
    holoCam.position.set(0.3, 0.7, 0.2);
    holoCam.rotation.x = 0.35;
    surveyorHoloGroup.add(holoCam);

    // Rotating Horizontal Scan Ring
    const holoScanRing = new THREE.Mesh(
      new THREE.RingGeometry(0.65, 0.82, 32),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
    );
    holoScanRing.rotation.x = Math.PI / 2;
    holoScanRing.position.y = 0.5;
    surveyorHoloGroup.add(holoScanRing);

    exposedStructureGroup.add(surveyorHoloGroup);

    buriedObjGroup.add(exposedStructureGroup);
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

    // H. Narrow Data Conduit extending from Crater Floor Structure toward Surveyor 1
    const conduitPoints = [
      new THREE.Vector3(-78, getTerrainHeight(-78, -54) + 0.14, -54),
      new THREE.Vector3(-74, getTerrainHeight(-74, -48) + 0.14, -48),
      new THREE.Vector3(-66, getTerrainHeight(-66, -42) + 0.14, -42),
      new THREE.Vector3(-42, getTerrainHeight(-42, -28) + 0.14, -28),
      new THREE.Vector3(-18, getTerrainHeight(-18, -12) + 0.14, -12),
      new THREE.Vector3(0, surveyorTerrainY + 0.14, 0)
    ];
    const conduitCurve = new THREE.CatmullRomCurve3(conduitPoints);
    const conduitTubeGeo = new THREE.TubeGeometry(conduitCurve, 96, 0.14, 10, false);
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
        title: 'Tactical Mission Terminal · Sector Alpha',
        position: new THREE.Vector3(103.2, landingTerrainY + 1.1, 65.5),
        radius: 4.2,
        sector: 'Zone 1 · Team Landing Zone',
        artifactAge: 'Current Expedition (2126)',
        integrity: '100% Operational',
        telemetryStatus: 'Carrier Aegis Link Active',
        description: 'NASA Reconnaissance Division tactical field terminal. Displays mission parameters, EVA suit vitals, route waypoints to Surveyor 1, and Carrier Aegis high-bandwidth uplink.',
        historicalFacts: [
          'Surveyor 1 was launched on May 30, 1966.',
          'It achieved a soft landing on the Moon on June 2, 1966.',
          'Its mission helped demonstrate that a spacecraft could land safely on the lunar surface.'
        ],
        historicalContext: 'Surveyor 1 was humanity’s first successful robotic soft lander on another celestial body. Prior to its touchdown in Oceanus Procellarum, scientists were uncertain whether the lunar regolith could support a spacecraft without sinking into deep dust. Surveyor 1 returned over 11,200 photographs and proved the bearing strength of the lunar surface, directly paving the way for the Apollo manned missions.',
        controlsGuide: [
          { mechanic: 'Move', input: 'WASD' },
          { mechanic: 'Look', input: 'Mouse' },
          { mechanic: 'Interact', input: 'E' },
          { mechanic: 'Scanner', input: 'Q' },
          { mechanic: 'Pause', input: 'Esc' }
        ],
        readings: {
          'Target Spacecraft': 'Surveyor 1 (Soft-landed June 2, 1966)',
          'Touchdown Basin': 'Oceanus Procellarum (2.47° S, 43.34° W)',
          'Heading to Target': '264° West (105m away)',
          'Primary Task': 'Investigate historic lander & trace seismic tremor',
          'Next Waypoint': 'Route Marker Alpha (82m West)'
        },
        officerNote: '“Leo and Maya have the landing vehicle secured. Time to inspect Surveyor 1 and see what caused the seismic disruption that brought us here.”'
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
      {
        id: 'poi_route_marker_alpha',
        title: 'Route Marker Alpha (Trail to Surveyor 1)',
        position: new THREE.Vector3(82.0, getTerrainHeight(82.0, 52.0) + 1.4, 52.0),
        radius: 4.8,
        sector: 'Zone 1 · Western Departure',
        artifactAge: 'Current Expedition (2126)',
        integrity: '100% Active Nav Beacon',
        telemetryStatus: 'Optical Waypoint Locked',
        description: 'Autonomous laser navigation beacon deployed along the historical traverse route. Transmits optical waypoints leading West across Oceanus Procellarum to the Surveyor 1 touchdown site.',
        readings: {
          'Heading to Surveyor 1': '264° West',
          'Distance to Target': '82 metres',
          'Terrain Condition': 'Firm basalt regolith / rover tracks',
          'Guidance': 'Follow double wheel tread impressions'
        },
        officerNote: '“This route marker marks the transition from our landing site to the open mare plains. Straight ahead lies Surveyor 1.”'
      },

      // ================= ZONE 2: SURVEYOR 1 RECOVERY SITE =================
      {
        id: 'surveyor_camera',
        title: 'Target 1 — Television camera',
        shortName: 'Television camera',
        position: new THREE.Vector3(0.65, surveyorTerrainY + 3.2, -0.65),
        radius: 3.8,
        sector: 'Zone 2 · Surveyor 1 Recovery Site',
        artifactAge: '160 Earth Years (1966 - 2126)',
        integrity: '92.4% Preserved Vacuum Patina',
        telemetryStatus: 'Historic Vidicon Imaging Equipment',
        image: '/images/surveyor1_moon_earth.jpg',
        description: 'Historic Vidicon imaging equipment. The player scans the camera assembly. The interface identifies the spacecraft\'s historic imaging equipment. Between June 2 and July 14, 1966, this motorized mirror television camera scanned the cratered plains of Oceanus Procellarum, proving that lunar dust would not swallow future Apollo astronauts.',
        readings: {
          'Imaging System': 'Vidicon Vacuum Tube (Variable Focal 25-100mm)',
          'Optics Shroud': 'Quartz / Fluoride Mirror Gimbal',
          'Filter Wheel': 'Clear, Red, Green, Blue Dichroic (Locked)',
          'Resolution': '200 / 600 Scan Lines',
          'Historic Frames': '11,240 Transmitted to DSN Goldstone',
          'Radiation Status': '14.2% Beta Pitting (Structure Intact)'
        },
        historicalFacts: [
          'First Eyes on the Moon: Surveyor 1 carried a single steerable Vidicon television camera with a variable-focal-length lens and adjustable mirror.',
          '11,240 Historic Photographs: Over 44 Earth days, it returned panoramic views of lunar craters, rocks, and the distant Earth, confirming surface firmness for Apollo.',
          'Color Synthesis: By cycling through red, green, and blue optical filters, NASA produced the first true-color images taken on another planetary body.'
        ],
        officerNote: 'Running my scanner beam along the quartz mirror shroud... 160 years ago, this camera was humanity’s only set of eyes on this world. We are walking where only radio waves once reached.'
      },
      {
        id: 'surveyor_solar',
        title: 'Target 2 — Solar panel and antenna',
        shortName: 'Solar panel and antenna',
        position: new THREE.Vector3(0, surveyorTerrainY + 5.2, 0.2),
        radius: 4.2,
        sector: 'Zone 2 · Surveyor 1 Power & Communications',
        artifactAge: '160 Earth Years (1966)',
        integrity: '84.8% (Cosmic Darkened)',
        telemetryStatus: 'Energy & Communication Hardware',
        image: '/images/moon_close_up_telescope.jpg',
        description: 'The player inspects the energy and communication hardware. The interface displays component information. 792 single-crystal silicon solar cells producing 89 Watts under full sunlight, mounted alongside a planar high-gain directional antenna that beamed 2295 MHz S-band telemetry to Deep Space Stations on Earth.',
        readings: {
          'Photovoltaic Array': '792 Single-Crystal N-on-P Silicon Cells',
          'Peak Power Output': '89.2 Watts @ Direct Insolation',
          'Downlink Frequency': '2295 MHz S-Band Transponder',
          'Directional Gain': 'Planar High-Gain Directional Reflector',
          'Omni Whips': 'Dual Outrigger Dipole Low-Gain Antennas',
          'Circuits': 'Dormant (0.00 V Solar Wind Residual)'
        },
        historicalFacts: [
          'Autonomous Sun & Earth Tracking: Both the planar array and high-gain antenna were motorized on independent gimbals.',
          'Surviving the Lunar Night: Withstood drastic temperatures from +120°C in sunlight to -130°C in two-week lunar darkness.',
          'Lifeline to Earth: Maintained unbroken microwave telemetry with Goldstone, Canberra, and Madrid tracking stations.'
        ],
        officerNote: 'The solar panel is still turned toward the low sun, faithful to the last telemetry command sent from Goldstone Deep Space Station over a century and a half ago.'
      },
      {
        id: 'surveyor_footpad',
        title: 'Target 3 — Landing leg and footpad',
        shortName: 'Landing leg and footpad',
        position: new THREE.Vector3(Math.cos((2 * Math.PI) / 3) * 3.6, surveyorTerrainY + 0.5, Math.sin((2 * Math.PI) / 3) * 3.6),
        radius: 3.8,
        sector: 'Zone 2 · Surveyor 1 Soil Mechanics',
        artifactAge: '160 Earth Years (1966)',
        integrity: '100% Intact Structure',
        telemetryStatus: 'Landing Hardware & Soil Trench',
        image: '/images/moon_close_up_telescope.jpg',
        description: 'The player scans the landing hardware and examines the ground around it. Crushable aluminum honeycomb footpad #2 absorbed touchdown impact at 3.05 m/s, penetrating 5.2 cm into the dark lunar regolith. The undisturbed displacement trench provided the critical proof that the lunar maria could support human Apollo lunar modules.',
        readings: {
          'Shock Attenuator': 'Crushable Honeycomb Aluminum Alloy',
          'Touchdown Velocity': '3.05 m/s (10.0 ft/s) Soft Landing',
          'Soil Penetration': '5.2 cm Displacement Trench in Regolith',
          'Regolith Density': '1.52 g/cm³ Bulk Specific Gravity',
          'Bearing Strength': '0.55 bar @ 5 cm Depth',
          'Trench Morphology': 'Pristine Powdery Rim (Zero Weathering)'
        },
        historicalFacts: [
          'Historic First Soft Landing: Proved that a spacecraft could navigate and land gently on another celestial body.',
          'Quicksand Myth Dispelled: Before Surveyor 1, some astronomers feared lunar dust might be meters deep. The footpad proved solid bearing capacity.',
          'Untouched Rim: In the vacuum of the Moon, the soil particles displaced by this footpad on June 2, 1966, remain completely unaltered.'
        ],
        officerNote: 'The soil trench is as crisp today as when it touched down on June 2, 1966. No wind, no rain, no erosion—just timeless lunar silence.'
      },
      {
        id: 'surveyor_core',
        title: 'Surveyor 1 Lander Spaceframe & Subsurface Anomaly',
        position: new THREE.Vector3(0, surveyorTerrainY + 1.8, 0),
        radius: 3.2,
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
        title: 'Point A — Rock formation',
        shortName: 'Rock formation',
        finding: 'Weak signal',
        position: new THREE.Vector3(-68, getTerrainHeight(-68, -40) + 1.2, -40),
        radius: 4.8,
        sector: 'Zone 3 · Rock Field',
        artifactAge: 'Pre-Imbrian Lunar Basalt Outcrop',
        integrity: 'Intact Bedrock',
        telemetryStatus: 'Weak signal · 28.4% Strength',
        image: '/images/moon_close_up_telescope.jpg',
        description: 'The player inspects the outer rock formation. Handheld scanner registers a weak signal (28%). The basalt outcrop reflects diffuse seismic reverberations, indicating the true transmission epicenter lies deeper towards the crater.',
        readings: {
          'Signal Status': 'Weak signal',
          'Measured Strength': '28.4% Baseline',
          'Carrier Vector': 'Trending West toward Crater Rim',
          'Geological Context': 'Pre-Imbrian Titanium Basalt Outcrop'
        },
        historicalFacts: [
          'Impact Breccia & Outcrops: The lunar ejecta blanket consists of shock-shattered boulders thrown outward by meteoritic collisions.',
          'Signal Attenuation: Basaltic bedrock scatters electromagnetic frequencies, causing a diffuse, low-amplitude reading.'
        ],
        officerNote: 'Signal is weak here at the rock formation (~28%). My scanner is picking up only faint reverberations. The source must be further down toward the crater edge.'
      },
      {
        id: 'poi_crater_site_beta',
        title: 'Point B — Crater edge',
        shortName: 'Crater edge',
        finding: 'Medium signal',
        position: new THREE.Vector3(-74, getTerrainHeight(-74, -48) + 1.2, -48),
        radius: 4.8,
        sector: 'Zone 3 · Crater Edge',
        artifactAge: 'Impact-Melted Breccia',
        integrity: 'Fractured Scree Strata',
        telemetryStatus: 'Medium signal · 65.2% Strength',
        image: '/images/moon_close_up_telescope.jpg',
        description: 'The player inspects the crater edge. Handheld scanner registers a medium signal (65%). Standing harmonic waves reflect off the scree slope, confirming the signal is radiating from beneath the crater bowl floor directly ahead.',
        readings: {
          'Signal Status': 'Medium signal',
          'Measured Strength': '65.2% Harmonic',
          'Slope Alignment': '31° Scree Slope of Impact Melt',
          'Carrier Vector': 'Trending Inward & Downward to Crater Floor'
        },
        historicalFacts: [
          'Crater Slope Mechanics: The inner scree slope rests at the 31° angle of repose of dry lunar aggregate.',
          'Harmonic Amplification: The bowl geometry of the impact crater acts as an acoustic reflector, concentrating underground pulses.'
        ],
        officerNote: 'Signal strength jumped to 65%! The harmonic resonance is much sharper here at the edge. The epicenter isn’t on the rim—it’s coming right from the bottom of that crater floor!'
      },
      {
        id: 'poi_crater_site_gamma',
        title: 'Point C — Crater floor',
        shortName: 'Crater floor',
        finding: 'Strong signal',
        position: new THREE.Vector3(-78, getTerrainHeight(-78, -54) + 1.2, -54),
        radius: 5.5,
        sector: 'Zone 3 · Crater Floor',
        artifactAge: 'Non-Human / Precursor Epoch',
        integrity: '100% Non-Degraded Alloy',
        telemetryStatus: 'Strong signal · 99.4% Strength',
        image: '/images/moon_close_up_telescope.jpg',
        description: 'The player inspects the crater floor. Handheld scanner hits 99.4% peak harmonic resonance. A buried geometric fragment emerges through the lunar regolith, pulsing with alien energy lines.',
        readings: {
          'Signal Status': 'Strong signal',
          'Measured Strength': '99.4% Epicenter Peak',
          'Object Classification': 'Buried Geometric Fragment (Precursor)',
          'Subsurface Vector': 'Directly Downward into Bedrock Fissure'
        },
        historicalFacts: [
          'Exotic Metallurgy: The buried fragment shows non-terrestrial crystalline facet geometry and superalloy composition.',
          'Subterranean Connection: Ground-penetrating radar reveals a massive geometric conduit descending 80 meters beneath the crater floor.'
        ],
        officerNote: 'Look at those glowing edges... This is what was transmitting into Surveyor 1! A buried alien fragment right here under the lunar dust. Arin: “Mark the location. I\'m going in.”'
      },

      // ================= ZONE 4: EXPOSED ALIEN STRUCTURE DISCOVERY =================
      {
        id: 'poi_exposed_structure',
        title: 'Exposed Alien Structure',
        shortName: 'Alien Structure',
        position: new THREE.Vector3(-78, getTerrainHeight(-78, -54) + 2.0, -54),
        radius: 6.2,
        sector: 'Zone 4 · Crater Floor',
        artifactAge: 'Unknown Non-Human Epoch',
        integrity: '100% Intact / Active Field',
        telemetryStatus: 'Faint Cyan Luminescence Active',
        image: '/images/moon_close_up_telescope.jpg',
        description: 'The upper part of an unfamiliar geometric structure exposed by the shifting lunar regolith on the crater floor. It emits a faint cyan light, with energy circuits pulsing along its crystalline obsidian facets.',
        readings: {
          'Material Lattice': 'Anomalous Carbon-Titanium Superlattice',
          'Surface Seams': 'Zero (Monolithic Construction)',
          'Emission Color': 'Faint Cyan (488 nm)',
          'Conduit Link': 'Tethered directly to Surveyor 1'
        },
        historicalFacts: [
          'Precursor Archaeology: The structure appears to predate human lunar exploration, having lain dormant beneath the regolith.',
          'Active Telemetry Extraction: Multi-spectral sensors detect data packet exchange synchronized with Surveyor 1’s receiver.'
        ],
        officerNote: 'Maya: “Captain, that alloy is completely unknown. Non-terrestrial crystalline structure, but its internal circuits are active.”'
      },
      {
        id: 'poi_alien_structure',
        title: 'Precursor Geometric Monolith',
        shortName: 'Precursor Monolith',
        position: new THREE.Vector3(-120, alienTerrainY + 2.5, -75),
        radius: 7.0,
        sector: 'Zone 4 · Basalt Ridge',
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
        id: 'poi_crater_conduit',
        title: 'Narrow Data Conduit',
        shortName: 'Data Conduit',
        position: new THREE.Vector3(-66, getTerrainHeight(-66, -42) + 0.6, -42),
        radius: 4.8,
        sector: 'Zone 4 · Crater Rim Network',
        artifactAge: 'Synchronized with Lander Touchdown',
        integrity: 'Active Carrier Wave',
        telemetryStatus: 'Narrow Conduit Stream',
        image: '/images/moon_close_up_telescope.jpg',
        description: 'A narrow, glassy data conduit extending from the exposed structure on the crater floor across the lunar regolith toward Surveyor 1. Rhythmic cyan light pulses travel along its length.',
        readings: {
          'Transmission Frequency': '432.06 Hz Continuous',
          'Packet Flux': '1.42 Tbps Harmonic Stream',
          'Conduit Path': 'Crater Floor (-78, -54) -> Surveyor 1 (0, 0)',
          'Conduit State': 'Active Handshake'
        },
        historicalFacts: [
          'Subterranean Tethers: The narrow conduit functions as an optoelectronic waveguide, bridging lunar bedrock directly to spacecraft landing gear.',
          'Continuous Siphoning: Data flows unidirectionally from Surveyor 1’s memory into the alien structure interface.'
        ],
        officerNote: 'The conduit has been tapping Surveyor 1 for decades, monitoring humanity’s earliest robotic footprint. It’s a physical data tether.'
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
        id: 'poi_central_interface',
        title: 'Central Alien Interface',
        shortName: 'Central Interface',
        position: new THREE.Vector3(-77.2, getTerrainHeight(-78, -54) + 1.6, -53.2),
        radius: 3.8,
        sector: 'Zone 4 · Crater Floor Console',
        artifactAge: 'Interactive Precursor Console',
        integrity: '100% Responsive to Scanner',
        telemetryStatus: 'Point Scanner & Hold [E] to Activate',
        image: '/images/moon_close_up_telescope.jpg',
        description: 'A glowing cyan console on the exposed structure responding to the scanner. Pointing the scanner and holding [E] initiates the optoelectronic handshake, projecting a volumetric hologram of Surveyor 1.',
        readings: {
          'Interface Protocol': 'Optoelectronic Resonance Handshake',
          'Handshake Carrier': '432.06 Hz Sine Carrier',
          'Interaction Required': 'Point Scanner & Hold [E]',
          'Target Output': 'Surveyor 1 Volumetric Telemetry Hologram'
        },
        historicalFacts: [
          'Bio-Resonant Interface: The interface console detects electromagnetic radiation from the handheld scanner, aligning its internal logic gates.',
          'Volumetric Projection: The upper emitter arrays can synthesize high-density optical projections of remote assets.'
        ],
        officerNote: 'The interface is reacting to the scanner carrier! Point the scanner and hold [E] to initiate the handshake.'
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
          'Phase 3': 'Historic Archive Decryption (11,240 Frames)',
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
        id: 'poi_conduit_coupling',
        title: 'Alien Conduit Connection Coupling',
        shortName: 'Conduit Coupling',
        position: new THREE.Vector3(0.8, surveyorTerrainY + 0.5, 0.4),
        radius: 4.2,
        sector: 'Zone 6 · Surveyor 1 Footpad 2',
        artifactAge: 'Alien Data Conduit Terminus',
        integrity: 'Active Conduit Link',
        telemetryStatus: 'Point Scanner [Q] to Stabilise Interface',
        image: '/images/moon_close_up_telescope.jpg',
        description: 'The narrow alien conduit locks directly onto Surveyor 1\'s footpad and telemetry bus. Use your scanner [Q] to identify and stabilise the connection point.',
        readings: {
          'Coupling Status': 'Locked on Vidicon Signal Bus',
          'Carrier Frequency': '432.06 Hz Continuous',
          'Action Required': 'Scan [Q] to Stabilise Connection'
        },
        historicalFacts: [
          'Conduit Attachment: The conduit tether siphons signal frames directly before transmitter amplification.',
          'Isolation Safety: Stabilising the interface prevents power surges from wiping the magnetic drum storage.'
        ],
        officerNote: 'The conduit coupling is right here at footpad 2. Scanner lock required to stabilise before isolation.'
      },
      {
        id: 'poi_recovery_rig',
        title: 'Artemis/Aegis Robotic Recovery Rig',
        shortName: 'Recovery Rig',
        position: new THREE.Vector3(1.8, surveyorTerrainY + 1.8, 0.5),
        radius: 5.2,
        sector: 'Zone 6 · Surveyor 1 Recovery Site',
        artifactAge: 'Current Expedition (2126)',
        integrity: '100% Operational',
        telemetryStatus: 'Interact [E] to Isolate Transmission',
        image: '/images/moon_close_up_telescope.jpg',
        description: 'Hydraulic carbon-fiber gantry arms deployed to brace Surveyor 1. Interact with the console to isolate the anomalous feed while preserving the 11,240-frame historical archive.',
        readings: {
          'Stabilizer Load': '294 kg Neutral Support',
          'Alien Conduit State': 'Ready for Feed Isolation',
          'Historic Archive': '11,240 Frames Preserved',
          'Heritage Tag': 'NASA Permanent Historic Monument'
        },
        historicalFacts: [
          'Preservation Protocol: Disconnecting the alien feed cleanly leaves Surveyor 1 structurally protected for transport.',
          'Heritage Safeguard: Preserves 100% of historical optical telemetry.'
        ],
        officerNote: 'Interact with the interface [E] to isolate the anomalous feed while preserving the archive.'
      },
      {
        id: 'poi_quantum_storage_unit',
        title: 'Quantum Archive Vault (Q-SSD)',
        shortName: 'Quantum Vault',
        position: new THREE.Vector3(-1.2, surveyorTerrainY + 1.6, -1.0),
        radius: 4.2,
        sector: 'Zone 6 · Surveyor 1 Recovery Site',
        artifactAge: 'Current Expedition (2126)',
        integrity: '100% Data Transfer Ready',
        telemetryStatus: 'Activate Unit [E] to Secure Archive',
        image: '/images/moon_close_up_telescope.jpg',
        description: 'Radiation-hardened portable data-storage unit clamped to the lander\'s mast. Activate it to lock the 11,240 historic frames and extract the recovered mystery coordinates.',
        readings: {
          'Archive Download': '11,240 Frames (100% Verified)',
          'Unknown Signal': 'Fragment Recovered (Encrypted Vector)',
          'Orbital Downlink': 'Beamed to Carrier Aegis',
          'Status': 'Press [E] to Secure'
        },
        historicalFacts: [
          'Cryo-Optical Storage: Solid-state quantum drive retains petabytes of mission logs under extreme thermal cycling.',
          'Coordinate Isolation: The alien signal fragment is secured separately from historical NASA archives.'
        ],
        officerNote: 'Activate the portable data-storage unit [E] to permanently secure the archive and signal fragment.'
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

      // Skip Opening Cinematic with Space or E
      if (isOpeningCinematicRef.current) {
        if (code === 'Space' || code === 'KeyE') {
          skipCinematic();
        }
        return;
      }

      // Skip Ending Cinematic with Space, Escape, or E
      if (isEndingCinematicRef.current) {
        if (code === 'Space' || code === 'Escape' || code === 'KeyE') {
          skipEndingCinematic();
        }
        return;
      }

      // Evidence Database Toggle [Tab] or [J] (System E)
      if (code === 'Tab' || code === 'KeyJ') {
        e.preventDefault();
        setIsDatabaseOpen(prev => {
          const next = !prev;
          isDatabaseOpenRef.current = next;
          audio.playClick();
          return next;
        });
        return;
      }

      // Pause Menu Toggle [Escape]
      if (code === 'Escape') {
        if (isDatabaseOpenRef.current) {
          setIsDatabaseOpen(false);
          isDatabaseOpenRef.current = false;
          return;
        }
        togglePause();
        return;
      }

      if (isPausedRef.current) return;

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

      // Scanner Trigger [Q] (Primary) and [F] (Alternate) (System B)
      if (code === 'KeyQ' || code === 'KeyF') {
        if (nearInteractableRef.current) {
          const target = nearInteractableRef.current;
          const key = target.id === 'surveyor_camera' ? 'camera' : target.id === 'surveyor_solar' ? 'solar' : target.id === 'surveyor_footpad' ? 'footpad' : target.id;
          startInteractiveScan(target, key);
        } else {
          // Toggle Visor HUD overlay
          setIsScannerVisorActive(prev => {
            const next = !prev;
            isScannerVisorActiveRef.current = next;
            if (next) {
              audio.playSurveyorScannerBeep();
              setHudNotice('SCANNER VISOR ACTIVE: Object Scanning · Signal Tracking · Evidence Recording');
            } else {
              audio.playClick();
            }
            return next;
          });
        }
        triggerScannerPulse();
      }

      // Interaction Trigger [E]
      if (code === 'KeyE') {
        if (journeyStageIndex === 5) {
          if (nearInteractableRef.current?.id === 'poi_conduit_coupling' && !stage6StepsRef.current.stabilized) {
            completeStage6Step('stabilized');
            return;
          }
          if (nearInteractableRef.current?.id === 'poi_recovery_rig' && stage6StepsRef.current.stabilized && !stage6StepsRef.current.isolated) {
            setShowIsolateModal(true);
            return;
          }
          if (nearInteractableRef.current?.id === 'poi_quantum_storage_unit' && stage6StepsRef.current.isolated && !stage6StepsRef.current.secured) {
            completeStage6Step('secured');
            return;
          }
        }
        if (journeyStageIndexRef.current === 6) {
          if (nearInteractableRef.current?.id === 'poi_mission_terminal' || nearInteractableRef.current?.id === 'poi_lunar_transport' || nearInteractableRef.current?.id === 'poi_extraction_pallet') {
            startEndingCinematic();
            return;
          }
        }
        if (nearInteractableRef.current && (nearInteractableRef.current.id === 'poi_central_interface' || nearInteractableRef.current.id === 'poi_scanning_panel')) {
          if (journeyStageIndexRef.current < 3) {
            setHudNotice('INTERFACE INACTIVE: Precursor console is dormant. Local energy grid unpowered. Inspect Surveyor 1 and trace seismic signal to activate.');
            audio.playScanNoSignal();
            setActiveComms({
              callsign: 'CHEN-SCIENCE',
              speaker: 'Specialist Maya Chen',
              text: 'Captain, that structure appears completely inert right now. We need to inspect Surveyor 1 and trace the signal first to understand what powers it.'
            });
            audio.playRadioCommsChatter('chen');
            return;
          }
          if (!stage4ObjectivesRef.current.activatedInterface) {
            startInterfaceActivation();
            return;
          }
        }
        triggerInvestigation();
      }
    };

    const onKeyUp = (e) => {
      const code = e.code;
      if (code === 'KeyE') {
        cancelInterfaceActivation();
      }
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
        setHudNotice('Look around with mouse • [WASD] Move • [Space] Jump • [E] Interact • [Q] Scanner • [Esc] Pause');
      } else {
        setHudNotice('Click screen to activate Astronaut EVA controls • [Esc] Pause');
      }
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);

    // Situation 6: Automatically pause and release pointer lock when player loses window focus
    const onWindowBlur = () => {
      if (!isPausedRef.current && !isOpeningCinematicRef.current && !isEndingCinematicRef.current) {
        setIsPaused(true);
        isPausedRef.current = true;
        if (document.pointerLockElement) {
          try {
            document.exitPointerLock();
          } catch {}
        }
      }
    };

    window.addEventListener('blur', onWindowBlur);

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
    let cinematicTimer = 0;

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

      // Animate Route Marker Alpha Beacon Strobe & Holographic rings
      if (markerStrobe && groundHoloRing && airHoloRing) {
        markerStrobe.intensity = 2.4 + Math.sin(time * 6.0) * 1.6;
        groundHoloRing.rotation.z += delta * 0.45;
        airHoloRing.rotation.z -= delta * 0.55;
        airHoloRing.position.y = 2.2 + Math.sin(time * 2.2) * 0.12;
      }

      // Opening Cinematic Sequence (Arin egress from transport vehicle onto lunar regolith)
      if (isOpeningCinematicRef.current) {
        cinematicTimer += delta;
        if (cinematicTimer < 2.0) {
          // Phase 1: Inside vehicle cabin facing airlock hatch
          camera.position.set(109.8, landingTerrainY + 2.4, 65.0);
          camera.lookAt(106.0, landingTerrainY + 2.35, 65.0);
          setCinematicSub('AEGIS-01 HAS LANDED. DEPRESSURIZING AIRLOCK HATCH...');
        } else if (cinematicTimer < 4.4) {
          // Phase 2: Hatch opening, stepping out into vacuum
          const p = (cinematicTimer - 2.0) / 2.4;
          const camX = 109.8 + (107.0 - 109.8) * p;
          const camY = (landingTerrainY + 2.4) + (2.1 - 2.4) * p;
          const camZ = 65.0 + (65.6 - 65.0) * p;
          camera.position.set(camX, camY, camZ);
          camera.lookAt(95.0, landingTerrainY + 1.8, 65.2);
          setCinematicSub('HATCH OPENED. CAPTAIN ARIN RAO STEPS ONTO THE LUNAR SURFACE...');
        } else if (cinematicTimer < 6.2) {
          // Phase 3: Descending ladder steps onto regolith
          const p = (cinematicTimer - 4.4) / 1.8;
          const camX = 107.0 + (104.0 - 107.0) * p;
          const camY = (landingTerrainY + 2.1) + ((initialGroundY + EYE_HEIGHT) - (landingTerrainY + 2.1)) * p;
          const camZ = 65.6 + (66.0 - 65.6) * p;
          camera.position.set(camX, camY, camZ);
          yaw = 1.01;
          pitch = 0;
          const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
          camera.quaternion.setFromEuler(euler);
          setCinematicSub('EVA INITIALIZED: FIRST BOOTS ON THE LUNAR REGOLITH. ALL SYSTEMS NOMINAL.');
        } else {
          // Phase 4: Cinematic complete! Hand over control to player
          isOpeningCinematicRef.current = false;
          setIsOpeningCinematic(false);
          completeStage1Objective('exit_vehicle');
          playerPos.set(104, initialGroundY + EYE_HEIGHT, 66);
          camera.position.copy(playerPos);
          yaw = 1.01;
          pitch = 0;
          const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
          camera.quaternion.setFromEuler(euler);

          setActiveComms({
            callsign: 'CHEN-SCIENCE',
            speaker: 'Specialist Maya Chen',
            text: 'Welcome to the Moon, Captain. Try not to wander too far. We have a spacecraft to recover.'
          });
          audio.playRadioCommsChatter('chen');
        }

        renderer.render(scene, camera);
        return;
      }

      // Stage 7 Ending Cinematic Sequence
      if (isEndingCinematicRef.current) {
        endingCinematicTimerRef.current += delta;
        const eTime = endingCinematicTimerRef.current;

        if (eTime < 5.0) {
          // Phase 1: Close framing on Mission Terminal & projected map
          camera.position.set(102.2, landingTerrainY + 1.65, 66.8);
          camera.lookAt(103.2, landingTerrainY + 2.1, 65.5);
        } else if (eTime < 10.0) {
          // Phase 2: Gentle slow dolly around terminal as Arin explains
          const p = (eTime - 5.0) / 5.0;
          const cx = 102.2 + (101.8 - 102.2) * p;
          const cy = (landingTerrainY + 1.65) + 0.1 * Math.sin(p * Math.PI);
          const cz = 66.8 + (66.0 - 66.8) * p;
          camera.position.set(cx, cy, cz);
          camera.lookAt(103.2, landingTerrainY + 2.05, 65.5);
        } else if (eTime < 15.0) {
          // Phase 3: Hologram illuminates bright amber/cyan unknown location
          const p = (eTime - 10.0) / 5.0;
          camera.position.set(102.0 + 0.3 * Math.sin(p * 2.0), landingTerrainY + 1.7, 65.8);
          camera.lookAt(103.2, landingTerrainY + 2.1, 65.5);
        } else if (eTime < 21.0) {
          // Phase 4: Arin looks back at Surveyor 1 across Oceanus Procellarum
          const p = (eTime - 15.0) / 6.0;
          const camX = 102.0 + (103.5 - 102.0) * p;
          const camY = (landingTerrainY + 1.7) + 0.25 * p;
          const camZ = 65.8 + (64.5 - 65.8) * p;
          camera.position.set(camX, camY, camZ);
          camera.lookAt(0, surveyorTerrainY + 1.5, 0);
        } else if (eTime < 26.0) {
          // Phase 5: Elena welcomes Arin to Project Legacy
          camera.position.set(103.5, landingTerrainY + 2.0, 64.5);
          camera.lookAt(0, surveyorTerrainY + 1.5, 0);
        } else {
          // Phase 6: Camera moves up toward the Moon's horizon, revealing the next signal location!
          const p = Math.min(1.0, (eTime - 26.0) / 6.0);
          const camX = 103.5 + (88.0 - 103.5) * p;
          const camY = (landingTerrainY + 2.0) + (14.0 - 2.0) * p;
          const camZ = 64.5 + (48.0 - 64.5) * p;
          camera.position.set(camX, camY, camZ);
          camera.lookAt(-360, 48, -260);
        }

        renderer.render(scene, camera);
        return;
      }

      // If Paused, skip movement physics and keep rendering
      if (isPausedRef.current) {
        renderer.render(scene, camera);
        return;
      }

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

        let speed = keys.shift ? 5.0 : 3.5; // System A: Astronaut EVA sprint (5.0 m/s) vs deliberate walking pace (3.5 m/s)

        // Situation 1: Soft boundary velocity dampening (Non-lethal, gentle suit resistance when moving outward near perimeter)
        if (!underground) {
          const currentDist = Math.hypot(playerPos.x, playerPos.z);
          if (currentDist > 180) {
            const outwardDot = (moveX * (playerPos.x / currentDist) + moveZ * (playerPos.z / currentDist));
            if (outwardDot > 0) {
              const dampFactor = Math.max(0.2, (205 - currentDist) / 25);
              speed *= dampFactor;
            }
          }
        }

        playerPos.x += moveX * speed * delta;
        playerPos.z += moveZ * speed * delta;

        // Footstep audio when grounded with deliberate astronaut EVA pacing
        if (isGrounded && time - lastStepTime > (keys.shift ? 0.38 : 0.52)) {
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
        // Natural boundary clamp (r <= 205m so player cannot walk over outer crater rims into unmodeled void)
        const distFromCenter = Math.hypot(playerPos.x, playerPos.z);
        if (distFromCenter > 205) {
          playerPos.x = (playerPos.x / distFromCenter) * 205;
          playerPos.z = (playerPos.z / distFromCenter) * 205;
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
      // Situation 7: Inactive / dormant visuals when approaching precursor structure before Stage 4
      if (journeyStageIndexRef.current < 3) {
        if (alienGlowLight) alienGlowLight.intensity = 0.05;
        if (energyBeam) energyBeam.visible = false;
        if (conduitMat) {
          conduitMat.emissiveIntensity = 0.02;
          conduitMat.color.setHex(0x0a0c10);
        }
      } else if (stage6StepsRef.current.isolated) {
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
        if (energyBeam) energyBeam.visible = true;
        const conduitBoost = hasSignalTrackerRef.current ? 0.45 : 0;
        if (conduitMat) conduitMat.emissiveIntensity = 0.45 + conduitBoost + Math.sin(time * 3.5) * 0.25;
      }

      // Animate Stage 2 Target Holographic Brackets on Surveyor 1
      if (targetMarkerCamera) {
        targetMarkerCamera.rotation.y += delta * 0.9;
        targetMarkerCamera.rotation.x += delta * 0.5;
        const isScanned = stage2ScansRef.current.camera;
        targetMarkerCamera.material.color.setHex(isScanned ? 0x10b981 : 0x06b6d4);
        targetMarkerCamera.material.opacity = isScanned ? 0.35 : (0.55 + Math.sin(time * 3.0) * 0.25);
      }
      if (targetMarkerSolar) {
        targetMarkerSolar.rotation.y += delta * 0.9;
        targetMarkerSolar.rotation.z += delta * 0.4;
        const isScanned = stage2ScansRef.current.solar;
        targetMarkerSolar.material.color.setHex(isScanned ? 0x10b981 : 0x06b6d4);
        targetMarkerSolar.material.opacity = isScanned ? 0.35 : (0.55 + Math.sin(time * 3.0) * 0.25);
      }
      if (targetMarkerFootpad) {
        targetMarkerFootpad.rotation.z += delta * 0.7;
        const isScanned = stage2ScansRef.current.footpad;
        targetMarkerFootpad.material.color.setHex(isScanned ? 0x10b981 : 0x06b6d4);
        targetMarkerFootpad.material.opacity = isScanned ? 0.35 : (0.55 + Math.sin(time * 3.0) * 0.25);
      }

      // Animate Stage 4 Ground Shift, Exposed Structure & Surveyor 1 Hologram
      if (typeof exposedStructureGroup !== 'undefined' && exposedStructureGroup) {
        const shiftProg = groundShiftProgressRef.current;
        exposedStructureGroup.position.y = -2.2 + shiftProg * 2.2;

        if (typeof slabMeshes !== 'undefined' && Array.isArray(slabMeshes)) {
          slabMeshes.forEach(({ mesh, basePos, angle }) => {
            const shiftDist = shiftProg * 1.8;
            mesh.position.x = basePos.x + Math.cos(angle) * shiftDist;
            mesh.position.z = basePos.z + Math.sin(angle) * shiftDist;
            mesh.rotation.x = shiftProg * 0.25;
          });
        }

        if (typeof cyanStructureLight !== 'undefined' && cyanStructureLight) {
          cyanStructureLight.intensity = (0.6 + shiftProg * 2.6) + Math.sin(time * 2.0) * 0.4;
        }

        if (typeof shardGroup !== 'undefined' && shardGroup) {
          shardGroup.rotation.y += delta * 0.5;
        }

        if (typeof surveyorHoloGroup !== 'undefined' && surveyorHoloGroup) {
          surveyorHoloGroup.visible = isHologramActiveRef.current;
          if (isHologramActiveRef.current) {
            surveyorHoloGroup.rotation.y += delta * 0.45;
            if (typeof holoScanRing !== 'undefined' && holoScanRing) {
              holoScanRing.position.y = 0.5 + Math.sin(time * 3.0) * 0.35;
            }
          }
        }
      }

      // Animate Stage 7 Terminal Hologram Projection & Distant Horizon Signal Beacon
      if (typeof terminalHoloProjection !== 'undefined' && terminalHoloProjection) {
        const isStage7 = journeyStageIndex === 6;
        terminalHoloProjection.visible = isStage7;
        if (isStage7) {
          terminalHoloProjection.rotation.y += delta * 0.75;
          if (typeof stage7GlyphMesh !== 'undefined' && stage7GlyphMesh) {
            stage7GlyphMesh.rotation.y += delta * 1.5;
            stage7GlyphMesh.position.y = 0.55 + Math.sin(time * 3.0) * 0.05;
          }
          if (typeof stage7HoloLight !== 'undefined' && stage7HoloLight) {
            stage7HoloLight.intensity = 2.4 + Math.sin(time * 3.5) * 0.8;
          }
        }
      }

      if (typeof horizonBeaconGroup !== 'undefined' && horizonBeaconGroup) {
        const isStage7 = journeyStageIndex === 6;
        horizonBeaconGroup.visible = isStage7;
        if (isStage7) {
          if (typeof beaconBeam !== 'undefined' && beaconBeam) {
            beaconBeam.rotation.y += delta * 0.35;
          }
          if (typeof horizonBeaconLight !== 'undefined' && horizonBeaconLight) {
            horizonBeaconLight.intensity = 14 + Math.sin(time * 4.0) * 6;
          }
        }
      }

      // Cancel interface activation if player moved out of range
      if (isActivatingInterfaceRef.current) {
        const dInterface = Math.hypot(playerPos.x - (-77.2), playerPos.z - (-53.2));
        if (dInterface > 5.5) {
          cancelInterfaceActivation();
          setHudNotice('HANDSHAKE CANCELED: Moved out of range');
        }
      }

      // Cancel active interactive scan if player moved away from target
      if (isScanningActiveRef.current && scanningTargetRef.current && scanningTargetRef.current.position) {
        const dTarget = Math.hypot(playerPos.x - scanningTargetRef.current.position.x, playerPos.z - scanningTargetRef.current.position.z);
        if (dTarget > (scanningTargetRef.current.radius || 4.0) + 1.8) {
          cancelInteractiveScan();
          setHudNotice('SCAN CANCELED: Reticle lost target lock');
        }
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

        // Situation 1: Soft boundary warning check (Non-lethal exploration safety envelope)
        if (!underground) {
          const distFromCenter = Math.hypot(playerPos.x, playerPos.z);
          if (distFromCenter > 150) {
            const excess = Math.round(distFromCenter - 150);
            const returnAngleRad = Math.atan2(-playerPos.x, -playerPos.z);
            const returnBearing = Math.round((THREE.MathUtils.radToDeg(returnAngleRad) % 360 + 360) % 360);
            const relAngle = Math.round(((returnBearing - headingDeg) % 360 + 360) % 360);

            let returnDir = 'AHEAD';
            if (relAngle > 30 && relAngle < 150) returnDir = 'RIGHT';
            else if (relAngle >= 150 && relAngle <= 210) returnDir = 'BEHIND';
            else if (relAngle > 210 && relAngle < 330) returnDir = 'LEFT';

            const isCrit = distFromCenter > 180;
            const warningObj = {
              active: true,
              distance: Math.round(distFromCenter),
              excess,
              bearing: returnBearing,
              returnDir,
              level: isCrit ? 'critical' : 'advisory'
            };
            boundaryWarningRef.current = warningObj;
            setBoundaryWarning(warningObj);

            // Audio telemetry warning tone (throttled)
            if (time - lastBoundaryAudioTimeRef.current > (isCrit ? 4.5 : 7.0)) {
              audio.playBoundaryWarning();
              lastBoundaryAudioTimeRef.current = time;
            }

            // Maya Comms callout (throttled every 24 seconds)
            if (time - lastBoundaryCommsTimeRef.current > 24.0) {
              lastBoundaryCommsTimeRef.current = time;
              setActiveComms({
                callsign: 'CHEN-SCIENCE',
                speaker: 'Specialist Maya Chen',
                text: isCrit
                  ? 'Captain Arin, telemetry link is degrading rapidly! You are departing the primary Surveyor 1 investigation sector. Turn back toward the mission coordinates.'
                  : 'Captain, suit telemetry reports you are approaching the designated exploration perimeter. Surveyor 1 is behind you.'
              });
              audio.playRadioCommsChatter('chen');
            }
          } else {
            if (boundaryWarningRef.current) {
              boundaryWarningRef.current = null;
              setBoundaryWarning(null);
            }
          }
        }

        // 7-Stage Suggested Player Journey Nav-Target calculation
        const curStage = journeyStageIndexRef.current;
        let targetX = 0;
        let targetZ = 0;
        if (curStage === 0) {
          if (stage1ObjectivesRef.current.read_briefing) {
            targetX = 82.0;
            targetZ = 52.0;
          } else {
            targetX = 103.2;
            targetZ = 65.5;
          }
        } else if (curStage === 1) {
          if (hasSignalTrackerRef.current) {
            targetX = -75;
            targetZ = -50;
          } else if (distSurveyor < 16) {
            // Point directly to next unscanned component
            if (!stage2ScansRef.current.camera) {
              targetX = 0.65;
              targetZ = -0.65;
            } else if (!stage2ScansRef.current.solar) {
              targetX = 0;
              targetZ = 0.2;
            } else if (!stage2ScansRef.current.footpad) {
              targetX = Math.cos((2 * Math.PI) / 3) * 3.6;
              targetZ = Math.sin((2 * Math.PI) / 3) * 3.6;
            } else {
              targetX = 0;
              targetZ = 0;
            }
          } else {
            targetX = 0;
            targetZ = 0;
          }
        } else if (curStage === 2) {
          if (isPointCDiscoveredRef.current) {
            targetX = -78;
            targetZ = -54; // Precursor fragment on crater floor
          } else if (!stage3InspectionsRef.current.pointA) {
            targetX = -68;
            targetZ = -40; // Point A (Rock formation)
          } else if (!stage3InspectionsRef.current.pointB) {
            targetX = -74;
            targetZ = -48; // Point B (Crater edge)
          } else {
            targetX = -78;
            targetZ = -54; // Point C (Crater floor)
          }
        } else if (curStage === 3) {
          if (!stage4ObjectivesRef.current.scannedStructure) {
            targetX = -78;
            targetZ = -54; // Exposed Alien Structure
          } else if (!stage4ObjectivesRef.current.inspectedConduit) {
            targetX = -66;
            targetZ = -42; // Narrow Data Conduit
          } else {
            targetX = -77.2;
            targetZ = -53.2; // Central Alien Interface Console
          }
        } else if (curStage === 5) {
          if (!stage6StepsRef.current.stabilized) {
            targetX = 0.8;
            targetZ = 0.4; // Footpad 2 Conduit Coupling
          } else if (!stage6StepsRef.current.isolated) {
            targetX = 1.8;
            targetZ = 0.5; // Interface / Recovery Rig
          } else if (!stage6StepsRef.current.secured) {
            targetX = -1.2;
            targetZ = -1.0; // Portable Storage Vault (Q-SSD)
          } else {
            targetX = 3.8;
            targetZ = -2.6; // Extraction Pallet
          }
        } else if (curStage === 6) {
          targetX = 103.2;
          targetZ = 65.5; // Tactical Mission Terminal (Landing Site)
        } else {
          const currentStageObj = JOURNEY_STAGES[curStage] || JOURNEY_STAGES[0];
          targetX = currentStageObj?.targetCoords?.x || 0;
          targetZ = currentStageObj?.targetCoords?.z || 0;
        }

        const dx = targetX - playerPos.x;
        const dz = targetZ - playerPos.z;
        const distToNav = Math.round(Math.hypot(dx, dz));
        setNavTargetDistance(distToNav);

        let rad = Math.atan2(dx, -dz);
        let deg = Math.round((THREE.MathUtils.radToDeg(rad) % 360 + 360) % 360);
        setNavTargetBearing(deg);

        // Real-Time Signal Scanner calculation based on Point C (-78, -54)
        const dPointC = Math.hypot(playerPos.x - (-78), playerPos.z - (-54));
        const dxC = -78 - playerPos.x;
        const dzC = -54 - playerPos.z;
        const radC = Math.atan2(dxC, -dzC);
        const degC = Math.round((THREE.MathUtils.radToDeg(radC) % 360 + 360) % 360);

        let cardDir = 'North-west';
        if (degC >= 338 || degC < 23) cardDir = 'North';
        else if (degC >= 23 && degC < 68) cardDir = 'North-east';
        else if (degC >= 68 && degC < 113) cardDir = 'East';
        else if (degC >= 113 && degC < 158) cardDir = 'South-east';
        else if (degC >= 158 && degC < 203) cardDir = 'South';
        else if (degC >= 203 && degC < 248) cardDir = 'South-west';
        else if (degC >= 248 && degC < 293) cardDir = 'West';
        else cardDir = 'North-west';

        const relDeg = Math.round(((degC - headingDeg) % 360 + 360) % 360);
        let relDir = 'Ahead';
        if (relDeg < 25 || relDeg > 335) relDir = 'Ahead';
        else if (relDeg >= 25 && relDeg < 70) relDir = 'Ahead-Right';
        else if (relDeg >= 70 && relDeg < 110) relDir = 'Right';
        else if (relDeg >= 110 && relDeg < 160) relDir = 'Behind-Right';
        else if (relDeg >= 160 && relDeg < 200) relDir = 'Behind';
        else if (relDeg >= 200 && relDeg < 250) relDir = 'Behind-Left';
        else if (relDeg >= 250 && relDeg < 290) relDir = 'Left';
        else relDir = 'Ahead-Left';

        // Designed gameplay signal strength readings:
        // Point A (Rock formation, ~30-45m from C): Weak signal (~28%)
        // Point B (Crater edge, ~15-25m from C): Medium signal (~65%)
        // Point C (Crater floor, <7m from C): Strong signal (~99%)
        let strength = 20;
        if (dPointC < 6.5) {
          strength = 99;
        } else if (dPointC < 16.0) {
          strength = Math.round(78 + (16.0 - dPointC) * 2.1);
        } else if (dPointC < 38.0) {
          strength = Math.round(50 + (38.0 - dPointC) * 1.25);
        } else if (dPointC < 95.0) {
          strength = Math.round(20 + (95.0 - dPointC) * 0.52);
        } else {
          strength = Math.max(12, Math.round(20 - (dPointC - 95.0) * 0.1));
        }

        // Situation 3: Signal Assistance timer & dynamic directional guidance
        if (curStage === 2) {
          if (stage3StartTimeRef.current === 0) {
            stage3StartTimeRef.current = time;
          }
          const searchDuration = time - stage3StartTimeRef.current;
          const stage3Done = stage3InspectionsRef.current.pointA && stage3InspectionsRef.current.pointB && stage3InspectionsRef.current.pointC;

          if (!stage3Done && searchDuration > 20.0) {
            if (!isSignalAssistedRef.current) {
              isSignalAssistedRef.current = true;
              setIsSignalAssisted(true);
            }
            if (searchDuration > 25.0 && time - lastAssistedHintTimeRef.current > 40.0) {
              lastAssistedHintTimeRef.current = time;
              setActiveComms({
                callsign: 'CHEN-SCIENCE',
                speaker: 'Specialist Maya Chen',
                text: "Captain, I've reconfigured your scanner array. Directional vectoring and distance triangulation are now active on your HUD to help trace the transmission source."
              });
              audio.playRadioCommsChatter('chen');
            }
          }
        }

        let tier = 'Weak signal';
        if (strength >= 78) tier = 'Strong signal';
        else if (strength >= 45) tier = 'Medium signal';
        else tier = 'Weak signal';

        const turnArrow = relDir === 'Ahead' ? '▲' : relDir.includes('Right') ? '►' : relDir.includes('Left') ? '◄' : '▼';
        const turnInstruction = relDir === 'Ahead' ? 'DIRECT ALIGNMENT' : relDir.includes('Right') ? `TURN RIGHT · BRG ${degC}°` : relDir.includes('Left') ? `TURN LEFT · BRG ${degC}°` : `REVERSE · BRG ${degC}°`;

        const updatedTracker = {
          active: true,
          strength,
          tier,
          direction: cardDir,
          relativeDir: relDir,
          bearingDeg: degC,
          distanceM: Math.round(dPointC),
          turnArrow,
          turnInstruction
        };
        scannerReadingRef.current = updatedTracker;
        setScannerReading(updatedTracker);

        // Stage 3 — Point C Automatic Discovery Check upon reaching Crater Floor
        if (curStage === 2 && dPointC < 6.5 && !isPointCDiscoveredRef.current) {
          triggerPointCDiscovery();
          stage3InspectionsRef.current.pointC = true;
          setStage3Inspections({ ...stage3InspectionsRef.current });
        }

        // Stage 1 Tutorial Objective Check & Natural Stage Transitions
        if (curStage === 0) {
          const distToTerm = Math.hypot(playerPos.x - 103.2, playerPos.z - 65.5);
          if (distToTerm < 4.8) {
            completeStage1Objective('walk_terminal');
          }

          const distToMarker = Math.hypot(playerPos.x - 82.0, playerPos.z - 52.0);
          if (distToMarker < 5.8) {
            completeStage1Objective('approach_route_marker');
            advanceJourneyStage(1);
          } else if (distLanding > 28 || distSurveyor < 65) {
            advanceJourneyStage(1);
          }
        } else if (journeyStageIndex === 1 && hasSignalTrackerRef.current && (distCrater < 48 && distLanding > 60)) {
          advanceJourneyStage(2);
        } else if (journeyStageIndex === 2 && isPointCDiscoveredRef.current && distBuried < 14.0) {
          advanceJourneyStage(3);
        } else if (journeyStageIndex === 3 && (distEcho < 20 || isMissionEchoOpen)) {
          advanceJourneyStage(4);
        }

        // Stage 4 Proximity & Ground Shift check
        if (journeyStageIndex === 3) {
          if (distBuried < 16.0 && !isGroundShiftTriggeredRef.current) {
            triggerGroundShift();
          }
          if (Math.hypot(playerPos.x - (-77.2), playerPos.z - (-53.2)) < 4.2) {
            completeStage4Objective('locatedInterface');
          }
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
        let minDist = Infinity;
        for (const item of interactables) {
          if (underground && item.id !== 'precursor_monolith_site') continue;
          if (!underground && item.id === 'precursor_monolith_site') continue;

          // In Stage 2 before all 3 targets are scanned, surveyor_core should not override the 3 required targets
          if (journeyStageIndex === 1 && item.id === 'surveyor_core' && !Object.values(stage2ScansRef.current).every(Boolean)) {
            continue;
          }

          const d = Math.hypot(playerPos.x - item.position.x, playerPos.z - item.position.z);
          if (d < item.radius && d < minDist) {
            foundInteract = item;
            minDist = d;
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
      window.removeEventListener('blur', onWindowBlur);
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
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
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
              <div className="absolute -top-7 text-[11px] text-cyan-300 font-bold tracking-wider uppercase bg-black/85 px-3 py-1 rounded-lg border border-cyan-400 shadow-lg shadow-cyan-500/20 whitespace-nowrap font-mono flex items-center gap-1.5 animate-pulse">
                <Crosshair className="w-3 h-3 text-cyan-400" />
                <span>{getInteractionPrompt(nearInteractable, journeyStageIndex)}</span>
              </div>
            )}
          </div>
        </div>

        {/* SITUATION 1: SOFT BOUNDARY WARNING OVERLAY (EXPLORATION SAFETY ENVELOPE) */}
        {boundaryWarning && boundaryWarning.active && (
          <div className="absolute top-16 inset-x-0 flex justify-center pointer-events-none z-30 px-4">
            <div className={`max-w-lg w-full p-3.5 rounded-2xl backdrop-blur-md border shadow-2xl transition-all duration-300 pointer-events-auto ${
              boundaryWarning.level === 'critical'
                ? 'bg-rose-950/90 border-rose-500 text-rose-100 shadow-[0_0_35px_rgba(244,63,94,0.45)] animate-pulse'
                : 'bg-amber-950/90 border-amber-500/80 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
            }`}>
              <div className="flex items-center justify-between border-b border-current/20 pb-1.5 mb-2">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className={`w-4 h-4 ${boundaryWarning.level === 'critical' ? 'text-rose-400 animate-ping' : 'text-amber-400 animate-pulse'}`} />
                  <span>{boundaryWarning.level === 'critical' ? 'CRITICAL TELEMETRY BOUNDARY EXCEEDED' : 'MISSION PERIMETER ADVISORY'}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 font-bold border border-current/30">
                  +{boundaryWarning.excess}m EXCEEDING ENVELOPE
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="text-[11px] opacity-85">
                    Departing Surveyor 1 operational grid. Reorient return vector:
                  </div>
                  <div className="font-bold font-mono tracking-wide flex items-center gap-2 mt-1">
                    <span className="text-amber-300">BEARING {boundaryWarning.bearing}°</span>
                    <span className="opacity-50">·</span>
                    <span className="text-white bg-white/10 px-2 py-0.5 rounded text-[10px] border border-white/20">
                      {boundaryWarning.returnDir === 'AHEAD' ? '▲ MAINTAIN COURSE' : boundaryWarning.returnDir === 'RIGHT' ? '► TURN RIGHT' : boundaryWarning.returnDir === 'LEFT' ? '◄ TURN LEFT' : '▼ REVERSE HEADING'}
                    </span>
                  </div>
                </div>
                <div className="text-right pl-3">
                  <div className="text-[10px] opacity-75 font-mono">Distance to Hub</div>
                  <div className="text-base font-bold font-mono text-white">{boundaryWarning.distance}m</div>
                </div>
              </div>
            </div>
          </div>
        )}

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

            {/* MISSION OBJECTIVE HUD CARD (SYSTEM D) */}
            <div className="p-3.5 rounded-xl bg-black/85 backdrop-blur-md border border-cyan-500/40 shadow-xl text-xs space-y-2.5 font-mono">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <div>
                  <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>PROJECT LEGACY · MISSION 01</span>
                  </div>
                  <div className="text-xs font-bold text-white tracking-wider mt-0.5">
                    The First Footprint
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { audio.playClick(); setIsDatabaseOpen(true); isDatabaseOpenRef.current = true; }}
                    className="px-2 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-[10px] text-cyan-300 flex items-center gap-1 transition-all"
                    title="Open Evidence Database [Tab / J]"
                  >
                    <Database className="w-3 h-3 text-cyan-400" />
                    <span>DB ({evidenceEntries.filter(e => e.isUnlocked).length}/{evidenceEntries.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { audio.playClick(); setShowJourneyRoadmap(prev => !prev); }}
                    className="p-1 px-2 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] flex items-center gap-1 uppercase transition-colors"
                    title="Toggle Full 7-Stage Roadmap"
                  >
                    <ListOrdered className="w-3 h-3" />
                    <span>Roadmap</span>
                  </button>
                </div>
              </div>

              {/* CURRENT OBJECTIVE */}
              <div className="space-y-1">
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  CURRENT OBJECTIVE
                </div>
                <div className="text-white font-sans text-xs sm:text-sm font-semibold leading-snug">
                  {JOURNEY_STAGES[journeyStageIndex]?.objective}
                </div>
              </div>

              {/* SHORT HINT */}
              <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] font-sans text-slate-300 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{JOURNEY_STAGES[journeyStageIndex]?.hint || JOURNEY_STAGES[journeyStageIndex]?.instructions}</span>
              </div>

              {/* INVESTIGATION PROGRESS */}
              <div className="space-y-1 pt-1 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 uppercase font-bold">Investigation progress</span>
                  <span className="text-cyan-300 font-bold font-mono">
                    {journeyStageIndex === 0 && `${Object.values(stage1Objectives).filter(Boolean).length} / 5 objectives`}
                    {journeyStageIndex === 1 && `${Object.values(stage2Scans).filter(Boolean).length} / 3 components scanned`}
                    {journeyStageIndex === 2 && `${Object.values(stage3Inspections).filter(Boolean).length} / 3 points investigated`}
                    {journeyStageIndex === 3 && `${Object.values(stage4Objectives).filter(Boolean).length} / 4 structure milestones`}
                    {journeyStageIndex === 4 && (isMissionEchoCompletedRef.current ? '3 / 3 puzzles reconstructed' : '0 / 3 puzzles completed')}
                    {journeyStageIndex === 5 && `${Object.values(stage6Steps).filter(Boolean).length} / 3 recovery steps`}
                    {journeyStageIndex === 6 && 'Debrief ready (100%)'}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{
                      width: `${
                        journeyStageIndex === 0 ? (Object.values(stage1Objectives).filter(Boolean).length / 5) * 100 :
                        journeyStageIndex === 1 ? (Object.values(stage2Scans).filter(Boolean).length / 3) * 100 :
                        journeyStageIndex === 2 ? (Object.values(stage3Inspections).filter(Boolean).length / 3) * 100 :
                        journeyStageIndex === 3 ? (Object.values(stage4Objectives).filter(Boolean).length / 4) * 100 :
                        journeyStageIndex === 4 ? (isMissionEchoCompletedRef.current ? 100 : 33) :
                        journeyStageIndex === 5 ? (Object.values(stage6Steps).filter(Boolean).length / 3) * 100 : 100
                      }%`
                    }}
                  />
                </div>
              </div>

              {/* SUIT COMMUNICATION STATUS */}
              <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Suit communication connected</span>
                </div>
                <span className="text-slate-400 font-mono">Stage {journeyStageIndex + 1}/7</span>
              </div>
            </div>

            {/* STAGE 1 — ARRIVAL ON THE MOON TUTORIAL OBJECTIVES */}
            {journeyStageIndex === 0 && (
              <div className="p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-amber-500/40 shadow-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tutorial Objectives (Stage 1)</span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {Object.values(stage1Objectives).filter(Boolean).length}/5 Complete
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {[
                    { id: 'exit_vehicle', text: 'Exit the transport vehicle' },
                    { id: 'walk_terminal', text: 'Walk to the mission terminal' },
                    { id: 'activate_terminal', text: 'Activate the terminal [E]' },
                    { id: 'read_briefing', text: 'Read the Surveyor 1 mission briefing' },
                    { id: 'approach_route_marker', text: 'Approach the route marker leading to the spacecraft' }
                  ].map((obj, i) => {
                    const isDone = stage1Objectives[obj.id];
                    return (
                      <div 
                        key={obj.id} 
                        className={`flex items-center gap-2 p-1.5 rounded-lg text-[11px] transition-colors ${
                          isDone 
                            ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30 font-medium' 
                            : 'bg-white/[0.03] text-slate-300 border border-white/5'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-amber-400/60 flex items-center justify-center text-[9px] text-amber-300 flex-shrink-0 font-mono">
                            {i + 1}
                          </span>
                        )}
                        <span className={isDone ? 'line-through opacity-85' : 'text-slate-100'}>
                          {obj.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Mechanics Introduced reference bar */}
                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-300 font-mono">
                  <div><strong className="text-amber-400">[WASD]</strong> Move</div>
                  <div><strong className="text-amber-400">[Mouse]</strong> Look</div>
                  <div><strong className="text-amber-400">[E]</strong> Interact</div>
                  <div><strong className="text-amber-400">[Q]</strong> Scan</div>
                  <div><strong className="text-amber-400">[Esc]</strong> Pause</div>
                </div>
              </div>
            )}

            {/* STAGE 2 — INSPECT SURVEYOR 1 OBJECTIVES */}
            {journeyStageIndex === 1 && (
              <div className="p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 shadow-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Surveyor 1 Inspection (Stage 2)</span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {Object.values(stage2Scans).filter(Boolean).length}/3 Scanned
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {[
                    {
                      id: 'camera',
                      targetId: 'surveyor_camera',
                      title: 'Target 1 — Television camera',
                      subtitle: 'Historic Vidicon imaging equipment'
                    },
                    {
                      id: 'solar',
                      targetId: 'surveyor_solar',
                      title: 'Target 2 — Solar panel and antenna',
                      subtitle: 'Energy & communication hardware'
                    },
                    {
                      id: 'footpad',
                      targetId: 'surveyor_footpad',
                      title: 'Target 3 — Landing leg and footpad',
                      subtitle: 'Landing hardware & soil trench'
                    }
                  ].map((tgt, i) => {
                    const isDone = stage2Scans[tgt.id];
                    const isNear = nearInteractable?.id === tgt.targetId;
                    return (
                      <div
                        key={tgt.id}
                        className={`p-2 rounded-lg text-[11px] transition-all border ${
                          isDone
                            ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                            : isNear
                            ? 'bg-cyan-950/60 text-cyan-200 border-cyan-400 animate-pulse'
                            : 'bg-white/[0.03] text-slate-300 border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] flex-shrink-0 font-mono ${
                                isNear ? 'border-cyan-400 text-cyan-300 bg-cyan-900/50' : 'border-slate-500 text-slate-400'
                              }`}>
                                {i + 1}
                              </span>
                            )}
                            <span className={`font-semibold ${isDone ? 'line-through opacity-85 text-emerald-200' : 'text-white'}`}>
                              {tgt.title}
                            </span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            isDone ? 'bg-emerald-900/40 text-emerald-300' : isNear ? 'bg-cyan-900/60 text-cyan-200' : 'text-slate-500'
                          }`}>
                            {isDone ? 'CALIBRATED' : isNear ? 'IN RANGE [E/Q]' : 'REQUIRED'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 pl-5">
                          {tgt.subtitle}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stage 2 Status Bar / Instruction */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">
                    {Object.values(stage2Scans).every(Boolean)
                      ? (hasSignalTracker ? 'Signal-Tracking Mode Active' : 'All 3 targets scanned')
                      : 'Approach target & hold [Q] or [E] to calibrate'}
                  </span>
                  {Object.values(stage2Scans).every(Boolean) && (
                    <span className="text-cyan-400 font-bold flex items-center gap-1 animate-pulse">
                      <Radio className="w-3 h-3 text-cyan-400" />
                      <span>ANOMALY DETECTED</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 3 — TRACK THE SIGNAL OBJECTIVES */}
            {journeyStageIndex === 2 && (
              <div className="p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-purple-500/40 shadow-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    <span>Track the Signal (Stage 3)</span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {Object.values(stage3Inspections).filter(Boolean).length}/3 Inspected
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {[
                    {
                      id: 'pointA',
                      targetId: 'poi_crater_site_alpha',
                      title: 'Point A — Rock formation',
                      finding: 'Weak signal (~28%)',
                      desc: 'Outer basalt boulder field'
                    },
                    {
                      id: 'pointB',
                      targetId: 'poi_crater_site_beta',
                      title: 'Point B — Crater edge',
                      finding: 'Medium signal (~65%)',
                      desc: 'Inner scree slope reflection'
                    },
                    {
                      id: 'pointC',
                      targetId: 'poi_crater_site_gamma',
                      title: 'Point C — Crater floor',
                      finding: 'Strong signal (~99%)',
                      desc: 'Buried geometric fragment epicenter'
                    }
                  ].map((pt, i) => {
                    const isDone = stage3Inspections[pt.id];
                    const isNear = nearInteractable?.id === pt.targetId;
                    return (
                      <div
                        key={pt.id}
                        className={`p-2 rounded-lg text-[11px] transition-all border ${
                          isDone
                            ? 'bg-purple-950/30 text-purple-300 border-purple-500/30'
                            : isNear
                            ? 'bg-cyan-950/60 text-cyan-200 border-cyan-400 animate-pulse'
                            : 'bg-white/[0.03] text-slate-300 border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                            ) : (
                              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] flex-shrink-0 font-mono ${
                                isNear ? 'border-cyan-400 text-cyan-300 bg-cyan-900/50' : 'border-slate-500 text-slate-400'
                              }`}>
                                {['A', 'B', 'C'][i]}
                              </span>
                            )}
                            <span className={`font-semibold ${isDone ? 'line-through opacity-85 text-purple-200' : 'text-white'}`}>
                              {pt.title}
                            </span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            isDone ? 'bg-purple-900/50 text-purple-300' : isNear ? 'bg-cyan-900/60 text-cyan-200' : 'text-slate-500'
                          }`}>
                            {isDone ? pt.finding : isNear ? 'IN RANGE [E]' : 'REQUIRED'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 pl-5">
                          {pt.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stage 3 Status / Discovery confirmation */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">
                    {isPointCDiscovered
                      ? 'Precursor fragment visible at crater floor'
                      : 'Follow scanner direction & strength [Q]'}
                  </span>
                  {isPointCDiscovered && (
                    <span className="text-purple-400 font-bold flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>EPICENTER CONFIRMED</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 4 — DISCOVER THE ALIEN STRUCTURE OBJECTIVES */}
            {journeyStageIndex === 3 && (
              <div className="p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 shadow-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>Discover Alien Structure (Stage 4)</span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {Object.values(stage4Objectives).filter(Boolean).length}/4 Complete
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {[
                    {
                      id: 'scannedStructure',
                      targetId: 'poi_exposed_structure',
                      title: '1. Scan exposed structure',
                      desc: 'Scan emerging obsidian carapace with [Q]',
                      actionHint: 'SCAN [Q]'
                    },
                    {
                      id: 'inspectedConduit',
                      targetId: 'poi_crater_conduit',
                      title: '2. Inspect narrow conduit',
                      desc: 'Examine data conduit tethered to Surveyor 1',
                      actionHint: 'INSPECT [E]'
                    },
                    {
                      id: 'locatedInterface',
                      targetId: 'poi_central_interface',
                      title: '3. Locate central interface',
                      desc: 'Approach the glowing console on structure',
                      actionHint: 'APPROACH'
                    },
                    {
                      id: 'activatedInterface',
                      targetId: 'poi_central_interface',
                      title: '4. Activate the interface',
                      desc: 'Point scanner and hold [E] on console',
                      actionHint: 'HOLD [E]'
                    }
                  ].map((obj, i) => {
                    const isDone = stage4Objectives[obj.id];
                    const isNear = nearInteractable?.id === obj.targetId;
                    return (
                      <div
                        key={obj.id}
                        className={`p-2 rounded-lg text-[11px] transition-all border ${
                          isDone
                            ? 'bg-cyan-950/30 text-cyan-300 border-cyan-500/30'
                            : isNear
                            ? 'bg-cyan-900/60 text-white border-cyan-400 animate-pulse'
                            : 'bg-white/[0.03] text-slate-300 border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            ) : (
                              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] flex-shrink-0 font-mono ${
                                isNear ? 'border-cyan-400 text-cyan-300 bg-cyan-900/60' : 'border-slate-500 text-slate-400'
                              }`}>
                                {i + 1}
                              </span>
                            )}
                            <span className={`font-semibold ${isDone ? 'line-through opacity-85 text-cyan-200' : 'text-white'}`}>
                              {obj.title}
                            </span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            isDone ? 'bg-cyan-900/50 text-cyan-300' : isNear ? 'bg-cyan-900/80 text-cyan-200 border border-cyan-400/50' : 'text-slate-500'
                          }`}>
                            {isDone ? 'COMPLETED' : isNear ? 'IN RANGE' : obj.actionHint}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 pl-5">
                          {obj.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stage 4 Status Footer */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">
                    {isHologramActive
                      ? 'Surveyor 1 Holographic Projection Active'
                      : groundShiftProgress > 0.8
                      ? 'Structure exposed on crater floor'
                      : 'Approach buried fragment to reveal structure'}
                  </span>
                  {isHologramActive && (
                    <span className="text-cyan-400 font-bold flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>HOLO STREAM ACTIVE</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 5 — MISSION ECHO OBJECTIVES */}
            {journeyStageIndex === 4 && (
              <div className="p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 shadow-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>Mission Echo (Stage 5)</span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {isMissionEchoCompleted ? '3/3 Solved' : 'In Progress'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {[
                    { title: 'Puzzle A — The descent sequence', desc: '4-stage controlled lunar landing timeline' },
                    { title: 'Puzzle B — Reading the lunar surface', desc: 'Match 3 historic soil observations' },
                    { title: 'Puzzle C — The image archive', desc: 'Reconstruct 3x3 tiles (11,240 frames)' }
                  ].map((pz, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg text-[11px] border ${
                        isMissionEchoCompleted
                          ? 'bg-cyan-950/30 text-cyan-300 border-cyan-500/30'
                          : 'bg-white/[0.03] text-slate-300 border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isMissionEchoCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-cyan-500/50 flex items-center justify-center text-[9px] text-cyan-400 font-mono">
                              {idx + 1}
                            </span>
                          )}
                          <span className={`font-semibold ${isMissionEchoCompleted ? 'line-through text-cyan-200' : 'text-white'}`}>
                            {pz.title}
                          </span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold text-cyan-300 bg-cyan-900/50">
                          {isMissionEchoCompleted ? 'SOLVED' : 'ACTIVE'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 pl-5">
                        {pz.desc}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">
                    Interact with Central Interface [E]
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMissionEchoOpen(true)}
                    className="text-cyan-400 font-bold hover:underline"
                  >
                    OPEN ECHO CONSOLE
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 6 — RECOVER SURVEYOR 1 OBJECTIVES */}
            {journeyStageIndex === 5 && (
              <div className="p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 shadow-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>Recover Surveyor 1 (Stage 6)</span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {Object.values(stage6Steps).filter(Boolean).length}/3 Steps
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {[
                    {
                      key: 'stabilized',
                      targetId: 'poi_conduit_coupling',
                      title: 'Step 1 — Stabilise the interface',
                      desc: 'Use scanner [Q] to identify conduit connection point at Footpad 2',
                      actionHint: 'SCAN [Q]'
                    },
                    {
                      key: 'isolated',
                      targetId: 'poi_recovery_rig',
                      title: 'Step 2 — Isolate the transmission',
                      desc: 'Interact with Recovery Rig [E] to isolate anomalous feed while preserving archive',
                      actionHint: 'ISOLATE [E]'
                    },
                    {
                      key: 'secured',
                      targetId: 'poi_quantum_storage_unit',
                      title: 'Step 3 — Secure the archive',
                      desc: 'Activate portable data-storage unit [E] to seal 11,240 frames & signal fragment',
                      actionHint: 'SECURE [E]'
                    }
                  ].map((step, idx) => {
                    const isDone = stage6Steps[step.key];
                    const isNear = nearInteractable?.id === step.targetId;
                    const isCurrent = !isDone && (idx === 0 || stage6Steps[Object.keys(stage6Steps)[idx - 1]]);
                    return (
                      <div
                        key={step.key}
                        className={`p-2 rounded-lg text-[11px] transition-all border ${
                          isDone
                            ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                            : isNear
                            ? 'bg-cyan-900/60 text-white border-cyan-400 animate-pulse'
                            : isCurrent
                            ? 'bg-white/[0.06] text-white border-cyan-500/30'
                            : 'bg-white/[0.02] text-slate-400 border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] flex-shrink-0 font-mono ${
                                isNear ? 'border-cyan-400 text-cyan-300 bg-cyan-900/60' : 'border-slate-500 text-slate-400'
                              }`}>
                                {idx + 1}
                              </span>
                            )}
                            <span className={`font-semibold ${isDone ? 'line-through opacity-85 text-emerald-200' : 'text-white'}`}>
                              {step.title}
                            </span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            isDone ? 'bg-emerald-900/50 text-emerald-300' : isNear ? 'bg-cyan-900/80 text-cyan-200 border border-cyan-400/50' : 'text-slate-500'
                          }`}>
                            {isDone ? 'COMPLETED' : isNear ? 'IN RANGE' : step.actionHint}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 pl-5">
                          {step.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stage 6 Telemetry Footer */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">
                    {stage6Steps.secured
                      ? 'Archive secured · Recovery authorised'
                      : stage6Steps.isolated
                      ? 'Feed isolated · Activate portable storage'
                      : stage6Steps.stabilized
                      ? 'Interface stabilised · Ready for feed isolation'
                      : 'Scan conduit connection point near Footpad 2'}
                  </span>
                  <span className="text-cyan-400 font-bold">11,240 FRAMES</span>
                </div>
              </div>
            )}

            {/* STAGE 7 — THE NEXT SIGNAL OBJECTIVES */}
            {journeyStageIndex === 6 && (
              <div className="p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-amber-500/40 shadow-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>The Next Signal (Stage 7)</span>
                  </div>
                  <span className="text-slate-400 font-mono">Mission Ending</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="p-2 rounded-lg text-[11px] bg-amber-950/30 text-amber-200 border border-amber-500/30">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">1. Return to Mission Terminal</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-900/60 text-amber-300">
                        {distanceToLanding < 12 ? 'IN RANGE' : `${distanceToLanding}m AWAY`}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      The team prepares to leave the landing site. Signal fragment projected above terminal.
                    </div>
                  </div>

                  <div className="p-2 rounded-lg text-[11px] bg-white/[0.03] text-slate-300 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">2. Debrief with Commander Elena</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold text-slate-400">
                        PRESS [E]
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Review unknown location on map and decide to investigate the coordinates.
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Classified Coordinates Ready</span>
                  <button
                    type="button"
                    onClick={startEndingCinematic}
                    className="text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>START DEBRIEF [E]</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* SIGNAL TRACKER HUD CARD (STAGE 3 SPECIFICATION) */}
            {(hasSignalTracker || journeyStageIndex === 2) && (
              <div className="p-3.5 rounded-xl bg-slate-950/95 backdrop-blur-md border border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.3)] space-y-2.5 text-xs font-mono">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="font-bold text-white tracking-widest uppercase">SIGNAL TRACKER</span>
                  </div>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[9px] text-emerald-300 font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Active</span>
                  </span>
                </div>

                {/* Big Percentage & Signal Tier */}
                <div className="flex items-baseline justify-between pt-0.5">
                  <div className="text-3xl font-bold tracking-tight font-mono text-cyan-300">
                    {scannerReading.strength}%
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    scannerReading.tier === 'Strong signal'
                      ? 'bg-purple-900/60 border border-purple-400/60 text-purple-200 animate-pulse'
                      : scannerReading.tier === 'Medium signal'
                      ? 'bg-cyan-900/60 border border-cyan-400/60 text-cyan-200'
                      : 'bg-amber-900/40 border border-amber-500/40 text-amber-300'
                  }`}>
                    {scannerReading.tier}
                  </div>
                </div>

                {/* Illustrative signal strength gauge */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Illustrative signal strength</span>
                    <span className="text-[9px] text-slate-500">{scannerReading.distanceM}m away</span>
                  </div>
                  <div className="w-full bg-black/70 rounded-full h-2 overflow-hidden border border-cyan-400/30">
                    <div
                      className={`h-full transition-all duration-300 ${
                        scannerReading.tier === 'Strong signal'
                          ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500'
                          : scannerReading.tier === 'Medium signal'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                          : 'bg-gradient-to-r from-slate-600 to-amber-500'
                      }`}
                      style={{ width: `${scannerReading.strength}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>Weak signal</span>
                    <span>Strong signal</span>
                  </div>
                </div>

                {/* Direction with Informative Assisted Guidance */}
                <div className={`p-2 rounded-lg border text-[11px] ${
                  isSignalAssisted
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-black/50 border-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Direction:</span>
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-cyan-300">{scannerReading.direction}</span>
                      <span className="text-slate-400 text-[10px]">({scannerReading.relativeDir})</span>
                    </div>
                  </div>

                  {isSignalAssisted && (
                    <div className="mt-2 pt-1.5 border-t border-cyan-500/30 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-cyan-300 font-bold tracking-wider flex items-center gap-1.5">
                          <span className="text-amber-300 font-bold font-mono animate-pulse text-xs">
                            {scannerReading.turnArrow || (scannerReading.relativeDir === 'Ahead' ? '▲' : scannerReading.relativeDir.includes('Right') ? '►' : scannerReading.relativeDir.includes('Left') ? '◄' : '▼')}
                          </span>
                          <span>{scannerReading.turnInstruction || (scannerReading.relativeDir === 'Ahead' ? 'ON TARGET' : `ALIGN ${scannerReading.relativeDir.toUpperCase()}`)}</span>
                        </span>
                        <span className="text-amber-200 font-mono text-[9px] bg-black/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                          BRG {scannerReading.bearingDeg}° · {scannerReading.distanceM}m
                        </span>
                      </div>
                      <div className="text-[9px] text-cyan-200/80 font-mono flex items-center justify-between">
                        <span>Assisted Dipole Array</span>
                        <span className="text-emerald-400 font-bold tracking-wider">CALIBRATED</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer status / Pulse instruction */}
                <div className="text-[9px] text-slate-400 flex items-center justify-between pt-0.5">
                  <span>Target: 24m Crater Bowl</span>
                  <span className="text-amber-300 font-bold">Press [Q] for Pulse</span>
                </div>
              </div>
            )}

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
              <span>[Q] LIDAR Scanner</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setIsDatabaseOpen(true);
                isDatabaseOpenRef.current = true;
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-white backdrop-blur-md transition-all text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95"
              title="Open Evidence Database [Tab or J]"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>[Tab / J] Database</span>
            </button>

            <button
              type="button"
              onClick={togglePause}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-white/20 bg-black/80 hover:bg-black text-slate-300 hover:text-white backdrop-blur-md transition-all text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95"
              title="Pause Mission [Esc]"
            >
              <Pause className="w-4 h-4 text-amber-400" />
              <span>[Esc] Pause</span>
            </button>

            {nearInteractable && (
              <button
                type="button"
                onClick={triggerInvestigation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider border border-cyan-400 shadow-xl shadow-cyan-500/40 hover:scale-105 active:scale-95 animate-bounce font-mono"
              >
                <Crosshair className="w-4 h-4 text-cyan-200" />
                <span>{getInteractionPrompt(nearInteractable, journeyStageIndex)}</span>
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

      {/* SCREEN CHROMATIC DISTORTION GLITCH OVERLAY */}
      {isGlitching && (
        <div className="fixed inset-0 z-50 pointer-events-none mix-blend-color-dodge animate-pulse">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/25 via-purple-600/20 to-red-600/30" />
        </div>
      )}

      {/* INTERACTIVE SCANNER CALIBRATION RETICLE OVERLAY */}
      {isScanningActive && scanningTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="relative p-6 rounded-2xl bg-slate-950/95 backdrop-blur-xl border-2 border-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.45)] flex flex-col items-center max-w-sm w-full mx-4 pointer-events-auto animate-scale-up font-mono">
            
            {/* Reticle Dial */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-3">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/50 animate-spin" style={{ animationDuration: '6s' }} />
              
              <svg className="w-28 h-28 -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-slate-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-cyan-400 transition-all duration-100"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - scanProgress / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-white tracking-wider">{Math.round(scanProgress)}%</span>
                <span className="text-[9px] text-cyan-300 uppercase font-bold">CALIBRATING</span>
              </div>
            </div>

            {/* Target Title & Subtitle */}
            <div className="text-center space-y-1 w-full">
              <div className="text-[10px] text-cyan-400 tracking-widest uppercase font-bold flex items-center justify-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>MULTI-SPECTRAL OPTICAL SCAN</span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                {scanningTarget.title}
              </h3>
            </div>

            {/* Frequency Sweep Dial */}
            <div className="w-full mt-3 p-2 rounded-xl bg-black/60 border border-cyan-500/30 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Carrier Sweep:</span>
              <span className="text-cyan-300 font-bold font-mono">
                {scanFrequency.toFixed(1)} MHz {scanProgress > 80 ? '· S-BAND LOCK' : ''}
              </span>
            </div>

            {/* Scan Stage Telemetry Log */}
            <div className="mt-2 text-[10px] text-slate-300 text-center font-sans italic min-h-[30px] flex items-center justify-center">
              {scanProgress < 30 && "Focusing sensor optics and establishing optical baseline..."}
              {scanProgress >= 30 && scanProgress < 70 && "Auditing vacuum patina and micrometeorite pitting..."}
              {scanProgress >= 70 && scanProgress < 100 && "Synchronizing NASA Smithsonian archival records..."}
              {scanProgress >= 100 && "Calibration Complete · Archival Record Locked!"}
            </div>

            {/* Cancel Instruction */}
            <div className="mt-2 text-[9px] text-slate-500 uppercase">
              Hold [Q] / [E] · Step back to cancel
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4 — INTERFACE ACTIVATION HOLDING RETICLE */}
      {interfaceActivationProgress > 0 && !stage4Objectives.activatedInterface && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-40 select-none font-mono">
          <div className="p-6 rounded-2xl bg-black/90 backdrop-blur-xl border-2 border-cyan-400/80 shadow-[0_0_60px_rgba(6,182,212,0.6)] text-center space-y-3 max-w-sm w-full mx-4">
            <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold text-xs tracking-widest uppercase animate-pulse">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>CENTRAL INTERFACE HANDSHAKE</span>
            </div>
            
            {/* Calibration Ring Dial */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: '4s' }} />
              <svg className="w-24 h-24 -rotate-90">
                <circle cx="48" cy="48" r="40" className="stroke-slate-800" strokeWidth="5" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-cyan-400 transition-all duration-75"
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - interfaceActivationProgress / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-sm font-bold text-cyan-300 font-mono">
                {Math.round(interfaceActivationProgress)}%
              </div>
            </div>

            <div className="w-full bg-black/80 rounded-full h-2.5 border border-cyan-500/50 overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-75"
                style={{ width: `${interfaceActivationProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-300">
              HOLDING [E] · SYNCHRONIZING SCANNER CARRIER
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4 — SURVEYOR 1 HOLOGRAM NOTIFICATION PILL */}
      {isHologramActive && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 pointer-events-none z-30 select-none font-mono animate-fade-in">
          <div className="px-4 py-1.5 rounded-full bg-cyan-950/90 backdrop-blur-md border border-cyan-400/70 shadow-[0_0_30px_rgba(6,182,212,0.45)] flex items-center gap-2 text-xs text-cyan-300 font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>HOLOGRAPHIC PROJECTION: SURVEYOR 1 TELEMETRY FEED (ACTIVE)</span>
          </div>
        </div>
      )}

      {/* THE DISCOVERY: UNKNOWN TRANSMISSION MODAL / HUD ALERT CARD */}
      {discoveryEvent && discoveryEvent.showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono select-none">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-950/95 border-2 border-red-500/80 shadow-[0_0_60px_rgba(239,68,68,0.4)] overflow-hidden flex flex-col">
            
            {/* Warning Stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-amber-400 to-cyan-400 animate-pulse" />

            {/* Header */}
            <div className="p-5 pb-3 border-b border-red-500/30 bg-red-950/20 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-[10px] text-red-300 font-bold tracking-widest uppercase">
                      ANOMALOUS TRANSMISSION
                    </span>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase">Unidentified</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-wider uppercase mt-0.5">
                    UNKNOWN TRANSMISSION
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissDiscoveryEvent()}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Dismiss [Esc]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              
              {/* Illustrative Frequency Interface (0.00 MHz) with Oscilloscope Waveform */}
              <div className="p-3.5 rounded-xl bg-black/70 border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 uppercase tracking-wider">Detected Carrier Frequency:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-cyan-300 tracking-wider">
                      0.00 MHz
                    </span>
                    <span className="text-[10px] text-red-400 animate-pulse font-mono">[UNIDENTIFIED]</span>
                  </div>
                </div>

                {/* Animated SVG Oscilloscope Waveform */}
                <div className="relative w-full h-14 bg-slate-950 rounded-lg overflow-hidden border border-cyan-500/30 flex items-center justify-center">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 60">
                    <path
                      d="M 0,30 Q 25,5 50,30 T 100,30 T 150,30 T 200,5 T 250,55 T 300,30 T 350,15 T 400,30"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                      className="animate-pulse"
                    />
                    <path
                      d="M 0,30 Q 30,50 60,30 T 120,30 T 180,10 T 240,50 T 300,30 T 360,20 T 400,30"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      opacity="0.7"
                    />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent pointer-events-none animate-pulse" />
                  <div className="absolute top-1 right-2 text-[9px] text-cyan-400/80 font-mono">
                    SUB-SURFACE HARMONIC · 432.06 Hz CARRIER
                  </div>
                </div>
              </div>

              {/* Signal Analysis Breakdown */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Signal Analysis</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">Source:</span>
                    <span className="text-red-400 font-bold uppercase">Unknown</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">Pattern:</span>
                    <span className="text-amber-300 font-bold">Repeating</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">Origin:</span>
                    <span className="text-cyan-300 font-bold">Below surface</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">Connection:</span>
                    <span className="text-indigo-300 font-bold">Surveyor 1 vicinity</span>
                  </div>
                </div>
              </div>

              {/* Scripted Comms Exchange Preview */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 font-sans">
                <div className="flex items-start gap-2.5 text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold font-mono text-[9px]">
                    MAYA
                  </span>
                  <p className="text-slate-200 leading-relaxed italic">
                    “Captain, that's strange. The signal isn't coming from the lander's communication system. It's coming from somewhere below the surface.”
                  </p>
                </div>
                <div className="flex items-start gap-2.5 text-xs pt-1.5 border-t border-white/5">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-bold font-mono text-[9px]">
                    ARIN
                  </span>
                  <p className="text-slate-200 leading-relaxed italic">
                    “Then Surveyor isn't the source. It's connected to something else.”
                  </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-cyan-500/30 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[10px] text-cyan-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                <span>Gameplay Reward: Scanner Signal-Tracking Mode Unlocked</span>
              </div>

              <button
                type="button"
                onClick={() => dismissDiscoveryEvent()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Compass className="w-4 h-4 text-cyan-200" />
                <span>Locate Transmission Source</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* INVESTIGATION DOSSIER MODAL */}
      {investigateTarget && (
        <InvestigationModal
          target={investigateTarget}
          onClose={() => {
            if (investigateTarget?.id === 'poi_mission_terminal') {
              completeStage1Objective('read_briefing');
              setActiveObjective('Objective updated: Approach Route Marker Alpha leading West toward Surveyor 1');
            }
            if (Object.values(stage2ScansRef.current).every(Boolean) && !discoveryTriggeredRef.current) {
              triggerDiscoverySequence();
            }
            if (investigateTarget?.id === 'poi_crater_site_alpha') {
              inspectStage3Point('pointA');
            } else if (investigateTarget?.id === 'poi_crater_site_beta') {
              inspectStage3Point('pointB');
            } else if (investigateTarget?.id === 'poi_crater_site_gamma') {
              inspectStage3Point('pointC');
            } else if (investigateTarget?.id === 'poi_exposed_structure') {
              completeStage4Objective('scannedStructure');
            } else if (investigateTarget?.id === 'poi_crater_conduit') {
              completeStage4Objective('inspectedConduit');
            } else if (investigateTarget?.id === 'poi_central_interface') {
              completeStage4Objective('locatedInterface');
            }
            setInvestigateTarget(null);
          }}
          onLogData={(target) => {
            // Automatically log evidence into Evidence Database (System E)
            const targetEvidenceMap = {
              'surveyor_camera': 'hist_vidicon_camera',
              'surveyor_solar': 'hist_solar_array',
              'surveyor_footpad': 'hist_soil_mechanics',
              'surveyor_core': 'hist_surveyor_touchdown',
              'poi_mission_terminal': 'hist_atlas_centaur',
              'poi_crater_site_alpha': 'evid_basalt_outcrop',
              'poi_crater_site_beta': 'evid_crater_scree',
              'poi_crater_site_gamma': 'sig_precursor_structure',
              'poi_exposed_structure': 'sig_precursor_structure',
              'poi_alien_structure': 'sig_precursor_structure',
              'poi_crater_conduit': 'evid_data_conduit_line',
              'poi_data_conduit': 'evid_data_conduit_line',
              'poi_central_interface': 'sig_volumetric_interface',
              'poi_scanning_panel': 'sig_volumetric_interface',
              'poi_conduit_coupling': 'evid_recovery_gantry',
              'poi_recovery_rig': 'evid_recovery_gantry',
              'poi_quantum_storage_unit': 'evid_quantum_vault'
            };
            if (targetEvidenceMap[target.id]) {
              unlockEvidenceEntry(targetEvidenceMap[target.id]);
            }
            if (target.id === 'surveyor_core' || target.id === 'poi_crater_site_alpha' || target.id === 'poi_crater_site_beta') {
              unlockEvidenceEntry('sig_harmonic_432');
            }
            if (target.id === 'poi_crater_conduit' || target.id === 'poi_data_conduit') {
              unlockEvidenceEntry('sig_extraction_telemetry');
            }
            if (target.id === 'poi_quantum_storage_unit') {
              unlockEvidenceEntry('sig_vault_zero_coords');
            }

            if (target.id === 'poi_mission_terminal') {
              if (journeyStageIndex === 6) {
                startEndingCinematic();
                return;
              }
              completeStage1Objective('read_briefing');
              setActiveObjective('Objective updated: Approach Route Marker Alpha leading West toward Surveyor 1');
            } else if (target.id === 'poi_route_marker_alpha') {
              completeStage1Objective('approach_route_marker');
              advanceJourneyStage(1);
            } else if (target.id === 'poi_maya_chen' || target.id === 'poi_leo_vance' || target.id === 'poi_lunar_transport') {
              // Crew debrief acknowledged
            } else if (target.id && target.id.startsWith('surveyor_')) {
              const key = target.id === 'surveyor_camera' ? 'camera' : target.id === 'surveyor_solar' ? 'solar' : target.id === 'surveyor_footpad' ? 'footpad' : null;
              if (key) {
                const updated = { ...stage2ScansRef.current, [key]: true };
                stage2ScansRef.current = updated;
                setStage2Scans(updated);
                if (Object.values(updated).every(Boolean) && !discoveryTriggeredRef.current) {
                  triggerDiscoverySequence();
                }
              }
            } else if (target.id === 'poi_crater_site_alpha') {
              inspectStage3Point('pointA');
              setActiveObjective('Point A inspected: Weak signal. Use signal tracker [Q] to locate Point B on the crater edge.');
            } else if (target.id === 'poi_crater_site_beta') {
              inspectStage3Point('pointB');
              setActiveObjective('Point B inspected: Medium signal. Follow signal tracker down to crater floor (Point C).');
            } else if (target.id === 'poi_crater_site_gamma') {
              inspectStage3Point('pointC');
              setActiveObjective('Point C inspected: Strong signal. Buried geometric fragment uncovered.');
            } else if (target.id === 'poi_exposed_structure') {
              completeStage4Objective('scannedStructure');
              setActiveObjective('Structure scanned. Inspect the narrow conduit leading toward Surveyor 1.');
            } else if (target.id === 'poi_crater_conduit') {
              completeStage4Objective('inspectedConduit');
              setActiveObjective('Conduit inspected. Locate the central interface console on the structure.');
            } else if (target.id === 'poi_central_interface') {
              completeStage4Objective('locatedInterface');
              startInterfaceActivation();
            } else if (target.id === 'poi_alien_structure' || target.id === 'poi_data_conduit') {
              advanceJourneyStage(4);
            } else if (target.id === 'poi_conduit_coupling') {
              if (journeyStageIndex === 5 && !stage6StepsRef.current.stabilized) {
                completeStage6Step('stabilized');
              }
            } else if (target.id === 'poi_recovery_rig') {
              if (journeyStageIndex === 5 && stage6StepsRef.current.stabilized && !stage6StepsRef.current.isolated) {
                setShowIsolateModal(true);
              }
            } else if (target.id === 'poi_quantum_storage_unit') {
              if (journeyStageIndex === 5 && stage6StepsRef.current.isolated && !stage6StepsRef.current.secured) {
                completeStage6Step('secured');
              }
            } else if (target.id === 'poi_extraction_pallet') {
              if (journeyStageIndex === 6) {
                startEndingCinematic();
              } else {
                setShowMissionCompleteModal(true);
              }
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

      {/* STAGE 6 — TRANSMISSION ISOLATION CONSOLE MODAL */}
      {showIsolateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-mono select-none">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border-2 border-cyan-500/60 shadow-[0_0_60px_rgba(6,182,212,0.35)] p-6 space-y-5 text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-400">
                  <Shield className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                    STAGE 6 · RECOVERY RIG CONSOLE
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                    Transmission Feed Isolation Demux
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { audio.playClick(); setShowIsolateModal(false); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description & Objective */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 font-sans leading-relaxed">
              <strong className="text-cyan-300 font-mono">Mission Objective:</strong> Disconnect the unknown transmission without destroying the historic archive. 
              The alien conduit siphons raw Vidicon imaging packets directly from Surveyor 1's Footpad 2 coupling. 
              Selecting <strong>Isolate Feed</strong> will sever the carrier tether and route the decoded 11,240-frame archive to the quantum storage vault.
            </div>

            {/* Side-by-Side Channel Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Channel A: Historic Archive */}
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Historic Archive</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-[9px] uppercase">
                    100% Intact
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Frames:</span>
                    <span className="text-white font-bold">11,240 Images</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payload:</span>
                    <span className="text-emerald-300">Vidicon Telemetry</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-bold">Preserve & Lock</span>
                  </div>
                </div>
              </div>

              {/* Channel B: Anomalous Transmission */}
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Anomalous Feed</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-900/60 text-[9px] uppercase text-cyan-200">
                    Siphoning
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Frequency:</span>
                    <span className="text-cyan-300 font-bold">432.06 Hz Precursor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tether:</span>
                    <span className="text-white">Footpad 2 Conduit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Action:</span>
                    <span className="text-amber-400 font-bold">Sever & Decouple</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comms Callout */}
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs font-sans text-cyan-200">
              <span className="font-mono text-cyan-300 font-bold">Specialist Maya Chen:</span> "Interface is stabilised, Arin. Trigger the isolation switch on your console. We'll capture the mystery frequency packet without letting it wipe Surveyor 1's magnetic drum storage."
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { audio.playClick(); setShowIsolateModal(false); }}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Abort
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowIsolateModal(false);
                  completeStage6Step('isolated');
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4 text-cyan-300" />
                <span>Isolate Anomalous Feed & Preserve Archive</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 6 — RECOVERY REPORT CONFIRMATION MODAL */}
      {showRecoveryReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in font-mono select-none">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-950 border-2 border-emerald-500/70 shadow-[0_0_80px_rgba(16,185,129,0.35)] p-6 text-center space-y-5">
            {/* Success Icon */}
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>

            {/* Exact Required Report Title & Status */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-widest uppercase">
                RECOVERY REPORT
              </h2>
              <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-300 font-bold uppercase tracking-wider">
                Completed
              </div>
            </div>

            {/* Exact Required 4 Confirmation Items */}
            <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/30 text-left text-xs sm:text-sm font-mono space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 font-sans">Historic archive:</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Secured
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 font-sans">Anomalous transmission:</span>
                <span className="text-cyan-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Isolated
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 font-sans">Surveyor 1:</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Recovery authorised
                </span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-300 font-sans">Unknown signal:</span>
                <span className="text-purple-300 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Fragment recovered
                </span>
              </div>
            </div>

            {/* Scripted Comms Dialogue Callout */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-left text-xs space-y-2 font-sans">
              <div className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider border-b border-white/10 pb-1">
                Suit Radio Link · Mission Comms
              </div>
              <div className="text-slate-300 space-y-1.5">
                <p><strong className="text-cyan-300 font-mono">Maya:</strong> "The connection is isolated. We have the archive."</p>
                <p><strong className="text-amber-300 font-mono">Arin:</strong> "And the signal?"</p>
                <p><strong className="text-cyan-300 font-mono">Maya:</strong> "I recovered a fragment. It contains coordinates, but they don't match any location in our current mission database."</p>
                <p><strong className="text-amber-300 font-mono">Arin:</strong> "Send them to the command ship."</p>
              </div>
            </div>

            {/* Action Button to Advance to Stage 7 */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setShowRecoveryReport(false);
                  advanceJourneyStage(6);
                  setActiveObjective('Return to the Mission Terminal at the landing site to debrief with Commander Elena.');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Proceed to Final Extraction Coordinates (Stage 7)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 7 — ENDING CINEMATIC LETTERBOX & LIVE DEBRIEF OVERLAY */}
      {isEndingCinematic && (
        <div className="absolute inset-0 pointer-events-auto z-50 flex flex-col justify-between">
          {/* Top Letterbox Bar */}
          <div className="h-20 bg-black/95 flex items-center justify-between px-8 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <div className="text-xs font-mono tracking-widest text-cyan-300 uppercase">
                PROJECT LEGACY // MISSION 01 · COMMAND DEBRIEF LINK
              </div>
            </div>
            <div className="text-[11px] font-mono tracking-wider text-amber-300 uppercase font-bold">
              STAGE 7 — THE NEXT SIGNAL
            </div>
          </div>

          {/* Center Cinematic Reticle / Stage Direction */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none">
            {endingDialoguePhase === 4 && (
              <div className="p-3 rounded-xl bg-black/75 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-sans italic tracking-wide animate-fade-in">
                (Arin looks back at Surveyor 1 across Oceanus Procellarum.)
              </div>
            )}
            {endingDialoguePhase >= 6 && (
              <div className="p-4 rounded-2xl bg-black/85 backdrop-blur-md border-2 border-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.4)] space-y-2 max-w-md animate-fade-in font-mono">
                <div className="text-[10px] text-cyan-400 uppercase tracking-widest flex items-center justify-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>NEXT SIGNAL LOCATION DETECTED</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white tracking-widest uppercase">
                  CLASSIFIED COORDINATES LOCKED
                </div>
                <div className="text-xs text-amber-300 font-mono">
                  AZIMUTH: 294° NW · RANGE: 42.8 KM · VAULT ZERO
                </div>
              </div>
            )}
          </div>

          {/* Bottom Letterbox Bar with Subtitles & Skip Button */}
          <div className="h-24 bg-black/95 flex items-center justify-between px-8 border-t border-cyan-500/20">
            <div className="text-xs sm:text-sm font-sans text-slate-200 max-w-3xl leading-relaxed">
              {endingDialoguePhase === 1 && (
                <span>
                  <strong className="text-cyan-300 font-mono">Commander Elena:</strong> "Captain, we've received your recovery report. The archive is safe. Excellent work."
                </span>
              )}
              {endingDialoguePhase === 2 && (
                <span>
                  <strong className="text-amber-300 font-mono">Arin:</strong> "Commander, this wasn't just a recovery operation. Something was using Surveyor's data."
                </span>
              )}
              {endingDialoguePhase === 3 && (
                <span>
                  <strong className="text-cyan-300 font-mono">Commander Elena:</strong> "Do you want to investigate the coordinates?"
                </span>
              )}
              {endingDialoguePhase === 4 && (
                <span>
                  <span className="italic text-slate-400 font-mono pr-2">(Arin looks back at Surveyor 1.)</span>
                  <strong className="text-amber-300 font-mono">Arin:</strong> "Yes. I think I finally understand what this mission is about."
                </span>
              )}
              {endingDialoguePhase === 5 && (
                <span>
                  <strong className="text-cyan-300 font-mono">Commander Elena:</strong> "Then welcome to Project Legacy, Captain."
                </span>
              )}
              {endingDialoguePhase >= 6 && (
                <span className="font-mono text-cyan-400 tracking-wider uppercase text-xs">
                  The camera moves toward the Moon's horizon. The next signal location appears on the screen.
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={skipEndingCinematic}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Skip Debrief</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 7 — OFFICIAL MISSION COMPLETE ENDING SCREEN */}
      {(showMissionCompleteModal || showChapter1Completion) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-2xl animate-fade-in font-mono select-none overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border-2 border-emerald-500/70 shadow-[0_0_90px_rgba(16,185,129,0.35)] p-6 sm:p-8 text-center space-y-6 my-auto">
            {/* Header Badge & Title */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-300 font-bold uppercase tracking-widest">
                <Trophy className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>PROJECT LEGACY · MISSION 01</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-widest uppercase">
                MISSION COMPLETE
              </h1>
              <div className="text-sm sm:text-base font-semibold text-cyan-400 tracking-wider uppercase font-sans">
                The First Footprint
              </div>
            </div>

            {/* Exact Required 4 Core Mission Outcomes */}
            <div className="p-4 sm:p-5 rounded-xl bg-black/70 border border-emerald-500/30 text-left text-xs sm:text-sm font-mono space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 font-sans">Recovered:</span>
                <span className="text-emerald-400 font-bold tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  Surveyor 1 historical archive
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 font-sans">Discovered:</span>
                <span className="text-cyan-400 font-bold tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  Unknown signal network
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 font-sans">Next destination:</span>
                <span className="text-amber-400 font-bold tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  Classified coordinates
                </span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-300 font-sans">Project Legacy:</span>
                <span className="text-purple-300 font-bold tracking-wide flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  Mission 01 completed
                </span>
              </div>
            </div>

            {/* Scripted Comms Dialogue Archive */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-left text-xs space-y-2 font-sans">
              <div className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider border-b border-white/10 pb-1 flex justify-between items-center">
                <span>Mission Debrief Log · Carrier Aegis Uplink</span>
                <span className="text-slate-400 font-normal">Encrypted Carrier 432.06 Hz</span>
              </div>
              <div className="text-slate-300 space-y-2 text-xs leading-relaxed">
                <p>
                  <strong className="text-cyan-300 font-mono">Commander Elena:</strong> "Captain, we've received your recovery report. The archive is safe. Excellent work."
                </p>
                <p>
                  <strong className="text-amber-300 font-mono">Arin:</strong> "Commander, this wasn't just a recovery operation. Something was using Surveyor's data."
                </p>
                <p>
                  <strong className="text-cyan-300 font-mono">Commander Elena:</strong> "Do you want to investigate the coordinates?"
                </p>
                <p className="italic text-slate-400 pl-3 border-l-2 border-slate-600">
                  (Arin looks back at Surveyor 1.)
                </p>
                <p>
                  <strong className="text-amber-300 font-mono">Arin:</strong> "Yes. I think I finally understand what this mission is about."
                </p>
                <p>
                  <strong className="text-cyan-300 font-mono">Commander Elena:</strong> "Then welcome to Project Legacy, Captain."
                </p>
              </div>
            </div>

            {/* End Credits Toggle Section */}
            {showCredits && (
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-left text-xs font-mono space-y-3 animate-fade-in">
                <div className="text-cyan-300 font-bold border-b border-white/10 pb-1 uppercase tracking-wider">
                  Project Legacy · Expedition Aegis Credits
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 font-sans">
                  <div>
                    <div className="text-slate-400 font-mono text-[10px] uppercase">Historical Tribute:</div>
                    <div className="font-semibold text-white">NASA Surveyor 1 (1966)</div>
                    <div className="text-[10px] text-slate-400">First U.S. Soft Lunar Landing</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-mono text-[10px] uppercase">Landing Site:</div>
                    <div className="font-semibold text-white">Oceanus Procellarum</div>
                    <div className="text-[10px] text-slate-400">2.474° S, 43.339° W</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-mono text-[10px] uppercase">Expedition Team:</div>
                    <div>Captain Arin Rao (Commander)</div>
                    <div>Specialist Maya Chen (Lead Science)</div>
                    <div>Officer Leo Vance (Ops & Recovery)</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-mono text-[10px] uppercase">Next Chapter:</div>
                    <div className="font-semibold text-cyan-300">Vault Zero Subterranean Network</div>
                    <div className="text-[10px] text-slate-400">Project Legacy Mission 02</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setShowCredits(!showCredits);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                {showCredits ? 'Hide Credits' : 'End Credits & Lore'}
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setShowMissionCompleteModal(false);
                  setShowChapter1Completion(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Free Exploration
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMissionCompleteModal(false);
                  setShowChapter1Completion(false);
                  startEndingCinematic();
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Replay Ending
              </button>

              {onReturnMenu && (
                <button
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    onReturnMenu();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Return to Base Menu</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OPENING CINEMATIC LETTERBOX & TITLE OVERLAY */}
      {isOpeningCinematic && (
        <div className="absolute inset-0 pointer-events-auto z-50 flex flex-col justify-between">
          {/* Top Letterbox Bar */}
          <div className="h-20 bg-black/95 flex items-center justify-between px-8 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <div className="text-xs font-mono tracking-widest text-cyan-300 uppercase">
                EXPEDITION AEGIS · MISSION LOG // OCEANUS PROCELLARUM
              </div>
            </div>
            <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
              STAGE 1 — ARRIVAL ON THE MOON
            </div>
          </div>

          {/* Center Cinematic Title Card */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none">
            <div className="p-4 rounded-2xl bg-black/75 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.3)] space-y-2 max-w-lg">
              <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono">
                INITIALIZING EXTRAVEHICULAR ACTIVITY (EVA)
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-widest uppercase">
                Arrival on the Moon
              </h1>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {cinematicSub}
              </p>
            </div>
          </div>

          {/* Bottom Letterbox Bar */}
          <div className="h-20 bg-black/95 flex items-center justify-between px-8 border-t border-cyan-500/20">
            <div className="text-xs font-mono text-cyan-400/90 tracking-wider">
              {cinematicSub}
            </div>
            <button
              type="button"
              onClick={skipCinematic}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 border border-white/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>Skip Cinematic</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/60 border border-white/30 text-[10px] text-amber-300 font-mono">Space</kbd>
            </button>
          </div>
        </div>
      )}

      {/* TACTICAL PAUSE MENU MODAL */}
      {isPaused && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-950/95 border border-cyan-500/50 shadow-[0_0_60px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-cyan-500/30 bg-cyan-950/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-[10px] text-cyan-400 uppercase tracking-widest">
                    MISSION SUSPENDED · EVA TELEMETRY PAUSED
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-wide">
                    {JOURNEY_STAGES[journeyStageIndex]?.name || 'Mission Status'}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={togglePause}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Resume [Esc]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs font-mono">
              <div className="space-y-2">
                <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                  Mechanics & Controls Reference
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="p-2.5 rounded-lg bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">Move:</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-white/10">WASD / Arrows</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">Look:</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-white/10">Mouse</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">Interact:</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-white/10">E</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">Scanner:</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-white/10">Q / F</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-white/10 flex justify-between items-center">
                    <span className="text-slate-400">Database:</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-white/10">Tab / J</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-white/10 flex justify-between items-center col-span-2">
                    <span className="text-slate-400">Pause Menu:</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-white/10">Esc</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/10 font-sans">
                <div className="text-[11px] font-mono text-cyan-400 uppercase font-bold">Active Objective</div>
                <div className="text-slate-200 text-xs leading-relaxed">
                  {JOURNEY_STAGES[journeyStageIndex]?.objective}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={togglePause}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold uppercase tracking-wider transition-all shadow-lg shadow-cyan-600/30"
                >
                  Resume EVA Mission [Esc]
                </button>
                {onReturnMenu && (
                  <button
                    type="button"
                    onClick={onReturnMenu}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white uppercase tracking-wider transition-colors border border-white/10"
                  >
                    Return to Base Menu
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVIDENCE DATABASE MODAL (SYSTEM E) */}
      <EvidenceDatabaseModal
        isOpen={isDatabaseOpen}
        onClose={() => {
          setIsDatabaseOpen(false);
          isDatabaseOpenRef.current = false;
        }}
        databaseEntries={evidenceEntries}
      />

      {/* EVIDENCE LOGGED NOTIFICATION TOAST (SYSTEM E) */}
      {databaseNotice && (
        <div className="fixed top-20 right-6 z-50 pointer-events-auto animate-bounce font-mono">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              setIsDatabaseOpen(true);
              isDatabaseOpenRef.current = true;
            }}
            className="p-3.5 rounded-2xl bg-slate-950/95 border-2 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.5)] flex items-center gap-3 text-left max-w-sm hover:scale-105 transition-transform"
          >
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              <Database className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span>NEW DATABASE RECORD</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <div className="text-xs font-bold text-white line-clamp-1">{databaseNotice.title}</div>
              <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                Filed under {databaseNotice.category} · Press [Tab] to view
              </div>
            </div>
          </button>
        </div>
      )}

      {/* SCANNER SENSOR VISOR HUD OVERLAY (SYSTEM B) */}
      {isScannerVisorActive && (
        <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6 font-mono select-none">
          {/* Top Visor Sensor Bar */}
          <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold text-cyan-300 tracking-wider">
                EVA MULTI-FUNCTION SENSOR SCANNER · ACTIVE [Q]
              </span>
            </div>

            {/* 4 Functions Indicators */}
            <div className="hidden md:flex items-center gap-2 text-[10px]">
              <span className={`px-2 py-0.5 rounded border ${
                nearInteractable ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold' : 'bg-black/40 border-white/10 text-slate-400'
              }`}>
                1. OBJECT SCAN
              </span>
              <span className={`px-2 py-0.5 rounded border ${
                hasSignalTracker || distanceToAnomaly < 50 ? 'bg-purple-950 border-purple-400 text-purple-300 font-bold' : 'bg-black/40 border-white/10 text-slate-400'
              }`}>
                2. SIGNAL TRACKER ({scannerReading.strength}%)
              </span>
              <span className="px-2 py-0.5 rounded border bg-blue-950 border-blue-400 text-blue-300 font-bold">
                3. EVIDENCE LOG [Tab]
              </span>
              <span className={`px-2 py-0.5 rounded border ${
                journeyStageIndex >= 3 ? 'bg-emerald-950 border-emerald-400 text-emerald-300 font-bold' : 'bg-black/40 border-white/10 text-slate-400'
              }`}>
                4. INTERFACE LINK
              </span>
            </div>

            <div className="text-[10px] text-cyan-400 font-mono">
              FREQ: 432.06 Hz CARRIER LOCK
            </div>
          </div>

          {/* Center Visor Reticle Brackets */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-64 h-64 border border-cyan-500/20 rounded-full flex items-center justify-center">
              <div className="absolute inset-0 border border-dashed border-cyan-400/30 rounded-full animate-spin-slow" />
              <div className="absolute inset-x-0 h-[1px] bg-cyan-400/20" />
              <div className="absolute inset-y-0 w-[1px] bg-cyan-400/20" />

              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

              {nearInteractable && (
                <div className="absolute -bottom-10 px-3 py-1 rounded bg-black/90 border border-cyan-400 text-[10px] text-cyan-300 font-bold uppercase tracking-wider text-center whitespace-nowrap shadow-lg">
                  TARGET LOCKED: {nearInteractable.title} · PRESS [Q] OR [E] TO SCAN
                </div>
              )}
            </div>
          </div>

          {/* Bottom Visor Bar: Signal Tracker & Instructions */}
          <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-400/50 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-400 text-[10px]">SIGNAL: </span>
                <strong className="text-purple-300 font-bold">{scannerReading.strength}% ({scannerReading.tier})</strong>
              </div>
              <div className="hidden sm:inline">
                <span className="text-slate-400 text-[10px]">VECTOR: </span>
                <strong className="text-white">{scannerReading.direction} ({scannerReading.bearingDeg}°)</strong>
              </div>
            </div>

            <div className="text-[10px] text-slate-400">
              Aim at target & hold [Q] to scan · [Tab] opens Mission Database
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

