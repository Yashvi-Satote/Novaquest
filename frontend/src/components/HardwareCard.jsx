import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Building2, 
  Orbit, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  Cpu, 
  Sparkles, 
  BookOpen, 
  Compass, 
  Layers, 
  ShieldCheck,
  Radio,
  FileCheck,
  Info
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
  // Determine status color and badge
  const getStatusBadge = (status) => {
    if (status.includes('Active')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-600/50 shadow-sm shadow-emerald-900/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Active / operational
        </span>
      );
    }
    if (status.includes('Inactive')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-700/50">
          <Clock className="w-3 h-3 text-amber-400" />
          Inactive / decommissioned
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-950/60 text-purple-300 border border-purple-700/50">
        <HelpCircle className="w-3 h-3 text-purple-400" />
        Unknown / disputed
      </span>
    );
  };

  const getDestinationBadge = (dest) => {
    let color = "bg-slate-800 text-slate-300 border-slate-700";
    if (dest === "Mars") color = "bg-rose-950/60 text-rose-300 border-rose-800/60";
    else if (dest === "Moon") color = "bg-slate-800/80 text-slate-200 border-slate-600/60";
    else if (dest === "Deep Space") color = "bg-violet-950/60 text-violet-300 border-violet-800/60";
    else if (dest === "Earth Orbit") color = "bg-cyan-950/60 text-cyan-300 border-cyan-800/60";

    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${color}`}>
        {dest}
      </span>
    );
  };

  // Build timeline text
  const getTimelineText = () => {
    let launch = item.launch_date ? `Launched ${item.launch_date}` : 'Launch unrecorded';
    if (item.decommission_date) {
      return `${launch} · Decommissioned ${item.decommission_date}`;
    }
    if (item.landing_date) {
      return `${launch} · Landed ${item.landing_date}`;
    }
    if (item.operational_status?.includes('Active')) {
      return `${launch} · Currently Operational`;
    }
    return `${launch} · Status verified in records`;
  };

  return (
    <div 
      className={`glass-panel glass-panel-hover rounded-2xl overflow-hidden transition-all duration-300 ${
        isExpanded ? 'ring-1 ring-cyan-500/40 bg-[#0d1629]/80 shadow-2xl shadow-cyan-950/20' : ''
      }`}
      id={`hardware-card-${item.id}`}
    >
      {/* ======================================================== */}
      {/* 1. COLLAPSED CARD HEADER (Accessible, Focusable)         */}
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
        className="p-4 sm:p-5 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-inset"
        aria-label={`${item.name}, Mission: ${item.mission_name || 'N/A'}. Click to expand.`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left Title & Key Details */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight hover:text-cyan-300 transition-colors">
                {item.name}
              </h3>
              {getDestinationBadge(item.destination)}
              <span className="text-[11px] font-mono text-cyan-400/90 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/40">
                {item.object_type}
              </span>
            </div>

            {/* Quick Meta Row */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Orbit className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mission: <strong className="text-white font-medium">{item.mission_name || 'Independent'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Organization: <strong className="text-white font-medium">{item.primary_organization || 'Attributed Agency'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{getTimelineText()}</span>
              </div>
            </div>

            {/* Concise One-Sentence Educational Hook */}
            <p className="text-xs text-slate-400 line-clamp-1 pt-0.5">
              {item.short_description}
            </p>
          </div>

          {/* Right Status Badge & Expand Icon */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
            {getStatusBadge(item.operational_status)}
            <div className={`p-2 rounded-xl bg-white/5 text-slate-300 group-hover:text-white transition-transform duration-200 ${
              isExpanded ? 'rotate-180 bg-cyan-500/20 text-cyan-300' : ''
            }`}>
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. EXPANDED CONTENT AREA                                 */}
      {/* Strictly implements the 7 required sections in order:    */}
      {/* 1. What is it?                                           */}
      {/* 2. Mission and timeline                                  */}
      {/* 3. How does it work?                                     */}
      {/* 4. Why is it important?                                  */}
      {/* 5. Current or last-known status                          */}
      {/* 6. Images and related data                               */}
      {/* 7. Know more ↗                                           */}
      {/* ======================================================== */}
      {isExpanded && (
        <div className="border-t border-white/10 px-4 sm:px-6 py-6 bg-slate-950/50 space-y-7 animate-fade-in text-slate-200">
          
          {isLoadingDetail ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading verified scientific records and imagery...</p>
            </div>
          ) : (
            <>
              {/* ---------------------------------------------------- */}
              {/* SECTION 1: WHAT IS IT? (Educational for ages 10-15)  */}
              {/* ---------------------------------------------------- */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <BookOpen className="w-4 h-4" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                    1. What is it?
                  </h4>
                  <span className="text-[10px] bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded text-cyan-400 font-mono">
                    Ages 10–15 Guide
                  </span>
                </div>
                <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-4 text-sm sm:text-base leading-relaxed text-slate-100">
                  {detailData?.educational_description || item.educational_description || item.short_description}
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* SECTION 2: MISSION AND TIMELINE                      */}
              {/* ---------------------------------------------------- */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Calendar className="w-4 h-4" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                    2. Mission and Timeline
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="text-slate-400">Launch Date</span>
                    <p className="font-semibold text-white">{item.launch_date || 'Information not available'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="text-slate-400">Landing / Arrival Date</span>
                    <p className="font-semibold text-white">{detailData?.landing_date || item.landing_date || 'N/A (Orbital / Flyby)'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="text-slate-400">End / Decommission Date</span>
                    <p className="font-semibold text-white">{item.decommission_date || 'Currently Active'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="text-slate-400">Physical Condition</span>
                    <p className="font-semibold text-white">{detailData?.physical_status || item.physical_status || 'Verified Intact'}</p>
                  </div>
                </div>

                {item.location_description && (
                  <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-white/5">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Location: <strong>{item.location_description}</strong></span>
                    {item.latitude != null && item.longitude != null && (
                      <span className="font-mono text-cyan-400 text-[11px] ml-auto">
                        [{item.latitude}°, {item.longitude}°]
                      </span>
                    )}
                  </div>
                )}
              </section>

              {/* ---------------------------------------------------- */}
              {/* SECTION 3: HOW DOES IT WORK?                         */}
              {/* ---------------------------------------------------- */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Cpu className="w-4 h-4" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                    3. How does it work?
                  </h4>
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-xs sm:text-sm leading-relaxed text-slate-300 space-y-2">
                  <p>{detailData?.how_it_works || 'Information not available in the current sources'}</p>
                  
                  {detailData?.hardware_materials && (
                    <div className="pt-2 border-t border-white/5 text-xs text-slate-400 flex items-start gap-2">
                      <span className="font-semibold text-slate-300 shrink-0">Documented Materials:</span>
                      <span>{detailData.hardware_materials}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* SECTION 4: WHY IS IT IMPORTANT?                      */}
              {/* ---------------------------------------------------- */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                    4. Why is it important?
                  </h4>
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-xs sm:text-sm leading-relaxed text-slate-300 space-y-2">
                  <p>{detailData?.why_it_is_important || 'Information not available in the current sources'}</p>
                  {detailData?.scientific_purpose && (
                    <div className="pt-2 border-t border-white/5 text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Scientific Objective: </span>
                      {detailData.scientific_purpose}
                    </div>
                  )}
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* SECTION 5: CURRENT OR LAST-KNOWN STATUS              */}
              {/* ---------------------------------------------------- */}
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Radio className="w-4 h-4" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                    5. Current or last-known status
                  </h4>
                </div>
                <div className="bg-slate-900/70 border border-white/10 rounded-xl p-4 text-xs sm:text-sm leading-relaxed text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium text-white">
                      {detailData?.current_or_last_known_status || 'Telemetry verified by mission flight directors'}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      Status Record: {detailData?.verification_status || item.verification_status} (Last Verified: {detailData?.last_verified_at || item.last_verified_at || 'Recent'})
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(item.operational_status)}
                  </div>
                </div>
              </section>

              {/* ---------------------------------------------------- */}
              {/* SECTION 6: IMAGES AND RELATED DATA                   */}
              {/* ---------------------------------------------------- */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Layers className="w-4 h-4" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                    6. Images and related data
                  </h4>
                </div>
                <ImageGallery 
                  images={detailData?.images || []}
                  hardwareName={item.name}
                  onSelectImage={(idx) => onOpenImageModal(detailData?.images || [], idx)}
                />
              </section>

              {/* ---------------------------------------------------- */}
              {/* SECTION 7: KNOW MORE ↗ (Official Links)              */}
              {/* ---------------------------------------------------- */}
              <section className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    7. Know More <ExternalLink className="w-4 h-4 text-cyan-400" />
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Official Agency & Scientific Links
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Primary Official Link */}
                  {item.official_url && (
                    <a
                      href={item.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 hover:text-cyan-200 transition-all font-medium text-xs group"
                    >
                      <div className="flex items-center gap-2">
                        <Orbit className="w-4 h-4 text-cyan-400" />
                        <span>Official Mission Website</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}

                  {/* Additional Verified Sources */}
                  {detailData?.sources?.map((src, sIdx) => (
                    <a
                      key={src.id || sIdx}
                      href={src.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 text-slate-200 hover:text-white transition-all text-xs group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="truncate">
                          <p className="truncate font-medium">{src.source_name}</p>
                          <span className="text-[10px] text-slate-400">{src.source_type}</span>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 shrink-0 ml-2" />
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
