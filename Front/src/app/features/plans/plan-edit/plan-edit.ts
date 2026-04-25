import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Plan, UpdatePlanRequest } from '../../../models/plan.models';
import { Subject } from '../../../models/note.models';
import { PlanStore } from '../../../store/plan.store';
import { PlanService } from '../../../services/plan.service';
import { SubjectService } from '../../../services/subject.service';

@Component({
  selector: 'app-edit-plan',
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './plan-edit.html',
  styleUrl: './plan-edit.scss',
})
export class EditPlanComponent implements OnInit {
  private planService = inject(PlanService);
  private planStore = inject(PlanStore);
  private subjectService = inject(SubjectService);

  planForm!: FormGroup;
  planId!: number;
  isLoading = signal(false);
  isLoadingData = signal(true);

  subjects = signal<Subject[]>([]);
  selectedPlan = this.planStore.selectedPlan;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.planId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.planId) {
      this.router.navigate(['/app/plans']);
      return;
    }
    this.loadSubjects();
    this.loadPlan();
  }

  private initForm(): void {
    this.planForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      subjectId: [null, Validators.required],
      description: [''],
      difficulty: [''],
    });
  }

  loadSubjects(): void {
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

  loadPlan(): void {
    this.planService.getPlanById(this.planId).subscribe({
      next: (plan: Plan) => {
        this.planForm.patchValue({
          title: plan.title,
          subjectId: plan.subject?.id,
          description: plan.description ?? '',
          difficulty: plan.difficulty ?? '',
        });
        this.isLoadingData.set(false);
      },
      error: (error: any) => {
        console.error('Error loading plan:', error);
        this.snackBar.open('Ошибка загрузки плана', 'Закрыть', { duration: 3000 });
        this.router.navigate(['/app/plans']);
      },
    });
  }

  onSubmit(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const request: UpdatePlanRequest = {
      title: this.planForm.value.title,
      subjectId: this.planForm.value.subjectId,
      description: this.planForm.value.description || undefined,
      difficulty: this.planForm.value.difficulty || undefined,
    };

    this.planService.updatePlan(this.planId, request).subscribe({
      next: () => {
        this.snackBar.open('План успешно обновлен!', 'OK', { duration: 3000 });
        this.router.navigate(['/app/plans', this.planId]);
      },
      error: (error: any) => {
        console.error('Error updating plan:', error);
        const message = error.error?.message || 'Ошибка обновления плана';
        this.snackBar.open(message, 'Закрыть', { duration: 5000 });
        this.isLoading.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/app/plans', this.planId]);
  }

  deletePlan(): void {
    if (confirm('Вы уверены, что хотите удалить этот план?')) {
      this.planService.deletePlan(this.planId).subscribe({
        next: () => {
          this.snackBar.open('План успешно удален', 'OK', { duration: 3000 });
          this.router.navigate(['/app/plans']);
        },
        error: (error: any) => {
          console.error('Error deleting plan:', error);
          this.snackBar.open('Ошибка удаления плана', 'Закрыть', { duration: 3000 });
        },
      });
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

}
