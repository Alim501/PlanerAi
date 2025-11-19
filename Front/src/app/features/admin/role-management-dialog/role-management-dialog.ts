import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';
import {
  AdminUser,
  RoleName,
  getRoleLabel,
} from '../../../models/admin.models';

@Component({
  selector: 'app-role-management-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './role-management-dialog.html',
  styleUrl: './role-management-dialog.scss',
})
export class RoleManagementDialogComponent {
  user: AdminUser;
  loading = signal(false);
  availableRoles: RoleName[] = [
    RoleName.ROLE_STUDENT,
    RoleName.ROLE_MODERATOR,
    RoleName.ROLE_ADMIN,
  ];

  constructor(
    private dialogRef: MatDialogRef<RoleManagementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: AdminUser },
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    this.user = data.user;
  }

  hasRole(roleName: RoleName): boolean {
    return this.user.roles.some((role) => role.name === roleName);
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

  toggleRole(roleName: RoleName): void {
    if (this.loading()) return;

    const hasRole = this.hasRole(roleName);
    this.loading.set(true);

    const operation = hasRole
      ? this.adminService.removeRoleFromUser(this.user.id, roleName)
      : this.adminService.addRoleToUser(this.user.id, roleName);

    operation.subscribe({
      next: (updatedUser: AdminUser) => {
        this.user = updatedUser;
        this.loading.set(false);
        this.snackBar.open(
          hasRole ? 'Роль удалена' : 'Роль добавлена',
          'OK',
          { duration: 3000 }
        );
      },
      error: (err: any) => {
        console.error('Error updating role:', err);
        this.loading.set(false);
        this.snackBar.open('Ошибка при обновлении роли', 'OK', {
          duration: 3000,
        });
      },
    });
  }

  close(): void {
    this.dialogRef.close(true);
  }
}
