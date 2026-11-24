import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { RotateCcw, Star } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { generateMathQuestion, type MathQuestion } from './generator';

const TOTAL_QUESTIONS = 10;

export function GameMathRace() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin, playGameOver } = useSound();

  const [racer, setRacer] = useState<'🚀' | '🦕'>('🚀');
  const [step, setStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState<MathQuestion>(() => generateMathQuestion(grade));
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const resetRace = useCallback(
    (nextGrade = grade) => {
      setStep(0);
      setCorrectCount(0);
      setStreak(0);
      setSelectedChoice(null);
      setIsFinished(false);
      setQuestion(generateMathQuestion(nextGrade));
    },
    [grade]
  );

  useEffect(() => {
    resetRace(grade);
  }, [grade, resetRace]);

  const handleChoose = (choice: number) => {
    if (selectedChoice !== null || isFinished) return;
    setSelectedChoice(choice);

    const isRight = choice === question.answer;
    if (isRight) {
      setCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);
      playMerge(64);
    } else {
      setStreak(0);
      playGameOver();
    }

    setTimeout(() => {
      const nextStep = step + 1;
      if (nextStep >= TOTAL_QUESTIONS) {
        setStep(TOTAL_QUESTIONS);
        setIsFinished(true);
        playWin();
        try {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 } });
        } catch {
          // Ignore confetti errors
        }
      } else {
        setStep(nextStep);
        setSelectedChoice(null);
        setQuestion(generateMathQuestion(grade));
      }
    }, isRight ? 450 : 950);
  };

  const progressPercent = (step / TOTAL_QUESTIONS) * 100;
  const stars = correctCount >= 9 ? 3 : correctCount >= 7 ? 2 : correctCount >= 4 ? 1 : 0;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🚀 Course de Calcul
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Réponds aux 10 calculs pour franchir la ligne d'arrivée !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
          <button
            type="button"
            onClick={() => {
              playClick();
              setRacer((r) => (r === '🚀' ? '🦕' : '🚀'));
            }}
            title="Changer de personnage"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl shadow-xs border-2 border-amber-200 hover:bg-amber-50 active:scale-95 transition"
          >
            {racer}
          </button>
        </div>
      </div>

      {/* Piste de course visuelle */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-sky-100 via-indigo-50 to-amber-100 p-4 shadow-sm border-2 border-sky-200">
        <div className="flex items-center justify-between text-xs font-extrabold text-sky-900 mb-2">
          <span>
            Question {Math.min(step + 1, TOTAL_QUESTIONS)} / {TOTAL_QUESTIONS}
          </span>
          {streak >= 2 && (
            <span className="rounded-full bg-orange-400 px-2.5 py-0.5 text-white">
              🔥 Série {streak}x
            </span>
          )}
          <span>Score : {correctCount}</span>
        </div>

        <div className="relative h-12 w-full rounded-2xl bg-white/80 border-2 border-dashed border-sky-300 flex items-center px-3 overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-300/40 to-amber-300/50 transition-all duration-300"
          />
          <motion.div
            animate={{ left: `calc(${Math.min(progressPercent, 90)}% + 4px)` }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="relative z-10 text-3xl select-none"
          >
            {racer}
          </motion.div>
          <span className="absolute right-3 text-2xl select-none" aria-hidden="true">
            🏁
          </span>
        </div>
      </div>

      {/* Zone de question ou fin de course */}
      {!isFinished ? (
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl bg-white p-6 shadow-md border-2 border-amber-200/80">
          <div className="rounded-3xl bg-amber-50 px-8 py-5 border-2 border-amber-200">
            <p className="font-display text-4xl sm:text-5xl font-bold text-amber-950 tracking-wide">
              {question.prompt}
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            {question.choices.map((choice) => {
              const isSelected = selectedChoice === choice;
              const isAnswer = choice === question.answer;
              let btnClass =
                'bg-amber-100 text-amber-950 border-b-4 border-amber-300 hover:bg-amber-200';
              if (selectedChoice !== null) {
                if (isAnswer) {
                  btnClass = 'bg-emerald-400 text-white border-b-4 border-emerald-600 scale-[1.02]';
                } else if (isSelected) {
                  btnClass = 'bg-rose-400 text-white border-b-4 border-rose-600';
                } else {
                  btnClass = 'bg-stone-100 text-stone-400 border-b-4 border-stone-200';
                }
              }

              return (
                <button
                  key={choice}
                  type="button"
                  disabled={selectedChoice !== null}
                  onClick={() => handleChoose(choice)}
                  className={`h-20 rounded-2xl font-display text-3xl font-bold transition active:scale-95 focus-visible:outline-2 focus-visible:outline-orange-500 ${btnClass}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-4 rounded-3xl bg-white p-7 text-center shadow-md border-2 border-amber-300">
          <span className="text-5xl">{racer}</span>
          <h3 className="font-display text-3xl font-bold text-amber-950">
            Arrivée franchie ! 🎉
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
            Tu as réussi <span className="text-emerald-600">{correctCount}</span> calculs sur{' '}
            {TOTAL_QUESTIONS} !
          </p>
          <button
            type="button"
            onClick={() => {
              playClick();
              resetRace(grade);
            }}
            className="flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 font-display text-lg font-bold text-white shadow-md active:scale-95 transition"
          >
            <RotateCcw className="h-5 w-5" />
            Nouvelle course
          </button>
        </div>
      )}
    </div>
  );
}

export default GameMathRace;
