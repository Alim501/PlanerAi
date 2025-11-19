import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { NoteService } from '../../../services/note.service';
import { Note } from '../../../models/note.models';
import { StarRatingComponent } from '../../../components/shared/star-rating';
import { MatDivider, MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule,
    StarRatingComponent,
  ],
  templateUrl: './note-detail.html',
  styleUrl: './note-detail.scss',
})
export class NoteDetailComponent implements OnInit {
  note = signal<Note | null>(null);
  userRating = signal<number>(0);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private noteService: NoteService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadNote(+id);
      this.loadUserRating(+id);
    }
  }

  loadNote(id: number) {
    this.loading.set(true);
    this.error.set(null);

    this.noteService.getNoteById(id).subscribe({
      next: (note: Note) => {
        this.note.set(note);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Ошибка загрузки заметки');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  loadUserRating(noteId: number) {
    this.noteService.getUserRating(noteId).subscribe({
      next: (result: any) => {
        if (result) {
          this.userRating.set(result.rating);
        }
      },
      error: (err: any) => console.error('Error loading user rating:', err),
    });
  }

  onRatingChange(rating: number) {
    const noteId = this.note()?.id;
    if (!noteId) return;

    this.noteService.rateNote(noteId, { rating }).subscribe({
      next: (updatedNote: Note) => {
        this.note.set(updatedNote);
        this.userRating.set(rating);
        this.snackBar.open(`Вы поставили ${rating} звезд!`, 'OK', {
          duration: 3000,
        });
      },
      error: (err: any) => {
        this.snackBar.open('Ошибка при оценке заметки', 'OK', {
          duration: 3000,
        });
        console.error(err);
      },
    });
  }

  downloadFile() {
    const fileUrl = this.note()?.fileUrl;
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  }

  deleteNote() {
    const noteId = this.note()?.id;
    if (!noteId) return;

    if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
      this.noteService.deleteNote(noteId).subscribe({
        next: () => {
          this.snackBar.open('Заметка удалена', 'OK', { duration: 3000 });
          this.router.navigate(['/app/notes']);
        },
        error: (err: any) => {
          this.snackBar.open('Ошибка удаления заметки', 'OK', {
            duration: 3000,
          });
          console.error(err);
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/app/notes']);
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
