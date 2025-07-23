import React from 'react';

export const ConditionsGenerales: React.FC = () => {
  return (
    <div className="conditions-generales page-break-before">
      <div className="conditions-header">
        <h1 style={{ textAlign: 'center', color: '#477A0C', marginBottom: '20px' }}>
          CONDITIONS GÉNÉRALES DE VENTE
        </h1>
        <h2 style={{ textAlign: 'center', color: '#477A0C', fontSize: '16px', marginBottom: '30px' }}>
          MYCONFORT
        </h2>
      </div>
      
      <div className="conditions-content" style={{ fontSize: '10px', lineHeight: '1.4' }}>
        <div className="condition-section" style={{ marginBottom: '15px' }}>
          <h3 style={{ color: '#477A0C', fontSize: '12px', marginBottom: '8px' }}>1. OBJET</h3>
          <p>Les présentes conditions générales de vente s'appliquent à toutes les ventes de produits de literie et d'accessoires effectuées par MYCONFORT.</p>
        </div>

        <div className="condition-section" style={{ marginBottom: '15px' }}>
          <h3 style={{ color: '#477A0C', fontSize: '12px', marginBottom: '8px' }}>2. PRIX ET PAIEMENT</h3>
          <p>Les prix sont indiqués en euros TTC. Le paiement s'effectue selon les modalités convenues lors de la commande. En cas de retard de paiement, des pénalités de retard au taux de 3 fois le taux légal pourront être appliquées.</p>
        </div>

        <div className="condition-section" style={{ marginBottom: '15px' }}>
          <h3 style={{ color: '#477A0C', fontSize: '12px', marginBottom: '8px' }}>3. LIVRAISON</h3>
          <p>La livraison est réalisée au pied de l'immeuble ou au portail selon les modalités convenues. Les délais de livraison sont donnés à titre indicatif. Un retard de livraison ne peut donner lieu à annulation de la commande ou à dommages et intérêts.</p>
        </div>

        <div className="condition-section" style={{ marginBottom: '15px' }}>
          <h3 style={{ color: '#477A0C', fontSize: '12px', marginBottom: '8px' }}>4. GARANTIES</h3>
          <p>Nos produits bénéficient de la garantie légale de conformité. La garantie commerciale varie selon les produits et est précisée lors de la vente. Les produits défectueux seront remplacés ou réparés dans les meilleurs délais.</p>
        </div>

        <div className="condition-section" style={{ marginBottom: '15px' }}>
          <h3 style={{ color: '#477A0C', fontSize: '12px', marginBottom: '8px' }}>5. DROIT DE RÉTRACTATION</h3>
          <p>Pour les ventes à domicile, l'acheteur dispose d'un délai de 14 jours pour exercer son droit de rétractation sans avoir à justifier de motifs ni à payer de pénalités, conformément à l'article L221-18 du Code de la consommation.</p>
        </div>

        <div className="condition-section" style={{ marginBottom: '15px' }}>
          <h3 style={{ color: '#477A0C', fontSize: '12px', marginBottom: '8px' }}>6. DONNÉES PERSONNELLES</h3>
          <p>Les données personnelles collectées sont utilisées uniquement dans le cadre de la relation commerciale et ne sont pas transmises à des tiers sans consentement préalable.</p>
        </div>

        <div className="condition-section" style={{ marginBottom: '15px' }}>
          <h3 style={{ color: '#477A0C', fontSize: '12px', marginBottom: '8px' }}>7. LITIGES</h3>
          <p>En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. À défaut, les tribunaux français seront seuls compétents.</p>
        </div>

        <div className="condition-section" style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#477A0C', fontSize: '12px', marginBottom: '8px' }}>8. CONTACT</h3>
          <p>
            MYCONFORT<br />
            88 Avenue des Ternes<br />
            75017 Paris, France<br />
            SIRET: 824 313 530 00027<br />
            Tél: 04 68 50 41 45<br />
            Email: myconfort@gmail.com<br />
            Site web: https://www.htconfort.com
          </p>
        </div>
      </div>
    </div>
  );
};
