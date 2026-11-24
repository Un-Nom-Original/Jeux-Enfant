import { describe, expect, it } from 'vitest';
import { canMove, continueAfterWin, createInitialState, move, undo } from './engine';
import type { Game2048State, Tile } from './types';

function makeState(tiles: Tile[], size: 3 | 4 | 5 = 4, score = 0): Game2048State {
  const maxId = tiles.reduce((acc, t) => Math.max(acc, t.id), 0);
  return {
    size,
    tiles,
    score,
    bestScore: score,
    nextTileId: maxId + 1,
    hasWon: false,
    keepPlaying: false,
    isGameOver: false,
    history: [],
  };
}

describe('2048 engine', () => {
  it('crée un état initial avec 2 tuiles valides sur 3x3, 4x4 et 5x5', () => {
    for (const size of [3, 4, 5] as const) {
      const state = createInitialState(size, 100, () => 0.1);
      expect(state.size).toBe(size);
      expect(state.tiles).toHaveLength(2);
      expect(state.bestScore).toBe(100);
      expect(state.score).toBe(0);
      expect(state.isGameOver).toBe(false);
    }
  });

  it('ne fusionne une tuile qu’une seule fois par coup ([2, 2, 4, 0] -> [4, 4, ...])', () => {
    const state = makeState([
      { id: 1, value: 2, row: 0, col: 0 },
      { id: 2, value: 2, row: 0, col: 1 },
      { id: 3, value: 4, row: 0, col: 2 },
    ]);

    const result = move(state, 'left', () => 0.99);
    expect(result.moved).toBe(true);
    expect(result.scoreGained).toBe(4);
    expect(result.highestMergedValue).toBe(4);

    const row0 = result.state.tiles
      .filter((t) => t.row === 0 && !t.isNew)
      .sort((a, b) => a.col - b.col);

    expect(row0.map((t) => ({ col: t.col, value: t.value }))).toEqual([
      { col: 0, value: 4 },
      { col: 1, value: 4 },
    ]);
  });

  it('gère les déplacements vers la droite et vers le bas correctement', () => {
    const state = makeState([
      { id: 1, value: 2, row: 0, col: 0 },
      { id: 2, value: 2, row: 0, col: 2 },
    ]);

    const rightResult = move(state, 'right', () => 0);
    expect(rightResult.moved).toBe(true);
    const merged = rightResult.state.tiles.find((t) => t.isMerged);
    expect(merged).toMatchObject({ row: 0, col: 3, value: 4 });

    const downState = makeState([
      { id: 1, value: 8, row: 0, col: 1 },
      { id: 2, value: 8, row: 2, col: 1 },
    ]);
    const downResult = move(downState, 'down', () => 0);
    const mergedDown = downResult.state.tiles.find((t) => t.isMerged);
    expect(mergedDown).toMatchObject({ row: 3, col: 1, value: 16 });
  });

  it('ne modifie pas le plateau si aucun mouvement n’est possible dans cette direction', () => {
    const state = makeState([
      { id: 1, value: 2, row: 0, col: 0 },
      { id: 2, value: 4, row: 0, col: 1 },
    ]);

    const result = move(state, 'left');
    expect(result.moved).toBe(false);
    expect(result.state).toBe(state);
  });

  it('détecte la victoire à 2048 et permet de continuer en mode infini', () => {
    const state = makeState([
      { id: 1, value: 1024, row: 0, col: 0 },
      { id: 2, value: 1024, row: 0, col: 1 },
    ]);

    const result = move(state, 'left', () => 0);
    expect(result.justWon).toBe(true);
    expect(result.state.hasWon).toBe(true);
    expect(result.state.keepPlaying).toBe(false);

    const continued = continueAfterWin(result.state);
    expect(continued.keepPlaying).toBe(true);
  });

  it('détecte correctement la fin de partie (Game Over)', () => {
    const lockedTiles: Tile[] = [
      { id: 1, value: 2, row: 0, col: 0 },
      { id: 2, value: 4, row: 0, col: 1 },
      { id: 3, value: 8, row: 0, col: 2 },
      { id: 4, value: 16, row: 1, col: 0 },
      { id: 5, value: 32, row: 1, col: 1 },
      { id: 6, value: 64, row: 1, col: 2 },
      { id: 7, value: 128, row: 2, col: 0 },
      { id: 8, value: 256, row: 2, col: 1 },
      { id: 9, value: 512, row: 2, col: 2 },
    ];
    expect(canMove(lockedTiles, 3)).toBe(false);
  });

  it('restaure proprement l’état précédent avec Undo', () => {
    const initial = makeState(
      [
        { id: 1, value: 4, row: 0, col: 0 },
        { id: 2, value: 4, row: 0, col: 1 },
      ],
      4,
      20
    );

    const afterMove = move(initial, 'left', () => 0).state;
    expect(afterMove.score).toBe(28);
    expect(afterMove.history).toHaveLength(1);

    const afterUndo = undo(afterMove);
    expect(afterUndo.score).toBe(20);
    expect(afterUndo.tiles).toHaveLength(2);
    expect(afterUndo.history).toHaveLength(0);
  });
});
