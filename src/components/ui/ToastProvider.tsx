import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé dans un ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const newToast = { ...toast, id };
    
    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts];
      return updatedToasts.slice(0, maxToasts);
    });

    // Auto-remove après la durée spécifiée (défaut: 5s)
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  const success = (message: string, duration?: number) => {
    addToast({ message, type: 'success', duration });
  };

  const error = (message: string, duration?: number) => {
    addToast({ message, type: 'error', duration: duration ?? 7000 }); // Erreurs durent plus longtemps
  };

  const warning = (message: string, duration?: number) => {
    addToast({ message, type: 'warning', duration });
  };

  const info = (message: string, duration?: number) => {
    addToast({ message, type: 'info', duration });
  };

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info
    }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-500 text-white border-green-600',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'error':
        return {
          container: 'bg-red-500 text-white border-red-600',
          icon: <AlertCircle className="w-5 h-5" />
        };
      case 'warning':
        return {
          container: 'bg-yellow-500 text-white border-yellow-600',
          icon: <AlertTriangle className="w-5 h-5" />
        };
      case 'info':
        return {
          container: 'bg-blue-500 text-white border-blue-600',
          icon: <Info className="w-5 h-5" />
        };
      default:
        return {
          container: 'bg-gray-500 text-white border-gray-600',
          icon: <Info className="w-5 h-5" />
        };
    }
  };

  const styles = getToastStyles(toast.type);

  return (
    <div className={`
      ${styles.container} 
      border-l-4 rounded-lg shadow-lg p-4 pr-8 relative
      transform transition-all duration-300 ease-in-out
      animate-in slide-in-from-right-full
    `}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium leading-5">
            {toast.message}
          </p>
          
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-xs underline hover:no-underline opacity-90 hover:opacity-100"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded transition-colors"
        aria-label="Fermer la notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Hook utilitaire pour remplacer les alert() par des toasts
export const useReplaceAlerts = () => {
  const { success, error, warning, info, addToast } = useToast();

  return {
    alert: (message: string) => info(message),
    success: (message: string) => success(message),
    error: (message: string) => error(message),
    warning: (message: string) => warning(message),
    confirm: (message: string): Promise<boolean> => {
      return new Promise((resolve) => {
        addToast({
          message,
          type: 'warning',
          duration: 0, // Ne disparaît pas automatiquement
          action: {
            label: 'Confirmer',
            onClick: () => resolve(true)
          }
        });
        
        // Option d'annulation après 10 secondes
        setTimeout(() => resolve(false), 10000);
      });
    }
  };
};
