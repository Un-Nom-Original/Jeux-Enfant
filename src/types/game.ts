import type { ComponentType } from 'react';

export type GameStatus = 'ready' | 'coming-soon';

export interface GameDefinition {
  id: string;
  name: string;
  shortDescription: string;
  icon: string;
  accentBg: string;
  accentText: string;
  status: GameStatus;
  component?: ComponentType;
}
