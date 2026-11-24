export type GridSize = 3 | 4 | 5;

export type Direction = 'up' | 'down' | 'left' | 'right';

export type ThemeId = 'animals' | 'fruits' | 'space' | 'numbers';

export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

export interface HistorySnapshot {
  tiles: Tile[];
  score: number;
  nextTileId: number;
  hasWon: boolean;
  keepPlaying: boolean;
  isGameOver: boolean;
}

export interface Game2048State {
  size: GridSize;
  tiles: Tile[];
  score: number;
  bestScore: number;
  nextTileId: number;
  hasWon: boolean;
  keepPlaying: boolean;
  isGameOver: boolean;
  history: HistorySnapshot[];
}

export interface MoveResult {
  state: Game2048State;
  moved: boolean;
  scoreGained: number;
  highestMergedValue: number;
  justWon: boolean;
}
