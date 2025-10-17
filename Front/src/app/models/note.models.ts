export interface StudyPlan {
  id: number;
  title: string;
  subject: Subject;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  tasks: Task[];
}

export interface Task {
  id: number;
  title: string;
  description: string;
  taskStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  createdAt: string;
  relatedNotes: Note[];
}

export interface Note {
  id: number;
  title: string;
  subject: Subject;
  fileUrl: string;
  format: 'TEXT' | 'PDF' | 'IMAGE';
  summary: string;
  keywords: string;
  user: string;
  tasks: string[];
  createdAt: string;
}

export type Subject =
  | 'MATH'
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'BIOLOGY'
  | 'COMPUTER_SCIENCE'
  | 'LITERATURE'
  | 'HISTORY'
  | 'GEOGRAPHY'
  | 'ENGLISH'
  | 'OTHER';
