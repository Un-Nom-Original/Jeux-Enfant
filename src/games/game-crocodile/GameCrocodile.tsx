import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Star } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import {
  generateCrocodileQuestion,
  type CompareSign,
  type CrocodileQuestion,
} from './generator';

const TOTAL = 10;

export function GameCrocodile() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin, playGameOver } = useSound();

  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<CrocodileQuestion>(() =>
    generateCrocodileQuestion(grade)
  );
  const [selected, setSelected] = useState<CompareSign | null>(null);
  const [finished, setFinished] = useState(false);

  const reset = useCallback(
    (nextGrade = grade) => {
      setStep(0);
      setScore(0);
      setSelected(null);
      setFinished(false);
      setQuestion(generateCrocodileQuestion(nextGrade));
    },
    [grade]
  );

  useEffect(() => {
    reset(grade);
  }, [grade, reset]);

  const handleSign = (sign: CompareSign) => {
    if (selected !== null || finished) return;
    setSelected(sign);
    const isRight = sign === question.answer;

    if (isRight) {
      setScore((s) => s + 1);
      playMerge(64);
    } else {
      playGameOver();
    }

    window.setTimeout(() => {
      const next = step + 1;
      if (next >= TOTAL) {
        setFinished(true);
        playWin();
        try {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 } });
        } catch {
          // Ignore confetti
        }
      } else {
        setStep(next);
        setSelected(null);
        setQuestion(generateCrocodileQuestion(grade));
      }
    }, isRight ? 520 : 1050);
  };

  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🐊 Crocodile des Nombres
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            La bouche du crocodile s'ouvre toujours vers le plus grand nombre !
          </p>
        </div>

        <GradeBadgeToggle />
      </div>

      {!finished ? (
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl bg-white p-5 sm:p-7 shadow-md border-2 border-amber-200/80">
          <div className="flex w-full items-center justify-between text-xs font-extrabold text-amber-900/70">
            <span>
              Manche {step + 1} / {TOTAL}
            </span>
            <span>Score : {score}</span>
          </div>

          <div className="flex w-full items-center justify-center gap-3 sm:gap-5 py-2">
            <div className="flex min-w-[96px] sm:min-w-[130px] flex-col items-center rounded-3xl bg-sky-50 px-4 py-5 border-2 border-sky-200">
              <span className="font-display text-3xl sm:text-4xl font-bold text-sky-950">
                {question.leftLabel}
              </span>
              {selected !== null && question.leftLabel !== String(question.leftValue) && (
                <span className="mt-1 text-xs font-extrabold text-sky-600">
                  = {question.leftValue}
                </span>
              )}
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 font-display text-4xl font-bold text-emerald-700 border-2 border-emerald-300">
              {selected ?? '🐊'}
            </div>

            <div className="flex min-w-[96px] sm:min-w-[130px] flex-col items-center rounded-3xl bg-amber-50 px-4 py-5 border-2 border-amber-200">
              <span className="font-display text-3xl sm:text-4xl font-bold text-amber-950">
                {question.rightLabel}
              </span>
              {selected !== null && question.rightLabel !== String(question.rightValue) && (
                <span className="mt-1 text-xs font-extrabold text-amber-700">
                  = {question.rightValue}
                </span>
              )}
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-3">
            {(['<', '=', '>'] as CompareSign[]).map((sign) => {
              const isSel = selected === sign;
              const isAns = sign === question.answer;
              let cls =
                'bg-emerald-100 text-emerald-950 border-b-4 border-emerald-400 hover:bg-emerald-200';
              if (selected !== null) {
                if (isAns) cls = 'bg-emerald-500 text-white border-b-4 border-emerald-700';
                else if (isSel) cls = 'bg-rose-400 text-white border-b-4 border-rose-600';
                else cls = 'bg-stone-100 text-stone-400 border-b-4 border-stone-200';
              }
              return (
                <button
                  key={sign}
                  type="button"
                  disabled={selected !== null}
                  onClick={() => handleSign(sign)}
                  className={`h-20 rounded-2xl font-display text-5xl font-bold transition active:scale-95 ${cls}`}
                >
                  {sign}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-4 rounded-3xl bg-white p-7 text-center shadow-md border-2 border-amber-300">
          <span className="text-5xl">🐊</span>
          <h3 className="font-display text-3xl font-bold text-amber-950">
            Crocodile rassasié ! 🎉
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
            Score : <span className="text-emerald-600">{score}</span> / {TOTAL} !
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

export default GameCrocodile;
