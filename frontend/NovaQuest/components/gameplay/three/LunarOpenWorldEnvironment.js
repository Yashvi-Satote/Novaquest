import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createSurveyor5InteractiveLander } from './Surveyor5InteractiveLander';

/**
 * LunarOpenWorldEnvironment.js
 * 
 * Expansive 3D Open-World Lunar Landscape (Sea of Tranquility)
 * Features:
 * - 240m x 240m cratered terrain with procedural displacement
 * - Authentic Apollo Lunar Module (`apollo_lm.glb`) loaded via GLTFLoader
 * - Interactive Surveyor 5 lander with dynamic repair mechanics
 * - Cargo supply crate with glowing solar coupler item
 * - Realistic boulders, scientific comms antenna, and NASA marker flag
 * - Blue glowing Earth in the deep-space starfield
 */
export function createLunarOpenWorldEnvironment(onLanderLoaded = null) {
  const root = new THREE.Group();
  root.name = 'LunarOpenWorld';

  const texLoader = new THREE.TextureLoader();
  const moonTex = texLoader.load('/textures/planets/moon.jpg');
  moonTex.wrapS = THREE.RepeatWrapping;
  moonTex.wrapT = THREE.RepeatWrapping;
  moonTex.repeat.set(24, 24);

  const earthTex = texLoader.load('/textures/planets/earth_day.jpg');

  // 1. Cratered Lunar Terrain (240m x 240m)
  const groundGeo = new THREE.PlaneGeometry(240, 240, 64, 64);
  const posAttr = groundGeo.attributes.position;

  // Deform geometry with craters and gentle ridges
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);

    // Main crater bowl where Surveyor 5 sits around (12, -22)
    const dSurveyor = Math.sqrt((vx - 12) * (vx - 12) + (vy - -22) * (vy - -22));
    let crater1 = 0;
    if (dSurveyor < 18) {
      crater1 = -Math.cos((dSurveyor / 18) * Math.PI) * 0.9 - 0.4;
    }

    // Secondary smaller craters and rolling ridges
    const wave = Math.sin(vx * 0.08) * Math.cos(vy * 0.08) * 0.75;
    const wave2 = Math.sin(vx * 0.03 + 1.2) * Math.cos(vy * 0.03 - 0.5) * 1.2;

    posAttr.setZ(i, crater1 + wave + wave2);
  }
  groundGeo.computeVertexNormals();

  const groundMat = new THREE.MeshStandardMaterial({
    map: moonTex,
    roughness: 0.95,
    metalness: 0.05
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = 0;
  groundMesh.receiveShadow = true;
  root.add(groundMesh);

  // 2. Starfield & Earth in Sky
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1800;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    starPos[i] = (Math.random() - 0.5) * 900;
    starPos[i + 1] = Math.random() * 450 + 20;
    starPos[i + 2] = (Math.random() - 0.5) * 900;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.1, transparent: true, opacity: 0.85 });
  root.add(new THREE.Points(starGeo, starMat));

  // 3D Blue Marble Earth
  const earthGeo = new THREE.SphereGeometry(10, 36, 36);
  const earthMat = new THREE.MeshStandardMaterial({ map: earthTex, roughness: 0.6, metalness: 0.1 });
  const earthMesh = new THREE.Mesh(earthGeo, earthMat);
  earthMesh.position.set(70, 95, -160);
  root.add(earthMesh);

  // 3. Harsh Lunar Sunlight & Earthshine Lighting
  const sunLight = new THREE.DirectionalLight(0xfffaed, 3.2);
  sunLight.position.set(45, 60, 35);
  sunLight.castShadow = true;
  root.add(sunLight);

  const earthshine = new THREE.AmbientLight(0x38bdf8, 0.45); // cool blue earthshine fill
  root.add(earthshine);

  // 4. Scattered Lunar Boulders (Realistic Rocks of varying sizes)
  const rockGeo = new THREE.DodecahedronGeometry(0.8, 1);
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.95 });
  for (let i = 0; i < 50; i++) {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    const rx = (Math.random() - 0.5) * 160;
    const rz = (Math.random() - 0.5) * 160;
    // Keep area around lander and surveyor clear
    if (Math.hypot(rx, rz - 18) > 6 && Math.hypot(rx - 12, rz + 22) > 6) {
      const s = 0.4 + Math.random() * 1.4;
      rock.scale.set(s, s * 0.7, s);
      rock.position.set(rx, s * 0.35, rz);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      root.add(rock);
    }
  }

  // 5. Human Spacecraft (Apollo Lunar Module)
  const humanLanderGroup = new THREE.Group();
  humanLanderGroup.position.set(0, 0, 18);
  root.add(humanLanderGroup);

  // Load genuine Apollo LM GLB model
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    '/models/spacecraft/apollo_lm.glb',
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(1.4, 1.4, 1.4);
      model.position.set(0, 0, 0);
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      humanLanderGroup.add(model);
      if (onLanderLoaded) onLanderLoaded(model);
    },
    undefined,
    (err) => {
      console.warn('Fallback: Building procedural human spacecraft frame', err);
      // Fallback procedural lander if GLB fails
      const fGeo = new THREE.CylinderGeometry(1.4, 2.0, 2.6, 16);
      const fMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.6 });
      const fMesh = new THREE.Mesh(fGeo, fMat);
      fMesh.position.y = 1.8;
      humanLanderGroup.add(fMesh);
    }
  );

  // Equipment Supply Cargo Crate (On the Human Lander)
  // This is where Leo retrieves the replacement Solar Coupler!
  const cargoGroup = new THREE.Group();
  cargoGroup.position.set(-2.8, 0.5, 18.2);
  root.add(cargoGroup);

  const crateMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.9, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 })
  );
  crateMesh.position.y = 0.45;
  cargoGroup.add(crateMesh);

  // Glowing Tool Marker on Cargo Crate
  const crateLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
  );
  crateLed.position.set(0, 0.95, 0);
  cargoGroup.add(crateLed);

  const crateLight = new THREE.PointLight(0x06b6d4, 2.0, 6);
  crateLight.position.set(0, 1.1, 0);
  cargoGroup.add(crateLight);

  // 6. Surveyor 5 Interactive Lander
  const surveyorLander = createSurveyor5InteractiveLander();
  surveyorLander.root.position.set(12, 0.1, -22); // In the crater ~42 meters away
  root.add(surveyorLander.root);

  // 7. NASA Communication Relay Antenna (Nearby prop)
  const commsGroup = new THREE.Group();
  commsGroup.position.set(-8, 0, 10);
  root.add(commsGroup);

  const dishPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 3.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
  );
  dishPole.position.y = 1.6;
  commsGroup.add(dishPole);

  const dishMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 0.2, 0.35, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 })
  );
  dishMesh.position.set(0, 3.2, 0);
  dishMesh.rotation.x = -0.5;
  commsGroup.add(dishMesh);

  const commsBeacon = new THREE.PointLight(0x38bdf8, 1.5, 8);
  commsBeacon.position.set(0, 3.5, 0);
  commsGroup.add(commsBeacon);

  // 8. Update loop
  const update = (delta, timeSeconds) => {
    // Earth slow spin
    earthMesh.rotation.y += 0.02 * delta;

    // Update Surveyor 5 interactive animations & sparks
    surveyorLander.update(delta, timeSeconds);

    // Pulse crate beacon
    crateLight.intensity = 1.8 + Math.sin(timeSeconds * 4) * 0.8;
  };

  return {
    root,
    update,
    surveyorLander,
    humanLanderGroup,
    cargoGroup,
    positions: {
      humanLander: new THREE.Vector3(0, 0, 18),
      cargoCrate: new THREE.Vector3(-2.8, 0.5, 18.2),
      surveyor5: new THREE.Vector3(12, 0.1, -22)
    }
  };
}
