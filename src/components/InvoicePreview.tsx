import React from 'react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { ConditionsGenerales } from './ConditionsGenerales';

interface InvoicePreviewProps {
  invoice: Invoice;
  className?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  invoice, 
  className = "" 
}) => {
  // Calculer le total TTC
  const totalTTC = invoice.products.reduce((sum, product) => {
    return sum + calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType === 'percentage' ? 'percent' : 'fixed'
    );
  }, 0);

  // Calculer l'acompte et le montant restant
  const acompteAmount = invoice.payment.depositAmount || 0;
  const montantRestant = totalTTC - acompteAmount;

  // Calculer les totaux pour l'affichage
  const totalHT = totalTTC / (1 + (invoice.taxRate / 100));
  const totalTVA = totalTTC - totalHT;
  const totalDiscount = invoice.products.reduce((sum, product) => {
    const originalTotal = product.priceTTC * product.quantity;
    const discountedTotal = calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType === 'percentage' ? 'percent' : 'fixed'
    );
    return sum + (originalTotal - discountedTotal);
  }, 0);

  return (
    <div 
      id="facture-apercu" 
      className={`invoice-container ${className}`}
    >
      {/* PAGE 1 - FACTURE EXACTE SELON MODÈLE CHATGPT */}
      <div className="invoice-page">
        
        <header className="header">
          <img src="/HT-Confort_Full_Green.svg" alt="Logo HT Confort" className="logo" />
          <div className="invoice-info">
            <h2>FACTURE</h2>
            <p><strong>N° Facture :</strong> {invoice.invoiceNumber}</p>
            <p><strong>Date :</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
            <p><strong>Lieu :</strong> {invoice.eventLocation || 'paris'}</p>
          </div>
        </header>

        <section className="company-client-info">
          <div className="company">
            <h3>MYCONFORT</h3>
            <p>88 Avenue des Ternes<br/>75017 Paris, France</p>
            <p>SIRET : 824 313 530 00027</p>
            <p>Tél : 04 68 50 41 45</p>
            <p>Email : myconfort@gmail.com</p>
            <p>Site : <a href="https://www.htconfort.com">htconfort.com</a></p>
          </div>

          <div className="client">
            <h3>Facturer à</h3>
            <p>{invoice.client.name}</p>
            <p>{invoice.client.address}</p>
            <p>{invoice.client.postalCode} {invoice.client.city}</p>
            <p>Tél : {invoice.client.phone}</p>
            <p>Email : {invoice.client.email}</p>
          </div>

          <div className="infos">
            <h3>Informations complémentaires</h3>
            <p><strong>Type de logement :</strong> Maison</p>
            <p><strong>Code d'accès :</strong> 123456</p>
            <p><strong>Livraison :</strong> {invoice.delivery.method || 'Livraison par transporteur'}</p>
            <p><strong>Conseiller :</strong> bruno</p>
          </div>
        </section>

        <section className="product-details">
          <table>
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Qté</th>
                <th>PU HT</th>
                <th>PU TTC</th>
                <th>Remise</th>
                <th>Total TTC</th>
              </tr>
            </thead>
            <tbody>
              {invoice.products.map((product, index) => {
                const unitPriceHT = product.priceTTC / (1 + (invoice.taxRate / 100));
                const totalProduct = calculateProductTotal(
                  product.quantity,
                  product.priceTTC,
                  product.discount,
                  product.discountType === 'percentage' ? 'percent' : 'fixed'
                );
                
                return (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>{formatCurrency(unitPriceHT)}</td>
                    <td>{formatCurrency(product.priceTTC)}</td>
                    <td>{product.discount > 0 ? 
                      (product.discountType === 'percentage' ? 
                        `-${product.discount}%` : 
                        `-${formatCurrency(product.discount)}`
                      ) : '-'}</td>
                    <td>{formatCurrency(totalProduct)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="totals-signature">
          <div className="signature">
            <h4>Signature client MYCONFORT</h4>
            {invoice.signature ? (
              <>
                <p className="electronic">Signature électronique enregistrée</p>
                <p>Signée le {new Date().toLocaleDateString('fr-FR')}</p>
                <img src={invoice.signature} alt="Signature" className="signature-image" />
              </>
            ) : (
              <p className="electronic">Signature électronique non réalisée</p>
            )}
          </div>
          <div className="totals">
            <p><strong>Montant HT :</strong> {formatCurrency(totalHT)}</p>
            <p><strong>TVA (20%) :</strong> {formatCurrency(totalTVA)}</p>
            <p><strong>Remise totale :</strong> -{formatCurrency(totalDiscount)}</p>
            <p><strong>TOTAL TTC :</strong> {formatCurrency(totalTTC)}</p>
            {acompteAmount > 0 && (
              <p><strong>RESTE À PAYER :</strong> {formatCurrency(montantRestant)}</p>
            )}
          </div>
        </section>

        <section className="payment">
          <h4>Modalités de paiement</h4>
          <p><strong>Mode de règlement :</strong> {invoice.payment.method || 'Carte Bleue'}</p>
          <p>Adresse SAV : 8 rue du grégal 66510 Saint-Hippolyte - 0661486023</p>
        </section>

        <footer className="footer">
          <p><strong>Merci de votre confiance !</strong><br/>Votre spécialiste en matelas et literie de qualité</p>
        </footer>

      </div>
      
      {/* PAGE 2 - CONDITIONS GÉNÉRALES */}
      <ConditionsGenerales />
    </div>
  );
};
