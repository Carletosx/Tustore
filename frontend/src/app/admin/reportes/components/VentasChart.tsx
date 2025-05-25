'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
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

interface VentasChartProps {
  ventas: Venta[];
}

export default function VentasChart({ ventas }: VentasChartProps) {
  const datosGrafico = useMemo(() => {
    const ventasOrdenadas = [...ventas].sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    return ventasOrdenadas.map(venta => ({
      fecha: format(new Date(venta.fecha), 'dd/MM/yyyy', { locale: es }),
      total: venta.total,
      cantidadProductos: venta.productos.reduce((sum, prod) => sum + prod.cantidad, 0)
    }));
  }, [ventas]);

  return (
    <div className="w-full h-[400px] bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Tendencia de Ventas</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={datosGrafico}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="fecha" 
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="total"
            stroke="#8884d8"
            name="Total (S/)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cantidadProductos"
            stroke="#82ca9d"
            name="Cantidad de Productos"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}