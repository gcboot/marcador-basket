import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../app.config';

export interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
  teamId: number;
  team?: { id: number; name: string };
}

@Injectable({ providedIn: 'root' })
export class PlayersService {
  constructor(private http: HttpClient, @Inject(APP_CONFIG) private config: AppConfig) {}

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.config.apiUrl}/Players`);
  }

  getPlayer(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.config.apiUrl}/Players/${id}`);
  }

  createPlayer(player: Partial<Player>): Observable<Player> {
    return this.http.post<Player>(`${this.config.apiUrl}/Players`, player);
  }

  updatePlayer(id: number, player: Partial<Player>): Observable<void> {
    return this.http.put<void>(`${this.config.apiUrl}/Players/${id}`, player);
  }

  deletePlayer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.config.apiUrl}/Players/${id}`);
  }
}
