import React, { useState } from 'react';
import { 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  Atom, 
  ChevronRight, 
  Rocket, 
  Radio, 
  Layers,
  ArrowDown
} from 'lucide-react';
import GameButton from '../shared/GameButton';
import { SURVEYOR_5_MISSION } from '../../config/surveyor5Data';
import { gameAudio } from '../../config/gameAudio';

/**
 * SoilAnalysisScene.jsx
 * 
 * Scene 5: Lunar Soil Analysis (3:30 - 4:30)
 * - Deploy Alpha-Scattering Instrument (Curium-242 radioactive source) onto lunar soil.
 * - Interactive spectrometer telemetry display (Titanium, Iron, Magnesium, Basalt).
 * - Proves lunar surface can support the Apollo Lunar Module.
 * - Apollo 11 crossover transition to July 1969!
 */
export default function SoilAnalysisScene({ onComplete }) {
  const [isDeployed, setIsDeployed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showApolloCrossover, setShowApolloCrossover] = useState(false);

  const { soilAnalysis } = SURVEYOR_5_MISSION;

  const handleDeploySensor = () => {
    gameAudio.playClick();
    setIsDeployed(true);
    setIsAnalyzing(true);
    gameAudio.playAnalyze();

    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      gameAudio.playSuccess();
    }, 2800);
  };

  const handleShowApollo = () => {
    gameAudio.playTimeTravel();
    setShowApolloCrossover(true);
  };

  return (
    <div className="relative w-full h-full min-h-[550px] flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none">
      {/* Lunar Soil Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter brightness-40"
        style={{ backgroundImage: "url('/textures/planets/moon.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

      {/* 1. Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-950/85 p-4 rounded-3xl border border-purple-400/50 backdrop-blur-md shadow-xl max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
            <Atom className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              ALPHA-SCATTERING SPECTROMETER EXPERIMENT
            </h2>
            <span className="text-xs text-purple-300 font-mono">
              Dr. Anthony Turkevich • University of Chicago
            </span>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-xs font-bold text-purple-300">
          Radioactive Curium-242 Source
        </div>
      </div>

      {/* 2. Main Scientific Interactive Display */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full my-4">
        {/* VIEW A: DEPLOYMENT STAGE */}
        {!isDeployed && (
          <div className="p-8 rounded-3xl bg-slate-900/90 border-2 border-purple-400 shadow-[0_0_60px_rgba(168,85,247,0.35)] text-center max-w-lg space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/20 text-purple-300 border border-purple-400 flex items-center justify-center mx-auto text-3xl">
              📦
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Sensor Lowering Winch Ready
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Surveyor 5 carries the sensor box suspended beneath the spacecraft frame. Tap below to release the nylon cord winch and lower the detector directly onto lunar dust!
            </p>
            <div className="pt-2">
              <GameButton
                size="lg"
                variant="purple"
                onClick={handleDeploySensor}
                icon={ArrowDown}
                className="w-full text-base font-black shadow-purple-600/30"
              >
                DEPLOY SENSOR ONTO LUNAR SOIL
              </GameButton>
            </div>
          </div>
        )}

        {/* VIEW B: ANALYZING ANIMATION */}
        {isAnalyzing && (
          <div className="p-8 rounded-3xl bg-slate-900/90 border-2 border-sky-400 text-center max-w-md space-y-4 animate-pulse">
            <div className="w-16 h-16 rounded-3xl bg-sky-500/20 text-sky-400 border border-sky-400 flex items-center justify-center mx-auto text-3xl">
              ⚡
            </div>
            <h3 className="text-xl font-black text-sky-300">
              COUNTING BACKSCATTERED ALPHA PARTICLES...
            </h3>
            <p className="text-xs text-slate-300 font-mono">
              Bombarding lunar minerals with alpha radiation. Measuring energy return spikes...
            </p>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 via-sky-400 to-emerald-400 animate-pulse w-full" />
            </div>
          </div>
        )}

        {/* VIEW C: SCIENTIFIC RESULTS BREAKDOWN */}
        {showResults && !showApolloCrossover && (
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-slate-900/95 border-2 border-emerald-400 shadow-2xl backdrop-blur-xl space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/30 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                  TELEMETRY RECEIVED • FIRST CHEMICAL ASSAY OF THE MOON
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Lunar Soil Composition: Volcanic Basalt
                </h3>
              </div>
              <span className="text-xs font-black text-yellow-300 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-400/40">
                100% Solid Bedrock Confirmed
              </span>
            </div>

            {/* Elements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {soilAnalysis.elementsDetected.map((elem) => (
                <div 
                  key={elem.element}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1"
                >
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="text-sky-300">{elem.element}</span>
                    <span className="text-yellow-300 font-mono">{elem.percentage}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {elem.meaning}
                  </p>
                </div>
              ))}
            </div>

            {/* Impact for Human Spaceflight */}
            <div className="p-3.5 rounded-2xl bg-sky-950/60 border border-sky-400/30 text-xs text-sky-100 leading-relaxed">
              <strong className="text-white">Why This Mattered: </strong>
              {soilAnalysis.apolloImpact}
            </div>

            <div className="flex justify-end pt-2">
              <GameButton
                size="lg"
                variant="accent"
                onClick={handleShowApollo}
                icon={Rocket}
                className="font-black text-sm sm:text-base px-6"
              >
                TRAVEL TO JULY 1969 • APOLLO 11 CROSSOVER
              </GameButton>
            </div>
          </div>
        )}

        {/* VIEW D: JULY 1969 APOLLO 11 CROSSOVER */}
        {showApolloCrossover && (
          <div className="w-full p-6 sm:p-8 rounded-3xl bg-slate-900/95 border-2 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.4)] text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-yellow-500/20 text-yellow-300 border border-yellow-400 flex items-center justify-center mx-auto text-3xl">
              🦅
            </div>
            <span className="text-xs font-mono text-yellow-400 font-black tracking-widest block">
              20 JULY 1969 • 20:17 UTC • SEA OF TRANQUILITY
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-orange-300">
              "Houston, Tranquility Base here. The Eagle has landed."
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto leading-relaxed">
              Just 15 miles away from Surveyor 5, Apollo 11 touched down safely on the very basaltic soil Surveyor 5 analyzed two years prior! Without Surveyor 5’s data, NASA could never have risked landing humans here.
            </p>
            <div className="pt-2">
              <GameButton
                size="lg"
                variant="highlight"
                onClick={() => {
                  gameAudio.playVictory();
                  if (onComplete) onComplete();
                }}
                icon={ChevronRight}
                className="text-slate-950 font-black text-base px-8"
              >
                PROCEED TO MISSION CONCLUSION
              </GameButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
