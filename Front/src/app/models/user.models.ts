import { StudyPlan } from './note.models';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'MODERATOR' | `STUDENT`;
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
