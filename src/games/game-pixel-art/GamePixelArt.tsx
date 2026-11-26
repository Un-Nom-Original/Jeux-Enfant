import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Eraser, Palette, Trash2 } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { PALETTE_KEYS, PIXEL_PALETTE, PIXEL_TEMPLATES } from './templates';

const SIZE = 8;

function emptyGrid(): string[][] {
  return Array.from({ length: SIZE }, () => Array<string>(SIZE).fill('.'));
}

export function GamePixelArt() {
  const { playClick, playMerge, playWin } = useSound();

  const [mode, setMode] = useState<'template' | 'free'>('template');
  const [templateIdx, setTemplateIdx] = useState(0);
  const [grid, setGrid] = useState<string[][]>(() => emptyGrid());
  const [selectedColor, setSelectedColor] = useState<string>('R');
  const [isPainting, setIsPainting] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  const template = PIXEL_TEMPLATES[templateIdx];

  const countProgress = (currentGrid: string[][]): { matched: number; total: number } => {
    let matched = 0;
    let total = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const expected = template.rows[r][c];
        if (expected !== '.') {
          total++;
          if (currentGrid[r][c] === expected) matched++;
        }
      }
    }
    return { matched, total };
  };

  const paintCell = (r: number, c: number) => {
    setGrid((prev) => {
      if (prev[r][c] === selectedColor) return prev;
      const next = prev.map((row) => [...row]);
      next[r][c] = selectedColor;

      if (mode === 'template') {
        const { matched, total } = countProgress(next);
        if (matched === total && !celebrated) {
          setCelebrated(true);
          playWin();
          try {
            confetti({ particleCount: 95, spread: 80, origin: { y: 0.55 } });
          } catch {
            // Ignore confetti
          }
        } else if (selectedColor !== '.' && template.rows[r][c] === selectedColor) {
          playMerge(32);
        }
      }
      return next;
    });
  };

  const { matched, total } = countProgress(grid);
  const pct = total > 0 ? Math.round((matched / total) * 100) : 0;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🎨 Pixel Art
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            {mode === 'template'
              ? 'Reproduis le modèle pixel par pixel !'
              : 'Laisse libre cours à ton imagination en pixels !'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-2xl bg-amber-100 p-1 border border-amber-200">
            <button
              type="button"
              onClick={() => {
                playClick();
                setMode('template');
                setGrid(emptyGrid());
                setCelebrated(false);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                mode === 'template' ? 'bg-white text-orange-600 shadow-xs' : 'text-amber-900/75'
              }`}
            >
              Modèles
            </button>
            <button
              type="button"
              onClick={() => {
                playClick();
                setMode('free');
                setGrid(emptyGrid());
                setCelebrated(false);
              }}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                mode === 'free' ? 'bg-white text-purple-600 shadow-xs' : 'text-amber-900/75'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              Libre
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              playClick();
              setGrid(emptyGrid());
              setCelebrated(false);
            }}
            aria-label="Effacer tout"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 active:scale-95 transition"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sélecteur de modèles */}
      {mode === 'template' && (
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {PIXEL_TEMPLATES.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  playClick();
                  setTemplateIdx(idx);
                  setGrid(emptyGrid());
                  setCelebrated(false);
                }}
                className={`h-10 rounded-xl px-3 text-xs font-extrabold transition ${
                  idx === templateIdx
                    ? 'bg-amber-400 text-amber-950 shadow-xs'
                    : 'bg-white text-amber-900/75 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                {t.icon} {t.name}
              </button>
            ))}
          </div>
          <span className="rounded-xl bg-emerald-100 px-3 py-1.5 font-display text-sm font-bold text-emerald-900">
            {pct} %
          </span>
        </div>
      )}

      {/* Zone Modèle + Toile interactive */}
      <div className="flex w-full flex-col md:flex-row items-center justify-center gap-5">
        {mode === 'template' && (
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-white p-4 shadow-sm border-2 border-amber-200">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800/70">
              Modèle : {template.name}
            </span>
            <div className="grid grid-cols-8 gap-0.5 rounded-xl bg-stone-200 p-1 w-36 h-36 sm:w-44 sm:h-44">
              {template.rows.map((row, r) =>
                row.split('').map((ch, c) => (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      backgroundColor: ch === '.' ? '#F8FAFC' : PIXEL_PALETTE[ch],
                    }}
                    className="rounded-xs"
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Toile tactile 8x8 */}
        <div
          onPointerUp={() => setIsPainting(false)}
          onPointerLeave={() => setIsPainting(false)}
          style={{ touchAction: 'none' }}
          className="grid aspect-square w-full max-w-[min(86vw,360px)] grid-cols-8 gap-1 rounded-3xl bg-stone-200 p-2.5 shadow-md border-4 border-amber-300 select-none"
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsPainting(true);
                  paintCell(r, c);
                }}
                onPointerEnter={() => {
                  if (isPainting) paintCell(r, c);
                }}
                style={{
                  backgroundColor: cell === '.' ? '#FFFFFF' : PIXEL_PALETTE[cell],
                }}
                aria-label={`Case ${r + 1}, ${c + 1}`}
                className="aspect-square rounded-md border border-stone-200/70 transition-transform active:scale-95"
              />
            ))
          )}
        </div>
      </div>

      {/* Palette de couleurs */}
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-3xl bg-white p-3 shadow-sm border-2 border-amber-200">
        {PALETTE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              playClick();
              setSelectedColor(key);
            }}
            style={{ backgroundColor: PIXEL_PALETTE[key] }}
            aria-label={`Couleur ${key}`}
            className={`h-11 w-11 rounded-2xl border-2 transition active:scale-90 ${
              selectedColor === key
                ? 'border-amber-950 scale-110 ring-3 ring-amber-300'
                : 'border-stone-300'
            }`}
          />
        ))}
        <button
          type="button"
          onClick={() => {
            playClick();
            setSelectedColor('.');
          }}
          aria-label="Gomme"
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 bg-stone-100 text-stone-700 transition active:scale-90 ${
            selectedColor === '.'
              ? 'border-amber-950 scale-110 ring-3 ring-amber-300'
              : 'border-stone-300'
          }`}
        >
          <Eraser className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default GamePixelArt;
