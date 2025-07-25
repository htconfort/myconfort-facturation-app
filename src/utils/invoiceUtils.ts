// src/utils/invoiceUtils.ts
import { Product, Invoice } from '../types';

export interface InvoicePreviewData {
  invoiceNumber: string;
  invoiceDate: string;
  clientName: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  clientDoorCode?: string;
  clientPhone: string;
  clientEmail: string;
  products: Product[];
  taxRate: number;
  montantAcompte: number;
  signature?: string;
  invoiceNotes?: string;
  eventLocation?: string;
  paymentMethod?: string;
  deliveryMethod?: string;
  deliveryNotes?: string;
  advisorName?: string;
}

export const prepareInvoicePreviewData = (invoice: Invoice): InvoicePreviewData => ({
  invoiceNumber: invoice.invoiceNumber,
  invoiceDate: invoice.invoiceDate,
  clientName: invoice.clientName,
  clientAddress: invoice.clientAddress,
  clientPostalCode: invoice.clientPostalCode,
  clientCity: invoice.clientCity,
  clientDoorCode: invoice.clientDoorCode,
  clientPhone: invoice.clientPhone,
  clientEmail: invoice.clientEmail,
  products: invoice.products,
  taxRate: invoice.taxRate,
  montantAcompte: invoice.montantAcompte,
  signature: invoice.signature,
  invoiceNotes: invoice.invoiceNotes,
  eventLocation: invoice.eventLocation,
  paymentMethod: invoice.paymentMethod,
  deliveryMethod: invoice.deliveryMethod,
  deliveryNotes: invoice.deliveryNotes,
  advisorName: invoice.advisorName,
});

export const calculateProductTotal = (
  quantity: number,
  priceTTC: number,
  discount: number,
  discountType: 'percent' | 'fixed'
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

export const calculateInvoiceTotals = (
  products: Product[], 
  taxRate: number, 
  depositAmount: number = 0
) => {
  const totals = products.reduce((acc, product) => {
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
  }, { totalHT: 0, totalTTC: 0, totalDiscount: 0 });

  const taxAmount = totals.totalTTC - totals.totalHT;
  const totalPercu = depositAmount;
  const totalARecevoir = Math.max(0, totals.totalTTC - depositAmount);

  return {
    totalHT: totals.totalHT,
    totalTTC: totals.totalTTC,
    totalTVA: taxAmount,
    totalDiscount: totals.totalDiscount,
    taxAmount,
    totalPercu,
    totalARecevoir
  };
};

export const formatCurrency = (amount: number): string => 
  Number(amount).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Constantes de l'entreprise
export const COMPANY_INFO = {
  name: 'MYCONFORT',
  description: 'Votre spécialiste en matelas et literie de qualité',
  address: '88 Avenue des Ternes',
  postalCode: '75017',
  city: 'Paris',
  phone: '04 68 50 41 45',
  email: 'myconfort@gmail.com',
  website: 'https://www.htconfort.com',
  siret: '824 313 530 00027'
};

// Classes CSS pour l'aperçu de facture
export const INVOICE_PREVIEW_CLASSES = {
  container: 'facture-apercu ultra-compact'
};

// Fonction pour formater les dates
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};
