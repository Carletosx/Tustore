'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
}

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');

  // Datos de ejemplo para la demostración
  useEffect(() => {
    // Simulación de carga de datos desde el backend
    setLoading(true);
    setTimeout(() => {
      const productosEjemplo: Producto[] = [
        { id: '1', nombre: 'Laptop HP', descripcion: 'Laptop HP 15.6" Core i5', precio: 2500, stock: 10, categoria: 'Electrónicos' },
        { id: '2', nombre: 'Mouse Logitech', descripcion: 'Mouse inalámbrico', precio: 89.90, stock: 25, categoria: 'Accesorios' },
        { id: '3', nombre: 'Teclado Mecánico', descripcion: 'Teclado gaming RGB', precio: 199.90, stock: 15, categoria: 'Accesorios' },
        { id: '4', nombre: 'Monitor LG', descripcion: 'Monitor 24" Full HD', precio: 699.90, stock: 8, categoria: 'Electrónicos' },
        { id: '5', nombre: 'Audífonos Sony', descripcion: 'Audífonos inalámbricos con cancelación de ruido', precio: 349.90, stock: 12, categoria: 'Audio' },
      ];
      setProductos(productosEjemplo);
      setLoading(false);
    }, 800);
  }, []);

  // Filtrar productos según búsqueda y categoría
  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                            producto.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === 'todas' || producto.categoria === categoriaFiltro;
    return coincideBusqueda && coincideCategoria;
  });

  // Obtener categorías únicas para el filtro
  const categorias = ['todas', ...new Set(productos.map(p => p.categoria))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventario</h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          + Nuevo Producto
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'todas' ? 'Todas las categorías' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Cargando inventario...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron productos que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productosFiltrados.map((producto) => (
                  <tr key={producto.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                          <div className="text-sm text-gray-500">{producto.descripcion}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {producto.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      S/ {producto.precio.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${producto.stock > 10 ? 'bg-green-100 text-green-800' : producto.stock > 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {producto.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                      <button className="text-red-600 hover:text-red-900">Eliminar</button>
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