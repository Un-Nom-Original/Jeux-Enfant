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
  phase: number;
  collected: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
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
    particles: [] as Particle[],
    clouds: [
      { x: 90, y: 42, s: 1 },
      { x: 280, y: 66, s: 0.8 },
      { x: 450, y: 36, s: 1.15 },
    ],
    groundOffset: 0,
    runTime: 0,
    spawnTimer: 1.1,
    speed: 240,
    score: 0,
    phase: 'idle' as 'idle' | 'playing' | 'over',
  });

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    const st = stRef.current;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 110;
      st.particles.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 40,
        color,
        size: 3 + Math.random() * 4,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
      });
    }
  };

  const jump = useCallback(() => {
    const st = stRef.current;
    if (st.phase !== 'playing') return;
    if (st.jumpsLeft > 0) {
      st.vy = -445;
      st.jumpsLeft -= 1;
      spawnParticles(74, st.dinoY - 4, '#E2E8F0', 6);
      playClick();
    }
  }, [playClick]);

  const startGame = useCallback(() => {
    playClick();
    stRef.current = {
      ...stRef.current,
      dinoY: GROUND_Y,
      vy: 0,
      jumpsLeft: grade === '1re' ? 2 : 1,
      obstacles: [],
      stars: [],
      particles: [],
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
      st.runTime += dt;

      if (st.phase === 'playing') {
        const wasInAir = st.dinoY < GROUND_Y - 1;
        st.vy += 1180 * dt;
        st.dinoY += st.vy * dt;
        if (st.dinoY >= GROUND_Y) {
          st.dinoY = GROUND_Y;
          st.vy = 0;
          st.jumpsLeft = grade === '1re' ? 2 : 1;
          if (wasInAir) {
            spawnParticles(74, GROUND_Y - 2, '#86EFAC', 5);
          }
        }

        st.speed = Math.min(430, st.speed + 4.5 * dt);
        st.groundOffset = (st.groundOffset + st.speed * dt) % 48;
        st.score += dt * 12;
        setScore(Math.floor(st.score));

        // Nuages en parallaxe
        st.clouds.forEach((c) => {
          c.x -= st.speed * 0.18 * dt;
          if (c.x < -60) c.x = W + 60;
        });

        // Poussière de course
        if (st.dinoY >= GROUND_Y && Math.random() < 0.25) {
          st.particles.push({
            x: 62,
            y: GROUND_Y - 3,
            vx: -st.speed * 0.35,
            vy: -15 - Math.random() * 25,
            color: '#BBF7D0',
            size: 3,
            life: 0,
            maxLife: 0.25,
          });
        }

        st.spawnTimer -= dt;
        if (st.spawnTimer <= 0) {
          const h = 30 + Math.random() * 20;
          st.obstacles.push({ x: W + 20, w: 26, h });
          if (Math.random() < 0.58) {
            st.stars.push({
              x: W + 95,
              y: GROUND_Y - 78,
              phase: Math.random() * Math.PI * 2,
              collected: false,
            });
          }
          st.spawnTimer =
            grade === '1re' ? 1.25 + Math.random() * 0.7 : 0.95 + Math.random() * 0.65;
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
            spawnParticles(dinoX + 14, st.dinoY - 20, '#F43F5E', 14);
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
          star.phase += dt * 5;
          const bobY = star.y + Math.sin(star.phase) * 6;
          if (
            !star.collected &&
            Math.hypot(dinoX + 18 - star.x, dinoTop + 20 - bobY) < 32
          ) {
            star.collected = true;
            st.score += 15;
            spawnParticles(star.x, bobY, '#FACC15', 12);
            playMerge(128);
          }
          return star.x > -20 && !star.collected;
        });
      }

      // Particules
      st.particles = st.particles.filter((pt) => {
        pt.life += dt;
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 320 * dt;
        return pt.life < pt.maxLife;
      });

      // Rendu Canvas
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const isNight = Math.floor(st.score / 150) % 2 === 1;
        const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        if (isNight) {
          sky.addColorStop(0, '#0F172A');
          sky.addColorStop(1, '#312E81');
        } else {
          sky.addColorStop(0, '#38BDF8');
          sky.addColorStop(1, '#E0F2FE');
        }
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, GROUND_Y);

        // Soleil / Lune
        ctx.fillStyle = isNight ? '#FEF08A' : '#FACC15';
        ctx.beginPath();
        ctx.arc(W - 64, 48, 22, 0, Math.PI * 2);
        ctx.fill();

        // Montagnes lointaines
        ctx.fillStyle = isNight ? '#1E1B4B' : '#93C5FD';
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(110, 142);
        ctx.lineTo(230, GROUND_Y);
        ctx.lineTo(350, 128);
        ctx.lineTo(480, GROUND_Y);
        ctx.lineTo(W, 155);
        ctx.lineTo(W, GROUND_Y);
        ctx.closePath();
        ctx.fill();

        // Nuages animés
        ctx.fillStyle = isNight ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.88)';
        st.clouds.forEach((c) => {
          ctx.beginPath();
          ctx.arc(c.x, c.y, 14 * c.s, 0, Math.PI * 2);
          ctx.arc(c.x + 16 * c.s, c.y - 4 * c.s, 18 * c.s, 0, Math.PI * 2);
          ctx.arc(c.x + 32 * c.s, c.y, 13 * c.s, 0, Math.PI * 2);
          ctx.fill();
        });

        // Sol avec herbe qui défile
        ctx.fillStyle = '#22C55E';
        ctx.fillRect(0, GROUND_Y, W, 12);
        ctx.fillStyle = '#4ADE80';
        ctx.fillRect(0, GROUND_Y + 12, W, H - GROUND_Y - 12);

        ctx.fillStyle = '#16A34A';
        for (let gx = -st.groundOffset; gx < W + 48; gx += 48) {
          ctx.fillRect(gx, GROUND_Y + 18, 16, 4);
          ctx.fillRect(gx + 26, GROUND_Y + 30, 10, 4);
        }

        // Étoiles bonus oscillantes
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        for (const star of st.stars) {
          const bobY = star.y + Math.sin(star.phase) * 6;
          ctx.fillText('⭐', star.x, bobY + 8);
        }

        // Obstacles cactus détaillés
        for (const o of st.obstacles) {
          ctx.fillStyle = '#15803D';
          ctx.beginPath();
          ctx.roundRect(o.x + 5, GROUND_Y - o.h, o.w - 10, o.h, 6);
          ctx.fill();
          // Bras du cactus
          ctx.beginPath();
          ctx.roundRect(o.x, GROUND_Y - o.h + 10, 8, 12, 4);
          ctx.roundRect(o.x + o.w - 8, GROUND_Y - o.h + 6, 8, 12, 4);
          ctx.fill();
        }

        // Dino tourné vers la DROITE (miroir horizontal) + rebond de course animé !
        const isOnGround = st.dinoY >= GROUND_Y - 1;
        const runBob = st.phase === 'playing' && isOnGround ? Math.abs(Math.sin(st.runTime * 15)) * 5 : 0;
        const tilt = st.phase === 'playing'
          ? isOnGround
            ? Math.sin(st.runTime * 15) * 0.08
            : Math.max(-0.22, Math.min(0.22, st.vy * 0.0005))
          : 0;

        ctx.save();
        ctx.translate(76, st.dinoY - 18 - runBob);
        ctx.rotate(tilt);
        ctx.scale(-1, 1); // Retourne le 🦖 pour qu'il regarde vers la DROITE !
        ctx.font = '42px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🦖', 0, 0);
        ctx.restore();

        // Particules
        for (const pt of st.particles) {
          ctx.globalAlpha = Math.max(0, 1 - pt.life / pt.maxLife);
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
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
            <span className="text-5xl mb-1 inline-block -scale-x-100">🦖</span>
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
