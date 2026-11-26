import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw, Trophy } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { generateMaze, type MazePuzzle } from './generator';

const THEMES = [
  { hero: '🐭', goal: '🧀', wall: 'bg-amber-700', path: 'bg-amber-50' },
  { hero: '🚀', goal: '🪐', wall: 'bg-indigo-900', path: 'bg-indigo-50' },
  { hero: '🐰', goal: '🥕', wall: 'bg-emerald-700', path: 'bg-emerald-50' },
];

export function GameMaze() {
  const { grade } = useGrade();
  const { playClick, playSlide, playWin } = useSound();

  const [themeIdx, setThemeIdx] = useState(0);
  const [puzzle, setPuzzle] = useState<MazePuzzle>(() => generateMaze(grade));
  const [pos, setPos] = useState(puzzle.start);
  const [won, setWon] = useState(false);
  const [wins, setWins] = useState(0);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const theme = THEMES[themeIdx];

  const startNew = useCallback(
    (nextGrade = grade) => {
      const next = generateMaze(nextGrade);
      setPuzzle(next);
      setPos(next.start);
      setWon(false);
    },
    [grade]
  );

  useEffect(() => {
    startNew(grade);
  }, [grade, startNew]);

  const moveBy = useCallback(
    (dr: number, dc: number) => {
      if (won) return;
      const nr = pos.row + dr;
      const nc = pos.col + dc;
      if (
        nr < 0 ||
        nr >= puzzle.size ||
        nc < 0 ||
        nc >= puzzle.size ||
        puzzle.grid[nr][nc] === 1
      ) {
        return;
      }

      setPos({ row: nr, col: nc });
      if (nr === puzzle.goal.row && nc === puzzle.goal.col) {
        setWon(true);
        setWins((w) => w + 1);
        playWin();
        try {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 } });
        } catch {
          // Ignore confetti
        }
      } else {
        playSlide();
      }
    },
    [playSlide, playWin, pos.col, pos.row, puzzle.goal.col, puzzle.goal.row, puzzle.grid, puzzle.size, won]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'z') {
        e.preventDefault();
        moveBy(-1, 0);
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        moveBy(1, 0);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'q') {
        e.preventDefault();
        moveBy(0, -1);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault();
        moveBy(0, 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moveBy]);

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3.5">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🌀 Labyrinthe
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Guide {theme.hero} jusqu'à {theme.goal} en glissant ou avec les flèches !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
          <button
            type="button"
            onClick={() => {
              playClick();
              setThemeIdx((i) => (i + 1) % THEMES.length);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl border-2 border-amber-200 hover:bg-amber-50 active:scale-95 transition"
            title="Changer de thème"
          >
            {theme.hero}
          </button>
          <div className="flex items-center gap-1 rounded-xl bg-amber-100 px-3 py-1.5 border border-amber-300">
            <Trophy className="h-4 w-4 text-amber-600" />
            <span className="font-display text-base font-bold text-amber-950">{wins}</span>
          </div>
        </div>
      </div>

      {/* Grille du labyrinthe */}
      <div
        onPointerDown={(e) => {
          swipeStart.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          if (!swipeStart.current) return;
          const dx = e.clientX - swipeStart.current.x;
          const dy = e.clientY - swipeStart.current.y;
          swipeStart.current = null;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
          if (Math.abs(dx) > Math.abs(dy)) moveBy(0, dx > 0 ? 1 : -1);
          else moveBy(dy > 0 ? 1 : -1, 0);
        }}
        style={{
          touchAction: 'none',
          gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
        }}
        className="grid aspect-square w-full max-w-[min(88vw,420px)] rounded-3xl overflow-hidden shadow-lg border-4 border-amber-300 bg-white select-none"
      >
        {puzzle.grid.map((row, r) =>
          row.map((cell, c) => {
            const isHero = pos.row === r && pos.col === c;
            const isGoal = puzzle.goal.row === r && puzzle.goal.col === c;
            const isAdjacent = Math.abs(pos.row - r) + Math.abs(pos.col - c) === 1 && cell === 0;

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => {
                  if (isAdjacent) moveBy(r - pos.row, c - pos.col);
                }}
                className={`flex items-center justify-center ${
                  cell === 1 ? theme.wall : theme.path
                } ${isAdjacent ? 'cursor-pointer hover:brightness-95' : ''}`}
              >
                {isHero && (
                  <span className={puzzle.size === 9 ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'}>
                    {theme.hero}
                  </span>
                )}
                {!isHero && isGoal && (
                  <span className={puzzle.size === 9 ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'}>
                    {theme.goal}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* D-Pad tactile ou Victoire */}
      {won ? (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-100 px-5 py-3 border-2 border-emerald-300">
          <p className="font-display text-lg font-bold text-emerald-950">
            Bravo ! Sortie trouvée ! 🎉
          </p>
          <button
            type="button"
            onClick={() => {
              playClick();
              startNew(grade);
            }}
            className="flex h-11 items-center gap-1.5 rounded-2xl bg-emerald-500 px-5 font-display text-base font-bold text-white active:scale-95 transition"
          >
            <RotateCcw className="h-4 w-4" />
            Nouveau labyrinthe
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Gauche"
            onClick={() => moveBy(0, -1)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-950 border-b-4 border-amber-300 active:scale-95"
          >
            <ArrowLeft className="h-7 w-7" />
          </button>
          <button
            type="button"
            aria-label="Haut"
            onClick={() => moveBy(-1, 0)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-950 border-b-4 border-amber-300 active:scale-95"
          >
            <ArrowUp className="h-7 w-7" />
          </button>
          <button
            type="button"
            aria-label="Bas"
            onClick={() => moveBy(1, 0)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-950 border-b-4 border-amber-300 active:scale-95"
          >
            <ArrowDown className="h-7 w-7" />
          </button>
          <button
            type="button"
            aria-label="Droite"
            onClick={() => moveBy(0, 1)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-950 border-b-4 border-amber-300 active:scale-95"
          >
            <ArrowRight className="h-7 w-7" />
          </button>
        </div>
      )}
    </div>
  );
}

export default GameMaze;
