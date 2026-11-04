import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchHardwareDetail } from '../../Shared/services/api';
import AppNavbar from '../../Shared/components/layout/AppNavbar';
import ImageGallery from '../components/ImageGallery';
import ImageModal from '../components/ImageModal';
import ModelViewer from '../components/ModelViewer';
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
  Users,
  Box,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const MISSING_TEXT = 'Missing — not available in the current sources.';

function MissingBlock({ note }) {
  return (
    <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-600/40 bg-amber-50/70 dark:bg-amber-950/20 p-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{note || MISSING_TEXT}</span>
    </div>
  );
}

const LINE_CLAMP_CLASS = {
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
};

/**
 * Condenses long source text to a fixed number of lines and reveals the rest
 * behind an accessible "Read more" toggle. Raw wiki dumps therefore stay out of
 * the way until a reader explicitly asks for them.
 */
function ClampedText({ text, lines = 6, className = '' }) {
  const [expandedText, setExpandedText] = useState(null);
  const [overflowing, setOverflowing] = useState(false);
  const textRef = useRef(null);
  const clampClass = LINE_CLAMP_CLASS[lines] || 'line-clamp-6';
  const bodyClass = className || 'text-sm sm:text-base text-slate-700 dark:text-slate-200';
  const expanded = expandedText === text;

  useEffect(() => {
    const node = textRef.current;
    if (!node) return undefined;

    const measure = () => {
      if (expanded) return;
      setOverflowing(node.scrollHeight > node.clientHeight + 1);
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [text, expanded, clampClass]);

  if (!text) return null;

  return (
    <div className="space-y-1.5">
      <p
        ref={textRef}
        className={`leading-relaxed whitespace-pre-line ${expanded ? '' : clampClass} ${bodyClass}`}
      >
        {text}
      </p>
      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpandedText(expanded ? null : text)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-700 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300 cursor-pointer"
        >
          {expanded ? 'Show less' : 'Read more'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}

function Attribution({ block }) {
  if (!block) return null;
  const parts = [];
  if (block.page_url) {
    parts.push(
      <a
        key="page"
        href={block.page_url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-cyan-600 dark:hover:text-cyan-400"
      >
        Wikipedia source
      </a>
    );
  }
  if (block.license) parts.push(block.license);
  if (block.revision_id) parts.push(`revision ${block.revision_id}`);
  if (!parts.length) return null;
  return (
    <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">
      Text attribution: {parts.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 ? ' · ' : ''}
          {part}
        </React.Fragment>
      ))}
    </p>
  );
}

function SectionCard({ id, number, title, icon: Icon, children, completeness }) {
  return (
    <section
      id={id}
      className="glass-panel rounded-2xl p-5 sm:p-6 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3 scroll-mt-32"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-2.5">
        <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 min-w-0">
          <Icon className="w-5 h-5 shrink-0" />
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white truncate">
            {number}. {title}
          </h2>
        </div>
        {completeness && completeness !== 'ok' && (
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40">
            {completeness}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

export default function HardwareDetailPage() {
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
    setLightboxState({ isOpen: true, images, currentIndex: index });
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
    else if (dest === "Heliophysics") color = "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/60";

    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${color}`}>
        {dest || 'Deep Space'}
      </span>
    );
  };

  // Only expose verified, non-empty external links to the UI.
  const verifiedSources = (hardware?.sources || []).filter((src) => Boolean(src?.source_url));
  const officialUrl = hardware?.official_url || verifiedSources[0]?.source_url || null;
  const content = hardware?.content || {};
  const completeness = hardware?.completeness || { populated_sections: 0, total_sections: 10 };
  const sections = Object.values(hardware?.sections || {})
    .slice()
    .sort((first, second) => (first.number || 0) - (second.number || 0));

  const sectionText = (key, legacy) => {
    const body = content?.[key]?.body_text;
    if (body) return body;
    return legacy || null;
  };

  const sectionNode = (key, legacy) => {
    const text = sectionText(key, legacy);
    if (!text) return <MissingBlock />;
    return (
      <div className="space-y-1">
        <ClampedText text={text} lines={6} />
        <Attribution block={content?.[key]} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070b14] space-bg flex flex-col font-sans text-slate-100">
      <AppNavbar />

      <main className="flex-1 w-full max-w-full px-4 sm:px-6 lg:px-8 2xl:px-12 py-6">
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
            <div className="space-y-5">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-40 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
                <div className="h-48 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
                <div className="h-64 bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
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
                  <div className="flex items-center gap-2 flex-wrap">
                    {getDestinationBadge(hardware.destination_category || hardware.destination)}
                    <span className="text-xs font-mono text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-900/50 font-medium">
                      {hardware.object_type}
                    </span>
                    {getStatusBadge(hardware.operational_status)}
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                      {completeness.populated_sections}/{completeness.total_sections} sections
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {hardware.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Orbit className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      Mission: <strong className="text-slate-900 dark:text-white font-semibold">{hardware.mission_name || 'Independent Mission'}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      Primary Agency: <strong className="text-slate-900 dark:text-white font-semibold">{hardware.primary_agency || hardware.primary_organization || 'Space Agency'}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      Destination: <strong className="text-slate-900 dark:text-white font-semibold">{hardware.destination || 'Deep Space'}</strong>
                    </span>
                  </div>

                  <div className="pt-1">
                    <ClampedText
                      text={hardware.short_description || MISSING_TEXT}
                      lines={3}
                      className="text-sm sm:text-base text-slate-600 dark:text-slate-300"
                    />
                  </div>
                </div>

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
                    {hardware.verification_status || 'Archive record'}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION COVERAGE: sticky, full-width table of contents */}
            {sections.length > 0 && (
              <nav
                aria-label="Section coverage"
                className="z-20 -mx-4 border-y border-slate-200/80 bg-white/90 px-4 py-2 backdrop-blur-md dark:border-white/10 dark:bg-[#070b14]/90 sm:sticky sm:top-14 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 2xl:-mx-12 2xl:px-12"
              >
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                  <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Box className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    Section coverage
                  </span>
                  {sections.map((section) => (
                    <a
                      key={section.key}
                      href={`#section-${section.number}`}
                      title={section.populated ? 'Populated from verified sources' : 'Not populated in the current sources'}
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        section.populated
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70'
                          : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70'
                      }`}
                    >
                      {section.number}. {section.label}
                    </a>
                  ))}
                </div>
              </nav>
            )}

            {/* MAIN DOSSIER: full-width sections */}
            <div className="flex flex-col gap-5">
              <div className="grid min-w-0 grid-cols-1 gap-5">
                <SectionCard id="section-1" number={1} title="What is it?" icon={BookOpen} completeness={content.what_is_it?.completeness}>
                  {sectionNode('what_is_it', hardware.educational_description)}
                </SectionCard>

                <SectionCard id="section-2" number={2} title="How does it work?" icon={Cpu} completeness={content.how_it_works?.completeness}>
                  {sectionNode('how_it_works', hardware.how_it_works)}
                  {hardware.parts?.length > 0 && (
                    <div className="pt-1 space-y-2">
                      <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Documented parts & instruments
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {hardware.parts.map((part) => (
                          <div key={part.id || part.part_name} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 text-xs">
                            <strong className="text-slate-900 dark:text-white font-semibold block mb-0.5">{part.part_name}</strong>
                            <span className="line-clamp-3 text-slate-600 dark:text-slate-300" title={part.purpose || undefined}>
                              {part.purpose || 'Purpose not documented in the current source.'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </SectionCard>

                <SectionCard id="section-3" number={3} title="Why is it important?" icon={Sparkles} completeness={content.why_important?.completeness}>
                  {sectionNode('why_important', hardware.why_it_is_important)}
                </SectionCard>

                <SectionCard id="section-4" number={4} title="Current or last-known status" icon={Radio} completeness={content.status?.completeness}>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <ClampedText
                        text={sectionText('status', hardware.current_or_last_known_status) || MISSING_TEXT}
                        lines={4}
                        className="text-sm font-semibold text-slate-900 dark:text-white"
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        Status as of: {hardware.status_as_of || hardware.last_verified_at || 'Unknown'} · {hardware.verification_status || 'Archive record'}
                      </p>
                      <Attribution block={content.status} />
                    </div>
                    <div>{getStatusBadge(hardware.operational_status)}</div>
                  </div>
                </SectionCard>

                <SectionCard id="section-5" number={5} title="Imagery & scientific visualizations" icon={Layers}>
                  <ImageGallery
                    images={hardware.images || []}
                    hardwareName={hardware.name}
                    onSelectImage={(idx) => handleOpenLightbox(hardware.images || [], idx)}
                  />
                </SectionCard>

                <SectionCard id="section-6" number={6} title="Official archives & verified sources" icon={FileCheck}>
                  {verifiedSources.length === 0 && !hardware.official_url ? (
                    <MissingBlock note="No verified source URLs stored for this spacecraft." />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                              <p className="truncate font-medium">{src.label || src.source_name}</p>
                              <span className="text-[10px] text-slate-500">{src.source_type}</span>
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  )}
                </SectionCard>

                <SectionCard id="section-7" number={7} title="Mission timeline" icon={Calendar}>
                  {hardware.timeline?.length > 0 ? (
                    <ol className="relative border-l border-slate-200 dark:border-white/10 ml-2 space-y-4">
                      {hardware.timeline.map((event, index) => (
                        <li key={event.id || `${event.event_date}-${index}`} className="ml-4">
                          <span className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-cyan-500 border border-white dark:border-[#0c1222]" />
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400 font-semibold">
                              {event.event_date || 'Date unknown'}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {event.event_type || 'event'}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                            {event.title}
                          </p>
                          {event.description && event.description !== event.title && (
                            <p
                              className="line-clamp-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5"
                              title={event.description}
                            >
                              {event.description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <MissingBlock note="No dated mission events could be verified from the current sources." />
                  )}
                </SectionCard>

                <SectionCard id="section-8" number={8} title="Institutional stakeholders" icon={Building2}>
                  {hardware.stakeholders?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {hardware.stakeholders.map((org, index) => (
                        <div key={`${org.organization_id}-${org.role}-${index}`} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 text-xs">
                          <p className="font-semibold text-slate-900 dark:text-white">{org.name}</p>
                          <p className="text-slate-500 dark:text-slate-400">{org.role}</p>
                          {org.country && <p className="text-[10px] text-slate-400 mt-0.5">{org.country}</p>}
                          {org.url && (
                            <a href={org.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-cyan-700 dark:text-cyan-400 hover:underline mt-1">
                              <ExternalLink className="w-3 h-3" /> Official site
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <MissingBlock note="No institutional stakeholders could be verified from the current sources." />
                  )}
                </SectionCard>

                <div id="section-9" className="scroll-mt-32">
                  <ModelViewer models={hardware.models || []} name={hardware.name} />
                </div>

                <SectionCard id="section-10" number={10} title="Top 10 people who helped develop the mission" icon={Users}>
                  {hardware.people?.length > 0 ? (
                    <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {hardware.people.map((person) => (
                        <li key={person.id || person.rank_order} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 text-xs flex gap-3">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center font-mono text-[11px] font-bold">
                            {person.rank_order}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">{person.full_name}</p>
                            <p className="text-slate-500 dark:text-slate-400">{person.role_on_mission || 'Role not documented'}</p>
                            {person.affiliation && <p className="text-[10px] text-slate-400 mt-0.5">{person.affiliation}</p>}
                            {person.wiki_url && (
                              <a href={person.wiki_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-cyan-700 dark:text-cyan-400 hover:underline mt-1">
                                <ExternalLink className="w-3 h-3" /> Wikipedia
                              </a>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <MissingBlock note="No individual contributors could be verified from the current sources." />
                  )}
                </SectionCard>

                {hardware.license && (
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-900/40 p-4 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <p><strong className="text-slate-700 dark:text-slate-300">Text:</strong> {hardware.license.text}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Images:</strong> {hardware.license.images}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">3D models:</strong> {hardware.license.models}</p>
                  </div>
                )}
              </div>

              {/* QUICK FACTS: full-width responsive cards */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="glass-panel rounded-2xl p-5 bg-gradient-to-br from-cyan-500/10 via-slate-50 to-white dark:from-cyan-950/40 dark:via-[#0c1222]/90 dark:to-slate-950/80 border border-cyan-300 dark:border-cyan-500/30 shadow-sm space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold block">
                    Direct Mission Access
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Official Web Resources</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Access official records published by the mission agency and archive.
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
                    <MissingBlock note="Official website unavailable in the current sources." />
                  )}
                </div>

                <div className="glass-panel rounded-2xl p-5 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 border-b border-slate-100 dark:border-white/5 pb-2">
                    <Calendar className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Key Dates</h3>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-slate-500">Launch</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{hardware.launch_date || 'Missing'}</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-slate-500">Landing / Arrival</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{hardware.arrival_or_landing_date || hardware.landing_date || 'Missing'}</strong>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500">End / Decommission</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{hardware.end_date || hardware.decommission_date || 'Missing'}</strong>
                    </div>
                  </div>
                </div>

                {hardware.location_description && (
                  <div className="glass-panel rounded-2xl p-5 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 border-b border-slate-100 dark:border-white/5 pb-2">
                      <MapPin className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Location</h3>
                    </div>
                    <ClampedText
                      text={hardware.location_description}
                      lines={4}
                      className="text-xs text-slate-700 dark:text-slate-300"
                    />
                  </div>
                )}

                <div className="glass-panel rounded-2xl p-5 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 border-b border-slate-100 dark:border-white/5 pb-2">
                    <Building2 className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Primary Organizations</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-slate-500">Operator</span>
                      <strong className="text-slate-900 dark:text-white">{hardware.operator?.name || hardware.primary_organization || 'Missing'}</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-slate-500">Manufacturer</span>
                      <strong className="text-slate-900 dark:text-white">{hardware.manufacturer?.name || 'Missing'}</strong>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500">Mission Agency</span>
                      <strong className="text-slate-900 dark:text-white">{hardware.mission_agency?.name || hardware.primary_agency || 'Missing'}</strong>
                    </div>
                  </div>
                </div>

                {hardware.aliases?.length > 0 && (
                  <div className="glass-panel rounded-2xl p-5 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 border-b border-slate-100 dark:border-white/5 pb-2">
                      <Tag className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Catalog IDs & Aliases</h3>
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

      <footer className="mt-auto border-t border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-[#060a12]/90 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5">
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
            <span>Wikipedia CC BY-SA 4.0</span>
          </div>
        </div>
      </footer>

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
