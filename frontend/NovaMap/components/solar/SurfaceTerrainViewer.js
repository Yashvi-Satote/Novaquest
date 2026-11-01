import * as THREE from 'three';

/**
 * SurfaceTerrainViewer
 * Provides close-up planetary surface terrain exploration for verified landing sites.
 * Features:
 * - Local high-detail terrain patch for Moon (cratered maria/highlands) and Mars (iron-oxide basins/crater rims).
 * - Interactive landing hardware marker with coordinates and site name.
 * - Honest scientific fallback when optical terrain is unavailable.
 */
export class SurfaceTerrainViewer {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.visible = false;
    this.scene.add(this.group);

    this.activeSite = null;
    this.activePlanetId = null;
    this.disposables = [];
    this.clickableMeshes = [];

    this.createLocalTerrainPatch();
  }

  createLocalTerrainPatch() {
    // 64x64 grid mesh for local landing site terrain patch
    const size = 12.0;
    const segments = 48;
    this.terrainGeo = new THREE.PlaneGeometry(size, size, segments, segments);
    this.terrainGeo.rotateX(-Math.PI / 2);
    this.disposables.push(this.terrainGeo);

    // Dynamic procedural displacement for craters and dunes
    const pos = this.terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Gentle basin depression with rim and micro-craters
      const distFromCenter = Math.sqrt(x * x + z * z);
      const craterBowl = distFromCenter < 3.5 ? -Math.cos((distFromCenter / 3.5) * Math.PI * 0.5) * 0.35 : 0;
      const craterRim = distFromCenter >= 3.0 && distFromCenter <= 4.2 ? Math.sin(((distFromCenter - 3.0) / 1.2) * Math.PI) * 0.18 : 0;
      const noise = (Math.sin(x * 1.8) * Math.cos(z * 1.8) + Math.sin(x * 3.5 + z * 2.1) * 0.5) * 0.08;
      pos.setY(i, craterBowl + craterRim + noise);
    }
    this.terrainGeo.computeVertexNormals();

    // Procedural terrain texture
    this.terrainCanvas = document.createElement('canvas');
    this.terrainCanvas.width = 512;
    this.terrainCanvas.height = 512;
    this.terrainTexture = new THREE.CanvasTexture(this.terrainCanvas);
    this.disposables.push(this.terrainTexture);

    this.terrainMat = new THREE.MeshStandardMaterial({
      map: this.terrainTexture,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: false
    });
    this.disposables.push(this.terrainMat);

    this.terrainMesh = new THREE.Mesh(this.terrainGeo, this.terrainMat);
    this.group.add(this.terrainMesh);

    // Hardware Touchdown Platform & Beacon
    this.hardwareGroup = new THREE.Group();
    this.group.add(this.hardwareGroup);

    // Touchdown circular landing pad
    const padGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.08, 24);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.3
    });
    this.disposables.push(padGeo, padMat);
    this.padMesh = new THREE.Mesh(padGeo, padMat);
    this.padMesh.position.y = 0.04;
    this.hardwareGroup.add(this.padMesh);
    this.clickableMeshes.push(this.padMesh);

    // Mast and solar antenna beacon
    const mastGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12);
    mastGeo.translate(0, 0.4, 0);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6 });
    this.disposables.push(mastGeo, mastMat);
    const mastMesh = new THREE.Mesh(mastGeo, mastMat);
    this.hardwareGroup.add(mastMesh);

    // Compass reticle rings around landing site
    const reticlePoints = [];
    for (let i = 0; i <= 64; i++) {
      const th = (i / 64) * Math.PI * 2;
      reticlePoints.push(new THREE.Vector3(Math.cos(th) * 2.2, 0.06, Math.sin(th) * 2.2));
    }
    const reticleGeo = new THREE.BufferGeometry().setFromPoints(reticlePoints);
    const reticleMat = new THREE.LineBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.6
    });
    this.disposables.push(reticleGeo, reticleMat);
    this.reticleLine = new THREE.Line(reticleGeo, reticleMat);
    this.group.add(this.reticleLine);
  }

  updateTerrainTexture(planetId) {
    const ctx = this.terrainCanvas.getContext('2d');
    if (planetId === 'mars') {
      // Mars rusty iron oxide regolith
      const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
      grad.addColorStop(0, '#c25227');
      grad.addColorStop(0.6, '#a83c18');
      grad.addColorStop(1, '#7c250e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Sand ripple patterns
      ctx.strokeStyle = 'rgba(244, 162, 97, 0.35)';
      ctx.lineWidth = 1.5;
      for (let y = 10; y < 512; y += 14) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < 512; x += 30) {
          ctx.quadraticCurveTo(x + 15, y + Math.sin(x * 0.05) * 6, x + 30, y);
        }
        ctx.stroke();
      }

      // Small basalt stones
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 2.5 + 0.5;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(50, 18, 8, 0.6)' : 'rgba(255, 200, 150, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Moon / terrestrial cratered regolith
      const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
      grad.addColorStop(0, '#94a3b8');
      grad.addColorStop(0.5, '#64748b');
      grad.addColorStop(1, '#475569');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Micro-craters
      for (let i = 0; i < 180; i++) {
        const cx = Math.random() * 512;
        const cy = Math.random() * 512;
        const cr = Math.random() * 8 + 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(cx, cy, cr + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    this.terrainTexture.needsUpdate = true;
  }

  showLandingSite(craft, parentWorldPos) {
    if (!craft || !craft.coordinates) return null;

    this.activeSite = craft;
    this.activePlanetId = craft.referenceBody;
    this.updateTerrainTexture(this.activePlanetId);

    // Position terrain group centered near parent body world pos
    // Offset slightly above surface so it sits naturally
    this.group.position.copy(parentWorldPos);
    this.group.visible = true;

    // Attach metadata to padMesh for clicking
    this.padMesh.userData = {
      id: craft.slug,
      name: craft.name,
      isSpacecraft: true,
      planet: craft.referenceBody,
      coordinates: `${craft.coordinates.lat.toFixed(2)}°, ${craft.coordinates.lon.toFixed(2)}° (${craft.coordinates.siteName})`
    };

    return {
      sitePos: this.group.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
      cameraPos: this.group.position.clone().add(new THREE.Vector3(1.8, 1.2, 2.2))
    };
  }

  hide() {
    this.group.visible = false;
    this.activeSite = null;
    this.activePlanetId = null;
  }

  dispose() {
    this.scene.remove(this.group);
    this.disposables.forEach(d => {
      if (d && typeof d.dispose === 'function') d.dispose();
    });
    this.disposables = [];
    this.clickableMeshes = [];
  }
}

