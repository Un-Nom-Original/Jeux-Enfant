import type { GradeLevel } from '../../context/GradeContext';

export interface WordEntry {
  word: string;
  emoji: string;
  theme: string;
}

export function normalizeLetter(ch: string): string {
  return ch
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

export const WORDS_GRADE_1: WordEntry[] = [
  { word: 'CHAT', emoji: '🐱', theme: 'Animaux' },
  { word: 'CHIEN', emoji: '🐶', theme: 'Animaux' },
  { word: 'LION', emoji: '🦁', theme: 'Animaux' },
  { word: 'OURS', emoji: '🐻', theme: 'Animaux' },
  { word: 'LAPIN', emoji: '🐰', theme: 'Animaux' },
  { word: 'LOUP', emoji: '🐺', theme: 'Animaux' },
  { word: 'CANARD', emoji: '🦆', theme: 'Animaux' },
  { word: 'VACHE', emoji: '🐮', theme: 'Animaux' },
  { word: 'SINGE', emoji: '🐵', theme: 'Animaux' },
  { word: 'POULE', emoji: '🐔', theme: 'Animaux' },
  { word: 'POMME', emoji: '🍎', theme: 'Fruits' },
  { word: 'POIRE', emoji: '🍐', theme: 'Fruits' },
  { word: 'FRAISE', emoji: '🍓', theme: 'Fruits' },
  { word: 'BANANE', emoji: '🍌', theme: 'Fruits' },
  { word: 'RAISIN', emoji: '🍇', theme: 'Fruits' },
  { word: 'MELON', emoji: '🍈', theme: 'Fruits' },
  { word: 'LUNE', emoji: '🌙', theme: 'Nature' },
  { word: 'SOLEIL', emoji: '☀️', theme: 'Nature' },
  { word: 'ARBRE', emoji: '🌳', theme: 'Nature' },
  { word: 'FLEUR', emoji: '🌸', theme: 'Nature' },
  { word: 'NEIGE', emoji: '❄️', theme: 'Nature' },
  { word: 'PLUIE', emoji: '🌧️', theme: 'Nature' },
  { word: 'NUAGE', emoji: '☁️', theme: 'Nature' },
  { word: 'MER', emoji: '🌊', theme: 'Nature' },
  { word: 'LIVRE', emoji: '📖', theme: 'École' },
  { word: 'STYLO', emoji: '🖊️', theme: 'École' },
  { word: 'TABLE', emoji: '🪑', theme: 'École' },
  { word: 'SAC', emoji: '🎒', theme: 'École' },
  { word: 'ÉCOLE', emoji: '🏫', theme: 'École' },
  { word: 'BATEAU', emoji: '⛵', theme: 'Transports' },
  { word: 'TRAIN', emoji: '🚂', theme: 'Transports' },
  { word: 'AVION', emoji: '✈️', theme: 'Transports' },
  { word: 'VÉLO', emoji: '🚲', theme: 'Transports' },
  { word: 'AUTO', emoji: '🚗', theme: 'Transports' },
  { word: 'MAISON', emoji: '🏠', theme: 'Maison' },
  { word: 'GÂTEAU', emoji: '🎂', theme: 'Cuisine' },
  { word: 'PIZZA', emoji: '🍕', theme: 'Cuisine' },
  { word: 'BALLON', emoji: '⚽', theme: 'Jeux' },
  { word: 'ÉTOILE', emoji: '⭐', theme: 'Espace' },
  { word: 'FUSÉE', emoji: '🚀', theme: 'Espace' },
];

export const WORDS_GRADE_3: WordEntry[] = [
  { word: 'ÉLÉPHANT', emoji: '🐘', theme: 'Animaux' },
  { word: 'GIRAFE', emoji: '🦒', theme: 'Animaux' },
  { word: 'DAUPHIN', emoji: '🐬', theme: 'Animaux' },
  { word: 'CROCODILE', emoji: '🐊', theme: 'Animaux' },
  { word: 'PAPILLON', emoji: '🦋', theme: 'Animaux' },
  { word: 'PINGOUIN', emoji: '🐧', theme: 'Animaux' },
  { word: 'DINOSAURE', emoji: '🦕', theme: 'Animaux' },
  { word: 'KANGOUROU', emoji: '🦘', theme: 'Animaux' },
  { word: 'HÉRISSON', emoji: '🦔', theme: 'Animaux' },
  { word: 'PERROQUET', emoji: '🦜', theme: 'Animaux' },
  { word: 'PLANÈTE', emoji: '🪐', theme: 'Espace' },
  { word: 'GALAXIE', emoji: '🌌', theme: 'Espace' },
  { word: 'ASTRONAUTE', emoji: '👨‍🚀', theme: 'Espace' },
  { word: 'TÉLESCOPE', emoji: '🔭', theme: 'Espace' },
  { word: 'MÉTÉORITE', emoji: '☄️', theme: 'Espace' },
  { word: 'MONTAGNE', emoji: '🏔️', theme: 'Nature' },
  { word: 'VOLCAN', emoji: '🌋', theme: 'Nature' },
  { word: 'ARCENCIEL', emoji: '🌈', theme: 'Nature' },
  { word: 'CASCADE', emoji: '🌊', theme: 'Nature' },
  { word: 'CHAMPIGNON', emoji: '🍄', theme: 'Nature' },
  { word: 'TOURNESOL', emoji: '🌻', theme: 'Nature' },
  { word: 'CHOCOLAT', emoji: '🍫', theme: 'Cuisine' },
  { word: 'CROISSANT', emoji: '🥐', theme: 'Cuisine' },
  { word: 'PASTÈQUE', emoji: '🍉', theme: 'Fruits' },
  { word: 'ANANAS', emoji: '🍍', theme: 'Fruits' },
  { word: 'MYRTILLE', emoji: '🫐', theme: 'Fruits' },
  { word: 'CAHIER', emoji: '📓', theme: 'École' },
  { word: 'CRAYON', emoji: '✏️', theme: 'École' },
  { word: 'BIBLIOTHÈQUE', emoji: '📚', theme: 'École' },
  { word: 'CARTABLE', emoji: '🎒', theme: 'École' },
  { word: 'ORCHESTRE', emoji: '🎻', theme: 'Musique' },
  { word: 'GUITARE', emoji: '🎸', theme: 'Musique' },
  { word: 'TROMPETTE', emoji: '🎺', theme: 'Musique' },
  { word: 'CHÂTEAU', emoji: '🏰', theme: 'Aventure' },
  { word: 'TRÉSOR', emoji: '💎', theme: 'Aventure' },
  { word: 'BOUSSOLE', emoji: '🧭', theme: 'Aventure' },
  { word: 'PARAPLUIE', emoji: '☂️', theme: 'Quotidien' },
  { word: 'HÉLICOPTÈRE', emoji: '🚁', theme: 'Transports' },
  { word: 'SOUSMARIN', emoji: '🤿', theme: 'Transports' },
  { word: 'PATINOIRE', emoji: '⛸️', theme: 'Sport' },
];

export function getWordsForGrade(grade: GradeLevel): WordEntry[] {
  return grade === '1re' ? WORDS_GRADE_1 : WORDS_GRADE_3;
}
