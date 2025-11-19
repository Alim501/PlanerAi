import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  GeneratePlanRequest,
  GeneratedPlan,
  AnalyzeNoteRequest,
  NoteAnalysis,
  AIHealth,
} from '../models/ai.models';

@Injectable({
  providedIn: 'root',
})
export class AIService {
  private readonly API_URL = 'http://localhost:8080/api/ai';

  constructor(private http: HttpClient) {}

  /**
   * Generate a study plan using AI
   */
  generatePlan(request: GeneratePlanRequest): Observable<GeneratedPlan> {
    return this.http.post<GeneratedPlan>(
      `${this.API_URL}/plans/generate`,
      request,
      { withCredentials: true }
    );
  }

  /**
   * Analyze a note file using AI
   */
  analyzeNote(request: AnalyzeNoteRequest): Observable<NoteAnalysis> {
    return this.http.post<NoteAnalysis>(
      `${this.API_URL}/notes/analyze`,
      request,
      { withCredentials: true }
    );
  }

  /**
   * Check AI service health
   */
  checkHealth(): Observable<AIHealth> {
    return this.http.get<AIHealth>(`${this.API_URL}/health`, {
      withCredentials: true,
    });
  }
}
