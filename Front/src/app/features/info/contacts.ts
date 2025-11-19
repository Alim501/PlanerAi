import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class ContactsComponent {
  contactMethods = [
    {
      icon: 'email',
      title: 'Email',
      value: 'support@plannerai.com',
      description: 'Напишите нам на почту',
      color: 'primary',
    },
    {
      icon: 'chat',
      title: 'Telegram',
      value: '@plannerai_support',
      description: 'Чат поддержки в Telegram',
      color: 'accent',
    },
    {
      icon: 'public',
      title: 'GitHub',
      value: 'github.com/plannerai',
      description: 'Открытый исходный код',
      color: 'success',
    },
    {
      icon: 'phone',
      title: 'Телефон',
      value: '+7 (777) 777-77-77',
      description: 'Горячая линия поддержки',
      color: 'warning',
    },
  ];

  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  submitForm() {
    console.log('Form submitted:', this.contactForm);
    // TODO: Implement actual form submission
    alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
    this.resetForm();
  }

  resetForm() {
    this.contactForm = {
      name: '',
      email: '',
      subject: '',
      message: '',
    };
  }
}
