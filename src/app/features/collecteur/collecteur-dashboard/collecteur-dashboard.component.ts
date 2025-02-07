import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CollecteService } from '../../../core/services/collecte.service';
import { AuthState } from '../../../core/store/auth/auth.reducer';

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
  imports: [CommonModule, RouterModule],
  templateUrl: './collecteur-dashboard.component.html'
})
export class CollecteurDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private collectesDisponiblesSubject = new BehaviorSubject<Collecte[]>([]);
  private collectesEnCoursSubject = new BehaviorSubject<Collecte[]>([]);

  collectesDisponibles$ = this.collectesDisponiblesSubject.asObservable();
  collectesEnCours$ = this.collectesEnCoursSubject.asObservable();
  loading = false;
  error: string | null = null;
  ville: string = '';
  currentUser: any;

  constructor(
    private collecteService: CollecteService,
    private store: Store<{ auth: AuthState }>
  ) {}

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
          this.collectesEnCoursSubject.next(enCours);
        },
        error: (error) => {
          this.error = error.message;
          this.collectesEnCoursSubject.next([]);
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

  validerCollecte(collecteId: number, poidsReel: number) {
    this.loading = true;
    this.error = null;
    
    this.collecteService.validerCollecte(collecteId, poidsReel)
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

  rejeterCollecte(collecteId: number, raison: string) {
    this.loading = true;
    this.error = null;
    
    this.collecteService.rejeterCollecte(collecteId, raison)
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
      occupee: 'Occupée',
      en_cours: 'En cours',
      validee: 'Validée',
      rejetee: 'Rejetée'
    };
    return labels[statut as keyof typeof labels] || statut;
  }
} 