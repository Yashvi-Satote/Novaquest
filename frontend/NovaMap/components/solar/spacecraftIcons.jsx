import React from 'react';
import { 
  Orbit, 
  Crosshair, 
  MapPin, 
  Radio, 
  Telescope, 
  Layers, 
  Users, 
  Box, 
  Target, 
  Flame, 
  Archive,
  Send
} from 'lucide-react';

/**
 * Returns a visually distinct icon component for a given spacecraft or mission object category.
 * Complies with Objective 1: Distinguishable icons across orbiters, rovers, landers, probes, etc.
 */
export function getSpacecraftCategoryIcon(category, className = 'w-4 h-4') {
  const cat = (category || '').toLowerCase();

  if (cat.includes('rover') || cat.includes('rotorcraft') || cat.includes('helicopter')) {
    return <Crosshair className={className} />;
  }
  if (cat.includes('lander') || cat.includes('descent stage') || cat.includes('lunar roving')) {
    return <MapPin className={className} />;
  }
  if (cat.includes('orbiter')) {
    return <Orbit className={className} />;
  }
  if (cat.includes('interstellar') || cat.includes('flyby')) {
    return <Send className={className} />;
  }
  if (cat.includes('telescope') || cat.includes('observatory')) {
    return <Telescope className={className} />;
  }
  if (cat.includes('station')) {
    return <Layers className={className} />;
  }
  if (cat.includes('satellite')) {
    return <Radio className={className} />;
  }
  if (cat.includes('crewed') || cat.includes('apollo')) {
    return <Users className={className} />;
  }
  if (cat.includes('sample return')) {
    return <Box className={className} />;
  }
  if (cat.includes('impactor')) {
    return <Target className={className} />;
  }
  if (cat.includes('debris') || cat.includes('rocket body')) {
    return <Flame className={className} />;
  }

  // Default / Unmapped
  return <Archive className={className} />;
}

/**
 * Returns category visual styling tokens (badges, background colors, borders).
 * Follows the dark-purple space mission control palette.
 */
export function getCategoryBadgeStyle(category) {
  const cat = (category || '').toLowerCase();

  if (cat.includes('rover')) {
    return {
      badgeClass: 'bg-amber-950/60 border-amber-500/30 text-amber-300',
      accentColor: '#f59e0b',
      label: 'Surface Rover'
    };
  }
  if (cat.includes('lander') || cat.includes('descent stage')) {
    return {
      badgeClass: 'bg-amber-950/70 border-amber-500/40 text-amber-200',
      accentColor: '#fbbf24',
      label: 'Surface Lander'
    };
  }
  if (cat.includes('orbiter')) {
    return {
      badgeClass: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300',
      accentColor: '#06b6d4',
      label: 'Orbiter'
    };
  }
  if (cat.includes('interstellar') || cat.includes('flyby')) {
    return {
      badgeClass: 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300',
      accentColor: '#818cf8',
      label: 'Interstellar Probe'
    };
  }
  if (cat.includes('telescope')) {
    return {
      badgeClass: 'bg-purple-950/70 border-purple-500/40 text-purple-300',
      accentColor: '#c084fc',
      label: 'Space Observatory'
    };
  }
  if (cat.includes('station')) {
    return {
      badgeClass: 'bg-sky-950/70 border-sky-400/40 text-sky-200',
      accentColor: '#38bdf8',
      label: 'Space Station'
    };
  }
  if (cat.includes('satellite')) {
    return {
      badgeClass: 'bg-cyan-950/50 border-cyan-500/25 text-cyan-400',
      accentColor: '#22d3ee',
      label: 'Satellite'
    };
  }
  if (cat.includes('sample return')) {
    return {
      badgeClass: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300',
      accentColor: '#10b981',
      label: 'Sample Return'
    };
  }
  if (cat.includes('impactor')) {
    return {
      badgeClass: 'bg-rose-950/60 border-rose-500/30 text-rose-300',
      accentColor: '#f43f5e',
      label: 'Kinetic Impactor'
    };
  }

  return {
    badgeClass: 'bg-slate-900/80 border-white/10 text-slate-300',
    accentColor: '#94a3b8',
    label: category || 'Archival Spacecraft'
  };
}
