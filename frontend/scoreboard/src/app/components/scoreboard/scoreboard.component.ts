import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GamesService } from '../../services/games.service';
import { Game } from '../../models/scoreboard.model';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  game = signal<Game | null>(null);

  selectedHomePlayerId: number | null = null;
  selectedAwayPlayerId: number | null = null;

  quarterMinutes = signal(10);
  minutes = signal(10);
  seconds = signal(0);
  private interval: any;
  private sub?: Subscription;

  constructor(
    private gamesService: GamesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.gamesService.connectToHub();

    this.sub = this.gamesService.onGameUpdated().subscribe(updated => {
      if (updated) this.game.set(updated);
    });

    this.route.queryParams.subscribe(params => {
      const gameId = params['id'];
      if (gameId) {
        this.connectToGame(Number(gameId));
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.stopTimer();
  }

  // -------- API Actions --------
  newGame() {
    const homeTeamId = 1;
    const awayTeamId = 2;

    this.gamesService.createGame({
      homeTeamId,
      awayTeamId,
      status: 'running'
    }).subscribe(created => {
      this.game.set(created);
      this.reset();
      this.router.navigate(['/scoreboard'], { queryParams: { id: created.id } });
    });
  }

  connectToGame(id: number) {
    this.gamesService.getGame(id).subscribe(found => {
      this.game.set(found);
      this.reset();
    });
  }

  add(teamId: number, playerId: number, points: number) {
    if (!this.game() || !playerId) return;
    this.gamesService.addScore(this.game()!.id, teamId, playerId, points)
      .subscribe(g => this.game.set(g));
  }

  foul(teamId: number, playerId: number) {
    if (!this.game() || !playerId) return;
    this.gamesService.addFoul(this.game()!.id, teamId, playerId)
      .subscribe(g => this.game.set(g));
  }

  nextQuarter() {
    if (!this.game()) return;
    this.gamesService.nextQuarter(this.game()!.id)
      .subscribe(g => {
        this.game.set(g);
        this.reset();
      });
  }

  // -------- Estados del juego como eventos --------
  private changeStatus(status: string) {
    if (!this.game()) return;
    this.gamesService.updateStatus(this.game()!.id, status)
      .subscribe(g => this.game.set(g));
    this.stopTimer();
  }

  finishGame() { this.changeStatus('finished'); }
  cancelGame() { this.changeStatus('canceled'); }
  suspendGame() { this.changeStatus('suspended'); }
  pauseGame()   { this.changeStatus('paused'); }
  resumeGame()  { 
    this.changeStatus('running'); 
    this.start(); 
  }

  // -------- Timer --------
  start() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      if (this.seconds() > 0) {
        this.seconds.update(v => v - 1);
      } else if (this.minutes() > 0) {
        this.minutes.update(v => v - 1);
        this.seconds.set(59);
      } else {
        this.nextQuarter();
      }
    }, 1000);
  }

  reset() {
    this.stopTimer();
    this.minutes.set(this.quarterMinutes());
    this.seconds.set(0);
  }

  stopTimer() {
    clearInterval(this.interval);
    this.interval = null;
  }

  changeQuarterDuration(change: number) {
    this.quarterMinutes.update(v => Math.max(1, v + change));
    this.reset();
  }

  // -------- Getters --------
  status = () => this.game()?.status ?? 'paused';
  quarter = () => this.game()?.quarter ?? 1;
  scoreHome = () => this.game()?.homeScore ?? 0;
  scoreAway = () => this.game()?.awayScore ?? 0;
  foulsHome = () => this.game()?.homeFouls ?? 0;
  foulsAway = () => this.game()?.awayFouls ?? 0;
}
