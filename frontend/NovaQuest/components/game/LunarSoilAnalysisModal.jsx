import React, { useEffect, useState } from 'react';
import {
  Activity,
  Atom,
  CheckCircle2,
  Database,
  FileText,
  Flame,
  Layers,
  Radio,
  RotateCcw,
  Sparkles,
  X,
  Compass,
} from 'lucide-react';
import { audio } from '../../game/moonMapAudioManager';
import { gameAudio } from '../../config/gameAudio';

/**
 * LunarSoilAnalysisModal
 *
 * Immersive Sci-Fi Soil Analysis flow for Surveyor 5 at Mare Tranquillitatis.
 * Features:
 *  1. Animated Alpha-Scattering Spectrometry scanning phase (APXS particle bombardment & progress ticker).
 *  2. Full-fledged Historical Scientific Report detailing the elemental composition (O, Si, Fe, etc.)
 *     and terrestrial basalt findings.
 */
export default function LunarSoilAnalysisModal({
  isOpen,
  mode = 'scanning', // 'scanning' | 'report'
  onClose,
  onReturnMenu,
}) {
  const [scanProgress, setScanProgress] = useState(mode === 'report' ? 100 : 0);
  const [currentPhaseText, setCurrentPhaseText] = useState('INITIALIZING ALPHA-SCATTERING SENSOR...');
  const [activeTab, setActiveTab] = useState('findings'); // 'findings' | 'spectrometry'

  // Run high-tech scanning progress if opened in scanning mode
  useEffect(() => {
    if (!isOpen) {
      setScanProgress(0);
      return;
    }

    if (mode === 'report') {
      setScanProgress(100);
      return;
    }

    setScanProgress(0);
    audio.playSurveyorScannerBeep?.();
    audio.playCraterScannerPulse?.();

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const next = Math.min(100, prev + Math.floor(Math.random() * 4) + 3);
        if (next < 25) {
          setCurrentPhaseText('DEPLOYING ALPHA-SCATTERING HEAD & UNSEALING CURIE-242 SOURCES...');
        } else if (next < 55) {
          setCurrentPhaseText('BOMBARDING LUNAR REGOLITH WITH ALPHA PARTICLES & RECORDING BACKSCATTER...');
          if (next % 12 === 0) audio.playScannerPing?.();
        } else if (next < 80) {
          setCurrentPhaseText('MEASURING PROTON ENERGY SPECTRA FROM LIGHT ELEMENT NUCLEI (O, Si, Al, Mg)...');
        } else if (next < 98) {
          setCurrentPhaseText('CORRELATING SPECTRA WITH TERRESTRIAL BASALTIC BASELINES...');
        } else {
          setCurrentPhaseText('SPECTROMETRY TELEMETRY SYNTHESIS COMPLETE · REPORT READY');
        }
        if (next >= 100) {
          clearInterval(interval);
          audio.playEquipmentFeedback?.();
          gameAudio.playVictory?.();
        }
        return next;
      });
    }, 85);

    return () => clearInterval(interval);
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const isScanning = scanProgress < 100 && mode !== 'report';

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in select-none font-mono"
      role="dialog"
      aria-modal="true"
      aria-labelledby="soil-analysis-title"
    >
      {/* Sci-Fi Background Grid & Radiant Ambient Flare */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(6, 182, 212, 0.18) 0%, rgba(15, 23, 42, 0.75) 45%, rgba(2, 6, 23, 0.98) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* ========================================================= */}
      {/* 1. ACTIVE SCANNING VIEW (while progress < 100%)            */}
      {/* ========================================================= */}
      {isScanning ? (
        <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl border-2 border-cyan-400/60 bg-gradient-to-b from-[#061b2e] via-[#030f1c] to-[#010810] shadow-[0_0_70px_rgba(6,182,212,0.45)] text-center space-y-6">
          {/* Cyber Scanning Radar Crest */}
          <div className="relative mx-auto w-24 h-24 rounded-full border-2 border-cyan-400/80 bg-cyan-950/40 flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.6)]">
            <Atom className="w-12 h-12 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="absolute inset-0 rounded-full border border-cyan-300/40 animate-ping opacity-60" />
            <Radio className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[10px] tracking-[0.25em] text-cyan-300 font-bold uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              SURVEYOR 5 · ALPHA-SCATTERING APXS
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-[0.2em] text-white drop-shadow-[0_0_12px_#00f0ff]">
              Conducting Soil Analysis...
            </h2>
            <p className="text-xs text-cyan-200/80 mt-1 tracking-wide">
              Mare Tranquillitatis Regolith Bombardment Protocol
            </p>
          </div>

          {/* Progress Bar & Status */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-cyan-300">
              <span className="tracking-widest">SPECTROMETRY PROGRESS</span>
              <span className="text-amber-300 font-mono text-sm">{scanProgress}%</span>
            </div>
            <div className="h-3 w-full bg-slate-900 rounded-full border border-cyan-500/40 p-0.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-300 rounded-full transition-all duration-150 shadow-[0_0_15px_#22d3ee]"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-cyan-400/90 tracking-wider truncate pt-1 animate-pulse">
              {currentPhaseText}
            </p>
          </div>

          {/* Real-time Spectrometer Readings Preview */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cyan-500/20 text-left">
            <div className="p-2 rounded-lg bg-black/50 border border-cyan-500/20">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Primary Peak</span>
              <span className="text-xs font-bold text-cyan-300 font-mono">Oxygen (O) ~58%</span>
            </div>
            <div className="p-2 rounded-lg bg-black/50 border border-cyan-500/20">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Secondary Peak</span>
              <span className="text-xs font-bold text-cyan-300 font-mono">Silicon (Si) ~18%</span>
            </div>
            <div className="p-2 rounded-lg bg-black/50 border border-cyan-500/20">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Classification</span>
              <span className="text-xs font-bold text-amber-300 font-mono">Basaltic Lava</span>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 2. FULL HISTORICAL SOIL ANALYSIS DOSSIER / REPORT         */
        /* ========================================================= */
        <div className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl border-2 border-cyan-400/70 bg-gradient-to-b from-[#07182a] via-[#04101e] to-[#010812] shadow-[0_0_90px_rgba(6,182,212,0.4)] flex flex-col">
          
          {/* Header Bar */}
          <div className="p-5 sm:p-6 border-b border-cyan-500/30 bg-[#051a30]/80 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl border-2 border-cyan-400/70 bg-cyan-950/80 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)] shrink-0">
                <Atom className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.28em] text-cyan-400">
                    Historic NASA Mission Data · Sept 1967
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                    APXS In-Situ Telemetry
                  </span>
                </div>
                <h2
                  id="soil-analysis-title"
                  className="text-lg sm:text-2xl font-black uppercase tracking-[0.16em] text-white drop-shadow-[0_0_12px_#00f0ff] mt-0.5"
                >
                  Surveyor 5 · Lunar Soil Analysis
                </h2>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-300 tracking-wide">
                  Mare Tranquillitatis (Sea of Tranquility) · First Chemical Analysis of Another World
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                gameAudio.playClick?.();
                onClose?.();
              }}
              className="w-9 h-9 rounded-xl border border-white/20 bg-black/60 text-slate-300 hover:text-white hover:border-cyan-400 flex items-center justify-center transition-all active:scale-95 shrink-0"
              title="Close Analysis"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Elemental Abundance Visualization Strip */}
          <div className="px-5 sm:px-6 py-4 bg-black/40 border-b border-cyan-500/20">
            <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300 mb-2">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Atomic Composition by Percentage
              </span>
              <span className="text-xs text-amber-300 font-mono">Basaltic Volcanic Regolith</span>
            </div>

            {/* Stacked Composition Bar */}
            <div className="h-6 w-full rounded-lg overflow-hidden flex border border-cyan-500/40 shadow-inner text-[10px] font-black font-mono">
              <div
                style={{ width: '58%' }}
                className="bg-cyan-500 flex items-center justify-center text-slate-950 font-bold transition-all hover:brightness-110"
                title="Oxygen (O): ~58%"
              >
                O ~58%
              </div>
              <div
                style={{ width: '18%' }}
                className="bg-sky-400 flex items-center justify-center text-slate-950 font-bold border-l border-slate-900 transition-all hover:brightness-110"
                title="Silicon (Si): ~18%"
              >
                Si 18%
              </div>
              <div
                style={{ width: '22%' }}
                className="bg-amber-400 flex items-center justify-center text-slate-950 font-bold border-l border-slate-900 transition-all hover:brightness-110"
                title="Al, Mg, Ca, Fe: ~22%"
              >
                Al · Mg · Ca · Fe ~22%
              </div>
              <div
                style={{ width: '2%' }}
                className="bg-purple-400 flex items-center justify-center text-slate-950 font-bold border-l border-slate-900"
                title="Trace / Minor"
              />
            </div>

            {/* Legend Tickers */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                Oxygen (Dominant): <strong>58%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                Silicon: <strong>18%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Al, Mg, Ca, Fe: <strong>Most of remainder</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                Carbon: <strong>Very little / Trace</strong>
              </span>
            </div>
          </div>

          {/* Main Scrollable Content Area: The 5 Key Scientific Results */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            
            {/* Finding Card 1: Dominance of Oxygen and Silicon */}
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-[#061e38]/70 relative overflow-hidden group hover:border-cyan-400 transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Atom className="w-4 h-4 text-cyan-400" />
                <span>1. Elemental Abundance Breakdown</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                The soil is dominated by oxygen (about 58% by atoms), followed by silicon (about 18%), with aluminum, magnesium, calcium, and iron making up most of the rest. Sodium and a few other elements were minor or trace.
              </p>
            </div>

            {/* Finding Card 2: Terrestrial Basalt Resemblance */}
            <div className="p-4 rounded-xl border border-sky-500/30 bg-[#051c33]/70 relative overflow-hidden group hover:border-sky-400 transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-400" />
              <div className="flex items-center gap-2 text-sky-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Database className="w-4 h-4 text-sky-400" />
                <span>2. Rock Type Classification</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                Its composition resembled terrestrial basalt, rather than the granite-like or meteorite-like material some had predicted.
              </p>
            </div>

            {/* Finding Card 3: Volcanic Maria & Geological Activity */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-[#16212e]/70 relative overflow-hidden group hover:border-amber-400 transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>3. Geological Evolution of the Lunar Maria</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                This was significant because it showed the lunar maria were volcanic basalt flows that had gone through melting and differentiation, not primitive, unprocessed solar-system material. That supported the idea that the Moon had been geologically active.
              </p>
            </div>

            {/* Finding Card 4: Earth Basalt Comparison */}
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-[#0a1b38]/70 relative overflow-hidden group hover:border-indigo-400 transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400" />
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>4. Comparison with Earth Basalt</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                Compared with Earth basalt, the soil appeared to have more iron and less of some lighter elements in some analyses, but the broad similarity was the key result.
              </p>
            </div>

            {/* Finding Card 5: Carbon Absence & Organic Material */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-[#07242a]/70 relative overflow-hidden group hover:border-emerald-400 transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400" />
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>5. Absence of Exotic Organics</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                The measurements also found very little carbon, which argued against exotic organic-rich or primitive carbonaceous material at the site.
              </p>
            </div>

          </div>

          {/* Action Footer */}
          <div className="p-4 sm:p-5 border-t border-cyan-500/30 bg-[#030d1a] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>APXS SPECTROMETRY LOGGED · PROVED MOON SOLID FOR APOLLO 11</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  gameAudio.playClick?.();
                  onClose?.();
                }}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-cyan-400 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all"
              >
                Resume Exploration
              </button>

              {onReturnMenu && (
                <button
                  type="button"
                  onClick={() => {
                    gameAudio.playClick?.();
                    onReturnMenu();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
                >
                  Return to Missions
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
