import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  ExternalLink, 
  Calendar, 
  Building2, 
  Sparkles, 
  BookOpen, 
  FileCheck, 
  AlertTriangle, 
  Radio,
  Orbit,
  Compass,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Crosshair,
  ChevronDown,
  ChevronUp,
  Camera,
  Eye
} from 'lucide-react';
import { fetchHardwareDetail } from '../../services/api';
import { getMappedSpacecraft, classifyCatalogueRecord } from './spacecraftRegistry';
import { getSpacecraftCategoryIcon, getCategoryBadgeStyle } from './spacecraftIcons';
import { getSpacecraftModelSpec } from './spacecraftModelRegistry';

export default function MissionDetailDrawer({
  selectedSlug,
  onClose,
  onEnterVoyagerLocal,
  isVoyagerLocalMode,
  onFocusSpacecraft,
  onExploreSurface
}) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);

  useEffect(() => {
    if (!selectedSlug) {
      setDetail(null);
      return;
    }

    let isMounted = true;
    setDetail(null);
    setImageError(false);
    setIsOverviewExpanded(false);

    async function loadDetail() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchHardwareDetail(selectedSlug);
        if (isMounted) {
          setDetail(data);
        }
      } catch (err) {
        console.error('Failed to load hardware detail:', err);
        if (isMounted) {
          setError('Failed to fetch detailed mission telemetry.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();
    return () => { isMounted = false; };
  }, [selectedSlug]);

  if (!selectedSlug) return null;

  // Retrieve verified telemetry mapping if available
  const verified = getMappedSpacecraft(selectedSlug);
  const isMapped = Boolean(verified);
  const classification = classifyCatalogueRecord(detail || { slug: selectedSlug });

  const objectType = detail?.object_type || verified?.type || 'Spacecraft';
  const badgeStyle = getCategoryBadgeStyle(objectType);

  // Determine official image URL and attribution
  const imageUrl = (!imageError && (detail?.preview_image || verified?.image)) || null;
  const imageCaption = detail?.preview_image_caption || verified?.imageCaption || `${detail?.name || verified?.name} Spacecraft`;
  const imageAttribution = verified?.imageAttribution || (detail?.sources && detail.sources[0]?.source_name) || 'Official Space Agency Archive';
  const modelSpec = getSpacecraftModelSpec(selectedSlug);

  return (
    <aside 
      className="absolute top-16 right-4 z-30 w-72 sm:w-88 md:w-96 max-h-[calc(100vh-130px)] overflow-y-auto bg-[#0a071c]/92 backdrop-blur-2xl border border-purple-500/25 rounded-2xl shadow-2xl shadow-purple-950/60 p-4 sm:p-5 text-white animate-fadeIn flex flex-col gap-4 font-sans no-scrollbar"
      role="dialog"
      aria-label="Mission Telemetry Details"
    >
      
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-3 border-b border-purple-500/20 pb-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span 
              className={`w-2 h-2 rounded-full ${detail?.operational_status?.includes('Active') ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} 
              title={detail?.operational_status || 'Operational Status'}
            />
            {/* Category Icon & Badge (Objective 1) */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold uppercase tracking-wider ${badgeStyle.badgeClass}`}>
              {getSpacecraftCategoryIcon(objectType, 'w-3 h-3')}
              <span>{badgeStyle.label}</span>
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight truncate">
            {detail?.name || verified?.name || selectedSlug}
          </h2>

          <p className="text-xs text-slate-300 truncate">
            Mission: <span className="text-purple-200 font-semibold">{detail?.mission_name || verified?.mission || 'Autonomous'}</span>
          </p>
        </div>

        <button
          type="button"
          id="drawer-close-btn"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-950/60 border border-transparent hover:border-purple-500/30 transition-colors cursor-pointer shrink-0"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-10 space-y-2">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-purple-300 font-mono">Accessing mission telemetry...</p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {detail && (
        <>
          {/* Spacecraft / Mission Image Stage (Objective 3) */}
          <div className="relative rounded-xl overflow-hidden border border-purple-500/25 bg-slate-950 shadow-inner group">
            {imageUrl ? (
              <div className="relative h-44 w-full bg-slate-950">
                <img
                  src={imageUrl}
                  alt={imageCaption}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a071c] via-transparent to-transparent opacity-90" />
                
                {/* Image Attribution Tag */}
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[9px] font-mono text-slate-300">
                  <span className="truncate max-w-[200px] text-white font-medium drop-shadow-md">
                    {imageCaption}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-cyan-300 shrink-0">
                    {imageAttribution}
                  </span>
                </div>
              </div>
            ) : (
              /* Designed Scientific Fallback Badge (Objective 3) */
              <div className="h-36 w-full bg-gradient-to-br from-purple-950/50 via-[#0d0922] to-slate-950 flex flex-col items-center justify-center p-4 text-center border border-dashed border-purple-500/20">
                <div className="w-12 h-12 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-cyan-300 mb-2 shadow-lg shadow-purple-950/40">
                  {getSpacecraftCategoryIcon(objectType, 'w-6 h-6')}
                </div>
                <span className="text-xs font-bold text-white tracking-wide">
                  {detail.name || verified?.name}
                </span>
                <span className="text-[10px] text-purple-300 font-mono mt-0.5">
                  Target: {detail.destination} • Official Telemetry Monitored
                </span>
                <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                  <Camera className="w-3 h-3 text-slate-500" />
                  <span>Archival Visual Insignia</span>
                </div>
              </div>
            )}
          </div>

          {/* Spacecraft 3D Model Provenance Badge */}
          {modelSpec && (
            <div className={`p-3 rounded-xl border text-xs font-mono space-y-1 shadow-sm ${
              modelSpec.isAuthenticModel 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {modelSpec.isAuthenticModel ? 'Authentic 3D Model' : 'Illustrative 3D Model'}
                </span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-black/40 border border-current font-bold">
                  {modelSpec.isAuthenticModel ? 'NASA Verified' : 'Procedural Fallback'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-tight">
                {modelSpec.provenance}
              </p>
            </div>
          )}

          {/* Primary Action Deck (Focus on Map & Voyager Proximity) */}
          <div className="flex flex-col gap-2">
            <Link
              to={`/spacecraft/${selectedSlug}`}
              id="drawer-open-spacecraft-page-btn"
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 border border-purple-400/40 cursor-pointer active:scale-98"
              title="Open full interactive 3D model & mission detail page"
            >
              <Eye className="w-4 h-4 text-cyan-200" />
              <span>Inspect 3D Spacecraft Model Page →</span>
            </Link>

            {isMapped && onFocusSpacecraft && (
              <button
                type="button"
                id="drawer-focus-btn"
                onClick={() => onFocusSpacecraft(selectedSlug)}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-600/30 border border-cyan-400/40 cursor-pointer active:scale-98"
                title="Focus camera onto this spacecraft's plotted position"
              >
                <Crosshair className="w-3.5 h-3.5 text-cyan-200" />
                <span>Center Camera on {detail.name}</span>
              </button>
            )}

            {/* Surface Landing Site Exploration Action */}
            {verified?.positionType === 'surface' && verified?.coordinates && onExploreSurface && (
              <button
                type="button"
                id="drawer-surface-btn"
                onClick={() => onExploreSurface(selectedSlug)}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs transition-all shadow-md shadow-amber-600/30 border border-amber-400/40 cursor-pointer active:scale-98"
                title="Glide camera down to local surface terrain and landing site"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-200" />
                <span>Explore Surface Landing Site</span>
              </button>
            )}

            {/* Dedicated Voyager 1 Local Proximity Sphere Action Card */}
            {selectedSlug === 'voyager-1' && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-950/90 to-indigo-950/90 border border-cyan-400/40 space-y-2 shadow-lg shadow-purple-950/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Orbit className="w-4 h-4 text-cyan-400" />
                    Voyager 1 Proximity Sphere
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/30 text-[10px] text-cyan-200 font-mono font-bold">
                    1,000 km Radius
                  </span>
                </div>
                <p className="text-[11px] text-purple-200/90 leading-relaxed font-sans">
                  Transparent 1,000 km sphere centered on Voyager 1 in the local interstellar medium (ISM) with coordinate reference axes, range rings, and detailed spacecraft structure.
                </p>
                <button
                  type="button"
                  onClick={onEnterVoyagerLocal}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{isVoyagerLocalMode ? 'Recenter 1,000 km Sphere' : 'Enter 1,000 km Proximity Sphere'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Position & Telemetry Verification Box (Objectives 1, 2, 4, 5) */}
          <div className="rounded-xl p-3.5 bg-purple-950/30 border border-purple-500/20 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Coordinate Regime:
              </span>
              <span className={`font-bold flex items-center gap-1 ${isMapped ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isMapped ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> 3D Plotted
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" /> Unmapped Coordinates
                  </>
                )}
              </span>
            </div>

            {/* CASE 1: VERIFIED MAPPED OBJECT */}
            {isMapped && verified ? (
              <div className="bg-[#070514]/90 rounded-lg p-3 space-y-2 font-mono text-xs border border-cyan-500/25">
                {/* Surface Location */}
                {verified.positionType === 'surface' && verified.coordinates && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" /> Surface Site:
                      </span>
                      <span className="text-amber-300 font-semibold">
                        {verified.coordinates.lat.toFixed(4)}°N, {verified.coordinates.lon.toFixed(4)}°E
                      </span>
                    </div>
                    <div className="text-[11px] text-purple-200/90 pt-1 border-t border-white/5">
                      {verified.coordinates.siteName}
                    </div>
                  </>
                )}

                {/* Interstellar Trajectory */}
                {verified.positionType === 'interstellar' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Solar Distance:</span>
                      <span className="text-cyan-300 font-semibold">{verified.distanceAU} AU ({verified.distanceKm || 'Interstellar'})</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-slate-400">Escape Heading:</span>
                      <span className="text-white font-medium">{verified.constellation}</span>
                    </div>
                    {verified.speedKmS && (
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-slate-400">Asymptotic Speed:</span>
                        <span className="text-emerald-300 font-semibold">{verified.speedKmS} km/s</span>
                      </div>
                    )}
                  </>
                )}

                {/* Orbital Spacecraft */}
                {(verified.positionType === 'geocentric_orbit' || verified.positionType === 'geocentric_halo' || verified.positionType === 'planetary_orbit') && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Primary Body:</span>
                      <span className="text-cyan-300 font-semibold uppercase">{verified.referenceBody}</span>
                    </div>
                    {verified.orbitalParams && (
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-slate-400">Orbit Ephemeris:</span>
                        <span className="text-white font-medium">
                          {verified.orbitalParams.altitudeKm ? `Alt ~${verified.orbitalParams.altitudeKm} km` : (verified.orbitalParams.distanceKm ? `Dist ~${(verified.orbitalParams.distanceKm / 1e6).toFixed(1)}M km` : 'Operational Orbit')}
                          {verified.orbitalParams.inclinationDeg !== undefined ? `, inc ${verified.orbitalParams.inclinationDeg}°` : ''}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Heliocentric Deep Space Probes */}
                {verified.positionType === 'heliocentric' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Heliocentric Distance:</span>
                      <span className="text-cyan-300 font-semibold">{verified.distanceAU ? `${verified.distanceAU} AU` : (verified.coordinates?.rAU ? `${verified.coordinates.rAU} AU` : 'Interplanetary')}</span>
                    </div>
                    {verified.speedKmS && (
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-slate-400">Orbital Speed:</span>
                        <span className="text-white font-medium">{verified.speedKmS} km/s</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Coordinate Reference Frame & Epoch (Objective 2 & 5) */}
                <div className="pt-2 border-t border-white/5 space-y-1 text-[10px]">
                  <div className="flex items-start justify-between gap-1 text-slate-300">
                    <span className="text-slate-400 shrink-0">Frame:</span>
                    <span className="text-right truncate">{verified.referenceFrame}</span>
                  </div>
                  <div className="flex items-start justify-between gap-1 text-slate-300">
                    <span className="text-slate-400 shrink-0 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-cyan-400" /> Epoch:
                    </span>
                    <span className="text-right truncate">{verified.timestamp}</span>
                  </div>
                  <div className="flex items-start justify-between gap-1 text-slate-300">
                    <span className="text-slate-400 shrink-0 flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> Source:
                    </span>
                    <span className="text-right text-emerald-300 truncate">{verified.dataSource}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* CASE 2: UNMAPPED RECORD (Objective 4 & 6) */
              <div className="bg-[#070514]/90 rounded-lg p-3 text-xs border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Coordinates Unavailable in Official Archive</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Exact landing or orbital coordinates for this record are not verified in official space agency ephemerides. 
                  Target destination: <span className="text-cyan-300 font-semibold">{detail.destination}</span>.
                </p>
                {classification?.unmappedReason && (
                  <div className="text-[11px] text-slate-400 font-sans">
                    {classification.unmappedReason}
                  </div>
                )}
                <div className="p-2 rounded bg-purple-950/30 border border-white/5 text-[10px] text-slate-400 font-mono">
                  SCIENTIFIC NOTE: In accordance with scientific integrity guidelines, this record is NOT assigned fabricated or arbitrary coordinates. Camera position is preserved.
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5 font-mono">
                  <span>Archive: {detail.verification_status || 'Official Agency Record'}</span>
                  <span>Checked: {detail.last_verified_at || 'Archival'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-purple-950/25 p-2.5 rounded-xl border border-purple-500/15">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                <Building2 className="w-3 h-3 text-purple-400" /> Agency
              </span>
              <p className="font-semibold text-slate-100 truncate">{detail.primary_organization || 'Unassigned'}</p>
            </div>
            <div className="bg-purple-950/25 p-2.5 rounded-xl border border-purple-500/15">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                <Calendar className="w-3 h-3 text-cyan-400" /> Launch Date
              </span>
              <p className="font-semibold text-slate-100">{detail.launch_date || 'Unknown'}</p>
            </div>
          </div>

          {/* Educational Overview (Concise with Expand Option) (Objective 4) */}
          {detail.educational_description && (
            <div className="space-y-1.5 text-xs">
              <h3 className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Mission Overview
              </h3>
              <div className="bg-purple-950/20 p-3 rounded-xl border border-purple-500/15 text-slate-300 leading-relaxed font-sans text-xs">
                <p className={isOverviewExpanded ? '' : 'line-clamp-3'}>
                  {detail.educational_description}
                </p>
                {detail.educational_description.length > 180 && (
                  <button
                    type="button"
                    onClick={() => setIsOverviewExpanded(prev => !prev)}
                    className="mt-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {isOverviewExpanded ? (
                      <>Show Less <ChevronUp className="w-3 h-3" /></>
                    ) : (
                      <>Read Full Overview <ChevronDown className="w-3 h-3" /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Scientific Purpose (Objective 4) */}
          {detail.scientific_purpose && (
            <div className="space-y-1.5 text-xs">
              <h3 className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Scientific Objectives
              </h3>
              <p className="text-slate-300 leading-relaxed font-sans bg-purple-950/20 p-3 rounded-xl border border-purple-500/15 text-xs">
                {detail.scientific_purpose}
              </p>
            </div>
          )}

          {/* Official Source Citations (Objective 4) */}
          {detail.sources && detail.sources.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> Primary Archive Citations
              </h3>
              <div className="space-y-1">
                {detail.sources.map(src => (
                  <a
                    key={src.id}
                    href={src.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-purple-950/30 hover:bg-purple-900/40 text-slate-300 hover:text-white border border-purple-500/15 transition-colors text-[11px]"
                  >
                    <span className="truncate max-w-[280px]">{src.source_name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Link to Full Catalogue Spec Page (Objective 4) */}
          <div className="pt-1">
            <Link
              id="drawer-hardware-profile-link"
              to={`/hardware/${detail.slug}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 hover:text-white border border-purple-500/30 text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <span>Open Complete Hardware Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      )}

    </aside>
  );
}
