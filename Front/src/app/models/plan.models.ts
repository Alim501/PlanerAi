import { Subject, Keyword, NoteUser, Note } from './note.models';

export type PlanStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

// Task model - updated to match backend
export interface Task {
  id: number;
  title: string;
  description: string;
  taskStatus: TaskStatus;
  dueDate: string;
  createdAt: string;
  relatedNotes?: Note[]; // Changed from string[] to Note[]
}

// User Plan Progress model
export interface UserPlanProgress {
  id: number;
  progress: number; // 0-100%
}

// Plan model - updated to match backend
export interface Plan {
  id: number;
  title: string;
  subject: Subject; // Now object instead of enum
  startDate: string;
  endDate: string;
  status: PlanStatus;
  tasks?: Task[];
  userPlans?: UserPlanProgress[];
}

// DTO for creating/updating Plan
export interface CreatePlanRequest {
  title: string;
  subjectId: number; // Changed from subject enum to subjectId
  startDate: string;
  endDate: string;
  status?: PlanStatus;
}

export interface UpdatePlanRequest {
  title?: string;
  subjectId?: number; // Changed from subject enum
  startDate?: string;
  endDate?: string;
  status?: PlanStatus;
}

// DTO for creating/updating Task
export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate: string;
  relatedNoteIds?: number[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  taskStatus?: TaskStatus;
  dueDate?: string;
  relatedNoteIds?: number[];
}

export interface SearchPlanParams {
  title?: string;
  subjectId?: number;
}

// UI Constants
export const PLAN_STATUSES: { value: PlanStatus; label: string; color: string }[] = [
  { value: 'ACTIVE', label: 'Активный', color: 'primary' },
  { value: 'COMPLETED', label: 'Завершен', color: 'accent' },
  { value: 'ARCHIVED', label: 'Архивирован', color: 'warn' },
];

export const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Ожидает', color: 'warn' },
  { value: 'IN_PROGRESS', label: 'В процессе', color: 'primary' },
  { value: 'COMPLETED', label: 'Завершена', color: 'accent' },
];
