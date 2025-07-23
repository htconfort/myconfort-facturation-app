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
        </section>

        {/* Products Section */}
        <section className="products-section">
          <div className="products-title">Produits & Tarification</div>
          
          {/* Signature Box - Version compacte */}
          {invoice.signature && (
            <div className="signature-box-compact">
              <div className="signature-label-small">Signature client:</div>
              <img src={invoice.signature} alt="Signature électronique" className="signature-compact" />
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

      {/* PAGE 2 - CONDITIONS GÉNÉRALES DE VENTE */}
      <div className="conditions-page">
        <h1>CONDITIONS GÉNÉRALES DE VENTE</h1>
        
        <h2>1. DÉFINITIONS</h2>
        <p>
          Les présentes conditions générales de vente s'appliquent à toutes les ventes conclues par la société MYCONFORT, 
          SARL au capital de 5000€, immatriculée au RCS de Paris sous le numéro 824 313 530, 
          dont le siège social est situé 88 Avenue des Ternes, 75017 Paris.
        </p>

        <h2>2. PRIX ET MODALITÉS DE PAIEMENT</h2>
        <h3>2.1 Prix</h3>
        <p>
          Les prix sont exprimés en euros toutes taxes comprises. Ils sont fermes et non révisables 
          pendant leur durée de validité mais la société MYCONFORT se réserve le droit de les modifier 
          à tout moment pour les commandes ultérieures.
        </p>
        
        <h3>2.2 Modalités de paiement</h3>
        <p>Le règlement s'effectue :</p>
        <ul>
          <li>Comptant à la commande par chèque, espèces ou virement bancaire</li>
          <li>En plusieurs fois selon accord préalable</li>
          <li>Un acompte peut être demandé à la commande</li>
        </ul>

        <h2>3. LIVRAISON</h2>
        <h3>3.1 Délais de livraison</h3>
        <p>
          Les délais de livraison sont donnés à titre indicatif. Ils ne constituent pas un engagement 
          ferme de la part de MYCONFORT. Les retards de livraison ne donnent pas droit à dommages et intérêts.
        </p>
        
        <h3>3.2 Transport et risques</h3>
        <p>
          La marchandise voyage aux risques et périls de l'acheteur. Les réclamations concernant 
          les avaries ou manquants lors du transport doivent être formulées auprès du transporteur 
          dans les 48 heures suivant la livraison.
        </p>

        <h2>4. GARANTIES</h2>
        <h3>4.1 Garantie légale</h3>
        <p>
          Tous nos produits bénéficient de la guarantee légale de conformité et de la garantie contre 
          les vices cachés prévues par le Code de la consommation.
        </p>
        
        <h3>4.2 Garantie commerciale</h3>
        <p>
          Une garantie commerciale spécifique peut s'appliquer selon les produits. 
          Les modalités vous sont communiquées lors de la vente.
        </p>

        <h2>5. DROIT DE RÉTRACTATION</h2>
        <p>
          Conformément aux dispositions du Code de la consommation, vous disposez d'un délai 
          de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation 
          sans avoir à justifier de motifs ni à payer de pénalités.
        </p>

        <h2>6. RÉCLAMATIONS</h2>
        <p>
          Toute réclamation doit être adressée par écrit à MYCONFORT dans un délai maximum de 8 jours 
          après livraison. Passé ce délai, aucune réclamation ne sera prise en compte.
        </p>

        <h2>7. CLAUSE DE RÉSERVE DE PROPRIÉTÉ</h2>
        <p>
          La société MYCONFORT conserve la propriété des biens vendus jusqu'au paiement intégral 
          du prix en principal et accessoires.
        </p>

        <h2>8. DONNÉES PERSONNELLES</h2>
        <p>
          Conformément à la loi "Informatique et Libertés" et au RGPD, vous disposez d'un droit d'accès, 
          de rectification et de suppression des données vous concernant. 
          Ces données sont utilisées uniquement dans le cadre de la relation commerciale.
        </p>

        <h2>9. LITIGES</h2>
        <p>
          En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. 
          À défaut, les tribunaux de Paris seront seuls compétents.
        </p>

        <h2>10. ACCEPTATION</h2>
        <p>
          Le fait de passer commande implique l'acceptation pleine et entière des présentes 
          conditions générales de vente.
        </p>
      </div>
    </div>
  );
};
