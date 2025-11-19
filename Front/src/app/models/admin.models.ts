// Role names enum
export enum RoleName {
  ROLE_STUDENT = 'ROLE_STUDENT',
  ROLE_MODERATOR = 'ROLE_MODERATOR',
  ROLE_ADMIN = 'ROLE_ADMIN',
}

// Role model
export interface Role {
  id: number;
  name: RoleName;
}

// Admin User model (extended from auth User)
export interface AdminUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
  createdAt?: string;
}

// Request/Response models
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Helper functions
export function hasRole(user: AdminUser | null, role: RoleName): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some((r) => r.name === role);
}

export function isAdmin(user: AdminUser | null): boolean {
  return hasRole(user, RoleName.ROLE_ADMIN);
}

export function isModerator(user: AdminUser | null): boolean {
  return hasRole(user, RoleName.ROLE_MODERATOR);
}

export function isAdminOrModerator(user: AdminUser | null): boolean {
  return isAdmin(user) || isModerator(user);
}

export function getRoleLabel(roleName: RoleName): string {
  switch (roleName) {
    case RoleName.ROLE_ADMIN:
      return 'Администратор';
    case RoleName.ROLE_MODERATOR:
      return 'Модератор';
    case RoleName.ROLE_STUDENT:
      return 'Студент';
    default:
      return roleName;
  }
}
