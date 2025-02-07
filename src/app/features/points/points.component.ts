import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Transaction {
  date: string;
  type: string;
  points: number;
  description: string;
}

interface Reward {
  points: number;
  valeur: string;
  description: string;
  disponible: boolean;
}

@Component({
  selector: 'app-points',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './points.component.html'
})
export class PointsComponent {
  pointsTotal = 350;
  
  transactions: Transaction[] = [
    {
      date: '2024-03-15',
      type: 'Collecte',
      points: 10,
      description: 'Collecte de 5kg de plastique'
    },
    {
      date: '2024-03-10',
      type: 'Échange',
      points: -100,
      description: 'Bon d\'achat de 50 Dh'
    },
    {
      date: '2024-03-05',
      type: 'Collecte',
      points: 15,
      description: 'Collecte de 3kg de métal'
    }
  ];

  rewards: Reward[] = [
    {
      points: 100,
      valeur: '50 Dh',
      description: 'Bon d\'achat utilisable chez nos partenaires',
      disponible: true
    },
    {
      points: 200,
      valeur: '120 Dh',
      description: 'Bon d\'achat utilisable chez nos partenaires',
      disponible: true
    },
    {
      points: 500,
      valeur: '350 Dh',
      description: 'Bon d\'achat utilisable chez nos partenaires',
      disponible: false
    }
  ];

  echangerPoints(points: number): void {
    if (this.pointsTotal >= points) {
      // TODO: Implement points exchange logic
      console.log(`Échange de ${points} points`);
    }
  }
} 