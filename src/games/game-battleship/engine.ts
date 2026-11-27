import type { GradeLevel } from '../../context/GradeContext';

export interface Ship {
  id: number;
  name: string;
  cells: Array<{ row: number; col: number }>;
}

export interface BattleshipBoard {
  size: number;
  ships: Ship[];
}

export function generateBattleshipBoard(grade: GradeLevel): BattleshipBoard {
  const size = grade === '1re' ? 6 : 8;
  const specs =
    grade === '1re'
      ? [
          { name: 'Sous-marin', len: 2 },
          { name: 'Croiseur', len: 3 },
          { name: 'Porte-avions', len: 4 },
        ]
      : [
          { name: 'Vedette', len: 2 },
          { name: 'Sous-marin', len: 3 },
          { name: 'Croiseur', len: 3 },
          { name: 'Porte-avions', len: 4 },
        ];

  const occupied = new Set<string>();
  const ships: Ship[] = [];

  specs.forEach((spec, idx) => {
    let placed = false;
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const horiz = Math.random() < 0.5;
      const row = Math.floor(Math.random() * (horiz ? size : size - spec.len + 1));
      const col = Math.floor(Math.random() * (horiz ? size - spec.len + 1 : size));
      const cells: Array<{ row: number; col: number }> = [];
      let clash = false;

      for (let i = 0; i < spec.len; i++) {
        const r = row + (horiz ? 0 : i);
        const c = col + (horiz ? i : 0);
        if (occupied.has(`${r},${c}`)) {
          clash = true;
          break;
        }
        cells.push({ row: r, col: c });
      }

      if (!clash) {
        cells.forEach((p) => occupied.add(`${p.row},${p.col}`));
        ships.push({ id: idx + 1, name: spec.name, cells });
        placed = true;
      }
    }
  });

  return { size, ships };
}

/**
 * Choisit une case cible pour l'ordinateur sur la grille du joueur.
 * En mode malin (3e année), cible autour des cases déjà touchées mais non coulées !
 */
export function chooseAiShot(
  playerBoard: BattleshipBoard,
  aiShots: Set<string>,
  smart: boolean
): { row: number; col: number } | null {
  const { size, ships } = playerBoard;

  if (smart) {
    // Cherche une case touchée d'un bateau pas encore coulé
    const shipCellMap = new Map<string, Ship>();
    ships.forEach((s) => s.cells.forEach((c) => shipCellMap.set(`${c.row},${c.col}`, s)));

    const priorityTargets: Array<{ row: number; col: number }> = [];
    for (const key of aiShots) {
      const ship = shipCellMap.get(key);
      if (!ship) continue;
      const isSunk = ship.cells.every((c) => aiShots.has(`${c.row},${c.col}`));
      if (isSunk) continue;

      const [r, c] = key.split(',').map(Number);
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && !aiShots.has(`${nr},${nc}`)) {
          priorityTargets.push({ row: nr, col: nc });
        }
      }
    }

    if (priorityTargets.length > 0) {
      return priorityTargets[Math.floor(Math.random() * priorityTargets.length)];
    }
  }

  const available: Array<{ row: number; col: number }> = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!aiShots.has(`${r},${c}`)) {
        available.push({ row: r, col: c });
      }
    }
  }
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
