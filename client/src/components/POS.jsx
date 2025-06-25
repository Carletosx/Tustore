import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from './Toast';
import SuccessModal from './SuccessModal';
import Cart from './Cart';
import PaymentOptions from './PaymentOptions';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import BoletaPDF from './BoletaPDF';
import FacturaPDF from './FacturaPDF';
import OpenCashRegisterForm from './OpenCashRegisterForm';
import CloseCashRegisterForm from './CloseCashRegisterForm';

const POS = () => {
  const [cashRegisterStatus, setCashRegisterStatus] = useState(null);
  const [loadingCashRegister, setLoadingCashRegister] = useState(true);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptType, setSelectedReceiptType] = useState(null);

  const [showOpenCashRegisterForm, setShowOpenCashRegisterForm] = useState(false);
  const [showCloseCashRegisterForm, setShowCloseCashRegisterForm] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [boletaData, setBoletaData] = useState(null);
  const [facturaData, setFacturaData] = useState(null);

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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user.username);
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

  const handleCloseCashRegister = async (efectivoFinal, observations, closingManager) => {
    setLoadingCashRegister(true);
    console.log('Sending close cash register request with:', { efectivoFinal, observations, closingManager });
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
        observaciones: observations,
        encargadoCierre: closingManager
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
    if (showPaymentOptions) {
      setToast({
        message: 'No se pueden añadir productos mientras se procesa el pago. Vuelve al carrito para editarlo.',
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

  const handleProcessPayment = async (method, amountReceived = 0, change = 0, clientData = null, receiptType = null) => {
    console.log('handleProcessPayment arguments:');
    console.log('method:', method);
    console.log('amountReceived:', amountReceived);
    console.log('change:', change);
    console.log('clientData:', clientData);
    if (cashRegisterStatus !== 'ABIERTA') {
      setToast({
        message: 'La caja no está abierta. Por favor, abra la caja primero para procesar pagos.',
        type: 'error'
      });
      return;
    }

    if (cart.length === 0) {
      setToast({
        message: 'El carrito está vacío. Agregue productos antes de procesar el pago.',
        type: 'error'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ message: 'No se encontró el token de autenticación. Por favor, inicie sesión.', type: 'error' });
        return;
      }
      const productosToSend = cart.map(item => ({
        productoId: item.id,
        cantidad: item.quantity,
        precioUnitario: item.precio
      }));

      console.log('Productos being sent:', productosToSend);

      const documentNumber = receiptType === 'Factura' ? `F-${Date.now()}` : `B-${Date.now()}`;
      const documentType = receiptType || 'Boleta';
      setSelectedReceiptType(receiptType);

      const requestBody = {
        detalles: productosToSend,
        metodoPago: method,
        total: calculateTotal(),
        montoRecibido: method === 'Efectivo' ? amountReceived : null,
        vuelto: method === 'Efectivo' ? change : null,
        numeroDocumento: documentNumber,
        tipoComprobante: documentType
      };

      console.log('Request Body:', requestBody);

      const response = await axios.post('http://localhost:8080/api/ventas', requestBody, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('API Response:', response.data);
      if (receiptType === 'Factura') {
        setFacturaData({
          facturaNumber: documentNumber,
          cashierName: currentUser,
          amountPaid: amountReceived,
          change: change,
          metodoPago: method,
          cart: cart.map(item => ({ id: item.id, nombre: item.nombre, precio: item.precio, quantity: item.quantity })),
          total: calculateTotal(),
          tipoComprobante: documentType,
          clientName: clientData?.clientName || '',
          clientDoc: clientData?.clientDoc || '',
          clientAddress: clientData?.clientAddress || ''
        });
      } else {
        setBoletaData({
          boletaNumber: documentNumber,
          cashierName: currentUser,
          amountPaid: amountReceived,
          change: change,
          metodoPago: method,
          cart: cart.map(item => ({ id: item.id, nombre: item.nombre, precio: item.precio, quantity: item.quantity })), 
          total: calculateTotal(),
          tipoComprobante: documentType
        });
      }
      setShowReceiptModal(true);
      return true; // Indicate success without updating stock yet
    } catch (error) {
      console.error('Error processing payment:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        setToast({ message: error.response.data.message || 'Error al procesar el pago.', type: 'error' });
      } else if (error.request) {
        console.error('Error request:', error.request);
        setToast({ message: 'No se recibió respuesta del servidor. Verifique la conexión.', type: 'error' });
      } else {
        console.error('Error message:', error.message);
        setToast({ message: 'Error al configurar la solicitud: ' + error.message, type: 'error' });
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <SuccessModal
        show={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
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
      <div className="relative w-1/3 overflow-hidden">
        <div className={`flex transition-transform duration-300 ease-in-out ${showPaymentOptions ? '-translate-x-full' : 'translate-x-0'}`}>
          <div className="w-full flex-shrink-0">
            <Cart
              cart={cart}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
              calculateTotal={calculateTotal}
              onProceedToPayment={handleProceedToPayment}
            />
          </div>
          <div className="w-full flex-shrink-0">
            <PaymentOptions
            cart={cart}
            total={calculateTotal()}
            onBackToCart={() => setShowPaymentOptions(false)}
            setCart={setCart}
            setToast={setToast}
            onPaymentSuccess={handleProcessPayment}
            onShowReceiptModal={setShowReceiptModal}
          />
          </div>
        </div>
      </div>
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

      {showReceiptModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-11/12 md:w-1/3">
            <h3 className="text-2xl font-bold mb-6 text-center">Descargar Comprobante</h3>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
              {selectedReceiptType === 'Boleta' && boletaData ? (
                console.log('Boleta Data for PDF:', boletaData),
                console.log('Selected Receipt Type:', selectedReceiptType),
                <PDFDownloadLink
                  document={<BoletaPDF
                    cart={boletaData.cart}
                    total={boletaData.total}
                    boletaNumber={boletaData.boletaNumber}
                    cashierName={boletaData.cashierName}
                    amountPaid={boletaData.amountPaid}
                    change={boletaData.change}
                    paymentMethod={boletaData.metodoPago}
                  />}
                  fileName={`boleta_${boletaData.boletaNumber}.pdf`}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  {({ loading, url, blob }) => {
                    React.useEffect(() => {
                      if (!loading && url) {
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `boleta_${boletaData.boletaNumber}.pdf`;
                        link.click();
                        URL.revokeObjectURL(url);
                        fetchProducts(selectedCategory);
                        setSuccessMessage('Compra realizada con éxito!');
                        setShowSuccessModal(true);
                        setCart([]);
                        setShowPaymentOptions(false);
                        setShowReceiptModal(false);
                        setSelectedReceiptType(null);
                      }
                    }, [loading, url]);
                    return loading ? 'Generando Boleta...' : 'Descargar Boleta PDF';
                  }}
                </PDFDownloadLink>
              ) : selectedReceiptType === 'Factura' && facturaData ? (
                console.log('Factura Data for PDF:', facturaData),
                console.log('Selected Receipt Type:', selectedReceiptType),
                <PDFDownloadLink
                  document={<FacturaPDF
                    cart={facturaData.cart}
                    total={facturaData.total}
                    facturaNumber={facturaData.facturaNumber}
                    cashierName={facturaData.cashierName}
                    amountPaid={facturaData.amountPaid}
                    change={facturaData.change}
                    paymentMethod={facturaData.metodoPago}
                    clientName={facturaData.clientName}
                    clientDoc={facturaData.clientDoc}
                    clientAddress={facturaData.clientAddress}
                  />}
                  fileName={`factura_${facturaData.facturaNumber}.pdf`}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  {({ loading, url, blob }) => {
                    React.useEffect(() => {
                      if (!loading && url) {
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `factura_${facturaData.facturaNumber}.pdf`;
                        link.click();
                        URL.revokeObjectURL(url);
                        fetchProducts(selectedCategory);
                        setSuccessMessage('Compra realizada con éxito!');
                        setShowSuccessModal(true);
                        setCart([]);
                        setShowPaymentOptions(false);
                        setShowReceiptModal(false);
                        setSelectedReceiptType(null);
                      }
                    }, [loading, url]);
                    return loading ? 'Generando PDF...' : 'Descargar Factura PDF';
                  }}
                </PDFDownloadLink>
              ) : (
                <button
                  onClick={() => {
                    setSuccessMessage('Compra realizada con éxito!');
                    setShowSuccessModal(true);
                    setCart([]);
                    setShowPaymentOptions(false);
                    setShowReceiptModal(false);
                    setSelectedReceiptType(null);
                  }}
                  className={`bg-green-500 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-200 ${!selectedReceiptType ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600 hover:shadow-md'}`}
                  disabled={!selectedReceiptType}
                >
                  Finalizar Compra
                </button>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;