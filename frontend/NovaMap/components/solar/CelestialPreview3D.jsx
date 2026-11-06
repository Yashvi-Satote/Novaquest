import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sparkles, Compass } from 'lucide-react';

const PLANET_TEXTURE_URLS = {
  sun: '/textures/planets/sun.jpg',
  mercury: '/textures/planets/mercury.jpg',
  venus: '/textures/planets/venus_surface.jpg',
  earth: '/textures/planets/earth_day.jpg',
  moon: '/textures/planets/moon.jpg',
  mars: '/textures/planets/mars.jpg',
  jupiter: '/textures/planets/jupiter.jpg',
  saturn: '/textures/planets/saturn.jpg',
  uranus: '/textures/planets/uranus.jpg',
  neptune: '/textures/planets/neptune.jpg',
  pluto: '/textures/planets/pluto.jpg'
};

/**
 * Procedural fallback texture generator if image texture load is delayed or unavailable
 */
function createFallbackTexture(id, colorHex = '#3b82f6') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, 512, 256);

  // Surface bands or crater noise
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = Math.random() * 4 + 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/**
 * CelestialPreview3D
 * Interactive 3D miniature globe inspection viewport for CelestialDetailDrawer.
 * Inspired by NASA Eyes on the Solar System object preview.
 */
export default function CelestialPreview3D({ body }) {
  const containerRef = useRef(null);
  const [isRotating, setIsRotating] = useState(true);
  const isPointerDownRef = useRef(false);
  const prevPointerXRef = useRef(0);
  const prevPointerYRef = useRef(0);
  const meshGroupRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !body) return;

    const container = containerRef.current;
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 200;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 3.8);
    camera.lookAt(0, 0, 0);

    // 3. Renderer with transparent background
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting (Simulating central Sun key light + subtle fill)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(5, 3, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.45);
    fillLight.position.set(-5, -2, -4);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.8);
    scene.add(ambientLight);

    // 5. Mesh Group (Supports axial tilt and rotation)
    const meshGroup = new THREE.Group();
    meshGroupRef.current = meshGroup;
    scene.add(meshGroup);

    const disposables = [];

    // Axial tilt
    const axialTiltDeg = body.axialTilt || 0;
    meshGroup.rotation.z = (axialTiltDeg * Math.PI) / 180;

    // Sphere geometry
    const sphereGeo = new THREE.SphereGeometry(1.0, 48, 48);
    disposables.push(sphereGeo);

    // Texture loading
    const isSun = body.id === 'sun';
    const textureLoader = new THREE.TextureLoader();
    const textureUrl = PLANET_TEXTURE_URLS[body.id] || (body.isMoon ? PLANET_TEXTURE_URLS.moon : null);

    let planetMat;
    if (isSun) {
      const sunTexture = textureUrl ? textureLoader.load(textureUrl) : createFallbackTexture(body.id, '#ffaa00');
      disposables.push(sunTexture);
      planetMat = new THREE.MeshBasicMaterial({
        map: sunTexture,
        color: 0xffffff
      });
    } else {
      let texture;
      if (textureUrl) {
        texture = textureLoader.load(
          textureUrl,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.needsUpdate = true;
          },
          undefined,
          () => {
            const fallback = createFallbackTexture(body.id, body.color || '#3b82f6');
            if (planetMat) planetMat.map = fallback;
          }
        );
      } else {
        texture = createFallbackTexture(body.id, body.color || '#3b82f6');
      }
      disposables.push(texture);

      planetMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.72,
        metalness: 0.1
      });
    }
    disposables.push(planetMat);

    const sphereMesh = new THREE.Mesh(sphereGeo, planetMat);
    meshGroup.add(sphereMesh);

    // Earth atmosphere clouds layer
    if (body.id === 'earth') {
      const cloudGeo = new THREE.SphereGeometry(1.015, 48, 48);
      disposables.push(cloudGeo);
      const cloudTex = textureLoader.load('/textures/planets/earth_clouds.jpg');
      disposables.push(cloudTex);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
      });
      disposables.push(cloudMat);
      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      meshGroup.add(cloudMesh);
    }

    // Saturn Ring System
    if (body.hasRings || body.id === 'saturn') {
      const ringGeo = new THREE.RingGeometry(1.3, 2.4, 64);
      ringGeo.rotateX(Math.PI / 2);
      disposables.push(ringGeo);

      const ringTex = textureLoader.load('/textures/planets/saturn_ring.png');
      disposables.push(ringTex);
      const ringMat = new THREE.MeshStandardMaterial({
        map: ringTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88,
        roughness: 0.5
      });
      disposables.push(ringMat);

      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      meshGroup.add(ringMesh);

      // Adjust camera distance for rings
      camera.position.set(0, 0.7, 4.4);
    }

    // 6. Interactive Drag Controls (Rotate Globe on Drag)
    const onPointerDown = (e) => {
      isPointerDownRef.current = true;
      prevPointerXRef.current = e.clientX;
      prevPointerYRef.current = e.clientY;
    };

    const onPointerMove = (e) => {
      if (!isPointerDownRef.current || !meshGroupRef.current) return;
      const dx = e.clientX - prevPointerXRef.current;
      const dy = e.clientY - prevPointerYRef.current;
      prevPointerXRef.current = e.clientX;
      prevPointerYRef.current = e.clientY;

      meshGroupRef.current.rotation.y += dx * 0.01;
      meshGroupRef.current.rotation.x += dy * 0.01;
      meshGroupRef.current.rotation.x = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, meshGroupRef.current.rotation.x));
    };

    const onPointerUp = () => {
      isPointerDownRef.current = false;
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 7. Render Loop
    let animId;
    let disposed = false;
    const clock = new THREE.Clock();

    const animate = () => {
      if (disposed) return;
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isRotating && !isPointerDownRef.current && meshGroupRef.current) {
        meshGroupRef.current.rotation.y += delta * 0.45;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      disposables.forEach(d => {
        if (d && typeof d.dispose === 'function') d.dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [body, isRotating]);

  const handleResetAngle = () => {
    if (meshGroupRef.current && body) {
      meshGroupRef.current.rotation.set(0, 0, (body.axialTilt || 0) * (Math.PI / 180));
    }
  };

  return (
    <div className="relative w-full h-48 bg-gradient-to-b from-[#09061c] to-[#04020a] rounded-2xl overflow-hidden border border-cyan-500/25 shadow-inner group">
      {/* 3D Canvas Mount */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        title="Click and drag to rotate the 3D globe"
      />

      {/* Subtle Hint & Interactive Tools Overlay */}
      <div className="absolute top-2.5 left-3 flex items-center gap-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
        <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest font-semibold">
          3D Interactive Globe
        </span>
      </div>

      <div className="absolute top-2.5 right-3 flex items-center gap-1.5 z-10">
        <button
          type="button"
          onClick={() => setIsRotating(prev => !prev)}
          className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
            isRotating 
              ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300' 
              : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title={isRotating ? 'Pause globe auto-rotation' : 'Resume globe auto-rotation'}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        </button>
        <button
          type="button"
          onClick={handleResetAngle}
          className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white text-xs transition-all cursor-pointer"
          title="Reset globe orientation"
        >
          <Compass className="w-3.5 h-3.5 text-purple-300" />
        </button>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-[10px] font-mono text-slate-400/80 bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/5">
        Drag to rotate • Real NASA Texture Map
      </div>
    </div>
  );
}

