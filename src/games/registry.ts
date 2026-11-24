import { lazy } from 'react';
import { Game2048 } from './game-2048/Game2048';
import { GamePianoTiles } from './game-piano-tiles/GamePianoTiles';
import type { GameDefinition } from '../types/game';

const GameHangman = lazy(() => import('./game-hangman/GameHangman'));
const GameWordSearch = lazy(() => import('./game-word-search/GameWordSearch'));
const GameAnagram = lazy(() => import('./game-anagram/GameAnagram'));
const GameMathRace = lazy(() => import('./game-math-race/GameMathRace'));
const GameLogicSequence = lazy(() => import('./game-logic-sequence/GameLogicSequence'));
const GameMemory = lazy(() => import('./game-memory/GameMemory'));
const GameDifferences = lazy(() => import('./game-differences/GameDifferences'));
const GameSudoku = lazy(() => import('./game-sudoku/GameSudoku'));
const GameSimon = lazy(() => import('./game-simon/GameSimon'));
const GameTicTacToe = lazy(() => import('./game-tic-tac-toe/GameTicTacToe'));
const GameConnectFour = lazy(() => import('./game-connect-four/GameConnectFour'));

export const GAMES_REGISTRY: GameDefinition[] = [
  // 🔤 FRANÇAIS
  {
    id: 'hangman',
    name: 'Bonhomme Pendu',
    shortDescription: 'Devine le mot mystère',
    category: 'francais',
    icon: '⛄',
    accentBg: 'bg-sky-200/90',
    accentText: 'text-sky-950',
    status: 'ready',
    component: GameHangman,
  },
  {
    id: 'word-search',
    name: 'Mots Mêlés',
    shortDescription: 'Trouve les mots cachés',
    category: 'francais',
    icon: '🔎',
    accentBg: 'bg-rose-200/90',
    accentText: 'text-rose-950',
    status: 'ready',
    component: GameWordSearch,
  },
  {
    id: 'anagram',
    name: 'Mots Mélangés',
    shortDescription: 'Remets les lettres en ordre',
    category: 'francais',
    icon: '🔀',
    accentBg: 'bg-purple-200/90',
    accentText: 'text-purple-950',
    status: 'ready',
    component: GameAnagram,
  },

  // 🔢 MATHS
  {
    id: 'math-race',
    name: 'Course de Calcul',
    shortDescription: 'Calcul mental amusant',
    category: 'maths',
    icon: '🚀',
    accentBg: 'bg-orange-200/90',
    accentText: 'text-orange-950',
    status: 'ready',
    component: GameMathRace,
  },
  {
    id: 'logic-sequence',
    name: 'Suite Logique',
    shortDescription: 'Complète le motif',
    category: 'maths',
    icon: '🧩',
    accentBg: 'bg-teal-200/90',
    accentText: 'text-teal-950',
    status: 'ready',
    component: GameLogicSequence,
  },
  {
    id: '2048',
    name: '2048',
    shortDescription: 'Fusionne les tuiles !',
    category: 'maths',
    icon: '🐣',
    accentBg: 'bg-amber-200/90',
    accentText: 'text-amber-950',
    status: 'ready',
    component: Game2048,
  },

  // 🧠 LOGIQUE & OBSERVATION
  {
    id: 'memory',
    name: 'Jeu de Mémoire',
    shortDescription: 'Retrouve les paires',
    category: 'logique',
    icon: '🃏',
    accentBg: 'bg-emerald-200/90',
    accentText: 'text-emerald-950',
    status: 'ready',
    component: GameMemory,
  },
  {
    id: 'differences',
    name: 'Différences',
    shortDescription: 'Compare 2 images',
    category: 'logique',
    icon: '🔍',
    accentBg: 'bg-lime-200/90',
    accentText: 'text-lime-950',
    status: 'ready',
    component: GameDifferences,
  },
  {
    id: 'sudoku',
    name: 'Sudoku Junior',
    shortDescription: '4×4 animaux & 6×6',
    category: 'logique',
    icon: '🔢',
    accentBg: 'bg-cyan-200/90',
    accentText: 'text-cyan-950',
    status: 'ready',
    component: GameSudoku,
  },

  // 🎮 JEUX & MUSIQUE
  {
    id: 'piano-tiles',
    name: 'Piano',
    shortDescription: 'Joue en rythme !',
    category: 'jeux',
    icon: '🎹',
    accentBg: 'bg-gradient-to-br from-fuchsia-400 to-cyan-300',
    accentText: 'text-white',
    status: 'ready',
    component: GamePianoTiles,
  },
  {
    id: 'simon',
    name: 'Simon Dit',
    shortDescription: 'Mémoire musicale',
    category: 'jeux',
    icon: '🎵',
    accentBg: 'bg-yellow-200/90',
    accentText: 'text-yellow-950',
    status: 'ready',
    component: GameSimon,
  },
  {
    id: 'tic-tac-toe',
    name: 'Morpion',
    shortDescription: 'Aligne 3 symboles',
    category: 'jeux',
    icon: '⭕',
    accentBg: 'bg-pink-200/90',
    accentText: 'text-pink-950',
    status: 'ready',
    component: GameTicTacToe,
  },
  {
    id: 'connect-four',
    name: 'Puissance 4',
    shortDescription: '4 jetons à la suite',
    category: 'jeux',
    icon: '🔴',
    accentBg: 'bg-blue-200/90',
    accentText: 'text-blue-950',
    status: 'ready',
    component: GameConnectFour,
  },
];
