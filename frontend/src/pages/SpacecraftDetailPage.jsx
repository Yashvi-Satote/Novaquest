import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as TWEEN from '@tweenjs/tween.js';
import { resolveSpacecraft } from '../components/solar/spacecraftResolver.js';
import { loadSpacecraft3DModel } from '../components/solar/spacecraftModelRegistry.js';
import { fetchHardwareDetail } from '../services/api.js';
import Header from '../components/Header.jsx';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Calendar,
  MapPin,
  Building2,
  Cpu,
  Layers,
  Radio,
  Clock,
  Orbit,
  Eye,
  Crosshair,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function SpacecraftDetailPage({ theme, onToggleTheme }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const canvasContainerRef = useRef(null);

  // Resolved spacecraft metadata
  const [craftData, setCraftData] = useState(() => resolveSpacecraft(slug));
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'instruments' | 'discoveries' | 'timeline'
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [modelLoadError, setModelLoadError] = useState(null);
  const [activeComponentId, setActiveComponentId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Three.js scene refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const modelGroupRef = useRef(null);
  const tweenGroupRef = useRef(new TWEEN.Group());
  const initialCamPosRef = useRef(new THREE.Vector3(2.5, 1.8, 3.2));
  const animFrameIdRef = useRef(null);

  // 1. Resolve slug & fetch backend augmentation
  useEffect(() => {
    const resolved = resolveSpacecraft(slug);
    setCraftData(resolved);

    let isMounted = true;
    async function fetchBackendData() {
      try {
        const backendDetail = await fetchHardwareDetail(resolved.slug);
        if (isMounted && backendDetail) {
          setCraftData(prev => ({
            ...prev,
            ...backendDetail,
            name: backendDetail.name || prev.name,
            agency: backendDetail.agency_name || prev.agency,
            launchDate: backendDetail.launch_date || prev.launchDate,
            status: backendDetail.operational_status || prev.status,
            destination: backendDetail.destination || prev.destination,
            description: backendDetail.description || prev.description
          }));
        }
      } catch (_err) {
        // Archival resolver already has complete verified data; silent fallback
      }
    }
    fetchBackendData();
    return () => { isMounted = false; };
  }, [slug]);

  // 2. Initialize Three.js 3D Viewport
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030612);
    sceneRef.current = scene;

    // Subtle starfield points
    const starGeo = new THREE.BufferGeometry();
    const starCount = 600;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = (Math.random() - 0.5) * 80;
      starPositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.25,
      transparent: true,
      opacity: 0.65
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 500);
    camera.position.copy(initialCamPosRef.current);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.8;
    controls.maxDistance = 25.0;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

    // Studio Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunKeyLight = new THREE.DirectionalLight(0xfff8ee, 3.2);
    sunKeyLight.position.set(5, 8, 5);
    scene.add(sunKeyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-6, -2, -5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x818cf8, 1.2);
    fillLight.position.set(-4, 6, -3);
    scene.add(fillLight);

    // Load Spacecraft 3D Model
    setIsLoadingModel(true);
    setModelLoadError(null);

    loadSpacecraft3DModel(craftData.slug).then(model3D => {
      // Dynamic bounding box centering
      const bbox = new THREE.Box3().setFromObject(model3D);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      bbox.getCenter(center);
      bbox.getSize(size);

      const maxDim = Math.max(size.x, size.y, size.z) || 1.0;
      const fitScale = 2.4 / maxDim;
      model3D.position.sub(center.clone().multiplyScalar(fitScale));
      model3D.scale.multiplyScalar(fitScale);

      const rootGroup = new THREE.Group();
      rootGroup.add(model3D);
      scene.add(rootGroup);
      modelGroupRef.current = rootGroup;

      setIsLoadingModel(false);
    }).catch(err => {
      console.error('Failed to load 3D model for', craftData.slug, err);
      setModelLoadError('Could not load 3D model asset.');
      setIsLoadingModel(false);
    });

    // Render loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      tweenGroupRef.current.update();
      controls.autoRotate = isAutoRotating;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Window resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      if (container) container.innerHTML = '';
    };
  }, [craftData.slug, isAutoRotating]);

  // Camera Reset
  const handleResetCamera = () => {
    setActiveComponentId(null);
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    new TWEEN.Tween(camera.position, tweenGroupRef.current)
      .to(initialCamPosRef.current, 1000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();

    new TWEEN.Tween(controls.target, tweenGroupRef.current)
      .to({ x: 0, y: 0, z: 0 }, 1000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  };

  // Focus Component
  const handleFocusComponent = (comp) => {
    setActiveComponentId(comp.id);
    setIsAutoRotating(false);
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    const targetPos = new THREE.Vector3(...comp.pos);
    const camOffset = targetPos.clone().add(new THREE.Vector3(1.2, 0.8, 1.2));

    new TWEEN.Tween(camera.position, tweenGroupRef.current)
      .to(camOffset, 1200)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();

    new TWEEN.Tween(controls.target, tweenGroupRef.current)
      .to(targetPos, 1200)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-[#040816] text-slate-100 flex flex-col font-sans select-none`}>
      {/* Universal Header */}
      <Header
        theme={theme}
        onToggleTheme={onToggleTheme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* ========================================================================= */}
        {/* LEFT / CENTER: Interactive 3D Spacecraft Viewport */}
        {/* ========================================================================= */}
        <div className="relative flex-1 h-[55vh] lg:h-auto min-h-[420px] bg-gradient-to-b from-[#02040c] via-[#050a1d] to-[#02040c] overflow-hidden border-b lg:border-b-0 lg:border-r border-cyan-500/15">
          
          {/* Three.js Canvas Container */}
          <div ref={canvasContainerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Model Loading Spinner */}
          {isLoadingModel && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs z-20 space-y-3">
              <div className="w-12 h-12 rounded-full border-3 border-cyan-400 border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-cyan-300 tracking-wider">LOADING 3D GEOMETRY...</p>
            </div>
          )}

          {/* Top Left Navigation & Breadcrumb */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <button
              type="button"
              id="back-to-solar-system"
              onClick={() => navigate('/novamap')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-white text-xs font-semibold backdrop-blur-md border border-cyan-500/30 shadow-lg shadow-black/50 transition-all cursor-pointer active:scale-98"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>Back to NovaMap</span>
            </button>
          </div>

          {/* Top Right Model Authenticity Badge */}
          <div className="absolute top-4 right-4 z-10">
            <div className={`p-2.5 sm:p-3 rounded-xl border backdrop-blur-md shadow-xl text-xs space-y-1 max-w-xs ${
              craftData.isAuthenticModel
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/80 border-amber-500/40 text-amber-200'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                {craftData.isAuthenticModel ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{craftData.isAuthenticModel ? 'Authentic NASA 3D Model' : 'Illustrative 3D Reconstructed Model'}</span>
              </div>
              <p className="text-[11px] opacity-85 leading-tight font-sans">
                {craftData.provenance}
              </p>
            </div>
          </div>

          {/* Bottom Left 3D Camera Controls */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
            <button
              type="button"
              id="reset-camera-btn"
              onClick={handleResetCamera}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-mono backdrop-blur-md border border-white/10 transition-all shadow-md cursor-pointer active:scale-98"
              title="Reset camera viewpoint"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset Camera</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAutoRotating(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono backdrop-blur-md border transition-all shadow-md cursor-pointer active:scale-98 ${
                isAutoRotating
                  ? 'bg-cyan-950/70 border-cyan-400/40 text-cyan-300'
                  : 'bg-slate-900/80 border-white/10 text-slate-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isAutoRotating ? 'Pause Rotation' : 'Auto-Rotate'}</span>
            </button>
          </div>

          {/* Bottom Right Component Inspection Pills */}
          {craftData.components && craftData.components.length > 0 && (
            <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-400 px-2 flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-cyan-400" />
                Inspect:
              </span>
              {craftData.components.map(comp => (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => handleFocusComponent(comp)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    activeComponentId === comp.id
                      ? 'bg-cyan-500 text-black font-bold shadow-sm shadow-cyan-400/50'
                      : 'bg-white/5 hover:bg-white/10 text-slate-200'
                  }`}
                >
                  {comp.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: Verified Mission Information & Encyclopedia Drawer */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[480px] xl:w-[540px] h-full flex flex-col bg-[#05091a]/95 backdrop-blur-md overflow-y-auto custom-scrollbar border-t lg:border-t-0 border-white/10 p-5 sm:p-6 space-y-6">
          
          {/* Spacecraft Header Card */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  {craftData.objectType}
                </span>
                <h1 id="spacecraft-title" className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  {craftData.name}
                </h1>
                <p className="text-xs text-slate-300 font-medium">
                  Mission: <span className="text-cyan-200 font-semibold">{craftData.missionName}</span>
                </p>
              </div>

              {/* Status Badge */}
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 border ${
                craftData.status?.includes('Active')
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
              }`}>
                {craftData.status}
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-sans">
              {craftData.description}
            </p>
          </div>

          {/* Quick Telemetry Fact Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs font-sans">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-cyan-400" />
                Space Agency
              </span>
              <p className="font-semibold text-white truncate">{craftData.agency}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-purple-400" />
                Launch Date
              </span>
              <p className="font-semibold text-white truncate">{craftData.launchDate}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                Target / Destination
              </span>
              <p className="font-semibold text-white truncate">{craftData.destination}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Orbit className="w-3 h-3 text-emerald-400" />
                Reference Frame
              </span>
              <p className="font-semibold text-white truncate">{craftData.referenceFrame || 'Heliocentric'}</p>
            </div>
          </div>

          {/* Action: Return & View Trajectory in NovaMap */}
          <button
            type="button"
            onClick={() => navigate('/novamap')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-600/30 border border-cyan-400/40 cursor-pointer active:scale-98"
          >
            <Orbit className="w-4 h-4 text-cyan-200" />
            <span>View Flight Trajectory in NovaMap</span>
          </button>

          {/* Tabs Navigation */}
          <div className="flex border-b border-white/10 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Objectives', icon: Layers },
              { id: 'discoveries', label: 'Discoveries', icon: Sparkles },
              { id: 'instruments', label: 'Payload', icon: Cpu },
              { id: 'timeline', label: 'Timeline', icon: Clock }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-300 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Scientific Objectives */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider">
                Primary Scientific Mission Charter
              </h3>
              <ul className="space-y-2 text-xs text-slate-300 font-sans">
                {craftData.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tab 2: Scientific Discoveries */}
          {activeTab === 'discoveries' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider">
                Key Breakthroughs & Historical Discoveries
              </h3>
              <ul className="space-y-2 text-xs text-slate-300 font-sans">
                {craftData.discoveries.map((disc, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/15">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{disc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tab 3: Scientific Instruments Payload */}
          {activeTab === 'instruments' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono text-emerald-300 uppercase tracking-wider">
                Scientific Instruments & Sensor Payload
              </h3>
              <div className="space-y-2 text-xs">
                {craftData.instruments.map((inst, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                      {inst.name}
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {inst.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Mission Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider">
                Mission Milestones
              </h3>
              <div className="space-y-2 border-l-2 border-amber-500/30 pl-3 ml-2 text-xs">
                {craftData.timeline.map((item, i) => (
                  <div key={i} className="relative space-y-0.5 pb-2">
                    <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
                    <span className="text-[10px] font-mono font-bold text-amber-300">{item.date}</span>
                    <p className="text-slate-200 font-sans leading-relaxed">{item.event}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Reference & Archive Links */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Official Data Sources & Provenance
            </span>
            <div className="flex flex-wrap gap-2">
              {craftData.officialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-[11px] text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
