import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
  // Data from stores
  fullName = this.userStore.fullName;
  plans = this.planStore.plans;
  activePlans = this.planStore.activePlans;
  plansCount = this.planStore.plansCount;
  loading = this.planStore.loading;

  // Computed values
  recentPlans = computed(() => this.plans().slice(0, 3));

  upcomingExams = computed(() => {
    return this.activePlans()
      .map((plan) => {
        const endDate = new Date(plan.endDate);
        const today = new Date();
        const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const progress = this.calculateProgress(plan.startDate, plan.endDate);

        return {
          id: plan.id,
          title: plan.title,
          subject: plan.subject,
          date: endDate,
          daysLeft: daysLeft > 0 ? daysLeft : 0,
          progress,
        };
      })
      .filter((exam) => exam.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4);
  });

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    const userId = this.userStore.userId();
    if (userId) {
      this.planService.getUserPlans(userId).subscribe();
    }
  }

  calculateProgress(startDate: string, endDate: string): number {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  }

  getDaysLeftClass(days: number): string {
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'warning';
    return 'normal';
  }

  getProgressColor(progress: number): 'primary' | 'accent' | 'warn' {
    if (progress >= 75) return 'accent';
    if (progress >= 40) return 'primary';
    return 'warn';
  }

  getPlanProgress(plan: any): number {
    if (!plan.tasks || plan.tasks.length === 0) return 0;
    const completed = plan.tasks.filter((t: any) => t.taskStatus === 'COMPLETED').length;
    return Math.round((completed / plan.tasks.length) * 100);
  }
}
