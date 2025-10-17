import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';

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
  ],
  template: `
    <mat-toolbar color="primary">
      <span class="logo">PlannerAI</span>

      @if (isAuthenticated()) {
      <div class="nav-links">
        <a mat-button routerLink="/dashboard" routerLinkActive="active">Дашборд</a>
        <a mat-button routerLink="/tasks" routerLinkActive="active">Задачи</a>
        <a mat-button routerLink="/calendar" routerLinkActive="active">Календарь</a>
        <a mat-button routerLink="/notes" routerLinkActive="active">Заметки</a>
      </div>

      <span class="spacer"></span>

      <button mat-icon-button [matMenuTriggerFor]="userMenu">
        <mat-icon>account_circle</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu">
        <div class="user-info" mat-menu-item disabled>
          <span>{{ userEmail() }}</span>
        </div>
        <a mat-menu-item routerLink="/profile">
          <mat-icon>person</mat-icon>
          <span>Профиль</span>
        </a>
        <button mat-menu-item (click)="logout()">
          <mat-icon>exit_to_app</mat-icon>
          <span>Выход</span>
        </button>
      </mat-menu>
      }
    </mat-toolbar>
  `,
  styles: [
    `
      .logo {
        font-size: 20px;
        font-weight: bold;
        margin-right: 20px;
      }

      .nav-links {
        display: flex;
        gap: 10px;
      }

      .nav-links a {
        text-decoration: none;
      }

      .nav-links a.active {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .spacer {
        flex: 1 1 auto;
      }

      .user-info {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }
    `,
  ],
})
export class NavbarComponent {
  constructor(private authService: AuthService) {}

  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }

  userEmail = computed(() => this.authService.currentUser()?.email || '');

  logout(): void {
    this.authService.logout();
  }
}
