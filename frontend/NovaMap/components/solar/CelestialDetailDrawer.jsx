import React from 'react';
import { 
  X, 
  Globe2, 
  Compass, 
  Layers, 
  Orbit, 
  Sparkles, 
  ArrowLeft, 
  MapPin, 
  Info,
  Wind,
  Clock,
  Ruler,
  Maximize2
} from 'lucide-react';
import { getCelestialBody } from './celestialData';
import CelestialPreview3D from './CelestialPreview3D';

/**
 * CelestialDetailDrawer
 * NASA Eyes on the Solar System-inspired planetary & lunar inspection drawer.
 * Displays interactive 3D miniature preview, equatorial diameter, distance from Sun,
 * orbital period, rotation period, atmosphere breakdown, and curated facts.
 */
export default function CelestialDetailDrawer({
  selectedId,
  onClose,
  onSelectMoon,
  onSelectParentPlanet,
  onExploreSurface,
  onResetToSystem
}) {
  if (!selectedId) return null;

  const body = getCelestialBody(selectedId);
  if (!body) return null;

  const isMoon = !!body.isMoon;
  const hasMoons = body.moons && body.moons.length > 0;
  const isSurfaceSupported = selectedId === 'mars' || selectedId === 'moon';

  // Format type label
  let typeLabel = 'Celestial Body';
  if (body.type === 'star') typeLabel = 'Yellow Dwarf Star';
  else if (body.type === 'planet') typeLabel = body.atmosphere ? (body.radius > 3.0 ? 'Gas / Ice Giant' : 'Terrestrial Planet') : 'Cratered Terrestrial Planet';
  else if (body.type === 'dwarf-planet') typeLabel = body.id === 'ceres' ? 'Main Asteroid Belt Dwarf Planet' : 'Kuiper Belt Dwarf Planet';
  else if (body.type === 'asteroid') typeLabel = 'Minor Planet / Asteroid';
  else if (body.type === 'comet') typeLabel = body.id === 'oumuamua' ? 'Hyperbolic Interstellar Object' : 'Cometary Nucleus';
  else if (isMoon) typeLabel = `Natural Satellite (${body.parentPlanetName})`;

  // Format rotation period
  let rotationText = 'Synchronous / Tidally Locked';
  if (body.rotationPeriod !== undefined) {
    const absHours = Math.abs(body.rotationPeriod);
    const isRetro = body.rotationPeriod < 0;
    if (absHours >= 24) {
      const days = (absHours / 24).toFixed(1);
      rotationText = `${days} Earth days${isRetro ? ' (Retrograde)' : ''}`;
    } else {
      rotationText = `${absHours.toFixed(1)} hours${isRetro ? ' (Retrograde)' : ''}`;
    }
  } else if (body.realStats?.orbitalPeriod && isMoon) {
    rotationText = `${body.realStats.orbitalPeriod} (Tidally Locked)`;
  }

  // Format distance
  const distanceText = body.realStats?.distanceFromSun 
    || body.realStats?.distance 
    || (body.type === 'star' ? 'Center of System (0 AU)' : 'Varying Orbit');

  return (
    <aside
      id="celestial-detail-drawer"
      className="absolute top-0 right-0 z-40 w-full sm:w-[420px] md:w-[460px] h-full bg-[#070514]/95 backdrop-blur-2xl border-l border-cyan-500/30 flex flex-col shadow-2xl shadow-cyan-950/40 font-sans transition-all duration-300 animate-in slide-in-from-right"
      aria-label="Celestial Body Inspection"
    >
      {/* Header Banner */}
      <div className="relative p-5 border-b border-cyan-500/20 bg-gradient-to-b from-cyan-950/50 via-purple-950/20 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
                <Globe2 className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-300 font-bold">
                {typeLabel}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide font-sans">
              {body.name}
            </h2>
            {isMoon && (
              <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <span>Orbiting:</span>
                <button
                  type="button"
                  onClick={() => onSelectParentPlanet && onSelectParentPlanet(body.parentPlanetId)}
                  className="text-cyan-400 hover:text-cyan-200 underline font-bold cursor-pointer"
                >
                  {body.parentPlanetName}
                </button>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-slate-400 hover:text-white hover:bg-purple-900/80 transition-all cursor-pointer"
            aria-label="Close inspection drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Back to Solar System Button */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onResetToSystem}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0c0824] border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-cyan-950/70 text-xs font-mono font-medium transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Solar System</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-200 custom-scrollbar">
        {/* Interactive 3D Miniature Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#04020f]/90 shadow-lg shadow-purple-950/30">
          <CelestialPreview3D selectedId={selectedId} className="w-full h-52 sm:h-56" />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-cyan-400/30 backdrop-blur-md text-[10px] font-mono text-cyan-300 pointer-events-none">
            <Maximize2 className="w-3 h-3 text-cyan-400" />
            <span>3D Interactive Preview</span>
          </div>
          <div className="absolute bottom-2.5 right-2.5 text-[10px] font-mono text-slate-400/80 bg-slate-950/70 px-2 py-0.5 rounded-md pointer-events-none backdrop-blur-sm">
            Drag to rotate • Wheel to zoom
          </div>
        </div>

        {/* Surface Landing Exploration Card */}
        {isSurfaceSupported && onExploreSurface && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/80 to-orange-950/80 border border-amber-400/40 shadow-lg shadow-amber-950/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                {selectedId === 'mars' ? 'Mars Surface Landing Sites' : 'Lunar Surface Landing Sites'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-400/30 text-[10px] text-amber-200 font-mono font-bold">
                Terrain Mode
              </span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed font-sans">
              {selectedId === 'mars' 
                ? 'Explore close-up terrain at Jezero Crater (Perseverance), Gale Crater (Curiosity), or Chryse Planitia (Pathfinder).'
                : 'Explore close-up terrain at Mare Tranquillitatis (Apollo 11) or Shiv Shakti Point (Chandrayaan-3).'}
            </p>
            <button
              type="button"
              onClick={() => onExploreSurface(selectedId === 'mars' ? 'perseverance-rover' : 'apollo-11-lm-descent-stage')}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs transition-all shadow-md shadow-amber-600/30 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Surface Landing Sites</span>
            </button>
          </div>
        )}

        {/* Overview Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Astronomical Overview
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {body.overview}
          </p>
        </div>

        {/* Core Astrophysical Telemetry Grid */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Astrophysical Telemetry
          </h3>

          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
            {/* Equatorial Diameter */}
            <div className="p-3 rounded-xl bg-[#0b0822] border border-cyan-500/20 hover:border-cyan-400/40 transition-colors">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase mb-1">
                <Ruler className="w-3 h-3 text-cyan-400" />
                <span>Diameter</span>
              </div>
              <span className="text-white font-bold text-sm block">
                {body.realStats?.diameter || 'N/A'}
              </span>
            </div>

            {/* Distance from Sun / Primary */}
            <div className="p-3 rounded-xl bg-[#0b0822] border border-cyan-500/20 hover:border-cyan-400/40 transition-colors">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase mb-1">
                <Orbit className="w-3 h-3 text-cyan-400" />
                <span>{isMoon ? 'Distance to Planet' : 'Distance to Sun'}</span>
              </div>
              <span className="text-cyan-300 font-bold text-sm block">
                {distanceText}
              </span>
            </div>

            {/* Orbital Period */}
            <div className="p-3 rounded-xl bg-[#0b0822] border border-cyan-500/20 hover:border-cyan-400/40 transition-colors">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase mb-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Orbital Period</span>
              </div>
              <span className="text-white font-bold text-sm block">
                {body.realStats?.orbitalPeriod || (body.orbitalPeriod === 0 ? 'Center Anchor' : `${body.orbitalPeriod} days`)}
              </span>
            </div>

            {/* Rotation Period */}
            <div className="p-3 rounded-xl bg-[#0b0822] border border-cyan-500/20 hover:border-cyan-400/40 transition-colors">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase mb-1">
                <Globe2 className="w-3 h-3 text-cyan-400" />
                <span>Rotation Period</span>
              </div>
              <span className="text-white font-bold text-sm block">
                {rotationText}
              </span>
            </div>
          </div>
        </div>

        {/* Atmosphere Section */}
        <div className="space-y-2 p-3.5 rounded-xl bg-[#0c0825] border border-cyan-500/25">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              Atmospheric Composition
            </h3>
            {body.atmosphereDesc && !body.atmosphereDesc.includes('None') && !body.atmosphereDesc.includes('Airless') ? (
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/30 text-[10px] font-mono text-cyan-300">
                Active Atmosphere
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400">
                Vacuum / Exosphere
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {body.atmosphereDesc || (body.atmosphere ? 'Atmospheric envelope present.' : 'No substantial atmosphere detected (near-vacuum surface boundary exosphere).')}
          </p>
        </div>

        {/* Curated Interesting Facts */}
        {body.interestingFacts && body.interestingFacts.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Interesting Scientific Facts
            </h3>
            <div className="space-y-2">
              {body.interestingFacts.map((fact, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0e092b]/80 border border-purple-500/20 text-xs text-slate-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-sm shadow-cyan-400" />
                  <span className="leading-relaxed font-sans">{fact}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Moons Explorer Strip (When body has moons) */}
        {hasMoons && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
                <Orbit className="w-3.5 h-3.5" />
                Moons of {body.name} ({body.moons.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {body.moons.map(moon => (
                <button
                  key={moon.id}
                  type="button"
                  onClick={() => onSelectMoon && onSelectMoon(moon.id)}
                  className="p-2.5 rounded-xl bg-[#0f0b29] border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-cyan-300 font-sans">
                    <span>{moon.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {moon.realStats?.diameter || ''}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
                    {moon.overview}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notable Missions Exploring this Body */}
        {body.placeholderMissions && body.placeholderMissions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Key Missions & Hardware
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {body.placeholderMissions.map(mSlug => (
                <span
                  key={mSlug}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-400/25 text-cyan-200 text-xs font-mono"
                >
                  {mSlug.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
