import type { Game2048State, GridSize, ThemeId } from './types';

const STATE_PREFIX = 'jeux-enfant:2048:state:v1:';
const BEST_PREFIX = 'jeux-enfant:2048:best:v1:';
const THEME_KEY = 'jeux-enfant:2048:theme:v1';
const SIZE_KEY = 'jeux-enfant:2048:size:v1';

export function loadBestScore(size: GridSize): number {
  try {
    const raw = localStorage.getItem(`${BEST_PREFIX}${size}`);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(size: GridSize, bestScore: number): void {
  try {
    localStorage.setItem(`${BEST_PREFIX}${size}`, String(bestScore));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadGameState(size: GridSize): Game2048State | null {
  try {
    const raw = localStorage.getItem(`${STATE_PREFIX}${size}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Game2048State;
    if (
      !parsed ||
      parsed.size !== size ||
      !Array.isArray(parsed.tiles) ||
      typeof parsed.score !== 'number'
    ) {
      return null;
    }
    return {
      ...parsed,
      bestScore: Math.max(parsed.bestScore ?? 0, loadBestScore(size)),
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return null;
  }
}

export function saveGameState(state: Game2048State): void {
  try {
    localStorage.setItem(`${STATE_PREFIX}${state.size}`, JSON.stringify(state));
    saveBestScore(state.size, state.bestScore);
  } catch {
    // Ignore storage quota errors
  }
}

export function loadTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'animals' || raw === 'fruits' || raw === 'space' || raw === 'numbers') {
      return raw;
    }
    return 'animals';
  } catch {
    return 'animals';
  }
}

export function saveTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore storage errors
  }
}

export function loadLastGridSize(): GridSize {
  try {
    const raw = localStorage.getItem(SIZE_KEY);
    if (raw === '3') return 3;
    if (raw === '5') return 5;
    return 4;
  } catch {
    return 4;
  }
}

export function saveLastGridSize(size: GridSize): void {
  try {
    localStorage.setItem(SIZE_KEY, String(size));
  } catch {
    // Ignore storage errors
  }
}
