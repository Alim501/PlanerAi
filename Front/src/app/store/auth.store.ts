import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  // Private state - только статус и загрузка
  private _isAuthenticated = signal<boolean>(false);
  private _loading = signal(false);
  private _authChecked = signal<boolean>(false);

  // Public readonly state
  isAuthenticated = this._isAuthenticated.asReadonly();
  loading = this._loading.asReadonly();
  authChecked = this._authChecked.asReadonly();

  // Actions
  setAuthenticated(value: boolean): void {
    this._isAuthenticated.set(value);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setAuthChecked(): void {
    this._authChecked.set(true);
  }

  login(): void {
    this._isAuthenticated.set(true);
  }

  logout(): void {
    this._isAuthenticated.set(false);
  }
}
