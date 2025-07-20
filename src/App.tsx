import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { InvoiceHeader } from './components/InvoiceHeader';
import { ClientSection } from './components/ClientSection';
import { ProductSection } from './components/ProductSection';
import { ClientListModal } from './components/ClientListModal';
import { InvoicesListModal } from './components/InvoicesListModal';
import { ProductsListModal } from './components/ProductsListModal';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { PDFGuideModal } from './components/PDFGuideModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { SignaturePad } from './components/SignaturePad';
import { InvoicePDF } from './components/InvoicePDF';
import { Toast } from './components/ui/Toast';
import { Invoice, Client, ToastType } from './types';
import { generateInvoiceNumber } from './utils/calculations';
import { saveClients, loadClients, saveDraft, loadDraft, saveClient, saveInvoice, loadInvoices, deleteInvoice } from './utils/storage';
import { AdvancedPDFService } from './services/advancedPdfService'; // Keep this import
import { GoogleDriveService } from './services/googleDriveService';
// import { PDFService } from './services/pdfService'; // REMOVED: No longer needed, using AdvancedPDFService

function App() {
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString().split('T')[0],
    eventLocation: '',
    advisorName: '',
    invoiceNotes: '',
    termsAccepted: false,
    taxRate: 20,
    client: {
      name: '',
      address: '',
      postalCode: '',
      city: '',
      phone: '',
      email: '',
      housingType: '',
      doorCode: ''
    },
    delivery: {
      method: '',
      notes: ''
    },
    payment: {
      method: '',
      depositAmount: 0
    },
    products: [],
    signature: ''
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showClientsList, setShowClientsList] = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showProductsList, setShowProductsList] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showPDFGuide, setShowPDFGuide] = useState(false);
  const [showGoogleDriveConfig, setShowGoogleDriveConfig] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as ToastType
  });

  // Ref pour la section d'aperçu de la facture à capturer pour le PDF
  // NOTE: previewRef est toujours utilisé pour l'affichage de InvoicePDF,
  // mais AdvancedPDFService génère le PDF à partir des données, pas du DOM.
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setClients(loadClients());
    setInvoices(loadInvoices());
    const draft = loadDraft();
    if (draft) {
      setInvoice(draft);
      showToast('Brouillon chargé', 'success');
    }

    // Auto-save every 60 seconds
    const interval = setInterval(() => {
      handleSave();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleSave = () => {
    try {
      saveDraft(invoice);
      if (invoice.client.name && invoice.client.email) {
        saveClient(invoice.client);
        setClients(loadClients());
      }
      showToast('Brouillon enregistré', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleSaveInvoice = () => {
    try {
      if (!invoice.client.name || !invoice.client.email || invoice.products.length === 0) {
        showToast('Veuillez compléter les informations client et ajouter au moins un produit', 'error');
        return;
      }

      saveInvoice(invoice);
      setInvoices(loadInvoices());
      showToast(`Facture ${invoice.invoiceNumber} enregistrée avec succès`, 'success');
    } catch (error) {
      showToast('Erreur lors de l\'enregistrement de la facture', 'error');
    }
  };

  // 🔒 VALIDATION OBLIGATOIRE RENFORCÉE AVEC DATE
  const validateMandatoryFields = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validation date (OBLIGATOIRE)
    if (!invoice.invoiceDate || invoice.invoiceDate.trim() === '') {
      errors.push('Date de la facture obligatoire');
    }

    // Validation lieu d'événement (OBLIGATOIRE)
    if (!invoice.eventLocation || invoice.eventLocation.trim() === '') {
      errors.push('Lieu de l\'événement obligatoire');
    }

    // Validation informations client (TOUS OBLIGATOIRES)
    if (!invoice.client.name || invoice.client.name.trim() === '') {
      errors.push('Nom complet du client obligatoire');
    }

    if (!invoice.client.address || invoice.client.address.trim() === '') {
      errors.push('Adresse du client obligatoire');
    }

    if (!invoice.client.postalCode || invoice.client.postalCode.trim() === '') {
      errors.push('Code postal du client obligatoire');
    }

    if (!invoice.client.city || invoice.client.city.trim() === '') {
      errors.push('Ville du client obligatoire');
    }

    if (!invoice.client.housingType || invoice.client.housingType.trim() === '') {
      errors.push('Type de logement du client obligatoire');
    }

    if (!invoice.client.doorCode || invoice.client.doorCode.trim() === '') {
      errors.push('Code porte/étage du client obligatoire');
    }

    if (!invoice.client.phone || invoice.client.phone.trim() === '') {
      errors.push('Téléphone du client obligatoire');
    }

    if (!invoice.client.email || invoice.client.email.trim() === '') {
      errors.push('Email du client obligatoire');
    }

    // Validation email format
    if (invoice.client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.client.email)) {
      errors.push('Format d\'email invalide');
    }

    // Validation produits
    if (invoice.products.length === 0) {
      errors.push('Au moins un produit obligatoire');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // 🟢 Helper universel pour générer le PDF Blob en utilisant AdvancedPDFService
  const generatePDFBlobFromPreview = async () => {
    // AdvancedPDFService génère le PDF à partir des données de l'objet invoice,
    // donc previewRef n'est pas directement utilisé ici pour la génération.
    // Il est conservé pour l'affichage de l'aperçu HTML.
    return await AdvancedPDFService.getPDFBlob(invoice);
  };

  // 🟢 Handler pour télécharger le PDF en utilisant AdvancedPDFService
  const handleDownloadPDF = async () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      showToast(`Impossible de télécharger le PDF. Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
      return;
    }
    handleSave();
    handleSaveInvoice();
    showToast('Génération et téléchargement du PDF MYCONFORT en cours...', 'success');
    try {
      await AdvancedPDFService.downloadPDF(invoice); // Utilise AdvancedPDFService
      showToast(`PDF MYCONFORT téléchargé avec succès${invoice.signature ? ' (avec signature électronique)' : ''}`, 'success');
    } catch (error) {
      console.error('PDF download error:', error);
      showToast('Erreur lors du téléchargement du PDF', 'error');
    }
  };

  // 🟢 Handler pour envoyer par N8N/Drive/Email
  const handleSendPDF = async () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      showToast(`Impossible d'envoyer le PDF. Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
      return;
    }
    handleSave();
    handleSaveInvoice();
    showToast('📤 Préparation de l\'envoi du PDF MYCONFORT...', 'success');

    try {
      const pdfBlob = await generatePDFBlobFromPreview(); // Utilise AdvancedPDFService via generatePDFBlobFromPreview
      if (!pdfBlob) return;

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(new Error("Erreur conversion PDF en Base64"));
        reader.readAsDataURL(pdfBlob);
      });

      showToast('🚀 Envoi vers N8N en cours...', 'success');
      const webhookData = {
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.client.name,
        clientEmail: invoice.client.email,
        advisorName: invoice.advisorName,
        invoiceDate: invoice.invoiceDate,
        totalAmount: invoice.products.reduce((sum, p) => p.quantity * p.priceTTC, 0), // Simplified total for webhook
        fichier_facture: base64Data,
        // Add any other relevant invoice data for your webhook
      };
      const response = await fetch('https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });

      if (response.ok) {
        showToast("✅ Facture envoyée par email (PDF joint) via N8N", "success");
      } else {
        const errorText = await response.text();
        throw new Error(`Erreur N8N: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      console.error('❌ Erreur envoi PDF via N8N:', error);
      showToast(`❌ Erreur d'envoi N8N: ${error.message || 'Erreur inconnue'}`, 'error');
    }
  };

  // 🖨️ IMPRESSION CONDENSÉE A4 - Version intégrée
  const handlePrintWifi = () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      showToast(`Impossible d'imprimer. Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
      return;
    }
    
    handleSave();
    handleSaveInvoice();
    showToast('📄 Préparation impression A4 condensée...', 'success');
    
    try {
      const element = document.getElementById('invoice-preview-section');
      if (!element) {
        showToast('❌ Aperçu de facture non trouvé', 'error');
        return;
      }
      
      // Sauvegarder le contenu original
      const originalContent = document.body.innerHTML;
      const originalTitle = document.title;
      
      // CSS d'impression ULTRA-CONDENSÉ
      const printStyles = `
        <style>
          @page { size: A4; margin: 8mm; }
          body { font-family: Arial; margin: 0; padding: 5px; background: white; font-size: 10px; line-height: 1.2; }
          .bg-\\[\\#F2EFE2\\] { background: #F2EFE2 !important; padding: 8px !important; border-radius: 4px; margin: 3px 0 !important; }
          .bg-white { background: white !important; padding: 8px !important; border-radius: 4px; margin: 3px 0 !important; }
          h1, .text-2xl { font-size: 16px !important; margin: 3px 0 !important; line-height: 1.1; }
          h2, .text-lg { font-size: 14px !important; margin: 2px 0 !important; line-height: 1.1; }
          p { margin: 2px 0 !important; font-size: 9px !important; line-height: 1.2; }
          .mb-4, .mb-6 { margin-bottom: 4px !important; }
          .p-4, .p-6 { padding: 4px !important; }
          table { border-collapse: collapse; width: 100%; margin: 3px 0 !important; font-size: 8px !important; }
          table th, table td { border: 1px solid #ddd; padding: 3px !important; line-height: 1.1; }
          table th { background: #f5f5f5; font-weight: bold; }
          .bg-\\[\\#F2EFE2\\]:first-child { transform: scale(0.85); transform-origin: top center; width: 117.6%; margin-left: -8.8%; }
        </style>
      `;
      
      // Remplacer le contenu
      document.title = 'Impression Facture MyConfort - A4';
      document.body.innerHTML = printStyles + element.outerHTML;
      
      // Lancer l'impression
      setTimeout(() => {
        window.print();
        
        // Restaurer après impression
        setTimeout(() => {
          document.body.innerHTML = originalContent;
          document.title = originalTitle;
          showToast('✅ Impression A4 terminée', 'success');
        }, 1000);
      }, 500);
      
    } catch (error) {
      console.error('Erreur impression:', error);
      showToast('❌ Erreur lors de l\'impression', 'error');
    }
  };

  const handleShowPDFPreview = () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      showToast(`Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
      return;
    }
    handleSave();
    handleSaveInvoice();
    setShowPDFPreview(true);
  };

  // handlePrint function REMOVED as it relied on PDFService and html2pdf.js for printing from DOM
  // const handlePrint = () => {
  //   PDFService.printInvoice(previewRef, invoice.invoiceNumber);
  // };

  const handleEmailJSSuccess = (message: string) => {
    handleSaveInvoice();
    showToast(message, 'success');
  };

  const handleEmailJSError = (message: string) => {
    showToast(message, 'error');
  };

  const handleLoadClient = (client: Client) => {
    setInvoice(prev => ({ ...prev, client }));
    setShowClientsList(false);
    showToast('Client chargé avec succès', 'success');
  };

  const handleDeleteClient = (index: number) => {
    const updatedClients = clients.filter((_, i) => i !== index);
    setClients(updatedClients);
    saveClients(updatedClients);
    showToast('Client supprimé', 'success');
  };

  const handleLoadInvoice = (loadedInvoice: Invoice) => {
    setInvoice(loadedInvoice);
    showToast(`Facture ${loadedInvoice.invoiceNumber} chargée avec succès`, 'success');
  };

  const handleDeleteInvoice = (index: number) => {
    const invoiceToDelete = invoices[index];
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete.invoiceNumber);
      setInvoices(loadInvoices());
      showToast(`Facture ${invoiceToDelete.invoiceNumber} supprimée`, 'success');
    }
  };

  const handleSaveSignature = (signature: string) => {
    setInvoice(prev => ({ ...prev, signature }));
    showToast('Signature enregistrée - Facture prête pour envoi !', 'success');
  };

  // 🆕 FONCTION NOUVELLE FACTURE - REMISE À ZÉRO COMPLÈTE
  const handleNewInvoice = () => {
    if (window.confirm('Êtes-vous sûr de vouloir créer une nouvelle facture?\n\nToutes les données actuelles seront perdues et remises à zéro.')) {
      const newInvoiceNumber = generateInvoiceNumber();
      setInvoice({
        invoiceNumber: newInvoiceNumber,
        invoiceDate: new Date().toISOString().split('T')[0],
        eventLocation: '',
        advisorName: '',
        invoiceNotes: '',
        termsAccepted: false,
        taxRate: 20,
        client: {
          name: '',
          address: '',
          postalCode: '',
          city: '',
          phone: '',
          email: '',
          housingType: '',
          doorCode: ''
        },
        delivery: {
          method: '',
          notes: ''
        },
        payment: {
          method: '',
          depositAmount: 0
        },
        products: [],
        signature: ''
      });
      localStorage.removeItem('myconfortInvoiceDraft');
      showToast(`✅ Nouvelle facture créée : ${newInvoiceNumber}`, 'success');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 🔒 VALIDATION COMPLÈTE POUR BOUTON PDF
  const handleValidateAndPDF = () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      showToast(`Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
      return;
    }
    handleShowPDFPreview();
  };

  // 🔒 VÉRIFICATION DES CHAMPS OBLIGATOIRES POUR L'AFFICHAGE
  const validation = validateMandatoryFields();

  return (
    <div className="min-h-screen font-['Inter'] text-gray-100" style={{ backgroundColor: '#14281D' }}>
      <Header
        onGeneratePDF={handleValidateAndPDF}
        onShowClients={() => setShowClientsList(true)}
        onShowInvoices={() => setShowInvoicesList(true)}
        onShowProducts={() => setShowProductsList(true)}
        onShowGoogleDrive={handleSendPDF}
      />

      <main className="container mx-auto px-4 py-6" id="invoice-content">
        {/* En-tête MYCONFORT avec dégradé basé sur #477A0C */}
        <div
          className="text-white rounded-xl shadow-xl p-6 mb-6"
          style={{
            background: 'linear-gradient(135deg, #477A0C 0%, #5A8F0F 25%, #3A6A0A 50%, #6BA015 75%, #477A0C 100%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <span className="text-2xl">🌸</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">MYCONFORT</h1>
                <p className="text-green-100">Facturation professionnelle avec signature électronique</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Statut de la facture</div>
              <div className="flex items-center space-x-2 mt-1">
                {validation.isValid ? (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>✅</span>
                    <span>COMPLÈTE</span>
                  </div>
                ) : (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>INCOMPLÈTE</span>
                  </div>
                )}
                {invoice.signature && (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>🔒</span>
                    <span>SIGNÉE</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <InvoiceHeader
          invoice={invoice}
          onUpdate={(updates) => setInvoice(prev => ({ ...prev, ...updates }))}
        />

        <div id="client-section">
          <ClientSection
            client={invoice.client}
            onUpdate={(client) => setInvoice(prev => ({ ...prev, client }))}
          />
        </div>

        <div id="products-section">
          <ProductSection
            products={invoice.products}
            onUpdate={(products) => setInvoice(prev => ({ ...prev, products }))}
            taxRate={invoice.taxRate}
            invoiceNotes={invoice.invoiceNotes}
            onNotesChange={(invoiceNotes) => setInvoice(prev => ({ ...prev, invoiceNotes }))}
            acompteAmount={invoice.payment.depositAmount}
            onAcompteChange={(amount) => setInvoice(prev => ({
              ...prev,
              payment: { ...prev.payment, depositAmount: amount }
            }))}
            paymentMethod={invoice.payment.method}
            onPaymentMethodChange={(method) => setInvoice(prev => ({
              ...prev,
              payment: { ...prev.payment, method }
            }))}
            advisorName={invoice.advisorName}
            onAdvisorNameChange={(name) => setInvoice(prev => ({ ...prev, advisorName: name }))}
            termsAccepted={invoice.termsAccepted}
            onTermsAcceptedChange={(accepted) => setInvoice(prev => ({ ...prev, termsAccepted: accepted }))}
            signature={invoice.signature}
            onShowSignaturePad={() => setShowSignaturePad(true)}
          />
        </div>

        {/* Delivery Section - UNIFORMISÉ */}
        <div id="delivery-section" className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
            <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
              INFORMATIONS LOGISTIQUES
            </span>
          </h2>

          <div className="bg-[#F2EFE2] rounded-lg p-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-black mb-1 font-bold">
                  Mode de livraison
                </label>
                <select
                  value={invoice.delivery.method}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    delivery: { ...prev.delivery, method: e.target.value }
                  }))}
                  className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold"
                >
                  <option value="">Sélectionner</option>
                  <option value="Colissimo 48 heures">Colissimo 48 heures</option>
                  <option value="Livraison par transporteur">Livraison par transporteur</option>
                  <option value="Retrait en magasin">Retrait en magasin</option>
                </select>
              </div>

              <div>
                <label className="block text-black mb-1 font-bold">
                  Précisions de livraison
                </label>
                <textarea
                  value={invoice.delivery.notes}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    delivery: { ...prev.delivery, notes: e.target.value }
                  }))}
                  className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold h-20"
                  placeholder="Instructions spéciales, étage, code d'accès..."
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-black italic font-semibold">
              <p>📦 Livraison estimée sous 48 heures. Les délais sont donnés à titre indicatif et ne sont pas contractuels.</p>
            </div>
          </div>
        </div>

        {/* Communication & Actions Section - EmailSender removed */}
        {/* <EmailSender
          invoice={invoice}
          onSuccess={handleEmailJSSuccess}
          onError={handleEmailJSError}
          onShowConfig={() => setShowGoogleDriveConfig(true)}
          onShowEmailJSConfig={() => setShowEmailJSConfig(true)}
        /> */}

        {/* Hidden InvoicePDF for PDF generation */}
        <div style={{ display: 'none' }}>
          <div ref={previewRef}>
            <InvoicePDF invoice={invoice} isPreview={true} />
          </div>
        </div>

        {/* Aperçu de la facture - UNIFORMISÉ SANS BOUTON TÉLÉCHARGER PDF */}
        {showInvoicePreview && (
          <div className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#F2EFE2] flex items-center justify-center">
                <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
                  APERÇU DE LA FACTURE
                </span>
              </h2>
              <button
                onClick={() => setShowInvoicePreview(!showInvoicePreview)}
                className="text-[#F2EFE2] hover:text-white underline text-sm font-semibold"
              >
                {showInvoicePreview ? 'Masquer' : 'Afficher'} l'aperçu
              </button>
            </div>

            {/* Ajout de l'ID pour la référence unique */}
            <div id="invoice-preview-section" className="bg-[#F2EFE2] rounded-lg p-4">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <InvoicePDF invoice={invoice} isPreview={true} />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - UNIFORMISÉ AVEC NOUVELLE FACTURE CLIQUABLE */}
        <div className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
            <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
              ACTIONS PRINCIPALES
            </span>
          </h2>

          <div className="bg-[#F2EFE2] rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div>
                <label className="block text-black mb-1 font-bold">Email du destinataire</label>
                <input
                  value={invoice.client.email}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    client: { ...prev.client, email: e.target.value }
                  }))}
                  type="email"
                  className="w-full md:w-64 border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold"
                  placeholder="client@email.com"
                />
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSaveInvoice}
                  disabled={!invoice.client.name || !invoice.client.email || invoice.products.length === 0}
                  className={`px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105 disabled:hover:scale-100 ${
                    invoice.client.name && invoice.client.email && invoice.products.length > 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                  title={invoice.client.name && invoice.client.email && invoice.products.length > 0
                    ? "Enregistrer la facture dans l'onglet Factures"
                    : "Complétez les informations client et ajoutez au moins un produit"}
                >
                  <span>💾</span>
                  <span>ENREGISTRER FACTURE</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105 bg-green-600 hover:bg-green-700 text-white"
                >
                  <span>⬇️</span>
                  <span>TÉLÉCHARGER PDF</span>
                </button>
                <button
                  onClick={handlePrintWifi}
                  className="px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105 bg-orange-600 hover:bg-orange-700 text-white"
                  title="Imprimer la facture directement"
                >
                  <span>🖨️</span>
                  <span>IMPRIMER</span>
                </button>
                <button
                  onClick={handleSendPDF}
                  className="px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <span>📧</span>
                  <span>ENVOYER PAR EMAIL/DRIVE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ClientListModal
        isOpen={showClientsList}
        onClose={() => setShowClientsList(false)}
        clients={clients}
        onLoadClient={handleLoadClient}
        onDeleteClient={handleDeleteClient}
      />

      <InvoicesListModal
        isOpen={showInvoicesList}
        onClose={() => setShowInvoicesList(false)}
        invoices={invoices}
        onLoadInvoice={handleLoadInvoice}
        onDeleteInvoice={handleDeleteInvoice}
      />

      <ProductsListModal
        isOpen={showProductsList}
        onClose={() => setShowProductsList(false)}
      />

      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        invoice={invoice}
        previewRef={previewRef} // Still passed for the visual preview in the modal
        handleDownloadPDF={handleDownloadPDF}
        handleSendPDF={handleSendPDF}
      />

      <PDFGuideModal
        isOpen={showPDFGuide}
        onClose={() => setShowPDFGuide(false)}
        onSuccess={handleEmailJSSuccess}
        onError={handleEmailJSError}
      />

      {/* EmailJSConfigurationModal removed */}
      {/* <EmailJSConfigurationModal
        isOpen={showEmailJSConfig}
        onClose={() => setShowEmailJSConfig(false)}
        onSuccess={handleEmailJSSuccess}
        onError={handleEmailJSError}
      /> */}

      <GoogleDriveModal
        isOpen={showGoogleDriveConfig}
        onClose={() => setShowGoogleDriveConfig(false)}
        onSuccess={handleEmailJSSuccess}
        onError={handleEmailJSError}
      />

      <SignaturePad
        isOpen={showSignaturePad}
        onClose={() => setShowSignaturePad(false)}
        onSave={handleSaveSignature}
      />

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