import { useState } from 'react';
import Toast from './Toast';

const Inventory = () => {
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movementType, setMovementType] = useState('entrada');
  const [quantity, setQuantity] = useState('');

  // Datos de ejemplo (en una implementación real, esto vendría de una API)
  const sampleProducts = [
    { id: 1, name: 'Laptop HP', stock: 5, minStock: 3, category: 'Electrónicos' },
    { id: 2, name: 'Mouse Gamer', stock: 15, minStock: 5, category: 'Accesorios' },
    { id: 3, name: 'Teclado Mecánico', stock: 8, minStock: 4, category: 'Accesorios' },
  ];

  const handleMovement = (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantity) {
      setToast({
        message: 'Por favor complete todos los campos',
        type: 'error'
      });
      return;
    }

    const numQuantity = parseInt(quantity);
    if (movementType === 'salida' && numQuantity > selectedProduct.stock) {
      setToast({
        message: 'Stock insuficiente para realizar la salida',
        type: 'error'
      });
      return;
    }

    // Aquí iría la lógica para registrar el movimiento
    setToast({
      message: `${movementType === 'entrada' ? 'Entrada' : 'Salida'} registrada con éxito`,
      type: 'success'
    });

    // Limpiar el formulario
    setSelectedProduct(null);
    setQuantity('');
  };

  const filteredProducts = sampleProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Inventario</h1>

      {/* Formulario de movimientos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Registrar Movimiento</h2>
        <form onSubmit={handleMovement} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Movimiento
            </label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Producto
            </label>
            <select
              value={selectedProduct?.id || ''}
              onChange={(e) => setSelectedProduct(sampleProducts.find(p => p.id === parseInt(e.target.value)))}
              className="w-full p-2 border rounded"
            >
              <option value="">Seleccione un producto</option>
              {sampleProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (Stock actual: {product.stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Registrar Movimiento
          </button>
        </form>
      </div>

      {/* Lista de productos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Productos en Inventario</h2>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Mínimo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.minStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock > product.minStock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock > product.minStock ? 'OK' : 'Stock Bajo'}
                    </span>
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

export default Inventory;