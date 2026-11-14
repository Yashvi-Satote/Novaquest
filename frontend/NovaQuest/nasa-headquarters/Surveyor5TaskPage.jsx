import React, { useState, useEffect } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleDashed,
  ListChecks,
  Package,
  PackageCheck,
  Rocket,
  ScanLine,
  ShoppingCart,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { gameAudio } from '../config/gameAudio';
import {
  SURVEYOR5_CART_LIMIT,
  SURVEYOR5_MANIFEST,
  SURVEYOR5_MANIFEST_TOTAL,
} from './surveyor5Mission';
import { STORAGE_ROOM_COMPONENTS } from './storageRoomComponents';

const FRAME_CLIP =
  'polygon(0 52px, 52px 0, calc(50% - 168px) 0, calc(50% - 146px) 18px, calc(50% + 146px) 18px, calc(50% + 168px) 0, calc(100% - 52px) 0, 100% 52px, 100% calc(100% - 52px), calc(100% - 52px) 100%, calc(50% + 168px) 100%, calc(50% + 146px) calc(100% - 18px), calc(50% - 146px) calc(100% - 18px), calc(50% - 168px) 100%, 52px 100%, 0 calc(100% - 52px))';

function SurveyorSchematic({ active }) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 340 210"
      fill="none"
      aria-hidden="true"
      style={{ filter: active ? 'drop-shadow(0 0 10px rgba(125, 235, 255, 0.45))' : 'none' }}
    >
      <g stroke="#7fe3ff" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
        {/* triangular spaceframe */}
        <path d="M170 54 L214 92 L126 92 Z" strokeWidth="1.6" />
        <path d="M170 64 L200 90 L140 90 Z" strokeWidth="0.9" opacity="0.55" />
        <path d="M146 74 L194 74 M158 64 L182 64" strokeWidth="0.7" opacity="0.5" />
        {/* solar array */}
        <path d="M136 48 L204 48 L209 58 L131 58 Z" strokeWidth="1.4" />
        <path d="M148 48 V58 M160 48 V58 M172 48 V58 M184 48 V58 M196 48 V58" strokeWidth="0.7" opacity="0.7" />
        <path d="M131 58 L209 58" strokeWidth="0.7" opacity="0.5" />
        {/* mast and television camera */}
        <path d="M178 48 V28 M178 28 L186 24 L194 28 L194 38 L186 42 L178 38 Z" strokeWidth="1.2" />
        <path d="M194 33 L202 33" strokeWidth="1.1" />
        {/* high-gain antenna */}
        <path d="M126 64 L110 40 M110 40 L98 34 L104 24 L118 28 Z" strokeWidth="1.1" />
        <path d="M104 24 L98 34" strokeWidth="0.7" />
        {/* central body, tanks and retro nozzle */}
        <path d="M144 92 L196 92 L190 112 L150 112 Z" strokeWidth="1.3" />
        <circle cx="170" cy="101" r="8" strokeWidth="1" opacity="0.8" />
        <path d="M170 112 L162 128 M170 112 L178 128 M170 112 V132" strokeWidth="1.2" />
        <path d="M162 128 L178 128 L174 136 L166 136 Z" strokeWidth="0.9" opacity="0.7" />
        {/* landing legs */}
        <path d="M144 92 L112 144 L104 150" strokeWidth="1.5" />
        <path d="M196 92 L228 144 L236 150" strokeWidth="1.5" />
        <path d="M170 112 L170 152" strokeWidth="1.5" />
        <path d="M104 150 L92 154 M236 150 L248 154 M170 152 L158 156 M170 152 L182 156" strokeWidth="1.8" />
        <path d="M112 137 L130 137 M228 137 L210 137" strokeWidth="0.8" opacity="0.65" />
        {/* alpha-scattering instrument on its tether */}
        <path d="M192 108 L218 128 L222 142 L214 148 L202 142 L200 130" strokeWidth="0.9" opacity="0.8" strokeDasharray="2 3" />
        <rect x="200" y="140" width="15" height="12" strokeWidth="1" />
      </g>
      {/* scan reticle */}
      <g stroke="#9ceeff" opacity="0.4">
        <path d="M42 42 H58 M42 42 V58" strokeWidth="1.2" />
        <path d="M298 42 H282 M298 42 V58" strokeWidth="1.2" />
        <path d="M42 168 H58 M42 168 V152" strokeWidth="1.2" />
        <path d="M298 168 H282 M298 168 V152" strokeWidth="1.2" />
      </g>
      <g fill="#9ceeff" opacity="0.7">
        <circle cx="42" cy="105" r="2.2" />
        <circle cx="298" cy="105" r="2.2" />
        <circle cx="170" cy="184" r="1.6" />
      </g>
    </svg>
  );
}

function MissionStep({ index, title, body, state, icon: Icon }) {
  const isActive = state === 'active';
  const isComplete = state === 'complete';

  return (
    <div
      className={`relative flex items-start gap-3 rounded-lg border px-3 py-3 transition-colors ${
        isActive
          ? 'border-[#7fe3ff]/70 bg-[#7fe3ff]/10'
          : isComplete
            ? 'border-[#5ee7ff]/35 bg-[#5ee7ff]/[0.06]'
            : 'border-[#3974a8]/30 bg-[#031326]/55'
      }`}
    >
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${
          isActive
            ? 'border-[#7fe3ff]/80 bg-[#7fe3ff]/15 text-[#baf4ff]'
            : isComplete
              ? 'border-[#5ee7ff]/50 bg-[#5ee7ff]/10 text-[#7fe3ff]'
              : 'border-[#3974a8]/40 bg-[#061a2e] text-[#70a9c9]'
        }`}
      >
        {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.24em] text-[#6fbbd8]">
          <span>Phase 0{index}</span>
          {isActive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7fe3ff]" />}
          {isComplete && <span className="text-[#5ee7ff]">Complete</span>}
        </p>
        <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#e6fbff]">
          {title}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-[#94b8cd]">{body}</p>
      </div>
    </div>
  );
}

/**
 * Surveyor5TaskPage
 *
 * Holographic mission task page shown as soon as the player enters the NASA
 * Headquarters base. It tracks the three-step Surveyor 5 build mission in real
 * time and doubles as the player's in-world objective checklist.
 */
export default function Surveyor5TaskPage({
  isOpen,
  collectedIds = [],
  cartIds = [],
  cartLimit = SURVEYOR5_CART_LIMIT,
  hologramConverted = false,
  missionSolved = false,
  launched = false,
  onSolvedMission,
  onAutoCompleteTask,
  onClose,
}) {
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleTaskKeyDown = (e) => {
      if (e.key === '3' || e.code === 'Digit3' || e.code === 'Numpad3') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleTaskKeyDown, true);
    return () => window.removeEventListener('keydown', handleTaskKeyDown, true);
  }, [isOpen]);

  if (!isOpen) return null;

  const installed = new Set(collectedIds);
  const inCart = new Set(cartIds);
  const manifestById = new Map(SURVEYOR5_MANIFEST.map((part) => [part.id, part]));
  const componentById = new Map(STORAGE_ROOM_COMPONENTS.map((part) => [part.id, part]));
  const installedCount = SURVEYOR5_MANIFEST.filter((part) => installed.has(part.id)).length;
  const cartCount = cartIds.length;
  const cartIsFull = cartCount >= cartLimit;
  const cartManifestCount = cartIds.filter((id) => manifestById.has(id)).length;
  const allInstalled = installedCount >= SURVEYOR5_MANIFEST_TOTAL;
  const remainingToInstall = SURVEYOR5_MANIFEST_TOTAL - installedCount;
  const remainingToCollect = Math.max(0, remainingToInstall - cartManifestCount);
  const progress = Math.round((installedCount / Math.max(1, SURVEYOR5_MANIFEST_TOTAL)) * 100);

  const stageStates = [
    allInstalled ? 'complete' : 'active',
    !allInstalled ? 'locked' : hologramConverted ? 'complete' : 'active',
    !missionSolved ? 'locked' : launched ? 'complete' : 'active',
  ];

  const handleClose = () => {
    gameAudio.playClick();
    onClose?.();
  };

  const handleToggleList = () => {
    gameAudio.playClick();
    setShowList((current) => !current);
  };

  const primaryLabel = launched
    ? 'Close mission feed'
    : hologramConverted && !missionSolved
      ? 'Solved Mission'
      : missionSolved
        ? 'Return to headquarters'
        : allInstalled
          ? 'Return to the hologram'
          : cartIsFull
            ? 'Return to the hologram'
            : cartCount > 0
              ? 'Continue the search'
              : 'Begin the search';
  const primaryHint = launched
    ? 'Mission complete'
    : hologramConverted && !missionSolved
      ? 'Spacecraft complete — begin the launch phase'
      : missionSolved
        ? 'Launch phase active — reach the firing room'
        : allInstalled
          ? 'Manifest complete — materialise the lander'
          : cartIsFull
            ? `Cart full — unload ${cartLimit} parts at the hologram`
            : cartCount > 0
              ? `${cartCount} / ${cartLimit} in cart · ${remainingToCollect} parts still missing`
              : 'Storage room · mid-corridor';

  return (
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center overflow-hidden bg-[#01050f]/92 p-2 backdrop-blur-md sm:p-5 lg:p-8"
      role="presentation"
    >
      {/* Deep-space ambience behind the holo frame. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(24, 89, 173, 0.32) 0%, rgba(3, 12, 30, 0.25) 42%, rgba(1, 5, 15, 0.9) 100%)',
        }}
      />

      <div className="relative flex h-full max-h-[960px] w-full max-w-[1440px] animate-fade-in">
        {/* Outer neon frame with the notched reference silhouette. */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: FRAME_CLIP,
            background:
              'linear-gradient(135deg, #8ceaff 0%, #2f7bff 18%, #0b2e63 45%, #123f8a 72%, #5fc9ff 100%)',
            filter: 'drop-shadow(0 0 22px rgba(47, 123, 255, 0.38))',
          }}
        />
        <div
          className="absolute inset-[2px]"
          style={{
            clipPath: FRAME_CLIP,
            background:
              'radial-gradient(circle at 50% 0%, rgba(18, 57, 113, 0.9) 0%, rgba(3, 14, 31, 0.98) 52%, rgba(2, 8, 20, 1) 100%)',
          }}
        />

        {/* Blueprint grid + vignette inside the frame. */}
        <div
          className="pointer-events-none absolute inset-[2px] opacity-90"
          style={{
            clipPath: FRAME_CLIP,
            backgroundImage:
              'linear-gradient(rgba(94, 178, 255, 0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(94, 178, 255, 0.13) 1px, transparent 1px)',
            backgroundSize: '46px 46px',
            maskImage:
              'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 64%, rgba(0,0,0,0.18) 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 64%, rgba(0,0,0,0.18) 100%)',
          }}
        />

        {/* Circuit rails and node dots echo the reference UI. */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
          viewBox="0 0 1200 760"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <g fill="none" stroke="#6fe0ff" strokeWidth="1.2">
            <path d="M18 108 H18 V652 H18" opacity="0.55" />
            <path d="M1182 108 V652" opacity="0.55" />
            <path d="M48 60 H226 L246 42 H360" opacity="0.42" />
            <path d="M840 42 H954 L974 60 H1152" opacity="0.42" />
            <path d="M48 700 H226 L246 718 H360" opacity="0.42" />
            <path d="M840 718 H954 L974 700 H1152" opacity="0.42" />
            <path d="M18 108 H34" opacity="0.7" />
            <path d="M1166 108 H1182" opacity="0.7" />
            <path d="M18 652 H34" opacity="0.7" />
            <path d="M1166 652 H1182" opacity="0.7" />
          </g>
          <g fill="#9ceeff">
            <circle cx="18" cy="108" r="3.5" />
            <circle cx="18" cy="652" r="3.5" />
            <circle cx="1182" cy="108" r="3.5" />
            <circle cx="1182" cy="652" r="3.5" />
            <circle cx="360" cy="42" r="2.2" opacity="0.7" />
            <circle cx="840" cy="42" r="2.2" opacity="0.7" />
            <circle cx="360" cy="718" r="2.2" opacity="0.7" />
            <circle cx="840" cy="718" r="2.2" opacity="0.7" />
          </g>
        </svg>

        {/* Inner hairline border. */}
        <div
          className="pointer-events-none absolute inset-[7px] border border-[#7fe3ff]/25"
          style={{ clipPath: FRAME_CLIP }}
        />

        {/* Moving scan sweep across the panel. */}
        <div className="pointer-events-none absolute inset-[2px] overflow-hidden" style={{ clipPath: FRAME_CLIP }}>
          <div className="animate-scan-sweep absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-[#5ed7ff]/10 to-transparent" />
        </div>

        {/* Panel content */}
        <div className="relative z-10 flex h-full min-h-0 w-full flex-col px-5 py-4 sm:px-8 sm:py-6 lg:px-12 lg:py-8">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#3b82f6]/25 pb-3">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] font-bold uppercase tracking-[0.3em] text-[#5fb9e0] sm:text-[9px]">
                <span className="inline-flex items-center gap-1.5 text-[#7fe3ff]">
                  <ScanLine className="h-3 w-3" aria-hidden="true" />
                  NovaQuest · Temporal Mission Archive
                </span>
                <span className="hidden h-px w-8 bg-[#3b82f6]/60 sm:block" aria-hidden="true" />
                <span>Level 01 · The Moon</span>
                <span className="hidden h-px w-6 bg-[#3b82f6]/40 sm:block" aria-hidden="true" />
                <span className="text-[#9ad8ef]">17 April 1967</span>
              </p>
              <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#4386b0]">
                Secure uplink · Record SVY-05 · Clearance: Time Traveller
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-[#5ee7ff]/35 bg-[#06233f]/80 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.22em] text-[#8be9ff] sm:inline-flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#64e6ff] opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#64e6ff]" />
                </span>
                Feed live
              </span>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close task page"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#5ee7ff]/35 bg-[#071b31]/80 text-[#9ddcf2] transition-colors hover:border-[#7fe3ff]/80 hover:bg-[#0b2b4d] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="mt-4 grid min-h-0 flex-1 gap-4 overflow-y-auto pr-1 lg:grid-cols-[1.12fr_0.88fr] lg:gap-6 lg:overflow-hidden">
            {/* Left: title, story, instructions */}
            <section className="flex min-h-0 flex-col gap-3.5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.34em] text-[#62c8ef]">
                    Mission Briefing
                  </p>
                  <h1
                    id="surveyor5-task-title"
                    className="mt-0.5 flex items-center gap-3 font-semibold tracking-[0.22em] text-[#dffaff]"
                    style={{
                      fontSize: 'clamp(2.9rem, 7.2vw, 6.25rem)',
                      lineHeight: 0.9,
                      textShadow: '0 0 26px rgba(86, 209, 255, 0.35)',
                    }}
                  >
                    TASK
                    <span className="mt-2 hidden h-px flex-1 bg-gradient-to-r from-[#7fe3ff]/70 to-transparent sm:block" />
                  </h1>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-1 pb-1 sm:flex">
                  <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#4f9ec2]">Mission ID</span>
                  <span className="rounded border border-[#3b82f6]/35 bg-[#061a30]/80 px-2.5 py-1 text-[10px] font-bold tracking-[0.24em] text-[#93e6ff]">
                    SVY-05 / 1967
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-[#3b82f6]/30 bg-[#031325]/80 px-4 py-3 shadow-[inset_0_0_30px_rgba(30,110,200,0.12)]">
                <p className="text-[13px] leading-relaxed text-[#d3edf9] sm:text-sm">
                  You have time-travelled into <span className="font-semibold text-[#9feaff]">1967</span>, the year
                  Surveyor 5 was built. In this mission you must create the historic lander from scratch — using the
                  parts and machinery that still exist inside NASA Headquarters.
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-[#8fb8ce] sm:text-xs">
                  To create Surveyor 5, identify and collect every item on the manifest from the storage room. Your
                  cart holds{' '}
                  <span className="font-semibold text-[#9feaff]">
                    up to {cartLimit} parts at a time
                  </span>
                  , so return to the holographic display in mission control to unload and install each load. Once all 15
                  parts are installed, the projection becomes a real spacecraft. Then go to the firing room at the end
                  of the corridor and launch it.
                </p>
                <p className="mt-2 flex items-start gap-2 border-t border-[#3b82f6]/20 pt-2 text-[11px] font-medium italic leading-relaxed text-[#ffd79a] sm:text-xs">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ffc36b]" aria-hidden="true" />
                  Your only way to retrieve Surveyor 5 is to complete this mission.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <MissionStep
                  index={1}
                  title="Identify & collect"
                  body={`Search the parts storage room and collect only the 15 manifest components — up to ${cartLimit} per cart load, unloading at the hologram between trips.`}
                  state={stageStates[0]}
                  icon={Target}
                />
                <MissionStep
                  index={2}
                  title="Materialise"
                  body="Return to the hologram on the central dais and convert the projection into the real lander."
                  state={stageStates[1]}
                  icon={CircleDashed}
                />
                <MissionStep
                  index={3}
                  title="Launch"
                  body="Carry the completed Surveyor 5 to the firing room and trigger the launch sequence."
                  state={stageStates[2]}
                  icon={Rocket}
                />
              </div>

              <div className="relative hidden min-h-[120px] flex-1 overflow-hidden rounded-lg border border-[#3b82f6]/25 bg-[#020c1c]/70 lg:block">
                <div className="absolute left-3 top-2 z-10">
                  <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#4f9ec2]">
                    Surveyor 5 · Reference schematic
                  </p>
                  <p className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.22em] text-[#2f7398]">
                    Hughes Aircraft Company · 1967
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center px-4 pb-1 pt-7">
                  <SurveyorSchematic active={hologramConverted} />
                </div>
                <div className="pointer-events-none absolute inset-x-3 bottom-2 flex items-center justify-between text-[7px] font-bold uppercase tracking-[0.22em] text-[#3b7f9f]">
                  <span>Mass 995 kg</span>
                  <span className="text-[#5ee7ff]">3-axis stabilised</span>
                  <span>Mare Tranquillitatis</span>
                </div>
              </div>
            </section>

            {/* Right: live manifest checklist */}
            <aside className="flex min-h-[460px] flex-col overflow-hidden rounded-xl border border-[#4f9cd8]/40 bg-[#03101f]/90 shadow-[0_0_40px_rgba(23,87,170,0.18)] lg:min-h-0">
              <div className="border-b border-[#3b82f6]/30 bg-[#061b33]/80 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.28em] text-[#7fe3ff]">
                      <Target className="h-3.5 w-3.5" aria-hidden="true" />
                      Component Manifest
                    </p>
                    <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#4f8cab]">
                      Surveyor 5 · Flight build · Cart {cartCount}/{cartLimit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold leading-none tracking-[0.08em] text-[#e5fbff]">
                      {installedCount}
                      <span className="text-[#4f8cab]"> / {SURVEYOR5_MANIFEST_TOTAL}</span>
                    </p>
                    <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.2em] text-[#5fb9e0]">
                      Parts installed
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full border border-[#3b82f6]/30 bg-[#02101f]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #2f7bff, #7fe3ff)',
                      boxShadow: '0 0 12px rgba(127, 227, 255, 0.55)',
                    }}
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
                {/* The cart carries a limited number of loose parts at a time. */}
                <div
                  className={`rounded-lg border px-3 py-2.5 ${
                    cartIsFull
                      ? 'border-[#ffc36b]/45 bg-[#2a1c06]/35'
                      : 'border-[#7fe3ff]/25 bg-[#041527]/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#8be9ff]">
                      <ShoppingCart className="h-3 w-3" aria-hidden="true" />
                      Collection cart
                    </p>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-[0.18em] ${
                        cartIsFull ? 'text-[#ffc36b]' : 'text-[#9ad8ef]'
                      }`}
                    >
                      {cartCount} / {cartLimit}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-5 gap-1.5">
                    {Array.from({ length: cartLimit }).map((_, index) => {
                      const part = componentById.get(cartIds[index]);
                      return (
                        <span
                          key={index}
                          title={part ? part.name : `Empty slot ${index + 1}`}
                          className={`flex h-9 items-center justify-center rounded border ${
                            part
                              ? 'border-[#7fe3ff]/55 bg-[#7fe3ff]/15 text-[#b9f4ff]'
                              : 'border-[#3d6f95]/35 bg-[#03101f]/60 text-[#3d6f95]'
                          }`}
                        >
                          {part ? (
                            <Package className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <span className="text-[8px] font-semibold">{index + 1}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                  <p
                    className={`mt-2 text-[8px] font-semibold uppercase leading-relaxed tracking-[0.16em] ${
                      cartIsFull ? 'text-[#ffd79a]' : 'text-[#5f95b1]'
                    }`}
                  >
                    {cartIsFull
                      ? 'Cart full — unload at the central hologram'
                      : `${remainingToCollect} part${remainingToCollect === 1 ? '' : 's'} still to collect · unload at the hologram to install`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleList}
                  aria-expanded={showList}
                  aria-controls="surveyor5-parts-list"
                  className="group flex w-full items-center justify-between gap-3 rounded-lg border border-[#5ee7ff]/35 bg-[#061d36]/80 px-3 py-2.5 text-left transition-colors hover:border-[#7fe3ff]/80 hover:bg-[#0a2748] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                >
                  <span className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 shrink-0 text-[#7fe3ff]" aria-hidden="true" />
                    <span>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-[#dffaff]">
                        {showList ? 'Hide list' : 'See list'}
                      </span>
                      <span className="mt-0.5 block text-[8px] font-semibold uppercase tracking-[0.18em] text-[#5fb9e0]">
                        Surveyor 5 · {SURVEYOR5_MANIFEST_TOTAL}-part flight manifest
                      </span>
                    </span>
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 text-[#9df0ff] transition-transform ${
                      showList ? 'rotate-90' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {showList && (
                  <div id="surveyor5-parts-list" className="animate-fade-in space-y-1.5">
                    {SURVEYOR5_MANIFEST.map((part, index) => {
                      const isInstalled = installed.has(part.id);
                      const isInCart = inCart.has(part.id);
                      return (
                        <div
                          key={part.id}
                          className={`flex items-center gap-2.5 rounded-md border px-2.5 py-2 transition-colors ${
                            isInstalled
                              ? 'border-[#5ee7ff]/35 bg-[#5ee7ff]/[0.07]'
                              : isInCart
                                ? 'border-[#ffc36b]/35 bg-[#2a1c06]/30'
                                : 'border-[#285a82]/35 bg-[#041527]/65'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                              isInstalled
                                ? 'border-[#7fe3ff]/70 bg-[#7fe3ff]/15 text-[#9df0ff]'
                                : isInCart
                                  ? 'border-[#ffc36b]/60 bg-[#ffc36b]/10 text-[#ffd79a]'
                                  : 'border-[#3d6f95]/50 text-[#3d6f95]'
                            }`}
                          >
                            {isInstalled ? (
                              <Check className="h-3 w-3" aria-hidden="true" />
                            ) : isInCart ? (
                              <PackageCheck className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <Circle className="h-2.5 w-2.5" aria-hidden="true" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-[10px] font-semibold uppercase tracking-[0.1em] ${
                                isInstalled
                                  ? 'text-[#b9f4ff] line-through decoration-[#7fe3ff]/80 decoration-2'
                                  : isInCart
                                    ? 'text-[#ffd79a]'
                                    : 'text-[#c9e2ee]'
                              }`}
                            >
                              {part.name}
                            </p>
                            <p className="mt-0.5 truncate text-[8px] font-semibold uppercase tracking-[0.18em] text-[#4f8cab]">
                              {part.category}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 text-[8px] font-bold uppercase tracking-[0.14em] ${
                              isInstalled
                                ? 'text-[#7fe3ff]'
                                : isInCart
                                  ? 'text-[#ffd79a]'
                                  : 'text-[#397597]'
                            }`}
                          >
                            {isInstalled
                              ? 'Installed'
                              : isInCart
                                ? 'In cart'
                                : String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

              <div className="border-t border-[#3b82f6]/30 bg-[#06172b]/85 px-4 py-3">
                <div className="mb-2 flex items-center justify-between gap-2 text-[8px] font-bold uppercase tracking-[0.2em]">
                  <span className="text-[#4f8cab]">Mission progress</span>
                  <span className="text-[#7fe3ff]">
                    {launched
                      ? 'Launch confirmed'
                      : missionSolved
                        ? 'Launch phase active'
                        : hologramConverted
                          ? 'Lander materialised'
                          : allInstalled
                            ? 'Manifest complete'
                            : `${remainingToInstall} part${remainingToInstall === 1 ? '' : 's'} left to install`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={
                    hologramConverted && !missionSolved
                      ? onSolvedMission
                      : handleClose
                  }
                  autoFocus
                  className="group flex w-full items-center justify-between gap-3 rounded-lg border border-[#7fe3ff]/60 bg-gradient-to-r from-[#0b3f83] via-[#0d4c9a] to-[#0b356d] px-4 py-2.5 text-left shadow-[0_0_24px_rgba(47,123,255,0.28)] transition-all hover:border-[#a8f0ff] hover:shadow-[0_0_32px_rgba(94,231,255,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7fe3ff]"
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-white">
                      {primaryLabel}
                    </span>
                    <span className="mt-0.5 block text-[8px] font-semibold uppercase tracking-[0.18em] text-[#9fe0f5]">
                      {primaryHint}
                    </span>
                  </span>
                  {launched ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#9df0ff]" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-5 w-5 shrink-0 text-[#9df0ff] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </aside>
          </div>

          <footer className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-x-5 gap-y-1 border-t border-[#3b82f6]/20 pt-2 text-[8px] font-bold uppercase tracking-[0.22em] text-[#3d7595]">
            <span className="inline-flex items-center gap-2">
              <ScanLine className="h-3 w-3 text-[#5ee7ff]" aria-hidden="true" />
              Walk to the storage room · Cart holds {cartLimit} · Click a floating part to collect it
            </span>
            <span className="hidden items-center gap-2 sm:inline-flex">
              <Rocket className="h-3 w-3 text-[#5ee7ff]" aria-hidden="true" />
              Firing room is at the far end of the corridor
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
