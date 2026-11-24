import type { GradeLevel } from '../../context/GradeContext';

export interface SudokuPuzzle {
  size: 4 | 6;
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

const PUZZLES_4X4: SudokuPuzzle[] = [
  {
    size: 4,
    boxRows: 2,
    boxCols: 2,
    initial: [
      [1, 0, 3, 0],
      [0, 4, 0, 2],
      [2, 0, 4, 0],
      [0, 3, 0, 1],
    ],
    solution: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1],
    ],
  },
  {
    size: 4,
    boxRows: 2,
    boxCols: 2,
    initial: [
      [0, 2, 0, 4],
      [3, 0, 1, 0],
      [0, 1, 0, 3],
      [4, 0, 2, 0],
    ],
    solution: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1],
    ],
  },
  {
    size: 4,
    boxRows: 2,
    boxCols: 2,
    initial: [
      [2, 0, 0, 3],
      [0, 3, 2, 0],
      [0, 2, 3, 0],
      [3, 0, 0, 2],
    ],
    solution: [
      [2, 1, 4, 3],
      [4, 3, 2, 1],
      [1, 2, 3, 4],
      [3, 4, 1, 2],
    ],
  },
];

const PUZZLES_6X6: SudokuPuzzle[] = [
  {
    size: 6,
    boxRows: 2,
    boxCols: 3,
    initial: [
      [1, 0, 3, 0, 5, 0],
      [0, 5, 0, 1, 0, 3],
      [2, 0, 1, 0, 6, 0],
      [0, 6, 0, 2, 0, 1],
      [3, 0, 2, 0, 4, 0],
      [0, 4, 0, 3, 0, 2],
    ],
    solution: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 5, 6, 4],
      [5, 6, 4, 2, 3, 1],
      [3, 1, 2, 6, 4, 5],
      [6, 4, 5, 3, 1, 2],
    ],
  },
  {
    size: 6,
    boxRows: 2,
    boxCols: 3,
    initial: [
      [0, 2, 0, 4, 0, 6],
      [4, 0, 6, 0, 2, 0],
      [0, 3, 0, 5, 0, 4],
      [5, 0, 4, 0, 3, 0],
      [0, 1, 0, 6, 0, 5],
      [6, 0, 5, 0, 1, 0],
    ],
    solution: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 5, 6, 4],
      [5, 6, 4, 2, 3, 1],
      [3, 1, 2, 6, 4, 5],
      [6, 4, 5, 3, 1, 2],
    ],
  },
];

export function getSudokuPuzzles(grade: GradeLevel): SudokuPuzzle[] {
  return grade === '1re' ? PUZZLES_4X4 : PUZZLES_6X6;
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
