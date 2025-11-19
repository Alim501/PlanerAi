import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { NoteService } from '../../../services/note.service';
import { SubjectService } from '../../../services/subject.service';
import { Note, Subject } from '../../../models/note.models';
import { StarRatingComponent } from '../../../components/shared/star-rating';

@Component({
  selector: 'app-notes-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    StarRatingComponent,
  ],
  templateUrl: './notes-catalog.html',
  styleUrl: './notes-catalog.scss',
})
export class NotesCatalogComponent implements OnInit {
  notes = signal<Note[]>([]);
  subjects = signal<Subject[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filters
  selectedSubjectId = signal<number | null>(null);
  searchQuery = signal<string>('');
  viewMode = signal<'all' | 'popular' | 'top-rated'>('all');

  constructor(private noteService: NoteService, private subjectService: SubjectService) {}

  ngOnInit() {
    this.loadSubjects();
    this.loadNotes();
  }

  loadSubjects() {
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects: Subject[]) => this.subjects.set(subjects),
      error: (err: any) => console.error('Error loading subjects:', err),
    });
  }

  loadNotes() {
    this.loading.set(true);
    this.error.set(null);

    let observable;

    switch (this.viewMode()) {
      case 'popular':
        observable = this.noteService.getPopularNotes(20);
        break;
      case 'top-rated':
        observable = this.noteService.getTopRatedNotes(20);
        break;
      default:
        if (this.selectedSubjectId()) {
          observable = this.noteService.getNotesBySubject(this.selectedSubjectId()!);
        } else if (this.searchQuery()) {
          observable = this.noteService.searchNotes(this.searchQuery());
        } else {
          observable = this.noteService.getAllNotes();
        }
    }

    observable.subscribe({
      next: (notes: Note[]) => {
        this.notes.set(notes);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Ошибка загрузки заметок');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  onSubjectChange() {
    this.loadNotes();
  }

  onSearchChange() {
    if (this.searchQuery().length > 2 || this.searchQuery().length === 0) {
      this.loadNotes();
    }
  }

  onViewModeChange() {
    this.loadNotes();
  }

  getFormatIcon(format: string): string {
    switch (format) {
      case 'PDF':
        return 'picture_as_pdf';
      case 'IMAGE':
        return 'image';
      case 'DOCX':
        return 'description';
      default:
        return 'note';
    }
  }
}
