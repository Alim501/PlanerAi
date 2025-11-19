import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../services/auth.service';
import { AuthStore } from '../../../store/auth.store';
import { UserStore } from '../../../store/user.store';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './navbar-custom.html',
  styleUrl: './navbar-custom.scss',
})
export class NavbarCustom {
  private authService = inject(AuthService);
  private authStore = inject(AuthStore);
  private userStore = inject(UserStore);

  isAuthenticated = this.authStore.isAuthenticated;
  loading = this.userStore.loading;
  fullName = this.userStore.fullName;
  initials = this.userStore.initials;
  userEmail = this.userStore.userEmail;
  userRole = this.userStore.userRole;
  isAdmin = this.userStore.isAdmin;
  isModerator = this.userStore.isModerator;
  isAdminOrModerator = this.userStore.isAdminOrModerator;

  logout(): void {
    this.authService.logout();
  }
}
