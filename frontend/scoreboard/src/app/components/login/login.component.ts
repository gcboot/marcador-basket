import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: (res: any) => {
        // 👇 Guardar token en localStorage
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          this.router.navigate(['/games']);
        } else {
          this.errorMessage = 'Respuesta inválida del servidor';
        }
      },
      error: () => this.errorMessage = 'Credenciales inválidas'
    });
  }
}
