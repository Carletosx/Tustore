'use client';

import { useState, useEffect } from 'react';

interface Movimiento {
  id: string;
  tipo: 'venta' | 'compra' | 'ajuste';
  fecha: string;
  monto: number;
  descripcion: string;
  usuario: string;
  estado: 'completado' | 'pendiente' | 'cancelado';
  comprobante: string;
}

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroFecha, setFiltroFecha] = useState<string>('');

  // Datos de ejemplo para la demostración
  useEffect(() => {
    // Simulación de carga de datos desde el backend
    setLoading(true);
    setTimeout(() => {
      const movimientosEjemplo: Movimiento[] = [
        { id: '1', tipo: 'venta', fecha: '2023-10-15', monto: 250.50, descripcion: 'Venta de productos electrónicos', usuario: 'Juan Pérez', estado: 'completado', comprobante: 'F001-00001' },
        { id: '2', tipo: 'compra', fecha: '2023-10-14', monto: 1500.00, descripcion: 'Compra de inventario', usuario: 'María González', estado: 'completado', comprobante: 'F002-00123' },
        { id: '3', tipo: 'venta', fecha: '2023-10-13', monto: 89.90, descripcion: 'Venta de accesorios', usuario: 'Juan Pérez', estado: 'completado', comprobante: 'B001-00002' },
        { id: '4', tipo: 'ajuste', fecha: '2023-10-12', monto: -50.00, descripcion: 'Ajuste de inventario por productos dañados', usuario: 'Carlos Rodríguez', estado: 'completado', comprobante: 'AJ001-00001' },
        { id: '5', tipo: 'venta', fecha: '2023-10-11', monto: 199.90, descripcion: 'Venta de periféricos', usuario: 'Juan Pérez', estado: 'cancelado', comprobante: 'B001-00003' },
      ];
      setMovimientos(movimientosEjemplo);
      setLoading(false);
    }, 800);
  }, []);

  // Filtrar movimientos según tipo y fecha
  const movimientosFiltrados = movimientos.filter(movimiento => {
    const coincideTipo = filtroTipo === 'todos' || movimiento.tipo === filtroTipo;
    const coincideFecha = !filtroFecha || movimiento.fecha === filtroFecha;
    return coincideTipo && coincideFecha;
  });

  // Calcular totales
  const totalVentas = movimientosFiltrados
    .filter(m => m.tipo === 'venta' && m.estado === 'completado')
    .reduce((sum, m) => sum + m.monto, 0);
  
  const totalCompras = movimientosFiltrados
    .filter(m => m.tipo === 'compra' && m.estado === 'completado')
    .reduce((sum, m) => sum + m.monto, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Movimientos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Ventas</h2>
          <p className="text-2xl font-bold text-green-600">S/ {totalVentas.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Compras</h2>
          <p className="text-2xl font-bold text-red-600">S/ {totalCompras.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Balance</h2>
          <p className={`text-2xl font-bold ${totalVentas - totalCompras >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            S/ {(totalVentas - totalCompras).toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-64">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="todos">Todos los tipos</option>
              <option value="venta">Ventas</option>
              <option value="compra">Compras</option>
              <option value="ajuste">Ajustes</option>
            </select>
          </div>
          <div className="w-full md:w-64">
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
          </div>
          <div className="flex-1 md:text-right">
            <button 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              onClick={() => {
                setFiltroTipo('todos');
                setFiltroFecha('');
              }}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Cargando movimientos...</p>
          </div>
        ) : movimientosFiltrados.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron movimientos que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprobante</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimientosFiltrados.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movimiento.fecha}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${movimiento.tipo === 'venta' ? 'bg-green-100 text-green-800' : movimiento.tipo === 'compra' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {movimiento.tipo === 'venta' ? 'Venta' : movimiento.tipo === 'compra' ? 'Compra' : 'Ajuste'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movimiento.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={movimiento.monto >= 0 ? 'text-green-600' : 'text-red-600'}>
                        S/ {Math.abs(movimiento.monto).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${movimiento.estado === 'completado' ? 'bg-green-100 text-green-800' : movimiento.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {movimiento.estado === 'completado' ? 'Completado' : movimiento.estado === 'pendiente' ? 'Pendiente' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movimiento.comprobante}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Ver</button>
                      <button className="text-gray-600 hover:text-gray-900">Imprimir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}