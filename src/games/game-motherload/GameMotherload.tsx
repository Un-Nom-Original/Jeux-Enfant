import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Coins,
  Fuel,
  RotateCcw,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import {
  isMineral,
  METERS_PER_ROW,
  MINERALS,
  SURFACE_ROW,
  TILE_SIZE,
  WORLD_COLS,
  WORLD_ROWS,
} from './constants';
import { ShopModal } from './ShopModal';
import { clearMotherloadSave, loadMotherload, saveMotherload } from './storage';
import type { FloatingText, Particle, PlayerState, TileKind, UpgradeKey } from './types';
import {
  buyPlayerUpgrade,
  buyTeleporter,
  createInitialPlayer,
  generateWorld,
  getCargoCount,
  getCargoValue,
  getStats,
  sellPlayerCargo,
} from './world';

interface DrillAction {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  targetCol: number;
  targetRow: number;
  elapsed: number;
  duration: number;
}

const CANVAS_W = 560;
const CANVAS_H = 380;

export function GameMotherload() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin, playGameOver } = useSound();

  const initialSave = useRef(loadMotherload());
  const worldRef = useRef<TileKind[][]>(initialSave.current?.world ?? generateWorld());
  const playerRef = useRef<PlayerState>(
    initialSave.current?.player ?? createInitialPlayer(grade)
  );
  const drillRef = useRef<DrillAction | null>(null);
  const keysRef = useRef<{ left: boolean; right: boolean; up: boolean; down: boolean }>({
    left: false,
    right: false,
    up: false,
    down: false,
  });
  const particlesRef = useRef<Particle[]>([]);
  const textsRef = useRef<FloatingText[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nextTextIdRef = useRef(1);

  const [hudPlayer, setHudPlayer] = useState<PlayerState>(() => ({ ...playerRef.current }));
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const isShopOpenRef = useRef(false);
  useEffect(() => {
    isShopOpenRef.current = isShopOpen;
  }, [isShopOpen]);

  const gradeRef = useRef(grade);
  useEffect(() => {
    gradeRef.current = grade;
  }, [grade]);

  const addFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    textsRef.current.push({
      id: nextTextIdRef.current++,
      x,
      y,
      text,
      color,
      age: 0,
    });
  }, []);

  const spawnParticles = useCallback((tileX: number, tileY: number, color: string, count = 8) => {
    const cx = (tileX + 0.5) * TILE_SIZE;
    const cy = (tileY + 0.5) * TILE_SIZE;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 110;
      particlesRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 35,
        color,
        size: 3 + Math.random() * 4,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
      });
    }
  }, []);

  const syncHudAndSave = useCallback((persist = false) => {
    setHudPlayer({ ...playerRef.current, cargo: { ...playerRef.current.cargo } });
    if (persist) {
      saveMotherload({ world: worldRef.current, player: playerRef.current });
    }
  }, []);

  const showBanner = useCallback((msg: string) => {
    setBannerMsg(msg);
    window.setTimeout(() => {
      setBannerMsg((curr) => (curr === msg ? null : curr));
    }, 2800);
  }, []);

  const handleRefuel = useCallback(() => {
    const p = playerRef.current;
    const stats = getStats(p.upgrades, gradeRef.current);
    const missing = Math.max(0, stats.maxFuel - p.fuel);
    if (missing < 1) {
      showBanner('⛽ Réservoir déjà plein !');
      return;
    }
    const costPerUnit = gradeRef.current === '1re' ? 0.3 : 0.6;
    const fullCost = Math.ceil(missing * costPerUnit);
    const affordableCost = Math.min(p.money, fullCost);
    const fuelAdded = gradeRef.current === '1re' ? missing : affordableCost / costPerUnit;

    p.money = Math.max(0, p.money - (gradeRef.current === '1re' ? Math.min(p.money, Math.ceil(missing * 0.2)) : affordableCost));
    p.fuel = Math.min(stats.maxFuel, p.fuel + fuelAdded);
    playMerge(32);
    showBanner('⛽ Plein d’essence effectué !');
    syncHudAndSave(true);
  }, [playMerge, showBanner, syncHudAndSave]);

  const handleSellCargo = useCallback(() => {
    const { nextPlayer, earned, soldCount } = sellPlayerCargo(playerRef.current);
    if (soldCount === 0) {
      showBanner('📦 Ta soute est vide ! Creuse pour trouver des minerais.');
      return;
    }
    playerRef.current = nextPlayer;
    playWin();
    addFloatingText(nextPlayer.x, nextPlayer.y - 0.5, `+${earned} $ 💰`, '#FACC15');
    showBanner(`💰 Vendu ${soldCount} minerai${soldCount > 1 ? 's' : ''} pour +${earned} $ !`);
    syncHudAndSave(true);
  }, [addFloatingText, playWin, showBanner, syncHudAndSave]);

  const handleTeleport = useCallback(() => {
    const p = playerRef.current;
    if (p.y <= SURFACE_ROW + 0.1) return;
    if (p.teleporters <= 0) {
      showBanner('🌀 Plus de téléporteur ! Achètes-en à l’Atelier.');
      return;
    }
    drillRef.current = null;
    p.teleporters -= 1;
    p.x = Math.floor(WORLD_COLS / 2);
    p.y = SURFACE_ROW;
    p.vx = 0;
    p.vy = 0;
    playMerge(256);
    showBanner('🌀 Téléporté à la surface !');
    syncHudAndSave(true);
  }, [playMerge, showBanner, syncHudAndSave]);

  const handleBuyUpgrade = useCallback(
    (key: UpgradeKey) => {
      const updated = buyPlayerUpgrade(playerRef.current, key, gradeRef.current);
      if (!updated) return;
      playerRef.current = updated;
      playWin();
      syncHudAndSave(true);
    },
    [playWin, syncHudAndSave]
  );

  const handleRepairHull = useCallback(() => {
    const p = playerRef.current;
    const stats = getStats(p.upgrades, gradeRef.current);
    const missing = Math.max(0, Math.ceil(stats.maxHull - p.hull));
    const cost = Math.round(missing * (gradeRef.current === '1re' ? 1 : 2));
    if (missing === 0 || p.money < cost) return;
    p.money -= cost;
    p.hull = stats.maxHull;
    playMerge(64);
    syncHudAndSave(true);
  }, [playMerge, syncHudAndSave]);

  const handleBuyTeleporter = useCallback(() => {
    const updated = buyTeleporter(playerRef.current, gradeRef.current);
    if (!updated) return;
    playerRef.current = updated;
    playMerge(64);
    syncHudAndSave(true);
  }, [playMerge, syncHudAndSave]);

  const handleResetMine = useCallback(() => {
    playClick();
    clearMotherloadSave();
    worldRef.current = generateWorld();
    playerRef.current = createInitialPlayer(gradeRef.current);
    drillRef.current = null;
    particlesRef.current = [];
    textsRef.current = [];
    setConfirmReset(false);
    showBanner('🪐 Nouvelle planète Mars générée !');
    syncHudAndSave(true);
  }, [playClick, showBanner, syncHudAndSave]);

  // Contrôles clavier
  useEffect(() => {
    const setKey = (key: string, pressed: boolean, e: KeyboardEvent) => {
      const k = key.toLowerCase();
      if (k === 'arrowleft' || k === 'a' || k === 'q') {
        e.preventDefault();
        keysRef.current.left = pressed;
      } else if (k === 'arrowright' || k === 'd') {
        e.preventDefault();
        keysRef.current.right = pressed;
      } else if (k === 'arrowup' || k === 'w' || k === 'z') {
        e.preventDefault();
        keysRef.current.up = pressed;
      } else if (k === 'arrowdown' || k === 's') {
        e.preventDefault();
        keysRef.current.down = pressed;
      }
    };
    const onDown = (e: KeyboardEvent) => setKey(e.key, true, e);
    const onUp = (e: KeyboardEvent) => setKey(e.key, false, e);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // Boucle 60 FPS (physique + forage + rendu Canvas)
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let hudTimer = 0;
    let saveTimer = 0;

    const isSolid = (col: number, row: number): boolean => {
      if (col < 0 || col >= WORLD_COLS || row < 0 || row >= WORLD_ROWS) return true;
      return worldRef.current[row][col] !== 'empty';
    };

    const isDiggable = (col: number, row: number): boolean => {
      if (col < 0 || col >= WORLD_COLS || row <= SURFACE_ROW || row >= WORLD_ROWS) return false;
      const tile = worldRef.current[row][col];
      return tile !== 'empty' && tile !== 'boulder';
    };

    const rescueToSurface = (reason: string) => {
      const p = playerRef.current;
      const stats = getStats(p.upgrades, gradeRef.current);
      drillRef.current = null;
      p.x = Math.floor(WORLD_COLS / 2);
      p.y = SURFACE_ROW;
      p.vx = 0;
      p.vy = 0;
      p.fuel = stats.maxFuel;
      p.hull = stats.maxHull;
      if (gradeRef.current === '3e') {
        const fee = Math.min(p.money, Math.round(p.money * 0.2));
        p.money -= fee;
        showBanner(`${reason} Remorquage vers la surface (-${fee} $).`);
      } else {
        showBanner(`${reason} Secours gratuit vers la surface ! 🚁`);
      }
      playGameOver();
      syncHudAndSave(true);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const p = playerRef.current;
      const world = worldRef.current;
      const stats = getStats(p.upgrades, gradeRef.current);
      const keys = keysRef.current;

      if (!isShopOpenRef.current) {
        // 1. Si un forage est en cours
        if (drillRef.current) {
          const d = drillRef.current;
          d.elapsed += dt * 1000;
          const t = Math.min(1, d.elapsed / d.duration);
          p.x = d.fromX + (d.toX - d.fromX) * t;
          p.y = d.fromY + (d.toY - d.fromY) * t;

          if (Math.random() < 0.45) {
            const tile = world[d.targetRow][d.targetCol];
            const color = isMineral(tile)
              ? MINERALS[tile].color
              : tile === 'lava'
              ? '#FB923C'
              : '#B45309';
            spawnParticles(d.targetCol, d.targetRow, color, 2);
          }

          if (t >= 1) {
            const dugTile = world[d.targetRow][d.targetCol];
            world[d.targetRow][d.targetCol] = 'empty';
            p.x = d.toX;
            p.y = d.toY;
            p.fuel = Math.max(0, p.fuel - stats.drillFuelCost);
            drillRef.current = null;

            const depthM = Math.max(0, Math.round((p.y - SURFACE_ROW) * METERS_PER_ROW));
            if (depthM > p.maxDepth) p.maxDepth = depthM;

            if (dugTile === 'lava') {
              const dmg = gradeRef.current === '1re' ? 12 : 28;
              p.hull = Math.max(0, p.hull - dmg);
              spawnParticles(d.targetCol, d.targetRow, '#F97316', 14);
              addFloatingText(p.x, p.y - 0.4, `🔥 Lave -${dmg} PV`, '#FB7185');
              playGameOver();
              if (p.hull <= 0) {
                rescueToSurface('🛡️ Coque endommagée !');
              }
            } else if (isMineral(dugTile)) {
              const def = MINERALS[dugTile];
              const currentCargo = getCargoCount(p.cargo);
              if (dugTile === 'core_chest') {
                p.money += def.value;
                p.foundCore = true;
                spawnParticles(d.targetCol, d.targetRow, '#FACC15', 28);
                addFloatingText(p.x, p.y - 0.5, `👑 COFFRE +${def.value}$ !`, '#FDE047');
                showBanner('👑 INCROYABLE ! Tu as découvert le Coffre du Noyau (+25 000 $) !');
                playWin();
                try {
                  confetti({ particleCount: 130, spread: 90, origin: { y: 0.5 } });
                } catch {
                  // Ignore confetti
                }
              } else if (currentCargo < stats.maxCargo) {
                p.cargo[dugTile] = (p.cargo[dugTile] ?? 0) + 1;
                spawnParticles(d.targetCol, d.targetRow, def.color, 12);
                addFloatingText(p.x, p.y - 0.4, `${def.emoji} ${def.name} (+${def.value}$)`, def.sparkle);
                playMerge(Math.min(1024, Math.max(16, def.value)));
              } else {
                addFloatingText(p.x, p.y - 0.4, '📦 Soute pleine !', '#FCA5A5');
                playClick();
              }
            } else {
              playClick();
            }
          }
        } else {
          // 2. Déplacement libre / Vol / Gravité / Déclenchement de forage
          const col = Math.round(p.x);
          const row = Math.round(p.y);
          const onGround =
            row >= WORLD_ROWS - 1 ||
            (Math.abs(p.y - row) < 0.08 && isSolid(col, row + 1));

          // Réacteur vers le haut
          if (keys.up && p.fuel > 0) {
            p.vy = Math.max(-stats.thrustSpeed, p.vy - 18 * dt);
            p.fuel = Math.max(0, p.fuel - stats.fuelBurnPerSec * dt);
            if (Math.random() < 0.6) {
              particlesRef.current.push({
                x: (p.x + 0.5) * TILE_SIZE + (Math.random() - 0.5) * 10,
                y: (p.y + 0.95) * TILE_SIZE,
                vx: (Math.random() - 0.5) * 25,
                vy: 90 + Math.random() * 60,
                color: Math.random() < 0.5 ? '#FB923C' : '#FACC15',
                size: 4 + Math.random() * 3,
                life: 0,
                maxLife: 0.22,
              });
            }
          } else {
            // Gravité
            p.vy = Math.min(11, p.vy + 16 * dt);
          }

          // Mouvement horizontal
          const moveSpeed = 5.4;
          if (keys.left) {
            p.facing = -1;
            p.vx = -moveSpeed;
          } else if (keys.right) {
            p.facing = 1;
            p.vx = moveSpeed;
          } else {
            p.vx = 0;
          }

          // Tentative de forage vers le bas
          if (keys.down && onGround && p.fuel > 0 && isDiggable(col, row + 1)) {
            const tile = world[row + 1][col];
            const rockMult = tile === 'rock' ? 1.45 : 1;
            drillRef.current = {
              fromX: col,
              fromY: row,
              toX: col,
              toY: row + 1,
              targetCol: col,
              targetRow: row + 1,
              elapsed: 0,
              duration: stats.drillMs * rockMult,
            };
            p.vx = 0;
            p.vy = 0;
          } else if (
            keys.left &&
            onGround &&
            p.fuel > 0 &&
            Math.abs(p.x - col) < 0.2 &&
            isDiggable(col - 1, row)
          ) {
            const tile = world[row][col - 1];
            const rockMult = tile === 'rock' ? 1.45 : 1;
            drillRef.current = {
              fromX: col,
              fromY: row,
              toX: col - 1,
              toY: row,
              targetCol: col - 1,
              targetRow: row,
              elapsed: 0,
              duration: stats.drillMs * rockMult,
            };
            p.vx = 0;
            p.vy = 0;
          } else if (
            keys.right &&
            onGround &&
            p.fuel > 0 &&
            Math.abs(p.x - col) < 0.2 &&
            isDiggable(col + 1, row)
          ) {
            const tile = world[row][col + 1];
            const rockMult = tile === 'rock' ? 1.45 : 1;
            drillRef.current = {
              fromX: col,
              fromY: row,
              toX: col + 1,
              toY: row,
              targetCol: col + 1,
              targetRow: row,
              elapsed: 0,
              duration: stats.drillMs * rockMult,
            };
            p.vx = 0;
            p.vy = 0;
          } else {
            // Appliquer mouvement horizontal avec collision
            if (p.vx !== 0) {
              const nextX = p.x + p.vx * dt;
              const checkCol = p.vx > 0 ? Math.floor(nextX + 0.82) : Math.floor(nextX + 0.18);
              const curRow = Math.round(p.y);
              if (
                nextX >= 0 &&
                nextX <= WORLD_COLS - 1 &&
                !isSolid(checkCol, curRow)
              ) {
                p.x = nextX;
              } else {
                p.vx = 0;
              }
            }

            // Appliquer mouvement vertical avec collision
            const nextY = p.y + p.vy * dt;
            const curCol = Math.round(p.x);
            if (p.vy > 0) {
              const footRow = Math.floor(nextY + 0.92);
              if (footRow >= WORLD_ROWS || isSolid(curCol, footRow)) {
                // Dégâts de chute rapide uniquement en 3e année
                if (gradeRef.current === '3e' && p.vy > 8.6) {
                  const fallDmg = Math.round((p.vy - 8.2) * 8);
                  p.hull = Math.max(0, p.hull - fallDmg);
                  addFloatingText(p.x, p.y - 0.3, `💥 Choc -${fallDmg} PV`, '#FB7185');
                  if (p.hull <= 0) {
                    rescueToSurface('🛡️ Coque brisée par la chute !');
                  }
                }
                p.y = footRow - 1;
                p.vy = 0;
              } else {
                p.y = nextY;
              }
            } else if (p.vy < 0) {
              const headRow = Math.floor(nextY + 0.08);
              if (nextY < 0.2) {
                p.y = 0.2;
                p.vy = 0;
              } else if (headRow >= 0 && isSolid(curCol, headRow)) {
                p.y = headRow + 1;
                p.vy = 0;
              } else {
                p.y = nextY;
              }
            }
          }

          // Recharge douce et vente auto quand on passe en surface si essence vide
          if (p.fuel <= 0 && p.y > SURFACE_ROW + 0.2) {
            rescueToSurface('⛽ Panne d’essence !');
          }
        }

        // Mise à jour particules & textes flottants
        particlesRef.current = particlesRef.current.filter((pt) => {
          pt.life += dt;
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.vy += 260 * dt;
          return pt.life < pt.maxLife;
        });

        textsRef.current = textsRef.current.filter((ft) => {
          ft.age += dt;
          ft.y -= 1.1 * dt;
          return ft.age < 1.25;
        });
      }

      // 3. Rendu Canvas 60 FPS
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const camX = Math.max(
          0,
          Math.min(
            WORLD_COLS * TILE_SIZE - CANVAS_W,
            (p.x + 0.5) * TILE_SIZE - CANVAS_W / 2
          )
        );
        const camY = Math.max(
          0,
          Math.min(
            WORLD_ROWS * TILE_SIZE - CANVAS_H,
            (p.y + 0.5) * TILE_SIZE - CANVAS_H * 0.45
          )
        );

        // Fond ciel martien / sous-sol sombre
        const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        skyGrad.addColorStop(0, '#1E1B4B');
        skyGrad.addColorStop(0.5, '#7C2D12');
        skyGrad.addColorStop(1, '#29150E');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.save();
        ctx.translate(-camX, -camY);

        // Ciel + étoiles + 3 bâtiments en surface
        const surfaceY = (SURFACE_ROW + 1) * TILE_SIZE;
        if (camY < surfaceY + 40) {
          const topSky = ctx.createLinearGradient(0, 0, 0, surfaceY);
          topSky.addColorStop(0, '#1E1B4B');
          topSky.addColorStop(0.55, '#9A3412');
          topSky.addColorStop(1, '#FDBA74');
          ctx.fillStyle = topSky;
          ctx.fillRect(0, 0, WORLD_COLS * TILE_SIZE, surfaceY);

          // Petites étoiles
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          for (let i = 0; i < 18; i++) {
            ctx.fillRect((i * 53 + 17) % (WORLD_COLS * TILE_SIZE), (i * 19 + 8) % 55, 2.5, 2.5);
          }

          // 3 Stations en surface
          const stations = [
            { col: 3, label: '⛽ ESSENCE', color: '#EF4444' },
            { col: 10, label: '💰 VENTE', color: '#F59E0B' },
            { col: 17, label: '🛠️ ATELIER', color: '#3B82F6' },
          ];
          stations.forEach((st) => {
            const sx = st.col * TILE_SIZE;
            const sy = surfaceY - 56;
            ctx.fillStyle = '#FFFBEB';
            ctx.fillRect(sx, sy + 14, 96, 42);
            ctx.fillStyle = st.color;
            ctx.fillRect(sx - 4, sy + 4, 104, 16);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 11px Nunito, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(st.label, sx + 48, sy + 16);
            ctx.fillStyle = '#334155';
            ctx.fillRect(sx + 38, sy + 32, 20, 24);
          });
        }

        // Tuiles visibles uniquement
        const startRow = Math.max(0, Math.floor(camY / TILE_SIZE));
        const endRow = Math.min(WORLD_ROWS - 1, Math.ceil((camY + CANVAS_H) / TILE_SIZE));
        const startCol = Math.max(0, Math.floor(camX / TILE_SIZE));
        const endCol = Math.min(WORLD_COLS - 1, Math.ceil((camX + CANVAS_W) / TILE_SIZE));

        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            const tile = world[r][c];
            const tx = c * TILE_SIZE;
            const ty = r * TILE_SIZE;

            if (tile === 'empty') {
              if (r > SURFACE_ROW) {
                ctx.fillStyle = '#2B1710';
                ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
              }
              continue;
            }

            // Couleur de fond du bloc selon profondeur
            if (tile === 'boulder') {
              ctx.fillStyle = '#475569';
              ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#64748B';
              ctx.beginPath();
              ctx.roundRect(tx + 4, ty + 4, TILE_SIZE - 8, TILE_SIZE - 8, 8);
              ctx.fill();
              continue;
            }

            if (tile === 'lava') {
              ctx.fillStyle = '#EA580C';
              ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#FACC15';
              ctx.beginPath();
              ctx.arc(tx + 14, ty + 18, 6, 0, Math.PI * 2);
              ctx.arc(tx + 28, ty + 26, 5, 0, Math.PI * 2);
              ctx.fill();
              continue;
            }

            // Terre / roche de base
            const baseColor =
              r < 28 ? '#B45309' : r < 65 ? '#9A3412' : r < 105 ? '#572416' : '#3B1528';
            ctx.fillStyle = baseColor;
            ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = 'rgba(0,0,0,0.16)';
            ctx.strokeRect(tx + 0.5, ty + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

            if (isMineral(tile)) {
              const def = MINERALS[tile];
              ctx.fillStyle = def.color;
              ctx.beginPath();
              ctx.roundRect(tx + 8, ty + 8, TILE_SIZE - 16, TILE_SIZE - 16, 7);
              ctx.fill();
              ctx.fillStyle = def.sparkle;
              ctx.beginPath();
              ctx.arc(tx + 16, ty + 15, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Foreuse du joueur
        const px = p.x * TILE_SIZE;
        const py = p.y * TILE_SIZE;

        // Corps métallique
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.roundRect(px + 5, py + 6, TILE_SIZE - 10, TILE_SIZE - 14, 8);
        ctx.fill();
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cockpit vitré
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.roundRect(px + 10, py + 10, TILE_SIZE - 20, 12, 5);
        ctx.fill();

        // Chenilles
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.roundRect(px + 4, py + TILE_SIZE - 10, TILE_SIZE - 8, 8, 4);
        ctx.fill();

        // Mèche de foreuse animée
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        if (drillRef.current && drillRef.current.targetRow > drillRef.current.fromY) {
          ctx.moveTo(px + 13, py + TILE_SIZE - 2);
          ctx.lineTo(px + 27, py + TILE_SIZE - 2);
          ctx.lineTo(px + 20, py + TILE_SIZE + 8);
        } else if (p.facing === 1) {
          ctx.moveTo(px + TILE_SIZE - 4, py + 14);
          ctx.lineTo(px + TILE_SIZE - 4, py + 26);
          ctx.lineTo(px + TILE_SIZE + 5, py + 20);
        } else {
          ctx.moveTo(px + 4, py + 14);
          ctx.lineTo(px + 4, py + 26);
          ctx.lineTo(px - 5, py + 20);
        }
        ctx.closePath();
        ctx.fill();

        // Particules
        for (const pt of particlesRef.current) {
          ctx.globalAlpha = 1 - pt.life / pt.maxLife;
          ctx.fillStyle = pt.color;
          ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
        }
        ctx.globalAlpha = 1;

        // Textes flottants (+250$ Or !)
        ctx.font = 'bold 13px Fredoka, Nunito, sans-serif';
        ctx.textAlign = 'center';
        for (const ft of textsRef.current) {
          ctx.globalAlpha = Math.max(0, 1 - ft.age / 1.25);
          ctx.fillStyle = '#0F172A';
          ctx.fillText(ft.text, (ft.x + 0.5) * TILE_SIZE + 1, ft.y * TILE_SIZE + 1);
          ctx.fillStyle = ft.color;
          ctx.fillText(ft.text, (ft.x + 0.5) * TILE_SIZE, ft.y * TILE_SIZE);
        }
        ctx.globalAlpha = 1;

        ctx.restore();
      }

      hudTimer += dt;
      if (hudTimer >= 0.12) {
        hudTimer = 0;
        syncHudAndSave(false);
      }
      saveTimer += dt;
      if (saveTimer >= 4) {
        saveTimer = 0;
        saveMotherload({ world: worldRef.current, player: playerRef.current });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      saveMotherload({ world: worldRef.current, player: playerRef.current });
    };
  }, [addFloatingText, playClick, playGameOver, playMerge, playWin, showBanner, spawnParticles, syncHudAndSave]);

  const stats = getStats(hudPlayer.upgrades, grade);
  const depthMeters = Math.max(0, Math.round((hudPlayer.y - SURFACE_ROW) * METERS_PER_ROW));
  const atSurface = hudPlayer.y <= SURFACE_ROW + 0.35;
  const cargoCount = getCargoCount(hudPlayer.cargo);
  const cargoVal = getCargoValue(hudPlayer.cargo);

  const fuelPct = Math.round((hudPlayer.fuel / stats.maxFuel) * 100);
  const hullPct = Math.round((hudPlayer.hull / stats.maxHull) * 100);

  const bindDir = (dir: 'left' | 'right' | 'up' | 'down') => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      keysRef.current[dir] = true;
    },
    onPointerUp: () => {
      keysRef.current[dir] = false;
    },
    onPointerLeave: () => {
      keysRef.current[dir] = false;
    },
    onPointerCancel: () => {
      keysRef.current[dir] = false;
    },
  });

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      {/* En-tête */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            ⛏️ Mini-Motherload
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Creuse sur Mars, vends tes minerais en surface et trouve le Coffre du Noyau !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
          <button
            type="button"
            onClick={() => {
              playClick();
              setConfirmReset(true);
            }}
            title="Nouvelle mine"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-900 border-2 border-amber-200 hover:bg-amber-50 active:scale-95 transition"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* HUD : Profondeur, Argent, Essence, Soute, Coque */}
      <div className="grid w-full grid-cols-2 sm:grid-cols-5 gap-2 rounded-2xl bg-slate-900 p-2.5 text-white shadow-md border-2 border-amber-500/40">
        <div className="flex flex-col items-center rounded-xl bg-white/10 px-2 py-1">
          <span className="text-[10px] font-bold uppercase text-amber-200/80">Profondeur</span>
          <span className="font-display text-base font-bold">{depthMeters} m</span>
        </div>

        <div className="flex flex-col items-center rounded-xl bg-white/10 px-2 py-1">
          <span className="text-[10px] font-bold uppercase text-amber-200/80">Argent</span>
          <span className="font-display text-base font-bold text-amber-300">{hudPlayer.money} $</span>
        </div>

        <div className="flex flex-col justify-center rounded-xl bg-white/10 px-2.5 py-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span>⛽ Essence</span>
            <span>{fuelPct}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
              style={{ width: `${fuelPct}%` }}
              className={`h-full rounded-full ${fuelPct < 25 ? 'bg-rose-500' : 'bg-amber-400'}`}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-xl bg-white/10 px-2.5 py-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span>📦 Soute</span>
            <span>
              {cargoCount}/{stats.maxCargo}
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
              style={{ width: `${Math.min(100, (cargoCount / stats.maxCargo) * 100)}%` }}
              className="h-full rounded-full bg-cyan-400"
            />
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 flex flex-col justify-center rounded-xl bg-white/10 px-2.5 py-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span>🛡️ Coque</span>
            <span>{hullPct}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
              style={{ width: `${hullPct}%` }}
              className={`h-full rounded-full ${hullPct < 30 ? 'bg-rose-500' : 'bg-emerald-400'}`}
            />
          </div>
        </div>
      </div>

      {/* Canvas 60 FPS */}
      <div className="relative w-full overflow-hidden rounded-3xl border-4 border-amber-900/80 shadow-xl bg-slate-950">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block w-full h-auto aspect-[560/380]"
        />

        {bannerMsg && (
          <div className="pointer-events-none absolute top-3 inset-x-3 flex justify-center">
            <span className="rounded-2xl bg-slate-900/90 px-4 py-1.5 font-display text-sm font-bold text-amber-200 border border-amber-400/50 shadow-lg">
              {bannerMsg}
            </span>
          </div>
        )}
      </div>

      {/* Boutons d'action de surface + Téléporteur */}
      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          disabled={!atSurface}
          onClick={handleRefuel}
          className="flex h-11 items-center gap-1.5 rounded-2xl bg-rose-500 px-3.5 font-display text-sm font-bold text-white shadow-sm hover:brightness-105 disabled:opacity-40 active:scale-95 transition"
        >
          <Fuel className="h-4 w-4" />
          Plein
        </button>

        <button
          type="button"
          disabled={!atSurface || cargoCount === 0}
          onClick={handleSellCargo}
          className="flex h-11 items-center gap-1.5 rounded-2xl bg-amber-400 px-3.5 font-display text-sm font-bold text-amber-950 shadow-sm hover:brightness-105 disabled:opacity-40 active:scale-95 transition"
        >
          <Coins className="h-4 w-4" />
          Vendre {cargoVal > 0 ? `(+${cargoVal}$)` : ''}
        </button>

        <button
          type="button"
          disabled={!atSurface}
          onClick={() => {
            playClick();
            setIsShopOpen(true);
          }}
          className="flex h-11 items-center gap-1.5 rounded-2xl bg-sky-500 px-3.5 font-display text-sm font-bold text-white shadow-sm hover:brightness-105 disabled:opacity-40 active:scale-95 transition"
        >
          <Wrench className="h-4 w-4" />
          Atelier
        </button>

        <button
          type="button"
          disabled={atSurface || hudPlayer.teleporters <= 0}
          onClick={handleTeleport}
          className="flex h-11 items-center gap-1.5 rounded-2xl bg-purple-500 px-3.5 font-display text-sm font-bold text-white shadow-sm hover:brightness-105 disabled:opacity-40 active:scale-95 transition"
        >
          <Sparkles className="h-4 w-4" />
          Téléport ({hudPlayer.teleporters})
        </button>
      </div>

      {/* Contrôles tactiles Tablette (D-Pad confortable) */}
      <div
        style={{ touchAction: 'none' }}
        className="flex w-full items-center justify-between gap-4 rounded-3xl bg-white px-5 py-3 shadow-sm border-2 border-amber-200 select-none"
      >
        {/* Gauche / Droite */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Gauche"
            {...bindDir('left')}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-950 border-b-4 border-amber-300 active:bg-amber-300 active:scale-95 transition"
          >
            <ArrowLeft className="h-8 w-8" />
          </button>
          <button
            type="button"
            aria-label="Droite"
            {...bindDir('right')}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-950 border-b-4 border-amber-300 active:bg-amber-300 active:scale-95 transition"
          >
            <ArrowRight className="h-8 w-8" />
          </button>
        </div>

        <p className="hidden sm:block text-xs font-bold text-amber-900/55 text-center">
          Maintiens ▲ pour voler · ▼ ◀ ▶ pour creuser
        </p>

        {/* Creuser (Bas) / Voler (Haut) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Creuser vers le bas"
            {...bindDir('down')}
            className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-orange-400 text-white border-b-4 border-orange-600 active:bg-orange-500 active:scale-95 transition"
          >
            <ArrowDown className="h-7 w-7" />
            <span className="text-[10px] font-extrabold leading-none">Creuser</span>
          </button>
          <button
            type="button"
            aria-label="Voler vers le haut"
            {...bindDir('up')}
            className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-sky-500 text-white border-b-4 border-sky-700 active:bg-sky-600 active:scale-95 transition"
          >
            <ArrowUp className="h-7 w-7" />
            <span className="text-[10px] font-extrabold leading-none">Voler</span>
          </button>
        </div>
      </div>

      {/* Modale Atelier */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        player={hudPlayer}
        grade={grade}
        onBuyUpgrade={handleBuyUpgrade}
        onRepairHull={handleRepairHull}
        onBuyTeleporter={handleBuyTeleporter}
      />

      {/* Confirmation nouvelle mine */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl border-4 border-amber-300">
            <span className="text-4xl">🪐</span>
            <h3 className="mt-2 font-display text-2xl font-bold text-amber-950">
              Nouvelle planète ?
            </h3>
            <p className="mt-1 text-sm font-semibold text-amber-900/75">
              Ta mine actuelle et tes améliorations repartiront à zéro.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="h-11 flex-1 rounded-2xl bg-stone-100 font-display font-bold text-stone-700"
              >
                Non
              </button>
              <button
                type="button"
                onClick={handleResetMine}
                className="h-11 flex-1 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 font-display font-bold text-white"
              >
                Oui !
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameMotherload;
