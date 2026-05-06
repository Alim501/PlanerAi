import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Plan, Week, Task, TaskStatus, TASK_STATUSES } from '../../../models/plan.models';
import { PlanService } from '../../../services/plan.service';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-plan-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './plan-detail.html',
  styleUrl: './plan-detail.scss',
})
export class PlanDetailComponent implements OnInit {
  plan = signal<Plan | null>(null);
  loading = signal(true);
  updatingTaskId = signal<number | null>(null);

  totalTasks = computed(() => {
    const p = this.plan();
    if (!p?.weeks) return 0;
    return p.weeks.reduce((s, w) => s + (w.tasks?.length ?? 0), 0);
  });

  doneTasks = computed(() => {
    const p = this.plan();
    if (!p?.weeks) return 0;
    return p.weeks.reduce(
      (s, w) => s + (w.tasks?.filter(t => t.taskStatus === 'DONE').length ?? 0),
      0
    );
  });

  progress = computed(() => {
    const total = this.totalTasks();
    return total === 0 ? 0 : Math.round((this.doneTasks() / total) * 100);
  });

  taskStatuses = TASK_STATUSES;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanService,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.planService.getPlanById(id).subscribe({
      next: (plan) => {
        this.plan.set(plan);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Ошибка загрузки плана', 'Закрыть', { duration: 3000 });
        this.router.navigate(['/app/plans']);
      },
    });
  }

  setTaskStatus(task: Task, status: TaskStatus): void {
    if (task.taskStatus === status) return;
    this.updatingTaskId.set(task.id);
    this.taskService.updateTaskStatus(task.id, status).subscribe({
      next: (updated) => {
        this.plan.update(p => {
          if (!p) return p;
          return {
            ...p,
            weeks: p.weeks?.map(w => ({
              ...w,
              tasks: w.tasks?.map(t => t.id === updated.id ? { ...t, taskStatus: updated.taskStatus } : t),
            })),
          };
        });
        this.updatingTaskId.set(null);
      },
      error: () => {
        this.snackBar.open('Ошибка обновления задачи', 'Закрыть', { duration: 3000 });
        this.updatingTaskId.set(null);
      },
    });
  }

  getStatusIcon(status: TaskStatus): string {
    switch (status) {
      case 'DONE': return 'check_circle';
      case 'IN_PROGRESS': return 'pending';
      default: return 'radio_button_unchecked';
    }
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case 'DONE': return '#4caf50';
      case 'IN_PROGRESS': return '#667eea';
      default: return '#9e9e9e';
    }
  }

  getStatusLabel(status: TaskStatus): string {
    return TASK_STATUSES.find(s => s.value === status)?.label ?? status;
  }

  nextStatus(current: TaskStatus): TaskStatus {
    const cycle: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'DONE'];
    const idx = cycle.indexOf(current);
    return cycle[(idx + 1) % cycle.length];
  }

  nextStatusLabel(current: TaskStatus): string {
    return this.getStatusLabel(this.nextStatus(current));
  }

  getWeekDoneCount(week: Week): number {
    return week.tasks?.filter(t => t.taskStatus === 'DONE').length ?? 0;
  }

  editPlan(): void {
    this.router.navigate(['/app/plans/edit', this.plan()?.id]);
  }

  back(): void {
    this.router.navigate(['/app/plans']);
  }
}
