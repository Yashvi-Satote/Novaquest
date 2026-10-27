import React, { useState, useRef } from 'react';
import Header from '../components/Header';
import SolarCanvas from '../components/solar/SolarCanvas';
import SolarControlsHUD from '../components/solar/SolarControlsHUD';
import MissionExplorerSidebar from '../components/solar/MissionExplorerSidebar';
import MissionDetailDrawer from '../components/solar/MissionDetailDrawer';

export default function SolarSystemPage({ theme, onToggleTheme }) {
  const canvasRef = useRef(null);

  // Simulation & Selection States
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [activeScale, setActiveScale] = useState('SOLAR_SYSTEM');
  const [selectedMissionSlug, setSelectedMissionSlug] = useState(null);
  const [hoveredItemInfo, setHoveredItemInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleChangeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
  };

  const handleSelectScale = (scaleKey) => {
    setActiveScale(scaleKey);
    setSelectedMissionSlug(null);
    if (canvasRef.current) {
      canvasRef.current.focusScale(scaleKey);
    }
  };

  const handleSelectMissionFromSidebar = (item) => {
    setSelectedMissionSlug(item.slug);
    if (canvasRef.current) {
      canvasRef.current.focusSpacecraft(item.slug);
    }
  };

  const handleSelectSpacecraftFrom3D = (slug) => {
    setSelectedMissionSlug(slug);
  };

  const handleSelectPlanetFrom3D = (planetId) => {
    // If planet is clicked in 3D, focus that planet
    if (canvasRef.current) {
      canvasRef.current.focusPlanet(planetId);
    }
  };

  const handleResetView = () => {
    setSelectedMissionSlug(null);
    setActiveScale('SOLAR_SYSTEM');
    if (canvasRef.current) {
      canvasRef.current.resetView();
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-[#02040a] text-slate-100 flex flex-col font-sans overflow-hidden select-none`}>
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
          isOpen={sidebarOpen}
          onToggleOpen={() => setSidebarOpen(prev => !prev)}
        />

        {/* Central 3D Canvas */}
        <SolarCanvas
          ref={canvasRef}
          isPlaying={isPlaying}
          speed={speed}
          onSelectPlanet={handleSelectPlanetFrom3D}
          onSelectSpacecraft={handleSelectSpacecraftFrom3D}
          onHoverItem={(info) => setHoveredItemInfo(info)}
        />

        {/* Bottom Floating Multi-Scale & Simulation Controls */}
        <SolarControlsHUD
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          speed={speed}
          onChangeSpeed={handleChangeSpeed}
          activeScale={activeScale}
          onSelectScale={handleSelectScale}
          onResetView={handleResetView}
          hoveredItemInfo={hoveredItemInfo}
        />

        {/* Right Drawer: Selected Mission Verified Telemetry & Detail */}
        <MissionDetailDrawer
          selectedSlug={selectedMissionSlug}
          onClose={() => setSelectedMissionSlug(null)}
        />

      </main>
    </div>
  );
}
