import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';

const Cart = ({ cart, updateQuantity, removeItem, onProceedToPayment }) => {

  const total = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Carrito de Compras</h2>
      <div className="flex-grow overflow-y-auto pr-2">
        {cart.length === 0 ? (
          <p className="text-gray-500">El carrito está vacío.</p>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex items-center justify-between border-b py-3">
              <div className="flex-1">
                <h3 className="font-semibold">{item.nombre}</h3>
                <p className="text-gray-600">S/. {item.precio.toFixed(2)}</p>
              </div>
              <div className="flex items-center">
                <div className="flex items-center">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l-md hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 border-t border-b border-gray-200">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r-md hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 pt-4 border-t-2 border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold">Total:</span>
          <span className="text-xl font-bold">S/. {total.toFixed(2)}</span>
        </div>
        <button
          onClick={onProceedToPayment}
          className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={cart.length === 0}
        >
          Pagar
        </button>
      </div>
    </div>
  );
};

export default Cart;