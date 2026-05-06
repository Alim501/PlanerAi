import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import {
  Plan,
  CreatePlanRequest,
  UpdatePlanRequest,
  SearchPlanParams,
} from '../models/plan.models';
import { PlanStore } from '../store/plan.store';
import { API_BASE_URL } from '../core/api.config';

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private readonly API_URL = `${API_BASE_URL}/api/plans`;

  constructor(private http: HttpClient, private planStore: PlanStore) {}

  /**
   * Получить все планы текущего пользователя
   */
  getUserPlans(userId: number): Observable<Plan[]> {
    this.planStore.setLoading(true);

    return this.http
      .get<Plan[]>(`${this.API_URL}/user/${userId}`, {
        withCredentials: true,
      })
      .pipe(
        tap((plans: Plan[]) => {
          this.planStore.setPlans(plans);
          this.planStore.setLoading(false);
        }),
        catchError((error: any) => {
          this.planStore.setError('Ошибка загрузки планов');
          this.planStore.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Получить план по ID
   */
  getPlanById(id: number): Observable<Plan> {
    this.planStore.setLoading(true);

    return this.http
      .get<Plan>(`${this.API_URL}/${id}`, {
        withCredentials: true,
      })
      .pipe(
        tap((plan: Plan) => {
          this.planStore.selectPlan(plan);
          this.planStore.setLoading(false);
        }),
        catchError((error: any) => {
          this.planStore.setError('Ошибка загрузки плана');
          this.planStore.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Создать новый план
   */
  createPlan(request: CreatePlanRequest): Observable<Plan> {
    this.planStore.setLoading(true);

    return this.http
      .post<Plan>(this.API_URL, request, {
        withCredentials: true,
      })
      .pipe(
        tap((plan: Plan) => {
          this.planStore.addPlan(plan);
          this.planStore.setLoading(false);
        }),
        catchError((error: any) => {
          this.planStore.setError('Ошибка создания плана');
          this.planStore.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Обновить план
   */
  updatePlan(id: number, request: UpdatePlanRequest): Observable<Plan> {
    this.planStore.setLoading(true);

    return this.http
      .put<Plan>(`${this.API_URL}/${id}`, request, {
        withCredentials: true,
      })
      .pipe(
        tap((plan: Plan) => {
          this.planStore.updatePlan(id, plan);
          this.planStore.setLoading(false);
        }),
        catchError((error: any) => {
          this.planStore.setError('Ошибка обновления плана');
          this.planStore.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Удалить план
   */
  deletePlan(id: number): Observable<void> {
    this.planStore.setLoading(true);

    return this.http
      .delete<void>(`${this.API_URL}/${id}`, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          this.planStore.deletePlan(id);
          this.planStore.setLoading(false);
        }),
        catchError((error: any) => {
          this.planStore.setError('Ошибка удаления плана');
          this.planStore.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Поиск планов по названию и/или предмету
   */
  searchPlans(params: SearchPlanParams): Observable<Plan[]> {
    this.planStore.setLoading(true);

    let httpParams = new HttpParams();
    if (params.title) {
      httpParams = httpParams.set('title', params.title);
    }
    if (params.subjectId) {
      httpParams = httpParams.set('subjectId', params.subjectId.toString());
    }

    return this.http
      .get<Plan[]>(`${this.API_URL}/search`, {
        params: httpParams,
        withCredentials: true,
      })
      .pipe(
        tap((plans: Plan[]) => {
          this.planStore.setPlans(plans);
          this.planStore.setLoading(false);
        }),
        catchError((error: any) => {
          this.planStore.setError('Ошибка поиска планов');
          this.planStore.setLoading(false);
          return throwError(() => error);
        })
      );
  }
}
