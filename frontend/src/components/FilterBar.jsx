import React from 'react';
import { 
  Search, 
  X, 
  ArrowUpDown, 
  Sliders, 
  Tag, 
  Globe2, 
  Moon, 
  Compass, 
  Satellite, 
  Layers 
} from 'lucide-react';

export default function FilterBar({ 
  searchQuery, 
  onSearchChange, 
  onClearSearch,
  totalResults, 
  activeFilters, 
  onFilterChange, 
  onRemoveFilter,
  sortOption, 
  onSortChange,
  destinations = []
}) {
  const quickDestinations = ['All', 'Mars', 'Moon', 'Deep Space', 'Earth Orbit'];

  // Identify non-empty filters
  const activeChips = [];
  if (activeFilters.destination && activeFilters.destination !== 'All') {
    activeChips.push({ key: 'destination', label: `Destination: ${activeFilters.destination}` });
  }
  if (activeFilters.mission && activeFilters.mission !== 'All') {
    activeChips.push({ key: 'mission', label: `Mission: ${activeFilters.mission}` });
  }
  if (activeFilters.status && activeFilters.status !== 'All') {
    activeChips.push({ key: 'status', label: `Status: ${activeFilters.status}` });
  }
  if (activeFilters.organization && activeFilters.organization !== 'All') {
    activeChips.push({ key: 'organization', label: `Org: ${activeFilters.organization}` });
  }
  if (activeFilters.object_type && activeFilters.object_type !== 'All') {
    activeChips.push({ key: 'object_type', label: `Type: ${activeFilters.object_type}` });
  }

  return (
    <div className="space-y-4">
      
      {/* 1. Main Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5 text-cyan-400" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search satellites, missions, companies, hardware, or keywords..."
          className="w-full pl-12 pr-11 py-3.5 rounded-2xl bg-[#0c1324]/90 border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm sm:text-base shadow-xl backdrop-blur-md transition-all"
          id="main-search-input"
          aria-label="Search hardware catalogue"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
            aria-label="Clear search query"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Destination Quick Filter Pills & Sorting Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        
        {/* Destination Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {quickDestinations.map((dest) => {
            const isSelected = (activeFilters.destination || 'All') === dest;
            return (
              <button
                key={dest}
                type="button"
                onClick={() => onFilterChange({ destination: dest })}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {dest}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <ArrowUpDown className="w-3 h-3 text-cyan-400" /> Sort by:
          </span>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
            id="sort-select-dropdown"
            aria-label="Sort hardware items"
          >
            <option value="launch_date_desc">Launch Date (Newest first)</option>
            <option value="launch_date_asc">Launch Date (Oldest first)</option>
            <option value="name_asc">Name (A → Z)</option>
            <option value="name_desc">Name (Z → A)</option>
            <option value="status">Operational Status</option>
          </select>
        </div>

      </div>

      {/* 3. Active Filter Chips & Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
        
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-mono">
            Found <strong className="text-white">{totalResults}</strong> object{totalResults !== 1 ? 's' : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </span>

          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-cyan-950/70 border border-cyan-700/50 text-cyan-300 shadow-sm"
            >
              <Tag className="w-2.5 h-2.5" />
              {chip.label}
              <button
                type="button"
                onClick={() => onRemoveFilter(chip.key)}
                className="hover:text-white ml-0.5"
                aria-label={`Remove filter: ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

      </div>

    </div>
  );
}
