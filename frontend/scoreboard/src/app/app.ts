import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { ScoreboardService } from './services/scoreboard.service';
import { Game } from './models/scoreboard.models';

type Team = 'home' | 'away';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [DecimalPipe, CommonModule],
  animations: [
    trigger('gameState', [
      transition('* => running', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition('* => finished', [
        animate('600ms ease-in', style({ opacity: 0, transform: 'scale(0.5)' }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  // Estado del juego
  quarter = signal(1);
  scoreHome = signal(0);
  scoreAway = signal(0);
  foulsHome = signal(0);
  foulsAway = signal(0);
  status = signal<'running' | 'paused' | 'finished' | 'canceled' | 'suspended'>('running');

  // Temporizador
  quarterMinutes = signal(10);
  remainingMs = signal(this.minutesToMs(10));
  minutes = signal(10);
  seconds = signal(0);
  running = signal(false);

  private currentGameId?: number;
  private timerId?: number;
  private lastTick = 0;

  constructor(private sb: ScoreboardService) {}

  ngOnInit() {
    // ✅ solo escuchamos cambios del servicio
    this.sb.game$.subscribe(g => {
      if (g) this.updateFromGame(g);
    });
  }

  // --- Helpers
  private updateFromGame(g: Game) {
    this.quarter.set(g.quarter);
    this.scoreHome.set(g.homeScore);
    this.scoreAway.set(g.awayScore);
    this.foulsHome.set(g.homeFouls);
    this.foulsAway.set(g.awayFouls);
    this.status.set(g.status);
  }

  private clearBoard() {
    this.quarter.set(1);
    this.scoreHome.set(0);
    this.scoreAway.set(0);
    this.foulsHome.set(0);
    this.foulsAway.set(0);
    this.status.set('running');
  }

  // --- Crear juego
  newGame() {
    this.sb.createGame().subscribe(g => {
      this.currentGameId = g.id;
      this.sb.connectToGame(g.id);
      this.clearBoard();
      this.reset();
    });
  }

  // --- Iniciar (arranca el reloj y marca estado running en BD)
  start() {
    if (!this.currentGameId) {
      // 👇 Si no hay juego creado, lo creamos antes de iniciar
      this.newGame();
    }

    if (!this.running()) {
      this.running.set(true);
      this.lastTick = 0;
      this.timerId = requestAnimationFrame(this.tick);

      if (this.currentGameId) {
        this.sb.finish(this.currentGameId, 'running').subscribe(g => {
          this.status.set(g.status);
        });
      }
    }
  }

  // --- Acciones del marcador
  add(team: Team, pts: 1 | 2 | 3) {
    if (!this.currentGameId) return;
    this.sb.score(this.currentGameId, team, pts).subscribe();
  }

  sub(team: Team) {
    this.foul(team);
  }

  foul(team: Team) {
    if (!this.currentGameId) return;
    this.sb.foul(this.currentGameId, team).subscribe();
  }

  nextQuarter() {
    if (!this.currentGameId) return;
    this.sb.nextQuarter(this.currentGameId).subscribe(() => this.reset());
  }

  // --- Estados del juego
  pauseGame() {
    if (!this.currentGameId) return;
    this.sb.finish(this.currentGameId, 'paused').subscribe(g => {
      this.pause();
      this.status.set(g.status);
    });
  }

  resumeGame() {
    if (!this.currentGameId) return;
    this.sb.finish(this.currentGameId, 'running').subscribe(g => {
      this.start();
      this.status.set(g.status);
    });
  }

  suspendGame() {
    if (!this.currentGameId) return;
    this.sb.finish(this.currentGameId, 'suspended').subscribe(g => {
      this.pause();
      this.reset();
      this.clearBoard();
      this.status.set(g.status);
    });
  }

  finishGame() {
    if (!this.currentGameId) return;
    this.sb.finish(this.currentGameId, 'finished').subscribe(g => {
      this.pause();
      this.reset();
      this.clearBoard();
      this.status.set(g.status);
    });
  }

  cancelGame() {
    if (!this.currentGameId) return;
    this.sb.finish(this.currentGameId, 'canceled').subscribe(g => {
      this.pause();
      this.reset();
      this.clearBoard();
      this.status.set(g.status);
    });
  }

  connectToGame(id: number) {
    this.sb.connectToGame(id);
    this.currentGameId = id;
  }

  // --- Temporizador
  private minutesToMs(min: number) {
    return min * 60 * 1000;
  }

  private tick = (ts: number) => {
    if (!this.running()) return;

    if (!this.lastTick) this.lastTick = ts;
    const diff = ts - this.lastTick;
    this.lastTick = ts;

    const newRemaining = this.remainingMs() - diff;
    this.remainingMs.set(Math.max(0, newRemaining));

    this.minutes.set(Math.floor(this.remainingMs() / 1000 / 60));
    this.seconds.set(Math.floor((this.remainingMs() / 1000) % 60));

    if (this.remainingMs() > 0) {
      this.timerId = requestAnimationFrame(this.tick);
    } else {
      this.running.set(false);
      this.timerId = undefined;

      if (this.currentGameId) {
        this.sb.nextQuarter(this.currentGameId).subscribe(() => this.reset());
      }
    }
  };

  pause() {
    this.running.set(false);
    if (this.timerId) {
      cancelAnimationFrame(this.timerId);
      this.timerId = undefined;
    }
  }

  reset() {
    this.pause();
    this.remainingMs.set(this.minutesToMs(this.quarterMinutes()));
    this.minutes.set(this.quarterMinutes());
    this.seconds.set(0);
  }

  changeQuarterDuration(delta: number) {
    const newDuration = Math.max(1, this.quarterMinutes() + delta);
    this.quarterMinutes.set(newDuration);
    this.reset();
  }
}
