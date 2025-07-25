import React, { useState } from 'react';
import { InvoicePreview } from '../components/InvoicePreview_new';
import { ConditionsGenerales } from '../components/ConditionsGenerales';
import { PDFActions } from '../components/PDFActions';
import { Invoice, Product } from '../types';
import { prepareInvoicePreviewData } from '../utils/invoiceUtils';

// 🎯 Données de test pour la démonstration
const sampleInvoice: Invoice = {
  invoiceNumber: 'FAC-2025-001',
  invoiceDate: '2025-01-15',
  eventLocation: 'Salon MyConfort - Paris',
  taxRate: 20,
  
  // Client
  clientName: 'Jean Dupont',
  clientEmail: 'jean.dupont@example.com',
  clientPhone: '01 23 45 67 89',
  clientAddress: '123 Rue de la Paix',
  clientPostalCode: '75001',
  clientCity: 'Paris',
  clientDoorCode: 'A1234',
  
  // Produits
  products: [
    {
      name: 'Matelas MyConfort Premium 160x200',
      quantity: 1,
      priceHT: 749.17,
      priceTTC: 899.00,
      discount: 50,
      discountType: 'fixed' as const,
      totalHT: 707.64,
      totalTTC: 849.00
    },
    {
      name: 'Oreiller ergonomique MyConfort',
      quantity: 2,
      priceHT: 66.58,
      priceTTC: 79.90,
      discount: 10,
      discountType: 'percent' as const,
      totalHT: 119.84,
      totalTTC: 143.82
    },
    {
      name: 'Protège-matelas imperméable',
      quantity: 1,
      priceHT: 41.58,
      priceTTC: 49.90,
      discount: 0,
      discountType: 'fixed' as const,
      totalHT: 41.58,
      totalTTC: 49.90
    }
  ] as Product[],
  
  // Montants (calculés automatiquement)
  montantHT: 0,
  montantTTC: 0,
  montantTVA: 0,
  montantRemise: 0,
  
  // Paiement
  paymentMethod: 'Carte bancaire',
  montantAcompte: 200,
  montantRestant: 0,
  
  // Livraison
  deliveryMethod: 'Livraison standard',
  deliveryNotes: 'Livraison au pied de l\'immeuble',
  
  // Signature (simulation d'une signature)
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  isSigned: true,
  
  // Notes
  invoiceNotes: 'Merci pour votre achat ! N\'hésitez pas à nous contacter pour toute question.',
  advisorName: 'Marie Martin',
  termsAccepted: true,
  
  // Métadonnées
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const PDFDemoPage: React.FC = () => {
  const [invoice] = useState<Invoice>(sampleInvoice);

  const handleUploadToDrive = async (base64: string, filename: string) => {
    // Simulation de l'upload
    console.log(`📤 Upload simulé vers Google Drive: ${filename} (${base64.length} chars)`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation délai
    alert('✅ PDF sauvegardé sur Google Drive (simulation)');
  };

  return (
    <div className="pdf-demo-page min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🧪 Demo: Module PDF MyConfort
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Test du nouveau système PDF unifié : Aperçu → PDF → Actions
            </p>
          </div>
          
          {/* Boutons d'action principaux */}
          <PDFActions 
            invoice={invoice} 
            onUploadToDrive={handleUploadToDrive}
            className="gap-2"
          />
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne 1 & 2: Aperçu de la facture */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  📄 Aperçu de la facture
                </h2>
                <div className="text-sm text-gray-500">
                  Ce que vous voyez = ce qui sera dans le PDF
                </div>
              </div>
              
              {/* Aperçu de la facture */}
              <div className="border rounded-lg overflow-hidden">
                <InvoicePreview 
                  invoice={prepareInvoicePreviewData(invoice)} 
                  className="transform scale-90 origin-top"
                />
              </div>
            </div>
          </div>

          {/* Colonne 3: Informations et actions */}
          <div className="space-y-6">
            
            {/* Informations sur le PDF */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ℹ️ Informations PDF
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Facture:</span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{invoice.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Produits:</span>
                  <span className="font-medium">{invoice.products.length} articles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Signature:</span>
                  <span className="font-medium">{invoice.isSigned ? '✅ Signée' : '❌ Non signée'}</span>
                </div>
              </div>
            </div>

            {/* Fonctionnalités disponibles */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🚀 Fonctionnalités
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Génération PDF 2 pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Page 1: Facture avec signature</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Page 2: Conditions générales</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Téléchargement direct</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Impression navigateur</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Upload Google Drive</span>
                </div>
              </div>
            </div>

            {/* Architecture technique */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🏗️ Architecture
              </h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div>• <code>generateInvoicePDF.ts</code> - Module central</div>
                <div>• <code>html2canvas</code> - Capture HTML → Image</div>
                <div>• <code>jsPDF</code> - Assemblage PDF multipage</div>
                <div>• <code>PDFActions.tsx</code> - Boutons unifiés</div>
                <div>• <code>InvoicePreview.tsx</code> - Aperçu WYSIWYG</div>
                <div>• Zéro dépendance circulaire ✨</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CGV cachées pour capture PDF (ne pas supprimer !) */}
      <div style={{ display: 'none' }}>
        <ConditionsGenerales />
      </div>
    </div>
  );
};
