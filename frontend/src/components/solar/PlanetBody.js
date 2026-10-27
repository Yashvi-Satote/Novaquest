import * as THREE from 'three';

/**
 * Procedural Texture Generator for Celestial Bodies
 * Generates rich, realistic planetary surface maps without bulky external downloads.
 */
function createPlanetTexture(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (data.id === 'sun') {
    // Dynamic solar surface gradient with intense nuclear core
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#ff9900');
    grad.addColorStop(0.3, '#ffcc00');
    grad.addColorStop(0.5, '#fff176');
    grad.addColorStop(0.7, '#ffcc00');
    grad.addColorStop(1, '#ff6600');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Turbulent solar granulations & sunspots
    for (let i = 0; i < 4500; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const r = Math.random() * 3.5 + 1;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 255, 220, 0.45)' : 'rgba(200, 60, 0, 0.35)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (data.id === 'earth') {
    // Deep blue oceans with coastal continental shelves
    ctx.fillStyle = '#0a2e5c';
    ctx.fillRect(0, 0, 1024, 512);

    // Continents & landmasses
    const continents = [
      { x: 300, y: 180, rx: 90, ry: 70, col: '#23533e' }, // North America
      { x: 370, y: 320, rx: 70, ry: 90, col: '#2d6a4f' }, // South America
      { x: 530, y: 160, rx: 80, ry: 60, col: '#40916c' }, // Europe
      { x: 540, y: 280, rx: 90, ry: 100, col: '#9c6644' }, // Africa
      { x: 720, y: 180, rx: 140, ry: 90, col: '#23533e' }, // Asia
      { x: 820, y: 340, rx: 70, ry: 60, col: '#ca6702' }   // Australia
    ];

    continents.forEach(c => {
      ctx.fillStyle = c.col;
      for (let j = 0; j < 45; j++) {
        const ox = (Math.random() - 0.5) * c.rx * 1.6;
        const oy = (Math.random() - 0.5) * c.ry * 1.6;
        const rad = Math.random() * 38 + 16;
        ctx.beginPath();
        ctx.arc(c.x + ox, c.y + oy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Swirling atmospheric cloud bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.52)';
    for (let c = 0; c < 80; c++) {
      const cx = Math.random() * 1024;
      const cy = Math.random() * 400 + 56;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.random() * 90 + 25, Math.random() * 16 + 5, Math.random() * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Polar ice caps
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 40);
    ctx.fillRect(0, 472, 1024, 40);

  } else if (data.id === 'jupiter') {
    const bands = [
      '#a06535', '#c89666', '#eedbc5', '#8b4f2c', '#dfb88e',
      '#c27d49', '#f2e5d5', '#9e572d', '#b07246', '#e0c3a2'
    ];
    const bandHeight = 512 / bands.length;
    bands.forEach((bColor, idx) => {
      ctx.fillStyle = bColor;
      ctx.fillRect(0, idx * bandHeight, 1024, bandHeight + 2);
    });

    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 245, 230, 0.35)' : 'rgba(90, 40, 10, 0.35)';
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 65 + 15, Math.random() * 9 + 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // The Great Red Spot
    ctx.fillStyle = '#b33927';
    ctx.beginPath();
    ctx.ellipse(650, 310, 58, 34, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8e2315';
    ctx.beginPath();
    ctx.ellipse(650, 310, 40, 22, 0, 0, Math.PI * 2);
    ctx.fill();

  } else if (data.id === 'saturn') {
    const bands = ['#d4b97a', '#edd8a4', '#c9a861', '#faedd0', '#bfa25f', '#e6c888', '#d6b36d'];
    const h = 512 / bands.length;
    bands.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, i * h, 1024, h + 2);
    });

  } else if (data.id === 'mars') {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#c25227');
    grad.addColorStop(0.5, '#e06f38');
    grad.addColorStop(1, '#993d1b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    ctx.fillStyle = 'rgba(74, 26, 12, 0.45)';
    for (let i = 0; i < 90; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * 1024, Math.random() * 300 + 106, Math.random() * 75 + 20, Math.random() * 32 + 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // White polar caps
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(0, 0, 1024, 28);
    ctx.fillRect(0, 484, 1024, 28);

  } else {
    const palette = data.surfacePalette || ['#64748b', '#94a3b8', '#cbd5e1'];
    ctx.fillStyle = palette[0];
    ctx.fillRect(0, 0, 1024, 512);

    for (let p = 1; p < palette.length; p++) {
      ctx.fillStyle = palette[p];
      for (let i = 0; i < 70; i++) {
        ctx.beginPath();
        const y = Math.random() * 512;
        ctx.ellipse(Math.random() * 1024, y, Math.random() * 130 + 30, Math.random() * 26 + 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createRingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.12, 'rgba(212, 185, 122, 0.85)'); // C Ring
  grad.addColorStop(0.35, 'rgba(237, 216, 164, 0.95)'); // B Ring
  grad.addColorStop(0.62, 'rgba(0, 0, 0, 0.05)');        // Cassini Division
  grad.addColorStop(0.70, 'rgba(191, 162, 95, 0.85)');  // A Ring
  grad.addColorStop(0.85, 'rgba(166, 135, 68, 0.7)');
  grad.addColorStop(0.96, 'rgba(0, 0, 0, 0.1)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Creates radiant solar corona sprite
 */
function createSunCoronaTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.15, 'rgba(255, 235, 150, 0.9)');
  gradient.addColorStop(0.40, 'rgba(255, 160, 20, 0.45)');
  gradient.addColorStop(0.70, 'rgba(255, 90, 0, 0.12)');
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  return new THREE.CanvasTexture(canvas);
}

export class PlanetBody {
  constructor(data, scene) {
    this.data = data;
    this.scene = scene;
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.disposables = [];

    this.orbitPivot = new THREE.Group();
    this.scene.add(this.orbitPivot);

    this.container = new THREE.Group();
    this.orbitPivot.add(this.container);

    this.createBody();
    if (this.data.hasRings) {
      this.createRings();
    }
    if (this.data.hasMoon) {
      this.createMoon();
    }
    if (this.data.distance > 0) {
      this.createOrbitPath();
    }

    this.updatePosition(0);
  }

  createBody() {
    const isSun = this.data.id === 'sun';
    const geometry = new THREE.SphereGeometry(this.data.radius, 48, 48);
    this.disposables.push(geometry);

    const texture = createPlanetTexture(this.data);
    this.disposables.push(texture);

    let material;
    if (isSun) {
      material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0xffffff
      });

      // Increased PointLight intensity with realistic falloff
      this.sunLight = new THREE.PointLight(0xfff8ee, 4.2, 800, 0.4);
      this.container.add(this.sunLight);

      // Warm ambient starlight fill
      const ambientLight = new THREE.AmbientLight(0x1e293b, 0.7);
      this.scene.add(ambientLight);

      // Multi-layer radiant solar corona sprite
      const coronaTexture = createSunCoronaTexture();
      this.disposables.push(coronaTexture);

      const spriteMat = new THREE.SpriteMaterial({
        map: coronaTexture,
        color: 0xffaa00,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      this.disposables.push(spriteMat);

      this.coronaSprite = new THREE.Sprite(spriteMat);
      this.coronaSprite.scale.set(this.data.radius * 3.8, this.data.radius * 3.8, 1);
      this.container.add(this.coronaSprite);

    } else {
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: this.data.id === 'earth' ? 0.6 : 0.75,
        metalness: 0.1
      });

      if (this.data.atmosphere) {
        const atmoGeo = new THREE.SphereGeometry(this.data.radius * 1.035, 32, 32);
        const atmoMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(this.data.atmosphere.glowColor),
          transparent: true,
          opacity: this.data.atmosphere.opacity * 0.8,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide
        });
        this.disposables.push(atmoGeo, atmoMat);
        const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
        this.container.add(atmoMesh);
      }
    }

    this.disposables.push(material);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.userData = { id: this.data.id, name: this.data.name, isPlanet: true };
    this.mesh.rotation.z = THREE.MathUtils.degToRad(this.data.axialTilt || 0);
    this.container.add(this.mesh);

    this.container.position.x = this.data.distance;
  }

  createRings() {
    const ringConfig = this.data.hasRings;
    const ringGeo = new THREE.RingGeometry(ringConfig.innerRadius, ringConfig.outerRadius, 64);
    ringGeo.rotateX(Math.PI / 2);
    this.disposables.push(ringGeo);

    const ringTexture = createRingTexture();
    this.disposables.push(ringTexture);

    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      roughness: 0.85,
      metalness: 0.05
    });
    this.disposables.push(ringMat);

    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.rotation.z = THREE.MathUtils.degToRad(ringConfig.tilt);
    this.container.add(this.ringMesh);
  }

  createMoon() {
    const moonData = this.data.moon;
    const moonGeo = new THREE.SphereGeometry(moonData.radius, 24, 24);
    const moonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(moonData.color),
      roughness: 0.9,
      metalness: 0.05
    });
    this.disposables.push(moonGeo, moonMat);

    this.moonPivot = new THREE.Group();
    this.container.add(this.moonPivot);

    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.x = moonData.distance;
    this.moonPivot.add(this.moonMesh);
  }

  createOrbitPath() {
    const points = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(theta) * this.data.distance,
        0,
        Math.sin(theta) * this.data.distance
      ));
    }

    const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
    this.disposables.push(orbitGeo);

    // Subtle, differentiated orbital guide lines (reduced opacity to eliminate visual clutter)
    const isInnerPlanet = this.data.distance < 45;
    const baseColor = isInnerPlanet ? 0x0ea5e9 : 0x64748b; // Soft cyan for inner, muted slate for outer
    const baseOpacity = isInnerPlanet ? 0.10 : 0.06;

    this.orbitMat = new THREE.LineBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: baseOpacity,
      blending: THREE.AdditiveBlending
    });
    this.disposables.push(this.orbitMat);

    this.orbitLine = new THREE.Line(orbitGeo, this.orbitMat);
    this.scene.add(this.orbitLine);
  }

  setHighlight(highlighted) {
    if (this.orbitMat) {
      const isInnerPlanet = this.data.distance < 45;
      this.orbitMat.opacity = highlighted ? 0.65 : (isInnerPlanet ? 0.10 : 0.06);
      this.orbitMat.color.setHex(highlighted ? 0x22d3ee : (isInnerPlanet ? 0x0ea5e9 : 0x64748b));
    }
  }

  updatePosition(delta, speedMultiplier = 1, isPlaying = true) {
    if (isPlaying && this.data.orbitalPeriod > 0) {
      const baseOrbitSpeed = 0.45;
      const orbitalSpeed = (baseOrbitSpeed / Math.sqrt(this.data.distance)) * speedMultiplier;
      this.orbitAngle += orbitalSpeed * delta;

      this.container.position.x = Math.cos(this.orbitAngle) * this.data.distance;
      this.container.position.z = Math.sin(this.orbitAngle) * this.data.distance;
    }

    if (isPlaying && this.mesh) {
      const rotSpeed = (2.0 / Math.abs(this.data.rotationPeriod || 24)) * speedMultiplier;
      this.mesh.rotation.y += rotSpeed * delta * (this.data.rotationPeriod < 0 ? -1 : 1);
    }

    if (isPlaying && this.moonPivot) {
      this.moonPivot.rotation.y += 0.8 * speedMultiplier * delta;
    }
  }

  getWorldPosition() {
    const target = new THREE.Vector3();
    this.container.getWorldPosition(target);
    return target;
  }

  dispose() {
    if (this.orbitLine) {
      this.scene.remove(this.orbitLine);
    }
    this.scene.remove(this.orbitPivot);

    this.disposables.forEach(item => {
      if (item && typeof item.dispose === 'function') {
        item.dispose();
      }
    });
    this.disposables = [];
  }
}
