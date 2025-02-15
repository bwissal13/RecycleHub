import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

interface VoucherData {
  valeur: number;
  pointsUtilises: number;
  utilisateurNom: string;
  utilisateurPrenom: string;
}

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  private readonly LOGO_URL = 'assets/images/logo.png';

  generateVoucherPDF(data: VoucherData): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a5'
    });

    // Set background color
    doc.setFillColor(240, 253, 244); // Light green background
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

    // Add decorative border
    doc.setDrawColor(22, 163, 74); // Green border
    doc.setLineWidth(0.5);
    doc.rect(5, 5, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10, 'S');

    // Add inner border
    doc.setLineWidth(0.25);
    doc.rect(8, 8, doc.internal.pageSize.width - 16, doc.internal.pageSize.height - 16, 'S');

    // Add header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(22, 163, 74); // Green text
    doc.text('BON D\'ACHAT', doc.internal.pageSize.width / 2, 25, { align: 'center' });

    // Add RecycleHub text
    doc.setFontSize(16);
    doc.text('RecycleHub', doc.internal.pageSize.width / 2, 35, { align: 'center' });

    // Add value
    doc.setFontSize(32);
    doc.setTextColor(22, 163, 74);
    doc.text(`${data.valeur} DH`, doc.internal.pageSize.width / 2, 55, { align: 'center' });

    // Add user info
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81); // Gray text
    doc.text(`Bénéficiaire: ${data.utilisateurPrenom} ${data.utilisateurNom}`, 20, 70);
    doc.text(`Points utilisés: ${data.pointsUtilises} points`, 20, 78);

    // Add voucher details
    doc.setFontSize(10);
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3);

    doc.text(`Date d'émission: ${today.toLocaleDateString('fr-FR')}`, 20, 90);
    doc.text(`Date d'expiration: ${expiryDate.toLocaleDateString('fr-FR')}`, 20, 96);

    // Add unique voucher number
    const voucherNumber = this.generateVoucherNumber();
    doc.setFontSize(11);
    doc.text(`N° ${voucherNumber}`, doc.internal.pageSize.width - 20, 90, { align: 'right' });

    // Add terms and conditions
    doc.setFontSize(8);
    doc.text([
      'Conditions d\'utilisation:',
      '• Bon d\'achat valable chez tous nos partenaires',
      '• Non remboursable et non échangeable',
      '• Valable jusqu\'à la date d\'expiration indiquée',
      '• Utilisable en une seule fois'
    ], 20, 110);

    // Add footer
    doc.setFontSize(9);
    doc.setTextColor(22, 163, 74);
    doc.text('RecycleHub - Ensemble pour un avenir plus vert', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 15, { align: 'center' });

    // Add QR Code placeholder
    doc.setDrawColor(128, 128, 128);
    doc.setLineWidth(0.1);
    doc.rect(doc.internal.pageSize.width - 45, 15, 30, 30, 'S');

    // Save the PDF
    doc.save(`bon-achat-${data.valeur}dh-${voucherNumber}.pdf`);
  }

  private generateVoucherNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RH-${timestamp}-${random}`;
  }
} 