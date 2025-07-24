/**
 * 🔧 SERVICE DE CONFIGURATION CENTRALISÉ
 * =====================================
 * Gestion unifiée de toutes les variables d'environnement
 * avec validation et valeurs par défaut
 */

interface AppConfig {
  // 📧 EmailJS
  emailjs: {
    publicKey: string;
    serviceId: string;
    templateId: string;
    fromEmail: string;
    replyTo: string;
  };
  
  // ☁️ Google Drive
  googleDrive: {
    apiKey: string;
    clientId: string;
    mainFolderId: string;
  };
  
  // 🔗 N8N Webhook
  n8n: {
    webhookUrl: string;
    secret?: string;
  };
  
  // 🏢 Entreprise
  company: {
    name: string;
    phone: string;
    email: string;
    address: string;
    siret: string;
  };
  
  // 📄 PDF
  pdf: {
    quality: number;
    maxSizeMB: number;
    compression: boolean;
  };
  
  // ⚙️ Application
  app: {
    debugMode: boolean;
    consoleLogs: boolean;
    autoSaveInterval: number;
    maxProductsPerInvoice: number;
    defaultTaxRate: number;
    currency: string;
  };
  
  // 🔄 Sauvegarde
  backup: {
    enabled: boolean;
    intervalHours: number;
  };
}

class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): AppConfig {
    return {
      emailjs: {
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
        fromEmail: import.meta.env.VITE_DEFAULT_EMAIL_FROM || 'noreply@myconfort.com',
        replyTo: import.meta.env.VITE_DEFAULT_EMAIL_REPLY_TO || 'contact@myconfort.com'
      },
      
      googleDrive: {
        apiKey: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || '',
        clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || '',
        mainFolderId: import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || ''
      },
      
      n8n: {
        webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a',
        secret: import.meta.env.VITE_N8N_WEBHOOK_SECRET
      },
      
      company: {
        name: import.meta.env.VITE_COMPANY_NAME || 'HT CONFORT',
        phone: import.meta.env.VITE_COMPANY_PHONE || '+33 X XX XX XX XX',
        email: import.meta.env.VITE_COMPANY_EMAIL || 'contact@htconfort.com',
        address: import.meta.env.VITE_COMPANY_ADDRESS || 'Adresse à configurer',
        siret: import.meta.env.VITE_COMPANY_SIRET || 'SIRET à configurer'
      },
      
      pdf: {
        quality: parseFloat(import.meta.env.VITE_PDF_QUALITY) || 0.8,
        maxSizeMB: parseInt(import.meta.env.VITE_PDF_MAX_SIZE_MB) || 5,
        compression: import.meta.env.VITE_PDF_COMPRESSION === 'true'
      },
      
      app: {
        debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
        consoleLogs: import.meta.env.VITE_CONSOLE_LOGS === 'true',
        autoSaveInterval: parseInt(import.meta.env.VITE_AUTO_SAVE_INTERVAL) || 60000,
        maxProductsPerInvoice: parseInt(import.meta.env.VITE_MAX_PRODUCTS_PER_INVOICE) || 50,
        defaultTaxRate: parseFloat(import.meta.env.VITE_DEFAULT_TAX_RATE) || 20,
        currency: import.meta.env.VITE_CURRENCY || 'EUR'
      },
      
      backup: {
        enabled: import.meta.env.VITE_BACKUP_ENABLED === 'true',
        intervalHours: parseInt(import.meta.env.VITE_BACKUP_INTERVAL_HOURS) || 24
      }
    };
  }

  private validateConfig(): void {
    const issues: string[] = [];

    // Validation EmailJS
    if (!this.config.emailjs.publicKey) {
      issues.push('VITE_EMAILJS_PUBLIC_KEY manquant');
    }
    if (!this.config.emailjs.serviceId) {
      issues.push('VITE_EMAILJS_SERVICE_ID manquant');
    }
    if (!this.config.emailjs.templateId) {
      issues.push('VITE_EMAILJS_TEMPLATE_ID manquant');
    }

    // Validation Google Drive (optionnel)
    if (this.config.googleDrive.apiKey && !this.config.googleDrive.clientId) {
      issues.push('VITE_GOOGLE_DRIVE_CLIENT_ID requis si API key fournie');
    }

    // Validation N8N
    if (!this.config.n8n.webhookUrl) {
      issues.push('VITE_N8N_WEBHOOK_URL manquant');
    }

    // Log des problèmes en mode développement
    if (issues.length > 0 && import.meta.env.DEV) {
      console.warn('🔧 Problèmes de configuration détectés:', issues);
    }
  }

  // Getters pour accéder à la configuration
  get emailjs() { return this.config.emailjs; }
  get googleDrive() { return this.config.googleDrive; }
  get n8n() { return this.config.n8n; }
  get company() { return this.config.company; }
  get pdf() { return this.config.pdf; }
  get app() { return this.config.app; }
  get backup() { return this.config.backup; }

  // Méthodes utilitaires
  isEmailJSConfigured(): boolean {
    return !!(this.config.emailjs.publicKey && 
             this.config.emailjs.serviceId && 
             this.config.emailjs.templateId);
  }

  isGoogleDriveConfigured(): boolean {
    return !!(this.config.googleDrive.apiKey && 
             this.config.googleDrive.clientId);
  }

  isN8NConfigured(): boolean {
    return !!this.config.n8n.webhookUrl;
  }

  // Méthode pour afficher l'état de la configuration
  getConfigStatus(): { service: string; configured: boolean; required: boolean }[] {
    return [
      { service: 'EmailJS', configured: this.isEmailJSConfigured(), required: true },
      { service: 'Google Drive', configured: this.isGoogleDriveConfigured(), required: false },
      { service: 'N8N Webhook', configured: this.isN8NConfigured(), required: true }
    ];
  }

  // Méthode pour logs de debug
  logConfig(): void {
    if (this.config.app.debugMode && this.config.app.consoleLogs) {
      console.group('🔧 Configuration Application');
      console.log('EmailJS configuré:', this.isEmailJSConfigured());
      console.log('Google Drive configuré:', this.isGoogleDriveConfigured());
      console.log('N8N configuré:', this.isN8NConfigured());
      console.log('Mode debug:', this.config.app.debugMode);
      console.log('Sauvegarde auto:', this.config.backup.enabled);
      console.groupEnd();
    }
  }
}

// Export de l'instance singleton
export const configService = ConfigService.getInstance();

// Export du type pour TypeScript
export type { AppConfig };
