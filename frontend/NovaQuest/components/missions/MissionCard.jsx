import React from 'react';
import { 
  Play, 
  Lock, 
  Clock, 
  Calendar, 
  Award, 
  ChevronRight, 
  Sparkles,
  CheckCircle2 
} from 'lucide-react';
import GameButton from '../shared/GameButton';
import { gameAudio } from '../../config/gameAudio';

/**
 * MissionCard.jsx
 * 
 * Commercial-style Mission Selector Card.
 * - Displays 3D preview / illustration.
 * - Mission year, difficulty, duration.
 * - Distinct visual states for unlocked vs locked.
 */
export default function MissionCard({
  mission,
  onPlay,
  onInspect,
  className = ''
}) {
  const isUnlocked = mission.status === 'unlocked' || mission.status === 'completed';
  const isCompleted = mission.status === 'completed';

  const handleCardClick = () => {
    if (isUnlocked) {
      gameAudio.playClick();
      if (onInspect) onInspect(mission);
    } else {
      gameAudio.playError();
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 border-2 ${
        isUnlocked
          ? 'bg-slate-900/90 border-sky-400/50 hover:border-orange-400 shadow-[0_10px_30px_rgba(2,132,199,0.25)] hover:shadow-[0_15px_45px_rgba(249,115,22,0.35)] hover:-translate-y-1.5 cursor-pointer'
          : 'bg-slate-950/70 border-slate-800/80 opacity-75 cursor-not-allowed shadow-none'
      } ${className}`}
    >
      {/* Level Number & Difficulty Badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <span className={`flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm shadow-md ${
          isUnlocked 
            ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white' 
            : 'bg-slate-800 text-slate-400'
        }`}>
          {mission.levelNumber}
        </span>
        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full backdrop-blur-md border ${
          isUnlocked
            ? 'bg-sky-950/80 text-sky-300 border-sky-400/40'
            : 'bg-slate-900/80 text-slate-500 border-slate-700'
        }`}>
          {mission.difficulty}
        </span>
      </div>

      {/* Completion Star Badge */}
      {isCompleted && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400 text-emerald-300 text-xs font-bold shadow-md">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Completed</span>
        </div>
      )}

      {/* Hero Image Container */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={mission.heroImage}
          alt={mission.title}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isUnlocked ? 'group-hover:scale-110 filter brightness-95' : 'filter grayscale contrast-75'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

        {/* Locked Overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-center shadow-lg mb-2">
              <Lock className="w-6 h-6 text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-300">LOCKED MISSION</span>
            <span className="text-[10px] text-slate-500 max-w-[200px] mt-1">
              {mission.lockReason || 'Complete previous level to unlock'}
            </span>
          </div>
        )}
      </div>

      {/* Mission Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div>
          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold mb-1.5">
            <span className="flex items-center gap-1 text-sky-400">
              <Calendar className="w-3.5 h-3.5" />
              {mission.year}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              {mission.estimatedDuration}
            </span>
          </div>

          {/* Title & Subtitle */}
          <h3 className={`text-lg sm:text-xl font-black tracking-tight leading-snug ${
            isUnlocked ? 'text-white group-hover:text-sky-300 transition-colors' : 'text-slate-400'
          }`}>
            {mission.title}
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-2">
            {mission.subtitle}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {mission.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/50"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-800">
          {isUnlocked ? (
            <GameButton
              size="md"
              variant="accent"
              onClick={(e) => {
                e.stopPropagation();
                if (onPlay) onPlay(mission);
              }}
              icon={Play}
              className="w-full text-sm font-black"
            >
              PLAY MISSION
            </GameButton>
          ) : (
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-800/60 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-800"
            >
              <Lock className="w-4 h-4" />
              LOCKED
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

