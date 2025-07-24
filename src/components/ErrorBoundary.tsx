import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log de l'erreur pour debugging
    console.error('🚨 ErrorBoundary a capturé une erreur:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
    
    // En production, vous pourriez envoyer cette erreur à un service de monitoring
    // comme Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Interface d'erreur personnalisée
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Oups ! Une erreur s'est produite
            </h1>
            
            <p className="text-gray-600 mb-6">
              L'application a rencontré un problème inattendu. 
              Ne vous inquiétez pas, vos données sont sauvegardées.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <summary className="cursor-pointer font-medium text-red-800 mb-2">
                  Détails techniques (développement)
                </summary>
                <div className="text-xs text-red-700 font-mono">
                  <div className="mb-2">
                    <strong>Erreur:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Composant:</strong>
                      <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="flex space-x-3 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Réessayer</span>
              </button>
              
              <button
                onClick={this.handleReload}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Recharger</span>
              </button>
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>Si le problème persiste, contactez le support technique.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
