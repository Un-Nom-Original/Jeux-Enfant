export type Difficulty = 'easy' | 'normal' | 'hard';

export type GroupTheme = 'huntrx' | 'saja' | 'pop';

export type HitJudgment = 'perfect' | 'great' | 'miss';

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  subtitle: string;
  speedMultiplier: number;
  maxHearts: number;
  /** Fenêtre en ms autour du temps exact pour PARFAIT */
  perfectWindowMs: number;
  /** Fenêtre en ms autour du temps exact pour SUPER */
  greatWindowMs: number;
  /** Durée visible d'une tuile à l'écran avant la ligne de frappe (ms) */
  approachTimeMs: number;
}

export interface SongDefinition {
  id: string;
  title: string;
  artist: string;
  group: GroupTheme;
  groupLabel: string;
  bpm: number;
  keyLabel: string;
  baseStars: 1 | 2 | 3;
  icon: string;
  /** Séquence de notes MIDI (0 = pause) par demi-temps ou temps */
  melodyMidi: number[];
  /** Notes de basse MIDI (0 = pause), alignées sur melodyMidi */
  bassMidi: number[];
  /** Subdivision par temps : 1 = noire, 2 = croche */
  stepsPerBeat: number;
  /** Nombre de répétitions structurées pour une durée idéale (~40-55s) */
  loops: number;
}

export interface TileNote {
  id: number;
  lane: 0 | 1 | 2 | 3;
  /** Temps cible (en ms depuis le début) où la tuile atteint la ligne de frappe */
  timeMs: number;
  /** Note MIDI principale jouée au tap */
  midi: number;
  /** Note de basse MIDI optionnelle jouée en accompagnement */
  bassMidi: number;
  status: 'pending' | 'hit' | 'missed';
}

export interface SongRecord {
  bestScore: number;
  bestCombo: number;
  stars: 0 | 1 | 2 | 3;
}

export interface GameResults {
  completed: boolean;
  score: number;
  maxCombo: number;
  perfectCount: number;
  greatCount: number;
  missCount: number;
  totalNotes: number;
  stars: 0 | 1 | 2 | 3;
  accuracy: number;
}
