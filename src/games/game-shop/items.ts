import type { GradeLevel } from '../../context/GradeContext';

export interface ShopItem {
  name: string;
  emoji: string;
  price: number;
}

const ITEMS_POOL = [
  { name: 'Pomme', emoji: '🍎' },
  { name: 'Ballon', emoji: '⚽' },
  { name: 'Livre', emoji: '📖' },
  { name: 'Ours en peluche', emoji: '🧸' },
  { name: 'Gâteau', emoji: '🎂' },
  { name: 'Fusée jouet', emoji: '🚀' },
  { name: 'Guitare', emoji: '🎸' },
  { name: 'Casquette', emoji: '🧢' },
  { name: 'Glace', emoji: '🍦' },
  { name: 'Skateboard', emoji: '🛹' },
  { name: 'Sac à dos', emoji: '🎒' },
  { name: 'Robot', emoji: '🤖' },
];

export function generateShopItem(grade: GradeLevel): ShopItem {
  const chosen = ITEMS_POOL[Math.floor(Math.random() * ITEMS_POOL.length)];
  const price =
    grade === '1re'
      ? Math.floor(Math.random() * 18) + 3 // 3$ à 20$
      : Math.floor(Math.random() * 54) + 15; // 15$ à 68$
  return { ...chosen, price };
}
