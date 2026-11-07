import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * NovaAstronautAvatar.jsx
 * 
 * NOVA — Interactive AI Cartoon Space Companion.
 * 
 * VISUAL DESIGN:
 * - Cute 3D cartoon astronaut / cosmic explorer matching the user's provided reference image.
 * - Adorable cyan-teal alien explorer with glossy dark eyes and smooth facial features.
 * - Large transparent spherical glass helmet showcasing a deep space cosmic nebula interior.
 * - Sleek charcoal spacesuit with metallic collar ring and high-tech chest detailing.
 * - Smooth micro-gravity zero-g idle floating bobbing motion.
 * - Responsive speech gestures and synchronized speaking pulse animation.
 * - Ambient cosmic starlight glow and sparkling particles.
 * - Holographic listening wave indicator when voice input is active.
 * - Vector SVG fallback in case the image asset fails to load.
 */
export default function NovaAstronautAvatar({
  expression = 'happy',
  isSpeaking = false,
  isGesturing = false,
  isListening = false,
  size = 120,
  className = ''
}) {
  const [imageError, setImageError] = useState(false);
  const isCommunicating = isSpeaking || isGesturing;

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size * 1.12 }}
      aria-label="NOVA Cartoon Space Companion"
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
        @keyframes novaAlienTalk {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-5px) rotate(-2.5deg) scale(1.03);
          }
          50% {
            transform: translateY(-2px) rotate(1.8deg) scale(1.015);
          }
          75% {
            transform: translateY(-6px) rotate(-1.2deg) scale(1.035);
          }
        }
        @keyframes novaCosmicHalo {
          0%, 100% {
            filter: drop-shadow(0 6px 18px rgba(56, 189, 248, 0.45)) drop-shadow(0 0 25px rgba(99, 102, 241, 0.25));
          }
          50% {
            filter: drop-shadow(0 8px 30px rgba(56, 189, 248, 0.8)) drop-shadow(0 0 45px rgba(168, 85, 247, 0.45));
          }
        }
        @keyframes novaStarlightPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }
        @keyframes novaSpeechRippleRing {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.28);
            opacity: 0;
          }
        }
        @keyframes novaListenWave {
          0% {
            transform: scale(0.85);
            opacity: 0.85;
          }
          100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }
        .nova-mascot-float {
          animation: novaMascotFloat 3.8s ease-in-out infinite;
        }
        .nova-alien-talk {
          animation: novaAlienTalk 0.68s ease-in-out infinite;
        }
        .nova-cosmic-halo {
          animation: novaCosmicHalo 3.2s ease-in-out infinite;
        }
        .nova-star-sparkle-1 {
          animation: novaStarlightPulse 2.4s ease-in-out infinite;
        }
        .nova-star-sparkle-2 {
          animation: novaStarlightPulse 3.1s ease-in-out infinite 0.8s;
        }
        .nova-speech-ripple {
          animation: novaSpeechRippleRing 1.3s ease-out infinite;
        }
        .nova-listening-wave {
          animation: novaListenWave 1.4s ease-out infinite;
        }
      `}</style>

      {/* Holographic Communication Wave Ring when speaking */}
      {isCommunicating && (
        <span 
          className="absolute -inset-2.5 rounded-full border border-cyan-400/50 pointer-events-none nova-speech-ripple"
          style={{ borderRadius: '50%' }}
        />
      )}

      {/* Listening Wave Ring when user is speaking */}
      {isListening && (
        <span 
          className="absolute -inset-3 rounded-full border-2 border-rose-400/60 pointer-events-none nova-listening-wave"
          style={{ borderRadius: '50%' }}
        />
      )}

      {/* Main Mascot Character Container */}
      <div 
        id="nova-mascot-character"
        className={`relative w-full h-full flex items-center justify-center ${
          isCommunicating ? 'nova-alien-talk' : 'nova-mascot-float'
        }`}
      >
        {!imageError ? (
          <img
            src="/images/nova_alien_companion.png"
            alt="NOVA Space Companion"
            width={size}
            height={size * 1.12}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain pointer-events-none select-none nova-cosmic-halo drop-shadow-[0_10px_25px_rgba(14,165,233,0.55)] transition-all"
            draggable={false}
          />
        ) : (
          /* High-Quality Vector Fallback if Image is unavailable */
          <svg
            viewBox="0 0 128 148"
            width={size}
            height={size * 1.12}
            className="nova-cosmic-halo drop-shadow-[0_10px_25px_rgba(14,165,233,0.45)]"
          >
            <defs>
              <radialGradient id="alienHeadGrad" cx="45%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="60%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0891b2" />
              </radialGradient>
              <radialGradient id="helmetDomeGrad" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#0f172a" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
              </radialGradient>
              <linearGradient id="suitDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            {/* Spacesuit Body */}
            <rect x="42" y="75" width="44" height="42" rx="14" fill="url(#suitDarkGrad)" stroke="#475569" strokeWidth="2" />
            <circle cx="64" cy="92" r="5" fill="#0284c7" />
            {/* Collar */}
            <ellipse cx="64" cy="74" rx="20" ry="6" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            {/* Transparent Helmet */}
            <circle cx="64" cy="46" r="34" fill="url(#helmetDomeGrad)" stroke="#38bdf8" strokeWidth="2" />
            {/* Alien Head */}
            <ellipse cx="64" cy="48" rx="22" ry="20" fill="url(#alienHeadGrad)" />
            {/* Black Almond Alien Eyes */}
            <ellipse cx="53" cy="46" rx="6.5" ry="9" fill="#020617" transform="rotate(-12 53 46)" />
            <ellipse cx="75" cy="46" rx="6.5" ry="9" fill="#020617" transform="rotate(12 75 46)" />
            <circle cx="51.5" cy="43" r="2.2" fill="#ffffff" />
            <circle cx="73.5" cy="43" r="2.2" fill="#ffffff" />
          </svg>
        )}

        {/* Ambient Cosmic Starlight Sparkles around the helmet */}
        <div className="absolute top-1 left-2 pointer-events-none nova-star-sparkle-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 drop-shadow-[0_0_6px_#38bdf8]" />
        </div>
        <div className="absolute top-3 right-2 pointer-events-none nova-star-sparkle-2">
          <Sparkles className="w-2.5 h-2.5 text-purple-300 drop-shadow-[0_0_6px_#c084fc]" />
        </div>
      </div>
    </div>
  );
}
