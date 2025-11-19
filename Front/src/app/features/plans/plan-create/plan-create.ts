import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CreatePlanRequest, Plan, PLAN_STATUSES } from '../../../models/plan.models';
import { Subject } from '../../../models/note.models';
import { PlanService } from '../../../services/plan.service';
import { SubjectService } from '../../../services/subject.service';
import { AIService } from '../../../services/ai.service';
import { GeneratePlanRequest, GeneratedPlan, DifficultyLevel } from '../../../models/ai.models';
import { AIGeneratePlanDialogComponent } from '../../../components/shared/ai-generate-plan-dialog/ai-generate-plan-dialog';

@Component({
  selector: 'app-create-plan',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatDialogModule,
  ],
  templateUrl: './plan-create.html',
  styleUrl: './plan-create.scss',
})
export class CreatePlanComponent implements OnInit {
  planForm: FormGroup;
  isLoading = signal(false);
  subjects = signal<Subject[]>([]);

  statuses = PLAN_STATUSES;

  minDate = new Date();
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private subjectService: SubjectService,
    private aiService: AIService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.planForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      subjectId: [null, Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: ['', Validators.required],
      status: ['ACTIVE', Validators.required],
    });
  }

  ngOnInit() {
    this.loadSubjects();
  }

  loadSubjects() {
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects: Subject[]) => {
        this.subjects.set(subjects);
      },
      error: (err: any) => {
        this.snackBar.open('Ошибка загрузки предметов', 'Закрыть', {
          duration: 3000,
        });
        console.error(err);
      },
    });
  }

  onSubmit(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    // Валидация дат
    const startDate = new Date(this.planForm.value.startDate);
    const endDate = new Date(this.planForm.value.endDate);

    if (endDate <= startDate) {
      this.snackBar.open('Дата окончания должна быть после даты начала', 'Закрыть', {
        duration: 3000,
      });
      return;
    }

    this.isLoading.set(true);

    const request: CreatePlanRequest = {
      title: this.planForm.value.title,
      subjectId: this.planForm.value.subjectId,
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
      status: this.planForm.value.status,
    };

    this.planService.createPlan(request).subscribe({
      next: (plan: Plan) => {
        this.snackBar.open('План успешно создан!', 'OK', { duration: 3000 });
        this.router.navigate(['/app/plans', plan.id]);
      },
      error: (error: any) => {
        console.error('Error creating plan:', error);
        const message = error.error?.message || 'Ошибка создания плана';
        this.snackBar.open(message, 'Закрыть', { duration: 5000 });
        this.isLoading.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/app/plans']);
  }

  openAIGenerateDialog(): void {
    const dialogRef = this.dialog.open(AIGeneratePlanDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        subjects: this.subjects(),
      },
    });

    dialogRef.afterClosed().subscribe((result: GeneratedPlan | null) => {
      if (result) {
        this.fillFormFromGeneratedPlan(result);
      }
    });
  }

  private fillFormFromGeneratedPlan(plan: GeneratedPlan): void {
    // Find subject by name
    const subject = this.subjects().find(
      (s) => s.name.toLowerCase() === plan.subject.toLowerCase()
    );

    if (subject) {
      this.planForm.patchValue({
        title: plan.title,
        subjectId: subject.id,
      });

      // Calculate dates based on duration
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.durationWeeks * 7);

      this.planForm.patchValue({
        startDate: startDate,
        endDate: endDate,
      });

      this.snackBar.open(
        'Форма заполнена на основе AI плана. Проверьте и сохраните.',
        'OK',
        { duration: 5000 }
      );
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.planForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Это поле обязательно';
    }

    if (field?.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Минимум ${minLength} символа`;
    }

    return '';
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
