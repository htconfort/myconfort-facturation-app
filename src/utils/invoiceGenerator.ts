// Générateur de factures HT Confort
import { Invoice, InvoiceItem } from './data';

// Interface pour les données client simplifiées
export interface SimpleClient {
  nom: string;
  email: string;
  adresse: string;
  telephone?: string;
  ville?: string;
  codePostal?: string;
  siret?: string;
}

// Interface pour les articles simplifiés
export interface SimpleItem {
  description: string;
  quantite: number;
  prixUnitaire: number;
  remise?: number;
}

// Fonction principale de création de facture HT Confort
export const createHTConfortInvoice = (
  client: SimpleClient, 
  items: SimpleItem[]
): Invoice => {
  try {
    console.log('🏗️ Création facture HT Confort pour:', client.nom);
    
    // Génération du numéro de facture unique
    const invoiceNumber = generateInvoiceNumber();
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    // Conversion des articles simples en articles de facture
    const invoiceItems: InvoiceItem[] = items.map((item, index) => {
      const remise = item.remise || 0;
      const prixApresRemise = item.prixUnitaire - remise;
      const total = item.quantite * prixApresRemise;
      
      return {
        id: `item-${Date.now()}-${index}`,
        description: item.description,
        quantity: item.quantite,
        unitPrice: prixApresRemise,
        total: total
      };
    });
    
    // Calcul des totaux
    const totals = calculateInvoiceTotals(invoiceItems);
    
    // Construction de l'adresse client complète
    const clientAddress = buildClientAddress(client);
    
    // Création de la facture complète
    const invoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: invoiceNumber,
      date: currentDate,
      clientName: client.nom,
      clientAddress: clientAddress,
      clientPhone: client.telephone || '',
      clientEmail: client.email,
      items: invoiceItems,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      status: 'ready',
      eventLocation: 'HT Confort - Solutions de chauffage'
    };
    
    console.log('✅ Facture HT Confort créée:', invoice.invoiceNumber);
    console.log('💰 Total TTC:', invoice.total.toFixed(2), '€');
    
    return invoice;
    
  } catch (error) {
    console.error('❌ Erreur création facture:', error);
    throw new Error(`Impossible de créer la facture: ${error.message}`);
  }
};

// Fonction de génération de numéro de facture
const generateInvoiceNumber = (): string => {
  const currentYear = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `HTC-${currentYear}-${timestamp}`;
};

// Fonction de calcul des totaux
const calculateInvoiceTotals = (items: InvoiceItem[]) => {
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const tax = subtotal * 0.20; // TVA 20%
  const total = subtotal + tax;
  
  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2))
  };
};

// Fonction de construction de l'adresse client
const buildClientAddress = (client: SimpleClient): string => {
  const addressParts = [
    client.adresse,
    client.codePostal && client.ville ? `${client.codePostal} ${client.ville}` : client.ville || client.codePostal
  ].filter(part => part && part.trim());
  
  return addressParts.join('\n');
};

// Fonction de création rapide avec données par défaut
export const createQuickInvoice = (
  clientName: string,
  clientEmail: string,
  serviceDescription: string,
  price: number
): Invoice => {
  const client: SimpleClient = {
    nom: clientName,
    email: clientEmail,
    adresse: 'Adresse à compléter',
    telephone: 'Téléphone à compléter'
  };
  
  const items: SimpleItem[] = [{
    description: serviceDescription,
    quantite: 1,
    prixUnitaire: price
  }];
  
  return createHTConfortInvoice(client, items);
};

// Fonction de validation des données
export const validateInvoiceData = (client: SimpleClient, items: SimpleItem[]): string[] => {
  const errors: string[] = [];
  
  // Validation client
  if (!client.nom || client.nom.trim() === '') {
    errors.push('Le nom du client est obligatoire');
  }
  
  if (!client.email || !isValidEmail(client.email)) {
    errors.push('Un email valide est obligatoire');
  }
  
  if (!client.adresse || client.adresse.trim() === '') {
    errors.push('L\'adresse du client est obligatoire');
  }
  
  // Validation articles
  if (!items || items.length === 0) {
    errors.push('Au moins un article est obligatoire');
  }
  
  items.forEach((item, index) => {
    if (!item.description || item.description.trim() === '') {
      errors.push(`Description manquante pour l'article ${index + 1}`);
    }
    
    if (!item.quantite || item.quantite <= 0) {
      errors.push(`Quantité invalide pour l'article ${index + 1}`);
    }
    
    if (!item.prixUnitaire || item.prixUnitaire <= 0) {
      errors.push(`Prix unitaire invalide pour l'article ${index + 1}`);
    }
  });
  
  return errors;
};

// Fonction utilitaire de validation email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Fonction de test avec vos données d'exemple
export const testHTConfortInvoice = (): Invoice => {
  const client: SimpleClient = {
    nom: "Dupont SA",
    email: "dupont@example.com",
    adresse: "123 rue Test",
    ville: "Paris",
    codePostal: "75001",
    telephone: "01 23 45 67 89"
  };
  
  const items: SimpleItem[] = [
    {
      description: "Installation chauffage",
      quantite: 1,
      prixUnitaire: 2500
    },
    {
      description: "Maintenance annuelle",
      quantite: 1,
      prixUnitaire: 350
    }
  ];
  
  return createHTConfortInvoice(client, items);
};

// Export des types pour utilisation externe
export type { SimpleClient, SimpleItem };