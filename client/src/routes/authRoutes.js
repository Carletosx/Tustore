import { Navigate } from 'react-router-dom';

// Mapeo de roles entre frontend y backend
export const roleMapping = {
  'admin': 'ROLE_ADMIN',
  'vendedor': 'ROLE_CASHIER',
  'almacenero': 'ROLE_STOREKEEPER'
};

// Mapeo de rutas por rol
export const roleRoutes = {
  'ROLE_ADMIN': '/dashboard',
  'ROLE_CASHIER': '/pos',
  'ROLE_STOREKEEPER': '/inventario'
};

// Función para verificar autenticación
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Función para obtener el usuario actual
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Función para verificar si el usuario tiene el rol requerido
export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  return user?.roles?.includes(requiredRole) || false;
};

// Función para manejar el inicio de sesión
export const handleLogin = async (credentials) => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        roles: data.roles
      }));
      return { success: true, data };
    } else {
      return { success: false, message: data.message || 'Error de autenticación' };
    }
  } catch (error) {
    return { success: false, message: 'Error de conexión' };
  }
};

// Función para manejar el registro
export const handleRegister = async (userData) => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: 'Registro exitoso' };
    } else {
      return { success: false, message: data.message || 'Error en el registro' };
    }
  } catch (error) {
    return { success: false, message: 'Error de conexión' };
  }
};

// Función para cerrar sesión
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};