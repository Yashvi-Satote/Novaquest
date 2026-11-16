import React, { useRef } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Crosshair,
  Hand,
  Rabbit,
  ScanLine,
  ArrowUpFromLine,
} from 'lucide-react';
import { usePhoneLandscape } from '../../mobile/usePhoneLandscape';

/**
 * Touch equivalents of the NovaQuest WASD controls.
 *
 * The movement pad writes the same W/A/S/D state used by the keyboard
 * handlers, so the game logic does not need a second control path. Sprint is a
 * held Shift equivalent, and Jump/Scan/Interact mirror Space/F/E.
 *
 * Only rendered on phones in landscape; the landscape gate handles portrait.
 */
function HoldButton({
  onPress,
  onRelease,
  label,
  title,
  children,
  className = '',
}) {
  const isActiveRef = useRef(false);

  const handlePress = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is an enhancement; plain pointer events still work.
    }
    if (isActiveRef.current) return;
    isActiveRef.current = true;
    onPress?.();
  };

  const handleRelease = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isActiveRef.current) return;
    isActiveRef.current = false;
    onRelease?.();
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={title || label}
      onPointerDown={handlePress}
      onPointerUp={handleRelease}
      onPointerCancel={handleRelease}
      onLostPointerCapture={() => {
        if (!isActiveRef.current) return;
        isActiveRef.current = false;
        onRelease?.();
      }}
      onContextMenu={(event) => event.preventDefault()}
      className={`touch-none flex select-none flex-col items-center justify-center rounded-2xl border border-cyan-300/35 bg-slate-950/75 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.14)] backdrop-blur-md transition-transform active:scale-95 active:border-cyan-300 active:bg-cyan-400/25 ${className}`}
    >
      {children}
    </button>
  );
}

function TapButton({ onTap, label, title, children, className = '' }) {
  const handleTap = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    onTap?.();
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={title || label}
      onPointerDown={handleTap}
      onContextMenu={(event) => event.preventDefault()}
      className={`touch-none flex select-none flex-col items-center justify-center rounded-2xl border border-cyan-300/35 bg-slate-950/75 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.14)] backdrop-blur-md transition-transform active:scale-95 active:border-cyan-300 active:bg-cyan-400/25 ${className}`}
    >
      {children}
    </button>
  );
}

export default function MobileGameControls({
  onMoveChange,
  onJump,
  onScan,
  onInteract,
  showScan = true,
  showInteract = true,
  interactLabel = 'Interact',
  className = '',
}) {
  const { isPhone, isLandscape } = usePhoneLandscape();

  if (!isPhone || !isLandscape) return null;

  const move = (direction, pressed) => onMoveChange?.(direction, pressed);

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-end justify-between gap-3 px-3 pb-3 font-mono sm:px-5 sm:pb-5 ${className}`}
      style={{
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
      aria-label="NovaQuest touch controls"
    >
      {/* Movement pad — WASD */}
      <div className="pointer-events-auto flex flex-col items-center gap-1">
        <span className="text-[8px] font-black uppercase tracking-[0.26em] text-cyan-300/80">
          Move · WASD
        </span>
        <div className="grid grid-cols-3 grid-rows-3 gap-1.5">
          <HoldButton
            label="Move forward (W)"
            onPress={() => move('w', true)}
            onRelease={() => move('w', false)}
            className="col-start-2 row-start-1 h-11 w-11 sm:h-12 sm:w-12"
          >
            <ChevronUp className="h-5 w-5" />
            <span className="text-[8px] font-black leading-none">W</span>
          </HoldButton>

          <HoldButton
            label="Move left (A)"
            onPress={() => move('a', true)}
            onRelease={() => move('a', false)}
            className="col-start-1 row-start-2 h-11 w-11 sm:h-12 sm:w-12"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-[8px] font-black leading-none">A</span>
          </HoldButton>

          <HoldButton
            label="Move backward (S)"
            onPress={() => move('s', true)}
            onRelease={() => move('s', false)}
            className="col-start-2 row-start-2 h-11 w-11 sm:h-12 sm:w-12"
          >
            <ChevronDown className="h-5 w-5" />
            <span className="text-[8px] font-black leading-none">S</span>
          </HoldButton>

          <HoldButton
            label="Move right (D)"
            onPress={() => move('d', true)}
            onRelease={() => move('d', false)}
            className="col-start-3 row-start-2 h-11 w-11 sm:h-12 sm:w-12"
          >
            <ChevronRight className="h-5 w-5" />
            <span className="text-[8px] font-black leading-none">D</span>
          </HoldButton>
        </div>
      </div>

      {/* Action cluster */}
      <div className="pointer-events-auto flex flex-col items-end gap-1.5">
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-300/80">
          Actions
        </span>
        <div className="flex items-end gap-1.5">
          {(showScan || showInteract) && (
            <div className="flex flex-col gap-1.5">
              {showScan && (
                <TapButton
                  label="Scan (F)"
                  title="Scan the surface (F)"
                  onTap={onScan}
                  className="h-11 w-11 sm:h-12 sm:w-12"
                >
                  <ScanLine className="h-5 w-5" />
                  <span className="mt-0.5 text-[7px] font-black uppercase tracking-wider">Scan</span>
                </TapButton>
              )}
              {showInteract && (
                <TapButton
                  label={`${interactLabel} (E)`}
                  title={`${interactLabel} (E)`}
                  onTap={onInteract}
                  className="h-11 w-11 sm:h-12 sm:w-12"
                >
                  <Hand className="h-5 w-5" />
                  <span className="mt-0.5 text-[7px] font-black uppercase tracking-wider">{interactLabel}</span>
                </TapButton>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <HoldButton
              label="Sprint (Shift)"
              title="Hold to sprint (Shift)"
              onPress={() => move('shift', true)}
              onRelease={() => move('shift', false)}
              className="h-11 w-11 sm:h-12 sm:w-12"
            >
              <Rabbit className="h-5 w-5" />
              <span className="mt-0.5 text-[7px] font-black uppercase tracking-wider">Sprint</span>
            </HoldButton>

            <TapButton
              label="Jump (Space)"
              title="Low-gravity jump (Space)"
              onTap={onJump}
              className="h-14 w-14 border-amber-300/50 bg-amber-950/70 text-amber-200 shadow-[0_0_22px_rgba(251,191,36,0.2)] active:border-amber-300 active:bg-amber-400/25 sm:h-16 sm:w-16"
            >
              <ArrowUpFromLine className="h-6 w-6" />
              <span className="mt-0.5 text-[7px] font-black uppercase tracking-wider">Jump</span>
            </TapButton>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[7px] font-bold uppercase tracking-[0.14em] text-slate-400">
          <Crosshair className="h-3 w-3 text-cyan-300/80" />
          Drag the view to look
        </span>
      </div>
    </div>
  );
}
