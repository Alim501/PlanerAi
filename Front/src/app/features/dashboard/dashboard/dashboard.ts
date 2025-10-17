import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatChipsModule,
    RouterModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  upcomingExams = [
    {
      subject: 'Высшая математика',
      date: new Date('2024-12-20'),
      daysLeft: 15,
      progress: 65
    },
    {
      subject: 'Физика',
      date: new Date('2024-12-25'),
      daysLeft: 20,
      progress: 40
    },
    {
      subject: 'Программирование',
      date: new Date('2025-01-10'),
      daysLeft: 35,
      progress: 25
    }
  ];

  studyPlans = [
    {
      id: 1,
      title: 'Подготовка к экзамену по математике',
      subject: 'Математика',
      progress: 65,
      totalDays: 21,
      completedDays: 14,
      status: 'active'
    },
    {
      id: 2,
      title: 'Изучение основ физики',
      subject: 'Физика',
      progress: 40,
      totalDays: 28,
      completedDays: 11,
      status: 'active'
    }
  ];

  recentNotes = [
    {
      title: 'Производные и их свойства',
      subject: 'Математика',
      author: 'Иван Петров',
      rating: 4.8,
      views: 156
    },
    {
      title: 'Законы Ньютона',
      subject: 'Физика', 
      author: 'Мария Сидорова',
      rating: 4.6,
      views: 89
    },
    {
      title: 'Алгоритмы сортировки',
      subject: 'Программирование',
      author: 'Алексей Иванов',
      rating: 4.9,
      views: 203
    }
  ];

  getDaysLeftText(days: number): string {
    if (days <= 7) return 'text-red-600';
    if (days <= 14) return 'text-orange-600';
    return 'text-green-600';
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'primary';
    if (progress >= 50) return 'accent';
    return 'warn';
  }
}