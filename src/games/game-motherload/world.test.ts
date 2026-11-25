import { describe, expect, it } from 'vitest';
import { SURFACE_ROW, WORLD_COLS, WORLD_ROWS } from './constants';
import {
  buyPlayerUpgrade,
  buyTeleporter,
  createInitialPlayer,
  generateWorld,
  getCargoCount,
  getCargoValue,
  getUpgradeCost,
  sellPlayerCargo,
} from './world';

describe('Mini-Motherload world & economy', () => {
  it('génère un monde 22x140 avec surface libre et Coffre du Noyau présent', () => {
    const world = generateWorld();
    expect(world).toHaveLength(WORLD_ROWS);
    expect(world[0]).toHaveLength(WORLD_COLS);

    // La surface doit être libre
    for (let c = 0; c < WORLD_COLS; c++) {
      expect(world[SURFACE_ROW][c]).toBe('empty');
    }

    // Le Coffre du Noyau doit être présent dans les profondeurs
    const hasCoreChest = world.some((row) => row.includes('core_chest'));
    expect(hasCoreChest).toBe(true);
  });

  it('calcule correctement la vente de cargaison', () => {
    const player = createInitialPlayer('1re');
    player.cargo = { iron: 2, gold: 1 };
    expect(getCargoCount(player.cargo)).toBe(3);
    expect(getCargoValue(player.cargo)).toBe(35 * 2 + 250);

    const { nextPlayer, earned, soldCount } = sellPlayerCargo(player);
    expect(soldCount).toBe(3);
    expect(earned).toBe(320);
    expect(nextPlayer.money).toBe(player.money + 320);
    expect(getCargoCount(nextPlayer.cargo)).toBe(0);
  });

  it('permet d’acheter une amélioration et applique un tarif doux en 1re année', () => {
    const cost1 = getUpgradeCost('drill', 0, '1re')!;
    const cost3 = getUpgradeCost('drill', 0, '3e')!;
    expect(cost1).toBeLessThan(cost3);

    const player = createInitialPlayer('1re');
    player.money = 500;
    const upgraded = buyPlayerUpgrade(player, 'drill', '1re');
    expect(upgraded).not.toBeNull();
    expect(upgraded!.upgrades.drill).toBe(1);
    expect(upgraded!.money).toBe(500 - cost1);
  });

  it('permet d’acheter un téléporteur si le joueur a assez d’argent', () => {
    const player = createInitialPlayer('3e');
    player.money = 1000;
    const updated = buyTeleporter(player, '3e');
    expect(updated).not.toBeNull();
    expect(updated!.teleporters).toBe(player.teleporters + 1);
  });
});
