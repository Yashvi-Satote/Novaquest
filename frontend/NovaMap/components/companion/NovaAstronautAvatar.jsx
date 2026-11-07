import React from 'react';

/**
 * NovaAstronautAvatar.jsx
 * 
 * An expressive, cute 3D-styled cartoon astronaut character: NOVA — Your Personal Space Guide.
 * 
 * Features:
 * - 3D styled lighting with soft radial/linear gradients and specular highlights
 * - Micro-gravity floating animation (smooth sine wave bobbing)
 * - Eye blinking animation with sparkle pupils and blush cheeks
 * - Expressive mouth with talking animation synchronized to speech
 * - Dynamic facial expressions: 'happy', 'explaining', 'wondering', 'thinking'
 * - Glowing antenna sensor star & chest computer status LEDs
 * - Child-friendly, approachable, and scientifically curious
 */
export default function NovaAstronautAvatar({
  expression = 'happy', // 'happy' | 'explaining' | 'wondering' | 'thinking'
  isSpeaking = false,
  size = 64, // pixel diameter
  className = ''
}) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="NOVA Astronaut Character"
    >
      <style>{`
        @keyframes novaFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-5px) rotate(1.8deg);
          }
        }
        @keyframes novaBlink {
          0%, 93%, 100% {
            transform: scaleY(1);
          }
          96% {
            transform: scaleY(0.1);
          }
        }
        @keyframes novaTalk {
          0%, 100% {
            transform: scaleY(0.7) scaleX(0.95);
          }
          50% {
            transform: scaleY(1.4) scaleX(1.15);
          }
        }
        @keyframes novaPulseStar {
          0%, 100% {
            filter: drop-shadow(0 0 3px #38bdf8);
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 8px #67e8f9);
            transform: scale(1.2);
          }
        }
        @keyframes novaWaveGlow {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        .nova-float-anim {
          animation: novaFloat 3.6s ease-in-out infinite;
        }
        .nova-eye-blink {
          transform-origin: 32px 30px;
          animation: novaBlink 3.8s infinite;
        }
        .nova-mouth-talk {
          transform-origin: 32px 36px;
          animation: novaTalk 0.26s ease-in-out infinite;
        }
        .nova-star-pulse {
          transform-origin: 32px 4px;
          animation: novaPulseStar 2s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="nova-float-anim drop-shadow-[0_4px_14px_rgba(56,189,248,0.4)]"
      >
        <defs>
          {/* Helmet Glass Gradient */}
          <radialGradient id="helmetGlass" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="65%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#090d16" />
          </radialGradient>

          {/* Visor Specular Sheen */}
          <linearGradient id="visorSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#818cf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>

          {/* Spacesuit 3D White Shading */}
          <linearGradient id="suitWhite" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Backpack Gradient */}
          <linearGradient id="backpackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
        </defs>

        {/* ================================================================= */}
        {/* LIFE SUPPORT BACKPACK                                             */}
        {/* ================================================================= */}
        <rect x="15" y="27" width="34" height="25" rx="6" fill="url(#backpackGrad)" stroke="#475569" strokeWidth="1.2" />
        <rect x="18" y="30" width="28" height="19" rx="4" fill="#334155" opacity="0.4" />

        {/* Small Oxygen Cylinders */}
        <rect x="12" y="31" width="4.5" height="17" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
        <rect x="47.5" y="31" width="4.5" height="17" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="1" />

        {/* ================================================================= */}
        {/* SPACESUIT TORSO & LIMBS                                           */}
        {/* ================================================================= */}
        {/* Left & Right Arms */}
        <path d="M19 36 C13 40, 12 48, 16 52 C18 50, 19 46, 21 42 Z" fill="url(#suitWhite)" stroke="#94a3b8" strokeWidth="1" />
        <path d="M45 36 C51 40, 52 48, 48 52 C46 50, 45 46, 43 42 Z" fill="url(#suitWhite)" stroke="#94a3b8" strokeWidth="1" />
        {/* Blue Arm Cuffs */}
        <ellipse cx="15.5" cy="51" rx="2.5" ry="1.5" fill="#38bdf8" />
        <ellipse cx="48.5" cy="51" rx="2.5" ry="1.5" fill="#38bdf8" />

        {/* Body Torso */}
        <path
          d="M21 34 C21 30, 43 30, 43 34 L45 54 C45 56.5, 19 56.5, 19 54 Z"
          fill="url(#suitWhite)"
          stroke="#94a3b8"
          strokeWidth="1.2"
        />

        {/* Chestpack Computer Unit */}
        <rect x="25" y="36" width="14" height="12" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
        {/* LED Status Indicators */}
        <circle cx="28" cy="40" r="1.3" fill="#22c55e" />
        <circle cx="32" cy="40" r="1.3" fill="#38bdf8" />
        <circle cx="36" cy="40" r="1.3" fill="#f59e0b" />
        {/* Chestpack Grid lines */}
        <line x1="27" y1="44" x2="37" y2="44" stroke="#475569" strokeWidth="1" strokeLinecap="round" />

        {/* Neck Seal Collar Ring */}
        <ellipse cx="32" cy="33.5" rx="12" ry="3.5" fill="#64748b" stroke="#334155" strokeWidth="1.2" />

        {/* ================================================================= */}
        {/* ASTRONAUT HELMET                                                  */}
        {/* ================================================================= */}
        {/* Outer White Helmet Shell */}
        <circle cx="32" cy="22" r="16.5" fill="url(#suitWhite)" stroke="#94a3b8" strokeWidth="1.3" />

        {/* Antenna Mast & Pulsing Guide Star */}
        <line x1="32" y1="6" x2="32" y2="1.5" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
        <g className="nova-star-pulse">
          <circle cx="32" cy="1.5" r="3.2" fill="#38bdf8" />
          <path d="M32 -1.5 L33 0.8 L35.2 1.5 L33 2.2 L32 4.5 L31 2.2 L28.8 1.5 L31 0.8 Z" fill="#ffffff" />
        </g>

        {/* Inner Helmet Visor Rim */}
        <rect x="19.5" y="11.5" width="25" height="20" rx="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.4" />

        {/* Visor Dark Glass Faceplate */}
        <rect x="20.5" y="12.5" width="23" height="18" rx="8" fill="url(#helmetGlass)" />

        {/* Curved Visor Specular Glass Reflection (Cyan Sheen) */}
        <path
          d="M22 14 C27 12.5, 37 13.5, 41 17 C36 17, 28 17.5, 23 20 Z"
          fill="url(#visorSheen)"
          opacity="0.85"
        />

        {/* ================================================================= */}
        {/* EXPRESSIVE CARTOON FACE                                           */}
        {/* ================================================================= */}
        <g>
          {/* Eyebrows based on Expression */}
          {expression === 'thinking' && (
            <g stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round">
              <line x1="25" y1="18" x2="29" y2="19.5" />
              <line x1="35" y1="18.5" x2="39" y2="17" />
            </g>
          )}
          {expression === 'wondering' && (
            <g stroke="#94a3b8" strokeWidth="1.1" strokeLinecap="round">
              <path d="M25 18 Q27 16 29 18" fill="none" />
              <path d="M35 17 Q37 15 39 17" fill="none" />
            </g>
          )}
          {(expression === 'happy' || expression === 'explaining') && (
            <g stroke="#38bdf8" strokeWidth="1.1" strokeLinecap="round" opacity="0.8">
              <path d="M25 18.5 Q27 17.5 29 18.5" fill="none" />
              <path d="M35 18.5 Q37 17.5 39 18.5" fill="none" />
            </g>
          )}

          {/* Expressive Blinking Eyes with Sparkle Pupils */}
          <g className="nova-eye-blink">
            {/* Left Eye */}
            <ellipse cx="27" cy="22" rx="2.4" ry="3.2" fill="#38bdf8" />
            <circle cx="26.3" cy="21" r="1.1" fill="#ffffff" />
            <circle cx="27.8" cy="23.2" r="0.5" fill="#ffffff" />

            {/* Right Eye */}
            <ellipse cx="37" cy="22" rx="2.4" ry="3.2" fill="#38bdf8" />
            <circle cx="36.3" cy="21" r="1.1" fill="#ffffff" />
            <circle cx="37.8" cy="23.2" r="0.5" fill="#ffffff" />
          </g>

          {/* Cute Rosy Blush Cheeks */}
          <ellipse cx="24" cy="24.5" rx="1.8" ry="1.1" fill="#f43f5e" opacity="0.6" />
          <ellipse cx="40" cy="24.5" rx="1.8" ry="1.1" fill="#f43f5e" opacity="0.6" />

          {/* Dynamic Mouth / Talking Animation */}
          {isSpeaking ? (
            <path
              d="M29.5 26.5 Q32 30 34.5 26.5 Z"
              fill="#f8fafc"
              stroke="#06b6d4"
              strokeWidth="1"
              className="nova-mouth-talk"
            />
          ) : expression === 'happy' ? (
            <path
              d="M29.5 26 Q32 28.8 34.5 26"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          ) : expression === 'explaining' ? (
            <ellipse cx="32" cy="26.5" rx="1.8" ry="1.2" fill="#ffffff" />
          ) : expression === 'thinking' ? (
            <line x1="30" y1="26.5" x2="34" y2="26.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          ) : (
            <circle cx="32" cy="26.5" r="1.3" fill="#ffffff" />
          )}
        </g>
      </svg>
    </div>
  );
}
