import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Undo2 } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { generateShopItem, type ShopItem } from './items';

const COINS = [
  { value: 1, label: '1 $', style: 'bg-amber-200 border-amber-500 text-amber-950 rounded-full' },
  { value: 2, label: '2 $', style: 'bg-slate-200 border-amber-500 text-slate-900 rounded-full' },
  { value: 5, label: '5 $', style: 'bg-sky-200 border-sky-500 text-sky-950 rounded-2xl' },
  { value: 10, label: '10 $', style: 'bg-purple-200 border-purple-500 text-purple-950 rounded-2xl' },
];

export function GameShop() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin, playGameOver } = useSound();

  const [item, setItem] = useState<ShopItem>(() => generateShopItem(grade));
  const [tray, setTray] = useState<number[]>([]);
  const [boughtCount, setBoughtCount] = useState(0);
  const [status, setStatus] = useState<'paying' | 'exact' | 'over'>('paying');

  const nextItem = useCallback(
    (nextGrade = grade) => {
      setItem(generateShopItem(nextGrade));
      setTray([]);
      setStatus('paying');
    },
    [grade]
  );

  useEffect(() => {
    nextItem(grade);
  }, [grade, nextItem]);

  const totalPaid = tray.reduce((sum, v) => sum + v, 0);

  const handleAddCoin = (val: number) => {
    if (status === 'exact') return;
    const nextTray = [...tray, val];
    const nextTotal = totalPaid + val;
    setTray(nextTray);

    if (nextTotal === item.price) {
      setStatus('exact');
      setBoughtCount((c) => c + 1);
      playWin();
      try {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Ignore confetti
      }
    } else if (nextTotal > item.price) {
      setStatus('over');
      playGameOver();
    } else {
      playMerge(16);
    }
  };

  const handleRemoveLast = () => {
    if (tray.length === 0 || status === 'exact') return;
    playClick();
    const nextTray = tray.slice(0, -1);
    const nextTotal = nextTray.reduce((s, v) => s + v, 0);
    setTray(nextTray);
    setStatus(nextTotal > item.price ? 'over' : 'paying');
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🛒 La Petite Boutique
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Dépose les bonnes pièces et billets pour payer le prix exact !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
          <div className="flex items-center gap-1.5 rounded-2xl bg-amber-100 px-3.5 py-2 border border-amber-300">
            <Trophy className="h-4 w-4 text-amber-600" />
            <span className="font-display text-lg font-bold text-amber-950">{boughtCount}</span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-5 rounded-3xl bg-white p-5 sm:p-6 shadow-md border-2 border-amber-200/80">
        {/* Article à acheter */}
        <div className="flex items-center gap-5 rounded-3xl bg-amber-50 px-6 py-4 border-2 border-amber-200">
          <span className="text-6xl">{item.emoji}</span>
          <div>
            <p className="font-display text-xl font-bold text-amber-950">{item.name}</p>
            <p className="font-display text-3xl font-bold text-orange-600">
              Prix : {item.price} $
            </p>
          </div>
        </div>

        {/* Comptoir (argent déposé) */}
        <div
          className={`flex w-full flex-col items-center gap-2 rounded-2xl p-4 border-2 transition ${
            status === 'exact'
              ? 'bg-emerald-50 border-emerald-400'
              : status === 'over'
              ? 'bg-rose-50 border-rose-400'
              : 'bg-stone-50 border-dashed border-amber-300'
          }`}
        >
          <p className="font-display text-lg font-bold text-amber-950">
            Argent déposé :{' '}
            <span
              className={
                status === 'exact'
                  ? 'text-emerald-600'
                  : status === 'over'
                  ? 'text-rose-600'
                  : 'text-sky-700'
              }
            >
              {totalPaid} $
            </span>
          </p>

          <div className="flex min-h-[44px] flex-wrap items-center justify-center gap-1.5">
            {tray.length === 0 ? (
              <span className="text-xs font-bold text-stone-400">
                Touche les pièces ci-dessous...
              </span>
            ) : (
              tray.map((v, i) => (
                <span
                  key={i}
                  className="rounded-xl bg-amber-200 px-2.5 py-1 font-display text-sm font-bold text-amber-950"
                >
                  {v} $
                </span>
              ))
            )}
          </div>

          {status === 'over' && (
            <p className="text-xs font-extrabold text-rose-600">
              C'est un peu trop ! Retire une pièce avec le bouton Retirer.
            </p>
          )}
        </div>

        {/* Pièces et billets */}
        {status !== 'exact' ? (
          <>
            <div className="grid w-full grid-cols-4 gap-2.5">
              {COINS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleAddCoin(c.value)}
                  className={`flex h-16 items-center justify-center border-b-4 font-display text-xl sm:text-2xl font-bold shadow-xs hover:brightness-105 active:scale-95 transition ${c.style}`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={tray.length === 0}
                onClick={handleRemoveLast}
                className="flex h-11 items-center gap-1.5 rounded-2xl bg-amber-100 px-4 text-sm font-extrabold text-amber-950 hover:bg-amber-200 disabled:opacity-40 active:scale-95 transition"
              >
                <Undo2 className="h-4 w-4" />
                Retirer 1 pièce
              </button>
              <button
                type="button"
                disabled={tray.length === 0}
                onClick={() => {
                  playClick();
                  setTray([]);
                  setStatus('paying');
                }}
                className="flex h-11 items-center gap-1.5 rounded-2xl bg-stone-100 px-4 text-sm font-extrabold text-stone-700 hover:bg-stone-200 disabled:opacity-40 active:scale-95 transition"
              >
                <RotateCcw className="h-4 w-4" />
                Tout vider
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="font-display text-xl font-bold text-emerald-700">
              Bravo ! Tu as payé le prix exact ({item.price} $) ! 🎉
            </p>
            <button
              type="button"
              onClick={() => {
                playClick();
                nextItem(grade);
              }}
              className="h-12 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 px-6 font-display text-base font-bold text-white shadow-sm active:scale-95 transition"
            >
              Article suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameShop;
