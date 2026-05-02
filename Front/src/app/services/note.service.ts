import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Note,
  RateNoteRequest,
} from '../models/note.models';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private readonly API_URL = 'http://localhost:8080/api/notes';

  constructor(private http: HttpClient) {}

  getAllNotes(subjectId?: number, sortOrder: string = 'desc'): Observable<Note[]> {
    let params = new HttpParams().set('sortOrder', sortOrder);
    if (subjectId != null) {
      params = params.set('subjectId', subjectId.toString());
    }
    return this.http.get<Note[]>(this.API_URL, { params, withCredentials: true });
  }

  getNotesByUser(userId: number, subjectId?: number, sortOrder: string = 'desc'): Observable<Note[]> {
    let params = new HttpParams().set('sortOrder', sortOrder);
    if (subjectId != null) {
      params = params.set('subjectId', subjectId.toString());
    }
    return this.http.get<Note[]>(`${this.API_URL}/user/${userId}`, { params, withCredentials: true });
  }

  getNoteById(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.API_URL}/${id}`, { withCredentials: true });
  }

  deleteNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, { withCredentials: true });
  }

  uploadFile(file: File, title: string, subjectId: number): Observable<Note> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('subjectId', subjectId.toString());
    return this.http.post<Note>(`${this.API_URL}/upload`, formData, { withCredentials: true });
  }

  rateNote(id: number, request: RateNoteRequest): Observable<Note> {
    return this.http.post<Note>(`${this.API_URL}/${id}/rate`, request, { withCredentials: true });
  }

  getUserRating(noteId: number): Observable<{ rating: number }> {
    return this.http.get<{ rating: number }>(`${this.API_URL}/${noteId}/my-rating`, { withCredentials: true });
  }

  recordView(noteId: number): Observable<Note> {
    return this.http.post<Note>(`${this.API_URL}/${noteId}/view`, null, { withCredentials: true });
  }

  // GET /api/notes?subjectId=X — фильтрация по предмету через общий getAllNotes
  getNotesBySubject(subjectId: number): Observable<Note[]> {
    return this.getAllNotes(subjectId);
  }

  // GET /api/notes/byKeywords?keywords=word1,word2
  searchNotesByKeywords(keywords: string[]): Observable<Note[]> {
    const params = new HttpParams().set('keywords', keywords.join(','));
    return this.http.get<Note[]>(`${this.API_URL}/byKeywords`, { params, withCredentials: true });
  }
}
