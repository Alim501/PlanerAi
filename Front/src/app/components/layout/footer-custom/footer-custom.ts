import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './footer-custom.html',
  styleUrl: './footer-custom.scss',
})
export class FooterCustom {
  currentYear = new Date().getFullYear();
  
  socialLinks = [
    { icon: 'link', name: 'GitHub', url: 'https://github.com' },
    { icon: 'link', name: 'LinkedIn', url: 'https://linkedin.com' },
  ];
  
  quickLinks = [
    { label: 'О нас', route: '/about' },
    { label: 'Контакты', route: '/contact' },
    { label: 'Помощь', route: '/help' },
    { label: 'FAQ', route: '/faq' },
  ];
  
  legalLinks = [
    { label: 'Политика конфиденциальности', route: '/privacy' },
    { label: 'Условия использования', route: '/terms' },
  ];
}