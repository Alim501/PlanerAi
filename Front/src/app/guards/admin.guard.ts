import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { UserStore } from '../store/user.store';

export const adminGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const router = inject(Router);

  const isAdmin = userStore.isAdmin();

  if (!isAdmin) {
    router.navigate(['/app/dashboard']);
    return false;
  }

  return true;
};

export const moderatorGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const router = inject(Router);

  const isModeratorOrAdmin = userStore.isAdminOrModerator();

  if (!isModeratorOrAdmin) {
    router.navigate(['/app/dashboard']);
    return false;
  }

  return true;
};
