import React from 'react';

const InvoiceDropdown = ({ invoices, onSelect, onClose, visible }) => (
  visible ? (
    <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-800">Sélectionner une facture</h3>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {invoices.map(invoice => (
          <button key={invoice.id} onClick={() => onSelect(invoice)}
            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-800">{invoice.number}</div>
                <div className="text-sm text-gray-600">{invoice.client.name}</div>
                <div className="text-xs text-gray-500">{invoice.date}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">{invoice.total}€</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="p-2 border-t border-gray-200">
        <button onClick={onClose}
          className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
          Fermer
        </button>
      </div>
    </div>
  ) : null
);
export default InvoiceDropdown;
