/**
 * Procedural PBR Texture Generator for NovaQuest Chapter 1 (Lunar Surface)
 * Generates realistic high-resolution canvas textures in memory without external network assets:
 * - Lunar Regolith Mare Basalt Color & Bump Map (Oceanus Procellarum)
 * - Lunar Regolith Roughness Map
 * - Volcanic Basalt Rock Texture
 * - Surveyor 1 MLI Gold Insulation Crinkle Foil Texture
 * - Photovoltaic Silicon Solar Array Grid Texture
 * - Precursor Alien Obsidian & Glowing Energy Glyph Texture
 * - Rover Tread & Astronaut Bootprint Decal Texture
 */

import * as THREE from 'three';

/**
 * Creates high-detail Lunar Regolith Diffuse / Albedo Map
 */
export function createLunarRegolithTexture(width = 1024, height = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Base Lunar Mare Basalt tone (#43464f to #353840)
  ctx.fillStyle = '#3c3f47';
  ctx.fillRect(0, 0, width, height);

  // Multi-frequency noise layer
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Pseudo Perlin noise approximation using sine harmonics
      const n1 = Math.sin(x * 0.035) * Math.cos(y * 0.035);
      const n2 = Math.sin(x * 0.12 + 1.4) * Math.sin(y * 0.12 + 0.8);
      const n3 = (Math.random() - 0.5) * 35; // Fine grain regolith dust

      const val = 62 + n1 * 14 + n2 * 8 + n3;
      const clamped = Math.max(35, Math.min(105, val));

      // Titanium-rich slightly warmer/cooler tonal variation
      data[idx] = clamped;                     // R
      data[idx + 1] = clamped * 0.98;         // G (subtle cool lunar cast)
      data[idx + 2] = clamped * 1.02;         // B
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Add micro-impact crater pits with dark center & bright rim highlights
  const numMicroPits = 120;
  for (let i = 0; i < numMicroPits; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = 2 + Math.random() * 8;

    // Outer bright ejecta halo
    const halo = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 2.2);
    halo.addColorStop(0, 'rgba(150, 155, 165, 0.45)');
    halo.addColorStop(1, 'rgba(150, 155, 165, 0.0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Dark crater bowl
    const pit = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 0, cx, cy, r);
    pit.addColorStop(0, 'rgba(18, 20, 24, 0.85)');
    pit.addColorStop(0.8, 'rgba(35, 38, 44, 0.6)');
    pit.addColorStop(1, 'rgba(140, 145, 155, 0.4)');
    ctx.fillStyle = pit;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

/**
 * Creates Lunar Regolith Bump / Normal Map for low-angle solar shadows
 */
export function createLunarBumpTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const grain = (Math.random() - 0.5) * 60;
      const ripple = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 25;
      const b = Math.max(0, Math.min(255, 128 + ripple + grain));
      data[idx] = b;
      data[idx + 1] = b;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(24, 24);
  return texture;
}

/**
 * Creates Lunar Roughness Map (powdery dust with scattered glassy spherules)
 */
export function createLunarRoughnessTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#eaeaea'; // High roughness (matte regolith)
  ctx.fillRect(0, 0, width, height);

  // Scatter semi-reflective metallic chondrules / glass beads
  for (let i = 0; i < 200; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = 1 + Math.random() * 3;
    ctx.fillStyle = '#777777'; // lower roughness = glossy specular flecks
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

/**
 * Creates Fractured Volcanic Basalt Rock Texture
 */
export function createBasaltRockTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#2d2f36';
  ctx.fillRect(0, 0, width, height);

  // Mineral strata lines
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 30; i++) {
    const y = Math.random() * height;
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(75, 80, 92, 0.6)' : 'rgba(20, 22, 27, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      width * 0.3, y + (Math.random() - 0.5) * 30,
      width * 0.7, y + (Math.random() - 0.5) * 30,
      width, y
    );
    ctx.stroke();
  }

  // Micro crystalline grain
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 22;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates Surveyor 1 MLI (Multi-Layer Insulation) Gold Foil Wrinkled Texture
 */
export function createGoldFoilTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Vibrant warm amber gold base
  ctx.fillStyle = '#d97706';
  ctx.fillRect(0, 0, width, height);

  // Draw embossed foil crinkle facets
  const gridSize = 16;
  for (let y = 0; y < height; y += gridSize) {
    for (let x = 0; x < width; x += gridSize) {
      const isAlt = ((x + y) / gridSize) % 2 === 0;
      ctx.fillStyle = isAlt ? '#f59e0b' : '#b45309';
      ctx.fillRect(x, y, gridSize, gridSize);

      // Diagonal foil fold crease
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + gridSize, y + gridSize);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(120, 53, 15, 0.4)';
      ctx.beginPath();
      ctx.moveTo(x + gridSize, y);
      ctx.lineTo(x, y + gridSize);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Creates Photovoltaic Silicon Solar Array Grid Texture
 */
export function createSolarPanelTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Deep indigo space-grade monocrystalline silicon
  ctx.fillStyle = '#09101d';
  ctx.fillRect(0, 0, width, height);

  const cellsX = 8;
  const cellsY = 12;
  const pad = 3;
  const cellW = (width - (cellsX + 1) * pad) / cellsX;
  const cellH = (height - (cellsY + 1) * pad) / cellsY;

  for (let cy = 0; cy < cellsY; cy++) {
    for (let cx = 0; cx < cellsX; cx++) {
      const x = pad + cx * (cellW + pad);
      const y = pad + cy * (cellH + pad);

      // Silicon cell gradient
      const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
      grad.addColorStop(0, '#10223b');
      grad.addColorStop(0.5, '#0b1627');
      grad.addColorStop(1, '#173052');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, cellW, cellH);

      // Silver conductive busbar gridlines
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.55)';
      ctx.lineWidth = 0.8;
      for (let g = 1; g < 4; g++) {
        const lineX = x + (cellW / 4) * g;
        ctx.beginPath();
        ctx.moveTo(lineX, y);
        ctx.lineTo(lineX, y + cellH);
        ctx.stroke();
      }

      // Horizontal micro-fingers
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 0.5;
      for (let f = 1; f < 8; f++) {
        const lineY = y + (cellH / 8) * f;
        ctx.beginPath();
        ctx.moveTo(x, lineY);
        ctx.lineTo(x + cellW, lineY);
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates Alien Precursor Monolith & Chamber Rune Texture (Obsidian & Glowing Circuitry)
 */
export function createAlienGlyphTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Deep obsidian base
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, width, height);

  // Geometric precursor glyph lines (electric indigo & cyan)
  ctx.strokeStyle = '#6366f1';
  ctx.shadowColor = '#818cf8';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2.5;

  // Concentric resonant rings & angular circuit pathways
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, width * 0.35, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(width / 2, height / 2, width * 0.2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2;
  const numRadii = 8;
  for (let r = 0; r < numRadii; r++) {
    const ang = (r * Math.PI * 2) / numRadii;
    const x1 = width / 2 + Math.cos(ang) * (width * 0.18);
    const y1 = height / 2 + Math.sin(ang) * (height * 0.18);
    const x2 = width / 2 + Math.cos(ang) * (width * 0.42);
    const y2 = height / 2 + Math.sin(ang) * (height * 0.42);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Node circles
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(x2, y2, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cross geometric interconnects
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(width * 0.2, height * 0.2, width * 0.6, height * 0.6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates Rover Tread & Astronaut Bootprint Pattern Texture
 */
export function createRoverTrackTexture(width = 256, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#3c3f47';
  ctx.fillRect(0, 0, width, height);

  // Chevron tread impressions pressed into soil
  const step = 28;
  for (let y = 0; y < height; y += step) {
    // Left tire depression
    ctx.fillStyle = '#23252a';
    ctx.fillRect(width * 0.15, y, width * 0.25, step * 0.55);

    // Right tire depression
    ctx.fillRect(width * 0.6, y, width * 0.25, step * 0.55);

    // Chevron cross ribs
    ctx.strokeStyle = '#18191d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width * 0.15, y + step * 0.2);
    ctx.lineTo(width * 0.27, y + step * 0.45);
    ctx.lineTo(width * 0.4, y + step * 0.2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width * 0.6, y + step * 0.2);
    ctx.lineTo(width * 0.72, y + step * 0.45);
    ctx.lineTo(width * 0.85, y + step * 0.2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 24);
  return texture;
}

/**
 * Creates Helmet Visor Dust Smudge & Micro-Scratch Texture
 * Shimmers when facing the harsh low-angle sun
 */
export function createVisorDirtTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);

  // Micro scratches on polycarbonate
  ctx.strokeStyle = 'rgba(255, 230, 180, 0.08)';
  ctx.lineWidth = 0.75;
  for (let i = 0; i < 45; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const len = 15 + Math.random() * 40;
    const ang = Math.random() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }

  // Dust specks and thumb smudges near edges
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 0.5 + Math.random() * 2;
    ctx.fillStyle = 'rgba(250, 240, 210, 0.12)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates Soft Radial Glow Disc for Dust Motes & Energy Spores
 */
export function createGlowParticleTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.35, 'rgba(160, 220, 255, 0.75)');
  grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.25)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

