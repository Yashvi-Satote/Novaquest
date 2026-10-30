/**
 * Astronomical and Telemetry Data for Interstellar & Deep Space Probes
 * 
 * SCIENTIFIC CLARIFICATION & DISCLAIMER:
 * Probe exit trajectories, distance regimes (in Astronomical Units and kilometers),
 * and constellation bearings are based on verified NASA JPL Horizons ephemerides
 * and Voyager Interstellar Mission records.
 * Visual paths represent illustrative asymptotic hyperbolic escape trajectories.
 * 
 * SCIENTIFIC ACCURACY NOTE:
 * Voyager 1 crossed the Heliopause (~121 AU) into the local interstellar medium (ISM)
 * in August 2012, but has NOT left the Solar System's Oort Cloud (which extends
 * to ~100,000 AU) and has NOT left the Milky Way galaxy.
 */

export const HELIOSPHERE_BOUNDARIES = {
  terminationShockAU: 94.0, // Distance where solar wind drops below speed of sound
  heliopauseAU: 121.6,       // Boundary where interstellar magnetic field balances solar wind
  oortCloudInnerAU: 2000.0,  // Inner boundary of the gravitational Oort Cloud
  galacticPlaneTiltDeg: 60.2 // Tilt of solar ecliptic relative to Milky Way galactic plane
};

// Visual scale mapping (1 AU = 3.2 scene units in the outer regime)
export const AU_TO_SCENE_SCALE = 3.2;

export const INTERSTELLAR_PROBES = [
  {
    id: 'voyager-1',
    name: 'Voyager 1',
    missionName: 'Voyager',
    slug: 'voyager-1',
    status: 'Active (Interstellar Mission)',
    distanceAU: 163.7, // Current verified regime (~24.5 billion km)
    distanceKm: '24.5 billion km',
    launchDate: '1977-09-05',
    eclipticLatitudeDeg: 35.5, // Heading north of the ecliptic plane
    eclipticLongitudeDeg: 255.0,
    constellation: 'Ophiuchus',
    heliopauseCrossingDate: '2012-08-25',
    speedKmS: 16.9, // ~3.6 AU/year
    color: '#38bdf8',
    description: 'Humanity\'s farthest spacecraft. Launched in 1977, Voyager 1 became the first human-made object to cross the Heliopause and enter the local interstellar medium (ISM).',
    isInterstellar: true,
    verifiedSource: 'NASA JPL Voyager Interstellar Mission & Horizons Ephemerides'
  },
  {
    id: 'voyager-2',
    name: 'Voyager 2',
    missionName: 'Voyager',
    slug: 'voyager-2',
    status: 'Active (Interstellar Mission)',
    distanceAU: 136.8, // Current verified regime (~20.4 billion km)
    distanceKm: '20.4 billion km',
    launchDate: '1977-08-20',
    eclipticLatitudeDeg: -47.5, // Heading south of the ecliptic plane
    eclipticLongitudeDeg: 289.0,
    constellation: 'Pavo',
    heliopauseCrossingDate: '2018-11-05',
    speedKmS: 15.3, // ~3.2 AU/year
    color: '#06b6d4',
    description: 'The only spacecraft to conduct a Grand Tour visiting all four gas and ice giants: Jupiter, Saturn, Uranus, and Neptune, before entering interstellar space in 2018.',
    isInterstellar: true,
    verifiedSource: 'NASA JPL Voyager Interstellar Mission'
  },
  {
    id: 'pioneer-10',
    name: 'Pioneer 10',
    missionName: 'Pioneer 10',
    slug: 'pioneer-10',
    status: 'Inactive (Last signal 2003)',
    distanceAU: 135.2,
    distanceKm: '20.2 billion km',
    launchDate: '1972-03-03',
    eclipticLatitudeDeg: 3.0,
    eclipticLongitudeDeg: 76.0,
    constellation: 'Taurus (heading toward Aldebaran)',
    speedKmS: 11.9,
    color: '#f59e0b',
    description: 'First spacecraft to traverse the Asteroid Belt and conduct direct close-up exploration of Jupiter. Carries the famous gold-anodized Pioneer plaque.',
    isInterstellar: true,
    verifiedSource: 'NASA Ames Research Center Records'
  },
  {
    id: 'pioneer-11',
    name: 'Pioneer 11',
    missionName: 'Pioneer 11',
    slug: 'pioneer-11',
    status: 'Inactive (Last signal 1995)',
    distanceAU: 111.4,
    distanceKm: '16.7 billion km',
    launchDate: '1973-04-06',
    eclipticLatitudeDeg: 14.0,
    eclipticLongitudeDeg: 284.0,
    constellation: 'Scutum',
    speedKmS: 11.2,
    color: '#d97706',
    description: 'First spacecraft to fly past Saturn, discovering the F ring and Titan\'s sub-zero cloud environment.',
    isInterstellar: true,
    verifiedSource: 'NASA Ames Research Center Records'
  },
  {
    id: 'new-horizons',
    name: 'New Horizons',
    missionName: 'New Horizons',
    slug: 'new-horizons',
    status: 'Active (Kuiper Belt Extended Mission)',
    distanceAU: 58.6,
    distanceKm: '8.8 billion km',
    launchDate: '2006-01-19',
    eclipticLatitudeDeg: 2.4,
    eclipticLongitudeDeg: 292.0,
    constellation: 'Sagittarius',
    speedKmS: 13.7,
    color: '#a855f7',
    description: 'High-speed probe that conducted the historic first reconnaissance of the Pluto system in 2015 and the contact-binary planetesimal Arrokoth in 2019.',
    isInterstellar: false, // In Kuiper Belt, inside heliosphere
    verifiedSource: 'NASA / JHUAPL Mission Operations'
  }
];

export const SCALE_PRESETS = {
  PLANETARY: {
    id: 'planetary',
    label: 'Planetary Surface & Orbit',
    shortLabel: 'Planetary',
    description: 'Close inspection of planetary terrain, landing sites, and orbital modules.',
    cameraDistance: 10,
    targetY: 0
  },
  SOLAR_SYSTEM: {
    id: 'solar',
    label: 'Solar System Overview',
    shortLabel: 'Solar System',
    description: 'The Sun, terrestrial worlds, asteroid belt, and gas giants out to Neptune.',
    cameraDistance: 180,
    targetY: 0
  },
  HELIOSPHERE: {
    id: 'heliosphere',
    label: 'Heliosphere & Interstellar',
    shortLabel: 'Heliosphere',
    description: 'The solar wind bubble boundary and escaping probes (Voyager 1 & 2, Pioneer, New Horizons).',
    cameraDistance: 900,
    targetY: 350
  },
  GALACTIC: {
    id: 'galactic',
    label: 'Wider Milky Way Context',
    shortLabel: 'Galactic Context',
    description: 'The Solar System oriented at ~60° tilt relative to the Milky Way galactic disk.',
    cameraDistance: 3200,
    targetY: 1500
  },
  VOYAGER_LOCAL: {
    id: 'voyager_local',
    label: 'Voyager 1 Local (1,000 km)',
    shortLabel: 'Voyager 1 Local',
    description: '1,000 km proximity exploration sphere centered on Voyager 1 in the local interstellar medium (ISM).',
    sphereRadiusKm: 1000,
    cameraDistance: 14,
    targetY: 0
  }
};

/**
 * Scientific Telemetry & Physical Metrics for Voyager 1 Local Proximity Volume (1,000 km radius)
 * 
 * SCIENTIFIC CLARIFICATION & DISCLAIMER:
 * A 1,000 km sphere around Voyager 1 is a local proximity visualization,
 * NOT a representation of the entire interstellar environment.
 * The local volume represents pristine interstellar vacuum.
 * No nearby stars, satellites, spacecraft, or macroscopic debris exist in this volume.
 */
export const VOYAGER_LOCAL_METRICS = {
  sphereRadiusKm: 1000,
  sphereRadiusLabel: '1,000 km',
  regime: 'Local Interstellar Medium (ISM)',
  solarDistanceAU: 163.7,
  solarDistanceKm: '24.5 billion km',
  asymptoticSpeedKmS: 16.9,
  asymptoticSpeedAUYear: 3.57,
  constellationHeading: 'Ophiuchus (RA 17h 14m, Dec +12°)',
  plasmaDensityCm3: '~0.08 cm⁻³ (PWS plasma wave detection post-heliopause crossing)',
  magneticFieldStrengthNT: '~0.48 nT (Interstellar magnetic field detected by MAG)',
  cosmicRayFlux: '90%+ Galactic Cosmic Rays (solar wind ions depleted)',
  nearbyObjectsDisclaimer: 'Verified pristine interstellar vacuum volume; 0 known macroscopic natural or artificial objects exist within this local 1,000 km volume.'
};

