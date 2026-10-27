import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Compass, 
  Globe2, 
  ChevronLeft, 
  ChevronRight, 
  Layers,
  X
} from 'lucide-react';
import { fetchHardware } from '../../services/api';

export default function MissionExplorerSidebar({
  selectedMissionSlug,
  onSelectMission,
  isOpen,
  onToggleOpen
}) {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedAgency, setSelectedAgency] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial load of catalogue items from the real Flask API
  useEffect(() => {
    async function loadCatalogue() {
      setIsLoading(true);
      setError(null);
      try {
        const hwRes = await fetchHardware({ limit: 300 }); // Load full 250+ catalogue
        setItems(hwRes.items || []);
      } catch (err) {
        console.error('Failed to load mission catalogue from API:', err);
        setError('Cannot connect to mission database API.');
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalogue();
  }, []);

  // Filtered catalogue list
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Search query
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

      // 2. Destination Category
      if (activeCategory !== 'All') {
        const cat = activeCategory.toLowerCase();
        const itemDest = (item.destination_category || item.destination || '').toLowerCase();
        if (cat === 'inner planets') {
          if (!['mercury', 'venus'].includes(itemDest)) return false;
        } else if (!itemDest.includes(cat)) {
          return false;
        }
      }

      // 3. Status
      if (selectedStatus !== 'All' && item.operational_status !== selectedStatus) {
        return false;
      }

      // 4. Agency
      if (selectedAgency !== 'All' && item.primary_organization !== selectedAgency) {
        return false;
      }

      // 5. Object Type
      if (selectedType !== 'All' && item.object_type !== selectedType) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, activeCategory, selectedStatus, selectedAgency, selectedType]);

  const categories = ['All', 'Deep Space', 'Mars', 'Moon', 'Earth Orbit', 'Inner Planets'];

  return (
    <>
      {/* Toggle button when closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggleOpen}
          className="absolute top-20 left-4 z-30 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white border border-cyan-500/30 shadow-2xl backdrop-blur-md cursor-pointer transition-all hover:scale-105"
          title="Open Mission Catalogue Explorer"
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold tracking-wide">Missions ({items.length})</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      )}

      {/* Main Mission Explorer Drawer - Translucent glassmorphism preserving 3D viewport */}
      <aside
        className={`absolute top-16 left-0 bottom-0 z-30 w-72 sm:w-80 md:w-88 bg-slate-950/75 backdrop-blur-2xl border-r border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-white/10 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Mission Explorer
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[9px] text-cyan-300 font-mono">
                  {filteredItems.length}/{items.length}
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-sans">
                Verified Deep Space & Planetary Missions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by mission, spacecraft, agency..."
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="px-3 py-2 border-b border-white/5 overflow-x-auto no-scrollbar">
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
                      ? 'bg-cyan-600 text-white font-semibold shadow-sm shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="px-3 py-2 border-b border-white/5 grid grid-cols-3 gap-1.5 text-[10px]">
          <div>
            <label className="text-slate-400 block mb-0.5">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg p-1 text-slate-200 focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Active / operational">Active</option>
              <option value="Inactive / decommissioned">Inactive</option>
              <option value="Unknown / disputed">Disputed</option>
            </select>
          </div>
          <div>
            <label className="text-slate-400 block mb-0.5">Agency:</label>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg p-1 text-slate-200 focus:outline-none"
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
            <label className="text-slate-400 block mb-0.5">Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-lg p-1 text-slate-200 focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Flyby Probe">Flyby</option>
              <option value="Rover">Rover</option>
              <option value="Lander">Lander</option>
              <option value="Orbiter">Orbiter</option>
              <option value="Space Station">Station</option>
              <option value="Spacecraft">Craft</option>
            </select>
          </div>
        </div>

        {/* Mission List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading && (
            <div className="text-center py-10 space-y-2">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Loading verified missions...</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs text-center">
              {error}
            </div>
          )}

          {!isLoading && filteredItems.length === 0 && (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No missions found matching your filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                  setSelectedStatus('All');
                  setSelectedType('All');
                }}
                className="text-[11px] text-cyan-400 underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}

          {filteredItems.map(item => {
            const isSelected = selectedMissionSlug === item.slug;
            const hasSurfaceCoords = item.latitude !== null && item.longitude !== null;
            const isDeepSpace = (item.destination_category || item.destination) === 'Deep Space';

            return (
              <div
                key={item.id || item.slug}
                onClick={() => onSelectMission(item)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400/50'
                    : 'bg-slate-900/50 hover:bg-slate-800/70 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white tracking-tight truncate">
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5 truncate">
                      Mission: <span className="text-slate-300 font-medium">{item.mission_name || 'Autonomous'}</span>
                    </p>
                  </div>

                  {/* Operational Status Dot */}
                  <span
                    className={`shrink-0 w-2 h-2 rounded-full mt-1 ${
                      item.operational_status?.includes('Active')
                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse'
                        : 'bg-amber-400/80'
                    }`}
                    title={item.operational_status || 'Status Unknown'}
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-slate-300 font-mono">
                    {item.destination}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-slate-400 font-sans">
                    {item.object_type}
                  </span>
                  {item.primary_organization && (
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/20 text-[9px] text-cyan-300 font-sans truncate max-w-[110px]">
                      {item.primary_organization}
                    </span>
                  )}
                </div>

                {/* Verified Location Indicator - Requirement #2 & #3 */}
                <div className="flex items-center gap-1.5 mt-2 text-[9px] font-mono text-slate-400">
                  {hasSurfaceCoords ? (
                    <>
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="text-cyan-300 truncate">Verified Site ({item.latitude?.toFixed(1)}°, {item.longitude?.toFixed(1)}°)</span>
                    </>
                  ) : isDeepSpace ? (
                    <>
                      <Compass className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="text-amber-300 truncate">Interstellar Escape Trajectory</span>
                    </>
                  ) : (
                    <>
                      <Globe2 className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="text-slate-400 truncate">Target: {item.destination} (Unmapped coords)</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-white/10 bg-slate-950/90 text-[10px] text-slate-400 font-sans flex items-center justify-between">
          <span>Novaquest Verified Archives</span>
          <span className="font-mono text-cyan-400">Total: {items.length} Records</span>
        </div>
      </aside>
    </>
  );
}
