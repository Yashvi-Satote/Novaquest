import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Building2, Layers, X } from 'lucide-react';
import NasaHeadquartersViewer from './NasaHeadquartersViewer';
import Surveyor5TaskPage from './Surveyor5TaskPage';
import Surveyor5Task2Page from './Surveyor5Task2Page';
import Surveyor5UnlockedModal from './Surveyor5UnlockedModal';
import LaunchCinematic from './LaunchCinematic';
import HeliumEmergency from './HeliumEmergency';
import Task3 from './Task3';
import MissionSuccessModal from '../../src/components/launch/MissionSuccessModal';
import { SURVEYOR5_CART_LIMIT, SURVEYOR5_MANIFEST_IDS } from './surveyor5Mission';
import { gameAudio } from '../config/gameAudio';

/**
 * NasaHeadquartersModal
 *
 * Immersive full-screen view of the 3D NASA Headquarters base. Opened from the
 * Level 1: The Moon hub, and reusable anywhere else in the game.
 *
 * Entry always opens the Surveyor 5 task page, then hands control to the 3D
 * base where the player collects the manifest, materialises the hologram and
 * launches the lander from the firing room.
 */
export default function NasaHeadquartersModal({ isOpen, onClose, onSoilAnalysis, onMissionSuccess }) {
  const viewerRef = useRef(null);
  const [taskOpen, setTaskOpen] = useState(false);
  const [task2Open, setTask2Open] = useState(false);
  const [collectedPartIds, setCollectedPartIds] = useState([]);
  const [cartPartIds, setCartPartIds] = useState([]);
  const [hologramConverted, setHologramConverted] = useState(false);
  const [hologramDisappeared, setHologramDisappeared] = useState(false);
  const [launchUnlocked, setLaunchUnlocked] = useState(false);
  const [launchReady, setLaunchReady] = useState(false);
  const [task3Solved, setTask3Solved] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);
  const [cinematicOpen, setCinematicOpen] = useState(false);
  const [task3Open, setTask3Open] = useState(false);
  const [score, setScore] = useState(100);
  const [missionSolved, setMissionSolved] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [unlockedModalOpen, setUnlockedModalOpen] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  useEffect(() => {
    if (isOpen) setTaskOpen(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      // Block key 3 strictly to prevent any auto-complete or mission bypass
      if (event.key === '3' || event.code === 'Digit3' || event.code === 'Numpad3') {
        event.preventDefault();
        return;
      }
      if (event.key !== 'Escape') return;
      if (task3Open) {
        setTask3Open(false);
        return;
      }
      if (missionComplete) {
        setMissionComplete(false);
        return;
      }
      if (cinematicOpen) {
        return; // skip-less Part 1 playback
      }
      if (task2Open) {
        gameAudio.playClick();
        setTask2Open(false);
        return;
      }
      if (taskOpen) {
        gameAudio.playClick();
        setTaskOpen(false);
        return;
      }
      gameAudio.playClick();
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, taskOpen, task2Open, cinematicOpen, task3Open, missionComplete]);

  const handleCollectPart = useCallback(
    (component) => {
      if (!component?.id) return;
      if (collectedPartIds.includes(component.id) || cartPartIds.includes(component.id)) return;
      if (cartPartIds.length >= SURVEYOR5_CART_LIMIT) return;
      setCartPartIds((current) =>
        current.includes(component.id) || current.length >= SURVEYOR5_CART_LIMIT
          ? current
          : [...current, component.id],
      );
      gameAudio.playPickup();
    },
    [cartPartIds, collectedPartIds],
  );

  /**
   * Assemble the cart at the hologram. Correct manifest parts are installed
   * (crossed off the list); anything that does not belong on Surveyor 5 is
   * rejected and returned to the storage room shelves. Returns a detailed
   * summary so the viewer can display the verification report.
   */
  const handleDepositCart = useCallback(() => {
    if (cartPartIds.length === 0) {
      return {
        deposited: 0,
        installed: 0,
        rejected: 0,
        installedIds: [],
        rejectedIds: [],
        manifestComplete: false,
      };
    }

    const manifestSet = new Set(SURVEYOR5_MANIFEST_IDS);
    const installedIds = cartPartIds.filter(
      (id) => manifestSet.has(id) && !collectedPartIds.includes(id),
    );
    const rejectedIds = cartPartIds.filter((id) => !manifestSet.has(id));
    const merged = [...collectedPartIds, ...installedIds];
    const manifestComplete = SURVEYOR5_MANIFEST_IDS.every((id) => merged.includes(id));

    setCollectedPartIds(merged);
    setCartPartIds([]);

    if (manifestComplete) {
      setHologramConverted(true);
      setUnlockedModalOpen(true);
      gameAudio.playVictory();
    } else if (installedIds.length > 0) {
      gameAudio.playPickup();
    } else {
      gameAudio.playClick();
    }

    return {
      deposited: cartPartIds.length,
      installed: installedIds.length,
      rejected: rejectedIds.length,
      installedIds,
      rejectedIds,
      manifestComplete,
    };
  }, [cartPartIds, collectedPartIds]);

  const handleConvertHologram = useCallback(() => {
    if (!SURVEYOR5_MANIFEST_IDS.every((id) => collectedPartIds.includes(id))) return;
    setHologramConverted(true);
    gameAudio.playPowerUp();
  }, [collectedPartIds]);

  const handleLaunchMission = useCallback(() => {
    if (!missionSolved || !hologramConverted || launched) return;
    setLaunched(true);
    gameAudio.playVictory();
    // Do NOT reopen Task 1 — the launch video on the 3D screen is the experience now
  }, [hologramConverted, launched, missionSolved]);

  const handleSolveMission = useCallback(() => {
    if (!hologramConverted || missionSolved) return;
    setMissionSolved(true);
    setTaskOpen(false); // close Task 1 page once mission is solved — Task 2 takes over
    gameAudio.playVictory();
  }, [hologramConverted, missionSolved]);

  const handleAutoCompleteTask = useCallback(() => {
    // Auto-complete strictly disabled - mission requires manual objective completion
  }, []);

  const handleUnlockLaunch = useCallback(() => {
    setUnlockedModalOpen(false);
    setMissionSolved(true);
    setLaunchUnlocked(true);
    setHologramDisappeared(true);
    setTaskOpen(false); // Task 1 completed upon unlock launch click
    gameAudio.playPowerUp();
    // Play Part 1 full-screen cinematic overlay
    setCinematicOpen(true);
  }, []);

  const handleCinematicComplete = useCallback(() => {
    setCinematicOpen(false);
    setLaunchReady(true);
    // Task 1 completed, replace with Task 2:
    setTaskOpen(false);
    setTask2Open(true);
    viewerRef.current?.showMissionToast?.(
      'Liftoff is minutes away. Head to the Firing Room at the end of the corridor.',
      'info',
    );
  }, []);

  const handleEmergencyTriggered = useCallback(() => {
    // Task 2 is completed as soon as emergency task 3 starts!
    setTask2Open(false);
    setTaskOpen(false);
    setIsEmergency(true);
    setTask3Open(true);
  }, []);

  const handleSolveTask3 = useCallback(() => {
    setTask3Solved(true);
    setIsEmergency(false);
    setTask3Open(false);
    viewerRef.current?.resolveEmergency?.();
  }, []);

  const handleMissionComplete = useCallback(() => {
    setLaunched(true);
    setMissionComplete(true);
    // Close all task pages so only the success modal shows
    setTaskOpen(false);
    setTask2Open(false);
    setTask3Open(false);
  }, []);

  const handleEmergencyResolved = useCallback(() => {
    handleSolveTask3();
  }, [handleSolveTask3]);

  const handleOpenTask = useCallback(() => {
    gameAudio.playClick();
    if (isEmergency || task3Open) {
      setTask3Open(true);
    } else if (launchUnlocked || launchReady) {
      setTask2Open(true);
    } else {
      setTaskOpen(true);
    }
  }, [isEmergency, task3Open, launchUnlocked, launchReady]);

  const handleCloseTask = useCallback(() => {
    setTaskOpen(false);
  }, []);

  const handleOpenTask2 = useCallback(() => {
    gameAudio.playClick();
    setTask2Open(true);
  }, []);

  const handleCloseTask2 = useCallback(() => {
    setTask2Open(false);
  }, []);

  const handleTeleportToFiringRoom = useCallback(() => {
    viewerRef.current?.teleportToFiringRoom?.();
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    gameAudio.playClick();
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex bg-[#02060d]/95 p-2 backdrop-blur-md sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="NASA Headquarters 3D mission control base"
        className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#3D6BFF]/35 bg-[#040911] shadow-[0_0_80px_rgba(28,88,255,0.22)]"
      >
        <NasaHeadquartersViewer
          ref={viewerRef}
          collectedIds={collectedPartIds}
          cartIds={cartPartIds}
          cartLimit={SURVEYOR5_CART_LIMIT}
          hologramConverted={hologramConverted}
          hologramDisappeared={hologramDisappeared}
          launchUnlocked={launchUnlocked}
          launchReady={launchReady}
          task3Solved={task3Solved}
          missionSolved={missionSolved}
          launched={launched}
          overlayOpen={taskOpen || unlockedModalOpen || task2Open || cinematicOpen || task3Open || missionComplete}
          onCollectPart={handleCollectPart}
          onDepositCart={handleDepositCart}
          onConvertHologram={handleConvertHologram}
          onLaunchMission={handleLaunchMission}
          onOpenTask={handleOpenTask}
          onOpenTask2={handleOpenTask2}
          onOpenTask3={() => setTask3Open(true)}
          onMissionComplete={handleMissionComplete}
          onTeleportToFiringRoom={handleTeleportToFiringRoom}
          onAutoCompleteTask={handleAutoCompleteTask}
          onEmergencyTriggered={handleEmergencyTriggered}
        />

        {/* Cinematic vignette + scan lines over the live 3D feed. */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(circle at 50% 46%, rgba(4,9,17,0) 34%, rgba(4,9,17,0.38) 74%, rgba(2,6,13,0.88) 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.035]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, #8de8ff 2px, #8de8ff 3px)',
          }}
        />

        {/* HUD top bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 bg-gradient-to-b from-[#02060d]/90 via-[#02060d]/40 to-transparent p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#4F79FF]/45 bg-[#0b1730]/80 text-[#8ce5ff] shadow-[0_0_24px_rgba(61,107,255,0.28)] sm:h-14 sm:w-14">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="cinematic-ui text-[8px] font-semibold uppercase tracking-[0.3em] text-[#4F79FF] sm:text-[9px]">
                  Level 1 · The Moon
                </span>
                <span className="hidden h-px w-6 bg-[#3D6BFF]/70 sm:block" aria-hidden="true" />
                <span className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.24em] text-[#79d9f5] sm:text-[9px]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#63e2ff] opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#63e2ff]" />
                  </span>
                  Live 3D
                </span>
              </div>
              <h2 className="cinematic-display text-xl leading-tight tracking-[0.12em] text-white sm:text-3xl sm:tracking-[0.18em] lg:text-4xl">
                NASA HEADQUARTERS
              </h2>
              <p className="mt-1.5 max-w-md text-[9px] font-medium uppercase tracking-[0.2em] text-[#9fb6cc] sm:text-[10px] sm:tracking-[0.24em]">
                Mission Control Complex · Washington, D.C.
              </p>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                gameAudio.playClick();
                setMissionComplete(false);
                onClose();
                onSoilAnalysis?.();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-cyan-400/60 bg-gradient-to-r from-cyan-950/90 to-blue-950/90 text-cyan-200 text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:border-cyan-300 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Return to Moon to perform Soil Analysis"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">Return to Moon · Soil Analysis</span>
              <span className="sm:hidden">Soil Analysis</span>
            </button>

            <button
              type="button"
              autoFocus
              onClick={handleClose}
              aria-label="Close NASA Headquarters"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-[#07101d]/80 text-[#bcd0e2] backdrop-blur-md transition-colors hover:border-[#4F79FF]/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F79FF] sm:h-11 sm:w-11"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Framing brackets keep the viewport feeling like a mission feed. */}
        <div className="pointer-events-none absolute inset-3 z-20 hidden sm:block" aria-hidden="true">
          <span className="absolute left-0 top-0 h-8 w-8 border-l border-t border-[#4F79FF]/35" />
          <span className="absolute right-0 top-0 h-8 w-8 border-r border-t border-[#4F79FF]/35" />
          <span className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-[#4F79FF]/35" />
          <span className="absolute bottom-0 right-0 h-8 w-8 border-b border-r border-[#4F79FF]/35" />
        </div>

        <Surveyor5TaskPage
          isOpen={taskOpen}
          collectedIds={collectedPartIds}
          cartIds={cartPartIds}
          cartLimit={SURVEYOR5_CART_LIMIT}
          hologramConverted={hologramConverted}
          missionSolved={missionSolved}
          launched={launched}
          onSolvedMission={handleSolveMission}
          onAutoCompleteTask={handleAutoCompleteTask}
          onClose={handleCloseTask}
        />

        <Surveyor5UnlockedModal
          isOpen={unlockedModalOpen}
          onUnlockLaunch={handleUnlockLaunch}
        />

        {/* Part 1 Full-screen Cinematic Overlay */}
        <LaunchCinematic
          isOpen={cinematicOpen}
          onComplete={handleCinematicComplete}
        />

        {/* Emergency Anomaly Red HUD alert & Siren */}
        <HeliumEmergency
          isActive={isEmergency}
          onOpenTask3={() => setTask3Open(true)}
        />

        {/* Task 3: Helium Emergency Kid-Friendly Solution Challenge */}
        <Task3
          isOpen={task3Open}
          score={score}
          onDeductScore={(amount) => setScore((s) => Math.max(0, s - amount))}
          onSolve={handleSolveTask3}
          onClose={() => setTask3Open(false)}
        />

        {/* Mission Complete Success Screen */}
        <MissionSuccessModal
          isOpen={missionComplete}
          score={score}
          onClose={() => {
            setMissionComplete(false);
            onClose();
            onMissionSuccess?.();
            onSoilAnalysis?.();
          }}
          onSoilAnalysis={() => {
            setMissionComplete(false);
            onClose();
            onMissionSuccess?.();
            onSoilAnalysis?.();
          }}
          onReturnHub={() => {
            setMissionComplete(false);
            onClose();
            onMissionSuccess?.();
          }}
        />

        <Surveyor5Task2Page
          isOpen={task2Open}
          isEmergency={isEmergency}
          onEmergencyResolved={handleEmergencyResolved}
          onClose={handleCloseTask2}
          onTeleportToFiringRoom={handleTeleportToFiringRoom}
          onLaunchCompleted={() => setLaunched(true)}
        />
      </section>
    </div>,
    document.body,
  );
}
