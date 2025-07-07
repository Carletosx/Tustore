import React, { useState, useEffect } from 'react';
import StripePayment from './StripePayment';

const PaymentOptions = ({ cart, total, onBackToCart, setCart, setToast, onShowReceiptModal, onPaymentSuccess }) => {
  const [selectedReceiptType, setSelectedReceiptType] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [amountReceived, setAmountReceived] = useState('');
  const [change, setChange] = useState(0);
  const [showCashInput, setShowCashInput] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientDoc, setClientDoc] = useState('');
  const [clientAddress, setClientAddress] = useState('');


  useEffect(() => {
    if (selectedPaymentMethod === 'Efectivo' && amountReceived !== '') {
      const received = parseFloat(amountReceived);
      if (!isNaN(received)) {
        setChange(received - total);
      } else {
        setChange(0);
      }
    } else {
      setChange(0);
    }
  }, [amountReceived, total, selectedPaymentMethod]);


  const handleCheckout = async (paymentMethod) => {
    if (!selectedReceiptType) {
      setToast({
        message: 'Por favor seleccione el tipo de comprobante.',
        type: 'error'
      });
      return;
    }

    if (selectedReceiptType === 'Factura' && (!clientName || !clientDoc || !clientAddress)) {
      setToast({
        message: 'Por favor complete todos los datos del cliente para la factura.',
        type: 'error'
      });
      return;
    }

    setSelectedPaymentMethod(paymentMethod);
    
    if (paymentMethod === 'Tarjeta') {
      console.log('Setting showStripePayment to true');
      setShowStripePayment(true);
      return;
    }

    if (paymentMethod === 'Efectivo') {
      setShowCashInput(true);
      setAmountReceived('');
      setChange(0);
      return;
    }

    await onPaymentSuccess(
      paymentMethod,
      0,
      0,
      selectedReceiptType === 'Factura' ? { clientName, clientDoc, clientAddress } : null,
      selectedReceiptType
    );
  };

  const handleProcessCashPayment = async () => {
    if (!selectedReceiptType) {
      setToast({
        message: 'Por favor seleccione el tipo de comprobante.',
        type: 'error'
      });
      return;
    }

    if (!amountReceived.trim()) {
      setToast({
        message: 'Por favor ingrese el monto recibido.',
        type: 'error'
      });
      return;
    }

    const receivedAmount = parseFloat(amountReceived);
    if (isNaN(receivedAmount)) {
      setToast({
        message: 'Por favor ingrese un monto válido.',
        type: 'error'
      });
      return;
    }

    if (receivedAmount < total) {
      setToast({
        message: 'El monto recibido es insuficiente.',
        type: 'error'
      });
      return;
    }

    if (selectedReceiptType === 'Factura') {
      if (!clientName || !clientDoc || !clientAddress) {
        setToast({
          message: 'Por favor complete todos los datos del cliente para la factura.',
          type: 'error'
        });
        return;
      }
    }

    await onPaymentSuccess(
      selectedPaymentMethod,
      parseFloat(amountReceived),
      change,
      selectedReceiptType === 'Factura' ? { clientName, clientDoc, clientAddress } : null,
      selectedReceiptType
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col justify-between">
      {showStripePayment ? (
        <StripePayment
          cart={cart}
          total={total}
          onSuccess={onPaymentSuccess}
          onCancel={() => {
            console.log('StripePayment onCancel called');
            setShowStripePayment(false);
            setSelectedPaymentMethod(null);
          }}
          selectedReceiptType={selectedReceiptType}
          clientData={selectedReceiptType === 'Factura' ? { clientName, clientDoc, clientAddress } : null}
        />
      ) : (
        <>
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Tipo de Comprobante*</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => setSelectedReceiptType('Boleta')}
            className={`py-4 px-6 rounded-lg text-lg font-semibold transition-all duration-200 ${selectedReceiptType === 'Boleta' ? 'bg-blue-500 text-white ring-2 ring-blue-500 shadow-lg' : 'bg-blue-200 text-blue-800 hover:bg-blue-300 hover:shadow-md'}`}
          >
            Boleta
          </button>
          <button
            onClick={() => setSelectedReceiptType('Factura')}
            className={`py-4 px-6 rounded-lg text-lg font-semibold transition-all duration-200 ${selectedReceiptType === 'Factura' ? 'bg-blue-500 text-white ring-2 ring-blue-500 shadow-lg' : 'bg-blue-200 text-blue-800 hover:bg-blue-300 hover:shadow-md'}`}
          >
            Factura
          </button>
        </div>
      </div>
      {selectedReceiptType === 'Factura' && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Datos del Cliente</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ingrese el nombre del cliente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">RUC</label>
              <input
                type="text"
                value={clientDoc}
                onChange={(e) => setClientDoc(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ingrese el RUC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ingrese la dirección"
              />
            </div>
          </div>
        </div>
      )}
      {!showCashInput && !selectedPaymentMethod ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Selecciona el método de pago*</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleCheckout('Efectivo')}
              className={`flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${selectedPaymentMethod === 'Efectivo' ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
            >
              <img src="/icons/efectivo.svg" alt="Efectivo" className="w-12 h-12 mb-2" />
              <span>Efectivo</span>
            </button>
            <button
              onClick={() => handleCheckout('Tarjeta')}
              className={`flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${selectedPaymentMethod === 'Tarjeta' ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
            >
              <img src="/icons/tarjeta.svg" alt="Tarjeta" className="w-12 h-12 mb-2" />
              <span>Tarjeta</span>
            </button>

            <button
              onClick={() => handleCheckout('Plin')}
              className={`flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${selectedPaymentMethod === 'Plin' ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
            >
              <img src="/icons/plin.png" alt="Plin" className="w-12 h-12 mb-2" />
              <span>Plin</span>
            </button>
            <button
              onClick={() => handleCheckout('Yape')}
              className={`flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${selectedPaymentMethod === 'Yape' ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
            >
              <img src="/icons/yape.png" alt="Yape" className="w-12 h-12 mb-2" />
              <span>Yape</span>
            </button>
          </div>
        </div>
      ) : null}

      {showCashInput && selectedPaymentMethod === 'Efectivo' && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-bold mb-3">Pago en Efectivo</h3>
          <div className="mb-3">
            <label htmlFor="amountReceived" className="block text-sm font-medium text-gray-700">Monto Recibido (S/.)</label>
            <input
              type="number"
              id="amountReceived"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              placeholder="Ingrese el monto recibido"
              step="0.01"
            />
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Vuelto:</span>
            <span className="text-lg font-bold">S/. {change.toFixed(2)}</span>
          </div>
          <button
            onClick={() => handleProcessCashPayment()}
            className="w-full bg-green-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-600"
          >
            Confirmar Pago en Efectivo
          </button>
          <button
            onClick={() => { setShowCashInput(false); setSelectedPaymentMethod(null); setAmountReceived(''); setChange(0); }}
            className="w-full bg-gray-300 text-gray-800 py-3 rounded-lg text-lg font-semibold hover:bg-gray-400 mt-2"
          >
            Volver a Métodos de Pago
          </button>
        </div>
      )}



      {!showCashInput && selectedPaymentMethod !== 'Efectivo' && (
        <button
          onClick={() => handleCheckout(selectedPaymentMethod)}
          className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 mt-4"
          disabled={!selectedPaymentMethod}
        >
          Finalizar Compra
        </button>
      )}


      {!showCashInput && (
        <button
          onClick={onBackToCart}
          className="w-full bg-gray-300 text-gray-800 py-3 rounded-lg text-lg font-semibold hover:bg-gray-400 mt-2"
        >
          Volver al Carrito
        </button>
      )}
        </>
      )}
    </div>
  );
};
export default PaymentOptions;