import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CloseCashRegisterForm = ({ onClose, onCloseCashRegister }) => {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [observations, setObservations] = useState('');
  const [efectivoFinal, setEfectivoFinal] = useState('');
  const [closingManager, setClosingManager] = useState('');
  const [closingDateTime, setClosingDateTime] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      setClosingDateTime(new Date().toLocaleString());
    };
    updateDateTime(); // Set initial time
    const intervalId = setInterval(updateDateTime, 1000); // Update every second
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/caja/resumen', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching cash register summary:', error);
      // Handle error, maybe show a toast
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAmount = parseFloat(efectivoFinal);
    if (isNaN(finalAmount)) {
      alert('Por favor, ingrese un monto final válido.');
      return;
    }
    console.log('Attempting to close cash register with:', { efectivoFinal: finalAmount, observations, closingManager });
    onCloseCashRegister(finalAmount, observations, closingManager);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Cerrar Caja</h2>
        {loadingSummary ? (
          <p>Cargando resumen de caja...</p>
        ) : summary ? (
          <div>
            <p className="mb-2"><strong>Fecha y Hora de Cierre:</strong> {closingDateTime}</p>
            <p className="mb-2"><strong>Monto Inicial:</strong> S/ {summary.efectivoInicial.toFixed(2)}</p>
            <p className="mb-2"><strong>Total Recaudado del Día:</strong> S/ {summary.totalVentas.toFixed(2)}</p>
            <h3 className="text-lg font-semibold mt-4 mb-2">Desglose por Métodos de Pago:</h3>
            <ul>
              {Object.entries(summary.desgloseMetodoPago).map(([method, amount]) => (
                <li key={method} className="mb-1"><strong>{method}:</strong> S/ {amount.toFixed(2)}</li>
              ))}
            </ul>
            <div className="mb-4 mt-4">
              <label htmlFor="efectivoFinal" className="block text-gray-700 text-sm font-bold mb-2">
                Monto Final Contado:
              </label>
              <input
                type="number"
                id="efectivoFinal"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={efectivoFinal}
                onChange={(e) => setEfectivoFinal(e.target.value)}
                required
                step="0.01"
              />
            </div>
            <div className="mb-4 mt-4">
              <label htmlFor="closingManager" className="block text-gray-700 text-sm font-bold mb-2">
                Encargado del Cierre:
              </label>
              <input
                type="text"
                id="closingManager"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={closingManager}
                onChange={(e) => setClosingManager(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 mt-4">
              <label htmlFor="observations" className="block text-gray-700 text-sm font-bold mb-2">
                Observaciones (Opcional):
              </label>
              <textarea
                id="observations"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              ></textarea>
            </div>
          </div>
        ) : (
          <p>No se pudo cargar el resumen de caja.</p>
        )}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            disabled={loadingSummary}
          >
            Finalizar cierre 
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloseCashRegisterForm;