import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Lightbulb, RotateCcw, Trophy, Volume2 } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { getSentencesForGrade, type SentenceEntry } from './sentences';

interface WordChip {
  id: number;
  text: string;
}

function speakSentence(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-CA';
    u.rate = 0.92;
    const voices = window.speechSynthesis.getVoices();
    const fr =
      voices.find((v) => v.lang.toLowerCase().startsWith('fr-ca')) ??
      voices.find((v) => v.lang.toLowerCase().startsWith('fr'));
    if (fr) {
      u.voice = fr;
      u.lang = fr.lang;
    }
    window.speechSynthesis.speak(u);
  } catch {
    // Ignore speech errors
  }
}

function scrambleWords(words: string[]): WordChip[] {
  const chips = words.map((text, id) => ({ id, text }));
  for (let attempt = 0; attempt < 8; attempt++) {
    for (let i = chips.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chips[i], chips[j]] = [chips[j], chips[i]];
    }
    if (chips.map((c) => c.text).join(' ') !== words.join(' ')) break;
  }
  return chips;
}

function pickSentence(list: SentenceEntry[], exclude?: string): SentenceEntry {
  const pool = list.filter((s) => s.words.join(' ') !== exclude);
  const src = pool.length > 0 ? pool : list;
  return src[Math.floor(Math.random() * src.length)];
}

export function GameSentenceOrder() {
  const { grade } = useGrade();
  const { isMuted, playClick, playMerge, playWin } = useSound();

  const [entry, setEntry] = useState<SentenceEntry>(() => pickSentence(getSentencesForGrade(grade)));
  const [pool, setPool] = useState<WordChip[]>(() => scrambleWords(entry.words));
  const [answer, setAnswer] = useState<WordChip[]>([]);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);

  const loadNext = useCallback(
    (nextGrade = grade, prev?: string) => {
      const next = pickSentence(getSentencesForGrade(nextGrade), prev);
      setEntry(next);
      setPool(scrambleWords(next.words));
      setAnswer([]);
      setSolved(false);
    },
    [grade]
  );

  useEffect(() => {
    loadNext(grade);
  }, [grade, loadNext]);

  const targetSentence = entry.words.join(' ');

  const checkSolved = (nextAnswer: WordChip[]) => {
    const built = nextAnswer.map((w) => w.text).join(' ');
    if (built === targetSentence) {
      setSolved(true);
      setScore((s) => s + 1);
      playWin();
      if (!isMuted) {
        window.setTimeout(() => speakSentence(targetSentence), 250);
      }
      try {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Ignore confetti
      }
    }
  };

  const handlePick = (chip: WordChip) => {
    if (solved) return;
    playMerge(16);
    const nextPool = pool.filter((c) => c.id !== chip.id);
    const nextAnswer = [...answer, chip];
    setPool(nextPool);
    setAnswer(nextAnswer);
    checkSolved(nextAnswer);
  };

  const handleRemove = (chip: WordChip) => {
    if (solved) return;
    playClick();
    setAnswer((prev) => prev.filter((c) => c.id !== chip.id));
    setPool((prev) => [...prev, chip]);
  };

  const handleHint = () => {
    if (solved) return;
    playClick();
    let prefix = 0;
    while (prefix < answer.length && answer[prefix].text === entry.words[prefix]) {
      prefix++;
    }
    const kept = answer.slice(0, prefix);
    const returned = answer.slice(prefix);
    const nextPool = [...pool, ...returned];
    const needed = entry.words[prefix];
    const found = nextPool.find((c) => c.text === needed);
    if (!found) return;
    const finalPool = nextPool.filter((c) => c.id !== found.id);
    const finalAnswer = [...kept, found];
    setPool(finalPool);
    setAnswer(finalAnswer);
    checkSolved(finalAnswer);
  };

  const isWrongFull = !solved && answer.length === entry.words.length;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            📖 Phrase en Ordre
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Touche les mots dans le bon ordre pour construire la phrase !
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
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-5xl border-2 border-amber-200">
          {entry.emoji}
        </div>

        {/* Zone de construction de la phrase */}
        <div
          className={`flex min-h-[82px] w-full flex-wrap items-center justify-center gap-2 rounded-2xl p-3 border-2 transition ${
            solved
              ? 'bg-emerald-50 border-emerald-400'
              : isWrongFull
              ? 'bg-rose-50 border-rose-300'
              : 'bg-amber-50/60 border-dashed border-amber-300'
          }`}
        >
          {answer.length === 0 ? (
            <span className="text-sm font-bold text-amber-800/45">
              Touche les mots ci-dessous pour former la phrase...
            </span>
          ) : (
            answer.map((chip) => (
              <button
                key={chip.id}
                type="button"
                disabled={solved}
                onClick={() => handleRemove(chip)}
                className={`rounded-xl px-3.5 py-2 font-display text-lg sm:text-xl font-bold border-b-4 transition active:scale-95 ${
                  solved
                    ? 'bg-emerald-400 border-emerald-600 text-white'
                    : 'bg-sky-100 border-sky-400 text-sky-950 hover:bg-sky-200'
                }`}
              >
                {chip.text}
              </button>
            ))
          )}
        </div>

        {isWrongFull && (
          <p className="text-sm font-extrabold text-rose-600">
            Presque ! Regarde la majuscule au début et le point à la fin.
          </p>
        )}

        {/* Étiquettes disponibles */}
        {!solved ? (
          <div className="flex flex-wrap items-center justify-center gap-2 min-h-[56px]">
            {pool.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handlePick(chip)}
                className="rounded-xl bg-gradient-to-b from-amber-200 to-amber-300 border-b-4 border-amber-500 px-4 py-2.5 font-display text-lg sm:text-xl font-bold text-amber-950 shadow-xs hover:brightness-105 active:scale-95 transition"
              >
                {chip.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => speakSentence(targetSentence)}
              className="flex h-12 items-center gap-2 rounded-2xl bg-sky-100 px-4 font-display text-base font-bold text-sky-900 hover:bg-sky-200 active:scale-95 transition"
            >
              <Volume2 className="h-5 w-5" />
              Réécouter
            </button>
            <button
              type="button"
              onClick={() => {
                playClick();
                loadNext(grade, targetSentence);
              }}
              className="h-12 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 font-display text-base font-bold text-white shadow-sm active:scale-95 transition"
            >
              Phrase suivante
            </button>
          </div>
        )}

        {!solved && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleHint}
              className="flex h-11 items-center gap-1.5 rounded-2xl bg-sky-100 px-4 text-sm font-extrabold text-sky-900 hover:bg-sky-200 active:scale-95 transition"
            >
              <Lightbulb className="h-4 w-4" />
              Indice (+1 mot)
            </button>
            <button
              type="button"
              onClick={() => {
                playClick();
                loadNext(grade, targetSentence);
              }}
              className="flex h-11 items-center gap-1.5 rounded-2xl bg-stone-100 px-4 text-sm font-extrabold text-stone-700 hover:bg-stone-200 active:scale-95 transition"
            >
              <RotateCcw className="h-4 w-4" />
              Autre phrase
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameSentenceOrder;
