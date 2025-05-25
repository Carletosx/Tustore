'use client';

import { useState, useEffect } from 'react';

interface DatosVentas {
  mes: string;
  ventas: number;
}

interface ProductoPopular {
  nombre: string;
  cantidad: number;
  ingresos: number;
}

export default function EstadisticasPage() {
  const [datosVentas, setDatosVentas] = useState<DatosVentas[]>([]);
  const [productosPopulares, setProductosPopulares] = useState<ProductoPopular[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('anual');

  // Datos de ejemplo para la demostración
  useEffect(() => {
    // Simulación de carga de datos desde el backend
    setLoading(true);
    setTimeout(() => {
      // Datos de ventas mensuales
      const datosVentasEjemplo: DatosVentas[] = [
        { mes: 'Enero', ventas: 12500 },
        { mes: 'Febrero', ventas: 15000 },
        { mes: 'Marzo', ventas: 18000 },
        { mes: 'Abril', ventas: 16500 },
        { mes: 'Mayo', ventas: 19000 },
        { mes: 'Junio', ventas: 22000 },
        { mes: 'Julio', ventas: 20500 },
        { mes: 'Agosto', ventas: 23000 },
        { mes: 'Septiembre', ventas: 25000 },
        { mes: 'Octubre', ventas: 27500 },
        { mes: 'Noviembre', ventas: 30000 },
        { mes: 'Diciembre', ventas: 35000 },
      ];
      
      // Productos más vendidos
      const productosPopularesEjemplo: ProductoPopular[] = [
        { nombre: 'Laptop HP', cantidad: 25, ingresos: 62500 },
        { nombre: 'Monitor LG', cantidad: 18, ingresos: 12600 },
        { nombre: 'Teclado Mecánico', cantidad: 30, ingresos: 5997 },
        { nombre: 'Mouse Logitech', cantidad: 45, ingresos: 4045.5 },
        { nombre: 'Audífonos Sony', cantidad: 22, ingresos: 7697.8 },
      ];
      
      setDatosVentas(datosVentasEjemplo);
      setProductosPopulares(productosPopularesEjemplo);
      setLoading(false);
    }, 800);
  }, []);

  // Calcular totales
  const totalVentas = datosVentas.reduce((sum, item) => sum + item.ventas, 0);
  const totalProductosVendidos = productosPopulares.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Estadísticas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Ventas Totales</h2>
          <p className="text-2xl font-bold text-green-600">S/ {totalVentas.toLocaleString('es-PE')}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Productos Vendidos</h2>
          <p className="text-2xl font-bold text-blue-600">{totalProductosVendidos}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Ticket Promedio</h2>
          <p className="text-2xl font-bold text-purple-600">
            S/ {(totalVentas / totalProductosVendidos).toFixed(2)}
          </p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Cargando estadísticas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de ventas (simulado con barras) */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ventas por Mes</h2>
              <select
                className="px-3 py-1 border border-gray-300 rounded-md"
                value={periodoSeleccionado}
                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              >
                <option value="anual">Anual</option>
                <option value="semestral">Último Semestre</option>
                <option value="trimestral">Último Trimestre</option>
              </select>
            </div>
            
            <div className="h-64 flex items-end space-x-2">
              {datosVentas.map((dato, index) => {
                // Filtrar según el período seleccionado
                if (
                  (periodoSeleccionado === 'trimestral' && index < 3) ||
                  (periodoSeleccionado === 'semestral' && index < 6) ||
                  periodoSeleccionado === 'anual'
                ) {
                  // Calcular altura relativa para la barra
                  const maxVenta = Math.max(...datosVentas.map(d => d.ventas));
                  const altura = (dato.ventas / maxVenta) * 100;
                  
                  return (
                    <div key={dato.mes} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-blue-500 rounded-t-md" 
                        style={{ height: `${altura}%` }}
                      ></div>
                      <div className="text-xs mt-1 text-gray-600">{dato.mes.substring(0, 3)}</div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
          
          {/* Productos más vendidos */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Productos Más Vendidos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productosPopulares.map((producto) => (
                    <tr key={producto.nombre}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {producto.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.cantidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        S/ {producto.ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}