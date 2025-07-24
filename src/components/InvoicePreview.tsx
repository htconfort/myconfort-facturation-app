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
      product.discountType === 'percent' ? 'percent' : 'fixed'
    );
  }, 0);

  // Calculer l'acompte et le montant restant
  const acompteAmount = invoice.montantAcompte || 0;
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
      product.discountType === 'percent' ? 'percent' : 'fixed'
    );
    return sum + (originalTotal - discountedTotal);
  }, 0);

  return (
    <div 
      id="facture-apercu" 
      className={`facture-apercu ultra-compact ${className}`}
    >
      <div className="invoice-container">
        {/* Header compact avec bouton SIGNÉE à droite */}
        <header className="invoice-header-compact">
          <div>
            <h1 style={{ fontSize: '20px', margin: '0', color: '#477A0C' }}>MYCONFORT</h1>
            <p style={{ fontSize: '11px', margin: '2px 0', color: '#666' }}>Facturation professionnelle avec signature électronique</p>
          </div>
          {invoice.signature && (
            <div className="signed-badge-right">✓ SIGNÉE</div>
          )}
        </header>

        {/* Main Information - Ultra compact */}
        <section className="main-info-compact">
          <div className="company-details-compact">
            <h3 style={{ fontSize: '12px', margin: '0 0 5px 0', color: '#477A0C' }}>MYCONFORT</h3>
            <p style={{ fontSize: '9px', margin: '1px 0', lineHeight: '1.2' }}>
              88 Avenue des Ternes • 75017 Paris, France<br/>
              SIRET: 824 313 530 00027 • Tél: 04 68 50 41 45<br/>
              Email: myconfort@gmail.com • https://www.htconfort.com
            </p>
          </div>
          <div className="invoice-meta-compact">
            <div style={{ fontSize: '10px', marginBottom: '3px' }}>
              <strong>N° Facture:</strong> {invoice.invoiceNumber}
            </div>
            <div style={{ fontSize: '10px', marginBottom: '3px' }}>
              <strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
            </div>
            {invoice.eventLocation && (
              <div style={{ fontSize: '10px', marginBottom: '3px' }}>
                <strong>Lieu:</strong> {invoice.eventLocation}
              </div>
            )}
          </div>
        </section>

        {/* Client Information - Compact et vert */}
        <div className="section-header-green" style={{ padding: '8px 15px', margin: '10px 0 5px 0', fontSize: '12px' }}>INFORMATIONS CLIENT</div>
        <div className="client-grid-compact">
          <div className="client-field-compact">
            <span className="label-compact">Nom:</span>
            <span className="value-compact">{invoice.clientName}</span>
          </div>
          <div className="client-field-compact">
            <span className="label-compact">Adresse:</span>
            <span className="value-compact">{invoice.clientAddress}</span>
          </div>
          <div className="client-field-compact">
            <span className="label-compact">CP:</span>
            <span className="value-compact">{invoice.clientPostalCode}</span>
          </div>
          <div className="client-field-compact">
            <span className="label-compact">Ville:</span>
            <span className="value-compact">{invoice.clientCity}</span>
          </div>
          <div className="client-field-compact">
            <span className="label-compact">Code porte:</span>
            <span className="value-compact">{invoice.clientDoorCode}</span>
          </div>
          <div className="client-field-compact">
            <span className="label-compact">Email:</span>
            <span className="value-compact">{invoice.clientEmail}</span>
          </div>
          <div className="client-field-compact">
            <span className="label-compact">Tél:</span>
            <span className="value-compact">{invoice.clientPhone}</span>
          </div>
        </div>

        {/* Payment and Delivery Information - Compact */}
        <section className="info-section-compact">
          <div className="info-header-compact">MODE DE RÈGLEMENT & LIVRAISON</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', margin: '5px 0' }}>
            <span><strong>Paiement:</strong> {invoice.paymentMethod || 'Non spécifié'}</span>
            <span><strong>Livraison:</strong> {invoice.deliveryMethod || 'Non spécifié'}</span>
          </div>
          <div style={{ fontSize: '9px', color: '#666', fontStyle: 'italic', textAlign: 'center', margin: '3px 0' }}>
            Livraison réalisée au pied de l'immeuble ou au portail
          </div>
          <div style={{ fontSize: '10px', textAlign: 'center', margin: '3px 0' }}>
            <strong>Signature client:</strong> {invoice.signature ? '✓ Signature électronique enregistrée' : 'En attente de signature'}
          </div>
        </section>

        {/* Products Section */}
        <section className="products-section">
          <div className="products-title">Produits & Tarification</div>
          
          {/* Signature Box - Clean and Professional */}
          {invoice.signature && (
            <div className="signature-box">
              <div className="signature-label">SIGNATURE CLIENT</div>
              <div className="signature-placeholder">
                <img src={invoice.signature} alt="Signature électronique" style={{ maxHeight: '60px', maxWidth: '200px' }} />
              </div>
            </div>
          )}

          <table className="products-table">
            <thead>
              <tr>
                <th>Quantité</th>
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
                  product.discountType === 'percent' ? 'percent' : 'fixed'
                );
                
                return (
                  <tr key={index}>
                    <td>{product.quantity}</td>
                    <td>{formatCurrency(unitPriceHT)}</td>
                    <td>{formatCurrency(product.priceTTC)}</td>
                    <td>
                      {product.discount > 0 ? (
                        product.discountType === 'percent' ? 
                          `${product.discount}%` : 
                          formatCurrency(product.discount)
                      ) : '-'}
                    </td>
                    <td>{formatCurrency(totalProduct)}</td>
                  </tr>
                );
              })}
              {invoice.products.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                    Aucun produit ajouté
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="totals">
            <div className="total-row">
              <span className="total-label">Total HT:</span>
              <span className="total-value">{formatCurrency(totalHT)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">TVA ({invoice.taxRate}%):</span>
              <span className="total-value">{formatCurrency(totalTVA)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="total-row" style={{ color: '#e53e3e' }}>
                <span className="total-label">Remise totale:</span>
                <span className="total-value">-{formatCurrency(totalDiscount)}</span>
              </div>
            )}
            <div className="total-row final-total">
              <span className="total-label">TOTAL TTC:</span>
              <span className="total-value">{formatCurrency(totalTTC)}</span>
            </div>
            
            {/* Mention légale Article L224‑59 - Fond blanc sans encadré */}
            <div className="legal-mention-simple">
              <div className="legal-title">
                ⚖️ Article L224‑59 du Code de la consommation
              </div>
              <div className="legal-text">
                « Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon […] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »
              </div>
            </div>
            {/* Acompte si applicable */}
            {acompteAmount > 0 && (
              <>
                <div className="total-row" style={{ marginTop: '10px' }}>
                  <span className="total-label">Acompte versé:</span>
                  <span className="total-value" style={{ color: '#3182ce' }}>{formatCurrency(acompteAmount)}</span>
                </div>
                <div className="total-row" style={{ 
                  backgroundColor: '#fff3cd', 
                  padding: '8px', 
                  borderRadius: '4px',
                  marginTop: '5px',
                  color: '#ff8c00'
                }}>
                  <span className="total-label" style={{ fontWeight: 'bold' }}>RESTE À PAYER:</span>
                  <span className="total-value" style={{ fontWeight: 'bold' }}>{formatCurrency(montantRestant)}</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Notes if present */}
        {invoice.invoiceNotes && (
          <section className="info-section">
            <div className="info-header">REMARQUES</div>
            <p style={{ padding: '10px', fontSize: '13px' }}>{invoice.invoiceNotes}</p>
          </section>
        )}

        {/* Footer */}
        <footer className="footer">
          <h3>🌸 MYCONFORT</h3>
          <p>Merci pour votre confiance !</p>
          <p>Votre spécialiste en matelas et literie de qualité</p>
          <p>88 Avenue des Ternes, 75017 Paris - Tél: 04 68 50 41 45</p>
          <p>Email: myconfort@gmail.com - SIRET: 824 313 530 00027</p>
        </footer>
      </div>
      
      {/* Conditions générales sur page séparée pour l'impression */}
      <ConditionsGenerales />
    </div>
  );
};
