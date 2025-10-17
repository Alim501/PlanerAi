import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, UpdateProfileRequest, ChangePasswordRequest } from '../models/user.models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL = 'http://localhost:8080/api/users';

  // Кешируем данные пользователя
  currentUserProfile = signal<User | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Получить профиль пользователя по ID
   */
  getUserById(userId: number): Observable<User> {
    return this.http
      .get<User>(`${this.API_URL}/${userId}`)
      .pipe(tap((user: User) => this.currentUserProfile.set(user)));
  }

  /**
   * Обновить профиль (имя и фамилию)
   */
  updateProfile(userId: number, firstName: string, lastName: string): Observable<User> {
    const params = new HttpParams().set('firstName', firstName).set('lastName', lastName);

    return this.http
      .put<User>(`${this.API_URL}/${userId}/update-profile`, null, { params })
      .pipe(tap((user: User) => this.currentUserProfile.set(user)));
  }

  /**
   * Изменить пароль
   */
  changePassword(userId: number, oldPassword: string, newPassword: string): Observable<string> {
    const params = new HttpParams().set('oldPassword', oldPassword).set('newPassword', newPassword);

    return this.http.put(`${this.API_URL}/${userId}/change-password`, null, {
      params,
      responseType: 'text',
    });
  }

  /**
   * Очистить кеш профиля
   */
  clearProfile(): void {
    this.currentUserProfile.set(null);
  }
}
