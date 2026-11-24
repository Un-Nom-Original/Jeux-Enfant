import type { GradeLevel } from '../../context/GradeContext';

export interface SequenceQuestion {
  items: string[];
  missingIndex: number;
  answer: string;
  choices: string[];
  explanation: string;
}

const EMOJI_SETS = [
  ['🔴', '🔵', '🟢', '🟡'],
  ['🐱', '🐶', '🐰', '🦊'],
  ['🍎', '🍌', '🍇', '🍓'],
  ['⭐', '🌙', '☀️', '☁️'],
  ['🚗', '🚀', '⛵', '🚂'],
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeNumericChoices(answer: number, step: number): string[] {
  const set = new Set<number>([answer]);
  const deltas = [step, -step, 1, -1, 2, -2, step * 2];
  for (const d of shuffle(deltas)) {
    if (set.size >= 4) break;
    if (answer + d >= 0 && answer + d !== answer) {
      set.add(answer + d);
    }
  }
  while (set.size < 4) {
    set.add(answer + set.size + 1);
  }
  return shuffle(Array.from(set)).map(String);
}

export function generateSequenceQuestion(grade: GradeLevel): SequenceQuestion {
  if (grade === '1re') {
    const kind = randInt(0, 2);
    if (kind === 0 || kind === 1) {
      // Suite visuelle (ABAB, AAB, ABC)
      const set = EMOJI_SETS[randInt(0, EMOJI_SETS.length - 1)];
      const [a, b, c] = set;
      const patterns = [
        { seq: [a, b, a, b, a, b], exp: `Le motif alterne ${a} puis ${b}.` },
        { seq: [a, a, b, a, a, b], exp: `Le motif répète ${a} ${a} puis ${b}.` },
        { seq: [a, b, c, a, b, c], exp: `Le motif répète ${a} ${b} ${c}.` },
      ];
      const chosen = patterns[randInt(0, patterns.length - 1)];
      const missingIndex = chosen.seq.length - 1;
      const answer = chosen.seq[missingIndex];
      return {
        items: chosen.seq,
        missingIndex,
        answer,
        choices: shuffle([...set]),
        explanation: chosen.exp,
      };
    }

    // Suite numérique simple (+1, +2, +5, +10)
    const step = [1, 2, 5, 10][randInt(0, 3)];
    const start = step === 10 ? randInt(1, 3) * 10 : randInt(1, 10);
    const nums = Array.from({ length: 6 }, (_, i) => start + i * step);
    const missingIndex = 5;
    const answer = nums[missingIndex];
    return {
      items: nums.map(String),
      missingIndex,
      answer: String(answer),
      choices: makeNumericChoices(answer, step),
      explanation: `On ajoute +${step} à chaque étape !`,
    };
  }

  // 3e année : suites numériques plus variées (+3, +4, -5, ×2, ou case manquante au milieu)
  const kind = randInt(0, 3);
  if (kind === 0) {
    const step = [3, 4, 6, 7, 8][randInt(0, 4)];
    const start = randInt(2, 15);
    const nums = Array.from({ length: 6 }, (_, i) => start + i * step);
    const missingIndex = randInt(3, 5);
    const answer = nums[missingIndex];
    return {
      items: nums.map(String),
      missingIndex,
      answer: String(answer),
      choices: makeNumericChoices(answer, step),
      explanation: `On ajoute +${step} à chaque nombre !`,
    };
  }
  if (kind === 1) {
    // Suite décroissante (-3, -4, -5, -10)
    const step = [3, 4, 5, 10][randInt(0, 3)];
    const start = randInt(40, 80);
    const nums = Array.from({ length: 6 }, (_, i) => start - i * step);
    const missingIndex = randInt(3, 5);
    const answer = nums[missingIndex];
    return {
      items: nums.map(String),
      missingIndex,
      answer: String(answer),
      choices: makeNumericChoices(answer, step),
      explanation: `On enlève −${step} à chaque nombre !`,
    };
  }
  if (kind === 2) {
    // Doubles (×2)
    const start = randInt(1, 3);
    const nums = Array.from({ length: 6 }, (_, i) => start * Math.pow(2, i));
    const missingIndex = 5;
    const answer = nums[missingIndex];
    return {
      items: nums.map(String),
      missingIndex,
      answer: String(answer),
      choices: makeNumericChoices(answer, Math.max(4, Math.floor(answer / 4))),
      explanation: `Chaque nombre est le double (×2) du précédent !`,
    };
  }

  // Motif complexe ABCD ou AABBCC
  const set = EMOJI_SETS[randInt(0, EMOJI_SETS.length - 1)];
  const [a, b, c, d] = set;
  const seq = [a, b, c, d, a, b];
  const missingIndex = 5;
  return {
    items: seq,
    missingIndex,
    answer: b,
    choices: shuffle([...set]),
    explanation: `Le cycle répète les 4 symboles ${a} ${b} ${c} ${d}.`,
  };
}
