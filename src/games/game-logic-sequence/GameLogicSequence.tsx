import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Trophy } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { generateSequenceQuestion, type SequenceQuestion } from './generator';

export function GameLogicSequence() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin, playGameOver } = useSound();

  const [question, setQuestion] = useState<SequenceQuestion>(() => generateSequenceQuestion(grade));
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const nextQuestion = useCallback(
    (nextGrade = grade) => {
      setQuestion(generateSequenceQuestion(nextGrade));
      setSelected(null);
    },
    [grade]
  );

  useEffect(() => {
    nextQuestion(grade);
  }, [grade, nextQuestion]);

  const handleSelect = (choice: string) => {
    if (selected !== null) return;
    setSelected(choice);
    const isCorrect = choice === question.answer;

    if (isCorrect) {
      const nextScore = score + 1;
      setScore(nextScore);
      setStreak((s) => s + 1);
      if (nextScore % 5 === 0) {
        playWin();
        try {
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        } catch {
          // Ignore confetti errors
        }
      } else {
        playMerge(64);
      }
    } else {
      setStreak(0);
      playGameOver();
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🧩 Suite Logique
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Observe bien le motif et trouve ce qui va à la place du « ? » !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
          <div className="flex items-center gap-1.5 rounded-2xl bg-amber-100 px-3.5 py-2 border border-amber-300">
            <Trophy className="h-4 w-4 text-amber-600" />
            <span className="font-display text-lg font-bold text-amber-950">{score}</span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-5 rounded-3xl bg-white p-5 sm:p-7 shadow-md border-2 border-amber-200/80">
        {streak >= 2 && (
          <span className="rounded-full bg-orange-100 px-3.5 py-1 text-xs font-extrabold text-orange-700">
            🔥 {streak} bonnes réponses de suite !
          </span>
        )}

        {/* Affichage de la suite */}
        <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:gap-3">
          {question.items.map((item, idx) => {
            const isMissing = idx === question.missingIndex;
            const revealed = isMissing && selected !== null;
            return (
              <div
                key={idx}
                className={`flex h-16 w-14 sm:h-20 sm:w-18 items-center justify-center rounded-2xl font-display text-2xl sm:text-3xl font-bold shadow-xs border-b-4 transition ${
                  isMissing
                    ? revealed
                      ? 'bg-emerald-400 border-emerald-600 text-white'
                      : 'bg-orange-100 border-orange-400 text-orange-600 animate-pulse'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                {isMissing ? (revealed ? question.answer : '?') : item}
              </div>
            );
          })}
        </div>

        {/* 4 choix de réponses */}
        <div className="grid w-full grid-cols-2 sm:grid-cols-4 gap-3">
          {question.choices.map((choice) => {
            const isSelected = selected === choice;
            const isAnswer = choice === question.answer;
            let cls = 'bg-amber-100 text-amber-950 border-b-4 border-amber-300 hover:bg-amber-200';
            if (selected !== null) {
              if (isAnswer) {
                cls = 'bg-emerald-400 text-white border-b-4 border-emerald-600';
              } else if (isSelected) {
                cls = 'bg-rose-400 text-white border-b-4 border-rose-600';
              } else {
                cls = 'bg-stone-100 text-stone-400 border-b-4 border-stone-200';
              }
            }

            return (
              <button
                key={choice}
                type="button"
                disabled={selected !== null}
                onClick={() => handleSelect(choice)}
                className={`h-18 rounded-2xl font-display text-3xl font-bold transition active:scale-95 focus-visible:outline-2 focus-visible:outline-orange-500 ${cls}`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {/* Explication + Suivant */}
        {selected !== null && (
          <div className="flex w-full flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-sky-50 px-4 py-3 border-2 border-sky-200">
            <p className="text-sm font-bold text-sky-950 text-center sm:text-left">
              {selected === question.answer ? '✅ Bravo ! ' : '💡 Astuce : '}
              {question.explanation}
            </p>
            <button
              type="button"
              onClick={() => {
                playClick();
                nextQuestion(grade);
              }}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 font-display text-base font-bold text-white shadow-sm active:scale-95 transition"
            >
              Suivant
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameLogicSequence;
