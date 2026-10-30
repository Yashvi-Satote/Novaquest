import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, Compass, MousePointer, Info } from 'lucide-react';
import { audio } from '../../game/audioManager';

/**
 * PlayableBedroom3D — Medium-Poly 3D Aesthetic
 * Features smooth, subdivided PBR geometry (curved telescope barrel, rounded furniture edges,
 * smooth bed & cushions, detailed CRT terminal, sleek model rocket, and realistic spherical Moon),
 * rich lighting with warm amber night lights & cool moonlight, and first-person FPS movement.
 */
export default function PlayableBedroom3D({ mcGender = 'male', onInteractTelescope }) {
  const mountRef = useRef(null);

  // UI state
  const [isLocked, setIsLocked] = useState(false);
  const [nearTelescope, setNearTelescope] = useState(false);
  const [hudNotice, setHudNotice] = useState('Click to look around with mouse • WASD to walk');

  const onInteractRef = useRef(onInteractTelescope);
  onInteractRef.current = onInteractTelescope;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b18); // Deep twilight night sky

    // 2. Camera at First-Person Eye Level (1.55m)
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 800);
    const EYE_HEIGHT = 1.55;
    camera.position.set(0, EYE_HEIGHT, 3.2);

    // 3. Renderer with Soft Shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 4. MEDIUM-POLY PBR MATERIALS (Smooth normal shading, refined roughness/metalness)
    const materials = {
      // Walls & Architecture
      wall: new THREE.MeshStandardMaterial({ color: 0x24334a, roughness: 0.75 }),
      wallAccent: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }),
      woodTrim: new THREE.MeshStandardMaterial({ color: 0x3d1d0c, roughness: 0.5 }),
      windowFrame: new THREE.MeshStandardMaterial({ color: 0x361c0e, roughness: 0.55 }),
      windowGlass: new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.2,
        roughness: 0.05,
        metalness: 0.85
      }),

      // Woods (Satin smooth mahogany & golden oak)
      woodDesk: new THREE.MeshStandardMaterial({ color: 0x4a2412, roughness: 0.45, metalness: 0.05 }),
      woodDark: new THREE.MeshStandardMaterial({ color: 0x34180a, roughness: 0.5 }),
      woodFloorA: new THREE.MeshStandardMaterial({ color: 0x6b3b19, roughness: 0.4 }),
      woodFloorB: new THREE.MeshStandardMaterial({ color: 0x7c451e, roughness: 0.4 }),

      // Polished Metals
      brass: new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.18 }),
      brassDark: new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.25 }),
      chrome: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 }),
      iron: new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.4, roughness: 0.6 }),

      // Lamps & Emission
      greenGlass: new THREE.MeshStandardMaterial({
        color: 0x059669,
        emissive: 0x047857,
        emissiveIntensity: 0.8,
        roughness: 0.15
      }),
      amberGlass: new THREE.MeshStandardMaterial({
        color: 0xffedd5,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.0,
        roughness: 0.25
      }),

      // Bedding & Fabrics
      duvet: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.85 }),
      duvetFold: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.85 }),
      pillow: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 }),
      rugBlue: new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.9 }),
      rugGold: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }),

      // Props & Electronics
      pcBeige: new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.55 }),
      screenGlow: new THREE.MeshBasicMaterial({ color: 0x67e8f9 }),
      lensGlass: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.05,
        metalness: 0.95
      })
    };

    // 5. NIGHT LIGHTING SETUP
    // Ambient fill light for smooth visibility
    const ambientLight = new THREE.AmbientLight(0x475569, 2.5);
    scene.add(ambientLight);

    // Warm Bedside Night Lamp
    const bedsideLight = new THREE.PointLight(0xfbbf24, 5.5, 16, 0.9);
    bedsideLight.position.set(5.2, 2.0, 0.5);
    bedsideLight.castShadow = true;
    bedsideLight.shadow.mapSize.width = 512;
    bedsideLight.shadow.mapSize.height = 512;
    scene.add(bedsideLight);

    // Green Banker Desk Lamp (Warm golden study light)
    const deskLight = new THREE.PointLight(0xffaa22, 6.5, 14, 0.8);
    deskLight.position.set(-4.5, 2.4, -1.2);
    deskLight.castShadow = true;
    deskLight.shadow.mapSize.width = 512;
    deskLight.shadow.mapSize.height = 512;
    scene.add(deskLight);

    // Directional Moonlight streaming through the window
    const moonLight = new THREE.DirectionalLight(0xa5f3fc, 4.2);
    moonLight.position.set(0, 9.5, -16);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    moonLight.shadow.bias = -0.0005;
    scene.add(moonLight);

    // Ceiling Soft Nightlight
    const ceilingLight = new THREE.PointLight(0x93c5fd, 3.8, 20, 0.7);
    ceilingLight.position.set(0, 5.0, 0);
    scene.add(ceilingLight);

    // Telescope Accent Light
    const teleLight = new THREE.PointLight(0x60a5fa, 2.8, 7, 0.8);
    teleLight.position.set(0, 3.0, -5.2);
    scene.add(teleLight);

    // 6. ROOM ARCHITECTURE (Width 14, Height 5.5, Depth 14)
    const roomGroup = new THREE.Group();

    // A. Smooth Parquet Floor with warm satin varnish
    const floorGroup = new THREE.Group();
    const plankWidth = 1.0;
    const plankLength = 2.0;
    for (let x = -7; x < 7; x += plankWidth) {
      for (let z = -7; z < 7; z += plankLength) {
        const isAlt = (Math.abs(Math.round(x + z))) % 2 === 0;
        const plankGeo = new THREE.BoxGeometry(plankWidth - 0.02, 0.1, plankLength - 0.02);
        const plank = new THREE.Mesh(plankGeo, isAlt ? materials.woodFloorA : materials.woodFloorB);
        plank.position.set(x + plankWidth / 2, -0.05, z + plankLength / 2);
        plank.receiveShadow = true;
        floorGroup.add(plank);
      }
    }
    roomGroup.add(floorGroup);

    // B. Smooth Circular Astronomy Rug (48 segments)
    const rugGeo = new THREE.CylinderGeometry(2.6, 2.6, 0.04, 48);
    const rug = new THREE.Mesh(rugGeo, materials.rugBlue);
    rug.position.set(0, 0.02, 0.5);
    rug.receiveShadow = true;
    roomGroup.add(rug);

    // Inner gold ring on rug
    const rugRingGeo = new THREE.RingGeometry(1.6, 1.85, 48);
    const rugRing = new THREE.Mesh(rugRingGeo, materials.rugGold);
    rugRing.rotation.x = -Math.PI / 2;
    rugRing.position.set(0, 0.045, 0.5);
    roomGroup.add(rugRing);

    // Center gold star on rug
    const rugStar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.02, 24), materials.rugGold);
    rugStar.position.set(0, 0.045, 0.5);
    roomGroup.add(rugStar);

    // C. Ceiling with smooth architectural wood beams
    const ceilingGeo = new THREE.PlaneGeometry(14, 14);
    const ceiling = new THREE.Mesh(ceilingGeo, materials.wallAccent);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 5.5;
    roomGroup.add(ceiling);

    for (let z = -6; z <= 6; z += 3) {
      const beamGeo = new THREE.BoxGeometry(14, 0.28, 0.24);
      const beam = new THREE.Mesh(beamGeo, materials.woodDark);
      beam.position.set(0, 5.36, z);
      beam.castShadow = true;
      roomGroup.add(beam);
    }

    // D. Baseboards around perimeter
    const bbBack = new THREE.Mesh(new THREE.BoxGeometry(14, 0.35, 0.15), materials.woodTrim);
    bbBack.position.set(0, 0.175, -6.9);
    roomGroup.add(bbBack);

    const bbLeft = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 14), materials.woodTrim);
    bbLeft.position.set(-6.9, 0.175, 0);
    roomGroup.add(bbLeft);

    const bbRight = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.35, 14), materials.woodTrim);
    bbRight.position.set(6.9, 0.175, 0);
    roomGroup.add(bbRight);

    // E. Back Window Wall with Opening (Window from x: -3 to 3, y: 1.5 to 5.0)
    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.5, 0.3), materials.wall);
    wallLeft.position.set(-4.9, 2.75, -7);
    wallLeft.receiveShadow = true;
    roomGroup.add(wallLeft);

    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.5, 0.3), materials.wall);
    wallRight.position.set(4.9, 2.75, -7);
    wallRight.receiveShadow = true;
    roomGroup.add(wallRight);

    const wallBottom = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.4, 0.3), materials.wall);
    wallBottom.position.set(0, 0.7, -7);
    wallBottom.receiveShadow = true;
    roomGroup.add(wallBottom);

    const wallTop = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.8, 0.3), materials.wall);
    wallTop.position.set(0, 5.1, -7);
    wallTop.receiveShadow = true;
    roomGroup.add(wallTop);

    // Smooth beveled Window Frame & Sill
    const winSill = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.2, 0.8), materials.woodDark);
    winSill.position.set(0, 1.35, -6.8);
    winSill.receiveShadow = true;
    roomGroup.add(winSill);

    // Muntin Bars (Cross window dividers)
    const winBarV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.5, 0.18), materials.windowFrame);
    winBarV.position.set(0, 3.15, -6.9);
    roomGroup.add(winBarV);

    const winBarH = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.12, 0.18), materials.windowFrame);
    winBarH.position.set(0, 3.15, -6.9);
    roomGroup.add(winBarH);

    // Left, Right, and Front Walls
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.5, 14), materials.wall);
    leftWall.position.set(-7, 2.75, 0);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.5, 14), materials.wall);
    rightWall.position.set(7, 2.75, 0);
    rightWall.receiveShadow = true;
    roomGroup.add(rightWall);

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(14, 5.5, 0.3), materials.wall);
    frontWall.position.set(0, 2.75, 7);
    frontWall.receiveShadow = true;
    roomGroup.add(frontWall);

    // 7. OUTSIDE: MEDIUM-POLY DETAILED MOON & STARFIELD
    // Smooth Spherical Moon (48 segments)
    const moonGeo = new THREE.SphereGeometry(3.6, 48, 48);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xe0e7ff,
      emissive: 0xbfdbfe,
      emissiveIntensity: 0.5,
      roughness: 0.85
    });
    const outsideMoon = new THREE.Mesh(moonGeo, moonMat);
    outsideMoon.position.set(0, 9.8, -32);
    scene.add(outsideMoon);

    // Moon Soft Corona Ring
    const coronaGeo = new THREE.SphereGeometry(3.85, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    });
    const moonCorona = new THREE.Mesh(coronaGeo, coronaMat);
    outsideMoon.add(moonCorona);

    // Outside Twinkling Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = Math.random() * 30 + 1;
      starPositions[i + 2] = -Math.random() * 45 - 20;

      if (Math.random() > 0.4) {
        starColors[i] = 0.85; starColors[i + 1] = 0.95; starColors[i + 2] = 1.0;
      } else {
        starColors[i] = 1.0; starColors[i + 1] = 0.85; starColors[i + 2] = 0.6;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, opacity: 0.9 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 8. MEDIUM-POLY FURNITURE & PROPS

    // A. Study Desk with Rounded Edges & Drawer Units
    const deskGroup = new THREE.Group();
    deskGroup.position.set(-5.3, 0, -1.2);

    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 4.2), materials.woodDesk);
    deskTop.position.set(0, 1.4, 0);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    deskGroup.add(deskTop);

    // Cylindrical Desk Legs (16 segments each)
    for (let dx of [-1.1, 1.1]) {
      for (let dz of [-1.9, 1.9]) {
        const dLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 1.4, 16), materials.woodDark);
        dLeg.position.set(dx, 0.7, dz);
        dLeg.castShadow = true;
        deskGroup.add(dLeg);
      }
    }

    // Drawer unit underneath desk
    const drawerUnit = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 1.8), materials.woodDark);
    drawerUnit.position.set(-0.7, 0.65, 1.0);
    drawerUnit.castShadow = true;
    deskGroup.add(drawerUnit);

    // Polished Brass Drawer Pulls (Toruses)
    for (let dy of [0.4, 0.75]) {
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 12, 24), materials.brass);
      handle.rotation.y = Math.PI / 2;
      handle.position.set(-0.24, dy, 1.0);
      deskGroup.add(handle);
    }

    // B. Medium-Poly CRT Computer with Beveled Case & Screen
    const pcBase = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.15, 0.7), materials.pcBeige);
    pcBase.position.set(-0.2, 1.55, -0.6);
    deskGroup.add(pcBase);

    const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.7), materials.pcBeige);
    monitor.position.set(-0.2, 2.0, -0.6);
    monitor.rotation.y = 0.25;
    monitor.castShadow = true;
    deskGroup.add(monitor);

    // Glowing Teal Screen displaying Surveyor 1 documentary
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.5), materials.screenGlow);
    screen.position.set(0.21, 2.0, -0.55);
    screen.rotation.y = Math.PI / 2 + 0.25;
    deskGroup.add(screen);

    // Keyboard & Ergonomic Mouse
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.8), materials.pcBeige);
    keyboard.position.set(0.4, 1.49, -0.5);
    deskGroup.add(keyboard);

    const mouse = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.04, 16), materials.pcBeige);
    mouse.position.set(0.4, 1.49, 0.1);
    deskGroup.add(mouse);

    // C. Medium-Poly Green Banker's Lamp (Curved glass shade & brass neck)
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.06, 24), materials.brass);
    lampBase.position.set(0.3, 1.5, 0.9);
    deskGroup.add(lampBase);

    const lampNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 16), materials.brass);
    lampNeck.position.set(0.3, 1.8, 0.9);
    deskGroup.add(lampNeck);

    const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.44, 24, 1, false, 0, Math.PI), materials.greenGlass);
    lampShade.rotation.z = Math.PI / 2;
    lampShade.position.set(0.3, 2.05, 0.9);
    deskGroup.add(lampShade);

    // D. Open Astronomy Book on Desk
    const bookCover = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.8), materials.woodTrim);
    bookCover.position.set(0.3, 1.48, 0.3);
    bookCover.rotation.y = 0.2;
    deskGroup.add(bookCover);

    const bookPages = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.05, 0.76), materials.pillow);
    bookPages.position.set(0.3, 1.51, 0.3);
    bookPages.rotation.y = 0.2;
    deskGroup.add(bookPages);

    // E. Spherical Desk Globe on Brass Stand
    const globeStand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.04, 24), materials.brass);
    globeStand.position.set(-0.3, 1.5, 1.4);
    deskGroup.add(globeStand);

    const globeRod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 16), materials.brass);
    globeRod.position.set(-0.3, 1.75, 1.4);
    deskGroup.add(globeRod);

    const globeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), materials.rugBlue);
    globeSphere.position.set(-0.3, 1.9, 1.4);
    deskGroup.add(globeSphere);

    roomGroup.add(deskGroup);

    // F. Medium-Poly Bed with Smooth Curved Duvet & Pillow
    const bedGroup = new THREE.Group();
    bedGroup.position.set(4.9, 0, 3.2);

    // Wooden bed frame with rounded corners
    const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 5.5), materials.woodDark);
    bedFrame.position.set(0, 0.3, 0);
    bedFrame.castShadow = true;
    bedGroup.add(bedFrame);

    // Headboard
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 0.3), materials.woodDesk);
    headboard.position.set(0, 1.2, 2.7);
    headboard.castShadow = true;
    bedGroup.add(headboard);

    // Mattress & Royal Blue Duvet with Smooth Folds
    const duvet = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.45, 4.4), materials.duvet);
    duvet.position.set(0, 0.75, -0.4);
    duvet.castShadow = true;
    bedGroup.add(duvet);

    // Folded top blanket strip
    const duvetFold = new THREE.Mesh(new THREE.BoxGeometry(3.42, 0.12, 0.9), materials.duvetFold);
    duvetFold.position.set(0, 1.0, 1.2);
    bedGroup.add(duvetFold);

    // Smooth Pillow (Scaled sphere for natural softness)
    const pillowGeo = new THREE.SphereGeometry(1.0, 32, 24);
    pillowGeo.scale(1.1, 0.28, 0.65);
    const pillow = new THREE.Mesh(pillowGeo, materials.pillow);
    pillow.position.set(0, 1.02, 2.0);
    pillow.rotation.x = 0.15;
    bedGroup.add(pillow);

    roomGroup.add(bedGroup);

    // G. Bedside Nightstand & Glowing Amber Lamp
    const nsGroup = new THREE.Group();
    nsGroup.position.set(5.2, 0, 0.2);

    const nsBody = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), materials.woodDesk);
    nsBody.position.set(0, 0.6, 0);
    nsBody.castShadow = true;
    nsGroup.add(nsBody);

    const nsHandle = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), materials.brass);
    nsHandle.position.set(-0.72, 0.8, 0);
    nsGroup.add(nsHandle);

    // Smooth Amber Night Lamp
    const nsLampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.3, 24), materials.brassDark);
    nsLampBase.position.set(0, 1.35, 0);
    nsGroup.add(nsLampBase);

    const nsLampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.38, 0.5, 32), materials.amberGlass);
    nsLampShade.position.set(0, 1.75, 0);
    nsGroup.add(nsLampShade);

    roomGroup.add(nsGroup);

    // H. Bookshelf with Colorful Books & Sleek Model Rocket
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(6.0, 0, -2.5);

    const shelfFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.4, 3.2), materials.woodDark);
    shelfFrame.position.set(0, 2.2, 0);
    shelfFrame.castShadow = true;
    shelfGroup.add(shelfFrame);

    // Bookshelf Shelves & Books
    const bookColors = [0xef4444, 0x10b981, 0xf59e0b, 0x8b5cf6, 0x3b82f6, 0xec4899];
    for (let row = 0; row < 3; row++) {
      const y = 1.0 + row * 1.1;
      for (let b = 0; b < 6; b++) {
        const bGeo = new THREE.BoxGeometry(0.7, 0.65 + Math.random() * 0.2, 0.12);
        const bMat = new THREE.MeshStandardMaterial({
          color: bookColors[b % bookColors.length],
          roughness: 0.6
        });
        const book = new THREE.Mesh(bGeo, bMat);
        book.position.set(-0.2, y + 0.35, -1.1 + b * 0.38);
        book.rotation.y = (Math.random() - 0.5) * 0.12;
        shelfGroup.add(book);
      }
    }

    // Sleek Model Rocket on top shelf
    const rocketGroup = new THREE.Group();
    rocketGroup.position.set(-0.1, 3.65, 0);

    const rBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.7, 24), materials.chrome);
    rocketGroup.add(rBody);

    const rNose = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 24), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }));
    rNose.position.y = 0.52;
    rocketGroup.add(rNose);

    for (let f = 0; f < 3; f++) {
      const fAngle = (f * Math.PI * 2) / 3;
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.18), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }));
      fin.position.set(Math.cos(fAngle) * 0.16, -0.25, Math.sin(fAngle) * 0.16);
      fin.rotation.y = fAngle;
      rocketGroup.add(fin);
    }
    shelfGroup.add(rocketGroup);

    roomGroup.add(shelfGroup);

    // 9. THE BRASS TELESCOPE ON TRIPOD (Target Object at Window - Medium-Poly Smooth Cylinder)
    const telescopeGroup = new THREE.Group();
    const telescopePos = new THREE.Vector3(0, 0, -5.6);
    telescopeGroup.position.copy(telescopePos);

    // Smooth Tripod Legs with Brass Braces (16 segments each)
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const legGeo = new THREE.CylinderGeometry(0.045, 0.04, 2.8, 16);
      const leg = new THREE.Mesh(legGeo, materials.woodDark);
      leg.position.set(Math.cos(angle) * 0.75, 1.35, Math.sin(angle) * 0.75);
      leg.rotation.z = Math.cos(angle) * 0.32;
      leg.rotation.x = Math.sin(angle) * 0.32;
      leg.castShadow = true;
      telescopeGroup.add(leg);

      // Polished brass hinge ring
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 16), materials.brass);
      collar.position.set(Math.cos(angle) * 0.38, 2.5, Math.sin(angle) * 0.38);
      telescopeGroup.add(collar);
    }

    // Smooth Brass Main Barrel (32 segments)
    const barrelGeo = new THREE.CylinderGeometry(0.16, 0.2, 2.7, 32);
    const barrel = new THREE.Mesh(barrelGeo, materials.brass);
    barrel.rotation.x = Math.PI / 2.7; // Aimed up out the window directly at the Moon
    barrel.position.set(0, 2.65, 0);
    barrel.castShadow = true;
    telescopeGroup.add(barrel);

    // Brass accent rings along barrel
    for (let dz of [-0.6, 0.2, 0.9]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.018, 12, 32), materials.brassDark);
      ring.position.set(0, 2.65 - dz * 0.45, dz * 0.88);
      ring.rotation.x = Math.PI / 2.7;
      telescopeGroup.add(ring);
    }

    // Smooth Finder Scope (24 segments)
    const finderGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.1, 24);
    const finder = new THREE.Mesh(finderGeo, materials.brassDark);
    finder.rotation.x = Math.PI / 2.7;
    finder.position.set(0.2, 2.9, 0);
    telescopeGroup.add(finder);

    // Eyepiece Assembly
    const eyepieceGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.5, 24);
    const eyepiece = new THREE.Mesh(eyepieceGeo, materials.brassDark);
    eyepiece.rotation.x = Math.PI / 2.7;
    eyepiece.position.set(0, 2.05, 0.98);
    telescopeGroup.add(eyepiece);

    // Objective Lens with Deep Blue Optical Coating
    const lensGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 32);
    const lens = new THREE.Mesh(lensGeo, materials.lensGlass);
    lens.position.set(0, 3.25, -0.96);
    lens.rotation.x = Math.PI / 2.7;
    telescopeGroup.add(lens);

    // Smooth Circular Glowing Beacon Ring on floor (64 segments)
    const ringGeo = new THREE.RingGeometry(1.2, 1.45, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const targetRing = new THREE.Mesh(ringGeo, ringMat);
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.position.y = 0.03;
    telescopeGroup.add(targetRing);

    roomGroup.add(telescopeGroup);
    scene.add(roomGroup);

    // 10. FIRST-PERSON FPS CONTROLS & CAMERA
    let pitch = 0;
    let yaw = Math.PI; // Initially looking toward the window (z = -7)
    const keys = { w: false, s: false, a: false, d: false };

    const onKeyDown = (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.w = true;
      if (code === 'KeyS' || code === 'ArrowDown') keys.s = true;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.a = true;
      if (code === 'KeyD' || code === 'ArrowRight') keys.d = true;

      // Interaction trigger [E] or Space
      if (code === 'KeyE' || code === 'Space') {
        const dist = camera.position.distanceTo(telescopePos);
        if (dist < 3.2) {
          audio.playClick();
          if (onInteractRef.current) onInteractRef.current();
        }
      }
    };

    const onKeyUp = (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.w = false;
      if (code === 'KeyS' || code === 'ArrowDown') keys.s = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.a = false;
      if (code === 'KeyD' || code === 'ArrowRight') keys.d = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Mouse Look (Pointer Lock)
    const onMouseMove = (e) => {
      if (document.pointerLockElement !== renderer.domElement) return;

      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      yaw -= movementX * 0.0022;
      pitch -= movementY * 0.0022;

      // Clamp vertical look angle (-70 deg to +70 deg)
      pitch = Math.max(-1.25, Math.min(1.25, pitch));
    };

    document.addEventListener('mousemove', onMouseMove);

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === renderer.domElement;
      setIsLocked(locked);
      if (locked) {
        setHudNotice('Look around with mouse • WASD to walk • [E] to interact');
      } else {
        setHudNotice('Click screen to enable First-Person Mouse Look');
      }
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);

    const handleCanvasClick = () => {
      if (document.pointerLockElement !== renderer.domElement) {
        renderer.domElement.requestPointerLock();
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // 11. COLLISION SYSTEM FOR BEDROOM OBJECTS (EXCEPT THE TELESCOPE)
    // Precise bounding boxes for every piece of furniture & obstacle in the room
    const OBSTACLE_COLLIDERS = [
      // 1. Study Desk, CRT Computer, Keyboard, Banker's Lamp & Globe
      { name: 'Study Desk', minX: -6.7, maxX: -3.9, minZ: -3.4, maxZ: 1.0 },

      // 2. Bed, Royal Blue Duvet, Pillow & Headboard
      { name: 'Bed & Headboard', minX: 3.0, maxX: 6.8, minZ: 0.35, maxZ: 6.1 },

      // 3. Bedside Nightstand & Glowing Amber Lamp
      { name: 'Bedside Nightstand', minX: 4.4, maxX: 6.0, minZ: -0.6, maxZ: 0.95 },

      // 4. Bookshelf with Books & Model Rocket
      { name: 'Bookshelf', minX: 5.1, maxX: 6.85, minZ: -4.2, maxZ: -0.8 }
    ];

    // Room boundaries (North, South, East, West walls)
    const ROOM_WALLS = {
      minX: -6.4,
      maxX: 6.4,
      minZ: -6.1, // Near window sill and telescope
      maxZ: 6.4
    };

    const PLAYER_RADIUS = 0.42;

    // Smooth obstacle collision & sliding resolver
    const resolveObstacleCollisions = (posX, posZ) => {
      let x = posX;
      let z = posZ;

      // Iterative multi-pass resolution for smooth sliding along corners & edges
      for (let pass = 0; pass < 3; pass++) {
        for (const box of OBSTACLE_COLLIDERS) {
          const cx = Math.max(box.minX, Math.min(box.maxX, x));
          const cz = Math.max(box.minZ, Math.min(box.maxZ, z));

          const dx = x - cx;
          const dz = z - cz;
          const distSq = dx * dx + dz * dz;

          if (distSq < PLAYER_RADIUS * PLAYER_RADIUS) {
            if (distSq > 0.0001) {
              const dist = Math.sqrt(distSq);
              const push = (PLAYER_RADIUS - dist);
              x += (dx / dist) * push;
              z += (dz / dist) * push;
            } else {
              // Deep penetration fallback: push out along closest box boundary
              const penL = x - box.minX;
              const penR = box.maxX - x;
              const penB = z - box.minZ;
              const penT = box.maxZ - z;
              const minPen = Math.min(penL, penR, penB, penT);

              if (minPen === penL) x = box.minX - PLAYER_RADIUS;
              else if (minPen === penR) x = box.maxX + PLAYER_RADIUS;
              else if (minPen === penB) z = box.minZ - PLAYER_RADIUS;
              else z = box.maxZ + PLAYER_RADIUS;
            }
          }
        }

        // Room wall constraints
        x = Math.max(ROOM_WALLS.minX, Math.min(ROOM_WALLS.maxX, x));
        z = Math.max(ROOM_WALLS.minZ, Math.min(ROOM_WALLS.maxZ, z));
      }

      return { x, z };
    };

    // 12. ANIMATION & PHYSICS LOOP
    let animId;
    const clock = new THREE.Clock();
    let walkTimer = 0;
    let lastFootstep = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.08);
      const time = clock.getElapsedTime();

      // Rotate moon slowly
      outsideMoon.rotation.y += delta * 0.04;

      // Pulse circular target beacon
      targetRing.scale.setScalar(1 + Math.sin(time * 3.5) * 0.08);

      // Gentle starfield sway
      stars.rotation.y += delta * 0.01;

      // Calculate forward and right vectors from camera yaw
      const forwardX = -Math.sin(yaw);
      const forwardZ = -Math.cos(yaw);
      const rightX = Math.cos(yaw);
      const rightZ = -Math.sin(yaw);

      let moveX = 0;
      let moveZ = 0;

      if (keys.w) { moveX += forwardX; moveZ += forwardZ; }
      if (keys.s) { moveX -= forwardX; moveZ -= forwardZ; }
      if (keys.a) { moveX -= rightX; moveZ -= rightZ; }
      if (keys.d) { moveX += rightX; moveZ += rightZ; }

      const isWalking = moveX !== 0 || moveZ !== 0;

      if (isWalking) {
        const len = Math.hypot(moveX, moveZ);
        moveX /= len;
        moveZ /= len;

        const moveSpeed = 3.6;
        const targetX = camera.position.x + moveX * moveSpeed * delta;
        const targetZ = camera.position.z + moveZ * moveSpeed * delta;

        // Resolve collisions with all furniture/objects (telescope remains unobstructed)
        const resolved = resolveObstacleCollisions(targetX, targetZ);
        camera.position.x = resolved.x;
        camera.position.z = resolved.z;

        // First-person head bob
        walkTimer += delta * 11;
        camera.position.y = EYE_HEIGHT + Math.sin(walkTimer) * 0.038;

        // Footstep audio
        if (time - lastFootstep > 0.38) {
          audio.playHover();
          lastFootstep = time;
        }
      } else {
        // Idle breathing bob
        camera.position.y = EYE_HEIGHT + Math.sin(time * 2) * 0.012;
      }

      // Update camera orientation from yaw and pitch
      const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
      camera.quaternion.setFromEuler(euler);

      // Check distance from player to the Brass Telescope
      const distToTelescope = camera.position.distanceTo(telescopePos);
      const isNear = distToTelescope < 3.2;
      setNearTelescope(isNear);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('click', handleCanvasClick);
      }
      if (animId) cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden select-none cursor-crosshair">
      
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 h-full w-full" />

      {/* Crosshair Dot */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        <div className={`transition-all duration-200 rounded-full border ${
          nearTelescope
            ? 'w-7 h-7 border-cyan-400 bg-cyan-400/20 scale-125'
            : 'w-2 h-2 border-white/60 bg-white/40'
        }`} />
      </div>

      {/* Top Objective HUD */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black/75 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-xl pointer-events-auto">
          <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span>OBJECTIVE: Walk toward the brass telescope by the window</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 border border-white/10 text-xs font-mono text-slate-300">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>{hudNotice}</span>
        </div>
      </div>

      {/* Center Dynamic Interaction Prompt when approaching Telescope */}
      {nearTelescope && (
        <div className="absolute bottom-28 sm:bottom-20 inset-x-0 z-30 flex justify-center pointer-events-none animate-bounce">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              if (onInteractTelescope) onInteractTelescope();
            }}
            className="pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider shadow-2xl shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all border border-cyan-400"
          >
            <Eye className="w-5 h-5 text-cyan-200" />
            <span>[E] Look Through Telescope</span>
          </button>
        </div>
      )}

      {/* Click-to-Lock Help Banner if not pointer-locked */}
      {!isLocked && (
        <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 border border-white/10 text-xs font-mono text-slate-300 backdrop-blur-md shadow-lg pointer-events-auto">
            <MousePointer className="w-4 h-4 text-cyan-400" />
            <span>Click to enable First-Person Mouse Look</span>
          </div>
        </div>
      )}

    </div>
  );
}
