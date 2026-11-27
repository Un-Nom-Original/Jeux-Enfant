import type { GradeLevel } from '../../context/GradeContext';
import {
  isMineral,
  MAX_ROBOTS,
  MINERAL_LIST,
  MINERALS,
  ROBOT_COSTS,
  SURFACE_ROW,
  TELEPORTER_COST,
  UPGRADE_DEFS,
  WORLD_COLS,
  WORLD_ROWS,
} from './constants';
import type { MineralKind, PlayerState, TileKind, UpgradeKey, Upgrades } from './types';

export interface DerivedStats {
  drillMs: number;
  maxFuel: number;
  maxCargo: number;
  maxHull: number;
  thrustSpeed: number;
  fuelBurnPerSec: number;
  drillFuelCost: number;
}

export function getStats(upgrades: Upgrades, grade: GradeLevel): DerivedStats {
  const drillMs = UPGRADE_DEFS.drill.values[upgrades.drill];
  const maxFuel = UPGRADE_DEFS.tank.values[upgrades.tank];
  const maxCargo = UPGRADE_DEFS.cargo.values[upgrades.cargo];
  const maxHull = UPGRADE_DEFS.hull.values[upgrades.hull];
  const thrustSpeed = UPGRADE_DEFS.engine.values[upgrades.engine];

  // Consommation plus douce en 1re année
  const gradeFactor = grade === '1re' ? 0.62 : 1.0;

  return {
    drillMs,
    maxFuel,
    maxCargo,
    maxHull,
    thrustSpeed,
    fuelBurnPerSec: 4.5 * gradeFactor,
    drillFuelCost: 1.6 * gradeFactor,
  };
}

export function getUpgradeCost(key: UpgradeKey, currentLevel: number, grade: GradeLevel): number | null {
  if (currentLevel >= 4) return null;
  const base = UPGRADE_DEFS[key].costs[currentLevel];
  return grade === '1re' ? Math.round(base * 0.7) : base;
}

export function getCargoCount(cargo: Partial<Record<MineralKind, number>>): number {
  return Object.values(cargo).reduce((sum, n) => sum + (n ?? 0), 0);
}

export function getCargoValue(cargo: Partial<Record<MineralKind, number>>): number {
  let total = 0;
  for (const [key, qty] of Object.entries(cargo)) {
    if (qty && isMineral(key as TileKind)) {
      total += MINERALS[key as MineralKind].value * qty;
    }
  }
  return total;
}

export function createInitialPlayer(grade: GradeLevel): PlayerState {
  const upgrades: Upgrades = { drill: 0, tank: 0, cargo: 0, hull: 0, engine: 0 };
  const stats = getStats(upgrades, grade);
  return {
    x: Math.floor(WORLD_COLS / 2),
    y: SURFACE_ROW,
    vx: 0,
    vy: 0,
    fuel: stats.maxFuel,
    hull: stats.maxHull,
    money: grade === '1re' ? 120 : 50,
    cargo: {},
    upgrades,
    teleporters: grade === '1re' ? 2 : 1,
    robots: 0,
    maxDepth: 0,
    foundCore: false,
    facing: 1,
  };
}

function pickMineralForRow(row: number): MineralKind | null {
  const candidates = MINERAL_LIST.filter(
    (m) => m.weight > 0 && row >= m.minRow && row <= m.maxRow
  );
  if (candidates.length === 0) return null;
  const totalWeight = candidates.reduce((acc, m) => acc + m.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const m of candidates) {
    roll -= m.weight;
    if (roll <= 0) return m.id;
  }
  return candidates[candidates.length - 1].id;
}

export function generateWorld(): TileKind[][] {
  const grid: TileKind[][] = Array.from({ length: WORLD_ROWS }, () =>
    Array<TileKind>(WORLD_COLS).fill('empty')
  );

  for (let r = SURFACE_ROW + 1; r < WORLD_ROWS; r++) {
    let bouldersInRow = 0;
    const isDeepRock = r >= 45;

    for (let c = 0; c < WORLD_COLS; c++) {
      // Laisse la première rangée sous la surface facile à creuser
      if (r === SURFACE_ROW + 1) {
        grid[r][c] = 'dirt';
        continue;
      }

      const roll = Math.random();

      // Petites cavernes naturelles
      if (r > 12 && roll < 0.055) {
        grid[r][c] = 'empty';
        continue;
      }

      // Rochers indestructibles (max 3 par ligne pour ne jamais bloquer le passage)
      if (r > 14 && bouldersInRow < 3 && roll < 0.1) {
        grid[r][c] = 'boulder';
        bouldersInRow++;
        continue;
      }

      // Poches de lave dans les profondeurs (> 550m)
      if (r > 58 && roll < 0.145) {
        grid[r][c] = 'lava';
        continue;
      }

      // Minerais & gemmes (plus fréquents en profondeur !)
      const mineralChance = r < 30 ? 0.22 : r < 80 ? 0.25 : 0.28;
      if (Math.random() < mineralChance) {
        const mineral = pickMineralForRow(r);
        if (mineral) {
          grid[r][c] = mineral;
          continue;
        }
      }

      grid[r][c] = isDeepRock ? 'rock' : 'dirt';
    }
  }

  // Place le Coffre du Noyau vers le fond (ligne 135) entouré de cristaux étoilés
  const chestRow = WORLD_ROWS - 5;
  const chestCol = Math.floor(WORLD_COLS / 2);
  grid[chestRow][chestCol] = 'core_chest';
  grid[chestRow][chestCol - 1] = 'star_crystal';
  grid[chestRow][chestCol + 1] = 'star_crystal';
  grid[chestRow - 1][chestCol] = 'diamond';

  return grid;
}

export function sellPlayerCargo(player: PlayerState): {
  nextPlayer: PlayerState;
  earned: number;
  soldCount: number;
} {
  const earned = getCargoValue(player.cargo);
  const soldCount = getCargoCount(player.cargo);
  if (soldCount === 0) {
    return { nextPlayer: player, earned: 0, soldCount: 0 };
  }
  return {
    nextPlayer: {
      ...player,
      money: player.money + earned,
      cargo: {},
    },
    earned,
    soldCount,
  };
}

export function buyPlayerUpgrade(
  player: PlayerState,
  key: UpgradeKey,
  grade: GradeLevel
): PlayerState | null {
  const currentLvl = player.upgrades[key];
  const cost = getUpgradeCost(key, currentLvl, grade);
  if (cost === null || player.money < cost) return null;

  const nextUpgrades: Upgrades = {
    ...player.upgrades,
    [key]: currentLvl + 1,
  };
  const nextStats = getStats(nextUpgrades, grade);

  return {
    ...player,
    money: player.money - cost,
    upgrades: nextUpgrades,
    fuel: key === 'tank' ? nextStats.maxFuel : player.fuel,
    hull: key === 'hull' ? nextStats.maxHull : player.hull,
  };
}

export function buyTeleporter(player: PlayerState, grade: GradeLevel): PlayerState | null {
  const cost = grade === '1re' ? Math.round(TELEPORTER_COST * 0.6) : TELEPORTER_COST;
  if (player.money < cost) return null;
  return {
    ...player,
    money: player.money - cost,
    teleporters: player.teleporters + 1,
  };
}

export function getRobotCost(currentRobots: number, grade: GradeLevel): number | null {
  if (currentRobots >= MAX_ROBOTS) return null;
  const base = ROBOT_COSTS[currentRobots];
  return grade === '1re' ? Math.round(base * 0.7) : base;
}

export function buyHelperRobot(player: PlayerState, grade: GradeLevel): PlayerState | null {
  const current = player.robots ?? 0;
  const cost = getRobotCost(current, grade);
  if (cost === null || player.money < cost) return null;
  return {
    ...player,
    money: player.money - cost,
    robots: current + 1,
  };
}
