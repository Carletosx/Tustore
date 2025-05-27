import { useState } from 'react';
import Toast from './Toast';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Productos de ejemplo (en una implementación real, esto vendría de una API)
  const sampleProducts = [
    { id: 1, name: 'Laptop HP', price: 2500.00, stock: 5 },
    { id: 2, name: 'Mouse Gamer', price: 120.00, stock: 15 },
    { id: 3, name: 'Teclado Mecánico', price: 250.00, stock: 8 },
  ];

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
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = sampleProducts.find(p => p.id === productId);
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
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    // Aquí iría la lógica para procesar el pago
    setToast({
      message: 'Venta realizada con éxito',
      type: 'success'
    });
    setCart([]);
  };

  const filteredProducts = sampleProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-gray-600">S/. {product.price.toFixed(2)}</p>
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
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-600">S/. {item.price.toFixed(2)}</p>
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
            Procesar Venta
          </button>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default POS;