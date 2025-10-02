import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GamesService } from '../../services/games.service';
import { Game } from '../../models/scoreboard.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
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
    this.gamesService.getGames().subscribe({
      next: (data: Game[]) => {
        this.games = data;
      },
      error: (err) => {
        console.error('Error cargando juegos:', err);
      }
    });
  }

  loadTeams() {
    this.http.get<any[]>(`http://localhost:5071/api/Teams`)
      .subscribe({
        next: data => this.teams = data,
        error: err => console.error('Error cargando equipos:', err)
      });
  }

  createGame() {
    if (!this.selectedHomeTeamId || !this.selectedAwayTeamId) {
      alert("Debes seleccionar ambos equipos");
      return;
    }

    if (this.selectedHomeTeamId === this.selectedAwayTeamId) {
      alert("Un equipo no puede jugar contra sí mismo");
      return;
    }

    const nuevo: Partial<Game> = {
      homeTeamId: this.selectedHomeTeamId,
      awayTeamId: this.selectedAwayTeamId,
      status: 'paused'
    };

    this.gamesService.createGame(nuevo).subscribe({
      next: () => {
        this.loadGames();
        // limpiar selects después de crear
        this.selectedHomeTeamId = null;
        this.selectedAwayTeamId = null;
      },
      error: err => console.error('Error creando juego:', err)
    });
  }

  goToScoreboard(id: number) {
    this.router.navigate(['/scoreboard'], { queryParams: { id } });
  }

  deleteGame(id: number) {
    if (confirm('¿Seguro que deseas eliminar este partido?')) {
      this.gamesService.deleteGame(id).subscribe({
        next: () => this.loadGames(),
        error: err => console.error('Error eliminando juego:', err)
      });
    }
  }
}
