import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Play, RotateCcw, Trophy } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  alive: boolean;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface PowerUp {
  x: number;
  y: number;
  kind: 'wide' | 'multi';
}

const W = 480;
const H = 400;
const BRICK_COLORS = ['#F43F5E', '#FB923C', '#FACC15', '#34D399', '#38BDF8'];

function makeBricks(): Brick[] {
  const bricks: Brick[] = [];
  const cols = 8;
  const rows = 5;
  const pad = 6;
  const bw = (W - pad * (cols + 1)) / cols;
  const bh = 22;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      bricks.push({
        x: pad + c * (bw + pad),
        y: 38 + r * (bh + pad),
        w: bw,
        h: bh,
        color: BRICK_COLORS[r % BRICK_COLORS.length],
        alive: true,
      });
    }
  }
  return bricks;
}

export function GameBreakout() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin, playGameOver } = useSound();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const stateRef = useRef({
    paddleX: W / 2 - 48,
    paddleW: 96,
    balls: [{ x: W / 2, y: H - 60, vx: 180, vy: -210 }] as Ball[],
    bricks: makeBricks(),
    powerUps: [] as PowerUp[],
    score: 0,
    lives: 3,
    phase: 'idle' as 'idle' | 'playing' | 'won' | 'lost',
  });

  const keysRef = useRef({ left: false, right: false });

  const startGame = useCallback(() => {
    playClick();
    const baseSpeed = grade === '1re' ? 195 : 250;
    const paddleW = grade === '1re' ? 115 : 88;
    stateRef.current = {
      paddleX: W / 2 - paddleW / 2,
      paddleW,
      balls: [{ x: W / 2, y: H - 56, vx: baseSpeed * 0.72, vy: -baseSpeed }],
      bricks: makeBricks(),
      powerUps: [],
      score: 0,
      lives: 3,
      phase: 'playing',
    };
    setScore(0);
    setLives(3);
    setPhase('playing');
  }, [grade, playClick]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'q') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'q') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useEffect(() => {
    let rafId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const st = stateRef.current;

      if (st.phase === 'playing') {
        if (keysRef.current.left) st.paddleX = Math.max(8, st.paddleX - 380 * dt);
        if (keysRef.current.right) st.paddleX = Math.min(W - st.paddleW - 8, st.paddleX + 380 * dt);

        const paddleY = H - 28;
        const survivingBalls: Ball[] = [];

        for (const ball of st.balls) {
          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;

          if (ball.x < 8) {
            ball.x = 8;
            ball.vx = Math.abs(ball.vx);
          } else if (ball.x > W - 8) {
            ball.x = W - 8;
            ball.vx = -Math.abs(ball.vx);
          }
          if (ball.y < 8) {
            ball.y = 8;
            ball.vy = Math.abs(ball.vy);
          }

          // Rebond raquette
          if (
            ball.vy > 0 &&
            ball.y + 8 >= paddleY &&
            ball.y - 8 <= paddleY + 14 &&
            ball.x >= st.paddleX - 4 &&
            ball.x <= st.paddleX + st.paddleW + 4
          ) {
            const hitRatio = (ball.x - (st.paddleX + st.paddleW / 2)) / (st.paddleW / 2);
            const speed = Math.hypot(ball.vx, ball.vy);
            ball.vx = hitRatio * speed * 0.85;
            ball.vy = -Math.max(130, Math.sqrt(Math.max(10000, speed * speed - ball.vx * ball.vx)));
            ball.y = paddleY - 9;
            playClick();
          }

          // Collisions briques
          for (const b of st.bricks) {
            if (!b.alive) continue;
            if (
              ball.x + 8 > b.x &&
              ball.x - 8 < b.x + b.w &&
              ball.y + 8 > b.y &&
              ball.y - 8 < b.y + b.h
            ) {
              b.alive = false;
              ball.vy = -ball.vy;
              st.score += 10;
              setScore(st.score);
              playMerge(64);
              if (Math.random() < 0.16) {
                st.powerUps.push({
                  x: b.x + b.w / 2,
                  y: b.y + b.h / 2,
                  kind: Math.random() < 0.5 ? 'wide' : 'multi',
                });
              }
              break;
            }
          }

          if (ball.y < H + 12) {
            survivingBalls.push(ball);
          }
        }

        st.balls = survivingBalls;

        // Bonus qui tombent
        st.powerUps = st.powerUps.filter((pu) => {
          pu.y += 130 * dt;
          if (
            pu.y >= paddleY - 6 &&
            pu.y <= paddleY + 18 &&
            pu.x >= st.paddleX &&
            pu.x <= st.paddleX + st.paddleW
          ) {
            playMerge(256);
            if (pu.kind === 'wide') {
              st.paddleW = Math.min(155, st.paddleW + 26);
            } else if (st.balls.length > 0 && st.balls.length < 4) {
              const b0 = st.balls[0];
              st.balls.push({ x: b0.x, y: b0.y, vx: -b0.vx, vy: -Math.abs(b0.vy) });
            }
            return false;
          }
          return pu.y < H + 16;
        });

        // Victoire ?
        if (st.bricks.every((b) => !b.alive)) {
          st.phase = 'won';
          setPhase('won');
          playWin();
          try {
            confetti({ particleCount: 95, spread: 80, origin: { y: 0.55 } });
          } catch {
            // Ignore confetti
          }
        } else if (st.balls.length === 0) {
          st.lives -= 1;
          setLives(st.lives);
          if (st.lives <= 0) {
            st.phase = 'lost';
            setPhase('lost');
            playGameOver();
          } else {
            const baseSpeed = grade === '1re' ? 195 : 250;
            st.balls = [{ x: st.paddleX + st.paddleW / 2, y: H - 56, vx: baseSpeed * 0.65, vy: -baseSpeed }];
            playGameOver();
          }
        }
      }

      // Rendu Canvas
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, W, H);

        // Briques
        for (const b of st.bricks) {
          if (!b.alive) continue;
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.roundRect(b.x, b.y, b.w, b.h, 6);
          ctx.fill();
        }

        // Bonus
        for (const pu of st.powerUps) {
          ctx.fillStyle = pu.kind === 'wide' ? '#38BDF8' : '#FACC15';
          ctx.beginPath();
          ctx.arc(pu.x, pu.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(pu.kind === 'wide' ? '↔' : '+', pu.x, pu.y + 4);
        }

        // Raquette
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.roundRect(st.paddleX, H - 28, st.paddleW, 14, 7);
        ctx.fill();

        // Balles
        for (const ball of st.balls) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [grade, playClick, playGameOver, playMerge, playWin]);

  const movePaddleToPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const st = stateRef.current;
    st.paddleX = Math.max(8, Math.min(W - st.paddleW - 8, x - st.paddleW / 2));
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3.5">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🧱 Casse-Briques
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Glisse ton doigt sur l'écran pour contrôler la raquette et casser les briques !
          </p>
        </div>

        <GradeBadgeToggle />
      </div>

      {/* HUD */}
      <div className="flex w-full items-center justify-between rounded-2xl bg-slate-900 px-4 py-2 text-white">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              className={`h-5 w-5 ${i < lives ? 'fill-rose-500 text-rose-400' : 'text-white/20'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5 font-display text-xl font-bold text-amber-300">
          <Trophy className="h-5 w-5" />
          {score}
        </div>
      </div>

      {/* Canvas interactif */}
      <div className="relative w-full overflow-hidden rounded-3xl border-4 border-amber-300 shadow-xl bg-slate-950">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={movePaddleToPointer}
          onPointerMove={movePaddleToPointer}
          style={{ touchAction: 'none' }}
          className="block w-full h-auto aspect-[480/400] cursor-ew-resize select-none"
        />

        {phase !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/75 p-4 text-center text-white backdrop-blur-xs">
            <span className="text-5xl mb-2">
              {phase === 'won' ? '🎉' : phase === 'lost' ? '🧱' : '🎮'}
            </span>
            <h3 className="font-display text-2xl font-bold">
              {phase === 'won'
                ? 'Toutes les briques cassées !'
                : phase === 'lost'
                ? `Bien joué ! Score : ${score}`
                : 'Prêt à casser des briques ?'}
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
    </div>
  );
}

export default GameBreakout;
