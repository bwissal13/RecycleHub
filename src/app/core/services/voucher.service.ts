import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

export interface VoucherData {
  id: string;
  valeur: number;
  pointsUtilises: number;
  dateEmission: Date;
  dateExpiration: Date;
  utilisateurNom: string;
  utilisateurPrenom: string;
}

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      (pdfMake as any).vfs = (pdfFonts as any).vfs;
    }
  }

  private generateVoucherId(): string {
    return 'BON-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  generateVoucherPDF(data: Omit<VoucherData, 'id' | 'dateEmission' | 'dateExpiration'>): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('PDF generation is only available in browser environment');
      return;
    }

    const voucherData: VoucherData = {
      ...data,
      id: this.generateVoucherId(),
      dateEmission: new Date(),
      dateExpiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expire dans 30 jours
    };

    const documentDefinition: TDocumentDefinitions = {
      content: [
        {
          text: 'RecycleHub',
          style: 'header',
          alignment: 'center',
          color: '#22C55E'
        },
        {
          text: 'Bon d\'achat',
          style: 'subheader',
          alignment: 'center',
          margin: [0, 10]
        },
        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: 515,
              h: 200,
              r: 5,
              lineColor: '#22C55E'
            }
          ]
        },
        {
          text: [
            { text: 'N° du bon : ', bold: true },
            voucherData.id
          ],
          margin: [0, 20, 0, 10]
        },
        {
          text: [
            { text: 'Valeur : ', bold: true },
            `${voucherData.valeur} Dh`
          ],
          margin: [0, 0, 0, 10]
        },
        {
          text: [
            { text: 'Points utilisés : ', bold: true },
            `${voucherData.pointsUtilises} points`
          ],
          margin: [0, 0, 0, 10]
        },
        {
          text: [
            { text: 'Bénéficiaire : ', bold: true },
            `${voucherData.utilisateurPrenom} ${voucherData.utilisateurNom}`
          ],
          margin: [0, 0, 0, 10]
        },
        {
          text: [
            { text: 'Date d\'émission : ', bold: true },
            voucherData.dateEmission.toLocaleDateString()
          ],
          margin: [0, 0, 0, 10]
        },
        {
          text: [
            { text: 'Date d\'expiration : ', bold: true },
            voucherData.dateExpiration.toLocaleDateString()
          ],
          margin: [0, 0, 0, 20]
        },
        {
          text: 'Conditions d\'utilisation :',
          style: 'subheader',
          margin: [0, 0, 0, 10]
        },
        {
          ul: [
            'Ce bon d\'achat est valable chez tous nos partenaires',
            'Non cumulable avec d\'autres offres ou promotions',
            'Non remboursable et non échangeable',
            'À utiliser en une seule fois avant la date d\'expiration'
          ],
          margin: [0, 0, 0, 20]
        }
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        }
      },
      defaultStyle: {
        fontSize: 12,
        color: '#333333'
      }
    };

    pdfMake.createPdf(documentDefinition).download(`bon-achat-${voucherData.id}.pdf`);
  }
} 