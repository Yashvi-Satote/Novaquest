import * as THREE from 'three';

/**
 * AsteroidBelt
 * Realistic GPU InstancedMesh asteroid particle swarm orbiting between Mars and Jupiter.
 * Calibrated for the Main Asteroid Belt (2.1 to 3.3 AU, centered around Ceres at 2.77 AU / radius 48.0 in scene units).
 * Uses a single GPU draw call via THREE.InstancedMesh for maximum 60+ FPS performance.
 */
export class AsteroidBelt {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.count = options.count || 3200;
    this.minRadius = options.minRadius || 43.5; // Just outside Mars (baseSceneDistance: 40.0)
    this.maxRadius = options.maxRadius || 52.8; // Just inside Jupiter (baseSceneDistance: 56.0)
    this.disposables = [];
    this.isVisible = true;

    this.group = new THREE.Group();
    this.group.name = 'asteroid_belt';
    this.scene.add(this.group);

    this.init();
  }

  init() {
    // Low-poly irregular asteroid geometry with vertex perturbation
    const baseGeo = new THREE.DodecahedronGeometry(0.12, 1);
    
    // Add randomized vertex perturbation for rocky asteroid shapes
    const pos = baseGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const noise = 1.0 + (Math.sin(vx * 14.0) * Math.cos(vy * 14.0) + Math.sin(vz * 11.0)) * 0.18;
      pos.setXYZ(i, vx * noise, vy * noise, vz * noise);
    }
    baseGeo.computeVertexNormals();
    this.disposables.push(baseGeo);

    // Realistic PBR chondritic carbonaceous/silicate rock material
    const material = new THREE.MeshStandardMaterial({
      color: 0x82828e,
      roughness: 0.88,
      metalness: 0.12,
      flatShading: true
    });
    this.disposables.push(material);

    this.instancedMesh = new THREE.InstancedMesh(baseGeo, material, this.count);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // Store per-asteroid orbital parameters: [radius, angle, speed, verticalOffset]
    this.orbitalData = new Float32Array(this.count * 4);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < this.count; i++) {
      // Gaussian radial distribution peaking around Ceres (radius 48.0)
      const u1 = Math.random();
      const u2 = Math.random();
      const randNorm = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
      const radius = 48.0 + randNorm * 2.2;
      const clampedRadius = Math.max(this.minRadius, Math.min(this.maxRadius, radius));

      const angle = Math.random() * Math.PI * 2;
      // Slight vertical dispersion with Kirkwood-gap style thinning
      const verticalOffset = (Math.random() - 0.5) * 1.5 * (1.0 - Math.abs(clampedRadius - 48.0) / 6.0);
      
      // Keplerian differential orbital velocity: v ~ 1 / sqrt(r)
      const baseSpeed = 0.038 / Math.sqrt(clampedRadius / 48.0);
      const speed = baseSpeed * (0.92 + Math.random() * 0.16);

      this.orbitalData[i * 4 + 0] = clampedRadius;
      this.orbitalData[i * 4 + 1] = angle;
      this.orbitalData[i * 4 + 2] = speed;
      this.orbitalData[i * 4 + 3] = verticalOffset;

      const scale = 0.45 + Math.random() * 1.1;
      dummy.position.set(
        Math.cos(angle) * clampedRadius,
        verticalOffset,
        Math.sin(angle) * clampedRadius
      );
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      dummy.scale.set(scale * (0.8 + Math.random() * 0.4), scale, scale * (0.8 + Math.random() * 0.4));
      dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(i, dummy.matrix);

      // Spectral asteroid classification coloring:
      // ~65% C-type (dark carbonaceous chondrites)
      // ~25% S-type (silicate / stony iron)
      // ~10% M-type (nickel-iron metallic)
      const pType = Math.random();
      if (pType < 0.65) {
        color.setRGB(0.28 + Math.random() * 0.08, 0.28 + Math.random() * 0.08, 0.30 + Math.random() * 0.08);
      } else if (pType < 0.90) {
        color.setRGB(0.42 + Math.random() * 0.1, 0.35 + Math.random() * 0.08, 0.28 + Math.random() * 0.08);
      } else {
        color.setRGB(0.52 + Math.random() * 0.1, 0.52 + Math.random() * 0.1, 0.55 + Math.random() * 0.1);
      }
      this.instancedMesh.setColorAt(i, color);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    this.group.add(this.instancedMesh);
  }

  update(deltaSeconds = 0.016, speedMultiplier = 1.0) {
    if (!this.isVisible || !this.instancedMesh) return;
    const dummy = new THREE.Object3D();
    const effectiveDelta = deltaSeconds * speedMultiplier;

    // Advance orbital angles
    for (let i = 0; i < this.count; i++) {
      const idx = i * 4;
      const radius = this.orbitalData[idx + 0];
      let angle = this.orbitalData[idx + 1];
      const speed = this.orbitalData[idx + 2];
      const vOffset = this.orbitalData[idx + 3];

      angle += speed * effectiveDelta;
      this.orbitalData[idx + 1] = angle;

      dummy.position.set(
        Math.cos(angle) * radius,
        vOffset,
        Math.sin(angle) * radius
      );
      dummy.rotation.y += 0.18 * effectiveDelta;
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  setVisible(visible) {
    this.isVisible = visible;
    this.group.visible = visible;
  }

  dispose() {
    this.disposables.forEach(d => {
      if (d && typeof d.dispose === 'function') d.dispose();
    });
    this.disposables = [];
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}

