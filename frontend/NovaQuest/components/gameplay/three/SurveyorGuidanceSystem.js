import * as THREE from 'three';
import { guidanceAudio } from '../../../game/guidanceAudio';

/**
 * SurveyorGuidanceSystem.js
 * 
 * Complete 3D Sci-Fi Guidance & Interaction System for Surveyor 5:
 * 1. Tall Blue Light Pillar (additive blending, transparent cylinder with a gradient shader)
 * 2. Expanding Sonar-Style Ground Rings (repeating every 2 seconds)
 * 3. In-World 3D Marker Anchor with bobbing and camera projection
 * 4. Off-Screen Directional Indicator calculation (edge position & angle)
 * 5. Audio sonar proximity ping loop with dynamic rate & pitch scaling
 * 6. High-performance architecture: single allocation, zero per-frame garbage, delta-time driven
 */

// =========================================================================
// UNIFIED GUIDANCE CONFIGURATION OBJECT
// Tweak colors, distances, animations, and sound parameters here!
// =========================================================================
export const GUIDANCE_CONFIG = {
  // Proximity & Interaction Distances (in Lunar meters/units)
  INTERACT_RANGE: 8.0,              // Range within which "PRESS E" marker pops up & activates
  MAX_TRACK_DISTANCE: 140.0,        // Distance where distance bar is at 0% (spawn is ~123m)
  
  // Visual Aesthetics & Colors
  BEACON_COLOR: 0x00d2ff,           // Primary cyan/blue holographic beacon color
  BEACON_COLOR_HEX: '#00d2ff',      // Hex string for CSS / HUD styling
  BEACON_SECONDARY_HEX: '#38bdf8',  // Secondary sky-blue accent
  BEACON_HEIGHT: 85.0,              // Height of the tall vertical light pillar
  BEACON_RADIUS: 0.85,              // Radius of the light pillar cylinder
  
  // Ground Ripple Sonar Rings
  RIPPLE_DURATION: 2.0,             // Expanding ring animation cycle (seconds)
  RIPPLE_MAX_SCALE: 15.0,           // Maximum expansion scale of ground rings
  RIPPLE_RING_COUNT: 3,             // Number of staggered concentric rings
  
  // In-World 3D Marker Animation
  BOB_AMPLITUDE: 0.25,              // Smooth sine wave vertical bobbing amplitude (units)
  BOB_SPEED: 2.2,                   // Bobbing frequency (radians/sec)
  MARKER_HEIGHT_OFFSET: 2.5,        // Floating height above Surveyor 5 origin
  MARKER_FORWARD_OFFSET: 1.2,       // Forward offset toward front of Surveyor 5
  
  // Proximity Sonar Sound
  PING_INTERVAL_FAR: 2.3,           // Ping interval when > 100m away (seconds)
  PING_INTERVAL_CLOSE: 0.42,        // Ping interval when near 8m (seconds)
  PING_PITCH_FAR: 580,              // Base sonar pitch when far away (Hz)
  PING_PITCH_CLOSE: 940,            // Base sonar pitch when close (Hz)
  
  // Audio Engine Master Settings
  AUDIO_MASTER_VOLUME: 0.65,
  ENABLE_SPACE_HUM: true
};

// Pre-allocated static vectors to eliminate per-frame garbage collection
const _vLanderCenter = new THREE.Vector3();
const _vMarkerAnchor = new THREE.Vector3();
const _vProjected = new THREE.Vector3();
const _vScreenProj = new THREE.Vector3();

export function createSurveyorGuidanceSystem({
  scene,
  camera,
  surveyorPosition = new THREE.Vector3(0, 0, 0),
  terrainHeight = 0,
  config = GUIDANCE_CONFIG
}) {
  const root = new THREE.Group();
  root.name = 'SurveyorGuidanceSystem';

  // Base world position of Surveyor 5
  const landerBasePos = new THREE.Vector3(
    surveyorPosition.x,
    terrainHeight,
    surveyorPosition.z
  );

  // -------------------------------------------------------------------------
  // 1. TALL BLUE LIGHT PILLAR (Additive blending & Gradient Shader)
  // -------------------------------------------------------------------------
  const pillarGeo = new THREE.CylinderGeometry(
    config.BEACON_RADIUS * 0.75,
    config.BEACON_RADIUS * 1.6,
    config.BEACON_HEIGHT,
    32,
    1,
    true
  );

  const pillarMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(config.BEACON_COLOR) },
      uOpacity: { value: 0.85 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPos;

      void main() {
        // Vertical gradient: intense at the ground base, fading gracefully into the lunar sky
        float verticalFade = pow(1.0 - vUv.y, 1.6);
        
        // Soft cylinder edge falloff
        vec3 viewDir = normalize(vViewPos);
        float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 0.65);
        
        // Rhythmic slow atmospheric pulse
        float pulse = 0.82 + 0.18 * sin(uTime * 1.7);
        
        // Dynamic upward harmonic energy stream
        float stream = 0.92 + 0.08 * sin(vUv.y * 22.0 - uTime * 3.5);
        
        float alpha = verticalFade * (fresnel * 0.7 + 0.3) * pulse * stream * uOpacity;
        vec3 finalColor = uColor + vec3(0.18, 0.38, 0.55) * (1.0 - vUv.y);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
  pillarMesh.position.set(
    landerBasePos.x,
    landerBasePos.y + config.BEACON_HEIGHT / 2,
    landerBasePos.z
  );
  root.add(pillarMesh);

  // Inner core beam (brighter intense thin laser spine)
  const coreGeo = new THREE.CylinderGeometry(
    config.BEACON_RADIUS * 0.18,
    config.BEACON_RADIUS * 0.35,
    config.BEACON_HEIGHT * 0.9,
    16,
    1,
    true
  );
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.position.copy(pillarMesh.position);
  root.add(coreMesh);

  // -------------------------------------------------------------------------
  // 2. EXPANDING SONAR-STYLE GROUND RINGS
  // -------------------------------------------------------------------------
  const ringGeo = new THREE.RingGeometry(0.8, 1.35, 48);
  const ringMeshes = [];
  const ringCount = config.RIPPLE_RING_COUNT;

  for (let i = 0; i < ringCount; i++) {
    const ringMat = new THREE.MeshBasicMaterial({
      color: config.BEACON_COLOR,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(landerBasePos.x, landerBasePos.y + 0.06 + i * 0.005, landerBasePos.z);
    root.add(ring);
    ringMeshes.push({
      mesh: ring,
      mat: ringMat,
      phaseOffset: (i / ringCount)
    });
  }

  // -------------------------------------------------------------------------
  // 3. GROUND STATIC TARGET RETICLE (Holographic lunar pad decal)
  // -------------------------------------------------------------------------
  const baseDecalGeo = new THREE.RingGeometry(2.4, 2.7, 48);
  const baseDecalMat = new THREE.MeshBasicMaterial({
    color: config.BEACON_COLOR,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const baseDecal = new THREE.Mesh(baseDecalGeo, baseDecalMat);
  baseDecal.rotation.x = -Math.PI / 2;
  baseDecal.position.set(landerBasePos.x, landerBasePos.y + 0.04, landerBasePos.z);
  root.add(baseDecal);

  // Outer dashed tick ring
  const outerTickGeo = new THREE.RingGeometry(4.2, 4.38, 36);
  const outerTickMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const outerTick = new THREE.Mesh(outerTickGeo, outerTickMat);
  outerTick.rotation.x = -Math.PI / 2;
  outerTick.position.set(landerBasePos.x, landerBasePos.y + 0.035, landerBasePos.z);
  root.add(outerTick);

  scene.add(root);

  // Initialize Audio
  guidanceAudio.setVolume(config.AUDIO_MASTER_VOLUME);
  if (config.ENABLE_SPACE_HUM) {
    guidanceAudio.startSpaceHum();
  }

  // State
  let pingTimer = 0;
  let hasPlayedEnterChime = false;
  let isDisposed = false;

  // -------------------------------------------------------------------------
  // UPDATE LOOP (Driven by delta and elapsed time from main animation loop)
  // -------------------------------------------------------------------------
  const update = (delta, elapsed, playerPos, isSurveyorCollected = false) => {
    if (isDisposed || isSurveyorCollected) {
      root.visible = false;
      return null;
    }

    root.visible = true;

    // 1. Update Light Pillar Shader
    pillarMat.uniforms.uTime.value = elapsed;
    coreMat.opacity = 0.45 + Math.sin(elapsed * 4.0) * 0.2;

    // 2. Update Ground Ripple Rings (2-second cycle)
    const cycleTime = config.RIPPLE_DURATION;
    ringMeshes.forEach(item => {
      const currentPhase = ((elapsed / cycleTime) + item.phaseOffset) % 1.0;
      // Exponential expanding feel
      const scale = 1.0 + Math.pow(currentPhase, 0.85) * (config.RIPPLE_MAX_SCALE - 1.0);
      item.mesh.scale.set(scale, scale, scale);
      
      // Fade in quickly, then fade out smoothly toward 0
      const opacity = Math.sin(currentPhase * Math.PI) * (1.0 - currentPhase) * 0.85;
      item.mat.opacity = Math.max(0, opacity);
    });

    // 3. Rotating ground reticle
    outerTick.rotation.z = elapsed * 0.15;
    baseDecalMat.opacity = 0.35 + Math.sin(elapsed * 2.5) * 0.15;

    // 4. Calculate Distance to Surveyor 5
    const dx = playerPos.x - landerBasePos.x;
    const dz = playerPos.z - landerBasePos.z;
    const distance = Math.hypot(dx, dz);
    const inRange = distance <= config.INTERACT_RANGE;

    // Trigger holographic whoosh & chime on entering interaction range
    if (inRange && !hasPlayedEnterChime) {
      hasPlayedEnterChime = true;
      guidanceAudio.playMarkerAppears();
    } else if (!inRange && distance > config.INTERACT_RANGE + 2.5) {
      hasPlayedEnterChime = false;
    }

    // 5. Proximity Sonar Ping Timing
    pingTimer += delta;
    const distFactor = Math.max(0, Math.min(1, (distance - config.INTERACT_RANGE) / (config.MAX_TRACK_DISTANCE - config.INTERACT_RANGE)));
    const currentPingInterval = config.PING_INTERVAL_CLOSE + distFactor * (config.PING_INTERVAL_FAR - config.PING_INTERVAL_CLOSE);

    if (pingTimer >= currentPingInterval) {
      pingTimer = 0;
      guidanceAudio.playBeaconPing(
        distance,
        config.INTERACT_RANGE,
        config.MAX_TRACK_DISTANCE,
        config.PING_PITCH_FAR
      );
    }

    // 6. Floating 3D Holographic Marker Anchor Calculation
    const markerBobY = Math.sin(elapsed * config.BOB_SPEED) * config.BOB_AMPLITUDE;
    _vMarkerAnchor.set(
      landerBasePos.x,
      landerBasePos.y + config.MARKER_HEIGHT_OFFSET + markerBobY,
      landerBasePos.z + config.MARKER_FORWARD_OFFSET
    );

    // Project marker anchor into Camera Screen Space
    _vProjected.copy(_vMarkerAnchor).project(camera);
    const isMarkerInFront = _vProjected.z < 1.0;
    const markerScreenX = (_vProjected.x * 0.5 + 0.5) * window.innerWidth;
    const markerScreenY = (-(_vProjected.y * 0.5) + 0.5) * window.innerHeight;

    // 7. Off-Screen Directional Indicator Calculations
    _vLanderCenter.set(landerBasePos.x, landerBasePos.y + 1.8, landerBasePos.z);
    _vScreenProj.copy(_vLanderCenter).project(camera);

    const isTargetBehindCam = _vScreenProj.z > 1.0;
    let ndcX = isTargetBehindCam ? -_vScreenProj.x : _vScreenProj.x;
    let ndcY = isTargetBehindCam ? -_vScreenProj.y : _vScreenProj.y;

    if (Math.abs(ndcX) < 0.0001 && Math.abs(ndcY) < 0.0001) {
      ndcY = -1;
    }

    const isInView = !isTargetBehindCam &&
      ndcX >= -0.85 && ndcX <= 0.85 &&
      ndcY >= -0.85 && ndcY <= 0.85;

    // Screen edge clamping for indicator
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    const margin = Math.min(65, Math.min(halfW, halfH) * 0.15);

    const absX = Math.abs(ndcX);
    const absY = Math.abs(ndcY);
    const normFactor = Math.max(absX, absY);
    const scale = normFactor > 0.0001 ? 1.0 / normFactor : 1.0;
    const clampedNdcX = ndcX * scale;
    const clampedNdcY = ndcY * scale;

    const edgeX = halfW + clampedNdcX * (halfW - margin);
    const edgeY = halfH - clampedNdcY * (halfH - margin);
    // Angle in degrees for pointer arrow (0deg = Right, 90deg = Down, etc.)
    const pointerAngleDeg = Math.atan2(-clampedNdcY, clampedNdcX) * (180 / Math.PI);

    return {
      distance,
      inRange,
      // In-World 3D Marker Screen Coordinates
      marker: {
        x: markerScreenX,
        y: markerScreenY,
        visible: isMarkerInFront,
        inRange,
        bobOffset: markerBobY
      },
      // Off-Screen Directional Arrow
      offScreen: {
        isOffScreen: !isInView,
        edgeX,
        edgeY,
        angleDeg: pointerAngleDeg,
        distanceMeters: Math.round(distance)
      }
    };
  };

  // -------------------------------------------------------------------------
  // CLEANUP & DISPOSAL
  // -------------------------------------------------------------------------
  const dispose = () => {
    isDisposed = true;
    guidanceAudio.stopSpaceHum();

    [pillarGeo, coreGeo, ringGeo, baseDecalGeo, outerTickGeo].forEach(g => {
      try { g.dispose(); } catch (e) {}
    });

    [pillarMat, coreMat, baseDecalMat, outerTickMat].forEach(m => {
      try { m.dispose(); } catch (e) {}
    });

    ringMeshes.forEach(item => {
      try { item.mat.dispose(); } catch (e) {}
    });

    if (scene && root.parent === scene) {
      scene.remove(root);
    }
  };

  return {
    root,
    update,
    dispose,
    config,
    landerBasePos
  };
}
