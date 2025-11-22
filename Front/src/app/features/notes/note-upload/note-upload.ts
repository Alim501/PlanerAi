import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { NoteService } from '../../../services/note.service';
import { SubjectService } from '../../../services/subject.service';
import { Subject, NoteFormat, Note } from '../../../models/note.models';
import { MatDivider, MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-note-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './note-upload.html',
  styleUrl: './note-upload.scss',
})
export class NoteUploadComponent implements OnInit {
  uploadForm: FormGroup;
  subjects = signal<Subject[]>([]);
  loading = signal(false);
  uploading = signal(false);
  selectedFile: File | null = null;
  filePreview: string | null = null;

  formats: NoteFormat[] = ['PDF', 'IMAGE', 'DOCX'];

  constructor(
    private fb: FormBuilder,
    private noteService: NoteService,
    private subjectService: SubjectService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      subjectId: [null, Validators.required],
      format: ['PDF' as NoteFormat, Validators.required],
      summary: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit() {
    this.loadSubjects();
  }

  loadSubjects() {
    this.loading.set(true);
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects: Subject[]) => {
        this.subjects.set(subjects);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.snackBar.open('Ошибка загрузки предметов', 'Закрыть', {
          duration: 3000,
        });
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Auto-detect format from file extension
      const fileName = this.selectedFile.name.toLowerCase();
      if (fileName.endsWith('.pdf')) {
        this.uploadForm.patchValue({ format: 'PDF' });
      } else if (fileName.match(/\.(jpg|jpeg|png|gif)$/)) {
        this.uploadForm.patchValue({ format: 'IMAGE' });
      } else if (fileName.endsWith('.docx')) {
        this.uploadForm.patchValue({ format: 'DOCX' });
      }

      // Create preview for images
      if (this.selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.filePreview = e.target?.result as string;
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        this.filePreview = null;
      }
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.filePreview = null;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit() {
    if (this.uploadForm.invalid || !this.selectedFile) {
      this.snackBar.open('Пожалуйста, заполните все обязательные поля и выберите файл', 'Закрыть', {
        duration: 3000,
      });
      return;
    }

    this.uploading.set(true);

    // Upload file and create note in one request
    this.noteService
      .uploadFile(
        this.selectedFile,
        this.uploadForm.value.title,
        this.uploadForm.value.subjectId,
        this.uploadForm.value.format
      )
      .subscribe({
        next: (note: Note) => {
          this.snackBar.open('Заметка успешно загружена!', 'Закрыть', {
            duration: 3000,
          });
          this.uploading.set(false);
          this.router.navigate(['/app/notes', note.id]);
        },
        error: (err: any) => {
          this.snackBar.open('Ошибка загрузки заметки', 'Закрыть', {
            duration: 3000,
          });
          this.uploading.set(false);
          console.error(err);
        },
      });
  }

  cancel() {
    this.router.navigate(['/app/notes']);
  }

  getFormatIcon(format: NoteFormat): string {
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
