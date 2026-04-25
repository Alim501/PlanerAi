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
import { Plan } from '../../../models/plan.models';
import { Subject } from '../../../models/note.models';
import { PlanService } from '../../../services/plan.service';
import { SubjectService } from '../../../services/subject.service';
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
  ],
  templateUrl: './plans-list.html',
  styleUrl: './plans-list.scss',
})
export class PlansListComponent implements OnInit {
  private planService = inject(PlanService);
  private planStore = inject(PlanStore);
  private userStore = inject(UserStore);
  private subjectService = inject(SubjectService);

  // Data from stores
  plans = this.planStore.filteredPlans;
  loading = this.planStore.loading;
  plansCount = this.planStore.plansCount;
  userId = this.userStore.userId;

  // Filters
  subjects = signal<Subject[]>([]);
  searchQuery = signal('');
  selectedSubject = signal<number | null>(null);
  selectedStatus = signal<string | null>(null);

  constructor(private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadSubjects();
    this.loadPlans();
  }

  loadSubjects(): void {
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects: Subject[]) => {
        this.subjects.set(subjects);
      },
      error: (err: any) => {
        console.error('Error loading subjects:', err);
      },
    });
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

  onSubjectChange(subjectId: number | null): void {
    this.planStore.setFilterSubject(subjectId as any);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedSubject.set(null);
    this.selectedStatus.set(null);
    this.planStore.clearFilters();
  }

  createPlan(): void {
    this.router.navigate(['/app/plans/create']);
  }

  viewPlan(plan: Plan): void {
    this.router.navigate(['/app/plans', plan.id]);
  }

  editPlan(plan: Plan, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/app/plans/edit', plan.id]);
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

  getTotalTasks(plan: Plan): number {
    return (plan.weeks ?? []).reduce((sum, w) => sum + (w.tasks?.length ?? 0), 0);
  }

  getProgressPercentage(plan: Plan): number {
    const allTasks = (plan.weeks ?? []).flatMap((w) => w.tasks ?? []);
    if (allTasks.length === 0) return 0;
    const done = allTasks.filter((t) => t.taskStatus === 'DONE').length;
    return Math.round((done / allTasks.length) * 100);
  }
}
