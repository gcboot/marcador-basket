// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import { GamesComponent } from './components/games/games.component';

import { LoginComponent } from './components/login/login.component';

// Users
import { UsersListComponent } from './components/users/users-list.component';
import { UserFormComponent } from './components/users/user-form.component';

// Players
import { PlayersListComponent } from './components/players/players-list.component';
import { PlayerFormComponent } from './components/players/player-form.component';

// Teams
import { TeamsListComponent } from './components/teams/teams-list.component';
import { TeamsFormComponent } from './components/teams/teams-form.component';

export const routes: Routes = [
  { path: 'scoreboard', component: ScoreboardComponent },
  { path: 'games', component: GamesComponent },

  { path: 'login', component: LoginComponent },

  // Users
  { path: 'users', component: UsersListComponent },
  { path: 'users/create', component: UserFormComponent },
  { path: 'users/edit/:id', component: UserFormComponent },

  // Players
  { path: 'players', component: PlayersListComponent },
  { path: 'players/create', component: PlayerFormComponent },
  { path: 'players/edit/:id', component: PlayerFormComponent },

  // Teams
  { path: 'teams', component: TeamsListComponent },
  { path: 'teams/create', component: TeamsFormComponent },
  { path: 'teams/edit/:id', component: TeamsFormComponent },

  // Default
  { path: '', redirectTo: 'scoreboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'scoreboard' } // 👈 fallback si escriben mal la ruta
];
