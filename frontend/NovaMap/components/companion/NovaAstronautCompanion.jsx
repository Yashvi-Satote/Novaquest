import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ChevronDown, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import NovaAstronautAvatar from './NovaAstronautAvatar';
import { getNovaProfile } from './novaSpaceKnowledge';

/**
 * NovaAstronautCompanion.jsx
 * 
 * NOVA — The Animated Cartoon Astronaut Companion of NovaQuest.
 * 
 * STRICT ARCHITECTURE (Per User Requirements):
 * - ZERO CHAT INTERFACE: No chat window, no input, no send button, no chat bubbles,
 *   no message history, and no suggested question chips.
 * - PURE 3D ANIMATED MASCOT: Floating screen overlay in the corner with a transparent background.
 * - White and blue spacesuit, transparent helmet, blinking eyes, speech-synced mouth, and hand gestures.
 * - OBJECT-AWARE VOICE NARRATION:
 *   When user selects Mars, Saturn, Moon, or Voyager 1, camera zooms in, previous speech cancels,
 *   and NOVA gestures while narrating scientifically accurate, child-friendly voice facts via Web Speech API.
 * - Minimal floating pill: Mute/unmute, replay narration, and minimize/hide.
 */
export default function NovaAstronautCompanion({
  selectedCelestialId,
  selectedMissionSlug,
  isMinimizedDefault = false
}) {
  const [isMinimized, setIsMinimized] = useState(isMinimizedDefault);
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('nova_voice_muted') === 'true';
    } catch {
      return false;
    }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGesturing, setIsGesturing] = useState(false);
  const [expression, setExpression] = useState('happy'); // 'happy' | 'explaining' | 'excited' | 'wondering'
  const [currentObjectLabel, setCurrentObjectLabel] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);

  const activeUtteranceRef = useRef(null);
  const speechFallbackTimerRef = useRef(null);
  const lastTargetRef = useRef(null);

  // Check speech synthesis support on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpeechSupported(false);
    }
  }, []);

  // Stop any ongoing speech narration cleanly
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        console.warn('speechSynthesis cancel warning:', err);
      }
    }
    if (speechFallbackTimerRef.current) {
      clearTimeout(speechFallbackTimerRef.current);
      speechFallbackTimerRef.current = null;
    }
    setIsSpeaking(false);
    setIsGesturing(false);
    setExpression('happy');
  }, []);

  // Speak a given text narration using the browser's Web Speech API
  const speakNarration = useCallback((text, targetExpression = 'explaining') => {
    stopSpeaking();

    if (!text || !text.trim()) return;
    if (isMuted) {
      // If muted, still show brief expressive gesture reaction without voice
      setExpression(targetExpression);
      setIsGesturing(true);
      const timer = setTimeout(() => {
        setIsGesturing(false);
        setExpression('happy');
      }, 2200);
      speechFallbackTimerRef.current = timer;
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpeechSupported(false);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      activeUtteranceRef.current = utterance;

      // Select natural, friendly voice if available
      const voices = window.speechSynthesis.getVoices() || [];
      const naturalVoice = voices.find(v => 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Victoria')) &&
        v.lang.startsWith('en')
      ) || voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en')) || null;

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      // Friendly child-oriented astronaut voice characteristics
      utterance.rate = 0.96;   // Clear, engaging pace
      utterance.pitch = 1.12;  // Warm, upbeat tone

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsGesturing(true);
        setExpression(targetExpression);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsGesturing(false);
        setExpression('happy');
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis playback note:', e);
        setIsSpeaking(false);
        setIsGesturing(false);
        setExpression('happy');
      };

      // Safety timeout: ensure gestures stop even if synthetic/headless browser onend doesn't fire
      const wordCount = text.split(/\s+/).length;
      const expectedMs = Math.max(3000, (wordCount / 2.3) * 1000 + 1200);
      speechFallbackTimerRef.current = setTimeout(() => {
        setIsSpeaking(false);
        setIsGesturing(false);
        setExpression('happy');
      }, expectedMs);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Could not trigger SpeechSynthesis:', err);
      setIsSpeaking(false);
      setIsGesturing(false);
      setExpression('happy');
    }
  }, [isMuted, stopSpeaking]);

  // Object-Aware Reaction: Trigger narration on target selection change
  useEffect(() => {
    const target = selectedMissionSlug || selectedCelestialId;

    if (!target) {
      // Nothing selected: neutral happy float
      if (lastTargetRef.current !== null) {
        stopSpeaking();
        lastTargetRef.current = null;
        setCurrentObjectLabel('');
      }
      return;
    }

    // Don't re-trigger if target hasn't changed
    if (target === lastTargetRef.current) return;
    lastTargetRef.current = target;

    // Look up verified knowledge profile & spoken narration
    const profile = getNovaProfile(target);
    if (!profile) return;

    setCurrentObjectLabel(profile.name || target);

    // Determine mascot expression based on category
    let targetExpression = 'explaining';
    if (profile.type === 'spacecraft' || target === 'mars' || target === 'saturn') {
      targetExpression = 'excited';
    } else if (profile.type === 'moon') {
      targetExpression = 'wondering';
    }

    // Trigger voice narration
    if (profile.spokenNarration) {
      speakNarration(profile.spokenNarration, targetExpression);
    }
  }, [selectedCelestialId, selectedMissionSlug, speakNarration, stopSpeaking]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // Toggle Mute / Unmute
  const handleToggleMute = (e) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    try {
      localStorage.setItem('nova_voice_muted', String(nextMuted));
    } catch (e) {
      console.warn('Failed to save mute preference', e);
    }

    if (nextMuted) {
      stopSpeaking();
    } else {
      // Re-trigger current narration or friendly greeting
      handleReplayNarration();
    }
  };

  // Replay Current Object Narration
  const handleReplayNarration = (e) => {
    if (e) e.stopPropagation();
    const target = selectedMissionSlug || selectedCelestialId;
    if (target) {
      const profile = getNovaProfile(target);
      if (profile?.spokenNarration) {
        speakNarration(profile.spokenNarration, 'explaining');
        return;
      }
    }
    // Default welcome narration if no object currently focused
    const defaultWelcome = "Hi there! I'm NOVA, your astronaut space guide! Click any planet or spacecraft in our 3D Solar System to explore cosmic wonders together!";
    speakNarration(defaultWelcome, 'happy');
  };

  // Toggle Minimize
  const handleToggleMinimize = (e) => {
    if (e) e.stopPropagation();
    setIsMinimized(prev => !prev);
  };

  return (
    <aside
      id="nova-companion-container"
      className="fixed bottom-12 right-6 sm:bottom-16 sm:right-8 z-30 pointer-events-auto select-none font-sans"
      role="complementary"
      aria-label="NOVA Animated Astronaut Space Companion"
    >
      {/* ================================================================= */}
      {/* 1. EXPANDED: FLOATING ANIMATED MASCOT (NO CHAT INTERFACE)          */}
      {/* ================================================================= */}
      {!isMinimized && (
        <div className="flex flex-col items-center animate-fadeIn">
          {/* Main 3D Cartoon Astronaut Character */}
          <div 
            className="cursor-pointer hover:scale-105 active:scale-98 transition-transform duration-200"
            onClick={handleReplayNarration}
            title={isSpeaking ? "NOVA is speaking! Click to replay" : (currentObjectLabel ? `NOVA • Click to hear about ${currentObjectLabel}` : "Click NOVA to hear a cosmic intro!")}
          >
            <NovaAstronautAvatar
              size={145}
              expression={expression}
              isSpeaking={isSpeaking}
              isGesturing={isGesturing}
            />
          </div>

          {/* Minimal Floating Control Pill (Directly beneath mascot) */}
          <div 
            id="nova-companion-controls"
            className="flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-[#09071c]/85 backdrop-blur-md border border-cyan-500/30 rounded-full shadow-xl shadow-cyan-950/60 text-slate-300"
          >
            {/* Object Badge (when an object is focused) */}
            {currentObjectLabel && (
              <span className="text-[10px] font-mono font-semibold text-cyan-300 px-1.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 max-w-[110px] truncate">
                {currentObjectLabel}
              </span>
            )}

            {/* Speaking / Audio Waves Indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-0.5 px-1" title="Speaking voice narration">
                <span className="w-0.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
                <span className="w-0.5 h-4 bg-cyan-300 rounded-full animate-pulse delay-75" />
                <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-pulse delay-150" />
              </div>
            )}

            {/* Mute / Unmute Button */}
            <button
              type="button"
              id="nova-mute-btn"
              onClick={handleToggleMute}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isMuted 
                  ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/50' 
                  : 'text-cyan-300 hover:text-cyan-200 hover:bg-cyan-900/50'
              }`}
              title={isMuted ? "Unmute voice narration" : "Mute voice narration"}
              aria-label={isMuted ? "Unmute NOVA" : "Mute NOVA"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Replay Voice Narration Button */}
            <button
              type="button"
              id="nova-replay-btn"
              onClick={handleReplayNarration}
              className="p-1 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
              title="Replay voice narration"
              aria-label="Replay voice narration"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Minimize / Hide Character Button */}
            <button
              type="button"
              id="nova-hide-btn"
              onClick={handleToggleMinimize}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Minimize NOVA"
              aria-label="Minimize NOVA companion"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. MINIMIZED: COMPACT FLOATING ASTRONAUT HELMET BADGE             */}
      {/* ================================================================= */}
      {isMinimized && (
        <button
          type="button"
          id="nova-expand-btn"
          onClick={handleToggleMinimize}
          className="relative p-2 rounded-full bg-gradient-to-br from-[#0c1a36] via-[#101036] to-[#08061a] border-2 border-cyan-400/60 hover:border-cyan-300 shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-400/60 cursor-pointer transition-all hover:scale-110 active:scale-95 group focus:outline-none"
          title="Meet NOVA • Your Space Companion"
          aria-label="Expand NOVA space companion"
        >
          <NovaAstronautAvatar
            size={48}
            expression="happy"
            isSpeaking={false}
            isGesturing={false}
          />
          <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-cyan-600 text-white border border-[#09071c] shadow">
            <Maximize2 className="w-2.5 h-2.5" />
          </span>
        </button>
      )}
    </aside>
  );
}
