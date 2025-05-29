import { useState, useEffect } from 'react';
import Toast from './Toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    imagen: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({
        message: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
        type: 'error'
      });
      return;
    }
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({
          message: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
          type: 'error'
        });
        return;
      }

      const url = editingProduct
        ? `http://localhost:8080/api/productos/${editingProduct.id}`
        : 'http://localhost:8080/api/productos';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const productoData = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        categoria: { id: parseInt(formData.categoria) }
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productoData)
      });

      if (response.status === 401) {
        setToast({
          message: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
          type: 'error'
        });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${editingProduct ? 'actualizar' : 'crear'} el producto`);
      }

      setToast({
        message: `Producto ${editingProduct ? 'actualizado' : 'creado'} exitosamente`,
        type: 'success'
      });
      fetchProducts();
      resetForm();
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (e.g., 5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5 MB in bytes
      if (file.size > maxSize) {
        setToast({
          message: 'La imagen es demasiado grande. El tamaño máximo permitido es 5MB.',
          type: 'error'
        });
        e.target.value = null; // Clear the input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imagen: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  const [categoryFormData, setCategoryFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({
          message: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
          type: 'error'
        });
        return;
      }

      const response = await fetch('http://localhost:8080/api/categorias', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        setToast({
          message: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
          type: 'error'
        });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar categorías');
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
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token) {
        setToast({
          message: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
          type: 'error'
        });
        return;
      }

      if (!user || !user.roles.includes('ROLE_ADMIN')) {
        setToast({
          message: 'No tiene permisos de administrador para realizar esta acción.',
          type: 'error'
        });
        return;
      }

      const url = editingCategory
        ? `http://localhost:8080/api/categorias/${editingCategory.id}`
        : 'http://localhost:8080/api/categorias';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryFormData)
      });

      if (response.status === 401) {
        setToast({
          message: 'No autorizado. Verifique sus permisos o inicie sesión nuevamente.',
          type: 'error'
        });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar la categoría');
      }

      setToast({
        message: editingCategory ? 'Categoría actualizada con éxito' : 'Categoría creada con éxito',
        type: 'success'
      });
      setCategoryFormData({ nombre: '', descripcion: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error al procesar la categoría:', error);
      setToast({
        message: error.message || 'Error al procesar la categoría',
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
      descripcion: category.descripcion
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      nombre: '',
      descripcion: ''
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
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      categoria: product.categoria?.id || product.categoria,
      imagen: product.imagen || ''
    });
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria: '',
      imagen: ''
    });
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product && product.nombre ? product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) : false
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
                value={categoryFormData.descripcion}
                onChange={(e) => setCategoryFormData({...categoryFormData, descripcion: e.target.value})}
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
                  <td className="px-6 py-4 whitespace-nowrap">{category.descripcion}</td>
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
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <input
                type="text"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {formData.imagen && (
                <img
                  src={formData.imagen}
                  alt="Vista previa"
                  className="mt-2 h-20 w-20 object-cover rounded-lg"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio</label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value)})}
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
                    {category.nombre}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap">S/. {product.precio}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {categories.find(cat => cat.id === product.categoria?.id)?.nombre || 'Sin categoría'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.imagen ? (
                      <img
                        src={product.imagen}
                        alt={product.nombre}
                        className="h-10 w-10 object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-400">Sin imagen</span>
                    )}
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