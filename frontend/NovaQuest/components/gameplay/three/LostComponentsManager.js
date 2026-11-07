import * as THREE from 'three';

/**
 * LostComponentsManager.js
 * 
 * Manages the 4 physical spacecraft components scattered across the crater by Surveyor 5's landing malfunction:
 * 1. Solar Panel Array (Crater ridge - Amber beacon)
 * 2. Planar High-Gain Antenna (Boulder cluster - Cyan beacon)
 * 3. Television Camera Turret (Impact depression - Sky Blue beacon)
 * 4. Alpha-Scattering Surface Analyzer (Regolith hollow - Emerald beacon)
 * 
 * Features:
 * - High-detail 3D models with physical materials & gold Kapton foil
 * - Skyward vertical light columns (volumetric light beams) visible from afar
 * - Ambient floating sparkle particle systems
 * - Ground targeting decal ring
 * - Interactive proximity detection, pickup animations, and inventory state
 */
export function createLostComponentsManager() {
  const root = new THREE.Group();
  root.name = 'LostComponentsManager';

  // --- Shared Materials ---
  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.18
  });

  const aluminumMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.85,
    roughness: 0.22
  });

  const solarCellMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    metalness: 0.88,
    roughness: 0.12
  });

  const opticalLensMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8
  });

  // =========================================================================
  // 1. COMPONENT DEFINITIONS & 3D MESH BUILDERS
  // =========================================================================
  const componentDefinitions = [
    {
      id: 'solar_panel',
      name: 'Solar Panel Array',
      shortName: 'Solar Panel',
      description: 'Generates electrical power from lunar sunlight to recharge Surveyor 5 batteries.',
      beaconColor: 0xf59e0b, // Amber / Gold
      position: new THREE.Vector3(26, 0.5, -14),
      createMesh: () => {
        const group = new THREE.Group();
        // Solar Panel Body
        const panelGeo = new THREE.BoxGeometry(1.6, 0.05, 0.95);
        const panel = new THREE.Mesh(panelGeo, solarCellMat);
        group.add(panel);

        // Gold foil border frame
        const borderGeo = new THREE.BoxGeometry(1.68, 0.04, 1.02);
        const border = new THREE.Mesh(borderGeo, goldFoilMat);
        group.add(border);

        // Swivel mounting bracket
        const bracketGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 12);
        const bracket = new THREE.Mesh(bracketGeo, aluminumMat);
        bracket.rotation.z = Math.PI / 2;
        bracket.position.y = -0.15;
        group.add(bracket);

        group.rotation.set(0.3, 0.4, 0.2);
        return group;
      }
    },
    {
      id: 'antenna',
      name: 'Planar High-Gain Antenna',
      shortName: 'Comms Antenna',
      description: 'Directional radio dish that transmits live telemetry & scientific data 384,000 km to Earth.',
      beaconColor: 0x06b6d4, // Cyan
      position: new THREE.Vector3(-22, 0.45, -28),
      createMesh: () => {
        const group = new THREE.Group();
        // Dish
        const dishGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.06, 24);
        const dish = new THREE.Mesh(dishGeo, aluminumMat);
        group.add(dish);

        // Gold feed horn mast
        const feedGeo = new THREE.ConeGeometry(0.12, 0.4, 16);
        const feed = new THREE.Mesh(feedGeo, goldFoilMat);
        feed.position.y = 0.25;
        group.add(feed);

        // Gimbal joint
        const jointGeo = new THREE.SphereGeometry(0.1, 12, 12);
        const joint = new THREE.Mesh(jointGeo, aluminumMat);
        joint.position.y = -0.1;
        group.add(joint);

        group.rotation.set(-0.4, 0.8, -0.3);
        return group;
      }
    },
    {
      id: 'tv_camera',
      name: 'Television Camera Turret',
      shortName: 'TV Camera',
      description: 'Vidicon optical imaging turret capable of 360-degree panoramic lunar surface photography.',
      beaconColor: 0x38bdf8, // Sky Blue
      position: new THREE.Vector3(-28, 0.45, -8),
      createMesh: () => {
        const group = new THREE.Group();
        // Camera barrel
        const barrelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.65, 16);
        const barrel = new THREE.Mesh(barrelGeo, aluminumMat);
        group.add(barrel);

        // Lens hood & sapphire optical lens
        const hoodGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.18, 16);
        const hood = new THREE.Mesh(hoodGeo, goldFoilMat);
        hood.rotation.x = Math.PI / 2;
        hood.position.set(0, 0.15, 0.15);
        group.add(hood);

        const lensGeo = new THREE.CircleGeometry(0.09, 16);
        const lens = new THREE.Mesh(lensGeo, opticalLensMat);
        lens.position.set(0, 0.15, 0.25);
        group.add(lens);

        // Optical mirror hood
        const mirrorGeo = new THREE.BoxGeometry(0.24, 0.24, 0.12);
        const mirror = new THREE.Mesh(mirrorGeo, aluminumMat);
        mirror.position.set(0, 0.32, 0);
        group.add(mirror);

        group.rotation.set(0.2, -0.6, 0.4);
        return group;
      }
    },
    {
      id: 'alpha_sensor',
      name: 'Alpha-Scattering Surface Analyzer',
      shortName: 'Alpha Analyzer',
      description: 'Bombards lunar regolith with alpha particles to reveal the Moon chemical composition.',
      beaconColor: 0x10b981, // Emerald Green
      position: new THREE.Vector3(18, 0.4, -38),
      createMesh: () => {
        const group = new THREE.Group();
        // Sensor body
        const boxGeo = new THREE.BoxGeometry(0.42, 0.28, 0.42);
        const box = new THREE.Mesh(boxGeo, goldFoilMat);
        group.add(box);

        // Radioactive source collimator
        const colGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.12, 16);
        const col = new THREE.Mesh(colGeo, aluminumMat);
        col.position.y = -0.16;
        group.add(col);

        // Coiled tether attachment
        const tetherGeo = new THREE.TorusGeometry(0.14, 0.03, 8, 24);
        const tether = new THREE.Mesh(tetherGeo, new THREE.MeshBasicMaterial({ color: 0x475569 }));
        tether.rotation.x = Math.PI / 2;
        tether.position.set(0, 0.15, 0);
        group.add(tether);

        group.rotation.set(0.1, 0.5, -0.2);
        return group;
      }
    }
  ];

  // =========================================================================
  // 2. BUILD COMPONENT NODES WITH BEACONS & SPARKLE PARTICLES
  // =========================================================================
  const components = [];

  componentDefinitions.forEach(def => {
    const compNode = new THREE.Group();
    compNode.position.copy(def.position);
    compNode.userData = {
      id: def.id,
      name: def.name,
      shortName: def.shortName,
      description: def.description,
      beaconColor: def.beaconColor,
      basePos: def.position.clone(),
      collected: false,
      isInstalled: false,
      collectProgress: 0
    };

    // 1. 3D Model
    const model = def.createMesh();
    compNode.add(model);

    // 2. Skyward Vertical Volumetric Light Beam
    const beamGeo = new THREE.CylinderGeometry(0.2, 0.8, 38, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: def.beaconColor,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 19;
    compNode.add(beam);

    // 3. Ground Target Decal Ring
    const ringGeo = new THREE.RingGeometry(0.8, 1.1, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: def.beaconColor,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const groundRing = new THREE.Mesh(ringGeo, ringMat);
    groundRing.rotation.x = -Math.PI / 2;
    groundRing.position.y = -def.position.y + 0.05;
    compNode.add(groundRing);

    // 4. Floating Sparkle Particles
    const pCount = 20;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pData = [];
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 1.5;
      pPos[i * 3 + 1] = Math.random() * 4.0;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      pData.push({
        baseX: pPos[i * 3],
        baseZ: pPos[i * 3 + 2],
        speed: 0.6 + Math.random() * 1.2,
        height: 4.0
      });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: def.beaconColor,
      size: 0.18,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    compNode.add(particles);

    // Point Light for immediate glow
    const pointLight = new THREE.PointLight(def.beaconColor, 2.5, 8);
    pointLight.position.y = 0.8;
    compNode.add(pointLight);

    root.add(compNode);

    components.push({
      def,
      node: compNode,
      model,
      beam,
      groundRing,
      particles,
      pGeo,
      pPos,
      pData,
      pointLight
    });
  });

  // =========================================================================
  // 3. UPDATE & ANIMATION LOOP
  // =========================================================================
  const update = (delta, elapsed) => {
    components.forEach(item => {
      if (item.node.userData.collected) {
        // Shrink away if collected
        if (item.node.scale.x > 0.01) {
          item.node.scale.subScalar(delta * 3.5);
          item.node.position.y += delta * 2.0;
        } else {
          item.node.visible = false;
        }
        return;
      }

      // Gentle floating bob & rotation
      const bob = Math.sin(elapsed * 2.2 + item.def.position.x) * 0.1;
      item.model.position.y = bob;
      item.model.rotation.y += delta * 0.7;

      // Pulse beacon beam & ground ring
      const pulse = 0.3 + Math.sin(elapsed * 4.0) * 0.12;
      item.beam.material.opacity = pulse;
      item.groundRing.scale.setScalar(1.0 + Math.sin(elapsed * 3.0) * 0.1);

      // Animate floating sparkles
      const pPos = item.pPos;
      for (let i = 0; i < item.pData.length; i++) {
        const pd = item.pData[i];
        pPos[i * 3 + 1] += delta * pd.speed;
        if (pPos[i * 3 + 1] > pd.height) {
          pPos[i * 3 + 1] = 0;
        }
      }
      item.pGeo.attributes.position.needsUpdate = true;
    });
  };

  // =========================================================================
  // 4. PROXIMITY & COLLECTION API
  // =========================================================================
  const getNearbyComponent = (playerPos, triggerRadius = 3.8) => {
    let closest = null;
    let minDistance = Infinity;

    for (const item of components) {
      if (item.node.userData.collected) continue;

      const d = playerPos.distanceTo(item.node.userData.basePos);
      if (d <= triggerRadius && d < minDistance) {
        minDistance = d;
        closest = {
          item: item.node.userData,
          distance: d
        };
      }
    }
    return closest;
  };

  const getClosestUncollected = (playerPos) => {
    let closest = null;
    let minDistance = Infinity;

    for (const item of components) {
      if (item.node.userData.collected) continue;

      const d = playerPos.distanceTo(item.node.userData.basePos);
      if (d < minDistance) {
        minDistance = d;
        closest = {
          item: item.node.userData,
          distance: d
        };
      }
    }
    return closest;
  };

  const collectComponent = (id) => {
    const item = components.find(c => c.def.id === id);
    if (item && !item.node.userData.collected) {
      item.node.userData.collected = true;
      return item.def;
    }
    return null;
  };

  const getCollectedCount = () => {
    return components.filter(c => c.node.userData.collected).length;
  };

  const getRemainingCount = () => {
    return components.filter(c => !c.node.userData.collected).length;
  };

  const isAllCollected = () => {
    return components.every(c => c.node.userData.collected);
  };

  const getComponentsList = () => {
    return components.map(c => ({
      id: c.def.id,
      name: c.def.name,
      shortName: c.def.shortName,
      description: c.def.description,
      beaconColor: c.def.beaconColor,
      position: c.def.position,
      collected: c.node.userData.collected,
      installed: c.node.userData.isInstalled
    }));
  };

  return {
    root,
    update,
    getNearbyComponent,
    getClosestUncollected,
    collectComponent,
    getCollectedCount,
    getRemainingCount,
    isAllCollected,
    getComponentsList,
    components
  };
}

