import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SubjectService } from '../../../services/subject.service';
import { Subject } from '../../../models/note.models';
import { SubjectEditDialogComponent } from '../subject-edit-dialog/subject-edit-dialog';

@Component({
  selector: 'app-admin-subjects-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin-subjects-list.html',
  styleUrl: './admin-subjects-list.scss',
})
export class AdminSubjectsListComponent implements OnInit {
  subjects = signal<Subject[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  displayedColumns: string[] = ['id', 'name', 'actions'];

  constructor(
    private subjectService: SubjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.loading.set(true);
    this.error.set(null);

    this.subjectService.getAllSubjects().subscribe({
      next: (subjects: Subject[]) => {
        this.subjects.set(subjects);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading subjects:', err);
        this.error.set('Не удалось загрузить предметы');
        this.loading.set(false);
      },
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(SubjectEditDialogComponent, {
      width: '500px',
      data: { subject: null },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadSubjects();
      }
    });
  }

  openEditDialog(subject: Subject): void {
    const dialogRef = this.dialog.open(SubjectEditDialogComponent, {
      width: '500px',
      data: { subject },
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadSubjects();
      }
    });
  }

  deleteSubject(subject: Subject): void {
    if (!confirm(`Удалить предмет "${subject.name}"?`)) {
      return;
    }

    this.subjectService.deleteSubject(subject.id).subscribe({
      next: () => {
        this.snackBar.open('Предмет удалён', 'OK', { duration: 3000 });
        this.loadSubjects();
      },
      error: (err: any) => {
        console.error('Error deleting subject:', err);
        this.snackBar.open('Ошибка при удалении предмета', 'OK', {
          duration: 3000,
        });
      },
    });
  }
}
