import React from 'react';
import axios from 'axios';

const StripePayment = ({ cart, total, selectedReceiptType, clientData, onSuccess, onCancel }) => {
  const handleStripePayment = async () => {
    try {
      const detalles = cart.map(item => ({
        productoId: item.id,
        cantidad: item.quantity,
        precioUnitario: item.precio
      }));

      // Llamar al backend para crear la sesión de Stripe
      const response = await axios.post('http://localhost:8080/api/stripe/create-checkout-session', {
        detalles,
        tipoComprobante: selectedReceiptType,
        clientData: selectedReceiptType === 'Factura' ? clientData : null
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      // Redirigir a la página de pago de Stripe
        console.log('Full response from create-checkout-session:', response);
        const stripeUrl = response.data;
        console.log('Stripe checkout session URL received:', stripeUrl);
        if (stripeUrl) {
            window.location.href = stripeUrl;
        } else {
            console.log('Stripe checkout session URL is undefined or null.');
            onCancel();
        }

    } catch (error) {
      console.error('Error al procesar el pago:', error.response ? error.response.data : error.message);
      onCancel();
    }
  };

  return (
    <div className="stripe-payment-container p-4">
      <h3 className="text-xl font-bold mb-4">Pago con Tarjeta</h3>
      <div className="payment-summary mb-4">
        <p className="text-lg">Total a pagar: S/. {total.toFixed(2)}</p>
      </div>
      <div className="payment-actions flex gap-4">
        <button
          onClick={handleStripePayment}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Pagar con Tarjeta
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default StripePayment;