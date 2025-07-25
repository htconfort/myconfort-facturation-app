/**
 * 🔧 MODULE PARTAGÉ - LOGIQUE MÉTIER FACTURES
 * ==========================================
 * Calculs, helpers et types pour les factures
 * ZÉRO dépendance circulaire - Module indépendant
 */

import { Product, Invoice } from '../types';

// 📋 Interface pour l'aperçu de facture (données minimales nécessaires)
export interface InvoicePreviewData {
  invoiceNumber: string;
  invoiceDate: string;
  eventLocation?: string;
  
  // Informations client
  clientName: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  clientDoorCode?: string;
  clientPhone: string;
  clientEmail: string;
  
  // Produits et calculs
  products: Product[];
  taxRate: number;
  montantAcompte: number;
  
  // Paiement et livraison
  paymentMethod?: string;
  deliveryMethod?: string;
  deliveryNotes?: string;
  
  // Signature et notes
  signature?: string;
  invoiceNotes?: string;
  advisorName?: string;
  
  // Métadonnées
  createdAt?: string;
  isSigned?: boolean;
  termsAccepted?: boolean;
}

// 🔄 Fonction de préparation des données pour l'aperçu
export const prepareInvoicePreviewData = (invoice: Invoice): InvoicePreviewData => ({
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
});

// 💰 Calcul du total d'un produit avec remise
export const calculateProductTotal = (
  quantity: number,
  priceTTC: number,
  discount: number = 0,
  discountType: 'percent' | 'fixed' = 'percent'
): number => {
  let productTotal = priceTTC * quantity;
  
  if (discount > 0) {
    if (discountType === 'percent') {
      productTotal -= productTotal * (discount / 100);
    } else {
      productTotal -= discount * quantity;
    }
  }
  
  return Math.max(0, productTotal);
};

// 📊 Interface pour les totaux calculés
export interface InvoiceTotals {
  totalHT: number;
  totalTTC: number;
  totalTVA: number;
  totalDiscount: number;
  totalPercu: number;      // Acompte versé
  totalARecevoir: number;  // Reste à payer
}

// 🧮 Calcul des totaux complets de la facture
export const calculateInvoiceTotals = (
  products: Product[], 
  taxRate: number, 
  depositAmount: number = 0
): InvoiceTotals => {
  const productTotals = products.reduce((acc, product) => {
    const totalProductTTC = calculateProductTotal(
      product.quantity, 
      product.priceTTC, 
      product.discount, 
      product.discountType === 'percent' ? 'percent' : 'fixed'
    );
    
    const totalProductHT = totalProductTTC / (1 + (taxRate / 100));
    const originalTotal = product.priceTTC * product.quantity;
    const discountAmount = originalTotal - totalProductTTC;
    
    return {
      totalHT: acc.totalHT + totalProductHT,
      totalTTC: acc.totalTTC + totalProductTTC,
      totalDiscount: acc.totalDiscount + discountAmount
    };
  }, { 
    totalHT: 0, 
    totalTTC: 0, 
    totalDiscount: 0 
  });

  const taxAmount = productTotals.totalTTC - productTotals.totalHT;
  const totalPercu = depositAmount;
  const totalARecevoir = Math.max(0, productTotals.totalTTC - depositAmount);

  return {
    totalHT: productTotals.totalHT,
    totalTTC: productTotals.totalTTC,
    totalTVA: taxAmount,
    totalDiscount: productTotals.totalDiscount,
    totalPercu,
    totalARecevoir
  };
};

// 💶 Formatage monétaire français
export const formatCurrency = (amount: number): string => 
  Number(amount).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// 📅 Formatage de date français
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// ✅ Validation des données de facture
export const validateInvoiceData = (invoice: InvoicePreviewData): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Vérifications obligatoires
  if (!invoice.invoiceNumber?.trim()) errors.push('Numéro de facture manquant');
  if (!invoice.invoiceDate?.trim()) errors.push('Date de facture manquante');
  if (!invoice.clientName?.trim()) errors.push('Nom du client manquant');
  if (!invoice.clientEmail?.trim()) errors.push('Email du client manquant');
  if (!invoice.clientPhone?.trim()) errors.push('Téléphone du client manquant');
  if (!invoice.clientAddress?.trim()) errors.push('Adresse du client manquante');
  if (!invoice.products || invoice.products.length === 0) errors.push('Aucun produit');

  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (invoice.clientEmail && !emailRegex.test(invoice.clientEmail)) {
    errors.push('Format email invalide');
  }

  // Validation produits
  invoice.products?.forEach((product, index) => {
    if (!product.name?.trim()) errors.push(`Produit ${index + 1}: nom manquant`);
    if (product.quantity <= 0) errors.push(`Produit ${index + 1}: quantité invalide`);
    if (product.priceTTC <= 0) errors.push(`Produit ${index + 1}: prix invalide`);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🏷️ Génération du nom de fichier PDF
export const generatePDFFileName = (invoiceNumber: string): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `facture-myconfort-${invoiceNumber}-${timestamp}.pdf`;
};

// 📋 Préparation des données pour N8N/Webhook
export interface InvoiceWebhookData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  totalTTC: number;
  totalHT: number;
  products: Array<{
    name: string;
    quantity: number;
    priceTTC: number;
    totalTTC: number;
  }>;
  paymentMethod?: string;
  signature?: string;
  createdAt: string;
}

export const prepareWebhookData = (invoice: InvoicePreviewData): InvoiceWebhookData => {
  const totals = calculateInvoiceTotals(invoice.products, invoice.taxRate, invoice.montantAcompte);
  
  return {
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    clientPhone: invoice.clientPhone,
    totalTTC: totals.totalTTC,
    totalHT: totals.totalHT,
    products: invoice.products.map(product => ({
      name: product.name,
      quantity: product.quantity,
      priceTTC: product.priceTTC,
      totalTTC: calculateProductTotal(
        product.quantity, 
        product.priceTTC, 
        product.discount, 
        product.discountType === 'percent' ? 'percent' : 'fixed'
      )
    })),
    paymentMethod: invoice.paymentMethod,
    signature: invoice.signature,
    createdAt: invoice.createdAt || new Date().toISOString()
  };
};

// 🎨 Classes CSS par défaut pour l'aperçu
export const INVOICE_PREVIEW_CLASSES = {
  container: 'facture-apercu ultra-compact',
  header: 'invoice-header-compact',
  clientSection: 'client-grid-compact',
  productsTable: 'products-table',
  totalSection: 'totals',
  signatureBox: 'signature-box',
  footer: 'footer'
} as const;

// 💼 Informations de l'entreprise (constantes)
export const COMPANY_INFO = {
  name: 'MYCONFORT',
  address: '88 Avenue des Ternes',
  postalCode: '75017',
  city: 'Paris',
  country: 'France',
  phone: '04 68 50 41 45',
  email: 'myconfort@gmail.com',
  website: 'https://www.htconfort.com',
  siret: '824 313 530 00027',
  description: 'Votre spécialiste en matelas et literie de qualité'
} as const;
