import React, { useState, useEffect, useRef } from "react";
import { Save, Download, Cloud, CloudOff, Send, Loader } from "lucide-react";
import { initializeEmailJS } from '../utils/emailService';
import { createHTConfortInvoice, testHTConfortInvoice, SimpleClient, SimpleItem } from '../utils/invoiceGenerator';
import { supabase } from '../utils/supabaseClient';
import { clientService, invoiceService, productService, testSupabaseConnection } from '../utils/supabaseService';
import type { Client, Invoice as SupabaseInvoice, Product } from '../utils/supabaseService';
import { Invoice } from '../types'; // Import the full Invoice type
import { InvoicePDF } from '../components/InvoicePDF'; // Import the InvoicePDF component
import { PDFService } from '../services/pdfService'; // Import PDFService
import { prepareInvoicePayload, sendInvoice } from '../services/invoiceApiService'; // Import API service
import { saveAs } from 'file-saver'; // For downloading PDF

// Déclaration pour html2canvas (déjà inclus via CDN)
declare global {
  interface Window {
    html2canvas: any;
  }
}

export default function MyComfortApp() {
  // === Formulaire client ===
  const [client, setClient] = useState({
    nom: "",
    adresse: "",
    ville: "",
    codePostal: "",
    telephone: "",
    email: "",
    siret: "",
    housingType: "", // New field
    doorCode: "",    // New field
  });

  // === Bibliothèque produits ===
  const produitsCatalogue = [
    { categorie: "Matelas", taille: "70 x 190", nom: "MATELAS BAMBOU 70 x 190", prix: 900 },
    { categorie: "Matelas", taille: "80 x 200", nom: "MATELAS BAMBOU 80 x 200", prix: 1050 },
    { categorie: "Matelas", taille: "90 x 190", nom: "MATELAS BAMBOU 90 x 190", prix: 1110 },
    { categorie: "Matelas", taille: "90 x 200", nom: "MATELAS BAMBOU 90 x 200", prix: 1150 },
    { categorie: "Matelas", taille: "120 x 190", nom: "MATELAS BAMBOU 120 x 190", prix: 1600 },
    { categorie: "Matelas", taille: "140 x 190", nom: "MATELAS BAMBOU 140 x 190", prix: 1800 },
    { categorie: "Matelas", taille: "140 x 200", nom: "MATELAS BAMBOU 140 x 200", prix: 1880 },
    { categorie: "Matelas", taille: "160 x 200", nom: "MATELAS BAMBOU 160 x 200", prix: 2100 },
    { categorie: "Matelas", taille: "180 x 200", nom: "MATELAS BAMBOU 180 x 200", prix: 2200 },
    { categorie: "Matelas", taille: "200 x 200", nom: "MATELAS BAMBOU 200 x 200", prix: 2300 },
    { categorie: "Oreiller", taille: "60 x 40", nom: "OREILLER BAMBOU 60 x 40", prix: 80 },
    { categorie: "Couette", taille: "220 x 240", nom: "COUETTE BAMBOU 220 x 240", prix: 210 },
    { categorie: "Couette", taille: "240 x 260", nom: "COUETTE BAMBOU 240 x 260", prix: 270 }
  ];

  const [catSel, setCatSel] = useState("");
  const [tailleSel, setTailleSel] = useState("");
  const [qteSel, setQteSel] = useState(1);
  const [produitTrouve, setProduitTrouve] = useState(null);
  const [produits, setProduits] = useState<any[]>([]); // Update to any[] for now, will map to Product type

  // === Nouveaux états pour la facture complète ===
  const invoicePdfRef = useRef<HTMLDivElement>(null); // Ref for InvoicePDF component

  const [invoiceNumber, setInvoiceNumber] = useState(`FAC-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [eventLocation, setEventLocation] = useState('Foire de Paris');
  const [advisorName, setAdvisorName] = useState('Bruno Priem');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [taxRate, setTaxRate] = useState(20); // Default TVA 20%
  const [deliveryMethod, setDeliveryMethod] = useState('Standard');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Virement');
  const [depositAmount, setDepositAmount] = useState(0);
  const [isSigned, setIsSigned] = useState(false);
  const [signatureImage, setSignatureImage] = useState('https://i.imgur.com/2Q9Q9Q9.png'); // Placeholder signature image
  const [descriptionTravaux, setDescriptionTravaux] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 7 days from now
  const [invoiceStatus, setInvoiceStatus] = useState('draft');

  // État de connexion Google Drive
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // États Supabase
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<SupabaseInvoice[]>([]);
  const [savedClients, setSavedClients] = useState<Client[]>([]);
  const [supabaseProducts, setSupabaseProducts] = useState<Product[]>([]);
  const [isSaving, setIsSaving] = useState(false); // New state for saving
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false); // New state for PDF download
  const [isSendingToN8N, setIsSendingToN8N] = useState(false); // New state for n8n sending

  // n8n Webhook URL (CRITICAL: Replace with your actual n8n webhook URL)
  const N8N_WEBHOOK_URL = 'https://your-n8n-webhook-url.com/invoice-data';

  // Initialiser EmailJS au chargement
  useEffect(() => {
    initializeEmailJS();
    
    // Test de la fonction createHTConfortInvoice
    console.log('🧪 Test de création de facture HT Confort...');
    try {
      const testInvoice = testHTConfortInvoice();
      console.log('✅ Facture test créée:', testInvoice);
      console.log('📧 Email client:', testInvoice.clientEmail);
      console.log('💰 Total:', testInvoice.total, '€');
    } catch (error) {
      console.error('❌ Erreur test facture:', error);
    }
    initializeSupabase();
  }, []);
  
  // Initialiser Supabase
  const initializeSupabase = async () => {
    try {
      console.log('🔄 Test connexion Supabase...');
      const isConnected = await testSupabaseConnection();
      setIsSupabaseConnected(isConnected);
      
      if (isConnected) {
        console.log('✅ Supabase connecté !');
        await loadSupabaseData();
      } else {
        console.warn('⚠️ Supabase non connecté');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation Supabase:', error);
    }
  };
  
  // Charger les données depuis Supabase
  const loadSupabaseData = async () => {
    try {
      // Charger les factures
      const invoices = await invoiceService.getAll();
      setSavedInvoices(invoices);
      console.log(`📄 ${invoices.length} factures chargées`);
      
      // Charger les clients
      const clients = await clientService.getAll();
      setSavedClients(clients);
      console.log(`👥 ${clients.length} clients chargés`);
      
      // Charger les produits
      const products = await productService.getAll();
      setSupabaseProducts(products);
      console.log(`🛍️ ${products.length} produits chargés`);
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    }
  };

  useEffect(() => {
    if (catSel && tailleSel) {
      const prod = produitsCatalogue.find(p => p.categorie === catSel && p.taille === tailleSel);
      setProduitTrouve(prod || null);
    } else {
      setProduitTrouve(null);
    }
  }, [catSel, tailleSel]);

  const taillesDispo = catSel
    ? [...new Set(produitsCatalogue.filter(p => p.categorie === catSel).map(p => p.taille))]
    : [];

  const supprimerProduit = idx => {
    setProduits(produits.filter((_, i) => i !== idx));
  };

  const total = produits.reduce((acc, p) => acc + p.prix * p.quantite, 0);

  // Function to get the full Invoice object from state
  const getInvoiceDataForPayload = (): Invoice => {
    return {
      invoiceNumber: invoiceNumber,
      invoiceDate: invoiceDate,
      eventLocation: eventLocation,
      advisorName: advisorName,
      invoiceNotes: invoiceNotes,
      termsAccepted: termsAccepted,
      taxRate: taxRate,
      client: {
        name: client.nom,
        address: client.adresse,
        postalCode: client.codePostal,
        city: client.ville,
        phone: client.telephone,
        email: client.email,
        siret: client.siret,
        housingType: client.housingType,
        doorCode: client.doorCode,
      },
      delivery: {
        method: deliveryMethod,
        notes: deliveryNotes,
      },
      payment: {
        method: paymentMethod,
        depositAmount: depositAmount,
      },
      products: produits.map(p => ({
        name: p.nom,
        category: p.categorie, // Assuming 'categorie' is available in `produits`
        quantity: p.quantite,
        unitPrice: p.prix / (1 + (taxRate / 100)), // Derive HT from TTC
        priceTTC: p.prix,
        discount: p.discount || 0, // Default to 0 if not set
        discountType: p.discountType || 'amount', // Default to 'amount' if not set
      })),
      description_travaux: descriptionTravaux,
      isSigned: isSigned,
      signature: signatureImage,
      dueDate: dueDate,
      status: invoiceStatus,
    };
  };

  // Fonctions de sauvegarde et PDF
  const saveToSupabase = async () => {
    if (!isSupabaseConnected) {
      alert("⚠️ Supabase non connecté ! Impossible de sauvegarder.");
      return;
    }
    
    setIsSaving(true); // Set saving state to true
    try {
      alert("💾 Sauvegarde en cours...");
      
      // Créer ou récupérer le client
      let clientId = null;
      if (client.email) {
        const existingClients = await clientService.search(client.email);
        if (existingClients.length > 0) {
          clientId = existingClients[0].id;
        } else {
          const newClient = await clientService.create({
            name: client.nom,
            email: client.email,
            phone: client.telephone,
            address: client.adresse,
            city: client.ville,
            postal_code: client.codePostal,
            siret: client.siret
          });
          clientId = newClient.id;
        }
      }
      
      // Préparer les données de facture
      const invoiceData = {
        client_id: clientId,
        client_name: client.nom,
        client_address: `${client.adresse}\n${client.ville} ${client.codePostal}`,
        client_phone: client.telephone,
        client_email: client.email,
        subtotal: total / 1.2,
        tax: total - (total / 1.2),
        total: total,
        status: 'draft',
        event_location: 'MyComfort - Solutions de confort'
      };
      
      // Préparer les articles
      const items = produits.map(p => ({
        description: `${p.nom} (${p.taille})`,
        quantity: p.quantite,
        unit_price: p.prix,
        total: p.prix * p.quantite
      }));
      
      // Sauvegarder dans Supabase
      const savedInvoice = await invoiceService.create(invoiceData, items);
      
      // Recharger les données
      await loadSupabaseData();
      
      alert(`✅ Facture ${savedInvoice.invoice_number} sauvegardée dans Supabase !`);
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde Supabase:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setIsSaving(false); // Set saving state to false
    }
  };

  const downloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      if (!invoicePdfRef.current) {
        throw new Error("Invoice PDF preview element not found.");
      }
      const fullInvoice = getInvoiceDataForPayload();
      const pdfBlob = await PDFService.generateInvoicePDF(fullInvoice, invoicePdfRef);
      saveAs(pdfBlob, `Facture-${fullInvoice.client.name || "client"}-${fullInvoice.invoiceNumber}.pdf`);
      alert("✅ PDF téléchargé avec succès !");
    } catch (error) {
      console.error('❌ Erreur téléchargement PDF:', error);
      alert(`❌ Erreur lors du téléchargement du PDF: ${error.message}`);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // Fonction pour créer une facture avec la nouvelle méthode
  const createInvoiceFromForm = () => {
    try {
      const clientData: SimpleClient = {
        nom: client.nom,
        email: client.email,
        adresse: client.adresse,
        ville: client.ville,
        codePostal: client.codePostal,
        telephone: client.telephone,
        siret: client.siret
      };
      
      const itemsData: SimpleItem[] = produits.map(p => ({
        description: `${p.nom} (${p.taille})`,
        quantite: p.quantite,
        prixUnitaire: p.prix
      }));
      
      const facture = createHTConfortInvoice(clientData, itemsData);
      console.log('✅ Facture générée:', facture);
      
      return facture;
    } catch (error) {
      console.error('❌ Erreur génération facture:', error);
      alert(`❌ Erreur: ${error.message}`);
      return null;
    }
  };

  // Fonction d'envoi par email
  const sendEmailPDF = async () => {
    if (!client.email) {
      alert("⚠️ Veuillez saisir l'email du client !");
      return;
    }

    try {
      alert("📧 Envoi de la facture par email...");
      
      // Créer la facture avec la nouvelle méthode
      const facture = createInvoiceFromForm(); // This is the old simple invoice, not the full one
      if (!facture) return;
      
      console.log('📧 Envoi facture:', facture.invoiceNumber);
      
      const { sendPDFByEmail } = await import('../utils/emailService');
      
      // Use the full invoice object for PDF generation
      const fullInvoice = getInvoiceDataForPayload();

      // Send by email using the updated service (assuming it uses PDFService internally)
      const success = await sendPDFByEmail(fullInvoice, client.email, invoicePdfRef); // Pass ref to emailService
      
      if (success) {
        alert(`✅ Facture envoyée par email à ${client.email} !`);
      } else {
        alert("❌ Erreur lors de l'envoi de l'email");
      }
      
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      alert(`❌ Erreur: ${error.message}`);
    }
  };

  // Fonction de connexion/déconnexion Google Drive
  const toggleGoogleDriveConnection = async () => {
    if (isGoogleConnected) {
      // Déconnexion
      try {
        if (window.gapi && window.gapi.auth2) {
          const authInstance = window.gapi.auth2.getAuthInstance();
          await authInstance.signOut();
        }
        setIsGoogleConnected(false);
        alert("🔌 Déconnecté de Google Drive");
      } catch (error) {
        console.error('Erreur déconnexion:', error);
      }
    } else {
      // Connexion
      setIsConnecting(true);
      try {
        const authResult = await authenticateGoogle();
        if (authResult.success) {
          setIsGoogleConnected(true);
          alert("✅ Connecté à Google Drive avec succès !");
        } else {
          alert(`❌ Erreur de connexion: ${authResult.error}`);
        }
      } catch (error) {
        alert(`❌ Erreur: ${error.message}`);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  // Fonction pour sauvegarder sur Google Drive (nécessite connexion)
  const saveToGoogleDrive = async () => {
    if (!isGoogleConnected) {
      alert("⚠️ Veuillez d'abord vous connecter à Google Drive !");
      return;
    }

    try {
      alert("🔄 Génération et envoi de la facture...");
      
      // Générer la facture PNG
      const pngBlob = await generateInvoicePNG();
      if (!pngBlob) {
        alert("❌ Erreur lors de la génération de l'image");
        return;
      }
      
      // Obtenir le token d'accès
      const accessToken = await getAccessToken();
      if (!accessToken) {
        alert("❌ Token d'accès manquant, reconnectez-vous");
        setIsGoogleConnected(false);
        return;
      }
      
      // Upload sur Google Drive
      const filename = `Facture_${client.nom || "client"}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.png`;
      const uploadResult = await uploadToGoogleDrive(pngBlob, filename, accessToken);
      
      if (uploadResult.success) {
        alert(`✅ Facture sauvegardée sur Google Drive !\n\n📁 Fichier: ${filename}\n🔗 ID: ${uploadResult.fileId}`);
      } else {
        alert(`❌ Erreur upload: ${uploadResult.error}`);
      }

    } catch (error) {
      console.error('❌ Erreur Google Drive:', error);
      alert(`❌ Erreur: ${error.message}`);
    }
  };
  
  // Fonction d'authentification Google
  const authenticateGoogle = async () => {
    try {
      // Charger l'API Google si nécessaire
      if (!window.gapi) {
        await loadGoogleAPI();
      }
      
      return new Promise((resolve) => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: '416673956609-ushnkvokiicp2ec0uug7dsvpb50mscr5.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/drive.file'
          }).then(() => {
            const authInstance = window.gapi.auth2.getAuthInstance();
            authInstance.signIn().then((user) => {
              const accessToken = user.getAuthResponse().access_token;
              resolve({ success: true, accessToken });
            }).catch((error) => {
              resolve({ success: false, error: error.error || 'Authentification annulée' });
            });
          }).catch((error) => {
            resolve({ success: false, error: 'Erreur initialisation Google API' });
          });
        });
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Fonction pour obtenir le token d'accès
  const getAccessToken = async () => {
    try {
      if (!window.gapi || !window.gapi.auth2) {
        await loadGoogleAPI();
        await initializeGoogleAuth();
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance) {
        return null;
      }

      const user = authInstance.currentUser.get();
      
      if (user.isSignedIn()) {
        return user.getAuthResponse().access_token;
      } else {
        console.warn('⚠️ Utilisateur non connecté');
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur récupération token:', error);
      return null;
    }
  };
  
  // Fonction pour initialiser l'authentification Google
  const initializeGoogleAuth = () => {
    return new Promise((resolve, reject) => {
      window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: '416673956609-ushnkvokiicp2ec0uug7dsvpb50mscr5.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/drive.file'
        }).then(resolve).catch(reject);
      });
    });
  };

  // Fonction pour charger l'API Google
  const loadGoogleAPI = () => {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Impossible de charger Google API'));
      document.head.appendChild(script);
    });
  };
  
  // Fonction pour générer le PNG de la facture
  const generateInvoicePNG = async () => {
    try {
      if (!window.html2canvas) {
        throw new Error("html2canvas non disponible");
      }
      
      // Use the InvoicePDF component for rendering
      if (!invoicePdfRef.current) {
        throw new Error("Invoice PDF preview element not found for PNG generation.");
      }

      const canvas = await window.html2canvas(invoicePdfRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png', 0.95);
      });
    } catch (error) {
      console.error('Erreur génération PNG:', error);
      return null;
    }
  };
  
  // Fonction pour uploader sur Google Drive
  const uploadToGoogleDrive = async (blob, filename, accessToken) => {
    try {
      const metadata = {
        name: filename,
        parents: ['1hZsPW8TeZ6s3AlLesb1oLQNbI3aJY3p-'] // Votre dossier Drive
      };
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);
      
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: form
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      return { success: true, fileId: result.id, webViewLink: result.webViewLink };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // New function to send invoice data to n8n
  const handleSendInvoiceToN8N = async () => {
    setIsSendingToN8N(true);
    try {
      if (!invoicePdfRef.current) {
        throw new Error("Invoice PDF preview element not found for n8n payload.");
      }

      const fullInvoice = getInvoiceDataForPayload();
      
      // 1. Generate PDF Blob
      const pdfBlob = await PDFService.generateInvoicePDF(fullInvoice, invoicePdfRef);

      // 2. Prepare JSON payload with base64 PDF
      const payload = await prepareInvoicePayload(fullInvoice, pdfBlob);

      // 3. Send payload to n8n webhook
      await sendInvoice(payload, N8N_WEBHOOK_URL);

      alert('✅ Facture envoyée à n8n avec succès !');
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi à n8n:', error);
      alert(`❌ Échec de l'envoi à n8n: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSendingToN8N(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#f7f8f5] min-h-screen">
      {/* FORMULAIRE CLIENT */}
      <div className="bg-white rounded-xl shadow p-7 mb-6 border">
        <h2 className="text-2xl font-bold mb-5 text-[#477A0C]">INFORMATIONS CLIENT</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Nom complet*</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="text"
              value={client.nom}
              onChange={e => setClient({ ...client, nom: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Adresse*</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="text"
              value={client.adresse}
              onChange={e => setClient({ ...client, adresse: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Ville*</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="text"
              value={client.ville}
              onChange={e => setClient({ ...client, ville: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Code postal*</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="text"
              value={client.codePostal}
              onChange={e => setClient({ ...client, codePostal: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Téléphone*</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="tel"
              value={client.telephone}
              onChange={e => setClient({ ...client, telephone: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Email*</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="email"
              value={client.email}
              onChange={e => setClient({ ...client, email: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">SIRET</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="text"
              value={client.siret}
              onChange={e => setClient({ ...client, siret: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Type de logement</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="text"
              value={client.housingType}
              onChange={e => setClient({ ...client, housingType: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Code d'accès porte</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="text"
              value={client.doorCode}
              onChange={e => setClient({ ...client, doorCode: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* INFORMATIONS FACTURE COMPLÉMENTAIRES */}
      <div className="bg-white rounded-xl shadow p-7 mb-6 border">
        <h2 className="text-2xl font-bold mb-5 text-[#477A0C]">DÉTAILS DE LA FACTURE</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Numéro de Facture</label>
            <input
              className="border rounded px-3 py-2 w-full bg-gray-100"
              type="text"
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              readOnly
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Date de Facture</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="date"
              value={invoiceDate}
              onChange={e => setInvoiceDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Lieu de l'événement</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="text"
              value={eventLocation}
              onChange={e => setEventLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Nom du conseiller</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="text"
              value={advisorName}
              onChange={e => setAdvisorName(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Description des travaux</label>
            <textarea
              className="border rounded px-3 py-2 w-full"
              rows={3}
              value={descriptionTravaux}
              onChange={e => setDescriptionTravaux(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label className="block font-medium mb-1">Date d'échéance</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Statut de la facture</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={invoiceStatus}
              onChange={e => setInvoiceStatus(e.target.value)}
            >
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">Notes de facture</label>
            <textarea
              className="border rounded px-3 py-2 w-full"
              rows={3}
              value={invoiceNotes}
              onChange={e => setInvoiceNotes(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label className="block font-medium mb-1">Taux de TVA (%)</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="number"
              value={taxRate}
              onChange={e => setTaxRate(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="termsAccepted"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="termsAccepted" className="font-medium">Conditions générales acceptées</label>
          </div>
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="isSigned"
              checked={isSigned}
              onChange={e => setIsSigned(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isSigned" className="font-medium">Facture signée</label>
          </div>
          {isSigned && (
            <div>
              <label className="block font-medium mb-1">URL Image Signature</label>
              <input
                className="border rounded px-3 py-2 w-full"
                type="text"
                value={signatureImage}
                onChange={e => setSignatureImage(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* INFORMATIONS LIVRAISON & PAIEMENT */}
      <div className="bg-white rounded-xl shadow p-7 mb-6 border">
        <h2 className="text-2xl font-bold mb-5 text-[#477A0C]">LIVRAISON & PAIEMENT</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Méthode de livraison</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="text"
              value={deliveryMethod}
              onChange={e => setDeliveryMethod(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Notes de livraison</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="text"
              value={deliveryNotes}
              onChange={e => setDeliveryNotes(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Méthode de paiement</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value="Virement">Virement</option>
              <option value="Carte Bancaire">Carte Bancaire</option>
              <option value="Espèces">Espèces</option>
              <option value="Chèque">Chèque</option>
              <option value="Acompte">Acompte</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Montant de l'acompte</label>
            <input
              className="border rounded px-3 py-2 w-full"
              type="number"
              value={depositAmount}
              onChange={e => setDepositAmount(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* PRODUITS INTERACTIFS */}
      <div className="bg-white rounded-xl shadow p-7 mb-6 border">
        <div className="text-lg font-bold mb-3 flex items-center gap-2">
          <span className="text-2xl">🛒</span> AJOUTER UN PRODUIT À LA FACTURE
        </div>
        <div className="flex flex-wrap gap-3 mb-5">
          {/* Catégorie */}
          <div>
            <label className="font-semibold">Catégorie</label>
            <select
              className="border rounded px-2 py-1"
              value={catSel}
              onChange={e => { setCatSel(e.target.value); setTailleSel(""); }}
            >
              <option value="">Sélectionner</option>
              {[...new Set(produitsCatalogue.map(p => p.categorie))].map(c =>
                <option key={c} value={c}>{c}</option>
              )}
            </select>
          </div>
          {/* Taille */}
          <div>
            <label className="font-semibold">Taille</label>
            <select
              className="border rounded px-2 py-1"
              value={tailleSel}
              onChange={e => setTailleSel(e.target.value)}
              disabled={!catSel}
            >
              <option value="">Toutes les tailles</option>
              {taillesDispo.map(taille =>
                <option key={taille} value={taille}>{taille}</option>
              )}
            </select>
          </div>
          {/* Quantité */}
          <div>
            <label className="font-semibold">Quantité</label>
            <select
              className="border rounded px-2 py-1"
              value={qteSel}
              onChange={e => setQteSel(Number(e.target.value))}
              disabled={!produitTrouve}
            >
              {[...Array(10).keys()].map(q => <option key={q+1} value={q+1}>{q+1} unité</option>)}
            </select>
          </div>
          {/* Prix total */}
          <div>
            <label className="font-semibold">Prix total</label>
            <div className="border rounded px-4 py-2 bg-gray-100 min-w-[100px]">
              {produitTrouve ? (produitTrouve.prix * qteSel) + " €" : "Sélectionnez un produit"}
            </div>
          </div>
          {/* Bouton sélectionner */}
          <button
            className="bg-green-700 text-white px-4 py-2 rounded ml-4"
            disabled={!produitTrouve}
            onClick={() => {
              if (produitTrouve) {
                setProduits([
                  ...produits,
                  { 
                    ...produitTrouve, 
                    quantite: qteSel,
                    discount: 0, // Default discount
                    discountType: 'amount' // Default discount type
                  }
                ]);
              }
            }}
          >
            + SÉLECTIONNER
          </button>
          <button
            className="bg-blue-700 text-white px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors"
            onClick={sendEmailPDF}
            disabled={!client.nom || produits.length === 0 || !client.email}
          >
            📧 Envoyer par Email
          </button>
          <button
            className="bg-purple-700 text-white px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-purple-800 transition-colors"
            onClick={() => {
              const facture = createInvoiceFromForm();
              if (facture) alert(`✅ Facture créée: ${facture.invoiceNumber}\n💰 Total: ${facture.total}€`);
            }}
            disabled={!client.nom || produits.length === 0}
          >
            🧪 Test Facture
          </button>
        </div>
        {/* Affichage cartes produits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {produitsCatalogue.filter(p =>
            (!catSel || p.categorie === catSel) &&
            (!tailleSel || p.taille === tailleSel)
          ).map((p, idx) =>
            <div key={idx} className="rounded-lg border p-3 bg-[#f9fdf5] shadow hover:shadow-md">
              <div className="font-bold">{p.nom}</div>
              <div className="text-sm">{p.taille}</div>
              <div className="text-green-700 font-bold text-xl">{p.prix} €</div>
              <div className="text-xs text-gray-600">{p.categorie}</div>
            </div>
          )}
        </div>
        {/* Tableau des produits ajoutés */}
        <div className="mt-5">
          <table className="w-full border mt-2">
            <thead className="bg-[#d0e7be]">
              <tr>
                <th>Produit</th>
                <th>Qté</th>
                <th>PU TTC</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((p, i) => (
                <tr key={i}>
                  <td>{p.nom} <span className="text-xs">({p.taille})</span></td>
                  <td>{p.quantite}</td>
                  <td>{p.prix} €</td>
                  <td>{p.prix * p.quantite} €</td>
                  <td>
                    <button className="text-red-500" onClick={() => supprimerProduit(i)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {produits.length === 0 &&
                <tr><td colSpan={5} className="text-center text-gray-400 py-3">Aucun produit ajouté</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* RÉCAPITULATIF */}
      <div className="bg-white rounded-xl shadow p-7 mb-6 border">
        <h2 className="text-xl font-bold mb-4 text-[#477A0C]">RÉCAPITULATIF FACTURE</h2>
        <div className="mb-2"><span className="font-semibold">Client :</span> {client.nom || <span className="text-gray-400">Non renseigné</span>}</div>
        <div className="mb-2"><span className="font-semibold">Adresse :</span> {client.adresse || <span className="text-gray-400">Non renseigné</span>}</div>
        <div className="mb-2"><span className="font-semibold">Produits :</span> {produits.length} sélectionné(s)</div>
        <div className="mb-2"><span className="font-semibold">Total TTC :</span> <span className="text-xl text-green-700 font-bold">{total} €</span></div>
        
        {/* Boutons d'action */}
        <div className="space-y-4 mt-6">
          {/* Bouton de connexion Google Drive */}
          <div className="flex justify-center">
            <button
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${
                isGoogleConnected 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              onClick={toggleGoogleDriveConnection}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Connexion...</span>
                </>
              ) : isGoogleConnected ? (
                <>
                  <Cloud className="w-5 h-5" />
                  <span>✅ Google Drive connecté - Cliquer pour déconnecter</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-5 h-5" />
                  <span>🔌 Se connecter à Google Drive</span>
                </>
              )}
            </button>
          </div>

          {/* Boutons d'action principaux */}
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              className={`px-6 py-2 rounded font-bold flex items-center gap-2 transition-colors ${
                isSupabaseConnected && !isSaving // Add isSaving to disabled
                  ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
              onClick={saveToSupabase}
              disabled={!client.nom || produits.length === 0 || !isSupabaseConnected || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>💾 Sauvegarder Supabase</span>
                </>
              )}
            </button>
            <button
              className={`px-6 py-2 rounded font-bold flex items-center gap-2 transition-colors ${
                isDownloadingPDF
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-700 hover:bg-green-800 text-white'
              }`}
              onClick={downloadPDF}
              disabled={!client.nom || produits.length === 0 || isDownloadingPDF}
            >
              {isDownloadingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Téléchargement...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>🖨️ Télécharger PDF</span>
                </>
              )}
            </button>
            <button
              className={`px-6 py-2 rounded font-bold flex items-center gap-2 transition-colors ${
                isGoogleConnected 
                  ? 'bg-green-700 hover:bg-green-800 text-white' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
              onClick={saveToGoogleDrive}
              disabled={!client.nom || produits.length === 0 || !isGoogleConnected}
            >
              ☁️ Sauver PNG
            </button>
            <button
              className={`px-6 py-2 rounded font-bold flex items-center gap-2 transition-colors ${
                isSendingToN8N
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-purple-700 hover:bg-purple-800 text-white'
              }`}
              onClick={handleSendInvoiceToN8N}
              disabled={!client.nom || produits.length === 0 || isSendingToN8N}
            >
              {isSendingToN8N ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Envoi n8n...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>🚀 Envoyer à n8n</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* SECTION FACTURES SAUVEGARDÉES */}
      {isSupabaseConnected && savedInvoices.length > 0 && (
        <div className="bg-white rounded-xl shadow p-7 mb-6 border">
          <h2 className="text-xl font-bold mb-4 text-[#477A0C]">
            📄 FACTURES SAUVEGARDÉES ({savedInvoices.length})
          </h2>
          <div className="grid gap-3">
            {savedInvoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold">{invoice.invoice_number}</div>
                  <div className="text-sm text-gray-600">{invoice.client_name}</div>
                  <div className="text-xs text-gray-500">{invoice.invoice_date}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{invoice.total.toFixed(2)} €</div>
                  <div className="text-xs text-gray-500">{invoice.status}</div>
                </div>
              </div>
            ))}
          </div>
          {savedInvoices.length > 5 && (
            <div className="text-center mt-3 text-gray-500">
              ... et {savedInvoices.length - 5} autres factures
            </div>
          )}
        </div>
      )}
      
      {/* INDICATEUR CONNEXION SUPABASE */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          isSupabaseConnected 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {isSupabaseConnected ? '✅ Supabase connecté' : '❌ Supabase déconnecté'}
        </div>
      </div>

      {/* Hidden InvoicePDF component for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <InvoicePDF invoice={getInvoiceDataForPayload()} ref={invoicePdfRef} />
      </div>
    </div>
  );
}
