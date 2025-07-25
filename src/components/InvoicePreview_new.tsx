import React, { useMemo } from 'react';
import { 
  InvoicePreviewData, 
  formatCurrency, 
  calculateProductTotal, 
  calculateInvoiceTotals,
  formatDate,
  COMPANY_INFO,
  INVOICE_PREVIEW_CLASSES
} from '../shared/invoiceUtils';
import { ConditionsGenerales } from './ConditionsGenerales';

interface InvoicePreviewProps {
  invoice: InvoicePreviewData;
  className?: string;
  isPdfCapture?: boolean; // Pour ajuster le rendu lors de la capture PDF
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  invoice, 
  className = "",
  isPdfCapture = false
}) => {
  // 🧮 Calcul des totaux avec useMemo pour optimisation
  const totals = useMemo(() => 
    calculateInvoiceTotals(invoice.products, invoice.taxRate, invoice.montantAcompte),
    [invoice.products, invoice.taxRate, invoice.montantAcompte]
  );

  // 📊 Données dérivées pour l'affichage
  const totalDiscount = totals.totalDiscount;

  return (
    <div 
      id="facture-apercu" 
      className={`${INVOICE_PREVIEW_CLASSES.container} ${className}`}
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

        {/* Company Details */}
        <section className="main-info-compact">
          <div className="company-details-compact">
            <h3 style={{ fontSize: '12px', margin: '0 0 5px 0', color: '#477A0C' }}>{COMPANY_INFO.name}</h3>
            <p style={{ fontSize: '9px', margin: '1px 0', lineHeight: '1.2' }}>
              {COMPANY_INFO.address} • {COMPANY_INFO.postalCode} {COMPANY_INFO.city}, {COMPANY_INFO.country}<br/>
              SIRET: {COMPANY_INFO.siret} • Tél: {COMPANY_INFO.phone}<br/>
              Email: {COMPANY_INFO.email} • {COMPANY_INFO.website}
            </p>
          </div>
          <div className="invoice-meta-compact">
            <div style={{ fontSize: '10px', marginBottom: '3px' }}>
              <strong>N° Facture:</strong> {invoice.invoiceNumber}
            </div>
            <div style={{ fontSize: '10px', marginBottom: '3px' }}>
              <strong>Date:</strong> {formatDate(invoice.invoiceDate)}
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
              <span className="total-value">{formatCurrency(totals.totalHT)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">TVA ({invoice.taxRate}%):</span>
              <span className="total-value">{formatCurrency(totals.totalTVA)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="total-row" style={{ color: '#e53e3e' }}>
                <span className="total-label">Remise totale:</span>
                <span className="total-value">-{formatCurrency(totalDiscount)}</span>
              </div>
            )}
            <div className="total-row final-total">
              <span className="total-label">TOTAL TTC:</span>
              <span className="total-value">{formatCurrency(totals.totalTTC)}</span>
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
            {invoice.montantAcompte > 0 && (
              <>
                <div className="total-row" style={{ marginTop: '10px' }}>
                  <span className="total-label">Acompte versé:</span>
                  <span className="total-value" style={{ color: '#3182ce' }}>{formatCurrency(invoice.montantAcompte)}</span>
                </div>
                <div className="total-row" style={{ 
                  backgroundColor: '#fff3cd', 
                  padding: '8px', 
                  borderRadius: '4px',
                  marginTop: '5px',
                  color: '#ff8c00'
                }}>
                  <span className="total-label" style={{ fontWeight: 'bold' }}>RESTE À PAYER:</span>
                  <span className="total-value" style={{ fontWeight: 'bold' }}>{formatCurrency(totals.totalARecevoir)}</span>
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
          <h3>🌸 {COMPANY_INFO.name}</h3>
          <p>Merci pour votre confiance !</p>
          <p>{COMPANY_INFO.description}</p>
          <p>{COMPANY_INFO.address}, {COMPANY_INFO.postalCode} {COMPANY_INFO.city} - Tél: {COMPANY_INFO.phone}</p>
          <p>Email: {COMPANY_INFO.email} - SIRET: {COMPANY_INFO.siret}</p>
        </footer>
      </div>
      
      {/* Conditions générales sur page séparée pour l'impression */}
      <ConditionsGenerales />
    </div>
  );
};
