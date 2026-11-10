import * as THREE from 'three';

const ROOM_DEPTH = 22;
const ROOM_HALF_WIDTH = 9;
const DOOR_HALF_WIDTH = 2.05;

function createLaunchDisplayTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create the firing-room launch display.');

  const sky = context.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#020917');
  sky.addColorStop(0.62, '#0b2440');
  sky.addColorStop(1, '#152b3a');
  context.fillStyle = sky;
  context.fillRect(0, 0, canvas.width, canvas.height);

  let seed = 41;
  for (let star = 0; star < 180; star += 1) {
    seed = (seed * 16807) % 2147483647;
    const x = (seed / 2147483647) * canvas.width;
    seed = (seed * 16807) % 2147483647;
    const y = (seed / 2147483647) * canvas.height * 0.72;
    context.fillStyle = `rgba(190, 225, 255, ${0.22 + (star % 5) * 0.1})`;
    context.fillRect(x, y, star % 9 === 0 ? 3 : 1.5, star % 9 === 0 ? 3 : 1.5);
  }

  const horizon = 390;
  const earth = context.createLinearGradient(0, horizon, 0, canvas.height);
  earth.addColorStop(0, '#293c4c');
  earth.addColorStop(0.16, '#172b39');
  earth.addColorStop(1, '#090e18');
  context.fillStyle = earth;
  context.fillRect(0, horizon, canvas.width, canvas.height - horizon);

  const glow = context.createRadialGradient(512, 335, 2, 512, 335, 200);
  glow.addColorStop(0, 'rgba(255,255,225,0.98)');
  glow.addColorStop(0.1, 'rgba(255,194,88,0.88)');
  glow.addColorStop(0.42, 'rgba(255,128,45,0.28)');
  glow.addColorStop(1, 'rgba(255,128,45,0)');
  context.fillStyle = glow;
  context.fillRect(300, 160, 424, 290);

  context.fillStyle = '#d9e7ee';
  context.beginPath();
  context.moveTo(500, 372);
  context.lineTo(507, 335);
  context.lineTo(510, 305);
  context.lineTo(512, 282);
  context.lineTo(514, 305);
  context.lineTo(517, 335);
  context.lineTo(524, 372);
  context.closePath();
  context.fill();
  context.fillStyle = '#fff6c9';
  context.fillRect(509, 352, 6, 70);
  context.fillStyle = 'rgba(255,222,164,0.62)';
  context.beginPath();
  context.moveTo(509, 372);
  context.lineTo(515, 372);
  context.lineTo(552, 436);
  context.lineTo(470, 436);
  context.closePath();
  context.fill();

  for (let puff = 0; puff < 22; puff += 1) {
    const x = 340 + puff * 16;
    const y = horizon + Math.sin(puff * 1.7) * 16;
    const radius = 18 + (puff % 5) * 7;
    context.fillStyle = `rgba(207, 212, 207, ${0.12 + (puff % 4) * 0.045})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = 'rgba(2, 9, 18, 0.9)';
  context.fillRect(0, 0, canvas.width, 62);
  context.fillStyle = '#7ce4ff';
  context.font = 'bold 22px Arial, sans-serif';
  context.fillText('NOVAQUEST LAUNCH NETWORK  /  LIVE MISSION FEED', 32, 39);
  context.fillStyle = '#dcecf4';
  context.font = 'bold 19px Arial, sans-serif';
  context.fillText('T − 00:00:12', 810, 39);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createNasaHeadquartersFiringRoom() {
  const root = new THREE.Group();
  root.name = 'NasaHeadquartersFiringRoom';
  root.position.z = 54;

  const materials = {
    wall: new THREE.MeshStandardMaterial({ color: 0x121e2c, roughness: 0.64, metalness: 0.42 }),
    wallPanel: new THREE.MeshStandardMaterial({ color: 0x1d2c3b, roughness: 0.54, metalness: 0.48 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x111a22, roughness: 0.38, metalness: 0.72 }),
    trim: new THREE.MeshStandardMaterial({ color: 0x637581, roughness: 0.42, metalness: 0.62 }),
    floor: new THREE.MeshStandardMaterial({ color: 0x303a43, roughness: 0.34, metalness: 0.42 }),
    console: new THREE.MeshStandardMaterial({ color: 0x121d28, roughness: 0.38, metalness: 0.68 }),
    screen: new THREE.MeshBasicMaterial({ color: 0x0b2438, toneMapped: false }),
    cyan: new THREE.MeshBasicMaterial({ color: 0x58ddff, toneMapped: false }),
    softLight: new THREE.MeshBasicMaterial({ color: 0xc3eeff, toneMapped: false }),
    launch: new THREE.MeshBasicMaterial({
      map: createLaunchDisplayTexture(),
      toneMapped: false,
    }),
  };
  const interactionTargets = [];
  const doorPanels = [];
  let doorTarget = 0;
  let doorOpenAmount = 0;

  const addBox = (parent, width, height, depth, material, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };

  const makeMonitorTexture = (stationIndex, screenIndex) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 160;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to create a firing-room monitor.');
    context.fillStyle = '#061321';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#16435b';
    context.lineWidth = 1;
    for (let y = 18; y < 150; y += 22) {
      context.beginPath();
      context.moveTo(8, y);
      context.lineTo(248, y);
      context.stroke();
    }
    context.fillStyle = '#64dbff';
    context.font = 'bold 13px Arial, sans-serif';
    context.fillText(['FLIGHT', 'TELEMETRY', 'SYSTEMS'][screenIndex % 3], 12, 19);
    context.strokeStyle = screenIndex % 2 === 0 ? '#66dcff' : '#f5bc63';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(12, 96);
    for (let x = 20; x < 246; x += 16) {
      const y = 70 + ((x * 7 + stationIndex * 13 + screenIndex * 19) % 50);
      context.lineTo(x, y);
    }
    context.stroke();
    context.fillStyle = '#b7d8e6';
    context.font = '10px monospace';
    context.fillText(`SYS 0${stationIndex + 1}  /  NOMINAL`, 12, 145);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  addBox(root, ROOM_HALF_WIDTH * 2, 0.22, ROOM_DEPTH, materials.floor, 0, -0.11, ROOM_DEPTH / 2);
  addBox(root, ROOM_HALF_WIDTH * 2, 0.3, ROOM_DEPTH, materials.wall, 0, 7.35, ROOM_DEPTH / 2);
  addBox(root, 0.32, 7.3, ROOM_DEPTH, materials.wall, -ROOM_HALF_WIDTH, 3.55, ROOM_DEPTH / 2);
  addBox(root, 0.32, 7.3, ROOM_DEPTH, materials.wall, ROOM_HALF_WIDTH, 3.55, ROOM_DEPTH / 2);

  [-1, 1].forEach((side) => {
    addBox(root, ROOM_HALF_WIDTH - DOOR_HALF_WIDTH, 6.75, 0.36, materials.wall, side * (ROOM_HALF_WIDTH + DOOR_HALF_WIDTH) / 2, 3.35, -0.08);
    addBox(root, ROOM_HALF_WIDTH * 2, 0.35, 0.38, materials.wall, 0, 7.27, -0.08);
    addBox(root, 0.16, 5.55, 0.3, materials.trim, side * 2.14, 2.9, 0.02);
    addBox(root, 0.08, 5.1, 0.12, materials.cyan, side * 2.02, 2.9, 0.12);
  });

  addBox(root, 0.22, 7.1, ROOM_HALF_WIDTH * 2, materials.wall, 0, 3.55, ROOM_DEPTH);
  addBox(root, 15.8, 6.8, 0.24, materials.frame, 0, 4.08, ROOM_DEPTH - 0.22);
  addBox(root, 14.9, 5.9, 0.12, materials.screen, 0, 4.1, ROOM_DEPTH - 0.38);
  const launchDisplay = new THREE.Mesh(
    new THREE.PlaneGeometry(14.55, 5.55),
    materials.launch,
  );
  launchDisplay.rotation.y = Math.PI;
  launchDisplay.position.set(0, 4.1, ROOM_DEPTH - 0.32);
  root.add(launchDisplay);
  addBox(root, 14.7, 0.07, 0.08, materials.cyan, 0, 7.04, ROOM_DEPTH - 0.3);
  addBox(root, 14.7, 0.07, 0.08, materials.cyan, 0, 1.16, ROOM_DEPTH - 0.3);

  addBox(root, 10.4, 0.06, 0.045, materials.cyan, 0, 6.85, ROOM_DEPTH - 0.55);
  addBox(root, 10.4, 0.58, 0.12, materials.frame, 0, 6.46, ROOM_DEPTH - 0.54);
  addBox(root, 10.1, 0.35, 0.04, materials.screen, 0, 6.47, ROOM_DEPTH - 0.45);

  for (let i = 0; i < 10; i += 1) {
    const flag = addBox(root, 0.15, 0.09, 0.025, i % 2 === 0 ? materials.cyan : materials.softLight, -4.65 + i * 1.03, 6.47, ROOM_DEPTH - 0.4);
    flag.rotation.z = (i % 3 - 1) * 0.08;
  }

  [-1, 1].forEach((side) => {
    addBox(root, 0.08, 0.03, ROOM_DEPTH - 1, materials.cyan, side * 8.25, 0.035, ROOM_DEPTH / 2);
    addBox(root, 0.08, 0.08, ROOM_DEPTH - 1, materials.trim, side * 8.2, 3.8, ROOM_DEPTH / 2);
    for (let z = 4; z < ROOM_DEPTH - 1; z += 4) {
      addBox(root, 0.18, 5.9, 0.24, materials.trim, side * 8.22, 3.55, z);
      addBox(root, 0.12, 0.15, 0.38, materials.cyan, side * 8.08, 5.95, z);
    }
  });

  for (let station = 0; station < 3; station += 1) {
    const z = 7 + station * 5;
    const width = station === 1 ? 5.8 : 4.3;
    const desk = new THREE.Group();
    desk.position.set(0, 0, z);
    root.add(desk);
    addBox(desk, width, 0.22, 1.55, materials.console, 0, 1.2, 0);
    addBox(desk, width - 0.22, 0.07, 1.34, materials.trim, 0, 1.34, 0);
    addBox(desk, width - 0.45, 0.035, 1.1, materials.frame, 0, 1.395, 0);
    addBox(desk, width - 0.6, 0.035, 0.055, materials.cyan, 0, 1.42, -0.48);
    [-1, 1].forEach((legSide) => {
      addBox(desk, 0.2, 1.08, 1.25, materials.console, legSide * (width / 2 - 0.35), 0.63, 0);
    });

    const monitorCount = station === 1 ? 4 : 3;
    for (let monitor = 0; monitor < monitorCount; monitor += 1) {
      const x = (monitor - (monitorCount - 1) / 2) * 1.18;
      const screenMaterial = new THREE.MeshBasicMaterial({
        map: makeMonitorTexture(station, monitor),
        toneMapped: false,
      });
      addBox(desk, 1.08, 0.76, 0.09, materials.frame, x, 2.0, 0.15);
      const display = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.61), screenMaterial);
      display.rotation.y = Math.PI;
      display.position.set(x, 2.0, 0.2);
      desk.add(display);
      addBox(desk, 0.08, 0.42, 0.08, materials.trim, x, 1.58, 0.15);
      addBox(desk, 0.52, 0.06, 0.08, materials.trim, x, 1.42, 0.15);
    }

    [-width * 0.32, 0, width * 0.32].forEach((seatX, seatIndex) => {
      const chair = new THREE.Group();
      chair.position.set(seatX, 0, z - 1.45);
      root.add(chair);
      addBox(chair, 0.82, 0.16, 0.72, materials.console, 0, 0.62, 0);
      addBox(chair, 0.82, 0.82, 0.16, materials.console, 0, 1.06, -0.28);
      addBox(chair, 0.22, 0.54, 0.22, materials.trim, 0, 0.3, 0);
      addBox(chair, 0.72, 0.08, 0.62, materials.frame, 0, 0.08, 0);
      if (seatIndex === 1) {
        addBox(chair, 0.18, 0.045, 0.045, materials.cyan, 0, 1.32, -0.19);
      }
    });
  }

  [-5.8, 5.8].forEach((x) => {
    const sideLight = new THREE.PointLight(0x64cfff, 18, 12, 2);
    sideLight.position.set(x, 5.9, 11);
    root.add(sideLight);
  });
  const screenLight = new THREE.PointLight(0x478dff, 24, 15, 2);
  screenLight.position.set(0, 4.2, 18.5);
  root.add(screenLight);
  for (let z = 4; z < ROOM_DEPTH - 2; z += 5) {
    addBox(root, 2.8, 0.08, 0.65, materials.softLight, 0, 7.12, z);
    [-1.6, 1.6].forEach((x) => addBox(root, 0.08, 0.05, 0.78, materials.cyan, x, 7.1, z));
  }

  const doorControl = {
    hitTarget: null,
    setOpen(open) {
      doorTarget = open ? 1 : 0;
    },
    isOpen() {
      return doorTarget > 0.5;
    },
    toggle() {
      doorControl.setOpen(!doorControl.isOpen());
    },
  };

  const doorFrame = new THREE.Group();
  doorFrame.userData.noCollision = true;
  doorFrame.position.z = 0.05;
  root.add(doorFrame);
  [-1, 1].forEach((side) => {
    const panel = new THREE.Group();
    panel.userData.noCollision = true;
    panel.position.set(side * 0.94, 2.82, 0);
    doorFrame.add(panel);
    doorPanels.push({ panel, side });

    addBox(panel, 1.88, 4.7, 0.18, materials.frame, 0, 0, 0);
    addBox(panel, 1.6, 4.38, 0.08, materials.wallPanel, 0, 0, -0.13);
    [-0.69, 0.69].forEach((x) => {
      addBox(panel, 0.05, 4.08, 0.045, materials.trim, x, 0, -0.19);
      addBox(panel, 0.025, 3.78, 0.025, materials.cyan, x + (x < 0 ? 0.05 : -0.05), 0, -0.22);
    });
    [-1.72, 1.72].forEach((y) => {
      addBox(panel, 1.45, 0.055, 0.04, materials.trim, 0, y, -0.19);
    });
    addBox(panel, 0.08, 3.9, 0.08, materials.trim, -side * 0.72, 0, -0.24);
    addBox(panel, 0.09, 0.44, 0.08, materials.cyan, -side * 0.72, 0, -0.29);
  });

  const hitTarget = new THREE.Mesh(
    new THREE.PlaneGeometry(DOOR_HALF_WIDTH * 2, 5.3),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      colorWrite: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  hitTarget.position.set(0, 2.75, -0.16);
  root.add(hitTarget);
  doorControl.hitTarget = hitTarget;
  interactionTargets.push({ target: hitTarget, toggle: doorControl.toggle });

  return {
    root,
    entryZ: 54,
    depth: ROOM_DEPTH,
    halfWidth: ROOM_HALF_WIDTH,
    openingHalfWidth: DOOR_HALF_WIDTH,
    door: doorControl,
    interactionTargets,
    update: (delta) => {
      doorOpenAmount += (doorTarget - doorOpenAmount) * Math.min(1, delta * 4.5);
      doorPanels.forEach(({ panel, side }) => {
        panel.position.x = side * (0.94 + doorOpenAmount * 2.05);
        panel.position.z = -doorOpenAmount * 0.12;
      });
    },
  };
}
