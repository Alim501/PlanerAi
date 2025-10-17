import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { PlansListComponent } from './features/study-plans/plans-list/plans-list';
import { PlanCreateComponent } from './features/study-plans/plan-create/plan-create';
import { NotesCatalogComponent } from './features/notes/notes-catalog/notes-catalog';
import { NoteUploadComponent } from './features/notes/note-upload/note-upload';
import { ProfileComponent } from './features/profile/profile/profile';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [publicGuard] },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'plans',
        component: PlansListComponent,
      },
      {
        path: 'plans/create',
        component: PlanCreateComponent,
      },
      {
        path: 'notes',
        component: NotesCatalogComponent,
      },
      {
        path: 'notes/upload',
        component: NoteUploadComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
