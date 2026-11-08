import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Compass, 
  Sparkles, 
  Award, 
  Lock, 
  CheckCircle2, 
  HelpCircle,
  Rocket
} from 'lucide-react';
import AppNavbar from '../../Shared/components/layout/AppNavbar';
import MissionCard from '../components/missions/MissionCard';
import MissionDetailModal from '../components/missions/MissionDetailModal';
import GameButton from '../components/shared/GameButton';
import { ALL_MISSIONS } from '../config/missions';
import { gameAudio } from '../config/gameAudio';

/**
 * MissionSelectPage.jsx
 * 
 * Phase 3: Mission Selection Screen
 * - Displays Level 1: Surveyor 5 as fully unlocked and playable.
 * - Displays future scalable levels (Apollo 11, Viking 1, Voyager 1, Cassini, JWST) as locked with clear historical reasons.
 * - Kid-friendly commercial layout with 3D cards, badges, and briefing modal.
 */
export default function MissionSelectPage() {
  const navigate = useNavigate();
  const [selectedMission, setSelectedMission] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleInspectMission = (mission) => {
    setSelectedMission(mission);
    setIsDetailOpen(true);
  };

  const handlePlayMission = (mission) => {
    gameAudio.playClick();
    if (mission.id === 'surveyor-5') {
      navigate('/play');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#070b19] font-sans text-slate-100 select-none flex flex-col justify-between">
      <AppNavbar />

      {/* Deep Space Background with Stars */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-40 pointer-events-none"
        style={{ backgroundImage: "url('/textures/planets/milky_way.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-t from-[#070b19] via-[#070b19]/80 to-[#070b19]/90 pointer-events-none" />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Bar & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-500/20 pb-6">
          <div className="space-y-1">
            <button
              onClick={() => {
                gameAudio.playClick();
                navigate('/app');
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors mb-2 cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Title Screen</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/30">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  TIME TRAVEL EXPEDITIONS
                </h1>
                <p className="text-xs sm:text-sm text-sky-300 font-medium">
                  Select a historical NASA mission and embark on an interactive voyage
                </p>
              </div>
            </div>
          </div>

          {/* Quick Mission Summary Stats */}
          <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-2xl border border-sky-500/30 backdrop-blur-md">
            <div className="px-3 py-1.5 rounded-xl bg-sky-950/80 border border-sky-400/40 text-center">
              <span className="block text-xs font-bold text-slate-400">UNLOCKED</span>
              <span className="text-sm font-black text-sky-400">1 / 6</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-center">
              <span className="block text-xs font-bold text-slate-400">BADGES</span>
              <span className="text-sm font-black text-yellow-400 flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5" /> 0
              </span>
            </div>
          </div>
        </div>

        {/* Mission Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_MISSIONS.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onInspect={handleInspectMission}
              onPlay={handlePlayMission}
            />
          ))}
        </div>

        {/* Educational Note Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-sky-950/70 via-slate-900/90 to-indigo-950/70 border-2 border-sky-400/30 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
              <Rocket className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                How Time Travel Missions Work
              </h3>
              <p className="text-xs text-sky-200/90">
                Each mission transports you directly to the historical year of launch. Solve authentic engineering challenges, assemble real scientific components, and unlock the next chapter of space exploration!
              </p>
            </div>
          </div>
          <GameButton
            size="md"
            variant="accent"
            onClick={() => handlePlayMission(ALL_MISSIONS[0])}
            icon={Sparkles}
            className="shrink-0 text-xs font-black uppercase"
          >
            Play Level 1 Now
          </GameButton>
        </div>
      </main>

      {/* Mission Detail Modal */}
      <MissionDetailModal
        mission={selectedMission}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onLaunch={handlePlayMission}
      />
    </div>
  );
}

