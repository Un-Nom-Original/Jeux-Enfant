import { describe, expect, it } from 'vitest';
import { getSentencesForGrade } from './game-sentence-order/sentences';
import { generateWordSortRound } from './game-word-sort/items';
import { formatFrenchTime, generateClockQuestion } from './game-clock/generator';
import { generateCrocodileQuestion } from './game-crocodile/generator';
import { generateShopItem } from './game-shop/items';
import { generateMaze } from './game-maze/generator';
import { generateBattleshipBoard } from './game-battleship/engine';

describe('Vague 2 — 11 nouveaux jeux (1re & 3e année)', () => {
  it('fournit des phrases et des tris de mots pour 1re et 3e année', () => {
    expect(getSentencesForGrade('1re').length).toBeGreaterThanOrEqual(10);
    expect(getSentencesForGrade('3e').length).toBeGreaterThanOrEqual(10);

    const r1 = generateWordSortRound('1re', 10);
    expect(r1.items).toHaveLength(10);
    const r3 = generateWordSortRound('3e', 10);
    expect(r3.items).toHaveLength(10);
  });

  it('génère des questions d’horloge et de crocodile valides', () => {
    expect(formatFrenchTime(3, 5)).toBe('3 h 05');
    for (const grade of ['1re', '3e'] as const) {
      const qClock = generateClockQuestion(grade);
      expect(qClock.choices).toHaveLength(4);
      expect(qClock.choices).toContain(qClock.answerLabel);

      const qCroc = generateCrocodileQuestion(grade);
      const expected =
        qCroc.leftValue < qCroc.rightValue
          ? '<'
          : qCroc.leftValue > qCroc.rightValue
          ? '>'
          : '=';
      expect(qCroc.answer).toBe(expected);

      const shopItem = generateShopItem(grade);
      expect(shopItem.price).toBeGreaterThanOrEqual(3);
    }
  });

  it('génère un labyrinthe garanti soluble (BFS de start vers goal)', () => {
    for (const grade of ['1re', '3e'] as const) {
      const maze = generateMaze(grade);
      const visited = new Set<string>([`${maze.start.row},${maze.start.col}`]);
      const queue = [maze.start];
      let reachedGoal = false;

      while (queue.length > 0) {
        const cur = queue.shift()!;
        if (cur.row === maze.goal.row && cur.col === maze.goal.col) {
          reachedGoal = true;
          break;
        }
        for (const [dr, dc] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const nr = cur.row + dr;
          const nc = cur.col + dc;
          const key = `${nr},${nc}`;
          if (
            nr >= 0 &&
            nr < maze.size &&
            nc >= 0 &&
            nc < maze.size &&
            maze.grid[nr][nc] === 0 &&
            !visited.has(key)
          ) {
            visited.add(key);
            queue.push({ row: nr, col: nc });
          }
        }
      }
      expect(reachedGoal).toBe(true);
    }
  });

  it('place les bateaux de Bataille Navale sans aucun chevauchement', () => {
    for (const grade of ['1re', '3e'] as const) {
      const b = generateBattleshipBoard(grade);
      const allCells = b.ships.flatMap((s) => s.cells.map((c) => `${c.row},${c.col}`));
      const unique = new Set(allCells);
      expect(unique.size).toBe(allCells.length);
      expect(b.ships.length).toBe(grade === '1re' ? 3 : 4);
    }
  });
});
