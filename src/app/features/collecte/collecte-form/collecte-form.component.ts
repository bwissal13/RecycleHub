import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { CollecteService } from '../../../core/services/collecte.service';
import { AuthState } from '../../../core/store/auth/auth.reducer';

interface TypeDechet {
  type: string;
  poids: number;
}

@Component({
  selector: 'app-collecte-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './collecte-form.component.html'
})
export class CollecteFormComponent implements OnInit {
  collecteForm: FormGroup;
  loading = false;
  error: string | null = null;
  materiaux = ['Plastique', 'Verre', 'Papier', 'Métal'];
  selectedPhotos: File[] = [];
  creneauxDisponibles: string[] = [];
  today = new Date().toISOString().split('T')[0];
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private collecteService: CollecteService,
    private router: Router,
    private store: Store<{ auth: AuthState }>
  ) {
    this.collecteForm = this.fb.group({
      dechets: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      adresse: ['', Validators.required],
      date: ['', [Validators.required, this.dateValidator()]],
      creneau: ['', Validators.required],
      notes: ['']
    });

    // Générer les créneaux disponibles par heure
    for (let heure = 8; heure < 18; heure++) {
      this.creneauxDisponibles.push(
        `${heure.toString().padStart(2, '0')}:00-${(heure + 1).toString().padStart(2, '0')}:00`
      );
    }

    // Surveiller les changements du formulaire
    this.collecteForm.valueChanges.subscribe(() => {
      console.log('Form validity:', this.collecteForm.valid);
      console.log('Dechets length:', this.dechets.length);
      console.log('Poids total:', this.calculerPoidsTotal());
      console.log('Form errors:', this.collecteForm.errors);
    });
  }

  ngOnInit() {
    // Récupérer l'ID de l'utilisateur
    this.store.select(state => state.auth.user)
      .pipe(take(1))
      .subscribe(user => {
        if (user) {
          this.userId = user.id;
          this.collecteForm.patchValue({ adresse: user.adresse });
        }
      });
  }

  get dechets() {
    return this.collecteForm.get('dechets') as FormArray;
  }

  ajouterDechet() {
    const dechetForm = this.fb.group({
      type: ['', Validators.required],
      poids: ['', [Validators.required, Validators.min(1), Validators.max(10)]]
    });
    this.dechets.push(dechetForm);
  }

  supprimerDechet(index: number) {
    this.dechets.removeAt(index);
  }

  calculerPoidsTotal(): number {
    return this.dechets.controls.reduce((total, control) => {
      const poids = control.get('poids')?.value;
      return total + (poids ? parseFloat(poids) : 0);
    }, 0);
  }

  isFormValid(): boolean {
    return (
      this.collecteForm.valid &&
      !this.loading &&
      this.calculerPoidsTotal() <= 10 &&
      this.dechets.length > 0 &&
      this.userId !== null
    );
  }

  onPhotosSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      // Convert FileList to array and store only image files
      this.selectedPhotos = Array.from(files).filter((value: unknown): value is File => {
        return value instanceof File && value.type.startsWith('image/');
      });
      
      // Preview the images immediately
      this.selectedPhotos.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          if (dataUrl) {
            console.log('Photo loaded:', dataUrl.substring(0, 50) + '...');
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  onSubmit(): void {
    console.log('Form submission attempted');
    console.log('Form valid:', this.collecteForm.valid);
    console.log('Loading:', this.loading);
    console.log('UserId:', this.userId);
    console.log('Dechets:', this.dechets.value);
    console.log('Form value:', this.collecteForm.value);
    console.log('Selected photos:', this.selectedPhotos);

    if (this.isFormValid()) {
      const poidsTotal = this.calculerPoidsTotal();
      if (poidsTotal > 10) {
        this.error = 'Le poids total ne peut pas dépasser 10kg';
        return;
      }

      this.loading = true;
      this.error = null;

      // Convert photos to base64 before submitting
      const photoPromises = this.selectedPhotos.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string || '');
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(photoPromises).then(photoDataUrls => {
        const formData = {
          ...this.collecteForm.value,
          types: this.dechets.value,
          photos: photoDataUrls.filter(url => url), // Remove empty strings
          userId: this.userId,
          poids: poidsTotal
        };

        this.collecteService.createCollecte(formData).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/collecte']);
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
          }
        });
      });
    } else {
      this.markFormGroupTouched(this.collecteForm);
      console.log('Form validation failed');
      if (!this.collecteForm.valid) console.log('Form errors:', this.collecteForm.errors);
      if (this.dechets.length === 0) console.log('No dechets added');
      if (this.calculerPoidsTotal() > 10) console.log('Total weight exceeds limit');
      if (!this.userId) console.log('No user ID found');
    }
  }

  private dateValidator() {
    return (control: any) => {
      const selected = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected < today) {
        return { datePassee: true };
      }
      return null;
    };
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string, formGroup?: AbstractControl): string {
    let control: AbstractControl | null;
    
    if (formGroup) {
      control = formGroup.get(controlName);
    } else {
      control = this.collecteForm.get(controlName);
    }

    if (!control) return '';

    if (control.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control.hasError('min')) {
      return 'Le poids minimum est de 1kg';
    }
    if (control.hasError('max')) {
      return 'Le poids maximum est de 10kg';
    }
    if (control.hasError('datePassee')) {
      return 'La date ne peut pas être dans le passé';
    }
    return '';
  }
} 