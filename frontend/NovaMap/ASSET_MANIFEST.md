# NovaMap — Scientific 3D Asset, Ephemeris & Telemetry Manifest

**Module:** NovaMap (NASA Eyes-Level Solar System Explorer)  
**Standard:** NASA Open Data & Visualization Guidelines / JPL Horizons System  
**Version:** 2.0.0-scientifically-calibrated  
**Provenance Verification:** Verified Authentic vs. Illustrative Fallback  

---

## 1. Executive Scientific Overview

The NovaMap 3D Solar System exploration module is designed to provide an interactive, mathematically rigorous, and visually immersive experience modeled after NASA's **"Eyes on the Solar System"** (`https://eyes.nasa.gov/apps/solar-system/`).

To satisfy both educational clarity and scientific integrity:
1. **Orbital Ephemerides:** Planetary, asteroidal, and cometary trajectories are computed using authoritative NASA Jet Propulsion Laboratory (JPL) Keplerian orbital elements (Standish 1992 / JPL DE405/DE440).
2. **Spacecraft Telemetry:** Live and historical trajectories are derived from NAIF SPICE kernels, JPL Horizons state vectors, and CelesTrak two-line element (TLE) propagators.
3. **3D Models:** Authentic models are directly sourced from the public-domain **NASA 3D Resources** and **NASA Science** repositories. All procedural or illustrative approximations are explicitly flagged in the UI and never misrepresented as authentic CAD/telemetry scans.

---

## 2. Ephemeris & Orbital Mechanics Provenance

### 2.1 Planetary & Minor Body Keplerian Elements
- **Source:** NASA Jet Propulsion Laboratory / California Institute of Technology (Caltech).
- **Primary Reference:** Standish, E. M. (1992), *"Keplerian Elements for Approximate Positions of the Major Planets,"* JPL Solar System Dynamics Group.
- **Formulation:** Six osculating Keplerian orbital elements with secular rates:
  - Semi-major axis ($a$, AU and AU/century)
  - Orbital eccentricity ($e$, dimensionless and $1/\text{century}$)
  - Inclination ($I$, degrees and deg/century)
  - Mean longitude ($L$, degrees and deg/century)
  - Longitude of perihelion ($\varpi$, degrees and deg/century)
  - Longitude of ascending node ($\Omega$, degrees and deg/century)
- **Time Epoch:** J2000.0 (Julian Date 2451545.0, 2000 Jan 1 12:00:00 TT).
- **Kepler's Equation Solver:** Iterative Newton-Raphson method with dynamic convergence criterion ($\Delta E < 10^{-6}$ rad, maximum 30 iterations) solving $M = E - e \sin(E)$.

### 2.2 Coverage Table

| Category | Objects | Ephemeris Formulation | Provenance Source |
| :--- | :--- | :--- | :--- |
| **Central Star** | The Sun | Inertial Barycenter / Origin $(0,0,0)$ | IAU Working Group on Cartographic Coordinates |
| **Terrestrial Planets** | Mercury, Venus, Earth, Mars | Keplerian Elements + Rates (1800–2050 AD) | NASA JPL Horizons / Standish 1992 |
| **Gas & Ice Giants** | Jupiter, Saturn, Uranus, Neptune | Keplerian Elements + Rates (1800–2050 AD) | NASA JPL Horizons / Standish 1992 |
| **Dwarf Planets** | Ceres, Pluto | Keplerian Elements + Inclinational Offset | NASA JPL Small-Body Database (SBDB) |
| **Main Belt Asteroids** | 4 Vesta, 433 Eros | Keplerian Elements ($a, e, I, \Omega, \varpi, M_0$) | NASA JPL SSD / Dawn Science Team |
| **Near-Earth Asteroids**| 101955 Bennu, 162173 Ryugu | Keplerian Elements ($a, e, I, \Omega, \varpi, M_0$) | NASA OSIRIS-REx / JAXA Hayabusa2 |
| **Periodic Comets** | 1P/Halley, 67P/Churyumov-Gerasimenko | High-Eccentricity Keplerian ($e \approx 0.967, 0.641$) | ESA Rosetta / IAU Minor Planet Center |
| **Interstellar Objects** | 1I/'Oumuamua | Hyperbolic Trajectory ($e = 1.200$, outbound asymptote) | NASA JPL SBDB / Pan-STARRS1 |
| **Natural Satellites** | Moon, Phobos, Deimos, Galilean Moons, Titan, Enceladus, Triton, Charon | Orbital Periods, Inclinations, and Local Coordinates | NASA JPL Horizons / Planetary Satellite Ephemerides |

---

## 3. 3D Spacecraft Hardware Models & Provenance

NovaQuest maintains a strict transparency policy: **Every spacecraft model explicitly reports its authenticity status and origin in the UI and telemetry drawer.**

### 3.1 Authentic NASA 3D Models (GLB / GLTF Format)
*Stored locally in `frontend/public/models/spacecraft/` and `frontend/public/assets/spacecraft/`.*

| Spacecraft Slug | Mission Name | Origin & Archive | Authenticity Status |
| :--- | :--- | :--- | :--- |
| `voyager-1`, `voyager-2` | Voyager Interstellar Mission | NASA 3D Resources (`voyager.glb`) | **Authentic NASA 3D Model** |
| `cassini-saturn-orbiter` | Cassini-Huygens | NASA 3D Resources / JPL (`cassini.glb`) | **Authentic NASA 3D Model** |
| `curiosity-rover` | Mars Science Laboratory (MSL) | NASA 3D Resources (`curiosity_static.glb`) | **Authentic NASA 3D Model** |
| `perseverance-rover` | Mars 2020 Perseverance | NASA 3D Resources / JPL (`perseverance.glb`) | **Authentic NASA 3D Model** |
| `ingenuity-helicopter` | Ingenuity Mars Helicopter | NASA 3D Resources / JPL (`ingenuity.glb`) | **Authentic NASA 3D Model** |
| `parker-solar-probe` | Parker Solar Probe (PSP) | NASA 3D Resources / APL (`parker_solar_probe.glb`) | **Authentic NASA 3D Model** |
| `james-webb-space-telescope`| JWST | NASA 3D Resources / GSFC (`jwst.glb`) | **Authentic NASA 3D Model** |
| `hubble-space-telescope` | HST | NASA 3D Resources / GSFC (`hubble.glb`) | **Authentic NASA 3D Model** |
| `international-space-station`| ISS | NASA 3D Resources / JSC (`iss.glb`) | **Authentic NASA 3D Model** |
| `juno-spacecraft` | Juno Jupiter Orbiter | NASA 3D Resources / JPL (`juno.glb`) | **Authentic NASA 3D Model** |
| `osiris-rex` | OSIRIS-REx Asteroid Sample Return | NASA 3D Resources / GSFC (`osiris_rex.glb`) | **Authentic NASA 3D Model** |
| `rosetta` | Rosetta Comet Orbiter | ESA / NASA PDS (`rosetta.glb`) | **Authentic 3D Model** |
| `galileo-orbiter` | Galileo Jupiter Orbiter | NASA 3D Resources / JPL (`galileo.glb`) | **Authentic NASA 3D Model** |
| `pioneer-10`, `pioneer-11` | Pioneer 10 & 11 Deep Space | NASA 3D Resources / Ames (`pioneer_10.glb`) | **Authentic NASA 3D Model** |
| `lunar-reconnaissance-orbiter`| LRO | NASA 3D Resources / GSFC (`lro.glb`) | **Authentic NASA 3D Model** |
| `mars-reconnaissance-orbiter`| MRO | NASA 3D Resources / JPL (`mro.glb`) | **Authentic NASA 3D Model** |
| `opportunity-rover`, `spirit-rover`| Mars Exploration Rovers (MER) | NASA 3D Resources / JPL (`mer_opportunity.glb`)| **Authentic NASA 3D Model** |
| `apollo-11-lunar-module` | Apollo Lunar Module (Eagle) | NASA 3D Resources / Smithsonian (`apollo_lm.glb`)| **Authentic NASA 3D Model** |

### 3.2 Mission-Appropriate Procedural Geometric Fallbacks
*Generated programmatically by `spacecraftModelRegistry.js` with mission-accurate geometries, gold-foil MLI shaders, high-gain antennas, and solar panels.*

| Spacecraft Generator | Modeled Features | Authenticity Status |
| :--- | :--- | :--- |
| `newHorizons` | Triangular gold MLI bus, 2.1m dish, RTG boom, Ralph camera package | **Illustrative Procedural Model** |
| `orion` | Conical crew capsule, European Service Module, 4 X-wing solar panels | **Illustrative Procedural Model** |
| `chandrayaan` | Boxy chassis, 4 canted shock-absorbing landing legs, side solar panels | **Illustrative Procedural Model** |
| `pathfinder` | Tetrahedral lander base, 3 open solar petals, Sojourner 6-wheel rover | **Illustrative Procedural Model** |
| `europaClipper` | Cylindrical avionics core, 3.0m dish, huge 5-segment solar wings, radar boom| **Illustrative Procedural Model** |
| `juice` | Cross-shaped 10-panel solar wings, RIME radar dipole, high-gain dish | **Illustrative Procedural Model** |
| `dragon` | Truncated aerodynamic cone, trunk solar wrap, Draco thruster quads | **Illustrative Procedural Model** |
| `spitzer` | Cylindrical cryogenic vacuum dewar, solar panel shield, star tracker | **Illustrative Procedural Model** |
| `deepSpace1` | Cubic bus, dual ion thruster gimbal, reflective concentrator solar arrays | **Illustrative Procedural Model** |
| `dawn` | Core bus, ion propulsion thruster grid, two 8-meter solar wings | **Illustrative Procedural Model** |

---

## 4. Planetary Surface & Texture Maps

1. **Procedural Multi-Octave Texturing:**
   - Real-time procedural planetary textures generated in HTML5 Canvas via `PlanetBody.js` and `createPlanetTexture()`.
   - Incorporates real albedo features: Earth continental shelves and deserts, Mars Acidalia Planitia and Hellas Basin, Jupiter Great Red Spot, Pluto Tombaugh Regio / Sputnik Planitia, and Saturn cloud banding.
2. **Surface Terrain Elevation Viewer:**
   - Mars Jezero Crater, Gale Crater, and Olympus Mons: Derived from Mars Global Surveyor MOLA elevation datasets and HiRISE digital terrain models (DTM).
   - Lunar Apollo 11 Tranquility Base: Modeled using Lunar Reconnaissance Orbiter (LRO) LOLA altimetry.

---

## 5. Licensing & Attribution Statements

- **NASA Media Policy:** NASA content (including 3D models, imagery, and ephemeris tables) is generally not copyrighted and may be used for educational and non-commercial purposes under the NASA Guidelines for Non-Commercial Use.
- **NAIF SPICE:** Jet Propulsion Laboratory Navigation and Ancillary Information Facility (NAIF) kernels and toolkit.
- **CelesTrak:** Two-Line Element (TLE) satellite tracking datasets courtesy of Dr. T.S. Kelso / CelesTrak.
- **ESA Science Archive:** Rosetta and Huygens data courtesy of the European Space Agency.
- **JAXA:** Hayabusa2 asteroid shape models and trajectory data courtesy of the Japan Aerospace Exploration Agency.

