import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminUser,
  UpdateProfileRequest,
  ChangePasswordRequest,
  RoleName,
} from '../models/admin.models';
import { API_BASE_URL } from '../core/api.config';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly API_URL = `${API_BASE_URL}/api/admin/users`;

  constructor(private http: HttpClient) {}

  /**
   * Получить всех пользователей (только для админов)
   */
  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.API_URL, {
      withCredentials: true,
    });
  }

  /**
   * Получить пользователя по ID
   */
  getUserById(userId: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.API_URL}/${userId}`, {
      withCredentials: true,
    });
  }

  /**
   * Обновить профиль пользователя
   */
  updateUserProfile(
    userId: number,
    firstName: string,
    lastName: string
  ): Observable<AdminUser> {
    return this.http.put<AdminUser>(
      `${this.API_URL}/${userId}/update-profile`,
      null,
      {
        params: { firstName, lastName },
        withCredentials: true,
      }
    );
  }

  /**
   * Изменить пароль пользователя
   */
  changeUserPassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Observable<string> {
    return this.http.put<string>(
      `${this.API_URL}/${userId}/change-password`,
      null,
      {
        params: { oldPassword, newPassword },
        withCredentials: true,
        responseType: 'text' as 'json',
      }
    );
  }

  /**
   * Добавить роль пользователю
   */
  addRoleToUser(userId: number, roleName: RoleName): Observable<AdminUser> {
    return this.http.post<AdminUser>(
      `${this.API_URL}/${userId}/role/${roleName}`,
      null,
      {
        withCredentials: true,
      }
    );
  }

  /**
   * Удалить роль у пользователя
   */
  removeRoleFromUser(userId: number, roleName: RoleName): Observable<AdminUser> {
    return this.http.delete<AdminUser>(
      `${this.API_URL}/${userId}/role/${roleName}`,
      {
        withCredentials: true,
      }
    );
  }
}
