'use client';

import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface Venta {
  id: string;
  fecha: string;
  total: number;
  productos: {
    id: string;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
  }[];
}

interface ResumenMensualProps {
  ventas: Venta[];
}

export default function ResumenMensual({ ventas }: ResumenMensualProps) {
  const indicadores = useMemo(() => {
    const fechaActual = new Date();
    const inicioMes = startOfMonth(fechaActual);
    const finMes = endOfMonth(fechaActual);

    const ventasMes = ventas.filter(venta =>
      isWithinInterval(new Date(venta.fecha), { start: inicioMes, end: finMes })
    );

    const totalVentasMes = ventasMes.reduce((sum, venta) => sum + venta.total, 0);
    const cantidadVentasMes = ventasMes.length;

    const productosVendidos = ventasMes.reduce((sum, venta) =>
      sum + venta.productos.reduce((pSum, prod) => pSum + prod.cantidad, 0), 0
    );

    const ticketPromedio = cantidadVentasMes > 0
      ? totalVentasMes / cantidadVentasMes
      : 0;

    return {
      mes: format(fechaActual, 'MMMM yyyy', { locale: es }),
      totalVentas: totalVentasMes,
      cantidadVentas: cantidadVentasMes,
      productosVendidos,
      ticketPromedio
    };
  }, [ventas]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Ventas {indicadores.mes}</h3>
        <p className="text-2xl font-bold">S/ {indicadores.totalVentas.toFixed(2)}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Número de Ventas</h3>
        <p className="text-2xl font-bold">{indicadores.cantidadVentas}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Productos Vendidos</h3>
        <p className="text-2xl font-bold">{indicadores.productosVendidos}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Ticket Promedio</h3>
        <p className="text-2xl font-bold">S/ {indicadores.ticketPromedio.toFixed(2)}</p>
      </div>
    </div>
  );
}