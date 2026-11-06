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
    atmosphereDesc: 'Solar corona and heliosphere composed of superheated plasma (73.4% Hydrogen, 25% Helium) reaching 1 to 3 million kelvins.',
    interestingFacts: [
      'Contains 99.86% of all mass in the entire Solar System (approx. 333,000 Earths).',
      'Fuses ~600 million tons of hydrogen into helium every second in its core via nuclear fusion.',
      'Photons generated in the core take over 100,000 years to reach the surface through radiative diffusion.'
    ],
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
    atmosphereDesc: 'Virtually airless surface-bound exosphere composed of trace sodium, magnesium, helium, and potassium atoms knocked off by solar wind.',
    interestingFacts: [
      'Has the most eccentric orbit of all 8 major planets (e = 0.206).',
      'Experiences a 3:2 spin-orbit resonance: exactly 3 axial rotations for every 2 solar orbits.',
      'Water ice deposits persist permanently inside sun-shielded craters near its north and south poles.'
    ],
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
    atmosphereDesc: 'Extremely dense, crushing atmosphere (92 bar) of 96.5% Carbon Dioxide and 3.5% Nitrogen with opaque sulfuric acid clouds.',
    interestingFacts: [
      'Rotates backwards (retrograde) and slower than its year: 1 Venusian day equals 243 Earth days.',
      'Surface temperature reaches 465 °C (869 °F), hotter than Mercury despite receiving 25% as much solar flux.',
      'Atmospheric surface pressure equals the water pressure 900 meters deep in Earth oceans.'
    ],
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
    atmosphereDesc: 'Nitrogen (78.08%), Oxygen (20.95%), Argon (0.93%), and trace greenhouse gases supporting abundant surface liquid water and life.',
    interestingFacts: [
      'The only world in the known universe confirmed to support life, liquid water oceans, and active plate tectonics.',
      'Possesses a strong protective magnetosphere driven by geodynamo currents in its molten nickel-iron outer core.',
      'Atmospheric pressure at sea level is 101.3 kPa (1 bar), perfectly tuned for the liquid phase of H₂O.'
    ],
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
        atmosphereDesc: 'Extremely tenuous surface boundary exosphere (total mass ~10,000 kg) composed of Helium, Neon, Hydrogen, and Argon.',
        interestingFacts: [
          'Tidally locked with Earth, meaning the exact same face always points toward our planet.',
          'Gravitational tidal pull stabilizes Earth\'s 23.4° axial obliquity, fostering stable long-term climate cycles.',
          'The only extraterrestrial world visited by humans in person (Apollo 11–17 between 1969 and 1972).'
        ],
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
    atmosphereDesc: 'Thin atmosphere (6.1 mbar) of 95.3% Carbon Dioxide, 2.6% Nitrogen, 1.9% Argon, with seasonal dust storms engulfing the globe.',
    interestingFacts: [
      'Houses Olympus Mons, the largest volcano in the Solar System (21.9 km high, 2.5× Mount Everest).',
      'Features Valles Marineris, an immense rift canyon spanning over 4,000 km long and up to 7 km deep.',
      'Extensive evidence from rovers confirms liquid water flowed across the surface 3.5 billion years ago.'
    ],
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
        atmosphereDesc: 'None detected (airless captured carbonaceous asteroid).',
        interestingFacts: [
          'Orbits closer to its parent planet than any other moon in the solar system (6,000 km above Mars).',
          'Orbits Mars three times every Martian sol, rising in the west and setting in the east.',
          'Tidal forces are pulling Phobos inward by ~2 meters per century; it will impact Mars or break into a ring in 30–50 million years.'
        ],
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
        atmosphereDesc: 'None detected (airless captured chondritic asteroid).',
        interestingFacts: [
          'Smooth appearance caused by a 100-meter-thick blanket of pulverized regolith filling in craters.',
          'Escape velocity is only 5.6 m/s (20 km/h) — an athletic human could jump off into orbit.'
        ],
        overview: 'The outer, smaller Martian moon with a heavily blanketed cratered surface.',
        realStats: { diameter: '12.4 km', orbitalPeriod: '30.35 hours' }
      }
    ],
    placeholderMissions: ['viking-1-lander', 'curiosity-rover', 'perseverance-rover', 'mars-reconnaissance-orbiter']
  },
  {
    id: 'ceres',
    name: 'Ceres',
    type: 'dwarf-planet',
    radius: 0.62,
    distance: 48.0,
    orbitalPeriod: 1682, // ~4.6 Earth years
    rotationPeriod: 9.07,
    axialTilt: 4.0,
    color: '#9ca3af',
    surfacePalette: ['#6b7280', '#9ca3af', '#4b5563', '#d1d5db'],
    atmosphere: false,
    atmosphereDesc: 'Transient, tenuous water vapor exosphere produced by surface ice sublimation under periodic solar flares.',
    interestingFacts: [
      'Accounts for approximately 33% of the total mass in the entire asteroid belt.',
      'Houses Occator Crater, home to bright reflective deposits of sodium carbonate salt left behind by cryomagma.',
      'Possesses a differentiated interior with a rocky core and a water-ice mantle that may contain more freshwater than Earth.'
    ],
    overview: 'The largest object in the asteroid belt between Mars and Jupiter, and the only dwarf planet in the inner solar system, famously explored by NASA Dawn.',
    realStats: {
      diameter: '940 km',
      distanceFromSun: '414 million km (2.77 AU)',
      orbitalPeriod: '4.6 Earth years',
      moons: '0',
      surfaceTemp: '-105 °C to -38 °C'
    },
    placeholderMissions: ['dawn']
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
    atmosphereDesc: 'Enormous gaseous envelope composed of 89.8% Molecular Hydrogen, 10.2% Helium, and trace ammonia/methane cloud bands with winds up to 540 km/h.',
    interestingFacts: [
      'The Great Red Spot is a persistent high-pressure anticyclone wider than the entire Earth, active for centuries.',
      'Possesses the strongest planetary magnetosphere, creating radiation belts thousands of times deadlier than Earth\'s Van Allen belts.',
      'Generates more internal thermal energy through Kelvin-Helmholtz gravitational compression than it receives from sunlight.'
    ],
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
        atmosphereDesc: 'Collapsing sulfur dioxide (SO₂) atmosphere replenished by active volcanic vents.',
        interestingFacts: [
          'Most volcanically active body in the Solar System with over 400 active silicate volcanoes.',
          'Extreme tidal flexing from resonance with Jupiter and Europa generates tremendous interior frictional heat.'
        ],
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
        atmosphereDesc: 'Tenuous molecular oxygen (O₂) exosphere generated by radiolytic breakdown of surface ice.',
        interestingFacts: [
          'Harbors a global saltwater ocean beneath a 15–25 km icy shell containing twice the water of all Earth\'s oceans.',
          'One of the highest-priority astrobiological targets in the solar system for searching for life.'
        ],
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
        atmosphereDesc: 'Thin atomic and molecular oxygen exosphere creating faint auroral bands.',
        interestingFacts: [
          'The largest moon in the Solar System (5,268 km diameter) — larger than planet Mercury and dwarf planet Pluto.',
          'The only moon known to possess an internally generated magnetic field from a liquid iron core.'
        ],
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
        atmosphereDesc: 'Tenuous carbon dioxide (CO₂) exosphere trapped by an ice-rock surface.',
        interestingFacts: [
          'The most heavily cratered object in the solar system with virtually no tectonic resurfacing.',
          'Orbits outside Jupiter\'s main radiation belt, making it a prospective outpost for future crewed exploration.'
        ],
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
    atmosphereDesc: 'Deep atmosphere of 96.3% Molecular Hydrogen, 3.25% Helium, trace methane, and ammonia ice clouds whipping in winds up to 1,800 km/h.',
    interestingFacts: [
      'Spectacular ring system spans 282,000 km across, yet averages only 10 to 30 meters in thickness.',
      'Lowest mean density of any planet (0.687 g/cm³) — it would literally float in a giant ocean of water.',
      'A persistent geometric hexagonal jet stream vortex spins continuously over its north pole.'
    ],
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
        atmosphereDesc: 'Dense atmosphere (1.5 bar) of 94.2% Nitrogen and 5.65% Methane creating complex organic photochemical smog.',
        interestingFacts: [
          'The only moon with a dense atmosphere and the only world other than Earth with standing surface lakes and rivers.',
          'Liquid hydrocarbon lakes (Kraken Mare, Ligeia Mare) are filled with liquid methane and ethane at -179 °C.'
        ],
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
        atmosphereDesc: 'Transient plumes of water vapor (91%), nitrogen (4%), carbon dioxide (3.2%), and organic hydrocarbons.',
        interestingFacts: [
          'Active cryovolcanic geysers erupt from south polar "tiger stripe" fractures, feeding Saturn\'s E-ring.',
          'Possesses a global subsurface ocean with hydrothermal vents, considered a prime candidate for astrobiology.'
        ],
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
    atmosphereDesc: 'Cold atmosphere of 82.5% Hydrogen, 15.2% Helium, and 2.3% Methane absorbing red light and imparting an aquamarine tint.',
    interestingFacts: [
      'Has an extreme axial tilt of 97.8°, causing it to rotate virtually on its side during its 84-year orbit.',
      'Coldest planetary atmosphere in the Solar System, with temperatures dropping to -224 °C (49 K).',
      'First planet discovered in modern history using a telescope (William Herschel, 1781).'
    ],
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
    atmosphereDesc: 'Dynamic atmosphere of 80% Hydrogen, 19% Helium, and 1.5% Methane whipped by the fastest supersonic winds in the solar system.',
    interestingFacts: [
      'Features supersonic atmospheric winds reaching over 2,100 km/h (1,300 mph), the fastest recorded anywhere in the solar system.',
      'Radiates 2.6 times more internal heat than it receives from the dim sunlight 4.5 billion km away.',
      'Discovered in 1846 purely via mathematical predictions based on gravitational perturbations in Uranus\'s orbit.'
    ],
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
        atmosphereDesc: 'Tenuous nitrogen atmosphere (14 microbars) with trace carbon monoxide and methane.',
        interestingFacts: [
          'Orbits Neptune in retrograde direction (backwards), proving it was gravitationally captured from the Kuiper Belt.',
          'Features active cryogeysers of liquid nitrogen and dust plumes erupting 8 km above its frozen surface.'
        ],
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
    atmosphereDesc: 'Tenuous nitrogen atmosphere (~1 Pa) with trace methane and carbon monoxide that freezes onto the surface as it moves away from the Sun.',
    interestingFacts: [
      'Features Sputnik Planitia, an enormous 1,000 km wide heart-shaped glacier of convective nitrogen, carbon monoxide, and methane ice.',
      'Water ice mountains (Hillary Montes, Tenzing Montes) rise 3.5 km high, bedrock-hard at -230 °C.',
      'Pluto and its largest moon Charon are mutually tidally locked, orbiting a barycenter located above Pluto\'s surface.'
    ],
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
        atmosphereDesc: 'No significant atmosphere detected (<0.1 nanobar limit).',
        interestingFacts: [
          'Diameter is more than half of Pluto\'s, making it by far the largest satellite relative to its parent planet.',
          'Features a striking dark reddish north polar cap named Mordor Macula, composed of tholins trapped from Pluto\'s atmosphere.'
        ],
        overview: 'Pluto\'s massive tidally locked companion with dark reddish tholin north polar cap (Mordor Macula).',
        realStats: { diameter: '1,212 km', orbitalPeriod: '6.39 days' }
      }
    ],
    placeholderMissions: ['new-horizons']
  },
  {
    id: 'vesta',
    name: '4 Vesta',
    type: 'asteroid',
    radius: 0.52,
    distance: 44.0,
    orbitalPeriod: 1325.75, // 3.63 Earth years
    rotationPeriod: 5.342,
    axialTilt: 29.0,
    color: '#d1d5db',
    surfacePalette: ['#9ca3af', '#6b7280', '#d1d5db', '#4b5563'],
    atmosphere: false,
    atmosphereDesc: 'Extremely tenuous transient exosphere without substantial atmospheric pressure.',
    interestingFacts: [
      'The second-most massive body in the asteroid belt after Ceres, containing roughly 9% of the belt\'s total mass.',
      'Features Rheasilvia Crater at its south pole, an impact basin 505 km wide with a central peak rising 22 km (nearly 3× Mount Everest).',
      'Explored in exquisite detail by NASA\'s Dawn spacecraft from 2011 to 2012 before Dawn departed for Ceres.'
    ],
    overview: 'The brightest asteroid visible from Earth and second largest body in the asteroid belt, with a differentiated basaltic crust and colossal south polar mountain.',
    realStats: {
      diameter: '525.4 km',
      distanceFromSun: '353.4 million km (2.36 AU)',
      orbitalPeriod: '3.63 Earth years',
      moons: '0',
      surfaceTemp: '-188 °C to -3 °C'
    },
    placeholderMissions: ['dawn']
  },
  {
    id: 'bennu',
    name: '101955 Bennu',
    type: 'asteroid',
    radius: 0.35,
    distance: 33.0,
    orbitalPeriod: 436.6, // 1.20 Earth years
    rotationPeriod: 4.296,
    axialTilt: 175.0,
    color: '#475569',
    surfacePalette: ['#1e293b', '#334155', '#475569', '#0f172a'],
    atmosphere: false,
    atmosphereDesc: 'Airless rubble-pile asteroid in near-vacuum deep space.',
    interestingFacts: [
      'A primordial "rubble pile" asteroid consisting of rock fragments and boulders held together by weak microgravity (porosity ~50%).',
      'Target of NASA\'s OSIRIS-REx mission, which successfully collected and returned 121.6 grams of pristine carbonaceous sample to Earth in 2023.',
      'Contains abundant carbon compounds, hydrated clay minerals, and amino acid precursors dating back to the birth of the Solar System.'
    ],
    overview: 'Carbonaceous near-Earth asteroid sampled by NASA OSIRIS-REx, revealing primordial organic compounds and pristine solar nebula minerals.',
    realStats: {
      diameter: '492 m (Mean)',
      distanceFromSun: '168.5 million km (1.13 AU)',
      orbitalPeriod: '1.20 Earth years',
      moons: '0',
      surfaceTemp: '-73 °C to 7 °C'
    },
    placeholderMissions: ['osiris-rex']
  },
  {
    id: 'ryugu',
    name: '162173 Ryugu',
    type: 'asteroid',
    radius: 0.38,
    distance: 35.0,
    orbitalPeriod: 473.9, // 1.30 Earth years
    rotationPeriod: 7.63,
    axialTilt: 171.6,
    color: '#334155',
    surfacePalette: ['#0f172a', '#1e293b', '#334155', '#475569'],
    atmosphere: false,
    atmosphereDesc: 'Airless diamond-shaped spinning top asteroid.',
    interestingFacts: [
      'Characterized by a distinctive spinning-top oblate spheroidal shape formed by rapid rotational mass shedding.',
      'Target of JAXA\'s Hayabusa2 mission, which deployed multiple rovers and returned 5.4 grams of pristine sample to Earth in 2020.',
      'Samples revealed uracil (an RNA nucleobase) and vitamin B3, proving prebiotic building blocks formed in early asteroids.'
    ],
    overview: 'Near-Earth diamond-shaped C-type asteroid explored by JAXA Hayabusa2, holding ancient water-rich clay and RNA building blocks.',
    realStats: {
      diameter: '896 m',
      distanceFromSun: '178.0 million km (1.19 AU)',
      orbitalPeriod: '1.30 Earth years',
      moons: '0',
      surfaceTemp: '-90 °C to 20 °C'
    },
    placeholderMissions: ['hayabusa2']
  },
  {
    id: 'eros',
    name: '433 Eros',
    type: 'asteroid',
    radius: 0.40,
    distance: 38.0,
    orbitalPeriod: 643.0, // 1.76 Earth years
    rotationPeriod: 5.27,
    axialTilt: 89.0,
    color: '#a1a1aa',
    surfacePalette: ['#71717a', '#a1a1aa', '#52525b', '#3f3f46'],
    atmosphere: false,
    atmosphereDesc: 'Airless elongated S-type stony asteroid.',
    interestingFacts: [
      'Elongated peanut-shaped stony asteroid measuring 34.4 × 11.2 × 11.2 km, the second-largest near-Earth object.',
      'First asteroid orbited and landed on by a robotic spacecraft (NASA\'s NEAR Shoemaker in February 2001).',
      'Contains approximately 20 billion metric tons of aluminum and similar amounts of precious metals like platinum and gold.'
    ],
    overview: 'Iconic elongated stony near-Earth asteroid historically orbited and touched down on by NASA NEAR Shoemaker.',
    realStats: {
      diameter: '16.8 km (Equivalent)',
      distanceFromSun: '218.1 million km (1.46 AU)',
      orbitalPeriod: '1.76 Earth years',
      moons: '0',
      surfaceTemp: '-150 °C to 100 °C'
    },
    placeholderMissions: ['near-shoemaker']
  },
  {
    id: 'halley',
    name: '1P/Halley',
    type: 'comet',
    radius: 0.42,
    distance: 85.0,
    orbitalPeriod: 27500, // 75.3 Earth years
    rotationPeriod: 52.8,
    axialTilt: 18.0,
    color: '#06b6d4',
    surfacePalette: ['#083344', '#155e75', '#0e7490', '#06b6d4'],
    atmosphere: {
      color: '#06b6d4',
      opacity: 0.35,
      glowColor: '#22d3ee'
    },
    atmosphereDesc: 'Dynamic expanding coma of sublimated water vapor (80%), carbon monoxide, and dust when near the Sun.',
    interestingFacts: [
      'The most famous periodic comet in human history, recorded by astronomers across cultures since at least 240 BC.',
      'Orbits the Sun in a steep retrograde inclination of 162.3°, moving backwards relative to planetary orbits.',
      'Source of two annual meteor showers on Earth: the Eta Aquariids (May) and the Orionids (October).'
    ],
    overview: 'The most legendary periodic comet. Travels on a highly eccentric retrograde orbit from inside Venus out beyond Neptune once every 75–76 years.',
    realStats: {
      diameter: '11 km (15 × 8 km Nucleus)',
      distanceFromSun: '0.59 AU (Perihelion) to 35.1 AU (Aphelion)',
      orbitalPeriod: '75.3 Earth years',
      moons: '0',
      surfaceTemp: '-200 °C (Aphelion) to 47 °C (Perihelion)'
    },
    placeholderMissions: ['giotto']
  },
  {
    id: 'churyumov-gerasimenko',
    name: '67P/Churyumov-Gerasimenko',
    type: 'comet',
    radius: 0.38,
    distance: 52.0,
    orbitalPeriod: 2352, // 6.44 Earth years
    rotationPeriod: 12.4,
    axialTilt: 52.0,
    color: '#10b981',
    surfacePalette: ['#064e3b', '#065f46', '#047857', '#10b981'],
    atmosphere: {
      color: '#10b981',
      opacity: 0.3,
      glowColor: '#34d399'
    },
    atmosphereDesc: 'Active cryocoma venting water vapor, carbon monoxide, organic dust, and molecular oxygen.',
    interestingFacts: [
      'Famous contact-binary "rubber duck" comet composed of two lobes formed from the gentle collision of two protoplanetary bodies.',
      'Explored by the ESA Rosetta spacecraft for two years, and site of humanity\'s first soft landing on a comet by the Philae lander in 2014.',
      'Rosetta detected glycine (the simplest amino acid) and phosphorus, vital ingredients in cellular biochemistry.'
    ],
    overview: 'Jupiter-family contact binary comet famously orbited by ESA Rosetta and landed on by Philae, revealing comet outgassing and organic building blocks.',
    realStats: {
      diameter: '4.1 × 3.3 × 1.8 km',
      distanceFromSun: '1.24 AU (Perihelion) to 5.68 AU (Aphelion)',
      orbitalPeriod: '6.44 Earth years',
      moons: '0',
      surfaceTemp: '-70 °C to -40 °C'
    },
    placeholderMissions: ['rosetta']
  },
  {
    id: 'oumuamua',
    name: "1I/'Oumuamua",
    type: 'comet',
    radius: 0.36,
    distance: 95.0,
    orbitalPeriod: 0,
    rotationPeriod: 8.1,
    axialTilt: 122.7,
    color: '#ec4899',
    surfacePalette: ['#831843', '#9d174d', '#be185d', '#f43f5e'],
    atmosphere: false,
    atmosphereDesc: 'No detectable dust coma; non-gravitational acceleration likely caused by outgassing of volatile hydrogen or nitrogen ice.',
    interestingFacts: [
      'The first confirmed interstellar object ever detected passing through our Solar System, discovered by Pan-STARRS1 in October 2017.',
      'Traveled on an extreme hyperbolic trajectory with an eccentricity of 1.20 and hyperbolic excess speed of 26.33 km/s.',
      'Highly elongated shape (aspect ratio ~6:1) with dark reddish organic surface tholins irradiated by galactic cosmic rays for billions of years.'
    ],
    overview: 'The first interstellar interloper detected racing through the inner solar system from deep galactic space on an unbound hyperbolic escape trajectory.',
    realStats: {
      diameter: '100 – 400 m (Elongated)',
      distanceFromSun: 'Passing >40 AU (Exiting Solar System)',
      orbitalPeriod: 'Hyperbolic (Unbound Interstellar)',
      moons: '0',
      surfaceTemp: '-220 °C'
    },
    placeholderMissions: []
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
