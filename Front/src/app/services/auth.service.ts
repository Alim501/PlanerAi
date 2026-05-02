import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, firstValueFrom } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';
import { AuthStore } from '../store/auth.store';
import { UserStore } from '../store/user.store';
import { UserService } from './user.service';
import { User } from '../models/user.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private authCheckPromise: Promise<void> | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authStore: AuthStore,
    private userStore: UserStore,
    private userService: UserService
  ) {
    // ✅ Создаем Promise для ожидания проверки статуса
    this.authCheckPromise = this.checkAuthStatus();
  }

  /**
   * Проверить статус авторизации при загрузке приложения
   * Возвращает Promise для возможности ожидания
   */
  async checkAuthStatus(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ authenticated: boolean }>(`${this.API_URL}/status`, {
          withCredentials: true,
        })
      );

      if (response.authenticated) {
        this.authStore.setAuthenticated(true);
        this.loadCurrentUser();
      } else {
        this.authStore.setAuthenticated(false);
      }
    } catch (error) {
      this.authStore.setAuthenticated(false);
    } finally {
      this.authStore.setAuthChecked();
    }
  }

  /**
   * Ждем завершения проверки статуса авторизации
   */
  async waitForAuthCheck(): Promise<void> {
    if (this.authCheckPromise) {
      await this.authCheckPromise;
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    this.authStore.setLoading(true);

    return this.http
      .post<AuthResponse>(`${this.API_URL}/reg`, request, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          this.handleAuthSuccess();
        }),
        catchError((error: any) => {
          this.authStore.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    this.authStore.setLoading(true);

    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, request, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          this.handleAuthSuccess();
        }),
        catchError((error: any) => {
          this.authStore.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.authStore.setLoading(true);

    this.http
      .post(
        `${this.API_URL}/logout`,
        {},
        {
          withCredentials: true,
        }
      )
      .subscribe({
        next: () => {
          this.authStore.logout();
          this.userStore.clearUser();
          this.authStore.setLoading(false);
          this.router.navigate(['/login']);
        },
        error: () => {
          this.authStore.logout();
          this.userStore.clearUser();
          this.authStore.setLoading(false);
          this.router.navigate(['/login']);
        },
      });
  }

  loadCurrentUser(): void {
    if (!this.authStore.isAuthenticated()) {
      console.log('⚠️ Not authenticated, skipping user load');
      return;
    }

    this.userStore.setLoading(true);
    this.userService.getUserInfo().subscribe({
      next: (user: User) => {
        this.userStore.setLoading(false);
        this.authStore.setLoading(false);
      },
      error: (error: any) => {
        this.userStore.setLoading(false);
        this.authStore.setLoading(false);

        if (error.status === 401) {
          this.authStore.logout();
          this.router.navigate(['/login']);
        }
      },
    });
  }

  private handleAuthSuccess(): void {
    this.authStore.login();
    this.loadCurrentUser();
  }
}
