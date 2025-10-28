import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/user.models';

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private readonly USER_KEY = 'user_data';

  // Private state
  private _user = signal<User | null>(this.loadUserFromStorage());
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Public readonly state
  user = this._user.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // Computed state
  isLoaded = computed(() => !!this._user());
  fullName = computed(() => {
    const user = this._user();
    if (!user?.firstName || !user?.lastName) return null;
    return `${user.firstName} ${user.lastName}`;
  });
  initials = computed(() => {
    const user = this._user();
    if (!user?.firstName || !user?.lastName) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  });
  userId = computed(() => this._user()?.id ?? null);
  userEmail = computed(() => this._user()?.email ?? '');
  userRole = computed(() => this._user()?.role ?? 'USER');
  isAdmin = computed(() => this._user()?.role === 'ADMIN');

  // Actions
  setUser(user: User): void {
    this._user.set(user);
    this._error.set(null);
    this.saveToStorage(user);
  }

  updateUser(updates: Partial<User>): void {
    const current = this._user();
    if (current) {
      const updated = { ...current, ...updates };
      this._user.set(updated);
      this.saveToStorage(updated);
    }
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  clearUser(): void {
    this._user.set(null);
    this._error.set(null);
    localStorage.removeItem(this.USER_KEY);
  }

  // Getters
  getUser(): User | null {
    return this._user();
  }

  // Private helpers
  private saveToStorage(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private loadUserFromStorage(): User | null {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }
}
