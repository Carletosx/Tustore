'use client';

import { useState, useEffect } from 'react';

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  documento: string;
  tipoDocumento: string;
  fechaRegistro: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Datos de ejemplo para la demostración
  useEffect(() => {
    // Simulación de carga de datos desde el backend
    setLoading(true);
    setTimeout(() => {
      const clientesEjemplo: Cliente[] = [
        { id: '1', nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@example.com', telefono: '987654321', direccion: 'Av. Los Olivos 123', documento: '45678912', tipoDocumento: 'DNI', fechaRegistro: '2023-05-15' },
        { id: '2', nombre: 'María', apellido: 'González', email: 'maria.gonzalez@example.com', telefono: '987123456', direccion: 'Jr. Las Flores 456', documento: '12345678', tipoDocumento: 'DNI', fechaRegistro: '2023-06-20' },
        { id: '3', nombre: 'Carlos', apellido: 'Rodríguez', email: 'carlos.rodriguez@example.com', telefono: '912345678', direccion: 'Calle Los Pinos 789', documento: '20123456789', tipoDocumento: 'RUC', fechaRegistro: '2023-07-10' },
        { id: '4', nombre: 'Ana', apellido: 'López', email: 'ana.lopez@example.com', telefono: '945678123', direccion: 'Av. Arequipa 567', documento: '87654321', tipoDocumento: 'DNI', fechaRegistro: '2023-08-05' },
        { id: '5', nombre: 'Pedro', apellido: 'Martínez', email: 'pedro.martinez@example.com', telefono: '978123456', direccion: 'Jr. Huallaga 890', documento: '20987654321', tipoDocumento: 'RUC', fechaRegistro: '2023-09-15' },
      ];
      setClientes(clientesEjemplo);
      setLoading(false);
    }, 800);
  }, []);

  // Filtrar clientes según búsqueda
  const clientesFiltrados = clientes.filter(cliente => {
    const terminoBusqueda = busqueda.toLowerCase();
    return cliente.nombre.toLowerCase().includes(terminoBusqueda) || 
           cliente.apellido.toLowerCase().includes(terminoBusqueda) || 
           cliente.email.toLowerCase().includes(terminoBusqueda) || 
           cliente.documento.includes(terminoBusqueda);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          + Nuevo Cliente
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, email o documento..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Cargando clientes...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron clientes que coincidan con la búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{cliente.nombre} {cliente.apellido}</div>
                          <div className="text-sm text-gray-500">{cliente.direccion}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cliente.email}</div>
                      <div className="text-sm text-gray-500">{cliente.telefono}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {cliente.tipoDocumento}: {cliente.documento}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.fechaRegistro}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                      <button className="text-red-600 hover:text-red-900">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}