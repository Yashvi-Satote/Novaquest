import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Building2, 
  Orbit, 
  Clock, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export default function HardwareCard({ item }) {
  // Determine status badge
  const getStatusBadge = (status = '') => {
    if (status.includes('Active')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/50 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Active
        </span>
      );
    }
    if (status.includes('Inactive')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
          <Clock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/50">
        <HelpCircle className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
        Unknown
      </span>
    );
  };

  const getDestinationBadge = (dest) => {
    let color = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700";
    if (dest === "Mars") {
      color = "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/60";
    } else if (dest === "Moon") {
      color = "bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600/60";
    } else if (dest === "Deep Space") {
      color = "bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-800/60";
    } else if (dest === "Earth Orbit") {
      color = "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800/60";
    }

    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${color}`}>
        {dest}
      </span>
    );
  };

  // Build timeline text
  const getTimelineText = () => {
    let launch = item.launch_date ? `Launched ${item.launch_date}` : 'Launch unrecorded';
    if (item.decommission_date) {
      return `${launch} · End ${item.decommission_date}`;
    }
    if (item.landing_date) {
      return `${launch} · Landed ${item.landing_date}`;
    }
    if (item.operational_status?.includes('Active')) {
      return `${launch} · Operational`;
    }
    return `${launch}`;
  };

  const detailUrl = `/hardware/${item.slug || item.id}`;

  return (
    <Link 
      to={detailUrl}
      className="glass-panel glass-panel-hover rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between h-full bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
      id={`hardware-card-${item.id}`}
      aria-label={`View full dossier for ${item.name}`}
    >
      <div className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3.5">
        
        {/* Top Row: Destination + Object Type + Status Badge */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getDestinationBadge(item.destination)}
            <span className="text-[10px] font-mono text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-900/40 font-medium">
              {item.object_type}
            </span>
          </div>
          <div>
            {getStatusBadge(item.operational_status)}
          </div>
        </div>

        {/* Title: Hardware Name */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
            {item.name}
          </h3>
        </div>

        {/* Structured Metadata (Mission, Organization, Timeline) */}
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 truncate">
            <Orbit className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="truncate">
              Mission: <strong className="text-slate-800 dark:text-white font-medium">{item.mission_name || 'Independent'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate">
              Org: <strong className="text-slate-800 dark:text-white font-medium">{item.primary_organization || 'Space Agency'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{getTimelineText()}</span>
          </div>
        </div>

        {/* Short Description (Clamped to 2 lines for uniform grid height) */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed pt-0.5">
          {item.short_description}
        </p>

        {/* Card Footer: Clear Call to Action */}
        <div className="pt-3 mt-auto border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 group-hover:underline flex items-center gap-1">
            View Complete Dossier
          </span>
          <div className="p-1 rounded-lg text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 group-hover:translate-x-1 transition-all">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

      </div>
    </Link>
  );
}
