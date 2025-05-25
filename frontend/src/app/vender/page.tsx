'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Comprobante = dynamic(() => import('./comprobante'), { ssr: false });
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaId: string;
}

export interface ProductoCarrito extends Producto {
  cantidad: number;
}

export default function VenderPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay sesión activa. Por favor, inicie sesión.');
      return;
    }
    cargarCategorias();
    cargarProductos();
  }, []);

  useEffect(() => {
    filtrarProductos();
  }, [categoriaSeleccionada, productos, busqueda]);

  const cargarCategorias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/categorias', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCategorias(response.data);
    } catch (error: any) {
      console.error('Error al cargar categorías:', error);
      setError('Error al cargar las categorías');
    }
  };

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/productos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProductos(response.data);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar los productos');
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarProductos = () => {
    let productosFiltrados = productos;

    if (categoriaSeleccionada) {
      productosFiltrados = productosFiltrados.filter(
        producto => producto.categoriaId === categoriaSeleccionada
      );
    }

    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      productosFiltrados = productosFiltrados.filter(
        producto =>
          producto.nombre.toLowerCase().includes(busquedaLower) ||
          producto.descripcion.toLowerCase().includes(busquedaLower)
      );
    }

    setProductosFiltrados(productosFiltrados);
  };

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prevCarrito => {
      const productoEnCarrito = prevCarrito.find(item => item.id === producto.id);
      
      if (productoEnCarrito) {
        if (productoEnCarrito.cantidad >= producto.stock) {
          setError('No hay suficiente stock disponible');
          return prevCarrito;
        }
        return prevCarrito.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...prevCarrito, { ...producto, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (productoId: string, cantidad: number) => {
    setCarrito(prevCarrito =>
      prevCarrito.map(item => {
        if (item.id === productoId) {
          if (cantidad > item.stock) {
            setError('No hay suficiente stock disponible');
            return item;
          }
          return { ...item, cantidad };
        }
        return item;
      })
    );
  };

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito(prevCarrito => prevCarrito.filter(item => item.id !== productoId));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  const [mostrarComprobante, setMostrarComprobante] = useState(false);

  const realizarVenta = async () => {
    try {
      const token = localStorage.getItem('token');
      const venta = {
        productos: carrito.map(item => ({
          productoId: item.id,
          cantidad: item.cantidad,
          precioUnitario: item.precio
        }))
      };

      await axios.post('http://localhost:8080/api/ventas', venta, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setMostrarComprobante(true);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al procesar la venta');
      console.error('Error al procesar venta:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }

  const handleImprimirComprobante = async () => {
    try {
      window.print();
    } catch (error) {
      console.error('Error al imprimir:', error);
    }
  };

  const cerrarComprobante = () => {
    setMostrarComprobante(false);
    setCarrito([]);
    cargarProductos(); // Actualizar stock
  };

  return (
    <div className="p-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Panel de productos */}
        <div className="md:col-span-2">
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="flex-1"
              />
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className="rounded-md border border-gray-300 p-2"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2">{producto.nombre}</h3>
                <p className="text-gray-600 text-sm mb-2">{producto.descripcion}</p>
                <p className="text-lg font-bold mb-2">S/ {producto.precio.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mb-4">Stock: {producto.stock}</p>
                <Button
                  onClick={() => agregarAlCarrito(producto)}
                  disabled={producto.stock === 0}
                  className="w-full"
                >
                  Agregar al carrito
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Panel del carrito */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Carrito de Venta</h2>
          <div className="space-y-4">
            {carrito.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h3 className="font-semibold">{item.nombre}</h3>
                  <p className="text-sm text-gray-600">S/ {item.precio.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.cantidad}
                    onChange={(e) => actualizarCantidad(item.id, parseInt(e.target.value))}
                    className="w-20"
                  />
                  <button
                    onClick={() => eliminarDelCarrito(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {carrito.length > 0 ? (
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>S/ {calcularTotal().toFixed(2)}</span>
                </div>
                <Button
                  onClick={realizarVenta}
                  className="w-full"
                >
                  Procesar Venta
                </Button>
              </div>
            ) : (
              <p className="text-center text-gray-500">El carrito está vacío</p>
            )}
          </div>
        </div>
      </div>

      {/* Comprobante de venta */}
      {mostrarComprobante && (
        <Comprobante
          productos={carrito}
          total={calcularTotal()}
          onClose={cerrarComprobante}
          onPrint={handleImprimirComprobante}
        />
      )}
    </div>
  );
}