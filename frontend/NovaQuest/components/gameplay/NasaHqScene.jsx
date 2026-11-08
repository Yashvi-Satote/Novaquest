import React, { useState } from 'react';
import { Calendar, MapPin, Sparkles, ChevronRight, BookOpen, User } from 'lucide-react';
import DialogueBox from '../shared/DialogueBox';
import GameButton from '../shared/GameButton';
import { gameAudio } from '../../config/gameAudio';

/**
 * NasaHqScene.jsx
 * 
 * Scene 2: NASA Headquarters 1967 (0:45 - 1:15)
 * Location: NASA HQ, Washington D.C. • 17 April 1967
 * Lead NPC: Leonard Jaffe (NASA Surveyor Program Project Scientist)
 * Hero: Leo Stoolman
 */
export default function NasaHqScene({ onComplete }) {
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const DIALOGUES = [
    {
      speaker: 'Leonard Jaffe',
      role: 'NASA Project Scientist, Surveyor Program',
      avatarType: 'jaffe',
      text: 'Welcome to NASA Headquarters, Leo! I’m Leonard Jaffe. You’ve arrived on April 17, 1967. The Apollo program is counting on us to survey the Moon before humans land!'
    },
    {
      speaker: 'Leo Stoolman',
      role: 'Time Traveling Explorer',
      avatarType: 'leo',
      text: 'Dr. Jaffe, what makes Surveyor 5 so different from the earlier lunar probes?'
    },
    {
      speaker: 'Leonard Jaffe',
      role: 'NASA Project Scientist, Surveyor Program',
      avatarType: 'jaffe',
      text: 'Surveyor 5 is carrying a breakthrough scientific payload: the Alpha-Scattering Instrument! It will be the first machine in human history to determine the exact chemical composition of lunar soil.'
    },
    {
      speaker: 'Leonard Jaffe',
      role: 'NASA Project Scientist, Surveyor Program',
      avatarType: 'jaffe',
      text: 'Before Neil Armstrong and Buzz Aldrin set foot in Mare Tranquillitatis, we must prove the lunar crust won’t collapse under the weight of the Lunar Module!'
    },
    {
      speaker: 'Leonard Jaffe',
      role: 'NASA Project Scientist, Surveyor Program',
      avatarType: 'jaffe',
      text: 'The spacecraft is being prepped right now at the Hughes assembly lab. Let’s head to the cleanroom and inspect every single component before launch!'
    }
  ];

  const handleNextDialogue = () => {
    if (dialogueIndex < DIALOGUES.length - 1) {
      setDialogueIndex(prev => prev + 1);
    } else {
      gameAudio.playSuccess();
      if (onComplete) onComplete();
    }
  };

  const currentDialogue = DIALOGUES[dialogueIndex];
  const isFinal = dialogueIndex === DIALOGUES.length - 1;

  return (
    <div className="relative w-full h-full min-h-[550px] flex flex-col justify-between p-4 sm:p-8 overflow-hidden select-none">
      {/* Retro 1967 NASA Office Environment Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter brightness-50 contrast-125"
        style={{
          backgroundImage: "radial-gradient(circle at center, #1e293b 0%, #0f172a 60%, #020617 100%)"
        }}
      />

      {/* Retro Office Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-30 flex items-center justify-around">
        <div className="w-80 h-96 border-2 border-sky-400/30 rounded-2xl p-4 bg-slate-900/60 hidden lg:block">
          <span className="text-[10px] font-mono text-sky-400 block mb-2">SURVEYOR PROJECT ARCHIVE • 1967</span>
          <div className="space-y-2 text-[10px] font-mono text-slate-300">
            <p>• LAUNCH VEHICLE: Atlas-Centaur AC-13</p>
            <p>• TARGET: Mare Tranquillitatis</p>
            <p>• PAYLOAD: Alpha-Scattering Spectrometer</p>
            <p>• TV SYSTEM: 600-line Vidicon Sensor</p>
            <p>• PROPULSION: Solid Retro + 3 Verniers</p>
          </div>
        </div>
        <div className="w-72 h-72 rounded-full border border-orange-400/20 flex items-center justify-center hidden md:flex">
          <div className="w-48 h-48 rounded-full border border-sky-400/30 animate-spin" style={{ animationDuration: '40s' }} />
        </div>
      </div>

      {/* 1. Scene Header Banner */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-950/85 p-4 rounded-3xl border border-sky-400/40 backdrop-blur-md shadow-xl max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              NASA HEADQUARTERS • WASHINGTON D.C.
            </h2>
            <div className="flex items-center gap-2 text-xs text-sky-300 font-bold">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>17 APRIL 1967</span>
            </div>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-sky-950/80 border border-sky-400/40 text-xs font-bold text-sky-300">
          Briefing {dialogueIndex + 1} of {DIALOGUES.length}
        </div>
      </div>

      {/* 2. Center Historical Office Visual Presentation */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-6 my-4">
        {/* Animated 1967 Engineer & Blackboard */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-900/90 border-2 border-sky-400/50 shadow-2xl backdrop-blur-xl max-w-xl w-full">
          <div className="text-5xl sm:text-6xl mb-3 animate-bounce" style={{ animationDuration: '2.5s' }}>
            👨‍🔬 🚀
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
            Dr. Leonard Jaffe’s Mission Office
          </h3>
          <p className="text-xs sm:text-sm text-sky-200/90 leading-relaxed">
            Blueprints of the Surveyor spacecraft cover the corkboard behind him, alongside flight telemetry trajectory plots to the Sea of Tranquility.
          </p>
        </div>
      </div>

      {/* 3. Interactive Dialogue Box Component */}
      <div className="relative z-10 w-full">
        <DialogueBox
          speaker={currentDialogue.speaker}
          role={currentDialogue.role}
          avatarType={currentDialogue.avatarType}
          text={currentDialogue.text}
          onContinue={handleNextDialogue}
          continueLabel={isFinal ? 'Proceed to Assembly Lab' : 'Next'}
          isFinal={isFinal}
        />
      </div>
    </div>
  );
}

