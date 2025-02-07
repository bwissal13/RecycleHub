import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const collecteurGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.getCurrentUser().pipe(
    map(user => {
      console.log('Collector guard - user:', user); // Debug log
      if (user?.role === 'collecteur') {
        return true;
      }
      
      // Redirect to home if user is not a collector
      router.navigate(['/home']);
      return false;
    })
  );
}; 