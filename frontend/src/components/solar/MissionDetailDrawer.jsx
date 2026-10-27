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
  Radio 
} from 'lucide-react';
import { fetchHardwareDetail } from '../../services/api';

export default function MissionDetailDrawer({
  selectedSlug,
  onClose
}) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedSlug) return;

    let isMounted = true;
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

  const hasSurfaceCoords = detail?.latitude !== null && detail?.longitude !== null && detail?.latitude !== undefined;
  const isDeepSpace = (detail?.destination_category || detail?.destination) === 'Deep Space';

  return (
    <aside className="absolute top-16 right-4 z-30 w-72 sm:w-88 md:w-96 max-h-[calc(100vh-130px)] overflow-y-auto bg-slate-950/75 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-5 text-white animate-fadeIn flex flex-col gap-4 font-sans">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${detail?.operational_status?.includes('Active') ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono font-semibold">
              {detail?.object_type || 'Spacecraft Telemetry'}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
            {detail?.name || selectedSlug}
          </h2>
          <p className="text-xs text-slate-400">
            Mission: <span className="text-slate-200 font-semibold">{detail?.mission_name || 'Autonomous'}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-10 space-y-2">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Accessing mission telemetry...</p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {detail && (
        <>
          {/* Position & Telemetry Verification Box - Requirement #4 */}
          <div className="rounded-xl p-3.5 bg-slate-900/90 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Position Classification:
              </span>
              <span className="text-cyan-300 font-bold">
                {hasSurfaceCoords ? 'Verified Surface Site' : isDeepSpace ? 'Interstellar Regime' : 'Unmapped Coordinates'}
              </span>
            </div>

            {hasSurfaceCoords ? (
              <div className="bg-slate-950/80 rounded-lg p-2.5 space-y-1 font-mono text-xs border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="text-white font-semibold">{detail.latitude.toFixed(4)}°N, {detail.longitude.toFixed(4)}°E</span>
                </div>
                <div className="flex items-start justify-between gap-2 pt-1 border-t border-white/5">
                  <span className="text-slate-400 shrink-0">Site:</span>
                  <span className="text-slate-200 text-right">{detail.location_description || 'Surface site recorded'}</span>
                </div>
              </div>
            ) : isDeepSpace ? (
              <div className="bg-slate-950/80 rounded-lg p-2.5 space-y-1 font-mono text-xs border border-amber-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Trajectory Regime:</span>
                  <span className="text-amber-300 font-semibold">{detail.physical_status || 'Escaping Solar System'}</span>
                </div>
                <div className="text-[11px] text-slate-300 pt-1 border-t border-white/5">
                  {detail.location_description || 'Active deep space telemetry path.'}
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/80 rounded-lg p-2.5 text-xs border border-slate-700/50 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-semibold">Coordinates Unavailable in Archive</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Exact landing or orbital coordinates for this record are not verified in official records. 
                  Target destination: <span className="text-slate-200 font-semibold">{detail.destination}</span>.
                </p>
              </div>
            )}

            {/* Verification Metadata */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
              <span>Status: {detail.verification_status || 'Verified from Official Archives'}</span>
              {detail.last_verified_at && <span>Checked: {detail.last_verified_at}</span>}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                <Building2 className="w-3 h-3 text-cyan-400" /> Agency
              </span>
              <p className="font-semibold text-slate-200 truncate">{detail.primary_organization || 'Unassigned'}</p>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                <Calendar className="w-3 h-3 text-cyan-400" /> Launch Date
              </span>
              <p className="font-semibold text-slate-200">{detail.launch_date || 'Unknown'}</p>
            </div>
          </div>

          {/* Educational Overview */}
          {detail.educational_description && (
            <div className="space-y-1 text-xs">
              <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Overview & Historical Journey
              </h3>
              <p className="text-slate-300 leading-relaxed font-sans bg-slate-900/40 p-3 rounded-xl border border-white/5">
                {detail.educational_description}
              </p>
            </div>
          )}

          {/* Scientific Purpose */}
          {detail.scientific_purpose && (
            <div className="space-y-1 text-xs">
              <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Scientific Mission Purpose
              </h3>
              <p className="text-slate-300 leading-relaxed font-sans bg-slate-900/40 p-3 rounded-xl border border-white/5">
                {detail.scientific_purpose}
              </p>
            </div>
          )}

          {/* Official Source Citations */}
          {detail.sources && detail.sources.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Primary Sources
              </h3>
              <div className="space-y-1">
                {detail.sources.map(src => (
                  <a
                    key={src.id}
                    href={src.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition-colors text-[11px]"
                  >
                    <span className="truncate max-w-[280px]">{src.source_name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Link to Full Catalogue Spec Page */}
          <div className="pt-2">
            <Link
              to={`/hardware/${detail.slug}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <span>Explore Complete Hardware Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      )}

    </aside>
  );
}
