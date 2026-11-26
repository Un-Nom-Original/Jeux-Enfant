import type { GradeLevel } from '../../context/GradeContext';

export interface WordSortItem {
  word: string;
  emoji: string;
  bucket: 'left' | 'right';
}

export interface WordSortMode {
  leftLabel: string;
  rightLabel: string;
  items: WordSortItem[];
}

const MODE_UN_UNE: WordSortMode = {
  leftLabel: 'UN (Masculin)',
  rightLabel: 'UNE (Féminin)',
  items: [
    { word: 'chat', emoji: '🐱', bucket: 'left' },
    { word: 'chien', emoji: '🐶', bucket: 'left' },
    { word: 'soleil', emoji: '☀️', bucket: 'left' },
    { word: 'arbre', emoji: '🌳', bucket: 'left' },
    { word: 'train', emoji: '🚂', bucket: 'left' },
    { word: 'ballon', emoji: '⚽', bucket: 'left' },
    { word: 'gâteau', emoji: '🎂', bucket: 'left' },
    { word: 'livre', emoji: '📖', bucket: 'left' },
    { word: 'lapin', emoji: '🐰', bucket: 'left' },
    { word: 'bateau', emoji: '⛵', bucket: 'left' },
    { word: 'pomme', emoji: '🍎', bucket: 'right' },
    { word: 'lune', emoji: '🌙', bucket: 'right' },
    { word: 'fleur', emoji: '🌸', bucket: 'right' },
    { word: 'maison', emoji: '🏠', bucket: 'right' },
    { word: 'table', emoji: '🪑', bucket: 'right' },
    { word: 'fraise', emoji: '🍓', bucket: 'right' },
    { word: 'fusée', emoji: '🚀', bucket: 'right' },
    { word: 'étoile', emoji: '⭐', bucket: 'right' },
    { word: 'vache', emoji: '🐮', bucket: 'right' },
    { word: 'poule', emoji: '🐔', bucket: 'right' },
  ],
};

const MODE_NOM_VERBE: WordSortMode = {
  leftLabel: 'NOM (Chose / Animal)',
  rightLabel: 'VERBE (Action)',
  items: [
    { word: 'montagne', emoji: '🏔️', bucket: 'left' },
    { word: 'dauphin', emoji: '🐬', bucket: 'left' },
    { word: 'château', emoji: '🏰', bucket: 'left' },
    { word: 'guitare', emoji: '🎸', bucket: 'left' },
    { word: 'papillon', emoji: '🦋', bucket: 'left' },
    { word: 'parapluie', emoji: '☂️', bucket: 'left' },
    { word: 'volcan', emoji: '🌋', bucket: 'left' },
    { word: 'chocolat', emoji: '🍫', bucket: 'left' },
    { word: 'planète', emoji: '🪐', bucket: 'left' },
    { word: 'boussole', emoji: '🧭', bucket: 'left' },
    { word: 'courir', emoji: '🏃', bucket: 'right' },
    { word: 'chanter', emoji: '🎤', bucket: 'right' },
    { word: 'nager', emoji: '🏊', bucket: 'right' },
    { word: 'dessiner', emoji: '🎨', bucket: 'right' },
    { word: 'sauter', emoji: '🦘', bucket: 'right' },
    { word: 'dormir', emoji: '😴', bucket: 'right' },
    { word: 'manger', emoji: '🍽️', bucket: 'right' },
    { word: 'lire', emoji: '📖', bucket: 'right' },
    { word: 'construire', emoji: '🧱', bucket: 'right' },
    { word: 'danser', emoji: '💃', bucket: 'right' },
  ],
};

export function generateWordSortRound(
  grade: GradeLevel,
  count = 10
): { leftLabel: string; rightLabel: string; items: WordSortItem[] } {
  const mode = grade === '1re' ? MODE_UN_UNE : MODE_NOM_VERBE;
  const copy = [...mode.items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return {
    leftLabel: mode.leftLabel,
    rightLabel: mode.rightLabel,
    items: copy.slice(0, count),
  };
}
