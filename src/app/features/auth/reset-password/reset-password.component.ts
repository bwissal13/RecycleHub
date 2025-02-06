import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import { AuthState } from '../../../core/store/auth/auth.reducer';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  step: 'request' | 'reset' = 'request';
  private token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store<{ auth: AuthState }>,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.loading$ = this.store.select(state => state.auth.loading);
    this.error$ = this.store.select(state => state.auth.error);
  }

  ngOnInit() {
    // Récupérer le token depuis l'URL si présent
    this.token = this.route.snapshot.paramMap.get('token');
    if (this.token) {
      this.switchToResetStep(this.token);
    }
  }

  onRequestReset() {
    if (this.resetForm.valid) {
      this.store.dispatch(AuthActions.requestPasswordReset({ email: this.resetForm.get('email')?.value }));
    }
  }

  switchToResetStep(token: string) {
    this.step = 'reset';
    this.token = token;
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  onResetPassword() {
    if (this.resetForm.valid && this.token) {
      this.store.dispatch(AuthActions.resetPassword({
        token: this.token,
        password: this.resetForm.get('password')?.value
      }));
    }
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
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
} 