import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Database, 
  Shield, 
  Radio, 
  Rocket, 
  Search, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  FileText, 
  Volume2, 
  Activity,
  AlertTriangle,
  Info
} from 'lucide-react';
import { audio } from '../../game/audioManager';

export const INITIAL_EVIDENCE_DATABASE = [
  // ================= 1. HISTORICAL RECORDS (REAL NASA HISTORY) =================
  {
    id: 'hist_surveyor_touchdown',
    category: 'historical',
    title: 'Surveyor 1 Soft Landing (June 2, 1966)',
    classification: 'Verified NASA Historic Record',
    categoryLabel: 'Historical records',
    source: 'NASA Jet Propulsion Laboratory (JPL) Archives',
    dateUnlocked: null,
    isUnlocked: true, // Known from initial mission briefing
    summary: 'Surveyor 1 was humanity’s first successful robotic spacecraft to make a soft touchdown on another celestial body, landing in Oceanus Procellarum on June 2, 1966.',
    details: 'Launched on May 30, 1966 atop an Atlas-Centaur rocket, Surveyor 1 proved that a spacecraft could navigate, decelerate with automated Doppler radar guidance, and land gently on the Moon without plunging into dangerous quicksand dust.',
    realScienceNotes: 'Touchdown velocity was measured at 3.05 m/s (10.0 ft/s). The landing gear compressed 5.2 cm into the dark regolith, confirming the lunar surface had adequate bearing strength (approx. 0.55 bar) to support the weight of future Apollo lunar modules.',
    telemetry: {
      'Launch Date': 'May 30, 1966 (Cape Canaveral)',
      'Touchdown Date': 'June 2, 1966 06:17:36 UTC',
      'Coordinates': '2.474° S, 43.339° W (Oceanus Procellarum)',
      'Touchdown Speed': '3.05 m/s (10.0 ft/s)',
      'Dry Mass': '294.3 kg (648.8 lb)',
      'Mission Result': '100% Operational Success'
    },
    audioTone: 'historic_chime'
  },
  {
    id: 'hist_vidicon_camera',
    category: 'historical',
    title: 'Vidicon Television Camera Assembly',
    classification: 'Verified NASA Spacecraft Hardware',
    categoryLabel: 'Historical records',
    source: 'Hughes Aircraft / NASA JPL Optical Lab',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'Motorized variable focal-length television camera with an adjustable quartz mirror and color filter wheel.',
    details: 'Mounted vertically on the central spaceframe, the camera utilized a 45-degree mirror that could rotate 360 degrees in azimuth and tilt between +40 and -65 degrees in elevation. Between June 2 and July 14, 1966, it beamed 11,240 individual television frames to Deep Space Network tracking stations.',
    realScienceNotes: 'The Vidicon tube operated in two modes: 200-line resolution (transmitted over low-gain antenna at 1 frame per 61.8 seconds) and 600-line resolution (transmitted over high-gain antenna at 1 frame per 1.2 seconds). Sequential filters (clear, red, green, blue) yielded humanity’s first reconstructed true-color photos from the lunar surface.',
    telemetry: {
      'Sensor Type': 'Vidicon Vacuum Tube (25mm)',
      'Focal Length': 'Variable 25mm to 100mm zoom',
      'Optics Shroud': 'Motorized Quartz Mirror Gimbal',
      'Filter Wheel': 'Clear, Red, Green, Blue Dichroic',
      'Total Frames': '11,240 frames returned',
      'Resolution': '200 / 600 Scan Lines'
    },
    audioTone: 'surveyor_scanner'
  },
  {
    id: 'hist_solar_array',
    category: 'historical',
    title: 'Photovoltaic Array & Planar High-Gain Antenna',
    classification: 'Verified NASA Power Hardware',
    categoryLabel: 'Historical records',
    source: 'NASA Lewis Research Center / Hughes Aircraft',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'A 792-cell silicon solar panel and high-gain planar antenna mounted atop a 1-meter motorized mast.',
    details: 'The solar mast tracked the Sun across the 14-day lunar daylight cycle to supply continuous power to the silver-zinc battery. The planar high-gain directional antenna beamed S-band signals directly to Earth tracking stations in California, Australia, and Spain.',
    realScienceNotes: 'During lunar night (-130°C), all systems entered thermal hibernation. Surveyor 1 survived its first two-week freeze and revived on June 24, 1966 when the sun rose again, continuing communication until January 1967.',
    telemetry: {
      'Cell Count': '792 Single-Crystal N-on-P Silicon',
      'Peak Power': '89.2 Watts @ direct insolation',
      'Downlink Band': '2295 MHz S-Band Transponder',
      'Tracking Axis': 'Dual-gimbal motorized azimuth/elevation',
      'Thermal Tolerance': '-130°C to +120°C operational limit',
      'Battery Chemistry': 'Rechargeable Silver-Zinc Auxiliary'
    },
    audioTone: 'interface_tone'
  },
  {
    id: 'hist_soil_mechanics',
    category: 'historical',
    title: 'Crushable Honeycomb Footpads & Soil Mechanics',
    classification: 'Verified NASA Scientific Experiment',
    categoryLabel: 'Historical records',
    source: 'Surveyor Scientific Analysis Team / USGS Astrogeology',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'Three landing legs equipped with crushable aluminum honeycomb footpads and strain gauges to measure regolith compaction.',
    details: 'Prior to Surveyor 1, some planetary scientists speculated that the lunar maria were oceans of frictionless dust deep enough to swallow any descending lander. Surveyor 1 conclusively dispelled this theory.',
    realScienceNotes: 'Footpad #2 penetrated only 5.2 cm into the lunar dust, creating a distinct displacement trench with a crisp, powdery rim that confirmed cohesive soil mechanics. The regolith was determined to have a bulk density of 1.5 g/cm³, perfectly capable of supporting astronauts on foot.',
    telemetry: {
      'Absorber Material': 'Crushable Honeycomb Aluminum Alloy',
      'Leg Configuration': 'Tripod tubular hinged outriggers',
      'Soil Displacement': '5.2 cm trench depth',
      'Regolith Density': '1.52 g/cm³ bulk specific gravity',
      'Bearing Strength': '0.55 bar @ 5 cm depth',
      'Erosion Rate': 'Effectively 0.00 mm/century'
    },
    audioTone: 'surveyor_scanner'
  },
  {
    id: 'hist_atlas_centaur',
    category: 'historical',
    title: 'Atlas-Centaur High-Energy Launch Vehicle',
    classification: 'Verified NASA Rocketry Heritage',
    categoryLabel: 'Historical records',
    source: 'General Dynamics Astronautics / NASA Lewis',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'The historic launch vehicle that pioneered liquid hydrogen / liquid oxygen high-energy upper stages.',
    details: 'Centaur was the world’s first operational cryogenic upper stage. The Surveyor 1 flight was Centaur’s first complete mission success, validating cryogenic propellants that later powered the Apollo Saturn V third stage (S-IVB).',
    realScienceNotes: 'Surveyor was launched directly into a lunar transfer orbit without parking in Earth orbit, completing its 386,000 km journey in approximately 63.6 hours.',
    telemetry: {
      'First Stage': 'Atlas D booster (RP-1 / LOX)',
      'Upper Stage': 'Centaur AC-10 (LH2 / LOX RL10 engines)',
      'Launch Pad': 'LC-36A Cape Canaveral Air Force Station',
      'Transit Time': '63 hours, 36 minutes',
      'Injection Accuracy': 'Miss distance < 15 km before mid-course',
      'Payload Weight': '995.2 kg at translunar injection'
    },
    audioTone: 'historic_chime'
  },

  // ================= 2. INVESTIGATION EVIDENCE (PHYSICAL LUNAR CLUES) =================
  {
    id: 'evid_basalt_outcrop',
    category: 'investigation',
    title: 'Pre-Imbrian Basalt Outcrop (Point A)',
    classification: 'Expedition Field Evidence',
    categoryLabel: 'Investigation evidence',
    source: 'Aegis-01 Multi-Spectral Surface Assay',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'Shock-shattered basalt outcrop exhibiting anomalous thermal conductivity and electromagnetic scattering.',
    details: 'Located at Point A on the perimeter rock field. Geological inspection confirms high-titanium lunar mare basalt with impact breccia inclusions. The rock matrix attenuates underground vibrational waves, dispersing the source carrier.',
    realScienceNotes: 'Lunar mare basalts are rich in ilmenite (FeTiO3) and pyroxene. Natural seismic waves dissipate rapidly in porous regolith; however, the scanner detected an unnaturally coherent 432 Hz waveform propagating through the bedrock.',
    telemetry: {
      'Mineral Composition': 'High-Titanium Ilmenite / Olivine / Plagioclase',
      'Shock Stage': 'S3 Moderately Shocked Breccia',
      'Signal Attenuation': '-14.2 dB acoustic loss',
      'Measured Harmonic': '28.4% Weak Carrier Baseline',
      'Vector Directivity': 'Pointing WNW toward crater bowl rim'
    },
    audioTone: 'scanner_ping'
  },
  {
    id: 'evid_crater_scree',
    category: 'investigation',
    title: 'Impact Crater Scree Slope (Point B)',
    classification: 'Expedition Field Evidence',
    categoryLabel: 'Investigation evidence',
    source: 'EVA Suit Telemetry Array',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'Unconsolidated talus scree resting at the critical angle of repose on the rim of the investigation crater.',
    details: 'Point B provides an acoustic boundary layer. The parabolic shape of the crater bowl acts as an amplifier for subsurface acoustic emissions, focusing the signal strength to 65%.',
    realScienceNotes: 'In the vacuum of space, electrostatic charging on lunar dust causes scree grains to stick along the 31-degree slope. Vibrational resonance was measured vibrating individual dust grains without gas conduction.',
    telemetry: {
      'Slope Angle': '31.4° Angle of Repose',
      'Grain Particle Size': '40-70 micrometers dry aggregate',
      'Electrostatic Charge': '+12.8 kV daylight potential',
      'Harmonic Reading': '65.2% Medium Signal Resonance',
      'Wave Reflection': 'Parabolic acoustic concavity'
    },
    audioTone: 'scanner_ping'
  },
  {
    id: 'evid_data_conduit_line',
    category: 'investigation',
    title: 'Surface Data Conduit Physical Pathway',
    classification: 'Expedition Field Evidence',
    categoryLabel: 'Investigation evidence',
    source: 'Carrier Aegis Optical LIDAR Map',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'A narrow, glassy optoelectronic line connecting the crater floor structure directly into Surveyor 1’s landing pad.',
    details: 'Physical conduit snaking across 78 meters of lunar regolith. The conduit lacks external mechanical joints and emits a steady rhythmic pulse of 488 nm cyan photons traveling unidirectionally away from the lander.',
    realScienceNotes: 'Micro-spectrometry indicates an outer sheath of amorphous fused silica surrounding an inner carbon-silicide waveguide core. Thermal dissipation is zero, suggesting lossless superconductive light transmission.',
    telemetry: {
      'Span Length': '78.4 metres continuous run',
      'Conduit Diameter': '32 mm monolithic profile',
      'Surface Temperature': '-40°C isothermal',
      'Light Wavelength': '488 nm coherent cyan',
      'Coupling Point': 'Clamped to Footpad 2 damper bracket'
    },
    audioTone: 'anomaly_harmonic'
  },
  {
    id: 'evid_recovery_gantry',
    category: 'investigation',
    title: 'Artemis Recovery Rig & Hydraulic Bracing',
    classification: 'Expedition Field Equipment',
    categoryLabel: 'Investigation evidence',
    source: 'Aegis Engineering Operations Log',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'Reinforced carbon-fiber gantry deployed to isolate extraneous transmissions while protecting the historic spacecraft.',
    details: 'Hydraulic stabilization rig engineered to cradle Surveyor 1 without disturbing its historic patina or underlying soil trench. Equipped with high-isolation electromagnetic chokes.',
    realScienceNotes: 'To disconnect an unknown alien data feed without causing an inductive voltage spike that would fry the 1966 magnetic core memory, the rig establishes an isolative harmonic bridge.',
    telemetry: {
      'Frame Material': 'Carbon-Nanotube Matrix Composite',
      'Hydraulic Actuation': 'Synthetic silicone low-temp fluid',
      'Isolation Choke': 'Superconducting inductive shunt',
      'Clamping Force': '450 N calibrated load',
      'Archive Safety': '100% Guaranteed Zero Data Loss'
    },
    audioTone: 'interface_tone'
  },
  {
    id: 'evid_quantum_vault',
    category: 'investigation',
    title: 'Quantum Archive Storage Vault (Q-SSD)',
    classification: 'Expedition Field Equipment',
    categoryLabel: 'Investigation evidence',
    source: 'Project Legacy Hardware Manifest',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'Radiation-hardened cryo-optical solid-state storage unit engineered for permanent extraterrestrial archive retention.',
    details: 'The portable vault clamped to Surveyor 1 to ingest the 11,240 recovered photographic frames alongside the isolated anomalous signal fragment.',
    realScienceNotes: 'Utilizes 3D crystal lattice optical storage capable of withstanding direct cosmic radiation and 100,000 thermal cycles with zero bit decay.',
    telemetry: {
      'Storage Capacity': '16 Petabytes optical lattice',
      'Encryption': 'Post-Quantum Lattice Cryptography',
      'Housing': 'Depleted Uranium / Boron Shielding',
      'Historic Frames Stored': '11,240 / 11,240 frames intact',
      'Data Integrity': 'SHA-3 512-bit verified'
    },
    audioTone: 'historic_chime'
  },

  // ================= 3. UNKNOWN SIGNALS (FICTIONAL MYSTERY LORE) =================
  {
    id: 'sig_harmonic_432',
    category: 'signals',
    title: '432.06 Hz Subsurface Electromagnetic Carrier',
    classification: 'Anomalous Precursor Phenomenon',
    categoryLabel: 'Unknown signals',
    source: 'Suit Magnetometer / Seismograph',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'An unexplainable continuous harmonic sine wave radiating from the lunar interior beneath Oceanus Procellarum.',
    details: 'A clean, mathematically perfect 432.06 Hz carrier wave detected by Maya Chen during the descent. The wave does not match lunar natural quakes, thermal snapping, or human satellite frequencies.',
    realScienceNotes: '[FICTIONAL LORE] Natural moonquakes produce jagged, broadband, chaotic seismic waves that reverberate for hours due to dry rocks. A continuous pure harmonic sine wave can only be produced by an artificial resonator or intelligent transmission system.',
    telemetry: {
      'Base Frequency': '432.06 Hz continuous sine wave',
      'Signal Stability': '0.0001 Hz drift over 48 hours',
      'Polarization': 'Circular right-handed EM vector',
      'Estimated Depth': '82 metres beneath crater floor',
      'Modulation': 'Embedded sub-carrier data burst'
    },
    audioTone: 'anomaly_harmonic'
  },
  {
    id: 'sig_precursor_structure',
    category: 'signals',
    title: 'Crystalline Carbon-Silicide Metamaterial',
    classification: 'Anomalous Precursor Phenomenon',
    categoryLabel: 'Unknown signals',
    source: 'Handheld Scanner Molecular Spectrometer',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'Exposed subterranean structure constructed from non-terrestrial crystalline superalloys devoid of rivets or joints.',
    details: 'Discovered buried beneath the crater floor. Regolith shifts revealed an obsidian-black geometric structure pulsing with internal cyan circuitry. The material exhibits an atom-perfect crystal lattice unknown to modern terrestrial materials science.',
    realScienceNotes: '[FICTIONAL LORE] The structure possesses zero mechanical joints, rivets, or welds—appearing as if grown from a single macroscopic macromolecule. Surface reflectivity exceeds 99.8% across visible spectra.',
    telemetry: {
      'Material Lattice': 'Carbon-Silicide Diamondoid Composite',
      'Tensile Strength': '> 120 GPa (Exceeds carbon nanotubes)',
      'Luminescence': '488 nm pulsed coherent cyan',
      'Surface Seams': 'Zero (Monolithic synthesis)',
      'Age Estimate': 'Predates human spaceflight'
    },
    audioTone: 'anomaly_harmonic'
  },
  {
    id: 'sig_volumetric_interface',
    category: 'signals',
    title: 'Bio-Resonant Volumetric Hologram Console',
    classification: 'Anomalous Precursor Phenomenon',
    categoryLabel: 'Unknown signals',
    source: 'Handheld Scanner Optoelectronic Handshake',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'An interactive precursor console that reacts to scanner carrier frequencies, projecting a 3D hologram of Surveyor 1.',
    details: 'Pointing the handheld scanner at the central console initiates an automated optoelectronic handshake. The console synthesizes an exact 3D wireframe hologram of Surveyor 1, revealing that the structure has been archiving the lander’s telemetry for over a century.',
    realScienceNotes: '[FICTIONAL LORE] The projection utilizes trapped-ion airless photon interference to project crisp volumetric images in the vacuum without requiring a smoke or mist medium.',
    telemetry: {
      'Handshake Carrier': '432.06 Hz frequency match',
      'Emitter Type': 'Solid-State Trapped-Ion Projector',
      'Projected Subject': 'Surveyor 1 (Full 1:1 Scale Wireframe)',
      'Interactive State': 'Synchronized with Project Legacy EVA probe',
      'Protocol Type': 'Autonomous Passive Surveillance'
    },
    audioTone: 'anomaly_harmonic'
  },
  {
    id: 'sig_extraction_telemetry',
    category: 'signals',
    title: 'Siphoned Surveyor 1 Telemetry Stream',
    classification: 'Anomalous Precursor Phenomenon',
    categoryLabel: 'Unknown signals',
    source: 'Conduit Demodulator Log',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'Decoded data packets proving the alien structure was actively reading Surveyor 1’s historical memory banks.',
    details: 'Maya Chen’s telemetry analysis confirmed the conduit was not feeding power into Surveyor 1—it was extracting data. It had catalogued every photograph, temperature cycle, and radio pulse transmitted by the spacecraft since June 1966.',
    realScienceNotes: '[FICTIONAL LORE] Why would an extraterrestrial installation record a primitive 1960s robotic probe? Arin Rao: "It was studying our first footprint. It wanted to see what humanity sent when we first touched the Moon."',
    telemetry: {
      'Data Flux': '1.42 Terabits / second harmonic stream',
      'Origin Payload': 'Vidicon Image Frame Buffer (1966)',
      'Extraction Direction': 'Surveyor 1 -> Alien Structure',
      'Ingestion Ratio': '100% of historical transmission',
      'Surveillance Duration': '160 Earth Years continuous'
    },
    audioTone: 'anomaly_harmonic'
  },
  {
    id: 'sig_vault_zero_coords',
    category: 'signals',
    title: 'Precursor Horizon Coordinates: "Vault Zero"',
    classification: 'Anomalous Precursor Phenomenon',
    categoryLabel: 'Unknown signals',
    source: 'Recovered Signal Fragment Decryption',
    dateUnlocked: null,
    isUnlocked: false,
    summary: 'Extracted mathematical coordinate vector pointing across the lunar horizon to an undisclosed subterranean facility.',
    details: 'Upon isolating the anomalous transmission, a decrypted navigation fragment was projected above the mission terminal. The coordinates designate an unexplored sector beyond the Ocean of Storms.',
    realScienceNotes: '[FICTIONAL LORE] Commander Elena: "Captain, this wasn\'t just a recovery operation. Something was using Surveyor\'s data... Welcome to Project Legacy, Captain." The signal beacon on the horizon marks our next destination.',
    telemetry: {
      'Decrypted Vector': 'Lunar Coordinate Sector 7G-Delta',
      'Target Designation': 'Precursor Installation "Vault Zero"',
      'Bearing from Landing Site': '284.5° West-Northwest',
      'Estimated Traverse': '142 km across lunar highlands',
      'Status': 'Transmitted to Command Ship Aegis'
    },
    audioTone: 'historic_chime'
  }
];

export default function EvidenceDatabaseModal({ 
  isOpen, 
  onClose, 
  databaseEntries = INITIAL_EVIDENCE_DATABASE 
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedEntryId, setSelectedEntryId] = useState(databaseEntries[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnlockedOnly, setFilterUnlockedOnly] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Tab' || e.code === 'KeyJ') {
        if (isOpen) {
          e.preventDefault();
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Statistics
  const stats = useMemo(() => {
    const total = databaseEntries.length;
    const unlocked = databaseEntries.filter(e => e.isUnlocked).length;
    const histUnlocked = databaseEntries.filter(e => e.category === 'historical' && e.isUnlocked).length;
    const histTotal = databaseEntries.filter(e => e.category === 'historical').length;
    const evidUnlocked = databaseEntries.filter(e => e.category === 'investigation' && e.isUnlocked).length;
    const evidTotal = databaseEntries.filter(e => e.category === 'investigation').length;
    const sigUnlocked = databaseEntries.filter(e => e.category === 'signals' && e.isUnlocked).length;
    const sigTotal = databaseEntries.filter(e => e.category === 'signals').length;
    return {
      total,
      unlocked,
      percent: Math.round((unlocked / (total || 1)) * 100),
      historical: `${histUnlocked}/${histTotal}`,
      investigation: `${evidUnlocked}/${evidTotal}`,
      signals: `${sigUnlocked}/${sigTotal}`
    };
  }, [databaseEntries]);

  // Filtered List
  const filteredEntries = useMemo(() => {
    return databaseEntries.filter(entry => {
      if (activeCategory !== 'all' && entry.category !== activeCategory) {
        return false;
      }
      if (filterUnlockedOnly && !entry.isUnlocked) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = entry.title.toLowerCase().includes(q);
        const matchesSummary = entry.summary.toLowerCase().includes(q);
        const matchesCategory = entry.categoryLabel.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesCategory) return false;
      }
      return true;
    });
  }, [databaseEntries, activeCategory, filterUnlockedOnly, searchQuery]);

  const selectedEntry = useMemo(() => {
    return databaseEntries.find(e => e.id === selectedEntryId) || filteredEntries[0] || databaseEntries[0];
  }, [databaseEntries, selectedEntryId, filteredEntries]);

  const playTone = (entry) => {
    audio.playClick();
    if (entry.category === 'signals') {
      audio.playAnomalyHarmonic();
    } else if (entry.category === 'historical') {
      audio.playSurveyorScannerBeep();
    } else {
      audio.playSurveyorInterface();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-mono select-none">
      <div className="relative w-full max-w-5xl rounded-2xl bg-slate-950/95 border-2 border-cyan-500/50 shadow-[0_0_60px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col h-[90vh]">
        
        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-3.5 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-black">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Database className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 tracking-widest uppercase flex items-center gap-2">
                <span>PROJECT LEGACY · MISSION 01 EVIDENCE DATABASE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase flex items-center gap-3">
                <span>The First Footprint Telemetry Archive</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-normal">
                  {stats.unlocked} / {stats.total} Records ({stats.percent}%)
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 hidden sm:inline font-mono">
              [Tab] / [J] to close · [Esc] exit
            </span>
            <button
              type="button"
              onClick={() => { audio.playClick(); onClose(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close [Esc or Tab]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 3 CATEGORIES TABS BAR */}
        <div className="px-6 py-2.5 bg-black/60 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => { audio.playClick(); setActiveCategory('all'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              ALL RECORDS ({stats.unlocked}/{stats.total})
            </button>

            <button
              type="button"
              onClick={() => { audio.playClick(); setActiveCategory('historical'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeCategory === 'historical'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30'
                  : 'bg-blue-950/40 text-blue-300 border-blue-500/30 hover:bg-blue-900/40'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>1. Historical records</span>
              <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px]">{stats.historical}</span>
            </button>

            <button
              type="button"
              onClick={() => { audio.playClick(); setActiveCategory('investigation'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeCategory === 'investigation'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-600/30'
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>2. Investigation evidence</span>
              <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px]">{stats.investigation}</span>
            </button>

            <button
              type="button"
              onClick={() => { audio.playClick(); setActiveCategory('signals'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeCategory === 'signals'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                  : 'bg-purple-950/40 text-purple-300 border-purple-500/30 hover:bg-purple-900/40'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>3. Unknown signals</span>
              <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px]">{stats.signals}</span>
            </button>
          </div>

          {/* Search bar & Unlocked Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search telemetry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg bg-black/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="button"
              onClick={() => { audio.playClick(); setFilterUnlockedOnly(prev => !prev); }}
              className={`px-2.5 py-1 rounded-lg text-xs border font-medium transition-colors ${
                filterUnlockedOnly 
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {filterUnlockedOnly ? 'Unlocked Only' : 'Show All'}
            </button>
          </div>
        </div>

        {/* MAIN BODY: 2 COLUMN PANELS */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* LEFT COLUMN: LIST OF RECORDS (md:col-span-5) */}
          <div className="md:col-span-5 border-r border-white/10 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-black/30">
            {filteredEntries.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No matching telemetry records found in database.
              </div>
            ) : (
              filteredEntries.map(entry => {
                const isSelected = entry.id === selectedEntry?.id;
                const isHist = entry.category === 'historical';
                const isEvid = entry.category === 'investigation';
                const isSig = entry.category === 'signals';

                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => { audio.playClick(); setSelectedEntryId(entry.id); }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? isHist
                          ? 'bg-blue-950/60 border-blue-400 shadow-md shadow-blue-500/20'
                          : isEvid
                          ? 'bg-amber-950/60 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-purple-950/60 border-purple-400 shadow-md shadow-purple-500/20'
                        : entry.isUnlocked
                        ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/20'
                        : 'bg-black/40 border-dashed border-white/10 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                        {isHist && <span className="text-blue-400 flex items-center gap-1"><Rocket className="w-3 h-3" /> Historical</span>}
                        {isEvid && <span className="text-amber-400 flex items-center gap-1"><Shield className="w-3 h-3" /> Field Clue</span>}
                        {isSig && <span className="text-purple-400 flex items-center gap-1"><Radio className="w-3 h-3" /> Mystery Signal</span>}
                      </div>

                      <div className="flex items-center gap-1 text-[10px]">
                        {entry.isUnlocked ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="hidden sm:inline">RECORDED</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span className="hidden sm:inline">UNDISCOVERED</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`text-xs font-bold mt-1.5 ${isSelected ? 'text-white' : entry.isUnlocked ? 'text-slate-200' : 'text-slate-400'}`}>
                      {entry.isUnlocked ? entry.title : `Encrypted Telemetry ${entry.id.replace(/^[a-z]+_/, '')}`}
                    </div>

                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-sans">
                      {entry.isUnlocked ? entry.summary : 'Scan or investigate in the lunar field to decrypt this record.'}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* RIGHT COLUMN: DETAILED REPORT PANE (md:col-span-7) */}
          <div className="md:col-span-7 overflow-y-auto p-5 custom-scrollbar bg-slate-950/70 space-y-4 text-xs">
            {selectedEntry ? (
              <>
                {/* Header Badge & Title */}
                <div className="space-y-2 pb-3 border-b border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      selectedEntry.category === 'historical'
                        ? 'bg-blue-950/80 text-blue-300 border-blue-400'
                        : selectedEntry.category === 'investigation'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-400'
                        : 'bg-purple-950/80 text-purple-300 border-purple-400 animate-pulse'
                    }`}>
                      {selectedEntry.classification}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      Category: <strong className="text-white">{selectedEntry.categoryLabel}</strong>
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    {selectedEntry.isUnlocked ? selectedEntry.title : 'Encrypted Telemetry Record'}
                  </h2>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Source:</span>
                    <span className="text-cyan-300 font-medium">{selectedEntry.source}</span>
                  </div>
                </div>

                {selectedEntry.isUnlocked ? (
                  <>
                    {/* Summary */}
                    <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-200 font-sans text-xs leading-relaxed">
                      {selectedEntry.summary}
                    </div>

                    {/* Technical Telemetry Grid */}
                    {selectedEntry.telemetry && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Technical Telemetry Specifications</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                          {Object.entries(selectedEntry.telemetry).map(([k, v]) => (
                            <div key={k} className="p-2 rounded-lg bg-black/50 border border-white/10 flex justify-between">
                              <span className="text-slate-400">{k}:</span>
                              <span className="text-white font-semibold text-right">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detailed Analysis */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>Comprehensive Archival Dossier</span>
                      </div>
                      <p className="text-slate-300 font-sans leading-relaxed p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                        {selectedEntry.details}
                      </p>
                    </div>

                    {/* Real Science vs Mystery Lore Banner */}
                    <div className={`p-4 rounded-xl border space-y-2 ${
                      selectedEntry.category === 'historical'
                        ? 'bg-blue-950/30 border-blue-500/40 text-blue-200'
                        : selectedEntry.category === 'investigation'
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                        : 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                    }`}>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          {selectedEntry.category === 'historical' ? <Rocket className="w-3.5 h-3.5 text-blue-400" /> :
                           selectedEntry.category === 'investigation' ? <Shield className="w-3.5 h-3.5 text-amber-400" /> :
                           <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                          {selectedEntry.category === 'historical' ? 'REAL NASA SCIENCE & HISTORIC CONTEXT' :
                           selectedEntry.category === 'investigation' ? 'EXPEDITION GEOLOGICAL & RECOVERY DATA' :
                           'PROJECT LEGACY SCI-FI LORE & MYSTERY SIGNALS'}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40">
                          {selectedEntry.category === 'historical' ? '100% Real History' :
                           selectedEntry.category === 'investigation' ? 'Scientific Extrapolation' :
                           'Fictional Mystery Narrative'}
                        </span>
                      </div>

                      <p className="font-sans text-xs leading-relaxed">
                        {selectedEntry.realScienceNotes}
                      </p>
                    </div>

                    {/* Acoustic Tone / Replay Log Button */}
                    <div className="pt-2 flex items-center justify-between border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => playTone(selectedEntry)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-bold transition-all"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Replay Telemetry Tone</span>
                      </button>

                      <span className="text-[10px] text-slate-500 font-mono">
                        STATUS: VERIFIED IN MISSION DATABASE
                      </span>
                    </div>
                  </>
                ) : (
                  // Locked state view
                  <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-white">Record Locked & Encrypted</div>
                    <p className="text-xs text-slate-400 max-w-sm font-sans">
                      This entry will automatically be unlocked and decoded when you locate and scan the relevant component or anomaly on the lunar surface.
                    </p>
                    <div className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
                      Use Handheld Scanner [Q] or Inspect [E] to unlock
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

        </div>

        {/* FOOTER */}
        <footer className="px-6 py-2.5 border-t border-cyan-500/30 bg-black/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PROJECT LEGACY KNOWLEDGE REPOSITORY · 2126 EXPEDITION</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-500 hidden sm:inline">
              Historical Records · Field Evidence · Unknown Signals
            </span>
            <button
              type="button"
              onClick={() => { audio.playClick(); onClose(); }}
              className="px-4 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Resume EVA [Esc]
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}

