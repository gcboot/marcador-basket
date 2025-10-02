// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import { GamesComponent } from './components/games/games.component';
import { PlayersComponent } from './components/players/players.component';
import { TeamsComponent } from './components/teams/teams.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: 'scoreboard', component: ScoreboardComponent },
  { path: 'games', component: GamesComponent },
  { path: 'players', component: PlayersComponent },
  { path: 'teams', component: TeamsComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'scoreboard', pathMatch: 'full' }
];
