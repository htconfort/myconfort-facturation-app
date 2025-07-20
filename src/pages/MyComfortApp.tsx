import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { Save, Download, Cloud, CloudOff } from "lucide-react";
import { initializeEmailJS } from '../utils/emailService';
import { createHTConfortInvoice, testHTConfortInvoice, SimpleClient, SimpleItem } from '../utils/invoiceGenerator';
import { supabase } from '../utils/supabaseClient';
import { clientService, invoiceService, productService, testSupabaseConnection } from '../utils/supabaseService';
import type { Client, Invoice as SupabaseInvoice, Product } from '../utils/supabaseService';

// Import des utilitaires PDF
import { downloadPDF as generatePDF } from '../utils/pdfGenerator';
import { Invoice } from '../utils/data';

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
  const [produits, setProduits] = useState([]);

  // État de connexion Google Drive
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // États Supabase
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<SupabaseInvoice[]>([]);
  const [savedClients, setSavedClients] = useState<Client[]>([]);
  const [supabaseProducts, setSupabaseProducts] = useState<Product[]>([]);

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

  // Fonctions de sauvegarde et PDF
  const saveToSupabase = async () => {
    if (!isSupabaseConnected) {
      alert("⚠️ Supabase non connecté ! Impossible de sauvegarder.");
      return;
    }
    
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
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Facture MyConfort\nClient : ${client.nom || "-"}\nDate : ${new Date().toLocaleDateString('fr-FR')}\nTotal : ${total}€`, 10, 10);
    produits.forEach((p, i) => {
      doc.text(
        `${i + 1}. ${p.nom} (${p.taille}) x${p.quantite} = ${p.prix * p.quantite}€`,
        10,
        25 + i * 10
      );
    });
    doc.save(`Facture-${client.nom || "client"}.pdf`);
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
      const facture = createInvoiceFromForm();
      if (!facture) return;
      
      console.log('📧 Envoi facture:', facture.invoiceNumber);
      
      const { sendPDFByEmail } = await import('../utils/emailService');
      
      // Créer l'objet facture
      const invoice = {
        id: `FAC-${Date.now()}`,
        invoiceNumber: `FAC-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('fr-FR'),
        clientName: client.nom,
        clientAddress: `${client.adresse}\n${client.ville} ${client.codePostal}`,
        clientPhone: client.telephone,
        clientEmail: client.email,
        items: produits.map(p => ({
          description: `${p.nom} (${p.taille})`,
          quantity: p.quantite,
          unitPrice: p.prix,
          total: p.prix * p.quantite
        })),
        subtotal: total / 1.2,
        tax: total - (total / 1.2),
        total: total
      };
      
      // Envoyer par email
      const success = await sendPDFByEmail(facture, client.email);
      
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
      
      const factureElement = createInvoiceElement();
      document.body.appendChild(factureElement);
      
      const canvas = await window.html2canvas(factureElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      document.body.removeChild(factureElement);
      
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

  // Fonction pour créer l'élément HTML de la facture
  const createInvoiceElement = () => {
    const factureDiv = document.createElement('div');
    factureDiv.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 800px;
      background: white;
      padding: 40px;
      font-family: Arial, sans-serif;
      color: #333;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    `;

    factureDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #477A0C; font-size: 36px; margin: 0;">MYCOMFORT</h1>
        <p style="color: #666; margin: 5px 0;">Solutions de confort</p>
        <h2 style="color: #477A0C; font-size: 28px; margin: 20px 0;">FACTURE</h2>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div>
          <h3 style="color: #477A0C; border-bottom: 2px solid #477A0C; padding-bottom: 5px;">ÉMETTEUR</h3>
          <p><strong>MyComfort SARL</strong></p>
          <p>123 Rue de la Paix</p>
          <p>75001 Paris</p>
          <p>Tél: 01 23 45 67 89</p>
          <p>Email: contact@mycomfort.fr</p>
        </div>
        <div>
          <h3 style="color: #477A0C; border-bottom: 2px solid #477A0C; padding-bottom: 5px;">FACTURÉ À</h3>
          <p><strong>${client.nom || "Client"}</strong></p>
          <p>${client.adresse || ""}</p>
          <p>${client.ville || ""} ${client.codePostal || ""}</p>
          <p>Tél: ${client.telephone || ""}</p>
          <p>Email: ${client.email || ""}</p>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
        <p><strong>Facture N°:</strong> FAC-${Date.now().toString().slice(-6)}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background: #477A0C; color: white;">
            <th style="border: 1px solid #477A0C; padding: 12px; text-align: left;">Description</th>
            <th style="border: 1px solid #477A0C; padding: 12px; text-align: center;">Qté</th>
            <th style="border: 1px solid #477A0C; padding: 12px; text-align: right;">Prix unitaire</th>
            <th style="border: 1px solid #477A0C; padding: 12px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${produits.map((p, i) => `
            <tr style="background: ${i % 2 === 0 ? '#f9f9f9' : 'white'};">
              <td style="border: 1px solid #ddd; padding: 10px;">${p.nom} (${p.taille})</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${p.quantite}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${p.prix}€</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right; font-weight: bold;">${p.prix * p.quantite}€</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right; margin-bottom: 30px;">
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; display: inline-block; min-width: 300px;">
          <p style="margin: 5px 0;"><strong>Sous-total HT:</strong> ${(total / 1.2).toFixed(2)}€</p>
          <p style="margin: 5px 0;"><strong>TVA (20%):</strong> ${(total - total / 1.2).toFixed(2)}€</p>
          <p style="margin: 15px 0 0 0; font-size: 18px; color: #477A0C;"><strong>TOTAL TTC: ${total}€</strong></p>
        </div>
      </div>

      <div style="text-align: center; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 12px;">
        <p>Facture acquittée - Merci de votre confiance</p>
        <p>SIRET: 123 456 789 00012 - TVA non applicable, art. 293 B du CGI</p>
      </div>
    `;

    return factureDiv;
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
                  { ...produitTrouve, quantite: qteSel }
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
          <div className="flex gap-3">
            <button
              className={`px-6 py-2 rounded font-bold flex items-center gap-2 transition-colors ${
                isSupabaseConnected 
                  ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
              onClick={saveToSupabase}
              disabled={!client.nom || produits.length === 0}
            >
              <Save className="w-4 h-4" />
              💾 Sauvegarder Supabase
            </button>
            <button
              className="bg-green-700 text-white px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-green-800 transition-colors"
              onClick={downloadPDF}
              disabled={!client.nom || produits.length === 0}
            >
              <Download className="w-4 h-4" />
              🖨️ Télécharger PDF
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
    </div>
  );
}