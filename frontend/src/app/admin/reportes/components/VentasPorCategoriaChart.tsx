'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Venta {
  id: string;
  fecha: string;
  total: number;
  productos: {
    id: string;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    categoriaId: string;
    categoria: {
      id: string;
      nombre: string;
    };
  }[];
}

interface VentasPorCategoriaChartProps {
  ventas: Venta[];
}

export default function VentasPorCategoriaChart({ ventas }: VentasPorCategoriaChartProps) {
  const datosGrafico = useMemo(() => {
    const ventasPorCategoria = new Map<string, { nombre: string; total: number; cantidad: number }>();

    ventas.forEach(venta => {
      venta.productos.forEach(producto => {
        const categoria = producto.categoria.nombre;
        const ventaCategoria = ventasPorCategoria.get(categoria) || {
          nombre: categoria,
          total: 0,
          cantidad: 0
        };

        ventaCategoria.total += producto.precioUnitario * producto.cantidad;
        ventaCategoria.cantidad += producto.cantidad;

        ventasPorCategoria.set(categoria, ventaCategoria);
      });
    });

    return Array.from(ventasPorCategoria.values());
  }, [ventas]);

  return (
    <div className="w-full h-[400px] bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Ventas por Categoría</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={datosGrafico}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="total"
            fill="#8884d8"
            name="Total (S/)"
          />
          <Bar
            yAxisId="right"
            dataKey="cantidad"
            fill="#82ca9d"
            name="Cantidad de Productos"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}