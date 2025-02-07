import { Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { NonAuthGuard } from '../../core/guards/non-auth.guard';

export const LANDING_ROUTES: Routes = [
  {
    path: '',
    component: LandingComponent,
    canActivate: [NonAuthGuard]
  }
]; 