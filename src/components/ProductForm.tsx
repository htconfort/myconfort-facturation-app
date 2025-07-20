import React, { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { InvoiceItem } from '../utils/data';

interface ProductFormProps {
  onAddProduct: (product: InvoiceItem) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onAddProduct }) => {
  const [formData, setFormData] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      alert('Veuillez saisir une description');
      return;
    }

    const newProduct: InvoiceItem = {
      id: Date.now().toString(),
      description: formData.description,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      total: formData.quantity * formData.unitPrice
    };

    onAddProduct(newProduct);
    
    // Reset form
    setFormData({
      description: '',
      quantity: 1,
      unitPrice: 0
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Package className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-800">Ajouter un produit/service</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ex: Matelas MyComfort Premium 160x200"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix unitaire (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{(formData.quantity * formData.unitPrice).toFixed(2)} €</span>
          </div>
          
          <button
            type="submit"
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter</span>
          </button>
        </div>
      </form>
    </div>
  );
};