import * as THREE from 'three';

/**
 * NasaOfficeModel.js
 * 
 * 1967 NASA Surveyor Project Headquarters / Mission Control Office
 * Features:
 * - Vintage linoleum floor & mid-century office walls
 * - IBM 7090-style mainframe tape computers with spinning magnetic reels
 * - CRT terminal monitors with green phosphor radar/telemetry displays
 * - Wall-mounted chalkboard with orbital trajectory equations and Surveyor schematics
 * - Vintage wooden drafting table, desk lamp, and Apollo mission clocks
 */
export function createNasaOfficeEnvironment() {
  const root = new THREE.Group();
  root.name = 'NasaHqOffice1967';

  // --- Materials ---
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0, // retro off-white / light cream
    roughness: 0.85
  });

  const woodPanelMat = new THREE.MeshStandardMaterial({
    color: 0x451a03, // 1960s dark mahogany wainscoting
    roughness: 0.6
  });

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // slate linoleum floor tiles
    roughness: 0.5,
    metalness: 0.1
  });

  const deskMat = new THREE.MeshStandardMaterial({
    color: 0x78350f, // warm oak drafting table
    roughness: 0.7
  });

  const computerMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b, // IBM slate-gray mainframe cabinet
    metalness: 0.6,
    roughness: 0.3
  });

  const tapeReelMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.8,
    roughness: 0.2
  });

  const crtGlowMat = new THREE.MeshBasicMaterial({
    color: 0x22c55e // green phosphor CRT terminal glow
  });

  // 1. Room Shell (Floor, Back Wall, Side Walls)
  // Floor
  const floorGeo = new THREE.PlaneGeometry(30, 24);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  root.add(floor);

  // Back Wall
  const backWallGeo = new THREE.PlaneGeometry(30, 10);
  const backWall = new THREE.Mesh(backWallGeo, wallMat);
  backWall.position.set(0, 5, -10);
  root.add(backWall);

  // Back Wall Wood Wainscoting (Lower 2.5 meters)
  const wainscotGeo = new THREE.PlaneGeometry(30, 2.5);
  const wainscot = new THREE.Mesh(wainscotGeo, woodPanelMat);
  wainscot.position.set(0, 1.25, -9.98);
  root.add(wainscot);

  // Side Wall Left
  const sideWallGeo = new THREE.PlaneGeometry(24, 10);
  const sideWallL = new THREE.Mesh(sideWallGeo, wallMat);
  sideWallL.rotation.y = Math.PI / 2;
  sideWallL.position.set(-15, 5, 2);
  root.add(sideWallL);

  // 2. Mainframe Tape Drive Computer Banks (Left side)
  const tapeReels = [];
  for (let c = 0; c < 3; c++) {
    const cabinetGeo = new THREE.BoxGeometry(2.2, 5.2, 1.4);
    const cabinet = new THREE.Mesh(cabinetGeo, computerMat);
    cabinet.position.set(-11 + c * 2.6, 2.6, -8.5);
    root.add(cabinet);

    // Front Window glass
    const glassGeo = new THREE.PlaneGeometry(1.8, 2.0);
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.8, transparent: true, opacity: 0.4 });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(-11 + c * 2.6, 3.4, -7.79);
    root.add(glass);

    // Two Magnetic Tape Reels inside
    for (let r = 0; r < 2; r++) {
      const reelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16);
      const reel = new THREE.Mesh(reelGeo, tapeReelMat);
      reel.rotation.x = Math.PI / 2;
      reel.position.set(-11 + c * 2.6 + (r === 0 ? -0.42 : 0.42), 3.4, -7.9);
      root.add(reel);
      tapeReels.push({ mesh: reel, speed: 2.0 + Math.random() * 2.0 });
    }

    // Front control panel flashing indicator LEDs
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        const ledGeo = new THREE.SphereGeometry(0.03, 6, 6);
        const ledMat = new THREE.MeshBasicMaterial({ color: (col % 2 === 0) ? 0xef4444 : 0x22c55e });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(-11 + c * 2.6 - 0.6 + col * 0.24, 1.8 - row * 0.15, -7.78);
        root.add(led);
      }
    }
  }

  // 3. CRT Telemetry Terminal Desks
  for (let d = 0; d < 2; d++) {
    const tableGeo = new THREE.BoxGeometry(3.2, 1.4, 1.6);
    const table = new THREE.Mesh(tableGeo, deskMat);
    table.position.set(-6 + d * 4.2, 0.7, -4.5);
    root.add(table);

    // CRT Monitor Housing
    const crtGeo = new THREE.BoxGeometry(1.2, 1.0, 1.1);
    const crt = new THREE.Mesh(crtGeo, computerMat);
    crt.position.set(-6 + d * 4.2, 1.9, -4.5);
    root.add(crt);

    // Glowing Green Screen
    const screenGeo = new THREE.PlaneGeometry(0.9, 0.7);
    const screen = new THREE.Mesh(screenGeo, crtGlowMat);
    screen.position.set(-6 + d * 4.2, 1.9, -3.94);
    root.add(screen);

    // Keyboard
    const kbGeo = new THREE.BoxGeometry(1.1, 0.08, 0.4);
    const kb = new THREE.Mesh(kbGeo, computerMat);
    kb.position.set(-6 + d * 4.2, 1.45, -4.0);
    root.add(kb);
  }

  // 4. Large Wall-mounted Mission Board & Trajectory Chalkboard
  // Center Chalkboard
  const boardGeo = new THREE.BoxGeometry(8, 3.2, 0.1);
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.95 }); // vintage schoolhouse green
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.set(0, 5.5, -9.92);
  root.add(board);

  // Wooden Board Frame
  const frameGeo = new THREE.BoxGeometry(8.3, 3.5, 0.14);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 5.5, -9.95);
  root.add(frame);

  // Diagram on board: Orbit trajectory arc
  const arcCurve = new THREE.EllipseCurve(0, 5.5, 2.5, 1.2, 0, Math.PI, false, 0);
  const arcPoints = arcCurve.getPoints(32);
  const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
  const arcMat = new THREE.LineBasicMaterial({ color: 0xfef08a, linewidth: 2 });
  const arcLine = new THREE.Line(arcGeo, arcMat);
  arcLine.position.set(0, 0, -9.85);
  root.add(arcLine);

  // Chalk Earth & Moon points on board
  const earthDot = new THREE.Mesh(new THREE.CircleGeometry(0.2, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  earthDot.position.set(-2.2, 5.5, -9.85);
  root.add(earthDot);

  const moonDot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), new THREE.MeshBasicMaterial({ color: 0xe2e8f0 }));
  moonDot.position.set(2.2, 5.5, -9.85);
  root.add(moonDot);

  // Mission Title Plate
  const bannerGeo = new THREE.PlaneGeometry(6, 0.6);
  const bannerMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const banner = new THREE.Mesh(bannerGeo, bannerMat);
  banner.position.set(0, 7.6, -9.9);
  root.add(banner);

  // 5. Dr. Jaffe's Main Executive Drafting Desk (Right side)
  const deskGroup = new THREE.Group();
  deskGroup.position.set(5.5, 0, -3.5);
  root.add(deskGroup);

  const mainDeskGeo = new THREE.BoxGeometry(4.5, 1.45, 2.4);
  const mainDesk = new THREE.Mesh(mainDeskGeo, deskMat);
  mainDesk.position.y = 0.725;
  deskGroup.add(mainDesk);

  // Drafting Lamp on desk
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.06, 16), computerMat);
  lampBase.position.set(-1.4, 1.48, -0.6);
  deskGroup.add(lampBase);

  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.35, 16), new THREE.MeshStandardMaterial({ color: 0x16a34a })); // banker's green
  lampShade.rotation.z = 0.4;
  lampShade.position.set(-1.2, 2.1, -0.6);
  deskGroup.add(lampShade);

  const deskLight = new THREE.PointLight(0xfef08a, 2.0, 6);
  deskLight.position.set(-1.2, 2.0, -0.6);
  deskGroup.add(deskLight);

  // Surveyor 5 Blueprint paper sheets
  const paperGeo = new THREE.PlaneGeometry(1.6, 1.1);
  const paperMat = new THREE.MeshBasicMaterial({ color: 0x1e40af }); // classic cyan blueprint
  const paper = new THREE.Mesh(paperGeo, paperMat);
  paper.rotation.x = -Math.PI / 2;
  paper.position.set(0.4, 1.46, 0.1);
  deskGroup.add(paper);

  // 6. Overhead Office Lighting
  const ambientOffice = new THREE.AmbientLight(0xfffbeb, 1.2);
  root.add(ambientOffice);

  const mainCeilingLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
  mainCeilingLight.position.set(4, 12, 6);
  root.add(mainCeilingLight);

  // Update routine for tape reels
  const update = (delta) => {
    for (let r of tapeReels) {
      r.mesh.rotation.z += r.speed * delta;
    }
  };

  return { root, update, deskGroup };
}

