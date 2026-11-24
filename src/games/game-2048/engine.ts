import type { Direction, Game2048State, GridSize, HistorySnapshot, MoveResult, Tile } from './types';

export const MAX_HISTORY = 25;
export const WIN_VALUE = 2048;

export type RandomFn = () => number;

function cloneTiles(tiles: Tile[]): Tile[] {
  return tiles.map((t) => ({
    id: t.id,
    value: t.value,
    row: t.row,
    col: t.col,
  }));
}

export function getEmptyCells(tiles: Tile[], size: GridSize): Array<{ row: number; col: number }> {
  const occupied = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const empty: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!occupied.has(`${row},${col}`)) {
        empty.push({ row, col });
      }
    }
  }
  return empty;
}

export function spawnRandomTile(
  tiles: Tile[],
  size: GridSize,
  nextTileId: number,
  random: RandomFn = Math.random
): { tiles: Tile[]; nextTileId: number } {
  const empty = getEmptyCells(tiles, size);
  if (empty.length === 0) {
    return { tiles, nextTileId };
  }
  const index = Math.floor(random() * empty.length);
  const { row, col } = empty[index];
  const value = random() < 0.9 ? 2 : 4;
  const newTile: Tile = {
    id: nextTileId,
    value,
    row,
    col,
    isNew: true,
    isMerged: false,
  };
  return {
    tiles: [...tiles, newTile],
    nextTileId: nextTileId + 1,
  };
}

export function canMove(tiles: Tile[], size: GridSize): boolean {
  if (tiles.length < size * size) {
    return true;
  }

  const grid: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  for (const tile of tiles) {
    grid[tile.row][tile.col] = tile.value;
  }

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const val = grid[row][col];
      if (row + 1 < size && grid[row + 1][col] === val) return true;
      if (col + 1 < size && grid[row][col + 1] === val) return true;
    }
  }
  return false;
}

export function createInitialState(
  size: GridSize = 4,
  bestScore = 0,
  random: RandomFn = Math.random
): Game2048State {
  let tiles: Tile[] = [];
  let nextTileId = 1;

  const first = spawnRandomTile(tiles, size, nextTileId, random);
  tiles = first.tiles;
  nextTileId = first.nextTileId;

  const second = spawnRandomTile(tiles, size, nextTileId, random);
  tiles = second.tiles;
  nextTileId = second.nextTileId;

  return {
    size,
    tiles,
    score: 0,
    bestScore,
    nextTileId,
    hasWon: false,
    keepPlaying: false,
    isGameOver: false,
    history: [],
  };
}

export function move(
  state: Game2048State,
  direction: Direction,
  random: RandomFn = Math.random
): MoveResult {
  if (state.isGameOver) {
    return {
      state,
      moved: false,
      scoreGained: 0,
      highestMergedValue: 0,
      justWon: false,
    };
  }

  const { size } = state;
  const grid: Array<Array<Tile | null>> = Array.from({ length: size }, () =>
    Array<Tile | null>(size).fill(null)
  );

  for (const tile of state.tiles) {
    grid[tile.row][tile.col] = {
      id: tile.id,
      value: tile.value,
      row: tile.row,
      col: tile.col,
      isNew: false,
      isMerged: false,
    };
  }

  const nextTiles: Tile[] = [];
  let moved = false;
  let scoreGained = 0;
  let highestMergedValue = 0;
  let nextTileId = state.nextTileId;

  const isHorizontal = direction === 'left' || direction === 'right';
  const isReverse = direction === 'right' || direction === 'down';

  for (let lineIdx = 0; lineIdx < size; lineIdx++) {
    // Extraire la ligne ou colonne dans l'ordre du glissement
    const line: Tile[] = [];
    for (let step = 0; step < size; step++) {
      const pos = isReverse ? size - 1 - step : step;
      const row = isHorizontal ? lineIdx : pos;
      const col = isHorizontal ? pos : lineIdx;
      const tile = grid[row][col];
      if (tile) {
        line.push(tile);
      }
    }

    let targetStep = 0;
    let i = 0;
    while (i < line.length) {
      const current = line[i];
      const next = line[i + 1];

      const targetPos = isReverse ? size - 1 - targetStep : targetStep;
      const targetRow = isHorizontal ? lineIdx : targetPos;
      const targetCol = isHorizontal ? targetPos : lineIdx;

      if (next && current.value === next.value) {
        const mergedValue = current.value * 2;
        scoreGained += mergedValue;
        if (mergedValue > highestMergedValue) {
          highestMergedValue = mergedValue;
        }
        moved = true;

        // Conserve l'id de la tuile cible (ou nouvelle tuile fusionnée) avec flag isMerged
        nextTiles.push({
          id: nextTileId++,
          value: mergedValue,
          row: targetRow,
          col: targetCol,
          isNew: false,
          isMerged: true,
        });

        i += 2;
        targetStep += 1;
      } else {
        if (current.row !== targetRow || current.col !== targetCol) {
          moved = true;
        }
        nextTiles.push({
          id: current.id,
          value: current.value,
          row: targetRow,
          col: targetCol,
          isNew: false,
          isMerged: false,
        });
        i += 1;
        targetStep += 1;
      }
    }
  }

  if (!moved) {
    return {
      state,
      moved: false,
      scoreGained: 0,
      highestMergedValue: 0,
      justWon: false,
    };
  }

  const snapshot: HistorySnapshot = {
    tiles: cloneTiles(state.tiles),
    score: state.score,
    nextTileId: state.nextTileId,
    hasWon: state.hasWon,
    keepPlaying: state.keepPlaying,
    isGameOver: state.isGameOver,
  };
  const nextHistory = [...state.history, snapshot].slice(-MAX_HISTORY);

  const spawned = spawnRandomTile(nextTiles, size, nextTileId, random);
  const finalTiles = spawned.tiles;
  const finalNextId = spawned.nextTileId;

  const newScore = state.score + scoreGained;
  const newBestScore = Math.max(state.bestScore, newScore);
  const reachedWin = finalTiles.some((t) => t.value >= WIN_VALUE);
  const justWon = !state.hasWon && reachedWin;
  const hasWon = state.hasWon || reachedWin;
  const isGameOver = !canMove(finalTiles, size);

  return {
    state: {
      size,
      tiles: finalTiles,
      score: newScore,
      bestScore: newBestScore,
      nextTileId: finalNextId,
      hasWon,
      keepPlaying: state.keepPlaying,
      isGameOver,
      history: nextHistory,
    },
    moved: true,
    scoreGained,
    highestMergedValue,
    justWon,
  };
}

export function undo(state: Game2048State): Game2048State {
  if (state.history.length === 0) {
    return state;
  }
  const previous = state.history[state.history.length - 1];
  return {
    ...state,
    tiles: cloneTiles(previous.tiles),
    score: previous.score,
    nextTileId: previous.nextTileId,
    hasWon: previous.hasWon,
    keepPlaying: previous.keepPlaying,
    isGameOver: previous.isGameOver,
    history: state.history.slice(0, -1),
  };
}

export function continueAfterWin(state: Game2048State): Game2048State {
  return {
    ...state,
    keepPlaying: true,
  };
}
