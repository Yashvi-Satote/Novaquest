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
  Compass,
  Radio
} from 'lucide-react';
import { SOLAR_SYSTEM_DISCLAIMER } from './celestialData';
import { VOYAGER_LOCAL_METRICS } from './interstellarData';

export default function SolarControlsHUD({
  onResetView,
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
  layerVisibility = { orbits: true, trajectories: true, markers: true, labels: true, stars: true },
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

  return (
    <>
      {/* Top Banner: Mode Specific or Ephemeris Notice */}
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
          <div className="bg-[#0b0820]/90 backdrop-blur-md border border-purple-500/25 px-4 py-1.5 rounded-full shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 text-center">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <p className="text-[11px] sm:text-xs text-purple-200/90 font-medium tracking-wide truncate">
              {SOLAR_SYSTEM_DISCLAIMER}
            </p>
          </div>
        </div>
      )}

      {/* Top Left: 3D Hover Inspector Badge */}
      {hoveredItemInfo && (
        <div className="pointer-events-none absolute top-16 left-6 z-20 bg-[#0e0a28]/95 backdrop-blur-md border border-purple-500/30 px-3.5 py-2 rounded-xl shadow-xl shadow-purple-950/50 flex items-center gap-2.5 animate-fadeIn font-sans">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm animate-pulse" />
          <div>
            <span className="text-xs font-bold text-white tracking-wide block">{hoveredItemInfo.name}</span>
            <span className="text-[10px] text-cyan-300 font-mono">
              {hoveredItemInfo.isSpacecraft ? (hoveredItemInfo.coordinates || 'Spacecraft Telemetry') : 'Celestial Body'} • Click to Inspect
            </span>
          </div>
        </div>
      )}

      {/* Bottom Floating NASA Eyes Essential Navigation & Layer Controls Bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-2xl flex flex-col items-center gap-2 font-sans">
        <div className="w-full bg-[#0a071c]/92 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-950/80 px-4 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-xs">
          
          {/* Left: Essential Camera Reset & Navigation */}
          <div className="flex items-center gap-2">
            <button
              id="reset-solar-view-btn"
              type="button"
              onClick={onResetView}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold transition-all shadow-md shadow-purple-900/40 cursor-pointer active:scale-98"
              title="Reset camera to Solar System overview"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-300" />
              <span>Reset Camera</span>
            </button>

            {/* Camera Mode: Orbit vs Free-Fly */}
            <div className="flex items-center bg-[#070514] border border-purple-500/30 rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => onChangeCameraMode('orbit')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  cameraMode === 'orbit' ? 'bg-cyan-600 text-white font-bold shadow-sm' : 'text-purple-300 hover:text-white'
                }`}
                title="Orbit Navigation (Drag to rotate, scroll to zoom)"
              >
                Orbit
              </button>
              <button
                type="button"
                onClick={() => onChangeCameraMode('free_fly')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  cameraMode === 'free_fly' ? 'bg-cyan-600 text-white font-bold shadow-sm' : 'text-purple-300 hover:text-white'
                }`}
                title="Free-Fly Mode (WASD to fly, mouse to pan)"
              >
                Free-Fly
              </button>
            </div>
          </div>

          {/* Right: Lighting, Layers, Fullscreen & Share */}
          <div className="flex items-center gap-2">
            {/* Lighting Toggle */}
            <button
              type="button"
              onClick={onToggleLightingMode}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-semibold transition-all cursor-pointer shadow-sm ${
                lightingMode === 'flood'
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                  : 'bg-[#070514] border-purple-500/30 text-purple-200 hover:text-white'
              }`}
              title="Toggle Natural Sun Light vs Flood Lighting"
            >
              {lightingMode === 'flood' ? <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-yellow-400" />}
              <span className="hidden md:inline">{lightingMode === 'flood' ? 'Flood' : 'Sunlight'}</span>
            </button>

            {/* Visual Layers Dropdown */}
            <div className="relative">
              <button
                id="layers-menu-toggle-btn"
                type="button"
                onClick={() => setShowLayersMenu(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-semibold transition-all cursor-pointer shadow-sm ${
                  showLayersMenu ? 'bg-purple-600 text-white border-purple-400' : 'bg-[#070514] border-purple-500/30 text-purple-200 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Layers</span>
              </button>

              {showLayersMenu && (
                <div className="absolute right-0 bottom-12 w-56 bg-[#0a071c]/98 backdrop-blur-2xl border border-purple-500/30 rounded-xl shadow-2xl p-2.5 flex flex-col gap-1 text-xs z-30">
                  <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider px-2 py-0.5">NASA Eyes Visual Layers</span>
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
                    onClick={() => onToggleLayer('labels')}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-purple-900/40 text-purple-200 hover:text-white cursor-pointer"
                  >
                    <span>Planet & Moon Labels</span>
                    {layerVisibility.labels && <Check className="w-3.5 h-3.5 text-cyan-400" />}
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
                  <button
                    type="button"
                    onClick={() => onToggleLayer('stars')}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-purple-900/40 text-purple-200 hover:text-white cursor-pointer"
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border font-semibold transition-all cursor-pointer shadow-sm bg-[#070514] border-purple-500/30 text-purple-200 hover:text-white"
                title="Copy link to this view"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              {shareToast && (
                <span className="absolute -top-8 right-0 text-[10px] font-mono text-cyan-300 bg-[#0a071c]/95 border border-cyan-400/40 rounded-lg px-2 py-1 animate-fadeIn whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </div>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border font-semibold transition-all cursor-pointer shadow-sm bg-[#070514] border-purple-500/30 text-purple-200 hover:text-white"
              title="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
