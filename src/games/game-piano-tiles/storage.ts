import type { Difficulty, SongRecord } from './types';

const RECORDS_KEY = 'jeux-enfant:piano-tiles:records:v1';
const DIFFICULTY_KEY = 'jeux-enfant:piano-tiles:difficulty:v1';

type RecordsMap = Record<string, SongRecord>;

function makeKey(songId: string, difficulty: Difficulty): string {
  return `${songId}::${difficulty}`;
}

export function loadAllRecords(): RecordsMap {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as RecordsMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getSongRecord(
  records: RecordsMap,
  songId: string,
  difficulty: Difficulty
): SongRecord {
  return (
    records[makeKey(songId, difficulty)] ?? {
      bestScore: 0,
      bestCombo: 0,
      stars: 0,
    }
  );
}

export function saveSongResult(
  songId: string,
  difficulty: Difficulty,
  score: number,
  maxCombo: number,
  stars: 0 | 1 | 2 | 3
): RecordsMap {
  const records = loadAllRecords();
  const key = makeKey(songId, difficulty);
  const existing = records[key] ?? { bestScore: 0, bestCombo: 0, stars: 0 };

  const updated: SongRecord = {
    bestScore: Math.max(existing.bestScore, score),
    bestCombo: Math.max(existing.bestCombo, maxCombo),
    stars: Math.max(existing.stars, stars) as 0 | 1 | 2 | 3,
  };

  const nextRecords = { ...records, [key]: updated };
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(nextRecords));
  } catch {
    // Ignore storage quota errors
  }
  return nextRecords;
}

export function loadSavedDifficulty(): Difficulty {
  try {
    const raw = localStorage.getItem(DIFFICULTY_KEY);
    if (raw === 'easy' || raw === 'normal' || raw === 'hard') {
      return raw;
    }
    return 'easy';
  } catch {
    return 'easy';
  }
}

export function saveDifficulty(difficulty: Difficulty): void {
  try {
    localStorage.setItem(DIFFICULTY_KEY, difficulty);
  } catch {
    // Ignore storage errors
  }
}
