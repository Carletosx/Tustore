'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Movimiento {
  id: string;
  fecha: string;
  tipo: 'VENTA' | 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  descripcion: string;
  cantidad: number;
  productoId: string;
  producto: {
    id: string;
    nombre: string;
    categoriaId: string;
    categoria: {
      id: string;
      nombre: string;
    };
  };
  usuarioId: string;
  usuario: {
    id: string;
    nombre: string;
    rol: string;
  };
}

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [movimientosFiltrados, setMovimientosFiltrados] = useState<Movimiento[]>([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState('');
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay sesión activa. Por favor, inicie sesión.');
      return;
    }
    cargarMovimientos();
    cargarCategorias();
  }, []);

  useEffect(() => {
    filtrarMovimientos();
  }, [fechaInicio, fechaFin, tipoMovimiento, categoriaSeleccionada, busqueda, movimientos]);

  const cargarMovimientos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/movimientos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMovimientos(response.data);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar los movimientos');
      console.error('Error al cargar movimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/categorias', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCategorias(response.data);
    } catch (error: any) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const filtrarMovimientos = () => {
    let movimientosFiltrados = movimientos;

    if (fechaInicio && fechaFin) {
      movimientosFiltrados = movimientosFiltrados.filter(movimiento => {
        const fechaMovimiento = new Date(movimiento.fecha);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return fechaMovimiento >= inicio && fechaMovimiento <= fin;
      });
    }

    if (tipoMovimiento) {
      movimientosFiltrados = movimientosFiltrados.filter(
        movimiento => movimiento.tipo === tipoMovimiento
      );
    }

    if (categoriaSeleccionada) {
      movimientosFiltrados = movimientosFiltrados.filter(
        movimiento => movimiento.producto.categoriaId === categoriaSeleccionada
      );
    }

    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      movimientosFiltrados = movimientosFiltrados.filter(
        movimiento =>
          movimiento.producto.nombre.toLowerCase().includes(busquedaLower) ||
          movimiento.descripcion.toLowerCase().includes(busquedaLower)
      );
    }

    setMovimientosFiltrados(movimientosFiltrados);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }

  return (
    <div className="p-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Movimientos de Inventario</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Fin</label>
            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Movimiento</label>
            <Select
              value={tipoMovimiento}
              onValueChange={setTipoMovimiento}
            >
              <option value="">Todos los tipos</option>
              <option value="VENTA">Venta</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
              <option value="AJUSTE">Ajuste</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Categoría</label>
            <Select
              value={categoriaSeleccionada}
              onValueChange={setCategoriaSeleccionada}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Buscar</label>
            <Input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por producto o descripción"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimientosFiltrados.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(movimiento.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        movimiento.tipo === 'VENTA' ? 'bg-red-100 text-red-800' :
                        movimiento.tipo === 'ENTRADA' ? 'bg-green-100 text-green-800' :
                        movimiento.tipo === 'SALIDA' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {movimiento.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movimiento.producto.nombre}
                      <span className="text-gray-500 text-sm ml-2">
                        ({movimiento.producto.categoria.nombre})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movimiento.cantidad > 0 ? '+' : ''}{movimiento.cantidad}
                    </td>
                    <td className="px-6 py-4">
                      {movimiento.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movimiento.usuario.nombre}
                      <span className="text-gray-500 text-sm ml-2">
                        ({movimiento.usuario.rol})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}