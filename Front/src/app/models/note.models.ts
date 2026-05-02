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
export type NoteFormat = 'TXT' | 'PDF' | 'PNG' | 'JPG' | 'DOCX';

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

