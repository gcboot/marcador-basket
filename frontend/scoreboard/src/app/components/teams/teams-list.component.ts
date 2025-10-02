import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TeamsService, Team } from '../../services/teams.service';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.css']
})
export class TeamsListComponent implements OnInit {
  teams: Team[] = [];
  loading = true;
  errorMessage = '';

  constructor(private teamsService: TeamsService, private router: Router) {}

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.teamsService.getTeams().subscribe({
      next: data => {
        this.teams = data;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'Error al cargar equipos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  createTeam() {
    this.router.navigate(['/teams/create']);
  }

  editTeam(id: number) {
    this.router.navigate(['/teams/edit', id]);
  }

  deleteTeam(id: number) {
    if (confirm('¿Eliminar este equipo?')) {
      this.teamsService.deleteTeam(id).subscribe(() => this.loadTeams());
    }
  }
}
