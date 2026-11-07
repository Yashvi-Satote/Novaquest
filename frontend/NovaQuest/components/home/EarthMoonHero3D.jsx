import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * EarthMoonHero3D.jsx
 * 
 * Interactive Three.js 3D Hero Canvas for "Time Travelers of Space"
 * - 3D Earth with rotating cloud sphere.
 * - Glowing Moon orbiting in the background.
 * - Colorful space particle field (stars, stardust).
 * - Animated retro cartoon space probe with thruster glow.
 * - Interactive mouse parallax tilt.
 * - Complete resource disposal on unmount to prevent memory leaks.
 */
export default function EarthMoonHero3D({ className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const earthDayTex = textureLoader.load('/textures/planets/earth_day.jpg');
    const earthCloudsTex = textureLoader.load('/textures/planets/earth_clouds.jpg');
    const moonTex = textureLoader.load('/textures/planets/moon.jpg');

    // 4. Lighting
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(15, 8, 12);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight.position.set(-15, -6, -8);
    scene.add(rimLight);

    // 5. Earth Sphere
    const earthGeo = new THREE.SphereGeometry(4.8, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthDayTex,
      roughness: 0.65,
      metalness: 0.1
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.set(1.5, -0.6, 0);
    scene.add(earthMesh);

    // Earth Clouds Sphere
    const cloudsGeo = new THREE.SphereGeometry(4.88, 48, 48);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: earthCloudsTex,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    earthMesh.add(cloudsMesh);

    // Earth Atmospheric Glow Halo
    const atmosphereGeo = new THREE.SphereGeometry(5.08, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    earthMesh.add(atmosphereMesh);

    // 6. Moon Sphere
    const moonGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      roughness: 0.9,
      metalness: 0.05
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(-7.5, 3.8, -4);
    scene.add(moonMesh);

    // 7. Mini Animated Surveyor / Cartoon Spacecraft
    const craftGroup = new THREE.Group();

    // Lander body (golden/white polygon body)
    const bodyGeo = new THREE.CylinderGeometry(0.25, 0.4, 0.45, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.8, roughness: 0.2 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    craftGroup.add(bodyMesh);

    // Solar Panel on probe
    const panelGeo = new THREE.BoxGeometry(0.7, 0.04, 0.35);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
    const panelMesh = new THREE.Mesh(panelGeo, panelMat);
    panelMesh.position.set(0, 0.35, 0);
    craftGroup.add(panelMesh);

    // Antenna mast
    const mastGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });
    const mastMesh = new THREE.Mesh(mastGeo, mastMat);
    mastMesh.position.set(0.18, 0.45, 0);
    craftGroup.add(mastMesh);

    // Thruster exhaust light
    const thrusterLight = new THREE.PointLight(0x06b6d4, 1.5, 3);
    thrusterLight.position.set(0, -0.3, 0);
    craftGroup.add(thrusterLight);

    craftGroup.scale.set(0.75, 0.75, 0.75);
    scene.add(craftGroup);

    // 8. Stardust & Colorful Space Particles
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0x38bdf8), // Sky blue
      new THREE.Color(0xffffff), // White
      new THREE.Color(0xfb923c), // Orange
      new THREE.Color(0xfde047), // Yellow
      new THREE.Color(0xc084fc)  // Purple
    ];

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      starPositions[idx] = (Math.random() - 0.5) * 45;
      starPositions[idx + 1] = (Math.random() - 0.5) * 35;
      starPositions[idx + 2] = (Math.random() - 0.5) * 30 - 5;

      const col = palette[Math.floor(Math.random() * palette.length)];
      starColors[idx] = col.r;
      starColors[idx + 1] = col.g;
      starColors[idx + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 9. Mouse Parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 10. Resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 11. Animation Loop
    let animId = null;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Slow Earth rotation
      earthMesh.rotation.y += delta * 0.08;
      cloudsMesh.rotation.y += delta * 0.11;

      // Slow Moon orbit & self-rotation
      moonMesh.rotation.y += delta * 0.04;
      moonMesh.position.x = -7.5 + Math.sin(elapsedTime * 0.15) * 0.8;
      moonMesh.position.y = 3.8 + Math.cos(elapsedTime * 0.18) * 0.4;

      // Probe Orbiting Earth
      const orbitRadius = 6.8;
      const orbitSpeed = elapsedTime * 0.45;
      craftGroup.position.x = earthMesh.position.x + Math.cos(orbitSpeed) * orbitRadius;
      craftGroup.position.z = earthMesh.position.z + Math.sin(orbitSpeed) * (orbitRadius * 0.6);
      craftGroup.position.y = earthMesh.position.y + Math.sin(orbitSpeed * 2) * 1.2;
      craftGroup.rotation.y = -orbitSpeed + Math.PI / 2;
      craftGroup.rotation.z = Math.sin(elapsedTime * 2) * 0.15;

      // Gentle starfield drift
      starField.rotation.y = elapsedTime * 0.015;

      // Smooth camera mouse parallax
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;
      camera.position.x = currentMouseX * 1.2;
      camera.position.y = currentMouseY * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 12. Cleanup & Disposal on Unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);

      // Dispose Three.js objects
      [earthGeo, cloudsGeo, atmosphereGeo, moonGeo, bodyGeo, panelGeo, mastGeo, starGeo].forEach(g => g?.dispose());
      [earthMat, cloudsMat, atmosphereMat, moonMat, bodyMat, panelMat, mastMat, starMat].forEach(m => m?.dispose());
      [earthDayTex, earthCloudsTex, moonTex].forEach(t => t?.dispose());

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
}

