import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
  RateNoteRequest,
} from '../models/note.models';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private readonly API_URL = 'http://localhost:8080/api/notes';

  constructor(private http: HttpClient) {}

  /**
   * Get all notes
   */
  getAllNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.API_URL, {
      withCredentials: true,
    });
  }

  /**
   * Get notes by subject
   */
  getNotesBySubject(subjectId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.API_URL}/subject/${subjectId}`, {
      withCredentials: true,
    });
  }

  /**
   * Get note by ID
   * Increments view count automatically on backend
   */
  getNoteById(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.API_URL}/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Create new note
   */
  createNote(request: CreateNoteRequest): Observable<Note> {
    return this.http.post<Note>(this.API_URL, request, {
      withCredentials: true,
    });
  }

  /**
   * Update note
   */
  updateNote(id: number, request: UpdateNoteRequest): Observable<Note> {
    return this.http.put<Note>(`${this.API_URL}/${id}`, request, {
      withCredentials: true,
    });
  }

  /**
   * Delete note
   */
  deleteNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Upload file and create note in one request
   */
  uploadFile(
    file: File,
    title: string,
    subjectId: number,
    format: string
  ): Observable<Note> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('subjectId', subjectId.toString());
    formData.append('format', format);

    return this.http.post<Note>(`${this.API_URL}/upload`, formData, {
      withCredentials: true,
    });
  }

  /**
   * Rate a note (1-5 stars)
   */
  rateNote(id: number, request: RateNoteRequest): Observable<Note> {
    return this.http.post<Note>(`${this.API_URL}/${id}/rate`, request, {
      withCredentials: true,
    });
  }

  /**
   * Get user's own rating for a note
   */
  getUserRating(noteId: number): Observable<{ rating: number } | null> {
    return this.http.get<{ rating: number } | null>(
      `${this.API_URL}/${noteId}/my-rating`,
      {
        withCredentials: true,
      }
    );
  }

  /**
   * Search notes by keyword
   */
  searchNotes(query: string): Observable<Note[]> {
    const params = new HttpParams().set('q', query);

    return this.http.get<Note[]>(`${this.API_URL}/search`, {
      params,
      withCredentials: true,
    });
  }

  /**
   * Get popular notes (by views or ratings)
   */
  getPopularNotes(limit: number = 10): Observable<Note[]> {
    const params = new HttpParams().set('limit', limit.toString());

    return this.http.get<Note[]>(`${this.API_URL}/popular`, {
      params,
      withCredentials: true,
    });
  }

  /**
   * Get top-rated notes
   */
  getTopRatedNotes(limit: number = 10): Observable<Note[]> {
    const params = new HttpParams().set('limit', limit.toString());

    return this.http.get<Note[]>(`${this.API_URL}/top-rated`, {
      params,
      withCredentials: true,
    });
  }
}
