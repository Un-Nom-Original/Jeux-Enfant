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
