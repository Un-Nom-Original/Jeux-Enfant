import { describe, expect, it } from 'vitest';
import {
  buildSongChart,
  calculateHitPoints,
  calculateStars,
  DIFFICULTY_CONFIGS,
  findHittableTile,
  getTileNormalizedY,
} from './engine';
import { PIANO_SONGS } from './songs';

describe('Piano engine', () => {
  it('contient les 12 mélodies reconnaissables', () => {
    expect(PIANO_SONGS).toHaveLength(12);
    const titles = PIANO_SONGS.map((s) => s.title);
    expect(titles).toContain('Brille, brille petite étoile');
    expect(titles).toContain('Frère Jacques');
    expect(titles).toContain('Au clair de la lune');
    expect(titles).toContain('Ode à la joie');
    expect(titles).toContain('La Lettre à Élise');
    expect(titles).toContain('La Marche Turque');
  });

  it('génère des partitions valides et strictement croissantes pour chaque chanson', () => {
    for (const song of PIANO_SONGS) {
      const chart = buildSongChart(song, 'normal');
      expect(chart.length).toBeGreaterThan(20);
      for (let i = 1; i < chart.length; i++) {
        expect(chart[i].timeMs).toBeGreaterThan(chart[i - 1].timeMs);
        expect(chart[i].lane).toBeGreaterThanOrEqual(0);
        expect(chart[i].lane).toBeLessThanOrEqual(3);
      }
    }
  });

  it('évalue correctement PARFAIT, SUPER et RATÉ selon la fenêtre temporelle', () => {
    const chart = buildSongChart(PIANO_SONGS[0], 'normal');
    const first = chart[0];

    const perfectHit = findHittableTile(chart, first.lane, first.timeMs + 20, 'normal');
    expect(perfectHit?.judgment).toBe('perfect');

    const greatHit = findHittableTile(chart, first.lane, first.timeMs + 150, 'normal');
    expect(greatHit?.judgment).toBe('great');

    const wrongLane = ((first.lane + 1) % 4) as 0 | 1 | 2 | 3;
    const missLane = findHittableTile(chart, wrongLane, first.timeMs, 'normal');
    expect(missLane).toBeNull();

    const tooFar = findHittableTile(chart, first.lane, first.timeMs - 500, 'normal');
    expect(tooFar).toBeNull();
  });

  it('calcule correctement les points avec multiplicateur de combo et les étoiles', () => {
    expect(calculateHitPoints('perfect', 1)).toBe(100);
    expect(calculateHitPoints('perfect', 10)).toBe(150);
    expect(calculateHitPoints('great', 20)).toBe(120);
    expect(calculateHitPoints('miss', 15)).toBe(0);

    expect(calculateStars(95, 100)).toBe(3);
    expect(calculateStars(80, 100)).toBe(2);
    expect(calculateStars(55, 100)).toBe(1);
    expect(calculateStars(20, 100)).toBe(0);
  });

  it('positionne une tuile exactement à y=1 au moment cible', () => {
    const approach = DIFFICULTY_CONFIGS.normal.approachTimeMs;
    expect(getTileNormalizedY(2000, 2000, approach)).toBe(1);
    expect(getTileNormalizedY(2000, 2000 - approach, approach)).toBe(0);
  });
});
