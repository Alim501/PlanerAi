import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskStatus } from '../models/plan.models';
import { API_BASE_URL } from '../core/api.config';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly API_URL = `${API_BASE_URL}/api/tasks`;

  constructor(private http: HttpClient) {}

  getTasksByPlan(planId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/plan/${planId}`, { withCredentials: true });
  }

  getTasksByWeek(weekId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/week/${weekId}`, { withCredentials: true });
  }

  updateTaskStatus(taskId: number, status: TaskStatus): Observable<Task> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<Task>(`${this.API_URL}/${taskId}/status`, null, {
      params,
      withCredentials: true,
    });
  }
}
