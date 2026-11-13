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
    status: 'unlocked',
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
    heroImage: '/images/moon_close_up_telescope.jpg',
    badge: 'Tranquility Base Medal',
    tags: ['Apollo', 'Crewed', '1969', 'Moonwalkers'],
    lockReason: 'Complete Level 2: Message of Earth to unlock Apollo 11'
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
    heroImage: '/textures/planets/mars.jpg',
    badge: 'Martian Explorer Ribbon',
    tags: ['Mars', 'Lander', '1976', 'Astrobiology'],
    lockReason: 'Complete Level 3 to unlock Viking 1'
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
    heroImage: '/textures/planets/saturn.jpg',
    badge: 'Titan Aeroshell Crest',
    tags: ['Saturn', 'Orbiter', 'Probe', 'Ocean Worlds'],
    lockReason: 'Complete Level 4 to unlock Cassini'
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
    heroImage: '/textures/planets/milky_way.jpg',
    badge: 'Cosmic Dawn Prism',
    tags: ['Telescope', 'Infrared', 'L2', 'First Stars'],
    lockReason: 'Complete Level 5 to unlock JWST'
  }
];

export function getMissionById(id) {
  return ALL_MISSIONS.find(m => m.id === id) || ALL_MISSIONS[0];
}

