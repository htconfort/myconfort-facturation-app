import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Printer, FileText, Share2, Loader, UploadCloud as CloudUpload, AlertCircle } from 'lucide-react';
import { InvoicePreviewClean } from './InvoicePreviewClean';
import { InvoicePreviewData } from '../shared/invoiceUtils';
import { convertPreviewDataToInvoice } from '../utils/typeAdapters';
import html2canvas from 'html2canvas';
import { AdvancedPDFService } from '../services/advancedPdfService';
import { GoogleDriveService } from '../services/googleDriveService';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoicePreviewData;
  onDownload: () => Promise<void>;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onDownload
}) => {
  // État unifié pour les opérations de loading
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // États d'erreur séparés
  const [shareError, setShareError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // États pour les captures
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  
  // Nettoyage des états et de la mémoire lors de la fermeture ou du changement
  const cleanupAndClose = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
    setShareError(null);
    setUploadError(null);
    
    // Nettoyage de la mémoire pour les URLs d'objets
    if (capturedImageUrl) {
      URL.revokeObjectURL(capturedImageUrl);
      setCapturedImageUrl(null);
    }
    
    onClose();
  }, [capturedImageUrl, onClose]);
  
  // Nettoyage automatique lors du changement de facture ou fermeture
  useEffect(() => {
    if (!isOpen) {
      return () => {
        if (capturedImageUrl) {
          URL.revokeObjectURL(capturedImageUrl);
        }
      };
    }
  }, [isOpen, capturedImageUrl]);
  
  // Gestion sécurisée du téléchargement
  const handleDownloadClick = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Génération du PDF...');
      await onDownload();
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      setShareError(error instanceof Error ? error.message : 'Erreur lors du téléchargement du PDF');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Système d'affichage d'erreur moderne
  const ErrorMessage: React.FC<{ error: string; onDismiss: () => void }> = ({ error, onDismiss }) => (
    <div className="no-print bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800">Erreur</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
        <button
          onClick={onDismiss}
          className="ml-4 text-red-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Partage d'aperçu par email amélioré
  const handleSharePreviewViaEmail = async () => {
    if (!invoice.clientEmail) {
      setShareError('Veuillez renseigner l\'email du client pour partager l\'aperçu');
      return;
    }

    setIsLoading(true);
    setShareError(null);

    try {
      setLoadingMessage('📸 Capture de l\'aperçu...');
      
      const element = document.getElementById('pdf-preview-content');
      if (!element) {
        throw new Error('Élément aperçu non trouvé');
      }

      setLoadingMessage('🖼️ Conversion en image...');
      
      // Options optimisées pour réduire la taille et améliorer la qualité
      const canvas = await html2canvas(element, {
        scale: 0.75,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight
      });

      // Convertir en JPEG avec qualité optimisée
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      setLoadingMessage('🚀 Préparation pour l\'envoi...');
      
      // Nettoyer l'ancienne URL si elle existe
      if (capturedImageUrl) {
        URL.revokeObjectURL(capturedImageUrl);
      }
      
      // Créer un lien de téléchargement pour l'image
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = `apercu-facture-${invoice.invoiceNumber}.jpg`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setCapturedImageUrl(imageDataUrl);
      
      setLoadingMessage('✅ Aperçu capturé !');
      
      // Ouvrir le client mail par défaut
      const mailtoLink = `mailto:${invoice.clientEmail}?subject=Aperçu facture MYCONFORT n°${invoice.invoiceNumber}&body=Bonjour ${invoice.clientName},%0D%0A%0D%0AVeuillez trouver ci-joint l'aperçu de votre facture n°${invoice.invoiceNumber}.%0D%0A%0D%0ACordialement,%0D%0A${invoice.advisorName || 'MYCONFORT'}`;
      
      window.open(mailtoLink, '_blank');
      
      // Message de succès moderne (remplace alert)
      setTimeout(() => {
        setLoadingMessage('✅ Aperçu capturé et client mail ouvert');
      }, 1000);

    } catch (error) {
      console.error('❌ Erreur partage aperçu:', error);
      setShareError(error instanceof Error ? error.message : 'Erreur lors de la capture de l\'aperçu');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage('');
      }, 2000);
    }
  };

  // Upload to Google Drive amélioré
  const handleUploadToGoogleDrive = async () => {
    setIsLoading(true);
    setUploadError(null);
    setLoadingMessage('🔄 Génération du PDF...');

    try {
      // Generate PDF blob
      // 🔄 Conversion pour compatibilité avec les services existants
      const convertedInvoice = convertPreviewDataToInvoice(invoice);
      const pdfBlob = await AdvancedPDFService.getPDFBlob(convertedInvoice);
      
      setLoadingMessage('📤 Envoi vers Google Drive...');
      
      // Upload to Google Drive
      const success = await GoogleDriveService.uploadPDFToGoogleDrive(convertedInvoice, pdfBlob);
      
      if (success) {
        setLoadingMessage('✅ PDF envoyé avec succès !');
        setTimeout(() => {
          setLoadingMessage('');
        }, 2000);
      } else {
        throw new Error('Échec de l\'envoi vers Google Drive');
      }
    } catch (error) {
      console.error('❌ Erreur upload Google Drive:', error);
      setUploadError(error instanceof Error ? error.message : 'Erreur lors de l\'envoi vers Google Drive');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage('');
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header - no-print pour masquer à l'impression */}
        <div className="no-print flex justify-between items-center p-4 border-b bg-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <h3 className="text-xl font-bold">Aperçu de la facture {invoice.invoiceNumber}</h3>
            {invoice.signature && (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <span>🔒</span>
                <span>SIGNÉE</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {/* Bouton upload Google Drive */}
            <button
              onClick={handleUploadToGoogleDrive}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              title="Envoyer cette facture vers Google Drive"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <CloudUpload size={18} />
                  <span>Google Drive</span>
                </>
              )}
            </button>
            
            {/* Bouton partage aperçu */}
            <button
              onClick={handleSharePreviewViaEmail}
              disabled={isLoading || !invoice.clientEmail}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              title={!invoice.clientEmail ? "Veuillez renseigner l'email du client" : "Capturer cet aperçu et l'envoyer par email"}
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Capture en cours...</span>
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  <span>Partager Aperçu</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105"
            >
              <Printer size={18} />
              <span>Imprimer</span>
            </button>
            <button
              onClick={handleDownloadClick}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Télécharger PDF</span>
                </>
              )}
            </button>
            <button
              onClick={cleanupAndClose}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg transition-all hover:scale-105"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {shareError && (
          <ErrorMessage 
            error={shareError} 
            onDismiss={() => setShareError(null)} 
          />
        )}
        
        {uploadError && (
          <ErrorMessage 
            error={uploadError} 
            onDismiss={() => setUploadError(null)} 
          />
        )}

        {/* Indicateur de chargement unifié */}
        {isLoading && loadingMessage && (
          <div className="no-print bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">Opération en cours...</div>
                <div className="text-sm text-blue-700">{loadingMessage}</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions pour le partage */}
        <div className="no-print bg-gradient-to-r from-purple-50 to-indigo-50 border-b p-3">
          <div className="flex items-center space-x-2 text-sm">
            <Share2 className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-purple-900">Partage d'aperçu :</span>
            <span className="text-purple-800">
              {invoice.clientEmail 
                ? "Cliquez sur \"Partager Aperçu\" pour capturer et envoyer par email"
                : "⚠️ Email client requis pour le partage d'aperçu"
              }
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            📸 Format: JPEG optimisé • 🎯 Téléchargement automatique
          </div>
          <div className="mt-1 text-xs text-blue-600 font-semibold">
            💡 L'image sera téléchargée et votre client mail s'ouvrira automatiquement
          </div>
        </div>

        {/* Instructions pour Google Drive */}
        <div className="no-print bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-3">
          <div className="flex items-center space-x-2 text-sm">
            <CloudUpload className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-900">Google Drive :</span>
            <span className="text-blue-800">
              Cliquez sur "Google Drive" pour envoyer cette facture vers votre Drive
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            📁 Dossier: {GoogleDriveService.getConfig().folderId} • 🎯 Format: PDF haute qualité
          </div>
          <div className="mt-1 text-xs text-blue-600 font-semibold">
            💡 La facture sera automatiquement envoyée vers votre Google Drive via n8n
          </div>
        </div>

        {/* Content - FORMAT UNIQUE : InvoicePreview */}
        <div className="no-print overflow-auto max-h-[calc(90vh-220px)] bg-gray-100 p-4">
          <div id="pdf-preview-content">
            <InvoicePreviewClean invoice={invoice} className="print-preview" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
