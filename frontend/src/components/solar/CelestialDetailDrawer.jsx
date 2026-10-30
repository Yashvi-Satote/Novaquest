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
  Info 
} from 'lucide-react';
import { getCelestialBody } from './celestialData';

/**
 * CelestialDetailDrawer
 * NASA Eyes on the Solar System-inspired planetary & lunar inspection drawer.
 * Displays high-precision astrophysical characteristics, surface features,
 * moon selectors, and surface exploration links.
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
  else if (body.type === 'dwarf-planet') typeLabel = 'Kuiper Belt Dwarf Planet';
  else if (isMoon) typeLabel = `Natural Satellite (${body.parentPlanetName})`;

  return (
    <aside
      id="celestial-detail-drawer"
      className="absolute top-0 right-0 z-40 w-full sm:w-[420px] h-full bg-[#080517]/95 backdrop-blur-xl border-l border-cyan-500/30 flex flex-col shadow-2xl shadow-purple-950/60 font-sans transition-all duration-300 animate-in slide-in-from-right"
      aria-label="Celestial Body Inspection"
    >
      {/* Header Banner */}
      <div className="relative p-5 border-b border-cyan-500/20 bg-gradient-to-b from-cyan-950/40 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/30 text-cyan-400">
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
            className="p-1.5 rounded-lg bg-purple-950/40 border border-purple-500/20 text-slate-400 hover:text-white hover:bg-purple-900/60 transition-all cursor-pointer"
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
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e0928] border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-cyan-950/60 text-xs font-mono font-medium transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Solar System</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-200 custom-scrollbar">
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

        {/* Physical & Astrophysical Telemetry Cards */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Physical Characteristics
          </h3>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {body.realStats?.diameter && (
              <div className="p-2.5 rounded-lg bg-[#0e0a27] border border-purple-500/15">
                <span className="text-[10px] text-slate-400 block uppercase">Equatorial Diameter</span>
                <span className="text-white font-bold">{body.realStats.diameter}</span>
              </div>
            )}
            {body.realStats?.mass && (
              <div className="p-2.5 rounded-lg bg-[#0e0a27] border border-purple-500/15">
                <span className="text-[10px] text-slate-400 block uppercase">Mass</span>
                <span className="text-white font-bold">{body.realStats.mass}</span>
              </div>
            )}
            {body.realStats?.distanceFromSun && (
              <div className="p-2.5 rounded-lg bg-[#0e0a27] border border-purple-500/15">
                <span className="text-[10px] text-slate-400 block uppercase">Mean Distance from Sun</span>
                <span className="text-cyan-300 font-bold">{body.realStats.distanceFromSun}</span>
              </div>
            )}
            {body.realStats?.distance && (
              <div className="p-2.5 rounded-lg bg-[#0e0a27] border border-purple-500/15">
                <span className="text-[10px] text-slate-400 block uppercase">Distance</span>
                <span className="text-cyan-300 font-bold">{body.realStats.distance}</span>
              </div>
            )}
            {body.realStats?.orbitalPeriod && (
              <div className="p-2.5 rounded-lg bg-[#0e0a27] border border-purple-500/15">
                <span className="text-[10px] text-slate-400 block uppercase">Orbital Period</span>
                <span className="text-white font-bold">{body.realStats.orbitalPeriod}</span>
              </div>
            )}
            {body.rotationPeriod && (
              <div className="p-2.5 rounded-lg bg-[#0e0a27] border border-purple-500/15">
                <span className="text-[10px] text-slate-400 block uppercase">Rotation Period (Day)</span>
                <span className="text-white font-bold">
                  {Math.abs(body.rotationPeriod).toFixed(1)} hrs {body.rotationPeriod < 0 ? '(Retrograde)' : ''}
                </span>
              </div>
            )}
            {body.realStats?.surfaceTemp && (
              <div className="p-2.5 rounded-lg bg-[#0e0a27] border border-purple-500/15 col-span-2">
                <span className="text-[10px] text-slate-400 block uppercase">Surface Temperature</span>
                <span className="text-amber-300 font-bold">{body.realStats.surfaceTemp}</span>
              </div>
            )}
            {body.realStats?.composition && (
              <div className="p-2.5 rounded-lg bg-[#0e0a27] border border-purple-500/15 col-span-2">
                <span className="text-[10px] text-slate-400 block uppercase">Composition</span>
                <span className="text-slate-200 font-medium">{body.realStats.composition}</span>
              </div>
            )}
          </div>
        </div>

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
