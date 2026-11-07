import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw, 
  ChevronDown, 
  Mic,
  MicOff,
  FileText
} from 'lucide-react';
import NovaAstronautAvatar from './NovaAstronautAvatar';
import { novaCompanion } from './novaCompanionService';

/**
 * NovaAstronautCompanion.jsx
 * 
 * Interactive AI Astronaut Companion: NOVA — Your Personal Space Guide.
 * 
 * Sits in the corner without obstructing the 3D Solar System.
 * Replaces bulky right-side detail drawers as the primary information interface.
 */
export default function NovaAstronautCompanion({
  selectedCelestialId,
  selectedMissionSlug,
  onExploreScale,
  onFocusCelestial,
  onOpenTelemetryDrawer,
  isMinimizedDefault = false
}) {
  const [isExpanded, setIsExpanded] = useState(!isMinimizedDefault);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [currentExpression, setCurrentExpression] = useState('happy');
  const [activeContextTitle, setActiveContextTitle] = useState('Solar System Exploration');
  const [hasUnread, setHasUnread] = useState(false);
  const [latestTeaser, setLatestTeaser] = useState('Click any planet, moon, or spacecraft to explore with me!');

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported by the browser
  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
          if (transcript) {
            setInputText(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = (e) => {
          console.warn('Speech recognition warning:', e);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Could not initialize SpeechRecognition:', err);
      }
    }
  }, []);

  // Initialize with welcoming greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = {
        id: 'welcome-init',
        sender: 'nova',
        text: "Hi! 👨‍🚀 I'm NOVA, your personal astronaut space guide! Click any planet, moon, or spacecraft in our 3D Solar System, and I'll fly over with you to share cosmic secrets and mind-blowing science!",
        timestamp: new Date(),
        expression: 'happy',
        suggestedQuestions: [
          'What is the biggest planet?',
          'Which planet is the hottest?',
          'Tell me about Voyager 1!',
          'Are there oceans on Europa?'
        ]
      };
      setMessages([welcomeMsg]);
      setLatestTeaser("Click any planet, moon, or spacecraft to explore with me!");
    }
  }, []);

  // React to selected celestial body or spacecraft changes
  useEffect(() => {
    const target = selectedMissionSlug || selectedCelestialId;
    if (!target) return;

    // Trigger companion context change
    const newMsg = novaCompanion.selectObject(target);
    if (newMsg) {
      setMessages(prev => [...prev, newMsg]);
      setCurrentExpression(newMsg.expression || 'explaining');
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2600);

      const title = novaCompanion.currentContext?.name || target;
      setActiveContextTitle(`Exploring: ${title}`);
      setLatestTeaser(newMsg.text.slice(0, 75) + '...');

      // Pop open or signal unread if minimized
      if (!isExpanded) {
        setHasUnread(true);
      }
    }
  }, [selectedCelestialId, selectedMissionSlug]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isExpanded && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded, isTyping]);

  const processQuestion = (query) => {
    if (!query || !query.trim()) return;

    // 1. Immediately show user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setCurrentExpression('thinking');

    // 2. Short natural thinking delay, then deliver grounded answer
    setTimeout(() => {
      const reply = novaCompanion.ask(query);
      setIsTyping(false);
      if (reply) {
        setMessages([...novaCompanion.conversationHistory]);
        setCurrentExpression(reply.expression || 'happy');
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 2400);
        setLatestTeaser(reply.text.slice(0, 75) + '...');
      }
    }, 450);
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const query = inputText.trim();
    setInputText('');
    processQuestion(query);
  };

  const handleAskSuggested = (questionText) => {
    processQuestion(questionText);
  };

  const handleToggleVoice = () => {
    const nextState = !isVoiceEnabled;
    setIsVoiceEnabled(nextState);
    novaCompanion.setVoiceEnabled(nextState);
  };

  const handleToggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Failed to start voice recognition:', e);
      }
    }
  };

  const handleClearHistory = () => {
    novaCompanion.clearHistory();
    const resetMsg = {
      id: `reset-${Date.now()}`,
      sender: 'nova',
      text: "Chat history cleared! Ready for our next cosmic adventure. Which celestial body should we visit next? 🚀",
      timestamp: new Date(),
      expression: 'happy',
      suggestedQuestions: [
        'Take me to Mars!',
        'Show me Saturn’s rings!',
        'How hot is the Sun?'
      ]
    };
    setMessages([resetMsg]);
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setHasUnread(false);
  };

  const handleMinimize = () => {
    setIsExpanded(false);
  };

  return (
    <aside 
      id="nova-companion-container"
      className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 z-30 font-sans pointer-events-auto"
      role="complementary"
      aria-label="NOVA AI Space Guide"
    >
      {/* ----------------------------------------------------------------- */}
      {/* MINIMIZED FLOATING BADGE & SPEECH TEASER                          */}
      {/* ----------------------------------------------------------------- */}
      {!isExpanded && (
        <div className="flex items-end gap-2.5 animate-fadeIn">
          {/* Recent Speech Bubble Teaser */}
          <div 
            onClick={handleExpand}
            className="hidden sm:flex flex-col max-w-xs p-3 rounded-2xl bg-[#0b0924]/92 backdrop-blur-xl border border-cyan-500/40 text-xs text-slate-100 shadow-2xl shadow-cyan-950/70 cursor-pointer hover:border-cyan-400/80 transition-all hover:scale-102 group"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 font-bold mb-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>NOVA • SPACE GUIDE</span>
              </span>
              <span className="text-slate-400 group-hover:text-cyan-200">Click to chat →</span>
            </div>
            <p className="line-clamp-2 text-slate-200 leading-snug font-sans">
              "{latestTeaser}"
            </p>
          </div>

          {/* Floating Cartoon Avatar Button */}
          <button
            type="button"
            id="nova-companion-open-btn"
            onClick={handleExpand}
            className="relative p-2.5 rounded-full bg-gradient-to-br from-[#0c1a36] via-[#101036] to-[#08061a] border-2 border-cyan-400/60 hover:border-cyan-300 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-400/50 cursor-pointer transition-all hover:scale-110 active:scale-95 group focus:outline-none"
            title="Open NOVA Space Guide"
          >
            <NovaAstronautAvatar
              size={54}
              expression={currentExpression}
              isSpeaking={isSpeaking}
            />

            {/* Glowing Unread Pulse Badge */}
            {hasUnread && (
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border-2 border-[#09071c]" />
              </span>
            )}
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* EXPANDED COMPANION POD                                           */}
      {/* ----------------------------------------------------------------- */}
      {isExpanded && (
        <div 
          id="nova-companion-window"
          className="w-80 sm:w-92 md:w-96 max-h-[calc(100vh-170px)] flex flex-col bg-[#09071c]/94 backdrop-blur-2xl border border-cyan-500/35 rounded-3xl shadow-2xl shadow-cyan-950/80 text-white animate-fadeIn overflow-hidden"
        >
          {/* Companion Header */}
          <div className="flex items-center justify-between p-3 px-4 bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-950/60 border-b border-cyan-500/20 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <NovaAstronautAvatar
                size={44}
                expression={currentExpression}
                isSpeaking={isSpeaking}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight text-white truncate">
                    NOVA
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-950/90 border border-cyan-400/40 text-cyan-300 uppercase">
                    AI GUIDE
                  </span>
                </div>
                <p className="text-[11px] text-cyan-200/90 font-medium truncate font-sans">
                  {activeContextTitle}
                </p>
              </div>
            </div>

            {/* Quick Companion Controls */}
            <div className="flex items-center gap-1 text-slate-400 shrink-0">
              {/* Voice narration toggle */}
              <button
                type="button"
                id="nova-toggle-voice-btn"
                onClick={handleToggleVoice}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isVoiceEnabled 
                    ? 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40 hover:bg-cyan-900/60' 
                    : 'text-slate-400 hover:text-white bg-transparent border-transparent hover:bg-white/5'
                }`}
                title={isVoiceEnabled ? 'Mute voice narration' : 'Enable voice narration'}
              >
                {isVoiceEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Optional: Open technical telemetry drawer */}
              {onOpenTelemetryDrawer && (
                <button
                  type="button"
                  id="nova-open-telemetry-btn"
                  onClick={onOpenTelemetryDrawer}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Open detailed telemetry drawer"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Clear chat history */}
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Clear conversation history"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Minimize companion */}
              <button
                type="button"
                id="nova-minimize-btn"
                onClick={handleMinimize}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Minimize NOVA"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 min-h-[180px] max-h-[360px] overflow-y-auto p-4 space-y-3.5 text-xs font-sans no-scrollbar">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div 
                  className={`max-w-[88%] p-3 rounded-2xl leading-relaxed font-sans shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-[#12112e]/90 border border-cyan-500/25 text-slate-100 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line text-[12px]">
                    {msg.text}
                  </p>
                </div>

                {/* Suggested Questions Chips for NOVA responses */}
                {msg.sender === 'nova' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 pl-1 max-w-[95%]">
                    {msg.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAskSuggested(q)}
                        className="text-[10.5px] px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-200 hover:text-white transition-all text-left cursor-pointer active:scale-95 shadow-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Animated Typing Indicator (Phase 5) */}
            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 px-3 rounded-2xl bg-[#12112e]/90 border border-cyan-500/25 text-cyan-300 w-fit animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[10.5px] text-cyan-300/80 font-mono ml-1">NOVA is thinking...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <form 
            onSubmit={handleSendMessage}
            className="p-2.5 px-3 bg-black/40 border-t border-cyan-500/20 flex items-center gap-2"
          >
            {/* Optional Speech Recognition Mic Button */}
            {speechRecognitionSupported && (
              <button
                type="button"
                id="nova-voice-input-btn"
                onClick={handleToggleVoiceInput}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-md shadow-rose-900/60' 
                    : 'bg-slate-900/80 text-slate-400 hover:text-cyan-300 border-slate-700/60 hover:border-cyan-500/30'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Voice input (Speak to NOVA)'}
              >
                {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
            )}

            <input
              ref={inputRef}
              type="text"
              id="nova-companion-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask NOVA about ${novaCompanion.currentContext?.name || 'the Solar System'}...`}
              className="flex-1 bg-slate-900/80 border border-slate-700/60 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              id="nova-companion-send-btn"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white transition-all cursor-pointer shadow-md shadow-cyan-900/50"
              aria-label="Send question"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
