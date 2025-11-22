import { StudyPlan } from './note.models';

export interface Role {
  id: number;
  name: 'ROLE_ADMIN' | 'ROLE_MODERATOR' | 'ROLE_STUDENT';
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];  // Changed from single role to array
  userPlans?: UserPlan[];
  createdAt?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UserPlan {
  id: number;
  user: string;
  studyPlan: StudyPlan;
  progress: number;
}
