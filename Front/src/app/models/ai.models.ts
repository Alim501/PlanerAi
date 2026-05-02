import { Plan } from './plan.models';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Request models
export interface GeneratePlanRequest {
  subject: string;
  durationWeeks: number;
  level?: DifficultyLevel;
  topics?: string[];
  goals?: string;
  subjectId?: number;
}

export interface AnalyzeNoteRequest {
  noteId: number;
}

// Response models — соответствуют WeekPlanDTO и TaskPlanDTO на бэке
export interface TaskPlan {
  title: string;
  description: string;
  // приходят как internal_note_ids / external_resources (snake_case от @JsonProperty)
  internal_note_ids?: number[];
  external_resources?: string[];
}

export interface WeekPlan {
  // приходят как week_number / estimated_hours (snake_case от @JsonProperty)
  week_number: number;
  title: string;
  tasks: TaskPlan[];
  estimated_hours: number;
  resources?: string[];
}

// GeneratedPlanDTO — поля со snake_case через @JsonProperty
export interface GeneratedPlan {
  title: string;
  subject: string;
  duration_weeks: number;
  difficulty: string;
  description: string;
  learning_outcomes: string[];
  weeks: WeekPlan[];
  prerequisites?: string[];
  recommended_resources?: string[];
}

// Бэк на /api/ai/plans/generate возвращает Plan (сущность), не GeneratedPlan
export type GeneratePlanResponse = Plan;

// NoteAnalysisDTO — key_concepts и word_count через @JsonProperty
export interface NoteAnalysis {
  summary: string;
  key_concepts: string[];
  difficulty: string;
  word_count?: number;
  language?: string;
}

// AIHealthDTO — ollama_connected через @JsonProperty
export interface AIHealth {
  status: string;
  ollama_connected: boolean;
  model: string;
  version: string;
}
