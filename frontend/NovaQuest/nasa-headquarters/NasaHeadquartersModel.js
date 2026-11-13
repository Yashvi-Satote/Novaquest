import * as THREE from 'three';
import { createSurveyor5Hologram } from './Surveyor5Hologram';
import { createNasaHeadquartersAstronaut } from './NasaHeadquartersAstronaut';
import { createNasaHeadquartersCorridor } from './NasaHeadquartersCorridor';

/**
 * NasaHeadquartersModel.js
 *
 * Medium-poly NASA Headquarters mission-control base inspired by the
 * reference art: a circular command room with a ring of curved display bays,
 * an operator deck, a glowing central dais and a holographic Surveyor 5 lander.
 *
 * The room is modelled as a full 360° interior so the camera can orbit inside
 * it. All geometry is generated procedurally (no external model download).
 */

const TAU = Math.PI * 2;
const ROOM_RADIUS = 12.5;
const ROOM_HEIGHT = 7.8;
const BAY_COUNT = 8;
const BAY_OFFSET = Math.PI / 8;
const BAY_STEP = TAU / BAY_COUNT;
const SCREEN_RADIUS = 11.85;
const SCREEN_HEIGHT = 4.32;

function polar(radius, angle, y = 0) {
  return new THREE.Vector3(Math.sin(angle) * radius, y, Math.cos(angle) * radius);
}

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function drawInterfaceBase(ctx, w, h, title, subtitle, accent) {
  const background = ctx.createLinearGradient(0, 0, 0, h);
  background.addColorStop(0, '#071b2b');
  background.addColorStop(0.55, '#03101b');
  background.addColorStop(1, '#020911');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, w, h);

  const haze = ctx.createRadialGradient(w * 0.52, h * 0.52, 0, w * 0.52, h * 0.52, w * 0.62);
  haze.addColorStop(0, 'rgba(52, 166, 232, 0.16)');
  haze.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(106, 204, 255, 0.09)';
  ctx.lineWidth = 1;
  const cell = w / 34;
  for (let x = 0; x <= w; x += cell) {
    ctx.beginPath();
    ctx.moveTo(x, h * 0.1);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = h * 0.1; y <= h; y += cell) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Faint scan lines keep the screens feeling like a live 1960s display.
  ctx.fillStyle = 'rgba(140, 225, 255, 0.025)';
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }

  ctx.fillStyle = 'rgba(3, 14, 24, 0.94)';
  ctx.fillRect(0, 0, w, h * 0.1);
  ctx.fillStyle = accent;
  ctx.fillRect(0, h * 0.1 - 2, w, 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#a9ecff';
  ctx.font = `700 ${Math.round(h * 0.036)}px "Courier New", monospace`;
  ctx.fillText(title, w * 0.024, h * 0.052);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#4c9fc6';
  ctx.font = `600 ${Math.round(h * 0.021)}px "Courier New", monospace`;
  ctx.fillText(subtitle, w * 0.976, h * 0.052);

  // Corner brackets.
  ctx.strokeStyle = 'rgba(118, 222, 255, 0.65)';
  ctx.lineWidth = 2;
  const inset = 10;
  const arm = 28;
  const corners = [
    [inset, inset, 1, 1],
    [w - inset, inset, -1, 1],
    [inset, h - inset, 1, -1],
    [w - inset, h - inset, -1, -1],
  ];
  corners.forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x + dx * arm, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * arm);
    ctx.stroke();
  });

  ctx.fillStyle = 'rgba(3, 14, 24, 0.9)';
  ctx.fillRect(0, h * 0.93, w, h * 0.07);
  ctx.strokeStyle = 'rgba(91, 184, 226, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.93);
  ctx.lineTo(w, h * 0.93);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#417e9d';
  ctx.font = `600 ${Math.round(h * 0.019)}px "Courier New", monospace`;
  ctx.fillText('DEEP SPACE NETWORK // SECURE LINK', w * 0.024, h * 0.965);
  ctx.textAlign = 'right';
  ctx.fillStyle = accent;
  ctx.fillText('SIGNAL 98.4%  •  LIVE', w * 0.976, h * 0.965);
}

function drawDataPanel(ctx, x, y, w, h, label, value, detail, accent) {
  ctx.fillStyle = 'rgba(8, 36, 55, 0.82)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(99, 202, 247, 0.52)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = accent;
  ctx.fillRect(x, y, 4, h);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(126, 206, 240, 0.68)';
  ctx.font = `600 ${Math.round(h * 0.15)}px "Courier New", monospace`;
  ctx.fillText(label, x + w * 0.07, y + h * 0.12);

  ctx.fillStyle = accent;
  ctx.font = `700 ${Math.round(h * 0.34)}px "Courier New", monospace`;
  ctx.fillText(value, x + w * 0.07, y + h * 0.34);

  ctx.fillStyle = 'rgba(143, 212, 238, 0.55)';
  ctx.font = `500 ${Math.round(h * 0.11)}px "Courier New", monospace`;
  ctx.fillText(detail, x + w * 0.07, y + h * 0.78);
}

function drawWavePanel(ctx, x, y, w, h, label, accent, phase) {
  ctx.fillStyle = 'rgba(5, 25, 40, 0.62)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(83, 186, 235, 0.34)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(137, 216, 247, 0.78)';
  ctx.font = `600 ${Math.round(h * 0.11)}px "Courier New", monospace`;
  ctx.fillText(label, x + w * 0.035, y + h * 0.08);

  for (let line = 0; line < 3; line += 1) {
    ctx.strokeStyle = 'rgba(92, 187, 230, 0.12)';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.04, y + h * (0.4 + line * 0.16));
    ctx.lineTo(x + w * 0.96, y + h * (0.4 + line * 0.16));
    ctx.stroke();
  }

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const samples = 96;
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const wave =
      Math.sin(t * 23 + phase) * 0.34 +
      Math.sin(t * 8.5 + phase * 1.7) * 0.22 +
      Math.sin(t * 47 + phase * 0.4) * 0.08;
    const px = x + w * (0.04 + t * 0.92);
    const py = y + h * (0.58 + wave * 0.52);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function drawBars(ctx, x, y, w, h, accent) {
  const values = [0.36, 0.58, 0.44, 0.82, 0.64, 0.93, 0.7, 0.52, 0.78, 0.6, 0.88, 0.48];
  const gap = w * 0.018;
  const barWidth = (w - gap * (values.length - 1)) / values.length;
  values.forEach((value, index) => {
    const barHeight = h * value;
    const barX = x + index * (barWidth + gap);
    ctx.fillStyle = 'rgba(55, 150, 197, 0.22)';
    ctx.fillRect(barX, y, barWidth, h);
    ctx.fillStyle = accent;
    ctx.fillRect(barX, y + h - barHeight, barWidth, barHeight);
  });
}

function drawGauge(ctx, cx, cy, radius, value, label, accent) {
  ctx.strokeStyle = 'rgba(88, 180, 221, 0.26)';
  ctx.lineWidth = radius * 0.11;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI * 0.75, Math.PI * 2.25);
  ctx.stroke();

  ctx.strokeStyle = accent;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * value));
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#c7f1ff';
  ctx.font = `700 ${Math.round(radius * 0.42)}px "Courier New", monospace`;
  ctx.fillText(`${Math.round(value * 100)}`, cx, cy - radius * 0.06);
  ctx.fillStyle = 'rgba(121, 204, 236, 0.7)';
  ctx.font = `600 ${Math.round(radius * 0.17)}px "Courier New", monospace`;
  ctx.fillText(label, cx, cy + radius * 0.42);
}

function drawSurveyorSchematic(ctx, cx, cy, radius, accent) {
  ctx.save();
  const s = radius;
  const px = (x) => cx + x * s;
  const py = (y) => cy + y * s;

  // Holographic bloom behind the lander.
  const bloom = ctx.createRadialGradient(cx, cy - s * 0.1, s * 0.05, cx, cy, s * 1.3);
  bloom.addColorStop(0, 'rgba(132, 232, 255, 0.24)');
  bloom.addColorStop(0.5, 'rgba(45, 150, 228, 0.12)');
  bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = bloom;
  ctx.fillRect(cx - s * 1.45, cy - s * 1.45, s * 2.9, s * 2.9);

  // Survey grid.
  ctx.strokeStyle = 'rgba(96, 202, 240, 0.13)';
  ctx.lineWidth = 1;
  for (let i = -4; i <= 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cx + i * s * 0.28, cy - s * 1.1);
    ctx.lineTo(cx + i * s * 0.28, cy + s * 1.02);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 1.1, cy + i * s * 0.28);
    ctx.lineTo(cx + s * 1.1, cy + i * s * 0.28);
    ctx.stroke();
  }

  // Lunar surface plane with survey ticks.
  ctx.strokeStyle = 'rgba(150, 230, 255, 0.5)';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([9, 7]);
  ctx.beginPath();
  ctx.ellipse(cx, py(0.82), s * 0.86, s * 0.13, 0, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  for (let i = 0; i < 19; i += 1) {
    const angle = (i * TAU) / 19;
    const innerX = Math.cos(angle) * s * 0.86;
    const innerY = Math.sin(angle) * s * 0.13;
    const outerX = Math.cos(angle) * s * (i % 5 === 0 ? 0.94 : 0.9);
    const outerY = Math.sin(angle) * s * (i % 5 === 0 ? 0.17 : 0.15);
    ctx.strokeStyle = i % 5 === 0 ? 'rgba(174, 244, 255, 0.66)' : 'rgba(103, 202, 241, 0.3)';
    ctx.lineWidth = i % 5 === 0 ? 1.8 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + innerX, py(0.82) + innerY);
    ctx.lineTo(cx + outerX, py(0.82) + outerY);
    ctx.stroke();
  }

  // Landing legs (rear leg first so it sits behind the bus).
  const drawLeg = (hipX, hipY, kneeX, kneeY, footX, footY, weight) => {
    ctx.strokeStyle = 'rgba(184, 244, 255, 0.72)';
    ctx.lineWidth = weight;
    ctx.beginPath();
    ctx.moveTo(px(hipX), py(hipY));
    ctx.lineTo(px(kneeX), py(kneeY));
    ctx.lineTo(px(footX), py(footY));
    ctx.stroke();

    ctx.strokeStyle = 'rgba(104, 214, 255, 0.5)';
    ctx.lineWidth = weight * 2.1;
    ctx.beginPath();
    ctx.moveTo(px(kneeX), py(kneeY));
    ctx.lineTo(px(footX), py(footY));
    ctx.stroke();

    ctx.fillStyle = 'rgba(211, 250, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(px(footX), py(footY) + 1.5, s * 0.085, s * 0.024, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(146, 234, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  drawLeg(0.05, 0.14, 0.24, 0.52, 0.38, 0.8, 2);
  drawLeg(-0.36, 0.02, -0.72, 0.46, -0.88, 0.79, 2.6);
  drawLeg(0.36, 0.02, 0.72, 0.46, 0.88, 0.79, 2.6);

  // Main triangular spaceframe bus.
  ctx.fillStyle = 'rgba(96, 214, 255, 0.14)';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(px(-0.32), py(-0.2));
  ctx.lineTo(px(0.32), py(-0.2));
  ctx.lineTo(px(0.42), py(0.22));
  ctx.lineTo(px(-0.42), py(0.22));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(158, 236, 255, 0.55)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(px(-0.32), py(-0.2));
  ctx.lineTo(px(0.42), py(0.22));
  ctx.moveTo(px(0.32), py(-0.2));
  ctx.lineTo(px(-0.42), py(0.22));
  ctx.stroke();

  // Solar array panel.
  const panelTop = -0.38;
  const panelBottom = -0.24;
  ctx.fillStyle = 'rgba(76, 168, 255, 0.18)';
  ctx.strokeStyle = 'rgba(198, 247, 255, 0.86)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.rect(px(-0.66), py(panelTop), s * 1.32, s * (panelBottom - panelTop));
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(126, 220, 255, 0.4)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(px(-0.66 + i * 0.33), py(panelTop));
    ctx.lineTo(px(-0.66 + i * 0.33), py(panelBottom));
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(px(-0.66), py((panelTop + panelBottom) / 2));
  ctx.lineTo(px(0.66), py((panelTop + panelBottom) / 2));
  ctx.stroke();

  // Main retro engine bell.
  ctx.fillStyle = 'rgba(104, 214, 255, 0.16)';
  ctx.strokeStyle = 'rgba(174, 244, 255, 0.8)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(px(-0.11), py(0.22));
  ctx.lineTo(px(0.11), py(0.22));
  ctx.lineTo(px(0.2), py(0.46));
  ctx.lineTo(px(-0.2), py(0.46));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Planar high-gain antenna.
  ctx.save();
  ctx.translate(px(-0.62), py(-0.5));
  ctx.rotate(-0.42);
  ctx.fillStyle = 'rgba(150, 236, 255, 0.18)';
  ctx.strokeStyle = 'rgba(214, 250, 255, 0.85)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.rect(-s * 0.2, -s * 0.16, s * 0.4, s * 0.32);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 0.2, 0);
  ctx.lineTo(s * 0.2, 0);
  ctx.moveTo(0, -s * 0.16);
  ctx.lineTo(0, s * 0.16);
  ctx.strokeStyle = 'rgba(126, 220, 255, 0.45)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 213, 145, 0.85)';
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.026, 0, TAU);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(174, 244, 255, 0.6)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(px(-0.3), py(-0.28));
  ctx.lineTo(px(-0.55), py(-0.44));
  ctx.stroke();

  // TV camera mast and rotatable turret.
  ctx.strokeStyle = 'rgba(214, 250, 255, 0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px(0.26), py(-0.18));
  ctx.lineTo(px(0.26), py(-0.72));
  ctx.stroke();
  ctx.strokeStyle = 'rgba(126, 220, 255, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(px(0.14), py(-0.19));
  ctx.lineTo(px(0.26), py(-0.5));
  ctx.stroke();

  ctx.fillStyle = 'rgba(150, 236, 255, 0.2)';
  ctx.strokeStyle = 'rgba(222, 251, 255, 0.9)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.rect(px(0.18), py(-0.86), s * 0.17, s * 0.14);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(px(0.35), py(-0.82));
  ctx.lineTo(px(0.43), py(-0.8));
  ctx.lineTo(px(0.43), py(-0.76));
  ctx.lineTo(px(0.35), py(-0.74));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.beginPath();
  ctx.arc(px(0.41), py(-0.78), s * 0.016, 0, TAU);
  ctx.fill();

  // Alpha-scattering surface instrument and tether.
  ctx.strokeStyle = 'rgba(255, 208, 138, 0.6)';
  ctx.lineWidth = 1.3;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(px(0.3), py(0.2));
  ctx.bezierCurveTo(px(0.52), py(0.34), px(0.66), py(0.55), px(0.72), py(0.72));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255, 208, 138, 0.24)';
  ctx.strokeStyle = 'rgba(255, 218, 160, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(px(0.66), py(0.7), s * 0.13, s * 0.1);
  ctx.fill();
  ctx.stroke();

  // Bright hologram nodes.
  [
    [0, -0.24],
    [0.26, -0.78],
    [-0.62, -0.5],
    [0.72, 0.74],
  ].forEach(([nx, ny]) => {
    ctx.fillStyle = 'rgba(235, 253, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(px(nx), py(ny), s * 0.014, 0, TAU);
    ctx.fill();
  });

  // Callout labels.
  ctx.font = `600 ${Math.round(s * 0.072)}px "Courier New", monospace`;
  ctx.fillStyle = 'rgba(174, 240, 255, 0.82)';
  ctx.textBaseline = 'middle';

  const callout = (label, tx, ty, lx, ly, align) => {
    ctx.strokeStyle = 'rgba(122, 224, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(lx, ly);
    ctx.stroke();
    ctx.textAlign = align;
    ctx.fillText(label, lx + (align === 'right' ? -s * 0.03 : s * 0.03), ly);
  };

  callout('PLANAR ANTENNA', px(-0.75), py(-0.6), px(-1.0), py(-0.72), 'right');
  callout('SOLAR ARRAY', px(0.4), py(-0.32), px(0.78), py(-0.44), 'left');
  callout('TV CAMERA', px(0.26), py(-0.82), px(0.62), py(-1.0), 'left');
  callout('SHOCK LEG', px(-0.8), py(0.62), px(-1.0), py(0.76), 'right');
  callout('ALPHA SCATTER', px(0.72), py(0.74), px(0.92), py(0.6), 'left');

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(139, 218, 247, 0.7)';
  ctx.font = `600 ${Math.round(s * 0.062)}px "Courier New", monospace`;
  ctx.fillText('SURVEYOR 5 / SPACECRAFT SCHEMATIC / SCALE 1:24', cx - s * 0.98, py(0.98));

  ctx.restore();
}

function drawLunarMap(ctx, x, y, w, h, accent) {
  ctx.fillStyle = 'rgba(3, 19, 31, 0.78)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(92, 189, 232, 0.38)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  ctx.strokeStyle = 'rgba(84, 178, 216, 0.16)';
  for (let i = 1; i < 10; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + (w * i) / 10, y);
    ctx.lineTo(x + (w * i) / 10, y + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + (h * i) / 10);
    ctx.lineTo(x + w, y + (h * i) / 10);
    ctx.stroke();
  }

  const craters = [
    [0.18, 0.28, 0.055],
    [0.31, 0.62, 0.09],
    [0.72, 0.24, 0.07],
    [0.83, 0.7, 0.05],
    [0.55, 0.48, 0.12],
    [0.42, 0.18, 0.038],
    [0.66, 0.82, 0.045],
    [0.12, 0.78, 0.035],
  ];
  craters.forEach(([cx, cy, radius]) => {
    ctx.strokeStyle = 'rgba(139, 220, 249, 0.4)';
    ctx.beginPath();
    ctx.arc(x + cx * w, y + cy * h, radius * w, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = 'rgba(99, 189, 226, 0.08)';
    ctx.fill();
  });

  const targetX = x + w * 0.5;
  const targetY = y + h * 0.52;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  [0.045, 0.085, 0.13].forEach((ratio) => {
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(targetX, targetY, ratio * w, 0, TAU);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(targetX - w * 0.18, targetY);
  ctx.lineTo(targetX + w * 0.18, targetY);
  ctx.moveTo(targetX, targetY - w * 0.18);
  ctx.lineTo(targetX, targetY + w * 0.18);
  ctx.stroke();

  ctx.fillStyle = '#d9f8ff';
  ctx.beginPath();
  ctx.arc(targetX, targetY, 4, 0, TAU);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(139, 218, 247, 0.8)';
  ctx.font = `600 ${Math.round(h * 0.05)}px "Courier New", monospace`;
  ctx.fillText('MARE TRANQUILLITATIS // LANDING ZONE 5', x + w * 0.03, y + h * 0.04);
}

function createScreenTexture(variant) {
  const width = 1400;
  const height = 540;
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const accents = ['#8be8ff', '#73d7ff', '#64b5ff'];
  const accent = accents[variant % accents.length];
  const titles = [
    'NASA // LUNAR MISSION CONTROL',
    'NASA // SURFACE RECONNAISSANCE',
    'NASA // FLIGHT TELEMETRY',
  ];
  const subtitles = [
    'SURVEYOR 5 • LUNAR LINK',
    'SURVEYOR 5 • TARGET LOCK',
    'REAL-TIME • 1967',
  ];

  drawInterfaceBase(ctx, width, height, titles[variant], subtitles[variant], accent);

  const top = height * 0.15;
  const contentHeight = height * 0.71;

  if (variant === 0) {
    const radius = height * 0.285;

    drawSurveyorSchematic(ctx, width * 0.5, height * 0.52, radius, accent);

    ctx.strokeStyle = 'rgba(122, 224, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.53, radius * 1.42, radius * 0.8, -0.06, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);

    const panelW = width * 0.2;
    const panelH = contentHeight * 0.34;
    drawDataPanel(ctx, width * 0.03, top, panelW, panelH, 'TOUCHDOWN SITE', 'MARE TRANQ.', 'LANDING ZONE 5', accent);
    drawDataPanel(
      ctx,
      width * 0.03,
      top + panelH + height * 0.035,
      panelW,
      panelH,
      'SURFACE GRAVITY',
      '1.62 m/s²',
      'SURVEYOR 5 • SITE 5',
      accent,
    );
    drawDataPanel(
      ctx,
      width * 0.77,
      top,
      panelW,
      panelH,
      'SOLAR ARRAY',
      '112 W',
      'SUN ANGLE 34°',
      accent,
    );
    drawDataPanel(
      ctx,
      width * 0.77,
      top + panelH + height * 0.035,
      panelW,
      panelH,
      'MISSION CLOCK',
      'T+ 031:14',
      'ACQUISITION CONFIRMED',
      accent,
    );

    const stripY = height * 0.86;
    const stripW = width * 0.17;
    drawDataPanel(ctx, width * 0.31, stripY, stripW, height * 0.06, 'LAT', '00.67° N', '', accent);
    drawDataPanel(ctx, width * 0.52, stripY, stripW, height * 0.06, 'LONG', '23.47° E', '', accent);
  } else if (variant === 1) {
    drawLunarMap(ctx, width * 0.03, top, width * 0.62, contentHeight, accent);

    const panelW = width * 0.3;
    const panelH = contentHeight * 0.235;
    drawDataPanel(ctx, width * 0.68, top, panelW, panelH, 'DESCENT RATE', '2.4 m/s', 'TERMINAL PHASE', accent);
    drawDataPanel(
      ctx,
      width * 0.68,
      top + panelH + height * 0.026,
      panelW,
      panelH,
      'SOIL BEARING',
      '10.8 kPa',
      'APOLLO CERTIFIED',
      accent,
    );
    drawDataPanel(
      ctx,
      width * 0.68,
      top + (panelH + height * 0.026) * 2,
      panelW,
      panelH,
      'ALPHA SCATTER',
      'ACTIVE',
      'CURIUM-242 SOURCE',
      accent,
    );

    const barsY = top + contentHeight - height * 0.09;
    drawBars(ctx, width * 0.68, barsY, panelW, height * 0.09, accent);
  } else {
    drawWavePanel(ctx, width * 0.03, top, width * 0.53, contentHeight * 0.31, 'ASCENT VELOCITY / M·S⁻¹', accent, 0.5);
    drawWavePanel(
      ctx,
      width * 0.03,
      top + contentHeight * 0.35,
      width * 0.53,
      contentHeight * 0.31,
      'ATTITUDE RATE / DEG·S⁻¹',
      '#7ddcff',
      2.2,
    );
    drawWavePanel(
      ctx,
      width * 0.03,
      top + contentHeight * 0.7,
      width * 0.53,
      contentHeight * 0.25,
      'RADAR RETURN / DB',
      '#9be9ff',
      4.4,
    );

    drawGauge(ctx, width * 0.69, top + contentHeight * 0.22, height * 0.13, 0.98, 'LINK', accent);
    drawGauge(ctx, width * 0.86, top + contentHeight * 0.22, height * 0.13, 0.76, 'POWER', '#7dd6ff');

    const rows = [
      ['PROPELLANT', '74.2%'],
      ['BATTERY BUS', '28.4 V'],
      ['GYRO DRIFT', '0.002°'],
      ['COMMAND LOCK', 'ENGAGED'],
    ];
    const rowY = top + contentHeight * 0.52;
    rows.forEach(([label, value], index) => {
      const y = rowY + index * height * 0.07;
      ctx.fillStyle = index % 2 === 0 ? 'rgba(7, 30, 46, 0.65)' : 'rgba(7, 30, 46, 0.32)';
      ctx.fillRect(width * 0.61, y, width * 0.36, height * 0.052);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(131, 207, 235, 0.7)';
      ctx.font = `600 ${Math.round(height * 0.021)}px "Courier New", monospace`;
      ctx.fillText(label, width * 0.625, y + height * 0.026);
      ctx.textAlign = 'right';
      ctx.fillStyle = accent;
      ctx.fillText(value, width * 0.953, y + height * 0.026);
    });

    drawBars(ctx, width * 0.61, top + contentHeight * 0.83, width * 0.36, height * 0.09, accent);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createConsoleTexture() {
  const width = 640;
  const height = 360;
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const accent = '#86e4ff';
  drawInterfaceBase(ctx, width, height, 'OPERATOR CONSOLE // 07', 'NASA HQ • LIVE', accent);

  drawWavePanel(ctx, width * 0.04, height * 0.17, width * 0.55, height * 0.42, 'COMMAND RETURN', accent, 1.1);

  const rows = [
    ['GUIDANCE', 'LOCKED'],
    ['TELEMETRY', 'NOMINAL'],
    ['RANGING', '31.8K KM'],
  ];
  rows.forEach(([label, value], index) => {
    const y = height * (0.19 + index * 0.14);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(129, 206, 234, 0.68)';
    ctx.font = `600 ${Math.round(height * 0.035)}px "Courier New", monospace`;
    ctx.fillText(label, width * 0.64, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = accent;
    ctx.fillText(value, width * 0.96, y);
    ctx.strokeStyle = 'rgba(89, 183, 226, 0.24)';
    ctx.beginPath();
    ctx.moveTo(width * 0.63, y + height * 0.055);
    ctx.lineTo(width * 0.96, y + height * 0.055);
    ctx.stroke();
  });

  drawBars(ctx, width * 0.04, height * 0.68, width * 0.55, height * 0.18, accent);
  drawGauge(ctx, width * 0.82, height * 0.74, height * 0.11, 0.88, 'SIGNAL', accent);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createGlowTexture() {
  const size = 256;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(190, 244, 255, 0.95)');
  gradient.addColorStop(0.22, 'rgba(95, 210, 255, 0.55)');
  gradient.addColorStop(0.55, 'rgba(36, 143, 255, 0.18)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createShadowTexture() {
  const size = 128;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  gradient.addColorStop(0.55, 'rgba(0, 0, 0, 0.35)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Creates the complete NASA Headquarters base.
 * @returns {{ root: THREE.Group, update: (delta: number, elapsed: number) => void, dispose: () => void }}
 */
export function createNasaHeadquarters() {
  const root = new THREE.Group();
  root.name = 'NasaHeadquartersBase';
  const character = createNasaHeadquartersAstronaut();
  character.position.set(6, 0, -1.5);
  character.rotation.y = -0.45;
  root.add(character);

  const textures = [];
  const dynamic = {
    surveyor: null,
    hologram: null,
    glowRings: [],
    screenLights: [],
    dust: null,
    doorPanels: [],
    doorOpenAmount: 0,
    doorTarget: 0,
  };

  const screenTextures = [0, 1, 2].map((variant) => {
    const texture = createScreenTexture(variant);
    textures.push(texture);
    return texture;
  });
  const screenMaterials = screenTextures.map(
    (map) => new THREE.MeshBasicMaterial({ map, toneMapped: false }),
  );

  const consoleTexture = createConsoleTexture();
  const glowTexture = createGlowTexture();
  const shadowTexture = createShadowTexture();
  textures.push(consoleTexture, glowTexture, shadowTexture);

  // ---------------------------------------------------------------- materials
  const materials = {
    floor: new THREE.MeshStandardMaterial({ color: 0x050b13, roughness: 0.28, metalness: 0.72 }),
    platform: new THREE.MeshStandardMaterial({ color: 0x0a1623, roughness: 0.38, metalness: 0.55 }),
    wall: new THREE.MeshStandardMaterial({
      color: 0x121b27,
      roughness: 0.92,
      metalness: 0.1,
      side: THREE.BackSide,
    }),
    wallBand: new THREE.MeshStandardMaterial({
      color: 0x1c2a3a,
      roughness: 0.46,
      metalness: 0.38,
      side: THREE.BackSide,
    }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0x0e1722, roughness: 0.86, metalness: 0.18 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x111c28, roughness: 0.42, metalness: 0.58 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x182432, roughness: 0.4, metalness: 0.55 }),
    desk: new THREE.MeshStandardMaterial({ color: 0x1a2736, roughness: 0.48, metalness: 0.38 }),
    deskTop: new THREE.MeshStandardMaterial({ color: 0x9aabbc, roughness: 0.52, metalness: 0.32 }),
    white: new THREE.MeshStandardMaterial({ color: 0xc4d2de, roughness: 0.5, metalness: 0.22 }),
    doorFrame: new THREE.MeshStandardMaterial({ color: 0xc3d0d5, roughness: 0.46, metalness: 0.34 }),
    doorArmor: new THREE.MeshStandardMaterial({ color: 0x8fa4af, roughness: 0.4, metalness: 0.5 }),
    doorShell: new THREE.MeshStandardMaterial({ color: 0x596a74, roughness: 0.42, metalness: 0.52 }),
    doorInset: new THREE.MeshStandardMaterial({ color: 0x455863, roughness: 0.52, metalness: 0.45 }),
    doorEdge: new THREE.MeshStandardMaterial({ color: 0x233440, roughness: 0.48, metalness: 0.58 }),
    chair: new THREE.MeshStandardMaterial({ color: 0x111923, roughness: 0.72, metalness: 0.24 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x05090e, roughness: 0.95 }),
    cyan: new THREE.MeshBasicMaterial({
      color: 0x79e5ff,
      transparent: true,
      opacity: 0.78,
      toneMapped: false,
    }),
    cyanSoft: new THREE.MeshBasicMaterial({
      color: 0x54c9ff,
      transparent: true,
      opacity: 0.32,
      toneMapped: false,
      depthWrite: false,
    }),
    blueSoft: new THREE.MeshBasicMaterial({
      color: 0x2f7fff,
      transparent: true,
      opacity: 0.22,
      toneMapped: false,
      depthWrite: false,
    }),
    whiteGlow: new THREE.MeshBasicMaterial({
      color: 0xd5ecff,
      transparent: true,
      opacity: 0.85,
      toneMapped: false,
    }),
    ceilingGlow: new THREE.MeshStandardMaterial({
      color: 0x38506a,
      emissive: 0xbfe6ff,
      emissiveIntensity: 1.55,
      roughness: 0.6,
    }),
    shadow: new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      color: 0x000000,
    }),
    dust: new THREE.PointsMaterial({
      color: 0xa6dcff,
      size: 0.024,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
    holoGlow: new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0x78d9ff,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
    holoBeam: new THREE.MeshBasicMaterial({
      color: 0x4fc9ff,
      transparent: true,
      opacity: 0.055,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  };

  const addShadow = (radius, x = 0, z = 0, opacity = 0.52) => {
    const geometry = new THREE.PlaneGeometry(radius * 2, radius * 2);
    const material = materials.shadow.clone();
    material.opacity = opacity;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.015, z);
    root.add(mesh);
    return mesh;
  };

  // ------------------------------------------------------------------- shell
  const floor = new THREE.Mesh(new THREE.CircleGeometry(ROOM_RADIUS + 0.08, 96), materials.floor);
  floor.rotation.x = -Math.PI / 2;
  root.add(floor);

  const doorwayHalfAngle = 0.24;
  const wallRadius = ROOM_RADIUS + 0.05;
  const doorAngle = Math.PI + Math.PI / 8;
  const corridor = createNasaHeadquartersCorridor();
  corridor.root.position.copy(polar(wallRadius, doorAngle));
  corridor.root.rotation.y = doorAngle;
  root.add(corridor.root);
  const doorwayWallAngle = doorAngle;
  const doorwayStart = doorwayWallAngle - doorwayHalfAngle;
  const doorwayEnd = doorwayWallAngle + doorwayHalfAngle;
  const wallSegments = [
    [0, doorwayStart],
    [doorwayEnd, TAU - doorwayEnd],
  ];
  wallSegments.forEach(([thetaStart, thetaLength]) => {
    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(
        wallRadius,
        wallRadius,
        ROOM_HEIGHT,
        Math.max(4, Math.round((96 * thetaLength) / TAU)),
        1,
        true,
        thetaStart,
        thetaLength,
      ),
      materials.wall,
    );
    wall.position.y = ROOM_HEIGHT / 2;
    root.add(wall);
  });

  const ceiling = new THREE.Mesh(new THREE.CircleGeometry(ROOM_RADIUS + 0.05, 96), materials.ceiling);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM_HEIGHT;
  root.add(ceiling);

  // Concentric floor inlays.
  [4.42, 6.4, 8.9, 11.2].forEach((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius, radius + (index === 0 ? 0.05 : 0.028), 128),
      index === 0 ? materials.cyanSoft : materials.blueSoft,
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.008;
    root.add(ring);
  });

  // 16 subtle radial floor seams.
  for (let i = 0; i < 16; i += 1) {
    const seam = new THREE.Mesh(new THREE.PlaneGeometry(0.018, 9.8), materials.blueSoft);
    seam.rotation.x = -Math.PI / 2;
    seam.rotation.z = (i * TAU) / 16;
    seam.position.y = 0.006;
    root.add(seam);
  }

  // Central dais.
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(4.35, 4.5, 0.2, 72), materials.platform);
  platform.position.y = 0.1;
  root.add(platform);

  const platformEdge = new THREE.Mesh(
    new THREE.TorusGeometry(4.42, 0.028, 8, 128),
    materials.cyan,
  );
  platformEdge.rotation.x = Math.PI / 2;
  platformEdge.position.y = 0.205;
  root.add(platformEdge);

  const innerDais = new THREE.Mesh(
    new THREE.CylinderGeometry(2.95, 3.05, 0.12, 56),
    new THREE.MeshStandardMaterial({ color: 0x0d1c2b, roughness: 0.34, metalness: 0.6 }),
  );
  innerDais.position.y = 0.24;
  root.add(innerDais);

  const innerDaisRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.98, 0.02, 8, 96),
    materials.blueSoft,
  );
  innerDaisRing.rotation.x = Math.PI / 2;
  innerDaisRing.position.y = 0.305;
  root.add(innerDaisRing);

  const daisShadow = new THREE.Mesh(
    new THREE.CircleGeometry(4.75, 72),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.36,
      color: 0x000000,
      depthWrite: false,
    }),
  );
  daisShadow.rotation.x = -Math.PI / 2;
  daisShadow.position.y = 0.004;
  root.add(daisShadow);

  // ------------------------------------------------------------- wall hardware
  wallSegments.forEach(([thetaStart, thetaLength]) => {
    const lowerBand = new THREE.Mesh(
      new THREE.CylinderGeometry(
        ROOM_RADIUS - 0.08,
        ROOM_RADIUS - 0.08,
        1.25,
        Math.max(4, Math.round((96 * thetaLength) / TAU)),
        1,
        true,
        thetaStart,
        thetaLength,
      ),
      materials.wallBand,
    );
    lowerBand.position.y = 1.46;
    root.add(lowerBand);
  });

  const addWallTrim = (radius, thickness, y) => {
    const trim = new THREE.Mesh(
      new THREE.TorusGeometry(radius, thickness, 8, 160, TAU - doorwayHalfAngle * 2),
      materials.cyanSoft,
    );
    trim.rotation.set(Math.PI / 2, 0, Math.PI / 2 - doorwayStart);
    trim.position.y = y;
    root.add(trim);
  };
  addWallTrim(ROOM_RADIUS - 0.12, 0.024, 2.09);
  addWallTrim(ROOM_RADIUS - 0.15, 0.028, 0.06);

  // The airlock replaces a wall bay with a faceted, pressure-sealed portal.
  const doorFrameShape = new THREE.Shape();
  doorFrameShape.moveTo(-2.5, 0);
  doorFrameShape.lineTo(2.5, 0);
  doorFrameShape.lineTo(2.5, 5.25);
  doorFrameShape.lineTo(2.16, 5.55);
  doorFrameShape.lineTo(2.16, 5.93);
  doorFrameShape.lineTo(1.72, 6.36);
  doorFrameShape.lineTo(-1.72, 6.36);
  doorFrameShape.lineTo(-2.16, 5.93);
  doorFrameShape.lineTo(-2.16, 5.55);
  doorFrameShape.lineTo(-2.5, 5.25);
  doorFrameShape.closePath();

  const doorOpening = new THREE.Path();
  doorOpening.moveTo(-1.56, 0.3);
  doorOpening.lineTo(1.56, 0.3);
  doorOpening.lineTo(1.82, 0.58);
  doorOpening.lineTo(1.82, 5.02);
  doorOpening.lineTo(1.52, 5.32);
  doorOpening.lineTo(-1.52, 5.32);
  doorOpening.lineTo(-1.82, 5.02);
  doorOpening.lineTo(-1.82, 0.58);
  doorOpening.closePath();
  doorFrameShape.holes.push(doorOpening);

  const doorInnerRimShape = new THREE.Shape();
  doorInnerRimShape.moveTo(-1.68, 0.18);
  doorInnerRimShape.lineTo(1.68, 0.18);
  doorInnerRimShape.lineTo(2.0, 0.52);
  doorInnerRimShape.lineTo(2.0, 5.1);
  doorInnerRimShape.lineTo(1.62, 5.5);
  doorInnerRimShape.lineTo(-1.62, 5.5);
  doorInnerRimShape.lineTo(-2.0, 5.1);
  doorInnerRimShape.lineTo(-2.0, 0.52);
  doorInnerRimShape.closePath();
  doorInnerRimShape.holes.push(doorOpening.clone());

  const doorArmorShape = new THREE.Shape();
  doorArmorShape.moveTo(-2.35, 0.08);
  doorArmorShape.lineTo(2.35, 0.08);
  doorArmorShape.lineTo(2.35, 5.18);
  doorArmorShape.lineTo(2.02, 5.5);
  doorArmorShape.lineTo(2.02, 5.84);
  doorArmorShape.lineTo(1.64, 6.2);
  doorArmorShape.lineTo(-1.64, 6.2);
  doorArmorShape.lineTo(-2.02, 5.84);
  doorArmorShape.lineTo(-2.02, 5.5);
  doorArmorShape.lineTo(-2.35, 5.18);
  doorArmorShape.closePath();

  const armorOpening = new THREE.Path();
  armorOpening.moveTo(-1.72, 0.25);
  armorOpening.lineTo(1.72, 0.25);
  armorOpening.lineTo(1.94, 0.49);
  armorOpening.lineTo(1.94, 5.08);
  armorOpening.lineTo(1.56, 5.46);
  armorOpening.lineTo(-1.56, 5.46);
  armorOpening.lineTo(-1.94, 5.08);
  armorOpening.lineTo(-1.94, 0.49);
  armorOpening.closePath();
  doorArmorShape.holes.push(armorOpening);

  const doorFrame = new THREE.Mesh(
    new THREE.ExtrudeGeometry(doorFrameShape, {
      depth: 0.46,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.075,
      bevelThickness: 0.08,
    }),
    materials.doorFrame,
  );
  doorFrame.position.set(0, 0.08, -0.46);
  const doorArmor = new THREE.Mesh(
    new THREE.ExtrudeGeometry(doorArmorShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelSize: 0.035,
      bevelThickness: 0.035,
    }),
    materials.doorArmor,
  );
  doorArmor.position.set(0, 0.06, -0.67);
  const doorInnerRim = new THREE.Mesh(
    new THREE.ExtrudeGeometry(doorInnerRimShape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelSize: 0.035,
      bevelThickness: 0.025,
    }),
    materials.doorEdge,
  );
  doorInnerRim.position.set(0, 0, -0.79);
  const airlock = new THREE.Group();
  airlock.userData.noCollision = true;
  airlock.position.copy(polar(wallRadius, doorAngle));
  airlock.rotation.y = doorAngle;
  root.add(airlock);
  airlock.add(doorFrame);
  airlock.add(doorArmor);
  airlock.add(doorInnerRim);

  const doorHitTarget = new THREE.Mesh(
    new THREE.PlaneGeometry(4.05, 5.45),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      colorWrite: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  doorHitTarget.position.set(0, 2.85, -0.86);
  airlock.add(doorHitTarget);

  const doorHardware = new THREE.Group();
  doorHardware.position.z = -0.62;
  airlock.add(doorHardware);

  const addDoorBox = (width, height, depth, material, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    doorHardware.add(mesh);
    return mesh;
  };

  addDoorBox(3.46, 0.19, 0.18, materials.doorEdge, 0, 6.02, 0.015);
  [-1.52, -0.51, 0.51, 1.52].forEach((x, index) => {
    const cap = addDoorBox(0.96, 0.26, 0.2, materials.doorFrame, x, 6.12, -0.18);
    cap.rotation.z = index % 2 === 0 ? -0.035 : 0.035;
    addDoorBox(0.72, 0.035, 0.035, materials.doorArmor, x, 6.27, -0.22);
  });

  [-2.13, 2.13].forEach((x) => {
    addDoorBox(0.34, 4.68, 0.22, materials.doorEdge, x, 2.85, -0.21);
    addDoorBox(0.23, 4.32, 0.16, materials.doorFrame, x, 2.85, -0.27);
    addDoorBox(0.055, 3.74, 0.035, materials.doorArmor, x, 2.86, -0.37);
    addDoorBox(0.52, 0.18, 0.28, materials.doorFrame, x, 0.14, -0.24);
    addDoorBox(0.52, 0.18, 0.28, materials.doorFrame, x, 5.61, -0.24);
  });

  // The left jamb carries a recessed maintenance panel and cooling grille.
  addDoorBox(0.57, 0.88, 0.22, materials.doorArmor, -2.35, 2.54, -0.28);
  addDoorBox(0.43, 0.47, 0.055, materials.doorEdge, -2.35, 2.59, -0.42);
  for (let slot = 0; slot < 6; slot += 1) {
    addDoorBox(0.025, 0.36, 0.025, materials.doorArmor, -2.53 + slot * 0.072, 2.59, -0.47);
  }
  addDoorBox(0.25, 0.15, 0.06, materials.cyanSoft, -2.35, 2.93, -0.47);
  addDoorBox(0.15, 0.65, 0.1, materials.doorEdge, 2.35, 1.08, -0.3);
  addDoorBox(0.085, 0.42, 0.04, materials.cyan, 2.35, 1.08, -0.37);

  [-1.92, 1.92].forEach((x) => {
    [4.58, 4.92].forEach((y, index) => {
      const lock = new THREE.Mesh(
        new THREE.CylinderGeometry(index === 0 ? 0.085 : 0.105, index === 0 ? 0.085 : 0.105, 0.075, 10),
        materials.doorEdge,
      );
      lock.rotation.x = Math.PI / 2;
      lock.position.set(x, y, -0.29);
      doorHardware.add(lock);
      const core = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.038, 0.08, 8),
        index === 0 ? materials.cyan : materials.doorArmor,
      );
      core.rotation.x = Math.PI / 2;
      core.position.set(x, y, -0.34);
      doorHardware.add(core);
    });
  });

  addDoorBox(3.08, 0.09, 0.12, materials.whiteGlow, 0, 5.17, -0.24);
  addDoorBox(2.84, 0.075, 0.16, materials.cyan, 0, 5.17, -0.32);
  [-1.56, 1.56].forEach((x) => {
    addDoorBox(0.12, 0.075, 0.12, materials.doorEdge, x, 5.35, -0.3);
    addDoorBox(0.06, 0.09, 0.055, materials.cyan, x, 5.35, -0.38);
  });

  const doorPanelMaterial = materials.doorShell;
  [-1, 1].forEach((side) => {
    const panel = new THREE.Group();
    panel.userData.noCollision = true;
    panel.position.set(side * 0.91, 2.85, 0.02);
    doorHardware.add(panel);
    dynamic.doorPanels.push({ panel, side });

    const panelShell = new THREE.Mesh(
      new THREE.BoxGeometry(1.84, 4.76, 0.17),
      doorPanelMaterial,
    );
    panel.add(panelShell);

    const inset = new THREE.Mesh(
      new THREE.BoxGeometry(1.56, 4.42, 0.045),
      materials.doorInset,
    );
    inset.position.set(0, -0.02, -0.105);
    panel.add(inset);

    [-0.69, 0.69].forEach((x) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 4.18, 0.035),
        materials.doorEdge,
      );
      rail.position.set(x, 0, -0.14);
      panel.add(rail);

      const highlight = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, 3.88, 0.02),
        materials.doorArmor,
      );
      highlight.position.set(x + (x < 0 ? 0.04 : -0.04), 0, -0.17);
      panel.add(highlight);
    });

    [-1.74, 1.74].forEach((y) => {
      const joint = new THREE.Mesh(
        new THREE.BoxGeometry(1.46, 0.055, 0.045),
        materials.doorEdge,
      );
      joint.position.set(0, y, -0.14);
      panel.add(joint);
      const jointLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.84, 0.018, 0.025),
        materials.doorArmor,
      );
      jointLight.position.set(0, y + (y < 0 ? 0.055 : -0.055), -0.17);
      panel.add(jointLight);
    });

    const centerRidge = new THREE.Mesh(
      new THREE.BoxGeometry(0.075, 3.92, 0.075),
      materials.doorArmor,
    );
    centerRidge.position.set(side < 0 ? 0.78 : -0.78, 0, -0.18);
    panel.add(centerRidge);

    const panelRidge = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 3.5, 0.06),
      materials.doorShell,
    );
    panelRidge.position.set(side < 0 ? -0.25 : 0.25, 0, -0.15);
    panel.add(panelRidge);
  });

  const threshold = new THREE.Mesh(
    new THREE.BoxGeometry(4.45, 0.12, 0.95),
    materials.darkMetal,
  );
  threshold.position.set(0, 0.06, -0.95);
  airlock.add(threshold);

  [-1.72, 1.72].forEach((x) => {
    const thresholdGuide = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.02, 0.82),
      materials.cyan,
    );
    thresholdGuide.position.set(x, 0.13, -0.95);
    airlock.add(thresholdGuide);
  });

  // Small wall devices between display bays.
  for (let i = 0; i < 16; i += 1) {
    const angle = (i * TAU) / 16;
    if (i === 9) continue;
    const device = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.32, 0.16),
      i % 3 === 0 ? materials.darkMetal : materials.frame,
    );
    device.position.copy(polar(ROOM_RADIUS - 0.2, angle, 2.4));
    device.lookAt(0, 2.4, 0);
    root.add(device);

    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 8, 6),
      i % 4 === 0 ? new THREE.MeshBasicMaterial({ color: 0xff7b57 }) : materials.cyan,
    );
    led.position.copy(polar(ROOM_RADIUS - 0.31, angle, 2.47));
    root.add(led);
  }

  // Structural columns at every bay boundary.
  for (let i = 0; i < BAY_COUNT; i += 1) {
    const angle = i * BAY_STEP;
    const column = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, ROOM_HEIGHT, 0.6),
      materials.frame,
    );
    column.position.copy(polar(ROOM_RADIUS - 0.24, angle, ROOM_HEIGHT / 2));
    column.rotation.y = angle;
    root.add(column);

    const columnLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, ROOM_HEIGHT - 0.3, 0.045),
      materials.cyanSoft,
    );
    columnLight.position.copy(polar(ROOM_RADIUS - 0.46, angle, ROOM_HEIGHT / 2));
    root.add(columnLight);

    const columnFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.22, 0.78),
      materials.darkMetal,
    );
    columnFoot.position.copy(polar(ROOM_RADIUS - 0.24, angle, 0.11));
    columnFoot.rotation.y = angle;
    root.add(columnFoot);
  }

  // ---------------------------------------------------------------- screens
  const screenGeometry = (() => {
    const geometry = new THREE.PlaneGeometry(7.6, 2.7, 18, 1);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      position.setZ(i, -x * x * 0.042);
    }
    geometry.computeVertexNormals();
    return geometry;
  })();

  const backingGeometry = new THREE.PlaneGeometry(7.94, 3.02);
  const glowBarTop = new THREE.BoxGeometry(7.72, 0.045, 0.08);
  const glowBarSide = new THREE.BoxGeometry(0.045, 2.76, 0.08);

  for (let i = 0; i < BAY_COUNT; i += 1) {
    if (i === 4) continue;
    const angle = BAY_OFFSET + i * BAY_STEP;
    const bay = new THREE.Group();
    bay.position.copy(polar(SCREEN_RADIUS, angle, SCREEN_HEIGHT));
    bay.lookAt(0, SCREEN_HEIGHT, 0);

    const backing = new THREE.Mesh(backingGeometry, materials.frame);
    backing.position.z = -0.055;
    bay.add(backing);

    const screen = new THREE.Mesh(screenGeometry, screenMaterials[(i + 2) % screenMaterials.length]);
    bay.add(screen);

    const topBar = new THREE.Mesh(glowBarTop, materials.cyan);
    topBar.position.set(0, 1.39, 0.03);
    bay.add(topBar);

    const bottomBar = new THREE.Mesh(glowBarTop, materials.cyanSoft);
    bottomBar.position.set(0, -1.39, 0.03);
    bay.add(bottomBar);

    [-3.83, 3.83].forEach((x) => {
      const sideBar = new THREE.Mesh(glowBarSide, materials.cyanSoft);
      sideBar.position.set(x, 0, 0.03);
      bay.add(sideBar);
    });

    // Operator shelf below each wall display.
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.46, 0.44), materials.deskTop);
    shelf.position.set(0, -1.67, 0.25);
    bay.add(shelf);

    const shelfLip = new THREE.Mesh(new THREE.BoxGeometry(7.24, 0.035, 0.48), materials.cyanSoft);
    shelfLip.position.set(0, -1.44, 0.25);
    bay.add(shelfLip);

    [-2.35, 0, 2.35].forEach((x) => {
      const consoleScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(1.35, 0.48),
        new THREE.MeshBasicMaterial({ map: consoleTexture, toneMapped: false }),
      );
      consoleScreen.position.set(x, -1.38, 0.48);
      consoleScreen.rotation.x = -0.26;
      bay.add(consoleScreen);
    });

    if (i % 2 === 0) {
      const screenLight = new THREE.PointLight(0x3ca9ff, 12, 8, 2);
      screenLight.position.set(0, 0, 1.7);
      bay.add(screenLight);
      dynamic.screenLights.push(screenLight);
    }

    root.add(bay);
  }

  // ----------------------------------------------------------------- chairs
  const createChair = () => {
    const chair = new THREE.Group();

    for (let i = 0; i < 5; i += 1) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.045, 0.075), materials.darkMetal);
      leg.position.set(0.22, 0.075, 0);
      leg.rotation.y = (i * TAU) / 5;
      chair.add(leg);

      const caster = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10), materials.rubber);
      caster.rotation.z = Math.PI / 2;
      caster.position.set(Math.cos((i * TAU) / 5) * 0.42, 0.045, -Math.sin((i * TAU) / 5) * 0.42);
      chair.add(caster);
    }

    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.4, 12), materials.darkMetal);
    column.position.y = 0.29;
    chair.add(column);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.09, 0.55), materials.chair);
    seat.position.y = 0.5;
    chair.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.53, 0.66, 0.09), materials.chair);
    back.position.set(0, 0.84, -0.25);
    back.rotation.x = -0.08;
    chair.add(back);

    const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 0.07), materials.chair);
    headrest.position.set(0, 1.21, -0.28);
    headrest.rotation.x = -0.08;
    chair.add(headrest);

    const backAccent = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.018, 0.012), materials.cyanSoft);
    backAccent.position.set(0, 0.78, -0.2);
    chair.add(backAccent);

    [-0.35, 0.35].forEach((x) => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.3, 0.07), materials.darkMetal);
      arm.position.set(x, 0.66, -0.02);
      chair.add(arm);
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.045, 0.32), materials.chair);
      pad.position.set(x, 0.81, 0.01);
      chair.add(pad);
    });

    return chair;
  };

  // ------------------------------------------------------------ workstations
  const createWorkstation = () => {
    const station = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(3.45, 1.02, 1.25), materials.desk);
    base.position.y = 0.51;
    station.add(base);

    const top = new THREE.Mesh(new THREE.BoxGeometry(3.68, 0.08, 1.42), materials.deskTop);
    top.position.y = 1.06;
    station.add(top);

    const lip = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.035, 1.34), materials.cyanSoft);
    lip.position.y = 1.11;
    station.add(lip);

    const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(3.14, 0.4, 0.05), materials.darkMetal);
    frontPanel.position.set(0, 0.66, 0.65);
    station.add(frontPanel);

    for (let i = 0; i < 3; i += 1) {
      const indicator = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 8, 6),
        i === 1 ? new THREE.MeshBasicMaterial({ color: 0xff795c }) : materials.cyan,
      );
      indicator.position.set(-0.42 + i * 0.16, 0.78, 0.69);
      station.add(indicator);
    }

    const monitor = (width, height, x, y, z, tilt) => {
      const housing = new THREE.Mesh(new THREE.BoxGeometry(width + 0.1, height + 0.1, 0.1), materials.darkMetal);
      housing.position.set(x, y, z);
      housing.rotation.x = tilt;
      station.add(housing);

      const face = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({ map: consoleTexture, toneMapped: false }),
      );
      face.position.set(x, y, z + 0.056);
      face.rotation.x = tilt;
      station.add(face);

      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.1), materials.darkMetal);
      stand.position.set(x, y - height / 2 - 0.19, z - 0.02);
      station.add(stand);
    };

    monitor(1.35, 0.72, 0, 1.62, 0.16, -0.18);
    monitor(0.62, 0.46, -0.96, 1.48, 0.2, -0.18);
    monitor(0.62, 0.46, 0.96, 1.48, 0.2, -0.18);

    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.045, 0.34), materials.rubber);
    keyboard.position.set(0, 1.12, 0.46);
    station.add(keyboard);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.3, 2.1),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        color: 0x000000,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.014;
    station.add(shadow);

    return station;
  };

  for (let i = 0; i < BAY_COUNT; i += 1) {
    const angle = BAY_OFFSET + i * BAY_STEP;
    if (i === 4) continue;

    const station = createWorkstation();
    station.position.copy(polar(9.85, angle));
    station.lookAt(0, 0, 0);
    root.add(station);

    const chair = createChair();
    chair.position.copy(polar(8.45, angle));
    chair.rotation.y = angle;
    root.add(chair);
    addShadow(0.55, Math.sin(angle) * 8.45, Math.cos(angle) * 8.45, 0.42);
  }

  // Three command chairs around the central dais.
  [0.55, Math.PI * 0.72, Math.PI * 1.46].forEach((angle) => {
    const chair = createChair();
    chair.position.copy(polar(3.55, angle));
    chair.rotation.y = angle + Math.PI;
    root.add(chair);
    addShadow(0.5, Math.sin(angle) * 3.55, Math.cos(angle) * 3.55, 0.38);
  });

  // -------------------------------------------------------- foreground pods
  const createForegroundPod = () => {
    const pod = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.84, 1.05), materials.white);
    base.position.y = 0.42;
    pod.add(base);

    const inset = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.36, 0.06), materials.darkMetal);
    inset.position.set(0, 0.46, 0.54);
    pod.add(inset);

    const top = new THREE.Mesh(new THREE.BoxGeometry(3.18, 0.08, 1.15), materials.deskTop);
    top.position.y = 0.87;
    pod.add(top);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.85, 0.56),
      new THREE.MeshBasicMaterial({ map: consoleTexture, toneMapped: false }),
    );
    screen.rotation.x = -Math.PI / 2.75;
    screen.position.set(0, 1.04, 0.04);
    pod.add(screen);

    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 0.66), materials.cyanSoft);
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0, 0.92, 0.06);
    pod.add(glow);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.9, 1.7),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        color: 0x000000,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.014;
    pod.add(shadow);

    return pod;
  };

  [-0.95, 0.95].forEach((angle) => {
    const pod = createForegroundPod();
    pod.position.copy(polar(5.8, angle));
    pod.lookAt(0, 0, 0);
    root.add(pod);
  });

  // -------------------------------------------------------- central console
  addShadow(2.7, 0, 0, 0.55);

  const consoleBase = new THREE.Mesh(
    new THREE.CylinderGeometry(2.36, 2.52, 0.64, 56),
    materials.darkMetal,
  );
  consoleBase.position.y = 0.52;
  root.add(consoleBase);

  const consoleBand = new THREE.Mesh(
    new THREE.CylinderGeometry(2.3, 2.3, 0.28, 56),
    materials.white,
  );
  consoleBand.position.y = 0.96;
  root.add(consoleBand);

  const consoleTop = new THREE.Mesh(
    new THREE.CylinderGeometry(2.17, 2.17, 0.12, 56),
    new THREE.MeshStandardMaterial({ color: 0x0c1a28, roughness: 0.35, metalness: 0.6 }),
  );
  consoleTop.position.y = 1.16;
  root.add(consoleTop);

  const consoleGlow = new THREE.Mesh(new THREE.TorusGeometry(2.19, 0.038, 8, 128), materials.cyan);
  consoleGlow.rotation.x = Math.PI / 2;
  consoleGlow.position.y = 1.23;
  root.add(consoleGlow);
  dynamic.glowRings.push(consoleGlow);

  const consoleInner = new THREE.Mesh(
    new THREE.TorusGeometry(1.28, 0.018, 8, 96),
    materials.blueSoft,
  );
  consoleInner.rotation.x = Math.PI / 2;
  consoleInner.position.y = 1.24;
  root.add(consoleInner);

  for (let i = 0; i < 8; i += 1) {
    const angle = (i * TAU) / 8;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.045, 0.3), materials.darkMetal);
    panel.position.copy(polar(1.7, angle, 1.235));
    panel.rotation.y = angle + Math.PI / 2;
    root.add(panel);

    const panelGlow = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.012, 0.16), materials.cyanSoft);
    panelGlow.position.copy(polar(1.7, angle, 1.26));
    panelGlow.rotation.y = angle + Math.PI / 2;
    root.add(panelGlow);
  }

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.94, 0.5, 40),
    materials.darkMetal,
  );
  pedestal.position.y = 1.47;
  root.add(pedestal);

  const projectorRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.86, 0.032, 8, 72),
    materials.cyan,
  );
  projectorRing.rotation.x = Math.PI / 2;
  projectorRing.position.y = 1.75;
  root.add(projectorRing);
  dynamic.glowRings.push(projectorRing);

  const projectorCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.52, 0.16, 32),
    new THREE.MeshBasicMaterial({ color: 0xbdf5ff, toneMapped: false }),
  );
  projectorCore.position.y = 1.78;
  root.add(projectorCore);

  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(1.12, 0.58, 1.5, 28, 1, true),
    materials.holoBeam,
  );
  beam.position.y = 2.55;
  root.add(beam);

  // ------------------------------------------------------- Surveyor 5 hologram
  const hologram = new THREE.Group();
  hologram.position.y = 3.45;
  root.add(hologram);
  dynamic.hologram = hologram;

  const surveyorHologram = createSurveyor5Hologram();
  hologram.add(surveyorHologram.root);
  dynamic.surveyor = surveyorHologram;

  // Invisible pick volume so the whole projection can be clicked in the viewer.
  const hologramHitTarget = new THREE.Mesh(
    new THREE.SphereGeometry(1.72, 16, 12),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      colorWrite: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  hologramHitTarget.userData.noCollision = true;
  hologram.add(hologramHitTarget);

  const hologramGlow = new THREE.Sprite(materials.holoGlow);
  hologramGlow.scale.set(3.8, 3.8, 1);
  hologramGlow.position.y = 0.15;
  hologram.add(hologramGlow);

  const hologramLight = new THREE.PointLight(0x53cfff, 28, 10, 2);
  hologramLight.position.set(0, 3.45, 0);
  root.add(hologramLight);
  dynamic.hologramLight = hologramLight;

  // --------------------------------------------------------- ceiling details
  const centralCeiling = new THREE.Mesh(
    new THREE.CircleGeometry(2.65, 72),
    new THREE.MeshStandardMaterial({ color: 0x101a26, roughness: 0.7, metalness: 0.3 }),
  );
  centralCeiling.rotation.x = Math.PI / 2;
  centralCeiling.position.y = ROOM_HEIGHT - 0.015;
  root.add(centralCeiling);

  const ceilingRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.67, 0.045, 8, 96),
    materials.cyanSoft,
  );
  ceilingRing.rotation.x = Math.PI / 2;
  ceilingRing.position.y = ROOM_HEIGHT - 0.05;
  root.add(ceilingRing);

  const ceilingCore = new THREE.Mesh(
    new THREE.CircleGeometry(1.45, 56),
    new THREE.MeshStandardMaterial({
      color: 0x1c2a3b,
      emissive: 0x8ccfff,
      emissiveIntensity: 0.32,
      roughness: 0.5,
    }),
  );
  ceilingCore.rotation.x = Math.PI / 2;
  ceilingCore.position.y = ROOM_HEIGHT - 0.02;
  root.add(ceilingCore);

  const ceilingLight = new THREE.PointLight(0xbfe8ff, 24, 14, 2);
  ceilingLight.position.set(0, ROOM_HEIGHT - 0.7, 0);
  root.add(ceilingLight);

  for (let i = 0; i < BAY_COUNT; i += 1) {
    const angle = BAY_OFFSET + i * BAY_STEP;

    const beamMesh = new THREE.Mesh(
      new THREE.BoxGeometry(9.8, 0.13, 0.28),
      materials.frame,
    );
    beamMesh.position.copy(polar(7.12, angle, ROOM_HEIGHT - 0.11));
    beamMesh.rotation.y = angle - Math.PI / 2;
    root.add(beamMesh);

    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.05, 0.56), materials.ceilingGlow);
    panel.position.copy(polar(7.3, angle, ROOM_HEIGHT - 0.16));
    panel.rotation.y = angle;
    root.add(panel);

    const panelHalo = new THREE.Mesh(
      new THREE.PlaneGeometry(3.05, 0.85),
      materials.blueSoft,
    );
    panelHalo.rotation.x = Math.PI / 2;
    panelHalo.rotation.z = -angle;
    panelHalo.position.copy(polar(7.3, angle, ROOM_HEIGHT - 0.19));
    root.add(panelHalo);
  }

  // Small ceiling inset lights around the central recess.
  for (let i = 0; i < 4; i += 1) {
    const angle = Math.PI / 4 + (i * TAU) / 4;
    const lightPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.045, 0.34),
      materials.ceilingGlow,
    );
    lightPanel.position.copy(polar(4.25, angle, ROOM_HEIGHT - 0.14));
    lightPanel.rotation.y = angle;
    root.add(lightPanel);
  }

  // ------------------------------------------------------------------ dust
  const dustPositions = new Float32Array(110 * 3);
  for (let i = 0; i < 110; i += 1) {
    const radius = Math.sqrt(Math.random()) * 11.4;
    const angle = Math.random() * TAU;
    dustPositions[i * 3] = Math.cos(angle) * radius;
    dustPositions[i * 3 + 1] = 0.5 + Math.random() * 6.4;
    dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, materials.dust);
  root.add(dust);
  dynamic.dust = dust;

  // ---------------------------------------------------------------- lighting
  const hemisphere = new THREE.HemisphereLight(0x3b5f8a, 0x03060b, 1.35);
  root.add(hemisphere);

  const ambient = new THREE.AmbientLight(0x2a4563, 0.95);
  root.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xc6e7ff, 1.8);
  keyLight.position.set(5.5, 9, 6);
  root.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x2d6dff, 0.75);
  rimLight.position.set(-7, 4, -7);
  root.add(rimLight);

  const podLight = new THREE.PointLight(0x4bbdff, 8, 7, 2);
  podLight.position.set(0, 2.2, 5.6);
  root.add(podLight);

  const update = (delta, elapsed, renderer) => {
    corridor.storageRoom.update(delta);
    corridor.firingRoom.update(delta, elapsed, renderer);
    dynamic.doorOpenAmount +=
      (dynamic.doorTarget - dynamic.doorOpenAmount) * Math.min(1, delta * 4.5);
    dynamic.doorPanels.forEach(({ panel, side }) => {
      const openAmount = dynamic.doorOpenAmount;
      panel.position.x = side * (0.91 + openAmount * 2.02);
      panel.position.z = 0.02 + openAmount * 0.58;
    });

    let targetHoloScale = hologramDisappeared ? 0 : 1;
    if (Math.abs(hologramScale - targetHoloScale) > 0.001) {
      hologramScale += (targetHoloScale - hologramScale) * Math.min(1, delta * 4);
      if (dynamic.hologram) {
        dynamic.hologram.scale.setScalar(Math.max(0.0001, hologramScale));
        dynamic.hologram.visible = hologramScale > 0.01;
      }
      if (dynamic.hologramLight) {
        dynamic.hologramLight.intensity = 28 * hologramScale;
        dynamic.hologramLight.visible = hologramScale > 0.01;
      }
    }

    if (dynamic.surveyor && (!hologramDisappeared || hologramScale > 0.01)) {
      dynamic.surveyor.update(delta, elapsed);
    }
    if (dynamic.hologram && dynamic.hologram.visible) {
      dynamic.hologram.position.y = 3.45 + Math.sin(elapsed * 0.9) * 0.03;
    }
    if (dynamic.dust) {
      dynamic.dust.rotation.y += delta * 0.012;
      dynamic.dust.position.y = Math.sin(elapsed * 0.22) * 0.08;
    }

    dynamic.glowRings.forEach((ring, index) => {
      const material = ring.material;
      if (material && material.transparent) {
        material.opacity = 0.62 + Math.sin(elapsed * 1.5 + index * 0.8) * 0.16;
      }
    });

    dynamic.screenLights.forEach((light, index) => {
      light.intensity = 11 + Math.sin(elapsed * 1.4 + index * 1.7) * 1.6;
    });
  };

  const dispose = () => {
    root.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.forEach((material) => {
          if (material.map && !textures.includes(material.map)) material.map.dispose();
          material.dispose();
        });
      }
    });
    textures.forEach((texture) => texture.dispose());
    root.clear();
  };

  const door = {
    setOpen: (open) => {
      dynamic.doorTarget = open ? 1 : 0;
    },
    isOpen: () => dynamic.doorTarget > 0.5,
  };

  const interactionTargets = [
    { target: doorHitTarget, toggle: () => door.setOpen(!door.isOpen()) },
    { target: hologramHitTarget, action: 'hologram' },
    ...corridor.storageRoom.interactionTargets,
    ...corridor.firingRoom.interactionTargets,
  ];

  let hologramDisappeared = false;
  let hologramScale = 1;

  const setHologramMaterialized = (value) => {
    surveyorHologram.setMaterialized(Boolean(value));
  };

  const setHologramDisappeared = (disappeared) => {
    hologramDisappeared = Boolean(disappeared);
    hologramHitTarget.userData.disabled = hologramDisappeared;
    if (!hologramDisappeared) {
      if (dynamic.hologram) dynamic.hologram.visible = true;
      if (dynamic.hologramLight) dynamic.hologramLight.visible = true;
    }
  };

  return {
    root,
    update,
    dispose,
    door,
    doorHitTarget,
    character,
    corridor,
    interactionTargets,
    hologramHitTarget,
    setHologramMaterialized,
    setHologramDisappeared,
    isHologramDisappeared: () => hologramDisappeared,
  };
}
