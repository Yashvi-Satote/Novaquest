import * as THREE from 'three';

export function createNasaHeadquartersAstronaut() {
  const astronaut = new THREE.Group();
  astronaut.name = 'HeadquartersAstronaut';

  const suit = new THREE.MeshStandardMaterial({ color: 0xc8d7e2, roughness: 0.72, metalness: 0.12 });
  const armor = new THREE.MeshStandardMaterial({ color: 0x526777, roughness: 0.52, metalness: 0.4 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x142434, roughness: 0.45, metalness: 0.56 });
  const visor = new THREE.MeshStandardMaterial({
    color: 0x1b4056,
    emissive: 0x0b2535,
    emissiveIntensity: 0.45,
    metalness: 0.68,
    roughness: 0.2,
  });
  const cyan = new THREE.MeshBasicMaterial({ color: 0x6ce5ff });
  const red = new THREE.MeshStandardMaterial({ color: 0xb8423d, roughness: 0.58 });

  const addPart = (geometry, material, position, scale = null) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    if (scale) mesh.scale.set(...scale);
    astronaut.add(mesh);
    return mesh;
  };

  const limb = (radiusTop, radiusBottom, height, position, material = suit) =>
    addPart(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8, 1), material, position);

  addPart(new THREE.BoxGeometry(0.44, 0.48, 0.27), dark, [0, 1.04, -0.25]);
  addPart(new THREE.BoxGeometry(0.34, 0.4, 0.12), suit, [0, 1.06, -0.43]);
  addPart(new THREE.SphereGeometry(0.29, 10, 8), suit, [0, 1.08, 0], [1, 1.16, 0.82]);
  addPart(new THREE.CylinderGeometry(0.2, 0.21, 0.12, 10), armor, [0, 1.4, 0]);

  addPart(new THREE.SphereGeometry(0.27, 12, 8), suit, [0, 1.67, 0], [1, 0.94, 0.9]);
  addPart(
    new THREE.SphereGeometry(0.222, 12, 8, Math.PI * 0.2, Math.PI * 0.6, Math.PI * 0.22, Math.PI * 0.56),
    visor,
    [0, 1.67, 0.115],
    [1, 1, 0.96],
  );
  addPart(new THREE.BoxGeometry(0.15, 0.045, 0.045), cyan, [0, 1.43, 0.21]);

  addPart(new THREE.BoxGeometry(0.23, 0.2, 0.055), armor, [0, 1.12, 0.15]);
  addPart(new THREE.BoxGeometry(0.16, 0.055, 0.025), cyan, [0, 1.15, 0.184]);
  const insignia = addPart(new THREE.CircleGeometry(0.075, 10), red, [-0.205, 1.16, 0.088]);
  insignia.rotation.y = -Math.PI / 2;

  [-1, 1].forEach((side) => {
    addPart(new THREE.SphereGeometry(0.14, 8, 6), armor, [side * 0.34, 1.2, 0]);
    limb(0.1, 0.13, 0.42, [side * 0.4, 0.94, 0], suit).rotation.z = side * -0.12;
    addPart(new THREE.SphereGeometry(0.105, 8, 6), armor, [side * 0.43, 0.7, 0.025]);
    addPart(new THREE.BoxGeometry(0.12, 0.075, 0.14), suit, [side * 0.43, 0.65, 0.065]);

    limb(0.105, 0.13, 0.38, [side * 0.14, 0.43, 0], suit);
    addPart(new THREE.BoxGeometry(0.28, 0.17, 0.34), dark, [side * 0.14, 0.16, 0.025]);
    addPart(new THREE.BoxGeometry(0.3, 0.045, 0.37), armor, [side * 0.14, 0.075, 0.035]);
  });

  [-0.105, 0.105].forEach((x) => {
    addPart(new THREE.BoxGeometry(0.065, 0.12, 0.055), cyan, [x, 0.84, 0.14]);
  });

  return astronaut;
}
