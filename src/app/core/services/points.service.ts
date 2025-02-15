import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface PointTransaction {
  id: number;
  date: string;
  type: 'collecte' | 'echange';
  points: number;
  description: string;
  details?: {
    materiaux?: Array<{ type: string; poids: number; points: number }>;
    bonAchat?: { valeur: number; points: number };
  };
}

@Injectable({
  providedIn: 'root'
})
export class PointsService {
  private readonly POINTS_KEY = 'recycleHub_points';
  private readonly TRANSACTIONS_KEY = 'recycleHub_transactions';
  private readonly POINTS_PER_KG = {
    'Plastique': 2,
    'Verre': 1,
    'Papier': 1,
    'Métal': 5
  };
  private readonly CONVERSION_RATES = [
    { points: 100, valeur: 50 },
    { points: 200, valeur: 120 },
    { points: 500, valeur: 350 }
  ];

  private pointsSubject = new BehaviorSubject<number>(0);
  private transactionsSubject = new BehaviorSubject<PointTransaction[]>([]);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadPointsData();
  }

  loadPointsData() {
    if (isPlatformBrowser(this.platformId)) {
      // Get current user first
      const currentUserJson = localStorage.getItem('currentUser');
      if (!currentUserJson) {
        this.pointsSubject.next(0);
        this.transactionsSubject.next([]);
        return;
      }

      const currentUser = JSON.parse(currentUserJson);
      const userId = currentUser.id;

      // Get all validated collections
      const collectesJson = localStorage.getItem('recycleHub_collectes');
      let totalPoints = 0;
      let transactions: PointTransaction[] = [];
      
      if (collectesJson) {
        try {
          const collectes = JSON.parse(collectesJson);
          // Filter for only current user's validated collections
          const validatedCollectes = collectes.filter((c: any) => 
            c.statut === 'validee' && c.userId === userId
          );
          
          // Create transactions and calculate points from validated collections
          validatedCollectes.forEach((collecte: any) => {
            if (collecte.poidsReel && collecte.types) {
              const weightRatio = collecte.poidsReel / collecte.poids;
              const adjustedTypes = collecte.types.map((type: any) => ({
                type: type.type,
                poids: type.poids * weightRatio
              }));
              
              const points = this.calculatePointsForCollecte(adjustedTypes);
              totalPoints += points;

              // Create transaction for this collection if it doesn't exist
              const transaction: PointTransaction = {
                id: collecte.id,
                date: collecte.date,
                type: 'collecte',
                points: points,
                description: 'Points gagnés pour la collecte',
                details: {
                  materiaux: adjustedTypes.map((m: { type: string; poids: number }) => ({
                    ...m,
                    points: m.poids * (this.POINTS_PER_KG[m.type as keyof typeof this.POINTS_PER_KG] || 0)
                  }))
                }
              };
              transactions.push(transaction);
            }
          });

          // Sort transactions by date (most recent first)
          transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          // Save transactions to localStorage
          localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
          this.transactionsSubject.next(transactions);
        } catch (error) {
          console.error('Error calculating total points:', error);
        }
      }

      // Update current user points
      currentUser.points = totalPoints;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update users list
      const usersJson = localStorage.getItem('users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
        if (userIndex !== -1) {
          users[userIndex].points = totalPoints;
          localStorage.setItem('users', JSON.stringify(users));
        }
      }

      // Update points in subject
      this.pointsSubject.next(totalPoints);
    }
  }

  getPoints(): Observable<number> {
    return this.pointsSubject.asObservable();
  }

  getTransactions(): Observable<PointTransaction[]> {
    return this.transactionsSubject.asObservable();
  }

  getConversionRates() {
    return this.CONVERSION_RATES;
  }

  calculatePointsForCollecte(materiaux: Array<{ type: string; poids: number }>): number {
    return materiaux.reduce((total, item) => {
      const pointsPerKg = this.POINTS_PER_KG[item.type as keyof typeof this.POINTS_PER_KG] || 0;
      return total + (item.poids * pointsPerKg);
    }, 0);
  }

  addCollectePoints(materiaux: Array<{ type: string; poids: number }>) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentUserJson = localStorage.getItem('currentUser');
    if (!currentUserJson) {
      console.error('No current user found when adding points');
      return;
    }

    const pointsEarned = this.calculatePointsForCollecte(materiaux);
    const currentPoints = this.pointsSubject.value;
    const newTotal = currentPoints + pointsEarned;

    const transaction: PointTransaction = {
      id: Date.now(),
      date: new Date().toISOString(),
      type: 'collecte',
      points: pointsEarned,
      description: 'Points gagnés pour la collecte',
      details: {
        materiaux: materiaux.map((m: { type: string; poids: number }) => ({
          ...m,
          points: m.poids * (this.POINTS_PER_KG[m.type as keyof typeof this.POINTS_PER_KG] || 0)
        }))
      }
    };

    // Get existing transactions
    const currentTransactions = this.transactionsSubject.value;
    const updatedTransactions = [transaction, ...currentTransactions];
    
    // Save updated transactions
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
    this.transactionsSubject.next(updatedTransactions);

    this.updatePoints(newTotal);
  }

  exchangePoints(pointsToExchange: number): boolean {
    const rate = this.CONVERSION_RATES.find(r => r.points === pointsToExchange);
    if (!rate || this.pointsSubject.value < pointsToExchange) {
      return false;
    }

    const currentPoints = this.pointsSubject.value;
    const newTotal = currentPoints - pointsToExchange;

    const transaction: PointTransaction = {
      id: Date.now(),
      date: new Date().toISOString(),
      type: 'echange',
      points: -pointsToExchange,
      description: `Échange de points contre un bon d'achat`,
      details: {
        bonAchat: { valeur: rate.valeur, points: pointsToExchange }
      }
    };

    // Get existing transactions
    const currentTransactions = this.transactionsSubject.value;
    const updatedTransactions = [transaction, ...currentTransactions];
    
    // Save updated transactions
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
    this.transactionsSubject.next(updatedTransactions);

    this.updatePoints(newTotal);
    return true;
  }

  private updatePoints(newTotal: number) {
    if (isPlatformBrowser(this.platformId)) {
      // Update points in localStorage and state
      const currentUserJson = localStorage.getItem('currentUser');
      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        currentUser.points = newTotal;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update users list
        const usersJson = localStorage.getItem('users');
        if (usersJson) {
          const users = JSON.parse(usersJson);
          const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
          if (userIndex !== -1) {
            users[userIndex].points = newTotal;
            localStorage.setItem('users', JSON.stringify(users));
          }
        }

        // Emit the new points value immediately
        this.pointsSubject.next(newTotal);

        // Force a refresh of the points in the store
        window.dispatchEvent(new Event('storage'));
      }
    }
  }
} 