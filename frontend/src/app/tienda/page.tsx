'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TiendaPage() {
  const [tiendaInfo, setTiendaInfo] = useState({
    nombre: 'Mi Tienda',
    direccion: 'Av. Principal 123',
    telefono: '123-456-789',
    email: 'contacto@mitienda.com',
    horario: 'Lun-Vie: 9am-7pm, Sáb: 9am-2pm'
  });

  const [loading, setLoading] = useState(false);

  // En una implementación real, aquí cargaríamos la información de la tienda desde el backend
  useEffect(() => {
    // Simulación de carga de datos
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Información de Mi Tienda</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Cargando información...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Datos Generales</h2>
              <div className="space-y-3">
                <p><span className="font-medium">Nombre:</span> {tiendaInfo.nombre}</p>
                <p><span className="font-medium">Dirección:</span> {tiendaInfo.direccion}</p>
                <p><span className="font-medium">Teléfono:</span> {tiendaInfo.telefono}</p>
                <p><span className="font-medium">Email:</span> {tiendaInfo.email}</p>
                <p><span className="font-medium">Horario:</span> {tiendaInfo.horario}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
              <div className="space-y-3">
                <Link href="/configuraciones" className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition">
                  ⚙️ Configurar información de la tienda
                </Link>
                <Link href="/inventario" className="block p-3 bg-green-50 hover:bg-green-100 rounded-md transition">
                  📦 Gestionar inventario
                </Link>
                <Link href="/vender" className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-md transition">
                  💰 Ir a vender
                </Link>
                <Link href="/estadisticas" className="block p-3 bg-yellow-50 hover:bg-yellow-100 rounded-md transition">
                  📈 Ver estadísticas
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}