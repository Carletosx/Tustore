import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Toast from './Toast';
import { handleLogin, roleMapping, roleRoutes } from '../routes/authRoutes';

const Login = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const expectedRole = roleMapping[role];
    
    const result = await handleLogin(formData);

    if (result.success) {
      setToast({
        message: 'Inicio de sesión exitoso',
        type: 'success'
      });

      // Verificar si el usuario tiene el rol correcto
      if (!result.data.roles.includes(expectedRole)) {
        setToast({
          message: 'No tienes permiso para acceder como ' + getRoleTitle(),
          type: 'error'
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/'), 1500);
        return;
      }

      // Redirigir a la ruta correspondiente al rol
      setTimeout(() => {
        navigate(roleRoutes[expectedRole] || '/');
      }, 1500);
    } else {
      setToast({
        message: result.message,
        type: 'error'
      });
    }
  };

  const getRoleTitle = () => {
    switch(role) {
      case 'admin':
        return 'Administrador';
      case 'vendedor':
        return 'Vendedor';
      case 'almacenero':
        return 'Almacenero';
      default:
        return 'Usuario';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Iniciar Sesión como {getRoleTitle()}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Login;