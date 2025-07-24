import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InvoiceHeader } from './components/InvoiceHeader';
import { ClientSection } from './components/ClientSection';
import { ProductSection } from './components/ProductSection';
import { ClientListModal } from './components/ClientListModal';
import { InvoicesListModal } from './components/InvoicesListModal';
import { ProductsListModal } from './components/ProductsListModal';
import PDFPreviewModal from './components/PDFPreviewModal';
import { PDFGuideModal } from './components/PDFGuideModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { PayloadDebugModal } from './components/PayloadDebugModal';
import { DebugCenter } from './components/DebugCenter';
import { SignaturePad } from './components/SignaturePad';
import { InvoicePreview } from './components/InvoicePreview';

// 🆕 NOUVELLES IMPORTATIONS POUR LE SYSTÈME D'ERREURS
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider, useToast } from './components/ui/ToastProvider';
import { ErrorModal } from './components/ui/ErrorModal';
import { configService } from './services/configService';

import { Invoice, Client } from './types';
import { generateInvoiceNumber } from './utils/calculations';
import { AdvancedPDFService } from './services/advancedPdfService';
import { loadClients, saveClient, loadInvoices, saveInvoice, loadDraft, saveDraft, deleteClient as removeClient, deleteInvoice as removeInvoice } from './utils/storage';

// 🎯 COMPOSANT PRINCIPAL AVEC NOUVEAU SYSTÈME D'ERREURS
function AppContent() {
  // 🆕 HOOKS POUR LE NOUVEAU SYSTÈME
  const { success, error, warning, info } = useToast();
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    error?: Error;
    onRetry?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // États existants de l'application
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
      email: '',
      phone: '',
      address: '',
      siret: '',
      housingType: '',
      accessCode: ''
    },
    delivery: {
      date: '',
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
  const [showPayloadDebug, setShowPayloadDebug] = useState(false);
  const [showDebugCenter, setShowDebugCenter] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(true);

  // 🆕 INITIALISATION AVEC GESTION D'ERREURS AMÉLIORÉE
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Log de la configuration au démarrage
        configService.logConfig();
        
        // Vérification de la configuration
        const configStatus = configService.getConfigStatus();
        const missingRequired = configStatus.filter(s => s.required && !s.configured);
        
        if (missingRequired.length > 0) {
          warning(`Configuration incomplète: ${missingRequired.map(s => s.service).join(', ')}`);
        }

        // Chargement des données
        setClients(loadClients());
        setInvoices(loadInvoices());
        
        const draft = loadDraft();
        if (draft) {
          setInvoice(draft);
          success('Brouillon chargé automatiquement');
        }

        // Auto-save configuré via le service de config
        const interval = setInterval(() => {
          handleSave();
        }, configService.app.autoSaveInterval);

        return () => clearInterval(interval);
        
      } catch (err) {
        console.error('Erreur initialisation:', err);
        showErrorModal(
          'Erreur d\'initialisation',
          'Impossible de charger l\'application correctement.',
          err as Error,
          () => window.location.reload()
        );
      }
    };

    initializeApp();
  }, []);

  // 🆕 FONCTION UTILITAIRE POUR AFFICHER LES ERREURS
  const showErrorModal = (title: string, message: string, error?: Error, onRetry?: () => void) => {
    setErrorModal({
      isOpen: true,
      title,
      message,
      error,
      onRetry
    });
  };

  // 🆕 VERSIONS AMÉLIORÉES DES HANDLERS AVEC GESTION D'ERREURS
  const handleSave = () => {
    try {
      saveDraft(invoice);
      if (invoice.client.name && invoice.client.email) {
        saveClient(invoice.client);
        setClients(loadClients());
      }
      success('Brouillon sauvegardé automatiquement');
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      error('Impossible de sauvegarder le brouillon');
    }
  };

  const handleSaveInvoice = () => {
    try {
      if (!invoice.client.name || !invoice.client.email || invoice.products.length === 0) {
        warning('Veuillez compléter les informations client et ajouter au moins un produit');
        return;
      }

      saveInvoice(invoice);
      setInvoices(loadInvoices());
      success(`Facture ${invoice.invoiceNumber} enregistrée avec succès`);
    } catch (err) {
      console.error('Erreur sauvegarde facture:', err);
      showErrorModal(
        'Erreur de sauvegarde',
        'Impossible d\'enregistrer la facture',
        err as Error,
        () => handleSaveInvoice()
      );
    }
  };

  const handleDownloadPDF = async () => {
    try {
      info('Génération du PDF en cours...');
      await AdvancedPDFService.downloadPDF(invoice);
      success(`PDF téléchargé: facture-${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      console.error('Erreur PDF:', err);
      showErrorModal(
        'Erreur de génération PDF',
        'Impossible de générer le fichier PDF',
        err as Error,
        () => handleDownloadPDF()
      );
    }
  };

  const handleDeleteClient = (clientToDelete: string) => {
    try {
      removeClient(clientToDelete);
      setClients(loadClients());
      success('Client supprimé avec succès');
    } catch (err) {
      console.error('Erreur suppression client:', err);
      error('Impossible de supprimer le client');
    }
  };

  const handleDeleteInvoice = (invoiceNumber: string) => {
    try {
      removeInvoice(invoiceNumber);
      setInvoices(loadInvoices());
      success('Facture supprimée avec succès');
    } catch (err) {
      console.error('Erreur suppression facture:', err);
      error('Impossible de supprimer la facture');
    }
  };

  // 🆕 HANDLERS POUR LES ERREURS SYSTÈME
  const handleEmailJSSuccess = (message: string) => success(message);
  const handleEmailJSError = (message: string) => error(message);

  const handleLoadInvoice = (selectedInvoice: Invoice) => {
    try {
      setInvoice(selectedInvoice);
      setShowInvoicesList(false);
      success(`Facture ${selectedInvoice.invoiceNumber} chargée`);
    } catch (err) {
      console.error('Erreur chargement facture:', err);
      error('Impossible de charger la facture');
    }
  };

  const handleSaveSignature = (signature: string) => {
    try {
      setInvoice(prev => ({ ...prev, signature }));
      setShowSignaturePad(false);
      success('Signature ajoutée avec succès');
    } catch (err) {
      console.error('Erreur signature:', err);
      error('Impossible de sauvegarder la signature');
    }
  };

  // Validation des champs obligatoires
  const validateMandatoryFields = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!invoice.invoiceDate) errors.push('Date de facture');
    if (!invoice.client.name) errors.push('Nom du client');
    if (!invoice.client.email) errors.push('Email du client');
    if (!invoice.client.phone) errors.push('Téléphone du client');
    if (!invoice.client.address) errors.push('Adresse du client');
    if (invoice.products.length === 0) errors.push('Au moins un produit');
    if (!invoice.payment.method) errors.push('Mode de paiement');

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleShowPDFPreview = () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      warning(`Champs obligatoires manquants: ${validation.errors.join(', ')}`);
      return;
    }
    handleSave();
    handleSaveInvoice();
    setShowPDFPreview(true);
  };

  return (
    <div className="min-h-screen font-['Inter'] text-gray-100" style={{ backgroundColor: '#14281D' }}>
      <Header
        onGeneratePDF={handleShowPDFPreview}
        onShowClients={() => setShowClientsList(true)}
        onShowInvoices={() => setShowInvoicesList(true)}
        onShowProducts={() => setShowProductsList(true)}
        onShowGoogleDrive={() => setShowGoogleDriveConfig(true)}
      />

      <main className="container mx-auto px-4 py-6" id="invoice-content">
        {/* En-tête avec statut de la facture */}
        <div className="text-white rounded-xl shadow-xl p-6 mb-6" style={{
          background: 'linear-gradient(135deg, #477A0C 0%, #5A9A0F 50%, #477A0C 100%)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#F2EFE2] mb-2">MyComfort Facturation</h1>
              <p className="text-[#F2EFE2] opacity-90">Système de facturation professionnel</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Indicateur de configuration */}
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                configService.isEmailJSConfigured() && configService.isN8NConfigured()
                  ? 'bg-green-500 text-white'
                  : 'bg-yellow-500 text-white'
              }`}>
                {configService.isEmailJSConfigured() && configService.isN8NConfigured() ? '✅ Configuré' : '⚠️ Config incomplète'}
              </div>

              {/* Statut de la facture */}
              {validateMandatoryFields().isValid ? (
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <span>✅ COMPLÈTE</span>
                </div>
              ) : (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                  <span>⚠️ INCOMPLÈTE</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sections principales */}
        <InvoiceHeader invoice={invoice} onUpdate={setInvoice} />
        <ClientSection invoice={invoice} onUpdate={setInvoice} />
        <ProductSection invoice={invoice} onUpdate={setInvoice} />

        {/* Aperçu de la facture */}
        {showInvoicePreview && (
          <div className="mt-8">
            <InvoicePreview invoice={invoice} />
          </div>
        )}

        {/* Debug Center (en développement) */}
        {showDebugCenter && configService.app.debugMode && (
          <div className="mb-6">
            <DebugCenter
              invoice={invoice}
              onSuccess={handleEmailJSSuccess}
              onError={handleEmailJSError}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <ClientListModal
        isOpen={showClientsList}
        onClose={() => setShowClientsList(false)}
        clients={clients}
        onSelectClient={(client) => {
          setInvoice(prev => ({ ...prev, client }));
          setShowClientsList(false);
          success('Client sélectionné');
        }}
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
        onDownload={handleDownloadPDF}
      />

      <PDFGuideModal
        isOpen={showPDFGuide}
        onClose={() => setShowPDFGuide(false)}
        onSuccess={handleEmailJSSuccess}
        onError={handleEmailJSError}
      />

      <GoogleDriveModal
        isOpen={showGoogleDriveConfig}
        onClose={() => setShowGoogleDriveConfig(false)}
        onSuccess={handleEmailJSSuccess}
        onError={handleEmailJSError}
      />

      <PayloadDebugModal
        isOpen={showPayloadDebug}
        onClose={() => setShowPayloadDebug(false)}
        invoice={invoice}
        onSuccess={handleEmailJSSuccess}
        onError={handleEmailJSError}
      />

      <SignaturePad
        isOpen={showSignaturePad}
        onClose={() => setShowSignaturePad(false)}
        onSave={handleSaveSignature}
      />

      {/* 🆕 NOUVELLE MODAL D'ERREUR */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
        error={errorModal.error}
        showRetry={!!errorModal.onRetry}
        onRetry={errorModal.onRetry}
      />
    </div>
  );
}

// 🎯 COMPOSANT APP PRINCIPAL AVEC ERROR BOUNDARY
function App() {
  return (
    <ErrorBoundary>
      <ToastProvider maxToasts={5}>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
