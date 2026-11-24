import type { ThemeId } from './types';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  previewIcons: string[];
  icons: Record<number, string> | null;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'animals',
    name: 'Animaux',
    description: 'Des animaux rigolos qui grandissent à chaque fusion',
    previewIcons: ['🥚', '🐣', '🦊', '🐉'],
    icons: {
      2: '🥚',
      4: '🐣',
      8: '🐥',
      16: '🐰',
      32: '🦊',
      64: '🐼',
      128: '🦁',
      256: '🐘',
      512: '🐬',
      1024: '🦄',
      2048: '🐉',
      4096: '👑',
    },
  },
  {
    id: 'fruits',
    name: 'Fruits & Douceurs',
    description: 'Des fruits juteux et des gâteaux délicieux',
    previewIcons: ['🍒', '🍓', '🍉', '🎂'],
    icons: {
      2: '🍒',
      4: '🍓',
      8: '🍊',
      16: '🍎',
      32: '🍉',
      64: '🍇',
      128: '🍍',
      256: '🧁',
      512: '🍩',
      1024: '🍦',
      2048: '🎂',
      4096: '🏆',
    },
  },
  {
    id: 'space',
    name: 'Espace',
    description: 'Pars en fusée explorer les étoiles et les galaxies',
    previewIcons: ['✨', '🌙', '🚀', '🌌'],
    icons: {
      2: '✨',
      4: '☄️',
      8: '🌙',
      16: '🌍',
      32: '🪐',
      64: '☀️',
      128: '🚀',
      256: '🛸',
      512: '👽',
      1024: '🌠',
      2048: '🌌',
      4096: '👑',
    },
  },
  {
    id: 'numbers',
    name: 'Chiffres seuls',
    description: 'Grands chiffres colorés et ultra lisibles, sans icône',
    previewIcons: ['2', '4', '8', '2048'],
    icons: null,
  },
];

export interface TileStyle {
  bg: string;
  text: string;
  borderBottom: string;
  extraClass?: string;
}

const TILE_STYLES: Record<number, TileStyle> = {
  2: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#78350F]',
    borderBottom: 'border-b-4 border-[#FDE047]',
  },
  4: {
    bg: 'bg-[#FDE68A]',
    text: 'text-[#78350F]',
    borderBottom: 'border-b-4 border-[#F59E0B]/70',
  },
  8: {
    bg: 'bg-[#FDBA74]',
    text: 'text-[#7C2D12]',
    borderBottom: 'border-b-4 border-[#EA580C]/70',
  },
  16: {
    bg: 'bg-[#FB923C]',
    text: 'text-white',
    borderBottom: 'border-b-4 border-[#C2410C]',
  },
  32: {
    bg: 'bg-[#F87171]',
    text: 'text-white',
    borderBottom: 'border-b-4 border-[#DC2626]',
  },
  64: {
    bg: 'bg-[#F472B6]',
    text: 'text-white',
    borderBottom: 'border-b-4 border-[#DB2777]',
  },
  128: {
    bg: 'bg-[#C084FC]',
    text: 'text-white',
    borderBottom: 'border-b-4 border-[#9333EA]',
  },
  256: {
    bg: 'bg-[#818CF8]',
    text: 'text-white',
    borderBottom: 'border-b-4 border-[#4F46E5]',
  },
  512: {
    bg: 'bg-[#38BDF8]',
    text: 'text-white',
    borderBottom: 'border-b-4 border-[#0284C7]',
  },
  1024: {
    bg: 'bg-[#34D399]',
    text: 'text-white',
    borderBottom: 'border-b-4 border-[#059669]',
  },
  2048: {
    bg: 'bg-gradient-to-br from-[#FDE047] via-[#FACC15] to-[#F59E0B]',
    text: 'text-[#713F12]',
    borderBottom: 'border-b-4 border-[#B45309]',
    extraClass: 'animate-tile-glow',
  },
};

const SUPER_TILE_STYLE: TileStyle = {
  bg: 'bg-tile-rainbow',
  text: 'text-white drop-shadow-sm',
  borderBottom: 'border-b-4 border-purple-700/70',
  extraClass: 'animate-tile-glow',
};

export function getTileStyle(value: number): TileStyle {
  return TILE_STYLES[value] ?? SUPER_TILE_STYLE;
}

export function getTileIcon(value: number, themeId: ThemeId): string | null {
  const theme = THEME_OPTIONS.find((t) => t.id === themeId);
  if (!theme || !theme.icons) return null;
  if (theme.icons[value]) return theme.icons[value];
  return theme.icons[4096] ?? '👑';
}
