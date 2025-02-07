import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

interface PointsData {
  total: number;
  history: PointsHistory[];
  rewards: Reward[];
}

interface PointsHistory {
  id: number;
  date: string;
  type: 'collecte' | 'conversion';
  points: number;
  description: string;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  image: string;
}

const DEFAULT_REWARDS: Reward[] = [
  {
    id: 1,
    name: 'Bon d\'achat 10€',
    description: 'Valable dans tous les magasins partenaires',
    pointsCost: 1000,
    image: 'assets/images/rewards/voucher-10.png'
  },
  {
    id: 2,
    name: 'Bon d\'achat 20€',
    description: 'Valable dans tous les magasins partenaires',
    pointsCost: 2000,
    image: 'assets/images/rewards/voucher-20.png'
  },
  {
    id: 3,
    name: 'Bon d\'achat 50€',
    description: 'Valable dans tous les magasins partenaires',
    pointsCost: 5000,
    image: 'assets/images/rewards/voucher-50.png'
  }
];

@Injectable({
  providedIn: 'root'
})
export class PointsService {
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'recycleHub_points';

  private getStorage() {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  constructor() {
    const storage = this.getStorage();
    if (storage && !storage.getItem(this.STORAGE_KEY)) {
      storage.setItem(this.STORAGE_KEY, JSON.stringify({
        total: 0,
        history: [],
        rewards: DEFAULT_REWARDS
      }));
    }
  }

  private getData(): PointsData {
    const storage = this.getStorage();
    const data = storage?.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : { total: 0, history: [], rewards: DEFAULT_REWARDS };
  }

  private saveData(data: PointsData): void {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }
  }

  getPointsData(): Observable<PointsData> {
    return of(this.getData());
  }

  addPoints(data: { points: number; description: string; operationType: 'collecte' }): Observable<PointsData> {
    const currentData = this.getData();
    const newHistory: PointsHistory = {
      id: Date.now(),
      date: new Date().toISOString(),
      type: 'collecte',
      points: data.points,
      description: data.description
    };

    const updatedData: PointsData = {
      ...currentData,
      total: currentData.total + data.points,
      history: [newHistory, ...currentData.history]
    };

    this.saveData(updatedData);
    return of(updatedData);
  }

  convertPoints(data: { rewardId: number; pointsCost: number }): Observable<PointsData> {
    const currentData = this.getData();
    
    // Vérifier si l'utilisateur a assez de points
    if (currentData.total < data.pointsCost) {
      throw new Error('Points insuffisants');
    }

    const reward = currentData.rewards.find(r => r.id === data.rewardId);
    if (!reward) {
      throw new Error('Récompense non trouvée');
    }

    const newHistory: PointsHistory = {
      id: Date.now(),
      date: new Date().toISOString(),
      type: 'conversion',
      points: -data.pointsCost,
      description: `Conversion en ${reward.name}`
    };

    const updatedData: PointsData = {
      ...currentData,
      total: currentData.total - data.pointsCost,
      history: [newHistory, ...currentData.history]
    };

    this.saveData(updatedData);
    return of(updatedData);
  }

  getRewards(): Observable<Reward[]> {
    return of(this.getData().rewards);
  }

  getHistory(): Observable<PointsHistory[]> {
    return of(this.getData().history);
  }
} 