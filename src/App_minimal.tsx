import React, { useState } from 'react';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { Toast } from './components/ui/Toast';
import { Invoice, ToastType } from './types';
import { generateInvoiceNumber } from './utils/calculations';
import { AdvancedPDFService } from './services/advancedPdfService';

function App() {
  // État minimal pour tester l'aperçu PDF
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString().split('T')[0],
    eventLocation: 'Test Event Location',
    invoiceNotes: 'Notes de test',
    taxRate: 20,
    
    // Client info - structure plate
    clientName: 'Client Test',
    clientEmail: 'test@example.com',
    clientPhone: '0123456789',
    clientAddress: '123 Rue Test',
    clientPostalCode: '75001',
    clientCity: 'Paris',
    
    // Produits et montants
    products: [
      {
        name: 'Produit Test',
        quantity: 1,
        priceHT: 100.00,
        priceTTC: 120.00,
        discount: 0,
        discountType: 'percentage' as const,
        totalHT: 100.00,
        totalTTC: 120.00
      }
    ],
    montantHT: 100.00,
    montantTTC: 120.00,
    montantTVA: 20.00,
    montantRemise: 0,
    
    // Paiement
    paymentMethod: 'Espèces',
    montantAcompte: 0,
    montantRestant: 120.00,
    
    // Livraison
    deliveryMethod: 'Livraison standard',
    
    // Signature
    signature: '',
    isSigned: false,
    
    // Métadonnées
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as ToastType
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleDownloadPDF = async () => {
    try {
      showToast('Génération du PDF en cours...', 'success');
      
      // Utiliser AdvancedPDFService pour générer le PDF
      const pdfBlob = await AdvancedPDFService.getPDFBlob(invoice);
      
      // Créer et déclencher le téléchargement
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast(`PDF téléchargé: facture-${invoice.invoiceNumber}.pdf`, 'success');
    } catch (error) {
      showToast('Erreur lors de la génération du PDF', 'error');
      console.error('Erreur PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#477A0C]">
          Test Aperçu PDF Unifié - MyConfort
        </h1>
        
        {/* Aperçu simplifié avec bouton pour PDFPreviewModal */}
        <div className="bg-[#477A0C] rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#F2EFE2]">
              <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
                APERÇU DE LA FACTURE
              </span>
            </h2>
          </div>

          <div className="bg-[#F2EFE2] rounded-lg p-4">
            <div className="text-center py-8">
              <div className="mb-4">
                <span className="text-4xl">📄</span>
              </div>
              <h3 className="text-xl font-bold text-[#477A0C] mb-2">
                Facture {invoice.invoiceNumber}
              </h3>
              <p className="text-gray-600 mb-4">
                Client: {invoice.clientName}<br/>
                Date: {invoice.invoiceDate}<br/>
                Montant: {invoice.montantTTC.toFixed(2)} €
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-semibold">
                  🎯 Format Professionnel Unifié
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Cliquez sur le bouton ci-dessous pour voir la facture au format A4 professionnel avec signature électronique et conditions générales. Ce sera le MÊME format que pour l'impression et l'export PDF.
                </p>
              </div>
              <button
                onClick={() => setShowPDFPreview(true)}
                className="bg-[#477A0C] hover:bg-green-700 text-white px-8 py-3 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 mx-auto shadow-lg"
              >
                <span>👁️</span>
                <span>Voir l'Aperçu Professionnel Unifié</span>
              </button>
            </div>
          </div>
        </div>

        {/* Informations sur l'uniformisation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            ✅ Uniformisation Réalisée
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Aperçu unique :</strong> PDFPreviewModal comme référence unique</li>
            <li>• <strong>Format A4 :</strong> Facture professionnelle avec pagination</li>
            <li>• <strong>Signature :</strong> Zone signature électronique 2x3cm</li>
            <li>• <strong>CGV :</strong> Conditions générales en page 2</li>
            <li>• <strong>Impression :</strong> CSS optimisé pour impression sans interface</li>
            <li>• <strong>Export PDF :</strong> Même rendu que l'aperçu et l'impression</li>
          </ul>
        </div>
      </div>

      {/* Modal d'aperçu PDF - RÉFÉRENCE UNIQUE */}
      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        invoice={invoice}
        onDownload={handleDownloadPDF}
      />

      {/* Toast pour les notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={hideToast}
      />
    </div>
  );
}

export default App;
