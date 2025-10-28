import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { UserStore } from '../../store/user.store';
import { User } from '../../models/user.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  // Формы
  profileForm: FormGroup;
  passwordForm: FormGroup;

  // Computed свойства из UserStore
  userProfile = computed(() => this.userStore.user());
  isLoadingProfile = computed(() => this.userStore.loading());

  // Local state
  isLoadingPassword = signal(false);
  hideOldPassword = signal(true);
  hideNewPassword = signal(true);

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public userStore: UserStore,
    private snackBar: MatSnackBar
  ) {
    // Инициализация форм
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });

    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // Если данные пользователя еще не загружены
    if (!this.userProfile()) {
      this.loadUserProfile();
    } else {
      this.patchFormValues();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Валидатор для проверки совпадения паролей
   */
  private passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return newPassword && confirmPassword && newPassword === confirmPassword
      ? null
      : { passwordMismatch: true };
  }

  /**
   * Загрузить профиль пользователя
   */
  loadUserProfile(): void {
    this.userService
      .getUserInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.patchFormValues();
        },
        error: (error: any) => {
          console.error('Error loading profile:', error);
          this.snackBar.open('Ошибка загрузки профиля', 'Закрыть', { duration: 3000 });
        },
      });
  }

  /**
   * Заполнить форму данными пользователя
   */
  patchFormValues(): void {
    const user = this.userProfile();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }

  /**
   * Обновить профиль
   */
  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { firstName, lastName } = this.profileForm.value;

    this.userService
      .updateProfile(firstName, lastName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser: User) => {
          // Обновляем данные в store
          this.userStore.updateUser(updatedUser);
          this.snackBar.open('Профиль успешно обновлен!', 'OK', { duration: 3000 });
        },
        error: (error: any) => {
          console.error('Error updating profile:', error);
          const message = error.error?.message || 'Ошибка обновления профиля';
          this.snackBar.open(message, 'Закрыть', { duration: 5000 });
        },
      });
  }

  /**
   * Изменить пароль
   */
  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();

      // Показать ошибку несовпадения паролей
      if (this.passwordForm.hasError('passwordMismatch')) {
        this.snackBar.open('Новые пароли не совпадают', 'Закрыть', { duration: 3000 });
      }
      return;
    }

    this.isLoadingPassword.set(true);

    const { oldPassword, newPassword } = this.passwordForm.value;

    this.userService
      .changePassword(oldPassword, newPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Пароль успешно изменен!', 'OK', { duration: 3000 });
          this.passwordForm.reset();
          this.isLoadingPassword.set(false);
        },
        error: (error: any) => {
          console.error('Error changing password:', error);
          const message = error.error || 'Ошибка изменения пароля. Проверьте старый пароль.';
          this.snackBar.open(message, 'Закрыть', { duration: 5000 });
          this.isLoadingPassword.set(false);
        },
      });
  }

  /**
   * Получить сообщение об ошибке для поля
   */
  getErrorMessage(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);

    if (field?.hasError('required')) {
      return 'Это поле обязательно';
    }

    if (field?.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Минимум ${minLength} символов`;
    }

    return '';
  }
}
