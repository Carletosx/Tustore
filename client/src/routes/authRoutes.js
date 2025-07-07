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
  if (!token) return false;

  // Verificar si el token está próximo a expirar (menos de 1 día)
  const user = getCurrentUser();
  if (user && user.exp && (user.exp * 1000 - Date.now() < 86400000)) {
    // Intentar renovar el token silenciosamente
    refreshToken();
  }
  return true;
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

// Función para refrescar el token silenciosamente
const refreshToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch('http://localhost:8080/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      const user = getCurrentUser();
      if (user) {
        user.exp = data.exp;
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
  } catch (error) {
    console.error('Error al refrescar el token:', error);
  }
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
      // Asegurarse de que los roles estén en el formato correcto
      const formattedRoles = data.roles.map(role => role.startsWith('ROLE_') ? role : `ROLE_${role}`);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        roles: formattedRoles,
        nombreNegocio: data.nombreNegocio,
        codigoNegocio: data.codigoNegocio,
        exp: Math.floor(Date.now() / 1000) + 604800 // 7 días en segundos
      }));
      return { success: true, data: { ...data, roles: formattedRoles } };
    } else {
      return { success: false, message: data.message || 'Error de autenticación' };
    }
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
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