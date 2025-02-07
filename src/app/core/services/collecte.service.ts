import { Injectable } from '@angular/core';
import { Observable, of, throwError, from, map } from 'rxjs';

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

  constructor() {
    // Initialiser les données si elles n'existent pas
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      // Données de test pour le débogage
      const debugCollectes: Collecte[] = [
        {
          id: 1,
          userId: 1,
          types: [
            { type: 'Plastique', poids: 5 },
            { type: 'Verre', poids: 5 }
          ],
          poids: 10,
          adresse: 'marrakech,mhamid4',
          date: '2024-02-15',
          creneau: '14:00-15:00',
          statut: 'en_attente',
          photos: ['default-avatar.png', 'recycle.png']
        },
        {
          id: 2,
          userId: 1,
          types: [
            { type: 'Plastique', poids: 1 }
          ],
          poids: 1,
          adresse: 'marrakech,mhamid4',
          date: '2024-02-28',
          creneau: '11:00-12:00',
          statut: 'en_attente',
          photos: ['default-avatar.png']
        }
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(debugCollectes));
    }
  }

  private getCollectes(): Collecte[] {
    if (typeof window === 'undefined') return [];
    const collectesJson = localStorage.getItem(this.STORAGE_KEY);
    console.log('Raw collectes from localStorage:', collectesJson);
    if (!collectesJson) return [];

    try {
      const collectes = JSON.parse(collectesJson);
      // Si c'est un tableau, retourner directement
      if (Array.isArray(collectes)) {
        return collectes.map(collecte => ({
          ...collecte,
          photos: Array.isArray(collecte.photos) 
            ? collecte.photos.map((photo: unknown) => typeof photo === 'string' ? photo : 'default-avatar.png')
            : ['default-avatar.png']
        }));
      }
      return [];
    } catch (error) {
      console.error('Error parsing collectes:', error);
      return [];
    }
  }

  private saveCollectes(collectes: Collecte[]): void {
    if (typeof window !== 'undefined') {
      // Process collectes before saving
      const processedCollectes = collectes.map(collecte => ({
        ...collecte,
        photos: Array.isArray(collecte.photos)
          ? collecte.photos.map(photo => typeof photo === 'string' ? photo : 'default-avatar.png')
          : ['default-avatar.png']
      }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(processedCollectes));
    }
  }

  createCollecte(data: Omit<Collecte, 'id' | 'statut'> & { photos?: (Blob | string)[] }): Observable<Collecte> {
    const collectes = this.getCollectes();
    
    // Vérifier le nombre de collectes en attente pour l'utilisateur
    const collectesEnAttente = collectes.filter(
      c => c.userId === data.userId && 
      ['en_attente', 'occupee', 'en_cours'].includes(c.statut)
    );

    if (collectesEnAttente.length >= 3) {
      return throwError(() => new Error('Vous avez déjà 3 collectes en cours'));
    }

    // Vérifier le poids minimum et maximum
    if (data.poids < 1) {
      return throwError(() => new Error('Le poids minimum est de 1kg'));
    }
    if (data.poids > 10) {
      return throwError(() => new Error('Le poids maximum est de 10kg'));
    }

    // Vérifier l'heure du créneau
    const [heure] = data.creneau.split(':').map(Number);
    if (heure < 8 || heure >= 18) {
      return throwError(() => new Error('Les créneaux doivent être entre 08h00 et 18h00'));
    }

    // Traiter les photos
    const photos: string[] = [];
    
    if (data.photos && data.photos.length > 0) {
      const photoPromises = data.photos.map(photo => {
        if (isBlob(photo)) {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(photo);
          });
        } else if (typeof photo === 'string') {
          // If it's already a data URL, keep it
          if (photo.startsWith('data:')) {
            return Promise.resolve(photo);
          }
          // If it's a blob URL, try to fetch and convert
          if (photo.startsWith('blob:')) {
            return fetch(photo)
              .then(r => r.blob())
              .then(blob => new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  resolve(reader.result as string);
                };
                reader.readAsDataURL(blob);
              }));
          }
        }
        return Promise.resolve('');
      });

      // Wait for all photo conversions
      return from(Promise.all(photoPromises)).pipe(
        map(processedPhotos => {
          const validPhotos = processedPhotos.filter(p => p); // Remove empty strings
          
          const newCollecte: Collecte = {
            ...data,
            id: Date.now(),
            statut: 'en_attente',
            photos: validPhotos.length > 0 ? validPhotos : ['assets/images/default-avatar.png']
          };

          console.log('Saving new collecte with photos:', validPhotos.length);
          collectes.push(newCollecte);
          this.saveCollectes(collectes);

          return newCollecte;
        })
      );
    }

    // If no photos, create collecte with default
    const newCollecte: Collecte = {
      ...data,
      id: Date.now(),
      statut: 'en_attente',
      photos: ['assets/images/default-avatar.png']
    };

    collectes.push(newCollecte);
    this.saveCollectes(collectes);

    return of(newCollecte);
  }

  getUserCollectes(userId: number): Observable<Collecte[]> {
    console.log('Getting collectes for userId:', userId);
    const collectes = this.getCollectes();
    const userCollectes = collectes.filter(c => c.userId === userId);
    console.log('Filtered collectes for user:', userCollectes);
    return of(userCollectes);
  }

  getCollectesByVille(ville: string): Observable<Collecte[]> {
    const collectes = this.getCollectes();
    return of(collectes.filter(c => 
      c.adresse.toLowerCase().includes(ville.toLowerCase()) && 
      c.statut === 'en_attente'
    ));
  }

  getCollectesByCollecteur(collecteurId: number): Observable<Collecte[]> {
    const collectes = this.getCollectes();
    return of(collectes.filter(c => c.collecteurId === collecteurId));
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

    // Vérifier si la collecte peut être modifiée
    if (collectes[index].statut !== 'en_attente' && !updates.statut) {
      return throwError(() => new Error('Seules les collectes en attente peuvent être modifiées'));
    }

    // Si mise à jour du poids, vérifier le total
    if (updates.poids) {
      const autresCollectes = collectes.filter(
        c => c.userId === collectes[index].userId && 
        c.id !== collecteId && 
        ['en_attente', 'occupee', 'en_cours'].includes(c.statut)
      );
      const poidsTotal = autresCollectes.reduce((sum, c) => sum + c.poids, 0) + updates.poids;
      
      if (poidsTotal > 10) {
        return throwError(() => new Error('Le poids total de vos collectes ne peut pas dépasser 10kg'));
      }
    }

    collectes[index] = { ...collectes[index], ...updates };
    this.saveCollectes(collectes);

    return of(collectes[index]);
  }

  deleteCollecte(collecteId: number): Observable<void> {
    const collectes = this.getCollectes();
    const index = collectes.findIndex(c => c.id === collecteId);
    
    if (index === -1) {
      return throwError(() => new Error('Collecte non trouvée'));
    }

    if (collectes[index].statut !== 'en_attente') {
      return throwError(() => new Error('Seules les collectes en attente peuvent être supprimées'));
    }

    collectes.splice(index, 1);
    this.saveCollectes(collectes);

    return of(void 0);
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
    return this.updateCollecte(collecteId, {
      statut: 'validee',
      poidsReel
    });
  }

  rejeterCollecte(collecteId: number, raison: string): Observable<Collecte> {
    return this.updateCollecte(collecteId, {
      statut: 'rejetee',
      raisonRejet: raison
    });
  }
} 