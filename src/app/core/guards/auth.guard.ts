import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.getCurrentUser().pipe(
    map(user => {
      if (user) {
        return true;
      }
      
      // Redirect to login if not authenticated
      router.navigate(['/auth/login']);
      return false;
    })
  );
}; 