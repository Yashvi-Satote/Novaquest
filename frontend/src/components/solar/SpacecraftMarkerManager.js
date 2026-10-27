import * as THREE from 'three';

/**
 * Scale-Adaptive Spacecraft Marker Manager
 * Anchors landing site beacons directly to verified planetary surface coordinates (lat/lon).
 * Dynamically adjusts beacon scale relative to camera distance so markers remain
 * readable and easy to find across all zoom regimes without departing from true locations.
 */
export class SpacecraftMarkerManager {
  constructor(scene, planetBodies) {
    this.scene = scene;
    this.planetBodies = planetBodies;
    this.markers = new Map();
    this.clickableMeshes = [];
    this.disposables = [];
    this.selectedSlug = null;

    // Pre-allocated scratch vectors for zero-allocation render loop
    this.scratchWorldPos = new THREE.Vector3();
    this.scratchCamPos = new THREE.Vector3();

    // Shared beacon textures
    this.beaconTexture = this.createBeaconTexture();
    this.pulseTexture = this.createPulseTexture();

    this.initSurfaceMarkers();
  }

  createBeaconTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // High-contrast beacon: outer glowing cyan ring + brilliant core dot
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(32, 32, 20, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#22d3ee';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(32, 32, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 8;
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  createPulseTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(32, 32, 26, 0, Math.PI * 2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.9)'; // Amber pulse
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  initSurfaceMarkers() {
    // Verified Lunar Landing Sites (NASA NSSDC & Apollo Archive)
    const lunarSites = [
      { slug: 'apollo-11-lm-descent-stage', name: 'Apollo 11 (Eagle)', lat: 0.67408, lon: 23.47297, color: '#facc15' },
      { slug: 'apollo-12-lm-descent-stage', name: 'Apollo 12 (Intrepid)', lat: -3.01239, lon: -23.42157, color: '#facc15' },
      { slug: 'apollo-15-lunar-roving-vehicle', name: 'Apollo 15 (Falcon / LRV-1)', lat: 26.1322, lon: 3.6339, color: '#facc15' },
      { slug: 'apollo-17-lm-descent-stage', name: 'Apollo 17 (Challenger)', lat: 20.1908, lon: 30.7717, color: '#facc15' },
      { slug: 'surveyor-1-lander', name: 'Surveyor 1', lat: -2.47, lon: -43.34, color: '#94a3b8' },
      { slug: 'surveyor-3-lander', name: 'Surveyor 3', lat: -3.01, lon: -23.42, color: '#94a3b8' },
      { slug: 'yutu-2-rover-change-4', name: 'Chang\'e 4 / Yutu-2 (Far Side)', lat: -45.45, lon: 177.59, color: '#ef4444' },
      { slug: 'vikram-lander-chandrayaan-3', name: 'Chandrayaan-3 (Vikram / Pragyan)', lat: -69.37, lon: 32.35, color: '#f97316' }
    ];

    // Verified Martian Landing Sites (NASA JPL Mars Exploration Archive)
    const martianSites = [
      { slug: 'perseverance-rover', name: 'Perseverance (Jezero Crater)', lat: 18.38, lon: 77.58, color: '#22d3ee' },
      { slug: 'curiosity-rover', name: 'Curiosity (Gale Crater)', lat: -4.59, lon: 137.44, color: '#38bdf8' },
      { slug: 'viking-1-lander', name: 'Viking 1 (Chryse Planitia)', lat: 22.27, lon: -47.95, color: '#fb923c' },
      { slug: 'viking-2-lander', name: 'Viking 2 (Utopia Planitia)', lat: 48.27, lon: -134.0, color: '#fb923c' },
      { slug: 'spirit-rover-mer-a', name: 'Spirit (Gusev Crater)', lat: -14.57, lon: 175.47, color: '#f59e0b' },
      { slug: 'opportunity-rover-mer-b', name: 'Opportunity (Meridiani Planum)', lat: -2.28, lon: 354.74, color: '#f59e0b' },
      { slug: 'phoenix-mars-lander', name: 'Phoenix (Vastitas Borealis)', lat: 68.22, lon: -125.75, color: '#a78bfa' },
      { slug: 'insight-lander', name: 'InSight (Elysium Planitia)', lat: 4.5, lon: 135.62, color: '#e879f9' }
    ];

    const earthBody = this.planetBodies.get('earth');
    if (earthBody && earthBody.moonMesh) {
      lunarSites.forEach(site => {
        this.createSurfaceBeacon(earthBody.moonMesh, site, earthBody.data.moon.radius, 'Moon');
      });
    }

    const marsBody = this.planetBodies.get('mars');
    if (marsBody && marsBody.mesh) {
      martianSites.forEach(site => {
        this.createSurfaceBeacon(marsBody.mesh, site, marsBody.data.radius, 'Mars');
      });
    }
  }

  createSurfaceBeacon(parentMesh, site, bodyRadius, planetName) {
    const latRad = THREE.MathUtils.degToRad(site.lat);
    const lonRad = THREE.MathUtils.degToRad(site.lon);
    const altitude = bodyRadius + 0.05;

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

    // Tether line providing direct visual connection to exact landing site coordinates
    const stemGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.35, 0)
    ]);
    const stemMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(site.color),
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const stemLine = new THREE.Line(stemGeo, stemMat);
    beaconGroup.add(stemLine);
    this.disposables.push(stemGeo, stemMat);

    // Scale-adaptive Sprite Beacon (always faces camera, constant readable size)
    const spriteMat = new THREE.SpriteMaterial({
      map: this.beaconTexture,
      color: new THREE.Color(site.color),
      transparent: true,
      depthTest: true,
      depthWrite: false
    });
    this.disposables.push(spriteMat);

    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.y = 0.35;
    sprite.scale.set(0.65, 0.65, 1);
    sprite.userData = {
      id: site.slug,
      name: site.name,
      isSpacecraft: true,
      planet: planetName,
      coordinates: `${site.lat.toFixed(2)}°, ${site.lon.toFixed(2)}°`
    };
    beaconGroup.add(sprite);
    this.clickableMeshes.push(sprite);

    // Pulsing target halo ring (activated on selection)
    const pulseMat = new THREE.SpriteMaterial({
      map: this.pulseTexture,
      transparent: true,
      opacity: 0.0,
      depthTest: true,
      depthWrite: false
    });
    this.disposables.push(pulseMat);

    const pulseSprite = new THREE.Sprite(pulseMat);
    pulseSprite.position.y = 0.35;
    pulseSprite.scale.set(1.2, 1.2, 1);
    beaconGroup.add(pulseSprite);

    parentMesh.add(beaconGroup);

    this.markers.set(site.slug, {
      group: beaconGroup,
      stemLine,
      sprite,
      pulseSprite,
      parentMesh,
      site
    });
  }

  update(camera, time) {
    camera.getWorldPosition(this.scratchCamPos);

    this.markers.forEach((marker, slug) => {
      marker.sprite.getWorldPosition(this.scratchWorldPos);
      const distance = this.scratchCamPos.distanceTo(this.scratchWorldPos);

      // Adaptive scale: maintain readable visual footprint across zoom scales without bloat
      const baseScale = Math.max(0.08, Math.min(distance * 0.035, 4.0));
      marker.sprite.scale.set(baseScale, baseScale, 1);
      marker.sprite.position.y = baseScale * 0.8;
      marker.pulseSprite.position.y = baseScale * 0.8;
      marker.stemLine.scale.set(1, baseScale * 2.3, 1);

      const isSelected = this.selectedSlug === slug;
      if (isSelected) {
        marker.group.visible = true;
        marker.sprite.material.opacity = 1.0;
        marker.stemLine.material.opacity = 1.0;
        marker.stemLine.material.color.setHex(0xfacc15); // Amber highlight for selected tether
        // Animated pulse effect
        const pulse = Math.sin(time * 5.0) * 0.5 + 0.5;
        marker.pulseSprite.scale.set(baseScale * (1.4 + pulse * 0.6), baseScale * (1.4 + pulse * 0.6), 1);
        marker.pulseSprite.material.opacity = 0.85 - pulse * 0.45;
      } else {
        // LOD Uncluttering: smoothly fade out unselected surface markers when zoomed out
        // to prevent overlapping marker clutter on the planetary sphere
        const fadeStart = 45;
        const fadeEnd = 85;
        const lodOpacity = distance > fadeStart ? Math.max(0.0, 1.0 - (distance - fadeStart) / (fadeEnd - fadeStart)) : 1.0;
        
        marker.group.visible = lodOpacity > 0.01;
        marker.sprite.material.opacity = lodOpacity;
        marker.stemLine.material.opacity = lodOpacity * 0.75;
        marker.stemLine.material.color.set(marker.site.color);
        marker.pulseSprite.material.opacity = 0.0;
      }
    });
  }

  highlightMarker(slug) {
    this.selectedSlug = slug;
  }

  getMarkerWorldPosition(slug) {
    if (this.markers.has(slug)) {
      const marker = this.markers.get(slug);
      const worldPos = new THREE.Vector3();
      marker.sprite.getWorldPosition(worldPos);
      return worldPos;
    }
    return null;
  }

  dispose() {
    this.markers.forEach(marker => {
      if (marker.parentMesh) {
        marker.parentMesh.remove(marker.group);
      }
    });
    this.markers.clear();
    this.clickableMeshes = [];
    if (this.beaconTexture) this.beaconTexture.dispose();
    if (this.pulseTexture) this.pulseTexture.dispose();
    this.disposables.forEach(d => {
      if (d && typeof d.dispose === 'function') d.dispose();
    });
    this.disposables = [];
  }
}
