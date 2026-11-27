import type { GradeLevel } from '../../context/GradeContext';

export type SudokuSize = 4 | 6 | 9 | 12;

export interface SudokuPuzzle {
  size: SudokuSize;
  boxRows: number;
  boxCols: number;
  /** 0 = case vide */
  initial: number[][];
  solution: number[][];
}

export const SUDOKU_4X4_ANIMALS: Record<number, string> = {
  1: '🐶',
  2: '🐱',
  3: '🐰',
  4: '🦊',
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Génère une solution Sudoku 100% valide pour toute taille N = boxRows * boxCols
 * (4x4 = 2x2, 6x6 = 2x3, 9x9 = 3x3, 12x12 = 3x4) en utilisant une formule
 * modulaire canonique + permutations aléatoires des symboles, bandes et lignes.
 */
function buildValidSolution(boxRows: number, boxCols: number): number[][] {
  const n = boxRows * boxCols;
  const symbols = shuffle(Array.from({ length: n }, (_, i) => i + 1));

  // Grille canonique valide : pattern(r, c) = (boxCols * (r % boxRows) + floor(r / boxRows) + c) % n
  const rowBands = shuffle(Array.from({ length: boxCols }, (_, i) => i));
  const colBands = shuffle(Array.from({ length: boxRows }, (_, i) => i));

  const rowOrder: number[] = [];
  for (const band of rowBands) {
    const inner = shuffle(Array.from({ length: boxRows }, (_, i) => band * boxRows + i));
    rowOrder.push(...inner);
  }

  const colOrder: number[] = [];
  for (const band of colBands) {
    const inner = shuffle(Array.from({ length: boxCols }, (_, i) => band * boxCols + i));
    colOrder.push(...inner);
  }

  return rowOrder.map((r) =>
    colOrder.map((c) => {
      const idx = (boxCols * (r % boxRows) + Math.floor(r / boxRows) + c) % n;
      return symbols[idx];
    })
  );
}

export function generateSudokuPuzzle(size: SudokuSize): SudokuPuzzle {
  const dims: Record<SudokuSize, { boxRows: number; boxCols: number; emptyRatio: number }> = {
    4: { boxRows: 2, boxCols: 2, emptyRatio: 0.45 },
    6: { boxRows: 2, boxCols: 3, emptyRatio: 0.48 },
    9: { boxRows: 3, boxCols: 3, emptyRatio: 0.5 },
    12: { boxRows: 3, boxCols: 4, emptyRatio: 0.48 },
  };

  const { boxRows, boxCols, emptyRatio } = dims[size];
  const solution = buildValidSolution(boxRows, boxCols);
  const totalCells = size * size;
  const cellsToHide = Math.floor(totalCells * emptyRatio);

  const initial = solution.map((row) => [...row]);
  const indices = shuffle(Array.from({ length: totalCells }, (_, i) => i));
  for (let i = 0; i < cellsToHide; i++) {
    const idx = indices[i];
    const r = Math.floor(idx / size);
    const c = idx % size;
    initial[r][c] = 0;
  }

  return { size, boxRows, boxCols, initial, solution };
}

export function getSudokuPuzzles(grade: GradeLevel): SudokuPuzzle[] {
  return [generateSudokuPuzzle(grade === '1re' ? 4 : 6)];
}

export function hasConflict(
  board: number[][],
  row: number,
  col: number,
  boxRows: number,
  boxCols: number
): boolean {
  const val = board[row][col];
  if (val === 0) return false;
  const size = board.length;

  for (let i = 0; i < size; i++) {
    if (i !== col && board[row][i] === val) return true;
    if (i !== row && board[i][col] === val) return true;
  }

  const startR = Math.floor(row / boxRows) * boxRows;
  const startC = Math.floor(col / boxCols) * boxCols;
  for (let r = startR; r < startR + boxRows; r++) {
    for (let c = startC; c < startC + boxCols; c++) {
      if ((r !== row || c !== col) && board[r][c] === val) return true;
    }
  }
  return false;
}

export function isSudokuSolved(board: number[][], boxRows: number, boxCols: number): boolean {
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) return false;
      if (hasConflict(board, r, c, boxRows, boxCols)) return false;
    }
  }
  return true;
}
