import type { GradeLevel } from '../../context/GradeContext';

export interface MathQuestion {
  prompt: string;
  answer: number;
  choices: number[];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildChoices(answer: number, spread: number): number[] {
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < 4 && guard < 50) {
    guard++;
    const delta = randInt(-spread, spread);
    const candidate = answer + delta;
    if (candidate >= 0 && candidate !== answer) {
      set.add(candidate);
    }
  }
  while (set.size < 4) {
    set.add(answer + set.size + 1);
  }
  const arr = Array.from(set);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateMathQuestion(grade: GradeLevel): MathQuestion {
  if (grade === '1re') {
    const kind = randInt(0, 2);
    if (kind === 0) {
      // Addition jusqu'à 20
      const a = randInt(1, 12);
      const b = randInt(1, 20 - a);
      const answer = a + b;
      return { prompt: `${a} + ${b} = ?`, answer, choices: buildChoices(answer, 4) };
    }
    if (kind === 1) {
      // Doubles
      const a = randInt(1, 10);
      const answer = a * 2;
      return { prompt: `${a} + ${a} = ?`, answer, choices: buildChoices(answer, 4) };
    }
    // Soustraction jusqu'à 20
    const a = randInt(4, 20);
    const b = randInt(1, a - 1);
    const answer = a - b;
    return { prompt: `${a} − ${b} = ?`, answer, choices: buildChoices(answer, 4) };
  }

  // 3e année : multiplications, divisions exactes, additions/soustractions jusqu'à 100
  const kind = randInt(0, 3);
  if (kind === 0 || kind === 1) {
    const a = randInt(2, 10);
    const b = randInt(2, 10);
    const answer = a * b;
    return { prompt: `${a} × ${b} = ?`, answer, choices: buildChoices(answer, 12) };
  }
  if (kind === 2) {
    const divisor = randInt(2, 9);
    const quotient = randInt(2, 10);
    const dividend = divisor * quotient;
    return {
      prompt: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient,
      choices: buildChoices(quotient, 4),
    };
  }
  if (Math.random() < 0.5) {
    const a = randInt(15, 65);
    const b = randInt(12, 99 - a);
    const answer = a + b;
    return { prompt: `${a} + ${b} = ?`, answer, choices: buildChoices(answer, 10) };
  }
  const a = randInt(35, 99);
  const b = randInt(11, a - 5);
  const answer = a - b;
  return { prompt: `${a} − ${b} = ?`, answer, choices: buildChoices(answer, 10) };
}
