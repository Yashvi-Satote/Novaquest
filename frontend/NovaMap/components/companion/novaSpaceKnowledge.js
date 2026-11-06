/**
 * novaSpaceKnowledge.js
 * 
 * Comprehensive, verified scientific educational knowledge base for NOVA,
 * the personal space exploration companion of NovaQuest.
 * 
 * Designed for kids, students, and space enthusiasts:
 * - Simple, engaging language
 * - Strictly factual (NASA, ESA, JPL Horizons, and IAU verified)
 * - Structured categories covering size, distance, atmosphere, surface, exploration, and habitability.
 */

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
    greeting: "Greetings, space traveler! ☀️ I am NOVA! You're looking at our very own star, the Sun! It holds 99.86% of ALL the mass in the entire solar system. Its gravity keeps all the planets, asteroids, and comets in orbit around it!",
    quickFacts: {
      diameter: '1,392,700 km (109 times wider than Earth)',
      surfaceTemp: '5,500°C (9,932°F)',
      coreTemp: '15,000,000°C (27,000,000°F)',
      age: '4.6 billion years',
      type: 'G-type main-sequence star',
      lightTravelTime: '8 minutes and 20 seconds to Earth'
    },
    sections: {
      size: 'The Sun is enormous! You could fit approximately 1.3 million Earths inside it. If the Sun were the size of a typical front door, Earth would be roughly the size of a small nickel!',
      atmosphere: 'The Sun does not have a solid surface—it is a giant ball of glowing plasma made of 74% hydrogen, 24% helium, and traces of heavier elements. Its outer atmosphere, called the corona, streams solar wind millions of miles into space!',
      surface: 'The visible surface is called the photosphere. It bubbles like boiling soup, producing dark cooler patches called sunspots and explosive solar flares that can create auroras on Earth!',
      temperature: 'The surface temperature is roughly 5,500°C, but its burning nuclear fusion core reaches a staggering 15 million degrees Celsius!',
      moons: 'The Sun has no moons of its own—instead, eight major planets, hundreds of moons, five dwarf planets, and millions of asteroids orbit around it!',
      exploration: 'NASA has sent pioneering spacecraft to study the Sun up close! The Parker Solar Probe is currently flying through the Sun’s fiery outer corona at record speeds, surviving extreme heat with a carbon-composite heat shield.',
      coolFact: 'Every single second, the Sun converts 600 million tons of hydrogen into helium through nuclear fusion, producing all the warmth and light that powers life on Earth!',
      habitability: 'Could humans live here? Definitely not! Any object that gets too close to the Sun would be vaporized by its extreme heat and radiation within milliseconds!'
    },
    suggestedQuestions: [
      'How hot is the Sun?',
      'How many Earths fit inside the Sun?',
      'What spacecraft have visited the Sun?',
      'Could humans ever land on the Sun?'
    ]
  },

  mercury: {
    id: 'mercury',
    name: 'Mercury',
    type: 'planet',
    category: 'Terrestrial Planet',
    tagline: 'The Swift, Sun-Baked Speedster! 🪨',
    greeting: "Welcome to Mercury! 🪨 Mercury is the smallest planet in our solar system and the closest one to the Sun. Because it orbits so quickly, a whole year on Mercury lasts only 88 Earth days!",
    quickFacts: {
      distanceFromSun: '0.39 AU (57.9 million km)',
      diameter: '4,879 km (only slightly larger than Earth’s Moon)',
      orbitalPeriod: '88 Earth days',
      dayLength: '59 Earth days',
      moons: '0 moons',
      surfaceTemp: '-180°C at night to 430°C during the day'
    },
    sections: {
      size: 'Mercury is the smallest major planet, measuring 4,879 km across. It is about one-third the width of Earth!',
      atmosphere: 'Mercury has almost no atmosphere! Instead, it has a paper-thin "exosphere" composed of sodium, helium, and potassium blasted off its surface by the solar wind. Without an atmosphere to trap warmth, heat quickly escapes into space!',
      surface: 'Mercury’s gray, rocky surface is covered in thousands of meteorite impact craters, making it look very similar to Earth’s Moon. Its biggest crater, the Caloris Basin, is 1,550 km wide!',
      temperature: 'Mercury experiences the most extreme temperature swings in the solar system! During the daytime, it bakes at a blistering 430°C (800°F). At night, temperatures plummet to -180°C (-290°F)!',
      moons: 'Mercury has zero moons and no rings.',
      exploration: 'NASA’s Mariner 10 first flew past Mercury in 1974, and the MESSENGER spacecraft orbited it from 2011 to 2015, revealing that Mercury has water ice permanently frozen inside deep, shadowed polar craters!',
      coolFact: 'Even though Mercury is the closest planet to the Sun, it is NOT the hottest! (Venus is actually hotter because of its runaway greenhouse effect!) Also, Mercury is slowly shrinking as its giant iron core cools down.',
      habitability: 'Humans could not survive on Mercury without a heavy spacesuit. There is no breathable air, intense cosmic radiation, and wild temperature swings!'
    },
    suggestedQuestions: [
      'Why does Mercury have no atmosphere?',
      'Is Mercury the hottest planet?',
      'Does Mercury have water ice?',
      'How fast does Mercury orbit the Sun?'
    ]
  },

  venus: {
    id: 'venus',
    name: 'Venus',
    type: 'planet',
    category: 'Terrestrial Planet',
    tagline: 'The Super-Heated Greenhouse World! 🌋',
    greeting: "Look at that bright, golden glow! That's Venus, often called Earth's 'twin' because of its similar size and mass. But do not be fooled: Venus is a scorching furnace and the hottest planet in the solar system!",
    quickFacts: {
      distanceFromSun: '0.72 AU (108.2 million km)',
      diameter: '12,104 km (95% of Earth)',
      orbitalPeriod: '225 Earth days',
      dayLength: '243 Earth days (longer than its year!)',
      surfaceTemp: '465°C (869°F) — hot enough to melt lead!',
      atmosphere: '96% Carbon Dioxide with clouds of sulfuric acid'
    },
    sections: {
      size: 'Venus has a diameter of 12,104 km, which makes it nearly identical in size and gravity to Earth!',
      atmosphere: 'Venus possesses a super-thick, toxic atmosphere of 96% carbon dioxide with yellowish clouds made of corrosive sulfuric acid! The atmospheric pressure at the surface is 90 times heavier than Earth—the same crushing pressure you would feel 900 meters underwater!',
      surface: 'Beneath the dense clouds lies an alien volcanic world with vast basaltic plains, giant highland plateaus, and thousands of volcanoes, including Maat Mons, which stands 8 km high!',
      temperature: 'Because its runaway greenhouse effect traps heat like a giant blanket, Venus stays at a constant 465°C (869°F) day and night—hot enough to melt solid lead!',
      moons: 'Venus has no moons and no rings.',
      exploration: 'The Soviet Venera program achieved history by landing probes like Venera 13 on the surface in 1982, capturing the first color photographs before the crushing heat and pressure destroyed them within hours. NASA’s Magellan radar-mapped 98% of the planet.',
      coolFact: 'Venus spins backwards compared to most planets (retrograde rotation), which means the Sun rises in the west and sets in the east! Plus, one Venusian day is longer than its entire year!',
      habitability: 'Could humans live here? Not on the surface! But scientists think high in the clouds of Venus—about 50 km up—the temperature and pressure are surprisingly Earth-like. Some dream of future floating cloud cities!'
    },
    suggestedQuestions: [
      'Why is Venus hotter than Mercury?',
      'How long did landers survive on Venus?',
      'Why does Venus spin backwards?',
      'Could humans live in floating cloud cities?'
    ]
  },

  earth: {
    id: 'earth',
    name: 'Earth',
    type: 'planet',
    category: 'Terrestrial Planet (Our Home)',
    tagline: 'The Oasis of Life, Oceans, and Wonder! 🌍',
    greeting: "Welcome home, explorer! 🌍 You're looking at Planet Earth—the only place in the universe known to harbor living creatures. With sparkling liquid oceans, a protective magnetic field, and a breathable atmosphere, Earth is truly unique!",
    quickFacts: {
      distanceFromSun: '1.00 AU (149.6 million km)',
      diameter: '12,742 km',
      orbitalPeriod: '365.25 days (1 year)',
      moons: '1 (The Moon / Luna)',
      surfaceTemp: '-88°C to 58°C (Average 15°C / 59°F)',
      oceanCoverage: '71% of surface covered in liquid water'
    },
    sections: {
      size: 'Earth is the largest of the four rocky inner planets, with an equatorial diameter of 12,742 km.',
      atmosphere: 'Earth’s atmosphere is a life-supporting recipe of 78% nitrogen, 21% oxygen, and 1% argon and other trace gases. The ozone layer shields us from harmful solar ultraviolet rays!',
      surface: 'About 71% of Earth is covered in vast liquid water oceans. Earth has active tectonic plates that create majestic mountain ranges, ocean trenches, and volcanic islands.',
      temperature: 'Earth maintains an average surface temperature of 15°C (59°F), perfectly moderated by water vapor and carbon dioxide.',
      moons: 'Earth has one large natural satellite: The Moon, which stabilizes Earth’s tilt and generates ocean tides.',
      exploration: 'Thousands of satellites, telescopes, and the International Space Station orbit Earth every 90 minutes, monitoring climate, oceans, weather, and deep space.',
      coolFact: 'Earth is not a perfect sphere—because it spins at 1,670 km/h at the equator, centrifugal force causes it to bulge slightly at the middle!',
      habitability: 'Earth has the Goldilocks conditions: just the right distance from the Sun, liquid water, breathable oxygen, and a magnetic shield against cosmic rays.'
    },
    suggestedQuestions: [
      'Why does Earth have liquid water?',
      'How does Earth protect us from cosmic radiation?',
      'How fast is Earth spinning right now?',
      'Why is Earth called the Blue Marble?'
    ]
  },

  mars: {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    category: 'Terrestrial Planet',
    tagline: 'The Red Planet of Giant Canyons and Rovers! 🔴',
    greeting: "Welcome to Mars, the Red Planet! 🔴 Look at that rusty color—it comes from iron oxide (rust) covering the rocks and sand! Mars is home to the biggest volcano and the deepest canyon in the entire solar system. Let's explore!",
    quickFacts: {
      distanceFromSun: '1.52 AU (227.9 million km)',
      diameter: '6,779 km (about half the width of Earth)',
      orbitalPeriod: '687 Earth days',
      dayLength: '24 hours and 37 minutes (a Martian Sol)',
      moons: '2 (Phobos and Deimos)',
      surfaceTemp: '-140°C to 20°C (Average -63°C / -81°F)'
    },
    sections: {
      size: 'Mars is about half the size of Earth, with a diameter of 6,779 km. Its surface gravity is only 38% of Earth’s, meaning you could jump almost three times higher on Mars!',
      atmosphere: 'The atmosphere on Mars is very thin—less than 1% of Earth’s density—and made of 95% carbon dioxide. Because the air is so thin, liquid water quickly boils or freezes.',
      surface: 'Mars has spectacular geology! Olympus Mons is a shield volcano 22 km high—three times taller than Mount Everest! Valles Marineris is a canyon system that stretches over 4,000 km, ten times longer than Earth’s Grand Canyon!',
      temperature: 'Mars is a cold desert world. While equatorial summers can reach a balmy 20°C (68°F), winter nights at the poles drop down to a freezing -140°C (-220°F)!',
      moons: 'Mars has two tiny potato-shaped moons named Phobos and Deimos, which are thought to be captured asteroids.',
      exploration: 'Mars is the most explored planet beyond Earth! Fleets of robotic explorers like NASA’s Curiosity and Perseverance rovers, the Ingenuity helicopter, and orbiters from NASA, ESA, ISRO, and UAE are searching for signs of ancient microbial life.',
      coolFact: 'Mars has massive dust storms that can grow so large they swallow the entire planet in red dust for months at a time! Also, billions of years ago, Mars had rushing rivers, lakes, and perhaps an ocean.',
      habitability: 'Could humans live on Mars? Yes, with pressurized habitats and spacesuits! Mars has water ice locked in its polar ice caps and underground soil that future astronauts could melt for drinking water and rocket fuel.'
    },
    suggestedQuestions: [
      'Why is Mars red?',
      'How tall is Olympus Mons?',
      'Did Mars ever have liquid water and oceans?',
      'Could humans live on Mars in the future?'
    ]
  },

  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    category: 'Gas Giant (King of Planets)',
    tagline: 'The Colossal King of Planets and Storms! 🌀',
    greeting: "Behold Jupiter, the King of Planets! 🌀 Jupiter is so enormous that you could fit all the other planets in the solar system inside it with room to spare! Its famous Great Red Spot is a giant spinning storm that has been raging for hundreds of years!",
    quickFacts: {
      distanceFromSun: '5.20 AU (778.5 million km)',
      diameter: '139,820 km (11 times wider than Earth)',
      orbitalPeriod: '11.86 Earth years',
      dayLength: '9 hours and 56 minutes (fastest rotation in the solar system!)',
      moons: '95 recognized moons (including Io, Europa, Ganymede, Callisto)',
      magneticField: '14 times stronger than Earth’s'
    },
    sections: {
      size: 'Jupiter is the true heavyweight of our solar system! Over 1,300 Earths could fit inside its vast volume, and it is 2.5 times more massive than all other planets combined!',
      atmosphere: 'Jupiter has no solid ground! It is made almost entirely of hydrogen and helium gas. Its colorful cloud bands are whipped by jet streams flowing at up to 600 km/h, creating swirling storms, white ovals, and reddish eddies.',
      surface: 'If you tried to stand on Jupiter, you would sink right into its dense clouds until the crushing pressure turns hydrogen gas into liquid metallic hydrogen—a conductive metal ocean thousands of miles deep!',
      temperature: 'The outer cloud tops are frigid at -145°C (-230°F), but near the planet’s core, temperatures soar to an estimated 24,000°C (43,000°F)!',
      moons: 'Jupiter has a mini solar system of 95 known moons! The four largest are the Galilean moons: volcanic Io, icy ocean-world Europa, giant Ganymede (bigger than Mercury), and cratered Callisto.',
      exploration: 'Pioneered by Voyager 1 and 2, Galileo, New Horizons, and currently NASA’s Juno orbiter. The ESA Juice mission is on its way to explore Jupiter’s icy ocean moons!',
      coolFact: 'The Great Red Spot is so huge that Earth could easily fit right inside it! Jupiter also acts as a "cosmic vacuum cleaner"—its mighty gravity pulls in asteroids and comets, shielding the inner planets from frequent impacts.',
      habitability: 'Jupiter itself is completely uninhabitable, but its icy moon Europa hides a warm saltwater ocean under its ice crust with twice as much water as all of Earth’s oceans combined!'
    },
    suggestedQuestions: [
      'What is the Great Red Spot?',
      'Does Jupiter have a solid surface?',
      'Why is Europa so interesting to scientists?',
      'How fast does Jupiter spin?'
    ]
  },

  saturn: {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    category: 'Gas Giant',
    tagline: 'The Ringed Jewel of the Solar System! 🪐',
    greeting: "Welcome to Saturn, the crowned jewel of our planetary neighborhood! 🪐 Those breathtaking rings span 282,000 km across, yet they are as thin as a single sheet of paper compared to their width! Saturn is so light that if you had a bathtub big enough, it would actually float!",
    quickFacts: {
      distanceFromSun: '9.58 AU (1.43 billion km)',
      diameter: '116,460 km (9 times wider than Earth)',
      orbitalPeriod: '29.4 Earth years',
      dayLength: '10 hours and 33 minutes',
      moons: '146 confirmed moons (most in the solar system!)',
      ringSpan: 'Up to 282,000 km wide, but only ~10 to 30 meters thick'
    },
    sections: {
      size: 'Saturn is the second-largest planet in the solar system, with a diameter of 116,460 km—about 764 Earths could fit inside!',
      atmosphere: 'Like Jupiter, Saturn is a gas giant primarily made of hydrogen and helium. Ammonia crystals in the upper atmosphere give it a soft golden-yellow hue.',
      surface: 'Saturn has no solid surface to walk on. Its atmospheric gas gradually compresses into liquid hydrogen and helium as you travel deeper.',
      temperature: 'The average temperature at Saturn’s cloud tops is a chilly -178°C (-288°F).',
      moons: 'Saturn is the moon champion with 146 confirmed moons! Its largest moon, Titan, is larger than Mercury and possesses a thick nitrogen atmosphere with rivers and lakes of liquid methane. Tiny Enceladus sprays icy geysers from an underground ocean into space!',
      exploration: 'NASA’s Cassini spacecraft spent 13 glorious years orbiting Saturn from 2004 to 2017, discovering ocean plumes on Enceladus and landing the ESA Huygens probe on Titan!',
      coolFact: 'Saturn’s rings are not solid sheets—they are made of billions of glittering chunks of water ice and rock, ranging in size from tiny sugar crystals to mountain-sized boulders! Saturn is also the least dense planet—it has a lower density than water!',
      habitability: 'While Saturn itself cannot support life, both Titan (with its prebiotic organic chemistry) and Enceladus (with its hydrothermal vents beneath the ice) are among the top places in our solar system to search for alien life!'
    },
    suggestedQuestions: [
      'What are Saturn’s rings made of?',
      'Would Saturn really float in water?',
      'What did Cassini discover at Enceladus?',
      'How many moons does Saturn have?'
    ]
  },

  uranus: {
    id: 'uranus',
    name: 'Uranus',
    type: 'planet',
    category: 'Ice Giant',
    tagline: 'The Sideways Tilted Ice Giant! ❄️',
    greeting: "Welcome to Uranus, the ice giant! ❄️ Notice anything unusual? Uranus rolls around the Sun on its side like a bowling ball! It is wrapped in pale cyan clouds of methane ice and is the coldest planetary atmosphere in our solar system!",
    quickFacts: {
      distanceFromSun: '19.2 AU (2.87 billion km)',
      diameter: '50,724 km (4 times wider than Earth)',
      orbitalPeriod: '84 Earth years',
      tilt: '97.77 degrees (rolls on its side!)',
      surfaceTemp: '-224°C (-371°F) — coldest recorded atmosphere',
      moons: '28 known moons (named after Shakespearean characters)'
    },
    sections: {
      size: 'Uranus is four times wider than Earth, measuring 50,724 km in diameter. About 63 Earths could fit inside it.',
      atmosphere: 'Uranus has an atmosphere of hydrogen, helium, and methane. Methane gas absorbs red light and reflects cyan-blue, giving Uranus its serene turquoise color.',
      surface: 'Uranus is an "ice giant"—instead of mostly hydrogen gas, about 80% of its mass is a hot, dense slush of "icy" materials: water, ammonia, and methane over a small rocky core.',
      temperature: 'Uranus holds the record for the lowest planetary temperature recorded in the solar system, plunging down to an icy -224°C (-371°F)!',
      moons: 'Uranus has 28 moons named after characters from the plays of William Shakespeare and Alexander Pope, including Miranda, Ariel, Umbriel, Titania, and Oberon.',
      exploration: 'NASA’s Voyager 2 is the ONLY spacecraft that has ever visited Uranus, flying past it in January 1986 and discovering 10 new moons and two rings.',
      coolFact: 'Scientists believe that a massive protoplanet the size of Earth smashed into Uranus billions of years ago, permanently knocking it onto its side! Because of this extreme tilt, each pole gets 42 years of continuous sunlight followed by 42 years of total darkness!',
      habitability: 'Uranus has no solid surface, crushing atmospheric pressure, and extreme cold, making it completely uninhabitable for humans.'
    },
    suggestedQuestions: [
      'Why is Uranus tilted on its side?',
      'Why does Uranus look cyan-blue?',
      'Which spacecraft has visited Uranus?',
      'What are the moons of Uranus named after?'
    ]
  },

  neptune: {
    id: 'neptune',
    name: 'Neptune',
    type: 'planet',
    category: 'Ice Giant',
    tagline: 'The Windy Deep-Blue Wonder of the Outer Rim! 🌊',
    greeting: "Welcome to Neptune, the outermost major planet in our solar system! 🌊 Look at that vivid cobalt blue color! Neptune is home to the most ferocious, supersonic winds ever discovered, reaching an incredible 2,100 km/h!",
    quickFacts: {
      distanceFromSun: '30.07 AU (4.5 billion km)',
      diameter: '49,244 km',
      orbitalPeriod: '165 Earth years',
      dayLength: '16 hours and 6 minutes',
      windSpeeds: 'Up to 2,100 km/h (faster than the speed of sound!)',
      moons: '16 known moons (including giant Triton)'
    },
    sections: {
      size: 'Neptune is slightly smaller than Uranus in diameter (49,244 km), but it is denser and more massive! It is about 17 times the mass of Earth.',
      atmosphere: 'Neptune’s atmosphere is thick with hydrogen, helium, and methane. Its striking deep-azure color is caused by atmospheric methane and an unknown atmospheric component that intensifies the blue.',
      surface: 'Like Uranus, Neptune has no solid crust—it is an ice giant with a mantle of super-pressurized, super-heated water, ammonia, and methane ice surrounding an Earth-sized rocky core.',
      temperature: 'Average cloud-top temperatures are -218°C (-360°F).',
      moons: 'Neptune has 16 moons. Its crown jewel is Triton, a frozen world with active nitrogen geysers that orbits backwards (retrograde), proving it was captured from the Kuiper Belt!',
      exploration: 'Voyager 2 flew past Neptune in August 1989, capturing the first close-up images of its Great Dark Spot, delicate rings, and Triton’s geysers.',
      coolFact: 'Neptune is so far from the Sun that since its discovery in 1846, it only completed its very first full orbit around the Sun in 2011—165 Earth years later!',
      habitability: 'Supersonic winds, freezing temperatures, and no solid surface make human life impossible on Neptune.'
    },
    suggestedQuestions: [
      'How fast are the winds on Neptune?',
      'Why is Neptune so deeply blue?',
      'What makes Triton so special?',
      'How long does one year last on Neptune?'
    ]
  },

  // =========================================================================
  // NATURAL SATELLITES & MOONS
  // =========================================================================
  moon: {
    id: 'moon',
    name: 'The Moon (Luna)',
    type: 'moon',
    category: 'Earth’s Natural Satellite',
    tagline: 'Our Celestial Stepping Stone and Night Light! 🌕',
    greeting: "Welcome to our Moon! 🌕 Earth's loyal companion has orbited us for 4.5 billion years. It is the only celestial body beyond Earth where human footprints have walked in the dust!",
    quickFacts: {
      distanceFromEarth: '384,400 km (1.3 light-seconds)',
      diameter: '3,474 km (about 27% of Earth)',
      orbitalPeriod: '27.3 Earth days',
      gravity: '16.6% of Earth (one-sixth gravity)',
      surfaceTemp: '-130°C at night to 120°C in sunlight'
    },
    sections: {
      size: 'The Moon is the fifth-largest moon in the solar system, with a diameter of 3,474 km.',
      atmosphere: 'The Moon has no real atmosphere—only a faint exosphere. Because there is no wind or rain, footprints left by Apollo astronauts will remain preserved for millions of years!',
      surface: 'Covered in fine pulverized rock called regolith. The dark smooth areas are called "maria" (ancient basaltic lava plains), surrounded by heavily cratered highlands.',
      exploration: 'Twelve human astronauts walked on the Moon between 1969 and 1972 during NASA’s Apollo program. Robotic landers like Surveyor 1, Chang\'e, and Chandrayaan-3 have explored its surface.',
      coolFact: 'The Moon is tidally locked to Earth, meaning it always shows the exact same face to us! We never saw the mysterious "Far Side" of the Moon until Soviet probe Luna 3 photographed it in 1959.',
      habitability: 'NASA’s Artemis program plans to establish a permanent human base camp near the lunar South Pole, where shadowed craters hold water ice!'
    },
    suggestedQuestions: [
      'Why do footprints stay on the Moon?',
      'How many people have walked on the Moon?',
      'Is there water on the Moon?',
      'What is on the far side of the Moon?'
    ]
  },

  titan: {
    id: 'titan',
    name: 'Titan',
    type: 'moon',
    category: 'Saturn’s Super-Moon',
    tagline: 'The Golden Moon of Methane Rivers and Dunes! 🧪',
    greeting: "Welcome to Titan! 🧪 Saturn's largest moon is one of the most fascinating places in the solar system. It is the only moon with a thick, dense atmosphere, and the only world besides Earth with flowing rivers, lakes, and rainfall—except its rain is made of liquid methane!",
    quickFacts: {
      parentPlanet: 'Saturn',
      diameter: '5,150 km (larger than planet Mercury!)',
      surfacePressure: '1.5 times Earth’s atmospheric pressure',
      surfaceTemp: '-179°C (-290°F)',
      atmosphere: '95% Nitrogen, 5% Methane'
    },
    sections: {
      size: 'Titan is enormous! At 5,150 km wide, it is larger than planet Mercury and 50% wider than Earth’s Moon.',
      atmosphere: 'Titan has a dense orange-hued atmosphere with 1.5 times the surface pressure of Earth. It is thick enough that if you strapped wings to your arms, you could literally flap your wings and fly in its low gravity!',
      surface: 'Titan has coastlines, islands, and vast lakes like Kraken Mare and Ligeia Mare filled with liquid hydrocarbons (methane and ethane) instead of water.',
      exploration: 'The ESA Huygens probe parachuted through Titan’s haze in 2005, transmitting photographs of rounded ice pebbles on a damp riverbed. NASA is developing the Dragonfly rotorcraft to fly across Titan in the 2030s!',
      coolFact: 'On Titan, water ice is as hard as granite rock! Methane plays the role that water plays on Earth: it evaporates into clouds, rains from the sky, carves river channels, and pools into lakes.',
      habitability: 'Could humans visit? You would need a suit to protect against -179°C cold and an oxygen mask, but you wouldn’t need a pressurized suit because the air pressure is similar to Earth!'
    },
    suggestedQuestions: [
      'What are Titan’s lakes made of?',
      'Could a human fly on Titan with wings?',
      'What did the Huygens probe find on Titan?',
      'What is NASA’s Dragonfly mission?'
    ]
  },

  europa: {
    id: 'europa',
    name: 'Europa',
    type: 'moon',
    category: 'Jupiter’s Ocean Moon',
    tagline: 'The Ice Shell World Hiding a Global Ocean! 🧊',
    greeting: "Welcome to Europa! 🧊 Beneath that smooth, cracked shell of water ice lies a global saltwater ocean containing more water than all of Earth's oceans combined! Many scientists believe Europa is our best bet for finding extraterrestrial life in our solar system!",
    quickFacts: {
      parentPlanet: 'Jupiter',
      diameter: '3,122 km (slightly smaller than Earth’s Moon)',
      iceShellThickness: '15 to 25 km thick',
      oceanDepth: '60 to 150 km deep',
      surfaceTemp: '-160°C to -220°C'
    },
    sections: {
      size: 'Europa has a diameter of 3,122 km, making it the sixth-largest moon in the solar system.',
      surface: 'Europa is one of the smoothest objects in the solar system, crisscrossed by long reddish-brown fracture lines called "lineae" where underground ocean water seeps up and freezes.',
      ocean: 'Tidal gravitational flexing from giant Jupiter keeps Europa’s interior warm, preventing its ocean from freezing solid.',
      exploration: 'NASA’s Galileo and Juno probes have mapped Europa up close. NASA’s Europa Clipper mission launched in 2024 to determine if Europa has conditions suitable for life.',
      coolFact: 'If you melted all the water on Europa, it would make a sphere of water twice as large as all the oceans, rivers, and ice caps on Earth combined!',
      habitability: 'Deep on Europa’s ocean floor, hydrothermal vents powered by volcanic heat could provide energy and chemical nutrients for alien life, just like deep-sea vents on Earth!'
    },
    suggestedQuestions: [
      'Is there alien life in Europa’s ocean?',
      'How thick is the ice on Europa?',
      'Why doesn’t Europa’s ocean freeze solid?',
      'What will the Europa Clipper spacecraft do?'
    ]
  },

  // =========================================================================
  // DWARF PLANETS & ASTEROIDS
  // =========================================================================
  pluto: {
    id: 'pluto',
    name: 'Pluto',
    type: 'dwarf_planet',
    category: 'Dwarf Planet & Kuiper Belt King',
    tagline: 'The Heart-Shaped Wonder of the Outer Twilight! 💖',
    greeting: "Hello from the outer rim! 💖 You're looking at Pluto, the famous dwarf planet! When NASA's New Horizons probe flew past Pluto in 2015, it revealed a glorious heart-shaped glacier of nitrogen ice named Tombaugh Regio and majestic mountains of frozen water!",
    quickFacts: {
      distanceFromSun: '39.5 AU (5.9 billion km)',
      diameter: '2,377 km (about two-thirds the width of Earth’s Moon)',
      orbitalPeriod: '248 Earth years',
      moons: '5 (Charon, Styx, Nix, Kerberos, Hydra)',
      surfaceTemp: '-230°C (-382°F)'
    },
    sections: {
      size: 'Pluto is 2,377 km wide. If you laid Pluto across the United States, it would stretch from California to Kansas!',
      surface: 'Pluto has nitrogen and methane glaciers, blue skies created by atmospheric tholin haze, and mountains made of water ice as tall as the Rocky Mountains!',
      exploration: 'NASA’s New Horizons spacecraft made a historic flyby on July 14, 2015, capturing the first high-definition photos of Pluto and its giant moon Charon.',
      coolFact: 'Pluto and its largest moon, Charon, orbit each other like a double-planet system! Charon is so large that the center of gravity they orbit around is actually in open space between them!',
      habitability: 'At -230°C with an atmosphere that freezes and falls as snow when Pluto is furthest from the Sun, Pluto is completely uninhabitable.'
    },
    suggestedQuestions: [
      'Why is Pluto called a dwarf planet?',
      'What is Pluto’s heart made of?',
      'How big is Pluto’s moon Charon?',
      'What did New Horizons discover at Pluto?'
    ]
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
    greeting: "You have arrived at Voyager 1! 🚀 Launched by NASA on September 5, 1977, Voyager 1 is the most distant human-made object in history! It has crossed the heliopause and is now soaring through the pristine interstellar medium between the stars!",
    quickFacts: {
      agency: 'NASA / JPL-Caltech',
      launchDate: 'September 5, 1977',
      distanceFromSun: '163.7+ AU (over 24.5 billion km)',
      speed: '16.9 km/s (over 61,000 km/h)',
      destination: 'Interstellar Medium (Heading toward Ophiuchus)',
      status: 'Active & Transmitting Scientific Telemetry'
    },
    sections: {
      mission: 'Voyager 1 was built to explore the outer giants, conducting breathtaking flybys of Jupiter in 1979 and Saturn and Titan in 1980, before using planetary gravity assists to fling itself toward the stars.',
      discoveries: 'Voyager 1 discovered active volcanoes on Jupiter’s moon Io, intricate ringlets around Saturn, the dense nitrogen haze of Titan, and confirmed the boundary where solar wind meets interstellar space.',
      goldenRecord: 'Attached to Voyager 1’s side is the famous Golden Record—a gold-plated copper phonograph record carrying sounds of Earth, greetings in 55 languages, music by Bach and Chuck Berry, and 115 pictures explaining humanity to potential extraterrestrial civilizations!',
      powerSource: 'Powered by Radioisotope Thermoelectric Generators (RTGs) converting heat from decaying Plutonium-238 into electricity. Its thrusters and instruments have continued operating for nearly half a century!',
      coolFact: 'In 1990, at the request of astronomer Carl Sagan, Voyager 1 turned its camera back toward Earth from 6 billion kilometers away and took the famous "Pale Blue Dot" photograph, showing Earth as a tiny speck of dust suspended in a sunbeam.'
    },
    suggestedQuestions: [
      'What is the Golden Record on Voyager 1?',
      'How far has Voyager 1 traveled?',
      'What was the Pale Blue Dot picture?',
      'How does Voyager 1 transmit data back to Earth?'
    ]
  },

  'cassini-huygens': {
    id: 'cassini-huygens',
    name: 'Cassini-Huygens',
    type: 'spacecraft',
    category: 'Planetary Orbiter & Titan Lander',
    tagline: 'The Legendary Explorer of Saturn and Its Rings! 🪐',
    greeting: "Behold the magnificent Cassini-Huygens spacecraft! 🪐 A joint mission between NASA, ESA, and ASI, Cassini spent 13 incredible years exploring Saturn, its glowing rings, and its family of ocean moons before performing its daring Grand Finale dive into Saturn’s clouds in 2017!",
    quickFacts: {
      agency: 'NASA / ESA / ASI',
      launchDate: 'October 15, 1997',
      saturnArrival: 'July 1, 2004',
      grandFinale: 'September 15, 2017',
      discoveries: 'Enceladus ocean plumes, Titan lakes, Saturn ring waves',
      status: 'Completed (Intentional atmospheric entry)'
    },
    sections: {
      mission: 'Cassini was one of the largest and most ambitious interplanetary spacecraft ever launched, weighing over 5,700 kg. It carried the European Space Agency’s Huygens probe, which landed on Titan on January 14, 2005.',
      discoveries: 'Cassini made revolutionary discoveries: it found geysers of water vapor and organic molecules spraying from the south pole of Enceladus, revealed liquid methane lakes and rain on Titan, and measured the mass and age of Saturn’s rings.',
      grandFinale: 'To protect the pristine ocean moons Enceladus and Titan from any chance of bacterial contamination, Cassini spent its final month making 22 heroic dives between Saturn and its rings, finally plunging into Saturn’s atmosphere while transmitting scientific data until its final second.',
      coolFact: 'Cassini flew directly through the icy plumes erupting from Enceladus, "tasting" the spray with its mass spectrometer and detecting salt, silica, and complex organic molecules indicating hydrothermal vents on an alien ocean floor!'
    },
    suggestedQuestions: [
      'What did Cassini find at Enceladus?',
      'What was Cassini’s Grand Finale?',
      'How did the Huygens probe land on Titan?',
      'How big was the Cassini spacecraft?'
    ]
  },

  'surveyor-1': {
    id: 'surveyor-1',
    name: 'Surveyor 1',
    type: 'spacecraft',
    category: 'Lunar Soft Lander',
    tagline: 'America’s First Soft-Lander on the Moon! 🌕',
    greeting: "You have located Surveyor 1! 🌕 Launched in May 1966, Surveyor 1 proved that a spacecraft could touch down softly on the Moon without sinking into deep dust! Its success paved the way for the Apollo 11 human landing three years later!",
    quickFacts: {
      agency: 'NASA / JPL-Caltech',
      launchDate: 'May 30, 1966',
      landingDate: 'June 2, 1966',
      landingSite: 'Flamsteed P, Oceanus Procellarum, The Moon',
      photosReturned: '11,237 television photos',
      status: 'Historical Monument on Lunar Surface'
    },
    sections: {
      mission: 'Surveyor 1 was the first American robotic spacecraft to achieve a soft touchdown on an extraterrestrial body. It used throttleable retro-rockets and radar altimeters to slow down from 9,700 km/h to a gentle 13 km/h touchdown.',
      significance: 'Before Surveyor 1, some scientists feared that the Moon was covered in a deep sea of powdery dust that would swallow astronauts and heavy landers! Surveyor’s three landing pads proved the lunar soil was solid and safe to walk on.',
      coolFact: 'Surveyor 1 transmitted over 11,000 crisp black-and-white television pictures of the lunar terrain, rocks, and the spacecraft’s own shadow, demonstrating that robotic telemetry could be broadcast live to Earth!'
    },
    suggestedQuestions: [
      'Why was Surveyor 1 so important for Apollo?',
      'Did scientists think the Moon was quicksand?',
      'Where did Surveyor 1 land?',
      'How many photos did Surveyor 1 send back?'
    ]
  },

  'mars-pathfinder': {
    id: 'mars-pathfinder',
    name: 'Mars Pathfinder & Sojourner',
    type: 'spacecraft',
    category: 'Mars Lander & Rover',
    tagline: 'The Mission that Rolled Humankind into the Rover Era! 🤖',
    greeting: "Welcome to Mars Pathfinder and Sojourner! 🤖 Touching down on Ares Vallis on July 4, 1997, Pathfinder pioneered the famous bouncing airbag landing system, and delivered Sojourner—the first wheeled rover ever driven on another planet!",
    quickFacts: {
      agency: 'NASA / JPL-Caltech',
      launchDate: 'December 4, 1996',
      landingDate: 'July 4, 1997',
      landingSite: 'Ares Vallis, Mars',
      roverName: 'Sojourner (10.6 kg micro-rover)',
      status: 'Historical Monument on Martian Surface'
    },
    sections: {
      mission: 'Pathfinder was designed as a low-cost proof-of-concept for Mars exploration. Surrounded by a cocoon of giant bouncing airbags, it bounced 15 times across the rocky surface of Ares Vallis before safely opening its solar petals.',
      sojourner: 'Sojourner was a 6-wheeled microwave-oven-sized rover weighing just 10.6 kg. It spent 83 days driving around rocks nicknamed "Barnacle Bill", "Yogi", and "Scooby-Doo", analyzing their chemical composition with an alpha proton X-ray spectrometer.',
      coolFact: 'Sojourner was the pioneer of all Mars rovers! Its successful 6-wheel rocker-bogie suspension system became the foundational blueprint for Spirit, Opportunity, Curiosity, and Perseverance!'
    },
    suggestedQuestions: [
      'How did Mars Pathfinder use airbags to land?',
      'What was Sojourner rover’s mission?',
      'Why were rocks named Barnacle Bill and Yogi?',
      'How big was Sojourner compared to Perseverance?'
    ]
  },

  'venera-13': {
    id: 'venera-13',
    name: 'Venera 13',
    type: 'spacecraft',
    category: 'Venus Surface Lander',
    tagline: 'The Soviet Steel Titan that Survived the Hell of Venus! 🌋',
    greeting: "You have uncovered Venera 13! 🌋 Launched by the Soviet Union in 1981, this heavily armored titanium probe plunged through Venus's sulfuric acid clouds and survived 127 minutes in 457°C heat and 89 atmospheres of crushing pressure to beam back the first color panoramas of the Venusian surface!",
    quickFacts: {
      agency: 'Soviet Space Program (IKI / Lavochkin)',
      launchDate: 'October 30, 1981',
      landingDate: 'March 1, 1982',
      landingSite: 'East of Phoebe Regio, Venus',
      survivalDuration: '127 minutes (Design life was only 32 minutes!)',
      surfaceConditions: '457°C (855°F) & 89 bar atmospheric pressure'
    },
    sections: {
      mission: 'Venera 13 was an engineering marvel built to withstand extreme heat and pressure. It used an aerobraking drag ring, parachutes, and a shock-absorbing landing ring to touch down in a rocky volcanic plain.',
      achievements: 'Venera 13 recorded the first color 360-degree panoramic photos of Venus, drilled into the basaltic rock to analyze soil chemistry, and recorded the eerie acoustic roar of Venusian surface wind with an onboard microphone!',
      coolFact: 'Venera 13 was designed to survive only 32 minutes before frying, but it held out against the hellish pressure for an astonishing 127 minutes (over 2 hours!), sending 14 color photos back to Earth before going silent!'
    },
    suggestedQuestions: [
      'How did Venera 13 survive the heat on Venus?',
      'What did the first color photos of Venus look like?',
      'Did Venera 13 record sound on Venus?',
      'How deep is the atmosphere on Venus?'
    ]
  }
};

/**
 * Get knowledge profile for any celestial body ID or spacecraft slug.
 */
export function getNovaProfile(idOrSlug) {
  if (!idOrSlug) return null;
  const key = idOrSlug.toLowerCase();

  // Direct match
  if (NOVA_KNOWLEDGE_BASE[key]) {
    return NOVA_KNOWLEDGE_BASE[key];
  }

  // Handle aliases & mapping
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
    'titan': 'titan',
    'europa': 'europa',
    'voyager1': 'voyager-1',
    'voyager-1': 'voyager-1',
    'voyager2': 'voyager-1', // share voyager architecture
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

  return null;
}
