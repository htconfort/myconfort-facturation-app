import emailjs from '@emailjs/browser';
import { Invoice } from './invoiceStorage';
import { getPDFBlob } from './pdfGenerator';

// Configuration EmailJS (à personnaliser avec vos clés)
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_ymw6jih',
  TEMPLATE_ID: 'template_yng4k8s',
  PUBLIC_KEY: 'A--fD137SFPmUMUUvjz2m'
};

// Interface pour les paramètres d'email
interface EmailParams {
  to_email: string;
  to_name: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: string;
  company_name: string;
  message?: string;
}

// Fonction principale d'envoi de PDF par email
export const sendPDFByEmail = async (
  invoice: Invoice, 
  recipientEmail?: string,
  customMessage?: string
): Promise<boolean> => {
  try {
    console.log('📧 Préparation de l\'envoi email pour:', invoice.invoiceNumber);
    
    // Générer le PDF
    const pdfBlob = await getPDFBlob(invoice);
    
    // Préparer les paramètres de l'email
    const emailParams: EmailParams = {
      to_email: recipientEmail || invoice.clientEmail || '',
      to_name: invoice.clientName,
      invoice_number: invoice.invoiceNumber,
      invoice_date: invoice.date,
      total_amount: `${invoice.total.toFixed(2)} €`,
      company_name: 'MyComfort',
      message: customMessage || `Veuillez trouver ci-joint votre facture ${invoice.invoiceNumber}.`
    };

    // Vérifier que l'email destinataire existe
    if (!emailParams.to_email) {
      throw new Error('Adresse email du client manquante');
    }

    // Convertir le PDF en base64 pour l'envoi
    const pdfBase64 = await blobToBase64(pdfBlob);
    
    // Ajouter le PDF aux paramètres
    const emailParamsWithPDF = {
      ...emailParams,
      pdf_attachment: pdfBase64,
      pdf_filename: `Facture_${invoice.invoiceNumber}_${invoice.clientName.replace(/\s+/g, '_')}.pdf`
    };

    // Envoyer l'email via EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      emailParamsWithPDF,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('✅ Email envoyé avec succès:', response);
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi email:', error);
    throw error;
  }
};

// Fonction pour envoyer un email simple sans PDF
export const sendSimpleEmail = async (
  invoice: Invoice,
  recipientEmail?: string,
  customMessage?: string
): Promise<boolean> => {
  try {
    const emailParams: EmailParams = {
      to_email: recipientEmail || invoice.clientEmail || '',
      to_name: invoice.clientName,
      invoice_number: invoice.invoiceNumber,
      invoice_date: invoice.date,
      total_amount: `${invoice.total.toFixed(2)} €`,
      company_name: 'MyComfort',
      message: customMessage || `Votre facture ${invoice.invoiceNumber} est disponible.`
    };

    if (!emailParams.to_email) {
      throw new Error('Adresse email du client manquante');
    }

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      emailParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('✅ Email simple envoyé:', response);
    return true;

  } catch (error) {
    console.error('❌ Erreur envoi email simple:', error);
    throw error;
  }
};

// Fonction utilitaire pour convertir Blob en Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Retirer le préfixe data:application/pdf;base64,
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Fonction pour initialiser EmailJS (à appeler au démarrage de l'app)
export const initializeEmailJS = () => {
  try {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    console.log('✅ EmailJS initialisé');
  } catch (error) {
    console.error('❌ Erreur initialisation EmailJS:', error);
  }
};

// Fonction pour tester la configuration EmailJS
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    const testParams = {
      to_email: 'test@example.com',
      to_name: 'Test Client',
      invoice_number: 'TEST-001',
      invoice_date: new Date().toLocaleDateString('fr-FR'),
      total_amount: '100.00 €',
      company_name: 'MyComfort',
      message: 'Ceci est un test de configuration EmailJS'
    };

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      testParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('✅ Test EmailJS réussi');
    return true;

  } catch (error) {
    console.error('❌ Test EmailJS échoué:', error);
    return false;
  }
};

// Export des constantes de configuration pour modification
export { EMAILJS_CONFIG };