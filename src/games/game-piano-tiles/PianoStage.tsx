import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Heart, Pause, Play, RotateCcw, SkipForward, Star } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import {
  buildSongChart,
  calculateHitPoints,
  calculateStars,
  DIFFICULTY_CONFIGS,
  findHittableTile,
  getTileNormalizedY,
} from './engine';
import { pianoSynth } from './pianoSynth';
import type { Difficulty, GameResults, GroupTheme, HitJudgment, SongDefinition, TileNote } from './types';

interface PianoStageProps {
  song: SongDefinition;
  difficulty: Difficulty;
  customAudioUrl?: string;
  hasNextSong: boolean;
  onFinish: (results: GameResults) => void;
  onBackToList: () => void;
  onNextSong: () => void;
}

const LANE_KEYS = ['d', 'f', 'j', 'k'];

const THEME_PALETTE: Record<
  GroupTheme,
  {
    tileGradient: string;
    tileGlow: string;
    hitLine: string;
    laneFlash: string;
    accentText: string;
  }
> = {
  huntrx: {
    tileGradient: 'from-amber-300 via-pink-500 to-cyan-400',
    tileGlow: 'shadow-[0_0_20px_rgba(34,211,238,0.55)]',
    hitLine: 'bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]',
    laneFlash: 'bg-cyan-400/25',
    accentText: 'text-amber-300',
  },
  saja: {
    tileGradient: 'from-fuchsia-500 via-rose-500 to-indigo-500',
    tileGlow: 'shadow-[0_0_20px_rgba(244,63,94,0.55)]',
    hitLine: 'bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.9)]',
    laneFlash: 'bg-fuchsia-500/25',
    accentText: 'text-rose-300',
  },
  pop: {
    tileGradient: 'from-pink-400 via-purple-500 to-teal-300',
    tileGlow: 'shadow-[0_0_20px_rgba(244,114,182,0.55)]',
    hitLine: 'bg-pink-300 shadow-[0_0_18px_rgba(244,114,182,0.9)]',
    laneFlash: 'bg-pink-400/25',
    accentText: 'text-pink-300',
  },
};

export function PianoStage({
  song,
  difficulty,
  customAudioUrl,
  hasNextSong,
  onFinish,
  onBackToList,
  onNextSong,
}: PianoStageProps) {
  const { playClick, playWin, playGameOver } = useSound();
  const config = DIFFICULTY_CONFIGS[difficulty];
  const palette = THEME_PALETTE[song.group];

  const [runId, setRunId] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [songTimeMs, setSongTimeMs] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hearts, setHearts] = useState(config.maxHearts);
  const [results, setResults] = useState<GameResults | null>(null);
  const [laneFlashes, setLaneFlashes] = useState<[boolean, boolean, boolean, boolean]>([
    false,
    false,
    false,
    false,
  ]);
  const [feedback, setFeedback] = useState<{
    id: number;
    judgment: HitJudgment;
    lane: number;
  } | null>(null);

  const tilesRef = useRef<TileNote[]>([]);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const perfectRef = useRef(0);
  const greatRef = useRef(0);
  const missRef = useRef(0);
  const heartsRef = useRef(config.maxHearts);
  const songTimeRef = useRef(0);
  const finishedRef = useRef(false);

  const totalDurationMs = useMemo(() => {
    const chart = buildSongChart(song, difficulty);
    const last = chart[chart.length - 1];
    return (last?.timeMs ?? 30_000) + 1200;
  }, [song, difficulty]);

  const finishGame = useCallback(
    (completed: boolean) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      pianoSynth.stopCustomAudio();

      const totalNotes = tilesRef.current.length;
      const hitCount = perfectRef.current + greatRef.current;
      const stars = completed ? calculateStars(hitCount, totalNotes) : 0;
      const accuracy = totalNotes > 0 ? Math.round((hitCount / totalNotes) * 100) : 0;

      const finalResults: GameResults = {
        completed,
        score: scoreRef.current,
        maxCombo: maxComboRef.current,
        perfectCount: perfectRef.current,
        greatCount: greatRef.current,
        missCount: missRef.current,
        totalNotes,
        stars,
        accuracy,
      };

      setResults(finalResults);
      onFinish(finalResults);

      if (completed) {
        playWin();
        try {
          confetti({
            particleCount: 95,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#FACC15', '#22D3EE', '#F43F5E', '#C026D3', '#34D399'],
          });
        } catch {
          // Ignore confetti errors
        }
      } else {
        playGameOver();
      }
    },
    [onFinish, playGameOver, playWin]
  );

  // Initialisation d'une nouvelle partie
  useEffect(() => {
    const chart = buildSongChart(song, difficulty);
    tilesRef.current = chart;
    scoreRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    perfectRef.current = 0;
    greatRef.current = 0;
    missRef.current = 0;
    heartsRef.current = config.maxHearts;
    songTimeRef.current = 0;
    finishedRef.current = false;

    setScore(0);
    setCombo(0);
    setHearts(config.maxHearts);
    setSongTimeMs(0);
    setResults(null);
    setIsPaused(false);
    setFeedback(null);

    pianoSynth.startCustomAudio(customAudioUrl, config.speedMultiplier);

    return () => {
      pianoSynth.stopCustomAudio();
    };
  }, [song, difficulty, config.maxHearts, config.speedMultiplier, customAudioUrl, runId]);

  // Boucle 60 FPS haute précision
  useEffect(() => {
    if (isPaused || results) return;

    let rafId = 0;
    let lastTimestamp = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(60, now - lastTimestamp);
      lastTimestamp = now;

      const nextTime = songTimeRef.current + dt;
      songTimeRef.current = nextTime;

      // Vérifie les tuiles qui ont dépassé la fenêtre de tolérance sans être touchées
      let missedThisFrame = 0;
      for (const tile of tilesRef.current) {
        if (tile.status === 'pending' && nextTime - tile.timeMs > config.greatWindowMs) {
          tile.status = 'missed';
          missedThisFrame++;
        }
      }

      if (missedThisFrame > 0) {
        missRef.current += missedThisFrame;
        comboRef.current = 0;
        heartsRef.current = Math.max(0, heartsRef.current - missedThisFrame);
        setCombo(0);
        setHearts(heartsRef.current);
        setFeedback({ id: Date.now(), judgment: 'miss', lane: 1 });
        pianoSynth.playMiss();

        if (heartsRef.current <= 0) {
          setSongTimeMs(nextTime);
          finishGame(false);
          return;
        }
      }

      setSongTimeMs(nextTime);

      if (nextTime >= totalDurationMs) {
        finishGame(true);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [config.greatWindowMs, finishGame, isPaused, results, totalDurationMs]);

  const flashLane = useCallback((lane: 0 | 1 | 2 | 3) => {
    setLaneFlashes((prev) => {
      const next = [...prev] as [boolean, boolean, boolean, boolean];
      next[lane] = true;
      return next;
    });
    setTimeout(() => {
      setLaneFlashes((prev) => {
        const next = [...prev] as [boolean, boolean, boolean, boolean];
        next[lane] = false;
        return next;
      });
    }, 130);
  }, []);

  const handleLaneTap = useCallback(
    (lane: 0 | 1 | 2 | 3) => {
      if (isPaused || finishedRef.current) return;
      flashLane(lane);

      const hit = findHittableTile(tilesRef.current, lane, songTimeRef.current, difficulty);
      if (hit) {
        hit.tile.status = 'hit';
        const nextCombo = comboRef.current + 1;
        comboRef.current = nextCombo;
        if (nextCombo > maxComboRef.current) {
          maxComboRef.current = nextCombo;
        }
        if (hit.judgment === 'perfect') {
          perfectRef.current += 1;
        } else {
          greatRef.current += 1;
        }

        const gained = calculateHitPoints(hit.judgment, nextCombo);
        scoreRef.current += gained;
        setScore(scoreRef.current);
        setCombo(nextCombo);
        setFeedback({ id: Date.now() + lane, judgment: hit.judgment, lane });

        // Joue la note au piano synthé (en plus du MP3 éventuel)
        pianoSynth.playNote(hit.tile.midi, hit.tile.bassMidi);
      } else {
        // Tap sur une colonne vide : pénalité douce (perte de combo + 1 cœur en Normal/Difficile)
        comboRef.current = 0;
        setCombo(0);
        setFeedback({ id: Date.now() + lane, judgment: 'miss', lane });
        pianoSynth.playMiss();

        if (difficulty !== 'easy') {
          heartsRef.current = Math.max(0, heartsRef.current - 1);
          setHearts(heartsRef.current);
          if (heartsRef.current <= 0) {
            finishGame(false);
          }
        }
      }
    },
    [difficulty, finishGame, flashLane, isPaused]
  );

  // Support clavier (D, F, J, K ou flèches)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'Escape') {
        setIsPaused((p) => {
          const next = !p;
          if (next) pianoSynth.pauseCustomAudio();
          else pianoSynth.resumeCustomAudio();
          return next;
        });
        return;
      }

      const key = e.key.toLowerCase();
      const laneIdx = LANE_KEYS.indexOf(key);
      if (laneIdx !== -1) {
        e.preventDefault();
        handleLaneTap(laneIdx as 0 | 1 | 2 | 3);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleLaneTap]);

  const togglePause = () => {
    playClick();
    setIsPaused((prev) => {
      const next = !prev;
      if (next) pianoSynth.pauseCustomAudio();
      else pianoSynth.resumeCustomAudio();
      return next;
    });
  };

  const handleRestart = () => {
    playClick();
    setRunId((id) => id + 1);
  };

  // Tuiles visibles à l'écran (fenêtre d'affichage optimisée)
  const visibleTiles = tilesRef.current.filter((tile) => {
    if (tile.status === 'hit') return false;
    const y = getTileNormalizedY(tile.timeMs, songTimeMs, config.approachTimeMs);
    return y >= -0.25 && y <= 1.25;
  });

  const progressPercent = Math.min(100, Math.max(0, (songTimeMs / totalDurationMs) * 100));

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-2.5">
      {/* Barre supérieure du concert */}
      <div className="flex w-full items-center justify-between gap-2 rounded-2xl bg-[#160B33] px-3 py-2 text-white border border-fuchsia-500/30 shadow-lg">
        <button
          type="button"
          onClick={() => {
            playClick();
            pianoSynth.stopCustomAudio();
            onBackToList();
          }}
          aria-label="Retour aux chansons"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="font-display text-base font-bold truncate leading-tight">
            {song.icon} {song.title}
          </p>
          <p className="text-[11px] font-bold text-purple-200/75 truncate">
            {song.artist} · {config.label}
          </p>
        </div>

        <button
          type="button"
          onClick={togglePause}
          aria-label={isPaused ? 'Reprendre' : 'Pause'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition"
        >
          {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </button>
      </div>

      {/* HUD : Cœurs + Score + Combo + Barre de progression */}
      <div className="flex w-full flex-col gap-1.5 rounded-2xl bg-[#160B33]/95 px-3.5 py-2.5 text-white border border-white/10">
        <div className="flex items-center justify-between gap-2">
          {/* Cœurs */}
          <div className="flex items-center gap-1" aria-label={`${hearts} cœurs restants`}>
            {Array.from({ length: config.maxHearts }).map((_, idx) => (
              <Heart
                key={idx}
                className={`h-5 w-5 transition-transform ${
                  idx < hearts
                    ? 'fill-rose-500 text-rose-400 scale-100'
                    : 'text-white/15 scale-90'
                }`}
              />
            ))}
          </div>

          {/* Score */}
          <div className="flex items-baseline gap-2">
            {combo >= 3 && (
              <span className={`font-display text-sm font-bold ${palette.accentText}`}>
                {combo}x COMBO 🔥
              </span>
            )}
            <span className="font-display text-2xl font-bold text-white tabular-nums">
              {score}
            </span>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 transition-[width] duration-100"
          />
        </div>
      </div>

      {/* Piste de Piano Tiles (4 colonnes tactiles) */}
      <div
        style={{ touchAction: 'none' }}
        className="relative h-[min(68dvh,580px)] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-[#0C061D] via-[#170A35] to-[#230E4A] border-4 border-fuchsia-500/40 shadow-2xl select-none"
      >
        {/* 4 colonnes interactives */}
        <div className="grid h-full w-full grid-cols-4">
          {([0, 1, 2, 3] as const).map((lane) => (
            <div
              key={lane}
              onPointerDown={(e) => {
                e.preventDefault();
                handleLaneTap(lane);
              }}
              className={`relative h-full border-r border-white/10 last:border-r-0 transition-colors duration-75 cursor-pointer ${
                laneFlashes[lane] ? palette.laneFlash : 'bg-transparent'
              }`}
            >
              {/* Repère touche clavier discret en bas */}
              <div className="pointer-events-none absolute bottom-2 inset-x-0 flex justify-center">
                <span className="rounded-lg bg-white/8 px-2 py-0.5 text-[10px] font-bold uppercase text-white/35">
                  {LANE_KEYS[lane]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Zone / Ligne de frappe lumineuse (à 84% de la hauteur) */}
        <div
          style={{ top: '84%' }}
          className="pointer-events-none absolute inset-x-0 -translate-y-1/2"
        >
          <div className={`h-1.5 w-full ${palette.hitLine}`} />
          <div className="h-14 w-full bg-gradient-to-b from-white/10 to-transparent" />
        </div>

        {/* Tuiles qui tombent */}
        <div className="pointer-events-none absolute inset-0">
          {visibleTiles.map((tile) => {
            const normY = getTileNormalizedY(tile.timeMs, songTimeMs, config.approachTimeMs);
            // La ligne de frappe est à 84% de la hauteur
            const topPercent = normY * 84;
            const isMissed = tile.status === 'missed';

            return (
              <div
                key={tile.id}
                style={{
                  left: `${tile.lane * 25}%`,
                  width: '25%',
                  top: `${topPercent}%`,
                  transform: 'translateY(-100%)',
                }}
                className="absolute px-1.5 sm:px-2"
              >
                <div
                  className={`flex h-24 sm:h-28 w-full flex-col items-center justify-end rounded-2xl pb-2.5 border-2 transition-opacity ${
                    isMissed
                      ? 'bg-rose-950/80 border-rose-500/60 opacity-45'
                      : `bg-gradient-to-b ${palette.tileGradient} border-white/50 ${palette.tileGlow}`
                  }`}
                >
                  <span className="h-1.5 w-8 rounded-full bg-white/75" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback flottant PARFAIT / SUPER / RATÉ */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1.05, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none absolute top-[68%] inset-x-0 flex justify-center"
            >
              <span
                className={`rounded-full px-4 py-1 font-display text-lg font-bold shadow-lg ${
                  feedback.judgment === 'perfect'
                    ? 'bg-amber-400 text-slate-950'
                    : feedback.judgment === 'great'
                    ? 'bg-cyan-400 text-slate-950'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {feedback.judgment === 'perfect'
                  ? 'PARFAIT ! ✨'
                  : feedback.judgment === 'great'
                  ? 'SUPER ! ⚡'
                  : 'OUPS !'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay Pause */}
        <AnimatePresence>
          {isPaused && !results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-[#0C061D]/80 backdrop-blur-sm p-4"
            >
              <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl bg-[#1D0E42] p-6 text-center text-white border-2 border-fuchsia-400/40 shadow-2xl">
                <h3 className="font-display text-2xl font-bold">Pause ⏸️</h3>
                <p className="text-xs font-semibold text-purple-200/80">{song.title}</p>
                <button
                  type="button"
                  onClick={togglePause}
                  className="mt-2 h-12 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 font-display text-lg font-bold text-slate-950 active:scale-95 transition"
                >
                  Reprendre
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="h-12 w-full rounded-2xl bg-white/10 font-display text-base font-bold text-white hover:bg-white/20 active:scale-95 transition"
                >
                  Recommencer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    onBackToList();
                  }}
                  className="h-11 w-full rounded-2xl text-sm font-bold text-purple-200 hover:text-white transition"
                >
                  Changer de chanson
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay Fin de chanson / Résultats */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-[#0C061D]/85 backdrop-blur-sm p-4"
            >
              <div className="flex w-full max-w-xs flex-col items-center rounded-3xl bg-[#1D0E42] p-6 text-center text-white border-2 border-amber-300/50 shadow-2xl">
                <h3 className="font-display text-2xl font-bold text-white">
                  {results.completed ? 'Concert Réussi ! 🎉' : 'Bien essayé ! 🌟'}
                </h3>
                <p className="mt-0.5 text-xs font-bold text-purple-200/80">
                  {song.title} — {song.artist}
                </p>

                {/* Étoiles */}
                <div className="my-4 flex items-center gap-2">
                  {[1, 2, 3].map((n) => (
                    <Star
                      key={n}
                      className={`h-10 w-10 transition-transform ${
                        n <= results.stars
                          ? 'fill-amber-400 text-amber-300 scale-110 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]'
                          : 'text-white/15'
                      }`}
                    />
                  ))}
                </div>

                {/* Stats */}
                <div className="grid w-full grid-cols-3 gap-2 rounded-2xl bg-white/8 p-3 text-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-purple-200/70">Score</p>
                    <p className="font-display text-lg font-bold text-amber-300">{results.score}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-purple-200/70">Précision</p>
                    <p className="font-display text-lg font-bold text-cyan-300">{results.accuracy}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-purple-200/70">Combo</p>
                    <p className="font-display text-lg font-bold text-pink-300">{results.maxCombo}x</p>
                  </div>
                </div>

                {/* Boutons */}
                <div className="mt-5 flex w-full flex-col gap-2">
                  {hasNextSong && results.completed && (
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        onNextSong();
                      }}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 font-display text-base font-bold text-slate-950 shadow-lg active:scale-95 transition"
                    >
                      <SkipForward className="h-5 w-5" />
                      Chanson suivante
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleRestart}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/15 font-display text-base font-bold text-white hover:bg-white/25 active:scale-95 transition"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Rejouer
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      onBackToList();
                    }}
                    className="h-10 w-full rounded-xl text-sm font-bold text-purple-200 hover:text-white transition"
                  >
                    Liste des chansons
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
