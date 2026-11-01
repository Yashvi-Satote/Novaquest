import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  RotateCcw, 
  Orbit, 
  Globe2, 
  Moon, 
  Compass, 
  Building2, 
  Cpu, 
  CheckCircle, 
  Clock, 
  HelpCircle,
  SlidersHorizontal,
  Satellite
} from 'lucide-react';

export default function Sidebar({ 
  hierarchy = [], 
  activeFilters, 
  onFilterChange, 
  onResetFilters,
  onSelectHardware
}) {
  // Expanded state for categories (Mars, Moon, Deep Space, etc.)
  const [expandedCategories, setExpandedCategories] = useState({
    Mars: true,
    Moon: true,
    'Deep Space': true,
    'Earth Orbit': false
  });

  // Expanded state for missions (allow multiple missions expanded independently)
  const [expandedMissions, setExpandedMissions] = useState({
    'Mars 2020': true,
    'Voyager': true,
    'Apollo 11': true
  });

  // Expanded state for status groups
  const [expandedStatuses, setExpandedStatuses] = useState({});

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleMission = (mName) => {
    setExpandedMissions(prev => ({ ...prev, [mName]: !prev[mName] }));
  };

  const toggleStatus = (key) => {
    setExpandedStatuses(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Mars':
        return <Globe2 className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
      case 'Moon':
        return <Moon className="w-4 h-4 text-slate-500 dark:text-slate-300" />;
      case 'Deep Space':
        return <Compass className="w-4 h-4 text-violet-500 dark:text-violet-400" />;
      case 'Earth Orbit':
        return <Satellite className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <Orbit className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
    }
  };

  const getStatusIcon = (status) => {
    if (status.includes('Active')) {
      return <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />;
    }
    if (status.includes('Inactive')) {
      return <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400/80" />;
    }
    return <HelpCircle className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />;
  };

  // Calculate active filter count for reset button badge
  const activeCount = [
    activeFilters.destination && activeFilters.destination !== 'All',
    activeFilters.mission && activeFilters.mission !== 'All',
    activeFilters.status && activeFilters.status !== 'All',
    activeFilters.organization && activeFilters.organization !== 'All',
    activeFilters.object_type && activeFilters.object_type !== 'All',
  ].filter(Boolean).length;

  return (
    <aside className="w-full h-full bg-white/70 dark:bg-[#0c1222]/90 backdrop-blur-md border-r border-slate-200/90 dark:border-white/10 p-3 sm:p-4 flex flex-col overflow-hidden transition-colors duration-200">
      
      {/* Sidebar Header & Reset Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/90 dark:border-white/10 mb-2.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-xs sm:text-sm font-semibold tracking-wide text-slate-800 dark:text-white uppercase">
            Mission Hierarchy
          </h2>
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-800/60 px-2 py-1 rounded-lg transition-all cursor-pointer font-medium shadow-xs"
            title="Reset all active filters"
            id="reset-sidebar-filters-btn"
          >
            <RotateCcw className="w-3 h-3" />
            Reset ({activeCount})
          </button>
        )}
      </div>

      <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 px-1">
        Explore destination → mission → status → company:
      </div>

      {/* Independently Scrollable Tree Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-sm custom-scrollbar">
        {hierarchy.map(cat => {
          const isCatSelected = activeFilters.destination === cat.category;
          const isCatOpen = expandedCategories[cat.category] ?? true;

          return (
            <div key={cat.category} className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-slate-900/40 overflow-hidden shadow-xs">
              
              {/* Category Header (Mars, Moon, Deep Space) */}
              <div 
                className={`flex items-center justify-between px-3 py-2.5 transition-colors cursor-pointer select-none ${
                  isCatSelected 
                    ? 'bg-cyan-100/70 dark:bg-cyan-500/15 border-l-4 border-l-cyan-600 dark:border-l-cyan-400 text-slate-900 dark:text-white font-medium' 
                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200'
                }`}
                onClick={() => {
                  onFilterChange({ destination: isCatSelected ? 'All' : cat.category });
                }}
              >
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(cat.category);
                    }}
                    className="p-1 -ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded"
                    aria-label={`Toggle ${cat.category}`}
                  >
                    {isCatOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {getCategoryIcon(cat.category)}
                  <span className="font-semibold tracking-wide text-xs sm:text-sm">
                    {cat.category}
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700/60">
                  {cat.count}
                </span>
              </div>

              {/* Sub-tree: Missions */}
              {isCatOpen && (
                <div className="pl-3 sm:pl-4 pr-2 pb-2 pt-1 space-y-1.5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                  {cat.missions.map(mission => {
                    const isMissionSelected = activeFilters.mission === mission.name;
                    const isMissionOpen = expandedMissions[mission.name] ?? false;

                    return (
                      <div key={mission.name} className="rounded-lg overflow-hidden">
                        
                        {/* Mission Item */}
                        <div 
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                            isMissionSelected
                              ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-200 font-semibold border border-cyan-300 dark:border-cyan-500/30'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                          }`}
                          onClick={() => {
                            onFilterChange({ 
                              destination: cat.category,
                              mission: isMissionSelected ? 'All' : mission.name 
                            });
                          }}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMission(mission.name);
                              }}
                              className="p-0.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                              aria-label={`Toggle ${mission.name}`}
                            >
                              {isMissionOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                            <Orbit className="w-3 h-3 text-cyan-600 dark:text-cyan-400/80 shrink-0" />
                            <span className="truncate">{mission.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-1">
                            ({mission.count})
                          </span>
                        </div>

                        {/* Sub-tree: Status Groups */}
                        {isMissionOpen && (
                          <div className="pl-4 pr-1 py-1 space-y-1 border-l border-slate-200 dark:border-white/10 ml-2 mt-0.5">
                            {mission.statuses.map(st => {
                              const isStatusSelected = isMissionSelected && activeFilters.status === st.status;
                              const statusKey = `${mission.name}-${st.status}`;
                              const isStatusOpen = expandedStatuses[statusKey] ?? true;

                              return (
                                <div key={st.status} className="space-y-1">
                                  
                                  {/* Status Item */}
                                  <div 
                                    className={`flex items-center justify-between px-2 py-1 rounded transition-colors cursor-pointer text-[11px] ${
                                      isStatusSelected
                                        ? 'bg-indigo-100 dark:bg-indigo-500/25 text-indigo-900 dark:text-indigo-200 font-medium border border-indigo-300 dark:border-indigo-500/30'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                                    onClick={() => {
                                      onFilterChange({
                                        destination: cat.category,
                                        mission: mission.name,
                                        status: isStatusSelected ? 'All' : st.status
                                      });
                                    }}
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleStatus(statusKey);
                                        }}
                                        className="p-0.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                                      >
                                        {isStatusOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                      </button>
                                      {getStatusIcon(st.status)}
                                      <span className="truncate">{st.status}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {st.count}
                                    </span>
                                  </div>

                                  {/* Sub-tree: Organizations & Hardware Items */}
                                  {isStatusOpen && (
                                    <div className="pl-3.5 space-y-1 border-l border-slate-200 dark:border-white/5 ml-2">
                                      {st.organizations.map(org => {
                                        const isOrgSelected = isStatusSelected && activeFilters.organization === org.name;

                                        return (
                                          <div key={org.name} className="space-y-0.5">
                                            {/* Organization node */}
                                            <div 
                                              className={`flex items-center justify-between px-2 py-0.5 rounded cursor-pointer text-[11px] transition-colors ${
                                                isOrgSelected
                                                  ? 'text-cyan-700 dark:text-cyan-300 font-semibold bg-cyan-100/60 dark:bg-cyan-950/50'
                                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                              }`}
                                              onClick={() => {
                                                onFilterChange({
                                                  destination: cat.category,
                                                  mission: mission.name,
                                                  status: st.status,
                                                  organization: isOrgSelected ? 'All' : org.name
                                                });
                                              }}
                                            >
                                              <div className="flex items-center gap-1.5 truncate">
                                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span className="truncate">{org.name}</span>
                                              </div>
                                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                                ({org.count})
                                              </span>
                                            </div>

                                            {/* Direct Hardware Records */}
                                            <div className="pl-2.5 space-y-0.5">
                                              {org.hardware.map(hw => (
                                                <Link
                                                  key={hw.id}
                                                  to={`/hardware/${hw.slug || hw.id}`}
                                                  onClick={() => onSelectHardware && onSelectHardware(hw)}
                                                  className="w-full text-left truncate px-2 py-0.5 text-[10px] text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded transition-colors flex items-center gap-1.5"
                                                  title={`Open ${hw.name}`}
                                                >
                                                  <Cpu className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400/60 shrink-0" />
                                                  <span className="truncate">{hw.name}</span>
                                                </Link>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Clear Quick Tip Footer */}
      <div className="pt-2.5 border-t border-slate-200/90 dark:border-white/10 mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Click node to filter</span>
        <span className="text-cyan-600 dark:text-cyan-400 font-mono font-medium">Verified Archives</span>
      </div>

    </aside>
  );
}
