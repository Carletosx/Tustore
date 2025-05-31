import { useState, useEffect } from 'react';
import Toast from './Toast';
import Cart from './Cart';
import PaymentOptions from './PaymentOptions';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

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
    setCart(prevCart => {
      const existingProduct = prevCart.find(item => item.id === product.id);
      if (existingProduct) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    setToast({
      message: `${product.nombre} añadido al carrito`,
      type: 'success'
    });
  };

  const updateQuantity = (productId, amount) => {
    setCart(prevCart => {
      const productInCart = prevCart.find(item => item.id === productId);
      const productInStock = products.find(p => p.id === productId);

      if (productInCart && productInStock) {
        const newQuantity = productInCart.quantity + amount;
        if (newQuantity > productInStock.stock) {
          setToast({
            message: `Stock insuficiente para ${productInStock.nombre}. Disponible: ${productInStock.stock}`,
            type: 'error'
          });
          return prevCart; // No update if stock is insufficient
        }
      }

      const updatedCart = prevCart.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity + amount } : item
      ).filter(item => item.quantity > 0);
      return updatedCart;
    });
  };

  const removeItem = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };



  const filteredProducts = products.filter(product => {
    const matchesSearchTerm = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.categoria.id === selectedCategory : true;
    return matchesSearchTerm && matchesCategory;
  });

  const handleProceedToPayment = () => {
    setShowPaymentOptions(true);
  };

  const handleBackToCart = () => {
    setShowPaymentOptions(false);
  };

  return (
    <div className="flex h-full gap-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4 overflow-y-auto h-[calc(100vh-250px)] pr-4">
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
                className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                Agregar al Carrito
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Carrito de Compras o Opciones de Pago */}
      <div className="w-1/3">
        {!showPaymentOptions ? (
          <Cart
            cart={cart}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            onProceedToPayment={handleProceedToPayment}
          />
        ) : (
          <PaymentOptions
            cart={cart}
            total={cart.reduce((sum, item) => sum + item.precio * item.quantity, 0)}
            onBackToCart={handleBackToCart}
            setCart={setCart}
            setToast={setToast}
          />
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default POS;