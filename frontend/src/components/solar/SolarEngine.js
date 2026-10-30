import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TWEEN from '@tweenjs/tween.js';
import { CELESTIAL_BODIES } from './celestialData.js';
import { Starfield } from './Starfield.js';
import { PlanetBody } from './PlanetBody.js';
import { InterstellarSystem } from './InterstellarSystem.js';
import { SpacecraftMarkerManager } from './SpacecraftMarkerManager.js';
import { SurfaceTerrainViewer } from './SurfaceTerrainViewer.js';
import { SCALE_PRESETS } from './interstellarData.js';
import { getPlanetScenePosition, dateToJulianDate } from './ephemeris.js';
import { VERIFIED_SPACECRAFT } from './spacecraftRegistry.js';

/**
 * SolarEngine
 * Multi-scale Deep Space & Planetary Exploration Engine for Novaquest.
 * Inspired by NASA Eyes on the Solar System.
 * 
 * SCIENTIFIC ARCHITECTURE:
 * - NASA JPL Keplerian Ephemeris updates for true date-dependent planetary alignments (1800-2050 AD).
 * - Logarithmic depth buffer rendering for seamless scaling from landing sites (meters) to interstellar space (15,000+ units).
 * - Multi-scale camera navigation: Free-fly, Ride-along / target tracking, and Orbit controls.
 * - Local planetary surface landing site exploration mode.
 * - Dynamic lighting: Natural Sunlight vs NASA Eyes Flood Lighting.
 * - Conflict-free tweening and leak-free resource lifecycle.
 */
export class SolarEngine {
  constructor(container, options = {}) {
    this.container = container;
    this.onSelectPlanet = options.onSelectPlanet || null;
    this.onSelectSpacecraft = options.onSelectSpacecraft || null;
    this.onHoverItem = options.onHoverItem || null;
    this.onModeChange = options.onModeChange || null;
    this.onDateChange = options.onDateChange || null;

    // Simulation states
    this.isPlaying = true;
    this.speedMultiplier = 1.0;
    this.simulationDate = new Date();
    this.daysPerSecond = 5.0; // Base time flow rate in live motion
    this.selectedBodyId = null;
    this.selectedSpacecraftSlug = null;
    this.trackedCraftSlug = null;
    this.isTransitioning = false;
    this.isVoyagerLocalMode = false;
    this.isSurfaceMode = false;
    this.activeSurfaceCraft = null;

    // Camera modes: 'orbit' | 'ride_along' | 'free_fly'
    this.cameraMode = 'orbit';
    this.lightingMode = 'natural'; // 'natural' | 'flood'

    // Layer visibility states
    this.layerVisibility = {
      orbits: true,
      trajectories: true,
      markers: true
    };

    // Isolated Tween Group
    this.tweenGroup = new TWEEN.Group();
    this.currentCameraTween = null;

    // Clock
    this.clock = new THREE.Clock();

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-999, -999);
    this.hoveredItem = null;

    // Key states for free-fly movement
    this.keys = {};

    // Pre-allocated scratch vectors for zero-allocation animation loop
    this.scratchVecA = new THREE.Vector3();
    this.scratchVecB = new THREE.Vector3();
    this.scratchTarget = new THREE.Vector3();

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020409);

    // 2. Camera with Logarithmic Depth Buffer support
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 75000);
    this.defaultCameraPos = new THREE.Vector3(0, 110, 175);
    this.camera.position.copy(this.defaultCameraPos);

    // 3. Renderer with Logarithmic Depth Buffer for vast spatial scale exploration
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      logarithmicDepthBuffer: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.domElement = this.renderer.domElement;
    this.domElement.style.display = 'block';
    this.domElement.style.width = '100%';
    this.domElement.style.height = '100%';

    // Clear stale children from container
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    this.container.appendChild(this.domElement);

    // 4. Lighting Setup
    this.ambientLight = new THREE.AmbientLight(0x1e293b, 0.7);
    this.scene.add(this.ambientLight);

    this.floodLight = new THREE.DirectionalLight(0xffffff, 0);
    this.floodLight.position.set(0, 500, 0);
    this.scene.add(this.floodLight);

    // 5. OrbitControls
    this.controls = new OrbitControls(this.camera, this.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 0.5;   // Allow planetary surface approach
    this.controls.maxDistance = 18000; // Allow deep galactic zoom out
    this.controls.maxPolarAngle = Math.PI * 0.98;
    this.controls.target.set(0, 0, 0);

    // 6. Starfield & Milky Way
    this.starfield = new Starfield(this.scene);

    // 7. Celestial Bodies
    this.planetBodies = new Map();
    this.clickableMeshes = [];

    CELESTIAL_BODIES.forEach(data => {
      const body = new PlanetBody(data, this.scene);
      this.planetBodies.set(data.id, body);
      this.clickableMeshes.push(...body.clickableMeshes);
    });

    // 8. Interstellar System
    this.interstellar = new InterstellarSystem(this.scene);
    this.clickableMeshes.push(...this.interstellar.clickableMeshes);

    // 9. Spacecraft Markers
    this.markers = new SpacecraftMarkerManager(this.scene, this.planetBodies);
    this.clickableMeshes.push(...this.markers.clickableMeshes);

    // 10. Planetary Surface Terrain Exploration
    this.surfaceViewer = new SurfaceTerrainViewer(this.scene);
    this.clickableMeshes.push(...this.surfaceViewer.clickableMeshes);

    // Apply initial ephemeris positions for planets
    this.applyEphemeris();

    // 11. Event Listeners
    this.bindEvents();

    // 12. Animation Loop
    this.isDisposed = false;
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  bindEvents() {
    this.onPointerMove = (e) => {
      const rect = this.domElement.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.checkHover();
    };

    this.onPointerDown = (e) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    this.onPointerUp = (e) => {
      if (!this.pointerDownPos) return;
      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      if (dist < 6) {
        this.handleClick();
      }
    };

    this.onKeyDown = (e) => {
      this.keys[e.code] = true;
    };

    this.onKeyUp = (e) => {
      this.keys[e.code] = false;
    };

    this.domElement.addEventListener('pointermove', this.onPointerMove);
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.domElement.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  checkHover() {
    if (this.isTransitioning) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.clickableMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const id = hitMesh.userData.id;
      const isSpacecraft = hitMesh.userData.isSpacecraft;
      
      if (this.hoveredItem !== id) {
        this.hoveredItem = id;
        this.domElement.style.cursor = 'pointer';
        if (isSpacecraft) {
          if (this.markers) this.markers.setHoveredCraft(id);
          if (this.interstellar) this.interstellar.setHoveredProbe(id);
        }
        if (this.onHoverItem) {
          this.onHoverItem({
            id,
            name: hitMesh.userData.name,
            isSpacecraft,
            planet: hitMesh.userData.planet || hitMesh.userData.planetName,
            coordinates: hitMesh.userData.coordinates
          });
        }
      }
    } else {
      if (this.hoveredItem) {
        this.hoveredItem = null;
        this.domElement.style.cursor = 'default';
        if (this.markers) this.markers.setHoveredCraft(null);
        if (this.interstellar) this.interstellar.setHoveredProbe(null);
        if (this.onHoverItem) {
          this.onHoverItem(null);
        }
      }
    }
  }

  handleClick() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.clickableMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const id = hitMesh.userData.id;
      if (hitMesh.userData.isSpacecraft) {
        this.focusSpacecraft(id);
      } else if (hitMesh.userData.isMoon) {
        this.focusMoon(id);
      } else {
        this.focusPlanet(id);
      }
    }
  }

  getCelestialBodyPosition(id) {
    if (!id) return null;
    if (this.planetBodies.has(id)) {
      return this.planetBodies.get(id).getWorldPosition();
    }
    for (const body of this.planetBodies.values()) {
      if (body.moons && body.moons.length > 0) {
        const found = body.moons.find(m => m.data.id === id);
        if (found) {
          const target = new THREE.Vector3();
          found.mesh.getWorldPosition(target);
          return target;
        }
      }
    }
    return null;
  }

  focusPlanet(planetId) {
    if (this.selectedBodyId === planetId && !this.isSurfaceMode && !this.isVoyagerLocalMode) return;
    if (this.isVoyagerLocalMode) {
      this.exitVoyagerLocalMode(false);
    }
    if (this.isSurfaceMode) {
      this.exitSurfaceMode(false);
    }
    this.trackedCraftSlug = null;

    if (!this.planetBodies.has(planetId)) return;
    const body = this.planetBodies.get(planetId);
    this.selectedBodyId = planetId;
    this.selectedSpacecraftSlug = null;
    this.interstellar.highlightProbe(null);
    this.markers.highlightMarker(null);

    if (this.onSelectPlanet) {
      this.onSelectPlanet(planetId);
    }

    const worldPos = body.getWorldPosition();
    const radius = body.data.radius;
    
    // Balanced framing distance: fills the viewport for realistic 3D globe inspection
    let distanceOffset;
    if (planetId === 'sun') distanceOffset = 22;
    else if (planetId === 'saturn') distanceOffset = 16;
    else if (planetId === 'jupiter') distanceOffset = 12;
    else distanceOffset = Math.max(radius * 2.5, 3.2);

    const targetCameraPos = new THREE.Vector3(
      worldPos.x + distanceOffset * 0.72,
      worldPos.y + distanceOffset * 0.35,
      worldPos.z + distanceOffset * 0.72
    );

    this.smoothCameraTransition(targetCameraPos, worldPos, 1400, planetId);
  }

  focusMoon(moonId) {
    if (this.isVoyagerLocalMode) this.exitVoyagerLocalMode(false);
    if (this.isSurfaceMode) this.exitSurfaceMode(false);
    this.trackedCraftSlug = null;

    // Find the moon mesh across celestial bodies
    for (const body of this.planetBodies.values()) {
      if (body.moons && body.moons.length > 0) {
        const found = body.moons.find(m => m.data.id === moonId);
        if (found) {
          const worldPos = new THREE.Vector3();
          found.mesh.getWorldPosition(worldPos);
          const moonRadius = found.data.radius;
          const distanceOffset = Math.max(moonRadius * 2.8, 1.35);

          const targetCameraPos = new THREE.Vector3(
            worldPos.x + distanceOffset * 0.72,
            worldPos.y + distanceOffset * 0.35,
            worldPos.z + distanceOffset * 0.72
          );

          this.selectedBodyId = moonId;
          this.selectedSpacecraftSlug = null;
          this.interstellar.highlightProbe(null);
          this.markers.highlightMarker(null);

          if (this.onSelectPlanet) {
            this.onSelectPlanet(moonId);
          }

          this.smoothCameraTransition(targetCameraPos, worldPos, 1400, moonId);
          return;
        }
      }
    }
  }

  focusSpacecraft(slug) {
    if (this.isVoyagerLocalMode && slug !== 'voyager-1') {
      this.exitVoyagerLocalMode(false);
    }
    if (this.isSurfaceMode && this.activeSurfaceCraft?.slug !== slug) {
      this.exitSurfaceMode(false);
    }

    this.selectedSpacecraftSlug = slug;
    this.selectedBodyId = null;
    this.trackedCraftSlug = slug;

    // Highlight target in subsystems
    this.interstellar.highlightProbe(slug);
    this.markers.highlightMarker(slug);

    if (this.onSelectSpacecraft) {
      this.onSelectSpacecraft(slug);
    }

    // Check if spacecraft is a surface landing site with verified coordinates
    const verified = VERIFIED_SPACECRAFT[slug];
    if (verified && verified.positionType === 'surface' && verified.coordinates) {
      this.enterSurfaceMode(slug);
      return;
    }

    // 1. Interstellar probe focus (Voyager, Pioneer, New Horizons)
    const probePos = this.interstellar.getProbePosition(slug);
    if (probePos && Number.isFinite(probePos.x)) {
      const targetCamPos = new THREE.Vector3(
        probePos.x + 8.5,
        probePos.y + 4.5,
        probePos.z + 8.5
      );
      this.smoothCameraTransition(targetCamPos, probePos, 1600, slug);
      return;
    }

    // 2. Mapped spacecraft focus (orbiters, heliocentric probes)
    const markerWorldPos = this.markers.getMarkerWorldPosition(slug);
    if (markerWorldPos && Number.isFinite(markerWorldPos.x)) {
      const isOrbital = slug.includes('iss') || slug.includes('hubble') || slug.includes('chandra') || slug.includes('orbiter') || slug.includes('satellite');
      const isHeliocentric = slug.includes('parker') || slug.includes('osiris') || slug.includes('hayabusa') || slug.includes('dawn') || slug.includes('rosetta') || slug.includes('webb');
      const offsetDist = isHeliocentric ? 3.5 : (isOrbital ? 2.5 : 2.0);

      const targetCamPos = markerWorldPos.clone().add(new THREE.Vector3(offsetDist, offsetDist * 0.75, offsetDist));
      this.smoothCameraTransition(targetCamPos, markerWorldPos, 1500, slug);
      return;
    }

    // 3. Unmapped record: preserve camera without flying to fabricated destinations
  }

  enterSurfaceMode(slug) {
    const verified = VERIFIED_SPACECRAFT[slug];
    if (!verified || !verified.coordinates) return;

    this.isSurfaceMode = true;
    this.activeSurfaceCraft = verified;
    this.selectedSpacecraftSlug = slug;
    this.trackedCraftSlug = slug;

    let parentBody = null;
    if (verified.referenceBody === 'mars') {
      parentBody = this.planetBodies.get('mars');
    } else if (verified.referenceBody === 'moon') {
      const earth = this.planetBodies.get('earth');
      if (earth && earth.moonMesh) {
        const moonPos = new THREE.Vector3();
        earth.moonMesh.getWorldPosition(moonPos);
        parentBody = { getWorldPosition: () => moonPos };
      }
    } else if (verified.referenceBody === 'mercury') {
      parentBody = this.planetBodies.get('mercury');
    }

    const parentPos = parentBody ? parentBody.getWorldPosition() : new THREE.Vector3(0, 0, 0);
    const surfaceView = this.surfaceViewer.showLandingSite(verified, parentPos);

    if (surfaceView) {
      this.controls.minDistance = 0.2;
      this.controls.maxDistance = 15.0;
      this.smoothCameraTransition(surfaceView.cameraPos, surfaceView.sitePos, 1600);
    }

    if (this.onModeChange) {
      this.onModeChange({ isSurfaceMode: true, activeSurfaceCraft: verified });
    }
  }

  exitSurfaceMode(returnToPlanet = true) {
    this.isSurfaceMode = false;
    const craft = this.activeSurfaceCraft;
    this.activeSurfaceCraft = null;
    this.surfaceViewer.hide();

    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 18000;

    if (returnToPlanet && craft) {
      const parentId = craft.referenceBody === 'moon' ? 'earth' : craft.referenceBody;
      this.focusPlanet(parentId);
    }

    if (this.onModeChange) {
      this.onModeChange({ isSurfaceMode: false, activeSurfaceCraft: null });
    }
  }

  focusScale(scalePresetKey) {
    const preset = SCALE_PRESETS[scalePresetKey];
    if (!preset) return;

    if (preset.id === 'voyager_local') {
      this.enterVoyagerLocalMode();
      return;
    }

    if (this.isVoyagerLocalMode) {
      this.exitVoyagerLocalMode(false);
    }
    if (this.isSurfaceMode) {
      this.exitSurfaceMode(false);
    }

    this.selectedBodyId = null;
    this.selectedSpacecraftSlug = null;
    this.trackedCraftSlug = null;
    this.interstellar.highlightProbe(null);
    this.markers.highlightMarker(null);

    let targetCamPos = this.defaultCameraPos.clone();
    let targetLookAt = new THREE.Vector3(0, 0, 0);

    if (preset.id === 'planetary') {
      targetCamPos = new THREE.Vector3(32, 6, 28);
      targetLookAt = new THREE.Vector3(30, 0, 0); // Near Earth
    } else if (preset.id === 'solar') {
      targetCamPos = new THREE.Vector3(0, 110, 175);
      targetLookAt = new THREE.Vector3(0, 0, 0);
    } else if (preset.id === 'heliosphere') {
      targetCamPos = new THREE.Vector3(0, 520, 850);
      targetLookAt = new THREE.Vector3(0, 0, 0);
    } else if (preset.id === 'galactic') {
      targetCamPos = new THREE.Vector3(0, 2200, 3600);
      targetLookAt = new THREE.Vector3(0, 0, 0);
    }

    this.smoothCameraTransition(targetCamPos, targetLookAt, 1600);
  }

  enterVoyagerLocalMode() {
    if (this.isSurfaceMode) this.exitSurfaceMode(false);

    this.isVoyagerLocalMode = true;
    this.selectedSpacecraftSlug = 'voyager-1';
    this.selectedBodyId = null;
    this.trackedCraftSlug = null;

    this.interstellar.setVoyagerLocalSphereVisible(true);
    this.interstellar.highlightProbe('voyager-1');
    this.markers.highlightMarker(null);

    if (this.onSelectSpacecraft) {
      this.onSelectSpacecraft('voyager-1');
    }

    const probePos = this.interstellar.getProbePosition('voyager-1');
    if (probePos && Number.isFinite(probePos.x)) {
      const targetCamPos = new THREE.Vector3(
        probePos.x + 12,
        probePos.y + 5,
        probePos.z + 12
      );

      this.controls.minDistance = 2.0;
      this.controls.maxDistance = 50.0;
      this.smoothCameraTransition(targetCamPos, probePos, 1600);
    }

    if (this.onModeChange) {
      this.onModeChange({ isVoyagerLocal: true, scale: 'VOYAGER_LOCAL' });
    }
  }

  exitVoyagerLocalMode(returnToHeliosphere = true) {
    this.isVoyagerLocalMode = false;
    this.interstellar.setVoyagerLocalSphereVisible(false);

    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 18000;

    this.selectedSpacecraftSlug = 'voyager-1';
    this.trackedCraftSlug = null;

    if (returnToHeliosphere) {
      const probePos = this.interstellar.getProbePosition('voyager-1');
      if (probePos && Number.isFinite(probePos.x)) {
        const targetCamPos = new THREE.Vector3(
          probePos.x + 85,
          probePos.y + 45,
          probePos.z + 85
        );
        this.smoothCameraTransition(targetCamPos, probePos, 1500);
      } else {
        this.smoothCameraTransition(new THREE.Vector3(0, 520, 850), new THREE.Vector3(0, 0, 0), 1500);
      }

      if (this.onModeChange) {
        this.onModeChange({ isVoyagerLocal: false, scale: 'HELIOSPHERE' });
      }
    }
  }

  resetView() {
    if (this.isVoyagerLocalMode) {
      this.exitVoyagerLocalMode(false);
    }
    if (this.isSurfaceMode) {
      this.exitSurfaceMode(false);
    }
    this.selectedBodyId = null;
    this.selectedSpacecraftSlug = null;
    this.trackedCraftSlug = null;
    this.interstellar.highlightProbe(null);
    this.markers.highlightMarker(null);
    if (this.onSelectPlanet) this.onSelectPlanet(null);
    if (this.onSelectSpacecraft) this.onSelectSpacecraft(null);
    this.smoothCameraTransition(this.defaultCameraPos, new THREE.Vector3(0, 0, 0), 1500);
  }

  smoothCameraTransition(targetCamPos, targetFocus, duration = 1400, trackingTargetId = null) {
    if (this.currentCameraTween) {
      this.currentCameraTween.stop();
      this.currentCameraTween = null;
    }
    this.tweenGroup.removeAll();

    const isFiniteVec = (v) => v && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
    const safeTargetCamPos = isFiniteVec(targetCamPos) ? targetCamPos : this.defaultCameraPos.clone();
    const safeTargetFocus = isFiniteVec(targetFocus) ? targetFocus : new THREE.Vector3(0, 0, 0);

    if (!isFiniteVec(this.camera.position)) {
      this.camera.position.copy(this.defaultCameraPos);
    }
    if (!isFiniteVec(this.controls.target)) {
      this.controls.target.set(0, 0, 0);
    }

    if (!this.isVoyagerLocalMode && !this.isSurfaceMode) {
      this.controls.minDistance = 0.5;
      this.controls.maxDistance = 18000;
    }

    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const distance = startPos.distanceTo(safeTargetCamPos);

    if (distance < 0.1) {
      this.camera.position.copy(safeTargetCamPos);
      this.controls.target.copy(safeTargetFocus);
      this.controls.update();
      this.isTransitioning = false;
      this.controls.enabled = true;
      return;
    }

    this.isTransitioning = true;
    this.controls.enabled = false;

    // Cinematic Elevation Arc: elevated midpoint prevents clipping through celestial spheres
    const arcHeight = Math.max(8, Math.min(distance * 0.22, 500));
    const midCamPos = new THREE.Vector3().addVectors(startPos, safeTargetCamPos).multiplyScalar(0.5);
    midCamPos.y += arcHeight;

    this.currentCameraTween = new TWEEN.Tween({ t: 0 }, this.tweenGroup)
      .to({ t: 1 }, duration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(({ t }) => {
        const oneMinusT = 1 - t;
        const pX = oneMinusT * oneMinusT * startPos.x + 2 * oneMinusT * t * midCamPos.x + t * t * safeTargetCamPos.x;
        const pY = oneMinusT * oneMinusT * startPos.y + 2 * oneMinusT * t * midCamPos.y + t * t * safeTargetCamPos.y;
        const pZ = oneMinusT * oneMinusT * startPos.z + 2 * oneMinusT * t * midCamPos.z + t * t * safeTargetCamPos.z;

        if (Number.isFinite(pX) && Number.isFinite(pY) && Number.isFinite(pZ)) {
          this.camera.position.set(pX, pY, pZ);
        }

        let liveTarget = safeTargetFocus;
        if (trackingTargetId) {
          const livePos = this.getCelestialBodyPosition(trackingTargetId) || (this.markers && this.markers.getMarkerWorldPosition(trackingTargetId));
          if (livePos && Number.isFinite(livePos.x)) {
            liveTarget = livePos;
          }
        }
        this.controls.target.lerpVectors(startTarget, liveTarget, t);
      })
      .onComplete(() => {
        this.currentCameraTween = null;
        this.isTransitioning = false;
        this.controls.enabled = true;
        this.controls.update();
      })
      .onStop(() => {
        this.currentCameraTween = null;
        this.isTransitioning = false;
        this.controls.enabled = true;
        this.controls.update();
      })
      .start();
  }

  setPlayPause(play) {
    this.isPlaying = play;
  }

  setSpeed(multiplier) {
    this.speedMultiplier = Math.max(0.1, Math.min(multiplier, 100));
  }

  setSimulationDate(date) {
    if (!date) return;
    this.simulationDate = new Date(date);
    this.applyEphemeris();
    if (this.onDateChange) {
      this.onDateChange(this.simulationDate);
    }
  }

  applyEphemeris() {
    const jd = dateToJulianDate(this.simulationDate);

    // Update all major planets
    this.planetBodies.forEach((body, id) => {
      if (id !== 'sun') {
        const pos = getPlanetScenePosition(id, jd);
        if (pos) {
          body.setEphemerisPosition(pos.x, pos.y, pos.z);
        }
      }
    });

    // Update interstellar probes (Voyager 1 & 2, Pioneer 10 & 11, New Horizons)
    if (this.interstellar) {
      this.interstellar.updateDate(this.simulationDate);
    }
  }

  setLightingMode(mode) {
    this.lightingMode = mode;
    if (mode === 'flood') {
      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 1.35;
      this.floodLight.intensity = 0.85;
    } else {
      // Natural sunlight from central Sun
      this.ambientLight.color.setHex(0x1e293b);
      this.ambientLight.intensity = 0.65;
      this.floodLight.intensity = 0.0;
    }
  }

  setLayerVisibility(layer, visible) {
    this.layerVisibility[layer] = visible;
    if (layer === 'orbits') {
      this.planetBodies.forEach(body => body.setOrbitVisibility(visible));
    } else if (layer === 'trajectories') {
      this.interstellar.setTrajectoriesVisible(visible);
      this.markers.setTrajectoriesVisible(visible);
    } else if (layer === 'markers') {
      this.interstellar.setMarkersVisible(visible);
      this.markers.setMarkersVisible(visible);
    }
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
  }

  resize(width, height) {
    if (!this.renderer || !this.camera || this.isDisposed) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Advance simulation time if playing
    if (this.isPlaying) {
      // Advance by days per second multiplied by speedMultiplier
      const msAdvance = delta * this.speedMultiplier * this.daysPerSecond * 86400000;
      this.simulationDate = new Date(this.simulationDate.getTime() + msAdvance);
      this.applyEphemeris();
    }

    // 2. Update Tweens
    if (this.tweenGroup) {
      this.tweenGroup.update();
    }

    // 3. Update Celestial Bodies (axial rotation and moon orbits)
    this.planetBodies.forEach(body => {
      body.updatePosition(delta, this.speedMultiplier, this.isPlaying);
    });

    // 4. Update Spacecraft Markers
    if (this.markers) {
      this.markers.update(this.camera, elapsedTime);
    }

    // 5. Update Interstellar Probes
    if (this.interstellar) {
      this.interstellar.update(this.camera, elapsedTime);
    }

    // 6. Keep starfield centered on camera
    if (this.starfield) {
      this.starfield.update(this.camera);
    }

    // 7. Planetary & Spacecraft Orbital Tracking (Ride-Along Mode)
    if (this.trackedCraftSlug && !this.isTransitioning && this.isPlaying) {
      const markerWorldPos = this.markers.getMarkerWorldPosition(this.trackedCraftSlug);
      if (markerWorldPos && Number.isFinite(markerWorldPos.x)) {
        this.scratchVecA.copy(markerWorldPos).sub(this.controls.target);
        this.controls.target.copy(markerWorldPos);
        this.camera.position.add(this.scratchVecA);
      }
    } else if (this.selectedBodyId && !this.isTransitioning && this.isPlaying) {
      const currentWorldPos = this.getCelestialBodyPosition(this.selectedBodyId);
      if (currentWorldPos && Number.isFinite(currentWorldPos.x)) {
        this.scratchVecA.copy(currentWorldPos).sub(this.controls.target);
        this.controls.target.copy(currentWorldPos);
        this.camera.position.add(this.scratchVecA);
      }
    }

    // 8. Free-fly keyboard movement (W, A, S, D, Q, E)
    if (this.cameraMode === 'free_fly' && !this.isTransitioning) {
      const moveSpeed = 40.0 * delta;
      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      const right = new THREE.Vector3().crossVectors(forward, this.camera.up).normalize();

      if (this.keys['KeyW']) this.camera.position.addScaledVector(forward, moveSpeed);
      if (this.keys['KeyS']) this.camera.position.addScaledVector(forward, -moveSpeed);
      if (this.keys['KeyD']) this.camera.position.addScaledVector(right, moveSpeed);
      if (this.keys['KeyA']) this.camera.position.addScaledVector(right, -moveSpeed);
      if (this.keys['KeyE']) this.camera.position.y += moveSpeed * 0.7;
      if (this.keys['KeyQ']) this.camera.position.y -= moveSpeed * 0.7;
    }

    // 9. Update controls when NOT in transition
    if (!this.isTransitioning && this.controls) {
      this.controls.update();
    }

    // 10. Render
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose() {
    this.isDisposed = true;

    if (this.currentCameraTween) {
      this.currentCameraTween.stop();
      this.currentCameraTween = null;
    }
    if (this.tweenGroup) {
      this.tweenGroup.removeAll();
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.domElement) {
      this.domElement.removeEventListener('pointermove', this.onPointerMove);
      this.domElement.removeEventListener('pointerdown', this.onPointerDown);
      this.domElement.removeEventListener('pointerup', this.onPointerUp);
    }
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    if (this.starfield) this.starfield.dispose();
    if (this.interstellar) this.interstellar.dispose();
    if (this.markers) this.markers.dispose();
    if (this.surfaceViewer) this.surfaceViewer.dispose();

    this.planetBodies.forEach(body => body.dispose());
    this.planetBodies.clear();
    this.clickableMeshes = [];

    if (this.controls) {
      this.controls.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
