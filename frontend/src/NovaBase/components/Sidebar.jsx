import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  Globe2,
  HelpCircle,
  Moon,
  Orbit,
  RotateCcw,
  Satellite,
  SlidersHorizontal,
} from 'lucide-react';

const matchesText = (value, query) => (value || '').toLocaleLowerCase().includes(query);

export default function Sidebar({
  hierarchy = [],
  activeFilters,
  searchQuery = '',
  onFilterChange,
  onResetFilters,
  onSelectHardware,
}) {
  const [expandedDestinations, setExpandedDestinations] = useState({});
  const [expandedProgrammes, setExpandedProgrammes] = useState({});
  const [expandedMissions, setExpandedMissions] = useState({});
  const query = searchQuery.trim().toLocaleLowerCase();

  const activeCount = [
    activeFilters.destination && activeFilters.destination !== 'All',
    activeFilters.programme && activeFilters.programme !== 'All',
    activeFilters.mission && activeFilters.mission !== 'All',
    activeFilters.status && activeFilters.status !== 'All',
    activeFilters.organization && activeFilters.organization !== 'All',
    activeFilters.object_type && activeFilters.object_type !== 'All',
  ].filter(Boolean).length;

  const getDestinationIcon = (destination) => {
    if (destination === 'Moon') {
      return <Moon className="w-4 h-4 text-slate-500 dark:text-slate-300 shrink-0" />;
    }
    if (destination === 'Mars' || destination === 'Venus' || destination === 'Mercury') {
      return <Globe2 className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />;
    }
    if (destination === 'Earth Orbit') {
      return <Satellite className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />;
    }
    return <Compass className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0" />;
  };

  const toggle = (setter, key) => {
    setter((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  const selectDestination = (destination) => {
    const selected = activeFilters.destination === destination
      && activeFilters.programme === 'All'
      && activeFilters.mission === 'All';
    onFilterChange({
      destination: selected ? 'All' : destination,
      programme: 'All',
      mission: 'All',
    });
  };

  const selectProgramme = (destination, programme) => {
    const selected = activeFilters.destination === destination
      && activeFilters.programme === programme
      && activeFilters.mission === 'All';
    onFilterChange({
      destination,
      programme: selected ? 'All' : programme,
      mission: 'All',
    });
  };

  const selectMission = (destination, programme, mission) => {
    const selected = activeFilters.mission === mission.name;
    onFilterChange({
      destination,
      programme,
      mission: selected ? 'All' : mission.name,
    });
  };

  const selectStatus = (destination, programme, mission, status) => {
    const selected = activeFilters.status === status
      && activeFilters.mission === mission.name;
    onFilterChange({
      destination,
      programme,
      mission: mission.name,
      status: selected ? 'All' : status,
      organization: 'All',
    });
  };

  const selectOrganization = (destination, programme, mission, organization) => {
    const selected = activeFilters.organization === organization
      && activeFilters.mission === mission.name;
    onFilterChange({
      destination,
      programme,
      mission: mission.name,
      organization: selected ? 'All' : organization,
    });
  };

  return (
    <aside className="w-full h-full bg-white/70 dark:bg-[#0c1222]/90 backdrop-blur-md border-r border-slate-200/90 dark:border-white/10 p-3 sm:p-4 flex flex-col overflow-hidden transition-colors duration-200">
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
          >
            <RotateCcw className="w-3 h-3" />
            Reset ({activeCount})
          </button>
        )}
      </div>

      <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 px-1">
        Explore destination → programme → mission:
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 text-sm custom-scrollbar">
        {hierarchy.map((destinationNode) => {
          const destination = destinationNode.destination;
          const destinationMatches = query && matchesText(destination, query);
          const isDestinationActive = activeFilters.destination === destination;
          const isDestinationSelected = activeFilters.destination === destination
            && activeFilters.programme === 'All'
            && activeFilters.mission === 'All';
          const destinationKey = destination;

          const visibleProgrammes = destinationNode.programmes.map((programmeNode) => {
            const programmeMatches = query && matchesText(programmeNode.name, query);
            const visibleMissions = programmeNode.missions.filter((mission) => {
              if (!query || destinationMatches || programmeMatches) return true;
              return matchesText(mission.name, query)
                || mission.hardware.some((hardware) => (
                  matchesText(hardware.name, query)
                  || matchesText(hardware.primary_organization, query)
                  || (hardware.organizations || []).some((organization) => matchesText(organization, query))
                  || matchesText(hardware.operational_status, query)
                ));
            });
            const missionMatches = query && visibleMissions.some((mission) => (
              matchesText(mission.name, query)
              || mission.hardware.some((hardware) => (
                matchesText(hardware.name, query)
                || matchesText(hardware.primary_organization, query)
                || (hardware.organizations || []).some((organization) => matchesText(organization, query))
                || matchesText(hardware.operational_status, query)
              ))
            ));
            return { ...programmeNode, programmeMatches, missionMatches, visibleMissions };
          }).filter((programmeNode) => programmeNode.visibleMissions.length > 0);

          if (query && visibleProgrammes.length === 0) return null;
          const destinationOpen = expandedDestinations[destinationKey]
            || isDestinationActive
            || Boolean(destinationMatches)
            || visibleProgrammes.some((programme) => (
              programme.programmeMatches || programme.missionMatches
            ));

          return (
            <section
              key={destination}
              className="rounded-xl border border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-slate-900/40 overflow-hidden shadow-xs"
            >
              <div className={`flex items-center gap-1.5 px-2.5 py-2 transition-colors ${
                isDestinationActive
                  ? 'bg-cyan-100/70 dark:bg-cyan-500/15 border-l-4 border-l-cyan-600 dark:border-l-cyan-400'
                  : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
              }`}>
                <button
                  type="button"
                  onClick={() => toggle(setExpandedDestinations, destinationKey)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded"
                  aria-label={`${destinationOpen ? 'Collapse' : 'Expand'} ${destination}`}
                  aria-expanded={Boolean(destinationOpen)}
                >
                  {destinationOpen
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />}
                </button>
                {getDestinationIcon(destination)}
                <button
                  type="button"
                  onClick={() => selectDestination(destination)}
                  title={destination}
                  className="flex-1 min-w-0 text-left truncate font-semibold tracking-wide text-xs sm:text-sm text-slate-800 dark:text-slate-100"
                  aria-pressed={Boolean(isDestinationSelected)}
                >
                  {destination}
                </button>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700/60">
                  {destinationNode.count}
                </span>
              </div>

              {destinationOpen && (
                <div className="pl-3 sm:pl-4 pr-2 pb-2 pt-1 space-y-1 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                  {visibleProgrammes.map((programmeNode) => {
                    const programme = programmeNode.name;
                    const programmeKey = `${destination}::${programme}`;
                    const isProgrammeSelected = activeFilters.destination === destination
                      && activeFilters.programme === programme
                      && activeFilters.mission === 'All';
                    const programmeOpen = expandedProgrammes[programmeKey]
                      || isProgrammeSelected
                      || Boolean(programmeNode.programmeMatches)
                      || Boolean(programmeNode.missionMatches)
                      || Boolean(destinationMatches);

                    return (
                      <div key={programmeKey} className="rounded-lg">
                        <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          isProgrammeSelected
                            ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-200 font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                        }`}>
                          <button
                            type="button"
                            onClick={() => toggle(setExpandedProgrammes, programmeKey)}
                            className="p-0.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                            aria-label={`${programmeOpen ? 'Collapse' : 'Expand'} ${programme}`}
                            aria-expanded={Boolean(programmeOpen)}
                          >
                            {programmeOpen
                              ? <ChevronDown className="w-3.5 h-3.5" />
                              : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                          <Orbit className="w-3 h-3 text-cyan-600 dark:text-cyan-400/80 shrink-0" />
                          <button
                            type="button"
                            onClick={() => selectProgramme(destination, programme)}
                            title={programme}
                            className="flex-1 min-w-0 text-left truncate"
                            aria-pressed={Boolean(isProgrammeSelected)}
                          >
                            {programme}
                          </button>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-1">
                            {programmeNode.count}
                          </span>
                        </div>

                        {programmeOpen && (
                          <div className="ml-3 pl-2 py-1 space-y-0.5 border-l border-slate-200 dark:border-white/10">
                            {programmeNode.visibleMissions.map((mission) => {
                              const isMissionSelected = activeFilters.mission === mission.name;
                              const missionExpanded = expandedMissions[mission.id] || false;
                              const isProvisional = mission.classification_status !== 'Verified';

                              return (
                                <div key={mission.id} className="rounded-md">
                                  <div className={`flex items-center gap-1 rounded-md px-1.5 py-1 ${
                                    isMissionSelected
                                      ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-900 dark:text-cyan-200'
                                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                                  }`}>
                                    <button
                                      type="button"
                                      disabled={!mission.hardware_count}
                                      onClick={() => toggle(setExpandedMissions, mission.id)}
                                      className="p-0.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-default"
                                      aria-label={`${missionExpanded ? 'Collapse' : 'Expand'} hardware for ${mission.name}`}
                                      aria-expanded={Boolean(missionExpanded)}
                                      title={mission.hardware_count ? `${mission.hardware_count} hardware record${mission.hardware_count === 1 ? '' : 's'}` : 'No hardware records'}
                                    >
                                      {missionExpanded
                                        ? <ChevronDown className="w-3 h-3" />
                                        : <ChevronRight className="w-3 h-3" />}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => selectMission(destination, programme, mission)}
                                      title={mission.name}
                                      className="flex-1 min-w-0 text-left truncate text-[11px]"
                                      aria-pressed={Boolean(isMissionSelected)}
                                    >
                                      {mission.name}
                                    </button>
                                    {isProvisional
                                      ? <HelpCircle className="w-3 h-3 text-amber-500 shrink-0" title="Provisional classification" />
                                      : <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" title="Verified classification" />}
                                    {mission.launch_date && (
                                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                                        {mission.launch_date.slice(0, 4)}
                                      </span>
                                    )}
                                  </div>

                                  {missionExpanded && mission.hardware.length > 0 && (
                                    <div className="ml-4 pl-2 py-1 space-y-1 border-l border-slate-200/80 dark:border-white/5">
                                      {mission.hardware.map((hardware) => {
                                        const status = hardware.operational_status || 'Unknown';
                                        const isVerified = (hardware.verification_status || '')
                                          .toLocaleLowerCase().includes('verified');
                                        const statusIcon = status.includes('Active')
                                          ? <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                                          : status.includes('Inactive')
                                            ? <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                            : <HelpCircle className="w-3 h-3 text-purple-500 shrink-0" />;

                                        return (
                                          <div key={hardware.id} className="rounded px-1 py-0.5">
                                            <Link
                                              to={`/hardware/${hardware.slug || hardware.id}`}
                                              onClick={() => onSelectHardware && onSelectHardware(hardware)}
                                              title={`Open ${hardware.name}`}
                                              className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300"
                                            >
                                              <Cpu className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400/60 shrink-0" />
                                              <span className="truncate">{hardware.name}</span>
                                              {isVerified
                                                ? <CheckCircle className="w-2.5 h-2.5 text-emerald-500 shrink-0" title={hardware.verification_status} />
                                                : <HelpCircle className="w-2.5 h-2.5 text-amber-500 shrink-0" title={hardware.verification_status || 'Verification status unavailable'} />}
                                            </Link>
                                            <div className="flex items-center gap-1.5 pl-4 mt-0.5">
                                              <button
                                                type="button"
                                                onClick={() => selectStatus(destination, programme, mission, status)}
                                                className="flex items-center gap-1 truncate text-[9px] text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300"
                                                title={`Filter by ${status}`}
                                              >
                                                {statusIcon}
                                                <span className="truncate">{status}</span>
                                              </button>
                                              <span className="text-slate-300 dark:text-slate-700">·</span>
                                              <button
                                                type="button"
                                                onClick={() => selectOrganization(
                                                  destination,
                                                  programme,
                                                  mission,
                                                  hardware.primary_organization,
                                                )}
                                                className="flex items-center gap-1 min-w-0 truncate text-[9px] text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300"
                                                title={`Filter by ${hardware.primary_organization}`}
                                              >
                                                <Building2 className="w-2.5 h-2.5 shrink-0" />
                                                <span className="truncate">{hardware.primary_organization}</span>
                                              </button>
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
            </section>
          );
        })}
      </div>

      <div className="pt-2.5 border-t border-slate-200/90 dark:border-white/10 mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Click a node to filter</span>
        <span className="text-cyan-600 dark:text-cyan-400 font-mono font-medium">Verified Archives</span>
      </div>
    </aside>
  );
}
