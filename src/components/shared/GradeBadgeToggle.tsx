import { useGrade } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';

interface GradeBadgeToggleProps {
  compact?: boolean;
}

export function GradeBadgeToggle({ compact = false }: GradeBadgeToggleProps) {
  const { grade, setGrade } = useGrade();
  const { playClick } = useSound();

  return (
    <div
      role="group"
      aria-label="Niveau scolaire"
      className={`inline-flex items-center rounded-2xl bg-amber-100/90 p-1 border border-amber-200/80 ${
        compact ? 'w-full' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => {
          playClick();
          setGrade('1re');
        }}
        className={`flex flex-1 items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 min-h-[38px] text-xs font-extrabold transition focus-visible:outline-2 focus-visible:outline-orange-500 ${
          grade === '1re'
            ? 'bg-white text-orange-600 shadow-sm'
            : 'text-amber-900/70 hover:text-amber-950'
        }`}
      >
        <span aria-hidden="true">🐣</span>
        <span>1re année</span>
      </button>
      <button
        type="button"
        onClick={() => {
          playClick();
          setGrade('3e');
        }}
        className={`flex flex-1 items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 min-h-[38px] text-xs font-extrabold transition focus-visible:outline-2 focus-visible:outline-orange-500 ${
          grade === '3e'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-amber-900/70 hover:text-amber-950'
        }`}
      >
        <span aria-hidden="true">🦁</span>
        <span>3e année</span>
      </button>
    </div>
  );
}
