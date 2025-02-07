import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthState } from '../../core/store/auth/auth.reducer';
import * as AuthActions from '../../core/store/auth/auth.actions';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  selectedFile: File | null = null;
  profileImageUrl: string = 'assets/images/default-avatar.png';
  loading$: Observable<boolean>;
  error$: Observable<any>;

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
  }

  ngOnInit() {
    // Subscribe to the auth state to get user data
    this.store.select(state => state.auth.user).subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          adresse: user.adresse,
          telephone: user.telephone,
          dateNaissance: user.dateNaissance
        });
        // Update profile image if available
        if (user.photo) {
          this.profileImageUrl = user.photo;
        }
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      // Mark form as dirty when photo is changed
      this.profileForm.markAsDirty();
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const formData = {
        ...this.profileForm.value,
        photo: this.selectedFile
      };
      this.store.dispatch(AuthActions.updateProfile(formData));
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
} 