import React from 'react';

const StatusBar = ({ isInvoiceComplete }) => (
  <div style={{ backgroundColor: '#14281D' }} className="p-4">
    <div className="flex items-center justify-between">
      <div className="text-white">
        <div className="font-bold">MYCONFORT</div>
        <div className="text-sm opacity-90">Facturation professionnelle</div>
      </div>
      <div className="flex items-center space-x-3 text-white">
        <span className="text-sm">Statut de la facture</span>
        <div className="px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1"
          style={{ backgroundColor: isInvoiceComplete ? '#477A0C' : '#F55D3E' }}>
          <span>{isInvoiceComplete ? 'COMPLÈTE' : 'INCOMPLÈTE'}</span>
        </div>
      </div>
    </div>
  </div>
);
export default StatusBar;
