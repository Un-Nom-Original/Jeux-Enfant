import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { RotateCcw, Users, User } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';

interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_THEMES = [
  { id: 'animals', label: '🐾 Animaux', items: ['🐶', '🐱', '🐰', '🦊', '🐼', '🦁', '🐸', '🐧', '🦄', '🐙'] },
  { id: 'space', label: '🚀 Espace', items: ['🚀', '🪐', '🌙', '⭐', '👽', '🛸', '☄️', '🌍', '☀️', '🌌'] },
  { id: 'fruits', label: '🍓 Fruits', items: ['🍎', '🍓', '🍌', '🍉', '🍇', '🍒', '🍍', '🥝', '🍑', '🍋'] },
  { id: 'dinos', label: '🦕 Nature', items: ['🦕', '🦖', '🦋', '🐢', '🐝', '🌻', '🍄', '🌈', '🐠', '🦀'] },
];

function createDeck(pairCount: number, items: string[]): MemoryCard[] {
  const chosen = items.slice(0, pairCount);
  const doubled = [...chosen, ...chosen];
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled.map((emoji, idx) => ({
    id: idx,
    emoji,
    isFlipped: false,
    isMatched: false,
  }));
}

export function GameMemory() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin } = useSound();

  const pairCount = grade === '1re' ? 6 : 10;

  const [themeId, setThemeId] = useState(MEMORY_THEMES[0].id);
  const [twoPlayers, setTwoPlayers] = useState(false);
  const [cards, setCards] = useState<MemoryCard[]>(() =>
    createDeck(pairCount, MEMORY_THEMES[0].items)
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [isLocked, setIsLocked] = useState(false);

  const activeTheme = MEMORY_THEMES.find((t) => t.id === themeId) ?? MEMORY_THEMES[0];

  const resetGame = useCallback(
    (nextPairs = pairCount, items = activeTheme.items) => {
      setCards(createDeck(nextPairs, items));
      setSelectedIds([]);
      setMoves(0);
      setCurrentPlayer(1);
      setScores([0, 0]);
      setIsLocked(false);
    },
    [activeTheme.items, pairCount]
  );

  useEffect(() => {
    resetGame(pairCount, activeTheme.items);
  }, [grade, themeId, pairCount, activeTheme.items, resetGame]);

  const allMatched = cards.length > 0 && cards.every((c) => c.isMatched);

  const handleCardClick = (cardId: number) => {
    if (isLocked || allMatched) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    playClick();
    const nextCards = cards.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c));
    const nextSelected = [...selectedIds, cardId];
    setCards(nextCards);
    setSelectedIds(nextSelected);

    if (nextSelected.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);
      const [firstId, secondId] = nextSelected;
      const first = nextCards.find((c) => c.id === firstId)!;
      const second = nextCards.find((c) => c.id === secondId)!;

      if (first.emoji === second.emoji) {
        setTimeout(() => {
          const matchedCards = nextCards.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          );
          setCards(matchedCards);
          setSelectedIds([]);
          setIsLocked(false);
          if (twoPlayers) {
            setScores((prev) =>
              currentPlayer === 1 ? [prev[0] + 1, prev[1]] : [prev[0], prev[1] + 1]
            );
          }

          if (matchedCards.every((c) => c.isMatched)) {
            playWin();
            try {
              confetti({ particleCount: 95, spread: 80, origin: { y: 0.55 } });
            } catch {
              // Ignore confetti errors
            }
          } else {
            playMerge(64);
          }
        }, 320);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setSelectedIds([]);
          setIsLocked(false);
          if (twoPlayers) {
            setCurrentPlayer((p) => (p === 1 ? 2 : 1));
          }
        }, 780);
      }
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🃏 Jeu de Mémoire
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Retourne deux cartes identiques pour trouver toutes les paires !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
          <button
            type="button"
            onClick={() => {
              playClick();
              setTwoPlayers((v) => !v);
              resetGame();
            }}
            className={`flex h-11 items-center gap-1.5 rounded-2xl px-3.5 text-xs font-extrabold transition active:scale-95 ${
              twoPlayers
                ? 'bg-purple-500 text-white shadow-sm'
                : 'bg-white text-amber-950 border-2 border-amber-200'
            }`}
          >
            {twoPlayers ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
            {twoPlayers ? '2 Joueurs' : 'Solo'}
          </button>
        </div>
      </div>

      {/* Thèmes + Stats */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {MEMORY_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                playClick();
                setThemeId(t.id);
              }}
              className={`h-10 rounded-xl px-3 text-xs font-extrabold transition ${
                themeId === t.id
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'bg-white text-amber-900/75 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {twoPlayers ? (
            <div className="flex items-center gap-2">
              <span
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold ${
                  currentPlayer === 1
                    ? 'bg-sky-500 text-white ring-2 ring-sky-300'
                    : 'bg-sky-100 text-sky-900'
                }`}
              >
                J1 : {scores[0]}
              </span>
              <span
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold ${
                  currentPlayer === 2
                    ? 'bg-pink-500 text-white ring-2 ring-pink-300'
                    : 'bg-pink-100 text-pink-900'
                }`}
              >
                J2 : {scores[1]}
              </span>
            </div>
          ) : (
            <span className="rounded-xl bg-white px-3.5 py-1.5 text-sm font-extrabold text-amber-950 border border-amber-200">
              Coups : {moves}
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              playClick();
              resetGame();
            }}
            aria-label="Recommencer"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-950 hover:bg-amber-200 active:scale-95 transition"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Plateau de cartes */}
      <div
        className={`grid w-full gap-2.5 sm:gap-3 rounded-3xl bg-white p-4 shadow-md border-2 border-amber-200/80 ${
          pairCount === 6 ? 'grid-cols-3 sm:grid-cols-4 max-w-xl' : 'grid-cols-4 sm:grid-cols-5 max-w-2xl'
        }`}
      >
        {cards.map((card) => {
          const revealed = card.isFlipped || card.isMatched;
          return (
            <motion.button
              key={card.id}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => handleCardClick(card.id)}
              aria-label={revealed ? card.emoji : 'Carte cachée'}
              className={`aspect-square rounded-2xl border-b-4 font-display text-4xl sm:text-5xl flex items-center justify-center transition-all select-none ${
                card.isMatched
                  ? 'bg-emerald-100 border-emerald-400 scale-[0.97]'
                  : revealed
                  ? 'bg-amber-50 border-amber-300 shadow-inner'
                  : 'bg-gradient-to-br from-amber-400 to-orange-500 border-orange-700 text-white hover:brightness-105 shadow-sm'
              }`}
            >
              {revealed ? card.emoji : '❓'}
            </motion.button>
          );
        })}
      </div>

      {allMatched && (
        <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl bg-emerald-100 px-5 py-3 border-2 border-emerald-300">
          <p className="font-display text-lg font-bold text-emerald-950">
            {twoPlayers
              ? scores[0] === scores[1]
                ? 'Égalité parfaite ! 🤝'
                : scores[0] > scores[1]
                ? 'Bravo Joueur 1 ! 🏆'
                : 'Bravo Joueur 2 ! 🏆'
              : `Bravo ! Toutes les paires trouvées en ${moves} coups ! 🎉`}
          </p>
          <button
            type="button"
            onClick={() => {
              playClick();
              resetGame();
            }}
            className="h-11 rounded-2xl bg-emerald-500 px-5 font-display text-base font-bold text-white active:scale-95 transition"
          >
            Rejouer
          </button>
        </div>
      )}
    </div>
  );
}

export default GameMemory;
