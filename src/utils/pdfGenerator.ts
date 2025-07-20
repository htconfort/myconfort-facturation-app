import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from './invoiceStorage';

// Interface pour les options de génération PDF
interface PDFGenerationOptions {
  logoBase64?: string;
  signatureBase64?: string;
  companyInfo?: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    siret?: string;
  };
}

// Fonction de génération PDF avec autoTable
export const generatePDF = async (
  invoice: Invoice, 
  options: PDFGenerationOptions = {}
): Promise<jsPDF> => {
  try {
    console.log('🎯 Génération du PDF pour la facture:', invoice.invoiceNumber);
    
    const doc = new jsPDF();
    
    // Configuration par défaut de l'entreprise
    const companyInfo = options.companyInfo || {
      name: 'MyComfort',
      address: '123 Rue de la Paix\n75001 Paris',
      phone: '01 23 45 67 89',
      email: 'contact@mycomfort.fr',
      siret: '123 456 789 00012'
    };

    // Logo de l'entreprise
    if (options.logoBase64) {
      doc.addImage(options.logoBase64, "PNG", 10, 8, 50, 20);
    }

    // En-tête de la facture
    doc.setFontSize(24);
    doc.setTextColor(71, 122, 12); // Couleur #477A0C
    doc.text("FACTURE", 105, 25, { align: 'center' });

    // Informations de l'entreprise (côté droit)
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const companyLines = [
      companyInfo.name,
      ...companyInfo.address.split('\n'),
      companyInfo.phone ? `Tél: ${companyInfo.phone}` : '',
      companyInfo.email ? `Email: ${companyInfo.email}` : '',
      companyInfo.siret ? `SIRET: ${companyInfo.siret}` : ''
    ].filter(line => line);

    let yPos = 40;
    companyLines.forEach(line => {
      doc.text(line, 200, yPos, { align: 'right' });
      yPos += 5;
    });

    // Numéro et date de facture
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Facture N° ${invoice.invoiceNumber}`, 10, 75);
    doc.text(`Date: ${invoice.date}`, 10, 83);

    // Informations client
    doc.setFont(undefined, 'bold');
    doc.text("FACTURÉ À:", 10, 95);
    doc.setFont(undefined, 'normal');
    
    const clientLines = [
      invoice.clientName,
      ...invoice.clientAddress.split('\n'),
      invoice.clientPhone ? `Tél: ${invoice.clientPhone}` : '',
      invoice.clientEmail ? `Email: ${invoice.clientEmail}` : ''
    ].filter(line => line);

    yPos = 103;
    clientLines.forEach(line => {
      doc.text(line, 10, yPos);
      yPos += 6;
    });

    // Tableau des produits/services avec autoTable
    const tableStartY = Math.max(yPos + 10, 130);
    
    autoTable(doc, {
      startY: tableStartY,
      head: [['Description', 'Quantité', 'Prix unitaire', 'Total HT']],
      body: invoice.items.map(item => [
        item.description,
        item.quantity.toString(),
        `${item.unitPrice.toFixed(2)} €`,
        `${item.total.toFixed(2)} €`
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [71, 122, 12], // Couleur #477A0C
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [242, 239, 226] // Couleur #F2EFE2
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      }
    });

    // Calculs des totaux
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Ligne de séparation
    doc.setDrawColor(71, 122, 12);
    doc.line(120, finalY - 5, 200, finalY - 5);

    // Totaux alignés à droite
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    doc.text(`Sous-total HT:`, 140, finalY);
    doc.text(`${invoice.subtotal.toFixed(2)} €`, 200, finalY, { align: 'right' });
    
    doc.text(`TVA (20%):`, 140, finalY + 8);
    doc.text(`${invoice.tax.toFixed(2)} €`, 200, finalY + 8, { align: 'right' });
    
    // Total TTC en gras
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(71, 122, 12);
    doc.text(`TOTAL TTC:`, 140, finalY + 20);
    doc.text(`${invoice.total.toFixed(2)} €`, 200, finalY + 20, { align: 'right' });

    // Signature électronique
    if (options.signatureBase64) {
      doc.addImage(
        options.signatureBase64, 
        "PNG", 
        130, 
        finalY + 35, 
        40, 
        20
      );
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text("Signature électronique", 130, finalY + 60);
    }

    // Mentions légales en bas de page
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Facture acquittée - Merci de votre confiance", 
      105, 
      pageHeight - 20, 
      { align: 'center' }
    );
    
    if (companyInfo.siret) {
      doc.text(
        `SIRET: ${companyInfo.siret} - TVA non applicable, art. 293 B du CGI`,
        105,
        pageHeight - 15,
        { align: 'center' }
      );
    }

    console.log('✅ PDF généré avec succès avec autoTable');
    return doc;
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du PDF:', error);
    throw error;
  }
};

// Fonction pour télécharger le PDF
export const downloadPDF = async (
  invoice: Invoice, 
  options: PDFGenerationOptions = {}
): Promise<void> => {
  try {
    const pdf = await generatePDF(invoice, options);
    const filename = `Facture_${invoice.invoiceNumber}_${invoice.clientName.replace(/\s+/g, '_')}.pdf`;
    pdf.save(filename);
    console.log('📥 PDF téléchargé:', filename);
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement:', error);
    throw error;
  }
};

// Fonction pour prévisualiser le PDF
export const previewPDF = async (
  invoice: Invoice, 
  options: PDFGenerationOptions = {}
): Promise<string> => {
  try {
    const pdf = await generatePDF(invoice, options);
    const pdfBlob = pdf.output('blob');
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error('❌ Erreur lors de la prévisualisation:', error);
    throw error;
  }
};

// Fonction pour obtenir le PDF en tant que Blob
export const getPDFBlob = async (
  invoice: Invoice, 
  options: PDFGenerationOptions = {}
): Promise<Blob> => {
  try {
    const pdf = await generatePDF(invoice, options);
    return pdf.output('blob');
  } catch (error) {
    console.error('❌ Erreur lors de la création du blob PDF:', error);
    throw error;
  }
};

// Fonction pour envoyer le PDF par email
export const sendPDFByEmail = async (
  invoice: Invoice, 
  recipientEmail?: string,
  customMessage?: string,
  options: PDFGenerationOptions = {}
): Promise<boolean> => {
  try {
    // Import dynamique pour éviter les dépendances circulaires
    const { sendPDFByEmail: emailSender } = await import('./emailService');
    
    // Générer le PDF avec les options
    const pdfBlob = await getPDFBlob(invoice, options);
    
    // Créer une facture temporaire avec le blob PDF pour l'email
    const invoiceWithPDF = { ...invoice, pdfBlob };
    
    return await emailSender(invoiceWithPDF, recipientEmail, customMessage);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi email:', error);
    throw error;
  }
};

// Fonction pour sauvegarder le PDF sur Google Drive
export const savePDFToGoogleDrive = async (
  invoice: Invoice,
  customFilename?: string,
  options: PDFGenerationOptions = {}
): Promise<any> => {
  try {
    // Import dynamique pour éviter les dépendances circulaires
    const { saveInvoiceToGoogleDrive } = await import('./googleDriveService');
    
    // Générer le PDF avec les options
    const pdfBlob = await getPDFBlob(invoice, options);
    
    // Créer une facture temporaire avec le blob PDF
    const invoiceWithPDF = { ...invoice, pdfBlob };
    
    return await saveInvoiceToGoogleDrive(invoiceWithPDF, customFilename);
  } catch (error) {
    console.error('❌ Erreur sauvegarde Google Drive:', error);
    throw error;
  }
};

// Export des types pour utilisation externe
export type { PDFGenerationOptions };