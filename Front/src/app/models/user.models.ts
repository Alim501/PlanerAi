import { Plan, UserPlanProgress } from './plan.models';

export interface Role {
  id: number;
  name: 'ROLE_ADMIN' | 'ROLE_MODERATOR' | 'ROLE_STUDENT';
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
  userPlans?: UserPlanProgress[];
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
