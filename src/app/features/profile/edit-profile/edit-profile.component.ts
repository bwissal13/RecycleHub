import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import { AuthState } from '../../../core/store/auth/auth.reducer';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-profile.component.html'
})
export class EditProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  selectedFile: File | null = null;
  currentUser$: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private store: Store<{ auth: AuthState }>
  ) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      adresse: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      dateNaissance: ['', Validators.required]
    });

    this.loading$ = this.store.select(state => state.auth.loading);
    this.error$ = this.store.select(state => state.auth.error);
    this.currentUser$ = this.store.select(state => state.auth.user);
  }

  ngOnInit() {
    this.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          adresse: user.adresse,
          telephone: user.telephone,
          dateNaissance: user.dateNaissance
        });
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file;
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const userData = {
        ...this.profileForm.value,
        photo: this.selectedFile
      };
      this.store.dispatch(AuthActions.updateProfile(userData));
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  onDeleteAccount() {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      this.store.dispatch(AuthActions.deleteAccount());
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.profileForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Veuillez entrer une adresse email valide';
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