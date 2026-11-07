/**
 * surveyor5Data.js
 * 
 * Historical Game Specification for Level 1: Surveyor 5 (1967)
 * "Time Travelers of Space" — NovaQuest Games
 * 
 * Target Audience: 8-14 years.
 * Educational Game Design combining:
 * 70% Colorful Cartoon 3D Adventure, 20% NASA Educational Explorer, 10% Cinematic Adventure.
 */

export const SURVEYOR_5_MISSION = {
  id: 'surveyor-5',
  title: 'Surveyor 5 — The Moon Mission',
  subtitle: 'Paving the Way for Apollo 11',
  year: 1967,
  launchDate: 'September 8, 1967',
  landingDate: 'September 11, 1967',
  location: 'Mare Tranquillitatis (Sea of Tranquility)',
  coordinates: '1.41° N, 23.18° E',
  difficulty: 'Beginner',
  durationMinutes: 5,
  leadScientist: 'Leonard Jaffe',
  astronautHero: 'Leo Stoolman',
  badgeName: 'Lunar Pioneer Badge',
  badgeIcon: 'Award',
  summary: 'Travel back in time to 1967! Meet NASA Project Scientist Leonard Jaffe, assemble the historic Surveyor 5 lander, solve a critical midcourse engine emergency, and perform the first chemical analysis of lunar soil before Apollo 11 lands.',
  
  // 6 Narrative Scenes (Timeline matching the design document)
  scenes: [
    {
      id: 'scene-1',
      title: 'Discovery on the Moon',
      timeRange: '0:00 - 0:45',
      location: 'Sea of Tranquility, Present Day',
      objective: 'Explore the lunar surface, dodge craters and rocks, and discover the mysterious Surveyor 5 lander.'
    },
    {
      id: 'scene-2',
      title: 'NASA Headquarters 1967',
      timeRange: '0:45 - 1:15',
      location: 'NASA HQ, Washington D.C., April 17, 1967',
      objective: 'Meet Leonard Jaffe and learn why Surveyor 5 is critical for human spaceflight.'
    },
    {
      id: 'scene-3',
      title: 'Surveyor 5 Assembly Lab',
      timeRange: '1:15 - 2:30',
      location: 'Hughes Aircraft Cleanroom, 1967',
      objective: 'Assemble the 14 authentic components of Surveyor 5 and identify parts that do not belong.'
    },
    {
      id: 'scene-4',
      title: 'Launch Emergency!',
      timeRange: '2:30 - 3:30',
      location: 'Cislunar Space, September 9, 1967',
      objective: 'Solve the critical helium pressure leak with Leonard Jaffe to achieve a soft lunar landing.'
    },
    {
      id: 'scene-5',
      title: 'Lunar Soil Analysis',
      timeRange: '3:30 - 4:30',
      location: 'Mare Tranquillitatis, September 11, 1967',
      objective: 'Deploy the Alpha-Scattering Instrument to analyze basalt, iron, and titanium for Apollo 11.'
    },
    {
      id: 'scene-6',
      title: 'Final Mission Conclusion',
      timeRange: '4:30 - 5:00',
      location: 'Surveyor 5 Memorial, Moon',
      objective: 'Celebrate 19,118 historic photos and earn your 3-Star Lunar Pioneer Badge!'
    }
  ],

  // 14 Correct Components for Assembly Lab
  correctComponents: [
    {
      id: 'triangular_frame',
      name: 'Triangular Aluminum Frame',
      category: 'Structure',
      description: 'Ultra-lightweight tubular aluminum spaceframe providing structural rigidity.',
      origin: 'Hughes Aircraft Company',
      feedback: 'Correct! The open tubular spaceframe minimized weight while supporting all science instruments.',
      color: '#cbd5e1'
    },
    {
      id: 'landing_legs',
      name: 'Three Landing Legs with Footpads',
      category: 'Landing Gear',
      description: 'Hinged tubular legs equipped with crushable honeycomb aluminum footpads to absorb touchdown shocks.',
      origin: 'Hughes Aircraft Company',
      feedback: 'Correct! The 3-legged tripod design allowed soft landing on uneven lunar rocks and craters.',
      color: '#94a3b8'
    },
    {
      id: 'main_retrorocket',
      name: 'Main Retrorocket',
      category: 'Propulsion',
      description: 'Solid propellant rocket motor that braked the spacecraft from 6,000 mph to near-zero before landing.',
      origin: 'Thiokol Chemical Corp',
      feedback: 'Correct! Fired at high altitude to kill 95% of descent velocity before being jettisoned.',
      color: '#475569'
    },
    {
      id: 'vernier_thrusters',
      name: 'Vernier Thrusters',
      category: 'Propulsion',
      description: 'Three liquid-fuel throttleable engines (monomethylhydrazine / nitrogen tetroxide) for midcourse corrections and soft landing.',
      origin: 'Reaction Motors Division',
      feedback: 'Correct! These three small thrusters steered the spacecraft and carried out the final soft touchdown.',
      color: '#38bdf8'
    },
    {
      id: 'altitude_radar',
      name: 'Altitude Marking Radar (AMR)',
      category: 'Navigation',
      description: 'Doppler radar mounted in the retrorocket nozzle that detected exact distance to the lunar surface to trigger retrofire.',
      origin: 'Ryan Aeronautical',
      feedback: 'Correct! Provided crucial altitude readings to time the main retrorocket ignition perfectly.',
      color: '#f59e0b'
    },
    {
      id: 'solar_panel',
      name: 'Planar Solar Panel',
      category: 'Power',
      description: 'Sun-tracking planar array of 3,960 solar cells generating up to 85 Watts of electrical power.',
      origin: 'Heliotek / Hughes',
      feedback: 'Correct! The steerable solar panel tracked the Sun continuously during the 14-day lunar daylight.',
      color: '#1e3a8a'
    },
    {
      id: 'battery',
      name: 'Silver-Zinc Battery',
      category: 'Power',
      description: 'Rechargeable secondary silver-zinc battery pack powering systems during shadow, descent, and peak radio operations.',
      origin: 'Eagle-Picher Industries',
      feedback: 'Correct! Provided high energy density during peak radio broadcasts and nighttime.',
      color: '#10b981'
    },
    {
      id: 'high_gain_antenna',
      name: 'Planar High-Gain Antenna',
      category: 'Communications',
      description: 'Directional slotted planar array antenna aimed directly at NASA Deep Space Network dishes on Earth to transmit TV photos.',
      origin: 'Hughes Aircraft Company',
      feedback: 'Correct! Allowed high-bandwidth transmission of 600-line television images to Earth.',
      color: '#e2e8f0'
    },
    {
      id: 'omni_antennas',
      name: 'Omnidirectional Antennas',
      category: 'Communications',
      description: 'Dual conical antennas deployed on extendable arms providing 360° radio coverage during flight.',
      origin: 'Hughes Aircraft Company',
      feedback: 'Correct! Ensured NASA tracking stations never lost radio contact while the spacecraft was turning.',
      color: '#64748b'
    },
    {
      id: 'tv_camera',
      name: 'Television Camera',
      category: 'Science',
      description: 'Slow-scan vidicon camera with rotating azimuth mirror, zoom lens, and color filters to capture 360° lunar panoramas.',
      origin: 'Bell & Howell / JPL',
      feedback: 'Correct! Surveyor 5 took 19,118 high-resolution photos of the lunar surface with this camera!',
      color: '#f97316'
    },
    {
      id: 'alpha_scattering',
      name: 'Alpha-Scattering Instrument',
      category: 'Science',
      description: 'Curium-242 radioactive alpha source sensor lowered onto the lunar soil to measure chemical elements via backscattering.',
      origin: 'University of Chicago (Dr. Anthony Turkevich)',
      feedback: 'Correct! This pioneering detector performed the first chemical composition analysis of lunar regolith!',
      color: '#a855f7'
    },
    {
      id: 'footpad_magnet',
      name: 'Footpad Magnet',
      category: 'Science',
      description: 'Small horseshoe magnet mounted on footpad 2 to test for ferromagnetic particles (free iron) in lunar dust.',
      origin: 'JPL / USGS',
      feedback: 'Correct! It attracted magnetic grains, proving magnetic iron minerals were present in the regolith.',
      color: '#ef4444'
    },
    {
      id: 'thermal_compartments',
      name: 'Thermal Compartments & Sensors',
      category: 'Thermal',
      description: 'Polished silvered thermal shields and louvered compartments protecting delicate electronics from +260°F to -250°F.',
      origin: 'Hughes Aircraft Company',
      feedback: 'Correct! Controlled temperature during the scorching +260°F lunar noon and frozen -250°F lunar night.',
      color: '#f1f5f9'
    },
    {
      id: 'star_sun_sensor',
      name: 'Star Tracker & Sun Sensor',
      category: 'Attitude Control',
      description: 'Optical sensors that locked onto the Sun and the bright star Canopus to maintain 3-axis space orientation.',
      origin: 'Hughes / JPL',
      feedback: 'Correct! Star Canopus and the Sun served as celestial navigation beacons on the journey to the Moon.',
      color: '#eab308'
    }
  ],

  // 8 Incorrect Components (with educational reasoning why they belong to other spacecraft)
  incorrectComponents: [
    {
      id: 'surface_sampler_claw',
      name: 'Soil Mechanics Surface Sampler (Scoop Claw)',
      belongsTo: 'Surveyor 3 & Surveyor 7 (1967-1968)',
      whyIncorrect: 'Surveyor 5 did NOT have a mechanical digging arm! To save weight for the heavy Alpha-Scattering instrument, the motorized scoop claw was omitted on Surveyor 5 and only flown on Surveyors 3 and 7.',
      icon: 'Hand'
    },
    {
      id: 'rocker_bogie_wheels',
      name: 'Six Wheels with Rocker-Bogie Suspension',
      belongsTo: 'Mars Rovers (Sojourner, Spirit, Opportunity, Curiosity, Perseverance)',
      whyIncorrect: 'Surveyor 5 was a stationary 3-legged lunar lander, not a rover! Wheels would not be used on the Moon until the Apollo 15 Lunar Roving Vehicle in 1971.',
      icon: 'CircleDot'
    },
    {
      id: 'pancam_mast',
      name: 'Pancam / Navcam Panoramic Rover Mast',
      belongsTo: 'Mars Exploration Rovers (Spirit & Opportunity, 2004)',
      whyIncorrect: 'This stereo camera mast was engineered 37 years later for driving across Mars! Surveyor 5 used a single vertical vidicon tube with a rotating mirror.',
      icon: 'Camera'
    },
    {
      id: 'mossbauer_apxs_arm',
      name: 'Mössbauer / Mini-TES Robotic Turret Arm',
      belongsTo: 'Curiosity & Opportunity Rovers',
      whyIncorrect: 'Robotic contact arms with spectrometers belong to modern Mars rovers! Surveyor 5 lowered its Alpha-Scattering box with a simple nylon cord winch.',
      icon: 'Crosshair'
    },
    {
      id: 'calibration_sundial',
      name: 'MarsDial Calibration Sundial',
      belongsTo: 'Mars Rovers (Spirit, Opportunity, Curiosity)',
      whyIncorrect: 'The MarsDial sundial was designed for color-calibrating rover cameras on Mars! Surveyor 5 used flat gray-scale and color test charts mounted directly on its frame.',
      icon: 'Sun'
    },
    {
      id: 'rtg_nuclear_generator',
      name: 'Radioisotope Thermoelectric Generator (RTG)',
      belongsTo: 'Apollo ALSEP, Pioneer, Voyager, Curiosity',
      whyIncorrect: 'Surveyor 5 used solar panels and silver-zinc batteries, not an RTG! RTGs were later placed on the Moon by Apollo astronauts for scientific packages.',
      icon: 'Zap'
    },
    {
      id: 'golden_record',
      name: 'Voyager Golden Record',
      belongsTo: 'Voyager 1 & 2 (1977)',
      whyIncorrect: 'The Golden Record carrying sounds of Earth was launched 10 years later on the interstellar Voyager probes bound for the outer gas giants and deep space!',
      icon: 'Disc'
    },
    {
      id: 'magnetometer_boom',
      name: '13-Meter Magnetometer Boom',
      belongsTo: 'Voyager, Cassini, Mariner Probes',
      whyIncorrect: 'Long deployable magnetometer booms are used to measure weak planetary magnetic fields far from spacecraft electronics. Surveyor 5 used a tiny magnet on its footpad!',
      icon: 'Compass'
    }
  ],

  // Emergency Midcourse Challenge (Historical Sept 9, 1967 event)
  emergencyChallenge: {
    eventTitle: 'CRITICAL HELIUM PRESSURE LEAK DETECTED!',
    eventTime: 'September 9, 1967 — 32 hours after launch',
    npcBriefing: 'Leonard Jaffe: "Leo, look at the telemetry! Helium gas is leaking from the vernier engine pressurization regulator! The pressure dropped from 5,000 psi to 850 psi and is still falling. If pressure hits zero, our vernier engines will fail, the retrorocket will be uncontrolled, and Surveyor 5 will smash into the Moon at 6,000 miles per hour!"',
    question: 'How should Mission Control modify the engine burn sequence to salvage the landing before all helium leaks away?',
    options: [
      {
        id: 'opt_vent',
        text: 'Vent all remaining fuel into space and rely purely on the solid retrorocket for touchdown.',
        isCorrect: false,
        explanation: 'Incorrect: The solid retrorocket cannot steer or throttle. Without vernier engines for terminal touchdown, Surveyor 5 would strike the Moon at over 150 mph!'
      },
      {
        id: 'opt_correct',
        text: 'Pressurize the fuel tanks early and fire the vernier engines in a modified sequence while pressure remains.',
        isCorrect: true,
        explanation: 'HISTORICALLY CORRECT! The JPL and Hughes engineering team hastily reprogrammed the landing sequence. They pressurized the tanks immediately, delayed retrorocket ignition until just 42 miles altitude, and burned the vernier engines for only 106 seconds, touching down softly with just inches to spare!'
      },
      {
        id: 'opt_jettison',
        text: 'Jettison the Alpha-Scattering instrument immediately to lighten the spacecraft.',
        isCorrect: false,
        explanation: 'Incorrect: Jettisoning the science payload does not fix the helium pressure leak, and it would defeat the primary scientific goal of the mission!'
      }
    ],
    historicalFact: 'The real-world rescue of Surveyor 5 is considered one of NASA’s finest engineering achievements. Mission controllers designed and tested an entirely new 40-step descent algorithm in less than 24 hours while the spacecraft was en route!'
  },

  // Soil Analysis Data (First Chemical Composition of Lunar Soil)
  soilAnalysis: {
    instrumentName: 'Alpha-Scattering Instrument (Turkevich Spectrometer)',
    radiationSource: 'Curium-242 alpha emitter',
    elementsDetected: [
      {
        element: 'Titanium (Ti)',
        percentage: 'High (~3-5%)',
        meaning: 'Dense basaltic volcanic rock rich in ilmenite (FeTiO3), unexpected compared to Earth rocks!'
      },
      {
        element: 'Iron (Fe)',
        percentage: 'Significant (~12-14%)',
        meaning: 'Dark mineral content that explained the deep gray color of the lunar maria.'
      },
      {
        element: 'Magnesium & Silicon (Mg, Si)',
        percentage: 'Abundant (~40-50%)',
        meaning: 'Silicate minerals similar to terrestrial basaltic lavas formed in ancient volcanic eruptions.'
      },
      {
        element: 'Oxygen & Aluminum (O, Al)',
        percentage: 'Moderate (~25%)',
        meaning: 'Oxygen bound in oxide minerals, proving water is not necessary for oxide mineral formation.'
      }
    ],
    apolloImpact: 'Surveyor 5 proved to NASA geologists and engineers that the lunar mare was solid volcanic rock capable of supporting the multi-ton Apollo Lunar Module! Two years later, Neil Armstrong and Buzz Aldrin landed Apollo 11 just 15 miles away in Mare Tranquillitatis.'
  },

  // Conclusion / Post-Mission Facts
  conclusion: {
    totalImages: 19118,
    lunarNightTemp: '-250°F (-157°C)',
    finalSignalDate: 'December 17, 1967',
    legacy: 'Surveyor 5 survived the intense cold of two full 14-day lunar nights, proved the Moon could support human boots, and remains resting serenely in the Sea of Tranquility to this day.'
  }
};
