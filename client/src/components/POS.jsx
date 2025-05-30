import { useState, useEffect } from 'react';
import Toast from './Toast';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({
        message: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
        type: 'error'
      });
      return;
    }
    fetchCategories();
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const fetchProducts = async (categoryId = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({
          message: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
          type: 'error'
        });
        return;
      }

      let url = 'http://localhost:8080/api/productos';
      if (categoryId) {
        url = `http://localhost:8080/api/productos/categoria/${categoryId}`;
      }

      const response = await fetch(url, {
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
        console.log('Fetched products data:', data); // Add this line
        setProducts(Array.isArray(data) ? data.map(product => ({ ...product, precio: parseFloat(product.precio) })) : []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar productos');
      }
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
      setProducts([]);
    }
  };

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
        setCategories(data);
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

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        setToast({
          message: 'Stock insuficiente',
          type: 'error'
        });
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, precio: product.precio }]);
      console.log('Product added to cart:', { ...product, quantity: 1, precio: product.precio });
      console.log('Current cart:', [...cart, { ...product, quantity: 1, precio: product.precio }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId); // Use fetched products
    if (newQuantity > product.stock) {
      setToast({
        message: 'Stock insuficiente',
        type: 'error'
      });
      return;
    }
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotal = () => {
    const total = cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
    console.log('Calculated total:', total);
    return total;
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({
          message: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
          type: 'error'
        });
        return;
      }

      const saleDetails = cart.map(item => ({
        productoId: item.id,
        cantidad: item.quantity,
        precioUnitario: item.precio
      }));

      const response = await fetch('http://localhost:8080/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ detalles: saleDetails })
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
        throw new Error(errorData.message || 'Error al procesar la venta');
      }

      setToast({
        message: 'Venta realizada con éxito',
        type: 'success'
      });
      setCart([]);
      fetchProducts(); // Refresh product stock after sale
    } catch (error) {
      setToast({
        message: error.message,
        type: 'error'
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearchTerm = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.categoria.id === selectedCategory : true;
    return matchesSearchTerm && matchesCategory;
  });

  return (
    <div className="flex h-full gap-6">
      {/* Lista de productos */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Punto de Venta</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value === '' ? null : parseInt(e.target.value))}
            className="w-full p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow">
              {product.imagenBase64 && (
                <img
                  src={`data:image/jpeg;base64,${product.imagenBase64}`}
                  alt={product.nombre}
                  className="w-full h-32 object-contain mb-2 rounded"
                />
              )}
              <h3 className="font-semibold">{product.nombre}</h3> {/* Use product.nombre */}
              <p className="text-gray-600">S/. {product.precio.toFixed(2)}</p> {/* Use product.precio */}
              <p className="text-sm text-gray-500">Stock: {product.stock}</p>
              <button
                onClick={() => addToCart(product)}
                className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Carrito */}
      <div className="w-96 bg-white p-6 rounded-lg shadow-lg h-full">
        <h2 className="text-xl font-semibold mb-4">Carrito</h2>
        <div className="space-y-4 mb-4">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{item.nombre}</h3> {/* Use item.nombre */}
                <p className="text-gray-600">S/. {item.precio.toFixed(2)}</p> {/* Use item.precio */}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  className="w-16 p-1 border rounded"
                />
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-semibold mb-4">
            <span>Total:</span>
            <span>S/. {getTotal().toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            Finalizar Venta
          </button>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default POS;