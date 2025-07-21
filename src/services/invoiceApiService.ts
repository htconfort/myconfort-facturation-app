import { Invoice } from '../types';
import { PDFService } from './pdfService';
import { calculateHT, calculateProductTotal } from '../utils/calculations';

/**
 * Convertit un Blob en chaîne Base64.
 * @param blob Le Blob à convertir.
 * @returns Une promesse qui résout avec la chaîne Base64.
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Supprimer le préfixe "data:application/pdf;base64,"
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert blob to base64 string.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Prépare le payload JSON complet pour l'envoi de la facture.
 * Inclut la conversion du PDF en base64.
 * @param invoice L'objet Invoice complet.
 * @param pdfBlob Le Blob du PDF généré.
 * @returns Une promesse qui résout avec l'objet JSON prêt à être envoyé.
 */
export const prepareInvoicePayload = async (invoice: Invoice, pdfBlob: Blob): Promise<any> => {
  const fichier_facture_base64 = await blobToBase64(pdfBlob);

  // Recalculer les totaux pour s'assurer de la cohérence avec le JSON
  const montant_ht = invoice.products.reduce((sum, product) => {
    return sum + (product.quantity * calculateHT(product.priceTTC, invoice.taxRate));
  }, 0);

  const montant_ttc = invoice.products.reduce((sum, product) => {
    return sum + calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType
    );
  }, 0);

  return {
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.client.name,
    clientEmail: invoice.client.email,
    clientPhone: invoice.client.phone,
    clientAddress: `${invoice.client.address}, ${invoice.client.postalCode} ${invoice.client.city}`,
    advisorName: invoice.advisorName,
    invoiceDate: invoice.invoiceDate,
    products: invoice.products.map(product => ({
      name: product.name,
      quantity: product.quantity,
      priceTTC: product.priceTTC,
      discount: product.discount,
      discountType: product.discountType,
    })),
    montant_ht: parseFloat(montant_ht.toFixed(2)),
    tva: invoice.taxRate,
    montant_ttc: parseFloat(montant_ttc.toFixed(2)),
    description_travaux: invoice.description_travaux,
    signature: invoice.isSigned, // Utilise le nouveau champ booléen
    fichier_facture: fichier_facture_base64,
    acompte: invoice.payment.depositAmount,
    date_echeance: invoice.dueDate,
    eventLocation: invoice.eventLocation,
    statut: invoice.status || 'non défini', // Valeur par défaut si non spécifié
    notes: invoice.invoiceNotes,
  };
};

/**
 * Envoie le payload JSON de la facture à un webhook.
 * @param payload L'objet JSON de la facture à envoyer.
 * @param webhookUrl L'URL du webhook (par exemple, votre workflow n8n).
 * @returns Une promesse qui résout avec la réponse de la requête.
 */
export const sendInvoice = async (payload: any, webhookUrl: string): Promise<Response> => {
  console.log('📤 Envoi de la facture au webhook:', webhookUrl);
  console.log('📦 Payload envoyé:', payload); // This console.log is already here!

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur lors de l\'envoi de la facture:', response.status, errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    console.log('✅ Facture envoyée avec succès !', response.statusText);
    return response;
  } catch (error) {
    console.error('❌ Erreur réseau ou autre lors de l\'envoi de la facture:', error);
    throw error;
  }
};
