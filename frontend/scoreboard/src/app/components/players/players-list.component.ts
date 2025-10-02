import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlayersService, Player } from '../../services/players.service';

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css']
})
export class PlayersListComponent implements OnInit {
  players: Player[] = [];
  loading = true;
  errorMessage = '';

  constructor(private playersService: PlayersService, private router: Router) {}

  ngOnInit() {
    this.loadPlayers();
  }

  loadPlayers() {
    this.playersService.getPlayers().subscribe({
      next: data => {
        this.players = data;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'Error al cargar jugadores';
        console.error(err);
        this.loading = false;
      }
    });
  }

  createPlayer() {
    this.router.navigate(['/players/create']);
  }

  editPlayer(id: number) {
    this.router.navigate(['/players/edit', id]);
  }

  deletePlayer(id: number) {
    if (confirm('¿Eliminar este jugador?')) {
      this.playersService.deletePlayer(id).subscribe(() => this.loadPlayers());
    }
  }
}
