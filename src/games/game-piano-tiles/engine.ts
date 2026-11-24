import type { Difficulty, DifficultyConfig, HitJudgment, SongDefinition, TileNote } from './types';

export const LEAD_IN_MS = 1400;

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'Facile',
    subtitle: 'Doux · 5 cœurs',
    speedMultiplier: 0.72,
    maxHearts: 5,
    perfectWindowMs: 140,
    greatWindowMs: 280,
    approachTimeMs: 1750,
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    subtitle: 'Tempo réel · 3 cœurs',
    speedMultiplier: 1.0,
    maxHearts: 3,
    perfectWindowMs: 105,
    greatWindowMs: 215,
    approachTimeMs: 1350,
  },
  hard: {
    id: 'hard',
    label: 'Chasseur',
    subtitle: 'Rapide · 1 cœur',
    speedMultiplier: 1.25,
    maxHearts: 1,
    perfectWindowMs: 85,
    greatWindowMs: 170,
    approachTimeMs: 1050,
  },
};

/**
 * Construit la partition de tuiles pour une chanson et une difficulté données.
 * Mappe naturellement la hauteur des notes (grave -> aigu) sur les 4 colonnes (0..3)
 * en évitant les répétitions monotones.
 */
export function buildSongChart(song: SongDefinition, difficulty: Difficulty): TileNote[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const effectiveBpm = song.bpm * config.speedMultiplier;
  const stepMs = (60_000 / effectiveBpm) / song.stepsPerBeat;

  const nonZeroNotes = song.melodyMidi.filter((n) => n > 0);
  const minMidi = Math.min(...nonZeroNotes);
  const maxMidi = Math.max(...nonZeroNotes);
  const range = Math.max(1, maxMidi - minMidi);

  const tiles: TileNote[] = [];
  let nextId = 1;
  let lastLane = -1;
  let sameLaneStreak = 0;

  for (let loop = 0; loop < song.loops; loop++) {
    const loopOffsetSteps = loop * song.melodyMidi.length;
    for (let step = 0; step < song.melodyMidi.length; step++) {
      const midi = song.melodyMidi[step];
      if (midi <= 0) continue;

      const bassMidi = song.bassMidi[step] ?? 0;
      const normalized = (midi - minMidi) / range;
      let lane = Math.min(3, Math.max(0, Math.floor(normalized * 4))) as 0 | 1 | 2 | 3;

      // Évite plus de 2 tuiles consécutives dans exactement la même colonne
      if (lane === lastLane) {
        sameLaneStreak++;
        if (sameLaneStreak >= 2) {
          lane = ((lane + 1 + (loop % 2)) % 4) as 0 | 1 | 2 | 3;
          sameLaneStreak = 0;
        }
      } else {
        sameLaneStreak = 0;
      }
      lastLane = lane;

      const timeMs = Math.round(LEAD_IN_MS + (loopOffsetSteps + step) * stepMs);
      tiles.push({
        id: nextId++,
        lane,
        timeMs,
        midi,
        bassMidi,
        status: 'pending',
      });
    }
  }

  return tiles;
}

/**
 * Évalue un tap dans une colonne donnée au temps `songTimeMs`.
 * Retourne la tuile la plus proche dans la fenêtre de tolérance, ou null (raté).
 */
export function findHittableTile(
  tiles: TileNote[],
  lane: 0 | 1 | 2 | 3,
  songTimeMs: number,
  difficulty: Difficulty
): { tile: TileNote; judgment: HitJudgment } | null {
  const config = DIFFICULTY_CONFIGS[difficulty];
  let bestTile: TileNote | null = null;
  let bestDelta = Number.POSITIVE_INFINITY;

  for (const tile of tiles) {
    if (tile.status !== 'pending' || tile.lane !== lane) continue;
    const delta = Math.abs(tile.timeMs - songTimeMs);
    if (delta <= config.greatWindowMs && delta < bestDelta) {
      bestDelta = delta;
      bestTile = tile;
    }
  }

  if (!bestTile) return null;

  const judgment: HitJudgment =
    bestDelta <= config.perfectWindowMs ? 'perfect' : 'great';
  return { tile: bestTile, judgment };
}

export function calculateHitPoints(judgment: HitJudgment, nextCombo: number): number {
  if (judgment === 'miss') return 0;
  const base = judgment === 'perfect' ? 100 : 60;
  const multiplier = Math.min(4, 1 + Math.floor(nextCombo / 10) * 0.5);
  return Math.round(base * multiplier);
}

export function calculateStars(hitCount: number, totalNotes: number): 0 | 1 | 2 | 3 {
  if (totalNotes <= 0) return 0;
  const ratio = hitCount / totalNotes;
  if (ratio >= 0.92) return 3;
  if (ratio >= 0.75) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}

/**
 * Position verticale normalisée (0 = haut de la piste, 1 = ligne de frappe en bas)
 */
export function getTileNormalizedY(
  tileTimeMs: number,
  songTimeMs: number,
  approachTimeMs: number
): number {
  const timeRemaining = tileTimeMs - songTimeMs;
  return 1 - timeRemaining / approachTimeMs;
}
