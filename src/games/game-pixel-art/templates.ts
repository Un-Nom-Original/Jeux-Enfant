export interface PixelTemplate {
  id: string;
  name: string;
  icon: string;
  /** Grille 8x8 de codes couleur ('.' = vide) */
  rows: string[];
}

export const PIXEL_PALETTE: Record<string, string> = {
  R: '#EF4444', // Rouge
  O: '#F97316', // Orange
  Y: '#FACC15', // Jaune
  G: '#22C55E', // Vert
  B: '#38BDF8', // Bleu ciel
  I: '#6366F1', // Indigo
  P: '#EC4899', // Rose
  K: '#1E293B', // Noir / foncé
  W: '#FFFFFF', // Blanc
  N: '#92400E', // Marron
};

export const PALETTE_KEYS = Object.keys(PIXEL_PALETTE);

export const PIXEL_TEMPLATES: PixelTemplate[] = [
  {
    id: 'coeur',
    name: 'Cœur',
    icon: '❤️',
    rows: [
      '........',
      '.RR..RR.',
      'RRRRRRRR',
      'RRRRRRRR',
      'RRRRRRRR',
      '.RRRRRR.',
      '..RRRR..',
      '...RR...',
    ],
  },
  {
    id: 'chat',
    name: 'Chaton',
    icon: '🐱',
    rows: [
      '.O....O.',
      '.OO..OO.',
      '.OOOOOO.',
      'OOKOOOKO',
      'OOOOOOOO',
      'OOOPOOOO',
      '.OOOOOO.',
      '..OOOO..',
    ],
  },
  {
    id: 'fusee',
    name: 'Fusée',
    icon: '🚀',
    rows: [
      '...RR...',
      '..RRRR..',
      '..BBBB..',
      '..BKKB..',
      '..BBBB..',
      '.RBBBBR.',
      '.R.OO.R.',
      '...YY...',
    ],
  },
  {
    id: 'fleur',
    name: 'Fleur',
    icon: '🌸',
    rows: [
      '..PPPP..',
      '.PPYYPP.',
      '.PYYYYP.',
      '..PPPP..',
      '...GG...',
      '..GGG...',
      '...GG...',
      '..GGGG..',
    ],
  },
  {
    id: 'couronne',
    name: 'Couronne',
    icon: '👑',
    rows: [
      '........',
      'Y..YY..Y',
      'Y.YYYY.Y',
      'YYYYYYYY',
      'YRYYYYRY',
      'YYYYYYYY',
      '.YYYYYY.',
      '........',
    ],
  },
  {
    id: 'dino',
    name: 'Dino',
    icon: '🦕',
    rows: [
      '....GGG.',
      '...GGKGG',
      '...GGGGG',
      '...GGG..',
      '.GGGGG..',
      'GGGGGG..',
      '.G..GG..',
      '.G..GG..',
    ],
  },
];
