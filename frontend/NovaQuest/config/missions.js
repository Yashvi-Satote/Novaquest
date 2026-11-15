/**
 * missions.js
 * 
 * Scalable Mission Registry for "Time Travelers of Space" — NovaQuest Games
 * 
 * Level 1 is the fully playable primary mission (Surveyor 5).
 * Future levels are displayed with authentic historical metadata but are properly locked.
 */

import { SURVEYOR_5_MISSION } from './surveyor5Data';

export const ALL_MISSIONS = [
  {
    id: SURVEYOR_5_MISSION.id,
    levelNumber: 1,
    title: SURVEYOR_5_MISSION.title,
    subtitle: SURVEYOR_5_MISSION.subtitle,
    year: SURVEYOR_5_MISSION.year,
    destination: 'The Moon (Mare Tranquillitatis)',
    difficulty: SURVEYOR_5_MISSION.difficulty,
    estimatedDuration: '5 Minutes',
    status: 'unlocked', // 'unlocked' | 'completed' | 'locked'
    heroImage: '/images/surveyor1_moon_earth.jpg',
    badge: SURVEYOR_5_MISSION.badgeName,
    tags: ['Moon', 'Lander', '1967', 'Robotic', 'Apollo Precursor'],
    data: SURVEYOR_5_MISSION
  },
  {
    id: 'voyager-1',
    levelNumber: 2,
    title: 'Message of Earth — Voyager 1',
    subtitle: 'Journey into Empty Interstellar Space',
    year: 1977,
    destination: 'Interstellar Space',
    difficulty: 'Beginner Friendly',
    estimatedDuration: '5 Minutes',
    status: 'locked',
    lockReason: 'Complete Level 1: Surveyor 5 to unlock',
    heroImage: '/textures/planets/milky_way.jpg',
    badge: 'Golden Record Star',
    tags: ['Voyager 1', 'Interstellar', '1977', 'Golden Record'],
    data: {
      summary: 'Inspect NASA\'s Voyager 1 spacecraft drifting in the quiet void of interstellar space, carrying humanity\'s Golden Record — the Message of Earth.',
      scenes: []
    }
  },
  {
    id: 'apollo-11',
    levelNumber: 3,
    title: 'Apollo 11 — One Giant Leap',
    subtitle: 'Humanity Touches Another World',
    year: 1969,
    destination: 'The Moon (Sea of Tranquility)',
    difficulty: 'Intermediate',
    estimatedDuration: '7 Minutes',
    status: 'locked',
    isUnderDevelopment: true,
    lockReason: 'Under Development',
    heroImage: '/images/moon_close_up_telescope.jpg',
    badge: 'Under Development',
    tags: ['Apollo', 'Crewed', '1969', 'Moonwalkers']
  },
  {
    id: 'viking-1',
    levelNumber: 4,
    title: 'Viking 1 — The Red Planet',
    subtitle: 'First Long-Term Mars Lander',
    year: 1976,
    destination: 'Mars (Chryse Planitia)',
    difficulty: 'Intermediate',
    estimatedDuration: '8 Minutes',
    status: 'locked',
    isUnderDevelopment: true,
    lockReason: 'Under Development',
    heroImage: '/textures/planets/mars.jpg',
    badge: 'Under Development',
    tags: ['Mars', 'Lander', '1976', 'Astrobiology']
  },
  {
    id: 'cassini-huygens',
    levelNumber: 5,
    title: 'Cassini-Huygens — Lord of the Rings',
    subtitle: 'Descent to Titan & Plumes of Enceladus',
    year: 1997,
    destination: 'Saturn & Titan',
    difficulty: 'Advanced',
    estimatedDuration: '10 Minutes',
    status: 'locked',
    isUnderDevelopment: true,
    lockReason: 'Under Development',
    heroImage: '/textures/planets/saturn.jpg',
    badge: 'Under Development',
    tags: ['Saturn', 'Orbiter', 'Probe', 'Ocean Worlds']
  },
  {
    id: 'jwst',
    levelNumber: 6,
    title: 'James Webb — Cosmic Dawn',
    subtitle: 'Unfolding the Golden Honeycomb in L2',
    year: 2021,
    destination: 'Sun-Earth L2 Lagrange Point',
    difficulty: 'Master',
    estimatedDuration: '12 Minutes',
    status: 'locked',
    isUnderDevelopment: true,
    lockReason: 'Under Development',
    heroImage: '/textures/planets/milky_way.jpg',
    badge: 'Under Development',
    tags: ['Telescope', 'Infrared', 'L2', 'First Stars']
  }
];

export function getMissionsWithProgress() {
  const isLevel1Done = typeof window !== 'undefined' && (
    localStorage.getItem('novaquest_level1_completed') === 'true' ||
    localStorage.getItem('novaquest_level2_unlocked') === 'true'
  );

  return ALL_MISSIONS.map((m) => {
    if (m.levelNumber === 1) {
      return {
        ...m,
        status: isLevel1Done ? 'completed' : 'unlocked'
      };
    }
    if (m.levelNumber === 2) {
      return {
        ...m,
        status: isLevel1Done ? 'unlocked' : 'locked',
        lockReason: isLevel1Done ? '' : 'Complete Level 1: Surveyor 5 to unlock'
      };
    }
    return {
      ...m,
      status: 'locked',
      isUnderDevelopment: true,
      lockReason: 'Under Development'
    };
  });
}

export function getMissionById(id) {
  const missions = getMissionsWithProgress();
  return missions.find(m => m.id === id) || ALL_MISSIONS[0];
}

