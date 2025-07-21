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
  id?: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  priceTTC: number;
  discount: number;
  discountType: 'percentage' | 'amount'; // Mis à jour pour correspondre au JSON de l'utilisateur
  autoCalculateHT?: boolean;
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
  invoiceNumber: string;
  invoiceDate: string;
  eventLocation: string;
  advisorName: string;
  invoiceNotes: string; // Mappe à 'notes' dans le JSON
  termsAccepted: boolean;
  taxRate: number; // Mappe à 'tva' dans le JSON
  client: Client;
  delivery: DeliveryInfo;
  payment: PaymentInfo;
  products: Product[];
  signature?: string; // Pour l'URL de l'image de signature
  isSigned: boolean; // Nouveau champ pour le statut booléen de la signature
  montant_ht?: number; // Nouveau champ, sera calculé
  montant_ttc?: number; // Nouveau champ, sera calculé
  description_travaux: string; // Nouveau champ
  fichier_facture?: string; // Nouveau champ pour le PDF en base64
  dueDate?: string; // Nouveau champ pour 'date_echeance'
  status?: string; // Nouveau champ pour 'statut'
}

export type ToastType = 'success' | 'error';

export interface ValidationError {
  field: string;
  message: string;
}
