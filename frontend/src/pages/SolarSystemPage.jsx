import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SolarCanvas from '../components/solar/SolarCanvas';
import SolarControlsHUD from '../components/solar/SolarControlsHUD';
import MissionExplorerSidebar from '../components/solar/MissionExplorerSidebar';
import MissionDetailDrawer from '../components/solar/MissionDetailDrawer';
import CelestialDetailDrawer from '../components/solar/CelestialDetailDrawer';

export default function SolarSystemPage({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Simulation & Selection States
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [simulationDate, setSimulationDate] = useState(() => new Date());
  const [activeScale, setActiveScale] = useState('SOLAR_SYSTEM');
  const [selectedMissionSlug, setSelectedMissionSlug] = useState(null);
  const [selectedCelestialId, setSelectedCelestialId] = useState(null);
  const [isVoyagerLocalMode, setIsVoyagerLocalMode] = useState(false);
  const [isSurfaceMode, setIsSurfaceMode] = useState(false);
  const [activeSurfaceCraft, setActiveSurfaceCraft] = useState(null);
  const [hoveredItemInfo, setHoveredItemInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // NASA Eyes-inspired Display Controls
  const [lightingMode, setLightingMode] = useState('natural'); // 'natural' | 'flood'
  const [cameraMode, setCameraMode] = useState('orbit'); // 'orbit' | 'free_fly'
  const [layerVisibility, setLayerVisibility] = useState({
    orbits: true,
    trajectories: true,
    markers: true
  });

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
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

  // Advance simulation date display smoothly while playing
  React.useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setSimulationDate(prev => new Date(prev.getTime() + speed * 5 * 86400000));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

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
    navigate(`/spacecraft/${slug}`);
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

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-[#060412] text-slate-100 flex flex-col font-sans overflow-hidden select-none`}>
      {/* Universal Novaquest Header */}
      <Header 
        theme={theme}
        onToggleTheme={onToggleTheme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* 3D Deep Space Viewport & HUD Overlay Container */}
      <main className="relative flex-1 w-full h-[calc(100vh-61px)] overflow-hidden">
        
        {/* Left Drawer: 250+ Mission Catalogue Explorer */}
        <MissionExplorerSidebar
          selectedMissionSlug={selectedMissionSlug}
          onSelectMission={handleSelectMissionFromSidebar}
          onSelectPlanet={(planetId) => {
            setSelectedCelestialId(planetId);
            setSelectedMissionSlug(null);
            if (canvasRef.current) {
              canvasRef.current.focusCelestialBody(planetId);
            }
          }}
          isOpen={sidebarOpen}
          onToggleOpen={() => setSidebarOpen(prev => !prev)}
        />

        {/* Central 3D Canvas */}
        <SolarCanvas
          ref={canvasRef}
          isPlaying={isPlaying}
          speed={speed}
          simulationDate={simulationDate}
          lightingMode={lightingMode}
          cameraMode={cameraMode}
          layerVisibility={layerVisibility}
          onSelectPlanet={handleSelectPlanetFrom3D}
          onSelectSpacecraft={handleSelectSpacecraftFrom3D}
          onHoverItem={(info) => setHoveredItemInfo(info)}
          onModeChange={handleModeChange}
        />

        {/* Floating NASA Eyes-Style Navigation & Simulation HUD */}
        <SolarControlsHUD
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          speed={speed}
          onChangeSpeed={handleChangeSpeed}
          activeScale={activeScale}
          onSelectScale={handleSelectScale}
          onResetView={handleResetView}
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

        {/* Right Drawer: Selected Mission Verified Telemetry & Detail */}
        <MissionDetailDrawer
          selectedSlug={selectedMissionSlug}
          onClose={() => setSelectedMissionSlug(null)}
          onEnterVoyagerLocal={handleEnterVoyagerLocal}
          isVoyagerLocalMode={isVoyagerLocalMode}
          onFocusSpacecraft={(slug) => {
            if (canvasRef.current) {
              canvasRef.current.focusSpacecraft(slug);
            }
          }}
          onExploreSurface={handleEnterSurfaceMode}
        />

        {/* Right Drawer: Selected Celestial Body Inspection (Planets & Moons) */}
        <CelestialDetailDrawer
          selectedId={selectedCelestialId}
          onClose={() => setSelectedCelestialId(null)}
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

      </main>
    </div>
  );
}
