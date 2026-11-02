import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  Mountain,
  RotateCcw,
  Scan,
  Sparkles
} from 'lucide-react';
import { audio } from '../../game/audioManager';

const OBSERVATIONS = [
  {
    id: 'footpad',
    marker: '01',
    title: 'Footpad impression',
    question: 'What does the footpad impression indicate?',
    correct: 'Evidence of surface contact',
    choices: [
      'Evidence of surface contact',
      'Evidence of an ancient ocean',
      'Evidence of recent volcanic activity'
    ],
    hint: 'Look for the physical mark left where the spacecraft met the ground.',
    result: 'The footpad settled into the regolith without sinking deeply. Surface contact was stable.',
    markerPosition: { left: '30%', top: '77%' }
  },
  {
    id: 'rocks',
    marker: '02',
    title: 'Rock distribution',
    question: 'What does the rock distribution help describe?',
    correct: 'Helps describe local terrain',
    choices: [
      'Proof that the Moon has an atmosphere',
      'Helps describe local terrain',
      'A navigation beacon placed by Surveyor'
    ],
    hint: 'Rocks and ejecta are evidence about the ground around the landing site.',
    result: 'Rock fragments and ejecta help map the local terrain and understand surface processes.',
    markerPosition: { left: '68%', top: '61%' }
  },
  {
    id: 'slope',
    marker: '03',
    title: 'Surface texture & slope',
    question: 'Why does the local surface slope matter?',
    correct: 'Relevant to landing stability',
    choices: [
      'A sign of active plate tectonics',
      'Evidence that humans had already walked here',
      'Relevant to landing stability'
    ],
    hint: 'A lander must not tip over after its footpads make contact.',
    result: 'A gentle local slope keeps the lander stable and informs future landing-site selection.',
    markerPosition: { left: '82%', top: '45%' }
  }
];

function shuffleChoices(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function SurfaceScene({ activeId, answers, onSelect }) {
  const solvedIds = new Set(
    OBSERVATIONS.filter((observation) => answers[observation.id] === observation.correct).map(
      (observation) => observation.id
    )
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-[#050912]">
      <svg
        viewBox="0 0 800 520"
        className="h-auto w-full"
        role="img"
        aria-label="Reconstructed Surveyor 1 landing site with footpad, rocks, and surface slope"
      >
        <defs>
          <linearGradient id="meSurfaceSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#01030a" />
            <stop offset="58%" stopColor="#07101d" />
            <stop offset="100%" stopColor="#141b25" />
          </linearGradient>
          <linearGradient id="meSurfaceGround" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8a8c8e" />
            <stop offset="38%" stopColor="#62646a" />
            <stop offset="100%" stopColor="#23262c" />
          </linearGradient>
          <radialGradient id="meSurfaceCrater" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#25282e" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#35383f" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#73767b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="meSurfaceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <filter id="meSurfaceGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.08" />
            </feComponentTransfer>
          </filter>
        </defs>

        <rect width="800" height="520" fill="url(#meSurfaceSky)" />

        {/* Stars and distant Earth */}
        {[
          [52, 48, 0.75],
          [126, 84, 0.55],
          [206, 36, 0.85],
          [294, 72, 0.5],
          [382, 28, 0.7],
          [468, 58, 0.6],
          [566, 34, 0.8],
          [642, 86, 0.45],
          [728, 46, 0.7],
          [764, 112, 0.55],
          [88, 128, 0.45],
          [338, 118, 0.4]
        ].map(([cx, cy, opacity], index) => (
          <circle key={index} cx={cx} cy={cy} r="1.4" fill="#dff8ff" opacity={opacity} />
        ))}
        <circle cx="116" cy="94" r="22" fill="#1d6fa5" opacity="0.75" />
        <circle cx="109" cy="88" r="7" fill="#79d2ff" opacity="0.25" />
        <circle cx="116" cy="94" r="29" fill="none" stroke="#38bdf8" strokeWidth="1.4" opacity="0.28" />

        {/* Lunar surface */}
        <path
          d="M0 268 C 108 250, 192 262, 286 276 S 466 316, 580 290 S 710 238, 800 246 L800 520 L0 520 Z"
          fill="url(#meSurfaceGround)"
        />
        <path
          d="M0 268 C 108 250, 192 262, 286 276 S 466 316, 580 290 S 710 238, 800 246"
          fill="none"
          stroke="#b7bcc2"
          strokeWidth="2"
          opacity="0.28"
        />

        {/* Slope contour lines */}
        <g fill="none" stroke="#252930" strokeWidth="2" opacity="0.55">
          <path d="M470 350 C 548 330, 640 294, 800 294" />
          <path d="M500 374 C 580 352, 672 320, 800 316" />
          <path d="M540 398 C 620 374, 712 346, 800 340" />
          <path d="M592 420 C 662 402, 738 380, 800 372" />
        </g>

        {/* Craters */}
        <ellipse cx="106" cy="328" rx="110" ry="28" fill="url(#meSurfaceCrater)" />
        <ellipse cx="106" cy="320" rx="86" ry="18" fill="none" stroke="#9da0a4" strokeWidth="2" opacity="0.22" />
        <ellipse cx="675" cy="360" rx="74" ry="20" fill="url(#meSurfaceCrater)" opacity="0.7" />
        <ellipse cx="675" cy="356" rx="53" ry="12" fill="none" stroke="#b9bdc2" strokeWidth="2" opacity="0.18" />

        {/* Rock distribution */}
        <g stroke="#25282e" strokeWidth="2" fill="#5d6067">
          <path d="M484 340 L508 314 L544 322 L565 352 L540 370 L504 364 Z" />
          <path d="M552 298 L575 279 L603 288 L611 311 L589 326 L564 318 Z" fill="#53565d" />
          <path d="M604 348 L619 335 L644 342 L650 358 L632 368 L613 362 Z" fill="#666a71" />
          <path d="M455 300 L468 288 L485 294 L490 307 L475 315 L459 309 Z" fill="#4c4f56" />
          <path d="M666 308 L679 298 L695 303 L699 315 L686 322 L671 317 Z" fill="#555960" />
        </g>
        <g fill="#1d2026" opacity="0.55">
          <ellipse cx="527" cy="372" rx="48" ry="8" />
          <ellipse cx="583" cy="326" rx="34" ry="6" />
          <ellipse cx="628" cy="366" rx="27" ry="5" />
          <ellipse cx="476" cy="315" rx="24" ry="4" />
        </g>

        {/* Footpad and impression */}
        <g>
          <path d="M182 286 L241 389" stroke="#a2a6ac" strokeWidth="10" strokeLinecap="round" />
          <path d="M186 291 L238 384" stroke="#d1d5da" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <ellipse cx="246" cy="404" rx="52" ry="17" fill="#1d2026" opacity="0.9" />
          <ellipse cx="246" cy="400" rx="43" ry="14" fill="#73777d" stroke="#b8bcc2" strokeWidth="3" />
          <ellipse cx="246" cy="397" rx="27" ry="8" fill="#3a3d43" />
          <ellipse cx="246" cy="414" rx="64" ry="20" fill="none" stroke="#23262c" strokeWidth="5" opacity="0.8" />
          <g stroke="#aeb2b8" strokeWidth="1.4" opacity="0.4">
            <path d="M198 424 L174 432" />
            <path d="M208 430 L194 444" />
            <path d="M292 424 L316 431" />
            <path d="M278 431 L292 446" />
          </g>
        </g>

        {/* Sharp sun highlight from the left */}
        <path
          d="M0 268 C 108 250, 192 262, 286 276 S 466 316, 580 290 S 710 238, 800 246 L800 520 L0 520 Z"
          fill="url(#meSurfaceGlow)"
          opacity="0.08"
        />
        <rect width="800" height="520" filter="url(#meSurfaceGrain)" opacity="0.7" />
      </svg>

      {/* Interactive observation markers */}
      {OBSERVATIONS.map((observation) => {
        const isActive = activeId === observation.id;
        const isSolved = solvedIds.has(observation.id);
        return (
          <button
            key={observation.id}
            type="button"
            onClick={() => {
              audio.playHover();
              onSelect(observation.id);
            }}
            style={observation.markerPosition}
            className={`group absolute z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-[10px] font-bold shadow-lg backdrop-blur transition-all focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
              isSolved
                ? 'border-emerald-300 bg-emerald-500/30 text-emerald-100'
                : isActive
                  ? 'scale-110 border-cyan-300 bg-cyan-500/30 text-cyan-100'
                  : 'border-white/60 bg-black/55 text-white hover:scale-110 hover:border-cyan-300'
            }`}
            aria-label={`Observation ${observation.marker}: ${observation.title}`}
            aria-pressed={isActive}
          >
            {!isSolved && isActive && (
              <span className="absolute inset-0 animate-ping rounded-full border border-cyan-300/60" />
            )}
            {isSolved ? <CheckCircle2 className="h-4 w-4" /> : observation.marker}
          </button>
        );
      })}

      <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-cyan-400/25 bg-black/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-200 backdrop-blur">
        Reconstructed surface // frame 044
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 font-mono text-[9px] text-slate-300 backdrop-blur">
        <Scan className="h-3 w-3 text-cyan-400" />
        Select a highlighted feature
      </div>
      <div className="me-scanlines pointer-events-none absolute inset-0 opacity-25" />
    </div>
  );
}

export default function LunarSurfacePuzzle({ completed = false, onSolved, onContinue }) {
  const observations = useMemo(
    () =>
      OBSERVATIONS.map((observation) => ({
        ...observation,
        choices: shuffleChoices(observation.choices)
      })),
    []
  );

  const [answers, setAnswers] = useState(() => {
    if (!completed) return {};
    return Object.fromEntries(OBSERVATIONS.map((observation) => [observation.id, observation.correct]));
  });
  const [activeId, setActiveId] = useState(OBSERVATIONS[0].id);
  const [wrongIds, setWrongIds] = useState([]);

  const activeObservation = observations.find((observation) => observation.id === activeId) || observations[0];
  const allCorrect = observations.every((observation) => answers[observation.id] === observation.correct);
  const solvedCount = observations.filter(
    (observation) => answers[observation.id] === observation.correct
  ).length;
  const activeSolved = answers[activeObservation.id] === activeObservation.correct;
  const activeWrong = wrongIds.includes(activeObservation.id);

  const handleChoose = (observation, choice) => {
    if (answers[observation.id] === observation.correct) return;
    audio.playClick();

    const nextAnswers = { ...answers, [observation.id]: choice };
    setAnswers(nextAnswers);

    if (choice === observation.correct) {
      setWrongIds((previous) => previous.filter((id) => id !== observation.id));
      const complete = observations.every(
        (item) => nextAnswers[item.id] === item.correct
      );
      if (complete) {
        audio.playStartGame();
        if (onSolved) onSolved();
      }
    } else {
      setWrongIds((previous) =>
        previous.includes(observation.id) ? previous : [...previous, observation.id]
      );
    }
  };

  const handleFindNext = () => {
    const next = observations.find(
      (observation) => answers[observation.id] !== observation.correct
    );
    if (next) {
      audio.playClick();
      setActiveId(next.id);
    }
  };

  const handleReset = () => {
    audio.playClick();
    setAnswers({});
    setWrongIds([]);
    setActiveId(observations[0].id);
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-3">
        <SurfaceScene activeId={activeId} answers={answers} onSelect={setActiveId} />

        <div className="grid grid-cols-3 gap-2">
          {observations.map((observation) => {
            const isSolved = answers[observation.id] === observation.correct;
            const isActive = activeId === observation.id;
            return (
              <button
                key={observation.id}
                type="button"
                onClick={() => {
                  audio.playHover();
                  setActiveId(observation.id);
                }}
                className={`rounded-xl border p-2.5 text-left transition-all ${
                  isActive
                    ? 'border-cyan-400/60 bg-cyan-500/10'
                    : 'border-white/10 bg-white/[0.025] hover:border-white/20'
                }`}
              >
                <div
                  className={`font-mono text-[9px] font-bold uppercase tracking-widest ${
                    isSolved ? 'text-emerald-300' : isActive ? 'text-cyan-300' : 'text-slate-500'
                  }`}
                >
                  {isSolved ? 'VERIFIED' : `OBS ${observation.marker}`}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
                  {observation.id === 'footpad' && <Eye className="h-3 w-3 shrink-0 text-cyan-400" />}
                  {observation.id === 'rocks' && <Sparkles className="h-3 w-3 shrink-0 text-cyan-400" />}
                  {observation.id === 'slope' && <Mountain className="h-3 w-3 shrink-0 text-cyan-400" />}
                  <span className="truncate">{observation.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-[#050b16]/85 p-5 shadow-2xl shadow-cyan-950/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">
              Puzzle B // Surface analysis
            </div>
            <h2 className="mt-1 text-xl font-bold text-white">Interpret the evidence</h2>
          </div>
          <span className="shrink-0 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-slate-400">
            {solvedCount} / 3
          </span>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/25 p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-500/10 text-[10px]">
              {activeObservation.marker}
            </span>
            {activeObservation.title}
          </div>
          <p className="mt-3 text-sm font-medium text-slate-200">{activeObservation.question}</p>

          <div className="mt-3 space-y-2">
            {activeObservation.choices.map((choice) => {
              const selected = answers[activeObservation.id] === choice;
              const isCorrectChoice = choice === activeObservation.correct;

              return (
                <button
                  key={choice}
                  type="button"
                  disabled={activeSolved}
                  onClick={() => handleChoose(activeObservation, choice)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-xs transition-all ${
                    activeSolved && isCorrectChoice
                      ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
                      : selected && !isCorrectChoice
                        ? 'border-rose-400/50 bg-rose-500/10 text-rose-200'
                        : activeSolved
                          ? 'border-white/5 bg-white/[0.02] text-slate-600'
                          : 'border-white/10 bg-white/[0.025] text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-white'
                  }`}
                >
                  <span>{choice}</span>
                  {activeSolved && isCorrectChoice && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>

          {activeWrong && !activeSolved && (
            <div role="status" className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-[11px] leading-relaxed text-rose-200">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{activeObservation.hint}</span>
            </div>
          )}

          {activeSolved && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-[11px] leading-relaxed text-emerald-200">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{activeObservation.result}</span>
            </div>
          )}
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
            style={{ width: `${(solvedCount / 3) * 100}%` }}
          />
        </div>

        {!allCorrect && solvedCount > 0 && (
          <button
            type="button"
            onClick={handleFindNext}
            className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-cyan-300 transition-colors hover:text-cyan-200"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            Go to next unresolved observation
          </button>
        )}

        {!allCorrect && (
          <button
            type="button"
            onClick={handleReset}
            className="mt-3 ml-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-300"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}

        {allCorrect && (
          <div className="mt-5 animate-fade-in space-y-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Surface observation report
              </div>
              <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-slate-300">
                {observations.map((observation) => (
                  <li key={observation.id} className="flex gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-300" />
                    <span>
                      <strong className="text-slate-100">{observation.title}:</strong>{' '}
                      {observation.result}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-emerald-500/20 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300">
                Stable contact · firm regolith · terrain mapped · landing stability confirmed
              </div>
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
                Continue to image archive
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
