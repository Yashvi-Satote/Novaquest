import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TWEEN from '@tweenjs/tween.js';
import { CELESTIAL_BODIES } from './celestialData.js';
import { Starfield } from './Starfield.js';
import { PlanetBody } from './PlanetBody.js';
import { InterstellarSystem } from './InterstellarSystem.js';
import { SpacecraftMarkerManager } from './SpacecraftMarkerManager.js';
import { SCALE_PRESETS } from './interstellarData.js';

/**
 * SolarEngine
 * Multi-scale Deep Space Mission Engine for Novaquest.
 * Extends from planetary surface landing sites out to interstellar space and galactic scales.
 * Features cinematic elevation arc camera transitions and scale-adaptive marker tracking.
 */
export class SolarEngine {
  constructor(container, options = {}) {
    this.container = container;
    this.onSelectPlanet = options.onSelectPlanet || null;
    this.onSelectSpacecraft = options.onSelectSpacecraft || null;
    this.onHoverItem = options.onHoverItem || null;

    // Simulation states
    this.isPlaying = true;
    this.speedMultiplier = 1.0;
    this.selectedBodyId = null;
    this.selectedSpacecraftSlug = null;
    this.isTransitioning = false;

    // Clock
    this.clock = new THREE.Clock();

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-999, -999);
    this.hoveredItem = null;

    // Pre-allocated scratch vectors for zero-allocation animation loop
    this.scratchVecA = new THREE.Vector3();
    this.scratchVecB = new THREE.Vector3();

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020409); // Deep cosmic aesthetic

    // 2. Camera with vast logarithmic clipping distance for multi-scale exploration
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 55000);
    this.defaultCameraPos = new THREE.Vector3(0, 110, 175);
    this.camera.position.copy(this.defaultCameraPos);

    // 3. Renderer with antialiasing and capped pixel ratio
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;

    this.domElement = this.renderer.domElement;
    this.domElement.style.display = 'block';
    this.domElement.style.width = '100%';
    this.domElement.style.height = '100%';
    this.container.appendChild(this.domElement);

    // 4. OrbitControls with multi-scale distance limits
    this.controls = new OrbitControls(this.camera, this.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2.0;   // Allow close planetary surface approach
    this.controls.maxDistance = 14000; // Allow deep galactic zoom out
    this.controls.maxPolarAngle = Math.PI * 0.98;
    this.controls.target.set(0, 0, 0);

    // 5. Rich Multi-Scale Starfield & Milky Way Galactic Band
    this.starfield = new Starfield(this.scene);

    // 6. Celestial Bodies
    this.planetBodies = new Map();
    this.clickableMeshes = [];

    CELESTIAL_BODIES.forEach(data => {
      const body = new PlanetBody(data, this.scene);
      this.planetBodies.set(data.id, body);
      if (body.mesh) {
        this.clickableMeshes.push(body.mesh);
      }
    });

    // 7. Interstellar System (Termination Shock, Heliopause, Voyager, Pioneer, New Horizons)
    this.interstellar = new InterstellarSystem(this.scene);
    this.clickableMeshes.push(...this.interstellar.clickableMeshes);

    // 8. Scale-Adaptive Surface & Orbital Spacecraft Markers
    this.markers = new SpacecraftMarkerManager(this.scene, this.planetBodies);
    this.clickableMeshes.push(...this.markers.clickableMeshes);

    // 9. Event Listeners
    this.bindEvents();

    // 10. Animation Loop
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
      if (dist < 5) {
        this.handleClick();
      }
    };

    this.domElement.addEventListener('pointermove', this.onPointerMove);
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.domElement.addEventListener('pointerup', this.onPointerUp);
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
        if (this.onHoverItem) {
          this.onHoverItem({
            id,
            name: hitMesh.userData.name,
            isSpacecraft,
            planet: hitMesh.userData.planet,
            coordinates: hitMesh.userData.coordinates
          });
        }
      }
    } else {
      if (this.hoveredItem) {
        this.hoveredItem = null;
        this.domElement.style.cursor = 'default';
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
      } else {
        this.focusPlanet(id);
      }
    }
  }

  focusPlanet(planetId) {
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
    const distanceOffset = planetId === 'sun' ? 24 : Math.max(radius * 5.2, 8.5);
    const targetCameraPos = new THREE.Vector3(
      worldPos.x + distanceOffset * 0.7,
      worldPos.y + distanceOffset * 0.45,
      worldPos.z + distanceOffset * 0.7
    );

    this.smoothCameraTransition(targetCameraPos, worldPos, 1400);
  }

  focusSpacecraft(slug) {
    this.selectedSpacecraftSlug = slug;
    this.selectedBodyId = null;

    // Highlight target in subsystems
    this.interstellar.highlightProbe(slug);
    this.markers.highlightMarker(slug);

    if (this.onSelectSpacecraft) {
      this.onSelectSpacecraft(slug);
    }

    // 1. Interstellar probe focus (Voyager, Pioneer, New Horizons)
    const probePos = this.interstellar.getProbePosition(slug);
    if (probePos) {
      const targetCamPos = new THREE.Vector3(
        probePos.x + 35,
        probePos.y + 20,
        probePos.z + 35
      );
      this.smoothCameraTransition(targetCamPos, probePos, 1600);
      return;
    }

    // 2. Planetary surface landing site focus (Apollo, Perseverance, Curiosity, etc.)
    const markerWorldPos = this.markers.getMarkerWorldPosition(slug);
    if (markerWorldPos) {
      const targetCamPos = markerWorldPos.clone().add(new THREE.Vector3(1.8, 1.2, 1.8));
      this.smoothCameraTransition(targetCamPos, markerWorldPos, 1500);
      return;
    }

    // 3. Fallback: match by destination body if exact coordinates are unmapped
    const destinationMap = {
      mars: 'mars',
      moon: 'earth',
      jupiter: 'jupiter',
      saturn: 'saturn',
      mercury: 'mercury',
      venus: 'venus',
      uranus: 'uranus',
      neptune: 'neptune',
      sun: 'sun'
    };

    for (const [key, bodyId] of Object.entries(destinationMap)) {
      if (slug.toLowerCase().includes(key)) {
        this.focusPlanet(bodyId);
        return;
      }
    }
  }

  focusScale(scalePresetKey) {
    const preset = SCALE_PRESETS[scalePresetKey];
    if (!preset) return;

    this.selectedBodyId = null;
    this.selectedSpacecraftSlug = null;
    this.interstellar.highlightProbe(null);
    this.markers.highlightMarker(null);

    let targetCamPos;
    let targetLookAt = new THREE.Vector3(0, 0, 0);

    if (preset.id === 'planetary') {
      targetCamPos = new THREE.Vector3(32, 6, 28);
      targetLookAt = new THREE.Vector3(30, 0, 0); // Near Earth
    } else if (preset.id === 'solar') {
      targetCamPos = new THREE.Vector3(0, 110, 175);
    } else if (preset.id === 'heliosphere') {
      targetCamPos = new THREE.Vector3(0, 520, 850);
    } else if (preset.id === 'galactic') {
      targetCamPos = new THREE.Vector3(0, 2200, 3600);
    }

    this.smoothCameraTransition(targetCamPos, targetLookAt, 1600);
  }

  resetView() {
    this.selectedBodyId = null;
    this.selectedSpacecraftSlug = null;
    this.interstellar.highlightProbe(null);
    this.markers.highlightMarker(null);
    if (this.onSelectPlanet) this.onSelectPlanet(null);
    if (this.onSelectSpacecraft) this.onSelectSpacecraft(null);
    this.smoothCameraTransition(this.defaultCameraPos, new THREE.Vector3(0, 0, 0), 1500);
  }

  smoothCameraTransition(targetCamPos, targetFocus, duration = 1400) {
    this.isTransitioning = true;
    this.controls.enabled = false;

    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();

    // Cinematic Elevation Arc: calculate elevated midpoint to prevent clipping through bodies
    const distance = startPos.distanceTo(targetCamPos);
    const arcHeight = Math.max(15, Math.min(distance * 0.22, 600));
    const midCamPos = new THREE.Vector3().addVectors(startPos, targetCamPos).multiplyScalar(0.5);
    midCamPos.y += arcHeight;

    new TWEEN.Tween({ t: 0 })
      .to({ t: 1 }, duration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(({ t }) => {
        // Quadratic Bézier curve for cinematic elevation flight path
        const oneMinusT = 1 - t;
        const pX = oneMinusT * oneMinusT * startPos.x + 2 * oneMinusT * t * midCamPos.x + t * t * targetCamPos.x;
        const pY = oneMinusT * oneMinusT * startPos.y + 2 * oneMinusT * t * midCamPos.y + t * t * targetCamPos.y;
        const pZ = oneMinusT * oneMinusT * startPos.z + 2 * oneMinusT * t * midCamPos.z + t * t * targetCamPos.z;

        this.camera.position.set(pX, pY, pZ);
        this.controls.target.lerpVectors(startTarget, targetFocus, t);
      })
      .onComplete(() => {
        this.isTransitioning = false;
        this.controls.enabled = true;
      })
      .start();
  }

  setPlayPause(play) {
    this.isPlaying = play;
  }

  setSpeed(multiplier) {
    this.speedMultiplier = Math.max(0.1, Math.min(multiplier, 100));
  }

  resize(width, height) {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // Update Tween animations
    TWEEN.update();

    // Update Celestial bodies
    this.planetBodies.forEach(body => {
      body.updatePosition(delta, this.speedMultiplier, this.isPlaying);
    });

    // Update scale-adaptive spacecraft markers
    if (this.markers) {
      this.markers.update(this.camera, elapsedTime);
    }

    // Update interstellar escape probes and beacons
    if (this.interstellar) {
      this.interstellar.update(this.camera, elapsedTime);
    }

    // Keep cosmic starfield and Milky Way centered on camera translation
    if (this.starfield) {
      this.starfield.update(this.camera);
    }

    // Follow moving planet if focused
    if (this.selectedBodyId && !this.isTransitioning && this.isPlaying) {
      const focusedBody = this.planetBodies.get(this.selectedBodyId);
      if (focusedBody) {
        const currentWorldPos = focusedBody.getWorldPosition();
        this.scratchVecA.copy(currentWorldPos).sub(this.controls.target);
        this.controls.target.copy(currentWorldPos);
        this.camera.position.add(this.scratchVecA);
      }
    }

    // Update controls
    this.controls.update();

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.isDisposed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.domElement) {
      this.domElement.removeEventListener('pointermove', this.onPointerMove);
      this.domElement.removeEventListener('pointerdown', this.onPointerDown);
      this.domElement.removeEventListener('pointerup', this.onPointerUp);
    }

    if (this.starfield) this.starfield.dispose();
    if (this.interstellar) this.interstellar.dispose();
    if (this.markers) this.markers.dispose();

    this.planetBodies.forEach(body => body.dispose());
    this.planetBodies.clear();
    this.clickableMeshes = [];

    if (this.controls) this.controls.dispose();

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    TWEEN.removeAll();
  }
}
