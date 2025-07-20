// Données statiques, exemples ou typages

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ClientInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  postalCode?: string;
  siret?: string;
  lodgingType?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  clientName: string;
  clientAddress: string;
  clientPhone?: string;
  clientEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status?: string;
  eventLocation?: string;
}

export const productCategories = ['Matelas', 'Oreillers', 'Couettes', 'Sur-matelas'];


// Données d'exemple pour les clients
export const mockClients: ClientInfo[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    address: '123 Rue de la République',
    city: 'Paris',
    postalCode: '75001',
    phone: '01 23 45 67 89',
    email: 'jean.dupont@email.com'
  },
  {
    id: '2',
    name: 'Marie Martin',
    address: '456 Avenue des Champs',
    city: 'Lyon',
    postalCode: '69000',
    phone: '04 56 78 90 12',
    email: 'marie.martin@email.com'
  }
];

// Données d'exemple pour les factures
export const mockInvoices: Invoice[] = [
  {
    id: 'FAC-001',
    invoiceNumber: 'FAC-2025-001',
    date: new Date().toLocaleDateString('fr-FR'),
    clientName: 'Jean Dupont',
    clientAddress: '123 Rue de la République\n75001 Paris',
    clientPhone: '01 23 45 67 89',
    clientEmail: 'jean.dupont@email.com',
    items: [
      {
        id: '1',
        description: 'Matelas MyComfort Premium 160x200',
        quantity: 1,
        unitPrice: 899.00,
        total: 899.00
      },
      {
        id: '2',
        description: 'Oreiller ergonomique',
        quantity: 2,
        unitPrice: 79.00,
        total: 158.00
      }
    ],
    subtotal: 1057.00,
    tax: 211.40,
    total: 1268.40,
    status: 'draft'
  }
];

// Fonction pour créer une nouvelle facture vide
export function createNewInvoice(): Invoice {
  const currentDate = new Date();
  const invoiceNumber = `FAC-${currentDate.getFullYear()}-${String(Date.now()).slice(-3)}`;
  
  return {
    id: `FAC-${Date.now()}`,
    invoiceNumber: invoiceNumber,
    date: currentDate.toLocaleDateString('fr-FR'),
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft',
    eventLocation: ''
  };
}

// Fonction pour calculer les totaux d'une facture
export function calculateTotals(items: InvoiceItem[]) {
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const tax = subtotal * 0.20; // TVA 20%
  const total = subtotal + tax;
  
  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}
