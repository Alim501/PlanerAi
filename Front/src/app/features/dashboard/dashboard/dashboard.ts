import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Plan } from '../../../models/plan.models';
import { PlanService } from '../../../services/plan.service';
import { PlanStore } from '../../../store/plan.store';
import { UserStore } from '../../../store/user.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private planService = inject(PlanService);
  private planStore = inject(PlanStore);
  private userStore = inject(UserStore);

  fullName = this.userStore.fullName;
  plans = this.planStore.plans;
  plansCount = this.planStore.plansCount;
  loading = this.planStore.loading;

  recentPlans = computed(() => this.plans().slice(0, 3));

  ngOnInit(): void {
    const userId = this.userStore.userId();
    if (userId) {
      this.planService.getUserPlans(userId).subscribe();
    }
  }

  getProgressColor(progress: number): 'primary' | 'accent' | 'warn' {
    if (progress >= 75) return 'accent';
    if (progress >= 40) return 'primary';
    return 'warn';
  }

  getPlanProgress(plan: Plan): number {
    const allTasks = (plan.weeks ?? []).flatMap((w) => w.tasks ?? []);
    if (allTasks.length === 0) return 0;
    const done = allTasks.filter((t) => t.taskStatus === 'DONE').length;
    return Math.round((done / allTasks.length) * 100);
  }

  getTotalTasks(plan: Plan): number {
    return (plan.weeks ?? []).reduce((sum, w) => sum + (w.tasks?.length ?? 0), 0);
  }
}
