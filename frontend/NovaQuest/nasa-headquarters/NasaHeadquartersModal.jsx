import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, Building2, MousePointer2, Rocket, ScanLine, Sparkles, X } from 'lucide-react';
import NasaHeadquartersViewer from './NasaHeadquartersViewer';
import Surveyor5TaskPage from './Surveyor5TaskPage';
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
export default function NasaHeadquartersModal({ isOpen, onClose }) {
  const [taskOpen, setTaskOpen] = useState(false);
  const [collectedPartIds, setCollectedPartIds] = useState([]);
  const [cartPartIds, setCartPartIds] = useState([]);
  const [hologramConverted, setHologramConverted] = useState(false);
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    if (isOpen) setTaskOpen(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
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
  }, [isOpen, onClose, taskOpen]);

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
      gameAudio.playPowerUp();
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
    if (!hologramConverted || launched) return;
    setLaunched(true);
    gameAudio.playVictory();
    setTaskOpen(true);
  }, [hologramConverted, launched]);

  const handleOpenTask = useCallback(() => {
    gameAudio.playClick();
    setTaskOpen(true);
  }, []);

  const handleCloseTask = useCallback(() => {
    setTaskOpen(false);
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
          collectedIds={collectedPartIds}
          cartIds={cartPartIds}
          cartLimit={SURVEYOR5_CART_LIMIT}
          hologramConverted={hologramConverted}
          launched={launched}
          overlayOpen={taskOpen}
          onCollectPart={handleCollectPart}
          onDepositCart={handleDepositCart}
          onConvertHologram={handleConvertHologram}
          onLaunchMission={handleLaunchMission}
          onOpenTask={handleOpenTask}
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

          <button
            type="button"
            autoFocus
            onClick={handleClose}
            aria-label="Close NASA Headquarters"
            className="pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-[#07101d]/80 text-[#bcd0e2] backdrop-blur-md transition-colors hover:border-[#4F79FF]/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F79FF] sm:h-11 sm:w-11"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </button>
        </div>

        {/* HUD bottom bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#02060d]/95 via-[#02060d]/45 to-transparent px-4 pb-4 pt-16 sm:px-6 sm:pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4F79FF]/30 bg-[#071426]/80 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#9cd8f2] sm:text-[9px]">
                <ScanLine className="h-3 w-3 text-[#7fe3ff]" aria-hidden="true" />
                Medium-poly base
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4F79FF]/30 bg-[#071426]/80 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#9cd8f2] sm:text-[9px]">
                <Rocket className="h-3 w-3 text-[#7fe3ff]" aria-hidden="true" />
                Surveyor 5 hologram
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4F79FF]/30 bg-[#071426]/80 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#9cd8f2] sm:text-[9px]">
                <Box className="h-3 w-3 text-[#7fe3ff]" aria-hidden="true" />
                50 clickable parts
              </span>
              <span className="hidden items-center gap-1.5 rounded-full border border-[#4F79FF]/30 bg-[#071426]/80 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9cd8f2] sm:inline-flex">
                <Sparkles className="h-3 w-3 text-[#7fe3ff]" aria-hidden="true" />
                7 operator bays
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[8px] font-semibold uppercase tracking-[0.24em] text-[#8fa8bd] sm:text-[9px]">
              <span className="inline-flex items-center gap-2">
                <MousePointer2 className="h-3.5 w-3.5 text-[#7fe3ff]" aria-hidden="true" />
                Drag to orbit
              </span>
              <span className="hidden h-px w-6 bg-white/20 sm:block" aria-hidden="true" />
              <span>Scroll to zoom</span>
              <span className="hidden h-px w-6 bg-white/20 sm:block" aria-hidden="true" />
              <span className="text-[#4F79FF]">ESC to exit</span>
            </div>
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
          launched={launched}
          onClose={handleCloseTask}
        />
      </section>
    </div>,
    document.body,
  );
}
