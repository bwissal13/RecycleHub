import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

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

@Component({
  selector: 'app-points-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './points-dashboard.component.html'
})
export class PointsDashboardComponent implements OnInit {
  totalPoints$: Observable<number>;
  pointsHistory$: Observable<PointsHistory[]>;
  availableRewards$: Observable<Reward[]>;
  loading$: Observable<boolean>;
  error$: Observable<any>;

  constructor(private store: Store<any>) {
    this.totalPoints$ = this.store.select(state => state.points.total);
    this.pointsHistory$ = this.store.select(state => state.points.history);
    this.availableRewards$ = this.store.select(state => state.points.rewards);
    this.loading$ = this.store.select(state => state.points.loading);
    this.error$ = this.store.select(state => state.points.error);
  }

  ngOnInit() {
    this.loadPointsData();
  }

  loadPointsData() {
    this.store.dispatch({ type: '[Points] Load Points Data' });
  }

  convertPoints(rewardId: number, pointsCost: number) {
    if (confirm(`Êtes-vous sûr de vouloir échanger ${pointsCost} points pour cette récompense ?`)) {
      this.store.dispatch({ 
        type: '[Points] Convert Points', 
        payload: { rewardId, pointsCost } 
      });
    }
  }

  getPointsClass(points: number): string {
    return points >= 0 ? 'text-green-600' : 'text-red-600';
  }

  formatPoints(points: number): string {
    return points >= 0 ? `+${points}` : `${points}`;
  }
} 