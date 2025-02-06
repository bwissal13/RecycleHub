import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { CollecteListComponent } from './features/collecte/collecte-list/collecte-list.component';
import { CollecteFormComponent } from './features/collecte/collecte-form/collecte-form.component';
import { CollecteDetailsComponent } from './features/collecte/collecte-details/collecte-details.component';
import { PointsComponent } from './features/points/points.component';
import { ProfileComponent } from './features/profile/profile.component';
import { AuthComponent } from './features/auth/auth.component';
import { AuthGuard, NonAuthGuard } from './core/guards';
import { LandingComponent } from './features/landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/landing/landing.routes').then(m => m.LANDING_ROUTES)
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [NonAuthGuard]
  },
  {
    path: 'collecte',
    loadChildren: () => import('./features/collecte/collecte.routes').then(m => m.COLLECTE_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'collecteur',
    loadChildren: () => import('./features/collecteur/collecteur.routes').then(m => m.COLLECTEUR_ROUTES),
    canActivate: [AuthGuard],
    data: { roles: ['collecteur'] }
  },
  {
    path: 'points',
    loadChildren: () => import('./features/points/points.routes').then(m => m.POINTS_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
