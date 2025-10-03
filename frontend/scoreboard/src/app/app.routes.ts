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

// 👇 Importamos el guard
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // 👇 Todas estas rutas están protegidas
  { path: 'scoreboard', component: ScoreboardComponent, canActivate: [authGuard] },
  { path: 'games', component: GamesComponent, canActivate: [authGuard] },

  // Users
  { path: 'users', component: UsersListComponent, canActivate: [authGuard] },
  { path: 'users/create', component: UserFormComponent, canActivate: [authGuard] },
  { path: 'users/edit/:id', component: UserFormComponent, canActivate: [authGuard] },

  // Players
  { path: 'players', component: PlayersListComponent, canActivate: [authGuard] },
  { path: 'players/create', component: PlayerFormComponent, canActivate: [authGuard] },
  { path: 'players/edit/:id', component: PlayerFormComponent, canActivate: [authGuard] },

  // Teams
  { path: 'teams', component: TeamsListComponent, canActivate: [authGuard] },
  { path: 'teams/create', component: TeamsFormComponent, canActivate: [authGuard] },
  { path: 'teams/edit/:id', component: TeamsFormComponent, canActivate: [authGuard] },

  // Default → si no hay login, mandar a /login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
