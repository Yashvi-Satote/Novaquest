import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Info, 
  ArrowLeft, 
  Sun, 
  Lightbulb, 
  Layers, 
  Check, 
  Share2, 
  Maximize, 
  Minimize,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Calendar,
  FastForward,
  Clock,
  Sparkles
} from 'lucide-react';
import { SOLAR_SYSTEM_DISCLAIMER } from './celestialData';
import { VOYAGER_LOCAL_METRICS } from './interstellarData';

// Ephemeris slider timeline bounds (1960 - 2050)
const MIN_TIME = new Date('1960-01-01T00:00:00Z').getTime();
const MAX_TIME = new Date('2050-01-01T00:00:00Z').getTime();

const SPEED_OPTIONS = [0.5, 1, 5, 20, 50];

export default function SolarControlsHUD({
  isPlaying = true,
  onTogglePlay,
  speed = 1.0,
  onChangeSpeed,
  simulationDate = new Date(),
  onSelectDate,
  onScrubStart,
  onScrubEnd,
  onResetView,
  onZoomIn,
  onZoomOut,
  hoveredItemInfo,
  isVoyagerLocalMode,
  onExitVoyagerLocal,
  isSurfaceMode,
  activeSurfaceCraft,
  onExitSurfaceMode,
  lightingMode = 'natural',
  onToggleLightingMode,
  cameraMode = 'orbit',
  onChangeCameraMode,
  layerVisibility = { orbits: true, trajectories: true, markers: true, labels: true, stars: true, asteroids: true },
  onToggleLayer
}) {
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Fullscreen listener
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 1800);
    } catch {
      window.prompt('Copy this link:', window.location.href);
    }
  };

  // Format date display (NASA Eyes style: DD MMM YYYY • HH:MM:SS UTC)
  const formattedDate = simulationDate instanceof Date && !isNaN(simulationDate.getTime())
    ? simulationDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
    : 'Live Simulation';

  const formattedTime = simulationDate instanceof Date && !isNaN(simulationDate.getTime())
    ? simulationDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }) + ' UTC'
    : '';

  const currentTimeVal = simulationDate instanceof Date && !isNaN(simulationDate.getTime())
    ? Math.min(Math.max(simulationDate.getTime(), MIN_TIME), MAX_TIME)
    : Date.now();

  const handleTimelineChange = (e) => {
    const newTimestamp = Number(e.target.value);
    if (onSelectDate) {
      onSelectDate(new Date(newTimestamp));
    }
  };

  const handleJumpToNow = () => {
    if (onSelectDate) {
      onSelectDate(new Date());
    }
  };

  return (
    <>
      {/* Top Banner: Proximity Sphere or Ephemeris Disclaimer */}
      {isVoyagerLocalMode ? (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-2xl animate-fadeIn">
          <div className="bg-[#0b0820]/95 backdrop-blur-2xl border border-cyan-400/50 px-4 py-2.5 rounded-2xl shadow-2xl shadow-purple-950/60 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-md shadow-cyan-400/60 shrink-0" />
              <div>
                <span className="font-bold text-white tracking-wide flex items-center gap-2">
                  Voyager 1 Local Proximity Sphere
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[10px] text-cyan-300 font-mono font-semibold">
                    Radius: {VOYAGER_LOCAL_METRICS.sphereRadiusLabel}
                  </span>
                </span>
                <span className="text-[10px] text-purple-200/80 font-sans block mt-0.5">
                  Regime: <strong className="text-cyan-300">{VOYAGER_LOCAL_METRICS.regime}</strong> • Speed: <span className="font-mono text-cyan-200">{VOYAGER_LOCAL_METRICS.asymptoticSpeedKmS} km/s</span> • Interstellar Medium
                </span>
              </div>
            </div>
            <button
              type="button"
              id="exit-voyager-local-btn"
              onClick={onExitVoyagerLocal}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-600/40 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Local View</span>
            </button>
          </div>
        </div>
      ) : isSurfaceMode && activeSurfaceCraft ? (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-2xl animate-fadeIn">
          <div className="bg-[#0b0820]/95 backdrop-blur-2xl border border-amber-500/50 px-4 py-2.5 rounded-2xl shadow-2xl shadow-amber-950/60 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-md shadow-amber-400/60 shrink-0" />
              <div>
                <span className="font-bold text-white tracking-wide flex items-center gap-2">
                  Planetary Surface Exploration Mode
                  <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-400/40 text-[10px] text-amber-300 font-mono font-semibold">
                    {activeSurfaceCraft.name}
                  </span>
                </span>
                <span className="text-[10px] text-amber-200/90 font-sans block mt-0.5">
                  Site: <strong className="text-white">{activeSurfaceCraft.coordinates?.siteName}</strong> ({activeSurfaceCraft.coordinates?.lat?.toFixed(2)}°, {activeSurfaceCraft.coordinates?.lon?.toFixed(2)}°)
                </span>
              </div>
            </div>
            <button
              type="button"
              id="exit-surface-btn"
              onClick={onExitSurfaceMode}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-md shadow-amber-600/40 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Orbit</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-2xl">
          <div className="bg-[#080518]/90 backdrop-blur-md border border-cyan-500/25 px-4 py-1.5 rounded-full shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 text-center">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <p className="text-[11px] sm:text-xs text-purple-200/90 font-medium tracking-wide truncate">
              {SOLAR_SYSTEM_DISCLAIMER}
            </p>
          </div>
        </div>
      )}

      {/* Top Left: 3D Hover Inspector Badge */}
      {hoveredItemInfo && (
        <div className="pointer-events-none absolute top-16 left-6 z-20 bg-[#0a071e]/95 backdrop-blur-md border border-cyan-500/30 px-3.5 py-2 rounded-xl shadow-xl shadow-purple-950/50 flex items-center gap-2.5 animate-fadeIn font-sans">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm animate-pulse" />
          <div>
            <span className="text-xs font-bold text-white tracking-wide block">{hoveredItemInfo.name}</span>
            <span className="text-[10px] text-cyan-300 font-mono">
              {hoveredItemInfo.isSpacecraft ? (hoveredItemInfo.coordinates || 'Spacecraft Telemetry') : 'Celestial Body'} • Click to Inspect
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          BOTTOM PANEL: NASA Eyes Simulation Timeline & Navigation Control Dock
          ========================================================================= */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[96%] max-w-4xl flex flex-col items-center gap-2 font-sans select-none pointer-events-auto">
        
        {/* Main Dock Container */}
        <div className="w-full bg-[#070515]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-black/80 px-4 py-3 flex flex-col gap-2.5 text-xs">
          
          {/* Row 1: Timeline Slider & Simulation Date Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left: Live Simulation Date & Time Badge */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c0825] border border-cyan-500/30 text-cyan-300">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono font-bold text-xs tracking-wider text-white">
                  {formattedDate}
                </span>
                <span className="text-[10px] font-mono text-cyan-400/80">
                  {formattedTime}
                </span>
              </div>

              {/* Jump to Now / Live button */}
              <button
                type="button"
                onClick={handleJumpToNow}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-400/30 hover:border-cyan-400 text-cyan-300 hover:text-white text-[10px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1"
                title="Reset simulation to current real-world UTC time"
              >
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Live</span>
              </button>
            </div>

            {/* Center: Interactive Timeline Scrub Slider */}
            <div className="flex-1 w-full flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 shrink-0">1960</span>
              <div className="relative flex-1 flex items-center">
                <input
                  id="simulation-timeline-slider"
                  type="range"
                  min={MIN_TIME}
                  max={MAX_TIME}
                  step={86400000} // 1 day steps for smooth scrubbing
                  value={currentTimeVal}
                  onMouseDown={onScrubStart}
                  onTouchStart={onScrubStart}
                  onChange={handleTimelineChange}
                  onMouseUp={onScrubEnd}
                  onTouchEnd={onScrubEnd}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  aria-label="Simulation date timeline scrubber"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">2050</span>
            </div>

            {/* Right: Play/Pause & Speed Multiplier Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Play / Pause Toggle Button */}
              <button
                id="solar-play-pause-btn"
                type="button"
                onClick={onTogglePlay}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-md ${
                  isPlaying
                    ? 'bg-cyan-600 hover:bg-cyan-500 border-cyan-400 text-white shadow-cyan-600/40 ring-1 ring-cyan-400/50'
                    : 'bg-[#0d0928] hover:bg-cyan-950 border-cyan-500/40 text-cyan-300'
                }`}
                title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
                aria-label={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-cyan-300 text-cyan-300" />
                )}
              </button>

              {/* Speed Multiplier Pills */}
              <div className="flex items-center bg-[#060413] border border-cyan-500/25 rounded-xl p-0.5">
                {SPEED_OPTIONS.map(opt => {
                  const isActive = speed === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onChangeSpeed && onChangeSpeed(opt)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-600 text-white font-bold shadow-sm shadow-cyan-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title={`Simulate at ${opt}x real-time speed`}
                    >
                      {opt}x
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Camera Controls, Zoom Controls, Layers & View Tools */}
          <div className="pt-2 border-t border-cyan-500/20 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
            
            {/* Left Controls: Reset Camera, Zoom In / Out, Camera Mode */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Reset Camera to Solar System Overview */}
              <button
                id="reset-solar-view-btn"
                type="button"
                onClick={onResetView}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-700 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold text-xs transition-all shadow-md shadow-purple-900/40 cursor-pointer active:scale-98"
                title="Reset camera to complete Solar System view"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-300" />
                <span>Reset Camera</span>
              </button>

              {/* Zoom Controls (+ / -) */}
              <div className="flex items-center bg-[#060413] border border-cyan-500/30 rounded-xl p-0.5">
                <button
                  type="button"
                  id="solar-zoom-in-btn"
                  onClick={onZoomIn}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-cyan-950/60 transition-colors cursor-pointer"
                  title="Zoom In (+)"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                </button>
                <div className="w-[1px] h-3.5 bg-cyan-500/20" />
                <button
                  type="button"
                  id="solar-zoom-out-btn"
                  onClick={onZoomOut}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-cyan-950/60 transition-colors cursor-pointer"
                  title="Zoom Out (-)"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>

              {/* Camera Mode: Orbit vs Free-Fly */}
              <div className="flex items-center bg-[#060413] border border-cyan-500/30 rounded-xl p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => onChangeCameraMode('orbit')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    cameraMode === 'orbit' ? 'bg-cyan-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Orbit Navigation (Drag to rotate, scroll to zoom)"
                >
                  Orbit
                </button>
                <button
                  type="button"
                  onClick={() => onChangeCameraMode('free_fly')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    cameraMode === 'free_fly' ? 'bg-cyan-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Free-Fly Mode (WASD to fly, mouse to pan)"
                >
                  Free-Fly
                </button>
              </div>
            </div>

            {/* Right Controls: Lighting, Visual Layers, Share, Fullscreen */}
            <div className="flex items-center gap-1.5">
              {/* Lighting Toggle */}
              <button
                type="button"
                onClick={onToggleLightingMode}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer shadow-sm ${
                  lightingMode === 'flood'
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                    : 'bg-[#060413] border-cyan-500/30 text-slate-300 hover:text-white'
                }`}
                title="Toggle Natural Sun Light vs Flood Lighting"
              >
                {lightingMode === 'flood' ? <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-yellow-400" />}
                <span className="hidden md:inline">{lightingMode === 'flood' ? 'Flood' : 'Sunlight'}</span>
              </button>

              {/* Visual Layers Dropdown Menu */}
              <div className="relative">
                <button
                  id="layers-menu-toggle-btn"
                  type="button"
                  onClick={() => setShowLayersMenu(prev => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer shadow-sm ${
                    showLayersMenu ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-[#060413] border-cyan-500/30 text-slate-300 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Layers</span>
                </button>

                {showLayersMenu && (
                  <div className="absolute right-0 bottom-12 w-60 bg-[#080518]/98 backdrop-blur-2xl border border-cyan-500/30 rounded-xl shadow-2xl p-2.5 flex flex-col gap-1 text-xs z-30">
                    <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider px-2 py-0.5">
                      NASA Eyes Visual Layers
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleLayer('orbits')}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-cyan-950/50 text-slate-200 hover:text-white cursor-pointer"
                    >
                      <span>Planetary Orbits</span>
                      {layerVisibility.orbits && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleLayer('labels')}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-cyan-950/50 text-slate-200 hover:text-white cursor-pointer"
                    >
                      <span>Planet & Moon Labels</span>
                      {layerVisibility.labels && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleLayer('asteroids')}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-cyan-950/50 text-slate-200 hover:text-white cursor-pointer"
                    >
                      <span>Asteroid Belt Swarm</span>
                      {layerVisibility.asteroids && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleLayer('trajectories')}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-cyan-950/50 text-slate-200 hover:text-white cursor-pointer"
                    >
                      <span>Spacecraft Trajectories</span>
                      {layerVisibility.trajectories && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleLayer('markers')}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-cyan-950/50 text-slate-200 hover:text-white cursor-pointer"
                    >
                      <span>Spacecraft Markers</span>
                      {layerVisibility.markers && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleLayer('stars')}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-cyan-950/50 text-slate-200 hover:text-white cursor-pointer"
                    >
                      <span>Stars & Milky Way</span>
                      {layerVisibility.stars && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Share link */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-xl border font-semibold transition-all cursor-pointer shadow-sm bg-[#060413] border-cyan-500/30 text-slate-300 hover:text-white"
                  title="Copy shareable link"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                </button>
                {shareToast && (
                  <span className="absolute -top-8 right-0 text-[10px] font-mono text-cyan-300 bg-[#070518]/95 border border-cyan-400/40 rounded-lg px-2 py-1 animate-fadeIn whitespace-nowrap">
                    Link copied!
                  </span>
                )}
              </div>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-xl border font-semibold transition-all cursor-pointer shadow-sm bg-[#060413] border-cyan-500/30 text-slate-300 hover:text-white"
                title="Toggle fullscreen"
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
