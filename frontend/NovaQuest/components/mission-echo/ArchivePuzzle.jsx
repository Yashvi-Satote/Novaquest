import React, { useEffect, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Image,
  Lock,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { audio } from '../../game/audioManager';

const ARCHIVE_FRAMES = [
  {
    id: 'frame-042',
    title: 'Frame 042',
    subtitle: 'Descent approach',
    description: 'Recovered from the television mast during the final approach.',
    src: '/images/surveyor1_moon_earth.jpg',
    thumbnailPosition: 'center 35%',
    filter: 'saturate(0.9) contrast(1.06)'
  },
  {
    id: 'frame-118',
    title: 'Frame 118',
    subtitle: 'Footpad contact',
    description: 'A surface frame recorded after the first three-point contact.',
    src: '/images/surveyor1_moon_earth.jpg',
    thumbnailPosition: '24% 70%',
    filter: 'sepia(0.26) saturate(1.05)'
  },
  {
    id: 'frame-203',
    title: 'Frame 203',
    subtitle: 'Horizon survey',
    description: 'A later sweep of the local terrain and crater rim.',
    src: '/images/surveyor1_moon_earth.jpg',
    thumbnailPosition: '78% 52%',
    filter: 'grayscale(0.42) contrast(1.12)'
  }
];

function createScrambledTiles() {
  let tiles = [];

  do {
    tiles = Array.from({ length: 9 }, (_, index) => index);
    for (let i = tiles.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (
    tiles.every((tile, index) => tile === index) ||
    tiles.filter((tile, index) => tile === index).length > 2
  );

  return tiles;
}

function frameBackground(frame, tile) {
  const column = tile % 3;
  const row = Math.floor(tile / 3);
  return {
    backgroundImage: `url('${frame.src}')`,
    backgroundSize: '300% 300%',
    backgroundPosition: `${column * 50}% ${row * 50}%`,
    filter: frame.filter
  };
}

export default function ArchivePuzzle({ onRestore }) {
  const [selectedFrameId, setSelectedFrameId] = useState(ARCHIVE_FRAMES[0].id);
  const [tiles, setTiles] = useState(createScrambledTiles);
  const [selectedTile, setSelectedTile] = useState(null);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const selectedFrame =
    ARCHIVE_FRAMES.find((frame) => frame.id === selectedFrameId) || ARCHIVE_FRAMES[0];
  const correctPositions = tiles.filter((tile, index) => tile === index).length;
  const integrity = Math.round((correctPositions / 9) * 100);

  useEffect(() => {
    setTiles(createScrambledTiles());
    setSelectedTile(null);
    setMoves(0);
    setSolved(false);
    setFeedback(null);
  }, [selectedFrameId]);

  const handleSelectFrame = (frameId) => {
    if (frameId === selectedFrameId) return;
    audio.playClick();
    setSelectedFrameId(frameId);
  };

  const handleTileClick = (boardIndex) => {
    if (solved) return;

    if (selectedTile === null) {
      audio.playClick();
      setSelectedTile(boardIndex);
      setFeedback(null);
      return;
    }

    if (selectedTile === boardIndex) {
      audio.playClick();
      setSelectedTile(null);
      return;
    }

    const nextTiles = [...tiles];
    [nextTiles[selectedTile], nextTiles[boardIndex]] = [nextTiles[boardIndex], nextTiles[selectedTile]];
    const nextSolved = nextTiles.every((tile, index) => tile === index);

    audio.playHover();
    setTiles(nextTiles);
    setSelectedTile(null);
    setMoves((count) => count + 1);

    if (nextSolved) {
      setSolved(true);
      setFeedback({
        type: 'success',
        text: 'Fragment alignment complete. The image record is stable enough to confirm.'
      });
      audio.playStartGame();
    }
  };

  const handleReshuffle = () => {
    audio.playClick();
    setTiles(createScrambledTiles());
    setSelectedTile(null);
    setMoves(0);
    setSolved(false);
    setFeedback(null);
  };

  const handleConfirm = () => {
    if (!solved) return;
    audio.playStartGame();
    if (onRestore) onRestore(selectedFrame);
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="rounded-2xl border border-cyan-500/20 bg-[#050b16]/85 p-4 shadow-2xl shadow-cyan-950/30 sm:p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">
          Puzzle C // Archive recovery
        </div>
        <h2 className="mt-1 text-xl font-bold text-white">Select a damaged image</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Three archive records were fragmented by the interface. Choose one record and rebuild its
          image, then confirm the recovery.
        </p>

        <div className="mt-4 space-y-2">
          {ARCHIVE_FRAMES.map((frame) => {
            const isSelected = selectedFrameId === frame.id;
            return (
              <button
                key={frame.id}
                type="button"
                onClick={() => handleSelectFrame(frame.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all ${
                  isSelected
                    ? 'border-cyan-400/60 bg-cyan-500/10 shadow-lg shadow-cyan-950/20'
                    : 'border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">
                  <div
                    className="absolute inset-0 bg-cover"
                    style={{
                      backgroundImage: `url('${frame.src}')`,
                      backgroundPosition: frame.thumbnailPosition,
                      filter: frame.filter
                    }}
                  />
                  <div className="me-scanlines absolute inset-0 opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-1 left-1 font-mono text-[8px] uppercase tracking-widest text-slate-200">
                    {frame.title}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-300">
                    <Image className="h-3 w-3" />
                    {frame.subtitle}
                  </div>
                  <div className="mt-0.5 truncate text-xs font-medium text-slate-200">{frame.description}</div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-slate-500">
                    {isSelected ? 'Active record' : 'Damaged record'}
                  </div>
                </div>

                {isSelected ? (
                  <ScanLine className="h-4 w-4 shrink-0 animate-pulse text-cyan-300" />
                ) : (
                  <Lock className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-widest">
            <span className="text-slate-500">Archive integrity</span>
            <span className={solved ? 'text-emerald-300' : 'text-cyan-300'}>{integrity}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                solved
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-300'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${integrity}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[9px] text-slate-500">
            <span>{moves} fragment swaps</span>
            <span>{solved ? 'RECONSTRUCTION COMPLETE' : 'FRAGMENT ORDER UNSTABLE'}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-[#050b16]/85 p-4 shadow-2xl shadow-cyan-950/30 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">
              {selectedFrame.title} // {selectedFrame.subtitle}
            </div>
            <h2 className="mt-1 text-xl font-bold text-white">
              {solved ? 'Image reconstructed' : 'Reassemble the fragments'}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {solved
                ? 'The archive record is whole. Confirm the recovery to write it back to the mission log.'
                : 'Select any two fragments to swap their positions. Rebuild the image from the broken record.'}
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-slate-400">
            3 × 3 grid
          </span>
        </div>

        <div
          className={`relative mx-auto mt-5 max-w-[360px] overflow-hidden rounded-2xl border p-1 transition-all ${
            solved ? 'border-emerald-400/50 shadow-[0_0_36px_rgba(52,211,153,0.18)]' : 'border-cyan-500/25'
          }`}
        >
          <div
            className="grid aspect-square w-full grid-cols-3"
            style={{ gap: solved ? 0 : 4 }}
          >
            {tiles.map((tile, boardIndex) => {
              const isSelected = selectedTile === boardIndex;
              return (
                <button
                  key={boardIndex}
                  type="button"
                  onClick={() => handleTileClick(boardIndex)}
                  disabled={solved}
                  aria-label={`Image fragment ${boardIndex + 1}`}
                  aria-pressed={isSelected}
                  className={`group relative overflow-hidden bg-slate-900 transition-all duration-200 focus:outline-none ${
                    isSelected
                      ? 'z-10 scale-[0.94] ring-2 ring-cyan-300 ring-offset-1 ring-offset-[#050b16]'
                      : 'hover:z-10 hover:scale-[0.97] hover:ring-1 hover:ring-cyan-400/60'
                  }`}
                  style={frameBackground(selectedFrame, tile)}
                >
                  {!solved && (
                    <>
                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1 font-mono text-[8px] text-white/70">
                        {String(tile + 1).padStart(2, '0')}
                      </span>
                      <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0px,transparent_12px,rgba(34,211,238,0.08)_13px,transparent_14px)] opacity-0 transition-opacity group-hover:opacity-100" />
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {!solved && (
            <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/5">
              <div className="me-scanlines absolute inset-0 opacity-30" />
            </div>
          )}

          {solved && (
            <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent p-4">
              <div className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/85 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-200 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" />
                Image record stable
              </div>
            </div>
          )}
          {solved && <div className="pointer-events-none absolute inset-x-0 top-0 h-16 animate-scan-sweep bg-gradient-to-b from-cyan-300/25 to-transparent" />}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[10px]">
          <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-slate-400">
            <span className="text-slate-600">FRAME</span>
            <div className="mt-0.5 text-slate-200">{selectedFrame.title}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-slate-400">
            <span className="text-slate-600">STATUS</span>
            <div className={`mt-0.5 ${solved ? 'text-emerald-300' : 'text-amber-300'}`}>
              {solved ? 'Recovered' : 'Corrupted'}
            </div>
          </div>
        </div>

        {feedback && (
          <div
            role="status"
            className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-[11px] leading-relaxed ${
              feedback.type === 'success'
                ? 'border-emerald-500/35 bg-emerald-950/30 text-emerald-200'
                : 'border-cyan-500/25 bg-cyan-950/20 text-cyan-200'
            }`}
          >
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {selectedTile !== null && !solved && (
          <p className="mt-3 text-[11px] text-cyan-300">
            Fragment {selectedTile + 1} selected. Choose another fragment to swap it with.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!solved}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              solved
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-700/30 hover:scale-[1.01]'
                : 'cursor-not-allowed border border-white/10 bg-white/[0.03] text-slate-600'
            }`}
          >
            {solved ? <CheckCircle2 className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            {solved ? 'Confirm recovered archive' : 'Reconstruction incomplete'}
          </button>

          <button
            type="button"
            onClick={handleReshuffle}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reshuffle
          </button>
        </div>

        <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
          Prototype recovery: a simple fragment swap. The damaged record is fictionalised for the
          reconstruction interface.
        </p>
      </div>
    </section>
  );
}
