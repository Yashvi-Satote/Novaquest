import * as THREE from 'three';
import { createNasaHeadquartersFiringRoom } from './NasaHeadquartersFiringRoom';
import { createNasaHeadquartersStorageRoom } from './NasaHeadquartersStorageRoom';

const CORRIDOR_LENGTH = 54;
const STORAGE_ENTRY_Z = 27;
const STORAGE_ENTRY_HALF_WIDTH = 2.4;

export function createNasaHeadquartersCorridor() {
  const corridor = new THREE.Group();
  corridor.name = 'NasaHeadquartersExteriorCorridor';

  const materials = {
    shell: new THREE.MeshStandardMaterial({ color: 0xc3cdd1, roughness: 0.64, metalness: 0.16 }),
    panel: new THREE.MeshStandardMaterial({ color: 0xe0e5e4, roughness: 0.52, metalness: 0.12 }),
    trim: new THREE.MeshStandardMaterial({ color: 0x52616a, roughness: 0.54, metalness: 0.38 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x222e35, roughness: 0.56, metalness: 0.45 }),
    floor: new THREE.MeshStandardMaterial({
      color: 0xb9c3c4,
      roughness: 0.3,
      metalness: 0.18,
    }),
    lane: new THREE.MeshStandardMaterial({ color: 0x34434a, roughness: 0.48, metalness: 0.38 }),
    light: new THREE.MeshBasicMaterial({ color: 0xe6f7ff, toneMapped: false }),
    cyan: new THREE.MeshBasicMaterial({ color: 0x57d5f4, toneMapped: false }),
    screen: new THREE.MeshBasicMaterial({ color: 0x0b2637, toneMapped: false }),
  };

  const addBox = (parent, width, height, depth, material, x, y, z, rotationZ = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rotationZ;
    parent.add(mesh);
    return mesh;
  };

  const addPanel = (side, z, width, height, material, y = 2.65) =>
    addBox(corridor, 0.08, height, width, material, side * 3.94, y, z);

  addBox(corridor, 8.25, 0.2, CORRIDOR_LENGTH, materials.floor, 0, -0.08, CORRIDOR_LENGTH / 2);
  addBox(corridor, 1.22, 0.035, CORRIDOR_LENGTH, materials.lane, -3.05, 0.035, CORRIDOR_LENGTH / 2);
  addBox(corridor, 1.22, 0.035, CORRIDOR_LENGTH, materials.lane, 3.05, 0.035, CORRIDOR_LENGTH / 2);
  addBox(corridor, 0.075, 0.025, CORRIDOR_LENGTH, materials.light, 0, 0.045, CORRIDOR_LENGTH / 2);

  [-1, 1].forEach((side) => {
    if (side > 0) {
      addBox(corridor, 0.24, 6.7, CORRIDOR_LENGTH, materials.shell, side * 4.18, 3.28, CORRIDOR_LENGTH / 2);
      return;
    }

    const openingStart = STORAGE_ENTRY_Z - STORAGE_ENTRY_HALF_WIDTH;
    const openingEnd = STORAGE_ENTRY_Z + STORAGE_ENTRY_HALF_WIDTH;
    addBox(corridor, 0.24, 6.7, openingStart, materials.shell, side * 4.18, 3.28, openingStart / 2);
    addBox(
      corridor,
      0.24,
      6.7,
      CORRIDOR_LENGTH - openingEnd,
      materials.shell,
      side * 4.18,
      3.28,
      (openingEnd + CORRIDOR_LENGTH) / 2,
    );
    addBox(
      corridor,
      0.24,
      1.35,
      openingEnd - openingStart,
      materials.shell,
      side * 4.18,
      6.025,
      STORAGE_ENTRY_Z,
    );
  });
  addBox(corridor, 8.55, 0.3, CORRIDOR_LENGTH, materials.shell, 0, 6.66, CORRIDOR_LENGTH / 2);
  addBox(corridor, 1.0, 0.09, CORRIDOR_LENGTH, materials.trim, 0, 6.44, CORRIDOR_LENGTH / 2);

  for (let z = 2; z < CORRIDOR_LENGTH - 1; z += 5) {
    addBox(corridor, 0.52, 6.2, 0.58, materials.trim, -3.67, 3.1, z);
    addBox(corridor, 0.52, 6.2, 0.58, materials.trim, 3.67, 3.1, z);
    addBox(corridor, 7.95, 0.5, 0.58, materials.trim, 0, 6.05, z);

    [-1, 1].forEach((side) => {
      if (side < 0 && Math.abs(z - STORAGE_ENTRY_Z) < 3.2) return;
      const shoulder = addBox(
        corridor,
        0.42,
        1.85,
        0.58,
        materials.panel,
        side * 3.08,
        5.42,
        z,
        side * 0.54,
      );
      shoulder.castShadow = true;
      addBox(corridor, 0.11, 0.12, 0.68, materials.cyan, side * 3.67, 3.55, z);
      addBox(corridor, 0.12, 0.075, 0.64, materials.panel, side * 3.12, 0.15, z);
    });

    addBox(corridor, 1.6, 0.075, 2.45, materials.light, 0, 6.39, z + 1.85);
    addBox(corridor, 0.22, 0.045, 2.2, materials.dark, -2.02, 6.39, z + 1.85);
    addBox(corridor, 0.22, 0.045, 2.2, materials.dark, 2.02, 6.39, z + 1.85);

    addBox(corridor, 8.1, 0.018, 0.06, materials.trim, 0, 0.035, z + 2.45);
  }

  [-1, 1].forEach((side) => {
    addBox(corridor, 0.08, 0.15, CORRIDOR_LENGTH, materials.panel, side * 3.44, 0.1, CORRIDOR_LENGTH / 2);
    addBox(corridor, 0.08, 0.12, CORRIDOR_LENGTH, materials.panel, side * 3.44, 6.1, CORRIDOR_LENGTH / 2);

    for (let z = 5; z < CORRIDOR_LENGTH - 5; z += 10) {
      if (side < 0 && Math.abs(z - STORAGE_ENTRY_Z) < 4.5) continue;
      addPanel(side, z, 2.4, 1.72, materials.panel, 2.55);
      addPanel(side, z, 1.45, 0.08, materials.trim, 3.58);
      addPanel(side, z, 1.5, 0.06, materials.trim, 1.5);
      addPanel(side, z + 2.2, 1.25, 0.82, materials.screen, 4.25);
      addPanel(side, z + 2.2, 1.08, 0.055, materials.cyan, 4.25);

      for (let vent = 0; vent < 4; vent += 1) {
        addPanel(side, z - 1.35 + vent * 0.12, 0.055, 0.3, materials.dark, 0.72);
      }

      const wallLight = addBox(
        corridor,
        0.08,
        0.42,
        1.45,
        materials.light,
        side * 3.78,
        4.85,
        z - 2,
      );
      wallLight.rotation.y = side * 0.16;
    }
  });

  for (let z = 8; z < CORRIDOR_LENGTH - 5; z += 16) {
    const lamp = new THREE.PointLight(0xd5f3ff, 24, 13, 1.8);
    lamp.position.set(0, 5.95, z);
    corridor.add(lamp);
  }

  const storageRoom = createNasaHeadquartersStorageRoom();
  corridor.add(storageRoom.root);
  const firingRoom = createNasaHeadquartersFiringRoom();
  corridor.add(firingRoom.root);

  return { root: corridor, length: CORRIDOR_LENGTH, storageRoom, firingRoom };
}
