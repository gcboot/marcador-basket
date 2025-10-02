import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayersService, Player } from '../../services/players.service';
import { TeamsService } from '../../services/teams.service';

@Component({
  selector: 'app-player-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-form.component.html',
  styleUrls: ['./player-form.component.css']
})
export class PlayerFormComponent implements OnInit {
  player: Partial<Player> = {};
  teams: any[] = [];
  isEdit = false;

  constructor(
    private playersService: PlayersService,
    private teamsService: TeamsService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit() {
    this.loadTeams();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.playersService.getPlayer(+id).subscribe(p => this.player = p);
    }
  }

  loadTeams() {
    this.teamsService.getTeams().subscribe(data => this.teams = data);
  }

  save() {
    if (this.isEdit && this.player.id) {
      this.playersService.updatePlayer(this.player.id, this.player).subscribe(() => {
        this.router.navigate(['/players']);
      });
    } else {
      this.playersService.createPlayer(this.player).subscribe(() => {
        this.router.navigate(['/players']);
      });
    }
  }
}
