import React from 'react';
import { AlertTriangle, X, RefreshCw, ExternalLink, Copy } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  details?: string;
  error?: Error;
  showRetry?: boolean;
  onRetry?: () => void;
  showSupport?: boolean;
  supportEmail?: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title = "Une erreur s'est produite",
  message,
  details,
  error,
  showRetry = false,
  onRetry,
  showSupport = true,
  supportEmail = "support@htconfort.com"
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = React.useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyError = async () => {
    const errorInfo = {
      title,
      message,
      details,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorInfo, null, 2));
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 3000);
    } catch (err) {
      console.error('Impossible de copier:', err);
    }
  };

  const handleSendSupport = () => {
    const subject = encodeURIComponent(`Erreur Application MyComfort: ${title}`);
    const body = encodeURIComponent(`
Bonjour,

J'ai rencontré une erreur dans l'application MyComfort Facturation:

Titre: ${title}
Message: ${message}
${details ? `Détails: ${details}` : ''}
${error ? `Erreur technique: ${error.message}` : ''}

Informations techniques:
- Navigateur: ${navigator.userAgent}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}

Merci de m'aider à résoudre ce problème.

Cordialement
    `);
    
    window.open(`mailto:${supportEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Message principal */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">{message}</p>
            {details && (
              <p className="text-red-700 text-sm mt-2">{details}</p>
            )}
          </div>

          {/* Détails techniques (développement) */}
          {(error || import.meta.env.DEV) && (
            <div className="space-y-2">
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                {showTechnicalDetails ? 'Masquer' : 'Afficher'} les détails techniques
              </button>
              
              {showTechnicalDetails && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">Informations techniques</h4>
                    <button
                      onClick={handleCopyError}
                      className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded flex items-center space-x-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedToClipboard ? 'Copié!' : 'Copier'}</span>
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-700 font-mono space-y-2">
                    {error && (
                      <>
                        <div>
                          <strong>Type:</strong> {error.name}
                        </div>
                        <div>
                          <strong>Message:</strong> {error.message}
                        </div>
                        {error.stack && (
                          <div>
                            <strong>Stack:</strong>
                            <pre className="whitespace-pre-wrap text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto max-h-32">
                              {error.stack}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                    <div>
                      <strong>Timestamp:</strong> {new Date().toISOString()}
                    </div>
                    <div>
                      <strong>URL:</strong> {window.location.href}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Solutions suggérées */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Solutions suggérées</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc ml-4">
              <li>Rechargez la page (Ctrl+F5)</li>
              <li>Vérifiez votre connexion internet</li>
              <li>Videz le cache de votre navigateur</li>
              {showRetry && <li>Essayez de relancer l'action</li>}
              {showSupport && <li>Contactez le support si le problème persiste</li>}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Fermer
            </button>
            
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Réessayer</span>
              </button>
            )}
          </div>
          
          {showSupport && (
            <button
              onClick={handleSendSupport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Contacter le support</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
