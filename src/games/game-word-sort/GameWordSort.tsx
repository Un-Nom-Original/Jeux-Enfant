import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Star } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { generateWordSortRound, type WordSortItem } from './items';

const TOTAL = 10;

export function GameWordSort() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin, playGameOver } = useSound();

  const [round, setRound] = useState(() => generateWordSortRound(grade, TOTAL));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);

  const reset = useCallback(
    (nextGrade = grade) => {
      setRound(generateWordSortRound(nextGrade, TOTAL));
      setIdx(0);
      setScore(0);
      setFeedback(null);
      setFinished(false);
    },
    [grade]
  );

  useEffect(() => {
    reset(grade);
  }, [grade, reset]);

  const current: WordSortItem | undefined = round.items[idx];

  const handleSort = (bucket: 'left' | 'right') => {
    if (!current || feedback !== null || finished) return;
    const isRight = current.bucket === bucket;
    setFeedback(isRight ? 'right' : 'wrong');

    if (isRight) {
      setScore((s) => s + 1);
      playMerge(64);
    } else {
      playGameOver();
    }

    window.setTimeout(() => {
      const next = idx + 1;
      if (next >= round.items.length) {
        setFinished(true);
        playWin();
        try {
          confetti({ particleCount: 85, spread: 75, origin: { y: 0.55 } });
        } catch {
          // Ignore confetti
        }
      } else {
        setIdx(next);
        setFeedback(null);
      }
    }, isRight ? 420 : 850);
  };

  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🧺 Tri de Mots
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Envoie chaque mot dans le bon panier !
          </p>
        </div>

        <GradeBadgeToggle />
      </div>

      {!finished && current ? (
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl bg-white p-5 sm:p-7 shadow-md border-2 border-amber-200/80">
          <div className="flex w-full items-center justify-between text-xs font-extrabold text-amber-900/70">
            <span>
              Mot {idx + 1} / {round.items.length}
            </span>
            <span>Score : {score}</span>
          </div>

          <div
            className={`flex flex-col items-center gap-2 rounded-3xl px-10 py-6 border-4 transition-all ${
              feedback === 'right'
                ? 'bg-emerald-100 border-emerald-400 scale-105'
                : feedback === 'wrong'
                ? 'bg-rose-100 border-rose-400'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <span className="text-5xl">{current.emoji}</span>
            <span className="font-display text-3xl sm:text-4xl font-bold text-amber-950">
              {current.word}
            </span>
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            <button
              type="button"
              disabled={feedback !== null}
              onClick={() => handleSort('left')}
              className="flex h-20 flex-col items-center justify-center rounded-2xl bg-sky-100 border-b-4 border-sky-400 px-3 font-display text-lg sm:text-xl font-bold text-sky-950 hover:bg-sky-200 active:scale-95 transition"
            >
              <span>🧺</span>
              <span className="text-center leading-tight">{round.leftLabel}</span>
            </button>
            <button
              type="button"
              disabled={feedback !== null}
              onClick={() => handleSort('right')}
              className="flex h-20 flex-col items-center justify-center rounded-2xl bg-pink-100 border-b-4 border-pink-400 px-3 font-display text-lg sm:text-xl font-bold text-pink-950 hover:bg-pink-200 active:scale-95 transition"
            >
              <span>🧺</span>
              <span className="text-center leading-tight">{round.rightLabel}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-4 rounded-3xl bg-white p-7 text-center shadow-md border-2 border-amber-300">
          <span className="text-5xl">🧺</span>
          <h3 className="font-display text-3xl font-bold text-amber-950">
            Super tri ! 🎉
          </h3>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                className={`h-10 w-10 ${
                  n <= stars ? 'fill-amber-400 text-amber-500' : 'text-stone-200'
                }`}
              />
            ))}
          </div>
          <p className="text-base font-bold text-amber-900/80">
            Tu as bien trié <span className="text-emerald-600">{score}</span> mots sur {round.items.length} !
          </p>
          <button
            type="button"
            onClick={() => {
              playClick();
              reset(grade);
            }}
            className="flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 font-display text-lg font-bold text-white shadow-md active:scale-95 transition"
          >
            <RotateCcw className="h-5 w-5" />
            Rejouer
          </button>
        </div>
      )}
    </div>
  );
}

export default GameWordSort;
