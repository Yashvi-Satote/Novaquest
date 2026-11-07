import React from 'react';
import { 
  X, 
  Play, 
  Calendar, 
  Clock, 
  Target, 
  Award, 
  MapPin, 
  UserCheck, 
  CheckCircle2, 
  Sparkles,
  Rocket
} from 'lucide-react';
import GameButton from '../shared/GameButton';
import { gameAudio } from '../../config/gameAudio';

/**
 * MissionDetailModal.jsx
 * 
 * Interactive Mission Briefing Modal.
 * Displays Surveyor 5's historical profile, objectives, and launch action.
 */
export default function MissionDetailModal({
  mission,
  isOpen,
  onClose,
  onLaunch
}) {
  if (!isOpen || !mission) return null;

  const data = mission.data;

  const handleLaunch = () => {
    gameAudio.playClick();
    if (onLaunch) onLaunch(mission);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900/95 border-2 border-sky-400/50 shadow-[0_20px_70px_rgba(2,132,199,0.45)] text-white p-6 sm:p-8 space-y-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-modal-title"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-sky-500/20 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Rocket className="w-3.5 h-3.5" />
              <span>Level {mission.levelNumber} Mission Briefing</span>
            </div>
            <h2 id="mission-modal-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {mission.title}
            </h2>
            <p className="text-xs sm:text-sm text-sky-300 font-medium">{mission.subtitle}</p>
          </div>
          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Image & Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 relative h-48 rounded-2xl overflow-hidden border border-sky-400/30">
            <img
              src={mission.heroImage}
              alt={mission.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 text-xs font-bold text-white flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-400/40 text-sky-300">
                Mare Tranquillitatis
              </span>
              <span className="text-slate-300 font-mono text-[10px]">1.41° N, 23.18° E</span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex flex-col justify-between gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Launch Year</span>
              <span className="text-base font-black text-sky-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" /> 1967
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Estimated Time</span>
              <span className="text-base font-black text-amber-400 flex items-center gap-1">
                <Clock className="w-4 h-4" /> 5 Minutes
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Difficulty</span>
              <span className="text-base font-black text-emerald-400">
                Beginner Friendly
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Reward</span>
              <span className="text-xs font-bold text-yellow-300 flex items-center gap-1">
                <Award className="w-4 h-4 text-yellow-400" /> 3-Star Badge
              </span>
            </div>
          </div>
        </div>

        {/* Historical Summary */}
        <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <p>{data?.summary || mission.subtitle}</p>
        </div>

        {/* Mission Objectives Breakdown (6 Scenes) */}
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" />
            Mission Objectives
          </span>
          <div className="space-y-2">
            {(data?.scenes || []).map((scene, idx) => (
              <div 
                key={scene.id}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-sky-500/20 text-sky-300 font-bold shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{scene.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{scene.timeRange}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5">{scene.objective}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Launch Button Action */}
        <div className="flex items-center justify-between pt-4 border-t border-sky-500/20">
          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="text-xs font-bold text-slate-400 hover:text-white px-4 py-2 transition-colors"
          >
            Cancel
          </button>
          <GameButton
            size="lg"
            variant="accent"
            onClick={handleLaunch}
            icon={Play}
            className="text-base font-black px-8"
          >
            START MISSION 1
          </GameButton>
        </div>
      </div>
    </div>
  );
}
