import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import { AuthState } from '../../../core/store/auth/auth.reducer';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm: FormGroup;
  selectedFile: File | null = null;
  loading$: Observable<boolean>;
  error$: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private store: Store<{ auth: AuthState }>
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      adresse: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      dateNaissance: ['', Validators.required]
    });

    this.loading$ = this.store.select(state => state.auth.loading);
    this.error$ = this.store.select(state => state.auth.error);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const userData = {
        ...this.registerForm.value,
        photo: this.selectedFile,
        role: 'user'
      };
      this.store.dispatch(AuthActions.register(userData));
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Veuillez entrer une adresse email valide';
    }
    if (control?.hasError('minlength')) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (control?.hasError('pattern')) {
      if (controlName === 'telephone') {
        return 'Le numéro de téléphone doit contenir 10 chiffres';
      }
    }
    return '';
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
} 