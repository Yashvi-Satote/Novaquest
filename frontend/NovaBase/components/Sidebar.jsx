import React, { useMemo, useState } from 'react';
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

// Top-level hierarchy: missions are separated by activity, with inactive first.
const ACTIVITY_GROUPS = [
  { key: 'inactive', label: 'Inactive Missions', icon: Clock, iconClass: 'text-amber-500 dark:text-amber-400' },
  { key: 'active', label: 'Active Missions', icon: CheckCircle, iconClass: 'text-emerald-500 dark:text-emerald-400' },
  { key: 'planned', label: 'Planned Missions', icon: Orbit, iconClass: 'text-sky-500 dark:text-sky-400' },
  { key: 'unknown', label: 'Other Missions', icon: HelpCircle, iconClass: 'text-purple-500 dark:text-purple-400' },
];

export default function Sidebar({ 
  hierarchy = [], 
  activeFilters, 
  onFilterChange, 
  onResetFilters,
  onSelectHardware
}) {
  // Expanded state for activity groups (Inactive is open on load)
  const [expandedGroups, setExpandedGroups] = useState({ inactive: true });

  // Expanded state for the "Fully documented" and "Other missions" subsections
  const [expandedDocumented, setExpandedDocumented] = useState({ inactive: true });
  const [expandedOthers, setExpandedOthers] = useState({});

  // Expanded state for missions (allow multiple missions expanded independently)
  const [expandedMissions, setExpandedMissions] = useState({});

  // Expanded state for status groups
  const [expandedStatuses, setExpandedStatuses] = useState({});

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDocumented = (key) => {
    setExpandedDocumented(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleOthers = (key) => {
    setExpandedOthers(prev => ({ ...prev, [key]: !prev[key] }));
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
        return <Globe2 className="w-3 h-3 text-rose-500 dark:text-rose-400" />;
      case 'Moon':
        return <Moon className="w-3 h-3 text-slate-500 dark:text-slate-300" />;
      case 'Deep Space':
        return <Compass className="w-3 h-3 text-violet-500 dark:text-violet-400" />;
      case 'Earth Orbit':
        return <Satellite className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <Orbit className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />;
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

  // Flatten destination -> mission -> build activity groups.
  const groups = useMemo(() => {
    const missions = [];
    hierarchy.forEach(cat => {
      (cat.missions || []).forEach(mission => {
        missions.push({ ...mission, category: cat.category });
      });
    });

    return ACTIVITY_GROUPS.map(group => {
      const items = missions.filter(mission => (mission.activity || 'unknown') === group.key);
      const documented = items.filter(mission => mission.complete);
      const others = items.filter(mission => !mission.complete);
      return {
        ...group,
        missions: items,
        documented,
        others,
        count: items.reduce((sum, mission) => sum + (mission.count || 0), 0),
      };
    }).filter(group => group.missions.length > 0);
  }, [hierarchy]);

  // Count only filters that differ from the default landing view.
  const activeCount = [
    activeFilters.destination && activeFilters.destination !== 'All',
    activeFilters.mission && activeFilters.mission !== 'All',
    activeFilters.hardware && activeFilters.hardware !== 'All',
    activeFilters.status && activeFilters.status !== 'All',
    activeFilters.organization && activeFilters.organization !== 'All',
    activeFilters.object_type && activeFilters.object_type !== 'All',
    (activeFilters.activity || 'All') !== 'inactive',
    Boolean(activeFilters.complete) !== true,
  ].filter(Boolean).length;

  const selectGroup = (group) => {
    onFilterChange({
      activity: group.key,
      complete: false,
      destination: 'All',
      mission: 'All',
      hardware: 'All',
      status: 'All',
      organization: 'All'
    });
  };

  const selectDocumented = (group) => {
    onFilterChange({
      activity: group.key,
      complete: true,
      destination: 'All',
      mission: 'All',
      hardware: 'All',
      status: 'All',
      organization: 'All'
    });
  };

  const renderMission = (mission, group) => {
    const isIndependent = Boolean(mission.is_independent);
    const isMissionSelected = isIndependent
      ? activeFilters.hardware === mission.hardware_slug
      : activeFilters.mission === mission.name;
    const isMissionOpen = expandedMissions[mission.key || mission.name] ?? false;

    return (
      <div key={mission.key || mission.name} className="rounded-lg overflow-hidden">
        
        {/* Mission item (or standalone hardware when the record has no real mission) */}
        <div 
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
            isMissionSelected
              ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-200 font-semibold border border-cyan-300 dark:border-cyan-500/30'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
          }`}
          onClick={() => {
            if (isIndependent) {
              onFilterChange({
                activity: group.key,
                complete: false,
                destination: mission.category,
                mission: 'All',
                hardware: isMissionSelected ? 'All' : mission.hardware_slug,
                status: 'All',
                organization: 'All'
              });
              return;
            }
            onFilterChange({ 
              activity: group.key,
              complete: false,
              destination: mission.category,
              mission: isMissionSelected ? 'All' : mission.name,
              hardware: 'All',
              status: 'All',
              organization: 'All'
            });
          }}
        >
          <div className="flex items-center gap-1.5 truncate">
            {isIndependent ? (
              <Cpu className="w-3 h-3 text-cyan-600 dark:text-cyan-400/80 shrink-0 ml-1" />
            ) : (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMission(mission.key || mission.name);
                  }}
                  className="p-0.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label={`Toggle ${mission.name}`}
                >
                  {isMissionOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {mission.complete ? (
                  <CheckCircle className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Orbit className="w-3 h-3 text-cyan-600 dark:text-cyan-400/80 shrink-0" />
                )}
              </>
            )}
            <span className="truncate">{mission.name}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden xl:inline-flex items-center gap-0.5">
              {getCategoryIcon(mission.category)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-1">
              ({mission.count})
            </span>
          </div>
        </div>

        {/* Sub-tree: Status Groups */}
        {!isIndependent && isMissionOpen && (
          <div className="pl-4 pr-1 py-1 space-y-1 border-l border-slate-200 dark:border-white/10 ml-2 mt-0.5">
            {mission.statuses.map(st => {
              const isStatusSelected = isMissionSelected && activeFilters.status === st.status;
              const statusKey = `${mission.key || mission.name}-${st.status}`;
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
                        activity: group.key,
                        complete: false,
                        destination: mission.category,
                        mission: mission.name,
                        hardware: 'All',
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
                                  activity: group.key,
                                  complete: false,
                                  destination: mission.category,
                                  mission: mission.name,
                                  hardware: 'All',
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
  };

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
            title="Reset to the default inactive, fully documented view"
            id="reset-sidebar-filters-btn"
          >
            <RotateCcw className="w-3 h-3" />
            Reset ({activeCount})
          </button>
        )}
      </div>

      <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 px-1">
        Explore status group → mission → status → company:
      </div>

      {/* Independently Scrollable Tree Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-sm custom-scrollbar">
        {groups.map(group => {
          const GroupIcon = group.icon;
          const isGroupSelected = activeFilters.activity === group.key
            && !activeFilters.complete
            && activeFilters.mission === 'All'
            && activeFilters.hardware === 'All';
          const isGroupOpen = expandedGroups[group.key] ?? false;
          const isDocumentedOpen = expandedDocumented[group.key] ?? (group.key === 'inactive');
          const isOthersOpen = expandedOthers[group.key] ?? false;
          const isDocumentedSelected = activeFilters.activity === group.key
            && Boolean(activeFilters.complete)
            && activeFilters.mission === 'All'
            && activeFilters.hardware === 'All';

          return (
            <div key={group.key} className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-slate-900/40 overflow-hidden shadow-xs">
              
              {/* Activity Group Header (Inactive, Active, Planned) */}
              <div 
                className={`flex items-center justify-between px-3 py-2.5 transition-colors cursor-pointer select-none ${
                  isGroupSelected 
                    ? 'bg-cyan-100/70 dark:bg-cyan-500/15 border-l-4 border-l-cyan-600 dark:border-l-cyan-400 text-slate-900 dark:text-white font-medium' 
                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200'
                }`}
                onClick={() => {
                  if (!isGroupOpen) toggleGroup(group.key);
                  selectGroup(group);
                }}
              >
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(group.key);
                    }}
                    className="p-1 -ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded"
                    aria-label={`Toggle ${group.label}`}
                  >
                    {isGroupOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <GroupIcon className={`w-4 h-4 ${group.iconClass}`} />
                  <span className="font-semibold tracking-wide text-xs sm:text-sm">
                    {group.label}
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700/60">
                  {group.count}
                </span>
              </div>

              {/* Sub-tree: Fully documented missions first, then the rest */}
              {isGroupOpen && (
                <div className="pl-3 sm:pl-4 pr-2 pb-2 pt-1.5 space-y-1.5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">

                  {group.documented.length > 0 && (
                    <div className="rounded-lg overflow-hidden">
                      <div
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                          isDocumentedSelected
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-semibold border border-emerald-300 dark:border-emerald-500/30'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        onClick={() => {
                          if (!isDocumentedOpen) toggleDocumented(group.key);
                          selectDocumented(group);
                        }}
                        title="Missions with all 10 NovaBase sections complete"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDocumented(group.key);
                            }}
                            className="p-0.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                            aria-label={`Toggle fully documented ${group.label}`}
                          >
                            {isDocumentedOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                          <CheckCircle className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
                          <span className="truncate font-medium">Fully documented</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-1">
                          ({group.documented.length})
                        </span>
                      </div>

                      {isDocumentedOpen && (
                        <div className="pt-1 space-y-1">
                          {group.documented.map(mission => renderMission(mission, group))}
                        </div>
                      )}
                    </div>
                  )}

                  {group.others.length > 0 && (
                    <div className="rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                        onClick={() => toggleOthers(group.key)}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOthers(group.key);
                            }}
                            className="p-0.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                            aria-label={`Toggle other ${group.label}`}
                          >
                            {isOthersOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                          <Orbit className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {group.documented.length > 0 ? 'Other missions' : 'All missions'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-1">
                          ({group.others.length})
                        </span>
                      </div>

                      {isOthersOpen && (
                        <div className="pt-1 space-y-1">
                          {group.others.map(mission => renderMission(mission, group))}
                        </div>
                      )}
                    </div>
                  )}

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
