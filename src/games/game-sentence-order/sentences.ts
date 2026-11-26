import type { GradeLevel } from '../../context/GradeContext';

export interface SentenceEntry {
  words: string[];
  emoji: string;
}

export const SENTENCES_GRADE_1: SentenceEntry[] = [
  { words: ['Le', 'chat', 'dort', 'bien.'], emoji: '🐱' },
  { words: ['La', 'pomme', 'est', 'rouge.'], emoji: '🍎' },
  { words: ['Le', 'chien', 'court', 'vite.'], emoji: '🐶' },
  { words: ['Le', 'soleil', 'brille', 'fort.'], emoji: '☀️' },
  { words: ['Un', 'lapin', 'mange', 'une', 'carotte.'], emoji: '🐰' },
  { words: ['La', 'lune', 'est', 'dans', 'le', 'ciel.'], emoji: '🌙' },
  { words: ['Le', 'train', 'roule', 'très', 'vite.'], emoji: '🚂' },
  { words: ['Une', 'fleur', 'pousse', 'au', 'soleil.'], emoji: '🌸' },
  { words: ['Le', 'poisson', 'nage', 'dans', 'la', 'mer.'], emoji: '🐠' },
  { words: ['Mon', 'ami', 'joue', 'au', 'ballon.'], emoji: '⚽' },
  { words: ['La', 'fusée', 'vole', 'vers', 'Mars.'], emoji: '🚀' },
  { words: ['Le', 'gâteau', 'est', 'très', 'bon.'], emoji: '🎂' },
];

export const SENTENCES_GRADE_3: SentenceEntry[] = [
  { words: ['Le', 'petit', 'renard', 'se', 'cache', 'dans', 'la', 'forêt.'], emoji: '🦊' },
  { words: ['Les', 'astronautes', 'explorent', 'une', 'nouvelle', 'planète', 'rouge.'], emoji: '👨‍🚀' },
  { words: ['Un', 'grand', 'papillon', 'bleu', 'vole', 'sur', 'les', 'fleurs.'], emoji: '🦋' },
  { words: ['Hier,', 'nous', 'avons', 'vu', 'un', 'magnifique', 'arc-en-ciel.'], emoji: '🌈' },
  { words: ['Le', 'dauphin', 'saute', 'joyeusement', 'au-dessus', 'des', 'vagues.'], emoji: '🐬' },
  { words: ['Dans', 'le', 'château,', 'le', 'dragon', 'garde', 'un', 'trésor.'], emoji: '🐉' },
  { words: ['Ma', 'sœur', 'joue', 'une', 'jolie', 'mélodie', 'au', 'piano.'], emoji: '🎹' },
  { words: ['Les', 'élèves', 'lisent', 'un', 'livre', 'passionnant', 'à', 'la', 'bibliothèque.'], emoji: '📚' },
  { words: ['Ce', 'matin,', 'la', 'neige', 'recouvre', 'toute', 'la', 'montagne.'], emoji: '🏔️' },
  { words: ['Le', 'dinosaure', 'mange', 'les', 'feuilles', 'en', 'haut', 'de', 'l’arbre.'], emoji: '🦕' },
];

export function getSentencesForGrade(grade: GradeLevel): SentenceEntry[] {
  return grade === '1re' ? SENTENCES_GRADE_1 : SENTENCES_GRADE_3;
}
