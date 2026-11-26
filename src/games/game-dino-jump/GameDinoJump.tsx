import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';

const W = 560;
const H = 260;
const GROUND_Y = 212;
const BEST_KEY = 'jeux-enfant:dino-jump:best:v1';

interface Obstacle {
  x: number;
  w: number;
  h: number;
}

interface StarBonus {
  x: number;
  y: number;
  collected: boolean;
}

export function GameDinoJump() {
  const { grade } = useGrade();
  const { playClick, playMerge, playGameOver } = useSound();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number>(() => {
    try {
      return Number.parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
    } catch {
      return 0;
    }
  });

  const stRef = useRef({
    dinoY: GROUND_Y,
    vy: 0,
    jumpsLeft: 2,
    obstacles: [] as Obstacle[],
    stars: [] as StarBonus[],
    spawnTimer: 1.1,
    speed: 240,
    score: 0,
    phase: 'idle' as 'idle' | 'playing' | 'over',
  });

  const jump = useCallback(() => {
    const st = stRef.current;
    if (st.phase !== 'playing') return;
    if (st.jumpsLeft > 0) {
      st.vy = -440;
      st.jumpsLeft -= 1;
      playClick();
    }
  }, [playClick]);

  const startGame = useCallback(() => {
    playClick();
    stRef.current = {
      dinoY: GROUND_Y,
      vy: 0,
      jumpsLeft: grade === '1re' ? 2 : 1,
      obstacles: [],
      stars: [],
      spawnTimer: 0.9,
      speed: grade === '1re' ? 225 : 285,
      score: 0,
      phase: 'playing',
    };
    setScore(0);
    setPhase('playing');
  }, [grade, playClick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'z') {
        e.preventDefault();
        if (stRef.current.phase !== 'playing') startGame();
        else jump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump, startGame]);

  useEffect(() => {
    let rafId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const st = stRef.current;

      if (st.phase === 'playing') {
        st.vy += 1180 * dt;
        st.dinoY += st.vy * dt;
        if (st.dinoY >= GROUND_Y) {
          st.dinoY = GROUND_Y;
          st.vy = 0;
          st.jumpsLeft = grade === '1re' ? 2 : 1;
        }

        st.speed = Math.min(430, st.speed + 4.5 * dt);
        st.score += dt * 12;
        setScore(Math.floor(st.score));

        st.spawnTimer -= dt;
        if (st.spawnTimer <= 0) {
          const h = 30 + Math.random() * 20;
          st.obstacles.push({ x: W + 20, w: 24, h });
          if (Math.random() < 0.55) {
            st.stars.push({ x: W + 95, y: GROUND_Y - 78, collected: false });
          }
          st.spawnTimer = grade === '1re' ? 1.25 + Math.random() * 0.7 : 0.95 + Math.random() * 0.65;
        }

        const dinoX = 68;
        const dinoTop = st.dinoY - 40;

        st.obstacles = st.obstacles.filter((o) => {
          o.x -= st.speed * dt;
          if (
            dinoX + 26 > o.x + 4 &&
            dinoX + 4 < o.x + o.w - 4 &&
            st.dinoY - 4 > GROUND_Y - o.h + 4
          ) {
            st.phase = 'over';
            setPhase('over');
            playGameOver();
            const finalScore = Math.floor(st.score);
            setBest((b) => {
              const nb = Math.max(b, finalScore);
              try {
                localStorage.setItem(BEST_KEY, String(nb));
              } catch {
                // Ignore storage
              }
              return nb;
            });
          }
          return o.x + o.w > -20;
        });

        st.stars = st.stars.filter((star) => {
          star.x -= st.speed * dt;
          if (
            !star.collected &&
            Math.hypot(dinoX + 18 - star.x, dinoTop + 20 - star.y) < 30
          ) {
            star.collected = true;
            st.score += 15;
            playMerge(128);
          }
          return star.x > -20 && !star.collected;
        });
      }

      // Rendu Canvas
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const isNight = Math.floor(st.score / 150) % 2 === 1;
        ctx.fillStyle = isNight ? '#1E1B4B' : '#BAE6FD';
        ctx.fillRect(0, 0, W, H);

        // Soleil / Lune
        ctx.fillStyle = isNight ? '#FDE68A' : '#FACC15';
        ctx.beginPath();
        ctx.arc(W - 64, 48, 22, 0, Math.PI * 2);
        ctx.fill();

        // Sol
        ctx.fillStyle = '#4ADE80';
        ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

        // Étoiles bonus
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        for (const star of st.stars) {
          ctx.fillText('⭐', star.x, star.y + 8);
        }

        // Obstacles cactus
        for (const o of st.obstacles) {
          ctx.fillStyle = '#15803D';
          ctx.beginPath();
          ctx.roundRect(o.x, GROUND_Y - o.h, o.w, o.h, 6);
          ctx.fill();
        }

        // Dino
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🦖', 56, st.dinoY - 2);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [grade, playGameOver, playMerge]);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3.5">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🦖 Dino Jump
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Touche l'écran pour sauter par-dessus les cactus et attraper les étoiles !
            {grade === '1re' ? ' (Double saut activé !)' : ''}
          </p>
        </div>
        <GradeBadgeToggle />
      </div>

      <div className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-2 shadow-xs border-2 border-amber-200">
        <span className="font-display text-lg font-bold text-emerald-700">Score : {score}</span>
        <span className="flex items-center gap-1 font-display text-lg font-bold text-amber-700">
          <Trophy className="h-4 w-4 text-amber-500" /> Record : {best}
        </span>
      </div>

      <div className="relative w-full overflow-hidden rounded-3xl border-4 border-amber-300 shadow-xl bg-sky-200">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={(e) => {
            e.preventDefault();
            if (phase === 'playing') jump();
          }}
          style={{ touchAction: 'none' }}
          className="block w-full h-auto aspect-[560/260] cursor-pointer select-none"
        />

        {phase !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/65 p-4 text-center text-white backdrop-blur-xs">
            <span className="text-5xl mb-1">🦖</span>
            <h3 className="font-display text-2xl font-bold">
              {phase === 'over' ? `Bien joué ! Score : ${score}` : 'Prêt à sauter ?'}
            </h3>
            <button
              type="button"
              onClick={startGame}
              className="mt-3 flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 font-display text-lg font-bold text-white shadow-md active:scale-95 transition"
            >
              {phase === 'idle' ? <Play className="h-5 w-5 fill-current" /> : <RotateCcw className="h-5 w-5" />}
              {phase === 'idle' ? 'Jouer' : 'Rejouer'}
            </button>
          </div>
        )}
      </div>

      {phase === 'playing' && (
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            jump();
          }}
          className="h-16 w-full max-w-xs rounded-3xl bg-gradient-to-r from-emerald-400 to-teal-500 border-b-4 border-teal-700 font-display text-2xl font-bold text-white shadow-md active:scale-95 transition"
        >
          🦘 SAUTER !
        </button>
      )}
    </div>
  );
}

export default GameDinoJump;
