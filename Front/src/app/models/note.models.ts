// Subject model
export interface Subject {
  id: number;
  name: string;
}

// Keyword model
export interface Keyword {
  id: number;
  word: string;
}

// User model (simplified for Note)
export interface NoteUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

// Note Rating model
export interface NoteRating {
  id: number;
  rating: number; // 1-5 stars
  createdAt: string;
}

// Note Format enum
export type NoteFormat = 'TEXT' | 'PDF' | 'IMAGE' | 'DOCX';

// Main Note model
export interface Note {
  id: number;
  title: string;
  subject: Subject;
  fileUrl: string;
  format: NoteFormat;
  summary?: string;
  keywords: Keyword[];
  viewCount: number;
  ratings?: NoteRating[];
  averageRating?: number;
  ratingCount: number;
  user: NoteUser;
  createdAt: string;
}

// DTO for creating/updating Note
export interface CreateNoteRequest {
  title: string;
  subjectId: number;
  format: NoteFormat;
  summary?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  subjectId?: number;
  summary?: string;
}

// DTO for rating a note
export interface RateNoteRequest {
  rating: number; // 1-5
}

// Task model (TODO: move to separate file)
export interface Task {
  id: number;
  title: string;
  description: string;
  taskStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  createdAt: string;
  relatedNotes: Note[];
}

// StudyPlan model (TODO: move to plan.models.ts)
export interface StudyPlan {
  id: number;
  title: string;
  subject: Subject;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  tasks: Task[];
}
