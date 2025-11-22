import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SubjectService } from '../../../services/subject.service';
import { Subject } from '../../../models/note.models';

export interface SubjectEditDialogData {
  subject: Subject | null;
}

@Component({
  selector: 'app-subject-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './subject-edit-dialog.html',
  styleUrl: './subject-edit-dialog.scss',
})
export class SubjectEditDialogComponent {
  subjectForm: FormGroup;
  loading = signal(false);
  isEdit: boolean;

  constructor(
    private dialogRef: MatDialogRef<SubjectEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubjectEditDialogData,
    private fb: FormBuilder,
    private subjectService: SubjectService,
    private snackBar: MatSnackBar
  ) {
    this.isEdit = !!data.subject;

    this.subjectForm = this.fb.group({
      name: [data.subject?.name || '', [Validators.required, Validators.minLength(2)]],
    });
  }

  save(): void {
    if (this.subjectForm.invalid) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const name = this.subjectForm.value.name.trim();

    const operation = this.isEdit
      ? this.subjectService.updateSubject(this.data.subject!.id, name)
      : this.subjectService.createSubject(name);

    operation.subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open(
          this.isEdit ? 'Предмет обновлён' : 'Предмет создан',
          'OK',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        console.error('Error saving subject:', err);
        this.loading.set(false);
        this.snackBar.open('Ошибка при сохранении предмета', 'OK', {
          duration: 3000,
        });
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
