import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true, // ✅ obligatorio en modo standalone
  imports: [CommonModule, FormsModule], // ✅ módulos necesarios
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // si tienes estilos
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/games']),
      error: () => this.errorMessage = 'Credenciales inválidas'
    });
  }
}
