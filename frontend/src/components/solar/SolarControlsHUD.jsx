import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Info, 
  Eye, 
  Compass
} from 'lucide-react';
import { SOLAR_SYSTEM_DISCLAIMER } from './celestialData';
import { SCALE_PRESETS } from './interstellarData';

export default function SolarControlsHUD({
  isPlaying,
  onTogglePlay,
  speed,
  onChangeSpeed,
  activeScale,
  onSelectScale,
  onResetView,
  hoveredItemInfo
}) {
  const speedOptions = [0.5, 1, 5, 20];

  return (
    <>
      {/* Top Disclaimer Banner - Requirement #4 */}
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-2xl">
        <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-500/20 px-3.5 py-1.5 rounded-full shadow-lg flex items-center justify-center gap-2 text-center">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <p className="text-[11px] sm:text-xs text-slate-300 font-medium tracking-wide truncate">
            {SOLAR_SYSTEM_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* Top Left: 3D Hover Inspector Badge */}
      {hoveredItemInfo && (
        <div className="pointer-events-none absolute top-16 left-6 z-20 bg-slate-900/90 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2.5 animate-fadeIn font-sans">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm animate-pulse" />
          <div>
            <span className="text-xs font-bold text-white tracking-wide block">{hoveredItemInfo.name}</span>
            <span className="text-[10px] text-cyan-300 font-mono">
              {hoveredItemInfo.isSpacecraft ? (hoveredItemInfo.coordinates || 'Spacecraft Telemetry') : 'Celestial Body'} • Click to Focus
            </span>
          </div>
        </div>
      )}

      {/* Bottom Center: Main Multi-Scale Navigation Control Deck */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-3xl flex flex-col items-center gap-2 font-sans">
        
        {/* Multi-Scale Preset Strip */}
        <div className="w-full flex items-center justify-center">
          <div className="flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 bg-slate-950/75 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">
            <span className="text-[10px] text-slate-400 font-mono px-2 hidden md:inline">Scale:</span>
            {Object.entries(SCALE_PRESETS).map(([key, preset]) => {
              const isActive = activeScale === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectScale(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30 font-semibold ring-1 ring-cyan-400/50'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={preset.description}
                >
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orbit Speed & Playback Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-slate-950/75 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl w-full sm:w-auto">
          
          {/* Play / Pause */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePlay}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                isPlaying 
                  ? 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30' 
                  : 'bg-amber-600/30 text-amber-300 hover:bg-amber-600/40 border border-amber-500/30'
              }`}
              title={isPlaying ? 'Pause orbital motion' : 'Resume orbital motion'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span className="hidden sm:inline">{isPlaying ? 'Live Motion' : 'Paused'}</span>
            </button>

            {/* Reset View */}
            <button
              type="button"
              onClick={onResetView}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset camera to default overview"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </button>
          </div>

          <div className="hidden sm:block h-5 w-[1px] bg-white/10" />

          {/* Time Multipliers */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 font-mono mr-1.5">Speed:</span>
            {speedOptions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  speed === s
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>

          {/* Mouse Gestures */}
          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Drag rotate • Scroll zoom</span>
          </div>

        </div>

      </div>
    </>
  );
}
