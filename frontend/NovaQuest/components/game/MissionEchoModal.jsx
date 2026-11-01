import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  Radio, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Sliders, 
  Camera, 
  FileSearch, 
  Sparkles, 
  Zap,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { audio } from '../../game/audioManager';

/**
 * MissionEchoModal — Zone 5 Interactive Historical Simulation Interface
 * 
 * Reconstructs the 1966 Surveyor 1 mission sequence via 3 interactive simulation puzzles:
 * 1. Controlled Descent Sequence (Retro-burn & Vernier throttle to achieve 3.05 m/s soft touchdown)
 * 2. Lunar Surface Observation (Vidicon mirror angle & filter calibration for 360° panorama)
 * 3. Historic Archive Restoration (432.06 Hz harmonic notch filter to decode stellar coordinates)
 */
export default function MissionEchoModal({ isOpen, onClose, onCompleteEcho }) {
  const [currentStep, setCurrentStep] = useState(1);

  // Puzzle 1 State: Controlled Descent
  const [burnDuration, setBurnDuration] = useState(38.0); // Target ~40.2s
  const [vernierThrottle, setVernierThrottle] = useState(65); // Target ~74%
  const [descentCompleted, setDescentCompleted] = useState(false);
  const [descentFeedback, setDescentFeedback] = useState('');

  // Puzzle 2 State: Surface Observation
  const [mirrorElevation, setMirrorElevation] = useState(12.0); // Target 18.5°
  const [selectedFilter, setSelectedFilter] = useState('Red'); // Target Clear
  const [observationCompleted, setObservationCompleted] = useState(false);
  const [observationFeedback, setObservationFeedback] = useState('');

  // Puzzle 3 State: Archive Restoration
  const [notchFilterFreq, setNotchFilterFreq] = useState(410.0); // Target 432.06 Hz
  const [archiveCompleted, setArchiveCompleted] = useState(false);
  const [archiveFeedback, setArchiveFeedback] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Puzzle 1 Validation: Compute Touchdown Velocity
  const calculatedVelocity = +(3.05 + Math.abs(burnDuration - 40.2) * 1.8 + Math.abs(vernierThrottle - 74) * 0.12).toFixed(2);
  const isDescentNominal = Math.abs(calculatedVelocity - 3.05) <= 0.35;

  const handleExecuteDescent = () => {
    audio.playClick();
    if (isDescentNominal) {
      audio.playInteract();
      setDescentCompleted(true);
      setDescentFeedback('SUCCESS: Main Retro Burn and Vernier throttle nominal. Soft touchdown validated at 3.05 m/s into Oceanus Procellarum.');
    } else {
      setDescentFeedback(`WARNING: Touchdown velocity ${calculatedVelocity} m/s exceeds 3.05 m/s limit. Adjust burn duration (~40.2s) and Vernier throttle (~74%).`);
    }
  };

  // Puzzle 2 Validation: Mirror Angle & Filter
  const isObservationNominal = Math.abs(mirrorElevation - 18.5) <= 1.5 && selectedFilter === 'Clear';

  const handleCalibrateCamera = () => {
    audio.playClick();
    if (isObservationNominal) {
      audio.playInteract();
      setObservationCompleted(true);
      setObservationFeedback('SUCCESS: Vidicon mirror elevation locked at 18.5°. Clear/UV-Pass filter active. 360° panoramic mosaic reconstructed.');
    } else {
      let hints = [];
      if (Math.abs(mirrorElevation - 18.5) > 1.5) hints.push('Mirror elevation requires ~18.5°');
      if (selectedFilter !== 'Clear') hints.push('Optical filter requires Clear / UV-Pass');
      setObservationFeedback(`CALIBRATION DRIFT: ${hints.join(', ')}.`);
    }
  };

  // Puzzle 3 Validation: 432.06 Hz Filter
  const isArchiveNominal = Math.abs(notchFilterFreq - 432.06) <= 2.5;

  const handleRestoreArchive = () => {
    audio.playClick();
    if (isArchiveNominal) {
      audio.playAnomalyHarmonic();
      setArchiveCompleted(true);
      setArchiveFeedback('EPICENTER DECODED: 432.06 Hz harmonic isolated! Corrupted scan lines synthesized. 11,237 historic frames restored. Decrypted stellar coordinates unlocked.');
    } else {
      setArchiveFeedback(`HARMONIC NOISE PERSISTS: Current frequency ${notchFilterFreq.toFixed(1)} Hz. Resonance peak is at 432.06 Hz.`);
    }
  };

  const handleFinishSimulation = () => {
    audio.playInteract();
    if (onCompleteEcho) {
      onCompleteEcho();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-lg animate-fade-in font-mono select-none">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-950/95 border-2 border-cyan-500/60 shadow-[0_0_60px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Holographic Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 via-slate-950 to-indigo-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 tracking-widest uppercase flex items-center gap-2">
                <span>ZONE 5 · MISSION ECHO INTERFACE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
                Historical Telemetry Reconstruction (1966)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { audio.playClick(); onClose(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close [Esc]"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Multi-Step Simulation Navigation Tabs */}
        <div className="flex border-b border-cyan-500/30 bg-black/40 text-xs">
          <button
            type="button"
            onClick={() => { audio.playClick(); setCurrentStep(1); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold tracking-wider uppercase transition-colors border-r border-cyan-500/20 ${
              currentStep === 1 
                ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-b-cyan-400' 
                : descentCompleted ? 'text-emerald-400 hover:bg-white/5' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            {descentCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span>1.</span>}
            <span className="hidden sm:inline">Controlled</span> Descent
          </button>

          <button
            type="button"
            onClick={() => { audio.playClick(); setCurrentStep(2); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold tracking-wider uppercase transition-colors border-r border-cyan-500/20 ${
              currentStep === 2 
                ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-b-cyan-400' 
                : observationCompleted ? 'text-emerald-400 hover:bg-white/5' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            {observationCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span>2.</span>}
            <span className="hidden sm:inline">Surface</span> Observation
          </button>

          <button
            type="button"
            onClick={() => { audio.playClick(); setCurrentStep(3); }}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold tracking-wider uppercase transition-colors ${
              currentStep === 3 
                ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-b-cyan-400' 
                : archiveCompleted ? 'text-emerald-400 hover:bg-white/5' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            {archiveCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span>3.</span>}
            <span className="hidden sm:inline">Archive</span> Restoration
          </button>
        </div>

        {/* Content Body */}
        <main className="p-6 space-y-5 overflow-y-auto custom-scrollbar text-xs">
          
          {/* STEP 1: CONTROLLED DESCENT SEQUENCE */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                <div className="text-[11px] font-bold text-cyan-300 uppercase flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Phase 1 · Terminal Descent Throttle Calibration</span>
                </div>
                <p className="text-slate-300 text-xs font-sans">
                  On June 2, 1966, Surveyor 1 engaged its solid retromotor at 75 km altitude, decelerating from 2,600 m/s. 
                  Adjust the Main Retro Burn duration and Vernier thruster throttle to achieve a nominal <strong>3.05 m/s</strong> touchdown.
                </p>
              </div>

              {/* Sliders Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Main Retro Burn:</span>
                    <span className="text-cyan-300 font-bold">{burnDuration.toFixed(1)} s</span>
                  </div>
                  <input 
                    type="range"
                    min="30.0"
                    max="50.0"
                    step="0.2"
                    value={burnDuration}
                    onChange={(e) => setBurnDuration(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>30.0s (Under-burn)</span>
                    <span>50.0s (Over-burn)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Vernier Engine Throttle:</span>
                    <span className="text-cyan-300 font-bold">{vernierThrottle}%</span>
                  </div>
                  <input 
                    type="range"
                    min="40"
                    max="100"
                    step="1"
                    value={vernierThrottle}
                    onChange={(e) => setVernierThrottle(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>40% (Hard Drop)</span>
                    <span>100% (Fuel Exhaustion)</span>
                  </div>
                </div>
              </div>

              {/* Velocity Meter */}
              <div className="p-4 rounded-xl bg-black/80 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Calculated Touchdown Velocity</div>
                  <div className={`text-xl font-bold font-mono ${isDescentNominal ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {calculatedVelocity} m/s
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Target Velocity Tolerance</div>
                  <div className="text-cyan-300 font-bold">3.05 m/s (±0.35)</div>
                </div>
              </div>

              {descentFeedback && (
                <div className={`p-3 rounded-xl border text-xs font-sans ${
                  descentCompleted ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                }`}>
                  {descentFeedback}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExecuteDescent}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wider uppercase text-xs shadow-lg shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Execute Descent Simulation</span>
                </button>
                {descentCompleted && (
                  <button
                    type="button"
                    onClick={() => { audio.playClick(); setCurrentStep(2); }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wider uppercase text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    <span>Proceed to Phase 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SURFACE OBSERVATION */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                <div className="text-[11px] font-bold text-cyan-300 uppercase flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Phase 2 · Vidicon Optical Mirror & Filter Calibration</span>
                </div>
                <p className="text-slate-300 text-xs font-sans">
                  The motorized quartz mirror camera scanned the horizon across red, green, and blue spectral bands. 
                  Align the mirror elevation to <strong>18.5°</strong> and select the <strong>Clear / UV-Pass</strong> filter to stitch the historical panorama.
                </p>
              </div>

              {/* Mirror Elevation */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Vidicon Mirror Elevation:</span>
                  <span className="text-cyan-300 font-bold">{mirrorElevation.toFixed(1)}°</span>
                </div>
                <input 
                  type="range"
                  min="0.0"
                  max="45.0"
                  step="0.5"
                  value={mirrorElevation}
                  onChange={(e) => setMirrorElevation(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.0° (Ground Nadir)</span>
                  <span>45.0° (Deep Space Zenith)</span>
                </div>
              </div>

              {/* Optical Filter Selector */}
              <div className="space-y-2">
                <div className="text-[11px] text-slate-400 uppercase">Optical Filter Wheel:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Red', 'Green', 'Blue', 'Clear'].map((filterName) => (
                    <button
                      key={filterName}
                      type="button"
                      onClick={() => { audio.playClick(); setSelectedFilter(filterName); }}
                      className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                        selectedFilter === filterName
                          ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20'
                          : 'bg-black/50 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {filterName}
                    </button>
                  ))}
                </div>
              </div>

              {observationFeedback && (
                <div className={`p-3 rounded-xl border text-xs font-sans ${
                  observationCompleted ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                }`}>
                  {observationFeedback}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCalibrateCamera}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wider uppercase text-xs shadow-lg shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Stitch 360° Panorama</span>
                </button>
                {observationCompleted && (
                  <button
                    type="button"
                    onClick={() => { audio.playClick(); setCurrentStep(3); }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wider uppercase text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    <span>Proceed to Phase 3</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: ARCHIVE RESTORATION & SIGNAL EXTRACTION */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                <div className="text-[11px] font-bold text-cyan-300 uppercase flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-cyan-400" />
                  <span>Phase 3 · Harmonic Carrier Filtering & Archive Synthesis</span>
                </div>
                <p className="text-slate-300 text-xs font-sans">
                  The alien conduit has been piggybacking on Surveyor 1's vidicon scanlines. 
                  Tune the notch filter to the resonant harmonic frequency (<strong>432.06 Hz</strong>) to eliminate interference and synthesize the 11,237 archived frames.
                </p>
              </div>

              {/* Frequency Tuning */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Harmonic Notch Frequency:</span>
                  <span className="text-purple-300 font-bold font-mono">{notchFilterFreq.toFixed(2)} Hz</span>
                </div>
                <input 
                  type="range"
                  min="400.0"
                  max="460.0"
                  step="0.05"
                  value={notchFilterFreq}
                  onChange={(e) => setNotchFilterFreq(parseFloat(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>400.0 Hz</span>
                  <span className="text-purple-300 font-bold">Resonance Zone (~432 Hz)</span>
                  <span>460.0 Hz</span>
                </div>
              </div>

              {/* Historical Photo Preview */}
              <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 max-h-48 group">
                <img 
                  src="/images/surveyor1_moon_earth.jpg" 
                  alt="Surveyor 1 Lunar Frame" 
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    archiveCompleted ? 'filter-none scale-105' : 'blur-[2px] contrast-125 hue-rotate-30'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-3 text-[10px] text-cyan-300 font-mono">
                  {archiveCompleted ? 'FRAME #0942 · 100% DECRYPTED · STELLAR VECTOR ATTACHED' : 'SCANLINE INTERFERENCE ACTIVE · 432 HZ CARRIER DETECTED'}
                </div>
              </div>

              {archiveFeedback && (
                <div className={`p-3 rounded-xl border text-xs font-sans ${
                  archiveCompleted ? 'bg-purple-950/40 border-purple-500/40 text-purple-200' : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                }`}>
                  {archiveFeedback}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                {!archiveCompleted ? (
                  <button
                    type="button"
                    onClick={handleRestoreArchive}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold tracking-wider uppercase text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Filter Harmonic & Decrypt</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishSimulation}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold tracking-wider uppercase text-xs shadow-xl shadow-cyan-600/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 animate-bounce"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Complete Mission Echo & Return to Surveyor 1</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="p-4 border-t border-cyan-500/30 bg-black/70 flex items-center justify-between text-[10px] text-slate-500">
          <div>
            HISTORICAL MISSION ECHO RECONSTRUCTION · NASA ARCHIVE
          </div>
          <div className="flex items-center gap-2 text-cyan-400">
            <span>PHASE {currentStep} OF 3</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

