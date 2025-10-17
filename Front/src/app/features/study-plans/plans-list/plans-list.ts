import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';
import { MatDivider } from '@angular/material/divider';

interface StudyPlan {
  id: number;
  title: string;
  subject: string;
  description: string;
  progress: number;
  totalDays: number;
  completedDays: number;
  status: 'active' | 'completed' | 'paused';
  createdDate: Date;
  targetExamDate: Date;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  estimatedHoursPerDay: number;
}

@Component({
  selector: 'app-plans-list',
  imports: [
    CommonModule,
    FormsModule,
    MatDivider,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatMenuModule,
    MatBadgeModule,
    RouterModule,
  ],
  templateUrl: './plans-list.html',
  styleUrl: './plans-list.scss',
})
export class PlansListComponent {
  searchQuery = '';
  selectedSubject = '';
  selectedStatus = '';
  sortBy = 'created';

  subjects = ['Математика', 'Физика', 'Программирование', 'Химия', 'История', 'Английский язык'];
  statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'active', label: 'Активные' },
    { value: 'paused', label: 'Приостановленные' },
    { value: 'completed', label: 'Завершенные' },
  ];

  sortOptions = [
    { value: 'created', label: 'По дате создания' },
    { value: 'progress', label: 'По прогрессу' },
    { value: 'exam', label: 'По дате экзамена' },
    { value: 'title', label: 'По названию' },
  ];

  studyPlans: StudyPlan[] = [
    {
      id: 1,
      title: 'Подготовка к экзамену по высшей математике',
      subject: 'Математика',
      description:
        'Комплексная подготовка к экзамену: производные, интегралы, дифференциальные уравнения',
      progress: 65,
      totalDays: 21,
      completedDays: 14,
      status: 'active',
      createdDate: new Date('2024-11-15'),
      targetExamDate: new Date('2024-12-20'),
      difficulty: 'hard',
      topics: ['Производные', 'Интегралы', 'Дифференциальные уравнения', 'Пределы'],
      estimatedHoursPerDay: 3,
    },
    {
      id: 2,
      title: 'Основы физики - механика',
      subject: 'Физика',
      description: 'Изучение основных законов механики, динамики и статики',
      progress: 40,
      totalDays: 28,
      completedDays: 11,
      status: 'active',
      createdDate: new Date('2024-11-10'),
      targetExamDate: new Date('2024-12-25'),
      difficulty: 'medium',
      topics: ['Законы Ньютона', 'Кинематика', 'Динамика', 'Энергия'],
      estimatedHoursPerDay: 2,
    },
    {
      id: 3,
      title: 'Алгоритмы и структуры данных',
      subject: 'Программирование',
      description: 'Изучение основных алгоритмов сортировки, поиска и структур данных',
      progress: 85,
      totalDays: 35,
      completedDays: 30,
      status: 'active',
      createdDate: new Date('2024-10-20'),
      targetExamDate: new Date('2025-01-10'),
      difficulty: 'hard',
      topics: ['Сортировка', 'Поиск', 'Деревья', 'Графы', 'Хеш-таблицы'],
      estimatedHoursPerDay: 4,
    },
    {
      id: 4,
      title: 'История России XIX века',
      subject: 'История',
      description: 'Изучение основных событий и процессов в России в XIX веке',
      progress: 100,
      totalDays: 14,
      completedDays: 14,
      status: 'completed',
      createdDate: new Date('2024-10-01'),
      targetExamDate: new Date('2024-11-15'),
      difficulty: 'easy',
      topics: ['Александр I', 'Отечественная война', 'Декабристы', 'Реформы Александра II'],
      estimatedHoursPerDay: 2,
    },
    {
      id: 5,
      title: 'Органическая химия',
      subject: 'Химия',
      description: 'Изучение органических соединений и реакций',
      progress: 25,
      totalDays: 42,
      completedDays: 10,
      status: 'paused',
      createdDate: new Date('2024-10-15'),
      targetExamDate: new Date('2025-01-20'),
      difficulty: 'medium',
      topics: ['Углеводороды', 'Спирты', 'Кислоты', 'Эфиры'],
      estimatedHoursPerDay: 2.5,
    },
  ];

  get filteredPlans(): StudyPlan[] {
    let filtered = this.studyPlans;

    if (this.searchQuery) {
      filtered = filtered.filter(
        (plan) =>
          plan.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          plan.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          plan.topics.some((topic) => topic.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    }

    if (this.selectedSubject) {
      filtered = filtered.filter((plan) => plan.subject === this.selectedSubject);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter((plan) => plan.status === this.selectedStatus);
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'progress':
          return b.progress - a.progress;
        case 'exam':
          return a.targetExamDate.getTime() - b.targetExamDate.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default: // created
          return b.createdDate.getTime() - a.createdDate.getTime();
      }
    });

    return filtered;
  }

  get activeCount(): number {
    return this.studyPlans.filter((plan) => plan.status === 'active').length;
  }

  get completedCount(): number {
    return this.studyPlans.filter((plan) => plan.status === 'completed').length;
  }

  get pausedCount(): number {
    return this.studyPlans.filter((plan) => plan.status === 'paused').length;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active':
        return 'play_circle';
      case 'completed':
        return 'check_circle';
      case 'paused':
        return 'pause_circle';
      default:
        return 'help';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'primary';
      case 'paused':
        return 'warn';
      default:
        return '';
    }
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return 'primary';
      case 'medium':
        return 'accent';
      case 'hard':
        return 'warn';
      default:
        return '';
    }
  }

  getDifficultyText(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return 'Легкий';
      case 'medium':
        return 'Средний';
      case 'hard':
        return 'Сложный';
      default:
        return '';
    }
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'primary';
    if (progress >= 50) return 'accent';
    return 'warn';
  }

  getDaysLeftText(plan: StudyPlan): string {
    const today = new Date();
    const daysLeft = Math.ceil(
      (plan.targetExamDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) return `Просрочен на ${Math.abs(daysLeft)} дней`;
    if (daysLeft === 0) return 'Экзамен сегодня!';
    return `${daysLeft} дней до экзамена`;
  }

  getDaysLeftColor(plan: StudyPlan): string {
    const today = new Date();
    const daysLeft = Math.ceil(
      (plan.targetExamDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) return 'text-red-600';
    if (daysLeft <= 7) return 'text-red-600';
    if (daysLeft <= 14) return 'text-orange-600';
    return 'text-green-600';
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedSubject = '';
    this.selectedStatus = '';
    this.sortBy = 'created';
  }

  pausePlan(planId: number): void {
    const plan = this.studyPlans.find((p) => p.id === planId);
    if (plan) {
      plan.status = plan.status === 'paused' ? 'active' : 'paused';
    }
  }

  deletePlan(planId: number): void {
    const index = this.studyPlans.findIndex((p) => p.id === planId);
    if (index !== -1) {
      this.studyPlans.splice(index, 1);
    }
  }
}
