import React from 'react';

const PaymentOptions = ({ cart, total, onBackToCart, setCart, setToast }) => {
  const handleCheckout = async (paymentMethod) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({
        message: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
        type: 'error'
      });
      return;
    }

    const ventaRequest = {
      detallesVenta: cart.map(item => ({
        productoId: item.id,
        cantidad: item.quantity,
        precioUnitario: item.precio
      })),
      metodoPago: paymentMethod
    };

    try {
      const response = await fetch('http://localhost:8080/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ventaRequest)
      });

      if (response.ok) {
        setToast({
          message: 'Venta realizada con éxito!',
          type: 'success'
        });
        setCart([]); // Clear the cart after successful sale
        onBackToCart(); // Go back to the cart view
      } else {
        const errorData = await response.json();
        setToast({
          message: errorData.message || 'Error al procesar la venta.',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        message: 'Error de red o servidor no disponible.',
        type: 'error'
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col justify-between">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Resumen de la compra</h2>
        <div className="flex-grow overflow-y-auto pr-2 mb-4" style={{ maxHeight: '200px' }}>
          {cart.length === 0 ? (
            <p className="text-gray-500">No hay productos en el resumen.</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b py-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.nombre}</h3>
                  <p className="text-gray-600 text-sm">Cantidad: {item.quantity}</p>
                </div>
                <span className="font-semibold">S/. {(item.precio * item.quantity).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold">Total:</span>
          <span className="text-xl font-bold">S/. {total.toFixed(2)}</span>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Selecciona el método de pago*</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleCheckout('Efectivo')}
            className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <img src="/icons/efectivo.svg" alt="Efectivo" className="w-12 h-12 mb-2" />
            <span>Efectivo</span>
          </button>
          <button
            onClick={() => handleCheckout('Tarjeta')}
            className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <img src="/icons/tarjeta.svg" alt="Tarjeta" className="w-12 h-12 mb-2" />
            <span>Tarjeta</span>
          </button>

          <button
            onClick={() => handleCheckout('Plin')}
            className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <img src="/icons/plin.png" alt="Plin" className="w-12 h-12 mb-2" />
            <span>Plin</span>
          </button>
          <button
            onClick={() => handleCheckout('Yape')}
            className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <img src="/icons/yape.png" alt="Yape" className="w-12 h-12 mb-2" />
            <span>Yape</span>
          </button>
        </div>
      </div>
      <button
        onClick={onBackToCart}
        className="w-full bg-gray-300 text-gray-800 py-3 rounded-lg text-lg font-semibold hover:bg-gray-400 mt-4"
      >
        Volver al Carrito
      </button>
    </div>
  );
};

export default PaymentOptions;