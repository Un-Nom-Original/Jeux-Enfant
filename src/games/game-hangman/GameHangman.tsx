import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Lightbulb, RotateCcw, Trophy } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { getWordsForGrade, normalizeLetter, type WordEntry } from './words';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function pickRandomWord(list: WordEntry[], excludeWord?: string): WordEntry {
  const candidates = list.filter((item) => item.word !== excludeWord);
  const pool = candidates.length > 0 ? candidates : list;
  return pool[Math.floor(Math.random() * pool.length)];
}

function SnowmanDrawing({ wrongCount, maxWrong }: { wrongCount: number; maxWrong: number }) {
  // Dessin mignon du bonhomme de neige qui apparaît / perd ses morceaux joyeusement
  const progress = wrongCount / maxWrong;
  const stage = Math.round(progress * 7);

  return (
    <svg viewBox="0 0 220 200" className="h-44 w-48 sm:h-48 sm:w-52">
      {/* Sol enneigé */}
      <ellipse cx="110" cy="182" rx="85" ry="12" fill="#DBEAFE" />
      {/* Base du bonhomme (étape 1) */}
      {stage >= 1 && (
        <circle cx="110" cy="145" r="34" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="4" />
      )}
      {/* Ventre (étape 2) */}
      {stage >= 2 && (
        <>
          <circle cx="110" cy="96" r="25" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="4" />
          <circle cx="110" cy="88" r="3" fill="#1E3A8A" />
          <circle cx="110" cy="100" r="3" fill="#1E3A8A" />
        </>
      )}
      {/* Tête (étape 3) */}
      {stage >= 3 && (
        <circle cx="110" cy="56" r="19" fill="#FFFFFF" stroke="#60A5FA" strokeWidth="4" />
      )}
      {/* Écharpe rouge (étape 4) */}
      {stage >= 4 && (
        <>
          <rect x="92" y="70" width="36" height="9" rx="4" fill="#F43F5E" />
          <rect x="118" y="74" width="9" height="22" rx="4" fill="#E11D48" />
        </>
      )}
      {/* Bras en branches (étape 5) */}
      {stage >= 5 && (
        <>
          <line x1="85" y1="95" x2="52" y2="80" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
          <line x1="135" y1="95" x2="168" y2="80" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {/* Chapeau (étape 6) */}
      {stage >= 6 && (
        <>
          <rect x="86" y="34" width="48" height="6" rx="3" fill="#1E293B" />
          <rect x="94" y="12" width="32" height="24" rx="4" fill="#334155" />
          <rect x="94" y="29" width="32" height="5" fill="#FACC15" />
        </>
      )}
      {/* Visage inquiet/surpris final (étape 7) */}
      {stage >= 7 && (
        <>
          <circle cx="103" cy="52" r="2.5" fill="#1E293B" />
          <circle cx="117" cy="52" r="2.5" fill="#1E293B" />
          <polygon points="110,55 126,59 110,62" fill="#F97316" />
          <path d="M103 65 Q110 61 117 65" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* Visage souriant si pas encore fini et tête présente */}
      {stage >= 3 && stage < 7 && (
        <>
          <circle cx="103" cy="52" r="2.5" fill="#1E293B" />
          <circle cx="117" cy="52" r="2.5" fill="#1E293B" />
          <polygon points="110,55 124,58 110,61" fill="#F97316" />
          <path d="M103 62 Q110 68 117 62" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function GameHangman() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin, playGameOver } = useSound();

  const maxWrong = grade === '1re' ? 8 : 7;

  const [entry, setEntry] = useState<WordEntry>(() => pickRandomWord(getWordsForGrade(grade)));
  const [guessed, setGuessed] = useState<string[]>([]);
  const [showEmojiHint, setShowEmojiHint] = useState<boolean>(grade === '1re');
  const [wins, setWins] = useState(0);

  const startNewRound = useCallback(
    (nextGrade = grade, prevWord?: string) => {
      const words = getWordsForGrade(nextGrade);
      setEntry(pickRandomWord(words, prevWord));
      setGuessed([]);
      setShowEmojiHint(nextGrade === '1re');
    },
    [grade]
  );

  // Réinitialise quand on change de niveau 1re / 3e année
  useEffect(() => {
    startNewRound(grade);
  }, [grade, startNewRound]);

  const normalizedChars = entry.word.split('').map(normalizeLetter);
  const wrongLetters = guessed.filter((letter) => !normalizedChars.includes(letter));
  const wrongCount = wrongLetters.length;
  const isWon = normalizedChars.every((ch) => guessed.includes(ch));
  const isLost = wrongCount >= maxWrong && !isWon;

  const handleGuess = useCallback(
    (letter: string) => {
      if (isWon || isLost || guessed.includes(letter)) return;
      const nextGuessed = [...guessed, letter];
      setGuessed(nextGuessed);

      const isCorrect = normalizedChars.includes(letter);
      if (isCorrect) {
        const nowWon = normalizedChars.every((ch) => nextGuessed.includes(ch));
        if (nowWon) {
          setWins((w) => w + 1);
          playWin();
          try {
            confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
          } catch {
            // Ignore confetti errors
          }
        } else {
          playMerge(32);
        }
      } else {
        const nextWrong = wrongCount + 1;
        if (nextWrong >= maxWrong) {
          playGameOver();
        } else {
          playClick();
        }
      }
    },
    [guessed, isLost, isWon, maxWrong, normalizedChars, playClick, playGameOver, playMerge, playWin, wrongCount]
  );

  const handleRevealLetter = () => {
    if (isWon || isLost) return;
    playClick();
    if (!showEmojiHint) {
      setShowEmojiHint(true);
      return;
    }
    const missing = normalizedChars.find((ch) => !guessed.includes(ch));
    if (missing) {
      handleGuess(missing);
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      {/* En-tête */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            ⛄ Bonhomme Pendu
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Trouve le mot mystère avant que le bonhomme de neige soit complet !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
          <div className="flex items-center gap-1.5 rounded-2xl bg-amber-100 px-3.5 py-2 border border-amber-300">
            <Trophy className="h-4 w-4 text-amber-600" />
            <span className="font-display text-lg font-bold text-amber-950">{wins}</span>
          </div>
        </div>
      </div>

      {/* Carte principale */}
      <div className="flex w-full flex-col items-center gap-4 rounded-3xl bg-white p-4 sm:p-6 shadow-md border-2 border-amber-200/80">
        {/* Zone dessin + indice + essais restants */}
        <div className="flex w-full flex-col sm:flex-row items-center justify-around gap-4">
          <div className="rounded-3xl bg-sky-50/80 p-2 border-2 border-sky-100">
            <SnowmanDrawing wrongCount={wrongCount} maxWrong={maxWrong} />
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <span className="rounded-full bg-rose-100 px-3.5 py-1 text-xs font-extrabold text-rose-700">
              Thème : {entry.theme}
            </span>

            {showEmojiHint ? (
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-5xl border-2 border-amber-200 shadow-xs">
                {entry.emoji}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRevealLetter}
                className="flex items-center gap-2 rounded-2xl bg-amber-100 px-4 py-2.5 text-sm font-extrabold text-amber-900 hover:bg-amber-200 active:scale-95 transition"
              >
                <Lightbulb className="h-4 w-4 text-amber-600" />
                Voir l'indice image
              </button>
            )}

            <p className="text-sm font-bold text-amber-900/75">
              Essais restants :{' '}
              <span className="font-display text-lg text-orange-600">
                {Math.max(0, maxWrong - wrongCount)}
              </span>
            </p>
          </div>
        </div>

        {/* Mot à deviner */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 py-2">
          {entry.word.split('').map((origChar, idx) => {
            const norm = normalizedChars[idx];
            const revealed = guessed.includes(norm) || isLost;
            return (
              <div
                key={idx}
                className={`flex h-12 w-10 sm:h-14 sm:w-12 items-center justify-center rounded-2xl border-b-4 font-display text-2xl sm:text-3xl font-bold transition-all ${
                  revealed
                    ? isLost && !guessed.includes(norm)
                      ? 'bg-rose-100 border-rose-400 text-rose-700'
                      : 'bg-emerald-100 border-emerald-400 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-transparent'
                }`}
              >
                {revealed ? origChar : '_'}
              </div>
            );
          })}
        </div>

        {/* Message de fin de manche */}
        {(isWon || isLost) && (
          <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl bg-amber-50 px-5 py-3 border-2 border-amber-200">
            <p className="font-display text-lg font-bold text-amber-950">
              {isWon
                ? `Bravo ! Tu as trouvé « ${entry.word} » 🎉`
                : `Dommage ! Le mot était « ${entry.word} » ⛄`}
            </p>
            <button
              type="button"
              onClick={() => {
                playClick();
                startNewRound(grade, entry.word);
              }}
              className="flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 font-display text-base font-bold text-white shadow-sm active:scale-95 transition"
            >
              <RotateCcw className="h-4 w-4" />
              Mot suivant
            </button>
          </div>
        )}

        {/* Clavier tactile ABC */}
        <div className="grid w-full grid-cols-7 sm:grid-cols-9 gap-1.5 sm:gap-2">
          {ALPHABET.map((letter) => {
            const used = guessed.includes(letter);
            const isGood = used && normalizedChars.includes(letter);
            const isBad = used && !isGood;

            return (
              <button
                key={letter}
                type="button"
                disabled={used || isWon || isLost}
                onClick={() => handleGuess(letter)}
                className={`h-12 rounded-xl font-display text-lg font-bold transition active:scale-95 focus-visible:outline-2 focus-visible:outline-orange-500 ${
                  isGood
                    ? 'bg-emerald-400 text-white border-b-4 border-emerald-600'
                    : isBad
                    ? 'bg-stone-200 text-stone-400 opacity-50'
                    : 'bg-amber-100 text-amber-950 border-b-4 border-amber-300 hover:bg-amber-200'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Boutons bas : Indice lettre + Nouveau mot */}
        {!isWon && !isLost && (
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleRevealLetter}
              className="flex h-11 items-center gap-1.5 rounded-2xl bg-sky-100 px-4 text-sm font-extrabold text-sky-900 hover:bg-sky-200 active:scale-95 transition"
            >
              <Lightbulb className="h-4 w-4 text-sky-600" />
              {showEmojiHint ? 'Aide (+1 lettre)' : 'Indice image'}
            </button>
            <button
              type="button"
              onClick={() => {
                playClick();
                startNewRound(grade, entry.word);
              }}
              className="flex h-11 items-center gap-1.5 rounded-2xl bg-amber-50 px-4 text-sm font-extrabold text-amber-900 border border-amber-200 hover:bg-amber-100 active:scale-95 transition"
            >
              <RotateCcw className="h-4 w-4" />
              Autre mot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameHangman;
