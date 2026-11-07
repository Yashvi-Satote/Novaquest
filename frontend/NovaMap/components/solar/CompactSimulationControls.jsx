import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Layers, 
  Clock, 
  X, 
  SlidersHorizontal,
  FastForward,
  Rewind,
  Calendar,
  Maximize2
} from 'lucide-react';

const SPEED_OPTIONS = [0.5, 1, 5, 20, 50, 100];
const MIN_TIME = new Date('1960-01-01T00:00:00Z').getTime();
const MAX_TIME = new Date('2050-01-01T00:00:00Z').getTime();

/**
 * CompactSimulationControls.jsx
 * 
 * Elegant, compact floating simulation settings menu.
 * Replaces the bulky bottom HUD bar completely, freeing 100% of the viewport.
 * Accessible optionally via the dock or floating settings toggle.
 */
export default function CompactSimulationControls({
  isOpen = false,
  onClose,
  isPlaying = true,
  onTogglePlay,
  speed = 1.0,
  onChangeSpeed,
  timeDirection = 1,
  onToggleTimeDirection,
  onStepDays,
  simulationDate = new Date(),
  onSelectDate,
  onResetView,
  onZoomIn,
  onZoomOut,
  lightingMode = 'natural',
  onToggleLightingMode,
  cameraMode = 'orbit',
  onChangeCameraMode,
  layerVisibility = { orbits: true, trajectories: true, markers: true, labels: true, stars: true, asteroids: true, comets: true, spacecraft: true },
  onToggleLayer,
  activeScale = 'SOLAR_SYSTEM',
  onSelectScale
}) {
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'layers' | 'camera'

  if (!isOpen) return null;

  const currentTimeMs = simulationDate instanceof Date ? simulationDate.getTime() : new Date(simulationDate).getTime();
  const formattedDate = (simulationDate instanceof Date ? simulationDate : new Date(simulationDate)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleSliderChange = (e) => {
    const timeMs = Number(e.target.value);
    if (onSelectDate) onSelectDate(new Date(timeMs));
  };

  return (
    <div 
      id="compact-simulation-settings-modal"
      className="fixed top-20 right-4 sm:right-8 z-40 w-80 sm:w-92 bg-[#09071c]/95 backdrop-blur-2xl border border-cyan-500/35 rounded-2xl shadow-2xl shadow-cyan-950/80 text-white font-sans animate-fadeIn select-none overflow-hidden"
      role="dialog"
      aria-label="Simulation Settings"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 px-4 bg-gradient-to-r from-cyan-950/50 via-purple-950/30 to-slate-950/60 border-b border-cyan-500/25">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-xs tracking-wide uppercase text-white">
            Simulation Settings
          </h3>
        </div>
        <button
          type="button"
          id="close-sim-settings-btn"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Close Settings"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-cyan-500/20 bg-black/40 text-[11px] font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Timeline
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'layers'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Layers
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('camera')}
          className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'camera'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Camera
        </button>
      </div>

      {/* Tab 1: Timeline & Speed */}
      {activeTab === 'timeline' && (
        <div className="p-4 space-y-3.5 text-xs">
          {/* Current Date & Play/Pause */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e0a29] border border-cyan-500/25">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-cyan-200 font-bold text-xs">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                id="sim-toggle-play-btn"
                onClick={onTogglePlay}
                className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
                title={isPlaying ? "Pause simulation" : "Play simulation"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                id="sim-set-live-btn"
                onClick={() => onSelectDate && onSelectDate(new Date())}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 border border-slate-600/40 cursor-pointer"
                title="Reset to current real-time date"
              >
                LIVE
              </button>
            </div>
          </div>

          {/* Timeline Scrub Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>1960</span>
              <span className="text-cyan-300">Ephemeris Scrub</span>
              <span>2050</span>
            </div>
            <input
              type="range"
              id="sim-timeline-slider"
              min={MIN_TIME}
              max={MAX_TIME}
              value={currentTimeMs}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Speed Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
              Simulation Warp Speed
            </span>
            <div className="grid grid-cols-6 gap-1">
              {SPEED_OPTIONS.map(spd => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => onChangeSpeed && onChangeSpeed(spd)}
                  className={`py-1 rounded-md text-[10.5px] font-mono transition-all cursor-pointer ${
                    speed === spd
                      ? 'bg-cyan-600 text-white font-bold border border-cyan-400'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Layer Toggles */}
      {activeTab === 'layers' && (
        <div className="p-4 space-y-2 text-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
            3D Visual Overlays
          </span>
          {[
            { key: 'orbits', label: 'Planetary Orbits' },
            { key: 'trajectories', label: 'Spacecraft Trajectories' },
            { key: 'markers', label: 'Target Proximity Markers' },
            { key: 'asteroids', label: 'Main Asteroid Belt' },
            { key: 'comets', label: 'Comet Ephemeris Trails' },
            { key: 'stars', label: 'Milky Way Deep-Space Stars' }
          ].map(({ key, label }) => {
            const active = layerVisibility[key] !== false;
            return (
              <label 
                key={key} 
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-700/40 cursor-pointer hover:bg-slate-800/80 transition-colors"
              >
                <span className="text-slate-300 font-sans">{label}</span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => onToggleLayer && onToggleLayer(key)}
                  className="rounded accent-cyan-400 cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      )}

      {/* Tab 3: Camera & View Controls */}
      {activeTab === 'camera' && (
        <div className="p-4 space-y-3 text-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
            Camera & Perspectives
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              id="sim-zoom-in-btn"
              onClick={onZoomIn}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono">Zoom In</span>
            </button>
            <button
              type="button"
              id="sim-zoom-out-btn"
              onClick={onZoomOut}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono">Zoom Out</span>
            </button>
            <button
              type="button"
              id="sim-reset-view-btn"
              onClick={onResetView}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono">Reset View</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
            <span className="text-slate-300">Lighting Mode</span>
            <button
              type="button"
              id="sim-toggle-lighting-btn"
              onClick={onToggleLightingMode}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono capitalize cursor-pointer hover:bg-cyan-900/70"
            >
              {lightingMode} Lighting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
