export const ROWS = 6;
export const COLS = 7;

export type Disc = 0 | 1 | 2;

export function createEmptyConnect4(): Disc[][] {
  return Array.from({ length: ROWS }, () => Array<Disc>(COLS).fill(0));
}

export function dropDisc(
  board: Disc[][],
  col: number,
  player: 1 | 2
): { board: Disc[][]; row: number } | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      const next = board.map((line) => [...line]);
      next[r][col] = player;
      return { board: next, row: r };
    }
  }
  return null;
}

export function findConnect4Winner(
  board: Disc[][]
): { winner: 1 | 2; cells: Array<[number, number]> } | null {
  const dirs: Array<[number, number]> = [
    [0, 1],
    [1, 0],
    [1, 1],
    [-1, 1],
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = board[r][c];
      if (player === 0) continue;

      for (const [dr, dc] of dirs) {
        const cells: Array<[number, number]> = [[r, c]];
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          if (board[nr][nc] !== player) break;
          cells.push([nr, nc]);
        }
        if (cells.length === 4) {
          return { winner: player, cells };
        }
      }
    }
  }
  return null;
}

export function isConnect4Draw(board: Disc[][]): boolean {
  return board[0].every((cell) => cell !== 0);
}

export function chooseConnect4AiCol(board: Disc[][], smart: boolean): number {
  const validCols = Array.from({ length: COLS }, (_, c) => c).filter((c) => board[0][c] === 0);
  if (validCols.length === 0) return -1;

  if (smart) {
    // 1. Gagner immédiatement
    for (const c of validCols) {
      const res = dropDisc(board, c, 2);
      if (res && findConnect4Winner(res.board)?.winner === 2) return c;
    }
    // 2. Bloquer le joueur 1
    for (const c of validCols) {
      const res = dropDisc(board, c, 1);
      if (res && findConnect4Winner(res.board)?.winner === 1) return c;
    }
    // 3. Favoriser les colonnes centrales
    const preferred = [3, 2, 4, 1, 5, 0, 6].filter((c) => validCols.includes(c));
    if (preferred.length > 0 && Math.random() < 0.75) {
      return preferred[0];
    }
  }

  return validCols[Math.floor(Math.random() * validCols.length)];
}
