import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Eraser, RotateCcw } from 'lucide-react';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import {
  generateSudokuPuzzle,
  hasConflict,
  isSudokuSolved,
  SUDOKU_4X4_ANIMALS,
  type SudokuPuzzle,
  type SudokuSize,
} from './puzzles';

const SIZE_OPTIONS: Array<{ size: SudokuSize; label: string; tag: string }> = [
  { size: 4, label: '4×4', tag: 'Animaux' },
  { size: 6, label: '6×6', tag: 'Junior' },
  { size: 9, label: '9×9', tag: 'Standard' },
  { size: 12, label: '12×12', tag: 'Géant' },
];

function cloneBoard(grid: number[][]): number[][] {
  return grid.map((r) => [...r]);
}

export function GameSudoku() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin } = useSound();

  const [size, setSize] = useState<SudokuSize>(() => (grade === '1re' ? 4 : 6));
  const [puzzle, setPuzzle] = useState<SudokuPuzzle>(() =>
    generateSudokuPuzzle(grade === '1re' ? 4 : 6)
  );
  const [board, setBoard] = useState<number[][]>(() => cloneBoard(puzzle.initial));
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [solved, setSolved] = useState(false);

  const loadNewSize = useCallback((nextSize: SudokuSize) => {
    const next = generateSudokuPuzzle(nextSize);
    setSize(nextSize);
    setPuzzle(next);
    setBoard(cloneBoard(next.initial));
    setSelected(null);
    setSolved(false);
  }, []);

  useEffect(() => {
    loadNewSize(grade === '1re' ? 4 : 6);
  }, [grade, loadNewSize]);

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
        confetti({ particleCount: 95, spread: 80, origin: { y: 0.55 } });
      } catch {
        // Ignore confetti
      }
    } else {
      playMerge(32);
    }
  };

  const renderCellContent = (val: number) => {
    if (val === 0) return '';
    return puzzle.size === 4 ? SUDOKU_4X4_ANIMALS[val] : String(val);
  };

  const cellTextClass =
    puzzle.size === 4
      ? 'text-3xl sm:text-5xl'
      : puzzle.size === 6
      ? 'text-xl sm:text-3xl'
      : puzzle.size === 9
      ? 'text-sm sm:text-xl'
      : 'text-[11px] sm:text-sm';

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3.5">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🔢 Sudoku
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            {puzzle.size === 4
              ? 'Chaque animal une seule fois par ligne, colonne et carré !'
              : `Chaque chiffre de 1 à ${puzzle.size} une seule fois par ligne, colonne et bloc !`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            playClick();
            loadNewSize(size);
          }}
          className="flex h-11 items-center gap-1.5 rounded-2xl bg-amber-100 px-3.5 text-sm font-extrabold text-amber-950 hover:bg-amber-200 active:scale-95 transition"
        >
          <RotateCcw className="h-4 w-4" />
          Nouvelle grille
        </button>
      </div>

      {/* Sélecteur de taille : 4x4, 6x6, 9x9, 12x12 */}
      <div
        role="group"
        aria-label="Taille du Sudoku"
        className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-amber-100/80 p-1 border border-amber-200"
      >
        {SIZE_OPTIONS.map((opt) => {
          const active = size === opt.size;
          return (
            <button
              key={opt.size}
              type="button"
              onClick={() => {
                playClick();
                loadNewSize(opt.size);
              }}
              className={`flex flex-col items-center rounded-xl px-3.5 py-1.5 min-h-[42px] transition ${
                active
                  ? 'bg-white text-orange-600 shadow-xs font-extrabold'
                  : 'text-amber-900/75 hover:text-amber-950 font-bold'
              }`}
            >
              <span className="font-display text-sm leading-none">{opt.label}</span>
              <span className="text-[10px] leading-tight opacity-80">{opt.tag}</span>
            </button>
          );
        })}
      </div>

      {/* Grille Sudoku à dimensions verrouillées */}
      <div
        style={{
          gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${puzzle.size}, minmax(0, 1fr))`,
        }}
        className={`grid aspect-square w-full rounded-3xl bg-white p-2 sm:p-3 shadow-md border-4 border-amber-300 ${
          puzzle.size === 12 ? 'max-w-[min(94vw,540px)]' : 'max-w-[min(90vw,460px)]'
        }`}
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
                className={`h-full w-full min-h-0 min-w-0 flex items-center justify-center font-display font-bold leading-none transition select-none border border-amber-200/80 ${
                  thickRight ? 'border-r-3 sm:border-r-4 border-r-amber-500/85' : ''
                } ${thickBottom ? 'border-b-3 sm:border-b-4 border-b-amber-500/85' : ''} ${cellTextClass} ${
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
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {Array.from({ length: puzzle.size }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleSetValue(num)}
              className={`flex items-center justify-center rounded-2xl bg-gradient-to-b from-amber-200 to-amber-300 border-b-4 border-amber-500 font-display font-bold text-amber-950 shadow-xs hover:brightness-105 active:scale-95 transition ${
                puzzle.size >= 9 ? 'h-12 w-12 text-xl' : 'h-14 w-14 text-2xl sm:text-3xl'
              }`}
            >
              {renderCellContent(num)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSetValue(0)}
            aria-label="Effacer la case"
            className={`flex items-center justify-center rounded-2xl bg-stone-100 border-b-4 border-stone-300 text-stone-700 hover:bg-stone-200 active:scale-95 transition ${
              puzzle.size >= 9 ? 'h-12 w-12' : 'h-14 w-14'
            }`}
          >
            <Eraser className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl bg-emerald-100 px-6 py-3 border-2 border-emerald-300">
          <p className="font-display text-lg font-bold text-emerald-950">
            Bravo ! Sudoku {puzzle.size}×{puzzle.size} réussi ! 🎉
          </p>
          <button
            type="button"
            onClick={() => {
              playClick();
              loadNewSize(size);
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
