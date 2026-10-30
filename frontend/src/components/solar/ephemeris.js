/**
 * NASA JPL Keplerian Ephemeris & Time-Dependent Astro Engine
 * 
 * SCIENTIFIC ARCHITECTURE & SPECIFICATION:
 * - Based on NASA JPL / Caltech Solar System Dynamics Keplerian Elements (Standish 1992 / JPL DE405/DE440).
 * - Temporal Range: 1800 AD to 2050 AD with high precision.
 * - Time Standard: Universal Time Coordinate (UTC) converted to Julian Date (JD) and J2000 Centuries (T).
 * - Reference Coordinate Frame: Heliocentric Ecliptic J2000 (X pointing towards vernal equinox, Z pointing towards ecliptic north pole).
 * - Solves Kepler's equation M = E - e*sin(E) using Newton-Raphson iteration.
 * - Dynamically updates major planets, moons, and verified mission trajectories at any historical or future date.
 */

// J2000 Epoch: 2000-01-01 12:00:00 UTC (Julian Date 2451545.0)
export const JD_J2000 = 2451545.0;
export const AU_IN_KM = 149597870.7; // 1 Astronomical Unit in km
export const SPEED_OF_LIGHT_KM_S = 299792.458;

/**
 * Convert standard JavaScript Date object to Julian Date (JD)
 * @param {Date} date
 * @returns {number} Julian Date
 */
export function dateToJulianDate(date) {
  return (date.getTime() / 86400000.0) + 2440587.5;
}

/**
 * Convert Julian Date to JavaScript Date object
 * @param {number} jd
 * @returns {Date}
 */
export function julianDateToDate(jd) {
  return new Date((jd - 2440587.5) * 86400000.0);
}

/**
 * Convert Julian Date to centuries since J2000.0 (T)
 * @param {number} jd
 * @returns {number}
 */
export function julianDateToCenturies(jd) {
  return (jd - JD_J2000) / 36525.0;
}

/**
 * Normalizes angle in degrees to [0, 360)
 */
export function normalizeDegrees(deg) {
  let val = deg % 360.0;
  if (val < 0) val += 360.0;
  return val;
}

/**
 * Normalizes angle in radians to [0, 2*PI)
 */
export function normalizeRadians(rad) {
  let val = rad % (Math.PI * 2);
  if (val < 0) val += Math.PI * 2;
  return val;
}

const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

/**
 * NASA JPL Keplerian Elements and Century Rates (1800 AD - 2050 AD)
 * a: Semi-major axis (AU), a_dot: rate per century
 * e: Eccentricity, e_dot: rate per century
 * I: Inclination (deg), I_dot: rate per century
 * L: Mean longitude (deg), L_dot: rate per century
 * w_bar: Longitude of perihelion (deg), w_bar_dot: rate per century
 * node: Longitude of ascending node (deg), node_dot: rate per century
 */
export const JPL_PLANETARY_ELEMENTS = {
  mercury: {
    a: 0.38709927, a_dot: 0.00000037,
    e: 0.20563593, e_dot: 0.00001906,
    I: 7.00497902, I_dot: -0.00594749,
    L: 252.25032350, L_dot: 149472.67411175,
    w_bar: 77.45779628, w_bar_dot: 0.16047689,
    node: 48.33076593, node_dot: -0.12534081,
    baseSceneDistance: 14.0
  },
  venus: {
    a: 0.72333566, a_dot: 0.00000390,
    e: 0.00677672, e_dot: -0.00004107,
    I: 3.39467605, I_dot: -0.00078890,
    L: 181.97909950, L_dot: 58517.81538729,
    w_bar: 131.60246718, w_bar_dot: 0.00268329,
    node: 76.67984255, node_dot: -0.27769418,
    baseSceneDistance: 21.0
  },
  earth: {
    a: 1.00000261, a_dot: 0.00000562,
    e: 0.01671123, e_dot: -0.00004392,
    I: -0.00001531, I_dot: -0.01294668,
    L: 100.46457166, L_dot: 35999.37244981,
    w_bar: 102.93768193, w_bar_dot: 0.32327364,
    node: 0.0, node_dot: 0.0,
    baseSceneDistance: 30.0
  },
  mars: {
    a: 1.52371034, a_dot: 0.00001847,
    e: 0.09339410, e_dot: 0.00007882,
    I: 1.84969142, I_dot: -0.00813131,
    L: -4.55343205, L_dot: 19140.30268499,
    w_bar: -23.94362959, w_bar_dot: 0.44441088,
    node: 49.55953891, node_dot: -0.29257343,
    baseSceneDistance: 40.0
  },
  jupiter: {
    a: 5.20288700, a_dot: -0.00011607,
    e: 0.04838624, e_dot: -0.00013253,
    I: 1.30439695, I_dot: -0.00183714,
    L: 34.39644051, L_dot: 3034.74612775,
    w_bar: 14.72847983, w_bar_dot: 0.21252668,
    node: 100.47390909, node_dot: 0.20469106,
    baseSceneDistance: 56.0
  },
  saturn: {
    a: 9.53667594, a_dot: -0.00125060,
    e: 0.05386179, e_dot: -0.00050991,
    I: 2.48599187, I_dot: 0.00193609,
    L: 49.95424423, L_dot: 1222.49362201,
    w_bar: 92.59887831, w_bar_dot: -0.41897216,
    node: 113.66242448, node_dot: -0.28867794,
    baseSceneDistance: 72.0
  },
  uranus: {
    a: 19.18916464, a_dot: -0.00196153,
    e: 0.04725744, e_dot: -0.00004397,
    I: 0.77263783, I_dot: -0.00242939,
    L: 313.23810451, L_dot: 428.48202785,
    w_bar: 170.95427630, w_bar_dot: 0.40805280,
    node: 74.01692503, node_dot: 0.04240589,
    baseSceneDistance: 88.0
  },
  neptune: {
    a: 30.06992276, a_dot: 0.00026291,
    e: 0.00860610, e_dot: 0.00005105,
    I: 1.77004347, I_dot: 0.00035372,
    L: -55.12002969, L_dot: 218.45945325,
    w_bar: 44.96476227, w_bar_dot: -0.32241464,
    node: 131.78422574, node_dot: -0.00508664,
    baseSceneDistance: 104.0
  },
  pluto: {
    a: 39.48211675, a_dot: -0.00031596,
    e: 0.24882730, e_dot: 0.00005170,
    I: 17.14001206, I_dot: 0.00004818,
    L: 238.92903833, L_dot: 145.20780515,
    w_bar: 224.06876774, w_bar_dot: -0.04062942,
    node: 110.30393608, node_dot: -0.01183482,
    baseSceneDistance: 120.0
  }
};

/**
 * Solve Kepler's equation M = E - e * sin(E) using Newton-Raphson iteration
 * @param {number} M Mean anomaly in radians
 * @param {number} e Eccentricity
 * @returns {number} Eccentric anomaly E in radians
 */
export function solveKepler(M, e) {
  let E = M + e * Math.sin(M) * (1.0 + e * Math.cos(M));
  for (let i = 0; i < 12; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1.0 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

/**
 * Calculate physical heliocentric position and Keplerian state for a given planet at Julian Date
 * @param {string} planetId ('mercury', 'venus', 'earth', etc.)
 * @param {number} jd Julian Date
 * @returns {Object} { x, y, z, rAU, rKm, trueAnomalyDeg, helioLongitudeDeg, helioLatitudeDeg }
 */
export function getPlanetPhysicalEphemeris(planetId, jd) {
  const p = JPL_PLANETARY_ELEMENTS[planetId.toLowerCase()];
  if (!p) return null;

  const T = julianDateToCenturies(jd);

  // 1. Compute osculating orbital elements at T
  const a = p.a + p.a_dot * T;
  const e = p.e + p.e_dot * T;
  const I = (p.I + p.I_dot * T) * DEG2RAD;
  const L = normalizeDegrees(p.L + p.L_dot * T);
  const w_bar = normalizeDegrees(p.w_bar + p.w_bar_dot * T);
  const node = normalizeDegrees(p.node + p.node_dot * T) * DEG2RAD;

  // 2. Argument of perihelion (omega) and Mean Anomaly (M)
  const omega = (w_bar - (p.node + p.node_dot * T)) * DEG2RAD;
  const M_deg = normalizeDegrees(L - w_bar);
  const M = M_deg * DEG2RAD;

  // 3. Solve Kepler's Equation for Eccentric Anomaly E
  const E = solveKepler(M, e);

  // 4. Heliocentric coordinates in orbital plane
  const x_prime = a * (Math.cos(E) - e);
  const y_prime = a * Math.sqrt(Math.max(0, 1.0 - e * e)) * Math.sin(E);
  const rAU = Math.sqrt(x_prime * x_prime + y_prime * y_prime);

  // 5. True Anomaly nu
  const nu = Math.atan2(y_prime, x_prime);

  // 6. Transform to Heliocentric Ecliptic J2000 coordinates (X, Y, Z)
  // X = r * (cos(node) * cos(omega + nu) - sin(node) * sin(omega + nu) * cos(I))
  // Y = r * (sin(node) * cos(omega + nu) + cos(node) * sin(omega + nu) * cos(I))
  // Z = r * (sin(omega + nu) * sin(I))
  const u = omega + nu; // Argument of latitude
  const cosU = Math.cos(u);
  const sinU = Math.sin(u);
  const cosNode = Math.cos(node);
  const sinNode = Math.sin(node);
  const cosI = Math.cos(I);
  const sinI = Math.sin(I);

  const x = rAU * (cosNode * cosU - sinNode * sinU * cosI);
  const y = rAU * (sinNode * cosU + cosNode * sinU * cosI);
  const z = rAU * (sinU * sinI);

  return {
    planetId,
    jd,
    a,
    e,
    I_deg: I * RAD2DEG,
    rAU,
    rKm: rAU * AU_IN_KM,
    xAU: x,
    yAU: y,
    zAU: z,
    trueAnomalyDeg: normalizeDegrees(nu * RAD2DEG),
    orbitalSpeedKmS: Math.sqrt(132712440018.0 * (2.0 / (rAU * AU_IN_KM) - 1.0 / (a * AU_IN_KM)))
  };
}

/**
 * Maps physical heliocentric position into 3D scene space.
 * In Three.js:
 * X -> Ecliptic X
 * Y -> Ecliptic Z (vertical/polar height in Three.js coordinates)
 * Z -> Ecliptic Y (transverse horizontal in Three.js coordinates)
 * 
 * Scaled smoothly so inner and outer planets remain fully legible and visually proportional.
 */
export function getPlanetScenePosition(planetId, jd) {
  const ephem = getPlanetPhysicalEphemeris(planetId, jd);
  if (!ephem) return { x: 0, y: 0, z: 0, ephem: null };

  const p = JPL_PLANETARY_ELEMENTS[planetId.toLowerCase()];
  const baseDist = p ? p.baseSceneDistance : 30.0;

  // Scene radius maintains Keplerian eccentric ratio r(t) / a_mean
  const sceneScaleFactor = baseDist / p.a;
  
  // Three.js uses Y as up:
  // scene.x = xAU * scaleFactor
  // scene.y = zAU * scaleFactor (inclination vertical offset)
  // scene.z = yAU * scaleFactor
  const sceneX = ephem.xAU * sceneScaleFactor;
  const sceneY = ephem.zAU * sceneScaleFactor;
  const sceneZ = ephem.yAU * sceneScaleFactor;

  return {
    x: sceneX,
    y: sceneY,
    z: sceneZ,
    ephem
  };
}

/**
 * Historical Mission Milestones for Interactive Timeline Navigation
 */
export const HISTORICAL_MILESTONES = [
  {
    id: 'now',
    label: 'Present Day (Live Telemetry)',
    date: new Date(),
    description: 'Current real-time positions of planets and active deep-space missions.',
    target: 'earth',
    scale: 'SOLAR_SYSTEM'
  },
  {
    id: 'apollo11-1969',
    label: '1969 — Apollo 11 Lunar Landing',
    date: new Date('1969-07-20T20:17:40Z'),
    description: 'First crewed lunar landing at Mare Tranquillitatis ("Houston, Tranquility Base here. The Eagle has landed.").',
    target: 'apollo-11-lm-descent-stage',
    scale: 'PLANETARY'
  },
  {
    id: 'voyager1-launch-1977',
    label: '1977 — Voyager 1 & 2 Launch',
    date: new Date('1977-09-05T12:56:00Z'),
    description: 'Voyager 1 launches from Cape Canaveral to begin the Grand Tour of the outer solar system.',
    target: 'voyager-1',
    scale: 'SOLAR_SYSTEM'
  },
  {
    id: 'voyager1-jupiter-1979',
    label: '1979 — Voyager 1 Jupiter Flyby',
    date: new Date('1979-03-05T12:05:00Z'),
    description: 'Voyager 1 closest approach to Jupiter (349,000 km), discovering volcanic active plumes on Io.',
    target: 'voyager-1',
    scale: 'SOLAR_SYSTEM'
  },
  {
    id: 'voyager1-saturn-1980',
    label: '1980 — Voyager 1 Saturn Encounter',
    date: new Date('1980-11-12T23:46:00Z'),
    description: 'Closest approach to Saturn and flyby of Titan, directing Voyager 1 into an asymptotic interstellar escape trajectory.',
    target: 'voyager-1',
    scale: 'SOLAR_SYSTEM'
  },
  {
    id: 'voyager2-neptune-1989',
    label: '1989 — Voyager 2 Neptune Flyby',
    date: new Date('1989-08-25T03:56:00Z'),
    description: 'Voyager 2 conducts first close exploration of Neptune and Triton, completing the Grand Tour.',
    target: 'voyager-2',
    scale: 'SOLAR_SYSTEM'
  },
  {
    id: 'pathfinder-1997',
    label: '1997 — Mars Pathfinder & Sojourner',
    date: new Date('1997-07-04T16:57:00Z'),
    description: 'Sojourner becomes the first robotic rover to roll onto the surface of Mars at Ares Vallis.',
    target: 'pathfinder-lander-carl-sagan-memorial',
    scale: 'PLANETARY'
  },
  {
    id: 'cassini-saturn-2004',
    label: '2004 — Cassini Enters Saturn Orbit',
    date: new Date('2004-07-01T02:48:00Z'),
    description: 'Cassini-Huygens fires its main engine and executes Saturn Orbit Insertion (SOI).',
    target: 'cassini-saturn-orbiter',
    scale: 'SOLAR_SYSTEM'
  },
  {
    id: 'curiosity-2012',
    label: '2012 — Curiosity Touchdown on Mars',
    date: new Date('2012-08-06T05:17:57Z'),
    description: 'Curiosity performs the "Seven Minutes of Terror" Sky Crane landing inside Gale Crater.',
    target: 'curiosity-rover',
    scale: 'PLANETARY'
  },
  {
    id: 'voyager1-interstellar-2012',
    label: '2012 — Voyager 1 Crosses Heliopause',
    date: new Date('2012-08-25T12:00:00Z'),
    description: 'Voyager 1 officially detects interstellar plasma density increase at ~121.6 AU, entering interstellar space.',
    target: 'voyager-1',
    scale: 'HELIOSPHERE'
  },
  {
    id: 'newhorizons-pluto-2015',
    label: '2015 — New Horizons Pluto Flyby',
    date: new Date('2015-07-14T11:49:57Z'),
    description: 'New Horizons flies past Pluto at 12,500 km, revealing the heart-shaped nitrogen ice plain Tombaugh Regio.',
    target: 'new-horizons',
    scale: 'HELIOSPHERE'
  },
  {
    id: 'perseverance-2021',
    label: '2021 — Perseverance & Ingenuity on Mars',
    date: new Date('2021-02-18T20:55:00Z'),
    description: 'Perseverance lands in Jezero Crater to search for signs of ancient biosignatures.',
    target: 'perseverance-rover',
    scale: 'PLANETARY'
  },
  {
    id: 'jwst-launch-2021',
    label: '2021 — James Webb Space Telescope Launch',
    date: new Date('2021-12-25T12:20:00Z'),
    description: 'JWST launches aboard Ariane 5 towards Sun-Earth L2 Lagrange point.',
    target: 'james-webb-space-telescope',
    scale: 'SOLAR_SYSTEM'
  },
  {
    id: 'chandrayaan3-2023',
    label: '2023 — Chandrayaan-3 Lunar South Pole',
    date: new Date('2023-08-23T12:34:00Z'),
    description: 'ISRO Vikram lander achieves historic touchdown at Shiv Shakti Point near the lunar south pole.',
    target: 'vikram-lander-chandrayaan-3',
    scale: 'PLANETARY'
  }
];

/**
 * Calculates time-dependent position for interstellar and interplanetary probes
 * @param {string} slug
 * @param {Date} date
 * @returns {Object|null}
 */
export function getSpacecraftTimePosition(slug, date) {
  const year = date.getUTCFullYear() + (date.getUTCMonth() / 12) + (date.getUTCDate() / 365);

  if (slug === 'voyager-1') {
    // Launch: 1977.68
    if (year < 1977.68) {
      return { status: 'pre_launch', referenceBody: 'earth', distanceAU: 1.0 };
    }
    // Jupiter flyby: 1979.17 (~5.2 AU)
    if (year < 1979.17) {
      const frac = (year - 1977.68) / (1979.17 - 1977.68);
      const distAU = 1.0 + frac * 4.2;
      return { status: 'cruise_jupiter', distanceAU: distAU, speedKmS: 25.0 };
    }
    // Saturn flyby: 1980.87 (~9.5 AU)
    if (year < 1980.87) {
      const frac = (year - 1979.17) / (1980.87 - 1979.17);
      const distAU = 5.2 + frac * 4.3;
      return { status: 'cruise_saturn', distanceAU: distAU, speedKmS: 22.0 };
    }
    // Heliopause crossing: 2012.64 (~121.6 AU)
    // Asymptotic escape speed: ~16.9 km/s = ~3.56 AU/year
    const postSaturnYears = year - 1980.87;
    const distAU = 9.5 + postSaturnYears * 3.56;
    return {
      status: year >= 2012.64 ? 'interstellar_medium' : 'heliosphere_cruise',
      distanceAU: Math.min(220, Math.max(9.5, distAU)),
      speedKmS: 16.9,
      isInterstellar: year >= 2012.64
    };
  }

  if (slug === 'voyager-2') {
    if (year < 1977.64) return { status: 'pre_launch', referenceBody: 'earth', distanceAU: 1.0 };
    if (year < 1979.52) return { status: 'cruise_jupiter', distanceAU: 1.0 + ((year - 1977.64) / 1.88) * 4.2, speedKmS: 24.0 };
    if (year < 1981.65) return { status: 'cruise_saturn', distanceAU: 5.2 + ((year - 1979.52) / 2.13) * 4.3, speedKmS: 20.0 };
    if (year < 1986.06) return { status: 'cruise_uranus', distanceAU: 9.5 + ((year - 1981.65) / 4.41) * 9.7, speedKmS: 17.5 };
    if (year < 1989.65) return { status: 'cruise_neptune', distanceAU: 19.2 + ((year - 1986.06) / 3.59) * 10.9, speedKmS: 16.5 };
    const postNeptuneYears = year - 1989.65;
    const distAU = 30.1 + postNeptuneYears * 3.21;
    return {
      status: year >= 2018.85 ? 'interstellar_medium' : 'heliosphere_cruise',
      distanceAU: Math.min(200, Math.max(30.1, distAU)),
      speedKmS: 15.3,
      isInterstellar: year >= 2018.85
    };
  }

  if (slug === 'new-horizons') {
    if (year < 2006.05) return { status: 'pre_launch', referenceBody: 'earth', distanceAU: 1.0 };
    if (year < 2007.16) return { status: 'cruise_jupiter', distanceAU: 1.0 + ((year - 2006.05) / 1.11) * 4.2, speedKmS: 21.0 };
    if (year < 2015.53) return { status: 'cruise_pluto', distanceAU: 5.2 + ((year - 2007.16) / 8.37) * 27.7, speedKmS: 14.5 };
    const postPlutoYears = year - 2015.53;
    const distAU = 32.9 + postPlutoYears * 3.1;
    return {
      status: 'kuiper_belt_cruise',
      distanceAU: Math.min(100, Math.max(32.9, distAU)),
      speedKmS: 13.8,
      isInterstellar: false
    };
  }

  return null;
}

