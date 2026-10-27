/**
 * Celestial Data for Novaquest 3D Solar System
 * 
 * SCIENTIFIC CLARIFICATION & DISCLAIMER:
 * This model is an illustrative, educational visualization designed to balance
 * comparative astronomical proportions with interactive visual clarity.
 * In the real universe, planetary radii are negligible compared to interplanetary
 * distances (if the Sun were a 1-meter ball, Neptune would be 3.2 kilometers away).
 * The semi-major axes and radii below use a calibrated logarithmic/hybrid visual
 * scale so all celestial bodies can be clearly viewed, compared, and navigated.
 * Orbital motion illustrates Keplerian relationships (inner planets complete orbits
 * faster than outer planets), but DOES NOT represent exact real-time planetary ephemerides.
 */

export const SOLAR_SYSTEM_DISCLAIMER = 
  "Illustrative educational model. Planetary scales, relative distances, and orbital speeds are stylized for visual clarity and interactive navigation, not real-time astronomical ephemerides.";

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
    radius: 1.1,
    distance: 14.0,
    orbitalPeriod: 88, // Earth days
    rotationPeriod: 1407.6, // 58.6 Earth days
    axialTilt: 0.034,
    color: '#a8a8a8',
    surfacePalette: ['#8c8c8c', '#a6a6a6', '#696969', '#bfbfbf', '#525252'],
    atmosphere: false,
    overview: 'The smallest planet and closest to the Sun. A cratered, airless terrestrial world enduring extreme temperature swings.',
    realStats: {
      diameter: '4,879 km',
      distanceFromSun: '57.9 million km (0.39 AU)',
      orbitalPeriod: '88 Earth days',
      moons: '0',
      surfaceTemp: '-180 °C to 430 °C'
    },
    placeholderMissions: ['mariner-10', 'messenger', 'bepicolombo']
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'planet',
    radius: 1.8,
    distance: 21.0,
    orbitalPeriod: 224.7,
    rotationPeriod: -5832.5, // Retrograde rotation
    axialTilt: 177.3,
    color: '#e3bb76',
    surfacePalette: ['#d9a566', '#c98942', '#edd09b', '#b3773b', '#fae0b2'],
    atmosphere: {
      color: '#e8c98e',
      opacity: 0.35,
      glowColor: '#ffd79e'
    },
    overview: 'Earth\'s "evil twin", cloaked in toxic carbon dioxide clouds and crushing sulfuric acid rain with a runaway greenhouse effect.',
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
    orbitalPeriod: 365.25,
    rotationPeriod: 24.0,
    axialTilt: 23.44,
    color: '#2b82c9',
    surfacePalette: ['#1e40af', '#1d4ed8', '#15803d', '#166534', '#ca8a04', '#e2e8f0'],
    atmosphere: {
      color: '#60a5fa',
      opacity: 0.4,
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
      distance: 3.8, // Local distance from Earth
      orbitalPeriod: 27.3,
      color: '#cbd5e1'
    },
    placeholderMissions: ['apollo-11', 'iss', 'hubble-space-telescope', 'lro']
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    radius: 1.4,
    distance: 40.0,
    orbitalPeriod: 687,
    rotationPeriod: 24.6,
    axialTilt: 25.19,
    color: '#c85a32',
    surfacePalette: ['#993d1b', '#c25227', '#e06f38', '#7a2910', '#f4a261'],
    atmosphere: {
      color: '#f97316',
      opacity: 0.22,
      glowColor: '#fb923c'
    },
    overview: 'The Red Planet. A dusty, cold desert world with a tenuous atmosphere, extinct giant volcanoes, and riverbeds carved by ancient flowing water.',
    realStats: {
      diameter: '6,779 km',
      distanceFromSun: '227.9 million km (1.52 AU)',
      orbitalPeriod: '687 Earth days',
      moons: '2 (Phobos, Deimos)',
      surfaceTemp: '-140 °C to 20 °C (Avg: -63 °C)'
    },
    placeholderMissions: ['viking-1', 'mars-pathfinder', 'spirit', 'opportunity', 'perseverance', 'curiosity']
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    radius: 4.6,
    distance: 56.0,
    orbitalPeriod: 4332.6, // ~11.86 Earth years
    rotationPeriod: 9.9,
    axialTilt: 3.13,
    color: '#d4a373',
    surfacePalette: ['#c48b59', '#dfb88e', '#9c6644', '#7f4f24', '#fefae0', '#bc6c25'],
    atmosphere: {
      color: '#e6ccb2',
      opacity: 0.25,
      glowColor: '#ddb892'
    },
    overview: 'The king of planets. A colossal gas giant with swirling atmospheric bands, immense magnetic storms, and the centuries-old Great Red Spot.',
    realStats: {
      diameter: '139,820 km (11 × Earth)',
      distanceFromSun: '778.5 million km (5.20 AU)',
      orbitalPeriod: '11.86 Earth years',
      moons: '95 recognized (Io, Europa, Ganymede, Callisto)',
      surfaceTemp: '-110 °C at cloud tops'
    },
    placeholderMissions: ['voyager-1', 'galileo', 'juno', 'juice', 'europa-clipper']
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    radius: 3.8,
    distance: 72.0,
    orbitalPeriod: 10759, // ~29.45 Earth years
    rotationPeriod: 10.7,
    axialTilt: 26.73,
    color: '#e2c992',
    surfacePalette: ['#d4b97a', '#edd8a4', '#bfa25f', '#a68744', '#f7ecc9'],
    hasRings: {
      innerRadius: 4.8,
      outerRadius: 9.2,
      tilt: 26.73,
      palette: ['rgba(212, 185, 122, 0.8)', 'rgba(166, 135, 68, 0.6)', 'rgba(237, 216, 164, 0.75)', 'rgba(92, 73, 33, 0.4)']
    },
    atmosphere: {
      color: '#f5deb3',
      opacity: 0.2,
      glowColor: '#ffe4b5'
    },
    overview: 'The crown jewel of the solar system, surrounded by a breathtaking system of concentric rings made of billions of chunks of ice and rock.',
    realStats: {
      diameter: '116,460 km (9.5 × Earth)',
      distanceFromSun: '1.43 billion km (9.58 AU)',
      orbitalPeriod: '29.45 Earth years',
      moons: '146 recognized (Titan, Enceladus)',
      surfaceTemp: '-140 °C at cloud tops'
    },
    placeholderMissions: ['pioneer-11', 'voyager-2', 'cassini-huygens']
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'planet',
    radius: 2.8,
    distance: 88.0,
    orbitalPeriod: 30685, // ~84 Earth years
    rotationPeriod: -17.2, // Retrograde
    axialTilt: 97.77, // Rotates on its side!
    color: '#70d6d9',
    surfacePalette: ['#58b4b7', '#7ee2e5', '#489fa2', '#97edef'],
    atmosphere: {
      color: '#a5f3fc',
      opacity: 0.3,
      glowColor: '#67e8f9'
    },
    overview: 'An ice giant with a pale cyan methane atmosphere that rotates on its side like a rolling bowling ball, likely caused by an ancient collision.',
    realStats: {
      diameter: '50,724 km (4 × Earth)',
      distanceFromSun: '2.87 billion km (19.2 AU)',
      orbitalPeriod: '84 Earth years',
      moons: '28 recognized',
      surfaceTemp: '-195 °C (Coldest atmosphere: -224 °C)'
    },
    placeholderMissions: ['voyager-2']
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'planet',
    radius: 2.7,
    distance: 104.0,
    orbitalPeriod: 60190, // ~164.8 Earth years
    rotationPeriod: 16.1,
    axialTilt: 28.32,
    color: '#3462d1',
    surfacePalette: ['#1e40af', '#2563eb', '#3b82f6', '#1d4ed8', '#60a5fa'],
    atmosphere: {
      color: '#60a5fa',
      opacity: 0.35,
      glowColor: '#3b82f6'
    },
    overview: 'The most distant major planet in our solar system. An azure ice giant whipped by supersonic winds reaching over 2,000 km/h.',
    realStats: {
      diameter: '49,244 km (3.9 × Earth)',
      distanceFromSun: '4.50 billion km (30.1 AU)',
      orbitalPeriod: '164.8 Earth years',
      moons: '16 recognized (Triton)',
      surfaceTemp: '-200 °C at cloud tops'
    },
    placeholderMissions: ['voyager-2']
  }
];

export function getCelestialBody(id) {
  return CELESTIAL_BODIES.find(b => b.id.toLowerCase() === id.toLowerCase());
}
