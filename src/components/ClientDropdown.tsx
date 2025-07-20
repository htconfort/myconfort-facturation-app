import React from 'react';

const ClientDropdown = ({ clients, onSelect, onClose, visible }) => (
  visible ? (
    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-800">Sélectionner un client</h3>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {clients.map(client => (
          <button key={client.id} onClick={() => onSelect(client)}
            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors">
            <div className="font-medium text-gray-800">{client.name}</div>
            <div className="text-sm text-gray-600">{client.email}</div>
            <div className="text-xs text-gray-500">{client.city}</div>
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
export default ClientDropdown;
