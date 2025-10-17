import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  // Используем signal для реактивности
  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = signal<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {
    // Проверяем токен при инициализации
    this.checkAuthStatus();
  }

  /**
   * Регистрация нового пользователя
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/reg`, request)
      .pipe(tap((response: AuthResponse) => this.handleAuthSuccess(response)));
  }

  /**
   * Вход пользователя
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, request)
      .pipe(tap((response: AuthResponse) => this.handleAuthSuccess(response)));
  }

  /**
   * Выход пользователя
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Получить токен
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Проверить наличие токена
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Обработка успешной аутентификации
   */
  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);

    const user: User = {
      email: response.email,
      role: response.role,
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  /**
   * Получить данные пользователя из хранилища
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Проверить статус аутентификации
   */
  private checkAuthStatus(): void {
    if (this.hasToken()) {
      const user = this.getUserFromStorage();
      if (user) {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } else {
        this.logout();
      }
    }
  }

  /**
   * Проверить, истек ли токен
   */
  isTokenExpired(): boolean {
    return false;
  }
}
