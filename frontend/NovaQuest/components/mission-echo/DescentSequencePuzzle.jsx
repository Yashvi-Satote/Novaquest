import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Flame,
  Gauge,
  Radar,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { audio } from '../../game/audioManager';

const DESCENT_STEPS = [
  {
    id: 'radar',
    label: 'Radar altimeter locks onto the lunar surface',
    detail: 'Range and velocity data acquired'
  },
  {
    id: 'retro',
    label: 'Retro-rocket braking burn',
    detail: 'Main engine slows the descent'
  },
  {
    id: 'terminal',
    label: 'Controlled terminal descent',
    detail: 'Throttle down for final approach'
  },
  {
    id: 'touchdown',
    label: 'Footpad touchdown & engine cutoff',
    detail: 'Three-point contact ends the burn'
  }
];

const DISTRACTORS = [
  {
    id: 'solar',
    label: 'Solar panel deployment',
    detail: 'Power system, not a descent step'
  },
  {
    id: 'parachute',
    label: 'Parachute deployment',
    detail: 'The Moon has no atmosphere'
  }
];

const CORRECT_ORDER = DESCENT_STEPS.map((step) => step.id);
const ALL_OPTIONS = [...DESCENT_STEPS, ...DISTRACTORS];

function shuffleOptions() {
  const list = [...ALL_OPTIONS];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function HolographicDescent({ progress, solved, correctCount }) {
  const starPositions = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => ({
        id: index,
        left: `${(index * 37 + 11) % 100}%`,
        top: `${(index * 23 + 7) % 58}%`,
        opacity: 0.25 + ((index * 13) % 60) / 100
      })),
    []
  );

  const altitudeKm = Math.max(0, 14.2 * (1 - progress));
  const isBurning = progress > 0.02 && progress < 0.98;

  return (
    <div className="relative h-[340px] overflow-hidden rounded-2xl border border-cyan-500/25 bg-[#020710] shadow-[inset_0_0_60px_rgba(8,145,178,0.12)] sm:h-[400px]">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 64%, rgba(14,165,233,0.18), transparent 42%), radial-gradient(circle at 18% 18%, rgba(139,92,246,0.14), transparent 30%)'
        }}
      />

      {starPositions.map((star) => (
        <span
          key={star.id}
          className="absolute h-0.5 w-0.5 rounded-full bg-cyan-100"
          style={{ left: star.left, top: star.top, opacity: star.opacity }}
        />
      ))}

      {/* False-colour lunar horizon */}
      <div className="absolute inset-x-[-24%] bottom-[12%] h-44 rounded-[50%] border-t border-cyan-300/30 bg-gradient-to-b from-slate-400/20 via-slate-600/20 to-[#020710]" />
      <div className="absolute inset-x-0 bottom-0 h-[24%] overflow-hidden">
        <div className="me-holo-grid absolute inset-x-[-20%] bottom-0 h-40 opacity-60" />
      </div>

      {/* Holographic altitude ticks */}
      <div className="absolute right-4 top-16 bottom-24 w-12 border-r border-cyan-400/20">
        {[0, 1, 2, 3, 4].map((tick) => (
          <div
            key={tick}
            className="absolute right-0 flex translate-y-1/2 items-center gap-1"
            style={{ bottom: `${tick * 22}%` }}
          >
            <span className="font-mono text-[8px] text-cyan-300/50">{(tick * 3.5).toFixed(0)}km</span>
            <span className="h-px w-3 bg-cyan-400/30" />
          </div>
        ))}
      </div>

      {/* Lander */}
      <div
        className="absolute left-1/2 z-10 w-28 -translate-x-1/2 transition-[bottom] duration-700 ease-out sm:w-32"
        style={{ bottom: `${19 + (1 - progress) * 38}%` }}
      >
        <div className="animate-me-float">
          <svg viewBox="0 0 140 132" className="h-auto w-full drop-shadow-[0_0_16px_rgba(34,211,238,0.65)]" aria-hidden="true">
            <g stroke="#67e8f9" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Mast and high-gain antenna */}
              <line x1="70" y1="46" x2="70" y2="16" />
              <rect x="54" y="11" width="32" height="5" rx="1.5" fill="rgba(34,211,238,0.12)" />
              <line x1="58" y1="11" x2="58" y2="16" />
              <line x1="82" y1="11" x2="82" y2="16" />

              {/* Main triangular structure */}
              <path d="M70 40 L47 68 L93 68 Z" fill="rgba(34,211,238,0.12)" />
              <line x1="70" y1="40" x2="70" y2="68" />
              <line x1="58" y1="54" x2="82" y2="54" />

              {/* Solar panel / experiment shelf */}
              <rect x="51" y="72" width="38" height="5" rx="1.5" fill="rgba(34,211,238,0.14)" />

              {/* Three legs and footpads */}
              <line x1="49" y1="66" x2="29" y2="104" />
              <line x1="91" y1="66" x2="111" y2="104" />
              <line x1="70" y1="68" x2="70" y2="108" />
              <ellipse cx="27" cy="107" rx="8" ry="3" fill="rgba(34,211,238,0.2)" />
              <ellipse cx="113" cy="107" rx="8" ry="3" fill="rgba(34,211,238,0.2)" />
              <ellipse cx="70" cy="111" rx="8" ry="3" fill="rgba(34,211,238,0.2)" />
            </g>
          </svg>
        </div>

        {isBurning && (
          <div className="absolute left-1/2 top-[73%] -translate-x-1/2">
            <div className="h-8 w-3 animate-pulse rounded-full bg-gradient-to-b from-cyan-200 via-cyan-400 to-transparent blur-[2px] sm:h-10 sm:w-4" />
            <div className="absolute left-1/2 top-2 h-16 w-8 -translate-x-1/2 animate-ping rounded-full bg-cyan-400/20" />
          </div>
        )}
      </div>

      {/* HUD copy */}
      <div className="absolute left-4 top-4 font-mono">
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-cyan-300/80">
          <Gauge className="h-3 w-3" />
          <span>Holo-reconstruction // Surveyor 1</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400">
          ALT <span className="font-bold text-cyan-200">{solved ? '0.0' : altitudeKm.toFixed(1)}</span>{' '}
          {solved ? 'M' : 'KM'}
        </div>
      </div>

      <div className="absolute right-4 top-4 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-cyan-200">
        {solved ? 'Touchdown confirmed' : correctCount > 0 ? `Sequence ${correctCount}/4` : 'Descent standby'}
      </div>

      <div className="absolute bottom-4 left-4 flex items-center gap-2 font-mono text-[9px] text-slate-400">
        <span className={`h-1.5 w-1.5 rounded-full ${solved ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
        <span>{solved ? 'SURFACE CONTACT LOCKED' : 'BRAKING PROFILE ACTIVE'}</span>
      </div>

      <div className="me-scanlines pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.55))]" />

      {solved && (
        <div className="absolute inset-x-4 bottom-12 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-950/80 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200 backdrop-blur">
          <ShieldCheck className="h-4 w-4" />
          Landing sequence verified
        </div>
      )}
    </div>
  );
}

export default function DescentSequencePuzzle({ completed = false, onSolved, onContinue }) {
  const [options] = useState(shuffleOptions);
  const [slots, setSlots] = useState(['', '', '', '']);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(completed);

  const correctCount = slots.reduce(
    (count, value, index) => (value && value === CORRECT_ORDER[index] ? count + 1 : count),
    0
  );
  const progress = solved ? 1 : correctCount / CORRECT_ORDER.length;

  const handleSelect = (slotIndex, value) => {
    audio.playClick();
    setSlots((previous) => previous.map((slot, index) => (index === slotIndex ? value : slot)));
    setFeedback(null);
  };

  const handleCheck = () => {
    if (solved) return;
    audio.playClick();

    const isComplete = slots.every(Boolean);
    if (!isComplete) {
      setFeedback({ type: 'error', text: 'Assign all four stages before checking the sequence.' });
      return;
    }

    if (CORRECT_ORDER.every((step, index) => slots[index] === step)) {
      setSolved(true);
      setFeedback({ type: 'success', text: 'Descent sequence accepted. The lander reaches the surface under control.' });
      audio.playStartGame();
      if (onSolved) onSolved();
      return;
    }

    setAttempts((count) => count + 1);
    setFeedback({
      type: 'error',
      text: 'Sequence rejected. Think about what the spacecraft must know before it can brake, descend and touch down.'
    });
  };

  const handleReset = () => {
    audio.playClick();
    setSlots(['', '', '', '']);
    setFeedback(null);
    setAttempts(0);
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-4">
        <HolographicDescent progress={progress} solved={solved} correctCount={correctCount} />

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
            <Radar className="h-3.5 w-3.5" />
            <span>Reconstruction note</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Surveyor 1 did not fall onto the Moon. It used radar, a braking rocket and a controlled final
            descent. Build the simplified order below to watch the holographic lander complete its approach.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-[#050b16]/80 p-4 shadow-2xl shadow-cyan-950/30 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">
              Puzzle A // Descent control
            </div>
            <h2 className="mt-1 text-xl font-bold text-white">Rebuild the landing sequence</h2>
            <p className="mt-1 text-xs text-slate-400">
              Select one system event for each step. Two options do not belong in the descent.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-slate-400">
            {solved ? 'Verified' : '4 steps'}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {slots.map((value, index) => {
            const usedElsewhere = slots.some((slot, slotIndex) => slotIndex !== index && slot === value);
            return (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-bold ${
                    value && value === CORRECT_ORDER[index]
                      ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="relative min-w-0 flex-1">
                  <select
                    aria-label={`Step ${index + 1} stage`}
                    value={value}
                    onChange={(event) => handleSelect(index, event.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-[#07111f] px-3.5 py-3 pr-10 font-mono text-xs text-slate-200 outline-none transition-colors focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/50"
                  >
                    <option value="">Select a stage</option>
                    {options.map((option) => (
                      <option
                        key={option.id}
                        value={option.id}
                        disabled={usedElsewhere && option.id !== value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCheck}
            disabled={solved}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              solved
                ? 'cursor-default border border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-700/30 hover:scale-[1.02] hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98]'
            }`}
          >
            {solved ? <CheckCircle2 className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {solved ? 'Sequence verified' : 'Check sequence'}
          </button>

          {!solved && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>

        {feedback && (
          <div
            role="status"
            className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed ${
              feedback.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                : 'animate-me-shake border-rose-500/40 bg-rose-950/30 text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {!solved && attempts >= 2 && (
          <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-200/90">
            Hint: the spacecraft must first know where the surface is. Touchdown is the final event.
          </p>
        )}

        {solved && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs leading-relaxed text-slate-300">
              <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-300">
                <Flame className="h-3.5 w-3.5" />
                What the reconstruction shows
              </div>
              A lunar landing is a controlled braking problem: acquire the surface, slow the descent, fly
              the terminal phase, then absorb contact with the footpads.
            </div>
            {onContinue && (
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  onContinue();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-cyan-200 transition-all hover:bg-cyan-500/25"
              >
                Continue to surface analysis
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
