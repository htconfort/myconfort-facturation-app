import React from 'react';

const TotalsBlock = ({ totalHT, totalTTC, totalRemise, totalTVA }) => (
  <div className="bg-gray-50 rounded-lg p-6">
    <div className="flex flex-col space-y-2">
      <div>Montant HT : <span className="font-bold">{totalHT}€</span></div>
      <div>TVA (20%) : <span className="font-bold">{totalTVA}€</span></div>
      <div>Remises : <span className="font-bold text-orange-600">-{totalRemise}€</span></div>
      <div>Total TTC : <span className="font-bold text-green-700 text-xl">{totalTTC}€</span></div>
    </div>
  </div>
);
export default TotalsBlock;
