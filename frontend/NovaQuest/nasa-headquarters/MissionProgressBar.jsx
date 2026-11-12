import React from 'react';

const NOTCH_CLIP =
  'polygon(0 22%, 1.6% 0, 98.4% 0, 100% 22%, 100% 78%, 98.4% 100%, 1.6% 100%, 0 78%)';

const HATCH_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(118deg, rgba(94, 231, 255, 0.85) 0px, rgba(94, 231, 255, 0.85) 2px, transparent 2px, transparent 5px)',
};

/**
 * MissionProgressBar
 *
 * Sci-fi telemetry bar shown above the Surveyor 5 hologram. Mirrors the
 * reference HUD: percentage readouts on both sides, a central title, a notched
 * glowing rail with a bright fill, and hatched tick marks beneath it.
 */
export default function MissionProgressBar({
  progress = 0,
  installed = 0,
  total = 0,
  className = '',
}) {
  const clamped = Math.max(0, Math.min(100, Number(progress) || 0));
  const percentLabel = `${clamped.toFixed(2)}%`;
  const glowText = { textShadow: '0 0 14px rgba(94, 231, 255, 0.85)' };

  return (
    <div
      className={`select-none ${className}`}
      role="progressbar"
      aria-label="Surveyor 5 mission progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
    >
      <div className="flex items-end gap-2 sm:gap-3">
        <span
          className="w-[44px] shrink-0 text-right text-[9px] font-semibold leading-none tracking-[0.03em] text-[#d8fdff] tabular-nums sm:w-[50px] sm:text-[10px]"
          style={glowText}
        >
          {percentLabel}
        </span>

        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="h-[1px] min-w-1 flex-1 bg-gradient-to-r from-transparent via-[#3fd8ff]/60 to-[#8ef4ff]" />
          <span
            className="whitespace-nowrap text-[7px] font-semibold uppercase tracking-[0.2em] text-[#9df6ff] sm:text-[8px] sm:tracking-[0.28em]"
            style={glowText}
          >
            Mission Progress
          </span>
          <span className="h-[1px] min-w-1 flex-1 bg-gradient-to-l from-transparent via-[#3fd8ff]/60 to-[#8ef4ff]" />
        </div>

        <span
          className="w-[44px] shrink-0 text-left text-[9px] font-semibold leading-none tracking-[0.03em] text-[#d8fdff] tabular-nums sm:w-[50px] sm:text-[10px]"
          style={glowText}
        >
          {percentLabel}
        </span>
      </div>

      <div className="relative mt-1.5 h-[13px] sm:h-[15px]">
        <div
          className="absolute inset-0 bg-[#56e8ff]/80"
          style={{
            clipPath: NOTCH_CLIP,
            filter: 'drop-shadow(0 0 8px rgba(74, 226, 255, 0.6))',
          }}
        >
          <div
            className="absolute inset-[2px] overflow-hidden bg-[#02101a]"
            style={{ clipPath: NOTCH_CLIP }}
          >
            <div
              className="h-full transition-[width] duration-700 ease-out"
              style={{
                width: `${clamped}%`,
                background:
                  'linear-gradient(90deg, #f2ffff 0%, #d7fdff 55%, #7deeff 100%)',
                boxShadow: '0 0 14px rgba(190, 250, 255, 0.9)',
              }}
            />
          </div>
        </div>

        <div className="absolute inset-x-0 top-full mt-0.5 flex items-center justify-center gap-1.5">
          <span className="h-[4px] w-[34%] opacity-75" style={HATCH_STYLE} />
          <span
            className="h-[3px] w-6 bg-[#5ee7ff]/85"
            style={{
              clipPath: 'polygon(12% 0, 88% 0, 100% 100%, 0 100%)',
              filter: 'drop-shadow(0 0 6px rgba(94, 231, 255, 0.8))',
            }}
          />
          <span className="h-[4px] w-[34%] opacity-75" style={HATCH_STYLE} />
        </div>
      </div>

      <p className="mt-2.5 text-center text-[6px] font-semibold uppercase tracking-[0.24em] text-[#5fc5df]/85 sm:text-[7px]">
        Surveyor 5 · {installed} / {total} parts verified
      </p>
    </div>
  );
}
