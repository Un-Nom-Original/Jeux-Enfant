import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Shuffle } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { chooseAiShot, generateBattleshipBoard, type BattleshipBoard } from './engine';

export function GameBattleship() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin, playGameOver } = useSound();

  const [enemyBoard, setEnemyBoard] = useState<BattleshipBoard>(() =>
    generateBattleshipBoard(grade)
  );
  const [playerBoard, setPlayerBoard] = useState<BattleshipBoard>(() =>
    generateBattleshipBoard(grade)
  );
  const [playerShots, setPlayerShots] = useState<Set<string>>(() => new Set());
  const [aiShots, setAiShots] = useState<Set<string>>(() => new Set());
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [lastMsg, setLastMsg] = useState<string>(
    '🎯 À toi ! Touche une case de la flotte ennemie !'
  );

  const reset = useCallback(
    (nextGrade = grade) => {
      setEnemyBoard(generateBattleshipBoard(nextGrade));
      setPlayerBoard(generateBattleshipBoard(nextGrade));
      setPlayerShots(new Set());
      setAiShots(new Set());
      setIsAiTurn(false);
      setWinner(null);
      setLastMsg('🎯 À toi ! Touche une case de la flotte ennemie !');
    },
    [grade]
  );

  useEffect(() => {
    reset(grade);
  }, [grade, reset]);

  const buildShipMap = (b: BattleshipBoard) => {
    const map = new Map<string, number>();
    b.ships.forEach((s) => s.cells.forEach((c) => map.set(`${c.row},${c.col}`, s.id)));
    return map;
  };

  const enemyShipMap = buildShipMap(enemyBoard);
  const playerShipMap = buildShipMap(playerBoard);

  const enemySunkIds = new Set(
    enemyBoard.ships
      .filter((s) => s.cells.every((c) => playerShots.has(`${c.row},${c.col}`)))
      .map((s) => s.id)
  );
  const playerSunkIds = new Set(
    playerBoard.ships
      .filter((s) => s.cells.every((c) => aiShots.has(`${c.row},${c.col}`)))
      .map((s) => s.id)
  );

  // Tour de l'ordinateur sur la grille du joueur
  useEffect(() => {
    if (!isAiTurn || winner) return;
    const timer = window.setTimeout(() => {
      const target = chooseAiShot(playerBoard, aiShots, grade === '3e');
      if (!target) {
        setIsAiTurn(false);
        return;
      }

      const key = `${target.row},${target.col}`;
      const nextAiShots = new Set(aiShots);
      nextAiShots.add(key);
      setAiShots(nextAiShots);

      const hitId = playerShipMap.get(key);
      if (hitId !== undefined) {
        const ship = playerBoard.ships.find((s) => s.id === hitId)!;
        const nowSunk = ship.cells.every((c) => nextAiShots.has(`${c.row},${c.col}`));
        const allPlayerSunk = playerBoard.ships.every((s) =>
          s.cells.every((c) => nextAiShots.has(`${c.row},${c.col}`))
        );

        if (allPlayerSunk) {
          setWinner('ai');
          setLastMsg('🌊 L’ordinateur a coulé toute ta flotte ! Revanche ?');
          playGameOver();
        } else if (nowSunk) {
          setLastMsg(`💥 L’ordi a coulé ton ${ship.name} ! À toi de riposter !`);
          playGameOver();
        } else {
          setLastMsg('💥 L’ordi a touché un de tes bateaux ! À toi !');
          playClick();
        }
      } else {
        setLastMsg('💧 L’ordi a tiré dans l’eau ! À toi de jouer !');
      }

      setIsAiTurn(false);
    }, 580);

    return () => window.clearTimeout(timer);
  }, [aiShots, grade, isAiTurn, playClick, playGameOver, playerBoard, playerShipMap, winner]);

  const handlePlayerFire = (row: number, col: number) => {
    const key = `${row},${col}`;
    if (playerShots.has(key) || isAiTurn || winner) return;

    const nextShots = new Set(playerShots);
    nextShots.add(key);
    setPlayerShots(nextShots);

    const hitId = enemyShipMap.get(key);
    if (hitId !== undefined) {
      const ship = enemyBoard.ships.find((s) => s.id === hitId)!;
      const nowSunk = ship.cells.every((c) => nextShots.has(`${c.row},${c.col}`));
      const allEnemySunk = enemyBoard.ships.every((s) =>
        s.cells.every((c) => nextShots.has(`${c.row},${c.col}`))
      );

      if (allEnemySunk) {
        setWinner('player');
        setLastMsg(`🎉 VICTOIRE ! Flotte ennemie coulée en ${nextShots.size} tirs !`);
        playWin();
        try {
          confetti({ particleCount: 95, spread: 80, origin: { y: 0.55 } });
        } catch {
          // Ignore confetti
        }
        return;
      }
      if (nowSunk) {
        setLastMsg(`🚢 Coulé ! Tu as coulé son ${ship.name} ! Tour de l’ordi...`);
        playMerge(256);
      } else {
        setLastMsg('💥 Touché ! Tour de l’ordinateur...');
        playMerge(64);
      }
    } else {
      setLastMsg('💧 Plouf ! Tour de l’ordinateur...');
      playClick();
    }

    setIsAiTurn(true);
  };

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-3.5">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🎯 Bataille Navale
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Coule les bateaux ennemis avant que l'ordinateur ne trouve les tiens !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
          {playerShots.size === 0 && (
            <button
              type="button"
              onClick={() => {
                playClick();
                setPlayerBoard(generateBattleshipBoard(grade));
              }}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-sky-100 px-3 text-xs font-extrabold text-sky-900 hover:bg-sky-200 active:scale-95 transition"
              title="Déplacer mes bateaux"
            >
              <Shuffle className="h-4 w-4" />
              Placer ma flotte
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              playClick();
              reset(grade);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-950 hover:bg-amber-200 active:scale-95 transition"
            aria-label="Nouvelle partie"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bandeau de statut */}
      <div
        className={`rounded-2xl px-4 py-2 text-sm font-extrabold border-2 text-center ${
          winner === 'player'
            ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
            : winner === 'ai'
            ? 'bg-rose-100 border-rose-300 text-rose-950'
            : 'bg-sky-50 border-sky-200 text-sky-950'
        }`}
      >
        {lastMsg}
      </div>

      {/* Les 2 grilles côte à côte : Flotte ennemie (cible) + Ma flotte (défense) */}
      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Grille 1 : Flotte ennemie */}
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-white p-3.5 shadow-md border-2 border-sky-200">
          <div className="flex w-full items-center justify-between px-1">
            <span className="font-display text-base font-bold text-sky-950">
              🎯 Flotte ennemie (tire ici !)
            </span>
            <span className="text-xs font-extrabold text-sky-700">
              {enemySunkIds.size}/{enemyBoard.ships.length} coulés
            </span>
          </div>

          <div
            style={{
              gridTemplateColumns: `repeat(${enemyBoard.size}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${enemyBoard.size}, minmax(0, 1fr))`,
            }}
            className="grid aspect-square w-full max-w-[340px] gap-1 rounded-2xl bg-sky-600 p-2 border-4 border-sky-800 select-none"
          >
            {Array.from({ length: enemyBoard.size * enemyBoard.size }, (_, idx) => {
              const r = Math.floor(idx / enemyBoard.size);
              const c = idx % enemyBoard.size;
              const key = `${r},${c}`;
              const fired = playerShots.has(key);
              const shipId = enemyShipMap.get(key);
              const isHit = fired && shipId !== undefined;
              const isSunk = shipId !== undefined && enemySunkIds.has(shipId);

              return (
                <button
                  key={key}
                  type="button"
                  disabled={fired || isAiTurn || Boolean(winner)}
                  onClick={() => handlePlayerFire(r, c)}
                  className={`relative h-full w-full min-h-0 min-w-0 overflow-hidden flex items-center justify-center rounded-lg font-display transition active:scale-90 ${
                    enemyBoard.size === 6 ? 'text-xl' : 'text-base'
                  } ${
                    isSunk
                      ? 'bg-emerald-400 text-white'
                      : isHit
                      ? 'bg-rose-500 text-white'
                      : fired
                      ? 'bg-sky-800/60 text-sky-200'
                      : 'bg-sky-300 hover:bg-sky-200 cursor-pointer'
                  }`}
                >
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center leading-none">
                    {isSunk ? '🚢' : isHit ? '💥' : fired ? '💧' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille 2 : Ma Flotte (l'ordinateur tire ici) */}
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-white p-3.5 shadow-md border-2 border-amber-200">
          <div className="flex w-full items-center justify-between px-1">
            <span className="font-display text-base font-bold text-amber-950">
              🛡️ Ma Flotte (tirs de l'ordi)
            </span>
            <span className="text-xs font-extrabold text-amber-700">
              {playerBoard.ships.length - playerSunkIds.size}/{playerBoard.ships.length} en vie
            </span>
          </div>

          <div
            style={{
              gridTemplateColumns: `repeat(${playerBoard.size}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${playerBoard.size}, minmax(0, 1fr))`,
            }}
            className="grid aspect-square w-full max-w-[340px] gap-1 rounded-2xl bg-slate-700 p-2 border-4 border-slate-800 select-none"
          >
            {Array.from({ length: playerBoard.size * playerBoard.size }, (_, idx) => {
              const r = Math.floor(idx / playerBoard.size);
              const c = idx % playerBoard.size;
              const key = `${r},${c}`;
              const fired = aiShots.has(key);
              const shipId = playerShipMap.get(key);
              const hasShip = shipId !== undefined;
              const isSunk = hasShip && playerSunkIds.has(shipId);

              return (
                <div
                  key={key}
                  className={`relative h-full w-full min-h-0 min-w-0 overflow-hidden flex items-center justify-center rounded-lg font-display ${
                    playerBoard.size === 6 ? 'text-xl' : 'text-base'
                  } ${
                    isSunk
                      ? 'bg-rose-700 text-white'
                      : fired && hasShip
                      ? 'bg-rose-500 text-white'
                      : hasShip
                      ? 'bg-amber-300 text-amber-950'
                      : fired
                      ? 'bg-slate-800/80 text-sky-300'
                      : 'bg-sky-900/70'
                  }`}
                >
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center leading-none">
                    {fired && hasShip ? '💥' : hasShip ? '🚢' : fired ? '💧' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {winner && (
        <button
          type="button"
          onClick={() => {
            playClick();
            reset(grade);
          }}
          className="h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 font-display text-lg font-bold text-white shadow-md active:scale-95 transition"
        >
          Rejouer une bataille
        </button>
      )}
    </div>
  );
}

export default GameBattleship;
