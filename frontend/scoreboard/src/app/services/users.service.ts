import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../app.config';
import { User } from '../models/scoreboard.model';

export interface CreateUserDto {
  username: string;
  password: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {}

  // 🔹 Método para construir headers con token JWT
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // 👈 asegúrate que en login se guarda
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.config.apiUrl}/Usuarios`, {
      headers: this.getAuthHeaders()
    });
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.config.apiUrl}/Usuarios/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.config.apiUrl}/Usuarios`, user, {
      headers: this.getAuthHeaders()
    });
  }

  updateUser(id: number, user: Partial<CreateUserDto>): Observable<void> {
    return this.http.put<void>(`${this.config.apiUrl}/Usuarios/${id}`, user, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.config.apiUrl}/Usuarios/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
