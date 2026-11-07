import React, { useState, useEffect } from 'react';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Clock, 
  SlidersHorizontal,
  Bot, 
  FileText, 
  EyeOff, 
  Eye, 
  Maximize, 
  Minimize, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

/**
 * CinematicFloatingControls.jsx
 * 
 * Minimal, elegant floating control dock for Phase 2:
 * - Hide/show left explorer sidebar
 * - Hide/show bottom timeline
 * - Hide/show NOVA companion
 * - Hide/show technical detail drawer
 * - Hide all panels (Zen Cinematic Immersion)
 * - Restore default layout
 * - Fullscreen toggle
 */
export default function CinematicFloatingControls({
  isSidebarOpen,
  onToggleSidebar,
  isTimelineOpen,
  onToggleTimeline,
  isCompanionOpen,
  onToggleCompanion,
  isDrawerOpen,
  onToggleDrawer,
  isZenMode,
  onToggleZenMode,
  onRestoreDefaultLayout,
  className = ''
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  return (
    <nav 
      aria-label="Cinematic Viewport Controls"
      className={`fixed top-16 left-4 z-40 flex items-center gap-1 p-1 bg-[#09071c]/85 backdrop-blur-xl border border-cyan-500/25 rounded-2xl shadow-2xl shadow-cyan-950/60 transition-all ${className}`}
    >
      {/* 1. Toggle Explorer Sidebar */}
      <button
        type="button"
        id="dock-toggle-sidebar-btn"
        onClick={onToggleSidebar}
        className={`p-2 rounded-xl transition-all cursor-pointer ${
          isSidebarOpen
            ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-400/40 shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
        title={isSidebarOpen ? 'Hide Explorer Sidebar' : 'Show Explorer Sidebar'}
        aria-label="Toggle Explorer Sidebar"
      >
        {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
      </button>

      {/* 2. Toggle Timeline Controls */}
      <button
        type="button"
        id="dock-toggle-timeline-btn"
        onClick={onToggleTimeline}
        className={`p-2 rounded-xl transition-all cursor-pointer ${
          isTimelineOpen
            ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-400/40 shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
        title={isTimelineOpen ? 'Hide Timeline & Simulation Controls' : 'Show Timeline & Simulation Controls'}
        aria-label="Toggle Timeline Controls"
      >
        <Clock className="w-4 h-4" />
      </button>

      {/* 3. Toggle NOVA Astronaut Companion */}
      <button
        type="button"
        id="dock-toggle-companion-btn"
        onClick={onToggleCompanion}
        className={`p-2 rounded-xl transition-all cursor-pointer ${
          isCompanionOpen
            ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-400/40 shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
        title={isCompanionOpen ? 'Hide NOVA Astronaut Companion' : 'Show NOVA Astronaut Companion'}
        aria-label="Toggle NOVA Astronaut Companion"
      >
        <Sparkles className="w-4 h-4" />
      </button>

      {/* 4. Optional Technical Telemetry Drawer Toggle */}
      <button
        type="button"
        id="dock-toggle-drawer-btn"
        onClick={onToggleDrawer}
        className={`p-2 rounded-xl transition-all cursor-pointer ${
          isDrawerOpen
            ? 'bg-purple-950/60 text-purple-300 border border-purple-400/40 shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
        title={isDrawerOpen ? 'Close Technical Telemetry Drawer' : 'Open Technical Telemetry Drawer'}
        aria-label="Toggle Telemetry Drawer"
      >
        <FileText className="w-4 h-4" />
      </button>

      <div className="h-4 w-px bg-slate-700/60 mx-0.5" />

      {/* 5. Hide All Panels / Zen Cinematic Mode */}
      <button
        type="button"
        id="dock-toggle-zen-btn"
        onClick={onToggleZenMode}
        className={`p-2 rounded-xl transition-all cursor-pointer ${
          isZenMode
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-cyan-950/80 border border-cyan-400/60'
            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
        title={isZenMode ? 'Exit Cinematic Mode (Show Panels)' : 'Cinematic Mode (Hide All Panels)'}
        aria-label="Toggle Cinematic Mode"
      >
        {isZenMode ? <Eye className="w-4 h-4 text-cyan-200" /> : <EyeOff className="w-4 h-4" />}
      </button>

      {/* 6. Restore Default Layout */}
      <button
        type="button"
        id="dock-restore-layout-btn"
        onClick={onRestoreDefaultLayout}
        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer"
        title="Restore Default Solar System Layout"
        aria-label="Restore Default Layout"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* 7. Fullscreen Toggle */}
      <button
        type="button"
        id="dock-toggle-fullscreen-btn"
        onClick={handleToggleFullscreen}
        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        aria-label="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </button>
    </nav>
  );
}

