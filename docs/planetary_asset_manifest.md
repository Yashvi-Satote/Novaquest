# Novaquest Planetary & Celestial Asset Manifest

This manifest documents the verified equirectangular texture maps, 3D spacecraft assets, orbital datasets, and scientific resources integrated into Novaquest's 3D Solar System exploration module.

---

## 1. Celestial & Planetary Texture Maps

| Celestial Body | Asset File | Resolution | Source / Mission Archive | Attribution & License | Role & Mapping |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **The Sun** | `textures/planets/sun.jpg` | 2048 × 1024 | NASA SDO (Solar Dynamics Observatory) / SOHO | Public Domain / CC-BY 4.0 | Photospheric granulation, magnetic active regions & sunspots |
| **Mercury** | `textures/planets/mercury.jpg` | 2048 × 1024 | NASA MESSENGER & Mariner 10 Global Mosaic (USGS) | Public Domain / CC-BY 4.0 | Impact-cratered basaltic surface & Caloris Basin |
| **Venus** | `textures/planets/venus_atmosphere.jpg` | 2048 × 1024 | NASA Pioneer Venus / Akatsuki UV Global Mosaic | Public Domain / CC-BY 4.0 | Dense sulfuric acid cloud deck & atmospheric circulation |
| **Venus (Radar)** | `textures/planets/venus_surface.jpg` | 2048 × 1024 | NASA Magellan Radar Global Altimetry (JPL) | Public Domain / CC-BY 4.0 | Volcanic plains, Maxwell Montes, and tessera terrain |
| **Earth (Day)** | `textures/planets/earth_day.jpg` | 2048 × 1024 | NASA Visible Earth / Blue Marble Next Generation | Public Domain (NASA GSFC) | Continental landmasses, topography, and ocean bathymetry |
| **Earth (Night Lights)** | `textures/planets/earth_night.jpg` | 2048 × 1024 | NASA Earth Observatory / Suomi NPP VIIRS DNB | Public Domain (NASA GSFC) | Urban human civilization lights on unlit hemisphere |
| **Earth (Specular)** | `textures/planets/earth_specular.jpg` | 2048 × 1024 | Three.js Planetary Textures / NASA Blue Marble | MIT / Public Domain | Ocean water specular reflection mask for PBR material |
| **Earth (Clouds)** | `textures/planets/earth_clouds.jpg` | 2048 × 1024 | NASA Terra & Aqua MODIS Global Cloud Mosaic | Public Domain (NASA GSFC) | Independent rotating cloud sphere (`radius * 1.012`) with alpha |
| **The Moon** | `textures/planets/moon.jpg` | 2048 × 1024 | NASA LRO (Lunar Reconnaissance Orbiter) LOLA / LROC | Public Domain (NASA GSFC / ASU) | Cratered lunar highlands and dark basaltic maria |
| **Mars** | `textures/planets/mars.jpg` | 2048 × 1024 | USGS Astrogeology / NASA Viking Orbiter MDIM 2.1 | Public Domain (USGS / NASA JPL) | Olympus Mons, Valles Marineris canyon, polar ice caps |
| **Jupiter** | `textures/planets/jupiter.jpg` | 2048 × 1024 | NASA Cassini-Huygens Imaging Science Subsystem (ISS) | Public Domain (NASA / JPL / SSI) | Zonal atmospheric belts, turbulent eddies & Great Red Spot |
| **Saturn** | `textures/planets/saturn.jpg` | 2048 × 1024 | NASA Cassini ISS Global Color Mosaic | Public Domain (NASA / JPL / SSI) | Ammonia cloud bands and northern hexagonal jet stream |
| **Saturn's Rings** | `textures/planets/saturn_ring.png` | 1024 × 64 (PNG with Alpha) | NASA Cassini UVIS & ISS Radial Ring Profile | Public Domain / CC-BY 4.0 | Double-sided radial UV mapping with Cassini Division & Encke Gap |
| **Uranus** | `textures/planets/uranus.jpg` | 2048 × 1024 | NASA Voyager 2 Narrow-Angle Camera (JPL) | Public Domain / CC-BY 4.0 | Pale cyan-blue methane atmosphere and subtle banding |
| **Neptune** | `textures/planets/neptune.jpg` | 2048 × 1024 | NASA Voyager 2 Global Color Mosaic (JPL) | Public Domain / CC-BY 4.0 | Deep azure atmosphere, high-altitude cirrus & Great Dark Spot |
| **Pluto** | `textures/planets/pluto.jpg` | 1024 × 512 | NASA New Horizons LORRI & MVIC Global Map (JHUAPL) | Public Domain (NASA / JHUAPL / SwRI) | Nitrogen ice plains (Sputnik Planitia) and tholin terrain |
| **Milky Way Panorama** | `textures/planets/milky_way.jpg` | 2048 × 1024 | ESO (European Southern Observatory) S. Brunier Panoramic Survey | CC-BY 4.0 / Public Domain | High-latitude galactic dust lanes and Sagittarius core |

---

## 2. Spacecraft 3D Models Inventory

Authentic GLB models located locally in `Novaquest/frontend/public/models/spacecraft/`:

| Spacecraft Slug | Model File | Polygon Count | Source / Repository | Status |
| :--- | :--- | :--- | :--- | :--- |
| `voyager-1` / `voyager-2` | `voyager.glb` | ~45,000 | NASA Eyes on the Solar System / 3D Resources | Authentic NASA Model |
| `pioneer-10` / `pioneer-11` | `pioneer_10.glb` | ~38,000 | NASA 3D Resources / Ames Research Center | Authentic NASA Model |
| `jwst` | `jwst.glb` | ~58,000 | NASA Goddard Space Flight Center | Authentic NASA Model |
| `hubble` | `hubble.glb` | ~32,000 | NASA 3D Resources / GSFC | Authentic NASA Model |
| `perseverance` | `perseverance.glb` | ~62,000 | NASA JPL 3D Model Repository | Authentic NASA Model |
| `curiosity` / `opportunity` | `mer_opportunity.glb` | ~42,000 | NASA JPL 3D Resources | Authentic NASA Model |
| `ingenuity` | `ingenuity.glb` | ~28,000 | NASA JPL Mars 2020 Resources | Authentic NASA Model |
| `cassini` | `cassini.glb` | ~49,000 | NASA JPL / Eyes on the Solar System | Authentic NASA Model |
| `galileo` | `galileo.glb` | ~36,000 | NASA JPL / Eyes on the Solar System | Authentic NASA Model |
| `juno` | `juno.glb` | ~34,000 | NASA JPL / SwRI | Authentic NASA Model |
| `parker-solar-probe` | `parker_solar_probe.glb` | ~39,000 | NASA / JHUAPL | Authentic NASA Model |
| `osiris-rex` | `osiris_rex.glb` | ~31,000 | NASA Goddard Space Flight Center | Authentic NASA Model |
| `mro` | `mro.glb` | ~35,000 | NASA JPL Mars Reconnaissance Orbiter | Authentic NASA Model |
| `lro` | `lro.glb` | ~27,000 | NASA GSFC Lunar Reconnaissance Orbiter | Authentic NASA Model |
| `iss` | `iss.glb` | ~75,000 | NASA Johnson Space Center (JSC) | Authentic NASA Model |
| `apollo-11` | `apollo_lm.glb` | ~48,000 | NASA Johnson Space Center (Apollo 11 LM) | Authentic NASA Model |
| `rosetta` | `rosetta.glb` | ~29,000 | ESA (European Space Agency) / NASA PDS | Authentic ESA/NASA Model |

---

## 3. Ephemerides & Scientific Data Sources

- **Planetary Ephemerides:** NASA JPL Keplerian Elements for Approximate Positions of the Major Planets (valid 1800–2050 AD) implemented in `ephemeris.js`.
- **Interstellar Trajectories:** NASA JPL Horizons Ephemeris System and Voyager Interstellar Mission trajectory vector tables (Voyager 1, Voyager 2, Pioneer 10, Pioneer 11, New Horizons) implemented in `interstellarData.js`.
- **Spacecraft Mission Metadata:** Synchronized with `matthewgiarra/spacecraft-models` (`spacecraft.json`) and the 278-record Novaquest Flask/SQLite database `space_hardware.db`.

