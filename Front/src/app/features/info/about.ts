import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutComponent {
  features = [
    {
      icon: 'smart_toy',
      title: 'Анализ материалов',
      description:
        'ИИ анализирует загруженные файлы лекций: текст, диаграммы, функции и другие учебные материалы',
    },
    {
      icon: 'psychology',
      title: 'Контекстная память',
      description:
        'Сохранение контекста внутри чата, посвященного одному предмету, теме или лекции',
    },
    {
      icon: 'article',
      title: 'Генерация контента',
      description:
        'Создание выжимок из файлов, выделение ключевых слов и объяснение конспектов',
    },
    {
      icon: 'quiz',
      title: 'Помощь в обучении',
      description:
        'Создание учебных планов и тестов для проверки знаний',
    },
  ];

  technologies = [
    { name: 'Frontend', tech: 'Angular', icon: 'web' },
    { name: 'Backend', tech: 'Java Spring Boot', icon: 'dns' },
    { name: 'AI', tech: 'OpenAI API', icon: 'psychology_alt' },
    { name: 'Database', tech: 'PostgreSQL', icon: 'storage' },
    { name: 'Storage', tech: 'Firebase', icon: 'cloud' },
    { name: 'DevOps', tech: 'GitHub Actions', icon: 'settings' },
  ];
}
