import React, { useEffect } from 'react';
import { 
  X, 
  Shield, 
  Radio, 
  CheckCircle2, 
  Database, 
  Sparkles, 
  Compass, 
  Layers, 
  FileText,
  Rocket,
  Gamepad2
} from 'lucide-react';
import { audio } from '../../game/audioManager';

export default function InvestigationModal({ target, onClose, onLogData, mcName = 'Captain Arin Rao' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950/95 border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/30 bg-cyan-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 tracking-widest uppercase flex items-center gap-2">
                <span>NASA FIELD INVESTIGATION · 2126</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
                {target.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { audio.playClick(); onClose(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close [Esc]"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content Body */}
        <main className="p-6 space-y-5 overflow-y-auto custom-scrollbar text-xs">
          
          {/* Classification & Target body */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-black/50 border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase">Sector</div>
              <div className="text-cyan-300 font-bold mt-0.5">{target.sector || 'Oceanus Procellarum'}</div>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase">Artifact Age</div>
              <div className="text-cyan-300 font-bold mt-0.5">{target.artifactAge || '160 Earth Years'}</div>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase">Integrity</div>
              <div className="text-emerald-400 font-bold mt-0.5">{target.integrity || '94.2% Stable'}</div>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase">Telemetry Link</div>
              <div className="text-cyan-300 font-bold mt-0.5">{target.telemetryStatus || 'Archived'}</div>
            </div>
          </div>

          {/* Image preview if available */}
          {target.image && (
            <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 max-h-56 group">
              <img 
                src={target.image} 
                alt={target.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-3 text-[10px] text-cyan-300">
                LUNAR RECONNAISSANCE OPTICS · {(mcName || 'Captain Arin Rao').toUpperCase()}
              </div>
            </div>
          )}

          {/* Primary Historical Lore & Findings */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-cyan-300 tracking-wider uppercase flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Archival Records & Analysis</span>
            </div>
            <p className="text-slate-300 font-sans text-xs sm:text-sm leading-relaxed p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              {target.description}
            </p>
          </div>

          {/* Historical Mission Introduction (Surveyor 1) */}
          {target.historicalFacts && (
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-slate-900/60 border border-cyan-500/40 shadow-inner">
              <div className="text-[11px] font-bold text-cyan-300 tracking-wider uppercase flex items-center gap-2">
                <Rocket className="w-4 h-4 text-cyan-400" />
                <span>Historical Mission Introduction · Surveyor 1</span>
              </div>
              <ul className="space-y-2 pt-1 font-sans text-xs sm:text-sm text-slate-200">
                {target.historicalFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    <span className="font-semibold text-white leading-relaxed">{fact}</span>
                  </li>
                ))}
              </ul>
              {target.historicalContext && (
                <p className="text-slate-300 font-sans text-xs italic pt-2 border-t border-cyan-500/20 leading-relaxed">
                  {target.historicalContext}
                </p>
              )}
            </div>
          )}

          {/* Controls & Mechanics Tutorial Guide */}
          {target.controlsGuide && (
            <div className="space-y-2.5 p-4 rounded-xl bg-black/60 border border-amber-500/30 shadow-inner">
              <div className="text-[11px] font-bold text-amber-300 tracking-wider uppercase flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span>Astronaut EVA Mechanics & Controls Reference</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono">
                {target.controlsGuide.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center text-center">
                    <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-400/50 text-amber-300 font-bold text-xs tracking-wider">
                      {item.input}
                    </span>
                    <span className="text-slate-200 text-[10px] uppercase font-bold mt-1.5">{item.mechanic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scientific Telemetry Breakdown */}
          {target.readings && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-cyan-300 tracking-wider uppercase flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sensory Spectrometry Data</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                {Object.entries(target.readings).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-slate-400">{key}:</span>
                    <span className="text-white font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Arin's Officer Notes */}
          {target.officerNote && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-indigo-500/30 text-indigo-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{mcName || 'Captain Arin Rao'} · Personal Mission Audio Log</span>
              </div>
              <p className="italic text-xs font-sans text-indigo-100/90 leading-relaxed">
                “{target.officerNote}”
              </p>
            </div>
          )}

        </main>

        {/* Footer Actions */}
        <footer className="p-4 border-t border-cyan-500/30 bg-black/60 flex items-center justify-between">
          <div className="text-[10px] text-slate-500">
            CHECKPOINT VERIFIED · TELEMETRY CACHED
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                audio.playInteract();
                if (onLogData) onLogData(target);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-200" />
              <span>Acknowledge & Record</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}

