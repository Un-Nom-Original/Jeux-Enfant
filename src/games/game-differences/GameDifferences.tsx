import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Lightbulb, RotateCcw } from 'lucide-react';
import { GradeBadgeToggle } from '../../components/shared/GradeBadgeToggle';
import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { DIFF_SCENES, type DiffSpot } from './scenes';

export function GameDifferences() {
  const { grade } = useGrade();
  const { playClick, playMerge, playWin } = useSound();

  const diffLimit = grade === '1re' ? 5 : 7;

  const [sceneIndex, setSceneIndex] = useState(0);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [hintId, setHintId] = useState<string | null>(null);

  const scene = DIFF_SCENES[sceneIndex];
  const activeSpots = scene.spots.slice(0, diffLimit);
  const activeSpotIdSet = new Set(activeSpots.map((s) => s.id));

  useEffect(() => {
    setFoundIds([]);
    setHintId(null);
  }, [grade, sceneIndex]);

  const isCompleted = foundIds.length === activeSpots.length;

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCompleted) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 320;
    const y = ((e.clientY - rect.top) / rect.height) * 220;

    const hit: DiffSpot | undefined = activeSpots.find((spot) => {
      if (foundIds.includes(spot.id)) return false;
      const dist = Math.hypot(x - spot.x, y - spot.y);
      return dist <= spot.r + 12;
    });

    if (hit) {
      const next = [...foundIds, hit.id];
      setFoundIds(next);
      setHintId(null);
      if (next.length === activeSpots.length) {
        playWin();
        try {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 } });
        } catch {
          // Ignore confetti errors
        }
      } else {
        playMerge(64);
      }
    } else {
      playClick();
    }
  };

  const handleHint = () => {
    if (isCompleted) return;
    playClick();
    const nextMissing = activeSpots.find((s) => !foundIds.includes(s.id));
    if (nextMissing) {
      setHintId(nextMissing.id);
    }
  };

  const renderMarkers = () => (
    <svg viewBox="0 0 320 220" className="pointer-events-none absolute inset-0 h-full w-full">
      {activeSpots.map((spot) => {
        const isFound = foundIds.includes(spot.id);
        const isHint = hintId === spot.id && !isFound;
        if (!isFound && !isHint) return null;
        return (
          <circle
            key={spot.id}
            cx={spot.x}
            cy={spot.y}
            r={spot.r}
            fill="none"
            stroke={isFound ? '#22C55E' : '#FACC15'}
            strokeWidth="5"
            strokeDasharray={isHint ? '8 5' : undefined}
            className={isHint ? 'animate-pulse' : ''}
          />
        );
      })}
    </svg>
  );

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
            🔍 Chasse aux Différences
          </h2>
          <p className="text-xs font-bold text-amber-800/70">
            Touche les {activeSpots.length} différences entre les deux images !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GradeBadgeToggle />
          <button
            type="button"
            onClick={handleHint}
            disabled={isCompleted}
            className="flex h-11 items-center gap-1.5 rounded-2xl bg-sky-100 px-3.5 text-sm font-extrabold text-sky-900 hover:bg-sky-200 disabled:opacity-40 active:scale-95 transition"
          >
            <Lightbulb className="h-4 w-4 text-sky-600" />
            Indice
          </button>
        </div>
      </div>

      {/* Sélecteur des 6 scènes */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {DIFF_SCENES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                playClick();
                setSceneIndex(idx);
              }}
              className={`h-10 rounded-xl px-3 text-xs font-extrabold transition ${
                idx === sceneIndex
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'bg-white text-amber-900/75 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        <span className="rounded-xl bg-emerald-100 px-3.5 py-1.5 font-display text-base font-bold text-emerald-900">
          Trouvées : {foundIds.length} / {activeSpots.length}
        </span>
      </div>

      {/* Les 2 images côte à côte (paysage) ou empilées (portrait) */}
      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {(['left', 'right'] as const).map((side) => (
          <div
            key={side}
            onClick={handleImageClick}
            className="relative aspect-[320/220] w-full overflow-hidden rounded-3xl bg-white shadow-md border-4 border-amber-200 cursor-pointer select-none"
          >
            {scene.render(side, activeSpotIdSet)}
            {renderMarkers()}
          </div>
        ))}
      </div>

      {isCompleted && (
        <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl bg-emerald-100 px-6 py-3 border-2 border-emerald-300">
          <p className="font-display text-lg font-bold text-emerald-950">
            Super œil de détective ! Toutes les différences trouvées ! 🎉
          </p>
          <button
            type="button"
            onClick={() => {
              playClick();
              setSceneIndex((idx) => (idx + 1) % DIFF_SCENES.length);
            }}
            className="flex h-11 items-center gap-1.5 rounded-2xl bg-emerald-500 px-5 font-display text-base font-bold text-white active:scale-95 transition"
          >
            <RotateCcw className="h-4 w-4" />
            Image suivante
          </button>
        </div>
      )}
    </div>
  );
}

export default GameDifferences;
