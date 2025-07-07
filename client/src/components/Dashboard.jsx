import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Registrar los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('semana'); // 'dia', 'semana', 'mes'

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('/api/estadisticas/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar los datos del dashboard');
        }

        const data = await response.json();
        setDashboardData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filtro]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  // Preparar datos para gráficos
  const { resumenVentas, productosMasVendidos, categoriasMasVendidas, productosStockCritico, ventasPorDia, ultimasVentas } = dashboardData;

  // Asegurar valores por defecto para resumenVentas
  const ventasTotales = resumenVentas?.ventasTotales || 0;
  const numeroVentas = resumenVentas?.numeroVentas || 0;
  const promedioVenta = resumenVentas?.promedioVenta || 0;

  // Datos para gráfico de productos más vendidos
  const productosData = {
    labels: productosMasVendidos.map(p => p.key),
    datasets: [
      {
        label: 'Unidades vendidas',
        data: productosMasVendidos.map(p => p.value),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Datos para gráfico de ventas por día
  const ventasPorDiaLabels = Object.keys(ventasPorDia);
  const ventasPorDiaValues = Object.values(ventasPorDia);

  const ventasPorDiaData = {
    labels: ventasPorDiaLabels,
    datasets: [
      {
        label: 'Ventas por día (S/)',
        data: ventasPorDiaValues,
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  // Datos para gráfico de categorías más vendidas
  const categoriaLabels = Object.keys(categoriasMasVendidas);
  const categoriaValues = Object.values(categoriasMasVendidas);
  const totalCategorias = categoriaValues.reduce((acc, curr) => acc + curr, 0);
  const categoriaPorcentajes = categoriaValues.map(value => ((value / totalCategorias) * 100).toFixed(1));

  const categoriasData = {
    labels: categoriaLabels,
    datasets: [
      {
        label: 'Categorías más vendidas',
        data: categoriaValues,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Opciones para gráficos
  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Productos más vendidos',
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ventas por día',
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Categorías más vendidas',
      },
    },
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded ${filtro === 'dia' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFiltro('dia')}
          >
            Hoy
          </button>
          <button 
            className={`px-4 py-2 rounded ${filtro === 'semana' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFiltro('semana')}
          >
            Última semana
          </button>
          <button 
            className={`px-4 py-2 rounded ${filtro === 'mes' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFiltro('mes')}
          >
            Último mes
          </button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Ventas Totales</h2>
          <div className="text-3xl font-bold text-green-600">S/. {ventasTotales.toFixed(2)}</div>
          <p className="text-gray-600 mt-2">{numeroVentas} transacciones</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Promedio por Venta</h2>
          <div className="text-3xl font-bold text-blue-600">S/. {promedioVenta.toFixed(2)}</div>
          <p className="text-gray-600 mt-2">Por transacción</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Alertas de Stock</h2>
          <div className="text-3xl font-bold text-red-600">{productosStockCritico.length}</div>
          <p className="text-gray-600 mt-2">Productos con stock bajo</p>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Productos más vendidos</h2>
          <div className="h-80">
            <Bar data={productosData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Ventas por día</h2>
          <div className="h-80">
            <Line data={ventasPorDiaData} options={lineOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Categorías más vendidas</h2>
          <div className="h-80">
            <Pie data={categoriasData} options={pieOptions} />
          </div>
          <div className="mt-4 space-y-2">
            {categoriaLabels.map((categoria, index) => (
              <div key={categoria} className="flex justify-between">
                <span>{categoria}</span>
                <span className="font-semibold">{categoriaPorcentajes[index]}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Productos con Stock Crítico</h2>
          <div className="overflow-auto max-h-80">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productosStockCritico.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{producto.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {producto.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{producto.categoria?.nombre || 'Sin categoría'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Últimas ventas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Últimas Ventas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ultimasVentas.map((venta) => (
                <tr key={venta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{venta.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(venta.fecha)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{venta.clienteNombre || 'Cliente General'}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">S/. {venta.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{venta.metodoPago}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{venta.tipoComprobante}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;