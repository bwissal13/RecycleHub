import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CollecteService } from '../../../core/services/collecte.service';
import { NavComponent } from '../../../shared/components/nav/nav.component';

interface Collecte {
  id: number;
  type: string;
  poids: number;
  adresse: string;
  date: string;
  creneau: string;
  statut: 'en_attente' | 'occupee' | 'en_cours' | 'validee' | 'rejetee';
  notes?: string;
  photos?: string[];
}

@Component({
  selector: 'app-collecte-details',
  standalone: true,
  imports: [CommonModule, RouterModule, NavComponent],
  templateUrl: './collecte-details.component.html'
})
export class CollecteDetailsComponent implements OnInit {
  collecte: Collecte = {
    id: 1,
    type: 'Plastique',
    poids: 5,
    adresse: '123 Rue de la République',
    date: '2024-03-15',
    creneau: '09:00-12:00',
    statut: 'en_attente',
    notes: 'Déchets plastiques recyclables uniquement',
    photos: ['photo1.jpg', 'photo2.jpg']
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    // TODO: Fetch collection details using the ID
    console.log('Fetching details for collection:', id);
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