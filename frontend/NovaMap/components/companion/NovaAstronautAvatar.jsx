import React from 'react';

/**
 * NovaAstronautAvatar.jsx
 * 
 * NOVA — Interactive AI Cartoon Astronaut Companion.
 * 
 * SPECIFICATION (Per Section 1):
 * - Cute 3D cartoon astronaut mascot.
 * - White and blue astronaut spacesuit with blue shoulder pads, gloves, belt, and boots.
 * - Large transparent bubble helmet showing a friendly, expressive face.
 * - Natural eye blinking with sparkly pupils and rosy blush cheeks.
 * - Talking mouth animation synchronized with speech playback.
 * - Small hand gestures while explaining.
 * - Listening state with focused curious expression and glowing antenna when user speaks.
 * - Smooth micro-gravity zero-g idle floating.
 */
export default function NovaAstronautAvatar({
  expression = 'happy', // 'happy' | 'explaining' | 'wondering' | 'thinking' | 'excited' | 'listening'
  isSpeaking = false,
  isGesturing = false,
  isListening = false,
  size = 120, // default display size in pixels
  className = ''
}) {
  const activeExpression = isListening ? 'listening' : expression;
  const isCommunicating = isSpeaking || isGesturing;

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size * 1.15 }}
      aria-label="NOVA Animated Cartoon Astronaut Companion"
    >
      <style>{`
        @keyframes novaMascotFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(2deg);
          }
        }
        @keyframes novaEyeBlink {
          0%, 92%, 100% {
            transform: scaleY(1);
          }
          96% {
            transform: scaleY(0.08);
          }
        }
        @keyframes novaMouthSpeech {
          0%, 100% {
            transform: scaleY(0.6) scaleX(0.9);
          }
          50% {
            transform: scaleY(1.45) scaleX(1.2);
          }
        }
        @keyframes novaHandGestureRight {
          0%, 100% {
            transform: rotate(0deg) translateY(0px);
          }
          30% {
            transform: rotate(-26deg) translateY(-4px);
          }
          70% {
            transform: rotate(-14deg) translateY(-2px);
          }
        }
        @keyframes novaHandGestureLeft {
          0%, 100% {
            transform: rotate(0deg) translateY(0px);
          }
          45% {
            transform: rotate(18deg) translateY(-3px);
          }
        }
        @keyframes novaAntennaGlow {
          0%, 100% {
            filter: drop-shadow(0 0 3px #38bdf8);
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 10px #67e8f9);
            transform: scale(1.3);
          }
        }
        @keyframes novaThrusterGlow {
          0%, 100% {
            opacity: 0.5;
            transform: scaleY(0.85);
          }
          50% {
            opacity: 0.95;
            transform: scaleY(1.3);
          }
        }
        @keyframes novaListenWave {
          0% {
            transform: scale(0.85);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        .nova-mascot-float {
          animation: novaMascotFloat 3.8s ease-in-out infinite;
        }
        .nova-eye-blink {
          transform-origin: 64px 44px;
          animation: novaEyeBlink 3.6s infinite;
        }
        .nova-mouth-speech {
          transform-origin: 64px 53px;
          animation: novaMouthSpeech 0.24s ease-in-out infinite;
        }
        .nova-arm-right-gesture {
          transform-origin: 88px 68px;
          animation: novaHandGestureRight 2.6s ease-in-out infinite;
        }
        .nova-arm-left-gesture {
          transform-origin: 40px 68px;
          animation: novaHandGestureLeft 3.2s ease-in-out infinite;
        }
        .nova-antenna-star {
          transform-origin: 64px 4px;
          animation: novaAntennaGlow 2s ease-in-out infinite;
        }
        .nova-thruster-puff {
          transform-origin: center top;
          animation: novaThrusterGlow 1.2s ease-in-out infinite;
        }
        .nova-listening-wave {
          animation: novaListenWave 1.4s ease-out infinite;
        }
      `}</style>

      {/* Listening Hologram Ring Indicator when user is talking */}
      {isListening && (
        <span 
          className="absolute -inset-3 rounded-full border-2 border-rose-400/50 pointer-events-none nova-listening-wave"
          style={{ borderRadius: '50%' }}
        />
      )}

      <svg
        id="nova-astronaut-svg"
        viewBox="0 0 128 148"
        width={size}
        height={size * 1.15}
        className="nova-mascot-float drop-shadow-[0_10px_25px_rgba(14,165,233,0.45)]"
      >
        <defs>
          {/* Transparent Visor Gradient */}
          <radialGradient id="glassSphere" cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#0f172a" stopOpacity="0.75" />
            <stop offset="90%" stopColor="#0284c7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
          </radialGradient>

          {/* Curved Specular Visor Sheen */}
          <linearGradient id="glassSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#818cf8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </linearGradient>

          {/* Spacesuit 3D Shading (White) */}
          <linearGradient id="suitWhiteGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Spacesuit Blue Trim */}
          <linearGradient id="suitBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Jetpack Metal Gradient */}
          <linearGradient id="jetpackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="60%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Glowing Thruster Exhaust */}
          <radialGradient id="exhaustGlow" cx="50%" cy="0%" r="90%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ================================================================= */}
        {/* 1. JETPACK & OXYGEN TANKS (Back Layer)                            */}
        {/* ================================================================= */}
        <rect x="36" y="52" width="56" height="48" rx="14" fill="url(#jetpackGrad)" stroke="#334155" strokeWidth="2" />
        <rect x="42" y="58" width="44" height="36" rx="10" fill="#1e293b" opacity="0.6" />

        {/* Dual Oxygen Cylinders with Blue Straps */}
        <rect x="29" y="60" width="10" height="34" rx="4.5" fill="#f1f5f9" stroke="#0284c7" strokeWidth="1.8" />
        <rect x="29" y="68" width="10" height="4" fill="url(#suitBlueGrad)" />
        <rect x="89" y="60" width="10" height="34" rx="4.5" fill="#f1f5f9" stroke="#0284c7" strokeWidth="1.8" />
        <rect x="89" y="68" width="10" height="4" fill="url(#suitBlueGrad)" />

        {/* Jetpack Thruster Nozzles */}
        <path d="M38 99 L34 107 L44 107 L42 99 Z" fill="#475569" stroke="#1e293b" strokeWidth="1" />
        <path d="M86 99 L84 107 L94 107 L90 99 Z" fill="#475569" stroke="#1e293b" strokeWidth="1" />

        {/* Micro-gravity Blue Particle Exhaust Plumes */}
        <ellipse cx="39" cy="113" rx="4" ry="7" fill="url(#exhaustGlow)" className="nova-thruster-puff" />
        <ellipse cx="89" cy="113" rx="4" ry="7" fill="url(#exhaustGlow)" className="nova-thruster-puff" />

        {/* ================================================================= */}
        {/* 2. LEGS & BOOTS                                                   */}
        {/* ================================================================= */}
        {/* Left Leg */}
        <path d="M44 96 L40 120 C40 124, 49 124, 49 120 L51 96 Z" fill="url(#suitWhiteGrad)" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x="39" y="106" width="12" height="4" rx="2" fill="url(#suitBlueGrad)" />
        {/* Left Boot */}
        <path d="M37 120 C37 116, 52 116, 52 120 L52 125 C52 128, 35 128, 35 125 Z" fill="url(#suitBlueGrad)" stroke="#0f172a" strokeWidth="1.5" />
        <path d="M35 124 L52 124" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Right Leg */}
        <path d="M77 96 L75 120 C75 124, 84 124, 84 120 L87 96 Z" fill="url(#suitWhiteGrad)" stroke="#94a3b8" strokeWidth="1.5" />
        <rect x="76" y="106" width="12" height="4" rx="2" fill="url(#suitBlueGrad)" />
        {/* Right Boot */}
        <path d="M74 120 C74 116, 89 116, 89 120 L89 125 C89 128, 72 128, 72 125 Z" fill="url(#suitBlueGrad)" stroke="#0f172a" strokeWidth="1.5" />
        <path d="M72 124 L89 124" stroke="#38bdf8" strokeWidth="1.5" />

        {/* ================================================================= */}
        {/* 3. SPACESUIT TORSO & CHEST COMPUTER                              */}
        {/* ================================================================= */}
        <path
          d="M44 65 C44 58, 84 58, 84 65 L88 100 C88 104, 40 104, 40 100 Z"
          fill="url(#suitWhiteGrad)"
          stroke="#94a3b8"
          strokeWidth="2"
        />

        {/* Blue Waist Belt & Utility Buckle */}
        <rect x="42" y="94" width="44" height="6" rx="3" fill="url(#suitBlueGrad)" stroke="#0284c7" strokeWidth="1" />
        <rect x="60" y="93" width="8" height="8" rx="2" fill="#f8fafc" stroke="#64748b" strokeWidth="1" />

        {/* Chestpack Mission Computer */}
        <rect x="52" y="69" width="24" height="20" rx="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.8" />
        {/* Glowing LED telemetry indicators */}
        <circle cx="58" cy="75" r="2.2" fill="#22c55e" />
        <circle cx="64" cy="75" r="2.2" fill={isListening ? '#f43f5e' : '#38bdf8'} />
        <circle cx="70" cy="75" r="2.2" fill="#f59e0b" />
        {/* Audio Speaker Grill */}
        <line x1="56" y1="81" x2="72" y2="81" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="56" y1="84" x2="72" y2="84" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

        {/* Collar Ring */}
        <ellipse cx="64" cy="65" rx="23" ry="7" fill="#475569" stroke="#1e293b" strokeWidth="2" />
        <ellipse cx="64" cy="64" rx="21" ry="5.5" fill="url(#suitBlueGrad)" />

        {/* ================================================================= */}
        {/* 4. ARMS & ANIMATED GESTURING GLOVES                               */}
        {/* ================================================================= */}
        {/* Left Arm */}
        <g className={isCommunicating ? 'nova-arm-left-gesture' : ''}>
          <ellipse cx="40" cy="68" rx="6" ry="6" fill="url(#suitBlueGrad)" stroke="#0284c7" strokeWidth="1.5" />
          <path d="M40 70 C32 76, 26 86, 30 96 C34 94, 38 90, 42 82 Z" fill="url(#suitWhiteGrad)" stroke="#94a3b8" strokeWidth="1.8" />
          <ellipse cx="29" cy="98" rx="5.5" ry="5" fill="url(#suitBlueGrad)" stroke="#0f172a" strokeWidth="1.5" />
          <path d="M25 96 C23 93, 27 91, 29 93 Z" fill="url(#suitBlueGrad)" />
        </g>

        {/* Right Arm (Enthusiastic Explaining Gesture) */}
        <g className={isCommunicating ? 'nova-arm-right-gesture' : ''}>
          <ellipse cx="88" cy="68" rx="6" ry="6" fill="url(#suitBlueGrad)" stroke="#0284c7" strokeWidth="1.5" />
          <path d="M88 70 C96 76, 104 84, 100 96 C96 94, 92 88, 86 82 Z" fill="url(#suitWhiteGrad)" stroke="#94a3b8" strokeWidth="1.8" />
          <ellipse cx="102" cy="98" rx="5.5" ry="5" fill="url(#suitBlueGrad)" stroke="#0f172a" strokeWidth="1.5" />
          <path d="M104 94 C107 92, 109 95, 106 98 Z" fill="url(#suitBlueGrad)" />
          <circle cx="106" cy="93" r="1.8" fill="#38bdf8" />
        </g>

        {/* ================================================================= */}
        {/* 5. LARGE TRANSPARENT BUBBLE HELMET                                */}
        {/* ================================================================= */}
        {/* Outer White Helmet Shell */}
        <circle cx="64" cy="44" r="33" fill="url(#suitWhiteGrad)" stroke="#94a3b8" strokeWidth="2.5" />

        {/* Top Antenna Mast & Pulsing Sensor Star */}
        <line x1="64" y1="12" x2="64" y2="4" stroke="#64748b" strokeWidth="2.6" strokeLinecap="round" />
        <g className="nova-antenna-star">
          <circle cx="64" cy="4" r={isListening ? 6 : 4.5} fill={isListening ? '#f43f5e' : '#38bdf8'} />
          <path d="M64 0 L65.5 3 L68.5 4 L65.5 5 L64 8 L62.5 5 L59.5 4 L62.5 3 Z" fill="#ffffff" />
        </g>

        {/* Visor Blue Outer Rim */}
        <rect x="36" y="19" width="56" height="48" rx="22" fill="#0f172a" stroke="#0284c7" strokeWidth="2.5" />

        {/* Visor Transparent Glass Faceplate */}
        <rect x="38" y="21" width="52" height="44" rx="20" fill="url(#glassSphere)" />

        {/* ================================================================= */}
        {/* 6. EXPRESSIVE CARTOON FACE INSIDE HELMET                          */}
        {/* ================================================================= */}
        <g>
          {/* Soft Peach Head Base */}
          <ellipse cx="64" cy="45" rx="19" ry="16" fill="#fde68a" opacity="0.95" />

          {/* Friendly Eyebrows */}
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

          {/* Cute Rosy Blush Cheeks */}
          <ellipse cx="48" cy="48" rx="3.5" ry="2" fill="#f43f5e" opacity="0.65" />
          <ellipse cx="80" cy="48" rx="3.5" ry="2" fill="#f43f5e" opacity="0.65" />

          {/* Talking Mouth Animation / Expressions */}
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

        {/* ================================================================= */}
        {/* 7. VISOR SPECULAR GLASS HIGHLIGHTS (Front Layer)                  */}
        {/* ================================================================= */}
        <path
          d="M42 25 C52 22, 70 23, 80 29 C70 30, 52 30, 44 36 Z"
          fill="url(#glassSheen)"
          opacity="0.85"
        />
        <ellipse cx="82" cy="57" rx="3.5" ry="1.5" fill="#ffffff" opacity="0.5" transform="rotate(-30 82 57)" />
      </svg>
    </div>
  );
}
