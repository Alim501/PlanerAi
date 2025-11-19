/**
 * AI-related models for plan generation and note analysis
 */

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Request models
export interface GeneratePlanRequest {
  subject: string;
  durationWeeks: number;
  level?: DifficultyLevel;
  topics?: string[];
  goals?: string;
}

export interface AnalyzeNoteRequest {
  filePath: string;
  fileType: string;
  subjectId?: number;
}

// Response models
export interface WeekPlan {
  weekNumber: number;
  title: string;
  topics: string[];
  tasks: string[];
  estimatedHours: number;
  resources?: string[];
}

export interface GeneratedPlan {
  title: string;
  subject: string;
  durationWeeks: number;
  difficulty: string;
  description: string;
  learningOutcomes: string[];
  weeks: WeekPlan[];
  prerequisites?: string[];
  recommendedResources?: string[];
}

export interface NoteAnalysis {
  summary: string;
  keyConcepts: string[];
  topics: string[];
  difficulty: string;
  suggestedTags: string[];
  wordCount?: number;
  language?: string;
}

export interface AIHealth {
  status: string;
  ollamaConnected: boolean;
  model: string;
  version: string;
}
