export type TileKind =
  | 'empty'
  | 'dirt'
  | 'rock'
  | 'boulder'
  | 'lava'
  | 'iron'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'fossil'
  | 'emerald'
  | 'ruby'
  | 'diamond'
  | 'amazonite'
  | 'star_crystal'
  | 'core_chest';

export type MineralKind = Exclude<TileKind, 'empty' | 'dirt' | 'rock' | 'boulder' | 'lava'>;

export type UpgradeKey = 'drill' | 'tank' | 'cargo' | 'hull' | 'engine';

export interface Upgrades {
  drill: number;
  tank: number;
  cargo: number;
  hull: number;
  engine: number;
}

export interface MineralDef {
  id: MineralKind;
  name: string;
  emoji: string;
  value: number;
  color: string;
  sparkle: string;
  minRow: number;
  maxRow: number;
  weight: number;
}

export interface UpgradeDef {
  key: UpgradeKey;
  name: string;
  icon: string;
  description: string;
  /** Coûts pour passer aux niveaux 1, 2, 3, 4 */
  costs: [number, number, number, number];
  /** Valeurs de performance aux niveaux 0..4 */
  values: [number, number, number, number, number];
  unit: string;
}

export interface PlayerState {
  /** Position en coordonnées de tuiles (peut être flottante pendant vol/forage) */
  x: number;
  y: number;
  vx: number;
  vy: number;
  fuel: number;
  hull: number;
  money: number;
  cargo: Partial<Record<MineralKind, number>>;
  upgrades: Upgrades;
  teleporters: number;
  robots: number;
  maxDepth: number;
  foundCore: boolean;
  facing: -1 | 1;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  age: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface MotherloadSave {
  world: TileKind[][];
  player: PlayerState;
}
