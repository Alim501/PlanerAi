import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  features = [
    {
      icon: 'smart_toy',
      title: 'ИИ-анализ материалов',
      description: 'Загружайте лекции и конспекты, а ИИ автоматически выделит ключевые моменты',
    },
    {
      icon: 'calendar_month',
      title: 'Умное планирование',
      description: 'Автоматическое создание плана подготовки к экзаменам на основе ваших целей',
    },
    {
      icon: 'psychology',
      title: 'Персональный помощник',
      description: 'Чат-бот на базе ИИ ответит на вопросы и поможет разобраться в материале',
    },
    {
      icon: 'analytics',
      title: 'Аналитика прогресса',
      description: 'Отслеживайте свой прогресс с помощью наглядных графиков и статистики',
    },
  ];

  benefits = [
    {
      icon: 'speed',
      title: 'Экономия времени',
      description: 'ИИ помогает быстро находить нужную информацию в материалах',
    },
    {
      icon: 'task_alt',
      title: 'Эффективность',
      description: 'Оптимальное распределение нагрузки на основе ваших возможностей',
    },
    {
      icon: 'security',
      title: 'Безопасность',
      description: 'Все ваши данные защищены и доступны только вам',
    },
    {
      icon: 'devices',
      title: 'Везде с вами',
      description: 'Работает на всех устройствах: компьютер, планшет, смартфон',
    },
  ];

  stats = [
    { value: '1000+', label: 'Студентов' },
    { value: '5000+', label: 'Планов создано' },
    { value: '10000+', label: 'Файлов проанализировано' },
    { value: '98%', label: 'Довольных пользователей' },
  ];
}
