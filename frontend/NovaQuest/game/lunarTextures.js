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
 * Grounded in Apollo and Surveyor photography:
 * - Base colour: Dusty grey
 * - Surface variation: Dark grey mare basalt patches and lighter anorthositic dust
 * - Small impact marks with subtle ejecta halos
 * - Very low reflectivity / high matte powdery regolith appearance
 */
export function createLunarRegolithTexture(width = 1024, height = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Base dusty grey lunar regolith
  ctx.fillStyle = '#484b54';
  ctx.fillRect(0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Multi-scale procedural harmonics for regolith patchiness & dust mottling
      const mareDarkPatch = Math.sin(x * 0.008) * Math.cos(y * 0.008) * 16.0;
      const anorthositeRay = Math.sin(x * 0.024 + 1.2) * Math.sin(y * 0.022 + 0.6) * 12.0;
      const fineDustMottle = Math.sin(x * 0.08) * Math.cos(y * 0.075) * 7.0;
      const regolithGranules = (Math.random() - 0.5) * 28.0;

      const baseTone = 74 + mareDarkPatch + anorthositeRay + fineDustMottle + regolithGranules;
      const clamped = Math.max(42, Math.min(115, baseTone));

      data[idx] = clamped;                     // R
      data[idx + 1] = clamped * 0.99;         // G (dusty neutral)
      data[idx + 2] = clamped * 1.01;         // B
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Micro-impact crater marks with ejecta rays & crisp rims
  const numMicroPits = 150;
  for (let i = 0; i < numMicroPits; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = 1.8 + Math.random() * 7.5;

    // Outer lighter dust halo / ejecta spray
    const halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.4);
    halo.addColorStop(0, 'rgba(165, 170, 180, 0.55)');
    halo.addColorStop(0.5, 'rgba(140, 145, 155, 0.25)');
    halo.addColorStop(1, 'rgba(140, 145, 155, 0.0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Darker bowl shadow
    const pit = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
    pit.addColorStop(0, 'rgba(20, 22, 26, 0.9)');
    pit.addColorStop(0.75, 'rgba(38, 41, 48, 0.65)');
    pit.addColorStop(1, 'rgba(150, 155, 165, 0.4)');
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
 * Fine granular surface with micro-pebble displacement for crisp shadows
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
      const grain = (Math.random() - 0.5) * 55;
      const microPebble = Math.sin(x * 0.25) * Math.cos(y * 0.25) * 18;
      const swell = Math.sin(x * 0.04) * Math.cos(y * 0.04) * 20;
      const b = Math.max(0, Math.min(255, 128 + microPebble + swell + grain));
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
 * Creates Lunar Roughness Map
 * High roughness (0.97 - 0.99) everywhere with virtually zero specular reflection
 */
export function createLunarRoughnessTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Ultra-high roughness (#f5f5f5 = 96% matte powdery regolith)
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);

  // Occasional scattered micro-impact glassy agglutinate flecks
  for (let i = 0; i < 90; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = 1 + Math.random() * 2;
    ctx.fillStyle = '#b0b0b0';
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
 * High-detail embossed kapton thermal blanket with seams, crinkles, and rivets
 */
export function createGoldFoilTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Rich warm amber gold kapton base
  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 0, width, height);

  // Irregular organic foil crinkle triangulation
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const n1 = Math.sin(x * 0.12) * Math.cos(y * 0.12);
      const n2 = Math.sin(x * 0.28 + y * 0.22) * 0.5;
      const n3 = Math.sin((x - y) * 0.35) * 0.25;
      const crinkle = (n1 + n2 + n3) * 45;

      const r = Math.max(160, Math.min(255, 217 + crinkle));
      const g = Math.max(90, Math.min(210, 140 + crinkle * 0.85));
      const b = Math.max(5, Math.min(45, 12 + crinkle * 0.15));

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Sharp thermal tape seam lines and foil attachment rivets
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
  ctx.lineWidth = 1.8;
  for (let y = 0; y < height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    // Rivet dots along seam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let rx = 16; rx < width; rx += 32) {
      ctx.beginPath();
      ctx.arc(rx, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (let x = 0; x < width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
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

/**
 * Creates High-Visibility Industrial Hazard Warning Stripes (Yellow & Black)
 */
export function createHazardStripeTexture(width = 256, height = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f59e0b'; // OSHA Hazard Amber
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#111827'; // Dark charcoal black
  const stripeWidth = 32;
  ctx.lineWidth = stripeWidth;

  for (let d = -width; d < width * 2; d += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d + width, height);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  return texture;
}

/**
 * Creates Aerospace Woven Carbon Fiber Micro-Twill Texture
 */
export function createCarbonFiberTexture(width = 256, height = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#131722';
  ctx.fillRect(0, 0, width, height);

  const twill = 8;
  for (let y = 0; y < height; y += twill) {
    for (let x = 0; x < width; x += twill) {
      const isCheck = ((x / twill) + (y / twill)) % 2 === 0;
      ctx.fillStyle = isCheck ? '#1e2433' : '#0d1017';
      ctx.fillRect(x, y, twill, twill);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeRect(x, y, twill, twill);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

/**
 * Creates High-Detail Tactical First-Person Scanner HUD Display Screen Texture
 */
/**
 * Dynamically draws the high-tech animated tactical LIDAR/radar HUD on the canvas
 */
export function updateScannerHUDCanvas(canvas, { time = 0, isScanning = false, signalStrength = 0, targetName = '', distance = 0 } = {}) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Deep cyan-black glass backdrop
  ctx.fillStyle = '#031122';
  ctx.fillRect(0, 0, width, height);

  // Grid lines
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
  ctx.lineWidth = 1;
  for (let i = 32; i < width; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
  }

  // Circular radar reticle
  const cx = width / 2;
  const cy = height / 2 + 10;
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 115, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
  ctx.beginPath();
  ctx.arc(cx, cy, 65, 0, Math.PI * 2);
  ctx.stroke();

  // Rotating Radar Sweep Needle
  const sweepAngle = time * 2.8;
  ctx.strokeStyle = isScanning ? '#22d3ee' : 'rgba(56, 189, 248, 0.7)';
  ctx.lineWidth = isScanning ? 3 : 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(sweepAngle) * 115, cy + Math.sin(sweepAngle) * 115);
  ctx.stroke();

  // Radar Sweep Gradient Arc Trail
  ctx.fillStyle = isScanning ? 'rgba(34, 211, 238, 0.18)' : 'rgba(6, 182, 212, 0.08)';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, 115, sweepAngle - 0.5, sweepAngle);
  ctx.closePath();
  ctx.fill();

  // Dynamic Oscilloscope FFT Wave
  ctx.strokeStyle = isScanning ? '#00f0ff' : '#38bdf8';
  ctx.lineWidth = isScanning ? 3 : 2;
  ctx.shadowColor = isScanning ? '#00f0ff' : '#38bdf8';
  ctx.shadowBlur = isScanning ? 10 : 4;
  ctx.beginPath();
  const freqMult = isScanning ? 0.08 : 0.045;
  const amp = isScanning ? 38 : 20 + Math.sin(time * 3) * 6;
  for (let x = 30; x < width - 30; x += 4) {
    const wave = Math.sin((x + time * 140) * freqMult) * Math.cos(x * 0.015) * amp;
    const y = cy + wave;
    if (x === 30) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Header Telemetry
  ctx.fillStyle = '#06b6d4';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('LIDAR TEL: 432.06 MHz', 32, 42);

  // Status & Target Lock readout
  ctx.font = '14px monospace';
  if (targetName) {
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`LOCK: ${targetName.slice(0, 22).toUpperCase()}`, 32, 72);
    ctx.fillStyle = '#93c5fd';
    ctx.fillText(`DIST: ${distance > 0 ? distance.toFixed(1) + 'm' : 'IN RANGE'}`, 32, 94);
  } else {
    ctx.fillStyle = '#64748b';
    ctx.fillText('STATUS: SEARCHING CARRIER...', 32, 72);
    ctx.fillText(`GRID: ${signalStrength > 0 ? signalStrength + '% LOCK' : 'SCAN READY'}`, 32, 94);
  }

  // Signal Strength Bars
  ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
  ctx.fillRect(width - 140, 32, 108, 14);
  const barWidth = Math.min(108, Math.max(8, (signalStrength / 100) * 108));
  ctx.fillStyle = isScanning ? '#22d3ee' : '#0284c7';
  ctx.fillRect(width - 140, 32, barWidth, 14);

  // Footer status
  ctx.fillStyle = isScanning ? '#22d3ee' : '#10b981';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(isScanning ? '>>> SCAN PULSE ACTIVE <<<' : 'SUIT LINK: OPTIMAL', 32, height - 28);
}

export function createScannerHUDTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  updateScannerHUDCanvas(canvas, { time: 0, isScanning: false, signalStrength: 0 });

  const texture = new THREE.CanvasTexture(canvas);
  texture.userData = { canvas };
  return texture;
}

/**
 * Creates Spacesuit Beta-Cloth Thermal Micrometeoroid Garment (TMG) Weave Texture
 */
export function createSpacesuitFabricTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#eceff4';
  ctx.fillRect(0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const weave = (Math.sin(x * 1.5) + Math.cos(y * 1.5)) * 12;
      const grain = (Math.random() - 0.5) * 15;
      const val = Math.max(180, Math.min(255, 230 + weave + grain));
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

/**
 * Creates Authentic Tangent-Space Normal Map for Crumpled MLI Thermal Blankets
 * Generates organic micro-wrinkles, triangular fold creases, and hammered foil normals
 */
export function createCrumpledFoilNormalTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const heights = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const f1 = Math.abs(Math.sin(x * 0.08) * Math.cos(y * 0.08));
      const f2 = Math.abs(Math.sin(x * 0.18 + y * 0.14) * 0.6);
      const f3 = Math.abs(Math.sin((x - y) * 0.28) * 0.35);
      const f4 = Math.abs(Math.sin((x + y) * 0.45) * 0.2);
      const wrinkle = f1 + f2 + f3 + f4;
      heights[y * width + x] = wrinkle;
    }
  }

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  const bumpStrength = 2.4;

  for (let y = 0; y < height; y++) {
    const yPrev = (y - 1 + height) % height;
    const yNext = (y + 1) % height;
    for (let x = 0; x < width; x++) {
      const xPrev = (x - 1 + width) % width;
      const xNext = (x + 1) % width;

      const idx = (y * width + x) * 4;
      const dhdx = (heights[y * width + xNext] - heights[y * width + xPrev]) * bumpStrength;
      const dhdy = (heights[yNext * width + x] - heights[yPrev * width + x]) * bumpStrength;

      let nx = -dhdx;
      let ny = -dhdy;
      let nz = 1.0;
      const len = Math.hypot(nx, ny, nz);
      nx /= len;
      ny /= len;
      nz /= len;

      data[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates Aluminized Mylar / Silver Kapton Insulation Blanket Texture
 */
export function createSilverFoilTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const n1 = Math.sin(x * 0.12) * Math.cos(y * 0.12);
      const n2 = Math.sin(x * 0.28 + y * 0.22) * 0.5;
      const crinkle = (n1 + n2) * 40;

      const v = Math.max(160, Math.min(250, 205 + crinkle));
      data[idx] = v;
      data[idx + 1] = Math.max(160, Math.min(252, v + 2));
      data[idx + 2] = Math.max(170, Math.min(255, v + 6));
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1.5;
  for (let y = 0; y < height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
    for (let rx = 16; rx < width; rx += 32) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(rx, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (let x = 0; x < width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

