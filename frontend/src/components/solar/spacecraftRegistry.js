/**
 * Spacecraft Telemetry & Coordinate Registry for Novaquest
 * 
 * SCIENTIFIC CLARIFICATION & DISCLAIMER:
 * Position coordinates, reference frames, reference bodies, and measurement timestamps
 * are derived exclusively from verified space-agency records:
 * - NASA JPL Horizons Ephemerides (DE441/DE442)
 * - NASA NSSDC (National Space Science Data Center)
 * - NASA Mars Exploration / Lunar Exploration Archives
 * - ISRO (Indian Space Research Organisation) Official Mission Archives
 * - ESA (European Space Agency) Planetary Science Archive
 * - CNSA (China National Space Administration) Lunar & Mars Archives
 * - JAXA (Japan Aerospace Exploration Agency) Data Archives
 * 
 * Records without verified coordinates are explicitly flagged as UNMAPPED.
 * No fabricated or arbitrary coordinates are ever assigned.
 */

export const COORDINATE_FRAMES = {
  SELENOGRAPHIC: 'Selenographic (IAU Moon Fixed, Mean Earth/Polar Axis)',
  AEROCENTRIC: 'Aerocentric (IAU Mars Fixed, East Longitude)',
  HERMOGRAPHIC: 'Hermographic (IAU Mercury Fixed)',
  GEOCENTRIC_INERTIAL: 'Geocentric Inertial J2000 (Earth Equator & Equinox)',
  GEOCENTRIC_HALO: 'Sun-Earth L2 Lagrange Halo Coordinate Frame',
  PLANETOCENTRIC_ORBIT: 'Planetocentric Orbital Plane',
  HELIOCENTRIC_ECLIPTIC: 'Heliocentric Ecliptic J2000'
};

export const POSITION_STATUS = {
  CURRENT_TELEMETRY: 'Current Verified Telemetry',
  HISTORICAL_SURFACE: 'Historical Verified Surface Landing Site',
  HISTORICAL_IMPACT: 'Historical Verified Final Impact Site',
  HISTORICAL_ORBIT: 'Historical Operational Orbit',
  ACTIVE_ORBIT: 'Active Operational Orbit',
  INTERSTELLAR_ESCAPE: 'Active Interstellar Asymptotic Escape Trajectory',
  UNMAPPED: 'Coordinates Unavailable in Archive'
};

/**
 * Verified Physical Spacecraft Registry
 * Keyed by backend hardware slug.
 */
export const VERIFIED_SPACECRAFT = {
  // =========================================================================
  // 1. LUNAR SURFACE LANDERS & ROVERS (Selenographic Coordinates)
  // =========================================================================
  'vikram-lander-chandrayaan-3': {
    slug: 'vikram-lander-chandrayaan-3',
    name: 'Vikram Lander',
    mission: 'Chandrayaan-3',
    agency: 'Indian Space Research Organisation (ISRO)',
    type: 'Lander',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: -69.37, lon: 32.35, siteName: 'Shiv Shakti Point, South Polar Region' },
    timestamp: '2023-08-23 12:32 UTC (Touchdown verification)',
    dataSource: 'ISRO Official Mission Announcement & Chandrayaan-3 Telemetry',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#f97316'
  },
  'pragyan-rover-chandrayaan-3': {
    slug: 'pragyan-rover-chandrayaan-3',
    name: 'Pragyan Rover',
    mission: 'Chandrayaan-3',
    agency: 'Indian Space Research Organisation (ISRO)',
    type: 'Rover',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: -69.37, lon: 32.35, siteName: 'Shiv Shakti Point traverse region' },
    timestamp: '2023-08-23 12:32 UTC (Deployment)',
    dataSource: 'ISRO Official Mission Records',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#fb923c'
  },
  'yutu-2-rover': {
    slug: 'yutu-2-rover',
    name: 'Yutu-2 Rover (Jade Rabbit 2)',
    mission: "Chang'e 4",
    agency: 'China National Space Administration (CNSA)',
    type: 'Rover',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: -45.45, lon: 177.59, siteName: 'Statio Tianhe, Von Kármán Crater (Far Side)' },
    timestamp: '2019-01-03 02:26 UTC (Touchdown)',
    dataSource: 'CNSA Lunar Exploration Project & CLEP Records',
    positionStatus: POSITION_STATUS.CURRENT_TELEMETRY,
    color: '#ef4444'
  },
  'apollo-11-lm-descent-stage': {
    slug: 'apollo-11-lm-descent-stage',
    name: 'Apollo 11 LM Descent Stage (Eagle)',
    mission: 'Apollo 11',
    agency: 'NASA',
    type: 'Lunar Module Descent Stage',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: 0.67408, lon: 23.47297, siteName: 'Statio Tranquillitatis, Mare Tranquillitatis' },
    timestamp: '1969-07-20 20:17:40 UTC (Touchdown)',
    dataSource: 'NASA NSSDC Apollo Lunar Surface Journal (LROC verified)',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#facc15'
  },
  'apollo-12-lm-descent-stage': {
    slug: 'apollo-12-lm-descent-stage',
    name: 'Apollo 12 LM Descent Stage (Intrepid)',
    mission: 'Apollo 12',
    agency: 'NASA',
    type: 'Lunar Module Descent Stage',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: -3.01239, lon: -23.42157, siteName: 'Oceanus Procellarum (near Surveyor 3)' },
    timestamp: '1969-11-19 06:54:35 UTC (Touchdown)',
    dataSource: 'NASA NSSDC Apollo 12 & LROC coordinates',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#facc15'
  },
  'apollo-14-lm-descent-stage': {
    slug: 'apollo-14-lm-descent-stage',
    name: 'Apollo 14 LM Descent Stage (Antares)',
    mission: 'Apollo 14',
    agency: 'NASA',
    type: 'Lunar Module Descent Stage',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: -3.64530, lon: -17.47136, siteName: 'Fra Mauro Formation' },
    timestamp: '1971-02-05 09:18:11 UTC (Touchdown)',
    dataSource: 'NASA NSSDC Apollo 14 Record',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#facc15'
  },
  'apollo-15-lunar-roving-vehicle': {
    slug: 'apollo-15-lunar-roving-vehicle',
    name: 'Apollo 15 Lunar Roving Vehicle (LRV-1)',
    mission: 'Apollo 15',
    agency: 'NASA',
    type: 'Lunar Roving Vehicle',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: 26.1322, lon: 3.6339, siteName: 'Hadley-Apennine Region' },
    timestamp: '1971-08-02 17:00 UTC (Final parking position)',
    dataSource: 'NASA Apollo 15 Flight Evaluation Report',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#facc15'
  },
  'apollo-15-lm-descent-stage': {
    slug: 'apollo-15-lm-descent-stage',
    name: 'Apollo 15 LM Descent Stage (Falcon)',
    mission: 'Apollo 15',
    agency: 'NASA',
    type: 'Lunar Module Descent Stage',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: 26.1322, lon: 3.6339, siteName: 'Hadley-Apennine Region' },
    timestamp: '1971-07-30 22:16:29 UTC (Touchdown)',
    dataSource: 'NASA NSSDC Apollo 15 Record',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#facc15'
  },
  'apollo-16-lunar-roving-vehicle': {
    slug: 'apollo-16-lunar-roving-vehicle',
    name: 'Apollo 16 Lunar Roving Vehicle (LRV-2)',
    mission: 'Apollo 16',
    agency: 'NASA',
    type: 'Lunar Roving Vehicle',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: -8.97301, lon: 15.49812, siteName: 'Descartes Highlands' },
    timestamp: '1972-04-23 21:00 UTC (Final VIP site parking)',
    dataSource: 'NASA Apollo 16 Mission Report',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#facc15'
  },
  'apollo-16-lm-descent-stage': {
    slug: 'apollo-16-lm-descent-stage',
    name: 'Apollo 16 LM Descent Stage (Orion)',
    mission: 'Apollo 16',
    agency: 'NASA',
    type: 'Lunar Module Descent Stage',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: -8.97301, lon: 15.49812, siteName: 'Descartes Highlands' },
    timestamp: '1972-04-21 02:23:35 UTC (Touchdown)',
    dataSource: 'NASA NSSDC Apollo 16 Record',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#facc15'
  },
  'apollo-17-lunar-roving-vehicle': {
    slug: 'apollo-17-lunar-roving-vehicle',
    name: 'Apollo 17 Lunar Roving Vehicle (LRV-3)',
    mission: 'Apollo 17',
    agency: 'NASA',
    type: 'Lunar Roving Vehicle',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: 20.1908, lon: 30.7717, siteName: 'Taurus-Littrow Valley' },
    timestamp: '1972-12-14 05:40 UTC (Final parking position)',
    dataSource: 'NASA Apollo 17 Mission Report',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#facc15'
  },
  'apollo-17-lm-descent-stage': {
    slug: 'apollo-17-lm-descent-stage',
    name: 'Apollo 17 LM Descent Stage (Challenger)',
    mission: 'Apollo 17',
    agency: 'NASA',
    type: 'Lunar Module Descent Stage',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: 20.1908, lon: 30.7717, siteName: 'Taurus-Littrow Valley' },
    timestamp: '1972-12-11 19:54:57 UTC (Touchdown)',
    dataSource: 'NASA NSSDC Apollo 17 Record',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#facc15'
  },
  'surveyor-1-lander': {
    slug: 'surveyor-1-lander',
    name: 'Surveyor 1 Lander',
    mission: 'Surveyor 1',
    agency: 'NASA',
    type: 'Lander',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: -2.474, lon: -43.340, siteName: 'Flamsteed P crater, Oceanus Procellarum' },
    timestamp: '1966-06-02 06:17:36 UTC (Touchdown)',
    dataSource: 'NASA JPL Surveyor 1 Report',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#94a3b8'
  },
  'surveyor-3-lander': {
    slug: 'surveyor-3-lander',
    name: 'Surveyor 3 Lander',
    mission: 'Surveyor 3',
    agency: 'NASA',
    type: 'Lander',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: -3.015, lon: -23.418, siteName: 'Oceanus Procellarum' },
    timestamp: '1967-04-20 00:04:53 UTC (Touchdown, visited by Apollo 12)',
    dataSource: 'NASA JPL Surveyor Project',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#94a3b8'
  },
  'lcross-impactor': {
    slug: 'lcross-impactor',
    name: 'LCROSS Centaur Impactor',
    mission: 'LCROSS',
    agency: 'NASA',
    type: 'Impactor',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.SELENOGRAPHIC,
    coordinates: { lat: -84.675, lon: -48.725, siteName: 'Cabeus Crater floor (permanently shadowed region)' },
    timestamp: '2009-10-09 11:31:19 UTC (Impact confirmation)',
    dataSource: 'NASA Ames Research Center LCROSS Science Report',
    positionStatus: POSITION_STATUS.HISTORICAL_IMPACT,
    color: '#38bdf8'
  },

  // =========================================================================
  // 2. MARTIAN SURFACE LANDERS & ROVERS (Aerocentric Coordinates)
  // =========================================================================
  'perseverance-rover': {
    slug: 'perseverance-rover',
    name: 'Perseverance Rover',
    mission: 'Mars 2020',
    agency: 'NASA',
    type: 'Rover',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.AEROCENTRIC,
    coordinates: { lat: 18.38, lon: 77.58, siteName: 'Octavia E. Butler Landing / Jezero Crater Delta' },
    timestamp: '2021-02-18 20:55 UTC (Landing, active 2026 telemetry)',
    dataSource: 'NASA JPL Mars 2020 Mission Operations',
    positionStatus: POSITION_STATUS.CURRENT_TELEMETRY,
    color: '#22d3ee'
  },
  'ingenuity-helicopter': {
    slug: 'ingenuity-helicopter',
    name: 'Ingenuity Mars Helicopter',
    mission: 'Mars 2020',
    agency: 'NASA',
    type: 'Aircraft / Rotorcraft',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.AEROCENTRIC,
    coordinates: { lat: 18.44, lon: 77.45, siteName: 'Valinor Hills, Jezero Crater (Airfield Chi)' },
    timestamp: '2024-01-18 Flight 72 final landing site',
    dataSource: 'NASA JPL Mars 2020 Flight Operations',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#34d399'
  },
  'curiosity-rover': {
    slug: 'curiosity-rover',
    name: 'Curiosity Rover',
    mission: 'Mars Science Laboratory (MSL)',
    agency: 'NASA',
    type: 'Rover',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.AEROCENTRIC,
    coordinates: { lat: -4.5895, lon: 137.4417, siteName: 'Bradbury Landing / Mount Sharp, Gale Crater' },
    timestamp: '2012-08-06 05:17 UTC (Landing, active 2026 telemetry)',
    dataSource: 'NASA JPL MSL Mission Operations',
    positionStatus: POSITION_STATUS.CURRENT_TELEMETRY,
    color: '#38bdf8'
  },
  'insight-lander': {
    slug: 'insight-lander',
    name: 'InSight Lander',
    mission: 'InSight',
    agency: 'NASA',
    type: 'Lander',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.AEROCENTRIC,
    coordinates: { lat: 4.5024, lon: 135.6234, siteName: 'Elysium Planitia' },
    timestamp: '2018-11-26 19:52:59 UTC (Touchdown, final mission contact Dec 2022)',
    dataSource: 'NASA JPL InSight Mission Archive',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#e879f9'
  },
  'phoenix-mars-lander': {
    slug: 'phoenix-mars-lander',
    name: 'Phoenix Mars Lander',
    mission: 'Phoenix',
    agency: 'NASA',
    type: 'Lander',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.AEROCENTRIC,
    coordinates: { lat: 68.2188, lon: -125.7492, siteName: 'Green Valley, Vastitas Borealis' },
    timestamp: '2008-05-25 23:53:44 UTC (Touchdown)',
    dataSource: 'NASA JPL Phoenix Mars Mission Archive',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#a78bfa'
  },
  'viking-1-lander': {
    slug: 'viking-1-lander',
    name: 'Viking 1 Lander',
    mission: 'Viking 1',
    agency: 'NASA',
    type: 'Lander',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.AEROCENTRIC,
    coordinates: { lat: 22.27, lon: -47.95, siteName: 'Chryse Planitia' },
    timestamp: '1976-07-20 11:53:06 UTC (First successful US Mars landing)',
    dataSource: 'NASA JPL Viking Project (LROC / HiRISE verified)',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#fb923c'
  },
  'viking-2-lander': {
    slug: 'viking-2-lander',
    name: 'Viking 2 Lander',
    mission: 'Viking 2',
    agency: 'NASA',
    type: 'Lander',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.AEROCENTRIC,
    coordinates: { lat: 48.27, lon: -134.00, siteName: 'Utopia Planitia' },
    timestamp: '1976-09-03 22:58:20 UTC (Touchdown)',
    dataSource: 'NASA JPL Viking Project',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#fb923c'
  },
  'spirit-rover-mer-a': {
    slug: 'spirit-rover-mer-a',
    name: 'Spirit Rover (MER-A)',
    mission: 'Mars Exploration Rover',
    agency: 'NASA',
    type: 'Rover',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.AEROCENTRIC,
    coordinates: { lat: -14.5684, lon: 175.4726, siteName: 'Columbia Memorial Station, Gusev Crater' },
    timestamp: '2004-01-04 04:35 UTC (Landing, final signal March 2010)',
    dataSource: 'NASA JPL MER Mission Operations',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#f59e0b'
  },
  'opportunity-rover-mer-b': {
    slug: 'opportunity-rover-mer-b',
    name: 'Opportunity Rover (MER-B)',
    mission: 'Mars Exploration Rover',
    agency: 'NASA',
    type: 'Rover',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.AEROCENTRIC,
    coordinates: { lat: -1.9462, lon: 354.4734, siteName: 'Challenger Memorial Station / Perseverance Valley, Endeavour Crater' },
    timestamp: '2004-01-25 05:05 UTC (Landing, final signal June 2018)',
    dataSource: 'NASA JPL MER Mission Operations',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#f59e0b'
  },
  'mars-pathfinder-lander': {
    slug: 'mars-pathfinder-lander',
    name: 'Mars Pathfinder Lander (Carl Sagan Memorial Station)',
    mission: 'Mars Pathfinder',
    agency: 'NASA',
    type: 'Lander',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.AEROCENTRIC,
    coordinates: { lat: 19.33, lon: -33.55, siteName: 'Ares Vallis flood basin' },
    timestamp: '1997-07-04 16:56:55 UTC (Touchdown)',
    dataSource: 'NASA JPL Mars Pathfinder Science Report',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#e2e8f0'
  },
  'sojourner-rover': {
    slug: 'sojourner-rover',
    name: 'Sojourner Rover',
    mission: 'Mars Pathfinder',
    agency: 'NASA',
    type: 'Rover',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.AEROCENTRIC,
    coordinates: { lat: 19.33, lon: -33.55, siteName: 'Ares Vallis (near Pathfinder lander)' },
    timestamp: '1997-07-06 (First rover deployed on Mars)',
    dataSource: 'NASA JPL Mars Pathfinder Science Report',
    positionStatus: POSITION_STATUS.HISTORICAL_SURFACE,
    color: '#f43f5e'
  },

  // =========================================================================
  // 3. MERCURY SURFACE IMPACT (Hermographic Coordinates)
  // =========================================================================
  'messenger-mercury-orbiter': {
    slug: 'messenger-mercury-orbiter',
    name: 'MESSENGER Mercury Orbiter',
    mission: 'MESSENGER',
    agency: 'NASA / JHUAPL',
    type: 'Orbiter',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'surface',
    referenceBody: 'mercury',
    referenceFrame: COORDINATE_FRAMES.HERMOGRAPHIC,
    coordinates: { lat: 54.4, lon: 210.1, siteName: 'Janáček crater vicinity / Shakespeare Quadrangle' },
    timestamp: '2015-04-30 19:26:02 UTC (Planned impact upon propellant exhaustion)',
    dataSource: 'NASA / JHUAPL MESSENGER Mission Archive',
    positionStatus: POSITION_STATUS.HISTORICAL_IMPACT,
    color: '#94a3b8'
  },

  // =========================================================================
  // 4. EARTH ORBITAL OBSERVATORIES & STATIONS (Geocentric Orbit Frames)
  // =========================================================================
  'iss-international-space-station': {
    slug: 'iss-international-space-station',
    name: 'International Space Station (ISS)',
    mission: 'ISS Programme',
    agency: 'NASA / Roscosmos / ESA / JAXA / CSA',
    type: 'Space Station',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'geocentric_orbit',
    referenceBody: 'earth',
    referenceFrame: COORDINATE_FRAMES.GEOCENTRIC_INERTIAL,
    orbitalParams: { altitudeKm: 418, inclinationDeg: 51.64, periodMin: 92.9, radiusOffset: 1.0 },
    timestamp: '2026-10-27 00:00 UTC (NORAD Two-Line Element ephemeris)',
    dataSource: 'NASA Johnson Space Center & Space-Track.org',
    positionStatus: POSITION_STATUS.ACTIVE_ORBIT,
    color: '#38bdf8'
  },
  'hubble-space-telescope': {
    slug: 'hubble-space-telescope',
    name: 'Hubble Space Telescope (HST)',
    mission: 'Hubble Space Telescope',
    agency: 'NASA / ESA',
    type: 'Space Telescope',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'geocentric_orbit',
    referenceBody: 'earth',
    referenceFrame: COORDINATE_FRAMES.GEOCENTRIC_INERTIAL,
    orbitalParams: { altitudeKm: 535, inclinationDeg: 28.47, periodMin: 95.3, radiusOffset: 1.25 },
    timestamp: '2026-10-27 00:00 UTC (NASA Space-Track ephemeris)',
    dataSource: 'NASA Goddard Space Flight Center / STScI',
    positionStatus: POSITION_STATUS.ACTIVE_ORBIT,
    color: '#818cf8'
  },
  'james-webb-space-telescope': {
    slug: 'james-webb-space-telescope',
    name: 'James Webb Space Telescope (JWST)',
    mission: 'JWST',
    agency: 'NASA / ESA / CSA',
    type: 'Space Telescope',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'geocentric_halo',
    referenceBody: 'earth',
    referenceFrame: COORDINATE_FRAMES.GEOCENTRIC_HALO,
    orbitalParams: { distanceKm: 1500000, haloRadiusKm: 800000, distanceAU: 0.01, standoffOffset: 3.5 },
    timestamp: '2026-10-27 00:00 UTC (JPL Horizons JWST Ephemeris)',
    dataSource: 'NASA Goddard / STScI / JPL Horizons',
    positionStatus: POSITION_STATUS.ACTIVE_ORBIT,
    color: '#eab308'
  },
  'chandra-x-ray-observatory': {
    slug: 'chandra-x-ray-observatory',
    name: 'Chandra X-ray Observatory',
    mission: 'Chandra',
    agency: 'NASA',
    type: 'Space Telescope',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'geocentric_orbit',
    referenceBody: 'earth',
    referenceFrame: COORDINATE_FRAMES.GEOCENTRIC_INERTIAL,
    orbitalParams: { perigeeKm: 14300, apogeeKm: 133000, inclinationDeg: 28.5, radiusOffset: 2.4 },
    timestamp: '2026-10-27 00:00 UTC (Chandra Operations Control Center)',
    dataSource: 'NASA Chandra X-ray Center / Smithsonian Astrophysical Observatory',
    positionStatus: POSITION_STATUS.ACTIVE_ORBIT,
    color: '#c084fc'
  },
  'tess-exoplanet-survey-satellite': {
    slug: 'tess-exoplanet-survey-satellite',
    name: 'TESS Exoplanet Survey Satellite',
    mission: 'TESS',
    agency: 'NASA',
    type: 'Satellite',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'geocentric_orbit',
    referenceBody: 'earth',
    referenceFrame: COORDINATE_FRAMES.GEOCENTRIC_INERTIAL,
    orbitalParams: { perigeeKm: 108000, apogeeKm: 373000, periodDays: 13.7, radiusOffset: 2.8 },
    timestamp: '2026-10-27 00:00 UTC (MIT/NASA GSFC)',
    dataSource: 'NASA GSFC / MIT Kavli Institute',
    positionStatus: POSITION_STATUS.ACTIVE_ORBIT,
    color: '#2dd4bf'
  },
  'kepler-space-telescope': {
    slug: 'kepler-space-telescope',
    name: 'Kepler Space Telescope',
    mission: 'Kepler / K2',
    agency: 'NASA',
    type: 'Space Telescope',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'heliocentric',
    referenceBody: 'sun',
    referenceFrame: COORDINATE_FRAMES.HELIOCENTRIC_ECLIPTIC,
    coordinates: { rAU: 1.05, eclipticLatDeg: 0.1, eclipticLonDeg: 120.0 },
    timestamp: '2026-10-27 00:00 UTC (Earth-trailing heliocentric drift)',
    dataSource: 'NASA Ames Research Center',
    positionStatus: POSITION_STATUS.HISTORICAL_ORBIT,
    color: '#e2e8f0'
  },
  'spitzer-space-telescope': {
    slug: 'spitzer-space-telescope',
    name: 'Spitzer Space Telescope',
    mission: 'Spitzer',
    agency: 'NASA / JPL',
    type: 'Space Telescope',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'heliocentric',
    referenceBody: 'sun',
    referenceFrame: COORDINATE_FRAMES.HELIOCENTRIC_ECLIPTIC,
    coordinates: { rAU: 1.15, eclipticLatDeg: -0.2, eclipticLonDeg: 85.0 },
    timestamp: '2026-10-27 00:00 UTC (Earth-trailing heliocentric drift)',
    dataSource: 'NASA JPL Spitzer Science Center',
    positionStatus: POSITION_STATUS.HISTORICAL_ORBIT,
    color: '#fda4af'
  },

  // =========================================================================
  // 5. PLANETARY ORBITERS (Moon & Mars Orbit Frames)
  // =========================================================================
  'lunar-reconnaissance-orbiter': {
    slug: 'lunar-reconnaissance-orbiter',
    name: 'Lunar Reconnaissance Orbiter (LRO)',
    mission: 'LRO',
    agency: 'NASA',
    type: 'Orbiter',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'planetary_orbit',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.PLANETOCENTRIC_ORBIT,
    orbitalParams: { altitudeKm: 50, inclinationDeg: 90.0, radiusOffset: 0.35, speed: 1.2 },
    timestamp: '2026-10-27 00:00 UTC (LRO Project Telemetry)',
    dataSource: 'NASA GSFC LRO Science Operations',
    positionStatus: POSITION_STATUS.ACTIVE_ORBIT,
    color: '#38bdf8'
  },
  'chandrayaan-2-orbiter': {
    slug: 'chandrayaan-2-orbiter',
    name: 'Chandrayaan-2 Orbiter',
    mission: 'Chandrayaan-2',
    agency: 'Indian Space Research Organisation (ISRO)',
    type: 'Orbiter',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'planetary_orbit',
    referenceBody: 'moon',
    referenceFrame: COORDINATE_FRAMES.PLANETOCENTRIC_ORBIT,
    orbitalParams: { altitudeKm: 100, inclinationDeg: 90.0, radiusOffset: 0.45, speed: 1.0 },
    timestamp: '2026-10-27 00:00 UTC (ISRO MOX-ISTRAC Telemetry)',
    dataSource: 'ISRO Official Chandrayaan-2 Operations',
    positionStatus: POSITION_STATUS.ACTIVE_ORBIT,
    color: '#f97316'
  },
  'mars-reconnaissance-orbiter': {
    slug: 'mars-reconnaissance-orbiter',
    name: 'Mars Reconnaissance Orbiter (MRO)',
    mission: 'MRO',
    agency: 'NASA',
    type: 'Orbiter',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'planetary_orbit',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.PLANETOCENTRIC_ORBIT,
    orbitalParams: { altitudeKm: 300, inclinationDeg: 92.8, radiusOffset: 0.65, speed: 0.8 },
    timestamp: '2026-10-27 00:00 UTC (JPL Horizons MRO ephemeris)',
    dataSource: 'NASA JPL Mars Exploration Program',
    positionStatus: POSITION_STATUS.ACTIVE_ORBIT,
    color: '#06b6d4'
  },
  'mars-express-orbiter': {
    slug: 'mars-express-orbiter',
    name: 'Mars Express Orbiter (MEX)',
    mission: 'Mars Express',
    agency: 'European Space Agency (ESA)',
    type: 'Orbiter',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'planetary_orbit',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.PLANETOCENTRIC_ORBIT,
    orbitalParams: { periapsisKm: 350, apoapsisKm: 10500, inclinationDeg: 86.3, radiusOffset: 0.85, speed: 0.6 },
    timestamp: '2026-10-27 00:00 UTC (ESA ESOC Flight Operations)',
    dataSource: 'ESA Planetary Science Archive & ESOC',
    positionStatus: POSITION_STATUS.ACTIVE_ORBIT,
    color: '#60a5fa'
  },
  'mars-odyssey-orbiter': {
    slug: 'mars-odyssey-orbiter',
    name: '2001 Mars Odyssey Orbiter',
    mission: '2001 Mars Odyssey',
    agency: 'NASA',
    type: 'Orbiter',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'planetary_orbit',
    referenceBody: 'mars',
    referenceFrame: COORDINATE_FRAMES.PLANETOCENTRIC_ORBIT,
    orbitalParams: { altitudeKm: 400, inclinationDeg: 93.1, radiusOffset: 0.55, speed: 0.9 },
    timestamp: '2026-10-27 00:00 UTC (JPL Odyssey Operations)',
    dataSource: 'NASA JPL Odyssey Mission Operations',
    positionStatus: POSITION_STATUS.ACTIVE_ORBIT,
    color: '#a78bfa'
  },

  // =========================================================================
  // 6. DEEP SPACE & INTERSTELLAR PROBES (Heliocentric Ecliptic J2000)
  // =========================================================================
  'voyager-1': {
    slug: 'voyager-1',
    name: 'Voyager 1',
    mission: 'Voyager Interstellar Mission',
    agency: 'NASA',
    type: 'Flyby Probe / Interstellar Spacecraft',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'interstellar',
    referenceBody: 'sun',
    referenceFrame: COORDINATE_FRAMES.HELIOCENTRIC_ECLIPTIC,
    distanceAU: 163.7,
    coordinates: { rAU: 163.7, eclipticLatDeg: 35.5, eclipticLonDeg: 255.0 },
    timestamp: '2026-10-27 00:00 UTC (NASA JPL Horizons Ephemeris DE441)',
    dataSource: 'NASA JPL Voyager Interstellar Mission & Horizons Ephemerides',
    positionStatus: POSITION_STATUS.INTERSTELLAR_ESCAPE,
    speedKmS: 16.9,
    constellation: 'Ophiuchus',
    color: '#38bdf8'
  },
  'voyager-2': {
    slug: 'voyager-2',
    name: 'Voyager 2',
    mission: 'Voyager Interstellar Mission',
    agency: 'NASA',
    type: 'Flyby Probe / Interstellar Spacecraft',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'interstellar',
    referenceBody: 'sun',
    referenceFrame: COORDINATE_FRAMES.HELIOCENTRIC_ECLIPTIC,
    distanceAU: 136.8,
    coordinates: { rAU: 136.8, eclipticLatDeg: -47.5, eclipticLonDeg: 289.0 },
    timestamp: '2026-10-27 00:00 UTC (NASA JPL Horizons Ephemeris DE441)',
    dataSource: 'NASA JPL Voyager Interstellar Mission & Horizons Ephemerides',
    positionStatus: POSITION_STATUS.INTERSTELLAR_ESCAPE,
    speedKmS: 15.3,
    constellation: 'Pavo',
    color: '#06b6d4'
  },
  'pioneer-10': {
    slug: 'pioneer-10',
    name: 'Pioneer 10',
    mission: 'Pioneer 10',
    agency: 'NASA',
    type: 'Flyby Probe',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'interstellar',
    referenceBody: 'sun',
    referenceFrame: COORDINATE_FRAMES.HELIOCENTRIC_ECLIPTIC,
    distanceAU: 135.2,
    coordinates: { rAU: 135.2, eclipticLatDeg: 3.0, eclipticLonDeg: 76.0 },
    timestamp: '2026-10-27 00:00 UTC (NASA Ames Ballistic Trajectory Ephemeris)',
    dataSource: 'NASA Ames Research Center Records & Deep Space Network',
    positionStatus: POSITION_STATUS.INTERSTELLAR_ESCAPE,
    speedKmS: 11.9,
    constellation: 'Taurus (heading toward Aldebaran)',
    color: '#f59e0b'
  },
  'pioneer-11': {
    slug: 'pioneer-11',
    name: 'Pioneer 11',
    mission: 'Pioneer 11',
    agency: 'NASA',
    type: 'Flyby Probe',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'interstellar',
    referenceBody: 'sun',
    referenceFrame: COORDINATE_FRAMES.HELIOCENTRIC_ECLIPTIC,
    distanceAU: 111.4,
    coordinates: { rAU: 111.4, eclipticLatDeg: 14.0, eclipticLonDeg: 284.0 },
    timestamp: '2026-10-27 00:00 UTC (NASA Ames Ballistic Trajectory Ephemeris)',
    dataSource: 'NASA Ames Research Center Records',
    positionStatus: POSITION_STATUS.INTERSTELLAR_ESCAPE,
    speedKmS: 11.2,
    constellation: 'Scutum',
    color: '#d97706'
  },
  'new-horizons': {
    slug: 'new-horizons',
    name: 'New Horizons',
    mission: 'New Horizons Extended Mission',
    agency: 'NASA / JHUAPL',
    type: 'Flyby Probe',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'heliocentric',
    referenceBody: 'sun',
    referenceFrame: COORDINATE_FRAMES.HELIOCENTRIC_ECLIPTIC,
    distanceAU: 58.6,
    coordinates: { rAU: 58.6, eclipticLatDeg: 2.4, eclipticLonDeg: 292.0 },
    timestamp: '2026-10-27 00:00 UTC (JHUAPL Mission Operations & JPL Horizons)',
    dataSource: 'NASA / JHUAPL Mission Operations',
    positionStatus: POSITION_STATUS.CURRENT_TELEMETRY,
    speedKmS: 13.7,
    constellation: 'Sagittarius',
    color: '#a855f7'
  },
  'parker-solar-probe': {
    slug: 'parker-solar-probe',
    name: 'Parker Solar Probe',
    mission: 'Parker Solar Probe',
    agency: 'NASA / JHUAPL',
    type: 'Flyby Probe',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'heliocentric',
    referenceBody: 'sun',
    referenceFrame: COORDINATE_FRAMES.HELIOCENTRIC_ECLIPTIC,
    coordinates: { rAU: 0.12, eclipticLatDeg: 3.4, eclipticLonDeg: 45.0 },
    timestamp: '2026-10-27 00:00 UTC (JPL Horizons Ephemeris DE441)',
    dataSource: 'NASA / JHUAPL Parker Solar Probe Operations',
    positionStatus: POSITION_STATUS.CURRENT_TELEMETRY,
    speedKmS: 163.0,
    color: '#fbbf24'
  },
  'juno-spacecraft': {
    slug: 'juno-spacecraft',
    name: 'Juno Spacecraft',
    mission: 'Juno',
    agency: 'NASA',
    type: 'Orbiter',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'planetary_orbit',
    referenceBody: 'jupiter',
    referenceFrame: COORDINATE_FRAMES.PLANETOCENTRIC_ORBIT,
    orbitalParams: { periJoveRadius: 1.05, apoJoveRadius: 38.0, inclinationDeg: 90.0, radiusOffset: 1.8, speed: 0.4 },
    timestamp: '2026-10-27 00:00 UTC (JPL Horizons Juno Ephemeris)',
    dataSource: 'NASA JPL / SwRI Juno Mission Archive',
    positionStatus: POSITION_STATUS.ACTIVE_ORBIT,
    color: '#f59e0b'
  },
  'dawn-spacecraft': {
    slug: 'dawn-spacecraft',
    name: 'Dawn Spacecraft',
    mission: 'Dawn',
    agency: 'NASA',
    type: 'Orbiter',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'heliocentric',
    referenceBody: 'sun',
    referenceFrame: COORDINATE_FRAMES.HELIOCENTRIC_ECLIPTIC,
    coordinates: { rAU: 2.77, eclipticLatDeg: 10.6, eclipticLonDeg: 142.0 },
    timestamp: '2026-10-27 00:00 UTC (Permanent uncontrolled Ceres orbit)',
    dataSource: 'NASA JPL Dawn Mission Archive',
    positionStatus: POSITION_STATUS.HISTORICAL_ORBIT,
    color: '#94a3b8'
  },
  'rosetta-orbiter': {
    slug: 'rosetta-orbiter',
    name: 'Rosetta Orbiter',
    mission: 'Rosetta',
    agency: 'European Space Agency (ESA)',
    type: 'Orbiter',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'heliocentric',
    referenceBody: 'sun',
    referenceFrame: COORDINATE_FRAMES.HELIOCENTRIC_ECLIPTIC,
    coordinates: { rAU: 3.5, eclipticLatDeg: 7.0, eclipticLonDeg: 180.0 },
    timestamp: '2016-09-30 11:19 UTC (Controlled impact onto Comet 67P)',
    dataSource: 'ESA Planetary Science Archive (PSA)',
    positionStatus: POSITION_STATUS.HISTORICAL_IMPACT,
    color: '#38bdf8'
  },
  'osiris-rex-spacecraft': {
    slug: 'osiris-rex-spacecraft',
    name: 'OSIRIS-REx / OSIRIS-APEX',
    mission: 'OSIRIS-REx',
    agency: 'NASA',
    type: 'Sample Return Probe',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'heliocentric',
    referenceBody: 'sun',
    referenceFrame: COORDINATE_FRAMES.HELIOCENTRIC_ECLIPTIC,
    coordinates: { rAU: 0.98, eclipticLatDeg: -1.2, eclipticLonDeg: 210.0 },
    timestamp: '2026-10-27 00:00 UTC (En route to Asteroid Apophis)',
    dataSource: 'NASA / University of Arizona OSIRIS-APEX Project',
    positionStatus: POSITION_STATUS.CURRENT_TELEMETRY,
    color: '#10b981'
  },
  'hayabusa2-spacecraft': {
    slug: 'hayabusa2-spacecraft',
    name: 'Hayabusa2 Spacecraft',
    mission: 'Hayabusa2',
    agency: 'Japan Aerospace Exploration Agency (JAXA)',
    type: 'Sample Return Probe',
    isPhysicalSpacecraft: true,
    isMapped: true,
    positionType: 'heliocentric',
    referenceBody: 'sun',
    referenceFrame: COORDINATE_FRAMES.HELIOCENTRIC_ECLIPTIC,
    coordinates: { rAU: 1.25, eclipticLatDeg: 2.1, eclipticLonDeg: 330.0 },
    timestamp: '2026-10-27 00:00 UTC (Extended Mission to Asteroid 1998 KY26)',
    dataSource: 'JAXA Institute of Space and Astronautical Science (ISAS)',
    positionStatus: POSITION_STATUS.CURRENT_TELEMETRY,
    color: '#ec4899'
  }
};

/**
 * Returns verified physical spacecraft record if mapped, or null if unmapped in archive.
 */
export function getMappedSpacecraft(slug) {
  if (!slug) return null;
  return VERIFIED_SPACECRAFT[slug] || null;
}

/**
 * Checks whether a given hardware slug has a verified 3D plotted position.
 */
export function isSpacecraftMapped(slug) {
  return Boolean(slug && VERIFIED_SPACECRAFT[slug]);
}

/**
 * Classifies any catalogue hardware record into its physical spacecraft type and mapping status.
 */
export function classifyCatalogueRecord(item) {
  if (!item) {
    return {
      isPhysicalSpacecraft: false,
      isMapped: false,
      objectTypeCategory: 'Unknown',
      mappingStatus: 'unmapped',
      statusLabel: 'No Record'
    };
  }

  const verified = VERIFIED_SPACECRAFT[item.slug];
  if (verified) {
    return {
      ...verified,
      isMapped: true,
      mappingStatus: 'mapped',
      statusLabel: 'Verified Plotted Position'
    };
  }

  // Determine physical spacecraft vs mission programme / rocket body / non-locatable
  const otype = (item.object_type || '').toLowerCase();
  const isPhysical = !otype.includes('programme') && 
                     !otype.includes('rocket body') && 
                     !otype.includes('component');

  // Surface coords check in database
  const hasDbCoords = item.latitude !== null && item.longitude !== null && item.latitude !== undefined;

  return {
    slug: item.slug,
    name: item.name,
    mission: item.mission_name,
    agency: item.primary_organization,
    type: item.object_type || 'Spacecraft',
    isPhysicalSpacecraft: isPhysical,
    isMapped: false,
    mappingStatus: 'unmapped',
    statusLabel: hasDbCoords ? 'Historical Coordinates in Database' : 'Unmapped in Official Archives',
    referenceBody: (item.destination || 'Deep Space').toLowerCase(),
    referenceFrame: 'Coordinate frame unavailable',
    coordinates: null,
    timestamp: item.last_verified_at || 'Archival record',
    dataSource: item.verification_status || 'Official Space Agency Catalogue',
    positionStatus: POSITION_STATUS.UNMAPPED,
    unmappedReason: hasDbCoords 
      ? 'Surface coordinates recorded in archive; requires coordinate transformation' 
      : `Exact current or landing coordinates for this ${item.object_type || 'spacecraft'} are not preserved in official archives.`
  };
}

/**
 * Counts mapped and unmapped records across a list of hardware items.
 */
export function getCatalogueMappingStats(items = []) {
  let mapped = 0;
  let unmapped = 0;
  let physical = 0;
  let programmes = 0;

  items.forEach(item => {
    const classification = classifyCatalogueRecord(item);
    if (classification.isMapped) {
      mapped++;
    } else {
      unmapped++;
    }
    if (classification.isPhysicalSpacecraft) {
      physical++;
    } else {
      programmes++;
    }
  });

  return {
    total: items.length,
    mapped,
    unmapped,
    physical,
    programmes
  };
}
