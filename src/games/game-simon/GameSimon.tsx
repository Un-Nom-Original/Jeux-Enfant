import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { pianoSynth } from '../game-piano-tiles/pianoSynth';

const BEST_KEY = 'jeux-enfant:simon:best:v1';

const PADS = [
  { id: 0, name: 'Rouge', midi: 64, base: 'bg-rose-500 border-rose-700', lit: 'bg-rose-300 scale-105 shadow-[0_0_32px_rgba(244,63,94,0.85)]' },
  { id: 1, name: 'Bleu', midi: 67, base: 'bg-sky-500 border-sky-700', lit: 'bg-sky-300 scale-105 shadow-[0_0_32px_rgba(56,189,248,0.85)]' },
  { id: 2, name: 'Vert', midi: 71, base: 'bg-emerald-500 border-emerald-700', lit: 'bg-emerald-300 scale-105 shadow-[0_0_32px_rgba(52,211,153,0.85)]' },
  { id: 3, name: 'Jaune', midi: 76, base: 'bg-amber-400 border-amber-600', lit: 'bg-yellow-200 scale-105 shadow-[0_0_32px_rgba(250,204,21,0.9)]' },
];

export function GameSimon() {
  const { playWin, playGameOver } = useSound();

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'showing' | 'input' | 'gameover'>('idle');
  const [activePad, setActivePad] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      return Number.parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
    } catch {
      return 0;
    }
  });

  const timeoutsRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const playSequence = useCallback(
    (seq: number[]) => {
      clearTimers();
      setPhase('showing');
      setPlayerIndex(0);

      const stepMs = Math.max(360, 680 - seq.length * 24);
      seq.forEach((padId, idx) => {
        const start = 450 + idx * stepMs;
        timeoutsRef.current.push(
          window.setTimeout(() => {
            setActivePad(padId);
            pianoSynth.playNote(PADS[padId].midi);
          }, start)
        );
        timeoutsRef.current.push(
          window.setTimeout(() => {
            setActivePad(null);
          }, start + stepMs * 0.62)
        );
      });

      timeoutsRef.current.push(
        window.setTimeout(() => {
          setPhase('input');
        }, 450 + seq.length * stepMs + 100)
      );
    },
    [clearTimers]
  );

  const startGame = () => {
    const first = Math.floor(Math.random() * 4);
    const nextSeq = [first];
    setSequence(nextSeq);
    playSequence(nextSeq);
  };

  const handlePadPress = (padId: number) => {
    if (phase !== 'input') return;

    setActivePad(padId);
    pianoSynth.playNote(PADS[padId].midi);
    window.setTimeout(() => setActivePad(null), 180);

    if (padId !== sequence[playerIndex]) {
      setPhase('gameover');
      playGameOver();
      return;
    }

    const nextIdx = playerIndex + 1;
    if (nextIdx >= sequence.length) {
      const completedLen = sequence.length;
      if (completedLen > bestScore) {
        setBestScore(completedLen);
        try {
          localStorage.setItem(BEST_KEY, String(completedLen));
        } catch {
          // Ignore storage errors
        }
      }

      if (completedLen % 5 === 0) {
        playWin();
        try {
          confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
        } catch {
          // Ignore confetti errors
        }
      }

      const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(nextSeq);
      playSequence(nextSeq);
    } else {
      setPlayerIndex(nextIdx);
    }
  };

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🎵 Simon Dit
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Observe et répète la mélodie lumineuse dans le bon ordre !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-2xl bg-amber-100 px-3.5 py-2 border border-amber-300">
            <Trophy className="h-4 w-4 text-amber-600" />
            <span className="font-display text-lg font-bold text-amber-950">{bestScore}</span>
          </div>
        </div>
      </div>

      {/* Indicateur de phase */}
      <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-2.5 shadow-sm border-2 border-amber-200">
        <span className="font-display text-base font-bold text-amber-950">
          {phase === 'idle' && 'Appuie sur Jouer pour commencer !'}
          {phase === 'showing' && '👀 Regarde et écoute bien...'}
          {phase === 'input' && `👉 À toi ! (${playerIndex}/${sequence.length})`}
          {phase === 'gameover' && `Oups ! Tu as retenu ${Math.max(0, sequence.length - 1)} notes !`}
        </span>
      </div>

      {/* 4 Pads lumineux */}
      <div className="grid aspect-square w-full max-w-[min(86vw,380px)] grid-cols-2 gap-3.5 rounded-3xl bg-slate-900 p-4 shadow-2xl border-4 border-slate-700">
        {PADS.map((pad) => {
          const isLit = activePad === pad.id;
          return (
            <button
              key={pad.id}
              type="button"
              disabled={phase !== 'input'}
              onPointerDown={(e) => {
                e.preventDefault();
                handlePadPress(pad.id);
              }}
              aria-label={`Touche ${pad.name}`}
              className={`rounded-3xl border-b-8 transition-all duration-100 select-none ${
                isLit ? pad.lit : pad.base
              } ${phase === 'input' ? 'cursor-pointer active:scale-95' : 'cursor-default opacity-90'}`}
            />
          );
        })}
      </div>

      {/* Bouton Jouer / Rejouer */}
      {(phase === 'idle' || phase === 'gameover') && (
        <button
          type="button"
          onClick={startGame}
          className="flex h-13 items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-7 font-display text-lg font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition"
        >
          {phase === 'idle' ? <Play className="h-5 w-5 fill-current" /> : <RotateCcw className="h-5 w-5" />}
          {phase === 'idle' ? 'Jouer' : 'Rejouer'}
        </button>
      )}
    </div>
  );
}

export default GameSimon;
