import { useState, useEffect } from 'react';
import Toast from './Toast';
import CashRegisterHistory from './CashRegisterHistory';

const Reports = () => {
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    monthlySales: [],
    topProducts: [],
    lowStockProducts: []
  });
  const [toast, setToast] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // Aquí se implementará la llamada a la API de reportes
      // Por ahora usaremos datos de ejemplo
      const mockData = {
        totalSales: 15000,
        monthlySales: [
          { month: 'Enero', amount: 2500 },
          { month: 'Febrero', amount: 3000 },
          { month: 'Marzo', amount: 4500 },
          { month: 'Abril', amount: 5000 }
        ],
        topProducts: [
          { name: 'Laptop HP', sales: 25 },
          { name: 'Mouse Gamer', sales: 40 },
          { name: 'Teclado Mecánico', sales: 30 }
        ],
        lowStockProducts: [
          { name: 'Laptop HP', stock: 2, minStock: 5 },
          { name: 'Teclado Mecánico', stock: 3, minStock: 10 }
        ]
      };

      setSalesData(mockData);
    } catch (error) {
      setToast({
        message: 'Error al cargar los datos del reporte',
        type: 'error'
      });
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateReport = () => {
    // Aquí se implementará la generación de reportes personalizados
    setToast({
      message: 'Reporte generado exitosamente',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reportes y Estadísticas</h1>

      {/* Filtros de fecha */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Filtrar por Fecha</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleGenerateReport}
          className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Generar Reporte
        </button>
      </div>

      {/* Resumen de Ventas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Resumen de Ventas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">Ventas Totales</h3>
            <p className="text-2xl font-bold text-blue-600">S/. {salesData.totalSales}</p>
          </div>
          {/* Aquí se pueden agregar más métricas */}
        </div>
      </div>

      {/* Ventas Mensuales */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Ventas Mensuales</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.monthlySales.map((sale, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{sale.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap">S/. {sale.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Productos Más Vendidos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Productos Más Vendidos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.topProducts.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.sales} unidades</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Productos con Stock Bajo */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Alertas de Stock Bajo</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Mínimo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.lowStockProducts.map((product, index) => (
                <tr key={index} className="bg-red-50">
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.minStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <CashRegisterHistory />
    </div>
  );
};

export default Reports;