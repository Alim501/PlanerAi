import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import {
  AdminUser,
  RoleName,
  getRoleLabel,
} from '../../../models/admin.models';
import { RoleManagementDialogComponent } from '../role-management-dialog/role-management-dialog';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './admin-users-list.html',
  styleUrl: './admin-users-list.scss',
})
export class AdminUsersListComponent implements OnInit {
  users = signal<AdminUser[]>([]);
  filteredUsers = signal<AdminUser[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchQuery = '';

  displayedColumns: string[] = [
    'id',
    'email',
    'name',
    'roles',
    'createdAt',
    'actions',
  ];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getAllUsers().subscribe({
      next: (users: AdminUser[]) => {
        this.users.set(users);
        this.filteredUsers.set(users);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.error.set('Не удалось загрузить пользователей');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredUsers.set(this.users());
      return;
    }

    const filtered = this.users().filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.id.toString().includes(query)
    );
    this.filteredUsers.set(filtered);
  }

  getUserDisplayName(user: AdminUser): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    return user.email;
  }

  getRoleLabel(roleName: RoleName): string {
    return getRoleLabel(roleName);
  }

  getRoleColor(roleName: RoleName): string {
    switch (roleName) {
      case RoleName.ROLE_ADMIN:
        return 'accent';
      case RoleName.ROLE_MODERATOR:
        return 'primary';
      case RoleName.ROLE_STUDENT:
        return '';
      default:
        return '';
    }
  }

  openRoleManagement(user: AdminUser): void {
    const dialogRef = this.dialog.open(RoleManagementDialogComponent, {
      width: '500px',
      data: { user },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Н/Д';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
