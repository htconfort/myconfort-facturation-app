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
      className={`professional-invoice ${className}`}
    >
      {/* PAGE 1 - FACTURE */}
      <div className="invoice-page">
        {/* En-tête avec logo centré et informations entreprise */}
        <div className="invoice-header-center">
          <div className="company-branding">
            <img 
              src="/HT-Confort_Full_Green.svg" 
              alt="HT-Confort Logo" 
              className="company-logo-center"
            />
            <h1 className="company-name">MYCONFORT</h1>
            <p className="company-tagline">Quand on dort bien, on vit bien</p>
          </div>
        </div>

        {/* Informations entreprise et facture sur deux colonnes */}
        <div className="header-info-row">
          <div className="company-details-left">
            <h3>MYCONFORT</h3>
            <p>88 Avenue des Ternes</p>
            <p>75017 Paris, France</p>
            <p>SIRET: 824 313 530 00027</p>
            <p>Tél: 04 68 50 41 45</p>
            <p>Email: myconfort@gmail.com</p>
          </div>
          
          <div className="invoice-info-right">
            <div className="invoice-number-box">
              <h2>FACTURE</h2>
              <div className="invoice-meta">
                <div className="meta-line">
                  <strong>N°:</strong> {invoice.invoiceNumber}
                </div>
                <div className="meta-line">
                  <strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
                </div>
                {invoice.eventLocation && (
                  <div className="meta-line">
                    <strong>Lieu:</strong> {invoice.eventLocation}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informations client dans un cadre */}
        <div className="client-section-box">
          <h3 className="section-title">FACTURER À:</h3>
          <div className="client-details">
            <div className="client-name-prominent">{invoice.client.name}</div>
            <div className="client-address">
              <p>{invoice.client.address}</p>
              <p>{invoice.client.postalCode} {invoice.client.city}</p>
              <p>Email: {invoice.client.email}</p>
              <p>Tél: {invoice.client.phone}</p>
            </div>
          </div>
        </div>

        {/* Informations paiement et livraison en ligne */}
        <div className="payment-delivery-row">
          <div className="payment-col">
            <strong>Mode de paiement:</strong>
            <span>{invoice.payment.method || 'Non spécifié'}</span>
          </div>
          <div className="delivery-col">
            <strong>Mode de livraison:</strong>
            <span>{invoice.delivery.method || 'Non spécifié'}</span>
            <div className="delivery-note">Livraison réalisée au pied de l'immeuble ou au portail</div>
          </div>
        </div>

        {/* Tableau des produits optimisé */}
        <div className="products-section-new">
          <table className="products-table-modern">
            <thead>
              <tr>
                <th style={{width: '45%'}}>Désignation</th>
                <th style={{width: '8%'}}>Qté</th>
                <th style={{width: '12%'}}>PU HT</th>
                <th style={{width: '12%'}}>PU TTC</th>
                <th style={{width: '10%'}}>Remise</th>
                <th style={{width: '13%'}}>Total TTC</th>
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
                    <td className="product-designation">{product.name}</td>
                    <td className="text-center">{product.quantity}</td>
                    <td className="text-right">{formatCurrency(unitPriceHT)}</td>
                    <td className="text-right">{formatCurrency(product.priceTTC)}</td>
                    <td className="text-center">
                      {product.discount > 0 ? (
                        product.discountType === 'percentage' ? 
                          `${product.discount}%` : 
                          formatCurrency(product.discount)
                      ) : '-'}
                    </td>
                    <td className="text-right font-medium">{formatCurrency(totalProduct)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totaux dans un cadre à droite */}
          <div className="totals-box">
            <div className="totals-grid">
              <div className="total-line">
                <span>Total HT:</span>
                <span>{formatCurrency(totalHT)}</span>
              </div>
              <div className="total-line">
                <span>TVA ({invoice.taxRate}%):</span>
                <span>{formatCurrency(totalTVA)}</span>
              </div>
              <div className="total-line-final">
                <span><strong>TOTAL TTC:</strong></span>
                <span><strong>{formatCurrency(totalTTC)}</strong></span>
              </div>
              
              {/* Acompte si applicable */}
              {acompteAmount > 0 && (
                <>
                  <div className="total-line">
                    <span>Acompte versé:</span>
                    <span>{formatCurrency(acompteAmount)}</span>
                  </div>
                  <div className="total-line-balance">
                    <span><strong>RESTE À PAYER:</strong></span>
                    <span><strong>{formatCurrency(montantRestant)}</strong></span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Signature dans un cadre séparé */}
        {invoice.signature && (
          <div className="signature-box-new">
            <div className="signature-label">Signature client MYCONFORT:</div>
            <div className="signature-area">
              <img src={invoice.signature} alt="Signature électronique" className="signature-img" />
              <div className="signature-confirmation">✓ Signature électronique enregistrée</div>
            </div>
          </div>
        )}

        {/* Notes si présentes */}
        {invoice.invoiceNotes && (
          <div className="notes-box">
            <div className="notes-title">Remarques:</div>
            <div className="notes-content">{invoice.invoiceNotes}</div>
          </div>
        )}

        {/* Mention légale en pied de page */}
        <div className="legal-footer-new">
          <div className="legal-notice-compact">
            <div className="legal-icon">⚖️</div>
            <div className="legal-content">
              <strong>Article L224‑59 du Code de la consommation</strong>
              <p>« Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon […] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* PAGE 2 - CONDITIONS GÉNÉRALES */}
      <ConditionsGenerales />
    </div>
  );
};
