import { useState, useEffect } from 'react';
import Toast from './Toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoria: ''
  });
  const [categoryFormData, setCategoryFormData] = useState({
    nombre: '',
    description: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchProducts();
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
        setCategories(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Error al cargar categorías');
      }
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
      setCategories([]);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCategory
        ? `http://localhost:8080/api/categorias/${editingCategory.id}`
        : 'http://localhost:8080/api/categorias';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(categoryFormData)
      });

      if (response.ok) {
        setToast({
          message: `Categoría ${editingCategory ? 'actualizada' : 'creada'} exitosamente`,
          type: 'success'
        });
        fetchCategories();
        resetCategoryForm();
      } else {
        throw new Error(`Error al ${editingCategory ? 'actualizar' : 'crear'} la categoría`);
      }
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
    }
  };

  const handleDeleteCategory = async (id) => {
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

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      nombre: category.nombre,
      description: category.description
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      nombre: '',
      description: ''
    });
    setEditingCategory(null);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/productos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Error al cargar productos');
      }
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
      setProducts([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `http://localhost:8080/api/productos/${editingProduct.id}`
        : 'http://localhost:8080/api/productos';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setToast({
          message: `Producto ${editingProduct ? 'actualizado' : 'creado'} exitosamente`,
          type: 'success'
        });
        fetchProducts();
        resetForm();
      } else {
        throw new Error(`Error al ${editingProduct ? 'actualizar' : 'crear'} el producto`);
      }
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/productos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setToast({
          message: 'Producto eliminado exitosamente',
          type: 'success'
        });
        fetchProducts();
      } else {
        throw new Error('Error al eliminar el producto');
      }
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoria: product.categoria
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoria: ''
    });
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product && product.name ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : false
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Productos y Categorías</h1>

      {/* Formulario de Categorías */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        </h2>
        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={categoryFormData.nombre}
                onChange={(e) => setCategoryFormData({...categoryFormData, nombre: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <input
                type="text"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            {editingCategory && (
              <button
                type="button"
                onClick={resetCategoryForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editingCategory ? 'Actualizar' : 'Crear'} Categoría
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Categorías */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Categorías</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{category.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{category.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulario de Productos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Seleccione una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editingProduct ? 'Actualizar' : 'Crear'} Producto
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Productos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Productos</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {categories.find(cat => cat.id === product.categoria)?.name || product.categoria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Products;