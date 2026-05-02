import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly STORAGE_KEY = 'app_theme';

  private _theme = signal<Theme>(this.loadTheme());
  theme = this._theme.asReadonly();
  isDark = () => this._theme() === 'dark';

  constructor() {
    effect(() => {
      const theme = this._theme();
      document.body.classList.toggle('dark-theme', theme === 'dark');
      document.documentElement.style.colorScheme = theme;
      localStorage.setItem(this.STORAGE_KEY, theme);
    });
    // применяем сразу при старте
    document.body.classList.toggle('dark-theme', this._theme() === 'dark');
    document.documentElement.style.colorScheme = this._theme();
  }

  toggle(): void {
    this._theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  private loadTheme(): Theme {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
