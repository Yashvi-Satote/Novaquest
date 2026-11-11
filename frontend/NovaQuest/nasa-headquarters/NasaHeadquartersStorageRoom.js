import * as THREE from 'three';
import { createComponentSpriteTexture } from './componentSpriteTexture';
import { STORAGE_ROOM_COMPONENTS } from './storageRoomComponents';

const ROOM_DEPTH = 17;
const ROOM_HALF_WIDTH = 8.25;
const ENTRY_Z = 27;
const ENTRY_HALF_WIDTH = 2.05;

function Door({ width, height, hingeSide, open, side, materials }) {
  const baseRotation = side > 0 ? Math.PI : 0;
  const hingeDirection = hingeSide === 'left' ? -1 : 1;
  const leafOffset = -hingeDirection * width / 2;
  const group = new THREE.Group();
  group.userData.noCollision = true;
  group.position.x = hingeDirection * (side > 0 ? -1 : 1) * width / 2;
  group.rotation.y = baseRotation;

  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.055),
    materials.glass,
  );
  glass.position.x = leafOffset;
  glass.userData.interactionType = 'cupboard';
  group.add(glass);

  [-1, 1].forEach((edge) => {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.075, height + 0.1, 0.09),
      materials.trim,
    );
    rail.position.set(leafOffset + edge * (width / 2 - 0.02), 0, 0.035);
    group.add(rail);
  });
  [-height / 2, height / 2].forEach((y) => {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.075, 0.09),
      materials.trim,
    );
    rail.position.set(leafOffset, y, 0.035);
    group.add(rail);
  });

  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.45, 0.1),
    materials.cyan,
  );
  handle.position.set(leafOffset - hingeDirection * (width / 2 - 0.14), 0, 0.09);
  group.add(handle);

  const hitTarget = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.1, height - 0.14),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      colorWrite: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  hitTarget.position.set(leafOffset, 0, 0.12);
  group.add(hitTarget);

  const door = {
    group,
    hitTarget,
    target: open ? 1 : 0,
    openAmount: open ? 1 : 0,
    toggle() {
      door.target = door.target > 0.5 ? 0 : 1;
    },
    update(delta) {
      door.openAmount += (door.target - door.openAmount) * Math.min(1, delta * 4);
      group.rotation.y = baseRotation + hingeDirection * door.openAmount * 1.2;
    },
  };
  return door;
}

export function createNasaHeadquartersStorageRoom() {
  const root = new THREE.Group();
  root.name = 'NasaHeadquartersPartsStorage';
  root.position.set(-4.18, 0, ENTRY_Z);

  const materials = {
    wall: new THREE.MeshStandardMaterial({ color: 0x18232c, roughness: 0.67, metalness: 0.48 }),
    wallPanel: new THREE.MeshStandardMaterial({ color: 0x283640, roughness: 0.58, metalness: 0.5 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x101a22, roughness: 0.42, metalness: 0.66 }),
    trim: new THREE.MeshStandardMaterial({ color: 0x667680, roughness: 0.4, metalness: 0.64 }),
    floor: new THREE.MeshStandardMaterial({ color: 0x343d43, roughness: 0.32, metalness: 0.46 }),
    shelf: new THREE.MeshStandardMaterial({ color: 0x39464e, roughness: 0.47, metalness: 0.58 }),
    parts: new THREE.MeshStandardMaterial({ color: 0x9aabb2, roughness: 0.35, metalness: 0.72 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x75dafa,
      roughness: 0.16,
      metalness: 0.08,
      transparent: true,
      opacity: 0.23,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    cyan: new THREE.MeshBasicMaterial({ color: 0x59dfff, toneMapped: false }),
    glow: new THREE.MeshBasicMaterial({ color: 0xb9f1ff, toneMapped: false }),
    display: new THREE.MeshBasicMaterial({ color: 0x123349, toneMapped: false }),
    door: new THREE.MeshStandardMaterial({ color: 0x26343e, roughness: 0.38, metalness: 0.72 }),
  };
  const cupboardDoors = [];
  const interactionTargets = [];
  const componentSprites = [];
  const entryDoorPanels = [];
  let entryDoorTarget = 0;
  let entryDoorOpenAmount = 0;

  const addBox = (parent, width, height, depth, material, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };

  const addEntryDetail = (width, height, depth, material, x, y, z) =>
    addBox(root, width, height, depth, material, x, y, z);

  // Dark metallic shell and segmented floor panels.
  addBox(root, ROOM_DEPTH, 0.24, ROOM_HALF_WIDTH * 2, materials.floor, -ROOM_DEPTH / 2, -0.12, 0);
  addBox(root, ROOM_DEPTH, 0.28, ROOM_HALF_WIDTH * 2, materials.wall, -ROOM_DEPTH / 2, 6.58, 0);
  [-1, 1].forEach((side) => {
    addBox(root, ROOM_DEPTH, 6.5, 0.3, materials.wall, -ROOM_DEPTH / 2, 3.18, side * 8.24);
    addBox(root, ROOM_DEPTH - 0.5, 0.12, 0.11, materials.trim, -ROOM_DEPTH / 2, 0.16, side * 8.03);
  });
  addBox(root, 0.32, 6.45, ROOM_HALF_WIDTH * 2, materials.wall, -ROOM_DEPTH + 0.16, 3.2, 0);
  addBox(root, 0.08, 0.08, ROOM_HALF_WIDTH * 2, materials.cyan, -ROOM_DEPTH + 0.31, 5.9, 0);

  for (let x = -1.5; x > -ROOM_DEPTH; x -= 2.5) {
    addBox(root, 0.055, 0.025, ROOM_HALF_WIDTH * 2 - 0.5, materials.trim, x, 0.015, 0);
    addBox(root, 0.08, 0.12, 0.12, materials.cyan, x, 6.38, 0);
  }

  // Pressure frame and a sliding, split-panel entrance matching the base airlock.
  [-1, 1].forEach((side) => {
    addEntryDetail(0.55, 5.7, 0.42, materials.frame, 0.05, 2.85, side * 2.28);
    addEntryDetail(0.18, 5.25, 0.12, materials.trim, 0.28, 2.85, side * 2.04);
    addEntryDetail(0.06, 4.65, 0.08, materials.cyan, 0.36, 2.85, side * 2.12);
    addEntryDetail(0.52, 0.18, 0.42, materials.frame, 0.05, 0.14, side * 2.28);
    addEntryDetail(0.52, 0.18, 0.42, materials.frame, 0.05, 5.56, side * 2.28);
  });
  addEntryDetail(0.52, 0.32, 4.8, materials.frame, 0.05, 5.78, 0);
  addEntryDetail(0.09, 0.07, 3.3, materials.glow, 0.34, 5.79, 0);
  addEntryDetail(0.38, 0.24, 2.5, materials.frame, 0.26, 6.02, 0);
  addEntryDetail(0.06, 0.045, 2.15, materials.cyan, 0.48, 6.02, 0);

  [-1, 1].forEach((side) => {
    const panel = new THREE.Group();
    panel.userData.noCollision = true;
    panel.position.set(0.2, 2.82, side * 0.96);
    root.add(panel);
    entryDoorPanels.push({ panel, side });

    addBox(panel, 0.16, 4.72, 1.9, materials.door, 0, 0, 0);
    addBox(panel, 0.055, 4.34, 1.58, materials.wallPanel, 0.11, 0, 0);
    [-0.72, 0.72].forEach((z) => {
      addBox(panel, 0.045, 4.12, 0.045, materials.trim, 0.16, 0, z);
      addBox(panel, 0.035, 3.72, 0.025, materials.frame, 0.19, 0, z + (z < 0 ? 0.05 : -0.05));
    });
    [-1.72, 1.72].forEach((y) => {
      addBox(panel, 0.045, 0.05, 1.42, materials.trim, 0.16, y, 0);
      addBox(panel, 0.035, 0.025, 0.84, materials.cyan, 0.19, y + (y < 0 ? 0.06 : -0.06), 0);
    });
    addBox(panel, 0.04, 0.08, 0.62, materials.cyan, 0.19, 0, side * 0.4);
  });

  const entryHitTarget = new THREE.Mesh(
    new THREE.PlaneGeometry(3.9, 5.1),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      colorWrite: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  entryHitTarget.rotation.y = Math.PI / 2;
  entryHitTarget.position.set(0.56, 2.85, 0);
  root.add(entryHitTarget);

  const entryDoor = {
    hitTarget: entryHitTarget,
    setOpen: (open) => {
      entryDoorTarget = open ? 1 : 0;
    },
    isOpen: () => entryDoorTarget > 0.5,
    toggle: () => {
      entryDoor.setOpen(!entryDoor.isOpen());
    },
  };
  interactionTargets.push({ target: entryHitTarget, toggle: entryDoor.toggle });

  // Scatter the component catalog through eight illuminated glass cupboards.
  // A fixed shuffle keeps the layout deterministic while mixing all three
  // spacecraft collections across both walls of the room.
  const componentOrder = [...STORAGE_ROOM_COMPONENTS];
  let shuffleSeed = 0x5f3759df;
  for (let index = componentOrder.length - 1; index > 0; index -= 1) {
    shuffleSeed = (Math.imul(shuffleSeed, 1664525) + 1013904223) >>> 0;
    const swapIndex = shuffleSeed % (index + 1);
    [componentOrder[index], componentOrder[swapIndex]] = [
      componentOrder[swapIndex],
      componentOrder[index],
    ];
  }
  const cabinetComponentCounts = [7, 6, 7, 6, 6, 6, 6, 6];
  const shelfCenters = [0.69, 1.85, 3.01, 4.1];
  const rowScales = [0.72, 0.72, 0.72, 0.62];
  const slotLayouts = {
    6: [
      [0, -0.58],
      [0, 0.58],
      [1, -0.58],
      [1, 0.58],
      [2, 0],
      [3, 0],
    ],
    7: [
      [0, -0.58],
      [0, 0.58],
      [1, -0.58],
      [1, 0.58],
      [2, -0.58],
      [2, 0.58],
      [3, 0],
    ],
  };
  let componentCursor = 0;
  let cabinetCursor = 0;
  let componentElapsed = 0;

  const cabinetPositions = [-2.2, -5.7, -9.2, -12.7];
  [-1, 1].forEach((side) => {
    cabinetPositions.forEach((centerX, cabinetIndex) => {
      const cabinet = new THREE.Group();
      cabinet.position.set(centerX, 0.08, side * 6.9);
      root.add(cabinet);

      addBox(cabinet, 2.82, 0.14, 0.9, materials.frame, 0, 0.08, 0);
      addBox(cabinet, 2.82, 0.14, 0.9, materials.frame, 0, 4.64, 0);
      addBox(cabinet, 2.55, 4.28, 0.075, materials.wallPanel, 0, 2.35, side * 0.34);
      [-1, 1].forEach((edge) => {
        addBox(cabinet, 0.13, 4.55, 0.9, materials.trim, edge * 1.34, 2.35, 0);
        addBox(cabinet, 0.045, 4.18, 0.045, materials.cyan, edge * 1.24, 2.34, side * -0.47);
      });
      [0.26, 1.42, 2.58, 3.74, 4.52].forEach((y) => {
        addBox(cabinet, 2.58, 0.12, 0.76, materials.shelf, 0, y, 0);
      });

      const componentCount = cabinetComponentCounts[cabinetCursor] ?? 6;
      const slots = slotLayouts[componentCount] || slotLayouts[6];

      slots.forEach(([shelfIndex, x], slotIndex) => {
        const component = componentOrder[componentCursor];
        if (!component) return;
        componentCursor += 1;

        const scale = rowScales[shelfIndex] ?? 0.7;
        const y = shelfCenters[shelfIndex] ?? 1.8;
        const texture = createComponentSpriteTexture(component);
        const material = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
          alphaTest: 0.02,
        });
        const sprite = new THREE.Sprite(material);
        sprite.name = `StorageComponent:${component.id}`;
        sprite.position.set(x, y, side * -0.1);
        sprite.scale.set(scale, scale, 1);
        sprite.userData.component = component;
        sprite.userData.componentSprite = true;
        sprite.userData.baseY = y;
        sprite.userData.phase = (componentCursor + cabinetIndex + slotIndex) * 0.73;
        sprite.renderOrder = 3;
        cabinet.add(sprite);

        // A thin lit plinth grounds each floating inventory card on its shelf.
        addBox(
          cabinet,
          0.5,
          0.022,
          0.16,
          materials.cyan,
          x,
          y - scale / 2 - 0.015,
          side * -0.1,
        );
        addBox(
          cabinet,
          scale + 0.06,
          scale + 0.06,
          0.012,
          materials.display,
          x,
          y,
          side * 0.01,
        );

        componentSprites.push(sprite);
        interactionTargets.push({ target: sprite, component });
      });

      cabinetCursor += 1;

      const label = addBox(cabinet, 0.76, 0.22, 0.055, materials.display, 0, 4.94, side * -0.49);
      label.rotation.y = side > 0 ? 0 : Math.PI;
      addBox(cabinet, 0.4, 0.025, 0.035, materials.cyan, 0, 4.94, side * -0.53);

      const hingeSide = cabinetIndex % 2 === 0 ? 'left' : 'right';
      const door = Door({
        width: 2.48,
        height: 3.92,
        hingeSide,
        open: true,
        side,
        materials,
      });
      door.group.position.y = 2.34;
      door.group.position.z = side * -0.52;
      cabinet.add(door.group);
      cupboardDoors.push(door);
      interactionTargets.push({ target: door.hitTarget, toggle: door.toggle });
    });
  });

  // Paired equipment benches flank a clear central aisle.
  [-2.25, 2.25].forEach((side) => {
    addBox(root, 7.6, 0.2, 1.45, materials.frame, -9.1, 1.05, side);
    addBox(root, 7.35, 0.11, 1.25, materials.shelf, -9.1, 1.2, side);
    addBox(root, 7.1, 0.035, 0.045, materials.cyan, -9.1, 1.27, side - Math.sign(side) * 0.65);
    [-12.1, -6.1].forEach((x) => {
      addBox(root, 0.48, 0.94, 1.15, materials.wallPanel, x, 0.56, side);
      addBox(root, 0.53, 0.08, 1.24, materials.trim, x, 0.12, side);
    });
    for (let part = 0; part < 4; part += 1) {
      const crate = addBox(
        root,
        0.52 + (part % 2) * 0.18,
        0.36,
        0.38,
        part % 2 === 0 ? materials.parts : materials.display,
        -11.2 + part * 0.8,
        1.44,
        side,
      );
      crate.rotation.y = part % 2 ? 0.12 : -0.12;
      addBox(root, 0.28, 0.025, 0.035, materials.cyan, -11.2 + part * 0.8, 1.64, side);
    }
  });

  // Recessed service bulkhead and equipment racks at the far end.
  addBox(root, 0.12, 4.8, 4.2, materials.frame, -16.78, 2.55, 0);
  addBox(root, 0.08, 4.1, 3.5, materials.door, -16.68, 2.55, 0);
  [-1, 1].forEach((side) => {
    addBox(root, 0.1, 4.5, 0.16, materials.cyan, -16.59, 2.58, side * 1.94);
    addBox(root, 0.14, 0.09, 4.1, materials.trim, -16.58, 4.98, 0);
  });
  addBox(root, 0.045, 3.45, 0.045, materials.trim, -16.55, 2.55, 0);

  const ceilingLight = new THREE.PointLight(0x9cdbff, 42, 24, 1.6);
  ceilingLight.position.set(-8.5, 5.85, 0);
  root.add(ceilingLight);
  [-3.5, -8.5, -13.5].forEach((x) => {
    addBox(root, 2.8, 0.065, 0.5, materials.glow, x, 6.37, 0);
    addBox(root, 0.12, 0.08, 0.72, materials.cyan, x - 1.5, 6.36, 0);
    addBox(root, 0.12, 0.08, 0.72, materials.cyan, x + 1.5, 6.36, 0);
  });

  return {
    root,
    entryZ: ENTRY_Z,
    corridorX: -4.18,
    openingHalfWidth: ENTRY_HALF_WIDTH,
    depth: ROOM_DEPTH,
    halfWidth: ROOM_HALF_WIDTH,
    entryDoor,
    cupboardDoors,
    interactionTargets,
    components: STORAGE_ROOM_COMPONENTS,
    componentSprites,
    update: (delta) => {
      componentElapsed += delta;
      entryDoorOpenAmount += (entryDoorTarget - entryDoorOpenAmount) * Math.min(1, delta * 4.5);
      entryDoorPanels.forEach(({ panel, side }) => {
        panel.position.z = side * (0.96 + entryDoorOpenAmount * 1.9);
      });
      cupboardDoors.forEach((door) => {
        door.update(delta);
      });
      componentSprites.forEach((sprite) => {
        const wave = Math.sin(componentElapsed * 0.9 + sprite.userData.phase);
        sprite.position.y = sprite.userData.baseY + wave * 0.006;
        sprite.material.opacity = 0.95 + wave * 0.04;
      });
    },
  };
}
