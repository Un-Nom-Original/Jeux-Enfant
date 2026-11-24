import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { generateWordSearch, getLineCells, type WordSearchPuzzle } from './generator';

const FOUND_COLORS = [
  'bg-amber-300/80 text-amber-950',
  'bg-emerald-300/80 text-emerald-950',
  'bg-sky-300/80 text-sky-950',
  'bg-pink-300/80 text-pink-950',
  'bg-purple-300/80 text-purple-950',
  'bg-orange-300/80 text-orange-950',
  'bg-teal-300/80 text-teal-950',
];

export function GameWordSearch() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin } = useSound();

  const [puzzle, setPuzzle] = useState<WordSearchPuzzle>(() => generateWordSearch(grade));
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ row: number; col: number } | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const startNew = useCallback(
    (nextGrade = grade) => {
      setPuzzle(generateWordSearch(nextGrade));
      setFoundWords([]);
      setDragStart(null);
      setDragEnd(null);
    },
    [grade]
  );

  useEffect(() => {
    startNew(grade);
  }, [grade, startNew]);

  const getCellFromPoint = (clientX: number, clientY: number): { row: number; col: number } | null => {
    const el = gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    if (relX < 0 || relY < 0 || relX >= rect.width || relY >= rect.height) return null;
    const col = Math.floor((relX / rect.width) * puzzle.size);
    const row = Math.floor((relY / rect.height) * puzzle.size);
    return {
      row: Math.min(puzzle.size - 1, Math.max(0, row)),
      col: Math.min(puzzle.size - 1, Math.max(0, col)),
    };
  };

  const selectionCells = dragStart && dragEnd ? getLineCells(dragStart, dragEnd) : [];
  const selectionSet = new Set(selectionCells.map((c) => `${c.row},${c.col}`));

  // Map des cases déjà trouvées vers leur couleur
  const foundCellColor = new Map<string, string>();
  puzzle.words.forEach((wp) => {
    if (foundWords.includes(wp.word)) {
      const color = FOUND_COLORS[wp.colorIndex % FOUND_COLORS.length];
      wp.cells.forEach((c) => {
        foundCellColor.set(`${c.row},${c.col}`, color);
      });
    }
  });

  const finalizeSelection = () => {
    if (!dragStart || !dragEnd) {
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    const cells = getLineCells(dragStart, dragEnd);
    const selectedWord = cells.map((c) => puzzle.grid[c.row][c.col]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    const matched = puzzle.words.find(
      (w) => !foundWords.includes(w.word) && (w.word === selectedWord || w.word === reversedWord)
    );

    if (matched) {
      const nextFound = [...foundWords, matched.word];
      setFoundWords(nextFound);
      if (nextFound.length === puzzle.words.length) {
        playWin();
        try {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 } });
        } catch {
          // Ignore confetti errors
        }
      } else {
        playMerge(64);
      }
    }

    setDragStart(null);
    setDragEnd(null);
  };

  const isCompleted = foundWords.length === puzzle.words.length && puzzle.words.length > 0;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🔎 Mots Mêlés
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Glisse ton doigt sur les lettres pour entourer chaque mot caché !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
          <button
            type="button"
            onClick={() => {
              playClick();
              startNew(grade);
            }}
            className="flex h-11 items-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-3.5 font-display text-sm font-bold text-white shadow-sm active:scale-95 transition"
          >
            <RotateCcw className="h-4 w-4" />
            Nouvelle grille
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col lg:flex-row items-center lg:items-start justify-center gap-4">
        {/* Grille tactile */}
        <div
          ref={gridRef}
          onPointerDown={(e) => {
            const cell = getCellFromPoint(e.clientX, e.clientY);
            if (cell) {
              setDragStart(cell);
              setDragEnd(cell);
            }
          }}
          onPointerMove={(e) => {
            if (!dragStart) return;
            const cell = getCellFromPoint(e.clientX, e.clientY);
            if (cell) {
              setDragEnd(cell);
            }
          }}
          onPointerUp={finalizeSelection}
          onPointerCancel={() => {
            setDragStart(null);
            setDragEnd(null);
          }}
          style={{
            touchAction: 'none',
            gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
          }}
          className="grid aspect-square w-full max-w-[min(90vw,460px)] gap-1 sm:gap-1.5 rounded-3xl bg-white p-3 shadow-md border-4 border-amber-200 select-none cursor-crosshair"
        >
          {puzzle.grid.map((row, rIdx) =>
            row.map((letter, cIdx) => {
              const key = `${rIdx},${cIdx}`;
              const isSelected = selectionSet.has(key);
              const foundClass = foundCellColor.get(key);

              return (
                <div
                  key={key}
                  className={`flex items-center justify-center rounded-xl font-display font-bold transition-colors ${
                    puzzle.size === 6 ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                  } ${
                    isSelected
                      ? 'bg-orange-400 text-white scale-105 shadow-sm'
                      : foundClass ?? 'bg-amber-50/80 text-amber-950'
                  }`}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>

        {/* Liste des mots à trouver */}
        <div className="flex w-full lg:w-56 flex-col gap-2 rounded-3xl bg-white p-4 shadow-md border-2 border-amber-200/80">
          <p className="font-display text-base font-bold text-amber-950">
            Mots à trouver ({foundWords.length}/{puzzle.words.length})
          </p>
          <div className="flex flex-wrap lg:flex-col gap-2">
            {puzzle.words.map((wp) => {
              const found = foundWords.includes(wp.word);
              return (
                <div
                  key={wp.word}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold transition ${
                    found
                      ? `${FOUND_COLORS[wp.colorIndex % FOUND_COLORS.length]} line-through opacity-80`
                      : 'bg-amber-50 text-amber-950'
                  }`}
                >
                  <span className="text-lg">{wp.emoji}</span>
                  <span>{wp.displayWord}</span>
                </div>
              );
            })}
          </div>

          {isCompleted && (
            <div className="mt-2 rounded-2xl bg-emerald-100 p-3 text-center">
              <p className="font-display text-base font-bold text-emerald-900">
                Bravo ! Tout trouvé ! 🎉
              </p>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  startNew(grade);
                }}
                className="mt-2 h-10 w-full rounded-xl bg-emerald-500 font-display text-sm font-bold text-white active:scale-95 transition"
              >
                Grille suivante
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameWordSearch;
