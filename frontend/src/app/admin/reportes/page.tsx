'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import VentasChart from './components/VentasChart';
import VentasPorCategoriaChart from './components/VentasPorCategoriaChart';
import ResumenMensual from './components/ResumenMensual';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import type { Table, UserOptions } from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: Table;
    autoTable: (options: UserOptions) => void;
  }
}

interface Venta {
  id: string;
  fecha: string;
  total: number;
  vendedorId: string;
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

export default function ReportesPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [ventasFiltradas, setVentasFiltradas] = useState<Venta[]>([]);
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [vendedores, setVendedores] = useState<{ id: string; nombre: string }[]>([]);
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay sesión activa. Por favor, inicie sesión.');
      return;
    }
    cargarVentas();
    cargarCategorias();
    cargarVendedores();
  }, []);

  useEffect(() => {
    filtrarVentas();
  }, [fechaInicio, fechaFin, ventas, categoriaSeleccionada, vendedorSeleccionado]);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/ventas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setVentas(response.data);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar las ventas');
      console.error('Error al cargar ventas:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const cargarVendedores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/usuarios/vendedores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setVendedores(response.data);
    } catch (error: any) {
      console.error('Error al cargar vendedores:', error);
    }
  };

  const filtrarVentas = () => {
    let ventasFiltradas = ventas;

    if (fechaInicio && fechaFin) {
      ventasFiltradas = ventasFiltradas.filter(venta => {
        const fechaVenta = new Date(venta.fecha);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return fechaVenta >= inicio && fechaVenta <= fin;
      });
    }

    if (categoriaSeleccionada) {
      ventasFiltradas = ventasFiltradas.filter(venta =>
        venta.productos.some(producto => producto.categoriaId === categoriaSeleccionada)
      );
    }

    if (vendedorSeleccionado) {
      ventasFiltradas = ventasFiltradas.filter(venta =>
        venta.vendedorId === vendedorSeleccionado
      );
    }

    setVentasFiltradas(ventasFiltradas);
  };

  const calcularTotalVentas = () => {
    return ventasFiltradas.reduce((total, venta) => total + venta.total, 0);
  };

  const calcularProductosMasVendidos = () => {
    const productosMap = new Map();

    ventasFiltradas.forEach(venta => {
      venta.productos.forEach(producto => {
        const actual = productosMap.get(producto.nombre) || 0;
        productosMap.set(producto.nombre, actual + producto.cantidad);
      });
    });

    return Array.from(productosMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Reporte de Ventas', 14, 20);

    const datos = ventasFiltradas.map(venta => [
      format(new Date(venta.fecha), 'dd/MM/yyyy HH:mm', { locale: es }),
      venta.id,
      venta.productos.map(p => `${p.nombre} (${p.cantidad})`).join(', '),
      `S/ ${venta.total.toFixed(2)}`
    ]);

    doc.autoTable({
      head: [['Fecha', 'ID', 'Productos', 'Total']],
      body: datos,
      startY: 30,
    });

    doc.save(`reporte_ventas_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
  };

  const exportarExcel = () => {
    const data = ventasFiltradas.map(venta => ({
      'ID Venta': venta.id,
      'Fecha': format(new Date(venta.fecha), 'dd/MM/yyyy HH:mm', { locale: es }),
      'Total': `S/ ${venta.total.toFixed(2)}`,
      'Productos': venta.productos.map(p => `${p.nombre} (${p.cantidad})`).join(', ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');
    XLSX.writeFile(workbook, `reporte_ventas_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }

  return (
    <div className="p-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Reportes de Ventas</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Fin</label>
            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Categoría</label>
            <Select
              value={categoriaSeleccionada}
              onValueChange={setCategoriaSeleccionada}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Vendedor</label>
            <Select
              value={vendedorSeleccionado}
              onValueChange={setVendedorSeleccionado}
            >
              <option value="">Todos los vendedores</option>
              {vendedores.map(vendedor => (
                <option key={vendedor.id} value={vendedor.id}>{vendedor.nombre}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button
              onClick={exportarExcel}
              className="flex-1"
              disabled={ventasFiltradas.length === 0}
            >
              Excel
            </Button>
            <Button
              onClick={exportarPDF}
              className="flex-1"
              disabled={ventasFiltradas.length === 0}
            >
              PDF
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <ResumenMensual ventas={ventasFiltradas} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <VentasChart ventas={ventasFiltradas} />
          <VentasPorCategoriaChart ventas={ventasFiltradas} />
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Resumen de Ventas</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Ventas:</span>
                <span className="font-bold">S/ {calcularTotalVentas().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Número de Ventas:</span>
                <span className="font-bold">{ventasFiltradas.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Productos Más Vendidos</h2>
            <div className="space-y-2">
              {calcularProductosMasVendidos().map(([nombre, cantidad], index) => (
                <div key={nombre} className="flex justify-between items-center">
                  <span className="text-gray-600">{nombre}</span>
                  <span className="font-bold">{cantidad} unidades</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <h2 className="text-xl font-bold p-6 bg-gray-50 border-b">Detalle de Ventas</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ventasFiltradas.map((venta) => (
                  <tr key={venta.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(venta.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{venta.id}</td>
                    <td className="px-6 py-4">
                      {venta.productos.map(p => `${p.nombre} (${p.cantidad})`).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      S/ {venta.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}