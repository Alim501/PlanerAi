import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  GeneratePlanRequest,
  AnalyzeNoteRequest,
  NoteAnalysis,
  AIHealth,
} from '../models/ai.models';
import { Plan } from '../models/plan.models';

@Injectable({
  providedIn: 'root',
})
export class AIService {
  private readonly API_URL = 'http://localhost:8080/api/ai';

  constructor(private http: HttpClient) {}

  // Возвращает Plan (сущность), а не GeneratedPlan — бэк сохраняет в БД и отдаёт Plan
  generatePlan(request: GeneratePlanRequest): Observable<Plan> {
    return this.http.post<Plan>(
      `${this.API_URL}/plans/generate`,
      request,
      { withCredentials: true }
    );
  }

  analyzeNote(request: AnalyzeNoteRequest): Observable<NoteAnalysis> {
    return this.http.post<NoteAnalysis>(
      `${this.API_URL}/notes/analyze`,
      request,
      { withCredentials: true }
    );
  }

  checkHealth(): Observable<AIHealth> {
    return this.http.get<AIHealth>(`${this.API_URL}/health`, {
      withCredentials: true,
    });
  }
}
