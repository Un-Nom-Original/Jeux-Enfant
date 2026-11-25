import { WORLD_COLS, WORLD_ROWS } from './constants';
import type { MotherloadSave, TileKind } from './types';

const SAVE_KEY = 'jeux-enfant:motherload:save:v1';

const TILE_TO_CHAR: Record<TileKind, string> = {
  empty: '.',
  dirt: 'd',
  rock: 'r',
  boulder: 'b',
  lava: 'l',
  iron: '1',
  bronze: '2',
  silver: '3',
  gold: '4',
  platinum: '5',
  fossil: '6',
  emerald: '7',
  ruby: '8',
  diamond: '9',
  amazonite: 'a',
  star_crystal: 's',
  core_chest: 'C',
};

const CHAR_TO_TILE: Record<string, TileKind> = Object.fromEntries(
  Object.entries(TILE_TO_CHAR).map(([k, v]) => [v, k as TileKind])
);

export function saveMotherload(save: MotherloadSave): void {
  try {
    const packedWorld = save.world
      .map((row) => row.map((tile) => TILE_TO_CHAR[tile] ?? '.').join(''))
      .join('\n');
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        w: packedWorld,
        p: save.player,
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function loadMotherload(): MotherloadSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { w?: string; p?: MotherloadSave['player'] };
    if (!parsed || typeof parsed.w !== 'string' || !parsed.p) return null;

    const rows = parsed.w.split('\n');
    if (rows.length !== WORLD_ROWS) return null;

    const world: TileKind[][] = rows.map((line) =>
      Array.from({ length: WORLD_COLS }, (_, c) => CHAR_TO_TILE[line[c]] ?? 'empty')
    );

    return {
      world,
      player: parsed.p,
    };
  } catch {
    return null;
  }
}

export function clearMotherloadSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore storage errors
  }
}
