import type { GradeLevel } from '../../context/GradeContext';
import { getWordsForGrade, normalizeLetter } from '../game-hangman/words';

export interface WordPlacement {
  word: string;
  displayWord: string;
  emoji: string;
  cells: Array<{ row: number; col: number }>;
  colorIndex: number;
}

export interface WordSearchPuzzle {
  size: number;
  grid: string[][];
  words: WordPlacement[];
}

const FILL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUV';

const DIRECTIONS_1RE: Array<[number, number]> = [
  [0, 1], // Droite
  [1, 0], // Bas
];

const DIRECTIONS_3E: Array<[number, number]> = [
  [0, 1], // Droite
  [1, 0], // Bas
  [1, 1], // Diagonale bas-droite
  [-1, 1], // Diagonale haut-droite
];

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateWordSearch(grade: GradeLevel): WordSearchPuzzle {
  const size = grade === '1re' ? 6 : 9;
  const targetCount = grade === '1re' ? 5 : 7;
  const dirs = grade === '1re' ? DIRECTIONS_1RE : DIRECTIONS_3E;

  const pool = shuffle(
    getWordsForGrade(grade)
      .map((entry) => ({
        word: normalizeLetter(entry.word),
        displayWord: entry.word,
        emoji: entry.emoji,
      }))
      .filter((w) => w.word.length >= 3 && w.word.length <= size)
  );

  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placed: WordPlacement[] = [];

  for (const item of pool) {
    if (placed.length >= targetCount) break;
    let success = false;

    for (let attempt = 0; attempt < 80 && !success; attempt++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);

      const endRow = row + dr * (item.word.length - 1);
      const endCol = col + dc * (item.word.length - 1);
      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

      let fits = true;
      const cells: Array<{ row: number; col: number }> = [];
      for (let i = 0; i < item.word.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        const existing = grid[r][c];
        if (existing !== '' && existing !== item.word[i]) {
          fits = false;
          break;
        }
        cells.push({ row: r, col: c });
      }

      if (fits) {
        cells.forEach(({ row: r, col: c }, idx) => {
          grid[r][c] = item.word[idx];
        });
        placed.push({
          word: item.word,
          displayWord: item.displayWord,
          emoji: item.emoji,
          cells,
          colorIndex: placed.length,
        });
        success = true;
      }
    }
  }

  // Remplir les cases vides avec des lettres aléatoires
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = FILL_LETTERS[Math.floor(Math.random() * FILL_LETTERS.length)];
      }
    }
  }

  return { size, grid, words: placed };
}

/** Retourne toutes les cellules d'une ligne droite (H/V/D) entre start et end, ou [] */
export function getLineCells(
  start: { row: number; col: number },
  end: { row: number; col: number }
): Array<{ row: number; col: number }> {
  const dr = end.row - start.row;
  const dc = end.col - start.col;
  const absR = Math.abs(dr);
  const absC = Math.abs(dc);

  if (absR !== 0 && absC !== 0 && absR !== absC) {
    return [];
  }

  const steps = Math.max(absR, absC);
  const stepR = steps === 0 ? 0 : dr / steps;
  const stepC = steps === 0 ? 0 : dc / steps;

  const cells: Array<{ row: number; col: number }> = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({
      row: start.row + stepR * i,
      col: start.col + stepC * i,
    });
  }
  return cells;
}
