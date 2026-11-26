import { lazy } from 'react';
import { Game2048 } from './game-2048/Game2048';
import { GamePianoTiles } from './game-piano-tiles/GamePianoTiles';
import type { GameDefinition } from '../types/game';

const GameHangman = lazy(() => import('./game-hangman/GameHangman'));
const GameWordSearch = lazy(() => import('./game-word-search/GameWordSearch'));
const GameAnagram = lazy(() => import('./game-anagram/GameAnagram'));
const GameListenWord = lazy(() => import('./game-listen-word/GameListenWord'));
const GameSentenceOrder = lazy(() => import('./game-sentence-order/GameSentenceOrder'));
const GameWordSort = lazy(() => import('./game-word-sort/GameWordSort'));

const GameMathRace = lazy(() => import('./game-math-race/GameMathRace'));
const GameLogicSequence = lazy(() => import('./game-logic-sequence/GameLogicSequence'));
const GameClock = lazy(() => import('./game-clock/GameClock'));
const GameCrocodile = lazy(() => import('./game-crocodile/GameCrocodile'));
const GameShop = lazy(() => import('./game-shop/GameShop'));

const GameMemory = lazy(() => import('./game-memory/GameMemory'));
const GameDifferences = lazy(() => import('./game-differences/GameDifferences'));
const GameSudoku = lazy(() => import('./game-sudoku/GameSudoku'));
const GameMaze = lazy(() => import('./game-maze/GameMaze'));
const GamePixelArt = lazy(() => import('./game-pixel-art/GamePixelArt'));

const GameSimon = lazy(() => import('./game-simon/GameSimon'));
const GameTicTacToe = lazy(() => import('./game-tic-tac-toe/GameTicTacToe'));
const GameConnectFour = lazy(() => import('./game-connect-four/GameConnectFour'));
const GameMotherload = lazy(() => import('./game-motherload/GameMotherload'));
const GameBreakout = lazy(() => import('./game-breakout/GameBreakout'));
const GameSnake = lazy(() => import('./game-snake/GameSnake'));
const GameDinoJump = lazy(() => import('./game-dino-jump/GameDinoJump'));
const GameBattleship = lazy(() => import('./game-battleship/GameBattleship'));

export const GAMES_REGISTRY: GameDefinition[] = [
  // 🔤 FRANÇAIS (6)
  {
    id: 'listen-word',
    name: 'Écoute & Trouve',
    shortDescription: 'Écoute le mot en français',
    category: 'francais',
    icon: '🗣️',
    accentBg: 'bg-indigo-200/90',
    accentText: 'text-indigo-950',
    status: 'ready',
    component: GameListenWord,
  },
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
  {
    id: 'sentence-order',
    name: 'Phrase en Ordre',
    shortDescription: 'Reconstruis la phrase',
    category: 'francais',
    icon: '📖',
    accentBg: 'bg-amber-200/90',
    accentText: 'text-amber-950',
    status: 'ready',
    component: GameSentenceOrder,
  },
  {
    id: 'word-sort',
    name: 'Tri de Mots',
    shortDescription: 'UN/UNE · Nom/Verbe',
    category: 'francais',
    icon: '🧺',
    accentBg: 'bg-pink-200/90',
    accentText: 'text-pink-950',
    status: 'ready',
    component: GameWordSort,
  },

  // 🔢 MATHS (6)
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
    id: 'clock',
    name: 'Quelle Heure ?',
    shortDescription: 'Apprends à lire l’horloge',
    category: 'maths',
    icon: '🕐',
    accentBg: 'bg-yellow-200/90',
    accentText: 'text-yellow-950',
    status: 'ready',
    component: GameClock,
  },
  {
    id: 'crocodile',
    name: 'Crocodile < = >',
    shortDescription: 'Compare les nombres',
    category: 'maths',
    icon: '🐊',
    accentBg: 'bg-emerald-200/90',
    accentText: 'text-emerald-950',
    status: 'ready',
    component: GameCrocodile,
  },
  {
    id: 'shop',
    name: 'Petite Boutique',
    shortDescription: 'Paye avec les pièces',
    category: 'maths',
    icon: '🛒',
    accentBg: 'bg-violet-200/90',
    accentText: 'text-violet-950',
    status: 'ready',
    component: GameShop,
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

  // 🧠 LOGIQUE & CRÉATIF (5)
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
  {
    id: 'maze',
    name: 'Labyrinthe',
    shortDescription: 'Trouve la sortie !',
    category: 'logique',
    icon: '🌀',
    accentBg: 'bg-sky-200/90',
    accentText: 'text-sky-950',
    status: 'ready',
    component: GameMaze,
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art',
    shortDescription: 'Modèles & dessin libre',
    category: 'logique',
    icon: '🎨',
    accentBg: 'bg-fuchsia-200/90',
    accentText: 'text-fuchsia-950',
    status: 'ready',
    component: GamePixelArt,
  },

  // 🎮 JEUX, ARCADE & MUSIQUE (9)
  {
    id: 'motherload',
    name: 'Mini-Motherload',
    shortDescription: 'Forage sur Mars !',
    category: 'jeux',
    icon: '⛏️',
    accentBg: 'bg-orange-300/90',
    accentText: 'text-orange-950',
    status: 'ready',
    component: GameMotherload,
  },
  {
    id: 'breakout',
    name: 'Casse-Briques',
    shortDescription: 'Casse toutes les briques',
    category: 'jeux',
    icon: '🧱',
    accentBg: 'bg-rose-300/90',
    accentText: 'text-rose-950',
    status: 'ready',
    component: GameBreakout,
  },
  {
    id: 'snake',
    name: 'Serpent Coloré',
    shortDescription: 'Mange les fruits !',
    category: 'jeux',
    icon: '🐍',
    accentBg: 'bg-emerald-300/90',
    accentText: 'text-emerald-950',
    status: 'ready',
    component: GameSnake,
  },
  {
    id: 'dino-jump',
    name: 'Dino Jump',
    shortDescription: 'Saute sur les obstacles',
    category: 'jeux',
    icon: '🦖',
    accentBg: 'bg-lime-300/90',
    accentText: 'text-lime-950',
    status: 'ready',
    component: GameDinoJump,
  },
  {
    id: 'battleship',
    name: 'Bataille Navale',
    shortDescription: 'Coule la flotte !',
    category: 'jeux',
    icon: '🎯',
    accentBg: 'bg-sky-300/90',
    accentText: 'text-sky-950',
    status: 'ready',
    component: GameBattleship,
  },
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
