import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Eraser, RotateCcw } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import {
  getSudokuPuzzles,
  hasConflict,
  isSudokuSolved,
  SUDOKU_4X4_ANIMALS,
} from './puzzles';

function cloneBoard(grid: number[][]): number[][] {
  return grid.map((r) => [...r]);
}

export function GameSudoku() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin } = useSound();

  const puzzles = getSudokuPuzzles(grade);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzle = puzzles[puzzleIdx % puzzles.length];

  const [board, setBoard] = useState<number[][]>(() => cloneBoard(puzzle.initial));
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const list = getSudokuPuzzles(grade);
    const first = list[0];
    setPuzzleIdx(0);
    setBoard(cloneBoard(first.initial));
    setSelected(null);
    setSolved(false);
  }, [grade]);

  const loadPuzzle = (nextIdx: number) => {
    const next = puzzles[nextIdx % puzzles.length];
    setPuzzleIdx(nextIdx % puzzles.length);
    setBoard(cloneBoard(next.initial));
    setSelected(null);
    setSolved(false);
  };

  const handleSetValue = (val: number) => {
    if (!selected || solved) return;
    if (puzzle.initial[selected.row][selected.col] !== 0) return;

    const next = cloneBoard(board);
    next[selected.row][selected.col] = val;
    setBoard(next);

    if (val === 0) {
      playClick();
      return;
    }

    if (isSudokuSolved(next, puzzle.boxRows, puzzle.boxCols)) {
      setSolved(true);
      playWin();
      try {
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 } });
      } catch {
        // Ignore confetti errors
      }
    } else {
      playMerge(32);
    }
  };

  const renderCellContent = (val: number) => {
    if (val === 0) return '';
    return puzzle.size === 4 ? SUDOKU_4X4_ANIMALS[val] : String(val);
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🔢 Sudoku Junior
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            {puzzle.size === 4
              ? 'Chaque animal une seule fois par ligne, colonne et carré !'
              : 'Chaque chiffre de 1 à 6 une seule fois par ligne, colonne et bloc !'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
          <button
            type="button"
            onClick={() => {
              playClick();
              loadPuzzle(puzzleIdx + 1);
            }}
            className="flex h-11 items-center gap-1.5 rounded-2xl bg-amber-100 px-3.5 text-sm font-extrabold text-amber-950 hover:bg-amber-200 active:scale-95 transition"
          >
            <RotateCcw className="h-4 w-4" />
            Autre grille
          </button>
        </div>
      </div>

      {/* Grille Sudoku */}
      <div
        style={{
          gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
        }}
        className="grid aspect-square w-full max-w-[min(88vw,420px)] rounded-3xl bg-white p-3 shadow-md border-4 border-amber-300"
      >
        {board.map((row, r) =>
          row.map((val, c) => {
            const isFixed = puzzle.initial[r][c] !== 0;
            const isSelected = selected?.row === r && selected?.col === c;
            const conflict = hasConflict(board, r, c, puzzle.boxRows, puzzle.boxCols);

            const thickRight = (c + 1) % puzzle.boxCols === 0 && c < puzzle.size - 1;
            const thickBottom = (r + 1) % puzzle.boxRows === 0 && r < puzzle.size - 1;

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => {
                  if (!isFixed) {
                    playClick();
                    setSelected({ row: r, col: c });
                  }
                }}
                className={`flex items-center justify-center font-display font-bold transition select-none border border-amber-200/80 ${
                  thickRight ? 'border-r-4 border-r-amber-500/80' : ''
                } ${thickBottom ? 'border-b-4 border-b-amber-500/80' : ''} ${
                  puzzle.size === 4 ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'
                } ${
                  conflict
                    ? 'bg-rose-100 text-rose-700'
                    : isSelected
                    ? 'bg-amber-200 ring-2 ring-inset ring-orange-500'
                    : isFixed
                    ? 'bg-amber-50/90 text-amber-950 cursor-default'
                    : 'bg-white text-sky-700 hover:bg-sky-50'
                }`}
              >
                {renderCellContent(val)}
              </button>
            );
          })
        )}
      </div>

      {/* Palette de choix */}
      {!solved ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: puzzle.size }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleSetValue(num)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-200 to-amber-300 border-b-4 border-amber-500 font-display text-2xl sm:text-3xl font-bold text-amber-950 shadow-xs hover:brightness-105 active:scale-95 transition"
            >
              {renderCellContent(num)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSetValue(0)}
            aria-label="Effacer la case"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 border-b-4 border-stone-300 text-stone-700 hover:bg-stone-200 active:scale-95 transition"
          >
            <Eraser className="h-6 w-6" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl bg-emerald-100 px-6 py-3 border-2 border-emerald-300">
          <p className="font-display text-lg font-bold text-emerald-950">
            Bravo ! Sudoku réussi sans erreur ! 🎉
          </p>
          <button
            type="button"
            onClick={() => {
              playClick();
              loadPuzzle(puzzleIdx + 1);
            }}
            className="h-11 rounded-2xl bg-emerald-500 px-5 font-display text-base font-bold text-white active:scale-95 transition"
          >
            Grille suivante
          </button>
        </div>
      )}
    </div>
  );
}

export default GameSudoku;
