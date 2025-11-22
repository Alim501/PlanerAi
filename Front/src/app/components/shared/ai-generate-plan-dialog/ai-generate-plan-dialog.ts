import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AIService } from '../../../services/ai.service';
import { Subject } from '../../../models/note.models';
import { GeneratedPlan, DifficultyLevel } from '../../../models/ai.models';

export interface AIGeneratePlanDialogData {
  subjects: Subject[];
}

@Component({
  selector: 'app-ai-generate-plan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  templateUrl: './ai-generate-plan-dialog.html',
  styleUrl: './ai-generate-plan-dialog.scss',
})
export class AIGeneratePlanDialogComponent {
  generateForm: FormGroup;
  loading = signal(false);
  generatedPlan = signal<GeneratedPlan | null>(null);

  difficultyLevels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];

  topicsInput = '';
  topics: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AIGeneratePlanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AIGeneratePlanDialogData,
    private fb: FormBuilder,
    private aiService: AIService,
    private snackBar: MatSnackBar
  ) {
    this.generateForm = this.fb.group({
      subjectId: [null, Validators.required],
      durationWeeks: [8, [Validators.required, Validators.min(1), Validators.max(52)]],
      level: ['intermediate' as DifficultyLevel, Validators.required],
      goals: [''],
    });
  }

  addTopic(): void {
    const topic = this.topicsInput.trim();
    if (topic && !this.topics.includes(topic)) {
      this.topics.push(topic);
      this.topicsInput = '';
    }
  }

  removeTopic(topic: string): void {
    this.topics = this.topics.filter((t) => t !== topic);
  }

  getDifficultyLabel(level: DifficultyLevel): string {
    const labels: Record<DifficultyLevel, string> = {
      beginner: 'Начальный',
      intermediate: 'Средний',
      advanced: 'Продвинутый',
    };
    return labels[level];
  }

  generate(): void {
    if (this.generateForm.invalid) {
      this.generateForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const subjectId = this.generateForm.value.subjectId;
    const subject = this.data.subjects.find((s) => s.id === subjectId);

    if (!subject) {
      this.snackBar.open('Предмет не найден', 'OK', { duration: 3000 });
      this.loading.set(false);
      return;
    }

    const request = {
      subject: subject.name,
      durationWeeks: this.generateForm.value.durationWeeks,
      level: this.generateForm.value.level,
      topics: this.topics.length > 0 ? this.topics : undefined,
      goals: this.generateForm.value.goals || undefined,
    };

    this.aiService.generatePlan(request).subscribe({
      next: (plan: GeneratedPlan) => {
        this.generatedPlan.set(plan);
        this.loading.set(false);
        this.snackBar.open('План успешно сгенерирован!', 'OK', { duration: 3000 });
      },
      error: (err: any) => {
        console.error('Error generating plan:', err);
        this.loading.set(false);
        const message = err.error?.message || 'Ошибка генерации плана. Проверьте что AI сервис запущен.';
        this.snackBar.open(message, 'OK', { duration: 5000 });
      },
    });
  }

  usePlan(): void {
    const plan = this.generatedPlan();
    if (plan) {
      this.dialogRef.close(plan);
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
