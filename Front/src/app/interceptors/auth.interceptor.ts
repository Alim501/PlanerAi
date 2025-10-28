import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Перехватчик для HttpOnly Cookies
 * - Автоматически добавляет withCredentials ко всем запросам
 * - Обрабатывает ошибки 401
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Добавляем withCredentials для автоматической отправки cookies
  const authReq = req.clone({
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Не обрабатываем 401 для auth endpoints
        if (
          !req.url.includes('/auth/login') &&
          !req.url.includes('/auth/reg')
          // !req.url.includes('/auth/status')
        ) {
          // Разлогиниваем пользователя
          authStore.logout();
          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};
