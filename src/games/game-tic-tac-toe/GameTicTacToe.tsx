import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Bot, RotateCcw, Users } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';

type Cell = 'X' | 'O' | null;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: Cell[]): { winner: 'X' | 'O'; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

function chooseAiMove(board: Cell[], smart: boolean): number {
  const empty = board
    .map((v, idx) => (v === null ? idx : -1))
    .filter((idx) => idx !== -1);
  if (empty.length === 0) return -1;

  if (smart) {
    // 1. Gagner si possible
    for (const idx of empty) {
      const copy = [...board];
      copy[idx] = 'O';
      if (checkWinner(copy)?.winner === 'O') return idx;
    }
    // 2. Bloquer X si dangereux
    for (const idx of empty) {
      const copy = [...board];
      copy[idx] = 'X';
      if (checkWinner(copy)?.winner === 'X') return idx;
    }
    // 3. Prendre le centre
    if (board[4] === null) return 4;
  }

  return empty[Math.floor(Math.random() * empty.length)];
}

export function GameTicTacToe() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin, playGameOver } = useSound();

  const [vsAi, setVsAi] = useState(true);
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [scores, setScores] = useState({ X: 0, O: 0 });

  const winInfo = checkWinner(board);
  const isDraw = !winInfo && board.every((c) => c !== null);

  const resetRound = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
  };

  // Tour de l'ordinateur
  useEffect(() => {
    if (!vsAi || turn !== 'O' || winInfo || isDraw) return;
    const timer = window.setTimeout(() => {
      const idx = chooseAiMove(board, grade === '3e');
      if (idx === -1) return;
      const next = [...board];
      next[idx] = 'O';
      setBoard(next);
      const nextWin = checkWinner(next);
      if (nextWin) {
        setScores((s) => ({ ...s, O: s.O + 1 }));
        playGameOver();
      } else {
        playMerge(16);
        setTurn('X');
      }
    }, 420);
    return () => window.clearTimeout(timer);
  }, [board, grade, isDraw, playGameOver, playMerge, turn, vsAi, winInfo]);

  const handleCellClick = (idx: number) => {
    if (board[idx] || winInfo || isDraw) return;
    if (vsAi && turn === 'O') return;

    const next = [...board];
    next[idx] = turn;
    setBoard(next);

    const nextWin = checkWinner(next);
    if (nextWin) {
      setScores((s) => ({ ...s, [nextWin.winner]: s[nextWin.winner] + 1 }));
      playWin();
      try {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Ignore confetti errors
      }
    } else if (next.every((c) => c !== null)) {
      playClick();
    } else {
      playMerge(32);
      setTurn(turn === 'X' ? 'O' : 'X');
    }
  };

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            ⭕ Morpion
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Aligne 3 symboles identiques pour gagner la manche !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
          <button
            type="button"
            onClick={() => {
              playClick();
              setVsAi((v) => !v);
              setScores({ X: 0, O: 0 });
              resetRound();
            }}
            className={`flex h-11 items-center gap-1.5 rounded-2xl px-3.5 text-xs font-extrabold transition active:scale-95 ${
              vsAi
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'bg-pink-500 text-white shadow-sm'
            }`}
          >
            {vsAi ? <Bot className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            {vsAi ? 'Vs Ordi' : '2 Joueurs'}
          </button>
        </div>
      </div>

      {/* Tableau des scores */}
      <div className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm border-2 border-amber-200">
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-1 font-display font-bold ${
            !winInfo && !isDraw && turn === 'X' ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-300' : 'text-amber-950'
          }`}
        >
          <span>❌ {vsAi ? 'Toi' : 'J1'}</span>
          <span className="text-xl">{scores.X}</span>
        </div>

        <span className="text-xs font-extrabold uppercase text-amber-800/50">VS</span>

        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-1 font-display font-bold ${
            !winInfo && !isDraw && turn === 'O' ? 'bg-sky-100 text-sky-700 ring-2 ring-sky-300' : 'text-amber-950'
          }`}
        >
          <span>⭕ {vsAi ? 'Ordi' : 'J2'}</span>
          <span className="text-xl">{scores.O}</span>
        </div>
      </div>

      {/* Grille 3x3 à dimensions fixes */}
      <div className="grid aspect-square w-full max-w-[min(86vw,360px)] grid-cols-3 grid-rows-3 gap-3 rounded-3xl bg-amber-200/80 p-3 shadow-md border-4 border-amber-300">
        {board.map((cell, idx) => {
          const isWinCell = winInfo?.line.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCellClick(idx)}
              className={`aspect-square h-full w-full min-h-0 min-w-0 flex items-center justify-center rounded-2xl font-display text-5xl sm:text-6xl font-bold leading-none shadow-xs transition active:scale-95 ${
                isWinCell
                  ? 'bg-emerald-300 scale-[1.03]'
                  : 'bg-white hover:bg-amber-50'
              }`}
            >
              <span className="leading-none select-none">
                {cell === 'X' ? '❌' : cell === 'O' ? '⭕' : '\u00A0'}
              </span>
            </button>
          );
        })}
      </div>

      {(winInfo || isDraw) && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber-100 px-5 py-3 border-2 border-amber-300">
          <p className="font-display text-lg font-bold text-amber-950">
            {isDraw
              ? 'Égalité ! 🤝'
              : winInfo?.winner === 'X'
              ? vsAi
                ? 'Bravo ! Tu as gagné ! 🎉'
                : 'Joueur 1 gagne ! 🎉'
              : vsAi
              ? "L'ordinateur gagne cette manche !"
              : 'Joueur 2 gagne ! 🎉'}
          </p>
          <button
            type="button"
            onClick={() => {
              playClick();
              resetRound();
            }}
            className="flex h-11 items-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 font-display text-base font-bold text-white active:scale-95 transition"
          >
            <RotateCcw className="h-4 w-4" />
            Rejouer
          </button>
        </div>
      )}
    </div>
  );
}

export default GameTicTacToe;
