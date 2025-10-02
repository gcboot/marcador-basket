import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { APP_CONFIG, AppConfig } from '../app.config';
import { Game, Event } from '../models/scoreboard.model';

@Injectable({ providedIn: 'root' })
export class GamesService {
  private hubConnection?: HubConnection;
  private gameUpdated$ = new Subject<Game>();
  private currentGame: Game | null = null;

  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {}

  // -------- helper para headers con token --------
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // -------- REST API --------
  getGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.config.apiUrl}/Games`, { headers: this.authHeaders() });
  }

  getGame(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.config.apiUrl}/Games/${id}`, { headers: this.authHeaders() });
  }

  createGame(game: Partial<Game>): Observable<Game> {
    return this.http.post<Game>(`${this.config.apiUrl}/Games`, game, { headers: this.authHeaders() });
  }

  updateGame(id: number, game: Partial<Game>): Observable<void> {
    return this.http.put<void>(`${this.config.apiUrl}/Games/${id}`, game, { headers: this.authHeaders() });
  }

  deleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.config.apiUrl}/Games/${id}`, { headers: this.authHeaders() });
  }

  // -------- Eventos --------
  addScore(gameId: number, teamId: number, playerId: number, points: number): Observable<Game> {
    // ✅ importante: enviar solo lo que el backend espera
    const body = { gameId, teamId, playerId, points, eventType: 'score' };
    return this.http.post<Game>(`${this.config.apiUrl}/Events/score`, body, { headers: this.authHeaders() });
  }

  addFoul(gameId: number, teamId: number, playerId: number): Observable<Game> {
    const body = { gameId, teamId, playerId, eventType: 'foul', points: 0 };
    return this.http.post<Game>(`${this.config.apiUrl}/Events/foul`, body, { headers: this.authHeaders() });
  }

  nextQuarter(id: number): Observable<Game> {
    return this.http.post<Game>(
      `${this.config.apiUrl}/Games/${id}/quarter/next`,
      {},
      { headers: this.authHeaders() }
    );
  }

  updateStatus(id: number, status: string): Observable<Game> {
    // ⚠️ este endpoint cambia estado pero no está registrando evento en DB.
    // Si quieres que se guarde también en Events, hay que modificar GamesController.
    return this.http.post<Game>(
      `${this.config.apiUrl}/Games/${id}/finish?status=${status}`,
      {},
      { headers: this.authHeaders() }
    );
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

    // Eventos del servidor
    this.hubConnection.on('GameCreated', (game: Game) => this.emitUpdate(game));
    this.hubConnection.on('ScoreUpdated', (update: Game) => this.emitUpdate(update));
    this.hubConnection.on('FoulUpdated', (update: Game) => this.emitUpdate(update));
    this.hubConnection.on('GameStatusUpdated', (update: Game) => this.emitUpdate(update));
    this.hubConnection.on('QuarterUpdated', (quarter: number) => {
      if (this.currentGame) {
        this.currentGame.quarter = quarter;
        this.gameUpdated$.next(this.currentGame);
      }
    });

    // ✅ Nuevo: manejar eliminación de juegos
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
}
