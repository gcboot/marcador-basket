import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { APP_CONFIG, AppConfig } from '../app.config';
import { Game, Team } from '../models/scoreboard.model';

@Injectable({ providedIn: 'root' })
export class GamesService {
  private hubConnection?: HubConnection;
  private gameUpdated$ = new Subject<Game>();
  private currentGame: Game | null = null;

  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {}

  // -------- Headers con token --------
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // -------- Juegos --------
  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.config.apiUrl}/games`, { headers: this.authHeaders() });
  }

  getGame(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.config.apiUrl}/games/${id}`, { headers: this.authHeaders() });
  }

  createGame(game: Partial<Game>): Observable<Game> {
    return this.http.post<Game>(`${this.config.apiUrl}/games`, game, { headers: this.authHeaders() });
  }

  updateGame(id: number, game: Partial<Game>): Observable<void> {
    return this.http.put<void>(`${this.config.apiUrl}/games/${id}`, game, { headers: this.authHeaders() });
  }

  deleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.config.apiUrl}/games/${id}`, { headers: this.authHeaders() });
  }

  // -------- Equipos --------
  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.config.apiUrl}/teams`, { headers: this.authHeaders() });
  }

  // -------- Eventos --------
  addScore(gameId: number, teamId: number, playerId: number | null, points: number): Observable<Game> {
    const body = { gameId, teamId, playerId, points };
    // 👇 Importante: usa minúscula "events"
    return this.http.post<Game>(`${this.config.apiUrl}/events/score`, body, { headers: this.authHeaders() });
  }

  addFoul(gameId: number, teamId: number, playerId: number | null): Observable<Game> {
    const body = { gameId, teamId, playerId };
    return this.http.post<Game>(`${this.config.apiUrl}/events/foul`, body, { headers: this.authHeaders() });
  }

  nextQuarter(id: number): Observable<Game> {
    return this.http.post<Game>(`${this.config.apiUrl}/games/${id}/quarter/next`, {}, { headers: this.authHeaders() });
  }

  updateStatus(id: number, status: string): Observable<Game> {
    return this.http.post<Game>(`${this.config.apiUrl}/games/${id}/finish?status=${status}`, {}, { headers: this.authHeaders() });
  }

  // -------- SIGNALR --------
  connectToHub() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.config.hubUrl)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('✅ Conectado a SignalR'))
      .catch(err => console.error('❌ Error conectando SignalR:', err));

    // Escuchar eventos del backend
    this.hubConnection.on('GameCreated', (game: Game) => this.emitUpdate(game));
    this.hubConnection.on('ScoreUpdated', (update: Game) => this.emitUpdate(update));
    this.hubConnection.on('FoulUpdated', (update: Game) => this.emitUpdate(update));
    this.hubConnection.on('GameStatusUpdated', (update: Game) => this.emitUpdate(update));
    this.hubConnection.on('QuarterUpdated', (update: Game) => this.emitUpdate(update));

    this.hubConnection.on('GameDeleted', (gameId: number) => {
      console.log(`🗑 Juego eliminado desde SignalR: ${gameId}`);
      if (this.currentGame && this.currentGame.id === gameId) {
        this.currentGame = null;
      }
    });
  }

  private emitUpdate(game: Game) {
    this.currentGame = game;
    this.gameUpdated$.next(game);
  }

  onGameUpdated(): Observable<Game> {
    return this.gameUpdated$.asObservable();
  }

  // Permite reconectar manualmente a un juego específico (útil al cambiar cuarto)
  reconnectToGameHub(gameId: number) {
    if (this.hubConnection?.state === 'Connected') {
      this.hubConnection.invoke('JoinGame', gameId)
        .then(() => console.log(`📡 Reconectado al grupo game-${gameId}`))
        .catch(err => console.warn('⚠️ No se pudo unir al grupo:', err));
    }
  }
}
