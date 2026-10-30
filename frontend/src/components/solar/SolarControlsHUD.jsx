import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Info, 
  ArrowLeft, 
  Calendar,
  Clock,
  Sun,
  Lightbulb,
  Layers,
  ChevronUp,
  Check,
  CalendarDays,
  Share2,
  Maximize,
  Minimize
 } from 'lucide-react';
import { SOLAR_SYSTEM_DISCLAIMER } from './celestialData';
import { SCALE_PRESETS, VOYAGER_LOCAL_METRICS } from './interstellarData';
import { HISTORICAL_MILESTONES } from './ephemeris';

export default function SolarControlsHUD({
  isPlaying,
  onTogglePlay,
  speed,
  onChangeSpeed,
  activeScale,
  onSelectScale,
  onResetView,
  hoveredItemInfo,
  isVoyagerLocalMode,
  onExitVoyagerLocal,
  isSurfaceMode,
  activeSurfaceCraft,
  onExitSurfaceMode,
  simulationDate,
  onSelectDate,
  lightingMode = 'natural',
  onToggleLightingMode,
  cameraMode = 'orbit',
  onChangeCameraMode,
  layerVisibility = { orbits: true, trajectories: true, markers: true },
  onToggleLayer,
  onScrubStart,
  onScrubEnd
}) {
  const [showMilestones, setShowMilestones] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateInput, setCustomDateInput] = useState('2026-10-29');
  const [showLayersMenu, setShowLayersMenu] = useState(false);

  // --- NASA Eyes-style Time Scrub Slider (±30 day window, fixed while dragging) ---
  const [scrubWindow, setScrubWindow] = useState(null);
  const SCRUB_SPAN = 30 * 86400000;
  const sliderMin = simulationDate ? (scrubWindow ? scrubWindow.min : simulationDate.getTime() - SCRUB_SPAN) : 0;
  const sliderMax = simulationDate ? (scrubWindow ? scrubWindow.max : simulationDate.getTime() + SCRUB_SPAN) : 1;
  const sliderValue = simulationDate ? Math.min(sliderMax, Math.max(sliderMin, simulationDate.getTime())) : 0;

  const handleScrubStart = () => {
    setScrubWindow({ min: sliderMin, max: sliderMax });
    if (onScrubStart) onScrubStart();
  };
  const handleScrubEnd = () => {
    setScrubWindow(null);
    if (onScrubEnd) onScrubEnd();
  };
  const handleScrubChange = (e) => {
    onSelectDate(new Date(Number(e.target.value)));
  };
  const fmtSliderDate = (ms) => {
    const d = new Date(ms);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${months[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')} '${String(d.getUTCFullYear()).slice(2)}`;
  };

  // --- Fullscreen toggle (NASA Eyes parity) ---
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  // --- Share (copy link) ---
  const [shareToast, setShareToast] = useState(false);
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 1800);
    } catch {
      window.prompt('Copy this link:', window.location.href);
    }
  };

  const speedOptions = [0.5, 1, 5, 20, 100];

  // Format UTC date display
  const formatDateDisplay = (date) => {
    if (!date) return 'Live Telemetry';
    const d = new Date(date);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[d.getUTCMonth()];
    const day = String(d.getUTCDate()).padStart(2, '0');
    const year = d.getUTCFullYear();
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const mins = String(d.getUTCMinutes()).padStart(2, '0');
    const secs = String(d.getUTCSeconds()).padStart(2, '0');
    return `${month} ${day}, ${year} • ${hours}:${mins}:${secs} UTC`;
  };

  const handleApplyCustomDate = (e) => {
    e.preventDefault();
    if (!customDateInput) return;
    const parsed = new Date(customDateInput + 'T12:00:00Z');
    if (!isNaN(parsed.getTime())) {
      onSelectDate(parsed);
      setShowDatePicker(false);
    }
  };

  return (
    <>
      {/* Top Banner: Mode Specific or Ephemeris Disclaimer */}
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
                  Site: <strong className="text-white">{activeSurfaceCraft.coordinates?.siteName}</strong> ({activeSurfaceCraft.coordinates?.lat.toFixed(2)}°, {activeSurfaceCraft.coordinates?.lon.toFixed(2)}°)
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
          <div className="bg-[#0b0820]/90 backdrop-blur-md border border-purple-500/25 px-4 py-1.5 rounded-full shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 text-center">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <p className="text-[11px] sm:text-xs text-purple-200/90 font-medium tracking-wide truncate">
              {SOLAR_SYSTEM_DISCLAIMER}
            </p>
          </div>
        </div>
      )}

      {/* Top Right Quick Controls: Share, Fullscreen, Lighting & Layers & Camera Mode */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Share (copy link) */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer shadow-lg bg-[#0a071c]/85 border-purple-500/30 text-purple-200 hover:text-white"
          title="Copy link to this view"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Fullscreen toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer shadow-lg bg-[#0a071c]/85 border-purple-500/30 text-purple-200 hover:text-white"
          title="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Fullscreen</span>
        </button>
        {shareToast && (
          <span className="absolute -bottom-8 right-0 text-[10px] font-mono text-cyan-300 bg-[#0a071c]/95 border border-cyan-400/40 rounded-lg px-2 py-1 animate-fadeIn">Link copied!</span>
        )}

        {/* Lighting Toggle */}
        <button
          type="button"
          onClick={onToggleLightingMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer shadow-lg ${
            lightingMode === 'flood'
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-amber-950/40'
              : 'bg-[#0a071c]/85 border-purple-500/30 text-purple-200 hover:text-white'
          }`}
          title="Toggle Natural Sun Light vs Flood Ambient Light (NASA Eyes Lighting)"
        >
          {lightingMode === 'flood' ? <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-yellow-400" />}
          <span className="hidden sm:inline">{lightingMode === 'flood' ? 'Flood Light' : 'Natural Sun'}</span>
        </button>

        {/* Camera Mode Selector */}
        <div className="flex items-center bg-[#0a071c]/85 backdrop-blur-xl border border-purple-500/30 rounded-xl p-0.5 text-xs">
          <button
            type="button"
            onClick={() => onChangeCameraMode('orbit')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              cameraMode === 'orbit' ? 'bg-cyan-600 text-white font-semibold shadow-sm' : 'text-purple-300 hover:text-white'
            }`}
            title="Orbit Navigation (Drag to rotate, scroll to zoom)"
          >
            Orbit
          </button>
          <button
            type="button"
            onClick={() => onChangeCameraMode('free_fly')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              cameraMode === 'free_fly' ? 'bg-cyan-600 text-white font-semibold shadow-sm' : 'text-purple-300 hover:text-white'
            }`}
            title="Free-Fly Mode (WASD to fly, mouse to pan)"
          >
            Free-Fly
          </button>
        </div>

        {/* Visual Layers Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLayersMenu(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer shadow-lg ${
              showLayersMenu ? 'bg-purple-600 text-white border-purple-400' : 'bg-[#0a071c]/85 border-purple-500/30 text-purple-200 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layers</span>
          </button>

          {showLayersMenu && (
            <div className="absolute right-0 top-10 w-48 bg-[#0a071c]/95 backdrop-blur-2xl border border-purple-500/30 rounded-xl shadow-2xl p-2.5 flex flex-col gap-1.5 text-xs z-30">
              <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider px-2 py-0.5">Visual Layers</span>
              <button
                type="button"
                onClick={() => onToggleLayer('orbits')}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-purple-900/40 text-purple-200 hover:text-white cursor-pointer"
              >
                <span>Planetary Orbits</span>
                {layerVisibility.orbits && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
              <button
                type="button"
                onClick={() => onToggleLayer('trajectories')}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-purple-900/40 text-purple-200 hover:text-white cursor-pointer"
              >
                <span>Spacecraft Trajectories</span>
                {layerVisibility.trajectories && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
              <button
                type="button"
                onClick={() => onToggleLayer('markers')}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-purple-900/40 text-purple-200 hover:text-white cursor-pointer"
              >
                <span>Spacecraft Markers</span>
                {layerVisibility.markers && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Left: 3D Hover Inspector Badge */}
      {hoveredItemInfo && (
        <div className="pointer-events-none absolute top-16 left-6 z-20 bg-[#0e0a28]/95 backdrop-blur-md border border-purple-500/30 px-3.5 py-2 rounded-xl shadow-xl shadow-purple-950/50 flex items-center gap-2.5 animate-fadeIn font-sans">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm animate-pulse" />
          <div>
            <span className="text-xs font-bold text-white tracking-wide block">{hoveredItemInfo.name}</span>
            <span className="text-[10px] text-cyan-300 font-mono">
              {hoveredItemInfo.isSpacecraft ? (hoveredItemInfo.coordinates || 'Spacecraft Telemetry') : 'Celestial Body'} • Click to Focus
            </span>
          </div>
        </div>
      )}

      {/* Bottom Center: Main NASA Eyes Timeline & Multi-Scale Deck */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-4xl flex flex-col items-center gap-2 font-sans">
        
        {/* 0. NASA Eyes-style Time Scrub Slider (drag to travel through time) */}
        {simulationDate && (
          <div className="w-full bg-[#0a071c]/85 backdrop-blur-2xl border border-purple-500/25 rounded-2xl shadow-xl shadow-purple-950/60 px-4 py-1.5">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono text-purple-300/70 w-16 text-right shrink-0">{fmtSliderDate(sliderMin)}</span>
              <input
                type="range"
                aria-label="Drag time slider thumb"
                min={sliderMin}
                max={sliderMax}
                step={3600000}
                value={sliderValue}
                onChange={handleScrubChange}
                onPointerDown={handleScrubStart}
                onPointerUp={handleScrubEnd}
                onBlur={handleScrubEnd}
                className="flex-1 h-1.5 cursor-pointer"
                style={{ accentColor: '#22d3ee' }}
              />
              <span className="text-[9px] font-mono text-purple-300/70 w-16 shrink-0">{fmtSliderDate(sliderMax)}</span>
            </div>
          </div>
        )}

        {/* 1. NASA Eyes-Style Simulation Timeline Bar */}
        <div className="w-full bg-[#0a071c]/90 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-950/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Time & Date Display with Jump to Milestones & Custom Date */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-white font-mono font-bold tracking-wider text-xs sm:text-sm bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-500/30">
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{formatDateDisplay(simulationDate)}</span>
            </div>

            {/* Jump to Historic Milestone Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowMilestones(prev => !prev); setShowDatePicker(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-purple-200 hover:text-white font-medium transition-all cursor-pointer"
                title="Jump to historic spaceflight milestones"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Milestones</span>
                <ChevronUp className={`w-3.5 h-3.5 transition-transform ${showMilestones ? 'rotate-180' : ''}`} />
              </button>

              {/* Milestones Dropdown */}
              {showMilestones && (
                <div className="absolute bottom-11 left-0 w-72 sm:w-80 max-h-72 overflow-y-auto bg-[#0a071c]/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 z-30 no-scrollbar">
                  <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider px-2 py-1">Historic Flight Milestones</span>
                  {HISTORICAL_MILESTONES.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSelectDate(m.date);
                        if (m.scale) onSelectScale(m.scale);
                        setShowMilestones(false);
                      }}
                      className="text-left px-3 py-2 rounded-xl hover:bg-purple-900/50 transition-colors group cursor-pointer"
                    >
                      <span className="font-bold text-white text-xs block group-hover:text-cyan-300">{m.label}</span>
                      <span className="text-[10px] text-purple-300/80 block mt-0.5 line-clamp-1">{m.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Date Picker Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowDatePicker(prev => !prev); setShowMilestones(false); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-purple-200 hover:text-white cursor-pointer"
                title="Input a custom simulation date (1800-2050)"
              >
                <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline text-[11px]">Set Date</span>
              </button>

              {showDatePicker && (
                <form
                  onSubmit={handleApplyCustomDate}
                  className="absolute bottom-11 left-0 w-64 bg-[#0a071c]/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-2xl p-3 flex flex-col gap-2.5 z-30"
                >
                  <span className="text-[10px] text-purple-300 font-mono uppercase">Simulation Date</span>
                  <input
                    type="date"
                    min="1800-01-01"
                    max="2050-12-31"
                    value={customDateInput}
                    onChange={(e) => setCustomDateInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(false)}
                      className="px-2.5 py-1 text-slate-400 hover:text-white text-[11px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[11px] font-semibold"
                    >
                      Jump
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Jump to Live (NOW) */}
            <button
              type="button"
              onClick={() => onSelectDate(new Date())}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-400/40 text-[10px] font-mono text-cyan-300 font-bold tracking-wider cursor-pointer transition-all"
              title="Synchronize simulation with real-time current date"
            >
              LIVE
            </button>
          </div>

          {/* Time Controls: Play/Pause, Speed Scrubber */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePlay}
              className={`p-2 rounded-xl transition-all cursor-pointer shadow-md ${
                isPlaying 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:brightness-110 shadow-emerald-950/50' 
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:brightness-110 shadow-amber-950/50'
              }`}
              title={isPlaying ? 'Pause simulation time' : 'Resume simulation time'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Speed Multiplier Pills */}
            <div className="flex items-center bg-purple-950/50 rounded-xl p-0.5 border border-purple-500/20">
              {speedOptions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChangeSpeed(s)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                    speed === s
                      ? 'bg-cyan-600 text-white font-bold shadow-sm'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Multi-Scale Preset Strip & Return to Overview */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a071c]/85 backdrop-blur-2xl border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-950/70">
          <span className="text-[10px] text-purple-300/60 font-mono px-1.5 hidden md:inline">Scale:</span>
          {Object.entries(SCALE_PRESETS).map(([key, preset]) => {
            const isActive = activeScale === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectScale(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-950/50 font-semibold ring-1 ring-violet-400/50'
                    : 'text-purple-200/75 hover:text-white hover:bg-purple-900/30'
                }`}
              >
                <span>{preset.label}</span>
              </button>
            );
          })}

          <div className="w-[1px] h-4 bg-purple-500/20 mx-1 hidden sm:block" />

          {/* Return to Overview Button */}
          <button
            type="button"
            onClick={onResetView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-200 hover:text-white text-xs font-medium transition-all cursor-pointer"
            title="Reset camera and return to Solar System overview"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Overview</span>
          </button>
        </div>

      </div>
    </>
  );
}
