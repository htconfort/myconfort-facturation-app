/**
 * 🔄 ADAPTATEUR TEMPORAIRE - COMPATIBILITÉ TYPES
 * =============================================
 * Bridge entre InvoicePreviewData et Invoice pour maintenir
 * la compatibilité avec les services existants
 */

import { InvoicePreviewData } from '../shared/invoiceUtils';
import { Invoice } from '../types';

/**
 * Convertit InvoicePreviewData vers Invoice pour compatibilité temporaire
 * avec les services existants (AdvancedPDFService, GoogleDriveService, etc.)
 */
export const convertPreviewDataToInvoice = (previewData: InvoicePreviewData): Invoice => {
  return {
    // Champs principaux
    invoiceNumber: previewData.invoiceNumber,
    invoiceDate: previewData.invoiceDate,
    eventLocation: previewData.eventLocation || '',
    taxRate: previewData.taxRate,
    
    // Structure plate pour le client (format actuel)
    clientName: previewData.clientName,
    clientEmail: previewData.clientEmail,
    clientPhone: previewData.clientPhone,
    clientAddress: previewData.clientAddress,
    clientPostalCode: previewData.clientPostalCode,
    clientCity: previewData.clientCity,
    clientDoorCode: previewData.clientDoorCode || '',
    
    // Produits
    products: previewData.products,
    
    // Montants - calculés à partir des produits
    montantHT: 0, // Sera calculé par les services
    montantTTC: 0, // Sera calculé par les services
    montantTVA: 0, // Sera calculé par les services
    montantRemise: 0, // Sera calculé par les services
    
    // Paiement
    paymentMethod: previewData.paymentMethod || '',
    montantAcompte: previewData.montantAcompte,
    montantRestant: 0, // Sera calculé
    
    // Livraison
    deliveryMethod: previewData.deliveryMethod || '',
    deliveryNotes: previewData.deliveryNotes || '',
    
    // Signature
    signature: previewData.signature || '',
    isSigned: !!previewData.signature,
    
    // Notes et conseiller
    invoiceNotes: previewData.invoiceNotes || '',
    advisorName: previewData.advisorName || '',
    termsAccepted: previewData.termsAccepted || false,
    
    // Métadonnées
    createdAt: previewData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Version inverse - convertit Invoice vers InvoicePreviewData
 */
export const convertInvoiceToPreviewData = (invoice: Invoice): InvoicePreviewData => {
  return {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    eventLocation: invoice.eventLocation,
    
    // Client
    clientName: invoice.clientName,
    clientAddress: invoice.clientAddress,
    clientPostalCode: invoice.clientPostalCode,
    clientCity: invoice.clientCity,
    clientDoorCode: invoice.clientDoorCode,
    clientPhone: invoice.clientPhone,
    clientEmail: invoice.clientEmail,
    
    // Produits et montants
    products: invoice.products,
    taxRate: invoice.taxRate,
    montantAcompte: invoice.montantAcompte,
    
    // Paiement et livraison
    paymentMethod: invoice.paymentMethod,
    deliveryMethod: invoice.deliveryMethod,
    deliveryNotes: invoice.deliveryNotes,
    
    // Signature et notes
    signature: invoice.signature,
    invoiceNotes: invoice.invoiceNotes,
    advisorName: invoice.advisorName,
    
    // Métadonnées
    createdAt: invoice.createdAt,
    isSigned: invoice.isSigned,
    termsAccepted: invoice.termsAccepted,
  };
};
