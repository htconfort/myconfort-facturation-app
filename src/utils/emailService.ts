import emailjs from '@emailjs/browser';
import { Invoice } from '../types';
import { PDFService } from '../services/pdfService'; // Import PDFService

// Initialisation d'EmailJS
export const initializeEmailJS = () => {
  emailjs.init("YOUR_EMAILJS_PUBLIC_KEY"); // Remplacez par votre clé publique EmailJS
  console.log("EmailJS initialisé.");
};

// Fonction pour envoyer le PDF par email
export const sendPDFByEmail = async (
  invoice: Invoice, 
  recipientEmail: string, 
  invoicePdfRef: React.RefObject<HTMLDivElement> // Pass the ref here
): Promise<boolean> => {
  try {
    if (!invoicePdfRef.current) {
      throw new Error("Invoice PDF preview element not found for email generation.");
    }

    // Générer le PDF en tant que Blob
    const pdfBlob = await PDFService.generateInvoicePDF(invoice, invoicePdfRef);

    // Convertir le Blob en Base64
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);

    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64Pdf = reader.result as string;
        
        const templateParams = {
          to_email: recipientEmail,
          from_name: "MYCONFORT",
          message: `Bonjour ${invoice.client.name},\n\nVeuillez trouver ci-joint votre facture MYCONFORT n°${invoice.invoiceNumber}.\n\nCordialement,\nL'équipe MYCONFORT`,
          invoice_number: invoice.invoiceNumber,
          client_name: invoice.client.name,
          invoice_date: invoice.invoiceDate,
          total_amount: invoice.montant_ttc?.toFixed(2) || invoice.products.reduce((sum, p) => sum + p.priceTTC * p.quantity, 0).toFixed(2),
          pdf_attachment: base64Pdf.split(',')[1], // Remove data:application/pdf;base64, prefix
        };

        try {
          await emailjs.send("YOUR_EMAILJS_SERVICE_ID", "YOUR_EMAILJS_TEMPLATE_ID", templateParams); // Remplacez par vos IDs
          console.log("Email envoyé avec succès !");
          resolve(true);
        } catch (error) {
          console.error("Erreur lors de l'envoi de l'email:", error);
          reject(false);
        }
      };
      reader.onerror = (error) => {
        console.error("Erreur lors de la lecture du Blob:", error);
        reject(false);
      };
    });
  } catch (error) {
    console.error("Erreur lors de la préparation de l'email:", error);
    return false;
  }
};
