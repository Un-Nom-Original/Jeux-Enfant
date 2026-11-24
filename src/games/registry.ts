import { Game2048 } from './game-2048/Game2048';
import { GamePianoTiles } from './game-piano-tiles/GamePianoTiles';
import type { GameDefinition } from '../types/game';

export const GAMES_REGISTRY: GameDefinition[] = [
  {
    id: '2048',
    name: '2048',
    shortDescription: 'Fusionne les tuiles !',
    icon: '🐣',
    accentBg: 'bg-amber-200/90',
    accentText: 'text-amber-950',
    status: 'ready',
    component: Game2048,
  },
  {
    id: 'piano-tiles',
    name: 'Piano Tiles',
    shortDescription: 'KPop Demon Hunters',
    icon: '🎹',
    accentBg: 'bg-gradient-to-br from-fuchsia-400 to-cyan-300',
    accentText: 'text-white',
    status: 'ready',
    component: GamePianoTiles,
  },
  {
    id: 'memory',
    name: 'Memory',
    shortDescription: 'Retrouve les paires',
    icon: '🃏',
    accentBg: 'bg-sky-200',
    accentText: 'text-sky-950',
    status: 'coming-soon',
  },
  {
    id: 'morpion',
    name: 'Morpion',
    shortDescription: 'Aligne 3 symboles',
    icon: '⭕',
    accentBg: 'bg-pink-200',
    accentText: 'text-pink-950',
    status: 'coming-soon',
  },
  {
    id: 'puissance-4',
    name: 'Puissance 4',
    shortDescription: '4 jetons à la suite',
    icon: '🔴',
    accentBg: 'bg-emerald-200',
    accentText: 'text-emerald-950',
    status: 'coming-soon',
  },
];
