import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayersService {
  private apiUrl = 'http://localhost:5071/api/Players';

  constructor(private http: HttpClient) {}

  getPlayers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createPlayer(player: any): Observable<any> {
    return this.http.post(this.apiUrl, player);
  }

  assignToTeam(playerId: number, teamId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${playerId}/team/${teamId}`, {});
  }
}
