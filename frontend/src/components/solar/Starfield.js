import * as THREE from 'three';

/**
 * Procedural Multi-Scale Cosmic Starfield & Milky Way Galactic Band
 * 
 * SCIENTIFIC CLARIFICATION & DISCLAIMER:
 * This starfield and galactic band is an illustrative procedural astronomical model.
 * Stars and dust particles are generated using astronomical spectral temperature
 * distributions and the 60.2° inclination of the Milky Way relative to the solar ecliptic,
 * but DO NOT represent exact catalogued astronomical star coordinates.
 */
export class Starfield {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.pointsGroups = [];
    this.sharedTexture = null;
    this.nebulaTexture = null;
    this.init();
  }

  init() {
    // Shared soft Gaussian point sprite and cosmic dust sprite
    this.sharedTexture = this.createStarSprite();
    this.nebulaTexture = this.createNebulaSprite();

    // 1. Faint Deep Cosmic Background (22,000 stars, radius 18,000 to 34,000 units)
    // Non-uniform distribution: weighted toward the 60.2° tilted galactic disk
    this.pointsGroups.push(this.createGalacticStarLayer({
      count: 22000,
      minRadius: 18000,
      maxRadius: 34000,
      baseSize: 2.2,
      minBrightness: 0.15,
      maxBrightness: 0.65,
      galacticConcentration: 0.58
    }));

    // 2. Mid-Magnitude Stellar Field (7,500 stars, radius 14,000 to 28,000 units)
    // Sharper stars with distinct astronomical spectral temperatures
    this.pointsGroups.push(this.createGalacticStarLayer({
      count: 7500,
      minRadius: 14000,
      maxRadius: 28000,
      baseSize: 3.5,
      minBrightness: 0.40,
      maxBrightness: 0.88,
      galacticConcentration: 0.68
    }));

    // 3. Prominent Navigational Beacons (480 prominent stars, radius 12,000 to 22,000 units)
    // Distinct sparkling stellar beacons with diamond diffraction spikes across major constellations
    this.beaconTexture = this.createBeaconSprite();
    this.pointsGroups.push(this.createGalacticStarLayer({
      count: 480,
      minRadius: 12000,
      maxRadius: 22000,
      baseSize: 6.2,
      minBrightness: 0.88,
      maxBrightness: 1.0,
      galacticConcentration: 0.35, // Distributed across the sky for constellation beacons
      customTexture: this.beaconTexture
    }));

    // 4. The Milky Way Galactic Band (~12,000 soft-blended stellar dust particles)
    // Dense stellar glow along the 60.2° galactic plane with golden core in Sagittarius
    this.pointsGroups.push(this.createGalacticBand());

    // 5. Diffuse Interstellar Nebula Clouds & Absorption Rifts (~6,000 large soft cloud puffs)
    this.pointsGroups.push(this.createNebulaStructures());

    // Add all layers to the celestial sphere group
    this.pointsGroups.forEach(points => this.group.add(points));
  }

  /**
   * Generates a star layer with non-uniform galactic plane concentration
   * based on the 60.2° inclination of the solar ecliptic to the Milky Way disk.
   */
  createGalacticStarLayer({ count, minRadius, maxRadius, baseSize, minBrightness, maxBrightness, galacticConcentration, customTexture }) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Realistic stellar spectral classification palette (O, B, A, F, G, K, M)
    const spectralPalette = [
      new THREE.Color(0xa5c4ff), // Class O/B (Hot Blue-White)
      new THREE.Color(0xf8f9fa), // Class A (Diamond Pure White)
      new THREE.Color(0xfff7ed), // Class F (Warm White)
      new THREE.Color(0xfef08a), // Class G (Sun-like Yellow)
      new THREE.Color(0xfdba74), // Class K (Warm Orange)
      new THREE.Color(0xf87171)  // Class M (Cool Red Dwarf)
    ];

    const tempColor = new THREE.Color();
    const tiltRad = THREE.MathUtils.degToRad(60.2);
    const cosTilt = Math.cos(tiltRad);
    const sinTilt = Math.sin(tiltRad);

    for (let i = 0; i < count; i++) {
      const isGalacticDiskStar = Math.random() < galacticConcentration;
      
      const u = Math.random();
      const v = isGalacticDiskStar
        ? 0.5 + (Math.random() - 0.5) * Math.pow(Math.random(), 1.6) // Clustered near disk equator
        : Math.random();

      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const radius = minRadius + Math.random() * (maxRadius - minRadius);

      const lx = radius * Math.sin(phi) * Math.cos(theta);
      const ly = radius * Math.sin(phi) * Math.sin(theta);
      const lz = radius * Math.cos(phi);

      positions[i * 3] = lx;
      positions[i * 3 + 1] = ly * cosTilt - lz * sinTilt;
      positions[i * 3 + 2] = ly * sinTilt + lz * cosTilt;

      const magWeight = Math.pow(Math.random(), 1.8);
      const brightness = minBrightness + magWeight * (maxBrightness - minBrightness);

      const baseColor = spectralPalette[Math.floor(Math.random() * spectralPalette.length)];
      tempColor.copy(baseColor).multiplyScalar(brightness);

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: baseSize,
      vertexColors: true,
      map: customTexture || this.sharedTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geometry, material);
  }

  /**
   * Procedural Milky Way galactic band with diffuse interstellar dust clouds
   * and luminous core concentration in Sagittarius.
   */
  createGalacticBand() {
    const count = 12000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const bandPalette = [
      new THREE.Color(0x93c5fd), // Soft cyan-blue starlight
      new THREE.Color(0xe0e7ff), // Faint violet-white
      new THREE.Color(0xfef3c7), // Warm starlight glow
      new THREE.Color(0xfde68a), // Golden stellar dust
      new THREE.Color(0xf59e0b), // Deep amber galactic core
      new THREE.Color(0xf472b6)  // Interstellar emission nebula
    ];

    const tempColor = new THREE.Color();
    const bandRadius = 22000;
    const tiltRad = THREE.MathUtils.degToRad(60.2);
    const cosTilt = Math.cos(tiltRad);
    const sinTilt = Math.sin(tiltRad);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Galactic core concentration in Sagittarius (~255° to 310°)
      const isCore = Math.random() < 0.38 && (angle > 4.2 && angle < 5.5);

      const r = isCore 
        ? bandRadius * (0.80 + Math.random() * 0.40)
        : bandRadius * (0.70 + Math.random() * 0.60);

      const heightSpread = isCore ? 3200 : 1600;
      let h = (Math.random() + Math.random() - 1.0) * heightSpread;

      // Great Rift absorption lane in Cygnus-Aquila region (~70° to 135°):
      // Push dust outward from the exact midplane to create dark absorption rift
      if (angle > 1.2 && angle < 2.35) {
        if (Math.abs(h) < 450) {
          h += Math.sign(h || 1) * 450;
        }
      }

      const lx = Math.cos(angle) * r;
      const ly = h;
      const lz = Math.sin(angle) * r;

      positions[i * 3] = lx;
      positions[i * 3 + 1] = ly * cosTilt - lz * sinTilt;
      positions[i * 3 + 2] = ly * sinTilt + lz * cosTilt;

      const baseColor = isCore 
        ? bandPalette[3 + Math.floor(Math.random() * 3)] // Warm golden core
        : bandPalette[Math.floor(Math.random() * 4)];

      tempColor.copy(baseColor);
      const opacity = isCore ? (0.22 + Math.random() * 0.28) : (0.08 + Math.random() * 0.20);
      tempColor.multiplyScalar(opacity);

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 4.8,
      vertexColors: true,
      map: this.nebulaTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geometry, material);
  }

  /**
   * Layer of large, ethereal interstellar dust clouds providing volumetric depth
   */
  createNebulaStructures() {
    const count = 5500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const nebulaPalette = [
      new THREE.Color(0x38bdf8), // Cyan reflection nebula
      new THREE.Color(0x6366f1), // Deep indigo
      new THREE.Color(0xf43f5e), // Faint H-alpha emission
      new THREE.Color(0xd97706)  // Core dust glow
    ];

    const tempColor = new THREE.Color();
    const bandRadius = 20000;
    const tiltRad = THREE.MathUtils.degToRad(60.2);
    const cosTilt = Math.cos(tiltRad);
    const sinTilt = Math.sin(tiltRad);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = bandRadius * (0.65 + Math.random() * 0.70);
      const h = (Math.random() + Math.random() - 1.0) * 2200;

      const lx = Math.cos(angle) * r;
      const ly = h;
      const lz = Math.sin(angle) * r;

      positions[i * 3] = lx;
      positions[i * 3 + 1] = ly * cosTilt - lz * sinTilt;
      positions[i * 3 + 2] = ly * sinTilt + lz * cosTilt;

      const baseColor = nebulaPalette[Math.floor(Math.random() * nebulaPalette.length)];
      tempColor.copy(baseColor);
      // Very faint, non-overwhelming opacity for subtle depth
      const opacity = 0.04 + Math.random() * 0.08;
      tempColor.multiplyScalar(opacity);

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 14.0, // Large soft puffs
      vertexColors: true,
      map: this.nebulaTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geometry, material);
  }

  createStarSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.18, 'rgba(255, 255, 255, 0.85)');
    gradient.addColorStop(0.42, 'rgba(220, 235, 255, 0.32)');
    gradient.addColorStop(0.72, 'rgba(180, 210, 255, 0.06)');
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  createBeaconSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Central circular glow
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.25, 'rgba(235, 245, 255, 0.9)');
    gradient.addColorStop(0.55, 'rgba(180, 210, 255, 0.25)');
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    // Subtle diamond / cross diffraction spikes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(32, 6);
    ctx.lineTo(32, 58);
    ctx.moveTo(6, 32);
    ctx.lineTo(58, 32);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  createNebulaSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    gradient.addColorStop(0.28, 'rgba(220, 230, 255, 0.35)');
    gradient.addColorStop(0.65, 'rgba(160, 190, 255, 0.10)');
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  /**
   * Updates the celestial sphere position to track the camera.
   * This guarantees that camera movement never makes the background appear empty or sparse,
   * while maintaining the astronomical reality that cosmic stars have zero perceptible parallax
   * across interplanetary and interstellar navigation.
   */
  update(camera) {
    if (camera && this.group) {
      this.group.position.copy(camera.position);
    }
  }

  dispose() {
    this.scene.remove(this.group);
    this.pointsGroups.forEach(points => {
      this.group.remove(points);
      if (points.geometry) points.geometry.dispose();
      if (points.material) points.material.dispose();
    });
    if (this.sharedTexture) {
      this.sharedTexture.dispose();
      this.sharedTexture = null;
    }
    if (this.beaconTexture) {
      this.beaconTexture.dispose();
      this.beaconTexture = null;
    }
    if (this.nebulaTexture) {
      this.nebulaTexture.dispose();
      this.nebulaTexture = null;
    }
    this.pointsGroups = [];
  }
}
