import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  Gauge, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Sparkles,
  Radio,
  Rocket
} from 'lucide-react';
import GameButton from '../shared/GameButton';
import { SURVEYOR_5_MISSION } from '../../config/surveyor5Data';
import { gameAudio } from '../../config/gameAudio';

/**
 * LaunchEmergencyScene.jsx
 * 
 * Scene 4: Launch Emergency (2:30 - 3:30)
 * - Journey through space en route to the Moon.
 * - Helium gas pressure leak emergency (dropped to 850 psi).
 * - Scenario-based decision making with Dr. Leonard Jaffe.
 * - Solution: "Pressurize the fuel tanks early and burn vernier engines in a modified sequence."
 * - Soft touchdown celebration: Mare Tranquillitatis, Sept 11, 1967!
 */
export default function LaunchEmergencyScene({ onComplete }) {
  const [phase, setPhase] = useState('alarm'); // 'alarm' | 'challenge' | 'feedback' | 'touchdown'
  const [selectedOption, setSelectedOption] = useState(null);
  const [pressurePsi, setPressurePsi] = useState(850);

  const { emergencyChallenge } = SURVEYOR_5_MISSION;

  // Sound alarm on mount
  useEffect(() => {
    gameAudio.playAlarm();
    const timer = setTimeout(() => {
      setPhase('challenge');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectOption = (opt) => {
    setSelectedOption(opt);
    if (opt.isCorrect) {
      gameAudio.playSuccess();
    } else {
      gameAudio.playError();
    }
    setPhase('feedback');
  };

  const handleProceedToTouchdown = () => {
    gameAudio.playThruster(3.0);
    setPhase('touchdown');
  };

  return (
    <div className="relative w-full h-full min-h-[550px] flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none">
      {/* Dynamic Background: Deep Space with Red Emergency Glow in Alarm phase */}
      <div 
        className={`absolute inset-0 transition-colors duration-1000 ${
          phase === 'alarm' 
            ? 'bg-rose-950/90 animate-pulse' 
            : 'bg-slate-950/95'
        }`}
      />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: "url('/textures/planets/milky_way.jpg')" }}
      />

      {/* 1. Scene Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-950/85 p-4 rounded-3xl border border-rose-500/50 backdrop-blur-md shadow-2xl max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600/30 border border-rose-500/60 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block font-bold">
              {emergencyChallenge.eventTime}
            </span>
            <h2 className="text-base sm:text-lg font-black text-white">
              {emergencyChallenge.eventTitle}
            </h2>
          </div>
        </div>

        {/* Telemetry Gauge Display */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-rose-950/80 border border-rose-500/50">
          <Gauge className="w-4 h-4 text-rose-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-rose-200">
            Helium: <strong className="text-yellow-300">{pressurePsi} PSI</strong> (LEAKING!)
          </span>
        </div>
      </div>

      {/* 2. Main Emergency Challenge Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full my-4">
        {/* PHASE A: ALARM WARNING */}
        {phase === 'alarm' && (
          <div className="text-center p-8 rounded-3xl bg-slate-900/90 border-2 border-rose-500 shadow-[0_0_80px_rgba(244,63,94,0.6)] animate-bounce">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/50 flex items-center justify-center mx-auto mb-4 text-3xl">
              🚨
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-400">
              WARNING: CRITICAL HELIUM REGULATOR LEAK!
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 mt-2">
              Connecting Mission Control audio link with Dr. Leonard Jaffe...
            </p>
          </div>
        )}

        {/* PHASE B: CHALLENGE QUESTION & CHOICES */}
        {phase === 'challenge' && (
          <div className="w-full space-y-4 animate-fade-in">
            {/* Dr. Jaffe's Transmission */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-sky-400/40 backdrop-blur-md shadow-xl flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-sky-400/40 flex items-center justify-center text-2xl shrink-0">
                👨‍🔬
              </div>
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                <span className="font-bold text-sky-400 block mb-1">
                  Radio Transmission from Dr. Leonard Jaffe:
                </span>
                "{emergencyChallenge.npcBriefing}"
              </div>
            </div>

            {/* Prompt */}
            <div className="text-center py-1">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {emergencyChallenge.question}
              </h3>
            </div>

            {/* 3 Interactive Choices */}
            <div className="space-y-3">
              {emergencyChallenge.options.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  className="w-full p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border-2 border-slate-700/80 hover:border-orange-400 transition-all text-left flex items-start gap-3 group cursor-pointer shadow-lg hover:scale-[1.01]"
                >
                  <span className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center font-bold text-xs text-sky-300 shrink-0 transition-colors">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white leading-relaxed">
                    {opt.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PHASE C: FEEDBACK MODAL ON SELECTION */}
        {phase === 'feedback' && selectedOption && (
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-slate-900/95 border-2 border-sky-400/50 shadow-2xl backdrop-blur-xl space-y-4 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-lg">
              {selectedOption.isCorrect ? (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 w-full h-full rounded-3xl flex items-center justify-center">
                  ✓
                </span>
              ) : (
                <span className="bg-rose-500/20 text-rose-400 border border-rose-400/50 w-full h-full rounded-3xl flex items-center justify-center">
                  ✕
                </span>
              )}
            </div>

            <h3 className={`text-xl sm:text-2xl font-black ${
              selectedOption.isCorrect ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {selectedOption.isCorrect ? 'GENIUS ENGINEERING SOLUTION!' : 'NOT QUITE RIGHT!'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg mx-auto">
              {selectedOption.explanation}
            </p>

            <div className="pt-2">
              {selectedOption.isCorrect ? (
                <GameButton
                  size="lg"
                  variant="success"
                  onClick={handleProceedToTouchdown}
                  icon={Rocket}
                  className="px-8 font-black text-sm sm:text-base"
                >
                  EXECUTE MODIFIED DESCENT BURN!
                </GameButton>
              ) : (
                <GameButton
                  size="md"
                  variant="accent"
                  onClick={() => setPhase('challenge')}
                >
                  Try Again with Dr. Jaffe’s Hints
                </GameButton>
              )}
            </div>
          </div>
        )}

        {/* PHASE D: HISTORIC TOUCHDOWN SUCCESS BANNER */}
        {phase === 'touchdown' && (
          <div className="w-full p-8 rounded-3xl bg-slate-900/95 border-2 border-emerald-400 text-center shadow-[0_0_80px_rgba(16,185,129,0.5)] space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-300 border border-emerald-400 flex items-center justify-center mx-auto text-3xl">
              🌕
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-sky-300">
              HISTORIC TOUCHDOWN CONFIRMED!
            </h3>
            <p className="text-xs sm:text-sm text-sky-200 max-w-md mx-auto">
              Against all odds, the modified vernier engine burn brought Surveyor 5 safely to rest on the lunar mare!
            </p>

            {/* Historical Mission Data Box */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono max-w-md mx-auto">
              <div>
                <span className="text-slate-400 block text-[10px]">LAUNCH</span>
                <span className="font-bold text-sky-300">Sept 8, 1967</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">LANDING</span>
                <span className="font-bold text-emerald-400">Sept 11, 1967</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">LOCATION</span>
                <span className="font-bold text-yellow-300">Mare Tranquillitatis</span>
              </div>
            </div>

            <div className="pt-2">
              <GameButton
                size="lg"
                variant="accent"
                onClick={() => {
                  gameAudio.playSuccess();
                  if (onComplete) onComplete();
                }}
                icon={ChevronRight}
                className="px-8 font-black text-base"
              >
                PROCEED TO LUNAR SOIL ANALYSIS
              </GameButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

