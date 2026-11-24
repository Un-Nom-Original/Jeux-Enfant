import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Bot, RotateCcw, Users } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import {
  chooseConnect4AiCol,
  COLS,
  createEmptyConnect4,
  dropDisc,
  findConnect4Winner,
  isConnect4Draw,
  type Disc,
} from './engine';

export function GameConnectFour() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin, playGameOver } = useSound();

  const [vsAi, setVsAi] = useState(true);
  const [board, setBoard] = useState<Disc[][]>(() => createEmptyConnect4());
  const [turn, setTurn] = useState<1 | 2>(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });

  const winInfo = findConnect4Winner(board);
  const draw = !winInfo && isConnect4Draw(board);
  const winCellSet = new Set((winInfo?.cells ?? []).map(([r, c]) => `${r},${c}`));

  const resetRound = () => {
    setBoard(createEmptyConnect4());
    setTurn(1);
  };

  useEffect(() => {
    if (!vsAi || turn !== 2 || winInfo || draw) return;
    const timer = window.setTimeout(() => {
      const col = chooseConnect4AiCol(board, grade === '3e');
      if (col === -1) return;
      const res = dropDisc(board, col, 2);
      if (!res) return;
      setBoard(res.board);
      const nextWin = findConnect4Winner(res.board);
      if (nextWin) {
        setScores((s) => ({ ...s, 2: s[2] + 1 }));
        playGameOver();
      } else {
        playMerge(16);
        setTurn(1);
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [board, draw, grade, playGameOver, playMerge, turn, vsAi, winInfo]);

  const handleColumnClick = (col: number) => {
    if (winInfo || draw) return;
    if (vsAi && turn === 2) return;

    const res = dropDisc(board, col, turn);
    if (!res) return;
    setBoard(res.board);

    const nextWin = findConnect4Winner(res.board);
    if (nextWin) {
      setScores((s) => ({ ...s, [nextWin.winner]: s[nextWin.winner] + 1 }));
      playWin();
      try {
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 } });
      } catch {
        // Ignore confetti errors
      }
    } else if (isConnect4Draw(res.board)) {
      playClick();
    } else {
      playMerge(32);
      setTurn(turn === 1 ? 2 : 1);
    }
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🔴 Puissance 4
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Touche une colonne pour faire tomber ton jeton et en aligner 4 !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
          <button
            type="button"
            onClick={() => {
              playClick();
              setVsAi((v) => !v);
              setScores({ 1: 0, 2: 0 });
              resetRound();
            }}
            className={`flex h-11 items-center gap-1.5 rounded-2xl px-3.5 text-xs font-extrabold text-white shadow-sm transition active:scale-95 ${
              vsAi ? 'bg-indigo-500' : 'bg-pink-500'
            }`}
          >
            {vsAi ? <Bot className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            {vsAi ? 'Vs Ordi' : '2 Joueurs'}
          </button>
        </div>
      </div>

      {/* Scores */}
      <div className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-5 py-2.5 shadow-sm border-2 border-amber-200">
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-1 font-display font-bold ${
            !winInfo && !draw && turn === 1 ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-300' : 'text-amber-950'
          }`}
        >
          <span>🔴 {vsAi ? 'Toi' : 'J1'}</span>
          <span className="text-xl">{scores[1]}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            playClick();
            resetRound();
          }}
          aria-label="Recommencer"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 active:scale-95 transition"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-1 font-display font-bold ${
            !winInfo && !draw && turn === 2 ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400' : 'text-amber-950'
          }`}
        >
          <span>🟡 {vsAi ? 'Ordi' : 'J2'}</span>
          <span className="text-xl">{scores[2]}</span>
        </div>
      </div>

      {/* Plateau bleu classique 7x6 */}
      <div className="w-full max-w-[min(92vw,480px)] rounded-3xl bg-gradient-to-b from-blue-500 to-blue-700 p-2.5 sm:p-3.5 shadow-xl border-b-8 border-blue-900">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: COLS }, (_, col) => (
            <button
              key={col}
              type="button"
              onClick={() => handleColumnClick(col)}
              aria-label={`Colonne ${col + 1}`}
              className="group flex flex-col gap-1.5 sm:gap-2 rounded-2xl p-0.5 hover:bg-white/10 transition focus-visible:outline-2 focus-visible:outline-yellow-300"
            >
              {board.map((row, r) => {
                const cell = row[col];
                const isWin = winCellSet.has(`${r},${col}`);
                return (
                  <div
                    key={r}
                    className="relative aspect-square w-full rounded-full bg-blue-950/45 p-0.5 shadow-inner"
                  >
                    {cell !== 0 && (
                      <motion.div
                        initial={{ y: -140, opacity: 0.6 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                        className={`h-full w-full rounded-full shadow-md ${
                          cell === 1
                            ? 'bg-gradient-to-br from-rose-400 to-red-600'
                            : 'bg-gradient-to-br from-yellow-300 to-amber-500'
                        } ${isWin ? 'ring-4 ring-white animate-pulse' : ''}`}
                      />
                    )}
                  </div>
                );
              })}
            </button>
          ))}
        </div>
      </div>

      {(winInfo || draw) && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-100 px-5 py-3 border-2 border-emerald-300">
          <p className="font-display text-lg font-bold text-emerald-950">
            {draw
              ? 'Grille pleine, égalité ! 🤝'
              : winInfo?.winner === 1
              ? vsAi
                ? 'Bravo ! Puissance 4 ! 🎉'
                : 'Joueur 1 (Rouge) gagne ! 🎉'
              : vsAi
              ? "L'ordinateur a aligné 4 jetons !"
              : 'Joueur 2 (Jaune) gagne ! 🎉'}
          </p>
          <button
            type="button"
            onClick={() => {
              playClick();
              resetRound();
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

export default GameConnectFour;
