import { describe, expect, it } from 'vitest';
import { getWordsForGrade, normalizeLetter } from './game-hangman/words';
import { generateWordSearch, getLineCells } from './game-word-search/generator';
import { generateMathQuestion } from './game-math-race/generator';
import { generateSequenceQuestion } from './game-logic-sequence/generator';
import { getSudokuPuzzles, isSudokuSolved } from './game-sudoku/puzzles';
import {
  chooseConnect4AiCol,
  createEmptyConnect4,
  dropDisc,
  findConnect4Winner,
} from './game-connect-four/engine';

describe('Suite complète des nouveaux jeux (1re & 3e année)', () => {
  it('normalise les accents français et fournit des mots pour 1re et 3e année', () => {
    expect(normalizeLetter('é')).toBe('E');
    expect(normalizeLetter('â')).toBe('A');
    expect(getWordsForGrade('1re').length).toBeGreaterThanOrEqual(30);
    expect(getWordsForGrade('3e').length).toBeGreaterThanOrEqual(30);
  });

  it('génère des grilles de Mots Mêlés 6x6 (1re) et 9x9 (3e) valides', () => {
    const p1 = generateWordSearch('1re');
    expect(p1.size).toBe(6);
    expect(p1.words.length).toBeGreaterThanOrEqual(3);

    const p3 = generateWordSearch('3e');
    expect(p3.size).toBe(9);
    expect(p3.words.length).toBeGreaterThanOrEqual(5);

    const diag = getLineCells({ row: 0, col: 0 }, { row: 2, col: 2 });
    expect(diag).toHaveLength(3);
  });

  it('génère des questions de calcul mental valides avec la bonne réponse dans les 4 choix', () => {
    for (const grade of ['1re', '3e'] as const) {
      for (let i = 0; i < 15; i++) {
        const q = generateMathQuestion(grade);
        expect(q.choices).toHaveLength(4);
        expect(q.choices).toContain(q.answer);
      }
    }
  });

  it('génère des suites logiques valides pour 1re et 3e année', () => {
    for (const grade of ['1re', '3e'] as const) {
      for (let i = 0; i < 10; i++) {
        const q = generateSequenceQuestion(grade);
        expect(q.choices).toContain(q.answer);
        expect(q.items[q.missingIndex]).toBe(q.answer);
      }
    }
  });

  it('valide les solutions de toutes les grilles Sudoku 4x4 et 6x6', () => {
    for (const grade of ['1re', '3e'] as const) {
      const puzzles = getSudokuPuzzles(grade);
      for (const p of puzzles) {
        expect(isSudokuSolved(p.solution, p.boxRows, p.boxCols)).toBe(true);
        expect(isSudokuSolved(p.initial, p.boxRows, p.boxCols)).toBe(false);
      }
    }
  });

  it('détecte une victoire au Puissance 4 et choisit une colonne IA valide', () => {
    let board = createEmptyConnect4();
    for (let c = 0; c < 4; c++) {
      const res = dropDisc(board, c, 1)!;
      board = res.board;
    }
    const win = findConnect4Winner(board);
    expect(win?.winner).toBe(1);
    expect(win?.cells).toHaveLength(4);

    const aiCol = chooseConnect4AiCol(createEmptyConnect4(), true);
    expect(aiCol).toBeGreaterThanOrEqual(0);
    expect(aiCol).toBeLessThan(7);
  });
});
