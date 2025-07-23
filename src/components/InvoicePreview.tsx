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
      className={`original-invoice ${className}`}
    >
      {/* PAGE 1 - REPRODUCTION EXACTE DE LA FACTURE ORIGINALE */}
      <div className="invoice-page">
        
        {/* En-tête avec informations de l'entreprise et encadré FACTURE */}
        <header className="original-header">
          <div className="company-section">
            <div className="company-info">
              <h1>MYCONFORT</h1>
              <p className="tagline">Quand on dort bien, on vit bien.</p>
            </div>
            <div className="company-details">
              <p><strong>MYCONFORT</strong></p>
              <p>88 Avenue des Ternes</p>
              <p>75017 Paris, France</p>
              <p>SIRET: 824 313 530 00027</p>
              <p>Tél: 04 68 50 41 45</p>
              <p>Email: myconfort@gmail.com</p>
              <p>Site web: https://www.htconfort.com</p>
            </div>
          </div>
          
          <div className="invoice-header-green">
            <div className="facture-title">FACTURE</div>
            <div className="invoice-details">
              <p><strong>N° Facture:</strong> {invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </header>

        {/* Section principale en deux colonnes */}
        <section className="main-sections">
          <div className="left-section">
            <div className="section-header green-bg">FACTURER À</div>
            <div className="client-details">
              <p><strong>{invoice.client.name}</strong></p>
              <p>{invoice.client.address}</p>
              <p>{invoice.client.postalCode} {invoice.client.city}</p>
              <p><strong>Tél:</strong> {invoice.client.phone}</p>
              <p><strong>Email:</strong> {invoice.client.email}</p>
            </div>
          </div>
          
          <div className="right-section">
            <div className="section-header green-bg">INFORMATIONS COMPLÉMENTAIRES</div>
            <div className="additional-info">
              <p><strong>Type de logement:</strong> Maison</p>
              <p><strong>Code d'accès:</strong> 123456</p>
            </div>
          </div>
        </section>

        {/* Tableau des produits */}
        <section className="products-section">
          <div className="section-header green-bg">DÉTAIL DES PRODUITS</div>
          <table className="original-products-table">
            <thead>
              <tr>
                <th>DÉSIGNATION</th>
                <th>QTÉ</th>
                <th>PU HT</th>
                <th>PU TTC</th>
                <th>REMISE</th>
                <th>TOTAL TTC</th>
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
                    <td>
                      <div className="product-name">{product.name}</div>
                      <div className="product-subtitle">Matelas</div>
                    </td>
                    <td className="text-center">{product.quantity}</td>
                    <td className="text-right">{formatCurrency(unitPriceHT)}</td>
                    <td className="text-right">{formatCurrency(product.priceTTC)}</td>
                    <td className="text-center red-text">
                      {product.discount > 0 ? (
                        product.discountType === 'percentage' ? 
                          `-${product.discount}%` : 
                          `-${formatCurrency(product.discount)}`
                      ) : '-'}
                    </td>
                    <td className="text-right font-bold">{formatCurrency(totalProduct)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Mention légale sous le tableau */}
          <div className="legal-mention-table">
            <p>⚖️ <strong>Article L224-59 du Code de la consommation</strong></p>
            <p>« Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon [...] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »</p>
          </div>
        </section>

        {/* Totaux à droite */}
        <section className="totals-right">
          <div className="totals-box-original">
            <div className="total-row">
              <span>Montant HT:</span>
              <span>{formatCurrency(totalHT)}</span>
            </div>
            <div className="total-row">
              <span>TVA (20%):</span>
              <span>{formatCurrency(totalTVA)}</span>
            </div>
            <div className="total-row red-text">
              <span>Remise totale:</span>
              <span>-{formatCurrency(totalDiscount)}</span>
            </div>
            <div className="total-row-final">
              <span><strong>TOTAL TTC:</strong></span>
              <span><strong>{formatCurrency(totalTTC)}</strong></span>
            </div>
            
            {/* Case à cocher conditions générales */}
            <div className="conditions-checkbox">
              <label>
                <input type="checkbox" /> J'ai lu et j'accepte les conditions générales de vente *
              </label>
            </div>
          </div>
        </section>

        {/* Modalités de paiement */}
        <section className="payment-modalities">
          <div className="section-header green-bg">MODALITÉS DE PAIEMENT</div>
          <div className="payment-details">
            <p><strong>Mode de règlement:</strong> {invoice.payment.method || 'Carte Bleue'}</p>
            <p>Si vous devez envoyer des règlements par chèque, Voici l'adresse :</p>
            <p>SAV HtConfort 8 rue du grégal 66510 st hippolyte 0661486023</p>
          </div>
        </section>

        {/* Footer vert MYCONFORT */}
        <footer className="green-footer">
          <div className="footer-content">
            <div className="footer-logo-section">
              <div className="footer-logo">🌸 MYCONFORT</div>
              <div className="footer-text">
                <p><strong>Merci de votre confiance !</strong></p>
                <p>Votre spécialiste en matelas et literie de qualité</p>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>TVA non applicable art. 293 B du CGI – NCS Paris 824 313 530</p>
          </div>
        </footer>

      </div>
      
      {/* PAGE 2 - CONDITIONS GÉNÉRALES */}
      <ConditionsGenerales />
    </div>
  );
};
