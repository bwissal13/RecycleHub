import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LandingComponent } from './features/landing/landing.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/landing/landing.routes').then(m => m.LANDING_ROUTES)
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'collecte',
    loadChildren: () => import('./features/collecte/collecte.routes').then(m => m.COLLECTE_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'collecteur',
    loadChildren: () => import('./features/collecteur/collecteur.routes').then(m => m.COLLECTEUR_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'points',
    loadChildren: () => import('./features/points/points.routes').then(m => m.POINTS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
