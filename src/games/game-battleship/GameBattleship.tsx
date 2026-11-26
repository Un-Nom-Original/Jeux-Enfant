import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { generateBattleshipBoard, type BattleshipBoard } from './engine';

export function GameBattleship() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin } = useSound();

  const [board, setBoard] = useState<BattleshipBoard>(() => generateBattleshipBoard(grade));
  const [shots, setShots] = useState<Set<string>>(() => new Set());
  const [lastMsg, setLastMsg] = useState<string>('Touche une case de l’océan pour chercher les bateaux !');

  const reset = useCallback(
    (nextGrade = grade) => {
      setBoard(generateBattleshipBoard(nextGrade));
      setShots(new Set());
      setLastMsg('Touche une case de l’océan pour chercher les bateaux !');
    },
    [grade]
  );

  useEffect(() => {
    reset(grade);
  }, [grade, reset]);

  const shipCellMap = new Map<string, number>();
  board.ships.forEach((ship) => {
    ship.cells.forEach((c) => shipCellMap.set(`${c.row},${c.col}`, ship.id));
  });

  const sunkShipIds = new Set(
    board.ships
      .filter((ship) => ship.cells.every((c) => shots.has(`${c.row},${c.col}`)))
      .map((s) => s.id)
  );

  const allSunk = sunkShipIds.size === board.ships.length && board.ships.length > 0;

  const handleFire = (row: number, col: number) => {
    const key = `${row},${col}`;
    if (shots.has(key) || allSunk) return;

    const nextShots = new Set(shots);
    nextShots.add(key);
    setShots(nextShots);

    const hitShipId = shipCellMap.get(key);
    if (hitShipId !== undefined) {
      const ship = board.ships.find((s) => s.id === hitShipId)!;
      const nowSunk = ship.cells.every((c) => nextShots.has(`${c.row},${c.col}`));
      const nowAllSunk = board.ships.every((s) =>
        s.cells.every((c) => nextShots.has(`${c.row},${c.col}`))
      );

      if (nowAllSunk) {
        setLastMsg(`🎉 VICTOIRE ! Toute la flotte coulée en ${nextShots.size} tirs !`);
        playWin();
        try {
          confetti({ particleCount: 95, spread: 80, origin: { y: 0.55 } });
        } catch {
          // Ignore confetti
        }
      } else if (nowSunk) {
        setLastMsg(`🚢 Coulé ! Tu as coulé le ${ship.name} !`);
        playMerge(256);
      } else {
        setLastMsg('💥 Touché ! Continue tout autour !');
        playMerge(64);
      }
    } else {
      setLastMsg('💧 Plouf ! À l’eau...');
      playClick();
    }
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3.5">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🎯 Bataille Navale
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Trouve et coule tous les bateaux cachés dans l'océan !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
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

      {/* Statut flotte + tirs */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-xs border-2 border-sky-200">
        <div className="flex flex-wrap gap-1.5">
          {board.ships.map((s) => {
            const sunk = sunkShipIds.has(s.id);
            return (
              <span
                key={s.id}
                className={`rounded-xl px-2.5 py-1 text-xs font-extrabold ${
                  sunk
                    ? 'bg-emerald-100 text-emerald-800 line-through'
                    : 'bg-sky-100 text-sky-900'
                }`}
              >
                🚢 {s.name} ({s.cells.length})
              </span>
            );
          })}
        </div>
        <span className="font-display text-sm font-bold text-amber-900">
          Tirs : {shots.size}
        </span>
      </div>

      <p className="rounded-2xl bg-sky-50 px-4 py-1.5 text-sm font-extrabold text-sky-900 border border-sky-200 text-center">
        {lastMsg}
      </p>

      {/* Grille océan */}
      <div
        style={{
          gridTemplateColumns: `repeat(${board.size}, minmax(0, 1fr))`,
        }}
        className="grid aspect-square w-full max-w-[min(88vw,420px)] gap-1.5 rounded-3xl bg-sky-600 p-2.5 shadow-lg border-4 border-sky-800 select-none"
      >
        {Array.from({ length: board.size * board.size }, (_, idx) => {
          const r = Math.floor(idx / board.size);
          const c = idx % board.size;
          const key = `${r},${c}`;
          const fired = shots.has(key);
          const shipId = shipCellMap.get(key);
          const isHit = fired && shipId !== undefined;
          const isSunk = shipId !== undefined && sunkShipIds.has(shipId);

          return (
            <button
              key={key}
              type="button"
              disabled={fired || allSunk}
              onClick={() => handleFire(r, c)}
              className={`aspect-square flex items-center justify-center rounded-xl font-display transition active:scale-90 ${
                board.size === 6 ? 'text-2xl' : 'text-lg'
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
              {isSunk ? '🚢' : isHit ? '💥' : fired ? '💧' : ''}
            </button>
          );
        })}
      </div>

      {allSunk && (
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
