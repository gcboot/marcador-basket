import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsService } from '../../services/teams.service';

@Component({
  selector: 'app-teams',
  standalone: true, // ✅ ahora es standalone
  imports: [CommonModule], // ✅ necesario para *ngFor, *ngIf, etc.
  templateUrl: './teams.component.html',
  //styleUrls: ['./teams.component.css'] // si tienes estilos
})
export class TeamsComponent implements OnInit {
  teams: any[] = [];

  constructor(private teamsService: TeamsService) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams() {
    this.teamsService.getTeams().subscribe(data => {
      this.teams = data;
    });
  }
}
