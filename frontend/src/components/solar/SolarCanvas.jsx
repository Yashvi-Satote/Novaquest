import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { SolarEngine } from './SolarEngine';

/**
 * SolarCanvas
 * React 19 container component integrating vanilla Three.js SolarEngine.
 * Implements strict lifecycle cleanup and responsive resize handling.
 */
const SolarCanvas = forwardRef(function SolarCanvas({
  isPlaying = true,
  speed = 1.0,
  onSelectPlanet,
  onSelectSpacecraft,
  onHoverItem
}, ref) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);

  // Expose imperative engine methods to parent (e.g. camera fly-to, scale, reset)
  useImperativeHandle(ref, () => ({
    focusPlanet: (planetId) => {
      if (engineRef.current) {
        engineRef.current.focusPlanet(planetId);
      }
    },
    focusSpacecraft: (slug) => {
      if (engineRef.current) {
        engineRef.current.focusSpacecraft(slug);
      }
    },
    focusScale: (scaleKey) => {
      if (engineRef.current) {
        engineRef.current.focusScale(scaleKey);
      }
    },
    resetView: () => {
      if (engineRef.current) {
        engineRef.current.resetView();
      }
    }
  }), []);

  const onSelectPlanetRef = useRef(onSelectPlanet);
  const onSelectCraftRef = useRef(onSelectSpacecraft);
  const onHoverRef = useRef(onHoverItem);

  useEffect(() => {
    onSelectPlanetRef.current = onSelectPlanet;
  }, [onSelectPlanet]);

  useEffect(() => {
    onSelectCraftRef.current = onSelectSpacecraft;
  }, [onSelectSpacecraft]);

  useEffect(() => {
    onHoverRef.current = onHoverItem;
  }, [onHoverItem]);

  // Update simulation controls when React props change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPlayPause(isPlaying);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSpeed(speed);
    }
  }, [speed]);

  // Main lifecycle effect (with React Strict Mode protection)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }

    const engine = new SolarEngine(container, {
      onSelectPlanet: (id) => onSelectPlanetRef.current && onSelectPlanetRef.current(id),
      onSelectSpacecraft: (slug) => onSelectCraftRef.current && onSelectCraftRef.current(slug),
      onHoverItem: (info) => onHoverRef.current && onHoverRef.current(info)
    });
    engineRef.current = engine;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          engine.resize(width, height);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-[500px] overflow-hidden select-none bg-[#02040a]"
      style={{ touchAction: 'none' }}
    />
  );
});

export default SolarCanvas;
