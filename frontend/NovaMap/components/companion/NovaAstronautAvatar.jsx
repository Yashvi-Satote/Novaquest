import React from 'react';

/**
 * NovaAstronautAvatar.jsx
 * 
 * An expressive cartoon astronaut character: NOVA — Your Personal Space Guide.
 * 
 * Features:
 * - Micro-gravity floating animation
 * - Blinking eyes & expressive visor
 * - Dynamic expressions: 'happy', 'explaining', 'wondering', 'thinking'
 * - Talking mouth animation when speaking
 * - Glowing antenna sensor star & chest control lights
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
      aria-label="NOVA Astronaut Companion"
    >
      <style>{`
        @keyframes novaFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(1.5deg);
          }
        }
        @keyframes novaBlink {
          0%, 92%, 100% {
            transform: scaleY(1);
          }
          96% {
            transform: scaleY(0.12);
          }
        }
        @keyframes novaTalk {
          0%, 100% {
            transform: scaleY(0.8) scaleX(1);
          }
          50% {
            transform: scaleY(1.4) scaleX(1.1);
          }
        }
        @keyframes novaPulseStar {
          0%, 100% {
            filter: drop-shadow(0 0 2px #38bdf8);
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 6px #38bdf8);
            transform: scale(1.15);
          }
        }
        .nova-floating {
          animation: novaFloat 3.8s ease-in-out infinite;
        }
        .nova-eyes-blink {
          transform-origin: center;
          animation: novaBlink 3.6s infinite;
        }
        .nova-talking-mouth {
          transform-origin: center;
          animation: novaTalk 0.28s ease-in-out infinite;
        }
        .nova-antenna-star {
          transform-origin: 32px 6px;
          animation: novaPulseStar 2s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="nova-floating drop-shadow-[0_4px_12px_rgba(34,211,238,0.35)]"
      >
        {/* Antenna Mast & Pulsing Star */}
        <line x1="32" y1="12" x2="32" y2="6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <g className="nova-antenna-star">
          <circle cx="32" cy="5" r="3.2" fill="#38bdf8" />
          <path d="M32 2 L33 4.5 L35.5 5 L33 5.5 L32 8 L31 5.5 L28.5 5 L31 4.5 Z" fill="#ffffff" />
        </g>

        {/* Life-Support Backpack */}
        <rect x="14" y="26" width="36" height="26" rx="6" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
        <rect x="17" y="29" width="30" height="20" rx="4" fill="#94a3b8" opacity="0.4" />

        {/* Spacesuit Torso */}
        <path
          d="M20 34 C20 30, 44 30, 44 34 L46 54 C46 56, 18 56, 18 54 Z"
          fill="#f8fafc"
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* Chestpack control panel */}
        <rect x="25" y="37" width="14" height="10" rx="2" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
        <circle cx="28" cy="42" r="1.5" fill="#38bdf8" />
        <circle cx="32" cy="42" r="1.5" fill="#a855f7" />
        <circle cx="36" cy="42" r="1.5" fill="#10b981" />

        {/* Arm cuffs */}
        <ellipse cx="16" cy="40" rx="3.5" ry="7" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" transform="rotate(15 16 40)" />
        <ellipse cx="48" cy="40" rx="3.5" ry="7" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" transform="rotate(-15 48 40)" />
        {/* Cute mittens */}
        <circle cx="14" cy="46" r="3" fill="#0284c7" />
        <circle cx="50" cy="46" r="3" fill="#0284c7" />

        {/* Big Rounded Astronaut Helmet */}
        <rect
          x="13"
          y="10"
          width="38"
          height="32"
          rx="16"
          fill="#ffffff"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Helmet Visor Outer Ring */}
        <rect
          x="16"
          y="13"
          width="32"
          height="24"
          rx="12"
          fill="#090d16"
          stroke="#06b6d4"
          strokeWidth="1.8"
        />

        {/* Visor Deep Galaxy Gradient & Star Sheen */}
        <path
          d="M18 16 C22 14, 42 14, 46 16 C47 22, 47 26, 45 32 C41 35, 23 35, 19 32 C17 26, 17 22, 18 16 Z"
          fill="url(#visorGradient)"
          opacity="0.9"
        />

        {/* Cute Cartoon Eyes on Visor */}
        <g className="nova-eyes-blink">
          {expression === 'happy' && (
            <>
              {/* Joyful upward curved eyes */}
              <path d="M22 25 Q25 21 28 25" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M36 25 Q39 21 42 25" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              {/* Rosy cheeks */}
              <circle cx="21" cy="27" r="1.8" fill="#f43f5e" opacity="0.6" />
              <circle cx="43" cy="27" r="1.8" fill="#f43f5e" opacity="0.6" />
            </>
          )}

          {expression === 'explaining' && (
            <>
              {/* Big alert anime-style cartoon eyes with sparkle */}
              <ellipse cx="25" cy="23" rx="3.5" ry="4.5" fill="#38bdf8" />
              <circle cx="24" cy="21.5" r="1.5" fill="#ffffff" />
              <circle cx="26.5" cy="24.5" r="0.8" fill="#ffffff" />

              <ellipse cx="39" cy="23" rx="3.5" ry="4.5" fill="#38bdf8" />
              <circle cx="38" cy="21.5" r="1.5" fill="#ffffff" />
              <circle cx="40.5" cy="24.5" r="0.8" fill="#ffffff" />

              {/* Rosy cheeks */}
              <circle cx="21" cy="27" r="1.8" fill="#f43f5e" opacity="0.5" />
              <circle cx="43" cy="27" r="1.8" fill="#f43f5e" opacity="0.5" />
            </>
          )}

          {expression === 'wondering' && (
            <>
              {/* Big curious starry eyes */}
              <ellipse cx="25" cy="23" rx="4" ry="4.8" fill="#67e8f9" />
              <polygon points="25,20 25.8,22.2 28,23 25.8,23.8 25,26 24.2,23.8 22,23 24.2,22.2" fill="#ffffff" />

              <ellipse cx="39" cy="23" rx="4" ry="4.8" fill="#67e8f9" />
              <polygon points="39,20 39.8,22.2 42,23 39.8,23.8 39,26 38.2,23.8 36,23 38.2,22.2" fill="#ffffff" />
            </>
          )}

          {expression === 'thinking' && (
            <>
              {/* Looking up-right thinking eyes */}
              <ellipse cx="26" cy="21" rx="3.2" ry="3.8" fill="#818cf8" />
              <circle cx="27" cy="20" r="1.2" fill="#ffffff" />

              <ellipse cx="40" cy="21" rx="3.2" ry="3.8" fill="#818cf8" />
              <circle cx="41" cy="20" r="1.2" fill="#ffffff" />
            </>
          )}
        </g>

        {/* Animated Mouth on Visor */}
        {isSpeaking ? (
          <ellipse
            cx="32"
            cy="28"
            rx="2.8"
            ry="2"
            fill="#38bdf8"
            className="nova-talking-mouth"
          />
        ) : (
          <path
            d="M30 27 Q32 29.5 34 27"
            stroke="#38bdf8"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Visor Diagonal Glass Reflection Glare */}
        <path
          d="M20 16 Q24 14 30 14 L24 24 Q20 22 18 20 Z"
          fill="#ffffff"
          opacity="0.25"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="visorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0c192c" />
            <stop offset="60%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
