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

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaActual, setCategoriaActual] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay sesión activa. Por favor, inicie sesión.');
      return;
    }
  }, []);

  // Función para cargar categorías
  const cargarCategorias = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/categorias', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCategorias(response.data);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar las categorías');
      console.error('Error al cargar categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de campos
    const newFormErrors = {
      nombre: '',
      descripcion: ''
    };

    if (!formData.nombre.trim()) {
      newFormErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      newFormErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newFormErrors.descripcion = 'La descripción es requerida';
    }

    setFormErrors(newFormErrors);

    if (newFormErrors.nombre || newFormErrors.descripcion) {
      return;
    }

    try {
      const url = `http://localhost:8080/api/categorias${categoriaActual ? `/${categoriaActual.id}` : ''}`;
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      };

      if (categoriaActual) {
        await axios.put(url, formData, config);
      } else {
        await axios.post(url, formData, config);
      }

      setModalAbierto(false);
      setCategoriaActual(null);
      setFormData({ nombre: '', descripcion: '' });
      setError('');
      cargarCategorias();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al guardar la categoría';
      setError(errorMessage);
      console.error('Error al guardar categoría:', error);
    }
  };

  const handleEditar = (categoria: Categoria) => {
    setCategoriaActual(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion
    });
    setModalAbierto(true);
  };

  const handleEliminar = async (id: string) => {
    if (confirm('¿Está seguro de eliminar esta categoría?')) {
      try {
        await axios.delete(`http://localhost:8080/api/categorias/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setError('');
        cargarCategorias();
      } catch (error) {
        setError('Error al eliminar la categoría');
        console.error('Error al eliminar categoría:', error);
      }
    }
  };

  return (
    <div className="p-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
        <Button
          onClick={() => {
            setCategoriaActual(null);
            setFormData({ nombre: '', descripcion: '' });
            setModalAbierto(true);
          }}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Categoría
        </Button>
      </div>

      {/* Tabla de categorías */}
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td className="px-6 py-4 whitespace-nowrap">{categoria.nombre}</td>
                <td className="px-6 py-4">{categoria.descripcion}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleEditar(categoria)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={() => handleEliminar(categoria.id)}
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

      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Modal de formulario */}
      {modalAbierto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalAbierto(false);
            }
          }}
        >
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {categoriaActual ? 'Editar' : 'Nueva'} Categoría
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <Input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
                {formErrors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.nombre}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <Input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  required
                />
                {formErrors.descripcion && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.descripcion}</p>
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
                  {categoriaActual ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}