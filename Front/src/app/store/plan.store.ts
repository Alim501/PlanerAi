import { Injectable, signal, computed } from '@angular/core';
import { Plan, PlanStatus } from '../models/plan.models';
import { Subject } from '../models/note.models';

/**
 * Store для управления состоянием планов
 */
@Injectable({
  providedIn: 'root',
})
export class PlanStore {
  // Private state
  private _plans = signal<Plan[]>([]);
  private _selectedPlan = signal<Plan | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _searchQuery = signal<string>('');
  private _filterSubject = signal<Subject | null>(null);
  private _filterStatus = signal<PlanStatus | null>(null);

  // Public readonly state
  plans = this._plans.asReadonly();
  selectedPlan = this._selectedPlan.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // Computed state
  filteredPlans = computed(() => {
    let plans = this._plans();
    const query = this._searchQuery().toLowerCase();
    const subject = this._filterSubject();
    const status = this._filterStatus();

    // Поиск по названию
    if (query) {
      plans = plans.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (typeof p.subject === 'string'
            ? (p.subject as string).toLowerCase().includes(query)
            : p.subject?.name?.toLowerCase?.().includes(query) ?? false)
      );
    }

    // Фильтр по предмету
    if (subject) {
      plans = plans.filter((p) => p.subject === subject);
    }

    // Фильтр по статусу
    if (status) {
      plans = plans.filter((p) => p.status === status);
    }

    return plans;
  });

  activePlans = computed(() => this._plans().filter((p) => p.status === 'ACTIVE'));

  completedPlans = computed(() => this._plans().filter((p) => p.status === 'COMPLETED'));

  plansCount = computed(() => ({
    total: this._plans().length,
    active: this.activePlans().length,
    completed: this.completedPlans().length,
    archived: this._plans().filter((p) => p.status === 'ARCHIVED').length,
  }));

  // Actions
  setPlans(plans: Plan[]): void {
    this._plans.set(plans);
    this._error.set(null);
  }

  addPlan(plan: Plan): void {
    this._plans.update((plans) => [...plans, plan]);
  }

  updatePlan(id: number, updates: Partial<Plan>): void {
    this._plans.update((plans) => plans.map((p) => (p.id === id ? { ...p, ...updates } : p)));

    // Обновляем выбранный план, если он обновляется
    const selected = this._selectedPlan();
    if (selected?.id === id) {
      this._selectedPlan.set({ ...selected, ...updates });
    }
  }

  deletePlan(id: number): void {
    this._plans.update((plans) => plans.filter((p) => p.id !== id));

    // Очищаем выбранный план, если он удаляется
    if (this._selectedPlan()?.id === id) {
      this._selectedPlan.set(null);
    }
  }

  selectPlan(plan: Plan | null): void {
    this._selectedPlan.set(plan);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  setFilterSubject(subject: Subject | null): void {
    this._filterSubject.set(subject);
  }

  setFilterStatus(status: PlanStatus | null): void {
    this._filterStatus.set(status);
  }

  clearFilters(): void {
    this._searchQuery.set('');
    this._filterSubject.set(null);
    this._filterStatus.set(null);
  }

  clearPlans(): void {
    this._plans.set([]);
    this._selectedPlan.set(null);
    this._error.set(null);
  }

  // Helpers
  getPlanById(id: number): Plan | undefined {
    return this._plans().find((p) => p.id === id);
  }
}
