import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.models';
import { UserStore } from '../store/user.store';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient, private userStore: UserStore) {}

  /**
   * Получить профиль текущего пользователя
   */
  getUserInfo(): Observable<User> {
    this.userStore.setLoading(true);

    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      tap((user: User) => {
        this.userStore.setUser(user);
        this.userStore.setLoading(false);
      })
    );
  }

  /**
   * Обновить профиль (имя и фамилию)
   */
  updateProfile(firstName: string, lastName: string): Observable<User> {
    const params = new HttpParams().set('firstName', firstName).set('lastName', lastName);

    this.userStore.setLoading(true);

    return this.http.put<User>(`${this.API_URL}/me/update-profile`, null, { params }).pipe(
      tap((user: User) => {
        this.userStore.setUser(user);
        this.userStore.setLoading(false);
      })
    );
  }

  /**
   * Изменить пароль
   */
  changePassword(oldPassword: string, newPassword: string): Observable<string> {
    const params = new HttpParams().set('oldPassword', oldPassword).set('newPassword', newPassword);

    return this.http.put(`${this.API_URL}/me/change-password`, null, {
      params,
      responseType: 'text',
    });
  }
}
