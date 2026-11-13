import * as THREE from 'three';
import { createAtlasCentaurVehicle } from '../components/gameplay/three/AtlasCentaurLaunchVehicle';

const ROOM_DEPTH = 22;
const ROOM_HALF_WIDTH = 9;
const DOOR_HALF_WIDTH = 2.05;

/**
 * Creates the 3D Medium-Poly Atlas-Centaur Launch Simulation Scene
 * Rendered directly onto the firing room's main screen via WebGLRenderTarget.
 */
function createLaunchSubScene() {
  const launchScene = new THREE.Scene();
  launchScene.background = new THREE.Color(0x020817);

  // Dedicated tracking camera for the screen feed
  const launchCamera = new THREE.PerspectiveCamera(46, 1024 / 512, 0.2, 800);
  launchCamera.position.set(0, 7.5, 36);
  launchCamera.lookAt(0, 11, 0);

  // Lighting for the launch environment
  const ambientLight = new THREE.AmbientLight(0x1a2e4a, 1.2);
  launchScene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfff1dc, 2.8);
  sunLight.position.set(28, 45, 30);
  launchScene.add(sunLight);

  const padSpotlight = new THREE.SpotLight(0xa5e5ff, 6, 65, Math.PI / 4, 0.4);
  padSpotlight.position.set(-16, 26, 20);
  padSpotlight.target.position.set(0, 10, 0);
  launchScene.add(padSpotlight);
  launchScene.add(padSpotlight.target);

  // Background Starfield & Atmosphere Dome
  const starGeo = new THREE.BufferGeometry();
  const starCount = 220;
  const starPositions = new Float32Array(starCount * 3);
  let seed = 47;
  for (let i = 0; i < starCount; i += 1) {
    seed = (seed * 16807) % 2147483647;
    const x = ((seed / 2147483647) - 0.5) * 260;
    seed = (seed * 16807) % 2147483647;
    const y = 8 + (seed / 2147483647) * 180;
    seed = (seed * 16807) % 2147483647;
    const z = -40 - (seed / 2147483647) * 120;
    starPositions[i * 3] = x;
    starPositions[i * 3 + 1] = y;
    starPositions[i * 3 + 2] = z;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xcae8ff,
    size: 1.8,
    transparent: true,
    opacity: 0.9,
  });
  const starPoints = new THREE.Points(starGeo, starMat);
  launchScene.add(starPoints);

  // Florida Cape Kennedy Coastal Landscape & Atlantic Ocean Horizon
  const groundGeo = new THREE.PlaneGeometry(320, 220);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x14212e,
    roughness: 0.85,
    metalness: 0.2,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, -40);
  launchScene.add(ground);

  // Launch Complex 36B Concrete Mount & Flame Exhaust Trench
  const padMountGeo = new THREE.BoxGeometry(22, 1.8, 22);
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x223242,
    roughness: 0.7,
    metalness: 0.4,
  });
  const padMount = new THREE.Mesh(padMountGeo, padMat);
  padMount.position.set(0, 0.9, 0);
  launchScene.add(padMount);

  // Red & Gray Steel Umbilical Service Gantry Tower (Pad 36B)
  const towerGroup = new THREE.Group();
  towerGroup.position.set(4.6, 0, 0);
  launchScene.add(towerGroup);

  const towerColMat = new THREE.MeshStandardMaterial({ color: 0xbb3028, roughness: 0.5 });
  const towerLatticeMat = new THREE.MeshStandardMaterial({ color: 0x8a9ba8, roughness: 0.6 });

  // 4 Main Gantry Vertical Columns
  [-1.2, 1.2].forEach((tx) => {
    [-1.2, 1.2].forEach((tz) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.3, 30, 0.3), towerColMat);
      col.position.set(tx, 15, tz);
      towerGroup.add(col);
    });
  });

  // Cross Bracing along Tower
  for (let ty = 3; ty < 29; ty += 3.5) {
    const ring = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.22, 2.7), towerLatticeMat);
    ring.position.set(0, ty, 0);
    towerGroup.add(ring);
  }

  // Swing Arms connecting to Atlas & Centaur stages
  const arm1 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.28, 0.4), towerLatticeMat);
  arm1.position.set(-1.8, 11, 0);
  towerGroup.add(arm1);

  const arm2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.28, 0.4), towerLatticeMat);
  arm2.position.set(-1.8, 20.5, 0);
  towerGroup.add(arm2);

  // =========================================================================
  // Medium-Poly 3D Atlas-Centaur Launch Vehicle
  // =========================================================================
  const vehicle = createAtlasCentaurVehicle();
  const rocketGroup = new THREE.Group();
  rocketGroup.position.set(0, 1.8, 0);
  rocketGroup.add(vehicle.root);
  launchScene.add(rocketGroup);

  // Billowing Launch Smoke & Exhaust Cloud Particles
  const smokePuffs = [];
  const smokeGeo = new THREE.SphereGeometry(1.6, 8, 8);
  const smokeMat = new THREE.MeshStandardMaterial({
    color: 0xd4e2ec,
    transparent: true,
    opacity: 0,
    roughness: 0.95,
  });

  for (let i = 0; i < 32; i += 1) {
    const puff = new THREE.Mesh(smokeGeo, smokeMat.clone());
    puff.position.set(
      (Math.random() - 0.5) * 14,
      1.2 + Math.random() * 2.5,
      (Math.random() - 0.5) * 14,
    );
    puff.userData = {
      baseX: puff.position.x,
      baseY: puff.position.y,
      baseZ: puff.position.z,
      speedX: (Math.random() - 0.5) * 7,
      speedY: 1.5 + Math.random() * 4,
      speedZ: (Math.random() - 0.5) * 7,
      growth: 1.2 + Math.random() * 2.2,
      opacity: 0,
    };
    launchScene.add(puff);
    smokePuffs.push(puff);
  }

  // Render Target for screen output (1024x512)
  const renderTarget = new THREE.WebGLRenderTarget(1024, 512, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });

  // 2D Live Telemetry HUD Overlay
  const hudCanvas = document.createElement('canvas');
  hudCanvas.width = 1024;
  hudCanvas.height = 512;
  const hudCtx = hudCanvas.getContext('2d');
  const hudTexture = new THREE.CanvasTexture(hudCanvas);
  hudTexture.colorSpace = THREE.SRGBColorSpace;

  const hudScene = new THREE.Scene();
  const hudCamera = new THREE.OrthographicCamera(-512, 512, 256, -256, 0.1, 10);
  hudCamera.position.z = 1;
  const hudPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1024, 512),
    new THREE.MeshBasicMaterial({ map: hudTexture, transparent: true }),
  );
  hudScene.add(hudPlane);

  return {
    launchScene,
    launchCamera,
    rocketGroup,
    vehicle,
    smokePuffs,
    renderTarget,
    hudCanvas,
    hudCtx,
    hudTexture,
    hudScene,
    hudCamera,
  };
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
    launch: null, // Initialized with render target below
  };

  const interactionTargets = [];
  const doorPanels = [];
  let doorTarget = 0;
  let doorOpenAmount = 0;

  // Set up 3D Medium-Poly Launch Simulation
  const subSceneData = createLaunchSubScene();
  materials.launch = new THREE.MeshBasicMaterial({
    map: subSceneData.renderTarget.texture,
    toneMapped: false,
  });

  const addBox = (parent, width, height, depth, material, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };

  const monitorMeshes = [];
  const makeMonitorTexture = (stationIndex, screenIndex, isAlert = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 160;
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.fillStyle = isAlert ? '#1a0508' : '#061321';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = isAlert ? '#5a1018' : '#16435b';
    context.lineWidth = 1;
    for (let y = 18; y < 150; y += 22) {
      context.beginPath();
      context.moveTo(8, y);
      context.lineTo(248, y);
      context.stroke();
    }

    context.fillStyle = isAlert ? '#ff5060' : '#64dbff';
    context.font = 'bold 13px Arial, sans-serif';
    context.fillText(
      isAlert ? 'CRITICAL ALERT' : ['FLIGHT', 'TELEMETRY', 'SYSTEMS'][screenIndex % 3],
      12,
      19,
    );

    context.strokeStyle = isAlert ? '#ff3344' : screenIndex % 2 === 0 ? '#66dcff' : '#f5bc63';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(12, 96);
    for (let x = 20; x < 246; x += 16) {
      const y = isAlert
        ? 80 + Math.sin(x * 0.2) * 28
        : 70 + ((x * 7 + stationIndex * 13 + screenIndex * 19) % 50);
      context.lineTo(x, y);
    }
    context.stroke();

    context.fillStyle = isAlert ? '#ffb0b8' : '#b7d8e6';
    context.font = '10px monospace';
    context.fillText(isAlert ? 'HELIUM LEAK · 280 PSI' : `SYS 0${stationIndex + 1}  /  NOMINAL`, 12, 145);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // Base Room Architecture
  addBox(root, ROOM_HALF_WIDTH * 2, 0.22, ROOM_DEPTH, materials.floor, 0, -0.11, ROOM_DEPTH / 2);
  addBox(root, ROOM_HALF_WIDTH * 2, 0.3, ROOM_DEPTH, materials.wall, 0, 7.35, ROOM_DEPTH / 2);
  addBox(root, 0.32, 7.3, ROOM_DEPTH, materials.wall, -ROOM_HALF_WIDTH, 3.55, ROOM_DEPTH / 2);
  addBox(root, 0.32, 7.3, ROOM_DEPTH, materials.wall, ROOM_HALF_WIDTH, 3.55, ROOM_DEPTH / 2);

  [-1, 1].forEach((side) => {
    addBox(
      root,
      ROOM_HALF_WIDTH - DOOR_HALF_WIDTH,
      6.75,
      0.36,
      materials.wall,
      (side * (ROOM_HALF_WIDTH + DOOR_HALF_WIDTH)) / 2,
      3.35,
      -0.08,
    );
    addBox(root, 0.16, 5.55, 0.3, materials.trim, side * 2.14, 2.9, 0.02);
    addBox(root, 0.08, 5.1, 0.12, materials.cyan, side * 2.02, 2.9, 0.12);
  });
  addBox(root, ROOM_HALF_WIDTH * 2, 0.35, 0.38, materials.wall, 0, 7.27, -0.08);

  // Big Screen Bezel at the far end of the room (NO opaque screen box — the live feed replaces it)
  addBox(root, ROOM_HALF_WIDTH * 2, 7.1, 0.22, materials.wall, 0, 3.55, ROOM_DEPTH);
  // Outer frame bezel (thick dark border around the display)
  addBox(root, 15.8, 6.8, 0.24, materials.frame, 0, 4.08, ROOM_DEPTH - 0.22);
  // Inner border strips (left, right, top, bottom) to create a bezel effect
  addBox(root, 0.52, 5.9, 0.08, materials.frame, -7.6, 4.1, ROOM_DEPTH - 0.33);
  addBox(root, 0.52, 5.9, 0.08, materials.frame, 7.6, 4.1, ROOM_DEPTH - 0.33);
  addBox(root, 14.7, 0.5, 0.08, materials.frame, 0, 7.05, ROOM_DEPTH - 0.33);
  addBox(root, 14.7, 0.5, 0.08, materials.frame, 0, 1.15, ROOM_DEPTH - 0.33);

  // ── SINGLE LAUNCH DISPLAY SCREEN ──────────────────────────────────────────
  // PlaneGeometry facing -Z (toward player in firing room)
  const screenGeo = new THREE.PlaneGeometry(14.56, 5.56);
  // Invert UV.x so that with rotation.y = Math.PI, texture reads correctly (not mirrored)
  const uvs = screenGeo.attributes.uv;
  for (let i = 0; i < uvs.count; i += 1) {
    uvs.setX(i, 1 - uvs.getX(i));
  }
  uvs.needsUpdate = true;

  const launchDisplay = new THREE.Mesh(
    screenGeo,
    materials.launch,
  );
  launchDisplay.rotation.y = Math.PI;
  launchDisplay.position.set(0, 4.1, ROOM_DEPTH - 0.40);
  root.add(launchDisplay);

  // Thin emissive blue frame around the screen to match current UI style
  const hw = 14.56 / 2;
  const hh = 5.56 / 2;
  const screenFrameGeo = new THREE.BufferGeometry();
  const framePoints = new Float32Array([
    -hw, -hh, 0,  hw, -hh, 0,
     hw, -hh, 0,  hw,  hh, 0,
     hw,  hh, 0, -hw,  hh, 0,
    -hw,  hh, 0, -hw, -hh, 0,
  ]);
  screenFrameGeo.setAttribute('position', new THREE.BufferAttribute(framePoints, 3));
  const screenFrameMat = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    linewidth: 2,
    toneMapped: false,
  });
  const screenFrame = new THREE.LineSegments(screenFrameGeo, screenFrameMat);
  screenFrame.position.set(0, 4.1, ROOM_DEPTH - 0.28);
  root.add(screenFrame);

  // Emissive 3D blue frame border mesh
  const emissiveBlueMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x0099ff,
    emissiveIntensity: 1.2,
    roughness: 0.2,
    metalness: 0.8,
  });
  addBox(root, 14.62, 0.05, 0.05, emissiveBlueMat, 0, 4.1 + hh, ROOM_DEPTH - 0.27);
  addBox(root, 14.62, 0.05, 0.05, emissiveBlueMat, 0, 4.1 - hh, ROOM_DEPTH - 0.27);
  addBox(root, 0.05, 5.62, 0.05, emissiveBlueMat, -hw, 4.1, ROOM_DEPTH - 0.27);
  addBox(root, 0.05, 5.62, 0.05, emissiveBlueMat, hw, 4.1, ROOM_DEPTH - 0.27);
  // ──────────────────────────────────────────────────────────────────────────

  // Cyan accent trim strips framing the screen
  addBox(root, 14.7, 0.07, 0.08, materials.cyan, 0, 7.04, ROOM_DEPTH - 0.28);
  addBox(root, 14.7, 0.07, 0.08, materials.cyan, 0, 1.16, ROOM_DEPTH - 0.28);
  addBox(root, 0.07, 5.9, 0.08, materials.cyan, -7.33, 4.1, ROOM_DEPTH - 0.28);
  addBox(root, 0.07, 5.9, 0.08, materials.cyan, 7.33, 4.1, ROOM_DEPTH - 0.28);

  // Small indicator flags along the top of the screen bezel
  for (let i = 0; i < 10; i += 1) {
    const flag = addBox(
      root,
      0.15,
      0.09,
      0.025,
      i % 2 === 0 ? materials.cyan : materials.softLight,
      -4.65 + i * 1.03,
      6.47,
      ROOM_DEPTH - 0.22,
    );
    flag.rotation.z = ((i % 3) - 1) * 0.08;
  }

  [-1, 1].forEach((side) => {
    addBox(root, 0.08, 0.03, ROOM_DEPTH - 1, materials.cyan, side * 8.25, 0.035, ROOM_DEPTH / 2);
    addBox(root, 0.08, 0.08, ROOM_DEPTH - 1, materials.trim, side * 8.2, 3.8, ROOM_DEPTH / 2);
    for (let z = 4; z < ROOM_DEPTH - 1; z += 4) {
      addBox(root, 0.18, 5.9, 0.24, materials.trim, side * 8.22, 3.55, z);
      addBox(root, 0.12, 0.15, 0.38, materials.cyan, side * 8.08, 5.95, z);
    }
  });

  // Console Rows with Flight Control Monitors
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
      const normalTex = makeMonitorTexture(station, monitor, false);
      const alertTex = makeMonitorTexture(station, monitor, true);

      const screenMaterial = new THREE.MeshBasicMaterial({
        map: normalTex,
        toneMapped: false,
      });

      addBox(desk, 1.08, 0.76, 0.09, materials.frame, x, 2.0, 0.15);
      const display = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.61), screenMaterial);
      display.rotation.y = Math.PI;
      display.position.set(x, 2.0, 0.095);
      desk.add(display);

      monitorMeshes.push({ display, normalTex, alertTex });

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

  // Interactive Flight Director Launch Console
  const launchConsole = new THREE.Group();
  launchConsole.position.set(0, 0, ROOM_DEPTH - 2.15);
  root.add(launchConsole);

  addBox(launchConsole, 2.7, 1.05, 1.0, materials.console, 0, 0.55, 0);
  addBox(launchConsole, 2.52, 0.09, 0.88, materials.trim, 0, 1.12, 0);
  addBox(launchConsole, 2.18, 0.035, 0.06, materials.cyan, 0, 1.18, -0.32);
  addBox(launchConsole, 0.9, 0.04, 0.28, materials.screen, 0, 1.17, 0.16);

  const launchButton = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.19, 0.09, 20),
    new THREE.MeshBasicMaterial({ color: 0xffc36b, toneMapped: false }),
  );
  launchButton.position.set(0, 1.2, 0.16);
  launchConsole.add(launchButton);

  const launchButtonRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.27, 0.02, 6, 36),
    materials.cyan,
  );
  launchButtonRing.rotation.x = Math.PI / 2;
  launchButtonRing.position.set(0, 1.19, 0.16);
  launchConsole.add(launchButtonRing);

  const launchConsoleLight = new THREE.PointLight(0xffb75e, 9, 6, 2);
  launchConsoleLight.position.set(0, 1.65, 0.3);
  launchConsole.add(launchConsoleLight);

  const launchHitTarget = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 2.5, 1.9),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      colorWrite: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  launchHitTarget.position.set(0, 1.35, ROOM_DEPTH - 2.15);
  launchHitTarget.userData.noCollision = true;
  root.add(launchHitTarget);
  interactionTargets.push({ target: launchHitTarget, action: 'launch' });

  // Lighting Architecture
  const sideLights = [];
  [-5.8, 5.8].forEach((x) => {
    const sideLight = new THREE.PointLight(0x64cfff, 18, 12, 2);
    sideLight.position.set(x, 5.9, 11);
    root.add(sideLight);
    sideLights.push(sideLight);
  });

  const screenLight = new THREE.PointLight(0x478dff, 24, 15, 2);
  screenLight.position.set(0, 4.2, 18.5);
  root.add(screenLight);

  // Red Emergency Lighting System
  const emergencyAmbient = new THREE.AmbientLight(0xff1122, 0);
  root.add(emergencyAmbient);

  const emergencyBeacon = new THREE.PointLight(0xff0020, 0, 32, 2);
  emergencyBeacon.position.set(0, 6.8, 11);
  root.add(emergencyBeacon);

  for (let z = 4; z < ROOM_DEPTH - 2; z += 5) {
    addBox(root, 2.8, 0.08, 0.65, materials.softLight, 0, 7.12, z);
    [-1.6, 1.6].forEach((x) => addBox(root, 0.08, 0.05, 0.78, materials.cyan, x, 7.1, z));
  }

  // Door Control
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

  // =========================================================================
  // Launch Sequence State Machine & Room Emergency Controller
  // =========================================================================
  let launchState = 'standby'; // 'standby' | 'countdown' | 'liftoff' | 'ascent' | 'staging' | 'emergency' | 'resolved'
  let launchTime = 0;
  let emergencyActive = false;
  let emergencyBlend = 0;
  let onEmergencyCallback = null;

  const startLaunch = () => {
    if (launchState !== 'standby') return;
    launchState = 'countdown';
    launchTime = 0;
  };

  const setEmergency = (active) => {
    emergencyActive = Boolean(active);
    if (!emergencyActive && launchState === 'emergency') {
      launchState = 'resolved';
    }
  };

  // Render loop update
  const update = (delta, elapsed, renderer) => {
    // 1. Sliding door animation
    doorOpenAmount += (doorTarget - doorOpenAmount) * Math.min(1, delta * 4.5);
    doorPanels.forEach(({ panel, side }) => {
      panel.position.x = side * (0.94 + doorOpenAmount * 2.05);
      panel.position.z = -doorOpenAmount * 0.12;
    });

    // 2. Launch sequence progression
    if (launchState !== 'standby') {
      launchTime += delta;
    }

    const {
      launchScene,
      launchCamera,
      rocketGroup,
      vehicle,
      smokePuffs,
      renderTarget,
      hudCtx,
      hudTexture,
      hudScene,
      hudCamera,
    } = subSceneData;

    let altitudeKm = 0;
    let velocityMs = 0;
    let clockText = 'T − 00:00:12';
    let statusText = 'PAD STANDBY';

    // State machine timeline
    if (launchState === 'countdown') {
      const remaining = Math.max(0, 3 - launchTime);
      clockText = `T − 00:00:0${Math.ceil(remaining)}`;
      statusText = 'FINAL COUNTDOWN';

      // Pad smoke venting
      smokePuffs.slice(0, 8).forEach((p, idx) => {
        p.material.opacity = Math.min(0.35, launchTime * 0.15);
        p.position.y = 1.2 + Math.sin(elapsed * 2 + idx) * 0.4;
      });

      if (launchTime >= 3.0) {
        launchState = 'liftoff';
        vehicle.staging.state = 'liftoff';
      }
    } else if (launchState === 'liftoff' || launchState === 'ascent' || launchState === 'staging' || launchState === 'emergency' || launchState === 'resolved') {
      const flightT = Math.max(0, launchTime - 3.0);
      const seconds = Math.floor(flightT);
      const secStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
      clockText = `T + 00:00:${secStr}`;

      // Physics acceleration profile
      if (flightT < 9.0) {
        // Initial powered liftoff through lower atmosphere
        launchState = 'liftoff';
        vehicle.staging.state = 'liftoff';
        const progress = flightT / 9.0;
        const rocketY = 1.8 + Math.pow(progress, 2.2) * 45;
        rocketGroup.position.y = rocketY;
        altitudeKm = Math.round(progress * 42);
        velocityMs = Math.round(progress * 1850);
        statusText = 'BOOSTER POWERED ASCENT';

        // Camera tracks the ascending rocket
        launchCamera.position.y = rocketY + 8.5;
        launchCamera.position.x = Math.sin(flightT * 0.25) * 36;
        launchCamera.position.z = Math.cos(flightT * 0.25) * 36;
        launchCamera.lookAt(0, rocketY + 14, 0);

        // Billowing plume smoke
        smokePuffs.forEach((puff, idx) => {
          puff.material.opacity = Math.max(0, 0.7 - (puff.position.y / 28));
          puff.position.x += puff.userData.speedX * delta;
          puff.position.y += puff.userData.speedY * delta;
          puff.position.z += puff.userData.speedZ * delta;
          const s = 1 + (puff.position.y / 6);
          puff.scale.set(s, s, s);
        });
      } else if (flightT < 15.0) {
        // Booster Staging (BECO - Atlas separation)
        launchState = 'staging';
        vehicle.staging.state = 'atlas_sep';
        const progress = (flightT - 9.0) / 6.0;
        const rocketY = 46.8 + progress * 65;
        rocketGroup.position.y = rocketY;
        altitudeKm = 42 + Math.round(progress * 68);
        velocityMs = 1850 + Math.round(progress * 3800);
        statusText = 'BECO · ATLAS STAGING CONFIRMED';

        launchCamera.position.y = rocketY + 7;
        launchCamera.position.x = 28;
        launchCamera.position.z = 24;
        launchCamera.lookAt(0, rocketY + 12, 0);
      } else if (flightT < 21.0) {
        // Centaur Burn & Fairing Separation
        vehicle.staging.state = flightT > 17.5 ? 'fairing_sep' : 'centaur_burn';
        const progress = (flightT - 15.0) / 6.0;
        const rocketY = 111.8 + progress * 75;
        rocketGroup.position.y = rocketY;
        altitudeKm = 110 + Math.round(progress * 75);
        velocityMs = 5650 + Math.round(progress * 5200);
        statusText = flightT > 17.5 ? 'FAIRING JETTISON · SURVEYOR 5 EXPOSED' : 'CENTAUR RL10 CRYOGENIC BURN';

        launchCamera.position.y = rocketY + 6;
        launchCamera.position.x = 22;
        launchCamera.position.z = 20;
        launchCamera.lookAt(0, rocketY + 11, 0);
      } else {
        // Anomaly / Trans-Lunar Injection
        if (launchState !== 'emergency' && launchState !== 'resolved') {
          launchState = 'emergency';
          setEmergency(true);
          if (onEmergencyCallback) onEmergencyCallback();
        }
        altitudeKm = 185;
        velocityMs = 10850;
        statusText = emergencyActive
          ? 'CRITICAL ALERT · HELIUM LEAK DETECTED (280 PSI)'
          : 'ANOMALY RESOLVED · DESCENT SEQUENCE GO';

        // Surveyor 5 orbital cruise shot
        vehicle.staging.state = 'surveyor_sep';
        const orbitY = 186.8 + Math.sin(elapsed * 1.5) * 1.2;
        rocketGroup.position.y = orbitY;
        launchCamera.position.set(12, orbitY + 3, 14);
        launchCamera.lookAt(0, orbitY + 8, 0);
      }

      vehicle.staging.update(delta, flightT);
    }

    // 3. Render 2D Live Telemetry HUD Overlay
    hudCtx.clearRect(0, 0, 1024, 512);

    // Header bar
    hudCtx.fillStyle = emergencyActive ? 'rgba(50, 8, 12, 0.95)' : 'rgba(2, 9, 18, 0.9)';
    hudCtx.fillRect(0, 0, 1024, 62);

    hudCtx.fillStyle = emergencyActive ? '#ff5566' : '#7ce4ff';
    hudCtx.font = 'bold 22px Arial, sans-serif';
    hudCtx.fillText(
      emergencyActive
        ? 'ALERT: IN-FLIGHT SYSTEM MALFUNCTION DETECTED'
        : 'NOVAQUEST LAUNCH NETWORK  /  LIVE MISSION FEED',
      32,
      39,
    );

    hudCtx.fillStyle = emergencyActive ? '#ffa0a0' : '#dcecf4';
    hudCtx.font = 'bold 19px Arial, sans-serif';
    hudCtx.fillText(clockText, 840, 39);

    // Bottom telemetry strip
    hudCtx.fillStyle = emergencyActive ? 'rgba(40, 6, 10, 0.85)' : 'rgba(2, 9, 18, 0.85)';
    hudCtx.fillRect(0, 460, 1024, 52);

    hudCtx.fillStyle = '#9fd2ee';
    hudCtx.font = 'bold 14px monospace';
    hudCtx.fillText(`ALT: ${altitudeKm} KM`, 32, 492);
    hudCtx.fillText(`VEL: ${velocityMs.toLocaleString()} M/S`, 260, 492);

    hudCtx.fillStyle = emergencyActive ? '#ff4444' : '#5ee7ff';
    hudCtx.fillText(`STATUS: ${statusText}`, 510, 492);

    // Big Emergency Flashing Banner when anomaly occurs
    if (emergencyActive && Math.sin(elapsed * 8) > -0.3) {
      hudCtx.strokeStyle = '#ff3344';
      hudCtx.lineWidth = 4;
      hudCtx.strokeRect(40, 90, 944, 90);

      hudCtx.fillStyle = 'rgba(220, 20, 30, 0.28)';
      hudCtx.fillRect(40, 90, 944, 90);

      hudCtx.fillStyle = '#ffffff';
      hudCtx.font = 'bold 26px Arial, sans-serif';
      hudCtx.textAlign = 'center';
      hudCtx.fillText(
        'CRITICAL IN-FLIGHT ANOMALY · HELIUM TANK PRESSURE: 280 PSI',
        512,
        132,
      );

      hudCtx.fillStyle = '#ffb0b0';
      hudCtx.font = 'bold 16px Arial, sans-serif';
      hudCtx.fillText(
        'DESCENT SYSTEM PRESSURIZATION LEAK · IMPROVISE EMERGENCY DESCENT PROCEDURE',
        512,
        160,
      );
      hudCtx.textAlign = 'left';
    } else if (launchState === 'resolved') {
      hudCtx.strokeStyle = '#22c55e';
      hudCtx.lineWidth = 4;
      hudCtx.strokeRect(40, 90, 944, 90);

      hudCtx.fillStyle = 'rgba(20, 80, 40, 0.35)';
      hudCtx.fillRect(40, 90, 944, 90);

      hudCtx.fillStyle = '#ffffff';
      hudCtx.font = 'bold 24px Arial, sans-serif';
      hudCtx.textAlign = 'center';
      hudCtx.fillText(
        'ANOMALY RESOLVED · DESCENT SYSTEM NOMINAL',
        512,
        132,
      );

      hudCtx.fillStyle = '#86efac';
      hudCtx.font = 'bold 16px Arial, sans-serif';
      hudCtx.fillText(
        'SURVEYOR 5 TOUCHDOWN CONFIRMED · MARE TRANQUILLITATIS',
        512,
        160,
      );
      hudCtx.textAlign = 'left';
    }

    hudTexture.needsUpdate = true;

    // Keep video texture actively updating frames
    if (launchDisplay.material?.map && launchDisplay.material.map !== subSceneData.renderTarget.texture) {
      launchDisplay.material.map.needsUpdate = true;
    }

    // 4. Render 3D Launch Scene + 2D HUD to WebGLRenderTarget
    if (renderer) {
      const currentTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(renderTarget);
      renderer.clear();
      renderer.render(launchScene, launchCamera);
      renderer.clearDepth();
      renderer.render(hudScene, hudCamera);
      renderer.setRenderTarget(currentTarget);
    }

    // 5. Emergency Red Room Lighting Hue Transition
    const targetBlend = emergencyActive ? 1.0 : 0.0;
    emergencyBlend += (targetBlend - emergencyBlend) * Math.min(1, delta * 3.5);

    if (emergencyBlend > 0.005) {
      // Wall and console cyan light strips -> Warning Red
      materials.cyan.color.lerpColors(
        new THREE.Color(0x58ddff),
        new THREE.Color(0xff1824),
        emergencyBlend,
      );

      // Ceiling softlights -> Crimson hue
      materials.softLight.color.lerpColors(
        new THREE.Color(0xc3eeff),
        new THREE.Color(0xff5566),
        emergencyBlend,
      );

      // Side point lights -> Deep pulsing red
      const redPulse = 0.75 + Math.sin(elapsed * 5.5) * 0.25;
      sideLights.forEach((light) => {
        light.color.lerpColors(
          new THREE.Color(0x64cfff),
          new THREE.Color(0xff1824),
          emergencyBlend,
        );
        light.intensity = THREE.MathUtils.lerp(18, 28 * redPulse, emergencyBlend);
      });

      // Screen light -> Dramatic red wash across desks and floor
      screenLight.color.lerpColors(
        new THREE.Color(0x478dff),
        new THREE.Color(0xff2222),
        emergencyBlend,
      );
      screenLight.intensity = THREE.MathUtils.lerp(24, 38 * redPulse, emergencyBlend);

      // Red emergency ambient fill light throughout the room
      emergencyAmbient.intensity = emergencyBlend * (0.85 + Math.sin(elapsed * 4) * 0.15);

      // Overhead flashing emergency beacon
      emergencyBeacon.intensity = emergencyBlend * (26 + Math.sin(elapsed * 7) * 16);

      // Switch monitor display textures to emergency alert
      if (emergencyBlend > 0.5) {
        monitorMeshes.forEach(({ display, alertTex }) => {
          if (display.material.map !== alertTex) {
            display.material.map = alertTex;
            display.material.needsUpdate = true;
          }
        });
      }
    } else {
      // Return to nominal cyan / blue atmosphere
      materials.cyan.color.setHex(0x58ddff);
      materials.softLight.color.setHex(0xc3eeff);
      sideLights.forEach((light) => {
        light.color.setHex(0x64cfff);
        light.intensity = 18;
      });
      screenLight.color.setHex(0x478dff);
      screenLight.intensity = 24;
      emergencyAmbient.intensity = 0;
      emergencyBeacon.intensity = 0;

      monitorMeshes.forEach(({ display, normalTex }) => {
        if (display.material.map !== normalTex) {
          display.material.map = normalTex;
          display.material.needsUpdate = true;
        }
      });
    }
  };

  return {
    root,
    entryZ: 54,
    depth: ROOM_DEPTH,
    halfWidth: ROOM_HALF_WIDTH,
    openingHalfWidth: DOOR_HALF_WIDTH,
    door: doorControl,
    interactionTargets,
    startLaunch,
    setEmergency,
    isEmergency: () => emergencyActive,
    setOnEmergencyTriggered: (cb) => {
      onEmergencyCallback = cb;
    },
    screenMesh: launchDisplay,
    setVideoTexture: (tex) => {
      if (!tex) return;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      launchDisplay.material = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      materials.launch = launchDisplay.material;
      launchDisplay.material.needsUpdate = true;
    },
    update,
  };
}
