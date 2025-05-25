'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductoCarrito } from './page';

interface ComprobanteProps {
  productos: ProductoCarrito[];
  total: number;
  onClose: () => void;
  onPrint: () => void;
}

export default function Comprobante({ productos, total, onClose, onPrint }: ComprobanteProps) {
  const [imprimiendo, setImprimiendo] = useState(false);

  const handleImprimir = async () => {
    setImprimiendo(true);
    try {
      await onPrint();
      onClose();
    } catch (error) {
      console.error('Error al imprimir:', error);
    } finally {
      setImprimiendo(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Comprobante de Venta</h2>
          <p className="text-gray-600">{new Date().toLocaleString()}</p>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Detalle de la venta:</h3>
          <div className="space-y-2">
            {productos.map((producto) => (
              <div key={producto.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{producto.nombre}</p>
                  <p className="text-sm text-gray-600">
                    Cantidad: {producto.cantidad} x S/ {producto.precio.toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold">
                  S/ {(producto.precio * producto.cantidad).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={imprimiendo}
          >
            Cerrar
          </Button>
          <Button
            onClick={handleImprimir}
            disabled={imprimiendo}
          >
            {imprimiendo ? 'Imprimiendo...' : 'Imprimir'}
          </Button>
        </div>
      </div>
    </div>
  );
}