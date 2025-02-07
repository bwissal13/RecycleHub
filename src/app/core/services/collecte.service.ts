import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, delay, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { PointsService } from './points.service';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  adresse: string;
  telephone: string;
  dateNaissance: string;
  photo?: string;
  role: 'user' | 'collecteur';
  points: number;
  password?: string;
}

export interface Collecte {
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
  pointsAttribues?: number;
}

function isBlob(value: any): value is Blob {
  return value instanceof Blob || (
    typeof value === 'object' && 
    value !== null && 
    'type' in value && 
    'size' in value && 
    'arrayBuffer' in value && 
    'stream' in value && 
    'text' in value
  );
}

@Injectable({
  providedIn: 'root'
})
export class CollecteService {
  private readonly STORAGE_KEY = 'recycleHub_collectes';
  private readonly POINTS_PER_KG = {
    'Plastique': 2,
    'Verre': 1,
    'Papier': 1.5,
    'Métal': 3
  };

  private collectesSubject = new BehaviorSubject<Collecte[]>([]);
  public collectes$ = this.collectesSubject.asObservable();

  constructor(
    private authService: AuthService,
    private pointsService: PointsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCollectes();
    }
  }

  private initializeCollectes() {
    const collectesJson = localStorage.getItem(this.STORAGE_KEY);
    if (!collectesJson) {
      // Initialize with empty array if no data exists
      this.saveCollectes([]);
      return;
    }

    try {
      const collectes = JSON.parse(collectesJson);
      if (Array.isArray(collectes)) {
        this.collectesSubject.next(collectes);
      } else {
        this.saveCollectes([]);
      }
    } catch (error) {
      console.error('Error parsing collectes:', error);
      this.saveCollectes([]);
    }
  }

  private getCollectes(): Collecte[] {
    return this.collectesSubject.value;
  }

  private saveCollectes(collectes: Collecte[]): void {
    if (isPlatformBrowser(this.platformId)) {
      const processedCollectes = collectes.map(collecte => ({
        ...collecte,
        photos: Array.isArray(collecte.photos)
          ? collecte.photos.map(photo => typeof photo === 'string' ? photo : 'default-avatar.png')
          : ['default-avatar.png']
      }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(processedCollectes));
      this.collectesSubject.next(processedCollectes);
    }
  }

  private calculatePoints(types: Array<{ type: string; poids: number }>): number {
    return types.reduce((total, type) => {
      const pointsParKg = this.POINTS_PER_KG[type.type as keyof typeof this.POINTS_PER_KG] || 0;
      return total + (type.poids * pointsParKg);
    }, 0);
  }

  private async processPhotos(photos: (string | Blob)[]): Promise<string[]> {
    const processedPhotos = await Promise.all(
      photos.map(async (photo) => {
        if (photo instanceof Blob) {
          return await this.convertBlobToBase64(photo);
        }
        return photo;
      })
    );
    return processedPhotos;
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  createCollecte(data: Omit<Collecte, 'id' | 'statut'> & { photos?: (Blob | string)[] }): Observable<Collecte> {
    return new Observable<Collecte>((subscriber) => {
      (async () => {
        try {
          const collectes = this.getCollectes();
          const processedPhotos = data.photos ? await this.processPhotos(data.photos) : [];
          
          const newCollecte: Collecte = {
            ...data,
            id: Date.now(),
            statut: 'en_attente',
            photos: processedPhotos,
            pointsAttribues: 0
          };

          collectes.push(newCollecte);
          this.saveCollectes(collectes);
          subscriber.next(newCollecte);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      })();

      return () => {
        // Cleanup if needed
      };
    }).pipe(delay(500));
  }

  getUserCollectes(userId: number): Observable<Collecte[]> {
    console.log('Getting collectes for userId:', userId);
    return this.collectes$.pipe(
      map(collectes => collectes.filter(c => c.userId === userId))
    );
  }

  getCollectesByVille(ville: string): Observable<Collecte[]> {
    return this.collectes$.pipe(
      map(collectes => collectes.filter(c => 
        c.adresse.toLowerCase().includes(ville.toLowerCase()) && 
        c.statut === 'en_attente'
      ))
    );
  }

  getCollectesByCollecteur(collecteurId: number): Observable<Collecte[]> {
    return this.collectes$.pipe(
      map(collectes => collectes.filter(c => c.collecteurId === collecteurId))
    );
  }

  getCollecteById(id: number): Observable<Collecte> {
    const collectes = this.getCollectes();
    const collecte = collectes.find(c => c.id === id);
    
    if (!collecte) {
      return throwError(() => new Error('Collecte non trouvée'));
    }
    
    return of(collecte);
  }

  updateCollecte(collecteId: number, updates: Partial<Collecte>): Observable<Collecte> {
    const collectes = this.getCollectes();
    const index = collectes.findIndex(c => c.id === collecteId);
    
    if (index === -1) {
      return throwError(() => new Error('Collecte non trouvée'));
    }

    collectes[index] = { ...collectes[index], ...updates };
    this.saveCollectes(collectes);
    
    return of(collectes[index]).pipe(delay(500));
  }

  deleteCollecte(collecteId: number): Observable<void> {
    const collectes = this.getCollectes();
    const index = collectes.findIndex(c => c.id === collecteId);
    
    if (index === -1) {
      return throwError(() => new Error('Collecte non trouvée'));
    }

    collectes.splice(index, 1);
    this.saveCollectes(collectes);
    
    return of(void 0).pipe(delay(500));
  }

  accepterCollecte(collecteId: number, collecteurId: number): Observable<Collecte> {
    return this.updateCollecte(collecteId, {
      statut: 'occupee',
      collecteurId
    });
  }

  demarrerCollecte(collecteId: number): Observable<Collecte> {
    return this.updateCollecte(collecteId, {
      statut: 'en_cours'
    });
  }

  validerCollecte(collecteId: number, poidsReel: number): Observable<Collecte> {
    console.log('Validation de la collecte:', { collecteId, poidsReel });
    return new Observable<Collecte>(subscriber => {
      try {
        const collectes = this.getCollectes();
        const collecteIndex = collectes.findIndex(c => c.id === collecteId);
        
        if (collecteIndex === -1) {
          throw new Error('Collecte non trouvée');
        }

        const collecte = collectes[collecteIndex];
        
        if (collecte.statut === 'validee') {
          throw new Error('Cette collecte a déjà été validée');
        }

        // Calculer les points en fonction du poids réel et du type de déchet
        const pointsGagnes = collecte.types.reduce((total, type) => {
          const pointsParKg = this.POINTS_PER_KG[type.type as keyof typeof this.POINTS_PER_KG] || 1;
          const poidsTypeReel = (poidsReel / collecte.poids) * type.poids; // Calcul proportionnel du poids réel par type
          return total + (poidsTypeReel * pointsParKg);
        }, 0);

        console.log('Points calculés:', pointsGagnes);

        // Mettre à jour la collecte
        const updatedCollecte: Collecte = {
          ...collecte,
          statut: 'validee',
          poidsReel,
          pointsAttribues: pointsGagnes
        };

        // Mettre à jour les points de l'utilisateur
        this.pointsService.addCollectePoints(
          collecte.types.map(type => ({
            type: type.type,
            poids: (poidsReel / collecte.poids) * type.poids // Calcul proportionnel du poids réel par type
          }))
        );

        // Sauvegarder la collecte mise à jour
        collectes[collecteIndex] = updatedCollecte;
        this.saveCollectes(collectes);

        console.log('Collecte validée avec succès:', updatedCollecte);
        subscriber.next(updatedCollecte);
        subscriber.complete();
      } catch (error) {
        console.error('Erreur lors de la validation:', error);
        subscriber.error(error);
      }
    }).pipe(delay(500));
  }

  rejeterCollecte(collecteId: number, raison: string): Observable<Collecte> {
    return this.updateCollecte(collecteId, {
      statut: 'rejetee',
      raisonRejet: raison
    });
  }
} 