import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import FilterBar from '../components/FilterBar';
import HardwareCard from '../components/HardwareCard';
import { 
  fetchFilters, 
  fetchHardware 
} from '../services/api';
import { 
  X, 
  AlertCircle, 
  Search, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Compass
} from 'lucide-react';

export default function ExplorerPage({ theme, onToggleTheme }) {
  // Hierarchy Tree for Sidebar
  const [hierarchy, setHierarchy] = useState([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    destination: 'All',
    programme: 'All',
    mission: 'All',
    status: 'All',
    organization: 'All',
    object_type: 'All'
  });
  const [sortOption, setSortOption] = useState('launch_date_desc');

  // Catalogue Results & Pagination
  const [hardwareItems, setHardwareItems] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Mobile Drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial Load: Sidebar Hierarchy
  useEffect(() => {
    async function initAppData() {
      try {
        const filtersRes = await fetchFilters();
        setHierarchy(filtersRes.hierarchy || []);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    initAppData();
  }, []);

  // Fetch Hardware Catalogue
  const loadHardware = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchHardware({
        q: debouncedQuery,
        destination: activeFilters.destination,
        programme: activeFilters.programme,
        mission: activeFilters.mission,
        status: activeFilters.status,
        organization: activeFilters.organization,
        object_type: activeFilters.object_type,
        sort_by: sortOption,
        page: currentPage,
        limit: 12
      });

      setHardwareItems(data.items || []);
      setTotalResults(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load hardware items:', err);
      setFetchError(err.message || 'Error communicating with catalogue backend.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, activeFilters, sortOption, currentPage]);

  useEffect(() => {
    loadHardware();
  }, [loadHardware]);

  // Filter handlers
  const handleFilterChange = (newFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setCurrentPage(1);
    setMobileMenuOpen(false);
  };

  const handleRemoveFilter = (filterKey) => {
    setActiveFilters((prev) => {
      const next = { ...prev, [filterKey]: 'All' };
      if (filterKey === 'destination') {
        next.programme = 'All';
        next.mission = 'All';
      } else if (filterKey === 'programme') {
        next.mission = 'All';
      }
      return next;
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setActiveFilters({
      destination: 'All',
      programme: 'All',
      mission: 'All',
      status: 'All',
      organization: 'All',
      object_type: 'All'
    });
    setSearchQuery('');
    setCurrentPage(1);
    setMobileMenuOpen(false);
  };

  // Select hardware directly from sidebar tree
  const handleSelectHardwareFromSidebar = () => {
    setMobileMenuOpen(false);
  };

  // Mobile Escape Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-[#070b14] space-bg flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200`}>
      
      {/* 1. Global Header (Flush full-width) */}
      <Header
        theme={theme}
        onToggleTheme={onToggleTheme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 2. Main Layout Area (Sidebar flush against absolute left edge + full-width main content) */}
      <div className="flex-1 w-full flex flex-col lg:flex-row min-h-0">
        
        {/* Desktop Sidebar: Flush against the absolute left edge of the screen */}
        <div className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-slate-200/90 dark:border-white/10 z-20">
          <Sidebar
            hierarchy={hierarchy}
            activeFilters={activeFilters}
            searchQuery={searchQuery}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onSelectHardware={handleSelectHardwareFromSidebar}
          />
        </div>

        {/* Mobile Slide-Out Drawer (Flush left) */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden bg-black/60 dark:bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          >
            <div 
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-[#0c1222] border-r border-slate-200 dark:border-white/10 p-3 sm:p-4 shadow-2xl flex flex-col animate-slide-right"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Drawer"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-3">
                <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  hierarchy={hierarchy}
                  activeFilters={activeFilters}
                  searchQuery={searchQuery}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                  onSelectHardware={handleSelectHardwareFromSidebar}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area (Expands to use all remaining horizontal width) */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 space-y-5">
          
          {/* Search, Pills, Active Filters & Sorting */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            totalResults={totalResults}
            activeFilters={activeFilters}
            destinations={hierarchy.map((item) => item.destination)}
            onFilterChange={handleFilterChange}
            onRemoveFilter={handleRemoveFilter}
            sortOption={sortOption}
            onSortChange={setSortOption}
          />

          {/* Error Banner */}
          {fetchError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="text-rose-900 dark:text-white">Connection Alert:</strong> {fetchError}
                <p className="mt-1 text-rose-700 dark:text-rose-300">
                  Ensure the Flask backend is running on port 5000 (<code className="bg-rose-100 dark:bg-rose-900/60 px-1 py-0.5 rounded">python backend/app.py</code>).
                </p>
              </div>
              <button
                type="button"
                onClick={loadHardware}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Hardware Cards: Responsive Grid (3 per row large screens, 2 per row medium, 1 on mobile) */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5 sm:gap-5">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="glass-panel rounded-2xl p-5 space-y-3.5 animate-pulse bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="h-4 w-1/2 bg-slate-200/80 dark:bg-slate-800/60 rounded" />
                  <div className="h-3 w-full bg-slate-200/60 dark:bg-slate-800/40 rounded" />
                  <div className="h-3 w-2/3 bg-slate-200/60 dark:bg-slate-800/40 rounded" />
                </div>
              ))}
            </div>
          ) : hardwareItems.length === 0 ? (
            /* Empty State */
            <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto my-8 border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/40">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">No hardware objects found</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  We couldn't find any space hardware matching your current search or sidebar filters. Try broader keywords or reset your filters.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Responsive Grid: 3 cards/row on larger screens (xl:grid-cols-3), 2 cards/row on medium screens (md:grid-cols-2), 1 card/row on mobile */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5 sm:gap-5 items-stretch">
              {hardwareItems.map(item => (
                <HardwareCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-white/10 text-xs">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-slate-500 dark:text-slate-400 font-mono">
                Page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>

      </div>

      {/* 3. Global Footer */}
      <footer className="mt-auto border-t border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-[#060a12]/90 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Novaquest</span>
            <span>•</span>
            <span>Human-Made Hardware Across the Cosmos</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
            <span>NASA PDS & NSSDCA Records</span>
            <span>•</span>
            <span>JPL Deep Space Archives</span>
            <span>•</span>
            <span>CelesTrak SATCAT</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
