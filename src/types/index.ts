export interface Client {
  id?: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  housingType?: string;
  doorCode?: string;
  phone: string;
  email: string;
  siret?: string;
  createdAt?: string;
  invoices?: string[];
}

export interface Product {
  name: string;
  quantity: number;
  priceHT: number;
  priceTTC: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  totalHT: number;
  totalTTC: number;
}

export interface ProductCatalog {
  category: string;
  name: string;
  price?: number;
  priceTTC: number;
  autoCalculateHT?: boolean;
}

export interface DeliveryInfo {
  method: string;
  notes: string;
}

export interface PaymentInfo {
  method: string;
  depositAmount: number;
}

export interface Invoice {
  // Informations de base
  invoiceNumber: string;
  invoiceDate: string;
  eventLocation?: string;
  
  // Client - Structure plate pour compatibilité webhook
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  
  // Produits
  products: Product[];
  
  // Montants (calculés et stockés)
  montantHT: number;
  montantTTC: number;
  montantTVA: number;
  montantRemise: number;
  taxRate: number;
  
  // Paiement
  paymentMethod: string;
  montantAcompte: number;
  montantRestant: number;
  
  // Livraison
  deliveryMethod: string;
  
  // Signature
  signature?: string;
  isSigned: boolean;
  signatureDate?: string;
  
  // Notes
  invoiceNotes?: string;
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

export type ToastType = 'success' | 'error';

export interface ValidationError {
  field: string;
  message: string;
}
