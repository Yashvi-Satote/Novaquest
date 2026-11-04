import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Box,
  Download,
  ExternalLink,
  AlertTriangle,
  RotateCw,
  Maximize2
} from 'lucide-react';

const NASA_EYES_URL = 'https://eyes.nasa.gov/apps/solar-system/';

/**
 * Interactive glb/gltf viewer with an explicit NASA Eyes fallback.
 * Props:
 *   models: array of spacecraft_models rows
 *   name:   spacecraft display name
 */
export default function ModelViewer({ models = [], name = 'Spacecraft' }) {
  const containerRef = useRef(null);
  const [viewerError, setViewerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const webModel = models.find(
    (m) => m && m.status === 'ok' && m.web_ready && m.download_url
  );
  const downloadable = models.filter((m) => m && m.status === 'ok' && m.download_url);
  const noModel = models.find((m) => m && m.status === 'no_model');
  const viewerUrl = models.find((m) => m && m.viewer_url)?.viewer_url || NASA_EYES_URL;

  useEffect(() => {
    if (!webModel || !containerRef.current) {
      return undefined;
    }

    const container = containerRef.current;
    let renderer;
    let frameId;
    let disposed = false;
    let dracoLoader;

    setViewerError(null);
    setIsLoading(true);

    try {
      const width = container.clientWidth || 640;
      const height = container.clientHeight || 360;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0b1220);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
      camera.position.set(3, 2, 5);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 1.1));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(5, 6, 7);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0x66ccff, 1.2);
      rimLight.position.set(-6, -3, -5);
      scene.add(rimLight);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.1;

      const loader = new GLTFLoader();
      // NASA 3D Resources GLBs are Draco-compressed.
      dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
      loader.setDRACOLoader(dracoLoader);
      loader.load(
        webModel.download_url,
        (gltf) => {
          if (disposed) return;
          const object = gltf.scene;
          const box = new THREE.Box3().setFromObject(object);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDimension = Math.max(size.x, size.y, size.z) || 1;
          const scale = 3 / maxDimension;
          object.scale.setScalar(scale);
          object.position.sub(center.multiplyScalar(scale));
          scene.add(object);

          camera.position.set(3.6, 2.4, 4.6);
          camera.lookAt(0, 0, 0);
          controls.target.set(0, 0, 0);
          controls.update();
          setIsLoading(false);
        },
        undefined,
        (error) => {
          if (disposed) return;
          console.error('GLB load failed:', error);
          setViewerError('The web-ready model could not be loaded. Use the download link or NASA Eyes below.');
          setIsLoading(false);
        }
      );

      const animate = () => {
        if (disposed) return;
        controls.update();
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };
      animate();

      const handleResize = () => {
        if (!container || disposed) return;
        const nextWidth = container.clientWidth || 640;
        const nextHeight = container.clientHeight || 360;
        camera.aspect = nextWidth / nextHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(nextWidth, nextHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        disposed = true;
        window.removeEventListener('resize', handleResize);
        if (frameId) cancelAnimationFrame(frameId);
        controls.dispose();
        if (dracoLoader) dracoLoader.dispose();
        renderer.dispose();
        if (container) container.innerHTML = '';
      };
    } catch (error) {
      console.error('Model viewer init failed:', error);
      // eslint-disable-next-line react/set-state-in-effect
      setViewerError('3D viewer unavailable in this browser. Use NASA Eyes or download the model.');
      setIsLoading(false);
      return () => {
        disposed = true;
      };
    }
  }, [webModel]);

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 bg-white/90 dark:bg-[#0c1222]/85 border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5">
        <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
          <Box className="w-5 h-5" />
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            9. Spacecraft 3D Model
          </h2>
        </div>
        {webModel && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-700/50">
            <RotateCw className="w-3 h-3" /> Interactive
          </span>
        )}
      </div>

      {webModel ? (
        <div className="space-y-2">
          <div
            ref={containerRef}
            className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-[#0b1220]"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                Loading model…
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Maximize2 className="w-3 h-3" />
            Drag to orbit, scroll to zoom. Source: {webModel.provider}. {webModel.license}.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-900/30 p-5 text-center space-y-2">
          <Box className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {noModel
              ? 'No NASA 3D Resources model matched this spacecraft. Section marked missing rather than substituting an unrelated model.'
              : 'No web-ready .glb model available for this spacecraft.'}
          </p>
          {downloadable.length > 0 && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Printable/CAD files are available below.
            </p>
          )}
        </div>
      )}

      {viewerError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{viewerError}</span>
        </div>
      )}

      {downloadable.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {downloadable.map((model, index) => (
            <a
              key={model.id || `${model.download_url}-${index}`}
              href={model.download_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs group"
            >
              <span className="flex items-center gap-2 min-w-0">
                <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                  {(model.format || 'model').toUpperCase()} download
                </span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 shrink-0 ml-2" />
            </a>
          ))}
        </div>
      )}

      <a
        href={viewerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 hover:underline"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Open in NASA Eyes on the Solar System
      </a>
      <p className="text-[10px] text-slate-400 dark:text-slate-500">
        {name} · NASA 3D resources are free to use without copyright.
      </p>
    </div>
  );
}
