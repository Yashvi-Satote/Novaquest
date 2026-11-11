import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Building2, ChevronRight, Film } from 'lucide-react';
import AppNavbar from '../../Shared/components/layout/AppNavbar';
import CinematicMoonHero3D from '../components/home/CinematicMoonHero3D';
import SettingsModal from '../components/home/SettingsModal';
import NasaHeadquartersModal from '../nasa-headquarters/NasaHeadquartersModal';
import { gameAudio } from '../config/gameAudio';
import { hasSaveGame, getSaveGame } from '../game/saveManager';
import { ALL_MISSIONS } from '../config/missions';

/**
 * TimeTravelersHomePage.jsx
 *
 * Cinematic, editorial landing screen for NovaQuest.
 *
 * The layout is new, but every existing control is preserved: the four game
 * actions, the active-mission shortcut, saved-progress detection, the optional
 * settings modal, the interactive mascot and the shared navbar.
 */

function AnimatedWord({ text, delay = 0 }) {
  return (
    <span aria-hidden="true">
      {text.split('').map((character, index) => (
        <span
          key={`${character}-${index}`}
          className="cinematic-letter"
          style={{ animationDelay: `${delay + index * 0.03}s` }}
        >
          {character === ' ' ? '\u00A0' : character}
        </span>
      ))}
    </span>
  );
}

export default function TimeTravelersHomePage() {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHqOpen, setIsHqOpen] = useState(false);
  const [saveExists, setSaveExists] = useState(false);
  const [saveInfo, setSaveInfo] = useState(null);

  useEffect(() => {
    const exists = hasSaveGame();
    setSaveExists(exists);
    if (exists) {
      setSaveInfo(getSaveGame());
    }
  }, []);

  const handlePlayGame = () => {
    gameAudio.playClick();
    navigate('/play');
  };

  const handleContinue = () => {
    gameAudio.playClick();
    navigate('/play');
  };

  const handleMissions = () => {
    gameAudio.playClick();
    navigate('/missions');
  };

  const handleOpenSettings = () => {
    gameAudio.playClick();
    setIsSettingsOpen(true);
  };

  const handleOpenHeadquarters = () => {
    gameAudio.playClick();
    setIsHqOpen(true);
  };

  const totalLevels = String(ALL_MISSIONS.length).padStart(2, '0');

  return (
    <div className="relative min-h-screen w-full select-none overflow-hidden bg-[#070A12] text-white">
      <AppNavbar />

      {/* Giant spinning Moon. Dimmed on phones so it becomes a backdrop. */}
      <CinematicMoonHero3D className="z-0 opacity-[0.55] md:opacity-100" />

      {/* Fixed shading: the Moon emerges from darkness on the left. */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(90deg, #070A12 0%, rgba(7,10,18,0.99) 19%, rgba(7,10,18,0.93) 34%, rgba(7,10,18,0.6) 49%, rgba(7,10,18,0.18) 62%, rgba(7,10,18,0) 72%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(7,10,18,0.55) 0%, rgba(7,10,18,0) 20%, rgba(7,10,18,0) 76%, rgba(7,10,18,0.88) 100%)',
        }}
      />
      {/* Extra mobile scrim keeps the copy readable over the dimmed backdrop. */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[#070A12]/30 md:hidden" />

      {/* Faint vertical hairlines behind the content. */}
      <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden="true">
        <span className="absolute left-[19%] top-0 h-full w-px bg-white/[0.06]" />
        <span className="absolute left-[51%] top-0 h-full w-px bg-white/[0.06]" />
        <span className="absolute left-[74%] top-0 h-full w-px bg-white/[0.06]" />
      </div>

      {/* Sparse horizontal haze bands in deep space, right of the limb. */}
      <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden="true">
        <span className="absolute right-0 top-[24%] h-px w-[34%] bg-gradient-to-r from-transparent via-white/[0.09] to-transparent blur-[1px]" />
        <span className="absolute right-0 top-[45%] h-px w-[26%] bg-gradient-to-r from-transparent via-[#9db8ea]/[0.08] to-transparent blur-[2px]" />
        <span className="absolute right-0 top-[68%] h-px w-[38%] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent blur-[1px]" />
      </div>

      <main className="relative z-10 flex min-h-[calc(100dvh-7rem)] w-full flex-col px-[7%] pb-10 pt-6 sm:pb-16 sm:pt-8 lg:min-h-[calc(100dvh-5.75rem)]">
        <div className="flex flex-1 flex-col justify-center">
          {/* Tagline + decorative pager (real level count from mission data). */}
          <div className="flex w-full items-start justify-between gap-6">
            <p className="cinematic-ui cinematic-rise text-[9px] font-semibold uppercase tracking-[0.3em] text-[#AEB4C2] sm:text-[10px]">
              NOVAQUEST GAMES <span className="text-[#4F79FF]">•</span> EPISODE 1
            </p>
            <div
              className="cinematic-ui cinematic-rise hidden items-center gap-3 text-[10px] font-semibold tracking-[0.3em] text-white lg:flex"
              style={{ animationDelay: '0.5s' }}
              aria-hidden="true"
            >
              <span className="text-[#4F79FF]">01</span>
              <span className="h-px w-8 bg-white/70" />
              <span>{totalLevels}</span>
            </div>
          </div>

          {/* Giant editorial headline. */}
          <h1
            className="cinematic-display mt-7 text-[46px] leading-[1.02] tracking-[0.2em] text-white sm:text-[52px] sm:tracking-[0.22em] md:text-[68px] md:tracking-[0.26em] lg:text-[96px] lg:tracking-[0.34em] xl:text-[104px] xl:tracking-[0.38em]"
            aria-label="Level 1: The Moon"
          >
            <span className="block">
              <AnimatedWord text="LEVEL 1:" delay={0.12} />
            </span>
            <span className="relative block">
              <AnimatedWord text="THE MOON" delay={0.32} />
              <sup
                className="cinematic-rise ml-2 inline-block align-super text-[9px] font-semibold tracking-[0.28em] text-[#4F79FF] sm:text-[10px]"
                style={{ animationDelay: '0.9s' }}
              >
                NEW
              </sup>
            </span>
          </h1>

          <p className="cinematic-ui mt-6 max-w-[520px] text-[12px] leading-[1.8] text-[#AEB4C2] sm:text-[13px]">
            Blast off to 1967, solve mission emergencies with NASA scientists, and uncover the
            secret history of lunar exploration!
          </p>

          {/* Level 1 active mission strip — same handler as the old card. */}
          <button
            type="button"
            onClick={handleMissions}
            className="group mt-8 flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6BFF] focus-visible:ring-offset-4 focus-visible:ring-offset-[#070A12]"
            aria-label="Open Level 1 active mission: Surveyor 5, the Moon Mission, 1967"
          >
            <span className="cinematic-line h-px w-10 shrink-0 bg-[#3D6BFF]" />
            <span className="cinematic-ui text-[9px] font-semibold uppercase tracking-[0.28em] text-[#4F79FF]">
              LEVEL 1 ACTIVE MISSION
            </span>
            <span className="cinematic-ui text-[9px] font-semibold uppercase tracking-[0.16em] text-white transition-colors group-hover:text-[#4F79FF] sm:text-[10px]">
              SURVEYOR 5 — THE MOON MISSION (1967)
            </span>
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 text-[#4F79FF] transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>

          {/* 3D location shortcut — opens the interactive NASA HQ base. */}
          <button
            id="nasa-hq-btn"
            type="button"
            onClick={handleOpenHeadquarters}
            className="cinematic-rise group mt-5 flex w-full max-w-[430px] items-center gap-3 border border-white/15 bg-white/[0.035] px-3.5 py-3 text-left backdrop-blur-sm transition-colors hover:border-[#4F79FF]/60 hover:bg-[#3D6BFF]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6BFF] focus-visible:ring-offset-4 focus-visible:ring-offset-[#070A12] sm:px-4"
            style={{ animationDelay: '0.34s' }}
            aria-label="Explore NASA Headquarters in 3D"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#4F79FF]/45 bg-[#3D6BFF]/10 text-[#8ce5ff]">
              <Building2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[8px] font-semibold uppercase tracking-[0.3em] text-[#7f9fbe]">
                Explore the 3D base
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors group-hover:text-[#8ce5ff] sm:text-[11px]">
                NASA HEADQUARTERS
              </span>
            </span>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-[#4F79FF] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>

          {/* Dedicated MEMOIR Module Card */}
          <div
            id="memoir-module-card"
            className="cinematic-rise group mt-5 w-full max-w-[500px] overflow-hidden rounded-xl border border-[#4F79FF]/35 bg-gradient-to-br from-[#0c1329]/95 via-[#070b14]/90 to-[#101b3b]/80 p-4 sm:p-5 backdrop-blur-md shadow-[0_4px_30px_rgba(61,107,255,0.18)] transition-all duration-300 hover:border-[#4F79FF] hover:shadow-[0_4px_40px_rgba(61,107,255,0.35)]"
            style={{ animationDelay: '0.45s' }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black sm:w-36">
                <img
                  src="/assets/memoir/scene1_surveyor3_anime_establishing.jpg"
                  alt="Memoir Preview - Surveyor 3"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-1.5 left-2 rounded bg-[#3D6BFF]/90 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                  EPISODE 01
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Film className="h-3 w-3 text-[#4F79FF]" />
                  <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#8ce5ff]">
                    Cinematic Series
                  </span>
                </div>

                <h2 className="cinematic-display text-lg font-bold tracking-[0.2em] text-white sm:text-xl">
                  MEMOIR
                </h2>

                <p className="text-[11px] font-semibold italic tracking-[0.08em] text-[#8ce5ff]">
                  Every machine has a story.
                </p>

                <p className="text-[11px] leading-relaxed text-[#AEB4C2]">
                  Explore the forgotten stories of machines left behind on the Moon and Mars through
                  cinematic animated storytelling.
                </p>

                <div className="pt-1.5">
                  <button
                    id="enter-memoir-btn"
                    type="button"
                    onClick={() => {
                      gameAudio.playClick();
                      navigate('/memoir');
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#3D6BFF] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white shadow-md shadow-[#3D6BFF]/30 transition-all hover:bg-[#4F79FF] hover:shadow-[0_0_20px_rgba(61,107,255,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6BFF]"
                  >
                    <span>ENTER MEMOIR</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Primary controls + right-side secondary links. */}
          <div
            className="cinematic-rise mt-9 flex w-full flex-col gap-7 sm:flex-row sm:items-center sm:justify-between"
            style={{ animationDelay: '0.55s', animationDuration: '0.6s' }}
          >
            <div className="flex w-full flex-col items-stretch gap-5 sm:w-auto sm:flex-row sm:items-center">
              <button
                id="play-game-btn"
                type="button"
                onClick={handlePlayGame}
                className="cinematic-ui h-[46px] w-full border border-[#3D6BFF] bg-transparent px-7 text-[10px] font-semibold uppercase tracking-[0.3em] text-white transition-all duration-300 hover:bg-[#3D6BFF]/10 hover:shadow-[0_0_30px_rgba(61,107,255,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12] sm:w-[230px]"
              >
                START GAME
              </button>

              <span
                className="cinematic-display hidden text-xl leading-none text-[#4F79FF] sm:inline"
                aria-hidden="true"
              >
                &amp;
              </span>

              <button
                id="continue-game-btn"
                type="button"
                disabled={!saveExists}
                onClick={handleContinue}
                className={`cinematic-ui group relative w-full pb-2 text-left text-[10px] font-semibold uppercase tracking-[0.3em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12] sm:w-auto ${
                  saveExists
                    ? 'cursor-pointer text-white hover:text-[#4F79FF]'
                    : 'cursor-not-allowed text-white/35'
                }`}
              >
                CONTINUE <span className={saveExists ? 'text-[#4F79FF]' : 'text-[#4F79FF]/45'}>GAME</span>
                <span
                  className={`absolute bottom-0 left-0 h-px bg-[#3D6BFF] transition-all duration-300 ${
                    saveExists ? 'w-8 group-hover:w-full' : 'w-0'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="flex items-center gap-7 sm:justify-end">
              <button
                id="missions-btn"
                type="button"
                onClick={handleMissions}
                className="cinematic-ui text-[9px] font-semibold uppercase tracking-[0.28em] text-white underline decoration-white/30 underline-offset-[7px] transition-colors hover:text-[#4F79FF] hover:decoration-[#3D6BFF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6BFF] focus-visible:ring-offset-4 focus-visible:ring-offset-[#070A12]"
              >
                MISSIONS
              </button>
              <button
                id="settings-btn"
                type="button"
                onClick={handleOpenSettings}
                aria-label="Settings"
                className="cinematic-ui text-[9px] font-semibold uppercase tracking-[0.28em] text-white underline decoration-white/30 underline-offset-[7px] transition-colors hover:text-[#4F79FF] hover:decoration-[#3D6BFF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6BFF] focus-visible:ring-offset-4 focus-visible:ring-offset-[#070A12]"
              >
                SETTINGS
              </button>
            </div>
          </div>
        </div>

        {/* Bottom information bar — pinned on desktop, stacked on mobile. */}
        <div className="relative mt-12 border-t border-white/[0.06] pt-5 lg:absolute lg:inset-x-[7%] lg:bottom-[6%] lg:mt-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[30%_29%_1fr_auto] lg:items-center">
            <div className="flex items-center gap-4">
              <span className="cinematic-line h-px w-10 shrink-0 bg-[#3D6BFF]" aria-hidden="true" />
              <span className="cinematic-ui text-[9px] font-semibold uppercase tracking-[0.28em] text-white">
                5-MINUTE MISSION
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="cinematic-line h-px w-10 shrink-0 bg-[#3D6BFF]" aria-hidden="true" />
              <span className="cinematic-ui text-[9px] font-semibold uppercase tracking-[0.28em] text-white">
                EARN LUNAR PIONEER BADGE
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="cinematic-line h-px w-10 shrink-0 bg-[#3D6BFF]" aria-hidden="true" />
              <span className="cinematic-ui text-[9px] font-semibold uppercase tracking-[0.28em] text-white">
                AUTHENTIC NASA 1967 HISTORY
              </span>
            </div>
            <button
              type="button"
              onClick={handleMissions}
              className="cinematic-ui justify-self-start text-[9px] font-semibold uppercase tracking-[0.28em] text-white underline decoration-white/40 underline-offset-[7px] transition-colors hover:text-[#4F79FF] hover:decoration-[#3D6BFF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6BFF] focus-visible:ring-offset-4 focus-visible:ring-offset-[#070A12] lg:justify-self-end"
            >
              SEE ALL MISSIONS
            </button>
          </div>
        </div>
      </main>

      {/* Floating astronaut companion — same click interaction, new position. */}
      <div
        onClick={() => {
          gameAudio.playSuccess();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            gameAudio.playSuccess();
          }
        }}
        role="button"
        tabIndex={0}
        className="group fixed bottom-[9%] right-[4%] z-30 hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D6BFF] focus-visible:ring-offset-4 focus-visible:ring-offset-[#070A12] md:block lg:bottom-[10%] lg:right-[6%]"
        title="Hi, Explorer! Ready to travel back to 1967?"
        aria-label="NOVA Space Guide. Activate to hear a greeting."
      >
        <div className="relative">
          <div className="h-20 w-16 drop-shadow-[0_0_22px_rgba(61,107,255,0.35)] transition-transform duration-300 group-hover:scale-110">
            <img
              src="/images/nova_alien_companion.png"
              alt="NOVA Space Guide"
              className="h-full w-full animate-bounce object-contain"
              style={{ animationDuration: '3.5s' }}
            />
          </div>
          <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-48 rounded-2xl border border-[#3D6BFF]/40 bg-[#070A12]/95 p-2 text-left text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus:opacity-100">
            <span className="font-bold text-[#4F79FF]">NOVA: </span>
            Welcome to NovaQuest! Click Start Game to begin Level 1.
          </div>
        </div>
      </div>

      <NasaHeadquartersModal isOpen={isHqOpen} onClose={() => setIsHqOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
