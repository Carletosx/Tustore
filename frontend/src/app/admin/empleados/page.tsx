'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

export default function EmpleadosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: '',
    activo: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay sesión activa. Por favor, inicie sesión.');
      return;
    }
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsuarios(response.data);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar los usuarios');
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFormErrors = {
      nombre: '',
      email: '',
      password: '',
      rol: ''
    };

    if (!formData.nombre.trim()) {
      newFormErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.email.trim()) {
      newFormErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newFormErrors.email = 'El email no es válido';
    }
    if (!usuarioActual && !formData.password.trim()) {
      newFormErrors.password = 'La contraseña es requerida';
    }
    if (!formData.rol) {
      newFormErrors.rol = 'El rol es requerido';
    }

    setFormErrors(newFormErrors);

    if (Object.values(newFormErrors).some(error => error)) {
      return;
    }

    try {
      const url = `http://localhost:8080/api/usuarios${usuarioActual ? `/${usuarioActual.id}` : ''}`;
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      };

      const userData = {
        ...formData,
        // Solo incluir la contraseña si es un nuevo usuario o si se ha modificado
        ...((!usuarioActual || formData.password) && { password: formData.password })
      };

      if (usuarioActual) {
        await axios.put(url, userData, config);
      } else {
        await axios.post(url, userData, config);
      }

      setModalAbierto(false);
      setUsuarioActual(null);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: '',
        activo: true
      });
      setError('');
      cargarUsuarios();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al guardar el usuario';
      setError(errorMessage);
      console.error('Error al guardar usuario:', error);
    }
  };

  const handleEditar = (usuario: Usuario) => {
    setUsuarioActual(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '', // No mostrar la contraseña actual
      rol: usuario.rol,
      activo: usuario.activo
    });
    setModalAbierto(true);
  };

  const handleEliminar = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await axios.delete(`http://localhost:8080/api/usuarios/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setError('');
        cargarUsuarios();
      } catch (error) {
        setError('Error al eliminar el usuario');
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  const toggleEstado = async (usuario: Usuario) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/usuarios/${usuario.id}/estado`,
        { activo: !usuario.activo },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      cargarUsuarios();
    } catch (error) {
      setError('Error al cambiar el estado del usuario');
      console.error('Error al cambiar estado:', error);
    }
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

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
        <Button
          onClick={() => {
            setUsuarioActual(null);
            setFormData({
              nombre: '',
              email: '',
              password: '',
              rol: '',
              activo: true
            });
            setModalAbierto(true);
          }}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Empleado
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-6 py-4 whitespace-nowrap">{usuario.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{usuario.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    usuario.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    usuario.rol === 'VENDEDOR' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button
                    onClick={() => toggleEstado(usuario)}
                    variant={usuario.activo ? 'default' : 'destructive'}
                    size="sm"
                  >
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </Button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditar(usuario)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleEliminar(usuario.id)}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {usuarioActual ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className={formErrors.nombre ? 'border-red-500' : ''}
                />
                {formErrors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={formErrors.email ? 'border-red-500' : ''}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {usuarioActual ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={formErrors.password ? 'border-red-500' : ''}
                />
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <Select
                  value={formData.rol}
                  onValueChange={(value) => setFormData({ ...formData, rol: value })}
                  className={formErrors.rol ? 'border-red-500' : ''}
                >
                  <option value="">Seleccione un rol</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="ALMACENERO">Almacenero</option>
                </Select>
                {formErrors.rol && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.rol}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {usuarioActual ? 'Guardar Cambios' : 'Crear Empleado'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}