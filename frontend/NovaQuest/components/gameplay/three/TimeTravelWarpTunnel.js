import * as THREE from 'three';

/**
 * TimeTravelWarpTunnel.js
 * 
 * Cinematic 3D Chrono-Vortex / Time Tunnel
 * Features:
 * - Concentric glowing hyperspace rings (cyan & gold)
 * - Historical milestone gates (1969 Apollo 11 -> 1968 Apollo 8 -> 1967 Surveyor 5)
 * - Swirling time particle vortex
 * - Dynamic camera travel through the chronosphere
 */
export function createTimeTravelTunnel() {
  const root = new THREE.Group();
  root.name = 'TimeTravelTunnel';

  const tunnelLength = 120;
  const numRings = 40;

  // Concentric Energy Rings
  const rings = [];
  const ringGeo = new THREE.TorusGeometry(4.5, 0.08, 12, 36);

  for (let i = 0; i < numRings; i++) {
    const isGold = i % 3 === 0;
    const ringMat = new THREE.MeshBasicMaterial({
      color: isGold ? 0xf59e0b : 0x06b6d4,
      transparent: true,
      opacity: 0.65
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.z = -i * (tunnelLength / numRings);
    root.add(ring);
    rings.push({
      mesh: ring,
      initialZ: ring.position.z,
      rotSpeed: (i % 2 === 0 ? 1 : -1) * (0.8 + Math.random() * 0.8)
    });
  }

  // Swirling Particle Vortex
  const pCount = 800;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pColors = new Float32Array(pCount * 3);
  const pSpeeds = [];

  const cyan = new THREE.Color(0x38bdf8);
  const gold = new THREE.Color(0xfbbf24);
  const violet = new THREE.Color(0xc084fc);

  for (let i = 0; i < pCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.2 + Math.random() * 4.2;
    const z = -Math.random() * tunnelLength;

    pPos[i * 3] = Math.cos(angle) * radius;
    pPos[i * 3 + 1] = Math.sin(angle) * radius;
    pPos[i * 3 + 2] = z;

    const c = Math.random() < 0.4 ? cyan : (Math.random() < 0.7 ? gold : violet);
    pColors[i * 3] = c.r;
    pColors[i * 3 + 1] = c.g;
    pColors[i * 3 + 2] = c.b;

    pSpeeds.push({
      angle,
      radius,
      orbitSpeed: 1.5 + Math.random() * 3.0,
      zSpeed: 30 + Math.random() * 40
    });
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

  const pMat = new THREE.PointsMaterial({
    size: 0.45,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(pGeo, pMat);
  root.add(particleSystem);

  // Milestone Gates
  const milestones = [
    { year: '1969', label: 'APOLLO 11', z: -25, color: 0x38bdf8 },
    { year: '1968', label: 'APOLLO 8', z: -60, color: 0xa855f7 },
    { year: '1967', label: 'SURVEYOR 5', z: -95, color: 0xf59e0b }
  ];

  const milestoneMeshes = [];
  milestones.forEach(m => {
    const gateGroup = new THREE.Group();
    gateGroup.position.z = m.z;

    // Glowing gate ring
    const gateRing = new THREE.Mesh(
      new THREE.TorusGeometry(5.2, 0.18, 16, 48),
      new THREE.MeshBasicMaterial({ color: m.color, transparent: true, opacity: 0.9 })
    );
    gateGroup.add(gateRing);

    // Inner energy burst plane
    const burst = new THREE.Mesh(
      new THREE.CircleGeometry(5.0, 32),
      new THREE.MeshBasicMaterial({ color: m.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
    );
    gateGroup.add(burst);

    root.add(gateGroup);
    milestoneMeshes.push(gateGroup);
  });

  const update = (delta, timeSeconds, speedMultiplier = 1.0) => {
    // Spin and cycle energy rings
    for (let r of rings) {
      r.mesh.rotation.z += r.rotSpeed * delta * speedMultiplier;
      r.mesh.position.z += 40 * delta * speedMultiplier;
      if (r.mesh.position.z > 5) {
        r.mesh.position.z -= tunnelLength;
      }
    }

    // Move milestone gates towards camera
    for (let g of milestoneMeshes) {
      g.rotation.z += 0.5 * delta;
      g.position.z += 40 * delta * speedMultiplier;
      if (g.position.z > 5) {
        g.position.z -= tunnelLength;
      }
    }

    // Swirl particles
    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < pCount; i++) {
      const spd = pSpeeds[i];
      spd.angle += spd.orbitSpeed * delta * speedMultiplier;
      pos[i * 3] = Math.cos(spd.angle) * spd.radius;
      pos[i * 3 + 1] = Math.sin(spd.angle) * spd.radius;
      pos[i * 3 + 2] += spd.zSpeed * delta * speedMultiplier;

      if (pos[i * 3 + 2] > 5) {
        pos[i * 3 + 2] -= tunnelLength;
      }
    }
    pGeo.attributes.position.needsUpdate = true;
  };

  return { root, update, pMat };
}

