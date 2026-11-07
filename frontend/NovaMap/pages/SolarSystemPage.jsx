import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Orbit, RotateCcw, ArrowLeft, Sparkles, PanelBottomOpen, PanelBottomClose } from 'lucide-react';
import AppNavbar from '../../Shared/components/layout/AppNavbar';
import SolarCanvas from '../components/solar/SolarCanvas';
import SolarControlsHUD from '../components/solar/SolarControlsHUD';
import CompactSimulationControls from '../components/solar/CompactSimulationControls';
import FlyingAstronautOverlay from '../components/companion/FlyingAstronautOverlay';
import RocketCursor from '../components/cursor/RocketCursor';
import MissionExplorerSidebar from '../components/solar/MissionExplorerSidebar';
import MissionDetailDrawer from '../components/solar/MissionDetailDrawer';
import CelestialDetailDrawer from '../components/solar/CelestialDetailDrawer';
import CinematicFloatingControls from '../components/solar/CinematicFloatingControls';
import NovaAstronautCompanion from '../components/companion/NovaAstronautCompanion';

const LAYOUT_STORAGE_KEY = 'nova_layout_preferences_v1';

const getInitialLayoutPreferences = () => {
  try {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        isSidebarOpen: parsed.isSidebarOpen ?? false, // Minimal cinematic default: focus on 3D space
        isTimelineOpen: parsed.isTimelineOpen ?? false, // Hidden by default, accessible via floating settings
        isCompanionOpen: parsed.isCompanionOpen ?? true,
        isDrawerOpen: parsed.isDrawerOpen ?? false,
        isZenMode: false
      };
    }
  } catch (e) {
    console.warn('Failed to parse saved layout preferences', e);
  }
  return {
    isSidebarOpen: false, // Minimal cinematic default: focus on 3D space
    isTimelineOpen: false, // Hidden by default, accessible via floating settings
    isCompanionOpen: true,
    isDrawerOpen: false,
    isZenMode: false
  };
};

export default function SolarSystemPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Cinematic Layout Preferences (saved in localStorage)
  const [layoutPrefs, setLayoutPrefs] = useState(getInitialLayoutPreferences);

  // Simulation & Selection States
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [timeDirection, setTimeDirection] = useState(1); // 1 = forward, -1 = reverse
  const [simulationDate, setSimulationDate] = useState(() => new Date());
  const [activeScale, setActiveScale] = useState('SOLAR_SYSTEM');
  const [selectedMissionSlug, setSelectedMissionSlug] = useState(null);
  const [selectedCelestialId, setSelectedCelestialId] = useState(null);
  const [isVoyagerLocalMode, setIsVoyagerLocalMode] = useState(false);
  const [isSurfaceMode, setIsSurfaceMode] = useState(false);
  const [activeSurfaceCraft, setActiveSurfaceCraft] = useState(null);
  const [isInspectingSpacecraft, setIsInspectingSpacecraft] = useState(false);
  const [inspectedCraft, setInspectedCraft] = useState(null);
  const [hoveredItemInfo, setHoveredItemInfo] = useState(null);

  // NASA Eyes-inspired Display Controls
  const [lightingMode, setLightingMode] = useState('natural'); // 'natural' | 'flood'
  const [cameraMode, setCameraMode] = useState('orbit'); // 'orbit' | 'free_fly'
  const [layerVisibility, setLayerVisibility] = useState({
    orbits: true,
    labels: true,
    trajectories: true,
    markers: true,
    spacecraft: true,
    asteroids: true,
    comets: true,
    stars: true
  });

  // Single Option A Astronaut Companion & Chat Contextual Menu States
  const [isAstronautVisible, setIsAstronautVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false); // Closed by default
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('nova_voice_muted') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem('nova_voice_muted', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Requirement 5: Bottom HUD Restore / Hide (Default: hidden to maintain cinematic view)
  const [isBottomHudVisible, setIsBottomHudVisible] = useState(false);

  // Save layout preferences to localStorage
  const saveLayoutPrefs = (updates) => {
    setLayoutPrefs(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({
          isSidebarOpen: next.isSidebarOpen,
          isTimelineOpen: next.isTimelineOpen,
          isCompanionOpen: next.isCompanionOpen,
          isDrawerOpen: next.isDrawerOpen
        }));
      } catch (e) {
        console.warn('Failed to save layout preferences', e);
      }
      return next;
    });
  };

  // Dock button handlers
  const handleToggleSidebar = () => {
    saveLayoutPrefs({ isSidebarOpen: !layoutPrefs.isSidebarOpen });
  };

  const handleToggleTimeline = () => {
    setIsBottomHudVisible(prev => !prev);
    saveLayoutPrefs({ isTimelineOpen: !isBottomHudVisible });
  };

  const handleToggleCompanion = () => {
    setIsAstronautVisible(prev => !prev);
    saveLayoutPrefs({ isCompanionOpen: !isAstronautVisible });
  };

  const handleToggleDrawer = () => {
    saveLayoutPrefs({ isDrawerOpen: !layoutPrefs.isDrawerOpen });
  };

  const handleToggleZenMode = () => {
    setLayoutPrefs(prev => ({ ...prev, isZenMode: !prev.isZenMode }));
  };

  const handleRestoreDefaultLayout = () => {
    const defaults = {
      isSidebarOpen: false,
      isTimelineOpen: false,
      isCompanionOpen: true,
      isDrawerOpen: false,
      isZenMode: false
    };
    setLayoutPrefs(defaults);
    setIsBottomHudVisible(false);
    setIsAstronautVisible(true);
    setIsChatOpen(false);
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(defaults));
    } catch (e) {
      console.warn('Failed to save layout preferences', e);
    }
    handleResetView();
  };

  // Escape key exits Zen mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && layoutPrefs.isZenMode) {
        setLayoutPrefs(prev => ({ ...prev, isZenMode: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layoutPrefs.isZenMode]);

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleToggleTimeDirection = (dir) => {
    const nextDir = dir !== undefined ? dir : (timeDirection > 0 ? -1 : 1);
    setTimeDirection(nextDir);
    if (canvasRef.current) {
      canvasRef.current.setTimeDirection(nextDir);
    }
  };

  const handleStepDays = (days) => {
    if (canvasRef.current) {
      canvasRef.current.stepDays(days);
    }
  };

  // Freeze simulation time while the user drags the time slider (NASA Eyes behavior)
  const handleScrubStart = () => {
    setIsPlaying(false);
  };
  const handleScrubEnd = () => {
    // remain paused after scrub, user presses play to resume
  };

  const handleChangeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
  };

  const handleSelectDate = (newDate) => {
    setSimulationDate(newDate);
    if (canvasRef.current) {
      canvasRef.current.setSimulationDate(newDate);
    }
  };

  const handleToggleLightingMode = () => {
    setLightingMode(prev => (prev === 'natural' ? 'flood' : 'natural'));
  };

  const handleChangeCameraMode = (mode) => {
    setCameraMode(mode);
  };

  const handleToggleLayer = (layerName) => {
    setLayerVisibility(prev => {
      const next = { ...prev, [layerName]: !prev[layerName] };
      if (canvasRef.current) {
        canvasRef.current.setLayerVisibility(layerName, next[layerName]);
      }
      return next;
    });
  };

  const handleSelectScale = (scaleKey) => {
    setActiveScale(scaleKey);
    if (scaleKey === 'VOYAGER_LOCAL') {
      setSelectedMissionSlug('voyager-1');
      setIsVoyagerLocalMode(true);
      setIsSurfaceMode(false);
    } else {
      setIsVoyagerLocalMode(false);
    }
    if (canvasRef.current) {
      canvasRef.current.focusScale(scaleKey);
    }
  };

  const handleEnterVoyagerLocal = () => {
    setSelectedMissionSlug('voyager-1');
    setIsVoyagerLocalMode(true);
    setIsSurfaceMode(false);
    setActiveScale('VOYAGER_LOCAL');
    if (canvasRef.current) {
      canvasRef.current.enterVoyagerLocalMode();
    }
  };

  const handleExitVoyagerLocal = () => {
    setIsVoyagerLocalMode(false);
    setActiveScale('HELIOSPHERE');
    if (canvasRef.current) {
      canvasRef.current.exitVoyagerLocalMode();
    }
  };

  const handleEnterSurfaceMode = (slug) => {
    setIsSurfaceMode(true);
    setIsVoyagerLocalMode(false);
    setSelectedMissionSlug(slug);
    if (canvasRef.current) {
      canvasRef.current.enterSurfaceMode(slug);
    }
  };

  const handleExitSurfaceMode = () => {
    setIsSurfaceMode(false);
    setActiveSurfaceCraft(null);
    if (canvasRef.current) {
      canvasRef.current.exitSurfaceMode();
    }
  };

  const handleModeChange = (modeData) => {
    if (modeData.isVoyagerLocal !== undefined) {
      setIsVoyagerLocalMode(modeData.isVoyagerLocal);
    }
    if (modeData.isSurfaceMode !== undefined) {
      setIsSurfaceMode(modeData.isSurfaceMode);
      setActiveSurfaceCraft(modeData.activeSurfaceCraft || null);
    }
    if (modeData.scale) {
      setActiveScale(modeData.scale);
    }
  };

  const handleSelectMissionFromSidebar = (item) => {
    setSelectedMissionSlug(item.slug);
    setSelectedCelestialId(null);
    if (isVoyagerLocalMode && item.slug !== 'voyager-1') {
      setIsVoyagerLocalMode(false);
    }
    if (canvasRef.current) {
      canvasRef.current.focusSpacecraft(item.slug);
    }
  };

  const handleSelectSpacecraftFrom3D = (slug) => {
    setSelectedMissionSlug(slug);
    setSelectedCelestialId(null);
    if (isVoyagerLocalMode && slug !== 'voyager-1') {
      setIsVoyagerLocalMode(false);
    }
    if (isSurfaceMode) {
      setIsSurfaceMode(false);
    }
  };

  const handleSelectPlanetFrom3D = (planetId) => {
    setSelectedCelestialId(planetId);
    setSelectedMissionSlug(null);
    if (isVoyagerLocalMode) setIsVoyagerLocalMode(false);
    if (isSurfaceMode) setIsSurfaceMode(false);
  };

  const handleResetView = () => {
    setSelectedMissionSlug(null);
    setSelectedCelestialId(null);
    setIsVoyagerLocalMode(false);
    setIsSurfaceMode(false);
    setActiveSurfaceCraft(null);
    setActiveScale('SOLAR_SYSTEM');
    if (canvasRef.current) {
      canvasRef.current.resetView();
    }
  };

  const handleZoomIn = () => {
    if (canvasRef.current) {
      canvasRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (canvasRef.current) {
      canvasRef.current.zoomOut();
    }
  };

  const handleSpacecraftInspectionChange = ({ isInspecting, slug, craft }) => {
    setIsInspectingSpacecraft(isInspecting);
    setInspectedCraft(craft || null);
    if (isInspecting && slug) {
      setSelectedMissionSlug(slug);
      setSelectedCelestialId(null);
    }
  };

  const handleExitSpacecraftInspection = () => {
    setIsInspectingSpacecraft(false);
    setInspectedCraft(null);
    setSelectedMissionSlug(null);
    if (canvasRef.current) {
      canvasRef.current.exitSpacecraftInspection();
    }
  };

  const handleToggleInspectionAutoRotate = () => {
    if (canvasRef.current) {
      canvasRef.current.toggleInspectionAutoRotate();
    }
  };

  return (
    <div className="h-screen bg-[#060412] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Shared application navigation (Hidden in Zen Mode) */}
      {!layoutPrefs.isZenMode && <AppNavbar />}

      {/* 3D Deep Space Viewport & HUD Overlay Container */}
      <main className="relative flex-1 min-h-0 w-full overflow-hidden novamap-viewport-canvas-area">
        <style>{`
          .novamap-viewport-canvas-area canvas {
            cursor: none !important;
          }
          .novamap-viewport-canvas-area button,
          .novamap-viewport-canvas-area input,
          .novamap-viewport-canvas-area a,
          .novamap-viewport-canvas-area select,
          .novamap-viewport-canvas-area textarea,
          .novamap-viewport-canvas-area [role="button"] {
            cursor: auto !important;
          }
        `}</style>

        {/* Full-Screen Animated 3D Cartoon Astronaut Companion (Option A — Sole Instance) */}
        {!layoutPrefs.isZenMode && isAstronautVisible && (
          <FlyingAstronautOverlay
            isVisible={isAstronautVisible}
            onClose={() => setIsAstronautVisible(false)}
            onOpenChat={() => setIsChatOpen(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* Aerodynamic Rocket Mouse Cursor (Requirement 3) */}
        <RocketCursor />
        
        {/* Floating Minimal Viewport Control Dock (Phase 2) */}
        <CinematicFloatingControls
          isSidebarOpen={layoutPrefs.isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          isTimelineOpen={isBottomHudVisible || layoutPrefs.isTimelineOpen}
          onToggleTimeline={handleToggleTimeline}
          isCompanionOpen={isAstronautVisible}
          onToggleCompanion={handleToggleCompanion}
          isDrawerOpen={layoutPrefs.isDrawerOpen}
          onToggleDrawer={handleToggleDrawer}
          isZenMode={layoutPrefs.isZenMode}
          onToggleZenMode={handleToggleZenMode}
          onRestoreDefaultLayout={handleRestoreDefaultLayout}
          className={
            layoutPrefs.isZenMode
              ? 'top-4 left-4'
              : layoutPrefs.isSidebarOpen
                ? 'top-20 left-80 sm:left-88 md:left-[24.5rem]'
                : 'top-20 left-4'
          }
        />

        {/* Left Drawer: NASA Eyes-Inspired Explorer (Collapsible) */}
        {!layoutPrefs.isZenMode && (
          <MissionExplorerSidebar
            selectedMissionSlug={selectedMissionSlug}
            selectedCelestialId={selectedCelestialId}
            onSelectMission={handleSelectMissionFromSidebar}
            onSelectPlanet={(planetId) => {
              setSelectedCelestialId(planetId);
              setSelectedMissionSlug(null);
              if (canvasRef.current) {
                canvasRef.current.focusCelestialBody(planetId);
              }
            }}
            onSelectMoon={(moonId) => {
              setSelectedCelestialId(moonId);
              setSelectedMissionSlug(null);
              if (canvasRef.current) {
                canvasRef.current.focusMoon(moonId);
              }
            }}
            onSelectScale={handleSelectScale}
            onResetView={handleResetView}
            isOpen={layoutPrefs.isSidebarOpen}
            onToggleOpen={handleToggleSidebar}
            hideToggleButton={true}
          />
        )}

        {/* Central 3D Canvas */}
        <SolarCanvas
          ref={canvasRef}
          isPlaying={isPlaying}
          speed={speed}
          timeDirection={timeDirection}
          simulationDate={simulationDate}
          lightingMode={lightingMode}
          cameraMode={cameraMode}
          layerVisibility={layerVisibility}
          onSelectPlanet={handleSelectPlanetFrom3D}
          onSelectSpacecraft={handleSelectSpacecraftFrom3D}
          onDeselect={() => {
            setSelectedCelestialId(null);
            setSelectedMissionSlug(null);
          }}
          onHoverItem={(info) => setHoveredItemInfo(info)}
          onModeChange={handleModeChange}
          onDateChange={(date) => setSimulationDate(date)}
          onSpacecraftInspectionChange={handleSpacecraftInspectionChange}
        />

        {/* In-Scene Spacecraft Inspection Floating HUD Bar (NASA Eyes Experience) */}
        {isInspectingSpacecraft && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 animate-fadeIn flex items-center gap-2.5 bg-[#0a071c]/90 backdrop-blur-xl border border-cyan-500/40 p-1.5 px-3 rounded-2xl shadow-2xl shadow-cyan-950/80">
            <button
              type="button"
              id="return-to-solar-system-btn"
              onClick={handleExitSpacecraftInspection}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-cyan-950/60 border border-cyan-300/40 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Orbit className="w-4 h-4 text-cyan-200" />
              <span>Return to Solar System</span>
            </button>
            <div className="h-4 w-px bg-slate-700/60" />
            <button
              type="button"
              id="toggle-inspection-autorotate-btn"
              onClick={handleToggleInspectionAutoRotate}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/20 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Toggle Orbit Auto-Rotation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-mono">Auto-Rotate</span>
            </button>
          </div>
        )}

        {/* Right Edge Floating Button to Restore/Hide Bottom HUD (Requirement 5) */}
        {!layoutPrefs.isZenMode && (
          <button
            type="button"
            id="toggle-bottom-hud-btn"
            onClick={() => setIsBottomHudVisible(prev => !prev)}
            className={`fixed right-4 bottom-20 z-40 p-2.5 rounded-2xl backdrop-blur-xl border transition-all cursor-pointer shadow-2xl flex items-center justify-center group ${
              isBottomHudVisible
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-cyan-900/70'
                : 'bg-[#09071c]/90 border-cyan-500/30 text-slate-300 hover:text-white hover:border-cyan-400/60 shadow-black/80'
            }`}
            title={isBottomHudVisible ? "Hide Bottom Timeline & Navigation HUD" : "Restore Bottom Timeline & Navigation HUD"}
            aria-label={isBottomHudVisible ? "Hide Bottom HUD" : "Restore Bottom HUD"}
          >
            {isBottomHudVisible ? (
              <PanelBottomClose className="w-5 h-5 text-cyan-300" />
            ) : (
              <PanelBottomOpen className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            )}
          </button>
        )}

        {/* Restored NASA Eyes-Style Simulation & Timeline HUD (Requirement 5) */}
        {!layoutPrefs.isZenMode && isBottomHudVisible && (
          <SolarControlsHUD
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            speed={speed}
            onChangeSpeed={handleChangeSpeed}
            timeDirection={timeDirection}
            onToggleTimeDirection={handleToggleTimeDirection}
            onStepDays={handleStepDays}
            activeScale={activeScale}
            onSelectScale={handleSelectScale}
            onResetView={handleResetView}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            hoveredItemInfo={hoveredItemInfo}
            isVoyagerLocalMode={isVoyagerLocalMode}
            onExitVoyagerLocal={handleExitVoyagerLocal}
            isSurfaceMode={isSurfaceMode}
            activeSurfaceCraft={activeSurfaceCraft}
            onExitSurfaceMode={handleExitSurfaceMode}
            selectedMissionSlug={selectedMissionSlug}
            onEnterVoyagerLocal={handleEnterVoyagerLocal}
            simulationDate={simulationDate}
            onSelectDate={handleSelectDate}
            lightingMode={lightingMode}
            onToggleLightingMode={handleToggleLightingMode}
            cameraMode={cameraMode}
            onChangeCameraMode={handleChangeCameraMode}
            layerVisibility={layerVisibility}
            onToggleLayer={handleToggleLayer}
            onScrubStart={handleScrubStart}
            onScrubEnd={handleScrubEnd}
          />
        )}

        {/* Optional Compact Simulation Settings Modal */}
        {!layoutPrefs.isZenMode && layoutPrefs.isTimelineOpen && !isBottomHudVisible && (
          <CompactSimulationControls
            isOpen={layoutPrefs.isTimelineOpen}
            onClose={() => saveLayoutPrefs({ isTimelineOpen: false })}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            speed={speed}
            onChangeSpeed={handleChangeSpeed}
            timeDirection={timeDirection}
            onToggleTimeDirection={handleToggleTimeDirection}
            onStepDays={handleStepDays}
            simulationDate={simulationDate}
            onSelectDate={handleSelectDate}
            onResetView={handleResetView}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            lightingMode={lightingMode}
            onToggleLightingMode={handleToggleLightingMode}
            cameraMode={cameraMode}
            onChangeCameraMode={handleChangeCameraMode}
            layerVisibility={layerVisibility}
            onToggleLayer={handleToggleLayer}
            activeScale={activeScale}
            onSelectScale={handleSelectScale}
          />
        )}

        {/* NOVA: Two-Way Voice and Written Conversation Interface (Requirement 4 — Opened via Astronaut Context Menu) */}
        {!layoutPrefs.isZenMode && isChatOpen && (
          <NovaAstronautCompanion
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            selectedCelestialId={selectedCelestialId}
            selectedMissionSlug={selectedMissionSlug}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* Right Drawer: Selected Mission Verified Telemetry & Detail (Only when explicitly opened via dock) */}
        {!layoutPrefs.isZenMode && layoutPrefs.isDrawerOpen && selectedMissionSlug && (
          <MissionDetailDrawer
            selectedSlug={selectedMissionSlug}
            onClose={() => saveLayoutPrefs({ isDrawerOpen: false })}
            onEnterVoyagerLocal={handleEnterVoyagerLocal}
            isVoyagerLocalMode={isVoyagerLocalMode}
            isInspectingSpacecraft={isInspectingSpacecraft}
            onExitInspection={handleExitSpacecraftInspection}
            onToggleAutoRotate={handleToggleInspectionAutoRotate}
            onFocusSpacecraft={(slug) => {
              if (canvasRef.current) {
                canvasRef.current.focusSpacecraft(slug);
              }
            }}
            onExploreSurface={handleEnterSurfaceMode}
          />
        )}

        {/* Right Drawer: Selected Celestial Body Inspection (Only when explicitly opened via dock) */}
        {!layoutPrefs.isZenMode && layoutPrefs.isDrawerOpen && selectedCelestialId && (
          <CelestialDetailDrawer
            selectedId={selectedCelestialId}
            onClose={() => saveLayoutPrefs({ isDrawerOpen: false })}
            onSelectMoon={(moonId) => {
              setSelectedCelestialId(moonId);
              if (canvasRef.current) {
                canvasRef.current.focusMoon(moonId);
              }
            }}
            onSelectParentPlanet={(planetId) => {
              setSelectedCelestialId(planetId);
              if (canvasRef.current) {
                canvasRef.current.focusPlanet(planetId);
              }
            }}
            onExploreSurface={handleEnterSurfaceMode}
            onResetToSystem={handleResetView}
          />
        )}

      </main>
    </div>
  );
}
