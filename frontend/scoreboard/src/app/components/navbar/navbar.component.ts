// src/app/components/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="logo">🏀 Scoreboard</div>
      <ul>
        <li><a routerLink="/scoreboard">Tablero</a></li>
        <li><a routerLink="/teams">Equipos</a></li>
        <li><a routerLink="/players">Jugadores</a></li>
        <li><a routerLink="/games">Partidos</a></li>
        <li><a (click)="logout()">Cerrar Sesión</a></li>
      </ul>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: #222;
      color: white;
      padding: 0.8rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
    }
    .logo {
      font-weight: bold;
      font-size: 1.2rem;
    }
    ul {
      list-style: none;
      display: flex;
      gap: 1.5rem;
      margin: 0;
      padding: 0;
    }
    a {
      color: white;
      text-decoration: none;
      font-weight: 500;
    }
    a:hover {
      text-decoration: underline;
    }
  `]
})
export class NavbarComponent {
  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
