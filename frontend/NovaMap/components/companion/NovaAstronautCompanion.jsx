import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  MessageSquare,
  Send,
  Sparkles,
  Maximize2,
  Radio,
  X,
  AlertCircle
} from 'lucide-react';
import NovaAstronautAvatar from './NovaAstronautAvatar';
import { novaCompanion } from './novaCompanionService';
import { getNovaProfile } from './novaSpaceKnowledge';

/**
 * NovaAstronautCompanion.jsx
 * 
 * NOVA — Interactive AI Astronaut Companion with Two-Way Voice + Written Text.
 * 
 * CORE CAPABILITIES:
 * 1. Cute 3D cartoon astronaut mascot in white and blue spacesuit with floating,
 *    blinking, talking, and explaining hand gestures.
 * 2. Two-way voice conversation:
 *    - Speech-to-text (Web Speech API) with listening indicator.
 *    - AI response generation grounded in NASA/IAU scientific facts.
 *    - Text-to-speech with speaking indicator and animated talking mouth.
 *    - Graceful microphone permission error handling.
 * 3. Compact written conversation overlay beside the astronaut:
 *    - User's recognized question + NOVA's written answer.
 *    - Current selected object badge (Mars, Saturn, Voyager 1, etc.).
 *    - Scrollable, minimizable, non-obstructive.
 * 4. Object-aware context tracking and follow-up question answering.
 * 5. Full user controls: Mute/unmute, Mic toggle, Auto-narrate toggle, Clear, and Minimize.
 */
export default function NovaAstronautCompanion({
  selectedCelestialId,
  selectedMissionSlug,
  isMinimizedDefault = false
}) {
  // Companion Visibility & UI States
  const [isCompanionHidden, setIsCompanionHidden] = useState(isMinimizedDefault);
  const [isConversationOpen, setIsConversationOpen] = useState(true);
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('nova_voice_muted') === 'true';
    } catch {
      return false;
    }
  });
  const [isAutoNarrateEnabled, setIsAutoNarrateEnabled] = useState(() => {
    try {
      return localStorage.getItem('nova_autonarrate_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  // Conversation & AI States
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentObjectLabel, setCurrentObjectLabel] = useState('Solar System');
  const [expression, setExpression] = useState('happy'); // 'happy' | 'explaining' | 'wondering' | 'thinking' | 'excited' | 'listening'

  // Voice Interaction States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGesturing, setIsGesturing] = useState(false);
  const [micErrorNotice, setMicErrorNotice] = useState(null);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);

  // References
  const chatScrollRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const activeUtteranceRef = useRef(null);
  const speechFallbackTimerRef = useRef(null);
  const lastTargetRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setMicErrorNotice(null);
          setExpression('listening');
        };

        recognition.onresult = (event) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
          setIsListening(false);
          setExpression('thinking');
          if (transcript && transcript.trim()) {
            handleProcessQuestion(transcript.trim());
          }
        };

        recognition.onerror = (e) => {
          setIsListening(false);
          setExpression('happy');
          console.warn('Speech recognition status:', e.error);

          if (e.error === 'not-allowed' || e.error === 'permission-denied') {
            setMicErrorNotice('Microphone permission denied. Click to retry or type below!');
          } else if (e.error === 'no-speech') {
            setMicErrorNotice('No voice detected. Try clicking the mic and speaking again!');
          } else {
            setMicErrorNotice(`Speech recognition: ${e.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition setup notice:', err);
        setSpeechRecognitionSupported(false);
      }
    }
  }, []);

  // Stop any ongoing speech synthesis cleanly
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        console.warn('SpeechSynthesis cancel warning:', err);
      }
    }
    if (speechFallbackTimerRef.current) {
      clearTimeout(speechFallbackTimerRef.current);
      speechFallbackTimerRef.current = null;
    }
    setIsSpeaking(false);
    setIsGesturing(false);
  }, []);

  // Speak narration aloud using Web Speech API
  const speakText = useCallback((text, targetExpression = 'explaining') => {
    stopSpeaking();

    if (!text || !text.trim()) return;

    if (isMuted) {
      // If muted, show expressive reaction without audio
      setExpression(targetExpression);
      setIsGesturing(true);
      setTimeout(() => {
        setIsGesturing(false);
        setExpression('happy');
      }, 2000);
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      activeUtteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices() || [];
      const naturalVoice = voices.find(v => 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Victoria')) &&
        v.lang.startsWith('en')
      ) || voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en')) || null;

      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.rate = 0.98;   // Friendly, accessible pace
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

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsGesturing(false);
        setExpression('happy');
      };

      // Safety timeout for synthetic / headless environments
      const wordCount = text.split(/\s+/).length;
      const expectedMs = Math.max(2800, (wordCount / 2.3) * 1000 + 1200);
      speechFallbackTimerRef.current = setTimeout(() => {
        setIsSpeaking(false);
        setIsGesturing(false);
        setExpression('happy');
      }, expectedMs);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis speak notice:', err);
      setIsSpeaking(false);
      setIsGesturing(false);
      setExpression('happy');
    }
  }, [isMuted, stopSpeaking]);

  // Object-Aware Context Tracking: When user selects a Planet or Spacecraft
  useEffect(() => {
    const target = selectedMissionSlug || selectedCelestialId;

    if (!target) {
      if (lastTargetRef.current !== null) {
        stopSpeaking();
        lastTargetRef.current = null;
        setCurrentObjectLabel('Solar System');
      }
      return;
    }

    if (target === lastTargetRef.current) return;
    lastTargetRef.current = target;

    // Trigger companion context change
    const introMsg = novaCompanion.selectObject(target);
    if (introMsg) {
      setMessages([...novaCompanion.conversationHistory]);
      const title = novaCompanion.currentContext?.name || target;
      setCurrentObjectLabel(title);

      // Determine expression
      const targetExp = (target === 'mars' || target === 'saturn' || introMsg.expression === 'excited') ? 'excited' : 'explaining';
      setExpression(targetExp);

      // Auto-narrate aloud if enabled
      if (isAutoNarrateEnabled) {
        speakText(introMsg.text, targetExp);
      }
    }
  }, [selectedCelestialId, selectedMissionSlug, isAutoNarrateEnabled, speakText, stopSpeaking]);

  // Auto-scroll conversation to bottom
  useEffect(() => {
    if (isConversationOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isConversationOpen, isListening]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current && isListening) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [stopSpeaking, isListening]);

  // Process user question (from Voice Speech-to-Text or Text Input)
  const handleProcessQuestion = (questionText) => {
    if (!questionText || !questionText.trim()) return;

    // 1. Process question contextual response
    const reply = novaCompanion.ask(questionText.trim());
    setMessages([...novaCompanion.conversationHistory]);

    if (reply) {
      setExpression(reply.expression || 'happy');
      // Speak response aloud through TTS
      speakText(reply.text, reply.expression || 'explaining');
    }
  };

  // Submit Text Input
  const handleSendTextInput = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const query = inputText.trim();
    setInputText('');
    handleProcessQuestion(query);
  };

  // Toggle Microphone Listening
  const handleToggleListening = (e) => {
    if (e) e.stopPropagation();

    if (!speechRecognitionSupported) {
      setMicErrorNotice('Speech recognition is not supported in this browser. Please type your question!');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (err) {}
      }
      setIsListening(false);
      setExpression('happy');
    } else {
      // Stop any ongoing speech before listening
      stopSpeaking();
      setMicErrorNotice(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn('Recognition start notice:', err);
          setIsListening(false);
        }
      }
    }
  };

  // Toggle Mute / Unmute
  const handleToggleMute = (e) => {
    if (e) e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    try {
      localStorage.setItem('nova_voice_muted', String(nextMuted));
    } catch (e) {}

    if (nextMuted) {
      stopSpeaking();
    } else {
      handleReplayNarration();
    }
  };

  // Toggle Auto-Narration
  const handleToggleAutoNarrate = (e) => {
    if (e) e.stopPropagation();
    const next = !isAutoNarrateEnabled;
    setIsAutoNarrateEnabled(next);
    try {
      localStorage.setItem('nova_autonarrate_enabled', String(next));
    } catch (e) {}
  };

  // Replay latest NOVA response
  const handleReplayNarration = (e) => {
    if (e) e.stopPropagation();
    const history = novaCompanion.conversationHistory;
    const lastNovaMsg = [...history].reverse().find(m => m.sender === 'nova');

    if (lastNovaMsg?.text) {
      speakText(lastNovaMsg.text, lastNovaMsg.expression || 'explaining');
      return;
    }

    const defaultGreeting = `Hello! I'm NOVA, your astronaut space companion! Ask me anything about ${currentObjectLabel || 'the Solar System'} using your microphone or the input below!`;
    speakText(defaultGreeting, 'happy');
  };

  // Clear Conversation History
  const handleClearHistory = (e) => {
    if (e) e.stopPropagation();
    novaCompanion.clearHistory();
    const resetMsg = {
      id: `reset-${Date.now()}`,
      sender: 'nova',
      text: `Conversation cleared! We are currently observing ${currentObjectLabel}. Speak to me using your mic or select any celestial body to learn more! 🚀`,
      timestamp: new Date(),
      expression: 'happy',
      suggestedQuestions: [
        `Can humans live on ${currentObjectLabel}?`,
        `How far is ${currentObjectLabel} from Earth?`,
        `Tell me a fun fact about ${currentObjectLabel}!`
      ]
    };
    novaCompanion.conversationHistory.push(resetMsg);
    setMessages([resetMsg]);
    stopSpeaking();
  };

  // Toggle Conversation Card Overlay
  const handleToggleConversation = (e) => {
    if (e) e.stopPropagation();
    setIsConversationOpen(prev => !prev);
  };

  // Toggle Minimize / Hide Entire Mascot
  const handleToggleHideMascot = (e) => {
    if (e) e.stopPropagation();
    setIsCompanionHidden(prev => !prev);
  };

  return (
    <aside
      id="nova-companion-container"
      className="fixed bottom-12 right-4 sm:bottom-16 sm:right-6 z-30 pointer-events-auto select-none font-sans flex items-end gap-3.5"
      role="complementary"
      aria-label="NOVA Interactive AI Astronaut Companion"
    >
      {/* ================================================================= */}
      {/* 1. COMPACT WRITTEN CONVERSATION OVERLAY (BESIDE ASTRONAUT)        */}
      {/* ================================================================= */}
      {!isCompanionHidden && isConversationOpen && (
        <div 
          id="nova-conversation-overlay"
          className="w-76 sm:w-84 md:w-92 max-h-[380px] flex flex-col bg-[#09071c]/94 backdrop-blur-2xl border border-cyan-500/35 rounded-2xl shadow-2xl shadow-cyan-950/80 text-white animate-fadeIn overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-2.5 px-3 bg-gradient-to-r from-cyan-950/50 via-purple-950/40 to-slate-950/60 border-b border-cyan-500/25 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {/* Selected Object Badge */}
              <span className="text-[10px] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 truncate max-w-[125px]">
                {currentObjectLabel ? `🪐 ${currentObjectLabel}` : '🚀 Solar System'}
              </span>

              {/* Real-Time Listening / Speaking Indicators */}
              {isListening ? (
                <span className="flex items-center gap-1 text-[10px] font-mono text-rose-300 bg-rose-950/70 px-2 py-0.5 rounded-full border border-rose-400/50 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  <span>Listening...</span>
                </span>
              ) : isSpeaking ? (
                <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-400/40">
                  <span className="flex items-center gap-0.5">
                    <span className="w-0.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="w-0.5 h-3.5 bg-cyan-300 rounded-full animate-pulse delay-75" />
                    <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-pulse delay-150" />
                  </span>
                  <span>Speaking</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  NOVA • Space Companion
                </span>
              )}
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-1 text-slate-400 shrink-0">
              {/* Voice Mute Toggle */}
              <button
                type="button"
                id="nova-mute-toggle-btn"
                onClick={handleToggleMute}
                className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                  isMuted 
                    ? 'text-rose-400 border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/40' 
                    : 'text-cyan-300 border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/40'
                }`}
                title={isMuted ? "Unmute voice narration" : "Mute voice narration"}
                aria-label="Toggle Mute"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Auto-Narration on Select Toggle */}
              <button
                type="button"
                id="nova-autonarrate-btn"
                onClick={handleToggleAutoNarrate}
                className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                  isAutoNarrateEnabled 
                    ? 'text-cyan-300 border-cyan-500/30 bg-cyan-950/40' 
                    : 'text-slate-500 border-transparent hover:text-white'
                }`}
                title={isAutoNarrateEnabled ? "Auto-narration ON (Speaks on click)" : "Auto-narration OFF"}
                aria-label="Toggle Auto Narration"
              >
                <Radio className="w-3.5 h-3.5" />
              </button>

              {/* Clear History */}
              <button
                type="button"
                id="nova-clear-btn"
                onClick={handleClearHistory}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Minimize Written Overlay */}
              <button
                type="button"
                id="nova-card-minimize-btn"
                onClick={handleToggleConversation}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Minimize written conversation"
                aria-label="Minimize written overlay"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Conversation Stream (Written Text) */}
          <div 
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs font-sans max-h-[220px] no-scrollbar"
          >
            {messages.length === 0 && (
              <div className="text-center py-4 text-slate-400 text-xs">
                <Sparkles className="w-5 h-5 text-cyan-400 mx-auto mb-1 animate-pulse" />
                <p>Welcome! Click the mic or ask a question about {currentObjectLabel}.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div 
                  className={`max-w-[92%] p-2.5 rounded-2xl leading-relaxed shadow-sm font-sans text-[11.5px] ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-[#12112e]/95 border border-cyan-500/25 text-slate-100 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">
                    {msg.sender === 'user' ? `🧑 ${msg.text}` : `👨‍🚀 ${msg.text}`}
                  </p>
                </div>

                {/* Suggested Questions Chips for NOVA responses */}
                {msg.sender === 'nova' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5 max-w-[96%]">
                    {msg.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleProcessQuestion(q)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-200 hover:text-white transition-all text-left cursor-pointer active:scale-95 shadow-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Microphone Error Banner */}
            {micErrorNotice && (
              <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-200 text-[11px] flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{micErrorNotice}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setMicErrorNotice(null)} 
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Interactive Voice & Text Input Bar */}
          <form 
            onSubmit={handleSendTextInput}
            className="p-2 px-3 bg-black/50 border-t border-cyan-500/20 flex items-center gap-2 shrink-0"
          >
            {/* Microphone Button (Speech-to-Text) */}
            <button
              type="button"
              id="nova-mic-btn"
              onClick={handleToggleListening}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isListening 
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-950/80' 
                  : 'bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border-cyan-500/40 hover:border-cyan-400'
              }`}
              title={isListening ? "Listening... Click to stop" : "Speak naturally to NOVA via microphone"}
              aria-label={isListening ? "Stop voice listening" : "Start voice listening"}
            >
              {isListening ? <Mic className="w-4 h-4 text-white animate-bounce" /> : <Mic className="w-4 h-4 text-cyan-300" />}
            </button>

            {/* Text Input (Alternative / Fallback) */}
            <input
              ref={inputRef}
              type="text"
              id="nova-text-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Listening... speak now" : `Ask NOVA about ${currentObjectLabel}...`}
              className="flex-1 bg-slate-900/90 border border-slate-700/60 focus:border-cyan-400 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
            />

            {/* Send Question Button */}
            <button
              type="submit"
              id="nova-text-send-btn"
              disabled={!inputText.trim()}
              className="p-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white transition-all cursor-pointer shadow-md shadow-cyan-900/50"
              aria-label="Send question"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. FLOATING ASTRONAUT MASCOT & COMPACT CONTROLS PILL               */}
      {/* ================================================================= */}
      {!isCompanionHidden && (
        <div className="flex flex-col items-center">
          {/* Main 3D Cartoon Astronaut Character */}
          <div 
            id="nova-mascot-character"
            onClick={handleReplayNarration}
            className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
            title={isSpeaking ? "NOVA is speaking! Click to replay" : `NOVA • Click to hear about ${currentObjectLabel}`}
          >
            <NovaAstronautAvatar
              size={120}
              expression={expression}
              isSpeaking={isSpeaking}
              isGesturing={isGesturing}
              isListening={isListening}
            />
          </div>

          {/* Minimal Floating Pill beneath mascot */}
          <div 
            id="nova-companion-controls"
            className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 bg-[#09071c]/85 backdrop-blur-md border border-cyan-500/30 rounded-full shadow-xl shadow-cyan-950/70 text-slate-300"
          >
            {/* Quick Microphone Button on Pill */}
            <button
              type="button"
              id="nova-mic-pill-btn"
              onClick={handleToggleListening}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isListening 
                  ? 'text-rose-400 bg-rose-950/60 animate-pulse' 
                  : 'text-cyan-300 hover:text-cyan-200 hover:bg-cyan-900/50'
              }`}
              title={isListening ? "Stop listening" : "Talk to NOVA via microphone"}
              aria-label="Microphone"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>

            {/* Quick Replay Button */}
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

            {/* Toggle Written Conversation Card */}
            <button
              type="button"
              id="nova-toggle-card-btn"
              onClick={handleToggleConversation}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isConversationOpen 
                  ? 'text-cyan-300 bg-cyan-950/50' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={isConversationOpen ? "Hide written conversation" : "Show written conversation"}
              aria-label="Toggle written conversation"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>

            {/* Minimize / Hide Mascot */}
            <button
              type="button"
              id="nova-hide-btn"
              onClick={handleToggleHideMascot}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Minimize NOVA companion"
              aria-label="Minimize companion"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. MINIMIZED FLOATING BADGE (WHEN FULLY MINIMIZED)                 */}
      {/* ================================================================= */}
      {isCompanionHidden && (
        <button
          type="button"
          id="nova-expand-btn"
          onClick={handleToggleHideMascot}
          className="relative p-2 rounded-full bg-gradient-to-br from-[#0c1a36] via-[#101036] to-[#08061a] border-2 border-cyan-400/60 hover:border-cyan-300 shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-400/60 cursor-pointer transition-all hover:scale-110 active:scale-95 group focus:outline-none"
          title="Meet NOVA • Your AI Astronaut Companion"
          aria-label="Expand NOVA companion"
        >
          <NovaAstronautAvatar
            size={48}
            expression="happy"
            isSpeaking={false}
            isGesturing={false}
            isListening={false}
          />
          <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-cyan-600 text-white border border-[#09071c] shadow">
            <Maximize2 className="w-2.5 h-2.5" />
          </span>
        </button>
      )}
    </aside>
  );
}
