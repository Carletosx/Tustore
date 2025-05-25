'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaId: string;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoActual, setProductoActual] = useState<Producto | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoriaId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoriaId: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay sesión activa. Por favor, inicie sesión.');
      return;
    }
    cargarCategorias();
    cargarProductos();
  }, []);

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
      setError('Error al cargar las categorías');
    }
  };

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/productos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProductos(response.data);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar los productos');
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFormErrors = {
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoriaId: ''
    };

    if (!formData.nombre.trim()) {
      newFormErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.descripcion.trim()) {
      newFormErrors.descripcion = 'La descripción es requerida';
    }
    if (!formData.precio || isNaN(Number(formData.precio))) {
      newFormErrors.precio = 'El precio debe ser un número válido';
    }
    if (!formData.stock || isNaN(Number(formData.stock))) {
      newFormErrors.stock = 'El stock debe ser un número válido';
    }
    if (!formData.categoriaId) {
      newFormErrors.categoriaId = 'Debe seleccionar una categoría';
    }

    setFormErrors(newFormErrors);

    if (Object.values(newFormErrors).some(error => error)) {
      return;
    }

    try {
      const url = `http://localhost:8080/api/productos${productoActual ? `/${productoActual.id}` : ''}`;
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      };

      const productoData = {
        ...formData,
        precio: Number(formData.precio),
        stock: Number(formData.stock)
      };

      if (productoActual) {
        await axios.put(url, productoData, config);
      } else {
        await axios.post(url, productoData, config);
      }

      setModalAbierto(false);
      setProductoActual(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoriaId: ''
      });
      setError('');
      cargarProductos();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al guardar el producto';
      setError(errorMessage);
      console.error('Error al guardar producto:', error);
    }
  };

  const handleEditar = (producto: Producto) => {
    setProductoActual(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio.toString(),
      stock: producto.stock.toString(),
      categoriaId: producto.categoriaId
    });
    setModalAbierto(true);
  };

  const handleEliminar = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await axios.delete(`http://localhost:8080/api/productos/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setError('');
        cargarProductos();
      } catch (error) {
        setError('Error al eliminar el producto');
        console.error('Error al eliminar producto:', error);
      }
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
        <Button
          onClick={() => {
            setProductoActual(null);
            setFormData({
              nombre: '',
              descripcion: '',
              precio: '',
              stock: '',
              categoriaId: ''
            });
            setModalAbierto(true);
          }}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Producto
        </Button>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td className="px-6 py-4 whitespace-nowrap">{producto.nombre}</td>
                <td className="px-6 py-4">{producto.descripcion}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  S/ {producto.precio.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{producto.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {categorias.find(cat => cat.id === producto.categoriaId)?.nombre}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleEditar(producto)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={() => handleEliminar(producto.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de producto */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {productoActual ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <Input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className={formErrors.nombre ? 'border-red-500' : ''}
                />
                {formErrors.nombre && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <Input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className={formErrors.descripcion ? 'border-red-500' : ''}
                />
                {formErrors.descripcion && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.descripcion}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className={formErrors.precio ? 'border-red-500' : ''}
                />
                {formErrors.precio && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.precio}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className={formErrors.stock ? 'border-red-500' : ''}
                />
                {formErrors.stock && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.stock}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  value={formData.categoriaId}
                  onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${formErrors.categoriaId ? 'border-red-500' : ''}`}
                >
                  <option value="">Seleccione una categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
                {formErrors.categoriaId && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.categoriaId}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {productoActual ? 'Guardar cambios' : 'Crear producto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}