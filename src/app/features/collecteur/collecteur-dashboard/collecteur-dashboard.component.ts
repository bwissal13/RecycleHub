import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CollecteService } from '../../../core/services/collecte.service';
import { AuthState } from '../../../core/store/auth/auth.reducer';
import * as AuthActions from '../../../core/store/auth/auth.actions';

interface Collecte {
  id: number;
  userId: number;
  types: Array<{
  type: string;
    poids: number;
  }>;
  poids: number;
  adresse: string;
  date: string;
  creneau: string;
  statut: 'en_attente' | 'occupee' | 'en_cours' | 'validee' | 'rejetee';
  photos: string[];
  notes?: string;
  collecteurId?: number;
  poidsReel?: number;
  raisonRejet?: string;
}

@Component({
  selector: 'app-collecteur-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './collecteur-dashboard.component.html'
})
export class CollecteurDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private collectesDisponiblesSubject = new BehaviorSubject<Collecte[]>([]);
  private collectesEnCoursSubject = new BehaviorSubject<Collecte[]>([]);
  private collectesHistoriqueSubject = new BehaviorSubject<Collecte[]>([]);

  collectesDisponibles$ = this.collectesDisponiblesSubject.asObservable();
  collectesEnCours$ = this.collectesEnCoursSubject.asObservable();
  collectesHistorique$ = this.collectesHistoriqueSubject.asObservable();
  loading = false;
  error: string | null = null;
  ville: string = '';
  currentUser: any;
  selectedPhotos: File[] = [];
  validationForm: FormGroup;
  selectedCollecte: Collecte | null = null;
  showMobileMenu = false;

  constructor(
    private collecteService: CollecteService,
    private store: Store<{ auth: AuthState }>,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.validationForm = this.fb.group({
      poidsReel: ['', [Validators.required, Validators.min(0.1), Validators.max(10)]],
      raisonRejet: [''],
      materialsConfirmed: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    this.store.select(state => state.auth.user)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.ville = user.adresse.split(',')[0].trim(); // Extract city from address
    this.chargerCollectes();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.collectesDisponiblesSubject.complete();
    this.collectesEnCoursSubject.complete();
    this.collectesHistoriqueSubject.complete();
  }

  chargerCollectes() {
    if (!this.ville || !this.currentUser?.id) return;

    this.loading = true;
    this.error = null;
    
    // Load available collections in collector's city
    this.collecteService.getCollectesByVille(this.ville)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (collectes) => {
          const disponibles = collectes.filter(c => c.statut === 'en_attente');
          this.collectesDisponiblesSubject.next(disponibles);
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          this.collectesDisponiblesSubject.next([]);
        }
      });

    // Load collector's ongoing collections
    this.collecteService.getCollectesByCollecteur(this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (collectes) => {
          const enCours = collectes.filter(c => ['occupee', 'en_cours'].includes(c.statut));
          const historique = collectes.filter(c => ['validee', 'rejetee'].includes(c.statut));
          this.collectesEnCoursSubject.next(enCours);
          this.collectesHistoriqueSubject.next(historique);
        },
        error: (error) => {
          this.error = error.message;
          this.collectesEnCoursSubject.next([]);
          this.collectesHistoriqueSubject.next([]);
        }
      });
  }

  accepterCollecte(collecteId: number) {
    if (!this.currentUser?.id) return;
    
    this.loading = true;
    this.error = null;
    
    this.collecteService.accepterCollecte(collecteId, this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.chargerCollectes();
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  demarrerCollecte(collecteId: number) {
    this.loading = true;
    this.error = null;
    
    this.collecteService.demarrerCollecte(collecteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.chargerCollectes();
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  onPhotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      this.selectedPhotos = Array.from(files)
        .filter(file => file.type.startsWith('image/')) as File[];
    }
  }

  prepareValidation(collecte: Collecte) {
    this.selectedCollecte = collecte;
    this.validationForm.patchValue({
      poidsReel: collecte.poids,
      materialsConfirmed: false,
      raisonRejet: ''
    });
  }

  validerCollecte() {
    if (!this.selectedCollecte || !this.validationForm.valid) return;

    const { poidsReel, materialsConfirmed } = this.validationForm.value;
    
    if (!materialsConfirmed) {
      this.error = "Veuillez confirmer la vérification des matériaux";
      return;
    }

    this.loading = true;
    this.error = null;

    // Convert photos to base64 before sending
    const photoPromises = this.selectedPhotos.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(photoPromises).then(photoUrls => {
      this.collecteService.validerCollecte(this.selectedCollecte!.id, poidsReel)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.selectedCollecte = null;
            this.selectedPhotos = [];
            this.validationForm.reset();
            this.chargerCollectes();
          },
          error: (error) => {
            this.error = error.message;
            this.loading = false;
          }
        });
    });
  }

  rejeterCollecte() {
    if (!this.selectedCollecte || !this.validationForm.valid) return;

    const { raisonRejet } = this.validationForm.value;
    
    if (!raisonRejet) {
      this.error = "Veuillez spécifier la raison du rejet";
      return;
    }

    this.loading = true;
    this.error = null;
    
    this.collecteService.rejeterCollecte(this.selectedCollecte.id, raisonRejet)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.selectedCollecte = null;
          this.validationForm.reset();
          this.chargerCollectes();
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
    });
  }

  getStatutClass(statut: string): string {
    const classes = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      occupee: 'bg-blue-100 text-blue-800',
      en_cours: 'bg-purple-100 text-purple-800',
      validee: 'bg-green-100 text-green-800',
      rejetee: 'bg-red-100 text-red-800'
    };
    return classes[statut as keyof typeof classes] || '';
  }

  getStatutLabel(statut: string): string {
    const labels = {
      en_attente: 'En attente',
      occupee: 'Acceptée',
      en_cours: 'En cours',
      validee: 'Validée',
      rejetee: 'Rejetée'
    };
    return labels[statut as keyof typeof labels] || statut;
  }

  calculatePoints(types: Array<{ type: string; poids: number }>): number {
    return types.reduce((total, type) => {
      const pointsPerKg = {
        'Plastique': 2,
        'Verre': 1,
        'Papier': 1,
        'Métal': 5
      };
      return total + (type.poids * (pointsPerKg[type.type as keyof typeof pointsPerKg] || 0));
    }, 0);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
} 