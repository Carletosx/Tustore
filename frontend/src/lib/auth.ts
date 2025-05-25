import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8080/api';

export interface UserRole {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  token: string;
  type: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post(`${API_URL}/auth/signin`, {
    username,
    password,
  });
  
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  return JSON.parse(userStr);
};

export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Verificar si el token ha expirado
  const token = user.token;
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const hasRole = (role: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.roles.includes(role);
};

export const isAdmin = (): boolean => {
  return hasRole('ROLE_ADMIN');
};

export const isCashier = (): boolean => {
  return hasRole('ROLE_CASHIER');
};

export const isStorekeeper = (): boolean => {
  return hasRole('ROLE_STOREKEEPER');
};