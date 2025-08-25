import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Game } from '../models/scoreboard.models';
import { environment } from '../../environments/environment';
import * as signalR from '@microsoft/signalr'; // 👈 cliente SignalR

type Team = 'home' | 'away';

@Injectable({ providedIn: 'root' })
export class ScoreboardService {
  private apiUrl = environment.apiUrl;
  private hubUrl = environment.hubUrl || 'http://localhost:5071/hub/game'; // 👈 usa http en local para evitar SSL error
  private gameSubject = new BehaviorSubject<Game | null>(null);
  game$ = this.gameSubject.asObservable();

  private hubConnection?: signalR.HubConnection;

  constructor(private http: HttpClient) { }

  // --- Crear un nuevo juego ---
  createGame(): Observable<Game> {
    return this.http.post<Game>(`${this.apiUrl}`, null).pipe(
      tap(g => {
        this.gameSubject.next(g);
        this.connectToGame(g.id); // 👈 al crear juego, me conecto al hub
      })
    );
  }

  // --- Conectarse a un juego existente ---
  connectToGame(id: number) {
    // Estado inicial desde la API
    this.http.get<Game>(`${this.apiUrl}/${id}`).subscribe(g => this.gameSubject.next(g));

    // Si ya hay una conexión, la cerramos
    if (this.hubConnection) {
      this.hubConnection.stop();
    }

    // Crear la nueva conexión
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .build();

    // Conectar
    this.hubConnection!.invoke('JoinGame', Number(id))
      .then(() => {
        console.log('✅ Conectado al hub SignalR');
        // Intentar unirse al grupo
        this.hubConnection!.invoke('JoinGame', id)
          .then(() => console.log(`👉 Unido al grupo game-${id}`))
          .catch(err => console.error('❌ Error al unirse al grupo:', err));
      })
      .catch(err => console.error('❌ Error al conectar con SignalR:', err));

    // Suscripción a eventos del backend
    this.hubConnection.on('ScoreUpdated', data => this.updateGameFromSignalR(data));
    this.hubConnection.on('FoulUpdated', data => this.updateGameFromSignalR(data));
    this.hubConnection.on('QuarterUpdated', quarter => {
      const current = this.gameSubject.value;
      if (current) {
        this.gameSubject.next({ ...current, quarter });
      }
    });
    this.hubConnection.on('GameStatusUpdated', data => {
      const current = this.gameSubject.value;
      if (current) {
        this.gameSubject.next({ ...current, status: data.status });
      }
    });

    // ✅ Nuevo: escuchar creación de juegos
    this.hubConnection.on('GameCreated', (newGame: Game) => {
      console.log('🎉 Nuevo juego creado:', newGame);
      this.gameSubject.next(newGame);
    });
  }

  // --- Acciones ---
  score(id: number, team: Team, points: number): Observable<Game> {
    return this.http
      .post<Game>(`${this.apiUrl}/${id}/score?team=${team}&points=${points}`, null)
      .pipe(tap(g => this.gameSubject.next(g)));
  }

  foul(id: number, team: Team): Observable<Game> {
    return this.http
      .post<Game>(`${this.apiUrl}/${id}/foul?team=${team}`, null)
      .pipe(tap(g => this.gameSubject.next(g)));
  }

  nextQuarter(id: number): Observable<Game> {
    return this.http
      .post<Game>(`${this.apiUrl}/${id}/quarter/next`, null)
      .pipe(tap(g => this.gameSubject.next(g)));
  }

  finish(
    id: number,
    status: 'running' | 'paused' | 'finished' | 'canceled' | 'suspended'
  ): Observable<Game> {
    return this.http
      .post<Game>(`${this.apiUrl}/${id}/finish?status=${status}`, null)
      .pipe(tap(g => this.gameSubject.next(g)));
  }

  // --- Actualización desde SignalR ---
  private updateGameFromSignalR(data: any) {
    const current = this.gameSubject.value;
    if (current) {
      this.gameSubject.next({ ...current, ...data });
    } else {
      this.gameSubject.next(data as Game);
    }
  }
}
