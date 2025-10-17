import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Перехватчик для добавления JWT токена к каждому запросу
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Клонируем запрос и добавляем токен, если он есть
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Обрабатываем ошибки (например, 401 Unauthorized)
  return next(req).pipe(
    catchError((error: any) => {
      if (error.status === 401) {
        // Токен недействителен или истек
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
