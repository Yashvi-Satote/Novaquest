import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Compass, 
  Globe2, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  X, 
  Radio, 
  CheckCircle2, 
  AlertCircle,
  Sun,
  Orbit,
  CircleDot,
  Rocket,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { fetchHardware } from '../../../Shared/services/api';
import { 
  classifyCatalogueRecord, 
  isSpacecraftMapped, 
  getCatalogueMappingStats 
} from './spacecraftRegistry';
import { 
  filterEligibleCatalogue, 
  isSpacecraft3DLoaded, 
  getEligibleSpacecraftRecord,
  getAllEligibleSpacecraft
} from './spacecraftModelService';
import { getSpacecraftCategoryIcon, getCategoryBadgeStyle } from './spacecraftIcons';
import { CELESTIAL_BODIES } from './celestialData';

/**
 * MissionExplorerSidebar
 * NASA Eyes-inspired unified Left Sidebar containing:
 * 1. Universal Search (Planets, Moons, Spacecraft)
 * 2. Solar System (System overview, scale presets, asteroid belt)
 * 3. Planets (The Sun, 8 major planets, Ceres & Pluto)
 * 4. Moons (All prominent natural satellites grouped by parent planet)
 * 5. Spacecraft (250+ mission hardware catalogue with 3D plotted telemetry)
 */
export default function MissionExplorerSidebar({
  selectedMissionSlug,
  selectedCelestialId,
  onSelectMission,
  onSelectPlanet,
  onSelectMoon,
  onSelectScale,
  onResetView,
  isOpen,
  onToggleOpen
}) {
  const [activeTab, setActiveTab] = useState('planets'); // 'system' | 'planets' | 'moons' | 'smallbodies' | 'spacecraft'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Spacecraft catalogue state
  const [items, setItems] = useState([]);
  const [mappingFilter, setMappingFilter] = useState('all'); // 'all' | 'mapped' | 'unmapped'
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedAgency, setSelectedAgency] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial load of catalogue items from the real Flask API
  useEffect(() => {
    let isMounted = true;

    async function loadCatalogue() {
      setIsLoading(true);
      setError(null);
      try {
        const firstRes = await fetchHardware({ limit: 50, page: 1 });
        const allItems = [...(firstRes.items || [])];

        const totalPages = firstRes.total_pages || 1;
        if (totalPages > 1) {
          const pagePromises = [];
          for (let p = 2; p <= totalPages; p++) {
            pagePromises.push(fetchHardware({ limit: 50, page: p }));
          }
          const restResults = await Promise.all(pagePromises);
          restResults.forEach(r => {
            if (r.items) allItems.push(...r.items);
          });
        }

        // STRICT 3D INTEGRITY: Filter out any mission without an actual 3D model
        const eligibleItems = filterEligibleCatalogue(allItems);
        if (isMounted) {
          if (eligibleItems.length > 0) {
            setItems(eligibleItems);
          } else {
            setItems(getAllEligibleSpacecraft());
          }
        }
      } catch (err) {
        console.warn('Mission catalogue API unavailable, using verified local 3D models:', err);
        if (isMounted) {
          setItems(getAllEligibleSpacecraft());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadCatalogue();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute dynamic stats from loaded catalogue
  const mappingStats = useMemo(() => {
    return getCatalogueMappingStats(items);
  }, [items]);

  // Major celestial bodies (Sun + 8 major planets)
  const majorPlanets = useMemo(() => {
    return CELESTIAL_BODIES.filter(b => b.type === 'star' || b.type === 'planet');
  }, []);

  // Minor celestial bodies (Dwarf planets, Asteroids, Comets)
  const smallBodies = useMemo(() => {
    return CELESTIAL_BODIES.filter(b => 
      b.type === 'dwarf-planet' || b.type === 'dwarf' || b.type === 'asteroid' || b.type === 'comet'
    );
  }, []);

  // Extract all moons with parent planet info
  const allMoons = useMemo(() => {
    const moonsList = [];
    CELESTIAL_BODIES.forEach(b => {
      if (b.moons) {
        b.moons.forEach(m => {
          moonsList.push({
            ...m,
            parentPlanetId: b.id,
            parentPlanetName: b.name
          });
        });
      }
    });
    return moonsList;
  }, []);

  // Universal Search across Planets, Small Bodies, Moons, and Spacecraft
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedPlanets = majorPlanets.filter(b => 
      b.name.toLowerCase().includes(q) || b.type.toLowerCase().includes(q) || (b.overview && b.overview.toLowerCase().includes(q))
    );

    const matchedSmallBodies = smallBodies.filter(b => 
      b.name.toLowerCase().includes(q) || b.type.toLowerCase().includes(q) || (b.overview && b.overview.toLowerCase().includes(q))
    );

    const matchedMoons = allMoons.filter(m => 
      m.name.toLowerCase().includes(q) || m.parentPlanetName.toLowerCase().includes(q) || (m.overview && m.overview.toLowerCase().includes(q))
    );

    const matchedCraft = items.filter(item => 
      isSpacecraft3DLoaded(item.slug) && (
        item.name?.toLowerCase().includes(q) ||
        item.mission_name?.toLowerCase().includes(q) ||
        item.destination?.toLowerCase().includes(q) ||
        item.primary_organization?.toLowerCase().includes(q)
      )
    );

    return {
      planets: matchedPlanets,
      smallBodies: matchedSmallBodies,
      moons: matchedMoons,
      spacecraft: matchedCraft,
      total: matchedPlanets.length + matchedSmallBodies.length + matchedMoons.length + matchedCraft.length
    };
  }, [searchQuery, majorPlanets, smallBodies, allMoons, items]);

  // Filtered spacecraft list (strictly verified 3D models)
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (!isSpacecraft3DLoaded(item.slug)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesMission = item.mission_name?.toLowerCase().includes(q);
        const matchesDest = item.destination?.toLowerCase().includes(q);
        const matchesOrg = item.primary_organization?.toLowerCase().includes(q);
        if (!matchesName && !matchesMission && !matchesDest && !matchesOrg) {
          return false;
        }
      }

      if (activeCategory !== 'All') {
        const cat = activeCategory.toLowerCase();
        const itemDest = (item.destination_category || item.destination || '').toLowerCase();
        if (cat === 'inner planets') {
          if (!itemDest.includes('mercury') && !itemDest.includes('venus') && !itemDest.includes('sun')) return false;
        } else if (cat === 'asteroids') {
          if (!itemDest.includes('asteroid') && !itemDest.includes('ceres') && !itemDest.includes('vesta') && !itemDest.includes('comet') && !itemDest.includes('bennu') && !itemDest.includes('ryugu') && !itemDest.includes('dimorphos')) return false;
        } else if (!itemDest.includes(cat)) {
          return false;
        }
      }

      if (selectedStatus !== 'All' && item.operational_status !== selectedStatus) {
        return false;
      }
      if (selectedAgency !== 'All' && item.primary_organization !== selectedAgency) {
        return false;
      }
      if (selectedType !== 'All' && item.object_type !== selectedType) {
        return false;
      }
      return true;
    });
  }, [items, searchQuery, activeCategory, selectedStatus, selectedAgency, selectedType]);

  const categories = ['All', 'Mars', 'Jupiter', 'Saturn', 'Deep Space', 'Moon', 'Inner Planets', 'Asteroids'];

  return (
    <>
      {/* Toggle button when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggleOpen}
          className="absolute top-20 left-4 z-30 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#09071a]/95 hover:bg-[#120d2c] text-white border border-cyan-500/30 shadow-2xl shadow-purple-950/60 backdrop-blur-md cursor-pointer transition-all hover:scale-105"
          title="Open Solar System Explorer Sidebar"
        >
          <Orbit className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold tracking-wide">Solar System</span>
          <ChevronRight className="w-4 h-4 text-cyan-300" />
        </button>
      )}

      {/* Main Sidebar Drawer */}
      <aside
        className={`absolute top-16 left-0 bottom-0 z-30 w-76 sm:w-84 md:w-96 bg-[#080518]/95 backdrop-blur-2xl border-r border-cyan-500/20 shadow-2xl shadow-purple-950/80 flex flex-col transition-transform duration-300 ease-in-out font-sans ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Solar System Explorer Sidebar"
      >
        {/* Header Banner */}
        <div className="p-3.5 border-b border-cyan-500/20 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-md shadow-cyan-900/40 shrink-0">
              <Orbit className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Solar System Explorer</span>
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/30 text-[9px] text-cyan-300 font-mono">
                  NASA Eyes
                </span>
              </h2>
              <p className="text-[10px] text-purple-200/70 font-mono truncate">
                Interactive Multi-Scale Simulation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-950/60 border border-transparent hover:border-purple-500/30 transition-colors cursor-pointer shrink-0"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Universal Search Bar */}
        <div className="p-3 border-b border-cyan-500/15">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              id="solar-universal-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search planets, moons, spacecraft..."
              className="w-full bg-[#0d0922]/90 border border-cyan-500/25 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Solar System, Planets, Moons, Small Bodies, Spacecraft) */}
        {!searchQuery && (
          <div className="p-2 border-b border-cyan-500/15 grid grid-cols-5 gap-1 bg-[#09061c]/80 text-[10px] font-medium">
            {/* Tab 1: Solar System */}
            <button
              type="button"
              id="sidebar-tab-system"
              onClick={() => setActiveTab('system')}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'system'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>System</span>
            </button>

            {/* Tab 2: Planets */}
            <button
              type="button"
              id="sidebar-tab-planets"
              onClick={() => setActiveTab('planets')}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'planets'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Planets</span>
            </button>

            {/* Tab 3: Moons */}
            <button
              type="button"
              id="sidebar-tab-moons"
              onClick={() => setActiveTab('moons')}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'moons'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>Moons</span>
            </button>

            {/* Tab 4: Small Bodies (Asteroids & Comets) */}
            <button
              type="button"
              id="sidebar-tab-smallbodies"
              onClick={() => setActiveTab('smallbodies')}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'smallbodies'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>Asteroids</span>
            </button>

            {/* Tab 5: Spacecraft */}
            <button
              type="button"
              id="sidebar-tab-spacecraft"
              onClick={() => setActiveTab('spacecraft')}
              className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'spacecraft'
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Missions ({items.length})</span>
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">

          {/* =========================================================================
              SEARCH RESULTS MODE (Triggered when search query is entered)
              ========================================================================= */}
          {searchQuery && searchResults && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 pb-1 border-b border-cyan-500/20">
                <span>Search Results:</span>
                <span className="font-bold">{searchResults.total} matches</span>
              </div>

              {searchResults.total === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No astronomical bodies or spacecraft match "{searchQuery}".
                </div>
              )}

              {/* Matched Planets */}
              {searchResults.planets.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block px-1">
                    Planets & Stars ({searchResults.planets.length})
                  </span>
                  {searchResults.planets.map(planet => (
                    <div
                      key={planet.id}
                      onClick={() => onSelectPlanet && onSelectPlanet(planet.id)}
                      className="p-2.5 rounded-xl bg-[#0c0824] border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/40 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: planet.color }} />
                        <div>
                          <span className="text-xs font-bold text-white block">{planet.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {planet.realStats?.distanceFromSun || 'Center of System'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/30 text-[9px] font-mono text-cyan-300">
                        {planet.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Matched Small Bodies (Asteroids & Comets) */}
              {searchResults.smallBodies && searchResults.smallBodies.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block px-1">
                    Asteroids & Comets ({searchResults.smallBodies.length})
                  </span>
                  {searchResults.smallBodies.map(body => (
                    <div
                      key={body.id}
                      onClick={() => onSelectPlanet && onSelectPlanet(body.id)}
                      className="p-2.5 rounded-xl bg-[#0c0824] border border-amber-500/20 hover:border-amber-400 hover:bg-amber-950/40 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: body.color || '#f59e0b' }} />
                        <div>
                          <span className="text-xs font-bold text-white block">{body.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {body.realStats?.diameter || body.realStats?.distanceFromSun || 'Minor Celestial Body'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-400/30 text-[9px] font-mono text-amber-300 capitalize">
                        {body.type.replace('-', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Matched Moons */}
              {searchResults.moons.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block px-1">
                    Natural Satellites ({searchResults.moons.length})
                  </span>
                  {searchResults.moons.map(moon => (
                    <div
                      key={moon.id}
                      onClick={() => onSelectPlanet && onSelectPlanet(moon.id)}
                      className="p-2.5 rounded-xl bg-[#0c0824] border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/40 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: moon.color || '#94a3b8' }} />
                        <div>
                          <span className="text-xs font-bold text-white block">{moon.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Orbiting {moon.parentPlanetName}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/30 text-[9px] font-mono text-purple-200">
                        Moon
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Matched Spacecraft */}
              {searchResults.spacecraft.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block px-1">
                    Spacecraft Missions ({searchResults.spacecraft.length})
                  </span>
                  {searchResults.spacecraft.slice(0, 30).map(item => (
                    <div
                      key={item.id || item.slug}
                      onClick={() => onSelectMission && onSelectMission(item)}
                      className="p-2.5 rounded-xl bg-[#0c0824] border border-purple-500/20 hover:border-cyan-400 hover:bg-purple-950/40 transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="text-xs font-bold text-white block">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.destination} • {item.primary_organization || 'Mission'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[9px] font-mono text-slate-300">
                        {item.object_type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 1: SOLAR SYSTEM OVERVIEW & SCALE PRESETS
              ========================================================================= */}
          {!searchQuery && activeTab === 'system' && (
            <div className="space-y-3 font-sans">
              {/* System Architecture Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/50 to-purple-950/40 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    Solar System Architecture
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Gravitationally bound system of the Sun and the objects that orbit it, formed 4.6 billion years ago from the gravitational collapse of a giant interstellar molecular cloud.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                  <div className="p-2 rounded-lg bg-[#070414] border border-cyan-500/20">
                    <span className="text-slate-400 block">Mass Distribution</span>
                    <span className="text-cyan-300 font-bold">99.86% Sun</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#070414] border border-cyan-500/20">
                    <span className="text-slate-400 block">Major Planets</span>
                    <span className="text-cyan-300 font-bold">8 Terrestrial & Giants</span>
                  </div>
                </div>
              </div>

              {/* View Scale Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block px-1">
                  Scale Perspectives (NASA Eyes)
                </span>
                
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectScale) onSelectScale('SOLAR_SYSTEM');
                    if (onResetView) onResetView();
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#0b0822] border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">Full Solar System Overview</span>
                    <span className="text-[10px] text-slate-400 font-mono">Sun through Pluto and Kuiper Belt</span>
                  </div>
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectScale && onSelectScale('INNER_SYSTEM')}
                  className="w-full p-2.5 rounded-xl bg-[#0b0822] border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">Inner Terrestrial Realm</span>
                    <span className="text-[10px] text-slate-400 font-mono">Sun, Mercury, Venus, Earth, Mars</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300">0 – 1.5 AU</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectPlanet) onSelectPlanet('ceres');
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#0b0822] border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">Main Asteroid Belt</span>
                    <span className="text-[10px] text-slate-400 font-mono">Ceres & 3,200+ plottable minor bodies</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300">2.1 – 3.3 AU</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectScale && onSelectScale('OUTER_SYSTEM')}
                  className="w-full p-2.5 rounded-xl bg-[#0b0822] border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">Outer Gas & Ice Giants</span>
                    <span className="text-[10px] text-slate-400 font-mono">Jupiter, Saturn, Uranus, Neptune</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300">5 – 30 AU</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectScale && onSelectScale('HELIOSPHERE')}
                  className="w-full p-2.5 rounded-xl bg-[#0b0822] border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/40 text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">Heliosphere Frontier</span>
                    <span className="text-[10px] text-slate-400 font-mono">Voyager 1 & 2 Interstellar Medium</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300">120+ AU</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: PLANETS LIST
              ========================================================================= */}
          {!searchQuery && activeTab === 'planets' && (
            <div className="space-y-1.5 font-sans">
              <div className="flex items-center justify-between px-1 pb-1 text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                <span>Major Worlds ({majorPlanets.length})</span>
                <span>Distance from Sun</span>
              </div>

              {majorPlanets.map(planet => {
                const isSelected = selectedCelestialId === planet.id;
                const hasMoons = planet.moons && planet.moons.length > 0;

                return (
                  <div
                    key={planet.id}
                    id={`planet-sidebar-item-${planet.id}`}
                    onClick={() => onSelectPlanet && onSelectPlanet(planet.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950 to-purple-950 border-cyan-400 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-400/40 border-l-4 border-l-cyan-400'
                        : 'bg-[#0a071f]/80 hover:bg-[#120d2e] border-cyan-500/20 hover:border-cyan-400/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: planet.color, boxShadow: `0 0 8px ${planet.color}88` }} 
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{planet.name}</span>
                          {planet.hasRings && (
                            <span className="text-[9px] font-mono text-amber-300 bg-amber-950/80 px-1 py-0.2 rounded border border-amber-400/30">
                              Rings
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">
                          {planet.realStats?.diameter || 'Star'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-cyan-300 font-semibold block">
                        {planet.realStats?.distanceFromSun ? planet.realStats.distanceFromSun.split('(')[1]?.replace(')', '') || planet.realStats.distanceFromSun : '0 AU'}
                      </span>
                      {hasMoons ? (
                        <span className="text-[9px] font-mono text-purple-300">
                          {planet.moons.length} {planet.moons.length === 1 ? 'Moon' : 'Moons'}
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-500">
                          {planet.type === 'star' ? 'Anchor' : '0 Moons'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =========================================================================
              TAB 3: MOONS LIST (Grouped by Parent Planet)
              ========================================================================= */}
          {!searchQuery && activeTab === 'moons' && (
            <div className="space-y-3 font-sans">
              <div className="px-1 text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                Natural Satellites ({allMoons.length} Plotted)
              </div>

              {/* Group moons by parent planet */}
              {CELESTIAL_BODIES.filter(b => b.moons && b.moons.length > 0).map(planet => (
                <div key={planet.id} className="space-y-1.5">
                  <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: planet.color }} />
                      Moons of {planet.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{planet.moons.length}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {planet.moons.map(moon => {
                      const isSelected = selectedCelestialId === moon.id;
                      return (
                        <div
                          key={moon.id}
                          id={`moon-sidebar-item-${moon.id}`}
                          onClick={() => {
                            if (onSelectMoon) onSelectMoon(moon.id);
                            else if (onSelectPlanet) onSelectPlanet(moon.id);
                          }}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-cyan-950 to-purple-950 border-cyan-400 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-400/40 border-l-4 border-l-cyan-400'
                              : 'bg-[#0a071f]/80 hover:bg-[#120d2e] border-cyan-500/20 hover:border-cyan-400/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: moon.color || '#94a3b8' }} 
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block truncate">{moon.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono truncate block">
                                {moon.realStats?.diameter || ''}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono text-cyan-300 block">
                              {moon.realStats?.orbitalPeriod || `${moon.orbitalPeriod} d`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =========================================================================
              TAB 4: SMALL BODIES (Asteroids, Comets & Dwarf Planets)
              ========================================================================= */}
          {!searchQuery && activeTab === 'smallbodies' && (
            <div className="space-y-1.5 font-sans">
              <div className="flex items-center justify-between px-1 pb-1 text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                <span>Asteroids & Comets ({smallBodies.length})</span>
                <span>Orbit Type / Distance</span>
              </div>

              {smallBodies.map(body => {
                const isSelected = selectedCelestialId === body.id;
                const isComet = body.type === 'comet';
                const isDwarf = body.type === 'dwarf-planet' || body.type === 'dwarf';

                return (
                  <div
                    key={body.id}
                    id={`smallbody-sidebar-item-${body.id}`}
                    onClick={() => onSelectPlanet && onSelectPlanet(body.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-950 to-purple-950 border-amber-400 shadow-md shadow-amber-950/50 ring-1 ring-amber-400/40 border-l-4 border-l-amber-400'
                        : 'bg-[#0a071f]/80 hover:bg-[#120d2e] border-amber-500/20 hover:border-amber-400/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: body.color, boxShadow: `0 0 8px ${body.color}88` }} 
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{body.name}</span>
                          <span className={`text-[9px] font-mono px-1 py-0.2 rounded border ${
                            isComet 
                              ? 'text-emerald-300 bg-emerald-950/80 border-emerald-400/30' 
                              : isDwarf 
                                ? 'text-cyan-300 bg-cyan-950/80 border-cyan-400/30'
                                : 'text-amber-300 bg-amber-950/80 border-amber-400/30'
                          }`}>
                            {isComet ? 'Comet' : isDwarf ? 'Dwarf' : 'Asteroid'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">
                          {body.realStats?.diameter || 'Minor Body'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-amber-300 font-semibold block">
                        {body.realStats?.distanceFromSun ? body.realStats.distanceFromSun.split('(')[1]?.replace(')', '') || body.realStats.distanceFromSun : 'Heliocentric'}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {body.realStats?.orbitalPeriod || `${body.orbitalPeriod} d`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =========================================================================
              TAB 5: SPACECRAFT CATALOGUE
              ========================================================================= */}
          {!searchQuery && activeTab === 'spacecraft' && (
            <div className="space-y-2">
              {/* Verified 3D Hardware Banner */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-gradient-to-r from-cyan-950/70 to-purple-950/60 rounded-xl border border-cyan-500/30 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Verified 3D Models Only</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-cyan-900/60 border border-cyan-400/40 text-cyan-200 font-bold">
                  {filteredItems.length} Available
                </span>
              </div>

              {/* Destination Category Filter Pills */}
              <div className="py-1 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 min-w-max">
                  {categories.map(cat => {
                    const active = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        id={`cat-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                          active
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-purple-950/50'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Filter Dropdowns */}
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[#0d0922] border border-cyan-500/20 rounded-lg p-1 text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="All">Status: All</option>
                  <option value="Active / operational">Active</option>
                  <option value="Inactive / decommissioned">Inactive</option>
                  <option value="Unknown / disputed">Disputed</option>
                </select>
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="bg-[#0d0922] border border-cyan-500/20 rounded-lg p-1 text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="All">Agency: All</option>
                  <option value="NASA">NASA</option>
                  <option value="European Space Agency (ESA)">ESA</option>
                  <option value="China National Space Administration (CNSA)">CNSA</option>
                  <option value="Indian Space Research Organisation (ISRO)">ISRO</option>
                  <option value="Japan Aerospace Exploration Agency (JAXA)">JAXA</option>
                  <option value="Roscosmos">Roscosmos</option>
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-[#0d0922] border border-cyan-500/20 rounded-lg p-1 text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="All">Type: All</option>
                  <option value="Flyby Probe">Flyby</option>
                  <option value="Rover">Rover</option>
                  <option value="Lander">Lander</option>
                  <option value="Orbiter">Orbiter</option>
                  <option value="Space Telescope">Telescope</option>
                  <option value="Space Station">Station</option>
                  <option value="Satellite">Satellite</option>
                  <option value="Spacecraft">Craft</option>
                </select>
              </div>

              {/* Spacecraft Item Cards */}
              <div className="space-y-1.5 pt-1">
                {isLoading && (
                  <div className="text-center py-8 space-y-2">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[11px] text-cyan-300 font-mono">Loading mission fleet...</p>
                  </div>
                )}

                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs text-center">
                    {error}
                  </div>
                )}

                {!isLoading && filteredItems.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No spacecraft match active filters.
                  </div>
                )}

                {filteredItems.map(item => {
                  const isSelected = selectedMissionSlug === item.slug;
                  const classification = classifyCatalogueRecord(item);
                  const isMapped = classification.isMapped;
                  const badgeStyle = getCategoryBadgeStyle(item.object_type);

                  return (
                    <div
                      key={item.id || item.slug}
                      id={`mission-card-${item.slug}`}
                      onClick={() => onSelectMission && onSelectMission(item)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border-cyan-400 shadow-lg shadow-purple-950/50 ring-1 ring-cyan-400/40 border-l-4 border-l-cyan-400'
                          : isMapped
                            ? 'bg-[#0a071f]/80 hover:bg-[#120d2e] border-cyan-500/20 hover:border-cyan-400/40'
                            : 'bg-[#09061c]/50 hover:bg-[#100b28] border-white/5 hover:border-purple-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${badgeStyle.badgeClass}`}>
                              {getSpacecraftCategoryIcon(item.object_type, 'w-3 h-3')}
                            </div>
                            <h3 className="text-xs font-bold text-white tracking-tight truncate">
                              {item.name}
                            </h3>
                            {isMapped && (
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" title="Plotted in 3D" />
                            )}
                          </div>

                          <p className="text-[10px] text-purple-300/70 font-sans mt-0.5 truncate pl-6.5">
                            Mission: <span className="text-slate-200 font-medium">{item.mission_name || 'Autonomous'}</span>
                          </p>
                        </div>

                        <span
                          className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                            item.operational_status?.includes('Active')
                              ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse'
                              : 'bg-amber-400/80'
                          }`}
                          title={item.operational_status || 'Status Unknown'}
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-1 mt-2 pl-6.5">
                        <span className="px-1.5 py-0.5 rounded bg-purple-950/50 border border-purple-500/15 text-[9px] text-purple-200 font-mono">
                          {item.destination}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-slate-300 font-sans">
                          {item.object_type}
                        </span>
                        {item.primary_organization && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/20 text-[9px] text-cyan-300 font-sans truncate max-w-[110px]">
                            {item.primary_organization}
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[10px] pl-6.5 font-sans">
                          <Link
                            to={`/spacecraft/${item.slug}`}
                            className="text-cyan-300 hover:text-white font-bold flex items-center gap-1 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Explore 3D Spacecraft Page →</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-cyan-500/20 bg-[#070515]/95 text-[10px] text-slate-400 font-sans flex items-center justify-between">
          <span>Novaquest Solar System</span>
          <span className="font-mono text-cyan-400">{mappingStats.mapped} 3D Mapped / {items.length} Fleet</span>
        </div>
      </aside>
    </>
  );
}
