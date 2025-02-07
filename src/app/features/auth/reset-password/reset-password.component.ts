import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import { AuthState } from '../../../core/store/auth/auth.reducer';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnDestroy {
  resetForm: FormGroup;
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<any>(null);
  isSuccess = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store<{ auth: AuthState }>,
    private router: Router,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Reset error when form changes
    this.resetForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.error$.next(null);
        this.isSuccess = false;
      });
  }

  onResetPassword(): void {
    if (this.resetForm.valid) {
      const { email, password } = this.resetForm.value;
      
      this.loading$.next(true);
      this.isSuccess = false;
      this.error$.next(null);
      
      this.authService.resetPassword(email, password).subscribe({
        next: () => {
          this.isSuccess = true;
          this.loading$.next(false);
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 1500);
        },
        error: (error) => {
          this.isSuccess = false;
          this.loading$.next(false);
          this.error$.next(error);
        }
      });
    } else {
      this.markFormGroupTouched(this.resetForm);
    }
  }

  private passwordMatchValidator(g: FormGroup): { [key: string]: any } | null {
    const password = g.get('password');
    const confirmPassword = g.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value
      ? null
      : { mismatch: true };
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.resetForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Veuillez entrer une adresse email valide';
    }
    if (control?.hasError('minlength')) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (this.resetForm.hasError('mismatch') && controlName === 'confirmPassword') {
      return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.loading$.complete();
    this.error$.complete();
  }
} 