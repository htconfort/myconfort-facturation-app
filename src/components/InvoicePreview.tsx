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
      className={`facture-apercu ${className}`}
    >
      {/* PAGE 1 - FACTURE SIMPLE ET BASIQUE */}
      <div className="invoice-page">
        
        {/* En-tête simple sans logo */}
        <header className="invoice-header">
          <div className="company-info">
            <h1>MYCONFORT</h1>
            <p className="tagline">Quand on dort bien, on vit bien</p>
            <div className="company-details">
              <p>88 Avenue des Ternes</p>
              <p>75017 Paris, France</p>
              <p>SIRET: 824 313 530 00027</p>
              <p>Tél: 04 68 50 41 45</p>
              <p>Email: myconfort@gmail.com</p>
              <p>Site web: https://www.htconfort.com</p>
            </div>
          </div>
          
          <div className="invoice-info">
            <h2>FACTURE</h2>
            <p><strong>N° Facture:</strong> {invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
            <p><strong>Lieu:</strong> {invoice.eventLocation || 'Paris'}</p>
          </div>
        </header>

        {/* Informations client */}
        <section className="client-section">
          <h3>FACTURER À</h3>
          <div className="client-info">
            <p><strong>{invoice.client.name}</strong></p>
            <p>{invoice.client.address}</p>
            <p>{invoice.client.postalCode} {invoice.client.city}</p>
            <p>Email: {invoice.client.email}</p>
            <p>Tél: {invoice.client.phone}</p>
          </div>
        </section>

        {/* Informations paiement et livraison */}
        <section className="payment-delivery">
          <div className="payment-info">
            <h4>Mode de paiement:</h4>
            <p>{invoice.payment.method || 'Carte Bleue'}</p>
          </div>
          <div className="delivery-info">
            <h4>Mode de livraison:</h4>
            <p>{invoice.delivery.method || 'Livraison par transporteur'}</p>
            <p className="delivery-note">Livraison réalisée au pied de l'immeuble ou au portail</p>
          </div>
        </section>

        {/* Tableau des produits */}
        <section className="products-section">
          <h3>DÉTAIL DES PRODUITS</h3>
          <table className="products-table">
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
                    <td>
                      {product.discount > 0 ? (
                        product.discountType === 'percentage' ? 
                          `${product.discount}%` : 
                          formatCurrency(product.discount)
                      ) : '-'}
                    </td>
                    <td>{formatCurrency(totalProduct)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Encadré de signature + Totaux */}
        <section className="signature-totals">
          {/* Encadré signature */}
          <div className="signature-box">
            <h4>Signature client MYCONFORT:</h4>
            <div className="signature-area">
              {invoice.signature ? (
                <div className="signature-content">
                  <img src={invoice.signature} alt="Signature électronique" className="signature-image" />
                  <p className="signature-status">✓ Signature électronique enregistrée</p>
                  <p className="signature-date">Signée le {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              ) : (
                <div className="signature-placeholder">
                  <p>Signature en attente</p>
                </div>
              )}
            </div>
          </div>

          {/* Totaux */}
          <div className="totals-box">
            <div className="total-line">
              <span>Total HT:</span>
              <span>{formatCurrency(totalHT)}</span>
            </div>
            <div className="total-line">
              <span>TVA ({invoice.taxRate}%):</span>
              <span>{formatCurrency(totalTVA)}</span>
            </div>
            <div className="total-line">
              <span>Remise totale:</span>
              <span>-{formatCurrency(totalDiscount)}</span>
            </div>
            <div className="total-line-final">
              <span><strong>TOTAL TTC:</strong></span>
              <span><strong>{formatCurrency(totalTTC)}</strong></span>
            </div>
            
            {acompteAmount > 0 && (
              <div className="total-line">
                <span><strong>RESTE À PAYER:</strong></span>
                <span><strong>{formatCurrency(montantRestant)}</strong></span>
              </div>
            )}
          </div>
        </section>

        {/* Notes si présentes */}
        {invoice.invoiceNotes && (
          <section className="notes-section">
            <h4>Remarques:</h4>
            <p>{invoice.invoiceNotes}</p>
          </section>
        )}

        {/* Mention légale */}
        <div className="legal-notice">
          <p><strong>⚖️ Article L224‑59 du Code de la consommation</strong></p>
          <p>« Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon [...] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »</p>
        </div>

        {/* Footer simple */}
        <footer className="invoice-footer">
          <h3>MYCONFORT</h3>
          <p>Merci pour votre confiance !</p>
          <p>Votre spécialiste en matelas et literie de qualité</p>
        </footer>

      </div>
      
      {/* PAGE 2 - CONDITIONS GÉNÉRALES */}
      <ConditionsGenerales />
    </div>
  );
};
