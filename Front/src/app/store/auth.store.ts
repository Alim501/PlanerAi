import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  // Private state - только статус и загрузка
  private _isAuthenticated = signal<boolean>(false);
  private _loading = signal(false);

  // Public readonly state
  isAuthenticated = this._isAuthenticated.asReadonly();
  loading = this._loading.asReadonly();

  // Actions
  setAuthenticated(value: boolean): void {
    this._isAuthenticated.set(value);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  login(): void {
    this._isAuthenticated.set(true);
  }

  logout(): void {
    this._isAuthenticated.set(false);
  }
}
