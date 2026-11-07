import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import {
  Compass,
  Radio,
  Sparkles,
  Award,
  FastForward,
  RotateCcw,
  CheckCircle2,
  Volume2,
  Rocket,
  ShieldAlert,
  ArrowRight,
  Eye,
  Wrench,
  Zap,
  Package,
  Layers
} from 'lucide-react';
import { createAstronautCharacter } from '../components/gameplay/three/AstronautCharacterModel';
import { createLunarOpenWorldEnvironment } from '../components/gameplay/three/LunarOpenWorldEnvironment';
import { createSpacecraftCockpit } from '../components/gameplay/three/SpacecraftCockpitModel';
import { createLaunchpadComplex, createLaunchSmokeSystem } from '../components/gameplay/three/RocketLaunchpadModel';
import { createAtlasCentaurVehicle } from '../components/gameplay/three/AtlasCentaurLaunchVehicle';
import { createThirdPersonController } from '../components/gameplay/three/ThirdPersonPlayerController';
import { gameAudio } from '../config/gameAudio';
import { saveGame } from '../game/saveManager';

/**
 * Level1Surveyor5Page.jsx
 * 
 * "TIME TRAVELERS OF SPACE" — LEVEL 1: SURVEYOR 5 (THE LOST COMPONENTS)
 * 
 * Genuine AAA 3D Open-World Space Adventure:
 * - Phase 1: 1967 Cape Canaveral Launch & Atlas-Centaur Staging (Atlas Booster Sep, Centaur RL10 Burn, Fairing Jettison, Surveyor Leg Unfolding)
 * - Phase 2: Post-Landing Malfunction Briefing from Dr. Leonard Jaffe
 * - Phase 3: Human Spacecraft Cockpit Flight & Mare Tranquillitatis Touchdown
 * - Phase 4: GTA-Style Third-Person Open-World Lunar Exploration & Component Hunt
 *   (Approved Cute Cyan Alien Astronaut Leo, 4 Physical Scattered Components, Proximity Audio Radar, Vertical Light Beams)
 * - Phase 5: In-World Surveyor 5 4-Slot Snap Assembly & Triumphant Restoration (1967 Archival Photos & 3 Stars)
 */
export default function Level1Surveyor5Page() {
  const navigate = useNavigate();
  const canvasContainerRef = useRef(null);

  // --- Game Master Phase State ---
  // 'phase1_launch' | 'phase2_emergency' | 'phase3_cockpit' | 'phase4_open_world' | 'phase5_victory'
  const [gamePhase, setGamePhase] = useState('phase1_launch');

  // Inventory & Component Recovery Tracking
  const [inventory, setInventory] = useState([]); // array of collected component ids
  const [installedSlots, setInstalledSlots] = useState([]); // array of installed component ids
  const [distanceToSurveyor, setDistanceToSurveyor] = useState(42);
  const [closestCompInfo, setClosestCompInfo] = useState(null); // { name, distance, color }
  const [compassBearing, setCompassBearing] = useState(0); // degrees to objective
  const [interactionPrompt, setInteractionPrompt] = useState(null); // { text, action }

  // Radio / Character Dialogue Overlay State
  const [radioTransmission, setRadioTransmission] = useState(null);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(false);

  // Cockpit Flight Telemetry (Phase 3)
  const [flightAltitude, setFlightAltitude] = useState(120);
  const [flightVelocity, setFlightVelocity] = useState(2450);
  const [isEngineBurning, setIsEngineBurning] = useState(false);

  // References for render loop coordination
  const phaseRef = useRef(gamePhase);
  phaseRef.current = gamePhase;
  const inventoryRef = useRef(inventory);
  inventoryRef.current = inventory;
  const installedSlotsRef = useRef(installedSlots);
  installedSlotsRef.current = installedSlots;

  // -------------------------------------------------------------
  // RADIO TRANSMISSION HELPER
  // -------------------------------------------------------------
  const playRadioMessage = (speaker, title, text, onEnd = null) => {
    setRadioTransmission({ speaker, title, text });
    setIsAudioSpeaking(true);
    gameAudio.speakDialogue(text, speaker === 'jaffe' ? 'jaffe' : 'leo', null, () => {
      setIsAudioSpeaking(false);
      if (onEnd) onEnd();
    });
  };

  // -------------------------------------------------------------
  // THREE.JS MASTER ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Master Scene & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1200);
    camera.position.set(0, 4, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ===========================================================
    // 1. PHASE 1 ASSETS: Atlas-Centaur Launch Vehicle & Launchpad
    // ===========================================================
    const launchpadGroup = new THREE.Group();
    scene.add(launchpadGroup);

    const { root: launchpadComplex } = createLaunchpadComplex();
    launchpadGroup.add(launchpadComplex);

    // Authentic Atlas-Centaur with physical staging
    const atlasCentaur = createAtlasCentaurVehicle();
    launchpadGroup.add(atlasCentaur.root);

    const { particles: smokeParticles, update: updateSmoke } = createLaunchSmokeSystem(350);
    launchpadGroup.add(smokeParticles);

    // ===========================================================
    // 2. PHASE 3 ASSETS: Human Spacecraft Cockpit
    // ===========================================================
    const cockpitGroup = new THREE.Group();
    cockpitGroup.visible = false;
    scene.add(cockpitGroup);

    const { root: cockpitMesh, update: updateCockpit } = createSpacecraftCockpit();
    cockpitGroup.add(cockpitMesh);

    // Moon sphere visible through cockpit windshield
    const texLoader = new THREE.TextureLoader();
    const moonTex = texLoader.load('/textures/planets/moon.jpg');
    const cockpitMoon = new THREE.Mesh(
      new THREE.SphereGeometry(4.5, 32, 32),
      new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.9 })
    );
    cockpitMoon.position.set(0, 1.8, -12);
    cockpitGroup.add(cockpitMoon);

    // ===========================================================
    // 3. PHASE 4 ASSETS: Open-World Moon, Lost Components & Hero Leo
    // ===========================================================
    const openWorldGroup = new THREE.Group();
    openWorldGroup.visible = false;
    scene.add(openWorldGroup);

    const {
      root: lunarTerrainRoot,
      update: updateLunarTerrain,
      surveyorLander,
      lostComponents,
      getTerrainHeight,
      positions
    } = createLunarOpenWorldEnvironment();
    openWorldGroup.add(lunarTerrainRoot);

    // Astronaut Hero Leo (Our approved cute cyan alien astronaut)
    const astronautHero = createAstronautCharacter({ scale: 0.85 });
    const initialH = getTerrainHeight ? getTerrainHeight(0, 23) : 0;
    astronautHero.position.set(0, initialH, 23);
    openWorldGroup.add(astronautHero);

    // Third-person controller (WASD, mouse-look orbit, sprint, jump)
    const controller = createThirdPersonController({
      characterMesh: astronautHero,
      camera,
      domElement: container,
      groundY: 0,
      getGroundHeight: (x, z) => getTerrainHeight(x, z),
      onFootstep: () => gameAudio.playFootstep()
    });

    // ===========================================================
    // TIMELINE & LOGIC ORCHESTRATION
    // ===========================================================
    let startTime = performance.now();
    let prevTime = startTime;
    let rocketY = 0;
    let rocketVel = 0;
    let phaseTimer = 0;
    let locatorPingTimer = 0;

    // Start Phase 1 launch sequence
    setTimeout(() => {
      playRadioMessage(
        'jaffe',
        'Dr. Leonard Jaffe • NASA Project Scientist',
        'Cape Canaveral, September 8, 1967. The Atlas-Centaur rocket is primed. Surveyor 5 must reach the Sea of Tranquility to test the lunar soil!'
      );
    }, 1200);

    // Launch Ignition at 5.5s
    setTimeout(() => {
      atlasCentaur.staging.state = 'liftoff';
      gameAudio.playThruster(5.0);
    }, 5500);

    let animFrameId;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - prevTime) / 1000, 0.1);
      const elapsed = (now - startTime) / 1000;
      prevTime = now;
      phaseTimer += delta;

      const curPhase = phaseRef.current;

      // =========================================================
      // PHASE 1: ATLAS-CENTAUR ROCKET LAUNCH & PHYSICAL STAGING
      // =========================================================
      if (curPhase === 'phase1_launch') {
        launchpadGroup.visible = true;
        cockpitGroup.visible = false;
        openWorldGroup.visible = false;

        atlasCentaur.staging.update(delta, elapsed);

        if (phaseTimer > 5.5) {
          updateSmoke(delta, phaseTimer < 11.0);

          if (phaseTimer > 6.5) {
            rocketVel += 9.2 * delta;
            rocketY += rocketVel * delta;
            atlasCentaur.root.position.y = rocketY;

            camera.position.set(-6, 16 + rocketY * 0.72, 18 + rocketY * 0.25);
            camera.lookAt(0, 14 + rocketY, 0);
          }
        } else {
          camera.position.set(-4, 18, 14);
          camera.lookAt(0, 14, 0);
        }

        // 10s: Stage 1 Atlas Booster Separation
        if (phaseTimer >= 10.0 && phaseTimer < 10.1) {
          atlasCentaur.staging.state = 'atlas_sep';
          gameAudio.playThruster(2.0);
        }

        // 13s: Payload Fairing Clamshell Jettison
        if (phaseTimer >= 13.0 && phaseTimer < 13.1) {
          atlasCentaur.staging.state = 'fairing_sep';
          gameAudio.playAttachSnap();
        }

        // 15s: Surveyor 5 Spacecraft Separation & Leg Unfold
        if (phaseTimer >= 15.0 && phaseTimer < 15.1) {
          atlasCentaur.staging.state = 'surveyor_sep';
          gameAudio.playPowerUp();
        }

        // Transition to Phase 2 Emergency at 19s
        if (phaseTimer >= 19.0) {
          setGamePhase('phase2_emergency');
          phaseTimer = 0;
          gameAudio.playAlarm();
          playRadioMessage(
            'jaffe',
            'Dr. Leonard Jaffe • Emergency Broadcast',
            "Leo! Mayday! Surveyor 5 touched down in the Sea of Tranquility, but an electrical malfunction blew four vital components across the crater! We need you to fly the rescue ship, recover the lost parts, and repair Surveyor 5!"
          );
        }
      }

      // =========================================================
      // PHASE 2: EMERGENCY BRIEFING
      // =========================================================
      else if (curPhase === 'phase2_emergency') {
        launchpadGroup.visible = false;
        cockpitGroup.visible = true;
        openWorldGroup.visible = false;

        updateCockpit(delta, elapsed, false);
        camera.position.set(0, 1.4, 0);
        camera.lookAt(0, 1.2, -4);
      }

      // =========================================================
      // PHASE 3: COCKPIT FLIGHT & LUNAR DESCENT
      // =========================================================
      else if (curPhase === 'phase3_cockpit') {
        launchpadGroup.visible = false;
        cockpitGroup.visible = true;
        openWorldGroup.visible = false;

        updateCockpit(delta, elapsed, true);

        // Flight descent telemetry
        setFlightAltitude(prev => Math.max(0, Math.round(prev - 14 * delta)));
        setFlightVelocity(prev => Math.max(12, Math.round(prev - 230 * delta)));
        setIsEngineBurning(true);

        // Scale approaching Moon through windshield
        cockpitMoon.scale.addScalar(0.09 * delta);
        cockpitMoon.rotation.y += 0.04 * delta;

        camera.position.set(
          Math.sin(elapsed * 25) * 0.012,
          1.4 + Math.sin(elapsed * 20) * 0.015,
          Math.cos(elapsed * 22) * 0.01
        );
        camera.lookAt(0, 1.2, -4);

        // Touchdown at ~8.5 seconds
        if (phaseTimer >= 8.5) {
          gameAudio.playThruster(1.5);
          setGamePhase('phase4_open_world');
          phaseTimer = 0;
          controller.setPosition(0, 0, 23);
          playRadioMessage(
            'jaffe',
            'Dr. Leonard Jaffe • Mission Control',
            "Touchdown confirmed in Mare Tranquillitatis! Leo, scan the crater for the colored light beacons! Recover the four scattered components and bring them back to Surveyor 5!"
          );
        }
      }

      // =========================================================
      // PHASE 4 & 5: OPEN-WORLD COMPONENT HUNT & SURVEYOR 5 REPAIR
      // =========================================================
      else if (curPhase === 'phase4_open_world' || curPhase === 'phase5_victory') {
        launchpadGroup.visible = false;
        cockpitGroup.visible = false;
        openWorldGroup.visible = true;

        // Update player controller (WASD + mouse look)
        controller.update(delta, elapsed);

        // Update lunar world (sparks, earth spin, surveyor animations, lost component beacons)
        updateLunarTerrain(delta, elapsed);

        const pPos = controller.pos;
        const dSurv = pPos.distanceTo(positions.surveyor5);
        setDistanceToSurveyor(dSurv.toFixed(1));

        // Find closest uncollected component
        const closest = lostComponents.getClosestUncollected(pPos);
        if (closest) {
          setClosestCompInfo({
            name: closest.item.name,
            distance: closest.distance.toFixed(1),
            color: closest.item.beaconColor,
            id: closest.item.id
          });

          // Proximity Audio Locator Ping: frequency scales with closeness
          locatorPingTimer += delta;
          const pingInterval = Math.max(0.35, Math.min(2.0, closest.distance * 0.05));
          if (locatorPingTimer >= pingInterval) {
            locatorPingTimer = 0;
            gameAudio.playLocatorPing(closest.distance);
          }

          // Calculate compass bearing to closest component
          const dx = closest.item.basePos.x - pPos.x;
          const dz = closest.item.basePos.z - pPos.z;
          const targetAngle = Math.atan2(dx, dz) * (180 / Math.PI);
          setCompassBearing(Math.round(targetAngle));
        } else {
          setClosestCompInfo(null);
          // Target Surveyor 5 when all recovered
          const dx = positions.surveyor5.x - pPos.x;
          const dz = positions.surveyor5.z - pPos.z;
          setCompassBearing(Math.round(Math.atan2(dx, dz) * (180 / Math.PI)));
        }

        // Show equippable tool on Leo if carrying items
        astronautHero.userData.anim.hasCoupler = inventoryRef.current.length > 0;

        // -------------------------------------------------------
        // In-World 3D Interaction Logic & Floating Prompts
        // -------------------------------------------------------
        const curInventory = inventoryRef.current;
        const curInstalled = installedSlotsRef.current;

        // Check if near an uncollected lost component (within 3.6m)
        const nearbyLost = lostComponents.getNearbyComponent(pPos, 3.6);

        if (nearbyLost) {
          const compDef = nearbyLost.item;
          setInteractionPrompt({
            text: `Press [E] to Collect ${compDef.name}`,
            action: () => {
              gameAudio.playPickup();
              astronautHero.userData.anim.state = 'pickup';
              lostComponents.collectComponent(compDef.id);

              const updatedInv = [...curInventory, compDef.id];
              setInventory(updatedInv);

              // Dr. Jaffe contextual scientific radio transmission
              let explanation = '';
              if (compDef.id === 'solar_panel') {
                explanation = "Solar Panel Array secured! This array absorbs raw sunlight to power Surveyor 5's batteries through the 14-day lunar daylight!";
              } else if (compDef.id === 'antenna') {
                explanation = "Planar High-Gain Antenna recovered! This directional dish transmits television images and scientific telemetry 384,000 kilometers back to Earth!";
              } else if (compDef.id === 'tv_camera') {
                explanation = "Television Camera Turret recovered! This high-resolution vidicon camera has a steerable mirror prism to capture 360-degree lunar panoramas!";
              } else if (compDef.id === 'alpha_sensor') {
                explanation = "Alpha-Scattering Analyzer secured! Its radioactive Curium sources bombard the regolith to analyze the Moon's chemical elements for Apollo!";
              }

              if (updatedInv.length === 4) {
                explanation += " All four lost components recovered! Rush back to Surveyor 5 and install them!";
              }

              playRadioMessage('jaffe', 'Dr. Leonard Jaffe • NASA JPL', explanation);

              setTimeout(() => {
                astronautHero.userData.anim.state = 'idle';
              }, 600);
            }
          });
        }
        // Check if near Surveyor 5 (within 4.0m)
        else if (dSurv <= 4.0) {
          // Identify which component in inventory can be installed next
          const uninstalledInHand = curInventory.filter(id => !curInstalled.includes(id));

          if (uninstalledInHand.length > 0) {
            const nextSlotId = uninstalledInHand[0];
            const slotName =
              nextSlotId === 'solar_panel'
                ? 'Solar Panel Array'
                : nextSlotId === 'antenna'
                ? 'Planar High-Gain Antenna'
                : nextSlotId === 'tv_camera'
                ? 'Television Camera Turret'
                : 'Alpha-Scattering Surface Analyzer';

            setInteractionPrompt({
              text: `Press [E] to Install ${slotName}`,
              action: () => {
                gameAudio.playAttachSnap();
                astronautHero.userData.anim.state = 'repair';
                surveyorLander.installSlot(nextSlotId);

                const updatedInstalled = [...curInstalled, nextSlotId];
                setInstalledSlots(updatedInstalled);

                if (updatedInstalled.length === 4) {
                  // ALL 4 INSTALLED! TRIGGER FULL RESTORATION!
                  surveyorLander.setRepaired(true);
                  surveyorLander.setSolarAligned(true);
                  astronautHero.userData.anim.state = 'victory';
                  gameAudio.playPowerUp();

                  setGamePhase('phase5_victory');
                  setInteractionPrompt(null);

                  setTimeout(() => {
                    gameAudio.playVictory();
                    playRadioMessage(
                      'jaffe',
                      'Dr. Leonard Jaffe • Mission Control',
                      "Telemetry restored! Dr. Jaffe here from Mission Control! We are receiving pristine television pictures and alpha particle data from the Sea of Tranquility! Outstanding work, Leo! You've saved Surveyor 5 and secured humanity's path to Apollo!",
                      () => {
                        try {
                          saveGame({
                            currentChapter: 'surveyor_5_repaired',
                            badges: ['Lunar Pioneer Badge', 'Surveyor 5 Restorer'],
                            stars: 3,
                            level1Completed: true
                          });
                        } catch (e) {}
                      }
                    );
                  }, 1200);
                } else {
                  playRadioMessage(
                    'jaffe',
                    'Dr. Leonard Jaffe • Assembly',
                    `${slotName} successfully locked into mounting slot! ${4 - updatedInstalled.length} more component(s) to install!`
                  );
                  setTimeout(() => {
                    astronautHero.userData.anim.state = 'idle';
                  }, 600);
                }
              }
            });
          } else if (curInstalled.length === 4) {
            // Already repaired
            setInteractionPrompt(null);
          } else {
            // Leo is at Surveyor 5 but hasn't collected components yet
            setInteractionPrompt({
              text: 'Press [E] to Run Diagnostic Scan',
              action: () => {
                gameAudio.playScanner();
                playRadioMessage(
                  'jaffe',
                  'Dr. Leonard Jaffe • Diagnostics',
                  'Diagnostic confirms 4 missing subsystems: Solar Panel, Antenna, TV Camera, and Alpha-Scattering Analyzer. Follow the colored light beacons across the crater!'
                );
              }
            });
          }
        } else {
          setInteractionPrompt(null);
        }

        // Handle physical [E] key trigger
        if (controller.keys.e && interactionPrompt) {
          controller.keys.e = false;
          interactionPrompt.action();
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      controller.dispose();
      gameAudio.stopSpeech();
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Reference for test / debug mission completion
  useEffect(() => {
    const handleTestComplete = () => {
      setInventory(['solar_panel', 'antenna', 'tv_camera', 'alpha_sensor']);
      setInstalledSlots(['solar_panel', 'antenna', 'tv_camera', 'alpha_sensor']);
      setGamePhase('phase5_victory');
    };
    window.addEventListener('test-complete-mission', handleTestComplete);
    return () => window.removeEventListener('test-complete-mission', handleTestComplete);
  }, []);

  // -------------------------------------------------------------
  // USER ACTIONS / HANDLERS
  // -------------------------------------------------------------
  const handleStartCockpitMission = () => {
    gameAudio.playClick();
    gameAudio.playThruster(4.0);
    setGamePhase('phase3_cockpit');
    setFlightAltitude(120);
    setFlightVelocity(2450);
  };

  const handleSkipToOpenWorld = () => {
    gameAudio.playClick();
    setGamePhase('phase4_open_world');
  };

  const handleReplayMission = () => {
    gameAudio.playClick();
    setGamePhase('phase1_launch');
    setInventory([]);
    setInstalledSlots([]);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Master 3D Viewport */}
      <div ref={canvasContainerRef} className="w-full h-full cursor-crosshair" />

      {/* ----------------------------------------------------------- */}
      {/* TOP HUD BAR: Mission Status, Radar, Inventory, Skip Controls */}
      {/* ----------------------------------------------------------- */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        {/* Left: Mission Title Badge */}
        <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-sky-400/40 shadow-xl pointer-events-auto">
          <Rocket className="w-5 h-5 text-sky-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                Level 1 • Mare Tranquillitatis
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 font-bold border border-sky-500/30">
                1967
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white">
              Surveyor 5 — The Lost Components
            </h1>
          </div>
        </div>

        {/* Center: Radar & Proximity Locator (Open-World Only) */}
        {gamePhase === 'phase4_open_world' && (
          <div className="hidden md:flex items-center gap-4 px-5 py-2 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-700/80 shadow-2xl">
            <Compass className="w-4 h-4 text-amber-400 animate-spin" />
            <div className="flex items-center gap-5 text-xs font-bold">
              {closestCompInfo ? (
                <div className="flex items-center gap-1.5 text-amber-300">
                  <span>📍 Nearest Beacon:</span>
                  <span className="text-white font-mono">{closestCompInfo.distance}m</span>
                  <span className="text-slate-400">({closestCompInfo.name})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>All Components Recovered!</span>
                </div>
              )}
              <div className="w-px h-4 bg-slate-700" />
              <div className="flex items-center gap-1.5 text-sky-300">
                <span>📡 Surveyor 5:</span>
                <span className="text-white font-mono">{distanceToSurveyor}m</span>
              </div>
            </div>
          </div>
        )}

        {/* Right: Exit / Skip Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {gamePhase !== 'phase4_open_world' && gamePhase !== 'phase5_victory' && (
            <button
              onClick={handleSkipToOpenWorld}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md text-slate-300 hover:text-white rounded-2xl border border-slate-700 hover:border-sky-400 transition-all text-xs font-bold shadow-md active:scale-95"
            >
              <span>Skip to Moon</span>
              <FastForward className="w-4 h-4 text-sky-400" />
            </button>
          )}

          <button
            onClick={() => navigate('/missions')}
            className="px-3.5 py-2 bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md text-slate-400 hover:text-white rounded-2xl border border-slate-700 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Hub
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* PHASE 2 OVERLAY: EMERGENCY ALERT & MISSION BRIEFING         */}
      {/* ----------------------------------------------------------- */}
      {gamePhase === 'phase2_emergency' && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-sm z-30 animate-fade-in pointer-events-auto">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-slate-900/95 border-2 border-red-500/60 shadow-[0_0_60px_rgba(239,68,68,0.4)] text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-950 border border-red-500/60 flex items-center justify-center text-red-400 animate-pulse">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-red-400">
              PRIORITY ALPHA EMERGENCY • NASA HQ
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-3">
              Surveyor 5 Subsystems Scattered!
            </h2>

            <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
              Dr. Leonard Jaffe reports that a post-landing shockwave detached Surveyor 5's vital instruments into the surrounding crater. Enter your spacecraft, fly to Mare Tranquillitatis, and recover the 4 lost components!
            </p>

            <button
              id="enter-spacecraft-btn"
              onClick={handleStartCockpitMission}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-sky-600 hover:from-red-500 hover:to-sky-500 text-white font-extrabold text-base shadow-xl shadow-red-500/25 active:scale-95 transition-all"
            >
              <Rocket className="w-5 h-5" />
              <span>Enter Spacecraft & Fly to Moon</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* PHASE 3 OVERLAY: COCKPIT HUD & FLIGHT DESCENT TELEMETRY     */}
      {/* ----------------------------------------------------------- */}
      {gamePhase === 'phase3_cockpit' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
          <div className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-sky-400/50 shadow-2xl">
            <div className="text-left">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Descent Altitude</span>
              <p className="text-xl font-mono font-black text-white">{flightAltitude} km</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-left">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Orbital Velocity</span>
              <p className="text-xl font-mono font-black text-white">{flightVelocity} m/s</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Zap className="w-4 h-4 animate-pulse" />
              <span>RETRO-THRUSTER FIRING</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* IN-WORLD 3D INTERACTION PROMPT ([E] Key Float)             */}
      {/* ----------------------------------------------------------- */}
      {interactionPrompt && gamePhase === 'phase4_open_world' && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 animate-bounce pointer-events-auto">
          <button
            id="interact-action-btn"
            onClick={interactionPrompt.action}
            className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-600 text-white font-black text-sm sm:text-base shadow-[0_0_35px_rgba(56,189,248,0.7)] border-2 border-white/60 active:scale-95 transition-all"
          >
            <Wrench className="w-5 h-5 animate-spin" />
            <span>{interactionPrompt.text}</span>
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* BOTTOM-LEFT: BACKPACK INVENTORY & MISSION PROGRESS         */}
      {/* ----------------------------------------------------------- */}
      {gamePhase === 'phase4_open_world' && (
        <div className="absolute bottom-6 left-4 sm:left-6 max-w-sm sm:max-w-md z-20 pointer-events-none">
          <div className="p-4 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-sky-400/40 shadow-2xl flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-900/40 border border-sky-400/50 p-1 flex items-center justify-center shrink-0">
              <img src="/images/nova_alien_companion.png" alt="Leo Hero" className="w-10 h-10 object-contain drop-shadow" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
                  Components Recovered
                </span>
                <span className="text-xs font-mono font-black text-amber-300">
                  {inventory.length} / 4
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 my-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${(inventory.length / 4) * 100}%` }}
                />
              </div>

              {/* Component Badge Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { id: 'solar_panel', label: 'Solar Array' },
                  { id: 'antenna', label: 'Comms Dish' },
                  { id: 'tv_camera', label: 'TV Camera' },
                  { id: 'alpha_sensor', label: 'Alpha Sensor' }
                ].map(item => {
                  const isCollected = inventory.includes(item.id);
                  const isInstalled = installedSlots.includes(item.id);
                  return (
                    <span
                      key={item.id}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                        isInstalled
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                          : isCollected
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                          : 'bg-slate-900/80 text-slate-500 border-slate-800'
                      }`}
                    >
                      {item.label} {isInstalled ? '✓ Installed' : isCollected ? '🎒 In Pack' : '❌ Lost'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* BOTTOM-RIGHT: GTA CONTROLS REMINDER PANE                   */}
      {/* ----------------------------------------------------------- */}
      {gamePhase === 'phase4_open_world' && (
        <div className="hidden sm:block absolute bottom-6 right-6 z-20 pointer-events-none">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-semibold text-slate-300 space-y-1">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-400 font-mono">WASD</kbd>
              <span>Move Astronaut</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-400 font-mono">Shift</kbd>
              <span>Sprint / Run</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-400 font-mono">Space</kbd>
              <span>Low-Gravity Jump</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-400 font-mono">Mouse</kbd>
              <span>Orbit Camera</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400 font-mono">E</kbd>
              <span>Collect / Install</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* LOWER THIRD RADIO VOICE TRANSMISSION SUBTITLES              */}
      {/* ----------------------------------------------------------- */}
      {radioTransmission && (
        <div className="absolute bottom-24 sm:bottom-28 left-4 right-4 max-w-2xl mx-auto z-20 pointer-events-none animate-fade-in">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-sky-400/50 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-sky-400/60 p-1 flex items-center justify-center shrink-0">
              {radioTransmission.speaker === 'jaffe' ? (
                <span className="text-xl">👨‍🔬</span>
              ) : (
                <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-sky-300 uppercase">
                  {radioTransmission.title}
                </span>
                {isAudioSpeaking && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-300 font-bold animate-pulse">
                    <Volume2 className="w-3 h-3" /> Voice
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                {radioTransmission.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* PHASE 5: MISSION RESTORATION & VINTAGE 1967 LUNAR PHOTO    */}
      {/* ----------------------------------------------------------- */}
      {gamePhase === 'phase5_victory' && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md z-40 animate-fade-in pointer-events-auto">
          <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-slate-900/95 border-2 border-sky-400/60 shadow-[0_0_80px_rgba(56,189,248,0.5)] text-center">
            {/* Victory Badge Header */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 p-1 shadow-xl">
                <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src="/images/nova_alien_companion.png" alt="Leo Hero" className="w-14 h-14 object-contain drop-shadow" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="text-left">
                <span className="text-xs font-black uppercase tracking-widest text-sky-400">
                  MISSION ACCOMPLISHED • 3 STARS
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Surveyor 5 Signal Restored!
                </h2>
              </div>
            </div>

            {/* Vintage 1967 Archival NASA Photograph Display */}
            <div className="relative mx-auto my-4 rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl max-h-56 sm:max-h-64">
              <img
                src="/images/surveyor1_moon_earth.jpg"
                alt="Surveyor 5 Archival Lunar Transmission"
                className="w-full h-full object-cover filter contrast-125 brightness-95"
              />
              {/* Cathode Ray Tube Scanlines Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 4px)'
                }}
              />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono font-bold text-sky-300 bg-slate-950/80 px-3 py-1 rounded-lg backdrop-blur-md border border-sky-400/30">
                <span>NASA VIDICON TRANSMISSION • SEPT 11, 1967</span>
                <span className="text-emerald-400">MARE TRANQUILLITATIS REGOLITH</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-lg mx-auto leading-relaxed">
              All 4 subsystems have been reassembled on the spaceframe. The solar array is tracking the sun, the TV camera is streaming live panoramas, and the alpha sensor has confirmed titanium-rich basalt in Mare Tranquillitatis—proving the Moon is solid enough for Apollo 11!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                id="replay-mission-btn"
                onClick={handleReplayMission}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Mission</span>
              </button>

              <button
                id="return-hub-btn"
                onClick={() => navigate('/missions')}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg shadow-sky-500/30 active:scale-95 transition-all"
              >
                <span>Return to Mission Hub</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
