import React, { useState, useEffect } from 'react';
import { X, Save, Mail, TestTube, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { EmailService } from '../services/emailService';

interface EmailJSConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const EmailJSConfigurationModal: React.FC<EmailJSConfigurationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const [serviceId, setServiceId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      const config = EmailService.getConfig();
      setServiceId(config.serviceId);
      setTemplateId(config.templateId);
      setPublicKey(config.publicKey);
      setTestResult(null); // Reset test result when modal opens
    }
  }, [isOpen]);

  const handleSaveConfig = () => {
    setIsSaving(true);
    try {
      if (!serviceId.trim() || !templateId.trim() || !publicKey.trim()) {
        onError('❌ Tous les champs EmailJS sont requis.');
        setIsSaving(false);
        return;
      }
      EmailService.updateConfig(serviceId, templateId, publicKey);
      onSuccess('✅ Configuration EmailJS mise à jour avec succès !');
      setIsSaving(false);
    } catch (error: any) {
      onError(`❌ Erreur lors de l'enregistrement: ${error.message}`);
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await EmailService.testEmailJSIntegration();
      setTestResult(result);
      if (result.success) {
        onSuccess(result.message);
      } else {
        onError(result.message);
      }
    } catch (error: any) {
      const errorMessage = `❌ Erreur lors du test: ${error.message || 'Erreur inconnue'}`;
      setTestResult({
        success: false,
        message: errorMessage
      });
      onError(errorMessage);
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuration EmailJS" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Intégration EmailJS</h3>
              <p className="text-purple-100">Configurez vos identifiants EmailJS pour envoyer des factures</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-purple-100">
            Ces identifiants sont nécessaires pour envoyer des emails directement depuis l'application.
          </p>
        </div>

        {/* Formulaire de configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Service ID *
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="your_service_id"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Trouvable dans votre tableau de bord EmailJS (Email Services)
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Template ID *
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="your_template_id"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Trouvable dans votre tableau de bord EmailJS (Email Templates)
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Public Key *
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="your_public_key"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Trouvable dans votre tableau de bord EmailJS (Account -> API Keys)
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-800 mb-2">Comment configurer EmailJS :</h4>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-purple-700">
            <li>Créez un compte sur <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">EmailJS.com</a></li>
            <li>Ajoutez un nouveau "Email Service" (ex: Gmail)</li>
            <li>Créez un nouveau "Email Template" avec les variables nécessaires (ex: `{{to_name}}`, `{{from_name}}`, `{{message}}`, `{{invoice_attachment}}`)</li>
            <li>Copiez le Service ID, Template ID et votre Public Key dans les champs ci-dessus</li>
            <li>Testez la connexion pour vérifier que tout fonctionne</li>
          </ol>
        </div>

        {/* Résultat du test */}
        {testResult && (
          <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start space-x-2">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {testResult.success ? '✅ Test réussi !' : '❌ Test échoué'}
                </p>
                <div className={`text-sm mt-1 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult.message.split('\n').map((line: string, index: number) => (
                    <div key={index} className={index > 0 ? 'mt-1' : ''}>
                      {line.startsWith('•') ? (
                        <div className="ml-2">{line}</div>
                      ) : (
                        line
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={onClose}
            disabled={isSaving || isTesting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
          >
            Fermer
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleTestConnection}
              disabled={!serviceId.trim() || !templateId.trim() || !publicKey.trim() || isSaving || isTesting}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Test en cours...</span>
                </>
              ) : (
                <>
                  <TestTube className="w-5 h-5" />
                  <span>Tester la connexion</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSaveConfig}
              disabled={!serviceId.trim() || !templateId.trim() || !publicKey.trim() || isSaving}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
