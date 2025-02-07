import { Routes } from '@angular/router';
import { CollecteListComponent } from './collecte-list/collecte-list.component';
import { CollecteFormComponent } from './collecte-form/collecte-form.component';
import { CollecteDetailsComponent } from './collecte-details/collecte-details.component';   

export const COLLECTE_ROUTES: Routes = [
  {
    path: '',
    component: CollecteListComponent
  },
  {
    path: 'nouvelle',
    component: CollecteFormComponent
  },
  {
    path: ':id',
    component: CollecteDetailsComponent
  }
]; 