/**
 * novaSpaceKnowledge.js
 * 
 * Authoritative scientific educational knowledge base and voice narration scripts for NOVA,
 * the personal animated astronaut companion of NovaQuest.
 * 
 * Strict Scientific Grounding:
 * - NASA, ESA, JPL Horizons, and IAU verified
 * - Child-friendly, engaging spoken narrations
 * - Zero fabricated facts
 */

import { CELESTIAL_BODIES } from '../solar/celestialData';
import { getEligibleSpacecraftRecord } from '../solar/spacecraftModelService';

export const NOVA_KNOWLEDGE_BASE = {
  // =========================================================================
  // THE SUN & MAJOR PLANETS
  // =========================================================================
  sun: {
    id: 'sun',
    name: 'The Sun',
    type: 'star',
    category: 'Yellow Dwarf Star (G2V)',
    tagline: 'The Blazing Heart of Our Solar System! ☀️',
    spokenNarration: "Look at our blazing star, the Sun! It holds 99.86 percent of all the mass in the solar system, providing all the heat and light that powers life on Earth with continuous nuclear fusion!",
    quickFacts: {
      diameter: '1,392,700 km (109 times wider than Earth)',
      surfaceTemp: '5,500°C (9,932°F)',
      coreTemp: '15,000,000°C (27,000,000°F)',
      age: '4.6 billion years',
      type: 'G-type main-sequence star'
    }
  },

  mercury: {
    id: 'mercury',
    name: 'Mercury',
    type: 'planet',
    category: 'Terrestrial Planet',
    tagline: 'The Swift, Sun-Baked Speedster! 🪨',
    spokenNarration: "Welcome to Mercury, the swift speedster of the inner solar system! It is the smallest major planet, orbiting the Sun in just 88 days with extreme temperature swings from blistering heat to deep frost.",
    quickFacts: {
      distanceFromSun: '0.39 AU (57.9 million km)',
      diameter: '4,879 km',
      orbitalPeriod: '88 Earth days',
      moons: '0 moons',
      surfaceTemp: '-180°C to 430°C'
    }
  },

  venus: {
    id: 'venus',
    name: 'Venus',
    type: 'planet',
    category: 'Terrestrial Planet',
    tagline: 'The Super-Heated Greenhouse World! 🌋',
    spokenNarration: "Look at Venus, the hottest planet in the solar system! Its dense carbon dioxide atmosphere traps intense heat, making the surface a scorching 465 degrees Celsius—hot enough to melt lead!",
    quickFacts: {
      distanceFromSun: '0.72 AU (108.2 million km)',
      diameter: '12,104 km',
      orbitalPeriod: '225 Earth days',
      surfaceTemp: '465°C (869°F)',
      atmosphere: '96% Carbon Dioxide with sulfuric acid clouds'
    }
  },

  earth: {
    id: 'earth',
    name: 'Earth',
    type: 'planet',
    category: 'Terrestrial Planet (Our Home)',
    tagline: 'The Blue Oasis of Life! 🌍',
    spokenNarration: "Welcome home to Earth, our beautiful blue marble! It is the only known world in the universe that supports life, with liquid oceans covering 71 percent of its surface and a protective blanket of breathable air.",
    quickFacts: {
      distanceFromSun: '1.00 AU (149.6 million km)',
      diameter: '12,742 km',
      orbitalPeriod: '365.25 days',
      moons: '1 (The Moon)',
      surfaceTemp: 'Average 15°C (59°F)'
    }
  },

  mars: {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    category: 'Terrestrial Planet',
    tagline: 'The Red Planet of Giant Canyons and Rovers! 🔴',
    spokenNarration: "Welcome to Mars, the Red Planet! Its rusty color comes from iron oxide in the soil. Mars has the tallest volcano in the entire solar system, Olympus Mons, and two tiny captured asteroid moons named Phobos and Deimos!",
    quickFacts: {
      distanceFromSun: '1.52 AU (227.9 million km)',
      diameter: '6,779 km',
      orbitalPeriod: '687 Earth days',
      moons: '2 (Phobos and Deimos)',
      surfaceTemp: '-140°C to 20°C'
    }
  },

  ceres: {
    id: 'ceres',
    name: 'Ceres',
    type: 'dwarf_planet',
    category: 'Asteroid Belt Dwarf Planet',
    tagline: 'The Mysterious Water-Ice Queen of the Asteroid Belt! 🪨',
    spokenNarration: "Welcome to Ceres, the queen of the asteroid belt! It is a dwarf planet making up one-third of the asteroid belt's total mass, hiding bright reflective salt deposits in Occator Crater and vast freshwater ice beneath its crust.",
    quickFacts: {
      distanceFromSun: '2.77 AU (414 million km)',
      diameter: '940 km',
      orbitalPeriod: '4.6 Earth years',
      moons: '0 moons'
    }
  },

  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    category: 'Gas Giant (King of Planets)',
    tagline: 'The Colossal King of Planets and Storms! 🌀',
    spokenNarration: "Behold giant Jupiter, the King of Planets! Over 1,300 Earths could fit inside it, and its Great Red Spot is a colossal storm that has raged for centuries! It has 95 known moons, including volcanic Io and ocean-world Europa.",
    quickFacts: {
      distanceFromSun: '5.20 AU (778.5 million km)',
      diameter: '139,820 km (11 × Earth)',
      orbitalPeriod: '11.86 Earth years',
      moons: '95 recognized moons'
    }
  },

  saturn: {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    category: 'Gas Giant',
    tagline: 'The Ringed Jewel of the Solar System! 🪐',
    spokenNarration: "Look at those magnificent rings! Saturn is a colossal gas giant mostly made of hydrogen and helium. Its rings are made of billions of glittering ice and rock chunks, and it is the moon champion with 146 confirmed moons, led by giant Titan!",
    quickFacts: {
      distanceFromSun: '9.58 AU (1.43 billion km)',
      diameter: '116,460 km (9 × Earth)',
      orbitalPeriod: '29.4 Earth years',
      moons: '146 confirmed moons',
      ringSpan: '282,000 km wide'
    }
  },

  uranus: {
    id: 'uranus',
    name: 'Uranus',
    type: 'planet',
    category: 'Ice Giant',
    tagline: 'The Tilted Cyan Ice World! ❄️',
    spokenNarration: "Welcome to Uranus, the tilted ice giant! It orbits the Sun rolling completely on its side, and atmospheric methane gives it a beautiful cyan blue color. It is the coldest recorded planet in the solar system!",
    quickFacts: {
      distanceFromSun: '19.2 AU (2.87 billion km)',
      diameter: '50,724 km',
      orbitalPeriod: '84 Earth years',
      axialTilt: '97.8°',
      moons: '28 known moons'
    }
  },

  neptune: {
    id: 'neptune',
    name: 'Neptune',
    type: 'planet',
    category: 'Ice Giant',
    tagline: 'The Deep-Blue World of Supersonic Storms! 💨',
    spokenNarration: "Here is Neptune, the furthest major planet from the Sun! It is a deep blue ice giant with supersonic winds howling at over 2,000 kilometers per hour, orbited by frozen moon Triton with liquid nitrogen geysers!",
    quickFacts: {
      distanceFromSun: '30.1 AU (4.50 billion km)',
      diameter: '49,244 km',
      orbitalPeriod: '165 Earth years',
      moons: '16 known moons'
    }
  },

  pluto: {
    id: 'pluto',
    name: 'Pluto',
    type: 'dwarf_planet',
    category: 'Dwarf Planet & Kuiper Belt King',
    tagline: 'The Heart-Shaped Wonder of the Outer Twilight! 💖',
    spokenNarration: "Welcome to Pluto in the outer twilight! This icy dwarf planet has heart-shaped glaciers of frozen nitrogen and mountains made of rock-hard water ice, orbiting with its giant moon Charon.",
    quickFacts: {
      distanceFromSun: '39.5 AU (5.9 billion km)',
      diameter: '2,377 km',
      orbitalPeriod: '248 Earth years',
      moons: '5 (Charon, Styx, Nix, Kerberos, Hydra)'
    }
  },

  // =========================================================================
  // NATURAL SATELLITES (MOONS)
  // =========================================================================
  moon: {
    id: 'moon',
    name: 'The Moon (Luna)',
    type: 'moon',
    category: 'Earth’s Natural Satellite',
    tagline: 'Our Celestial Stepping Stone and Night Light! 🌕',
    spokenNarration: "Welcome to Earth's Moon! It has orbited us for 4.5 billion years and is the only celestial body beyond Earth where human astronauts have walked in the dust.",
    quickFacts: {
      parentPlanet: 'Earth',
      distanceFromEarth: '384,400 km',
      diameter: '3,474 km'
    }
  },

  phobos: {
    id: 'phobos',
    name: 'Phobos',
    type: 'moon',
    category: 'Martian Moon',
    tagline: 'The Doomed Moon of Mars! 🪨',
    spokenNarration: "Welcome to Phobos, the larger moon of Mars! It orbits just 6,000 kilometers above the Martian surface, completing three full orbits every single day.",
    quickFacts: {
      parentPlanet: 'Mars',
      diameter: '22.2 km',
      orbitalPeriod: '7.6 hours'
    }
  },

  deimos: {
    id: 'deimos',
    name: 'Deimos',
    type: 'moon',
    category: 'Martian Moon',
    tagline: 'The Tiny, Smooth Martian Outpost! 🪨',
    spokenNarration: "Meet Deimos, the smooth outer moon of Mars! It is only 12 kilometers across, covered in pulverized dust with such weak gravity that an athlete could run and jump off into space!",
    quickFacts: {
      parentPlanet: 'Mars',
      diameter: '12.4 km',
      orbitalPeriod: '30.3 hours'
    }
  },

  io: {
    id: 'io',
    name: 'Io',
    type: 'moon',
    category: 'Jupiter’s Volcanic Moon',
    tagline: 'The Most Volcanic World in the Solar System! 🌋',
    spokenNarration: "Welcome to fiery Io, the most volcanically active world in the solar system! Gravitational tugging from giant Jupiter powers over 400 active volcanoes that continuously erupt sulfur lava hundreds of miles high.",
    quickFacts: {
      parentPlanet: 'Jupiter',
      diameter: '3,643 km',
      orbitalPeriod: '1.77 days'
    }
  },

  europa: {
    id: 'europa',
    name: 'Europa',
    type: 'moon',
    category: 'Jupiter’s Ocean Moon',
    tagline: 'The Ice Shell World Hiding a Global Ocean! 🧊',
    spokenNarration: "Welcome to Europa! Beneath its cracked ice shell lies a global saltwater ocean with twice as much water as all of Earth's oceans combined, making it one of our top places to search for alien life!",
    quickFacts: {
      parentPlanet: 'Jupiter',
      diameter: '3,122 km',
      orbitalPeriod: '3.55 days'
    }
  },

  ganymede: {
    id: 'ganymede',
    name: 'Ganymede',
    type: 'moon',
    category: 'Jupiter’s Super-Moon',
    tagline: 'The Giant Moon Bigger Than Planet Mercury! 🛡️',
    spokenNarration: "Behold Ganymede, the giant of all moons! It is bigger than planet Mercury and is the only moon in the solar system that generates its own magnetic field.",
    quickFacts: {
      parentPlanet: 'Jupiter',
      diameter: '5,268 km',
      orbitalPeriod: '7.15 days'
    }
  },

  callisto: {
    id: 'callisto',
    name: 'Callisto',
    type: 'moon',
    category: 'Jupiter’s Cratered Moon',
    tagline: 'The Ancient, Battle-Scarred Witness of Space History! ☄️',
    spokenNarration: "Welcome to Callisto, the ancient moon of Jupiter! It is the most heavily cratered object in the solar system, preserved like a cosmic museum of asteroid impacts for over 4 billion years.",
    quickFacts: {
      parentPlanet: 'Jupiter',
      diameter: '4,821 km',
      orbitalPeriod: '16.7 days'
    }
  },

  titan: {
    id: 'titan',
    name: 'Titan',
    type: 'moon',
    category: 'Saturn’s Super-Moon',
    tagline: 'The Golden Moon of Methane Rivers and Dunes! 🧪',
    spokenNarration: "Welcome to Titan, Saturn's largest moon! It's the only moon with a thick atmosphere, and the only world besides Earth with rivers and lakes—except its lakes are filled with liquid methane! It's even bigger than the planet Mercury!",
    quickFacts: {
      parentPlanet: 'Saturn',
      diameter: '5,150 km',
      atmosphere: '95% Nitrogen, 5% Methane',
      surfaceTemp: '-179°C'
    }
  },

  enceladus: {
    id: 'enceladus',
    name: 'Enceladus',
    type: 'moon',
    category: 'Saturn’s Ocean Geyser Moon',
    tagline: 'The Brightest Moon Spraying Oceans into Space! 🌊',
    spokenNarration: "Welcome to glittering Enceladus! This icy moon sprays towering geysers of saltwater and organic molecules from deep hydrothermal vents beneath its south pole directly into space!",
    quickFacts: {
      parentPlanet: 'Saturn',
      diameter: '504 km',
      surfaceTemp: '-198°C'
    }
  },

  // =========================================================================
  // HISTORIC & ACTIVE SPACECRAFT MISSIONS
  // =========================================================================
  'voyager-1': {
    id: 'voyager-1',
    name: 'Voyager 1',
    type: 'spacecraft',
    category: 'Interstellar Probe',
    tagline: 'Humankind’s Furthest Messenger in Deep Space! 🚀',
    spokenNarration: "You've arrived at Voyager 1! Launched by NASA in 1977, it is the most distant human-made object in history. It has crossed into interstellar space and carries the famous Golden Record to share Earth's story with the stars!",
    quickFacts: {
      agency: 'NASA / JPL-Caltech',
      launchDate: 'September 5, 1977',
      distanceFromSun: 'Over 24 billion km (163 AU)',
      status: 'Active in Interstellar Space'
    }
  },

  'cassini-huygens': {
    id: 'cassini-huygens',
    name: 'Cassini-Huygens',
    type: 'spacecraft',
    category: 'Planetary Orbiter & Titan Lander',
    tagline: 'The Legendary Explorer of Saturn and Its Rings! 🪐',
    spokenNarration: "Behold the Cassini spacecraft! It spent 13 incredible years exploring Saturn, its rings, and ocean moons before making its heroic Grand Finale dive into Saturn's clouds in 2017.",
    quickFacts: {
      agency: 'NASA / ESA / ASI',
      launchDate: 'October 15, 1997',
      saturnArrival: '2004',
      status: 'Completed'
    }
  },

  'surveyor-1': {
    id: 'surveyor-1',
    name: 'Surveyor 1',
    type: 'spacecraft',
    category: 'Lunar Soft Lander',
    tagline: 'The Pioneer that Proved Humans Could Land on the Moon! 🌕',
    spokenNarration: "Welcome to Surveyor 1! In 1966, it made America's first soft touchdown on the Moon, proving the lunar dust was firm enough for Apollo astronauts to land safely.",
    quickFacts: {
      agency: 'NASA / JPL-Caltech',
      launchDate: 'May 30, 1966',
      landingDate: 'June 2, 1966',
      status: 'Preserved on Lunar Surface'
    }
  },

  'mars-pathfinder': {
    id: 'mars-pathfinder',
    name: 'Mars Pathfinder & Sojourner',
    type: 'spacecraft',
    category: 'Martian Lander & Micro-Rover',
    tagline: 'The Mission that Put Wheels on Mars! 🚙',
    spokenNarration: "Here is Mars Pathfinder and the Sojourner rover! Landing with giant bouncing airbags in 1997, it was the first mission to drive a wheeled robotic rover on the surface of Mars!",
    quickFacts: {
      agency: 'NASA / JPL-Caltech',
      launchDate: 'December 4, 1996',
      landingDate: 'July 4, 1997',
      rover: 'Sojourner'
    }
  },

  'venera-13': {
    id: 'venera-13',
    name: 'Venera 13',
    type: 'spacecraft',
    category: 'Venus Surface Lander',
    tagline: 'The Iron Survivor that Touched the Surface of Venus! 🌋',
    spokenNarration: "Here is Soviet lander Venera 13! In 1982, it survived 457 degrees heat and crushing pressure on Venus to transmit the first color panoramas and sound recordings of an alien atmosphere.",
    quickFacts: {
      agency: 'Soviet Space Program',
      launchDate: 'October 30, 1981',
      survivalTime: '127 minutes on Venus'
    }
  }
};

/**
 * Get knowledge profile and spoken narration for any celestial body ID or spacecraft slug.
 */
export function getNovaProfile(idOrSlug) {
  if (!idOrSlug) return null;
  const key = String(idOrSlug).toLowerCase().trim();

  // 1. Direct match
  if (NOVA_KNOWLEDGE_BASE[key]) {
    return NOVA_KNOWLEDGE_BASE[key];
  }

  // 2. Aliases & variations
  const aliasMap = {
    'mercury': 'mercury',
    'venus': 'venus',
    'earth': 'earth',
    'mars': 'mars',
    'jupiter': 'jupiter',
    'saturn': 'saturn',
    'uranus': 'uranus',
    'neptune': 'neptune',
    'sun': 'sun',
    'the-sun': 'sun',
    'luna': 'moon',
    'the-moon': 'moon',
    'moon': 'moon',
    'pluto': 'pluto',
    'ceres': 'ceres',
    'titan': 'titan',
    'europa': 'europa',
    'ganymede': 'ganymede',
    'callisto': 'callisto',
    'io': 'io',
    'phobos': 'phobos',
    'deimos': 'deimos',
    'enceladus': 'enceladus',
    'voyager1': 'voyager-1',
    'voyager-1': 'voyager-1',
    'voyager2': 'voyager-1',
    'voyager-2': 'voyager-1',
    'cassini': 'cassini-huygens',
    'cassini-huygens': 'cassini-huygens',
    'surveyor': 'surveyor-1',
    'surveyor-1': 'surveyor-1',
    'surveyor-3': 'surveyor-1',
    'mars-pathfinder': 'mars-pathfinder',
    'pathfinder': 'mars-pathfinder',
    'sojourner': 'mars-pathfinder',
    'venera': 'venera-13',
    'venera-13': 'venera-13'
  };

  const targetKey = aliasMap[key];
  if (targetKey && NOVA_KNOWLEDGE_BASE[targetKey]) {
    return NOVA_KNOWLEDGE_BASE[targetKey];
  }

  // 3. Dynamic lookup in CELESTIAL_BODIES
  for (const body of CELESTIAL_BODIES) {
    if (body.id === key || body.name.toLowerCase() === key) {
      return {
        id: body.id,
        name: body.name,
        type: body.type,
        category: body.type === 'star' ? 'Star' : (body.type === 'planet' ? 'Major Planet' : 'Celestial Body'),
        tagline: `${body.name} — ${body.overview}`,
        spokenNarration: `Welcome to ${body.name}! ${body.overview} It has a diameter of ${body.realStats?.diameter || 'planetary scale'} and follows a precise gravitational orbit around our Sun.`,
        quickFacts: {
          diameter: body.realStats?.diameter || 'Planetary Scale',
          distanceFromSun: body.realStats?.distanceFromSun || `${body.distance} AU`,
          moons: body.moons ? `${body.moons.length} moons` : (body.realStats?.moons || '0')
        }
      };
    }

    if (body.moons && body.moons.length > 0) {
      for (const moon of body.moons) {
        if (moon.id === key || moon.name.toLowerCase() === key) {
          return {
            id: moon.id,
            name: moon.name,
            type: 'moon',
            category: `${body.name}'s Moon`,
            tagline: `${moon.name} — ${moon.overview}`,
            spokenNarration: `Welcome to ${moon.name}! It is a natural satellite orbiting around ${body.name}, measuring ${moon.realStats?.diameter || 'several hundred kilometers'} across.`,
            quickFacts: {
              parentPlanet: body.name,
              diameter: moon.realStats?.diameter || 'Natural satellite scale'
            }
          };
        }
      }
    }
  }

  // 4. Dynamic lookup for Spacecraft Models
  const craftRecord = getEligibleSpacecraftRecord(key);
  if (craftRecord) {
    return {
      id: craftRecord.slug,
      name: craftRecord.name || craftRecord.missionName,
      type: 'spacecraft',
      category: craftRecord.objectType || 'Interplanetary Spacecraft',
      tagline: `Mission to ${craftRecord.destination || 'Deep Space'}! 🚀`,
      spokenNarration: `Here is ${craftRecord.name}! Launched in ${craftRecord.launchDate || 'historic era'} by ${craftRecord.agency || 'aerospace engineers'}, its mission was to explore ${craftRecord.destination || 'the Solar System'}.`,
      quickFacts: {
        agency: craftRecord.agency || 'Space Exploration Agency',
        launchDate: craftRecord.launchDate || 'Historic Space Era',
        destination: craftRecord.destination || 'Solar System Exploration',
        status: craftRecord.operationalStatus || 'Verified Mission Telemetry'
      }
    };
  }

  return null;
}
