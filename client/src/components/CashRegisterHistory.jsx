import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from './Toast';

const CashRegisterHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/caja/historial', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching cash register history:', error);
      setToast({
        message: error.response?.data?.message || 'Error al obtener el historial de cajas.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Historial de Cajas</h2>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {loading ? (
        <p>Cargando historial...</p>
      ) : history.length === 0 ? (
        <p>No hay historial de cajas disponible.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Fecha Apertura</th>
                <th className="py-2 px-4 border-b">Fecha Cierre</th>
                <th className="py-2 px-4 border-b">Efectivo Inicial</th>
                <th className="py-2 px-4 border-b">Efectivo Final</th>
                <th className="py-2 px-4 border-b">Total Ventas</th>
                <th className="py-2 px-4 border-b">Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.map((caja) => (
                <tr key={caja.id}>
                  <td className="py-2 px-4 border-b">{caja.id}</td>
                  <td className="py-2 px-4 border-b">{new Date(caja.fechaApertura).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{caja.fechaCierre ? new Date(caja.fechaCierre).toLocaleString() : 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{caja.efectivoInicial.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b">{caja.efectivoFinal ? caja.efectivoFinal.toFixed(2) : 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{caja.totalVentas ? caja.totalVentas.toFixed(2) : 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{caja.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CashRegisterHistory;