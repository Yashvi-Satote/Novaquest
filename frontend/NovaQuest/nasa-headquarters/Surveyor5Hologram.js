import * as THREE from 'three';

/**
 * Surveyor5Hologram.js
 *
 * Medium-poly holographic Surveyor 5 lunar lander for the NASA Headquarters
 * command dais. The model is built from lightweight primitives, additive
 * materials and edge overlays so it reads as a projected wireframe while
 * keeping the lander's real silhouette: triangular spaceframe, three shock-
 * absorbing legs, solar array, planar antenna, TV-camera mast, vernier engines
 * and the tethered alpha-scattering instrument.
 */

const CYAN = 0x82e8ff;
const PALE = 0xd9fbff;
const BLUE = 0x3c9dff;
const AMBER = 0xffd08a;
const TAU = Math.PI * 2;

function surfaceMaterial(color = CYAN, opacity = 0.2) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function lineMaterial(color = CYAN, opacity = 0.72) {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

function addEdges(mesh, color = CYAN, opacity = 0.72, threshold = 24) {
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, threshold), lineMaterial(color, opacity));
  mesh.add(edges);
  return edges;
}

function tubeBetween(start, end, radius, material, radialSegments = 7) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, radialSegments);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function addGridLines(parent, width, depth, divisions, y, color, opacity) {
  const material = lineMaterial(color, opacity);
  const positions = [];
  for (let i = 0; i <= divisions; i += 1) {
    const t = -0.5 + i / divisions;
    positions.push(-width / 2, y, t * depth, width / 2, y, t * depth);
    positions.push(t * width, y, -depth / 2, t * width, y, depth / 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  parent.add(new THREE.LineSegments(geometry, material));
}

export function createSurveyor5Hologram() {
  const root = new THREE.Group();
  root.name = 'Surveyor5Hologram';

  const model = new THREE.Group();
  root.add(model);

  const materials = {
    hull: surfaceMaterial(CYAN, 0.16),
    bright: surfaceMaterial(PALE, 0.3),
    solar: surfaceMaterial(BLUE, 0.24),
    amber: surfaceMaterial(AMBER, 0.3),
    edge: lineMaterial(CYAN, 0.82),
    edgeBright: lineMaterial(PALE, 0.9),
    edgeSoft: lineMaterial(BLUE, 0.42),
    strut: surfaceMaterial(CYAN, 0.52),
    strutBright: surfaceMaterial(PALE, 0.64),
    strutSoft: surfaceMaterial(BLUE, 0.38),
    ringSoft: surfaceMaterial(BLUE, 0.42),
    ringBright: surfaceMaterial(PALE, 0.62),
    beam: surfaceMaterial(BLUE, 0.08),
  };

  // ------------------------------------------------------------ main spaceframe
  const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.68, 0.42, 3, 1, false), materials.hull);
  bus.rotation.y = Math.PI / 6;
  bus.position.y = 0.14;
  model.add(bus);
  addEdges(bus, CYAN, 0.85);

  const upperDeck = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.045, 3), materials.bright);
  upperDeck.rotation.y = Math.PI / 6;
  upperDeck.position.y = 0.37;
  model.add(upperDeck);
  addEdges(upperDeck, PALE, 0.92);

  // Solar array laid across the top deck.
  const solarPanel = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.018, 0.88), materials.solar);
  solarPanel.position.y = 0.44;
  solarPanel.rotation.y = 0.08;
  model.add(solarPanel);
  addEdges(solarPanel, 0x9edfff, 0.82);
  addGridLines(solarPanel, 1.12, 0.84, 4, 0.012, 0x9eeaff, 0.36);

  // Central helium tank and gold-foil equipment boxes.
  const tank = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 16, 12),
    surfaceMaterial(PALE, 0.13),
  );
  tank.position.set(0, 0.32, -0.03);
  model.add(tank);
  const tankWire = new THREE.Mesh(
    new THREE.SphereGeometry(0.242, 12, 8),
    new THREE.MeshBasicMaterial({
      color: PALE,
      wireframe: true,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  tank.add(tankWire);

  const compartmentA = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.29, 0.28), materials.amber);
  compartmentA.position.set(0.43, 0.05, 0.23);
  model.add(compartmentA);
  addEdges(compartmentA, AMBER, 0.55);

  const compartmentB = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.26), materials.hull);
  compartmentB.position.set(-0.42, 0.04, 0.23);
  model.add(compartmentB);
  addEdges(compartmentB, CYAN, 0.6);

  // ------------------------------------------------------------ main engine
  const retroNozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.31, 0.48, 12, 1, true),
    materials.hull,
  );
  retroNozzle.position.y = -0.27;
  model.add(retroNozzle);
  addEdges(retroNozzle, CYAN, 0.75);

  const engineBell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.2, 0.22, 10, 1, true),
    materials.beam,
  );
  engineBell.position.y = -0.5;
  model.add(engineBell);
  addEdges(engineBell, BLUE, 0.45);

  for (let i = 0; i < 3; i += 1) {
    const angle = (i * TAU) / 3 + Math.PI / 6;
    const vernier = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.11, 0.25, 8, 1, true),
      materials.hull,
    );
    vernier.position.set(Math.cos(angle) * 0.47, -0.2, Math.sin(angle) * 0.47);
    model.add(vernier);
    addEdges(vernier, CYAN, 0.6);
  }

  // ------------------------------------------------------------ landing gear
  for (let i = 0; i < 3; i += 1) {
    const angle = (i * TAU) / 3 + Math.PI / 6;
    const leg = new THREE.Group();
    leg.rotation.y = angle;
    model.add(leg);

    const hip = new THREE.Vector3(0.48, 0.03, 0.18);
    const knee = new THREE.Vector3(0.9, -0.58, 0.04);
    const foot = new THREE.Vector3(1.12, -1.0, 0);

    const upperStrut = tubeBetween(hip, knee, 0.032, materials.strut);
    leg.add(upperStrut);

    const shock = tubeBetween(knee, foot, 0.05, materials.strutBright);
    leg.add(shock);

    const shockSleeve = tubeBetween(knee, new THREE.Vector3(0.99, -0.79, 0.02), 0.085, materials.hull);
    leg.add(shockSleeve);
    addEdges(shockSleeve, CYAN, 0.55);

    const brace = tubeBetween(
      new THREE.Vector3(0.18, -0.02, 0.25),
      new THREE.Vector3(0.72, -0.34, 0.11),
      0.026,
      materials.strutSoft,
    );
    leg.add(brace);

    const footPad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.23, 0.055, 14),
      materials.bright,
    );
    footPad.position.copy(foot);
    leg.add(footPad);
    addEdges(footPad, PALE, 0.85);

    const footRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.21, 0.007, 4, 32),
      materials.ringSoft,
    );
    footRing.rotation.x = Math.PI / 2;
    footRing.position.copy(foot).add(new THREE.Vector3(0, 0.04, 0));
    leg.add(footRing);
  }

  // ------------------------------------------------------------ mast and camera
  const mastPosition = new THREE.Vector3(0.18, 0.37, 0.11);
  const mastTop = new THREE.Vector3(0.18, 1.24, 0.11);
  const mast = tubeBetween(mastPosition, mastTop, 0.028, materials.strutBright);
  model.add(mast);

  const mastBrace = tubeBetween(
    new THREE.Vector3(0.08, 0.38, 0.13),
    new THREE.Vector3(0.18, 0.72, 0.11),
    0.018,
    materials.strutSoft,
  );
  model.add(mastBrace);

  const cameraTurret = new THREE.Group();
  cameraTurret.position.copy(mastTop);
  model.add(cameraTurret);

  const cameraBody = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.22, 0.18), materials.hull);
  cameraBody.position.y = 0.11;
  cameraTurret.add(cameraBody);
  addEdges(cameraBody, PALE, 0.85);

  const cameraLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.052, 0.13, 10),
    surfaceMaterial(PALE, 0.5),
  );
  cameraLens.rotation.x = Math.PI / 2;
  cameraLens.position.set(0, 0.11, 0.15);
  cameraTurret.add(cameraLens);
  addEdges(cameraLens, PALE, 0.8);

  const cameraHood = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.3, 0.28, 0.22)),
    materials.edgeSoft,
  );
  cameraHood.position.set(0, 0.14, 0.05);
  cameraTurret.add(cameraHood);

  const cameraBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 6),
    new THREE.MeshBasicMaterial({ color: PALE, toneMapped: false }),
  );
  cameraBeacon.position.set(0, 0.24, 0);
  cameraTurret.add(cameraBeacon);

  // ------------------------------------------------------------ planar antenna
  const antennaMount = new THREE.Vector3(-0.38, 0.3, 0.12);
  const antennaJoint = new THREE.Vector3(-0.76, 0.69, 0.14);
  model.add(tubeBetween(antennaMount, antennaJoint, 0.024, materials.strutSoft));

  const antennaPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.5, 0.025),
    materials.bright,
  );
  antennaPanel.position.copy(antennaJoint);
  antennaPanel.rotation.set(-0.22, -0.55, 0.12);
  model.add(antennaPanel);
  addEdges(antennaPanel, PALE, 0.9);

  const antennaFeed = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.16, 8),
    materials.amber,
  );
  antennaFeed.position.set(0, 0, 0.08);
  antennaFeed.rotation.x = Math.PI / 2;
  antennaPanel.add(antennaFeed);

  // ------------------------------------------------------------ whip antennas
  [
    [-0.22, 1.0, -0.2],
    [0.36, 0.9, -0.12],
  ].forEach(([x, y, z], index) => {
    const tip = new THREE.Vector3(x + (index === 0 ? -0.16 : 0.12), y + 0.45, z - 0.08);
    model.add(tubeBetween(new THREE.Vector3(x, y, z), tip, 0.009, materials.strutSoft, 5));
    const tipDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 6, 4),
      new THREE.MeshBasicMaterial({ color: PALE, toneMapped: false }),
    );
    tipDot.position.copy(tip);
    model.add(tipDot);
  });

  // ------------------------------------------- alpha-scattering instrument
  const sensor = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.13, 0.17), materials.amber);
  sensor.position.set(0.38, -0.8, 0.72);
  model.add(sensor);
  addEdges(sensor, AMBER, 0.8);

  const tetherCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.3, -0.02, 0.3),
    new THREE.Vector3(0.37, -0.32, 0.52),
    new THREE.Vector3(0.38, -0.7, 0.68),
    new THREE.Vector3(0.38, -0.8, 0.72),
  ]);
  const tether = new THREE.Mesh(
    new THREE.TubeGeometry(tetherCurve, 20, 0.008, 5, false),
    materials.strutSoft,
  );
  model.add(tether);

  // ------------------------------------------------------------ hologram FX
  const baseRingGroup = new THREE.Group();
  baseRingGroup.position.y = -1.1;
  root.add(baseRingGroup);

  [1.18, 1.4, 1.62].forEach((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, index === 0 ? 0.009 : 0.006, 4, 72),
      index === 0 ? materials.ringBright : materials.ringSoft,
    );
    ring.rotation.x = Math.PI / 2;
    baseRingGroup.add(ring);
  });

  const tickPositions = [];
  for (let i = 0; i < 36; i += 1) {
    const angle = (i * TAU) / 36;
    const inner = 1.66;
    const outer = i % 3 === 0 ? 1.78 : 1.73;
    tickPositions.push(
      Math.cos(angle) * inner,
      0,
      Math.sin(angle) * inner,
      Math.cos(angle) * outer,
      0,
      Math.sin(angle) * outer,
    );
  }
  const tickGeometry = new THREE.BufferGeometry();
  tickGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tickPositions, 3));
  baseRingGroup.add(new THREE.LineSegments(tickGeometry, materials.edgeSoft));

  const scanRingMaterial = surfaceMaterial(PALE, 0.5);
  const scanRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.16, 0.007, 4, 64),
    scanRingMaterial,
  );
  scanRing.rotation.x = Math.PI / 2;
  scanRing.position.y = -1.0;
  root.add(scanRing);

  const dustCount = 90;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    const y = -1.1 + Math.random() * 2.5;
    const radius = 0.35 + Math.random() * 1.35;
    const angle = Math.random() * TAU;
    dustPositions[i * 3] = Math.cos(angle) * radius;
    dustPositions[i * 3 + 1] = y;
    dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      color: 0xbdf4ff,
      size: 0.022,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
  );
  root.add(dust);

  const holoDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.08, 48),
    new THREE.MeshBasicMaterial({
      color: 0x2b8cc9,
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
  );
  holoDisc.rotation.x = -Math.PI / 2;
  holoDisc.position.y = -1.08;
  root.add(holoDisc);

  // ------------------------------------------------------------ animation
  // Once the player has collected the full Surveyor 5 manifest, the projection
  // is materialised: additive wireframe blends switch to solid rendering and
  // the shared material opacities ramp up for a convincing "becomes real" beat.
  const holoMaterialSet = new Set();
  root.traverse((object) => {
    if (!object.material) return;
    const list = Array.isArray(object.material) ? object.material : [object.material];
    list.forEach((material) => holoMaterialSet.add(material));
  });
  const materialStates = Array.from(holoMaterialSet).map((material) => ({
    material,
    opacity: material.opacity,
    blending: material.blending,
    color: material.color ? material.color.clone() : null,
  }));
  const solidColor = new THREE.Color(0xd9fbff);
  let materialization = 0;
  let materializationTarget = 0;

  const setMaterialized = (value) => {
    materializationTarget = value ? 1 : 0;
    materialStates.forEach(({ material, blending }) => {
      const nextBlending = value ? THREE.NormalBlending : blending;
      if (material.blending !== nextBlending) {
        material.blending = nextBlending;
        material.needsUpdate = true;
      }
    });
  };

  const update = (delta, elapsed) => {
    if (materialization !== materializationTarget) {
      materialization +=
        (materializationTarget - materialization) * Math.min(1, delta * 1.8);
      materialStates.forEach(({ material, opacity, color }) => {
        material.opacity = opacity + (Math.min(1, opacity * 2.6 + 0.12) - opacity) * materialization;
        if (color && material.color) {
          material.color.copy(color).lerp(solidColor, materialization * 0.55);
        }
      });
    }

    model.rotation.y += delta * 0.1;
    cameraTurret.rotation.y = elapsed * 0.48;
    antennaPanel.rotation.z = 0.12 + Math.sin(elapsed * 0.55) * 0.055;
    baseRingGroup.rotation.y += delta * 0.12;
    dust.rotation.y -= delta * 0.035;

    const scanT = (elapsed * 0.42) % 2.2;
    scanRing.position.y = -1.04 + scanT;
    scanRingMaterial.opacity = 0.1 + Math.sin((scanT / 2.2) * Math.PI) * 0.5;
  };

  return { root, update, setMaterialized };
}
