import html2pdf from 'html2pdf.js';
import { Invoice } from '../types';
import { AdvancedPDFService } from './advancedPdfService';
import React from 'react'; // Import React for RefObject type

type ElementSource = HTMLElement | React.RefObject<HTMLElement> | string;

export class PDFService {
  private static getTargetElement(source: ElementSource): HTMLElement | null {
    if (typeof source === 'string') {
      return document.getElementById(source);
    } else if (source instanceof HTMLElement) {
      return source;
    } else if (source && 'current' in source && source.current) {
      return source.current;
    }
    return null;
  }

  // 🎯 MÉTHODE PRINCIPALE - UTILISE EXACTEMENT VOTRE SCRIPT
  static async generateInvoicePDF(invoice: Invoice, source: ElementSource): Promise<Blob> {
    try {
      console.log('🎯 GÉNÉRATION PDF AVEC VOTRE SCRIPT EXACT - COHÉRENCE GARANTIE');

      const targetElement = this.getTargetElement(source);

      if (targetElement) {
        return await this.generateFromHTMLElementWithYourExactScript(invoice, targetElement, targetElement.id || 'unknown-element');
      } else {
        // 🔄 FALLBACK: Service avancé seulement si aucun aperçu HTML disponible
        console.warn('⚠️ Aucun aperçu HTML trouvé via la source fournie, utilisation du service avancé');
        return await AdvancedPDFService.getPDFBlob(invoice);
      }
    } catch (error) {
      console.error('❌ Erreur génération PDF depuis aperçu:', error);
      throw new Error('Impossible de générer le PDF identique à l\'aperçu');
    }
  }

  // 🎯 MÉTHODE DE TÉLÉCHARGEMENT - UTILISE EXACTEMENT VOTRE SCRIPT
  static async downloadPDF(invoice: Invoice, source: ElementSource): Promise<void> {
    try {
      console.log('📥 TÉLÉCHARGEMENT PDF AVEC VOTRE SCRIPT EXACT - COHÉRENCE GARANTIE');

      const targetElement = this.getTargetElement(source);

      if (targetElement) {
        await this.downloadFromHTMLElementWithYourExactScript(invoice, targetElement, targetElement.id || 'unknown-element');
      } else {
        // 🔄 FALLBACK: Service avancé
        console.warn('⚠️ Aucun aperçu HTML trouvé via la source fournie, utilisation du service avancé');
        await AdvancedPDFService.downloadPDF(invoice);
      }
    } catch (error) {
      console.error('❌ Erreur téléchargement PDF depuis aperçu:', error);
      throw new Error('Impossible de télécharger le PDF identique à l\'aperçu');
    }
  }

  // 🎯 GÉNÉRATION PDF AVEC VOTRE SCRIPT EXACT (CONFIGURATION IDENTIQUE)
  private static async generateFromHTMLElementWithYourExactScript(invoice: Invoice, element: HTMLElement, elementId: string): Promise<Blob> {
    console.log(`🎯 Génération PDF avec votre script exact depuis: ${elementId}`);

    // Attendre que l'élément soit complètement rendu
    await this.waitForElementToRender(element);

    // 📋 VOTRE CONFIGURATION EXACTE - IDENTIQUE À VOTRE SCRIPT
    const opt = {
      margin: 0,
      filename: 'facture_MYCONFORT.pdf',
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      }
    };

    try {
      console.log('🔄 Conversion HTML vers PDF avec votre script exact...');
      console.log('📐 Configuration utilisée:', opt);
      console.log('📐 Dimensions élément:', {
        width: element.scrollWidth,
        height: element.scrollHeight,
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight
      });

      // 🎯 UTILISATION EXACTE DE VOTRE SCRIPT
      const pdf = await html2pdf().set(opt).from(element).outputPdf('blob');
      console.log('✅ PDF généré avec votre script exact - COHÉRENCE GARANTIE');
      return pdf;
    } catch (error) {
      console.error('❌ Erreur conversion HTML vers PDF avec votre script:', error);
      throw new Error(`Erreur lors de la conversion de l'aperçu ${elementId} en PDF avec votre script`);
    }
  }

  // 🎯 TÉLÉCHARGEMENT DIRECT AVEC VOTRE SCRIPT EXACT
  private static async downloadFromHTMLElementWithYourExactScript(invoice: Invoice, element: HTMLElement, elementId: string): Promise<void> {
    console.log(`📥 Téléchargement direct avec votre script depuis: ${elementId}`);

    // Attendre que l'élément soit complètement rendu
    await this.waitForElementToRender(element);

    // 📋 VOTRE CONFIGURATION EXACTE - IDENTIQUE À VOTRE SCRIPT
    const opt = {
      margin: 0,
      filename: `facture_MYCONFORT_${invoice.invoiceNumber}.pdf`,
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      }
    };

    try {
      console.log('🔄 Téléchargement direct avec votre script exact...');
      console.log('📐 Configuration utilisée:', opt);

      // 🎯 UTILISATION EXACTE DE VOTRE SCRIPT POUR TÉLÉCHARGEMENT
      await html2pdf().set(opt).from(element).save();
      console.log('✅ PDF téléchargé avec votre script exact - COHÉRENCE GARANTIE');
    } catch (error) {
      console.error('❌ Erreur téléchargement avec votre script:', error);
      throw new Error(`Erreur lors du téléchargement du PDF depuis l'aperçu ${elementId} avec votre script`);
    }
  }

  // 🕐 ATTENDRE QUE L'ÉLÉMENT SOIT COMPLÈTEMENT RENDU
  private static async waitForElementToRender(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      // Attendre que toutes les images soient chargées
      const images = element.querySelectorAll('img');
      let loadedImages = 0;

      if (images.length === 0) {
        // Pas d'images, attendre un court délai pour le rendu CSS
        setTimeout(resolve, 200);
        return;
      }

      const checkAllImagesLoaded = () => {
        loadedImages++;
        if (loadedImages >= images.length) {
          // Toutes les images sont chargées, attendre un peu plus pour le rendu final
          setTimeout(resolve, 300);
        }
      };

      images.forEach((img) => {
        if (img.complete) {
          checkAllImagesLoaded();
        } else {
          img.onload = checkAllImagesLoaded;
          img.onerror = checkAllImagesLoaded; // Continuer même si une image échoue
        }
      });

      // Timeout de sécurité
      setTimeout(resolve, 3000);
    });
  }

  // 🖨️ IMPRESSION DEPUIS L'APERÇU (.facture-apercu en priorité)
  static printInvoice(source: ElementSource, invoiceNumber: string): void {
    console.log(`🖨️ Impression depuis l'aperçu via source`);

    const printContent = this.getTargetElement(source);

    if (!printContent) {
      throw new Error('Aucun aperçu trouvé pour l\'impression');
    }

    this.printFromElement(printContent, invoiceNumber);
  }

  // 🖨️ IMPRESSION DEPUIS UN ÉLÉMENT SPÉCIFIQUE
  private static printFromElement(element: HTMLElement, invoiceNumber: string): void {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression');
    }

    // Copier exactement le contenu et les styles de l'aperçu
    const elementClone = element.cloneNode(true) as HTMLElement;

    // Récupérer tous les styles CSS appliqués
    const allStyles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          console.warn('Impossible d\'accéder aux règles CSS:', e);
          return '';
        }
      })
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${invoiceNumber}</title>
          <meta charset="UTF-8">
          <link href="https://cdn.tailwindcss.com" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
              background: white;
            }

            /* Styles pour l'impression */
            @media print {
              .no-print { display: none !important; }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                margin: 0;
                padding: 10mm;
              }
              * {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              @page {
                margin: 10mm;
                size: A4;
              }
            }

            /* Styles récupérés de la page */
            ${allStyles}
          </style>
        </head>
        <body class="bg-white">
          ${elementClone.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Fermer la fenêtre après impression
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
  }

  // 🚀 MÉTHODE GLOBALE POUR UTILISER VOTRE SCRIPT EXACT
  static async generateWithYourExactScript(): Promise<void> {
    console.log('🚀 GÉNÉRATION PDF AVEC VOTRE SCRIPT EXACT - COHÉRENCE GARANTIE');

    const element = document.querySelector('.facture-apercu') || document.getElementById('invoice');
    if (!element) {
      alert('❌ Élément facture non trouvé. Assurez-vous qu\'une facture est affichée.');
      return;
    }

    // VOTRE CONFIGURATION EXACTE
    const opt = {
      margin: 0,
      filename: 'facture_MYCONFORT.pdf',
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      }
    };

    try {
      console.log('🔄 Génération PDF avec votre script exact...');
      console.log('📐 Configuration utilisée:', opt);
      await html2pdf().set(opt).from(element).save();
      console.log('✅ PDF généré avec succès - COHÉRENCE GARANTIE !');
      alert('✅ PDF téléchargé avec succès ! Le fichier est cohérent avec l\'aperçu.');
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      alert('❌ Erreur lors de la génération du PDF');
    }
  }
}
