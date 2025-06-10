import { useState, useEffect } from 'react';
import Toast from './Toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ nombre: '', descripcion: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/categorias', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        throw new Error('Error al cargar categorías');
      }
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        setToast({
          message: 'Categoría creada exitosamente',
          type: 'success'
        });
        setNewCategory({ nombre: '', descripcion: '' });
        fetchCategories();
      } else {
        throw new Error('Error al crear la categoría');
      }
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
    }
  };

  const handleUpdate = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/categorias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editingCategory)
      });

      if (response.ok) {
        setToast({
          message: 'Categoría actualizada exitosamente',
          type: 'success'
        });
        setEditingCategory(null);
        fetchCategories();
      } else {
        throw new Error('Error al actualizar la categoría');
      }
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/categorias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setToast({
          message: 'Categoría eliminada exitosamente',
          type: 'success'
        });
        fetchCategories();
      } else {
        throw new Error('Error al eliminar la categoría');
      }
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Categorías</h1>

      {/* Formulario para nueva categoría */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            value={newCategory.nombre}
            onChange={(e) => setNewCategory({ ...newCategory, nombre: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descripcion">
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={newCategory.descripcion}
            onChange={(e) => setNewCategory({ ...newCategory, descripcion: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Crear Categoría
        </button>
      </form>

      {/* Lista de categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-6 rounded-lg shadow">
            {editingCategory?.id === category.id ? (
              <div>
                <input
                  type="text"
                  value={editingCategory.nombre}
                  onChange={(e) => setEditingCategory({ ...editingCategory, nombre: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                />
                <textarea
                  value={editingCategory.descripcion}
                  onChange={(e) => setEditingCategory({ ...editingCategory, descripcion: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                  rows="3"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleUpdate(category.id)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-2">{category.nombre}</h3>
                <p className="text-gray-600 mb-4">{category.descripcion}</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Categories;