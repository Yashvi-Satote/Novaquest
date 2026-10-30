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
  simulationDate,
  lightingMode = 'natural',
  cameraMode = 'orbit',
  layerVisibility = { orbits: true, trajectories: true, markers: true },
  onSelectPlanet,
  onSelectSpacecraft,
  onHoverItem,
  onModeChange,
  onDateChange
}, ref) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);

  // Expose imperative engine methods to parent
  useImperativeHandle(ref, () => ({
    focusPlanet: (planetId) => {
      if (engineRef.current) {
        engineRef.current.focusPlanet(planetId);
      }
    },
    focusMoon: (moonId) => {
      if (engineRef.current) {
        engineRef.current.focusMoon(moonId);
      }
    },
    focusCelestialBody: (id) => {
      if (!engineRef.current) return;
      if (engineRef.current.planetBodies.has(id)) {
        engineRef.current.focusPlanet(id);
      } else {
        engineRef.current.focusMoon(id);
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
    enterVoyagerLocalMode: () => {
      if (engineRef.current) {
        engineRef.current.enterVoyagerLocalMode();
      }
    },
    exitVoyagerLocalMode: () => {
      if (engineRef.current) {
        engineRef.current.exitVoyagerLocalMode();
      }
    },
    enterSurfaceMode: (slug) => {
      if (engineRef.current) {
        engineRef.current.enterSurfaceMode(slug);
      }
    },
    exitSurfaceMode: () => {
      if (engineRef.current) {
        engineRef.current.exitSurfaceMode();
      }
    },
    resetView: () => {
      if (engineRef.current) {
        engineRef.current.resetView();
      }
    },
    setSimulationDate: (date) => {
      if (engineRef.current) {
        engineRef.current.setSimulationDate(date);
      }
    },
    setLightingMode: (mode) => {
      if (engineRef.current) {
        engineRef.current.setLightingMode(mode);
      }
    },
    setCameraMode: (mode) => {
      if (engineRef.current) {
        engineRef.current.setCameraMode(mode);
      }
    },
    setLayerVisibility: (layer, visible) => {
      if (engineRef.current) {
        engineRef.current.setLayerVisibility(layer, visible);
      }
    }
  }), []);

  const onSelectPlanetRef = useRef(onSelectPlanet);
  const onSelectCraftRef = useRef(onSelectSpacecraft);
  const onHoverRef = useRef(onHoverItem);
  const onModeChangeRef = useRef(onModeChange);
  const onDateChangeRef = useRef(onDateChange);

  useEffect(() => { onModeChangeRef.current = onModeChange; }, [onModeChange]);
  useEffect(() => { onSelectPlanetRef.current = onSelectPlanet; }, [onSelectPlanet]);
  useEffect(() => { onSelectCraftRef.current = onSelectSpacecraft; }, [onSelectSpacecraft]);
  useEffect(() => { onHoverRef.current = onHoverItem; }, [onHoverItem]);
  useEffect(() => { onDateChangeRef.current = onDateChange; }, [onDateChange]);

  // Prop synchronizations
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

  useEffect(() => {
    if (engineRef.current && simulationDate) {
      const currentEngTime = engineRef.current.simulationDate?.getTime() || 0;
      const targetTime = simulationDate.getTime();
      if (Math.abs(currentEngTime - targetTime) > 3000) {
        engineRef.current.setSimulationDate(simulationDate);
      }
    }
  }, [simulationDate]);

  useEffect(() => {
    if (engineRef.current && lightingMode) {
      engineRef.current.setLightingMode(lightingMode);
    }
  }, [lightingMode]);

  useEffect(() => {
    if (engineRef.current && cameraMode) {
      engineRef.current.setCameraMode(cameraMode);
    }
  }, [cameraMode]);

  const prevLayerRef = useRef(layerVisibility);
  useEffect(() => {
    if (!engineRef.current || !layerVisibility) return;
    if (layerVisibility.orbits !== prevLayerRef.current?.orbits) {
      engineRef.current.setLayerVisibility('orbits', layerVisibility.orbits);
    }
    if (layerVisibility.trajectories !== prevLayerRef.current?.trajectories) {
      engineRef.current.setLayerVisibility('trajectories', layerVisibility.trajectories);
    }
    if (layerVisibility.markers !== prevLayerRef.current?.markers) {
      engineRef.current.setLayerVisibility('markers', layerVisibility.markers);
    }
    prevLayerRef.current = layerVisibility;
  }, [layerVisibility]);

  // Main lifecycle effect
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
      onHoverItem: (info) => onHoverRef.current && onHoverRef.current(info),
      onModeChange: (data) => onModeChangeRef.current && onModeChangeRef.current(data),
      onDateChange: (date) => onDateChangeRef.current && onDateChangeRef.current(date)
    });
    engineRef.current = engine;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && !engine.isDisposed) {
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
      className="w-full h-full relative cursor-grab active:cursor-grabbing outline-none"
      style={{ touchAction: 'none' }}
    />
  );
});

export default SolarCanvas;
