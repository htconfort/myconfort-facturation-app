import React from 'react';

const ProductTable = ({ items, updateQuantity, removeFromCart }) => (
  <table className="w-full border-collapse border border-gray-300 rounded-lg">
    <thead>
      <tr className="bg-green-700 text-white">
        <th className="px-4 py-2">Produit</th>
        <th className="px-4 py-2">Qté</th>
        <th className="px-4 py-2">Prix unitaire</th>
        <th className="px-4 py-2">Remise</th>
        <th className="px-4 py-2">Total</th>
        <th className="px-4 py-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {items.map(item => (
        <tr key={item.id} className="bg-white hover:bg-gray-100">
          <td className="px-4 py-2">{item.name}</td>
          <td className="px-4 py-2">
            <button onClick={() => updateQuantity(item.id, -1)}>-</button>
            {item.quantity}
            <button onClick={() => updateQuantity(item.id, 1)}>+</button>
          </td>
          <td className="px-4 py-2">{item.priceTTC}€</td>
          <td className="px-4 py-2">{item.discount || '-'}</td>
          <td className="px-4 py-2">{(item.priceTTC * item.quantity).toLocaleString()}€</td>
          <td className="px-4 py-2">
            <button onClick={() => removeFromCart(item.id)}>Supprimer</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
export default ProductTable;
