import React, { useEffect } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleDashed,
  Compass,
  FileText,
  Layers,
  Package,
  PackageCheck,
  Radio,
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

function SurveyorSchematic({ active }) {
  return (
    <svg
      className="h-full w-full max-h-[140px]"
      viewBox="0 0 340 180"
      fill="none"
      aria-hidden="true"
      style={{ filter: active ? 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.45))' : 'none' }}
    >
      <g stroke="#7fe3ff" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
        {/* triangular spaceframe */}
        <path d="M170 44 L214 82 L126 82 Z" strokeWidth="1.6" />
        <path d="M170 54 L200 80 L140 80 Z" strokeWidth="0.9" opacity="0.55" />
        <path d="M146 64 L194 64 M158 54 L182 54" strokeWidth="0.7" opacity="0.5" />
        {/* solar array */}
        <path d="M136 38 L204 38 L209 48 L131 48 Z" strokeWidth="1.4" />
        <path d="M148 38 V48 M160 38 V48 M172 38 V48 M184 38 V48 M196 38 V48" strokeWidth="0.7" opacity="0.7" />
        <path d="M131 48 L209 48" strokeWidth="0.7" opacity="0.5" />
        {/* mast and television camera */}
        <path d="M178 38 V18 M178 18 L186 14 L194 18 L194 28 L186 32 L178 28 Z" strokeWidth="1.2" />
        <path d="M194 23 L202 23" strokeWidth="1.1" />
        {/* high-gain antenna */}
        <path d="M126 54 L110 30 M110 30 L98 24 L104 14 L118 18 Z" strokeWidth="1.1" />
        <path d="M104 14 L98 24" strokeWidth="0.7" />
        {/* central body, tanks and retro nozzle */}
        <path d="M144 82 L196 82 L190 102 L150 102 Z" strokeWidth="1.3" />
        <circle cx="170" cy="91" r="7" strokeWidth="1" opacity="0.8" />
        <path d="M170 102 L162 118 M170 102 L178 118 M170 102 V122" strokeWidth="1.2" />
        <path d="M162 118 L178 118 L174 126 L166 126 Z" strokeWidth="0.9" opacity="0.7" />
        {/* landing legs */}
        <path d="M144 82 L112 134 L104 140" strokeWidth="1.5" />
        <path d="M196 82 L228 134 L236 140" strokeWidth="1.5" />
        <path d="M170 102 L170 142" strokeWidth="1.5" />
        <path d="M104 140 L92 144 M236 140 L248 144 M170 142 L158 146 M170 142 L182 146" strokeWidth="1.8" />
        <path d="M112 127 L130 127 M228 127 L210 127" strokeWidth="0.8" opacity="0.65" />
        {/* alpha-scattering instrument */}
        <path d="M192 98 L218 118 L222 132 L214 138 L202 132 L200 120" strokeWidth="0.9" opacity="0.8" strokeDasharray="2 3" />
        <rect x="200" y="130" width="15" height="12" strokeWidth="1" />
      </g>
      {/* scan reticle */}
      <g stroke="#9ceeff" opacity="0.35">
        <path d="M30 30 H45 M30 30 V45" strokeWidth="1.2" />
        <path d="M310 30 H295 M310 30 V45" strokeWidth="1.2" />
        <path d="M30 150 H45 M30 150 V135" strokeWidth="1.2" />
        <path d="M310 150 H295 M310 150 V135" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

function MissionStepCard({ index, title, description, state, icon: Icon }) {
  const isActive = state === 'active';
  const isComplete = state === 'complete';

  return (
    <div
      className={`relative flex items-start gap-3 rounded-xl border p-3 transition-all duration-300 ${
        isActive
          ? 'border-cyan-400/80 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/30'
          : isComplete
            ? 'border-emerald-500/40 bg-emerald-950/20'
            : 'border-slate-800 bg-slate-900/40 opacity-75'
      }`}
    >
      <div
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
          isActive
            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
            : isComplete
              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
              : 'border-slate-700 bg-slate-800 text-slate-400'
        }`}
      >
        {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400/80">
            Phase 0{index}
          </span>
          <span
            className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
              isActive
                ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                : isComplete
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-slate-800 text-slate-500'
            }`}
          >
            {isComplete ? 'Done' : isActive ? 'Active' : 'Locked'}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-bold text-slate-100">{title}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{description}</p>
      </div>
    </div>
  );
}

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

  const handleAutoCompleteTask = () => {
    if (allInstalled) return;
    gameAudio.playClick();
    onAutoCompleteTask?.();
  };

  const primaryLabel = launched
    ? 'Close Mission Briefing'
    : hologramConverted && !missionSolved
      ? 'Initiate Launch Phase'
      : missionSolved
        ? 'Proceed to Firing Room'
        : allInstalled
          ? 'Materialise Lander at Hologram'
          : cartIsFull
            ? 'Return to Dais & Unload Cart'
            : cartCount > 0
              ? 'Continue Component Search'
              : 'Begin Component Search';

  const primaryHint = launched
    ? 'Mission successfully executed'
    : hologramConverted && !missionSolved
      ? 'Spacecraft materialised — proceed to launch'
      : missionSolved
        ? 'Head down the corridor to NASA Firing Room'
        : allInstalled
          ? 'All 15 components installed — activate projection'
          : cartIsFull
            ? `Cart full (${cartLimit}/${cartLimit}) — deposit parts at holographic dais`
            : cartCount > 0
              ? `${cartCount}/${cartLimit} in cart · ${remainingToCollect} components remaining`
              : 'Storage room located mid-corridor on the right';

  return (
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md font-mono select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="surveyor5-briefing-title"
    >
      {/* Sci-Fi Ambient Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(6, 182, 212, 0.15) 0%, rgba(15, 23, 42, 0.6) 55%, rgba(2, 6, 23, 0.95) 100%)',
        }}
      />

      {/* Main NASA Mission Briefing Modal Card */}
      <div className="relative flex h-[92vh] max-h-[880px] w-full max-w-[1340px] flex-col rounded-2xl border border-cyan-500/40 bg-[#030d1c]/95 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden backdrop-blur-xl animate-fade-in">
        
        {/* Holographic Header Bar */}
        <header className="flex shrink-0 items-center justify-between border-b border-cyan-500/25 bg-[#021326]/80 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300" />
            </span>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                NASA JPL · TEMPORAL ARCHIVE UPLINK
              </p>
              <p className="text-[9px] text-slate-400 tracking-wider">
                RECORD SVY-05 · MARE TRANQUILLITATIS · 1967
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-950/60 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-cyan-300">
              <Radio className="h-3 w-3 animate-pulse" />
              TELEMETRY LIVE
            </span>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close mission briefing"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/40 bg-slate-900/80 text-cyan-300 transition-colors hover:border-cyan-300 hover:bg-cyan-950 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Two-Column Responsive Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 p-4 sm:p-6 overflow-hidden">
          
          {/* LEFT COLUMN: Mission Context, Objectives, 3 Phases, Schematic (7 Cols) */}
          <section className="lg:col-span-7 flex flex-col gap-4 overflow-y-auto pr-1">
            
            {/* Title & Badge */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9px] font-bold uppercase tracking-widest text-cyan-300">
                  Mission SVY-05
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  Hughes Aircraft Company · 1967
                </span>
              </div>
              <h1
                id="surveyor5-briefing-title"
                className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-wide text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              >
                SURVEYOR 5 · LANDER RESTORATION
              </h1>
            </div>

            {/* Mission Objective Card */}
            <div className="rounded-xl border border-cyan-500/35 bg-cyan-950/20 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Target className="h-4 w-4 text-cyan-300" />
                Primary Mission Objective
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                You have travelled back to <strong className="text-cyan-300">1967</strong>. To ensure the historic Surveyor 5 mission takes place, you must locate and assemble its <strong className="text-cyan-300">15 flight components</strong> from the NASA Headquarters storage room.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Your collection cart holds up to <strong className="text-cyan-300">{cartLimit} components</strong> per trip. Deposit collected parts at the central holographic dais to assemble the lander, then proceed to the firing room to authorize launch.
              </p>
            </div>

            {/* Three Mission Phases */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 mb-2.5">
                Mission Execution Sequence
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <MissionStepCard
                  index={1}
                  title="Collect Parts"
                  description={`Retrieve 15 components from storage (${cartLimit} max per trip) and unload at the hologram.`}
                  state={stageStates[0]}
                  icon={Target}
                />
                <MissionStepCard
                  index={2}
                  title="Materialise"
                  description="Convert the completed 15-part holographic blueprint into the physical lunar lander."
                  state={stageStates[1]}
                  icon={CircleDashed}
                />
                <MissionStepCard
                  index={3}
                  title="Launch"
                  description="Transfer the verified spacecraft to the firing room and trigger Atlas-Centaur liftoff."
                  state={stageStates[2]}
                  icon={Rocket}
                />
              </div>
            </div>

            {/* Surveyor 5 Technical Reference Schematic */}
            <div className="relative rounded-xl border border-cyan-500/30 bg-[#020d1c]/80 p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-300">
                  Surveyor 5 Blueprint & Subsystems
                </span>
                <span className="text-[8px] font-mono text-slate-400">
                  Scale 1:1 · Hughes Spaceframe
                </span>
              </div>
              <div className="flex items-center justify-center py-1">
                <SurveyorSchematic active={hologramConverted} />
              </div>
              <div className="flex items-center justify-between border-t border-cyan-500/20 pt-2 text-[8px] sm:text-[9px] font-mono text-cyan-400/80">
                <span>Mass: 995 kg</span>
                <span>Payload: APXS Spectrometer</span>
                <span>Site: Mare Tranquillitatis</span>
              </div>
            </div>

          </section>

          {/* RIGHT COLUMN: Manifest, Cart, Progress, Action Button (5 Cols) */}
          <aside className="lg:col-span-5 flex flex-col gap-3 rounded-xl border border-cyan-500/35 bg-[#021326]/60 p-4 min-h-0">
            
            {/* Header: Parts Installed & Progress Bar */}
            <div className="border-b border-cyan-500/20 pb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Component Manifest
                  </p>
                  <p className="text-[9px] text-slate-400">
                    {installedCount} of {SURVEYOR5_MANIFEST_TOTAL} Installed ({progress}%)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-cyan-200">
                    {installedCount}
                    <span className="text-xs text-slate-500 font-normal"> / {SURVEYOR5_MANIFEST_TOTAL}</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-cyan-500/30">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #0284c7, #22d3ee)',
                    boxShadow: '0 0 10px rgba(34, 211, 238, 0.6)',
                  }}
                />
              </div>
            </div>

            {/* Collection Cart Status */}
            <div className={`rounded-xl border p-3 ${
              cartIsFull
                ? 'border-amber-400/50 bg-amber-950/25'
                : 'border-cyan-500/30 bg-cyan-950/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  <ShoppingCart className="h-3.5 w-3.5 text-cyan-300" />
                  Collection Cart
                </span>
                <span className={`text-[10px] font-mono font-bold ${
                  cartIsFull ? 'text-amber-300' : 'text-cyan-300'
                }`}>
                  {cartCount} / {cartLimit} Slots
                </span>
              </div>

              {/* 5 Cart Slots */}
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: cartLimit }).map((_, idx) => {
                  const part = componentById.get(cartIds[idx]);
                  return (
                    <div
                      key={idx}
                      title={part ? part.name : `Empty slot ${idx + 1}`}
                      className={`flex h-8 items-center justify-center rounded-lg border text-xs font-mono ${
                        part
                          ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-200 font-bold'
                          : 'border-slate-800 bg-slate-950/60 text-slate-600'
                      }`}
                    >
                      {part ? <Package className="h-3.5 w-3.5 text-cyan-300" /> : idx + 1}
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-[9px] text-slate-400">
                {cartIsFull
                  ? 'Cart full! Return to the central hologram dais to deposit parts.'
                  : `${remainingToCollect} parts remaining to find in the storage room.`}
              </p>
            </div>

            {/* Scrollable Component Checklist (Always visible and clean) */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-cyan-400/80 mb-1.5">
                <span>Flight Parts Checklist</span>
                <span className="text-[9px] text-slate-400 font-normal">15 Items Total</span>
              </div>

              <div className="flex-1 overflow-y-auto pr-1.5 space-y-1.5 min-h-[160px] max-h-[300px] border border-cyan-500/20 rounded-xl p-2 bg-[#010915]/60">
                {SURVEYOR5_MANIFEST.map((part, idx) => {
                  const isInstalled = installed.has(part.id);
                  const isInCart = inCart.has(part.id);

                  return (
                    <div
                      key={part.id}
                      className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                        isInstalled
                          ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                          : isInCart
                            ? 'border-amber-400/40 bg-amber-950/20 text-amber-200'
                            : 'border-slate-800/80 bg-slate-900/40 text-slate-300'
                      }`}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-700 bg-slate-800 text-[10px]">
                        {isInstalled ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : isInCart ? (
                          <PackageCheck className="h-3 w-3 text-amber-400" />
                        ) : (
                          <span className="text-slate-500">{idx + 1}</span>
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-[11px] font-bold ${
                          isInstalled ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}>
                          {part.name}
                        </p>
                        <p className="text-[8px] text-slate-500 uppercase tracking-wide truncate">
                          {part.category}
                        </p>
                      </div>

                      <span className={`shrink-0 text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                        isInstalled
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isInCart
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isInstalled ? 'Installed' : isInCart ? 'In Cart' : 'Storage'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom CTA Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={
                  hologramConverted && !missionSolved
                    ? onSolvedMission
                    : handleClose
                }
                autoFocus
                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-cyan-400/70 bg-gradient-to-r from-cyan-900/80 via-blue-900/80 to-cyan-950/80 p-3 text-left shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-[0.99] cursor-pointer"
              >
                <div className="min-w-0">
                  <span className="block text-xs font-extrabold uppercase tracking-widest text-white">
                    {primaryLabel}
                  </span>
                  <span className="mt-0.5 block text-[9px] text-cyan-200/80 truncate">
                    {primaryHint}
                  </span>
                </div>
                {launched ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-300" />
                ) : (
                  <ChevronRight className="h-5 w-5 shrink-0 text-cyan-300 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </div>

          </aside>
        </div>

        {/* Footer Navigation Bar */}
        <footer className="flex shrink-0 items-center justify-between border-t border-cyan-500/20 bg-[#021326]/70 px-5 py-2.5 sm:px-8 text-[9px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ScanLine className="h-3 w-3 text-cyan-400" />
            Walk to Storage Room on the right · Click floating components to collect
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-cyan-400/80">
            <Rocket className="h-3 w-3 text-cyan-400" />
            NASA Headquarters Firing Room located at corridor terminus
          </span>
        </footer>

      </div>
    </div>
  );
}
