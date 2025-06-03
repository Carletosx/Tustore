import React, { useState, useEffect } from 'react';

const OpenCashRegisterForm = ({ onOpen, onClose, currentUser }) => {
  const [denominations, setDenominations] = useState({
    '200': 0,
    '100': 0,
    '50': 0,
    '20': 0,
    '10': 0,
    '5': 0,
    '2': 0,
    '1': 0,
    '0.50': 0,
    '0.20': 0,
    '0.10': 0,
  });
  const [openingManager, setOpeningManager] = useState(currentUser || '');
  const [openingDateTime, setOpeningDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      setOpeningDateTime(new Date().toISOString());
    };
    updateDateTime(); // Set initial time
    const intervalId = setInterval(updateDateTime, 1000); // Update every second
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handleDenominationChange = (value, count) => {
    setDenominations({ ...denominations, [value]: parseInt(count, 10) || 0 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const initialAmount = Object.keys(denominations).reduce((total, value) => {
      return total + parseFloat(value) * denominations[value];
    }, 0);

    if (openingManager) {
      onOpen({ initialAmount, openingManager, denominations, openingDateTime });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-auto max-w-3xl">
        <h2 className="text-xl font-bold mb-4">Abrir Caja</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="openingManager" className="block text-gray-700 text-sm font-bold mb-2">
              Encargado de Apertura:
            </label>
            <input
              type="text"
              id="openingManager"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={openingManager}
              onChange={(e) => setOpeningManager(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            
            <p className="mb-4"><strong>Fecha y Hora de Cierre:</strong> {new Date().toLocaleString()}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Detalle del Monto Inicial (Soles):
            </label>
            <div className="text-lg font-semibold mb-2">
              Total Acumulado: S/ {Object.keys(denominations).reduce((total, value) => total + parseFloat(value) * denominations[value], 0).toFixed(2)}
            </div>
            <div className="grid grid-cols-3 gap-x-8 gap-y-4">
              <div>
                <h4 className="font-bold mb-2">Billetes</h4>
                {['200', '100', '50', '20', '10'].map((value) => (
                  <div key={value} className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded-lg shadow-sm">
                    <label htmlFor={`denom-${value}`} className="text-gray-800 font-medium w-24">
                      S/ {value}:
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleDenominationChange(value, denominations[value] - 1)}
                        className="bg-red-400 hover:bg-red-500 text-white font-bold py-1 px-2 rounded-full focus:outline-none focus:shadow-outline"
                        disabled={denominations[value] <= 0}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id={`denom-${value}`}
                        className="shadow appearance-none border rounded w-16 text-center py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={denominations[value]}
                        onChange={(e) => handleDenominationChange(value, e.target.value)}
                        min="0"
                        step="1"
                      />
                      <button
                        type="button"
                        onClick={() => handleDenominationChange(value, denominations[value] + 1)}
                        className="bg-green-400 hover:bg-green-500 text-white font-bold py-1 px-2 rounded-full focus:outline-none focus:shadow-outline"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-bold mb-2">Monedas</h4>
                {['5', '2', '1'].map((value) => (
                  <div key={value} className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded-lg shadow-sm">
                    <label htmlFor={`denom-${value}`} className="text-gray-800 font-medium w-24">
                      S/ {value}:
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleDenominationChange(value, denominations[value] - 1)}
                        className="bg-red-400 hover:bg-red-500 text-white font-bold py-1 px-2 rounded-full focus:outline-none focus:shadow-outline"
                        disabled={denominations[value] <= 0}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id={`denom-${value}`}
                        className="shadow appearance-none border rounded w-16 text-center py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={denominations[value]}
                        onChange={(e) => handleDenominationChange(value, e.target.value)}
                        min="0" 
                        step="1"
                      />
                      <button
                        type="button"
                        onClick={() => handleDenominationChange(value, denominations[value] + 1)}
                        className="bg-green-400 hover:bg-green-500 text-white font-bold py-1 px-2 rounded-full focus:outline-none focus:shadow-outline"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-bold mb-2">Céntimos</h4>
                {['0.50', '0.20', '0.10'].map((value) => (
                  <div key={value} className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded-lg shadow-sm">
                    <label htmlFor={`denom-${value}`} className="text-gray-800 font-medium w-24">
                      S/ {value}:
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleDenominationChange(value, denominations[value] - 1)}
                        className="bg-red-400 hover:bg-red-500 text-white font-bold py-1 px-2 rounded-full focus:outline-none focus:shadow-outline"
                        disabled={denominations[value] <= 0}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        id={`denom-${value}`}
                        className="shadow appearance-none border rounded w-16 text-center py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={denominations[value]}
                        onChange={(e) => handleDenominationChange(value, e.target.value)}
                        min="0"
                        step="1"
                      />
                      <button
                        type="button"
                        onClick={() => handleDenominationChange(value, denominations[value] + 1)}
                        className="bg-green-400 hover:bg-green-500 text-white font-bold py-1 px-2 rounded-full focus:outline-none focus:shadow-outline"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Aperturar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpenCashRegisterForm;