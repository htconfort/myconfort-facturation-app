import { ValidatedInvoicePayload, PayloadValidator } from './payloadValidator';
import { Invoice } from '../types';

// 🚀 SERVICE D'ENVOI VERS N8N AVEC VALIDATION
export class N8nWebhookService {
  private static readonly WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a';
  private static readonly TIMEOUT_MS = 30000; // 30 secondes
  
  /**
   * Envoie une facture validée vers n8n
   */
  static async sendInvoiceToN8n(
    invoice: Invoice, 
    pdfBase64: string, 
    pdfSizeKB: number
  ): Promise<{
    success: boolean;
    message: string;
    response?: any;
    payload?: ValidatedInvoicePayload;
  }> {
    try {
      console.log('🚀 DIAGNOSTIC COMPLET AVANT ENVOI N8N');
      
      // 1. Valider et préparer le payload
      const validation = PayloadValidator.validateAndPrepare(invoice, pdfBase64, pdfSizeKB);
      
      if (!validation.isValid) {
        const errorMessage = `❌ Validation échouée:\n${validation.errors?.join('\n')}`;
        console.error(errorMessage);
        
        return {
          success: false,
          message: errorMessage
        };
      }
      
      const validatedPayload = validation.payload!;
      
      // 2. 🎯 DIAGNOSTIC FINAL AVANT ENVOI (PRIORITÉ ABSOLUE)
      PayloadLogger.logBeforeWebhookSend(validatedPayload);
      
      // 3. 🗺️ VÉRIFICATION MAPPING WEBHOOK
      console.group('🗺️ MAPPING WEBHOOK N8N - VÉRIFICATION FINALE');
      console.log('🎯 URL Webhook:', this.WEBHOOK_URL);
      console.log('📊 Taille payload:', JSON.stringify(validatedPayload).length, 'caractères');
      
      // Vérification du mapping des champs critiques pour n8n
      const webhookMapping = {
        'clientEmail → email': validatedPayload.clientEmail,
        'clientPhone → phone': validatedPayload.clientPhone,
        'totalHT → montantHT': validatedPayload.totalHT,
        'totalTTC → montantTTC': validatedPayload.totalTTC,
        'clientName → nom_client': validatedPayload.clientName,
        'invoiceNumber → numero_facture': validatedPayload.invoiceNumber,
        'pdfBase64 → fichier_facture': validatedPayload.pdfBase64 ? 'PDF_PRESENT' : 'PDF_MISSING',
        'products → produits': validatedPayload.products?.length || 0
      };
      
      Object.entries(webhookMapping).forEach(([mapping, value]) => {
        const hasValue = value !== undefined && value !== null && value !== '';
        console.log(`${hasValue ? '✅' : '❌'} ${mapping}:`, 
          typeof value === 'string' && value.length > 30 ? `${value.substring(0, 30)}...` : value
        );
      });
      console.groupEnd();
      
      // 4. Envoyer vers n8n avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, this.TIMEOUT_MS);
      
      try {
        console.log('📤 ENVOI EN COURS VERS N8N...');
        
        const response = await fetch(this.WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'MYCONFORT-Invoice-System/1.0'
          },
          body: JSON.stringify(validatedPayload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // 5. Analyser la réponse
        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { message: responseText };
        }
        
        console.group('📥 RÉPONSE N8N');
        console.log('🔢 Status:', response.status);
        console.log('📄 Headers:', Object.fromEntries(response.headers.entries()));
        console.log('📋 Body:', responseData);
        
        // Diagnostic de la réponse
        if (response.ok) {
          console.log('✅ WEBHOOK N8N A REÇU LE PAYLOAD AVEC SUCCÈS');
        } else {
          console.error('❌ WEBHOOK N8N A REJETÉ LE PAYLOAD');
          console.error('🔍 Vérifiez le workflow n8n et les champs attendus');
        }
        console.groupEnd();
        
        if (!response.ok) {
          const errorMessage = `❌ Erreur HTTP ${response.status}: ${responseText}`;
          console.error(errorMessage);
          
          return {
            success: false,
            message: errorMessage,
            response: responseData,
            payload: validatedPayload
          };
        }
        
        const successMessage = `✅ Facture ${validatedPayload.invoiceNumber} envoyée avec succès vers n8n`;
        console.log(successMessage);
        
        return {
          success: true,
          message: successMessage,
          response: responseData,
          payload: validatedPayload
        };
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          const timeoutMessage = `❌ Timeout: n8n ne répond pas dans les ${this.TIMEOUT_MS/1000}s`;
          console.error(timeoutMessage);
          
          return {
            success: false,
            message: timeoutMessage,
            payload: validatedPayload
          };
        }
        
        const networkMessage = `❌ Erreur réseau: ${fetchError.message}`;
        console.error(networkMessage);
        
        return {
          success: false,
          message: networkMessage,
          payload: validatedPayload
        };
      }
      
    } catch (error: any) {
      const unexpectedMessage = `❌ Erreur inattendue: ${error.message}`;
      console.error(unexpectedMessage, error);
      
      return {
        success: false,
        message: unexpectedMessage
      };
    }
  }
  
  /**
   * Test de connectivité vers n8n
   */
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    try {
      console.log('🧪 TEST DE CONNECTIVITÉ N8N');
      
      const startTime = Date.now();
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'MYCONFORT-Test'
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // 10 secondes pour le test
      
      try {
        const response = await fetch(this.WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testPayload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          const successMessage = `✅ n8n accessible (${responseTime}ms)`;
          console.log(successMessage);
          
          return {
            success: true,
            message: successMessage,
            responseTime
          };
        } else {
          const errorMessage = `❌ n8n répond avec erreur ${response.status}`;
          console.error(errorMessage);
          
          return {
            success: false,
            message: errorMessage,
            responseTime
          };
        }
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          return {
            success: false,
            message: '❌ Timeout: n8n ne répond pas'
          };
        }
        
        return {
          success: false,
          message: `❌ Erreur de connexion: ${fetchError.message}`
        };
      }
      
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Erreur test: ${error.message}`
      };
    }
  }
}