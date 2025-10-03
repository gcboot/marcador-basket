export type GameStatus = 'running' | 'paused' | 'finished' | 'canceled' | 'suspended';
export type EventType = 'score' | 'foul' | 'quarter' | 'finished' | 'paused' | 'canceled' | 'suspended';

export interface Player {
  id: number;
  name: string;
  number: number;
  teamId: number;
}

export interface Team {
  id: number;
  name: string;
  city?: string;
  logo?: string;
  players?: Player[];
}

export interface Event {
  id: number;
  gameId: number;
  teamId: number;
  playerId?: number | null;   
  eventType: EventType;       // ✅ tipado más fuerte
  points: number;
  at: string;
  player?: Player;
  team?: Team;
}

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

  homeTeamId: number;
  awayTeamId: number;
  homeTeam?: Team | null;     
  awayTeam?: Team | null;

  events: Event[];            // ✅ siempre presente (aunque sea vacío)
}

export interface User {
  id: number;
  username: string;
  rol: string;
}
