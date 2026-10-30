/**
 * Celestial Data for Novaquest 3D Solar System
 * 
 * SCIENTIFIC ARCHITECTURE:
 * - Authoritative physical parameters: diameters, rotation periods, axial tilts, atmosphere properties.
 * - Planetary moons with orbital periods and visual characteristics.
 * - Calibrated visual distances calibrated with NASA JPL Keplerian elements in ephemeris.js.
 */

export const SOLAR_SYSTEM_DISCLAIMER = 
  "Scientifically calibrated multi-scale solar system with NASA JPL Keplerian ephemerides (1800–2050 AD). Planetary scales and orbital paths are visually balanced for exploratory clarity.";

export const CELESTIAL_BODIES = [
  {
    id: 'sun',
    name: 'The Sun',
    type: 'star',
    radius: 7.5,
    distance: 0,
    orbitalPeriod: 0,
    rotationPeriod: 609.12, // ~25.38 Earth days
    axialTilt: 7.25,
    color: '#ffaa00',
    emissive: true,
    overview: 'The yellow dwarf star at the center of our solar system, containing 99.86% of the system\'s total mass.',
    realStats: {
      type: 'G-type Main-Sequence Star (Yellow Dwarf)',
      diameter: '1,392,700 km (109 × Earth)',
      surfaceTemp: '5,500 °C (5,778 K)',
      coreTemp: '~15,000,000 °C',
      mass: '333,000 × Earth',
      composition: '73.4% Hydrogen, 25% Helium'
    },
    placeholderMissions: ['parker-solar-probe', 'soho', 'solar-orbiter']
  },
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'planet',
    radius: 1.15,
    distance: 14.0,
    orbitalPeriod: 87.97, // Earth days
    rotationPeriod: 1407.6, // 58.6 Earth days
    axialTilt: 0.034,
    color: '#a8a8a8',
    surfacePalette: ['#8c8c8c', '#a6a6a6', '#696969', '#bfbfbf', '#525252'],
    atmosphere: false,
    overview: 'The smallest planet and closest to the Sun. A cratered, airless terrestrial world enduring extreme temperature swings from -180 °C to 430 °C.',
    realStats: {
      diameter: '4,879 km',
      distanceFromSun: '57.9 million km (0.39 AU)',
      orbitalPeriod: '87.97 Earth days',
      moons: '0',
      surfaceTemp: '-180 °C to 430 °C'
    },
    placeholderMissions: ['mariner-10', 'messenger-mercury-orbiter', 'bepicolombo']
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'planet',
    radius: 1.85,
    distance: 21.0,
    orbitalPeriod: 224.7,
    rotationPeriod: -5832.5, // Retrograde rotation
    axialTilt: 177.3,
    color: '#e3bb76',
    surfacePalette: ['#d9a566', '#c98942', '#edd09b', '#b3773b', '#fae0b2'],
    atmosphere: {
      color: '#e8c98e',
      opacity: 0.42,
      glowColor: '#ffd79e'
    },
    overview: 'Earth\'s "evil twin", cloaked in impenetrable toxic carbon dioxide clouds and crushing sulfuric acid rain with a runaway greenhouse surface temperature of 465 °C.',
    realStats: {
      diameter: '12,104 km',
      distanceFromSun: '108.2 million km (0.72 AU)',
      orbitalPeriod: '224.7 Earth days',
      moons: '0',
      surfaceTemp: '465 °C (Hottest planet)'
    },
    placeholderMissions: ['venera-9', 'magellan', 'venus-express']
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'planet',
    radius: 2.0,
    distance: 30.0,
    orbitalPeriod: 365.256,
    rotationPeriod: 23.934,
    axialTilt: 23.44,
    color: '#2b82c9',
    surfacePalette: ['#1e40af', '#1d4ed8', '#15803d', '#166534', '#ca8a04', '#e2e8f0'],
    atmosphere: {
      color: '#60a5fa',
      opacity: 0.45,
      glowColor: '#38bdf8'
    },
    overview: 'Our oasis world in the cosmos. The only known planetary haven harboring liquid water oceans, an oxygen-rich atmosphere, and vibrant life.',
    realStats: {
      diameter: '12,742 km',
      distanceFromSun: '149.6 million km (1.0 AU)',
      orbitalPeriod: '365.25 Earth days',
      moons: '1 (The Moon)',
      surfaceTemp: '-88 °C to 58 °C (Avg: 15 °C)'
    },
    hasMoon: true,
    moon: {
      id: 'moon',
      name: 'The Moon',
      radius: 0.55,
      distance: 4.2
    },
    moons: [
      {
        id: 'moon',
        name: 'The Moon',
        radius: 0.55,
        distance: 4.2,
        orbitalPeriod: 27.32,
        color: '#cbd5e1',
        overview: 'Earth\'s only permanent natural satellite. Tidally locked with cratered highlands and ancient basaltic maria.',
        realStats: {
          diameter: '3,474 km',
          orbitalPeriod: '27.3 days',
          distance: '384,400 km from Earth'
        }
      }
    ],
    placeholderMissions: ['apollo-11-lm-descent-stage', 'international-space-station', 'hubble-space-telescope', 'lunar-reconnaissance-orbiter']
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    radius: 1.45,
    distance: 40.0,
    orbitalPeriod: 686.98,
    rotationPeriod: 24.62,
    axialTilt: 25.19,
    color: '#c85a32',
    surfacePalette: ['#993d1b', '#c25227', '#e06f38', '#7a2910', '#f4a261'],
    atmosphere: {
      color: '#f97316',
      opacity: 0.24,
      glowColor: '#fb923c'
    },
    overview: 'The Red Planet. A dusty, cold desert world with a tenuous atmosphere, extinct giant volcanoes like Olympus Mons, and ancient dried river systems.',
    realStats: {
      diameter: '6,779 km',
      distanceFromSun: '227.9 million km (1.52 AU)',
      orbitalPeriod: '687 Earth days',
      moons: '2 (Phobos, Deimos)',
      surfaceTemp: '-140 °C to 20 °C (Avg: -63 °C)'
    },
    moons: [
      {
        id: 'phobos',
        name: 'Phobos',
        radius: 0.22,
        distance: 2.5,
        orbitalPeriod: 0.319, // ~7.6 hours
        color: '#a8a29e',
        overview: 'The larger and closer of Mars\' two irregular captured asteroid moons.',
        realStats: { diameter: '22.2 km', orbitalPeriod: '7.66 hours' }
      },
      {
        id: 'deimos',
        name: 'Deimos',
        radius: 0.16,
        distance: 3.5,
        orbitalPeriod: 1.263, // ~30.3 hours
        color: '#78716c',
        overview: 'The outer, smaller Martian moon with a heavily blanketed cratered surface.',
        realStats: { diameter: '12.4 km', orbitalPeriod: '30.35 hours' }
      }
    ],
    placeholderMissions: ['viking-1-lander', 'curiosity-rover', 'perseverance-rover', 'mars-reconnaissance-orbiter']
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    radius: 4.8,
    distance: 56.0,
    orbitalPeriod: 4332.59, // ~11.86 Earth years
    rotationPeriod: 9.93,
    axialTilt: 3.13,
    color: '#d4a373',
    surfacePalette: ['#c48b59', '#dfb88e', '#9c6644', '#7f4f24', '#fefae0', '#bc6c25'],
    atmosphere: {
      color: '#e6ccb2',
      opacity: 0.28,
      glowColor: '#ddb892'
    },
    overview: 'The king of planets. A colossal gas giant with swirling atmospheric cloud belts, intense radiation zones, and the centuries-old Great Red Spot anticyclonic storm.',
    realStats: {
      diameter: '139,820 km (11 × Earth)',
      distanceFromSun: '778.5 million km (5.20 AU)',
      orbitalPeriod: '11.86 Earth years',
      moons: '95 recognized (Galilean: Io, Europa, Ganymede, Callisto)',
      surfaceTemp: '-110 °C at cloud tops'
    },
    moons: [
      {
        id: 'io',
        name: 'Io',
        radius: 0.42,
        distance: 6.5,
        orbitalPeriod: 1.769,
        color: '#facc15',
        overview: 'The most volcanically active body in the Solar System, driven by tidal flexing from Jupiter.',
        realStats: { diameter: '3,643 km', orbitalPeriod: '1.77 days' }
      },
      {
        id: 'europa',
        name: 'Europa',
        radius: 0.38,
        distance: 7.9,
        orbitalPeriod: 3.551,
        color: '#e0e7ff',
        overview: 'Smooth icy crust concealing a vast subsurface liquid water ocean containing more water than Earth.',
        realStats: { diameter: '3,122 km', orbitalPeriod: '3.55 days' }
      },
      {
        id: 'ganymede',
        name: 'Ganymede',
        radius: 0.58,
        distance: 9.6,
        orbitalPeriod: 7.155,
        color: '#94a3b8',
        overview: 'Largest moon in the Solar System (larger than Mercury), with its own intrinsic magnetic field.',
        realStats: { diameter: '5,268 km', orbitalPeriod: '7.15 days' }
      },
      {
        id: 'callisto',
        name: 'Callisto',
        radius: 0.54,
        distance: 11.5,
        orbitalPeriod: 16.689,
        color: '#64748b',
        overview: 'Ancient, heavily cratered icy moon with the lowest degree of geologic differentiation.',
        realStats: { diameter: '4,821 km', orbitalPeriod: '16.69 days' }
      }
    ],
    placeholderMissions: ['galileo-orbiter', 'juno-spacecraft', 'voyager-1', 'europa-clipper']
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    radius: 3.9,
    distance: 72.0,
    orbitalPeriod: 10759.22, // ~29.45 Earth years
    rotationPeriod: 10.66,
    axialTilt: 26.73,
    color: '#e2c992',
    surfacePalette: ['#d4b97a', '#edd8a4', '#bfa25f', '#a68744', '#f7ecc9'],
    hasRings: {
      innerRadius: 5.0,
      outerRadius: 9.8,
      tilt: 26.73,
      palette: ['rgba(212, 185, 122, 0.8)', 'rgba(166, 135, 68, 0.6)', 'rgba(237, 216, 164, 0.75)', 'rgba(92, 73, 33, 0.4)']
    },
    atmosphere: {
      color: '#f5deb3',
      opacity: 0.22,
      glowColor: '#ffe4b5'
    },
    overview: 'The crown jewel of the solar system, surrounded by a breathtaking system of concentric rings made of billions of chunks of water ice and pulverized comet debris.',
    realStats: {
      diameter: '116,460 km (9.5 × Earth)',
      distanceFromSun: '1.43 billion km (9.58 AU)',
      orbitalPeriod: '29.45 Earth years',
      moons: '146 recognized (Titan, Enceladus)',
      surfaceTemp: '-140 °C at cloud tops'
    },
    moons: [
      {
        id: 'titan',
        name: 'Titan',
        radius: 0.56,
        distance: 12.0,
        orbitalPeriod: 15.945,
        color: '#f59e0b',
        overview: 'Saturn\'s largest moon with a dense nitrogen-methane atmosphere, liquid hydrocarbon lakes, and seasonal rainfall.',
        realStats: { diameter: '5,149 km', orbitalPeriod: '15.95 days' }
      },
      {
        id: 'enceladus',
        name: 'Enceladus',
        radius: 0.24,
        distance: 7.2,
        orbitalPeriod: 1.37,
        color: '#f8fafc',
        overview: 'Bright icy moon venting cryovolcanic geysers of water vapor, salts, and organic molecules from its south polar ocean.',
        realStats: { diameter: '504 km', orbitalPeriod: '1.37 days' }
      }
    ],
    placeholderMissions: ['cassini-saturn-orbiter', 'huygens-titan-probe', 'voyager-2']
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'planet',
    radius: 2.8,
    distance: 88.0,
    orbitalPeriod: 30685.4, // ~84.0 Earth years
    rotationPeriod: -17.24, // Retrograde
    axialTilt: 97.77, // Rotates on its side!
    color: '#70d6d9',
    surfacePalette: ['#58b4b7', '#7ee2e5', '#489fa2', '#97edef'],
    hasRings: {
      innerRadius: 3.4,
      outerRadius: 4.6,
      tilt: 97.77,
      faint: true
    },
    atmosphere: {
      color: '#a5f3fc',
      opacity: 0.32,
      glowColor: '#67e8f9'
    },
    overview: 'An ice giant with a pale cyan methane atmosphere that rotates on its side like a rolling bowling ball, likely tipped by a cataclysmic protoplanetary impact.',
    realStats: {
      diameter: '50,724 km (4 × Earth)',
      distanceFromSun: '2.87 billion km (19.2 AU)',
      orbitalPeriod: '84.0 Earth years',
      moons: '28 recognized',
      surfaceTemp: '-195 °C (Lowest recorded: -224 °C)'
    },
    placeholderMissions: ['voyager-2']
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'planet',
    radius: 2.7,
    distance: 104.0,
    orbitalPeriod: 60189.0, // ~164.8 Earth years
    rotationPeriod: 16.11,
    axialTilt: 28.32,
    color: '#3462d1',
    surfacePalette: ['#1e40af', '#2563eb', '#3b82f6', '#1d4ed8', '#60a5fa'],
    atmosphere: {
      color: '#60a5fa',
      opacity: 0.36,
      glowColor: '#3b82f6'
    },
    overview: 'The most distant major planet. An azure ice giant whipped by supersonic winds exceeding 2,100 km/h and high-altitude methane cirrus clouds.',
    realStats: {
      diameter: '49,244 km (3.9 × Earth)',
      distanceFromSun: '4.50 billion km (30.1 AU)',
      orbitalPeriod: '164.8 Earth years',
      moons: '16 recognized (Triton)',
      surfaceTemp: '-200 °C at cloud tops'
    },
    moons: [
      {
        id: 'triton',
        name: 'Triton',
        radius: 0.44,
        distance: 6.8,
        orbitalPeriod: -5.877, // Retrograde orbit
        color: '#bae6fd',
        overview: 'Captured Kuiper Belt dwarf planet orbiting Neptune backwards, with active nitrogen geysers and cantaloupe terrain.',
        realStats: { diameter: '2,707 km', orbitalPeriod: '5.88 days (Retrograde)' }
      }
    ],
    placeholderMissions: ['voyager-2']
  },
  {
    id: 'pluto',
    name: 'Pluto',
    type: 'dwarf-planet',
    radius: 0.85,
    distance: 120.0,
    orbitalPeriod: 90560, // ~248 Earth years
    rotationPeriod: -153.3, // 6.39 Earth days retrograde
    axialTilt: 122.5,
    color: '#d97706',
    surfacePalette: ['#78350f', '#92400e', '#fef3c7', '#451a03'],
    atmosphere: {
      color: '#93c5fd',
      opacity: 0.15,
      glowColor: '#60a5fa'
    },
    overview: 'Dwarf planet in the Kuiper Belt possessing a nitrogen atmosphere, towering water-ice mountains, and the famous vast heart-shaped nitrogen glacier Sputnik Planitia.',
    realStats: {
      diameter: '2,376 km (0.18 × Earth)',
      distanceFromSun: '5.9 billion km (39.5 AU)',
      orbitalPeriod: '248 Earth years',
      moons: '5 (Charon, Styx, Nix, Kerberos, Hydra)',
      surfaceTemp: '-230 °C'
    },
    moons: [
      {
        id: 'charon',
        name: 'Charon',
        radius: 0.42,
        distance: 3.2,
        orbitalPeriod: 6.387,
        color: '#94a3b8',
        overview: 'Pluto\'s massive tidally locked companion with dark reddish tholin north polar cap (Mordor Macula).',
        realStats: { diameter: '1,212 km', orbitalPeriod: '6.39 days' }
      }
    ],
    placeholderMissions: ['new-horizons']
  }
];

export function getCelestialBody(id) {
  if (!id) return null;
  const lower = id.toLowerCase();
  const body = CELESTIAL_BODIES.find(b => b.id.toLowerCase() === lower);
  if (body) return body;
  // Search in moons
  for (const b of CELESTIAL_BODIES) {
    if (b.moons) {
      const moon = b.moons.find(m => m.id.toLowerCase() === lower);
      if (moon) {
        return {
          ...moon,
          parentPlanetId: b.id,
          parentPlanetName: b.name,
          isMoon: true
        };
      }
    }
  }
  return null;
}
