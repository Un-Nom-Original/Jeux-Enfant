import { useEffect, useRef } from 'react';
import { TileView } from './TileView';
import type { Direction, GridSize, ThemeId, Tile } from './types';

interface BoardProps {
  tiles: Tile[];
  size: GridSize;
  themeId: ThemeId;
  disabled: boolean;
  onMove: (direction: Direction) => void;
}

const SWIPE_THRESHOLD = 26;

export function Board({ tiles, size, themeId, disabled, onMove }: BoardProps) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  // Contrôles clavier (flèches + WASD / ZQSD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      // Ne pas intercepter si un champ de saisie est actif
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      let dir: Direction | null = null;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'z':
        case 'Z':
          dir = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          dir = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'q':
        case 'Q':
          dir = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          dir = 'right';
          break;
      }

      if (dir) {
        e.preventDefault();
        onMove(dir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onMove]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    pointerStart.current = null;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < SWIPE_THRESHOLD) return;

    if (absX > absY) {
      onMove(dx > 0 ? 'right' : 'left');
    } else {
      onMove(dy > 0 ? 'down' : 'up');
    }
  };

  const handlePointerCancel = () => {
    pointerStart.current = null;
  };

  const backgroundCells = Array.from({ length: size * size }, (_, idx) => idx);

  return (
    <div
      role="application"
      aria-label={`Plateau 2048 de taille ${size} par ${size}. Faites glisser pour déplacer les tuiles.`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{ touchAction: 'none' }}
      className="relative aspect-square w-full max-w-[min(88vw,500px)] sm:max-w-[min(78vh,520px)] rounded-3xl bg-[#E8D5BE] p-2 sm:p-3 shadow-inner border-4 border-[#DEC4A6] select-none cursor-grab active:cursor-grabbing"
    >
      {/* Grille de cases vides en arrière-plan */}
      <div
        className="relative h-full w-full"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
        }}
      >
        {backgroundCells.map((cell) => (
          <div key={cell} className="p-1 sm:p-1.5">
            <div className="h-full w-full rounded-2xl bg-[#F6EBDC]/85 shadow-[inset_0_2px_4px_rgba(120,53,15,0.08)]" />
          </div>
        ))}

        {/* Couche des tuiles animées */}
        <div className="absolute inset-0">
          {tiles.map((tile) => (
            <TileView key={tile.id} tile={tile} size={size} themeId={themeId} />
          ))}
        </div>
      </div>
    </div>
  );
}
