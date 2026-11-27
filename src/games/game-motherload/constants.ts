import type { MineralDef, MineralKind, TileKind, UpgradeDef, UpgradeKey } from './types';

export const WORLD_COLS = 22;
export const WORLD_ROWS = 140;
export const SURFACE_ROW = 2; // Lignes 0..2 = ciel / surface, lignes 3..139 = sous-sol
export const TILE_SIZE = 40;
export const METERS_PER_ROW = 10;

export const TELEPORTER_COST = 400;
export const MAX_ROBOTS = 3;
export const ROBOT_COSTS: [number, number, number] = [350, 950, 2200];

export const MINERALS: Record<MineralKind, MineralDef> = {
  iron: {
    id: 'iron',
    name: 'Fer',
    emoji: '🪨',
    value: 35,
    color: '#94A3B8',
    sparkle: '#E2E8F0',
    minRow: 4,
    maxRow: 45,
    weight: 30,
  },
  bronze: {
    id: 'bronze',
    name: 'Bronze',
    emoji: '🥉',
    value: 65,
    color: '#D97706',
    sparkle: '#FCD34D',
    minRow: 6,
    maxRow: 55,
    weight: 24,
  },
  silver: {
    id: 'silver',
    name: 'Argent',
    emoji: '🥈',
    value: 110,
    color: '#CBD5E1',
    sparkle: '#FFFFFF',
    minRow: 12,
    maxRow: 70,
    weight: 20,
  },
  gold: {
    id: 'gold',
    name: 'Or',
    emoji: '🥇',
    value: 250,
    color: '#FACC15',
    sparkle: '#FEF9C3',
    minRow: 24,
    maxRow: 95,
    weight: 16,
  },
  platinum: {
    id: 'platinum',
    name: 'Platine',
    emoji: '⚪',
    value: 450,
    color: '#38BDF8',
    sparkle: '#E0F2FE',
    minRow: 36,
    maxRow: 110,
    weight: 12,
  },
  fossil: {
    id: 'fossil',
    name: 'Fossile Dino',
    emoji: '🦖',
    value: 650,
    color: '#FDE68A',
    sparkle: '#FFFFFF',
    minRow: 28,
    maxRow: 90,
    weight: 7,
  },
  emerald: {
    id: 'emerald',
    name: 'Émeraude',
    emoji: '💚',
    value: 1100,
    color: '#10B981',
    sparkle: '#A7F3D0',
    minRow: 52,
    maxRow: 125,
    weight: 10,
  },
  ruby: {
    id: 'ruby',
    name: 'Rubis',
    emoji: '❤️',
    value: 2000,
    color: '#F43F5E',
    sparkle: '#FECDD3',
    minRow: 68,
    maxRow: 135,
    weight: 8,
  },
  diamond: {
    id: 'diamond',
    name: 'Diamant',
    emoji: '💎',
    value: 3500,
    color: '#22D3EE',
    sparkle: '#FFFFFF',
    minRow: 85,
    maxRow: 138,
    weight: 6,
  },
  amazonite: {
    id: 'amazonite',
    name: 'Amazonite',
    emoji: '🔮',
    value: 6000,
    color: '#C084FC',
    sparkle: '#F5D0FE',
    minRow: 102,
    maxRow: 139,
    weight: 5,
  },
  star_crystal: {
    id: 'star_crystal',
    name: 'Cristal Étoilé',
    emoji: '⭐',
    value: 9500,
    color: '#FDE047',
    sparkle: '#FFFFFF',
    minRow: 118,
    maxRow: 139,
    weight: 4,
  },
  core_chest: {
    id: 'core_chest',
    name: 'Coffre du Noyau',
    emoji: '👑',
    value: 25000,
    color: '#F59E0B',
    sparkle: '#FEF08A',
    minRow: 134,
    maxRow: 137,
    weight: 0,
  },
};

export const MINERAL_LIST: MineralDef[] = Object.values(MINERALS);

export const UPGRADE_DEFS: Record<UpgradeKey, UpgradeDef> = {
  drill: {
    key: 'drill',
    name: 'Foreuse',
    icon: '⛏️',
    description: 'Creuse beaucoup plus vite dans la terre et la roche',
    costs: [180, 550, 1600, 4500],
    // Durée de forage de base en ms (plus petit = plus rapide)
    values: [380, 290, 210, 150, 105],
    unit: 'ms',
  },
  tank: {
    key: 'tank',
    name: 'Réservoir',
    icon: '⛽',
    description: 'Plus d’essence pour descendre plus profond',
    costs: [150, 450, 1400, 3800],
    values: [100, 160, 240, 360, 520],
    unit: 'L',
  },
  cargo: {
    key: 'cargo',
    name: 'Soute',
    icon: '📦',
    description: 'Transporte plus de minerais avant de remonter',
    costs: [160, 500, 1500, 4000],
    values: [8, 14, 22, 34, 50],
    unit: 'minerais',
  },
  hull: {
    key: 'hull',
    name: 'Coque',
    icon: '🛡️',
    description: 'Protège mieux contre les chutes et la lave',
    costs: [200, 600, 1800, 4500],
    values: [100, 150, 220, 320, 460],
    unit: 'PV',
  },
  engine: {
    key: 'engine',
    name: 'Réacteur',
    icon: '🔥',
    description: 'Remonte beaucoup plus vite vers la surface',
    costs: [180, 520, 1500, 4200],
    // Vitesse verticale max en tuiles/seconde
    values: [5.5, 7.0, 8.6, 10.4, 12.5],
    unit: 'm/s',
  },
};

export const UPGRADE_KEYS: UpgradeKey[] = ['drill', 'tank', 'cargo', 'hull', 'engine'];

export function isMineral(kind: TileKind): kind is MineralKind {
  return kind in MINERALS;
}
