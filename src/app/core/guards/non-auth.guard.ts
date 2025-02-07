import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class NonAuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }

  canActivateChild(): boolean {
    return this.canActivate();
  }
} 