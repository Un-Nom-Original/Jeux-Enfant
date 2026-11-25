import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Star, Volume2 } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { generateListenRound, type ListenWordQuestion } from './words';

const TOTAL_QUESTIONS = 10;

function speakFrenchWord(word: string, slow = false): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.toLowerCase());
    utterance.lang = 'fr-CA';
    utterance.rate = slow ? 0.65 : 0.92;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const frenchVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith('fr-ca')) ??
      voices.find((v) => v.lang.toLowerCase().startsWith('fr'));
    if (frenchVoice) {
      utterance.voice = frenchVoice;
      utterance.lang = frenchVoice.lang;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function GameListenWord() {
  const { grade } = useGrade();
  const { isMuted, playClick, playMerge, playWin, playGameOver } = useSound();

  const [questions, setQuestions] = useState<ListenWordQuestion[]>(() =>
    generateListenRound(grade, TOTAL_QUESTIONS)
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const speechSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const current = questions[index];

  const triggerSpeak = useCallback(
    (word: string, slow = false) => {
      if (isMuted) return;
      setIsSpeaking(true);
      speakFrenchWord(word, slow);
      window.setTimeout(() => setIsSpeaking(false), slow ? 1100 : 800);
    },
    [isMuted]
  );

  const startNewRound = useCallback(
    (nextGrade = grade) => {
      const nextList = generateListenRound(nextGrade, TOTAL_QUESTIONS);
      setQuestions(nextList);
      setIndex(0);
      setScore(0);
      setSelected(null);
      setIsFinished(false);
    },
    [grade]
  );

  useEffect(() => {
    startNewRound(grade);
  }, [grade, startNewRound]);

  // Prononce automatiquement le mot à chaque nouvelle question
  useEffect(() => {
    if (!current || isFinished || selected !== null) return;
    const timer = window.setTimeout(() => {
      triggerSpeak(current.target, false);
    }, 280);
    return () => {
      window.clearTimeout(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [current, isFinished, selected, triggerSpeak]);

  const handleChoose = (choice: string) => {
    if (selected !== null || isFinished || !current) return;
    setSelected(choice);

    const isCorrect = choice === current.target;
    if (isCorrect) {
      setScore((s) => s + 1);
      playMerge(64);
    } else {
      playGameOver();
    }

    window.setTimeout(() => {
      const nextIdx = index + 1;
      if (nextIdx >= questions.length) {
        setIsFinished(true);
        playWin();
        try {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 } });
        } catch {
          // Ignore confetti errors
        }
      } else {
        setIndex(nextIdx);
        setSelected(null);
      }
    }, isCorrect ? 850 : 1350);
  };

  const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🗣️ Écoute & Trouve
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Écoute le mot en français et choisis la bonne écriture parmi les 3 choix !
          </p>
        </div>

        <GradeBadgeToggle />
      </div>

      {!speechSupported && (
        <div className="w-full rounded-2xl bg-amber-100 p-3 text-center text-xs font-bold text-amber-900 border border-amber-300">
          La synthèse vocale n'est pas disponible sur ce navigateur. Utilise Chrome sur la tablette pour entendre les mots !
        </div>
      )}

      {!isFinished && current ? (
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl bg-white p-5 sm:p-7 shadow-md border-2 border-amber-200/80">
          {/* Progression */}
          <div className="flex w-full items-center justify-between text-xs font-extrabold text-amber-900/70">
            <span>
              Mot {index + 1} / {questions.length}
            </span>
            <span>Score : {score}</span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              style={{ width: `${((index + 1) / questions.length) * 100}%` }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
            />
          </div>

          {/* Gros bouton Écouter + Lentement */}
          <div className="flex flex-col items-center gap-3 py-1">
            <button
              type="button"
              onClick={() => triggerSpeak(current.target, false)}
              className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-lg shadow-sky-200 hover:brightness-105 active:scale-95 transition focus-visible:outline-2 focus-visible:outline-orange-500 ${
                isSpeaking ? 'scale-105 ring-4 ring-sky-200' : ''
              }`}
              aria-label="Écouter le mot"
            >
              <Volume2 className="h-11 w-11" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => triggerSpeak(current.target, false)}
                className="h-10 rounded-xl bg-sky-100 px-3.5 text-xs font-extrabold text-sky-900 hover:bg-sky-200 active:scale-95 transition"
              >
                🔊 Réécouter
              </button>
              <button
                type="button"
                onClick={() => triggerSpeak(current.target, true)}
                className="h-10 rounded-xl bg-amber-100 px-3.5 text-xs font-extrabold text-amber-950 hover:bg-amber-200 active:scale-95 transition"
              >
                🐢 Lentement
              </button>
            </div>
          </div>

          {/* 3 choix de réponse */}
          <div className="flex w-full flex-col gap-3">
            {current.choices.map((choice) => {
              const isSelected = selected === choice;
              const isAnswer = choice === current.target;
              let cls =
                'bg-amber-50 text-amber-950 border-b-4 border-amber-300 hover:bg-amber-100';
              if (selected !== null) {
                if (isAnswer) {
                  cls = 'bg-emerald-400 text-white border-b-4 border-emerald-600 scale-[1.01]';
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
                  onClick={() => handleChoose(choice)}
                  className={`flex h-16 w-full items-center justify-center gap-3 rounded-2xl font-display text-2xl sm:text-3xl font-bold tracking-wide transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-orange-500 ${cls}`}
                >
                  <span>{choice}</span>
                  {selected !== null && isAnswer && (
                    <span className="text-3xl" aria-hidden="true">
                      {current.emoji}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-4 rounded-3xl bg-white p-7 text-center shadow-md border-2 border-amber-300">
          <span className="text-5xl">🗣️</span>
          <h3 className="font-display text-3xl font-bold text-amber-950">
            Super oreille ! 🎉
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
            Tu as trouvé <span className="text-emerald-600">{score}</span> mots sur{' '}
            {questions.length} !
          </p>
          <button
            type="button"
            onClick={() => {
              playClick();
              startNewRound(grade);
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

export default GameListenWord;
