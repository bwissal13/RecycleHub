import { Routes } from '@angular/router';
import { CollecteurDashboardComponent } from './collecteur-dashboard/collecteur-dashboard.component';
import { authGuard } from '../../core/guards/auth.guard';
import { collecteurGuard } from '../../core/guards/collecteur.guard';

export const COLLECTEUR_ROUTES: Routes = [
  {
    path: '',
    component: CollecteurDashboardComponent,
    canActivate: [authGuard, collecteurGuard],
    title: 'Tableau de bord Collecteur'
  }
]; 