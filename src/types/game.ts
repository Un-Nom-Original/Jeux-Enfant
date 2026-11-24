import type { ComponentType } from 'react';

export type GameStatus = 'ready' | 'coming-soon';

export type GameCategory = 'francais' | 'maths' | 'logique' | 'jeux';

export interface CategoryMeta {
  id: GameCategory;
  label: string;
  icon: string;
  accentClass: string;
}

export const GAME_CATEGORIES: CategoryMeta[] = [
  { id: 'francais', label: 'Français', icon: '🔤', accentClass: 'text-rose-600' },
  { id: 'maths', label: 'Maths', icon: '🔢', accentClass: 'text-amber-700' },
  { id: 'logique', label: 'Logique & Mémoire', icon: '🧠', accentClass: 'text-emerald-700' },
  { id: 'jeux', label: 'Jeux & Musique', icon: '🎮', accentClass: 'text-purple-700' },
];

export interface GameDefinition {
  id: string;
  name: string;
  shortDescription: string;
  category: GameCategory;
  icon: string;
  accentBg: string;
  accentText: string;
  status: GameStatus;
  component?: ComponentType;
}
