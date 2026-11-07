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
  Zap
} from 'lucide-react';
import { createAstronautCharacter } from '../components/gameplay/three/AstronautCharacterModel';
import { createLunarOpenWorldEnvironment } from '../components/gameplay/three/LunarOpenWorldEnvironment';
import { createSpacecraftCockpit } from '../components/gameplay/three/SpacecraftCockpitModel';
import { createLaunchpadComplex, createRocketVehicle, createLaunchSmokeSystem } from '../components/gameplay/three/RocketLaunchpadModel';
import { createThirdPersonController } from '../components/gameplay/three/ThirdPersonPlayerController';
import { gameAudio } from '../config/gameAudio';
import { saveGame } from '../game/saveManager';

/**
 * Level1Surveyor5Page.jsx
 * 
 * "TIME TRAVELERS OF SPACE" — LEVEL 1: SURVEYOR 5 (THE FORGOTTEN SIGNAL)
 * 
 * Genuine 3D Open-World Space Adventure:
 * - Phase 1: Historical 1967 Launch & Lunar Landing Cinematic
 * - Phase 2: Post-Landing Malfunction & Emergency Radio Call from Dr. Leonard Jaffe
 * - Phase 3: Human Spacecraft Cockpit & Earth-to-Moon Descent
 * - Phase 4: GTA-Style Third-Person Open-World Lunar Exploration (WASD, Mouse-Look, Sprint, Jump)
 * - Phase 5: In-World Interactive Surveyor 5 Repair Challenge (Inspect -> Retrieve Coupler -> Install -> Realign Solar Array)
 */
export default function Level1Surveyor5Page() {
  const navigate = useNavigate();
  const canvasContainerRef = useRef(null);

  // --- Game Master Phase State ---
  // 'phase1_history' | 'phase2_emergency' | 'phase3_cockpit' | 'phase4_open_world' | 'phase5_victory'
  const [gamePhase, setGamePhase] = useState('phase1_history');

  // Open-World Mission Step (Phase 4 & 5)
  // 'inspect_lander' -> 'fetch_coupler' -> 'install_coupler' -> 'align_solar' -> 'completed'
  const [missionStep, setMissionStep] = useState('inspect_lander');
  const [hasCoupler, setHasCoupler] = useState(false);
  const [distanceToSurveyor, setDistanceToSurveyor] = useState(42);
  const [distanceToLander, setDistanceToLander] = useState(0);
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
  const missionStepRef = useRef(missionStep);
  missionStepRef.current = missionStep;

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

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1000);
    camera.position.set(0, 4, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // -----------------------------------------------------------
    // 1. PHASE 1 ASSETS: 1967 Launchpad & Atlas-Centaur Rocket
    // -----------------------------------------------------------
    const launchpadGroup = new THREE.Group();
    scene.add(launchpadGroup);

    const { root: launchpadComplex } = createLaunchpadComplex();
    launchpadGroup.add(launchpadComplex);

    const { root: rocketRoot, flameGroup: rocketFlame, exhaustLight: rocketLight } = createRocketVehicle();
    launchpadGroup.add(rocketRoot);

    const { particles: smokeParticles, update: updateSmoke } = createLaunchSmokeSystem(350);
    launchpadGroup.add(smokeParticles);

    // -----------------------------------------------------------
    // 2. PHASE 3 ASSETS: Human Spacecraft Cockpit
    // -----------------------------------------------------------
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

    // -----------------------------------------------------------
    // 3. PHASE 4 & 5 ASSETS: Open-World Moon & Third-Person Player
    // -----------------------------------------------------------
    const openWorldGroup = new THREE.Group();
    openWorldGroup.visible = false;
    scene.add(openWorldGroup);

    const {
      root: lunarTerrainRoot,
      update: updateLunarTerrain,
      surveyorLander,
      positions
    } = createLunarOpenWorldEnvironment();
    openWorldGroup.add(lunarTerrainRoot);

    // Astronaut Hero Leo (Our approved cute alien astronaut)
    const astronautHero = createAstronautCharacter({ scale: 0.85 });
    astronautHero.position.copy(positions.humanLander);
    openWorldGroup.add(astronautHero);

    // Third-person controller
    const controller = createThirdPersonController({
      characterMesh: astronautHero,
      camera,
      domElement: container,
      groundY: 0,
      onFootstep: () => gameAudio.playFootstep()
    });

    // -----------------------------------------------------------
    // TIMELINE & LOGIC ORCHESTRATION
    // -----------------------------------------------------------
    let startTime = performance.now();
    let prevTime = startTime;
    let rocketY = 0;
    let rocketVel = 0;
    let phaseTimer = 0;

    // Start Phase 1 narration
    setTimeout(() => {
      playRadioMessage(
        'narrator',
        'NASA Cape Canaveral • September 8, 1967',
        'Cape Canaveral, 1967. NASA engineers prepare the Atlas-Centaur rocket. Surveyor 5 must land on the Moon to pave the way for humanity.'
      );
    }, 1200);

    // Phase 1 Launch Ignition at 6s
    setTimeout(() => {
      gameAudio.playThruster(5.0);
    }, 6000);

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
      // PHASE 1: HISTORICAL LAUNCH CINEMATIC
      // =========================================================
      if (curPhase === 'phase1_history') {
        launchpadGroup.visible = true;
        cockpitGroup.visible = false;
        openWorldGroup.visible = false;

        if (phaseTimer > 5.8) {
          rocketFlame.visible = true;
          rocketLight.intensity = 4.0 + Math.random() * 2.0;
          updateSmoke(delta, phaseTimer < 11.0);

          if (phaseTimer > 6.8) {
            rocketVel += 9.5 * delta;
            rocketY += rocketVel * delta;
            rocketRoot.position.y = rocketY;

            camera.position.set(-6, 16 + rocketY * 0.7, 18 + rocketY * 0.2);
            camera.lookAt(0, 14 + rocketY, 0);
          }
        } else {
          camera.position.set(-4, 18, 14);
          camera.lookAt(0, 14, 0);
        }

        // Transition to Phase 2 Emergency at 14s
        if (phaseTimer >= 14.0) {
          setGamePhase('phase2_emergency');
          phaseTimer = 0;
          gameAudio.playAlarm();
          playRadioMessage(
            'jaffe',
            'Dr. Leonard Jaffe • NASA Project Scientist',
            "Leo! We have an emergency! Surveyor 5 is no longer transmitting properly from the Sea of Tranquility. We need someone to investigate the lander. You're our only hope!"
          );
        }
      }

      // =========================================================
      // PHASE 2: EMERGENCY STORY (Alert screen / Mission briefing)
      // =========================================================
      else if (curPhase === 'phase2_emergency') {
        launchpadGroup.visible = false;
        cockpitGroup.visible = true;
        openWorldGroup.visible = false;

        // Cockpit idle glow
        updateCockpit(delta, elapsed, false);
        camera.position.set(0, 1.4, 0);
        camera.lookAt(0, 1.2, -4);
      }

      // =========================================================
      // PHASE 3: COCKPIT FLIGHT & LUNAR LANDING
      // =========================================================
      else if (curPhase === 'phase3_cockpit') {
        launchpadGroup.visible = false;
        cockpitGroup.visible = true;
        openWorldGroup.visible = false;

        updateCockpit(delta, elapsed, true);

        // Flight descent telemetry
        setFlightAltitude(prev => Math.max(0, Math.round(prev - 12 * delta)));
        setFlightVelocity(prev => Math.max(12, Math.round(prev - 210 * delta)));
        setIsEngineBurning(true);

        // Scale approaching Moon through windshield
        cockpitMoon.scale.addScalar(0.08 * delta);
        cockpitMoon.rotation.y += 0.04 * delta;

        camera.position.set(
          Math.sin(elapsed * 25) * 0.012,
          1.4 + Math.sin(elapsed * 20) * 0.015,
          Math.cos(elapsed * 22) * 0.01
        );
        camera.lookAt(0, 1.2, -4);

        // Touchdown at ~9 seconds of descent
        if (phaseTimer >= 8.5) {
          gameAudio.playThruster(1.5);
          setGamePhase('phase4_open_world');
          phaseTimer = 0;
          // Spawn Leo at Human Lander
          controller.setPosition(positions.humanLander.x - 1.5, 0, positions.humanLander.z + 1.2);
          playRadioMessage(
            'jaffe',
            'Dr. Leonard Jaffe • Mission Control',
            "Touchdown confirmed in Mare Tranquillitatis! Leo, locate Surveyor 5 in the crater ahead and inspect its power failure!"
          );
        }
      }

      // =========================================================
      // PHASE 4 & 5: OPEN-WORLD EXPLORATION & SURVEYOR 5 REPAIR
      // =========================================================
      else if (curPhase === 'phase4_open_world' || curPhase === 'phase5_victory') {
        launchpadGroup.visible = false;
        cockpitGroup.visible = false;
        openWorldGroup.visible = true;

        // Update player controller (WASD + mouse look)
        controller.update(delta, elapsed);

        // Update lunar world (sparks, earth spin, surveyor animations)
        updateLunarTerrain(delta, elapsed);

        // Distance & Bearing calculations
        const pPos = controller.pos;
        const dSurv = pPos.distanceTo(positions.surveyor5);
        const dLand = pPos.distanceTo(positions.cargoCrate);
        setDistanceToSurveyor(dSurv.toFixed(1));
        setDistanceToLander(dLand.toFixed(1));

        // Calculate compass bearing to current objective
        const curTarget = (missionStepRef.current === 'fetch_coupler') ? positions.cargoCrate : positions.surveyor5;
        const dx = curTarget.x - pPos.x;
        const dz = curTarget.z - pPos.z;
        const targetAngle = Math.atan2(dx, dz) * (180 / Math.PI);
        setCompassBearing(Math.round(targetAngle));

        // Sync Leo tool visual
        astronautHero.userData.anim.hasCoupler = hasCoupler;

        // -------------------------------------------------------
        // In-World 3D Interaction Logic & Floating Prompts
        // -------------------------------------------------------
        const curStep = missionStepRef.current;

        // Step 1: Inspect Surveyor 5
        if (curStep === 'inspect_lander') {
          if (dSurv <= 3.6) {
            setInteractionPrompt({
              text: 'Press [E] to Inspect Damaged Power System',
              action: () => {
                gameAudio.playScanner();
                astronautHero.userData.anim.state = 'repair';
                setMissionStep('fetch_coupler');
                playRadioMessage(
                  'jaffe',
                  'Dr. Leonard Jaffe • Mission Control',
                  "Diagnosis confirmed: the main solar power coupler is fried! Head back to your lander's cargo bay and retrieve a replacement coupler!"
                );
              }
            });
          } else {
            setInteractionPrompt(null);
          }
        }

        // Step 2: Retrieve Solar Coupler from Cargo Crate on Lander
        else if (curStep === 'fetch_coupler') {
          if (dLand <= 3.2) {
            setInteractionPrompt({
              text: 'Press [E] to Retrieve Solar Coupler & Calibration Tool',
              action: () => {
                gameAudio.playSuccess();
                setHasCoupler(true);
                setMissionStep('install_coupler');
                playRadioMessage(
                  'jaffe',
                  'Dr. Leonard Jaffe • Mission Control',
                  "Solar coupler secured! Now rush back to Surveyor 5 and install it into the power junction box!"
                );
              }
            });
          } else {
            setInteractionPrompt(null);
          }
        }

        // Step 3: Install Solar Coupler onto Surveyor 5
        else if (curStep === 'install_coupler') {
          if (dSurv <= 3.6) {
            setInteractionPrompt({
              text: 'Press [E] to Install Replacement Solar Coupler',
              action: () => {
                gameAudio.playRepairSparks();
                astronautHero.userData.anim.state = 'repair';
                surveyorLander.setRepaired(true);
                setMissionStep('align_solar');
                playRadioMessage(
                  'jaffe',
                  'Dr. Leonard Jaffe • Mission Control',
                  "Coupler installed! Current is flowing, but the solar panel is unaligned. Realign the solar array to catch the sunlight!"
                );
              }
            });
          } else {
            setInteractionPrompt(null);
          }
        }

        // Step 4: Realign Solar Panel to Sun
        else if (curStep === 'align_solar') {
          if (dSurv <= 3.6) {
            setInteractionPrompt({
              text: 'Press [E] to Realign Solar Array to Sun',
              action: () => {
                gameAudio.playPowerUp();
                surveyorLander.setSolarAligned(true);
                astronautHero.userData.anim.state = 'victory';
                setMissionStep('completed');
                setGamePhase('phase5_victory');
                setInteractionPrompt(null);

                // Victory radio broadcast from Dr. Jaffe
                setTimeout(() => {
                  gameAudio.playVictory();
                  playRadioMessage(
                    'jaffe',
                    'Dr. Leonard Jaffe • Mission Control',
                    "Signal restored! Telemetry is back online! Surveyor 5 is sending pictures back to Earth! Outstanding work, Leo!",
                    () => {
                      // Save progress
                      try {
                        saveGame({
                          currentChapter: 'surveyor_5_repaired',
                          badges: ['Lunar Pioneer Badge'],
                          stars: 3,
                          level1Completed: true
                        });
                      } catch (e) {}
                    }
                  );
                }, 1200);
              }
            });
          } else {
            setInteractionPrompt(null);
          }
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
    setGamePhase('phase1_history');
    setMissionStep('inspect_lander');
    setHasCoupler(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Master 3D Viewport */}
      <div ref={canvasContainerRef} className="w-full h-full cursor-crosshair" />

      {/* ----------------------------------------------------------- */}
      {/* TOP HUD BAR: Mission Status, Compass Radar, Skip Controls */}
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
              Surveyor 5 — The Forgotten Signal
            </h1>
          </div>
        </div>

        {/* Center: 3D Compass Nav Radar (Open-World Only) */}
        {gamePhase === 'phase4_open_world' && (
          <div className="hidden md:flex items-center gap-4 px-5 py-2 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-slate-700/80 shadow-2xl">
            <Compass className="w-4 h-4 text-amber-400 animate-spin" />
            <div className="flex items-center gap-5 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-amber-300">
                <span>📡 Surveyor 5:</span>
                <span className="text-white font-mono">{distanceToSurveyor}m</span>
              </div>
              <div className="w-px h-4 bg-slate-700" />
              <div className="flex items-center gap-1.5 text-sky-300">
                <span>🚀 Human Lander:</span>
                <span className="text-white font-mono">{distanceToLander}m</span>
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
      {/* PHASE 2 OVERLAY: EMERGENCY ALERT & LAUNCH BRIEFING         */}
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
              Surveyor 5 Signal Lost!
            </h2>

            <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
              Dr. Leonard Jaffe has confirmed that Surveyor 5 suffered a critical electrical failure shortly after touching down. You must pilot the rescue lander to the Sea of Tranquility and fix the spacecraft!
            </p>

            <button
              id="enter-spacecraft-btn"
              onClick={handleStartCockpitMission}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-sky-600 hover:from-red-500 hover:to-sky-500 text-white font-extrabold text-base shadow-xl shadow-red-500/25 active:scale-95 transition-all"
            >
              <Rocket className="w-5 h-5" />
              <span>Enter Human Spacecraft & Launch to Moon</span>
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
      {/* BOTTOM-LEFT: CURRENT OBJECTIVE CARD (Phase 4 Open-World)   */}
      {/* ----------------------------------------------------------- */}
      {gamePhase === 'phase4_open_world' && (
        <div className="absolute bottom-6 left-4 sm:left-6 max-w-sm sm:max-w-md z-20 pointer-events-none">
          <div className="p-4 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-sky-400/40 shadow-2xl flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-900/40 border border-sky-400/50 p-1 flex items-center justify-center shrink-0">
              <img src="/images/nova_alien_companion.png" alt="Leo Hero" className="w-10 h-10 object-contain drop-shadow" />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
                Current Objective
              </span>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug">
                {missionStep === 'inspect_lander' && `1. Locate and inspect Surveyor 5 in the crater (${distanceToSurveyor}m)`}
                {missionStep === 'fetch_coupler' && `2. Retrieve Solar Coupler from Human Lander cargo bay (${distanceToLander}m)`}
                {missionStep === 'install_coupler' && `3. Return to Surveyor 5 and install the Coupler (${distanceToSurveyor}m)`}
                {missionStep === 'align_solar' && `4. Realign Surveyor 5's Solar Array to the Sun`}
                {missionStep === 'completed' && `Mission Complete! Power and telemetry restored!`}
              </p>
              {hasCoupler && (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-semibold mt-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Solar Coupler Equipped
                </span>
              )}
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
              <span>Orbit Camera (Click to look)</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400 font-mono">E</kbd>
              <span>Interact in 3D</span>
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
      {/* PHASE 5: MISSION VICTORY CELEBRATION MODAL                 */}
      {/* ----------------------------------------------------------- */}
      {gamePhase === 'phase5_victory' && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md z-40 animate-fade-in pointer-events-auto">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-slate-900/95 border-2 border-sky-400/60 shadow-[0_0_80px_rgba(56,189,248,0.5)] text-center">
            {/* Victory Badge */}
            <div className="relative mx-auto w-24 h-24 mb-5">
              <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 p-1.5 shadow-xl ring-4 ring-sky-300/60">
                <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src="/images/nova_alien_companion.png" alt="Leo Hero" className="w-20 h-20 object-contain drop-shadow" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-sky-400">
              MISSION ACCOMPLISHED • 3 STARS
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-2">
              Surveyor 5 Signal Restored!
            </h2>

            <p className="text-sm text-slate-300 mb-6 max-w-md mx-auto leading-relaxed">
              You repaired the damaged power coupling, realigned the solar array, and re-established contact with NASA Headquarters 1967. Over 19,000 historic lunar photographs are now safely transmitting!
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
