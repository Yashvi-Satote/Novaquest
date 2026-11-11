import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * CinematicMoonHero3D
 *
 * A single, oversized, slowly rotating Moon for the /app hero.
 *
 * - An orthographic camera makes the sphere's on-screen diameter predictable:
 *   it is expressed directly in viewport pixels (180% of the viewport height
 *   on desktop), which keeps the limb arc consistent at every size.
 * - Only the mesh rotates. The directional sunlight, the camera and the CSS
 *   shadow gradient stay fixed, so the lit limb never spins with the texture.
 * - Reduced-motion users get a still sphere; the animation pauses when the tab
 *   is hidden; the pixel ratio is capped at 2.
 * - If WebGL is unavailable the same texture is rendered by a CSS fallback.
 */

const MOON_TEXTURE = '/textures/planets/moon.jpg';
const SPIN_SECONDS = 120;

function getMoonLayout(width, height) {
  // World units are CSS pixels in the orthographic scene. The Moon's centre
  // sits left of the viewport centre so only its right/upper limb is visible.
  if (width < 640) {
    return {
      radius: height * 0.82,
      cx: -width / 2 + width * 0.76,
      cy: height * 0.24,
      opacity: 0.55,
    };
  }
  if (width < 1024) {
    return {
      radius: height * 0.6,
      cx: -width / 2 + width * 0.4,
      cy: 0,
      opacity: 1,
    };
  }
  return {
    radius: height * 0.87,
    cx: -width / 2 + width * 0.26,
    cy: 0,
    opacity: 1,
  };
}

function buildStarPositions(count, width, height) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const idx = i * 3;
    // Sparse scatter on the right half, where the deep-space background lives.
    positions[idx] = (0.48 + Math.random() * 0.52) * width - width / 2;
    positions[idx + 1] = (Math.random() - 0.5) * height;
    positions[idx + 2] = -120;
  }
  return positions;
}

export default function CinematicMoonHero3D({ className = '' }) {
  const mountRef = useRef(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || webglFailed) return undefined;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    let animId = null;
    let disposed = false;
    let elapsed = 0;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      4000,
    );
    camera.position.set(0, 0, 1000);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return undefined;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const clock = new THREE.Clock();
    const textureLoader = new THREE.TextureLoader();
    const moonTexture = textureLoader.load(MOON_TEXTURE);
    moonTexture.colorSpace = THREE.SRGBColorSpace;
    moonTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);

    // ---------- Fixed lighting (sun from the right, cool space fill) ----------
    const sunLight = new THREE.DirectionalLight(0xf7f9ff, 3.05);
    sunLight.position.set(12, 2.2, 7);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x27324a, 0.7);
    scene.add(ambientLight);

    const coolFill = new THREE.DirectionalLight(0x3d6bff, 0.22);
    coolFill.position.set(1, 0.4, -1);
    scene.add(coolFill);

    // ---------- The Moon ----------
    const moonGroup = new THREE.Group();
    scene.add(moonGroup);

    const moonGeometry = new THREE.SphereGeometry(1, 128, 96);
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: moonTexture,
      color: 0xf2f5ff,
      roughness: 1,
      metalness: 0,
    });
    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonGroup.add(moonMesh);

    // Faint Fresnel rim so the limb catches a little cold atmospheric haze.
    const glowGeometry = new THREE.SphereGeometry(1.012, 96, 64);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x9db8ea) },
        glowIntensity: { value: 0.42 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vViewNormal;
        void main() {
          vViewNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 glowColor;
        uniform float glowIntensity;
        varying vec3 vViewNormal;
        void main() {
          float rim = pow(1.0 - abs(vViewNormal.z), 3.0);
          gl_FragColor = vec4(glowColor, rim * glowIntensity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    moonGroup.add(glowMesh);

    // ---------- Sparse right-side starfield ----------
    const starCount = width < 640 ? 58 : 116;
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(buildStarPositions(starCount, width, height), 3),
    );
    const starMaterial = new THREE.PointsMaterial({
      color: 0xdfe9ff,
      size: 1.35,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // ---------- Tiny Surveyor-style probe drifting near the limb ----------
    const craft = new THREE.Group();
    const bodyGeometry = new THREE.CylinderGeometry(0.22, 0.34, 0.4, 6);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.75,
      roughness: 0.22,
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    craft.add(bodyMesh);

    const panelGeometry = new THREE.BoxGeometry(0.74, 0.035, 0.34);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x23345c,
      metalness: 0.9,
      roughness: 0.18,
    });
    const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
    panelMesh.position.set(0, 0.31, 0);
    craft.add(panelMesh);

    const mastGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6);
    const mastMaterial = new THREE.MeshStandardMaterial({ color: 0xdbe4f3 });
    const mastMesh = new THREE.Mesh(mastGeometry, mastMaterial);
    mastMesh.position.set(0.17, 0.44, 0);
    craft.add(mastMesh);

    const dishGeometry = new THREE.SphereGeometry(0.09, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const dishMaterial = new THREE.MeshStandardMaterial({
      color: 0xbcc7da,
      metalness: 0.65,
      roughness: 0.3,
    });
    const dishMesh = new THREE.Mesh(dishGeometry, dishMaterial);
    dishMesh.position.set(0.17, 0.59, 0);
    dishMesh.rotation.x = Math.PI;
    craft.add(dishMesh);

    scene.add(craft);

    let layout = getMoonLayout(width, height);

    const applyLayout = () => {
      layout = getMoonLayout(width, height);
      moonGroup.position.set(layout.cx, layout.cy, 0);
      moonMesh.scale.setScalar(layout.radius);
      glowMesh.scale.setScalar(layout.radius);
      craft.scale.setScalar(Math.max(height * 0.019, 9));
      craft.position.set(
        layout.cx + layout.radius * 1.03,
        layout.cy + layout.radius * 0.19,
        60,
      );
    };
    applyLayout();

    const resizeStars = () => {
      starGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(buildStarPositions(starCount, width, height), 3),
      );
      starGeometry.attributes.position.needsUpdate = true;
    };

    const handleResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      applyLayout();
      resizeStars();
    };
    window.addEventListener('resize', handleResize);

    const spinSpeed = prefersReducedMotion ? 0 : (Math.PI * 2) / SPIN_SECONDS;

    const animate = () => {
      if (disposed || document.hidden) {
        animId = null;
        return;
      }
      animId = requestAnimationFrame(animate);

      // Clamp delta so returning to a background tab never makes the Moon jump.
      const delta = Math.min(clock.getDelta(), 0.05);
      elapsed += delta;

      // Only the surface rotates; the light and camera never move.
      moonMesh.rotation.y -= delta * spinSpeed;

      const craftX = layout.cx + layout.radius * 1.03;
      const craftY = layout.cy + layout.radius * 0.19;
      craft.position.x = craftX + Math.sin(elapsed * 0.23) * layout.radius * 0.008;
      craft.position.y = craftY + Math.cos(elapsed * 0.31) * layout.radius * 0.012;
      craft.rotation.y = elapsed * 0.12;
      craft.rotation.z = Math.sin(elapsed * 0.4) * 0.14;

      starMaterial.opacity = 0.5 + Math.sin(elapsed * 0.55) * 0.07;

      renderer.render(scene, camera);
    };

    animate();

    const handleVisibility = () => {
      if (!document.hidden && animId === null) {
        clock.getDelta();
        animate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);

      const geometries = new Set();
      const materials = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) {
          const list = Array.isArray(object.material) ? object.material : [object.material];
          list.forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      moonTexture.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (typeof renderer.forceContextLoss === 'function') {
        renderer.forceContextLoss();
      }
    };
  }, [webglFailed]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div ref={mountRef} className="cinematic-moon-reveal absolute inset-0" />

      {/* CSS-only fallback for browsers without WebGL. */}
      {webglFailed && (
        <div className="cinematic-moon-reveal absolute inset-0 overflow-hidden">
          <div
            className="cinematic-fallback-sphere absolute overflow-hidden rounded-full"
            style={{
              boxShadow:
                'inset -90px -20px 140px 30px rgba(7,10,18,0.92), 0 0 120px rgba(157,184,234,0.10)',
            }}
          >
            <div
              className="cinematic-fallback-moon absolute inset-0 opacity-80"
              style={{ backgroundImage: `url(${MOON_TEXTURE})` }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, #070A12 0%, rgba(7,10,18,0.94) 32%, rgba(7,10,18,0.55) 52%, rgba(7,10,18,0.08) 68%, transparent 80%)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
