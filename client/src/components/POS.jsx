import { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from './Toast';
import Cart from './Cart';
import PaymentOptions from './PaymentOptions';
import OpenCashRegisterForm from './OpenCashRegisterForm';
import CloseCashRegisterForm from './CloseCashRegisterForm';

const POS = () => {
  const [cashRegisterStatus, setCashRegisterStatus] = useState(null);
  const [loadingCashRegister, setLoadingCashRegister] = useState(true);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showOpenCashRegisterForm, setShowOpenCashRegisterForm] = useState(false);
  const [showCloseCashRegisterForm, setShowCloseCashRegisterForm] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

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
    fetchCashRegisterStatus();
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, [selectedCategory]);

  const fetchCashRegisterStatus = async () => {
    setLoadingCashRegister(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/caja/estado', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCashRegisterStatus(response.data.estado);
    } catch (error) {
      console.error('Error fetching cash register status:', error);
      setToast({
        message: 'Error al obtener el estado de la caja.',
        type: 'error'
      });
      setCashRegisterStatus('UNKNOWN');
    } finally {
      setLoadingCashRegister(false);
    }
  };

  const handleOpenCashRegister = async ({ initialAmount, openingManager, denominations, openingDateTime }) => {
    setLoadingCashRegister(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/caja/abrir', {
        montoInicial: initialAmount,
        encargadoApertura: openingManager,
        denominaciones: denominations,
        fechaApertura: openingDateTime
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setToast({ message: response.data.message, type: 'success' });
      setCashRegisterStatus('ABIERTA'); // Explicitly set status to ABIERTA
      fetchCashRegisterStatus(); // Re-fetch to ensure consistency
      setShowOpenCashRegisterForm(false);
    } catch (error) {
      console.error('Error opening cash register:', error);
      setToast({ message: error.response?.data?.message || 'Error al abrir la caja.', type: 'error' });
    } finally {
      setLoadingCashRegister(false);
    }
  };

  const handleCloseCashRegister = async (efectivoFinal, observations) => {
    setLoadingCashRegister(true);
    console.log('Sending close cash register request with:', { efectivoFinal, observations });
    try {
      const token = localStorage.getItem('token');
      console.log('Retrieved token:', token); // Add this line
      if (!token) {
        console.error('Authentication token not found. Cannot close cash register.');
        setToast({ message: 'Sesión expirada. Por favor, inicie sesión nuevamente.', type: 'error' });
        setLoadingCashRegister(false);
        return;
      }
      console.log('Token found, proceeding with API call.');
      const response = await axios.post('http://localhost:8080/api/caja/cerrar', {
        efectivoFinal: efectivoFinal,
        observaciones: observations
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Close cash register API response:', response.data);
      setToast({ message: response.data.message, type: 'success' });
      setCashRegisterStatus('CERRADA'); // Explicitly set status to CERRADA
      fetchCashRegisterStatus(); // Re-fetch to ensure consistency
      setShowCloseCashRegisterForm(false);
    } catch (error) {
      console.error('Error closing cash register:', error);
      setToast({ message: error.response?.data?.message || 'Error al cerrar la caja.', type: 'error' });
    } finally {
      setLoadingCashRegister(false);
    }
  };

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
    if (cashRegisterStatus !== 'ABIERTA') {
      setToast({
        message: 'La caja no está abierta. Por favor, abra la caja primero.',
        type: 'error'
      });
      return;
    }
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

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.precio * item.quantity, 0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
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

  const handleProcessPayment = async (paymentMethod, amountPaid) => {
    if (cashRegisterStatus !== 'ABIERTA') {
      setToast({
        message: 'La caja no está abierta. Por favor, abra la caja primero para procesar pagos.',
        type: 'error'
      });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/ventas', {
        productos: cart.map(item => ({
          id: item.id,
          cantidad: item.quantity
        })),
        metodoPago: paymentMethod,
        total: calculateTotal()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setToast({ message: response.data.message, type: 'success' });
      setCart([]);
      setShowPaymentOptions(false);
      fetchProducts(selectedCategory); // Refresh product list to update stock
    } catch (error) {
      console.error('Error processing payment:', error);
      setToast({ message: error.response?.data?.message || 'Error al procesar el pago.', type: 'error' });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Punto de Venta</h1>
          <div>
            <button
              onClick={() => setShowOpenCashRegisterForm(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Abrir Caja
            </button>
            <button
              onClick={() => setShowCloseCashRegisterForm(true)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Cerrar Caja
            </button>
          </div>
        </header>
        <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
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
              className="w-full p-2 border rounded"
              onChange={(e) => handleCategoryChange(e.target.value ? parseInt(e.target.value) : null)}
              value={selectedCategory || ''}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
                {product.imagenBase64 && (
                  <img
                    src={`data:image/jpeg;base64,${product.imagenBase64}`}
                    alt={product.nombre}
                    className="w-full h-32 object-contain mb-2 rounded"
                  />
                )}
                <h3 className="font-bold text-lg">{product.nombre}</h3>
                <p className="text-gray-600">S/ {product.precio.toFixed(2)}</p>
                <p className="text-gray-600">Stock: {product.stock}</p>
                <button
                  onClick={() => addToCart(product)}
                  className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Cart
        cart={cart}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        calculateTotal={calculateTotal}
        handleProceedToPayment={handleProceedToPayment}
      />
      {showPaymentOptions && (
        <PaymentOptions
          total={calculateTotal()}
          onPaymentSuccess={handlePaymentSuccess}
          onBackToCart={handleBackToCart}
        />
      )}
      {showOpenCashRegisterForm && (
        <OpenCashRegisterForm
          onOpen={handleOpenCashRegister}
          onClose={() => setShowOpenCashRegisterForm(false)}
          currentUser={currentUser}
        />
      )}

      {showCloseCashRegisterForm && (
        <CloseCashRegisterForm
          onClose={() => setShowCloseCashRegisterForm(false)}
          onCloseCashRegister={handleCloseCashRegister}
        />
      )}


    </div>
  );
};

export default POS;