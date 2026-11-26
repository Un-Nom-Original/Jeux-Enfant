import type { GradeLevel } from '../../context/GradeContext';

export interface MazePuzzle {
  size: number;
  /** 1 = mur, 0 = chemin */
  grid: number[][];
  start: { row: number; col: number };
  goal: { row: number; col: number };
}

/**
 * Génère un labyrinthe parfait (taille impaire 9x9 ou 13x13) via DFS aléatoire,
 * garantissant toujours un chemin unique entre start (1,1) et goal (size-2, size-2).
 */
export function generateMaze(grade: GradeLevel): MazePuzzle {
  const size = grade === '1re' ? 9 : 13;
  const grid: number[][] = Array.from({ length: size }, () => Array<number>(size).fill(1));

  const carve = (r: number, c: number) => {
    grid[r][c] = 0;
    const dirs: Array<[number, number]> = [
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2],
    ];
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < size - 1 && nc > 0 && nc < size - 1 && grid[nr][nc] === 1) {
        grid[r + dr / 2][c + dc / 2] = 0;
        carve(nr, nc);
      }
    }
  };

  carve(1, 1);

  return {
    size,
    grid,
    start: { row: 1, col: 1 },
    goal: { row: size - 2, col: size - 2 },
  };
}
