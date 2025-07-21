import React, { useState } from 'react';
import { Bug, Database, Wifi, FileText, Copy, Download, TestTube, AlertTriangle, CheckCircle } from 'lucide-react';
import { DebugSection } from './DebugSection';
import { Invoice } from '../types';
import { PayloadValidator } from '../services/payloadValidator';
import { N8nWebhookService } from '../services/n8nWebhookService';

interface DebugCenterProps {
  invoice: Invoice;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const DebugCenter: React.FC<DebugCenterProps> = ({
  invoice,
  onSuccess,
  onError
}) => {
  const [debugData, setDebugData] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeSection, setActiveSection] = useState<'payload' | 'connection' | 'logs'>('payload');

  // Generate debug payload
  const handleGeneratePayload = async () => {
    try {
      console.log('🔍 GÉNÉRATION PAYLOAD DEBUG - DIAGNOSTIC COMPLET');
      
      // Mock PDF for debugging
      const mockPdfBase64 = 'JVBERi0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0K';
      const mockPdfSizeKB = 150;
      
      // Log raw invoice data
      console.group('📋 DONNÉES BRUTES INVOICE');
      console.log('Invoice object:', {
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.client.name,
        clientEmail: invoice.client.email,
        clientPhone: invoice.client.phone,
        products: invoice.products.length,
        paymentMethod: invoice.payment.method,
        totalProducts: invoice.products.reduce((sum, p) => sum + (p.quantity * p.priceTTC), 0)
      });
      console.groupEnd();
      
      // Validate and prepare payload
      const validation = PayloadValidator.validateAndPrepare(invoice, mockPdfBase64, mockPdfSizeKB);
      
      // Create comprehensive debug data
      const debugInfo = {
        timestamp: new Date().toISOString(),
        validation: validation,
        rawInvoice: invoice,
        payloadSize: validation.payload ? JSON.stringify(validation.payload).length : 0,
        fieldMapping: {
          'client.name → clientName': invoice.client.name,
          'client.email → clientEmail': invoice.client.email,
          'client.phone → clientPhone': invoice.client.phone,
          'client.address → clientAddress': invoice.client.address,
          'products.length → products': invoice.products.length,
          'payment.method → paymentMethod': invoice.payment.method,
          'calculated totalHT': validation.payload?.totalHT,
          'calculated totalTTC': validation.payload?.totalTTC
        },
        requiredFieldsCheck: {
          clientEmail: !!invoice.client.email,
          clientPhone: !!invoice.client.phone,
          clientName: !!invoice.client.name,
          invoiceNumber: !!invoice.invoiceNumber,
          products: invoice.products.length > 0,
          paymentMethod: !!invoice.payment.method
        },
        stats: {
          jsonSize: validation.payload ? JSON.stringify(validation.payload).length : 0,
          productsCount: invoice.products.length,
          pdfSizeKB: mockPdfSizeKB,
          hasSignature: !!invoice.signature,
          termsAccepted: invoice.termsAccepted
        }
      };
      
      setDebugData(debugInfo);
      
      if (validation.isValid) {
        onSuccess('✅ Payload généré et validé avec succès');
      } else {
        onError(`❌ Erreurs de validation: ${validation.errors?.join(', ')}`);
      }
    } catch (error: any) {
      onError(`❌ Erreur génération payload: ${error.message}`);
    }
  };

  // Test N8N connection
  const handleTestConnection = async () => {
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

  // Copy payload to clipboard
  const handleCopyPayload = () => {
    if (debugData?.validation?.payload) {
      navigator.clipboard.writeText(JSON.stringify(debugData.validation.payload, null, 2));
      onSuccess('📋 Payload copié dans le presse-papiers');
    } else {
      onError('❌ Aucun payload à copier. Générez d\'abord le payload.');
    }
  };

  // Download debug data
  const handleDownloadDebug = () => {
    if (debugData) {
      const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debug-payload-${invoice.invoiceNumber}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onSuccess('📥 Fichier de debug téléchargé');
    } else {
      onError('❌ Aucune donnée de debug à télécharger');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 p-2 rounded-full">
            <Bug className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Centre de Debug</h2>
            <p className="text-gray-600">Diagnostic et validation du payload N8N</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleGeneratePayload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Générer Payload</span>
          </button>
          
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition-all"
          >
            <TestTube className="w-4 h-4" />
            <span>{isTesting ? 'Test...' : 'Test N8N'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'payload', label: 'Payload', icon: Database },
          { id: 'connection', label: 'Connexion', icon: Wifi },
          { id: 'logs', label: 'Logs', icon: FileText }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
              activeSection === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Debug Sections */}
      <div className="space-y-4">
        {activeSection === 'payload' && (
          <DebugSection
            title="Validation du Payload"
            icon={Database}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
          >
            {debugData ? (
              <div className="space-y-4">
                {/* Validation Status */}
                <div className={`p-4 rounded-lg ${
                  debugData.validation.isValid 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {debugData.validation.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    <h4 className={`font-bold ${
                      debugData.validation.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {debugData.validation.isValid ? 'Validation Réussie' : 'Erreurs de Validation'}
                    </h4>
                  </div>
                  
                  {!debugData.validation.isValid && debugData.validation.errors && (
                    <ul className="list-disc ml-5 space-y-1 text-red-700">
                      {debugData.validation.errors.map((error: string, index: number) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Field Mapping */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3">🗺️ Mapping des Champs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {Object.entries(debugData.fieldMapping).map(([mapping, value]) => {
                      const hasValue = value !== undefined && value !== null && value !== '';
                      return (
                        <div key={mapping} className="flex items-center space-x-2">
                          <span className={hasValue ? 'text-green-600' : 'text-red-600'}>
                            {hasValue ? '✅' : '❌'}
                          </span>
                          <span className="font-medium">{mapping}:</span>
                          <span className="text-gray-600 truncate">
                            {typeof value === 'string' && value.length > 20 
                              ? `${value.substring(0, 20)}...` 
                              : String(value || 'MANQUANT')
                            }
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Required Fields Check */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-800 mb-3">⚠️ Champs Obligatoires</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {Object.entries(debugData.requiredFieldsCheck).map(([field, isPresent]) => (
                      <div key={field} className="flex items-center space-x-2">
                        <span className={isPresent ? 'text-green-600' : 'text-red-600'}>
                          {isPresent ? '✅' : '❌'}
                        </span>
                        <span className={isPresent ? 'text-gray-700' : 'text-red-700 font-medium'}>
                          {field}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleCopyPayload}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copier Payload</span>
                  </button>
                  
                  <button
                    onClick={handleDownloadDebug}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger Debug</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Bug className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Aucun payload généré</p>
                <button
                  onClick={handleGeneratePayload}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Générer le Payload Debug
                </button>
              </div>
            )}
          </DebugSection>
        )}

        {activeSection === 'connection' && (
          <DebugSection
            title="Test de Connexion N8N"
            icon={Wifi}
            iconColor="text-green-600"
            bgColor="bg-green-50"
            borderColor="border-green-200"
          >
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">Configuration Webhook</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>URL:</strong> https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a</p>
                  <p><strong>Méthode:</strong> POST</p>
                  <p><strong>Content-Type:</strong> application/json</p>
                </div>
              </div>
              
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                <TestTube className="w-5 h-5" />
                <span>{isTesting ? 'Test en cours...' : 'Tester la Connexion N8N'}</span>
              </button>
            </div>
          </DebugSection>
        )}

        {activeSection === 'logs' && (
          <DebugSection
            title="Logs de Debug"
            icon={FileText}
            iconColor="text-purple-600"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
          >
            <div className="space-y-4">
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-64">
                <div>📋 Console Logs (ouvrez la console du navigateur pour voir les logs détaillés)</div>
                <div>🔍 Payload complet à envoyer: [Voir console]</div>
                <div>⚠️ Champs manquants: [Voir console]</div>
                <div>🗺️ Mapping des données: [Voir console]</div>
                <div>📊 Statistiques payload: [Voir console]</div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-2">💡 Instructions Debug</h4>
                <ol className="list-decimal ml-5 space-y-1 text-sm text-blue-700">
                  <li>Ouvrez la console du navigateur (F12)</li>
                  <li>Générez un payload pour voir les logs détaillés</li>
                  <li>Vérifiez que tous les champs requis sont présents</li>
                  <li>Copiez le payload pour le tester dans Postman</li>
                  <li>Dans n8n, activez "Listen for test event" pour voir les données reçues</li>
                </ol>
              </div>
            </div>
          </DebugSection>
        )}
      </div>

      {/* Statistics */}
      {debugData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-bold text-gray-800 mb-3">📊 Statistiques Debug</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{debugData.stats.jsonSize}</div>
              <div className="text-gray-600">Caractères JSON</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{debugData.stats.productsCount}</div>
              <div className="text-gray-600">Produits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{debugData.stats.pdfSizeKB}</div>
              <div className="text-gray-600">KB PDF</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {debugData.stats.hasSignature ? '✅' : '❌'}
              </div>
              <div className="text-gray-600">Signature</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};