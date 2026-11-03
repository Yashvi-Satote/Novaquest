import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Archive,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  Gauge,
  Image,
  Radio,
  Scan,
  ShieldCheck,
  Signal,
  Sparkles,
  Target,
  Timer,
  Waves
} from 'lucide-react';
import { audio } from '../game/audioManager';
import {
  createNewGame,
  DEFAULT_MISSION_ECHO,
  getSaveGame,
  saveGame
} from '../game/saveManager';
import DescentSequencePuzzle from '../components/mission-echo/DescentSequencePuzzle';
import LunarSurfacePuzzle from '../components/mission-echo/LunarSurfacePuzzle';
import ArchivePuzzle from '../components/mission-echo/ArchivePuzzle';

const DIALOGUE = [
  {
    speaker: 'Maya',
    role: 'Archive Systems',
    text: 'Captain, the recovered records are intact. But there is something else hidden in the interface.'
  },
  {
    speaker: 'Arin',
    role: 'Mission Commander',
    text: 'What is it?'
  },
  {
    speaker: 'Maya',
    role: 'Archive Systems',
    text: 'A transmission pattern. It appears to have been attached to the archive.'
  },
  {
    speaker: 'Arin',
    role: 'Mission Commander',
    text: 'Can you trace it?'
  },
  {
    speaker: 'Maya',
    role: 'Archive Systems',
    text: 'Not yet. I need the structure\u2019s connection to be disconnected first.'
  }
];

const PUZZLE_STEPS = [
  {
    id: 'descent',
    letter: 'A',
    title: 'Descent sequence',
    description: 'Rebuild the controlled landing sequence.',
    completeKey: 'descentComplete'
  },
  {
    id: 'surface',
    letter: 'B',
    title: 'Lunar surface',
    description: 'Interpret footpads, rocks and slope.',
    completeKey: 'surfaceComplete'
  },
  {
    id: 'archive',
    letter: 'C',
    title: 'Image archive',
    description: 'Reassemble a damaged Surveyor record.',
    completeKey: 'archiveComplete'
  }
];

function resolveInitialStage(echoState) {
  if (echoState.stageComplete) return 'complete';
  if (echoState.clueDiscovered) return 'clue';
  if (echoState.archiveComplete) return 'restored';
  if (echoState.surfaceComplete) return 'archive';
  if (echoState.descentComplete) return 'surface';
  return 'briefing';
}

function StageProgress({ stage, echo }) {
  const activeIndex =
    stage === 'descent'
      ? 0
      : stage === 'surface'
        ? 1
        : stage === 'archive'
          ? 2
          : stage === 'restored' || stage === 'clue' || stage === 'complete'
            ? 3
            : -1;

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {PUZZLE_STEPS.map((step, index) => {
        const complete = Boolean(echo[step.completeKey]);
        const active = activeIndex === index;
        return (
          <div
            key={step.id}
            className={`relative overflow-hidden rounded-xl border px-3.5 py-3 transition-all ${
              complete
                ? 'border-emerald-500/35 bg-emerald-950/25'
                : active
                  ? 'border-cyan-400/50 bg-cyan-500/10 shadow-lg shadow-cyan-950/20'
                  : 'border-white/10 bg-white/[0.02] opacity-70'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-[11px] font-bold ${
                  complete
                    ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                    : active
                      ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200'
                      : 'border-white/10 bg-black/30 text-slate-500'
                }`}
              >
                {complete ? <CheckCircle2 className="h-4 w-4" /> : step.letter}
              </span>
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-200">
                  {step.title}
                </div>
                <div className="truncate text-[10px] text-slate-500">{step.description}</div>
              </div>
            </div>
            {active && <div className="absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-cyan-400" />}
          </div>
        );
      })}
    </div>
  );
}

function SignalWave() {
  const bars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, index) => ({
        id: index,
        height: `${16 + ((index * 37 + 11) % 72)}%`,
        delay: `${(index % 11) * 0.07}s`,
        duration: `${1.1 + (index % 5) * 0.13}s`,
        opacity: 0.35 + ((index * 17) % 55) / 100
      })),
    []
  );

  return (
    <div className="relative h-44 overflow-hidden rounded-xl border border-fuchsia-500/25 bg-[#090510]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,70,239,0.16),transparent_60%)]" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-fuchsia-400/20" />
      <div className="absolute inset-0 flex items-center justify-center gap-[3px] px-4">
        {bars.map((bar) => (
          <span
            key={bar.id}
            className="me-signal-bar w-1 rounded-full bg-gradient-to-t from-fuchsia-600 via-purple-400 to-cyan-300"
            style={{
              height: bar.height,
              animationDelay: bar.delay,
              animationDuration: bar.duration,
              opacity: bar.opacity
            }}
          />
        ))}
      </div>
      <div className="me-scanlines pointer-events-none absolute inset-0 opacity-40" />
      <div className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.18em] text-fuchsia-300">
        Residual signal // not archive data
      </div>
      <div className="absolute bottom-3 right-3 font-mono text-[9px] text-slate-500">
        PATTERN LOCK: 61.4%
      </div>
    </div>
  );
}

function DialogueBubble({ entry }) {
  const isCommander = entry.speaker === 'Arin';
  return (
    <div className={`flex gap-2.5 ${isCommander ? 'flex-row-reverse text-right' : ''}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-bold ${
          isCommander
            ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-200'
            : 'border-fuchsia-400/35 bg-fuchsia-500/15 text-fuchsia-200'
        }`}
      >
        {entry.speaker.charAt(0)}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl border p-3 ${
          isCommander
            ? 'border-cyan-500/25 bg-cyan-950/25'
            : 'border-fuchsia-500/25 bg-fuchsia-950/20'
        }`}
      >
        <div
          className={`font-mono text-[9px] uppercase tracking-[0.16em] ${
            isCommander ? 'text-cyan-300' : 'text-fuchsia-300'
          }`}
        >
          {entry.speaker} · {entry.role}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-200">{entry.text}</p>
      </div>
    </div>
  );
}

export default function MissionEchoPage() {
  const navigate = useNavigate();
  const [save, setSave] = useState(() => getSaveGame());
  const [stage, setStage] = useState(() => {
    const current = getSaveGame();
    return resolveInitialStage({ ...DEFAULT_MISSION_ECHO, ...(current?.missionEcho || {}) });
  });
  const [revealedLines, setRevealedLines] = useState(() => {
    const current = getSaveGame();
    const echo = { ...DEFAULT_MISSION_ECHO, ...(current?.missionEcho || {}) };
    return echo.clueDiscovered ? DIALOGUE.length : 0;
  });
  const [showResultDetails, setShowResultDetails] = useState(false);

  const echo = { ...DEFAULT_MISSION_ECHO, ...(save?.missionEcho || {}) };
  const completedPuzzles = PUZZLE_STEPS.filter((step) => echo[step.completeKey]).length;
  const integrity = Math.round((completedPuzzles / PUZZLE_STEPS.length) * 100);

  const starPositions = useMemo(
    () =>
      Array.from({ length: 70 }, (_, index) => ({
        id: index,
        left: `${(index * 47 + 13) % 100}%`,
        top: `${(index * 29 + 7) % 100}%`,
        size: index % 9 === 0 ? 2 : 1,
        opacity: 0.18 + ((index * 23) % 55) / 100
      })),
    []
  );

  const commitEcho = useCallback((patch, extra = {}) => {
    const current = getSaveGame() || createNewGame();
    const baseEcho = { ...DEFAULT_MISSION_ECHO, ...(current.missionEcho || {}) };
    const nextSave = {
      ...current,
      ...extra,
      missionEcho: { ...baseEcho, ...patch }
    };
    saveGame(nextSave);
    setSave(nextSave);
    return nextSave;
  }, []);

  useEffect(() => {
    const existing = getSaveGame();

    if (!existing) {
      const fresh = createNewGame();
      setSave(fresh);
    } else if (!existing.missionEcho?.stageComplete && existing.currentChapter !== 'mission_echo') {
      const nextSave = {
        ...existing,
        currentChapter: 'mission_echo',
        title: 'Stage 5: Mission Echo',
        location: 'Mission Echo Reconstruction Interface',
        objective:
          'Reconstruct Surveyor 1\u2019s descent, surface observations and image archive.'
      };
      saveGame(nextSave);
      setSave(nextSave);
    }

    const current = getSaveGame();
    const currentEcho = { ...DEFAULT_MISSION_ECHO, ...(current?.missionEcho || {}) };
    setStage(resolveInitialStage(currentEcho));
    setRevealedLines(currentEcho.clueDiscovered ? DIALOGUE.length : 0);
    audio.startAmbience();
  }, []);

  const handleBack = () => {
    audio.playClick();
    navigate('/app');
  };

  const handleReturnToMission = () => {
    audio.playClick();
    navigate('/play');
  };

  const handleBegin = () => {
    audio.playStartGame();
    commitEcho({ unlocked: true });
    setStage('descent');
  };

  const handleDescentSolved = () => {
    commitEcho({ unlocked: true, descentComplete: true });
  };

  const handleSurfaceSolved = () => {
    commitEcho({ surfaceComplete: true });
  };

  const handleArchiveRestored = (frame) => {
    commitEcho({ archiveComplete: true, restoredFrame: frame?.title || 'Frame 042' });
    setShowResultDetails(false);
    setStage('restored');
  };

  const handleInspectSignal = () => {
    audio.playClick();
    setStage('clue');
  };

  const handleRevealLine = () => {
    if (revealedLines >= DIALOGUE.length) return;
    audio.playClick();
    const nextCount = Math.min(revealedLines + 1, DIALOGUE.length);
    setRevealedLines(nextCount);
    if (nextCount === DIALOGUE.length) {
      commitEcho({ clueDiscovered: true });
    }
  };

  const handleComplete = () => {
    audio.playStartGame();
    commitEcho(
      { clueDiscovered: true, stageComplete: true, completedAt: Date.now() },
      {
        currentChapter: 'recovery',
        title: 'Recovery: Signal Trace',
        location: 'Mission Echo Reconstruction Interface',
        objective:
          'Disconnect the structure\u2019s connection and trace the embedded transmission.'
      }
    );
    setStage('complete');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02050b] font-sans text-slate-100 selection:bg-cyan-400/30">
      {/* Deep-space background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(8,145,178,0.16),transparent_34%),radial-gradient(circle_at_84%_20%,rgba(139,92,246,0.12),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.08),transparent_40%)]" />
        {starPositions.map((star) => (
          <span
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity
            }}
          />
        ))}
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#02050b]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition-colors hover:border-cyan-400/40 hover:text-white"
              title="Return to main menu"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-300 shadow-lg shadow-fuchsia-950/30">
              <Archive className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
                <span>NovaQuest</span>
                <span className="text-slate-700">/</span>
                <span className="text-fuchsia-300">Stage 5</span>
                <span className="hidden rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-cyan-300 sm:inline">
                  Reconstruction system
                </span>
              </div>
              <h1 className="truncate text-lg font-bold tracking-wide text-white">Mission Echo</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
            <span className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-slate-400 sm:flex">
              <Timer className="h-3.5 w-3.5 text-cyan-400" />≈ 7 min
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 text-emerald-300">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              Link online
            </span>
            <button
              type="button"
              onClick={handleReturnToMission}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-cyan-200 transition-colors hover:bg-cyan-500/20"
            >
              <Target className="h-3.5 w-3.5" />
              Mission control
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        <div className="mb-5 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-fuchsia-300">
                <Sparkles className="h-3.5 w-3.5" />
                Mission Echo // Historical reconstruction
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Stage 5 — Reconstructing Surveyor 1
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400 sm:text-sm">
                Recovered telemetry, images and archived records flow through the alien interface. Rebuild
                three pieces of Surveyor 1&apos;s historic mission — and notice what does not belong.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2">
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Archive integrity</div>
                <div className="font-mono text-lg font-bold text-cyan-300">{integrity}%</div>
              </div>
              <div className="hidden rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 sm:block">
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Record state</div>
                <div className="font-mono text-sm font-bold text-slate-200">
                  {echo.stageComplete ? 'Complete' : `${completedPuzzles} / 3`}
                </div>
              </div>
            </div>
          </div>

          <StageProgress stage={stage} echo={echo} />
        </div>

        <div key={stage} className="animate-fade-in">
          {stage === 'briefing' && (
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-2xl border border-cyan-500/20 bg-[#050b16]/85 p-5 shadow-2xl shadow-cyan-950/30 sm:p-7">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                  <Radio className="h-4 w-4 animate-pulse" />
                  Reconstruction link online
                </div>
                <h3 className="mt-4 max-w-lg text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Three records. One historic landing.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Mission Echo is a fictional reconstruction system. It uses recovered telemetry, images
                  and archived records to recreate parts of Surveyor 1&apos;s mission.
                </p>

                <div className="mt-4 rounded-xl border border-fuchsia-500/25 bg-fuchsia-950/15 p-4">
                  <p className="text-xs italic leading-relaxed text-fuchsia-100/85">
                    &ldquo;It is not time travel. It is not a recording of a living person. It is a
                    reconstruction of historical events.&rdquo;
                  </p>
                  <div className="mt-2 font-mono text-[9px] uppercase tracking-widest text-fuchsia-300/70">
                    Mission Echo operating note
                  </div>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {PUZZLE_STEPS.map((step) => (
                    <div key={step.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cyan-300">
                        <span className="flex h-5 w-5 items-center justify-center rounded border border-cyan-500/30 bg-cyan-500/10 text-[9px]">
                          {step.letter}
                        </span>
                        {step.title}
                      </div>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{step.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleBegin}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-cyan-700/30 transition-all hover:scale-[1.01] hover:from-cyan-400 hover:to-indigo-500 active:scale-[0.99]"
                  >
                    Begin descent reconstruction
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleReturnToMission}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
                  >
                    Mission control
                  </button>
                </div>

                <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
                  Prototype reconstruction. The interface, recovery process and alien connection are
                  fictional story elements; the historical mission result is real.
                </p>
              </div>

              <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-black">
                <img
                  src="/images/surveyor1_moon_earth.jpg"
                  alt="Surveyor 1 lander resting on the lunar surface with Earth in the distance"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02050b] via-[#02050b]/25 to-black/45" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_30%,rgba(2,5,11,0.55)_100%)]" />
                <div className="me-scanlines absolute inset-0 opacity-30" />

                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-cyan-400/25 bg-black/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-cyan-200 backdrop-blur">
                  <Scan className="h-3 w-3" />
                  Historical reference // Surveyor 1
                </div>

                <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/10 bg-black/70 p-4 backdrop-blur-md">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300">
                    Mission record · 1966
                  </div>
                  <div className="mt-1 text-base font-bold text-white">First American soft lunar landing</div>
                  <div className="mt-1 font-mono text-[10px] text-slate-400">
                    Oceanus Procellarum · 2 June 1966
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      Image archive
                    </span>
                    <span className="font-mono text-sm font-bold text-cyan-300">11,240 frames</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {stage === 'descent' && (
            <DescentSequencePuzzle
              completed={echo.descentComplete}
              onSolved={handleDescentSolved}
              onContinue={() => {
                audio.playClick();
                setStage('surface');
              }}
            />
          )}

          {stage === 'surface' && (
            <LunarSurfacePuzzle
              completed={echo.surfaceComplete}
              onSolved={handleSurfaceSolved}
              onContinue={() => {
                audio.playClick();
                setStage('archive');
              }}
            />
          )}

          {stage === 'archive' && <ArchivePuzzle onRestore={handleArchiveRestored} />}

          {stage === 'restored' && (
            <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/35 to-[#050b16] p-6 text-center shadow-2xl shadow-emerald-950/20 sm:p-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-900/30">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300">
                  Archive restored
                </div>
                <div className="mt-2 font-mono text-5xl font-black tracking-tight text-white sm:text-6xl">
                  11,240
                </div>
                <div className="mt-1 text-sm font-medium text-slate-300">Surveyor 1 images</div>

                <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4 text-left font-mono text-[10px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Recovered record</span>
                    <span className="text-slate-200">{echo.restoredFrame || 'Frame 042'}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-slate-500">Archive integrity</span>
                    <span className="text-emerald-300">100%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-slate-500">Recovery state</span>
                    <span className="text-emerald-300">Stable</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-widest text-emerald-300/80">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Historical archive recovered
                </div>
                <div className="me-scanlines pointer-events-none absolute inset-0 opacity-20" />
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-[#050b16]/85 p-5 shadow-2xl shadow-cyan-950/30 sm:p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                  Historical mission result
                </div>
                <h3 className="mt-1 text-2xl font-black text-white">Mission record recovered</h3>

                <ul className="mt-4 space-y-2.5">
                  {[
                    'Successful lunar soft landing.',
                    'Lunar surface imaging.',
                    'Scientific observations.',
                    'Historic engineering achievement.'
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-xs leading-relaxed text-slate-300">
                  The Surveyor programme helped investigate lunar surface conditions, which was important
                  for planning future human lunar exploration.
                </div>

                <div className="mt-4 rounded-xl border border-fuchsia-500/25 bg-fuchsia-950/15 p-3">
                  <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-fuchsia-300">
                    <Signal className="h-3.5 w-3.5 animate-pulse" />
                    Unexpected signal pattern detected
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                    One layer of the interface does not match the historical image archive.
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleInspectSignal}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-fuchsia-900/30 transition-all hover:scale-[1.01]"
                  >
                    Inspect anomalous signal
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setShowResultDetails((value) => !value);
                    }}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
                  >
                    {showResultDetails ? 'Hide note' : 'Mission note'}
                  </button>
                </div>

                {showResultDetails && (
                  <p className="mt-3 animate-fade-in text-[10px] leading-relaxed text-slate-500">
                    The number of images is a historical reference. The fictional recovery process and the
                    alien connection are story elements.
                  </p>
                )}
              </div>
            </div>
          )}

          {stage === 'clue' && (
            <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-fuchsia-500/30 bg-[#080510] p-4 shadow-2xl shadow-fuchsia-950/20 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">
                      Anomaly analysis
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-fuchsia-300">
                      <Activity className="h-3 w-3" />
                      Live
                    </span>
                  </div>
                  <h3 className="mt-1 text-xl font-bold text-white">Separate signal pattern</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    It is embedded in the data interface, but it does not match the historical image
                    archive.
                  </p>

                  <div className="mt-4">
                    <SignalWave />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[9px]">
                    <div className="rounded-lg border border-white/10 bg-black/30 p-2">
                      <div className="text-slate-600">ORIGIN</div>
                      <div className="mt-0.5 text-fuchsia-300">UNKNOWN</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-2">
                      <div className="text-slate-600">MATCH</div>
                      <div className="mt-0.5 text-rose-300">NONE</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-2">
                      <div className="text-slate-600">STATE</div>
                      <div className="mt-0.5 text-amber-300">ATTACHED</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cyan-300">
                    <Database className="h-3.5 w-3.5" />
                    Recovery requirement
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                    Maya cannot trace the transmission until the structure&apos;s connection is disconnected.
                    That operation begins in the recovery stage.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-[#050b16]/85 p-5 shadow-2xl shadow-cyan-950/30 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                      Interface dialogue
                    </div>
                    <h3 className="mt-1 text-2xl font-black text-white">Something else is hidden</h3>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-slate-400">
                    {revealedLines} / {DIALOGUE.length}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {DIALOGUE.slice(0, revealedLines).map((entry, index) => (
                    <DialogueBubble key={`${entry.speaker}-${index}`} entry={entry} />
                  ))}

                  {revealedLines === 0 && (
                    <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-center">
                      <Waves className="mx-auto h-6 w-6 animate-pulse text-fuchsia-300" />
                      <p className="mt-2 text-xs text-slate-400">
                        A transmission is waiting beneath the archive layer.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  {revealedLines < DIALOGUE.length ? (
                    <button
                      type="button"
                      onClick={handleRevealLine}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-fuchsia-900/30 transition-all hover:scale-[1.01]"
                    >
                      <Scan className="h-4 w-4" />
                      Decrypt next transmission
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-[11px] leading-relaxed text-amber-200">
                        <Signal className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-pulse" />
                        <span>
                          Signal trace locked to the recovery stage. The structure&apos;s connection must be
                          disconnected first.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleComplete}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-800/30 transition-all hover:scale-[1.01]"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Complete Stage 5
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-widest text-slate-600">
                  <Cpu className="h-3 w-3" />
                  Alien interface layer // non-historical signal
                </div>
              </div>
            </div>
          )}

          {stage === 'complete' && (
            <div className="mx-auto max-w-3xl space-y-5">
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/35 to-[#050b16] p-6 text-center shadow-2xl shadow-emerald-950/20 sm:p-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-900/30">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300">
                  Stage 5 complete
                </div>
                <h3 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Mission Echo reconstructed
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                  Surveyor 1&apos;s descent, surface evidence and image archive have been recovered. The
                  historical record is intact — and a second signal is waiting beneath it.
                </p>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  {PUZZLE_STEPS.map((step) => (
                    <div
                      key={step.id}
                      className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3"
                    >
                      <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-300" />
                      <div className="mt-1.5 font-mono text-[9px] uppercase tracking-widest text-emerald-200">
                        {step.letter} · {step.title}
                      </div>
                      <div className="mt-0.5 text-[10px] text-emerald-300/70">Complete</div>
                    </div>
                  ))}
                </div>
                <div className="me-scanlines pointer-events-none absolute inset-0 opacity-20" />
              </div>

              <div className="rounded-2xl border border-fuchsia-500/25 bg-[#080510] p-5 shadow-2xl shadow-fuchsia-950/20 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">
                    Next objective // Recovery stage
                  </div>
                  <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-fuchsia-300">
                    Unlocked
                  </span>
                </div>
                <h4 className="mt-2 text-xl font-bold text-white">Trace the embedded transmission</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Maya has isolated a signal that does not belong to the Surveyor 1 archive. The next step
                  is to disconnect the structure&apos;s connection and follow it.
                </p>
                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-[11px] italic text-slate-300">
                  &ldquo;Not yet. I need the structure&apos;s connection to be disconnected first.&rdquo;
                  <div className="mt-1 font-mono text-[9px] not-italic uppercase tracking-widest text-fuchsia-300/70">
                    Maya Chen · Archive Systems
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleReturnToMission}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-cyan-800/30 transition-all hover:scale-[1.01]"
                  >
                    <Target className="h-4 w-4" />
                    Return to mission control
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
                  >
                    Main menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 font-mono text-[9px] uppercase tracking-widest text-slate-600">
          <div className="flex items-center gap-2">
            <Gauge className="h-3 w-3 text-cyan-500/60" />
            Mission Echo · reconstruction integrity {integrity}%
          </div>
          <div className="flex items-center gap-2">
            <Image className="h-3 w-3 text-slate-600" />
            Historical reference · fictional recovery interface
          </div>
        </footer>
      </main>
    </div>
  );
}
