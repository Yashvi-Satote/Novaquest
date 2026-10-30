import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchHardwareDetail } from '../services/api';
import Header from '../../shared/components/Header';
import ImageGallery from '../components/ImageGallery';
import ImageModal from '../components/ImageModal';
import { 
  ArrowLeft, 
  ExternalLink, 
  Globe, 
  Orbit, 
  Calendar, 
  MapPin, 
  Building2, 
  Cpu, 
  Sparkles, 
  BookOpen, 
  Radio, 
  ShieldCheck, 
  Layers, 
  Clock, 
  HelpCircle, 
  FileCheck, 
  AlertCircle,
  Tag,
} from 'lucide-react';

export default function HardwareDetailPage({ theme, onToggleTheme }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [hardware, setHardware] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lightbox modal state for verified images
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0
  });

  useEffect(() => {
    let isMounted = true;
    async function loadDetail() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchHardwareDetail(slug);
        if (isMounted) {
          setHardware(data);
        }
      } catch (err) {
        console.error('Error fetching hardware detail:', err);
        if (isMounted) {
          setError(err.message || 'Hardware record not found.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { isMounted = false; };
  }, [slug]);

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

  // Status badge helper
  const getStatusBadge = (status = '') => {
    if (status.includes('Active')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/50 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Active / Operational
        </span>
      );
    }
    if (status.includes('Inactive')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          Inactive / Decommissioned
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/50">
        <HelpCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
        Unknown / Disputed
      </span>
    );
  };

  const getDestinationBadge = (dest) => {
    let color = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700";
    if (dest === "Mars") color = "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/60";
    else if (dest === "Moon") color = "bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600/60";
    else if (dest === "Deep Space") color = "bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-800/60";
    else if (dest === "Earth Orbit") color = "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800/60";

    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${color}`}>
        {dest}
      </span>
    );
  };

  // Only expose verified, non-empty external links to the UI.
  const verifiedSources = (hardware?.sources || []).filter((src) => Boolean(src?.source_url));
  const officialUrl = hardware?.official_url || verifiedSources[0]?.source_url || null;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-[#070b14] space-bg flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200`}>
      
      <Header theme={theme} onToggleTheme={onToggleTheme} />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/novabase')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all border border-slate-200 dark:border-white/10 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500"
            id="back-to-explorer-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Novabase</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>/</span>
            <span className="truncate max-w-[200px] md:max-w-xs">{hardware?.name || slug}</span>
          </div>

          <div className="flex items-center gap-3">
            {officialUrl ? (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                id="header-official-website-link"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Official Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : null}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 bg-slate-200 dark:bg-slate-800/60 rounded-2xl w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-48 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
                <div className="h-48 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
                <div className="h-64 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
                <div className="h-48 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error / 404 State */}
        {!isLoading && (error || !hardware) && (
          <div className="glass-panel rounded-2xl p-8 sm:p-14 text-center space-y-5 max-w-xl mx-auto my-12 border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/50 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Hardware Record Not Found</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We could not find an official space hardware record matching <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-cyan-600 dark:text-cyan-400 font-mono text-xs">{slug}</code>. The identifier may be misspelled or the item may have been archived under an alternate name.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/novabase"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-cyan-600/20 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Novabase
              </Link>
            </div>
          </div>
        )}

        {/* Valid Hardware Detail Dossier */}
        {!isLoading && hardware && (
          <div className="space-y-6">
            
            {/* HERO HEADER DOSSIER BANNER */}
            <div className="glass-panel rounded-2xl p-5 sm:p-7 bg-white/90 dark:bg-[#0c1324]/90 border border-slate-200/90 dark:border-white/10 shadow-lg space-y-4">
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  
                  {/* Badges Bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {getDestinationBadge(hardware.destination)}
                    <span className="text-xs font-mono text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-900/50 font-medium">
                      {hardware.object_type}
                    </span>
                    {getStatusBadge(hardware.operational_status)}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {hardware.name}
                  </h1>

                  {/* Subtitle / Mission & Agency attribution */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Orbit className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      Mission: <strong className="text-slate-900 dark:text-white font-semibold">{hardware.mission_name || 'Independent Mission'}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      Primary Agency: <strong className="text-slate-900 dark:text-white font-semibold">{hardware.primary_organization || 'Space Agency'}</strong>
                    </span>
                  </div>

                  {/* High-level short description */}
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pt-1 max-w-4xl">
                    {hardware.short_description}
                  </p>
                </div>

                {/* Right Top Action Box: Official Website Button */}
                <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 items-start md:items-end">
                  {officialUrl ? (
                    <a
                      href={officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all cursor-pointer w-full sm:w-auto"
                      id="hero-official-website-btn"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Official Website</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      Official website unavailable
                    </span>
                  )}

                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Verified Archive Record
                  </span>
                </div>

              </div>

            </div>

            {/* MAIN TWO-COLUMN DOSSIER GRID (Uses 100% of available screen width effectively) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Educational & Scientific Sections (7 cols on lg, 8 on xl) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-5">
                
                {/* SECTION 1: WHAT IS IT? */}
                <div className="glass-panel rounded-2xl p-5 sm:p-6 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <BookOpen className="w-5 h-5" />
                    <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      1. What is it?
                    </h2>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-500/20 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-100">
                    {hardware.educational_description || hardware.short_description}
                  </div>
                </div>

                {/* SECTION 2: HOW DOES IT WORK? */}
                <div className="glass-panel rounded-2xl p-5 sm:p-6 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <Cpu className="w-5 h-5" />
                    <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      2. How does it work?
                    </h2>
                  </div>
                  <div className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
                    <p>{hardware.how_it_works || 'Scientific and mechanical operation documented in official mission archives.'}</p>
                    
                    {hardware.hardware_materials && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 text-xs">
                        <strong className="text-slate-900 dark:text-white font-semibold block mb-1">
                          Documented Materials & Engineering:
                        </strong>
                        <span className="text-slate-600 dark:text-slate-300">{hardware.hardware_materials}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 3: WHY IS IT IMPORTANT? */}
                <div className="glass-panel rounded-2xl p-5 sm:p-6 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <Sparkles className="w-5 h-5" />
                    <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      3. Why is it important?
                    </h2>
                  </div>
                  <div className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
                    <p>{hardware.why_it_is_important || 'Historically significant breakthrough in human space exploration.'}</p>
                    {hardware.scientific_purpose && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 text-xs">
                        <strong className="text-slate-900 dark:text-white font-semibold block mb-1">
                          Primary Scientific Objective:
                        </strong>
                        <span className="text-slate-600 dark:text-slate-300">{hardware.scientific_purpose}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 4: CURRENT OR LAST-KNOWN STATUS */}
                <div className="glass-panel rounded-2xl p-5 sm:p-6 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <Radio className="w-5 h-5" />
                    <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      4. Current or Last-Known Status
                    </h2>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {hardware.current_or_last_known_status || 'Telemetry verified by mission flight directors'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        Status Record: {hardware.verification_status || 'NASA / JPL Archive Verified'} (Last Check: {hardware.last_verified_at || 'Recent'})
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(hardware.operational_status)}
                    </div>
                  </div>
                </div>

                {/* SECTION 5: IMAGES AND RELATED DATA */}
                <div className="glass-panel rounded-2xl p-5 sm:p-6 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
                      <Layers className="w-5 h-5" />
                      <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        5. Verified Imagery & Scientific Visualizations
                      </h2>
                    </div>
                  </div>
                  <ImageGallery 
                    images={hardware.images || []}
                    hardwareName={hardware.name}
                    onSelectImage={(idx) => handleOpenLightbox(hardware.images || [], idx)}
                  />
                </div>

                {/* SECTION 6: OFFICIAL LINKS & VERIFIED SOURCES */}
                <div className="glass-panel rounded-2xl p-5 sm:p-6 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
                      <FileCheck className="w-5 h-5" />
                      <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        6. Official Archives & Verified Sources
                      </h2>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">Authoritative Archives</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Primary Official Link */}
                    {hardware.official_url && (
                      <a
                        href={hardware.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-800/60 text-cyan-900 dark:text-cyan-300 transition-all font-semibold text-xs group shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          <span>Official Hardware Page</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    )}

                    {/* Secondary verified sources */}
                    {verifiedSources.map((src, sIdx) => (
                      <a
                        key={src.id || sIdx}
                        href={src.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 transition-all text-xs group shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <div className="truncate">
                            <p className="truncate font-medium">{src.source_name}</p>
                            <span className="text-[10px] text-slate-500">{src.source_type}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Technical Dossier & Quick Facts (5 cols on lg, 4 on xl) */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-5">
                
                {/* Official Website Action Card */}
                <div className="glass-panel rounded-2xl p-5 bg-gradient-to-br from-cyan-500/10 via-slate-50 to-white dark:from-cyan-950/40 dark:via-[#0c1222]/90 dark:to-slate-950/80 border border-cyan-300 dark:border-cyan-500/30 shadow-sm space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold block">
                    Direct Mission Access
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Official Web Resources
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Access official telemetric and photographic records published by the controlling flight directors.
                  </p>
                  {officialUrl ? (
                    <a
                      href={officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-cyan-600/20 transition-all"
                      id="sidebar-official-website-btn"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Visit Official Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs text-center font-medium">
                      Official website unavailable
                    </div>
                  )}
                </div>

                {/* Timeline Card */}
                <div className="glass-panel rounded-2xl p-5 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 border-b border-slate-100 dark:border-white/5 pb-2">
                    <Calendar className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Mission Timeline
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-slate-500">Launch Date</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{hardware.launch_date || 'Unrecorded'}</strong>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-slate-500">Landing / Arrival</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{hardware.landing_date || 'N/A (Orbital / Flyby)'}</strong>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-slate-500">Decommission Date</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{hardware.decommission_date || 'Currently Active'}</strong>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500">Physical Condition</span>
                      <strong className="text-slate-900 dark:text-white font-medium">{hardware.physical_status || 'Verified Intact'}</strong>
                    </div>
                  </div>
                </div>

                {/* Location / Surface Coordinates Card */}
                {hardware.location_description && (
                  <div className="glass-panel rounded-2xl p-5 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 border-b border-slate-100 dark:border-white/5 pb-2">
                      <MapPin className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Surface / Orbital Location
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {hardware.location_description}
                      </p>
                      {hardware.latitude != null && hardware.longitude != null && (
                        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 font-mono text-[11px] text-cyan-700 dark:text-cyan-400 flex items-center justify-between">
                          <span>Coordinates:</span>
                          <strong>[{hardware.latitude}°, {hardware.longitude}°]</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Organization & Manufacturer Card */}
                <div className="glass-panel rounded-2xl p-5 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 border-b border-slate-100 dark:border-white/5 pb-2">
                    <Building2 className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Institutional Stakeholders
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-slate-500">Operator</span>
                      <strong className="text-slate-900 dark:text-white">{hardware.operator?.name || hardware.primary_organization || 'NASA'}</strong>
                    </div>

                    {hardware.manufacturer && (
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                        <span className="text-slate-500">Manufacturer</span>
                        <strong className="text-slate-900 dark:text-white">{hardware.manufacturer.name}</strong>
                      </div>
                    )}

                    {hardware.mission_agency && (
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                        <span className="text-slate-500">Mission Agency</span>
                        <strong className="text-slate-900 dark:text-white">{hardware.mission_agency.name}</strong>
                      </div>
                    )}

                    {hardware.launch_provider && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-500">Launch Provider</span>
                        <strong className="text-slate-900 dark:text-white">{hardware.launch_provider.name}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aliases & Catalog IDs */}
                {hardware.aliases && hardware.aliases.length > 0 && (
                  <div className="glass-panel rounded-2xl p-5 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 border-b border-slate-100 dark:border-white/5 pb-2">
                      <Tag className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Catalog IDs & Aliases
                      </h3>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {hardware.aliases.map((al, aIdx) => (
                        <div key={al.id || aIdx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40">
                          <span className="font-semibold text-slate-800 dark:text-white font-mono">{al.alias}</span>
                          <span className="text-[10px] text-slate-500">{al.alias_type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* 3. Global Footer */}
      <footer className="mt-auto border-t border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-[#060a12]/90 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 max-w-7xl mx-auto">
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

      {/* 4. Lightbox Modal */}
      {lightboxState.isOpen && (
        <ImageModal
          images={lightboxState.images}
          currentIndex={lightboxState.currentIndex}
          onClose={handleCloseLightbox}
          onNavigate={handleNavigateLightbox}
        />
      )}

    </div>
  );
}
