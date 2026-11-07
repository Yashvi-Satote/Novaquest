/**
 * novaSpaceKnowledge.js
 * 
 * Comprehensive, verified scientific educational knowledge base for NOVA,
 * the personal space exploration companion of NovaQuest.
 * 
 * Designed for kids, students, and space enthusiasts:
 * - Simple, engaging, child-friendly language
 * - Strictly factual (NASA, ESA, JPL Horizons, and IAU verified)
 * - Structured categories covering size, distance, atmosphere, surface, exploration, habitability, and milestones.
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
    greeting: "Greetings, space traveler! ☀️ I am NOVA! You're looking at our star, the Sun! It holds 99.86% of ALL the mass in the entire solar system. Its gravity keeps all planets, asteroids, and comets in orbit around it!",
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
      discovery: 'Ancient human civilizations have revered the Sun since prehistoric times. Nicolaus Copernicus mathematically proved in 1543 that the Earth and planets orbit around the Sun (heliocentrism).',
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
      discovery: 'Known since antiquity because it is visible to the naked eye. Galileo Galilei made the first telescopic observations of Mercury in the early 17th century.',
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
      surface: 'Venus is covered in volcanic plains, thousands of ancient volcanoes, and cracked basalt rock. Soviet Venera landers took the only photos ever captured from its surface, revealing orange-tinted rock slabs!',
      temperature: 'Venus is the hottest planet in our solar system at a steady 465°C (869°F). Its runaway greenhouse effect traps heat so effectively that night and day are equally scorching!',
      moons: 'Venus has no moons and no rings.',
      discovery: 'Observed by ancient civilizations across the world as the Morning Star and Evening Star. Galileo discovered in 1610 that Venus shows phases like the Moon, proving it orbits the Sun.',
      exploration: 'Robotic explorers have dared to enter its inferno! NASA’s Mariner 2 performed the first successful interplanetary flyby in 1962. Soviet Venera landers like Venera 13 touched down on its blazing surface in 1982.',
      coolFact: 'Venus spins backward compared to most other planets (retrograde rotation), meaning the Sun rises in the west and sets in the east! Also, Venus rotates so slowly that one single day on Venus lasts longer than an entire Venusian year!',
      habitability: 'Could humans live on Venus? On the surface, no human could survive for even a few seconds. However, high up in Venus’s clouds (about 50 km altitude), the temperature and pressure are surprisingly similar to Earth!'
    },
    suggestedQuestions: [
      'Why is Venus hotter than Mercury?',
      'Why does Venus spin backward?',
      'How did Soviet landers survive on Venus?',
      'Could humans live in floating cities on Venus?'
    ]
  },

  earth: {
    id: 'earth',
    name: 'Earth',
    type: 'planet',
    category: 'Terrestrial Planet (Our Home)',
    tagline: 'The Blue Oasis of Life! 🌍',
    greeting: "Welcome home, astronaut! 🌍 This is Earth, our beautiful blue marble! It is the only known planet in the universe that supports life, with liquid water oceans covering 71% of its surface and a protective blanket of breathable air!",
    quickFacts: {
      distanceFromSun: '1.00 AU (149.6 million km)',
      diameter: '12,742 km',
      orbitalPeriod: '365.25 days',
      dayLength: '24 hours',
      moons: '1 (The Moon)',
      surfaceTemp: '-89°C to 57°C (Average 15°C / 59°F)'
    },
    sections: {
      size: 'Earth is the largest of the four rocky inner planets, with an equatorial diameter of 12,742 km.',
      atmosphere: 'Earth’s atmosphere is a perfect life-sustaining recipe: 78% nitrogen, 21% oxygen, and 1% argon and trace gases. The ozone layer shields us from harmful solar ultraviolet radiation.',
      surface: 'A dynamic world of continents, mountains, polar ice sheets, and deep oceans. Plate tectonics constantly reshape the landscape, recycle carbon, and maintain volcanic stability.',
      temperature: 'Earth’s average temperature is a comfortable 15°C (59°F), stabilized by its oceans, atmosphere, and balanced greenhouse effect.',
      moons: 'Earth has one large natural satellite: the Moon (Luna), which stabilizes Earth’s axial tilt and creates ocean tides!',
      discovery: 'Our ancestral home planet. Eratosthenes of Cyrene first accurately calculated the circumference of Earth in 240 BC using shadows cast by sunlight in Egypt!',
      exploration: 'Humanity has explored every continent and ocean, and thousands of artificial satellites, space stations like the ISS, and orbital telescopes monitor our planet from space 24/7.',
      coolFact: 'Earth is traveling around the Sun at a blistering speed of 107,000 km/h (67,000 mph)—yet we do not feel it because everything around us moves at the same smooth velocity!',
      habitability: 'Earth is the Goldilocks planet of the solar system—not too hot, not too cold, but just right for liquid water and millions of species of living organisms!'
    },
    suggestedQuestions: [
      'Why is Earth the only planet with life?',
      'How fast is Earth moving through space?',
      'What protects Earth from cosmic radiation?',
      'How does the Moon affect life on Earth?'
    ]
  },

  mars: {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    category: 'Terrestrial Planet',
    tagline: 'The Red Planet of Giant Canyons and Rovers! 🔴',
    greeting: "Welcome to Mars, the Red Planet! 🔴 Look at that rusty color—it comes from iron oxide (rust) covering the rocks and sand! Mars is home to the biggest volcano and deepest canyon in the entire solar system. Let's explore!",
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
      discovery: 'Documented by ancient Egyptian astronomers in the 2nd millennium BC as "Horus of the Horizon". Named by the Romans after their god of war.',
      exploration: 'Mars is the most explored planet beyond Earth! Fleets of robotic explorers like NASA’s Curiosity and Perseverance rovers, the Ingenuity helicopter, and orbiters from NASA, ESA, ISRO, and UAE are searching for signs of ancient microbial life.',
      coolFact: 'Mars has massive dust storms that can grow so large they swallow the entire planet in red dust for months at a time! Also, billions of years ago, Mars had rushing rivers, lakes, and an ocean.',
      habitability: 'Could humans live on Mars? Yes, with pressurized habitats and spacesuits! Mars has water ice locked in its polar ice caps and underground soil that future astronauts could melt for drinking water and rocket fuel.'
    },
    suggestedQuestions: [
      'Why is Mars red?',
      'How tall is Olympus Mons?',
      'Did Mars ever have liquid water and oceans?',
      'Could humans live on Mars in the future?'
    ]
  },

  ceres: {
    id: 'ceres',
    name: 'Ceres',
    type: 'dwarf_planet',
    category: 'Asteroid Belt Dwarf Planet',
    tagline: 'The Mysterious Water-Ice Queen of the Asteroid Belt! 🪨',
    greeting: "Welcome to Ceres! 🪨 Ceres is the largest object in the main asteroid belt between Mars and Jupiter. It is so big that it makes up one-third of the total mass of the entire asteroid belt, and it's classified as a dwarf planet!",
    quickFacts: {
      distanceFromSun: '2.77 AU (414 million km)',
      diameter: '940 km (about the width of Texas)',
      orbitalPeriod: '4.6 Earth years',
      dayLength: '9 hours and 4 minutes',
      moons: '0 moons',
      surfaceTemp: '-105°C to -38°C'
    },
    sections: {
      size: 'Ceres has a diameter of 940 km. It is the smallest identified dwarf planet, but by far the largest body between Mars and Jupiter!',
      atmosphere: 'Ceres has a very faint, temporary water vapor exosphere produced when sunlight warms patches of surface water ice.',
      surface: 'Its dark, cratered surface is rich in clay minerals, carbonates, and water ice. Its most famous feature is Occator Crater, which glows with bright white salt deposits left by underground briny cryomagma!',
      temperature: 'Temperatures on Ceres range from -105°C up to -38°C in direct sunlight.',
      moons: 'Ceres has no moons and no rings.',
      discovery: 'Discovered on January 1, 1801, by Italian astronomer Giuseppe Piazzi. It was initially considered a planet, then an asteroid for over two centuries, and reclassified as a dwarf planet in 2006.',
      exploration: 'NASA’s Dawn spacecraft orbited Ceres from 2015 to 2018, mapping its mysterious bright spots, Ahuna Mons (a giant ice volcano), and discovering extensive subsurface water ice!',
      coolFact: 'Scientists estimate that Ceres’s rocky mantle and water-ice crust may contain more freshwater than all the rivers and lakes on Earth combined!',
      habitability: 'Ceres is an airless, freezing world, but its abundant water ice and mineral salts make it an ideal future refueling stop for human spacecraft heading to the outer solar system!'
    },
    suggestedQuestions: [
      'What are the bright spots on Ceres?',
      'Is there water on Ceres?',
      'Why is Ceres called a dwarf planet?',
      'What did NASA’s Dawn mission discover?'
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
      size: 'Jupiter is the true heavyweight of our solar system! Over 1,300 Earths could fit inside its volume, and it is 2.5 times more massive than all other planets combined!',
      atmosphere: 'Jupiter has no solid ground! It is made almost entirely of hydrogen and helium gas. Its colorful cloud bands are whipped by jet streams flowing at up to 600 km/h, creating swirling storms, white ovals, and reddish eddies.',
      surface: 'If you tried to stand on Jupiter, you would sink into its dense clouds until the crushing pressure turns hydrogen gas into liquid metallic hydrogen—a conductive metal ocean thousands of miles deep!',
      temperature: 'The outer cloud tops are frigid at -145°C (-230°F), but near the planet’s core, temperatures soar to an estimated 24,000°C (43,000°F)!',
      moons: 'Jupiter has a mini solar system of 95 known moons! The four largest are the Galilean moons: volcanic Io, icy ocean-world Europa, giant Ganymede (bigger than Mercury), and cratered Callisto.',
      discovery: 'Known since prehistoric antiquity. Galileo Galilei made history in 1610 when he discovered its four largest moons, proving for the first time that celestial objects could orbit a body other than Earth.',
      exploration: 'Pioneered by Pioneer 10 and 11, Voyager 1 and 2, Galileo, New Horizons, and currently NASA’s Juno orbiter. The ESA Juice mission is on its way to explore Jupiter’s icy ocean moons!',
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
      discovery: 'Visible to the naked eye and known since ancient times. Christiaan Huygens discovered Saturn’s largest moon Titan in 1655 and correctly deduced that Saturn was surrounded by a flat ring.',
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
    tagline: 'The Tilted Cyan Ice World! ❄️',
    greeting: "Welcome to Uranus, the sideways planet! ❄️ Uranus is a pale cyan ice giant that orbits the Sun tilted completely on its side, like a rolling bowling ball! Because of this extreme 98-degree tilt, each pole gets 42 years of continuous sunlight followed by 42 years of darkness!",
    quickFacts: {
      distanceFromSun: '19.2 AU (2.87 billion km)',
      diameter: '50,724 km (4 times wider than Earth)',
      orbitalPeriod: '84 Earth years',
      dayLength: '17 hours and 14 minutes',
      axialTilt: '97.8° (spins on its side)',
      moons: '28 known moons'
    },
    sections: {
      size: 'Uranus is the third-largest planet in diameter, measuring 50,724 km across—about four times the width of Earth!',
      atmosphere: 'Uranus has an atmosphere of hydrogen, helium, and methane. The methane gas absorbs red light and reflects back glorious shades of cyan and aquamarine blue!',
      surface: 'Uranus does not have a solid rocky surface. Under its gaseous atmosphere lies a hot, dense slush of "icy" materials: water, ammonia, and methane fluids surrounding a small rocky core.',
      temperature: 'Uranus holds the record for the coldest recorded atmospheric temperature of any major planet, dropping to a freezing -224°C (-371°F)!',
      moons: 'Uranus has 28 known moons, all named after characters from the works of William Shakespeare and Alexander Pope, including Miranda, Ariel, Umbriel, Titania, and Oberon.',
      discovery: 'Discovered on March 13, 1781, by British astronomer William Herschel using a homemade telescope. It was the first planet discovered with a telescope in modern history!',
      exploration: 'Only ONE spacecraft has ever visited Uranus: NASA’s Voyager 2, which flew past in January 1986, discovering 10 new moons, faint rings, and measuring its bizarre magnetic field.',
      coolFact: 'Scientists believe that deep inside Uranus, extreme atmospheric pressures could compress carbon atoms into sparkling diamonds that rain down toward the core like diamond hail!',
      habitability: 'Uranus has no solid ground, extreme atmospheric pressure, and bone-chilling subzero cold, making human life impossible.'
    },
    suggestedQuestions: [
      'Why does Uranus rotate on its side?',
      'Why is Uranus a cyan blue color?',
      'Does it really rain diamonds on Uranus?',
      'Which spacecraft has visited Uranus?'
    ]
  },

  neptune: {
    id: 'neptune',
    name: 'Neptune',
    type: 'planet',
    category: 'Ice Giant',
    tagline: 'The Deep-Blue World of Supersonic Storms! 💨',
    greeting: "You have arrived at Neptune, the furthest major planet from the Sun! 💨 Deep blue, mysterious, and stormy, Neptune possesses the fastest supersonic winds in the entire solar system, blowing up to an astonishing 2,100 km/h (1,300 mph)!",
    quickFacts: {
      distanceFromSun: '30.1 AU (4.50 billion km)',
      diameter: '49,244 km',
      orbitalPeriod: '165 Earth years',
      dayLength: '16 hours and 6 minutes',
      moons: '16 known moons (led by giant Triton)',
      surfaceTemp: '-214°C (-353°F)'
    },
    sections: {
      size: 'Neptune is slightly smaller in diameter than Uranus (49,244 km), but it is more dense and massive—about 17 times the mass of Earth!',
      atmosphere: 'Neptune’s vivid deep-azure blue comes from atmospheric methane absorbing red wavelengths. Its atmosphere features whipping white clouds of frozen methane cirrus and colossal dark anticyclonic storms.',
      surface: 'Like Uranus, Neptune is an ice giant with no solid surface. Its interior is an ocean of superheated, high-pressure water, ammonia, and methane slush.',
      temperature: 'Despite being 4.5 billion km from the Sun, Neptune’s average temperature is -214°C, and it radiates 2.6 times more internal heat than it receives from sunlight!',
      moons: 'Neptune has 16 moons. Its largest moon, Triton, is a frozen world with geysers erupting liquid nitrogen ice into space! Triton orbits backward (retrograde), proving it was a captured Kuiper Belt object.',
      discovery: 'Neptune is the only planet discovered through mathematical predictions rather than empirical observation! Urbain Le Verrier and John Couch Adams calculated its position based on gravitational wobbles in Uranus’s orbit, and Johann Galle spotted it through a telescope on September 23, 1846.',
      exploration: 'NASA’s Voyager 2 flew past Neptune in August 1989, discovering the Great Dark Spot, five faint rings, and geysers on Triton.',
      coolFact: 'Because Neptune takes 165 Earth years to complete just one single orbit around the Sun, it completed its very first full orbit since its 1846 discovery only in the year 2011!',
      habitability: 'With hurricane-force supersonic winds, lethal atmospheric pressures, and subzero cold, humans cannot live on Neptune.'
    },
    suggestedQuestions: [
      'How fast do winds blow on Neptune?',
      'Why is Neptune so deeply blue?',
      'How was Neptune discovered with mathematics?',
      'What are the geysers on Neptune’s moon Triton?'
    ]
  },

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
      atmosphere: 'Pluto has a thin atmosphere of nitrogen, methane, and carbon monoxide. When Pluto moves further from the Sun, its atmosphere gets so cold that it freezes solid and falls as snow!',
      surface: 'Pluto has nitrogen and methane glaciers, blue skies created by atmospheric tholin haze, and mountains made of water ice as tall as the Rocky Mountains!',
      temperature: 'At -230°C (-382°F), Pluto is one of the coldest places in the entire solar system.',
      moons: 'Pluto and its largest moon, Charon, orbit each other like a double-planet system! Charon is so large that the center of gravity they orbit around is actually in open space between them!',
      discovery: 'Discovered on February 18, 1930, by American astronomer Clyde Tombaugh at Lowell Observatory in Flagstaff, Arizona.',
      exploration: 'NASA’s New Horizons spacecraft made a historic flyby on July 14, 2015, capturing the first high-definition photos of Pluto and its giant moon Charon.',
      coolFact: 'Pluto’s orbit is tilted and oval-shaped. For 20 years out of its 248-year orbit (between 1979 and 1999), Pluto was actually closer to the Sun than Neptune was!',
      habitability: 'At -230°C with an atmosphere that freezes and falls as snow, Pluto is completely uninhabitable.'
    },
    suggestedQuestions: [
      'Why is Pluto called a dwarf planet?',
      'What is Pluto’s heart made of?',
      'How big is Pluto’s moon Charon?',
      'What did New Horizons discover at Pluto?'
    ]
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
    greeting: "Welcome to our Moon! 🌕 Earth's loyal companion has orbited us for 4.5 billion years. It is the only celestial body beyond Earth where human footprints have walked in the dust!",
    quickFacts: {
      parentPlanet: 'Earth',
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
      temperature: 'With no atmosphere to insulate, temperatures swing from a boiling 120°C in direct sunlight to a freezing -130°C in lunar night.',
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

  phobos: {
    id: 'phobos',
    name: 'Phobos',
    type: 'moon',
    category: 'Martian Moon',
    tagline: 'The Doomed Moon of Mars! 🪨',
    greeting: "Welcome to Phobos! 🪨 This is the larger and closer of Mars' two tiny moons. It orbits so close to Mars—just 6,000 km above the surface—that it completes three full orbits around Mars every single day!",
    quickFacts: {
      parentPlanet: 'Mars',
      diameter: '22.2 km across',
      orbitalPeriod: '7 hours and 39 minutes',
      distanceFromMars: '9,377 km from Mars center',
      surfaceTemp: '-4°C to -112°C'
    },
    sections: {
      size: 'Phobos is a tiny, irregularly shaped potato of rock, only 22.2 km across.',
      surface: 'Dominated by the massive Stickney crater, which is 9 km wide—nearly half the width of the entire moon! The impact almost shattered Phobos into rubble.',
      exploration: 'Photographed by Mariner 9, Viking 1 and 2, Mars Global Surveyor, and Mars Express. JAXA’s upcoming MMX mission plans to bring samples of Phobos back to Earth!',
      coolFact: 'Phobos is slowly spiraling inward toward Mars at a rate of 2 meters every century! In about 30 to 50 million years, tidal forces will tear Phobos apart into a glittering ring around Mars!',
      habitability: 'Phobos has virtually no gravity (you could throw a baseball into escape orbit) and no atmosphere, but it could make an ideal future staging outpost for human missions to Mars.'
    },
    suggestedQuestions: [
      'Will Phobos crash into Mars?',
      'How fast does Phobos orbit Mars?',
      'What is Stickney Crater?',
      'Can humans stand on Phobos?'
    ]
  },

  deimos: {
    id: 'deimos',
    name: 'Deimos',
    type: 'moon',
    category: 'Martian Moon',
    tagline: 'The Tiny, Smooth Martian Outpost! 🪨',
    greeting: "Meet Deimos! 🪨 Deimos is the smaller, outer moon of Mars. Measuring just 12 km across, it looks like a smooth space pebble because a thick blanket of pulverized dust has filled in almost all its craters!",
    quickFacts: {
      parentPlanet: 'Mars',
      diameter: '12.4 km across',
      orbitalPeriod: '30.3 hours',
      distanceFromMars: '23,460 km'
    },
    sections: {
      size: 'Deimos is tiny, only 12.4 km in diameter.',
      surface: 'Unlike battered Phobos, Deimos has a remarkably smooth appearance caused by a 100-meter-thick blanket of dust and pulverized regolith that softened its craters.',
      exploration: 'Observed up close by Viking 1, Mars Reconnaissance Orbiter, and the UAE Hope Mars Mission in 2023, which proved that Deimos formed from Mars debris rather than being a captured asteroid!',
      coolFact: 'Because Deimos has such tiny gravity, its escape velocity is only 20 km/h (12 mph)—meaning an athletic human could run up a ramp and jump completely off the moon into space!',
      habitability: 'Airless and miniature, Deimos offers an unobstructed, radiation-shielded observation vantage point overlooking the Martian system.'
    },
    suggestedQuestions: [
      'Could a human jump off Deimos into space?',
      'How did Deimos get so smooth?',
      'Where did Mars’ moons come from?',
      'How does Deimos compare to Phobos?'
    ]
  },

  io: {
    id: 'io',
    name: 'Io',
    type: 'moon',
    category: 'Jupiter’s Volcanic Moon',
    tagline: 'The Most Volcanic World in the Solar System! 🌋',
    greeting: "Welcome to fiery Io! 🌋 Io is the most volcanically active body in the entire solar system! It has over 400 active volcanoes that continuously blast plumes of sulfur and lava hundreds of kilometers into space, painting the moon in shades of yellow, red, and black!",
    quickFacts: {
      parentPlanet: 'Jupiter',
      diameter: '3,643 km (slightly larger than Earth’s Moon)',
      orbitalPeriod: '1.77 Earth days',
      volcanoes: 'Over 400 active volcanoes',
      surfaceTemp: '-130°C surface, lava vents over 1,200°C'
    },
    sections: {
      size: 'Io has a diameter of 3,643 km, making it the fourth-largest moon in the solar system.',
      surface: 'Io looks like a giant cheese pizza! There are no impact craters because fresh lava continuously repaves the entire surface every few thousand years.',
      volcanism: 'What causes its volcanoes? Tidal flexing! Trapped in a gravitational tug-of-war between colossal Jupiter and sister moons Europa and Ganymede, Io is bent and squeezed like a rubber ball, creating immense frictional heating inside its core.',
      exploration: 'Voyager 1 first discovered active volcanoes on Io in 1979. NASA’s Galileo spacecraft flew past erupting plumes, and the Juno probe recently captured close-up infrared images of glowing magma lakes.',
      coolFact: 'Loki Patera on Io is a lava lake over 200 km across—larger than the entire state of Maryland—with crusts of cooling rock sinking into glowing magma waves!',
      habitability: 'Io is located inside Jupiter’s deadly radiation belt, where radiation levels are thousands of times higher than lethal human limits. It is completely uninhabitable.'
    },
    suggestedQuestions: [
      'Why is Io so volcanically active?',
      'How high do volcanoes erupt on Io?',
      'Why does Io look like a pizza?',
      'Can spacecraft land on Io?'
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

  ganymede: {
    id: 'ganymede',
    name: 'Ganymede',
    type: 'moon',
    category: 'Jupiter’s Super-Moon',
    tagline: 'The Giant Moon Bigger Than Planet Mercury! 🛡️',
    greeting: "Behold Ganymede, the undisputed giant of all moons! 🛡️ Ganymede is so enormous that it is bigger than planet Mercury and dwarf planet Pluto! It is also the ONLY moon in the entire solar system that generates its own magnetic field!",
    quickFacts: {
      parentPlanet: 'Jupiter',
      diameter: '5,268 km (larger than Mercury!)',
      orbitalPeriod: '7.15 Earth days',
      magneticField: 'Only moon with an intrinsic magnetic field',
      surfaceTemp: '-113°C to -183°C'
    },
    sections: {
      size: 'With a diameter of 5,268 km, Ganymede is the largest natural satellite in the solar system. If it orbited the Sun instead of Jupiter, it would be classified as a major planet!',
      atmosphere: 'Ganymede has a very thin oxygen exosphere that creates glowing auroral ribbons dancing across its polar ice caps.',
      surface: 'A complex mixture of dark, heavily cratered ancient terrain and lighter, younger grooved regions carved by tectonic rifting and cryovolcanic flows.',
      ocean: 'Scientists believe Ganymede hides a massive saltwater ocean sandwiched between thick layers of high-pressure ice and rock.',
      exploration: 'Explored by Pioneer 10, Voyager 1 and 2, Galileo, and Juno. The European Space Agency’s Juice (Jupiter Icy Moons Explorer) mission will enter orbit around Ganymede in 2034!',
      coolFact: 'Because Ganymede has a liquid metallic iron core that spins, it creates its own magnetic bubble (magnetosphere) embedded right inside Jupiter’s giant magnetic field!',
      habitability: 'Its underground ocean may possess the water and organic ingredients needed for life, sheltered deep beneath tens of kilometers of protective ice.'
    },
    suggestedQuestions: [
      'Is Ganymede really bigger than Mercury?',
      'Why does Ganymede have a magnetic field?',
      'What will ESA’s Juice mission do at Ganymede?',
      'Is there an ocean on Ganymede?'
    ]
  },

  callisto: {
    id: 'callisto',
    name: 'Callisto',
    type: 'moon',
    category: 'Jupiter’s Cratered Ice-Rock Moon',
    tagline: 'The Ancient, Battle-Scarred Witness of Space History! ☄️',
    greeting: "Welcome to Callisto! ☄️ Callisto is the second-largest moon of Jupiter and the most heavily cratered object in the entire solar system! Its surface is an ancient landscape frozen in time for over 4 billion years!",
    quickFacts: {
      parentPlanet: 'Jupiter',
      diameter: '4,821 km (almost the exact size of Mercury)',
      orbitalPeriod: '16.7 Earth days',
      distanceFromJupiter: '1,883,000 km',
      surfaceTemp: '-108°C to -193°C'
    },
    sections: {
      size: 'Callisto has a diameter of 4,821 km—about 99% the size of planet Mercury.',
      surface: 'Callisto is saturated with impact craters from billions of years of meteorite impacts. Its most famous feature is Valhalla, a colossal impact basin surrounded by concentric ripple rings spanning 3,800 km!',
      exploration: 'Photographed by Voyager, Galileo, Cassini, and New Horizons. Callisto orbits outside Jupiter’s harsh radiation belt, making it the safest Galilean moon for human outposts.',
      coolFact: 'Because Callisto is far from Jupiter’s intense radiation, NASA has studied it as the prime candidate for a future crewed basecamp in the Jovian system!',
      habitability: 'Callisto has no atmosphere, but like Europa and Ganymede, it may harbor a salty ocean deep beneath its cratered ice crust.'
    },
    suggestedQuestions: [
      'Why does Callisto have so many craters?',
      'What is Valhalla Basin on Callisto?',
      'Why is Callisto the safest moon for human astronauts?',
      'Does Callisto have an underground ocean?'
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
      temperature: 'Titan is freezing at a steady -179°C (-290°F).',
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

  enceladus: {
    id: 'enceladus',
    name: 'Enceladus',
    type: 'moon',
    category: 'Saturn’s Ocean Geyser Moon',
    tagline: 'The Brightest Moon Spraying Oceans into Space! 🌊',
    greeting: "Welcome to Enceladus! 🌊 This tiny, glittering snowball moon of Saturn is one of the most exciting astrobiological frontiers in space! Through cracks in its south pole called 'tiger stripes', it sprays towering geysers of water vapor, ice, and organic molecules directly into orbit around Saturn!",
    quickFacts: {
      parentPlanet: 'Saturn',
      diameter: '504 km (fits inside the United Kingdom)',
      surfaceReflectivity: 'Albedo 0.99 (reflects nearly 100% of sunlight)',
      oceanDepth: 'Subsurface global ocean 30–40 km deep',
      surfaceTemp: '-198°C (-324°F)'
    },
    sections: {
      size: 'Enceladus is relatively small, with a diameter of only 504 km—about one-seventh the size of Earth\'s Moon.',
      surface: 'Enceladus has the cleanest, whitest surface in the solar system, reflecting 99% of sunlight like a polished mirror of pure fresh ice.',
      geysers: 'Over 100 geysers erupt from four warm parallel fissures near its south pole, spraying icy crystals at 1,300 km/h into space to form Saturn’s vast E ring!',
      exploration: 'NASA’s Cassini spacecraft performed daring low-altitude dives through the erupting geyser plumes, "tasting" the spray and discovering saltwater, methane, carbon dioxide, and organic building blocks!',
      coolFact: 'Scientists confirmed that Enceladus has hydrothermal vents on its ocean floor, where superheated mineral water reacts with rock—the exact same environment where life first began on Earth!',
      habitability: 'Enceladus has all three vital ingredients for life: liquid water, organic carbon chemistry, and a hydrothermal energy source!'
    },
    suggestedQuestions: [
      'What comes out of Enceladus’ geysers?',
      'Could there be life in Enceladus’ ocean?',
      'What are the tiger stripes on Enceladus?',
      'How did Cassini sample its ocean?'
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
    tagline: 'The Pioneer that Proved Humans Could Land on the Moon! 🌕',
    greeting: "Welcome to Surveyor 1! 🌕 Launched on May 30, 1966, Surveyor 1 was America's very first spacecraft to make a soft touchdown on another celestial body, proving that the lunar surface was firm rock and dust rather than quicksand!",
    quickFacts: {
      agency: 'NASA / JPL-Caltech / Hughes Aircraft',
      launchDate: 'May 30, 1966',
      lunarTouchdown: 'June 2, 1966',
      landingSite: 'Flamsteed P, Oceanus Procellarum',
      imagesReturned: '11,237 high-resolution television photos',
      status: 'Preserved on the Lunar Surface'
    },
    sections: {
      mission: 'Surveyor 1 was designed to test soft-landing deceleration radar and crushable aluminum landing legs, scout future Apollo landing sites, and determine the mechanical bearing strength of lunar dust.',
      discoveries: 'Before Surveyor 1, some astronomers feared that Apollo lunar modules would sink into quicksand-like dust! Surveyor 1 demonstrated that the dust was only a few centimeters deep and easily supported the weight of human spacecraft.',
      coolFact: 'Surveyor 1 touched down at just 3 meters per second, bounced slightly, and rested securely on three aluminum footpads. It transmitted over 11,000 photos of the lunar landscape!'
    },
    suggestedQuestions: [
      'Why was Surveyor 1 so important for Apollo?',
      'Where did Surveyor 1 land on the Moon?',
      'Is Surveyor 1 still on the Moon today?',
      'How did Surveyor 1 land without parachutes?'
    ]
  },

  'mars-pathfinder': {
    id: 'mars-pathfinder',
    name: 'Mars Pathfinder & Sojourner',
    type: 'spacecraft',
    category: 'Martian Lander & Micro-Rover',
    tagline: 'The Mission that Put Wheels on Mars! 🚙',
    greeting: "Here is Mars Pathfinder and the Sojourner rover! 🚙 Landing on the Fourth of July in 1997, Pathfinder used giant bouncing airbags to cushion its touchdown in Ares Vallis, and deployed the microwave-sized Sojourner—the first wheeled rover ever driven on another planet!",
    quickFacts: {
      agency: 'NASA / JPL-Caltech',
      launchDate: 'December 4, 1996',
      landingDate: 'July 4, 1997',
      landingSite: 'Ares Vallis, Mars (Ancient Catastrophic Floodplain)',
      roverName: 'Sojourner (10.6 kg micro-rover)',
      status: 'Completed (Exceeded design lifetime by 3x)'
    },
    sections: {
      mission: 'Pathfinder was a proof-of-concept mission testing an innovative low-cost entry, descent, and landing system using parachutes, retro-rockets, and giant airbags that bounced 15 times across Martian rock fields before coming to a stop.',
      sojourner: 'The Sojourner rover was named in honor of abolitionist Sojourner Truth. It weighed only 10.6 kg and used an Alpha Proton X-ray Spectrometer to analyze the chemical composition of nearby rocks named "Yogi" and "Barnacle Bill".',
      discoveries: 'Pathfinder confirmed that Ares Vallis was carved by catastrophic prehistoric floods of liquid water billions of years ago.',
      coolFact: 'The Mars Pathfinder website was one of the earliest viral hits in Internet history, receiving over 500 million web hits in July 1997 as people around the world watched Sojourner explore live!'
    },
    suggestedQuestions: [
      'How did Pathfinder land using airbags?',
      'What rocks did the Sojourner rover study?',
      'Why did scientists pick Ares Vallis?',
      'How big was the Sojourner rover?'
    ]
  },

  'venera-13': {
    id: 'venera-13',
    name: 'Venera 13',
    type: 'spacecraft',
    category: 'Venus Surface Lander',
    tagline: 'The Iron Survivor that Touched the Surface of Venus! 🌋',
    greeting: "Behold the heroic Soviet Venera 13 lander! 🌋 On March 1, 1982, Venera 13 parachuted through the scorching sulfuric acid clouds of Venus, surviving 457°C heat and 89 atmospheres of crushing pressure to transmit the first-ever color panoramas and sound recordings from the surface of Venus!",
    quickFacts: {
      agency: 'Soviet Space Program (IKI / Lavochkin)',
      launchDate: 'October 30, 1981',
      venusLanding: 'March 1, 1982',
      landingSite: 'Phoebe Regio, Venus',
      survivalTime: '127 minutes (designed for 32 minutes!)',
      surfaceConditions: '457°C (855°F), 89 atmospheres pressure'
    },
    sections: {
      mission: 'Venera 13 was built like a titanium armored submarine to withstand the crushing pressure and melting heat of the Venusian atmosphere long enough to drill into the soil and take color photographs.',
      discoveries: 'Venera 13 drilled 30 mm into the Venusian bedrock, analyzed the soil with an X-ray fluorescence spectrometer, and proved that Venus’s crust is made of basaltic rock similar to Earth’s ocean floor.',
      coolFact: 'Venera 13 carried a sensitive microphone that recorded the actual sound of wind blowing across the surface of Venus—the first time humanity ever recorded the audio of an alien planet’s atmosphere!'
    },
    suggestedQuestions: [
      'How did Venera 13 survive on Venus?',
      'Did Venera 13 record sound on Venus?',
      'How deep is the atmosphere on Venus?',
      'What did the surface of Venus look like?'
    ]
  }
};

/**
 * Get knowledge profile for any celestial body ID or spacecraft slug.
 * Dynamically resolves against NOVA_KNOWLEDGE_BASE, CELESTIAL_BODIES, and verified spacecraft.
 */
export function getNovaProfile(idOrSlug) {
  if (!idOrSlug) return null;
  const key = String(idOrSlug).toLowerCase().trim();

  // 1. Direct match in curated knowledge base
  if (NOVA_KNOWLEDGE_BASE[key]) {
    return NOVA_KNOWLEDGE_BASE[key];
  }

  // 2. Handle aliases & variations
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
        greeting: `Welcome to ${body.name}! 🌟 ${body.overview}`,
        quickFacts: {
          diameter: body.realStats?.diameter || `${(body.radius * 2000).toFixed(0)} km`,
          distanceFromSun: body.realStats?.distanceFromSun || `${body.distance} AU`,
          orbitalPeriod: body.realStats?.orbitalPeriod ? `${body.realStats.orbitalPeriod}` : `${body.orbitalPeriod} days`,
          moons: body.moons ? `${body.moons.length} natural satellites` : (body.realStats?.moons || '0'),
          surfaceTemp: body.realStats?.surfaceTemp || 'Variable space temperature'
        },
        sections: {
          size: `${body.name} has a diameter of ${body.realStats?.diameter || 'astronomical scale'}.`,
          atmosphere: body.atmosphereDesc || `${body.name} has a unique atmospheric environment measured by planetary scientists.`,
          surface: body.overview,
          temperature: `Surface temperatures range around ${body.realStats?.surfaceTemp || 'extreme space temperatures'}.`,
          moons: body.moons ? `${body.name} hosts ${body.moons.length} major moons including ${body.moons.map(m => m.name).join(', ')}.` : 'No major natural moons recorded.',
          exploration: `Studied through NASA and international astronomical observatories.`,
          coolFact: body.interestingFacts?.[0] || `${body.name} follows a precise gravitational orbit calculated from NASA JPL Horizons ephemerides.`
        },
        suggestedQuestions: [
          `How big is ${body.name}?`,
          `What is the atmosphere of ${body.name}?`,
          `Tell me a fun fact about ${body.name}!`
        ]
      };
    }

    // Check nested moons
    if (body.moons && body.moons.length > 0) {
      for (const moon of body.moons) {
        if (moon.id === key || moon.name.toLowerCase() === key) {
          return {
            id: moon.id,
            name: moon.name,
            type: 'moon',
            category: `${body.name}'s Moon`,
            tagline: `${moon.name} — ${moon.overview}`,
            greeting: `Welcome to ${moon.name}! 🌕 ${moon.overview} It orbits around ${body.name}!`,
            quickFacts: {
              parentPlanet: body.name,
              diameter: moon.realStats?.diameter || 'Natural satellite scale',
              orbitalPeriod: moon.realStats?.orbitalPeriod || `${moon.orbitalPeriod} days`,
              distanceFromParent: `${moon.distance * 100000} km`
            },
            sections: {
              size: `${moon.name} has a diameter of ${moon.realStats?.diameter || 'several hundred kilometers'}.`,
              surface: moon.overview,
              atmosphere: moon.atmosphereDesc || `${moon.name} has no breathable atmosphere.`,
              exploration: `Photographed and explored by interplanetary probes passing through the ${body.name} system.`,
              coolFact: moon.interestingFacts?.[0] || `${moon.name} is gravitationally bound in orbit around ${body.name}.`
            },
            suggestedQuestions: [
              `How big is ${moon.name}?`,
              `What planet does ${moon.name} orbit?`,
              `Does ${moon.name} have water or ice?`
            ]
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
      greeting: `Welcome to ${craftRecord.name}! 🚀 Operated by ${craftRecord.agency || 'Space Exploration Agencies'}, this spacecraft journeyed to ${craftRecord.destination || 'the Solar System'}. Let's examine its 3D model and discoveries!`,
      quickFacts: {
        agency: craftRecord.agency || 'Space Exploration Agency',
        launchDate: craftRecord.launchDate || 'Historic Space Era',
        destination: craftRecord.destination || 'Solar System Exploration',
        status: craftRecord.operationalStatus || 'Verified Mission Telemetry',
        objectType: craftRecord.objectType || 'Spacecraft'
      },
      sections: {
        mission: `Mission to explore ${craftRecord.destination || 'celestial bodies'} with robotic instrumentation.`,
        discoveries: craftRecord.historicalMilestones?.[0]?.description || `Conducted pioneering scientific experiments and sent high-resolution imaging back to Earth.`,
        status: `Operational status: ${craftRecord.operationalStatus || 'Mission archive record'}.`,
        coolFact: `Its authentic 3D model is rendered directly inside our Solar System map based on ${craftRecord.provenance || 'official aerospace specifications'}.`
      },
      suggestedQuestions: [
        `What was the destination of ${craftRecord.name}?`,
        `Who operated ${craftRecord.name}?`,
        `What were the scientific discoveries of ${craftRecord.name}?`
      ]
    };
  }

  return null;
}
