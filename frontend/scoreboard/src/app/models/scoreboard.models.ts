export type GameStatus = 'running' | 'paused' | 'finished' | 'canceled' | 'suspended';

export interface Game {
  id: number;
  quarter: number;
  homeScore: number;
  awayScore: number;
  homeFouls: number;
  awayFouls: number;
  status: GameStatus;
  startedAt?: string;
  endedAt?: string | null;
}
