export type Subject = 'MATH' | 'ARCHITECTURE' | 'OPERATING_SYSTEMS' | 'DEV_OPS' | 'JAVA';

export type PlanStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: number;
  title: string;
  description: string;
  taskStatus: TaskStatus;
  dueDate: string;
  createdAt: string;
  relatedNotes: string[];
}

export interface Plan {
  id: number;
  title: string;
  subject: Subject;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  tasks: Task[];
}

export interface CreatePlanRequest {
  title: string;
  subject: Subject;
  startDate: string;
  endDate: string;
  status?: PlanStatus;
}

export interface UpdatePlanRequest {
  title?: string;
  subject?: Subject;
  startDate?: string;
  endDate?: string;
  status?: PlanStatus;
  tasks?: Task[];
}

export interface SearchPlanParams {
  title?: string;
  subject?: Subject;
}

// Для UI
export const SUBJECTS: { value: Subject; label: string }[] = [
  { value: 'MATH', label: 'Математика' },
  { value: 'ARCHITECTURE', label: 'Архитектура' },
  { value: 'OPERATING_SYSTEMS', label: 'Операционные системы' },
  { value: 'DEV_OPS', label: 'DevOps' },
  { value: 'JAVA', label: 'Java' },
];

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
