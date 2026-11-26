import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Play, RotateCcw, Trophy } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';

const GRID = 14;
const FRUITS = ['🍎', '🍓', '🍌', '🍇', '🍉'];
const BEST_KEY = 'jeux-enfant:snake:best:v1';

interface Point {
  x: number;
  y: number;
}

function randomFood(snake: Point[]): { x: number; y: number; emoji: string } {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  const empty: Point[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
    }
  }
  const cell = empty[Math.floor(Math.random() * empty.length)] ?? { x: 7, y: 7 };
  return { ...cell, emoji: FRUITS[Math.floor(Math.random() * FRUITS.length)] };
}

export function GameSnake() {
  const { grade } = useGrade();
  const { playClick, playMerge, playGameOver } = useSound();

  const [snake, setSnake] = useState<Point[]>([
    { x: 6, y: 7 },
    { x: 5, y: 7 },
    { x: 4, y: 7 },
  ]);
  const [food, setFood] = useState(() => randomFood([{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }]));
  const [phase, setPhase] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number>(() => {
    try {
      return Number.parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
    } catch {
      return 0;
    }
  });

  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const setDir = useCallback((dx: number, dy: number) => {
    const cur = dirRef.current;
    if (cur.x === -dx && cur.y === -dy) return;
    nextDirRef.current = { x: dx, y: dy };
  }, []);

  const startGame = () => {
    playClick();
    const initial = [
      { x: 6, y: 7 },
      { x: 5, y: 7 },
      { x: 4, y: 7 },
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    setSnake(initial);
    setFood(randomFood(initial));
    setScore(0);
    setPhase('playing');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'z') {
        e.preventDefault();
        setDir(0, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        setDir(0, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'q') {
        e.preventDefault();
        setDir(-1, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault();
        setDir(1, 0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setDir]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const speedMs = grade === '1re' ? 230 : 155;
    const wrapWalls = grade === '1re';

    const timer = window.setInterval(() => {
      dirRef.current = nextDirRef.current;
      const d = dirRef.current;

      setSnake((prev) => {
        const head = prev[0];
        let nx = head.x + d.x;
        let ny = head.y + d.y;

        if (wrapWalls) {
          nx = (nx + GRID) % GRID;
          ny = (ny + GRID) % GRID;
        } else if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) {
          setPhase('over');
          playGameOver();
          return prev;
        }

        const ate = nx === food.x && ny === food.y;
        const bodyToCheck = ate ? prev : prev.slice(0, -1);
        if (bodyToCheck.some((p) => p.x === nx && p.y === ny)) {
          setPhase('over');
          playGameOver();
          return prev;
        }

        const nextSnake = [{ x: nx, y: ny }, ...bodyToCheck];
        if (ate) {
          playMerge(64);
          setScore((s) => {
            const ns = s + 1;
            setBest((b) => {
              const nb = Math.max(b, ns);
              try {
                localStorage.setItem(BEST_KEY, String(nb));
              } catch {
                // Ignore storage
              }
              return nb;
            });
            return ns;
          });
          setFood(randomFood(nextSnake));
        }
        return nextSnake;
      });
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [food.x, food.y, grade, phase, playGameOver, playMerge]);

  const snakeMap = new Map(snake.map((p, idx) => [`${p.x},${p.y}`, idx]));

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-3.5">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🐍 Serpent Coloré
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            {grade === '1re'
              ? 'Mange les fruits ! (Les murs téléportent en 1re année)'
              : 'Mange les fruits sans toucher les murs ni ta queue !'}
          </p>
        </div>
        <GradeBadgeToggle />
      </div>

      <div className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-2 shadow-xs border-2 border-amber-200">
        <span className="font-display text-lg font-bold text-emerald-700">🍎 {score}</span>
        <span className="flex items-center gap-1 font-display text-lg font-bold text-amber-700">
          <Trophy className="h-4 w-4 text-amber-500" /> Record : {best}
        </span>
      </div>

      {/* Grille de jeu */}
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
          if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
          else setDir(0, dy > 0 ? 1 : -1);
        }}
        style={{
          touchAction: 'none',
          gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))`,
        }}
        className="relative grid aspect-square w-full max-w-[min(86vw,380px)] rounded-3xl overflow-hidden bg-emerald-50 border-4 border-emerald-400 shadow-lg select-none"
      >
        {Array.from({ length: GRID * GRID }, (_, i) => {
          const x = i % GRID;
          const y = Math.floor(i / GRID);
          const sIdx = snakeMap.get(`${x},${y}`);
          const isFood = food.x === x && food.y === y;
          return (
            <div
              key={i}
              className={`flex items-center justify-center ${
                (x + y) % 2 === 0 ? 'bg-emerald-50' : 'bg-emerald-100/60'
              }`}
            >
              {sIdx === 0 && (
                <div className="h-[88%] w-[88%] rounded-lg bg-emerald-600 flex items-center justify-center text-[10px]">
                  👀
                </div>
              )}
              {sIdx !== undefined && sIdx > 0 && (
                <div className="h-[80%] w-[80%] rounded-md bg-emerald-400" />
              )}
              {isFood && <span className="text-base sm:text-lg leading-none">{food.emoji}</span>}
            </div>
          );
        })}

        {phase !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/70 p-4 text-center text-white backdrop-blur-xs">
            <span className="text-5xl mb-2">🐍</span>
            <h3 className="font-display text-2xl font-bold">
              {phase === 'over' ? `Bien joué ! ${score} fruits mangés` : 'Prêt à glisser ?'}
            </h3>
            <button
              type="button"
              onClick={startGame}
              className="mt-4 flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 font-display text-lg font-bold text-white shadow-md active:scale-95 transition"
            >
              {phase === 'idle' ? <Play className="h-5 w-5 fill-current" /> : <RotateCcw className="h-5 w-5" />}
              {phase === 'idle' ? 'Jouer' : 'Rejouer'}
            </button>
          </div>
        )}
      </div>

      {/* D-Pad tactile */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Gauche"
          onClick={() => setDir(-1, 0)}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-950 border-b-4 border-amber-300 active:scale-95"
        >
          <ArrowLeft className="h-7 w-7" />
        </button>
        <button
          type="button"
          aria-label="Haut"
          onClick={() => setDir(0, -1)}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-950 border-b-4 border-amber-300 active:scale-95"
        >
          <ArrowUp className="h-7 w-7" />
        </button>
        <button
          type="button"
          aria-label="Bas"
          onClick={() => setDir(0, 1)}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-950 border-b-4 border-amber-300 active:scale-95"
        >
          <ArrowDown className="h-7 w-7" />
        </button>
        <button
          type="button"
          aria-label="Droite"
          onClick={() => setDir(1, 0)}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-950 border-b-4 border-amber-300 active:scale-95"
        >
          <ArrowRight className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}

export default GameSnake;
