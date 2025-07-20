import React from 'react';
import { Invoice } from '../types';
import { formatCurrency, calculateHT, calculateProductTotal } from '../utils/calculations';

interface InvoicePDFProps {
  invoice: Invoice;
  isPreview?: boolean;
}

export const InvoicePDF = React.forwardRef<HTMLDivElement, InvoicePDFProps>(
  ({ invoice, isPreview = false }, ref) => {
    const totals = React.useMemo(() => {
      const subtotal = invoice.products.reduce((sum, product) => {
        return sum + (product.quantity * calculateHT(product.priceTTC, invoice.taxRate));
      }, 0);

      const totalWithTax = invoice.products.reduce((sum, product) => {
        return sum + calculateProductTotal(
          product.quantity,
          product.priceTTC,
          product.discount,
          product.discountType
        );
      }, 0);

      const totalDiscount = invoice.products.reduce((sum, product) => {
        const originalTotal = product.priceTTC * product.quantity;
        const discountedTotal = calculateProductTotal(
          product.quantity,
          product.priceTTC,
          product.discount,
          product.discountType
        );
        return sum + (originalTotal - discountedTotal);
      }, 0);

      return {
        subtotal,
        totalWithTax,
        totalDiscount,
        taxAmount: totalWithTax - (totalWithTax / (1 + (invoice.taxRate / 100)))
      };
    }, [invoice.products, invoice.taxRate]);

    const containerClass = isPreview 
      ? "max-w-4xl mx-auto bg-white shadow-2xl" 
      : "w-full bg-white";

    return (
      <div ref={ref} className={containerClass} style={{ fontFamily: 'Inter, sans-serif', color: '#080F0F', fontSize: '12px', lineHeight: '1.3' }}>
        {/* Bordure supérieure verte */}
        <div className="h-0.5 bg-[#477A0C]"></div>
        
        {/* En-tête de la facture */}
        <div className="p-4 border-b-2 border-[#477A0C]">
          <div className="flex justify-between items-start">
            {/* Logo et informations entreprise */}
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <div className="bg-[#477A0C] rounded-full w-10 h-10 flex items-center justify-center text-[#F2EFE2] text-2xl mr-3">
                  🌸
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#477A0C] tracking-tight">
                    MYCONFORT
                  </h1>
                  <p className="text-sm font-medium" style={{ color: '#080F0F' }}>Facturation Professionnelle</p>
                  
                  {/* Mention légale Article L224‑59 - Fond blanc sans encadré */}
                  <div className="mt-2">
                    <div className="font-bold text-xs mb-0.5" style={{ color: '#080F0F' }}>
                      ⚖️ Article L224‑59 du Code de la consommation
                    </div>
                    <div className="text-xs font-bold leading-tight" style={{ color: '#080F0F', fontSize: '10px' }}>
                      « Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon […] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs space-y-0.5" style={{ color: '#080F0F' }}>
                <p className="font-semibold text-sm" style={{ color: '#080F0F' }}>MYCONFORT</p>
                <p className="font-semibold">88 Avenue des Ternes</p>
                <p>75017 Paris, France</p>
                <p>SIRET: 824 313 530 00027</p>
                <p>Tél: 04 68 50 41 45</p>
                <p>Email: myconfort@gmail.com</p>
                <p>Site web: https://www.htconfort.com</p>
              </div>
            </div>

            {/* Informations facture */}
            <div className="text-right">
              <div className="bg-[#477A0C] text-[#F2EFE2] px-4 py-2 rounded-lg mb-3">
                <h2 className="text-lg font-bold">FACTURE</h2>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center min-w-[150px]">
                  <span className="font-semibold" style={{ color: '#080F0F' }}>N° Facture:</span>
                  <span className="font-bold text-sm text-[#477A0C]">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold" style={{ color: '#080F0F' }}>Date:</span>
                  <span className="font-semibold" style={{ color: '#080F0F' }}>{new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</span>
                </div>
                {invoice.eventLocation && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold" style={{ color: '#080F0F' }}>Lieu:</span>
                    <span className="font-semibold" style={{ color: '#080F0F' }}>{invoice.eventLocation}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#477A0C] mb-2 border-b border-[#477A0C] pb-1">
                FACTURER À
              </h3>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-sm" style={{ color: '#080F0F' }}>{invoice.client.name}</p>
                <p style={{ color: '#080F0F' }}>{invoice.client.address}</p>
                <p style={{ color: '#080F0F' }}>{invoice.client.postalCode} {invoice.client.city}</p>
                {invoice.client.siret && <p style={{ color: '#080F0F' }}>SIRET: {invoice.client.siret}</p>}
                <div className="pt-1 space-y-0.5">
                  <p style={{ color: '#080F0F' }}>
                    <span className="font-semibold">Tél:</span> {invoice.client.phone}
                  </p>
                  <p style={{ color: '#080F0F' }}>
                    <span className="font-semibold">Email:</span> {invoice.client.email}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#477A0C] mb-2 border-b border-[#477A0C] pb-1">
                INFORMATIONS COMPLÉMENTAIRES
              </h3>
              <div className="space-y-1 text-xs">
                {invoice.client.housingType && (
                  <p style={{ color: '#080F0F' }}><span className="font-semibold">Type de logement:</span> {invoice.client.housingType}</p>
                )}
                {invoice.client.doorCode && (
                  <p style={{ color: '#080F0F' }}><span className="font-semibold">Code d'accès:</span> {invoice.client.doorCode}</p>
                )}
                {invoice.delivery.method && (
                  <p style={{ color: '#080F0F' }}><span className="font-semibold">Livraison:</span> {invoice.delivery.method}</p>
                )}
                {invoice.advisorName && (
                  <p style={{ color: '#080F0F' }}><span className="font-semibold">Conseiller:</span> {invoice.advisorName}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des produits */}
        <div className="p-4">
          <h3 className="text-sm font-bold text-[#477A0C] mb-3 border-b border-[#477A0C] pb-1">
            DÉTAIL DES PRODUITS
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#477A0C] text-[#F2EFE2]">
                  <th className="border border-gray-300 px-2 py-2 text-left font-bold text-xs">DÉSIGNATION</th>
                  <th className="border border-gray-300 px-1 py-2 text-center font-bold text-xs">QTÉ</th>
                  <th className="border border-gray-300 px-1 py-2 text-right font-bold text-xs">PU HT</th>
                  <th className="border border-gray-300 px-1 py-2 text-right font-bold text-xs">PU TTC</th>
                  <th className="border border-gray-300 px-1 py-2 text-right font-bold text-xs">REMISE</th>
                  <th className="border border-gray-300 px-1 py-2 text-right font-bold text-xs">TOTAL TTC</th>
                </tr>
              </thead>
              <tbody>
                {invoice.products.map((product, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 px-2 py-2">
                      <div className="font-semibold" style={{ color: '#080F0F' }}>{product.name}</div>
                      {product.category && (
                        <div className="text-xs mt-0.5" style={{ color: '#080F0F', fontSize: '10px' }}>{product.category}</div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-1 py-2 text-center font-semibold text-xs" style={{ color: '#080F0F' }}>
                      {product.quantity}
                    </td>
                    <td className="border border-gray-300 px-1 py-2 text-right text-xs" style={{ color: '#080F0F' }}>
                      {formatCurrency(calculateHT(product.priceTTC, invoice.taxRate))}
                    </td>
                    <td className="border border-gray-300 px-1 py-2 text-right font-semibold text-xs" style={{ color: '#080F0F' }}>
                      {formatCurrency(product.priceTTC)}
                    </td>
                    <td className="border border-gray-300 px-1 py-2 text-right text-xs">
                      {product.discount > 0 ? (
                        <span className="text-red-600 font-semibold">
                          -{product.discountType === 'percent' 
                            ? `${product.discount}%` 
                            : formatCurrency(product.discount)
                          }
                        </span>
                      ) : (
                        <span style={{ color: '#080F0F' }}>-</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-1 py-2 text-right font-bold text-xs" style={{ color: '#080F0F' }}>
                      {formatCurrency(calculateProductTotal(
                        product.quantity,
                        product.priceTTC,
                        product.discount,
                        product.discountType
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totaux avec gestion acompte */}
          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-md">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold" style={{ color: '#080F0F' }}>Total HT:</span>
                    <span className="font-semibold" style={{ color: '#080F0F' }}>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold" style={{ color: '#080F0F' }}>TVA ({invoice.taxRate}%):</span>
                    <span className="font-semibold" style={{ color: '#080F0F' }}>{formatCurrency(totals.taxAmount)}</span>
                  </div>
                  {totals.totalDiscount > 0 && (
                    <div className="flex justify-between text-xs text-red-600">
                      <span className="font-semibold">Remise totale:</span>
                      <span className="font-semibold">-{formatCurrency(totals.totalDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-1">
                    <div className="flex justify-between text-sm font-bold">
                      <span style={{ color: '#080F0F' }}>TOTAL TTC:</span>
                      <span className="text-[#477A0C]">{formatCurrency(totals.totalWithTax)}</span>
                    </div>
                  </div>
                  
                  {/* Conditions générales de vente */}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-green-600 font-bold">✅</span>
                      <span className="font-semibold" style={{ color: '#080F0F' }}>
                        J'ai lu et j'accepte les conditions générales de vente *
                      </span>
                    </div>
                  </div>
                  
                  {/* Gestion acompte - EXACTEMENT comme dans l'aperçu */}
                  {invoice.payment.method === 'Acompte' && invoice.payment.depositAmount > 0 && (
                    <>
                      <div className="border-t border-gray-300 pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold" style={{ color: '#080F0F' }}>Acompte versé:</span>
                          <span className="font-semibold text-blue-600">{formatCurrency(invoice.payment.depositAmount)}</span>
                        </div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded p-2">
                        <div className="flex justify-between text-sm font-bold text-orange-600">
                          <span>RESTE À PAYER:</span>
                          <span>{formatCurrency(totals.totalWithTax - invoice.payment.depositAmount)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Signature si présente */}
          {invoice.signature && (
            <div className="mt-4 flex justify-end">
              <div className="border border-gray-300 rounded p-2 w-48">
                <h4 className="text-[#477A0C] font-bold text-xs mb-1 text-center">SIGNATURE CLIENT</h4>
                <div className="h-12 flex items-center justify-center">
                  <img src={invoice.signature} alt="Signature" className="max-h-full max-w-full" />
                </div>
                <p className="text-xs text-center mt-1" style={{ color: '#080F0F', fontSize: '10px' }}>
                  Signé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Informations de paiement et notes */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#477A0C] mb-2">MODALITÉS DE PAIEMENT</h3>
              <div className="space-y-1 text-xs">
                {invoice.payment.method && (
                  <p style={{ color: '#080F0F' }}><span className="font-semibold">Mode de règlement:</span> {invoice.payment.method}</p>
                )}
                
                {/* Affichage spécial pour acompte */}
                {invoice.payment.method === 'Acompte' && invoice.payment.depositAmount > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                    <p className="font-semibold text-blue-800">Détails de l'acompte:</p>
                    <p className="text-blue-700">Montant versé: <span className="font-bold">{formatCurrency(invoice.payment.depositAmount)}</span></p>
                    <p className="text-orange-700 font-semibold">Reste à payer: <span className="font-bold">{formatCurrency(totals.totalWithTax - invoice.payment.depositAmount)}</span></p>
                  </div>
                )}
                
                <div className="bg-white p-2 rounded border mt-2">
                  <p className="text-xs" style={{ color: '#080F0F' }}>
                    Paiement à réception de facture. En cas de retard de paiement, des pénalités de 3 fois le taux d'intérêt légal seront appliquées.
                  </p>
                </div>
              </div>
            </div>

            <div>
              {invoice.invoiceNotes && (
                <>
                  <h3 className="text-sm font-bold text-[#477A0C] mb-2">REMARQUES</h3>
                  <div className="text-xs bg-white p-2 rounded border">
                    <p style={{ color: '#080F0F' }}>{invoice.invoiceNotes}</p>
                  </div>
                </>
              )}
              
              {invoice.delivery.notes && (
                <>
                  <h3 className="text-sm font-bold text-[#477A0C] mb-2 mt-3">LIVRAISON</h3>
                  <div className="text-xs bg-white p-2 rounded border">
                    <p style={{ color: '#080F0F' }}>{invoice.delivery.notes}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="p-4 border-t-2 border-[#477A0C] bg-[#477A0C] text-[#F2EFE2] print:page-break-after">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-lg mr-2">🌸</span>
              <span className="text-lg font-bold">MYCONFORT</span>
            </div>
            <p className="font-bold text-sm mb-1">Merci de votre confiance !</p>
            <p className="text-sm opacity-90">
              Votre spécialiste en matelas et literie de qualité
            </p>
            <div className="mt-4 text-xs opacity-75">
              <p>TVA non applicable, art. 293 B du CGI - RCS Paris 824 313 530</p>
            </div>
          </div>
        </div>

        {/* DEUXIÈME PAGE - CONDITIONS GÉNÉRALES DE VENTE (visible uniquement à l'impression) */}
        <div className="hidden print:block print:page-break-before" style={{ fontFamily: 'Inter, sans-serif', color: '#080F0F', fontSize: '11px', lineHeight: '1.4' }}>
          {/* En-tête de la deuxième page */}
          <div className="p-4 border-b-2 border-[#477A0C] bg-[#477A0C] text-[#F2EFE2] text-center">
            <h1 className="text-xl font-bold">CONDITIONS GÉNÉRALES DE VENTE</h1>
            <p className="text-sm mt-1">MYCONFORT - 88 Avenue des Ternes, 75017 Paris</p>
          </div>

          {/* Contenu des conditions générales */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 1 - Livraison</h3>
              <p className="text-justify">Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison en fonction de vos disponibilités (à la journée ou demi-journée). Le transporteur livre le produit au pas de porte ou en bas de l'immeuble. Veuillez vérifier que les dimensions du produit permettent son passage dans les escaliers, couloirs et portes. Aucun service d'installation ou de reprise de l'ancienne literie n'est prévu.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 2 - Délais de Livraison</h3>
              <p className="text-justify">Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme. En cas de retard, aucune indemnité ou annulation ne sera acceptée, notamment en cas de force majeure. Nous déclinons toute responsabilité en cas de délai dépassé.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 3 - Risques de Transport</h3>
              <p className="text-justify">Les marchandises voyagent aux risques du destinataire. En cas d'avarie ou de perte, il appartient au client de faire les réserves nécessaires obligatoire sur le bordereau du transporteur. En cas de non-respect de cette obligation on ne peut pas se retourner contre le transporteur.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 4 - Acceptation des Conditions</h3>
              <p className="text-justify">Toute livraison implique l'acceptation des présentes conditions. Le transporteur livre à l'adresse indiquée sans monter les étages. Le client est responsable de vérifier et d'accepter les marchandises lors de la livraison.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 5 - Réclamations</h3>
              <p className="text-justify">Les réclamations concernant la qualité des marchandises doivent être formulées par écrit dans les huit jours suivant la livraison, par lettre recommandée avec accusé de réception.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 6 - Retours</h3>
              <p className="text-justify">Aucun retour de marchandises ne sera accepté sans notre accord écrit préalable. Cet accord n'implique aucune reconnaissance.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 7 - Tailles des Matelas</h3>
              <p className="text-justify">Les dimensions des matelas peuvent varier de +/- 5 cm en raison de la thermosensibilité des mousses viscoélastiques. Les tailles standards sont données à titre indicatif et ne constituent pas une obligation contractuelle. Les matelas sur mesure doivent inclure les spécifications exactes du cadre de lit.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 8 - Odeur des Matériaux</h3>
              <p className="text-justify">Les mousses viscoélastiques naturelles (à base d'huile de ricin) et les matériaux de conditionnement peuvent émettre une légère odeur qui disparaît après déballage. Cela ne constitue pas un défaut.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 9 - Règlements et Remises</h3>
              <p className="text-justify">Sauf accord express, aucun rabais ou escompte ne sera appliqué pour paiement comptant. La garantie couvre les mousses, mais pas les textiles et accessoires.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 10 - Paiement</h3>
              <p className="text-justify">Les factures sont payables par chèque, virement, carte bancaire ou espèce à réception.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 11 - Pénalités de Retard</h3>
              <p className="text-justify">En cas de non-paiement, une majoration de 10% avec un minimum de 300 € sera appliquée, sans préjudice des intérêts de retard. Nous nous réservons le droit de résilier la vente sans sommation.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 12 - Exigibilité en Cas de Non-Paiement</h3>
              <p className="text-justify">Le non-paiement d'une échéance rend immédiatement exigible le solde de toutes les échéances à venir.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 13 - Livraison Incomplète ou Non-Conforme</h3>
              <p className="text-justify">En cas de livraison endommagée ou non conforme, mentionnez-le sur le bon de livraison et refusez le produit. Si l'erreur est constatée après le départ du transporteur, contactez-nous sous 72h ouvrables.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 14 - Litiges</h3>
              <p className="text-justify">Tout litige sera de la compétence exclusive du Tribunal de Commerce de Perpignan ou du tribunal compétent du prestataire.</p>
            </div>

            <div>
              <h3 className="font-bold text-[#477A0C] mb-1">Art. 15 - Horaires de Livraison</h3>
              <p className="text-justify">Les livraisons sont effectuées du lundi au vendredi (hors jours fériés). Une personne majeure doit être présente à l'adresse lors de la livraison. Toute modification d'adresse après commande doit être signalée immédiatement à myconfort66@gmail.com.</p>
            </div>
          </div>

          {/* Pied de page de la deuxième page */}
          <div className="mt-6 p-4 border-t-2 border-[#477A0C] bg-[#477A0C] text-[#F2EFE2] text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-lg mr-2">🌸</span>
              <span className="text-lg font-bold">MYCONFORT</span>
            </div>
            <p className="text-sm">88 Avenue des Ternes, 75017 Paris - Tél: 04 68 50 41 45</p>
            <p className="text-sm">Email: myconfort@gmail.com - SIRET: 824 313 530 00027</p>
          </div>
        </div>
      </div>
    );
  }
);
