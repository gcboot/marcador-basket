import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamsService, Team } from '../../services/teams.service';

@Component({
  selector: 'app-teams-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams-form.component.html',
  styleUrls: ['./teams-form.component.css']
})
export class TeamsFormComponent implements OnInit {
  team: Partial<Team> = {};
  isEdit = false;

  constructor(
    private teamsService: TeamsService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.teamsService.getTeam(+id).subscribe(t => this.team = t);
    }
  }

  save() {
    if (this.isEdit && this.team.id) {
      this.teamsService.updateTeam(this.team.id, this.team).subscribe(() => {
        this.router.navigate(['/teams']);
      });
    } else {
      this.teamsService.createTeam(this.team).subscribe(() => {
        this.router.navigate(['/teams']);
      });
    }
  }
}
