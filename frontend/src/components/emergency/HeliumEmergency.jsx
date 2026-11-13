import React, { useEffect, useRef } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { gameAudio } from '../../../NovaQuest/config/gameAudio.js';

/**
 * HeliumEmergency
 * 
 * Renders the full-screen emergency effects when HELIUM_T is reached:
 * - Red pulsing HUD screen border
 * - Top glowing hazard warning banner: "WARNING: HELIUM LEAK DETECTED"
 * - Looping alarm siren audio while emergency is active
 */
export default function HeliumEmergency({ isActive, onOpenTask3 }) {
  const sirenIntervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      // Play initial alarm
      gameAudio.playAlarm?.();

      // Loop alarm siren every 2.2 seconds while active
      sirenIntervalRef.current = setInterval(() => {
        gameAudio.playAlarm?.();
      }, 2200);
    } else {
      if (sirenIntervalRef.current) {
        clearInterval(sirenIntervalRef.current);
        sirenIntervalRef.current = null;
      }
    }

    return () => {
      if (sirenIntervalRef.current) {
        clearInterval(sirenIntervalRef.current);
        sirenIntervalRef.current = null;
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* Red Pulsing HUD Border */}
      <div
        className="pointer-events-none fixed inset-0 z-[190] border-4 border-rose-500/80 shadow-[inset_0_0_60px_rgba(244,63,94,0.55)] animate-pulse"
        aria-hidden="true"
      />

      {/* Top Warning Hazard Banner */}
      <div className="fixed top-3 sm:top-5 inset-x-0 z-[200] flex justify-center px-4 pointer-events-auto animate-bounce">
        <div className="flex items-center gap-3 sm:gap-4 px-6 py-2.5 rounded-full border-2 border-rose-500/90 bg-gradient-to-r from-[#3b060d] via-[#5c0b15] to-[#3b060d] shadow-[0_0_35px_rgba(244,63,94,0.7)] text-white select-none">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 animate-pulse shrink-0" />
          
          <div className="text-center">
            <span className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.28em] text-rose-200">
              WARNING: HELIUM LEAK DETECTED
            </span>
            <span className="block text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-rose-300/80">
              Descent Engine Pressure Dropping · Mission On Hold
            </span>
          </div>

          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 animate-pulse shrink-0" />

          {onOpenTask3 && (
            <button
              type="button"
              onClick={onOpenTask3}
              className="ml-2 px-3 py-1 rounded bg-rose-500 hover:bg-rose-400 text-black font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider shadow-md transition-all active:scale-95"
            >
              Solve Task 3
            </button>
          )}
        </div>
      </div>
    </>
  );
}
