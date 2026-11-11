/**
 * The parts catalog stored in the NASA Headquarters storage room.
 *
 * Every entry is a real piece of hardware from one of the three spacecraft
 * featured in NovaQuest. The 3D room turns these records into clickable,
 * pixel-art sprites so visitors can browse the collection in-world.
 */
export const COMPONENT_MISSIONS = {
  surveyor: {
    code: 'SVY',
    name: 'Surveyor 5',
    era: '1967',
    accent: '#5ee7ff',
    accentSoft: 'rgba(94, 231, 255, 0.18)',
  },
  mer: {
    code: 'MER',
    name: 'Mars Exploration Rovers',
    era: '2004',
    accent: '#ffae72',
    accentSoft: 'rgba(255, 174, 114, 0.18)',
  },
  voyager: {
    code: 'VGR',
    name: 'Voyager 1 & 2',
    era: '1977',
    accent: '#c8a8ff',
    accentSoft: 'rgba(200, 168, 255, 0.18)',
  },
};

const buildComponent = (missionKey, component) => {
  const mission = COMPONENT_MISSIONS[missionKey];
  return {
    ...component,
    mission: missionKey,
    missionCode: mission.code,
    missionName: mission.name,
    missionEra: mission.era,
    accent: mission.accent,
    accentSoft: mission.accentSoft,
  };
};

const surveyor = (component) => buildComponent('surveyor', component);
const mer = (component) => buildComponent('mer', component);
const voyager = (component) => buildComponent('voyager', component);

export const STORAGE_ROOM_COMPONENTS = [
  // ---------------------------------------------------------------- Surveyor 5
  surveyor({
    id: 'surveyor-triangular-frame',
    name: 'Triangular Aluminum Frame',
    short: 'ALUMINUM FRAME',
    category: 'Structure',
    sprite: 'frame',
    color: '#9fc6d8',
    description:
      "The open triangular aluminum honeycomb frame is Surveyor 5's primary structure. It carries the spherical propellant tanks, electronics, and landing gear while keeping the lander as light as possible.",
  }),
  surveyor({
    id: 'surveyor-landing-legs',
    name: 'Three Landing Legs with Footpads',
    short: 'LANDING LEGS',
    category: 'Structure',
    sprite: 'legs',
    color: '#b8cad2',
    description:
      'Three tubular aluminum legs unfold after launch and absorb touchdown energy through crushable honeycomb struts. Their wide footpads spread the load so the lander does not sink into lunar dust.',
  }),
  surveyor({
    id: 'surveyor-retrorocket',
    name: 'Main Retrorocket (Solid-Fuel)',
    short: 'RETROROCKET',
    category: 'Propulsion',
    sprite: 'retrorocket',
    color: '#ffb15e',
    description:
      "A Thiokol TE-M-364 solid-fuel retrorocket fires for about 40 seconds to cancel most of Surveyor 5's velocity. It is then jettisoned so the lander can finish its descent on the vernier engines.",
  }),
  surveyor({
    id: 'surveyor-vernier-thrusters',
    name: 'Vernier Thrusters (Liquid-Fuel)',
    short: 'VERNIERS',
    category: 'Propulsion',
    sprite: 'vernier',
    color: '#ff8d6b',
    description:
      'Three throttleable liquid-fuel vernier engines provide steering and terminal descent. They let Surveyor 5 hover, translate sideways, and settle onto the Moon gently enough to survive.',
  }),
  surveyor({
    id: 'surveyor-altitude-radar',
    name: 'Altitude Marking Radar / Doppler Radar',
    short: 'RADAR',
    category: 'Avionics',
    sprite: 'radar',
    color: '#74e0ff',
    description:
      "Radar altimeters and a Doppler velocity sensor measured height and horizontal drift during descent. Their data told Surveyor 5's autopilot exactly when to cut the retrorocket and begin the final powered descent.",
  }),
  surveyor({
    id: 'surveyor-solar-panel',
    name: 'Solar Panel',
    short: 'SOLAR PANEL',
    category: 'Power',
    sprite: 'solar',
    color: '#6ba7ff',
    description:
      'A steerable planar array of solar cells recharged the batteries and supplied about 85 watts during the lunar day. It could be turned toward the Sun as the Moon rotated beneath it.',
  }),
  surveyor({
    id: 'surveyor-battery',
    name: 'Battery',
    short: 'BATTERY',
    category: 'Power',
    sprite: 'battery',
    color: '#7cf0b4',
    description:
      'Silver-zinc rechargeable batteries stored energy for the descent, peak communications, and the long lunar night, when the solar panel could no longer generate power.',
  }),
  surveyor({
    id: 'surveyor-high-gain-antenna',
    name: 'Planar High-Gain Antenna',
    short: 'HIGH-GAIN ANT.',
    category: 'Communications',
    sprite: 'phasedArray',
    color: '#b8ecff',
    description:
      "A directional planar-array high-gain antenna sent Surveyor 5's television pictures and telemetry to Earth's Deep Space Network at high data rates.",
  }),
  surveyor({
    id: 'surveyor-omni-antennas',
    name: 'Omnidirectional Antennas',
    short: 'OMNI ANTENNAS',
    category: 'Communications',
    sprite: 'omni',
    color: '#c9d8e3',
    description:
      'Two conical omnidirectional antennas gave 360-degree radio coverage during launch, cruise, and attitude changes, so mission control never lost contact with the lander.',
  }),
  surveyor({
    id: 'surveyor-tv-camera',
    name: 'Television Camera',
    short: 'TV CAMERA',
    category: 'Science',
    sprite: 'tvCamera',
    color: '#ffc85e',
    description:
      'A slow-scan vidicon camera with a rotating mirror scanned the lunar panorama and returned 19,118 images. It could zoom and switch filters to study the surface in detail.',
  }),
  surveyor({
    id: 'surveyor-alpha-scattering',
    name: 'Alpha-Scattering Instrument',
    short: 'ALPHA SCOPE',
    category: 'Science',
    sprite: 'alpha',
    color: '#d39bff',
    description:
      "Curium-242 alpha particles bombarded the soil, and detectors measured the energies of the scattered particles to identify chemical elements. It produced the first chemical analysis of another world's surface.",
  }),
  surveyor({
    id: 'surveyor-soil-sampler',
    name: 'Soil Mechanics Surface Sampler (on other Surveyors, not 5)',
    short: 'SOIL SAMPLER',
    category: 'Science · Surveyor 3 & 7',
    sprite: 'scoop',
    color: '#ffd27a',
    description:
      'A motorized scoop and trencher flew on Surveyor 3 and Surveyor 7, but not on Surveyor 5. It was omitted to save mass for the heavy alpha-scattering experiment. This stored unit represents the sampler used by the other Surveyors.',
  }),
  surveyor({
    id: 'surveyor-footpad-magnet',
    name: 'Magnet (on a Footpad)',
    short: 'FOOTPAD MAGNET',
    category: 'Science',
    sprite: 'magnet',
    color: '#ff7a8a',
    description:
      "A small horseshoe magnet attached to footpad 2 collected magnetic dust as the lander touched down. It helped scientists test whether lunar soil contains free iron and other magnetic minerals.",
  }),
  surveyor({
    id: 'surveyor-thermal-compartments',
    name: 'Thermal Compartments and Sensors',
    short: 'THERMAL SYSTEM',
    category: 'Thermal',
    sprite: 'thermal',
    color: '#e9f2ff',
    description:
      "Polished thermal shields, louvers, and temperature sensors protected batteries and electronics from the Moon's extreme cycle of roughly +120°C in daylight and -170°C at night.",
  }),
  surveyor({
    id: 'surveyor-star-sun-sensor',
    name: 'Star Tracker (Canopus Sensor) and Sun Sensor',
    short: 'STAR / SUN SENSOR',
    category: 'Guidance',
    sprite: 'starTracker',
    color: '#ffe680',
    description:
      "Sun sensors and a Canopus star tracker used the Sun and the bright star Canopus as celestial references. Together they held Surveyor 5's attitude steady during the cruise to the Moon.",
  }),
  surveyor({
    id: 'surveyor-warm-electronics-box',
    name: 'Body (Warm Electronics Box)',
    short: 'ELECTRONICS BOX',
    category: 'Structure',
    sprite: 'warmBox',
    color: '#b9d7e5',
    description:
      "The central warm electronics box housed Surveyor 5's transmitters, command systems, and scientific electronics. Thermal blankets and internal heaters kept the box within its operating temperature range.",
  }),

  // ------------------------------------------------- Mars Exploration Rovers
  mer({
    id: 'mer-rocker-bogie-wheels',
    name: 'Six Wheels with Rocker-Bogie Suspension',
    short: 'ROCKER-BOGIE',
    category: 'Mobility',
    sprite: 'rockerBogie',
    color: '#f4c07a',
    description:
      'Six cleated aluminum wheels, each with its own drive motor, ride on a rocker-bogie suspension. The design lets Spirit and Opportunity climb rocks and keep all six wheels grounded on uneven terrain.',
  }),
  mer({
    id: 'mer-solar-panels',
    name: 'Solar Panels',
    short: 'SOLAR ARRAYS',
    category: 'Power',
    sprite: 'roverSolar',
    color: '#6f9dff',
    description:
      'Large gallium-arsenide solar arrays on the rover deck generated up to about 900 watt-hours per sol, powering driving, instruments, and heaters. Dust accumulation gradually reduced their output.',
  }),
  mer({
    id: 'mer-batteries',
    name: 'Batteries',
    short: 'BATTERY PACK',
    category: 'Power',
    sprite: 'roverBattery',
    color: '#6ce6ae',
    description:
      'Rechargeable lithium-ion batteries buffered the solar array, storing energy for driving and for the overnight survival heating that kept the rover electronics alive on cold Martian nights.',
  }),
  mer({
    id: 'mer-pancam',
    name: 'Pancam (Panoramic Camera)',
    short: 'PANCAM',
    category: 'Science',
    sprite: 'pancam',
    color: '#ffcf6e',
    description:
      'The Panoramic Camera is a stereo pair of high-resolution cameras on the rover mast. Its filters helped identify minerals, study rocks, and calibrate color under the Martian sky.',
  }),
  mer({
    id: 'mer-navcam',
    name: 'Navcam (Navigation Cameras)',
    short: 'NAVCAM',
    category: 'Navigation',
    sprite: 'navcam',
    color: '#c6d8e6',
    description:
      'Navigation cameras on the mast provided wide-angle black-and-white views used by the rover team to plan drives and avoid hazards.',
  }),
  mer({
    id: 'mer-hazcams',
    name: 'Hazcams (Hazard Cameras)',
    short: 'HAZCAMS',
    category: 'Navigation',
    sprite: 'hazcam',
    color: '#a9b9c9',
    description:
      'Four hazard-avoidance cameras—two at the front and two at the rear—watched the ground close to the wheels. They could stop the rover if it approached a dangerous drop or obstacle.',
  }),
  mer({
    id: 'mer-mini-tes',
    name: 'Mini-TES (Thermal Emission Spectrometer)',
    short: 'MINI-TES',
    category: 'Science',
    sprite: 'miniTes',
    color: '#ff9b6b',
    description:
      'The miniature Thermal Emission Spectrometer measured infrared radiation from rocks and soil, revealing their mineral composition from a distance without touching them.',
  }),
  mer({
    id: 'mer-mossbauer',
    name: 'Mössbauer Spectrometer',
    short: 'MÖSSBAUER',
    category: 'Science',
    sprite: 'mossbauer',
    color: '#ffbd8a',
    description:
      'A Mössbauer spectrometer on the robotic arm identified iron-bearing minerals in rocks and soil by measuring how their nuclei absorb gamma rays.',
  }),
  mer({
    id: 'mer-apxs',
    name: 'Alpha Particle X-ray Spectrometer (APXS)',
    short: 'APXS',
    category: 'Science',
    sprite: 'apxs',
    color: '#ffda8c',
    description:
      'The Alpha Particle X-ray Spectrometer used radioactive curium sources to excite samples and measured the emitted X-rays and alpha particles, determining the elemental chemistry of rocks and soil.',
  }),
  mer({
    id: 'mer-microscopic-imager',
    name: 'Microscopic Imager',
    short: 'MICRO IMAGER',
    category: 'Science',
    sprite: 'microscope',
    color: '#d8ecff',
    description:
      'A focusable microscope on the robotic arm produced close-up images of rock textures, grains, and dust at a scale finer than the human eye can resolve.',
  }),
  mer({
    id: 'mer-rock-abrasion-tool',
    name: 'Rock Abrasion Tool (RAT)',
    short: 'RAT',
    category: 'Science',
    sprite: 'rat',
    color: '#ffd05c',
    description:
      'The Rock Abrasion Tool used diamond-tipped grinding heads to grind a shallow hole in rock, exposing fresh interior material for the spectrometers and microscopic imager.',
  }),
  mer({
    id: 'mer-robotic-arm',
    name: 'Robotic Arm',
    short: 'ROBOTIC ARM',
    category: 'Robotics',
    sprite: 'arm',
    color: '#e9c08b',
    description:
      'The five-degree-of-freedom Instrument Deployment Device positioned the RAT, Microscopic Imager, Mössbauer, and APXS against targets selected by scientists.',
  }),
  mer({
    id: 'mer-magnets',
    name: 'Magnets',
    short: 'MAGNET ARRAY',
    category: 'Science',
    sprite: 'roverMagnet',
    color: '#ff8097',
    description:
      'Captured magnets on the rover deck and arm collected airborne Martian dust, letting researchers study magnetic minerals and the way wind moves dust across the planet.',
  }),
  mer({
    id: 'mer-low-high-gain-antenna',
    name: 'Low-Gain Antenna and High-Gain Antenna',
    short: 'ANTENNA SUITE',
    category: 'Communications',
    sprite: 'roverAntenna',
    color: '#a6e7ff',
    description:
      'The low-gain antenna provided robust, omnidirectional commands and low-rate data. The steerable high-gain antenna returned large image and science data volumes directly to Earth.',
  }),
  mer({
    id: 'mer-marsdial',
    name: 'Calibration Sundial (Marsdial)',
    short: 'MARSDIAL',
    category: 'Science',
    sprite: 'sundial',
    color: '#ffd98f',
    description:
      "The MarsDial used a central post, colored rings, and a gray scale to calibrate the cameras and track the Sun's position in the Martian sky.",
  }),

  // ---------------------------------------------------------------- Voyager 1 & 2
  voyager({
    id: 'voyager-bus',
    name: 'Bus (Decagonal Body)',
    short: 'DECAGON BUS',
    category: 'Structure',
    sprite: 'bus',
    color: '#c9d6e8',
    description:
      'The Voyager spacecraft bus is a ten-sided aluminum structure that holds propellant tanks, electronics, and the science scan platform. Its compact geometry made efficient use of the launch fairing.',
  }),
  voyager({
    id: 'voyager-high-gain-antenna',
    name: 'High-Gain Antenna (3.7 m Dish)',
    short: '3.7 M DISH',
    category: 'Communications',
    sprite: 'dish',
    color: '#e2ecff',
    description:
      'A 3.7-meter parabolic high-gain antenna transmits and receives high-rate data across billions of kilometers, carrying images, spectra, and plasma-wave measurements back to Earth.',
  }),
  voyager({
    id: 'voyager-low-gain-antenna',
    name: 'Low-Gain Antenna',
    short: 'LOW-GAIN ANT.',
    category: 'Communications',
    sprite: 'lga',
    color: '#c9bdf0',
    description:
      'The low-gain antenna provides omnidirectional communication for commands and low-rate telemetry whenever the high-gain dish is not pointed at Earth.',
  }),
  voyager({
    id: 'voyager-rtgs',
    name: 'Radioisotope Thermoelectric Generators (RTGs)',
    short: 'RTG POWER',
    category: 'Power',
    sprite: 'rtg',
    color: '#ffce72',
    description:
      'Three radioisotope thermoelectric generators convert heat from decaying plutonium-238 into electricity. They power Voyager where sunlight is far too weak for practical solar panels.',
  }),
  voyager({
    id: 'voyager-hydrazine-thrusters',
    name: 'Hydrazine Thrusters',
    short: 'HYDRAZINE',
    category: 'Propulsion',
    sprite: 'hydrazine',
    color: '#ff9979',
    description:
      'Monopropellant hydrazine thrusters fire in short pulses for trajectory corrections and attitude control. They also performed the precise burns that targeted planetary flybys.',
  }),
  voyager({
    id: 'voyager-computers',
    name: 'Computers (CCS, FDS, AACS)',
    short: 'COMPUTERS',
    category: 'Avionics',
    sprite: 'computer',
    color: '#8ee6c8',
    description:
      "Voyager's Computer Command System, Flight Data System, and Attitude and Articulation Control System run the spacecraft. Their ability to be reprogrammed from Earth saved several missions after failures.",
  }),
  voyager({
    id: 'voyager-magnetometer-boom',
    name: 'Magnetometer Boom',
    short: 'MAG BOOM',
    category: 'Science',
    sprite: 'magBoom',
    color: '#a8d8ff',
    description:
      "A 13-meter deployable boom carries magnetometers far from the spacecraft's own magnetic fields. It measured the magnetic environments of Jupiter, Saturn, Uranus, and Neptune.",
  }),
  voyager({
    id: 'voyager-science-boom',
    name: 'Science Boom',
    short: 'SCIENCE BOOM',
    category: 'Science',
    sprite: 'scienceBoom',
    color: '#c7b8ff',
    description:
      'The science boom carries the plasma, particle, and radio instruments away from the bus so their measurements are not contaminated by spacecraft electronics.',
  }),
  voyager({
    id: 'voyager-scan-platform',
    name: 'Scan Platform',
    short: 'SCAN PLATFORM',
    category: 'Science',
    sprite: 'scanPlatform',
    color: '#d8c4ff',
    description:
      'A steerable platform points the cameras and three spectrometers at targets during flybys. It allowed rapid imaging and spectroscopy of moons, rings, and planets as Voyager raced past.',
  }),
  voyager({
    id: 'voyager-cameras',
    name: 'Narrow-Angle and Wide-Angle Cameras',
    short: 'VOYAGER CAMERAS',
    category: 'Science',
    sprite: 'voyagerCameras',
    color: '#ffd27d',
    description:
      'Voyager’s twin vidicon cameras pair a narrow-angle telescope for close-ups with a wide-angle lens for context and faint targets. Their images transformed our view of the outer solar system.',
  }),
  voyager({
    id: 'voyager-iris',
    name: 'Infrared Spectrometer and Radiometer (IRIS)',
    short: 'IRIS',
    category: 'Science',
    sprite: 'iris',
    color: '#ff9c74',
    description:
      'IRIS measured infrared spectra and temperatures, revealing atmospheric compositions, cloud structures, and the heat balance of the giant planets and their moons.',
  }),
  voyager({
    id: 'voyager-uv-spectrometer',
    name: 'Ultraviolet Spectrometer',
    short: 'UV SPECTROMETER',
    category: 'Science',
    sprite: 'uvSpec',
    color: '#b18cff',
    description:
      'The ultraviolet spectrometer measured ultraviolet emissions and absorption, detecting gases such as hydrogen, helium, and sulfur compounds in planetary atmospheres and plumes.',
  }),
  voyager({
    id: 'voyager-photopolarimeter',
    name: 'Photopolarimeter',
    short: 'PHOTOPOLARIMETER',
    category: 'Science',
    sprite: 'photopolarimeter',
    color: '#8fd7ff',
    description:
      'The photopolarimeter measured the intensity and polarization of light, providing data on atmospheric hazes, ring particles, and surface properties.',
  }),
  voyager({
    id: 'voyager-plasma-spectrometer',
    name: 'Plasma Spectrometer',
    short: 'PLASMA SPEC',
    category: 'Science',
    sprite: 'plasma',
    color: '#73e3d1',
    description:
      'The plasma spectrometer measured the energy and direction of charged particles in space, mapping the solar wind and the magnetospheres of the outer planets.',
  }),
  voyager({
    id: 'voyager-low-energy-charged-particle',
    name: 'Low-Energy Charged Particle Instrument',
    short: 'LECP',
    category: 'Science',
    sprite: 'lepi',
    color: '#7bc8ff',
    description:
      'This instrument measured ions and electrons across a broad energy range, revealing particle acceleration, radiation belts, and interactions with planetary moons.',
  }),
  voyager({
    id: 'voyager-cosmic-ray-subsystem',
    name: 'Cosmic Ray Subsystem',
    short: 'COSMIC RAY',
    category: 'Science',
    sprite: 'cosmicRay',
    color: '#c3a6ff',
    description:
      "The cosmic ray subsystem detected high-energy particles from the Sun, the galaxy, and planetary magnetospheres, helping map the heliosphere's boundary.",
  }),
  voyager({
    id: 'voyager-plasma-wave-subsystem',
    name: 'Plasma Wave Subsystem',
    short: 'PLASMA WAVE',
    category: 'Science',
    sprite: 'plasmaWave',
    color: '#7be6ff',
    description:
      'Electric-field antennas measured plasma waves and radio emissions, discovering lightning at Jupiter and revealing the density and structure of planetary plasma environments.',
  }),
  voyager({
    id: 'voyager-planetary-radio-astronomy',
    name: 'Planetary Radio Astronomy Receiver',
    short: 'RADIO ASTRONOMY',
    category: 'Science',
    sprite: 'pra',
    color: '#ff9bd2',
    description:
      'The planetary radio astronomy receiver listened for radio bursts from Jupiter, Saturn, and Uranus, studying magnetic fields and lightning in their atmospheres.',
  }),
  voyager({
    id: 'voyager-golden-record',
    name: 'Golden Record',
    short: 'GOLDEN RECORD',
    category: 'Culture',
    sprite: 'goldenRecord',
    color: '#ffd66b',
    description:
      'A gold-plated copper phonograph record carries sounds, music, greetings, and images of Earth. Each Voyager copy is a message to any civilization that might one day find it.',
  }),
];

export const STORAGE_COMPONENT_COUNT = STORAGE_ROOM_COMPONENTS.length;
