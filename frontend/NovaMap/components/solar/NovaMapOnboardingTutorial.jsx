import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Orbit, 
  Compass, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Check, 
  Layers, 
  Eye, 
  ZoomIn, 
  Globe2, 
  RotateCcw, 
  Play, 
  Clock, 
  Sparkles,
  Info,
  Ruler,
  Maximize2
} from 'lucide-react';

export const TUTORIAL_STORAGE_KEY = 'novamap_onboarding_status_v1';
export const TUTORIAL_SESSION_KEY = 'novamap_onboarding_session_deferred';

export default function NovaMapOnboardingTutorial({
  isOpen,
  onClose,
  onSelectPlanet,
  onResetView,
  onOpenSidebar,
  onOpenBottomHud,
  onOpenDrawer,
  isDrawerOpen,
  selectedCelestialId
}) {
  // State: 'welcome' | 'tour' | 'closed'
  const [stage, setStage] = useState('welcome');
  const [currentStep, setCurrentStep] = useState(1);
  const [targetRect, setTargetRect] = useState(null);
  const [actionDetected, setActionDetected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check viewport size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // When opened via Help/Replay, start directly or at welcome
  useEffect(() => {
    if (isOpen) {
      // If user explicitly opened it from dock/help, let them choose or start tour
      const status = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (status === 'completed' || status === 'skipped') {
        // Explicit replay -> show welcome modal to confirm start
        setStage('welcome');
      } else {
        setStage('welcome');
      }
      setCurrentStep(1);
      setActionDetected(false);
    } else {
      setStage('closed');
    }
  }, [isOpen]);

  // Steps configuration (7 Steps as requested)
  const steps = [
    {
      step: 1,
      title: 'EXPLORE THE SOLAR SYSTEM',
      subtitle: 'Welcome to your 3D celestial universe',
      description: 'Welcome, Explorer! This is your interactive solar system. You can explore planets and discover their locations in real 3D space.',
      detail: 'The Sun sits at the center, surrounded by the 8 major planets, dwarf planets, and accurate orbital trajectories calculated from astronomical ephemeris data.',
      targetSelector: '.novamap-viewport-canvas-area',
      badge: 'Step 1 of 7',
      hint: 'The entire solar system is rendered in real-time WebGL.'
    },
    {
      step: 2,
      title: 'CAMERA NAVIGATION',
      subtitle: 'Free 360-degree orbital perspective',
      description: 'Left-click (or touch) and drag anywhere in space to rotate your camera around the Sun. Right-click and drag to pan across the celestial plane.',
      detail: 'Press the "Reset Camera" button anytime to return to the master solar system overview.',
      targetSelector: '.novamap-viewport-canvas-area',
      badge: 'Step 2 of 7',
      interactiveType: 'drag',
      hint: 'Try dragging to rotate the camera now!'
    },
    {
      step: 3,
      title: 'ZOOM CONTROLS',
      subtitle: 'Traverse interplanetary scales',
      description: 'Use your mouse scroll wheel, pinch gestures, or the on-screen zoom buttons (+ / -) to smoothly fly closer to planets or pull back to outer deep space.',
      detail: 'Zooming in reveals atmospheric bands, planetary rings, surface craters, and natural satellites.',
      targetSelector: '#solar-zoom-in-btn, #dock-toggle-timeline-btn, .novamap-viewport-canvas-area',
      badge: 'Step 3 of 7',
      interactiveType: 'zoom',
      hint: 'Scroll your mouse wheel or click zoom to test!'
    },
    {
      step: 4,
      title: 'SELECT A PLANET',
      subtitle: 'Direct planetary flight & targeting',
      description: 'Click directly on any planet in the 3D scene—or open the Explorer Sidebar—to focus your camera and inspect that world in close-up detail.',
      detail: 'Try clicking Mars below or click "Focus Mars" to initiate a cinematic camera flight directly into Martian orbit!',
      targetSelector: '#dock-toggle-sidebar-btn, .novamap-viewport-canvas-area',
      badge: 'Step 4 of 7',
      interactiveType: 'select_planet',
      actionButton: {
        label: 'Focus Mars',
        planetId: 'mars'
      },
      hint: 'Click "Focus Mars" to watch the camera fly into orbit.'
    },
    {
      step: 5,
      title: 'PLANET INFORMATION',
      subtitle: 'NASA astrophysical telemetry',
      description: 'The Celestial Inspection Drawer provides verified NASA telemetry for the selected celestial body.',
      detail: 'Inspect physical characteristics including Equatorial Diameter, Distance from Sun, Orbital Period, Rotation Period, Atmosphere Breakdown, and Surface Exploration sites.',
      targetSelector: '#celestial-detail-drawer, #dock-toggle-drawer-btn',
      badge: 'Step 5 of 7',
      hint: 'Real planetary facts, orbital statistics, and 3D preview.'
    },
    {
      step: 6,
      title: 'SOLAR SYSTEM CONTROLS',
      subtitle: 'Simulation, layers & visual customisation',
      description: 'Customize your space exploration using the floating control dock and the bottom HUD.',
      detail: 'Control features include: Orbital paths, planet visibility, spacecraft markers, lighting mode (Sunlight vs Flood), simulation time scrubbing, and Zen cinematic immersion.',
      targetSelector: '#dock-toggle-timeline-btn, #toggle-bottom-hud-btn',
      badge: 'Step 6 of 7',
      hint: 'Toggle orbits, scrub through historical dates, and adjust speed.'
    },
    {
      step: 7,
      title: 'FREE EXPLORATION',
      subtitle: 'The universe is waiting for you',
      description: "You're ready, Explorer! Discover the planets and explore the solar system at your own pace.",
      detail: 'You can restart this guided tour anytime by clicking the Help icon on the floating dock.',
      targetSelector: null,
      badge: 'Step 7 of 7',
      hint: 'Embark on your journey across the cosmos.'
    }
  ];

  const currentStepData = steps[currentStep - 1];

  // Update target bounding rectangle for spotlight
  const updateTargetRect = useCallback(() => {
    if (stage !== 'tour' || !currentStepData) {
      setTargetRect(null);
      return;
    }

    if (!currentStepData.targetSelector) {
      setTargetRect(null);
      return;
    }

    // Attempt to locate target element
    const selectors = currentStepData.targetSelector.split(',').map(s => s.trim());
    let el = null;
    for (const sel of selectors) {
      const found = document.querySelector(sel);
      if (found && found.offsetParent !== null) {
        el = found;
        break;
      }
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom
      });
    } else {
      setTargetRect(null);
    }
  }, [stage, currentStepData]);

  // Re-calculate target rect on step change or resize/scroll
  useEffect(() => {
    updateTargetRect();
    const interval = setInterval(updateTargetRect, 300);
    window.addEventListener('resize', updateTargetRect);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateTargetRect);
    };
  }, [updateTargetRect]);

  // Contextual helper actions when entering specific steps
  useEffect(() => {
    if (stage !== 'tour') return;

    setActionDetected(false);

    if (currentStep === 4) {
      // In step 4, ensure sidebar is accessible or planet can be selected
    } else if (currentStep === 5) {
      // In step 5, if no planet is selected, select Mars so the drawer is visibly open
      if (!selectedCelestialId) {
        onSelectPlanet?.('mars');
      }
      onOpenDrawer?.();
    } else if (currentStep === 6) {
      // In step 6, make sure bottom HUD or dock is visible
      onOpenBottomHud?.();
    }
  }, [stage, currentStep, selectedCelestialId, onSelectPlanet, onOpenDrawer, onOpenBottomHud]);

  // Listen for real user interaction to auto-detect completion on steps 2, 3, 4
  useEffect(() => {
    if (stage !== 'tour' || !currentStepData) return;

    let hasInteracted = false;

    // STEP 2: Detect camera rotation (mouse drag / pointer drag)
    if (currentStepData.interactiveType === 'drag') {
      let startX = 0;
      let startY = 0;
      let isDragging = false;

      const handleDown = (e) => {
        startX = e.clientX || 0;
        startY = e.clientY || 0;
        isDragging = true;
      };

      const handleMove = (e) => {
        if (!hasInteracted) {
          if (startX > 0 && (isDragging || e.buttons > 0)) {
            const dist = Math.hypot((e.clientX || 0) - startX, (e.clientY || 0) - startY);
            if (dist > 15) {
              hasInteracted = true;
              setActionDetected(true);
            }
          } else if (e.buttons > 0 && (Math.abs(e.movementX || 0) > 3 || Math.abs(e.movementY || 0) > 3)) {
            hasInteracted = true;
            setActionDetected(true);
          }
        }
      };

      const handleUp = () => {
        isDragging = false;
        startX = 0;
      };

      window.addEventListener('pointerdown', handleDown, { capture: true });
      window.addEventListener('pointermove', handleMove, { capture: true });
      window.addEventListener('pointerup', handleUp, { capture: true });
      window.addEventListener('mousedown', handleDown, { capture: true });
      window.addEventListener('mousemove', handleMove, { capture: true });
      window.addEventListener('mouseup', handleUp, { capture: true });

      return () => {
        window.removeEventListener('pointerdown', handleDown, { capture: true });
        window.removeEventListener('pointermove', handleMove, { capture: true });
        window.removeEventListener('pointerup', handleUp, { capture: true });
        window.removeEventListener('mousedown', handleDown, { capture: true });
        window.removeEventListener('mousemove', handleMove, { capture: true });
        window.removeEventListener('mouseup', handleUp, { capture: true });
      };
    }

    // STEP 3: Detect zoom (wheel or zoom button)
    if (currentStepData.interactiveType === 'zoom') {
      const handleWheel = (e) => {
        if (Math.abs(e.deltaY) > 10 && !hasInteracted) {
          hasInteracted = true;
          setActionDetected(true);
        }
      };

      window.addEventListener('wheel', handleWheel);
      return () => window.removeEventListener('wheel', handleWheel);
    }

    // STEP 4: Detect planet selection
    if (currentStepData.interactiveType === 'select_planet') {
      if (selectedCelestialId) {
        setActionDetected(true);
      }
    }
  }, [stage, currentStepData, selectedCelestialId]);

  // Keyboard navigation: Enter -> Next, Escape -> Close, ArrowLeft -> Back, ArrowRight -> Next
  useEffect(() => {
    if (stage === 'closed') return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseOrSkip();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (stage === 'welcome') {
          handleStartTour();
        } else if (currentStep < 7) {
          handleNextStep();
        } else {
          handleCompleteTour();
        }
      } else if (stage === 'tour') {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNextStep();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrevStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, currentStep]);

  // Button Handlers
  const handleStartTour = () => {
    setStage('tour');
    setCurrentStep(1);
    setActionDetected(false);
  };

  const handleExploreOnMyOwn = () => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'completed');
    } catch (e) {}
    setStage('closed');
    onClose?.();
  };

  const handleMaybeLater = () => {
    try {
      sessionStorage.setItem(TUTORIAL_SESSION_KEY, 'deferred');
    } catch (e) {}
    setStage('closed');
    onClose?.();
  };

  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
      setActionDetected(false);
    } else {
      handleCompleteTour();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setActionDetected(false);
    }
  };

  const handleCompleteTour = () => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'completed');
    } catch (e) {}
    setStage('closed');
    onClose?.();
  };

  const handleCloseOrSkip = () => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'skipped');
    } catch (e) {}
    setStage('closed');
    onClose?.();
  };

  const handleTriggerActionButton = (planetId) => {
    onSelectPlanet?.(planetId);
    setActionDetected(true);
  };

  if (!isOpen || stage === 'closed') {
    return null;
  }

  // -------------------------------------------------------------
  // VIEW 1: FIRST-TIME WELCOME SCREEN MODAL
  // -------------------------------------------------------------
  if (stage === 'welcome') {
    return (
      <div 
        id="novamap-welcome-screen"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030209]/80 backdrop-blur-xl animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="novamap-welcome-title"
      >
        {/* Deep space cosmic card */}
        <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-[#0c0827]/95 via-[#060417]/95 to-[#0e1635]/95 p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(34,211,238,0.25)] backdrop-blur-2xl">
          {/* Subtle cosmic grid background */}
          <div 
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.15) 0%, transparent 70%), linear-gradient(rgba(34, 211, 238, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.08) 1px, transparent 1px)',
              backgroundSize: '100% 100%, 32px 32px, 32px 32px'
            }}
          />

          {/* Close button */}
          <button
            type="button"
            onClick={handleCloseOrSkip}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close welcome screen"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Decorative Celestial Icon Badge */}
          <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/50 bg-gradient-to-tr from-cyan-950 to-blue-900 shadow-[0_0_30px_rgba(34,211,238,0.4)]">
            <Orbit className="h-8 w-8 text-cyan-300 animate-[spin_12s_linear_infinite]" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-cyan-200" />
          </div>

          {/* Title and Subtitle */}
          <h1 
            id="novamap-welcome-title"
            className="text-2xl sm:text-3xl font-black tracking-[0.18em] text-white uppercase drop-shadow-[0_0_16px_rgba(34,211,238,0.6)] font-sans"
          >
            WELCOME TO NOVAMAP
          </h1>

          <p className="mt-2 text-sm sm:text-base font-semibold tracking-wide text-cyan-300">
            Your journey through the solar system begins here.
          </p>

          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-300 max-w-md mx-auto">
            Explore planets, discover celestial objects and learn about our solar system through an interactive 3D experience.
          </p>

          {/* Feature highlights pill row */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-cyan-200">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30">
              <Globe2 className="w-3 h-3 text-cyan-400" /> 3D Planetary Orbits
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30">
              <Compass className="w-3 h-3 text-cyan-400" /> NASA Telemetry
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30">
              <Orbit className="w-3 h-3 text-cyan-400" /> 250+ Missions
            </span>
          </div>

          {/* 3 User Choices (as specified) */}
          <div className="mt-8 flex flex-col gap-3">
            {/* 1. START GUIDED TOUR */}
            <button
              id="onboarding-start-tour-btn"
              type="button"
              onClick={handleStartTour}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(34,211,238,0.4)] border border-cyan-300/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span>1. START GUIDED TOUR</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* 2. EXPLORE ON MY OWN */}
            <button
              id="onboarding-explore-btn"
              type="button"
              onClick={handleExploreOnMyOwn}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#09061c]/90 hover:bg-[#120e33] text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer transition-all"
            >
              <span>2. EXPLORE ON MY OWN</span>
            </button>

            {/* 3. MAYBE LATER */}
            <button
              id="onboarding-maybe-later-btn"
              type="button"
              onClick={handleMaybeLater}
              className="pt-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors underline cursor-pointer"
            >
              3. Maybe Later
            </button>
          </div>

          <p className="mt-5 text-[10px] font-mono text-slate-500">
            Tip: Press Enter to begin the guided tour • Escape to exit
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: GUIDED TUTORIAL STEPS (STEPS 1 - 7)
  // -------------------------------------------------------------
  
  // Calculate tooltip coordinates on desktop
  const getDesktopTooltipStyle = () => {
    if (isMobile || !targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const margin = 20;
    const tooltipWidth = 380;
    const tooltipHeight = 280;

    // Check if target is near right or left
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const spaceRight = window.innerWidth - targetRect.right;
    const spaceLeft = targetRect.left;

    let top = 0;
    let left = 0;

    // If target is in the left sidebar area
    if (targetRect.left < 350 && targetRect.width < 500) {
      left = Math.min(window.innerWidth - tooltipWidth - margin, targetRect.right + margin);
      top = Math.max(margin, Math.min(window.innerHeight - tooltipHeight - margin, targetRect.top));
    }
    // If target is bottom dock/HUD
    else if (spaceBelow < 250 && spaceAbove > 300) {
      top = Math.max(margin, targetRect.top - tooltipHeight - margin);
      left = Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)));
    }
    // If target is right drawer
    else if (targetRect.right > window.innerWidth - 450) {
      left = Math.max(margin, targetRect.left - tooltipWidth - margin);
      top = Math.max(margin, Math.min(window.innerHeight - tooltipHeight - margin, targetRect.top + 40));
    }
    // Default fallback: floating in upper center
    else {
      top = Math.min(window.innerHeight - tooltipHeight - margin, Math.max(margin, targetRect.bottom + margin));
      left = Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)));
    }

    return {
      top: `${top}px`,
      left: `${left}px`
    };
  };

  return (
    <div 
      id="novamap-guided-tutorial-overlay"
      className="fixed inset-0 z-50 pointer-events-none select-none"
      role="dialog"
      aria-modal="true"
      aria-label="NovaMap Guided Tour"
    >
      {/* 1. Spotlight Mask Overlay */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-40">
        <defs>
          <mask id="tutorial-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(4, 3, 14, 0.72)"
          mask="url(#tutorial-spotlight-mask)"
        />
      </svg>

      {/* 2. Glowing animated boundary around target element */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-40 rounded-2xl border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.7)] transition-all duration-300 animate-pulse"
          style={{
            left: `${targetRect.left - 6}px`,
            top: `${targetRect.top - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`
          }}
        />
      )}

      {/* 3. Interactive Contextual Tooltip */}
      <div
        className={`pointer-events-auto fixed z-50 transition-all duration-300 ${
          isMobile
            ? 'bottom-0 inset-x-0 w-full rounded-t-3xl border-t border-cyan-500/50 bg-[#070517]/95 p-5 shadow-2xl backdrop-blur-2xl'
            : 'w-[390px] rounded-2xl border border-cyan-500/40 bg-[#070517]/95 p-5 shadow-[0_0_50px_rgba(34,211,238,0.3)] backdrop-blur-2xl'
        }`}
        style={isMobile ? {} : getDesktopTooltipStyle()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-300">
              <Compass className="w-3 h-3 text-cyan-400" />
              {currentStepData.badge}
            </span>
            {actionDetected && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-[10px] font-mono text-emerald-300 font-bold animate-fadeIn">
                <Check className="w-3 h-3 text-emerald-400" /> Action Detected
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCloseOrSkip}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Skip or Close Tour"
            aria-label="Close tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Segment Progress Indicator */}
        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {[1, 2, 3, 4, 5, 6, 7].map(num => (
            <div
              key={num}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                num < currentStep
                  ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                  : num === currentStep
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(34,211,238,1)]'
                    : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Title & Body */}
        <div className="space-y-1.5">
          <h2 className="text-base font-extrabold tracking-wide text-white uppercase font-sans flex items-center gap-2">
            <span>{currentStepData.title}</span>
          </h2>
          <p className="text-[11px] font-mono text-cyan-300">
            {currentStepData.subtitle}
          </p>
          <p className="text-xs text-slate-200 leading-relaxed font-sans pt-1">
            {currentStepData.description}
          </p>
          {currentStepData.detail && (
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1 border-t border-cyan-500/20 mt-2">
              {currentStepData.detail}
            </p>
          )}
        </div>

        {/* Interactive Action Button for Step 4 */}
        {currentStepData.actionButton && (
          <div className="mt-3 pt-2">
            <button
              type="button"
              id="tutorial-focus-mars-btn"
              onClick={() => handleTriggerActionButton(currentStepData.actionButton.planetId)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-950/60 cursor-pointer transition-all"
            >
              <Globe2 className="w-3.5 h-3.5 text-orange-200" />
              <span>{currentStepData.actionButton.label}</span>
            </button>
          </div>
        )}

        {/* Interactive Hint Indicator */}
        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-cyan-400/80 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/20">
          <span>{currentStepData.hint}</span>
        </div>

        {/* Bottom Control Buttons (BACK, NEXT / START EXPLORING, SKIP) */}
        <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between gap-2">
          {/* Back button */}
          {currentStep > 1 ? (
            <button
              type="button"
              id="tutorial-back-btn"
              onClick={handlePrevStep}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-cyan-500/20 text-xs font-semibold cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              id="tutorial-skip-btn"
              onClick={handleCloseOrSkip}
              className="text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Skip Tour
            </button>
          )}

          {/* Right Action: Next or Start Exploring */}
          <div className="flex items-center gap-2">
            {currentStep < 7 ? (
              <button
                type="button"
                id="tutorial-next-btn"
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-cyan-950/80 border border-cyan-400/40 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                id="tutorial-start-exploring-btn"
                onClick={handleCompleteTour}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-emerald-950/80 border border-emerald-300/60 cursor-pointer transition-all hover:scale-105 active:scale-95 animate-pulse"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>START EXPLORING</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
