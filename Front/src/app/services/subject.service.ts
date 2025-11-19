import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from '../models/note.models';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private readonly API_URL = 'http://localhost:8080/api/subjects';

  constructor(private http: HttpClient) {}

  /**
   * Get all subjects
   */
  getAllSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.API_URL, {
      withCredentials: true,
    });
  }

  /**
   * Get subject by ID
   */
  getSubjectById(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.API_URL}/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Create new subject (admin only)
   */
  createSubject(name: string): Observable<Subject> {
    return this.http.post<Subject>(
      this.API_URL,
      { name },
      {
        withCredentials: true,
      }
    );
  }
}
