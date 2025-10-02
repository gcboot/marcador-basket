import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../../models/scoreboard.model';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-list.component.html',
  styleUrls: [`./users-list.component.css`]
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  // 🔹 Cargar usuarios desde la API
  loadUsers() {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: data => {
        this.users = data;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'Error al cargar los usuarios';
        console.error('Error cargando usuarios:', err);
        this.loading = false;
      }
    });
  }

  // 🔹 Navegar al formulario de edición
  editUser(id: number) {
    this.router.navigate(['/users/edit', id]);
  }

  // 🔹 Navegar al formulario de creación
  goToCreate() {
    this.router.navigate(['/users/create']);
  }

  // 🔹 Eliminar usuario
  deleteUser(id: number) {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.usersService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: err => {
          this.errorMessage = 'Error al eliminar el usuario';
          console.error('Error eliminando usuario:', err);
        }
      });
    }
  }
}
