import React, { useEffect, useState } from 'react';
import { ChevronRight, Volume2, UserCheck, Sparkles } from 'lucide-react';
import GameButton from './GameButton';
import { gameAudio } from '../../config/gameAudio';

/**
 * DialogueBox.jsx
 * 
 * Kid-friendly interactive dialogue system.
 * - Displays character portrait / badge.
 * - Subtitles with clean readable typography.
 * - Supports animated typewriter or instant display.
 * - Continue button with sound effects.
 */
export default function DialogueBox({
  speaker = 'Leonard Jaffe',
  role = 'NASA Project Scientist, Surveyor Program',
  avatarImage = null,
  avatarType = 'jaffe', // 'jaffe' | 'leo' | 'control' | 'nova'
  text = '',
  onContinue,
  continueLabel = 'Continue',
  isFinal = false,
  className = ''
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect
  useEffect(() => {
    let currentIdx = 0;
    setIsTyping(true);
    setDisplayedText('');

    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx <= text.length) {
        setDisplayedText(text.slice(0, currentIdx));
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [text]);

  const handleSkipOrContinue = () => {
    if (isTyping) {
      setDisplayedText(text);
      setIsTyping(false);
    } else if (onContinue) {
      gameAudio.playClick();
      onContinue();
    }
  };

  // Keyboard shortcut (Space / Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleSkipOrContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, text, onContinue]);

  return (
    <div 
      onClick={isTyping ? handleSkipOrContinue : undefined}
      className={`relative w-full max-w-4xl mx-auto p-5 sm:p-6 rounded-3xl bg-slate-900/90 backdrop-blur-xl border-2 border-sky-400/50 shadow-[0_12px_40px_rgba(2,132,199,0.35)] text-white select-none transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {/* Character Portrait */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 p-1 shadow-lg ring-2 ring-sky-300/60 overflow-hidden flex items-center justify-center">
            {avatarType === 'jaffe' ? (
              <div className="w-full h-full bg-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-1">
                <span className="text-2xl sm:text-3xl">👨‍🔬</span>
                <span className="text-[9px] font-bold text-sky-300 uppercase tracking-tighter">NASA 1967</span>
              </div>
            ) : avatarType === 'leo' ? (
              <div className="w-full h-full bg-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-1">
                <span className="text-2xl sm:text-3xl">🧑‍🚀</span>
                <span className="text-[9px] font-bold text-orange-300 uppercase tracking-tighter">Leo</span>
              </div>
            ) : avatarType === 'nova' ? (
              <div className="w-full h-full bg-slate-800 rounded-xl flex items-center justify-center">
                <img src="/images/nova_alien_companion.png" alt="NOVA" className="w-14 h-14 object-contain" />
              </div>
            ) : (
              <div className="w-full h-full bg-slate-800 rounded-xl flex items-center justify-center text-2xl">
                📡
              </div>
            )}
          </div>
          {/* Active Speaker Indicator */}
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-slate-900"></span>
          </span>
        </div>

        {/* Dialogue Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-orange-300 tracking-wide">
                {speaker}
              </span>
              <span className="text-[11px] sm:text-xs text-sky-300/80 font-medium px-2 py-0.5 rounded-full bg-sky-950/60 border border-sky-500/30">
                {role}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              [Press SPACE to advance]
            </span>
          </div>

          <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-medium min-h-[48px]">
            {displayedText}
            {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-sky-400 animate-pulse align-middle" />}
          </p>
        </div>

        {/* Continue Action */}
        <div className="shrink-0 w-full sm:w-auto flex justify-end pt-2 sm:pt-0">
          <GameButton
            size="md"
            variant={isFinal ? 'success' : 'accent'}
            onClick={handleSkipOrContinue}
            icon={ChevronRight}
          >
            {isTyping ? 'Skip' : continueLabel}
          </GameButton>
        </div>
      </div>
    </div>
  );
}
