import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, filter } from 'rxjs';
import * as AuthActions from '../../../core/store/auth/auth.actions';
import { AuthState } from '../../../core/store/auth/auth.reducer';
import { AuthService } from '../../../core/services/auth.service';
import { ObjectURLPipe } from '../../../core/pipes/object-url.pipe';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ObjectURLPipe],
  templateUrl: './edit-profile.component.html'
})
export class EditProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  selectedFile: File | null = null;
  private destroy$ = new Subject<void>();
  private userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store<{ auth: AuthState }>,
    private authService: AuthService
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
  }

  ngOnInit() {
    // Subscribe to the current user and initialize form
    this.authService.getCurrentUser()
      .pipe(
        takeUntil(this.destroy$),
        filter(user => !!user)
      )
      .subscribe(user => {
        if (user) {
          this.userId = user.id;
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.profileForm.valid && this.userId) {
      const userData = {
        ...this.profileForm.value,
        id: this.userId,
        photo: this.selectedFile
      };
      this.store.dispatch(AuthActions.updateProfile({ userData }));
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  onDeleteAccount() {
    if (this.userId && confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      this.store.dispatch(AuthActions.deleteAccount({ userId: this.userId }));
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