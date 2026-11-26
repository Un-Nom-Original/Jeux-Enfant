import type { GradeLevel } from '../../context/GradeContext';

export type CompareSign = '<' | '=' | '>';

export interface CrocodileQuestion {
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
  rightValue: number;
  answer: CompareSign;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeExpr(grade: GradeLevel): { label: string; value: number } {
  if (grade === '1re') {
    const val = randInt(1, 30);
    return { label: String(val), value: val };
  }

  const kind = randInt(0, 2);
  if (kind === 0) {
    const a = randInt(2, 9);
    const b = randInt(2, 9);
    return { label: `${a} × ${b}`, value: a * b };
  }
  if (kind === 1) {
    const a = randInt(10, 45);
    const b = randInt(5, 35);
    return { label: `${a} + ${b}`, value: a + b };
  }
  const a = randInt(30, 80);
  const b = randInt(5, 28);
  return { label: `${a} − ${b}`, value: a - b };
}

export function generateCrocodileQuestion(grade: GradeLevel): CrocodileQuestion {
  const left = makeExpr(grade);
  let right = makeExpr(grade);

  // Force parfois une égalité (~20%) pour bien pratiquer le signe "="
  if (Math.random() < 0.2) {
    right = { label: String(left.value), value: left.value };
  }

  const answer: CompareSign =
    left.value < right.value ? '<' : left.value > right.value ? '>' : '=';

  return {
    leftLabel: left.label,
    rightLabel: right.label,
    leftValue: left.value,
    rightValue: right.value,
    answer,
  };
}
