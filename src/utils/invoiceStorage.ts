// Système de sauvegarde des factures
export interface Invoice {
  id: string;
  clientName: string;
  clientAddress: string;
  clientPhone?: string;
  clientEmail?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  date: string;
  invoiceNumber: string;
}

// Fonction de sauvegarde des factures
export const saveInvoiceToFile = (invoice: Invoice) => {
  try {
    // Sauvegarde dans localStorage
    const invoices = JSON.parse(localStorage.getItem('factures') || '[]');
    invoices.push(invoice);
    localStorage.setItem('factures', JSON.stringify(invoices));
    
    // Utiliser l'API File System de Bolt si disponible
    if (typeof window !== 'undefined' && (window as any).fs) {
      try {
        (window as any).fs.writeFile('factures.json', JSON.stringify(invoices, null, 2));
        console.log('Facture sauvegardée dans le fichier factures.json');
      } catch (fsError) {
        console.warn('Erreur API File System:', fsError);
      }
    }
    
    console.log('Facture sauvegardée avec succès:', invoice.invoiceNumber);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return false;
  }
};

// Fonction pour récupérer toutes les factures
export const getAllInvoices = (): Invoice[] => {
  try {
    return JSON.parse(localStorage.getItem('factures') || '[]');
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return [];
  }
};

// Fonction pour supprimer une facture
export const deleteInvoice = (invoiceId: string): boolean => {
  try {
    const invoices = getAllInvoices();
    const filteredInvoices = invoices.filter(inv => inv.id !== invoiceId);
    localStorage.setItem('factures', JSON.stringify(filteredInvoices));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return false;
  }
};

// Fonction pour générer un numéro de facture unique
export const generateInvoiceNumber = (): string => {
  const invoices = getAllInvoices();
  const currentYear = new Date().getFullYear();
  const yearInvoices = invoices.filter(inv => 
    inv.invoiceNumber.startsWith(`${currentYear}`)
  );
  const nextNumber = yearInvoices.length + 1;
  return `${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
};