import React, { useState } from 'react';
import { Invoice } from '../types';
import { downloadInvoicePDF, printInvoicePDF, getInvoicePDFBase64 } from '../services/generateInvoicePDF';

interface PDFActionsProps {
  invoice: Invoice;
  className?: string;
  onUploadToDrive?: (base64: string, filename: string) => Promise<void>;
}

export const PDFActions: React.FC<PDFActionsProps> = ({ 
  invoice, 
  className = "",
  onUploadToDrive 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      await downloadInvoicePDF(invoice);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsGenerating(true);
      await printInvoicePDF(invoice);
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      alert('Erreur lors de l\'ouverture pour impression');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadToDrive = async () => {
    if (!onUploadToDrive) return;
    
    try {
      setIsUploading(true);
      const base64 = await getInvoicePDFBase64(invoice);
      const filename = `Facture_MyConfort_${invoice.invoiceNumber}.pdf`;
      await onUploadToDrive(base64, filename);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de la sauvegarde sur Google Drive');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`pdf-actions ${className}`}>
      <div className="flex gap-3 flex-wrap">
        {/* Bouton Télécharger */}
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Génération...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Télécharger PDF
            </>
          )}
        </button>

        {/* Bouton Imprimer */}
        <button
          onClick={handlePrint}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Génération...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimer
            </>
          )}
        </button>

        {/* Bouton Google Drive (si handler fourni) */}
        {onUploadToDrive && (
          <button
            onClick={handleUploadToDrive}
            disabled={isUploading || isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Upload...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Sauver sur Drive
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
