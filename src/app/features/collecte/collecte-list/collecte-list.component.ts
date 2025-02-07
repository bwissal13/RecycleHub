import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { CollecteService } from '../../../core/services/collecte.service';
import { AuthState } from '../../../core/store/auth/auth.reducer';
import { Subject, takeUntil } from 'rxjs';

interface PhotoType {
  url: string;
}

interface Collecte {
  id: number;
  userId: number;
  dechets?: Array<{
    type: string;
    poids: number;
  }>;
  types: Array<{
    type: string;
    poids: number;
  }>;
  poids: number;
  adresse: string;
  date: string;
  creneau: string;
  statut: 'en_attente' | 'occupee' | 'en_cours' | 'validee' | 'rejetee';
  photos?: string[];
  notes?: string;
  collecteurId?: number;
  poidsReel?: number;
  raisonRejet?: string;
}

@Component({
  selector: 'app-collecte-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collecte-list.component.html'
})
export class CollecteListComponent implements OnInit, OnDestroy {
  collectes: Collecte[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private collecteService: CollecteService,
    private store: Store<{ auth: AuthState }>
  ) {}

  ngOnInit() {
    this.loading = true;
    this.store.select(state => state.auth.user)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          // Load collectes from localStorage first
          const collectesJson = localStorage.getItem('recycleHub_collectes');
          console.log('Raw collectes JSON:', collectesJson);
          if (collectesJson) {
            try {
              const parsedCollectes = JSON.parse(collectesJson);
              this.collectes = Array.isArray(parsedCollectes) ? parsedCollectes : [parsedCollectes];
              console.log('Parsed collectes with photos:', this.collectes.map(c => ({ id: c.id, photos: c.photos })));
            } catch (error) {
              console.error('Error parsing collectes:', error);
            }
          }

          // Then try to load from service
          this.collecteService.getUserCollectes(user.id).subscribe({
            next: (collectes) => {
              if (collectes && collectes.length > 0) {
                this.collectes = collectes;
                console.log('Service collectes with photos:', collectes.map(c => ({ id: c.id, photos: c.photos })));
              }
              this.loading = false;
            },
            error: (error) => {
              console.error('Error loading collectes:', error);
              this.error = 'Erreur lors du chargement des collectes';
              this.loading = false;
            }
          });
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPhotoUrl(photo: unknown): string {
    // If photo is not a string, use default
    if (typeof photo !== 'string') {
      console.log('Photo is not a string:', photo);
      return 'assets/images/default-avatar.png';
    }

    // If it's a data URL, use it directly
    if (photo.startsWith('data:')) {
      return photo;
    }

    // If it's already a full path, use it
    if (photo.startsWith('assets/')) {
      return photo;
    }

    // Otherwise, assume it's a filename and construct the path
    return `assets/images/${photo}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      console.log('Image failed to load:', img.src);
      img.src = 'assets/images/default-avatar.png';
    }
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

  getTypesDisplay(collecte: Collecte): string {
    const types = collecte.types || collecte.dechets;
    if (!types) return '';
    return types.map(t => `${t.type} - ${t.poids}kg`).join(', ');
  }

  onDelete(collecteId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande de collecte ?')) {
      this.collecteService.deleteCollecte(collecteId).subscribe({
        next: () => {
          this.collectes = this.collectes.filter(c => c.id !== collecteId);
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }
} 