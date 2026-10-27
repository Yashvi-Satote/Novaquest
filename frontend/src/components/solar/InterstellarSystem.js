import * as THREE from 'three';
import { 
  INTERSTELLAR_PROBES, 
  HELIOSPHERE_BOUNDARIES, 
  AU_TO_SCENE_SCALE 
} from './interstellarData';

/**
 * InterstellarSystem
 * Renders the outer solar system boundary, heliosphere, and interstellar escape probes.
 * Accurately calculates probe 3D positions from verified NASA JPL ecliptic latitude/longitude.
 * Features selective trajectory emphasis to eliminate crossing line clutter.
 */
export class InterstellarSystem {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.probeMeshes = new Map();
    this.trajectoryLines = new Map();
    this.beaconMeshes = new Map();
    this.clickableMeshes = [];
    this.disposables = [];
    this.selectedSlug = null;

    // Pre-allocated scratch vectors for zero-allocation updates
    this.scratchCamPos = new THREE.Vector3();
    this.scratchWorldPos = new THREE.Vector3();

    this.initHeliosphereBoundaries();
    this.initProbes();
  }

  initHeliosphereBoundaries() {
    // 1. Termination Shock Demarcation (~94 AU = ~300.8 scene units)
    // Clean, subtle translucent ecliptic glow ring (NO distracting 3D wireframe cage)
    const termRadius = HELIOSPHERE_BOUNDARIES.terminationShockAU * AU_TO_SCENE_SCALE;
    const termRingGeo = new THREE.RingGeometry(termRadius - 1.2, termRadius + 1.2, 96);
    termRingGeo.rotateX(Math.PI / 2);
    const termRingMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7, // Sky blue
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending
    });
    this.group.add(new THREE.Mesh(termRingGeo, termRingMat));
    this.disposables.push(termRingGeo, termRingMat);

    // 2. Heliopause Boundary Interface (~121.6 AU = ~389 scene units)
    // Marks the boundary where solar magnetic influence yields to the interstellar medium
    const helioRadius = HELIOSPHERE_BOUNDARIES.heliopauseAU * AU_TO_SCENE_SCALE;
    const helioRingGeo = new THREE.RingGeometry(helioRadius - 1.8, helioRadius + 1.8, 96);
    helioRingGeo.rotateX(Math.PI / 2);
    const helioRingMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8, // Indigo / violet
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });
    this.group.add(new THREE.Mesh(helioRingGeo, helioRingMat));
    this.disposables.push(helioRingGeo, helioRingMat);
  }

  initProbes() {
    INTERSTELLAR_PROBES.forEach(probe => {
      const radLat = THREE.MathUtils.degToRad(probe.eclipticLatitudeDeg);
      const radLon = THREE.MathUtils.degToRad(probe.eclipticLongitudeDeg);
      const r = probe.distanceAU * AU_TO_SCENE_SCALE;

      const posX = r * Math.cos(radLat) * Math.cos(radLon);
      const posY = r * Math.sin(radLat);
      const posZ = r * Math.cos(radLat) * Math.sin(radLon);

      const probeGroup = new THREE.Group();
      probeGroup.position.set(posX, posY, posZ);
      this.group.add(probeGroup);

      // Spacecraft core marker (visible at deep scale)
      const coreGeo = new THREE.OctahedronGeometry(2.8, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(probe.color),
        emissive: new THREE.Color(probe.color),
        emissiveIntensity: 0.9,
        metalness: 0.8,
        roughness: 0.2
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.userData = {
        id: probe.slug,
        name: probe.name,
        isSpacecraft: true,
        probeData: probe
      };
      probeGroup.add(coreMesh);
      this.clickableMeshes.push(coreMesh);
      this.probeMeshes.set(probe.slug, probeGroup);
      this.disposables.push(coreGeo, coreMat);

      // Glowing outer beacon ring with orientation toward Sun
      const beaconGeo = new THREE.RingGeometry(4.0, 5.0, 32);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(probe.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.lookAt(0, 0, 0);
      probeGroup.add(beaconMesh);
      this.beaconMeshes.set(probe.slug, beaconMesh);
      this.disposables.push(beaconGeo, beaconMat);

      // Trajectory escape curve from inner Solar System to current probe position
      const trajectoryPoints = this.calculateEscapeTrajectory(probe, posX, posY, posZ);
      const trajGeo = new THREE.BufferGeometry().setFromPoints(trajectoryPoints);
      
      // Default unselected state: very subtle opacity (0.12) to avoid cluttering the viewport
      const trajMat = new THREE.LineDashedMaterial({
        color: new THREE.Color(probe.color),
        dashSize: 10,
        gapSize: 6,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending
      });
      const trajLine = new THREE.Line(trajGeo, trajMat);
      trajLine.computeLineDistances();
      this.group.add(trajLine);
      this.trajectoryLines.set(probe.slug, trajLine);
      this.disposables.push(trajGeo, trajMat);
    });
  }

  calculateEscapeTrajectory(probe, endX, endY, endZ) {
    const steps = 48;
    const startX = 30 * (probe.eclipticLongitudeDeg > 180 ? -0.8 : 0.8);
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
      if (line.material) {
        // High-contrast prominence for selected trajectory, subtle background for unselected
        line.material.opacity = isSelected ? 0.85 : 0.08;
      }
    });

    this.beaconMeshes.forEach((beacon, pSlug) => {
      const isSelected = pSlug === slug;
      if (beacon) {
        beacon.scale.setScalar(isSelected ? 2.0 : 1.0);
        if (beacon.material) {
          beacon.material.opacity = isSelected ? 0.95 : 0.45;
        }
      }
    });
  }

  update(camera, time) {
    if (!camera) return;
    camera.getWorldPosition(this.scratchCamPos);

    this.probeMeshes.forEach((probeGroup, slug) => {
      probeGroup.getWorldPosition(this.scratchWorldPos);
      const distance = this.scratchCamPos.distanceTo(this.scratchWorldPos);

      // Adaptive scale so probe beacon remains readable across deep-space distances
      const baseScale = Math.max(0.65, Math.min(distance * 0.007, 4.0));
      probeGroup.scale.set(baseScale, baseScale, baseScale);

      // Orient beacon mesh toward camera
      const beacon = this.beaconMeshes.get(slug);
      if (beacon) {
        beacon.quaternion.copy(camera.quaternion);
        if (this.selectedSlug === slug) {
          const pulse = Math.sin(time * 5.0) * 0.4 + 1.8;
          beacon.scale.setScalar(pulse);
        }
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
    this.beaconMeshes.clear();
    this.clickableMeshes = [];
    this.disposables = [];
  }
}
