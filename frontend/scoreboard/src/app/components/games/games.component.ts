import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ necesario para [(ngModel)]
import { Router } from '@angular/router';
import { GamesService } from '../../services/games.service';
import { Game } from '../../models/scoreboard.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ agregar FormsModule
  templateUrl: './games.component.html',
  //styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit {
  games: Game[] = [];
  teams: any[] = [];
  selectedHomeTeamId: number | null = null;
  selectedAwayTeamId: number | null = null;

  constructor(
    private router: Router,
    private gamesService: GamesService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadGames();
    this.loadTeams();
  }

  loadGames() {
    this.gamesService.getGames().subscribe((data: Game[]) => {
      this.games = data;
    });
  }

  loadTeams() {
    this.http.get<any[]>(`http://localhost:5071/api/Teams`)
      .subscribe(data => this.teams = data);
  }

  createGame() {
    if (!this.selectedHomeTeamId || !this.selectedAwayTeamId) {
      alert("Debes seleccionar ambos equipos");
      return;
    }

    const nuevo: Partial<Game> = {
      homeTeamId: this.selectedHomeTeamId,
      awayTeamId: this.selectedAwayTeamId,
      status: 'paused'
    };

    this.gamesService.createGame(nuevo).subscribe(() => this.loadGames());
  }

  goToScoreboard(id: number) {
    this.router.navigate(['/scoreboard'], { queryParams: { id } });
  }
}
