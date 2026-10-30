import * as THREE from 'three';

/**
 * Procedural Texture & Bump Map Generator for Planetary & Lunar Globes
 * Produces scientifically credible, high-detail planetary surfaces inspired by NASA Eyes.
 */
function createPlanetTexture(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (data.id === 'sun') {
    // Dynamic solar surface gradient with intense nuclear core
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#ff7700');
    grad.addColorStop(0.25, '#ffaa00');
    grad.addColorStop(0.5, '#fff066');
    grad.addColorStop(0.75, '#ffaa00');
    grad.addColorStop(1, '#ff5500');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Turbulent solar granulations & sunspots
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const r = Math.random() * 3.5 + 1;
      ctx.fillStyle = Math.random() > 0.45 ? 'rgba(255, 255, 220, 0.55)' : 'rgba(180, 45, 0, 0.45)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (data.id === 'earth') {
    // Deep blue oceans with coastal continental shelves
    ctx.fillStyle = '#0c3066';
    ctx.fillRect(0, 0, 1024, 512);

    // Continental shelves
    const shelves = [
      { x: 300, y: 180, rx: 110, ry: 85 },
      { x: 370, y: 320, rx: 85, ry: 105 },
      { x: 530, y: 160, rx: 95, ry: 75 },
      { x: 540, y: 280, rx: 105, ry: 115 },
      { x: 720, y: 180, rx: 160, ry: 105 },
      { x: 820, y: 340, rx: 85, ry: 75 }
    ];
    ctx.fillStyle = '#1e5f8a';
    shelves.forEach(s => {
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.rx, s.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Continental landmasses
    const continents = [
      { x: 300, y: 180, rx: 90, ry: 70, col: '#23533e' }, // North America
      { x: 370, y: 320, rx: 70, ry: 90, col: '#2d6a4f' }, // South America
      { x: 530, y: 160, rx: 80, ry: 60, col: '#40916c' }, // Europe
      { x: 540, y: 280, rx: 90, ry: 100, col: '#9c6644' }, // Africa (Savannah/Sahara)
      { x: 720, y: 180, rx: 140, ry: 90, col: '#23533e' }, // Asia
      { x: 820, y: 340, rx: 70, ry: 60, col: '#ca6702' }   // Australia (Outback)
    ];

    continents.forEach(c => {
      ctx.fillStyle = c.col;
      for (let j = 0; j < 65; j++) {
        const ox = (Math.random() - 0.5) * c.rx * 1.6;
        const oy = (Math.random() - 0.5) * c.ry * 1.6;
        const rad = Math.random() * 40 + 16;
        ctx.beginPath();
        ctx.arc(c.x + ox, c.y + oy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Sahara desert
    ctx.fillStyle = '#d4a373';
    ctx.beginPath();
    ctx.ellipse(540, 220, 75, 30, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // Polar ice caps
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 44);
    ctx.fillRect(0, 468, 1024, 44);

  } else if (data.id === 'mars') {
    // Mars base rusty regolith
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#9e3816');
    grad.addColorStop(0.2, '#c85a32');
    grad.addColorStop(0.5, '#e06f38');
    grad.addColorStop(0.8, '#b84a22');
    grad.addColorStop(1, '#852b12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Dark volcanic basalt basins (Acidalia Planitia, Syrtis Major, Hellas Basin)
    ctx.fillStyle = 'rgba(55, 20, 10, 0.55)';
    for (let i = 0; i < 110; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * 1024, Math.random() * 320 + 96, Math.random() * 75 + 20, Math.random() * 28 + 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Syrtis Major Planum (prominent dark triangular feature)
    ctx.fillStyle = 'rgba(42, 14, 8, 0.72)';
    ctx.beginPath();
    ctx.moveTo(680, 210);
    ctx.lineTo(740, 290);
    ctx.lineTo(660, 295);
    ctx.closePath();
    ctx.fill();

    // Valles Marineris canyon system (4,000 km grand canyon)
    ctx.fillStyle = 'rgba(32, 10, 6, 0.85)';
    ctx.beginPath();
    ctx.ellipse(380, 275, 125, 12, 0.1, 0, Math.PI * 2);
    ctx.fill();
    // Canyon branching chasms
    ctx.beginPath();
    ctx.ellipse(330, 280, 45, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Olympus Mons (largest shield volcano in solar system)
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(245, 205, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a1306'; // Caldera
    ctx.beginPath();
    ctx.arc(245, 205, 7, 0, Math.PI * 2);
    ctx.fill();

    // Tharsis Montes volcanic chain
    [
      { x: 290, y: 220, r: 16 },
      { x: 310, y: 255, r: 15 },
      { x: 330, y: 290, r: 16 }
    ].forEach(tm => {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(tm.x, tm.y, tm.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#381005';
      ctx.beginPath();
      ctx.arc(tm.x, tm.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Brilliant white dry-ice polar caps (Planum Boreum & Planum Australe)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.fillRect(0, 0, 1024, 30);
    ctx.fillRect(0, 482, 1024, 30);

  } else if (data.id === 'jupiter') {
    // Realistic alternating atmospheric cloud bands
    const bands = [
      '#a06535', '#c89666', '#eedbc5', '#8b4f2c', '#dfb88e',
      '#c27d49', '#f2e5d5', '#9e572d', '#b07246', '#e0c3a2', '#7f441c'
    ];
    const bandHeight = 512 / bands.length;
    bands.forEach((bColor, idx) => {
      ctx.fillStyle = bColor;
      ctx.fillRect(0, idx * bandHeight, 1024, bandHeight + 2);
    });

    // Turbulent storm swirls & zonal shear ripples
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 245, 230, 0.42)' : 'rgba(90, 40, 10, 0.42)';
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 70 + 20, Math.random() * 9 + 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // The Great Red Spot
    ctx.fillStyle = '#b33927';
    ctx.beginPath();
    ctx.ellipse(650, 310, 62, 36, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8e2315';
    ctx.beginPath();
    ctx.ellipse(650, 310, 42, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 220, 200, 0.35)';
    ctx.beginPath();
    ctx.ellipse(650, 310, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();

  } else if (data.id === 'saturn') {
    const bands = ['#d4b97a', '#edd8a4', '#c9a861', '#faedd0', '#bfa25f', '#e6c888', '#d6b36d', '#cfad63'];
    const h = 512 / bands.length;
    bands.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, i * h, 1024, h + 2);
    });

    // Subtle equatorial haze
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i < 40; i++) {
      ctx.fillRect(0, Math.random() * 512, 1024, Math.random() * 8 + 2);
    }

  } else if (data.id === 'uranus') {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#58b4b7');
    grad.addColorStop(0.5, '#7ee2e5');
    grad.addColorStop(1, '#489fa2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 30; i++) {
      ctx.fillRect(0, Math.random() * 512, 1024, Math.random() * 8 + 2);
    }

  } else if (data.id === 'neptune') {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#1e40af');
    grad.addColorStop(0.5, '#2563eb');
    grad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Great Dark Spot
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.ellipse(550, 240, 50, 28, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // White cirrus streaks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 40; i++) {
      ctx.fillRect(Math.random() * 1024, Math.random() * 400 + 56, Math.random() * 120 + 30, Math.random() * 3 + 1);
    }

  } else if (data.id === 'pluto') {
    // Reddish tholin terrain with bright creamy nitrogen heart (Tombaugh Regio)
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#78350f');
    grad.addColorStop(0.5, '#92400e');
    grad.addColorStop(1, '#451a03');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Dark equatorial Cthulhu Macula
    ctx.fillStyle = '#291206';
    ctx.beginPath();
    ctx.ellipse(320, 280, 140, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sputnik Planitia / Tombaugh Regio Heart feature
    ctx.fillStyle = '#fef3c7'; // Creamy nitrogen/methane ice
    ctx.beginPath();
    // Left lobe
    ctx.ellipse(540, 250, 65, 80, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Right lobe
    ctx.ellipse(615, 260, 55, 65, 0.2, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // Mercury and general cratered terrestrial body
    const palette = data.surfacePalette || ['#64748b', '#94a3b8', '#cbd5e1'];
    ctx.fillStyle = palette[0];
    ctx.fillRect(0, 0, 1024, 512);

    for (let p = 1; p < palette.length; p++) {
      ctx.fillStyle = palette[p];
      for (let i = 0; i < 90; i++) {
        ctx.beginPath();
        const y = Math.random() * 512;
        ctx.ellipse(Math.random() * 1024, y, Math.random() * 130 + 30, Math.random() * 26 + 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Impact craters with rims
    for (let c = 0; c < 150; c++) {
      const cx = Math.random() * 1024;
      const cy = Math.random() * 512;
      const cr = Math.random() * 15 + 3;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr + 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedural Texture Generator for Moons
 * Moon, Phobos, Deimos, Io, Europa, Ganymede, Callisto, Titan, Enceladus, Triton
 */
function createMoonTexture(moonData) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (moonData.id === 'moon') {
    // Earth's Moon: detailed maria & crater rays
    ctx.fillStyle = '#94a3b8'; // Anorthosite highland regolith
    ctx.fillRect(0, 0, 512, 256);

    // Basaltic Dark Maria (Oceanus Procellarum, Mare Tranquillitatis, Imbrium, Serenitatis)
    const maria = [
      { x: 180, y: 110, rx: 55, ry: 45 }, // Oceanus Procellarum
      { x: 260, y: 100, rx: 35, ry: 28 }, // Mare Imbrium
      { x: 310, y: 120, rx: 25, ry: 20 }, // Mare Serenitatis
      { x: 340, y: 135, rx: 28, ry: 22 }, // Mare Tranquillitatis (Apollo 11 site!)
      { x: 380, y: 125, rx: 18, ry: 15 }  // Mare Crisium
    ];
    ctx.fillStyle = '#334155';
    maria.forEach(m => {
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Tycho Crater with radiating white ejecta rays
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(260, 200, 6, 0, Math.PI * 2); // Tycho
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8;
      ctx.beginPath();
      ctx.moveTo(260, 200);
      ctx.lineTo(260 + Math.cos(angle) * 110, 200 + Math.sin(angle) * 110);
      ctx.stroke();
    }

    // Copernicus crater
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.arc(220, 120, 5, 0, Math.PI * 2);
    ctx.fill();

    // Highland craters
    for (let c = 0; c < 120; c++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 256;
      const cr = Math.random() * 6 + 1.5;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(30, 41, 59, 0.55)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (moonData.id === 'europa') {
    // Europa: bright ice shell + reddish-brown fracture lineae
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 512, 256);

    // Chaos terrain patches
    ctx.fillStyle = 'rgba(180, 83, 9, 0.25)';
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 30 + 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Criss-crossing lineae fractures
    ctx.strokeStyle = 'rgba(161, 98, 7, 0.55)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, Math.random() * 256);
      ctx.bezierCurveTo(
        Math.random() * 512, Math.random() * 256,
        Math.random() * 512, Math.random() * 256,
        Math.random() * 512, Math.random() * 256
      );
      ctx.stroke();
    }

  } else if (moonData.id === 'io') {
    // Io: volcanic sulfur pizza surface
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 512, 256);

    // Sulfur patches
    ctx.fillStyle = '#ea580c';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 20 + 5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Volcanic calderas (Pele, Loki Patera)
    ctx.fillStyle = '#451a03';
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 5 + 2, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (moonData.id === 'titan') {
    // Titan: thick orange-amber nitrogen-methane haze
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#d97706');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Subtle atmospheric bands
    ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(0, Math.random() * 256, 512, Math.random() * 10 + 2);
    }

  } else if (moonData.id === 'enceladus') {
    // Enceladus: ultra-bright pure reflective ice + south polar tiger stripes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.5;
    // Tiger stripe fissures at south pole
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(180 + i * 40, 220);
      ctx.bezierCurveTo(200 + i * 40, 230, 220 + i * 40, 235, 240 + i * 40, 245);
      ctx.stroke();
    }

  } else if (moonData.id === 'phobos' || moonData.id === 'deimos') {
    // Phobos / Deimos: heavily cratered carbonaceous asteroid regolith
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 512, 256);

    // Giant Stickney crater for Phobos
    if (moonData.id === 'phobos') {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(220, 130, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(220, 130, 52, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Dense impact cratering
    for (let c = 0; c < 140; c++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 256;
      const cr = Math.random() * 8 + 1.5;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }

  } else {
    // General icy/rocky moon (Ganymede, Callisto, Triton)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 512, 256);

    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(241, 245, 249, 0.25)' : 'rgba(30, 41, 59, 0.45)';
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 25 + 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createEarthCloudsTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, 1024, 512);

  // Swirling cyclonic storm patterns
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  for (let c = 0; c < 120; c++) {
    const cx = Math.random() * 1024;
    const cy = Math.random() * 420 + 46;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.random() * 110 + 35, Math.random() * 20 + 6, Math.random() * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function createRingTexture(isUranus = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  if (isUranus) {
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.3, 'rgba(165, 243, 252, 0.25)');
    grad.addColorStop(0.6, 'rgba(103, 232, 249, 0.45)');
    grad.addColorStop(0.9, 'rgba(165, 243, 252, 0.2)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  } else {
    // Saturn rings with authentic divisions (C, B, Cassini Gap, A, Encke Gap)
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.12, 'rgba(212, 185, 122, 0.85)'); // C Ring (Crepe)
    grad.addColorStop(0.35, 'rgba(237, 216, 164, 0.95)'); // B Ring
    grad.addColorStop(0.62, 'rgba(0, 0, 0, 0.05)');        // Cassini Division
    grad.addColorStop(0.70, 'rgba(191, 162, 95, 0.85)');  // A Ring
    grad.addColorStop(0.85, 'rgba(166, 135, 68, 0.7)');   // Encke gap outer
    grad.addColorStop(0.96, 'rgba(0, 0, 0, 0.1)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1);

  return new THREE.CanvasTexture(canvas);
}

function createSunCoronaTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.15, 'rgba(255, 235, 150, 0.95)');
  gradient.addColorStop(0.40, 'rgba(255, 160, 20, 0.5)');
  gradient.addColorStop(0.70, 'rgba(255, 90, 0, 0.15)');
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  return new THREE.CanvasTexture(canvas);
}

export class PlanetBody {
  constructor(data, scene) {
    this.data = data;
    this.scene = scene;
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.disposables = [];
    this.moons = [];
    this.clickableMeshes = [];

    this.orbitPivot = new THREE.Group();
    this.scene.add(this.orbitPivot);

    this.container = new THREE.Group();
    this.orbitPivot.add(this.container);

    this.createBody();
    if (this.data.hasRings) {
      this.createRings();
    }
    if (this.data.moons && this.data.moons.length > 0) {
      this.createMoons();
    }
    if (this.data.distance > 0) {
      this.createOrbitPath();
    }

    this.updatePosition(0);
  }

  createBody() {
    const isSun = this.data.id === 'sun';
    const geometry = new THREE.SphereGeometry(this.data.radius, 48, 48);
    this.disposables.push(geometry);

    const texture = createPlanetTexture(this.data);
    this.disposables.push(texture);

    let material;
    if (isSun) {
      material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xffffff
      });

      // PointLight with realistic astronomical illumination
      this.sunLight = new THREE.PointLight(0xfff8ee, 4.5, 1200, 0.35);
      this.container.add(this.sunLight);

      // Warm ambient starlight fill
      const ambientLight = new THREE.AmbientLight(0x1e293b, 0.65);
      this.scene.add(ambientLight);
      this.disposables.push(ambientLight);

      // Multi-layer radiant solar corona sprite
      const coronaTexture = createSunCoronaTexture();
      this.disposables.push(coronaTexture);

      const spriteMat = new THREE.SpriteMaterial({
        map: coronaTexture,
        color: 0xffaa00,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      this.disposables.push(spriteMat);

      this.coronaSprite = new THREE.Sprite(spriteMat);
      this.coronaSprite.scale.set(this.data.radius * 3.8, this.data.radius * 3.8, 1);
      this.container.add(this.coronaSprite);

    } else {
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: this.data.id === 'earth' ? 0.38 : (this.data.id === 'venus' ? 0.95 : 0.72),
        metalness: this.data.id === 'earth' ? 0.12 : 0.05
      });

      // Earth Cloud Layer
      if (this.data.id === 'earth') {
        const cloudGeo = new THREE.SphereGeometry(this.data.radius * 1.012, 48, 48);
        const cloudTexture = createEarthCloudsTexture();
        const cloudMat = new THREE.MeshStandardMaterial({
          map: cloudTexture,
          transparent: true,
          opacity: 0.65,
          blending: THREE.NormalBlending,
          depthWrite: false
        });
        this.disposables.push(cloudGeo, cloudTexture, cloudMat);
        this.cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
        this.container.add(this.cloudMesh);
      }

      // Atmosphere Glow Layer
      if (this.data.atmosphere) {
        const atmoGeo = new THREE.SphereGeometry(this.data.radius * 1.038, 36, 36);
        const atmoMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(this.data.atmosphere.glowColor),
          transparent: true,
          opacity: this.data.atmosphere.opacity * 0.65,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide
        });
        this.disposables.push(atmoGeo, atmoMat);
        const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
        this.container.add(atmoMesh);
      }
    }

    this.disposables.push(material);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.userData = { id: this.data.id, name: this.data.name, isPlanet: true };
    this.mesh.rotation.z = THREE.MathUtils.degToRad(this.data.axialTilt || 0);
    this.container.add(this.mesh);
    this.clickableMeshes.push(this.mesh);

    this.container.position.x = this.data.distance;
  }

  createRings() {
    const ringConfig = this.data.hasRings;
    const isUranus = this.data.id === 'uranus';
    const ringGeo = new THREE.RingGeometry(ringConfig.innerRadius, ringConfig.outerRadius, 64);
    ringGeo.rotateX(Math.PI / 2);
    this.disposables.push(ringGeo);

    const ringTexture = createRingTexture(isUranus);
    this.disposables.push(ringTexture);

    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isUranus ? 0.6 : 0.92,
      roughness: 0.85,
      metalness: 0.05
    });
    this.disposables.push(ringMat);

    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.rotation.z = THREE.MathUtils.degToRad(ringConfig.tilt);
    this.container.add(this.ringMesh);
  }

  createMoons() {
    this.data.moons.forEach(m => {
      let moonGeo;
      const isIrregular = m.id === 'phobos' || m.id === 'deimos';

      if (isIrregular) {
        // Non-spherical potato/asteroid shape
        moonGeo = new THREE.SphereGeometry(m.radius, 20, 20);
        const posAttr = moonGeo.attributes.position;
        const scaleX = m.id === 'phobos' ? 1.35 : 1.25;
        const scaleY = m.id === 'phobos' ? 1.05 : 1.0;
        const scaleZ = m.id === 'phobos' ? 0.82 : 0.78;

        for (let i = 0; i < posAttr.count; i++) {
          let x = posAttr.getX(i) * scaleX;
          let y = posAttr.getY(i) * scaleY;
          let z = posAttr.getZ(i) * scaleZ;
          // Perturb surface with minor bumps
          const bump = 1.0 + (Math.sin(x * 12) + Math.cos(y * 12) + Math.sin(z * 12)) * 0.06;
          posAttr.setXYZ(i, x * bump, y * bump, z * bump);
        }
        moonGeo.computeVertexNormals();
      } else {
        moonGeo = new THREE.SphereGeometry(m.radius, 28, 28);
      }
      this.disposables.push(moonGeo);

      const moonTexture = createMoonTexture(m);
      this.disposables.push(moonTexture);

      const moonMat = new THREE.MeshStandardMaterial({
        map: moonTexture,
        roughness: m.id === 'enceladus' ? 0.2 : 0.85,
        metalness: 0.05
      });
      this.disposables.push(moonMat);

      const moonPivot = new THREE.Group();
      this.container.add(moonPivot);

      const moonMesh = new THREE.Mesh(moonGeo, moonMat);
      moonMesh.position.x = m.distance;
      moonMesh.userData = {
        id: m.id,
        name: m.name,
        isMoon: true,
        parentPlanetId: this.data.id,
        planetName: this.data.name
      };
      moonPivot.add(moonMesh);
      this.clickableMeshes.push(moonMesh);

      // Invisible Raycast Hit Proxy to make clicking small moons 100% reliable
      const hitRadius = Math.max(m.radius * 2.8, 1.4);
      const hitGeo = new THREE.SphereGeometry(hitRadius, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      this.disposables.push(hitGeo, hitMat);
      const hitProxy = new THREE.Mesh(hitGeo, hitMat);
      hitProxy.position.x = m.distance;
      hitProxy.userData = {
        id: m.id,
        name: m.name,
        isMoon: true,
        parentPlanetId: this.data.id,
        planetName: this.data.name
      };
      moonPivot.add(hitProxy);
      this.clickableMeshes.push(hitProxy);

      // Dedicated orbital guide line for moon
      const moonOrbitPoints = [];
      for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        moonOrbitPoints.push(new THREE.Vector3(Math.cos(th) * m.distance, 0, Math.sin(th) * m.distance));
      }
      const moonOrbitGeo = new THREE.BufferGeometry().setFromPoints(moonOrbitPoints);
      const moonOrbitMat = new THREE.LineBasicMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.1
      });
      this.disposables.push(moonOrbitGeo, moonOrbitMat);
      const moonOrbitLine = new THREE.Line(moonOrbitGeo, moonOrbitMat);
      this.container.add(moonOrbitLine);

      // Keep legacy reference for Earth's moon
      if (m.id === 'moon') {
        this.moonMesh = moonMesh;
        this.moonPivot = moonPivot;
      }

      this.moons.push({
        data: m,
        mesh: moonMesh,
        pivot: moonPivot,
        angle: Math.random() * Math.PI * 2
      });
    });
  }

  createOrbitPath() {
    const points = [];
    const segments = 160;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(theta) * this.data.distance,
        0,
        Math.sin(theta) * this.data.distance
      ));
    }

    const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
    this.disposables.push(orbitGeo);

    const isInnerPlanet = this.data.distance < 45;
    const baseColor = isInnerPlanet ? 0x0ea5e9 : 0x64748b;
    const baseOpacity = isInnerPlanet ? 0.12 : 0.08;

    this.orbitMat = new THREE.LineBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: baseOpacity,
      blending: THREE.AdditiveBlending
    });
    this.disposables.push(this.orbitMat);

    this.orbitLine = new THREE.Line(orbitGeo, this.orbitMat);
    this.scene.add(this.orbitLine);
  }

  setOrbitVisibility(visible) {
    if (this.orbitLine) {
      this.orbitLine.visible = visible;
    }
  }

  setHighlight(highlighted) {
    if (this.orbitMat) {
      const isInnerPlanet = this.data.distance < 45;
      this.orbitMat.opacity = highlighted ? 0.65 : (isInnerPlanet ? 0.12 : 0.08);
      this.orbitMat.color.setHex(highlighted ? 0x22d3ee : (isInnerPlanet ? 0x0ea5e9 : 0x64748b));
    }
  }

  setEphemerisPosition(x, y, z) {
    this.container.position.set(x, y, z);
  }

  updatePosition(delta, speedMultiplier = 1, isPlaying = true) {
    if (isPlaying && this.data.orbitalPeriod > 0) {
      const baseOrbitSpeed = 0.45;
      const orbitalSpeed = (baseOrbitSpeed / Math.sqrt(this.data.distance)) * speedMultiplier;
      this.orbitAngle += orbitalSpeed * delta;

      this.container.position.x = Math.cos(this.orbitAngle) * this.data.distance;
      this.container.position.z = Math.sin(this.orbitAngle) * this.data.distance;
    }

    if (isPlaying && this.mesh) {
      const rotSpeed = (2.0 / Math.abs(this.data.rotationPeriod || 24)) * speedMultiplier;
      this.mesh.rotation.y += rotSpeed * delta * (this.data.rotationPeriod < 0 ? -1 : 1);
    }

    // Earth Cloud subtle differential rotation
    if (isPlaying && this.cloudMesh) {
      this.cloudMesh.rotation.y += 0.08 * delta * speedMultiplier;
    }

    if (isPlaying && this.moons.length > 0) {
      this.moons.forEach(m => {
        const moonSpeed = (2.0 / Math.abs(m.data.orbitalPeriod || 28)) * speedMultiplier;
        m.angle += moonSpeed * delta * (m.data.orbitalPeriod < 0 ? -1 : 1);
        m.pivot.rotation.y = m.angle;
      });
    }
  }

  getWorldPosition() {
    const target = new THREE.Vector3();
    this.container.getWorldPosition(target);
    return target;
  }

  dispose() {
    if (this.orbitLine) {
      this.scene.remove(this.orbitLine);
    }
    this.scene.remove(this.orbitPivot);

    this.disposables.forEach(item => {
      if (item && typeof item.dispose === 'function') {
        item.dispose();
      }
    });
    this.disposables = [];
    this.moons = [];
    this.clickableMeshes = [];
  }
}
