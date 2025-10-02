import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../app.config';

export interface Team {
  id: number;
  name: string;
  players?: { id: number; name: string; number: number }[];
}

@Injectable({ providedIn: 'root' })
export class TeamsService {
  constructor(private http: HttpClient, @Inject(APP_CONFIG) private config: AppConfig) {}

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.config.apiUrl}/Teams`);
  }

  getTeam(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.config.apiUrl}/Teams/${id}`);
  }

  createTeam(team: Partial<Team>): Observable<Team> {
    return this.http.post<Team>(`${this.config.apiUrl}/Teams`, team);
  }

  updateTeam(id: number, team: Partial<Team>): Observable<void> {
    return this.http.put<void>(`${this.config.apiUrl}/Teams/${id}`, team);
  }

  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.config.apiUrl}/Teams/${id}`);
  }
}
