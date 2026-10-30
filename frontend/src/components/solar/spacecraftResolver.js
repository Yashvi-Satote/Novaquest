import { VERIFIED_SPACECRAFT } from './spacecraftRegistry.js';
import { INTERSTELLAR_PROBES } from './interstellarData.js';
import { getSpacecraftModelSpec } from './spacecraftModelRegistry.js';

/**
 * Normalizes user / URL slug to canonical spacecraft identifier
 */
export const SLUG_ALIASES = {
  'voyager-1': 'voyager-1',
  'voyager-2': 'voyager-2',
  'voyager': 'voyager-1',
  'pioneer-10': 'pioneer-10',
  'pioneer-11': 'pioneer-11',
  'pioneer': 'pioneer-10',
  'perseverance': 'perseverance-rover',
  'perseverance-rover': 'perseverance-rover',
  'curiosity': 'curiosity-rover',
  'curiosity-rover': 'curiosity-rover',
  'james-webb': 'james-webb-space-telescope',
  'jwst': 'james-webb-space-telescope',
  'james-webb-space-telescope': 'james-webb-space-telescope',
  'hubble': 'hubble-space-telescope',
  'hubble-space-telescope': 'hubble-space-telescope',
  'parker': 'parker-solar-probe',
  'parker-solar-probe': 'parker-solar-probe',
  'new-horizons': 'new-horizons',
  'cassini': 'cassini-orbiter',
  'cassini-orbiter': 'cassini-orbiter',
  'juno': 'juno-spacecraft',
  'juno-spacecraft': 'juno-spacecraft',
  'juno-orbiter': 'juno-spacecraft',
  'mro': 'mars-reconnaissance-orbiter',
  'mars-reconnaissance-orbiter': 'mars-reconnaissance-orbiter',
  'galileo': 'galileo-orbiter',
  'galileo-orbiter': 'galileo-orbiter',
  'osiris-rex': 'osiris-rex-spacecraft',
  'osiris-rex-spacecraft': 'osiris-rex-spacecraft',
  'rosetta': 'rosetta-orbiter',
  'rosetta-orbiter': 'rosetta-orbiter',
  'apollo-11': 'apollo-11-lm-descent-stage',
  'apollo-11-lm-descent-stage': 'apollo-11-lm-descent-stage',
  'chandrayaan-3': 'vikram-lander-chandrayaan-3',
  'vikram-lander-chandrayaan-3': 'vikram-lander-chandrayaan-3',
  'pragyan-rover-chandrayaan-3': 'pragyan-rover-chandrayaan-3',
  'iss': 'international-space-station',
  'international-space-station': 'international-space-station',
  'ingenuity': 'ingenuity-helicopter',
  'ingenuity-helicopter': 'ingenuity-helicopter',
  'opportunity': 'opportunity-rover',
  'mer-opportunity': 'opportunity-rover',
  'spirit': 'spirit-rover',
  'europa-clipper': 'europa-clipper',
  'juice': 'juice-spacecraft',
  'juice-spacecraft': 'juice-spacecraft',
  'hayabusa2': 'hayabusa2-spacecraft',
  'hayabusa2-spacecraft': 'hayabusa2-spacecraft'
};

/**
 * Rich Archival Telemetry & Scientific Encyclopedia
 * Serves verified mission information for dedicated 3D spacecraft inspection.
 */
export const ARCHIVAL_SPACECRAFT_DATA = {
  'voyager-1': {
    name: 'Voyager 1',
    missionName: 'Voyager Interstellar Mission',
    agency: 'National Aeronautics and Space Administration (NASA)',
    launchDate: '1977-09-05',
    status: 'Active (Interstellar Mission)',
    destination: 'Interstellar Space / Heliopause Escape',
    objectType: 'Flyby / Interstellar Deep Space Probe',
    distanceAU: 163.7,
    distanceKm: '24.5 billion km (163.7 AU)',
    referenceFrame: 'Heliocentric Ecliptic J2000',
    description: 'Voyager 1 is humanity\'s most distant robotic explorer. Launched on September 5, 1977, it conducted historic flybys of Jupiter (March 1979) and Saturn (November 1980), providing the first high-resolution imagery of Jovian atmospheric dynamics, active volcanism on Io, and Saturn\'s intricate ring structures. In August 2012, Voyager 1 crossed the Heliopause (~121 AU) into the local interstellar medium (ISM), directly sampling interstellar plasma and galactic cosmic rays.',
    objectives: [
      'Conduct close-up comparative exploration of the Jupiter and Saturn planetary systems.',
      'Investigate the physical properties, atmospheric composition, and magnetospheres of Jupiter and Saturn.',
      'Perform detailed close flyby of Saturn\'s giant moon Titan to assess its dense nitrogen atmosphere.',
      'Sample the boundary of the solar magnetic bubble (Heliopause) and measure the local interstellar medium (ISM).'
    ],
    discoveries: [
      'Discovered active volcanism on Jupiter\'s moon Io, identifying the first active extraterrestrial volcanoes.',
      'Discovered Jupiter\'s faint dusty ring system and two previously unknown Jovian moons (Thebe and Metis).',
      'Revealed intricate spoke structures, braids, and thousands of distinct ringlets across Saturn\'s rings.',
      'Crossed the Heliopause on August 25, 2012, confirming the density jump of cold interstellar plasma (121.6 AU).'
    ],
    instruments: [
      { name: 'Imaging Science Subsystem (ISS)', role: 'Narrow and wide-angle cameras for high-resolution planetary imaging.' },
      { name: 'Triaxial Fluxgate Magnetometer (MAG)', role: 'Measures magnetic fields of Jupiter, Saturn, and interstellar medium.' },
      { name: 'Plasma Wave Subsystem (PWS)', role: 'Detects electron density waves and plasma oscillations in interstellar space.' },
      { name: 'Cosmic Ray Subsystem (CRS)', role: 'Measures high-energy galactic cosmic rays and solar energetic particles.' },
      { name: 'Low-Energy Charged Particle (LECP)', role: 'Detects low-energy ions and electrons in planetary magnetospheres.' },
      { name: 'Radioisotope Thermoelectric Generators (RTGs)', role: 'Three plutonium-238 RTG power units providing operational electrical power.' }
    ],
    timeline: [
      { date: '1977-09-05', event: 'Launched from Cape Canaveral LC-41 aboard Titan IIIE-Centaur.' },
      { date: '1979-03-05', event: 'Closest approach to Jupiter (349,000 km); discovers Io active volcanism.' },
      { date: '1980-11-12', event: 'Closest approach to Saturn (124,000 km) and Titan close flyby (6,490 km).' },
      { date: '1990-02-14', event: 'Takes the iconic "Pale Blue Dot" solar system family portrait.' },
      { date: '2004-12-16', event: 'Crosses the Termination Shock (~94 AU).' },
      { date: '2012-08-25', event: 'Crosses the Heliopause (~121.6 AU) entering interstellar space.' }
    ],
    components: [
      { id: 'antenna', label: 'High-Gain Antenna (HGA)', pos: [0, 0.8, 0], desc: '3.66-meter Cassegrain parabolic reflector communicating via S-band and X-band with NASA\'s Deep Space Network.' },
      { id: 'rtg', label: 'RTG Power Generator', pos: [1.8, -0.6, 0.8], desc: 'Three SNAP-19 Radioisotope Thermoelectric Generators producing continuous thermal power from plutonium-238 decay.' },
      { id: 'mag', label: 'Magnetometer Boom', pos: [-2.2, 1.2, -1.2], desc: '13-meter deployable fiberglass boom isolating delicate dual fluxgate magnetometers from spacecraft magnetic interference.' },
      { id: 'scan', label: 'Science Scan Platform', pos: [0, 0.5, -1.5], desc: 'Articulated platform carrying the ISS cameras, infrared spectrometer (IRIS), and ultraviolet spectrometer (UVS).' }
    ],
    officialLinks: [
      { label: 'NASA Voyager Mission Home', url: 'https://voyager.jpl.nasa.gov/' },
      { label: 'NASA 3D Resources Voyager Model', url: 'https://science.nasa.gov/resource/voyager-3d-model/' },
      { label: 'JPL Horizons Ephemeris System', url: 'https://ssd.jpl.nasa.gov/horizons/' }
    ]
  },

  'perseverance-rover': {
    name: 'Perseverance Rover (Mars 2020)',
    missionName: 'Mars 2020',
    agency: 'National Aeronautics and Space Administration (NASA)',
    launchDate: '2020-07-30',
    status: 'Active / Operational on Mars',
    destination: 'Jezero Crater, Mars',
    objectType: 'Planetary Surface Astrobiology Rover',
    referenceFrame: 'Aerocentric (IAU Mars Fixed, East Longitude)',
    description: 'Perseverance is NASA\'s flagship Mars exploration rover, exploring Jezero Crater—an ancient lake-delta system that once held liquid water approximately 3.7 billion years ago. Equipped with an advanced sample-caching system, robotic arm, coring drill, and Raman/fluorescence spectrometers, Perseverance is searching for biosignatures of ancient microbial life and packaging sealed rock cores for future return to Earth.',
    objectives: [
      'Identify past habitable environments and seek biosignatures of ancient microbial Martian life.',
      'Collect and seal a diverse suite of rock and regolith core samples for future Mars Sample Return.',
      'Demonstrate in-situ oxygen production from the Martian carbon-dioxide atmosphere using MOXIE.',
      'Characterize environmental and meteorological conditions to prepare for future human Mars exploration.'
    ],
    discoveries: [
      'Confirmed Jezero Crater was fed by an ancient river forming a prominent delta inside an ancient lake basin.',
      'Extracted and sealed over 20 scientifically diverse rock core samples including igneous and deltaic sedimentary rocks.',
      'Demonstrated extraction of breathable oxygen from Martian CO2 via MOXIE at 12 g/hr, surpassing mission requirements.',
      'Discovered diverse organic molecules in sedimentary mudstones using the SHERLOC deep-UV Raman instrument.'
    ],
    instruments: [
      { name: 'Mastcam-Z', role: 'Dual-lens multispectral stereoscopic zoom cameras mounted on the remote sensing mast.' },
      { name: 'SuperCam', role: 'Laser-induced breakdown spectroscopy (LIBS), Raman spectrometer, and visible/IR sensors.' },
      { name: 'PIXL', role: 'Planetary Instrument for X-ray Lithochemistry measuring fine-scale elemental chemistry.' },
      { name: 'SHERLOC', role: 'Scanning Habitable Environments with Raman & Luminescence for Organics & Chemicals.' },
      { name: 'MOXIE', role: 'Mars Oxygen In-Situ Resource Utilization Experiment producing pure O2 from Martian CO2.' },
      { name: 'MEDA', role: 'Mars Environmental Dynamics Analyzer measuring temperature, pressure, wind, and dust.' }
    ],
    timeline: [
      { date: '2020-07-30', event: 'Launched from Cape Canaveral SLC-41 aboard Atlas V 541.' },
      { date: '2021-02-18', event: 'Flawless Sky Crane touchdown at Octavia E. Butler Landing in Jezero Crater.' },
      { date: '2021-04-03', event: 'Deployed Ingenuity Mars Helicopter onto the Martian surface.' },
      { date: '2021-09-01', event: 'Successfully cored and sealed first Martian rock sample ("Montdenier").' },
      { date: '2023-01-28', event: 'Completed the Three Forks Sample Depot, placing 10 backup sample tubes on the Martian surface.' }
    ],
    components: [
      { id: 'mast', label: 'Remote Sensing Mast (Mastcam-Z & SuperCam)', pos: [0, 1.2, 0.4], desc: 'Elevated mast providing 360-degree panoramic stereo imaging, laser spectroscopic analysis, and atmospheric acoustics.' },
      { id: 'arm', label: 'Robotic Turret Arm (PIXL & SHERLOC)', pos: [0.6, 0.3, 1.1], desc: '2.1-meter five-degree-of-freedom titanium robotic arm carrying core drill and close-up spectrometers.' },
      { id: 'wheels', label: 'Rocker-Bogie Suspension System', pos: [0, -0.4, 0], desc: 'Six cleated aluminum wheels with individual steer motors capable of traversing 40-centimeter boulders.' },
      { id: 'moxie', label: 'MOXIE Internal Reactor', pos: [0, 0.2, -0.3], desc: 'Solid oxide electrolysis reactor converting atmospheric CO2 into breathable oxygen at high temperatures (800°C).' }
    ],
    officialLinks: [
      { label: 'NASA Mars 2020 Mission Page', url: 'https://mars.nasa.gov/mars2020/' },
      { label: 'NASA 3D Resources Perseverance Model', url: 'https://nasa3d.arc.nasa.gov/detail/perseverance' }
    ]
  },

  'james-webb-space-telescope': {
    name: 'James Webb Space Telescope (JWST)',
    missionName: 'James Webb Space Telescope',
    agency: 'NASA / European Space Agency (ESA) / Canadian Space Agency (CSA)',
    launchDate: '2021-12-25',
    status: 'Active / Operational in L2 Halo Orbit',
    destination: 'Sun-Earth Lagrange Point 2 (1.5 million km from Earth)',
    objectType: 'Infrared Space Observatory',
    referenceFrame: 'Sun-Earth L2 Lagrange Halo Coordinate Frame',
    description: 'The James Webb Space Telescope is the premier space observatory of the 21st century. Operating in a halo orbit around the Sun-Earth L2 Lagrange point, JWST uses its 6.5-meter gold-coated beryllium primary mirror and five-layer tennis-court-sized Kapton sunshield to detect faint infrared light from the very first galaxies formed after the Big Bang, examine exoplanet atmospheres, and pierce dense stellar nurseries.',
    objectives: [
      'Search for the first galaxies and luminous objects formed after the Big Bang (Cosmic Dawn).',
      'Determine how galaxies evolved from their formation until the present day.',
      'Observe the formation of stars from initial collapse to the birth of planetary systems.',
      'Characterize exoplanetary atmospheres and search for atmospheric biomarkers (H2O, CH4, CO2).'
    ],
    discoveries: [
      'Observed JADES-GS-z14-0, the most distant confirmed galaxy, existing just 290 million years after the Big Bang.',
      'Detected atmospheric carbon dioxide, methane, and water vapor in transmission spectra of WASP-96b and K2-18b.',
      'Resolved star-forming clusters and protostellar jets inside the Pillars of Creation in unprecedented infrared detail.',
      'Identified supermassive black holes in the early universe with masses far larger than previously theorized.'
    ],
    instruments: [
      { name: 'NIRCam', role: 'Near-Infrared Camera detecting 0.6 to 5 micron light for deep-field cosmology.' },
      { name: 'NIRSpec', role: 'Near-Infrared Spectrograph capable of observing 100 simultaneous galaxy spectra via microshutter arrays.' },
      { name: 'MIRI', role: 'Mid-Infrared Instrument with cryocooler operating at 7 Kelvin (-266°C) for 5 to 28 micron imaging.' },
      { name: 'FGS / NIRISS', role: 'Fine Guidance Sensor and Near-Infrared Imager and Slitless Spectrograph for precision tracking.' }
    ],
    timeline: [
      { date: '2021-12-25', event: 'Launched aboard Ariane 5 from CSG Kourou, French Guiana on a perfect injection trajectory.' },
      { date: '2022-01-08', event: 'Fully deployed 6.5-meter golden primary mirror wings in deep space.' },
      { date: '2022-01-24', event: 'Inserted into operational halo orbit around Sun-Earth L2 (1.5 million km).' },
      { date: '2022-07-12', event: 'Released first full-color scientific images, including SMACS 0723 Deep Field.' }
    ],
    components: [
      { id: 'mirror', label: 'Gold-Coated Primary Mirror', pos: [0, 0.6, 0.4], desc: '18 hexagonal beryllium mirror segments coated in 100-nanometer vapor-deposited gold, spanning 6.5 meters.' },
      { id: 'sunshield', label: 'Five-Layer Kapton Sunshield', pos: [0, -0.6, 0], desc: 'Tennis-court-sized (21 x 14 m) sunshield blocking heat from the Sun, Earth, and Moon to keep optics at -233°C.' },
      { id: 'isim', label: 'Integrated Science Instrument Module (ISIM)', pos: [0, 0.3, -0.8], desc: 'Cryogenic module housing NIRCam, NIRSpec, MIRI, and NIRISS science detectors.' },
      { id: 'solar', label: 'Solar Power Array', pos: [0, -0.8, -1.2], desc: 'Articulated solar array continuously generating 2,000 watts of electrical power for spacecraft systems.' }
    ],
    officialLinks: [
      { label: 'NASA JWST Mission Home', url: 'https://webb.nasa.gov/' },
      { label: 'Space Telescope Science Institute (STScI)', url: 'https://www.stsci.edu/jwst' },
      { label: 'NASA 3D Resources JWST Model', url: 'https://science.nasa.gov/resource/james-webb-space-telescope-3d-model/' }
    ]
  }
};

/**
 * Resolves any slug or alias to comprehensive spacecraft data
 */
export function resolveSpacecraft(rawSlug) {
  if (!rawSlug) return null;
  const cleanSlug = rawSlug.toLowerCase().trim();
  const canonicalSlug = SLUG_ALIASES[cleanSlug] || cleanSlug;

  // 1. Check verified archive
  const archival = ARCHIVAL_SPACECRAFT_DATA[canonicalSlug] || null;

  // 2. Check verified registry
  const verified = VERIFIED_SPACECRAFT[canonicalSlug] || null;

  // 3. Check interstellar probes
  const interstellar = INTERSTELLAR_PROBES.find(p => p.slug === canonicalSlug) || null;

  // 4. Check 3D model spec
  const modelSpec = getSpacecraftModelSpec(canonicalSlug);

  // Fallback name
  const name = archival?.name || verified?.name || interstellar?.name || modelSpec?.name || cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    slug: canonicalSlug,
    name,
    missionName: archival?.missionName || verified?.mission || interstellar?.missionName || 'Scientific Exploration Mission',
    agency: archival?.agency || verified?.agency || 'Space Exploration Agency',
    launchDate: archival?.launchDate || verified?.timestamp?.slice(0, 10) || interstellar?.launchDate || 'Archival Record',
    status: archival?.status || verified?.positionStatus || interstellar?.status || 'Operational',
    destination: archival?.destination || verified?.referenceBody || interstellar?.constellation || 'Deep Space',
    objectType: archival?.objectType || verified?.type || (interstellar ? 'Interstellar Flyby Probe' : 'Robotic Spacecraft'),
    distanceKm: archival?.distanceKm || (interstellar ? interstellar.distanceKm : null),
    description: archival?.description || interstellar?.description || `Authentic space exploration mission ${name}, carrying advanced scientific instrumentation.`,
    objectives: archival?.objectives || [
      `Execute comprehensive scientific observation and instrumentation measurements for ${name}.`,
      'Characterize orbital, planetary, or interstellar environmental parameters.',
      'Return high-fidelity telemetry, radiometric data, and scientific imagery.'
    ],
    discoveries: archival?.discoveries || [
      'Acquired pioneering high-resolution scientific data advancing planetary astrophysics.',
      'Demonstrated resilient autonomous deep-space and surface operations.'
    ],
    instruments: archival?.instruments || [
      { name: 'Primary Science Suite', role: 'Main scientific sensor package for remote sensing and spectrometry.' },
      { name: 'Communications Telemetry Subsystem', role: 'High-gain communications antenna for deep-space telemetry transmission.' },
      { name: 'Electrical Power Subsystem', role: 'Solar arrays or RTG power generating units providing continuous electrical bus power.' }
    ],
    timeline: archival?.timeline || (interstellar ? [
      { date: interstellar.launchDate, event: `Launched into high-energy interplanetary trajectory.` }
    ] : []),
    components: archival?.components || [
      { id: 'bus', label: 'Spacecraft Core Avionics Bus', pos: [0, 0, 0], desc: 'Central structure containing onboard flight computer, attitude control, and thermal regulation.' },
      { id: 'antenna', label: 'Communications Array', pos: [0, 0.8, 0], desc: 'Directional antenna transmitting science telemetry to Earth ground stations.' },
      { id: 'sensors', label: 'Primary Instrument Payload', pos: [0, -0.4, 0.8], desc: 'Scientific cameras, magnetometers, spectrometers, or surface sampling systems.' }
    ],
    officialLinks: archival?.officialLinks || [
      { label: 'NASA Science Missions', url: 'https://science.nasa.gov/missions/' },
      { label: 'NASA 3D Resources', url: 'https://nasa3d.arc.nasa.gov/' }
    ],
    modelSpec,
    isAuthenticModel: !!(modelSpec && modelSpec.isAuthenticModel),
    provenance: modelSpec?.provenance || 'Reconstructed 3D Geometric Model Fallback'
  };
}

