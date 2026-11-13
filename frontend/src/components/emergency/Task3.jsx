import React, { useMemo, useState, useCallback } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Wrench,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { TASK3_DATA } from '../../config/task3Data.js';
import { gameAudio } from '../../../NovaQuest/config/gameAudio.js';

/**
 * Animated Helium Tank & Rocket Engine Diagram
 * Kid-friendly (ages 8-12) showing helium pushing fuel into the thruster,
 * with animated gas leak particles escaping.
 */
function HeliumLeakDiagram() {
  return (
    <div className="relative w-full max-w-md mx-auto p-3 sm:p-4 rounded-xl border border-[#00f0ff]/30 bg-[#031526]/80 shadow-[inset_0_0_20px_rgba(0,240,255,0.15)] overflow-hidden">
      <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-[#7fe3ff] mb-2">
        <span>Spacecraft Engine Pressurization</span>
        <span className="text-amber-400 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 animate-pulse" />
          Tiny Leak Active
        </span>
      </div>

      <svg
        viewBox="0 0 380 140"
        className="w-full h-auto select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="balloonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7ee7ff" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#0284c7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#03456b" stopOpacity="0.9" />
          </radialGradient>
          <linearGradient id="fuelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="thrusterFire" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* 1. Helium Balloon / Tank */}
        <g transform="translate(60, 68)">
          <circle
            cx="0"
            cy="0"
            r="38"
            fill="url(#balloonGlow)"
            stroke="#5ee7ff"
            strokeWidth="2.5"
            className="animate-pulse"
          />
          {/* Shiny highlight */}
          <ellipse cx="-12" cy="-12" rx="10" ry="6" fill="#ffffff" opacity="0.4" />
          <text
            x="0"
            y="-2"
            fill="#ffffff"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            HELIUM
          </text>
          <text
            x="0"
            y="12"
            fill="#bbf7d0"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            GAS
          </text>

          {/* Tiny Leak indicator on the top-right of the balloon */}
          <g transform="translate(26, -26)">
            <circle cx="0" cy="0" r="3" fill="#ff4444" />
            {/* Animated Escaping Gas particles */}
            <circle cx="5" cy="-6" r="2" fill="#7ee7ff" opacity="0.8">
              <animate attributeName="cy" values="-6;-22;-32" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="cx" values="5;12;18" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.5;0" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="8" cy="-10" r="1.5" fill="#7ee7ff" opacity="0.8">
              <animate attributeName="cy" values="-10;-26;-38" dur="1.4s" begin="0.3s" repeatCount="indefinite" />
              <animate attributeName="cx" values="8;16;22" dur="1.4s" begin="0.3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.5;0" dur="1.4s" begin="0.3s" repeatCount="indefinite" />
            </circle>
            <text x="18" y="-14" fill="#f87171" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
              Leak!
            </text>
          </g>
        </g>

        {/* 2. Push Arrow Tube connecting to Fuel */}
        <path
          d="M 98 68 L 165 68"
          stroke="#5ee7ff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="4 4"
        >
          <animate attributeName="stroke-dashoffset" values="16;0" dur="0.8s" repeatCount="indefinite" />
        </path>
        <polygon points="168,68 156,62 156,74" fill="#5ee7ff" />

        <text x="132" y="56" fill="#7ee7ff" fontSize="7" fontWeight="bold" textAnchor="middle">
          Push →
        </text>

        {/* 3. Fuel Chamber */}
        <g transform="translate(172, 42)">
          <rect
            x="0"
            y="0"
            width="68"
            height="52"
            rx="8"
            fill="url(#fuelGrad)"
            stroke="#93c5fd"
            strokeWidth="2"
          />
          <text
            x="34"
            y="26"
            fill="#ffffff"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            ROCKET
          </text>
          <text
            x="34"
            y="38"
            fill="#e2e8f0"
            fontSize="8"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            FUEL
          </text>
        </g>

        {/* 4. Fuel Line to Thruster */}
        <path d="M 240 68 L 275 68" stroke="#93c5fd" strokeWidth="5" strokeLinecap="round" />

        {/* 5. Rocket Engine / Thruster Nozzle */}
        <g transform="translate(275, 48)">
          <path
            d="M 0 10 L 32 0 L 32 40 L 0 30 Z"
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          {/* Flame Thrust */}
          <polygon
            points="32,6 74,20 32,34"
            fill="url(#thrusterFire)"
            className="animate-pulse"
          />
          <text x="16" y="24" fill="#f8fafc" fontSize="7" fontWeight="bold" textAnchor="middle">
            ENGINE
          </text>
        </g>
      </svg>

      <p className="mt-1 text-center text-[7.5px] sm:text-[8.5px] text-[#9cd8f2] tracking-wide">
        Helium acts like balloon pressure: it pushes rocket fuel down into the engine thruster.
      </p>
    </div>
  );
}

/**
 * Task3 Component
 * Matches NovaQuest dark navy + cyan glow + gold button design.
 */
export default function Task3({
  isOpen,
  onClose,
  onSolve,
  onDeductScore,
  score = 100,
}) {
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [shakenCardId, setShakenCardId] = useState(null);

  // Randomize the 4 cards order once when opened
  const shuffledCards = useMemo(() => {
    const list = [...TASK3_DATA.stepB.cards];
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, []);

  const handleSelectCard = useCallback(
    (card) => {
      setSelectedCardId(card.id);

      if (card.isCorrect) {
        setIsSolved(true);
        setFeedback({
          isCorrect: true,
          message: card.feedback,
        });
        gameAudio.playSuccess?.();
        gameAudio.playVictory?.();
      } else {
        setShakenCardId(card.id);
        setTimeout(() => setShakenCardId(null), 600);
        setFeedback({
          isCorrect: false,
          message: card.feedback,
        });
        gameAudio.playError?.();
        onDeductScore?.(10);
      }
    },
    [onDeductScore],
  );

  const handleExecuteSolution = () => {
    gameAudio.playClick?.();
    onSolve?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[280] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task3-title"
    >
      {/* Sci-fi Outer Bezel Panel */}
      <div className="relative w-full max-w-3xl my-auto rounded-2xl border-2 border-[#00f0ff]/50 bg-gradient-to-b from-[#041122] via-[#020b18] to-[#010611] p-5 sm:p-7 shadow-[0_0_60px_rgba(0,240,255,0.25)] flex flex-col gap-4">
        
        {/* Top Header */}
        <header className="flex items-start justify-between border-b border-[#00f0ff]/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-rose-500/60 bg-rose-950/60 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.26em] text-[#00f0ff]">
                  Emergency In-Flight Challenge
                </span>
                <span className="h-1 w-1 rounded-full bg-[#00f0ff]" />
                <span className="text-[8px] sm:text-[9px] font-mono text-amber-300">
                  Mission Score: {score} pts
                </span>
              </div>
              <h2
                id="task3-title"
                className="text-base sm:text-xl font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_10px_#00f0ff]"
              >
                {TASK3_DATA.title}
              </h2>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Task 3"
              className="p-1.5 rounded-lg border border-white/20 text-slate-300 hover:text-white hover:border-[#00f0ff] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        {/* STEP A: Problem Explanation (Kid-friendly, ages 8-12) */}
        <section className="space-y-3">
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              {TASK3_DATA.stepA.heading}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#cbe7f8]">
              {TASK3_DATA.stepA.explanation}
            </p>
          </div>

          {/* Animated Helium Diagram */}
          <HeliumLeakDiagram />
        </section>

        {/* STEP B: 4 Solution Cards */}
        {!isSolved ? (
          <section className="space-y-3 pt-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#7fe3ff]">
              {TASK3_DATA.stepB.prompt}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {shuffledCards.map((card, idx) => {
                const isSelected = selectedCardId === card.id;
                const isShaking = shakenCardId === card.id;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleSelectCard(card)}
                    className={`relative p-3 sm:p-4 rounded-xl border text-left transition-all duration-200 active:scale-98 flex items-start gap-3 ${
                      isShaking
                        ? 'border-rose-500 bg-rose-950/40 animate-shake'
                        : isSelected
                        ? 'border-[#00f0ff] bg-[#072d4c] shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                        : 'border-[#00f0ff]/30 bg-[#061e33]/70 hover:border-[#00f0ff]/80 hover:bg-[#0b2b48]'
                    }`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#00f0ff]/50 bg-[#031526] font-mono text-xs font-bold text-[#8ef4ff]">
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm font-medium leading-snug text-slate-100">
                      {card.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Wrong Answer Feedback Message */}
            {feedback && !feedback.isCorrect && (
              <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-950/40 flex items-start gap-2.5 text-amber-200 text-xs animate-fade-in">
                <XCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider text-amber-300">
                    Not quite right!
                  </p>
                  <p className="mt-0.5 leading-relaxed">{feedback.message}</p>
                  <p className="mt-1 font-semibold text-[10px] text-amber-400/90">
                    Try another card — you can still save the mission! (-10 score)
                  </p>
                </div>
              </div>
            )}
          </section>
        ) : (
          /* STEP C: Correct Answer Celebration + Real NASA History Fact */
          <section className="space-y-4 py-2 text-center animate-fade-in">
            {/* Celebration Badge */}
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-emerald-400 bg-gradient-to-tr from-emerald-950 to-emerald-900 shadow-[0_0_35px_rgba(52,211,153,0.6)]">
              <Sparkles className="w-8 h-8 text-emerald-300 animate-spin" />
            </div>

            <div>
              <h3 className="text-lg sm:text-2xl font-black uppercase tracking-[0.24em] text-emerald-300 drop-shadow-[0_0_12px_#34d399]">
                {TASK3_DATA.stepC.successTitle}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-emerald-100/90 mt-1">
                {TASK3_DATA.stepC.successSubtitle}
              </p>
            </div>

            {/* Real NASA History Fun Fact Box */}
            <div className="max-w-lg mx-auto p-4 rounded-xl border border-[#d6a95c] bg-gradient-to-b from-[#1c1810]/90 to-[#0e0c08]/90 text-left shadow-[0_0_24px_rgba(214,169,92,0.3)]">
              <div className="flex items-center gap-2 text-[#e8c684] text-xs font-bold uppercase tracking-widest mb-1.5">
                <Award className="w-4 h-4 text-[#f5d085]" />
                {TASK3_DATA.stepC.funFactTitle}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-[#f3e5c8]">
                {TASK3_DATA.stepC.funFact}
              </p>
            </div>

            {/* Gold CTA Action Button: Resume Video Segment 3 */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                autoFocus
                onClick={handleExecuteSolution}
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-lg border border-[#d6a95c] bg-gradient-to-b from-[#221f1a] via-[#161411] to-[#0c0a08] text-[#e8c684] shadow-[0_0_30px_rgba(214,169,92,0.4)] transition-all hover:border-[#f5d085] hover:text-[#fff0ca] hover:shadow-[0_0_40px_rgba(245,208,133,0.7)] hover:scale-[1.02] active:scale-95"
              >
                <Zap className="w-4 h-4 text-[#e8c684] transition-transform group-hover:scale-125" />
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.26em]">
                  Resume Mission & Play Part 3
                </span>
                <ChevronRight className="w-4 h-4 text-[#d6a95c] transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
