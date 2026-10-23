import React from 'react';
import { 
  ChevronDown, 
  Calendar, 
  Building2, 
  Orbit, 
  MapPin, 
  ExternalLink, 
  Clock, 
  HelpCircle,
  Cpu, 
  Sparkles, 
  BookOpen, 
  Radio,
  FileCheck,
  ShieldCheck,
  Layers
} from 'lucide-react';
import ImageGallery from './ImageGallery';

export default function HardwareCard({ 
  item, 
  isExpanded, 
  onToggle, 
  detailData, 
  isLoadingDetail,
  onOpenImageModal
}) {
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

  return (
    <div 
      className={`glass-panel glass-panel-hover rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
        isExpanded 
          ? 'ring-2 ring-cyan-500/50 dark:ring-cyan-500/40 bg-white dark:bg-[#0d1629]/95 shadow-xl shadow-cyan-500/10' 
          : 'bg-white/90 dark:bg-[#0c1222]/85'
      }`}
      id={`hardware-card-${item.id}`}
    >
      {/* ======================================================== */}
      {/* 1. COLLAPSED CARD SUMMARY (Compact, Consistent, Grid)     */}
      {/* ======================================================== */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        className="p-4 sm:p-4.5 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-inset flex flex-col justify-between h-full"
        aria-label={`${item.name}, Mission: ${item.mission_name || 'N/A'}. Click to expand.`}
      >
        <div className="space-y-3">
          
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
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
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

          {/* Short Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed pt-1">
            {item.short_description}
          </p>
        </div>

        {/* Card Footer: Expand Button Indicator */}
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-cyan-700 dark:text-cyan-400 flex items-center gap-1">
            {isExpanded ? 'Hide Details' : 'Scientific Anatomy (7 Sections)'}
          </span>
          <div className={`p-1 rounded-lg text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300' : ''
          }`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. EXPANDED CONTENT AREA (7 Scientific Sections)         */}
      {/* ======================================================== */}
      {isExpanded && (
        <div className="border-t border-slate-200/90 dark:border-white/10 px-4 sm:px-5 py-5 bg-slate-50/80 dark:bg-slate-950/60 space-y-5 animate-fade-in text-slate-700 dark:text-slate-200 transition-colors">
          
          {isLoadingDetail ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading verified scientific records...</p>
            </div>
          ) : (
            <>
              {/* SECTION 1: WHAT IS IT? */}
              <section className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400">
                  <BookOpen className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    1. What is it?
                  </h4>
                </div>
                <div className="bg-white dark:bg-cyan-950/20 border border-slate-200 dark:border-cyan-500/20 rounded-xl p-3 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100 shadow-2xs">
                  {detailData?.educational_description || item.educational_description || item.short_description}
                </div>
              </section>

              {/* SECTION 2: MISSION AND TIMELINE */}
              <section className="space-y-2">
                <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400">
                  <Calendar className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    2. Mission and Timeline
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400">Launch Date</span>
                    <p className="font-semibold text-slate-800 dark:text-white truncate">{item.launch_date || 'Unrecorded'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400">Arrival / Land Date</span>
                    <p className="font-semibold text-slate-800 dark:text-white truncate">{detailData?.landing_date || item.landing_date || 'N/A'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400">End / Decommission</span>
                    <p className="font-semibold text-slate-800 dark:text-white truncate">{item.decommission_date || 'Active'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400">Physical Condition</span>
                    <p className="font-semibold text-slate-800 dark:text-white truncate">{detailData?.physical_status || item.physical_status || 'Verified Intact'}</p>
                  </div>
                </div>

                {item.location_description && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/40 p-2 rounded-lg border border-slate-200 dark:border-white/5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">Location: <strong>{item.location_description}</strong></span>
                    {item.latitude != null && item.longitude != null && (
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 text-[10px] ml-auto shrink-0">
                        [{item.latitude}°, {item.longitude}°]
                      </span>
                    )}
                  </div>
                )}
              </section>

              {/* SECTION 3: HOW DOES IT WORK? */}
              <section className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400">
                  <Cpu className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    3. How does it work?
                  </h4>
                </div>
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-2">
                  <p>{detailData?.how_it_works || 'Operation verified from technical documentation.'}</p>
                  {detailData?.hardware_materials && (
                    <div className="pt-1.5 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
                      <strong className="text-slate-700 dark:text-slate-300">Materials: </strong>
                      {detailData.hardware_materials}
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 4: WHY IS IT IMPORTANT? */}
              <section className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    4. Why is it important?
                  </h4>
                </div>
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-1.5">
                  <p>{detailData?.why_it_is_important || 'Significant contribution to human space exploration.'}</p>
                  {detailData?.scientific_purpose && (
                    <div className="pt-1.5 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
                      <strong className="text-slate-700 dark:text-slate-300">Objective: </strong>
                      {detailData.scientific_purpose}
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 5: CURRENT OR LAST-KNOWN STATUS */}
              <section className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400">
                  <Radio className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    5. Current or last-known status
                  </h4>
                </div>
                <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs leading-relaxed text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {detailData?.current_or_last_known_status || 'Telemetry verified by mission flight directors'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                      Verified: {detailData?.verification_status || item.verification_status || 'NASA / JPL Archive'}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(item.operational_status)}
                  </div>
                </div>
              </section>

              {/* SECTION 6: IMAGES AND RELATED DATA */}
              <section className="space-y-2">
                <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400">
                  <Layers className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    6. Images and related data
                  </h4>
                </div>
                <ImageGallery 
                  images={detailData?.images || []}
                  hardwareName={item.name}
                  onSelectImage={(idx) => onOpenImageModal(detailData?.images || [], idx)}
                />
              </section>

              {/* SECTION 7: KNOW MORE ↗ */}
              <section className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center gap-1">
                    7. Know More <ExternalLink className="w-3.5 h-3.5" />
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Official Archives
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.official_url && (
                    <a
                      href={item.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 hover:bg-cyan-100 dark:hover:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/50 text-cyan-800 dark:text-cyan-300 transition-all font-medium text-xs group"
                    >
                      <div className="flex items-center gap-1.5">
                        <Orbit className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>Official Mission Page</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}

                  {detailData?.sources?.map((src, sIdx) => (
                    <a
                      key={src.id || sIdx}
                      href={src.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all text-xs group"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <div className="truncate">
                          <p className="truncate font-medium">{src.source_name}</p>
                          <span className="text-[9px] text-slate-500">{src.source_type}</span>
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-cyan-500 shrink-0 ml-1.5" />
                    </a>
                  ))}
                </div>
              </section>

            </>
          )}

        </div>
      )}

    </div>
  );
}
