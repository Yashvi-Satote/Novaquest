import * as THREE from 'three';

/**
 * Pixel-art component sprites.
 *
 * Each sprite is drawn once to an offscreen canvas and uploaded as a texture.
 * The artwork intentionally uses a small logical grid (96 x 96) so it keeps a
 * crisp, game-like pixel silhouette when displayed on the storage-room shelves.
 */

const GRID = 96;
const SCALE = 2;
const INK = '#02070d';
const PANEL = '#07131f';
const WHITE = '#eefaff';

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function box(ctx, x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function line(ctx, x1, y1, x2, y2, color, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'square';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function poly(ctx, points, fill, stroke, width = 1) {
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

function circle(ctx, x, y, radius, fill, stroke, width = 1) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

function arc(ctx, x, y, radius, start, end, color, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, radius, start, end);
  ctx.stroke();
}

function drawGlyph(ctx, component) {
  const color = component.color || component.accent;
  const accent = component.accent;
  const dim = 'rgba(255,255,255,0.26)';

  switch (component.sprite) {
    case 'frame': {
      line(ctx, 25, 70, 48, 26, WHITE, 2);
      line(ctx, 48, 26, 71, 70, WHITE, 2);
      line(ctx, 25, 70, 71, 70, WHITE, 2);
      line(ctx, 33, 57, 63, 57, dim, 1);
      line(ctx, 40, 44, 56, 44, dim, 1);
      line(ctx, 33, 57, 40, 44, dim, 1);
      line(ctx, 63, 57, 56, 44, dim, 1);
      line(ctx, 42, 70, 48, 26, dim, 1);
      line(ctx, 54, 70, 48, 26, dim, 1);
      [[25, 70], [48, 26], [71, 70]].forEach(([x, y]) => {
        circle(ctx, x, y, 2.6, color, INK, 1);
      });
      break;
    }
    case 'legs': {
      box(ctx, 37, 31, 22, 12, color);
      box(ctx, 40, 34, 16, 2, INK);
      line(ctx, 40, 42, 27, 63, WHITE, 2);
      line(ctx, 48, 43, 48, 66, WHITE, 2);
      line(ctx, 56, 42, 69, 63, WHITE, 2);
      box(ctx, 26, 63, 13, 4, color);
      box(ctx, 57, 63, 13, 4, color);
      box(ctx, 42, 66, 13, 4, color);
      line(ctx, 38, 46, 30, 60, dim, 1);
      line(ctx, 58, 46, 66, 60, dim, 1);
      break;
    }
    case 'retrorocket': {
      box(ctx, 42, 24, 13, 11, color);
      poly(ctx, [[40, 35], [56, 35], [59, 45], [36, 45]], '#c7d9e2', INK, 1);
      poly(ctx, [[41, 45], [54, 45], [58, 56], [37, 56]], color, INK, 1);
      box(ctx, 43, 27, 4, 7, INK);
      box(ctx, 50, 27, 4, 7, INK);
      poly(ctx, [[40, 56], [55, 56], [62, 72], [48, 66], [34, 72]], '#ff8a3d');
      poly(ctx, [[43, 56], [52, 56], [49, 65], [45, 65]], '#ffe28a');
      line(ctx, 34, 73, 62, 73, 'rgba(255,170,80,0.42)', 3);
      for (let i = 0; i < 3; i += 1) {
        line(ctx, 36 + i * 10, 69, 32 + i * 10, 75, 'rgba(255,170,80,0.55)', 1);
      }
      break;
    }
    case 'vernier': {
      box(ctx, 29, 38, 38, 7, color);
      [32, 45, 58].forEach((x, index) => {
        poly(ctx, [[x, 45], [x + 8, 45], [x + 10, 53], [x - 2, 53]], '#b9cbd6', INK, 1);
        poly(
          ctx,
          [[x - 1, 53], [x + 9, 53], [x + 13, 67], [x + 4, 63], [x - 5, 67]],
          index === 1 ? '#ffbe69' : '#ff8c4b',
        );
        line(ctx, x + 3, 37, x + 3, 30, dim, 1);
      });
      break;
    }
    case 'radar': {
      arc(ctx, 43, 53, 24, Math.PI, Math.PI * 2, color, 3);
      arc(ctx, 43, 53, 15, Math.PI, Math.PI * 2, 'rgba(255,255,255,0.42)', 1);
      line(ctx, 20, 53, 66, 53, WHITE, 2);
      line(ctx, 43, 53, 43, 30, WHITE, 1.5);
      circle(ctx, 43, 29, 3, accent, INK, 1);
      arc(ctx, 73, 37, 5, -Math.PI / 2, Math.PI / 2, accent, 1.5);
      arc(ctx, 73, 37, 10, -Math.PI / 2, Math.PI / 2, 'rgba(94,231,255,0.55)', 1);
      for (let i = 0; i < 4; i += 1) {
        box(ctx, 24 + i * 12, 70 + i, 7, 2, i % 2 ? dim : accent);
      }
      break;
    }
    case 'solar': {
      poly(ctx, [[20, 37], [61, 27], [77, 57], [36, 68]], '#193c72', color, 1.5);
      for (let i = 1; i < 4; i += 1) {
        line(ctx, 20 + i * 10.2, 34.5 + i * 2.5, 36 + i * 10.2, 64.5 + i * 2.5, 'rgba(155,196,255,0.65)', 1);
      }
      for (let i = 1; i < 3; i += 1) {
        line(ctx, 30 - i * 9, 31 + i * 9, 67 - i * 9, 57 + i * 9, 'rgba(155,196,255,0.48)', 1);
      }
      circle(ctx, 72, 23, 6, 'rgba(255,220,120,0.22)');
      circle(ctx, 72, 23, 3.8, '#ffe48b');
      line(ctx, 72, 15, 72, 18, '#ffe48b', 1);
      line(ctx, 64, 23, 67, 23, '#ffe48b', 1);
      line(ctx, 77, 23, 80, 23, '#ffe48b', 1);
      line(ctx, 72, 28, 72, 31, '#ffe48b', 1);
      break;
    }
    case 'battery': {
      box(ctx, 31, 26, 34, 46, color);
      box(ctx, 36, 21, 8, 5, '#d9f9e8');
      box(ctx, 52, 21, 8, 5, '#d9f9e8');
      box(ctx, 34, 30, 28, 38, PANEL);
      [38, 46, 54, 62].forEach((y) => box(ctx, 38, y, 20, 3, 'rgba(124,240,180,0.35)'));
      poly(ctx, [[51, 33], [42, 51], [49, 51], [44, 66], [59, 45], [51, 45]], '#eafff5');
      break;
    }
    case 'phasedArray': {
      poly(ctx, [[25, 29], [64, 24], [72, 60], [33, 68]], '#10233a', color, 1.5);
      for (let row = 0; row < 4; row += 1) {
        for (let col = 0; col < 5; col += 1) {
          box(ctx, 31 + col * 8, 35 + row * 7, 3, 3, (row + col) % 3 === 0 ? WHITE : accent);
        }
      }
      line(ctx, 72, 29, 81, 18, 'rgba(184,236,255,0.75)', 1.5);
      arc(ctx, 77, 24, 8, -0.8, 0.6, 'rgba(184,236,255,0.42)', 1);
      break;
    }
    case 'omni': {
      box(ctx, 42, 54, 12, 11, color);
      line(ctx, 34, 58, 50, 43, WHITE, 2);
      line(ctx, 62, 58, 46, 43, WHITE, 2);
      poly(ctx, [[29, 56], [36, 56], [34, 41], [30, 41]], color, INK, 1);
      poly(ctx, [[60, 56], [67, 56], [66, 41], [62, 41]], color, INK, 1);
      arc(ctx, 33, 34, 6, Math.PI * 1.1, Math.PI * 1.9, accent, 1);
      arc(ctx, 33, 34, 11, Math.PI * 1.1, Math.PI * 1.9, 'rgba(201,216,227,0.35)', 1);
      arc(ctx, 63, 34, 6, Math.PI * 1.1, Math.PI * 1.9, accent, 1);
      arc(ctx, 63, 34, 11, Math.PI * 1.1, Math.PI * 1.9, 'rgba(201,216,227,0.35)', 1);
      break;
    }
    case 'tvCamera': {
      box(ctx, 31, 34, 34, 24, color);
      box(ctx, 36, 38, 20, 15, INK);
      circle(ctx, 46, 45, 7, '#163752', '#ffe28a', 1.5);
      circle(ctx, 46, 45, 3, '#ffc85e');
      poly(ctx, [[30, 40], [22, 34], [22, 48], [30, 54]], '#c5d8e2', INK, 1);
      box(ctx, 60, 40, 8, 11, '#c5d8e2');
      line(ctx, 48, 34, 48, 27, WHITE, 2);
      box(ctx, 36, 58, 27, 4, '#a8bcc8');
      box(ctx, 41, 62, 5, 8, '#7892a3');
      box(ctx, 53, 62, 5, 8, '#7892a3');
      box(ctx, 37, 31, 12, 3, accent);
      break;
    }
    case 'alpha': {
      line(ctx, 48, 19, 48, 28, dim, 1);
      poly(ctx, [[31, 28], [65, 28], [69, 62], [27, 62]], color, INK, 1.5);
      box(ctx, 34, 33, 28, 24, PANEL);
      circle(ctx, 48, 45, 3, '#ffe8ff');
      ctx.strokeStyle = '#e4b4ff';
      ctx.lineWidth = 1;
      [6, 10, 14].forEach((rx, index) => {
        ctx.beginPath();
        ctx.ellipse(48, 45, rx, rx * 0.45, (index * Math.PI) / 3, 0, Math.PI * 2);
        ctx.stroke();
      });
      box(ctx, 30, 64, 36, 4, '#b48ad0');
      break;
    }
    case 'scoop': {
      line(ctx, 66, 24, 58, 38, WHITE, 3);
      line(ctx, 58, 38, 45, 44, WHITE, 3);
      line(ctx, 45, 44, 33, 59, WHITE, 3);
      circle(ctx, 58, 38, 3, color, INK, 1);
      circle(ctx, 45, 44, 3, color, INK, 1);
      poly(ctx, [[21, 53], [38, 53], [44, 65], [25, 69], [17, 62]], color, INK, 1.5);
      box(ctx, 23, 56, 13, 3, INK);
      [[28, 73], [36, 76], [45, 72], [23, 77]].forEach(([x, y], i) => {
        box(ctx, x, y, 2 + (i % 2), 2, '#d1b48d');
      });
      break;
    }
    case 'magnet': {
      ctx.strokeStyle = color;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(48, 44, 17, Math.PI, 0);
      ctx.stroke();
      box(ctx, 27, 44, 9, 16, color);
      box(ctx, 60, 44, 9, 16, color);
      box(ctx, 27, 58, 9, 5, WHITE);
      box(ctx, 60, 58, 9, 5, WHITE);
      arc(ctx, 48, 46, 27, Math.PI * 1.08, Math.PI * 1.92, 'rgba(255,122,138,0.45)', 1);
      arc(ctx, 48, 46, 33, Math.PI * 1.12, Math.PI * 1.88, 'rgba(255,122,138,0.22)', 1);
      [[24, 73], [72, 73], [31, 77], [65, 77]].forEach(([x, y], i) => box(ctx, x, y, 2, 2, i % 2 ? dim : color));
      break;
    }
    case 'thermal': {
      poly(ctx, [[30, 27], [66, 27], [70, 60], [26, 60]], color, INK, 1.5);
      box(ctx, 32, 32, 32, 23, '#dfeaf2');
      [35, 41, 47, 53].forEach((y) => box(ctx, 35, y, 26, 2, '#8ca7b8'));
      box(ctx, 64, 36, 10, 25, PANEL);
      box(ctx, 67, 39, 4, 13, '#ff7d6e');
      circle(ctx, 69, 55, 3, '#ff7d6e');
      [[18, 72], [25, 76], [75, 71]].forEach(([x, y]) => box(ctx, x, y, 3, 1, dim));
      break;
    }
    case 'starTracker': {
      box(ctx, 29, 49, 27, 12, color);
      poly(ctx, [[31, 49], [23, 42], [23, 57], [31, 62]], '#c7d7e2', INK, 1);
      circle(ctx, 51, 55, 7, '#173b55', '#ffe680', 1.2);
      circle(ctx, 51, 55, 2.5, '#ffe680');
      line(ctx, 51, 44, 51, 47, dim, 1);
      poly(ctx, [[66, 19], [68, 25], [75, 27], [68, 29], [66, 35], [64, 29], [57, 27], [64, 25]], '#fff6bf');
      circle(ctx, 77, 38, 5, 'rgba(255,230,128,0.25)');
      circle(ctx, 77, 38, 2.8, '#ffe680');
      line(ctx, 77, 30, 77, 32, '#ffe680', 1);
      line(ctx, 71, 38, 73, 38, '#ffe680', 1);
      break;
    }
    case 'warmBox': {
      poly(ctx, [[35, 25], [61, 25], [71, 35], [71, 59], [61, 69], [35, 69], [25, 59], [25, 35]], color, INK, 1.5);
      poly(ctx, [[35, 30], [61, 30], [66, 37], [66, 57], [59, 64], [37, 64], [30, 57], [30, 37]], '#193647', color, 1);
      [37, 45, 53].forEach((y) => line(ctx, 34, y, 62, y, 'rgba(185,215,229,0.4)', 1));
      line(ctx, 40, 34, 56, 60, 'rgba(185,215,229,0.25)', 1);
      line(ctx, 56, 34, 40, 60, 'rgba(185,215,229,0.25)', 1);
      box(ctx, 45, 69, 6, 7, '#91a8b7');
      box(ctx, 48, 42, 3, 3, accent);
      break;
    }
    case 'rockerBogie': {
      box(ctx, 38, 36, 21, 10, color);
      line(ctx, 42, 46, 28, 58, WHITE, 2);
      line(ctx, 54, 46, 68, 58, WHITE, 2);
      line(ctx, 40, 45, 22, 51, WHITE, 2);
      line(ctx, 56, 45, 74, 51, WHITE, 2);
      [22, 38, 54].forEach((x, i) => {
        circle(ctx, x, 65, 6, i === 1 ? '#45525c' : '#2f3a43', color, 1.5);
        circle(ctx, x, 65, 2, '#aebfc7');
      });
      [70, 54, 38].forEach((x) => {
        circle(ctx, x, 65, 6, '#2f3a43', color, 1.5);
        circle(ctx, x, 65, 2, '#aebfc7');
      });
      box(ctx, 44, 31, 9, 4, accent);
      break;
    }
    case 'roverSolar': {
      poly(ctx, [[13, 41], [33, 32], [43, 45], [23, 54]], '#173b70', color, 1.2);
      poly(ctx, [[83, 41], [63, 32], [53, 45], [73, 54]], '#173b70', color, 1.2);
      for (let i = 1; i < 3; i += 1) {
        line(ctx, 13 + i * 7, 38 + i * 2, 23 + i * 7, 51 + i * 2, 'rgba(111,157,255,0.55)', 1);
        line(ctx, 83 - i * 7, 38 + i * 2, 73 - i * 7, 51 + i * 2, 'rgba(111,157,255,0.55)', 1);
      }
      box(ctx, 38, 43, 20, 8, color);
      [39, 56].forEach((x) => line(ctx, x, 51, x - 2, 63, WHITE, 2));
      [44, 51].forEach((x) => circle(ctx, x, 65, 4, '#38434b', '#d7b27b', 1));
      circle(ctx, 75, 25, 5, '#ffe38a');
      break;
    }
    case 'roverBattery': {
      poly(ctx, [[30, 29], [66, 29], [72, 38], [72, 66], [24, 66], [24, 38]], color, INK, 1.5);
      [31, 43, 55].forEach((x) => box(ctx, x, 36, 9, 24, PANEL));
      [31, 43, 55].forEach((x) => box(ctx, x, 38, 9, 2, '#9ff5ca'));
      box(ctx, 26, 25, 9, 4, '#d2f8e4');
      box(ctx, 61, 25, 9, 4, '#d2f8e4');
      poly(ctx, [[53, 42], [45, 53], [50, 53], [47, 61], [57, 49], [52, 49]], '#eafff5');
      break;
    }
    case 'pancam': {
      box(ctx, 44, 47, 9, 28, '#b6c5cf');
      box(ctx, 38, 42, 22, 8, color);
      box(ctx, 37, 28, 9, 13, '#d8e1e7');
      box(ctx, 51, 28, 9, 13, '#d8e1e7');
      circle(ctx, 41.5, 35, 4, '#17384f', '#ffcf6e', 1.2);
      circle(ctx, 55.5, 35, 4, '#17384f', '#ffcf6e', 1.2);
      circle(ctx, 41.5, 35, 1.5, '#ffcf6e');
      circle(ctx, 55.5, 35, 1.5, '#ffcf6e');
      box(ctx, 38, 49, 22, 3, accent);
      box(ctx, 39, 73, 20, 3, '#8da1ae');
      break;
    }
    case 'navcam': {
      box(ctx, 45, 43, 7, 30, '#b6c5cf');
      box(ctx, 33, 30, 19, 12, color);
      box(ctx, 52, 30, 13, 12, color);
      circle(ctx, 39, 36, 4, '#17384f', WHITE, 1.2);
      circle(ctx, 58, 36, 3, '#17384f', WHITE, 1.2);
      poly(ctx, [[26, 28], [39, 25], [39, 31]], 'rgba(210,229,241,0.22)');
      poly(ctx, [[65, 28], [52, 25], [52, 31]], 'rgba(210,229,241,0.22)');
      box(ctx, 42, 27, 6, 3, accent);
      break;
    }
    case 'hazcam': {
      box(ctx, 30, 36, 29, 19, color);
      circle(ctx, 44, 45, 7, '#17384f', WHITE, 1.3);
      circle(ctx, 44, 45, 2.5, '#c6d8e6');
      poly(ctx, [[59, 39], [78, 31], [78, 59], [59, 52]], 'rgba(198,216,230,0.16)');
      poly(ctx, [[70, 22], [76, 34], [64, 34]], '#ffb45f', INK, 1);
      box(ctx, 70, 27, 1, 4, INK);
      box(ctx, 41, 30, 7, 3, accent);
      break;
    }
    case 'miniTes': {
      box(ctx, 35, 47, 24, 25, '#b3a38d');
      box(ctx, 31, 68, 32, 5, '#6e5d4b');
      box(ctx, 42, 39, 10, 9, '#d9c8a9');
      circle(ctx, 47, 30, 13, '#8d7358', color, 1.5);
      circle(ctx, 47, 30, 9, '#18485b');
      circle(ctx, 47, 30, 4, '#ff9b6b');
      arc(ctx, 65, 26, 6, -1.1, 0.8, 'rgba(255,155,107,0.55)', 1);
      arc(ctx, 68, 23, 10, -1.1, 0.8, 'rgba(255,155,107,0.3)', 1);
      box(ctx, 37, 53, 20, 2, '#7d6c58');
      break;
    }
    case 'mossbauer': {
      box(ctx, 27, 35, 39, 27, color);
      box(ctx, 31, 39, 14, 19, PANEL);
      circle(ctx, 38, 48, 4, '#e7b48f', '#ffbd8a', 1);
      box(ctx, 49, 41, 12, 4, '#9c6f5d');
      box(ctx, 49, 48, 12, 4, '#9c6f5d');
      box(ctx, 49, 55, 12, 3, '#9c6f5d');
      line(ctx, 31, 65, 28, 73, WHITE, 2);
      line(ctx, 60, 65, 64, 73, WHITE, 2);
      [[23, 30], [69, 47], [20, 55]].forEach(([x, y], i) => {
        line(ctx, x, y, x + (i % 2 ? 5 : -4), y - 4, '#ffd8a8', 1);
        line(ctx, x, y, x + (i % 2 ? -4 : 5), y - 4, '#ffd8a8', 1);
      });
      break;
    }
    case 'apxs': {
      box(ctx, 31, 30, 33, 21, color);
      circle(ctx, 39, 41, 6, '#4b3628', '#ffda8c', 1.2);
      circle(ctx, 55, 41, 4, '#4b3628', WHITE, 1);
      box(ctx, 36, 51, 23, 5, '#9e784b');
      line(ctx, 47, 56, 44, 66, WHITE, 3);
      line(ctx, 44, 66, 35, 72, WHITE, 3);
      [[21, 33], [69, 35], [24, 48], [72, 48]].forEach(([x, y]) => {
        line(ctx, x, y, x + 4, y, '#ffe0a1', 1);
        line(ctx, x, y, x - 2, y + 3, '#ffe0a1', 1);
      });
      break;
    }
    case 'microscope': {
      box(ctx, 35, 24, 26, 19, color);
      box(ctx, 41, 28, 14, 11, INK);
      circle(ctx, 48, 33.5, 4, '#24516b', '#d8ecff', 1.2);
      poly(ctx, [[38, 43], [58, 43], [63, 56], [33, 56]], '#adc0cc', INK, 1);
      box(ctx, 34, 56, 29, 4, '#8498a4');
      poly(ctx, [[29, 68], [39, 61], [51, 63], [61, 58], [69, 69], [49, 74], [35, 73]], '#8c7058', INK, 1);
      [[35, 69], [48, 67], [58, 64]].forEach(([x, y]) => box(ctx, x, y, 2, 2, '#d0aa78'));
      line(ctx, 61, 28, 68, 22, 'rgba(216,236,255,0.6)', 1);
      break;
    }
    case 'rat': {
      box(ctx, 29, 31, 19, 11, color);
      box(ctx, 33, 34, 8, 5, INK);
      box(ctx, 36, 42, 11, 11, '#aab9c1');
      box(ctx, 39, 53, 5, 13, '#d8e2e8');
      circle(ctx, 41.5, 68, 6, '#9aabb5', WHITE, 1);
      [36, 41, 46].forEach((x) => box(ctx, x, 66, 2, 4, '#ffd05c'));
      poly(ctx, [[56, 58], [69, 51], [79, 62], [70, 73], [57, 68]], '#80634e', INK, 1);
      [[57, 69], [63, 72], [70, 70], [75, 64]].forEach(([x, y]) => box(ctx, x, y, 2, 2, '#e1bd8b'));
      line(ctx, 53, 59, 48, 50, 'rgba(255,208,92,0.5)', 1);
      break;
    }
    case 'arm': {
      circle(ctx, 29, 58, 6, color, INK, 1.5);
      line(ctx, 29, 58, 43, 37, WHITE, 4);
      circle(ctx, 43, 37, 5, '#c1d0d8', INK, 1);
      line(ctx, 43, 37, 60, 49, WHITE, 4);
      circle(ctx, 60, 49, 4, '#c1d0d8', INK, 1);
      line(ctx, 60, 49, 70, 37, WHITE, 3);
      box(ctx, 66, 30, 7, 9, color);
      circle(ctx, 69.5, 34.5, 2, INK);
      box(ctx, 25, 64, 9, 3, '#657b88');
      [[52, 30], [77, 52], [31, 29]].forEach(([x, y]) => {
        line(ctx, x, y, x + 3, y, dim, 1);
        line(ctx, x, y, x, y + 3, dim, 1);
      });
      break;
    }
    case 'roverMagnet': {
      [23, 45, 67].forEach((x, i) => {
        box(ctx, x, 37, 15, 10, i === 1 ? '#c9d8e1' : color);
        box(ctx, x + 2, 39, 4, 6, INK);
        box(ctx, x + 9, 39, 4, 6, INK);
      });
      arc(ctx, 30, 55, 11, 0, Math.PI, 'rgba(255,128,151,0.38)', 1);
      arc(ctx, 52, 55, 11, 0, Math.PI, 'rgba(255,128,151,0.38)', 1);
      arc(ctx, 74, 55, 11, 0, Math.PI, 'rgba(255,128,151,0.38)', 1);
      [[26, 64], [48, 61], [71, 64], [34, 72], [61, 73], [79, 58]].forEach(([x, y], i) => {
        box(ctx, x, y, 2, 2, i % 2 ? '#d6a27f' : '#8c6e5a');
      });
      break;
    }
    case 'roverAntenna': {
      line(ctx, 27, 29, 27, 65, color, 2);
      arc(ctx, 27, 34, 5, Math.PI * 1.1, Math.PI * 1.9, color, 1);
      arc(ctx, 27, 34, 9, Math.PI * 1.1, Math.PI * 1.9, 'rgba(166,231,255,0.4)', 1);
      circle(ctx, 27, 28, 2.5, accent);
      circle(ctx, 61, 44, 17, '#173b50', color, 2);
      circle(ctx, 61, 44, 12, 'rgba(166,231,255,0.1)');
      line(ctx, 61, 44, 61, 60, WHITE, 2);
      line(ctx, 53, 59, 69, 59, WHITE, 2);
      circle(ctx, 61, 29, 3, '#d9f4ff');
      line(ctx, 61, 32, 61, 37, dim, 1);
      arc(ctx, 78, 20, 7, 0.2, 1.4, 'rgba(166,231,255,0.55)', 1);
      break;
    }
    case 'sundial': {
      circle(ctx, 48, 52, 21, '#b89b6b', '#f0d79d', 2);
      circle(ctx, 48, 52, 15, '#d7bd8d', INK, 1);
      [0, 1, 2, 3].forEach((i) => {
        circle(ctx, 48, 52, 6 + i * 3.5, null, ['#6c8d62', '#9a6d5f', '#d7bd8d', '#5c6f86'][i], 1);
      });
      poly(ctx, [[48, 52], [40, 52], [48, 34]], '#4b4a43', WHITE, 1);
      line(ctx, 38, 33, 58, 33, '#4b4a43', 1);
      circle(ctx, 70, 24, 5, '#ffe28b');
      line(ctx, 70, 17, 70, 19, '#ffe28b', 1);
      line(ctx, 63, 24, 65, 24, '#ffe28b', 1);
      box(ctx, 28, 73, 40, 3, '#9f8460');
      break;
    }
    case 'bus': {
      const points = [];
      for (let i = 0; i < 10; i += 1) {
        const angle = -Math.PI / 2 + (i * Math.PI * 2) / 10;
        points.push([48 + Math.cos(angle) * 22, 47 + Math.sin(angle) * 22]);
      }
      poly(ctx, points, '#233448', color, 1.5);
      poly(ctx, [[33, 40], [63, 40], [68, 47], [63, 54], [33, 54], [28, 47]], PANEL, 'rgba(201,214,232,0.45)', 1);
      [38, 48, 58].forEach((x) => line(ctx, x, 41, x, 53, 'rgba(201,214,232,0.32)', 1));
      box(ctx, 44, 30, 8, 4, '#9db4c9');
      line(ctx, 48, 30, 48, 24, WHITE, 1);
      circle(ctx, 48, 21, 4, 'rgba(226,236,255,0.15)', color, 1);
      break;
    }
    case 'dish': {
      arc(ctx, 46, 48, 25, Math.PI, Math.PI * 2, color, 3);
      arc(ctx, 46, 48, 18, Math.PI, Math.PI * 2, 'rgba(226,236,255,0.42)', 1);
      line(ctx, 21, 48, 71, 48, WHITE, 2);
      line(ctx, 46, 48, 46, 30, WHITE, 1.5);
      circle(ctx, 46, 29, 3, '#f3f8ff', INK, 1);
      line(ctx, 38, 56, 46, 68, 'rgba(226,236,255,0.45)', 1);
      line(ctx, 54, 56, 46, 68, 'rgba(226,236,255,0.45)', 1);
      arc(ctx, 76, 27, 7, 0.2, 1.3, 'rgba(200,168,255,0.65)', 1);
      arc(ctx, 81, 22, 11, 0.2, 1.3, 'rgba(200,168,255,0.3)', 1);
      break;
    }
    case 'lga': {
      line(ctx, 48, 25, 48, 63, color, 2);
      [31, 36, 41, 46].forEach((y, i) => {
        line(ctx, 41 - i, y, 55 + i, y, i === 0 ? WHITE : color, 1);
      });
      box(ctx, 39, 63, 18, 5, '#9b8fc4');
      box(ctx, 34, 68, 28, 3, '#6e6592');
      arc(ctx, 48, 23, 7, Math.PI * 1.1, Math.PI * 1.9, 'rgba(201,189,240,0.65)', 1);
      arc(ctx, 48, 23, 12, Math.PI * 1.1, Math.PI * 1.9, 'rgba(201,189,240,0.28)', 1);
      break;
    }
    case 'rtg': {
      poly(ctx, [[35, 31], [61, 31], [67, 58], [59, 68], [37, 68], [29, 58]], color, INK, 1.5);
      [34, 44, 54].forEach((x) => box(ctx, x, 34, 2, 31, 'rgba(38,28,12,0.45)'));
      for (let i = 0; i < 8; i += 1) {
        const angle = (i * Math.PI) / 4;
        line(
          ctx,
          48 + Math.cos(angle) * 23,
          49 + Math.sin(angle) * 23,
          48 + Math.cos(angle) * 31,
          49 + Math.sin(angle) * 31,
          'rgba(255,206,114,0.6)',
          1,
        );
      }
      circle(ctx, 48, 49, 7, '#6b5228', '#ffe2a6', 1);
      line(ctx, 48, 45, 48, 53, '#ffe2a6', 1.2);
      circle(ctx, 48, 51, 1.5, '#ffe2a6');
      box(ctx, 42, 67, 12, 4, '#8a7243');
      break;
    }
    case 'hydrazine': {
      box(ctx, 27, 29, 42, 8, color);
      [31, 43, 55].forEach((x, index) => {
        poly(ctx, [[x, 37], [x + 8, 37], [x + 10, 45], [x - 2, 45]], '#c1b2be', INK, 1);
        poly(
          ctx,
          [[x - 1, 45], [x + 9, 45], [x + 13, 61], [x + 4, 57], [x - 5, 61]],
          index === 1 ? '#ffd0a3' : '#ff9979',
        );
      });
      box(ctx, 35, 24, 26, 5, '#9e8c9a');
      [[28, 19], [68, 19], [48, 14]].forEach(([x, y]) => {
        line(ctx, x, y, x + 3, y + 3, dim, 1);
        line(ctx, x + 3, y, x, y + 3, dim, 1);
      });
      break;
    }
    case 'computer': {
      box(ctx, 25, 27, 46, 46, '#143226');
      [31, 43, 55].forEach((x, i) => {
        box(ctx, x, 35, 9, 13, i === 1 ? color : '#2d8a68');
        box(ctx, x + 2, 38, 5, 7, INK);
        for (let pin = 0; pin < 3; pin += 1) {
          box(ctx, x + 1 + pin * 3, 32, 1, 3, '#a4f2d3');
          box(ctx, x + 1 + pin * 3, 48, 1, 3, '#a4f2d3');
        }
      });
      [31, 43, 55].forEach((x) => {
        line(ctx, x + 4, 56, x + 4, 65, '#6ed8b3', 1);
        line(ctx, x + 4, 65, 68, 65, '#6ed8b3', 1);
      });
      box(ctx, 29, 56, 5, 3, '#ffe887');
      box(ctx, 63, 60, 4, 4, '#ff8f8f');
      break;
    }
    case 'magBoom': {
      line(ctx, 25, 65, 71, 31, color, 3);
      line(ctx, 25, 65, 71, 31, 'rgba(255,255,255,0.35)', 1);
      box(ctx, 20, 61, 10, 9, '#38506b');
      box(ctx, 68, 27, 6, 7, '#d8ecff');
      [[27, 32], [32, 22], [75, 44], [82, 55]].forEach(([x, y], i) => {
        line(ctx, x, y, x + (i % 2 ? 6 : -6), y, 'rgba(168,216,255,0.55)', 1);
        line(ctx, x, y, x, y + (i < 2 ? 6 : -6), 'rgba(168,216,255,0.55)', 1);
      });
      break;
    }
    case 'scienceBoom': {
      line(ctx, 23, 62, 71, 35, color, 3);
      circle(ctx, 23, 62, 5, '#4b3d73', INK, 1);
      box(ctx, 39, 43, 10, 8, '#9a88d0');
      box(ctx, 58, 33, 9, 9, '#d0c0ff');
      box(ctx, 70, 29, 7, 12, '#6f5ca8');
      [42, 61, 72].forEach((x) => line(ctx, x, 50, x, 58, 'rgba(199,184,255,0.5)', 1));
      [[34, 25], [80, 22], [86, 42]].forEach(([x, y]) => box(ctx, x, y, 2, 2, '#d8ccff'));
      break;
    }
    case 'scanPlatform': {
      box(ctx, 31, 59, 34, 8, '#5b4b7c');
      line(ctx, 48, 59, 48, 48, WHITE, 3);
      box(ctx, 28, 37, 40, 9, color);
      box(ctx, 33, 26, 12, 11, '#d8c4ff');
      box(ctx, 50, 22, 15, 13, '#c2a8f4');
      circle(ctx, 39, 31.5, 3, '#213349', WHITE, 1);
      circle(ctx, 57, 28.5, 4, '#213349', WHITE, 1);
      box(ctx, 49, 42, 8, 5, '#8c74c0');
      arc(ctx, 48, 69, 15, 0, Math.PI, 'rgba(200,168,255,0.28)', 1);
      break;
    }
    case 'voyagerCameras': {
      box(ctx, 25, 31, 22, 18, color);
      box(ctx, 48, 35, 25, 14, '#d3b979');
      box(ctx, 27, 35, 12, 10, INK);
      circle(ctx, 33, 40, 4, '#ffd27d');
      box(ctx, 52, 38, 12, 8, INK);
      circle(ctx, 58, 42, 3, '#ffd27d');
      line(ctx, 33, 49, 33, 68, WHITE, 3);
      line(ctx, 58, 49, 58, 68, WHITE, 3);
      line(ctx, 24, 68, 42, 68, '#9c8652', 3);
      line(ctx, 50, 68, 68, 68, '#9c8652', 3);
      box(ctx, 28, 27, 14, 3, accent);
      box(ctx, 50, 31, 20, 3, '#ffd27d');
      break;
    }
    case 'iris': {
      poly(ctx, [[27, 40], [44, 30], [56, 42], [38, 53]], '#7b4c3b', color, 1.5);
      poly(ctx, [[55, 42], [65, 36], [70, 48], [58, 54]], '#b9dff0', '#ff9c74', 1);
      line(ctx, 18, 33, 30, 39, '#ffd0a3', 1.5);
      line(ctx, 30, 35, 33, 40, '#ffd0a3', 1.5);
      [0, 1, 2, 3, 4].forEach((i) => {
        box(ctx, 56 + i * 3, 58 + i, 2, 10 - i, ['#ff6b6b', '#ffb35e', '#ffe36e', '#7ce9b4', '#76b9ff'][i]);
      });
      box(ctx, 34, 58, 11, 10, '#4e3a32');
      box(ctx, 37, 61, 5, 3, '#ff9c74');
      break;
    }
    case 'uvSpec': {
      poly(ctx, [[25, 61], [42, 34], [64, 43], [47, 70]], color, INK, 1.5);
      poly(ctx, [[27, 57], [41, 37], [58, 43], [44, 63]], '#34285a', '#b18cff', 1);
      line(ctx, 41, 37, 52, 22, 'rgba(177,140,255,0.45)', 1);
      line(ctx, 43, 38, 58, 19, '#c7abff', 1.2);
      arc(ctx, 57, 25, 9, -1.3, 0.2, 'rgba(177,140,255,0.65)', 1);
      arc(ctx, 62, 22, 14, -1.3, 0.2, 'rgba(177,140,255,0.3)', 1);
      box(ctx, 32, 64, 22, 5, '#5e4c93');
      break;
    }
    case 'photopolarimeter': {
      circle(ctx, 48, 44, 18, '#17304a', color, 2);
      circle(ctx, 48, 44, 11, '#0e2032', 'rgba(143,215,255,0.5)', 1);
      for (let i = 0; i < 4; i += 1) {
        line(ctx, 40, 36 + i * 5, 56, 36 + i * 5, 'rgba(143,215,255,0.55)', 1);
      }
      line(ctx, 35, 27, 48, 44, WHITE, 1.5);
      line(ctx, 61, 27, 48, 44, WHITE, 1.5);
      line(ctx, 48, 20, 48, 26, '#b9eaff', 1);
      line(ctx, 72, 32, 78, 28, '#b9eaff', 1);
      line(ctx, 24, 32, 18, 28, '#b9eaff', 1);
      box(ctx, 37, 62, 22, 7, '#6b8498');
      box(ctx, 42, 69, 12, 3, '#3e5566');
      break;
    }
    case 'plasma': {
      box(ctx, 28, 29, 40, 38, color);
      box(ctx, 32, 33, 32, 30, PANEL);
      for (let i = 0; i < 3; i += 1) {
        ctx.strokeStyle = ['#8ff5e6', '#6dc8ff', '#b6a6ff'][i];
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = 34; x < 64; x += 1) {
          const y = 46 + i * 5 + Math.sin((x + i * 9) * 0.42) * 4;
          if (x === 34) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      [[20, 37], [77, 32], [22, 60], [79, 58]].forEach(([x, y], i) => {
        circle(ctx, x, y, 2, i % 2 ? '#b6a6ff' : '#8ff5e6');
      });
      break;
    }
    case 'lepi': {
      poly(ctx, [[31, 29], [64, 33], [67, 58], [28, 64]], color, INK, 1.5);
      [37, 44, 51].forEach((y, i) => {
        line(ctx, 33, y, 61, y + i * 2, i === 1 ? WHITE : 'rgba(123,200,255,0.45)', 1);
      });
      [[22, 25], [75, 38], [20, 57], [72, 69]].forEach(([x, y], i) => {
        line(ctx, x, y, x + 8, y + 5, i % 2 ? '#b7dcff' : '#7bc8ff', 1);
        circle(ctx, x + 8, y + 5, 1.4, i % 2 ? '#b7dcff' : '#7bc8ff');
      });
      break;
    }
    case 'cosmicRay': {
      box(ctx, 30, 35, 36, 28, color);
      box(ctx, 35, 40, 26, 18, PANEL);
      [0, 1, 2, 3, 4].forEach((i) => {
        const angle = -1.3 + i * 0.6;
        line(
          ctx,
          48,
          49,
          48 + Math.cos(angle) * 32,
          49 + Math.sin(angle) * 32,
          ['#e0d1ff', '#b8a0ff', '#d4c4ff', '#c8b4ff', '#f0e8ff'][i],
          1,
        );
        circle(ctx, 48 + Math.cos(angle) * 32, 49 + Math.sin(angle) * 32, 1.6, '#f0e8ff');
      });
      circle(ctx, 48, 49, 3, '#f0e8ff');
      break;
    }
    case 'plasmaWave': {
      line(ctx, 25, 56, 39, 56, color, 2);
      line(ctx, 57, 56, 71, 56, color, 2);
      line(ctx, 39, 56, 48, 30, color, 2);
      line(ctx, 57, 56, 48, 30, color, 2);
      ctx.strokeStyle = '#7be6ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 25; x <= 72; x += 1) {
        const y = 42 + Math.sin((x - 25) * 0.36) * 5;
        if (x === 25) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      [23, 74].forEach((x) => {
        circle(ctx, x, 42, 2, '#7be6ff');
        line(ctx, x, 37, x, 34, '#7be6ff', 1);
        line(ctx, x, 47, x, 50, '#7be6ff', 1);
      });
      break;
    }
    case 'pra': {
      arc(ctx, 39, 48, 18, Math.PI, Math.PI * 2, color, 3);
      arc(ctx, 39, 48, 12, Math.PI, Math.PI * 2, 'rgba(255,155,210,0.4)', 1);
      line(ctx, 21, 48, 57, 48, WHITE, 2);
      line(ctx, 39, 48, 39, 32, WHITE, 1.5);
      circle(ctx, 39, 31, 2.5, '#ffd1ec');
      [[62, 27], [68, 36], [73, 24], [78, 42]].forEach(([x, y], i) => {
        poly(
          ctx,
          [[x, y], [x + 7, y - 4 + i], [x + 5, y + 3 + i], [x + 12, y - 1 + i]],
          null,
          'rgba(255,155,210,0.8)',
          1,
        );
      });
      box(ctx, 26, 62, 27, 4, '#b06a91');
      break;
    }
    case 'goldenRecord': {
      circle(ctx, 46, 44, 23, '#8a6b22', color, 2);
      circle(ctx, 46, 44, 19, '#e8be57');
      circle(ctx, 46, 44, 15, '#d6a93f', '#8a6b22', 0.8);
      for (let i = 0; i < 4; i += 1) {
        circle(ctx, 46, 44, 6 + i * 3.5, null, 'rgba(120,86,22,0.42)', 0.8);
      }
      circle(ctx, 46, 44, 3, '#3b2b0d');
      circle(ctx, 46, 44, 1.3, '#ffe89e');
      line(ctx, 62, 27, 73, 16, WHITE, 2);
      circle(ctx, 75, 13, 3, '#ffd66b');
      box(ctx, 66, 15, 1.3, 8, '#3b2b0d');
      [[22, 73], [31, 77], [66, 72], [76, 68]].forEach(([x, y]) => {
        box(ctx, x, y, 2, 2, 'rgba(255,214,107,0.55)');
      });
      break;
    }
    default: {
      box(ctx, 31, 31, 34, 34, color);
      circle(ctx, 48, 48, 9, INK, accent, 1);
      line(ctx, 48, 32, 48, 64, accent, 1);
      line(ctx, 32, 48, 64, 48, accent, 1);
    }
  }
}

function drawBadge(ctx, component) {
  const accent = component.accent;
  const color = component.color || accent;

  ctx.clearRect(0, 0, GRID, GRID);

  // Soft halo behind the card.
  const halo = ctx.createRadialGradient(48, 47, 8, 48, 47, 47);
  halo.addColorStop(0, component.accentSoft);
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, GRID, GRID);

  // Card body, inner bevel, and accent frame.
  roundedRect(ctx, 3, 3, 90, 90, 8);
  ctx.fillStyle = 'rgba(3, 10, 18, 0.95)';
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.stroke();

  roundedRect(ctx, 5.5, 5.5, 85, 85, 6);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Header band.
  box(ctx, 6, 6, 84, 11, 'rgba(255,255,255,0.035)');
  box(ctx, 6, 16, 84, 0.7, accent);
  box(ctx, 8, 9, 2.5, 2.5, accent);
  ctx.fillStyle = accent;
  ctx.font = '600 5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${component.missionCode} · ${component.missionEra}`, 14, 12);

  drawGlyph(ctx, component);

  // Footer plate with the short label.
  box(ctx, 6, 77, 84, 13, 'rgba(255,255,255,0.035)');
  box(ctx, 6, 77, 84, 0.6, 'rgba(255,255,255,0.1)');
  ctx.fillStyle = color;
  ctx.font = '600 5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(component.short.toUpperCase(), 48, 84);
  ctx.textAlign = 'left';

  // Corner ticks read like an inventory tag.
  [
    [6, 6, 1, 1],
    [90, 6, -1, 1],
    [6, 90, 1, -1],
    [90, 90, -1, -1],
  ].forEach(([x, y, dx, dy]) => {
    line(ctx, x, y, x + dx * 5, y, accent, 1);
    line(ctx, x, y, x, y + dy * 5, accent, 1);
  });
}

export function createComponentSpriteTexture(component) {
  const canvas = document.createElement('canvas');
  canvas.width = GRID * SCALE;
  canvas.height = GRID * SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to create a 2D canvas for a component sprite.');

  ctx.save();
  ctx.scale(SCALE, SCALE);
  drawBadge(ctx, component);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

export function disposeComponentSpriteTexture(texture) {
  if (texture) texture.dispose();
}
