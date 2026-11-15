import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TWEEN from '@tweenjs/tween.js';
import { CELESTIAL_BODIES } from './celestialData.js';
import { Starfield } from './Starfield.js';
import { PlanetBody } from './PlanetBody.js';
import { InterstellarSystem } from './InterstellarSystem.js';
import { SpacecraftMarkerManager } from './SpacecraftMarkerManager.js';
import { SurfaceTerrainViewer } from './SurfaceTerrainViewer.js';
import { AsteroidBelt } from './AsteroidBelt.js';
import { SCALE_PRESETS } from './interstellarData.js';
import { getPlanetScenePosition, dateToJulianDate } from './ephemeris.js';
import { VERIFIED_SPACECRAFT } from './spacecraftRegistry.js';
import { getEligibleSpacecraftRecord } from './spacecraftModelService.js';
import { loadSpacecraft3DModel } from './spacecraftModelRegistry.js';

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
    // Opens the dedicated 3D spacecraft explore page (/spacecraft/:slug) instead
    // of dropping an in-scene model on top of the parent planet.
    this.onOpenSpacecraftPage = options.onOpenSpacecraftPage || null;
    this.onDeselect = options.onDeselect || null;
    this.onHoverItem = options.onHoverItem || null;
    this.onModeChange = options.onModeChange || null;
    this.onDateChange = options.onDateChange || null;
    this.onSpacecraftInspectionChange = options.onSpacecraftInspectionChange || null;

    // Simulation states
    this.isPlaying = false;
    this.speedMultiplier = 1.0;
    this.timeDirection = 1; // 1 = forward, -1 = reverse/backward
    this.simulationDate = new Date();
    this.lastDateEmit = 0;
    this.daysPerSecond = 5.0; // Base time flow rate in live motion
    this.selectedBodyId = null;
    this.selectedSpacecraftSlug = null;
    this.trackedCraftSlug = null;
    this.isTransitioning = false;
    this.isVoyagerLocalMode = false;
    this.isSurfaceMode = false;
    this.activeSurfaceCraft = null;

    // Anchor used to co-rotate the inspection viewpoint with a focused planet's orbit
    this.lastTrackedBodyId = null;
    this.lastTrackedBodyPos = null;

    // In-Scene 3D Spacecraft Exploration State (NASA Eyes Experience)
    this.isInspectingSpacecraft = false;
    this.inspectedCraft = null;
    this.inspectedSpacecraftSlug = null;
    this.inspectedModelGroup = null;
    this.previousSolarCameraState = null;

    // Camera modes: 'orbit' | 'ride_along' | 'free_fly'
    this.cameraMode = 'orbit';
    this.lightingMode = 'natural'; // 'natural' | 'flood'

    // Layer visibility states
    this.layerVisibility = {
      orbits: true,
      trajectories: true,
      markers: true,
      labels: true,
      asteroids: true,
      stars: true
    };

    // Isolated Tween Group
    this.tweenGroup = new TWEEN.Group();
    this.currentCameraTween = null;

    // Clock
    this.clock = new THREE.Clock();

    // Dedicated clock for spacecraft beacon animation (spin, blink, orbit
    // revolution). It advances ONLY while the simulation is playing, so the
    // play/pause control freezes spacecraft dots together with the planets.
    this.markerAnimationTime = 0;

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
    this.ambientLight = new THREE.AmbientLight(0x475569, 0.9);
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

    // 11. Main Asteroid Belt GPU InstancedMesh
    this.asteroidBelt = new AsteroidBelt(this.scene);

    // 12. In-Scene 3D Spacecraft Exploration Container & Dedicated Studio Illumination
    this.inspectedSpacecraftContainer = new THREE.Group();
    this.inspectedSpacecraftContainer.name = 'InspectedSpacecraftContainer';
    this.inspectedSpacecraftContainer.visible = false;
    this.scene.add(this.inspectedSpacecraftContainer);

    this.inspectionKeyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.inspectionKeyLight.position.set(6, 6, 6);
    this.inspectedSpacecraftContainer.add(this.inspectionKeyLight);
    this.inspectedSpacecraftContainer.add(this.inspectionKeyLight.target);
    this.inspectionKeyLight.target.position.set(0, 0, 0);

    this.inspectionFillLight = new THREE.DirectionalLight(0x93c5fd, 1.8);
    this.inspectionFillLight.position.set(-6, -2, -4);
    this.inspectedSpacecraftContainer.add(this.inspectionFillLight);
    this.inspectedSpacecraftContainer.add(this.inspectionFillLight.target);
    this.inspectionFillLight.target.position.set(0, 0, 0);

    this.inspectionRimLight = new THREE.DirectionalLight(0xa855f7, 1.2);
    this.inspectionRimLight.position.set(0, -6, -6);
    this.inspectedSpacecraftContainer.add(this.inspectionRimLight);
    this.inspectedSpacecraftContainer.add(this.inspectionRimLight.target);
    this.inspectionRimLight.target.position.set(0, 0, 0);

    this.inspectionAmbientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.inspectedSpacecraftContainer.add(this.inspectionAmbientLight);

    // Apply initial ephemeris positions for planets
    this.applyEphemeris();

    // 13. Event Listeners
    this.bindEvents();

    // 13. Animation Loop
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
        if (this.hoveredItem && this.planetBodies.has(this.hoveredItem)) {
          this.planetBodies.get(this.hoveredItem).setHovered(false);
        }
        this.hoveredItem = id;
        this.domElement.style.cursor = 'pointer';
        if (this.planetBodies.has(id)) {
          this.planetBodies.get(id).setHovered(true);
        }
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
        if (this.planetBodies.has(this.hoveredItem)) {
          this.planetBodies.get(this.hoveredItem).setHovered(false);
        }
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
    if (this.isInspectingSpacecraft) {
      // While inspecting a spacecraft in main 3D scene, allow full rotation/pan interaction without deselecting
      return;
    }
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.clickableMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const id = hitMesh.userData.id;
      if (hitMesh.userData.isSpacecraft) {
        // Spacecraft dots are pure navigation affordances: open the dedicated
        // 3D explore page so the model renders in its own clean studio viewport
        // with its mission description instead of being spawned inside the
        // parent planet's scene graph.
        if (this.onOpenSpacecraftPage && id) {
          this.onOpenSpacecraftPage(id);
          return;
        }
        this.focusSpacecraft(id);
      } else if (hitMesh.userData.isMoon) {
        this.focusMoon(id);
      } else {
        this.focusPlanet(id);
      }
    } else {
      // Empty space click deselects object
      this.deselectAll();
    }
  }

  deselectAll() {
    this.selectedBodyId = null;
    this.selectedSpacecraftSlug = null;
    this.trackedCraftSlug = null;
    this.resetTrackedBodyAnchor();
    this.planetBodies.forEach(pBody => pBody.setSelected(false));
    if (this.markers) this.markers.highlightMarker(null);
    if (this.interstellar) this.interstellar.highlightProbe(null);
    if (this.onDeselect) {
      this.onDeselect();
    }
  }

  /**
   * Clears the orbital-tracking anchor so a newly focused body never inherits
   * a stale position (which would cause a camera jump/spin).
   */
  resetTrackedBodyAnchor() {
    this.lastTrackedBodyId = null;
    this.lastTrackedBodyPos = null;
  }

  zoomIn(factor = 0.72) {
    if (!this.controls || !this.camera) return;
    const offset = this.camera.position.clone().sub(this.controls.target);
    const newDist = Math.max(this.controls.minDistance || 0.5, offset.length() * factor);
    offset.setLength(newDist);
    this.camera.position.copy(this.controls.target).add(offset);
    this.controls.update();
  }

  zoomOut(factor = 1.38) {
    if (!this.controls || !this.camera) return;
    const offset = this.camera.position.clone().sub(this.controls.target);
    const newDist = Math.min(this.controls.maxDistance || 18000, offset.length() * factor);
    offset.setLength(newDist);
    this.camera.position.copy(this.controls.target).add(offset);
    this.controls.update();
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
    if (this.isInspectingSpacecraft) {
      this.exitSpacecraftInspection(false);
    }
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
    this.resetTrackedBodyAnchor();
    this.planetBodies.forEach((pBody, pId) => pBody.setSelected(pId === planetId));
    this.interstellar.highlightProbe(null);
    this.markers.highlightMarker(null);

    if (this.onSelectPlanet) {
      this.onSelectPlanet(planetId);
    }

    const worldPos = body.getWorldPosition();
    const distanceOffset = this.getInspectionDistance(planetId, body.data.radius);
    const targetCameraPos = worldPos.clone().add(this.getSunlitViewOffset(worldPos, distanceOffset));

    this.smoothCameraTransition(targetCameraPos, worldPos, 1400, planetId);
  }

  /**
   * Balanced framing distance used when inspecting a single body (NASA Eyes style).
   * Slightly further out than the body radius so the whole globe, limbs and rings fit.
   */
  getInspectionDistance(bodyId, radius) {
    if (bodyId === 'sun') return Math.max(radius * 3.1, 24);
    if (bodyId === 'saturn') return Math.max(radius * 4.1, 17); // Leave room for the rings
    if (bodyId === 'jupiter') return Math.max(radius * 2.9, 14);
    return Math.max(radius * 3.0, 3.6);
  }

  /**
   * Builds a camera offset that keeps the viewer on the sunlit hemisphere.
   *
   * The Sun sits at the scene origin, so the direction "planet -> Sun" is the
   * normal of the illuminated half of the globe. Sampling the camera from that
   * side (with a slight elevation and tangential offset for a 3/4 hero view)
   * guarantees the selected body is visibly lit instead of showing its night
   * side as an unlit black silhouette.
   */
  getSunlitViewOffset(worldPos, distance) {
    const toSun = this.scratchVecA.copy(worldPos).multiplyScalar(-1);
    if (toSun.lengthSq() < 1e-8) {
      toSun.set(0, 0.25, 1); // Viewing the Sun itself (Sun position is the origin)
    }
    toSun.normalize();

    const up = this.scratchVecB.set(0, 1, 0);
    const tangent = new THREE.Vector3().crossVectors(up, toSun);
    if (tangent.lengthSq() < 1e-8) {
      tangent.set(1, 0, 0);
    }
    tangent.normalize();

    return new THREE.Vector3()
      .addScaledVector(toSun, 0.86)
      .addScaledVector(up, 0.36)
      .addScaledVector(tangent, 0.30)
      .normalize()
      .multiplyScalar(distance);
  }

  focusMoon(moonId) {
    if (this.isInspectingSpacecraft) {
      this.exitSpacecraftInspection(false);
    }
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
          const distanceOffset = Math.max(moonRadius * 3.2, 1.6);
          const targetCameraPos = worldPos.clone().add(this.getSunlitViewOffset(worldPos, distanceOffset));

          this.selectedBodyId = moonId;
          this.selectedSpacecraftSlug = null;
          this.resetTrackedBodyAnchor();
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

  /**
   * Focuses a spacecraft's plotted position in the Solar System.
   *
   * The 3D model itself is intentionally NOT spawned inside the planetary
   * scene: spacecraft models are presented on their dedicated explore page
   * (/spacecraft/:slug) where they sit in a clean studio viewport next to
   * their mission description. Spawning them at the marker position produced
   * oversized geometry intersecting the parent planet (see the "spacecraft
   * skewered through Earth" defect).
   *
   * @param {string} slug
   * @param {{ inspect?: boolean }} [options] pass `inspect: true` to opt into
   *        the legacy in-scene model inspection experience.
   */
  focusSpacecraft(slug, { inspect = false } = {}) {
    if (this.isVoyagerLocalMode && slug !== 'voyager-1') {
      this.exitVoyagerLocalMode(false);
    }
    if (this.isSurfaceMode && this.activeSurfaceCraft?.slug !== slug) {
      this.exitSurfaceMode(false);
    }
    if (this.isInspectingSpacecraft) {
      this.exitSpacecraftInspection(false);
    }

    this.selectedSpacecraftSlug = slug;
    this.selectedBodyId = null;
    this.trackedCraftSlug = slug;
    this.resetTrackedBodyAnchor();

    // Highlight target in subsystems
    this.interstellar.highlightProbe(slug);
    this.markers.highlightMarker(slug);

    if (this.onSelectSpacecraft) {
      this.onSelectSpacecraft(slug);
    }

    // Camera framing around the spacecraft's plotted dot (no model spawn).
    const craft = getEligibleSpacecraftRecord(slug) || VERIFIED_SPACECRAFT[slug];
    const targetWorldPos = this.getSpacecraftMarkerPosition(slug, craft);
    if (targetWorldPos) {
      const targetCamPos = targetWorldPos.clone().add(new THREE.Vector3(2.6, 1.5, 2.6));
      this.controls.autoRotate = false;
      this.controls.minDistance = 0.4;
      this.controls.maxDistance = 18000;
      this.smoothCameraTransition(targetCamPos, targetWorldPos, 1400, slug);
    }

    if (inspect) {
      this.enterSpacecraftInspection(slug);
    }
  }

  /**
   * Resolves a spacecraft's live world position from whichever subsystem owns
   * its marker (surface beacon, planetary orbiter, heliocentric probe or
   * interstellar probe).
   */
  getSpacecraftMarkerPosition(slug, craft = null) {
    const resolvedCraft = craft || getEligibleSpacecraftRecord(slug) || VERIFIED_SPACECRAFT[slug];

    if (resolvedCraft?.positionType === 'interstellar') {
      const probePos = this.interstellar?.getProbePosition(resolvedCraft.slug);
      if (probePos && Number.isFinite(probePos.x)) {
        return new THREE.Vector3().copy(probePos);
      }
    }

    const markerWorldPos = this.markers?.getMarkerWorldPosition(slug);
    if (markerWorldPos && Number.isFinite(markerWorldPos.x)) {
      return markerWorldPos;
    }

    if (resolvedCraft?.positionType === 'surface') {
      // Fallback: hover just above the parent body's surface.
      let parentBody = null;
      if (resolvedCraft.referenceBody === 'moon') {
        parentBody = this.planetBodies.get('earth');
        if (parentBody?.moonMesh) {
          const moonPos = new THREE.Vector3();
          parentBody.moonMesh.getWorldPosition(moonPos);
          return moonPos;
        }
        return null;
      }
      parentBody = this.planetBodies.get(resolvedCraft.referenceBody);
      if (parentBody) {
        const pos = parentBody.getWorldPosition();
        pos.y += (parentBody.data?.radius || 2.0) * 0.6;
        return pos;
      }
    }

    return null;
  }


  async enterSpacecraftInspection(slug) {
    const craft = getEligibleSpacecraftRecord(slug) || VERIFIED_SPACECRAFT[slug];
    if (!craft) return;

    // 1. Save prior solar system camera state
    if (!this.isInspectingSpacecraft) {
      this.previousSolarCameraState = {
        position: this.camera.position.clone(),
        target: this.controls.target.clone(),
        minDistance: this.controls.minDistance,
        maxDistance: this.controls.maxDistance,
        autoRotate: this.controls.autoRotate,
        autoRotateSpeed: this.controls.autoRotateSpeed
      };
    }

    this.isInspectingSpacecraft = true;
    this.inspectedCraft = craft;
    this.inspectedSpacecraftSlug = craft.slug;
    this.selectedSpacecraftSlug = craft.slug;

    // Clear prior model
    this.clearInspectedModel();

    // 2. Find world position anchor
    const targetWorldPos = new THREE.Vector3();
    let foundPos = false;

    if (craft.positionType === 'surface') {
      let parentBody = null;
      if (craft.referenceBody === 'mars') parentBody = this.planetBodies.get('mars');
      else if (craft.referenceBody === 'venus') parentBody = this.planetBodies.get('venus');
      else if (craft.referenceBody === 'mercury') parentBody = this.planetBodies.get('mercury');
      else if (craft.referenceBody === 'moon') {
        const earth = this.planetBodies.get('earth');
        if (earth && earth.moonMesh) {
          earth.moonMesh.getWorldPosition(targetWorldPos);
          foundPos = true;
        }
      }
      if (parentBody) {
        targetWorldPos.copy(parentBody.getWorldPosition());
        const rad = parentBody.data?.radius || 2.0;
        targetWorldPos.y += rad * 1.15;
        foundPos = true;
      }
    } else if (craft.positionType === 'interstellar') {
      const probePos = this.interstellar?.getProbePosition(craft.slug);
      if (probePos && Number.isFinite(probePos.x)) {
        targetWorldPos.copy(probePos);
        foundPos = true;
      }
    } else {
      const markerWorldPos = this.markers?.getMarkerWorldPosition(craft.slug);
      if (markerWorldPos && Number.isFinite(markerWorldPos.x)) {
        targetWorldPos.copy(markerWorldPos);
        foundPos = true;
      }
    }

    if (!foundPos) {
      targetWorldPos.set(45, 10, 45);
    }

    this.inspectedSpacecraftContainer.position.copy(targetWorldPos);
    this.inspectedSpacecraftContainer.visible = true;

    // Temporarily hide 2D markers and glowing halos across all subsystems
    this.markers?.setMarkerVisibility(craft.slug, false);
    this.interstellar?.setProbeMarkerVisibility(craft.slug, false);

    // 3. Load full 3D model (authentic GLB or high-fidelity technical reconstruction)
    try {
      const modelGroup = await loadSpacecraft3DModel(craft.slug, craft.modelPath);
      if (this.isInspectingSpacecraft && this.inspectedSpacecraftSlug === craft.slug) {
        this.inspectedModelGroup = modelGroup;
        this.inspectedSpacecraftContainer.add(modelGroup);

        // Optimal inspection framing: distance ~ 5.5 units from center of model
        const targetCamPos = targetWorldPos.clone().add(new THREE.Vector3(3.8, 2.0, 4.2));

        this.controls.minDistance = 1.0;
        this.controls.maxDistance = 45.0;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.8;

        this.smoothCameraTransition(targetCamPos, targetWorldPos, 1600, () => {
          if (this.controls) {
            this.controls.target.copy(targetWorldPos);
          }
        });

        if (this.onSpacecraftInspectionChange) {
          this.onSpacecraftInspectionChange({
            isInspecting: true,
            slug: craft.slug,
            craft
          });
        }
      }
    } catch (err) {
      console.error('Failed to load in-scene 3D model:', err);
    }
  }

  exitSpacecraftInspection(returnToSaved = true) {
    if (!this.isInspectingSpacecraft) return;
    const previousSlug = this.inspectedSpacecraftSlug;
    this.isInspectingSpacecraft = false;
    this.inspectedCraft = null;
    this.inspectedSpacecraftSlug = null;

    // Restore marker visibility
    if (previousSlug) {
      this.markers?.setMarkerVisibility(previousSlug, true);
      this.interstellar?.setProbeMarkerVisibility(previousSlug, true);
    }

    this.clearInspectedModel();

    if (returnToSaved && this.previousSolarCameraState) {
      const saved = this.previousSolarCameraState;
      this.controls.minDistance = saved.minDistance || 0.5;
      this.controls.maxDistance = saved.maxDistance || 18000;
      this.controls.autoRotate = saved.autoRotate || false;
      this.controls.autoRotateSpeed = saved.autoRotateSpeed || 1.0;

      this.smoothCameraTransition(saved.position, saved.target, 1500, () => {
        this.previousSolarCameraState = null;
      });
    } else {
      this.controls.minDistance = 0.5;
      this.controls.maxDistance = 18000;
      this.controls.autoRotate = false;
      this.smoothCameraTransition(this.defaultCameraPos, new THREE.Vector3(0, 0, 0), 1500);
    }

    if (this.onSpacecraftInspectionChange) {
      this.onSpacecraftInspectionChange({
        isInspecting: false,
        slug: null,
        craft: null
      });
    }
  }

  toggleInspectionAutoRotate() {
    if (this.controls) {
      this.controls.autoRotate = !this.controls.autoRotate;
      return this.controls.autoRotate;
    }
    return false;
  }

  clearInspectedModel() {
    if (this.inspectedModelGroup && this.inspectedSpacecraftContainer) {
      this.inspectedSpacecraftContainer.remove(this.inspectedModelGroup);
      this.inspectedModelGroup.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
      this.inspectedModelGroup = null;
    }
    if (this.inspectedSpacecraftContainer) {
      this.inspectedSpacecraftContainer.visible = false;
    }
  }

  enterSurfaceMode(slug) {
    const verified = getEligibleSpacecraftRecord(slug) || VERIFIED_SPACECRAFT[slug];
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
    this.resetTrackedBodyAnchor();
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
    this.enterSpacecraftInspection('voyager-1');
    if (this.onModeChange) {
      this.onModeChange({ isVoyagerLocal: true, scale: 'VOYAGER_LOCAL' });
    }
  }

  exitVoyagerLocalMode(returnToHeliosphere = true) {
    this.isVoyagerLocalMode = false;
    this.exitSpacecraftInspection(returnToHeliosphere);
    if (this.onModeChange) {
      this.onModeChange({ isVoyagerLocal: false, scale: 'HELIOSPHERE' });
    }
  }

  resetView() {
    if (this.isInspectingSpacecraft) {
      this.exitSpacecraftInspection(false);
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
    this.resetTrackedBodyAnchor();
    this.interstellar.highlightProbe(null);
    this.markers.highlightMarker(null);
    if (this.onSelectPlanet) this.onSelectPlanet(null);
    if (this.onSelectSpacecraft) this.onSelectSpacecraft(null);
    this.smoothCameraTransition(this.defaultCameraPos, new THREE.Vector3(0, 0, 0), 1500);
  }

  smoothCameraTransition(targetCamPos, targetFocus, duration = 1400, trackingTargetOrCb = null, optionalCb = null) {
    const trackingTargetId = typeof trackingTargetOrCb === 'string' ? trackingTargetOrCb : null;
    const onCompleteCb = typeof trackingTargetOrCb === 'function' ? trackingTargetOrCb : optionalCb;

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

    if (!this.isVoyagerLocalMode && !this.isSurfaceMode && !this.isInspectingSpacecraft) {
      this.controls.minDistance = 0.5;
      this.controls.maxDistance = 18000;
    }

    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const distance = startPos.distanceTo(safeTargetCamPos);
    const relativeOffset = safeTargetCamPos.clone().sub(safeTargetFocus);

    if (distance < 0.1) {
      this.camera.position.copy(safeTargetCamPos);
      this.controls.target.copy(safeTargetFocus);
      this.controls.update();
      this.isTransitioning = false;
      this.controls.enabled = true;
      if (onCompleteCb) onCompleteCb();
      return;
    }

    this.isTransitioning = true;
    this.controls.enabled = false;

    // Cinematic Elevation Arc: elevated midpoint prevents clipping through celestial spheres
    const arcHeight = Math.max(8, Math.min(distance * 0.22, 500));
    const midCamPos = new THREE.Vector3().addVectors(startPos, safeTargetCamPos).multiplyScalar(0.5);
    midCamPos.y += arcHeight;

    // Scratch vectors reused per frame while the target body keeps orbiting
    const liveEndPos = new THREE.Vector3();
    const liveMidPos = new THREE.Vector3();
    const liveTarget = new THREE.Vector3();

    this.currentCameraTween = new TWEEN.Tween({ t: 0 }, this.tweenGroup)
      .to({ t: 1 }, duration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(({ t }) => {
        const oneMinusT = 1 - t;

        // Track the moving body so the camera keeps its intended framing
        // (otherwise the planet drifts into the camera and fills the screen)
        let endPos = safeTargetCamPos;
        let endMid = midCamPos;
        liveTarget.copy(safeTargetFocus);
        if (trackingTargetId) {
          const livePos = this.getCelestialBodyPosition(trackingTargetId) || (this.markers && this.markers.getMarkerWorldPosition(trackingTargetId));
          if (livePos && Number.isFinite(livePos.x)) {
            liveTarget.copy(livePos);
            liveEndPos.copy(livePos).add(relativeOffset);
            endPos = liveEndPos;
            liveMidPos.addVectors(startPos, endPos).multiplyScalar(0.5);
            liveMidPos.y += arcHeight;
            endMid = liveMidPos;
          }
        }

        const pX = oneMinusT * oneMinusT * startPos.x + 2 * oneMinusT * t * endMid.x + t * t * endPos.x;
        const pY = oneMinusT * oneMinusT * startPos.y + 2 * oneMinusT * t * endMid.y + t * t * endPos.y;
        const pZ = oneMinusT * oneMinusT * startPos.z + 2 * oneMinusT * t * endMid.z + t * t * endPos.z;

        if (Number.isFinite(pX) && Number.isFinite(pY) && Number.isFinite(pZ)) {
          this.camera.position.set(pX, pY, pZ);
        }

        this.controls.target.lerpVectors(startTarget, liveTarget, t);
      })
      .onComplete(() => {
        this.currentCameraTween = null;
        this.isTransitioning = false;
        this.controls.enabled = true;
        this.controls.update();
        if (onCompleteCb) onCompleteCb();
      })
      .onStop(() => {
        this.currentCameraTween = null;
        this.isTransitioning = false;
        this.controls.enabled = true;
        this.controls.update();
        if (onCompleteCb) onCompleteCb();
      })
      .start();
  }

  setPlayPause(play) {
    this.isPlaying = play;
  }

  setTimeDirection(direction) {
    this.timeDirection = direction < 0 ? -1 : 1;
  }

  stepDays(days) {
    this.simulationDate = new Date(this.simulationDate.getTime() + days * 86400000);
    this.resetTrackedBodyAnchor();
    this.applyEphemeris();
    if (this.onDateChange) {
      this.onDateChange(this.simulationDate);
    }
  }

  setSpeed(multiplier) {
    this.speedMultiplier = Math.max(0.1, Math.min(multiplier, 100));
  }

  setSimulationDate(date) {
    if (!date) return;
    this.simulationDate = new Date(date);
    this.resetTrackedBodyAnchor();
    this.applyEphemeris();
    if (this.onDateChange) {
      this.onDateChange(this.simulationDate);
    }
  }

  applyEphemeris() {
    const jd = dateToJulianDate(this.simulationDate);

    // Update all major planets, dwarf planets, asteroids, and comets
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
      // Natural sunlight from central Sun with soft deep-space starlight fill
      this.ambientLight.color.setHex(0x475569);
      this.ambientLight.intensity = 0.9;
      this.floodLight.intensity = 0.0;
    }
  }

  setMapObjects(objects) {
    if (this.markers && typeof this.markers.setDatabaseObjects === 'function') {
      this.markers.setDatabaseObjects(objects);
    }
  }

  applyFilters(filterState) {
    if (!filterState) return;

    // 1. Planet visibility
    const showPlanets = !filterState.objectTypes || filterState.objectTypes.has('planet');
    this.planetBodies.forEach(body => {
      body.mesh.visible = showPlanets;
      if (body.orbitLine) body.orbitLine.visible = showPlanets && this.layerVisibility.orbits;
      if (body.labelSprite) body.labelSprite.visible = showPlanets && this.layerVisibility.labels;
    });

    // 2. Moon visibility
    const showMoons = !filterState.objectTypes || filterState.objectTypes.has('moon');
    this.planetBodies.forEach(body => {
      if (body.moons) {
        body.moons.forEach(m => {
          m.mesh.visible = showMoons;
        });
      }
    });

    // 3. Spacecraft markers filtering
    if (this.markers && typeof this.markers.applyFilters === 'function') {
      this.markers.applyFilters(filterState);
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
    } else if (layer === 'spacecraft') {
      this.interstellar.setMarkersVisible(visible);
      this.markers.setMarkersVisible(visible);
      this.interstellar.setTrajectoriesVisible(visible);
      this.markers.setTrajectoriesVisible(visible);
    } else if (layer === 'labels') {
      this.planetBodies.forEach(body => body.setLabelVisibility(visible));
    } else if (layer === 'asteroids') {
      if (this.asteroidBelt) {
        this.asteroidBelt.setVisible(visible);
      }
      this.planetBodies.forEach((body, id) => {
        if (body.data.type === 'asteroid' || id === 'ceres') {
          body.container.visible = visible;
          if (body.orbitLine) body.orbitLine.visible = visible && this.layerVisibility.orbits;
        }
      });
    } else if (layer === 'comets') {
      this.planetBodies.forEach((body) => {
        if (body.data.type === 'comet') {
          body.container.visible = visible;
          if (body.orbitLine) body.orbitLine.visible = visible && this.layerVisibility.orbits;
        }
      });
    } else if (layer === 'stars') {
      if (this.starfield && this.starfield.group) {
        this.starfield.group.visible = visible;
      }
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

    // Advance the spacecraft beacon clock only while playing, so pausing the
    // simulation also freezes spacecraft drift, spin and blinking.
    if (this.isPlaying) {
      this.markerAnimationTime += delta;
    }

    // 1. Advance simulation time if playing (single authoritative clock)
    if (this.isPlaying) {
      const msAdvance = delta * this.speedMultiplier * (this.timeDirection || 1) * this.daysPerSecond * 86400000;
      this.simulationDate = new Date(this.simulationDate.getTime() + msAdvance);
      this.applyEphemeris();

      // Emit throttled date updates to React UI
      if (this.onDateChange && (!this.lastDateEmit || performance.now() - this.lastDateEmit > 180)) {
        this.lastDateEmit = performance.now();
        this.onDateChange(this.simulationDate);
      }
    }

    // 2. Update Tweens
    if (this.tweenGroup) {
      this.tweenGroup.update();
    }

    // 3. Update Celestial Bodies (axial rotation, moon orbits, and adaptive labels)
    this.planetBodies.forEach(body => {
      body.updatePosition(delta, this.speedMultiplier, this.isPlaying, this.camera);
    });

    // 4. Update Spacecraft Markers
    if (this.markers) {
      this.markers.update(this.camera, this.markerAnimationTime);
    }

    // 5. Update Interstellar Probes
    if (this.interstellar) {
      this.interstellar.update(this.camera, this.markerAnimationTime);
    }

    // 5b. Update Main Asteroid Belt Swarm
    if (this.asteroidBelt) {
      this.asteroidBelt.update(delta, this.speedMultiplier);
    }

    // 6. Keep starfield centered on camera
    if (this.starfield) {
      this.starfield.update(this.camera);
    }

    // 7. Planetary & Spacecraft Orbital Tracking (Ride-Along Mode & In-Scene Inspection)
    if (this.isInspectingSpacecraft && this.inspectedCraft && !this.isTransitioning && this.isPlaying) {
      let currentPos = null;
      if (this.inspectedCraft.positionType === 'surface') {
        const body = this.planetBodies.get(this.inspectedCraft.referenceBody === 'moon' ? 'earth' : this.inspectedCraft.referenceBody);
        if (body) {
          currentPos = body.getWorldPosition();
          currentPos.y += 2.0;
        }
      } else if (this.inspectedCraft.positionType === 'interstellar') {
        currentPos = this.interstellar?.getProbePosition(this.inspectedCraft.slug);
      } else {
        currentPos = this.markers?.getMarkerWorldPosition(this.inspectedCraft.slug);
      }
      if (currentPos && Number.isFinite(currentPos.x)) {
        this.scratchVecA.copy(currentPos).sub(this.inspectedSpacecraftContainer.position);
        this.inspectedSpacecraftContainer.position.copy(currentPos);
        this.controls.target.copy(currentPos);
        this.camera.position.add(this.scratchVecA);
      }
    } else if (this.trackedCraftSlug && !this.isTransitioning && this.isPlaying) {
      const markerWorldPos = this.markers.getMarkerWorldPosition(this.trackedCraftSlug);
      if (markerWorldPos && Number.isFinite(markerWorldPos.x)) {
        this.scratchVecA.copy(markerWorldPos).sub(this.controls.target);
        this.controls.target.copy(markerWorldPos);
        this.camera.position.add(this.scratchVecA);
      }
    } else if (this.selectedBodyId && !this.isTransitioning && this.isPlaying) {
      const currentWorldPos = this.getCelestialBodyPosition(this.selectedBodyId);
      if (currentWorldPos && Number.isFinite(currentWorldPos.x)) {
        // Keep the camera offset anchored to the body while it orbits. For
        // planets, the offset also co-rotates with the orbital revolution so
        // the sunlit hemisphere keeps facing the camera over time (instead of
        // slowly drifting into an unlit "shadow" silhouette).
        const offset = this.scratchVecA.copy(this.camera.position).sub(this.controls.target);

        const canCoRotate = this.planetBodies.has(this.selectedBodyId) &&
          this.lastTrackedBodyId === this.selectedBodyId &&
          this.lastTrackedBodyPos;

        if (canCoRotate) {
          const prevAngle = Math.atan2(this.lastTrackedBodyPos.z, this.lastTrackedBodyPos.x);
          const currAngle = Math.atan2(currentWorldPos.z, currentWorldPos.x);
          let orbitDelta = currAngle - prevAngle;
          if (orbitDelta > Math.PI) orbitDelta -= Math.PI * 2;
          if (orbitDelta < -Math.PI) orbitDelta += Math.PI * 2;
          if (Math.abs(orbitDelta) > 1e-5) {
            offset.applyAxisAngle(this.scratchVecB.set(0, 1, 0), orbitDelta);
          }
        }

        this.controls.target.copy(currentWorldPos);
        this.camera.position.copy(currentWorldPos).add(offset);

        this.lastTrackedBodyId = this.selectedBodyId;
        if (!this.lastTrackedBodyPos) this.lastTrackedBodyPos = new THREE.Vector3();
        this.lastTrackedBodyPos.copy(currentWorldPos);
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

    this.clearInspectedModel();

    if (this.starfield) this.starfield.dispose();
    if (this.asteroidBelt) this.asteroidBelt.dispose();
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
