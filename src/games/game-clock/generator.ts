import type { GradeLevel } from '../../context/GradeContext';

export interface ClockQuestion {
  hours: number; // 1..12
  minutes: number; // 0..55
  answerLabel: string;
  choices: string[];
}

export function formatFrenchTime(hours: number, minutes: number): string {
  return `${hours} h ${String(minutes).padStart(2, '0')}`;
}

export function generateClockQuestion(grade: GradeLevel): ClockQuestion {
  const hours = Math.floor(Math.random() * 12) + 1;
  const minutePool =
    grade === '1re'
      ? [0, 30]
      : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const minutes = minutePool[Math.floor(Math.random() * minutePool.length)];
  const answerLabel = formatFrenchTime(hours, minutes);

  const set = new Set<string>([answerLabel]);
  let guard = 0;
  while (set.size < 4 && guard < 50) {
    guard++;
    const h = ((hours - 1 + Math.floor(Math.random() * 5) - 2 + 12) % 12) + 1;
    const m = minutePool[Math.floor(Math.random() * minutePool.length)];
    set.add(formatFrenchTime(h, m));
  }

  const choices = Array.from(set);
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  return { hours, minutes, answerLabel, choices };
}
