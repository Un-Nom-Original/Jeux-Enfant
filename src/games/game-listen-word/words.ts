import type { GradeLevel } from '../../context/GradeContext';

export interface ListenWordQuestion {
  target: string;
  emoji: string;
  choices: [string, string, string];
}

interface ListenItem {
  target: string;
  emoji: string;
  distractors: [string, string];
}

// Mots 1re année : mots courants, sons simples et confusions classiques (p/b, ch/s, etc.)
const LISTEN_GRADE_1: ListenItem[] = [
  { target: 'CHAT', emoji: '🐱', distractors: ['CHAR', 'CHOU'] },
  { target: 'CHIEN', emoji: '🐶', distractors: ['BIEN', 'RIEN'] },
  { target: 'LION', emoji: '🦁', distractors: ['LIEN', 'LOIN'] },
  { target: 'LAPIN', emoji: '🐰', distractors: ['SAPIN', 'MATIN'] },
  { target: 'POMME', emoji: '🍎', distractors: ['GOMME', 'SOMME'] },
  { target: 'POIRE', emoji: '🍐', distractors: ['FOIRE', 'NOIRE'] },
  { target: 'LUNE', emoji: '🌙', distractors: ['DUNE', 'PRUNE'] },
  { target: 'SOLEIL', emoji: '☀️', distractors: ['SOMMEIL', 'OREILLE'] },
  { target: 'FLEUR', emoji: '🌸', distractors: ['PEUR', 'COEUR'] },
  { target: 'ARBRE', emoji: '🌳', distractors: ['MARBRE', 'BARBE'] },
  { target: 'BATEAU', emoji: '⛵', distractors: ['GÂTEAU', 'CHAPEAU'] },
  { target: 'GÂTEAU', emoji: '🎂', distractors: ['BATEAU', 'RÂTEAU'] },
  { target: 'TRAIN', emoji: '🚂', distractors: ['GRAIN', 'MAIN'] },
  { target: 'VÉLO', emoji: '🚲', distractors: ['MÉLO', 'ZÉRO'] },
  { target: 'MAISON', emoji: '🏠', distractors: ['SAISON', 'RAISON'] },
  { target: 'LIVRE', emoji: '📖', distractors: ['VIVRE', 'GIVRE'] },
  { target: 'TABLE', emoji: '🪑', distractors: ['SABLE', 'CÂBLE'] },
  { target: 'BALLON', emoji: '⚽', distractors: ['SALON', 'TALON'] },
  { target: 'NEIGE', emoji: '❄️', distractors: ['BEIGE', 'SIÈGE'] },
  { target: 'NUAGE', emoji: '☁️', distractors: ['PAGE', 'CAGE'] },
  { target: 'POULE', emoji: '🐔', distractors: ['BOULE', 'FOULE'] },
  { target: 'VACHE', emoji: '🐮', distractors: ['TACHE', 'HACHE'] },
  { target: 'FRAISE', emoji: '🍓', distractors: ['CHAISE', 'BRAISE'] },
  { target: 'FUSÉE', emoji: '🚀', distractors: ['MUSÉE', 'ROSÉE'] },
];

// Mots 3e année : orthographe plus riche, lettres muettes, sons proches
const LISTEN_GRADE_3: ListenItem[] = [
  { target: 'ÉLÉPHANT', emoji: '🐘', distractors: ['ÉLÉFANT', 'ÉLÉPHAN'] },
  { target: 'PAPILLON', emoji: '🦋', distractors: ['PAPILON', 'PAVILLON'] },
  { target: 'CHÂTEAU', emoji: '🏰', distractors: ['CHAPEAU', 'CADEAU'] },
  { target: 'CHOCOLAT', emoji: '🍫', distractors: ['CHOCOLA', 'CHOCOLAS'] },
  { target: 'MONTAGNE', emoji: '🏔️', distractors: ['CAMPAGNE', 'CHAMPAGNE'] },
  { target: 'DAUPHIN', emoji: '🐬', distractors: ['DOFIN', 'DAUPHINT'] },
  { target: 'CROCODILE', emoji: '🐊', distractors: ['CROCODILLE', 'CROQUODILE'] },
  { target: 'PARAPLUIE', emoji: '☂️', distractors: ['PARAPLUI', 'PARAPUIS'] },
  { target: 'TOURNESOL', emoji: '🌻', distractors: ['TOURNESOLLE', 'PARASOL'] },
  { target: 'CHAMPIGNON', emoji: '🍄', distractors: ['CHANPIGNON', 'CHAMPINION'] },
  { target: 'DINOSAURE', emoji: '🦕', distractors: ['DINOZAURE', 'DINOSORE'] },
  { target: 'BOUSSOLE', emoji: '🧭', distractors: ['BOUSOLE', 'BOUSSOLLE'] },
  { target: 'ASTRONAUTE', emoji: '👨‍🚀', distractors: ['ASTRONOTE', 'ASTRONAULT'] },
  { target: 'BIBLIOTHÈQUE', emoji: '📚', distractors: ['BIBLIOTÈQUE', 'BIBLIOTHÉQUE'] },
  { target: 'HÉLICOPTÈRE', emoji: '🚁', distractors: ['ÉLICOPTÈRE', 'HÉLICOPTERE'] },
  { target: 'CROISSANT', emoji: '🥐', distractors: ['CROISANT', 'CROISSENT'] },
  { target: 'PERROQUET', emoji: '🦜', distractors: ['PEROQUET', 'PERROQUAI'] },
  { target: 'HÉRISSON', emoji: '🦔', distractors: ['ÉRISSON', 'HÉRISON'] },
  { target: 'ORCHESTRE', emoji: '🎻', distractors: ['ORKESTRE', 'ORCHÈSTRE'] },
  { target: 'TÉLESCOPE', emoji: '🔭', distractors: ['TÉLÉSKOPE', 'TÉLÉSCOP'] },
  { target: 'PASTÈQUE', emoji: '🍉', distractors: ['PASTÉQUE', 'PASTEK'] },
  { target: 'KANGOUROU', emoji: '🦘', distractors: ['CANGOUROU', 'KANGOROU'] },
];

function shuffle3(items: [string, string, string]): [string, string, string] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr as [string, string, string];
}

export function generateListenRound(grade: GradeLevel, count = 10): ListenWordQuestion[] {
  const bank = grade === '1re' ? [...LISTEN_GRADE_1] : [...LISTEN_GRADE_3];
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]];
  }
  return bank.slice(0, count).map((item) => ({
    target: item.target,
    emoji: item.emoji,
    choices: shuffle3([item.target, item.distractors[0], item.distractors[1]]),
  }));
}
