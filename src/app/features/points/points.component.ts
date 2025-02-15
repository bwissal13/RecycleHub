import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PointsService, PointTransaction } from '../../core/services/points.service';
import { VoucherService } from '../../core/services/voucher.service';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

interface Reward {
  points: number;
  valeur: string;
  description: string;
  disponible: boolean;
}

@Component({
  selector: 'app-points',
  standalone: true,
  imports: [CommonModule, RouterModule, NavComponent],
  templateUrl: './points.component.html'
})
export class PointsComponent implements OnInit, OnDestroy {
  pointsTotal = 0;
  transactions: PointTransaction[] = [];
  rewards: Reward[] = [];
  private destroy$ = new Subject<void>();
  private userData: { nom: string; prenom: string } | null = null;
  error: string | null = null;

  constructor(
    private pointsService: PointsService,
    private voucherService: VoucherService,
    private authService: AuthService
  ) {
    // Initialize rewards based on conversion rates
    this.rewards = this.pointsService.getConversionRates().map(rate => ({
      points: rate.points,
      valeur: `${rate.valeur} Dh`,
      description: 'Bon d\'achat utilisable chez nos partenaires',
      disponible: false
    }));
  }

  ngOnInit(): void {
    // Force a refresh of points data
    this.pointsService.loadPointsData();
    
    // Subscribe to points updates with a small delay to ensure data is loaded
    setTimeout(() => {
      this.pointsService.getPoints()
        .pipe(takeUntil(this.destroy$))
        .subscribe(points => {
          console.log('Points updated:', points); // Debug log
          this.pointsTotal = points;
          // Update rewards availability whenever points change
          this.updateRewardsAvailability();
        });

      // Subscribe to transactions
      this.pointsService.getTransactions()
        .pipe(takeUntil(this.destroy$))
        .subscribe(transactions => {
          console.log('Transactions updated:', transactions); // Debug log
          this.transactions = transactions;
        });
    }, 100);

    // Get user data for voucher generation
    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.userData = {
            nom: user.nom,
            prenom: user.prenom
          };
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateRewardsAvailability(): void {
    this.rewards = this.rewards.map(reward => ({
      ...reward,
      disponible: this.pointsTotal >= reward.points
    }));
  }

  echangerPoints(points: number): void {
    if (this.pointsTotal >= points && this.userData) {
      const rate = this.pointsService.getConversionRates().find(r => r.points === points);
      if (rate) {
        const success = this.pointsService.exchangePoints(points);
        if (success) {
          // Générer le bon d'achat PDF
          this.voucherService.generateVoucherPDF({
            valeur: rate.valeur,
            pointsUtilises: points,
            utilisateurNom: this.userData.nom,
            utilisateurPrenom: this.userData.prenom
          });
        } else {
          this.error = 'Échec de l\'échange de points';
        }
      }
    }
  }

  getTransactionDescription(transaction: PointTransaction): string {
    if (transaction.type === 'collecte' && transaction.details?.materiaux) {
      return transaction.details.materiaux
        .map(m => `${m.poids}kg de ${m.type} (${m.points} points)`)
        .join(', ');
    } else if (transaction.type === 'echange' && transaction.details?.bonAchat) {
      return `Bon d'achat de ${transaction.details.bonAchat.valeur} Dh`;
    }
    return transaction.description;
  }
} 