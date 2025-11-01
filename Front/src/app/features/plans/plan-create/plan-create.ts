import { Component, signal } from '@angular/core';
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
import { CreatePlanRequest, Plan, PLAN_STATUSES, SUBJECTS } from '../../../models/plan.models';
import { PlanService } from '../../../services/plan.service';

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
  ],
  templateUrl: './plan-create.html',
  styleUrl: './plan-create.scss',
})
export class CreatePlanComponent {
  planForm: FormGroup;
  isLoading = signal(false);

  subjects = SUBJECTS;
  statuses = PLAN_STATUSES;

  minDate = new Date();
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.planForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      subject: ['', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: ['', Validators.required],
      status: ['ACTIVE', Validators.required],
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
      subject: this.planForm.value.subject,
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
      status: this.planForm.value.status,
    };

    this.planService.createPlan(request).subscribe({
      next: (plan: Plan) => {
        this.snackBar.open('План успешно создан!', 'OK', { duration: 3000 });
        this.router.navigate(['/plans', plan.id]);
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
    this.router.navigate(['/plans']);
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
