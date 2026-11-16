import React, { useCallback, useEffect, useState } from 'react';
import { Maximize2, RotateCw, Smartphone } from 'lucide-react';
import { usePhoneLandscape } from '../../mobile/usePhoneLandscape';

/**
 * PhoneLandscapeGate
 *
 * NovaQuest gameplay and the NovaMap solar-system view are landscape-only on
 * phones. In portrait we show a clear rotation prompt and do not mount the
 * children, so heavy WebGL scenes never start in the wrong orientation.
 *
 * Desktop, laptop and tablet layouts are untouched.
 */
export default function PhoneLandscapeGate({
  children,
  title = 'NovaQuest',
  message = 'The NovaQuest game and NovaMap are designed for landscape on phones.',
  accent = 'cyan',
}) {
  const { isPhone, isLandscape } = usePhoneLandscape();
  const [isRequesting, setIsRequesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Keep the page behind the prompt from scrolling while the phone is vertical.
  useEffect(() => {
    if (!isPhone || isLandscape || typeof document === 'undefined') return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPhone, isLandscape]);

  const handleRequestLandscape = useCallback(async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    setStatusMessage('');

    try {
      const root = document.documentElement;
      if (root?.requestFullscreen) {
        await root.requestFullscreen();
      }
    } catch {
      // Fullscreen can be blocked by the browser. Rotating manually still works.
    }

    try {
      if (typeof screen !== 'undefined' && screen.orientation?.lock) {
        await screen.orientation.lock('landscape');
        setStatusMessage('Landscape requested. If the screen did not rotate, turn your phone sideways.');
      } else {
        setStatusMessage('Turn your phone sideways to continue.');
      }
    } catch {
      setStatusMessage('Turn your phone sideways to continue.');
    } finally {
      setIsRequesting(false);
    }
  }, [isRequesting]);

  if (!isPhone || isLandscape) {
    return <>{children}</>;
  }

  const isAmber = accent === 'amber';
  const accentText = isAmber ? 'text-amber-300' : 'text-cyan-300';
  const accentBorder = isAmber ? 'border-amber-400/45' : 'border-cyan-400/45';
  const accentGlow = isAmber ? 'shadow-[0_0_80px_rgba(251,191,36,0.16)]' : 'shadow-[0_0_80px_rgba(34,211,238,0.16)]';
  const buttonClass = isAmber
    ? 'border-amber-400/70 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 shadow-[0_0_32px_rgba(251,191,36,0.35)]'
    : 'border-cyan-400/70 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-[0_0_32px_rgba(34,211,238,0.35)]';

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="nq-landscape-title"
      aria-describedby="nq-landscape-description"
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#03060f] px-5 py-6 text-slate-100 select-none"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <style>{`
        @keyframes nq-landscape-phone {
          0%, 18% { transform: rotate(0deg); }
          55%, 100% { transform: rotate(-90deg); }
        }
        @keyframes nq-landscape-glow {
          0%, 100% { opacity: 0.45; transform: scale(0.92); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: isAmber
            ? 'radial-gradient(circle at 50% 22%, rgba(251,191,36,0.16) 0%, rgba(3,6,15,0) 55%), radial-gradient(circle at 50% 100%, rgba(249,115,22,0.12) 0%, rgba(3,6,15,0) 60%)'
            : 'radial-gradient(circle at 50% 22%, rgba(34,211,238,0.16) 0%, rgba(3,6,15,0) 55%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.12) 0%, rgba(3,6,15,0) 60%)',
        }}
      />

      <div className={`relative w-full max-w-sm rounded-3xl border ${accentBorder} bg-slate-950/85 p-6 text-center backdrop-blur-xl ${accentGlow}`}>
        <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-black/50">
          <div
            className="absolute inset-3 rounded-full blur-xl"
            style={{
              background: isAmber ? 'rgba(251,191,36,0.28)' : 'rgba(34,211,238,0.28)',
              animation: 'nq-landscape-glow 2.4s ease-in-out infinite',
            }}
          />
          <div
            className="relative flex h-14 w-9 items-center justify-center rounded-[10px] border-2 border-slate-200/80 bg-slate-900 shadow-lg"
            style={{ animation: 'nq-landscape-phone 2.8s ease-in-out infinite' }}
          >
            <span className="absolute top-1 h-1 w-3 rounded-full bg-slate-600" />
            <span className={`h-1.5 w-1.5 rounded-full ${isAmber ? 'bg-amber-300' : 'bg-cyan-300'}`} />
            <span className="absolute bottom-1 h-0.5 w-3 rounded-full bg-slate-500" />
          </div>
          <RotateCw className={`absolute -right-1 -top-1 h-5 w-5 ${accentText}`} />
        </div>

        <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full border ${accentBorder} bg-white/5 px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em] ${accentText}`}>
          <Smartphone className="h-3 w-3" />
          <span>Landscape mode required</span>
        </div>

        <h1 id="nq-landscape-title" className="text-2xl font-black uppercase tracking-[0.08em] text-white">
          Rotate your phone
        </h1>
        <p id="nq-landscape-description" className="mt-2 text-sm leading-relaxed text-slate-300">
          Turn your device to <span className={`font-bold ${accentText}`}>horizontal / landscape</span> to open {title}.
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
          {message}
        </p>

        <button
          type="button"
          onClick={handleRequestLandscape}
          disabled={isRequesting}
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-wait disabled:opacity-70 ${buttonClass}`}
        >
          <Maximize2 className="h-4 w-4" />
          <span>{isRequesting ? 'Requesting landscape…' : 'Try fullscreen landscape'}</span>
        </button>

        <p className="mt-3 min-h-[1rem] text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
          {statusMessage || 'Or simply rotate the phone to continue.'}
        </p>
      </div>
    </div>
  );
}
