import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Plan, PLAN_STATUSES, SUBJECTS } from '../../../models/plan.models';
import { PlanService } from '../../../services/plan.service';
import { PlanStore } from '../../../store/plan.store';
import { UserStore } from '../../../store/user.store';

@Component({
  selector: 'app-plans-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './plans-list.html',
  styleUrl: './plans-list.scss',
})
export class PlansListComponent implements OnInit {
  private planService = inject(PlanService);
  private planStore = inject(PlanStore);
  private userStore = inject(UserStore);
  // Data from stores
  plans = this.planStore.filteredPlans;
  loading = this.planStore.loading;
  plansCount = this.planStore.plansCount;
  userId = this.userStore.userId;

  // Filters
  subjects = SUBJECTS;
  statuses = PLAN_STATUSES;
  searchQuery = signal('');
  selectedSubject = signal<string | null>(null);
  selectedStatus = signal<string | null>(null);

  constructor(private router: Router, private snackBar: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    const userId = this.userId();
    if (userId) {
      this.planService.getUserPlans(userId).subscribe({
        error: (error: any) => {
          console.error('Error loading plans:', error);
          this.snackBar.open('Ошибка загрузки планов', 'Закрыть', { duration: 3000 });
        },
      });
    }
  }

  onSearchChange(query: string): void {
    this.planStore.setSearchQuery(query);
  }

  onSubjectChange(subject: string | null): void {
    this.planStore.setFilterSubject(subject as any);
  }

  onStatusChange(status: string | null): void {
    this.planStore.setFilterStatus(status as any);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedSubject.set(null);
    this.selectedStatus.set(null);
    this.planStore.clearFilters();
  }

  createPlan(): void {
    this.router.navigate(['/plans/create']);
  }

  viewPlan(plan: Plan): void {
    this.router.navigate(['/plans', plan.id]);
  }

  editPlan(plan: Plan, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/plans', plan.id, 'edit']);
  }

  deletePlan(plan: Plan, event: Event): void {
    event.stopPropagation();

    if (confirm(`Вы уверены, что хотите удалить план "${plan.title}"?`)) {
      this.planService.deletePlan(plan.id).subscribe({
        next: () => {
          this.snackBar.open('План успешно удален', 'OK', { duration: 3000 });
        },
        error: (error: any) => {
          console.error('Error deleting plan:', error);
          this.snackBar.open('Ошибка удаления плана', 'Закрыть', { duration: 3000 });
        },
      });
    }
  }

  getSubjectLabel(subject: string): string {
    return SUBJECTS.find((s) => s.value === subject)?.label || subject;
  }

  getStatusLabel(status: string): string {
    return PLAN_STATUSES.find((s) => s.value === status)?.label || status;
  }

  getStatusColor(status: string): string {
    return PLAN_STATUSES.find((s) => s.value === status)?.color || 'primary';
  }

  getProgressPercentage(plan: Plan): number {
    if (!plan.tasks || plan.tasks.length === 0) return 0;
    const completed = plan.tasks.filter((t) => t.taskStatus === 'COMPLETED').length;
    return Math.round((completed / plan.tasks.length) * 100);
  }
}
