'use client';

import { useState } from 'react';

export default function ConfiguracionesPage() {
  const [formData, setFormData] = useState({
    nombreTienda: 'Mi Tienda',
    direccion: 'Av. Principal 123',
    telefono: '123-456-789',
    email: 'contacto@mitienda.com',
    ruc: '20123456789',
    moneda: 'PEN',
    impuesto: '18',
    logo: '',
    tema: 'claro'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar las configuraciones en el backend
    console.log('Guardando configuraciones:', formData);
    alert('Configuraciones guardadas correctamente');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Configuraciones</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Información de la Tienda</h2>
              
              <div>
                <label htmlFor="nombreTienda" className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Tienda</label>
                <input
                  type="text"
                  id="nombreTienda"
                  name="nombreTienda"
                  value={formData.nombreTienda}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {/* Configuraciones fiscales y de sistema */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Configuraciones del Sistema</h2>
              
              <div>
                <label htmlFor="ruc" className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
                <input
                  type="text"
                  id="ruc"
                  name="ruc"
                  value={formData.ruc}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="moneda" className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                <select
                  id="moneda"
                  name="moneda"
                  value={formData.moneda}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="PEN">Soles (PEN)</option>
                  <option value="USD">Dólares (USD)</option>
                  <option value="EUR">Euros (EUR)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="impuesto" className="block text-sm font-medium text-gray-700 mb-1">Impuesto (%)</label>
                <input
                  type="number"
                  id="impuesto"
                  name="impuesto"
                  value={formData.impuesto}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <label htmlFor="tema" className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                <select
                  id="tema"
                  name="tema"
                  value={formData.tema}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="claro">Claro</option>
                  <option value="oscuro">Oscuro</option>
                  <option value="sistema">Según sistema</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Guardar Configuraciones
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}