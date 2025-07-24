import React, { useState } from 'react';
import { InvoicePreview } from './InvoicePreview';
import { Invoice } from '../types';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onDownload: () => void;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onDownload
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Nettoyage des états lors de la fermeture
  const handleClose = () => {
    setIsSharing(false);
    setIsUploading(false);
    onClose();
  };
  
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    setIsSharing(true);
    // Logique de partage simplifiée
    setTimeout(() => {
      setIsSharing(false);
      alert('Fonctionnalité de partage à implémenter selon vos besoins');
    }, 1000);
  };

  const handleUpload = () => {
    setIsUploading(true);
    // Logique d'upload simplifiée
    setTimeout(() => {
      setIsUploading(false);
      alert('Fonctionnalité d\'upload à implémenter selon vos besoins');
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Aperçu de la Facture</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onDownload}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1" />
              </svg>
              Télécharger PDF
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimer
            </button>

            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isSharing ? (
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              )}
              Partager
            </button>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isUploading ? (
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
              Upload Drive
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="p-4">
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
