import React from 'react';
import { Invoice } from '../types';
import { formatCurrency } from '../utils/calculations';

interface InvoicePreviewProps {
  invoice: Invoice;
  className?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  invoice, 
  className = "" 
}) => {
  // Utiliser les montants pré-calculés directement depuis l'invoice
  const {
    montantHT,
    montantTTC,
    montantTVA,
    montantRemise,
    montantAcompte,
    montantRestant
  } = invoice;

  return (
    <div 
      id="facture-apercu" 
      className={`facture-apercu ${className}`}
    >
      <div className="invoice-container">
        {/* Header */}
        <header className="header">
          <div>
            <h1>MYCONFORT</h1>
            <p className="subtitle">Facturation professionnelle avec signature électronique</p>
          </div>
          {invoice.isSigned && (
            <div className="signed-badge">✓ SIGNÉE</div>
          )}
        </header>

        {/* Main Information */}
        <section className="main-info">
          <div className="company-details">
            <h3>MYCONFORT</h3>
            <p>88 Avenue des Ternes</p>
            <p>75017 Paris, France</p>
            <p>SIRET: 824 313 530 00027</p>
            <p>Tél: 04 68 50 41 45</p>
            <p>Email: myconfort@gmail.com</p>
            <p>Site web: https://www.htconfort.com</p>
          </div>
          <div className="invoice-meta">
            <div className="meta-item">
              <span className="meta-label">N° Facture:</span>
              <span className="meta-value">{invoice.invoiceNumber}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Date:</span>
              <span className="meta-value">{new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</span>
            </div>
            {invoice.eventLocation && (
              <div className="meta-item">
                <span className="meta-label">Lieu:</span>
                <span className="meta-value">{invoice.eventLocation}</span>
              </div>
            )}
          </div>
        </section>

        {/* Client Information - Utiliser les champs plats */}
        <div className="section-header">INFORMATIONS CLIENT</div>
        <div className="client-grid">
          <div className="client-field">
            <span className="label">Nom complet</span>
            <span className="value">{invoice.clientName}</span>
          </div>
          <div className="client-field">
            <span className="label">Adresse</span>
            <span className="value">{invoice.clientAddress}</span>
          </div>
          <div className="client-field">
            <span className="label">Code postal</span>
            <span className="value">{invoice.clientPostalCode}</span>
          </div>
          <div className="client-field">
            <span className="label">Ville</span>
            <span className="value">{invoice.clientCity}</span>
          </div>
          <div className="client-field">
            <span className="label">Email</span>
            <span className="value">{invoice.clientEmail}</span>
          </div>
          <div className="client-field">
            <span className="label">Téléphone</span>
            <span className="value">{invoice.clientPhone}</span>
          </div>
        </div>

        {/* Logistics Information */}
        {invoice.deliveryMethod && (
          <section className="info-section">
            <div className="info-header">INFORMATIONS LOGISTIQUES</div>
            <div className="info-row">
              <span className="info-label">Mode de livraison:</span>
              <span className="info-value">{invoice.deliveryMethod}</span>
            </div>
          </section>
        )}

        {/* Payment Information */}
        <section className="info-section">
          <div className="info-header payment">MODE DE RÈGLEMENT</div>
          <div className="info-row">
            <span className="info-label">Méthode de paiement:</span>
            <span className="info-value">{invoice.paymentMethod || 'Non spécifié'}</span>
          </div>
          
          {/* Signature Client - Rectangle au-dessus modalités */}
          <div className="signature-payment-box">
            <div className="signature-payment-header">SIGNATURE CLIENT</div>
            <div className="signature-payment-content">
              {invoice.signature ? (
                <>
                  <img src={invoice.signature} alt="Signature électronique" className="signature-payment-image" />
                  <div className="signature-payment-status">✓ Signature électronique enregistrée</div>
                  <div className="signature-payment-date">Signée le {new Date().toLocaleDateString('fr-FR')}</div>
                </>
              ) : (
                <div className="signature-payment-placeholder">En attente de signature</div>
              )}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="products-section">
          <div className="products-title">Produits & Tarification</div>
          
          {/* Signature Box */}
          {invoice.signature && (
            <div className="signature-box">
              <div className="signature-label">SIGNATURE CLIENT</div>
              <div className="signature-placeholder">
                <img src={invoice.signature} alt="Signature électronique" style={{ maxHeight: '60px' }} />
                
                {/* Mention légale Article L224‑59 */}
                <div className="mt-3 bg-red-600 border border-red-400 rounded-lg p-3">
                  <div className="text-white">
                    <div className="font-bold text-xs mb-1 flex items-center">
                      <span className="mr-1">⚖️</span>
                      Article L224‑59 du Code de la consommation
                    </div>
                    <div className="text-xs font-bold leading-relaxed">
                      « Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon […] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »
                    </div>
                  </div>
                </div>
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
                return (
                  <tr key={index}>
                    <td>{product.quantity}</td>
                    <td>{formatCurrency(product.priceHT)}</td>
                    <td>{formatCurrency(product.priceTTC)}</td>
                    <td>
                      {product.discount > 0 ? (
                        product.discountType === 'percentage' ? 
                          `${product.discount}%` : 
                          formatCurrency(product.discount)
                      ) : '-'}
                    </td>
                    <td>{formatCurrency(product.totalTTC)}</td>
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
              <span className="total-value">{formatCurrency(montantHT)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">TVA ({invoice.taxRate}%):</span>
              <span className="total-value">{formatCurrency(montantTVA)}</span>
            </div>
            {montantRemise > 0 && (
              <div className="total-row" style={{ color: '#e53e3e' }}>
                <span className="total-label">Remise totale:</span>
                <span className="total-value">-{formatCurrency(montantRemise)}</span>
              </div>
            )}
            <div className="total-row final-total">
              <span className="total-label">TOTAL TTC:</span>
              <span className="total-value">{formatCurrency(montantTTC)}</span>
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
            {montantAcompte > 0 && (
              <>
                <div className="total-row" style={{ marginTop: '10px' }}>
                  <span className="total-label">Acompte versé:</span>
                  <span className="total-value" style={{ color: '#3182ce' }}>{formatCurrency(montantAcompte)}</span>
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
    </div>
  );
};
