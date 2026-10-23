import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FilterBar from './components/FilterBar';
import HardwareCard from './components/HardwareCard';
import ImageModal from './components/ImageModal';
import DatabaseStatusModal from './components/DatabaseStatusModal';
import { 
  fetchHealth, 
  fetchFilters, 
  fetchHardware, 
  fetchHardwareDetail 
} from './services/api';
import { 
  X, 
  AlertCircle, 
  Search, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Layers,
  Compass
} from 'lucide-react';

export default function App() {
  // Backend & Database Health
  const [health, setHealth] = useState({
    status: 'checking',
    database: 'unknown',
    postgres_active: false,
    database_message: 'Connecting to database...',
    hardware_records_count: 0
  });

  // Hierarchy Tree for Sidebar
  const [hierarchy, setHierarchy] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    destination: 'All',
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

  // Card Expansion State & Cached Details
  const [expandedCardIds, setExpandedCardIds] = useState(new Set());
  const [hardwareDetails, setHardwareDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  // Mobile Drawer & Modals
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0
  });

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial Load: Health & Sidebar Hierarchy
  useEffect(() => {
    async function initAppData() {
      try {
        const [healthRes, filtersRes] = await Promise.all([
          fetchHealth(),
          fetchFilters()
        ]);
        setHealth(healthRes);
        setHierarchy(filtersRes.hierarchy || []);
        setFilterOptions(filtersRes.filter_options || {});
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

  // Handle Card Expand / Collapse
  const handleToggleCard = async (id) => {
    const nextSet = new Set(expandedCardIds);
    if (nextSet.has(id)) {
      nextSet.delete(id);
      setExpandedCardIds(nextSet);
      return;
    }

    nextSet.add(id);
    setExpandedCardIds(nextSet);

    // Fetch full details if not already cached
    if (!hardwareDetails[id]) {
      setLoadingDetails(prev => ({ ...prev, [id]: true }));
      try {
        const fullDetail = await fetchHardwareDetail(id);
        setHardwareDetails(prev => ({ ...prev, [id]: fullDetail }));
      } catch (err) {
        console.error(`Failed to fetch detail for hardware ${id}:`, err);
      } finally {
        setLoadingDetails(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  // Filter handlers
  const handleFilterChange = (newFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setCurrentPage(1);
    // Close mobile drawer if open
    setMobileMenuOpen(false);
  };

  const handleRemoveFilter = (filterKey) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: 'All'
    }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setActiveFilters({
      destination: 'All',
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
  const handleSelectHardwareFromSidebar = async (id) => {
    setMobileMenuOpen(false);
    // Expand this card
    handleToggleCard(id);
    // Scroll to card
    setTimeout(() => {
      const el = document.getElementById(`hardware-card-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Lightbox handlers
  const handleOpenLightbox = (images, index) => {
    setLightboxState({
      isOpen: true,
      images,
      currentIndex: index
    });
  };

  const handleCloseLightbox = () => {
    setLightboxState(prev => ({ ...prev, isOpen: false }));
  };

  const handleNavigateLightbox = (newIndex) => {
    setLightboxState(prev => ({ ...prev, currentIndex: newIndex }));
  };

  // Mobile Escape Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) setMobileMenuOpen(false);
        if (dbModalOpen) setDbModalOpen(false);
        if (lightboxState.isOpen) handleCloseLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, dbModalOpen, lightboxState.isOpen]);

  return (
    <div className="min-h-screen bg-[#070b14] space-bg flex flex-col font-sans text-slate-100">
      
      {/* 1. Global Header */}
      <Header
        health={health}
        onOpenDbModal={() => setDbModalOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalResults={totalResults}
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Desktop Sidebar (Left Area) */}
        <div className="hidden lg:block shrink-0 sticky top-20 h-[calc(100vh-6.5rem)]">
          <Sidebar
            hierarchy={hierarchy}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onSelectHardware={handleSelectHardwareFromSidebar}
          />
        </div>

        {/* Mobile Slide-Out Drawer */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          >
            <div 
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#0c1222] border-r border-white/10 p-4 shadow-2xl flex flex-col animate-slide-right"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation Drawer"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" /> Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  hierarchy={hierarchy}
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                  onSelectHardware={handleSelectHardwareFromSidebar}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area (Center / Right) */}
        <main className="flex-1 min-w-0 space-y-6">
          
          {/* Search, Pills, Active Filters & Sorting */}
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            totalResults={totalResults}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onRemoveFilter={handleRemoveFilter}
            sortOption={sortOption}
            onSortChange={setSortOption}
            destinations={filterOptions.destinations || []}
          />

          {/* Error Banner */}
          {fetchError && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="text-white">Connection Alert:</strong> {fetchError}
                <p className="mt-1 text-rose-300">
                  Ensure the Flask backend is running on port 5000 (<code className="bg-rose-900/60 px-1 py-0.5 rounded">python backend/app.py</code>).
                </p>
              </div>
              <button
                type="button"
                onClick={loadHardware}
                className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Hardware Cards List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="glass-panel rounded-2xl p-5 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-1/3 bg-slate-800 rounded-lg" />
                    <div className="h-6 w-24 bg-slate-800 rounded-full" />
                  </div>
                  <div className="h-4 w-1/2 bg-slate-800/60 rounded" />
                  <div className="h-3 w-3/4 bg-slate-800/40 rounded" />
                </div>
              ))}
            </div>
          ) : hardwareItems.length === 0 ? (
            /* Empty State */
            <div className="glass-panel rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto my-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-7 h-7 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No hardware objects found</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  We couldn't find any hardware matching your current search or sidebar filters. Try broader keywords or reset your filters.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Results Cards */
            <div className="space-y-4">
              {hardwareItems.map(item => (
                <HardwareCard
                  key={item.id}
                  item={item}
                  isExpanded={expandedCardIds.has(item.id)}
                  onToggle={() => handleToggleCard(item.id)}
                  detailData={hardwareDetails[item.id]}
                  isLoadingDetail={loadingDetails[item.id]}
                  onOpenImageModal={handleOpenLightbox}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-slate-400 font-mono">
                Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>

      </div>

      {/* 3. Global Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#060a12]/90 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>NASA Space Apps Challenge • Component 1: Space Hardware Explorer</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>NASA PDS & NSSDCA Records</span>
            <span>•</span>
            <span>JPL Deep Space Archives</span>
            <span>•</span>
            <button 
              type="button" 
              onClick={() => setDbModalOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              PostgreSQL Engine Info
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Modals */}
      {lightboxState.isOpen && (
        <ImageModal
          images={lightboxState.images}
          currentIndex={lightboxState.currentIndex}
          onClose={handleCloseLightbox}
          onNavigate={handleNavigateLightbox}
        />
      )}

      {dbModalOpen && (
        <DatabaseStatusModal
          health={health}
          onClose={() => setDbModalOpen(false)}
        />
      )}

    </div>
  );
}
