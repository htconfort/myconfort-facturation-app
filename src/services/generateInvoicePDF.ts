// /src/services/generateInvoicePDF.ts
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Invoice } from "../types";

// Sélecteurs pour les sections HTML à capturer
const FACTURE_SELECTOR = "#facture-apercu";
const CGV_SELECTOR = "#conditions-generales";

export interface PDFGenerationOptions {
  scale?: number;
  backgroundColor?: string;
  margins?: number;
  filename?: string;
}

/**
 * Génère un PDF 2 pages : Page 1 = Facture, Page 2 = CGV
 * Utilise html2canvas pour capturer le rendu HTML exact
 * Retourne un Blob pour téléchargement/upload/impression
 */
export async function generateInvoicePDF(
  invoice: Invoice, 
  options: PDFGenerationOptions = {}
): Promise<Blob> {
  const {
    scale = 2,
    backgroundColor = "#ffffff",
    margins = 6
  } = options;

  try {
    // 📄 Page 1 : Capture de la facture
    const factureElement = document.querySelector(FACTURE_SELECTOR) as HTMLElement;
    if (!factureElement) {
      throw new Error("Section d'aperçu de facture introuvable. Vérifiez que l'ID #facture-apercu existe.");
    }

    const factureCanvas = await html2canvas(factureElement, {
      scale,
      useCORS: true,
      backgroundColor,
      allowTaint: true,
      height: factureElement.scrollHeight,
      width: factureElement.scrollWidth
    });

    // 📋 Page 2 : Capture des CGV
    const cgvElement = document.querySelector(CGV_SELECTOR) as HTMLElement;
    if (!cgvElement) {
      throw new Error("Section CGV introuvable. Vérifiez que l'ID #conditions-generales existe.");
    }

    // Rendre temporairement visible les CGV pour la capture (si cachées)
    const originalDisplay = cgvElement.style.display;
    cgvElement.style.display = 'block';
    cgvElement.style.visibility = 'visible';

    const cgvCanvas = await html2canvas(cgvElement, {
      scale,
      useCORS: true,
      backgroundColor,
      allowTaint: true,
      height: cgvElement.scrollHeight,
      width: cgvElement.scrollWidth
    });

    // Restaurer l'état d'affichage original
    cgvElement.style.display = originalDisplay;

    // 🎯 Création du PDF A4
    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Page 1 : Facture
    const factureImg = factureCanvas.toDataURL("image/png", 1.0);
    const factureRatio = factureCanvas.height / factureCanvas.width;
    const factureWidth = pageWidth - (margins * 2);
    const factureHeight = Math.min(factureWidth * factureRatio, pageHeight - (margins * 2));

    pdf.addImage(
      factureImg, 
      "PNG", 
      margins, 
      margins, 
      factureWidth, 
      factureHeight
    );

    // Page 2 : Conditions Générales
    pdf.addPage();
    const cgvImg = cgvCanvas.toDataURL("image/png", 1.0);
    const cgvRatio = cgvCanvas.height / cgvCanvas.width;
    const cgvWidth = pageWidth - (margins * 2);
    const cgvHeight = Math.min(cgvWidth * cgvRatio, pageHeight - (margins * 2));

    pdf.addImage(
      cgvImg, 
      "PNG", 
      margins, 
      margins, 
      cgvWidth, 
      cgvHeight
    );

    // 📎 Métadonnées du PDF
    pdf.setProperties({
      title: `Facture ${invoice.invoiceNumber}`,
      subject: `Facture MyConfort - ${invoice.clientName}`,
      author: "MyConfort",
      creator: "MyConfort Facturation App"
    });

    // Retourner le Blob pour utilisation ultérieure
    return pdf.output("blob");

  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw new Error(`Impossible de générer le PDF: ${(error as Error).message}`);
  }
}

/**
 * Télécharge directement le PDF
 */
export async function downloadInvoicePDF(invoice: Invoice, options?: PDFGenerationOptions): Promise<void> {
  const pdfBlob = await generateInvoicePDF(invoice, options);
  const filename = options?.filename || `Facture_MyConfort_${invoice.invoiceNumber}.pdf`;
  
  // Créer un lien de téléchargement temporaire
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Ouvre le PDF pour impression
 */
export async function printInvoicePDF(invoice: Invoice, options?: PDFGenerationOptions): Promise<void> {
  const pdfBlob = await generateInvoicePDF(invoice, options);
  const url = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  } else {
    throw new Error("Impossible d'ouvrir la fenêtre d'impression. Vérifiez que les popups sont autorisés.");
  }
  
  // Nettoyer l'URL après usage
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Retourne le PDF en base64 pour upload Google Drive
 */
export async function getInvoicePDFBase64(invoice: Invoice, options?: PDFGenerationOptions): Promise<string> {
  const pdfBlob = await generateInvoicePDF(invoice, options);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]; // Enlever le préfixe data:
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(pdfBlob);
  });
}
