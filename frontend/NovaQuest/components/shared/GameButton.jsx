import React from 'react';
import { gameAudio } from '../../config/gameAudio';

/**
 * GameButton.jsx
 * 
 * Commercial-quality, kid-friendly (ages 8-14) 3D cartoon adventure button.
 * - Rounded bouncy 3D push-button styling.
 * - Tactile shadow and specular top sheen.
 * - Smooth hover and active bounce.
 * - Plays audio click feedback automatically.
 */
export default function GameButton({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'accent' | 'highlight' | 'success' | 'purple' | 'glass'
  size = 'md',        // 'sm' | 'md' | 'lg' | 'xl'
  disabled = false,
  active = false,
  completed = false,
  className = '',
  icon: Icon,
  type = 'button',
  ...rest
}) {
  const handleClick = (e) => {
    if (disabled) return;
    gameAudio.playClick();
    if (onClick) onClick(e);
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5 min-h-[36px]',
    md: 'px-5 py-2.5 text-sm sm:text-base font-bold rounded-2xl gap-2 min-h-[46px]',
    lg: 'px-7 py-3.5 text-base sm:text-lg font-extrabold rounded-2xl gap-2.5 min-h-[56px]',
    xl: 'px-8 py-4 text-lg sm:text-xl font-black rounded-3xl gap-3 min-h-[64px]'
  }[size] || 'px-5 py-2.5 text-sm rounded-2xl gap-2';

  // Variant themes
  const variantClasses = {
    primary: 'bg-gradient-to-b from-sky-400 via-sky-500 to-sky-600 text-white shadow-[0_6px_0_#0284c7,0_10px_20px_rgba(14,165,233,0.35)] hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_#0284c7,0_4px_10px_rgba(14,165,233,0.3)] border-t border-sky-300/60',
    accent: 'bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 text-white shadow-[0_6px_0_#c2410c,0_10px_20px_rgba(249,115,22,0.4)] hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_#c2410c,0_4px_10px_rgba(249,115,22,0.3)] border-t border-orange-300/60',
    highlight: 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 text-slate-900 shadow-[0_6px_0_#b45309,0_10px_20px_rgba(234,179,8,0.4)] hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_#b45309,0_4px_10px_rgba(234,179,8,0.3)] border-t border-yellow-200',
    success: 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white shadow-[0_6px_0_#047857,0_10px_20px_rgba(16,185,129,0.35)] hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_#047857,0_4px_10px_rgba(16,185,129,0.3)] border-t border-emerald-300/60',
    purple: 'bg-gradient-to-b from-purple-400 via-purple-500 to-purple-600 text-white shadow-[0_6px_0_#7e22ce,0_10px_20px_rgba(168,85,247,0.35)] hover:brightness-110 active:translate-y-1 active:shadow-[0_2px_0_#7e22ce,0_4px_10px_rgba(168,85,247,0.3)] border-t border-purple-300/60',
    glass: 'bg-slate-900/80 backdrop-blur-md text-sky-200 border border-sky-400/40 shadow-[0_4px_16px_rgba(14,165,233,0.15)] hover:bg-slate-800/90 hover:border-sky-300 hover:text-white active:translate-y-0.5'
  }[variant] || '';

  // Completed or disabled state overrides
  if (completed) {
    return (
      <button
        type={type}
        disabled
        className={`inline-flex items-center justify-center font-bold select-none cursor-default bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-inner ${sizeClasses} ${className}`}
        {...rest}
      >
        {Icon && <Icon className="w-5 h-5 text-emerald-400" />}
        <span>{children || 'Completed'}</span>
      </button>
    );
  }

  if (disabled) {
    return (
      <button
        type={type}
        disabled
        className={`inline-flex items-center justify-center font-semibold select-none cursor-not-allowed bg-slate-800/60 text-slate-500 border border-slate-700/50 shadow-none opacity-60 ${sizeClasses} ${className}`}
        {...rest}
      >
        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
        <span>{children}</span>
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      className={`inline-flex items-center justify-center select-none cursor-pointer tracking-wide transition-all transform hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-4 focus:ring-sky-400/50 ${sizeClasses} ${variantClasses} ${
        active ? 'ring-4 ring-yellow-400' : ''
      } ${className}`}
      {...rest}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />}
      <span className="relative z-10 drop-shadow-sm">{children}</span>
    </button>
  );
}

