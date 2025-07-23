import { Product, Invoice } from '../types';
import { calculateProductTotal } from './calculations';

export const calculateInvoiceTotals = (
  products: Product[], 
  taxRate: number, 
  depositAmount: number = 0
): Pick<Invoice, 'montantHT' | 'montantTTC' | 'montantTVA' | 'montantRemise' | 'montantAcompte' | 'montantRestant'> => {
  
  // Calculer les totaux des produits
  const totals = products.reduce((acc, product) => {
    const totalProductTTC = calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType === 'percentage' ? 'percent' : 'fixed'
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
  
  const montantTVA = totals.totalTTC - totals.totalHT;
  const montantRestant = totals.totalTTC - depositAmount;
  
  return {
    montantHT: totals.totalHT,
    montantTTC: totals.totalTTC,
    montantTVA: montantTVA,
    montantRemise: totals.totalDiscount,
    montantAcompte: depositAmount,
    montantRestant: montantRestant
  };
};

export const calculateProductTotals = (product: Omit<Product, 'totalHT' | 'totalTTC'>, taxRate: number): Pick<Product, 'totalHT' | 'totalTTC'> => {
  const totalTTC = calculateProductTotal(
    product.quantity,
    product.priceTTC,
    product.discount,
    product.discountType === 'percentage' ? 'percent' : 'fixed'
  );
  
  const totalHT = totalTTC / (1 + (taxRate / 100));
  
  return {
    totalHT,
    totalTTC
  };
};
