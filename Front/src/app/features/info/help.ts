import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    RouterModule,
  ],
  templateUrl: './help.html',
  styleUrl: './help.scss',
})
export class HelpComponent {
  guides = [
    {
      icon: 'person_add',
      title: 'Начало работы',
      description: 'Регистрация и первые шаги в системе',
      steps: [
        'Зарегистрируйтесь, указав email и пароль',
        'Подтвердите email (если требуется)',
        'Войдите в систему и заполните профиль',
        'Ознакомьтесь с интерфейсом панели управления',
      ],
    },
    {
      icon: 'calendar_month',
      title: 'Создание плана',
      description: 'Как создать план подготовки к экзамену',
      steps: [
        'Перейдите в раздел "Планы"',
        'Нажмите кнопку "Создать план"',
        'Заполните название, предмет и даты',
        'Добавьте задачи или позвольте ИИ сгенерировать их',
        'Сохраните план и начните работу',
      ],
    },
    {
      icon: 'upload_file',
      title: 'Загрузка заметок',
      description: 'Работа с учебными материалами',
      steps: [
        'Откройте раздел "Заметки"',
        'Нажмите "Загрузить файл"',
        'Выберите файл (PDF, текст, изображение)',
        'Добавьте теги и описание',
        'ИИ автоматически проанализирует материал',
      ],
    },
    {
      icon: 'chat',
      title: 'Использование ИИ-помощника',
      description: 'Как работать с чат-ботом',
      steps: [
        'Выберите заметку или тему',
        'Откройте чат с ИИ-помощником',
        'Задавайте вопросы по материалу',
        'Просите сгенерировать тесты или выжимки',
        'Сохраняйте важные ответы',
      ],
    },
  ];

  quickActions = [
    {
      icon: 'help_outline',
      title: 'FAQ',
      description: 'Часто задаваемые вопросы',
      link: '/faq',
    },
    {
      icon: 'contact_support',
      title: 'Связаться с нами',
      description: 'Техническая поддержка',
      link: '/contacts',
    },
    {
      icon: 'info',
      title: 'О проекте',
      description: 'Узнайте больше о PlannerAI',
      link: '/about',
    },
  ];
}
