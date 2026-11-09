import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Sliders, 
  Camera, 
  FileSearch, 
  Sparkles, 
  Zap,
  ArrowRight,
  RotateCcw,
  Radio,
  Eye,
  AlertTriangle,
  Info,
  Check,
  Compass
} from 'lucide-react';
import { audio } from '../../game/audioManager';

/**
 * Stage 5 — Mission Echo: Reconstructing Surveyor 1
 * 
 * Mission Echo is a fictional reconstruction system that uses recovered telemetry, 
 * images, and archived records to recreate parts of Surveyor 1's historic 1966 mission.
 * It is not time travel. It is a reconstruction of historical events.
 * 
 * The player completes three separate challenges:
 * Puzzle A — The descent sequence (Controlled braking & touchdown sequence)
 * Puzzle B — Reading the lunar surface (Matching surface observations to interpretations)
 * Puzzle C — Restore the image archive (3x3 tile restoration of the 11,240 historical photos)
 * Followed by The Mystery Clue: Uncovering the anomalous transmission attached to the archive.
 */

// Available landing stages for Puzzle A
const DESCENT_STAGES = [
  {
    id: 'stage_retro',
    stepNumber: 1,
    title: 'Main Retro-Rocket Ignition',
    description: 'Solid propellant rocket burns at 75 km altitude, canceling 2,600 m/s approach velocity.'
  },
  {
    id: 'stage_jettison',
    stepNumber: 2,
    title: 'Jettison Burned Retromotor & Radar Altimeter Lock',
    description: 'Empty solid motor casing is ejected at 11 km as RADVS Doppler radar locks onto lunar terrain.'
  },
  {
    id: 'stage_vernier',
    stepNumber: 3,
    title: 'Three Vernier Engines Controlled Deceleration',
    description: 'Throttleable liquid engines stabilize attitude and bring descent rate smoothly down to 1.5 m/s.'
  },
  {
    id: 'stage_cutoff',
    stepNumber: 4,
    title: 'Engine Cutoff at 3.4m & Honeycomb Footpad Touchdown',
    description: 'Vernier thrusters shut down at 3.4 meters to prevent dust blast; freefall to crushable footpads.'
  }
];

// Initial scrambled tile order for Puzzle C (3x3 grid)
const INITIAL_SCRAMBLED_TILES = [4, 0, 7, 1, 6, 2, 8, 3, 5];

export default function MissionEchoModal({ isOpen, onClose, onCompleteEcho, mcName = 'Captain Arin Rao', mcFirstName = 'Arin' }) {
  const [currentStep, setCurrentStep] = useState(1);

  // ==========================================
  // PUZZLE A: THE DESCENT SEQUENCE STATE
  // ==========================================
  const [selectedStages, setSelectedStages] = useState({
    step1: '',
    step2: '',
    step3: '',
    step4: ''
  });
  const [descentSolved, setDescentSolved] = useState(false);
  const [descentFeedback, setDescentFeedback] = useState(null);
  const [isSimulatingDescent, setIsSimulatingDescent] = useState(false);
  const [descentAltitude, setDescentAltitude] = useState(75.0);

  // ==========================================
  // PUZZLE B: READING THE LUNAR SURFACE STATE
  // ==========================================
  const [surfaceAnswers, setSurfaceAnswers] = useState({
    footpad: '',
    rocks: '',
    slope: ''
  });
  const [surfaceSolved, setSurfaceSolved] = useState(false);
  const [surfaceFeedback, setSurfaceFeedback] = useState(null);

  // ==========================================
  // PUZZLE C: RESTORE THE IMAGE ARCHIVE STATE
  // ==========================================
  const [tiles, setTiles] = useState(INITIAL_SCRAMBLED_TILES);
  const [selectedTileIdx, setSelectedTileIdx] = useState(null);
  const [archiveSolved, setArchiveSolved] = useState(false);
  const [showMysteryClue, setShowMysteryClue] = useState(false);
  const [clueDialogueStep, setClueDialogueStep] = useState(0);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const playerSpeaker = mcName || 'Captain Arin Rao';
  const playerCallsign = `${(mcFirstName || 'ARIN').toUpperCase()}-COMMAND`;

  // Dialogue steps for the Mystery Clue
  const MYSTERY_DIALOGUE = [
    {
      speaker: 'Specialist Maya Chen',
      callsign: 'CHEN-SCIENCE',
      text: "Captain, the recovered records are intact. But there is something else hidden in the interface."
    },
    {
      speaker: playerSpeaker,
      callsign: playerCallsign,
      text: "What is it?"
    },
    {
      speaker: 'Specialist Maya Chen',
      callsign: 'CHEN-SCIENCE',
      text: "A transmission pattern. It appears to have been attached to the archive."
    },
    {
      speaker: playerSpeaker,
      callsign: playerCallsign,
      text: "Can you trace it?"
    },
    {
      speaker: 'Specialist Maya Chen',
      callsign: 'CHEN-SCIENCE',
      text: "Not yet. I need the structure's connection to be disconnected first."
    }
  ];

  // Auto-progress Mystery Dialogue when unlocked
  useEffect(() => {
    if (!showMysteryClue) return;
    setClueDialogueStep(0);
    audio.playGlitchBurst();

    const timers = [
      setTimeout(() => {
        setClueDialogueStep(1);
        audio.playEquipmentFeedback();
      }, 4000),
      setTimeout(() => {
        setClueDialogueStep(2);
        audio.playRadioCommsChatter('chen');
      }, 7500),
      setTimeout(() => {
        setClueDialogueStep(3);
        audio.playEquipmentFeedback();
      }, 11500),
      setTimeout(() => {
        setClueDialogueStep(4);
        audio.playRadioCommsChatter('chen');
      }, 15000)
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, [showMysteryClue]);

  if (!isOpen) return null;

  // ==========================================
  // PUZZLE A LOGIC
  // ==========================================
  const handleCheckDescent = () => {
    audio.playClick();
    const { step1, step2, step3, step4 } = selectedStages;

    if (!step1 || !step2 || !step3 || !step4) {
      setDescentFeedback({
        type: 'error',
        message: 'Incomplete sequence. Please select a stage for all 4 steps before checking.'
      });
      return;
    }

    const isCorrect = 
      step1 === 'stage_retro' &&
      step2 === 'stage_jettison' &&
      step3 === 'stage_vernier' &&
      step4 === 'stage_cutoff';

    if (isCorrect) {
      audio.playInteract();
      setIsSimulatingDescent(true);
      setDescentFeedback({
        type: 'success',
        message: 'SEQUENCE VERIFIED: Main retro-rocket ignition cancels velocity, radar altimeter tracks descent, Vernier thrusters decelerate to 1.5 m/s, and engine cutoff at 3.4m ensures clean regolith touchdown.'
      });

      // Animate simulated descent from 75km to touchdown
      let alt = 75.0;
      const interval = setInterval(() => {
        alt -= 4.2;
        if (alt <= 0) {
          alt = 0;
          clearInterval(interval);
          setIsSimulatingDescent(false);
          setDescentSolved(true);
          audio.playMissionEchoActivation();
        }
        setDescentAltitude(Math.max(0, +alt.toFixed(1)));
      }, 65);
    } else {
      const errorNotes = [];
      if (step1 !== 'stage_retro') {
        errorNotes.push('Step 1 Mistake: Spacecraft arrives from translunar trajectory at 2,600 m/s. The solid main retro-rocket ignition is required at 75 km altitude to kill 95% of orbital momentum before other thrusters can steer.');
      }
      if (step2 !== 'stage_jettison') {
        errorNotes.push('Step 2 Mistake: The 560 kg spent solid rocket motor casing blocks the radar altimeter and Doppler velocity beams. It must be pyrotechnically jettisoned at 11 km to clear radar sensors.');
      }
      if (step3 !== 'stage_vernier') {
        errorNotes.push('Step 3 Mistake: Three throttleable liquid Vernier thrusters must take over at 11 km to steer attitude and brake descent smoothly down to 1.5 m/s.');
      }
      if (step4 !== 'stage_cutoff') {
        errorNotes.push('Step 4 Mistake: Verniers must cut off at 3.4 meters. Firing rocket engines all the way to ground contact will blow abrasive dust into Vidicon quartz optics and cause engine backpressure damage.');
      }

      setDescentFeedback({
        type: 'error',
        title: 'SEQUENCE CALIBRATION MISMATCH — MISTAKE ANALYSIS',
        mistakes: errorNotes,
        message: 'The landing sequence violates lunar orbital descent physics. Review the explanation above, adjust any mistaken step, or click Quick Sequence Assist.'
      });
    }
  };

  const handleAutoSolveDescent = () => {
    audio.playInteract();
    setSelectedStages({
      step1: 'stage_retro',
      step2: 'stage_jettison',
      step3: 'stage_vernier',
      step4: 'stage_cutoff'
    });
    setDescentAltitude(0);
    setIsSimulatingDescent(false);
    setDescentSolved(true);
    setDescentFeedback({
      type: 'success',
      message: 'SIMPLIFIED SEQUENCE VERIFIED: Main retro-rocket cancels orbital speed, spent motor is jettisoned, Vernier engines decelerate to 1.5 m/s, and engines cutoff at 3.4m for touchdown.'
    });
    audio.playMissionEchoActivation();
  };

  // ==========================================
  // PUZZLE B LOGIC
  // ==========================================
  const handleVerifySurfaceObservations = () => {
    audio.playClick();
    const { footpad, rocks, slope } = surfaceAnswers;

    if (!footpad || !rocks || !slope) {
      setSurfaceFeedback({
        type: 'error',
        message: 'Please select an interpretation for all 3 highlighted surface observations before verifying.'
      });
      return;
    }

    const isFootpadCorrect = footpad === 'contact';
    const isRocksCorrect = rocks === 'terrain';
    const isSlopeCorrect = slope === 'stability';

    if (isFootpadCorrect && isRocksCorrect && isSlopeCorrect) {
      audio.playInteract();
      setSurfaceSolved(true);
      setSurfaceFeedback({
        type: 'success',
        message: 'SURFACE ANALYSIS CONFIRMED: Footpad impressions proved lunar soil had sufficient bearing strength (~35 kPa) to support heavy spacecraft. Rock distributions documented impact ejecta blankets, and the 1.2° slope verified tripod landing stability.'
      });
    } else {
      const detailedErrors = [];
      if (!isFootpadCorrect) {
        detailedErrors.push('Footpad Impression: The 5.2 cm regolith displacement trench proved soil mechanical bearing capacity (~35 kPa) to confirm astronauts would not sink into quicksand dust, not thermal resistance.');
      }
      if (!isRocksCorrect) {
        detailedErrors.push('Rock Distribution: Angular boulder distribution documents impact breccia ejecta blankets excavated by meteorite impacts, not volcanic lava flows.');
      }
      if (!isSlopeCorrect) {
        detailedErrors.push('Surface Slope: The 1.2° local tilt confirmed the landing gear could maintain static equilibrium without tipping over on the mare plains, not seismic plate faulting.');
      }

      setSurfaceFeedback({
        type: 'error',
        title: 'SURFACE INTERPRETATION MISMATCH — GEOLOGICAL ANALYSIS',
        mistakes: detailedErrors,
        message: 'One or more observations were correlated with incorrect geological principles. Review the analysis above, adjust the selections, or click Quick Verify Assist.'
      });
    }
  };

  const handleAutoSolveSurface = () => {
    audio.playInteract();
    setSurfaceAnswers({
      footpad: 'contact',
      rocks: 'terrain',
      slope: 'stability'
    });
    setSurfaceSolved(true);
    setSurfaceFeedback({
      type: 'success',
      message: 'SURFACE ANALYSIS CONFIRMED: Footpad impressions proved lunar soil had sufficient bearing strength to support heavy spacecraft. Rock distributions documented impact ejecta blankets, and the 1.2° slope verified tripod landing stability.'
    });
    audio.playMissionEchoActivation();
  };

  // ==========================================
  // PUZZLE C LOGIC
  // ==========================================
  const handleTileClick = (index) => {
    if (archiveSolved) return;
    audio.playClick();

    if (selectedTileIdx === null) {
      setSelectedTileIdx(index);
    } else {
      if (selectedTileIdx === index) {
        setSelectedTileIdx(null);
        return;
      }
      // Swap tiles
      const newTiles = [...tiles];
      const temp = newTiles[selectedTileIdx];
      newTiles[selectedTileIdx] = newTiles[index];
      newTiles[index] = temp;
      setTiles(newTiles);
      setSelectedTileIdx(null);

      // Check if solved (0, 1, 2, 3, 4, 5, 6, 7, 8)
      const isSolved = newTiles.every((val, idx) => val === idx);
      if (isSolved) {
        audio.playAnomalyHarmonic();
        setArchiveSolved(true);
        setTimeout(() => {
          setShowMysteryClue(true);
        }, 1800);
      }
    }
  };

  const handleAutoSolveArchive = () => {
    audio.playInteract();
    setTiles([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    setSelectedTileIdx(null);
    setArchiveSolved(true);
    setTimeout(() => {
      setShowMysteryClue(true);
    }, 1800);
  };

  const handleFinishMissionEcho = () => {
    audio.playInteract();
    if (onCompleteEcho) {
      onCompleteEcho();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg animate-fade-in font-mono select-none">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-950/95 border-2 border-cyan-500/60 shadow-[0_0_60px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Holographic Header */}
        <header className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 via-slate-950 to-indigo-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-amber-300 tracking-widest uppercase flex items-center gap-2">
                <span>TEMPORAL ARCHIVE · NASA HEADQUARTERS (1966)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
                Stage 5 — Reconstructing the Past: Surveyor 1
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] text-cyan-300 font-mono">
              Progress Preserved · Challenge {currentStep}/3
            </span>
            <button
              type="button"
              onClick={() => { audio.playClick(); onClose(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close [Esc] (Puzzle progress is preserved)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Narrative Context Banner: Past of NASA HQ */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-amber-950/30 via-slate-900 to-cyan-950/30 border-b border-cyan-500/20 text-[11px] text-slate-200 flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="font-sans leading-relaxed">
            <strong className="text-amber-300">NASA Headquarters (June 2, 1966):</strong> The structure's interface reconstructs the past of NASA headquarters. Complete the simplified 3-part reconstruction of Surveyor 1's historic mission to extract the archive and return to reality on the Moon.
          </span>
        </div>

        {/* Multi-Step Challenge Navigation Tabs */}
        <div className="flex border-b border-cyan-500/30 bg-black/40 text-xs">
          <button
            type="button"
            onClick={() => { audio.playClick(); setCurrentStep(1); }}
            className={`flex-1 py-3 px-3 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 font-bold tracking-wider uppercase transition-colors border-r border-cyan-500/20 ${
              currentStep === 1 
                ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-b-cyan-400' 
                : descentSolved ? 'text-emerald-400 hover:bg-white/5' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            {descentSolved ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <span className="font-mono text-cyan-400">A.</span>}
            <span className="truncate">Descent Sequence</span>
          </button>

          <button
            type="button"
            onClick={() => { audio.playClick(); setCurrentStep(2); }}
            className={`flex-1 py-3 px-3 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 font-bold tracking-wider uppercase transition-colors border-r border-cyan-500/20 ${
              currentStep === 2 
                ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-b-cyan-400' 
                : surfaceSolved ? 'text-emerald-400 hover:bg-white/5' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            {surfaceSolved ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <span className="font-mono text-cyan-400">B.</span>}
            <span className="truncate">Lunar Surface</span>
          </button>

          <button
            type="button"
            onClick={() => { audio.playClick(); setCurrentStep(3); }}
            className={`flex-1 py-3 px-3 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 font-bold tracking-wider uppercase transition-colors ${
              currentStep === 3 
                ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-b-cyan-400' 
                : archiveSolved ? 'text-emerald-400 hover:bg-white/5' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            {archiveSolved ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <span className="font-mono text-cyan-400">C.</span>}
            <span className="truncate">Image Archive</span>
          </button>
        </div>

        {/* Content Body */}
        <main className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar text-xs">
          
          {/* ========================================================= */}
          {/* PUZZLE A — THE DESCENT SEQUENCE                           */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                <div className="text-[11px] font-bold text-cyan-300 uppercase flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>Puzzle A — The Descent Sequence</span>
                  </div>
                  <span className="text-[10px] text-amber-300/80 font-normal">
                    Objective: Understand controlled lunar landing
                  </span>
                </div>
                <p className="text-slate-300 text-xs font-sans leading-relaxed">
                  Arrange the simplified 4-stage landing sequence into the correct order. 
                  Controlled braking and deceleration are essential—a spacecraft cannot simply drop onto the Moon.
                </p>
                <div className="text-[10px] text-slate-500 italic font-mono pt-0.5">
                  * Prototype puzzle demonstration. The simplified sequence is not an exact reproduction of Surveyor 1 flight software.
                </div>
              </div>

              {/* Holographic Descent Telemetry Visualization */}
              <div className="p-4 rounded-xl bg-black/70 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-400/40 flex items-center justify-center">
                    <Zap className={`w-6 h-6 text-cyan-400 ${isSimulatingDescent ? 'animate-bounce' : ''}`} />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Holographic Descent Simulation</div>
                    <div className="text-lg font-bold text-white font-mono flex items-center gap-2">
                      <span>ALTITUDE: {descentAltitude.toFixed(1)} km</span>
                      {descentSolved && <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 uppercase">TOUCHDOWN CONFIRMED</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono">
                  <div className="text-slate-400">DESCENT RATE</div>
                  <div className={`font-bold ${descentSolved ? 'text-emerald-400' : 'text-cyan-300'}`}>
                    {descentSolved ? '3.05 m/s (Soft Touchdown)' : '2,600 -> 1.5 m/s Profile'}
                  </div>
                </div>
              </div>

              {/* 4-Step Descent Selector */}
              <div className="space-y-2.5">
                {[1, 2, 3, 4].map((stepNum) => {
                  const key = `step${stepNum}`;
                  return (
                    <div key={key} className="p-3 rounded-xl bg-black/50 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 font-bold text-white min-w-[100px]">
                        <span className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-xs text-cyan-300">
                          {stepNum}
                        </span>
                        <span>Step {stepNum}</span>
                      </div>

                      <select
                        value={selectedStages[key]}
                        onChange={(e) => setSelectedStages({ ...selectedStages, [key]: e.target.value })}
                        disabled={descentSolved}
                        className="w-full sm:w-auto flex-1 bg-slate-900 border border-cyan-500/40 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="">Select a stage...</option>
                        {DESCENT_STAGES.map((stg) => (
                          <option key={stg.id} value={stg.id}>
                            {stg.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* Feedback Alert with Mistake Explanation & Retry */}
              {descentFeedback && (
                <div className={`p-3.5 rounded-xl border text-xs font-sans leading-relaxed space-y-2 ${
                  descentFeedback.type === 'success' 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                    : 'bg-amber-950/50 border-amber-500/50 text-amber-200 shadow-inner'
                }`}>
                  <div className="font-bold flex items-center justify-between text-xs uppercase tracking-wider">
                    <span>{descentFeedback.title || (descentFeedback.type === 'success' ? 'Telemetry Confirmed' : 'Sequence Calibration Notice')}</span>
                    {descentFeedback.type === 'error' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/60 border border-amber-400 text-amber-300 font-mono">
                        Retry Allowed · No Penalty
                      </span>
                    )}
                  </div>
                  {descentFeedback.mistakes && (
                    <ul className="space-y-1.5 pl-2 border-l-2 border-amber-500/40 text-amber-100 text-[11px]">
                      {descentFeedback.mistakes.map((m, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-[11px] text-slate-300">
                    {descentFeedback.message}
                  </p>
                </div>
              )}

              {/* What the player learned callout */}
              {descentSolved && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1 text-emerald-200 text-xs font-sans">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Principle Verified: Controlled Lunar Braking</span>
                  </div>
                  <p>
                    <strong>What the player learns:</strong> Lunar landing requires controlled braking, descent and surface contact—not simply dropping onto the Moon.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
                {!descentSolved && (
                  <button
                    type="button"
                    onClick={handleAutoSolveDescent}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs transition-colors"
                  >
                    Quick Sequence (Auto-Align)
                  </button>
                )}
                {!descentSolved ? (
                  <button
                    type="button"
                    onClick={handleCheckDescent}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wider uppercase text-xs shadow-lg shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Check sequence</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { audio.playClick(); setCurrentStep(2); }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wider uppercase text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                  >
                    <span>Proceed to Puzzle B — Reading Lunar Surface</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PUZZLE B — READING THE LUNAR SURFACE                      */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                <div className="text-[11px] font-bold text-cyan-300 uppercase flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Puzzle B — Reading the Lunar Surface</span>
                  </div>
                  <span className="text-[10px] text-amber-300/80 font-normal">
                    Objective: Interpret surface evidence
                  </span>
                </div>
                <p className="text-slate-300 text-xs font-sans leading-relaxed">
                  Match each reconstructed observation with its scientific interpretation. 
                  Surveyor 1 proved whether the Moon was safe for future Apollo human missions.
                </p>
              </div>

              {/* Surface Observation Reconstructed Photo */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/40 max-h-52 group">
                <img 
                  src="/images/moon_close_up_telescope.jpg" 
                  alt="Surveyor 1 Lunar Surface Observation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                
                {/* Visual Pins */}
                <div className="absolute bottom-3 left-4 flex items-center gap-2 text-[10px] font-mono text-cyan-300 bg-black/75 px-3 py-1 rounded-full border border-cyan-400/50">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>RECONSTRUCTED OBSERVATION: OCEANUS PROCELLARUM SOIL SURVEY</span>
                </div>
              </div>

              {/* 3 Questions Grid */}
              <div className="space-y-3">
                
                {/* 1. Footpad Impression */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-[10px]">1</span>
                      <span>Observation: Landing footpad impressions</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Match Interpretation</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { val: 'erosion', label: 'Atmospheric erosion mark' },
                      { val: 'contact', label: 'Evidence of surface contact' },
                      { val: 'exhaust', label: 'Chemical exhaust corrosion' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => { audio.playClick(); setSurfaceAnswers({ ...surfaceAnswers, footpad: opt.val }); }}
                        disabled={surfaceSolved}
                        className={`p-2.5 rounded-lg border text-left transition-all text-[11px] ${
                          surfaceAnswers.footpad === opt.val
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Rock Distribution */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-[10px]">2</span>
                      <span>Observation: Nearby rocks & boulder distribution</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Match Interpretation</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { val: 'water', label: 'Indicates sub-surface water ice' },
                      { val: 'terrain', label: 'Helps describe local terrain' },
                      { val: 'volcanic', label: 'Evidence of recent lunar volcano' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => { audio.playClick(); setSurfaceAnswers({ ...surfaceAnswers, rocks: opt.val }); }}
                        disabled={surfaceSolved}
                        className={`p-2.5 rounded-lg border text-left transition-all text-[11px] ${
                          surfaceAnswers.rocks === opt.val
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Surface Slope */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-[10px]">3</span>
                      <span>Observation: Surface slope & regolith texture</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Match Interpretation</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { val: 'magnetic', label: 'Determines solar magnetic field' },
                      { val: 'radio', label: 'Controls radio transmission rate' },
                      { val: 'stability', label: 'Relevant to landing stability' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => { audio.playClick(); setSurfaceAnswers({ ...surfaceAnswers, slope: opt.val }); }}
                        disabled={surfaceSolved}
                        className={`p-2.5 rounded-lg border text-left transition-all text-[11px] ${
                          surfaceAnswers.slope === opt.val
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Surface Feedback with Mistake Explanation & Retry */}
              {surfaceFeedback && (
                <div className={`p-3.5 rounded-xl border text-xs font-sans leading-relaxed space-y-2 ${
                  surfaceFeedback.type === 'success' 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                    : 'bg-amber-950/50 border-amber-500/50 text-amber-200 shadow-inner'
                }`}>
                  <div className="font-bold flex items-center justify-between text-xs uppercase tracking-wider">
                    <span>{surfaceFeedback.title || (surfaceFeedback.type === 'success' ? 'Analysis Verified' : 'Geological Interpretation Notice')}</span>
                    {surfaceFeedback.type === 'error' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/60 border border-amber-400 text-amber-300 font-mono">
                        Retry Allowed · No Penalty
                      </span>
                    )}
                  </div>
                  {surfaceFeedback.mistakes && (
                    <ul className="space-y-1.5 pl-2 border-l-2 border-amber-500/40 text-amber-100 text-[11px]">
                      {surfaceFeedback.mistakes.map((m, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-[11px] text-slate-300">
                    {surfaceFeedback.message}
                  </p>
                </div>
              )}

              {/* What the player learned callout */}
              {surfaceSolved && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1 text-emerald-200 text-xs font-sans">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Scientific Observation Report Restored</span>
                  </div>
                  <p>
                    <strong>What the player learns:</strong> The Surveyor programme helped investigate lunar surface conditions, which was important for planning future human lunar exploration.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
                {!surfaceSolved && (
                  <button
                    type="button"
                    onClick={handleAutoSolveSurface}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs transition-colors"
                  >
                    Quick Verify (Auto-Align)
                  </button>
                )}
                {!surfaceSolved ? (
                  <button
                    type="button"
                    onClick={handleVerifySurfaceObservations}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wider uppercase text-xs shadow-lg shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Verify Surface Interpretations</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { audio.playClick(); setCurrentStep(3); }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wider uppercase text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                  >
                    <span>Proceed to Puzzle C — Restore Image Archive</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PUZZLE C — RESTORE THE IMAGE ARCHIVE                      */}
          {/* ========================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                <div className="text-[11px] font-bold text-cyan-300 uppercase flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-cyan-400" />
                    <span>Puzzle C — Restore the Image Archive</span>
                  </div>
                  <span className="text-[10px] text-amber-300/80 font-normal">
                    Objective: Restore damaged archive records
                  </span>
                </div>
                <p className="text-slate-300 text-xs font-sans leading-relaxed">
                  The alien interface contains fragments of Surveyor 1's historical image archive. 
                  Click two tiles to swap their positions and reconstruct the 3 × 3 damaged image.
                </p>
              </div>

              {/* 3x3 Tile Puzzle Area */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-2xl bg-black/70 border border-cyan-500/30">
                
                {/* 3x3 Grid */}
                <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-900/90 rounded-2xl border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                  {tiles.map((tilePos, idx) => {
                    const isSelected = selectedTileIdx === idx;
                    // Calculate background position based on tile original target (0 to 8)
                    const row = Math.floor(tilePos / 3);
                    const col = tilePos % 3;
                    const posX = col * 50; // 0%, 50%, 100%
                    const posY = row * 50; // 0%, 50%, 100%

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleTileClick(idx)}
                        disabled={archiveSolved}
                        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden transition-all duration-150 ${
                          isSelected 
                            ? 'ring-4 ring-cyan-400 scale-105 z-10 brightness-125' 
                            : archiveSolved
                            ? 'border border-emerald-400/50 cursor-default'
                            : 'border border-cyan-400/30 hover:border-cyan-300 hover:scale-[1.02] cursor-pointer'
                        }`}
                        style={{
                          backgroundImage: `url('/images/surveyor1_moon_earth.jpg')`,
                          backgroundSize: '300% 300%',
                          backgroundPosition: `${posX}% ${posY}%`
                        }}
                      >
                        {!archiveSolved && (
                          <div className="absolute top-1 left-1.5 text-[10px] font-mono text-cyan-300/90 bg-black/60 px-1 rounded">
                            {idx + 1}
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-cyan-400/20 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Instructions & Reference Thumbnail */}
                <div className="flex flex-col items-center sm:items-start space-y-3 max-w-xs text-center sm:text-left">
                  <div className="text-[11px] text-slate-400">
                    {archiveSolved ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>3 × 3 Tiles Aligned Nominally</span>
                      </span>
                    ) : (
                      <span>Click tile A, then click tile B to swap positions.</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Historical Target Frame:</div>
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/20 shadow-md">
                      <img 
                        src="/images/surveyor1_moon_earth.jpg" 
                        alt="Reference Frame" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {!archiveSolved && (
                    <button
                      type="button"
                      onClick={handleAutoSolveArchive}
                      className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] text-slate-400 hover:text-white transition-colors"
                    >
                      Quick Calibrate (Auto-Align)
                    </button>
                  )}
                </div>
              </div>

              {/* Archive Restored Official Card (Exact Required Text) */}
              {archiveSolved && (
                <div className="p-5 rounded-2xl bg-slate-950 border-2 border-emerald-500/70 shadow-[0_0_40px_rgba(16,185,129,0.3)] space-y-3 animate-fade-in font-mono">
                  <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                    <div className="text-[11px] text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>ARCHIVE RESTORED</span>
                    </div>
                    <span className="text-xs text-emerald-300 font-bold">100% SYNTHESIS</span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-white tracking-tight">11,240</span>
                    <span className="text-xs text-slate-300 uppercase tracking-wider">Surveyor 1 images</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                      Historical mission result
                    </div>
                    <div className="text-xs text-slate-200 space-y-1 font-sans">
                      <div className="font-semibold text-white">Mission record recovered:</div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1">
                        <li>Successful lunar soft landing.</li>
                        <li>Lunar surface imaging.</li>
                        <li>Scientific observations.</li>
                        <li>Historic engineering achievement.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 italic pt-1 border-t border-white/10">
                    * The number of images is a historical reference. The fictional recovery process and alien connection are story elements.
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* THE MYSTERY CLUE: ANOMALOUS TRANSMISSION PATTERN          */}
              {/* ========================================================= */}
              {showMysteryClue && (
                <div className="p-5 rounded-2xl bg-purple-950/60 border-2 border-purple-500/70 shadow-[0_0_50px_rgba(168,85,247,0.4)] space-y-4 animate-scale-up font-mono">
                  
                  {/* Warning Header */}
                  <div className="flex items-center justify-between border-b border-purple-500/40 pb-2">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-xs tracking-widest uppercase">
                      <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span>THE MYSTERY CLUE · UNIDENTIFIED SIGNAL PATTERN</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 border border-purple-400/40 text-purple-200 animate-ping">
                      ACTIVE FEED
                    </span>
                  </div>

                  <p className="text-xs text-purple-200/90 font-sans leading-relaxed">
                    A separate signal pattern is embedded in the data interface. It does not match the historical image archive.
                  </p>

                  {/* Scripted Comms Exchange */}
                  <div className="space-y-2 p-3 rounded-xl bg-black/70 border border-purple-500/30">
                    {MYSTERY_DIALOGUE.slice(0, clueDialogueStep + 1).map((line, idx) => (
                      <div key={idx} className="text-xs leading-relaxed animate-fade-in font-sans">
                        <span className={`font-bold font-mono text-[11px] mr-2 ${
                          line.callsign.includes('CHEN') ? 'text-cyan-300' : 'text-amber-300'
                        }`}>
                          {line.speaker}:
                        </span>
                        <span className="text-white italic">"{line.text}"</span>
                      </div>
                    ))}
                  </div>

                  {/* Advance to Recovery Stage Button */}
                  {clueDialogueStep >= 4 && (
                    <div className="flex justify-end pt-2 animate-fade-in">
                      <button
                        type="button"
                        onClick={handleFinishMissionEcho}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold tracking-wider uppercase text-xs shadow-xl shadow-cyan-600/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-mono"
                      >
                        <span>Return to Reality on the Moon & Recover Surveyor 1</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="p-3.5 px-6 border-t border-cyan-500/30 bg-black/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <div>
            HISTORICAL MISSION ECHO RECONSTRUCTION · 1966 ARCHIVE
          </div>
          <div className="flex items-center gap-3 text-cyan-400">
            <span>CHALLENGE {currentStep} OF 3</span>
            {archiveSolved && <span className="text-emerald-400 font-bold">11,240 RECOVERED</span>}
          </div>
        </footer>

      </div>
    </div>
  );
}
