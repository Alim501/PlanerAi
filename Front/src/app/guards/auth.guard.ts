import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { AuthService } from '../services/auth.service';

/**
 * Guard для защищенных роутов
 * Ждет завершения проверки статуса авторизации
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  //  Ждем завершения проверки статуса
  await authService.waitForAuthCheck();

  const isAuth = authStore.isAuthenticated();

  if (isAuth) {
    return true;
  }

  console.log('❌ Access denied, redirecting to /login');
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};

/**
 * Guard для публичных страниц (login/register)
 */
export const publicGuard: CanActivateFn = async (route, state) => {
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  //  Ждем завершения проверки статуса
  await authService.waitForAuthCheck();

  const isAuth = authStore.isAuthenticated();

  if (!isAuth) {
    return true;
  }

  console.log('⚠️ Already authenticated, redirecting to /');
  router.navigate(['/']);
  return false;
};
