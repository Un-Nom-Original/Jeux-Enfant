import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Settings, Trophy, Undo2 } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { Board } from './Board';
import { continueAfterWin, createInitialState, move, undo } from './engine';
import { SettingsModal } from './SettingsModal';
import {
  loadBestScore,
  loadGameState,
  loadLastGridSize,
  loadTheme,
  saveGameState,
  saveLastGridSize,
  saveTheme,
} from './storage';
import type { Direction, Game2048State, GridSize, ThemeId } from './types';

const GRID_OPTIONS: Array<{ size: GridSize; label: string; tag: string }> = [
  { size: 3, label: '3×3', tag: 'Facile' },
  { size: 4, label: '4×4', tag: 'Classique' },
  { size: 5, label: '5×5', tag: 'Grand' },
];

function fireCelebration(big: boolean): void {
  try {
    if (big) {
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.55 },
        colors: ['#FACC15', '#FB923C', '#F472B6', '#38BDF8', '#34D399', '#C084FC'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.65 },
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.65 },
        });
      }, 240);
    } else {
      confetti({
        particleCount: 38,
        spread: 60,
        startVelocity: 28,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#FB923C', '#F472B6', '#38BDF8', '#34D399'],
      });
    }
  } catch {
    // Ignore confetti errors in headless environments
  }
}

export function Game2048() {
  const { playClick, playSlide, playMerge, playWin, playGameOver } = useSound();

  const [gridSize, setGridSize] = useState<GridSize>(() => loadLastGridSize());
  const [themeId, setThemeId] = useState<ThemeId>(() => loadTheme());
  const [gameState, setGameState] = useState<Game2048State>(() => {
    const initialSize = loadLastGridSize();
    return loadGameState(initialSize) ?? createInitialState(initialSize, loadBestScore(initialSize));
  });

  const [scorePopup, setScorePopup] = useState<{ id: number; amount: number } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  // Sauvegarde automatique à chaque changement d'état
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const handleSelectTheme = useCallback((nextTheme: ThemeId) => {
    setThemeId(nextTheme);
    saveTheme(nextTheme);
  }, []);

  const handleChangeGridSize = useCallback(
    (newSize: GridSize) => {
      if (newSize === gridSize) return;
      playClick();
      saveGameState(gameState);
      saveLastGridSize(newSize);
      setGridSize(newSize);
      const saved = loadGameState(newSize);
      setGameState(saved ?? createInitialState(newSize, loadBestScore(newSize)));
    },
    [gameState, gridSize, playClick]
  );

  const handleMove = useCallback(
    (direction: Direction) => {
      const result = move(gameState, direction);
      if (!result.moved) return;

      setGameState(result.state);

      if (result.scoreGained > 0) {
        setScorePopup({ id: Date.now(), amount: result.scoreGained });
      }

      if (result.justWon) {
        playWin();
        fireCelebration(true);
      } else if (result.state.isGameOver) {
        playGameOver();
      } else if (result.highestMergedValue > 0) {
        playMerge(result.highestMergedValue);
        if (result.highestMergedValue >= 256) {
          fireCelebration(false);
        }
      } else {
        playSlide();
      }
    },
    [gameState, playGameOver, playMerge, playSlide, playWin]
  );

  const handleUndo = useCallback(() => {
    if (gameState.history.length === 0) return;
    playClick();
    setGameState((prev) => undo(prev));
  }, [gameState.history.length, playClick]);

  const startNewGame = useCallback(() => {
    playClick();
    setIsConfirmResetOpen(false);
    setGameState((prev) => createInitialState(prev.size, prev.bestScore));
  }, [playClick]);

  const handleRequestReset = useCallback(() => {
    playClick();
    if (gameState.score > 0 && !gameState.isGameOver) {
      setIsConfirmResetOpen(true);
    } else {
      startNewGame();
    }
  }, [gameState.isGameOver, gameState.score, playClick, startNewGame]);

  const handleContinuePlaying = useCallback(() => {
    playClick();
    setGameState((prev) => continueAfterWin(prev));
  }, [playClick]);

  const showWinOverlay = gameState.hasWon && !gameState.keepPlaying;
  const showGameOverOverlay = gameState.isGameOver && !showWinOverlay;
  const isBoardDisabled = showWinOverlay || showGameOverOverlay || isSettingsOpen || isConfirmResetOpen;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3 sm:gap-4">
      {/* Ligne 1 : Titre + Scores */}
      <div className="flex w-full items-center justify-between gap-2 sm:gap-3">
        <div className="hidden lg:block">
          <h2 className="font-display text-3xl font-bold leading-none text-amber-950">
            2048
          </h2>
          <p className="mt-1 text-xs font-bold text-amber-800/70">
            Fais glisser pour fusionner !
          </p>
        </div>

        <div className="flex flex-1 lg:flex-none items-center justify-between lg:justify-end gap-2.5">
          {/* Score actuel */}
          <div className="relative flex flex-1 lg:flex-none lg:min-w-28 flex-col items-center rounded-2xl bg-white px-4 py-2 shadow-sm border-2 border-amber-200/80">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700/80">
              Score
            </span>
            <span className="font-display text-2xl font-bold leading-tight text-amber-950">
              {gameState.score}
            </span>

            <AnimatePresence>
              {scorePopup && (
                <motion.span
                  key={scorePopup.id}
                  initial={{ opacity: 1, y: 0, scale: 0.9 }}
                  animate={{ opacity: 0, y: -28, scale: 1.15 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                  onAnimationComplete={() => setScorePopup(null)}
                  className="pointer-events-none absolute -top-2 right-2 font-display text-base font-bold text-orange-500"
                >
                  +{scorePopup.amount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Meilleur score */}
          <div className="flex flex-1 lg:flex-none lg:min-w-28 flex-col items-center rounded-2xl bg-gradient-to-b from-amber-100 to-amber-50 px-4 py-2 shadow-sm border-2 border-amber-300/80">
            <span className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
              <Trophy className="h-3.5 w-3.5 text-amber-600" />
              Record
            </span>
            <span className="font-display text-2xl font-bold leading-tight text-amber-950">
              {gameState.bestScore}
            </span>
          </div>
        </div>
      </div>

      {/* Ligne 2 : Sélecteur de taille de grille + Boutons d'action */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        {/* Tailles de grille */}
        <div
          role="group"
          aria-label="Taille de la grille"
          className="flex items-center rounded-2xl bg-amber-100/80 p-1 border border-amber-200/80"
        >
          {GRID_OPTIONS.map((opt) => {
            const active = gridSize === opt.size;
            return (
              <button
                key={opt.size}
                type="button"
                onClick={() => handleChangeGridSize(opt.size)}
                className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 min-h-[44px] transition-all focus-visible:outline-2 focus-visible:outline-orange-500 ${
                  active
                    ? 'bg-white text-orange-600 shadow-sm font-extrabold'
                    : 'text-amber-900/75 hover:text-amber-950 font-bold'
                }`}
              >
                <span className="font-display text-sm leading-none">{opt.label}</span>
                <span className="text-[10px] leading-tight opacity-80">{opt.tag}</span>
              </button>
            );
          })}
        </div>

        {/* Boutons Annuler, Paramètres, Recommencer */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={gameState.history.length === 0}
            aria-label="Annuler le dernier coup"
            title="Annuler le dernier coup"
            className="relative flex h-12 items-center gap-1.5 rounded-2xl bg-white px-3.5 font-bold text-amber-950 shadow-sm border-2 border-amber-200 hover:bg-amber-50 active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed transition focus-visible:outline-2 focus-visible:outline-orange-500"
          >
            <Undo2 className="h-5 w-5 text-orange-500" />
            <span className="hidden sm:inline text-sm">Annuler</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              setIsSettingsOpen(true);
            }}
            aria-label="Paramètres et thèmes"
            title="Paramètres et thèmes"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-950 shadow-sm border-2 border-amber-200 hover:bg-amber-50 active:scale-95 transition focus-visible:outline-2 focus-visible:outline-orange-500"
          >
            <Settings className="h-5 w-5 text-amber-700" />
          </button>

          <button
            type="button"
            onClick={handleRequestReset}
            aria-label="Nouvelle partie"
            title="Nouvelle partie"
            className="flex h-12 items-center gap-1.5 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-500 px-3.5 font-bold text-white shadow-sm shadow-orange-200 hover:brightness-105 active:scale-95 transition focus-visible:outline-2 focus-visible:outline-orange-500"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="hidden sm:inline text-sm">Rejouer</span>
          </button>
        </div>
      </div>

      {/* Plateau de jeu + Overlays Victoire / Fin de partie */}
      <div className="relative flex w-full justify-center">
        <Board
          tiles={gameState.tiles}
          size={gridSize}
          themeId={themeId}
          disabled={isBoardDisabled}
          onMove={handleMove}
        />

        {/* Overlay Victoire (2048 atteint) */}
        <AnimatePresence>
          {showWinOverlay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-20 flex items-center justify-center p-4"
            >
              <div className="flex w-full max-w-xs flex-col items-center rounded-3xl bg-white/95 p-6 text-center shadow-2xl border-4 border-amber-300 backdrop-blur-sm">
                <span className="text-5xl mb-2" aria-hidden="true">
                  🎉
                </span>
                <h3 className="font-display text-3xl font-bold text-amber-950">
                  Bravo ! 2048 !
                </h3>
                <p className="mt-1.5 text-sm font-bold text-amber-800/80">
                  Tu as réussi un super score de {gameState.score} points !
                </p>
                <div className="mt-5 flex w-full flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleContinuePlaying}
                    className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 font-display text-lg font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition"
                  >
                    Continuer à jouer
                  </button>
                  <button
                    type="button"
                    onClick={startNewGame}
                    className="h-12 w-full rounded-2xl bg-amber-100 font-display text-base font-bold text-amber-950 hover:bg-amber-200 active:scale-95 transition"
                  >
                    Nouvelle partie
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay Fin de partie */}
        <AnimatePresence>
          {showGameOverOverlay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-20 flex items-center justify-center p-4"
            >
              <div className="flex w-full max-w-xs flex-col items-center rounded-3xl bg-white/95 p-6 text-center shadow-2xl border-4 border-orange-200 backdrop-blur-sm">
                <span className="text-5xl mb-2" aria-hidden="true">
                  🌟
                </span>
                <h3 className="font-display text-2xl font-bold text-amber-950">
                  Bien joué !
                </h3>
                <p className="mt-1.5 text-sm font-bold text-amber-800/80">
                  Plus de mouvement possible. Score final :{' '}
                  <span className="text-orange-600">{gameState.score}</span>
                </p>
                <div className="mt-5 flex w-full flex-col gap-2.5">
                  {gameState.history.length > 0 && (
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-100 font-display text-base font-bold text-amber-950 hover:bg-amber-200 active:scale-95 transition"
                    >
                      <Undo2 className="h-5 w-5 text-orange-600" />
                      Annuler le dernier coup
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={startNewGame}
                    className="h-12 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 font-display text-lg font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition"
                  >
                    Recommencer
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Indication discrète */}
      <p className="text-center text-xs font-bold text-amber-900/55">
        Glisse ton doigt sur la grille (ou utilise les flèches) pour assembler les tuiles identiques !
      </p>

      {/* Modale Paramètres (Thèmes + Son) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={themeId}
        onSelectTheme={handleSelectTheme}
      />

      {/* Modale de confirmation douce pour Nouvelle partie */}
      <AnimatePresence>
        {isConfirmResetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmResetOpen(false)}
              className="absolute inset-0 bg-amber-950/35 backdrop-blur-xs"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl border-4 border-amber-200"
            >
              <span className="text-4xl" aria-hidden="true">
                🔄
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold text-amber-950">
                Recommencer ?
              </h3>
              <p className="mt-1.5 text-sm font-semibold text-amber-900/75">
                Ta partie actuelle ({gameState.score} pts) va repartir à zéro.
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setIsConfirmResetOpen(false);
                  }}
                  className="h-12 flex-1 rounded-2xl bg-stone-100 font-display font-bold text-stone-700 hover:bg-stone-200 active:scale-95 transition"
                >
                  Non
                </button>
                <button
                  type="button"
                  onClick={startNewGame}
                  className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 font-display font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition"
                >
                  Oui, rejouer !
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
