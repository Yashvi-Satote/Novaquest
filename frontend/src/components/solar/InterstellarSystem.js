import * as THREE from 'three';
import { 
  INTERSTELLAR_PROBES, 
  HELIOSPHERE_BOUNDARIES, 
  AU_TO_SCENE_SCALE 
} from './interstellarData';
import { getSpacecraftTimePosition } from './ephemeris';

/**
 * InterstellarSystem
 * Renders the outer solar system boundary, heliosphere, and interstellar escape probes.
 * 
 * NASA EYES VISUAL ARCHITECTURE:
 * - Interstellar probes (Voyager 1/2, Pioneer 10/11, New Horizons) are represented by clean
 *   white blinking dots with readable name labels and subtle escape trajectories.
 * - ZERO 3D models in the global scene graph: eliminates oversized geometry from obscuring the Solar System.
 * - Trajectories are subtle dashed paths (opacity 0.12) that illuminate to 0.85 when selected.
 * - Generous invisible hit proxies ensuring reliable 1-click raycasting from deep space.
 */
export class InterstellarSystem {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.probeMeshes = new Map();
    this.trajectoryLines = new Map();
    this.dotSprites = new Map();
    this.haloSprites = new Map();
    this.labelSprites = new Map();
    this.clickableMeshes = [];
    this.disposables = [];
    this.selectedSlug = null;
    this.hoveredSlug = null;

    // Visibility
    this.visibleMarkers = true;
    this.visibleTrajectories = true;

    // Pre-allocated scratch vectors for zero-allocation updates
    this.scratchCamPos = new THREE.Vector3();
    this.scratchWorldPos = new THREE.Vector3();

    // Textures
    this.whiteDotTexture = this.createWhiteDotTexture();
    this.pulseHaloTexture = this.createPulseHaloTexture();

    this.initHeliosphereBoundaries();
    this.initProbes();
  }

  createWhiteDotTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.55, 'rgba(224, 242, 254, 0.45)');
    grad.addColorStop(0.85, 'rgba(186, 230, 253, 0.12)');
    grad.addColorStop(1.0, 'rgba(186, 230, 253, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  createPulseHaloTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(32, 32, 22, 0, Math.PI * 2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.stroke();

    const grad = ctx.createRadialGradient(32, 32, 16, 32, 32, 28);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.0)');
    grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.35)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.fillStyle = grad;
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  createLabelSprite(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(8, 14, 28, 0.82)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(16, 10, 352, 44, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 192, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    this.disposables.push(texture);

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    this.disposables.push(spriteMat);

    const labelSprite = new THREE.Sprite(spriteMat);
    labelSprite.scale.set(16.0, 2.7, 1);
    return labelSprite;
  }

  initHeliosphereBoundaries() {
    // 1. Termination Shock Demarcation (~94 AU = ~300.8 scene units)
    const termRadius = HELIOSPHERE_BOUNDARIES.terminationShockAU * AU_TO_SCENE_SCALE;
    const termRingGeo = new THREE.RingGeometry(termRadius - 1.2, termRadius + 1.2, 96);
    termRingGeo.rotateX(Math.PI / 2);
    const termRingMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending
    });
    this.group.add(new THREE.Mesh(termRingGeo, termRingMat));
    this.disposables.push(termRingGeo, termRingMat);

    // 2. Heliopause Boundary Interface (~121.6 AU = ~389 scene units)
    const helioRadius = HELIOSPHERE_BOUNDARIES.heliopauseAU * AU_TO_SCENE_SCALE;
    const helioRingGeo = new THREE.RingGeometry(helioRadius - 1.8, helioRadius + 1.8, 96);
    helioRingGeo.rotateX(Math.PI / 2);
    const helioRingMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });
    this.group.add(new THREE.Mesh(helioRingGeo, helioRingMat));
    this.disposables.push(helioRingGeo, helioRingMat);
  }

  initProbes() {
    INTERSTELLAR_PROBES.forEach((probe, idx) => {
      const radLat = THREE.MathUtils.degToRad(probe.eclipticLatitudeDeg);
      const radLon = THREE.MathUtils.degToRad(probe.eclipticLongitudeDeg);
      const r = probe.distanceAU * AU_TO_SCENE_SCALE;

      const posX = r * Math.cos(radLat) * Math.cos(radLon);
      const posY = r * Math.sin(radLat);
      const posZ = r * Math.cos(radLat) * Math.sin(radLon);

      const probeGroup = new THREE.Group();
      probeGroup.position.set(posX, posY, posZ);
      this.group.add(probeGroup);
      this.probeMeshes.set(probe.slug, probeGroup);

      // White Blinking Dot Sprite
      const dotMat = new THREE.SpriteMaterial({
        map: this.whiteDotTexture,
        color: 0xffffff,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      this.disposables.push(dotMat);

      const dotSprite = new THREE.Sprite(dotMat);
      dotSprite.scale.set(4.0, 4.0, 1);
      probeGroup.add(dotSprite);
      this.dotSprites.set(probe.slug, dotSprite);

      // Subtle Selection / Hover Halo Ring
      const haloMat = new THREE.SpriteMaterial({
        map: this.pulseHaloTexture,
        transparent: true,
        opacity: 0.0,
        depthTest: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      this.disposables.push(haloMat);

      const haloSprite = new THREE.Sprite(haloMat);
      haloSprite.scale.set(9.0, 9.0, 1);
      probeGroup.add(haloSprite);
      this.haloSprites.set(probe.slug, haloSprite);

      // Readable Billboard Label Sprite
      const labelSprite = this.createLabelSprite(probe.name);
      labelSprite.position.y = 5.5;
      labelSprite.visible = true; // Interstellar probes are milestone landmarks
      probeGroup.add(labelSprite);
      this.labelSprites.set(probe.slug, labelSprite);

      // Invisible Raycast Hit Proxy (ample deep-space hit radius)
      const hitGeo = new THREE.SphereGeometry(12.0, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      this.disposables.push(hitGeo, hitMat);

      const hitProxy = new THREE.Mesh(hitGeo, hitMat);
      hitProxy.userData = {
        id: probe.slug,
        name: probe.name,
        isSpacecraft: true,
        probeData: probe
      };
      probeGroup.add(hitProxy);
      this.clickableMeshes.push(hitProxy);

      // Trajectory escape curve from inner Solar System to current probe position
      const trajectoryPoints = this.calculateEscapeTrajectory(probe, posX, posY, posZ);
      const trajGeo = new THREE.BufferGeometry().setFromPoints(trajectoryPoints);
      
      const trajMat = new THREE.LineDashedMaterial({
        color: new THREE.Color(probe.color || 0x38bdf8),
        dashSize: 8,
        gapSize: 5,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending
      });
      const trajLine = new THREE.Line(trajGeo, trajMat);
      trajLine.computeLineDistances();
      this.group.add(trajLine);
      this.trajectoryLines.set(probe.slug, trajLine);
      this.disposables.push(trajGeo, trajMat);

      probeGroup.userData = { phase: idx * 0.5 };
    });
  }

  calculateEscapeTrajectory(probe, endX, endY, endZ) {
    const steps = 48;
    const startX = 28 * (probe.eclipticLongitudeDeg > 180 ? -0.8 : 0.8);
    const startY = 0;
    const startZ = 20;

    const midX = endX * 0.28;
    const midY = endY * 0.18;
    const midZ = endZ * 0.28;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(startX, startY, startZ),
      new THREE.Vector3(midX, midY, midZ),
      new THREE.Vector3(endX * 0.65, endY * 0.70, endZ * 0.65),
      new THREE.Vector3(endX, endY, endZ)
    ]);

    return curve.getPoints(steps);
  }

  highlightProbe(slug) {
    this.selectedSlug = slug;
    this.trajectoryLines.forEach((line, pSlug) => {
      const isSelected = pSlug === slug;
      if (line && line.material) {
        line.material.opacity = isSelected ? 0.85 : 0.14;
      }
    });

    this.haloSprites.forEach((halo, pSlug) => {
      const isSelected = pSlug === slug;
      if (halo && halo.material) {
        halo.material.opacity = isSelected ? 0.95 : 0.0;
      }
    });
  }

  setHoveredProbe(slug) {
    this.hoveredSlug = slug;
  }

  setTrajectoriesVisible(visible) {
    this.visibleTrajectories = visible;
    this.trajectoryLines.forEach(line => {
      if (line) line.visible = visible;
    });
  }

  setMarkersVisible(visible) {
    this.visibleMarkers = visible;
    this.probeMeshes.forEach(group => {
      if (group) group.visible = visible;
    });
  }

  update(camera, time) {
    if (!camera) return;
    camera.getWorldPosition(this.scratchCamPos);

    this.probeMeshes.forEach((probeGroup, slug) => {
      probeGroup.getWorldPosition(this.scratchWorldPos);
      const distance = this.scratchCamPos.distanceTo(this.scratchWorldPos);

      // Adaptive scale so dot stays a crisp beacon across massive deep-space scales
      const baseScale = Math.max(0.4, Math.min(distance * 0.006, 3.2));
      const dot = this.dotSprites.get(slug);
      const halo = this.haloSprites.get(slug);
      const label = this.labelSprites.get(slug);
      const phase = probeGroup.userData.phase || 0;

      const blink = 0.8 + 0.2 * Math.sin(time * 3.5 + phase);

      if (dot) {
        dot.scale.set(baseScale * 2.8, baseScale * 2.8, 1);
        dot.material.opacity = blink;
      }

      const isSelected = this.selectedSlug === slug;
      const isHovered = this.hoveredSlug === slug;

      if (halo) {
        halo.scale.set(baseScale * 6.5, baseScale * 6.5, 1);
        if (isSelected || isHovered) {
          halo.material.opacity = 0.95;
        } else {
          halo.material.opacity = 0.0;
        }
      }

      if (label) {
        label.scale.set(baseScale * 14.0, baseScale * 2.3, 1);
        label.position.y = baseScale * 3.8;
        // Visible if selected, hovered, or within interstellar distance view
        label.visible = isSelected || isHovered || distance < 1200;
      }
    });
  }

  updateDate(date) {
    if (!date) return;
    INTERSTELLAR_PROBES.forEach(probe => {
      const timeData = getSpacecraftTimePosition(probe.slug, date);
      if (timeData && this.probeMeshes.has(probe.slug)) {
        const probeGroup = this.probeMeshes.get(probe.slug);
        const radLat = THREE.MathUtils.degToRad(probe.eclipticLatitudeDeg);
        const radLon = THREE.MathUtils.degToRad(probe.eclipticLongitudeDeg);
        const r = timeData.distanceAU * AU_TO_SCENE_SCALE;

        const posX = r * Math.cos(radLat) * Math.cos(radLon);
        const posY = r * Math.sin(radLat);
        const posZ = r * Math.cos(radLat) * Math.sin(radLon);
        probeGroup.position.set(posX, posY, posZ);

        probeGroup.visible = timeData.status !== 'pre_launch';
      }
    });
  }

  getProbePosition(slug) {
    if (this.probeMeshes.has(slug)) {
      return this.probeMeshes.get(slug).position.clone();
    }
    return null;
  }

  dispose() {
    this.scene.remove(this.group);
    this.disposables.forEach(d => {
      if (d && typeof d.dispose === 'function') d.dispose();
    });
    this.probeMeshes.clear();
    this.trajectoryLines.clear();
    this.dotSprites.clear();
    this.haloSprites.clear();
    this.labelSprites.clear();
    this.clickableMeshes = [];
    this.disposables = [];
  }
}
