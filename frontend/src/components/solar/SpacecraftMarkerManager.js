import * as THREE from 'three';
import { VERIFIED_SPACECRAFT } from './spacecraftRegistry.js';

/**
 * NASA Eyes-Inspired Spacecraft Marker & Trajectory Manager
 * 
 * SCIENTIFIC & VISUAL ARCHITECTURE:
 * - On the Solar System main page, spacecraft are represented by clean white blinking dots
 *   with readable name labels, subtle hover highlight, and clickable interaction area.
 * - ZERO oversized 3D models in the planetary scene graph: preserves pristine Solar System
 *   visibility without obscuring Mars, the Sun, or the inner planets.
 * - Distance-adaptive scaling: pin-prick precision at close range, clean luminous beacons across interplanetary scales.
 * - Subtle trajectory lines for planetary orbiters and heliocentric transfer paths.
 * - Accessible raycast hit proxies guaranteeing effortless single-click selection.
 */
export class SpacecraftMarkerManager {
  constructor(scene, planetBodies) {
    this.scene = scene;
    this.planetBodies = planetBodies;
    this.markers = new Map();
    this.orbiters = new Map();
    this.heliocentricProbes = new Map();
    this.clickableMeshes = [];
    this.disposables = [];
    this.selectedSlug = null;
    this.hoveredSlug = null;

    // Visibility states
    this.visibleMarkers = true;
    this.visibleTrajectories = true;

    // Scratch vectors for zero-allocation render loop
    this.scratchWorldPos = new THREE.Vector3();
    this.scratchCamPos = new THREE.Vector3();

    // Textures
    this.whiteDotTexture = this.createWhiteDotTexture();
    this.pulseHaloTexture = this.createPulseHaloTexture();

    this.initAllMappedSpacecraft();
  }

  /**
   * Generates a clean luminous celestial white dot with soft radial glow
   */
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

  /**
   * Generates an elegant selection / hover halo ring
   */
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

  /**
   * Creates a billboard text label sprite with dark translucent pill backdrop
   */
  createLabelSprite(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Translucent rounded capsule backing
    ctx.fillStyle = 'rgba(8, 14, 28, 0.78)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(16, 10, 352, 44, 10);
    ctx.fill();
    ctx.stroke();

    // Spacecraft name typography
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
    labelSprite.scale.set(3.2, 0.55, 1);
    return labelSprite;
  }

  initAllMappedSpacecraft() {
    const earthBody = this.planetBodies.get('earth');
    const marsBody = this.planetBodies.get('mars');
    const mercuryBody = this.planetBodies.get('mercury');
    const jupiterBody = this.planetBodies.get('jupiter');

    Object.values(VERIFIED_SPACECRAFT).forEach((craft, idx) => {
      // 1. Surface Landing Sites (Mars rovers/landers, Moon Apollo/Chandrayaan, Mercury Messenger)
      if (craft.positionType === 'surface') {
        let parentMesh = null;
        let bodyRadius = 1;
        let planetLabel = craft.referenceBody;

        if (craft.referenceBody === 'moon' && earthBody && earthBody.moonMesh) {
          parentMesh = earthBody.moonMesh;
          bodyRadius = earthBody.data.moon?.radius || earthBody.data.moons?.[0]?.radius || 0.55;
          planetLabel = 'Moon';
        } else if (craft.referenceBody === 'mars' && marsBody && marsBody.mesh) {
          parentMesh = marsBody.mesh;
          bodyRadius = marsBody.data.radius;
          planetLabel = 'Mars';
        } else if (craft.referenceBody === 'mercury' && mercuryBody && mercuryBody.mesh) {
          parentMesh = mercuryBody.mesh;
          bodyRadius = mercuryBody.data.radius;
          planetLabel = 'Mercury';
        }

        if (parentMesh && craft.coordinates) {
          this.createSurfaceBeacon(parentMesh, craft, bodyRadius, planetLabel, idx);
        }
      }

      // 2. Geocentric / Planetocentric Orbital Spacecraft (JWST, Hubble, ISS, MRO, Juno)
      else if (craft.positionType === 'geocentric_orbit' || craft.positionType === 'geocentric_halo' || craft.positionType === 'planetary_orbit') {
        let parentContainer = null;
        let bodyRadius = 1;

        if (craft.referenceBody === 'earth' && earthBody) {
          parentContainer = earthBody.container;
          bodyRadius = earthBody.data.radius;
        } else if (craft.referenceBody === 'moon' && earthBody && earthBody.moonMesh) {
          parentContainer = earthBody.moonMesh;
          bodyRadius = earthBody.data.moon?.radius || earthBody.data.moons?.[0]?.radius || 0.55;
        } else if (craft.referenceBody === 'mars' && marsBody) {
          parentContainer = marsBody.container;
          bodyRadius = marsBody.data.radius;
        } else if (craft.referenceBody === 'jupiter' && jupiterBody) {
          parentContainer = jupiterBody.container;
          bodyRadius = jupiterBody.data.radius;
        }

        if (parentContainer) {
          this.createOrbitalSpacecraft(parentContainer, craft, bodyRadius, idx);
        }
      }

      // 3. Heliocentric Trajectory Probes (Parker Solar Probe, OSIRIS-REx, Hayabusa2, Dawn, Rosetta, Kepler, Spitzer)
      else if (craft.positionType === 'heliocentric' && craft.coordinates) {
        this.createHeliocentricProbe(craft, idx);
      }
    });
  }

  createSurfaceBeacon(parentMesh, craft, bodyRadius, planetName, idx) {
    const latRad = THREE.MathUtils.degToRad(craft.coordinates.lat);
    const lonRad = THREE.MathUtils.degToRad(craft.coordinates.lon);
    const altitude = bodyRadius + 0.04;

    const x = altitude * Math.cos(latRad) * Math.cos(lonRad);
    const y = altitude * Math.sin(latRad);
    const z = -altitude * Math.cos(latRad) * Math.sin(lonRad);

    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(x, y, z);

    // Orientation perpendicular to planet surface
    beaconGroup.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(x, y, z).normalize()
    );

    // Subtle tether stem connecting surface to dot
    const stemGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.28, 0)
    ]);
    const stemMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const stemLine = new THREE.Line(stemGeo, stemMat);
    beaconGroup.add(stemLine);
    this.disposables.push(stemGeo, stemMat);

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
    dotSprite.position.y = 0.28;
    dotSprite.scale.set(0.24, 0.24, 1);
    beaconGroup.add(dotSprite);

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
    haloSprite.position.y = 0.28;
    haloSprite.scale.set(0.5, 0.5, 1);
    beaconGroup.add(haloSprite);

    // Readable Label Sprite
    const labelSprite = this.createLabelSprite(craft.name);
    labelSprite.position.y = 0.52;
    labelSprite.visible = false;
    beaconGroup.add(labelSprite);

    // Invisible Raycast Hit Proxy (generous radius for effortless clicking)
    const hitGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    this.disposables.push(hitGeo, hitMat);

    const hitProxy = new THREE.Mesh(hitGeo, hitMat);
    hitProxy.position.y = 0.28;
    hitProxy.userData = {
      id: craft.slug,
      name: craft.name,
      isSpacecraft: true,
      planet: planetName,
      coordinates: `${craft.coordinates.lat.toFixed(2)}°, ${craft.coordinates.lon.toFixed(2)}°`,
      craftData: craft
    };
    beaconGroup.add(hitProxy);
    this.clickableMeshes.push(hitProxy);

    parentMesh.add(beaconGroup);

    this.markers.set(craft.slug, {
      group: beaconGroup,
      stemLine,
      dotSprite,
      haloSprite,
      labelSprite,
      hitProxy,
      parentMesh,
      craft,
      type: 'surface',
      phase: idx * 0.4
    });
  }

  createOrbitalSpacecraft(parentContainer, craft, bodyRadius, idx) {
    const orbitGroup = new THREE.Group();
    parentContainer.add(orbitGroup);

    const offset = craft.orbitalParams?.radiusOffset || 1.15;
    const orbitRadius = bodyRadius + offset;
    const incDeg = craft.orbitalParams?.inclinationDeg || 0;
    const speed = craft.orbitalParams?.speed || 1.0;

    // Subtle White/Cyan Orbital Guide Line
    const orbitGeo = new THREE.BufferGeometry();
    const points = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * orbitRadius, 0, Math.sin(theta) * orbitRadius));
    }
    orbitGeo.setFromPoints(points);
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitLine.rotation.x = THREE.MathUtils.degToRad(incDeg);
    orbitGroup.add(orbitLine);
    this.disposables.push(orbitGeo, orbitMat);

    // Orbiting Satellite Node Group
    const nodePivot = new THREE.Group();
    nodePivot.rotation.x = THREE.MathUtils.degToRad(incDeg);
    orbitGroup.add(nodePivot);

    const craftGroup = new THREE.Group();
    craftGroup.position.set(orbitRadius, 0, 0);
    nodePivot.add(craftGroup);

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
    dotSprite.scale.set(0.3, 0.3, 1);
    craftGroup.add(dotSprite);

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
    haloSprite.scale.set(0.65, 0.65, 1);
    craftGroup.add(haloSprite);

    // Readable Label Sprite
    const labelSprite = this.createLabelSprite(craft.name);
    labelSprite.position.y = 0.42;
    labelSprite.visible = false;
    craftGroup.add(labelSprite);

    // Invisible Raycast Hit Proxy
    const hitGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    this.disposables.push(hitGeo, hitMat);

    const hitProxy = new THREE.Mesh(hitGeo, hitMat);
    hitProxy.userData = {
      id: craft.slug,
      name: craft.name,
      isSpacecraft: true,
      planet: craft.referenceBody,
      craftData: craft
    };
    craftGroup.add(hitProxy);
    this.clickableMeshes.push(hitProxy);

    this.orbiters.set(craft.slug, {
      orbitGroup,
      nodePivot,
      craftGroup,
      orbitLine,
      dotSprite,
      haloSprite,
      labelSprite,
      hitProxy,
      speed,
      craft,
      type: 'orbiter',
      phase: idx * 0.4
    });
  }

  createHeliocentricProbe(craft, idx) {
    const coords = craft.coordinates;
    // Ensure Parker Solar Probe and inner crafts stay outside solar corona (Sun radius is 14.0)
    const rawR = (coords.rAU || 1.0) * 28.0;
    const rScene = Math.max(rawR, 17.5); // Safely outside the Sun surface

    const latRad = THREE.MathUtils.degToRad(coords.eclipticLatDeg || 0);
    const lonRad = THREE.MathUtils.degToRad(coords.eclipticLonDeg || 0);

    const posX = rScene * Math.cos(latRad) * Math.cos(lonRad);
    const posY = rScene * Math.sin(latRad);
    const posZ = rScene * Math.cos(latRad) * Math.sin(lonRad);

    const probeGroup = new THREE.Group();
    probeGroup.position.set(posX, posY, posZ);
    this.scene.add(probeGroup);

    // Subtle Heliocentric Trajectory Arc
    const trajGeo = new THREE.BufferGeometry();
    const trajPts = [];
    const segments = 64;
    const sweepAngle = Math.PI * 0.9;
    const startAngle = lonRad - sweepAngle * 0.75;
    for (let i = 0; i <= segments; i++) {
      const th = startAngle + (i / segments) * sweepAngle;
      const arcR = rScene * (0.88 + 0.24 * (i / segments));
      trajPts.push(new THREE.Vector3(
        arcR * Math.cos(latRad) * Math.cos(th),
        arcR * Math.sin(latRad),
        arcR * Math.cos(latRad) * Math.sin(th)
      ));
    }
    trajGeo.setFromPoints(trajPts);
    const trajMat = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending
    });
    const trajLine = new THREE.Line(trajGeo, trajMat);
    this.scene.add(trajLine);
    this.disposables.push(trajGeo, trajMat);

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
    dotSprite.scale.set(0.5, 0.5, 1);
    probeGroup.add(dotSprite);

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
    haloSprite.scale.set(1.2, 1.2, 1);
    probeGroup.add(haloSprite);

    // Readable Label Sprite
    const labelSprite = this.createLabelSprite(craft.name);
    labelSprite.position.y = 0.85;
    labelSprite.visible = false;
    probeGroup.add(labelSprite);

    // Invisible Raycast Hit Proxy
    const hitGeo = new THREE.SphereGeometry(1.4, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    this.disposables.push(hitGeo, hitMat);

    const hitProxy = new THREE.Mesh(hitGeo, hitMat);
    hitProxy.userData = {
      id: craft.slug,
      name: craft.name,
      isSpacecraft: true,
      craftData: craft
    };
    probeGroup.add(hitProxy);
    this.clickableMeshes.push(hitProxy);

    this.heliocentricProbes.set(craft.slug, {
      group: probeGroup,
      trajLine,
      dotSprite,
      haloSprite,
      labelSprite,
      hitProxy,
      craft,
      type: 'heliocentric',
      phase: idx * 0.4
    });
  }

  setTrajectoriesVisible(visible) {
    this.setLayerVisibility('trajectories', visible);
  }

  setMarkersVisible(visible) {
    this.setLayerVisibility('markers', visible);
  }

  setLayerVisibility(type, visible) {
    if (type === 'markers') {
      this.visibleMarkers = visible;
      this.markers.forEach(m => { m.group.visible = visible; });
      this.orbiters.forEach(o => { o.dotSprite.visible = visible; o.haloSprite.visible = visible; if (!visible) o.labelSprite.visible = false; });
      this.heliocentricProbes.forEach(p => { p.group.visible = visible; });
    } else if (type === 'trajectories') {
      this.visibleTrajectories = visible;
      this.orbiters.forEach(o => { o.orbitLine.visible = visible; });
      this.heliocentricProbes.forEach(p => { p.trajLine.visible = visible; });
    }
  }

  highlightMarker(slug) {
    this.selectedSlug = slug;

    // Surface markers
    this.markers.forEach((marker, mSlug) => {
      const isSelected = mSlug === slug;
      if (isSelected) {
        marker.haloSprite.material.opacity = 0.95;
        marker.stemLine.material.opacity = 0.95;
        marker.labelSprite.visible = true;
      } else {
        marker.haloSprite.material.opacity = 0.0;
        marker.stemLine.material.opacity = 0.5;
        marker.labelSprite.visible = false;
      }
    });

    // Orbiters
    this.orbiters.forEach((orbiter, oSlug) => {
      const isSelected = oSlug === slug;
      if (isSelected) {
        orbiter.haloSprite.material.opacity = 0.95;
        orbiter.orbitLine.material.opacity = 0.75;
        orbiter.labelSprite.visible = true;
      } else {
        orbiter.haloSprite.material.opacity = 0.0;
        orbiter.orbitLine.material.opacity = 0.12;
        orbiter.labelSprite.visible = false;
      }
    });

    // Heliocentric probes
    this.heliocentricProbes.forEach((probe, pSlug) => {
      const isSelected = pSlug === slug;
      if (isSelected) {
        probe.haloSprite.material.opacity = 0.95;
        probe.trajLine.material.opacity = 0.85;
        probe.labelSprite.visible = true;
      } else {
        probe.haloSprite.material.opacity = 0.0;
        probe.trajLine.material.opacity = 0.14;
        probe.labelSprite.visible = false;
      }
    });
  }

  setHoveredCraft(slug) {
    this.hoveredSlug = slug;
  }

  getMarkerWorldPosition(slug) {
    if (this.markers.has(slug)) {
      const target = new THREE.Vector3();
      this.markers.get(slug).dotSprite.getWorldPosition(target);
      return target;
    }
    if (this.orbiters.has(slug)) {
      const target = new THREE.Vector3();
      this.orbiters.get(slug).craftGroup.getWorldPosition(target);
      return target;
    }
    if (this.heliocentricProbes.has(slug)) {
      return this.heliocentricProbes.get(slug).group.position.clone();
    }
    return null;
  }

  update(camera, time) {
    if (!this.visibleMarkers && !this.visibleTrajectories) return;
    camera.getWorldPosition(this.scratchCamPos);

    // 1. Surface Landing Sites
    this.markers.forEach((marker, slug) => {
      if (!this.visibleMarkers) return;
      marker.dotSprite.getWorldPosition(this.scratchWorldPos);
      const distance = this.scratchCamPos.distanceTo(this.scratchWorldPos);

      // Scale white dot adaptively: clean pin-prick at close range, crisp dot at distance
      const baseScale = Math.max(0.06, Math.min(distance * 0.016, 1.2));
      marker.dotSprite.scale.set(baseScale, baseScale, 1);
      marker.dotSprite.position.y = baseScale * 0.9;
      marker.haloSprite.position.y = baseScale * 0.9;
      marker.stemLine.scale.set(1, baseScale * 2.2, 1);

      // Subtle blinking animation
      const blink = 0.78 + 0.22 * Math.sin(time * 3.5 + marker.phase);
      marker.dotSprite.material.opacity = blink;

      const isSelected = this.selectedSlug === slug;
      const isHovered = this.hoveredSlug === slug;

      if (isSelected || isHovered) {
        marker.group.visible = true;
        marker.haloSprite.scale.set(baseScale * 2.2, baseScale * 2.2, 1);
        marker.haloSprite.material.opacity = 0.9;
        marker.labelSprite.visible = true;
        marker.labelSprite.position.y = baseScale * 2.0;
        marker.labelSprite.scale.set(baseScale * 4.2, baseScale * 0.7, 1);
      } else {
        // LOD decluttering: hide unselected surface markers when viewed from high planetary orbit
        const fadeStart = 40;
        const fadeEnd = 80;
        const lodOpacity = distance > fadeStart ? Math.max(0.0, 1.0 - (distance - fadeStart) / (fadeEnd - fadeStart)) : 1.0;

        marker.group.visible = lodOpacity > 0.01;
        marker.dotSprite.material.opacity = lodOpacity * blink;
        marker.stemLine.material.opacity = lodOpacity * 0.5;
        marker.haloSprite.material.opacity = 0.0;
        // Show labels when close enough
        marker.labelSprite.visible = distance < 32 && lodOpacity > 0.4;
        if (marker.labelSprite.visible) {
          marker.labelSprite.position.y = baseScale * 2.0;
          marker.labelSprite.scale.set(baseScale * 4.0, baseScale * 0.65, 1);
        }
      }
    });

    // 2. Orbital Spacecraft Motion & LOD
    this.orbiters.forEach((orbiter, slug) => {
      // Dynamic orbital revolution
      orbiter.nodePivot.rotation.y = time * 0.35 * (orbiter.speed || 1.0);

      orbiter.dotSprite.getWorldPosition(this.scratchWorldPos);
      const distance = this.scratchCamPos.distanceTo(this.scratchWorldPos);
      const baseScale = Math.max(0.08, Math.min(distance * 0.018, 1.4));
      orbiter.dotSprite.scale.set(baseScale, baseScale, 1);

      const blink = 0.8 + 0.2 * Math.sin(time * 3.5 + orbiter.phase);
      orbiter.dotSprite.material.opacity = blink;

      const isSelected = this.selectedSlug === slug;
      const isHovered = this.hoveredSlug === slug;

      if (isSelected || isHovered) {
        orbiter.haloSprite.scale.set(baseScale * 2.4, baseScale * 2.4, 1);
        orbiter.haloSprite.material.opacity = 0.95;
        orbiter.orbitLine.material.opacity = 0.75;
        orbiter.labelSprite.visible = true;
        orbiter.labelSprite.position.y = baseScale * 1.8;
        orbiter.labelSprite.scale.set(baseScale * 4.2, baseScale * 0.7, 1);
      } else {
        orbiter.haloSprite.material.opacity = 0.0;
        orbiter.orbitLine.material.opacity = 0.12;
        // Show label when zoomed into planet proximity
        orbiter.labelSprite.visible = distance < 65;
        if (orbiter.labelSprite.visible) {
          orbiter.labelSprite.position.y = baseScale * 1.8;
          orbiter.labelSprite.scale.set(baseScale * 4.0, baseScale * 0.65, 1);
        }
      }
    });

    // 3. Heliocentric Trajectory Probes Motion & LOD
    this.heliocentricProbes.forEach((probe, slug) => {
      const distance = this.scratchCamPos.distanceTo(probe.group.position);
      const baseScale = Math.max(0.14, Math.min(distance * 0.015, 1.6));
      probe.dotSprite.scale.set(baseScale, baseScale, 1);

      const blink = 0.8 + 0.2 * Math.sin(time * 3.5 + probe.phase);
      probe.dotSprite.material.opacity = blink;

      const isSelected = this.selectedSlug === slug;
      const isHovered = this.hoveredSlug === slug;

      if (isSelected || isHovered) {
        probe.haloSprite.scale.set(baseScale * 2.4, baseScale * 2.4, 1);
        probe.haloSprite.material.opacity = 0.95;
        probe.trajLine.material.opacity = 0.85;
        probe.labelSprite.visible = true;
        probe.labelSprite.position.y = baseScale * 2.0;
        probe.labelSprite.scale.set(baseScale * 4.2, baseScale * 0.7, 1);
      } else {
        probe.haloSprite.material.opacity = 0.0;
        probe.trajLine.material.opacity = 0.14;
        // Show labels within standard Solar System overview scale
        probe.labelSprite.visible = distance < 220;
        if (probe.labelSprite.visible) {
          probe.labelSprite.position.y = baseScale * 2.0;
          probe.labelSprite.scale.set(baseScale * 3.8, baseScale * 0.62, 1);
        }
      }
    });
  }

  dispose() {
    this.disposables.forEach(d => {
      if (d.dispose) d.dispose();
    });
    this.markers.clear();
    this.orbiters.clear();
    this.heliocentricProbes.clear();
    this.clickableMeshes = [];
  }
}
