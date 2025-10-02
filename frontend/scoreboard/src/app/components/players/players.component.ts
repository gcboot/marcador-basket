import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayersService } from '../../services/players.service';

@Component({
  selector: 'app-players',
  standalone: true, // ✅ obligatorio en modo standalone
  imports: [CommonModule], // ✅ necesario para *ngFor, *ngIf, etc.
  templateUrl: './players.component.html',
  //styleUrls: ['./players.component.css'] // si tienes estilos
})
export class PlayersComponent implements OnInit {
  players: any[] = [];

  constructor(private playersService: PlayersService) {}

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers() {
    this.playersService.getPlayers().subscribe(data => {
      this.players = data;
    });
  }
}
