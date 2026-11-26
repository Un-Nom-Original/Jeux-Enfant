import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Star } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { generateClockQuestion, type ClockQuestion } from './generator';

const TOTAL = 10;

function AnalogClock({ hours, minutes }: { hours: number; minutes: number }) {
  const minuteAngle = minutes * 6;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  return (
    <svg viewBox="0 0 220 220" className="h-52 w-52 sm:h-60 sm:w-60 drop-shadow-sm">
      <circle cx="110" cy="110" r="102" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="8" />
      <circle cx="110" cy="110" r="92" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="2" />

      {/* Graduations minutes */}
      {Array.from({ length: 60 }, (_, i) => {
        const angle = (i * 6 * Math.PI) / 180;
        const isHour = i % 5 === 0;
        const r1 = isHour ? 80 : 85;
        const r2 = 90;
        return (
          <line
            key={i}
            x1={110 + Math.sin(angle) * r1}
            y1={110 - Math.cos(angle) * r1}
            x2={110 + Math.sin(angle) * r2}
            y2={110 - Math.cos(angle) * r2}
            stroke={isHour ? '#92400E' : '#CBD5E1'}
            strokeWidth={isHour ? 3 : 1.5}
            strokeLinecap="round"
          />
        );
      })}

      {/* Chiffres 1 à 12 */}
      {Array.from({ length: 12 }, (_, idx) => {
        const num = idx + 1;
        const angle = (num * 30 * Math.PI) / 180;
        const x = 110 + Math.sin(angle) * 68;
        const y = 110 - Math.cos(angle) * 68 + 6;
        return (
          <text
            key={num}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="16"
            fontWeight="800"
            fill="#451A03"
          >
            {num}
          </text>
        );
      })}

      {/* Aiguille des heures (rouge, courte) */}
      <line
        x1="110"
        y1="110"
        x2={110 + Math.sin((hourAngle * Math.PI) / 180) * 46}
        y2={110 - Math.cos((hourAngle * Math.PI) / 180) * 46}
        stroke="#EF4444"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Aiguille des minutes (bleue, longue) */}
      <line
        x1="110"
        y1="110"
        x2={110 + Math.sin((minuteAngle * Math.PI) / 180) * 72}
        y2={110 - Math.cos((minuteAngle * Math.PI) / 180) * 72}
        stroke="#2563EB"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <circle cx="110" cy="110" r="7" fill="#1E293B" />
    </svg>
  );
}

export function GameClock() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin, playGameOver } = useSound();

  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<ClockQuestion>(() => generateClockQuestion(grade));
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const reset = useCallback(
    (nextGrade = grade) => {
      setStep(0);
      setScore(0);
      setSelected(null);
      setFinished(false);
      setQuestion(generateClockQuestion(nextGrade));
    },
    [grade]
  );

  useEffect(() => {
    reset(grade);
  }, [grade, reset]);

  const handleChoice = (choice: string) => {
    if (selected !== null || finished) return;
    setSelected(choice);
    const isRight = choice === question.answerLabel;

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
        setQuestion(generateClockQuestion(grade));
      }
    }, isRight ? 520 : 1050);
  };

  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🕐 Quelle Heure est-il ?
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Rouge = Heures · Bleue = Minutes !
          </p>
        </div>

        <GradeBadgeToggle />
      </div>

      {!finished ? (
        <div className="flex w-full flex-col items-center gap-4 rounded-3xl bg-white p-5 sm:p-6 shadow-md border-2 border-amber-200/80">
          <div className="flex w-full items-center justify-between text-xs font-extrabold text-amber-900/70">
            <span>
              Question {step + 1} / {TOTAL}
            </span>
            <span>Score : {score}</span>
          </div>

          <AnalogClock hours={question.hours} minutes={question.minutes} />

          <div className="grid w-full grid-cols-2 gap-3">
            {question.choices.map((choice) => {
              const isSel = selected === choice;
              const isAns = choice === question.answerLabel;
              let cls = 'bg-amber-100 text-amber-950 border-b-4 border-amber-300 hover:bg-amber-200';
              if (selected !== null) {
                if (isAns) cls = 'bg-emerald-400 text-white border-b-4 border-emerald-600';
                else if (isSel) cls = 'bg-rose-400 text-white border-b-4 border-rose-600';
                else cls = 'bg-stone-100 text-stone-400 border-b-4 border-stone-200';
              }
              return (
                <button
                  key={choice}
                  type="button"
                  disabled={selected !== null}
                  onClick={() => handleChoice(choice)}
                  className={`h-16 rounded-2xl font-display text-2xl font-bold transition active:scale-95 ${cls}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-4 rounded-3xl bg-white p-7 text-center shadow-md border-2 border-amber-300">
          <span className="text-5xl">🕐</span>
          <h3 className="font-display text-3xl font-bold text-amber-950">
            Champion de l'horloge ! 🎉
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
            Tu as lu <span className="text-emerald-600">{score}</span> heures sur {TOTAL} !
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

export default GameClock;
