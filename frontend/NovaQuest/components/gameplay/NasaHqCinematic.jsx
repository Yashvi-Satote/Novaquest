import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Award, Sparkles, Volume2, VolumeX, FastForward, Play, ChevronRight } from 'lucide-react';
import { createAstronautCharacter } from './three/AstronautCharacterModel';
import { createLeonardJaffeCharacter } from './three/LeonardJaffeModel';
import { createNasaOfficeEnvironment } from './three/NasaOfficeModel';
import { gameAudio } from '../../config/gameAudio';

/**
 * NasaHqCinematic.jsx
 * 
 * Scene 4: NASA Headquarters 1967 (1:00 - 1:30)
 * - 3D 1960s NASA Mission Control / Project Office with spinning tape reels and CRT monitors.
 * - Dr. Leonard Jaffe (Project Scientist) walks over to Leo with natural walking gait.
 * - Dr. Jaffe speaks the exact required dialogue aloud with synchronized lip-sync and hand gestures:
 *   "Leo! I'm glad you're here! We have an important mission. Before humanity can safely travel to the Moon,
 *    we need to understand its surface. We need to build a spacecraft that can land safely,
 *    study lunar soil and send pictures back to Earth. We need your help!"
 * - Astronaut Leo (cute cyan-blue character in spacesuit) listens, nods, and reacts.
 * - Interactive action: Proceed to Assembly Lab or Replay Scene.
 */
export default function NasaHqCinematic({ onComplete, onSkip }) {
  const mountRef = useRef(null);
  const [subPhase, setSubPhase] = useState('walking'); // 'walking' | 'speaking' | 'ready'
  const [displayedText, setDisplayedText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fullDialogue = "Leo! I'm glad you're here! We have an important mission. Before humanity can safely travel to the Moon, we need to understand its surface. We need to build a spacecraft that can land safely, study lunar soil and send pictures back to Earth. We need your help!";

  // Voice synthesis & typing effect
  const startSpeechSequence = () => {
    setIsSpeaking(true);
    setSubPhase('speaking');

    // Typewriter subtitle animation
    let charIdx = 0;
    setDisplayedText('');
    const typeInterval = setInterval(() => {
      charIdx += 2;
      setDisplayedText(fullDialogue.slice(0, charIdx));
      if (charIdx >= fullDialogue.length) {
        clearInterval(typeInterval);
      }
    }, 55);

    // Character voice synthesis
    gameAudio.speakDialogue(
      fullDialogue,
      'jaffe',
      null,
      () => {
        setIsSpeaking(false);
        setSubPhase('ready');
      }
    );
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(-0.5, 2.2, 7.5);
    camera.lookAt(-0.5, 1.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // --- 1967 NASA Office Environment ---
    const { root: officeRoot, update: updateOffice } = createNasaOfficeEnvironment();
    scene.add(officeRoot);

    // --- Astronaut Hero (Leo - Matching Reference Character) ---
    const astronaut = createAstronautCharacter({ scale: 0.9 });
    astronaut.position.set(-2.0, 0, 1.5);
    astronaut.rotation.y = 0.55; // Turned towards Dr. Jaffe
    scene.add(astronaut);
    astronaut.userData.anim.state = 'idle';

    // --- NPC: Dr. Leonard Jaffe (1967 Project Scientist) ---
    const jaffe = createLeonardJaffeCharacter({ scale: 1.0 });
    jaffe.position.set(3.5, 0, -1.0); // Starts across the room near his drafting table
    jaffe.rotation.y = -1.2; // Facing towards Leo
    scene.add(jaffe);
    jaffe.userData.anim.state = 'walk';

    // Lighting
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.6);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x38bdf8, 1.5, 15);
    fillLight.position.set(-3, 4, 3);
    scene.add(fillLight);

    let startTime = performance.now();
    let prevTime = startTime;
    let jaffeTargetX = 0.6;
    let jaffeArrived = false;

    let animFrameId;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - prevTime) / 1000, 0.1);
      const elapsed = (now - startTime) / 1000;
      prevTime = now;

      // Update spinning mainframe reels
      updateOffice(delta);

      // Dr. Jaffe walking animation towards Leo
      if (!jaffeArrived) {
        if (jaffe.position.x > jaffeTargetX) {
          jaffe.position.x -= 1.1 * delta;
          jaffe.position.z += 0.35 * delta;
          jaffe.userData.anim.state = 'walk';
          jaffe.userData.anim.update(delta, elapsed);
        } else {
          jaffeArrived = true;
          jaffe.userData.anim.state = 'talk';
          jaffe.userData.anim.isSpeaking = true;
          jaffe.rotation.y = -0.55; // Directly facing Leo
          startSpeechSequence();
        }
      } else {
        // Dr. Jaffe gestures and speaks
        jaffe.userData.anim.isSpeaking = isSpeaking;
        jaffe.userData.anim.update(delta, elapsed);

        // Leo reacts and nods attentively
        astronaut.userData.anim.state = 'idle';
        astronaut.userData.anim.update(delta, elapsed);
      }

      // Cinematic slow camera pan
      camera.position.x = -0.5 + Math.sin(elapsed * 0.2) * 0.4;
      camera.lookAt(-0.6, 1.8, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      gameAudio.stopSpeech();
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950 font-sans">
      {/* 3D Viewport */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Banner & Skip Cinematic */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-sky-400/40 shadow-lg pointer-events-auto">
          <Award className="w-5 h-5 text-sky-400 animate-pulse" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">Act 1 • Scene 4</span>
            <h2 className="text-sm sm:text-base font-extrabold text-white">NASA Headquarters — Washington D.C., 1967</h2>
          </div>
        </div>

        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-slate-300 hover:text-white rounded-2xl border border-slate-700 hover:border-sky-400 transition-all pointer-events-auto text-xs sm:text-sm font-semibold shadow-md active:scale-95"
          >
            <span>Skip Cinematic</span>
            <FastForward className="w-4 h-4 text-sky-400" />
          </button>
        )}
      </div>

      {/* Cinematic Lower Third Subtitle Dialogue Box */}
      <div className="absolute bottom-6 left-4 right-4 max-w-4xl mx-auto z-20 pointer-events-auto">
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/90 backdrop-blur-2xl border-2 border-sky-400/50 shadow-[0_12px_45px_rgba(2,132,199,0.4)] text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Dr. Jaffe Portrait */}
            <div className="relative shrink-0 flex items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 p-1 shadow-lg ring-2 ring-sky-300/60 overflow-hidden flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-center p-1">
                  <span className="text-2xl sm:text-3xl">👨‍🔬</span>
                  <span className="text-[9px] font-black text-sky-300 uppercase tracking-tighter">NASA 1967</span>
                </div>
              </div>

              {/* Leo Hero Portrait */}
              <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-sky-400/60 p-1 flex items-center justify-center shrink-0">
                <img src="/images/nova_alien_companion.png" alt="Astronaut Hero" className="w-9 h-9 object-contain drop-shadow" />
              </div>
            </div>

            {/* Dialogue Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-extrabold text-base sm:text-lg text-sky-300">Dr. Leonard Jaffe</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950 border border-sky-500/30 text-sky-400 font-semibold">
                  Project Scientist
                </span>
                {isSpeaking && (
                  <span className="flex items-center gap-1 text-[11px] text-amber-300 font-bold ml-2 animate-pulse">
                    <Volume2 className="w-3.5 h-3.5" /> Speaking
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
                {displayedText || '...'}
              </p>
            </div>

            {/* Action Button: Proceed or Replay */}
            <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              {subPhase === 'ready' ? (
                <button
                  id="begin-assembly-btn"
                  onClick={onComplete}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-sky-500/30 active:scale-95 transition-all"
                >
                  <span>Begin Mission</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    gameAudio.stopSpeech();
                    startSpeechSequence();
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs flex items-center gap-1.5"
                  title="Replay Voice Dialogue"
                >
                  <Play className="w-4 h-4 text-sky-400" />
                  <span className="hidden sm:inline">Replay</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

