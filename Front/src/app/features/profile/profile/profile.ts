import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent {

}
// import { Component, OnInit, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatTabsModule } from '@angular/material/tabs';
// import { MatIconModule } from '@angular/material/icon';
// import { MatDividerModule } from '@angular/material/divider';
// import { AuthService } from '../../../services/auth.service';
// import { UserService } from '../../../services/user.service';
// import { User } from '../../../models/user.models';

// @Component({
//   selector: 'app-profile',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatCardModule,
//     MatButtonModule,
//     MatInputModule,
//     MatFormFieldModule,
//     MatProgressSpinnerModule,
//     MatSnackBarModule,
//     MatTabsModule,
//     MatIconModule,
//     MatDividerModule,
//   ],
//   templateUrl: './profile.component.html',
//   styleUrl: './profile.component.scss',
// })
// export class ProfileComponent implements OnInit {
//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private userService: UserService,
//     private snackBar: MatSnackBar
//   ) {
//     this.profileForm = this.fb.group({
//       firstName: ['', Validators.required],
//       lastName: ['', Validators.required],
//     });

//     this.passwordForm = this.fb.group({
//       oldPassword: ['', [Validators.required, Validators.minLength(6)]],
//       newPassword: ['', [Validators.required, Validators.minLength(6)]],
//       confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
//     });
//   }
//   profileForm: FormGroup;
//   passwordForm: FormGroup;

//   userProfile = this.userService.currentUserProfile;
//   isLoadingProfile = signal(false);
//   isLoadingPassword = signal(false);
//   hideOldPassword = signal(true);
//   hideNewPassword = signal(true);

//   userId = computed(() => this.authService.getCurrentUserId());
//   userEmail = computed(() => this.authService.currentUser()?.email || '');

//   ngOnInit(): void {
//     this.loadUserProfile();
//   }

//   /**
//    * Загрузить профиль пользователя
//    */
//   loadUserProfile(): void {
//     const userId = this.userId();
//     if (!userId) {
//       this.snackBar.open('Ошибка: ID пользователя не найден', 'Закрыть', { duration: 3000 });
//       return;
//     }

//     this.isLoadingProfile.set(true);
//     this.userService.getUserById(userId).subscribe({
//       next: (user: User) => {
//         this.profileForm.patchValue({
//           firstName: user.firstName || '',
//           lastName: user.lastName || '',
//         });
//         this.isLoadingProfile.set(false);
//       },
//       error: (error: any) => {
//         console.error('Error loading profile:', error);
//         this.snackBar.open('Ошибка загрузки профиля', 'Закрыть', { duration: 3000 });
//         this.isLoadingProfile.set(false);
//       },
//     });
//   }

//   /**
//    * Обновить профиль
//    */
//   onUpdateProfile(): void {
//     if (this.profileForm.invalid) {
//       this.profileForm.markAllAsTouched();
//       return;
//     }

//     const userId = this.userId();
//     if (!userId) return;

//     this.isLoadingProfile.set(true);
//     const { firstName, lastName } = this.profileForm.value;

//     this.userService.updateProfile(userId, firstName, lastName).subscribe({
//       next: () => {
//         this.snackBar.open('Профиль успешно обновлен!', 'OK', { duration: 3000 });
//         this.isLoadingProfile.set(false);
//       },
//       error: (error) => {
//         console.error('Error updating profile:', error);
//         const message = error.error?.message || 'Ошибка обновления профиля';
//         this.snackBar.open(message, 'Закрыть', { duration: 5000 });
//         this.isLoadingProfile.set(false);
//       },
//     });
//   }

//   /**
//    * Изменить пароль
//    */
//   onChangePassword(): void {
//     if (this.passwordForm.invalid) {
//       this.passwordForm.markAllAsTouched();
//       return;
//     }

//     const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;

//     // Проверка совпадения паролей
//     if (newPassword !== confirmPassword) {
//       this.snackBar.open('Новые пароли не совпадают', 'Закрыть', { duration: 3000 });
//       return;
//     }

//     const userId = this.userId();
//     if (!userId) return;

//     this.isLoadingPassword.set(true);

//     this.userService.changePassword(userId, oldPassword, newPassword).subscribe({
//       next: (response) => {
//         this.snackBar.open('Пароль успешно изменен!', 'OK', { duration: 3000 });
//         this.passwordForm.reset();
//         this.isLoadingPassword.set(false);
//       },
//       error: (error) => {
//         console.error('Error changing password:', error);
//         const message = error.error || 'Ошибка изменения пароля. Проверьте старый пароль.';
//         this.snackBar.open(message, 'Закрыть', { duration: 5000 });
//         this.isLoadingPassword.set(false);
//       },
//     });
//   }

//   /**
//    * Получить сообщение об ошибке для поля
//    */
//   getErrorMessage(formGroup: FormGroup, fieldName: string): string {
//     const field = formGroup.get(fieldName);

//     if (field?.hasError('required')) {
//       return 'Это поле обязательно';
//     }

//     if (field?.hasError('minlength')) {
//       const minLength = field.getError('minlength').requiredLength;
//       return `Минимум ${minLength} символов`;
//     }

//     return '';
//   }
// }
