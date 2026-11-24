import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Lightbulb, RotateCcw, Shuffle, Trophy } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { getWordsForGrade, normalizeLetter, type WordEntry } from '../game-hangman/words';

interface LetterTile {
  id: number;
  char: string;
}

function scrambleWord(word: string): LetterTile[] {
  const letters = normalizeLetter(word).split('');
  const tiles = letters.map((char, idx) => ({ id: idx, char }));
  for (let attempt = 0; attempt < 8; attempt++) {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    if (tiles.map((t) => t.char).join('') !== letters.join('')) break;
  }
  return tiles;
}

function pickWord(list: WordEntry[], exclude?: string): WordEntry {
  const pool = list.filter((w) => w.word !== exclude);
  const src = pool.length > 0 ? pool : list;
  return src[Math.floor(Math.random() * src.length)];
}

export function GameAnagram() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin } = useSound();

  const [entry, setEntry] = useState<WordEntry>(() => pickWord(getWordsForGrade(grade)));
  const [pool, setPool] = useState<LetterTile[]>(() => scrambleWord(entry.word));
  const [answer, setAnswer] = useState<LetterTile[]>([]);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);

  const loadNewWord = useCallback(
    (nextGrade = grade, prevWord?: string) => {
      const next = pickWord(getWordsForGrade(nextGrade), prevWord);
      setEntry(next);
      setPool(scrambleWord(next.word));
      setAnswer([]);
      setSolved(false);
    },
    [grade]
  );

  useEffect(() => {
    loadNewWord(grade);
  }, [grade, loadNewWord]);

  const targetNormalized = normalizeLetter(entry.word);

  const checkSolved = (nextAnswer: LetterTile[]) => {
    const built = nextAnswer.map((t) => t.char).join('');
    if (built === targetNormalized) {
      setSolved(true);
      setScore((s) => s + 1);
      playWin();
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Ignore confetti errors
      }
    }
  };

  const handlePickFromPool = (tile: LetterTile) => {
    if (solved) return;
    playMerge(16);
    const nextPool = pool.filter((t) => t.id !== tile.id);
    const nextAnswer = [...answer, tile];
    setPool(nextPool);
    setAnswer(nextAnswer);
    checkSolved(nextAnswer);
  };

  const handleReturnToPool = (tile: LetterTile) => {
    if (solved) return;
    playClick();
    setAnswer((prev) => prev.filter((t) => t.id !== tile.id));
    setPool((prev) => [...prev, tile]);
  };

  const handleShufflePool = () => {
    playClick();
    setPool((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  };

  const handleHint = () => {
    if (solved) return;
    playClick();
    // Place la prochaine bonne lettre
    let prefixLen = 0;
    while (
      prefixLen < answer.length &&
      answer[prefixLen].char === targetNormalized[prefixLen]
    ) {
      prefixLen++;
    }
    const keptAnswer = answer.slice(0, prefixLen);
    const returned = answer.slice(prefixLen);
    const nextPool = [...pool, ...returned];
    const neededChar = targetNormalized[prefixLen];
    const foundIdx = nextPool.findIndex((t) => t.char === neededChar);
    if (foundIdx === -1) return;

    const chosen = nextPool[foundIdx];
    const finalPool = nextPool.filter((t) => t.id !== chosen.id);
    const finalAnswer = [...keptAnswer, chosen];
    setPool(finalPool);
    setAnswer(finalAnswer);
    checkSolved(finalAnswer);
  };

  const isWrongFull =
    !solved && answer.length === targetNormalized.length && answer.map((t) => t.char).join('') !== targetNormalized;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🔀 Mots Mélangés
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Remets les lettres dans le bon ordre !
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
        <div className="flex flex-col items-center gap-1.5">
          <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-extrabold text-purple-700">
            {entry.theme}
          </span>
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-50 text-6xl border-2 border-amber-200">
            {entry.emoji}
          </div>
        </div>

        {/* Cases de réponse */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {targetNormalized.split('').map((_, idx) => {
            const tile = answer[idx];
            return (
              <button
                key={idx}
                type="button"
                disabled={!tile || solved}
                onClick={() => tile && handleReturnToPool(tile)}
                className={`flex h-14 w-12 sm:h-16 sm:w-14 items-center justify-center rounded-2xl border-b-4 font-display text-2xl sm:text-3xl font-bold transition active:scale-95 ${
                  solved
                    ? 'bg-emerald-400 border-emerald-600 text-white'
                    : isWrongFull
                    ? 'bg-rose-100 border-rose-400 text-rose-800'
                    : tile
                    ? 'bg-sky-100 border-sky-400 text-sky-950 hover:bg-sky-200'
                    : 'bg-amber-50/70 border-dashed border-2 border-amber-300 text-transparent'
                }`}
              >
                {tile ? tile.char : '_'}
              </button>
            );
          })}
        </div>

        {isWrongFull && (
          <p className="text-sm font-extrabold text-rose-600">
            Presque ! Touche une lettre pour la replacer ou demande un indice.
          </p>
        )}

        {/* Lettres mélangées disponibles */}
        {!solved ? (
          <div className="flex flex-wrap items-center justify-center gap-2 min-h-[64px]">
            {pool.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => handlePickFromPool(tile)}
                className="flex h-14 w-12 sm:h-16 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-300 to-amber-400 border-b-4 border-amber-600 font-display text-2xl sm:text-3xl font-bold text-amber-950 shadow-sm hover:brightness-105 active:scale-95 transition"
              >
                {tile.char}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-emerald-50 px-6 py-4 border-2 border-emerald-200">
            <p className="font-display text-xl font-bold text-emerald-900">
              Bravo ! C'est bien « {entry.word} » 🎉
            </p>
            <button
              type="button"
              onClick={() => {
                playClick();
                loadNewWord(grade, entry.word);
              }}
              className="h-12 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 font-display text-base font-bold text-white shadow-sm active:scale-95 transition"
            >
              Mot suivant
            </button>
          </div>
        )}

        {/* Boutons d'aide */}
        {!solved && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleShufflePool}
              className="flex h-11 items-center gap-1.5 rounded-2xl bg-amber-100 px-4 text-sm font-extrabold text-amber-950 hover:bg-amber-200 active:scale-95 transition"
            >
              <Shuffle className="h-4 w-4" />
              Mélanger
            </button>
            <button
              type="button"
              onClick={handleHint}
              className="flex h-11 items-center gap-1.5 rounded-2xl bg-sky-100 px-4 text-sm font-extrabold text-sky-900 hover:bg-sky-200 active:scale-95 transition"
            >
              <Lightbulb className="h-4 w-4" />
              Indice
            </button>
            <button
              type="button"
              onClick={() => {
                playClick();
                loadNewWord(grade, entry.word);
              }}
              className="flex h-11 items-center gap-1.5 rounded-2xl bg-stone-100 px-4 text-sm font-extrabold text-stone-700 hover:bg-stone-200 active:scale-95 transition"
            >
              <RotateCcw className="h-4 w-4" />
              Passer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameAnagram;
