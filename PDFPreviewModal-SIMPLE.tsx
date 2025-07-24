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
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClose = () => {
    setIsLoading(false);
    onClose();
  };
  
  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await onDownload();
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="no-print flex justify-between items-center p-4 border-b bg-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold">Aperçu de la facture {invoice.invoiceNumber}</h3>
            {invoice.signature && (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                🔒 SIGNÉE
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold"
            >
              🖨️ Imprimer
            </button>
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold"
            >
              {isLoading ? '⏳ Chargement...' : '⬇️ Télécharger PDF'}
            </button>
            <button
              onClick={handleClose}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="no-print overflow-auto max-h-[calc(90vh-100px)] bg-gray-100 p-4">
          <div id="pdf-preview-content">
            <InvoicePreview invoice={invoice} className="print-preview" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
