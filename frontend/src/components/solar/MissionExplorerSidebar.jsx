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
  AlertCircle
} from 'lucide-react';
import { fetchHardware } from '../../services/api';
import { 
  classifyCatalogueRecord, 
  isSpacecraftMapped, 
  getCatalogueMappingStats 
} from './spacecraftRegistry';
import { getSpacecraftCategoryIcon, getCategoryBadgeStyle } from './spacecraftIcons';

export default function MissionExplorerSidebar({
  selectedMissionSlug,
  onSelectMission,
  onSelectPlanet,
  isOpen,
  onToggleOpen
}) {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mappingFilter, setMappingFilter] = useState('all'); // 'all' | 'mapped' | 'unmapped'
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedAgency, setSelectedAgency] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial load of catalogue items from the real Flask API (fetches all pages)
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

        if (isMounted) {
          setItems(allItems);
        }
      } catch (err) {
        console.error('Failed to load mission catalogue from API:', err);
        if (isMounted) {
          setError('Cannot connect to mission database API.');
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

  // Compute dynamic stats from actual loaded catalogue
  const mappingStats = useMemo(() => {
    return getCatalogueMappingStats(items);
  }, [items]);

  // Filtered catalogue list
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Mapping Status Filter (Objectives 3 & 4)
      const mapped = isSpacecraftMapped(item.slug);
      if (mappingFilter === 'mapped' && !mapped) return false;
      if (mappingFilter === 'unmapped' && mapped) return false;

      // 2. Search query across name, mission, destination, agency
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

      // 3. Destination Category
      if (activeCategory !== 'All') {
        const cat = activeCategory.toLowerCase();
        const itemDest = (item.destination_category || item.destination || '').toLowerCase();
        if (cat === 'inner planets') {
          if (!['mercury', 'venus'].includes(itemDest)) return false;
        } else if (!itemDest.includes(cat)) {
          return false;
        }
      }

      // 4. Operational Status
      if (selectedStatus !== 'All' && item.operational_status !== selectedStatus) {
        return false;
      }

      // 5. Agency
      if (selectedAgency !== 'All' && item.primary_organization !== selectedAgency) {
        return false;
      }

      // 6. Object Type
      if (selectedType !== 'All' && item.object_type !== selectedType) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, mappingFilter, activeCategory, selectedStatus, selectedAgency, selectedType]);

  const categories = ['All', 'Deep Space', 'Mars', 'Moon', 'Earth Orbit', 'Jupiter', 'Saturn', 'Inner Planets'];
  
  const categoryPlanetMap = {
    'Mars': 'mars',
    'Moon': 'moon',
    'Earth Orbit': 'earth',
    'Jupiter': 'jupiter',
    'Saturn': 'saturn'
  };

  return (
    <>
      {/* Toggle button when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggleOpen}
          className="absolute top-20 left-4 z-30 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#09071a]/90 hover:bg-[#120d2c] text-white border border-purple-500/30 shadow-2xl shadow-purple-950/60 backdrop-blur-md cursor-pointer transition-all hover:scale-105"
          title="Open Mission Catalogue Explorer"
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold tracking-wide">Missions ({items.length})</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[9px] text-emerald-300 font-mono">
            {mappingStats.mapped} Plotted
          </span>
          <ChevronRight className="w-4 h-4 text-purple-300" />
        </button>
      )}

      {/* Main Mission Explorer Drawer (Cinematic dark-purple aesthetic) */}
      <aside
        className={`absolute top-16 left-0 bottom-0 z-30 w-72 sm:w-80 md:w-92 bg-[#080518]/92 backdrop-blur-2xl border-r border-purple-500/20 shadow-2xl shadow-purple-950/60 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mission Explorer Sidebar"
      >
        {/* Sidebar Header with Visible Mapped/Unmapped Statistics (Objective 3) */}
        <div className="p-3.5 border-b border-purple-500/20 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 via-indigo-600 to-cyan-600 flex items-center justify-center shadow-md shadow-purple-900/40 shrink-0">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Mission Explorer
                </h2>
                <span className="px-1.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-[9px] text-purple-200 font-mono">
                  {filteredItems.length}/{items.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-2.5 h-2.5" /> {mappingStats.mapped} 3D Mapped
                </span>
                <span className="text-slate-600 text-[9px]">•</span>
                <span className="flex items-center gap-1 text-[9px] text-purple-300/80 font-mono">
                  <AlertCircle className="w-2.5 h-2.5 text-amber-400/80" /> {mappingStats.unmapped} Archives
                </span>
              </div>
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

        {/* Search Bar with Refined Field */}
        <div className="p-3 border-b border-purple-500/15 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              id="mission-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spacecraft, mission, agency..."
              className="w-full bg-[#0d0922]/90 border border-purple-500/25 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                id="mission-search-clear-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mapping Filter Strip: All vs 3D Mapped vs Archive */}
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#0d0922]/90 rounded-lg border border-purple-500/20 text-[10px] font-mono">
            <button
              type="button"
              id="filter-all-btn"
              onClick={() => setMappingFilter('all')}
              className={`py-1 rounded text-center transition-all cursor-pointer ${
                mappingFilter === 'all'
                  ? 'bg-purple-700 text-white font-bold shadow-sm'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              id="filter-mapped-btn"
              onClick={() => setMappingFilter('mapped')}
              className={`py-1 rounded text-center transition-all cursor-pointer ${
                mappingFilter === 'mapped'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-emerald-400 hover:text-white'
              }`}
            >
              Mapped ({mappingStats.mapped})
            </button>
            <button
              type="button"
              id="filter-unmapped-btn"
              onClick={() => setMappingFilter('unmapped')}
              className={`py-1 rounded text-center transition-all cursor-pointer ${
                mappingFilter === 'unmapped'
                  ? 'bg-slate-700 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Archive ({mappingStats.unmapped})
            </button>
          </div>
        </div>

        {/* Destination Category Filter Pills Strip */}
        <div className="px-3 py-2 border-b border-purple-500/15 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {categories.map(cat => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-sm shadow-cyan-600/30'
                      : 'text-purple-300/80 hover:text-white hover:bg-purple-950/50 border border-transparent hover:border-purple-500/20'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Focus Globe Action if destination selected */}
        {categoryPlanetMap[activeCategory] && onSelectPlanet && (
          <div className="px-3 py-1.5 bg-[#0a071c] border-b border-purple-500/15 flex items-center justify-between">
            <span className="text-[11px] text-slate-300 font-sans">
              Inspect {activeCategory} in 3D:
            </span>
            <button
              type="button"
              onClick={() => onSelectPlanet(categoryPlanetMap[activeCategory])}
              className="px-2.5 py-1 rounded-md bg-cyan-950 border border-cyan-400/40 text-cyan-300 hover:text-white hover:bg-cyan-900/60 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Globe2 className="w-3 h-3 text-cyan-400" />
              <span>Focus 3D Globe</span>
            </button>
          </div>
        )}

        {/* Secondary Filter Dropdowns */}
        <div className="px-3 py-2 border-b border-purple-500/15 grid grid-cols-3 gap-1.5 text-[10px]">
          <div>
            <label className="text-purple-300/70 block mb-0.5">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#0d0922] border border-purple-500/20 rounded-lg p-1 text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All</option>
              <option value="Active / operational">Active</option>
              <option value="Inactive / decommissioned">Inactive</option>
              <option value="Unknown / disputed">Disputed</option>
            </select>
          </div>
          <div>
            <label className="text-purple-300/70 block mb-0.5">Agency:</label>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full bg-[#0d0922] border border-purple-500/20 rounded-lg p-1 text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All</option>
              <option value="NASA">NASA</option>
              <option value="European Space Agency (ESA)">ESA</option>
              <option value="China National Space Administration (CNSA)">CNSA</option>
              <option value="Indian Space Research Organisation (ISRO)">ISRO</option>
              <option value="Japan Aerospace Exploration Agency (JAXA)">JAXA</option>
              <option value="Roscosmos">Roscosmos</option>
            </select>
          </div>
          <div>
            <label className="text-purple-300/70 block mb-0.5">Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-[#0d0922] border border-purple-500/20 rounded-lg p-1 text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All</option>
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
        </div>

        {/* Mission List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
          {isLoading && (
            <div className="text-center py-10 space-y-2">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-purple-300 font-mono">Loading verified missions...</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs text-center">
              {error}
            </div>
          )}

          {!isLoading && filteredItems.length === 0 && (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-purple-400/60" />
              <p className="text-xs text-purple-200">No missions found matching your filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setMappingFilter('all');
                  setActiveCategory('All');
                  setSelectedStatus('All');
                  setSelectedType('All');
                  setSelectedAgency('All');
                }}
                className="text-[11px] text-cyan-400 underline cursor-pointer"
              >
                Reset filters
              </button>
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
                data-slug={item.slug}
                onClick={() => onSelectMission(item)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border-cyan-400/60 shadow-lg shadow-purple-950/50 ring-1 ring-cyan-400/40 border-l-4 border-l-cyan-400'
                    : isMapped
                      ? 'bg-purple-950/20 hover:bg-purple-900/35 border-purple-500/15 hover:border-purple-500/35'
                      : 'bg-purple-950/10 hover:bg-purple-900/25 border-white/5 hover:border-purple-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {/* Spacecraft Category Icon (Objective 1) */}
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

                  {/* Operational Status Dot */}
                  <span
                    className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                      item.operational_status?.includes('Active')
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse'
                        : 'bg-amber-400/80'
                    }`}
                    title={item.operational_status || 'Status Unknown'}
                  />
                </div>

                {/* Tags */}
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

                {/* Plotted Position vs Archive Status Indicator (Objectives 1, 2, 3, 4) */}
                <div className="flex items-center gap-1.5 mt-2 text-[9px] font-mono pl-6.5">
                  {isMapped ? (
                    classification.positionType === 'surface' ? (
                      <>
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="text-amber-300 truncate">
                          Surface Site ({classification.coordinates?.lat?.toFixed(1)}°, {classification.coordinates?.lon?.toFixed(1)}°)
                        </span>
                      </>
                    ) : classification.positionType === 'interstellar' ? (
                      <>
                        <Compass className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="text-cyan-300 truncate">
                          {classification.distanceAU} AU ({classification.constellation || 'Escape'})
                        </span>
                      </>
                    ) : (
                      <>
                        <Radio className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300 truncate">
                          {classification.type} Orbit ({classification.referenceBody})
                        </span>
                      </>
                    )
                  ) : (
                    <>
                      <Globe2 className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="text-slate-400 truncate">
                        Target: {item.destination} (Unmapped coords)
                      </span>
                    </>
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

        {/* Footer with accurate counts */}
        <div className="p-3 border-t border-purple-500/20 bg-[#080518]/95 text-[10px] text-purple-300/80 font-sans flex items-center justify-between">
          <span>Novaquest Mission Archives</span>
          <span className="font-mono text-cyan-400">{mappingStats.mapped} 3D / {items.length} Total</span>
        </div>
      </aside>
    </>
  );
}
