import React, { useState, useEffect } from 'react';

/**
 * NovaAstronautAvatar.jsx
 * 
 * NOVA — CUTE TEAL ALIEN ASTRONAUT 3D COMPANION
 * 
 * VISUAL DESIGN SPECIFICATION (From User Reference Image):
 * - Cute 3D Cyan / Turquoise Alien Astronaut with friendly, curious personality.
 * - Smooth rounded teal cranium with giant glossy reflective black almond eyes reflecting cosmic space light.
 * - Huge spherical transparent glowing glass bubble helmet with deep-space nebula and starlight reflection.
 * - Metallic titanium collar ring with orbital rivets.
 * - Sleek dark charcoal/slate spacesuit with segmented joints, chest emblem, knee pads, and life-support pack.
 * - Cute 4-fingered cyan alien hands and rounded dark boots.
 * - Natural eye blinking overlay, microgravity floating bob, and deep-space starlight luminescence.
 * - Acoustic cyan voice resonance when speaking, holographic listening wave rings when listening.
 * - Supports skin switching between 'alien' (default) and 'explorer' (Option A Friendly Explorer).
 */
export default function NovaAstronautAvatar({
  expression = 'happy', // 'happy' | 'explaining' | 'wondering' | 'thinking' | 'excited' | 'listening'
  isSpeaking = false,
  isGesturing = false,
  isListening = false,
  size = 125,
  className = '',
  skin = 'alien' // 'alien' | 'explorer'
}) {
  const [activeSkin, setActiveSkin] = useState(skin);

  useEffect(() => {
    setActiveSkin(skin);
  }, [skin]);

  useEffect(() => {
    const handleSkinChange = (e) => {
      if (e.detail?.skin) {
        setActiveSkin(e.detail.skin);
      }
    };
    window.addEventListener('nova-skin-change', handleSkinChange);
    return () => window.removeEventListener('nova-skin-change', handleSkinChange);
  }, []);

  const activeExpression = isListening ? 'listening' : expression;
  const isCommunicating = isSpeaking || isGesturing;

  // =========================================================================
  // SKIN 1: CUTE TEAL ALIEN ASTRONAUT (APPROVED USER DESIGN)
  // =========================================================================
  if (activeSkin === 'alien') {
    return (
      <div 
        id="nova-alien-astronaut"
        className={`relative inline-flex items-center justify-center select-none ${className}`}
        style={{ width: size, height: size * 1.12 }}
        aria-label="NOVA — Cute Teal Alien Astronaut Companion"
      >
        <style>{`
          @keyframes novaAlienFloatBob {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-8px) rotate(1.8deg);
            }
          }
          @keyframes novaAlienSpaceAura {
            0%, 100% {
              filter: drop-shadow(0 10px 24px rgba(6, 182, 212, 0.45)) drop-shadow(0 0 32px rgba(56, 189, 248, 0.28));
            }
            50% {
              filter: drop-shadow(0 14px 32px rgba(6, 182, 212, 0.75)) drop-shadow(0 0 48px rgba(14, 165, 233, 0.5));
            }
          }
          @keyframes novaAlienListeningRing {
            0% {
              transform: scale(0.82);
              opacity: 0.95;
            }
            100% {
              transform: scale(1.45);
              opacity: 0;
            }
          }
          @keyframes novaAlienSpeechRipple {
            0%, 100% {
              transform: scale(1);
              filter: brightness(1) drop-shadow(0 0 10px rgba(56, 189, 248, 0.4));
            }
            50% {
              transform: scale(1.04);
              filter: brightness(1.18) drop-shadow(0 0 24px rgba(6, 182, 212, 0.85));
            }
          }
          @keyframes novaAlienBlinkEyelid {
            0%, 93%, 100% {
              transform: scaleY(0);
              opacity: 0;
            }
            95.5%, 97.5% {
              transform: scaleY(1);
              opacity: 0.96;
            }
          }
          @keyframes novaAlienThinkingTilt {
            0%, 100% {
              transform: rotate(0deg);
            }
            50% {
              transform: rotate(-6deg) translateY(-2px);
            }
          }
          @keyframes novaAlienStarTwinkle {
            0%, 100% {
              opacity: 0.35;
              transform: scale(0.85) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: scale(1.25) rotate(45deg);
            }
          }
          .nova-alien-float {
            animation: novaAlienFloatBob 3.6s ease-in-out infinite;
          }
          .nova-alien-aura {
            animation: novaAlienSpaceAura 3.8s ease-in-out infinite;
          }
          .nova-alien-speaking {
            animation: novaAlienSpeechRipple 0.32s ease-in-out infinite;
          }
          .nova-alien-thinking {
            animation: novaAlienThinkingTilt 2.8s ease-in-out infinite;
          }
          .nova-alien-eyelid-blink {
            animation: novaAlienBlinkEyelid 4.2s ease-in-out infinite;
          }
          .nova-alien-listening-ring {
            animation: novaAlienListeningRing 1.35s ease-out infinite;
          }
        `}</style>

        {/* Listening Holographic Ring when user voice input is active */}
        {isListening && (
          <span 
            className="absolute -inset-4 rounded-full border-2 border-cyan-400/80 pointer-events-none nova-alien-listening-ring"
            style={{ borderRadius: '50%' }}
          />
        )}

        {/* Main Floating Character Wrapper */}
        <div 
          className={`relative w-full h-full flex items-center justify-center nova-alien-float nova-alien-aura ${
            isSpeaking ? 'nova-alien-speaking' : ''
          } ${activeExpression === 'thinking' ? 'nova-alien-thinking' : ''}`}
        >
          {/* High-Resolution 3D Alien Astronaut Image */}
          <img
            id="nova-alien-character-img"
            src="/images/nova_alien_companion.png"
            alt="NOVA Cute Teal Alien Astronaut Companion"
            className="w-full h-full object-contain pointer-events-auto select-none"
            draggable={false}
          />

          {/* Interactive Eye Blinking Eyelid Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none nova-alien-eyelid-blink"
            viewBox="0 0 1024 1024"
            fill="none"
          >
            <defs>
              <linearGradient id="alienSkinLid" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
            {/* Left Eye Eyelid (Viewer Left, natural curve over left alien eye) */}
            <path
              d="M 370 330 Q 470 230 570 330 Q 470 415 370 330 Z"
              fill="url(#alienSkinLid)"
              stroke="#0e7490"
              strokeWidth="3"
              style={{ transformOrigin: '470px 330px' }}
            />
            {/* Right Eye Eyelid (Viewer Right, natural curve over right alien eye) */}
            <path
              d="M 610 330 Q 675 240 745 330 Q 675 415 610 330 Z"
              fill="url(#alienSkinLid)"
              stroke="#0e7490"
              strokeWidth="3"
              style={{ transformOrigin: '675px 330px' }}
            />
          </svg>

          {/* Speech Ripple Wave Visor Overlay */}
          {isSpeaking && (
            <div 
              className="absolute top-[8%] left-[18%] w-[64%] h-[48%] rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(34, 211, 238, 0.28) 0%, rgba(6, 182, 212, 0.12) 55%, transparent 80%)',
                filter: 'blur(4px)'
              }}
            />
          )}

          {/* Starlight Sparkle on Helmet Crown */}
          <div 
            className="absolute top-[12%] right-[24%] w-3 h-3 pointer-events-none"
            style={{ animation: 'novaAlienStarTwinkle 3s ease-in-out infinite' }}
          >
            <svg viewBox="0 0 24 24" fill="#ffffff" className="w-full h-full drop-shadow-[0_0_6px_#38bdf8]">
              <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SKIN 2: OPTION A FRIENDLY EXPLORER (PRESERVED AS ALTERNATE)
  // =========================================================================
  return (
    <div 
      id="nova-astronaut-avatar"
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size * 1.16 }}
      aria-label="NOVA — Option A Friendly Explorer Cartoon Astronaut"
    >
      <style>{`
        @keyframes novaFloatBob {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-7px) rotate(2deg);
          }
        }
        @keyframes novaEyeBlinkAnim {
          0%, 92%, 100% {
            transform: scaleY(1);
          }
          96% {
            transform: scaleY(0.08);
          }
        }
        @keyframes novaMouthTalkAnim {
          0%, 100% {
            transform: scaleY(0.65) scaleX(0.92);
          }
          50% {
            transform: scaleY(1.4) scaleX(1.15);
          }
        }
        @keyframes novaArmGestureRight {
          0%, 100% {
            transform: rotate(0deg) translateY(0px);
          }
          30% {
            transform: rotate(-24deg) translateY(-4px);
          }
          70% {
            transform: rotate(-12deg) translateY(-2px);
          }
        }
        @keyframes novaArmGestureLeft {
          0%, 100% {
            transform: rotate(0deg) translateY(0px);
          }
          45% {
            transform: rotate(16deg) translateY(-3px);
          }
        }
        @keyframes novaAntennaPulse {
          0%, 100% {
            filter: drop-shadow(0 0 3px #38bdf8);
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 10px #67e8f9);
            transform: scale(1.3);
          }
        }
        @keyframes novaThrusterPuffAnim {
          0%, 100% {
            opacity: 0.55;
            transform: scaleY(0.85);
          }
          50% {
            opacity: 0.95;
            transform: scaleY(1.35);
          }
        }
        @keyframes novaListeningWaveRing {
          0% {
            transform: scale(0.85);
            opacity: 0.85;
          }
          100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }
        @keyframes novaSpaceGlowPulse {
          0%, 100% {
            filter: drop-shadow(0 8px 20px rgba(14, 165, 233, 0.4)) drop-shadow(0 0 25px rgba(56, 189, 248, 0.25));
          }
          50% {
            filter: drop-shadow(0 12px 28px rgba(14, 165, 233, 0.7)) drop-shadow(0 0 40px rgba(99, 102, 241, 0.4));
          }
        }
        .nova-option-a-float {
          animation: novaFloatBob 3.6s ease-in-out infinite;
        }
        .nova-eye-blink {
          transform-origin: 64px 44px;
          animation: novaEyeBlinkAnim 3.8s infinite;
        }
        .nova-mouth-speech {
          transform-origin: 64px 53px;
          animation: novaMouthTalkAnim 0.25s ease-in-out infinite;
        }
        .nova-arm-right-gesture {
          transform-origin: 88px 68px;
          animation: novaArmGestureRight 2.5s ease-in-out infinite;
        }
        .nova-arm-left-gesture {
          transform-origin: 40px 68px;
          animation: novaArmGestureLeft 3.2s ease-in-out infinite;
        }
        .nova-antenna-star {
          transform-origin: 64px 4px;
          animation: novaAntennaPulse 2.2s ease-in-out infinite;
        }
        .nova-thruster-puff {
          transform-origin: center top;
          animation: novaThrusterPuffAnim 1.2s ease-in-out infinite;
        }
        .nova-listening-wave {
          animation: novaListeningWaveRing 1.4s ease-out infinite;
        }
        .nova-space-glow {
          animation: novaSpaceGlowPulse 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* Listening Hologram Ring Indicator when user is talking */}
      {isListening && (
        <span 
          className="absolute -inset-3 rounded-full border-2 border-rose-400/60 pointer-events-none nova-listening-wave"
          style={{ borderRadius: '50%' }}
        />
      )}

      {/* Option A: Friendly Explorer Cartoon Astronaut SVG */}
      <svg
        id="nova-astronaut-svg"
        viewBox="0 0 128 148"
        width={size}
        height={size * 1.16}
        className="nova-option-a-float nova-space-glow"
      >
        <defs>
          <radialGradient id="glassSphereA" cx="42%" cy="36%" r="65%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#0f172a" stopOpacity="0.75" />
            <stop offset="85%" stopColor="#0284c7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
          </radialGradient>

          <linearGradient id="glassSheenA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#818cf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="suitWhiteA" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="suitBlueA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="jetpackGradA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="60%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <radialGradient id="exhaustGlowA" cx="50%" cy="0%" r="90%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. JETPACK & OXYGEN TANKS (Back Layer) */}
        <rect x="36" y="52" width="56" height="48" rx="14" fill="url(#jetpackGradA)" stroke="#334155" strokeWidth="2" />
        <rect x="42" y="58" width="44" height="36" rx="10" fill="#1e293b" opacity="0.6" />

        {/* Dual Oxygen Cylinders with Blue Straps */}
        <rect x="29" y="60" width="10" height="34" rx="4.5" fill="#f1f5f9" stroke="#0284c7" strokeWidth="1.8" />
        <rect x="29" y="68" width="10" height="4" fill="url(#suitBlueA)" />
        <rect x="89" y="60" width="10" height="34" rx="4.5" fill="#f1f5f9" stroke="#0284c7" strokeWidth="1.8" />
        <rect x="89" y="68" width="10" height="4" fill="url(#suitBlueA)" />

        {/* Jetpack Thruster Nozzles */}
        <path d="M38 99 L34 107 L44 107 L42 99 Z" fill="#475569" stroke="#1e293b" strokeWidth="1" />
        <path d="M86 99 L84 107 L94 107 L90 99 Z" fill="#475569" stroke="#1e293b" strokeWidth="1" />

        {/* Micro-gravity Blue Particle Exhaust Plumes */}
        <ellipse cx="39" cy="113" rx="4.5" ry="7.5" fill="url(#exhaustGlowA)" className="nova-thruster-puff" />
        <ellipse cx="89" cy="113" rx="4.5" ry="7.5" fill="url(#exhaustGlowA)" className="nova-thruster-puff" />

        {/* 2. LEGS & BOOTS */}
        <path d="M44 96 L40 120 C40 124, 49 124, 49 120 L51 96 Z" fill="url(#suitWhiteA)" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x="39" y="106" width="12" height="4" rx="2" fill="url(#suitBlueA)" />
        <path d="M37 120 C37 116, 52 116, 52 120 L52 125 C52 128, 35 128, 35 125 Z" fill="url(#suitBlueA)" stroke="#0f172a" strokeWidth="1.5" />
        <path d="M35 124 L52 124" stroke="#38bdf8" strokeWidth="1.5" />

        <path d="M77 96 L75 120 C75 124, 84 124, 84 120 L87 96 Z" fill="url(#suitWhiteA)" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x="76" y="106" width="12" height="4" rx="2" fill="url(#suitBlueA)" />
        <path d="M74 120 C74 116, 89 116, 89 120 L89 125 C89 128, 72 128, 72 125 Z" fill="url(#suitBlueA)" stroke="#0f172a" strokeWidth="1.5" />
        <path d="M72 124 L89 124" stroke="#38bdf8" strokeWidth="1.5" />

        {/* 3. SPACESUIT TORSO & CHEST COMPUTER */}
        <path
          d="M44 65 C44 58, 84 58, 84 65 L88 100 C88 104, 40 104, 40 100 Z"
          fill="url(#suitWhiteA)"
          stroke="#94a3b8"
          strokeWidth="2"
        />

        {/* Blue Waist Belt & Utility Buckle */}
        <rect x="42" y="94" width="44" height="6" rx="3" fill="url(#suitBlueA)" stroke="#0284c7" strokeWidth="1" />
        <rect x="60" y="93" width="8" height="8" rx="2" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />

        {/* Chestpack Mission Computer */}
        <rect x="52" y="69" width="24" height="20" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.8" />
        <circle cx="58" cy="75" r="2.2" fill="#22c55e" />
        <circle cx="64" cy="75" r="2.2" fill={isListening ? '#f43f5e' : '#38bdf8'} />
        <circle cx="70" cy="75" r="2.2" fill="#f59e0b" />
        <line x1="56" y1="81" x2="72" y2="81" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="56" y1="84" x2="72" y2="84" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

        {/* Collar Ring */}
        <ellipse cx="64" cy="65" rx="23" ry="7" fill="#475569" stroke="#1e293b" strokeWidth="2" />
        <ellipse cx="64" cy="64" rx="21" ry="5.5" fill="url(#suitBlueA)" />

        {/* 4. ARMS & ANIMATED GESTURING GLOVES */}
        <g className={isCommunicating ? 'nova-arm-left-gesture' : ''}>
          <ellipse cx="40" cy="68" rx="6" ry="6" fill="url(#suitBlueA)" stroke="#0284c7" strokeWidth="1.5" />
          <path d="M40 70 C32 76, 26 86, 30 96 C34 94, 38 90, 42 82 Z" fill="url(#suitWhiteA)" stroke="#94a3b8" strokeWidth="1.8" />
          <ellipse cx="29" cy="98" rx="5.5" ry="5" fill="url(#suitBlueA)" stroke="#0f172a" strokeWidth="1.5" />
          <path d="M25 96 C23 93, 27 91, 29 93 Z" fill="url(#suitBlueA)" />
        </g>

        <g className={isCommunicating ? 'nova-arm-right-gesture' : ''}>
          <ellipse cx="88" cy="68" rx="6" ry="6" fill="url(#suitBlueA)" stroke="#0284c7" strokeWidth="1.5" />
          <path d="M88 70 C96 76, 104 84, 100 96 C96 94, 92 88, 86 82 Z" fill="url(#suitWhiteA)" stroke="#94a3b8" strokeWidth="1.8" />
          <ellipse cx="102" cy="98" rx="5.5" ry="5" fill="url(#suitBlueA)" stroke="#0f172a" strokeWidth="1.5" />
          <path d="M104 94 C107 92, 109 95, 106 98 Z" fill="url(#suitBlueA)" />
          <circle cx="106" cy="93" r="1.8" fill="#38bdf8" />
        </g>

        {/* 5. LARGE TRANSPARENT BUBBLE HELMET */}
        <circle cx="64" cy="44" r="33" fill="url(#suitWhiteA)" stroke="#94a3b8" strokeWidth="2.5" />

        <line x1="64" y1="12" x2="64" y2="4" stroke="#64748b" strokeWidth="2.6" strokeLinecap="round" />
        <g className="nova-antenna-star">
          <circle cx="64" cy="4" r={isListening ? 6 : 4.5} fill={isListening ? '#f43f5e' : '#38bdf8'} />
          <path d="M64 0 L65.5 3 L68.5 4 L65.5 5 L64 8 L62.5 5 L59.5 4 L62.5 3 Z" fill="#ffffff" />
        </g>

        <rect x="36" y="19" width="56" height="48" rx="22" fill="#0f172a" stroke="#0284c7" strokeWidth="2.5" />
        <rect x="38" y="21" width="52" height="44" rx="20" fill="url(#glassSphereA)" />

        {/* 6. EXPRESSIVE CARTOON FACE INSIDE HELMET */}
        <g>
          <ellipse cx="64" cy="45" rx="19" ry="16" fill="#fde68a" opacity="0.95" />

          {activeExpression === 'listening' ? (
            <g stroke="#78350f" strokeWidth="1.8" strokeLinecap="round">
              <path d="M50 34 Q54 30 58 35" fill="none" />
              <path d="M70 34 Q74 29 78 33" fill="none" />
            </g>
          ) : activeExpression === 'wondering' ? (
            <g stroke="#78350f" strokeWidth="1.8" strokeLinecap="round">
              <path d="M50 36 Q54 32 58 36" fill="none" />
              <path d="M70 34 Q74 30 78 34" fill="none" />
            </g>
          ) : activeExpression === 'thinking' ? (
            <g stroke="#78350f" strokeWidth="1.8" strokeLinecap="round">
              <line x1="50" y1="36" x2="58" y2="38" />
              <line x1="70" y1="37" x2="78" y2="35" />
            </g>
          ) : (
            <g stroke="#78350f" strokeWidth="1.8" strokeLinecap="round">
              <path d="M50 36 Q54 33 58 36" fill="none" />
              <path d="M70 36 Q74 33 78 36" fill="none" />
            </g>
          )}

          {/* Big Anime Sparkle Eyes (Natural Blinking) */}
          <g className="nova-eye-blink">
            <ellipse cx="54" cy="44" rx="4.5" ry="6" fill="#0f172a" />
            <ellipse cx="54" cy="44.5" rx="3.5" ry="4.8" fill="#0284c7" />
            <circle cx="52.5" cy="42" r="2.2" fill="#ffffff" />
            <circle cx="55.8" cy="46" r="1.1" fill="#ffffff" />

            <ellipse cx="74" cy="44" rx="4.5" ry="6" fill="#0f172a" />
            <ellipse cx="74" cy="44.5" rx="3.5" ry="4.8" fill="#0284c7" />
            <circle cx="72.5" cy="42" r="2.2" fill="#ffffff" />
            <circle cx="75.8" cy="46" r="1.1" fill="#ffffff" />
          </g>

          <ellipse cx="48" cy="48" rx="3.5" ry="2" fill="#f43f5e" opacity="0.65" />
          <ellipse cx="80" cy="48" rx="3.5" ry="2" fill="#f43f5e" opacity="0.65" />

          {isSpeaking ? (
            <path
              d="M59 52 Q64 60 69 52 Z"
              fill="#be123c"
              stroke="#881337"
              strokeWidth="1.5"
              className="nova-mouth-speech"
            />
          ) : activeExpression === 'listening' ? (
            <ellipse cx="64" cy="52.5" rx="2.5" ry="2" fill="#be123c" stroke="#78350f" strokeWidth="1" />
          ) : activeExpression === 'happy' || activeExpression === 'excited' ? (
            <path
              d="M59 52 Q64 57 69 52"
              fill="none"
              stroke="#78350f"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          ) : activeExpression === 'wondering' ? (
            <ellipse cx="64" cy="53" rx="3" ry="3.5" fill="#be123c" stroke="#78350f" strokeWidth="1.2" />
          ) : (
            <line x1="60" y1="52" x2="68" y2="52" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          )}
        </g>

        {/* 7. VISOR SPECULAR GLASS HIGHLIGHTS (Front Layer) */}
        <path
          d="M42 25 C52 22, 70 23, 80 29 C70 30, 52 30, 44 36 Z"
          fill="url(#glassSheenA)"
          opacity="0.88"
        />
        <ellipse cx="82" cy="57" rx="3.5" ry="1.5" fill="#ffffff" opacity="0.55" transform="rotate(-30 82 57)" />
      </svg>
    </div>
  );
}
