import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService, CreateUserDto } from '../../services/users.service';
import { User } from '../../models/scoreboard.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./users-form.component.css']
})
export class UserFormComponent implements OnInit {
  user: Partial<CreateUserDto> = { username: '', password: '', rol: 'user' };
  editing = false;
  id: number | null = null;
  errorMessage = '';

  constructor(
    private usersService: UsersService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      this.editing = true;
      this.usersService.getUser(this.id).subscribe({
        next: (u: User) => {
          // ⚡ Al editar no pedimos password
          this.user = { username: u.username, rol: u.rol };
        },
        error: err => {
          console.error('Error cargando usuario:', err);
          this.errorMessage = 'No se pudo cargar el usuario';
        }
      });
    }
  }

  save() {
    if (this.editing && this.id) {
      this.usersService.updateUser(this.id, this.user).subscribe({
        next: () => this.router.navigate(['/users']),
        error: err => {
          console.error('Error actualizando usuario:', err);
          this.errorMessage = 'Error al guardar cambios';
        }
      });
    } else {
      this.usersService.createUser(this.user as CreateUserDto).subscribe({
        next: () => this.router.navigate(['/users']),
        error: err => {
          console.error('Error creando usuario:', err);
          this.errorMessage = 'Error al crear usuario';
        }
      });
    }
  }
}
