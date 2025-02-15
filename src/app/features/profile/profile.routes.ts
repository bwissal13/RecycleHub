import { Routes } from '@angular/router';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { ProfileLayoutComponent } from './profile-layout.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfileLayoutComponent,
    children: [
      {
        path: '',
        component: EditProfileComponent
      }
    ]
  }
]; 