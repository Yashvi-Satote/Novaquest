import React, { useState } from 'react';
import { 
  Rocket, 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  Compass, 
  Radio, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { hasSaveGame, getSaveGame } from '../../game/saveManager';
import { audio } from '../../game/audioManager';

export default function NewGameModal({ isOpen, onClose, onConfirmStart }) {
  const saveExists = hasSaveGame();
  const existingSave = saveExists ? getSaveGame() : null;

  const [callsign, setCallsign] = useState('Nova-1');
  const [difficulty, setDifficulty] = useState('Commander');
  const [confirmedOverwrite, setConfirmedOverwrite] = useState(!saveExists);

  if (!isOpen) return null;

  const handleLaunch = () => {
    audio.playStartGame();
    if (onConfirmStart) {
      onConfirmStart({ callsign, difficulty });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-cyan-500/40 bg-[#070b16]/95 text-slate-100 shadow-2xl shadow-cyan-950/60 flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/30">
              <Rocket className="h-4 w-4 -rotate-45" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wider uppercase text-white font-mono">Initialize Expedition</h2>
              <p className="text-xs text-slate-400">Mission Profile & Flight Credentials</p>
            </div>
          </div>
          <button
            onClick={() => { audio.playClick(); onClose(); }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* Overwrite Warning Banner if Save Exists */}
          {saveExists && !confirmedOverwrite && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-200 text-xs font-mono uppercase tracking-wide">
                    Existing Mission Checkpoint Detected
                  </h4>
                  <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                    You have an ongoing mission at <strong className="text-white">{existingSave?.location || 'Oceanus Procellarum'}</strong>. Initializing a new expedition will overwrite previous checkpoint telemetry.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { audio.playClick(); setConfirmedOverwrite(true); }}
                className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                Confirm & Overwrite Previous Telemetry
              </button>
            </div>
          )}

          {/* Mission Briefing Card */}
          <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/15 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                Primary Mission: Chapter 01
              </span>
              <span className="text-xs font-mono text-slate-400">Lunar Landing 1966</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">Surveyor 1: Ocean of Storms</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Descend into Oceanus Procellarum. Locate the historic 1966 Surveyor 1 spacecraft resting in the cratered regolith, scan its television camera mast, and transmit its first historic lunar surface signals back to Earth.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-500/20 text-[11px] font-mono text-slate-400">
              <div><span className="text-cyan-400">Target:</span> Surveyor 1 Lander</div>
              <div><span className="text-cyan-400">Coords:</span> 2.474° S, 43.339° W</div>
            </div>
          </div>

          {/* Callsign Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-300">Pilot Callsign</label>
            <input
              type="text"
              value={callsign}
              maxLength={16}
              onChange={(e) => setCallsign(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              placeholder="e.g. Nova-1"
            />
          </div>

          {/* Difficulty Preset */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-slate-300">Flight Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cadet', label: 'Cadet', sub: 'Assisted flight, infinite fuel' },
                { id: 'Commander', label: 'Commander', sub: 'Standard physics & fuel' },
                { id: 'Pioneer', label: 'Pioneer', sub: 'Newtonian inertia & damage' }
              ].map(diff => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => { audio.playHover(); setDifficulty(diff.id); }}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    difficulty === diff.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-900/30'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs font-mono">{diff.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{diff.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-black/60">
          <button
            type="button"
            onClick={() => { audio.playClick(); onClose(); }}
            className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saveExists && !confirmedOverwrite}
            onClick={handleLaunch}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
              saveExists && !confirmedOverwrite
                ? 'opacity-40 cursor-not-allowed bg-slate-700 text-slate-400'
                : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-600/30 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <span>Launch Expedition</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
