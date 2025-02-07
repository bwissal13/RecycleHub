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

  private loadPointsData() {
    if (isPlatformBrowser(this.platformId)) {
      const currentUserJson = localStorage.getItem('currentUser');
      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        this.pointsSubject.next(currentUser.points || 0);
      }

      const transactionsJson = localStorage.getItem(this.TRANSACTIONS_KEY);
      if (transactionsJson) {
        const transactions = JSON.parse(transactionsJson);
        this.transactionsSubject.next(transactions);
      }
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
        materiaux: materiaux.map(m => ({
          ...m,
          points: m.poids * (this.POINTS_PER_KG[m.type as keyof typeof this.POINTS_PER_KG] || 0)
        }))
      }
    };

    this.updatePoints(newTotal, transaction);
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

    this.updatePoints(newTotal, transaction);
    return true;
  }

  private updatePoints(newTotal: number, transaction?: PointTransaction) {
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

        // Update transactions if provided
        if (transaction) {
          const currentTransactions = this.transactionsSubject.value;
          const updatedTransactions = [transaction, ...currentTransactions];
          this.transactionsSubject.next(updatedTransactions);
          localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
        }

        // Force a refresh of the points in the store
        window.dispatchEvent(new Event('storage'));
      }
    }
  }
} 