import React, { useState } from 'react';
import { X, Bug, Copy, Download, TestTube } from 'lucide-react';
import { Modal } from './ui/Modal';
import { N8nWebhookService } from '../services/n8nWebhookService';
import { PayloadValidator } from '../services/payloadValidator';
import { Invoice } from '../types';

interface PayloadDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const PayloadDebugModal: React.FC<PayloadDebugModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
  onError
}) => {
  const [debugData, setDebugData] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleGenerateDebugPayload = async () => {
    try {
      // Simuler la génération d'un PDF pour le debug
      const mockPdfBase64 = 'JVBERi0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0K';
      const mockPdfSizeKB = 150;
      
      const validation = PayloadValidator.validateAndPrepare(invoice, mockPdfBase64, mockPdfSizeKB);
      
      setDebugData({
        validation: validation,
        timestamp: new Date().toISOString(),
        invoiceData: invoice
      });
      
      if (validation.isValid) {
        onSuccess('✅ Payload généré et validé avec succès');
      } else {
        onError(`❌ Erreurs de validation: ${validation.errors?.join(', ')}`);
      }
    } catch (error: any) {
      onError(`❌ Erreur génération payload: ${error.message}`);
    }
  };

  const handleTestN8nConnection = async () => {
    setIsTesting(true);
    try {
      const result = await N8nWebhookService.testConnection();
      
      if (result.success) {
        onSuccess(result.message);
      } else {
        onError(result.message);
      }
    } catch (error: any) {
      onError(`❌ Erreur test connexion: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyPayload = () => {
    if (debugData?.validation?.payload) {
      navigator.clipboard.writeText(JSON.stringify(debugData.validation.payload, null, 2));
      onSuccess('📋 Payload copié dans le presse-papiers');
    }
  };

  const handleDownloadPayload = () => {
    if (debugData) {
      const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payload-debug-${invoice.invoiceNumber}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onSuccess('📥 Fichier de debug téléchargé');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🐛 Debug Payload N8N" maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <Bug className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Debug Payload N8N</h3>
              <p className="text-orange-100">Validation et test du payload avant envoi</p>
            </div>
          </div>
        </div>

        {/* Actions de debug */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleGenerateDebugPayload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center space-x-2 font-semibold transition-all"
          >
            <Bug className="w-5 h-5" />
            <span>Générer Payload Debug</span>
          </button>
          
          <button
            onClick={handleTestN8nConnection}
            disabled={isTesting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg flex items-center space-x-2 font-semibold transition-all"
          >
            <TestTube className="w-5 h-5" />
            <span>{isTesting ? 'Test...' : 'Test Connexion N8N'}</span>
          </button>
          
          {debugData && (
            <div className="flex space-x-2">
              <button
                onClick={handleCopyPayload}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-3 rounded-lg flex items-center space-x-1 font-semibold transition-all"
              >
                <Copy className="w-4 h-4" />
                <span>Copier</span>
              </button>
              <button
                onClick={handleDownloadPayload}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-3 rounded-lg flex items-center space-x-1 font-semibold transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger</span>
              </button>
            </div>
          )}
        </div>

        {/* Résultats de validation */}
        {debugData && (
          <div className="space-y-4">
            {/* Statut de validation */}
            <div className={`p-4 rounded-lg ${
              debugData.validation.isValid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <h4 className={`font-bold mb-2 ${
                debugData.validation.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {debugData.validation.isValid ? '✅ Validation Réussie' : '❌ Erreurs de Validation'}
              </h4>
              
              {!debugData.validation.isValid && debugData.validation.errors && (
                <ul className="list-disc ml-5 space-y-1 text-red-700">
                  {debugData.validation.errors.map((error: string, index: number) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Payload JSON */}
            {debugData.validation.payload && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">📋 Payload Validé</h4>
                <pre className="bg-white p-4 rounded border text-xs overflow-auto max-h-96 text-gray-800">
                  {JSON.stringify(debugData.validation.payload, null, 2)}
                </pre>
              </div>
            )}

            {/* Statistiques */}
            {debugData.validation.payload && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-2">📊 Statistiques Payload</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-semibold">Taille JSON:</span>
                    <div className="text-blue-800">{JSON.stringify(debugData.validation.payload).length} caractères</div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-semibold">Produits:</span>
                    <div className="text-blue-800">{debugData.validation.payload.products?.length || 0}</div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-semibold">Taille PDF:</span>
                    <div className="text-blue-800">{debugData.validation.payload.pdfSizeKB} KB</div>
                  </div>
                  <div>
                    <span className="text-blue-600 font-semibold">Signature:</span>
                    <div className="text-blue-800">{debugData.validation.payload.signature ? 'Oui' : 'Non'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-bold text-yellow-800 mb-2">💡 Instructions Debug</h4>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-yellow-700">
            <li>Cliquez sur "Générer Payload Debug" pour valider la structure</li>
            <li>Vérifiez que tous les champs obligatoires sont présents</li>
            <li>Testez la connexion N8N pour vérifier l'accessibilité</li>
            <li>Copiez le payload pour le tester dans Postman/cURL</li>
            <li>Dans n8n, activez "Listen for test event" pour voir les données reçues</li>
          </ol>
        </div>
      </div>
    </Modal>
  );
};