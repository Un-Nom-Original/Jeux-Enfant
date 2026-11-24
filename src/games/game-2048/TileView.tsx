import { motion } from 'framer-motion';
import { getTileIcon, getTileStyle } from './tileTheme';
import type { GridSize, ThemeId, Tile } from './types';

interface TileViewProps {
  tile: Tile;
  size: GridSize;
  themeId: ThemeId;
}

function getNumberSizeClass(value: number, gridSize: GridSize, hasIcon: boolean): string {
  const digits = String(value).length;

  if (!hasIcon) {
    // Mode "Chiffres seuls" : très grands chiffres bien lisibles
    if (gridSize === 3) {
      if (digits <= 2) return 'text-5xl sm:text-6xl';
      if (digits === 3) return 'text-4xl sm:text-5xl';
      return 'text-3xl sm:text-4xl';
    }
    if (gridSize === 4) {
      if (digits <= 2) return 'text-3xl sm:text-5xl';
      if (digits === 3) return 'text-2xl sm:text-4xl';
      return 'text-xl sm:text-3xl';
    }
    // 5x5
    if (digits <= 2) return 'text-2xl sm:text-3xl';
    if (digits === 3) return 'text-xl sm:text-2xl';
    return 'text-lg sm:text-xl';
  }

  // Modes illustrés (icône + chiffre)
  if (gridSize === 3) {
    if (digits <= 2) return 'text-2xl sm:text-3xl';
    if (digits === 3) return 'text-xl sm:text-2xl';
    return 'text-lg sm:text-xl';
  }
  if (gridSize === 4) {
    if (digits <= 2) return 'text-lg sm:text-2xl';
    if (digits === 3) return 'text-base sm:text-xl';
    return 'text-sm sm:text-lg';
  }
  // 5x5
  if (digits <= 2) return 'text-sm sm:text-base';
  if (digits === 3) return 'text-xs sm:text-sm';
  return 'text-[11px] sm:text-xs';
}

function getIconSizeClass(gridSize: GridSize): string {
  if (gridSize === 3) return 'text-4xl sm:text-5xl';
  if (gridSize === 4) return 'text-2xl sm:text-4xl';
  return 'text-xl sm:text-2xl';
}

export function TileView({ tile, size, themeId }: TileViewProps) {
  const style = getTileStyle(tile.value);
  const icon = getTileIcon(tile.value, themeId);
  const hasIcon = icon !== null;
  const cellPercent = 100 / size;

  return (
    <motion.div
      key={tile.id}
      initial={
        tile.isNew
          ? { scale: 0.2, opacity: 0 }
          : tile.isMerged
          ? { scale: 0.75, opacity: 0.9 }
          : false
      }
      animate={{
        left: `${tile.col * cellPercent}%`,
        top: `${tile.row * cellPercent}%`,
        scale: tile.isMerged ? [1, 1.16, 1] : 1,
        opacity: 1,
      }}
      transition={{
        left: { type: 'spring', stiffness: 460, damping: 34, mass: 0.75 },
        top: { type: 'spring', stiffness: 460, damping: 34, mass: 0.75 },
        scale: tile.isMerged
          ? { duration: 0.22, ease: 'easeOut' }
          : { type: 'spring', stiffness: 420, damping: 24 },
        opacity: { duration: 0.12 },
      }}
      style={{
        width: `${cellPercent}%`,
        height: `${cellPercent}%`,
        left: `${tile.col * cellPercent}%`,
        top: `${tile.row * cellPercent}%`,
      }}
      className="absolute p-1 sm:p-1.5 select-none pointer-events-none"
    >
      <div
        className={`flex h-full w-full flex-col items-center justify-center rounded-2xl shadow-sm ${style.bg} ${style.text} ${style.borderBottom} ${style.extraClass ?? ''}`}
      >
        {hasIcon && (
          <span
            className={`${getIconSizeClass(size)} leading-none select-none`}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <span
          className={`font-display font-bold leading-none tracking-tight ${
            hasIcon ? 'mt-0.5 sm:mt-1' : ''
          } ${getNumberSizeClass(tile.value, size, hasIcon)}`}
        >
          {tile.value}
        </span>
      </div>
    </motion.div>
  );
}
