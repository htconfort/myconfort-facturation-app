import { z } from 'zod';
import { Invoice } from '../types';

// 📋 SCHÉMA DE VALIDATION STRICT POUR LE PAYLOAD N8N
export const InvoicePayloadSchema = z.object({
  // Informations facture (obligatoires)
  invoiceNumber: z.string().min(1, "Numéro de facture obligatoire"),
  invoiceDate: z.string().min(1, "Date de facture obligatoire"),
  eventLocation: z.string().min(1, "Lieu d'événement obligatoire"),
  
  // Informations client (toutes obligatoires)
  clientName: z.string().min(1, "Nom client obligatoire"),
  clientEmail: z.string().email("Email client invalide"),
  clientPhone: z.string().min(1, "Téléphone client obligatoire"),
  clientAddress: z.string().min(1, "Adresse client obligatoire"),
  clientCity: z.string().min(1, "Ville client obligatoire"),
  clientPostalCode: z.string().min(1, "Code postal client obligatoire"),
  clientHousingType: z.string().min(1, "Type de logement obligatoire"),
  clientDoorCode: z.string().min(1, "Code porte obligatoire"),
  clientSiret: z.string().optional(),
  
  // Informations conseiller
  advisorName: z.string().min(1, "Nom conseiller obligatoire"),
  
  // Produits (au moins un)
  products: z.array(z.object({
    name: z.string().min(1, "Nom produit obligatoire"),
    category: z.string().min(1, "Catégorie produit obligatoire"),
    quantity: z.number().min(1, "Quantité doit être >= 1"),
    unitPriceHT: z.number().min(0, "Prix HT doit être >= 0"),
    unitPriceTTC: z.number().min(0, "Prix TTC doit être >= 0"),
    discount: z.number().min(0, "Remise doit être >= 0"),
    discountType: z.enum(['percentage', 'amount'], {
      errorMap: () => ({ message: "Type de remise doit être 'percentage' ou 'amount'" })
    }),
    totalTTC: z.number().min(0, "Total TTC doit être >= 0")
  })).min(1, "Au moins un produit obligatoire"),
  
  // Totaux calculés
  totalHT: z.number().min(0, "Total HT doit être >= 0"),
  totalTTC: z.number().min(0, "Total TTC doit être >= 0"),
  totalTVA: z.number().min(0, "Total TVA doit être >= 0"),
  taxRate: z.number().min(0, "Taux TVA doit être >= 0"),
  
  // Paiement
  paymentMethod: z.string().min(1, "Méthode de paiement obligatoire"),
  depositAmount: z.number().min(0, "Montant acompte doit être >= 0"),
  remainingAmount: z.number().min(0, "Montant restant doit être >= 0"),
  
  // Livraison
  deliveryMethod: z.string().optional(),
  deliveryNotes: z.string().optional(),
  
  // Métadonnées
  invoiceNotes: z.string().optional(),
  termsAccepted: z.boolean(),
  signature: z.string().optional(),
  
  // PDF (base64)
  pdfBase64: z.string().min(1, "PDF base64 obligatoire"),
  pdfSizeKB: z.number().min(0, "Taille PDF doit être >= 0"),
  
  // Timestamps
  generatedAt: z.string(),
  generatedTimestamp: z.number()
});

export type ValidatedInvoicePayload = z.infer<typeof InvoicePayloadSchema>;

// 🔍 LOGGER DÉTAILLÉ POUR LE PAYLOAD
export class PayloadLogger {
  private static logToConsole(payload: any, errors?: z.ZodError): void {
    console.group('📋 PAYLOAD N8N - ANALYSE DÉTAILLÉE');
    
    // Log du payload brut
    console.log('📦 PAYLOAD BRUT ENVOYÉ:', JSON.stringify(payload, null, 2));
    
    // Vérification des champs obligatoires
    console.group('🔍 VÉRIFICATION CHAMPS OBLIGATOIRES');
    const requiredFields = [
      'invoiceNumber', 'invoiceDate', 'eventLocation',
      'clientName', 'clientEmail', 'clientPhone', 'clientAddress',
      'advisorName', 'products', 'totalTTC', 'paymentMethod', 'pdfBase64'
    ];
    
    requiredFields.forEach(field => {
      const value = payload[field];
      const isEmpty = !value || (Array.isArray(value) && value.length === 0) || value === '';
      console.log(`${isEmpty ? '❌' : '✅'} ${field}:`, isEmpty ? 'MANQUANT' : '✓');
    });
    console.groupEnd();
    
    // Log des erreurs de validation
    if (errors) {
      console.group('❌ ERREURS DE VALIDATION');
      errors.errors.forEach(error => {
        console.error(`• ${error.path.join('.')}: ${error.message}`);
      });
      console.groupEnd();
    }
    
    // Statistiques du payload
    console.group('📊 STATISTIQUES PAYLOAD');
    console.log('• Taille JSON:', JSON.stringify(payload).length, 'caractères');
    console.log('• Nombre de produits:', payload.products?.length || 0);
    console.log('• Taille PDF:', payload.pdfSizeKB || 0, 'KB');
    console.log('• Signature présente:', !!payload.signature);
    console.groupEnd();
    
    console.groupEnd();
  }
  
  private static logToFile(payload: any, errors?: z.ZodError): void {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        payload: payload,
        validation: {
          isValid: !errors,
          errors: errors?.errors || []
        },
        stats: {
          jsonSize: JSON.stringify(payload).length,
          productsCount: payload.products?.length || 0,
          pdfSizeKB: payload.pdfSizeKB || 0,
          hasSignature: !!payload.signature
        }
      };
      
      // Simuler l'écriture de fichier (dans un vrai environnement, utiliser fs)
      console.log('📁 LOG FICHIER (simulation):', JSON.stringify(logData, null, 2));
      
      // Dans un environnement Node.js réel, vous pourriez faire :
      // fs.writeFileSync(`logs/payload-${Date.now()}.json`, JSON.stringify(logData, null, 2));
      
    } catch (error) {
      console.error('❌ Erreur écriture log fichier:', error);
    }
  }
  
  static logPayload(payload: any, errors?: z.ZodError): void {
    this.logToConsole(payload, errors);
    this.logToFile(payload, errors);
  }
}

// 🧹 NETTOYEUR DE PAYLOAD
export class PayloadSanitizer {
  static sanitizePayload(invoice: Invoice, pdfBase64: string, pdfSizeKB: number): ValidatedInvoicePayload {
    console.log('🧹 NETTOYAGE ET PRÉPARATION DU PAYLOAD');
    
    // Calculer les totaux
    const products = invoice.products.map(product => {
      const unitPriceHT = product.priceTTC / (1 + (invoice.taxRate / 100));
      const totalTTC = product.quantity * product.priceTTC * (1 - (product.discount / 100));
      
      return {
        name: product.name.trim(),
        category: product.category.trim(),
        quantity: product.quantity,
        unitPriceHT: Math.round(unitPriceHT * 100) / 100,
        unitPriceTTC: product.priceTTC,
        discount: product.discount,
        discountType: product.discountType,
        totalTTC: Math.round(totalTTC * 100) / 100
      };
    });
    
    const totalTTC = products.reduce((sum, p) => sum + p.totalTTC, 0);
    const totalHT = totalTTC / (1 + (invoice.taxRate / 100));
    const totalTVA = totalTTC - totalHT;
    const depositAmount = invoice.payment.depositAmount || 0;
    const remainingAmount = totalTTC - depositAmount;
    
    // Construire le payload nettoyé
    const cleanPayload = {
      // Informations facture
      invoiceNumber: invoice.invoiceNumber.trim(),
      invoiceDate: invoice.invoiceDate,
      eventLocation: invoice.eventLocation.trim(),
      
      // Informations client (nettoyées)
      clientName: invoice.client.name.trim(),
      clientEmail: invoice.client.email.trim().toLowerCase(),
      clientPhone: invoice.client.phone.trim(),
      clientAddress: invoice.client.address.trim(),
      clientCity: invoice.client.city.trim(),
      clientPostalCode: invoice.client.postalCode.trim(),
      clientHousingType: invoice.client.housingType?.trim() || '',
      clientDoorCode: invoice.client.doorCode?.trim() || '',
      clientSiret: invoice.client.siret?.trim(),
      
      // Conseiller
      advisorName: invoice.advisorName?.trim() || 'MYCONFORT',
      
      // Produits
      products: products,
      
      // Totaux (arrondis à 2 décimales)
      totalHT: Math.round(totalHT * 100) / 100,
      totalTTC: Math.round(totalTTC * 100) / 100,
      totalTVA: Math.round(totalTVA * 100) / 100,
      taxRate: invoice.taxRate,
      
      // Paiement
      paymentMethod: invoice.payment.method.trim(),
      depositAmount: Math.round(depositAmount * 100) / 100,
      remainingAmount: Math.round(remainingAmount * 100) / 100,
      
      // Livraison
      deliveryMethod: invoice.delivery.method?.trim(),
      deliveryNotes: invoice.delivery.notes?.trim(),
      
      // Métadonnées
      invoiceNotes: invoice.invoiceNotes?.trim(),
      termsAccepted: invoice.termsAccepted,
      signature: invoice.signature?.trim(),
      
      // PDF
      pdfBase64: pdfBase64,
      pdfSizeKB: pdfSizeKB,
      
      // Timestamps
      generatedAt: new Date().toISOString(),
      generatedTimestamp: Date.now()
    };
    
    console.log('✅ Payload nettoyé et préparé');
    return cleanPayload;
  }
}

// 🔐 VALIDATEUR PRINCIPAL
export class PayloadValidator {
  static validateAndPrepare(invoice: Invoice, pdfBase64: string, pdfSizeKB: number): {
    isValid: boolean;
    payload?: ValidatedInvoicePayload;
    errors?: string[];
  } {
    try {
      console.log('🔐 VALIDATION DU PAYLOAD AVANT ENVOI N8N');
      
      // 1. Nettoyer le payload
      const cleanPayload = PayloadSanitizer.sanitizePayload(invoice, pdfBase64, pdfSizeKB);
      
      // 2. Valider avec le schéma Zod
      const validationResult = InvoicePayloadSchema.safeParse(cleanPayload);
      
      if (validationResult.success) {
        console.log('✅ VALIDATION RÉUSSIE - Payload prêt pour envoi');
        PayloadLogger.logPayload(validationResult.data);
        
        return {
          isValid: true,
          payload: validationResult.data
        };
      } else {
        console.error('❌ VALIDATION ÉCHOUÉE');
        PayloadLogger.logPayload(cleanPayload, validationResult.error);
        
        const errors = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        return {
          isValid: false,
          errors: errors
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error);
      return {
        isValid: false,
        errors: [`Erreur de validation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`]
      };
    }
  }
}