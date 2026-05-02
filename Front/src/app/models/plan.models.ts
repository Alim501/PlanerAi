import { Subject, Note } from './note.models';

export type PlanStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  title: string;
  description: string;
  taskStatus: TaskStatus;
  createdAt: string;
  relatedNotes?: Note[];
  externalResources?: string[];
}

export interface Week {
  id: number;
  weekNumber: number;
  title: string;
  estimatedHours: number;
  tasks: Task[];
}

export interface UserPlanProgress {
  id: number;
  progress: number;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  studyPlan?: Plan;
}

export interface Plan {
  id: number;
  title: string;
  description?: string;
  difficulty?: string;
  subject: Subject;
  weeks?: Week[];
}

export interface CreatePlanRequest {
  title: string;
  subjectId: number;
  description?: string;
  difficulty?: string;
  startDate: string;
  endDate: string;
  weeks?: CreateWeekRequest[];
}

export interface UpdatePlanRequest {
  title?: string;
  subjectId?: number;
  description?: string;
  difficulty?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateWeekRequest {
  weekNumber: number;
  title: string;
  estimatedHours: number;
  tasks: CreateTaskRequest[];
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  relatedNoteIds?: number[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  taskStatus?: TaskStatus;
  relatedNoteIds?: number[];
}

export interface SearchPlanParams {
  title?: string;
  subjectId?: number;
}

export const PLAN_STATUSES: { value: PlanStatus; label: string; color: string }[] = [
  { value: 'ACTIVE', label: 'Активный', color: 'primary' },
  { value: 'COMPLETED', label: 'Завершен', color: 'accent' },
  { value: 'CANCELLED', label: 'Отменён', color: 'warn' },
];

export const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Ожидает', color: 'warn' },
  { value: 'IN_PROGRESS', label: 'В процессе', color: 'primary' },
  { value: 'DONE', label: 'Завершена', color: 'accent' },
];
