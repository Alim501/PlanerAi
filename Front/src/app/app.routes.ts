import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { PlansListComponent } from './features/plans/plans-list/plans-list';
import { CreatePlanComponent } from './features/plans/plan-create/plan-create';
import { EditPlanComponent } from './features/plans/plan-edit/plan-edit';
import { NotesCatalogComponent } from './features/notes/notes-catalog/notes-catalog';
import { NoteUploadComponent } from './features/notes/note-upload/note-upload';
import { ProfileComponent } from './features/profile/profile';
import { HomeComponent } from './features/home/home';
import { AboutComponent } from './features/info/about';
import { ContactsComponent } from './features/info/contacts';
import { HelpComponent } from './features/info/help';
import { FaqComponent } from './features/info/faq';
import { authGuard, publicGuard } from './guards/auth.guard';
import { AuthLayoutComponent } from './components/layout/auth-layout/auth-layout';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { PublicLayoutComponent } from './components/layout/public-layout/public-layout';

export const routes: Routes = [
  // Public routes with PublicLayout
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'about',
        component: AboutComponent,
      },
      {
        path: 'contacts',
        component: ContactsComponent,
      },
      {
        path: 'help',
        component: HelpComponent,
      },
      {
        path: 'faq',
        component: FaqComponent,
      },
    ],
  },
  // Auth routes
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [publicGuard],
    children: [
      { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
      { path: 'register', component: RegisterComponent, canActivate: [publicGuard] },
    ],
  },
  // Protected routes with MainLayout
  {
    path: 'app',
    component: MainLayoutComponent,
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
        component: CreatePlanComponent,
      },
      {
        path: 'plans/edit',
        component: EditPlanComponent,
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
    redirectTo: 'home',
  },
];
