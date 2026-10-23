import React from 'react';
import { 
  Search, 
  X, 
  ArrowUpDown, 
  Tag 
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
  onSortChange
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
    <div className="space-y-3.5">
      
      {/* 1. Main Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search hardware by name, mission, company, type, status, or keyword..."
          className="w-full pl-10 sm:pl-11 pr-10 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-[#0c1324]/90 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-cyan-500 dark:focus:border-cyan-400 text-xs sm:text-sm shadow-xs dark:shadow-lg backdrop-blur-md transition-all duration-200"
          id="main-search-input"
          aria-label="Search hardware catalogue"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* 2. Compact Destination Filter Pills, Sort Dropdown & Quick Count */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        
        {/* Destination Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {quickDestinations.map((dest) => {
            const isSelected = (activeFilters.destination || 'All') === dest;
            return (
              <button
                key={dest}
                type="button"
                onClick={() => onFilterChange({ destination: dest })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/40 shadow-xs'
                    : 'bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {dest}
              </button>
            );
          })}
        </div>

        {/* Right: Results Count + Sort Dropdown */}
        <div className="flex items-center justify-between md:justify-end gap-3 text-xs shrink-0">
          <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">
            <strong className="text-slate-800 dark:text-white font-semibold">{totalResults}</strong> object{totalResults !== 1 ? 's' : ''}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px] hidden sm:inline-flex">
              <ArrowUpDown className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> Sort:
            </span>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-2xs"
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

      </div>

      {/* 3. Active Filter Chips (if any) */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mr-1">
            Active filters:
          </span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-700/50 text-cyan-800 dark:text-cyan-300 shadow-2xs"
            >
              <Tag className="w-2.5 h-2.5" />
              {chip.label}
              <button
                type="button"
                onClick={() => onRemoveFilter(chip.key)}
                className="hover:text-cyan-950 dark:hover:text-white ml-0.5 cursor-pointer"
                aria-label={`Remove filter: ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

    </div>
  );
}
