import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Film,
  Sparkles,
  Camera,
  Layers,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Radio,
  X,
  Info
} from 'lucide-react';
import AppNavbar from '../../Shared/components/layout/AppNavbar';

// Production Episode Assets (served from /assets/memoir/)
const EPISODE_DATA = {
  id: 'surveyor-3',
  title: 'Surveyor 3 — The Little Explorer That Made History',
  subtitle: 'The Little Robot Who Waited',
  episodeNumber: '01',
  tagline: 'The only robotic spacecraft ever visited by humans on another world.',
  synopsis:
    'In April 1967, Surveyor 3 soft-landed inside a crater in the Ocean of Storms, scooping lunar soil and transmitting 6,315 photographs. Thirty-one months later, in November 1969, Apollo 12 astronauts Pete Conrad and Alan Bean executed a precision pinpoint landing and walked over to greet the sleeping pioneer.',
  duration: '5m 00s Master Documentary',
  previewDuration: '42s Story Preview',
  status: 'Master Documentary Ready',
  videoUrl: '/assets/memoir/surveyor3_5min_master_documentary.mp4',
  previewUrl: '/assets/memoir/episode_01_preview_42s.mp4',
  posterUrl: '/assets/memoir/surveyor3_5min_poster.jpg',
  scenes: [
    {
      id: 'scene-1',
      title: 'Scene 1: A Mysterious World',
      timeRange: '00:00 – 00:25',
      duration: '25s',
      timestamp: 0,
      videoUrl: '/assets/memoir/surveyor3_5min_master_documentary.mp4',
      thumbnail: '/assets/memoir/scene_01_thumb.jpg',
      label: 'NASA SVS 4593 Earthrise & LROC Lunar Limb Flyover',
      type: 'historical'
    },
    {
      id: 'scene-2',
      title: 'Scene 2: Meet Surveyor 3',
      timeRange: '00:25 – 00:50',
      duration: '25s',
      timestamp: 25,
      videoUrl: '/assets/memoir/surveyor3_5min_master_documentary.mp4',
      thumbnail: '/assets/memoir/scene_02_thumb.jpg',
      label: 'Surveyor 3 Architecture: Crane Descent & Spaceframe Analysis',
      type: 'animation'
    },
    {
      id: 'scene-3',
      title: 'Scene 3: The Mission Begins',
      timeRange: '00:50 – 01:15',
      duration: '25s',
      timestamp: 50,
      videoUrl: '/assets/memoir/surveyor3_5min_master_documentary.mp4',
      thumbnail: '/assets/memoir/scene_03_thumb.jpg',
      label: 'Atlas-Centaur Night Launch & JPL Mission Control Telemetry',
      type: 'animation'
    },
    {
      id: 'scene-4',
      title: 'Scene 4: A Dangerous Descent',
      timeRange: '01:15 – 01:45',
      duration: '30s',
      timestamp: 75,
      videoUrl: '/assets/memoir/surveyor3_5min_master_documentary.mp4',
      thumbnail: '/assets/memoir/scene_04_thumb.jpg',
      label: 'Terminal Retro-Descent, Radar Lock Anomaly & 35-ft Double Bounce',
      type: 'animation'
    },
    {
      id: 'scene-5',
      title: 'Scene 5: The Little Scientist',
      timeRange: '01:45 – 02:20',
      duration: '35s',
      timestamp: 105,
      videoUrl: '/assets/memoir/surveyor3_5min_master_documentary.mp4',
      thumbnail: '/assets/memoir/scene_05_thumb.jpg',
      label: 'Articulated Scissor Pantograph, 18-cm Trenching & Soil Strength Test',
      type: 'animation'
    },
    {
      id: 'scene-6',
      title: 'Scene 6: Scientific Findings',
      timeRange: '02:20 – 02:55',
      duration: '35s',
      timestamp: 140,
      videoUrl: '/assets/memoir/surveyor3_5min_master_documentary.mp4',
      thumbnail: '/assets/memoir/scene_06_thumb.jpg',
      label: 'Vidicon 360° Scan, 600-Line TV Raster Mosaic & Solar Eclipse',
      type: 'hybrid'
    },
    {
      id: 'scene-7',
      title: 'Scene 7: The Mission Goes Silent',
      timeRange: '02:55 – 03:25',
      duration: '30s',
      timestamp: 175,
      videoUrl: '/assets/memoir/surveyor3_5min_master_documentary.mp4',
      thumbnail: '/assets/memoir/scene_07_thumb.jpg',
      label: 'Crater Sunset Raking Shadows, -250°F Freeze & Signal Decay',
      type: 'hybrid'
    },
    {
      id: 'scene-8',
      title: 'Scene 8: Apollo 12 Returns',
      timeRange: '03:25 – 04:00',
      duration: '35s',
      timestamp: 205,
      videoUrl: '/assets/memoir/surveyor3_5min_master_documentary.mp4',
      thumbnail: '/assets/memoir/scene_08_thumb.jpg',
      label: 'Authentic 16mm Maurer LM Intrepid Descent & Pinpoint Touchdown',
      type: 'historical'
    },
    {
      id: 'scene-9',
      title: 'Scene 9: A Meeting Across Time',
      timeRange: '04:00 – 04:35',
      duration: '35s',
      timestamp: 240,
      videoUrl: '/assets/memoir/surveyor3_5min_master_documentary.mp4',
      thumbnail: '/assets/memoir/scene_09_thumb.jpg',
      label: 'Hasselblad AS12-48-7121: Pete Conrad Cutting Vidicon Camera',
      type: 'historical'
    },
    {
      id: 'scene-10',
      title: 'Scene 10: Legacy and Immortality',
      timeRange: '04:35 – 05:00',
      duration: '25s',
      timestamp: 275,
      videoUrl: '/assets/memoir/surveyor3_5min_master_documentary.mp4',
      thumbnail: '/assets/memoir/scene_10_thumb.jpg',
      label: 'Houston Lunar Receiving Lab Analysis & Permanent Cosmic Silhouette',
      type: 'hybrid'
    }
  ],
  historicalArtifacts: [
    {
      title: 'Apollo 12 Astronaut at Surveyor 3',
      catalog: 'NASA Photograph AS12-48-7133',
      image: '/assets/memoir/conrad_at_surveyor3_apollo12.jpg',
      caption: 'Astronaut Pete Conrad inspects Surveyor 3 with the Lunar Module Intrepid visible in the background.',
      badge: 'HISTORICAL NASA PHOTOGRAPH'
    },
    {
      title: 'Surface Sampler Testing Lunar Soil',
      catalog: 'Surveyor 3 Primary Mission (1967)',
      image: '/assets/memoir/surveyor3_soil_sampler.jpg',
      caption: 'The pantograph soil-mechanics surface sampler scooping trenches to test bearing strength before Apollo.',
      badge: 'HISTORICAL NASA PHOTOGRAPH'
    },
    {
      title: 'Surveyor 3 Soil Trenching in Real-Time',
      catalog: 'NASA JPL Archive',
      image: '/assets/memoir/surveyor3_scooping.jpg',
      caption: 'Authentic 1967 television image received from the Moon showing trench depths of several inches.',
      badge: 'HISTORICAL NASA PHOTOGRAPH'
    },
    {
      title: 'Surveyor 3 Camera Returned to Earth',
      catalog: 'Smithsonian National Air & Space Museum',
      image: '/assets/memoir/surveyor3_camera_returned.jpg',
      caption: 'Conrad and Bean carefully detached the television camera and returned it to Earth for microbiological analysis.',
      badge: 'HISTORICAL NASA ARTIFACT'
    }
  ],
  dramatizedAnimationStills: [
    {
      title: 'Surveyor 3 Anime Establishing Shot',
      concept: 'Dramatized Spacecraft Visual',
      image: '/assets/memoir/scene1_surveyor3_anime_establishing.jpg',
      caption: 'Cinematic anime rendering of Surveyor 3 resting in the crater under high-contrast lunar sunlight.',
      badge: 'DRAMATIZED ANIMATION'
    },
    {
      title: 'Spacecraft Close-Up & Sensor Mast',
      concept: 'Dramatized Spacecraft Visual',
      image: '/assets/memoir/scene2_surveyor3_anime_closeup.jpg',
      caption: 'Anime close-up showing solar panel mast, omnidirectional antenna, and thermal compartment.',
      badge: 'DRAMATIZED ANIMATION'
    },
    {
      title: 'The Cold Lunar Night',
      concept: 'Dramatized Spacecraft Visual',
      image: '/assets/memoir/scene3_surveyor3_anime_lunarnight.jpg',
      caption: 'Dramatized scene representing the onset of the -250°F two-week lunar night and silence.',
      badge: 'DRAMATIZED ANIMATION'
    },
    {
      title: 'Dormant Spacecraft Awaiting 1969',
      concept: 'Dramatized Spacecraft Visual',
      image: '/assets/memoir/scene3_surveyor3_anime_dormant_closeup.jpg',
      caption: 'Artistic representation of Surveyor 3 dormant on the regolith as the stars drift overhead.',
      badge: 'DRAMATIZED ANIMATION'
    }
  ]
};

const CANDIDATE_SAMPLES = [
  {
    id: 'sample-a',
    sceneKey: 'Scene A',
    title: 'Surveyor 3 on the Moon (Orbital Camera Track)',
    duration: '5.0s (120 frames @ 24fps)',
    videoUrl: '/assets/memoir/samples/sample_scene_a_surveyor3_lunar_orbit.mp4',
    thumbnail: '/assets/memoir/preview_sc1_anime_establishing.jpg',
    description:
      'Replaces flat white-grey lander shot. Smooth 3D cinematic camera tracking orbit revealing tripod legs, central mast, solar array, antenna, and TV mirror under golden lunar lighting with Earth rising in deep navy sky.',
    badge: 'CANDIDATE UPGRADE — SCENE A'
  },
  {
    id: 'sample-b',
    sceneKey: 'Scene B',
    title: 'Mechanical Pantograph Arm & Soil Trenching',
    duration: '6.0s (144 frames @ 24fps)',
    videoUrl: '/assets/memoir/samples/sample_scene_b_pantograph_arm_dig.mp4',
    thumbnail: '/assets/memoir/preview_sc3_blender_soil_dig.jpg',
    description:
      'Replaces white-grey arm test. Dynamic close-up of articulated pantograph scissor-linkage unfolding, golden scoop with tungsten blade cutting regolith trench, collecting soil clod, and lifting for camera inspection.',
    badge: 'CANDIDATE UPGRADE — SCENE B'
  },
  {
    id: 'sample-c',
    sceneKey: 'Scene C',
    title: 'Landing Footpad & Lunar Soil (Low-Angle 3D Orbit)',
    duration: '5.0s (120 frames @ 24fps)',
    videoUrl: '/assets/memoir/samples/sample_scene_c_footpad_soil_orbit.mp4',
    thumbnail: '/assets/memoir/preview_sc2_anime_camera_mast.jpg',
    description:
      'Completely eliminates the museum exhibition photo. Low-angle 3D camera sweeps around Footpad 1 and aluminum shock strut resting in powdery regolith with sharp black raking shadows.',
    badge: 'CANDIDATE UPGRADE — SCENE C'
  },
  {
    id: 'sample-d',
    sceneKey: 'Scene D',
    title: 'Vidicon TV Camera Scan & Mirror Tilt',
    duration: '8.0s (192 frames @ 24fps)',
    videoUrl: '/assets/memoir/samples/sample_scene_d_camera_horizon_scan.mp4',
    thumbnail: '/assets/memoir/preview_sc2_anime_camera_mast.jpg',
    description:
      'Smooth close-up pan across the central sensor mast as the motorized vidicon television camera and beryllium mirror tilt and rotate to survey the lunar horizon.',
    badge: 'CANDIDATE UPGRADE — SCENE D'
  },
  {
    id: 'sample-e',
    sceneKey: 'Scene E',
    title: 'The Silent Moon (Nightfall & Pullback)',
    duration: '8.0s (192 frames @ 24fps)',
    videoUrl: '/assets/memoir/samples/sample_scene_e_silent_moon_pullback.mp4',
    thumbnail: '/assets/memoir/preview_sc4_lunar_night.jpg',
    description:
      'Replaces static slide. Cinematic dolly-back as lunar sunset deepens shadows, sunlight fades, and Surveyor 3 falls into peaceful two-year dormancy beneath starry cosmos.',
    badge: 'CANDIDATE UPGRADE — SCENE E'
  },
  {
    id: 'sample-g',
    sceneKey: 'Scene G',
    title: 'Final Hero Shot — Historic Monument',
    duration: '12.0s (288 frames @ 24fps)',
    videoUrl: '/assets/memoir/samples/sample_scene_g_final_hero_ending.mp4',
    thumbnail: '/assets/memoir/preview_sc7_legacy_hero.jpg',
    description:
      'Replaces static zoompan. Majestic sweeping arc upward past the solar panel toward the radiant Earth in deep space, honoring the little robot that waited.',
    badge: 'CANDIDATE UPGRADE — SCENE G'
  }
];

const UPCOMING_EPISODES = [
  {
    id: 'mer-b',
    episodeNumber: '02',
    title: 'Opportunity — "My Battery is Low and It\'s Getting Dark"',
    target: 'Mars (Meridiani Planum)',
    status: 'In Scripting',
    statusColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    description:
      'Designed for a 90-sol mission, Oppy roved across Mars for nearly 15 years before an immense planet-encircling dust storm blotted out the sun in 2018.',
    ratio: 'Real NASA HiRISE/Rover Imagery + Anime Journey'
  },
  {
    id: 'voyager-1',
    episodeNumber: '03',
    title: 'Voyager 1 — Into the Interstellar Silence',
    target: 'Interstellar Space',
    status: 'In Pre-Production',
    statusColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    description:
      'Carrying the Golden Record and humanity\'s heartbeat, Voyager crossed the heliopause into true interstellar space, sending signals across 24 billion kilometers.',
    ratio: 'Archival NASA Telemetry + Deep Space Anime'
  },
  {
    id: 'viking-1',
    episodeNumber: '04',
    title: 'Viking 1 — The Red Planet\'s First Sentinel',
    target: 'Mars (Chryse Planitia)',
    status: 'Concept Stage',
    statusColor: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
    description:
      'In July 1976, Viking 1 transmitted the first panoramic clear photograph from the surface of Mars, listening to Martian winds for over 6 years.',
    ratio: '1976 Lander Telemetry + Anime Realism'
  }
];

export default function MemoirPage() {
  const navigate = useNavigate();
  const [activeVideo, setActiveVideo] = useState(null); // URL of modal video
  const [videoTitle, setVideoTitle] = useState('');
  const [startTimestamp, setStartTimestamp] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'authentic', 'dramatized'
  const videoRef = useRef(null);

  const openPlayer = (url, title, timestamp = 0) => {
    setActiveVideo(url);
    setVideoTitle(title);
    setStartTimestamp(timestamp);
    setIsPlaying(true);
    if (videoRef.current && timestamp > 0) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play().catch(() => {});
    }
  };

  const closePlayer = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActiveVideo(null);
    setVideoTitle('');
    setStartTimestamp(0);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#070A12] text-white selection:bg-[#3D6BFF]/30">
      <AppNavbar />

      {/* Background Ambience & Grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 15%, rgba(61,107,255,0.18) 0%, transparent 60%), radial-gradient(circle at 85% 75%, rgba(140,229,255,0.08) 0%, transparent 50%)'
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-15"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }}
      />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#AEB4C2] transition-colors hover:text-[#4F79FF]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to NovaQuest</span>
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-[#8ce5ff]">
            <Radio className="h-3 w-3 animate-pulse text-[#4F79FF]" />
            <span>MEMOIR ARCHIVE • ONLINE</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="mb-12 border-b border-white/[0.08] pb-10">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 self-start rounded-md border border-[#3D6BFF]/40 bg-[#3D6BFF]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-[#8ce5ff]">
              <Film className="h-3.5 w-3.5 text-[#3D6BFF]" />
              <span>Cinematic Animated Documentary Series</span>
            </div>

            <h1 className="cinematic-display text-4xl font-extrabold tracking-[0.2em] text-white sm:text-6xl md:text-7xl">
              MEMOIR
            </h1>

            <p className="cinematic-display text-lg font-medium italic tracking-[0.16em] text-[#8ce5ff] sm:text-2xl">
              &ldquo;Every machine has a story.&rdquo;
            </p>

            <p className="max-w-3xl text-sm leading-relaxed text-[#AEB4C2] sm:text-base">
              Explore the forgotten stories of machines left behind on the Moon and Mars through
              cinematic animated storytelling. Blending authentic NASA archival photography, real
              flight telemetry, and photorealistic cinematic space animation, MEMOIR breathes poetic
              voice into humanity&apos;s silent mechanical pioneers.
            </p>
          </div>
        </section>

        {/* Featured Episode: Surveyor 3 */}
        <section className="mb-16">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#3D6BFF] ring-4 ring-[#3D6BFF]/20" />
              <h2 className="text-xs font-bold uppercase tracking-[0.28em] text-[#8ce5ff]">
                Featured Episode 01
              </h2>
            </div>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
              {EPISODE_DATA.status}
            </span>
          </div>

          {/* Episode Master Card */}
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Media Preview Column */}
              <div className="relative aspect-video w-full bg-black lg:col-span-7">
                <img
                  src={EPISODE_DATA.posterUrl}
                  alt={EPISODE_DATA.title}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] via-transparent to-transparent opacity-80" />

                {/* Badges Over Video Preview */}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded bg-black/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8ce5ff] backdrop-blur-md">
                    Photorealistic Space Documentary
                  </span>
                  <span className="rounded bg-cyan-900/80 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                    1080p Full HD
                  </span>
                </div>

                {/* Play Button Overlay */}
                <button
                  type="button"
                  onClick={() => openPlayer(EPISODE_DATA.videoUrl, EPISODE_DATA.title)}
                  className="group absolute inset-0 flex items-center justify-center focus:outline-none"
                  aria-label={`Play ${EPISODE_DATA.title}`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-[#3D6BFF]/80 text-white shadow-[0_0_40px_rgba(61,107,255,0.7)] backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-[#4F79FF]">
                    <Play className="ml-1 h-7 w-7 fill-white" />
                  </div>
                </button>

                {/* Bottom Duration Tag */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-semibold text-white/90">
                  <Clock className="h-4 w-4 text-[#4F79FF]" />
                  <span>5:00 Master Documentary</span>
                </div>
              </div>

              {/* Episode Info Column */}
              <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4F79FF]">
                      Episode {EPISODE_DATA.episodeNumber}
                    </span>
                    <h3 className="mt-1 text-2xl font-bold tracking-[0.14em] text-white sm:text-3xl">
                      {EPISODE_DATA.title}
                    </h3>
                    <p className="mt-2 text-xs font-semibold tracking-[0.16em] text-[#8ce5ff]">
                      {EPISODE_DATA.tagline}
                    </p>
                  </div>

                  <p className="text-xs leading-relaxed text-[#AEB4C2] sm:text-sm">
                    {EPISODE_DATA.synopsis}
                  </p>

                  {/* Historical Quick Facts */}
                  <div className="grid grid-cols-2 gap-3 border-y border-white/10 py-4 text-[11px]">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-white/50">
                        Landed On Moon
                      </span>
                      <span className="font-semibold text-white">April 20, 1967</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-white/50">
                        Visited by Apollo 12
                      </span>
                      <span className="font-semibold text-white">November 19, 1969</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-white/50">
                        Landing Site
                      </span>
                      <span className="font-semibold text-white">Ocean of Storms (3.01° S)</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-white/50">
                        Camera Returned
                      </span>
                      <span className="font-semibold text-white">Smithsonian NASM</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => openPlayer(EPISODE_DATA.videoUrl, `${EPISODE_DATA.title} (5:00 Master Documentary)`)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3D6BFF] px-6 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white shadow-[0_0_25px_rgba(61,107,255,0.4)] transition-all hover:bg-[#4F79FF] hover:shadow-[0_0_35px_rgba(61,107,255,0.6)] focus:outline-none focus:ring-2 focus:ring-[#3D6BFF]"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    <span>PLAY FULL DOCUMENTARY (5 MIN)</span>
                  </button>
                  <a
                    href="#scenes"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/[0.04] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#AEB4C2] transition-colors hover:border-[#4F79FF] hover:text-white"
                  >
                    <span>Scenes (10)</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => openPlayer(EPISODE_DATA.previewUrl, `${EPISODE_DATA.title} (Original 42-second Preview)`)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#8ce5ff]/25 bg-[#8ce5ff]/5 px-3.5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8ce5ff]/80 transition-colors hover:border-[#8ce5ff] hover:bg-[#8ce5ff]/15 hover:text-[#8ce5ff]"
                    title="Watch the original 42-second concept preview"
                  >
                    <Film className="h-3.5 w-3.5" />
                    <span>Original 42-second Preview</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scene-by-Scene Production Cuts */}
        <section id="scenes" className="mb-16 scroll-mt-20">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-[#4F79FF]" />
                <h2 className="text-sm font-bold uppercase tracking-[0.28em] text-white">
                  Episode 01 — 10 Master Documentary Scenes
                </h2>
              </div>
              <p className="mt-1 text-xs text-[#AEB4C2]">
                Explore the complete 5-minute master sequence, jump to individual scenes, and inspect historical authenticity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {EPISODE_DATA.scenes.map((scene, idx) => (
              <div
                key={scene.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] transition-all hover:border-[#3D6BFF]/60 hover:bg-white/[0.05] hover:shadow-[0_0_25px_rgba(61,107,255,0.15)]"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                    <img
                      src={scene.thumbnail}
                      alt={scene.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/25 transition-opacity group-hover:opacity-0" />

                    <button
                      type="button"
                      onClick={() => openPlayer(scene.videoUrl, `${scene.title} (${scene.timeRange})`, scene.timestamp)}
                      className="absolute inset-0 flex items-center justify-center"
                      aria-label={`Jump to ${scene.title}`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3D6BFF]/90 text-white shadow-lg transition-transform group-hover:scale-110">
                        <Play className="ml-0.5 h-4 w-4 fill-white" />
                      </div>
                    </button>

                    <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                      {scene.timeRange}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#4F79FF]">
                        Scene {idx < 9 ? '0' : ''}{idx + 1}
                      </span>
                      <span className="text-[9px] font-mono text-[#8ce5ff]">
                        {scene.duration}
                      </span>
                    </div>
                    <h4 className="mt-1 text-sm font-bold text-white transition-colors group-hover:text-[#8ce5ff]">
                      {scene.title}
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#AEB4C2]">
                      {scene.label}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => openPlayer(scene.videoUrl, `${scene.title} (${scene.timeRange})`, scene.timestamp)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded border border-white/15 bg-white/[0.02] py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:border-[#4F79FF] hover:bg-[#3D6BFF]/10"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>Jump to Scene ({scene.timeRange})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Candidate Visual Upgrades (Scenes A, B, C) — Pending User Approval */}
        <section className="mb-16 scroll-mt-20">
          <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-[#070b14] to-amber-900/10 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-amber-300">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold uppercase tracking-[0.2em] text-white">
                    Production Sequence & Visual Upgrade Archive
                  </h3>
                  <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Approved & Integrated into 5-Min Master
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#AEB4C2] sm:text-sm">
                  Historical archival photography, high-detail Blender 3D spacecraft animation, and verified Apollo 12 footage have replaced all prototype materials across the complete 10-scene master documentary.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {CANDIDATE_SAMPLES.map((sample) => (
              <div
                key={sample.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-amber-500/30 bg-white/[0.03] transition-all hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img
                      src={sample.thumbnail}
                      alt={sample.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:opacity-10" />

                    <button
                      type="button"
                      onClick={() => openPlayer(sample.videoUrl, `${sample.sceneKey}: ${sample.title}`)}
                      className="absolute inset-0 flex items-center justify-center"
                      aria-label={`Play ${sample.title}`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/90 text-black shadow-lg transition-transform group-hover:scale-110">
                        <Play className="ml-0.5 h-5 w-5 fill-black text-black" />
                      </div>
                    </button>

                    <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[9px] font-semibold text-amber-300">
                      {sample.duration}
                    </div>

                    <div className="absolute top-2 left-2 rounded bg-amber-500/90 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-black">
                      {sample.sceneKey}
                    </div>
                  </div>

                  <div className="p-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                      {sample.badge}
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-white transition-colors group-hover:text-amber-200">
                      {sample.title}
                    </h4>
                    <p className="mt-2 text-[11px] leading-relaxed text-[#AEB4C2]">
                      {sample.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => openPlayer(sample.videoUrl, `${sample.sceneKey}: ${sample.title}`)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded border border-amber-500/40 bg-amber-500/10 py-2.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500 hover:text-black"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Watch Sample Video ({sample.duration.split(' ')[0]})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Clear Distinction: Authentic NASA History vs Dramatized Animation */}
        <section className="mb-16">
          <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-r from-[#0c1633] via-[#070b14] to-[#121c3d] p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg border border-[#4F79FF]/40 bg-[#3D6BFF]/10 p-3 text-[#8ce5ff]">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-[0.2em] text-white">
                  Historical Authenticity &amp; Artistic Integrity
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#AEB4C2] sm:text-sm">
                  NovaQuest MEMOIR adheres to strict historical fidelity. Real NASA archival
                  photographs, official Apollo 12 film records, and JPL mission telemetry are never
                  manipulated or disguised. Dramatized anime sequences and fictional inner voices are
                  clearly labeled, providing poetic homage without compromising historical reality.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                activeTab === 'all'
                  ? 'bg-[#3D6BFF] text-white shadow-[0_0_15px_rgba(61,107,255,0.4)]'
                  : 'bg-white/[0.03] text-[#AEB4C2] hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              All Assets ({EPISODE_DATA.historicalArtifacts.length + EPISODE_DATA.dramatizedAnimationStills.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('authentic')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                activeTab === 'authentic'
                  ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                  : 'bg-white/[0.03] text-[#AEB4C2] hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              Authentic NASA Records ({EPISODE_DATA.historicalArtifacts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dramatized')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                activeTab === 'dramatized'
                  ? 'bg-sky-600 text-white shadow-[0_0_15px_rgba(2,132,199,0.4)]'
                  : 'bg-white/[0.03] text-[#AEB4C2] hover:bg-white/[0.07] hover:text-white'
              }`}
            >
              Dramatized Animation ({EPISODE_DATA.dramatizedAnimationStills.length})
            </button>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(activeTab === 'all' || activeTab === 'authentic') &&
              EPISODE_DATA.historicalArtifacts.map((artifact, i) => (
                <div
                  key={`hist-${i}`}
                  className="flex flex-col justify-between overflow-hidden rounded-xl border border-amber-500/30 bg-amber-950/10 p-4 transition-all hover:border-amber-400/60 hover:bg-amber-950/20"
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded border border-amber-400/40 bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                        <Camera className="h-3 w-3" />
                        {artifact.badge}
                      </span>
                    </div>

                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                      <img
                        src={artifact.image}
                        alt={artifact.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <h4 className="mt-3 text-sm font-bold text-white">{artifact.title}</h4>
                    <p className="text-[10px] uppercase tracking-wider text-amber-300/80">
                      {artifact.catalog}
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-[#AEB4C2]">
                      {artifact.caption}
                    </p>
                  </div>
                </div>
              ))}

            {(activeTab === 'all' || activeTab === 'dramatized') &&
              EPISODE_DATA.dramatizedAnimationStills.map((still, i) => (
                <div
                  key={`anim-${i}`}
                  className="flex flex-col justify-between overflow-hidden rounded-xl border border-sky-500/30 bg-sky-950/10 p-4 transition-all hover:border-sky-400/60 hover:bg-sky-950/20"
                >
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded border border-sky-400/40 bg-sky-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-300">
                        <Sparkles className="h-3 w-3" />
                        {still.badge}
                      </span>
                    </div>

                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                      <img
                        src={still.image}
                        alt={still.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <h4 className="mt-3 text-sm font-bold text-white">{still.title}</h4>
                    <p className="text-[10px] uppercase tracking-wider text-sky-300/80">
                      {still.concept}
                    </p>
                    <p className="mt-2 text-[11px] leading-relaxed text-[#AEB4C2]">
                      {still.caption}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Series Episodes & Production Pipeline */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#4F79FF]" />
              <h2 className="text-sm font-bold uppercase tracking-[0.28em] text-white">
                Memoir Series Roadmap &amp; Progress
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#AEB4C2]">4 Episodes Planned</span>
          </div>

          <div className="space-y-4">
            {/* Active Episode 01 row */}
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#3D6BFF]/50 bg-[#3D6BFF]/10 p-5 backdrop-blur-md sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3D6BFF] text-sm font-bold text-white">
                  01
                </span>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-white">
                      {EPISODE_DATA.title}
                    </h3>
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Master Ready (5m 00s)
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#AEB4C2]">
                    The Moon • Ocean of Storms • 1967–1969 Apollo 12 Rendezvous • Complete 10-Scene Master Documentary
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openPlayer(EPISODE_DATA.videoUrl, `${EPISODE_DATA.title} (Master 5m 00s)`)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#3D6BFF] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-[#4F79FF]"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Full Documentary</span>
                </button>
                <button
                  type="button"
                  onClick={() => openPlayer(EPISODE_DATA.previewUrl, `${EPISODE_DATA.title} (42s Preview)`)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/20 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#8ce5ff] transition-colors hover:border-[#4F79FF]"
                >
                  <Film className="h-3 w-3" />
                  <span>42s Preview</span>
                </button>
              </div>
            </div>

            {/* Upcoming Episodes */}
            {UPCOMING_EPISODES.map((ep) => (
              <div
                key={ep.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm font-bold text-[#AEB4C2]">
                    {ep.episodeNumber}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-bold text-white/90">{ep.title}</h3>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ep.statusColor}`}
                      >
                        {ep.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#AEB4C2]">{ep.description}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-[#8ce5ff]/70">
                      {ep.ratio}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    Location: {ep.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Cinematic Modal Video Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <div className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#070A12] shadow-[0_0_80px_rgba(61,107,255,0.3)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3D6BFF] animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                  {videoTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={closePlayer}
                className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close Player"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video w-full bg-black">
              <video
                ref={videoRef}
                src={activeVideo}
                className="h-full w-full object-contain"
                autoPlay
                controls
                playsInline
                onLoadedMetadata={(e) => {
                  if (startTimestamp > 0) {
                    e.target.currentTime = startTimestamp;
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>

            {/* Modal Controls / Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-6 py-3 text-xs text-[#AEB4C2]">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  type="button"
                  onClick={restartVideo}
                  className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Restart</span>
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
                  <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-wider text-white/50">
                  Broadcast Spec: 1080p Full HD @ 24fps H.264 • 5:00 Master
                </span>
                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="rounded p-1 text-white hover:bg-white/10"
                  title="Fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

