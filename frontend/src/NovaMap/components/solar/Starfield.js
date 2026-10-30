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

    // 1. Faint Celestial Background (18,000 stars, radius 18,000 to 32,000 units)
    // Non-uniform distribution: weighted toward the 60.2° tilted galactic disk
    this.pointsGroups.push(this.createGalacticStarLayer({
      count: 18000,
      minRadius: 18000,
      maxRadius: 32000,
      baseSize: 2.2,
      minBrightness: 0.15,
      maxBrightness: 0.65,
      galacticConcentration: 0.55
    }));

    // 2. Mid-Magnitude Stellar Field (6,000 stars, radius 14,000 to 26,000 units)
    // Sharper stars with distinct astronomical spectral temperatures
    this.pointsGroups.push(this.createGalacticStarLayer({
      count: 6000,
      minRadius: 14000,
      maxRadius: 26000,
      baseSize: 3.4,
      minBrightness: 0.40,
      maxBrightness: 0.85,
      galacticConcentration: 0.65
    }));

    // 3. Prominent Navigational Beacons (420 prominent stars, radius 12,000 to 22,000 units)
    // Distinct sparkling stellar beacons across major constellations
    this.pointsGroups.push(this.createGalacticStarLayer({
      count: 420,
      minRadius: 12000,
      maxRadius: 22000,
      baseSize: 5.2,
      minBrightness: 0.85,
      maxBrightness: 1.0,
      galacticConcentration: 0.35 // Distributed across the sky for constellation beacons
    }));

    // 4. The Milky Way Galactic Band & Core Glow (~12,000 soft-blended nebula dust particles)
    // Dense stellar glow along the 60.2° galactic plane with golden core in Sagittarius
    this.pointsGroups.push(this.createGalacticBand());

    // Add all layers to the celestial sphere group
    this.pointsGroups.forEach(points => this.group.add(points));
  }

  /**
   * Generates a star layer with non-uniform galactic plane concentration
   * based on the 60.2° inclination of the solar ecliptic to the Milky Way disk.
   */
  createGalacticStarLayer({ count, minRadius, maxRadius, baseSize, minBrightness, maxBrightness, galacticConcentration }) {
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
      // Non-uniform galactic latitude distribution:
      // With probability `galacticConcentration`, compress latitude closer to the galactic equator
      const isGalacticDiskStar = Math.random() < galacticConcentration;
      
      const u = Math.random();
      const v = isGalacticDiskStar
        ? 0.5 + (Math.random() - 0.5) * Math.pow(Math.random(), 1.6) // Clustered near disk equator
        : Math.random(); // Uniform across sky

      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const radius = minRadius + Math.random() * (maxRadius - minRadius);

      // Local galactic coordinates
      const lx = radius * Math.sin(phi) * Math.cos(theta);
      const ly = radius * Math.sin(phi) * Math.sin(theta);
      const lz = radius * Math.cos(phi);

      // Rotate by 60.2° to match orientation relative to solar ecliptic
      positions[i * 3] = lx;
      positions[i * 3 + 1] = ly * cosTilt - lz * sinTilt;
      positions[i * 3 + 2] = ly * sinTilt + lz * cosTilt;

      // Astronomical magnitude power-law: dimmer stars are vastly more frequent
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
      map: this.sharedTexture,
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
      // Normal-like distribution for disk thickness
      const h = (Math.random() + Math.random() - 1.0) * heightSpread;

      const lx = Math.cos(angle) * r;
      const ly = h;
      const lz = Math.sin(angle) * r;

      // Rotate by 60.2° to match solar ecliptic
      positions[i * 3] = lx;
      positions[i * 3 + 1] = ly * cosTilt - lz * sinTilt;
      positions[i * 3 + 2] = ly * sinTilt + lz * cosTilt;

      const baseColor = isCore 
        ? bandPalette[3 + Math.floor(Math.random() * 3)] // Warm golden core
        : bandPalette[Math.floor(Math.random() * 4)];

      tempColor.copy(baseColor);
      // Soft, non-overwhelming opacity
      const opacity = isCore ? (0.22 + Math.random() * 0.30) : (0.08 + Math.random() * 0.22);
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
    if (this.nebulaTexture) {
      this.nebulaTexture.dispose();
      this.nebulaTexture = null;
    }
    this.pointsGroups = [];
  }
}
