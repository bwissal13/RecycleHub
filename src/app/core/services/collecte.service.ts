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
      this.calculateAndUpdateExistingPoints();
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
          
          // Check if user has reached the maximum limit of pending requests
          const pendingCollectes = collectes.filter(c => 
            c.userId === data.userId && 
            ['en_attente', 'occupee', 'en_cours'].includes(c.statut)
          );
          
          if (pendingCollectes.length >= 3) {
            subscriber.error(new Error('Vous avez atteint la limite de 3 demandes simultanées en attente.'));
            return;
          }

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
    return new Observable<Collecte>((subscriber) => {
      const collectes = this.getCollectes();
      const index = collectes.findIndex(c => c.id === collecteId);
      
      if (index === -1) {
        subscriber.error(new Error('Collecte non trouvée'));
        return;
      }

      const collecte = collectes[index];
      
      // Calculate points based on real weight
      const weightRatio = poidsReel / collecte.poids;
      const adjustedTypes = collecte.types.map(type => ({
        ...type,
        poids: type.poids * weightRatio
      }));
      
      // Calculate points using PointsService to ensure consistency
      const pointsAttribues = this.pointsService.calculatePointsForCollecte(adjustedTypes);
      
      // Update the collection
      const updatedCollecte: Collecte = {
        ...collecte,
        statut: 'validee',
        poidsReel,
        pointsAttribues
      };
      
      collectes[index] = updatedCollecte;
      this.saveCollectes(collectes);
      
      // Add points to user's total
      this.pointsService.addCollectePoints(adjustedTypes);
      
      subscriber.next(updatedCollecte);
      subscriber.complete();
    }).pipe(delay(500));
  }

  rejeterCollecte(collecteId: number, raison: string): Observable<Collecte> {
    return this.updateCollecte(collecteId, {
      statut: 'rejetee',
      raisonRejet: raison
    });
  }

  private calculateAndUpdateExistingPoints() {
    const collectes = this.getCollectes();
    const validatedCollectes = collectes.filter(c => c.statut === 'validee');
    
    // Group collections by user
    const collectesByUser = validatedCollectes.reduce((acc, collecte) => {
      if (!acc[collecte.userId]) {
        acc[collecte.userId] = [];
      }
      acc[collecte.userId].push(collecte);
      return acc;
    }, {} as { [key: number]: Collecte[] });

    // Calculate and update points for each user
    Object.entries(collectesByUser).forEach(([userId, userCollectes]) => {
      let totalPoints = 0;

      userCollectes.forEach(collecte => {
        if (collecte.poidsReel) {
          const weightRatio = collecte.poidsReel / collecte.poids;
          const adjustedTypes = collecte.types.map(type => ({
            ...type,
            poids: type.poids * weightRatio
          }));

          const points = this.pointsService.calculatePointsForCollecte(adjustedTypes);
          totalPoints += points;

          // Update pointsAttribues in the collecte if not already set
          if (!collecte.pointsAttribues) {
            collecte.pointsAttribues = points;
          }
        }
      });

      // Update user points in localStorage
      if (isPlatformBrowser(this.platformId)) {
        const usersJson = localStorage.getItem('users');
        if (usersJson) {
          const users = JSON.parse(usersJson);
          const userIndex = users.findIndex((u: User) => u.id === Number(userId));
          if (userIndex !== -1) {
            users[userIndex].points = (users[userIndex].points || 0) + totalPoints;
            localStorage.setItem('users', JSON.stringify(users));
          }
        }

        // Update current user if it's them
        const currentUserJson = localStorage.getItem('currentUser');
        if (currentUserJson) {
          const currentUser = JSON.parse(currentUserJson);
          if (currentUser.id === Number(userId)) {
            currentUser.points = (currentUser.points || 0) + totalPoints;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
          }
        }
      }
    });

    // Save updated collectes with pointsAttribues
    this.saveCollectes(collectes);
  }
} 